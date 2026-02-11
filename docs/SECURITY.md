# Security Checklist - Quick Reference

## Implementation Status

| Control           | Status | Priority | Notes                                          |
| ----------------- | ------ | -------- | ---------------------------------------------- |
| XSS Prevention    | ✅     | High     | React auto-escapes, no dangerouslySetInnerHTML |
| Input Validation  | ✅     | High     | Max 500 chars search, price 0-10000            |
| API Key Security  | ✅     | High     | postMessage + origin check, memory storage     |
| CSRF Protection   | ✅     | High     | No state-changing ops (GET only)               |
| CSP Headers       | ⚠️     | High     | Need to configure in deployment                |
| HTTPS Enforcement | ⚠️     | High     | Configure in deployment                        |
| Rate Limiting     | ⚠️     | Medium   | Defined but not integrated                     |
| Error Handling    | ✅     | Medium   | No stack traces exposed                        |
| Offline Mode      | ✅     | Medium   | Safe fallback to cache                         |

## Must Do Before Production

### 1. Content Security Policy (CSP)

**Nginx:**

```nginx
add_header Content-Security-Policy "
  default-src 'self';
  script-src 'self';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  connect-src 'self' https://dummyjson.com
" always;
```

**Vercel (vercel.json):**

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://dummyjson.com"
        }
      ]
    }
  ]
}
```

### 2. HTTPS & HSTS

**Nginx:**

```nginx
# Redirect HTTP to HTTPS
server {
  listen 80;
  return 301 https://$server_name$request_uri;
}

# Add HSTS header
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
```

### 3. X-Frame-Options (Clickjacking Protection)

```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
```

### 4. Verify Implementation

```bash
# Check CSP header
curl -i https://your-widget.example.com/ | grep Content-Security-Policy

# Check HSTS header
curl -i https://your-widget.example.com/ | grep Strict-Transport-Security

# Check X-Frame-Options
curl -i https://your-widget.example.com/ | grep X-Frame-Options
```

## Code Security Audit

### Search codebase for unsafe patterns:

```bash
# Should return 0 results
grep -r "dangerouslySetInnerHTML" src/    # ✅ Should be empty
grep -r "innerHTML" src/                  # ✅ Should be empty
grep -r "eval(" src/                      # ✅ Should be empty
grep -r "onclick=" src/                   # ✅ Should be empty (no string handlers)
```

## API Key Security

### How postMessage works:

```javascript
// Parent (user's site)
iframe.contentWindow.postMessage(
  {
    type: "MARKETPLACE_WIDGET_API_KEY",
    payload: "sk_live_abc123",
  },
  window.location.origin,
);

// Widget (embed.jsx)
window.addEventListener("message", (event) => {
  if (event.origin !== window.location.origin) return; // ✅ Origin check
  if (event.data?.type === "MARKETPLACE_WIDGET_API_KEY") {
    window.__MARKETPLACE_WIDGET_API_KEY__ = event.data.payload; // ✅ Memory only
  }
});
```

### Rules:

✅ API key in memory only (not localStorage)  
✅ Origin validation (same-origin only)  
✅ No API key in URL parameters  
✅ No API key in cookies  
✅ Rotate keys every 90 days

## Dependency Security

```bash
# Check for vulnerabilities
npm audit

# Fix automatically (safe)
npm audit fix

# Update lock file
npm ci

# Set up Dependabot (GitHub)
# Settings → Code security → Enable Dependabot
```

## Monitoring

### Setup error tracking (Sentry)

```javascript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "https://examplePublicKey@o0.ingest.sentry.io/0",
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
});
```

### Monitor for:

- CSP violations
- XSS attempts
- Unhandled errors
- Slow API requests
- Cache failures

## Security Testing

### Manual tests:

```javascript
// Test 1: XSS Payload in search
Search: <img src=x onerror="alert('xss')">
Expected: No alert, escaped text displayed ✅

// Test 2: SQL injection attempt
Search: '; DROP TABLE products; --
Expected: Treated as literal search term ✅

// Test 3: Large payload
Search: 'a'.repeat(1000)
Expected: Rejected with error ✅

// Test 4: API key exposure
Check console, localStorage, cookies
Expected: No API key visible ✅
```

### Automated tools:

```bash
# OWASP ZAP scanning
npm install -g @zaproxy/zaproxy
zaproxy -cmd scan https://your-widget.com/

# Lighthouse security check
lighthouse https://your-widget.com/ --view
```

## Incident Response

**If security issue found:**

1. **Immediately:** Disable feature if critical
2. **Assessment:** Determine impact and scope
3. **Fix:** Patch vulnerability
4. **Test:** Verify fix works
5. **Deploy:** Update to production
6. **Notify:** Inform stakeholders if data breach
7. **Review:** Post-incident analysis

## Compliance

### GDPR/CCPA (If applicable)

- Widget is read-only (no user data collected)
- No cookies or tracking
- No personal data stored
- No third-party scripts
- Safe for both regulations ✅

### Accessibility (WCAG AA)

- Semantic HTML ✅
- ARIA labels ✅
- Keyboard navigation ✅
- Color contrast ✅
- No motion traps ✅

## Pre-Launch Checklist

- [ ] CSP headers configured
- [ ] HTTPS enforced
- [ ] HSTS header set
- [ ] X-Frame-Options set
- [ ] npm audit passed
- [ ] No unsafe code patterns
- [ ] API keys not hardcoded
- [ ] Secrets in .env (not committed)
- [ ] Error tracking configured
- [ ] SSL/TLS 1.2+ enabled
- [ ] Security headers tested with curl
- [ ] Dependency updates current
- [ ] No console errors/warnings

---

**Most Common:** CSP headers not set (causes script failures)  
**Most Forgotten:** X-Frame-Options (clickjacking risk)  
**Most Important:** HTTPS + HSTS (data in transit)
