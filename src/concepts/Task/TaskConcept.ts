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

  async createTask(body: {
    ownerId: string;
    title: string;
    description?: string;
    dueDate?: string;
    estimatedTime?: number;
  }): Promise<Task> {
    const { ownerId, title, description, dueDate, estimatedTime } = body;
    console.log("Creating task for owner:", ownerId);

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
    console.log("Created task with ID:", taskId);
    if (this.requesting) {
      // Example: notify other systems that a task was created
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
    console.log("Editing task:", taskId);

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
  async suggestTaskOrder(body: { tasks: Task[] }) {
    const { tasks } = body;

    if (!Array.isArray(tasks) || tasks.length === 0) {
      throw new Error("No tasks provided");
    }

    // Convert tasks to the expected format
    const tasksForAI = tasks.map((t) => {
      let dueDateStr: string | null = null;
      if (t.dueDate) {
        const dueDateObj = t.dueDate instanceof Date
          ? t.dueDate
          : new Date(t.dueDate);
        dueDateStr = isNaN(dueDateObj.getTime())
          ? null
          : dueDateObj.toISOString().split("T")[0];
      }

      return {
        taskId: t.taskId,
        title: t.title,
        description: t.description ?? null, // ✅ replace undefined with null
        dueDate: dueDateStr,
        estimatedTime: t.estimatedTime,
      };
    });

    console.log("Sending tasks to Gemini:", tasksForAI);
    // Call Gemini wrapper
    try {
      const orderedTaskIds: string[] = await suggestTaskOrder(tasksForAI);
      console.log("Ordered Task IDs from Gemini:", orderedTaskIds);
      if (
        !orderedTaskIds || !Array.isArray(orderedTaskIds) ||
        orderedTaskIds.length === 0
      ) {
        throw new Error("Gemini returned no valid order");
      }
      return { orderedTaskIds };
    } catch (err) {
      console.error("Error in suggestTaskOrder:", err);
      throw new Error("No order returned");
    }
  }

  async completeTask(
    body: { taskId: string; actualTime: number; requestId: string },
  ) {
    const { taskId, actualTime, requestId } = body;
    console.log("Completing task:", taskId, "with actualTime:", actualTime);

    try {
      // Call the core completeTask function
      const result = await completeTask(this.db, taskId, actualTime);

      // Respond to the requesting server
      await this.requesting.respond({ request: requestId, success: true });

      return { success: true, result };
    } catch (err) {
      console.error("Error completing task:", taskId, err);

      // Respond with failure so front-end doesn't hang
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
    console.log("Deleting task:", taskId);
    await deleteTask(this.db, taskId);
    await this.requesting.respond({ request: requestId, success: true });
    return { success: true };
  }

  async listTasks(body: { ownerId: string }) {
    const { ownerId } = body;
    const tasks = await listTasks(this.db, ownerId);
    return tasks;
  }
}
