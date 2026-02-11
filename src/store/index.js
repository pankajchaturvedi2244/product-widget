// src/store/index.js
// Custom Store implementation for marketplace-widget

import { useEffect, useState, useRef } from "react";

// Store class
class Store {
  constructor(initialState, reducer, middlewares = []) {
    this.state = initialState;
    this.reducer = reducer;
    this.middlewares = middlewares;
    this.listeners = [];
    this.isDispatching = false;
  }

  dispatch(action) {
    if (this.isDispatching) throw new Error("Reducers may not dispatch");
    this.isDispatching = true;
    let nextState = this.reducer(this.state, action);
    this.isDispatching = false;
    // Middleware
    for (const mw of this.middlewares) {
      nextState = mw(this.state, action, nextState);
    }
    this.state = nextState;
    this.listeners.forEach((cb) => cb(this.state));
  }

  subscribe(cb) {
    this.listeners.push(cb);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== cb);
    };
  }

  getState(selector) {
    return selector ? selector(this.state) : this.state;
  }
}

// useStore hook
export function useStore(store, selector) {
  const [selected, setSelected] = useState(() => store.getState(selector));
  const selectorRef = useRef(selector);

  useEffect(() => {
    selectorRef.current = selector;
    setSelected(store.getState(selector));
    const unsubscribe = store.subscribe((state) => {
      setSelected(selectorRef.current ? selectorRef.current(state) : state);
    });
    return unsubscribe;
  }, [store, selector]);

  return selected;
}

// Actions
export const actions = {
  setProducts: (products) => ({ type: "SET_PRODUCTS", payload: products }),
  setFilter: (filter, value) => ({
    type: "SET_FILTER",
    payload: { filter, value },
  }),
  setSort: (field, order) => ({ type: "SET_SORT", payload: { field, order } }),
  setTheme: (theme) => ({ type: "SET_THEME", payload: theme }),
  setLoading: (loading) => ({ type: "SET_LOADING", payload: loading }),
  setError: (error) => ({ type: "SET_ERROR", payload: error }),
  resetSort: () => ({ type: "RESET_SORT" }),
  setHasSearched: (hasSearched) => ({
    type: "SET_HAS_SEARCHED",
    payload: hasSearched,
  }),
  resetFilters: () => ({ type: "RESET_FILTERS" }),
};

// Selectors
export const selectors = {
  selectProducts: (state) => state.products,
  selectFilteredProducts: (state) => {
    let products = state.products || [];
    if (state.filters.inStockOnly) products = products.filter((p) => p.inStock);
    if (state.filters.fastDeliveryOnly)
      products = products.filter((p) => p.deliveryDays <= 2);
    if (typeof state.filters.maxPrice === "number")
      products = products.filter((p) => p.price <= state.filters.maxPrice);
    return products;
  },
  selectSortedProducts: (state) => {
    let products = selectors.selectFilteredProducts(state);
    const { field, order } = state.sort;
    if (!field) return products;
    return [...products].sort((a, b) => {
      if (order === "asc") return a[field] - b[field];
      if (order === "desc") return b[field] - a[field];
      return 0;
    });
  },
  selectTheme: (state) => state.theme,
  selectLoading: (state) => state.loading,
  selectError: (state) => state.error,
  selectFilters: (state) => state.filters,
  selectSort: (state) => state.sort,

  selectHasSearched: (state) => state.hasSearched,
};

// Reducer
export function reducer(state, action) {
  switch (action.type) {
    case "SET_PRODUCTS":
      return { ...state, products: action.payload };
    case "SET_FILTER":
      return {
        ...state,
        filters: {
          ...state.filters,
          [action.payload.filter]: action.payload.value,
        },
      };
    case "SET_SORT":
      return {
        ...state,
        sort: { field: action.payload.field, order: action.payload.order },
      };
    case "RESET_SORT":
      return {
        ...state,
        sort: { field: "price", order: "asc" },
      };
    case "RESET_FILTERS":
      return {
        ...state,
        filters: {
          inStockOnly: false,
          fastDeliveryOnly: false,
          maxPrice: 5000,
        },
      };
    case "SET_HAS_SEARCHED":
      return { ...state, hasSearched: action.payload };

    case "SET_THEME":
      return { ...state, theme: action.payload };
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload };
    default:
      return state;
  }
}

// Initial state
export const initialState = {
  products: [],
  filters: {
    inStockOnly: false,
    fastDeliveryOnly: false,
    maxPrice: 5000,
  },
  sort: {
    field: "price",
    order: "asc",
  },
  hasSearched: false,
  theme: "light",
  loading: false,
  error: null,
};

// Factory
export function createStore(
  initState = initialState,
  customReducer = reducer,
  middlewares = [],
) {
  return new Store(initState, customReducer, middlewares);
}
