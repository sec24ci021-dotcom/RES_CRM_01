# Lead Management Module - API Documentation

## Base URL
```
http://localhost:3000/api/v1
```

## Authentication
Include JWT token in Authorization header:
```
Authorization: Bearer <token>
```

---

## Lead Endpoints

### 1. Create Lead
**POST** `/leads`

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "+91-9876543210",
  "alternatePhone": "+91-9876543211",
  "status": "64f1a1c1d2e3f4g5h6i7j8k9",
  "source": "64f1a1c1d2e3f4g5h6i7j8k1",
  "priority": "HIGH",
  "propertyType": ["Apartment", "House"],
  "budgetMin": 5000000,
  "budgetMax": 15000000,
  "location": ["Bangalore", "Whitefield"],
  "areaPreference": ["10 km radius from MG Road"],
  "preferredContactMethod": "CALL",
  "communicationOptIn": true,
  "notes": "Looking for 3BHK apartment with parking",
  "tags": ["high-value", "urgent"],
  "company": "64f1a1c1d2e3f4g5h6i7j8k3"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "64f1a1c1d2e3f4g5h6i7j8l0",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+91-9876543210",
    "status": { "_id": "64f1a1c1d2e3f4g5h6i7j8k9", "name": "New Lead" },
    "source": { "_id": "64f1a1c1d2e3f4g5h6i7j8k1", "name": "Website" },
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

---

### 2. Get Lead by ID
**GET** `/leads/:leadId`

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "64f1a1c1d2e3f4g5h6i7j8l0",
    "fullName": "John Doe",
    "email": "john@example.com",
    "phone": "+91-9876543210",
    "status": { "name": "New Lead", "stage": "DISCOVERY" },
    "source": { "name": "Website" },
    "assignedTo": { "firstName": "Rajesh", "lastName": "Kumar" },
    "priority": "HIGH",
    "conversionStatus": "NEW",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

---

### 3. Update Lead
**PUT** `/leads/:leadId`

**Request Body:**
```json
{
  "status": "64f1a1c1d2e3f4g5h6i7j8k9",
  "priority": "URGENT",
  "notes": "Updated notes about the lead",
  "conversionStatus": "CONTACTED"
}
```

**Response:**
```json
{
  "success": true,
  "data": { /* Updated lead object */ }
}
```

---

### 4. Delete Lead (Soft Delete)
**DELETE** `/leads/:leadId`

**Response:**
```json
{
  "success": true,
  "message": "Lead deleted successfully"
}
```

---

### 5. Search Leads
**GET** `/leads/search?q=john&page=1&limit=10`

**Query Parameters:**
- `q` - Search term (searches firstName, lastName, email, phone)
- `page` - Page number (default: 1)
- `limit` - Results per page (default: 10)

**Response:**
```json
{
  "success": true,
  "data": {
    "leads": [ /* Array of leads */ ],
    "pagination": {
      "total": 5,
      "page": 1,
      "pages": 1,
      "limit": 10
    }
  }
}
```

---

### 6. Filter Leads
**GET** `/leads/filter?status=<statusId>&assignedTo=<employeeId>&source=<sourceId>&priority=HIGH&page=1&limit=10`

**Query Parameters:**
- `status` - Lead status ID
- `assignedTo` - Employee ID
- `source` - Lead source ID
- `priority` - Lead priority (LOW, MEDIUM, HIGH, URGENT)
- `page` - Page number
- `limit` - Results per page

**Response:**
```json
{
  "success": true,
  "data": {
    "leads": [ /* Filtered leads */ ],
    "pagination": { /* Pagination info */ }
  }
}
```

---

## Lead Assignment Endpoints

### 7. Assign Lead to Employee
**POST** `/leads/:leadId/assign`

**Request Body:**
```json
{
  "assignedTo": "64f1a1c1d2e3f4g5h6i7j8k2",
  "reassignmentReason": "Better suited for this agent's specialization"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "64f1a1c1d2e3f4g5h6i7j8m0",
    "lead": "64f1a1c1d2e3f4g5h6i7j8l0",
    "assignedTo": "64f1a1c1d2e3f4g5h6i7j8k2",
    "assignmentDate": "2024-01-15T10:35:00Z",
    "assignmentStatus": "ACTIVE"
  }
}
```

---

### 8. Get Assignment History
**GET** `/leads/:leadId/assignments`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "64f1a1c1d2e3f4g5h6i7j8m0",
      "lead": "64f1a1c1d2e3f4g5h6i7j8l0",
      "assignedBy": { "firstName": "Amit", "lastName": "Patel" },
      "assignedTo": { "firstName": "Rajesh", "lastName": "Kumar" },
      "assignmentDate": "2024-01-15T10:35:00Z",
      "assignmentStatus": "ACTIVE"
    }
  ]
}
```

---

## Lead Activity Endpoints

### 9. Add Activity
**POST** `/leads/:leadId/activities`

**Request Body:**
```json
{
  "activityType": "CALL",
  "title": "Initial Contact Call",
  "description": "First call to discuss property preferences",
  "scheduledDate": "2024-01-15T14:00:00Z",
  "priority": "HIGH",
  "outcome": "Lead is interested, needs more information",
  "nextSteps": "Schedule site visit for next week"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "64f1a1c1d2e3f4g5h6i7j8n0",
    "lead": "64f1a1c1d2e3f4g5h6i7j8l0",
    "activityType": "CALL",
    "title": "Initial Contact Call",
    "status": "SCHEDULED",
    "createdAt": "2024-01-15T10:40:00Z"
  }
}
```

---

### 10. Get Lead Activities
**GET** `/leads/:leadId/activities?limit=20`

**Query Parameters:**
- `limit` - Maximum number of activities (default: 20)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "64f1a1c1d2e3f4g5h6i7j8n0",
      "activityType": "CALL",
      "title": "Initial Contact Call",
      "status": "COMPLETED",
      "completedDate": "2024-01-15T14:30:00Z",
      "createdBy": { "firstName": "Rajesh", "lastName": "Kumar" }
    }
  ]
}
```

---

### 11. Complete Activity
**PUT** `/activities/:activityId/complete`

**Request Body:**
```json
{
  "outcome": "Call successful, customer interested",
  "nextSteps": "Send proposal on email"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "64f1a1c1d2e3f4g5h6i7j8n0",
    "status": "COMPLETED",
    "completedDate": "2024-01-15T14:30:00Z",
    "outcome": "Call successful, customer interested"
  }
}
```

---

## Lead Follow-up Endpoints

### 12. Create Follow-up
**POST** `/leads/:leadId/followups`

**Request Body:**
```json
{
  "assignedTo": "64f1a1c1d2e3f4g5h6i7j8k2",
  "scheduledDate": "2024-01-22T10:00:00Z",
  "title": "Follow-up Call",
  "description": "Check if customer is ready to visit property",
  "reminderSet": true,
  "reminderTime": 30
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "64f1a1c1d2e3f4g5h6i7j8o0",
    "lead": "64f1a1c1d2e3f4g5h6i7j8l0",
    "assignedTo": "64f1a1c1d2e3f4g5h6i7j8k2",
    "scheduledDate": "2024-01-22T10:00:00Z",
    "status": "PENDING"
  }
}
```

---

### 13. Get Pending Follow-ups
**GET** `/employees/:employeeId/followups/pending`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "64f1a1c1d2e3f4g5h6i7j8o0",
      "lead": {
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@example.com"
      },
      "scheduledDate": "2024-01-22T10:00:00Z",
      "title": "Follow-up Call",
      "status": "PENDING"
    }
  ]
}
```

---

### 14. Complete Follow-up
**PUT** `/followups/:followUpId/complete`

**Request Body:**
```json
{
  "completedNotes": "Customer confirmed site visit for next week"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "64f1a1c1d2e3f4g5h6i7j8o0",
    "status": "COMPLETED",
    "completedDate": "2024-01-22T10:15:00Z"
  }
}
```

---

## Analytics & Statistics Endpoints

### 15. Get Lead Statistics
**GET** `/leads/stats?status=<statusId>&assignedTo=<employeeId>`

**Query Parameters:**
- `status` - Filter by status ID (optional)
- `assignedTo` - Filter by employee ID (optional)

**Response:**
```json
{
  "success": true,
  "data": {
    "totalLeads": 45,
    "convertedLeads": 8,
    "lostLeads": 5,
    "newLeads": 32,
    "conversionRate": "17.78"
  }
}
```

---

### 16. Get Leads by Status
**GET** `/analytics/leads-by-status`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "64f1a1c1d2e3f4g5h6i7j8k9",
      "count": 32,
      "statusInfo": [
        {
          "_id": "64f1a1c1d2e3f4g5h6i7j8k9",
          "name": "New Lead",
          "color": "#3498db"
        }
      ]
    }
  ]
}
```

---

## Error Responses

### Standard Error Response
```json
{
  "success": false,
  "message": "Error message",
  "errors": [ /* Validation errors if any */ ]
}
```

### Common HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `409` - Conflict (e.g., duplicate email)
- `500` - Server Error

---

## Request/Response Examples

### Example 1: Complete Lead Creation Workflow
```bash
# 1. Create Lead
curl -X POST http://localhost:3000/api/v1/leads \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+91-9876543210",
    "status": "64f1a1c1d2e3f4g5h6i7j8k9",
    "source": "64f1a1c1d2e3f4g5h6i7j8k1",
    "priority": "HIGH"
  }'

# 2. Assign to Employee
curl -X POST http://localhost:3000/api/v1/leads/64f1a1c1d2e3f4g5h6i7j8l0/assign \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "assignedTo": "64f1a1c1d2e3f4g5h6i7j8k2"
  }'

# 3. Add Activity
curl -X POST http://localhost:3000/api/v1/leads/64f1a1c1d2e3f4g5h6i7j8l0/activities \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "activityType": "CALL",
    "title": "Initial Contact",
    "description": "First call",
    "priority": "HIGH"
  }'

# 4. Create Follow-up
curl -X POST http://localhost:3000/api/v1/leads/64f1a1c1d2e3f4g5h6i7j8l0/followups \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "assignedTo": "64f1a1c1d2e3f4g5h6i7j8k2",
    "scheduledDate": "2024-01-22T10:00:00Z",
    "title": "Follow-up Call"
  }'
```

---

## Pagination

All list endpoints support pagination:

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10, max: 100)

**Response Pagination Info:**
```json
{
  "pagination": {
    "total": 50,
    "page": 1,
    "pages": 5,
    "limit": 10
  }
}
```

---

## Sorting

Use `sort` query parameter:
```
GET /leads?sort=-createdAt,priority
```

Prefix with `-` for descending order.

---

## Filtering

Combine multiple filters:
```
GET /leads?status=<id>&priority=HIGH&assignedTo=<id>&page=1&limit=20
```

---
