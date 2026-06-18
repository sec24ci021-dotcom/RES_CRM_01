# Service Layer Testing Guide

## Test Architecture

The Service Layer should be tested at multiple levels:

```
Unit Tests (Services in isolation)
    ↓
Integration Tests (Services + Repositories)
    ↓
E2E Tests (Full workflow with controllers)
```

---

## Test Setup

### Required Dependencies

```bash
npm install --save-dev jest @testing-library/node
npm install --save-dev mongodb-memory-server
npm install --save-dev sinon
```

### Jest Configuration

**jest.config.js:**
```javascript
module.exports = {
    testEnvironment: 'node',
    testTimeout: 10000,
    collectCoverageFrom: [
        'src/services/**/*.js',
        'src/repositories/**/*.js',
        'src/exceptions/**/*.js'
    ],
    coverageThreshold: {
        global: {
            branches: 70,
            functions: 70,
            lines: 70,
            statements: 70
        }
    }
};
```

---

## Unit Tests

### LeadValidationService Tests

```javascript
const LeadValidationService = require('../services/LeadValidationService');
const { ValidationException } = require('../exceptions');

describe('LeadValidationService', () => {
    describe('validateLeadForCreation', () => {
        it('should validate valid lead data', () => {
            const validLead = {
                firstName: 'John',
                lastName: 'Doe',
                email: 'john@example.com',
                phone: '+1234567890',
                source: 'WEBSITE'
            };

            expect(() => {
                LeadValidationService.validateLeadForCreation(validLead);
            }).not.toThrow();
        });

        it('should throw ValidationException for missing firstName', () => {
            const invalidLead = {
                lastName: 'Doe',
                email: 'john@example.com',
                phone: '+1234567890',
                source: 'WEBSITE'
            };

            expect(() => {
                LeadValidationService.validateLeadForCreation(invalidLead);
            }).toThrow(ValidationException);
        });

        it('should throw ValidationException for invalid email', () => {
            const invalidLead = {
                firstName: 'John',
                lastName: 'Doe',
                email: 'invalid-email',
                phone: '+1234567890',
                source: 'WEBSITE'
            };

            expect(() => {
                LeadValidationService.validateLeadForCreation(invalidLead);
            }).toThrow(ValidationException);
        });

        it('should throw ValidationException for invalid source', () => {
            const invalidLead = {
                firstName: 'John',
                lastName: 'Doe',
                email: 'john@example.com',
                phone: '+1234567890',
                source: 'INVALID_SOURCE'
            };

            expect(() => {
                LeadValidationService.validateLeadForCreation(invalidLead);
            }).toThrow(ValidationException);
        });

        it('should include field-level errors in exception', () => {
            const invalidLead = {
                firstName: 'J', // Too short
                lastName: 'D', // Too short
                email: 'invalid',
                source: 'INVALID'
            };

            try {
                LeadValidationService.validateLeadForCreation(invalidLead);
                fail('Should have thrown');
            } catch (error) {
                expect(error.details).toBeDefined();
                expect(error.details.firstName).toBeDefined();
                expect(error.details.email).toBeDefined();
            }
        });
    });

    describe('validateStatusTransition', () => {
        it('should allow NEW_LEAD to CONTACTED', () => {
            expect(() => {
                LeadValidationService.validateStatusTransition('NEW_LEAD', 'CONTACTED');
            }).not.toThrow();
        });

        it('should allow NEW_LEAD to QUALIFIED', () => {
            expect(() => {
                LeadValidationService.validateStatusTransition('NEW_LEAD', 'QUALIFIED');
            }).not.toThrow();
        });

        it('should prevent CONVERTED to LOST', () => {
            expect(() => {
                LeadValidationService.validateStatusTransition('CONVERTED', 'LOST');
            }).toThrow();
        });

        it('should prevent LOST to QUALIFIED', () => {
            expect(() => {
                LeadValidationService.validateStatusTransition('LOST', 'QUALIFIED');
            }).toThrow();
        });

        it('should prevent CONTACTED to NEW_LEAD', () => {
            expect(() => {
                LeadValidationService.validateStatusTransition('CONTACTED', 'NEW_LEAD');
            }).toThrow();
        });
    });

    describe('validatePagination', () => {
        it('should validate correct pagination', () => {
            expect(() => {
                LeadValidationService.validatePagination(1, 10);
            }).not.toThrow();
        });

        it('should reject page less than 1', () => {
            expect(() => {
                LeadValidationService.validatePagination(0, 10);
            }).toThrow();
        });

        it('should reject limit greater than 100', () => {
            expect(() => {
                LeadValidationService.validatePagination(1, 101);
            }).toThrow();
        });
    });

    describe('validateFilters', () => {
        it('should validate valid filters', () => {
            expect(() => {
                LeadValidationService.validateFilters({
                    status: 'QUALIFIED',
                    minBudget: 100000,
                    maxBudget: 500000
                });
            }).not.toThrow();
        });

        it('should reject if minBudget > maxBudget', () => {
            expect(() => {
                LeadValidationService.validateFilters({
                    minBudget: 500000,
                    maxBudget: 100000
                });
            }).toThrow();
        });
    });
});
```

### DuplicateCheckService Tests

```javascript
const DuplicateCheckService = require('../services/DuplicateCheckService');
const { DuplicateException } = require('../exceptions');
const leadRepository = require('../repositories/LeadRepository');

// Mock the repository
jest.mock('../repositories/LeadRepository');

describe('DuplicateCheckService', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('checkDuplicateEmail', () => {
        it('should return null if no duplicate found', async () => {
            leadRepository.findOne.mockResolvedValue(null);

            const result = await DuplicateCheckService.checkDuplicateEmail(
                'unique@example.com'
            );

            expect(result).toBeNull();
        });

        it('should return existing lead if duplicate found', async () => {
            const existingLead = {
                _id: 'lead123',
                email: 'existing@example.com'
            };

            leadRepository.findOne.mockResolvedValue(existingLead);

            const result = await DuplicateCheckService.checkDuplicateEmail(
                'existing@example.com'
            );

            expect(result).toEqual(existingLead);
        });

        it('should exclude lead if excludeLeadId matches', async () => {
            const existingLead = {
                _id: 'lead123',
                email: 'existing@example.com'
            };

            leadRepository.findOne.mockResolvedValue(existingLead);

            const result = await DuplicateCheckService.checkDuplicateEmail(
                'existing@example.com',
                'lead123'
            );

            expect(result).toBeNull();
        });
    });

    describe('checkForDuplicate', () => {
        it('should throw DuplicateException if email duplicate found', async () => {
            const existingLead = {
                _id: 'lead123',
                firstName: 'John',
                lastName: 'Doe',
                email: 'john@example.com',
                source: 'WEBSITE'
            };

            leadRepository.findOne
                .mockResolvedValueOnce(existingLead) // Email check
                .mockResolvedValueOnce(null); // Phone check

            try {
                await DuplicateCheckService.checkForDuplicate(
                    'john@example.com',
                    '+1234567890'
                );
                fail('Should have thrown');
            } catch (error) {
                expect(error).toBeInstanceOf(DuplicateException);
                expect(error.existingResource).toEqual(existingLead);
            }
        });

        it('should throw DuplicateException if phone duplicate found', async () => {
            const existingLead = {
                _id: 'lead123',
                phone: '+1234567890'
            };

            leadRepository.findOne
                .mockResolvedValueOnce(null) // Email check
                .mockResolvedValueOnce(existingLead); // Phone check

            try {
                await DuplicateCheckService.checkForDuplicate(
                    'new@example.com',
                    '+1234567890'
                );
                fail('Should have thrown');
            } catch (error) {
                expect(error).toBeInstanceOf(DuplicateException);
            }
        });

        it('should return null if no duplicates found', async () => {
            leadRepository.findOne
                .mockResolvedValueOnce(null) // Email check
                .mockResolvedValueOnce(null); // Phone check

            const result = await DuplicateCheckService.checkForDuplicate(
                'unique@example.com',
                '+1234567890'
            );

            expect(result).toBeNull();
        });
    });
});
```

### AutoAssignmentService Tests

```javascript
const AutoAssignmentService = require('../services/AutoAssignmentService');
const { AutoAssignmentException } = require('../exceptions');
const employeeRepository = require('../repositories/EmployeeRepository');

jest.mock('../repositories/EmployeeRepository');

describe('AutoAssignmentService', () => {
    const mockAgents = [
        { _id: 'agent1', firstName: 'Alice', performance: { conversionRate: 45 } },
        { _id: 'agent2', firstName: 'Bob', performance: { conversionRate: 35 } },
        { _id: 'agent3', firstName: 'Charlie', performance: { conversionRate: 55 } }
    ];

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('autoAssignLead', () => {
        it('should throw AutoAssignmentException if no agents available', async () => {
            employeeRepository.findByRole.mockResolvedValue([]);

            const lead = { _id: 'lead123' };

            try {
                await AutoAssignmentService.autoAssignLead(lead);
                fail('Should have thrown');
            } catch (error) {
                expect(error).toBeInstanceOf(AutoAssignmentException);
            }
        });

        it('should assign lead using load-balanced strategy', async () => {
            employeeRepository.findByRole.mockResolvedValue(mockAgents);

            const lead = { _id: 'lead123' };
            const agent = await AutoAssignmentService.autoAssignLead(
                lead,
                AutoAssignmentService.STRATEGIES.LOAD_BALANCED
            );

            expect(agent).toBeDefined();
            expect(agent._id).toMatch(/^agent\d$/);
        });

        it('should assign lead using performance-based strategy', async () => {
            employeeRepository.findByRole.mockResolvedValue(mockAgents);

            const lead = { _id: 'lead123' };
            const agent = await AutoAssignmentService.autoAssignLead(
                lead,
                AutoAssignmentService.STRATEGIES.PERFORMANCE_BASED
            );

            // Charlie has highest conversion rate (55%)
            expect(agent._id).toBe('agent3');
        });
    });

    describe('strategies', () => {
        it('should have all required strategies', () => {
            const strategies = AutoAssignmentService.STRATEGIES;

            expect(strategies.LOAD_BALANCED).toBeDefined();
            expect(strategies.PERFORMANCE_BASED).toBeDefined();
            expect(strategies.SKILL_BASED).toBeDefined();
            expect(strategies.ROUND_ROBIN).toBeDefined();
            expect(strategies.AVAILABILITY_BASED).toBeDefined();
        });
    });
});
```

---

## Integration Tests

### LeadService Integration Tests

```javascript
const LeadService = require('../services/LeadService_Complete');
const leadRepository = require('../repositories/LeadRepository');
const AutoAssignmentService = require('../services/AutoAssignmentService');

// Mock repositories
jest.mock('../repositories/LeadRepository');
jest.mock('../services/AutoAssignmentService');

describe('LeadService Integration', () => {
    const mockLeadData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        source: 'WEBSITE'
    };

    const mockCreatedLead = {
        _id: 'lead123',
        ...mockLeadData,
        status: 'NEW_LEAD',
        assignedTo: null
    };

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('createLead', () => {
        it('should create lead and auto-assign agent', async () => {
            const mockAgent = {
                _id: 'agent123',
                firstName: 'Alice',
                lastName: 'Agent'
            };

            leadRepository.createLead.mockResolvedValue(mockCreatedLead);
            leadRepository.updateLead.mockResolvedValue({
                ...mockCreatedLead,
                assignedTo: mockAgent
            });
            AutoAssignmentService.autoAssignLead.mockResolvedValue(mockAgent);

            const lead = await LeadService.createLead(mockLeadData, 'user123');

            expect(leadRepository.createLead).toHaveBeenCalledWith(mockLeadData, 'user123');
            expect(AutoAssignmentService.autoAssignLead).toHaveBeenCalled();
        });

        it('should handle auto-assignment failure gracefully', async () => {
            leadRepository.createLead.mockResolvedValue(mockCreatedLead);
            AutoAssignmentService.autoAssignLead.mockRejectedValue(
                new Error('No agents available')
            );

            const lead = await LeadService.createLead(
                mockLeadData,
                'user123',
                { autoAssign: true }
            );

            // Lead should be created even if assignment fails
            expect(leadRepository.createLead).toHaveBeenCalled();
            expect(lead).toBeDefined();
        });
    });

    describe('updateLeadStatus', () => {
        it('should validate and update status', async () => {
            const updatedLead = {
                ...mockCreatedLead,
                status: 'CONTACTED'
            };

            leadRepository.getLeadById.mockResolvedValue(mockCreatedLead);
            leadRepository.updateLead.mockResolvedValue(updatedLead);

            const result = await LeadService.updateLeadStatus(
                'lead123',
                'CONTACTED',
                'user123'
            );

            expect(result.status).toBe('CONTACTED');
            expect(leadRepository.updateLead).toHaveBeenCalled();
        });

        it('should reject invalid status transition', async () => {
            leadRepository.getLeadById.mockResolvedValue({
                ...mockCreatedLead,
                status: 'CONVERTED'
            });

            try {
                await LeadService.updateLeadStatus('lead123', 'LOST', 'user123');
                fail('Should have thrown');
            } catch (error) {
                expect(error).toBeDefined();
            }
        });
    });

    describe('convertLead', () => {
        it('should convert lead with validation', async () => {
            const qualifiedLead = {
                ...mockCreatedLead,
                status: 'QUALIFIED',
                assignedTo: 'agent123'
            };

            const convertedLead = {
                ...qualifiedLead,
                status: 'CONVERTED',
                conversionValue: 500000
            };

            leadRepository.getLeadById.mockResolvedValue(qualifiedLead);
            leadRepository.updateLead.mockResolvedValue(convertedLead);

            const result = await LeadService.convertLead(
                'lead123',
                500000,
                'user123'
            );

            expect(result.status).toBe('CONVERTED');
            expect(result.conversionValue).toBe(500000);
        });

        it('should reject invalid conversion value', async () => {
            leadRepository.getLeadById.mockResolvedValue(mockCreatedLead);

            try {
                await LeadService.convertLead('lead123', -100, 'user123');
                fail('Should have thrown');
            } catch (error) {
                expect(error).toBeDefined();
            }
        });
    });
});
```

---

## E2E Test Example

```javascript
const request = require('supertest');
const app = require('../server'); // Express app
const Lead = require('../models/Lead');
const Employee = require('../models/Employee');

describe('Lead Management E2E', () => {
    let createdLeadId;
    let agentId;

    beforeAll(async () => {
        // Create test agent
        const agent = await Employee.create({
            firstName: 'Test',
            lastName: 'Agent',
            email: 'agent@test.com',
            phone: '+1234567890',
            password: 'password123',
            role: 'SENIOR_AGENT'
        });
        agentId = agent._id;
    });

    afterAll(async () => {
        // Cleanup
        await Lead.deleteMany({});
        await Employee.deleteMany({});
    });

    test('Full lead lifecycle', async () => {
        // Create lead
        let response = await request(app)
            .post('/api/leads')
            .send({
                firstName: 'Jane',
                lastName: 'Smith',
                email: 'jane@test.com',
                phone: '+9876543210',
                source: 'WEBSITE'
            })
            .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('_id');
        createdLeadId = response.body.data._id;

        // Update status
        response = await request(app)
            .patch(`/api/leads/${createdLeadId}/status`)
            .send({ status: 'CONTACTED' })
            .expect(200);

        expect(response.body.data.status).toBe('CONTACTED');

        // Convert lead
        response = await request(app)
            .post(`/api/leads/${createdLeadId}/convert`)
            .send({ value: 300000 })
            .expect(200);

        expect(response.body.data.status).toBe('CONVERTED');
        expect(response.body.data.conversionValue).toBe(300000);
    });
});
```

---

## Test Execution

### Run All Tests
```bash
npm test
```

### Run Specific Test Suite
```bash
npm test -- LeadValidationService.test.js
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

## Coverage Goals

| Layer | Target | Current |
|-------|--------|---------|
| LeadValidationService | 95% | |
| DuplicateCheckService | 95% | |
| AutoAssignmentService | 90% | |
| LeadService | 85% | |
| Overall | 85% | |

---

## Test Data Fixtures

**fixtures/leads.js:**
```javascript
module.exports = {
    validLead: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        source: 'WEBSITE'
    },
    highPriorityLead: {
        firstName: 'Jane',
        lastName: 'Executive',
        email: 'jane@exec.com',
        phone: '+9876543210',
        source: 'REFERRAL',
        priority: 'CRITICAL',
        budget: 1000000
    }
};
```

---

## Troubleshooting Tests

### Mock Not Working
- Ensure mock is defined before imports
- Clear mocks between tests with `jest.clearAllMocks()`

### Async Tests Timing Out
- Increase timeout: `jest.setTimeout(10000)`
- Check for unresolved promises

### Database State Issues
- Use `beforeEach`/`afterEach` for isolation
- Clear collections between tests

---

**Next Steps:**
1. Create test files alongside each service
2. Aim for 85%+ coverage
3. Run tests in CI/CD pipeline
4. Monitor test performance
