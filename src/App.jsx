// src/App.jsx
import React, { useEffect, useCallback, useState } from "react";
import {
  createStore,
  actions,
  selectors,
  useStore,
} from "./store/index.js";
import {
  fetchAllAPIs,
  calculateReliabilityScore,
  calculatePriceDeviation,
} from "./services/api.js";
import { cacheableApiCall } from "./services/cache.js";
import { exponentialBackoff, CircuitBreaker } from "./utils/resilience.js";

import {
  SearchBar,
  
  ComparisonGrid,
  
} from "./components/index.jsx";
import { ErrorBoundary } from "./components/ErrorBoundary.jsx";

import { ProductCard } from "./components/ProductCard.jsx";

import "./styles/app.css";
import { MAX_QUERY_LENGTH, MAX_PRICE_LIMIT } from "./configs/appConfig.js";
import { ControlsBar } from "./components/ControlsBar.jsx";

/* ============================
   Constants
============================ */

const ERROR_MESSAGES = {
  INVALID_QUERY: "Invalid search query",
  FETCH_FAILED: "Failed to fetch products",
};

const THEMES = {
  LIGHT: "light",
  DARK: "dark",
};

const UI_TEXT = {
  TITLE: "Marketplace Comparison Widget",
  TOGGLE_DARK: "🌙 Dark",
  TOGGLE_LIGHT: "☀️ Light",
  LOADING_PRODUCTS: "Loading products...",
  ONLINE: "Online",
  OFFLINE: "Offline",
};

const store = createStore();
const circuitBreaker = new CircuitBreaker();

/* ============================
   App Component
============================ */

function App() {
  const products = useStore(store, selectors.selectSortedProducts);
  const filters = useStore(store, selectors.selectFilters);
  const sort = useStore(store, selectors.selectSort);
  const loading = useStore(store, selectors.selectLoading);
  const error = useStore(store, selectors.selectError);
  const theme = useStore(store, selectors.selectTheme);
  const hasSearched = useStore(store, selectors.selectHasSearched);


  const [online, setOnline] = useState(navigator.onLine);

  /* ============================
     Theme Effect
  ============================ */
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  /* ============================
     Online / Offline Listener
  ============================ */
  useEffect(() => {
    const updateOnline = () => setOnline(navigator.onLine);
    window.addEventListener("online", updateOnline);
    window.addEventListener("offline", updateOnline);

    return () => {
      window.removeEventListener("online", updateOnline);
      window.removeEventListener("offline", updateOnline);
    };
  }, []);

  /* ============================
     Search Handler
  ============================ */
const handleSearch = useCallback(async (query) => {
  const trimmedQuery = query?.trim();

  // Fresh reset state
  if (!trimmedQuery) {
    store.dispatch(actions.setProducts([]));
    store.dispatch(actions.setError(null));
    store.dispatch(actions.setHasSearched(false));
    store.dispatch(actions.setLoading(false));
    return;
  }

  if (trimmedQuery.length > MAX_QUERY_LENGTH) {
    store.dispatch(actions.setError(ERROR_MESSAGES.INVALID_QUERY));
    return;
  }

  store.dispatch(actions.setLoading(true));
  store.dispatch(actions.setError(null));
  store.dispatch(actions.setHasSearched(true));

  try {
    const apiFn = (q) =>
      circuitBreaker.execute(() =>
        exponentialBackoff(() => fetchAllAPIs(q))
      );

    let results = await cacheableApiCall(trimmedQuery, apiFn);

    results = results.map((p) => ({
      ...p,
      reliabilityScore: calculateReliabilityScore(p),
    }));

    results = calculatePriceDeviation(results);

    store.dispatch(actions.setProducts(results));
  } catch (err) {
    store.dispatch(
      actions.setError(err.message || ERROR_MESSAGES.FETCH_FAILED)
    );
  } finally {
    store.dispatch(actions.setLoading(false));
  }
}, []);



  /* ============================
     Filter Handler
  ============================ */
  const handleFilterChange = useCallback((filter, value) => {
    if (filter === "maxPrice") {
      if (value < 0 || value > MAX_PRICE_LIMIT) return;
    }

    if (
      (filter === "inStockOnly" || filter === "fastDeliveryOnly") &&
      typeof value !== "boolean"
    ) {
      return;
    }

    store.dispatch(actions.setFilter(filter, value));
  }, []);

  /* ============================
     Sort Handler
  ============================ */
  const handleSort = useCallback((field, order) => {
    store.dispatch(actions.setSort(field, order));
  }, []);

  /* ============================
     Theme Toggle
  ============================ */
  const toggleTheme = () => {
    store.dispatch(
      actions.setTheme(
        theme === THEMES.LIGHT ? THEMES.DARK : THEMES.LIGHT
      )
    );
  };

  /* ============================
     Render
  ============================ */
  return (
    <ErrorBoundary>
      <div className="app">
        {/* Header */}
        <header className="app__header">
          <h1 className="app__title">{UI_TEXT.TITLE}</h1>

          <button
            className="app__theme-toggle"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {theme === THEMES.LIGHT
              ? UI_TEXT.TOGGLE_DARK
              : UI_TEXT.TOGGLE_LIGHT}
          </button>
        </header>

        {/* Search */}
        <section className="app__section">
          <SearchBar onSearch={handleSearch} loading={loading} />
        </section>

        {/* Controls */}
        <section className="app__section">
          <ControlsBar
            filters={filters}
            onFilterChange={handleFilterChange}
            sort={sort}
            onSortChange={handleSort}
            totalResults={products.length}
          />
        </section>

        {/* Error */}
        {error && (
          <div role="alert" className="app__error">
            {error}
          </div>
        )}

        {/* Grid */}
        <section className="app__section">
          <ComparisonGrid
           hasSearched={hasSearched}
            products={products}
            loading={loading}
            renderProduct={(p) => (
              <ProductCard product={p} onViewDetails={() => {}} />
            )}
          />
        </section>

        {/* Footer Indicator */}
        <footer className="app__footer">
          <span
            className={`status-dot ${
              online ? "status-dot--online" : "status-dot--offline"
            }`}
          />
          {online ? UI_TEXT.ONLINE : UI_TEXT.OFFLINE}
        </footer>
      </div>
    </ErrorBoundary>
  );
}

export default App;
