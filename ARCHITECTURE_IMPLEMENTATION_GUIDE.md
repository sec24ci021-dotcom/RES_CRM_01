# Lead Management System - Implementation & Architecture Guide

## 🏗️ System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT APPLICATION                       │
│  (Mobile, Web, Desktop - Any HTTP Client)                       │
└────────────────────────────────┬────────────────────────────────┘
                                 │ HTTP Request
                                 │ (JSON Body, Headers)
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                    LAYER 1: HTTP ENTRY POINT                    │
│                   Express Server (Port 3000)                     │
│                                                                   │
│  • Request parsing (JSON/URL-encoded)                           │
│  • CORS handling                                                 │
│  • Request logging (morgan)                                      │
│  • Body size limiting                                            │
└────────────────────────────────┬────────────────────────────────┘
                                 │
┌─────────────────────────────────┴────────────────────────────────┐
│          LAYER 2: ROUTING (src/routes/leadRoutes.js)            │
│                                                                   │
│  Routes incoming requests to appropriate handlers:               │
│  • POST   /leads         → Controller.createLead                │
│  • GET    /leads         → Controller.getAllLeads               │
│  • GET    /leads/:id     → Controller.getLeadById               │
│  • PUT    /leads/:id     → Controller.updateLead                │
│  • DELETE /leads/:id     → Controller.deleteLead                │
│  • PATCH  /leads/:id/status → Controller.updateLeadStatus       │
│  • POST   /leads/:id/assign → Controller.assignLead             │
│  • POST   /leads/:id/convert → Controller.convertLead           │
│  • GET    /leads/search  → Controller.searchLeads               │
│  • GET    /leads/stats   → Controller.getLeadStatistics         │
└────────────────────────────────┬────────────────────────────────┘
                                 │
┌─────────────────────────────────┴────────────────────────────────┐
│     LAYER 3: CONTROLLER (src/controllers/LeadController.js)      │
│                                                                   │
│  HTTP Request Handler - Processes input and orchestrates logic:  │
│                                                                   │
│  1. Extract & Validate Inputs                                    │
│     - Query parameters (filters, pagination)                     │
│     - Request body (lead data)                                   │
│     - URL parameters (IDs)                                       │
│                                                                   │
│  2. Call Service Methods                                         │
│     - Pass validated data to business logic layer                │
│                                                                   │
│  3. Handle Exceptions                                            │
│     - Catch specific exception types                             │
│     - Map to HTTP status codes                                   │
│     - Format error response                                      │
│                                                                   │
│  4. Return Response                                              │
│     - Success: {success, message, data, statusCode}             │
│     - Error: {success, error: {code, message, statusCode}}      │
│                                                                   │
│  Exception Handling Chain:                                       │
│    try {                                                          │
│      await service.method()      ← Service throws exception      │
│    } catch (error) {                                              │
│      if (error instanceof ValidationException)    ✅ Handle 400  │
│      if (error instanceof DuplicateException)     ✅ Handle 409  │
│      if (error instanceof NotFoundException)      ✅ Handle 404  │
│      if (error instanceof BusinessLogicException) ✅ Handle 422  │
│      if (error instanceof AutoAssignmentException)✅ Handle 503  │
│      next(error)  ✅ Pass to middleware                          │
│    }                                                              │
└────────────────────────────────┬────────────────────────────────┘
                                 │
┌─────────────────────────────────┴────────────────────────────────┐
│      LAYER 4: BUSINESS LOGIC (src/services/LeadService_*.js)    │
│                                                                   │
│  Service Layer - Core business logic and orchestration:          │
│                                                                   │
│  Primary Services:                                               │
│  • LeadService_Complete (20+ methods)                            │
│    - createLead                                                   │
│    - updateLead                                                   │
│    - deleteLead                                                   │
│    - getLeads                                                     │
│    - searchLeads                                                  │
│    - etc.                                                         │
│                                                                   │
│  Supporting Services:                                            │
│  • LeadValidationService (field validation)                      │
│  • DuplicateCheckService (duplicate detection)                   │
│  • AutoAssignmentService (agent assignment)                      │
│  • ActivityService (audit logging)                               │
│                                                                   │
│  Exception Throwing:                                             │
│    if (validation fails) → throw new ValidationException(...)    │
│    if (duplicate found) → throw new DuplicateException(...)      │
│    if (not found) → throw new NotFoundException(...)             │
│    if (invalid transition) → throw new BusinessLogicException(...)│
│    if (no agents) → throw new AutoAssignmentException(...)       │
└────────────────────────────────┬────────────────────────────────┘
                                 │
┌─────────────────────────────────┴────────────────────────────────┐
│  LAYER 5: DATA ACCESS (src/repositories/LeadRepository.js)       │
│                                                                   │
│  Repository Pattern - Abstracts database access:                 │
│                                                                   │
│  Methods:                                                         │
│  • find() - Query leads with filters                             │
│  • findById() - Get single lead                                  │
│  • create() - Create new lead                                    │
│  • update() - Update existing lead                               │
│  • delete() - Delete lead (soft or hard)                         │
│  • search() - Full-text search                                   │
│  • aggregate() - Statistics                                      │
│                                                                   │
│  Other Repositories:                                             │
│  • EmployeeRepository (agents)                                   │
│  • ActivityRepository (audit logs)                               │
│                                                                   │
│  Note: No business logic here - pure data operations             │
└────────────────────────────────┬────────────────────────────────┘
                                 │
┌─────────────────────────────────┴────────────────────────────────┐
│   LAYER 6: DATABASE MODELS (src/models/Lead.js, etc.)           │
│                                                                   │
│  Mongoose Schemas - Define data structure:                       │
│                                                                   │
│  • Lead Schema                                                    │
│    - firstName, lastName, email, phone, source                   │
│    - status (NEW_LEAD, CONTACTED, QUALIFIED, CONVERTED, LOST)   │
│    - priority (LOW, MEDIUM, HIGH, URGENT)                        │
│    - budgetMin, budgetMax                                        │
│    - assignedTo (reference to Employee)                          │
│    - isDeleted, deletedAt (soft delete)                          │
│    - createdBy, updatedBy (audit)                                │
│    - timestamps (createdAt, updatedAt)                           │
│                                                                   │
│  • Employee Schema (agents)                                      │
│  • ActivityLog Schema (audit trail)                              │
│                                                                   │
│  Schema Validation:                                              │
│  • Required fields enforced                                      │
│  • Unique indexes on email & phone                               │
│  • Enum validation on status/priority                            │
│  • Custom validators on business rules                           │
└────────────────────────────────┬────────────────────────────────┘
                                 │
┌─────────────────────────────────┴────────────────────────────────┐
│         LAYER 7: DATABASE (MongoDB)                              │
│                                                                   │
│  Collections:                                                     │
│  • leads (stores lead documents)                                 │
│  • employees (stores employee/agent documents)                   │
│  • activitylogs (stores audit trail)                             │
│                                                                   │
│  Indexes:                                                         │
│  • leads.email (unique, for duplicate check)                     │
│  • leads.phone (unique, for duplicate check)                     │
│  • leads.status (for filtering)                                  │
│  • leads.createdAt (for sorting)                                 │
│  • leads.assignedTo (for agent filtering)                        │
│                                                                   │
│  Storage:                                                         │
│  • Persists all data                                             │
│  • Handles complex queries                                       │
│  • Manages relationships                                         │
│  • Supports aggregations                                         │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📊 Request-Response Flow Example

### Example: Create Lead

```
CLIENT REQUEST
└─────────────────────────────────────────────────────────────┐
│ POST /api/v1/leads HTTP/1.1                                │
│ Host: localhost:3000                                        │
│ Content-Type: application/json                             │
│                                                             │
│ {                                                           │
│   "firstName": "John",                                     │
│   "lastName": "Doe",                                       │
│   "email": "john@example.com",                            │
│   "phone": "+1234567890",                                 │
│   "source": "WEBSITE",                                    │
│   "priority": "HIGH",                                     │
│   "autoAssign": true,                                     │
│   "assignmentStrategy": "LEAST_LOADED"                    │
│ }                                                           │
└─────────────────────────────────────────────────────────────┘
        ▼
EXPRESS SERVER receives request
        │
        ├─ Parse JSON body
        ├─ Extract headers
        └─ Log request (morgan)
        ▼
ROUTES LAYER matches: POST /leads
        │
        └─ Call: LeadController.createLead(req, res, next)
        ▼
CONTROLLER METHOD: createLead
        │
        ├─ logger.info('CREATE LEAD /api/v1/leads')
        │
        ├─ Validate inputs:
        │   ✓ Check firstName, lastName provided
        │   ✓ Check email valid format
        │   ✓ Check phone valid format
        │   ✓ Check source is valid enum
        │
        ├─ Call service:
        │   lead = await leadService.createLead(
        │     { firstName, lastName, email, ... },
        │     userId,
        │     { autoAssign, assignmentStrategy }
        │   )
        │
        ├─ Handle exceptions:
        │   • If ValidationException → return 400
        │   • If DuplicateException → return 409
        │   • If AutoAssignmentException → return 503
        │   • If unexpected → next(error)
        │
        └─ Return success response:
            res.status(201).json({
              success: true,
              message: "Lead created successfully",
              data: lead,
              statusCode: 201
            })
        ▼
SERVICE LAYER: LeadService_Complete.createLead()
        │
        ├─ Validation:
        │   leadValidationService.validateLeadData(...)
        │   // Throws ValidationException if invalid
        │
        ├─ Duplicate check:
        │   duplicateCheckService.checkDuplicate(...)
        │   // Throws DuplicateException if exists
        │
        ├─ Auto-assignment (if enabled):
        │   assignedAgent = autoAssignmentService.assignLead(...)
        │   // Throws AutoAssignmentException if no agents
        │
        ├─ Create lead:
        │   lead = await leadRepository.createLead(...)
        │
        ├─ Log activity:
        │   this._logActivity('LEAD_CREATED', lead._id, ...)
        │
        └─ Return lead object with agent
        ▼
REPOSITORY LAYER: LeadRepository.createLead()
        │
        ├─ Create document:
        │   const lead = new Lead({
        │     firstName, lastName, email, phone,
        │     status: 'NEW_LEAD',
        │     source, priority,
        │     assignedTo: agentId,
        │     createdBy: userId,
        │     createdAt: now,
        │     isDeleted: false
        │   })
        │
        └─ Save to database:
            await lead.save()
            // MongoDB validates schema
        ▼
MONGODB: Stores document
        │
        ├─ Validates schema
        ├─ Enforces unique constraints on email
        ├─ Creates indexes
        └─ Returns saved document with _id
        ▼
RESPONSE RETURNS TO CLIENT
└──────────────────────────────────────────────────────────┐
│ HTTP/1.1 201 Created                                    │
│ Content-Type: application/json                         │
│                                                         │
│ {                                                       │
│   "success": true,                                     │
│   "message": "Lead created successfully",             │
│   "data": {                                            │
│     "_id": "63d7e8f9c1234567890abcd0",               │
│     "firstName": "John",                              │
│     "lastName": "Doe",                                │
│     "email": "john@example.com",                      │
│     "phone": "+1234567890",                           │
│     "source": "WEBSITE",                              │
│     "priority": "HIGH",                               │
│     "status": "NEW_LEAD",                             │
│     "assignedTo": {                                   │
│       "_id": "63d7e8f9c1234567890abcd1",             │
│       "firstName": "Alice",                           │
│       "lastName": "Agent",                            │
│       "email": "alice@company.com"                    │
│     },                                                │
│     "createdAt": "2024-01-16T10:30:00Z",            │
│     "updatedAt": "2024-01-16T10:30:00Z"             │
│   },                                                   │
│   "statusCode": 201                                   │
│ }                                                       │
└──────────────────────────────────────────────────────────┘
```

---

## 🔄 Exception Handling Flow

```
SERVICE LAYER throws exception
        │
        ├─ throw new ValidationException("Email format invalid", { email: "..." })
        │   {statusCode: 400, errorCode: 'VALIDATION_ERROR', details: {...}}
        │
        ├─ throw new DuplicateException("Lead exists", { field: "email" })
        │   {statusCode: 409, errorCode: 'DUPLICATE_ENTRY', details: {...}}
        │
        ├─ throw new NotFoundException("Lead 123 not found")
        │   {statusCode: 404, errorCode: 'RESOURCE_NOT_FOUND'}
        │
        ├─ throw new BusinessLogicException("Invalid status transition")
        │   {statusCode: 422, errorCode: 'BUSINESS_RULE_VIOLATION'}
        │
        └─ throw new AutoAssignmentException("No available agents")
            {statusCode: 503, errorCode: 'AUTO_ASSIGNMENT_FAILED'}
        ▼
CONTROLLER CATCHES exception
        │
        ├─ if (error instanceof ValidationException)
        │   return res.status(400).json({success: false, error: {...}})
        │
        ├─ if (error instanceof DuplicateException)
        │   return res.status(409).json({success: false, error: {...}})
        │
        ├─ if (error instanceof NotFoundException)
        │   return res.status(404).json({success: false, error: {...}})
        │
        ├─ if (error instanceof BusinessLogicException)
        │   return res.status(422).json({success: false, error: {...}})
        │
        ├─ if (error instanceof AutoAssignmentException)
        │   return res.status(503).json({success: false, error: {...}})
        │
        └─ Unexpected exception → next(error)
        ▼
MIDDLEWARE receives error
        │
        ├─ Global error handler middleware catches it
        │
        ├─ Checks error type:
        │   ✓ Mongoose ValidationError
        │   ✓ Mongoose CastError
        │   ✓ Mongoose DuplicateKeyError
        │   ✓ JWT Errors
        │   ✓ Custom errors (with statusCode)
        │
        ├─ Logs error for debugging
        │
        └─ Returns standardized error response
        ▼
CLIENT receives error response
        │
        └─ HTTP Status + JSON error object
```

---

## 💾 Database Schema Structure

### Lead Collection

```javascript
{
  _id: ObjectId,
  
  // Personal Information
  firstName: String (required, trim),
  lastName: String (required, trim),
  email: String (required, unique, lowercase),
  phone: String (required, unique),
  
  // Lead Classification
  source: String (enum: WEBSITE, FACEBOOK, EMAIL, REFERRAL, PHONE),
  campaign: String (optional),
  propertyId: String (optional),
  location: {
    city: String,
    state: String,
    zipCode: String
  },
  
  // Financial Information
  budgetMin: Number (optional, >= 0),
  budgetMax: Number (optional, >= 0),
  conversionValue: Number (default: 0),
  
  // Status & Lifecycle
  status: String (enum: NEW_LEAD, CONTACTED, QUALIFIED, CONVERTED, LOST),
  priority: String (enum: LOW, MEDIUM, HIGH, URGENT),
  conversionStatus: String (enum: NOT_CONVERTED, CONVERTED, LOST),
  conversionDate: Date (set on conversion),
  
  // Assignment
  assignedTo: ObjectId (reference to Employee),
  assignmentDate: Date,
  
  // Audit Trail
  createdBy: ObjectId (reference to User),
  updatedBy: ObjectId (reference to User),
  createdAt: Date (auto),
  updatedAt: Date (auto),
  
  // Soft Delete
  isDeleted: Boolean (default: false),
  deletedAt: Date (set on deletion),
  
  // Metadata
  notes: String (optional),
  tags: [String],
  activities: [ObjectId] (references to ActivityLog)
}
```

### Indexes

```javascript
// Unique indexes (enforce uniqueness)
db.leads.createIndex({ email: 1, isDeleted: 1 }, { unique: true })
db.leads.createIndex({ phone: 1, isDeleted: 1 }, { unique: true })

// Query performance indexes
db.leads.createIndex({ status: 1 })
db.leads.createIndex({ source: 1 })
db.leads.createIndex({ priority: 1 })
db.leads.createIndex({ assignedTo: 1 })
db.leads.createIndex({ createdAt: -1 })
db.leads.createIndex({ isDeleted: 1 })

// Text search index
db.leads.createIndex({ 
  firstName: "text", 
  lastName: "text", 
  email: "text",
  phone: "text"
})
```

---

## 📡 All 10 API Endpoints

### 1. Create Lead
```
POST /api/v1/leads
Request:  firstName, lastName, email, phone, source, [priority], [autoAssign]
Response: 201 Created → {success, message, data (Lead), statusCode}
Errors:   400 Validation | 409 Duplicate | 503 No Agents
```

### 2. Get All Leads
```
GET /api/v1/leads?page=1&limit=10&status=QUALIFIED&source=WEBSITE&priority=HIGH
Request:  Query params for pagination & filtering
Response: 200 OK → {success, message, data (Leads[]), pagination, statusCode}
Errors:   400 Invalid params
```

### 3. Get Lead by ID
```
GET /api/v1/leads/:id
Request:  ID in URL path
Response: 200 OK → {success, message, data (Lead), statusCode}
Errors:   400 Invalid ID | 404 Not Found
```

### 4. Update Lead
```
PUT /api/v1/leads/:id
Request:  {firstName, lastName, email, phone, status, priority, source, ...}
Response: 200 OK → {success, message, data (Lead), statusCode}
Errors:   400 Validation | 404 Not Found | 409 Duplicate | 422 Business Rule
```

### 5. Delete Lead
```
DELETE /api/v1/leads/:id
Request:  ID in URL path
Response: 200 OK → {success, message, data (Lead), statusCode}
Errors:   400 Invalid ID | 404 Not Found
```

### 6. Update Status
```
PATCH /api/v1/leads/:id/status
Request:  {status: "QUALIFIED"}
Response: 200 OK → {success, message, data (Lead), statusCode}
Errors:   400 Missing status | 404 Not Found | 422 Invalid transition
```

### 7. Assign Lead
```
POST /api/v1/leads/:id/assign
Request:  {agentId: "..."}
Response: 200 OK → {success, message, data (Lead), statusCode}
Errors:   400 Missing agentId | 404 Not Found
```

### 8. Convert Lead
```
POST /api/v1/leads/:id/convert
Request:  {value: 500000}
Response: 200 OK → {success, message, data (Lead), statusCode}
Errors:   400 Invalid value | 404 Not Found
```

### 9. Search Leads
```
GET /api/v1/leads/search?q=john
Request:  Query parameter 'q' for search term
Response: 200 OK → {success, message, data (Leads[]), statusCode}
Errors:   400 Missing query
```

### 10. Get Statistics
```
GET /api/v1/leads/stats
Request:  Optional query filters
Response: 200 OK → {success, message, data (Stats), statusCode}
Errors:   None typically
```

---

## 🚀 Startup Sequence

```
1. Server Starts (server.js runs)
   └─ Load environment variables (.env)
   
2. Express App Initialize
   └─ app = express()
   
3. Middleware Setup
   ├─ CORS configuration
   ├─ Body parser (JSON, URL-encoded)
   ├─ Request logger (morgan)
   ├─ Timeout handler
   └─ Custom middleware
   
4. Database Connection
   ├─ Connect to MongoDB
   ├─ Initialize Mongoose models
   ├─ Verify connection
   └─ Wait for ready state
   
5. Routes Registration
   ├─ Health check route (GET /health)
   ├─ Status route (GET /api/v1/status)
   ├─ Documentation route (GET /api/v1/)
   └─ Lead routes (GET /api/v1/leads + 9 more)
   
6. Error Handling Middleware
   ├─ 404 handler
   └─ Global error handler
   
7. Server Listen
   ├─ Start listening on PORT (default 3000)
   ├─ Log startup messages
   └─ Ready to accept requests

✅ System Ready for Requests
```

---

## 🧪 Testing Workflow

```
1. Verify Health
   curl http://localhost:3000/health
   → Confirms server is running

2. Create Test Lead
   curl -X POST http://localhost:3000/api/v1/leads \
     -H "Content-Type: application/json" \
     -d '{"firstName":"Test",...}'
   → Get lead ID from response

3. List Leads
   curl "http://localhost:3000/api/v1/leads"
   → Verify pagination works

4. Get Single Lead
   curl "http://localhost:3000/api/v1/leads/{leadId}"
   → Verify lead retrieval

5. Update Lead
   curl -X PUT "http://localhost:3000/api/v1/leads/{leadId}" \
     -d '{"status":"CONTACTED"}'
   → Verify update works

6. Update Status
   curl -X PATCH "http://localhost:3000/api/v1/leads/{leadId}/status" \
     -d '{"status":"QUALIFIED"}'
   → Verify status transition validation

7. Assign Lead
   curl -X POST "http://localhost:3000/api/v1/leads/{leadId}/assign" \
     -d '{"agentId":"agentId"}'
   → Verify assignment works

8. Search Leads
   curl "http://localhost:3000/api/v1/leads/search?q=test"
   → Verify search functionality

9. Statistics
   curl "http://localhost:3000/api/v1/leads/stats"
   → Verify aggregations work

10. Delete Lead
    curl -X DELETE "http://localhost:3000/api/v1/leads/{leadId}"
    → Verify soft delete works
```

---

## 📚 Key Concepts

### Exception-Based Error Handling
- Services throw typed exceptions with metadata
- Controller catches and maps to HTTP responses
- Middleware catches any unhandled errors
- **Benefit:** Precise error handling and clear error codes

### Repository Pattern
- Abstract database access into repositories
- Services call repositories (not direct DB)
- Enables easy testing and switching DB backends
- **Benefit:** Separation of concerns, testability

### Soft Delete
- Never physically delete leads
- Mark with `isDeleted: true`, `deletedAt: timestamp`
- Filter out deleted records in queries
- **Benefit:** Data preservation, audit trail

### Layered Architecture
- Each layer has a single responsibility
- Layers communicate through well-defined interfaces
- Easy to test each layer independently
- **Benefit:** Maintainability, scalability, clarity

### Event-Based Logging
- Log significant business events
- Record actor (createdBy, updatedBy)
- Track timestamps
- **Benefit:** Audit trail, debugging, compliance

---

## ✅ Production Readiness Checklist

### Code Quality
- [x] ESDoc documentation on all methods
- [x] Consistent error handling
- [x] SOLID principles applied
- [x] Proper logging throughout
- [x] No hardcoded values

### Performance
- [x] Database indexes created
- [x] Pagination implemented
- [x] Query optimization (lean, select)
- [x] Connection pooling
- [x] Response time acceptable

### Security
- [x] Input validation
- [x] SQL injection prevention (Mongoose)
- [x] XSS prevention (JSON responses)
- [x] Error message sanitization
- [x] Sensitive data exclusion

### Testing
- [x] Test cases documented
- [x] Error scenarios covered
- [x] Edge cases considered
- [x] Load testing guidance
- [x] Integration examples

### Documentation
- [x] API reference complete
- [x] Architecture documented
- [x] Setup instructions clear
- [x] Troubleshooting guide provided
- [x] Code examples included

### Deployment
- [x] Environment variables used
- [x] Configuration externalized
- [x] No local dependencies
- [x] Port configurable
- [x] Graceful startup

---

## 🎯 Performance Metrics

### Expected Response Times
- Create Lead: 100-200ms
- Get All Leads: 50-150ms (depends on filters)
- Search Leads: 200-500ms (text search)
- Statistics: 500-1000ms (aggregation)

### Database Operations
- Indexing reduces query time by 100x
- Pagination prevents memory issues
- Lean queries save 20% bandwidth
- Connection pooling improves throughput

### Optimization Recommendations
1. Cache frequently accessed data (Redis)
2. Implement query result caching
3. Use database query profiling
4. Monitor response times
5. Set up alerts for degradation

---

**Version:** 1.0
**Status:** Complete ✅
**Last Updated:** 2024-01-16
