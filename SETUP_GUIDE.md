# Setup & Implementation Guide for Layered Architecture

## 🚀 Quick Start

### Prerequisites
- Node.js 14+ installed
- MongoDB running locally or MongoDB Atlas URI
- npm or yarn package manager

### Installation Steps

#### 1. Install Dependencies
```bash
npm install
```

All required packages will be installed:
- `express` - Web framework
- `mongoose` - MongoDB ODM
- `dotenv` - Environment variables
- `cors` - Cross-origin requests
- `morgan` - HTTP request logging
- `jsonwebtoken` - JWT authentication
- `bcryptjs` - Password hashing (for future use)
- `joi` - Schema validation
- `helmet` - Security headers
- `express-rate-limit` - Rate limiting

#### 2. Setup Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Update `.env` with your settings:
```env
# Application
NODE_ENV=development
PORT=3000

# Database
MONGODB_URI=mongodb://localhost:27017/lead-crm

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# Logging
LOG_LEVEL=info
LOG_FORMAT=combined

# CORS
CORS_ORIGIN=http://localhost:3000,http://localhost:3001
```

#### 3. Ensure MongoDB is Running

**For local MongoDB:**
```bash
# macOS with Homebrew
brew services start mongodb-community

# Windows (if installed as service)
net start MongoDB

# Linux
sudo systemctl start mongod

# Or run MongoDB in Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

**For MongoDB Atlas:**
Update `MONGODB_URI` in `.env`:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/lead-crm
```

#### 4. Start the Server

**Development (with auto-reload):**
```bash
npm run dev
```

**Production:**
```bash
npm start
```

#### 5. Initialize Database (Optional)
```bash
npm run init-db
```

This populates the database with sample data.

---

## 📊 Project Structure Overview

### Layered Architecture Diagram
```
┌─────────────────────────────────────────┐
│       HTTP Request/Response             │
│    (REST API - JSON Format)             │
├─────────────────────────────────────────┤
│  Route Layer (src/routes/)              │  ← Endpoint mapping
├─────────────────────────────────────────┤
│  Controller Layer (src/controllers/)    │  ← Request handling
├─────────────────────────────────────────┤
│  Service Layer (src/services/)          │  ← Business logic
├─────────────────────────────────────────┤
│  Repository Layer (src/repositories/)   │  ← Data access
├─────────────────────────────────────────┤
│  Model Layer (src/models/)              │  ← Schema & validation
├─────────────────────────────────────────┤
│  Database Layer (MongoDB)               │  ← Data storage
├─────────────────────────────────────────┤
│  Config/Middleware/Utils                │  ← Cross-cutting concerns
└─────────────────────────────────────────┘
```

---

## 🏗️ Implementation Details

### 1. Configuration Layer

**Location:** `src/config/`

**Key Files:**
- `environment.js` - Central configuration
- `database.js` - MongoDB connection

**Usage:**
```javascript
const config = require('./src/config/environment');
const { connectDB } = require('./src/config/database');

console.log(config.port);        // 3000
console.log(config.nodeEnv);     // development
```

---

### 2. Middleware Layer

**Location:** `src/middleware/`

**Available Middleware:**
- `authenticate` - Verify JWT token
- `authorize(...roles)` - Check user roles
- `asyncHandler(fn)` - Wrap async route handlers
- `errorHandler` - Global error handling

**Usage:**
```javascript
// In routes
router.get('/admin', authenticate, authorize('ADMIN'), handler);

// In controllers
const handler = asyncHandler(async (req, res) => {
    // Errors automatically caught
});
```

---

### 3. Route Layer

**Location:** `src/routes/`

**Available Routes:**
```
GET    /api/v1/                     - API documentation
GET    /api/v1/status               - API status
GET    /api/v1/health               - Health check

GET    /api/v1/leads                - List all leads
POST   /api/v1/leads                - Create lead
GET    /api/v1/leads/:id            - Get lead details
PUT    /api/v1/leads/:id            - Update lead
DELETE /api/v1/leads/:id            - Delete lead

GET    /api/v1/leads/search?q=...   - Search leads
POST   /api/v1/leads/filter         - Filter leads
GET    /api/v1/leads/unassigned     - Get unassigned leads
GET    /api/v1/leads/statistics/summary - Get statistics

PATCH  /api/v1/leads/:id/assign     - Assign lead
PATCH  /api/v1/leads/:id/convert    - Convert lead
PATCH  /api/v1/leads/:id/lost       - Mark as lost
```

---

### 4. Controller Layer

**Location:** `src/controllers/LeadController.js`

**Available Methods:**
```javascript
- createLead()           - Create new lead
- getAllLeads()          - Get all leads with pagination
- getLeadById()          - Get single lead
- updateLead()           - Update lead
- deleteLead()           - Delete lead
- getLeadsByStatus()     - Filter by status
- getUnassignedLeads()   - Get unassigned leads
- assignLead()           - Assign to employee
- searchLeads()          - Search functionality
- filterLeads()          - Advanced filtering
- getStatistics()        - Get analytics
- convertLead()          - Mark as converted
- markAsLost()           - Mark as lost
```

---

### 5. Service Layer

**Location:** `src/services/LeadService.js`

**Business Logic Methods:**
```javascript
- createLead(data, userId)
- getLeadById(id)
- updateLead(id, data, userId)
- deleteLead(id)
- getLeadsByStatus(status, options)
- getUnassignedLeads(options)
- assignLead(id, employeeId, userId)
- searchLeads(term, options)
- filterLeads(filters, options)
- getLeadStatistics(filters)
- convertLead(id, value)
- markLeadAsLost(id)
```

---

### 6. Repository Layer

**Location:** `src/repositories/`

**Base Repository Methods:**
```javascript
- findAll(filter, options)
- findById(id, options)
- findOne(filter, options)
- count(filter)
- create(data)
- createMany(documents)
- updateById(id, data)
- updateMany(filter, data)
- deleteById(id)
- deleteMany(filter)
- softDelete(id)
- restore(id)
- paginate(filter, options)
- exists(filter)
```

**Lead Repository Methods:**
```javascript
- findByAssignedEmployee(employeeId, options)
- findByStatus(status, options)
- findBySource(source, options)
- findHighPriority(options)
- searchLeads(term, options)
- filterLeads(filters, options)
- getLeadStatistics(filters)
- getLeadsByStatus()
- getUnassignedLeads(options)
- getRecentLeads(days, options)
- bulkUpdate(ids, data)
- bulkSoftDelete(ids)
```

---

### 7. Model Layer

**Location:** `src/models/Lead.js`

**Schema Fields:**
```javascript
// Contact
- firstName         [required, min: 2, max: 50]
- lastName          [required, min: 2, max: 50]
- email             [required, unique, validated]
- phone             [required, validated]

// Classification
- status            [enum: LEAD_STATUS, indexed]
- source            [enum: LEAD_SOURCE, required]
- priority          [enum: LEAD_PRIORITY, default: MEDIUM]

// Assignment
- assignedTo        [ref: Employee, optional]

// Property Info
- propertyType      [Residential, Commercial, etc.]
- location          [address, city, state, zipCode, country, coordinates]

// Budget
- budgetMin         [number, min: 0]
- budgetMax         [number, min: 0]

// Conversion
- conversionStatus  [In Progress, Converted, Abandoned]
- conversionValue   [number, min: 0]

// Metadata
- notes             [max: 1000 chars]
- tags              [array]
- customFields      [mixed]
- createdBy         [ref: Employee]
- updatedBy         [ref: Employee]
- isDeleted         [boolean, default: false, indexed]
- deletedAt         [date]
- timestamps        [createdAt, updatedAt]
```

---

### 8. Constants Layer

**Location:** `src/constants/index.js`

**Available Constants:**
```javascript
// HTTP Status Codes
HTTP_STATUS.OK, CREATED, BAD_REQUEST, UNAUTHORIZED, NOT_FOUND, etc.

// Lead Statuses
LEAD_STATUS.NEW, CONTACTED, QUALIFIED, IN_NEGOTIATION, CONVERTED, LOST, INACTIVE

// Lead Stages
LEAD_STAGE.DISCOVERY, QUALIFICATION, NEGOTIATION, CLOSURE, POST_SALE

// Lead Sources
LEAD_SOURCE.WEBSITE, FACEBOOK, GOOGLE_ADS, REFERRAL, WALK_IN, CALL, EMAIL

// Lead Priority
LEAD_PRIORITY.LOW, MEDIUM, HIGH, CRITICAL

// Employee Roles
EMPLOYEE_ROLE.JUNIOR_AGENT, SENIOR_AGENT, MANAGER, DIRECTOR, ADMIN

// Error Codes
ERROR_CODES.INVALID_REQUEST, UNAUTHORIZED, FORBIDDEN, RESOURCE_NOT_FOUND, etc.
```

---

### 9. Utils Layer

**Location:** `src/utils/`

**Logger Utility:**
```javascript
logger.info('message')     // Info level
logger.warn('message')     // Warning level
logger.error('message')    // Error level
logger.debug('message')    // Debug level (dev only)
```

**Response Handler:**
```javascript
sendSuccess(res, data, message, statusCode)
sendCreated(res, data, message)
sendError(res, message, statusCode, errorCode, details)
sendValidationError(res, errors)
sendNotFound(res, message)
sendUnauthorized(res, message)
sendForbidden(res, message)
sendPaginated(res, data, total, page, limit, message)
```

**Validation Helper:**
```javascript
validateRequired(data, fields)
validateEmail(email)
validatePhone(phone)
validateObjectId(id)
validatePagination(page, limit)
validateDate(dateString)
validateEnum(value, enumValues)
validateBudgetRange(min, max)
```

---

## 🧪 Testing the API

### 1. Check Server Health
```bash
curl http://localhost:3000/health
```

Response:
```json
{
  "success": true,
  "status": "OK",
  "database": "Connected",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "environment": "development"
}
```

### 2. Create a Lead
```bash
curl -X POST http://localhost:3000/api/v1/leads \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+1-800-123-4567",
    "source": "WEBSITE",
    "priority": "HIGH",
    "propertyType": "Residential",
    "budgetMin": 100000,
    "budgetMax": 500000
  }'
```

### 3. Get All Leads
```bash
curl http://localhost:3000/api/v1/leads?page=1&limit=10
```

### 4. Get Lead Details
```bash
curl http://localhost:3000/api/v1/leads/{id}
```

### 5. Search Leads
```bash
curl 'http://localhost:3000/api/v1/leads/search?q=John&page=1&limit=10'
```

### 6. Filter Leads
```bash
curl -X POST http://localhost:3000/api/v1/leads/filter \
  -H "Content-Type: application/json" \
  -d '{
    "filters": {
      "status": "NEW_LEAD",
      "priority": "HIGH"
    },
    "page": 1,
    "limit": 10
  }'
```

---

## 📝 npm Scripts

```bash
npm start           # Start production server
npm run dev         # Start with nodemon (auto-reload)
npm run init-db     # Initialize database with sample data
npm test            # Run test suite
npm run test:watch  # Run tests in watch mode
npm run lint        # Check code quality
npm run lint:fix    # Fix linting issues
npm run format      # Format code with prettier
npm run seed        # Seed database (alias for init-db)
```

---

## 🔒 Security Features Implemented

### 1. Input Validation
- Validators in controller
- Schema validation in model
- Custom validation helpers

### 2. Authentication
- JWT token-based auth
- Token verification middleware
- Secure token generation

### 3. Authorization
- Role-based access control (RBAC)
- Endpoint-level protection
- Route-level permissions

### 4. Error Handling
- Centralized error handler
- Standardized error responses
- Development vs production modes

### 5. Data Security
- Soft delete (never truly deleted)
- Audit trails (createdBy, updatedBy)
- Encrypted passwords (ready for implementation)

### 6. Environment Security
- Sensitive data in .env
- Production validation
- Secure defaults

---

## 🚀 Deployment Checklist

- [ ] Set `NODE_ENV=production` in .env
- [ ] Change `JWT_SECRET` to secure value
- [ ] Use MongoDB Atlas for database
- [ ] Enable CORS only for trusted origins
- [ ] Set up environment variables on server
- [ ] Test all endpoints thoroughly
- [ ] Set up logging and monitoring
- [ ] Configure backup strategy
- [ ] Set up CI/CD pipeline
- [ ] Enable HTTPS on server
- [ ] Configure rate limiting
- [ ] Set up error tracking (Sentry, etc.)

---

## 📚 Documentation Files

- `LAYERED_ARCHITECTURE.md` - Architecture overview
- `FOLDER_STRUCTURE.md` - Complete folder structure
- `API_DOCUMENTATION.md` - API endpoints (in docs/)
- `ARCHITECTURE.md` - System design (in docs/)
- `QUICK_REFERENCE.md` - Quick reference (in docs/)

---

## 🆘 Troubleshooting

### Issue: MongoDB Connection Failed
**Solution:**
- Ensure MongoDB is running: `mongod`
- Check connection string in `.env`
- Try MongoDB Atlas: `mongodb+srv://...`

### Issue: Port 3000 Already in Use
**Solution:**
- Change PORT in `.env` to unused port
- Or kill process using port 3000

### Issue: Module Not Found
**Solution:**
- Run `npm install` to install dependencies
- Check file paths and imports
- Ensure .env file exists

### Issue: Cannot Find schema has `X` path, but received `Y`
**Solution:**
- Check model schema definition
- Verify request payload matches schema
- Check spelling of field names

---

## 📞 Next Steps

1. **Implement Authentication Routes**
   - User login endpoint
   - User registration
   - Refresh token endpoint

2. **Add More Models**
   - Employee model
   - LeadActivity model
   - LeadAssignment model

3. **Implement Testing**
   - Unit tests with Jest
   - Integration tests
   - API endpoint tests

4. **Add Frontend**
   - React/Vue application
   - Admin dashboard
   - Mobile app

5. **Deploy to Production**
   - Docker containerization
   - Kubernetes orchestration
   - Cloud deployment (AWS, Azure, GCP)

---

**Last Updated:** 2024-01-15
**Version:** 1.0.0
