// src/concepts/Task/TaskConcept.ts
import {
  completeTask,
  createTask,
  deleteTask,
  editTask,
  listTasks,
  Task,
  Tasks,
} from "./task.ts";
import { suggestTaskOrder } from "../../utils/gemini.ts";

export default class TaskConcept {
  db: any;

  constructor(db: any) {
    this.db = db;
  }

  /** --- INCLUSION OPERATIONS --- */

  async createTask(body: {
    ownerId: string;
    title: string;
    description?: string;
    dueDate?: string;
    estimatedTime?: number;
  }): Promise<Task> {
    const { ownerId, title, description, dueDate, estimatedTime } = body;

    const taskId = await createTask(
      this.db,
      ownerId,
      title,
      description,
      dueDate ? new Date(dueDate) : undefined,
      estimatedTime,
    );

    const newTask = Tasks.get(taskId);
    if (!newTask) throw new Error(`Task ${taskId} not found after creation`);

    // NOTE: under Option A we do not call Requesting.request here.
    // If you still want a side-effect notification, do it via a sync.

    return newTask;
  }

  async editTask(body: {
    taskId: string;
    title?: string;
    description?: string;
    dueDate?: string;
    estimatedTime?: number;
  }): Promise<{ success: boolean }> {
    const { taskId, title, description, dueDate, estimatedTime } = body;

    await editTask(
      this.db,
      taskId,
      title,
      description,
      dueDate ? new Date(dueDate) : undefined,
      estimatedTime,
    );

    return { success: true };
  }

  async listTasks(body: { ownerId: string }): Promise<Task[]> {
    const { ownerId } = body;
    const tasks = await listTasks(this.db, ownerId);
    return tasks;
  }

  async suggestTaskOrder(body: { tasks: Task[] }) {
    const { tasks } = body;
    if (!Array.isArray(tasks) || tasks.length === 0) {
      throw new Error("No tasks provided");
    }

    const tasksForAI = tasks.map((t) => {
      const dueDateStr = t.dueDate instanceof Date
        ? t.dueDate.toISOString().split("T")[0]
        : t.dueDate ?? null;

      return {
        taskId: t.taskId,
        title: t.title,
        description: t.description ?? null,
        dueDate: dueDateStr,
        estimatedTime: t.estimatedTime,
      };
    });

    const orderedTaskIds: string[] = await suggestTaskOrder(tasksForAI);

    if (
      !orderedTaskIds || !Array.isArray(orderedTaskIds) ||
      orderedTaskIds.length === 0
    ) {
      throw new Error("Gemini returned no valid order");
    }

    return { orderedTaskIds };
  }

  /** --- EXCLUSION OPERATIONS ---
   *
   * These are excluded from passthrough and handled via Requesting + syncs.
   * They must accept only the logical action inputs and return a result.
   */

  async completeTask(body: { taskId: string; actualTime: number }) {
    const { taskId, actualTime } = body;

    // Call the core completeTask function which updates DB and triggers async leaderboard updates
    try {
      const result = await completeTask(this.db, taskId, actualTime);
      // Return the result to the sync which will call Requesting.respond
      return result;
    } catch (err) {
      // bubble up a structured error so the sync can respond appropriately
      const message = err instanceof Error ? err.message : "Unknown error";
      return { success: false, error: message };
    }
  }

  async deleteTask(body: { taskId: string }) {
    const { taskId } = body;

    try {
      await deleteTask(this.db, taskId);
      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      return { success: false, error: message };
    }
  }
}
