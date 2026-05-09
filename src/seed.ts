import 'dotenv/config';
import connectDB from './config/db';
import Tree from './models/Tree';

const TREES = [
  { plan: 'sapling', variety: 'chausa',  price: 2499, yieldMin: 15, yieldMax: 20 },
  { plan: 'sapling', variety: 'dasheri', price: 2499, yieldMin: 15, yieldMax: 20 },
  { plan: 'sapling', variety: 'langra',  price: 2499, yieldMin: 15, yieldMax: 20 },
  { plan: 'adult',   variety: 'chausa',  price: 4499, yieldMin: 30, yieldMax: 45 },
  { plan: 'adult',   variety: 'dasheri', price: 4499, yieldMin: 30, yieldMax: 45 },
  { plan: 'adult',   variety: 'langra',  price: 4499, yieldMin: 30, yieldMax: 45 },
  { plan: 'grand',   variety: 'chausa',  price: 7999, yieldMin: 60, yieldMax: 80 },
  { plan: 'grand',   variety: 'dasheri', price: 7999, yieldMin: 60, yieldMax: 80 },
  { plan: 'grand',   variety: 'langra',  price: 7999, yieldMin: 60, yieldMax: 80 },
];

async function seed() {
  await connectDB();
  await Tree.deleteMany({});
  await Tree.insertMany(TREES);
  console.log(`Seeded ${TREES.length} trees`);
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
