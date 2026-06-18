# Folder Structure Guide

## Complete Project Structure

```
lead-management-module/
│
├── 📂 src/                           # Source code (layered architecture)
│   │
│   ├── 📂 config/                    # Configuration Layer
│   │   ├── database.js               # MongoDB connection & setup
│   │   └── environment.js            # Environment variables & config
│   │
│   ├── 📂 middleware/                # Middleware Layer
│   │   ├── authMiddleware.js         # JWT authentication & authorization
│   │   ├── errorHandler.js           # Global error handling & async wrapper
│   │   └── (validationMiddleware)    # Input validation (optional)
│   │
│   ├── 📂 routes/                    # Presentation/Route Layer
│   │   ├── index.js                  # Main API router (combines all routes)
│   │   ├── leadRoutes.js             # Lead module routes
│   │   ├── (activityRoutes.js)       # Activity module routes (future)
│   │   └── (analyticsRoutes.js)      # Analytics routes (future)
│   │
│   ├── 📂 controllers/               # Controller Layer
│   │   ├── LeadController.js         # Lead request handlers
│   │   ├── (ActivityController.js)   # Activity handlers (future)
│   │   └── (AnalyticsController.js)  # Analytics handlers (future)
│   │
│   ├── 📂 services/                  # Service/Business Logic Layer
│   │   ├── LeadService.js            # Lead business operations
│   │   ├── (ActivityService.js)      # Activity services (future)
│   │   └── (AnalyticsService.js)     # Analytics services (future)
│   │
│   ├── 📂 repositories/              # Repository/Data Access Layer
│   │   ├── BaseRepository.js         # Base CRUD operations
│   │   ├── LeadRepository.js         # Lead-specific database queries
│   │   ├── (ActivityRepository.js)   # Activity queries (future)
│   │   └── (AnalyticsRepository.js)  # Analytics queries (future)
│   │
│   ├── 📂 models/                    # Database Layer
│   │   ├── Lead.js                   # Lead schema with validation
│   │   ├── (LeadStatus.js)           # Lead status master data (future)
│   │   ├── (LeadSource.js)           # Lead source master data (future)
│   │   ├── (Employee.js)             # Employee schema (future)
│   │   ├── (LeadActivity.js)         # Activity schema (future)
│   │   ├── (LeadAssignment.js)       # Assignment schema (future)
│   │   └── (LeadFollowUp.js)         # Follow-up schema (future)
│   │
│   ├── 📂 validators/                # Validation Schemas (Optional)
│   │   ├── leadValidator.js          # Lead Joi schemas
│   │   └── (activityValidator.js)    # Activity Joi schemas (future)
│   │
│   ├── 📂 constants/                 # Application Constants
│   │   └── index.js                  # HTTP status, enums, error codes
│   │
│   └── 📂 utils/                     # Utility Functions
│       ├── logger.js                 # Logging utility
│       ├── responseHandler.js        # Standard response formatting
│       ├── validationHelper.js       # Validation helpers
│       ├── (errorHandler.js)         # Error utilities
│       └── (dateHelper.js)           # Date utilities (future)
│
├── 📂 sample-data/                   # Database Initialization
│   ├── initDatabase.js               # Database seeding script
│   └── sampleData.js                 # Sample data definitions
│
├── 📂 docs/                          # Documentation (Existing)
│   ├── ARCHITECTURE.md               # System architecture
│   ├── API_DOCUMENTATION.md          # API endpoints
│   ├── QUERY_EXAMPLES.md             # MongoDB query examples
│   ├── IMPLEMENTATION_GUIDE.md       # Implementation details
│   ├── QUICK_REFERENCE.md            # Quick reference guide
│   ├── ER_DIAGRAM.md                 # Entity-relationship diagram
│   └── INDEX.md                      # Documentation index
│
├── 📂 models/                        # (Legacy - will be moved to src/models)
│   ├── Lead.js
│   ├── LeadStatus.js
│   ├── LeadSource.js
│   ├── Employee.js
│   ├── LeadActivity.js
│   ├── LeadAssignment.js
│   └── LeadFollowUp.js
│
├── 📂 services/                      # (Legacy - will be moved to src/services)
│   └── LeadService.js
│
├── 📂 schemas/                       # (Legacy - can be removed)
│   └── ...
│
├── 📂 node_modules/                  # Dependencies (auto-generated)
│   └── ...
│
├── 📂 .git/                          # Git repository (if initialized)
│   └── ...
│
├── 📋 server.js                      # Main entry point (updated)
├── 📋 package.json                   # Project metadata & dependencies
├── 📋 package-lock.json              # Dependency lock file
├── 📋 .env                           # Environment variables (development)
├── 📋 .env.example                   # Environment template
├── 📋 .gitignore                     # Git ignore rules
├── 📋 README.md                      # Project overview
├── 📋 ARCHITECTURE.md                # High-level architecture
├── 📋 DELIVERY_SUMMARY.md            # Project delivery summary
└── 📋 LAYERED_ARCHITECTURE.md        # Detailed layered architecture (NEW)
```

## Layer Descriptions

### 1️⃣ Configuration Layer (`src/config/`)
**Purpose:** Centralize all configuration and setup

**Files:**
- `database.js` - MongoDB connection with retry logic
- `environment.js` - All environment variables with defaults

**Responsibilities:**
- Database connections
- Environment setup
- Configuration validation
- Default values

**Example Usage:**
```javascript
const config = require('./src/config/environment');
const { connectDB } = require('./src/config/database');
```

---

### 2️⃣ Middleware Layer (`src/middleware/`)
**Purpose:** Cross-cutting concerns and request processing

**Files:**
- `authMiddleware.js` - JWT auth, token generation, role-based access
- `errorHandler.js` - Global error handling, async wrapper

**Responsibilities:**
- Authentication & authorization
- Error handling
- Async error wrapping
- Request validation
- Logging

**Example Usage:**
```javascript
app.use(authenticate); // Protect routes
app.use(errorHandler); // Global error handler
```

---

### 3️⃣ Route Layer (`src/routes/`)
**Purpose:** Define API endpoints and route HTTP requests

**Files:**
- `index.js` - Main router combining all modules
- `leadRoutes.js` - All lead-related routes

**Responsibilities:**
- URL path definition
- HTTP method routing
- Parameter extraction
- Route grouping
- Middleware chain assembly

**Example Routes:**
```javascript
GET    /api/v1/leads
POST   /api/v1/leads
GET    /api/v1/leads/:id
PUT    /api/v1/leads/:id
DELETE /api/v1/leads/:id
GET    /api/v1/leads/search?q=...
POST   /api/v1/leads/filter
```

---

### 4️⃣ Controller Layer (`src/controllers/`)
**Purpose:** Handle HTTP requests and delegate to services

**Files:**
- `LeadController.js` - Lead request handlers

**Responsibilities:**
- Request validation
- Parameter extraction
- Input sanitization
- Calling services
- Response formatting
- Error catching

**Pattern:**
```
Request → Validate → Extract → Call Service → Format Response
```

**Example:**
```javascript
async createLead(req, res) {
  // 1. Validate input
  // 2. Call service
  // 3. Format response
  return sendCreated(res, lead);
}
```

---

### 5️⃣ Service Layer (`src/services/`)
**Purpose:** Implement core business logic

**Files:**
- `LeadService.js` - Lead business operations

**Responsibilities:**
- Business rule enforcement
- Complex data processing
- Cross-repository coordination
- Transaction management
- Error handling
- Logging

**Example Operations:**
```javascript
- createLead()
- assignLead()
- convertLead()
- searchLeads()
- getLeadStatistics()
```

---

### 6️⃣ Repository Layer (`src/repositories/`)
**Purpose:** Provide data access abstraction

**Files:**
- `BaseRepository.js` - Generic CRUD + pagination
- `LeadRepository.js` - Lead-specific queries

**Responsibilities:**
- Database queries
- Query building
- Pagination logic
- Aggregation pipelines
- Soft delete handling
- Data retrieval

**Key Methods:**
```javascript
- findAll(), findById(), findOne()
- create(), update(), delete()
- count(), exists()
- paginate(), aggregate()
- Soft delete operations
```

---

### 7️⃣ Model Layer (`src/models/`)
**Purpose:** Define database schemas and validation

**Files:**
- `Lead.js` - Lead schema

**Responsibilities:**
- Schema definition
- Field validation
- Relationships
- Indexes
- Virtual properties
- Instance methods
- Static methods
- Middleware hooks

**Features:**
```javascript
- Validators
- Indexes (performance)
- Relationships (ref)
- Virtual properties
- Pre/post hooks
```

---

### 8️⃣ Constants Layer (`src/constants/`)
**Purpose:** Centralize all application constants

**Files:**
- `index.js` - Enums, status codes, error codes

**Contains:**
```javascript
- HTTP status codes
- Lead statuses
- Lead stages
- Lead sources
- Priority levels
- Employee roles
- Activity types
- Error codes
- Pagination defaults
```

**Benefits:**
- Single source of truth
- Type safety
- Easy to maintain
- Prevents magic strings

---

### 9️⃣ Utils Layer (`src/utils/`)
**Purpose:** Reusable utility functions

**Files:**
- `logger.js` - Colored logging
- `responseHandler.js` - Standardized responses
- `validationHelper.js` - Validation functions

**Responsibilities:**
- Logging
- Response formatting
- Input validation
- Error utilities
- Helper functions

---

## Data Flow Example

```
HTTP Request
    ↓ 
[Route] leadRoutes.js
    ├─→ Matches GET /api/v1/leads/:id
    ↓
[Controller] LeadController.getLeadById()
    ├─→ Validates ID format
    ├─→ Calls LeadService.getLeadById()
    ↓
[Service] LeadService.getLeadById()
    ├─→ Applies business logic
    ├─→ Calls LeadRepository.findByIdWithReferences()
    ↓
[Repository] LeadRepository.findByIdWithReferences()
    ├─→ Builds query with populate
    ├─→ Calls Lead.findById()
    ↓
[Model] Lead.js
    ├─→ Validates schema
    ├─→ Executes MongoDB query
    ↓
[Database] MongoDB
    ├─→ Returns document
    ↓
[Controller] Formats response
    ├─→ Calls sendSuccess()
    ↓
HTTP Response (JSON)
```

## Migration Guide

### Moving from Legacy to Layered

**Legacy Structure:**
```
models/
services/
schemas/
server.js
```

**New Structure:**
```
src/
├── config/
├── middleware/
├── routes/
├── controllers/
├── services/
├── repositories/
├── models/
├── constants/
└── utils/
```

**Migration Steps:**
1. Keep legacy files during transition
2. Create new layered structure in `src/`
3. Gradually move functionality
4. Update import paths
5. Test thoroughly
6. Remove legacy files when complete

## File Naming Conventions

| Layer | Pattern | Example |
|-------|---------|---------|
| Controller | `[Resource]Controller.js` | `LeadController.js` |
| Service | `[Resource]Service.js` | `LeadService.js` |
| Repository | `[Resource]Repository.js` | `LeadRepository.js` |
| Model | `[Resource].js` | `Lead.js` |
| Route | `[resource]Routes.js` | `leadRoutes.js` |
| Middleware | `[purpose]Middleware.js` | `authMiddleware.js` |
| Validator | `[resource]Validator.js` | `leadValidator.js` |

## Scaling the Architecture

### Adding New Resource

1. **Create Model** in `src/models/Activity.js`
2. **Create Repository** in `src/repositories/ActivityRepository.js`
3. **Create Service** in `src/services/ActivityService.js`
4. **Create Controller** in `src/controllers/ActivityController.js`
5. **Create Routes** in `src/routes/activityRoutes.js`
6. **Register Routes** in `src/routes/index.js`

### Adding New Middleware

1. Create in `src/middleware/[purpose]Middleware.js`
2. Import in `server.js`
3. Use with `app.use(middleware)`

### Adding New Utility

1. Create in `src/utils/[utility].js`
2. Export functions
3. Import where needed

## Benefits of This Structure

✅ **Separation of Concerns** - Each layer has clear responsibility
✅ **Easy Testing** - Each layer testable independently
✅ **Maintainability** - Clear code organization
✅ **Scalability** - Easy to add new features
✅ **Reusability** - Shared utilities and base classes
✅ **Security** - Centralized error handling and auth
✅ **Performance** - Repository pattern enables caching
✅ **Documentation** - Clear layer purposes
