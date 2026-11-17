// Runs the real backend against the isolated demo database.
//   npm run seed:demo   (once, or whenever you want fresh sample data)
//   npm run demo
// Then start the frontend as usual and sign in with the demo accounts listed
// in seeds/demoSeeder.js.
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { demoMongoUri, DEMO_DB } from './demoDb.js';

dotenv.config({ path: fileURLToPath(new URL('../.env', import.meta.url)) });

process.env.MONGO_URI = demoMongoUri(process.env.MONGO_URI);
console.log(`[demo] using the isolated "${DEMO_DB}" database; production data is not touched`);

await import('../index.js');
