export type TaskStatus = "pending" | "completed";

export interface Task {
  taskId: string;
  ownerId: string;
  title: string;
  description?: string;
  dueDate?: Date;
  estimatedTime: number; // in minutes
  actualTime?: number; // in minutes
  status: TaskStatus;
  createdAt: Date;
}

// In-memory task store
export const Tasks = new Map<string, Task>();

// Utility to generate simple unique IDs
function generateId(): string {
  return crypto.randomUUID();
}

/**
 * Create a new task
 */
export function createTask(
  ownerId: string,
  title: string,
  description?: string,
  dueDate?: Date,
  estimatedTime?: number,
): string {
  if (!ownerId) throw new Error("ownerId is required");
  if (!estimatedTime || estimatedTime <= 0) {
    throw new Error("estimatedTime must be > 0");
  }

  const taskId = generateId();
  const newTask: Task = {
    taskId,
    ownerId,
    title,
    description,
    dueDate,
    estimatedTime,
    status: "pending",
    createdAt: new Date(),
  };

  Tasks.set(taskId, newTask);
  return taskId;
}

/**
 * Edit an existing task
 */
export function editTask(
  taskId: string,
  title?: string,
  description?: string,
  dueDate?: Date,
  estimatedTime?: number,
) {
  const task = Tasks.get(taskId);
  if (!task) throw new Error(`Task ${taskId} does not exist`);

  if (title !== undefined) task.title = title;
  if (description !== undefined) task.description = description;
  if (dueDate !== undefined) task.dueDate = dueDate;
  if (estimatedTime !== undefined) {
    if (estimatedTime <= 0) throw new Error("estimatedTime must be > 0");
    task.estimatedTime = estimatedTime;
  }

  Tasks.set(taskId, task);
}

/**
 * Complete a task and record actual time
 */
export function completeTask(taskId: string, actualTime: number) {
  const task = Tasks.get(taskId);
  if (!task) throw new Error(`Task ${taskId} does not exist`);
  if (task.status !== "pending") {
    throw new Error(`Task ${taskId} is already completed`);
  }
  if (actualTime <= 0) throw new Error("actualTime must be > 0");

  task.status = "completed";
  task.actualTime = actualTime;

  Tasks.set(taskId, task);
}

/**
 * Delete a task
 */
export function deleteTask(taskId: string) {
  if (!Tasks.has(taskId)) throw new Error(`Task ${taskId} does not exist`);
  Tasks.delete(taskId);
}

/**
 * List all tasks for a given owner
 */
export function listTasks(ownerId: string): Task[] {
  return Array.from(Tasks.values()).filter((t) => t.ownerId === ownerId);
}
