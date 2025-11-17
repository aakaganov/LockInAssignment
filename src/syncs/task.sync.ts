import { actions, Sync } from "@engine";
import { Requesting, Task } from "@concepts";
import * as TaskConcept from "../concepts/Task/task.ts"; // adjust path if needed
import type { Db } from "npm:mongodb";

/**
 * --- CREATE TASK ---
 */
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

export const CreateTaskResponse: Sync = ({ request, taskId }) => ({
  when: actions(
    [Requesting.request, { path: "/api/Task/createTask" }, { request }],
    [CreateTaskRequest, {}, { taskId }],
  ),
  then: actions([Requesting.respond, { request, taskId }]),
});

/**
 * --- EDIT TASK ---
 */
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

export const EditTaskResponse: Sync = ({ request }) => ({
  when: actions(
    [Requesting.request, { path: "/api/Task/editTask" }, { request }],
    [EditTaskRequest, {}, { request }],
  ),
  then: actions([Requesting.respond, { request, success: true }]),
});

/**
 * --- COMPLETE TASK ---
 */
export const CompleteTaskRequest: Sync = ({ request, taskId, actualTime }) => ({
  when: actions([
    Requesting.request,
    { path: "/api/Task/completeTask", taskId, actualTime },
    { request },
  ]),
  then: actions([Task.completeTask, {
    taskId,
    actualTime,
  }]),
});

export const CompleteTaskResponse: Sync = ({ request, ...result }) => ({
  when: actions(
    [Requesting.request, { path: "/api/Task/completeTask" }, { request }],
    [CompleteTaskRequest, {}, { ...result }],
  ),
  then: actions([Requesting.respond, { request, ...result }]),
});

/**
 * --- DELETE TASK ---
 */
export const DeleteTaskRequest: Sync = ({ request, taskId }) => ({
  when: actions([
    Requesting.request,
    { path: "/api/Task/deleteTask", taskId },
    { request },
  ]),
  then: actions([Task.deleteTask, {
    taskId,
  }]),
});

export const DeleteTaskResponse: Sync = ({ request }) => ({
  when: actions(
    [Requesting.request, { path: "/api/Task/deleteTask" }, { request }],
    [DeleteTaskRequest, {}, { request }],
  ),
  then: actions([Requesting.respond, { request, success: true }]),
});
