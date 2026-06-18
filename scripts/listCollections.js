const mongoose = require('mongoose');

async function list() {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/lead-crm';
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    const db = mongoose.connection.db;
    const cols = await db.listCollections().toArray();
    console.log('Collections:');
    cols.forEach(c => console.log('-', c.name));
    await mongoose.disconnect();
}

list().catch(err => { console.error(err);
    process.exit(1); });