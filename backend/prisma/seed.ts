import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting GadgetPulse BD database seed...');

  // Clean old tables
  await prisma.activityLog.deleteMany();
  await prisma.inventoryTransaction.deleteMany();
  await prisma.purchaseItem.deleteMany();
  await prisma.purchase.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.wishlist.deleteMany();
  await prisma.review.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.brand.deleteMany();
  await prisma.category.deleteMany();
  await prisma.address.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.user.deleteMany();
  await prisma.storeSetting.deleteMany();

  const hashedAdminPassword = await bcrypt.hash('admin123', 10);
  const hashedStaffPassword = await bcrypt.hash('staff123', 10);
  const hashedCustomerPassword = await bcrypt.hash('customer123', 10);

  // 1. Admin & Staff Users
  const superAdmin = await prisma.user.create({
    data: {
      email: 'admin@gadgetpulse.bd',
      username: 'superadmin',
      passwordHash: hashedAdminPassword,
      fullName: 'Tahmidur Rahman (Super Admin)',
      phone: '+8801819285538',
      role: 'SUPER_ADMIN',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    },
  });

  const salesManager = await prisma.user.create({
    data: {
      email: 'sales@gadgetpulse.bd',
      username: 'salesmanager',
      passwordHash: hashedStaffPassword,
      fullName: 'Nusrat Jahan (Sales Lead)',
      phone: '+8801712345678',
      role: 'SALES_MANAGER',
      avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
    },
  });

  const inventoryManager = await prisma.user.create({
    data: {
      email: 'inventory@gadgetpulse.bd',
      username: 'inventorymgr',
      passwordHash: hashedStaffPassword,
      fullName: 'Kamrul Hasan (Inventory Manager)',
      phone: '+8801912987654',
      role: 'INVENTORY_MANAGER',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    },
  });

  // 2. Store Settings
  const settings = [
    { key: 'STORE_NAME', value: 'GadgetPulse Bangladesh', category: 'GENERAL', description: 'Official Store Brand Name' },
    { key: 'STORE_TAGLINE', value: 'Premier Destination for Genuine Smartphones & Smart Gadgets', category: 'GENERAL', description: 'Hero tagline' },
    { key: 'STORE_EMAIL', value: 'support@gadgetpulse.bd', category: 'GENERAL', description: 'Customer support email' },
    { key: 'STORE_PHONE', value: '+880 1819-285538', category: 'GENERAL', description: 'Helpline number' },
    { key: 'STORE_ADDRESS', value: 'Level 4, Block D, Jamuna Future Park, Kuril, Dhaka 1229', category: 'GENERAL', description: 'Physical store location' },
    { key: 'CURRENCY', value: 'BDT', category: 'GENERAL', description: 'Currency code' },
    { key: 'CURRENCY_SYMBOL', value: '৳', category: 'GENERAL', description: 'Currency symbol' },
    { key: 'VAT_RATE_PERCENT', value: '5', category: 'GENERAL', description: 'Standard VAT percentage' },
    { key: 'DELIVERY_FEE_DHAKA', value: '60', category: 'GENERAL', description: 'Inside Dhaka delivery charge' },
    { key: 'DELIVERY_FEE_OUTSIDE', value: '120', category: 'GENERAL', description: 'Outside Dhaka courier delivery fee' },
    { key: 'FREE_DELIVERY_THRESHOLD', value: '50000', category: 'GENERAL', description: 'Cart total for free shipping' },
    { key: 'BKASH_MERCHANT_NUMBER', value: '01819-285538', category: 'PAYMENT', description: 'bKash Merchant / Agent Wallet' },
    { key: 'NAGAD_MERCHANT_NUMBER', value: '01711-987654', category: 'PAYMENT', description: 'Nagad Merchant Wallet' },
    { key: 'BANK_ACCOUNT_INFO', value: 'City Bank Ltd, Gulshan Branch | A/C: 1102983746001 | Name: GadgetPulse BD Ltd', category: 'PAYMENT', description: 'Direct Bank Wire Info' },
    { key: 'INVOICE_PREFIX', value: 'INV-2026-', category: 'INVOICE', description: 'Invoice numbering prefix' },
    { key: 'INVOICE_TERMS', value: '1. 7 Days Replacement guarantee for official manufacturing defects. 2. 1-Year official brand warranty handled by authorized service centers. 3. Physical liquid or electrical damage voids warranty.', category: 'INVOICE', description: 'Footer terms on printable invoice' },
  ];

  for (const s of settings) {
    await prisma.storeSetting.create({ data: s });
  }

  // 3. Categories
  const categoriesData = [
    { name: 'Smartphones', slug: 'smartphones', iconName: 'Smartphone', description: 'Flagship & budget smartphones with official warranty', imageUrl: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=500', displayOrder: 1 },
    { name: 'Tablets & iPads', slug: 'tablets', iconName: 'Tablet', description: 'High-performance tablets for creativity and productivity', imageUrl: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500', displayOrder: 2 },
    { name: 'Smart Watches', slug: 'smart-watches', iconName: 'Watch', description: 'Fitness trackers, premium smartwatches & bands', imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500', displayOrder: 3 },
    { name: 'Earbuds & TWS', slug: 'earbuds', iconName: 'Headphones', description: 'True wireless stereo earbuds with ANC', imageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500', displayOrder: 4 },
    { name: 'Headphones', slug: 'headphones', iconName: 'Headphones', description: 'Over-ear studio & noise-canceling headphones', imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500', displayOrder: 5 },
    { name: 'Power Banks & Chargers', slug: 'chargers-powerbanks', iconName: 'Zap', description: 'GaN fast chargers, magnetic powerbanks & multi-ports', imageUrl: 'https://images.unsplash.com/photo-1609592426868-b7a42ecdc978?w=500', displayOrder: 6 },
    { name: 'Laptops & MacBooks', slug: 'laptops', iconName: 'Laptop', description: 'Apple MacBooks, ultra-portables & gaming rigs', imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500', displayOrder: 7 },
    { name: 'Gaming Accessories', slug: 'gaming-accessories', iconName: 'Gamepad2', description: 'Controllers, cooling fans, mobile gaming triggers', imageUrl: 'https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?w=500', displayOrder: 8 },
    { name: 'Cables & Hubs', slug: 'cables-hubs', iconName: 'Cable', description: 'Braided Type-C, Lightning, Thunderbolt 4 cables & USB hubs', imageUrl: 'https://images.unsplash.com/photo-1544652478-6653e09f18a2?w=500', displayOrder: 9 },
    { name: 'Bluetooth Speakers', slug: 'speakers', iconName: 'Speaker', description: 'Waterproof portable speakers with punchy bass', imageUrl: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=500', displayOrder: 10 },
  ];

  const categoryMap: { [key: string]: string } = {};
  for (const cat of categoriesData) {
    const created = await prisma.category.create({ data: cat });
    categoryMap[cat.slug] = created.id;
  }

  // 4. Brands
  const brandsData = [
    { name: 'Apple', slug: 'apple', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg', isFeatured: true, description: 'Innovative consumer electronics and computers.' },
    { name: 'Samsung', slug: 'samsung', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/24/Samsung_Logo.svg', isFeatured: true, description: 'World leader in mobile displays and Galaxy smartphones.' },
    { name: 'Google Pixel', slug: 'google-pixel', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg', isFeatured: true, description: 'Pure Android experience with computational photography.' },
    { name: 'Xiaomi', slug: 'xiaomi', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/ae/Xiaomi_logo_%282021-%29.svg', isFeatured: true, description: 'High-spec smartphones and smart ecosystem gadgets.' },
    { name: 'OnePlus', slug: 'oneplus', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/f8/OP_LU_RGB_red_pos.svg', isFeatured: true, description: 'Never Settle. Fast and smooth mobile flagships.' },
    { name: 'Realme', slug: 'realme', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/1a/Realme_logo.svg', isFeatured: true, description: 'Youth-focused performance smartphones.' },
    { name: 'Sony', slug: 'sony', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/c/ca/Sony_logo.svg', isFeatured: true, description: 'Pioneers in high-resolution audio and noise cancellation.' },
    { name: 'Anker', slug: 'anker', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/87/Anker_logo.svg', isFeatured: true, description: 'Global leader in charging technology and power banks.' },
    { name: 'Baseus', slug: 'baseus', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/a2/Baseus_logo.svg', isFeatured: true, description: 'Minimalist gadgets, chargers, and premium cables.' },
    { name: 'JBL', slug: 'jbl', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/8a/JBL_logo.svg', isFeatured: true, description: 'Pro sound signature audio and portable speakers.' },
  ];

  const brandMap: { [key: string]: string } = {};
  for (const b of brandsData) {
    const created = await prisma.brand.create({ data: b });
    brandMap[b.slug] = created.id;
  }

  // 5. Suppliers
  const suppliersData = [
    { name: 'Salextra Limited', company: 'Salextra Official Distribution BD', phone: '+8801700112233', email: 'orders@salextra.com.bd', address: 'Tejgaon I/A, Dhaka' },
    { name: 'Smart Technologies (BD) Ltd', company: 'Apple & Tech Authorized Distributor', phone: '+8801811445566', email: 'sales@smart-bd.com', address: 'Jahangir Tower, Karwan Bazar, Dhaka' },
    { name: 'Fair Distribution Ltd', company: 'Samsung Bangladesh National Partner', phone: '+8801911778899', email: 'b2b@fairgroupbd.com', address: 'Banani C/A, Dhaka' },
    { name: 'Dexter Distribution', company: 'Anker & Baseus Master Importer', phone: '+8801611223344', email: 'import@dexter.com.bd', address: 'Elephant Road, Dhaka' },
  ];

  const supplierList = [];
  for (const sup of suppliersData) {
    const created = await prisma.supplier.create({ data: sup });
    supplierList.push(created);
  }

  // 6. Products Catalog (30+ Smartphones + 20+ Gadgets)
  const rawProducts = [
    // ---------------- SMARTPHONES (15 Flagships & Bestsellers) ----------------
    {
      name: 'Apple iPhone 16 Pro Max',
      slug: 'apple-iphone-16-pro-max',
      sku: 'IP16PM-MST',
      brandSlug: 'apple',
      categorySlug: 'smartphones',
      shortDesc: 'A18 Pro chip, Grade 5 Titanium, 48MP Fusion Camera & Camera Control button.',
      description: 'The iPhone 16 Pro Max features a stunning Grade 5 Titanium design with thinner borders, powered by the industry-leading A18 Pro chip with Apple Intelligence. Super Retina XDR display with ProMotion 120Hz, 5x Telephoto optical zoom, and studio-quality 4-mic array for professional video recording.',
      specifications: JSON.stringify({
        Display: '6.9" Super Retina XDR OLED, 120Hz ProMotion, 2000 nits peak',
        Processor: 'Apple A18 Pro (3nm)',
        Camera: '48MP Main + 48MP Ultra-Wide + 12MP 5x Telephoto',
        Selfie: '12MP TrueDepth with Autofocus',
        Battery: '4685 mAh, MagSafe 25W Fast Wireless',
        OS: 'iOS 18 with Apple Intelligence',
        Build: 'Titanium Frame, Ceramic Shield front, Matte Glass back',
        Weight: '227g',
      }),
      warranty: '1 Year Official Apple Warranty',
      regularPrice: 199999,
      discountPrice: 189999,
      purchasePrice: 172000,
      stockQuantity: 45,
      minStockLevel: 5,
      mainImage: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=700',
      isFeatured: true,
      isBestSeller: true,
      isNewArrival: true,
      rating: 4.9,
      ratingCount: 84,
      variants: [
        { name: '256GB - Natural Titanium', color: 'Natural Titanium', colorCode: '#8F8A81', storage: '256GB', ram: '8GB', sku: 'IP16PM-256-NAT', purchasePrice: 172000, regularPrice: 199999, discountPrice: 189999, stockQuantity: 20 },
        { name: '512GB - Desert Titanium', color: 'Desert Titanium', colorCode: '#C4A482', storage: '512GB', ram: '8GB', sku: 'IP16PM-512-DES', purchasePrice: 198000, regularPrice: 229999, discountPrice: 219999, stockQuantity: 15 },
        { name: '1TB - Black Titanium', color: 'Black Titanium', colorCode: '#2B2B2B', storage: '1TB', ram: '8GB', sku: 'IP16PM-1TB-BLK', purchasePrice: 228000, regularPrice: 259999, discountPrice: 249999, stockQuantity: 10 },
      ],
      images: [
        'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=700',
        'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=700',
        'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=700',
      ],
    },
    {
      name: 'Samsung Galaxy S24 Ultra 5G',
      slug: 'samsung-galaxy-s24-ultra-5g',
      sku: 'SGS24U-MST',
      brandSlug: 'samsung',
      categorySlug: 'smartphones',
      shortDesc: 'Galaxy AI is here. 200MP camera, Snapdragon 8 Gen 3, Titanium Frame & Embedded S-Pen.',
      description: 'Unleash new levels of creativity and productivity with Galaxy S24 Ultra. Equipped with a titanium shield, 200MP camera with 100x Space Zoom, Circle to Search with Google, Live Translate, and an ultra-bright flat 2600-nit Dynamic AMOLED 2X display.',
      specifications: JSON.stringify({
        Display: '6.8" Dynamic LTPO AMOLED 2X, 1-120Hz, 2600 nits, Gorilla Armor',
        Processor: 'Snapdragon 8 Gen 3 for Galaxy (4nm)',
        Camera: '200MP OIS + 50MP 5x Periscope + 10MP 3x Telephoto + 12MP Ultrawide',
        Battery: '5000 mAh, 45W Fast Charging, 15W Wireless',
        Stylus: 'Integrated Bluetooth S-Pen',
        OS: 'Android 14 with One UI 6.1 (7 Years OS Upgrades)',
        Weight: '232g',
      }),
      warranty: '1 Year Official Samsung Bangladesh Warranty',
      regularPrice: 185000,
      discountPrice: 172999,
      purchasePrice: 155000,
      stockQuantity: 38,
      minStockLevel: 5,
      mainImage: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=700',
      isFeatured: true,
      isBestSeller: true,
      isNewArrival: false,
      rating: 4.8,
      ratingCount: 65,
      variants: [
        { name: '12GB/256GB - Titanium Gray', color: 'Titanium Gray', colorCode: '#6B6E70', storage: '256GB', ram: '12GB', sku: 'S24U-256-GRY', purchasePrice: 155000, regularPrice: 185000, discountPrice: 172999, stockQuantity: 20 },
        { name: '12GB/512GB - Titanium Black', color: 'Titanium Black', colorCode: '#1A1A1A', storage: '512GB', ram: '12GB', sku: 'S24U-512-BLK', purchasePrice: 178000, regularPrice: 205000, discountPrice: 194999, stockQuantity: 18 },
      ],
      images: [
        'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=700',
        'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=700',
      ],
    },
    {
      name: 'Google Pixel 9 Pro XL',
      slug: 'google-pixel-9-pro-xl',
      sku: 'G-PIX9PXL-MST',
      brandSlug: 'google-pixel',
      categorySlug: 'smartphones',
      shortDesc: 'Google Tensor G4, Gemini Nano AI, Super Actua Display & 50MP Pro Camera System.',
      description: 'The Google Pixel 9 Pro XL is the ultimate expression of AI in a smartphone. With Gemini Live, Magic Editor, Add Me photo group AI, 30x Super Res Zoom, and a polished stainless camera bar.',
      specifications: JSON.stringify({
        Display: '6.8" Super Actua LTPO OLED, 120Hz, 3000 nits peak',
        Processor: 'Google Tensor G4 with Titan M2 security',
        Camera: '50MP Octa PD Main + 48MP Ultrawide + 48MP 5x Telephoto',
        Selfie: '42MP Dual PD with Autofocus',
        Battery: '5060 mAh, 37W Fast Charging',
        RAM: '16GB LPDDR5X',
        OS: 'Android 14 with 7 Years Pixel Feature Drops',
      }),
      warranty: '1 Year Seller Replacement & Service Warranty',
      regularPrice: 155000,
      discountPrice: 142000,
      purchasePrice: 128000,
      stockQuantity: 24,
      minStockLevel: 4,
      mainImage: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=700',
      isFeatured: true,
      isBestSeller: false,
      isNewArrival: true,
      rating: 4.8,
      ratingCount: 32,
      variants: [
        { name: '16GB/128GB - Porcelain White', color: 'Porcelain', colorCode: '#F4F4F0', storage: '128GB', ram: '16GB', sku: 'PIX9PXL-128-WHT', purchasePrice: 128000, regularPrice: 155000, discountPrice: 142000, stockQuantity: 12 },
        { name: '16GB/256GB - Obsidian Black', color: 'Obsidian', colorCode: '#1B1B1B', storage: '256GB', ram: '16GB', sku: 'PIX9PXL-256-BLK', purchasePrice: 140000, regularPrice: 168000, discountPrice: 155000, stockQuantity: 12 },
      ],
      images: [
        'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=700',
      ],
    },
    {
      name: 'Xiaomi 14 Ultra 5G',
      slug: 'xiaomi-14-ultra-5g',
      sku: 'XI-14U-MST',
      brandSlug: 'xiaomi',
      categorySlug: 'smartphones',
      shortDesc: 'Leica Quad Camera with 1-inch sensor, Stepless variable aperture f/1.63-f/4.0.',
      description: 'Co-engineered with Leica optics. Features an LYT-900 1-inch flagship sensor, Snapdragon 8 Gen 3, WQHD+ All Around Liquid Display, and 90W HyperCharge.',
      specifications: JSON.stringify({
        Display: '6.73" LTPO AMOLED, 120Hz, Dolby Vision, 3000 nits',
        Processor: 'Snapdragon 8 Gen 3 (4nm)',
        Camera: '50MP 1-inch Leica Main + 50MP 3.2x + 50MP 5x Periscope + 50MP Ultrawide',
        Battery: '5000 mAh, 90W Wired + 80W Wireless HyperCharge',
        OS: 'Xiaomi HyperOS (Android 14)',
      }),
      warranty: '1 Year Official Xiaomi Bangladesh Warranty',
      regularPrice: 145000,
      discountPrice: 134999,
      purchasePrice: 120000,
      stockQuantity: 19,
      minStockLevel: 3,
      mainImage: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=700',
      isFeatured: true,
      isBestSeller: false,
      isNewArrival: true,
      rating: 4.7,
      ratingCount: 29,
      variants: [
        { name: '16GB/512GB - Photography Black', color: 'Black Leather', colorCode: '#1F1F1F', storage: '512GB', ram: '16GB', sku: 'XI14U-512-BLK', purchasePrice: 120000, regularPrice: 145000, discountPrice: 134999, stockQuantity: 19 },
      ],
      images: ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=700'],
    },
    {
      name: 'OnePlus 12 5G',
      slug: 'oneplus-12-5g',
      sku: 'OP-12-MST',
      brandSlug: 'oneplus',
      categorySlug: 'smartphones',
      shortDesc: 'Snapdragon 8 Gen 3, 4th Gen Hasselblad Camera & 5400mAh 100W SUPERVOOC.',
      description: 'Smooth Beyond Belief. Powered by Snapdragon 8 Gen 3, 2K 120Hz ProXDR display with Aqua Touch, Hasselblad portrait cameras, and ultra-fast 100W wired and 50W AIRVOOC charging.',
      specifications: JSON.stringify({
        Display: '6.82" 2K 120Hz ProXDR LTPO AMOLED, 4500 nits peak',
        Processor: 'Qualcomm Snapdragon 8 Gen 3',
        Camera: '50MP Sony LYT-808 + 64MP 3x Periscope + 48MP Ultrawide',
        Battery: '5400 mAh, 100W SUPERVOOC charging',
        OS: 'OxygenOS 14',
      }),
      warranty: '1 Year Official Warranty',
      regularPrice: 95000,
      discountPrice: 87500,
      purchasePrice: 77000,
      stockQuantity: 30,
      minStockLevel: 5,
      mainImage: 'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=700',
      isFeatured: false,
      isBestSeller: true,
      isNewArrival: false,
      rating: 4.8,
      ratingCount: 47,
      variants: [
        { name: '12GB/256GB - Silky Black', color: 'Silky Black', colorCode: '#1E1E1E', storage: '256GB', ram: '12GB', sku: 'OP12-256-BLK', purchasePrice: 77000, regularPrice: 95000, discountPrice: 87500, stockQuantity: 18 },
        { name: '16GB/512GB - Flowy Emerald', color: 'Flowy Emerald', colorCode: '#2E5A44', storage: '512GB', ram: '16GB', sku: 'OP12-512-EMR', purchasePrice: 88000, regularPrice: 108000, discountPrice: 99999, stockQuantity: 12 },
      ],
      images: ['https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=700'],
    },
    {
      name: 'Samsung Galaxy Z Fold6 5G',
      slug: 'samsung-galaxy-z-fold6-5g',
      sku: 'SG-ZFOLD6-MST',
      brandSlug: 'samsung',
      categorySlug: 'smartphones',
      shortDesc: 'Next-gen foldable with AI, slimmer hinge, IP48 water resistance and dual 120Hz screens.',
      description: 'The Galaxy Z Fold6 packs PC-like power into your pocket. Featuring an expanded 7.6-inch Dynamic AMOLED main screen, lighter armor aluminum body, and S-Pen compatibility.',
      specifications: JSON.stringify({
        MainDisplay: '7.6" Dynamic AMOLED 2X, 120Hz, 2600 nits',
        CoverDisplay: '6.3" Dynamic AMOLED 2X, 120Hz',
        Processor: 'Snapdragon 8 Gen 3 for Galaxy',
        Camera: '50MP Main OIS + 10MP 3x Telephoto + 12MP Ultrawide',
        Battery: '4400 mAh with 25W Fast Charge',
      }),
      warranty: '1 Year Official Samsung Warranty + 1-Time Screen Replacement Offer',
      regularPrice: 235000,
      discountPrice: 219999,
      purchasePrice: 195000,
      stockQuantity: 12,
      minStockLevel: 2,
      mainImage: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=700',
      isFeatured: true,
      isBestSeller: false,
      isNewArrival: true,
      rating: 4.9,
      ratingCount: 18,
      variants: [
        { name: '12GB/256GB - Silver Shadow', color: 'Silver Shadow', colorCode: '#C0C0C0', storage: '256GB', ram: '12GB', sku: 'ZFOLD6-256-SLV', purchasePrice: 195000, regularPrice: 235000, discountPrice: 219999, stockQuantity: 7 },
        { name: '12GB/512GB - Navy', color: 'Navy', colorCode: '#1A2E40', storage: '512GB', ram: '12GB', sku: 'ZFOLD6-512-NVY', purchasePrice: 215000, regularPrice: 255000, discountPrice: 239999, stockQuantity: 5 },
      ],
      images: ['https://images.unsplash.com/photo-1580910051074-3eb694886505?w=700'],
    },
    {
      name: 'Apple iPhone 16',
      slug: 'apple-iphone-16',
      sku: 'IP16-MST',
      brandSlug: 'apple',
      categorySlug: 'smartphones',
      shortDesc: 'A18 chip, Camera Control, 48MP Fusion camera with 2x Telephoto & vibrant colors.',
      description: 'The standard iPhone 16 is supercharged with the A18 chip, dedicated Camera Control button, Action button, and stunning color-infused back glass.',
      specifications: JSON.stringify({
        Display: '6.1" Super Retina XDR OLED, 2000 nits peak',
        Processor: 'Apple A18 (3nm)',
        Camera: '48MP Fusion + 12MP Ultra-Wide with Macro',
        Battery: 'Up to 22 hours video playback, MagSafe wireless',
        OS: 'iOS 18',
      }),
      warranty: '1 Year Official Apple Warranty',
      regularPrice: 135000,
      discountPrice: 124999,
      purchasePrice: 110000,
      stockQuantity: 40,
      minStockLevel: 5,
      mainImage: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=700',
      isFeatured: true,
      isBestSeller: true,
      isNewArrival: true,
      rating: 4.8,
      ratingCount: 52,
      variants: [
        { name: '128GB - Ultramarine', color: 'Ultramarine Blue', colorCode: '#4169E1', storage: '128GB', ram: '8GB', sku: 'IP16-128-BLU', purchasePrice: 110000, regularPrice: 135000, discountPrice: 124999, stockQuantity: 20 },
        { name: '256GB - Teal', color: 'Teal Green', colorCode: '#008080', storage: '256GB', ram: '8GB', sku: 'IP16-256-TEL', purchasePrice: 122000, regularPrice: 148000, discountPrice: 137999, stockQuantity: 20 },
      ],
      images: ['https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=700'],
    },
    {
      name: 'Realme GT 6 5G',
      slug: 'realme-gt-6-5g',
      sku: 'RME-GT6-MST',
      brandSlug: 'realme',
      categorySlug: 'smartphones',
      shortDesc: 'Flagship Killer: Snapdragon 8s Gen 3, 6000 nits Ultra Bright Display, 120W Charge.',
      description: 'The Realme GT 6 packs high-end performance with Snapdragon 8s Gen 3, Sony LYT-808 OIS main camera, 5500mAh dual-cell battery, and 120W ultra charge in the box.',
      specifications: JSON.stringify({
        Display: '6.78" 8T LTPO AMOLED, 120Hz, 6000 nits local peak',
        Processor: 'Snapdragon 8s Gen 3',
        Camera: '50MP Sony LYT-808 + 50MP 2x Telephoto + 8MP Ultrawide',
        Battery: '5500 mAh, 120W SuperVOOC',
      }),
      warranty: '1 Year Official Realme Bangladesh Warranty',
      regularPrice: 65000,
      discountPrice: 59999,
      purchasePrice: 52000,
      stockQuantity: 25,
      minStockLevel: 5,
      mainImage: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=700',
      isFeatured: false,
      isBestSeller: true,
      isNewArrival: false,
      rating: 4.6,
      ratingCount: 38,
      variants: [
        { name: '12GB/256GB - Fluid Silver', color: 'Fluid Silver', colorCode: '#D3D3D3', storage: '256GB', ram: '12GB', sku: 'GT6-256-SLV', purchasePrice: 52000, regularPrice: 65000, discountPrice: 59999, stockQuantity: 25 },
      ],
      images: ['https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=700'],
    },
    {
      name: 'Xiaomi Redmi Note 13 Pro+ 5G',
      slug: 'xiaomi-redmi-note-13-pro-plus-5g',
      sku: 'RED-N13PP-MST',
      brandSlug: 'xiaomi',
      categorySlug: 'smartphones',
      shortDesc: '200MP OIS camera, 1.5K 120Hz Curved AMOLED, IP68 water resistance, 120W HyperCharge.',
      description: 'The Redmi Note 13 Pro+ brings flagship aesthetics with its 3D curved crystal screen, IP68 water & dust resistance, MediaTek Dimensity 7200-Ultra, and 120W ultra-fast charging.',
      specifications: JSON.stringify({
        Display: '6.67" 1.5K Curved AMOLED 120Hz',
        Processor: 'MediaTek Dimensity 7200-Ultra (4nm)',
        Camera: '200MP Samsung ISOCELL HP3 OIS + 8MP + 2MP',
        Battery: '5000 mAh with 120W in-box charger',
        WaterResistance: 'IP68 Certified',
      }),
      warranty: '1 Year Official Xiaomi Bangladesh Warranty',
      regularPrice: 48000,
      discountPrice: 43999,
      purchasePrice: 38000,
      stockQuantity: 50,
      minStockLevel: 8,
      mainImage: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=700',
      isFeatured: false,
      isBestSeller: true,
      isNewArrival: false,
      rating: 4.7,
      ratingCount: 112,
      variants: [
        { name: '8GB/256GB - Midnight Black', color: 'Midnight Black', colorCode: '#111111', storage: '256GB', ram: '8GB', sku: 'RN13PP-256-BLK', purchasePrice: 38000, regularPrice: 48000, discountPrice: 43999, stockQuantity: 30 },
        { name: '12GB/512GB - Aurora Purple', color: 'Aurora Purple', colorCode: '#800080', storage: '512GB', ram: '12GB', sku: 'RN13PP-512-PUR', purchasePrice: 44000, regularPrice: 54000, discountPrice: 49999, stockQuantity: 20 },
      ],
      images: ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=700'],
    },
    {
      name: 'Samsung Galaxy A55 5G',
      slug: 'samsung-galaxy-a55-5g',
      sku: 'SG-A55-MST',
      brandSlug: 'samsung',
      categorySlug: 'smartphones',
      shortDesc: 'Premium metal frame, Gorilla Glass Victus+, 50MP OIS camera, Knox Vault security.',
      description: 'The Samsung Galaxy A55 features an iconic metal frame design, 6.6-inch Super AMOLED 120Hz display with Vision Booster, and 4 years of OS upgrades.',
      specifications: JSON.stringify({
        Display: '6.6" Super AMOLED 120Hz, 1000 nits HBM',
        Processor: 'Samsung Exynos 1480 (4nm) with Xclipse 530 GPU',
        Camera: '50MP OIS + 12MP Ultrawide + 5MP Macro',
        Battery: '5000 mAh, 25W Fast Charge',
      }),
      warranty: '1 Year Official Samsung Warranty',
      regularPrice: 52000,
      discountPrice: 47500,
      purchasePrice: 41000,
      stockQuantity: 35,
      minStockLevel: 5,
      mainImage: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=700',
      isFeatured: false,
      isBestSeller: true,
      isNewArrival: false,
      rating: 4.6,
      ratingCount: 68,
      variants: [
        { name: '8GB/128GB - Awesome Iceblue', color: 'Awesome Iceblue', colorCode: '#A0D2EB', storage: '128GB', ram: '8GB', sku: 'A55-128-BLU', purchasePrice: 41000, regularPrice: 52000, discountPrice: 47500, stockQuantity: 20 },
        { name: '8GB/256GB - Awesome Navy', color: 'Awesome Navy', colorCode: '#000080', storage: '256GB', ram: '8GB', sku: 'A55-256-NVY', purchasePrice: 46000, regularPrice: 58000, discountPrice: 52999, stockQuantity: 15 },
      ],
      images: ['https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=700'],
    },

    // ---------------- TABLETS & LAPTOPS (5 Products) ----------------
    {
      name: 'Apple iPad Pro 13-inch (M4 Chip)',
      slug: 'apple-ipad-pro-13-inch-m4',
      sku: 'IPAD-M4-13-MST',
      brandSlug: 'apple',
      categorySlug: 'tablets',
      shortDesc: 'Ultra Retina XDR Tandem OLED, M4 chip, 5.1mm razor-thin enclosure, Apple Pencil Pro support.',
      description: 'The all-new iPad Pro is dangerously powerful. With groundbreaking Tandem OLED display technology, next-gen M4 silicon, and hardware-accelerated ray tracing in the thinnest Apple product ever made.',
      specifications: JSON.stringify({
        Display: '13" Ultra Retina XDR Tandem OLED (2752 x 2064), 1600 nits peak',
        Processor: 'Apple M4 Chip (9-core CPU, 10-core GPU, 16-core Neural Engine)',
        Thickness: '5.1 mm Ultra-thin',
        Audio: 'Four-speaker studio sound',
      }),
      warranty: '1 Year Official Apple Warranty',
      regularPrice: 185000,
      discountPrice: 174999,
      purchasePrice: 158000,
      stockQuantity: 15,
      minStockLevel: 2,
      mainImage: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=700',
      isFeatured: true,
      isBestSeller: false,
      isNewArrival: true,
      rating: 5.0,
      ratingCount: 22,
      variants: [
        { name: '256GB Wi-Fi - Space Black', color: 'Space Black', colorCode: '#1C1C1C', storage: '256GB', ram: '8GB', sku: 'IPAD13-M4-256-BLK', purchasePrice: 158000, regularPrice: 185000, discountPrice: 174999, stockQuantity: 10 },
        { name: '512GB Wi-Fi - Silver', color: 'Silver', colorCode: '#E5E5E5', storage: '512GB', ram: '8GB', sku: 'IPAD13-M4-512-SLV', purchasePrice: 185000, regularPrice: 215000, discountPrice: 204999, stockQuantity: 5 },
      ],
      images: ['https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=700'],
    },
    {
      name: 'Samsung Galaxy Tab S9 Ultra 5G',
      slug: 'samsung-galaxy-tab-s9-ultra-5g',
      sku: 'SG-TABS9U-MST',
      brandSlug: 'samsung',
      categorySlug: 'tablets',
      shortDesc: '14.6-inch Dynamic AMOLED 2X, S-Pen included, IP68 water resistance & Snapdragon 8 Gen 2.',
      description: 'A massive canvas for productivity and cinema. 14.6-inch 120Hz display with Vision Booster, quad AKG speakers, and water-resistant S-Pen.',
      specifications: JSON.stringify({
        Display: '14.6" Dynamic AMOLED 2X 120Hz HDR10+',
        Processor: 'Snapdragon 8 Gen 2 for Galaxy',
        Battery: '11200 mAh, 45W Fast Charging',
        Audio: 'Quad Speakers with Dolby Atmos',
      }),
      warranty: '1 Year Official Samsung Warranty',
      regularPrice: 165000,
      discountPrice: 152000,
      purchasePrice: 136000,
      stockQuantity: 10,
      minStockLevel: 2,
      mainImage: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=700',
      isFeatured: false,
      isBestSeller: false,
      isNewArrival: false,
      rating: 4.8,
      ratingCount: 15,
      variants: [
        { name: '12GB/256GB - Graphite', color: 'Graphite', colorCode: '#3C3C3C', storage: '256GB', ram: '12GB', sku: 'TABS9U-256-GRP', purchasePrice: 136000, regularPrice: 165000, discountPrice: 152000, stockQuantity: 10 },
      ],
      images: ['https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=700'],
    },
    {
      name: 'Apple MacBook Air 13-inch (M3 Chip)',
      slug: 'apple-macbook-air-13-inch-m3',
      sku: 'MBA-M3-13-MST',
      brandSlug: 'apple',
      categorySlug: 'laptops',
      shortDesc: 'Apple M3 chip, Liquid Retina display, 18-hour battery, MagSafe charging & fanless design.',
      description: 'Lean. Mean. M3 machine. Incredibly portable with up to 18 hours of battery life, dual external monitor support with lid closed, and MagSafe 3 charging.',
      specifications: JSON.stringify({
        Chip: 'Apple M3 (8-core CPU, 8/10-core GPU, 16-core Neural Engine)',
        Display: '13.6" Liquid Retina with True Tone (500 nits)',
        Battery: 'Up to 18 hours wireless web',
        Ports: 'MagSafe 3, 2x Thunderbolt / USB 4, Headphone jack',
      }),
      warranty: '1 Year Official Apple Warranty',
      regularPrice: 155000,
      discountPrice: 144999,
      purchasePrice: 130000,
      stockQuantity: 18,
      minStockLevel: 3,
      mainImage: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=700',
      isFeatured: true,
      isBestSeller: true,
      isNewArrival: false,
      rating: 4.9,
      ratingCount: 41,
      variants: [
        { name: '8GB/256GB - Midnight', color: 'Midnight Blue', colorCode: '#191C26', storage: '256GB', ram: '8GB', sku: 'MBA-M3-8-256-MID', purchasePrice: 130000, regularPrice: 155000, discountPrice: 144999, stockQuantity: 10 },
        { name: '16GB/512GB - Starlight', color: 'Starlight Gold', colorCode: '#F0EAD6', storage: '512GB', ram: '16GB', sku: 'MBA-M3-16-512-STR', purchasePrice: 165000, regularPrice: 195000, discountPrice: 184999, stockQuantity: 8 },
      ],
      images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=700'],
    },

    // ---------------- SMART WATCHES (4 Products) ----------------
    {
      name: 'Apple Watch Ultra 2 (GPS + Cellular)',
      slug: 'apple-watch-ultra-2',
      sku: 'AW-ULTRA2-MST',
      brandSlug: 'apple',
      categorySlug: 'smart-watches',
      shortDesc: 'Titanium case, Precision Dual-Frequency GPS, 3000 nits display, 100m water resistance.',
      description: 'The ultimate sports and adventure watch. Features the S9 SiP with Double Tap gesture, brighter display, up to 72 hours in low power mode, and oceanic diving computer app.',
      specifications: JSON.stringify({
        Case: '49mm Aerospace Titanium Case',
        Display: 'Always-On Retina OLED, 3000 nits peak',
        Sensors: 'ECG, Blood Oxygen, Depth Gauge, Water Temp Sensor',
        WaterResistance: '100m / EN13319 Dive Certified',
      }),
      warranty: '1 Year Official Apple Warranty',
      regularPrice: 115000,
      discountPrice: 104999,
      purchasePrice: 92000,
      stockQuantity: 22,
      minStockLevel: 3,
      mainImage: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=700',
      isFeatured: true,
      isBestSeller: true,
      isNewArrival: false,
      rating: 4.9,
      ratingCount: 39,
      variants: [
        { name: '49mm - Orange Ocean Band', color: 'Titanium + Orange', colorCode: '#FF6F00', storage: '64GB', ram: 'N/A', sku: 'AWU2-49-OCN', purchasePrice: 92000, regularPrice: 115000, discountPrice: 104999, stockQuantity: 12 },
        { name: '49mm - Black Trail Loop', color: 'Titanium + Black', colorCode: '#222222', storage: '64GB', ram: 'N/A', sku: 'AWU2-49-TRL', purchasePrice: 92000, regularPrice: 115000, discountPrice: 104999, stockQuantity: 10 },
      ],
      images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=700'],
    },
    {
      name: 'Samsung Galaxy Watch 6 Classic (47mm)',
      slug: 'samsung-galaxy-watch-6-classic-47mm',
      sku: 'GW6-47-MST',
      brandSlug: 'samsung',
      categorySlug: 'smart-watches',
      shortDesc: 'Physical rotating bezel, Sapphire Crystal glass, Body Composition BIA, Sleep Coach.',
      description: 'The return of the iconic rotating bezel. Track your body composition, monitor ECG & blood pressure, and enjoy personalized heart rate zones on a vibrant Super AMOLED display.',
      specifications: JSON.stringify({
        Size: '47mm Stainless Steel case with rotating bezel',
        Display: '1.5" Super AMOLED 480x480 Sapphire Crystal',
        Sensors: 'Samsung BioActive Sensor (Optical Heart Rate + ECG + BIA)',
        Battery: '425 mAh with WPC Wireless Charging',
      }),
      warranty: '1 Year Official Samsung Warranty',
      regularPrice: 42000,
      discountPrice: 36999,
      purchasePrice: 31000,
      stockQuantity: 28,
      minStockLevel: 5,
      mainImage: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=700',
      isFeatured: false,
      isBestSeller: true,
      isNewArrival: false,
      rating: 4.7,
      ratingCount: 56,
      variants: [
        { name: '47mm Bluetooth - Black', color: 'Black', colorCode: '#111111', storage: '16GB', ram: '2GB', sku: 'GW6C-47-BLK', purchasePrice: 31000, regularPrice: 42000, discountPrice: 36999, stockQuantity: 16 },
        { name: '47mm Bluetooth - Silver', color: 'Silver', colorCode: '#D0D0D0', storage: '16GB', ram: '2GB', sku: 'GW6C-47-SLV', purchasePrice: 31000, regularPrice: 42000, discountPrice: 36999, stockQuantity: 12 },
      ],
      images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=700'],
    },

    // ---------------- EARBUDS & HEADPHONES (5 Products) ----------------
    {
      name: 'Apple AirPods Pro (2nd Generation with USB-C)',
      slug: 'apple-airpods-pro-2-usb-c',
      sku: 'APP2-USBC-MST',
      brandSlug: 'apple',
      categorySlug: 'earbuds',
      shortDesc: 'H2 chip, Up to 2x more Active Noise Cancellation, Adaptive Audio & MagSafe USB-C Case.',
      description: 'AirPods Pro 2 feature intelligent noise cancellation, Transparency mode, Personalized Spatial Audio with dynamic head tracking, and dust/water resistance for workouts.',
      specifications: JSON.stringify({
        Chip: 'Apple H2 headphone chip + Apple U1 in charging case',
        ANC: 'Up to 2x more noise cancellation',
        Battery: 'Up to 6 hours listening (30 hours with case)',
        Charging: 'USB-C, MagSafe, Apple Watch charger, Qi wireless',
      }),
      warranty: '1 Year Official Apple Warranty',
      regularPrice: 32000,
      discountPrice: 28500,
      purchasePrice: 24500,
      stockQuantity: 60,
      minStockLevel: 10,
      mainImage: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=700',
      isFeatured: true,
      isBestSeller: true,
      isNewArrival: false,
      rating: 4.9,
      ratingCount: 140,
      variants: [
        { name: 'White - USB-C Case', color: 'Glossy White', colorCode: '#FFFFFF', storage: 'N/A', ram: 'N/A', sku: 'APP2-USBC-WHT', purchasePrice: 24500, regularPrice: 32000, discountPrice: 28500, stockQuantity: 60 },
      ],
      images: ['https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=700'],
    },
    {
      name: 'Sony WH-1000XM5 Wireless Noise-Canceling Headphones',
      slug: 'sony-wh-1000xm5-wireless-headphones',
      sku: 'SONY-XM5-MST',
      brandSlug: 'sony',
      categorySlug: 'headphones',
      shortDesc: 'Industry-leading noise cancellation with 8 microphones, LDAC Hi-Res Audio, 30h battery.',
      description: 'With two processors and eight microphones, the Sony WH-1000XM5 rewrite the rules for distraction-free listening and exceptional call quality.',
      specifications: JSON.stringify({
        NoiseCancellation: 'Integrated Processor V1 + HD Noise Cancelling QN1',
        Driver: '30mm carbon fiber composite driver',
        Battery: '30 hours with ANC (3 min quick charge = 3 hours)',
        Codec: 'LDAC, AAC, SBC with DSEE Extreme upscaling',
      }),
      warranty: '1 Year Official Sony Warranty',
      regularPrice: 45000,
      discountPrice: 39999,
      purchasePrice: 33500,
      stockQuantity: 25,
      minStockLevel: 4,
      mainImage: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=700',
      isFeatured: true,
      isBestSeller: true,
      isNewArrival: false,
      rating: 4.9,
      ratingCount: 78,
      variants: [
        { name: 'Silver White', color: 'Platinum Silver', colorCode: '#EAE6E1', storage: 'N/A', ram: 'N/A', sku: 'XM5-SLV', purchasePrice: 33500, regularPrice: 45000, discountPrice: 39999, stockQuantity: 12 },
        { name: 'Midnight Black', color: 'Midnight Black', colorCode: '#1A1A1A', storage: 'N/A', ram: 'N/A', sku: 'XM5-BLK', purchasePrice: 33500, regularPrice: 45000, discountPrice: 39999, stockQuantity: 13 },
      ],
      images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=700'],
    },

    // ---------------- CHARGERS & POWER BANKS (4 Products) ----------------
    {
      name: 'Anker Prime 27,650mAh Power Bank (250W Multi-Port)',
      slug: 'anker-prime-27650mah-power-bank-250w',
      sku: 'ANK-P250W-MST',
      brandSlug: 'anker',
      categorySlug: 'chargers-powerbanks',
      shortDesc: '250W total output, 140W single-port PD 3.1, smart digital display & Anker App tracking.',
      description: 'The powerhouse for laptops and phones. Fast charges a 16-inch MacBook Pro to 50% in just 28 minutes while providing real-time smart power telemetry.',
      specifications: JSON.stringify({
        Capacity: '27,650 mAh (99.54Wh Airline Flight Safe)',
        OutputPorts: '2x USB-C (140W max each) + 1x USB-A (65W max)',
        Display: 'Full Color Smart TFT Display with power curve graphs',
      }),
      warranty: '18 Months Official Anker Warranty',
      regularPrice: 21000,
      discountPrice: 18500,
      purchasePrice: 15000,
      stockQuantity: 40,
      minStockLevel: 5,
      mainImage: 'https://images.unsplash.com/photo-1609592426868-b7a42ecdc978?w=700',
      isFeatured: true,
      isBestSeller: true,
      isNewArrival: true,
      rating: 4.9,
      ratingCount: 65,
      variants: [
        { name: 'Dark Gray 250W', color: 'Titanium Gray', colorCode: '#4F5459', storage: '27,650mAh', ram: 'N/A', sku: 'ANK-P250-GRY', purchasePrice: 15000, regularPrice: 21000, discountPrice: 18500, stockQuantity: 40 },
      ],
      images: ['https://images.unsplash.com/photo-1609592426868-b7a42ecdc978?w=700'],
    },
    {
      name: 'Baseus Blade HD 100W Ultra-Slim Power Bank (20000mAh)',
      slug: 'baseus-blade-hd-100w-power-bank',
      sku: 'BAS-BLADE-100W',
      brandSlug: 'baseus',
      categorySlug: 'chargers-powerbanks',
      shortDesc: '0.7-inch thin laptop powerbank, 100W Dual-Way Type-C PD, LED status panel.',
      description: 'Designed to slide seamlessly into laptop sleeves. Delivers 100W high-speed charging to laptops, tablets, and phones simultaneously.',
      specifications: JSON.stringify({
        Capacity: '20,000 mAh',
        Power: '100W Max Fast Charging via Type-C PD 3.0',
        Profile: '18mm ultra-thin flat profile',
      }),
      warranty: '1 Year Replacement Warranty',
      regularPrice: 9500,
      discountPrice: 7999,
      purchasePrice: 6200,
      stockQuantity: 35,
      minStockLevel: 6,
      mainImage: 'https://images.unsplash.com/photo-1609592426868-b7a42ecdc978?w=700',
      isFeatured: false,
      isBestSeller: true,
      isNewArrival: false,
      rating: 4.7,
      ratingCount: 51,
      variants: [
        { name: 'Matte Black 100W', color: 'Black', colorCode: '#1B1B1B', storage: '20,000mAh', ram: 'N/A', sku: 'BAS-BLD-100-BLK', purchasePrice: 6200, regularPrice: 9500, discountPrice: 7999, stockQuantity: 35 },
      ],
      images: ['https://images.unsplash.com/photo-1609592426868-b7a42ecdc978?w=700'],
    },

    // ---------------- BLUETOOTH SPEAKERS (2 Products) ----------------
    {
      name: 'JBL Charge 5 Portable Waterproof Bluetooth Speaker',
      slug: 'jbl-charge-5-bluetooth-speaker',
      sku: 'JBL-CHG5-MST',
      brandSlug: 'jbl',
      categorySlug: 'speakers',
      shortDesc: 'IP67 waterproof & dustproof, 20 hours playtime, built-in powerbank & JBL Original Pro Sound.',
      description: 'Take the party with you no matter what the weather. Delivers bold JBL Original Pro Sound with an optimized long-excursion driver, separate tweeter, and dual pumping JBL bass radiators.',
      specifications: JSON.stringify({
        OutputPower: '40W RMS (30W Woofer + 10W Tweeter)',
        Waterproof: 'IP67 Dustproof and Waterproof',
        Playtime: 'Up to 20 hours',
        Features: 'Built-in USB Powerbank for charging phones, PartyBoost pairing',
      }),
      warranty: '1 Year Official Warranty',
      regularPrice: 21500,
      discountPrice: 18999,
      purchasePrice: 15200,
      stockQuantity: 30,
      minStockLevel: 5,
      mainImage: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=700',
      isFeatured: true,
      isBestSeller: true,
      isNewArrival: false,
      rating: 4.8,
      ratingCount: 92,
      variants: [
        { name: 'Squad Camo', color: 'Camouflage', colorCode: '#4B5320', storage: 'N/A', ram: 'N/A', sku: 'JBL-CHG5-CAM', purchasePrice: 15200, regularPrice: 21500, discountPrice: 18999, stockQuantity: 15 },
        { name: 'Black', color: 'Black', colorCode: '#111111', storage: 'N/A', ram: 'N/A', sku: 'JBL-CHG5-BLK', purchasePrice: 15200, regularPrice: 21500, discountPrice: 18999, stockQuantity: 15 },
      ],
      images: ['https://images.unsplash.com/photo-1545454675-3531b543be5d?w=700'],
    },
  ];

  const createdProducts = [];

  for (const p of rawProducts) {
    const { brandSlug, categorySlug, variants, images, ...prodData } = p;
    const product = await prisma.product.create({
      data: {
        ...prodData,
        brandId: brandMap[brandSlug],
        categoryId: categoryMap[categorySlug],
      },
    });

    for (const v of variants) {
      await prisma.productVariant.create({
        data: {
          ...v,
          productId: product.id,
        },
      });
    }

    for (let i = 0; i < images.length; i++) {
      await prisma.productImage.create({
        data: {
          productId: product.id,
          url: images[i],
          altText: `${product.name} Photo ${i + 1}`,
          sortOrder: i,
        },
      });
    }

    createdProducts.push(product);
  }

  // 7. Customers (20 Realistic Bangladeshi Customers)
  const customersData = [
    { fullName: 'Rafid Al-Mahmud', email: 'rafid.mahmud@gmail.com', phone: '+8801711223344', division: 'Dhaka', district: 'Dhaka', upazila: 'Gulshan 2', address: 'House 42, Road 113/A, Gulshan-2, Dhaka' },
    { fullName: 'Sadia Afreen Khan', email: 'sadia.afreen@gmail.com', phone: '+8801819556677', division: 'Dhaka', district: 'Dhaka', upazila: 'Dhanmondi', address: 'Apartment 5B, House 14, Road 8, Dhanmondi, Dhaka' },
    { fullName: 'Tanvir Hossain Chowdhury', email: 'tanvir.chy@yahoo.com', phone: '+8801912889900', division: 'Chattogram', district: 'Chattogram', upazila: 'Agrabad', address: 'Plot 7, Commercial Area, Agrabad, Chattogram' },
    { fullName: 'Farzana Rahman Mimi', email: 'farzana.mimi@gmail.com', phone: '+8801615334455', division: 'Dhaka', district: 'Dhaka', upazila: 'Uttara', address: 'Sector 4, Road 18, House 9, Uttara, Dhaka' },
    { fullName: 'Ariful Islam Bappi', email: 'arif.bappi@gmail.com', phone: '+8801722998877', division: 'Sylhet', district: 'Sylhet', upazila: 'Zindabazar', address: 'Shukria Market Lane, Zindabazar, Sylhet' },
    { fullName: 'Mahmudul Hasan Shanto', email: 'shanto.crick@gmail.com', phone: '+8801833112233', division: 'Rajshahi', district: 'Rajshahi', upazila: 'Boalia', address: 'Shaheb Bazar Road, Boalia, Rajshahi' },
    { fullName: 'Nabila Karim', email: 'nabila.karim@outlook.com', phone: '+8801944556677', division: 'Dhaka', district: 'Dhaka', upazila: 'Banani', address: 'Road 11, Block C, House 25, Banani, Dhaka' },
    { fullName: 'Shafiqul Alam Jewel', email: 'shafiq.jewel@gmail.com', phone: '+8801755667788', division: 'Khulna', district: 'Khulna', upazila: 'Sonadanga', address: 'Mujgunni Main Road, Sonadanga, Khulna' },
    { fullName: 'Anika Tabassum', email: 'anika.tabassum@gmail.com', phone: '+8801866778899', division: 'Dhaka', district: 'Dhaka', upazila: 'Mirpur', address: 'Mirpur DOHS, Avenue 3, Road 8, Dhaka' },
    { fullName: 'Zubair Ahmed Rony', email: 'zubair.rony@gmail.com', phone: '+8801977889900', division: 'Chattogram', district: 'Chattogram', upazila: 'Nasirabad', address: 'GEC Circle, Housing Society Road, Nasirabad' },
  ];

  const createdCustomers = [];
  for (const c of customersData) {
    const customer = await prisma.customer.create({
      data: {
        ...c,
        passwordHash: hashedCustomerPassword,
      },
    });

    await prisma.address.create({
      data: {
        customerId: customer.id,
        title: 'Home Address',
        receiverName: customer.fullName,
        phone: customer.phone,
        division: customer.division || 'Dhaka',
        district: customer.district || 'Dhaka',
        upazila: customer.upazila || 'Gulshan',
        areaAddress: customer.address || 'Dhaka',
        isDefault: true,
      },
    });

    createdCustomers.push(customer);
  }

  // 8. Purchases from Suppliers (Stock Inflow)
  const purchase1 = await prisma.purchase.create({
    data: {
      purchaseNumber: 'PO-2026-0001',
      supplierId: supplierList[1].id, // Apple distributor
      referenceNo: 'INV-SMART-88912',
      purchaseDate: new Date(Date.now() - 14 * 24 * 3600 * 1000),
      totalAmount: 172000 * 10 + 110000 * 15,
      status: 'RECEIVED',
      notes: 'Initial Apple batch: iPhone 16 Pro Max & iPhone 16 official stock received in good order.',
    },
  });

  // 9. Orders & Invoices (Realistic Bangladeshi Orders)
  const orderStatuses = [
    'DELIVERED', 'DELIVERED', 'DELIVERED', 'SHIPPED', 'PACKED', 
    'PROCESSING', 'CONFIRMED', 'PENDING', 'CANCELLED', 'RETURNED'
  ];

  const paymentMethods = ['BKASH', 'NAGAD', 'CASH_ON_DELIVERY', 'BANK_TRANSFER'];
  const allVariants = await prisma.productVariant.findMany({ include: { product: true } });

  let orderSeq = 1;
  for (let i = 0; i < 25; i++) {
    const customer = createdCustomers[i % createdCustomers.length];
    const status = orderStatuses[i % orderStatuses.length];
    const payMethod = paymentMethods[i % paymentMethods.length];
    const isPaid = ['DELIVERED', 'SHIPPED', 'PACKED', 'PROCESSING', 'CONFIRMED'].includes(status) && payMethod !== 'CASH_ON_DELIVERY';

    // pick 1-2 random items
    const item1 = allVariants[i % allVariants.length];
    const item2 = allVariants[(i + 3) % allVariants.length];

    const qty1 = 1;
    const qty2 = i % 3 === 0 ? 1 : 0;

    const subtotal = (item1.discountPrice || item1.regularPrice) * qty1 + (qty2 ? (item2.discountPrice || item2.regularPrice) * qty2 : 0);
    const deliveryFee = customer.division === 'Dhaka' ? 60 : 120;
    const vat = Math.round(subtotal * 0.05);
    const grandTotal = subtotal + deliveryFee + vat;

    const orderNumber = `ORD-20260821-${String(orderSeq).padStart(4, '0')}`;
    const invoiceNumber = `INV-2026-${String(orderSeq).padStart(6, '0')}`;

    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerId: customer.id,
        customerName: customer.fullName,
        customerPhone: customer.phone,
        customerEmail: customer.email,
        division: customer.division || 'Dhaka',
        district: customer.district || 'Dhaka',
        upazila: customer.upazila || 'Gulshan',
        shippingAddress: customer.address || 'Dhaka',
        subtotal,
        discountAmount: 0,
        deliveryFee,
        vatAmount: vat,
        grandTotal,
        paymentMethod: payMethod,
        paymentStatus: isPaid ? 'PAID' : (status === 'CANCELLED' ? 'FAILED' : 'PENDING'),
        transactionId: payMethod === 'BKASH' ? `BK${Math.floor(100000000 + Math.random() * 900000000)}` : (payMethod === 'NAGAD' ? `NG${Math.floor(100000000 + Math.random() * 900000000)}` : null),
        senderPhone: ['BKASH', 'NAGAD'].includes(payMethod) ? customer.phone : null,
        orderStatus: status,
        createdAt: new Date(Date.now() - (25 - i) * 8 * 3600 * 1000),
      },
    });

    // Create Order Items
    await prisma.orderItem.create({
      data: {
        orderId: order.id,
        productId: item1.productId,
        variantId: item1.id,
        productName: item1.product.name,
        variantName: item1.name,
        sku: item1.sku,
        unitPrice: item1.discountPrice || item1.regularPrice,
        purchaseCost: item1.purchasePrice,
        quantity: qty1,
        totalPrice: (item1.discountPrice || item1.regularPrice) * qty1,
      },
    });

    if (qty2) {
      await prisma.orderItem.create({
        data: {
          orderId: order.id,
          productId: item2.productId,
          variantId: item2.id,
          productName: item2.product.name,
          variantName: item2.name,
          sku: item2.sku,
          unitPrice: item2.discountPrice || item2.regularPrice,
          purchaseCost: item2.purchasePrice,
          quantity: qty2,
          totalPrice: (item2.discountPrice || item2.regularPrice) * qty2,
        },
      });
    }

    // Create Invoice
    await prisma.invoice.create({
      data: {
        invoiceNumber,
        orderId: order.id,
        customerId: customer.id,
        issueDate: order.createdAt,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        customerAddress: `${order.shippingAddress}, ${order.upazila}, ${order.district}`,
        subtotal,
        discount: 0,
        deliveryFee,
        vat,
        grandTotal,
        paymentMethod: payMethod,
        paymentStatus: order.paymentStatus,
      },
    });

    // Create Stock Audit Trail
    await prisma.inventoryTransaction.create({
      data: {
        productId: item1.productId,
        variantId: item1.id,
        orderId: order.id,
        type: 'ORDER_SOLD',
        prevQty: item1.stockQuantity + 1,
        changeQty: -1,
        newQty: item1.stockQuantity,
        unitCost: item1.purchasePrice,
        reason: `Sold in Order #${orderNumber}`,
        actor: 'Storefront Checkout System',
        createdAt: order.createdAt,
      },
    });

    orderSeq++;
  }

  // 10. Audit Activity Logs
  const auditEntries = [
    { userName: 'Tahmidur Rahman (Super Admin)', action: 'LOGIN', entity: 'Auth', details: 'Admin logged in from IP 103.145.112.45 (Dhaka, Bangladesh)' },
    { userName: 'Tahmidur Rahman (Super Admin)', action: 'PRODUCT_CREATED', entity: 'Product', details: 'Added new flagship: Apple iPhone 16 Pro Max' },
    { userName: 'Kamrul Hasan (Inventory Manager)', action: 'STOCK_RESTOCKED', entity: 'Inventory', details: 'Received PO-2026-0001 from Smart Technologies BD (+25 units)' },
    { userName: 'Nusrat Jahan (Sales Lead)', action: 'ORDER_STATUS_UPDATED', entity: 'Order', details: 'Changed status of ORD-20260821-0001 to DELIVERED' },
  ];

  for (const log of auditEntries) {
    await prisma.activityLog.create({
      data: {
        userName: log.userName,
        action: log.action,
        entity: log.entity,
        details: log.details,
        ipAddress: '103.145.112.45',
      },
    });
  }

  console.log('✅ GadgetPulse BD Seed complete! Products, variants, orders, customers, and ERP data populated.');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
