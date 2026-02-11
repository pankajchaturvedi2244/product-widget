# Build & Deployment - Quick Guide

## Development

```bash
npm install
npm run dev              # Dev server: localhost:5173 (HMR enabled)
npm run build           # Production build
npm run preview         # Test production build locally
```

## Production Build Output

```
dist/
├── embed.js             2 KB   (loader script)
├── widget.js            150 KB (app bundle)
└── widget.css           10 KB  (styles)

TOTAL: 45 KB gzipped ✅
```

## Deployment Options

### 1. Vercel (Easiest - 1 command)

```bash
npm install -g vercel
vercel --prod
```

**Auto:** HTTPS, CDN, auto-scaling ✅

### 2. AWS S3 + CloudFront

```bash
npm run build
aws s3 sync dist/ s3://your-bucket/
aws cloudfront create-distribution --origin-domain your-bucket.s3.amazonaws.com
```

### 3. Docker (Self-hosted)

```bash
docker build -t widget:latest .
docker run -p 8080:80 widget:latest
```

**Dockerfile:**

```dockerfile
FROM node:18-alpine AS build
WORKDIR /app
COPY . .
RUN npm ci && npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
```

### 4. npm Registry (Library)

```bash
# package.json
{
  "name": "@yourcompany/marketplace-widget",
  "main": "dist/widget.js"
}

# Deploy
npm publish
```

## Embedding

### Simple (Script Tag)

```html
<!-- Your website -->
<div id="marketplace-widget"></div>
<script src="https://product-widget-comparision-pankaj.vercel.app/embed.js"></script>
```

**How it works:**

1. embed.js creates container if missing
2. embed.js loads widget.js from same CDN
3. widget.js initializes React app

### With API Key (postMessage)

```html
<div id="marketplace-widget"></div>

<script>
  const widgetFrame = document.getElementById("marketplace-widget");

  // Wait for widget to load
  setTimeout(() => {
    widgetFrame.contentWindow.postMessage(
      {
        type: "MARKETPLACE_WIDGET_API_KEY",
        payload: "sk_live_abc123xyz",
      },
      window.location.origin,
    );
  }, 1000);
</script>

<script src="https://cdn.example.com/embed.js"></script>
```

## Configuration

### API Endpoints (src/services/api.js)

```javascript
const BASE_API = "https://dummyjson.com/products/search?q=";

const API_ENDPOINTS = {
  amazon: "https://your-api.com/amazon/products",
  ebay: "https://your-api.com/ebay/products",
  walmart: "https://your-api.com/walmart/products",
};
```

### Cache Settings (src/services/cache.js)

```javascript
const DB_NAME = "marketplace-widget";
const STORE_NAME = "products";
const TTL = 3600 * 1000; // 1 hour (change if needed)
```

### App Config (src/configs/appConfig.js)

```javascript
export const MAX_QUERY_LENGTH = 500; // Max search length
export const MAX_PRICE_LIMIT = 10000; // Max price filter
```

## Performance Optimization

### Reduce Bundle (Quick Wins)

| Task                   | Savings     | Time    |
| ---------------------- | ----------- | ------- |
| Replace Recharts → SVG | -240KB      | 1-2 hrs |
| Add React.memo         | -30% render | 30 min  |
| Lazy load charts       | -10KB       | 30 min  |

**After optimizations: 45KB → 18KB (-60%)**

### Enable Compression

**Nginx:**

```nginx
gzip on;
gzip_types text/javascript application/json;
gzip_min_length 1000;
gzip_comp_level 6;
```

**Result:** 45KB → 12KB gzipped

### Browser Caching

```nginx
# Cache embed.js for 1 hour (frequently updated)
location /embed.js {
  add_header Cache-Control "public, max-age=3600";
}

# Cache widget.js for 1 year (hash in filename)
location /widget.js {
  add_header Cache-Control "public, max-age=31536000, immutable";
}
```

## Testing

```bash
# Security audit
npm audit

# Build analysis
npm run build
du -sh dist/

# Local preview
npm run preview

# Lighthouse
npm install -g lighthouse
lighthouse https://your-widget.com/
```

## Pre-Deployment Checklist

- [ ] `npm audit` passed
- [ ] `npm run build` successful
- [ ] `npm run preview` works locally
- [ ] Tested on Chrome, Firefox, Safari, mobile
- [ ] Offline mode tested
- [ ] Dark mode tested
- [ ] HTTPS enabled
- [ ] CSP headers configured
- [ ] Rate limiting active

## Monitoring

### Setup Sentry (Error tracking)

```javascript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "https://examplePublicKey@o0.ingest.sentry.io/0",
  environment: process.env.NODE_ENV,
});
```

### Track Web Vitals

```javascript
import { getCLS, getFID, getFCP, getLCP, getTTFB } from "web-vitals";

getCLS((metric) => console.log("CLS:", metric.value));
getFID((metric) => console.log("FID:", metric.value));
getFCP((metric) => console.log("FCP:", metric.value));
getLCP((metric) => console.log("LCP:", metric.value));
getTTFB((metric) => console.log("TTFB:", metric.value));
```

## Common Issues

**Widget not loading?**

- Check network tab for embed.js errors
- Verify `<div id="marketplace-widget">` exists
- Check CORS headers on CDN
- Check console for errors (F12)

**Performance slow?**

- Run Lighthouse audit
- Check Network tab for slow requests
- Profile with React DevTools
- Check memory in DevTools → Memory tab

**Cache not working?**

- Check IndexedDB in DevTools → Storage
- Verify browser not in private mode
- Check storage quota: `navigator.storage.estimate()`

**CORS errors?**

- Add Access-Control-Allow-Origin header
- Test with curl: `curl -H "Origin: https://yoursite.com" https://api.example.com`

---

**Most Popular:** Vercel (1 click) | **Most Control:** Self-hosted Docker
