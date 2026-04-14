import {useState, useMemo, useEffect, useRef} from 'react';
import {
    IconChevronRight,
    IconChevronLeft,
    IconSearch, IconPlus, IconMinus
} from '@tabler/icons-react';
import {
    ActionIcon,
    Checkbox,
    Combobox,
    Group,
    TextInput,
    useCombobox,
    Text,
    Paper,
    Loader,
    Box,
    Flex,
    Button,
    Skeleton, Tooltip
} from '@mantine/core';
import { FixedSizeList as List } from 'react-window';
import ScDataFilter from "@/PageComponents/Table/Table Filter/ScDataFilter";
import { ResultResponse } from "@/interfaces/api/models";
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import Fetch from '@/utils/Fetch';
import Image from 'next/image';
import classes from './StocktakeTemplateInventoryTransferList.module.css';
import StockItemTypeIcon from "@/PageComponents/Inventory/StockItemTypeIcon";
import {
    InventoryDto,
    StocktakeDto,
    StocktakeItemDto,
    StocktakeTemplateDto,
    StocktakeTemplateItemDto
} from '../StockTake.model';
import {useDebouncedState, useDebouncedValue, useDidUpdate, useViewportSize} from '@mantine/hooks';
import storageService from "@/utils/storage";
import stockService from "@/services/stock/stock-service";

import * as Enums from '@/utils/enums';
import { showNotification } from '@mantine/notifications';
import helper from "@/utils/helper";
import InventoryDrawerIcon from "@/PageComponents/Inventory/InventoryDrawerIcon";
import InventoryDrawerProvider from "@/PageComponents/Layout/InventoryDrawerProvider";
import {useAtom} from "jotai/index";
import {savedInventoryAtom} from "@/utils/atoms";

export type InventoryTransferItem = Partial<Omit<InventoryDto, 'ID'>> & {
    ID: string;
    // used to update stock items
    stocktakeTemplateItemId?: string;
    stocktakeTemplateItemActive?: boolean;
};

interface RenderListProps {
    items: InventoryTransferItem[];
    onTransfer: (options: InventoryTransferItem[]) => void;
    type: 'forward' | 'backward';
    title: string;
    loading?: boolean;
    loadingPercent?: number;
    onScrolledNearBottom?: () => void
    fetching?: boolean;
    searchChange?: (searchVal: string) => void;
    showItemCount?: boolean;
    disabled?: boolean;
    totalResults?: number | null;
}

const pageSize = 50;
const MAX_TRANSFERRED_ITEMS = 10000; // Adjust this value as needed
const ITEM_HEIGHT = 60; // Height of each item in pixels
// const LIST_HEIGHT = 1000; // Height of the virtual list

// Component to render one side of the transfer list
function RenderList({ items, onTransfer, type, title, loading = false, loadingPercent = 0, fetching = false, onScrolledNearBottom, searchChange, showItemCount = true, disabled = false, totalResults = 0 }: RenderListProps) {
    const combobox = useCombobox();
    const [selectedItems, setSelectedItems] = useState<string[]>([]);
    const [search, setSearch] = useState('');
    const listRef = useRef<List>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const filteredItems = useMemo(() =>
        items.filter((item) =>
            searchChange ||
            item.Description?.toLowerCase().includes(search.toLowerCase().trim()) ||
            item.Code?.toLowerCase().includes(search.toLowerCase().trim())
        ), [items, search, searchChange]);

    // Memoize selection state information
    const selectionState = useMemo(() => {
        const itemIds = filteredItems.map(item => item.ID);
        const allSelected = itemIds.length > 0 && itemIds.every(id => selectedItems.includes(id));
        const someSelected = itemIds.some(id => selectedItems.includes(id)) && !allSelected;

        return {
            allSelected,
            someSelected,
            indeterminate: someSelected
        };
    }, [selectedItems, filteredItems]);

    const handleValueSelect = (itemId: string) => {
        /*setSelectedItems((current) =>
            current.includes(itemId) ? current.filter((id) => id !== itemId) : [...current, itemId]
        );*/

        // handleTransferItem(items.find(x => x.ID === itemId)!)
    };

    // Handle "select all" functionality
    const handleSelectAll = () => {
        if (selectionState.allSelected) {
            // If all are selected, deselect all
            setSelectedItems([]);
        } else {
            // Otherwise select all filtered items
            const itemIds = filteredItems.map(item => item.ID);
            setSelectedItems(itemIds);
        }
    };

    // Handle scroll events for infinite loading
    const handleScroll = ({ scrollOffset, scrollDirection }) => {
        if (onScrolledNearBottom && !loading && !fetching) {
            // If we're near the bottom (within 200px), load more items
            if (scrollOffset > (filteredItems.length * ITEM_HEIGHT) - listHeight - 200) {
                onScrolledNearBottom();
            }
        }
    };

    const handleTransfer = () => {
        // const selectedItemsData = items.filter(item => selectedItems.includes(item.ID));
        // onTransfer(selectedItemsData);

        onTransfer(filteredItems);
        setSelectedItems([]);
    };

    const handleTransferItem = (item: InventoryTransferItem) => {
        onTransfer([item]);
        setSelectedItems(p => p.filter(id => id !== item?.ID));
    };

    const transferButtonIcon = type === 'forward' ? (
        <IconPlus className={classes.icon} />
    ) : (
        <IconMinus className={classes.icon} />
    );

    const transferButtonText = type === 'forward' ? 'Add All' : 'Remove All';

    // Row renderer for the virtualized list
    const ItemRow = ({ index, style }) => {
        // If this is past the end of actual items and we're fetching, show a skeleton
        if (index >= filteredItems.length) {
            return (
                <Box
                    style={{ ...style, position: 'absolute', width: '100%' }}
                    p="sm"
                    mah={60}
                >
                    <Flex align={'center'} gap="sm">
                        {/*<Skeleton height={20} width={20} radius="sm" />*/}
                        <Box pos="relative" w={40} h={40}>
                            <Skeleton circle height={40} width={40} radius="sm" />
                        </Box>
                        <div style={{ flex: 1 }}>
                            <Skeleton height={16} width="70%" mb={8} />
                            <Skeleton height={12} width="40%" />
                        </div>
                        <Skeleton height={28} width={28} radius={7} ml="auto" mr={5} />
                    </Flex>
                </Box>
            );
        }

        const item = filteredItems[index];
        if (!item) return null;

        return (
            <Combobox.Option
                value={item.ID}
                key={item.ID}
                active={selectedItems.includes(item.ID)}
                onMouseOver={() => combobox.resetSelectedOption()}
                className={classes.option}
                style={{ ...style, position: 'absolute', width: '100%' }}
            >
                <Flex align={'center'} gap="sm">
                    {/*<Checkbox
                        checked={selectedItems.includes(item.ID)}
                        onChange={() => {}}
                        aria-hidden
                        tabIndex={-1}
                        style={{ pointerEvents: 'none' }}
                    />*/}
                    <Box pos="relative" w={40} h={40}>
                        {(item.ThumbnailUrl || item.ImageUrl) ? (
                            <Image
                                src={item.ThumbnailUrl || item.ImageUrl || ''}
                                alt=""
                                width={40}
                                height={40}
                                style={{
                                    borderRadius: '4px',
                                    objectFit: 'cover',
                                    flexShrink: 0,
                                }}
                            />
                        ) : (
                            <Box pos={'absolute'} top={'50%'} left={'50%'} style={{transform: 'translate(-50%, -50%)'}}>
                                <StockItemTypeIcon stockItemType={item.StockItemType} size={25} />
                            </Box>
                        )}
                    </Box>
                    <div>
                        <Tooltip openDelay={1000} label={item.Description || 'Unnamed Item'}>
                            <Text fw={500} className={classes.desc}>{item.Description || 'Unnamed Item'}</Text>
                        </Tooltip>
                        <Flex align={'center'} gap={3}>
                            <Text size="xs" c="dimmed" className={classes.code}>{item.Code || 'No code'}</Text>
                            <InventoryDrawerIcon inventory={item} showOnNthParentHover={4}  />
                        </Flex>
                    </div>
                    <ActionIcon
                        disabled={disabled}
                        ml={'auto'}
                        mr={5}
                        color={type === 'forward' ? 'scBlue.5' : 'yellow.7'}
                        variant="outline"
                        size={'md'}
                        className={classes.rowControl}
                        onClick={(e) => {
                            e.stopPropagation();
                            handleTransferItem(item)
                        }}
                    >
                        {transferButtonIcon}
                    </ActionIcon>
                </Flex>
            </Combobox.Option>
        );
    };

    const {height} = useViewportSize();
    const listHeight = ((height || 1000) - 470) < 300 ? 300 : ((height || 1000) - 470);

    // Calculate total items to render (including skeletons)
    const totalItemCount = filteredItems.length + (fetching ? 
    // If we're fetching and we have data about total results, calculate the remaining items
    (totalResults ?
        Math.min(pageSize, totalResults - filteredItems.length) :
        pageSize) : 
    0);

    return (
        <Paper ref={containerRef} className={classes.renderList} withBorder shadow={'none'}>
            <Flex align={'center'} gap={'sm'} mb="xs">
                <Text fw="bold">{title} {showItemCount && <>({items.length})</>}</Text>
                {/*<Checkbox
                    disabled={filteredItems.length === 0}
                    checked={selectionState.allSelected}
                    indeterminate={selectionState.indeterminate}
                    onChange={handleSelectAll}
                    label={'Select all'}
                />*/}
            </Flex>
            <Combobox store={combobox} onOptionSubmit={handleValueSelect}>
                <Combobox.EventsTarget>
                    <Group wrap="nowrap" gap={5} className={classes.controls}>
                        <TextInput
                            maw={'100%'}
                            placeholder="Search items..."
                            leftSection={<IconSearch size={16} />}
                            className={classes.input}
                            value={search}
                            onChange={(event) => {
                                searchChange && searchChange(event.currentTarget.value);
                                setSearch(event.currentTarget.value);
                                combobox.updateSelectedOptionIndex();
                            }}
                        />

                        <Button
                            color={type === 'forward' ? 'scBlue.5' : 'yellow.7'}
                            variant="outline"
                            className={classes.control}
                            onClick={handleTransfer}
                            disabled={/*selectedItems.length === 0 ||*/ disabled}
                            rightSection={transferButtonIcon}
                        >
                            {transferButtonText}
                        </Button>
                    </Group>
                </Combobox.EventsTarget>

                <Box className={classes.list} h={listHeight + 10}>
                    {loading ? (
                        <Flex justify="center" align="center" direction={'column'} gap={5} h={150}>
                            <Loader size="sm" />
                            {!!loadingPercent && <Text size={'md'} fw={500} c={'scBlue.7'}>{loadingPercent}%</Text>}
                        </Flex>
                    ) : (
                        <Combobox.Options>
                            {filteredItems.length > 0 || fetching ? (
                                <List
                                    ref={listRef}
                                    height={listHeight}
                                    width="100%"
                                    itemCount={totalItemCount}
                                    itemSize={ITEM_HEIGHT}
                                    onScroll={handleScroll}
                                >
                                    {ItemRow}
                                </List>
                            ) : (
                                <Combobox.Empty my={'xl'}>No items found</Combobox.Empty>
                            )}
                        </Combobox.Options>
                    )}
                </Box>

                <Box mih={14} mt={2}>
                    {selectedItems.length > 0 && (
                        <Text size="xs" c="dimmed" >
                            {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''} selected
                        </Text>
                    )}
                </Box>
            </Combobox>
        </Paper>
    );
}


export interface InventoryTransferListProps {
    template?: Partial<StocktakeTemplateDto>;
    onSelectionChange?: (selectedItems: InventoryTransferItem[]) => void;
    onClose?: () => void;
    onSaved?: () => void;
}

export function StocktakeTemplateInventoryTransferList({ /*initialCreatedItems,*/ onClose, onSaved, template, onSelectionChange }: InventoryTransferListProps) {
    // const warehouseId = template?.WarehouseID;
    const templateId = template?.ID;

    const [currentTemplateItems, setCurrentTemplateItems] = useState<StocktakeTemplateItemDto[]>([]);

    // State to track items on both sides of the transfer
    const [transferredItems, setTransferredItems] = useState<InventoryTransferItem[]>(/*initialCreatedItems?.filter(x => x.stocktakeItemActive) || */[]);

    const [currentProgress, setCurrentProgress] = useState({current: 0, total: 1});

    const { data: totalStockData, isFetching: selectedItemsLoading} = useQuery(
        ['totalStock', templateId],
        () => stockService.getTemplateItems(template?.ID || ''),
        {
            onError: (err) => {console.log('transferredItemsRequested', err)},
            enabled: !!template?.ID,
            refetchOnWindowFocus: false
        }
    )

    // Update transferred items when total stock query data changes
    useEffect(() => {
        if (totalStockData) {
            const allstock: InventoryTransferItem[] = totalStockData.map((x: StocktakeTemplateItemDto) => ({
                    ID: x.InventoryID,
                    Code: x.InventoryCode,
                    Description: x.InventoryDescription,
                    ThumbnailUrl: x.ThumbnailUrl,
                    ImageUrl: x.ImageUrl,
                    StockItemType: x.InventoryStockItemType,
                    // BinLocation: x.BinLocation,
                    // CountedQuantity: x.CountedQuantity,
                    // ExpectedQuantity: x.ExpectedQuantity,
                    stocktakeTemplateItemId: x.ID,
                    stocktakeTemplateItemActive: x.IsActive,
                }
            ));
            setCurrentTemplateItems(totalStockData);
            setTransferredItems(allstock.filter(x => x.stocktakeTemplateItemActive));
        }
    }, [totalStockData])

    /*const itemsClean = useMemo(() => {
        const initialItems = currentTemplateItems?.filter(x => x.IsActive) || []
        return (transferredItems.length === (initialItems).length && (initialItems).every(x => transferredItems.some(y => y.ID === x.InventoryID)))
        }, [currentTemplateItems, transferredItems]
    );*/

    // Add pagination state
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [availableItemsList, setAvailableItemsList] = useState<InventoryTransferItem[]>([]);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    const [savedInventoryItem] = useAtom(savedInventoryAtom);
    useDidUpdate(() => {

        // console.log('savedInventoryItem', savedInventoryItem)
        if (!savedInventoryItem) return;

        // Update both lists with new saved inventory data
        setAvailableItemsList(prev =>
            prev.map(item =>
                item.ID === savedInventoryItem.ID ?
                    {...item, ...savedInventoryItem} :
                    item
            )
        );

        setTransferredItems(prev =>
            prev.map(item =>
                item.ID === savedInventoryItem.ID ?
                    {...item, ...savedInventoryItem} :
                    item
            )
        );
    }, [savedInventoryItem])


    /*useEffect(() => {
        if (initialCreatedItems && initialCreatedItems.length > 0) {
            setTransferredItems(initialCreatedItems.filter(x => x.stocktakeTemplateItemActive));

            // Notify parent component about initial selection
            /!*if (onSelectionChange) {
                onSelectionChange(initialCreatedItems);
            }*!/
        }
    }, [initialCreatedItems]);*/

    // Filter state for API call
    const [filterState, setFilterState] = useState<any>({});
    const [debouncedFilterState] = useDebouncedValue<any>(filterState, 300);

    const excludeIdList = useMemo(() => transferredItems.map(x => x.ID) || [], [transferredItems]);
    const debouncedExcludeIdList = useDebouncedValue<any>(excludeIdList, 300);

    const [totalInventoryResults, setTotalInventoryResults] = useState<number | null>(null);
    // Fetch inventory data with advanced filtering

    // Add a state to track all received items by ID for efficient lookup
    const [receivedItemsMap, setReceivedItemsMap] = useState<Record<string, InventoryTransferItem>>({});

    // Update receivedItemsMap when savedInventoryItem changes
    useEffect(() => {
        if (!savedInventoryItem) return;

        setReceivedItemsMap(prev => ({
            ...prev,
            [savedInventoryItem.ID]: {...savedInventoryItem}
        }));
    }, [savedInventoryItem]);

    // Add a state to track specifically pagination loading
    const [isPaginationLoading, setIsPaginationLoading] = useState(availableItemsList.length === 0);

    // Modify your handleLoadMore function
    const handleLoadMore = () => {
        if (!isLoading && !isFetching && hasMore) {
            setIsPaginationLoading(true); // Set pagination loading flag
            setPage(prevPage => prevPage + 1);
        }
    };

    // Update your useQuery to clear the pagination loading state
    const { data: inventoryResponse, isLoading, isFetching, error } = useQuery<ResultResponse<InventoryDto>, Error>(
        ['inventoryTransferList', debouncedFilterState, /*warehouseId,*/ page, debouncedExcludeIdList],
        async () => {

            setIsLoadingMore(page > 0);

            const response = await Fetch.post({
                url: '/Inventory/GetInventories',
                params: {
                    ...debouncedFilterState,
                    // searchPhrase: (filterState.searchPhrase),
                    PageIndex: page,
                    PageSize: pageSize, // Adjust page size as needed
                    SortExpression: "Description",
                    SortDirection: "ascending",
                    // CategoryIDList: filterState.CategoryIDList || [],
                    // SubcategoryIDList: filterState.SubcategoryIDList || [],
                    // SupplierIDList: filterState.SupplierIDList || [],
                    StockItemTypeIDList: ['Part', 'Product'],
                    // removing excluded id list to avoid redundant requests - infinite scrolling is implemented so there is no need to use this (previous reasoning)
                    // new reasoning is that excludedIdList is required when adding all items without scrolling to trigger next page load with infinite scroll
                    ExcludeIDList: excludeIdList,
                    // WarehouseID: warehouseId || null,
                    PopulateThumbnails: true,
                }
            });

            setIsLoadingMore(false);

            if (!response || !response.Results) {
                throw new Error(response?.serverMessage || response?.message || 'Failed to fetch inventory data');
            }

            return response;
        },
        {
            // cacheTime: 50 * 60 * 1000,
            onError: () => {
                // Clear loading flags on error too
                setIsPaginationLoading(false);
            },
            onSettled: () => {
                // Always clear loading flags when query settles
                setIsPaginationLoading(false);
            }

        }
    );

    // Update available items when inventory query data changes
    useEffect(() => {
        if (inventoryResponse) {
            setTotalInventoryResults(inventoryResponse.TotalResults || null);

            if (page === 0) {
                // First page, reset everything
                const newItemsMap = inventoryResponse.Results.reduce((acc, item) => {
                    acc[item.ID] = item;
                    return acc;
                }, {} as Record<string, InventoryTransferItem>);

                setReceivedItemsMap(newItemsMap);
                setAvailableItemsList(inventoryResponse.Results);
            } else {
                // For subsequent pages, only add items we haven't seen before
                const newItemsMap = {...receivedItemsMap};
                const newUniqueItems: InventoryTransferItem[] = [];

                inventoryResponse.Results.forEach(item => {
                    if (!newItemsMap[item.ID]) {
                        newItemsMap[item.ID] = item;
                        newUniqueItems.push(item);
                    }
                });

                setReceivedItemsMap(newItemsMap);
                setAvailableItemsList(prev => [...prev, ...newUniqueItems]);
            }

            // Check if we have more items to load
            const totalUniqueItems = Object.keys(receivedItemsMap).length +
                (page === 0 ? inventoryResponse.Results.length : inventoryResponse.Results.filter(item => !receivedItemsMap[item.ID]).length);

            setHasMore(inventoryResponse.Results.length > 0 && totalUniqueItems < (inventoryResponse.TotalResults || 0));
        }
    }, [inventoryResponse, page])

    // Reset pagination when filter changes
    useEffect(() => {
        setPage(0);
        setHasMore(true);
        setAvailableItemsList([]);
    }, [filterState/*, warehouseId*/]);


    // Handle scrolling near the bottom - load more items
    /*const handleLoadMore = () => {
        if (!isLoading && !isFetching && hasMore  && !isLoadingMore) {
            setPage(prevPage => prevPage + 1);
        }
    };*/


    // Filter out transferred items from available items
    const availableItems: InventoryTransferItem[] = useMemo(() => {
        // Use the accumulated list instead of just the current response
        const transferredIds = new Set(transferredItems.map(item => item.ID));
        return availableItemsList.filter(item => !transferredIds.has(item.ID));
    }, [availableItemsList, transferredItems]);

    // Handle transfer from available to selected with limit check
    const handleTransferToSelected = (items: InventoryTransferItem[]) => {
        // Check if adding these items would exceed the maximum
        if (transferredItems.length + items.length > MAX_TRANSFERRED_ITEMS) {
            // Show notification about the limit
            showNotification({
                message: `Cannot add more than ${MAX_TRANSFERRED_ITEMS} items to this stocktake.`,
                color: 'yellow.7',
            });

            const remainingSlots = MAX_TRANSFERRED_ITEMS - transferredItems.length;
            if (remainingSlots > 0) {
                const itemsToAdd = items.slice(0, remainingSlots);
                const newTransferredItems = [...transferredItems, ...itemsToAdd];
                setTransferredItems(newTransferredItems);
                // onSelectionChange && onSelectionChange(newTransferredItems);
                emitUpdatedManagedItemsToParent(newTransferredItems)
                showNotification({
                    message: `Added ${itemsToAdd.length} items. Maximum limit reached.`,
                    color: 'scBlue',
                });
            }
        } else {
            // If not exceeding limit, add all selected items
            const newTransferredItems = [...transferredItems, ...items];
            setTransferredItems(newTransferredItems);
            // onSelectionChange && onSelectionChange(newTransferredItems);
            emitUpdatedManagedItemsToParent(newTransferredItems)
        }
    };


    // Handle transfer from selected back to available
    const handleTransferToAvailable = (items: InventoryTransferItem[]) => {
        const itemIdsToRemove = new Set(items.map(item => item.ID));
        const newTransferredItems = transferredItems.filter(item => !itemIdsToRemove.has(item.ID));
        setTransferredItems(newTransferredItems);
        // onSelectionChange && onSelectionChange(newTransferredItems);
        emitUpdatedManagedItemsToParent(newTransferredItems)

        // Notify parent component if callback provided
        /*if (onSelectionChange) {
            onSelectionChange(newTransferredItems);
        }*/
    };

    const [debouncedSearch, setDebouncedSearch] = useDebouncedState('', 300)
    useEffect(() => {
        setFilterState(p => ({...p, searchPhrase: debouncedSearch}))
    }, [debouncedSearch])
    
    const emitUpdatedManagedItemsToParent = (items: InventoryTransferItem[]) => {
        onSelectionChange && onSelectionChange(
            [
                ...items.map(x => {
                    const templateItem = currentTemplateItems?.find(y => y.InventoryID === x.ID);
                    return {
                        ID: templateItem?.ID || helper.emptyGuid(),
                        IsActive: true,
                        CreatedBy: templateItem?.CreatedBy || storageService.getCookie(Enums.Cookie.servFullName),
                        // CreatedDate: new Date().toISOString(),
                        ModifiedBy: storageService.getCookie(Enums.Cookie.servFullName),
                        // ModifiedDate: new Date().toISOString(),
                        RowVersion: templateItem?.RowVersion || '',
                        StocktakeTemplateID: template?.ID || helper.emptyGuid(),
                        StocktakeTemplateName: template?.Name || '',
                        InventoryID: x.ID,
                        InventoryCode: x.Code,
                        InventoryDescription: x.Description,
                        InventoryStockItemType: x.StockItemType,
                        ImageUrl: x.ImageUrl,
                        ThumbnailUrl: x.ThumbnailUrl,
                    } as StocktakeTemplateItemDto
                }),
                ...(currentTemplateItems?.filter(x => x.IsActive && !items.some(y => y.ID === x.InventoryID)).map(x => (
                    {...x, IsActive: false}
                )) || [])

            ]
        );
    }

    return (
        <Box mt="md">
            <Text fw="bolder" size="md" mb={0}>
                Filter and choose inventory items to include.
                {transferredItems.length >= MAX_TRANSFERRED_ITEMS && <Text span size="sm" c="yellow.7" ml={5}>
                    (Maximum {MAX_TRANSFERRED_ITEMS} items)
                </Text>}
            </Text>

            {/* Advanced filter controls - from original implementation */}
            <Flex gap={8} pos={'relative'}>
                <Box>
                    <ScDataFilter
                        initialValues={filterState as any}
                        onChange={setFilterState}
                        module={Enums.Module.Inventory}
                        tableNoun={'Inventory'}
                        flexProps={{w: '100%', align: 'start', wrap: {base: 'wrap'}}}
                        singleSelectMode
                        tableName={'inventoryFilter'}
                        optionConfig={{
                            options: [
                                {
                                    filterName: 'CategoryIDList',
                                    dataOptionValueKey: 'ID',
                                    dataOptionLabelKey: ['Description'],
                                    queryPath: '/InventoryCategory/false',
                                    label: 'Category',
                                    fieldSettingSystemName: 'InventoryCategory'
                                },
                                {
                                    filterName: 'SubcategoryIDList',
                                    dataOptionValueKey: 'ID',
                                    dataOptionLabelKey: ['Description'],
                                    queryPath: '/InventorySubcategory/GetOnlyActive',
                                    showIncludeDisabledToggle: true,
                                    label: 'Subcategory',
                                    queryParams: {
                                        onlyActive: 'false'
                                    },
                                    type: 'multiselect',
                                    dataOptionSiblingFilterName: 'CategoryIDList',
                                    dataOptionSiblingKey: 'InventoryCategoryID',
                                    dataOptionGroupingKey: 'InventoryCategoryDescription',
                                    fieldSettingSystemName: 'InventorySubcategory'
                                },
                                {
                                    filterName: 'SupplierIDList',
                                    dataOptionValueKey: 'ID',
                                    dataOptionLabelKey: ['Name'],
                                    queryPath: '/Supplier/IncludeDisabled/true',
                                    label: 'Supplier',
                                    fieldSettingSystemName: 'Supplier'
                                },
                                {
                                    type: 'priceRange',
                                    filterName: ['MinCost', 'MaxCost'],
                                    label: 'Price Range',
                                    defaultValue: [null, null]
                                }
                            ],
                            showIncludeDisabledOptionsToggle: true
                        }}
                    />
                </Box>


                {/*{isSuccess && !!inventoryResponse?.TotalResults && (
                    <Text c="dimmed" size="sm" pos={'absolute'} bottom={-10} left={5}>
                        <span style={{ fontWeight: 'bolder' }}>{inventoryResponse.TotalResults}</span> items found with the selected filter.
                    </Text>
                )}*/}

            </Flex>

            {/* Status indicators */}
            {/*{isLoading && (
                <Flex gap={5} align="center" mb="sm">
                    <Loader size={8} />
                    <Text size="xs" c="dimmed">Loading inventory items...</Text>
                </Flex>
            )}*/}

            {error && (
                <Text c="yellow.7" size="xs" mb="sm">Error: {error?.message}</Text>
            )}

            {/* Transfer list interface */}
            <Flex className={classes.root} gap="md">
                <RenderList
                    type="forward"
                    items={availableItems}
                    onTransfer={handleTransferToSelected}
                    title={`Available Items${(totalInventoryResults !== null) ? ` (showing ${availableItems.length} of ${totalInventoryResults})` : ''}`}
                    loading={false} // Only true for initial load
                    onScrolledNearBottom={handleLoadMore}
                    fetching={(availableItems.length === 0 && isFetching) || isPaginationLoading} // Only true for pagination
                    searchChange={setDebouncedSearch}
                    showItemCount={false}
                    disabled={selectedItemsLoading}
                    totalResults={totalInventoryResults}
                />
                <RenderList
                    type="backward"
                    items={transferredItems}
                    onTransfer={handleTransferToAvailable}
                    title={`Items${template?.Name ? ` in ${template.Name}` : ' in Template'}`}
                    loading={selectedItemsLoading}
                    loadingPercent={Math.round(currentProgress.current / currentProgress.total * 100)}
                />

            </Flex>

            {/*{
                onSaved && !onSelectionChange &&
                <Flex justify={'end'} gap={'xs'} mt={'md'}>
                    <Button
                        variant="outline"
                        onClick={onClose}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        disabled={itemsClean || selectedItemsLoading}
                        rightSection={transferMutation.isLoading ? <Loader color={'white'} size={16}/> : null}
                        onClick={() => {
                            handleConfirmSelection()
                        }}
                    >
                        Update
                    </Button>
                </Flex>
            }*/}

            <InventoryDrawerProvider/>
        </Box>
    );
}

export default StocktakeTemplateInventoryTransferList;