// src/App.jsx
import React, { useEffect, useCallback } from "react";
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
  ErrorBoundary,
  ComparisonGrid,
  LoadingSpinner,
  ControlsBar,
} from "./components/index.jsx";
import { ProductCard } from "./components/ProductCard.jsx";
import "./styles/app.css";
import { MAX_QUERY_LENGTH , MAX_PRICE_LIMIT} from "./configs/appConfig.js";



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
  ONLINE: " Online",
  OFFLINE: " Offline",
};

const store = createStore();
const circuitBreaker = new CircuitBreaker();

function App() {
  const products = useStore(store, selectors.selectSortedProducts);
  const filters = useStore(store, selectors.selectFilters);
  const sort = useStore(store, selectors.selectSort);
  const loading = useStore(store, selectors.selectLoading);
  const error = useStore(store, selectors.selectError);
  const theme = useStore(store, selectors.selectTheme);

  /* ============================
     Theme Effect
  ============================ */
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  /* ============================
     Search Handler
  ============================ */
  const handleSearch = useCallback(async (query) => {
    store.dispatch(actions.setLoading(true));
    store.dispatch(actions.setError(null));

    if (!query || query.length > MAX_QUERY_LENGTH) {
      store.dispatch(actions.setError(ERROR_MESSAGES.INVALID_QUERY));
      store.dispatch(actions.setLoading(false));
      return;
    }

    try {
      const apiFn = (q) =>
        circuitBreaker.execute(() =>
          exponentialBackoff(() => fetchAllAPIs(q))
        );

      let products = await cacheableApiCall(query, apiFn);

      products = products.map((p) => ({
        ...p,
        reliabilityScore: calculateReliabilityScore(p),
      }));

      products = calculatePriceDeviation(products);

      store.dispatch(actions.setProducts(products));
    } catch (err) {
      store.dispatch(
        actions.setError(err.message || ERROR_MESSAGES.FETCH_FAILED)
      );
    }

    store.dispatch(actions.setLoading(false));
  }, []);

  /* ============================
     Filter Handler
  ============================ */
  const handleFilterChange = (filter, value) => {
    if (filter === "maxPrice" && (value < 0 || value > MAX_PRICE_LIMIT)) return;

    if (
      (filter === "inStockOnly" || filter === "fastDeliveryOnly") &&
      typeof value !== "boolean"
    )
      return;

    store.dispatch(actions.setFilter(filter, value));
  };

  /* ============================
     Sort Handler
  ============================ */
  const handleSort = (field, order) => {
    store.dispatch(actions.setSort(field, order));
  };

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
     Online / Offline Indicator
  ============================ */
  const [online, setOnline] = React.useState(navigator.onLine);

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
     Render
  ============================ */
  return (
    <ErrorBoundary>
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: 16,
        }}
      >
        <h1>{UI_TEXT.TITLE}</h1>

        <button
          aria-label="Toggle dark mode"
          onClick={toggleTheme}
          style={{
            background: "var(--color-primary)",
            color: "#fff",
            borderRadius: "var(--border-radius)",
            padding: "8px 16px",
            fontWeight: 600,
          }}
        >
          {theme === THEMES.LIGHT
            ? UI_TEXT.TOGGLE_DARK
            : UI_TEXT.TOGGLE_LIGHT}
        </button>
      </header>

      <section style={{ padding: 16 }}>
        <SearchBar onSearch={handleSearch} loading={loading} />
      </section>

      <section style={{ paddingInline: 16 }}>
        <ControlsBar
          filters={filters}
          onFilterChange={handleFilterChange}
          sort={sort}
          onSortChange={handleSort}
        />
      </section>

      {error && (
        <div
          role="alert"
          style={{ color: "var(--color-warning)", margin: 16 }}
        >
          {error}
        </div>
      )}

      {loading ? (
        <LoadingSpinner message={UI_TEXT.LOADING_PRODUCTS} />
      ) : (
        <ComparisonGrid
          products={products}
          loading={loading}
          renderProduct={(p) => (
            <ProductCard product={p} onViewDetails={() => {}} />
          )}
        />
      )}

      <footer className="footer-indicator" style={{ padding: 16 }}>
        <span className={`dot ${online ? "online" : "offline"}`}></span>
        {online ? UI_TEXT.ONLINE : UI_TEXT.OFFLINE}
      </footer>
    </ErrorBoundary>
  );
}

export default App;
