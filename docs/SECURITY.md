# Marketplace Widget Security

## XSS Prevention

- No use of innerHTML or dangerouslySetInnerHTML
- React auto-escapes JSX
- All user input validated

## Input Validation

- Search input: max 500 chars
- Filter values: price 0-5000, booleans only
- API response schema validated

## API Key Safety

- API key accepted via postMessage (same-origin only)
- Stored in memory, not localStorage
- Origin validated on postMessage

## CSP Compliance

- embed.js: no eval, no inline event handlers
- Only external scripts loaded

## Accessibility (WCAG AA)

- Semantic HTML: nav, main, article, section
- ARIA labels on all controls
- Keyboard navigation: tab, enter, arrow keys
- Color contrast ≥4.5:1
- Responsive design: 375px to 1920px

## Other Security Patterns

- Circuit breaker for API resilience
- Rate limiting for API calls
- Offline fallback via IndexedDB
