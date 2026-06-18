# Repository Layer - Usage Guide & Examples

Complete guide with practical examples for using the Lead Repository Layer in your application.

---

## 📌 Quick Start

### Import the Repository
```javascript
const leadRepository = require('../repositories/LeadRepository');
const { LEAD_STATUS, LEAD_PRIORITY } = require('../constants');
```

### Basic CRUD Operations
```javascript
// Create
const lead = await leadRepository.createLead({
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  phone: '+1-555-123-4567',
  source: 'WEBSITE'
}, userId);

// Read
const lead = await leadRepository.getLeadById(leadId);

// Update
const updated = await leadRepository.updateLead(leadId, {
  status: 'QUALIFIED',
  priority: 'HIGH'
}, userId);

// Delete
const deleted = await leadRepository.deleteLead(leadId, userId);
```

---

## 🎯 REAL-WORLD EXAMPLES

### Example 1: Creating a Lead with Full Flow
```javascript
async function createNewLeadFromForm(formData, userId) {
  try {
    // Create lead with all details
    const newLead = await leadRepository.createLead({
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      source: formData.source || 'WEBSITE',
      priority: formData.priority || LEAD_PRIORITY.MEDIUM,
      propertyId: formData.propertyId,
      location: {
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        coordinates: {
          latitude: formData.latitude,
          longitude: formData.longitude
        }
      },
      budgetMin: formData.budgetMin,
      budgetMax: formData.budgetMax,
      notes: formData.notes,
      campaign: formData.campaign
    }, userId);

    return newLead;
  } catch (error) {
    if (error.statusCode === 400) {
      // Validation error - invalid email, missing fields, etc.
      throw new Error(`Invalid lead data: ${error.message}`);
    }
    throw error;
  }
}
```

---

### Example 2: Fetching and Displaying Lead Details
```javascript
async function getLeadForDisplay(leadId) {
  try {
    const lead = await leadRepository.getLeadById(leadId, {
      populate: ['assignedTo', 'createdBy'],
      select: 'firstName lastName email phone status priority source assignedTo'
    });

    if (!lead) {
      return null;
    }

    return {
      id: lead._id,
      name: `${lead.firstName} ${lead.lastName}`,
      email: lead.email,
      phone: lead.phone,
      status: lead.status,
      priority: lead.priority,
      source: lead.source,
      assignedAgent: lead.assignedTo ? {
        name: `${lead.assignedTo.firstName} ${lead.assignedTo.lastName}`,
        email: lead.assignedTo.email
      } : null
    };
  } catch (error) {
    if (error.statusCode === 404) {
      throw new Error('Lead not found');
    }
    throw error;
  }
}
```

---

### Example 3: Get Dashboard with Filtered Leads
```javascript
async function getDashboardData(userId) {
  try {
    // Get all of this user's leads
    const myLeads = await leadRepository.getAllLeads({
      page: 1,
      limit: 20,
      assignedTo: userId,
      sort: { createdAt: -1 }
    });

    // Get high-priority leads
    const urgent = await leadRepository.findHighPriority({
      page: 1,
      limit: 10
    });

    // Get statistics
    const stats = await leadRepository.getLeadStatistics({
      assignedTo: userId
    });

    return {
      myLeads: myLeads.data,
      pagination: myLeads.pagination,
      urgentLeads: urgent.data,
      stats: {
        total: stats?.totalLeads || 0,
        converted: stats?.convertedLeads || 0,
        conversionRate: (stats?.conversionRate * 100).toFixed(2) + '%',
        totalValue: stats?.totalConversionValue || 0,
        avgValue: stats?.avgConversionValue || 0
      }
    };
  } catch (error) {
    console.error('Dashboard error:', error);
    throw error;
  }
}
```

---

### Example 4: Search Functionality
```javascript
async function performLeadSearch(query, userId) {
  try {
    if (!query || query.trim().length < 2) {
      return { data: [], message: 'Search query too short' };
    }

    const results = await leadRepository.searchLead(query, {
      page: 1,
      limit: 20
    });

    return {
      query: results.query,
      resultCount: results.pagination.total,
      data: results.data.map(lead => ({
        id: lead._id,
        name: `${lead.firstName} ${lead.lastName}`,
        email: lead.email,
        phone: lead.phone,
        status: lead.status
      })),
      pagination: results.pagination
    };
  } catch (error) {
    console.error('Search error:', error);
    return { error: 'Search failed', data: [] };
  }
}
```

---

### Example 5: Advanced Filtering
```javascript
async function filterLeadsByAdvancedCriteria(filterCriteria, page = 1) {
  try {
    const results = await leadRepository.filterLead({
      status: filterCriteria.status,        // e.g., 'QUALIFIED'
      priority: filterCriteria.priority,    // e.g., 'HIGH'
      source: filterCriteria.source,        // e.g., 'WEBSITE'
      assignedTo: filterCriteria.agentId,   // Optional
      minBudget: filterCriteria.minBudget,  // e.g., 500000
      maxBudget: filterCriteria.maxBudget,  // e.g., 1000000
      city: filterCriteria.city,            // e.g., 'New York'
      campaign: filterCriteria.campaign     // e.g., 'Q4 Campaign'
    }, {
      page,
      limit: 50,
      sort: { createdAt: -1 }
    });

    return results;
  } catch (error) {
    console.error('Filter error:', error);
    throw error;
  }
}

// Usage:
const filtered = await filterLeadsByAdvancedCriteria({
  status: 'QUALIFIED',
  priority: 'HIGH',
  minBudget: 500000,
  maxBudget: 1000000,
  city: 'New York'
}, 1);
```

---

### Example 6: Update Lead Status
```javascript
async function updateLeadStatus(leadId, newStatus, userId) {
  try {
    const validStatuses = Object.values(LEAD_STATUS);
    
    if (!validStatuses.includes(newStatus)) {
      throw new Error(`Invalid status: ${newStatus}`);
    }

    const updated = await leadRepository.updateLead(
      leadId,
      { 
        status: newStatus,
        updatedAt: new Date() 
      },
      userId
    );

    return {
      success: true,
      message: `Lead status updated to ${newStatus}`,
      lead: updated
    };
  } catch (error) {
    if (error.statusCode === 404) {
      return { success: false, error: 'Lead not found' };
    }
    if (error.statusCode === 400) {
      return { success: false, error: error.message };
    }
    throw error;
  }
}
```

---

### Example 7: Assign Lead to Agent
```javascript
async function assignLeadToAgent(leadId, agentId, userId) {
  try {
    // Verify agent exists
    const agent = await employeeRepository.getById(agentId);
    if (!agent) {
      throw new Error('Agent not found');
    }

    const updated = await leadRepository.updateLead(
      leadId,
      {
        assignedTo: agentId,
        assignmentDate: new Date()
      },
      userId
    );

    // Log the assignment activity
    await activityRepository.createActivity({
      lead: leadId,
      employee: agentId,
      type: 'STATUS_CHANGE',
      subject: 'Lead Assigned',
      description: `Lead assigned to ${agent.firstName} ${agent.lastName}`,
      metadata: { previousAgent: null, newAgent: agentId }
    }, userId);

    return updated;
  } catch (error) {
    console.error('Assignment error:', error);
    throw error;
  }
}
```

---

### Example 8: Soft Delete with Audit Trail
```javascript
async function archiveLead(leadId, userId) {
  try {
    const lead = await leadRepository.getLeadById(leadId);
    
    if (!lead) {
      throw new Error('Lead not found');
    }

    // Soft delete
    const deleted = await leadRepository.deleteLead(leadId, userId);

    // Create audit log
    await auditRepository.createLog({
      action: 'DELETE',
      entityType: 'LEAD',
      entityId: leadId,
      performedBy: userId,
      timestamp: new Date(),
      previousState: lead,
      reason: 'Archived by user'
    });

    return {
      success: true,
      message: `Lead ${lead.firstName} ${lead.lastName} archived`,
      archivedAt: deleted.deletedAt
    };
  } catch (error) {
    console.error('Archive error:', error);
    throw error;
  }
}
```

---

### Example 9: Restore Deleted Lead
```javascript
async function unarchiveLead(leadId, userId) {
  try {
    const restored = await leadRepository.restore(leadId);

    if (!restored) {
      throw new Error('Lead not found');
    }

    // Create audit log
    await auditRepository.createLog({
      action: 'RESTORE',
      entityType: 'LEAD',
      entityId: leadId,
      performedBy: userId,
      timestamp: new Date()
    });

    return {
      success: true,
      message: `Lead ${restored.firstName} ${restored.lastName} restored`,
      lead: restored
    };
  } catch (error) {
    console.error('Restore error:', error);
    throw error;
  }
}
```

---

### Example 10: Bulk Operations
```javascript
async function bulkAssignLeads(leadIds, agentId, userId) {
  try {
    // Verify agent
    const agent = await employeeRepository.getById(agentId);
    if (!agent) {
      throw new Error('Agent not found');
    }

    // Bulk update
    const result = await leadRepository.bulkUpdate(
      leadIds,
      {
        assignedTo: agentId,
        assignmentDate: new Date()
      }
    );

    // Create activity logs for each lead
    const activities = leadIds.map(leadId => ({
      lead: leadId,
      employee: agentId,
      type: 'STATUS_CHANGE',
      subject: 'Bulk Assignment',
      description: `Bulk assigned to ${agent.firstName} ${agent.lastName}`
    }));

    await activityRepository.bulkCreate(activities, userId);

    return {
      success: true,
      message: `${result.modifiedCount} leads assigned to ${agent.firstName} ${agent.lastName}`,
      count: result.modifiedCount
    };
  } catch (error) {
    console.error('Bulk assignment error:', error);
    throw error;
  }
}
```

---

### Example 11: Get Unassigned Leads
```javascript
async function getUnassignedLeads() {
  try {
    const results = await leadRepository.getUnassignedLeads({
      page: 1,
      limit: 50,
      sort: { createdAt: -1 }
    });

    return {
      unassignedCount: results.pagination.total,
      leads: results.data.map(lead => ({
        id: lead._id,
        name: `${lead.firstName} ${lead.lastName}`,
        email: lead.email,
        source: lead.source,
        priority: lead.priority,
        createdAt: lead.createdAt
      })),
      pagination: results.pagination
    };
  } catch (error) {
    console.error('Unassigned leads error:', error);
    throw error;
  }
}
```

---

### Example 12: Get Recent Leads
```javascript
async function getRecentActivity(days = 7) {
  try {
    const results = await leadRepository.getRecentLeads(days, {
      page: 1,
      limit: 20
    });

    return {
      period: `Last ${days} days`,
      count: results.pagination.total,
      leads: results.data.map(lead => ({
        id: lead._id,
        name: `${lead.firstName} ${lead.lastName}`,
        status: lead.status,
        createdAt: lead.createdAt,
        agent: lead.assignedTo ? `${lead.assignedTo.firstName} ${lead.assignedTo.lastName}` : 'Unassigned'
      }))
    };
  } catch (error) {
    console.error('Recent leads error:', error);
    throw error;
  }
}
```

---

### Example 13: Lead Statistics Report
```javascript
async function generateLeadReport(agentId) {
  try {
    const stats = await leadRepository.getLeadStatistics({
      assignedTo: agentId
    });

    if (!stats) {
      return {
        message: 'No leads found for this agent'
      };
    }

    return {
      totalLeads: stats.totalLeads,
      converted: stats.convertedLeads,
      lost: stats.lostLeads,
      pending: stats.totalLeads - stats.convertedLeads - stats.lostLeads,
      conversionRate: (stats.conversionRate * 100).toFixed(2) + '%',
      totalConversionValue: stats.totalConversionValue.toFixed(2),
      averageConversionValue: stats.avgConversionValue.toFixed(2),
      averageValuePerLead: (stats.totalConversionValue / stats.totalLeads).toFixed(2)
    };
  } catch (error) {
    console.error('Report generation error:', error);
    throw error;
  }
}
```

---

### Example 14: Filter Leads by Source
```javascript
async function getLeadsBySource(source, page = 1) {
  try {
    const results = await leadRepository.findBySource(source, {
      page,
      limit: 50,
      sort: { createdAt: -1 }
    });

    return {
      source,
      total: results.pagination.total,
      leads: results.data,
      pagination: results.pagination
    };
  } catch (error) {
    console.error('Source filter error:', error);
    throw error;
  }
}

// Usage:
const websiteLeads = await getLeadsBySource('WEBSITE', 1);
const referralLeads = await getLeadsBySource('REFERRAL', 1);
```

---

### Example 15: Filter Leads by Status
```javascript
async function getLeadsByStatus(status, page = 1) {
  try {
    const validStatuses = Object.values(LEAD_STATUS);
    
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status: ${status}`);
    }

    const results = await leadRepository.findByStatus(status, {
      page,
      limit: 50,
      sort: { createdAt: -1 }
    });

    return {
      status,
      total: results.pagination.total,
      leads: results.data,
      pagination: results.pagination
    };
  } catch (error) {
    console.error('Status filter error:', error);
    throw error;
  }
}

// Usage:
const qualified = await getLeadsByStatus(LEAD_STATUS.QUALIFIED, 1);
const converted = await getLeadsByStatus(LEAD_STATUS.CONVERTED, 1);
```

---

### Example 16: Complex Service Logic
```javascript
async function reassignLeadFromAgent(leadId, fromAgentId, toAgentId, userId) {
  try {
    // Get current lead
    const lead = await leadRepository.getLeadById(leadId);
    
    if (!lead) {
      throw new Error('Lead not found');
    }

    if (lead.assignedTo._id.toString() !== fromAgentId) {
      throw new Error('Lead is not assigned to this agent');
    }

    // Get target agent
    const targetAgent = await employeeRepository.getById(toAgentId);
    if (!targetAgent) {
      throw new Error('Target agent not found');
    }

    // Update lead
    const updated = await leadRepository.updateLead(
      leadId,
      { assignedTo: toAgentId },
      userId
    );

    // Create activity log
    await activityRepository.createActivity({
      lead: leadId,
      employee: toAgentId,
      type: 'STATUS_CHANGE',
      subject: 'Lead Reassigned',
      description: `Reassigned from ${lead.assignedTo.firstName} to ${targetAgent.firstName}`,
      metadata: {
        fromAgent: fromAgentId,
        toAgent: toAgentId,
        reason: 'Workload balancing'
      }
    }, userId);

    // Notify both agents
    await notificationService.notifyAgent(fromAgentId, {
      type: 'LEAD_REMOVED',
      leadId,
      message: `Lead ${lead.firstName} ${lead.lastName} has been reassigned`
    });

    await notificationService.notifyAgent(toAgentId, {
      type: 'LEAD_ASSIGNED',
      leadId,
      message: `Lead ${lead.firstName} ${lead.lastName} has been assigned to you`
    });

    return {
      success: true,
      message: 'Lead reassigned successfully',
      lead: updated
    };
  } catch (error) {
    console.error('Reassignment error:', error);
    throw error;
  }
}
```

---

## 🚨 ERROR HANDLING PATTERNS

### Pattern 1: Basic Try-Catch
```javascript
try {
  const lead = await leadRepository.createLead(data, userId);
  return { success: true, lead };
} catch (error) {
  if (error.statusCode === 400) {
    return { success: false, error: 'Validation failed', details: error.message };
  }
  if (error.statusCode === 500) {
    return { success: false, error: 'Server error' };
  }
  throw error;
}
```

---

### Pattern 2: Wrapper Function
```javascript
async function handleRepositoryOperation(operation, errorMessage) {
  try {
    return await operation();
  } catch (error) {
    logger.error(errorMessage, error);
    
    if (error.statusCode === 404) {
      throw new NotFoundException(errorMessage);
    }
    if (error.statusCode === 400) {
      throw new ValidationException(error.message);
    }
    throw new ServerException(errorMessage);
  }
}

// Usage:
const lead = await handleRepositoryOperation(
  () => leadRepository.getLeadById(leadId),
  'Failed to fetch lead'
);
```

---

### Pattern 3: With Validation
```javascript
async function safeUpdateLead(leadId, updateData, userId) {
  // Validate input
  if (!leadId) throw new Error('Lead ID required');
  if (!updateData || Object.keys(updateData).length === 0) {
    throw new Error('No update data provided');
  }

  try {
    return await leadRepository.updateLead(leadId, updateData, userId);
  } catch (error) {
    if (error.statusCode === 404) {
      throw new Error('Lead not found');
    }
    throw error;
  }
}
```

---

## 📊 Pagination Examples

### Example 1: Basic Pagination
```javascript
const page1 = await leadRepository.getAllLeads({ page: 1, limit: 10 });
// Returns 10 leads
const page2 = await leadRepository.getAllLeads({ page: 2, limit: 10 });
// Returns next 10 leads
```

### Example 2: Calculate Total Pages
```javascript
const results = await leadRepository.getAllLeads({ page: 1, limit: 20 });
console.log(`Page ${results.pagination.page} of ${results.pagination.pages}`);
```

---

## 🔗 Integration with Service Layer

The repository should always be used through the Service Layer:

```javascript
// ❌ Don't do this directly in controllers
const lead = await leadRepository.createLead(data);

// ✅ Do this - use service layer
const lead = await leadService.createLead(data);
```

Service layer provides:
- Additional validation
- Error handling
- Business logic
- Logging and monitoring
- Authorization checks

---

## 📝 Best Practices Summary

1. **Always handle errors** - Use try-catch or error middleware
2. **Validate input** - Check parameters before calling repository
3. **Use pagination** - Don't fetch all records
4. **Populate relationships** - Specify which fields to populate
5. **Log operations** - Important for debugging
6. **Use transactions** - For multi-step operations
7. **Cache results** - For frequently accessed data
8. **Monitor performance** - Track query execution times

---

## 📚 References

- Repository File: [src/repositories/LeadRepository.js](src/repositories/LeadRepository.js)
- Service File: [src/services/LeadService.js](src/services/LeadService.js)
- Controller File: [src/controllers/LeadController.js](src/controllers/LeadController.js)
- Constants: [src/constants/index.js](src/constants/index.js)
- Models: [src/models/Lead.js](src/models/Lead.js)
