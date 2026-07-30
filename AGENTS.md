# Ziona Codebase Guide

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

# Remaining Work

## 🔴 Critical

- [ ] **Deep link regex unsafe** — `app/_layout.tsx:82` uses `(.+)` which captures query params and trailing path segments. Fix: `/\/post\/([^/?\s]+)/`

## 🟠 High

- [ ] **`any` types (~200+ holes)** — concentrated in React Query cache callbacks (`(old: any)` in hooks), post normalization pipeline (`p: any`), and UI component props. Prefer generated GraphQL types.

## 🟢 Low

- [ ] **OG meta tags / web fallback** — `https://ziona.app/post/{id}` needs a web page with OG tags for rich link previews in WhatsApp/iMessage (backend/ops)
- [ ] **Location edit on profile** — Backend supports `updateProfile(location: String)`, no UI on `app/(tabs)/profile/edit/index.tsx` yet
- [ ] **`AccountDetails` GraphQL query** — Backend has `query { accountDetails }` returning `{ memberSince, memberSinceDate, location, accountStatus }`, but frontend has no client-side query for it (About page uses `useUserProfile` instead)

