const request = require('supertest');
const app = require('../src/app');
const prisma = require('../src/database/prisma');

describe('Auth Endpoints & Validation', () => {
  const testEmail = `testuser_${Date.now()}@example.com`;

  afterAll(async () => {
    // Cleanup created test user
    await prisma.user.deleteMany({
      where: { email: { contains: 'testuser_' } },
    });
    await prisma.$disconnect();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new customer account and return user & token', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test Customer',
          email: testEmail,
          password: 'Password@123',
          phone: '+1 555-000-1111',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('token');
      expect(res.body.data.user).toHaveProperty('id');
      expect(res.body.data.user.email).toBe(testEmail.toLowerCase());
      expect(res.body.data.user.role).toBe('USER');
      expect(res.body.data.user).not.toHaveProperty('passwordHash');
    });

    it('should reject registration with duplicate email (409 Conflict)', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Duplicate Customer',
          email: testEmail,
          password: 'Password@123',
        });

      expect(res.statusCode).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/already exists/i);
    });

    it('should reject registration with short password (400 Bad Request)', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Short Pass',
          email: `short_${Date.now()}@example.com`,
          password: '123',
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should successfully log in with valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testEmail,
          password: 'Password@123',
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('token');
      expect(res.body.data.user.email).toBe(testEmail.toLowerCase());
    });

    it('should reject login with wrong password (401 Unauthorized)', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testEmail,
          password: 'WrongPassword999',
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should reject login with non-existent email (401 Unauthorized)', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent_account_404@example.com',
          password: 'Password@123',
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return current user when authenticated with Bearer token', async () => {
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: testEmail,
          password: 'Password@123',
        });

      const token = loginRes.body.data.token;

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.user.email).toBe(testEmail.toLowerCase());
    });

    it('should reject unauthenticated request with 401', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });
});
