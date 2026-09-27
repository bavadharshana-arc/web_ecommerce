const prisma = require('../database/prisma');
const asyncHandler = require('../utils/asyncHandler');
const { successResponse, errorResponse } = require('../utils/apiResponse');

/**
 * Helper to calculate and format cart breakdown
 */
const calculateCartTotals = (items) => {
  let subtotal = 0;
  let totalItemsCount = 0;

  const sanitizedItems = items.map((item) => {
    const itemSubtotal = item.product.price * item.quantity;
    subtotal += itemSubtotal;
    totalItemsCount += item.quantity;
    return {
      id: item.id,
      productId: item.productId,
      quantity: item.quantity,
      priceAtAddition: item.priceAtAddition,
      currentPrice: item.product.price,
      subtotal: Math.round(itemSubtotal * 100) / 100,
      product: {
        id: item.product.id,
        name: item.product.name,
        slug: item.product.slug,
        price: item.product.price,
        stock: item.product.stock,
        imageUrl: item.product.imageUrl,
        sku: item.product.sku,
        isActive: item.product.isActive,
        category: item.product.category ? { id: item.product.category.id, name: item.product.category.name } : null,
      },
    };
  });

  subtotal = Math.round(subtotal * 100) / 100;
  const shippingFee = subtotal > 0 && subtotal < 100 ? 15.0 : 0.0;
  const tax = Math.round(subtotal * 0.08 * 100) / 100; // 8% estimated sales tax
  const totalAmount = Math.round((subtotal + shippingFee + tax) * 100) / 100;

  return {
    items: sanitizedItems,
    summary: {
      subtotal,
      shippingFee,
      tax,
      totalAmount,
      totalItemsCount,
      freeShippingThreshold: 100,
      qualifiesForFreeShipping: subtotal >= 100,
    },
  };
};

/**
 * @desc    Get current user's active shopping cart
 * @route   GET /api/cart
 * @access  Private (User)
 */
const getCart = asyncHandler(async (req, res) => {
  let cart = await prisma.cart.findUnique({
    where: { userId: req.user.id },
    include: {
      items: {
        include: {
          product: {
            include: {
              category: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId: req.user.id },
      include: {
        items: {
          include: {
            product: {
              include: { category: true },
            },
          },
        },
      },
    });
  }

  const result = calculateCartTotals(cart.items);

  return successResponse(
    res,
    {
      cartId: cart.id,
      items: result.items,
      summary: result.summary,
    },
    'Cart retrieved successfully'
  );
});

/**
 * @desc    Add a product to cart or increment quantity
 * @route   POST /api/cart/items
 * @access  Private (User)
 */
const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity = 1 } = req.body;
  const reqQty = parseInt(quantity, 10);

  if (reqQty <= 0) {
    return errorResponse(res, 'Quantity must be at least 1', 400);
  }

  // 1. Verify product existence, active status, and available inventory
  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!product || !product.isActive) {
    return errorResponse(res, 'Product is currently unavailable or discontinued.', 404);
  }

  if (product.stock <= 0) {
    return errorResponse(res, `"${product.name}" is currently out of stock.`, 400);
  }

  // 2. Find or create user cart
  let cart = await prisma.cart.findUnique({
    where: { userId: req.user.id },
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId: req.user.id },
    });
  }

  // 3. Check existing cart item
  const existingItem = await prisma.cartItem.findUnique({
    where: {
      cartId_productId: {
        cartId: cart.id,
        productId,
      },
    },
  });

  const totalDesiredQty = existingItem ? existingItem.quantity + reqQty : reqQty;

  if (totalDesiredQty > product.stock) {
    return errorResponse(
      res,
      `Cannot add ${reqQty} more unit(s). Only ${product.stock} unit(s) in stock (you have ${existingItem ? existingItem.quantity : 0} in cart).`,
      400
    );
  }

  // 4. Save item
  if (existingItem) {
    await prisma.cartItem.update({
      where: { id: existingItem.id },
      data: {
        quantity: totalDesiredQty,
        priceAtAddition: product.price,
      },
    });
  } else {
    await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId,
        quantity: reqQty,
        priceAtAddition: product.price,
      },
    });
  }

  // Return refreshed cart
  const updatedCart = await prisma.cart.findUnique({
    where: { id: cart.id },
    include: {
      items: {
        include: {
          product: { include: { category: true } },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  const result = calculateCartTotals(updatedCart.items);

  return successResponse(
    res,
    {
      cartId: updatedCart.id,
      items: result.items,
      summary: result.summary,
    },
    'Product added to cart',
    200
  );
});

/**
 * @desc    Update quantity of a cart item
 * @route   PUT /api/cart/items/:id
 * @access  Private (User)
 */
const updateCartItem = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;
  const newQty = parseInt(quantity, 10);

  if (newQty <= 0) {
    return errorResponse(res, 'Quantity must be at least 1', 400);
  }

  // Find item and ensure it belongs to current user
  const cartItem = await prisma.cartItem.findUnique({
    where: { id },
    include: {
      cart: true,
      product: true,
    },
  });

  if (!cartItem || cartItem.cart.userId !== req.user.id) {
    return errorResponse(res, 'Cart item not found', 404);
  }

  if (newQty > cartItem.product.stock) {
    return errorResponse(
      res,
      `Cannot update quantity to ${newQty}. Maximum available stock is ${cartItem.product.stock}.`,
      400
    );
  }

  await prisma.cartItem.update({
    where: { id },
    data: {
      quantity: newQty,
      priceAtAddition: cartItem.product.price,
    },
  });

  const updatedCart = await prisma.cart.findUnique({
    where: { id: cartItem.cartId },
    include: {
      items: {
        include: {
          product: { include: { category: true } },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  const result = calculateCartTotals(updatedCart.items);

  return successResponse(res, { items: result.items, summary: result.summary }, 'Cart item updated');
});

/**
 * @desc    Remove single item from cart
 * @route   DELETE /api/cart/items/:id
 * @access  Private (User)
 */
const removeCartItem = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const cartItem = await prisma.cartItem.findUnique({
    where: { id },
    include: { cart: true },
  });

  if (!cartItem || cartItem.cart.userId !== req.user.id) {
    return errorResponse(res, 'Cart item not found', 404);
  }

  await prisma.cartItem.delete({
    where: { id },
  });

  const updatedCart = await prisma.cart.findUnique({
    where: { id: cartItem.cartId },
    include: {
      items: {
        include: { product: { include: { category: true } } },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  const result = calculateCartTotals(updatedCart.items);

  return successResponse(res, { items: result.items, summary: result.summary }, 'Item removed from cart');
});

/**
 * @desc    Clear entire cart
 * @route   DELETE /api/cart
 * @access  Private (User)
 */
const clearCart = asyncHandler(async (req, res) => {
  const cart = await prisma.cart.findUnique({
    where: { userId: req.user.id },
  });

  if (cart) {
    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });
  }

  return successResponse(
    res,
    {
      items: [],
      summary: {
        subtotal: 0,
        shippingFee: 0,
        tax: 0,
        totalAmount: 0,
        totalItemsCount: 0,
        freeShippingThreshold: 100,
        qualifiesForFreeShipping: false,
      },
    },
    'Cart cleared successfully'
  );
});

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
};
