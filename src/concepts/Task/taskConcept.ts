// src/concepts/task/taskConcept.ts
import {
  completeTask as completeTaskFn,
  createTask as createTaskFn,
  deleteTask as deleteTaskFn,
  editTask as editTaskFn,
  listTasks as listTasksFn,
  Task,
  Tasks,
} from "../Task/task.ts";

export default class TaskConcept {
  db: any;

  constructor(db: any) {
    this.db = db;
  }

  /**
   * Create a new task and return the full object
   */
  async createTask(body: {
    ownerId: string;
    title: string;
    description?: string;
    dueDate?: string;
    estimatedTime?: number;
  }): Promise<Task> {
    const { ownerId, title, description, dueDate, estimatedTime } = body;

    console.log("Creating task for owner:", ownerId);

    const taskId = createTaskFn(
      ownerId,
      title,
      description,
      dueDate ? new Date(dueDate) : undefined,
      estimatedTime,
    );

    const newTask = Tasks.get(taskId);
    if (!newTask) throw new Error(`Task ${taskId} not found after creation`);

    console.log("Created task with ID:", taskId);
    return newTask;
  }

  /**
   * Edit an existing task
   */
  async editTask(body: {
    taskId: string;
    title?: string;
    description?: string;
    dueDate?: string;
    estimatedTime?: number;
  }): Promise<{ success: boolean }> {
    const { taskId, title, description, dueDate, estimatedTime } = body;

    console.log("Editing task:", taskId);

    if (!Tasks.has(taskId)) throw new Error(`Task ${taskId} does not exist`);

    editTaskFn(
      taskId,
      title,
      description,
      dueDate ? new Date(dueDate) : undefined,
      estimatedTime,
    );

    return { success: true };
  }

  /**
   * Complete a task
   */
  async completeTask(body: {
    taskId: string;
    actualTime: number;
  }): Promise<{ success: boolean }> {
    const { taskId, actualTime } = body;

    console.log("Completing task:", taskId, "with actualTime:", actualTime);

    if (!Tasks.has(taskId)) throw new Error(`Task ${taskId} does not exist`);

    completeTaskFn(taskId, actualTime);
    return { success: true };
  }

  /**
   * Delete a task
   */
  async deleteTask(body: { taskId: string }): Promise<{ success: boolean }> {
    const { taskId } = body;

    console.log("Deleting task:", taskId);

    if (!Tasks.has(taskId)) throw new Error(`Task ${taskId} does not exist`);

    deleteTaskFn(taskId);
    return { success: true };
  }

  /**
   * List tasks for a user
   */
  async listTasks(body: { ownerId: string }): Promise<Task[]> {
    const { ownerId } = body;

    console.log("Listing tasks for owner:", ownerId);

    const tasks = listTasksFn(ownerId) || [];
    return tasks; // Always return an array
  }
}
