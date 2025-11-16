import { Db } from "npm:mongodb";
import LeaderboardConcept from "../Leaderboard/LeaderboardConcept.ts";

import { updateLeaderboardsForUser } from "../Leaderboard/leaderboard.ts";

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

/**
 * Complete a task and record actual time
 */
export async function completeTask(db: Db, taskId: string, actualTime: number) {
  if (!actualTime || actualTime <= 0) {
    throw new Error("actualTime is required and must be greater than 0");
  }
  const task = Tasks.get(taskId) ||
    (await db.collection<Task>("tasks").findOne({ taskId }));

  if (!task) throw new Error(`Task ${taskId} does not exist`);
  if (task.status !== "pending") {
    throw new Error(`Task ${taskId} is already completed`);
  }
  if (actualTime <= 0) throw new Error("actualTime must be > 0");
  task.actualTime = actualTime;
  task.status = "completed";
  await db.collection("users").updateOne(
    { userId: task.ownerId },
    {
      $inc: {
        tasksCompleted: 1,
        minutesCompleted: task.actualTime,
      },
    },
  );

  Tasks.set(taskId, task);
  await db.collection<Task>("tasks").updateOne({ taskId }, { $set: task });
  const userGroups = await db.collection("groups").find({
    members: task.ownerId,
  }).toArray();
  const leaderboard = new LeaderboardConcept(db);
  //const updatedGroups: any[] = [];
  // Parallel update for all groups
  const updatedGroups = await Promise.all(
    userGroups.map(async (group) => {
      const confirmedFlag = !group.confirmationRequired;

      // Record completion (still awaited per group)
      await leaderboard.recordCompletion({
        userId: task.ownerId,
        actualTime: task.actualTime!,
        groupId: group.groupId,
        confirmed: confirmedFlag,
      });

      // Fetch leaderboards in parallel
      const [rankedByTask, rankedByTime] = await Promise.all([
        leaderboard.getLeaderboardByTasks({ groupId: group.groupId }),
        leaderboard.getLeaderboardByTime({ groupId: group.groupId }),
      ]);

      // Update DB
      await db.collection("groups").updateOne(
        { groupId: group.groupId },
        {
          $set: {
            rankedByTask: rankedByTask.leaderboard,
            rankedByTime: rankedByTime.leaderboard,
          },
        },
      );

      return {
        groupId: group.groupId,
        rankedByTask: rankedByTask.leaderboard,
        rankedByTime: rankedByTime.leaderboard,
      };
    }),
  );

  /**

  for (const group of userGroups) {
    const confirmedFlag = !group.confirmationRequired; // true for non-confirmation groups
    await leaderboard.recordCompletion({
      userId: task.ownerId,
      actualTime: task.actualTime!,
      groupId: group.groupId,
      confirmed: confirmedFlag,
    });
    const rankedByTask = await leaderboard.getLeaderboardByTasks({
      groupId: group.groupId,
    });
    const rankedByTime = await leaderboard.getLeaderboardByTime({
      groupId: group.groupId,
    });

    await db.collection("groups").updateOne(
      { groupId: group.groupId },
      {
        $set: {
          rankedByTask: rankedByTask.leaderboard,
          rankedByTime: rankedByTime.leaderboard,
        },
      },
    );
    updatedGroups.push({
      groupId: group.groupId,
      rankedByTask: rankedByTask.leaderboard,
      rankedByTime: rankedByTime.leaderboard,
    });

    await updateLeaderboardsForUser(db, task.ownerId);
    return {
      success: true,
      groups: updatedGroups,
    };
  }
     */
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
