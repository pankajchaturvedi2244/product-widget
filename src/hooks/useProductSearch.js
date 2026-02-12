// src/hooks/useProductSearch.js
import { useCallback } from "react";
import { actions } from "../store";
import {
  fetchAllAPIs,
  calculateReliabilityScore,
  calculatePriceDeviation,
} from "../services/api";
import { cacheableApiCall } from "../services/cache";
import { exponentialBackoff, CircuitBreaker } from "../utils/resilience";
import { MAX_QUERY_LENGTH } from "../configs/appConfig";

const ERROR_MESSAGES = {
  INVALID_QUERY: "Invalid search query",
  FETCH_FAILED: "Failed to fetch products",
};

export function useProductSearch(store) {
  const circuitBreaker = new CircuitBreaker();

  const searchProducts = useCallback(
    async (query) => {
      const trimmedQuery = query?.trim();

      /* 
         Reset to fresh state
      - */
      if (!trimmedQuery) {
        store.dispatch(actions.setProducts([]));
        store.dispatch(actions.setError(null));
        store.dispatch(actions.setHasSearched(false));
        store.dispatch(actions.setLoading(false));
        return;
      }

      /* 
         Validation
      - */
      if (trimmedQuery.length > MAX_QUERY_LENGTH) {
        store.dispatch(actions.setError(ERROR_MESSAGES.INVALID_QUERY));
        return;
      }

      store.dispatch(actions.setLoading(true));
      store.dispatch(actions.setError(null));
      store.dispatch(actions.setHasSearched(true));

      try {
        /* 
           Resilient API wrapper
        - */
        const apiFn = (q) =>
          circuitBreaker.execute(() =>
            exponentialBackoff(() => fetchAllAPIs(q)),
          );

        /* 
           Cache layer
        - */
        let results = await cacheableApiCall(trimmedQuery, apiFn);

        /* 
           Enrichment layer
        - */
        results = results.map((product) => ({
          ...product,
          reliabilityScore: calculateReliabilityScore(product),
        }));

        results = calculatePriceDeviation(results);

        /* 
           Store update
        - */
        store.dispatch(actions.setProducts(results));
      } catch (err) {
        store.dispatch(
          actions.setError(err?.message || ERROR_MESSAGES.FETCH_FAILED),
        );
      } finally {
        store.dispatch(actions.setLoading(false));
      }
    },
    [store],
  );

  return { searchProducts };
}
