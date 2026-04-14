import React, { FC, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    ActionIcon,
    Box,
    Button,
    CloseButton,
    Flex,
    Group,
    Loader,
    NumberInput,
    Select,
    Text,
    TextInput,
    Tooltip
} from "@mantine/core";
import SimpleTable from "@/PageComponents/SimpleTable/SimpleTable";
import { StocktakeDto, StocktakeItemDto } from "@/PageComponents/Stock Take/StockTake.model";
import {
    IconAdjustmentsStar,
    IconCheck,
    IconCross,
    IconDotsVertical,
    IconExclamationCircle,
    IconPencil,
    IconPlus,
    IconRefresh,
    IconSearch, IconTableExport,
    IconTemplate,
    IconTrash,
    IconUser,
    IconX
} from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Fetch from '@/utils/Fetch'
import { ResultResponse } from "@/interfaces/api/models";
import * as enums from "@/utils/enums";
import Image from "next/image";
import StockItemTypeIcon from "@/PageComponents/Inventory/StockItemTypeIcon";
import { TableActionStates, PageProps } from "@/PageComponents/Table/table-model";
import { getActionId } from "@/PageComponents/Table/table-helper";
import { showNotification, updateNotification } from "@mantine/notifications";
import ScDataFilter from "@/PageComponents/Table/Table Filter/ScDataFilter";
import { useDebouncedValue, useDidUpdate, useMediaQuery } from "@mantine/hooks";
import PS from "@/services/permission/permission-service";
import * as Enums from "@/utils/enums";
import storageService from "@/utils/storage"
import SCModal from "@/PageComponents/Modal/SCModal";
import ImageWithZoom from "@/PageComponents/Attachment/ImageWithZoom";
import PermissionService from "@/services/permission/permission-service";
import DownloadService from "@/utils/download-service";
import styles from "@/PageComponents/Table/Table/ScTableData.module.css";
import ScPagination from "@/PageComponents/Table/ScPagination";
import Helper from "@/utils/helper";
import stockService from "@/services/stock/stock-service";
import helper from "@/utils/helper";
import time from "@/utils/time";
import InventorySelector from "@/components/selectors/inventory/inventory-selector";
import storage from "@/utils/storage";
import StockTakePreferencesDrawer from "@/PageComponents/Stock Take/StockTakePreferencesDrawer";
import InventoryDrawerProvider from "@/PageComponents/Layout/InventoryDrawerProvider";
import InventoryDrawerIcon from "@/PageComponents/Inventory/InventoryDrawerIcon";
import { useAtom } from "jotai/index";
import { savedInventoryAtom } from "@/utils/atoms";

const StockTakeItemList: FC<
    {
        stocktake: StocktakeDto,
        onChange: (items: StocktakeItemDto[]) => void,
        onUnsentChangesChange: (hasUnsentChanges: boolean) => void,
        conflictItemInventoryIds?: string[],
        onFetchingChange?: (isFetching: boolean) => void,
        onRefresh?: (refreshFunction: () => void) => void
    }
> = ({ stocktake, ...props }
) => {

        const openEnded = useMemo(() => {
            return stockService.isOpenEnded(stocktake?.StocktakeType);
        }, [stocktake]);

        const stocktakeCanEditItems = useMemo(() => {
            return stocktake?.Status === Enums.StocktakeStatus.Draft || stocktake?.Status === Enums.StocktakeStatus.Pending || stocktake?.Status === Enums.StocktakeStatus.Counting;
        }, [stocktake])

        const showAddItemToCount = useMemo(() => {
            return openEnded && stocktakeCanEditItems
        }, [openEnded, stocktakeCanEditItems]);

        const stocktakeValid = useMemo(() => {
            let validityEndDate = stockService.calculateValidityEndDate(stocktake);
            return time.now().valueOf() < validityEndDate.valueOf();
        }, [stocktake]);

        // Filter state for API call
        const [filterState, setFilterState] = useState<any>({});
        const [searchQuery, setSearchQuery] = useState('');
        const [debouncedSearch] = useDebouncedValue<string>(searchQuery, 300);

        const [allItems, setAllItems] = useState<StocktakeItemDto[]>([]);
        const PAGE_SIZE = 50; // Number of items to load per request

        const tableRef = useRef<HTMLElement | null>(null);
        const [autoFocusCount, setAutoFocusCount] = useState("");

        const [addingItem, setAddingItem] = useState<Partial<StocktakeItemDto> | null>(null);
        const addingItemCountRef = useRef<any>();

        // Pagination state
        const [queryParams, setQueryParams] = useState<any>({
            pageSize: PAGE_SIZE,
            pageIndex: 0,
            searchPhrase: '',
            SortDirection: 'ascending',
            SortExpression: 'InventoryCode',
        });

        // Add sorting state
        const [sortState, setSortState] = useState<{ SortExpression: string, SortDirection: 'ascending' | 'descending' | '' }>({
            SortExpression: "InventoryCode",
            SortDirection: "ascending"
        });
        const [debouncedSort] = useDebouncedValue(sortState, 150)

        const refreshInputsRef = useRef(false);
        const [stocktakeItems, setStocktakeItems] = useState<StocktakeItemDto[] | undefined>();
        // Use useQuery with a query key that includes the stockTake.ID
        // so that the query automatically re-runs when the ID changes
        const { data: stocktakeItemsResponse, isLoading, isFetching, isInitialLoading, error, isSuccess, isStale, refetch } = useQuery<ResultResponse<StocktakeItemDto>, Error>(
            ['stockTakeItems', stocktake.ID,
                /* if inputs update quickly the stock items do not get updated correctly so need to refetch when status updates to display correctly data when cell types change  */
                // at the same time, we dont want the items to also update with every status switch
                stocktake.Status,
                filterState,
                debouncedSearch,
                queryParams, // Use queryParams instead of page
                debouncedSort // Add sortState to query key to refetch when sorting changes
            ],
            async () => {
                const response = await Fetch.post({
                    url: `/Stocktake/item/list`,
                    params: {
                        StocktakeID: stocktake.ID,
                        ...filterState,
                        SearchPhrase: debouncedSearch,
                        SortExpression: queryParams.SortExpression,
                        SortDirection: queryParams.SortDirection,
                        PageSize: queryParams.pageSize,
                        PageIndex: queryParams.pageIndex,
                        OnlyActive: true,
                    } as any
                });
                if (!response || !response.Results) {
                    throw new Error(response?.serverMessage || response?.message || 'Failed to fetch inventory data');
                }
                return response;
            },
            {
                enabled: !!stocktake.ID,
                keepPreviousData: true,
                staleTime: 0,
                // refetchOnMount: false,
                // refetchOnWindowFocus: false,
                // refetchOnReconnect: false,
                onSuccess: (data) => {
                    if (refreshInputsRef.current) {
                        refreshInputsRef.current = false;
                        setInputValues({});
                        setAdjustmentReasons({});
                        setAdjustmentInputValues({});
                    }

                    // Set items directly from the response
                    setStocktakeItems(data.Results.filter(x => x.IsActive));
                    setAllItems(data.Results);

                    // Check if search and filters are empty before calling onChange
                    const isFiltered = searchQuery !== '' || filterState.OnlyDiscrepancies;

                    // Only pass data to parent when no filters are applied
                    if (!isFiltered) {
                        props.onChange?.(data.Results);
                    } else {
                        console.log('Data is filtered, not updating parent component');
                    }
                },
                onError: (err) => {
                    console.error('Stock item fetch error:', err);
                }
            }
        )

        // Reset pagination when filters change or sorting changes
        useDidUpdate(() => {
            setQueryParams(prev => ({ ...prev, pageIndex: 0 }));
            setAllItems([]);
        }, [searchQuery, filterState, stocktake.ID, sortState]);

        // Handle sorting changes
        const handleSort = useCallback((newSortState: { SortExpression: string, SortDirection: 'ascending' | 'descending' | '' }) => {
            setSortState(newSortState);
            setQueryParams(prev => ({
                ...prev,
                SortExpression: newSortState.SortExpression,
                SortDirection: newSortState.SortDirection
            }));
        }, []);

        // Handle pagination changes
        const handlePaginationChange = useCallback((pageProps: PageProps) => {
            setQueryParams(prev => ({ ...prev, ...pageProps }));
        }, []);


        const queryClient = useQueryClient();

        const removeItemMutation = useMutation({
            mutationFn: async (item: StocktakeItemDto) => {
                const response = await Fetch.put({
                    url: '/Stocktake/item/' + item.ID,
                    params: {
                        StockTakeId: stocktake.ID,
                        StocktakeItem: {
                            ...item,
                            isActive: false,
                            StocktakeName: stocktake.Name,
                            AssignedEmployeeID: stocktake.AssignedEmployeeID,
                            AssignedEmployeeFullName: stocktake.AssignedEmployeeFullName,
                        }
                    }
                })


                if (response?.serverMessage || response?.message || response.errors) {
                    throw new Error(response?.serverMessage || response?.message || response.errors && JSON.stringify(response.errors) || 'Something went wrong.');
                }
                return response;
            },
            onSuccess: (data, variables, context) => {
                // Invalidate relevant queries to refresh data
                queryClient.invalidateQueries(['stockTakeItems']);

                showNotification({
                    message: variables.InventoryCode + ' removed',
                    color: 'scBlue',
                });

                setActionStates(p => ({ ...p, [getActionId('remove', variables.ID)]: 'success' }))
                // setTimeout(() => , 2000)
                refetch();
            },
            onError: (error: Error, variables) => {
                // Handle error state here
                console.error('Removal failed:', error);
                setActionStates(p => ({ ...p, [getActionId('remove', variables.ID)]: 'error' }))
                setTimeout(() => {
                    const key = getActionId('remove', variables.ID);
                    setActionStates(p => ({ ...p, [key]: p[key] === 'error' ? 'none' : p[key] }))
                }, 1000)
                // setTimeout(() => , 2000)
                refetch();
                // You might want to add error notification


                showNotification({
                    title: variables.InventoryCode + ' could not be removed',
                    message: error.message,
                    color: 'yellow.7',
                });
            }
        });

        // const refreshDebounced = useDebouncedCallback(refetch, 8000)

        const updateItemMutation = useMutation({
            mutationFn: async ({ item, actionName }: { item: StocktakeItemDto; actionName: string; }) => {
                const response = await Fetch.put({
                    url: '/Stocktake/item/' + item.ID,
                    params: {
                        StockTakeId: stocktake.ID,
                        StocktakeItem: {
                            ...item,
                            // isActive: false,
                            BinLocation: item.BinLocation || 'unknown',
                            StocktakeName: stocktake.Name,
                            AssignedEmployeeID: stocktake.AssignedEmployeeID,
                            AssignedEmployeeFullName: stocktake.AssignedEmployeeFullName,
                        }
                    }
                })

                if (response?.serverMessage || response?.message || response.errors) {
                    throw new Error(response?.serverMessage || response?.message || response.errors && JSON.stringify(response.errors) || 'Something went wrong.');
                }
                return response;
            },
            onMutate: async ({ item, actionName }: { item: StocktakeItemDto; actionName: string; }) => {
                setActionStates(p => ({ ...p, [getActionId(actionName, item.ID)]: 'loading' }))
            },
            // onSettled: refreshDebounced,
            onSuccess: (data, variables, context) => {

                // Invalidate relevant queries to refresh data
                queryClient.invalidateQueries(['stockTakeItems']);

                /*showNotification({
                    message: variables.item.InventoryCode + ' updated',
                    color: 'scBlue',
                });*/

                setActionStates(p => ({ ...p, [getActionId(variables.actionName, variables.item.ID)]: 'success' }))
                // setTimeout(() => , 2000)
                updateStockTakeItem(variables.item, data)

                // we have missing info if no data so need to refresh - expectedQuantity have updated as it is based off info sent (counted date and qty)
                !data && refetch();
            },
            onError: (error: Error, variables) => {
                // Handle error state here
                console.error('Update failed:', error);
                setActionStates(p => ({ ...p, [getActionId(variables.actionName, variables.item.ID)]: 'error' }))
                setTimeout(() => {
                    const key = getActionId(variables.actionName, variables.item.ID);
                    setActionStates(p => ({ ...p, [key]: p[key] === 'error' ? 'none' : p[key] }))
                }, 1000)
                // setTimeout(() => , 2000)
                refetch();
                // You might want to add error notification

                showNotification({
                    title: variables.item.InventoryCode + ' could not be updated',
                    message: error.message,
                    color: 'yellow.7',
                });
            }
        });

        // adjustments not calculated on the server eliminating the need to inform the server with bulk data changes
        /*const resetAdjustmentsMutation = useMutation({
            mutationFn: async (items: StocktakeItemDto[]) => {
                return await Fetch.put({
                    url: '/Stocktake/item/batch',
                    params: [
                        ...items.map(x => {
                            return {
                                StockTakeId: stocktake.ID,
                                StocktakeItem: {...x, StocktakeName: stocktake.Name}
                            }
                        })
                    ]
                })
            },
            onSuccess: () => {
                // Invalidate relevant queries to refresh data
                queryClient.invalidateQueries(['inventory']);

                /!*showNotification({
                    message: 'Stockitem list updated',
                    color: 'scBlue',
                });*!/
            },
            onError: (error) => {
                // Handle error state here
                console.error('Unable prepare adjustments:', error);
                // You might want to add error notification
            }
        });
        const [countingStatus, setCountingStatus] = useState(stocktake.Status === enums.StocktakeStatus.Counting);
        useEffect(() => {
            if(countingStatus) {
                if (stocktake.Status === enums.StocktakeStatus.CountingComplete) {
                    setStocktakeItems(
                        prev => {
                            const resetStocktakeItems = prev?.map((x) => ({
                                ...x,
                                AdjustmentReason: adjustmentReasons[x.ID] === null ? null :+adjustmentReasons[x.ID],
                                AdjustmentQuantity: adjustmentReasons[x.ID] === null ? null :+adjustmentReasons[x.ID],
                                // Status: enums.StocktakeItemStatus.Adjustment,
                            }))

                            resetStocktakeItems && resetAdjustmentsMutation.mutate(resetStocktakeItems)

                            return resetStocktakeItems;
                        }
                    )
                }
            }
            setCountingStatus(stocktake.Status === enums.StocktakeStatus.Counting);
        }, [stocktake.Status]);*/

        /*useDidUpdate(() => {
            setTimeout(
                () => {
                    refetch()
                }, 2000
            )
        }, [stocktake.Status]);*/

        const updateStockTakeItem = (item, data?) => {

            const stocktakeItemsContainsItem = !!stocktakeItems?.find(x => x.ID === item.ID);

            const updatedItems = stocktakeItems?.map((p) =>
                p.ID === item.ID ? { ...p, ...item, ...(data || {}) } : p
            );

            if (!stocktakeItemsContainsItem) {
                let itemToAdd = { ...item, ...(data || {}) };
                updatedItems?.unshift(itemToAdd);
            }

            setStocktakeItems(updatedItems);
            checkDirtyItem(item.CountedQuantity, item, 'CountedQuantity');
            props.onChange && props.onChange(updatedItems as StocktakeItemDto[])
        }

        /*const initialStockItems: InventoryTransferItem[] = useMemo(() => {
            if (stocktakeItems && stocktakeItems.length !== 0) {
                return stocktakeItems.map(x => ({
                    ID: x.InventoryID,
                    Code: x.InventoryCode,
                    Description: x.InventoryDescription,
                    ThumbnailUrl: x.InventoryThumbnailUrl,
                    StockItemType: x.InventoryStockItemType,
                    BinLocation: x.BinLocation,
                    CountedQuantity: x.CountedQuantity,
                    ExpectedQuantity: x.ExpectedQuantity,
                    stocktakeTemplateItemId: x.ID,
                    stocktakeItemActive: x.IsActive,
                } as InventoryTransferItem))
            } else {
                return []
            }
        }, [stocktakeItems])*/

        // const [modifyStocktakeitems, setModifyStocktakeitems] = useState(false);

        // Add a state to track input values at the top of your component
        const [inputValues, setInputValues] = useState<Record<string, any>>({});
        const [adjustmentInputValues, setAdjustmentInputValues] = useState<Record<string, any>>({});
        const [adjustmentReasons, setAdjustmentReasons] = useState<Record<string, any>>({});

        const fullRefresh = useCallback(() => {
            refreshInputsRef.current = true;
            refetch()
            // setInputValues({})
            // setAdjustmentInputValues({})
            // setAdjustmentReasons({})
        }, [props.onRefresh])

        // const skipNextInputUpdateFromItemsRef = useRef(false);
        useEffect(() => {
            // if (!skipNextInputUpdateFromItemsRef.current) {
            setInputValues(prevState => {
                // Start with the previous state
                const newState = { ...prevState };

                stocktakeItems?.forEach(item => {
                    // Only update if the field doesn't exist yet or is empty
                    if (!newState[item.ID] || newState[item.ID] === '') {
                        newState[item.ID] = item.CountedQuantity === null ? '' : (item.CountedQuantity ?? '') + '';
                    }
                });

                return newState;
            });

            setAdjustmentInputValues(prevState => {
                const newState = { ...prevState };

                stocktakeItems?.forEach(item => {
                    if (!newState[item.ID] || newState[item.ID] === '') {
                        const discrepancy = item.CountedQuantity !== null && item.ExpectedQuantity !== null &&
                            (item.CountedQuantity - item.ExpectedQuantity);
                        const qty = typeof discrepancy === 'number' && discrepancy !== 0 ? discrepancy : '';
                        newState[item.ID] = item.AdjustmentQuantity === null ? qty : (item.AdjustmentQuantity ?? qty) + '';
                    }
                });

                return newState;
            });

            setAdjustmentReasons(prevState => {
                const newState = { ...prevState };

                stocktakeItems?.forEach(item => {
                    if (!newState[item.ID] || newState[item.ID] === '') {
                        newState[item.ID] = item.AdjustmentReason === null ? null : (item.AdjustmentReason ?? '') + '';
                    }
                });

                return newState;
            });

            // unnecessary since it is called where stocktakeItems are updated
            // stocktakeItems && props.onChange && props.onChange(stocktakeItems as StocktakeItemDto[])
            // }

            // skipNextInputUpdateFromItemsRef.current = false;
        }, [stocktakeItems]);

        // when the stocktake status cahnges to counting complete, we have to notify the parent of all the input states so that the discrepancy check has the latest items (we are refreshing data minimally)
        useEffect(() => {
            setStocktakeItems(
                stockItems => {
                    const updatedStockItems = stockItems?.map(
                        (item => {
                            return {
                                ...item,
                                AdjustmentQuantity: adjustmentInputValues[item.ID] === '' ? null : +adjustmentInputValues[item.ID],
                                AdjustmentReason: adjustmentReasons[item.ID] === null ? null : +adjustmentReasons[item.ID],
                            }
                        })
                    )

                    updatedStockItems && props.onChange && props.onChange(updatedStockItems as StocktakeItemDto[])

                    return updatedStockItems;
                }
            )
        }, [stocktake.Status]);


        const [dirtyItem, setDirtyItem] = useState<string | null>(null)
        const checkDirtyItem = (newValue: number | string, item: StocktakeItemDto, key: string = 'CountedQuantity') => {
            if (key === 'CountedQuantity') {
                if (item.CountedQuantity === newValue || item.CountedQuantity === (newValue === '' ? null : +newValue)) {
                    setDirtyItem(null)
                } else {
                    setDirtyItem(item.ID)
                }
            } else if (key === 'AdjustmentQuantity') {
                if (item.AdjustmentQuantity === newValue || item.AdjustmentQuantity === (newValue === '' ? null : +newValue)) {
                    setDirtyItem(null)
                } else {
                    setDirtyItem(item.ID)
                }
            }
        }

        useDidUpdate(() => {
            props.onUnsentChangesChange && props.onUnsentChangesChange(!updateItemMutation.isLoading && !!dirtyItem)
        }, [updateItemMutation.isLoading, dirtyItem])

        // Notify parent component about fetching state changes
        useEffect(() => {
            props.onFetchingChange?.(isFetching)
        }, [isFetching, props.onFetchingChange])

        // Provide the refresh function to the parent component
        useEffect(() => {
            props.onRefresh?.(fullRefresh)
        }, [fullRefresh, props.onRefresh])

        const [savedInventoryItem] = useAtom(savedInventoryAtom);
        useDidUpdate(() => {
            // console.log('savedInventoryItem', savedInventoryItem)
            if (!savedInventoryItem) return;
            fullRefresh();
        }, [savedInventoryItem])


        // Add the handleInputChange callback
        const handleInputChange = useCallback((key: string, item: StocktakeItemDto, value: any) => {
            if (key === 'CountedQuantity') {
                setInputValues((prevValues) => ({
                    ...prevValues,
                    [item.ID]: value
                }));
            }
            if (key === 'AdjustmentQuantity') {
                setAdjustmentInputValues((prevValues) => ({
                    ...prevValues,
                    [item.ID]: value
                }));
            }
            if (key === 'AdjustmentReason') {
                setAdjustmentReasons((prevValues) => ({
                    ...prevValues,
                    [item.ID]: value
                }));
            }
            if (key === "Inventory") {
                item.InventoryID = value?.ID ?? '';
                item.InventoryCode = value?.Code ?? '';
                item.InventoryDescription = value?.Description ?? '';
                item.InventoryStockItemType = value?.StockItemType ?? 0;
                item.BinLocation = value?.BinLocation ?? '';
                item.InventoryThumbnailUrl = value?.ThumbnailUrl ?? '';
                updateItemMutation.mutate({
                    item: item,
                    actionName: 'name'
                })
                updateStockTakeItem(item)
            }
        }, []);

        const [actionStates, setActionStates] = useState<TableActionStates>({})
        const onAction = useCallback((name: string, item: StocktakeItemDto) => {
            if (name === 'count') {
                const value = inputValues[item.ID] === '' ? null : +inputValues[item.ID]
                const countedDate = new Date().toISOString().split('T')[0]; // Get ISO date without timezone
                const newItem = {
                    ...item,
                    CountedQuantity: value,
                    // Status: value === null ? enums.StocktakeItemStatus.Pending : enums.StocktakeItemStatus.Counted,
                    CountedDate: countedDate,
                    AdjustmentQuantity: null
                }
                setAdjustmentInputValues(p => ({ ...p, [item.ID]: '' }))
                updateItemMutation.mutate({
                    item: newItem,
                    actionName: name
                })
                updateStockTakeItem(newItem)
                /*if (value !== null) {
                    const countedDate = new Date().toISOString().split('T')[0]; // Get ISO date without timezone
                    const newItem = {
                        ...item,
                        CountedQuantity: +value,
                        Status: enums.StocktakeItemStatus.Counted,
                        CountedDate: countedDate,
                        AdjustmentQuantity: null
                    }
                    setAdjustmentInputValues(p => ({ ...p, [item.ID]: '' }))
                    updateItemMutation.mutate({
                        item: newItem,
                        actionName: name
                    })
                    updateStockTakeItem(newItem)
                } else {
                    showNotification({
                        id: 'nocount',
                        message: 'Please enter the counted quantity',
                        color: 'yellow.7',
                    })
                }*/
                // if(item.CountedQuantity)
            } else if (name === 'adjust') {
                const adjustmentQty: string = adjustmentInputValues[item.ID]
                // const adjustmentReason = adjustmentReasons[item.ID] && +adjustmentReasons[item.ID] // ends up as 0
                const adjustmentReason = item.AdjustmentReason // ends up as 0

                // console.log(adjustmentReason, adjustmentQty)
                if (adjustmentQty !== '' /*&& !!adjustmentReasons[item.ID]*/) {
                    // const adjustmentDate = new Date().toISOString().split('T')[0]; // Get ISO date without timezone
                    const newItem = {
                        ...item,
                        // Status: enums.StocktakeItemStatus.Adjustment,
                        // AdjustmentDate: adjustmentDate,
                        AdjustmentReason: adjustmentReason, // === null ? null : +adjustmentReason,
                        AdjustmentQuantity: +adjustmentQty
                    }
                    updateItemMutation.mutate({
                        item: newItem,
                        actionName: name
                    })
                    updateStockTakeItem(newItem)
                } else {
                    /*showNotification({
                        id: 'nocount',
                        message: 'Please enter the Adjustment Qty and Reason',
                        color: 'yellow.7',
                    })*/
                }
                // if(item.CountedQuantity)
            } else if (name === 'remove') {

                if (!item.InventoryID) {
                    setStocktakeItems(items => items?.filter(x => x.ID !== item.ID));
                    return;
                }

                setActionStates(p => ({ ...p, [getActionId(name, item.ID)]: 'loading' }))
                removeItemMutation.mutate(item)
            } /*else if (name === 'recounted') {
            const value: string = inputValues[item.ID]
            if (value !== '') {
                const recountedDate = new Date().toISOString().split('T')[0]; // Get ISO date without timezone
                updateItemMutation.mutate({
                    item: {
                        ...item,
                        CountedQuantity: +value,
                        Status: enums.StocktakeItemStatus.Recounted,
                        CountedDate: recountedDate
                    },
                    actionName: name
                })
                setAdjustmentInputValues(p => ({ ...p, [item.ID]: '' }))
                setAdjustmentReasons(p => ({ ...p, [item.ID]: '' }))
            } else {
                showNotification({
                    id: 'nocount',
                    message: 'Please enter the recounted quantity',
                    color: 'yellow.7',
                })
            }
            // if(item.CountedQuantity)
        } else if (name === 'verify') {
            updateItemMutation.mutate({
                item: {...item, Status: enums.StocktakeItemStatus.Verified},
                actionName: name
            })
        } else if (name === 'recount') {
            updateItemMutation.mutate({
                item: {...item, AdjustmentReason: null, AdjustmentQuantity: null, Status: enums.StocktakeItemStatus.Recount},
                actionName: name
            })
        }*/
        }, [inputValues, adjustmentInputValues, adjustmentReasons, stocktake, stocktakeItems]);

        const [stockAdmin] = useState(PS.hasPermission(Enums.PermissionName.StockTakeManager));
        const isAssignedEmployee = useMemo(() => {
            return stocktake && storageService.getCookie(Enums.Cookie.employeeID) === stocktake.AssignedEmployeeID
        }, [stocktake])

        const [previewImageUrl, setPreviewImageUrl] = useState<{
            Url: string;
            UrlThumb: string;
        } | null>(null)

        const [exportBusyState, setExportBusyState] = useState(false)

        // const [isMasterOfficeAdminPermission] = useState(PermissionService.hasPermission(Enums.PermissionName.MasterOfficeAdmin));

        const [exportPermission] = useState(PermissionService.hasPermission(Enums.PermissionName.Exports));
        const [preferencesDrawerOpen, setPreferencesDrawerOpen] = useState(false);
        const [userColumnConfig, setUserColumnConfig] = useState<any[]>([]);

        const handleFilteredExport = async () => {
            handleExport()
        }

        const handleExport = async () => {
            try {
                showNotification({
                    id: 'downloading-export',
                    loading: true,
                    message: 'Preparing File',
                    autoClose: false,
                    color: 'scBlue'
                })
                setExportBusyState(true)
                await DownloadService.downloadFile('POST', '/Stocktake/Item/GetExportedItems', { ...filterState, SearcPhrase: searchQuery, StocktakeID: stocktake.ID }, false, false, "", "", null, false, (() => {
                    updateNotification({
                        id: 'downloading-export',
                        loading: false,
                        message: 'Downloading Exported File',
                        autoClose: 2000,
                        color: 'scBlue'
                    })
                    setExportBusyState(false)
                }) as any)
            } catch (e) {
                setExportBusyState(false)
            }
        }


        const handleQueryParmsChanged = (newParams) => {
            setQueryParams(newParams)
        }

        const buttonIconMode = useMediaQuery('(max-width: 500px)');



        const canFinishAddingItem = useMemo(() => {
            if (!addingItem) return false;
            return !!addingItem.InventoryID;
        }, [addingItem]);

        const addBlankUserItem = () => {
            setAddingItem({
                ID: helper.newGuid(),
                AdjustmentQuantity: null,
                CountedDate: time.now().toISOString(),
                IsActive: true,
                AdjustmentReason: null,
                AssignedEmployeeFullName: '',
                AssignedEmployeeID: '',
                BinLocation: '',
                CountedQuantity: null,
                CreatedBy: storage.getCookie(Enums.Cookie.servUserName),
                CreatedDate: time.now().toISOString(),
                ExpectedQuantity: 0,
                InventoryCode: '',
                InventoryDescription: '',
                InventoryID: '',
                InventoryStockItemType: Enums.StockItemType.Part,
                InventoryThumbnailUrl: '',
                ModifiedBy: storage.getCookie(Enums.Cookie.servUserName),
                ModifiedDate: time.now().toISOString(),
                Notes: '',
                RowVersion: '',
                StartingQuantity: 0,
                Status: Enums.StocktakeItemStatus.Pending,
                StocktakeItemSource: Enums.StocktakeItemSource.User,
                StocktakeName: stocktake.Name
            });
        }



        const finishAddingItem = async () => {
            // clone as we need to clear the state
            let itemToAdd = helper.clone(addingItem);

            // clearing the add item to refresh the view
            setAddingItem(null);

            // persist the stocktake item to db
            updateItemMutation.mutate({
                item: itemToAdd,
                actionName: 'name'
            });

            // waiting a bit for state change to kick in before applying a new blank stocktake item
            await helper.waitABit();
            addBlankUserItem();
        }

        useEffect(() => {
            console.log('user column config', userColumnConfig)
        }, [userColumnConfig]);


        const stockTakeMapping = useMemo(() => {
            return [
                {
                    label: 'Image',
                    key: 'Image',
                    sortable: false, // Images typically aren't sortable
                    columConfigOptions: {
                        allowShowToggle: true,
                        defaultShown: true,
                    },
                    valueFunction: (x) => (
                        <Box pos={'relative'} w={40} h={40}>
                            {
                                (x.InventoryThumbnailUrl) && (
                                    <Image
                                        onClick={() => {
                                            setPreviewImageUrl({
                                                Url: x.InventoryImageUrl,
                                                UrlThumb: x.InventoryThumbnailUrl,
                                            })
                                        }}
                                        src={x.InventoryThumbnailUrl || ''}
                                        alt=""
                                        width={40}
                                        height={40}
                                        style={{
                                            cursor: 'pointer',
                                            borderRadius: '4px',
                                            objectFit: 'cover',
                                            flexShrink: 0,
                                        }}
                                    />
                                ) || <Box pos={'absolute'} top={'50%'} left={'50%'}
                                    style={{ transform: 'translate(-50%, -50%)' }}>
                                    <StockItemTypeIcon stockItemType={x.InventoryStockItemType} size={20} />
                                </Box>
                            }
                        </Box>
                    )
                },
                {
                    label: 'Item Code',
                    key: 'InventoryCode' as keyof StocktakeItemDto,
                    maxColumnWidth: 250,
                    sortable: true, // Enable sorting for this column
                    valueFunction: (x: StocktakeItemDto) => <Flex align={'center'} gap={3} w={'100%'}>
                        <>
                            <InventoryDrawerIcon label={x.InventoryCode} inventoryId={x.InventoryID} linkMode />
                            {/*<span>{x.InventoryCode}</span>*/}
                            {
                                props.conflictItemInventoryIds && props.conflictItemInventoryIds.includes(x.InventoryID) &&
                                <Tooltip
                                    multiline
                                    maw={250}
                                    ml={'auto'}
                                    color={'yellow'}
                                    c={'dark'}
                                    label={'This item is being counted in another stocktake.  This could result in duplicate stock level adjustments if unintended.'}
                                >
                                    <IconExclamationCircle size={18} stroke={1.5}
                                        color={'var(--mantine-color-yellow-7)'} />
                                </Tooltip>
                            }
                        </>
                    </Flex>
                },
                {
                    label: 'Description',
                    key: 'InventoryDescription' as keyof StocktakeItemDto,
                    columConfigOptions: {
                        allowShowToggle: true,
                    },
                    valueFunction: (x: StocktakeItemDto) => <span>{x.InventoryDescription}</span>,
                    sortable: true, // Enable sorting for this column
                    maxColumnWidth: 250
                },
                {
                    label: 'Bin Location',
                    key: 'BinLocation' as keyof StocktakeItemDto,
                    sortable: true, // Enable sorting for this column
                    columConfigOptions: {
                        allowShowToggle: true,
                    },
                },
                ...((isAssignedEmployee || stockAdmin) ? [
                    {
                        label: 'Counted Qty',
                        key: 'CountedQuantity' as keyof StocktakeItemDto,
                        sortable: false, // Enable sorting for this column
                        valueFunction: (x: StocktakeItemDto) => (
                            (stocktake.Status === enums.StocktakeStatus.Counting /*&& (x.Status === enums.StocktakeItemStatus.Pending || x.Status === enums.StocktakeItemStatus.Recount)*/) ?
                                <Flex
                                    align={'center'}
                                    gap={3}
                                    justify={'end'}
                                >
                                    <NumberInput
                                        autoFocus={autoFocusCount === x.InventoryID}
                                        min={0}
                                        size={'xs'}
                                        // hideControls
                                        maw={80}
                                        disabled={!x.InventoryID || !stocktakeValid}
                                        title={!x.InventoryID ? "Select inventory first" : ""} ta={'right'}
                                        styles={{
                                            input: { textAlign: 'right', paddingRight: 22 },
                                            control: { zIndex: 0 }
                                        }}
                                        value={inputValues?.[x.ID] || inputValues?.[x.ID] === 0 ? +inputValues?.[x.ID] : ''}
                                        onChange={(value) => {
                                            checkDirtyItem(value, x, 'CountedQuantity')
                                            handleInputChange('CountedQuantity', x, value)
                                            setAutoFocusCount("");
                                        }
                                        }
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                                x.CountedQuantity !== (inputValues?.[x.ID] === '' ? null : +inputValues?.[x.ID]) && +inputValues?.[x.ID] >= 0 && onAction('count', x);
                                            }
                                        }}
                                        onBlur={() => {
                                            x.CountedQuantity !== (inputValues?.[x.ID] === '' ? null : +inputValues?.[x.ID]) && +inputValues?.[x.ID] >= 0 && onAction('count', x);
                                        }}
                                        leftSection={
                                            actionStates[getActionId('count', x.ID)] === 'loading' &&
                                            <Loader size={12} /> ||
                                            dirtyItem === x.ID && <IconPencil size={12} />
                                            /*||
                                        typeof inputValues?.[x.ID] === 'number' && x.CountedQuantity !== inputValues?.[x.ID] &&
                                        <ActionIcon
                                            size={ 'xs'}
                                            onClick={() => onAction('count', x)}
                                        ><IconCheck size={17} /></ActionIcon>*/

                                        }
                                    />
                                    {/*{
                                            (actionStates[getActionId('count', x.ID)] === 'loading' || actionStates[getActionId('recounted', x.ID)] === 'loading') && <Loader size={12}/> ||
                                            typeof inputValues?.[x.ID] === 'number' && (x.CountedQuantity !== inputValues?.[x.ID] || x.Status === enums.StocktakeItemStatus.Recount) &&
                                            <ActionIcon
                                                size={ 'xs'}
                                                onClick={() => onAction(x.Status === enums.StocktakeItemStatus.Recount ? 'recounted' : 'count', x)}
                                            ><IconCheck size={17} /></ActionIcon>
                                        }*/}
                                    {
                                        // x.CountedQuantity !== inputValues[x.ID] && <ActionIcon
                                        //     size={ 'xs'}
                                        //     onClick={() => onAction('count', x)}
                                        // ><IconCheck size={17} /></ActionIcon>
                                    }
                                </Flex> :
                                <Flex align={'center'} justify={'end'} ml={'auto'}>
                                    <Text size={'sm'} mr={10}>{x.CountedQuantity}</Text>
                                    {/*{
                                            (actionStates[getActionId('recount', x.ID)] === 'loading') && <Loader size={12}/> ||
                                            stocktake.Status === enums.StocktakeStatus.InProgress &&
                                            <ActionIcon
                                            variant={'subtle'}
                                            size={ 'xs'}
                                            onClick={() => onAction('recount', x)}
                                        ><IconRefresh size={17} /></ActionIcon>}*/}
                                </Flex>
                        ),
                        alignRight: true,
                        // type: stocktake.Status === enums.StocktakeStatus.InProgress ? 'numberInput' : undefined,
                        // typeFunction: (x: StocktakeItemDto) =>  stocktake.Status === enums.StocktakeStatus.InProgress && (x.Status === enums.StocktakeItemStatus.Pending || x.Status === enums.StocktakeItemStatus.Recount) ? 'numberInput' : undefined,
                        numberInputProps: {},
                        customNumberProps: {
                            focusOnSelect: true,
                        },
                    },
                ] : []
                ),
                ...((stockAdmin) ? [
                    {
                        label: 'Counted Value',
                        key: 'TotalValue',
                        sortable: false,
                        valueFunction: (x: StocktakeItemDto) => {
                            if (typeof x.CountedQuantity !== 'number' || typeof x.CostPrice !== 'number') {
                                return <Text size={'sm'} c={'dimmed'}>-</Text>;
                            }
                            const totalValue = x.CostPrice * x.CountedQuantity;
                            // Format as currency with 2 decimal places
                            return <Text size={'sm'} mr={10}>
                                {Helper.getCurrencyValue(Math.round(totalValue * 100) / 100)}
                            </Text>;
                        },
                        alignRight: true,
                        columConfigOptions: {
                            allowShowToggle: true,
                            defaultShown: false,
                        },
                    },
                    {
                        label: 'Expected Qty',
                        key: 'ExpectedQuantity' as keyof StocktakeItemDto,
                        columConfigOptions: {
                            allowShowToggle: true,
                            defaultShown: true,
                        },
                        alignRight: true,
                        sortable: false, // Enable sorting for this column
                        valueFunction: (x: StocktakeItemDto) => <span>{x.ExpectedQuantity + ''}</span>
                    },
                    {
                        label: 'Discrepancy',
                        key: 'Discrepancy',
                        alignRight: true,
                        sortable: false, // Enable sorting for this column
                        // type: 'status',
                        valueFunction: (x: StocktakeItemDto) => {
                            if (typeof x.CountedQuantity !== 'number' || typeof x.ExpectedQuantity !== 'number') return <Text
                                c={'dimmed'}
                                size={'sm'}
                            >
                                none
                            </Text>;
                            const discrepancy = x.CountedQuantity - x.ExpectedQuantity
                            return <Text
                                c={discrepancy === 0 ? 'dimmed' : discrepancy < 0 ? 'red' : 'lime'}
                                size={'sm'}
                            >
                                {
                                    discrepancy > 0 ? `+${discrepancy}` : discrepancy < 0 ? `${discrepancy}` : 'none'
                                }
                            </Text>

                        }
                    },
                    ...((stocktake.Status === enums.StocktakeStatus.CountingComplete || stocktake.Status === enums.StocktakeStatus.StocktakeComplete) ? [
                        {
                            label: 'Adjustment Qty',
                            key: 'AdjustmentQuantity' as keyof StocktakeItemDto,
                            // type: stocktake.Status === enums.StocktakeStatus.InProgress ? 'numberInput' : undefined,
                            valueFunction: (x: StocktakeItemDto) => {
                                const discrepancy = x.CountedQuantity !== null /*&& x.ExpectedQuantity !== null*/ && (x.CountedQuantity - (x.ExpectedQuantity || 0))
                                return (
                                    (typeof discrepancy === 'number' && discrepancy !== 0) && <>
                                        {
                                            stocktake.Status === enums.StocktakeStatus.CountingComplete &&
                                            <Flex
                                                align={'center'}
                                                gap={3}
                                                justify={'end'}
                                            >
                                                <NumberInput
                                                    disabled={!stocktakeValid}
                                                    leftSection={
                                                        actionStates[getActionId('adjust', x.ID)] === 'loading' &&
                                                        <Loader size={12} /> ||
                                                        dirtyItem === x.ID && <IconPencil size={12} />
                                                    }
                                                    size={'xs'}
                                                    // hideControls
                                                    maw={80}
                                                    ta={'right'}
                                                    styles={{ input: { textAlign: 'right', paddingRight: 22 } }}
                                                    value={adjustmentInputValues?.[x.ID]}
                                                    onChange={(value) => {
                                                        checkDirtyItem(value, x, 'AdjustmentQuantity')
                                                        handleInputChange('AdjustmentQuantity', x, value)
                                                    }}
                                                    onKeyPress={(e) => {
                                                        if (e.key === 'Enter') {
                                                            x.AdjustmentQuantity !== +adjustmentInputValues?.[x.ID] && onAction('adjust', x)
                                                        }
                                                    }}
                                                    onBlur={() => {
                                                        x.AdjustmentQuantity !== +adjustmentInputValues?.[x.ID] && onAction('adjust', x)
                                                    }}
                                                /*leftSection={
                                                    actionStates[getActionId('adjust', x.ID)] === 'loading' &&
                                                    <Loader size={12}/> ||
                                                    typeof adjustmentInputValues?.[x.ID] === 'number' && x.AdjustmentQuantity !== adjustmentInputValues?.[x.ID] &&
                                                    <ActionIcon
                                                        size={'xs'}
                                                        onClick={() => onAction('adjust', x)}
                                                    ><IconCheck size={17}/></ActionIcon>
                                                }*/
                                                />
                                                {
                                                    // x.CountedQuantity !== inputValues[x.ID] && <ActionIcon
                                                    //     size={ 'xs'}
                                                    //     onClick={() => onAction('count', x)}
                                                    // ><IconCheck size={17} /></ActionIcon>
                                                }
                                            </Flex> ||
                                            <Text size={'sm'} mr={10}>{x.AdjustmentQuantity}</Text>
                                        }
                                    </>
                                )
                            },
                            // typeFunction: (x: StocktakeItemDto) =>  stocktake.Status === enums.StocktakeStatus.InProgress && (x.Status === enums.StocktakeItemStatus.Counted || x.Status === enums.StocktakeItemStatus.Recounted || x.Status === enums.StocktakeItemStatus.Verified) ? 'numberInput' : undefined,
                            numberInputProps: {},
                            alignRight: true,
                            customNumberProps: {
                                focusOnSelect: true,
                            },
                            /*showFunction: (x) => {
                                const discrepancy = x.CountedQuantity !== null && x.ExpectedQuantity !== null && (x.CountedQuantity - x.ExpectedQuantity)
                                return (typeof discrepancy === 'number' && discrepancy !== 0)
                            }*/
                        },
                        {
                            label: 'Adjustment Reason',
                            key: 'AdjustmentReason' as keyof StocktakeItemDto,
                            columnWidth: 170,
                            valueFunction: (x: StocktakeItemDto) => {
                                const discrepancy = x.CountedQuantity !== null && x.ExpectedQuantity !== null && (x.CountedQuantity - x.ExpectedQuantity)
                                return (
                                    (typeof discrepancy === 'number' && discrepancy !== 0) ?
                                        (
                                            stocktake.Status === enums.StocktakeStatus.CountingComplete &&
                                            <Flex
                                                align={'center'}
                                                gap={3}
                                                justify={'end'}
                                                maw={140}
                                                ml={'auto'}
                                            >
                                                <Select
                                                    disabled={!stocktakeValid}
                                                    clearable
                                                    leftSection={
                                                        actionStates[getActionId('adjust', x.ID)] === 'loading' &&
                                                        <Loader size={12} />
                                                    }
                                                    allowDeselect={false}
                                                    value={adjustmentReasons?.[x.ID]}
                                                    data={
                                                        [
                                                            {
                                                                label: 'Admin Error',
                                                                value: enums.StocktakeAdjustmentReason.AdministrationError + ''
                                                            },
                                                            // ...(discrepancy < 0 ? [
                                                            {
                                                                label: 'Theft / Robbery',
                                                                value: enums.StocktakeAdjustmentReason.Theft + ''
                                                            },
                                                            {
                                                                label: 'Damaged Goods',
                                                                value: enums.StocktakeAdjustmentReason.DamagedGoods + ''
                                                            },

                                                            {
                                                                label: 'Misplaced',
                                                                value: enums.StocktakeAdjustmentReason.Misplaced + ''
                                                            },
                                                            // ] : discrepancy > 0 ? [] : []),
                                                            {
                                                                label: 'Miscounted',
                                                                value: enums.StocktakeAdjustmentReason.Miscounted + ''
                                                            },
                                                        ]
                                                    }
                                                    withCheckIcon={false}
                                                    // unstyled
                                                    styles={(theme, inputProps) => ({
                                                        // control: {padding: 0},
                                                        input: {
                                                            textAlign: 'end',
                                                        },
                                                        option: {
                                                            textAlign: 'end',
                                                        }
                                                    })}
                                                    onChange={e => {
                                                        handleInputChange('AdjustmentReason', x, e)
                                                        x.AdjustmentReason !== (e === null ? null : +e) &&
                                                            onAction('adjust', {
                                                                ...x,
                                                                AdjustmentReason: e === null ? null : +e
                                                            })
                                                    }}
                                                    /*onBlur={() => {
                                                        x.AdjustmentReason !== +adjustmentReasons?.[x.ID] && onAction('adjust', x)
                                                    }}
                                                    onClear={() => {x.AdjustmentReason !== null && onAction('adjust', {...x, AdjustmentReason: null})}}*/
                                                    size={'xs'}
                                                />
                                                {
                                                    // actionStates[getActionId('adjust', x.ID)] === 'loading' &&
                                                    // <Loader size={12}/> ||
                                                    // (typeof adjustmentInputValues?.[x.ID] === 'number' && x.AdjustmentQuantity !== adjustmentInputValues?.[x.ID] ||
                                                    // adjustmentReasons?.[x.ID] !== ''  && x.AdjustmentReason !== +adjustmentInputValues?.[x.ID]) &&
                                                    // <ActionIcon
                                                    //     size={'xs'}
                                                    //     onClick={() => onAction('adjust', x)}
                                                    // >
                                                    //     <IconCheck size={17}/>
                                                    // </ActionIcon>
                                                }
                                                {
                                                    // x.CountedQuantity !== inputValues[x.ID] && <ActionIcon
                                                    //     size={ 'xs'}
                                                    //     onClick={() => onAction('count', x)}
                                                    // ><IconCheck size={17} /></ActionIcon>
                                                }
                                            </Flex> ||
                                            <Text size={'sm'} mx={'auto'}
                                                ta={'center'}>{enums.StocktakeAdjustmentReasonText[x.AdjustmentReason]}</Text>
                                        ) : ''
                                )
                            },
                            alignRight: true,
                            /*selectOptions: [
                                {
                                    label: 'Admin Error',
                                    value: enums.StocktakeAdjustmentReason.AdministrationError + ''
                                },
                                {
                                    label: 'Theft / Robbery',
                                    value: enums.StocktakeAdjustmentReason.Theft + ''
                                },
                                {
                                    label: 'Damaged Goods',
                                    value: enums.StocktakeAdjustmentReason.DamagedGoods + ''
                                },
                                {
                                    label: 'Miscounted',
                                    value: enums.StocktakeAdjustmentReason.Miscounted + ''
                                },
                                {
                                    label: 'Misplaced',
                                    value: enums.StocktakeAdjustmentReason.Misplaced + ''
                                },
                            ],*/
                        },
                        {
                            label: 'Adjustment Value',
                            key: 'AdjustmentValue',
                            sortable: false,
                            valueFunction: (x: StocktakeItemDto) => {
                                const discrepancy = x.CountedQuantity !== null && (x.CountedQuantity - (x.ExpectedQuantity || 0));
                                if (typeof discrepancy !== 'number' || discrepancy === 0 || typeof x.CostPrice !== 'number' || typeof x.AdjustmentQuantity !== 'number') {
                                    return <Text size={'sm'} c={'dimmed'}>-</Text>;
                                }
                                const adjustmentValue = x.CostPrice * x.AdjustmentQuantity;
                                return <Text size={'sm'} mr={10}>
                                    {Helper.getCurrencyValue(Math.round(adjustmentValue * 100) / 100)}
                                </Text>;
                            },
                            alignRight: true,
                            columConfigOptions: {
                                allowShowToggle: true,
                                defaultShown: false,
                            },
                        },
                        {
                            label: 'Source',
                            key: 'StocktakeItemSource' as keyof StocktakeItemDto,
                            columConfigOptions: {
                                allowShowToggle: true,
                                defaultShown: true,
                            },
                            valueFunction: (x: StocktakeItemDto) => {
                                // switch (x.StocktakeItemSource) {
                                //     case Enums.StocktakeItemSource.Template:
                                //         return <>
                                //         <IconTemplate />
                                //         </>
                                //     case Enums.StocktakeItemSource.User:
                                //         return <>
                                //         <IconUser />
                                //         </>
                                // }
                                return <>{Enums.getEnumStringValue(Enums.StocktakeItemSource, x.StocktakeItemSource, true)}</>
                            }
                        }
                    ] : []),
                    /*{
                        label: 'Status',
                        key: 'Status' as keyof StocktakeItemDto,
                        type: 'status' as 'status',
                        valueFunction: x => enums.StocktakeItemStatusText[x.Status]?.label || 'unknown',
                        colorFunction: x => enums.StocktakeItemStatusText[x.Status]?.color
                    },*/
                ] : []),
            ]
        }, [stocktake, stocktakeValid, stockAdmin, stocktakeCanEditItems, isAssignedEmployee, openEnded, handleInputChange, onAction, actionStates, inputValues, adjustmentInputValues, adjustmentReasons, searchQuery, filterState]);

        return <>


            <SCModal
                open={!!previewImageUrl}
                showClose={true}
                withCloseButton={true}
                onClose={() => setPreviewImageUrl(null)}
                size={"auto"}
            >
                {
                    previewImageUrl &&
                    <ImageWithZoom
                        attachment={{ ContentType: "image/jpeg", ...previewImageUrl }}
                    />
                }
            </SCModal>

            <Flex align={'center'} mb={5}>
                <TextInput
                    mt={0}
                    value={searchQuery}
                    onChange={(e) => {
                        setSearchQuery(e.target.value)
                        setQueryParams(prev => ({ ...prev, pageIndex: 0, searchPhrase: e.target.value }))
                    }}
                    placeholder={'Search'}
                    size={'sm'}
                    leftSection={<IconSearch size={17} />}
                    rightSection={!!searchQuery && <CloseButton size={'xs'} onClick={() => {
                        setSearchQuery('')
                        setQueryParams(prev => ({ ...prev, pageIndex: 0, searchPhrase: '' }))
                    }} />}
                    // variant={'outline'}
                    w={'250px'}
                    mr={'sm'}
                />
                <ScDataFilter
                    initialValues={filterState as any}
                    onChange={(newState) => {
                        setFilterState(newState)
                        setQueryParams(prev => ({ ...prev, pageIndex: 0 }))
                    }}
                    module={enums.Module.Inventory}
                    tableNoun={'Stock Items'}
                    flexProps={{ align: 'start', wrap: { base: 'wrap' }, mt: 0 }}
                    singleSelectMode
                    tableName={'stocktakeitemfilter'}
                    optionConfig={{
                        options: [
                            {
                                type: 'switch',
                                label: 'Show Only Discrepancies',
                                filterName: 'OnlyDiscrepancies',
                                inclusion: 'exclusive',
                                dataValueKey: 'IsDiscrepancy',
                            }/*,
                        {
                            filterName: 'StocktakeItemStatusList',
                            label: 'Status',
                            hardcodedOptions: [
                                ...Object.entries(enums.StocktakeItemStatusText).map(([value, {label, color}]) => ({value, color, label})),
                            ]
                        }*/
                        ],
                        showIncludeDisabledOptionsToggle: true
                    }}
                />

                {
                    showAddItemToCount && stocktakeValid &&

                    <Button
                        ml={'auto'}
                        size="sm"
                        variant={'light'}
                        disabled={!!addingItem}
                        leftSection={!buttonIconMode && <IconPlus size={16} />}
                        miw={buttonIconMode ? 'auto' : ''}
                        px={buttonIconMode ? 7 : ''}
                        onClick={addBlankUserItem}
                    >
                        {buttonIconMode ? <IconPlus size={16} /> : 'Add Items to Count'}
                    </Button>
                }
                {
                    exportPermission && !!stocktakeItems?.length && stocktake.ID &&
                    <Button
                        ml={showAddItemToCount && stocktakeValid ? 7 : 'auto'}
                        variant={'subtle'}
                        color={'gray.8'}
                        rightSection={!buttonIconMode && <IconTableExport size={15} />}
                        miw={buttonIconMode ? 'auto' : ''}
                        px={buttonIconMode ? 7 : ''}
                        onClick={handleFilteredExport}
                    >
                        {
                            buttonIconMode ? <IconTableExport size={15} /> :
                                'Export'
                        }
                    </Button>
                }
                {
                    !!stocktakeItems?.length && stocktake.ID &&
                    <Button
                        ml={5}
                        variant={'subtle'}
                        color={'gray.8'}
                        rightSection={!buttonIconMode && <IconDotsVertical size={15} />}
                        miw={buttonIconMode ? 'auto' : ''}
                        px={buttonIconMode ? 7 : ''}
                        onClick={() => setPreferencesDrawerOpen(true)}
                    >
                        {
                            buttonIconMode ? <IconDotsVertical size={15} /> :
                                'Columns'// 'Preferences' 
                        }
                    </Button>
                }

                {/*{
                stockAdmin &&
                stocktake.Status !== enums.StocktakeStatus.CountingComplete &&
                stocktake.Status !== enums.StocktakeStatus.Cancelled &&
                stocktake.Status !== enums.StocktakeStatus.StocktakeComplete &&
                <Button
                    miw={235}
                    ml={!(exportPermission && stocktakeItems?.length && stocktake.ID) ? 'auto' : 'sm'}
                    disabled={isLoading || !isSuccess}
                    leftSection={<IconPlusMinus size={17} />} size={'sm'} variant={'light'}
                    onClick={() => setModifyStocktakeitems(true)}>
                    Add / Remove Items
                </Button>
            }*/}

            </Flex>


            {
                !!addingItem && <Flex w="100%" mt={"sm"} mb={"md"} gap={5} align={"end"}>

                    <div style={{ width: "500px", marginTop: "-0.75rem" }}>
                        <InventorySelector
                            autoFocus={true}
                            disabled={!stocktakeValid}
                            selectedInventory={{
                                ID: addingItem.InventoryID,
                                Code: addingItem.InventoryCode,
                                Description: addingItem.InventoryDescription
                            }}
                            setSelectedInventory={(inventory) => {
                                setAddingItem({
                                    ...addingItem,
                                    InventoryID: inventory?.ID ?? '',
                                    InventoryCode: inventory?.Code ?? '',
                                    InventoryDescription: inventory?.Description ?? '',
                                    InventoryStockItemType: inventory?.StockItemType ?? 0,
                                    BinLocation: inventory?.BinLocation ?? '',
                                    InventoryThumbnailUrl: inventory?.ThumbnailUrl ?? '',
                                });
                                setTimeout(() => addingItemCountRef.current.focus(), 50);
                            }}
                            accessStatus={Enums.AccessStatus.Live}
                            onCreateNewInventoryItem={() => {
                            }}
                            label="Adding stock to count"
                            canClear={true}
                            additionalQueryParams={{
                                IgnoreLinkedItemsFromItemID: stocktake.ID,
                                IgnoreLinkedItemsModule: Enums.Module.Stocktake
                            } as any}
                        />
                    </div>

                    <NumberInput
                        ref={addingItemCountRef}
                        label="Counted Qty"
                        autoFocus={true}
                        min={0}
                        size={'sm'}
                        hideControls
                        maw={80}
                        disabled={!addingItem.InventoryID || !stocktakeValid}
                        title={!addingItem.InventoryID ? "Select inventory first" : ""}
                        ta={'right'}
                        styles={{ input: { textAlign: 'right' } }}
                        value={addingItem.CountedQuantity as any}
                        onChange={(value) => {
                            setAddingItem({
                                ...addingItem,
                                CountedQuantity: value as any,
                                CountedDate: time.toISOString(time.now())
                            });
                        }}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter' && canFinishAddingItem) {
                                finishAddingItem();
                            }
                        }}

                    />

                    <ActionIcon
                        h={'36px'}
                        w={'36px'}
                        color="scBlue"
                        disabled={!canFinishAddingItem}
                        title={!canFinishAddingItem ? "Item captured needs inventory and count" : "Confirm item capture is completed"}
                        onClick={finishAddingItem}>
                        <IconCheck size={16} />
                    </ActionIcon>
                    <ActionIcon
                        h={'36px'}
                        w={'36px'}
                        color="gray"
                        title="Cancel adding new item"
                        onClick={() => {
                            setAddingItem(null);
                        }}>
                        <IconX size={16} />
                    </ActionIcon>

                </Flex>
            }


            {
                (stocktakeItems || []).length > 0 &&
                <SimpleTable
                    isLoading={isLoading}
                    tableRef={tableRef}
                    // minHeight={'calc(100vh - 190px)'}
                    height={'calc(100vh - 336px)'}
                    data={stocktakeItems?.filter(x => x.IsActive) || []}
                    showControlsOnHover={false}
                    onAction={onAction}
                    tableActionStates={actionStates}
                    onInputChange={handleInputChange}
                    onSort={handleSort}
                    initialSort={sortState}
                    userColumnConfig={userColumnConfig}
                    stylingProps={{
                        compact: true,
                        darkerText: true,
                        rowBorders: true,
                    }}
                    controls={
                        stocktakeValid && stockAdmin && stocktake.Status !== enums.StocktakeStatus.StocktakeComplete && stocktake.Status !== enums.StocktakeStatus.Cancelled ? [
                            {
                                label: 'Remove',
                                name: 'remove',
                                activeLabel: 'Removing...',
                                type: 'warning',
                                icon: <IconTrash />
                            },
                        ] : []
                    }
                    mapping={
                        stockTakeMapping
                    }

                />
            }

            {/* Add pagination component */}
            {(stocktakeItems || []).length > 0 && (
                <Flex align={'center'} gap={'xs'} mt={3}>
                    <Group miw={15} justify={'center'}>
                        {!isInitialLoading && (
                            <ActionIcon ml={3} color={'gray.7'} variant={'transparent'} size={'sm'}
                                onClick={() => refetch()}>
                                <IconRefresh
                                    style={{ transition: '2s ease-in-out' }}
                                    className={isFetching ? styles.rotate : ''}
                                />
                            </ActionIcon>
                        )}
                        {!isInitialLoading && isLoading &&
                            <Loader size={16} color={Enums.StocktakeStatusText[stocktake.Status].color} />}
                    </Group>

                    <div style={{ flexGrow: 1, marginRight: 65 }}>
                        <ScPagination
                            totalElements={stocktakeItemsResponse?.TotalResults}
                            totalOnPage={stocktakeItemsResponse?.ReturnedResults}
                            currentPage={queryParams.pageIndex}
                            pageSize={queryParams.pageSize}
                            onChange={handlePaginationChange}
                            rowsRelabel={'Items'}
                        />
                    </div>
                </Flex>
            )}

            {
                isInitialLoading && !stocktakeItems ? <Flex align={'center'} justify={'center'} mih={250} mb={'xl'}>
                    <Loader size={40} color={Enums.StocktakeStatusText[stocktake.Status].color} />
                </Flex> : error && <Text c="yellow.7" size={'sm'}>{error?.message}</Text>
            }

            {
            /*!isLoading && isSuccess && isStale && stocktakeItemsResponse?.Results &&*/ stocktakeItems?.filter(x => x.IsActive).length === 0
                && (stocktakeCanEditItems)
                && (
                    <Box p="xl" my={'xl'} style={{ textAlign: 'center' }}>
                        {
                        /*searchQuery === '' && !filterState.OnlyDiscrepancies && <>
                            <Text c="dimmed" size="sm">
                                No stocktake items added yet. &nbsp;{stockAdmin ? 'Get started by adding items to the list.' : 'Please ask your admin to add items to start capturing.'}
                            </Text>
                            {
                                stockAdmin && <Button
                                    mt="md"
                                    variant="light"
                                    leftSection={<IconPlusMinus size={16} />}
                                    onClick={() => setModifyStocktakeitems(true)}
                                >
                                    Add Items
                                </Button>
                            }
                        </> ||*/ <>
                                <Text c="dimmed" size="sm">
                                    No items found. &nbsp;{showAddItemToCount ? 'Add items to start capturing.' : 'Try changing the search query.'}
                                </Text>
                                {showAddItemToCount && stocktakeValid && (
                                    <Button
                                        disabled={!!addingItem}
                                        mt="md"
                                        variant="light"
                                        leftSection={<IconPlus size={16} />}
                                        onClick={addBlankUserItem}
                                    >
                                        Add Items to Count
                                    </Button>
                                )}
                            </>
                        }
                    </Box>
                )
            }

            <StockTakePreferencesDrawer
                open={preferencesDrawerOpen}
                onClose={() => setPreferencesDrawerOpen(false)}
                onUserColumnConfigLoaded={(columnMapping) => setUserColumnConfig(columnMapping)}
                mapping={stockTakeMapping}
            />

            <InventoryDrawerProvider />

        </>;
    }


export default StockTakeItemList
