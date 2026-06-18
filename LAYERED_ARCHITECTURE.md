# Lead Management System - Layered Architecture Documentation

## 📋 Overview

This document describes the complete layered architecture implementation of the Lead Management System built with Node.js, Express.js, MongoDB, and Mongoose.

## 🏗️ Architecture Layers

### 1. **Presentation Layer** (HTTP Interface)
- **Location:** `src/routes/`
- **Responsibility:** Handle HTTP requests and responses
- **Components:**
  - `index.js` - Main API router
  - `leadRoutes.js` - Lead-specific routes
- **Features:**
  - Request routing
  - Path definition
  - HTTP method mapping
  - Route middleware integration

### 2. **Controller Layer** (Request Handlers)
- **Location:** `src/controllers/`
- **Responsibility:** Process HTTP requests and delegate to services
- **Components:**
  - `LeadController.js` - Lead request handlers
- **Features:**
  - Request validation
  - Response formatting
  - Error handling
  - Parameter extraction
  - Method naming: `[action][Resource]`

### 3. **Service Layer** (Business Logic)
- **Location:** `src/services/`
- **Responsibility:** Implement core business logic
- **Components:**
  - `LeadService.js` - Lead business operations
- **Features:**
  - Core business logic
  - Data transformation
  - Business rule enforcement
  - Cross-repository coordination
  - Stateless operations

### 4. **Repository Layer** (Data Access)
- **Location:** `src/repositories/`
- **Responsibility:** Abstract database operations
- **Components:**
  - `BaseRepository.js` - Generic CRUD operations
  - `LeadRepository.js` - Lead-specific queries
- **Features:**
  - Database abstraction
  - Query building
  - Data aggregation
  - Pagination logic
  - Soft delete handling

### 5. **Database Layer** (Data Models)
- **Location:** `src/models/`
- **Responsibility:** Define data schemas and relationships
- **Components:**
  - `Lead.js` - Lead schema with validation
- **Features:**
  - Schema definition
  - Field validation
  - Indexes for performance
  - Virtual properties
  - Instance methods
  - Static methods
  - Mongoose middleware (hooks)

## 📁 Folder Structure

```
lead-management-module/
├── src/
│   ├── config/
│   │   ├── database.js           # MongoDB connection setup
│   │   └── environment.js        # Environment configuration
│   │
│   ├── middleware/
│   │   ├── authMiddleware.js     # JWT authentication & authorization
│   │   └── errorHandler.js       # Global error handling
│   │
│   ├── routes/
│   │   ├── index.js              # Main API router
│   │   └── leadRoutes.js         # Lead-specific routes
│   │
│   ├── controllers/
│   │   └── LeadController.js     # Lead request handlers
│   │
│   ├── services/
│   │   └── LeadService.js        # Lead business logic
│   │
│   ├── repositories/
│   │   ├── BaseRepository.js     # Base CRUD repository
│   │   └── LeadRepository.js     # Lead-specific queries
│   │
│   ├── models/
│   │   └── Lead.js               # Lead Mongoose schema
│   │
│   ├── validators/
│   │   └── (schema validators)
│   │
│   ├── constants/
│   │   └── index.js              # Application constants & enums
│   │
│   └── utils/
│       ├── logger.js             # Logging utility
│       ├── responseHandler.js    # Standard response formatter
│       └── validationHelper.js   # Validation helper functions
│
├── server.js                     # Main entry point
├── package.json
├── .env
└── .env.example
```

## 🔄 Request Flow Diagram

```
HTTP Request
    ↓
    ├─→ [Middleware] CORS, Body Parser, Auth
    ↓
    ├─→ [Routing] Route matching (src/routes/leadRoutes.js)
    ↓
    ├─→ [Controller] Request handler (src/controllers/LeadController.js)
    │     - Validate input
    │     - Parse parameters
    │     - Call service
    ↓
    ├─→ [Service] Business logic (src/services/LeadService.js)
    │     - Apply business rules
    │     - Coordinate repositories
    │     - Handle exceptions
    ↓
    ├─→ [Repository] Data access (src/repositories/LeadRepository.js)
    │     - Query building
    │     - Database operations
    │     - Result formatting
    ↓
    ├─→ [Model] Schema & validation (src/models/Lead.js)
    │     - MongoDB interaction
    │     - Schema validation
    │     - Data transformation
    ↓
    ├─→ [Database] MongoDB
    ↓
    ├─→ Response formatting
    ↓
HTTP Response (JSON)
```

## 📊 Data Flow Example: Create Lead

```
1. POST /api/v1/leads
   Body: { firstName, lastName, email, phone, source }
   
2. [Route Handler] - leadRoutes.js
   - Routes to LeadController.createLead()
   
3. [Controller] - LeadController.js
   - Validates required fields
   - Validates data format
   - Calls leadService.createLead()
   
4. [Service] - LeadService.js
   - Applies business rules
   - Calls leadRepository.create()
   
5. [Repository] - LeadRepository.js
   - Calls model.create() with data
   
6. [Model] - Lead.js
   - Validates schema
   - Runs pre-save middleware
   - Saves to MongoDB
   
7. Response
   - Formats using sendCreated()
   - Returns 201 with lead data
```

## 🔐 Security Features

### 1. Authentication Middleware
- JWT token verification
- Bearer token extraction
- Token expiration handling

### 2. Authorization Middleware
- Role-based access control (RBAC)
- Route protection by role
- Endpoint-level permissions

### 3. Input Validation
- Required field validation
- Email format validation
- Phone format validation
- Object ID validation
- Enum validation
- Budget range validation

### 4. Error Handling
- Centralized error handler middleware
- Mongoose validation errors
- Cast errors (invalid ObjectID)
- Duplicate key errors (unique fields)
- JWT errors
- Custom application errors

### 5. Environment Security
- Secure defaults in `.env.example`
- Production validation (JWT_SECRET check)
- Sensitive data in env variables
- Conditional error details (dev vs prod)

## 📝 Configuration Management

### Environment Variables (`src/config/environment.js`)
```javascript
- NODE_ENV: development/production
- PORT: Server port
- MONGODB_URI: Database connection string
- JWT_SECRET: Token signing secret
- CORS_ORIGIN: Allowed origins
- LOG_LEVEL: Logging level
- And more...
```

### Database Configuration (`src/config/database.js`)
- Connection string setup
- Retry logic (5 attempts)
- Connection pooling
- Event handlers
- Status checking

## 🧪 Testing the API

### 1. Create Lead
```bash
POST /api/v1/leads
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "+1-800-123-4567",
  "source": "WEBSITE",
  "priority": "HIGH",
  "propertyType": "Residential",
  "budgetMin": 100000,
  "budgetMax": 500000
}
```

### 2. Get All Leads
```bash
GET /api/v1/leads?page=1&limit=10
```

### 3. Search Leads
```bash
GET /api/v1/leads/search?q=John&page=1&limit=10
```

### 4. Filter Leads
```bash
POST /api/v1/leads/filter
Content-Type: application/json

{
  "filters": {
    "status": "NEW_LEAD",
    "priority": "HIGH",
    "source": "WEBSITE"
  },
  "page": 1,
  "limit": 10
}
```

### 5. Get Lead Statistics
```bash
GET /api/v1/leads/statistics/summary
```

## 🚀 Running the Application

### Installation
```bash
npm install
```

### Development
```bash
npm run dev        # Runs with nodemon
```

### Production
```bash
npm start         # Runs with node
```

### Initialize Database
```bash
npm run init-db   # Populates sample data
```

## 📈 Performance Optimization

### 1. Database Indexes
```javascript
// In Lead.js schema
leadSchema.index({ email: 1, phone: 1 });
leadSchema.index({ status: 1, assignedTo: 1 });
leadSchema.index({ source: 1, priority: 1 });
leadSchema.index({ 'location.city': 1 });
leadSchema.index({...}, 'text'); // Text search
```

### 2. Pagination
- Default limit: 10
- Max limit: 100
- Prevents loading too many documents

### 3. Query Optimization
- Selective field population
- Lean queries where applicable
- Aggregation pipelines for complex queries

### 4. Caching Ready
- Constants module for cacheable data
- Response formatting for cache headers

## 🔄 Extending the System

### Adding a New Resource (e.g., Activities)

1. **Create Model** (`src/models/Activity.js`)
   ```javascript
   const activitySchema = new mongoose.Schema({...});
   module.exports = mongoose.model('Activity', activitySchema);
   ```

2. **Create Repository** (`src/repositories/ActivityRepository.js`)
   ```javascript
   class ActivityRepository extends BaseRepository {
     constructor() {
       super(Activity);
     }
     // Custom query methods
   }
   ```

3. **Create Service** (`src/services/ActivityService.js`)
   ```javascript
   class ActivityService {
     // Business logic methods
   }
   ```

4. **Create Controller** (`src/controllers/ActivityController.js`)
   ```javascript
   class ActivityController {
     // Request handler methods
   }
   ```

5. **Create Routes** (`src/routes/activityRoutes.js`)
   ```javascript
   router.get('/', activityController.getAll);
   router.post('/', activityController.create);
   // ... more routes
   ```

6. **Register Routes** (Update `src/routes/index.js`)
   ```javascript
   router.use('/activities', activityRoutes);
   ```

## 📚 Best Practices Implemented

### 1. **Separation of Concerns**
- Each layer has single responsibility
- Clear boundaries between layers
- Easy to test each layer independently

### 2. **DRY (Don't Repeat Yourself)**
- Base repository for common CRUD
- Reusable middleware
- Shared utility functions

### 3. **Error Handling**
- Centralized error handler
- Consistent error response format
- Detailed error information in development

### 4. **Code Organization**
- Logical folder structure
- Consistent naming conventions
- Clear file purposes

### 5. **Configuration Management**
- Centralized environment config
- Secure defaults
- Production validation

### 6. **Logging**
- Structured logging utility
- Color-coded log levels
- Timestamp tracking

### 7. **Validation**
- Input validation in controller
- Schema validation in model
- Response validation ready

### 8. **Documentation**
- Inline code comments
- Architecture documentation
- API endpoint documentation

## 🎯 Next Steps

1. **Implement Authentication Routes**
   - Login endpoint
   - Refresh token endpoint
   - User creation endpoint

2. **Add More Models**
   - LeadActivity model
   - LeadAssignment model
   - LeadFollowUp model

3. **Implement Additional Services**
   - LeadActivityService
   - AnalyticsService
   - ReportService

4. **Add Testing**
   - Unit tests for services
   - Integration tests for APIs
   - E2E tests

5. **Deploy**
   - Docker containerization
   - CI/CD pipeline
   - Cloud deployment

## 📞 Support & Contact

For issues or questions, refer to:
- API Documentation: `/docs/API_DOCUMENTATION.md`
- Architecture Guide: `/docs/ARCHITECTURE.md`
- Quick Reference: `/docs/QUICK_REFERENCE.md`
