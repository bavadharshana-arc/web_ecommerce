const prisma = require('../database/prisma');
const asyncHandler = require('../utils/asyncHandler');
const { successResponse, errorResponse } = require('../utils/apiResponse');

/**
 * Generate URL slug from title
 */
const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, '-');
};

/**
 * @desc    Get all categories with product counts
 * @route   GET /api/categories
 * @access  Public
 */
const getCategories = asyncHandler(async (req, res) => {
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: {
        select: { products: true },
      },
    },
  });

  return successResponse(res, { categories }, 'Categories retrieved successfully');
});

/**
 * @desc    Get category by ID or slug
 * @route   GET /api/categories/:id
 * @access  Public
 */
const getCategoryById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const category = await prisma.category.findFirst({
    where: {
      OR: [{ id }, { slug: id }],
    },
    include: {
      products: {
        where: { isActive: true },
      },
    },
  });

  if (!category) {
    return errorResponse(res, 'Category not found', 404);
  }

  return successResponse(res, { category }, 'Category retrieved successfully');
});

/**
 * @desc    Create a category
 * @route   POST /api/categories
 * @access  Admin only
 */
const createCategory = asyncHandler(async (req, res) => {
  const { name, description, imageUrl } = req.body;
  const slug = slugify(name);

  const existing = await prisma.category.findFirst({
    where: {
      OR: [{ name }, { slug }],
    },
  });

  if (existing) {
    return errorResponse(res, 'A category with this name or slug already exists', 409);
  }

  const category = await prisma.category.create({
    data: {
      name,
      slug,
      description,
      imageUrl,
    },
  });

  return successResponse(res, { category }, 'Category created successfully', 201);
});

/**
 * @desc    Update a category
 * @route   PUT /api/categories/:id
 * @access  Admin only
 */
const updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, description, imageUrl } = req.body;

  const existing = await prisma.category.findUnique({ where: { id } });
  if (!existing) {
    return errorResponse(res, 'Category not found', 404);
  }

  let slug = undefined;
  if (name && name !== existing.name) {
    slug = slugify(name);
    const slugExists = await prisma.category.findFirst({
      where: { slug, NOT: { id } },
    });
    if (slugExists) {
      return errorResponse(res, 'Category with this generated slug already exists', 409);
    }
  }

  const category = await prisma.category.update({
    where: { id },
    data: {
      name: name !== undefined ? name : undefined,
      slug,
      description: description !== undefined ? description : undefined,
      imageUrl: imageUrl !== undefined ? imageUrl : undefined,
    },
  });

  return successResponse(res, { category }, 'Category updated successfully');
});

/**
 * @desc    Delete a category
 * @route   DELETE /api/categories/:id
 * @access  Admin only
 */
const deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const existing = await prisma.category.findUnique({
    where: { id },
    include: { _count: { select: { products: true } } },
  });

  if (!existing) {
    return errorResponse(res, 'Category not found', 404);
  }

  await prisma.category.delete({ where: { id } });

  return successResponse(res, null, 'Category deleted successfully');
});

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
