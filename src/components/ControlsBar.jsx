import React from "react";
import "./ControlsBar.css";

export function ControlsBar({
  filters,
  onFilterChange,
  sort,
  onSortChange,
  totalResults,
}) {
  return (
    <section
      className="controls"
      aria-label="Marketplace controls"
    >
      {/* Header Row */}
      <div className="controls__header">
        <div className="controls__results" aria-live="polite">
          {typeof totalResults === "number" && (
            <span>{totalResults} results found</span>
          )}
        </div>

        <div className="controls__sort">
          <label htmlFor="sort-select" className="controls__label">
            Sort By
          </label>

          <div className="controls__select-wrapper">
            <select
              id="sort-select"
              aria-label="Sort products"
              value={`${sort.field}-${sort.order}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split("-");
                onSortChange(field, order);
              }}
              className="controls__select"
            >
              <option value="price-asc">Price (Low → High)</option>
              <option value="price-desc">Price (High → Low)</option>
              <option value="rating-desc">Rating</option>
              <option value="reviews-desc">Popularity</option>
            </select>
            <span className="controls__caret">▼</span>
          </div>
        </div>
      </div>

      <div className="controls__divider" />

      {/* Filters */}
      <fieldset className="controls__fieldset">
        <legend className="controls__legend">Filters</legend>

        <div className="controls__checkbox-group">
          <label className="controls__checkbox">
            <input
              type="checkbox"
              checked={filters.inStockOnly}
              onChange={(e) =>
                onFilterChange("inStockOnly", e.target.checked)
              }
            />
            <span>In Stock Only</span>
          </label>

          <label className="controls__checkbox">
            <input
              type="checkbox"
              checked={filters.fastDeliveryOnly}
              onChange={(e) =>
                onFilterChange("fastDeliveryOnly", e.target.checked)
              }
            />
            <span>Fast Delivery (&lt;48h)</span>
          </label>
        </div>

        {/* Price Filter */}
        <div className="controls__price">
          <div className="controls__price-header">
            <label htmlFor="price-range">Max Price</label>
            <span className="controls__price-value">
              ${filters.maxPrice}
            </span>
          </div>

          <input
            id="price-range"
            type="range"
            min={10}
            max={5000}
            value={filters.maxPrice}
            onChange={(e) =>
              onFilterChange("maxPrice", Number(e.target.value))
            }
            className="controls__slider"
            aria-describedby="price-help"
          />

          <div id="price-help" className="controls__help">
            Adjust maximum acceptable price
          </div>
        </div>
      </fieldset>
    </section>
  );
}
