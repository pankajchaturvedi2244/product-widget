// src/components/index.js
// Marketplace widget UI components

import React, { useState, useRef, useEffect } from "react";
import VirtualizedGrid from "./VirtualizedGrid";
 
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
    if ( debouncedQuery.length < 500) {
      onSearch(debouncedQuery);
    }
  }, [debouncedQuery, onSearch]);

  return (
    <form
      role="search"
      aria-label="Product search"
      onSubmit={(e) => e.preventDefault()}
   
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
export function ComparisonGrid({
  products,
  loading,
  hasSearched,
  renderProduct,
}) {
  if (!hasSearched) {
    return (
      <EmptyState message="Start typing to search products..." />
    );
  }

  if (loading) {
    return <SkeletonLoader count={3} />;
  }

  if (!products.length) {
    return <EmptyState message="No products found." />;
  }

  return (
    <VirtualizedGrid
      items={products}
      rowHeight={520}
      minItemWidth={300}
      renderItem={renderProduct}
    />
  );
}




export {ProductCard}  from "./ProductCard";
export { ControlsBar } from "./ControlsBar";
export { ErrorBoundary } from "./ErrorBoundary";
