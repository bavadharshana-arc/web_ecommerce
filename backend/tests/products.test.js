const request = require('supertest');
const app = require('../src/app');
const prisma = require('../src/database/prisma');

describe('Product Catalog & Category APIs', () => {
  let adminToken;
  let userToken;
  let testCategoryId;
  let createdProductId;

  beforeAll(async () => {
    // Login as seeded admin
    const adminLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@shopnexus.com', password: 'Admin@123456' });
    adminToken = adminLogin.body.data.token;

    // Login as customer
    const userLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'john@example.com', password: 'User@123456' });
    userToken = userLogin.body.data.token;

    // Fetch a valid category
    const catRes = await request(app).get('/api/categories');
    testCategoryId = catRes.body.data.categories[0]?.id;
  });

  afterAll(async () => {
    if (createdProductId) {
      await prisma.product.deleteMany({ where: { id: createdProductId } });
    }
    await prisma.$disconnect();
  });

  describe('GET /api/products', () => {
    it('should return paginated products catalog', async () => {
      const res = await request(app).get('/api/products?page=1&limit=6');
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.products)).toBe(true);
      expect(res.body.data.pagination).toHaveProperty('totalPages');
      expect(res.body.data.pagination).toHaveProperty('totalProducts');
    });

    it('should filter products by search query', async () => {
      const res = await request(app).get('/api/products?search=Headphones');
      expect(res.statusCode).toBe(200);
      expect(res.body.data.products.length).toBeGreaterThan(0);
      expect(res.body.data.products[0].name).toMatch(/Headphones/i);
    });

    it('should sort products by price ascending', async () => {
      const res = await request(app).get('/api/products?sort=price_asc&limit=10');
      expect(res.statusCode).toBe(200);
      const prods = res.body.data.products;
      if (prods.length > 1) {
        expect(prods[0].price).toBeLessThanOrEqual(prods[1].price);
      }
    });
  });

  describe('Admin Product Management', () => {
    const testSku = `SKU-TEST-${Date.now()}`;

    it('should reject non-admin from creating a product (403 Forbidden)', async () => {
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'Unauthorized Product',
          description: 'Testing unauthorized creation',
          price: 99.99,
          categoryId: testCategoryId,
          sku: testSku,
          stock: 10,
          imageUrl: 'https://example.com/item.jpg',
        });

      expect(res.statusCode).toBe(403);
    });

    it('should allow admin to create a new product', async () => {
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Test Gaming Headset',
          description: 'Premium surround sound headset for tests',
          price: 149.99,
          categoryId: testCategoryId,
          sku: testSku,
          stock: 25,
          imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.data.product).toHaveProperty('id');
      expect(res.body.data.product.sku).toBe(testSku);
      createdProductId = res.body.data.product.id;
    });

    it('should allow admin to update an existing product', async () => {
      const res = await request(app)
        .put(`/api/products/${createdProductId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          price: 139.99,
          stock: 30,
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.product.price).toBe(139.99);
      expect(res.body.data.product.stock).toBe(30);
    });

    it('should allow admin to delete a product', async () => {
      const res = await request(app)
        .delete(`/api/products/${createdProductId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      createdProductId = null;
    });
  });
});
