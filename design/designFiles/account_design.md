# User Account
## Operational Principle Test Flow
- **Purpose:** Manage user identities and basic profile information
- **Operational Principle:** 
  1. Add user
  2. Retrieve user information
  3. Delete user
## Interesting Scenarios / Edge Cases
- Adding duplicate users
- Deleting non-existent users
- Retrieving deleted users


## Observations / Design Notes
- Users are uniquely identified by `userId`
- Simple in-memory map allows fast lookups
- A user can be in multiple groups
- the confirmation requirement for tasks is based on friend group not user


## 8. Incremental Changes / Snapshots
### OVERALL CHANGE
I made a huge pivot in my project due to my inital idea being out of scope for this class. Now instead of the project being screentime based, it is to do list based. I kept a lot of the similar features. 
### User Account
- Initial implementation: addUser/getUser/deleteUser
- Snapshot 1: Basic operational tests passed
- Snapshot 2: Added error handling for duplicates

### Task
- Snapshot 1: CreateTask implemented
- Snapshot 2: Added editTask and completeTask
- Snapshot 3: Added deleteTask and listTasks

### Friend Group
- Snapshot 1: createGroup and addMember
- Snapshot 2: removeMember and listGroups
- Snapshot 3: setConfirmationPolicy
- Changes: Made peer confirmation required based on friend group, not user. This way all members of a group are on the same playing field. 

### Confirm Task
- Snapshot 1: requestConfirmation
- Snapshot 2: confirmTask
- Snapshot 3: finalizeConfirmation and getConfirmations
- Changes: Made it optional so this is only required in friend groups who selected

### Leaderboard
- Snapshot 1: recordCompletion
- Snapshot 2: getLeaderboardByTasks and getLeaderboardByTime
- Snapshot 3: resetWeeklyStats
- Changes: Made it so that if a friend group required confirmation from peers, updates to tasks and minutes completed would only be added if confirmed by a peer

