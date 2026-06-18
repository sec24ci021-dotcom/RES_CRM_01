# Repository Layer Documentation

Complete reference for the Lead Repository Layer implementation with error handling, async/await, and clean code practices.

---

## 🏗️ Architecture Overview

### Repository Pattern Benefits
- **Abstraction**: Isolates data access logic from business logic
- **Testability**: Easy to mock and unit test
- **Maintainability**: Centralized database queries
- **Reusability**: Common operations in BaseRepository
- **Scalability**: Easy to add new query methods

### Layer Structure
```
Controller Layer (HTTP)
    ↓
Service Layer (Business Logic)
    ↓
Repository Layer (Data Access) ← You are here
    ↓
Model Layer (Mongoose/Database)
```

---

## 📋 Lead Repository Methods

### PRIMARY CRUD OPERATIONS

#### 1. createLead(leadData, createdBy)
**Purpose**: Create a new lead record

**Parameters**:
- `leadData` (Object) - Lead information
- `createdBy` (String, optional) - User ID creating the lead

**Returns**: Promise<Lead> - Created lead document

**Error Handling**:
- Validates required fields
- Checks email format
- Throws HTTP_STATUS.BAD_REQUEST on validation failure

**Example**:
```javascript
const newLead = await leadRepository.createLead({
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  phone: '+1-555-123-4567',
  source: 'WEBSITE',
  propertyId: 'PROP-001'
}, userId);
```

---

#### 2. getLeadById(leadId, options)
**Purpose**: Retrieve a single lead by ID with relationships

**Parameters**:
- `leadId` (String) - Lead ID
- `options` (Object, optional)
  - `populate` (Array) - Fields to populate (default: assignedTo, createdBy, updatedBy)
  - `select` (String) - Fields to select

**Returns**: Promise<Lead> - Lead document with populated references

**Error Handling**:
- Throws error if ID is empty
- Returns 404 if lead not found
- Logs access attempts

**Example**:
```javascript
const lead = await leadRepository.getLeadById('607f1f77bcf86cd799439012', {
  populate: ['assignedTo', 'createdBy'],
  select: 'firstName lastName email source status'
});
```

---

#### 3. getAllLeads(options)
**Purpose**: Retrieve paginated list of all leads

**Parameters**:
- `options` (Object, optional)
  - `page` (Number, default: 1)
  - `limit` (Number, default: 10)
  - `sort` (Object, default: { createdAt: -1 })
  - `status` (String) - Filter by status
  - `priority` (String) - Filter by priority
  - `source` (String) - Filter by source
  - `assignedTo` (String) - Filter by assigned employee

**Returns**: Promise<Object>
```javascript
{
  data: [{ lead objects }],
  pagination: {
    page: 1,
    limit: 10,
    total: 50,
    pages: 5
  }
}
```

**Error Handling**:
- Validates pagination parameters
- Returns empty array if no leads found
- Logs query execution

**Example**:
```javascript
const results = await leadRepository.getAllLeads({
  page: 2,
  limit: 20,
  status: 'QUALIFIED',
  priority: 'HIGH'
});
```

---

#### 4. updateLead(leadId, updateData, updatedBy)
**Purpose**: Update a lead record

**Parameters**:
- `leadId` (String) - Lead ID
- `updateData` (Object) - Data to update
- `updatedBy` (String, optional) - User ID performing update

**Returns**: Promise<Lead> - Updated lead document

**Error Handling**:
- Validates lead exists
- Prevents updating protected fields (_id, createdAt, createdBy)
- Validates status enum
- Runs Mongoose validators
- Returns 404 if lead not found

**Example**:
```javascript
const updated = await leadRepository.updateLead(
  '607f1f77bcf86cd799439012',
  {
    status: 'QUALIFIED',
    priority: 'HIGH',
    notes: 'Updated customer information'
  },
  userId
);
```

---

#### 5. deleteLead(leadId, deletedBy)
**Purpose**: Soft delete a lead (mark as deleted)

**Parameters**:
- `leadId` (String) - Lead ID
- `deletedBy` (String, optional) - User ID performing deletion

**Returns**: Promise<Lead> - Deleted lead document

**Error Handling**:
- Validates lead exists
- Sets deletedAt timestamp
- Marks isDeleted as true
- Returns 404 if not found
- Logs deletion attempts

**Example**:
```javascript
const deleted = await leadRepository.deleteLead(
  '607f1f77bcf86cd799439012',
  userId
);
```

---

#### 6. searchLead(searchTerm, options)
**Purpose**: Full-text search across lead fields

**Parameters**:
- `searchTerm` (String) - Text to search for
- `options` (Object, optional)
  - `page` (Number, default: 1)
  - `limit` (Number, default: 10)
  - `fields` (Array) - Searchable fields

**Returns**: Promise<Object>
```javascript
{
  data: [{ matching leads }],
  pagination: { page, limit, total, pages },
  query: searchTerm
}
```

**Error Handling**:
- Validates search term is not empty
- Returns empty results gracefully
- Scores results by relevance
- Logs search queries

**Example**:
```javascript
const results = await leadRepository.searchLead(
  'john apartment manhattan',
  { page: 1, limit: 20 }
);
```

---

#### 7. filterLead(filters, options)
**Purpose**: Advanced filtering with multiple criteria

**Parameters**:
- `filters` (Object)
  - `status` (String)
  - `priority` (String)
  - `source` (String)
  - `assignedTo` (String)
  - `conversionStatus` (String)
  - `minBudget` (Number)
  - `maxBudget` (Number)
  - `city` (String)
  - `campaign` (String)
  - `propertyId` (String)

- `options` (Object, optional)
  - `page` (Number, default: 1)
  - `limit` (Number, default: 10)
  - `sort` (Object)

**Returns**: Promise<Object> - Filtered and paginated results

**Error Handling**:
- Validates filter criteria
- Uses case-insensitive matching where appropriate
- Returns empty results if no matches
- Logs filter operations

**Example**:
```javascript
const results = await leadRepository.filterLead({
  status: 'QUALIFIED',
  priority: 'HIGH',
  city: 'New York',
  minBudget: 500000,
  maxBudget: 1000000
}, { page: 1, limit: 50 });
```

---

## 🔍 ADDITIONAL QUERY METHODS

### findByStatus(status, options)
Find leads filtered by status
```javascript
const qualified = await leadRepository.findByStatus('QUALIFIED', { page: 1, limit: 10 });
```

### findBySource(source, options)
Find leads by lead source
```javascript
const website = await leadRepository.findBySource('WEBSITE', { limit: 20 });
```

### findByAssignedEmployee(employeeId, options)
Find leads assigned to specific employee
```javascript
const assigns = await leadRepository.findByAssignedEmployee(employeeId);
```

### getUnassignedLeads(options)
Get all leads without assignment
```javascript
const unassigned = await leadRepository.getUnassignedLeads({ limit: 50 });
```

### findHighPriority(options)
Get high-priority leads sorted by creation date
```javascript
const urgent = await leadRepository.findHighPriority({ limit: 10 });
```

### getLeadStatistics(filters)
Get aggregated statistics about leads
```javascript
const stats = await leadRepository.getLeadStatistics({
  assignedTo: employeeId,
  source: 'WEBSITE'
});
// Returns: { totalLeads, convertedLeads, lostLeads, conversionRate, totalConversionValue, avgConversionValue }
```

### bulkUpdate(ids, updateData)
Update multiple leads at once
```javascript
const result = await leadRepository.bulkUpdate(
  ['607f1f77bcf86cd799439012', '607f1f77bcf86cd799439013'],
  { status: 'QUALIFIED', priority: 'HIGH' }
);
```

### restore(leadId)
Restore a soft-deleted lead
```javascript
const restored = await leadRepository.restore(leadId);
```

### getRecentLeads(days, options)
Get leads created in last N days
```javascript
const recent = await leadRepository.getRecentLeads(7, { limit: 20 });
```

### findByIdWithReferences(id)
Get lead with all populated relationships
```javascript
const lead = await leadRepository.findByIdWithReferences(leadId);
```

---

## 🛡️ ERROR HANDLING

### Error Types

**Validation Errors** (HTTP 400)
- Missing required fields
- Invalid email format
- Invalid status enum

**Not Found Errors** (HTTP 404)
- Lead ID doesn't exist
- Soft-deleted leads

**Database Errors** (HTTP 500)
- Connection failures
- Duplicate key errors
- Validation failures

### Error Structure
```javascript
{
  message: 'Human-readable error message',
  statusCode: 400,
  errorCode: 'VALIDATION_ERROR',
  originalError: 'MongoDB error details'
}
```

### Handling Errors in Service Layer
```javascript
try {
  const lead = await leadRepository.createLead(data, userId);
} catch (error) {
  logger.error('Repository error:', error);
  
  if (error.statusCode === 400) {
    // Validation error
  } else if (error.statusCode === 404) {
    // Not found
  } else {
    // Server error
  }
}
```

---

## 📊 Populated Relationships

### Default Populate Fields
```javascript
['assignedTo', 'createdBy', 'updatedBy']
```

### Example Populated Response
```json
{
  "_id": "607f1f77bcf86cd799439012",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "assignedTo": {
    "_id": "607f1f77bcf86cd799439011",
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "jane@company.com",
    "role": "SENIOR_AGENT"
  },
  "createdBy": {
    "_id": "607f1f77bcf86cd799439010",
    "firstName": "Admin",
    "lastName": "User",
    "email": "admin@company.com"
  },
  "status": "QUALIFIED",
  "priority": "HIGH"
}
```

---

## 🔄 Async/Await Pattern

All repository methods use async/await for clean, readable code:

```javascript
// Good: Async/Await
async function processLeads() {
  try {
    const leads = await leadRepository.getAllLeads({ status: 'NEW_LEAD' });
    const updated = await leadRepository.updateLead(leadId, data, userId);
    return updated;
  } catch (error) {
    logger.error('Error:', error);
    throw error;
  }
}

// Parallel operations
const [leads, stats] = await Promise.all([
  leadRepository.getAllLeads({ limit: 50 }),
  leadRepository.getLeadStatistics()
]);
```

---

## 🧪 Testing Examples

### Unit Test Example
```javascript
describe('LeadRepository', () => {
  describe('createLead', () => {
    it('should create lead with valid data', async () => {
      const leadData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '+1-555-123-4567',
        source: 'WEBSITE'
      };
      
      const result = await leadRepository.createLead(leadData, userId);
      
      expect(result._id).toBeDefined();
      expect(result.email).toBe(leadData.email);
      expect(result.status).toBe('NEW_LEAD');
    });

    it('should throw error without required fields', async () => {
      try {
        await leadRepository.createLead({ firstName: 'John' });
        fail('Should have thrown');
      } catch (error) {
        expect(error.statusCode).toBe(400);
      }
    });
  });

  describe('searchLead', () => {
    it('should find leads by text search', async () => {
      const results = await leadRepository.searchLead('john apartment');
      expect(results.data.length).toBeGreaterThan(0);
      expect(results.pagination).toBeDefined();
    });

    it('should throw error for empty search term', async () => {
      try {
        await leadRepository.searchLead('');
        fail('Should have thrown');
      } catch (error) {
        expect(error.message).toContain('required');
      }
    });
  });
});
```

---

## 📈 Performance Considerations

### Indexing
Repository methods use indexed fields for optimal performance:
- `email`, `phone`, `status`, `source`, `priority`
- `assignedTo`, `createdAt`
- Compound indexes: (status, assignedTo), (source, priority)

### Pagination
Always paginate large datasets:
```javascript
// Good: Paginated
const leads = await leadRepository.getAllLeads({ page: 1, limit: 20 });

// Avoid: No pagination
const allLeads = await Lead.find({});
```

### Lean Queries
Search results use `.lean()` for better performance:
```javascript
// lean() returns plain JS objects (not Mongoose documents)
// Reduces memory usage for large result sets
```

### Parallel Queries
Use Promise.all for independent queries:
```javascript
const [leads, stats] = await Promise.all([
  leadRepository.getAllLeads({ limit: 50 }),
  leadRepository.getLeadStatistics()
]);
```

---

## 🔐 Security Features

### Soft Deletes
- Deleted records excluded from queries automatically
- Recoverable via restore() method
- Maintains audit trail with deletedAt timestamp

### Audit Trail
- createdBy: User who created the lead
- updatedBy: User who last updated
- createdAt/updatedAt: Timestamps
- deletedAt: When soft-deleted

### Input Validation
- Required fields checked
- Email format validated
- Status enum validated
- Protected fields cannot be updated

### Error Messages
- Safe error messages to clients
- Detailed logs for debugging
- Never exposes system details

---

## 📝 Logging

All repository operations are logged:

```
[INFO] Creating new lead: { email: 'john@example.com' }
[INFO] Lead created successfully: { leadId: '607f...', email: 'john@example.com' }
[INFO] Fetching lead by ID: { leadId: '607f...' }
[WARN] Lead not found: { leadId: '607f...' }
[INFO] Searching leads: { searchTerm: 'john apartment' }
[ERROR] Error searching leads: { error: '...' }
```

---

## 🎯 Best Practices

### ✅ DO
- Use pagination for large datasets
- Validate input parameters
- Handle errors appropriately
- Log important operations
- Use parallel queries when possible
- Populate necessary relationships
- Use lean() for read-only operations

### ❌ DON'T
- Fetch all documents without pagination
- Skip error handling
- Expose sensitive error details
- Perform multiple queries sequentially when parallel works
- Update protected fields
- Forget to add audit trail data

---

## 🔗 Integration with Service Layer

Example service using repository:

```javascript
class LeadService {
  async createLeadWithEmployee(leadData, employeeId, userId) {
    // Create lead
    const lead = await leadRepository.createLead(
      { ...leadData, assignedTo: employeeId },
      userId
    );
    
    // Update employee metrics
    await employeeRepository.updateMetrics(employeeId);
    
    // Log activity
    await activityRepository.createActivity({
      lead: lead._id,
      employee: employeeId,
      type: 'TASK',
      subject: 'New Lead Created',
      description: `Lead ${lead.fullName} created`
    }, userId);
    
    return lead;
  }

  async getAllLeadsForDashboard(userId, options = {}) {
    return await leadRepository.getAllLeads({
      ...options,
      assignedTo: userId
    });
  }

  async searchLeads(query, options = {}) {
    try {
      return await leadRepository.searchLead(query, options);
    } catch (error) {
      throw new Error(`Search failed: ${error.message}`);
    }
  }
}
```

---

## 📚 Related Files

- Repository: [src/repositories/LeadRepository.js](src/repositories/LeadRepository.js)
- Base Repository: [src/repositories/BaseRepository.js](src/repositories/BaseRepository.js)
- Lead Model: [src/models/Lead.js](src/models/Lead.js)
- Service Layer: [src/services/LeadService.js](src/services/LeadService.js)
- Constants: [src/constants/index.js](src/constants/index.js)
- Logger: [src/utils/logger.js](src/utils/logger.js)

---

## ✨ Summary

The Lead Repository provides:
- ✅ 7 primary CRUD methods
- ✅ 9 additional query methods
- ✅ Comprehensive error handling
- ✅ Clean async/await code
- ✅ Logging and audit trails
- ✅ Performance optimization
- ✅ Security and validation
- ✅ Relationship population
- ✅ Pagination support
- ✅ Full-text search

Ready for production use!
