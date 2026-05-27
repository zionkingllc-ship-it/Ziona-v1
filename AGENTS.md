# Apple Sign In Setup

## Prerequisites
- Apple Developer account ($99/yr)
- Physical iOS device or simulator for testing

## Apple Developer Portal setup

### 1. Register App ID
1. Go to [developer.apple.com](https://developer.apple.com) → Certificates, Identifiers & Profiles → Identifiers
2. Select the App ID `com.zionking.ziona` (or create it)
3. Check **"Sign In with Apple"** capability → Save

### 2. Create Service ID (for backend token verification)
1. Same portal → Identifiers → "+" → Services IDs
2. Create Service ID (e.g., `com.zionking.ziona.service`)
3. Configure **"Sign In with Apple"** → primary domain: `ziona.app`
4. Set return URLs (ask backend team for the callback URL they need)
5. Copy the **Service ID** — the backend uses this as the `audience` claim when verifying the JWT

### 3. Create signing key (optional, for backend)
If backend verifies tokens server-side with Apple's JWKS rather than a key, this may not be needed.

## Frontend — already implemented

### Native build
```
npx expo run:ios
```
`expo-apple-authentication` is a native module — Expo Go won't work. Must use a development build.

### Config files
- **`app.json`**: `"expo-apple-authentication"` plugin added (line 89); iOS entitlements `com.apple.developer.applesignin: ["Default"]` set (line 16-18)
- **`services/auth/useAppleAuth.ts`**: Complete hook that calls `AppleAuthentication.signInAsync()` then `authApi.appleLogin(idToken)`
- **`services/api/authApi.ts`**: `appleLogin(idToken)` → `POST /auth/apple` with `{ id_token }`
- **`app/(auth)/index.tsx`** (signup): "Continue with Apple" PrimaryButton (iOS only via `Platform.OS === "ios"`)
- **`app/(auth)/login/index.tsx`** (login): Same Apple button

### Flow
1. User taps Apple button → `AppleAuthentication.signInAsync()` presents native Apple sheet
2. User authenticates → Apple returns `identityToken` (a signed JWT)
3. Frontend sends `{ id_token: identityToken }` to `POST /auth/apple`
4. Backend validates the JWT, creates/returns user
5. `useAuthStore.setAuth(user, tokens)` called → user authenticated

## Backend — `POST /auth/apple`

### Request
```json
{
  "id_token": "eyJraWQiOiJ... (Apple JWT from client)"
}
```

### JWT verification steps
1. Fetch Apple's public keys from `https://appleid.apple.com/auth/keys` (JWKS endpoint)
2. Decode JWT header to get `kid` (key ID), match against JWKS keys
3. Verify JWT signature using the matching public key (RS256)
4. Verify claims:
   - `iss` (issuer) === `"https://appleid.apple.com"`
   - `aud` (audience) === your Service ID (e.g., `"com.zionking.ziona.service"`)
   - `exp` (expiration) — must not be expired
5. Extract `sub` — this is Apple's unique user ID

### Response (must match frontend expectation)
```json
{
  "user": {
    "id": "string",
    "username": "string",
    "email": "string?",
    "avatarUrl": "string?",
    "role": "user",
    "createdAt": "string"
  },
  "tokens": {
    "accessToken": "string",
    "refreshToken": "string"
  }
}
```

### User creation logic
- Look up existing user by Apple `sub` (store it as `appleId` on the user record)
- If exists → return that user + new tokens
- If new → create user with `appleId`, auto-generate `username` (Apple doesn't provide one reliably after first sign-in), optionally use `email` from the token's `email` claim if scope was requested
- Return user + tokens

# Share URL & Deep Link System

## How shared URLs work

When a user taps "Share" on a post, `buildPostUrl(postId)` generates:
```
https://ziona.app/post/{postId}
```

This URL is shared to WhatsApp, Messages, Mail, or copied to clipboard.

## How deep links open the app

- **iOS**: Universal links via `applinks:ziona.app` — clicking `https://ziona.app/post/xxx` opens the app directly
- **Android**: Intent filters matching `https://ziona.app/post/*` — same behavior
- **Custom scheme**: `ziona://viewer/{postId}` also works for direct deep linking

## How the app handles incoming links

`app/_layout.tsx:75-93` — `Linking.addEventListener("url", handleDeepLink)`:
1. Regex extracts postId from `/post/(.+)` or `/viewer/(.+)`
2. Navigates to `app/viewer/[postId].tsx`
3. Viewer screen loads posts from source (default: `useUserPosts`)
4. Finds the post by matching `postId` against the loaded posts

## Known issue: deep link viewer can't find the post

The viewer screen (`app/viewer/[postId].tsx:190-194`) loads posts from a **source-based collection**:
- No `source` param → `useUserPosts()` (the current user's own posts only)
- `source=liked` → liked posts
- `source=saved` → saved posts
- `categoryId` → discover feed by category

When a deep link arrives from an external share, there is no `source` param, so it defaults to the user's own posts. **If the shared post belongs to another user, it won't be found** → `targetIndex === -1` → infinite loading spinner.

**Fix needed**: Add a `usePostById(postId)` query or a feed loader that can fetch an arbitrary post by ID when no source is provided.

## Domain config

`services/share/services.ts:6` — domain is hardcoded:
```typescript
const DOMAIN = "https://ziona.app";
export function buildPostUrl(postId: string) {
  return `${DOMAIN}/post/${postId}`;
}
export function buildDeepLink(postId: string) {
  return `ziona://viewer/${postId}`;
}
```

No env variable for domain — must change the constant to update.
