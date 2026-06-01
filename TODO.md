# TODO: LOGIN 403 FIX — AUTH REGRESSION DEBUG

## Plan
1. Root-cause investigation
   - Identify exact `403` trigger(s) in backend login route.
   - Confirm whether `user.is_verified` is the only gate.
2. Logging instrumentation (temporary, safe)
   - Add debug logs to `/api/v1/auth/login` for: user found, password valid, `is_verified` value, and which 403 branch triggers.
   - Add debug logs to `/api/v1/auth/verify-email` for: email lookup, OTP verify result, and final `is_verified` after commit.
   - Ensure logs never include password/OTP/token values.
3. Reproduce and capture evidence
   - Run signup → verify-email → login.
   - Run login for a previously verified user.
4. Minimal safe fix
   - If `verify-email` succeeds but `is_verified` doesn’t persist: patch the verification update/DB session usage.
   - If OTP verification fails unexpectedly: patch OTP verification integration (still secure; no bypass).
5. Verification
   - Confirm login works.
   - Confirm wrong password still returns 401.
   - Confirm unverified user still gets 403 with correct message.
   - Smoke-test: signup, OTP, forgot/reset password, JWT auth, RBAC, onboarding, settings, delete account, AI Copilot.

## Progress
- [x] Identify exact 403 trigger in `auth.py` (blocks on `not user.is_verified`).
- [x] Add temporary debug logging around login + verify-email.
- [ ] Run reproduction and capture logs.
- [ ] Implement minimal safe fix.
- [ ] Verify full auth/onboarding surface.


