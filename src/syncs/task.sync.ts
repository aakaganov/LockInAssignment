// task.sync.ts
import { actions, Sync } from "@engine";
import { Requesting } from "@concepts";
import TaskConcept from "/Users/annakaganov/LockInAssignment/src/concepts/Task/TaskConcept.ts";

/**
 * Create an instance of TaskConcept.
 * Make sure your concept server injects `db` when constructing this.
 */
let taskConcept: TaskConcept;

export function setTaskConceptInstance(instance: TaskConcept) {
  taskConcept = instance;
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
  then: actions([taskConcept.createTask.bind(taskConcept), {
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
    [taskConcept.createTask.bind(taskConcept), {}, { task }],
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
  then: actions([taskConcept.editTask.bind(taskConcept), {
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
    [taskConcept.editTask.bind(taskConcept), {}, { success }],
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
  then: actions([taskConcept.completeTask.bind(taskConcept), {
    taskId,
    actualTime,
  }]),
});

export const CompleteTaskResponse: Sync = ({ request, success, groups }) => ({
  when: actions(
    [Requesting.request, { path: "/api/Task/completeTask" }, { request }],
    [taskConcept.completeTask.bind(taskConcept), {}, { success, groups }],
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
  then: actions([taskConcept.deleteTask.bind(taskConcept), { taskId }]),
});

export const DeleteTaskResponse: Sync = ({ request, success }) => ({
  when: actions(
    [Requesting.request, { path: "/api/Task/deleteTask" }, { request }],
    [taskConcept.deleteTask.bind(taskConcept), {}, { success }],
  ),
  then: actions([Requesting.respond, { request, success }]),
});

/** --- LIST TASKS --- */
export const ListTasksRequest: Sync = ({ request, ownerId }) => ({
  when: actions([
    Requesting.request,
    { path: "/api/Task/listTasks", ownerId },
    { request },
  ]),
  then: actions([taskConcept.listTasks.bind(taskConcept), { ownerId }]),
});

export const ListTasksResponse: Sync = ({ request, tasks }) => ({
  when: actions(
    [Requesting.request, { path: "/api/Task/listTasks" }, { request }],
    [taskConcept.listTasks.bind(taskConcept), {}, { tasks }],
  ),
  then: actions([Requesting.respond, { request, tasks }]),
});

/** --- SUGGEST TASK ORDER --- */
export const SuggestTaskOrderRequest: Sync = ({ request, tasks }) => ({
  when: actions([
    Requesting.request,
    { path: "/api/Task/suggestOrder", tasks },
    { request },
  ]),
  then: actions([taskConcept.suggestTaskOrder.bind(taskConcept), { tasks }]),
});

export const SuggestTaskOrderResponse: Sync = (
  { request, orderedTaskIds },
) => ({
  when: actions(
    [Requesting.request, { path: "/api/Task/suggestOrder" }, { request }],
    [taskConcept.suggestTaskOrder.bind(taskConcept), {}, { orderedTaskIds }],
  ),
  then: actions([Requesting.respond, { request, orderedTaskIds }]),
});
