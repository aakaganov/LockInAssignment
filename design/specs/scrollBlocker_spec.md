Purpose: Prevent a user from accessing certain apps at specified times. An app
can be blocked entirely or just the scrolling features.

Principle: Users can only scroll in allowed apps outside blocked periods.

State: a set of Users with: userId: String blockedPeriods: Map<TimeInterval,
Set<App>>\
scrollingBlocked: Map<App, Boolean>\
a set of Apps A set of NonScrolling Apps: set<App> A set of scrolling apps:
set<App>

Actions:

addUser(userId: String) Requires: userId not already in Users Effects: creates a
new user with empty blockedPeriods and scrollingBlocked mappings
setBlockManual(userId: String, period: TimeInterval, app: App, scrollingBlocked:
Boolean) Requires: App exists in Apps, User exists in users, if scrollingBlocked
is true then App must be a scrolling app Effects: if period already exists in
blockedPeriods, add App to mapping, otherwise create new blockedPeriod mapped to
app removeBlock(userId: String, period: TimeInterval, app: App): Requires: App
exists in Apps, User exists in users, period exists in blockedPeriod and app is
in set of apps mapped to that period Effects: removes app from that time period
in blockedApps AISetBlock(userId: String) Requires: user needs to exist Effects:
LLM analyzes screentime and sees what blocks to add to what distracting apps
based upon what apps are used too much at what times. Suggest this to the user.
If user approves, block is added, otherwise nothing changes DownloadApp(userId:
String, app: App, scrolling: Boolean) Requires: app does not already exist in
Apps Effects: add app to Apps, if scrolling add app to scrolling Apps, else add
to NonScrolling apps
