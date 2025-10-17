Purpose : Track and share users’ online presence (active/inactive) within peer
groups.

Principle : Presence awareness supports accountability and connectedness.

State

Users: a set of userId: String lastActive: Timestamp peerGroup: Set<UserId>

Actions : addUser(userId: String) Requires: userId ∉ Users Effects: Creates user
with no peers and no recorded activity.

heartbeat(userId: String) Requires: userId ∈ Users Effects: Updates
lastActive[userId] = now.

markInactive(userId: String) Requires: userId ∈ Users, time between now and
lastActive[userId] > threshold Effects: Marks user as inactive and triggers
notifyPeers(userId).

notifyPeers(userId: String) Requires: userId ∈ Users Effects: Sends a
notification to all peers in peerGroup[userId] that the user became inactive.

addPeer(userId: String, peerId: String) Requires: userId ∈ Users, peerId ∈ Users
Effects: Adds peerId to peerGroup[userId].
