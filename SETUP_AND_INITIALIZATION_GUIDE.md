# Lead Management System - Setup & Initialization Guide

## 📋 Pre-Setup Checklist

Before you start, ensure you have:

- [ ] Node.js v14+ installed (`node --version`)
- [ ] npm v6+ installed (`npm --version`)
- [ ] MongoDB v4.4+ running locally or cloud (MongoDB Atlas)
- [ ] Code editor (VS Code recommended)
- [ ] Git (for version control)
- [ ] cURL or Postman (for API testing)

---

## 🚀 Complete Setup Instructions

### Step 1: Navigate to Project Directory

```bash
cd "c:\Users\Santhith\OneDrive\Desktop\IP-2 VSC\lead-management-module"
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install all required packages from `package.json`:
- **express** - Web framework
- **mongoose** - MongoDB ORM
- **cors** - Cross-origin resource sharing
- **dotenv** - Environment variable management
- **morgan** - HTTP request logger
- **nodemon** - Auto-reload on file changes (dev)

### Step 3: Create Environment File

Create `.env` file in project root:

```bash
# Windows PowerShell
Copy-Item .env.example .env

# Or manually create .env with contents:
```

**.env Contents:**
```env
# Server Configuration
NODE_ENV=development
PORT=3000
APP_NAME=Lead Management System
VERSION=1.0.0

# Database Configuration
DATABASE_URL=mongodb://localhost:27017/lead-management
MONGODB_USER=
MONGODB_PASSWORD=

# MongoDB Atlas (if using cloud)
# DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/lead-management

# Logging
LOG_LEVEL=debug

# CORS
CORS_ORIGIN=http://localhost:3000,http://localhost:3001

# Optional: API Keys
JWT_SECRET=your-secret-key-here
```

### Step 4: Verify Environment Variables

```bash
# Test that .env is readable
Get-Content .env | Select-String "DATABASE_URL"
# Should output: DATABASE_URL=mongodb://localhost:27017/lead-management
```

### Step 5: Test Database Connection

```bash
# Option 1: Using MongoDB CLI (if installed)
mongosh --eval "db.version()"

# Option 2: Start MongoDB service (Windows)
net start MongoDB

# Option 3: Check if running on localhost:27017
Test-NetConnection localhost -Port 27017
```

If MongoDB is not running:
- **Local:** Start MongoDB manually
- **Cloud:** Use MongoDB Atlas connection string in .env

### Step 6: Verify Project Structure

```bash
# Check critical files exist
$criticalFiles = @(
    "server.js",
    "src/controllers/LeadController.js",
    "src/routes/leadRoutes.js",
    "src/services/LeadService_Complete.js",
    "src/models/Lead.js",
    ".env",
    "package.json"
)

foreach ($file in $criticalFiles) {
    if (Test-Path $file) {
        Write-Host "✅ $file" -ForegroundColor Green
    } else {
        Write-Host "❌ $file - MISSING!" -ForegroundColor Red
    }
}
```

### Step 7: Initialize Database (First Run)

```bash
# Create initial database indexes and collections
npm run init-db

# Or manually:
node scripts/initializeDB.js
```

**Expected Output:**
```
✅ Database connected
✅ Leads collection created with indexes
✅ Employees collection created
✅ Activity logs collection created
✅ Initialization complete
```

### Step 8: Start Development Server

```bash
npm run dev
```

**Expected Output:**
```
════════════════════════════════════════════════════════════════
🚀 LEAD MANAGEMENT SYSTEM
════════════════════════════════════════════════════════════════
Application Name: Lead Management System
Version: 1.0.0
Environment: development
Started at: 1/16/2024, 10:30:00 AM
Server running on: http://localhost:3000
API Endpoint: http://localhost:3000/api/v1
Health Check: http://localhost:3000/health
════════════════════════════════════════════════════════════════
📡 API Routes:
  • GET  /api/v1/              - API Documentation
  • GET  /api/v1/health        - Health Check
  • GET  /api/v1/status        - Status Check
  • POST /api/v1/leads         - Create Lead
  • GET  /api/v1/leads         - Get All Leads
  ...
```

---

## ✅ Verification Steps

### 1. Health Check (Server Running)

```bash
# Test server is responding
curl http://localhost:3000/health
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "status": "OK",
  "database": "Connected",
  "timestamp": "2024-01-16T10:30:00Z",
  "environment": "development"
}
```

### 2. API Status Check

```bash
curl http://localhost:3000/api/v1/status
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Lead Management API is running",
  "version": "1.0.0",
  "environment": "development",
  "timestamp": "2024-01-16T10:30:00Z"
}
```

### 3. Create Test Lead

```bash
curl -X POST http://localhost:3000/api/v1/leads \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com",
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
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com",
    "status": "NEW_LEAD",
    "createdAt": "2024-01-16T10:30:00Z"
  },
  "statusCode": 201
}
```

### 4. Retrieve Test Lead

```bash
# Replace with actual lead ID from previous response
curl http://localhost:3000/api/v1/leads/63d7e8f9c1234567890abcd0
```

---

## 🔧 Troubleshooting

### Issue: Port Already In Use

```bash
# Error: listen EADDRINUSE :::3000
```

**Solution:**

```bash
# Option 1: Kill process on port 3000
netstat -ano | findstr :3000
taskkill /PID {PID} /F

# Option 2: Use different port
# In .env: PORT=3001
# Then: npm run dev

# Option 3: Find what's using port
Get-Process | Where-Object {$_.Handles -match "3000"}
```

---

### Issue: MongoDB Connection Failed

```bash
# Error: MongoNetworkError: connect ECONNREFUSED 127.0.0.1:27017
```

**Solution:**

```bash
# Option 1: Start MongoDB locally
net start MongoDB

# Option 2: Use MongoDB Atlas
# In .env: DATABASE_URL=mongodb+srv://user:pass@cluster.mongodb.net/db

# Option 3: Check if MongoDB is running
Get-Service MongoDB

# Option 4: Verify connection string
# Test manually:
mongosh "mongodb://localhost:27017"
```

---

### Issue: npm install Fails

```bash
# Error: npm ERR! Cannot find module
```

**Solution:**

```bash
# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -r node_modules package-lock.json
npm install

# If still failing, check Node version
node --version  # Should be v14+
npm --version   # Should be v6+
```

---

### Issue: Server Starts but API Returns 404

```bash
# GET /api/v1/leads returns 404 Not Found
```

**Solution:**

```bash
# Check 1: Verify routes are loaded
Get-Content src/routes/leadRoutes.js | Select-String "router\."

# Check 2: Verify controller exists
Test-Path src/controllers/LeadController.js

# Check 3: Test simpler endpoint
curl http://localhost:3000/api/v1/status

# Check 4: Restart server
# Ctrl+C to stop
# npm run dev to restart
```

---

### Issue: Validation Errors on Create

```bash
# Error: {success: false, error: {code: "VALIDATION_ERROR"}}
```

**Solution:**

```bash
# Check that all required fields are included:
# - firstName (required)
# - lastName (required)
# - email (required, valid format)
# - phone (required, valid format)
# - source (required, must be valid enum)

# Valid source values:
# WEBSITE, FACEBOOK, EMAIL, REFERRAL, PHONE

# Test with complete data:
curl -X POST http://localhost:3000/api/v1/leads \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "jane@example.com",
    "phone": "+9876543210",
    "source": "WEBSITE"
  }'
```

---

### Issue: Duplicate Entry Error

```bash
# Error: {success: false, error: {code: "DUPLICATE_ENTRY"}}
# Message: "Lead with email jane@example.com already exists"
```

**Solution:**

```bash
# This is expected behavior - the system prevents duplicate leads

# To test with different emails, use variations:
# test1@example.com, test2@example.com, etc.

# Or retrieve existing leads to see what's in database:
curl "http://localhost:3000/api/v1/leads?limit=100"
```

---

### Issue: Database Indexes Not Created

```bash
# Performance is slow or duplicate check not working
```

**Solution:**

```bash
# Create indexes manually:
mongo
# Inside mongo shell:
use lead-management
db.leads.createIndex({ email: 1, isDeleted: 1 }, { unique: true })
db.leads.createIndex({ phone: 1, isDeleted: 1 }, { unique: true })
db.leads.createIndex({ status: 1 })
db.leads.createIndex({ source: 1 })
db.leads.createIndex({ createdAt: -1 })
exit

# Or run init script:
npm run init-db
```

---

## 📊 Project Structure

```
lead-management-module/
├── server.js                    # Main entry point
├── package.json                 # Dependencies
├── .env                         # Environment variables
├── .gitignore                   # Git ignore rules
│
├── src/
│   ├── config/                  # Configuration
│   │   ├── environment.js       # Env config
│   │   └── database.js          # DB connection
│   │
│   ├── models/                  # Mongoose schemas
│   │   ├── Lead.js
│   │   ├── Employee.js
│   │   └── ActivityLog.js
│   │
│   ├── repositories/            # Data access layer
│   │   ├── BaseRepository.js
│   │   ├── LeadRepository.js
│   │   ├── EmployeeRepository.js
│   │   └── ActivityRepository.js
│   │
│   ├── services/                # Business logic
│   │   ├── LeadService_Complete.js
│   │   ├── LeadValidationService.js
│   │   ├── DuplicateCheckService.js
│   │   └── AutoAssignmentService.js
│   │
│   ├── controllers/             # Route handlers
│   │   ├── LeadController.js
│   │   └── EmployeeController.js
│   │
│   ├── routes/                  # Route definitions
│   │   ├── index.js
│   │   ├── leadRoutes.js
│   │   └── employeeRoutes.js
│   │
│   ├── middleware/              # Express middleware
│   │   ├── errorHandler.js
│   │   └── validationMiddleware.js
│   │
│   ├── exceptions/              # Custom exceptions
│   │   └── index.js
│   │
│   ├── constants/               # App constants
│   │   └── index.js
│   │
│   └── utils/                   # Utility functions
│       ├── logger.js
│       └── responseHandler.js
│
├── scripts/                     # Utility scripts
│   └── initializeDB.js
│
└── docs/                        # Documentation
    ├── CONTROLLER_ROUTES_DOCUMENTATION.md
    ├── CONTROLLER_TESTING_GUIDE.md
    ├── PHASE_9_COMPLETION_SUMMARY.md
    ├── ARCHITECTURE_IMPLEMENTATION_GUIDE.md
    ├── SERVICE_LAYER_DOCUMENTATION.md
    ├── SERVICE_LAYER_QUICK_REFERENCE.md
    └── SERVICE_LAYER_TESTING_GUIDE.md
```

---

## 🎯 Next Steps After Setup

### 1. Test All Endpoints (5-10 minutes)
Follow the test cases in `CONTROLLER_TESTING_GUIDE.md`

### 2. Review Architecture (15-20 minutes)
Read `ARCHITECTURE_IMPLEMENTATION_GUIDE.md`

### 3. Understand Service Layer (20-30 minutes)
Review `SERVICE_LAYER_DOCUMENTATION.md`

### 4. Plan Phase 10 (Authentication)
See `PHASE_9_COMPLETION_SUMMARY.md` section "Next Phase"

### 5. Set Up Testing (30-60 minutes)
Create Jest test suite following `SERVICE_LAYER_TESTING_GUIDE.md`

---

## 🔍 Development Workflow

### Daily Development Loop

```bash
# 1. Start server in one terminal
npm run dev

# 2. Test API in another terminal
curl http://localhost:3000/api/v1/leads

# 3. Make code changes
# (nodemon auto-restarts server on save)

# 4. Test again
curl http://localhost:3000/api/v1/leads

# 5. When done
# Ctrl+C to stop server
```

### Making Changes

```bash
# Edit a file
code src/controllers/LeadController.js

# Server automatically restarts (nodemon watches files)
# Test your changes
curl -X POST http://localhost:3000/api/v1/leads ...

# Repeat as needed
```

---

## 📝 Production Deployment

### Before Deploying

```bash
# 1. Set NODE_ENV to production
# In .env: NODE_ENV=production

# 2. Use production database URL
# In .env: DATABASE_URL=mongodb+srv://...

# 3. Set secure JWT secret
# In .env: JWT_SECRET=random-long-string-here

# 4. Enable CORS only for your domain
# In .env: CORS_ORIGIN=https://yourdomain.com

# 5. Test with production settings locally
npm run build  # If using TypeScript
npm start      # Start with production settings

# 6. Create deployment script
```

### Deployment Options

1. **Heroku**
   - `heroku create your-app-name`
   - `heroku config:set DATABASE_URL=...`
   - `git push heroku main`

2. **AWS**
   - Deploy to EC2 or Elastic Beanstalk
   - Use RDS for MongoDB (or MongoDB Atlas)
   - Set environment variables in deployment

3. **DigitalOcean**
   - Deploy to Droplet
   - Use MongoDB on separate server
   - Configure firewall rules

4. **Docker** (Recommended)
   - Create `Dockerfile` for containerization
   - Use `docker-compose.yml` for local testing
   - Deploy to Kubernetes or Docker Swarm

---

## 📚 Documentation Map

| Document | Purpose | Read Time |
|----------|---------|-----------|
| ARCHITECTURE_IMPLEMENTATION_GUIDE.md | Full system overview | 20 min |
| CONTROLLER_ROUTES_DOCUMENTATION.md | API reference | 15 min |
| CONTROLLER_TESTING_GUIDE.md | Testing guide | 15 min |
| PHASE_9_COMPLETION_SUMMARY.md | Phase 9 completion | 10 min |
| SERVICE_LAYER_DOCUMENTATION.md | Service details | 30 min |
| SERVICE_LAYER_QUICK_REFERENCE.md | Quick lookup | 10 min |
| SERVICE_LAYER_TESTING_GUIDE.md | Service testing | 20 min |

---

## ✅ Setup Verification Checklist

- [ ] Node.js v14+ installed
- [ ] npm v6+ installed
- [ ] MongoDB running (local or cloud)
- [ ] Dependencies installed (`npm install`)
- [ ] `.env` file created and configured
- [ ] Database connection verified
- [ ] Server starts without errors (`npm run dev`)
- [ ] Health check responds (curl /health)
- [ ] Can create lead (POST /api/v1/leads)
- [ ] Can retrieve leads (GET /api/v1/leads)
- [ ] All error scenarios tested
- [ ] Documentation reviewed

---

## 🎓 Learning Resources

- **Node.js & Express:** https://expressjs.com/
- **Mongoose Documentation:** https://mongoosejs.com/
- **MongoDB:** https://docs.mongodb.com/
- **REST API Design:** https://restfulapi.net/
- **Error Handling:** https://github.com/goldbergyoni/nodebestpractices

---

## 📞 Support

If you encounter issues:

1. **Check Troubleshooting Section** above
2. **Review CONTROLLER_TESTING_GUIDE.md** for solutions
3. **Check server logs** for error messages
4. **Verify .env configuration**
5. **Ensure MongoDB is running**
6. **Restart server**: Ctrl+C, then `npm run dev`

---

**Setup Version:** 1.0
**Last Updated:** Phase 9 Completion
**Status:** Ready for Development ✅
