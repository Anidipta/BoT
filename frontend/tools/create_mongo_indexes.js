import { MongoClient } from 'mongodb';

const uri = process.argv[2] || process.env.MONGODB_URL;
if (!uri) {
  console.error('Usage: node create_mongo_indexes.js <MONGODB_URL>');
  process.exit(1);
}

async function run() {
  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  try {
    await client.connect();
    const db = client.db();
    console.log('Connected to', db.databaseName);

    await db.collection('wallets').createIndex({ address: 1 }, { unique: true });
    console.log('Created index on wallets.address');

    await db.collection('native_balances').createIndex({ wallet_address: 1 }, { unique: true });
    console.log('Created index on native_balances.wallet_address');

    await db.collection('tokens').createIndex({ owner_address: 1 });
    console.log('Created index on tokens.owner_address');

    await db.collection('analytics_metrics').createIndex({ metric_name: 1 });
    console.log('Created index on analytics_metrics.metric_name');

    console.log('Indexes created successfully');
  } catch (err) {
    console.error('Error creating indexes:', err);
  } finally {
    await client.close();
  }
}

run();
