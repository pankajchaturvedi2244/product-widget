// src/services/cache.js
// IndexedDB caching for marketplace-widget

import { openDB } from "idb";

const DB_NAME = "marketplace-widget";
const STORE_NAME = "products";
const TTL = 3600 * 1000; // 1 hour

let dbPromise;

export async function initCache() {
  dbPromise = openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    },
  });
  return dbPromise;
}

export async function saveToCache(query, products) {
  const db = await dbPromise;
  const entry = {
    products,
    timestamp: Date.now(),
  };
  await db.put(STORE_NAME, entry, query);
}

export async function getFromCache(query) {
  if (!dbPromise) {
    await initCache();
    return null;
  }
  const db = await dbPromise;
  const entry = await db.get(STORE_NAME, query);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > TTL) return null;
  return entry.products;
}

export async function clearExpiredCache() {
  const db = await dbPromise;
  const tx = db.transaction(STORE_NAME, "readwrite");
  const store = tx.objectStore(STORE_NAME);
  let count = 0;
  for await (const cursor of store.openCursor()) {
    if (cursor.value.timestamp && Date.now() - cursor.value.timestamp > TTL) {
      await cursor.delete();
      count++;
    }
    await cursor.continue();
  }
  await tx.done;
  return count;
}

export async function clearAllCache() {
  const db = await dbPromise;
  await db.clear(STORE_NAME);
}

export async function cacheableApiCall(query, apiFn) {
  let products = await getFromCache(query);
  if (products) return products;
  try {
    products = await apiFn(query);
    if (products && products.length) await saveToCache(query, products);
    return products;
  } catch (err) {
    // Offline fallback
    products = await getFromCache(query);
    return products || [];
  }
}

export async function getCacheStats() {
  const db = await dbPromise;
  let total = 0,
    expired = 0,
    size = 0;
  for await (const cursor of db.transaction(STORE_NAME).store.openCursor()) {
    total++;
    if (cursor.value.timestamp && Date.now() - cursor.value.timestamp > TTL)
      expired++;
    size += JSON.stringify(cursor.value).length;
    await cursor.continue();
  }
  return { total, expired, size, ttl: TTL };
}
