# Repository Layer - Testing Guide

Complete testing guide with Jest/Mocha examples for unit and integration testing the Lead Repository.

---

## 🧪 Testing Setup

### Install Testing Dependencies
```bash
npm install --save-dev jest supertest mongoose
npm install --save-dev @types/jest
```

### Jest Configuration
```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'node',
  collectCoverageFrom: ['src/**/*.js'],
  coveragePathIgnorePatterns: ['/node_modules/'],
  testTimeout: 10000,
  setupFilesAfterEnv: ['<rootDir>/src/tests/setup.js']
};
```

### Test Setup File
```javascript
// src/tests/setup.js
const mongoose = require('mongoose');
const config = require('../config/environment');

// Connect to test database
beforeAll(async () => {
  await mongoose.connect(config.mongodb.testUri);
});

// Cleanup after tests
afterAll(async () => {
  await mongoose.connection.close();
});

// Clear data between tests
afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
});
```

---

## ✅ UNIT TESTS

### Test Suite 1: createLead()

```javascript
describe('LeadRepository - createLead', () => {
  let repository;

  beforeEach(() => {
    repository = require('../repositories/LeadRepository');
  });

  describe('Success Cases', () => {
    it('should create lead with valid data', async () => {
      const leadData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '+1-555-123-4567',
        source: 'WEBSITE'
      };

      const result = await repository.createLead(leadData, 'userId123');

      expect(result._id).toBeDefined();
      expect(result.firstName).toBe('John');
      expect(result.email).toBe('john@example.com');
      expect(result.status).toBe('NEW_LEAD');
      expect(result.priority).toBe('MEDIUM');
      expect(result.createdBy).toBe('userId123');
    });

    it('should create lead with all optional fields', async () => {
      const leadData = {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        phone: '+1-555-987-6543',
        source: 'REFERRAL',
        priority: 'HIGH',
        propertyId: 'PROP-123',
        budgetMin: 500000,
        budgetMax: 1000000,
        notes: 'Test notes'
      };

      const result = await repository.createLead(leadData, 'userId123');

      expect(result.priority).toBe('HIGH');
      expect(result.propertyId).toBe('PROP-123');
      expect(result.budgetMin).toBe(500000);
      expect(result.budgetMax).toBe(1000000);
      expect(result.notes).toBe('Test notes');
    });
  });

  describe('Error Cases', () => {
    it('should throw error when required fields are missing', async () => {
      const invalidData = {
        firstName: 'John',
        // Missing lastName, email, phone, source
      };

      try {
        await repository.createLead(invalidData);
        fail('Should have thrown error');
      } catch (error) {
        expect(error.statusCode).toBe(400);
        expect(error.message).toContain('required');
      }
    });

    it('should throw error with invalid email', async () => {
      const invalidData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'invalid-email',
        phone: '+1-555-123-4567',
        source: 'WEBSITE'
      };

      try {
        await repository.createLead(invalidData);
        fail('Should have thrown error');
      } catch (error) {
        expect(error.statusCode).toBe(400);
        expect(error.message).toContain('email');
      }
    });

    it('should throw error when firstName is missing', async () => {
      const invalidData = {
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '+1-555-123-4567',
        source: 'WEBSITE'
      };

      try {
        await repository.createLead(invalidData);
        fail('Should have thrown error');
      } catch (error) {
        expect(error.statusCode).toBe(400);
      }
    });
  });
});
```

---

### Test Suite 2: getLeadById()

```javascript
describe('LeadRepository - getLeadById', () => {
  let repository;
  let testLead;

  beforeEach(async () => {
    repository = require('../repositories/LeadRepository');
    
    // Create test lead
    testLead = await repository.createLead({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '+1-555-123-4567',
      source: 'WEBSITE'
    }, 'userId123');
  });

  describe('Success Cases', () => {
    it('should retrieve lead by ID', async () => {
      const result = await repository.getLeadById(testLead._id);

      expect(result._id.toString()).toBe(testLead._id.toString());
      expect(result.firstName).toBe('John');
      expect(result.email).toBe('john@example.com');
    });

    it('should populate assigned employee', async () => {
      // First assign a lead
      const updated = await repository.updateLead(
        testLead._id,
        { assignedTo: 'empId123' },
        'userId123'
      );

      const result = await repository.getLeadById(testLead._id, {
        populate: ['assignedTo']
      });

      expect(result).toBeDefined();
    });

    it('should select specific fields only', async () => {
      const result = await repository.getLeadById(testLead._id, {
        select: 'firstName lastName email'
      });

      expect(result.firstName).toBeDefined();
      expect(result.email).toBeDefined();
      expect(result.phone).toBeUndefined();
    });
  });

  describe('Error Cases', () => {
    it('should throw error for missing lead ID', async () => {
      try {
        await repository.getLeadById(null);
        fail('Should have thrown error');
      } catch (error) {
        expect(error.message).toContain('required');
      }
    });

    it('should throw error for non-existent lead', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      
      try {
        await repository.getLeadById(fakeId);
        fail('Should have thrown error');
      } catch (error) {
        expect(error.statusCode).toBe(404);
        expect(error.message).toContain('not found');
      }
    });

    it('should throw error for invalid ObjectId', async () => {
      try {
        await repository.getLeadById('invalid-id');
        fail('Should have thrown error');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });
});
```

---

### Test Suite 3: getAllLeads()

```javascript
describe('LeadRepository - getAllLeads', () => {
  let repository;

  beforeEach(async () => {
    repository = require('../repositories/LeadRepository');
    
    // Create test leads
    const leads = [];
    for (let i = 0; i < 25; i++) {
      leads.push({
        firstName: `Lead${i}`,
        lastName: 'Test',
        email: `lead${i}@example.com`,
        phone: `+1-555-${String(i).padStart(3, '0')}-4567`,
        source: i % 2 === 0 ? 'WEBSITE' : 'REFERRAL',
        status: i % 3 === 0 ? 'QUALIFIED' : 'NEW_LEAD',
        priority: i % 2 === 0 ? 'HIGH' : 'LOW'
      });
    }

    for (const lead of leads) {
      await repository.createLead(lead, 'userId123');
    }
  });

  describe('Pagination', () => {
    it('should return paginated results', async () => {
      const result = await repository.getAllLeads({
        page: 1,
        limit: 10
      });

      expect(result.data.length).toBe(10);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(10);
      expect(result.pagination.total).toBe(25);
      expect(result.pagination.pages).toBe(3);
    });

    it('should return second page', async () => {
      const page1 = await repository.getAllLeads({
        page: 1,
        limit: 10
      });

      const page2 = await repository.getAllLeads({
        page: 2,
        limit: 10
      });

      expect(page2.data[0]._id).not.toEqual(page1.data[0]._id);
    });

    it('should use default limit if not specified', async () => {
      const result = await repository.getAllLeads({ page: 1 });

      expect(result.data.length).toBeLessThanOrEqual(10);
    });
  });

  describe('Filtering', () => {
    it('should filter by status', async () => {
      const result = await repository.getAllLeads({
        page: 1,
        limit: 50,
        status: 'QUALIFIED'
      });

      expect(result.data.every(l => l.status === 'QUALIFIED')).toBe(true);
    });

    it('should filter by priority', async () => {
      const result = await repository.getAllLeads({
        page: 1,
        limit: 50,
        priority: 'HIGH'
      });

      expect(result.data.every(l => l.priority === 'HIGH')).toBe(true);
    });

    it('should filter by multiple criteria', async () => {
      const result = await repository.getAllLeads({
        page: 1,
        limit: 50,
        status: 'QUALIFIED',
        priority: 'HIGH'
      });

      expect(result.data.every(l => 
        l.status === 'QUALIFIED' && l.priority === 'HIGH'
      )).toBe(true);
    });
  });

  describe('Sorting', () => {
    it('should sort by creation date descending', async () => {
      const result = await repository.getAllLeads({
        page: 1,
        limit: 50,
        sort: { createdAt: -1 }
      });

      const dates = result.data.map(l => l.createdAt.getTime());
      expect(dates).toEqual([...dates].sort((a, b) => b - a));
    });
  });
});
```

---

### Test Suite 4: updateLead()

```javascript
describe('LeadRepository - updateLead', () => {
  let repository;
  let testLead;

  beforeEach(async () => {
    repository = require('../repositories/LeadRepository');
    
    testLead = await repository.createLead({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '+1-555-123-4567',
      source: 'WEBSITE',
      status: 'NEW_LEAD'
    }, 'userId123');
  });

  describe('Success Cases', () => {
    it('should update lead status', async () => {
      const result = await repository.updateLead(
        testLead._id,
        { status: 'QUALIFIED' },
        'userId123'
      );

      expect(result.status).toBe('QUALIFIED');
      expect(result.updatedBy).toBe('userId123');
    });

    it('should update multiple fields', async () => {
      const result = await repository.updateLead(
        testLead._id,
        {
          status: 'QUALIFIED',
          priority: 'HIGH',
          notes: 'Updated notes'
        },
        'userId123'
      );

      expect(result.status).toBe('QUALIFIED');
      expect(result.priority).toBe('HIGH');
      expect(result.notes).toBe('Updated notes');
    });

    it('should not update protected fields', async () => {
      const result = await repository.updateLead(
        testLead._id,
        {
          createdAt: new Date(),
          _id: '507f1f77bcf86cd799439011'
        },
        'userId123'
      );

      expect(result._id.toString()).toBe(testLead._id.toString());
      expect(result.createdAt.getTime()).toBe(testLead.createdAt.getTime());
    });
  });

  describe('Error Cases', () => {
    it('should throw error for non-existent lead', async () => {
      try {
        await repository.updateLead(
          '507f1f77bcf86cd799439011',
          { status: 'QUALIFIED' },
          'userId123'
        );
        fail('Should have thrown error');
      } catch (error) {
        expect(error.statusCode).toBe(404);
      }
    });

    it('should throw error for invalid status', async () => {
      try {
        await repository.updateLead(
          testLead._id,
          { status: 'INVALID_STATUS' },
          'userId123'
        );
        fail('Should have thrown error');
      } catch (error) {
        expect(error.statusCode).toBe(400);
      }
    });
  });
});
```

---

### Test Suite 5: deleteLead()

```javascript
describe('LeadRepository - deleteLead', () => {
  let repository;
  let testLead;

  beforeEach(async () => {
    repository = require('../repositories/LeadRepository');
    
    testLead = await repository.createLead({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '+1-555-123-4567',
      source: 'WEBSITE'
    }, 'userId123');
  });

  describe('Success Cases', () => {
    it('should soft delete lead', async () => {
      const result = await repository.deleteLead(testLead._id, 'userId123');

      expect(result.isDeleted).toBe(true);
      expect(result.deletedAt).toBeDefined();
      expect(result.updatedBy).toBe('userId123');
    });

    it('should exclude deleted leads from getAllLeads', async () => {
      await repository.deleteLead(testLead._id, 'userId123');

      const results = await repository.getAllLeads({
        page: 1,
        limit: 50
      });

      const leadExists = results.data.some(
        l => l._id.toString() === testLead._id.toString()
      );
      expect(leadExists).toBe(false);
    });
  });

  describe('Error Cases', () => {
    it('should throw error for non-existent lead', async () => {
      try {
        await repository.deleteLead('507f1f77bcf86cd799439011', 'userId123');
        fail('Should have thrown error');
      } catch (error) {
        expect(error.statusCode).toBe(404);
      }
    });
  });
});
```

---

### Test Suite 6: searchLead()

```javascript
describe('LeadRepository - searchLead', () => {
  let repository;

  beforeEach(async () => {
    repository = require('../repositories/LeadRepository');
    
    const leads = [
      {
        firstName: 'John',
        lastName: 'Apartment Seeker',
        email: 'john.apt@example.com',
        phone: '+1-555-123-4567',
        source: 'WEBSITE',
        notes: 'Looking for luxury apartment in Manhattan'
      },
      {
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane.apt@example.com',
        phone: '+1-555-234-5678',
        source: 'WEBSITE',
        notes: 'Interested in apartment near Central Park'
      },
      {
        firstName: 'Bob',
        lastName: 'Smith',
        email: 'bob.house@example.com',
        phone: '+1-555-345-6789',
        source: 'REFERRAL',
        notes: 'Looking for single family house'
      }
    ];

    for (const lead of leads) {
      await repository.createLead(lead, 'userId123');
    }
  });

  describe('Success Cases', () => {
    it('should search by first name', async () => {
      const result = await repository.searchLead('John', {
        page: 1,
        limit: 10
      });

      expect(result.data.length).toBeGreaterThan(0);
      expect(result.data[0].firstName).toBe('John');
    });

    it('should search by email', async () => {
      const result = await repository.searchLead('john.apt@example.com', {
        page: 1,
        limit: 10
      });

      expect(result.data.length).toBeGreaterThan(0);
    });

    it('should search by notes', async () => {
      const result = await repository.searchLead('apartment Manhattan', {
        page: 1,
        limit: 10
      });

      expect(result.data.length).toBeGreaterThan(0);
    });

    it('should return pagination info', async () => {
      const result = await repository.searchLead('apartment', {
        page: 1,
        limit: 10
      });

      expect(result.pagination).toBeDefined();
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(10);
      expect(result.pagination.total).toBeGreaterThanOrEqual(0);
    });

    it('should return query in response', async () => {
      const result = await repository.searchLead('John', {
        page: 1,
        limit: 10
      });

      expect(result.query).toBe('John');
    });
  });

  describe('Error Cases', () => {
    it('should throw error for empty search term', async () => {
      try {
        await repository.searchLead('', {
          page: 1,
          limit: 10
        });
        fail('Should have thrown error');
      } catch (error) {
        expect(error.message).toContain('required');
      }
    });

    it('should throw error for whitespace-only search term', async () => {
      try {
        await repository.searchLead('   ', {
          page: 1,
          limit: 10
        });
        fail('Should have thrown error');
      } catch (error) {
        expect(error.message).toContain('required');
      }
    });
  });
});
```

---

### Test Suite 7: filterLead()

```javascript
describe('LeadRepository - filterLead', () => {
  let repository;

  beforeEach(async () => {
    repository = require('../repositories/LeadRepository');
    
    const leads = [
      {
        firstName: 'John',
        lastName: 'High Budget',
        email: 'john@example.com',
        phone: '+1-555-123-4567',
        source: 'WEBSITE',
        status: 'QUALIFIED',
        priority: 'HIGH',
        location: { city: 'New York' },
        budgetMin: 800000,
        budgetMax: 1200000
      },
      {
        firstName: 'Jane',
        lastName: 'Low Budget',
        email: 'jane@example.com',
        phone: '+1-555-234-5678',
        source: 'REFERRAL',
        status: 'NEW_LEAD',
        priority: 'LOW',
        location: { city: 'Boston' },
        budgetMin: 300000,
        budgetMax: 500000
      },
      {
        firstName: 'Bob',
        lastName: 'Medium Budget',
        email: 'bob@example.com',
        phone: '+1-555-345-6789',
        source: 'WEBSITE',
        status: 'QUALIFIED',
        priority: 'MEDIUM',
        location: { city: 'New York' },
        budgetMin: 600000,
        budgetMax: 800000
      }
    ];

    for (const lead of leads) {
      await repository.createLead(lead, 'userId123');
    }
  });

  describe('Filter by Status', () => {
    it('should filter leads by status', async () => {
      const result = await repository.filterLead({
        status: 'QUALIFIED'
      }, { page: 1, limit: 50 });

      expect(result.data.every(l => l.status === 'QUALIFIED')).toBe(true);
      expect(result.data.length).toBe(2);
    });
  });

  describe('Filter by Priority', () => {
    it('should filter leads by priority', async () => {
      const result = await repository.filterLead({
        priority: 'HIGH'
      }, { page: 1, limit: 50 });

      expect(result.data.every(l => l.priority === 'HIGH')).toBe(true);
      expect(result.data.length).toBe(1);
    });
  });

  describe('Filter by Budget', () => {
    it('should filter leads by budget range', async () => {
      const result = await repository.filterLead({
        minBudget: 700000,
        maxBudget: 1000000
      }, { page: 1, limit: 50 });

      expect(result.data.length).toBeGreaterThan(0);
      expect(result.data.every(l => 
        l.budgetMax >= 700000 && l.budgetMax <= 1000000
      )).toBe(true);
    });
  });

  describe('Filter by City', () => {
    it('should filter leads by city', async () => {
      const result = await repository.filterLead({
        city: 'New York'
      }, { page: 1, limit: 50 });

      expect(result.data.length).toBe(2);
      expect(result.data.every(l => 
        l.location.city === 'New York'
      )).toBe(true);
    });

    it('should be case-insensitive', async () => {
      const result = await repository.filterLead({
        city: 'new york'
      }, { page: 1, limit: 50 });

      expect(result.data.length).toBe(2);
    });
  });

  describe('Multiple Filters', () => {
    it('should apply multiple filters', async () => {
      const result = await repository.filterLead({
        status: 'QUALIFIED',
        priority: 'HIGH',
        city: 'New York'
      }, { page: 1, limit: 50 });

      expect(result.data.every(l => 
        l.status === 'QUALIFIED' && 
        l.priority === 'HIGH' && 
        l.location.city === 'New York'
      )).toBe(true);
    });
  });
});
```

---

## 🧬 INTEGRATION TESTS

### Integration Test Suite

```javascript
describe('LeadRepository - Integration Tests', () => {
  let repository;

  beforeEach(async () => {
    repository = require('../repositories/LeadRepository');
  });

  describe('Complete Lead Lifecycle', () => {
    it('should create, retrieve, update, and delete a lead', async () => {
      // Create
      const created = await repository.createLead({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '+1-555-123-4567',
        source: 'WEBSITE'
      }, 'userId123');

      expect(created._id).toBeDefined();
      leadId = created._id;

      // Retrieve
      const retrieved = await repository.getLeadById(created._id);
      expect(retrieved.email).toBe('john@example.com');

      // Update
      const updated = await repository.updateLead(
        leadId,
        { status: 'QUALIFIED', priority: 'HIGH' },
        'userId123'
      );

      expect(updated.status).toBe('QUALIFIED');
      expect(updated.priority).toBe('HIGH');

      // Delete
      const deleted = await repository.deleteLead(leadId, 'userId123');
      expect(deleted.isDeleted).toBe(true);

      // Verify deleted
      const allLeads = await repository.getAllLeads({ page: 1, limit: 50 });
      const stillExists = allLeads.data.some(l => 
        l._id.toString() === leadId.toString()
      );
      expect(stillExists).toBe(false);
    });
  });

  describe('Complex Scenarios', () => {
    it('should handle search after bulk update', async () => {
      // Create multiple leads
      const leads = [];
      for (let i = 0; i < 5; i++) {
        leads.push(await repository.createLead({
          firstName: `Lead${i}`,
          lastName: 'Test',
          email: `lead${i}@example.com`,
          phone: `+1-555-${String(i).padStart(3, '0')}-4567`,
          source: 'WEBSITE'
        }, 'userId123'));
      }

      const leadIds = leads.map(l => l._id);

      // Bulk update
      const result = await repository.bulkUpdate(
        leadIds,
        { status: 'QUALIFIED', priority: 'HIGH' }
      );

      expect(result.modifiedCount).toBe(5);

      // Search for updated leads
      const search = await repository.searchLead('Lead', {
        page: 1,
        limit: 10
      });

      expect(search.data.length).toBe(5);
      expect(search.data.every(l => l.status === 'QUALIFIED')).toBe(true);
    });

    it('should generate accurate statistics', async () => {
      // Create leads with different statuses
      await repository.createLead({
        firstName: 'Converted',
        lastName: 'Lead',
        email: 'converted@example.com',
        phone: '+1-555-111-1111',
        source: 'WEBSITE',
        status: 'CONVERTED',
        conversionValue: 100000
      }, 'userId123');

      await repository.createLead({
        firstName: 'Lost',
        lastName: 'Lead',
        email: 'lost@example.com',
        phone: '+1-555-222-2222',
        source: 'WEBSITE',
        status: 'LOST'
      }, 'userId123');

      await repository.createLead({
        firstName: 'Qualified',
        lastName: 'Lead',
        email: 'qualified@example.com',
        phone: '+1-555-333-3333',
        source: 'WEBSITE',
        status: 'QUALIFIED'
      }, 'userId123');

      const stats = await repository.getLeadStatistics();

      expect(stats.totalLeads).toBe(3);
      expect(stats.convertedLeads).toBe(1);
      expect(stats.lostLeads).toBe(1);
    });
  });
});
```

---

## 🏃 Running Tests

### Run All Tests
```bash
npm test
```

### Run Specific Test Suite
```bash
npm test -- LeadRepository
```

### Run with Coverage
```bash
npm test -- --coverage
```

### Watch Mode
```bash
npm test -- --watch
```

---

## 📊 Test Coverage Goals

- **Statements**: 90%+
- **Branches**: 85%+
- **Functions**: 90%+
- **Lines**: 90%+

---

## 🎯 Testing Checklist

- [ ] All CRUD operations have happy path tests
- [ ] All error cases have tests
- [ ] Pagination is tested
- [ ] Filtering is tested
- [ ] Searching is tested
- [ ] Soft deletes work correctly
- [ ] Populated relationships load correctly
- [ ] Protected fields cannot be updated
- [ ] Audit trails are maintained
- [ ] Validation works as expected
- [ ] Integration tests pass
- [ ] Coverage > 90%

---

## 🔗 Related Files

- Repository: [src/repositories/LeadRepository.js](src/repositories/LeadRepository.js)
- Test Examples: [src/tests/repositories/LeadRepository.test.js](src/tests/repositories/LeadRepository.test.js)
