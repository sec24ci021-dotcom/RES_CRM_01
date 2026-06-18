# Lead Search & Filter API Endpoints - Implementation Summary

## ✅ Completed Implementation

All advanced search and filter APIs have been implemented with MongoDB aggregation pipelines for optimal performance and pagination.

---

## 📋 API Endpoints

### 1. **Advanced Search by Customer Info**
**Endpoint:** `GET /api/v1/leads/advanced-search`

**Query Parameters:**
- `q` (required): Search term (searches firstName, lastName, email, phone)
- `page` (optional, default: 1): Page number
- `limit` (optional, default: 10, max: 100): Records per page
- `sortBy` (optional, default: createdAt): Sort field
- `sortOrder` (optional, default: -1): Sort order (1 = ascending, -1 = descending)

**Example Request:**
```bash
GET /api/v1/leads/advanced-search?q=john&page=1&limit=10&sortBy=createdAt&sortOrder=-1
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Search completed successfully",
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "pages": 5
  },
  "statusCode": 200
}
```

---

### 2. **Advanced Statistics with Filters**
**Endpoint:** `GET /api/v1/leads/advanced-stats`

**Query Parameters:**
- `status` (optional): Filter by status value
- `assignedTo` (optional): Filter by agent ID
- `source` (optional): Filter by lead source

**Example Request:**
```bash
GET /api/v1/leads/advanced-stats?status=QUALIFIED&source=WEBSITE
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Advanced statistics retrieved successfully",
  "data": {
    "total": 150,
    "byStatus": [
      { "status": "QUALIFIED", "count": 50 },
      { "status": "NEW_LEAD", "count": 100 }
    ],
    "bySource": [
      { "source": "WEBSITE", "count": 80 },
      { "source": "REFERRAL", "count": 70 }
    ],
    "byPriority": [
      { "priority": "HIGH", "count": 40 },
      { "priority": "MEDIUM", "count": 110 }
    ],
    "budgetStats": {
      "min": 50000,
      "max": 500000,
      "avg": 250000
    },
    "topAssignments": [
      { "agentId": "...", "count": 25 },
      { "agentId": "...", "count": 18 }
    ]
  },
  "appliedFilters": {...},
  "statusCode": 200
}
```

---

### 3. **Advanced Filter with Criteria**
**Endpoint:** `POST /api/v1/leads/advanced-filter`

**Request Body:**
```json
{
  "status": "QUALIFIED",
  "assignedTo": "agent_id_string",
  "source": "WEBSITE",
  "priority": "HIGH",
  "page": 1,
  "limit": 10,
  "sortBy": "createdAt",
  "sortOrder": -1
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Filter completed successfully",
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  },
  "appliedFilters": {
    "status": "QUALIFIED",
    "source": "WEBSITE"
  },
  "statusCode": 200
}
```

---

### 4. **Combined Search with Filter**
**Endpoint:** `POST /api/v1/leads/search-with-filter`

**Request Body:**
```json
{
  "q": "john",
  "status": "QUALIFIED",
  "assignedTo": "agent_id_string",
  "source": "WEBSITE",
  "priority": "HIGH",
  "page": 1,
  "limit": 10,
  "sortBy": "createdAt",
  "sortOrder": -1
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Search with filter completed successfully",
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 5,
    "pages": 1
  },
  "searchTerm": "john",
  "appliedFilters": {
    "status": "QUALIFIED",
    "source": "WEBSITE"
  },
  "statusCode": 200
}
```

---

## 🏗️ Technical Implementation

### Controller Methods Added
**File:** `src/controllers/LeadController.js`

Four new async methods added:
1. `advancedSearch(req, res, next)` - Handles regex-based search
2. `advancedFilter(req, res, next)` - Handles multi-criteria filtering
3. `searchWithFilter(req, res, next)` - Combines search with filters
4. `getAdvancedStatistics(req, res, next)` - Returns aggregated statistics

### Service Layer
**File:** `src/services/SearchService.js`

The SearchService provides all database queries using MongoDB aggregation pipelines:
- `searchByCustomerInfo()` - Regex search on firstName, lastName, email, phone
- `filterLeads()` - Filter by status, assignedTo, source, priority
- `searchWithFilter()` - Combined search + filter operations
- `getStatisticsWithFilters()` - Returns statistics breakdown with optional filters

### Route Definitions
**File:** `src/routes/leadRoutes.js`

- GET `/advanced-search` - Advanced search endpoint
- GET `/advanced-stats` - Advanced statistics endpoint
- POST `/advanced-filter` - Advanced filter endpoint
- POST `/search-with-filter` - Combined search+filter endpoint

---

## 🎯 Features

✅ **Regex-Based Search** - Searches firstName, lastName, email, phone with case-insensitive matching
✅ **Multi-Criteria Filtering** - Filter by status, assignedTo, source, priority
✅ **Combined Search + Filter** - Apply search and filters together
✅ **Pagination** - Configurable page and limit (max 100 per page)
✅ **Sorting** - Sort by any field in ascending/descending order
✅ **MongoDB Aggregation** - Uses `$facet` for efficient pagination and metadata counting
✅ **Employee Join** - Includes assignedTo employee details via `$lookup`
✅ **Statistics Breakdown** - Detailed stats by status, source, priority, budget, and top agents
✅ **Error Handling** - Comprehensive error responses with proper HTTP status codes
✅ **Logging** - All operations logged for debugging and monitoring

---

## 🧪 Testing

### Test Search
```bash
curl -X GET "http://localhost:3000/api/v1/leads/advanced-search?q=john&page=1&limit=10"
```

### Test Statistics
```bash
curl -X GET "http://localhost:3000/api/v1/leads/advanced-stats"
```

### Test Filter
```bash
curl -X POST "http://localhost:3000/api/v1/leads/advanced-filter" \
  -H "Content-Type: application/json" \
  -d '{"status":"QUALIFIED","page":1,"limit":10}'
```

### Test Combined Search+Filter
```bash
curl -X POST "http://localhost:3000/api/v1/leads/search-with-filter" \
  -H "Content-Type: application/json" \
  -d '{"q":"john","status":"QUALIFIED","page":1}'
```

---

## 📊 MongoDB Aggregation Pipeline

All endpoints use optimized aggregation pipelines with:
- `$match` - Filter stage
- `$lookup` - Join with employees collection
- `$unwind` - Flatten nested arrays
- `$facet` - Parallel processing for pagination and metadata
- `$sort` - Sort results
- `$skip` & `$limit` - Pagination

---

## ✨ Status

**Implementation:** ✅ Complete
**Testing:** ✅ Verified
**Server:** ✅ Running on http://localhost:3000
**MongoDB:** ✅ Connected

---

## 📝 Notes

- All endpoints support CORS
- Pagination limited to max 100 records per page
- Search is case-insensitive and supports partial matching
- Filters can accept arrays for multiple values (e.g., multiple statuses)
- Empty search/filter returns all leads (up to limit)
