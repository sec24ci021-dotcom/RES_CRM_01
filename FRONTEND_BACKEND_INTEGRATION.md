# Frontend-Backend Integration Guide

## Overview
This guide describes the efficient and proper integration between the React frontend and Express.js backend for the Lead Management System.

## Architecture

### Backend Structure
```
Backend (Node.js/Express)
├── Server: http://localhost:3000
├── API Prefix: /api/v1
├── Routes:
│   ├── /leads - Lead management
│   ├── /activities - Activity tracking
│   ├── /users - User/Agent management
│   ├── /auth - Authentication (Phase 10)
│   └── /health - Health checks
├── Layers:
│   ├── Controllers - Request handling
│   ├── Services - Business logic
│   ├── Repositories - Data access
│   ├── Middleware - Cross-cutting concerns
│   └── Models - Data schemas
└── Database: MongoDB
```

### Frontend Structure
```
Frontend (React/Vite)
├── Dev Server: http://localhost:5173
├── Build: Vite
├── API Layer:
│   ├── axiosClient.js - HTTP client with interceptors
│   ├── leadService.js - Centralized API service
│   └── .env.local - Environment configuration
├── Pages:
│   ├── Dashboard - Statistics overview
│   ├── LeadList - Paginated lead list
│   ├── CreateLead - Lead creation form
│   ├── EditLead - Lead editing
│   ├── LeadDetails - Detailed view
│   ├── SearchLeads - Search functionality
│   ├── FilterLeads - Advanced filtering
│   ├── AssignLead - Lead assignment
│   └── UpdateStatus - Status management
└── Styling: Tailwind CSS
```

## API Communication Flow

```
React Component
    ↓
leadService.js (API Methods)
    ↓
axiosClient.js (HTTP Instance)
    ├─ Request Interceptor (Add Auth Token)
    ├─ API Call
    └─ Response Interceptor (Handle Errors)
    ↓
Express Backend
    ↓
Route Handler
    ↓
Controller
    ↓
Service Layer
    ↓
Repository
    ↓
MongoDB
```

## Environment Configuration

### Frontend .env.local
Located at: `client/.env.local`

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:3000/api/v1
VITE_ENV=development
VITE_DEBUG=true

# Request Settings
VITE_REQUEST_TIMEOUT=30000

# Application Settings
VITE_APP_NAME=Lead Management System
```

### Backend .env
Located at: `.env`

```env
# Server
NODE_ENV=development
PORT=3000
API_PREFIX=/api/v1

# Database
MONGODB_URI=mongodb://localhost:27017/lead-crm

# CORS - Must include frontend URL
CORS_ORIGIN=http://localhost:3000,http://localhost:5173

# JWT (Phase 10)
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d
```

## API Service Layer

### Location
`client/src/api/leadService.js`

### Key Features
- **Centralized API methods** - Single source of truth for all API calls
- **Error handling** - Consistent error handling across all requests
- **Request/Response interceptors** - Automatic token injection and error formatting
- **Type safety** - JSDoc comments for IDE autocomplete

### Usage Example

```javascript
import { getLeads, createLead, updateLeadStatus } from '../api/leadService'

// Get leads with pagination
const res = await getLeads(1, 10, { status: 'QUALIFIED' })
const leads = res.data.data
const pagination = res.data.pagination

// Create lead
const newLead = await createLead({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    phone: '1234567890',
    source: 'WEBSITE'
})

// Update status
await updateLeadStatus(leadId, 'QUALIFIED')
```

## Axios Client Configuration

### Location
`client/src/api/axiosClient.js`

### Features

#### Request Interceptor
- Automatically adds `Authorization` header with JWT token
- Retrieves token from `localStorage.authToken`

```javascript
// Automatically handles auth token injection
axiosClient.get('/leads') // Token is automatically added
```

#### Response Interceptor
- Handles various error scenarios
- Provides consistent error format
- Validates server connection

```javascript
// Error handling
try {
    const res = await leadService.getLeads()
} catch (error) {
    // Error format:
    // {
    //   status: 200|0|-1,
    //   message: 'Error message',
    //   data: response.data
    // }
}
```

#### Error Types
- **Status 200-299**: Success (no error thrown)
- **Status 400-599**: Server error (error.status = status code)
- **Status 0**: No response from server
- **Status -1**: Request setup error

### Authentication Functions

```javascript
// Set token (called after login in Phase 10)
import { setAuthToken } from '../api/axiosClient'
setAuthToken(jwtToken)

// Clear token (called on logout)
import { clearAuthToken } from '../api/axiosClient'
clearAuthToken()

// Get current API URL
import { getBaseURL } from '../api/axiosClient'
const url = getBaseURL()
```

## Component Integration Patterns

### Pattern 1: Data Fetching with Loading & Error States

```javascript
import { useState, useEffect } from 'react'
import { getLeads } from '../api/leadService'

function LeadList() {
    const [leads, setLeads] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await getLeads(1, 10)
                setLeads(res.data.data || [])
            } catch (err) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }
        fetch()
    }, [])

    if (loading) return <div>Loading...</div>
    if (error) return <div>{error}</div>
    return <div>{leads.map(lead => ...)}</div>
}
```

### Pattern 2: Form Submission

```javascript
async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    try {
        const res = await createLead(formData)
        navigate(`/leads/${res.data.data._id}`)
    } catch (err) {
        setError(err.message || 'Failed to create')
    } finally {
        setLoading(false)
    }
}
```

### Pattern 3: Pagination

```javascript
const [page, setPage] = useState(1)

useEffect(() => {
    const fetch = async () => {
        const res = await getLeads(page, 10)
        setLeads(res.data.data)
        setPagination(res.data.pagination)
    }
    fetch()
}, [page])
```

## API Endpoints Reference

### Lead Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/leads` | List leads (paginated) |
| GET | `/leads/:id` | Get single lead |
| POST | `/leads` | Create lead |
| PUT | `/leads/:id` | Update lead |
| DELETE | `/leads/:id` | Delete lead (soft) |
| PUT | `/leads/:id/status` | Update status |
| PUT | `/leads/:id/assign` | Assign to agent |
| POST | `/leads/:id/convert` | Convert to customer |
| GET | `/leads/search` | Search leads |
| POST | `/leads/advanced-filter` | Advanced filtering |
| GET | `/leads/stats` | Get statistics |
| GET | `/leads/advanced-stats` | Advanced statistics |

### Request/Response Format

#### Success Response
```json
{
    "success": true,
    "message": "Operation successful",
    "data": { /* actual data */ },
    "pagination": { /* if applicable */ },
    "statusCode": 200
}
```

#### Error Response
```json
{
    "success": false,
    "error": {
        "code": "VALIDATION_ERROR",
        "message": "Invalid input",
        "statusCode": 400,
        "details": []
    }
}
```

## Running the Application

### Prerequisites
- Node.js v14+
- MongoDB (local or Atlas)
- npm or yarn

### Setup Backend

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your settings

# Start development server
npm run dev

# Initialize database (if needed)
npm run seed
```

Backend runs on: `http://localhost:3000`

### Setup Frontend

```bash
cd client

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend runs on: `http://localhost:5173`

### Environment Configuration for Development

```bash
# Backend .env must include:
CORS_ORIGIN=http://localhost:5173

# Frontend .env.local must have:
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

## Error Handling Best Practices

### 1. Always Handle Errors
```javascript
try {
    await leadService.updateLead(id, data)
} catch (err) {
    console.error('Update failed:', err)
    setError(err.message)
}
```

### 2. Show User-Friendly Messages
```javascript
// ✓ Good
setError('Failed to load leads. Please try again.')

// ✗ Avoid
setError(JSON.stringify(error))
```

### 3. Check Backend Connectivity
```javascript
import { checkHealth } from '../api/leadService'

useEffect(() => {
    checkHealth().catch(() => {
        setError('Backend server is not running')
    })
}, [])
```

## Debugging Tips

### 1. Browser DevTools
- Network tab: Inspect API requests/responses
- Console: Check for JavaScript errors
- Application tab: Check localStorage for tokens

### 2. Check Backend Logs
```bash
# Ensure backend is running and logging
npm run dev  # Shows morgan request logs
```

### 3. Common Issues

| Issue | Solution |
|-------|----------|
| 404 Not Found | Check endpoint path and backend routes |
| CORS error | Verify CORS_ORIGIN in backend .env |
| No response | Check if backend is running (port 3000) |
| Token not sent | Verify token is in localStorage |
| Validation errors | Check required fields in request body |

## Performance Optimization

### 1. Pagination
Always use pagination to avoid loading large datasets:
```javascript
await getLeads(page, 10)  // 10 items per page
```

### 2. Error Recovery
Implement retry logic for failed requests:
```javascript
async function fetchWithRetry(fn, retries = 3) {
    for (let i = 0; i < retries; i++) {
        try {
            return await fn()
        } catch (err) {
            if (i === retries - 1) throw err
            await new Promise(r => setTimeout(r, 1000))
        }
    }
}
```

### 3. Request Caching
Cache frequently accessed data in state to reduce API calls.

## Security Notes

### Implemented Security
✅ CORS configuration  
✅ Request size limits (10MB)  
✅ Input validation  
✅ Error sanitization  
✅ Token management (localStorage)  

### TODO (Phase 10+)
🔲 JWT authentication  
🔲 HTTPS enforcement  
🔲 Rate limiting  
🔲 Role-based access control  

## File Structure

```
lead-management-module/
├── client/
│   ├── src/
│   │   ├── api/
│   │   │   ├── axiosClient.js ← HTTP client
│   │   │   └── leadService.js ← API methods
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── LeadList.jsx
│   │   │   ├── CreateLead.jsx
│   │   │   ├── EditLead.jsx
│   │   │   ├── LeadDetails.jsx
│   │   │   ├── SearchLeads.jsx
│   │   │   ├── FilterLeads.jsx
│   │   │   ├── AssignLead.jsx
│   │   │   └── UpdateStatus.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env.local ← Frontend config
│   └── package.json
├── src/
│   ├── controllers/
│   ├── services/
│   ├── repositories/
│   ├── routes/
│   ├── middleware/
│   └── models/
├── .env ← Backend config
└── server.js
```

## Next Steps

### Phase 10: Authentication
- Implement JWT authentication
- Create login/logout endpoints
- Add role-based access control
- Implement protected routes in frontend

### Phase 11: Advanced Features
- Real-time notifications
- Activity logging UI
- Advanced reporting
- Import/export functionality

## Support & Troubleshooting

### Common Error Messages

**"No response from server"**
- Check if backend is running: `npm run dev`
- Verify port 3000 is not in use

**"CORS error"**
- Ensure `http://localhost:5173` is in backend `CORS_ORIGIN`

**"Lead not found"**
- Verify lead ID is correct
- Check MongoDB connection

**"Validation failed"**
- Check all required fields are provided
- Verify field formats (email, phone)

### Getting Help
1. Check browser console for errors
2. Inspect network tab for request/response
3. Verify backend and frontend are both running
4. Check configuration files (.env and .env.local)

## References

- [Backend API Documentation](./CONTROLLER_ROUTES_DOCUMENTATION.md)
- [Database Models](./MODELS_DOCUMENTATION.md)
- [Service Layer Guide](./SERVICE_LAYER_DOCUMENTATION.md)
- [Repository Layer Guide](./REPOSITORY_DOCUMENTATION.md)
