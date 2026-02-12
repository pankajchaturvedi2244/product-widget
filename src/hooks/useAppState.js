import { useStore, selectors } from "../store";

export function useAppState(store) {
  const products = useStore(store, selectors.selectSortedProducts);
  const filters = useStore(store, selectors.selectFilters);
  const sort = useStore(store, selectors.selectSort);
  const loading = useStore(store, selectors.selectLoading);
  const error = useStore(store, selectors.selectError);
  const theme = useStore(store, selectors.selectTheme);
  const hasSearched = useStore(store, selectors.selectHasSearched);

  return {
    products,
    filters,
    sort,
    loading,
    error,
    theme,
    hasSearched,
  };
}
