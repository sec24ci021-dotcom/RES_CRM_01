# Lead Management Module - Query Examples & Best Practices

## MongoDB Query Examples

### 1. Search Leads by Name

```javascript
// Case-insensitive search using text index
db.leads.find(
  { $text: { $search: "john doe" }, isDeleted: false },
  { score: { $meta: "textScore" } }
).sort({ score: { $meta: "textScore" } })
```

### 2. Search by Email or Phone

```javascript
// Exact match (faster than text search)
db.leads.findOne({
  email: "john@example.com",
  isDeleted: false
})

// OR search multiple fields
db.leads.find({
  $or: [
    { email: "john@example.com" },
    { phone: "+91-9876543210" }
  ],
  isDeleted: false
})
```

### 3. Filter by Status and Employee

```javascript
// Get leads assigned to specific employee with specific status
db.leads.find({
  status: ObjectId("64f1a1c1d2e3f4g5h6i7j8k9"),
  assignedTo: ObjectId("64f1a1c1d2e3f4g5h6i7j8k2"),
  isDeleted: false
}).sort({ createdAt: -1 })
```

### 4. Filter by Priority

```javascript
// Get high priority leads
db.leads.find({
  priority: { $in: ["HIGH", "URGENT"] },
  isDeleted: false
}).sort({ priority: -1, createdAt: -1 })
```

### 5. Get Recent Leads (Last 7 Days)

```javascript
db.leads.find({
  createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
  isDeleted: false
}).sort({ createdAt: -1 })
```

### 6. Find Leads by Property Type

```javascript
// Properties contain multiple types as array
db.leads.find({
  propertyType: { $in: ["Apartment", "House"] },
  isDeleted: false
})
```

### 7. Find Leads by Budget Range

```javascript
// Leads within budget range
db.leads.find({
  budgetMin: { $lte: 10000000 },
  budgetMax: { $gte: 5000000 },
  isDeleted: false
})
```

### 8. Find Unassigned Leads

```javascript
db.leads.find({
  assignedTo: null,
  isDeleted: false
}).sort({ createdAt: 1 })
```

### 9. Get Leads by Conversion Status

```javascript
// Get converted leads
db.leads.find({
  conversionStatus: "CONVERTED",
  isDeleted: false
})

// Get lost leads
db.leads.find({
  conversionStatus: "LOST",
  isDeleted: false
})
```

### 10. Complex Multi-Filter Query

```javascript
// High priority, unassigned, not yet contacted, created in last 30 days
db.leads.find({
  priority: { $in: ["HIGH", "URGENT"] },
  assignedTo: null,
  conversionStatus: "NEW",
  createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
  isDeleted: false
}).sort({ priority: -1, createdAt: -1 })
```

---

## Aggregation Pipeline Examples

### 1. Lead Status Summary

```javascript
db.leads.aggregate([
  { $match: { isDeleted: false } },
  { $group: {
      _id: "$status",
      count: { $sum: 1 },
      avgBudget: { $avg: { $add: ["$budgetMin", "$budgetMax"] } }
    }
  },
  { $lookup: {
      from: "lead_statuses",
      localField: "_id",
      foreignField: "_id",
      as: "statusInfo"
    }
  },
  { $sort: { count: -1 } }
])
```

### 2. Employee Performance Report

```javascript
db.lead_assignments.aggregate([
  { $match: { isActive: true } },
  { $group: {
      _id: "$assignedTo",
      totalLeads: { $sum: 1 }
    }
  },
  { $lookup: {
      from: "employees",
      localField: "_id",
      foreignField: "_id",
      as: "employeeInfo"
    }
  },
  { $unwind: "$employeeInfo" },
  { $project: {
      _id: 0,
      employeeName: "$employeeInfo.fullName",
      email: "$employeeInfo.email",
      totalLeads: 1
    }
  },
  { $sort: { totalLeads: -1 } }
])
```

### 3. Lead Conversion Analytics

```javascript
db.leads.aggregate([
  { $match: { isDeleted: false } },
  { $lookup: {
      from: "lead_sources",
      localField: "source",
      foreignField: "_id",
      as: "sourceInfo"
    }
  },
  { $unwind: "$sourceInfo" },
  { $group: {
      _id: "$sourceInfo.name",
      totalLeads: { $sum: 1 },
      convertedLeads: {
        $sum: { $cond: [{ $eq: ["$conversionStatus", "CONVERTED"] }, 1, 0] }
      },
      avgConvertedValue: {
        $avg: { $cond: [{ $eq: ["$conversionStatus", "CONVERTED"] }, "$convertedValue", 0] }
      }
    }
  },
  { $project: {
      _id: 1,
      totalLeads: 1,
      convertedLeads: 1,
      conversionRate: {
        $multiply: [{ $divide: ["$convertedLeads", "$totalLeads"] }, 100]
      },
      avgConvertedValue: 1
    }
  },
  { $sort: { conversionRate: -1 } }
])
```

### 4. Recent Activities by Lead

```javascript
db.lead_activities.aggregate([
  { $sort: { createdAt: -1 } },
  { $group: {
      _id: "$lead",
      recentActivity: { $first: "$$ROOT" },
      activityCount: { $sum: 1 }
    }
  },
  { $lookup: {
      from: "leads",
      localField: "_id",
      foreignField: "_id",
      as: "leadInfo"
    }
  },
  { $unwind: "$leadInfo" },
  { $project: {
      leadName: {
        $concat: ["$leadInfo.firstName", " ", "$leadInfo.lastName"]
      },
      email: "$leadInfo.email",
      recentActivityType: "$recentActivity.activityType",
      recentActivityDate: "$recentActivity.createdAt",
      activityCount: 1
    }
  }
])
```

### 5. Lead Age Analysis

```javascript
db.leads.aggregate([
  { $match: { isDeleted: false } },
  { $project: {
      firstName: 1,
      lastName: 1,
      email: 1,
      ageInDays: {
        $divide: [
          { $subtract: [new Date(), "$createdAt"] },
          1000 * 60 * 60 * 24
        ]
      },
      status: 1
    }
  },
  { $bucket: {
      groupBy: "$ageInDays",
      boundaries: [0, 7, 14, 30, 60, 90, 180],
      default: "900+",
      output: {
        count: { $sum: 1 },
        leads: { $push: "$firstName" }
      }
    }
  }
])
```

### 6. Unassigned Leads Summary

```javascript
db.leads.aggregate([
  { $match: {
      assignedTo: null,
      isDeleted: false
    }
  },
  { $lookup: {
      from: "lead_sources",
      localField: "source",
      foreignField: "_id",
      as: "sourceInfo"
    }
  },
  { $unwind: "$sourceInfo" },
  { $group: {
      _id: "$sourceInfo.name",
      count: { $sum: 1 },
      totalBudget: { $sum: "$budgetMax" }
    }
  },
  { $sort: { count: -1 } }
])
```

### 7. Follow-up Status Report

```javascript
db.lead_followups.aggregate([
  { $match: { assignedTo: ObjectId("64f1a1c1d2e3f4g5h6i7j8k2") } },
  { $group: {
      _id: "$status",
      count: { $sum: 1 }
    }
  },
  { $project: {
      _id: 0,
      status: "$_id",
      count: 1
    }
  }
])
```

### 8. Monthly Lead Trend

```javascript
db.leads.aggregate([
  { $match: { isDeleted: false } },
  { $group: {
      _id: {
        year: { $year: "$createdAt" },
        month: { $month: "$createdAt" }
      },
      count: { $sum: 1 },
      converted: {
        $sum: { $cond: [{ $eq: ["$conversionStatus", "CONVERTED"] }, 1, 0] }
      }
    }
  },
  { $sort: { "_id.year": 1, "_id.month": 1 } },
  { $project: {
      _id: 0,
      date: {
        $dateToString: {
          format: "%Y-%m",
          date: new Date(0, { $subtract: ["$_id.month", 1] }, 1)
        }
      },
      totalLeads: "$count",
      convertedLeads: "$converted"
    }
  }
])
```

### 9. Lead Value Analysis by Source

```javascript
db.leads.aggregate([
  { $match: {
      conversionStatus: "CONVERTED",
      isDeleted: false
    }
  },
  { $lookup: {
      from: "lead_sources",
      localField: "source",
      foreignField: "_id",
      as: "sourceInfo"
    }
  },
  { $unwind: "$sourceInfo" },
  { $group: {
      _id: "$sourceInfo.code",
      totalValue: { $sum: "$convertedValue" },
      avgValue: { $avg: "$convertedValue" },
      count: { $sum: 1 }
    }
  },
  { $project: {
      source: "$_id",
      totalValue: 1,
      avgValue: { $round: ["$avgValue", 0] },
      leadsConverted: "$count",
      _id: 0
    }
  },
  { $sort: { totalValue: -1 } }
])
```

### 10. Employee Assignment Load Balance

```javascript
db.leads.aggregate([
  { $match: {
      assignedTo: { $ne: null },
      isDeleted: false
    }
  },
  { $group: {
      _id: "$assignedTo",
      activeLeads: { $sum: 1 },
      highPriorityLeads: {
        $sum: { $cond: [{ $eq: ["$priority", "HIGH"] }, 1, 0] }
      }
    }
  },
  { $lookup: {
      from: "employees",
      localField: "_id",
      foreignField: "_id",
      as: "employeeInfo"
    }
  },
  { $unwind: "$employeeInfo" },
  { $project: {
      employee: "$employeeInfo.fullName",
      activeLeads: 1,
      highPriorityLeads: 1,
      loadPercentage: {
        $multiply: [
          { $divide: ["$activeLeads", 50] },
          100
        ]
      }
    }
  },
  { $sort: { activeLeads: -1 } }
])
```

---

## Mongoose Query Examples

### Using Mongoose Models

```javascript
const Lead = require('./models/Lead');
const LeadActivity = require('./models/LeadActivity');

// Search by text
const results = await Lead.searchLeads("john");

// Filter active leads
const activeLeads = await Lead.findActive({ priority: "HIGH" });

// Get with populated references
const lead = await Lead.findById(leadId)
  .populate('status')
  .populate('source')
  .populate('assignedTo', 'firstName lastName email');

// Get recent activities
const activities = await LeadActivity.getRecentActivities(leadId, 10);

// Complex filtering with Mongoose
const leads = await Lead.find({
  priority: { $in: ["HIGH", "URGENT"] },
  status: statusId,
  assignedTo: employeeId,
  isDeleted: false
})
  .populate('status')
  .populate('assignedTo')
  .sort({ createdAt: -1 })
  .limit(20);
```

---

## Performance Optimization Tips

1. **Always include `isDeleted: false` in queries** (except for admin operations)
2. **Use compound indexes** for common filter combinations
3. **Paginate large result sets** (max 100 items per page)
4. **Use projection** to return only needed fields
5. **Cache master data** (statuses, sources) - they rarely change
6. **Archive old leads** after 2-3 years to archive collection
7. **Use `.lean()` in Mongoose** for read-only operations to improve performance
8. **Create indexes** on frequently searched fields
9. **Use aggregation pipeline** for complex analytical queries
10. **Monitor slow queries** using MongoDB profiler

---

## Index Creation

```javascript
// Create all necessary indexes
db.leads.createIndex({ email: 1 }, { unique: true });
db.leads.createIndex({ phone: 1 }, { unique: true });
db.leads.createIndex({ firstName: 1, lastName: 1 });
db.leads.createIndex({ status: 1, isDeleted: 1 });
db.leads.createIndex({ assignedTo: 1, isDeleted: 1 });
db.leads.createIndex({ priority: 1, isDeleted: 1 });
db.leads.createIndex({ createdAt: -1, isDeleted: 1 });
db.leads.createIndex({
  status: 1,
  assignedTo: 1,
  createdAt: -1,
  isDeleted: 1
});

// Text index for search
db.leads.createIndex({
  firstName: "text",
  lastName: "text",
  email: "text",
  phone: "text"
});
```

---
