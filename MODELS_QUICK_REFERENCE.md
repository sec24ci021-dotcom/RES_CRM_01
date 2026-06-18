# Mongoose Models - Quick Reference Guide

## 📋 Models Overview

| Model | Collection | Purpose |
|-------|-----------|---------|
| **Lead** | leads | Core lead/customer information |
| **Employee** | employees | Company agents/employees managing leads |
| **ActivityLog** | activitylogs | Interactions and communications with leads |

---

## 🔵 Lead Model

### Required Fields
```javascript
firstName, lastName, email, phone, source
```

### Location-Based Queries
```javascript
// Find leads in specific city
Lead.find({ 'location.city': 'New York' })

// Find by coordinates radius (requires 2dsphere index)
Lead.find({
  'location.coordinates': {
    $near: {
      $geometry: { type: 'Point', coordinates: [-74.0060, 40.7128] },
      $maxDistance: 5000 // meters
    }
  }
})
```

### Status Workflow
```
NEW_LEAD → CONTACTED → QUALIFIED → IN_NEGOTIATION → CONVERTED/LOST
```

### Key Methods
```javascript
const lead = await Lead.findById(id);

// Conversion
await lead.convert(750000);         // Convert and set value

// Abandonment
await lead.abandon();               // Mark as lost

// Soft Delete
await lead.softDelete();            // Soft delete
await lead.restore();               // Restore deleted

// Search
const results = await Lead.searchLeads('john apartment', { page: 1, limit: 10 });
```

### Useful Queries
```javascript
// High-value leads not yet assigned
Lead.find({
  assignedTo: null,
  $expr: { $gte: ['$budgetMax', 1000000] }
})

// Leads by conversion potential
Lead.find({ status: 'QUALIFIED', priority: { $in: ['HIGH', 'CRITICAL'] } })

// Recently created
Lead.find({}).sort({ createdAt: -1 }).limit(10)

// Budget analysis
Lead.aggregate([
  {
    $group: {
      _id: '$source',
      avgBudget: { $avg: '$budgetMax' },
      maxBudget: { $max: '$budgetMax' },
      count: { $sum: 1 }
    }
  }
])
```

---

## 👥 Employee Model

### Required Fields
```javascript
firstName, lastName, email, phone, password, role
```

### Role Hierarchy
```
ADMIN > DIRECTOR > MANAGER > SENIOR_AGENT > JUNIOR_AGENT
```

### Authentication
```javascript
// Login
const employee = await Employee.findByEmailWithPassword(email);
const passwordMatch = await employee.comparePassword(password);

// Get public profile (without password/salary)
const publicProfile = employee.getPublicProfile();
```

### Performance Tracking
```javascript
// Update metrics
await employee.updateMetrics(convertedCount, totalLeads);

// Get top performers
const topEmp = await Employee.getTopPerformers(10);

// Find by department
const salesTeam = await Employee.findByDepartment('Sales');

// Find by role
const managers = await Employee.findByRole('MANAGER');
```

### Key Methods
```javascript
employee.comparePassword(password)           // Verify login
employee.getPublicProfile()                  // Safe data
employee.softDelete()                        // Disable account
employee.restore()                           // Re-enable
employee.updateMetrics(converted, total)     // Update stats
employee.fullName                            // Virtual: "First Last"
employee.displayName                         // Virtual: "First Last (ROLE)"
```

### Useful Queries
```javascript
// Active employees by department
Employee.find({ status: 'Active', department: 'Sales' })

// Find manager's direct reports
Employee.find({ reportingTo: managerId })

// Employees with best conversion rates
Employee.find({ status: 'Active' })
  .sort({ conversionRate: -1 })
  .limit(5)

// Performance statistics
Employee.aggregate([
  {
    $match: { status: 'Active' },
    $group: {
      _id: '$role',
      avgConversion: { $avg: '$conversionRate' },
      totalConverted: { $sum: '$convertedLeads' },
      employeeCount: { $sum: 1 }
    }
  }
])
```

---

## 📊 ActivityLog Model

### Activity Types
```
CALL, EMAIL, MEETING, SITE_VISIT, NOTE, TASK, DOCUMENT, STATUS_CHANGE
```

### Status Workflow
```
PENDING → SCHEDULED/COMPLETED → Optionally: CANCELLED/RESCHEDULED
```

### Key Queries
```javascript
// Activities for a specific lead
const leadActivities = await ActivityLog.findByLead(leadId, { limit: 20 });

// Employee's activities this week
const weekStart = new Date();
weekStart.setDate(weekStart.getDate() - 7);
ActivityLog.find({
  employee: employeeId,
  actualDate: { $gte: weekStart }
}).sort({ actualDate: -1 })

// Pending tasks/activities
const pending = await ActivityLog.findPending({ limit: 50 });

// Overdue activities
const overdue = await ActivityLog.findOverdue();

// Activity summary for lead
const summary = await ActivityLog.getLeadActivitySummary(leadId);
// Returns: [{ _id: 'CALL', count: 5, lastActivity: Date }, ...]

// Employee performance stats
const stats = await ActivityLog.getEmployeeStats(
  employeeId,
  new Date('2026-01-01'),
  new Date('2026-12-31')
);
```

### Key Methods
```javascript
activity.markCompleted(leadStatus, sentiment)    // Complete activity
activity.scheduleFollowUp(date, type)           // Schedule next action
activity.addAttachment(name, url, type)         // Add file
activity.softDelete()                            // Archive
activity.isPending                               // Virtual
activity.isCompleted                             // Virtual
activity.isOverdue                               // Virtual
```

### Useful Queries
```javascript
// Sentiment analysis by employee
ActivityLog.aggregate([
  {
    $match: {
      employee: employeeId,
      actualDate: { $gte: startDate, $lte: endDate }
    }
  },
  {
    $group: {
      _id: '$sentiment',
      count: { $sum: 1 },
      avgScore: { $avg: '$engagementScore' }
    }
  }
])

// Activities requiring follow-up
ActivityLog.find({ requiresFollowUp: true, status: 'Pending' })
  .sort({ followUpDate: 1 })

// Engagement trends
ActivityLog.aggregate([
  {
    $match: { actualDate: { $gte: startDate } }
  },
  {
    $group: {
      _id: { $dateToString: { format: '%Y-%m-%d', date: '$actualDate' } },
      avgEngagement: { $avg: '$engagementScore' },
      count: { $sum: 1 }
    }
  },
  { $sort: { _id: 1 } }
])
```

---

## 🔗 Relationships & Population

### Lead with Employee Details
```javascript
const lead = await Lead.findById(leadId)
  .populate('assignedTo', 'firstName lastName email role')
  .populate('createdBy', 'firstName lastName');
```

### Activity with All References
```javascript
const activity = await ActivityLog.findById(activityId)
  .populate('lead', 'firstName lastName email')
  .populate('employee', 'firstName lastName email role')
  .populate('approvedBy', 'firstName lastName');
```

### Employee with Team
```javascript
const manager = await Employee.findById(managerId)
  .populate('reportingTo', 'firstName lastName');

// Get direct reports
const team = await Employee.find({ reportingTo: managerId });
```

---

## 🔍 Text Search Examples

### Search Across Lead Fields
```javascript
// Full-text search on leads
Lead.find(
  { $text: { $search: 'john apartment manhattan' } },
  { score: { $meta: 'textScore' } }
).sort({ score: { $meta: 'textScore' } })
```

### Search in Activity Notes
```javascript
// Find activities mentioning specific keywords
ActivityLog.find(
  { $text: { $search: 'negotiation pricing' } },
  { score: { $meta: 'textScore' } }
).sort({ score: { $meta: 'textScore' } })
```

---

## 📈 Aggregation Examples

### Lead Conversion Funnel
```javascript
Lead.aggregate([
  {
    $group: {
      _id: '$status',
      count: { $sum: 1 },
      totalValue: { $sum: '$budgetMax' }
    }
  },
  { $sort: { count: -1 } }
])
```

### Source Performance
```javascript
Lead.aggregate([
  {
    $group: {
      _id: '$source',
      totalLeads: { $sum: 1 },
      converted: {
        $sum: { $cond: [{ $eq: ['$status', 'CONVERTED'] }, 1, 0] }
      },
      avgBudget: { $avg: '$budgetMax' }
    }
  },
  {
    $project: {
      source: '$_id',
      conversionRate: {
        $round: [{ $multiply: [{ $divide: ['$converted', '$totalLeads'] }, 100] }, 2]
      },
      totalLeads: 1,
      avgBudget: 1
    }
  },
  { $sort: { conversionRate: -1 } }
])
```

### Employee Lead Distribution
```javascript
Lead.aggregate([
  {
    $match: { assignedTo: { $ne: null } }
  },
  {
    $group: {
      _id: '$assignedTo',
      leadCount: { $sum: 1 }
    }
  },
  {
    $lookup: {
      from: 'employees',
      localField: '_id',
      foreignField: '_id',
      as: 'employee'
    }
  },
  { $unwind: '$employee' },
  {
    $project: {
      _id: 0,
      name: '$employee.firstName lastName',
      leads: '$leadCount'
    }
  }
])
```

---

## 🚀 Seeding & Testing

### Run Database Seeding
```bash
npm run init-db      # Run seeding
npm run seed         # Alternative command
```

### Clear Database Before Seeding
```bash
CLEAR_DB=true npm run init-db
```

### Sample Data Includes
- 3 Employees (Junior, Senior, Manager)
- 5 Leads (various statuses and sources)
- 5 Activity Logs (different types and outcomes)

---

## ⚠️ Important Notes

1. **Soft Deletes**: All queries exclude soft-deleted records by default via pre-find middleware
2. **Password Hashing**: Passwords auto-hash on save; never returned in queries
3. **Timestamps**: All models auto-manage createdAt/updatedAt
4. **Indexing**: Use indexed fields for frequent queries (status, source, email, phone)
5. **Population**: Always populate references explicitly in queries
6. **Validation**: Schema includes built-in validators; check error.errors for validation details
7. **Enums**: Use constants from `src/constants/index.js` for type safety

---

## 📚 Related Files

- Models: `src/models/Lead.js`, `src/models/Employee.js`, `src/models/ActivityLog.js`
- Constants: `src/constants/index.js`
- Sample Data: `src/sample-data/sampleData.js`
- Seeding: `src/sample-data/initDatabase.js`
- Full Docs: `MODELS_DOCUMENTATION.md`
