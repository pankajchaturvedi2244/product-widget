# State Manager - Compact Guide

## Overview

Custom Redux-like store (no dependencies). Single source of truth with pub-sub pattern.

## Store API

```javascript
import { store, actions, selectors, useStore } from './store/index.js';

// Dispatch action
store.dispatch(actions.setProducts(data));

// Read state (in components)
const products = useStore(store, selectors.selectSortedProducts);
```

## Actions

```javascript
actions.setProducts(products)              // Update products
actions.setFilter(filter, value)           // Set filter (inStockOnly, fastDeliveryOnly, maxPrice)
actions.setSort(field, order)              // Sort by field (price, rating, reviews) + order (asc/desc)
actions.setTheme('light' | 'dark')         // Toggle theme
actions.setLoading(true/false)             // Loading state
actions.setError(message)                  // Error state
actions.setHasSearched(true/false)         // Track if user searched
```

## Selectors

```javascript
selectors.selectProducts                   // All products
selectors.selectFilteredProducts           // Apply filters
selectors.selectSortedProducts             // Filter + sort (use this!)
selectors.selectFilters                    // Current filters
selectors.selectSort                       // Current sort
selectors.selectTheme                      // Current theme
selectors.selectLoading                    // Loading state
selectors.selectError                      // Error message
```

## Usage Example

```javascript
function App() {
  const products = useStore(store, selectors.selectSortedProducts);
  const filters = useStore(store, selectors.selectFilters);
  const loading = useStore(store, selectors.selectLoading);
  
  const handleSearch = async (query) => {
    store.dispatch(actions.setLoading(true));
    try {
      const results = await fetchAllAPIs(query);
      store.dispatch(actions.setProducts(results));
    } catch (err) {
      store.dispatch(actions.setError(err.message));
    } finally {
      store.dispatch(actions.setLoading(false));
    }
  };
  
  const handleFilterChange = (filter, value) => {
    store.dispatch(actions.setFilter(filter, value));
  };
  
  return (
    <div>
      <SearchBar onSearch={handleSearch} loading={loading} />
      <ControlsBar filters={filters} onFilterChange={handleFilterChange} />
      <ComparisonGrid products={products} loading={loading} />
    </div>
  );
}
```

## How It Works

1. **Action:** Plain object with `type` and `payload`
2. **Reducer:** Pure function (state, action) → newState
3. **Store:** Holds state, accepts dispatches, notifies subscribers
4. **useStore Hook:** React integration with selector
5. **Selectors:** Compute derived state (filter, sort, etc.)

## Performance Tips

```javascript
// ✅ Good: Subscribe to specific state slice
const products = useStore(store, selectors.selectSortedProducts);

// ❌ Avoid: Subscribe to all state (re-renders on any change)
const state = useStore(store, s => s);

// ✅ Wrap dispatch handlers in useCallback
const handleSearch = useCallback(async (query) => {
  // ...
}, []);
```

## Initial State

```javascript
{
  products: [],
  filters: {
    inStockOnly: false,
    fastDeliveryOnly: false,
    maxPrice: 5000
  },
  sort: { field: 'price', order: 'asc' },
  hasSearched: false,
  theme: 'light',
  loading: false,
  error: null
}
```

## Common Patterns

**Clear search:**
```javascript
store.dispatch(actions.setProducts([]));
store.dispatch(actions.setError(null));
store.dispatch(actions.setHasSearched(false));
```

**Reset filters:**
```javascript
store.dispatch(actions.setFilter('inStockOnly', false));
store.dispatch(actions.setFilter('fastDeliveryOnly', false));
store.dispatch(actions.setFilter('maxPrice', 5000));
```

**Toggle dark mode:**
```javascript
const currentTheme = store.getState(selectors.selectTheme);
store.dispatch(actions.setTheme(currentTheme === 'light' ? 'dark' : 'light'));
```

## Testing

```javascript
// Create test store
const testStore = createStore(initialState, reducer, []);

// Dispatch actions
testStore.dispatch(actions.setProducts([{ id: 1, name: 'Test' }]));

// Check state
const products = testStore.getState(selectors.selectProducts);
assert(products.length === 1);
```

---

**Key Rule:** Actions → Reducer → Store → Subscribers → Re-render
