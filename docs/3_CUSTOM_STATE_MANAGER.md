# 3. CUSTOM STATE MANAGER - COMPACT

## Store Class (180 lines)

```javascript
dispatch(action); // Send action
subscribe(callback); // Listen to changes
getState(selector); // Get state/slice
```

## Key Components

**Actions (8 total):**

```
setProducts, setFilter, setSort, setTheme, setLoading,
setError, resetFilters, resetSort
```

**Selectors (7 total):**

```
selectProducts, selectFilters, selectSort, selectTheme,
selectLoading, selectError, selectSortedProducts (computed)
```

**Reducer:** Pure function `(state, action) → newState`

## Usage

```javascript
// Create store
const store = createStore();

// Get state
const products = useStore(store, selectSortedProducts);

// Dispatch action
store.dispatch(actions.setFilter("inStockOnly", true));
```

## Initial State

```javascript
{
  products: [],
  filters: { inStockOnly, fastDeliveryOnly, maxPrice: 5000 },
  sort: { field: 'price', order: 'asc' },
  theme: 'light',
  loading: false,
  error: null
}
```

## Flow

```
dispatch(action) → reducer processes → state updated
→ selectors recompute → components re-render
```

## Why Custom?

- Small bundle (2KB vs Redux 40KB)
- No dependencies
- Exact features needed only
- Redux pattern familiar
