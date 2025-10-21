// -----------------------------------------------------------
// Concept: TaskGate
// Purpose: Block distractions until key tasks are completed
// Principle: Productivity before entertainment: completing tasks unlocks access
// -----------------------------------------------------------

export interface Task {
  taskId: string;
  description: string;
}

export interface User {
  userId: string;
  tasks: Map<string, Task>;
  completedTasks: Set<string>;
  appsLocked: boolean;
}

const users = new Map<string, User>();

// ----- Actions -----

/**
 * addUser(userId: string)
 * Requires: userId not already in Users
 * Effects: Creates user with no tasks and appsLocked = false
 */
export function addUser(userId: string): void {
  if (users.has(userId)) {
    throw new Error(`User ${userId} already exists.`);
  }
  users.set(userId, {
    userId,
    tasks: new Map(),
    completedTasks: new Set(),
    appsLocked: false,
  });
  console.log(`[TaskGate] Added user ${userId}`);
}

/**
 * addTask(userId: string, task: Task)
 * Requires: user exists, taskId not already in user's tasks
 * Effects: Adds task and sets appsLocked = true
 */
export function addTask(userId: string, task: Task): void {
  const user = users.get(userId);
  if (!user) throw new Error(`User ${userId} does not exist.`);
  if (user.tasks.has(task.taskId)) {
    throw new Error(`Task ${task.taskId} already exists for user ${userId}`);
  }
  user.tasks.set(task.taskId, task);
  user.appsLocked = true;
  console.log(
    `[TaskGate] Added task ${task.taskId} for ${userId}. Apps are now locked.`,
  );
}

/**
 * markDone(userId: string, taskId: string)
 * Requires: user exists, taskId exists in user's tasks
 * Effects: Adds taskId to completedTasks
 */
export function markDone(userId: string, taskId: string): void {
  const user = users.get(userId);
  if (!user) throw new Error(`User ${userId} does not exist.`);
  if (!user.tasks.has(taskId)) {
    throw new Error(`Task ${taskId} does not exist for user ${userId}`);
  }
  user.completedTasks.add(taskId);
  console.log(`[TaskGate] Task ${taskId} marked done for ${userId}`);
}

/**
 * unlockApps(userId: string)
 * Requires: user exists, all tasks completed
 * Effects: Sets appsLocked = false
 */
export function unlockApps(userId: string): void {
  const user = users.get(userId);
  if (!user) throw new Error(`User ${userId} does not exist.`);

  const allDone = Array.from(user.tasks.keys()).every((taskId) =>
    user.completedTasks.has(taskId)
  );
  if (!allDone) {
    throw new Error(
      `[TaskGate] Cannot unlock apps for ${userId}. Not all tasks completed.`,
    );
  }
  user.appsLocked = false;
  console.log(`[TaskGate] Apps unlocked for ${userId}`);
}

// ----- Queries -----

export function getUser(userId: string): User | undefined {
  return users.get(userId);
}

export function listUsers(): User[] {
  return Array.from(users.values());
}

// ----- Demo -----
if (import.meta.main) {
  addUser("alice");

  addTask("alice", { taskId: "t1", description: "Write report" });
  addTask("alice", { taskId: "t2", description: "Review emails" });

  markDone("alice", "t1");
  try {
    unlockApps("alice"); // will fail because t2 not done
  } catch (e) {
    if (e instanceof Error) {
      console.error(e.message);
    } else {
      console.error(e);
    }
  }

  markDone("alice", "t2");
  unlockApps("alice"); // success
}
