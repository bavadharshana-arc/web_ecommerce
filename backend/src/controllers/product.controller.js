const prisma = require('../database/prisma');
const asyncHandler = require('../utils/asyncHandler');
const { successResponse, errorResponse } = require('../utils/apiResponse');

const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

/**
 * @desc    Get paginated product catalog with search, filter, and sort
 * @route   GET /api/products
 * @access  Public
 */
const getProducts = asyncHandler(async (req, res) => {
  const {
    search,
    categoryId,
    minPrice,
    maxPrice,
    inStock,
    sort = 'newest',
    page = 1,
    limit = 12,
  } = req.query;

  const pageNum = parseInt(page, 10) || 1;
  const take = parseInt(limit, 10) || 12;
  const skip = (pageNum - 1) * take;

  // Build filter where clause
  const where = {
    isActive: true,
  };

  // Search keyword in name, description, or SKU
  if (search && search.trim() !== '') {
    const term = search.trim();
    where.OR = [
      { name: { contains: term } },
      { description: { contains: term } },
      { sku: { contains: term } },
    ];
  }

  // Filter by category ID or slug
  if (categoryId && categoryId !== 'all') {
    where.OR = where.OR
      ? where.OR
      : undefined;
    where.category = {
      OR: [
        { id: categoryId },
        { slug: categoryId },
      ],
    };
  }

  // Price range filter
  if (minPrice !== undefined || maxPrice !== undefined) {
    where.price = {};
    if (minPrice !== undefined && !isNaN(Number(minPrice))) {
      where.price.gte = Number(minPrice);
    }
    if (maxPrice !== undefined && !isNaN(Number(maxPrice))) {
      where.price.lte = Number(maxPrice);
    }
  }

  // In stock filter
  if (inStock === 'true') {
    where.stock = { gt: 0 };
  }

  // Sorting
  let orderBy = { createdAt: 'desc' };
  if (sort === 'price_asc') {
    orderBy = { price: 'asc' };
  } else if (sort === 'price_desc') {
    orderBy = { price: 'desc' };
  } else if (sort === 'name_asc') {
    orderBy = { name: 'asc' };
  } else if (sort === 'name_desc') {
    orderBy = { name: 'desc' };
  } else if (sort === 'newest') {
    orderBy = { createdAt: 'desc' };
  }

  const [totalProducts, products] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      orderBy,
      skip,
      take,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    }),
  ]);

  const totalPages = Math.ceil(totalProducts / take) || 1;

  return successResponse(
    res,
    {
      products,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalProducts,
        limit: take,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1,
      },
    },
    'Products retrieved successfully'
  );
});

/**
 * @desc    Get featured & trending products for homepage
 * @route   GET /api/products/featured
 * @access  Public
 */
const getFeaturedProducts = asyncHandler(async (req, res) => {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    orderBy: { stock: 'desc' },
    take: 8,
    include: {
      category: {
        select: { id: true, name: true, slug: true },
      },
    },
  });

  return successResponse(res, { products }, 'Featured products retrieved successfully');
});

/**
 * @desc    Get single product by ID or slug
 * @route   GET /api/products/:id
 * @access  Public
 */
const getProductById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const product = await prisma.product.findFirst({
    where: {
      OR: [{ id }, { slug: id }],
      isActive: true,
    },
    include: {
      category: true,
    },
  });

  if (!product) {
    return errorResponse(res, 'Product not found', 404);
  }

  return successResponse(res, { product }, 'Product details retrieved successfully');
});

/**
 * @desc    Create a new product
 * @route   POST /api/products
 * @access  Admin only
 */
const createProduct = asyncHandler(async (req, res) => {
  const { name, description, price, categoryId, sku, stock, imageUrl, isActive } = req.body;

  // Verify category exists
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
  });

  if (!category) {
    return errorResponse(res, 'Category does not exist', 400);
  }

  // Check SKU uniqueness
  const existingSku = await prisma.product.findUnique({
    where: { sku: sku.trim().toUpperCase() },
  });

  if (existingSku) {
    return errorResponse(res, `A product with SKU "${sku}" already exists.`, 409);
  }

  // Create unique slug
  let baseSlug = slugify(name);
  let slug = baseSlug;
  let counter = 1;
  while (await prisma.product.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  const product = await prisma.product.create({
    data: {
      name,
      slug,
      description,
      price: parseFloat(price),
      categoryId,
      sku: sku.trim().toUpperCase(),
      stock: parseInt(stock, 10) || 0,
      imageUrl,
      isActive: isActive !== undefined ? isActive : true,
    },
    include: {
      category: true,
    },
  });

  return successResponse(res, { product }, 'Product created successfully', 201);
});

/**
 * @desc    Update a product
 * @route   PUT /api/products/:id
 * @access  Admin only
 */
const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, description, price, categoryId, sku, stock, imageUrl, isActive } = req.body;

  const existingProduct = await prisma.product.findUnique({
    where: { id },
  });

  if (!existingProduct) {
    return errorResponse(res, 'Product not found', 404);
  }

  if (categoryId) {
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });
    if (!category) {
      return errorResponse(res, 'Category does not exist', 400);
    }
  }

  if (sku && sku.trim().toUpperCase() !== existingProduct.sku) {
    const skuTaken = await prisma.product.findUnique({
      where: { sku: sku.trim().toUpperCase() },
    });
    if (skuTaken) {
      return errorResponse(res, `A product with SKU "${sku}" already exists.`, 409);
    }
  }

  let slug = undefined;
  if (name && name !== existingProduct.name) {
    let baseSlug = slugify(name);
    slug = baseSlug;
    let counter = 1;
    while (await prisma.product.findFirst({ where: { slug, NOT: { id } } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
  }

  const updatedProduct = await prisma.product.update({
    where: { id },
    data: {
      name: name !== undefined ? name : undefined,
      slug,
      description: description !== undefined ? description : undefined,
      price: price !== undefined ? parseFloat(price) : undefined,
      categoryId: categoryId !== undefined ? categoryId : undefined,
      sku: sku !== undefined ? sku.trim().toUpperCase() : undefined,
      stock: stock !== undefined ? parseInt(stock, 10) : undefined,
      imageUrl: imageUrl !== undefined ? imageUrl : undefined,
      isActive: isActive !== undefined ? isActive : undefined,
    },
    include: {
      category: true,
    },
  });

  return successResponse(res, { product: updatedProduct }, 'Product updated successfully');
});

/**
 * @desc    Delete a product
 * @route   DELETE /api/products/:id
 * @access  Admin only
 */
const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const existing = await prisma.product.findUnique({
    where: { id },
  });

  if (!existing) {
    return errorResponse(res, 'Product not found', 404);
  }

  await prisma.product.delete({
    where: { id },
  });

  return successResponse(res, null, 'Product deleted successfully');
});

module.exports = {
  getProducts,
  getFeaturedProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
