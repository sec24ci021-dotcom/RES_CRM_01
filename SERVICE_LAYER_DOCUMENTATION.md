# Service Layer Documentation

## Overview

The Service Layer implements comprehensive business logic for the Lead Management System following SOLID principles. It acts as an orchestration layer between Controllers and Repositories, encapsulating all business rules, validation, duplicate prevention, auto-assignment, and activity logging.

**Architecture Position:**
```
Controller Layer (HTTP) 
    ↓
Service Layer (Business Logic) ← YOU ARE HERE
    ↓
Repository Layer (Data Access)
    ↓
Model Layer (Mongoose)
    ↓
Database Layer (MongoDB)
```

---

## Service Components

### 1. LeadValidationService
**File:** `src/services/LeadValidationService.js`
**Purpose:** Centralized validation logic for lead data
**Pattern:** Static methods (stateless)
**Principle:** Single Responsibility - Validation only

#### Methods

##### `validateLeadForCreation(leadData)`
Validates all required fields for new lead creation.

**Parameters:**
- `leadData` (Object) - Lead data to validate

**Validates:**
- `firstName` - Required, 2-50 chars
- `lastName` - Required, 2-50 chars
- `email` - Required, valid format
- `phone` - Required, valid international format
- `source` - Required, valid LEAD_SOURCE enum

**Throws:** `ValidationException` with field-level details

**Example:**
```javascript
try {
    LeadValidationService.validateLeadForCreation({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        source: 'WEBSITE'
    });
} catch (error) {
    console.log(error.details); // Field-level errors
}
```

---

##### `validateLeadForUpdate(updateData)`
Partial validation for lead updates.

**Parameters:**
- `updateData` (Object) - Data to update

**Prevents updating:**
- `_id`, `createdAt`, `createdBy`, `isDeleted`, `deletedAt`

**Validates (if provided):**
- `status`, `priority`, `email`, `phone` formats

**Throws:** `ValidationException` if protected fields modified

---

##### `validateStatusTransition(currentStatus, newStatus)`
Validates allowed status transitions.

**Transitions Matrix:**
```
NEW_LEAD      → CONTACTED, QUALIFIED, LOST, INACTIVE
CONTACTED     → QUALIFIED, IN_NEGOTIATION, LOST, INACTIVE
QUALIFIED     → IN_NEGOTIATION, LOST, INACTIVE
IN_NEGOTIATION → CONVERTED, LOST, INACTIVE
CONVERTED     → (terminal - no transitions)
LOST          → INACTIVE
INACTIVE      → NEW_LEAD, CONTACTED
```

**Throws:** `BusinessLogicException` for invalid transitions

**Example:**
```javascript
// Valid transition
LeadValidationService.validateStatusTransition('NEW_LEAD', 'CONTACTED');

// Invalid transition - throws error
LeadValidationService.validateStatusTransition('CONVERTED', 'LOST');
```

---

##### `validateLocation(location, errors)`
Validates geographic coordinates and address.

**Validates:**
- `latitude` - Between -90 and 90
- `longitude` - Between -180 and 180
- `zipCode` - Valid format

**Returns:** Updated errors object

---

##### `validatePriority(priority)`
Validates priority enum.

**Valid values:** `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`

**Throws:** `ValidationException` for invalid priority

---

##### `validateSearchTerm(searchTerm)`
Validates search term.

**Rules:**
- Not empty
- 2-100 characters

**Throws:** `ValidationException` if invalid

---

##### `validateFilters(filters)`
Validates filter criteria.

**Checks:**
- Budget range logic (`minBudget` ≤ `maxBudget`)
- Valid status values
- Valid priority values
- Valid source values

**Throws:** `ValidationException` for invalid filters

---

##### `validatePagination(page, limit)`
Validates pagination parameters.

**Rules:**
- `page` ≥ 1
- `limit` between 1-100

**Throws:** `ValidationException` for invalid pagination

---

##### `validateAssignment(leadId, employeeId)`
Validates lead assignment data.

**Rules:**
- Both IDs present
- Valid UUID format

**Throws:** `ValidationException` if invalid

---

### 2. DuplicateCheckService
**File:** `src/services/DuplicateCheckService.js`
**Purpose:** Prevent and detect duplicate leads
**Pattern:** Static methods (stateless)
**Principle:** Single Responsibility - Duplicate detection only

#### Methods

##### `checkDuplicateEmail(email, excludeLeadId)`
Checks for existing lead with same email.

**Parameters:**
- `email` (string) - Email to check
- `excludeLeadId` (string, optional) - Lead ID to exclude (for updates)

**Returns:** Existing lead object or null

**Scenario: Create new lead**
```javascript
const existingLead = await DuplicateCheckService.checkDuplicateEmail(
    'john@example.com'
);
if (existingLead) {
    throw new DuplicateException('Email already exists', existingLead);
}
```

**Scenario: Update lead's email**
```javascript
const existingLead = await DuplicateCheckService.checkDuplicateEmail(
    'newemail@example.com',
    leadId // Allows same lead to update own email
);
```

---

##### `checkDuplicatePhone(phone, excludeLeadId)`
Checks for existing lead with same phone.

**Parameters:**
- `phone` (string) - Phone to check
- `excludeLeadId` (string, optional) - Lead ID to exclude

**Returns:** Existing lead object or null

---

##### `checkForDuplicate(email, phone, excludeLeadId)`
Combined duplicate check for email AND phone.

**Throws:** `DuplicateException` with existing lead details if either found

**Existing Lead Details Returned:**
```javascript
{
    _id: ObjectId,
    firstName: string,
    lastName: string,
    email: string,
    phone: string,
    source: string,
    status: string
}
```

**Example:**
```javascript
try {
    await DuplicateCheckService.checkForDuplicate(
        'john@example.com',
        '+1234567890'
    );
} catch (error) {
    if (error instanceof DuplicateException) {
        console.log('Existing lead:', error.existingResource);
        // Use to show merge options to user
    }
}
```

---

##### `checkForNearDuplicates(firstName, lastName, city)`
Detects similar names in same city (data quality check).

**Uses:** Regex pattern matching on first/last names

**Returns:** Array of potential duplicate leads

**Purpose:** Alert users to possible duplicates before creation

**Example:**
```javascript
const nearDuplicates = await DuplicateCheckService.checkForNearDuplicates(
    'John', 'Doe', 'New York'
);
if (nearDuplicates.length > 0) {
    console.warn('Similar leads found:', nearDuplicates);
    // Could prompt user to verify
}
```

---

##### `checkDuplicateInSource(email, source)`
Prevents multiple conversions from same source.

**Business Rule:** Don't allow same email from same source twice

**Parameters:**
- `email` (string) - Email address
- `source` (string) - Lead source (WEBSITE, FACEBOOK, etc.)

**Returns:** Existing lead or null

**Example:**
```javascript
// Prevent duplicate form submissions from website
const existing = await DuplicateCheckService.checkDuplicateInSource(
    'user@example.com',
    'WEBSITE'
);
```

---

##### `mergeDuplicateLeads(primaryLeadId, duplicateLeadId, mergeStrategy)`
Consolidates duplicate leads into primary lead.

**Parameters:**
- `primaryLeadId` (string) - Lead to keep
- `duplicateLeadId` (string) - Lead to merge into primary
- `mergeStrategy` (Object) - How to merge (optional)

**Merge Process:**
1. Combines activity histories
2. Preserves primary lead data
3. Consolidates notes with merge marker
4. Soft-deletes duplicate lead
5. Returns merged lead

**Example:**
```javascript
const merged = await DuplicateCheckService.mergeDuplicateLeads(
    primaryLeadId,
    duplicateLeadId,
    { source: 'REFERRAL' } // Custom merge strategy
);
console.log('Merged lead:', merged);
```

---

##### `findPotentialDuplicates()`
Finds all potential duplicates in system.

**Uses:** MongoDB aggregation pipeline
**Criteria:** Groups by email, counts > 1
**Returns:** Array of duplicate groups

**Example Response:**
```javascript
[
    {
        _id: 'john@example.com',
        count: 2,
        leads: [
            { _id: ObjectId1, firstName: 'John', lastName: 'Doe' },
            { _id: ObjectId2, firstName: 'John', lastName: 'Doe' }
        ]
    },
    // ... more groups
]
```

---

##### `getDuplicateReport()`
Generates comprehensive duplicate report.

**Returns:**
```javascript
{
    totalDuplicateGroups: number,
    totalDuplicateLeads: number,
    duplicates: Array,
    generatedAt: ISO-8601 timestamp
}
```

**Use Cases:**
- Data quality monitoring
- Merge planning
- System health checks

---

### 3. AutoAssignmentService
**File:** `src/services/AutoAssignmentService.js`
**Purpose:** Automatically assign leads to agents
**Pattern:** Static methods with strategy pattern
**Principle:** Single Responsibility - Assignment only

#### Assignment Strategies

##### Strategy: LOAD_BALANCED (Recommended)
Assigns to agent with fewest active leads.

**Business Value:** Equal workload distribution
**Best For:** General use, fair distribution
**Example:**
```javascript
const agent = await AutoAssignmentService.autoAssignLead(
    lead,
    AutoAssignmentService.STRATEGIES.LOAD_BALANCED
);
```

---

##### Strategy: PERFORMANCE_BASED
Assigns to agent with highest conversion rate.

**Business Value:** High-value leads handled by top performers
**Best For:** High-priority leads (CRITICAL priority)
**Metric Used:** `performance.conversionRate`

---

##### Strategy: SKILL_BASED
Assigns based on agent specialization.

**Factors Considered:**
- Property type specialization
- Geographic territory coverage
- Budget range expertise

**Best For:** Specialized properties or markets

---

##### Strategy: ROUND_ROBIN
Cycles through agents sequentially.

**Business Value:** Simple, fair distribution
**Best For:** Simple workload distribution

---

##### Strategy: AVAILABILITY_BASED
Assigns to most available agent.

**Factors:**
- Working hours (9-5, 9-6, etc.)
- Current time-of-day
- Holiday availability

**Best For:** Time-sensitive assignments

---

#### Methods

##### `autoAssignLead(lead, strategy)`
Auto-assigns lead using specified strategy.

**Parameters:**
- `lead` (Object) - Lead to assign
- `strategy` (string) - Assignment strategy

**Returns:** Assigned employee object

**Throws:** `AutoAssignmentException` if no agents available

**Example:**
```javascript
try {
    const assignedAgent = await AutoAssignmentService.autoAssignLead(
        newLead,
        AutoAssignmentService.STRATEGIES.LOAD_BALANCED
    );
    console.log(`Assigned to: ${assignedAgent.firstName} ${assignedAgent.lastName}`);
} catch (error) {
    console.warn('No agents available, manual assignment needed');
}
```

---

##### `bulkAssignLeads(leadIds, agentId)`
Assigns multiple leads to specific agent.

**Parameters:**
- `leadIds` (Array<string>) - Lead IDs to assign
- `agentId` (string) - Target agent ID

**Returns:** Assignment result with modified count

**Example:**
```javascript
const result = await AutoAssignmentService.bulkAssignLeads(
    ['lead1', 'lead2', 'lead3'],
    'agent123'
);
console.log(`Assigned ${result.modifiedCount} leads`);
```

---

##### `rebalanceAssignments()`
Redistributes leads for optimal load balancing.

**Process:**
1. Gets all active leads
2. Calculates ideal assignment
3. Reassigns misbalanced leads
4. Logs rebalancing activity

**Returns:** Rebalancing statistics

**Example:**
```javascript
const stats = await AutoAssignmentService.rebalanceAssignments();
console.log(`Rebalanced ${stats.reassignmentCount} leads`);
```

---

### 4. LeadService
**File:** `src/services/LeadService_Complete.js`
**Purpose:** Main orchestration service for lead operations
**Pattern:** Instance methods (orchestrator)
**Principle:** Facade pattern - coordinates domain services

#### Lifecycle Methods

##### `createLead(leadData, userId, options)`
Complete lead creation with all business rules.

**Business Flow:**
1. ✅ Validate lead data (LeadValidationService)
2. ✅ Check for duplicates (DuplicateCheckService)
3. ✅ Check for near-duplicates (warn user)
4. ✅ Create lead (Repository)
5. ✅ Auto-assign agent (AutoAssignmentService)
6. ✅ Log creation activity (ActivityRepository)

**Parameters:**
- `leadData` (Object) - Lead data
- `userId` (string) - Creating user ID
- `options` (Object) - Optional settings:
  - `autoAssign` (boolean, default: true) - Enable auto-assignment
  - `assignmentStrategy` (string) - Strategy to use

**Returns:** Created lead with assignment details

**Example:**
```javascript
const lead = await LeadService.createLead(
    {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        phone: '+1987654321',
        source: 'WEBSITE',
        budget: 250000,
        location: { city: 'Toronto', coordinates: { lat: 43.6629, lon: -79.3957 } }
    },
    'user123',
    { autoAssign: true, assignmentStrategy: 'LOAD_BALANCED' }
);
console.log('Created lead:', lead);
console.log('Assigned to:', lead.assignedTo.firstName);
```

---

##### `updateLeadStatus(leadId, newStatus, userId)`
Updates lead status with validation.

**Process:**
1. Fetch existing lead
2. Validate status transition
3. Update status
4. Log activity with old/new status

**Parameters:**
- `leadId` (string) - Lead ID
- `newStatus` (string) - New status
- `userId` (string) - User performing update

**Returns:** Updated lead

**Example:**
```javascript
const updated = await LeadService.updateLeadStatus(
    'lead123',
    'QUALIFIED',
    'user456'
);
console.log('Status changed to:', updated.status);
```

---

##### `convertLead(leadId, conversionValue, userId)`
Convert lead to customer.

**Process:**
1. Validate conversion value (> 0)
2. Update status to CONVERTED
3. Record conversion value
4. Update agent performance metrics
5. Log conversion activity

**Parameters:**
- `leadId` (string) - Lead ID
- `conversionValue` (number) - Deal value
- `userId` (string) - User converting

**Returns:** Converted lead

**Example:**
```javascript
const converted = await LeadService.convertLead(
    'lead123',
    500000, // $500,000 deal
    'user456'
);
console.log('Conversion value recorded:', converted.conversionValue);
```

---

##### `markLeadAsLost(leadId, reason, userId)`
Mark lead as lost with reason.

**Process:**
1. Validate new status transition
2. Update status to LOST
3. Record loss reason and date
4. Log activity

**Parameters:**
- `leadId` (string) - Lead ID
- `reason` (string) - Why lead was lost
- `userId` (string) - User marking as lost

**Returns:** Updated lead

**Example:**
```javascript
await LeadService.markLeadAsLost(
    'lead123',
    'Customer chose competitor pricing',
    'user456'
);
```

---

#### Query Methods

##### `getLeadById(leadId)`
Fetch single lead with relationships.

**Returns:** Lead with populated employee and activity references

**Throws:** `NotFoundException` if lead not found

**Example:**
```javascript
const lead = await LeadService.getLeadById('lead123');
console.log(lead.assignedTo.firstName); // Populated employee
```

---

##### `getAllLeads(filters, page, limit)`
Get leads with filtering and pagination.

**Parameters:**
- `filters` (Object) - Filter criteria:
  - `status` - Single or array of statuses
  - `source` - Lead source
  - `priority` - Priority level
  - `minBudget`, `maxBudget` - Budget range
  - `assignedTo` - Agent ID
- `page` (number, default: 1)
- `limit` (number, default: 10)

**Returns:** Paginated results with metadata

**Example:**
```javascript
const results = await LeadService.getAllLeads(
    { status: 'QUALIFIED', priority: 'HIGH' },
    1,
    20
);
console.log(`Found ${results.data.length} leads`);
console.log(`Page ${results.pagination.page} of ${results.pagination.pages}`);
```

---

##### `searchLeads(searchTerm, options)`
Full-text search on leads.

**Returns:** Search results

**Example:**
```javascript
const results = await LeadService.searchLeads('john smith');
```

---

##### `filterLeads(filters, options)`
Advanced filtering with multiple criteria.

**Returns:** Filtered leads

---

##### `getLeadStatistics(filters)`
Get statistics (counts by status, source, etc.)

**Returns:** Statistical summary

**Example:**
```javascript
const stats = await LeadService.getLeadStatistics({ source: 'WEBSITE' });
console.log('New leads:', stats.byStatus.NEW_LEAD);
console.log('Conversion rate:', stats.conversionRate);
```

---

#### Assignment Methods

##### `assignLead(leadId, agentId, userId)`
Manually assign lead to agent.

**Process:**
1. Validate assignment data
2. Get agent details
3. Update assignment
4. Log activity

**Parameters:**
- `leadId` (string) - Lead ID
- `agentId` (string) - Agent to assign
- `userId` (string) - User performing assignment

**Returns:** Updated lead

**Example:**
```javascript
const assigned = await LeadService.assignLead(
    'lead123',
    'agent456',
    'user789'
);
```

---

##### `bulkAssignLeads(leadIds, agentId, userId)`
Assign multiple leads to agent.

**Returns:** Assignment result

---

##### `getUnassignedLeads(options)`
Get leads without assignment.

**Returns:** Unassigned leads

---

##### `rebalanceAssignments()`
Rebalance all lead assignments.

**Returns:** Rebalancing statistics

---

#### Duplicate Management

##### `getDuplicateReport()`
Generate duplicate report.

**Returns:** Report with duplicate groups and statistics

---

##### `mergeDuplicateLeads(primaryLeadId, duplicateLeadId, userId)`
Merge duplicate leads.

**Returns:** Merged lead

---

## Error Handling

### Exception Hierarchy

All services throw custom exceptions from `src/exceptions/index.js`:

```
AppException (base)
├── ValidationException (400)
│   └── Used by: LeadValidationService
├── DuplicateException (409)
│   └── Used by: DuplicateCheckService
├── NotFoundException (404)
│   └── Used by: LeadService
├── BusinessLogicException (422)
│   └── Used by: All services for business rule violations
└── AutoAssignmentException (503)
    └── Used by: AutoAssignmentService
```

### Exception Usage Pattern

```javascript
try {
    await LeadService.createLead(leadData, userId);
} catch (error) {
    if (error instanceof ValidationException) {
        // Handle validation errors
        console.log(error.details); // Field-level errors
    } else if (error instanceof DuplicateException) {
        // Handle duplicates
        console.log(error.existingResource); // Existing lead data
    } else if (error instanceof AutoAssignmentException) {
        // Handle auto-assignment failures
        console.log(error.reason); // Why assignment failed
    }
}
```

---

## SOLID Principles Implementation

### Single Responsibility Principle ✅
- **LeadValidationService**: Only validation
- **DuplicateCheckService**: Only duplicate detection
- **AutoAssignmentService**: Only assignment logic
- **LeadService**: Only orchestration and business rules

### Open/Closed Principle ✅
- Services use composition (AutoAssignmentService strategies)
- New strategies added without modifying existing code
- Exception hierarchy extensible for new exception types

### Liskov Substitution Principle ✅
- All exceptions inherit properly from AppException
- All repositories inherit from BaseRepository
- Can substitute repositories without breaking services

### Interface Segregation Principle ✅
- Services expose only necessary methods
- No bloated interfaces
- Focused, task-specific methods

### Dependency Inversion Principle ✅
- Services depend on abstractions (repositories)
- Not on concrete implementations
- Easy to mock for testing

---

## Usage in Controllers

```javascript
const LeadService = require('../services/LeadService_Complete');

// In controller route handler
router.post('/leads', async (req, res) => {
    try {
        const lead = await LeadService.createLead(
            req.body,
            req.user.id,
            { autoAssign: true }
        );
        res.status(201).json(lead);
    } catch (error) {
        // Error handler middleware catches and formats errors
        next(error);
    }
});
```

---

## Integration Points

**With Controllers:**
- Controllers call service methods
- Services return business objects
- Controllers format for HTTP response

**With Repositories:**
- Services call repository methods
- Repositories return database objects
- Services apply business logic

**With Models:**
- Repositories query using models
- Services don't directly access models
- Models handle data validation

**With Exceptions:**
- Services throw typed exceptions
- Error middleware handles formatting
- Clients receive standard error responses

---

## Testing Patterns

### Unit Testing Services

```javascript
describe('LeadService', () => {
    describe('createLead', () => {
        it('should validate lead data', async () => {
            const invalidLead = { firstName: 'John' }; // Missing required fields
            expect(() => LeadService.createLead(invalidLead, 'user123'))
                .toThrow(ValidationException);
        });

        it('should prevent duplicate emails', async () => {
            // Create first lead
            await LeadService.createLead(leadData, 'user123');
            
            // Try to create duplicate
            expect(() => LeadService.createLead(leadData, 'user123'))
                .toThrow(DuplicateException);
        });

        it('should auto-assign agent', async () => {
            const lead = await LeadService.createLead(leadData, 'user123');
            expect(lead.assignedTo).toBeDefined();
        });
    });
});
```

---

## Performance Considerations

1. **Duplicate Checks**: Use indexed email/phone fields
2. **Auto-Assignment**: Caches agent availability
3. **Aggregation Queries**: Use MongoDB aggregation pipeline
4. **Pagination**: Always use for large result sets

---

## Configuration

### Assignment Strategy Selection

```javascript
// In controller or service factory
const strategy = process.env.ASSIGNMENT_STRATEGY || 'LOAD_BALANCED';

const lead = await LeadService.createLead(leadData, userId, {
    autoAssign: true,
    assignmentStrategy: strategy
});
```

---

## Future Enhancements

1. **Advanced Duplicate Detection**: Fuzzy matching on names
2. **ML-based Assignment**: Performance prediction
3. **Activity Scoring**: Engagement prediction
4. **Batch Processing**: Queue-based bulk operations
5. **Webhooks**: External system integration
6. **Analytics**: Detailed reporting and dashboards

---

## Quick Reference

| Service | Responsibility | Key Methods |
|---------|-----------------|-------------|
| LeadValidationService | Input validation | validateLeadForCreation, validateStatusTransition |
| DuplicateCheckService | Duplicate prevention | checkForDuplicate, mergeDuplicateLeads |
| AutoAssignmentService | Lead assignment | autoAssignLead, rebalanceAssignments |
| LeadService | Business orchestration | createLead, updateLeadStatus, convertLead |

---

## Troubleshooting

**Problem:** Auto-assignment fails with `NO_AVAILABLE_AGENTS`
- **Solution:** Ensure employees exist with role SENIOR_AGENT or JUNIOR_AGENT
- **Action:** Check Employee table, add agents, verify status is ACTIVE

**Problem:** Duplicate check not working
- **Solution:** Verify email/phone indexes on Lead collection
- **Action:** Run `db.leads.createIndex({ email: 1 })` if needed

**Problem:** Status transition validation rejecting valid transition
- **Solution:** Check LEAD_STATUS values in constants
- **Action:** Verify status values match enum exactly (case-sensitive)

---

## Support & Contact

For issues or questions about the Service Layer, refer to:
- SOLID principles documentation
- Exception hierarchy documentation
- Repository layer documentation
