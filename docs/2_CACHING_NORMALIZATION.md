# 2. CACHING + NORMALIZATION - COMPACT

## Data Pipeline

```
Search → Cache Check (5ms hit) → API Call (200ms) → Normalize
→ Deduplicate → Score → Save Cache → Render
```

## Normalization Example

```
Input (messy):  { title, stock, thumbnail, price }
Output (clean): { name, inStock, image, price, source }
Adds: reliabilityScore, priceDeviation
```

## Deduplication

- Key: `name.toLowerCase() + Math.round(price)`
- Keep: highest reliability score
- Example: 3 iPhone listings → 1 best (Walmart)

## Reliability Score (0-100)

```
Rating (0-40) + Reviews (0-30) + Source (15-25)
Amazon: 25pts | Walmart: 20pts | eBay: 15pts
```

## Caching Strategy

```
DB: IndexedDB ("marketplace-widget")
TTL: 1 hour
Hit: ~5ms (100x faster than API)
Offline: Returns cached data
```

## Performance

| Operation          | Time  |
| ------------------ | ----- |
| First search       | 500ms |
| Cached search      | 5ms   |
| Normalize 50 items | 2ms   |
| Deduplicate        | 3ms   |

---
