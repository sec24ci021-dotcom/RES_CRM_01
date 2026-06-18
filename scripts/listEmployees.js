const mongoose = require('mongoose');
const Employee = require('../src/models/Employee');

async function list() {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/lead-crm', { useNewUrlParser: true, useUnifiedTopology: true });
    const db = mongoose.connection.db;
    const count = await db.collection('employees').countDocuments();
    console.log('RAW COUNT:', count);
    const viaModel = await Employee.find({}).setOptions({ _recursed: true }).lean();
    console.log('MODEL FIND (bypassing pre-hook) COUNT:', viaModel.length);
    viaModel.forEach(e => console.log('MODEL:', e._id, e.firstName, e.lastName, e.email, 'isDeleted=', e.isDeleted));
    const plainModel = await Employee.find({}).lean();
    console.log('MODEL FIND (normal) COUNT:', plainModel.length);
    plainModel.forEach(e => console.log('MODEL-NORMAL:', e._id, e.firstName, e.lastName, e.email, 'isDeleted=', e.isDeleted));
    const docs = await db.collection('employees').find({}).toArray();
    docs.forEach(e => console.log('RAW:', e._id, e.firstName, e.lastName, e.email, 'isDeleted=', e.isDeleted));
    await mongoose.disconnect();
}

list().catch(err => {
    console.error(err);
    process.exit(1);
});