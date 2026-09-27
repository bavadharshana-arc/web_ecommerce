const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clean existing data in reverse relation order
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  console.log('🧹 Cleaned existing database records.');

  // 1. Create Users
  const passwordHash = await bcrypt.hash('Admin@123456', 10);
  const userPasswordHash = await bcrypt.hash('User@123456', 10);

  const admin = await prisma.user.create({
    data: {
      name: 'Eleanor Vance (Admin)',
      email: 'admin@shopnexus.com',
      passwordHash: passwordHash,
      role: 'ADMIN',
      phone: '+1 (555) 019-2834',
      isActive: true,
    },
  });

  const user1 = await prisma.user.create({
    data: {
      name: 'John Doe',
      email: 'john@example.com',
      passwordHash: userPasswordHash,
      role: 'USER',
      phone: '+1 (555) 349-8120',
      isActive: true,
    },
  });

  const user2 = await prisma.user.create({
    data: {
      name: 'Jane Smith',
      email: 'jane@example.com',
      passwordHash: userPasswordHash,
      role: 'USER',
      phone: '+1 (555) 782-9901',
      isActive: true,
    },
  });

  console.log(`👤 Created 3 users (1 Admin, 2 Customers).`);

  // 2. Create Categories
  const categoriesData = [
    {
      name: 'Electronics & Audio',
      slug: 'electronics-audio',
      description: 'Premium headphones, studio monitors, noise-canceling gear, and next-gen audio peripherals.',
      imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'Laptops & Computing',
      slug: 'laptops-computing',
      description: 'Ultra-portable laptops, mechanical keyboards, ergonomic mice, and precision desk accessories.',
      imageUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'Wearables & Smart Devices',
      slug: 'wearables-smart-devices',
      description: 'Smartwatches, fitness rings, AMOLED trackers, and interconnected IoT essentials.',
      imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'Fashion & Everyday Carry',
      slug: 'fashion-edc',
      description: 'Minimalist leather backpacks, polarized sunglasses, automatic timepieces, and travel goods.',
      imageUrl: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'Home & Ergonomics',
      slug: 'home-ergonomics',
      description: 'Aesthetic desk lamps, standing desks, pour-over coffee gear, and mindful workspace tools.',
      imageUrl: 'https://images.unsplash.com/photo-1517705008128-361805f42e86?auto=format&fit=crop&w=800&q=80',
    },
  ];

  const categories = {};
  for (const cat of categoriesData) {
    const created = await prisma.category.create({ data: cat });
    categories[cat.slug] = created;
  }
  console.log(`📁 Created ${Object.keys(categories).length} product categories.`);

  // 3. Create 20+ Realistic Products
  const productsData = [
    // Electronics & Audio
    {
      name: 'Nexus Pro Spatial Wireless Headphones',
      slug: 'nexus-pro-spatial-wireless-headphones',
      description: 'Flagship active noise-cancelling over-ear headphones featuring 40mm beryllium drivers, lossless 24-bit audio playback, and up to 45 hours of continuous battery life with quick-charging.',
      price: 349.99,
      categoryId: categories['electronics-audio'].id,
      sku: 'NEX-AUD-001',
      stock: 35,
      imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=80',
      isActive: true,
    },
    {
      name: 'AcousticPulse High-Res Studio Monitor',
      slug: 'acousticpulse-high-res-studio-monitor',
      description: 'Bi-amplified reference studio speakers engineered for true sound reproduction, custom silk dome tweeters, and room acoustic calibration controls.',
      price: 289.00,
      categoryId: categories['electronics-audio'].id,
      sku: 'NEX-AUD-002',
      stock: 14,
      imageUrl: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=1000&q=80',
      isActive: true,
    },
    {
      name: 'SonicStream USB-C Condenser Microphone',
      slug: 'sonicstream-usbc-condenser-microphone',
      description: 'Broadcast-quality cardioid condenser microphone with zero-latency headphone monitoring, integrated pop filter, and custom RGB ring gain indicator.',
      price: 129.50,
      categoryId: categories['electronics-audio'].id,
      sku: 'NEX-AUD-003',
      stock: 22,
      imageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=1000&q=80',
      isActive: true,
    },
    {
      name: 'AirGlow True Wireless Earbuds with ANC',
      slug: 'airglow-true-wireless-earbuds-anc',
      description: 'Ultra-lightweight IPX5 sweat-resistant in-ear earbuds with hybrid adaptive ANC, transparency audio mode, and inductive Qi wireless charging case.',
      price: 159.00,
      categoryId: categories['electronics-audio'].id,
      sku: 'NEX-AUD-004',
      stock: 4, // Low stock test case
      imageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=1000&q=80',
      isActive: true,
    },

    // Laptops & Computing
    {
      name: 'AeroBook Titanium Ultra 16" OLED',
      slug: 'aerobook-titanium-ultra-16-oled',
      description: 'Engineered for creators and engineers. Powered by an ultra-efficient 12-core processor, 3.2K 120Hz OLED HDR display, 32GB LPDDR5X RAM, and 1TB NVMe SSD.',
      price: 1899.00,
      categoryId: categories['laptops-computing'].id,
      sku: 'NEX-COM-101',
      stock: 12,
      imageUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=1000&q=80',
      isActive: true,
    },
    {
      name: 'KeyCraft 75% Wireless Mechanical Keyboard',
      slug: 'keycraft-75-wireless-mechanical-keyboard',
      description: 'Hot-swappable gasket-mounted tactile keyboard with PBT dye-sub keycaps, factory-lubed switches, CNC anodized aluminum chassis, and tri-mode Bluetooth/2.4G/Wired.',
      price: 169.99,
      categoryId: categories['laptops-computing'].id,
      sku: 'NEX-COM-102',
      stock: 28,
      imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=1000&q=80',
      isActive: true,
    },
    {
      name: 'ErgoGlide Precision Wireless Trackball Mouse',
      slug: 'ergoglide-precision-wireless-trackball-mouse',
      description: 'Sculpted ergonomic vertical mouse designed to reduce muscular forearm strain by 30%, featuring dual sensor connectivity, tilt scroll wheel, and USB-C fast charging.',
      price: 89.99,
      categoryId: categories['laptops-computing'].id,
      sku: 'NEX-COM-103',
      stock: 40,
      imageUrl: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=1000&q=80',
      isActive: true,
    },
    {
      name: 'HyperDrive 12-in-1 Dual 4K Thunderbolt Dock',
      slug: 'hyperdrive-12-in-1-dual-4k-thunderbolt-dock',
      description: 'Universal aluminum docking hub delivering 100W Power Delivery, dual HDMI 2.1 4K@60Hz ports, Gigabit Ethernet, SD 4.0 card reader, and 4 high-speed USB 3.2 Gen 2 ports.',
      price: 199.00,
      categoryId: categories['laptops-computing'].id,
      sku: 'NEX-COM-104',
      stock: 18,
      imageUrl: 'https://images.unsplash.com/photo-1544652478-6653e09f18a2?auto=format&fit=crop&w=1000&q=80',
      isActive: true,
    },

    // Wearables & Smart Devices
    {
      name: 'ChronoPulse Sapphire Titanium Smartwatch',
      slug: 'chronopulse-sapphire-titanium-smartwatch',
      description: 'Grade 5 aerospace titanium case with sapphire crystal glass, continuous ECG monitoring, SpO2 sensor, dual-frequency GPS tracking, and 14-day battery longevity.',
      price: 449.00,
      categoryId: categories['wearables-smart-devices'].id,
      sku: 'NEX-WEA-201',
      stock: 25,
      imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1000&q=80',
      isActive: true,
    },
    {
      name: 'AuraRing Sleep & Recovery Smart Ring',
      slug: 'auraring-sleep-recovery-smart-ring',
      description: 'Ultralight featherweight biometric titanium ring measuring skin temperature, heart rate variability (HRV), sleep staging, and readiness metrics with 7-day water resistance up to 100m.',
      price: 299.00,
      categoryId: categories['wearables-smart-devices'].id,
      sku: 'NEX-WEA-202',
      stock: 15,
      imageUrl: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1000&q=80',
      isActive: true,
    },
    {
      name: 'VisionX AR Cinematic Display Glasses',
      slug: 'visionx-ar-cinematic-display-glasses',
      description: 'Plug-and-play Micro-OLED smart glasses projecting a virtual 130-inch cinema display at 1080p 120Hz directly into your field of view for gaming, streaming, and productivity.',
      price: 399.00,
      categoryId: categories['wearables-smart-devices'].id,
      sku: 'NEX-WEA-203',
      stock: 2, // Low stock
      imageUrl: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=1000&q=80',
      isActive: true,
    },
    {
      name: 'FitTrack Core AMOLED Health Band',
      slug: 'fittrack-core-amoled-health-band',
      description: 'Sleek fitness companion offering 120+ workout modes, automatic swim tracking, all-day stress analysis, and magnetic fast-charge.',
      price: 69.99,
      categoryId: categories['wearables-smart-devices'].id,
      sku: 'NEX-WEA-204',
      stock: 50,
      imageUrl: 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?auto=format&fit=crop&w=1000&q=80',
      isActive: true,
    },

    // Fashion & Everyday Carry
    {
      name: 'Nomad Vantage Weatherproof Leather Backpack',
      slug: 'nomad-vantage-weatherproof-leather-backpack',
      description: 'Handcrafted full-grain Italian leather bonded with ballistic waterproof nylon, expandable 24L capacity, dedicated padded 16-inch laptop pocket, and hidden passport slot.',
      price: 260.00,
      categoryId: categories['fashion-edc'].id,
      sku: 'NEX-FAS-301',
      stock: 20,
      imageUrl: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1000&q=80',
      isActive: true,
    },
    {
      name: 'Kanso Minimalist RFID Blocking Wallet',
      slug: 'kanso-minimalist-rfid-blocking-wallet',
      description: 'Slimline aircraft-grade forged carbon fiber cardholder with quick-eject lever, elastic cash band, and integrated RFID skimming protection for up to 12 cards.',
      price: 75.00,
      categoryId: categories['fashion-edc'].id,
      sku: 'NEX-FAS-302',
      stock: 65,
      imageUrl: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=1000&q=80',
      isActive: true,
    },
    {
      name: 'SolRay Aviator Polarized Sunglasses',
      slug: 'solray-aviator-polarized-sunglasses',
      description: 'Classic lightweight Japanese titanium frame with polarized polycarbonate lenses offering UV400 protection and glare reduction.',
      price: 145.00,
      categoryId: categories['fashion-edc'].id,
      sku: 'NEX-FAS-303',
      stock: 30,
      imageUrl: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=1000&q=80',
      isActive: true,
    },
    {
      name: 'Apex Horizon Heritage Automatic Watch',
      slug: 'apex-horizon-heritage-automatic-watch',
      description: '24-jewel self-winding mechanical movement with skeleton dial, 41-hour power reserve, 50m water resistance, and hand-stitched horween leather strap.',
      price: 520.00,
      categoryId: categories['fashion-edc'].id,
      sku: 'NEX-FAS-304',
      stock: 8,
      imageUrl: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=1000&q=80',
      isActive: true,
    },

    // Home & Ergonomics
    {
      name: 'Lumina Balance Magnetic Desk Lamp',
      slug: 'lumina-balance-magnetic-desk-lamp',
      description: 'Award-winning anti-gravity suspended sphere light with stepless capacitive dimming, 3000K-6000K color temperature dial, and built-in 15W wireless charging base.',
      price: 119.00,
      categoryId: categories['home-ergonomics'].id,
      sku: 'NEX-HOM-401',
      stock: 30,
      imageUrl: 'https://images.unsplash.com/photo-1517705008128-361805f42e86?auto=format&fit=crop&w=1000&q=80',
      isActive: true,
    },
    {
      name: 'BaristaCraft Precision Gooseneck Kettle',
      slug: 'baristacraft-precision-gooseneck-kettle',
      description: 'PID digital temperature controller accurate to 1°F, 1200W rapid boil element, counterbalanced ergonomic handle, and built-in brew stopwatch for pour-over excellence.',
      price: 149.00,
      categoryId: categories['home-ergonomics'].id,
      sku: 'NEX-HOM-402',
      stock: 16,
      imageUrl: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=1000&q=80',
      isActive: true,
    },
    {
      name: 'AromaZen Ultrasonic Ceramic Diffuser',
      slug: 'aromazen-ultrasonic-ceramic-diffuser',
      description: 'Matte ceramic stoneware shell, 500ml water capacity with whisper-quiet ultrasonic atomization, warm ambient candlelight mode, and auto shut-off protection.',
      price: 65.00,
      categoryId: categories['home-ergonomics'].id,
      sku: 'NEX-HOM-403',
      stock: 45,
      imageUrl: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=1000&q=80',
      isActive: true,
    },
    {
      name: 'TimberFlow Solid Walnut Dual Monitor Riser',
      slug: 'timberflow-solid-walnut-dual-monitor-riser',
      description: 'Sustainably harvested North American solid walnut timber shelf with aerospace aluminum legs and cork pads, raising dual monitors to eye level for optimal posture.',
      price: 175.00,
      categoryId: categories['home-ergonomics'].id,
      sku: 'NEX-HOM-404',
      stock: 0, // Out of stock test case
      imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=1000&q=80',
      isActive: true,
    },
  ];

  const createdProducts = [];
  for (const prod of productsData) {
    const created = await prisma.product.create({ data: prod });
    createdProducts.push(created);
  }
  console.log(`📦 Created ${createdProducts.length} high-fidelity products.`);

  // 4. Create Active Cart for user1 with initial items
  const user1Cart = await prisma.cart.create({
    data: {
      userId: user1.id,
      items: {
        create: [
          {
            productId: createdProducts[0].id,
            quantity: 1,
            priceAtAddition: createdProducts[0].price,
          },
          {
            productId: createdProducts[5].id,
            quantity: 2,
            priceAtAddition: createdProducts[5].price,
          },
        ],
      },
    },
  });
  console.log(`🛒 Created active shopping cart for user (${user1.name}).`);

  // 5. Create Sample Historical Orders
  const sampleAddress = JSON.stringify({
    fullName: 'John Doe',
    address: '742 Evergreen Terrace',
    city: 'Springfield',
    state: 'OR',
    postalCode: '97477',
    country: 'United States',
    phone: '+1 (555) 349-8120',
  });

  const sampleAddress2 = JSON.stringify({
    fullName: 'Jane Smith',
    address: '100 Innovation Way, Suite 400',
    city: 'San Francisco',
    state: 'CA',
    postalCode: '94105',
    country: 'United States',
    phone: '+1 (555) 782-9901',
  });

  // Order 1: Delivered
  const p1 = createdProducts[0]; // 349.99
  const p6 = createdProducts[6]; // 89.99
  const sub1 = p1.price * 1 + p6.price * 1;
  const ship1 = 0.0;
  const tax1 = Math.round(sub1 * 0.08 * 100) / 100;
  const total1 = Math.round((sub1 + ship1 + tax1) * 100) / 100;

  await prisma.order.create({
    data: {
      orderNumber: 'ORD-2026-8801',
      userId: user1.id,
      subtotal: sub1,
      shippingFee: ship1,
      tax: tax1,
      totalAmount: total1,
      status: 'DELIVERED',
      paymentStatus: 'PAID',
      paymentMethod: 'CARD',
      shippingAddress: sampleAddress,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), // 7 days ago
      items: {
        create: [
          {
            productId: p1.id,
            productName: p1.name,
            productSku: p1.sku,
            productImage: p1.imageUrl,
            quantity: 1,
            unitPrice: p1.price,
            subtotal: p1.price,
          },
          {
            productId: p6.id,
            productName: p6.name,
            productSku: p6.sku,
            productImage: p6.imageUrl,
            quantity: 1,
            unitPrice: p6.price,
            subtotal: p6.price,
          },
        ],
      },
    },
  });

  // Order 2: Shipped
  const p8 = createdProducts[8]; // 449.00
  const sub2 = p8.price * 1;
  const tax2 = Math.round(sub2 * 0.08 * 100) / 100;
  const total2 = Math.round((sub2 + tax2) * 100) / 100;

  await prisma.order.create({
    data: {
      orderNumber: 'ORD-2026-8802',
      userId: user1.id,
      subtotal: sub2,
      shippingFee: 0,
      tax: tax2,
      totalAmount: total2,
      status: 'SHIPPED',
      paymentStatus: 'PAID',
      paymentMethod: 'UPI',
      shippingAddress: sampleAddress,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
      items: {
        create: [
          {
            productId: p8.id,
            productName: p8.name,
            productSku: p8.sku,
            productImage: p8.imageUrl,
            quantity: 1,
            unitPrice: p8.price,
            subtotal: p8.price,
          },
        ],
      },
    },
  });

  // Order 3: Processing (Jane)
  const p12 = createdProducts[12]; // 260.00
  const sub3 = p12.price * 1;
  const tax3 = Math.round(sub3 * 0.08 * 100) / 100;
  const total3 = Math.round((sub3 + tax3) * 100) / 100;

  await prisma.order.create({
    data: {
      orderNumber: 'ORD-2026-8803',
      userId: user2.id,
      subtotal: sub3,
      shippingFee: 0,
      tax: tax3,
      totalAmount: total3,
      status: 'PROCESSING',
      paymentStatus: 'PAID',
      paymentMethod: 'CARD',
      shippingAddress: sampleAddress2,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
      items: {
        create: [
          {
            productId: p12.id,
            productName: p12.name,
            productSku: p12.sku,
            productImage: p12.imageUrl,
            quantity: 1,
            unitPrice: p12.price,
            subtotal: p12.price,
          },
        ],
      },
    },
  });

  console.log(`📑 Created 3 sample historical orders with status distribution.`);
  console.log('✅ Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during database seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
