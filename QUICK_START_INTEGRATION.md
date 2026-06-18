# Frontend-Backend Integration Quick Start

Get the Lead Management System running locally in 5 minutes.

## Prerequisites
- Node.js v14+ installed
- MongoDB running (local or Atlas)
- Git installed

## Quick Setup

### 1. Backend Setup (Terminal 1)

```bash
# Navigate to project root
cd path/to/lead-management-module

# Install dependencies
npm install

# Verify .env file has CORS_ORIGIN
cat .env | grep CORS_ORIGIN
# Should show: CORS_ORIGIN=http://localhost:3000,http://localhost:3001,http://localhost:5173

# Start backend
npm run dev
```

✅ Backend running on: `http://localhost:3000`

**Expected output:**
```
Server running on port 3000
Database connected
```

### 2. Frontend Setup (Terminal 2)

```bash
# Navigate to client folder
cd path/to/lead-management-module/client

# Install dependencies
npm install

# Create/verify .env.local
# File should contain:
# VITE_API_BASE_URL=http://localhost:3000/api/v1

# Start frontend
npm run dev
```

✅ Frontend running on: `http://localhost:5173`

**Expected output:**
```
VITE v4.x.x
➜  Local:   http://localhost:5173/
```

## Access the Application

Open browser and go to: **http://localhost:5173**

You should see:
- Navigation bar with Dashboard, Leads, Create Lead, Search, Filter
- Dashboard page with statistics
- All pages should load without errors

## Testing the Integration

### Test 1: View Leads
1. Click "Leads" in navigation
2. Should display list of leads (or empty message)
3. ✅ If works, database connection is OK

### Test 2: Create Lead
1. Click "Create Lead"
2. Fill in:
   - First Name: John
   - Last Name: Doe
   - Email: john@example.com
   - Phone: 1234567890
3. Click "Create Lead"
4. ✅ If redirected to lead details, creation worked

### Test 3: Search
1. Click "Search"
2. Enter search term
3. Click "Search"
4. ✅ Should show results

### Test 4: Filter
1. Click "Filter"
2. Select status, source, priority
3. Click "Apply Filters"
4. ✅ Should show filtered results

## Troubleshooting

### Frontend shows "No response from server"
**Problem:** Backend not running or wrong port

**Solution:**
```bash
# Terminal 1: Make sure backend is running
cd lead-management-module
npm run dev  # Should show "Server running on port 3000"

# Check if port 3000 is in use
netstat -ano | findstr :3000  # Windows
lsof -i :3000  # Mac/Linux
```

### CORS Error in Browser Console
**Problem:** Frontend blocked by CORS policy

**Solution:**
```bash
# Edit .env in backend root
CORS_ORIGIN=http://localhost:3000,http://localhost:3001,http://localhost:5173

# Restart backend
npm run dev
```

### MongoDB Connection Error
**Problem:** Database not accessible

**Solution:**
```bash
# Check MongoDB URI in .env
# For local: MONGODB_URI=mongodb://localhost:27017/lead-crm
# For Atlas: MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/lead-crm

# If using local MongoDB:
mongod  # Start MongoDB service

# Restart backend after fixing
npm run dev
```

### 404 errors on all API calls
**Problem:** API endpoints not matching

**Solution:**
```bash
# Verify backend has all routes loaded
# Check that leadRoutes.js is mounted in src/routes/index.js

# Verify frontend is calling correct URL
# Open browser DevTools > Network tab
# API calls should go to: http://localhost:3000/api/v1/leads
```

## Development Workflow

### Making Changes

#### Backend Changes
```bash
# Edit src/controllers/*.js or src/services/*.js
# Restart automatically (nodemon watches files)
# Refresh browser to see changes
```

#### Frontend Changes
```bash
# Edit client/src/pages/*.jsx or client/src/api/*.js
# Vite hot reload - page refreshes automatically
```

### Debugging

**Browser DevTools:**
1. Open F12 in browser
2. Network tab: See API requests/responses
3. Console tab: Check for errors
4. Application tab: View localStorage

**Backend Logs:**
1. Check terminal running `npm run dev`
2. Look for error messages
3. Check database connection status

## API Health Check

Test if backend is responding:

```bash
# Terminal 3: Test API
curl http://localhost:3000/api/v1/health

# Expected response:
# {
#   "success": true,
#   "status": "OK",
#   "database": "Connected"
# }
```

## File Locations

| File | Purpose |
|------|---------|
| `client/.env.local` | Frontend config |
| `.env` | Backend config |
| `client/src/api/leadService.js` | API methods |
| `client/src/api/axiosClient.js` | HTTP client |
| `src/routes/leadRoutes.js` | API routes |
| `src/controllers/LeadController.js` | Request handlers |

## What's Integrated

✅ Frontend and backend communication  
✅ Error handling and recovery  
✅ Request/response interceptors  
✅ Pagination support  
✅ Advanced filtering  
✅ Search functionality  
✅ Form validation  
✅ Loading states  
✅ Error messages  
✅ CORS configuration  

## Next Steps

After successful setup:
1. Explore all pages in the application
2. Try CRUD operations (Create, Read, Update, Delete)
3. Test filtering and search
4. Review the [detailed integration guide](./FRONTEND_BACKEND_INTEGRATION.md)
5. Check [API documentation](./CONTROLLER_ROUTES_DOCUMENTATION.md)

## Performance Tips

1. **Use pagination** - Don't load all records at once
2. **Filter before loading** - Reduce API response size
3. **Check browser DevTools** - See actual API response times
4. **Monitor backend logs** - Identify slow operations

## Security for Development

⚠️ **For Development Only:**
- JWT secret is in .env (change for production)
- CORS allows localhost (restrict for production)
- Debug mode is enabled (disable for production)

## Common Commands

```bash
# Backend
npm run dev              # Start with auto-reload
npm run start            # Start production
npm run seed             # Load sample data
npm run clean:start      # Clean and restart

# Frontend
npm run dev              # Start dev server
npm run build            # Build for production
npm run preview          # Preview build
```

## Getting Help

1. Check application console (F12)
2. Check backend terminal output
3. Verify both servers are running
4. Test API directly with curl
5. Review detailed documentation files

## Success Indicators ✅

- [ ] Backend starts without errors
- [ ] Frontend loads at localhost:5173
- [ ] Dashboard shows statistics
- [ ] Can view leads list
- [ ] Can create new lead
- [ ] Can search leads
- [ ] Can filter leads
- [ ] Can assign leads
- [ ] Can update lead status

If all indicators are green, your integration is working perfectly! 🎉
