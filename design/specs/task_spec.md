Purpose: Allow users to create and manage to-do tasks with time estimation.
Principle: Tasks improve productivity when users can estimate and reflect on time spent.

State:
Tasks: a set of
 taskId: String
 ownerId: String
 title: String
 description: String
 dueDate: Date?
 estimatedTime: Number (in minutes)
 actualTime: Number? (in minutes)
 status: Enum { "pending", "completed" }
 createdAt: Date

Actions:

createTask(ownerId: String, title: String, description: String?, dueDate: Date?, estimatedTime: Number)
  Requires: ownerId exists, estimatedTime > 0
  Effects: Adds new task with status = pending and estimatedTime set

editTask(taskId: String, title?: String, description?: String, dueDate?: Date, estimatedTime?: Number)
  Requires: taskId ∈ Tasks
  Effects: Updates provided fields

completeTask(taskId: String, actualTime: Number)
  Requires: taskId ∈ Tasks, status = pending, actualTime > 0
  Effects: Sets status = completed and stores actualTime

deleteTask(taskId: String)
  Requires: taskId ∈ Tasks
  Effects: Removes task

listTasks(ownerId: String) → Set<Task>
  Requires: ownerId exists
  Effects: Returns all tasks for ownerId

suggestTaskOrder(ownerId: String) → List<Task> (AI Feature)
  Requires: ownerId exists
  Effects: Returns pending tasks ordered by recommended completion sequence, taking into account:
    Earliest due date first
    Shortest estimated time next
    Can optionally consider other prioritization factors (e.g., priority, energy levels)