# E2E Authentication Flow Analysis

## Registration Flow

### 1. User Registration (Frontend)
**File:** `app/(public)/register/page.tsx`

**Process:**
1. User fills form: first_name, last_name, email, password, confirmPassword
2. Frontend validation:
   - Password match check
   - Password length >= 8
   - Terms agreement required
3. POST to `/api/auth/register` with credentials: 'include'
4. On success:
   - Dispatches `setUser(data.user)` to Redux
   - Redirects to `redirect` param or '/'

**Potential Issues:**
- ✅ Uses `credentials: 'include'` - correct
- ✅ Dispatches user to Redux immediately
- ⚠️ **ISSUE 1**: No explicit `setAuthenticated(true)` dispatch (relies on setUser setting isAuthenticated)

### 2. Registration API
**File:** `app/api/auth/register/route.ts`

**Process:**
1. Validates required fields
2. Forwards to Flask backend at `${FLASK_BACKEND_URL}/api/auth/register`
3. On success:
   - Receives `access_token` and `refresh_token` from Flask
   - Sets `auth-token` cookie with:
     - httpOnly: true
     - secure: based on x-forwarded-proto header
     - sameSite: 'lax'
     - expires: 30 days
     - path: '/'
     - domain: from COOKIE_DOMAIN env var (optional)
   - Sets `refresh-token` cookie with same options
4. Returns user data (no token in response body)

**Potential Issues:**
- ✅ Cookie security properly configured
- ⚠️ **ISSUE 2**: `secure` flag depends on `x-forwarded-proto` header - production proxy must set this
- ⚠️ **ISSUE 3**: COOKIE_DOMAIN must be properly configured in production

---

## Login Flow

### 1. User Login (Frontend)
**File:** `app/(public)/login/page.tsx`

**Process:**
1. User enters email and password
2. POST to `/api/auth/login` with credentials: 'include'
3. On success (response.ok && data.access_token):
   - Dispatches `setUser(data.user)` to Redux
   - Dispatches `setAuthenticated(true)` to Redux
   - Role-based redirect logic:
     - admin/super_admin → '/admin' (unless specific redirect)
     - seller → '/store' (unless specific redirect)
     - customer → '/orders' or redirect param
   - 100ms delay before router.push()
4. Shows full-page loading overlay during login

**Potential Issues:**
- ✅ Uses `credentials: 'include'` - correct
- ✅ Dispatches both setUser and setAuthenticated
- ✅ Has 100ms delay to allow cookie to be set
- ⚠️ **ISSUE 4**: isLoading stays true on success - could cause issues if redirect fails

### 2. Login API
**File:** `app/api/auth/login/route.ts`

**Process:**
1. Validates email and password
2. Checks USE_MOCK_AUTH env var for mock mode
3. Forwards to Flask backend at `${FLASK_BACKEND_URL}/api/auth/login`
4. On success:
   - Logs user action to audit log
   - Sets `auth-token` and `refresh-token` cookies (same as registration)
   - Returns user data with access_token in body
5. DELETE method for logout - clears cookies

**Potential Issues:**
- ✅ Cookie security properly configured
- ⚠️ **ISSUE 5**: Same secure/domain issues as registration
- ✅ Returns access_token in response body for frontend validation

---

## Auth State Initialization

### 1. StoreProvider
**File:** `app/StoreProvider.tsx`

**Process:**
1. Wraps app with Redux Provider
2. AuthInitializer component runs on mount:
   - Sets loading to true
   - Fetches `/api/auth/me` with credentials: 'include', cache: 'no-store'
   - On success: dispatches setUser(data.user)
   - On failure: dispatches setUser(null)
   - Finally: sets loading to false and authChecked to true

**Potential Issues:**
- ✅ Properly initializes auth state
- ✅ Sets authChecked flag
- ⚠️ **ISSUE 6**: Runs on every mount - could cause multiple calls in dev mode

### 2. Auth Me API
**File:** `app/api/auth/me/route.ts`

**Process:**
1. Checks USE_MOCK_AUTH for mock mode
2. Extracts `auth-token` from cookie header
3. Forwards to Flask backend with clean cookie
4. Returns user data or 401

**Potential Issues:**
- ✅ Properly extracts only auth-token
- ✅ Handles missing token
- ⚠️ **ISSUE 7**: No token refresh logic if expired

---

## Admin Layout Protection

### 1. AdminLayout
**File:** `components/admin/AdminLayout.tsx`

**Process:**
1. Reads auth state from Redux
2. Checks if authChecked && !reduxLoading before making decisions
3. Shows Loading component while auth is being checked
4. Redirects to login if not authenticated
5. Redirects to home if not authorized (not admin/super_admin)

**Potential Issues:**
- ✅ **FIXED**: Now waits for authChecked before redirecting
- ✅ Properly checks role authorization

---

## Production Issues Checklist

### Critical Environment Variables
```bash
# Must be set in production
FLASK_BACKEND_URL=https://your-backend.com
COOKIE_DOMAIN=.yourdomain.com  # Optional, for subdomain sharing
NODE_ENV=production
USE_MOCK_AUTH=false  # Must be false in production
```

### Proxy Configuration
Production proxy (Nginx, Vercel, etc.) must set:
```
X-Forwarded-Proto: https
```

### Cookie Issues in Production
1. **Secure flag**: Requires HTTPS and proper X-Forwarded-Proto header
2. **Domain flag**: Must match your domain structure
3. **SameSite**: 'lax' should work for most cases
4. **Path**: '/' is correct for app-wide cookies

### Common Production Failures

#### Symptom: Infinite redirect loop
**Causes:**
- Cookie not being set (secure flag issue)
- Cookie domain mismatch
- authChecked never becomes true

#### Symptom: User logged in but redirected to login
**Causes:**
- Cookie not sent with requests
- /api/auth/me returning 401
- Redux state not persisting

#### Symptom: Admin can't access /admin
**Causes:**
- Role not properly set in user object
- authChecked timing issue (FIXED)
- Cookie not being read by middleware

---

## Recommended Fixes

### Fix 1: Add explicit setAuthenticated in register
**File:** `app/(public)/register/page.tsx`

```typescript
if (response.ok && data.user) {
    dispatch(setUser(data.user))
    dispatch(setAuthenticated(true))  // ADD THIS
    router.push(redirect)
}
```

### Fix 2: Add error handling for redirect failure
**File:** `app/(public)/login/page.tsx`

```typescript
setTimeout(() => {
    console.log('[Login] Executing router.push to:', finalRedirect)
    router.push(finalRedirect)
    // Reset loading after redirect attempt
    setTimeout(() => setIsLoading(false), 1000)
}, 100)
```

### Fix 3: Add token refresh logic
**File:** `app/api/auth/me/route.ts`

Consider adding refresh token logic when auth-token is expired but refresh-token is valid.

### Fix 4: Add production cookie debugging
Add logging to help diagnose cookie issues:

```typescript
console.log('[Production Debug]', {
    protocol: request.headers.get('x-forwarded-proto'),
    cookieDomain: process.env.COOKIE_DOMAIN,
    nodeEnv: process.env.NODE_ENV,
    hasAuthToken: !!authToken,
})
```

---

## Testing Checklist

### Local Testing
- [ ] Register new user
- [ ] Login with registered user
- [ ] Refresh page - user stays logged in
- [ ] Navigate to /admin as admin user
- [ ] Navigate to /store as seller user
- [ ] Logout and verify redirect

### Production Testing
- [ ] Verify HTTPS is enabled
- [ ] Check X-Forwarded-Proto header is set
- [ ] Verify cookies are set with secure flag
- [ ] Test registration flow
- [ ] Test login flow
- [ ] Test page refresh (auth persistence)
- [ ] Test role-based access (admin, seller, customer)
- [ ] Test logout flow
- [ ] Check browser dev tools for cookie issues
- [ ] Verify no CORS errors in console

### Browser Dev Tools Checks
1. Network tab: Check Set-Cookie headers on login/register
2. Application tab: Verify auth-token cookie exists with correct flags
3. Console: Check for any auth-related errors
4. Network tab: Verify Cookie header is sent with /api/auth/me requests
