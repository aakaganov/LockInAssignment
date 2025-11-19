// src/syncs/task.sync.ts
import { actions, Sync } from "@engine";
import { Requesting, Task } from "@concepts";

/**
 * NOTE:
 * - Use the instrumented actions exported by @concepts (Task.completeTask, Task.deleteTask etc.)
 * - Only include Delete and Complete task functionality.
 */

/** --- COMPLETE TASK --- */
export const CompleteTaskRequest: Sync = ({ request, taskId, actualTime }) => ({
  when: actions([
    Requesting.request,
    { path: "/api/Task/completeTask", taskId, actualTime },
    { request },
  ]),
  then: actions([Task.completeTask, { taskId, actualTime }]),
});

export const CompleteTaskResponse: Sync = ({ request, success, groups }) => ({
  when: actions(
    [Requesting.request, { path: "/api/Task/completeTask" }, { request }],
    [Task.completeTask, {}, { success, groups }],
  ),
  then: actions([Requesting.respond, { request, success, groups }]),
});

/** --- DELETE TASK --- */
export const DeleteTaskRequest: Sync = ({ request, taskId }) => ({
  when: actions([
    Requesting.request,
    { path: "/api/Task/deleteTask", taskId },
    { request },
  ]),
  then: actions([Task.deleteTask, { taskId }]),
});

export const DeleteTaskResponse: Sync = ({ request, success }) => ({
  when: actions(
    [Requesting.request, { path: "/api/Task/deleteTask" }, { request }],
    [Task.deleteTask, {}, { success }],
  ),
  then: actions([Requesting.respond, { request, success }]),
});
