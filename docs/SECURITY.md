# Security Guide: CRM Product Distribution System

This guide outlines the security measures implemented for the admin-as-supplier CRM integration.

## Security Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
   External     │────▶│   Security   │────▶│   Internal   │
   CRM System   │     │   Layer      │     │   korea-cosmetics     │
                │     │              │     │              │
└─────────────┘     └──────────────┘     └─────────────┘
                      - API Key Auth
                      - Rate Limiting
                      - Input Validation
                      - Audit Logging
                      - CORS Protection
```

## Implemented Security Features

### 1. API Key Authentication

All admin endpoints require a valid API key in the `X-API-Key` header:

```bash
# Set in .env
ADMIN_API_KEY=your-secure-random-key-min-32-chars

# Usage
X-API-Key: your-secure-random-key-min-32-chars
```

**Best Practices:**
- Generate using `crypto.randomBytes(32).toString('hex')`
- Rotate keys every 90 days
- Never commit keys to version control
- Use different keys for development/staging/production

### 2. Role-Based Access Control (RBAC)

Endpoints verify the user has the required role:

```typescript
// Request headers
X-User-Role: admin
X-User-Id: user_123
```

**In Production:**
Replace header-based auth with JWT validation:
```typescript
import { verify } from 'jsonwebtoken';
const token = request.headers.get('Authorization')?.replace('Bearer ', '');
const decoded = verify(token, process.env.JWT_SECRET);
```

### 3. Rate Limiting

Protects against brute force and DoS attacks:

| Endpoint | Limit | Window |
|----------|-------|--------|
| CRM fetch | 50 requests | 60 seconds |
| CRM import | 10 requests | 60 seconds |
| Product distribution | 20 requests | 60 seconds |
| Distribution history | 30 requests | 60 seconds |

**Response Headers:**
```
X-RateLimit-Remaining: 45
```

### 4. Input Validation & Sanitization

All inputs are validated before processing:

```typescript
// Product ID validation
- Must be alphanumeric with hyphens/underscores
- Max length: 100 characters
- No HTML tags (< >)

// Pricing validation
- Markup: 0-1000%
- Price: Clamped to 0-999,999,999

// Array limits
- Max 100 products per distribution
- Max 100 array items
- Max 10,000 character strings
```

### 5. Webhook Security

Outgoing webhooks to CRM include HMAC signatures:

```typescript
const signature = generateWebhookSignature(payload, secret);

// Headers
X-Webhook-Signature: sha256=abc123...
X-Event-Type: product.created
```

Verify incoming webhooks from your CRM:
```typescript
const isValid = verifyWebhookSignature(payload, signature, secret);
if (!isValid) {
  throw new Error('Invalid webhook signature');
}
```

### 6. CORS Protection

Restricts which domains can access the API:

```bash
# .env
ALLOWED_ORIGINS=https://admin.korea-cosmetics.com,https://crm.yoursystem.com
```

### 7. Audit Logging

All sensitive operations are logged:

```json
{
  "timestamp": "2026-04-03T19:30:00Z",
  "action": "PRODUCTS_DISTRIBUTED",
  "userId": "admin_123",
  "userRole": "admin",
  "resourceType": "product-distribution",
  "resourceId": "store_456",
  "details": {
    "distributedCount": 5,
    "failedCount": 0,
    "productIds": ["prod_1", "prod_2"]
  },
  "ip": "192.168.1.100",
  "userAgent": "Mozilla/5.0..."
}
```

**Log Destinations:**
- Console (development)
- Webhook to SIEM (production)
- Database audit table

### 8. Database Security

**Prisma Best Practices:**
```typescript
// Use parameterized queries (automatic with Prisma)
// Never use raw SQL with user input

// Validate foreign keys
const product = await prisma.product.findFirst({
  where: {
    id: productId,
    storeId: null, // Ensure admin-supplied only
  },
});
```

## Environment Variables

Required for secure operation:

```bash
# Authentication
ADMIN_API_KEY=sk_korea-cosmetics_admin_xxxxxxxxxxxx
JWT_SECRET=your-jwt-secret-min-64-chars

# CRM Integration
CRM_WEBHOOK_URL=https://your-crm.com/api/webhooks
CRM_API_KEY=crm_api_key_xxxxxxxxxxxx
CRM_WEBHOOK_SECRET=webhook_secret_xxxxxxxx

# Security
ALLOWED_ORIGINS=https://admin.korea-cosmetics.com
AUDIT_WEBHOOK_URL=https://your-siem.com/ingest
AUDIT_WEBHOOK_SECRET=audit_secret_xxxxxxxx

# Rate Limiting (optional, has defaults)
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
```

## Secure API Usage Examples

### Fetch Products from CRM (Admin)

```bash
curl -X GET \
  https://korea-cosmetics.com/api/admin/crm-products \
  -H "X-API-Key: $ADMIN_API_KEY" \
  -H "X-User-Role: admin" \
  -H "X-User-Id: admin_123" \
  -H "Origin: https://admin.korea-cosmetics.com"
```

### Distribute Products to Store

```bash
curl -X POST \
  https://korea-cosmetics.com/api/admin/distribute-products \
  -H "X-API-Key: $ADMIN_API_KEY" \
  -H "X-User-Role: admin" \
  -H "X-User-Id: admin_123" \
  -H "Content-Type: application/json" \
  -d '{
    "productIds": ["prod_1", "prod_2"],
    "storeId": "store_456",
    "pricing": { "markup": 25 }
  }'
```

### Store Adds Product from Catalog

```bash
curl -X POST \
  https://korea-cosmetics.com/api/store/catalog \
  -H "X-API-Key: $STORE_API_KEY" \
  -H "X-User-Role: store" \
  -H "X-User-Id: store_456" \
  -H "Content-Type: application/json" \
  -d '{"productId": "prod_1"}'
```

## Security Checklist

Before deploying to production:

- [ ] Set strong `ADMIN_API_KEY` (min 32 characters)
- [ ] Configure `ALLOWED_ORIGINS` 
- [ ] Enable HTTPS only
- [ ] Set up audit log webhook
- [ ] Configure rate limits for your traffic
- [ ] Test webhook signature verification
- [ ] Validate all error responses don't leak sensitive data
- [ ] Set up monitoring for suspicious activity
- [ ] Document incident response procedures
- [ ] Enable database query logging for security review

## Common Security Threats & Mitigations

| Threat | Mitigation |
|--------|------------|
| **API Key Leak** | Rotate keys regularly, use environment variables, never commit to git |
| **Replay Attacks** | Include timestamps in signed payloads, verify webhook signatures |
| **Data Injection** | Strict input validation, sanitize all user inputs |
| **DoS Attacks** | Rate limiting, request size limits, Cloudflare/AWS WAF |
| **Man-in-the-Middle** | HTTPS only, certificate pinning for mobile apps |
| **Privilege Escalation** | RBAC checks on every request, principle of least privilege |
| **Data Exfiltration** | Audit logging, data classification, access controls |

## Incident Response

If security breach suspected:

1. **Immediate:** Revoke all API keys
2. **Investigate:** Review audit logs for suspicious activity
3. **Contain:** Disable affected endpoints
4. **Notify:** Inform affected stores and customers
5. **Recover:** Rotate keys, patch vulnerabilities
6. **Document:** Post-incident review

## Contact

For security concerns, contact: security@korea-cosmetics.com
