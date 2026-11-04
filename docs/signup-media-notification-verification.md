# Signup, upload and notification-query verification

Base branch: `fix/username-grace-feed-refresh`. This change builds on its feed/profile fixes.

- Signup: nested REST errors preserve message, code, status, details and Retry-After. An OTP queue failure offers resend recovery rather than submitting registration again; existing-email errors offer sign-in, handle conflicts offer editing. No universal Appeal button.
- Media: image manipulation encodes HEIC/HEIF as JPEG. Post/draft, circle and avatar uploads share one prepared-file descriptor. The descriptor measures the output size and derives the output MIME/filename after compression. Video files are no longer renamed to MP4 without conversion.
- Notifications: polling waits for hydrated, authenticated state. Logout cancels and clears auth queries through the existing store; late unread responses from another session return zero.

Before merging/releasing, review against the current mobile release branch and deploy the corresponding backend fixes. Run `npm test`, `npm run typecheck` and `npm run lint`.

Device acceptance (both iOS and Android):
1. Sign up with an owned test email and verify the received OTP. Simulate queue failure only in a controlled staging test: verify the unverified account is preserved, then restore the worker/broker and use Resend code to finish the same account.
2. Try a taken username, registered email, invalid input and offline request. Verify specific messages and appropriate actions; no generic Appeal button.
3. Upload native iPhone HEIC, JPEG and MOV, plus Android images/video. Exercise post/draft resume, circles and avatar. Confirm output MIME, filename and byte size match the actual prepared file and playback works. A conversion failure must stop before upload.
4. Open as guest, log in, log out while a request is pending and log into a different account. Verify no guest unread requests, polling resumes after authentication, and old counts do not survive logout.
5. Trigger a real comment and a fresh like from a second account; record app state, platform, time and result. A Firebase acceptance log alone does not prove a visible iOS alert.

Automated tests mock native media libraries. They do not prove iOS/Android decoding, permissions or notification presentation; the installed release build must pass the device checks.
