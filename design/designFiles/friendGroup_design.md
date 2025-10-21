# Friend Group
## Operational Principle Test Flow
- **Purpose:** Form accountability groups between users
- **Operational Principle:** 
  1. Create group
  2. Add members
  3. Remove members
  4. Set confirmation policy
  5. List groups for a user

## Interesting Scenarios / Edge Cases
- Adding members to non-existent groups
- Removing members not in group
- Changing confirmation policy mid-week


## Observations / Design Notes
- Groups maintain member lists and confirmation policies
- Optional confirmation handled dynamically