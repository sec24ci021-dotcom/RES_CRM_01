# Service Layer Quick Reference

## Service Files

| File | Location | Purpose |
|------|----------|---------|
| **LeadValidationService** | `src/services/LeadValidationService.js` | Input validation |
| **DuplicateCheckService** | `src/services/DuplicateCheckService.js` | Duplicate prevention |
| **AutoAssignmentService** | `src/services/AutoAssignmentService.js` | Lead assignment |
| **LeadService_Complete** | `src/services/LeadService_Complete.js` | Main orchestration |
| **EmployeeRepository** | `src/repositories/EmployeeRepository.js` | Employee data access |
| **ActivityRepository** | `src/repositories/ActivityRepository.js` | Activity logging |

---

## Validation Service

### Quick API

```javascript
const LeadValidationService = require('../services/LeadValidationService');

// Validate creation
LeadValidationService.validateLeadForCreation(leadData);
// Throws: ValidationException with details object

// Validate update
LeadValidationService.validateLeadForUpdate(updateData);

// Validate status change
LeadValidationService.validateStatusTransition('NEW_LEAD', 'CONTACTED');

// Validate search term
LeadValidationService.validateSearchTerm('john');

// Validate pagination
LeadValidationService.validatePagination(page, limit);

// Validate filters
LeadValidationService.validateFilters({
    status: 'QUALIFIED',
    minBudget: 100000,
    maxBudget: 500000
});
```

### Status Transitions Map

```
NEW_LEAD      → CONTACTED, QUALIFIED, LOST, INACTIVE
CONTACTED     → QUALIFIED, IN_NEGOTIATION, LOST, INACTIVE
QUALIFIED     → IN_NEGOTIATION, LOST, INACTIVE
IN_NEGOTIATION → CONVERTED, LOST, INACTIVE
CONVERTED     → (terminal)
LOST          → INACTIVE
INACTIVE      → NEW_LEAD, CONTACTED
```

---

## Duplicate Check Service

### Quick API

```javascript
const DuplicateCheckService = require('../services/DuplicateCheckService');

// Check single email
await DuplicateCheckService.checkDuplicateEmail('john@example.com');

// Check email with exclusion (for updates)
await DuplicateCheckService.checkDuplicateEmail('john@example.com', leadId);

// Check both email and phone
try {
    await DuplicateCheckService.checkForDuplicate(email, phone);
} catch (error) {
    console.log(error.existingResource); // Existing lead details
}

// Check for near duplicates
const similar = await DuplicateCheckService.checkForNearDuplicates(
    'John', 'Doe', 'Toronto'
);

// Merge duplicates
await DuplicateCheckService.mergeDuplicateLeads(primaryId, duplicateId);

// Get report
const report = await DuplicateCheckService.getDuplicateReport();
```

---

## Auto Assignment Service

### Quick API

```javascript
const AutoAssignmentService = require('../services/AutoAssignmentService');

// Assignment Strategies
const STRATEGIES = {
    LOAD_BALANCED: 'LOAD_BALANCED',      // Fewest active leads
    PERFORMANCE_BASED: 'PERFORMANCE_BASED', // Highest conversion rate
    SKILL_BASED: 'SKILL_BASED',         // Best skills match
    ROUND_ROBIN: 'ROUND_ROBIN',         // Next in rotation
    AVAILABILITY_BASED: 'AVAILABILITY_BASED' // Most available now
};

// Auto assign single lead
const agent = await AutoAssignmentService.autoAssignLead(
    lead,
    AutoAssignmentService.STRATEGIES.LOAD_BALANCED
);

// Bulk assign multiple leads
await AutoAssignmentService.bulkAssignLeads(leadIds, agentId);

// Rebalance all assignments
const stats = await AutoAssignmentService.rebalanceAssignments();
```

---

## Lead Service (Main)

### Lead Lifecycle

```javascript
const LeadService = require('../services/LeadService_Complete');

// 1. CREATE
const lead = await LeadService.createLead(leadData, userId, {
    autoAssign: true,
    assignmentStrategy: 'LOAD_BALANCED'
});

// 2. READ
const single = await LeadService.getLeadById(leadId);
const page = await LeadService.getAllLeads(filters, page, limit);
const results = await LeadService.searchLeads(searchTerm);

// 3. UPDATE
const updated = await LeadService.updateLead(leadId, updateData, userId);
const statusUpdated = await LeadService.updateLeadStatus(leadId, newStatus, userId);

// 4. ASSIGN
await LeadService.assignLead(leadId, agentId, userId);
await LeadService.bulkAssignLeads(leadIds, agentId, userId);

// 5. CONVERT
await LeadService.convertLead(leadId, conversionValue, userId);

// 6. LOSE
await LeadService.markLeadAsLost(leadId, reason, userId);

// 7. DELETE
await LeadService.deleteLead(leadId, userId);

// 8. ANALYTICS
const stats = await LeadService.getLeadStatistics(filters);
const report = await LeadService.getDuplicateReport();
```

---

## Error Handling

### Exception Types & Codes

```javascript
const {
    ValidationException,      // 400 VALIDATION_ERROR
    DuplicateException,       // 409 DUPLICATE_ENTRY
    NotFoundException,        // 404 RESOURCE_NOT_FOUND
    BusinessLogicException,   // 422 BUSINESS_RULE_VIOLATION
    AutoAssignmentException   // 503 AUTO_ASSIGNMENT_FAILED
} = require('../exceptions');

// Catch and handle
try {
    await LeadService.createLead(leadData, userId);
} catch (error) {
    if (error instanceof ValidationException) {
        res.status(400).json(error.toJSON());
    } else if (error instanceof DuplicateException) {
        res.status(409).json(error.toJSON());
    } else if (error instanceof AutoAssignmentException) {
        res.status(503).json(error.toJSON());
    } else {
        res.status(500).json(error.toJSON());
    }
}
```

---

## Controller Integration Example

```javascript
const express = require('express');
const LeadService = require('../services/LeadService_Complete');
const router = express.Router();

// Create lead
router.post('/leads', async (req, res, next) => {
    try {
        const lead = await LeadService.createLead(
            req.body,
            req.user.id,
            { autoAssign: true }
        );
        res.status(201).json({
            success: true,
            data: lead,
            message: 'Lead created and assigned to agent'
        });
    } catch (error) {
        next(error); // Pass to error middleware
    }
});

// Update lead status
router.patch('/leads/:id/status', async (req, res, next) => {
    try {
        const updated = await LeadService.updateLeadStatus(
            req.params.id,
            req.body.status,
            req.user.id
        );
        res.json({ success: true, data: updated });
    } catch (error) {
        next(error);
    }
});

// Assign lead
router.post('/leads/:id/assign', async (req, res, next) => {
    try {
        const assigned = await LeadService.assignLead(
            req.params.id,
            req.body.agentId,
            req.user.id
        );
        res.json({ success: true, data: assigned });
    } catch (error) {
        next(error);
    }
});

// Convert lead
router.post('/leads/:id/convert', async (req, res, next) => {
    try {
        const converted = await LeadService.convertLead(
            req.params.id,
            req.body.value,
            req.user.id
        );
        res.json({ success: true, data: converted });
    } catch (error) {
        next(error);
    }
});

// Get statistics
router.get('/leads/stats', async (req, res, next) => {
    try {
        const stats = await LeadService.getLeadStatistics(req.query);
        res.json({ success: true, data: stats });
    } catch (error) {
        next(error);
    }
});
```

---

## Filter Examples

### Single Status
```javascript
const results = await LeadService.getAllLeads(
    { status: 'QUALIFIED' },
    1, 10
);
```

### Multiple Statuses
```javascript
const results = await LeadService.getAllLeads(
    { status: ['QUALIFIED', 'IN_NEGOTIATION'] },
    1, 10
);
```

### Budget Range
```javascript
const results = await LeadService.getAllLeads(
    { 
        minBudget: 100000,
        maxBudget: 500000
    },
    1, 10
);
```

### By Source
```javascript
const results = await LeadService.getAllLeads(
    { source: 'WEBSITE' },
    1, 10
);
```

### By Priority
```javascript
const results = await LeadService.getAllLeads(
    { priority: 'HIGH' },
    1, 10
);
```

### By Agent
```javascript
const results = await LeadService.getAllLeads(
    { assignedTo: 'agent123' },
    1, 10
);
```

### Combined Filters
```javascript
const results = await LeadService.getAllLeads(
    {
        status: ['QUALIFIED', 'IN_NEGOTIATION'],
        priority: 'HIGH',
        source: 'WEBSITE',
        minBudget: 250000
    },
    1, 20
);
```

---

## Common Workflows

### Workflow: New Lead Creation
```javascript
// Step 1-6 handled by LeadService.createLead()
const lead = await LeadService.createLead(
    {
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane@example.com',
        phone: '+1234567890',
        source: 'WEBSITE'
    },
    userId,
    { autoAssign: true }
);

// Lead now has:
// ✅ Validated data
// ✅ Duplicate check passed
// ✅ Assigned to agent
// ✅ Creation logged
console.log('Assigned to:', lead.assignedTo.firstName);
```

### Workflow: Lead Qualification
```javascript
// Validate status transition
LeadValidationService.validateStatusTransition('CONTACTED', 'QUALIFIED');

// Update status
const qualified = await LeadService.updateLeadStatus(
    leadId,
    'QUALIFIED',
    userId
);

// Status change is:
// ✅ Validated
// ✅ Updated in database
// ✅ Activity logged
```

### Workflow: Lead Conversion
```javascript
const converted = await LeadService.convertLead(
    leadId,
    500000, // Deal value
    userId
);

// Conversion includes:
// ✅ Status changed to CONVERTED
// ✅ Conversion value recorded
// ✅ Agent metrics updated
// ✅ Activity logged
```

### Workflow: Duplicate Handling
```javascript
try {
    await LeadService.createLead(leadData, userId);
} catch (error) {
    if (error instanceof DuplicateException) {
        const existingLead = error.existingResource;
        
        // Option 1: Show to user
        console.log('This lead already exists:', existingLead._id);
        
        // Option 2: Merge automatically
        await LeadService.mergeDuplicateLeads(
            existingLead._id,
            newLeadId,
            userId
        );
    }
}
```

### Workflow: Bulk Assignment
```javascript
// Get unassigned leads
const unassigned = await LeadService.getUnassignedLeads();

// Bulk assign to agent
const result = await LeadService.bulkAssignLeads(
    unassigned.map(l => l._id),
    agentId,
    userId
);

console.log(`Assigned ${result.modifiedCount} leads`);
```

---

## Performance Tips

1. **Always paginate** for large result sets
2. **Use specific filters** to reduce queries
3. **Rebalance assignments** during low-traffic hours
4. **Monitor auto-assignment** for availability issues
5. **Cache agent lists** if updating frequently

---

## Configuration

### Environment Variables
```env
# Assignment Strategy
ASSIGNMENT_STRATEGY=LOAD_BALANCED

# Pagination Defaults
DEFAULT_PAGE_SIZE=10
MAX_PAGE_SIZE=100

# Auto-assignment
AUTO_ASSIGN_LEADS=true
AUTO_ASSIGN_STRATEGY=LOAD_BALANCED
```

---

## Debugging

### Check Validation Details
```javascript
try {
    LeadValidationService.validateLeadForCreation(data);
} catch (error) {
    console.log('Validation errors by field:');
    console.log(error.details); // { email: 'Invalid format', ... }
}
```

### Check Duplicate Details
```javascript
try {
    await DuplicateCheckService.checkForDuplicate(email, phone);
} catch (error) {
    console.log('Existing lead found:');
    console.log(error.existingResource);
}
```

### Check Assignment Options
```javascript
const agents = await AutoAssignmentService._getAvailableAgents();
console.log(`Available agents: ${agents.length}`);
agents.forEach(a => console.log(`- ${a.firstName}: ${a.activeLeadCount || 0} leads`));
```

---

## Status Reference

### Lead Status Values
```javascript
NEW_LEAD       = 'NEW_LEAD'
CONTACTED      = 'CONTACTED'
QUALIFIED      = 'QUALIFIED'
IN_NEGOTIATION = 'IN_NEGOTIATION'
CONVERTED      = 'CONVERTED'
LOST           = 'LOST'
INACTIVE       = 'INACTIVE'
```

### Activity Types
```javascript
CALL           = 'CALL'
EMAIL          = 'EMAIL'
MEETING        = 'MEETING'
SITE_VISIT     = 'SITE_VISIT'
PROPOSAL       = 'PROPOSAL'
FOLLOW_UP      = 'FOLLOW_UP'
NOTE           = 'NOTE'
STATUS_CHANGE  = 'STATUS_CHANGE'
```

---

## Useful Queries

### Get High-Priority Qualified Leads
```javascript
const leads = await LeadService.getAllLeads(
    { status: 'QUALIFIED', priority: 'CRITICAL' },
    1, 100
);
```

### Get Agent's Leads
```javascript
const leads = await LeadService.getAllLeads(
    { assignedTo: agentId },
    1, 50
);
```

### Get Conversion Statistics
```javascript
const stats = await LeadService.getLeadStatistics({
    status: 'CONVERTED'
});
```

### Find Potential Duplicates
```javascript
const report = await LeadService.getDuplicateReport();
```

---

## Troubleshooting Map

| Issue | Check | Solution |
|-------|-------|----------|
| Validation fails | `error.details` | Check field values against rules |
| Duplicate found | `error.existingResource` | Offer merge or inform user |
| No agents available | Agent count | Add agents, activate agents |
| Status transition invalid | `LEAD_STATUS` constants | Verify valid transition path |
| Auto-assign returns wrong agent | Strategy choice | Review assignment logic |

---

**Last Updated:** Phase 8 - Service Layer Implementation
**Version:** 1.0
**Documentation Status:** Complete ✅
