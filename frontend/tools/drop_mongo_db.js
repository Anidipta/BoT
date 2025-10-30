import { MongoClient } from 'mongodb';

const uri = process.argv[2] || process.env.MONGODB_URL;
const confirm = process.argv[3] || process.env.FORCE_DROP;

if (!uri) {
  console.error('Usage: node drop_mongo_db.js <MONGODB_URL> [DELETE]');
  process.exit(1);
}

if (confirm !== 'DELETE') {
  console.error('To drop the database, pass the second arg as DELETE (for safety).');
  process.exit(1);
}

async function run() {
  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  try {
    await client.connect();
    const db = client.db();
    const name = db.databaseName;
    console.log('Dropping database', name);
    await db.dropDatabase();
    console.log('Dropped database', name);
  } catch (err) {
    console.error('Error dropping DB:', err);
  } finally {
    await client.close();
  }
}

run();
