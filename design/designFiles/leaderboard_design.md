# Leaderboard
## Operational Principle Test Flow
- **Purpose:** Provide friendly competition based on productivity
- **Operational Principle:** 
  1. Record task completions
  2. Generate leaderboard by tasks
  3. Generate leaderboard by time
  4. Reset weekly stats

## Interesting Scenarios / Edge Cases
- Recording completion for tasks requiring confirmation but unconfirmed
- Multiple users tied in tasks count (should sort by time)
- Resetting stats in the middle of week
- Multi-group leaderboard isolation

## Observations / Design Notes
- Group-specific stats
- Sorting by completedCount with tie-breaking by completedMinutes
- Reset updates `weekStart` for all groups