# Lead Management Module - Database Architecture

## Project Overview
Smart Real Estate CRM Lead Management Module with complete CRUD operations, advanced search, filtering, assignment tracking, and activity history.

---

## 1. MONGODB COLLECTIONS OVERVIEW

### Core Collections
1. **leads** - Main lead information
2. **lead_statuses** - Lead status master data
3. **lead_sources** - Lead source master data (master data)
4. **employees** - Sales team members for assignment
5. **lead_activities** - Activity tracking and history
6. **lead_assignments** - Lead assignment history and audit trail
7. **lead_followups** - Follow-up scheduling
8. **companies** - Real estate companies/branches

---

## 2. DETAILED SCHEMA DESIGN

### 2.1 LEADS Collection

```
{
  _id: ObjectId,
  
  // Personal Information
  firstName: String (required, indexed),
  lastName: String (required, indexed),
  email: String (required, unique, indexed),
  phone: String (required, unique, indexed),
  alternatePhone: String,
  
  // Lead Details
  status: ObjectId (ref: lead_statuses, required, indexed),
  source: ObjectId (ref: lead_sources, required, indexed),
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' (indexed),
  
  // Assignment Information
  assignedTo: ObjectId (ref: employees, indexed),
  assignedAt: Date,
  
  // Property Preferences
  propertyType: ['Apartment', 'House', 'Commercial', 'Plot'],
  budgetMin: Number,
  budgetMax: Number,
  location: [String],
  areaPreference: [String],
  
  // Communication Preferences
  preferredContactMethod: 'CALL' | 'EMAIL' | 'SMS' | 'WHATSAPP',
  communicationOptIn: Boolean (default: true),
  
  // Additional Information
  company: ObjectId (ref: companies),
  notes: String,
  tags: [String],
  
  // Audit Fields
  createdAt: Date (indexed),
  updatedAt: Date,
  createdBy: ObjectId (ref: employees),
  
  // Soft Delete
  isDeleted: Boolean (default: false, indexed),
  deletedAt: Date,
  
  // Conversion Tracking
  conversionStatus: 'NEW' | 'CONTACTED' | 'CONVERTED' | 'LOST' | 'INACTIVE',
  convertedAt: Date,
  convertedValue: Number
}
```

### 2.2 LEAD_STATUSES Collection (Master Data)

```
{
  _id: ObjectId,
  name: String (required, unique),
  code: String (required, unique),
  description: String,
  color: String (hex code for UI),
  isActive: Boolean (default: true),
  order: Number,
  stage: 'DISCOVERY' | 'QUALIFICATION' | 'NEGOTIATION' | 'CLOSURE' | 'POST_SALE',
  createdAt: Date,
  updatedAt: Date
}
```

### 2.3 LEAD_SOURCES Collection (Master Data)

```
{
  _id: ObjectId,
  name: String (required, unique),
  code: String (required, unique),
  description: String,
  channel: 'WEBSITE' | 'SOCIAL_MEDIA' | 'REFERRAL' | 'ADVERTISEMENT' | 'WALK_IN' | 'CALL' | 'EMAIL',
  isActive: Boolean (default: true),
  costPerLead: Number,
  conversionRate: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### 2.4 EMPLOYEES Collection

```
{
  _id: ObjectId,
  firstName: String (required),
  lastName: String (required),
  email: String (required, unique),
  phone: String,
  role: 'JUNIOR_AGENT' | 'SENIOR_AGENT' | 'MANAGER' | 'DIRECTOR' | 'ADMIN',
  department: String,
  company: ObjectId (ref: companies),
  isActive: Boolean (default: true),
  specializations: [String],
  totalLeadsAssigned: Number (default: 0),
  totalLeadsConverted: Number (default: 0),
  conversionRate: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### 2.5 LEAD_ACTIVITIES Collection

```
{
  _id: ObjectId,
  lead: ObjectId (ref: leads, required, indexed),
  activityType: 'CALL' | 'EMAIL' | 'MEETING' | 'SITE_VISIT' | 'PROPOSAL' | 'FOLLOW_UP' | 'NOTE' | 'STATUS_CHANGE',
  title: String (required),
  description: String,
  
  // Activity Details
  scheduledDate: Date,
  completedDate: Date,
  status: 'SCHEDULED' | 'COMPLETED' | 'MISSED' | 'CANCELLED',
  
  // Communication Details
  outcome: String,
  nextSteps: String,
  
  // Related Information
  createdBy: ObjectId (ref: employees, required),
  relatedTo: ObjectId (ref: lead_assignments),
  
  // Metadata
  priority: 'LOW' | 'MEDIUM' | 'HIGH',
  attachments: [{
    fileName: String,
    fileUrl: String,
    uploadedAt: Date
  }],
  
  createdAt: Date (indexed),
  updatedAt: Date
}
```

### 2.6 LEAD_ASSIGNMENTS Collection

```
{
  _id: ObjectId,
  lead: ObjectId (ref: leads, required, indexed),
  assignedBy: ObjectId (ref: employees, required),
  assignedTo: ObjectId (ref: employees, required, indexed),
  
  // Assignment Details
  assignmentDate: Date (required, indexed),
  reassignmentReason: String,
  
  // Performance Tracking
  followUpStatus: 'PENDING' | 'COMPLETED' | 'MISSED',
  assignmentStatus: 'ACTIVE' | 'COMPLETED' | 'TRANSFERRED' | 'REASSIGNED',
  
  // Metadata
  notes: String,
  createdAt: Date (indexed),
  updatedAt: Date,
  
  // Soft Delete
  isActive: Boolean (default: true)
}
```

### 2.7 LEAD_FOLLOWUPS Collection

```
{
  _id: ObjectId,
  lead: ObjectId (ref: leads, required, indexed),
  assignedTo: ObjectId (ref: employees, required, indexed),
  
  // Follow-up Details
  scheduledDate: Date (required, indexed),
  title: String (required),
  description: String,
  
  // Status Tracking
  status: 'PENDING' | 'COMPLETED' | 'RESCHEDULED' | 'CANCELLED' | 'MISSED',
  completedDate: Date,
  completedNotes: String,
  
  // Reminders
  reminderSet: Boolean,
  reminderTime: Number (in minutes before scheduled date),
  
  // Metadata
  createdBy: ObjectId (ref: employees, required),
  createdAt: Date,
  updatedAt: Date
}
```

### 2.8 COMPANIES Collection

```
{
  _id: ObjectId,
  name: String (required, unique),
  email: String,
  phone: String,
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  
  // Company Details
  registrationNumber: String,
  industry: String,
  totalEmployees: Number,
  isActive: Boolean (default: true),
  
  // Metadata
  createdAt: Date,
  updatedAt: Date
}
```

---

## 3. RELATIONSHIPS BETWEEN COLLECTIONS

```
LEADS (1) -----> (1) EMPLOYEES [assignedTo]
  |
  +-----> (1) LEAD_STATUSES [status]
  |
  +-----> (1) LEAD_SOURCES [source]
  |
  +-----> (1) COMPANIES [company]
  |
  +-----> (1) EMPLOYEES [createdBy]

LEAD_ACTIVITIES -----> (1) LEADS [lead]
                |-----> (1) EMPLOYEES [createdBy]
                +-----> (1) LEAD_ASSIGNMENTS [relatedTo]

LEAD_ASSIGNMENTS -----> (1) LEADS [lead]
                  |-----> (1) EMPLOYEES [assignedBy]
                  +-----> (1) EMPLOYEES [assignedTo]

LEAD_FOLLOWUPS -----> (1) LEADS [lead]
               |-----> (1) EMPLOYEES [assignedTo]
               +-----> (1) EMPLOYEES [createdBy]

EMPLOYEES -----> (1) COMPANIES [company]
```

---

## 4. INDEXING STRATEGY

### Critical Indexes (for performance)

```javascript
// LEADS Collection
db.leads.createIndex({ email: 1 }, { unique: true })
db.leads.createIndex({ phone: 1 }, { unique: true })
db.leads.createIndex({ firstName: 1, lastName: 1 })
db.leads.createIndex({ status: 1, isDeleted: 1 }) // Filter by status
db.leads.createIndex({ assignedTo: 1, isDeleted: 1 }) // Employee's leads
db.leads.createIndex({ source: 1, isDeleted: 1 }) // Filter by source
db.leads.createIndex({ createdAt: -1, isDeleted: 1 }) // Recent leads
db.leads.createIndex({ priority: 1, isDeleted: 1 }) // Priority filter
db.leads.createIndex({ isDeleted: 1 })

// Compound Index for common queries
db.leads.createIndex({
  status: 1,
  assignedTo: 1,
  createdAt: -1,
  isDeleted: 1
})

// Text Search Index (for name, email, phone search)
db.leads.createIndex({
  firstName: 'text',
  lastName: 'text',
  email: 'text',
  phone: 'text'
})

// LEAD_ACTIVITIES Collection
db.lead_activities.createIndex({ lead: 1, createdAt: -1 })
db.lead_activities.createIndex({ createdBy: 1, createdAt: -1 })
db.lead_activities.createIndex({ scheduledDate: 1 })
db.lead_activities.createIndex({ status: 1, lead: 1 })

// LEAD_ASSIGNMENTS Collection
db.lead_assignments.createIndex({ lead: 1, assignmentDate: -1 })
db.lead_assignments.createIndex({ assignedTo: 1, assignmentDate: -1 })
db.lead_assignments.createIndex({ isActive: 1, assignedTo: 1 })
db.lead_assignments.createIndex({ createdAt: -1 })

// LEAD_FOLLOWUPS Collection
db.lead_followups.createIndex({ lead: 1, scheduledDate: -1 })
db.lead_followups.createIndex({ assignedTo: 1, status: 1, scheduledDate: 1 })
db.lead_followups.createIndex({ scheduledDate: 1, status: 1 })

// LEAD_STATUSES & LEAD_SOURCES (Master Data)
db.lead_statuses.createIndex({ code: 1 }, { unique: true })
db.lead_statuses.createIndex({ isActive: 1 })

db.lead_sources.createIndex({ code: 1 }, { unique: true })
db.lead_sources.createIndex({ isActive: 1 })

// EMPLOYEES Collection
db.employees.createIndex({ email: 1 }, { unique: true })
db.employees.createIndex({ role: 1, isActive: 1 })
db.employees.createIndex({ company: 1, isActive: 1 })
```

---

## 5. DATABASE ER DIAGRAM (Text Format)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    LEAD MANAGEMENT SYSTEM - ER DIAGRAM                  │
└─────────────────────────────────────────────────────────────────────────┘

                            LEAD_STATUSES (Master)
                                  │
                                  │ (status)
                                  │
                    ┌─────────────────────────┐
                    │                         │
        ┌──────────────────────────────────────────┐
        │                                          │
LEAD_SOURCES (Master)                      LEADS (Core)
        │                                   │   │   │  │
        │                                   │   │   │  │
        └──────────> (source)               │   │   │  │
                                            │   │   │  │
                                  (assignedTo) │   │  │
                                       EMPLOYEES  │   │
                                            │   │  │
                                            │   │  └──> COMPANIES
                                            │   │
                                            │   └──> (createdBy)

                        ┌─────────────────────┬─────────────────┐
                        │                     │                 │
                   LEAD_ACTIVITIES    LEAD_ASSIGNMENTS    LEAD_FOLLOWUPS
                        │                     │                 │
                        │                     │                 │
                   (lead)                 (lead)            (lead)
                        │                     │                 │
                        ├─> (createdBy) ─────┼──> (assignedBy)│
                        │   EMPLOYEES         │    EMPLOYEES    │
                        │                     │                 ├─> (assignedTo)
                        │               (assignedTo)            │
                        │                     │            EMPLOYEES
                        │              EMPLOYEES
                        │
                    (relatedTo)
                        │
                   LEAD_ASSIGNMENTS


LEGEND:
  ───────>  One-to-Many relationship
  (field)   Foreign Key reference
  │         Primary Key
```

---

## 6. QUERY PATTERNS & PERFORMANCE CONSIDERATIONS

### High-Frequency Queries

1. **Search Leads** (by name, email, phone)
   - Use Text Index
   - Query: `db.leads.find({ $text: { $search: "john" } })`

2. **Filter by Status & Employee**
   - Use Compound Index: `{ status: 1, assignedTo: 1, createdAt: -1, isDeleted: 1 }`
   - Query: `db.leads.find({ status: statusId, assignedTo: employeeId, isDeleted: false })`

3. **Retrieve Lead Activities**
   - Use Index: `{ lead: 1, createdAt: -1 }`
   - Query: `db.lead_activities.find({ lead: leadId }).sort({ createdAt: -1 })`

4. **Get Assignment History**
   - Use Index: `{ lead: 1, assignmentDate: -1 }`
   - Query: `db.lead_assignments.find({ lead: leadId }).sort({ assignmentDate: -1 })`

### Aggregation Pipeline Examples

1. **Lead Status Summary**
   ```javascript
   db.leads.aggregate([
     { $match: { isDeleted: false } },
     { $group: { _id: "$status", count: { $sum: 1 } } },
     { $lookup: { from: "lead_statuses", localField: "_id", foreignField: "_id", as: "statusInfo" } }
   ])
   ```

2. **Employee Performance**
   ```javascript
   db.lead_assignments.aggregate([
     { $match: { isActive: true } },
     { $group: { _id: "$assignedTo", totalAssigned: { $sum: 1 } } },
     { $lookup: { from: "employees", localField: "_id", foreignField: "_id", as: "employeeInfo" } }
   ])
   ```

3. **Lead Conversion Analytics**
   ```javascript
   db.leads.aggregate([
     { $match: { conversionStatus: "CONVERTED" } },
     { $group: { _id: "$source", totalConverted: { $sum: 1 }, avgValue: { $avg: "$convertedValue" } } }
   ])
   ```

---

## 7. DATABASE CONSTRAINTS & VALIDATIONS

### Data Integrity Rules

1. **Email & Phone Uniqueness**
   - Prevent duplicate lead entries with same contact details
   - Handle duplicates with merge functionality

2. **Referential Integrity**
   - Foreign keys should point to existing documents
   - Cascade delete for activities/assignments when lead is deleted

3. **Status Workflow**
   - Define valid status transitions
   - Prevent invalid state changes

4. **Assignment Rules**
   - Only active employees can be assigned leads
   - Track assignment history for audit

5. **Soft Delete Pattern**
   - Use `isDeleted` flag instead of hard delete
   - Always filter: `{ isDeleted: false }` in queries

---

## 8. SCALING CONSIDERATIONS

### For Large Data Volume

1. **Sharding Strategy**
   - Shard by `createdAt` (time-based) or `assignedTo` (employee-based)
   - Avoid sharding by email (uneven distribution)

2. **Data Archival**
   - Move old leads (> 2 years) to archive collection
   - Keep active leads in hot storage

3. **Caching Strategy**
   - Cache master data (lead_statuses, lead_sources)
   - Use Redis for lead assignments and recent activities

4. **Read Replicas**
   - Use secondary nodes for read-heavy operations
   - Analytics queries on secondary nodes

---

## 9. SECURITY CONSIDERATIONS

1. **Field-Level Encryption**
   - Encrypt: phone, email (optional based on compliance)

2. **Audit Trail**
   - Track createdBy, updatedAt for all changes
   - Maintain separate audit collection for sensitive changes

3. **Access Control**
   - Employees see only assigned leads
   - Managers see team leads
   - Admins see all leads

4. **Data Validation**
   - Validate email format
   - Validate phone format (country-specific)
   - Sanitize input to prevent injection

---

## 10. INDUSTRY BEST PRACTICES IMPLEMENTED

✅ **Normalization**: Master data separated into dedicated collections
✅ **Soft Delete**: Maintains data integrity and audit trail
✅ **Timestamps**: Automatic createdAt/updatedAt tracking
✅ **Indexing**: Strategic indexes for common queries
✅ **Relationships**: Proper foreign key references
✅ **Audit Trail**: Track who created/modified records
✅ **Status Tracking**: Complete activity history
✅ **Scalability**: Prepared for horizontal scaling
✅ **Security**: Access control and data encryption ready
✅ **Performance**: Optimized for search, filter, and aggregation operations
