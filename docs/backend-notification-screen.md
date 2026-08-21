# Backend Spec: Notification Screen (Follow-back, Muted Users, Category Filter)

Owner: Backend team.
App branch: `V1-0`. Referenced by the Activity/Notifications screen (`app/notifications/index.tsx`).

Current `NotificationItem` (`schema.clean.json:6427`) fields: `id`, `type`, `title`, `message`,
`referenceId`, `referenceType`, `isRead`, `createdAt`, `user: UserMiniType`.
`UserMiniType` (`schema.clean.json:6584`) fields: `id`, `username`, `avatarUrl`.
`notifications(limit, cursor)` has no filter arg. `unreadNotificationCount` has no args.

---

## 1. Follow-back button (needed for the app UI)

The notifications screen must render Follow / Follow back / Friends / Unfollow buttons on the
notification actor. The app already has the mutations (`followUser`, `unfollowUser`) and the
button-state logic; it only lacks the two relationship booleans on the payload.

### Schema change

Add a `viewerState` object to `UserMiniType` (mirror the existing `userProfile.viewerState`
pattern already consumed by the app in `hooks/useUserProfile.ts`):

```graphql
type UserMiniType {
  id: String!
  username: String!
  avatarUrl: String!
  viewerState: UserMiniViewerState!
}

type UserMiniViewerState {
  isFollowing: Boolean!
  isFollowedBy: Boolean!
  isOwner: Boolean!
}
```

- `isFollowing` = does the *viewing* user (notifiee) follow the actor?
- `isFollowedBy` = does the *actor* follow the viewing user?
- `isOwner` = is the actor the viewing user themselves (backend can set `false`; app ignores it).

### Resolver

`NotificationItem.user` resolver: resolve the actor, then compute the two booleans against the
authenticated notifiee — same logic already used for `followers.user.isFollowing`
(`services/graphQL/queries/follow.ts:55`).

### Expected query payload (frontend will call this)

```graphql
query MyNotifications($limit: Int, $cursor: String) {
  notifications(limit: $limit, cursor: $cursor) {
    hasMore
    nextCursor
    items {
      id
      title
      message
      type
      isRead
      referenceId
      referenceType
      createdAt
      user {
        id
        username
        avatarUrl
        viewerState {
          isFollowing
          isFollowedBy
        }
      }
    }
  }
}
```

### Button-state mapping (client already implements this in `components/follow/UserRow.tsx`)

| `isFollowing` | `isFollowedBy` | Label      |
|---------------|----------------|------------|
| true          | true           | Friends    |
| false         | true           | Follow back |
| true          | false          | Unfollow   |
| false         | false          | Follow     |

---

## 2. Mute "show fewer notifications" (per-user) — optional, for cross-device

Currently the app implements this **client-side only** (persisted locally per device). To make it
account-wide and fix the unread-badge mismatch, add server support:

### Schema additions

```graphql
type NotificationPreferencesType {
  # ...existing fields...
  mutedUserIds: [String!]!
}

input PreferencesInput {
  # ...existing fields...
  mutedUserIds: [String!]
}
```

### Behavior

- `updateNotificationPreferences(preferences: { mutedUserIds: [...] })` — replaces the set
  (additive semantics are handled client-side; app always sends the full list).
- `notifications(limit, cursor)` — **exclude** items whose `user.id` is in `mutedUserIds`.
- `unreadNotificationCount` — **exclude** muted users' unread items so the badge matches the list.

### Frontend notes

The app will stop using its local `useNotificationMuteStore` for display and instead:
- read `mutedUserIds` from `notificationPreferences` (or the notifications payload),
- call `updateNotificationPreferences` with the full list on toggle.

---

## 3. Server-side category filter — optional

Currently the filter tabs (All / Follows / Mentions / Replies / Circles) are computed client-side
from `referenceType`. To filter server-side, add an enum + arg. The client-side mapping today:

| Tab     | referenceType(s)      |
|---------|-----------------------|
| Follows | `follow`              |
| Mentions| `mention`             |
| Replies | `comment`             |
| Circles | `circle`, `circle_post` |

```graphql
enum NotificationCategory {
  FOLLOWS
  MENTIONS
  REPLIES
  LIKES
  CIRCLES
  ANNOUNCEMENTS
}

# Query change
notifications(limit: Int!, cursor: String, category: NotificationCategory): NotificationConnection!
```

Optional: also expose `category: NotificationCategory!` on `NotificationItem` so the client does
not need to map `referenceType` itself.

---

## Suggested rollout

1. **§1 first** — unblocks the Follow back button in the UI with no other dependencies.
2. §2 — only if cross-device mute / accurate unread badge is required.
3. §3 — only if server-side filtering is required (client-side works fine for now).