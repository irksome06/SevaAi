require('dotenv').config();
const mongoose = require('mongoose');

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error('MONGODB_URI is not set in .env — cannot connect.');
  process.exit(1);
}

async function cleanAllData() {
  try {
    console.log(`Connecting to MongoDB...`);
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
    console.log(`Connected to ${mongoose.connection.host}/${mongoose.connection.name}`);

    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Collections found:', collections.map(c => c.name).join(', ') || '(none)');

    for (const col of collections) {
      const count = await mongoose.connection.db.collection(col.name).countDocuments();
      const result = await mongoose.connection.db.collection(col.name).deleteMany({});
      console.log(`  ${col.name}: had ${count} docs → deleted ${result.deletedCount}`);
    }

    console.log('\nAll data deleted successfully.');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error(`Error: ${err.message}`);
    await mongoose.disconnect().catch(() => {});
    process.exit(1);
  }
}

cleanAllData();
