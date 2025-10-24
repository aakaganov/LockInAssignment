# API Specification: Account Concept

**Purpose:** Manage user identities and basic profile information.

---

## API Endpoints

### POST /api/account/addUser

**Description:** Adds a new user to the system.

**Requirements:**
- `userId` must not already exist in Users

**Effects:**
- Adds a new user with provided `userId`, `name`, and `email`

**Request Body:**
```json
{
  "userId": "string",
  "name": "string",
  "email": "string"
}
Success Response Body:

json
Copy code
{}
Error Response Body:

json
Copy code
{
  "error": "string"
}
POST /api/account/getUser
Description: Retrieves information about a user.

Requirements:

userId must exist in Users

Effects:

Returns name and email of the user

Request Body:

json
Copy code
{
  "userId": "string"
}
Success Response Body:

json
Copy code
{
  "name": "string",
  "email": "string"
}
Error Response Body:

json
Copy code
{
  "error": "string"
}
POST /api/account/deleteUser
Description: Deletes a user from the system.

Requirements:

userId must exist in Users

Effects:

Removes the user from Users

Request Body:

json
Copy code
{
  "userId": "string"
}
Success Response Body:

json
Copy code
{}
Error Response Body:

json
Copy code
{
  "error": "string"
}
API Specification: ConfirmTask Concept
Purpose: Enable peer confirmation of task completion.

API Endpoints
POST /api/confirmTask/requestConfirmation
Description: Requests confirmation for a completed task.

Requirements:

Task must exist and have status = completed

Effects:

Creates a pending confirmation for the task

Request Body:

json
Copy code
{
  "taskId": "string",
  "requestedBy": "string"
}
Success Response Body:

json
Copy code
{}
Error Response Body:

json
Copy code
{
  "error": "string"
}
POST /api/confirmTask/confirmTask
Description: Adds a peer confirmation for a task.

Requirements:

Confirmation must exist for the taskId

Effects:

Adds peerId to confirmedBy

Request Body:

json
Copy code
{
  "taskId": "string",
  "peerId": "string"
}
Success Response Body:

json
Copy code
{}
Error Response Body:

json
Copy code
{
  "error": "string"
}
POST /api/confirmTask/finalizeConfirmation
Description: Finalizes a task confirmation.

Requirements:

confirmedBy must not be empty

Effects:

Sets confirmation status to verified

Request Body:

json
Copy code
{
  "taskId": "string"
}
Success Response Body:

json
Copy code
{}
Error Response Body:

json
Copy code
{
  "error": "string"
}
POST /api/confirmTask/getConfirmations
Description: Lists confirmations requested by a user.

Requirements:

None

Effects:

Returns all confirmations requested by userId

Request Body:

json
Copy code
{
  "userId": "string"
}
Success Response Body (Query):

json
Copy code
[
  {
    "taskId": "string",
    "requestedBy": "string",
    "confirmedBy": ["string"],
    "status": "pending|verified"
  }
]
Error Response Body:

json
Copy code
{
  "error": "string"
}
API Specification: FriendGroup Concept
Purpose: Form accountability groups between users.

API Endpoints
POST /api/friendGroup/createGroup
Description: Creates a new accountability group.

Requirements:

groupId must not already exist

Effects:

Creates group with empty member list

Request Body:

json
Copy code
{
  "groupId": "string",
  "name": "string",
  "requiresConfirmation": true
}
Success Response Body:

json
Copy code
{}
Error Response Body:

json
Copy code
{
  "error": "string"
}
POST /api/friendGroup/addMember
Description: Adds a user to a group.

Requirements:

groupId must exist

Effects:

Adds userId to the group's members

Request Body:

json
Copy code
{
  "groupId": "string",
  "userId": "string"
}
Success Response Body:

json
Copy code
{}
Error Response Body:

json
Copy code
{
  "error": "string"
}
POST /api/friendGroup/removeMember
Description: Removes a user from a group.

Requirements:

userId must be a member of groupId

Effects:

Removes user from members

Request Body:

json
Copy code
{
  "groupId": "string",
  "userId": "string"
}
Success Response Body:

json
Copy code
{}
Error Response Body:

json
Copy code
{
  "error": "string"
}
POST /api/friendGroup/listGroups
Description: Lists all groups a user belongs to.

Requirements:

None

Effects:

Returns group IDs for the user

Request Body:

json
Copy code
{
  "userId": "string"
}
Success Response Body (Query):

json
Copy code
[
  {
    "groupId": "string"
  }
]
Error Response Body:

json
Copy code
{
  "error": "string"
}
POST /api/friendGroup/setConfirmationPolicy
Description: Updates confirmation requirement for tasks in a group.

Requirements:

groupId must exist

Effects:

Sets requiresConfirmation for the group

Request Body:

json
Copy code
{
  "groupId": "string",
  "requiresConfirmation": true
}
Success Response Body:

json
Copy code
{}
Error Response Body:

json
Copy code
{
  "error": "string"
}
API Specification: Leaderboard Concept
Purpose: Provide friendly competition based on productivity.

API Endpoints
POST /api/leaderboard/recordCompletion
Description: Records completion stats for a user in a group.

Requirements:

groupId must exist

userId must belong to the group

actualTime > 0

Effects:

If group requires confirmation, increments stats only if task was confirmed

Updates completedCount and completedMinutes for the user

Request Body:

json
Copy code
{
  "userId": "string",
  "actualTime": 0,
  "groupId": "string"
}
Success Response Body:

json
Copy code
{}
Error Response Body:

json
Copy code
{
  "error": "string"
}
POST /api/leaderboard/getLeaderboardByTasks
Description: Returns leaderboard ranking by completed task count.

Requirements:

groupId must exist

Effects:

Returns sorted list of users by completedCount

Request Body:

json
Copy code
{
  "groupId": "string"
}
Success Response Body (Query):

json
Copy code
[
  {
    "userId": "string",
    "completedCount": 0
  }
]
Error Response Body:

json
Copy code
{
  "error": "string"
}
POST /api/leaderboard/getLeaderboardByTime
Description: Returns leaderboard ranking by total completed time.

Requirements:

groupId must exist

Effects:

Returns sorted list of users by total hours completed

Request Body:

json
Copy code
{
  "groupId": "string"
}
Success Response Body (Query):

json
Copy code
[
  {
    "userId": "string",
    "completedHours": 0
  }
]
Error Response Body:

json
Copy code
{
  "error": "string"
}
POST /api/leaderboard/resetWeeklyStats
Description: Resets weekly stats for all groups.

Requirements:

Must be start of a new week

Effects:

Resets completedCount and completedMinutes for all users

Updates weekStart to current week

Request Body:

json
Copy code
{}
Success Response Body:

json
Copy code
{}
Error Response Body:

json
Copy code
{
  "error": "string"
}
API Specification: Task Concept
Purpose: Allow users to create and manage to-do tasks with time estimation.

API Endpoints
POST /api/task/createTask
Description: Creates a new task.

Requirements:

ownerId must exist

estimatedTime > 0

Effects:

Adds new task with status = pending and estimatedTime set

Request Body:

json
Copy code
{
  "ownerId": "string",
  "title": "string",
  "description": "string",
```markdown
  "dueDate": "string (ISO 8601) or null",
  "estimatedTime": 0
}
Success Response Body:

json
Copy code
{}
Error Response Body:

json
Copy code
{
  "error": "string"
}
POST /api/task/editTask
Description: Edits an existing task.

Requirements:

taskId must exist in Tasks

Effects:

Updates provided fields for the task

Request Body:

json
Copy code
{
  "taskId": "string",
  "title": "string (optional)",
  "description": "string (optional)",
  "dueDate": "string (ISO 8601) or null (optional)",
  "estimatedTime": 0 (optional)
}
Success Response Body:

json
Copy code
{}
Error Response Body:

json
Copy code
{
  "error": "string"
}
POST /api/task/completeTask
Description: Marks a task as completed.

Requirements:

taskId must exist

Task status must be pending

actualTime > 0

Effects:

Sets task status to completed and records actualTime

Request Body:

json
Copy code
{
  "taskId": "string",
  "actualTime": 0
}
Success Response Body:

json
Copy code
{}
Error Response Body:

json
Copy code
{
  "error": "string"
}
POST /api/task/deleteTask
Description: Deletes a task.

Requirements:

taskId must exist

Effects:

Removes task from Tasks

Request Body:

json
Copy code
{
  "taskId": "string"
}
Success Response Body:

json
Copy code
{}
Error Response Body:

json
Copy code
{
  "error": "string"
}
POST /api/task/listTasks
Description: Lists all tasks for a user.

Requirements:

ownerId must exist

Effects:

Returns all tasks owned by the user

Request Body:

json
Copy code
{
  "ownerId": "string"
}
Success Response Body (Query):

json
Copy code
[
  {
    "taskId": "string",
    "ownerId": "string",
    "title": "string",
    "description": "string",
    "dueDate": "string (ISO 8601) or null",
    "estimatedTime": 0,
    "actualTime": 0 or null,
    "status": "pending|completed",
    "createdAt": "string (ISO 8601)"
  }
]
Error Response Body:

json
Copy code
{
  "error": "string"
}
POST /api/task/suggestTaskOrder
Description: Suggests an optimal order to complete pending tasks (AI Feature).

Requirements:

ownerId must exist

Effects:

Returns pending tasks ordered by recommended completion sequence

Earliest due date first

Shortest estimated time next

Optionally considers other prioritization factors (priority, energy levels)

Request Body:

json
Copy code
{
  "ownerId": "string"
}
Success Response Body (Query):

json
Copy code
[
  {
    "taskId": "string",
    "ownerId": "string",
    "title": "string",
    "description": "string",
    "dueDate": "string (ISO 8601) or null",
    "estimatedTime": 0,
    "status": "pending",
    "createdAt": "string (ISO 8601)"
  }
]
Error Response Body:

json
Copy code
{
  "error": "string"
}