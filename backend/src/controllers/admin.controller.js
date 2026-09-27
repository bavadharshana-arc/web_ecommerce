const prisma = require('../database/prisma');
const asyncHandler = require('../utils/asyncHandler');
const { successResponse, errorResponse } = require('../utils/apiResponse');

/**
 * @desc    Get dashboard metrics, KPIs, and charts breakdown
 * @route   GET /api/admin/dashboard
 * @access  Admin only
 */
const getDashboardStats = asyncHandler(async (req, res) => {
  const [
    totalUsers,
    totalProducts,
    totalOrders,
    pendingOrders,
    lowStockProducts,
    orders,
    categories,
    recentOrders,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.product.count(),
    prisma.order.count(),
    prisma.order.count({ where: { status: 'PENDING' } }),
    prisma.product.count({ where: { stock: { lte: 5 } } }),
    prisma.order.findMany({
      select: {
        totalAmount: true,
        status: true,
        paymentStatus: true,
        createdAt: true,
      },
    }),
    prisma.category.findMany({
      include: {
        _count: { select: { products: true } },
      },
    }),
    prisma.order.findMany({
      take: 6,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    }),
  ]);

  // Calculate total revenue from paid or confirmed orders
  const totalRevenue = orders
    .filter((o) => o.paymentStatus === 'PAID' || o.status === 'DELIVERED')
    .reduce((acc, curr) => acc + curr.totalAmount, 0);

  // Status breakdown
  const statusCounts = {
    PENDING: 0,
    CONFIRMED: 0,
    PROCESSING: 0,
    SHIPPED: 0,
    DELIVERED: 0,
    CANCELLED: 0,
  };
  orders.forEach((o) => {
    if (statusCounts[o.status] !== undefined) {
      statusCounts[o.status]++;
    }
  });

  // Category distribution
  const categoryDistribution = categories.map((c) => ({
    id: c.id,
    name: c.name,
    productCount: c._count.products,
  }));

  // Revenue by month / recent timeline points
  const recentTimeline = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const dayOrders = orders.filter((o) => o.createdAt.toISOString().split('T')[0] === dateStr);
    const dayRevenue = dayOrders
      .filter((o) => o.paymentStatus === 'PAID')
      .reduce((sum, o) => sum + o.totalAmount, 0);
    recentTimeline.push({
      date: dateStr,
      revenue: Math.round(dayRevenue * 100) / 100,
      orders: dayOrders.length,
    });
  }

  return successResponse(
    res,
    {
      kpis: {
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalOrders,
        totalProducts,
        totalUsers,
        pendingOrders,
        lowStockProducts,
      },
      statusCounts,
      categoryDistribution,
      recentTimeline,
      recentOrders: recentOrders.map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        customerName: o.user.name,
        customerEmail: o.user.email,
        totalAmount: o.totalAmount,
        status: o.status,
        paymentStatus: o.paymentStatus,
        createdAt: o.createdAt,
      })),
    },
    'Admin dashboard stats retrieved successfully'
  );
});

/**
 * @desc    Get all orders with filtering and pagination
 * @route   GET /api/admin/orders
 * @access  Admin only
 */
const getAllOrders = asyncHandler(async (req, res) => {
  const { search, status, paymentStatus, page = 1, limit = 10 } = req.query;
  const pageNum = parseInt(page, 10) || 1;
  const take = parseInt(limit, 10) || 10;
  const skip = (pageNum - 1) * take;

  const where = {};

  if (status && status !== 'ALL') {
    where.status = status;
  }

  if (paymentStatus && paymentStatus !== 'ALL') {
    where.paymentStatus = paymentStatus;
  }

  if (search && search.trim() !== '') {
    const term = search.trim();
    where.OR = [
      { orderNumber: { contains: term } },
      { user: { name: { contains: term } } },
      { user: { email: { contains: term } } },
    ];
  }

  const [totalOrders, orders] = await Promise.all([
    prisma.order.count({ where }),
    prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take,
      include: {
        user: {
          select: { id: true, name: true, email: true, phone: true },
        },
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
        shippingAddress:
          typeof o.shippingAddress === 'string' ? JSON.parse(o.shippingAddress) : o.shippingAddress,
      })),
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalOrders,
        limit: take,
      },
    },
    'Orders retrieved successfully'
  );
});

/**
 * @desc    Update order status or payment status
 * @route   PUT /api/admin/orders/:id/status
 * @access  Admin only
 */
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, paymentStatus } = req.body;

  const existingOrder = await prisma.order.findFirst({
    where: { OR: [{ id }, { orderNumber: id }] },
    include: { items: true },
  });

  if (!existingOrder) {
    return errorResponse(res, 'Order not found', 404);
  }

  // If order is being cancelled, restore product stock
  if (status === 'CANCELLED' && existingOrder.status !== 'CANCELLED') {
    await prisma.$transaction(async (tx) => {
      for (const item of existingOrder.items) {
        if (item.productId) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          });
        }
      }

      await tx.order.update({
        where: { id: existingOrder.id },
        data: {
          status: 'CANCELLED',
          paymentStatus: paymentStatus || existingOrder.paymentStatus,
        },
      });
    });
  } else {
    await prisma.order.update({
      where: { id: existingOrder.id },
      data: {
        status: status !== undefined ? status : undefined,
        paymentStatus: paymentStatus !== undefined ? paymentStatus : undefined,
      },
    });
  }

  const updatedOrder = await prisma.order.findUnique({
    where: { id: existingOrder.id },
    include: {
      user: { select: { id: true, name: true, email: true } },
      items: true,
    },
  });

  return successResponse(
    res,
    {
      order: {
        ...updatedOrder,
        shippingAddress:
          typeof updatedOrder.shippingAddress === 'string'
            ? JSON.parse(updatedOrder.shippingAddress)
            : updatedOrder.shippingAddress,
      },
    },
    'Order status updated successfully'
  );
});

/**
 * @desc    Get inventory items with low-stock warnings
 * @route   GET /api/admin/inventory
 * @access  Admin only
 */
const getInventory = asyncHandler(async (req, res) => {
  const { filter, search } = req.query;

  const where = {};

  if (filter === 'low') {
    where.stock = { gt: 0, lte: 5 };
  } else if (filter === 'out_of_stock') {
    where.stock = { equals: 0 };
  }

  if (search && search.trim() !== '') {
    const term = search.trim();
    where.OR = [{ name: { contains: term } }, { sku: { contains: term } }];
  }

  const products = await prisma.product.findMany({
    where,
    orderBy: { stock: 'asc' },
    include: {
      category: { select: { id: true, name: true } },
    },
  });

  const formatted = products.map((p) => ({
    id: p.id,
    name: p.name,
    sku: p.sku,
    price: p.price,
    stock: p.stock,
    isActive: p.isActive,
    imageUrl: p.imageUrl,
    categoryName: p.category.name,
    stockStatus: p.stock === 0 ? 'OUT_OF_STOCK' : p.stock <= 5 ? 'LOW_STOCK' : 'IN_STOCK',
  }));

  return successResponse(res, { inventory: formatted }, 'Inventory list retrieved');
});

/**
 * @desc    Quickly restock product inventory
 * @route   PATCH /api/admin/inventory/:id/stock
 * @access  Admin only
 */
const quickRestock = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { stock, incrementBy } = req.body;

  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) {
    return errorResponse(res, 'Product not found', 404);
  }

  let newStock = product.stock;
  if (stock !== undefined) {
    newStock = parseInt(stock, 10);
  } else if (incrementBy !== undefined) {
    newStock = product.stock + parseInt(incrementBy, 10);
  }

  if (newStock < 0) {
    return errorResponse(res, 'Stock cannot be negative', 400);
  }

  const updated = await prisma.product.update({
    where: { id },
    data: { stock: newStock },
  });

  return successResponse(res, { product: updated }, `Stock updated to ${newStock}`);
});

/**
 * @desc    Get registered users list
 * @route   GET /api/admin/users
 * @access  Admin only
 */
const getAllUsers = asyncHandler(async (req, res) => {
  const { search, role } = req.query;

  const where = {};
  if (role && role !== 'ALL') {
    where.role = role;
  }
  if (search && search.trim() !== '') {
    const term = search.trim();
    where.OR = [{ name: { contains: term } }, { email: { contains: term } }];
  }

  const users = await prisma.user.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      phone: true,
      isActive: true,
      createdAt: true,
      _count: {
        select: { orders: true },
      },
    },
  });

  return successResponse(res, { users }, 'Users list retrieved successfully');
});

/**
 * @desc    Get user profile with order history for admin
 * @route   GET /api/admin/users/:id
 * @access  Admin only
 */
const getUserDetails = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      phone: true,
      isActive: true,
      createdAt: true,
      orders: {
        orderBy: { createdAt: 'desc' },
        include: { items: true },
      },
    },
  });

  if (!user) {
    return errorResponse(res, 'User not found', 404);
  }

  return successResponse(res, { user }, 'User details retrieved');
});

/**
 * @desc    Update user status / role
 * @route   PUT /api/admin/users/:id/status
 * @access  Admin only
 */
const updateUserStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { isActive, role } = req.body;

  // Prevent admin from deactivating or demoting their own active session
  if (id === req.user.id) {
    if (isActive === false) {
      return errorResponse(res, 'You cannot deactivate your own admin account.', 400);
    }
    if (role && role !== 'ADMIN') {
      return errorResponse(res, 'You cannot demote your own admin account role.', 400);
    }
  }

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    return errorResponse(res, 'User not found', 404);
  }

  const updatedUser = await prisma.user.update({
    where: { id },
    data: {
      isActive: isActive !== undefined ? isActive : undefined,
      role: role !== undefined ? role : undefined,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  });

  return successResponse(res, { user: updatedUser }, 'User status updated successfully');
});

module.exports = {
  getDashboardStats,
  getAllOrders,
  updateOrderStatus,
  getInventory,
  quickRestock,
  getAllUsers,
  getUserDetails,
  updateUserStatus,
};
