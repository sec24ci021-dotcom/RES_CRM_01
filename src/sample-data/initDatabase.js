/**
 * Database Initialization & Seeding Script
 * Use: npm run init-db or npm run seed
 * 
 * This script will:
 * 1. Connect to MongoDB
 * 2. Clear existing data (optional)
 * 3. Create indexes
 * 4. Seed sample data
 * 5. Display summary
 */

require('dotenv').config();

const mongoose = require('mongoose');
const Lead = require('../models/Lead');
const Employee = require('../models/Employee');
const ActivityLog = require('../models/ActivityLog');
const { sampleEmployees, sampleLeads, sampleActivities } = require('./sampleData');

const logger = require('../utils/logger');
const config = require('../config/environment');

// =====================================================
// CONFIGURATION
// =====================================================

const CLEAR_EXISTING_DATA = process.env.CLEAR_DB === 'true' || false;
const MONGODB_URI = config.mongodb.uri;

// =====================================================
// CONNECTION
// =====================================================

async function connectDB() {
    try {
        await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        logger.info('✅ MongoDB Connected for seeding');
        return true;
    } catch (error) {
        logger.error('❌ MongoDB Connection Error:', error.message);
        return false;
    }
}

// =====================================================
// CLEAR DATA
// =====================================================

async function clearExistingData() {
    try {
        logger.info('🗑️  Clearing existing data...');
        await Lead.deleteMany({});
        await Employee.deleteMany({});
        await ActivityLog.deleteMany({});
        logger.info('✅ Cleared all collections');
    } catch (error) {
        logger.error('❌ Error clearing data:', error.message);
        throw error;
    }
}

// =====================================================
// SEED EMPLOYEES
// =====================================================

async function seedEmployees() {
    try {
        logger.info('👥 Seeding employees...');
        const employees = await Employee.insertMany(sampleEmployees);
        logger.info(`✅ Created ${employees.length} employees`);
        return employees;
    } catch (error) {
        logger.error('❌ Error seeding employees:', error.message);
        throw error;
    }
}

// =====================================================
// SEED LEADS
// =====================================================

async function seedLeads(employees) {
    try {
        logger.info('📋 Seeding leads...');
        const employeeIds = employees.map(e => e._id);

        // Attach employees to leads
        const leadsWithEmployees = sampleLeads.map((lead, index) => ({
            ...lead,
            assignedTo: employeeIds[index % employeeIds.length],
            createdBy: employeeIds[0],
            updatedBy: employeeIds[0]
        }));

        const leads = await Lead.insertMany(leadsWithEmployees);
        logger.info(`✅ Created ${leads.length} leads`);
        return leads;
    } catch (error) {
        logger.error('❌ Error seeding leads:', error.message);
        throw error;
    }
}

// =====================================================
// SEED ACTIVITY LOGS
// =====================================================

async function seedActivityLogs(leads, employees) {
    try {
        logger.info('📊 Seeding activity logs...');
        const leadIds = leads.map(l => l._id);
        const employeeIds = employees.map(e => e._id);

        // Attach leads and employees to activities
        const activitiesWithRefs = sampleActivities.map((activity, index) => ({
            ...activity,
            lead: leadIds[index % leadIds.length],
            employee: employeeIds[index % employeeIds.length],
            approvedBy: employeeIds[0]
        }));

        const activities = await ActivityLog.insertMany(activitiesWithRefs);
        logger.info(`✅ Created ${activities.length} activity logs`);
        return activities;
    } catch (error) {
        logger.error('❌ Error seeding activity logs:', error.message);
        throw error;
    }
}

// =====================================================
// DISPLAY SUMMARY
// =====================================================

async function displaySummary() {
    try {
        logger.info('');
        logger.info('═'.repeat(60));
        logger.info('📊 DATABASE SEEDING SUMMARY');
        logger.info('═'.repeat(60));

        const employeeCount = await Employee.countDocuments();
        const leadCount = await Lead.countDocuments();
        const activityCount = await ActivityLog.countDocuments();

        logger.info(`\n📊 Document Counts:`);
        logger.info(`  • Employees: ${employeeCount}`);
        logger.info(`  • Leads: ${leadCount}`);
        logger.info(`  • Activity Logs: ${activityCount}`);

        // Lead Status Distribution
        const statusDistribution = await Lead.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);
        logger.info(`\n📈 Lead Status Distribution:`);
        statusDistribution.forEach(stat => {
            logger.info(`  • ${stat._id}: ${stat.count}`);
        });

        // Top Performers
        const topPerformers = await Employee.getTopPerformers(3);
        logger.info(`\n⭐ Top Performing Employees:`);
        topPerformers.forEach((emp, index) => {
            logger.info(`  ${index + 1}. ${emp.fullName} - ${emp.conversionRate.toFixed(1)}% conversion`);
        });

        // Recent Activities
        const recentActivities = await ActivityLog.find()
            .populate('lead', 'firstName lastName')
            .populate('employee', 'firstName lastName')
            .sort({ actualDate: -1 })
            .limit(5);
        logger.info(`\n🔔 Recent Activities:`);
        recentActivities.forEach((activity, index) => {
            logger.info(`  ${index + 1}. ${activity.type} - ${activity.subject}`);
        });

        logger.info(`\n✅ Database Seeding Completed Successfully!`);
        logger.info('═'.repeat(60));
        logger.info('\n💡 API Endpoints Ready:');
        logger.info(`  • GET  http://localhost:3000/api/v1/leads`);
        logger.info(`  • GET  http://localhost:3000/api/v1/employees`);
        logger.info(`  • GET  http://localhost:3000/api/v1/activities`);
        logger.info('═'.repeat(60) + '\n');
    } catch (error) {
        logger.error('❌ Error displaying summary:', error.message);
    }
}

// =====================================================
// MAIN EXECUTION
// =====================================================

async function main() {
    let connection;
    try {
        // Connect to database
        const connected = await connectDB();
        if (!connected) {
            logger.error('❌ Failed to connect to database');
            process.exit(1);
        }

        // Clear existing data if requested
        if (CLEAR_EXISTING_DATA) {
            await clearExistingData();
        } else {
            logger.info('⏭️  Skipping data clear (use CLEAR_DB=true to clear)');
        }

        // Seed data
        logger.info('');
        logger.info('═'.repeat(60));
        logger.info('🌱 STARTING DATABASE SEEDING');
        logger.info('═'.repeat(60) + '\n');

        const employees = await seedEmployees();
        const leads = await seedLeads(employees);
        const activities = await seedActivityLogs(leads, employees);

        // Display summary
        await displaySummary();

        // Disconnect
        await mongoose.disconnect();
        logger.info('✅ Disconnected from MongoDB');
        process.exit(0);
    } catch (error) {
        logger.error('\n❌ SEEDING FAILED');
        logger.error('Error:', error.message);
        if (connection) {
            await mongoose.disconnect();
        }
        process.exit(1);
    }
}

// =====================================================
// EXECUTE IF RUN DIRECTLY
// =====================================================

if (require.main === module) {
    main();
}

module.exports = {
    connectDB,
    clearExistingData,
    seedEmployees,
    seedLeads,
    seedActivityLogs,
    displaySummary
};
