// src/services/api.js
// Marketplace API layer: fetch, normalize, deduplicate, reliability, rate limiting

import { MOCK_API_DATA } from "../store/products";
const BASE_API = "https://dummyjson.com/products/search?q=";

const API_ENDPOINTS = {
  amazon: "https://api.amazon.com/products",
  ebay: "https://api.ebay.com/products",
  walmart: "https://api.walmart.com/products",
};

export async function fetchFromAPI(apiName, query, signal) {
  const resp = await fetch(`${BASE_API}${query}`, { signal });
  const data = await resp.json();

  const priceMultiplier = {
    amazon: 1,
    ebay: 0.9,
    walmart: 1.05,
  };

  const adjusted = {
    products: data.products.map((p) => ({
      id: p.id,
      name: p.title,
      price: Math.round(p.price * priceMultiplier[apiName]),
      rating: p.rating,
      reviews: Math.floor(Math.random() * 10000),
      inStock: p.stock > 0,
      deliveryDays: 2 + Math.floor(Math.random() * 4),
      image: p.thumbnail,
      url: "#",
      priceHistory: [
        p.price + 50,
        Math.round(p.price * priceMultiplier[apiName]),
        Math.round(p.price * priceMultiplier[apiName]) + 30,
      ],
    })),
  };

  return normalizeProducts(apiName, adjusted);
}

export async function fetchAllAPIs(query) {
  const abortController = new AbortController();
  const promises = [
    fetchFromAPI("amazon", query, abortController.signal),
    fetchFromAPI("ebay", query, abortController.signal),
    fetchFromAPI("walmart", query, abortController.signal),
  ];

  const results = await Promise.all(promises);
  console.log("Fetching from APIs:", API_ENDPOINTS, results);
  return deduplicateProducts(results.flat());
}

function normalizeProducts(source, data) {
  // Schema normalization
  if (!data || !Array.isArray(data.products)) {
    console.warn(`[normalizeProducts] Malformed data for ${source}:`, data);
    return [];
  }
  return data.products.map((p) => ({
    id: `${source}-${p.id}`,
    source,
    name: p.name,
    price: p.price,
    rating: p.rating,
    reviews: p.reviews,
    inStock: p.inStock,
    deliveryDays: p.deliveryDays,
    image: p.image,
    url: p.url,
    priceHistory: p.priceHistory || [],
    reliabilityScore: calculateReliabilityScore({ ...p, source }),
    priceDeviation: 0, // Will be calculated later
  }));
}

export function deduplicateProducts(products) {
  // Remove duplicates by name/price similarity
  const seen = new Map();
  for (const p of products) {
    const key = `${p.name.toLowerCase()}-${Math.round(p.price)}`;
    if (!seen.has(key)) seen.set(key, p);
    else {
      // Prefer higher reliability score
      if (p.reliabilityScore > seen.get(key).reliabilityScore) seen.set(key, p);
    }
  }
  return Array.from(seen.values());
}

export function calculateReliabilityScore(product) {
  // Rating weight
  const ratingWeight = Math.min(product.rating * 20, 40);
  // Reviews weight
  const reviewsWeight = Math.min((product.reviews / 1000) * 30, 30);
  // Source weight
  const sourceWeight =
    product.source === "amazon" ? 25
    : product.source === "walmart" ? 20
    : 15;
  const score = ratingWeight + reviewsWeight + sourceWeight;
  return Math.max(0, Math.min(100, Math.round(score)));
}

export function calculatePriceDeviation(products) {
  // % difference from average price
  if (!products.length) return [];
  const avg = products.reduce((sum, p) => sum + p.price, 0) / products.length;
  return products.map((p) => ({
    ...p,
    priceDeviation: Math.round(((p.price - avg) / avg) * 100),
  }));
}

// RateLimiter class
export class RateLimiter {
  constructor(limit = 5, interval = 1000) {
    this.limit = limit;
    this.interval = interval;
    this.queue = [];
    this.active = 0;
    this.lastReset = Date.now();
  }

  canRequest() {
    if (Date.now() - this.lastReset > this.interval) {
      this.active = 0;
      this.lastReset = Date.now();
    }
    return this.active < this.limit;
  }

  async waitUntilReady() {
    while (!this.canRequest()) {
      await new Promise((res) => setTimeout(res, 50));
    }
    this.active++;
  }
}
