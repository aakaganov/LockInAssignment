Purpose : Block distractions until key tasks are completed. Users must finish
specified tasks before accessing certain apps.

Principle : Productivity before entertainment: completing tasks unlocks access.

State : Users: a set of userId: String tasks: Set<Task> completedTasks:
Set<Task> appsLocked: Boolean

Task: taskId: String description: String

Actions:

addUser(userId: String) Requires: userId ∉ Users Effects: Creates user with no
tasks and appsLocked = false.

addTask(userId: String, task: Task) Requires: userId ∈ Users, task.taskId ∉
tasks[userId] Effects: Adds task to tasks[userId] and sets appsLocked = true.

markDone(userId: String, taskId: String) Requires: userId ∈ Users, taskId ∈
tasks[userId] Effects: Adds taskId to completedTasks[userId].

unlockApps(userId: String) Requires:userId ∈ Users, ∀ t ∈ tasks[userId], t ∈
completedTasks[userId] Effects: Sets appsLocked = false.
