# Ziona Codebase Guide

## Auth & Apple Sign-In

### Apple Sign-In Flow
1. User taps Apple button → `AppleAuthentication.signInAsync()` in `services/auth/useAppleAuth.ts`
2. Apple returns `identityToken` (JWT)
3. Frontend sends `{ id_token }` to `POST /auth/apple` (via `authApi.appleLogin()`)
4. Backend validates JWT (JWKS from `appleid.apple.com`, verify `iss`/`aud`/`exp`)
5. `useAuthStore.setAuth(user, tokens)` → user authenticated

### Config
- `app.json`: `"expo-apple-authentication"` plugin, iOS entitlements `com.apple.developer.applesignin: ["Default"]`
- Apple buttons: `app/(auth)/index.tsx` (signup) and `app/(auth)/login/index.tsx` (login), iOS only via `Platform.OS === "ios"`

### Backend `POST /auth/apple` Requirements
- **Request**: `{ "id_token": "..." }`
- **Response**: `{ user: { id, username, email?, avatarUrl?, role, createdAt }, tokens: { accessToken, refreshToken } }`
- Lookup user by Apple `sub` → create if not found

## Deep Link & Share System

### How it works
- `buildPostUrl(postId)` → `https://ziona.app/post/{id}` (env: `EXPO_PUBLIC_SHARE_DOMAIN`)
- `buildDeepLink(postId)` → `ziona://viewer/{id}` (env: `EXPO_PUBLIC_DEEP_LINK_SCHEME`)
- iOS: Universal links via `applinks:ziona.app`
- Android: Intent filters matching `https://ziona.app/post/*` and `ziona://viewer/*`
- Handler: `app/_layout.tsx` → `Linking.addEventListener("url", handleDeepLink)`
- Regex: `/\/post\/(.+)/` or `/\/viewer\/(.+)/` → navigates to `/viewer/{postId}`
- Viewer default branch uses `usePostById(postId)` (works for any user's post)

### Known gaps
- Regex is greedy — doesn't strip query params (`/post/abc?ref=x` captures `abc?ref=x`)
- No postId format validation
- `Linking.getInitialURL()` error silently swallowed

## Location on About Page

Already implemented in `app/settings/About.tsx`:
- Auto-detects location via `useUpdateLocation()` on mount if none exists
- Uses `expo-location` (geocoding: city, region, country)
- Saves via `updateProfile(location: String)` GraphQL mutation
- Displays with loading spinner while detecting

## Location on User Profile

Backend supports `location: String!` on `UserProfileType` and `UserType`. No edit UI on the profile edit screen yet.

## iOS Build Fix: RNFBApp Non-Modular Headers

If EAS Build (or `pod install`) fails with:
```
include of non-modular header inside framework module 'RNFBApp.RCTConvert_FIRApp'
```
This is caused by React Native 0.84+'s pre-compiled RN core distribution conflicting with RNFB's static framework linking. The fix is in `app.json` under `expo-build-properties` → `ios`:

- Add `"forceStaticLinking": ["RNFBApp", "RNFBMessaging"]` (list every RNFB pod in use)
- This forces those pods to be built as static libraries instead of frameworks, avoiding the modular header error
- Do NOT use `CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES = YES` (unsafe) or `buildReactNativeFromSource: true` (slower builds) unless `forceStaticLinking` doesn't work

---

# Audit Findings & Todo

## 🔴 Critical (fix first)

- [ ] **Empty catch blocks (46 occurrences)** — silently swallow errors. Every `catch {}` needs at minimum `console.warn`. Worst: `services/share/services.ts` (7), `components/circles/AnchorVideoPlayer.tsx` (7), `app/CircleExtension/postVideoViewer.tsx` (6)
- [ ] **Deep link regex unsafe** — `app/_layout.tsx:82` uses `(.+)` which captures query params and trailing path segments. Fix: `/\/post\/([^/?\s]+)/`
- [ ] **Circular dependency** — `store/useAuthStore.ts` ↔ `services/api/client.ts` ↔ `services/auth/refresh.ts` all import each other. Works at runtime but fragile.

## 🟠 High

- [ ] **Console.log in production (~150+)** — especially `services/api/authApi.ts` (39 calls via custom `log()`), `services/graphQL/graphqlClient.ts` (8), auth flows (16 each). Set up proper logging or strip before release.
- [x] **Hardcoded legal URLs** — replaced with `EXPO_PUBLIC_LEGAL_DOCS_BASE_URL` env var (`.env`, `[type].tsx`, `legalDocuments.ts`)
- [ ] **`any` types (~200+ holes)** — concentrated in React Query cache callbacks (`(old: any)` in hooks), post normalization pipeline (`p: any`), and UI component props. Prefer generated GraphQL types.
- [ ] **`getAppleNonce()` missing try/catch** — `services/api/authApi.ts:170`. Single unhandled async function.

## 🟡 Medium

- [ ] **Dead code — remove unused files**:
  - `store/useFeedStore.ts` (Zustand — never imported)
  - `components/store/FeedStore.tsx` (React Context — never imported, entire `FeedProvider` dead)
  - `services/graphQL/queries/categories/categoryQueries.ts` (duplicate of `discover/discover.ts`)
- [ ] **Unused packages** — check if these can be removed: `expo-media-library`, `expo-symbols`, `react-native-worklets`, `zod`
- [ ] **Inconsistent state management** — `store/circleStore.ts` uses raw `AsyncStorage` instead of Zustand `persist` middleware (unlike `useAuthStore` and `useChatStore`)
- [ ] **GraphQL query comments** — `services/graphQL/queries/circles.ts:144,613` have `# Backend TODO` comments for unimplemented `sortBy`/`authorId` params
- [ ] **Duplicate store names** — `usePostStore` and `usePostActionStore` have overlapping responsibilities (likes/saves/bookmarks in one, likes/saves/follows in other)
- [ ] **`Platform.OS === "ios"` used 11+ times** for conditional rendering — consider a helper/isPlatform constant

## 🟢 Low / Enhancement

- [ ] **OG meta tags / web fallback** — `https://ziona.app/post/{id}` needs a web page with OG tags for rich link previews in WhatsApp/iMessage (backend/ops)
- [ ] **Location edit on profile** — Backend supports `updateProfile(location: String)`, no UI on `app/(tabs)/profile/edit/index.tsx` yet
- [ ] **`AccountDetails` GraphQL query** — Backend has `query { accountDetails }` returning `{ memberSince, memberSinceDate, location, accountStatus }`, but frontend has no client-side query for it (About page uses `useUserProfile` instead)
- [ ] **Build prep script** — `scripts/prepare-build.js` hardcodes staging/prod URLs. Consider env-driven config
