# 🎯 Mongoose Models Summary

Complete Mongoose models for the Lead Management System with comprehensive validation, relationships, and best practices.

---

## 📦 What's Included

### ✅ Three Mongoose Models

#### 1️⃣ **Lead Model** (`src/models/Lead.js`)
Core real estate lead management with complete lifecycle tracking.

**Key Fields:**
- Contact: firstName, lastName, email, phone
- Classification: status, source, priority, campaign, propertyId
- Assignment: assignedTo (Employee reference)
- Property Info: propertyType, location (with coordinates)
- Budget: budgetMin, budgetMax
- Conversion: conversionStatus, conversionValue
- Audit: createdBy, updatedBy, createdAt, updatedAt
- Soft Delete: isDeleted, deletedAt

**Features:**
- ✓ Email & phone validation
- ✓ Status workflow: NEW_LEAD → CONTACTED → QUALIFIED → IN_NEGOTIATION → CONVERTED/LOST
- ✓ 8 indexed fields for fast queries
- ✓ Text search across name, email, phone, notes
- ✓ Instance methods: convert(), abandon(), softDelete(), restore()
- ✓ Static methods: findActive(), findByStatus(), searchLeads()
- ✓ Virtual: fullName

**Enums:**
```javascript
status: NEW_LEAD, CONTACTED, QUALIFIED, IN_NEGOTIATION, CONVERTED, LOST, INACTIVE
source: WEBSITE, FACEBOOK, GOOGLE_ADS, REFERRAL, WALK_IN, CALL, EMAIL
priority: LOW, MEDIUM, HIGH, CRITICAL
propertyType: Residential, Commercial, Industrial, Agricultural
```

---

#### 2️⃣ **Employee Model** (`src/models/Employee.js`)
Company agents/staff with role-based access and performance tracking.

**Key Fields:**
- Personal: firstName, lastName, email, phone, mobile
- Auth: password (auto-hashed with bcryptjs)
- Role: role, permissions
- Department: department, team, reportingTo
- Performance: totalLeadsAssigned, convertedLeads, lostLeads, conversionRate, averageDealValue
- Status: status, isOnline, lastLogin
- Profile: profileImage, bio, address
- Employment: employeeId, joinDate, designation, salary
- Settings: timezone, language, notificationPreferences
- Audit: createdBy, updatedBy, createdAt, updatedAt

**Features:**
- ✓ Unique email (case-insensitive)
- ✓ Password hashing with bcryptjs (never returned in queries)
- ✓ Role-based access: JUNIOR_AGENT, SENIOR_AGENT, MANAGER, DIRECTOR, ADMIN
- ✓ Performance metrics auto-calculated
- ✓ Instance methods: comparePassword(), updateMetrics(), softDelete(), restore(), getPublicProfile()
- ✓ Static methods: findActive(), findByEmailWithPassword(), findByRole(), getTopPerformers()
- ✓ Virtuals: fullName, displayName

**Enums:**
```javascript
role: JUNIOR_AGENT, SENIOR_AGENT, MANAGER, DIRECTOR, ADMIN
department: Sales, Management, Support, Admin
status: Active, Inactive, On Leave, Suspended
```

---

#### 3️⃣ **ActivityLog Model** (`src/models/ActivityLog.js`)
Comprehensive activity tracking for all lead interactions.

**Key Fields:**
- References: lead (Lead), employee (Employee)
- Activity: type, subject, description, contactMethod, direction, status
- Metadata: duration, location, attendees, outcome, callRecording, attachments
- Notes: notes, internalNotes, tags
- Status Updates: leadStatusBefore, leadStatusAfter, leadPriorityBefore, leadPriorityAfter
- Engagement: sentiment, engagementScore
- Scheduling: scheduledFor, actualDate, duration
- Follow-up: requiresFollowUp, followUpDate, followUpType
- Approval: isPublic, approvalStatus, approvedBy
- Audit: createdAt, updatedAt, isDeleted

**Features:**
- ✓ Activity types: CALL, EMAIL, MEETING, SITE_VISIT, NOTE, TASK, DOCUMENT, STATUS_CHANGE
- ✓ Sentiment analysis: Positive, Neutral, Negative
- ✓ Engagement scoring (0-100)
- ✓ Follow-up scheduling and tracking
- ✓ Attachment support
- ✓ 7 indexed fields for fast queries
- ✓ Text search on subject, description, notes
- ✓ Instance methods: markCompleted(), scheduleFollowUp(), addAttachment(), softDelete()
- ✓ Static methods: findByLead(), findByEmployee(), findPending(), findOverdue(), getLeadActivitySummary(), getEmployeeStats()
- ✓ Virtuals: isPending, isCompleted, isOverdue

**Enums:**
```javascript
type: CALL, EMAIL, MEETING, SITE_VISIT, NOTE, TASK, DOCUMENT, STATUS_CHANGE
contactMethod: Phone, Email, In-Person, Video Call, WhatsApp, SMS, Other
direction: Inbound, Outbound
status: Completed, Scheduled, Pending, Cancelled
sentiment: Positive, Neutral, Negative
followUpType: Call, Email, Meeting, Site Visit, Other
```

---

## 📚 Documentation Files

### 1. **MODELS_DOCUMENTATION.md** (Comprehensive Reference)
- Complete schema documentation for all 3 models
- Field descriptions, validation rules, and constraints
- Enum values and their meanings
- Indexes and their purposes
- Instance and static methods
- Full sample JSON for each model
- Relationship diagrams
- Field constraints table

### 2. **MODELS_QUICK_REFERENCE.md** (Developer Guide)
- Quick lookup for common operations
- Status workflows
- Key queries and aggregations
- Relationship and population examples
- Text search examples
- Performance tracking queries
- Common aggregation pipelines
- Seeding instructions

### 3. **API_INTEGRATION_EXAMPLES.md** (API Usage)
- cURL examples for all endpoints
- Request/response samples
- Authentication headers
- Batch operations
- Analytics & reporting endpoints
- Common response patterns
- Postman collection guide
- Environment variables

---

## 🔄 Relationships

```
Lead (many) ←→ (one) Employee (assignedTo)
Lead (many) ←→ (one) Employee (createdBy)
Lead (many) ←→ (one) Employee (updatedBy)

Employee (many) ←→ (one) Employee (reportingTo)

ActivityLog (many) ←→ (one) Lead (lead)
ActivityLog (many) ←→ (one) Employee (employee)
ActivityLog (many) ←→ (one) Employee (approvedBy)
```

---

## 💾 Sample Data & Seeding

### sampleData.js
Includes production-ready sample data:
- **3 Employees**: Junior Agent, Senior Agent, Manager
- **5 Leads**: Various statuses (NEW_LEAD, CONTACTED, QUALIFIED, IN_NEGOTIATION, CONVERTED)
- **5 Activities**: Different types (CALL, EMAIL, MEETING, TASK)

### initDatabase.js
Database initialization and seeding script:
```bash
npm run init-db        # Run seeding
npm run seed           # Alternative

CLEAR_DB=true npm run init-db  # Clear before seeding
```

**Features:**
- Connects to MongoDB
- Optionally clears existing data
- Creates all relationships
- Displays seeding summary with statistics
- Shows top performers and recent activities

---

## 🔐 Security Features

✅ **Password Security**
- Auto-hashed with bcryptjs (10 salt rounds)
- Never returned in queries by default
- `comparePassword()` method for verification

✅ **Data Validation**
- Email format validation (RFC 5322)
- Phone format validation (international)
- Budget range validation
- Enum value enforcement
- Min/max length constraints

✅ **Audit Trail**
- createdBy, updatedBy tracking
- createdAt, updatedAt timestamps
- Soft delete support with deletedAt

✅ **Query Protection**
- Soft-deleted records excluded by default
- Password not selected by default
- Sensitive fields hidden from public profile

---

## 📊 Validation Rules

| Model | Field | Rule |
|-------|-------|------|
| Lead | firstName | 2-50 chars, required |
| Lead | email | RFC format, unique |
| Lead | phone | 10+ digits, required |
| Lead | source | Enum, required |
| Lead | budgetMin/Max | Non-negative, min ≤ max |
| Employee | firstName | 2-50 chars, required |
| Employee | email | RFC format, unique, required |
| Employee | password | 8+ chars, auto-hashed, required |
| Employee | role | Enum, required |
| ActivityLog | lead | ObjectId, required |
| ActivityLog | employee | ObjectId, required |
| ActivityLog | type | Enum, required |
| ActivityLog | subject | 1-200 chars, required |

---

## 🚀 Getting Started

### 1. Verify Models Are Created
```bash
ls src/models/
# Output:
# ActivityLog.js  Employee.js  Lead.js
```

### 2. Seed Database
```bash
npm run init-db
```

### 3. Start Server
```bash
npm run dev
```

### 4. Test Endpoints
```bash
# Get all leads
curl http://localhost:3000/api/v1/leads

# Get employees
curl http://localhost:3000/api/v1/employees

# Get activities
curl http://localhost:3000/api/v1/activities
```

---

## 🎯 Key Methods & Operations

### Lead Operations
```javascript
Lead.findActive()              // Get non-deleted leads
Lead.findByStatus('QUALIFIED') // Filter by status
Lead.searchLeads('text')       // Full-text search
lead.convert(750000)           // Convert & set value
lead.abandon()                 // Mark as lost
lead.softDelete()              // Soft delete
lead.restore()                 // Restore deleted
```

### Employee Operations
```javascript
Employee.findActive()                    // Get active employees
Employee.findByRole('SENIOR_AGENT')      // Filter by role
Employee.findByDepartment('Sales')       // Filter by dept
Employee.getTopPerformers(10)            // Best conversion rates
employee.comparePassword(pwd)            // Verify password
employee.updateMetrics(converted, total) // Update performance
employee.getPublicProfile()              // Safe data
```

### Activity Operations
```javascript
ActivityLog.findByLead(leadId)           // Get lead activities
ActivityLog.findByEmployee(empId)        // Get employee activities
ActivityLog.findPending()                // Get pending tasks
ActivityLog.findOverdue()                // Get overdue activities
activity.markCompleted(status, sentiment) // Mark complete
activity.scheduleFollowUp(date, type)    // Schedule next step
activity.addAttachment(name, url)        // Add file
```

---

## 📈 Analytics & Aggregations

**Lead Conversion Funnel**
```javascript
Lead.aggregate([
  { $group: { _id: '$status', count: { $sum: 1 } } }
])
```

**Employee Performance**
```javascript
Employee.aggregate([
  { $match: { status: 'Active' } },
  { $sort: { conversionRate: -1 } },
  { $limit: 10 }
])
```

**Activity Sentiment Analysis**
```javascript
ActivityLog.aggregate([
  { $match: { employee: employeeId } },
  { $group: { _id: '$sentiment', count: { $sum: 1 } } }
])
```

---

## 🔍 Indexes Summary

### Lead Indexes
- email, phone, status, source, priority, assignedTo
- Compound: (email, phone), (status, assignedTo)
- Text: firstName, lastName, email, phone, notes

### Employee Indexes
- email, role, status, employeeId
- Compound: (email, isDeleted)

### ActivityLog Indexes
- lead+createdAt, employee+type, type+status
- Compound: lead+type+status
- Text: subject, description, notes

---

## ⚠️ Important Notes

1. **Soft Deletes**: All queries auto-exclude soft-deleted records via pre-find middleware
2. **Timestamps**: Auto-managed by Mongoose (createdAt, updatedAt)
3. **Password Hashing**: Automatic on save; use `comparePassword()` for verification
4. **Pagination**: Use skip/limit for large result sets
5. **Population**: Always explicitly populate references
6. **Constants**: Use `src/constants/index.js` for enum values

---

## 📞 Support Files

- **Model Files**: `src/models/Lead.js`, `src/models/Employee.js`, `src/models/ActivityLog.js`
- **Sample Data**: `src/sample-data/sampleData.js`
- **Seeding Script**: `src/sample-data/initDatabase.js`
- **Constants**: `src/constants/index.js`
- **Full Docs**: `MODELS_DOCUMENTATION.md`
- **Quick Ref**: `MODELS_QUICK_REFERENCE.md`
- **API Examples**: `API_INTEGRATION_EXAMPLES.md`

---

## ✨ Ready to Use!

All three Mongoose models are production-ready with:
- ✅ Complete validation
- ✅ Security features
- ✅ Relationship setup
- ✅ Instance & static methods
- ✅ Aggregation pipelines
- ✅ Sample data
- ✅ Comprehensive documentation
- ✅ API examples

**Start using:** `npm run init-db && npm run dev`
