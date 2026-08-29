# Firebase Security Specification for VibeSpot (바이브스팟)

## 1. Data Invariants
1. **User Profile Invariant**: A user profile document at `/users/{userId}` can only be created, modified, or deleted by the authenticated user whose `request.auth.uid == userId`.
2. **Interaction Telemetry Invariant**: User interaction entries at `/users/{userId}/interactions/{interactionId}` belong exclusively to `userId` and cannot be read or tampered with by other users.
3. **Track Comment Invariant**: Any authenticated user can read comments at `/tracks/{trackId}/comments/{commentId}`. Only the author `request.auth.uid == request.resource.data.userId` can create a comment, with text length capped at 300 characters. Comments can only be deleted by the author.
4. **Denial of Wallet Protection**: All string fields and collection queries must be strictly constrained by size, length, and property existence.

## 2. The "Dirty Dozen" Threat Payloads
1. `ATTACK_1`: Unauthenticated user attempting to write a user profile (`request.auth == null`).
2. `ATTACK_2`: Authenticated user 'attacker_123' attempting to overwrite `/users/victim_456`.
3. `ATTACK_3`: Authenticated user attempting to inject oversized avatar string (>500 chars) into user profile.
4. `ATTACK_4`: Authenticated user attempting to add unpermitted arbitrary properties (`isAdmin: true`, `role: 'super'`) into user profile.
5. `ATTACK_5`: Authenticated user 'attacker_123' attempting to write an interaction log under `/users/victim_456/interactions/int_1`.
6. `ATTACK_6`: Authenticated user attempting to write an interaction log with negative `watchDurationSec` or missing `trackId`.
7. `ATTACK_7`: Authenticated user creating a comment under `/tracks/track_1/comments/c_1` spoofing `userId: 'victim_456'`.
8. `ATTACK_8`: Authenticated user attempting to submit an oversized comment (`content` > 300 characters).
9. `ATTACK_9`: Authenticated user attempting to delete someone else's comment on a track.
10. `ATTACK_10`: Unauthenticated user attempting to list private interactions from `/users/{userId}/interactions`.
11. `ATTACK_11`: Authenticated user attempting to mutate immutable `createdAt` timestamp on a comment.
12. `ATTACK_12`: Non-owner attempting to modify `likedTrackIds` of another user's profile.
