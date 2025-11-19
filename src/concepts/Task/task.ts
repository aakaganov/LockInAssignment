import { Db } from "npm:mongodb";
import { updateLeaderboardsForUser } from "../Leaderboard/leaderboard.ts";
import LeaderboardConcept from "../Leaderboard/LeaderboardConcept.ts";

export type TaskStatus = "pending" | "completed" | "confirmed";

export interface Task {
  taskId: string;
  ownerId: string;
  title: string;
  description?: string;
  dueDate?: Date;
  estimatedTime: number;
  actualTime?: number;
  status: TaskStatus;
  createdAt: Date;
  hiddenFromDashboard?: boolean;
}

// In-memory task store (still used for fast lookups)
export const Tasks = new Map<string, Task>();

// Utility to generate simple unique IDs
function generateId(): string {
  return crypto.randomUUID();
}

/**
 * Create a new task (now saves to Mongo as well)
 */
export async function createTask(
  db: Db,
  ownerId: string,
  title: string,
  description?: string,
  dueDate?: Date,
  estimatedTime?: number,
): Promise<string> {
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
  await db.collection<Task>("tasks").insertOne(newTask); // ✅ persist
  return taskId;
}

/**
 * Edit an existing task
 */
export async function editTask(
  db: Db,
  taskId: string,
  title?: string,
  description?: string,
  dueDate?: Date,
  estimatedTime?: number,
) {
  const task = Tasks.get(taskId) ||
    (await db.collection<Task>("tasks").findOne({ taskId }));

  if (!task) throw new Error(`Task ${taskId} does not exist`);

  if (title !== undefined) task.title = title;
  if (description !== undefined) task.description = description;
  if (dueDate !== undefined) task.dueDate = dueDate;
  if (estimatedTime !== undefined) {
    if (estimatedTime <= 0) throw new Error("estimatedTime must be > 0");
    task.estimatedTime = estimatedTime;
  }

  Tasks.set(taskId, task);
  await db.collection<Task>("tasks").updateOne({ taskId }, { $set: task });
}

export async function completeTask(db: Db, taskId: string, actualTime: number) {
  if (!actualTime || actualTime <= 0) {
    throw new Error("actualTime is required and must be > 0");
  }

  // Always fetch from DB to avoid _id issues
  const taskFromDb = await db.collection<Task>("tasks").findOne({ taskId });
  if (!taskFromDb) throw new Error(`Task ${taskId} does not exist`);
  if (taskFromDb.status !== "pending") {
    throw new Error(`Task ${taskId} is already completed`);
  }

  // Update DB
  await db.collection<Task>("tasks").updateOne(
    { taskId },
    { $set: { actualTime, status: "completed" as TaskStatus } },
  );

  // Update user stats
  await db.collection("users").updateOne(
    { userId: taskFromDb.ownerId },
    { $inc: { tasksCompleted: 1, minutesCompleted: actualTime } },
  );

  // Update in-memory cache without _id
  const { _id, ...taskWithoutId } = taskFromDb;
  const updatedTask: Task = {
    ...taskWithoutId,
    actualTime,
    status: "completed" as TaskStatus,
  };
  Tasks.set(taskId, updatedTask);

  // Background leaderboard updates
  (async () => {
    try {
      const userGroups = await db.collection("groups").find({
        members: taskFromDb.ownerId,
      }).toArray();
      const leaderboard = new LeaderboardConcept(db);

      await Promise.all(userGroups.map(async (group) => {
        const confirmedFlag = !group.confirmationRequired;
        await leaderboard.recordCompletion({
          userId: taskFromDb.ownerId,
          actualTime,
          groupId: group.groupId,
          confirmed: confirmedFlag,
        });

        const [rankedByTask, rankedByTime] = await Promise.all([
          leaderboard.getLeaderboardByTasks({ groupId: group.groupId }),
          leaderboard.getLeaderboardByTime({ groupId: group.groupId }),
        ]);

        await db.collection("groups").updateOne(
          { groupId: group.groupId },
          {
            $set: {
              rankedByTask: rankedByTask.leaderboard,
              rankedByTime: rankedByTime.leaderboard,
            },
          },
        );
      }));

      await updateLeaderboardsForUser(db, taskFromDb.ownerId);
    } catch (err) {
      console.error("Error updating leaderboards:", err);
    }
  })();

  return { success: true };
}

/**
 * Delete a task
 */
export async function deleteTask(db: Db, taskId: string) {
  if (!Tasks.has(taskId)) {
    const task = await db.collection<Task>("tasks").findOne({ taskId });
    if (!task) throw new Error(`Task ${taskId} does not exist`);
  }

  Tasks.delete(taskId);
  await db.collection<Task>("tasks").deleteOne({ taskId });
}

/**
 * List all tasks for a given owner
 */
export async function listTasks(db: Db, ownerId: string): Promise<Task[]> {
  const tasks = await db.collection<Task>("tasks").find({ ownerId }).toArray();
  tasks.forEach((t) => Tasks.set(t.taskId, t)); // sync in-memory cache
  return tasks.filter((t) => !t.hiddenFromDashboard);
}

export async function hideCompletedTasks(db: Db) {
  await db.collection<Task>("tasks").updateMany(
    {
      status: { $in: ["completed", "confirmed"] },
      hiddenFromDashboard: { $ne: true },
    },
    { $set: { hiddenFromDashboard: true } },
  );
}
