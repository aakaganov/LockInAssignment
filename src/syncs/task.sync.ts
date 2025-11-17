import { actions, Sync } from "@engine";
import { Requesting } from "@concepts";
import TaskConceptClass from "../concepts/Task/TaskConcept.ts";

/** --- Helper wrappers for sync actions --- */
declare global {
  var db: import("npm:mongodb").Db;
}

async function createTaskAction(payload: any) {
  const taskConcept = new TaskConceptClass(globalThis.db);
  const task = await taskConcept.createTask(payload);
  return { task };
}

async function editTaskAction(payload: any) {
  const taskConcept = new TaskConceptClass(globalThis.db);
  const result = await taskConcept.editTask(payload);
  return result;
}

async function completeTaskAction(payload: any) {
  const taskConcept = new TaskConceptClass(globalThis.db);
  const result = await taskConcept.completeTask(payload);
  return result;
}

async function deleteTaskAction(payload: any) {
  const taskConcept = new TaskConceptClass(globalThis.db);
  const result = await taskConcept.deleteTask(payload);
  return result;
}

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
  then: actions([createTaskAction, {
    ownerId,
    title,
    description,
    dueDate,
    estimatedTime,
  }]),
});

export const CreateTaskResponse: Sync = ({ request, task }) => ({
  when: actions([
    Requesting.request,
    { path: "/api/Task/createTask" },
    { request },
  ]),
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
  then: actions([editTaskAction, {
    taskId,
    title,
    description,
    dueDate,
    estimatedTime,
  }]),
});

export const EditTaskResponse: Sync = ({ request, success }) => ({
  when: actions([
    Requesting.request,
    { path: "/api/Task/editTask" },
    { request },
  ]),
  then: actions([Requesting.respond, { request, success }]),
});

/** --- COMPLETE TASK --- */
export const CompleteTaskRequest: Sync = ({ request, taskId, actualTime }) => ({
  when: actions([
    Requesting.request,
    { path: "/api/Task/completeTask", taskId, actualTime },
    { request },
  ]),
  then: actions([completeTaskAction, { taskId, actualTime }]),
});

export const CompleteTaskResponse: Sync = ({ request, success, groups }) => ({
  when: actions([
    Requesting.request,
    { path: "/api/Task/completeTask" },
    { request },
  ]),
  then: actions([Requesting.respond, { request, success, groups }]),
});

/** --- DELETE TASK --- */
export const DeleteTaskRequest: Sync = ({ request, taskId }) => ({
  when: actions([
    Requesting.request,
    { path: "/api/Task/deleteTask", taskId },
    { request },
  ]),
  then: actions([deleteTaskAction, { taskId }]),
});

export const DeleteTaskResponse: Sync = ({ request, success }) => ({
  when: actions([
    Requesting.request,
    { path: "/api/Task/deleteTask" },
    { request },
  ]),
  then: actions([Requesting.respond, { request, success }]),
});
