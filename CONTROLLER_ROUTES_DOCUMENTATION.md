# Lead Controller & Routes Documentation

## Overview

The Lead Controller provides a production-ready Express.js API for lead management with:
- ✅ Input validation and error handling
- ✅ Consistent response structure
- ✅ Business logic integration (via LeadService)
- ✅ Comprehensive logging
- ✅ Proper HTTP status codes
- ✅ Exception handling

---

## API Endpoints

### Base URL
```
http://localhost:3000/api/leads
```

---

## Endpoints Reference

### 1. CREATE LEAD
**Endpoint:** `POST /api/leads`
**Status Code:** 201 Created

Creates a new lead with validation, duplicate checking, and auto-assignment.

**Request:**
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane@example.com",
  "phone": "+1234567890",
  "source": "WEBSITE",
  "priority": "HIGH",
  "campaign": "Summer Campaign",
  "propertyId": "prop_123",
  "location": {
    "city": "Toronto",
    "coordinates": {
      "lat": 43.6629,
      "lon": -79.3957
    }
  },
  "budgetMin": 100000,
  "budgetMax": 500000,
  "autoAssign": true,
  "assignmentStrategy": "LOAD_BALANCED"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Lead created successfully",
  "data": {
    "_id": "63d7e8f9c1234567890abcd0",
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "jane@example.com",
    "phone": "+1234567890",
    "status": "NEW_LEAD",
    "source": "WEBSITE",
    "priority": "HIGH",
    "assignedTo": {
      "_id": "63d7e8f9c1234567890abcd1",
      "firstName": "Alice",
      "lastName": "Agent"
    },
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  },
  "statusCode": 201
}
```

**Response (Validation Error):**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "statusCode": 400,
    "details": {
      "email": "Invalid email format",
      "source": "Source must be from allowed values"
    }
  }
}
```

**Response (Duplicate Found):**
```json
{
  "success": false,
  "error": {
    "code": "DUPLICATE_ENTRY",
    "message": "Lead with email jane@example.com already exists",
    "statusCode": 409,
    "existingResource": {
      "_id": "63d7e8f9c1234567890abcd5",
      "firstName": "Jane",
      "lastName": "Smith",
      "email": "jane@example.com",
      "phone": "+1234567890",
      "status": "QUALIFIED"
    }
  }
}
```

---

### 2. GET ALL LEADS
**Endpoint:** `GET /api/leads`
**Status Code:** 200 OK

Retrieves paginated list of leads with optional filtering.

**Query Parameters:**
```
?page=1
&limit=10
&status=QUALIFIED,IN_NEGOTIATION
&source=WEBSITE
&priority=HIGH
&assignedTo=agent_123
&minBudget=100000
&maxBudget=500000
```

**Response:**
```json
{
  "success": true,
  "message": "Leads retrieved successfully",
  "data": [
    {
      "_id": "63d7e8f9c1234567890abcd0",
      "firstName": "Jane",
      "lastName": "Smith",
      "email": "jane@example.com",
      "phone": "+1234567890",
      "status": "QUALIFIED",
      "source": "WEBSITE",
      "priority": "HIGH",
      "assignedTo": { ... }
    },
    { ... }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 150,
    "pages": 15
  },
  "statusCode": 200
}
```

---

### 3. GET SINGLE LEAD
**Endpoint:** `GET /api/leads/:id`
**Status Code:** 200 OK

Retrieves detailed information for a single lead.

**Path Parameters:**
```
:id = "63d7e8f9c1234567890abcd0"
```

**Response:**
```json
{
  "success": true,
  "message": "Lead retrieved successfully",
  "data": {
    "_id": "63d7e8f9c1234567890abcd0",
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "jane@example.com",
    "phone": "+1234567890",
    "status": "QUALIFIED",
    "source": "WEBSITE",
    "priority": "HIGH",
    "campaign": "Summer Campaign",
    "assignedTo": {
      "_id": "63d7e8f9c1234567890abcd1",
      "firstName": "Alice",
      "lastName": "Agent",
      "email": "alice@company.com",
      "role": "SENIOR_AGENT"
    },
    "location": {
      "city": "Toronto",
      "coordinates": { "lat": 43.6629, "lon": -79.3957 }
    },
    "budgetMin": 100000,
    "budgetMax": 500000,
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-16T14:20:00Z"
  },
  "statusCode": 200
}
```

**Response (Not Found):**
```json
{
  "success": false,
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "Lead 63d7e8f9c1234567890abcd0 not found",
    "statusCode": 404
  }
}
```

---

### 4. UPDATE LEAD
**Endpoint:** `PUT /api/leads/:id`
**Status Code:** 200 OK

Updates lead information with validation.

**Request:**
```json
{
  "firstName": "Janet",
  "priority": "CRITICAL",
  "budgetMax": 750000,
  "location": {
    "city": "Vancouver"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Lead updated successfully",
  "data": {
    "_id": "63d7e8f9c1234567890abcd0",
    "firstName": "Janet",
    "lastName": "Smith",
    "priority": "CRITICAL",
    "budgetMax": 750000,
    "location": { "city": "Vancouver" },
    "updatedAt": "2024-01-16T15:30:00Z"
  },
  "statusCode": 200
}
```

---

### 5. DELETE LEAD
**Endpoint:** `DELETE /api/leads/:id`
**Status Code:** 200 OK

Soft-deletes a lead (marks as deleted, doesn't remove from DB).

**Response:**
```json
{
  "success": true,
  "message": "Lead deleted successfully",
  "data": {
    "_id": "63d7e8f9c1234567890abcd0",
    "isDeleted": true,
    "deletedAt": "2024-01-16T16:00:00Z"
  },
  "statusCode": 200
}
```

---

### 6. UPDATE LEAD STATUS
**Endpoint:** `PATCH /api/leads/:id/status`
**Status Code:** 200 OK

Updates lead status with transition validation.

**Request:**
```json
{
  "status": "QUALIFIED"
}
```

**Valid Status Transitions:**
```
NEW_LEAD      → CONTACTED, QUALIFIED, LOST, INACTIVE
CONTACTED     → QUALIFIED, IN_NEGOTIATION, LOST, INACTIVE
QUALIFIED     → IN_NEGOTIATION, LOST, INACTIVE
IN_NEGOTIATION → CONVERTED, LOST, INACTIVE
CONVERTED     → (terminal)
LOST          → INACTIVE
INACTIVE      → NEW_LEAD, CONTACTED
```

**Response:**
```json
{
  "success": true,
  "message": "Lead status updated successfully",
  "data": {
    "_id": "63d7e8f9c1234567890abcd0",
    "status": "QUALIFIED",
    "updatedAt": "2024-01-16T16:30:00Z"
  },
  "statusCode": 200
}
```

**Response (Invalid Transition):**
```json
{
  "success": false,
  "error": {
    "code": "BUSINESS_RULE_VIOLATION",
    "message": "Cannot transition from CONVERTED to LOST",
    "statusCode": 422
  }
}
```

---

### 7. ASSIGN LEAD
**Endpoint:** `POST /api/leads/:id/assign`
**Status Code:** 200 OK

Manually assigns lead to an agent.

**Request:**
```json
{
  "agentId": "63d7e8f9c1234567890abcd1"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Lead assigned successfully",
  "data": {
    "_id": "63d7e8f9c1234567890abcd0",
    "assignedTo": {
      "_id": "63d7e8f9c1234567890abcd1",
      "firstName": "Bob",
      "lastName": "Manager"
    },
    "assignmentDate": "2024-01-16T17:00:00Z"
  },
  "statusCode": 200
}
```

---

### 8. CONVERT LEAD
**Endpoint:** `POST /api/leads/:id/convert`
**Status Code:** 200 OK

Converts lead to customer and records deal value.

**Request:**
```json
{
  "value": 500000
}
```

**Response:**
```json
{
  "success": true,
  "message": "Lead converted successfully",
  "data": {
    "_id": "63d7e8f9c1234567890abcd0",
    "status": "CONVERTED",
    "conversionValue": 500000,
    "conversionDate": "2024-01-16T17:30:00Z",
    "updatedAt": "2024-01-16T17:30:00Z"
  },
  "statusCode": 200
}
```

---

### 9. SEARCH LEADS
**Endpoint:** `GET /api/leads/search`
**Status Code:** 200 OK

Full-text search on lead data.

**Query Parameters:**
```
?q=jane smith
```

**Response:**
```json
{
  "success": true,
  "message": "Search completed successfully",
  "data": [
    {
      "_id": "63d7e8f9c1234567890abcd0",
      "firstName": "Jane",
      "lastName": "Smith",
      "email": "jane@example.com",
      ...
    }
  ],
  "statusCode": 200
}
```

---

### 10. GET STATISTICS
**Endpoint:** `GET /api/leads/stats`
**Status Code:** 200 OK

Retrieves lead statistics and analytics.

**Query Parameters:**
```
?source=WEBSITE
&status=CONVERTED
```

**Response:**
```json
{
  "success": true,
  "message": "Statistics retrieved successfully",
  "data": {
    "totalLeads": 150,
    "byStatus": {
      "NEW_LEAD": 30,
      "CONTACTED": 45,
      "QUALIFIED": 40,
      "IN_NEGOTIATION": 20,
      "CONVERTED": 15,
      "LOST": 0,
      "INACTIVE": 0
    },
    "bySource": {
      "WEBSITE": 60,
      "FACEBOOK": 30,
      "GOOGLE_ADS": 40,
      "REFERRAL": 20
    },
    "conversionRate": 10,
    "averageValue": 350000
  },
  "statusCode": 200
}
```

---

## Error Handling

### Standard Error Response Structure
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "statusCode": 400,
    "details": {} // Optional: field-level errors
  }
}
```

### HTTP Status Codes

| Code | Meaning | Scenario |
|------|---------|----------|
| 200 | OK | Successful GET, PUT, DELETE, PATCH |
| 201 | Created | Successful POST (create) |
| 400 | Bad Request | Invalid input, missing fields |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate entry found |
| 422 | Unprocessable Entity | Business rule violation |
| 503 | Service Unavailable | Auto-assignment failed (no agents) |
| 500 | Server Error | Unexpected error |

### Error Codes

| Code | HTTP | Meaning |
|------|------|---------|
| `VALIDATION_ERROR` | 400 | Input validation failed |
| `EMPTY_BODY` | 400 | Request body is empty |
| `INVALID_ID` | 400 | Lead ID format invalid |
| `MISSING_STATUS` | 400 | Status parameter missing |
| `INVALID_VALUE` | 400 | Conversion value invalid |
| `INVALID_AGENT_ID` | 400 | Agent ID missing |
| `MISSING_QUERY` | 400 | Search query missing |
| `RESOURCE_NOT_FOUND` | 404 | Lead not found |
| `DUPLICATE_ENTRY` | 409 | Lead with same email/phone exists |
| `BUSINESS_RULE_VIOLATION` | 422 | Invalid status transition |
| `AUTO_ASSIGNMENT_FAILED` | 503 | No available agents |
| `ROUTE_NOT_FOUND` | 404 | Endpoint doesn't exist |

---

## Request/Response Examples

### Create Lead with cURL
```bash
curl -X POST http://localhost:3000/api/leads \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "jane@example.com",
    "phone": "+1234567890",
    "source": "WEBSITE",
    "priority": "HIGH"
  }'
```

### Get Leads with Filters
```bash
curl "http://localhost:3000/api/leads?page=1&limit=20&status=QUALIFIED&priority=HIGH"
```

### Update Lead Status
```bash
curl -X PATCH http://localhost:3000/api/leads/63d7e8f9c1234567890abcd0/status \
  -H "Content-Type: application/json" \
  -d '{"status": "QUALIFIED"}'
```

### Convert Lead
```bash
curl -X POST http://localhost:3000/api/leads/63d7e8f9c1234567890abcd0/convert \
  -H "Content-Type: application/json" \
  -d '{"value": 500000}'
```

---

## Response Structure

All responses follow this consistent structure:

**Success Response:**
```json
{
  "success": true,
  "message": "Human-readable message",
  "data": {} or [],
  "pagination": {} (if applicable),
  "statusCode": 200
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description",
    "statusCode": 400,
    "details": {} (optional)
  }
}
```

---

## Pagination

When retrieving multiple records, use pagination:

```
GET /api/leads?page=2&limit=25
```

**Response includes:**
```json
{
  "pagination": {
    "page": 2,
    "limit": 25,
    "total": 500,
    "pages": 20
  }
}
```

- `page`: Current page (1-based)
- `limit`: Records per page (max 100)
- `total`: Total records matching filters
- `pages`: Total pages available

---

## Filtering

Leads can be filtered by multiple criteria:

```
GET /api/leads?
  status=QUALIFIED,IN_NEGOTIATION&
  source=WEBSITE&
  priority=HIGH&
  assignedTo=agent_123&
  minBudget=100000&
  maxBudget=500000&
  page=1&
  limit=50
```

**Supported Filters:**
- `status`: String or comma-separated values
- `source`: WEBSITE, FACEBOOK, GOOGLE_ADS, REFERRAL, WALK_IN, CALL, EMAIL
- `priority`: LOW, MEDIUM, HIGH, CRITICAL
- `assignedTo`: Agent ID
- `minBudget`: Minimum budget value
- `maxBudget`: Maximum budget value

---

## Field Validation

| Field | Type | Constraints | Example |
|-------|------|-------------|---------|
| firstName | String | 2-50 chars, required | "Jane" |
| lastName | String | 2-50 chars, required | "Smith" |
| email | String | Valid format, required | "jane@example.com" |
| phone | String | Valid international format, required | "+1234567890" |
| source | Enum | Required, specific values | "WEBSITE" |
| priority | Enum | Optional, default: MEDIUM | "HIGH" |
| status | Enum | Optional, default: NEW_LEAD | "QUALIFIED" |
| location.city | String | Optional | "Toronto" |
| budgetMin | Number | Optional | 100000 |
| budgetMax | Number | Optional, ≥ budgetMin | 500000 |

---

## Best Practices

1. **Always check response.success** before accessing data
2. **Handle specific error codes** for user feedback
3. **Use pagination** for large result sets (limit ≤ 50 recommended)
4. **Include minimal required fields** only (validation optimizes)
5. **Use exact status values** (case-sensitive)
6. **Combine filters** for precise results
7. **Implement retry logic** for 5xx errors
8. **Log all errors** for debugging

---

## Integration with Authentication

If authentication middleware is enabled, include auth token:

```bash
curl -X POST http://localhost:3000/api/leads \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{ ... }'
```

The `req.user.id` from auth middleware is used for activity logging.

---

## Rate Limiting (Optional)

If rate limiting is implemented:
- Check `X-RateLimit-*` headers in response
- Implement exponential backoff for 429 responses
- Cache results when possible

---

## Performance Tips

1. **Filter before paginating** for faster results
2. **Use specific status values** instead of retrieving all then filtering
3. **Limit results** to needed fields via queries
4. **Cache statistics** in frontend for dashboard
5. **Batch operations** when possible
6. **Monitor logs** for slow queries

---

**Document Version:** 1.0
**Last Updated:** Phase 9 - Controller Implementation
**Status:** Production Ready ✅
