/**
 * Sample Data for Models
 * Use this for testing and database seeding
 */

// =====================================================
// EMPLOYEE SAMPLE DATA
// =====================================================

const sampleEmployees = [{
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@company.com',
        phone: '+1-555-987-6543',
        mobile: '+1-555-123-0000',
        password: 'SecurePassword123!',
        employeeId: 'EMP-0001',
        role: 'SENIOR_AGENT',
        department: 'Sales',
        team: 'Team A',
        joinDate: new Date('2024-01-15'),
        designation: 'Senior Sales Agent',
        status: 'Active',
        timezone: 'America/New_York',
        language: 'en',
        totalLeadsAssigned: 45,
        convertedLeads: 18,
        lostLeads: 8,
        conversionRate: 40,
        averageDealValue: 625000,
        address: {
            street: '456 Oak Avenue',
            city: 'New York',
            state: 'NY',
            zipCode: '10002',
            country: 'USA'
        },
        notificationPreferences: {
            email: true,
            sms: true,
            push: true
        }
    },
    {
        firstName: 'Mike',
        lastName: 'Johnson',
        email: 'mike.johnson@company.com',
        phone: '+1-555-456-7890',
        mobile: '+1-555-234-5678',
        password: 'MikePass@2024',
        employeeId: 'EMP-0002',
        role: 'JUNIOR_AGENT',
        department: 'Sales',
        team: 'Team A',
        joinDate: new Date('2025-06-01'),
        designation: 'Junior Sales Agent',
        status: 'Active',
        timezone: 'America/Chicago',
        language: 'en',
        totalLeadsAssigned: 25,
        convertedLeads: 8,
        lostLeads: 5,
        conversionRate: 32,
        averageDealValue: 450000,
        address: {
            street: '789 Elm Street',
            city: 'Chicago',
            state: 'IL',
            zipCode: '60601',
            country: 'USA'
        }
    },
    {
        firstName: 'Sarah',
        lastName: 'Williams',
        email: 'sarah.williams@company.com',
        phone: '+1-555-321-0987',
        mobile: '+1-555-345-6789',
        password: 'SarahW@2024',
        employeeId: 'EMP-0003',
        role: 'MANAGER',
        department: 'Sales',
        team: 'Team A',
        joinDate: new Date('2022-03-10'),
        designation: 'Sales Manager',
        status: 'Active',
        timezone: 'America/Los_Angeles',
        language: 'en',
        totalLeadsAssigned: 150,
        convertedLeads: 65,
        lostLeads: 20,
        conversionRate: 43.3,
        averageDealValue: 700000,
        address: {
            street: '321 Pine Road',
            city: 'Los Angeles',
            state: 'CA',
            zipCode: '90001',
            country: 'USA'
        }
    }
];

// =====================================================
// LEAD SAMPLE DATA
// =====================================================

const sampleLeads = [{
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+1-555-123-4567',
        source: 'WEBSITE',
        campaign: 'Summer Campaign 2026',
        propertyId: 'PROP-001',
        propertyType: 'Residential',
        status: 'QUALIFIED',
        priority: 'HIGH',
        location: {
            address: '123 Main Street',
            city: 'New York',
            state: 'NY',
            zipCode: '10001',
            country: 'USA',
            coordinates: {
                latitude: 40.7128,
                longitude: -74.0060
            }
        },
        budgetMin: 500000,
        budgetMax: 1000000,
        conversionStatus: 'In Progress',
        notes: 'Interested in 3BHK apartment near Central Park. Budget confirmed.',
        tags: ['urgent', 'high-value', 'furnished']
    },
    {
        firstName: 'Emma',
        lastName: 'Johnson',
        email: 'emma.johnson@example.com',
        phone: '+1-555-234-5678',
        source: 'GOOGLE_ADS',
        campaign: 'Digital Marketing Q2 2026',
        propertyId: 'PROP-002',
        propertyType: 'Commercial',
        status: 'CONTACTED',
        priority: 'MEDIUM',
        location: {
            address: '456 Business Park',
            city: 'Chicago',
            state: 'IL',
            zipCode: '60601',
            country: 'USA',
            coordinates: {
                latitude: 41.8781,
                longitude: -87.6298
            }
        },
        budgetMin: 2000000,
        budgetMax: 5000000,
        conversionStatus: 'In Progress',
        notes: 'Looking for commercial space for tech startup. Growth stage company.',
        tags: ['commercial', 'tech', 'startup']
    },
    {
        firstName: 'Robert',
        lastName: 'Brown',
        email: 'robert.brown@example.com',
        phone: '+1-555-345-6789',
        source: 'REFERRAL',
        campaign: 'Referral Program',
        propertyId: 'PROP-003',
        propertyType: 'Residential',
        status: 'IN_NEGOTIATION',
        priority: 'CRITICAL',
        location: {
            address: '789 Beverly Hills Road',
            city: 'Los Angeles',
            state: 'CA',
            zipCode: '90210',
            country: 'USA',
            coordinates: {
                latitude: 34.0522,
                longitude: -118.2437
            }
        },
        budgetMin: 3000000,
        budgetMax: 8000000,
        conversionStatus: 'In Progress',
        notes: 'High net-worth individual. Luxury property buyer. Quick closure expected.',
        tags: ['vip', 'luxury', 'referral', 'fast-track']
    },
    {
        firstName: 'Lisa',
        lastName: 'Martinez',
        email: 'lisa.martinez@example.com',
        phone: '+1-555-456-7890',
        source: 'CALL',
        campaign: 'Outbound Campaign',
        propertyId: 'PROP-004',
        propertyType: 'Residential',
        status: 'NEW_LEAD',
        priority: 'LOW',
        location: {
            address: '321 Sunset Avenue',
            city: 'Miami',
            state: 'FL',
            zipCode: '33101',
            country: 'USA',
            coordinates: {
                latitude: 25.7617,
                longitude: -80.1918
            }
        },
        budgetMin: 200000,
        budgetMax: 500000,
        conversionStatus: 'In Progress',
        notes: 'First-time homebuyer. Needs finance consultation.',
        tags: ['first-time-buyer', 'finance-needed']
    },
    {
        firstName: 'David',
        lastName: 'Wilson',
        email: 'david.wilson@example.com',
        phone: '+1-555-567-8901',
        source: 'WALK_IN',
        campaign: 'Showroom Campaign',
        propertyId: 'PROP-005',
        propertyType: 'Residential',
        status: 'CONVERTED',
        priority: 'HIGH',
        location: {
            address: '654 Beach Road',
            city: 'San Diego',
            state: 'CA',
            zipCode: '92101',
            country: 'USA',
            coordinates: {
                latitude: 32.7157,
                longitude: -117.1611
            }
        },
        budgetMin: 1000000,
        budgetMax: 2500000,
        conversionStatus: 'Converted',
        conversionValue: 1800000,
        notes: 'Successfully converted. Property purchased last week.',
        tags: ['converted', 'successful-sale']
    }
];

// =====================================================
// ACTIVITY LOG SAMPLE DATA
// =====================================================

const sampleActivities = [{
        type: 'CALL',
        subject: 'Initial Property Inquiry',
        description: 'Customer called inquiring about 3BHK apartment in Central Park area',
        contactMethod: 'Phone',
        direction: 'Inbound',
        status: 'Completed',
        sentiment: 'Positive',
        engagementScore: 85,
        metadata: {
            duration: 15,
            outcome: 'Successful',
            nextFollowUp: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
        },
        notes: 'Customer very interested. Budget 800K-1M. Prefers modern amenities.',
        tags: ['follow-up', 'hot-lead'],
        requiresFollowUp: true,
        followUpDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        followUpType: 'Meeting',
        actualDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    },
    {
        type: 'MEETING',
        subject: 'Site Visit - Property Walkthrough',
        description: 'Visited 3 properties in Manhattan. Customer interested in PROP-001',
        contactMethod: 'In-Person',
        direction: 'Outbound',
        status: 'Completed',
        sentiment: 'Positive',
        engagementScore: 90,
        metadata: {
            duration: 120,
            location: 'Manhattan, NYC',
            outcome: 'Successful',
            attendees: ['John Doe', 'Jane Smith', 'Property Manager'],
            nextFollowUp: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
        },
        notes: 'Customer loved PROP-001. Ready to make offer.',
        internalNotes: 'Move to negotiation stage. Discuss pricing.',
        tags: ['site-visit', 'negotiation-ready'],
        leadStatusBefore: 'QUALIFIED',
        leadStatusAfter: 'IN_NEGOTIATION',
        requiresFollowUp: true,
        followUpDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        followUpType: 'Call',
        actualDate: new Date(Date.now() - 12 * 60 * 60 * 1000)
    },
    {
        type: 'EMAIL',
        subject: 'Commercial Space Proposal',
        description: 'Sent detailed proposal for commercial space in Business Park',
        contactMethod: 'Email',
        direction: 'Outbound',
        status: 'Completed',
        sentiment: 'Neutral',
        engagementScore: 60,
        metadata: {
            outcome: 'Successful',
            attachments: [{
                name: 'Commercial_Space_Proposal.pdf',
                url: '/documents/proposals/commercial-001.pdf',
                type: 'application/pdf'
            }],
            nextFollowUp: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        },
        notes: 'Sent comprehensive proposal with floor plans and pricing',
        requiresFollowUp: true,
        followUpDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        followUpType: 'Call',
        actualDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    },
    {
        type: 'TASK',
        subject: 'Finance Consultation Required',
        description: 'Lisa Martinez needs mortgage and finance consultation',
        contactMethod: 'Phone',
        direction: 'Outbound',
        status: 'Scheduled',
        sentiment: 'Neutral',
        engagementScore: 50,
        metadata: {
            duration: 60,
            outcome: 'Scheduled'
        },
        notes: 'Arrange call with finance team',
        requiresFollowUp: false,
        scheduledFor: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        actualDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
    },
    {
        type: 'CALL',
        subject: 'Follow-up on Converted Lead',
        description: 'Post-sale follow-up call with David Wilson',
        contactMethod: 'Phone',
        direction: 'Outbound',
        status: 'Completed',
        sentiment: 'Positive',
        engagementScore: 95,
        metadata: {
            duration: 20,
            outcome: 'Successful'
        },
        notes: 'Customer extremely satisfied. Considering referrals.',
        tags: ['follow-up', 'referral-opportunity'],
        leadStatusBefore: 'CONVERTED',
        leadStatusAfter: 'CONVERTED',
        actualDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    }
];

// =====================================================
// EXPORT SAMPLE DATA
// =====================================================

module.exports = {
    sampleEmployees,
    sampleLeads,
    sampleActivities
};

// =====================================================
// USAGE IN TESTS
// =====================================================
/*
const { sampleEmployees, sampleLeads, sampleActivities } = require('./sampleData');

// Create test employees
const employees = await Employee.insertMany(sampleEmployees);
const employeeIds = employees.map(e => e._id);

// Create test leads with assigned employee
const leadsWithEmployees = sampleLeads.map((lead, index) => ({
  ...lead,
  assignedTo: employeeIds[index % employeeIds.length],
  createdBy: employeeIds[0]
}));
const leads = await Lead.insertMany(leadsWithEmployees);
const leadIds = leads.map(l => l._id);

// Create activity logs with lead and employee references
const activitiesWithRefs = sampleActivities.map((activity, index) => ({
  ...activity,
  lead: leadIds[index % leadIds.length],
  employee: employeeIds[index % employeeIds.length]
}));
const activities = await ActivityLog.insertMany(activitiesWithRefs);
*/
