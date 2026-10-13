import path from 'node:path';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const envPath = path.resolve(process.cwd(), path.basename(process.cwd()) === 'server' ? '../.env' : '.env');
dotenv.config({ path: envPath });

declare const process: {
  env: {
    ADMIN_EMAIL?: string;
    ADMIN_NAME?: string;
    ADMIN_PASSWORD?: string;
    NODE_ENV?: string;
  };
  exit(code?: number): never;
};

const prisma = new PrismaClient();

type SeedRole = 'ADMIN' | 'STAFF' | 'CHEF';

const CATEGORIES = [
  { name: 'Starters', sortOrder: 0, image: 'https://images.unsplash.com/photo-1541529086526-db283c563270?w=800' },
  { name: 'Mains', sortOrder: 1, image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800' },
  { name: 'Grill', sortOrder: 2, image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800' },
  { name: 'Desserts', sortOrder: 3, image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=800' },
  { name: 'Drinks', sortOrder: 4, image: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=800' },
];

const ITEMS: Record<string, { name: string; price: number; description: string; tags: string[]; prepTime: number }[]> = {
  Starters: [
    { name: 'Spring Rolls', price: 5.5, description: 'Crispy vegetable rolls with sweet chili dip.', tags: ['veg'], prepTime: 8 },
    { name: 'Chicken Satay', price: 7.0, description: 'Grilled skewers with peanut sauce.', tags: ['spicy'], prepTime: 12 },
    { name: 'Garlic Bread', price: 4.0, description: 'Toasted baguette, garlic butter, parsley.', tags: ['veg'], prepTime: 5 },
    { name: 'Tom Yum Soup', price: 6.5, description: 'Hot & sour shrimp soup with lemongrass.', tags: ['spicy', 'seafood'], prepTime: 10 },
    { name: 'Mozzarella Sticks', price: 6.0, description: 'Golden fried mozzarella with marinara.', tags: ['veg'], prepTime: 7 },
  ],
  Mains: [
    { name: 'Beef Lok Lak', price: 12.5, description: 'Stir-fried beef with lime-pepper dipping sauce.', tags: ['popular'], prepTime: 15 },
    { name: 'Chicken Fried Rice', price: 9.0, description: 'Wok-fried rice, egg, vegetables.', tags: [], prepTime: 12 },
    { name: 'Vegetable Curry', price: 10.0, description: 'Coconut curry with seasonal vegetables.', tags: ['veg', 'spicy'], prepTime: 18 },
    { name: 'Spaghetti Bolognese', price: 11.5, description: 'Slow-cooked beef ragù over spaghetti.', tags: [], prepTime: 16 },
    { name: 'Pad Thai', price: 10.5, description: 'Rice noodles, tamarind, peanuts, lime.', tags: ['popular'], prepTime: 14 },
  ],
  Grill: [
    { name: 'Ribeye Steak 250g', price: 24.0, description: 'Grass-fed ribeye, herb butter, fries.', tags: ['premium'], prepTime: 22 },
    { name: 'BBQ Pork Ribs', price: 18.5, description: 'Slow-smoked ribs glazed with BBQ sauce.', tags: ['popular'], prepTime: 25 },
    { name: 'Grilled Salmon', price: 19.0, description: 'Atlantic salmon, lemon dill butter.', tags: ['seafood'], prepTime: 18 },
    { name: 'Chicken Skewers', price: 12.0, description: 'Marinated chicken, grilled peppers.', tags: [], prepTime: 16 },
    { name: 'Grilled Vegetable Platter', price: 11.0, description: 'Charred seasonal vegetables, balsamic.', tags: ['veg'], prepTime: 14 },
  ],
  Desserts: [
    { name: 'Chocolate Lava Cake', price: 7.5, description: 'Warm molten center, vanilla ice cream.', tags: ['popular'], prepTime: 10 },
    { name: 'Mango Sticky Rice', price: 6.5, description: 'Sweet coconut rice with fresh mango.', tags: ['veg'], prepTime: 8 },
    { name: 'Cheesecake Slice', price: 6.0, description: 'New York style with berry compote.', tags: ['veg'], prepTime: 5 },
    { name: 'Tiramisu', price: 7.0, description: 'Espresso-soaked ladyfingers, mascarpone.', tags: ['veg'], prepTime: 5 },
    { name: 'Ice Cream Trio', price: 5.5, description: 'Three scoops of your choice.', tags: ['veg'], prepTime: 3 },
  ],
  Drinks: [
    { name: 'Fresh Coconut', price: 4.0, description: 'Chilled whole coconut.', tags: ['veg'], prepTime: 3 },
    { name: 'Iced Lemon Tea', price: 3.0, description: 'Black tea, lemon, ice.', tags: ['veg'], prepTime: 4 },
    { name: 'Mango Smoothie', price: 4.5, description: 'Fresh mango, yogurt, honey.', tags: ['veg'], prepTime: 6 },
    { name: 'Espresso', price: 2.5, description: 'Double shot, freshly ground.', tags: ['veg'], prepTime: 3 },
    { name: 'Craft Beer', price: 5.0, description: 'Local draught, 330ml.', tags: [], prepTime: 2 },
  ],
};

const DEMO_USERS: { name: string; email: string; password: string; role: SeedRole }[] = [
  { name: 'Alex Admin', email: 'admin@menu.test', password: 'admin1234', role: 'ADMIN' },
  { name: 'Sam Staff', email: 'staff@menu.test', password: 'staff1234', role: 'STAFF' },
  { name: 'Casey Chef', email: 'chef@menu.test', password: 'chef1234', role: 'CHEF' },
];

async function main() {
  console.log('🌱 Seeding database…');

  const isProduction = process.env.NODE_ENV === 'production';
  if (isProduction && (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD.length < 16)) {
    throw new Error('Production seeding requires ADMIN_EMAIL and an ADMIN_PASSWORD of at least 16 characters.');
  }
  const users: { name: string; email: string; password: string; role: SeedRole }[] = isProduction
    ? [{
        name: process.env.ADMIN_NAME || 'Restaurant Admin',
        email: process.env.ADMIN_EMAIL!,
        password: process.env.ADMIN_PASSWORD!,
        role: 'ADMIN',
      }]
    : DEMO_USERS;

  // Users
  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: { name: u.name, role: u.role, isActive: true },
      create: { name: u.name, email: u.email, role: u.role, passwordHash: await bcrypt.hash(u.password, 10) },
    });
  }

  // Settings
  const settingsModel = (prisma as any).settings;
  if (settingsModel) {
    await settingsModel.upsert({
      where: { id: 'singleton' },
      update: {},
      create: { id: 'singleton', restaurantName: 'The Digital Bistro', currency: 'USD', taxPercent: 5, serviceChargePercent: 10 },
    });
  }

  // Categories + items
  for (const cat of CATEGORIES) {
    const category = await prisma.category.upsert({
      where: { id: `seed-cat-${cat.sortOrder}` },
      update: { name: cat.name, image: cat.image, sortOrder: cat.sortOrder, isActive: true },
      create: { id: `seed-cat-${cat.sortOrder}`, name: cat.name, image: cat.image, sortOrder: cat.sortOrder },
    });

    const items = ITEMS[cat.name] ?? [];
    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      await prisma.menuItem.upsert({
        where: { id: `seed-item-${cat.sortOrder}-${i}` },
        update: { name: it.name, price: it.price, description: it.description, tags: it.tags, prepTime: it.prepTime },
        create: {
          id: `seed-item-${cat.sortOrder}-${i}`,
          categoryId: category.id,
          name: it.name,
          description: it.description,
          price: it.price,
          prepTime: it.prepTime,
          tags: it.tags,
          sortOrder: i,
          image: `https://source.unsplash.com/600x400/?food,${encodeURIComponent(it.name)}`,
        },
      });
    }
  }

  const prismaAny = prisma as any;

  // Tables
  for (let n = 1; n <= 20; n++) {
    await prismaAny.table.upsert({
      where: { number: n },
      update: {},
      create: { number: n, name: n <= 4 ? `Window ${n}` : null, capacity: n % 5 === 0 ? 8 : 4 },
    });
  }

  const tables = await prismaAny.table.findMany({ orderBy: { number: 'asc' } });
  console.log(`✅ Seeded ${CATEGORIES.length} categories, 25 items, ${tables.length} tables, ${users.length} users.`);
  if (isProduction) {
    console.log('Production administrator configured.');
  } else {
    console.log('\nDemo credentials:');
    console.table(users.map((u) => ({ role: u.role, email: u.email, password: u.password })));
  }
  console.log(`\nExample customer URL: http://localhost:5173/menu/${tables[0].qrToken}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());