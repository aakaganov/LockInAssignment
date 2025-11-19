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
  requesting: any;

  constructor(db: any, requesting: any) {
    this.db = db;
    this.requesting = requesting;
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

    if (this.requesting) {
      await this.requesting.request({
        path: "/Task/createTask",
        taskId,
        ownerId,
        title,
      });
    }

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

  /** --- EXCLUSION OPERATIONS --- */

  async completeTask(
    body: { taskId: string; actualTime: number; requestId: string },
  ) {
    const { taskId, actualTime, requestId } = body;

    try {
      const result = await completeTask(this.db, taskId, actualTime);
      await this.requesting.respond({ request: requestId, success: true });
      return { success: true, result };
    } catch (err) {
      await this.requesting.respond({
        request: requestId,
        success: false,
        error: err instanceof Error ? err.message : "Unknown error",
      });
      return {
        success: false,
        error: err instanceof Error ? err.message : "Unknown error",
      };
    }
  }

  async deleteTask(body: { taskId: string; requestId: string }) {
    const { taskId, requestId } = body;

    try {
      await deleteTask(this.db, taskId);
      await this.requesting.respond({ request: requestId, success: true });
      return { success: true };
    } catch (err) {
      await this.requesting.respond({
        request: requestId,
        success: false,
        error: err instanceof Error ? err.message : "Unknown error",
      });
      return {
        success: false,
        error: err instanceof Error ? err.message : "Unknown error",
      };
    }
  }
}
