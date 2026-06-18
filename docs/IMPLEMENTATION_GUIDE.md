# Lead Management Module - Implementation Guide

## Project Setup

### Prerequisites
- Node.js v14+ 
- MongoDB 4.4+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install express mongoose dotenv cors morgan validation-library

# Dev dependencies
npm install --save-dev nodemon jest supertest

# Or with specific versions
npm install express@4.18.2 mongoose@7.0.0 dotenv@16.0.3 cors@2.8.5
```

### Project Structure

```
lead-management-module/
├── models/
│   ├── Lead.js
│   ├── LeadStatus.js
│   ├── LeadSource.js
│   ├── Employee.js
│   ├── Company.js
│   ├── LeadActivity.js
│   ├── LeadAssignment.js
│   └── LeadFollowUp.js
│
├── services/
│   ├── LeadService.js
│   ├── AuthService.js
│   └── EmailService.js
│
├── controllers/
│   ├── leadController.js
│   ├── activityController.js
│   └── analyticsController.js
│
├── middlewares/
│   ├── auth.js
│   ├── errorHandler.js
│   └── validation.js
│
├── routes/
│   ├── leadRoutes.js
│   ├── activityRoutes.js
│   └── analyticsRoutes.js
│
├── sample-data/
│   ├── sampleData.js
│   └── initDatabase.js
│
├── docs/
│   ├── ARCHITECTURE.md
│   ├── API_DOCUMENTATION.md
│   ├── QUERY_EXAMPLES.md
│   └── IMPLEMENTATION_GUIDE.md
│
├── .env
├── .env.example
├── server.js
├── package.json
└── README.md
```

---

## Environment Configuration

### .env File

```env
# Server
NODE_ENV=development
PORT=3000
API_PREFIX=/api/v1

# MongoDB
MONGODB_URI=mongodb://localhost:27017/lead-crm
MONGODB_USER=admin
MONGODB_PASSWORD=password

# JWT
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
EMAIL_FROM=noreply@leadcrm.com

# Logging
LOG_LEVEL=info
LOG_FILE=logs/app.log

# Pagination
DEFAULT_PAGE_SIZE=10
MAX_PAGE_SIZE=100
```

---

## Server Setup

### server.js

```javascript
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database Connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB connected'))
.catch(err => console.error('❌ MongoDB error:', err));

// Routes
app.use('/api/v1/leads', require('./routes/leadRoutes'));
app.use('/api/v1/activities', require('./routes/activityRoutes'));
app.use('/api/v1/analytics', require('./routes/analyticsRoutes'));

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  res.status(status).json({ success: false, message, errors: err.errors });
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 API: http://localhost:${PORT}/api/v1`);
});
```

---

## Database Connection

### config/database.js

```javascript
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    
    // Create indexes
    await createIndexes();
    
    return conn;
  } catch (error) {
    console.error(`❌ MongoDB Error: ${error.message}`);
    process.exit(1);
  }
};

const createIndexes = async () => {
  const Lead = require('../models/Lead');
  await Lead.collection.createIndex({ email: 1 }, { unique: true });
  await Lead.collection.createIndex({ phone: 1 }, { unique: true });
  await Lead.collection.createIndex({ status: 1, isDeleted: 1 });
  await Lead.collection.createIndex({
    firstName: 'text',
    lastName: 'text',
    email: 'text',
    phone: 'text'
  });
  console.log('✅ Indexes created/verified');
};

module.exports = connectDB;
```

---

## Authentication Middleware

### middlewares/auth.js

```javascript
const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Insufficient permissions' 
      });
    }
    next();
  };
};

module.exports = { authenticate, authorize };
```

---

## Validation Middleware

### middlewares/validation.js

```javascript
const validateLead = (req, res, next) => {
  const { firstName, lastName, email, phone, status, source } = req.body;

  const errors = [];

  if (!firstName || firstName.trim().length < 2) {
    errors.push('First name is required and must be at least 2 characters');
  }

  if (!lastName || lastName.trim().length < 2) {
    errors.push('Last name is required and must be at least 2 characters');
  }

  if (!email || !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
    errors.push('Valid email is required');
  }

  if (!phone || !/^[\d\s\-\+\(\)]{10,}$/.test(phone)) {
    errors.push('Valid phone number is required');
  }

  if (!status) {
    errors.push('Lead status is required');
  }

  if (!source) {
    errors.push('Lead source is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({ 
      success: false, 
      message: 'Validation failed', 
      errors 
    });
  }

  next();
};

module.exports = { validateLead };
```

---

## Sample Controller

### controllers/leadController.js

```javascript
const LeadService = require('../services/LeadService');

exports.createLead = async (req, res) => {
  try {
    const lead = await LeadService.createLead(req.body, req.user._id);
    res.status(201).json({ success: true, data: lead });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getLead = async (req, res) => {
  try {
    const lead = await LeadService.getLeadById(req.params.leadId);
    res.json({ success: true, data: lead });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
};

exports.updateLead = async (req, res) => {
  try {
    const lead = await LeadService.updateLead(req.params.leadId, req.body);
    res.json({ success: true, data: lead });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteLead = async (req, res) => {
  try {
    await LeadService.deleteLead(req.params.leadId);
    res.json({ success: true, message: 'Lead deleted successfully' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.searchLeads = async (req, res) => {
  try {
    const result = await LeadService.searchLeads(
      req.query.q,
      { page: req.query.page, limit: req.query.limit }
    );
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.filterLeads = async (req, res) => {
  try {
    const filters = {
      status: req.query.status,
      assignedTo: req.query.assignedTo,
      source: req.query.source,
      priority: req.query.priority
    };
    
    const result = await LeadService.filterLeads(
      filters,
      { page: req.query.page, limit: req.query.limit }
    );
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.assignLead = async (req, res) => {
  try {
    const assignment = await LeadService.assignLead(
      req.params.leadId,
      req.body.assignedTo,
      req.user._id,
      req.body.reassignmentReason
    );
    res.json({ success: true, data: assignment });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
```

---

## Running Database Initialization

```bash
# Node.js
node sample-data/initDatabase.js

# With npm script
npm run init-db
```

### package.json Scripts

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "init-db": "node sample-data/initDatabase.js",
    "test": "jest --coverage",
    "lint": "eslint ."
  }
}
```

---

## Best Practices Implemented

✅ **Validation**: Input validation at middleware level
✅ **Error Handling**: Comprehensive error handling with meaningful messages
✅ **Security**: JWT authentication, role-based authorization
✅ **Performance**: Indexing, pagination, query optimization
✅ **Scalability**: Service layer for business logic
✅ **Maintainability**: Clear separation of concerns
✅ **Logging**: Request/response logging with Morgan
✅ **Documentation**: Comprehensive API documentation
✅ **Testing**: Ready for unit and integration tests
✅ **Database**: Proper relationships and referential integrity

---

## Deployment Checklist

- [ ] Set up MongoDB Atlas cluster
- [ ] Configure environment variables in production
- [ ] Enable MongoDB authentication
- [ ] Create database backups
- [ ] Set up API rate limiting
- [ ] Enable CORS with allowed origins
- [ ] Configure HTTPS/SSL
- [ ] Set up monitoring and logging
- [ ] Create backup and recovery plan
- [ ] Document deployment procedure

---

## Monitoring & Logging

### Using Winston Logger

```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/app.log' })
  ]
});

module.exports = logger;
```

---

## Testing

### Sample Jest Test

```javascript
const request = require('supertest');
const app = require('../server');
const Lead = require('../models/Lead');

describe('Lead API', () => {
  it('should create a new lead', async () => {
    const response = await request(app)
      .post('/api/v1/leads')
      .send({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '+91-9876543210',
        status: '...',
        source: '...'
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
  });
});
```

---
