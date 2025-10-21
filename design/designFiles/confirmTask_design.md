# Confirm Task
## Operational Principle Test Flow
- **Purpose:** Enable peer confirmation of task completion
- **Operational Principle:** 
  1. Request confirmation for a completed task
  2. Confirm task by peers
  3. Finalize confirmation
  4. List confirmations

## Interesting Scenarios / Edge Cases
- Requesting confirmation for uncompleted task
- Confirming a task by a peer not in the group
- Finalizing confirmation with no peers

## Observations / Design Notes
- Confirmation flow ensures accountability
- Status changes from pending → verified only when peers confirm
- Only relavent for friend groups with confirmation required
