/**
 * Database Initialization Script
 * Populates MongoDB with sample data
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Import Models
const LeadStatus = require('../models/LeadStatus');
const LeadSource = require('../models/LeadSource');
const Company = require('../models/Company');
const Employee = require('../models/Employee');
const Lead = require('../models/Lead');
const LeadActivity = require('../models/LeadActivity');

// Import Sample Data
const {
    sampleLeadStatuses,
    sampleLeadSources,
    sampleCompanies,
    sampleEmployees,
    sampleLeads,
    sampleLeadActivities
} = require('./sampleData');

const initializeDatabase = async() => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/lead-crm', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        console.log('✅ Connected to MongoDB');

        // Clear existing data
        console.log('🧹 Clearing existing data...');
        await LeadStatus.deleteMany({});
        await LeadSource.deleteMany({});
        await Company.deleteMany({});
        await Employee.deleteMany({});
        await Lead.deleteMany({});
        await LeadActivity.deleteMany({});

        // Insert Master Data
        console.log('📋 Inserting Lead Statuses...');
        const statuses = await LeadStatus.insertMany(sampleLeadStatuses);
        console.log(`✅ Inserted ${statuses.length} lead statuses`);

        console.log('📋 Inserting Lead Sources...');
        const sources = await LeadSource.insertMany(sampleLeadSources);
        console.log(`✅ Inserted ${sources.length} lead sources`);

        console.log('🏢 Inserting Companies...');
        const companies = await Company.insertMany(sampleCompanies);
        console.log(`✅ Inserted ${companies.length} companies`);

        // Insert Employees with company reference
        console.log('👥 Inserting Employees...');
        const employeesWithCompany = sampleEmployees.map((emp, index) => ({
            ...emp,
            company: companies[index % companies.length]._id
        }));
        const employees = await Employee.insertMany(employeesWithCompany);
        console.log(`✅ Inserted ${employees.length} employees`);

        // Insert Leads with references
        console.log('📝 Inserting Leads...');
        const leadsWithReferences = sampleLeads.map((lead, index) => ({
            ...lead,
            status: statuses[0]._id, // Default to "New Lead"
            source: sources[index % sources.length]._id,
            company: companies[0]._id,
            createdBy: employees[0]._id,
            assignedTo: employees[index % employees.length]._id,
            assignedAt: new Date()
        }));
        const leads = await Lead.insertMany(leadsWithReferences);
        console.log(`✅ Inserted ${leads.length} leads`);

        // Insert Activities with lead reference
        console.log('📊 Inserting Lead Activities...');
        const activitiesWithReferences = sampleLeadActivities.map((activity, index) => ({
            ...activity,
            lead: leads[index % leads.length]._id,
            createdBy: employees[index % employees.length]._id
        }));
        const activities = await LeadActivity.insertMany(activitiesWithReferences);
        console.log(`✅ Inserted ${activities.length} activities`);

        console.log('\n✨ Database initialization completed successfully!');
        console.log('\n📊 Summary:');
        console.log(`   - Lead Statuses: ${statuses.length}`);
        console.log(`   - Lead Sources: ${sources.length}`);
        console.log(`   - Companies: ${companies.length}`);
        console.log(`   - Employees: ${employees.length}`);
        console.log(`   - Leads: ${leads.length}`);
        console.log(`   - Activities: ${activities.length}`);

    } catch (error) {
        console.error('❌ Error during initialization:', error);
    } finally {
        await mongoose.connection.close();
        console.log('\n🔌 Disconnected from MongoDB');
    }
};

// Run initialization
initializeDatabase();