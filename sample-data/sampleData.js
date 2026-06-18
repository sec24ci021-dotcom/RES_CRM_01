/**
 * Sample Master Data for Lead Management System
 * Run this script to populate master data into MongoDB
 */

// Sample Lead Statuses
const sampleLeadStatuses = [{
        name: 'New Lead',
        code: 'NEW_LEAD',
        description: 'Newly created lead, not yet contacted',
        color: '#3498db',
        stage: 'DISCOVERY',
        order: 1,
        isActive: true
    },
    {
        name: 'Contacted',
        code: 'CONTACTED',
        description: 'Lead has been contacted, awaiting response',
        color: '#f39c12',
        stage: 'QUALIFICATION',
        order: 2,
        isActive: true
    },
    {
        name: 'Attempted Call',
        code: 'ATTEMPTED_CALL',
        description: 'Attempted to reach lead by phone',
        color: '#f1c40f',
        stage: 'DISCOVERY',
        order: 2.5,
        isActive: true
    },
    {
        name: 'Connected',
        code: 'CONNECTED',
        description: 'Successfully connected with lead',
        color: '#16a085',
        stage: 'QUALIFICATION',
        order: 3,
        isActive: true
    },
    {
        name: 'Interested',
        code: 'INTERESTED',
        description: 'Lead expressed interest in offering',
        color: '#2ecc71',
        stage: 'QUALIFICATION',
        order: 4,
        isActive: true
    },
    {
        name: 'Qualified',
        code: 'QUALIFIED',
        description: 'Lead meets qualification criteria',
        color: '#2ecc71',
        stage: 'QUALIFICATION',
        order: 3,
        isActive: true
    },
    {
        name: 'Site Visit Scheduled',
        code: 'SITE_VISIT_SCHEDULED',
        description: 'A site visit has been scheduled with the lead',
        color: '#3498db',
        stage: 'QUALIFICATION',
        order: 4.5,
        isActive: true
    },
    {
        name: 'Site Visit Completed',
        code: 'SITE_VISIT_COMPLETED',
        description: 'Site visit completed',
        color: '#2980b9',
        stage: 'QUALIFICATION',
        order: 5,
        isActive: true
    },
    {
        name: 'In Negotiation',
        code: 'IN_NEGOTIATION',
        description: 'Negotiation in progress with lead',
        color: '#9b59b6',
        stage: 'NEGOTIATION',
        order: 4,
        isActive: true
    },
    {
        name: 'Booked',
        code: 'BOOKED',
        description: 'Lead has booked the service/property',
        color: '#8e44ad',
        stage: 'NEGOTIATION',
        order: 5.5,
        isActive: true
    },
    {
        name: 'Converted',
        code: 'CONVERTED',
        description: 'Lead successfully converted to customer',
        color: '#27ae60',
        stage: 'CLOSURE',
        order: 5,
        isActive: true
    },
    {
        name: 'Sold',
        code: 'SOLD',
        description: 'Lead resulted in a sale',
        color: '#27ae60',
        stage: 'CLOSURE',
        order: 6,
        isActive: true
    },
    {
        name: 'Lost Lead',
        code: 'LOST_LEAD',
        description: 'Lead lost to competition or no interest',
        color: '#e74c3c',
        stage: 'CLOSURE',
        order: 6,
        isActive: true
    },
    {
        name: 'Inactive',
        code: 'INACTIVE',
        description: 'Lead is inactive, no response',
        color: '#7f8c8d',
        stage: 'POST_SALE',
        order: 7,
        isActive: true
    }
];

// Sample Lead Sources
const sampleLeadSources = [{
        name: 'Company Website',
        code: 'WEBSITE',
        description: 'Leads from company website',
        channel: 'WEBSITE',
        costPerLead: 50,
        conversionRate: 15,
        isActive: true
    },
    {
        name: 'Facebook',
        code: 'FACEBOOK',
        description: 'Leads from Facebook advertisements',
        channel: 'SOCIAL_MEDIA',
        costPerLead: 25,
        conversionRate: 12,
        isActive: true
    },
    {
        name: 'Google Ads',
        code: 'GOOGLE_ADS',
        description: 'Leads from Google AdWords',
        channel: 'ADVERTISEMENT',
        costPerLead: 35,
        conversionRate: 18,
        isActive: true
    },
    {
        name: 'Referral',
        code: 'REFERRAL',
        description: 'Leads from customer referrals',
        channel: 'REFERRAL',
        costPerLead: 0,
        conversionRate: 35,
        isActive: true
    },
    {
        name: 'Walk-in',
        code: 'WALK_IN',
        description: 'Direct walk-in customers',
        channel: 'WALK_IN',
        costPerLead: 0,
        conversionRate: 25,
        isActive: true
    },
    {
        name: 'Direct Call',
        code: 'DIRECT_CALL',
        description: 'Leads from inbound calls',
        channel: 'CALL',
        costPerLead: 0,
        conversionRate: 30,
        isActive: true
    },
    {
        name: 'Email Campaign',
        code: 'EMAIL_CAMPAIGN',
        description: 'Leads from email marketing campaigns',
        channel: 'EMAIL',
        costPerLead: 5,
        conversionRate: 8,
        isActive: true
    }
];

// Sample Company
const sampleCompanies = [{
        name: 'Elite Real Estate Solutions',
        email: 'info@elitereal.com',
        phone: '+91-9876543210',
        address: {
            street: '123 Commercial Street',
            city: 'Bangalore',
            state: 'Karnataka',
            zipCode: '560001',
            country: 'India',
            coordinates: {
                latitude: 12.9716,
                longitude: 77.5946
            }
        },
        registrationNumber: 'REG-2020-001',
        industry: 'Real Estate',
        totalEmployees: 50,
        isActive: true
    },
    {
        name: 'Prime Properties Mumbai',
        email: 'contact@primeprops.com',
        phone: '+91-9876543211',
        address: {
            street: '456 Business Park',
            city: 'Mumbai',
            state: 'Maharashtra',
            zipCode: '400001',
            country: 'India',
            coordinates: {
                latitude: 19.0760,
                longitude: 72.8777
            }
        },
        registrationNumber: 'REG-2020-002',
        industry: 'Real Estate',
        totalEmployees: 75,
        isActive: true
    }
];

// Sample Employees
const sampleEmployees = [{
        firstName: 'Rajesh',
        lastName: 'Kumar',
        email: 'rajesh.kumar@elitereal.com',
        phone: '+91-9876543220',
        role: 'JUNIOR_AGENT',
        department: 'Sales',
        specializations: ['Residential', 'Apartments'],
        totalLeadsAssigned: 25,
        totalLeadsConverted: 5,
        conversionRate: 20,
        isActive: true
    },
    {
        firstName: 'Priya',
        lastName: 'Singh',
        email: 'priya.singh@elitereal.com',
        phone: '+91-9876543221',
        role: 'SENIOR_AGENT',
        department: 'Sales',
        specializations: ['Commercial', 'Luxury Homes'],
        totalLeadsAssigned: 50,
        totalLeadsConverted: 15,
        conversionRate: 30,
        isActive: true
    },
    {
        firstName: 'Amit',
        lastName: 'Patel',
        email: 'amit.patel@elitereal.com',
        phone: '+91-9876543222',
        role: 'MANAGER',
        department: 'Sales',
        specializations: ['All'],
        totalLeadsAssigned: 0,
        totalLeadsConverted: 0,
        conversionRate: 0,
        isActive: true
    },
    {
        firstName: 'Anjali',
        lastName: 'Desai',
        email: 'anjali.desai@primeprops.com',
        phone: '+91-9876543223',
        role: 'SENIOR_AGENT',
        department: 'Sales',
        specializations: ['Residential', 'Plots'],
        totalLeadsAssigned: 45,
        totalLeadsConverted: 12,
        conversionRate: 26.67,
        isActive: true
    }
];

// Sample Leads
const sampleLeads = [{
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+91-9876543230',
        alternatePhone: '+91-9876543231',
        priority: 'HIGH',
        propertyType: ['Apartment', 'House'],
        budgetMin: 5000000,
        budgetMax: 15000000,
        location: ['Bangalore', 'Whitefield'],
        areaPreference: ['10 km radius from MG Road'],
        preferredContactMethod: 'CALL',
        communicationOptIn: true,
        notes: 'Looking for 3BHK apartment with parking. Prefers modern amenities.',
        tags: ['high-value', 'urgent', 'repeat-inquiry'],
        conversionStatus: 'CONTACTED',
        isDeleted: false
    },
    {
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah.j@example.com',
        phone: '+91-9876543232',
        priority: 'MEDIUM',
        propertyType: ['Commercial'],
        budgetMin: 25000000,
        budgetMax: 50000000,
        location: ['Mumbai', 'Bandra'],
        areaPreference: ['Business district'],
        preferredContactMethod: 'EMAIL',
        communicationOptIn: true,
        notes: 'Seeking commercial office space for startup expansion.',
        tags: ['commercial', 'startup'],
        conversionStatus: 'NEW',
        isDeleted: false
    },
    {
        firstName: 'Michael',
        lastName: 'Brown',
        email: 'mbrown@example.com',
        phone: '+91-9876543233',
        priority: 'URGENT',
        propertyType: ['Plot'],
        budgetMin: 2000000,
        budgetMax: 8000000,
        location: ['Bangalore', 'Electronic City'],
        areaPreference: ['Residential layout'],
        preferredContactMethod: 'WHATSAPP',
        communicationOptIn: true,
        notes: 'First-time investor. Needs guidance on plot selection.',
        tags: ['first-time', 'investment'],
        conversionStatus: 'CONTACTED',
        isDeleted: false
    },
    {
        firstName: 'Neha',
        lastName: 'Sharma',
        email: 'neha.sharma@example.com',
        phone: '+91-9876543234',
        priority: 'LOW',
        propertyType: ['House'],
        budgetMin: 10000000,
        budgetMax: 25000000,
        location: ['Bangalore'],
        areaPreference: ['Gated communities'],
        preferredContactMethod: 'CALL',
        communicationOptIn: true,
        notes: 'Family of 4. Looking for villa with good schools nearby.',
        tags: ['family', 'villa'],
        conversionStatus: 'CONVERTED',
        convertedValue: 18000000,
        convertedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        isDeleted: false
    }
];

// Sample Lead Activities
const sampleLeadActivities = [{
        activityType: 'CALL',
        title: 'Initial Contact Call',
        description: 'First call to discuss property preferences',
        scheduledDate: new Date(),
        completedDate: new Date(),
        status: 'COMPLETED',
        outcome: 'Lead is interested, scheduled site visit',
        nextSteps: 'Follow up after site visit',
        priority: 'HIGH'
    },
    {
        activityType: 'SITE_VISIT',
        title: 'Property Viewing - 3BHK Apartment',
        description: 'Site visit to Whitefield apartment complex',
        scheduledDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        status: 'SCHEDULED',
        priority: 'HIGH'
    },
    {
        activityType: 'PROPOSAL',
        title: 'Send Property Proposal',
        description: 'Email property details and pricing proposal',
        scheduledDate: new Date(),
        completedDate: new Date(),
        status: 'COMPLETED',
        outcome: 'Proposal sent successfully',
        nextSteps: 'Await customer response',
        priority: 'MEDIUM'
    },
    {
        activityType: 'FOLLOW_UP',
        title: 'Follow Up Call',
        description: 'Check on proposal status',
        scheduledDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        status: 'SCHEDULED',
        priority: 'MEDIUM'
    }
];

module.exports = {
    sampleLeadStatuses,
    sampleLeadSources,
    sampleCompanies,
    sampleEmployees,
    sampleLeads,
    sampleLeadActivities
};