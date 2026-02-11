// src/components/index.js
// Marketplace widget UI components

import React, { useState, useRef, useEffect } from "react";
import { MAX_PRICE_LIMIT } from "../configs/appConfig";

// Debounce utility
function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler); 
  }, [value, delay]);
  return debounced;
}

// SearchBar Component

export function SearchBar({ onSearch, loading }) {
  const [query, setQuery] = useState("");

  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (debouncedQuery && debouncedQuery.length < 500) {
      onSearch(debouncedQuery);
    }
  }, [debouncedQuery, onSearch]);

  return (
    <form
      role="search"
      aria-label="Product search"
      onSubmit={(e) => e.preventDefault()}
      style={{
        marginBottom: 24,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          background: "var(--color-bg)",
          color: "var(--color-text)",
          borderRadius: 16,
          padding: "10px 14px",
          boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
          border: "1px solid #e5e7eb",
        }}
      >
        {/* Search Icon */}
        <span style={{ fontSize: 18, opacity: 0.6 }}>🔍</span>

        {/* Input */}
        <input
          aria-label="Search products"
          type="text"
          value={query}
          placeholder="Search products (e.g. iPhone, MacBook...)"
          onChange={(e) => setQuery(e.target.value)}
          maxLength={500}
          autoComplete="off"
          style={{
            flex: 1,
            border: "none",
            outline: "none",
            fontSize: 15,
            background: "transparent",
          }}
        />

        {/* Clear Button */}
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            style={{
              border: "none",
              background: "transparent",
              cursor: "pointer",
              fontSize: 16,
              opacity: 0.6,
            }}
          >
            ✕
          </button>
        )}

        {/* Loading Spinner Inline */}
        {loading && (
         <LoadingSpinner message="Searching..." />
        )}
      </div>

      {/* Micro helper text */}
      <div style={{ fontSize: 12, color: "#6b7280", marginTop: 6 }}>
        Compare prices across Amazon, eBay & Walmart
      </div>
 
    </form>
  );
}

// ErrorBoundary Component
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  componentDidCatch(error, info) {
    console.error("ErrorBoundary:", error, info);
  }
  handleRetry = () => {
    this.setState({ error: null });
    if (this.props.onRetry) this.props.onRetry();
  };
  render() {
    if (this.state.error) {
      return (
        <div role="alert" style={{ color: "var(--color-warning)" }}>
          <p>Something went wrong.</p>
          <button aria-label="Try Again" onClick={this.handleRetry}>
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// FilterControls Component
export function ControlsBar({ filters, onFilterChange, sort, onSortChange }) {
  return (
    <section
      aria-label="Marketplace controls"
      style={{
        background: "var(--color-bg)",
        color: "var(--color-text)",
        borderRadius: "var(--border-radius)",
        padding: 16,
        boxShadow: "var(--shadow-md)",
        border: "1px solid #f1f5f9",
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}
    >
      {/* Top Row: Sort */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <span
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: "var(--color-primary)",
          }}
        >
          Sort By
        </span>

        <div style={{ position: "relative", minWidth: 200 }}>
          <select
            aria-label="Sort products"
            value={`${sort.field}-${sort.order}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split("-");
              onSortChange(field, order);
            }}
            style={{
              width: "100%",
              appearance: "none",
              background: "var(--color-bg)",
              border: "1px solid #e5e7eb",
              borderRadius: 10,
              padding: "8px 36px 8px 12px",
              fontSize: 14,
              fontWeight: 500,
              color: "var(--color-text)",
              cursor: "pointer",
            }}
          >
            <option value="price-asc">Price (Low to High)</option>
            <option value="price-desc">Price (High to Low)</option>
            <option value="rating-desc">Rating</option>
            <option value="reviews-desc">Popularity</option>
          </select>

          <span
            style={{
              position: "absolute",
              right: 12,
              top: "50%",
              transform: "translateY(-50%)",
              pointerEvents: "none",
              fontSize: 12,
              color: "#6b7280",
            }}
          >
            ▼
          </span>
        </div>
      </div>

      {/* Divider */}
      <div
        style={{
          height: 1,
          background: "#e5e7eb",
          width: "100%",
        }}
      />

      {/* Filters Section */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        {/* Checkbox Filters */}
        <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              cursor: "pointer",
              fontWeight: 500,
            }}
          >
            <input
              type="checkbox"
              checked={filters.inStockOnly}
              onChange={(e) =>
                onFilterChange("inStockOnly", e.target.checked)
              }
              style={{
                width: 18,
                height: 18,
                accentColor: "var(--color-primary)",
                cursor: "pointer",
              }}
            />
            In Stock Only
          </label>

          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              cursor: "pointer",
              fontWeight: 500,
            }}
          >
            <input
              type="checkbox"
              checked={filters.fastDeliveryOnly}
              onChange={(e) =>
                onFilterChange("fastDeliveryOnly", e.target.checked)
              }
              style={{
                width: 18,
                height: 18,
                accentColor: "var(--color-primary)",
                cursor: "pointer",
              }}
            />
            Fast Delivery (&lt;48h)
          </label>
        </div>

        {/* Price Slider */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontWeight: 500,
            }}
          >
            <span>Max Price</span>
            <span
              style={{
                color: "var(--color-primary)",
                fontWeight: 600,
              }}
            >
              ${filters.maxPrice}
            </span>
          </div>

          <input
            type="range"
            min={10}
            max={MAX_PRICE_LIMIT}
            value={filters.maxPrice}
            onChange={(e) =>
              onFilterChange("maxPrice", Number(e.target.value))
            }
            style={{
              width: "90%",
              cursor: "pointer",
              accentColor: "var(--color-primary)",
            }}
          />
        </div>
      </div>
    </section>
  );
}

// SkeletonLoader Component
export function SkeletonLoader({ count = 3, height = 100 }) {
  return (
    <div aria-label="Loading skeletons">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          style={{
            height,
            margin: "8px 0",
            background: "var(--color-bg)",
            borderRadius: "var(--border-radius)",
            boxShadow: "var(--shadow-md)",
            animation: "pulse 1.5s infinite",
          }}
        />
      ))}
    </div>
  );
}

// LoadingSpinner Component
// LoadingSpinner Component
export function LoadingSpinner({ message }) {
  return (
    <div className="loading-spinner" aria-label="Loading">
      <span className="loading-spinner__icon" />
      {message && (
        <span className="loading-spinner__text">
          {message}
        </span>
      )}
    </div>
  );
}


// EmptyState Component
export function EmptyState({ message }) {
  return (
    <div
      aria-label="No products found"
      style={{ color: "var(--color-text)", textAlign: "center", padding: 32 }}
    >
      <p>{message || "No products found."}</p>
    </div>
  );
}

// ComparisonGrid Component
export function ComparisonGrid({ products, loading, renderProduct }) {
  if (loading) return <SkeletonLoader count={products.length || 3} />;
  if (!products.length) return <EmptyState message="No products found." />;
  return (
    <main
      aria-label="Product comparison grid"
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
        gap: 16,
      }}
    >
      {products.map((p) => renderProduct(p))}
    </main>
  );
}

// VirtualList Component (optional)
export function VirtualList({
  items,
  itemHeight,
  containerHeight,
  renderItem,
}) {
  const [scrollTop, setScrollTop] = useState(0);
  const ref = useRef();
  const totalHeight = items.length * itemHeight;
  const startIdx = Math.floor(scrollTop / itemHeight);
  const endIdx = Math.min(
    items.length,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + 5,
  );
  const visibleItems = items.slice(startIdx, endIdx);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onScroll = () => setScrollTop(el.scrollTop);
    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <div
      ref={ref}
      style={{
        height: containerHeight,
        overflowY: "auto",
        position: "relative",
      }}
    >
      <div style={{ height: totalHeight, position: "relative" }}>
        {visibleItems.map((item, i) => (
          <div
            key={startIdx + i}
            style={{
              position: "absolute",
              top: (startIdx + i) * itemHeight,
              height: itemHeight,
              width: "100%",
            }}
          >
            {renderItem(item)}
          </div>
        ))}
      </div>
    </div>
  );
}
