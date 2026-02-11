// src/components/ProductCard.jsx
// ProductCard and Sparkline components

import React from 'react';
import { Sparkline } from './SparkLine';



// ProductCard Component
export function ProductCard({ product, onViewDetails }) {
  const isBestDeal = product.priceDeviation <= 0;
  const reliabilityColor =
    product.reliabilityScore > 75 ? "#16a34a" :
    product.reliabilityScore > 50 ? "#f59e0b" :
    "#dc2626";

  return (
    <article
      role="article"
      style={{
        background: "var(--color-bg)",
        borderRadius: 16,
        boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
        padding: 16,
        display: "flex",
        flexDirection: "column",
        gap: 12,
        transition: "transform .2s ease, box-shadow .2s ease",
      }}
    >
      {/* IMAGE + SOURCE */}
      <div style={{ position: "relative" }}>
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          style={{
            width: "100%",
            height: 150,
            objectFit: "contain",
            borderRadius: 12,
            background: "#f8fafc",
          }}
        />

        <span
          style={{
            position: "absolute",
            top: 8,
            left: 8,
            background: "#111827",
            color: "#fff",
            padding: "4px 10px",
            fontSize: 12,
            fontWeight: 600,
            borderRadius: 999,
            textTransform: "uppercase",
          }}
        >
          {product.source}
        </span>

        {isBestDeal && (
          <span
            style={{
              position: "absolute",
              top: 8,
              right: 8,
              background: "#16a34a",
              color: "#fff",
              padding: "4px 10px",
              fontSize: 12,
              fontWeight: 600,
              borderRadius: 999,
            }}
          >
            Best Deal
          </span>
        )}
      </div>

      {/* TITLE */}
      <h3 style={{ fontSize: 16, fontWeight: 600, lineHeight: 1.3 }}>
        {product.name}
      </h3>

      {/* PRICE */}
      <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
        <span style={{ fontSize: 22, fontWeight: 700 }}>
          ${product.price.toFixed(2)}
        </span>

        <span
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: isBestDeal ? "#16a34a" : "#dc2626",
          }}
        >
          {product.priceDeviation > 0 ? "+" : ""}
          {product.priceDeviation}%
        </span>
      </div>

      {/* RATING */}
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ color: "#facc15" }}>
          {"★".repeat(Math.round(product.rating))}
        </span>
        <span style={{ fontSize: 13, color: "#6b7280" }}>
          ({product.reviews.toLocaleString()} reviews)
        </span>
      </div>

      {/* RELIABILITY */}
      <div>
        <div
          style={{
            height: 6,
            width: "100%",
            background: "#e5e7eb",
            borderRadius: 999,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${product.reliabilityScore}%`,
              height: "100%",
              background: reliabilityColor,
            }}
          />
        </div>
        <span style={{ fontSize: 12, color: "#6b7280" }}>
          Reliability: {product.reliabilityScore}/100
        </span>
      </div>

      {/* DELIVERY + STOCK */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 13,
        }}
      >
        <span>
          🚚 {product.deliveryDays} days{" "}
          {product.deliveryDays <= 2 && (
            <strong style={{ color: "#16a34a" }}>Fast</strong>
          )}
        </span>

        <span
          style={{
            fontWeight: 600,
            color: product.inStock ? "#16a34a" : "#dc2626",
          }}
        >
          {product.inStock ? "In Stock" : "Out of Stock"}
        </span>
      </div>

      {/* SPARKLINE */}
      {product.priceHistory?.length > 1 && (
        <div>
          <span style={{ fontSize: 12, color: "#6b7280" }}>
            Price trend
          </span>
          <Sparkline data={product.priceHistory} height={40} />
        </div>
      )}

      {/* ACTIONS */}
      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
        <a
          href={product.url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            flex: 1,
            textAlign: "center",
            background: "#2563eb",
            color: "#fff",
            padding: "10px 0",
            borderRadius: 10,
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          View
        </a>

        <button
          onClick={() => onViewDetails(product)}
          style={{
            flex: 1,
            background: "#fff",
            border: "1px solid #2563eb",
            color: "#2563eb",
            padding: "10px 0",
            borderRadius: 10,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Details
        </button>
      </div>
    </article>
  );
}

