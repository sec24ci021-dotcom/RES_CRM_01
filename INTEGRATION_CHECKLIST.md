# Frontend-Backend Integration Checklist

Complete this checklist to ensure proper integration between frontend and backend.

## Pre-Integration Setup

### Backend Configuration
- [ ] MongoDB is running or Atlas connection is available
- [ ] `.env` file exists in project root
- [ ] `NODE_ENV=development` is set
- [ ] `PORT=3000` is set
- [ ] `MONGODB_URI` is correctly configured
- [ ] `CORS_ORIGIN` includes `http://localhost:5173`
- [ ] `JWT_SECRET` is set (even if not used yet)
- [ ] Backend dependencies installed: `npm install`

### Frontend Configuration
- [ ] `client/.env.local` file created with:
  - [ ] `VITE_API_BASE_URL=http://localhost:3000/api/v1`
  - [ ] `VITE_ENV=development`
- [ ] Frontend dependencies installed: `cd client && npm install`

## Backend Integration

### API Layer
- [ ] `src/routes/leadRoutes.js` contains all lead endpoints
- [ ] `src/routes/index.js` mounts lead routes
- [ ] `src/controllers/LeadController.js` has all 10 methods
- [ ] `src/services/LeadService.js` implements business logic
- [ ] `src/repositories/` contains data access layers
- [ ] `src/middleware/errorHandler.js` is configured
- [ ] `server.js` initializes Express with CORS

### Middleware
- [ ] CORS middleware configured: `app.use(cors(config.cors))`
- [ ] Body parser configured: `app.use(express.json())`
- [ ] Morgan logging configured
- [ ] Error handler middleware registered

### Database
- [ ] MongoDB connection established
- [ ] Models created in `src/models/`
- [ ] Indexes created on: email, phone, status, source, createdAt
- [ ] Sample data available (optional)

### Health Checks
- [ ] GET `/api/v1/health` returns 200 OK
- [ ] GET `/api/v1/status` returns API info
- [ ] Backend logs show "Server running on port 3000"

## Frontend Integration

### API Service Layer
- [ ] `client/src/api/axiosClient.js` created with:
  - [ ] Base URL from env variable
  - [ ] Request interceptor for auth token
  - [ ] Response interceptor for error handling
  - [ ] `setAuthToken()` and `clearAuthToken()` functions
- [ ] `client/src/api/leadService.js` created with:
  - [ ] All CRUD methods: getLeads, createLead, updateLead, deleteLead
  - [ ] Search: searchLeads
  - [ ] Filtering: filterLeads, getLeadStats
  - [ ] Actions: updateLeadStatus, assignLead, convertLead
  - [ ] Health checks: checkHealth, getAPIStatus

### React Components Updated
- [ ] `Dashboard.jsx` uses leadService for stats
- [ ] `LeadList.jsx` uses leadService with pagination
- [ ] `CreateLead.jsx` uses leadService.createLead
- [ ] `EditLead.jsx` uses leadService for fetch and update
- [ ] `LeadDetails.jsx` uses leadService.getLeadById
- [ ] `SearchLeads.jsx` uses leadService.searchLeads
- [ ] `FilterLeads.jsx` uses leadService.filterLeads
- [ ] `AssignLead.jsx` uses leadService.assignLead with agentId
- [ ] `UpdateStatus.jsx` uses leadService.updateLeadStatus

### Error Handling
- [ ] All components have try-catch blocks
- [ ] Error states displayed to users
- [ ] Loading states implemented
- [ ] Validation feedback provided

### User Experience
- [ ] All forms have proper labels
- [ ] Buttons have loading indicators
- [ ] Error messages are user-friendly
- [ ] Navigation works between pages
- [ ] Back/Cancel buttons work properly

## Endpoint Testing

### Lead Endpoints
- [ ] GET `/leads` returns paginated list
- [ ] GET `/leads/:id` returns single lead
- [ ] POST `/leads` creates new lead
- [ ] PUT `/leads/:id` updates lead
- [ ] DELETE `/leads/:id` soft deletes lead
- [ ] PUT `/leads/:id/status` updates status
- [ ] PUT `/leads/:id/assign` assigns to agent
- [ ] POST `/leads/:id/convert` converts lead
- [ ] GET `/leads/search?q=...` searches
- [ ] POST `/leads/advanced-filter` filters
- [ ] GET `/leads/stats` returns statistics

### Response Format
- [ ] Success responses have: `success: true, data: {...}, message: "..."`
- [ ] Error responses have: `success: false, error: {...}`
- [ ] Pagination included when applicable
- [ ] HTTP status codes are correct (200, 201, 400, 404, 500)

## Integration Tests

### Basic Functionality
- [ ] Start backend: `npm run dev` (Terminal 1)
- [ ] Start frontend: `cd client && npm run dev` (Terminal 2)
- [ ] Frontend loads at `http://localhost:5173` without errors
- [ ] Dashboard displays statistics
- [ ] Browser console has no CORS errors
- [ ] Network tab shows API calls to correct URL

### CRUD Operations
- [ ] Create: Can create new lead via form
- [ ] Read: Can view lead list and details
- [ ] Update: Can edit lead information
- [ ] Delete: Can soft delete lead
- [ ] List: Can view paginated leads

### Advanced Features
- [ ] Search: Can search leads by name/email/phone
- [ ] Filter: Can filter by status, source, priority
- [ ] Assign: Can assign lead to agent
- [ ] Status: Can change lead status
- [ ] Pagination: Next/Previous buttons work
- [ ] Error handling: Shows error on failed operations

### Data Validation
- [ ] Required fields are validated
- [ ] Email format is validated
- [ ] Phone format is validated
- [ ] Duplicate emails are rejected
- [ ] Invalid data shows error messages

### Performance
- [ ] Page loads in < 2 seconds
- [ ] API responses are < 1 second
- [ ] Large lists paginate properly
- [ ] No console errors or warnings
- [ ] Memory usage stable over time

## Browser DevTools Verification

### Console Tab
- [ ] No red errors
- [ ] Auth token logged correctly (if logging implemented)
- [ ] API responses logged correctly
- [ ] No CORS errors

### Network Tab
- [ ] All API calls show 200/201 status
- [ ] Request headers include Content-Type
- [ ] Authorization header included (when applicable)
- [ ] Response payloads are valid JSON
- [ ] No 404 or 500 errors

### Application Tab
- [ ] localStorage contains authToken (when logged in)
- [ ] localStorage contains session data (if applicable)
- [ ] Cookies are set correctly

### Elements Tab
- [ ] UI elements render properly
- [ ] Tailwind CSS classes applied
- [ ] Forms have proper focus states
- [ ] Buttons are clickable

## Deployment Readiness

### Code Quality
- [ ] No console.log statements in production code
- [ ] Error handling is comprehensive
- [ ] No hardcoded URLs or secrets
- [ ] Environment variables used correctly
- [ ] Code follows project conventions

### Documentation
- [ ] API endpoints documented
- [ ] Component props documented
- [ ] Error scenarios documented
- [ ] Setup instructions clear
- [ ] Troubleshooting guide created

### Security
- [ ] CORS properly configured
- [ ] No sensitive data in frontend
- [ ] Input validation on frontend and backend
- [ ] Error messages don't leak sensitive info
- [ ] Request size limits enforced

### Monitoring
- [ ] Backend logs all API calls
- [ ] Frontend logs errors to console
- [ ] Error tracking prepared (for Phase 10)
- [ ] Performance metrics captured
- [ ] Database queries logged

## Common Issues Checklist

### If Getting CORS Errors
- [ ] Check `CORS_ORIGIN` in backend `.env`
- [ ] Verify frontend URL is included
- [ ] Check that backend includes `http://localhost:5173`
- [ ] Restart backend after .env change
- [ ] Clear browser cache

### If Getting 404 Errors
- [ ] Check endpoint path spelling
- [ ] Verify method (GET vs POST vs PUT)
- [ ] Check that routes are mounted in `src/routes/index.js`
- [ ] Verify controller methods exist
- [ ] Check API base URL in frontend

### If Getting Connection Refused
- [ ] Verify backend is running on port 3000
- [ ] Check if port is already in use
- [ ] Verify MongoDB connection
- [ ] Check network connectivity
- [ ] Try different port if 3000 is used

### If Getting Validation Errors
- [ ] Check all required fields are provided
- [ ] Verify field types (string, number, date)
- [ ] Check email format validation
- [ ] Verify phone format validation
- [ ] Check enum values (status, priority, source)

### If Getting Authentication Errors
- [ ] Verify token is in localStorage
- [ ] Check token expiration (Phase 10)
- [ ] Verify JWT_SECRET in .env
- [ ] Check Authorization header format
- [ ] Look at error details in response

## Phase 10 Preparation

- [ ] Authentication endpoints planned
- [ ] JWT token storage strategy decided
- [ ] Token refresh mechanism designed
- [ ] Role-based access control planned
- [ ] Protected routes identified
- [ ] Login/logout flow designed
- [ ] Token interceptor ready for implementation

## Final Verification

- [ ] All checklist items completed
- [ ] No blocking errors in console
- [ ] All API endpoints working
- [ ] All pages accessible
- [ ] All forms working
- [ ] All buttons functional
- [ ] Responsive design verified
- [ ] Performance acceptable
- [ ] Ready for production deployment

## Sign-Off

- [ ] Backend integration verified by: _____________ Date: _______
- [ ] Frontend integration verified by: _____________ Date: _______
- [ ] Full system tested by: _____________ Date: _______
- [ ] Ready for Phase 10: ☐ Yes ☐ No

## Notes & Issues

```
Issue 1:
Description:
Resolution:
Status:

Issue 2:
Description:
Resolution:
Status:
```

---

**Last Updated:** 2024
**Integration Version:** 1.0
**Status:** ✅ Complete
