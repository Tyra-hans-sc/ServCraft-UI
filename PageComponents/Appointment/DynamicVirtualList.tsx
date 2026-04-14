import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import {
    Box,
    Combobox,
    Flex,
    Loader,
    Text,
    TextInput,
    Skeleton,
    Paper,
    Tooltip
} from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import ScDataFilter from "@/PageComponents/Table/Table Filter/ScDataFilter";
import { ScTableFilterComponentProps } from "@/PageComponents/Table/table-model";
import { FixedSizeList as List } from 'react-window';
import { useQuery } from '@tanstack/react-query';
import Fetch from '@/utils/Fetch';
import { useDebouncedValue, useViewportSize } from '@mantine/hooks';
import styles from './DynamicVirtualList.module.css';

// Default item height in pixels
// Increased slightly to provide more separation between list items
const ITEM_HEIGHT = 72;
// Default page size for pagination
const DEFAULT_PAGE_SIZE = 50;

// Keys of boolean filters that, when explicitly set to false, disable local exclusion via `excludeIds`
// First entry per requirement: OnlyUnscheduledJobs
const EXCLUSION_OVERRIDE_BOOL_KEYS: string[] = ['OnlyUnscheduledJobs'];

export interface DynamicVirtualListProps<T> {
    // Function to fetch data or data directly
    fetchFn?: (params: any) => Promise<any>;
    queryUrl?: string;
    queryParams?: Record<string, any>;
    data?: T[];

    // Rendering options
    renderItem?: (item: T, index: number) => React.ReactNode;
    itemHeight?: number;
    listHeight?: number;

    // Pagination and loading
    pageSize?: number;
    infiniteScroll?: boolean;
    loading?: boolean;

    // Filtering and search
    searchEnabled?: boolean;
    searchPlaceholder?: string;
    filterByField?: string | ((item: T, searchValue: string) => boolean);

    // Data filter props (optional) - bundled
    filterProps?: ScTableFilterComponentProps;

    // Callbacks
    onItemClick?: (item: T) => void;
    onDataChange?: (data: T[]) => void;

    // External control
    excludeIds?: string[]; // IDs to exclude from the rendered list without refetching

    // UI customization
    title?: string;
    emptyMessage?: string;
    className?: string;
    showItemCount?: boolean;
    headerRightSection?: React.ReactNode; // Custom element to display in the header right section
    itemStyle?: React.CSSProperties; // Optional inner card style; when provided, only the inner card is clickable/hoverable

    // Networking
    caller?: string; // Optional caller header override for Fetch
}

function DynamicVirtualList<T extends { ID: string; Description?: string }>({
    fetchFn,
    queryUrl,
    queryParams = {},
    data: externalData,
    renderItem,
    itemHeight = ITEM_HEIGHT,
    listHeight,
    pageSize = DEFAULT_PAGE_SIZE,
    infiniteScroll = true,
    loading: externalLoading,
    searchEnabled = true,
    searchPlaceholder = 'Search...',
    filterByField = 'Description',
    // filter props (bundled)
    filterProps, 
    onItemClick,
    onDataChange,
    // external control
    excludeIds = [],
    title = 'Items',
    emptyMessage = 'No items found',
    className,
    showItemCount = true,
    headerRightSection,
    itemStyle,
    // networking
    caller,
}: DynamicVirtualListProps<T>) {
    // State for internal data management
    const [items, setItems] = useState<T[]>([]);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [searchInput, setSearchInput] = useState('');
    const [debouncedSearch] = useDebouncedValue(searchInput, 300);
    const [totalResults, setTotalResults] = useState<number | null>(null);
    const [isPaginationLoading, setIsPaginationLoading] = useState(false);
    const [internalFilterState, setInternalFilterState] = useState<Record<string, any>>(filterProps?.initialValues || {});
    
    // Ref to track the current page state to avoid unnecessary resets
    const pageRef = useRef(0);
    
    // Synchronize pageRef with page state
    useEffect(() => {
        pageRef.current = page;
    }, [page]);

    const listRef = useRef<List>(null);
    const { height } = useViewportSize();

    // Determine if local exclusion via excludeIds should be ignored based on boolean filters
    const shouldIgnoreExclusions = useMemo(() => {
        const collectionsToCheck = [queryParams, internalFilterState];
        const isExplicitFalse = (val: any) => val === false || val === 'false' || val === 0 || val === '0';
        for (const obj of collectionsToCheck) {
            if (obj && typeof obj === 'object') {
                for (const key of EXCLUSION_OVERRIDE_BOOL_KEYS) {
                    if (Object.prototype.hasOwnProperty.call(obj, key) && isExplicitFalse((obj as any)[key])) {
                        return true;
                    }
                }
            }
        }
        return false;
    }, [queryParams, internalFilterState]);

    // Calculate list height if not provided
    const calculatedListHeight = listHeight || (((height || 1000) - 470) < 300 ? 300 : ((height || 1000) - 470));

    // Determine if we're using internal or external data
    const isInternalDataManagement = !externalData && (!!fetchFn || !!queryUrl);

    // Setup query for internal data fetching
    const {
        data: queryResponse,
        isLoading: isQueryLoading,
        isFetching: isQueryFetching,
        error: queryError
    } = useQuery({
        queryKey: ['dynamicVirtualList', queryUrl, queryParams, internalFilterState, page, debouncedSearch],
        queryFn: async () => {
            if (!isInternalDataManagement) return null;

            setIsPaginationLoading(page > 0);
            
            // Track if this is a new query or continuation
            const isNewQuery = page === 0;
            
            // Clear items only when starting a new query (page 0), not during pagination
            // and not when the page was reset due to background processes
            if (isNewQuery && (debouncedSearch !== prevQueryParamsRef.current?.searchPhrase || 
                JSON.stringify(queryParams) !== JSON.stringify(prevQueryParamsRef.current))) {
                setItems([]);
            }

            let response;
            if (fetchFn) {
                response = await fetchFn({
                    ...queryParams,
                    ...internalFilterState,
                    PageIndex: page,
                    PageSize: pageSize,
                    searchPhrase: queryParams?.searchPhrase || debouncedSearch,
                });
            } else if (queryUrl) {
                response = await Fetch.post({
                    url: queryUrl,
                    params: {
                        SortExpression: queryParams?.SortExpression || "Description",
                        SortDirection: queryParams?.SortDirection || "ascending",
                        ...queryParams,
                        ...internalFilterState,
                        PageIndex: page,
                        PageSize: pageSize,
                        searchPhrase: queryParams?.searchPhrase || debouncedSearch,
                    },
                    caller: caller ?? ((typeof window !== 'undefined' && window.location?.pathname) ? window.location.pathname : 'appointments')
                });
            }

            setIsPaginationLoading(false);

            if (!response || !response.Results) {
                throw new Error(response?.serverMessage || response?.message || 'Failed to fetch data');
            }

            return response;
        },
        enabled: isInternalDataManagement,
        onError: () => {
            setIsPaginationLoading(false);
        },
        onSettled: () => {
            setIsPaginationLoading(false);
        }
    });

    // Update items when query data changes
    useEffect(() => {
        if (!queryResponse) return;

        setTotalResults(queryResponse.TotalResults || null);

        // Track if this is a new query or continuation
        const isNewQuery = page === 0 && (debouncedSearch !== prevQueryParamsRef.current?.searchPhrase ||
            JSON.stringify(queryParams) !== JSON.stringify(prevQueryParamsRef.current));

        if (isNewQuery) {
            // First page of a new query, reset everything
            setItems(queryResponse.Results);
        } else {
            // For subsequent pages or when page was reset but query didn't change,
            // append new items or replace if items were cleared
            setItems(prev => prev.length > 0 ? [...prev, ...queryResponse.Results] : queryResponse.Results);
        }

        // Check if we have more items to load using the current response data
        // This avoids using potentially stale items.length state
        let currentItemCount;

        if (isNewQuery) {
            // For a new query, just use the results from this response
            currentItemCount = queryResponse.Results.length;
        } else {
            // For pagination or when page was reset but query didn't change,
            // calculate based on existing items plus new results
            currentItemCount = items.length + queryResponse.Results.length;

            // If we're appending to an empty array (items were cleared), just use the new results
            if (items.length === 0) {
                currentItemCount = queryResponse.Results.length;
            }
        }

        setHasMore(queryResponse.Results.length > 0 && currentItemCount < (queryResponse.TotalResults || 0));

        // Notify parent of data change if callback provided
        if (onDataChange) {
            if (isNewQuery) {
                // For a new query, just use the results from this response
                onDataChange(queryResponse.Results);
            } else if (items.length === 0) {
                // If items were cleared but it's not a new query, just use the new results
                onDataChange(queryResponse.Results);
            } else {
                // For pagination or when page was reset but query didn't change,
                // combine existing items with new results
                onDataChange([...items, ...queryResponse.Results]);
            }
        }
    }, [queryResponse])

    // Update items when external data changes
    useEffect(() => {
        if (externalData) {
            setItems(externalData);
            if (onDataChange) {
                onDataChange(externalData);
            }
        }
    }, [externalData, onDataChange]);

    // Store the previous queryParams to compare
    const prevQueryParamsRef = useRef(queryParams);
    const prevSearchRef = useRef(debouncedSearch);
    const prevFilterRef = useRef(internalFilterState);
    
    // Reset pagination only when search or relevant queryParams change
    useEffect(() => {
        if (isInternalDataManagement) {
            // Check if any pagination-relevant parameters have changed
            const prevParams = prevQueryParamsRef.current;
            const searchChanged = prevParams?.searchPhrase !== queryParams?.searchPhrase || prevSearchRef.current !== debouncedSearch;
            const sortChanged = 
                prevParams?.SortExpression !== queryParams?.SortExpression || 
                prevParams?.SortDirection !== queryParams?.SortDirection;
            const filterChanged = JSON.stringify(prevParams) !== JSON.stringify(queryParams) || JSON.stringify(prevFilterRef.current) !== JSON.stringify(internalFilterState);
            
            // Only reset page if search or filters have changed
            if (searchChanged || sortChanged || filterChanged) {
                pageRef.current = 0;
                setPage(0);
                setHasMore(true);
                // Don't clear items here, let the query handle it when it starts loading
            }
            
            // Update the refs with current states
            prevQueryParamsRef.current = queryParams;
            prevSearchRef.current = debouncedSearch;
            prevFilterRef.current = internalFilterState;
        }
    }, [debouncedSearch, queryParams, internalFilterState, isInternalDataManagement]);

    // Filter items based on search if using external data
    const filteredItems = useMemo(() => {
        // Start with current items
        let base: T[] = items;

        // Apply local search only when using external data
        if (!isInternalDataManagement && searchEnabled && debouncedSearch) {
            base = base.filter(item => {
                if (typeof filterByField === 'function') {
                    return filterByField(item, debouncedSearch);
                }
                const fieldValue = item[filterByField as keyof T];
                if (typeof fieldValue === 'string') {
                    return fieldValue.toLowerCase().includes(debouncedSearch.toLowerCase().trim());
                }
                return false;
            });
        }

        // Apply external exclusions unless disabled by specific boolean filters
        if (!shouldIgnoreExclusions && Array.isArray(excludeIds) && excludeIds.length > 0) {
            const excludeSet = new Set(excludeIds);
            base = base.filter(item => !excludeSet.has(item.ID));
        }

        return base;
    }, [items, debouncedSearch, filterByField, isInternalDataManagement, searchEnabled, excludeIds, shouldIgnoreExclusions]);

    // Handle scroll events for infinite loading
    const handleScroll = useCallback(({ scrollOffset }) => {
        if (infiniteScroll && !isQueryLoading && !isQueryFetching && hasMore && !isPaginationLoading) {
            // If we're near the bottom (within 200px), load more items
            if (scrollOffset > (filteredItems.length * itemHeight) - calculatedListHeight - 200) {
                // Update both the page state and the ref
                const nextPage = pageRef.current + 1;
                pageRef.current = nextPage;
                setPage(nextPage);
            }
        }
    }, [infiniteScroll, isQueryLoading, isQueryFetching, hasMore, isPaginationLoading, filteredItems.length, itemHeight, calculatedListHeight]);

    // Default item renderer
    const defaultRenderItem = useCallback(({ index, style }) => {
        // If this is past the end of actual items and we're fetching, show a skeleton
        if (index >= filteredItems.length) {
            if (itemStyle) {
                return (
                    <div style={{ ...style }} className={styles.listRow}>
                        <div className={styles.card} style={itemStyle as any}>
                            <Flex align={'center'} gap="sm">
                                <Box pos="relative" w={40} h={40}>
                                    <Skeleton circle height={40} width={40} radius="sm" />
                                </Box>
                                <div style={{ flex: 1 }}>
                                    <Skeleton height={16} width="100%" mb={8} />
                                    <Skeleton height={12} width="100%" />
                                </div>
                            </Flex>
                        </div>
                    </div>
                );
            }
            return (
                <Box
                    style={{ ...style }}
                    className={styles.listItem}
                    mah={itemHeight}
                >
                    <Flex align={'center'} gap="sm">
                        <Box pos="relative" w={40} h={40}>
                            <Skeleton circle height={40} width={40} radius="sm" />
                        </Box>
                        <div style={{ flex: 1 }}>
                            <Skeleton height={16} width="100%" mb={8} />
                            <Skeleton height={12} width="100%" />
                        </div>
                    </Flex>
                </Box>
            );
        }

        const item = filteredItems[index];
        if (!item) return null;

        // Default rendering if no custom renderer provided
        if (!renderItem) {
            if (itemStyle) {
                const cardClasses = `${onItemClick ? styles.cardClickable : ''}`;
                return (
                    <div style={{ ...style }} className={styles.listRow}>
                        <div
                            className={`${styles.card} ${cardClasses}`}
                            style={itemStyle as any}
                            onClick={() => onItemClick && onItemClick(item)}
                        >
                            <Flex align={'center'} gap="sm">
                                <div style={{ flex: 1 }}>
                                    <Tooltip openDelay={1000} label={item.Description || 'Unnamed Item'}>
                                        <Text lineClamp={2} fw={500}>{item.Description || 'Unnamed Item'}</Text>
                                    </Tooltip>
                                </div>
                            </Flex>
                        </div>
                    </div>
                );
            }

            const itemClasses = `${styles.listItem} ${onItemClick ? styles.listItemClickable : ''}`;
            return (
                <Box
                    style={{ ...style }}
                    className={itemClasses}
                    mah={itemHeight}
                    onClick={() => onItemClick && onItemClick(item)}
                >
                    <Flex align={'center'} gap="sm">
                        <div style={{ flex: 1 }}>
                            <Tooltip openDelay={1000} label={item.Description || 'Unnamed Item'}>
                                <Text lineClamp={2} fw={500}>{item.Description || 'Unnamed Item'}</Text>
                            </Tooltip>
                        </div>
                    </Flex>
                </Box>
            );
        }

        // Use custom renderer but pass the style for positioning
        if (itemStyle) {
            return (
                <div style={{ ...style }} className={styles.listRow}>
                    <div
                        className={`${styles.card} ${onItemClick ? styles.cardClickable : ''}`}
                        style={itemStyle as any}
                        onClick={() => onItemClick && onItemClick(item)}
                    >
                        {renderItem(item, index)}
                    </div>
                </div>
            );
        }
        return (
            <div style={{ ...style }} className={styles.listItem} onClick={() => onItemClick && onItemClick(item)}>
                {renderItem(item, index)}
            </div>
        );
    }, [filteredItems, itemHeight, onItemClick, renderItem, itemStyle]);

    // Effective total results accounting for exclusions present in current items (for UI purposes only)
    const effectiveTotalResults = useMemo(() => {
        if (totalResults === null || totalResults === undefined) return totalResults as any;
        if (shouldIgnoreExclusions || !Array.isArray(excludeIds) || excludeIds.length === 0) return totalResults as any;
        const excludeSet = new Set(excludeIds);
        const presentExcludedCount = items.reduce((acc, it) => acc + (excludeSet.has(it.ID) ? 1 : 0), 0);
        return Math.max(0, (totalResults as number) - presentExcludedCount);
    }, [totalResults, excludeIds, items, shouldIgnoreExclusions]);

    // Calculate total items to render (including skeletons)
    const totalItemCount = filteredItems.length + (
        (isQueryFetching || isPaginationLoading) ? 
            (effectiveTotalResults ? Math.min(pageSize, (effectiveTotalResults as number) - filteredItems.length) : pageSize) : 
            0
    );

    // Determine loading state
    const isLoading = externalLoading !== undefined ? externalLoading : isQueryLoading && page === 0;

    return (
        <Paper className={`${styles.container} ${className || ''}`} withBorder shadow={'none'}>
            <>
                <Flex className={styles.title} align={'center'} justify="space-between" gap={'sm'}>
                    <Text fw="bold" data-name={'virtual-list-title'}>
                        {title} {showItemCount && effectiveTotalResults !== null && effectiveTotalResults !== undefined && `(${effectiveTotalResults})`}
                    </Text>
                    {headerRightSection && (
                        <Box>
                            {headerRightSection}
                        </Box>
                    )}
                </Flex>

                {(searchEnabled || filterProps?.optionConfig) && (
                    <Flex px={'xs'} align={'start'} gap={'sm'} wrap={{ base: 'wrap', lg: 'nowrap' }} className={styles.searchInput}>
                        {searchEnabled && (
                            <TextInput
                                style={{flexGrow: 1}}
                                placeholder={searchPlaceholder}
                                leftSection={<IconSearch size={16} />}
                                value={searchInput}
                                onChange={(event) => setSearchInput(event.currentTarget.value)}
                                miw={220}
                            />
                        )}
                        {filterProps?.optionConfig && (
                            <ScDataFilter
                                initialValues={internalFilterState as any}
                                onChange={(newState) => {
                                    setInternalFilterState(newState);
                                    setPage(0);
                                    setHasMore(true);
                                    if (filterProps?.onChange) filterProps.onChange(newState);
                                }}
                                tableNoun={filterProps?.tableNoun || 'Items'}
                                flexProps={{ align: 'start', wrap: { base: 'wrap', lg: 'nowrap' }, mt: 0, ml: searchEnabled ? 'auto' : 0, ...(filterProps?.flexProps || {}) }}
                                singleSelectMode={!!filterProps?.singleSelectMode}
                                tableName={filterProps?.tableName || 'items'}
                                optionConfig={filterProps?.optionConfig as any}
                                rememberState
                            />
                        )}
                    </Flex>
                )}

                <Box className={styles.listContainer} h={calculatedListHeight + 10}>
                    {isLoading ? (
                        <Flex className={styles.loaderContainer}>
                            <Loader size="sm" />
                        </Flex>
                    ) : (
                        <>
                            {filteredItems.length > 0 || isQueryFetching || isPaginationLoading ? (
                                <List
                                    ref={listRef}
                                    height={calculatedListHeight + 20}
                                    width="100%"
                                    itemCount={totalItemCount}
                                    itemSize={itemHeight}
                                    onScroll={handleScroll}
                                >
                                    {defaultRenderItem}
                                </List>
                            ) : (
                                <div className={styles.emptyMessage}>
                                    <Text>{emptyMessage}</Text>
                                </div>
                            )}
                        </>
                    )}
                </Box>

                {queryError && (
                    <Text className={styles.errorMessage}>
                        Error: {(queryError as Error)?.message || 'Failed to load data'}
                    </Text>
                )}

            </>
        </Paper>
    );
}

export default DynamicVirtualList;
