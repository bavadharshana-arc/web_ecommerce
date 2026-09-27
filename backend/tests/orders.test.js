const request = require('supertest');
const app = require('../src/app');
const prisma = require('../src/database/prisma');

describe('Orders & Transactional Inventory APIs', () => {
  let adminToken;
  let user1Token;
  let user2Token;
  let testProduct;
  let initialStock;
  let createdOrderId;

  beforeAll(async () => {
    // Admin
    const adminLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@shopnexus.com', password: 'Admin@123456' });
    adminToken = adminLogin.body.data.token;

    // User 1 (John)
    const user1Login = await request(app)
      .post('/api/auth/login')
      .send({ email: 'john@example.com', password: 'User@123456' });
    user1Token = user1Login.body.data.token;

    // User 2 (Jane)
    const user2Login = await request(app)
      .post('/api/auth/login')
      .send({ email: 'jane@example.com', password: 'User@123456' });
    user2Token = user2Login.body.data.token;

    // Get an in-stock product
    const prods = await request(app).get('/api/products?inStock=true&limit=1');
    testProduct = prods.body.data.products[0];
    initialStock = testProduct.stock;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  const validShippingAddress = {
    fullName: 'John Doe',
    address: '123 Tech Boulevard',
    city: 'San Jose',
    state: 'CA',
    postalCode: '95113',
    country: 'United States',
    phone: '+1 555-456-7890',
  };

  it('should successfully place an order and decrement stock atomically', async () => {
    const orderQuantity = 2;

    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        shippingAddress: validShippingAddress,
        paymentMethod: 'CARD',
        items: [{ productId: testProduct.id, quantity: orderQuantity }],
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.order).toHaveProperty('id');
    expect(res.body.data.order.items.length).toBe(1);
    expect(res.body.data.order.items[0].productName).toBe(testProduct.name);
    createdOrderId = res.body.data.order.id;

    // Verify stock was decremented in database
    const freshProduct = await prisma.product.findUnique({ where: { id: testProduct.id } });
    expect(freshProduct.stock).toBe(initialStock - orderQuantity);
  });

  it('should prevent placing order if requested quantity exceeds stock', async () => {
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        shippingAddress: validShippingAddress,
        paymentMethod: 'CARD',
        items: [{ productId: testProduct.id, quantity: 999999 }],
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/insufficient inventory/i);
  });

  it('should retrieve user order history', async () => {
    const res = await request(app)
      .get('/api/orders')
      .set('Authorization', `Bearer ${user1Token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.data.orders)).toBe(true);
    expect(res.body.data.orders.length).toBeGreaterThan(0);
  });

  it('should allow user to view their own order details', async () => {
    const res = await request(app)
      .get(`/api/orders/${createdOrderId}`)
      .set('Authorization', `Bearer ${user1Token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.order.id).toBe(createdOrderId);
  });

  it("should REJECT User 2 from viewing User 1's order with 403 Forbidden", async () => {
    const res = await request(app)
      .get(`/api/orders/${createdOrderId}`)
      .set('Authorization', `Bearer ${user2Token}`);

    expect(res.statusCode).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/access denied/i);
  });

  it('should allow ADMIN to view any order', async () => {
    const res = await request(app)
      .get(`/api/orders/${createdOrderId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.order.id).toBe(createdOrderId);
  });

  it('should allow ADMIN to update order status', async () => {
    const res = await request(app)
      .put(`/api/admin/orders/${createdOrderId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        status: 'SHIPPED',
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.order.status).toBe('SHIPPED');
  });
});
