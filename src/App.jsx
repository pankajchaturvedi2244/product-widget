// src/App.jsx
import React, { useCallback } from "react";

import { createStore, actions } from "./store";
import { useAppState } from "./hooks/useAppState";
import { useOnlineStatus } from "./hooks/useOnlineStatus";
import { useTheme } from "./hooks/useTheme";
import { useProductSearch } from "./hooks/useProductSearch";

import {
  SearchBar,
  ComparisonGrid,
  ProductCard,
  ControlsBar,
  ErrorBoundary,
} from "./components";

import "./styles/app.css";


const store = createStore();

const UI_TEXT = {
  TITLE: "Marketplace Comparison Widget",
  TOGGLE_DARK: "🌙 Dark",
  TOGGLE_LIGHT: "☀️ Light",
  ONLINE: "Online",
  OFFLINE: "Offline",
};

const THEMES = {
  LIGHT: "light",
  DARK: "dark",
};

function App() {
  /* -----------------------------
     Global State (Centralized)
  ------------------------------ */
  const {
    products,
    filters,
    sort,
    loading,
    error,
    theme,
    hasSearched,
  } = useAppState(store);

  /* -----------------------------
     Hooks (Isolated Concerns)
  ------------------------------ */
  const isOnline = useOnlineStatus();
  const { searchProducts } = useProductSearch(store);

  useTheme(theme);

  /* -----------------------------
     Event Handlers (Pure Wiring)
  ------------------------------ */

  const handleFilterChange = useCallback(
    (filter, value) => {
      store.dispatch(actions.setFilter(filter, value));
    },
    []
  );

  const handleSortChange = useCallback(
    (field, order) => {
      store.dispatch(actions.setSort(field, order));
    },
    []
  );

  const toggleTheme = useCallback(() => {
    store.dispatch(
      actions.setTheme(
        theme === THEMES.LIGHT ? THEMES.DARK : THEMES.LIGHT
      )
    );
  }, [theme]);

  /* -----------------------------
     Render
  ------------------------------ */

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
          <SearchBar onSearch={searchProducts} loading={loading} />
        </section>

        {/* Controls */}
        <section className="app__section">
          <ControlsBar
            filters={filters}
            sort={sort}
            onFilterChange={handleFilterChange}
            onSortChange={handleSortChange}
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
              <ProductCard
                key={p.id}
                product={p}
                onViewDetails={() => {}}
              />
            )}
          />
        </section>

        {/* Footer Network Status */}
        <footer className="app__footer">
          <span
            className={`status-dot ${
              isOnline
                ? "status-dot--online"
                : "status-dot--offline"
            }`}
          />
          {isOnline ? UI_TEXT.ONLINE : UI_TEXT.OFFLINE}
        </footer>
      </div>
    </ErrorBoundary>
  );
}

export default App;
