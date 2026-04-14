export type AnyFilterState = Record<string, any>;

const buildLsKey = (tableName?: string) => tableName ? `${tableName}-filter-` : undefined;

export const getLsFilterState = (tableName?: string): AnyFilterState | undefined => {
  try {
    const key = buildLsKey(tableName);
    if (!key || typeof localStorage === 'undefined') return undefined;
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : undefined;
  } catch {
    return undefined;
  }
};

export const setLsFilterState = (tableName: string | undefined, filterState: AnyFilterState) => {
  try {
    const key = buildLsKey(tableName);
    if (!key || typeof localStorage === 'undefined') return;
    // store only plain filter state
    localStorage.setItem(key, JSON.stringify(filterState || {}));
  } catch {
    // ignore
  }
};

// Parse query parameters into filter values for supported filter option types
export const parseQueryToFilter = (optionConfig: { options: any[] }, search?: string): AnyFilterState => {
  const acc: AnyFilterState = {};
  try {
    const urlParams = new URLSearchParams(search ?? (typeof window !== 'undefined' ? window.location.search : ''));
    optionConfig.options.forEach((opt) => {
      if (opt.type === 'dateRange' || opt.type === 'priceRange') {
        const [startKey, endKey] = opt.filterName;
        const start = urlParams.get(startKey);
        const end = urlParams.get(endKey);
        if (start !== null) acc[startKey] = start === '' ? null : start;
        if (end !== null) acc[endKey] = end === '' ? null : end;
      } else {
        const key = opt.filterName;
        if (!key) return;
        if (opt.type === 'switch') {
          const v = urlParams.get(key);
          if (v !== null) acc[key] = v === 'true' || v === '1';
        } else {
          // multiselect/default: support comma-separated or repeated params
          const values = urlParams.getAll(key);
          if (values && values.length > 0) {
            const flat = values
              .flatMap((s) => (s ?? '').split(','))
              .map((s) => s.trim())
              .filter((s) => s.length > 0);
            acc[key] = flat;
          }
        }
      }
    });
  } catch {
    // ignore
  }
  return acc;
};

export const mergeFilterState = (
  defaults: AnyFilterState,
  initial: AnyFilterState | undefined,
  ls: AnyFilterState | undefined,
  query: AnyFilterState | undefined
): AnyFilterState => {
  return {
    ...(defaults || {}),
    ...(initial || {}),
    ...(ls || {}),
    ...(query || {}),
  };
};
