Purpose : Encourage healthy digital habits through peer accountability. Users
can track and share screen time, and compare progress with trusted peers.

Principle : Screen time is transparent among peers; visible accountability
encourages self-regulation.

State : Users: a set of userId: String screenTime: Number (in minutes per day)
sharedPeers: Set<UserId> (users they share with)

Actions:

addUser(userId: String) Requires: userId ∉ Users Effects: Creates a user with
screenTime = 0 and sharedPeers = ∅.

updateScreenTime(userId: String, minutes: Number) Requires: userId ∈ Users
Effects: Increases screenTime[userId] by minutes.

shareScreenTime(userId: String, peerId: String) Requires: userId ∈ Users, peerId
∈ Users, peerId ∉ sharedPeers of userID Effects:Adds peerId to
sharedPeers[userId].

viewRanking(userId: String) Requires: userId ∈ Users Effects: Allows viewer to
see screentime of all sharedPeers

dailyReset() Requires: Start of next day just began Effects: Stores all users
screentime to memory, tracking with date, and resets counter for new day
