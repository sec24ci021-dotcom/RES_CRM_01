# Lead Controller Integration & Testing Guide

## 🚀 Quick Start

### 1. Verify Environment
```bash
cd lead-management-module
npm install
```

### 2. Start Server
```bash
npm run dev
```

Expected output:
```
════════════════════════════════════════════════════════════════
🚀 LEAD MANAGEMENT SYSTEM
════════════════════════════════════════════════════════════════
Application Name: Lead Management System
Version: 1.0.0
Environment: development
Started at: [timestamp]
Server running on: http://localhost:3000
API Endpoint: http://localhost:3000/api/v1
Health Check: http://localhost:3000/health
════════════════════════════════════════════════════════════════
```

---

## 📡 API Testing

### Health Check
```bash
curl http://localhost:3000/health
```

Response (200 OK):
```json
{
  "success": true,
  "status": "OK",
  "database": "Connected",
  "timestamp": "2024-01-16T10:30:00Z",
  "environment": "development"
}
```

---

## 🧪 Test Cases

### Test 1: Create Lead (Basic)
```bash
curl -X POST http://localhost:3000/api/v1/leads \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "source": "WEBSITE"
  }'
```

**Expected Response (201 Created):**
```json
{
  "success": true,
  "message": "Lead created successfully",
  "data": {
    "_id": "63d7e8f9c1234567890abcd0",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "status": "NEW_LEAD",
    "assignedTo": { ... }
  },
  "statusCode": 201
}
```

---

### Test 2: Validation Error
```bash
curl -X POST http://localhost:3000/api/v1/leads \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John"
  }'
```

**Expected Response (400 Bad Request):**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "statusCode": 400,
    "details": {
      "lastName": "Last name is required",
      "email": "Email is required"
    }
  }
}
```

---

### Test 3: Duplicate Detection
```bash
# Create first lead
curl -X POST http://localhost:3000/api/v1/leads \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "jane@example.com",
    "phone": "+9876543210",
    "source": "FACEBOOK"
  }'

# Try to create duplicate
curl -X POST http://localhost:3000/api/v1/leads \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "jane@example.com",
    "phone": "+9876543210",
    "source": "FACEBOOK"
  }'
```

**Expected Response (409 Conflict):**
```json
{
  "success": false,
  "error": {
    "code": "DUPLICATE_ENTRY",
    "message": "Lead with email jane@example.com already exists",
    "statusCode": 409,
    "existingResource": {
      "_id": "63d7e8f9c1234567890abcd2",
      "firstName": "Jane",
      "lastName": "Smith",
      "email": "jane@example.com"
    }
  }
}
```

---

### Test 4: Get All Leads
```bash
curl "http://localhost:3000/api/v1/leads?page=1&limit=10&status=QUALIFIED"
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "message": "Leads retrieved successfully",
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  },
  "statusCode": 200
}
```

---

### Test 5: Get Single Lead
```bash
curl http://localhost:3000/api/v1/leads/63d7e8f9c1234567890abcd0
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "message": "Lead retrieved successfully",
  "data": { ... },
  "statusCode": 200
}
```

**If not found (404):**
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

### Test 6: Update Lead Status
```bash
curl -X PATCH http://localhost:3000/api/v1/leads/63d7e8f9c1234567890abcd0/status \
  -H "Content-Type: application/json" \
  -d '{"status": "QUALIFIED"}'
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "message": "Lead status updated successfully",
  "data": {
    "_id": "63d7e8f9c1234567890abcd0",
    "status": "QUALIFIED",
    "updatedAt": "2024-01-16T11:00:00Z"
  },
  "statusCode": 200
}
```

---

### Test 7: Invalid Status Transition
```bash
curl -X PATCH http://localhost:3000/api/v1/leads/63d7e8f9c1234567890abcd0/status \
  -H "Content-Type: application/json" \
  -d '{"status": "NEW_LEAD"}'
```

**Expected Response (422 Unprocessable Entity):**
```json
{
  "success": false,
  "error": {
    "code": "BUSINESS_RULE_VIOLATION",
    "message": "Cannot transition from QUALIFIED to NEW_LEAD",
    "statusCode": 422
  }
}
```

---

### Test 8: Assign Lead
```bash
curl -X POST http://localhost:3000/api/v1/leads/63d7e8f9c1234567890abcd0/assign \
  -H "Content-Type: application/json" \
  -d '{"agentId": "63d7e8f9c1234567890abcd1"}'
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "message": "Lead assigned successfully",
  "data": {
    "_id": "63d7e8f9c1234567890abcd0",
    "assignedTo": {
      "_id": "63d7e8f9c1234567890abcd1",
      "firstName": "Alice",
      "lastName": "Agent"
    },
    "assignmentDate": "2024-01-16T11:30:00Z"
  },
  "statusCode": 200
}
```

---

### Test 9: Convert Lead
```bash
curl -X POST http://localhost:3000/api/v1/leads/63d7e8f9c1234567890abcd0/convert \
  -H "Content-Type: application/json" \
  -d '{"value": 500000}'
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "message": "Lead converted successfully",
  "data": {
    "_id": "63d7e8f9c1234567890abcd0",
    "status": "CONVERTED",
    "conversionValue": 500000,
    "conversionDate": "2024-01-16T12:00:00Z"
  },
  "statusCode": 200
}
```

---

### Test 10: Search Leads
```bash
curl "http://localhost:3000/api/v1/leads/search?q=john"
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "message": "Search completed successfully",
  "data": [
    {
      "_id": "63d7e8f9c1234567890abcd0",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com"
    }
  ],
  "statusCode": 200
}
```

---

### Test 11: Get Statistics
```bash
curl "http://localhost:3000/api/v1/leads/stats"
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "message": "Statistics retrieved successfully",
  "data": {
    "totalLeads": 50,
    "byStatus": {
      "NEW_LEAD": 20,
      "CONTACTED": 15,
      "QUALIFIED": 10,
      "CONVERTED": 5
    },
    "conversionRate": 10,
    "averageValue": 425000
  },
  "statusCode": 200
}
```

---

### Test 12: Delete Lead
```bash
curl -X DELETE http://localhost:3000/api/v1/leads/63d7e8f9c1234567890abcd0
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "message": "Lead deleted successfully",
  "data": {
    "_id": "63d7e8f9c1234567890abcd0",
    "isDeleted": true,
    "deletedAt": "2024-01-16T12:30:00Z"
  },
  "statusCode": 200
}
```

---

## 🔧 Error Response Format

All error responses follow this structure:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message",
    "statusCode": 400,
    "details": {} // Optional: field-level errors
  }
}
```

### Common HTTP Status Codes

| Code | Meaning | Error Code |
|------|---------|-----------|
| 200 | Success | N/A |
| 201 | Created | N/A |
| 400 | Bad Request | VALIDATION_ERROR, EMPTY_BODY |
| 404 | Not Found | RESOURCE_NOT_FOUND |
| 409 | Conflict | DUPLICATE_ENTRY |
| 422 | Unprocessable Entity | BUSINESS_RULE_VIOLATION |
| 503 | Service Unavailable | AUTO_ASSIGNMENT_FAILED |

---

## 🛠️ Troubleshooting

### Issue: Server Won't Start

**Check 1: Dependencies**
```bash
npm list
# Verify all dependencies are installed
```

**Check 2: Database Connection**
```bash
# Ensure MongoDB is running
# Check .env has valid DATABASE_URL
cat .env | grep DATABASE_URL
```

**Check 3: Port Already In Use**
```bash
# Change PORT in .env or:
npm run dev -- --port 3001
```

---

### Issue: 500 Internal Server Error

**Check 1: Service Dependencies**
- Verify all service files exist in `src/services/`
- Check all repositories exist in `src/repositories/`

**Check 2: Logger**
```bash
# Ensure logger.js exists and is properly configured
ls -la src/utils/logger.js
```

**Check 3: Constants**
```bash
# Verify constants are exported correctly
grep "module.exports" src/constants/index.js
```

---

### Issue: Route Not Found (404)

**Verify routes are mounted:**
```bash
# Check leadRoutes.js has all endpoints
grep "router\." src/routes/leadRoutes.js | head -20
```

**Verify routes are imported:**
```bash
# Check index.js imports leadRoutes
grep "leadRoutes" src/routes/index.js
```

---

### Issue: Validation Errors

**Check validation logic:**
```bash
# Ensure LeadValidationService exists
ls -la src/services/LeadValidationService.js
```

**Verify exception types:**
```bash
# Ensure all exceptions are exported
grep "class.*Exception" src/exceptions/index.js
```

---

## 📊 Load Testing

### Simple Load Test (10 requests)
```bash
for i in {1..10}; do
  curl -X POST http://localhost:3000/api/v1/leads \
    -H "Content-Type: application/json" \
    -d "{
      \"firstName\": \"User$i\",
      \"lastName\": \"Test\",
      \"email\": \"user$i@example.com\",
      \"phone\": \"+1234567890\",
      \"source\": \"WEBSITE\"
    }" &
done
wait
echo "Load test complete"
```

---

## 📝 Integration Checklist

- [ ] Server starts without errors
- [ ] Health check returns 200
- [ ] Can create lead
- [ ] Duplicate check works
- [ ] Can retrieve leads
- [ ] Can update lead status
- [ ] Status transition validation works
- [ ] Can assign lead
- [ ] Can convert lead
- [ ] Search functionality works
- [ ] Statistics endpoint works
- [ ] All error responses format correctly
- [ ] Pagination works correctly
- [ ] All filters work
- [ ] Activity logging captures operations

---

## 🔐 Security Notes

1. **Authentication**: Add auth middleware in production
2. **Authorization**: Verify user roles before operations
3. **Rate Limiting**: Implement rate limiting on public endpoints
4. **Input Validation**: Already implemented in service layer
5. **SQL Injection**: Not applicable (using Mongoose)
6. **CORS**: Configured in server.js
7. **Logging**: All operations logged with logger

---

## 📈 Performance Optimization

1. **Database Indexing**:
```bash
# Ensure these indexes exist:
db.leads.createIndex({ email: 1, isDeleted: 1 })
db.leads.createIndex({ phone: 1, isDeleted: 1 })
db.leads.createIndex({ status: 1 })
```

2. **Pagination**: Always use pagination for large result sets

3. **Caching**: Consider caching statistics (changes less frequently)

4. **Query Optimization**: Use projection to select only needed fields

---

## 🎯 Next Steps

1. **Authentication**: Implement JWT-based authentication
2. **Authorization**: Add role-based access control (RBAC)
3. **API Documentation**: Generate Swagger/OpenAPI docs
4. **Unit Tests**: Create Jest test suites
5. **Integration Tests**: Full workflow testing
6. **Monitoring**: Set up error tracking (Sentry)
7. **Analytics**: Track API metrics and usage

---

**Version:** 1.0
**Last Updated:** Phase 9 - Controller Implementation
**Status:** Ready for Testing ✅
