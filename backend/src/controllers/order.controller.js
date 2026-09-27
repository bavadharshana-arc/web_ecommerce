const prisma = require('../database/prisma');
const asyncHandler = require('../utils/asyncHandler');
const { successResponse, errorResponse } = require('../utils/apiResponse');

/**
 * Generate human-readable order tracking number (e.g. ORD-2026-4891)
 */
const generateOrderNumber = () => {
  const year = new Date().getFullYear();
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const timeSuffix = Date.now().toString().slice(-4);
  return `ORD-${year}-${randomSuffix}-${timeSuffix}`;
};

/**
 * @desc    Create and place a new order via transactional checkout
 * @route   POST /api/orders
 * @access  Private (User)
 */
const createOrder = asyncHandler(async (req, res) => {
  const { shippingAddress, paymentMethod = 'CARD', items: directItems } = req.body;

  // Execute order creation within an atomic database transaction
  const result = await prisma.$transaction(async (tx) => {
    let orderItemsToProcess = [];

    // 1. Determine items to process: from explicit payload or active user cart
    if (directItems && Array.isArray(directItems) && directItems.length > 0) {
      orderItemsToProcess = directItems;
    } else {
      const cart = await tx.cart.findUnique({
        where: { userId: req.user.id },
        include: { items: true },
      });

      if (!cart || cart.items.length === 0) {
        throw { statusCode: 400, message: 'Your shopping cart is empty. Add products before checking out.' };
      }

      orderItemsToProcess = cart.items.map((i) => ({
        productId: i.productId,
        quantity: i.quantity,
      }));
    }

    // 2. Fetch fresh product details and verify stock & active status
    let calculatedSubtotal = 0;
    const processedOrderItems = [];

    for (const item of orderItemsToProcess) {
      const product = await tx.product.findUnique({
        where: { id: item.productId },
      });

      if (!product || !product.isActive) {
        throw {
          statusCode: 400,
          message: `Product "${product ? product.name : 'Unknown'}" is no longer available.`,
        };
      }

      if (product.stock < item.quantity) {
        throw {
          statusCode: 400,
          message: `Insufficient inventory for "${product.name}". Requested: ${item.quantity}, Available: ${product.stock}.`,
        };
      }

      // Decrement product inventory
      await tx.product.update({
        where: { id: product.id },
        data: {
          stock: { decrement: item.quantity },
        },
      });

      const lineSubtotal = Math.round(product.price * item.quantity * 100) / 100;
      calculatedSubtotal += lineSubtotal;

      // Store immutable snapshot in order item
      processedOrderItems.push({
        productId: product.id,
        productName: product.name,
        productSku: product.sku,
        productImage: product.imageUrl,
        quantity: item.quantity,
        unitPrice: product.price,
        subtotal: lineSubtotal,
      });
    }

    // 3. Server-side authoritative pricing calculations
    calculatedSubtotal = Math.round(calculatedSubtotal * 100) / 100;
    const shippingFee = calculatedSubtotal >= 100 ? 0.0 : 15.0;
    const tax = Math.round(calculatedSubtotal * 0.08 * 100) / 100;
    const totalAmount = Math.round((calculatedSubtotal + shippingFee + tax) * 100) / 100;

    // 4. Create Order record
    const orderNumber = generateOrderNumber();
    const order = await tx.order.create({
      data: {
        orderNumber,
        userId: req.user.id,
        subtotal: calculatedSubtotal,
        shippingFee,
        tax,
        totalAmount,
        status: 'CONFIRMED',
        paymentStatus: paymentMethod === 'COD' ? 'PENDING' : 'PAID',
        paymentMethod,
        shippingAddress: typeof shippingAddress === 'string' ? shippingAddress : JSON.stringify(shippingAddress),
        items: {
          create: processedOrderItems,
        },
      },
      include: {
        items: true,
      },
    });

    // 5. Clear the user's cart if ordered from cart
    const userCart = await tx.cart.findUnique({
      where: { userId: req.user.id },
    });
    if (userCart) {
      await tx.cartItem.deleteMany({
        where: { cartId: userCart.id },
      });
    }

    return order;
  });

  return successResponse(res, { order: result }, 'Order placed successfully', 201);
});

/**
 * @desc    Get logged in user's order history
 * @route   GET /api/orders
 * @access  Private (User)
 */
const getUserOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const pageNum = parseInt(page, 10) || 1;
  const take = parseInt(limit, 10) || 10;
  const skip = (pageNum - 1) * take;

  const where = { userId: req.user.id };

  const [totalOrders, orders] = await Promise.all([
    prisma.order.count({ where }),
    prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take,
      include: {
        items: true,
      },
    }),
  ]);

  const totalPages = Math.ceil(totalOrders / take) || 1;

  return successResponse(
    res,
    {
      orders: orders.map((o) => ({
        ...o,
        shippingAddress: typeof o.shippingAddress === 'string' ? JSON.parse(o.shippingAddress) : o.shippingAddress,
      })),
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalOrders,
        limit: take,
      },
    },
    'User orders retrieved successfully'
  );
});

/**
 * @desc    Get order details by ID
 * @route   GET /api/orders/:id
 * @access  Private (User / Admin)
 */
const getOrderById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const order = await prisma.order.findFirst({
    where: {
      OR: [{ id }, { orderNumber: id }],
    },
    include: {
      items: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
    },
  });

  if (!order) {
    return errorResponse(res, 'Order not found', 404);
  }

  // Authorization check: User can only access their own order unless they are an ADMIN
  if (req.user.role !== 'ADMIN' && order.userId !== req.user.id) {
    return errorResponse(res, 'Access denied. You do not have permission to view this order.', 403);
  }

  const formattedOrder = {
    ...order,
    shippingAddress:
      typeof order.shippingAddress === 'string' ? JSON.parse(order.shippingAddress) : order.shippingAddress,
  };

  return successResponse(res, { order: formattedOrder }, 'Order details retrieved successfully');
});

module.exports = {
  createOrder,
  getUserOrders,
  getOrderById,
};
