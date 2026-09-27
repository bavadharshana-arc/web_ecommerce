const { z } = require('zod');

const createProductSchema = z.object({
  name: z.string().trim().min(2, 'Product name must be at least 2 characters').max(150),
  description: z.string().trim().min(5, 'Description must be at least 5 characters'),
  price: z.coerce.number().min(0, 'Price must be greater than or equal to 0'),
  categoryId: z.string().min(1, 'Category is required'),
  sku: z.string().trim().min(2, 'SKU is required').max(50),
  stock: z.coerce.number().int('Stock must be an integer').min(0, 'Stock cannot be negative').default(0),
  imageUrl: z.string().trim().min(1, 'Image URL is required'),
  isActive: z.boolean().optional().default(true),
});

const updateProductSchema = z.object({
  name: z.string().trim().min(2).max(150).optional(),
  description: z.string().trim().min(5).optional(),
  price: z.coerce.number().min(0).optional(),
  categoryId: z.string().optional(),
  sku: z.string().trim().min(2).max(50).optional(),
  stock: z.coerce.number().int().min(0).optional(),
  imageUrl: z.string().trim().optional(),
  isActive: z.boolean().optional(),
});

const queryProductSchema = z.object({
  search: z.string().trim().optional(),
  categoryId: z.string().trim().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  inStock: z.enum(['true', 'false']).optional(),
  sort: z.enum(['newest', 'price_asc', 'price_desc', 'name_asc', 'name_desc']).optional().default('newest'),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(12),
});

const createCategorySchema = z.object({
  name: z.string().trim().min(2, 'Category name is required').max(100),
  description: z.string().trim().optional(),
  imageUrl: z.string().trim().optional(),
});

const updateCategorySchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  description: z.string().trim().optional(),
  imageUrl: z.string().trim().optional(),
});

module.exports = {
  createProductSchema,
  updateProductSchema,
  queryProductSchema,
  createCategorySchema,
  updateCategorySchema,
};
