// src/syncs/confirmTask.sync.ts
import { actions, Sync } from "@engine";
import { ConfirmTask, Requesting } from "@concepts";

/** --- CONFIRM TASK --- */
export const ConfirmTaskRequest: Sync = ({ request, taskId, peerId }) => ({
  when: actions([
    Requesting.request,
    { path: "/ConfirmTask/confirmTask", taskId, peerId },
    { request },
  ]),
  then: actions([ConfirmTask.confirmTask, { taskId, peerId }]),
});

export const ConfirmTaskResponse: Sync = ({ request, success }) => ({
  when: actions(
    [Requesting.request, { path: "/ConfirmTask/confirmTask" }, { request }],
    [ConfirmTask.confirmTask, {}, { success }],
  ),
  then: actions([Requesting.respond, { request, success }]),
});

/** --- FINALIZE CONFIRMATION --- */
export const FinalizeConfirmationRequest: Sync = ({ request, taskId }) => ({
  when: actions([
    Requesting.request,
    { path: "/ConfirmTask/finalizeConfirmation", taskId },
    { request },
  ]),
  then: actions([ConfirmTask.finalizeConfirmation, { taskId }]),
});

export const FinalizeConfirmationResponse: Sync = ({ request, success }) => ({
  when: actions(
    [Requesting.request, { path: "/ConfirmTask/finalizeConfirmation" }, {
      request,
    }],
    [ConfirmTask.finalizeConfirmation, {}, { success }],
  ),
  then: actions([Requesting.respond, { request, success }]),
});

/** --- DENY TASK --- */
export const DenyTaskRequest: Sync = ({ request, taskId, peerId }) => ({
  when: actions([
    Requesting.request,
    { path: "/ConfirmTask/denyTask", taskId, peerId },
    { request },
  ]),
  then: actions([ConfirmTask.denyTask, { taskId, peerId }]),
});

export const DenyTaskResponse: Sync = ({ request, success }) => ({
  when: actions(
    [Requesting.request, { path: "/ConfirmTask/denyTask" }, { request }],
    [ConfirmTask.denyTask, {}, { success }],
  ),
  then: actions([Requesting.respond, { request, success }]),
});
