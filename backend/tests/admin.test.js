const request = require('supertest');
const app = require('../src/app');
const prisma = require('../src/database/prisma');

describe('Admin Management APIs', () => {
  let adminToken;
  let userToken;

  beforeAll(async () => {
    // Admin login
    const adminLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@shopnexus.com', password: 'Admin@123456' });
    adminToken = adminLogin.body.data.token;

    // User login
    const userLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'john@example.com', password: 'User@123456' });
    userToken = userLogin.body.data.token;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('GET /api/admin/dashboard', () => {
    it('should reject normal user with 403 Forbidden', async () => {
      const res = await request(app)
        .get('/api/admin/dashboard')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toBe(403);
    });

    it('should return complete analytics & KPI metrics for admin', async () => {
      const res = await request(app)
        .get('/api/admin/dashboard')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data).toHaveProperty('kpis');
      expect(res.body.data.kpis).toHaveProperty('totalRevenue');
      expect(res.body.data.kpis).toHaveProperty('totalOrders');
      expect(res.body.data.kpis).toHaveProperty('totalProducts');
      expect(res.body.data.kpis).toHaveProperty('totalUsers');
      expect(res.body.data).toHaveProperty('statusCounts');
      expect(res.body.data).toHaveProperty('recentOrders');
    });
  });

  describe('GET /api/admin/inventory & Restock', () => {
    it('should return inventory items with status', async () => {
      const res = await request(app)
        .get('/api/admin/inventory')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body.data.inventory)).toBe(true);
      expect(res.body.data.inventory[0]).toHaveProperty('stockStatus');
    });

    it('should allow admin to quickly restock a product', async () => {
      const prods = await request(app).get('/api/products?limit=1');
      const targetProd = prods.body.data.products[0];

      const res = await request(app)
        .patch(`/api/admin/inventory/${targetProd.id}/stock`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ incrementBy: 10 });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.product.stock).toBe(targetProd.stock + 10);
    });
  });

  describe('GET /api/admin/users', () => {
    it('should return list of registered users', async () => {
      const res = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body.data.users)).toBe(true);
      expect(res.body.data.users.length).toBeGreaterThan(0);
      // Ensure no password hashes are exposed
      expect(res.body.data.users[0]).not.toHaveProperty('passwordHash');
    });
  });
});
