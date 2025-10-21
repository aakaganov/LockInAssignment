# Task
## Operational Principle Test Flow
- **Purpose:** Allow users to create and manage to-do tasks with time estimation
- **Operational Principle:** 
  1. Create a task
  2. Edit task fields
  3. Complete task
  4. Delete task
  5. List tasks for a user
  6. AI feature : Lists tasks for user in the order they should complete them(based upon estimated time, due date, and description)

## Interesting Scenarios / Edge Cases
- Completing a task that does not exist
- Editing a task with invalid estimatedTime
- Listing tasks when no tasks exist
- Creating tasks with optional dueDate or description

## Observations / Design Notes
- `taskId` generated with `crypto.randomUUID()`
- ActualTime stored only after completion
- Tasks isolated per ownerId
- The AI feature is not implemented yet