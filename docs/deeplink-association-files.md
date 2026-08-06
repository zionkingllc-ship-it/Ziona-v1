# Deep Link Association Files (ops reference)

Host the files below on the share domains so links open the app.

## Domains in use

| Domain | Role |
|---|---|
| `api.ziona.app` | Share/deep-link host (dev + iOS/Android App Links). Serves AASA + assetlinks.json. |
| `ziona.app` | Prod share domain. Serves assetlinks.json (and should serve AASA for prod links). |

`dev.ziona.app` is deprecated and intentionally **not** claimed by the app anymore.

## Android: `/.well-known/assetlinks.json`

Serve at:
- `https://api.ziona.app/.well-known/assetlinks.json`
- `https://ziona.app/.well-known/assetlinks.json`

Content:

```json
[
  {
    "relation": [
      "delegate_permission/common.handle_all_urls",
      "delegate_permission/common.get_login_creds"
    ],
    "target": {
      "namespace": "android_app",
      "package_name": "com.zionking.ziona",
      "sha256_cert_fingerprints": [
        "B6:A8:22:F3:C7:E0:71:56:6B:24:93:C4:57:6A:85:D9:81:01:65:3D:BD:CB:70:D2:0E:34:23:4B:5D:45:6B:52",
        "53:5B:CE:7A:2F:80:80:F4:2C:66:77:6E:9E:C7:E9:15:72:79:D5:52:73:1A:58:B1:81:6A:B7:26:23:1C:72:68"
      ]
    }
  }
]
```

> The first fingerprint is the **Play App Signing key** (Play Console → Setup → App integrity → App signing key certificate → SHA-256) and signs Play-installed apps. The second is the **EAS/upload keystore** and signs directly-installed EAS builds (`eas build` APK via adb / internal distribution). Android verifies if ANY listed fingerprint matches the installed app's cert, so listing both makes App Links work for Play-installed AND sideloaded builds. If more signing certs are added later (e.g. staged rollout), append them as separate array entries.

## iOS: `/.well-known/apple-app-site-association`

Serve at:
- `https://api.ziona.app/.well-known/apple-app-site-association`
- `https://ziona.app/.well-known/apple-app-site-association`

Content (match `public/.well-known/apple-app-site-association`, the newer `appIDs`/`components` format, which also covers `/viewer/*`):

```json
{
  "applinks": {
    "apps": [],
    "details": [
      {
        "appIDs": ["RLL2NX9J5Z.com.zionking.ziona"],
        "components": [
          {
            "#": "no_universal_links",
            "exclude": true,
            "comment": "Matches any URL whose path fragment does not begin with 'no_universal_links'"
          },
          {
            "/": "/post/*",
            "comment": "Open shared post URLs in the Ziona app"
          },
          {
            "/": "/viewer/*",
            "comment": "Open viewer URLs in the Ziona app"
          }
        ]
      }
    ]
  }
}
```

> The currently-deployed copy at `api.ziona.app` uses the legacy `appID`/`paths` format and only covers `/post/*`. It works, but you should replace it with the repo file above for consistency and `/viewer/*` coverage.
> Content-Type must be `application/json` (Apple recommends `application/json`, not `application/pkcs7-mime`).

## Fallback: redirect page

Serve `public/redirect/index.html` at the **root** of each share domain:
- `https://api.ziona.app/`
- `https://ziona.app/`

This page opens `ziona://viewer/{id}` (or an Android `intent://` link) and falls back to the store page if the app is not installed. It makes links work even when App Links verification is slow, cached as failed, or unsupported.

## Verification

- Android: `adb shell pm verify-app-links --re-verify com.zionking.ziona`, or Google's App Links test tool.
- iOS: `curl -I https://api.ziona.app/.well-known/apple-app-site-association` and check the `appID`/`paths`.

## App-side prerequisites (already in repo)

- `app.json` Android intent filter: `scheme: https`, hosts `ziona.app` + `api.ziona.app`, `pathPrefix: /post`, `autoVerify: true`.
- `app.json` iOS `associatedDomains`: `applinks:ziona.app`, `applinks:api.ziona.app`.
- Deep-link handler in `app/_layout.tsx` matches `/post/{id}` and `/viewer/{id}` on any host.
- Share URL built from `EXPO_PUBLIC_SHARE_DOMAIN` (`api.ziona.app` in dev env).
