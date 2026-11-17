// Fills the isolated demo database with realistic SAMPLE data for product
// demos. Every person, pickup, listing and article here is fictional.
//
//   npm run seed:demo      wipes and re-creates the demo database
//
// It refuses to run against anything except the demo database.
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { demoMongoUri, DEMO_DB } from './demoDb.js';
import { brand } from '../utils/brand.js';
import { UserModel } from '../models/user.js';
import { wasteCollectionModel } from '../models/wasteCollection.js';
import { ProductModel } from '../models/products.js';
import { EducationModel } from '../models/education.js';
import { NotificationModel } from '../models/notification.js';

dotenv.config({ path: fileURLToPath(new URL('../.env', import.meta.url)) });

// Demo sign-ins (they exist only in the demo database).
export const DEMO_PASSWORD = 'TakaKipawa-Demo-2026';
export const DEMO_ACCOUNTS = {
    household: 'demo.user@example.com',
    vendor: 'demo.vendor@example.com',
    admin: 'demo.admin@example.com',
};

const DAY = 24 * 60 * 60 * 1000;
const daysAgo = (n, hour = 9) => {
    const d = new Date(Date.now() - n * DAY);
    d.setHours(hour, 30, 0, 0);
    return d;
};
const daysAhead = (n, hour = 9) => daysAgo(-n, hour);

const LEVELS = [['Earth Guardian', 1000], ['Green Champion', 600], ['Eco Warrior', 300], ['Recycler', 100], ['Beginner', 0]];
const levelFor = (points) => LEVELS.find(([, min]) => points >= min)[0];

await mongoose.connect(demoMongoUri(process.env.MONGO_URI));
if (mongoose.connection.name !== DEMO_DB) {
    throw new Error(`Refusing to seed: connected to "${mongoose.connection.name}", expected "${DEMO_DB}".`);
}
await mongoose.connection.dropDatabase();

const password = bcrypt.hashSync(DEMO_PASSWORD, 10);

// ---------------------------------------------------------------- people
const household = (name, email, location, kg, completed, streak, badges) => ({
    name, email, password, location, role: 'user',
    points: kg * 10, wasteCollected: kg, carbonSaved: +(kg * 0.21).toFixed(2),
    completedPickups: completed, totalPickups: completed, streak,
    level: levelFor(kg * 10), badges,
});

const [ama, ...neighbours] = await UserModel.create([
    household('Ama Mensah', DEMO_ACCOUNTS.household, 'Osu, Accra', 64, 7, 4, ['first_pickup', 'five_pickups']),
    household('Kwame Asante', 'kwame.sample@example.com', 'East Legon, Accra', 124, 13, 9, ['first_pickup', 'five_pickups', 'ten_pickups']),
    household('Abena Osei', 'abena.sample@example.com', 'Madina, Accra', 91, 10, 6, ['first_pickup', 'five_pickups', 'ten_pickups']),
    household('Yaw Boateng', 'yaw.sample@example.com', 'Tema, Community 5', 78, 8, 5, ['first_pickup', 'five_pickups']),
    household('Efua Darko', 'efua.sample@example.com', 'Dansoman, Accra', 45, 5, 2, ['first_pickup', 'five_pickups']),
    household('Kojo Appiah', 'kojo.sample@example.com', 'Kaneshie, Accra', 32, 4, 2, ['first_pickup']),
    household('Adwoa Owusu', 'adwoa.sample@example.com', 'Adenta, Accra', 18, 2, 1, ['first_pickup']),
    household('Nii Lamptey', 'nii.sample@example.com', 'Labadi, Accra', 9, 1, 1, ['first_pickup']),
]);

const [kofi, akua] = await UserModel.create([
    { name: 'Kofi Adjei', email: DEMO_ACCOUNTS.vendor, password, role: 'vendor', location: 'Madina, Accra' },
    { name: 'Akua Sarpong', email: 'akua.sample@example.com', password, role: 'vendor', location: 'Spintex, Accra' },
]);

const admin = await UserModel.create({
    name: `${brand.operator} Operations`, email: DEMO_ACCOUNTS.admin, password, role: 'admin', location: 'Accra',
});

// --------------------------------------------------------------- pickups
const completedPickup = (user, ago, location, wasteType, kg, rating, agentName) => ({
    user: user._id, pickupDate: daysAgo(ago), location, wasteType,
    status: 'Completed', estimatedWeight: kg, actualWeight: kg,
    pointsEarned: kg * 10, carbonSaved: +(kg * 0.21).toFixed(2),
    completedAt: daysAgo(ago, 14), rating, agentName,
    createdAt: daysAgo(ago + 2), updatedAt: daysAgo(ago, 14),
});
const openPickup = (user, status, when, location, wasteType, kg, extra = {}) => ({
    user: user._id, pickupDate: when, location, wasteType, status, estimatedWeight: kg,
    createdAt: daysAgo(3), updatedAt: daysAgo(0, 8), ...extra,
});

const pickups = await wasteCollectionModel.create([
    // Ama: 7 completed over four months (64 kg), one on the road today, two booked
    completedPickup(ama, 104, 'Osu, Accra', 'Plastics', 8, 5, 'Kwesi (Truck 2)'),
    completedPickup(ama, 88, 'Osu, Accra', 'Paper & Cardboard', 12, 5, 'Kwesi (Truck 2)'),
    completedPickup(ama, 67, 'Osu, Accra', 'Glass', 6, 4, 'Esi (Truck 1)'),
    completedPickup(ama, 51, 'Osu, Accra', 'Organic/Food Waste', 10, 5, 'Kwesi (Truck 2)'),
    completedPickup(ama, 36, 'Osu, Accra', 'Plastics', 9, 5, 'Esi (Truck 1)'),
    completedPickup(ama, 22, 'Osu, Accra', 'Recyclable Materials', 11, 4, 'Kwesi (Truck 2)'),
    completedPickup(ama, 8, 'Osu, Accra', 'Metals & Scrap', 8, 5, 'Kwesi (Truck 2)'),
    openPickup(ama, 'In Progress', daysAgo(0, 11), 'Osu, Accra', 'Plastics', 7, { agentName: 'Kwesi (Truck 2)' }),
    openPickup(ama, 'Scheduled', daysAhead(3), 'Osu, Accra', 'Paper & Cardboard', 5),
    openPickup(ama, 'Scheduled', daysAhead(10), 'Osu, Accra', 'Organic/Food Waste', 9),
    // The rest of the neighbourhood, for the operations (admin) view
    completedPickup(neighbours[0], 5, 'East Legon, Accra', 'Recyclable Materials', 14, 5, 'Esi (Truck 1)'),
    completedPickup(neighbours[1], 6, 'Madina, Accra', 'Plastics', 9, 4, 'Kwesi (Truck 2)'),
    completedPickup(neighbours[2], 9, 'Tema, Community 5', 'Electronic (E-Waste)', 11, 5, 'Esi (Truck 1)'),
    completedPickup(neighbours[3], 12, 'Dansoman, Accra', 'Glass', 7, 4, 'Kwesi (Truck 2)'),
    openPickup(neighbours[0], 'In Progress', daysAgo(0, 10), 'East Legon, Accra', 'Paper & Cardboard', 10, { agentName: 'Esi (Truck 1)' }),
    openPickup(neighbours[1], 'In Progress', daysAgo(0, 12), 'Madina, Accra', 'Organic/Food Waste', 12, { agentName: 'Kwesi (Truck 2)' }),
    openPickup(neighbours[2], 'Scheduled', daysAhead(1), 'Tema, Community 5', 'Plastics', 8),
    openPickup(neighbours[4], 'Scheduled', daysAhead(1, 13), 'Kaneshie, Accra', 'Metals & Scrap', 15),
    openPickup(neighbours[5], 'Scheduled', daysAhead(2), 'Adenta, Accra', 'Fashion & Textiles', 6),
    openPickup(neighbours[6], 'Scheduled', daysAhead(4), 'Labadi, Accra', 'General Waste', 10),
    openPickup(neighbours[3], 'Cancelled', daysAgo(2), 'Dansoman, Accra', 'Wood & Furniture', 20),
]);
const amaInProgress = pickups[7];
const amaNext = pickups[8];

// ----------------------------------------------------------- marketplace
// Listings have no photos: vendors upload their own in the real app.
const listing = (vendor, title, price, category, wasteType, inventory, sold, views, description, story, materials) => ({
    user: vendor._id, title, price, category, wasteType, inventory, sold, views, description,
    condition: 'New', location: vendor.location, isUpcycled: true, isAvailable: true,
    upcyclingStory: story, materialsUsed: materials, rating: 4.7, totalRatings: Math.max(3, Math.round(sold / 3)),
});

await ProductModel.create([
    listing(kofi, 'Woven Sachet Tote Bag', 85, 'Plastics', 'Plastics', 14, 37, 412,
        'Sturdy everyday tote woven from cleaned water-sachet plastic.',
        'Each bag keeps about 120 water sachets out of the gutters of Madina.', ['Water sachets', 'Cotton lining']),
    listing(kofi, 'Tyre Ottoman Seat', 320, 'Other', 'Rubber', 5, 12, 268,
        'A used car tyre wrapped in sisal rope with a cushioned top.',
        'Made from tyres collected at Abossey Okai that would otherwise be burnt.', ['Car tyre', 'Sisal rope', 'Plywood']),
    listing(kofi, 'Glass Bottle Table Lamp', 150, 'Glass', 'Glass', 9, 21, 305,
        'Hand-cut bottle lamp with a warm LED bulb included.',
        `Cut and polished from bottles returned through ${brand.name} pickups.`, ['Glass bottle', 'LED fitting']),
    listing(kofi, 'Recycled Paper Notebook Set', 35, 'Papers', 'Paper & Cardboard', 40, 64, 520,
        'Set of three A5 notebooks made from office paper waste.',
        'Pulped and pressed by a youth co-operative in Nima.', ['Office paper', 'Cardboard']),
    listing(akua, 'Pallet Wood Coffee Table', 650, 'Wood', 'Wood & Furniture', 3, 6, 190,
        'Solid coffee table built from reclaimed shipping pallets.',
        'Pallets are sourced from Tema port and sanded by hand.', ['Shipping pallets', 'Steel legs']),
    listing(akua, 'Garden Compost, 10 kg', 45, 'Organic Fertilizer', 'Organic/Food Waste', 60, 118, 640,
        'Rich compost made from household food waste.',
        `Produced from organic waste collected on ${brand.name} routes.`, ['Food waste', 'Dry leaves']),
    listing(akua, 'Patchwork Fabric Cushion', 120, 'Fashion & Textiles', 'Fashion & Textiles', 11, 29, 334,
        'Cushion cover stitched from tailoring off-cuts.',
        'Fabric scraps come from seamstresses around Makola market.', ['Fabric off-cuts', 'Zip']),
    listing(akua, 'Scrap-Metal Wall Art', 280, 'Metals', 'Metals & Scrap', 4, 8, 156,
        'Welded adinkra symbol made from reclaimed steel.',
        'Each piece reuses roughly 3 kg of scrap steel.', ['Scrap steel']),
]);

// ------------------------------------------------------------- education
const article = (title, category, summary, content, ago) => ({
    title, category, summary, content, author: admin._id, createdAt: daysAgo(ago), updatedAt: daysAgo(ago),
});

await EducationModel.create([
    article('Sorting at home in three bins', 'Waste Sorting',
        'A simple three-bin system that makes every pickup more valuable.',
        'Keep one bin for recyclables (plastic, paper, glass, metal), one for food and garden waste, and one for everything else. Rinse containers, flatten boxes, and keep paper dry. Sorted waste is worth more to recyclers and earns you full points on every pickup.', 6),
    article('What happens to your plastic after pickup', 'Recycling Tips',
        'Follow a water sachet from your doorstep to a new product.',
        'After collection, plastics are sorted by type, washed, shredded into flakes and sold to manufacturers or handed to upcycling vendors on the marketplace. Clean, dry plastic is the easiest to recycle, so shake out any liquid before you bag it.', 13),
    article('Start composting in a small space', 'Composting',
        'You do not need a garden to turn food scraps into compost.',
        'Use a lidded bucket with a few holes. Layer fruit and vegetable scraps with dry leaves or shredded paper, keep it as damp as a wrung-out cloth, and stir weekly. In six to eight weeks you will have compost for pot plants. Avoid meat, oil and dairy.', 21),
    article('Handling e-waste safely', 'Sustainability',
        'Old phones and batteries need special care. Here is what to do.',
        'Never burn or dismantle electronics at home. Store old phones, chargers and batteries in a dry box and book an Electronic (E-Waste) pickup. Tape over battery terminals to prevent short circuits.', 30),
    article('Community clean-up: join the next workshop', 'Workshops',
        `Hands-on sorting and upcycling sessions with the ${brand.name} team.`,
        'Our workshops cover home sorting, composting and simple upcycling projects. Sessions are free for registered users. Check your notifications for the next date in your area.', 2),
]);

// --------------------------------------------------------- notifications
const minutesAgo = (m) => new Date(Date.now() - m * 60 * 1000);
await NotificationModel.collection.insertMany([
    { type: 'pickup', title: 'Pickup in progress', body: 'Your Plastics pickup for today is now "In Progress".', link: `/customerDashboard/schedule/${amaInProgress.id}`, read: false, at: minutesAgo(12) },
    { type: 'pickup', title: 'Pickup scheduled', body: 'Paper & Cardboard pickup booked.', link: `/customerDashboard/schedule/${amaNext.id}`, read: false, at: minutesAgo(180) },
    { type: 'points', title: 'You earned 80 points', body: 'Pickup completed: 8 kg collected, an estimated 1.68 kg CO2e avoided. Your level: Green Champion.', link: '/customerDashboard/overview', read: true, at: daysAgo(8, 14) },
    { type: 'badge', title: 'New badge unlocked', body: 'You earned the "five pickups" badge.', link: '/customerDashboard/overview', read: true, at: daysAgo(36, 14) },
].map(({ at, ...n }) => ({ ...n, user: ama._id, createdAt: at, updatedAt: at })));

const summary = {
    users: await UserModel.countDocuments(),
    pickups: await wasteCollectionModel.countDocuments(),
    products: await ProductModel.countDocuments(),
    articles: await EducationModel.countDocuments(),
    notifications: await NotificationModel.countDocuments(),
};
console.log(`[demo] seeded "${DEMO_DB}":`, JSON.stringify(summary));
console.log('[demo] sign in as:', Object.values(DEMO_ACCOUNTS).join(', '), '(password: DEMO_PASSWORD in seeds/demoSeeder.js)');
await mongoose.disconnect();
