# Production Deployment Checklist

## Environment Variables

### Required Variables
```bash
# Backend URL (CRITICAL)
FLASK_BACKEND_URL=https://your-backend-api.com

# Node Environment
NODE_ENV=production

# Auth Mode (MUST be false in production)
USE_MOCK_AUTH=false

# Cookie Domain (Optional - only if using subdomains)
# Example: .yourdomain.com allows cookies to work across app.yourdomain.com and api.yourdomain.com
COOKIE_DOMAIN=

# Database (if using Prisma)
DATABASE_URL=your-database-connection-string
```

### Verify Environment Variables
```bash
# Check that all required variables are set
echo "FLASK_BACKEND_URL: $FLASK_BACKEND_URL"
echo "NODE_ENV: $NODE_ENV"
echo "USE_MOCK_AUTH: $USE_MOCK_AUTH"
```

---

## Server/Proxy Configuration

### Nginx Configuration
If using Nginx as reverse proxy:

```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    # SSL configuration
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        
        # CRITICAL: Set X-Forwarded-Proto for secure cookies
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Vercel Configuration
If deploying to Vercel, add to `vercel.json`:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Forwarded-Proto",
          "value": "https"
        }
      ]
    }
  ]
}
```

### Apache Configuration
If using Apache:

```apache
<VirtualHost *:443>
    ServerName yourdomain.com
    
    SSLEngine on
    SSLCertificateFile /path/to/cert.pem
    SSLCertificateKeyFile /path/to/key.pem
    
    ProxyPreserveHost On
    ProxyPass / http://localhost:3000/
    ProxyPassReverse / http://localhost:3000/
    
    # CRITICAL: Set X-Forwarded-Proto
    RequestHeader set X-Forwarded-Proto "https"
    RequestHeader set X-Forwarded-For "%{REMOTE_ADDR}s"
</VirtualHost>
```

---

## Pre-Deployment Testing

### 1. Build Test
```bash
npm run build
```
Expected: No errors, successful build

### 2. Production Mode Test (Local)
```bash
npm run build
npm start
```

### 3. Test Authentication Flow
- [ ] Register new user
- [ ] Verify cookie is set in browser dev tools
- [ ] Login with registered user
- [ ] Verify cookie is set with secure flag
- [ ] Refresh page - user should stay logged in
- [ ] Open new tab - user should still be logged in
- [ ] Logout - cookie should be cleared

### 4. Test Role-Based Access
- [ ] Login as customer - should access /orders
- [ ] Login as seller - should access /store
- [ ] Login as admin - should access /admin
- [ ] Try accessing /admin as customer - should be denied
- [ ] Try accessing /store as customer - should be denied

---

## Post-Deployment Verification

### 1. Check HTTPS
```bash
curl -I https://yourdomain.com
```
Expected: Status 200, HTTPS enabled

### 2. Check Headers
```bash
curl -I https://yourdomain.com/api/auth/login
```
Look for:
- `X-Forwarded-Proto: https`
- CORS headers if needed

### 3. Test Cookie Setting
```bash
# Register test user
curl -X POST https://yourdomain.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"first_name":"Test","last_name":"User","email":"test@example.com","password":"testpass123"}' \
  -v
```
Look for `Set-Cookie` header with:
- `auth-token=...`
- `Secure` flag
- `HttpOnly` flag
- `SameSite=Lax`

### 4. Test Auth Persistence
1. Login via browser
2. Open browser dev tools → Application → Cookies
3. Verify `auth-token` cookie exists with:
   - Secure: ✓
   - HttpOnly: ✓
   - SameSite: Lax
   - Expires: ~30 days from now
4. Refresh page - should stay logged in
5. Close and reopen browser - should stay logged in

### 5. Check Console Logs
Open browser console and look for:
- `[Login API] Cookie config:` - verify isSecure: true
- `[Middleware] Token found: true` - when accessing protected routes
- `[Auth Me API] Cookie check:` - verify hasAuthToken: true
- No CORS errors
- No cookie-related errors

---

## Common Production Issues & Solutions

### Issue 1: User logs in but immediately redirected to login
**Symptoms:**
- Login appears successful
- Immediately redirected back to login page
- Cookie not visible in dev tools

**Causes:**
- Secure flag set but site not using HTTPS
- X-Forwarded-Proto header not set by proxy
- Cookie domain mismatch

**Solutions:**
1. Verify HTTPS is enabled: `curl -I https://yourdomain.com`
2. Check proxy sets X-Forwarded-Proto header
3. Check COOKIE_DOMAIN env var matches your domain
4. Check browser console for cookie errors

### Issue 2: Cookie set but not sent with requests
**Symptoms:**
- Cookie visible in dev tools
- `/api/auth/me` returns 401
- Middleware logs show no token

**Causes:**
- SameSite policy blocking cookie
- Domain mismatch
- Path mismatch

**Solutions:**
1. Verify cookie domain matches request domain
2. Check SameSite is 'lax' not 'strict'
3. Verify cookie path is '/'
4. Check for CORS issues

### Issue 3: Admin can't access /admin after login
**Symptoms:**
- Login successful
- Redirected to home instead of /admin
- User has admin role

**Causes:**
- authChecked timing issue (should be fixed now)
- Role not properly set in user object
- Redux state not persisting

**Solutions:**
1. Check browser console for `[AdminLayout] Render check:` logs
2. Verify user.role is 'admin' or 'super_admin'
3. Check authChecked is true before redirect logic runs
4. Verify Redux state in Redux DevTools

### Issue 4: Works locally but not in production
**Symptoms:**
- Everything works in development
- Fails in production

**Causes:**
- Environment variables not set
- Proxy configuration missing
- HTTPS/secure cookie mismatch

**Solutions:**
1. Verify all environment variables are set in production
2. Check proxy configuration
3. Verify HTTPS is enabled
4. Check production logs for errors

---

## Monitoring & Debugging

### Enable Debug Logging
The app now includes extensive logging. Check:

1. **Server logs** for:
   - `[Login API] Cookie config:`
   - `[Register API] Cookie config:`
   - `[Auth Me API] Cookie check:`
   - `[Middleware] Token found:`

2. **Browser console** for:
   - `[Login] Starting login attempt`
   - `[Login] Redux dispatch complete`
   - `[AdminLayout] Render check:`
   - `[StoreProvider] Auth initialization complete`

### Browser Dev Tools Checklist
1. **Network Tab:**
   - Check `/api/auth/login` response has `Set-Cookie` header
   - Check `/api/auth/me` request has `Cookie` header
   - Verify no 401 errors on protected routes

2. **Application Tab:**
   - Check Cookies section
   - Verify `auth-token` exists
   - Check Secure, HttpOnly, SameSite flags

3. **Console Tab:**
   - Look for auth-related logs
   - Check for errors

### Health Check Endpoints
Consider adding these endpoints for monitoring:

```typescript
// app/api/health/route.ts
export async function GET() {
  return Response.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: {
      nodeEnv: process.env.NODE_ENV,
      hasBackendUrl: !!process.env.FLASK_BACKEND_URL,
      useMockAuth: process.env.USE_MOCK_AUTH === 'true',
    }
  })
}
```

---

## Rollback Plan

If issues occur in production:

1. **Quick Fix:** Enable mock auth temporarily
   ```bash
   USE_MOCK_AUTH=true
   ```

2. **Revert Deployment:** Roll back to previous version

3. **Debug:** Use logs to identify issue

4. **Fix & Redeploy:** Apply fix and redeploy

---

## Security Checklist

- [ ] HTTPS enabled
- [ ] Secure flag on cookies
- [ ] HttpOnly flag on cookies
- [ ] SameSite policy set
- [ ] CORS properly configured
- [ ] Environment variables secured
- [ ] No sensitive data in logs
- [ ] Rate limiting on auth endpoints
- [ ] CSRF protection enabled
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS prevention (input sanitization)

---

## Performance Checklist

- [ ] Static assets cached
- [ ] API responses cached where appropriate
- [ ] Database queries optimized
- [ ] Images optimized
- [ ] Bundle size optimized
- [ ] CDN configured for static assets

---

## Final Verification

Before marking deployment as complete:

1. [ ] All environment variables set
2. [ ] HTTPS working
3. [ ] Registration flow works
4. [ ] Login flow works
5. [ ] Auth persistence works (refresh page)
6. [ ] Role-based access works
7. [ ] Logout works
8. [ ] No console errors
9. [ ] Cookies set correctly
10. [ ] Monitoring/logging working
11. [ ] Backup/rollback plan ready
12. [ ] Team notified of deployment

---

## Support Contacts

- Backend Team: [contact info]
- DevOps Team: [contact info]
- On-Call Engineer: [contact info]
