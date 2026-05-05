# BugPilot — Demo Seed Guide

## What the seed creates

A complete set of connected demo data representing a realistic BugPilot workflow.

| Entity | Count | Notes |
|--------|-------|-------|
| Users | 4 | find-or-create — never overwrites existing passwords |
| Bugs | 5 | all reported by the Customer user (Joe Nasr) |
| Comments | 7 | across 4 bugs, authored by Customer, Tester, Admin, and Developer |
| User Stories | 5 | no `createdBy` field on Story model |
| Tasks | 6 | linked to bugs and stories, assigned to Developer and Tester |
| Attachments | 3 | placeholder metadata linked to bugs |
| Activity logs | 10 | BUG_CREATED, BUG_ASSIGNED, BUG_STATUS_CHANGED, COMMENT_ADDED, ATTACHMENT_UPLOADED |

## Running the seed

```bash
cd server
npm run seed:demo
```

Safe to run multiple times — idempotent. Duplicate records are never created.

## Test credentials

| Role | Email | Password |
|------|-------|----------|
| TESTER | mohamedhammad3.142@gmail.com | `12345678` |
| CUSTOMER | joenasr@gmail.com | `Joe12345678` |
| ADMIN | admin@test.com | `12345678` |
| DEVELOPER | devlead@test.com | `DevLead12345678` |

> **Note:** If these users already exist in the database, their passwords are **not** changed.
> Only their role is corrected if it does not match the expected value.

## Expected role behaviour

### CUSTOMER (Joe Nasr)
- Reports bugs through the UI
- Uploads screenshot attachments to bugs
- Adds comments on his own reported bugs
- Cannot assign bugs or change engineering status

### TESTER (Mohamed Hammad)
- Triages and reproduces customer-reported bugs
- Adds QA reproduction notes as comments
- Assigns bugs to the developer
- Reviews fixed/verified status changes

### ADMIN (Demo Admin)
- Created the user stories in this seed
- Adds priority/planning comments on critical bugs
- Manages the overall workflow and escalations

### DEVELOPER (Demo Dev Lead)
- Receives assigned bugs and tasks
- Comments on implementation approach
- Moves bugs from ASSIGNED → IN_PROGRESS
- Marks tasks as DONE when complete

## Demo scenario

A simulated sprint for BugPilot itself:

1. **Customer (Joe)** reports 5 realistic bugs he found in the app.
2. **Tester (Mohamed)** triages them, adds reproduction steps, assigns critical ones.
3. **Admin** adds planning comments and defines user stories for the backlog.
4. **Developer (Dev Lead)** picks up assigned bugs, updates status, and fixes them.
5. **Activity log** captures all major workflow events for the audit trail.

## Schema constraints to be aware of

- `Comment` is linked to a `Bug` only (no polymorphic story/task support in current schema)
- `Attachment` is linked to a `Bug` only
- `Story` and `Task` have no `createdBy` field
- `Activity.action` is a free string — no enum constraint
- `Task.status` is a free string — no enum constraint

## Warning

This is **demo / test data only**.  
Do not use these credentials in a production environment.  
Rotate all test passwords before going live.
