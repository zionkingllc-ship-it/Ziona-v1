# Apple Sign In Setup

## Prerequisites
- Apple Developer account ($99/yr)
- Physical iOS device or simulator for testing

## Steps to enable

### 1. Rebuild native app (not Expo Go)
```
npx expo run:ios
```
`expo-apple-authentication` is a native module — requires a development build.

### 2. Apple Developer Portal — Enable capability
1. Go to [developer.apple.com](https://developer.apple.com) → Certificates, Identifiers & Profiles
2. Select App ID `com.zionking.ziona`
3. Check **"Sign In with Apple"** → Save

### 3. Service ID (for backend token verification)
1. Same portal → Identifiers → "+" → Services IDs
2. Create Service ID (e.g., `com.zionking.ziona.service`)
3. Configure **"Sign In with Apple"** → primary domain: `ziona.app` → return URL (from backend team)

### 4. Backend configuration (`POST /auth/apple`)
The backend endpoint at `/api/auth/apple` receives `{ id_token }` and must:
- Verify the JWT using Apple's public key JWKS
- Use the Service ID (from step 3) as the `audience` claim
- Extract `sub` from decoded JWT as the Apple user ID
- Create or return existing user account

### 5. Already configured in code
- `app.json`: `"expo-apple-authentication"` plugin added, iOS entitlements set
- `signup screen`: "Continue with Apple" PrimaryButton with Ionicons `logo-apple`
- `login screen`: Same Apple button
- `services/auth/useAppleAuth.ts`: Calls `AppleAuthentication.signInAsync()` then `authApi.appleLogin(idToken)`
- `services/api/authApi.ts`: `appleLogin(idToken)` → `POST /auth/apple` with `{ id_token }`
