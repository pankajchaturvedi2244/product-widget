# 1. COMPONENT ARCHITECTURE DIAGRAM

## Visual Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                          App.jsx (Root)                          │
│  ┌─ Global State (Redux Store)                                   │
│  ├─ products, filters, sort, loading, error, theme, hasSearched  │
│  └─ useAppState() hook to access & dispatch                      │
└──────────────────────────────────────────────────────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          │                   │                   │
          ▼                   ▼                   ▼
    ┌──────────────┐   ┌──────────────┐   ┌──────────────┐
    │  SearchBar   │   │ ControlsBar  │   │    Header    │
    │ (debounce)   │   │(filter/sort) │   │ (theme toggle)
    │              │   │              │   │              │
    │ useProducts  │   │ useFilter    │   │ useTheme     │
    │Search hook   │   │ useSort hook │   │ hook         │
    └──────────────┘   └──────────────┘   └──────────────┘
          │                   │                   │
          └───────────────────┼───────────────────┘
                              │
                    dispatch(actions.x)
                              │
                              ▼
    ┌──────────────────────────────────────────────────┐
    │         ComparisonGrid (Virtualized)             │
    │  - Renders only visible items                    │
    │  - ResizeObserver for responsive columns         │
    │  - Handles scroll events                         │
    │  - requestAnimationFrame for smooth scrolling    │
    └──────────────────────────────────────────────────┘
                              │
                 ┌────────────┼────────────┐
                 │            │            │
                 ▼            ▼            ▼
            ┌──────────┐ ┌──────────┐ ┌──────────┐
            │ProductCard│ │ProductCard│ │ProductCard│
            │ (visible) │ │ (visible) │ │ (visible) │
            │           │ │           │ │           │
            │ • Image   │ │ • Image   │ │ • Image   │
            │ • Price   │ │ • Price   │ │ • Price   │
            │ • Rating  │ │ • Rating  │ │ • Rating  │
            │ • Sparkline │ • Sparkline │ • Sparkline │
            │ • Stock   │ │ • Stock   │ │ • Stock   │
            └──────────┘ └──────────┘ └──────────┘
                              │
                         (props)
                   - product (data)
                   - onViewDetails
```

## Component Tree (Hierarchical)

```
App
├── ErrorBoundary (catches React errors)
│   └── Header
│       ├── Title
│       └── ThemeToggle
│
├── SearchBar
│   ├── Input (with debounce)
│   ├── ClearButton
│   └── LoadingSpinner
│
├── ControlsBar
│   ├── ResultsCount
│   ├── SortDropdown (price, rating, popularity)
│   └── Filters
│       ├── InStockCheckbox
│       ├── FastDeliveryCheckbox
│       └── PriceSlider (0-10000)
│
├── ErrorDisplay (shows error message)
│
├── ComparisonGrid (Virtualized)
│   └── VirtualizedGrid (handles virtualization)
│       └── ProductCard (rendered only when visible)
│           ├── Image (lazy loaded)
│           ├── Title
│           ├── Price + Deviation%
│           ├── Rating (stars)
│           ├── Reliability bar
│           ├── Delivery indicator
│           ├── Stock status
│           ├── Sparkline (price history)
│           └── ViewButton
│
└── Footer
    ├── OnlineIndicator (green dot = online, red = offline)
    └── ConnectionStatus
```

## Data Flow

```
User Input
    │
    ├─ Type in SearchBar
    │  └─> debounce (300ms)
    │      └─> useProductSearch hook
    │          └─> store.dispatch(actions.setProducts)
    │
    ├─ Select Filter
    │  └─> ControlsBar onChange
    │      └─> store.dispatch(actions.setFilter)
    │          └─> Selector recomputes filtered products
    │
    └─ Change Sort
       └─> ControlsBar onChange
           └─> store.dispatch(actions.setSort)
               └─> Selector recomputes sorted products
```

## Component Responsibilities

| Component           | Purpose                                        | State        | Props                   |
| ------------------- | ---------------------------------------------- | ------------ | ----------------------- |
| **App**             | Root, manages global state, coordinates layout | Global store | None                    |
| **SearchBar**       | Search input with debounce                     | Local query  | onSearch callback       |
| **ControlsBar**     | Filters & sorting controls                     | None         | filters, sort, handlers |
| **ComparisonGrid**  | Container for virtualized list                 | None         | products, loading       |
| **VirtualizedGrid** | Virtualization logic                           | scrollTop    | items, renderItem       |
| **ProductCard**     | Individual product display                     | None         | product, handlers       |
| **ErrorBoundary**   | Error catching                                 | error state  | children                |
| **SparkLine**       | Price history chart                            | None         | data, height            |

## Performance Optimizations

### VirtualizedGrid

```
Only renders visible items:
- Container height: 600px
- Item height: 520px
- With 500 products: renders only 2-3 items at a time
- Rest are placeholders (divs with height)
- Result: 60fps smooth scrolling
```

### SearchBar Debounce

```
User types → 300ms wait → API call
Prevents 1000 unnecessary API calls on single search
```

### ProductCard Memoization

```
Wrapped with React.memo (recommend implementation)
Only re-renders if product data actually changes
Skips re-renders during filter/sort changes
```

## Hook Structure

```
useAppState(store)           - Get all state & dispatch
useProductSearch(store)      - Handle search logic
useOnlineStatus()            - Track online/offline
useTheme(store)              - Handle theme toggle
useFilter(store)             - Handle filter changes
useSort(store)               - Handle sort changes
```

## Component Communication

```
Props Down ↓          Events Up ↑
─────────────────────────────────
App props                    App event handlers
  ↓                              ↑
SearchBar        onSearch    ← callback
  │                              │
ControlsBar      onFilter    ← callback
  │              onSort      ← callback
  └─→ ComparisonGrid
      └─→ ProductCard (pure presentation)
```

---
