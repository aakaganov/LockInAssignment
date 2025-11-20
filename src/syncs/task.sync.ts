// src/syncs/task.sync.ts
import { actions, Sync } from "@engine";
import { Requesting, Task } from "@concepts";

/**
 * NOTE:
 * - Use the instrumented actions exported by @concepts (Task.completeTask, Task.deleteTask etc.)
 * - Paths used here must match the `path` stored by Requesting.request (which is the request
 *   URL with REQUESTING_BASE_URL stripped). With REQUESTING_BASE_URL="/api", Requesting stores
 *   paths like "/Task/completeTask" (no "/api" prefix). So syncs must match "/Task/..."
 */

/** --- COMPLETE TASK --- */
export const CompleteTaskRequest: Sync = ({ request, taskId, actualTime }) => ({
  when: actions([
    // Requesting.request will be called with path: "/Task/completeTask"
    Requesting.request,
    { path: "/Task/completeTask", taskId, actualTime },
    { request },
  ]),
  then: actions([Task.completeTask, { taskId, actualTime }]),
});

export const CompleteTaskResponse: Sync = ({ request, success, error }) => ({
  when: actions(
    [Requesting.request, { path: "/Task/completeTask" }, { request }],
    // Task.completeTask emits a result; capture its output variables (success/error)
    [Task.completeTask, {}, { success, error }],
  ),
  then: actions([Requesting.respond, { request, success, error }]),
});

/** --- DELETE TASK --- */
export const DeleteTaskRequest: Sync = ({ request, taskId }) => ({
  when: actions([
    Requesting.request,
    { path: "/Task/deleteTask", taskId },
    { request },
  ]),
  then: actions([Task.deleteTask, { taskId }]),
});

export const DeleteTaskResponse: Sync = ({ request, success, error }) => ({
  when: actions(
    [Requesting.request, { path: "/Task/deleteTask" }, { request }],
    [Task.deleteTask, {}, { success, error }],
  ),
  then: actions([Requesting.respond, { request, success, error }]),
});
