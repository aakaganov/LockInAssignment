/**
 * Task synchronizations for excluded routes
 */

import { actions, Sync } from "@engine";
import { Requesting, Task } from "@concepts";

/** --- CREATE TASK --- */
export const CreateTaskRequest: Sync = (
  { request, ownerId, title, description, dueDate, estimatedTime },
) => ({
  when: actions([
    Requesting.request,
    {
      path: "/api/Task/createTask",
      ownerId,
      title,
      description,
      dueDate,
      estimatedTime,
    },
    { request },
  ]),
  then: actions([Task.createTask, {
    ownerId,
    title,
    description,
    dueDate,
    estimatedTime,
  }]),
});

export const CreateTaskResponse: Sync = ({ request, task }) => ({
  when: actions(
    [Requesting.request, { path: "/api/Task/createTask" }, { request }],
    [Task.createTask, {}, { task }],
  ),
  then: actions([Requesting.respond, { request, task }]),
});

/** --- EDIT TASK --- */
export const EditTaskRequest: Sync = (
  { request, taskId, title, description, dueDate, estimatedTime },
) => ({
  when: actions([
    Requesting.request,
    {
      path: "/api/Task/editTask",
      taskId,
      title,
      description,
      dueDate,
      estimatedTime,
    },
    { request },
  ]),
  then: actions([Task.editTask, {
    taskId,
    title,
    description,
    dueDate,
    estimatedTime,
  }]),
});

export const EditTaskResponse: Sync = ({ request, success }) => ({
  when: actions(
    [Requesting.request, { path: "/api/Task/editTask" }, { request }],
    [Task.editTask, {}, { success }],
  ),
  then: actions([Requesting.respond, { request, success }]),
});

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
