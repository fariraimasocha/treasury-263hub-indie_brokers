## Route Structure Summary

1. **Department Routes**

1. GET /api/departments - List all departments
2. POST /api/departments - Create a new department



2. **User Routes**

1. GET /api/users - List all users
2. POST /api/users - Create a new user



3. **Budget Routes**

1. GET /api/budgets - List budgets (filterable by department, year, quarter, and status)
2. POST /api/budgets - Create a new budget
3. POST /api/budgets/[id]/approve - Approve a budget
4. POST /api/budgets/[id]/reject - Reject a budget



4. **Fund Request Routes**

1. GET /api/requests - List fund requests (filterable by department, status, year, and quarter)
2. POST /api/requests - Create a new fund request
3. GET /api/requests/[id] - Get a specific fund request
4. PUT /api/requests/[id] - Update a fund request
5. DELETE /api/requests/[id] - Delete a fund request (only if in draft status)
6. POST /api/requests/[id]/approve - Approve a fund request
7. POST /api/requests/[id]/reject - Reject a fund request
8. POST /api/requests/[id]/payout - payout funds for an approved request



5. **payout Routes**

1. GET /api/payouts - List payouts (filterable by request ID)
2. POST /api/payouts/[id]/settle - Settle a payout



6. **Settlement Routes**

1. GET /api/settlements - List settlements (filterable by request ID and payout ID)