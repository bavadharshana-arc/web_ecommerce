const { z } = require('zod');

const shippingAddressSchema = z.object({
  fullName: z.string().trim().min(2, 'Full name is required'),
  address: z.string().trim().min(5, 'Address is required'),
  city: z.string().trim().min(2, 'City is required'),
  state: z.string().trim().min(2, 'State is required'),
  postalCode: z.string().trim().min(3, 'Postal code is required'),
  country: z.string().trim().min(2, 'Country is required'),
  phone: z.string().trim().min(5, 'Valid phone number is required'),
});

const createOrderSchema = z.object({
  shippingAddress: shippingAddressSchema,
  paymentMethod: z.enum(['CARD', 'UPI', 'COD']).default('CARD'),
  // Optional direct checkout items
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().min(1),
      })
    )
    .optional(),
});

const updateOrderStatusSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']).optional(),
  paymentStatus: z.enum(['PENDING', 'PAID', 'FAILED']).optional(),
});

module.exports = {
  createOrderSchema,
  updateOrderStatusSchema,
};
