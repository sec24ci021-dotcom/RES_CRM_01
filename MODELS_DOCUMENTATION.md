# Mongoose Models Documentation

Complete reference for Lead, Employee, and Activity Log models with validation rules, enums, and sample JSON.

---

## 1. Lead Model

### Overview
Core model for managing real estate leads with comprehensive tracking and status management.

### Schema Fields

#### Contact Information
- **firstName** (String, Required)
  - Min: 2 characters
  - Max: 50 characters
  - Auto-trimmed

- **lastName** (String, Required)
  - Min: 2 characters
  - Max: 50 characters
  - Auto-trimmed

- **email** (String, Required, Unique)
  - Validation: RFC email format
  - Indexed for fast lookup
  - Lowercase conversion

- **phone** (String, Required)
  - Validation: International format (10+ digits)
  - Indexed for search
  - Regex: `/^\+?[0-9\s\-()]{10,}$/`

#### Lead Classification
- **status** (String, Enum)
  - Default: `NEW_LEAD`
  - Allowed values:
    - `NEW_LEAD` - Newly captured lead
    - `CONTACTED` - Initial contact made
    - `QUALIFIED` - Lead meets criteria
    - `IN_NEGOTIATION` - Under discussion
    - `CONVERTED` - Successful conversion
    - `LOST` - Did not convert
    - `INACTIVE` - No longer active

- **source** (String, Required, Enum)
  - Allowed values:
    - `WEBSITE`
    - `FACEBOOK`
    - `GOOGLE_ADS`
    - `REFERRAL`
    - `WALK_IN`
    - `CALL`
    - `EMAIL`

- **priority** (String, Enum)
  - Default: `MEDIUM`
  - Allowed values:
    - `LOW`
    - `MEDIUM`
    - `HIGH`
    - `CRITICAL`

#### Campaign & Property
- **campaign** (String, Optional)
  - Indexed for filtering
  - Max: 100 characters (implicit)

- **propertyId** (String, Optional)
  - Reference to property
  - Indexed for search

#### Assignment
- **assignedTo** (ObjectId, Optional)
  - References: Employee model
  - Indexed for quick assignment lookup
  - Default: null

#### Property Information
- **propertyType** (String, Enum)
  - Default: `Residential`
  - Allowed values:
    - `Residential`
    - `Commercial`
    - `Industrial`
    - `Agricultural`

- **location** (Object)
  - address (String)
  - city (String)
  - state (String)
  - zipCode (String)
  - country (String)
  - coordinates (Object)
    - latitude (Number)
    - longitude (Number)

#### Budget Information
- **budgetMin** (Number)
  - Min: 0
  - Default: 0

- **budgetMax** (Number)
  - Min: 0
  - Default: 0
  - Validation: Must be >= budgetMin

#### Conversion Tracking
- **conversionStatus** (String, Enum)
  - Default: `In Progress`
  - Allowed values:
    - `In Progress`
    - `Converted`
    - `Abandoned`

- **conversionValue** (Number)
  - Min: 0
  - Default: 0

#### Additional Fields
- **notes** (String)
  - Max: 1000 characters

- **tags** (Array of Strings)
  - Custom categorization

- **customFields** (Mixed)
  - Flexible field storage

#### Audit Trail
- **createdBy** (ObjectId)
  - References: Employee model

- **updatedBy** (ObjectId)
  - References: Employee model

- **createdAt** (DateTime)
  - Auto-generated

- **updatedAt** (DateTime)
  - Auto-generated

- **isDeleted** (Boolean)
  - Default: false
  - Supports soft delete

- **deletedAt** (DateTime)
  - Date of deletion

### Validation Rules
```javascript
// Budget validation
- Minimum budget cannot exceed maximum budget
- Both must be non-negative

// Email validation
- Must be unique
- Must match RFC format

// Phone validation
- Must be 10+ digits with optional + prefix
- Allows spaces, hyphens, parentheses for formatting
```

### Indexes
```javascript
// Single field indexes
- email (unique)
- phone
- status
- source
- priority
- assignedTo
- conversionStatus
- isDeleted
- createdAt

// Compound indexes
- email + phone
- status + assignedTo
- source + priority
- city

// Text search index
- firstName, lastName, email, phone, notes
```

### Instance Methods
```javascript
lead.softDelete()         // Soft delete the lead
lead.restore()           // Restore deleted lead
lead.convert(value)      // Convert lead (set status to CONVERTED)
lead.abandon()           // Mark lead as abandoned
lead.fullName            // Virtual: "FirstName LastName"
```

### Static Methods
```javascript
Lead.findActive()                           // Get all non-deleted leads
Lead.findByStatus(status)                   // Find leads by status
Lead.searchLeads(searchTerm, options)       // Full-text search
```

### Sample JSON

#### Create Lead Request
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "phone": "+1-555-123-4567",
  "source": "WEBSITE",
  "campaign": "Summer Campaign 2026",
  "propertyId": "PROP-001",
  "propertyType": "Residential",
  "status": "NEW_LEAD",
  "priority": "HIGH",
  "assignedTo": "507f1f77bcf86cd799439011",
  "location": {
    "address": "123 Main Street",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA",
    "coordinates": {
      "latitude": 40.7128,
      "longitude": -74.0060
    }
  },
  "budgetMin": 500000,
  "budgetMax": 1000000,
  "notes": "Interested in 3BHK apartment near Central Park",
  "tags": ["urgent", "high-value"]
}
```

#### Lead Response
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "firstName": "John",
  "lastName": "Doe",
  "fullName": "John Doe",
  "email": "john.doe@example.com",
  "phone": "+1-555-123-4567",
  "source": "WEBSITE",
  "campaign": "Summer Campaign 2026",
  "propertyId": "PROP-001",
  "propertyType": "Residential",
  "status": "NEW_LEAD",
  "priority": "HIGH",
  "assignedTo": {
    "_id": "507f1f77bcf86cd799439011",
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "jane.smith@company.com",
    "role": "SENIOR_AGENT"
  },
  "location": {
    "address": "123 Main Street",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA",
    "coordinates": {
      "latitude": 40.7128,
      "longitude": -74.0060
    }
  },
  "budgetMin": 500000,
  "budgetMax": 1000000,
  "conversionStatus": "In Progress",
  "conversionValue": 0,
  "notes": "Interested in 3BHK apartment near Central Park",
  "tags": ["urgent", "high-value"],
  "createdAt": "2026-06-15T18:11:52.252Z",
  "updatedAt": "2026-06-15T18:11:52.252Z",
  "isDeleted": false
}
```

---

## 2. Employee Model

### Overview
Represents company employees/agents managing leads with role-based access and performance tracking.

### Schema Fields

#### Personal Information
- **firstName** (String, Required)
  - Min: 2 characters
  - Max: 50 characters

- **lastName** (String, Required)
  - Min: 2 characters
  - Max: 50 characters

- **email** (String, Required, Unique)
  - Validation: RFC email format
  - Indexed
  - Lowercase conversion

- **phone** (String, Required)
  - Validation: International format (10+ digits)

- **mobile** (String, Optional)
  - Validation: International format (10+ digits)

#### Authentication
- **password** (String, Required, Select: false)
  - Min: 8 characters
  - Auto-hashed with bcryptjs
  - Not returned in queries by default

#### Role & Permissions
- **role** (String, Required, Enum)
  - Default: `JUNIOR_AGENT`
  - Allowed values:
    - `JUNIOR_AGENT` - New agents, supervised
    - `SENIOR_AGENT` - Experienced, independent
    - `MANAGER` - Team lead, supervises agents
    - `DIRECTOR` - Department head
    - `ADMIN` - System administration

- **permissions** (Array of Strings)
  - Custom permission list

#### Department & Team
- **department** (String, Enum)
  - Default: `Sales`
  - Allowed values:
    - `Sales`
    - `Management`
    - `Support`
    - `Admin`

- **team** (String, Optional)
  - Team assignment

- **reportingTo** (ObjectId, Optional)
  - References: Employee (Manager)

#### Performance Metrics
- **totalLeadsAssigned** (Number)
  - Default: 0
  - Min: 0

- **convertedLeads** (Number)
  - Default: 0
  - Min: 0

- **lostLeads** (Number)
  - Default: 0
  - Min: 0

- **conversionRate** (Number)
  - Default: 0
  - Min: 0
  - Max: 100
  - Calculated: (convertedLeads / totalLeadsAssigned) * 100

- **averageDealValue** (Number)
  - Default: 0
  - Min: 0

#### Account Status
- **status** (String, Enum)
  - Default: `Active`
  - Allowed values:
    - `Active`
    - `Inactive`
    - `On Leave`
    - `Suspended`

- **isOnline** (Boolean)
  - Default: false

- **lastLogin** (DateTime)

#### Profile
- **profileImage** (String)
  - URL or file path

- **bio** (String)
  - Max: 500 characters

- **address** (Object)
  - street (String)
  - city (String)
  - state (String)
  - zipCode (String)
  - country (String)

#### Employment Details
- **employeeId** (String, Unique)
  - Company employee ID

- **joinDate** (DateTime)

- **designation** (String)

- **salary** (Number, Select: false)
  - Not returned in queries by default

#### Settings & Preferences
- **timezone** (String)
  - Default: `UTC`

- **language** (String)
  - Default: `en`

- **notificationPreferences** (Object)
  - email (Boolean) - Default: true
  - sms (Boolean) - Default: true
  - push (Boolean) - Default: true

#### Audit
- **createdBy** (ObjectId)
  - References: Employee

- **updatedBy** (ObjectId)
  - References: Employee

- **createdAt** (DateTime)
- **updatedAt** (DateTime)

### Validation Rules
```javascript
// Email must be unique and valid RFC format
// Password must be minimum 8 characters (auto-hashed)
// Phone must be 10+ digits
// Conversion rate max 100%
```

### Indexes
```javascript
// Single field indexes
- email (unique)
- role
- status
- department
- employeeId (unique)
- createdAt

// Compound indexes
- email + isDeleted
- role + status
```

### Instance Methods
```javascript
employee.comparePassword(password)           // Verify password
employee.getPublicProfile()                  // Get non-sensitive data
employee.softDelete()                        // Soft delete
employee.restore()                           // Restore deleted
employee.updateMetrics(conversionCount, total) // Update performance
employee.fullName                            // Virtual: "FirstName LastName"
employee.displayName                         // Virtual: "FirstName LastName (ROLE)"
```

### Static Methods
```javascript
Employee.findActive()                        // Get active employees
Employee.findByEmailWithPassword(email)      // For login
Employee.findByRole(role)                    // Find by role
Employee.findByDepartment(department)        // Find by department
Employee.getTopPerformers(limit)             // Best conversion rates
```

### Sample JSON

#### Create Employee Request
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane.smith@company.com",
  "phone": "+1-555-987-6543",
  "mobile": "+1-555-123-0000",
  "password": "SecurePassword123!",
  "employeeId": "EMP-0001",
  "role": "SENIOR_AGENT",
  "department": "Sales",
  "team": "Team A",
  "joinDate": "2024-01-15",
  "designation": "Senior Sales Agent",
  "timezone": "America/New_York",
  "language": "en",
  "address": {
    "street": "456 Oak Avenue",
    "city": "New York",
    "state": "NY",
    "zipCode": "10002",
    "country": "USA"
  },
  "notificationPreferences": {
    "email": true,
    "sms": true,
    "push": true
  }
}
```

#### Employee Response
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "firstName": "Jane",
  "lastName": "Smith",
  "fullName": "Jane Smith",
  "displayName": "Jane Smith (SENIOR_AGENT)",
  "email": "jane.smith@company.com",
  "phone": "+1-555-987-6543",
  "mobile": "+1-555-123-0000",
  "employeeId": "EMP-0001",
  "role": "SENIOR_AGENT",
  "department": "Sales",
  "team": "Team A",
  "status": "Active",
  "isOnline": true,
  "lastLogin": "2026-06-15T18:11:52.252Z",
  "joinDate": "2024-01-15",
  "designation": "Senior Sales Agent",
  "totalLeadsAssigned": 45,
  "convertedLeads": 18,
  "lostLeads": 8,
  "conversionRate": 40,
  "averageDealValue": 625000,
  "timezone": "America/New_York",
  "language": "en",
  "address": {
    "street": "456 Oak Avenue",
    "city": "New York",
    "state": "NY",
    "zipCode": "10002",
    "country": "USA"
  },
  "notificationPreferences": {
    "email": true,
    "sms": true,
    "push": true
  },
  "createdAt": "2024-01-15T10:00:00.000Z",
  "updatedAt": "2026-06-15T18:11:52.252Z"
}
```

---

## 3. Activity Log Model

### Overview
Tracks all interactions and activities related to leads for comprehensive audit trails and engagement tracking.

### Schema Fields

#### Reference Information
- **lead** (ObjectId, Required)
  - References: Lead model
  - Indexed for quick filtering

- **employee** (ObjectId, Required)
  - References: Employee model

#### Activity Details
- **type** (String, Required, Enum)
  - Allowed values:
    - `CALL` - Phone call
    - `EMAIL` - Email communication
    - `MEETING` - In-person/virtual meeting
    - `SITE_VISIT` - Property visit
    - `NOTE` - Internal note
    - `TASK` - Activity task
    - `DOCUMENT` - Document upload
    - `STATUS_CHANGE` - Lead status update

- **subject** (String, Required)
  - Max: 200 characters

- **description** (String)
  - Max: 2000 characters

#### Activity Metadata
- **metadata** (Object)
  - duration (Number) - minutes for calls/meetings
  - location (String)
  - attendees (Array)
  - outcome (String) - Successful | Unsuccessful | Rescheduled | Cancelled
  - nextFollowUp (DateTime)
  - callRecording (String) - URL or path
  - attachments (Array)
    - name (String)
    - url (String)
    - type (String)
    - uploadedAt (DateTime)

#### Interaction Details
- **contactMethod** (String, Enum)
  - Default: `Phone`
  - Allowed values:
    - `Phone`
    - `Email`
    - `In-Person`
    - `Video Call`
    - `WhatsApp`
    - `SMS`
    - `Other`

- **direction** (String, Enum)
  - Default: `Outbound`
  - Allowed values:
    - `Inbound`
    - `Outbound`

- **status** (String, Enum)
  - Default: `Completed`
  - Allowed values:
    - `Completed`
    - `Scheduled`
    - `Pending`
    - `Cancelled`

#### Notes & Comments
- **notes** (String)
  - Max: 1000 characters

- **internalNotes** (String)
  - Max: 1000 characters

- **tags** (Array)
  - Custom categorization

#### Lead Status Updates
- **leadStatusBefore** (String)
  - Previous status

- **leadStatusAfter** (String)
  - New status

- **leadPriorityBefore** (String)
- **leadPriorityAfter** (String)

#### Engagement Metrics
- **sentiment** (String, Enum)
  - Default: `Neutral`
  - Allowed values:
    - `Positive`
    - `Neutral`
    - `Negative`

- **engagementScore** (Number)
  - Min: 0
  - Max: 100
  - Default: 50

#### Scheduling
- **scheduledFor** (DateTime)

- **actualDate** (DateTime)
  - Default: now

- **duration** (Number)
  - Minutes

#### Follow-up Tracking
- **requiresFollowUp** (Boolean)
  - Default: false

- **followUpDate** (DateTime)

- **followUpType** (String, Enum)
  - Allowed values:
    - `Call`
    - `Email`
    - `Meeting`
    - `Site Visit`
    - `Other`

#### Approval & Visibility
- **isPublic** (Boolean)
  - Default: true

- **approvalStatus** (String, Enum)
  - Default: `Approved`
  - Allowed values:
    - `Pending`
    - `Approved`
    - `Rejected`

- **approvedBy** (ObjectId)
  - References: Employee

#### Audit
- **createdAt** (DateTime)
- **updatedAt** (DateTime)
- **isDeleted** (Boolean)

### Indexes
```javascript
// Primary indexes
- lead + createdAt (DESC)
- employee + type
- type + status
- actualDate (DESC)
- followUpDate

// Compound indexes
- lead + type + status

// Text search
- subject, description, notes
```

### Instance Methods
```javascript
activity.markCompleted(leadStatus, sentiment)     // Mark as completed
activity.scheduleFollowUp(date, type)            // Schedule follow-up
activity.addAttachment(name, url, type)          // Add attachment
activity.softDelete()                             // Soft delete
activity.isPending                                // Virtual: status === 'Pending'
activity.isCompleted                              // Virtual: status === 'Completed'
activity.isOverdue                                // Virtual: isOverdue check
```

### Static Methods
```javascript
ActivityLog.findByLead(leadId, options)           // Activities for lead
ActivityLog.findByEmployee(employeeId, options)   // Activities by employee
ActivityLog.findPending(options)                  // Get pending activities
ActivityLog.findOverdue()                         // Get overdue activities
ActivityLog.getLeadActivitySummary(leadId)        // Summary by type
ActivityLog.getEmployeeStats(empId, start, end)  // Performance stats
```

### Sample JSON

#### Create Activity Request
```json
{
  "lead": "507f1f77bcf86cd799439012",
  "employee": "507f1f77bcf86cd799439011",
  "type": "CALL",
  "subject": "Initial Property Inquiry",
  "description": "Customer called inquiring about 3BHK apartment in Central Park area",
  "contactMethod": "Phone",
  "direction": "Inbound",
  "status": "Completed",
  "sentiment": "Positive",
  "engagementScore": 85,
  "metadata": {
    "duration": 15,
    "outcome": "Successful",
    "nextFollowUp": "2026-06-18T10:00:00Z"
  },
  "notes": "Customer very interested. Budget 800K-1M. Prefers modern amenities.",
  "tags": ["follow-up", "hot-lead"],
  "requiresFollowUp": true,
  "followUpDate": "2026-06-18T10:00:00Z",
  "followUpType": "Meeting"
}
```

#### Activity Response
```json
{
  "_id": "607f1f77bcf86cd799439013",
  "lead": {
    "_id": "507f1f77bcf86cd799439012",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com"
  },
  "employee": {
    "_id": "507f1f77bcf86cd799439011",
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "jane.smith@company.com"
  },
  "type": "CALL",
  "subject": "Initial Property Inquiry",
  "description": "Customer called inquiring about 3BHK apartment in Central Park area",
  "contactMethod": "Phone",
  "direction": "Inbound",
  "status": "Completed",
  "sentiment": "Positive",
  "engagementScore": 85,
  "metadata": {
    "duration": 15,
    "outcome": "Successful",
    "nextFollowUp": "2026-06-18T10:00:00Z",
    "attachments": []
  },
  "notes": "Customer very interested. Budget 800K-1M. Prefers modern amenities.",
  "tags": ["follow-up", "hot-lead"],
  "isPending": false,
  "isCompleted": true,
  "isOverdue": false,
  "requiresFollowUp": true,
  "followUpDate": "2026-06-18T10:00:00Z",
  "followUpType": "Meeting",
  "actualDate": "2026-06-15T18:11:52.252Z",
  "createdAt": "2026-06-15T18:11:52.252Z",
  "updatedAt": "2026-06-15T18:11:52.252Z"
}
```

---

## Validation Best Practices

### Email Validation
- Required unique field
- Must match RFC 5322 format: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
- Auto-lowercase for consistency

### Phone Validation
- Regex: `/^\+?[0-9\s\-()]{10,}$/`
- Supports international formats with optional + prefix
- Allows formatting characters: spaces, hyphens, parentheses

### Enum Values
Always use the constants from `src/constants/index.js` for consistency:
```javascript
const { LEAD_STATUS, LEAD_SOURCE, LEAD_PRIORITY, EMPLOYEE_ROLE, ACTIVITY_TYPE } = require('../constants');
```

### Relationships
- Lead → Employee (via assignedTo, createdBy, updatedBy)
- Employee → Employee (via reportingTo)
- Activity Log → Lead (via lead)
- Activity Log → Employee (via employee, approvedBy)

### Soft Deletes
All models support soft delete pattern:
- `isDeleted` field (Boolean, default: false)
- `deletedAt` field (DateTime)
- Pre-find middleware excludes soft-deleted records by default

### Timestamps
All models include:
- `createdAt` - Auto-set on creation
- `updatedAt` - Auto-updated on modification

### Text Search
Models support full-text search via:
```javascript
// Lead
Lead.find({ $text: { $search: searchTerm } })

// ActivityLog
ActivityLog.find({ $text: { $search: searchTerm } })
```

---

## Query Examples

### Find Lead with Employee Details
```javascript
const lead = await Lead.findById(leadId).populate('assignedTo');
```

### Get All Activities for a Lead
```javascript
const activities = await ActivityLog.findByLead(leadId, { limit: 20, page: 1 });
```

### Find Top Performing Employees
```javascript
const topPerformers = await Employee.getTopPerformers(10);
```

### Get Employee Statistics
```javascript
const stats = await ActivityLog.getEmployeeStats(
  employeeId,
  new Date('2026-01-01'),
  new Date('2026-12-31')
);
```

### Search Leads by Text
```javascript
const results = await Lead.find({ $text: { $search: 'john apartment' } });
```

---

## Field Constraints Summary

| Field | Type | Required | Unique | Indexed | Validation |
|-------|------|----------|--------|---------|------------|
| **Lead** | | | | | |
| firstName | String | ✓ | | | 2-50 chars |
| lastName | String | ✓ | | | 2-50 chars |
| email | String | ✓ | ✓ | ✓ | RFC format |
| phone | String | ✓ | | ✓ | 10+ digits |
| status | String | | | ✓ | Enum |
| source | String | ✓ | | ✓ | Enum |
| campaign | String | | | ✓ | String |
| propertyId | String | | | ✓ | String |
| assignedTo | ObjectId | | | ✓ | Ref to Employee |
| | | | | | |
| **Employee** | | | | | |
| firstName | String | ✓ | | | 2-50 chars |
| lastName | String | ✓ | | | 2-50 chars |
| email | String | ✓ | ✓ | ✓ | RFC format |
| phone | String | ✓ | | | 10+ digits |
| password | String | ✓ | | | 8+ chars (hashed) |
| role | String | ✓ | | ✓ | Enum |
| status | String | | | ✓ | Enum |
| | | | | | |
| **ActivityLog** | | | | | |
| lead | ObjectId | ✓ | | ✓ | Ref to Lead |
| employee | ObjectId | ✓ | | ✓ | Ref to Employee |
| type | String | ✓ | | ✓ | Enum |
| subject | String | ✓ | | | 1-200 chars |
| status | String | | | ✓ | Enum |
| sentiment | String | | | | Enum |
