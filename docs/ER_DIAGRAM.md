# Lead Management Module - Complete ER Diagram

## Entity Relationship Diagram (Text Format)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                     LEAD MANAGEMENT SYSTEM - ER DIAGRAM                       │
│                        (Smart Real Estate CRM)                                │
└──────────────────────────────────────────────────────────────────────────────┘


                              ┌─────────────────────┐
                              │  LEAD_STATUSES      │
                              │   (Master Data)     │
                              ├─────────────────────┤
                              │ _id (PK)            │
                              │ name*               │
                              │ code* (unique)      │
                              │ description         │
                              │ color               │
                              │ stage               │
                              │ order               │
                              │ isActive            │
                              │ createdAt           │
                              │ updatedAt           │
                              └─────────────────────┘
                                      ▲
                                      │ 1
                                      │ status
                                      │
                              ┌───────┴──────────────────────────────────┐
                              │                                           │
                    ┌─────────────────────┐                              │
                    │  LEAD_SOURCES       │                              │
                    │   (Master Data)     │                              │
                    ├─────────────────────┤                              │
                    │ _id (PK)            │                              │
                    │ name* (unique)      │                              │
                    │ code* (unique)      │                              │
                    │ description         │                              │
                    │ channel             │                              │
                    │ costPerLead         │                              │
                    │ conversionRate      │                              │
                    │ isActive            │                              │
                    │ createdAt           │                              │
                    │ updatedAt           │                              │
                    └─────────────────────┘                              │
                            ▲                                            │
                            │ 1                                          │
                            │ source                                     │
                            │                                            │
                    ┌───────────────────────────────────────────────────┐│
                    │                                                   ││
            ┌───────────────────────────────────────────────┐           ││
            │                                               │           ││
     ┌──────────────────────────────────────────────────────┴───────┐   ││
     │                                                              │   ││
┌────────────────────────────────────────────────────────────────────┴──┴┐
│                           LEADS (CORE)                                 │
├─────────────────────────────────────────────────────────────────────────┤
│ _id (PK)                 │ firstName* (indexed)                        │
│ lastName* (indexed)      │ email* (unique, indexed)                   │
│ phone* (unique, indexed) │ alternatePhone                             │
│ status* (FK) ──────────────────────────┐                            │
│ source* (FK) ─────────────────────────┐│                            │
│ priority (indexed)       │ assignedTo (FK) ──────────┐               │
│ assignedAt               │ propertyType[] (array)    │               │
│ budgetMin                │ budgetMax                 │               │
│ location[] (array)       │ areaPreference[] (array)  │               │
│ preferredContactMethod   │ communicationOptIn        │               │
│ company (FK) ──────────────────────────┐             │               │
│ notes                    │ tags[] (array)            │               │
│ createdBy (FK) ──────────┐             │             │               │
│ createdAt (indexed)      │ updatedAt                 │               │
│ isDeleted (indexed)      │ deletedAt                 │               │
│ conversionStatus         │ convertedAt               │               │
│ convertedValue           │                           │               │
└──────────────────────────┬───────────────────────────┼───────┬───────┘
                           │                           │       │
                           │ 1 (createdBy)           │ 1     │ 1 (assignedTo)
                           │                           │       │
                    ┌──────┴──────────┐                │       │
                    │                 │                │       │
                    │        ┌────────┼────────────────┼─────────────┐
                    │        │        │                │             │
        ┌───────────────────────────────────────────────────────────────┐
        │                       EMPLOYEES                                │
        ├────────────────────────────────────────────────────────────────┤
        │ _id (PK)                                                       │
        │ firstName*            │ lastName*                              │
        │ email* (unique)       │ phone*                                 │
        │ role* (JUNIOR_AGENT, SENIOR_AGENT, MANAGER, DIRECTOR, ADMIN)  │
        │ department            │ company (FK) ─────┐                   │
        │ specializations[]     │ isActive          │                   │
        │ totalLeadsAssigned    │ totalLeadsConverted                    │
        │ conversionRate        │ createdAt         │                   │
        │ updatedAt             │                   │                   │
        └───────────────────────┬───────────────────┼───────────────────┘
                                │                   │
                                │ 1 (company)       │
                                │                   │
                        ┌───────────────────────────┤
                        │                           │
                ┌───────────────────────────────────┴─────────────┐
                │                                                 │
            ┌────────────────────────────────────────────────────────┐
            │                    COMPANIES                            │
            ├─────────────────────────────────────────────────────────┤
            │ _id (PK)          │ name* (unique)                      │
            │ email             │ phone                               │
            │ address {         │                                     │
            │   street,         │   city,                             │
            │   state,          │   zipCode,                          │
            │   country,        │   coordinates {lat, lng}            │
            │ }                 │                                     │
            │ registrationNumber (unique)                            │
            │ industry          │ totalEmployees                      │
            │ isActive          │ createdAt                           │
            │ updatedAt         │                                     │
            └────────────────────────────────────────────────────────┘


            ┌──────────────────────────────────────────┐
            │      LEAD_ACTIVITIES (Transaction)        │
            ├──────────────────────────────────────────┤
            │ _id (PK)          │ lead* (FK, indexed)  │
            │ activityType*     │ title*               │
            │ (CALL, EMAIL,     │ description          │
            │  MEETING, etc)    │                      │
            │ scheduledDate     │ completedDate        │
            │ status            │ outcome              │
            │ nextSteps         │ createdBy (FK)       │
            │ relatedTo (FK)    │ priority             │
            │ attachments[]     │ createdAt (indexed)  │
            │ updatedAt         │                      │
            └──────────────────────────────────────────┘
                    ▲                       ▲
                    │ N                     │ N
                    │ lead                  │ createdBy
                    │                       │
                    │ 1                     │ 1
         ┌──────────┴─────────────┬─────────┴──────────┐
         │                        │                    │
         │ (from LEADS)          │ (from EMPLOYEES)   │
         │                        │                    │


            ┌──────────────────────────────────────────────┐
            │    LEAD_ASSIGNMENTS (Transaction/Audit)       │
            ├──────────────────────────────────────────────┤
            │ _id (PK)           │ lead* (FK, indexed)   │
            │ assignedBy* (FK)   │ assignedTo* (FK)      │
            │ (from EMPLOYEES)   │ (from EMPLOYEES)      │
            │ assignmentDate*    │ reassignmentReason    │
            │ (indexed)          │ followUpStatus        │
            │ assignmentStatus   │ notes                 │
            │ isActive           │ createdAt (indexed)   │
            │ updatedAt          │                       │
            └──────────────────────────────────────────────┘
                    ▲                       ▲       ▲
                    │ N                     │ N     │ N
                    │ lead              assignedBy assignedTo
                    │                       │       │
                    │ 1                     │ 1     │ 1
         ┌──────────┴───────────────────────┴───────┴──────────┐
         │                                                      │
         │ (from LEADS)                                        │
         │ (from EMPLOYEES - twice)                            │


            ┌──────────────────────────────────────────────┐
            │     LEAD_FOLLOWUPS (Transaction)              │
            ├──────────────────────────────────────────────┤
            │ _id (PK)            │ lead* (FK, indexed)    │
            │ assignedTo* (FK)    │ scheduledDate* (indexed)│
            │ (from EMPLOYEES)    │                        │
            │ title*              │ description            │
            │ status              │ completedDate          │
            │ completedNotes      │ reminderSet            │
            │ reminderTime        │ createdBy (FK)         │
            │ (in minutes)        │ (from EMPLOYEES)       │
            │ createdAt           │ updatedAt              │
            └──────────────────────────────────────────────┘
                    ▲                       ▲       ▲
                    │ N                     │ N     │ N
                    │ lead              assignedTo createdBy
                    │                       │       │
                    │ 1                     │ 1     │ 1
         ┌──────────┴───────────────────────┴───────┴──────────┐
         │                                                      │
         │ (from LEADS)                                        │
         │ (from EMPLOYEES - twice)                            │


═══════════════════════════════════════════════════════════════════════════════

## RELATIONSHIP SUMMARY

1:N Relationships:
  • LEADS (1) ─── (N) LEAD_ACTIVITIES
  • LEADS (1) ─── (N) LEAD_ASSIGNMENTS  
  • LEADS (1) ─── (N) LEAD_FOLLOWUPS
  • EMPLOYEES (1) ─── (N) LEAD_ACTIVITIES (as createdBy)
  • EMPLOYEES (1) ─── (N) LEAD_ASSIGNMENTS (as assignedBy)
  • EMPLOYEES (1) ─── (N) LEAD_ASSIGNMENTS (as assignedTo)
  • EMPLOYEES (1) ─── (N) LEAD_FOLLOWUPS (as assignedTo)
  • EMPLOYEES (1) ─── (N) LEAD_FOLLOWUPS (as createdBy)
  • COMPANIES (1) ─── (N) EMPLOYEES

1:1 Relationships:
  • LEADS (1) ─── (1) LEAD_STATUSES
  • LEADS (1) ─── (1) LEAD_SOURCES
  • LEADS (1) ─── (1) EMPLOYEES (as assignedTo)
  • LEADS (1) ─── (1) COMPANIES
  • LEADS (1) ─── (1) EMPLOYEES (as createdBy)
  • EMPLOYEES (1) ─── (1) COMPANIES

═══════════════════════════════════════════════════════════════════════════════

## CARDINALITY NOTATION

In the diagrams:
  ─── = relationship
  1   = one record
  N   = multiple records
  ▲   = direction of relationship
  │   = connection line

═══════════════════════════════════════════════════════════════════════════════

## JUNCTION/BRIDGE TABLES

No traditional junction tables needed. Relationships are:
  • Direct Foreign Keys for 1:1 relationships
  • Array fields for some 1:N relationships (propertyType, tags, attachments)
  • Separate collections for complex transactions

═══════════════════════════════════════════════════════════════════════════════

## DATA FLOW

New Lead Workflow:
  1. Create Lead → Links to LEAD_STATUS, LEAD_SOURCE, COMPANY
  2. Assign Lead → Creates LEAD_ASSIGNMENT record → Links to EMPLOYEES
  3. Log Activity → Creates LEAD_ACTIVITY record → Links to EMPLOYEE (createdBy)
  4. Schedule Follow-up → Creates LEAD_FOLLOWUP record → Links to EMPLOYEE (assignedTo)
  5. Update Status → Modifies LEAD status and creates LEAD_ACTIVITY

═══════════════════════════════════════════════════════════════════════════════

## INDEXES

Primary (Unique):
  ✓ LEADS.email
  ✓ LEADS.phone
  ✓ LEAD_STATUSES.code
  ✓ LEAD_SOURCES.code
  ✓ EMPLOYEES.email
  ✓ COMPANIES.name
  ✓ COMPANIES.registrationNumber

Performance (Non-unique):
  ✓ LEADS.status + isDeleted
  ✓ LEADS.assignedTo + isDeleted
  ✓ LEADS.priority + isDeleted
  ✓ LEADS.createdAt (descending)
  ✓ LEADS.firstName + lastName (text index)
  ✓ LEAD_ACTIVITIES.lead + createdAt
  ✓ LEAD_ASSIGNMENTS.assignedTo + assignmentDate
  ✓ LEAD_FOLLOWUPS.scheduledDate + status

═══════════════════════════════════════════════════════════════════════════════

## LEGEND

*     = Required field
PK    = Primary Key
FK    = Foreign Key
N     = Multiple records
1     = Single record
[]    = Array field
{}    = Embedded document
()    = Referenced collection

═══════════════════════════════════════════════════════════════════════════════
```

## Simplified View - Core Relationships

```
                      ┌─────────────────┐
                      │   EMPLOYEES     │
                      └────────┬────────┘
                               │
                    ┌──────────┼──────────┐
                    │          │          │
            assignedTo    createdBy   assignedBy
                    │          │          │
         ┌──────────▼──────────▼──────────▼────────┐
         │                                         │
    ┌────┴──────────────┐       ┌─────────────────┴──────┐
    │     LEADS         │       │  LEAD_ACTIVITIES       │
    │                   │       │                        │
    │ • status ─────────┼───┐   │ • log(calls, emails)   │
    │ • source ─────────┼──┐│   │ • log(meetings, etc)   │
    │ • priority        │  ││   │ • track outcomes       │
    │ • assignedTo ─────┘  ││   │                        │
    │                      ││   └────────────────────────┘
    │                      ││
    ├─────────────────────┘│
    │                      │
    │   ┌──────────────────┤
    │   │ ┌────────────────┤
    │   │ │ ┌──────────────────────────────┐
    │   │ │ │                              │
    └───┼─┼─┼──────────────────────────────┴────────┐
        │ │ │                                       │
        │ │ │   LEAD_SOURCES ◄─ (source)          │
        │ │ │   LEAD_STATUSES ◄─ (status)         │
        │ │ │   COMPANIES ◄─ (company)            │
        │ │ │                                       │
        │ │ └──────────────────────────────────────┘
        │ │
        │ └─ LEAD_ASSIGNMENTS (assignment history)
        │
        └─ LEAD_FOLLOWUPS (scheduled tasks)
```

---

## Collection Statistics

| Collection | Purpose | Typical Size |
|-----------|---------|--------------|
| LEADS | Core data | 10-100K+ records |
| LEAD_ACTIVITIES | Transaction log | 100K-1M+ records |
| LEAD_ASSIGNMENTS | Audit trail | 10K-100K+ records |
| LEAD_FOLLOWUPS | Future tasks | 1K-10K active |
| EMPLOYEES | Reference | 10-1K records |
| LEAD_STATUSES | Master data | 5-10 records |
| LEAD_SOURCES | Master data | 5-10 records |
| COMPANIES | Reference | 1-100 records |

---

## Query Patterns

```
Single Lead Retrieval:
  LEADS ←→ LEAD_STATUSES, LEAD_SOURCES, EMPLOYEES, COMPANIES

Lead Timeline:
  LEADS → LEAD_ACTIVITIES → EMPLOYEES
        → LEAD_ASSIGNMENTS → EMPLOYEES
        → LEAD_FOLLOWUPS → EMPLOYEES

Employee Dashboard:
  EMPLOYEES ← LEADS (assigned)
           ← LEAD_ACTIVITIES (created)
           ← LEAD_ASSIGNMENTS (assigned/by)
           ← LEAD_FOLLOWUPS (assigned/created)

Analytics:
  LEADS → LEAD_SOURCES (conversion by source)
       → LEAD_ASSIGNMENTS → EMPLOYEES (performance)
       → LEAD_ACTIVITIES (activity trends)
```
