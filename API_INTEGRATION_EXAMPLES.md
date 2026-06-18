# API Integration Examples

Complete examples for working with the Mongoose models via API endpoints.

---

## 📋 Lead Endpoints

### Create Lead
```bash
curl -X POST http://localhost:3000/api/v1/leads \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "phone": "+1-555-123-4567",
    "source": "WEBSITE",
    "campaign": "Summer 2026",
    "propertyId": "PROP-001",
    "status": "NEW_LEAD",
    "priority": "HIGH",
    "budgetMin": 500000,
    "budgetMax": 1000000,
    "location": {
      "city": "New York",
      "state": "NY",
      "country": "USA"
    }
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "firstName": "John",
    "lastName": "Doe",
    "fullName": "John Doe",
    "email": "john.doe@example.com",
    "phone": "+1-555-123-4567",
    "source": "WEBSITE",
    "status": "NEW_LEAD",
    "priority": "HIGH",
    "createdAt": "2026-06-15T18:00:00.000Z",
    "updatedAt": "2026-06-15T18:00:00.000Z"
  },
  "message": "Lead created successfully"
}
```

### Get All Leads with Pagination
```bash
curl -X GET "http://localhost:3000/api/v1/leads?page=1&limit=10" \
  -H "Content-Type: application/json"
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "source": "WEBSITE",
      "status": "NEW_LEAD"
    }
  ],
  "pagination": {
    "total": 50,
    "page": 1,
    "limit": 10,
    "pages": 5
  },
  "message": "Leads retrieved successfully"
}
```

### Get Lead by ID with Employee Details
```bash
curl -X GET "http://localhost:3000/api/v1/leads/507f1f77bcf86cd799439012" \
  -H "Content-Type: application/json"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "phone": "+1-555-123-4567",
    "assignedTo": {
      "_id": "507f1f77bcf86cd799439011",
      "firstName": "Jane",
      "lastName": "Smith",
      "email": "jane.smith@company.com",
      "role": "SENIOR_AGENT"
    },
    "status": "QUALIFIED",
    "priority": "HIGH",
    "createdAt": "2026-06-15T18:00:00.000Z"
  },
  "message": "Lead retrieved successfully"
}
```

### Search Leads
```bash
curl -X GET "http://localhost:3000/api/v1/leads/search?q=john+apartment&page=1&limit=10" \
  -H "Content-Type: application/json"
```

### Filter Leads
```bash
curl -X POST http://localhost:3000/api/v1/leads/filter \
  -H "Content-Type: application/json" \
  -d '{
    "filters": {
      "status": "QUALIFIED",
      "priority": "HIGH",
      "source": "WEBSITE"
    },
    "page": 1,
    "limit": 20
  }'
```

### Update Lead
```bash
curl -X PUT http://localhost:3000/api/v1/leads/507f1f77bcf86cd799439012 \
  -H "Content-Type: application/json" \
  -d '{
    "status": "IN_NEGOTIATION",
    "priority": "CRITICAL",
    "notes": "Updated customer status"
  }'
```

### Assign Lead to Employee
```bash
curl -X PATCH http://localhost:3000/api/v1/leads/507f1f77bcf86cd799439012/assign \
  -H "Content-Type: application/json" \
  -d '{
    "employeeId": "507f1f77bcf86cd799439011"
  }'
```

### Convert Lead
```bash
curl -X PATCH http://localhost:3000/api/v1/leads/507f1f77bcf86cd799439012/convert \
  -H "Content-Type: application/json" \
  -d '{
    "conversionValue": 750000
  }'
```

### Delete Lead (Soft Delete)
```bash
curl -X DELETE http://localhost:3000/api/v1/leads/507f1f77bcf86cd799439012 \
  -H "Content-Type: application/json"
```

---

## 👥 Employee Endpoints

### Create Employee
```bash
curl -X POST http://localhost:3000/api/v1/employees \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "jane.smith@company.com",
    "phone": "+1-555-987-6543",
    "mobile": "+1-555-123-0000",
    "password": "SecurePass123!",
    "employeeId": "EMP-0001",
    "role": "SENIOR_AGENT",
    "department": "Sales",
    "designation": "Senior Sales Agent",
    "joinDate": "2024-01-15"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "jane.smith@company.com",
    "employeeId": "EMP-0001",
    "role": "SENIOR_AGENT",
    "department": "Sales",
    "status": "Active",
    "totalLeadsAssigned": 0,
    "conversionRate": 0
  },
  "message": "Employee created successfully"
}
```

### Employee Login
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jane.smith@company.com",
    "password": "SecurePass123!"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "employee": {
      "_id": "507f1f77bcf86cd799439011",
      "firstName": "Jane",
      "lastName": "Smith",
      "email": "jane.smith@company.com",
      "role": "SENIOR_AGENT"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": "7d"
  },
  "message": "Login successful"
}
```

### Get Employee Profile
```bash
curl -X GET http://localhost:3000/api/v1/employees/507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer <token>"
```

### Get Top Performing Employees
```bash
curl -X GET "http://localhost:3000/api/v1/employees/top-performers?limit=10" \
  -H "Content-Type: application/json"
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "firstName": "Jane",
      "lastName": "Smith",
      "totalLeadsAssigned": 45,
      "convertedLeads": 18,
      "conversionRate": 40,
      "averageDealValue": 625000
    }
  ],
  "message": "Top performers retrieved successfully"
}
```

### Get Employees by Department
```bash
curl -X GET "http://localhost:3000/api/v1/employees?department=Sales&status=Active" \
  -H "Content-Type: application/json"
```

### Update Employee
```bash
curl -X PUT http://localhost:3000/api/v1/employees/507f1f77bcf86cd799439011 \
  -H "Content-Type: application/json" \
  -d '{
    "status": "On Leave",
    "notificationPreferences": {
      "email": true,
      "sms": false,
      "push": true
    }
  }'
```

---

## 📊 Activity Log Endpoints

### Create Activity
```bash
curl -X POST http://localhost:3000/api/v1/activities \
  -H "Content-Type: application/json" \
  -d '{
    "lead": "507f1f77bcf86cd799439012",
    "employee": "507f1f77bcf86cd799439011",
    "type": "CALL",
    "subject": "Initial Inquiry",
    "description": "Customer called about property",
    "contactMethod": "Phone",
    "direction": "Inbound",
    "status": "Completed",
    "sentiment": "Positive",
    "engagementScore": 85,
    "notes": "Very interested customer",
    "metadata": {
      "duration": 15,
      "outcome": "Successful"
    }
  }'
```

### Get Activities for Lead
```bash
curl -X GET "http://localhost:3000/api/v1/leads/507f1f77bcf86cd799439012/activities?page=1&limit=20" \
  -H "Content-Type: application/json"
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "607f1f77bcf86cd799439013",
      "type": "CALL",
      "subject": "Initial Inquiry",
      "status": "Completed",
      "sentiment": "Positive",
      "engagementScore": 85,
      "employee": {
        "firstName": "Jane",
        "lastName": "Smith"
      },
      "actualDate": "2026-06-15T18:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 5,
    "page": 1,
    "limit": 20
  }
}
```

### Get Pending Activities
```bash
curl -X GET "http://localhost:3000/api/v1/activities/pending?page=1&limit=50" \
  -H "Content-Type: application/json"
```

### Get Overdue Activities
```bash
curl -X GET "http://localhost:3000/api/v1/activities/overdue" \
  -H "Content-Type: application/json"
```

### Mark Activity as Complete
```bash
curl -X PATCH http://localhost:3000/api/v1/activities/607f1f77bcf86cd799439013/complete \
  -H "Content-Type: application/json" \
  -d '{
    "leadStatusAfter": "QUALIFIED",
    "sentiment": 0.85
  }'
```

### Schedule Follow-up
```bash
curl -X PATCH http://localhost:3000/api/v1/activities/607f1f77bcf86cd799439013/follow-up \
  -H "Content-Type: application/json" \
  -d '{
    "followUpDate": "2026-06-18T10:00:00Z",
    "followUpType": "Meeting"
  }'
```

### Add Attachment
```bash
curl -X POST http://localhost:3000/api/v1/activities/607f1f77bcf86cd799439013/attachments \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Proposal_Document.pdf",
    "url": "https://cdn.example.com/documents/proposal-001.pdf",
    "type": "application/pdf"
  }'
```

---

## 📈 Analytics & Reports

### Lead Status Distribution
```bash
curl -X GET "http://localhost:3000/api/v1/leads/analytics/status-distribution" \
  -H "Content-Type: application/json"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "NEW_LEAD": 15,
    "CONTACTED": 12,
    "QUALIFIED": 18,
    "IN_NEGOTIATION": 8,
    "CONVERTED": 42,
    "LOST": 5
  }
}
```

### Lead Source Performance
```bash
curl -X GET "http://localhost:3000/api/v1/leads/analytics/source-performance" \
  -H "Content-Type: application/json"
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "source": "WEBSITE",
      "totalLeads": 35,
      "converted": 15,
      "conversionRate": 42.86,
      "avgBudget": 625000
    },
    {
      "source": "REFERRAL",
      "totalLeads": 20,
      "converted": 10,
      "conversionRate": 50,
      "avgBudget": 750000
    }
  ]
}
```

### Employee Performance Report
```bash
curl -X GET "http://localhost:3000/api/v1/employees/507f1f77bcf86cd799439011/performance" \
  -H "Content-Type: application/json"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "employee": {
      "firstName": "Jane",
      "lastName": "Smith",
      "email": "jane.smith@company.com"
    },
    "metrics": {
      "totalLeads": 45,
      "convertedLeads": 18,
      "lostLeads": 8,
      "conversionRate": 40,
      "averageDealValue": 625000,
      "totalRevenue": 11250000
    },
    "activityBreakdown": {
      "CALL": 120,
      "EMAIL": 85,
      "MEETING": 35,
      "SITE_VISIT": 15
    },
    "sentimentAnalysis": {
      "positive": 75,
      "neutral": 20,
      "negative": 5
    }
  }
}
```

---

## ✅ Common Response Patterns

### Success Response
```json
{
  "success": true,
  "data": { /* response data */ },
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "statusCode": 400,
  "errorCode": "VALIDATION_ERROR"
}
```

### Validation Error Response
```json
{
  "success": false,
  "error": "Validation failed",
  "statusCode": 422,
  "errorCode": "VALIDATION_ERROR",
  "details": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

### Paginated Response
```json
{
  "success": true,
  "data": [ /* array of items */ ],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "pages": 10
  },
  "message": "Data retrieved successfully"
}
```

---

## 🔐 Authentication Headers

All protected endpoints require JWT token in Authorization header:

```bash
curl -X GET http://localhost:3000/api/v1/employees/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## 📝 Batch Operations

### Bulk Update Leads
```bash
curl -X POST http://localhost:3000/api/v1/leads/bulk-update \
  -H "Content-Type: application/json" \
  -d '{
    "ids": ["507f1f77bcf86cd799439012", "507f1f77bcf86cd799439013"],
    "updates": {
      "priority": "CRITICAL",
      "status": "QUALIFIED"
    }
  }'
```

### Bulk Assign Leads
```bash
curl -X POST http://localhost:3000/api/v1/leads/bulk-assign \
  -H "Content-Type: application/json" \
  -d '{
    "ids": ["507f1f77bcf86cd799439012", "507f1f77bcf86cd799439013"],
    "employeeId": "507f1f77bcf86cd799439011"
  }'
```

---

## 🌐 Environment Variables

Add to `.env`:
```
MONGODB_URI=mongodb://localhost:27017/lead-crm
PORT=3000
NODE_ENV=development
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:3001
```

---

## 🧪 Testing with Postman

Create collection with these request groups:

1. **Leads**
   - Create Lead
   - Get All Leads
   - Get Lead by ID
   - Update Lead
   - Delete Lead
   - Search Leads

2. **Employees**
   - Create Employee
   - Login
   - Get Profile
   - Get All Employees
   - Get Top Performers

3. **Activities**
   - Create Activity
   - Get Activities
   - Complete Activity
   - Schedule Follow-up

4. **Analytics**
   - Lead Status Distribution
   - Source Performance
   - Employee Performance

All endpoints are ready to use with the seeded sample data!
