# Final Design Document

## Overview
This document explains how the final implemented system differs from the concept design in Assignment 2 and the visual design in Assignment 4b. It summarizes design changes, scope adjustments, implementation differences, and alignment with the original vision.

## Major Changes From Assignment 2

### Scope Adjustments
- Reduced backend complexity.
- Simplified certain processes to ensure stable synchronization.
- Removed several optional features planned early in the design.

### Concept Model Differences
- Added notifications as a full concept.
- Refined user and group relationships.
- Added task confirmation workflows after seeing real use-cases.
- Adjusted the meaning of “task completion” to support shared workflows.

### Feature Changes
- Automatic updates for dashboard were implemented later using syncs.
- Task confirmation logic was changed from single-step to multi-step.
- Group membership and invitation logic expanded beyond the original design.
- Added account deletion logic affecting:
  - notifications
  - groups
  - membership
  - user state

### Behavioural Adjustments
- Introduced sign-out on account deletion (not in original design).
- Real-time UI update triggers were added to match the visual design.
- More strict validation added to prevent incomplete payloads.
- Updated CORS and server structure to ensure compatibility with Render.

# Differences From Assignment 4b (Visual Design)

## UI Behaviour Changes
- Several UI elements updated for responsiveness.
- Dashboard auto-refresh implemented even though not in mockups.
- Simplified modal layout for tasks and notifications.
- Notification icons and status indicators updated during implementation.

## Interaction Changes
- Task deletion now triggers automatic UI updates.
- Confirming tasks required API fixes not reflected in early visual design.
- Group invitations changed from a modal workflow to a panel-based workflow.

# Technical Differences Between Design and Final Implementation

## Server Architecture
- Multiple server entry points were consolidated.
- CORS logic was rewritten for compatibility with browsers.
- Sync files were reorganized for clarity.
- Concepts were dynamically loaded rather than statically defined.

## Data Flow
- Added new sync triggers to push updates:
  - on task deletion
  - on task confirmation
  - on account deletion
  - on group membership changes
- Introduced new “update events” not present in earlier documents.

## Error Handling
- Improved validation messages.
- Added fallback logic for unexpected payloads.
- More robust handling of missing DB connections.

