const request = require('supertest');
const app = require('../src/app');
const prisma = require('../src/database/prisma');

describe('Shopping Cart APIs', () => {
  let userToken;
  let sampleProduct;
  let cartItemId;

  beforeAll(async () => {
    // Login as customer
    const userLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'john@example.com', password: 'User@123456' });
    userToken = userLogin.body.data.token;

    // Get a product with healthy stock
    const prods = await request(app).get('/api/products?limit=1');
    sampleProduct = prods.body.data.products[0];

    // Clear cart before tests
    await request(app).delete('/api/cart').set('Authorization', `Bearer ${userToken}`);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should reject unauthenticated cart access (401)', async () => {
    const res = await request(app).get('/api/cart');
    expect(res.statusCode).toBe(401);
  });

  it('should add item to cart', async () => {
    const res = await request(app)
      .post('/api/cart/items')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        productId: sampleProduct.id,
        quantity: 2,
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.items.length).toBeGreaterThan(0);
    const added = res.body.data.items.find((i) => i.productId === sampleProduct.id);
    expect(added).toBeDefined();
    expect(added.quantity).toBe(2);
    cartItemId = added.id;
  });

  it('should update cart item quantity', async () => {
    const res = await request(app)
      .put(`/api/cart/items/${cartItemId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ quantity: 3 });

    expect(res.statusCode).toBe(200);
    const item = res.body.data.items.find((i) => i.id === cartItemId);
    expect(item.quantity).toBe(3);
  });

  it('should reject adding more than available stock', async () => {
    const res = await request(app)
      .post('/api/cart/items')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        productId: sampleProduct.id,
        quantity: 99999,
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/stock/i);
  });

  it('should remove an item from the cart', async () => {
    const res = await request(app)
      .delete(`/api/cart/items/${cartItemId}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.statusCode).toBe(200);
    const item = res.body.data.items.find((i) => i.id === cartItemId);
    expect(item).toBeUndefined();
  });
});
