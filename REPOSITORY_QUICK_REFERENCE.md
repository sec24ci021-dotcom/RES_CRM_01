# Repository Layer - Quick Reference

Quick lookup guide for the 7 primary Lead Repository functions.

---

## 🎯 The 7 Primary Functions

### 1️⃣ createLead(leadData, createdBy)

**Purpose**: Create a new lead

**Syntax**:
```javascript
const lead = await leadRepository.createLead(leadData, userId);
```

**Parameters**:
```javascript
leadData = {
  firstName: string (required),
  lastName: string (required),
  email: string (required),
  phone: string (required),
  source: string (required),
  priority: string (optional, default: MEDIUM),
  propertyId: string,
  budgetMin: number,
  budgetMax: number,
  location: {
    address: string,
    city: string,
    state: string,
    zipCode: string,
    coordinates: { latitude, longitude }
  },
  notes: string
}
createdBy: string (userId)
```

**Returns**: Promise<Lead> - Created lead object

**Error Handling**:
- HTTP 400: Missing required fields, invalid email format
- HTTP 500: Database error

**Example**:
```javascript
try {
  const newLead = await leadRepository.createLead({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    phone: '+1-555-123-4567',
    source: 'WEBSITE',
    priority: 'HIGH'
  }, userId);
  console.log('Lead created:', newLead._id);
} catch (error) {
  console.error('Creation failed:', error.message);
}
```

**Validation**:
- ✅ All 5 required fields present
- ✅ Email matches valid format
- ✅ Defaults status to NEW_LEAD
- ✅ Sets createdBy and timestamps

---

### 2️⃣ getLeadById(leadId, options)

**Purpose**: Retrieve a single lead by ID with optional relationship population

**Syntax**:
```javascript
const lead = await leadRepository.getLeadById(leadId, options);
```

**Parameters**:
```javascript
leadId: string (required) - MongoDB ObjectId
options = {
  populate: string[] (optional, default: ['assignedTo', 'createdBy', 'updatedBy']),
  select: string (optional) - Fields to include/exclude
}
```

**Returns**: Promise<Lead> - Lead object with populated references

**Error Handling**:
- HTTP 404: Lead not found or doesn't exist
- HTTP 400: Invalid ID format
- HTTP 500: Database error

**Example**:
```javascript
// Basic retrieval
const lead = await leadRepository.getLeadById(leadId);

// With specific fields only
const lead = await leadRepository.getLeadById(leadId, {
  select: 'firstName lastName email status'
});

// With specific relationships
const lead = await leadRepository.getLeadById(leadId, {
  populate: ['assignedTo']
});
```

**Features**:
- ✅ Auto-populates assigned employee
- ✅ Supports selective field retrieval
- ✅ Excludes soft-deleted leads
- ✅ Full error handling

---

### 3️⃣ getAllLeads(options)

**Purpose**: Retrieve paginated list of all leads with filtering

**Syntax**:
```javascript
const results = await leadRepository.getAllLeads(options);
```

**Parameters**:
```javascript
options = {
  page: number (default: 1),
  limit: number (default: 10),
  sort: object (default: { createdAt: -1 }),
  status: string (optional),      // Filter by status
  priority: string (optional),    // Filter by priority
  source: string (optional),      // Filter by source
  assignedTo: string (optional)   // Filter by agent
}
```

**Returns**: Promise<Object>
```javascript
{
  data: [lead objects],
  pagination: {
    page: number,
    limit: number,
    total: number,
    pages: number
  }
}
```

**Example**:
```javascript
// Get all leads
const results = await leadRepository.getAllLeads({ page: 1, limit: 20 });

// Filtered leads
const qualified = await leadRepository.getAllLeads({
  page: 1,
  limit: 20,
  status: 'QUALIFIED',
  priority: 'HIGH'
});

// Agent's leads
const agentLeads = await leadRepository.getAllLeads({
  page: 1,
  limit: 50,
  assignedTo: employeeId
});
```

**Features**:
- ✅ Automatic pagination
- ✅ Multi-criteria filtering
- ✅ Sorting support
- ✅ Relationship population

---

### 4️⃣ updateLead(leadId, updateData, updatedBy)

**Purpose**: Update an existing lead

**Syntax**:
```javascript
const updated = await leadRepository.updateLead(leadId, updateData, userId);
```

**Parameters**:
```javascript
leadId: string (required) - MongoDB ObjectId
updateData = {
  firstName: string,
  lastName: string,
  email: string,
  phone: string,
  status: string,
  priority: string,
  notes: string,
  // ... any other fields
}
updatedBy: string (userId)
```

**Returns**: Promise<Lead> - Updated lead object

**Error Handling**:
- HTTP 404: Lead not found
- HTTP 400: Invalid status enum
- HTTP 500: Database error

**Example**:
```javascript
// Update status
const updated = await leadRepository.updateLead(
  leadId,
  { status: 'QUALIFIED' },
  userId
);

// Update multiple fields
const updated = await leadRepository.updateLead(
  leadId,
  {
    status: 'QUALIFIED',
    priority: 'HIGH',
    assignedTo: agentId,
    notes: 'Updated information'
  },
  userId
);
```

**Features**:
- ✅ Validates status enum
- ✅ Prevents protected field updates
- ✅ Tracks updatedBy and timestamp
- ✅ Runs Mongoose validators

---

### 5️⃣ deleteLead(leadId, deletedBy)

**Purpose**: Soft delete a lead (mark as deleted)

**Syntax**:
```javascript
const deleted = await leadRepository.deleteLead(leadId, userId);
```

**Parameters**:
```javascript
leadId: string (required) - MongoDB ObjectId
deletedBy: string (userId)
```

**Returns**: Promise<Lead> - Deleted lead object

**Error Handling**:
- HTTP 404: Lead not found
- HTTP 500: Database error

**Example**:
```javascript
const deleted = await leadRepository.deleteLead(leadId, userId);

// Verify it's soft-deleted
console.log(deleted.isDeleted);        // true
console.log(deleted.deletedAt);        // timestamp
```

**Features**:
- ✅ Soft delete (recoverable)
- ✅ Sets deletedAt timestamp
- ✅ Excludes from getAllLeads
- ✅ Tracks who deleted

---

### 6️⃣ searchLead(searchTerm, options)

**Purpose**: Full-text search across lead fields

**Syntax**:
```javascript
const results = await leadRepository.searchLead(searchTerm, options);
```

**Parameters**:
```javascript
searchTerm: string (required) - Non-empty search query
options = {
  page: number (default: 1),
  limit: number (default: 10)
}
```

**Returns**: Promise<Object>
```javascript
{
  data: [matching leads],
  pagination: { page, limit, total, pages },
  query: searchTerm
}
```

**Searchable Fields**:
- firstName
- lastName
- email
- phone
- notes

**Example**:
```javascript
// Search by name
const results = await leadRepository.searchLead('john', {
  page: 1,
  limit: 20
});

// Search by email
const results = await leadRepository.searchLead('john@example.com', {
  page: 1,
  limit: 20
});

// Search by notes
const results = await leadRepository.searchLead('apartment manhattan', {
  page: 1,
  limit: 20
});
```

**Features**:
- ✅ Full-text search with relevance scoring
- ✅ Case-insensitive
- ✅ Paginated results
- ✅ Returns query in response

---

### 7️⃣ filterLead(filters, options)

**Purpose**: Advanced filtering with multiple criteria

**Syntax**:
```javascript
const results = await leadRepository.filterLead(filters, options);
```

**Parameters**:
```javascript
filters = {
  status: string,              // NEW_LEAD, QUALIFIED, CONVERTED, etc.
  priority: string,            // LOW, MEDIUM, HIGH, CRITICAL
  source: string,              // WEBSITE, REFERRAL, etc.
  assignedTo: string,          // Employee ID
  conversionStatus: string,
  minBudget: number,
  maxBudget: number,
  city: string,
  campaign: string,
  propertyId: string
}
options = {
  page: number (default: 1),
  limit: number (default: 10),
  sort: object
}
```

**Returns**: Promise<Object>
```javascript
{
  data: [filtered leads],
  pagination: { page, limit, total, pages }
}
```

**Example**:
```javascript
// Filter by single criteria
const qualified = await leadRepository.filterLead({
  status: 'QUALIFIED'
}, { page: 1, limit: 20 });

// Filter by multiple criteria
const results = await leadRepository.filterLead({
  status: 'QUALIFIED',
  priority: 'HIGH',
  source: 'WEBSITE',
  minBudget: 500000,
  maxBudget: 1000000,
  city: 'New York'
}, { page: 1, limit: 50 });
```

**Features**:
- ✅ Multi-criteria filtering
- ✅ Budget range support
- ✅ City filtering (case-insensitive)
- ✅ Pagination support

---

## ⚡ Common Patterns

### Pattern 1: Create & Assign
```javascript
const lead = await leadRepository.createLead(data, userId);
const assigned = await leadRepository.updateLead(
  lead._id,
  { assignedTo: agentId },
  userId
);
```

### Pattern 2: Search & Filter
```javascript
// First search
const search = await leadRepository.searchLead('query', { page: 1 });

// Then filter results
const filtered = await leadRepository.filterLead({
  status: 'QUALIFIED',
  source: 'WEBSITE'
}, { page: 1 });
```

### Pattern 3: Bulk Update
```javascript
const leads = await leadRepository.getAllLeads({
  status: 'NEW_LEAD',
  limit: 100
});

const ids = leads.data.map(l => l._id);
const result = await leadRepository.bulkUpdate(ids, {
  status: 'CONTACTED'
});
```

### Pattern 4: Error Handling
```javascript
try {
  const lead = await leadRepository.getLeadById(id);
  if (!lead) {
    throw new Error('Lead not found');
  }
  return lead;
} catch (error) {
  if (error.statusCode === 404) {
    // Handle not found
  } else if (error.statusCode === 400) {
    // Handle validation error
  } else {
    // Handle server error
  }
}
```

---

## 🔍 Valid Enum Values

### Status
```javascript
'NEW_LEAD'
'CONTACTED'
'QUALIFIED'
'IN_NEGOTIATION'
'CONVERTED'
'LOST'
'INACTIVE'
```

### Priority
```javascript
'LOW'
'MEDIUM'
'HIGH'
'CRITICAL'
```

### Source
```javascript
'WEBSITE'
'FACEBOOK'
'GOOGLE_ADS'
'REFERRAL'
'WALK_IN'
'CALL'
'EMAIL'
```

---

## 📊 Response Structure

### Create Response
```json
{
  "_id": "607f1f77bcf86cd799439012",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "+1-555-123-4567",
  "source": "WEBSITE",
  "status": "NEW_LEAD",
  "priority": "MEDIUM",
  "createdAt": "2024-01-01T10:00:00Z",
  "updatedAt": "2024-01-01T10:00:00Z",
  "createdBy": "userId123",
  "isDeleted": false
}
```

### Paginated Response
```json
{
  "data": [{ lead objects }],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 150,
    "pages": 15
  }
}
```

### Search Response
```json
{
  "data": [{ lead objects }],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  },
  "query": "john apartment"
}
```

---

## ✅ Input Validation

### createLead Required Fields
- ❌ Missing: firstName, lastName, email, phone, source
- ✅ Present: All above
- ✅ Email format valid
- ✅ Phone format valid

### updateLead Status
- ✅ Must be valid enum value
- ❌ Custom statuses not allowed
- ✅ Empty status unchanged

### searchLead Term
- ❌ Empty or whitespace
- ✅ Min 1 character
- ✅ Up to any length

### filterLead Budget
- ✅ minBudget <= maxBudget
- ✅ Numeric values only
- ✅ Optional fields

---

## 🚀 Performance Tips

1. **Use Pagination** - Always paginate large datasets
2. **Select Fields** - Use `select` option to retrieve only needed fields
3. **Lean Queries** - Search uses lean() for better performance
4. **Indexes** - Queries use indexed fields for speed
5. **Batch Operations** - Use bulkUpdate for multiple changes

---

## 🔗 Integration

### In Service Layer
```javascript
const lead = await leadRepository.getLeadById(leadId);
// Add business logic
return lead;
```

### In Controller
```javascript
const results = await leadService.getAllLeads(options);
res.json(results);
```

---

## 📚 Complete Reference Files

- Full Documentation: [REPOSITORY_LAYER_DOCUMENTATION.md](REPOSITORY_LAYER_DOCUMENTATION.md)
- Usage Guide: [REPOSITORY_USAGE_GUIDE.md](REPOSITORY_USAGE_GUIDE.md)
- Testing Guide: [REPOSITORY_TESTING_GUIDE.md](REPOSITORY_TESTING_GUIDE.md)
- Repository Code: [src/repositories/LeadRepository.js](src/repositories/LeadRepository.js)
