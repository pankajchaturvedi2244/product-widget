# Marketplace Widget Architecture

## Overview

This document describes the architecture of the embeddable marketplace comparison widget. The widget is designed for resilience, offline support, accessibility, and security, following enterprise-grade React patterns.

## File Structure

```
marketplace-widget/
├── src/
│   ├── store/
│   │   └── index.js
│   ├── services/
│   │   ├── api.js
│   │   └── cache.js
│   ├── utils/
│   │   └── resilience.js
│   ├── components/
│   │   ├── index.js
│   │   └── ProductCard.jsx
│   ├── styles/
│   │   └── app.css
│   ├── App.jsx
│   ├── main.jsx
│   └── embed.js
├── package.json
├── vite.config.js
└── docs/
    ├── ARCHITECTURE.md
    └── SECURITY.md
```

## State Management

- Custom Store class (no Redux)
- Actions, selectors, reducer pattern
- useStore hook for React integration

## Data Layer

- API normalization for Amazon, eBay, Walmart
- Deduplication, reliability scoring, price deviation
- Rate limiter for API requests

## Caching Layer

- IndexedDB via idb
- TTL-based cache, offline fallback

## Resilience Patterns

- Exponential backoff
- Circuit breaker
- Bulk operation queue
- Timeout wrapper

## UI Components

- SearchBar, ErrorBoundary, FilterControls, SortControls, SkeletonLoader, LoadingSpinner, EmptyState, ComparisonGrid, VirtualList, ProductCard, Sparkline

## Styling

- CSS custom properties for theming
- Responsive grid, dark mode, WCAG AA compliance

## Embedding

- Lightweight embed.js loader
- CSP-safe, postMessage API key exchange

## Entry Point

- main.jsx auto-mounts widget

## Build Output

- dist/widget.js, dist/embed.js, dist/widget.css

## Accessibility & Security

- Semantic HTML, ARIA labels, keyboard navigation
- XSS prevention, input validation, CSP compliance
