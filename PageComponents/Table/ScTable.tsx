'use client';

import {FC, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useRef, useState} from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Fetch from "@/utils/Fetch";
import {
    ColumnMappingData, FilteredOutResults,
    PageProps, ScFilterOptionSwitchProps, ScFilterOptionTabsProps,
    ScTableProps,
    ScTableQueryStateProps, SortProps,
} from "@/PageComponents/Table/table-model";
import {
    ActionIcon, Anchor,
    Box,
    Button, Checkbox,
    CloseButton, Drawer,
    Flex,
    Group,
    LoadingOverlay, Menu, TextInput, Text,
    Title, Tooltip,
} from "@mantine/core";
import {
    IconDotsVertical,
    IconFilter,
    IconLayoutColumns,
    IconSearch,
    IconX
} from "@tabler/icons";
import { useDebouncedState, useDebouncedValue } from "@mantine/hooks";
import ScTableData from "@/PageComponents/Table/Table/ScTableData";
import ScPagination from "@/PageComponents/Table/ScPagination";
import { useAtom } from "jotai";
import { readWriteAtom, readWriteFilterStatesAtom } from "@/utils/atoms";
import {
    buildLegacyAncillaryAndActiveFilterMetaData,
    constructFilterInitialValue,
    flatMapLegacyAncillaryAndActiveFilter,
    getActiveFilterCount
} from "@/PageComponents/Table/table-helper";
import UserConfigService from "@/services/option/user-config-service";
import { useRouter } from "next/router";
import ScDataFilter from "@/PageComponents/Table/Table Filter/ScDataFilter";
import ScActiveColumns from "@/PageComponents/Table/Table Columns/ScActiveColumns";
import useWindowSize from "@/hooks/useWindowSize";
import Storage from "@/utils/storage"
import * as Enums from "@/utils/enums"
import ScTabFilter from "@/PageComponents/Table/Table Filter/ScTabFilter";
import styles from './Table/ScTableData.module.css'
import ScTableDataCards from "@/PageComponents/Table/CardView/ScTableDataCards";
import { IconExclamationCircle, IconRefresh, IconLayoutGrid, IconLayoutList, IconMap2 } from "@tabler/icons-react";
import SCMessageBarContext from "@/utils/contexts/sc-message-bar-context";
import constants from "@/utils/constants";


const getLsShowDisabledFilterOptions = (tableName: string) => {
    try {
        return localStorage && (localStorage.getItem(tableName + 'showDisabledFilters'))
    } catch (e) {
        return 'false'
    }
}
const setLsShowDisabledOptions = (tableName: string, val: string) => {
    return localStorage && (localStorage.setItem(tableName + 'showDisabledFilters', val))
}

const getLsUseBulkOperations = (tableName: string) => {
    try {
        return (localStorage.getItem(tableName + 'useBulkOps'))
    } catch (e) {
        return 'true'
    }
}
const setLsUseBulkOperations = (tableName: string, val) => {
    return (localStorage.setItem(tableName + 'useBulkOps', val))
}

const getLsColumnMapping: (tableName: string) => ColumnMappingData[] | undefined = (tableName) => {
    try {
        const ls = localStorage.getItem(tableName + '-columns-')
        return ls && JSON.parse(ls) || undefined
    } catch (e) {
        return undefined
    }
}

const setLsColumnMapping = (tableName: string, columnMapping: ColumnMappingData[]) => {
    localStorage && localStorage.setItem(tableName + '-columns-', JSON.stringify(columnMapping))
}

const setLsFilterState = (tableName: string, filterState: any) => {
    const scopy = { ...filterState, searchPhrase: '' }
    // delete scopy.searchPhrase
    localStorage && localStorage.setItem(tableName + '-filter-', JSON.stringify(scopy))
}

const getLsFilterState:
    (tableName: string) => ScTableQueryStateProps | undefined =
    (tableName) => {
        try {
            const ls = localStorage.getItem(tableName + '-filter-')
            return ls && JSON.parse(ls) || undefined
        } catch (e) {
            return undefined
        }
    }
const setLsFilterShownState = (tableName: string, filterState: 'true' | 'false') => {
    localStorage && localStorage.setItem(tableName + '-showF-', filterState)
}

const getLsFilterShownState = (tableName) => {
    return localStorage && (!localStorage.getItem(tableName + '-showF-') ? true : localStorage.getItem(tableName + '-showF-') === 'true')
}

const fetchColMapping = async (model) => {
    const res = await Fetch.get({ url: `/Employee/ColumnMapping?model=${model}` } as any)
    if (res.Results) {
        return res.Results
    } else {
        throw new Error(res.serverMessage || res.message || 'Unexpected Server Response')
    }
}
const putColMapping = async (model, ColumnMappings) => {
    const res = await Fetch.put({ url: '/Employee/ColumnMapping', params: { ColumnMappings, model } } as any)
    if (res.Results) {
        return res.Results
    } else {
        throw new Error(res.serverMessage || res.message || 'Unexpected Server Response')
    }
}
const fetchTableData = async (url, params, tableDataOnLoad) => {

    // Filter out empty keys from params object
    // not sure what is resulting in '': false being emitted but this is a workaround for now
    const filteredParams = typeof params === "object" ? Object.fromEntries(
        Object.entries(params || {}).filter(([_]) =>
            _ !== ''
        )
    ) : params;

    let pathname = "";
    if (typeof window !== "undefined") {
        pathname = window.location.pathname;
    }

    const res = await Fetch.post({ url, params: filteredParams, caller: pathname } as any)
    if (res.Results) {
        tableDataOnLoad && tableDataOnLoad(res)
        return res
    } else {
        throw new Error(res.serverMessage || res.message || 'Unexpected Server Response')
    }
}


export function getCombinedLocalColumnMapping(tableName: string, hcColMapping: ColumnMappingData[]) {
    const ls = getLsColumnMapping(tableName)
    if (ls) {
        return hcColMapping.map((x) => (
            {
                ...(ls.find(y => y.ID === x.ID) || {}),
                ...x
            }
        ))
    } else {
        return hcColMapping
    }
}

const iconSize = 18

const colTitle = (
    <Flex direction={'column'} gap={2}>
        <Title order={4} c={'dimmed'}>
            <Flex align={'center'} gap={5}>
                <IconLayoutColumns size={20} />
                Columns
            </Flex>
        </Title>
        <Text fz={14} c={'dimmed'}>Drag these items to re-order them in the table.</Text>
    </Flex>
)

const ScTable: FC<PropsWithChildren<ScTableProps>> = (props) => {

    const tenantId = useMemo(() => Storage.getCookie(Enums.Cookie.tenantID), [])

    // console.log('table root')
    const queryClient = useQueryClient()

    const [bypassAuthConfig, setBypassAuthConfig] = useState(false)

    const [useBulkOps, setUseBulkOps] = useState(
        props.selectMode === 'bulk' && (getLsUseBulkOperations(props.tableName) === 'true' || !getLsUseBulkOperations(props.tableName))
    )
    const handleUseBulkOpsChange = () => {
        setUseBulkOps(p => {
            setLsUseBulkOperations(props.tableName, !p ? 'true' : 'false')
            return !p
        })
    }

    const [showDisabledFilters, setShowDisabledFilters] = useState(
        props.tableFilterMetaData?.showIncludeDisabledOptionsToggle && getLsShowDisabledFilterOptions(props.tableName) === 'true'
    )
    useEffect(
        () => {
            setLsShowDisabledOptions(props.tableName, showDisabledFilters ? 'true' : 'false')
        },
        [showDisabledFilters]
    )

    // const [data, setData] = useAtom(dataAtomFamily({name: props.tableName, tableProps}))
    const router = useRouter()
    useEffect(() => {
        const query = router.query
        if (query && !!props.queryParamNames) {
            const filter = {}
            Object.entries(query).forEach(
                ([key, value]) => {
                    const paramMapping = props.queryParamNames?.[key]
                    if (paramMapping) {
                        if (paramMapping.type === 'unassignedOption' || paramMapping.type === 'boolean') {
                            filter[paramMapping.filterName] = value === 'true'
                        } else {
                            filter[paramMapping.filterName] = paramMapping.type === 'option' ? value === 'none' ? [] : [value] : value
                        }
                    }
                }
            )
            if (Object.keys(filter).length > 0) {
                queryClient.cancelQueries(['authUserConfig'])
                setBypassAuthConfig(true)
                handleFilterChange(filter, true)
                setFilterForcedState(filter)
            }
        }
    }, [router.query]);

    const userConfigMutation = useMutation(['useAuthConfigMutation', props.tableName], UserConfigService.saveConfig, {
        onSuccess: (data, variables, context) => {
            // console.log('updated authuserconfig', data, variables)
        },
        onError: console.error,
        //onMutate: console.log,
    })

    const [columnMapping, setColumnMapping] = useState<ColumnMappingData[]>(props.staticColumnMapping ? getCombinedLocalColumnMapping(props.tableName, props.staticColumnMapping) : getLsColumnMapping(props.tableName) ?? [])
    const colMappingQuery = useQuery<ColumnMappingData[]>(
        [props.tableName, 'columnDefinition'],
        () => fetchColMapping(props.columnMappingModelName),
        {
            onError: console.error,
            enabled: !!props.columnMappingModelName,
            refetchOnMount: false,
            refetchOnReconnect: false,
            refetchOnWindowFocus: false
            /*initialData: () => {
                const mapping = getLsColumnMapping(props.tableName)
                console.log('initial column mapping data', mapping)
                mapping && setColumnMapping(mapping)
                return mapping
            }*/
        })

    // Update column mapping when query data changes
    useEffect(() => {
        if (colMappingQuery.data) {
            const mapped = colMappingQuery.data.map(x => {
                const override = props.columMappingOverrideValues?.[x.ColumnName]
                return {
                    ...x,
                    ...override
                }
            })
            setColumnMapping(mapped)
            setLsColumnMapping(props.tableName, mapped)
        }
    }, [colMappingQuery.data, props.tableName])

    // reapply overrides if they have changed and column mapping is loaded
    useEffect(() => {
        if(columnMapping.length > 0) {
            const mapped = columnMapping.map(x => {
                const override = props.columMappingOverrideValues?.[x.ColumnName]
                return {
                    ...x,
                    ...override
                }
            })
            setColumnMapping(
                mapped
            )
            setLsColumnMapping(props.tableName, mapped)
        }
    }, [props.columMappingOverrideValues]);

    const [columnMappingModified, setColumnMappingModified] = useState(false)
    const columnMappingMutation = useMutation(
        [props.tableName, 'columnDefinition'],
        ({ newColMapping }: {
            newColMapping: ColumnMappingData[]
        }) => putColMapping(props.columnMappingModelName, newColMapping),
    )
    const [debouncedColumnMapping] = useDebouncedValue(columnMapping, 600)
    useEffect(() => {
        if (columnMappingModified) {
            if (props.columnMappingModelName) {
                columnMappingMutation.mutate({ newColMapping: debouncedColumnMapping }, {
                    //onSuccess: console.log,
                    onError: console.error
                })
                setColumnMapping(
                    debouncedColumnMapping
                )
            }
            setLsColumnMapping(props.tableName, debouncedColumnMapping)
        }
    }, [debouncedColumnMapping])
    // console.log(columnMapping)

    const cardMapping = props.cardMapping

    const [showFilter, setShowFilter] = useState( /*getLsFilterShownState(props.tableName)*/ true)
    const handleToggleFilter = () => {
        setShowFilter((x) => {
            setLsFilterShownState(props.tableName, !x + '' as 'true' | 'false')
            if (x) {
                setFilterForcedState(tableState)
            }
            return !x
        })
    }

    const [showColumns, setShowColumns] = useState(false)

    const [getFilterJotai, setFilterJotai] = useAtom(readWriteFilterStatesAtom)
    const filterDataId = useMemo(() => props.tableName + (tenantId || ''), [props.tableName, tenantId])

    // will be true if jotai state already or ls existing when table loaded - used to know if use config should be set (should only set stat from auth config on new tabs)
    const [localFIlterStateAvailableOnMount] = useState(!!getFilterJotai[filterDataId] || !!getLsFilterState(props.tableName))


    const authUserConfigQuery = useQuery(['authUserConfig', props.tableName], async () => props.authUserConfig(), {
        // enabled: !bypassAuthConfig && !!props.authUserConfig && !getFilterJotai[filterDataId],
        enabled: !!props.authUserConfig,
        onError: console.error,
        // staleTime: 0, // 1sec,
        cacheTime: 0, // 1sec
        // behavior: ['fresh']
        refetchOnMount: false,
        // refetchInterval: false,
        refetchOnWindowFocus: false
    })

    // Update auth user config metadata and table state when query data changes
    useEffect(() => {
        if (authUserConfigQuery.data) {
            const metaData = authUserConfigQuery.data?.MetaData
            setAuthUserConfigMetaData(metaData)

            if (!bypassAuthConfig && !localFIlterStateAvailableOnMount) {
                const mapped = flatMapLegacyAncillaryAndActiveFilter(metaData, tableState)
                !bypassAuthConfig && setTableState((p) => {
                    /*if(!!mapped.searchPhrase && searchInputRef.current) {
                        handleSearchChange(mapped.searchPhrase)
                        searchInputRef.current.value = mapped.searchPhrase
                    }*/
                    setFilterForcedState({ ...p, ...mapped })
                    return ({ ...p, ...mapped })
                })
            }
        }
    }, [authUserConfigQuery.data, bypassAuthConfig, localFIlterStateAvailableOnMount])

    const getLsFilter = useMemo(() => getLsFilterState(props.tableName), [])

    const [tableState, setTableState] = useState<ScTableQueryStateProps>({
        pageSize: 10,
        pageIndex: 0,
        searchPhrase: '',
        SortExpression: '',
        // SortExpression: null,
        SortDirection: '',
        // SortDirection: null,
        ...(props.tableFilterMetaData && constructFilterInitialValue(props.tableFilterMetaData)),
        ...(!props.bypassGlobalState && (getFilterJotai[filterDataId] ?? getLsFilter)),
    })

    // filter forced state is used to set the filter initially and when clearing and should only change then
    // this is done to mitigate a very evasive issue on safari that cases the filter to set and clear in an infinite loop
    const [filterForcedState, setFilterForcedState] = useState<any>(
        tableState
    )

    const searchInputRef = useRef<HTMLInputElement>(null)

    const getActiveFilterLength = () => {
        return getActiveFilterCount(props.tableFilterMetaData?.options || [], tableState)
    }

    const [filterLength, setFilterLength] = useState(getActiveFilterLength())
    useEffect(() => {
        setFilterLength(getActiveFilterLength())
    }, [tableState])


    const [debouncedTableState, cancelDebouncedTableState] = useDebouncedValue(tableState, 150)
    const [searchPhrase, setSearchPhrase] = useDebouncedState(tableState.searchPhrase, 500)

    useEffect(() => {
        setQueryParams(debouncedTableState)
        setFilterJotai(filterDataId, debouncedTableState)
    }, [debouncedTableState])

    useEffect(() => {
        setQueryParams(p => ({ ...p, searchPhrase, pageIndex: 0 }))
        setTableState(p => ({ ...p, searchPhrase, pageIndex: 0 }))
        cancelDebouncedTableState()
    }, [searchPhrase])


    const [queryParams, setQueryParams] = useState(tableState)
    // const [queryDebounced] = useDebouncedValue(queryParams, 500)

    useEffect(() => {
        !!props.onTableQueryStateChanged && props.onTableQueryStateChanged(queryParams)
        setLsFilterState(props.tableName, queryParams)
        // setHiddenResults(null)
    }, [queryParams])

    const [getData, setData] = useAtom(readWriteAtom)
    const getDataId = () => {
        return [
            props.tableName,
            tenantId,
            ...Object.entries(queryParams).map(
                ([key, value]) => (key + (value + ''))
            )
        ].join('-')
    }

    const [hiddenResults, setHiddenResults] = useState<FilteredOutResults>(null)

    const messageBarContext = useContext<any>(SCMessageBarContext);

    // Query to check if any items exist at all (with relaxed filters) for custom empty message
    const [totalItemsExist, setTotalItemsExist] = useState<boolean | null>(null)
    const [checkTotalItemsQueryParams, setCheckTotalItemsQueryParams] = useState<any>(null)

    const [tableData, setTableData] = useState()
    const tableDataQuery = useQuery(
        [props.tableName, 'tableData', props.tableDataPayloadSingleQueryItemValue ?? queryParams],
        () => fetchTableData(props.tableDataEndpoint, props.tableDataPayloadSingleQueryItemValue ?? queryParams, props.tableDataOnLoad),
        {
            onSuccess: (data) => {
                if (data.Results) {
                    //console.log('setting table data results', data)
                    setTableData(data.Results)
                } else {
                    console.warn('undefined results!!!!', data)
                }
                setData(getDataId(), data)
                if (props.authUserConfig) {
                    handleUpdateAuthUserConfig()
                }
            },
            // onError: console.error,
            enabled: !!props.tableDataEndpoint,
            onSettled: (data) => {

                /** check if it is needed to fetch for hidden results **/
                const shouldFindMoreResults =
                    queryParams.searchPhrase &&
                    ((props.tableFilterMetaData?.options.filter(x => !x.type || x.type === 'multiselect' && ((!x.inclusion || x.inclusion === 'exclusive') && queryParams[x.filterName]?.length !== 0 || x.inclusion === 'inclusive' && queryParams[x.filterName]?.length === 0)).length !== 0) ||
                        (props.tableFilterMetaData?.options.filter(x => x.type === 'switch' && ((!x.inclusion || x.inclusion === 'inclusive') && !(queryParams[x.filterName]) || x.inclusion === 'exclusive' && queryParams[x.filterName])).length !== 0))
                setHiddenResults(null)

                tableHiddenResultsQuery.isFetching && queryClient.cancelQueries({ queryKey: [props.tableName, 'tableData', 'hiddenResults'] })

                // console.log('should search for more results? ', shouldFindMoreResults ? 'YES' : 'NO')

                if (shouldFindMoreResults) {
                    setTableHiddenResultsQueryParams(
                        (p) => {
                            if (p && p.searchPhrase === queryParams.searchPhrase) {
                                // console.log('INVALIDATING')
                                tableHiddenResultsQuery.refetch()
                                // queryClient.invalidateQueries({queryKey: [props.tableName, 'tableData', 'hiddenResults']})
                            }
                            return {
                                ...(props.tableFilterMetaData && constructFilterInitialValue(props.tableFilterMetaData)),
                                ...props.tableFilterMetaData?.options.filter(x => x.type === 'switch').reduce(
                                    (a, b) => ({
                                        ...a, [b.filterName as string]: !b.inclusion || b.inclusion === 'inclusive'
                                    }), {}
                                ),
                                pageSize: queryParams.pageSize,
                                // pageIndex: 0,
                                searchPhrase: queryParams.searchPhrase
                            }
                        }
                    )
                } else {
                    setTableHiddenResultsQueryParams(null)
                }

                /** check if we need to fetch total count for custom no visible items message **/
                const shouldCheckTotalItems = props.noVisibleItemsMessage && data?.TotalResults === 0

                tableTotalItemsQuery.isFetching && queryClient.cancelQueries({ queryKey: [props.tableName, 'tableData', 'totalItems'] })

                if (shouldCheckTotalItems) {
                    // Create params with all items visible (set switches to include everything)
                    const relaxedParams = {
                        ...(props.tableFilterMetaData && constructFilterInitialValue(props.tableFilterMetaData)),
                        ...props.tableFilterMetaData?.options.filter(x => x.type === 'switch').reduce(
                            (a, b) => ({
                                ...a, [b.filterName as string]: !b.inclusion || b.inclusion === 'inclusive'
                            }), {}
                        ),
                        pageSize: 1, // We only need the count, not the actual data
                        pageIndex: 0,
                        searchPhrase: '' // Clear search to see if ANY items exist
                    }
                    setCheckTotalItemsQueryParams(relaxedParams)
                } else {
                    // Just cancel the query - keep totalItemsExist value since it's only used when TotalResults === 0
                    setCheckTotalItemsQueryParams(null)
                }
                // }
            },
            keepPreviousData: true,
            refetchOnWindowFocus: false,
            refetchOnReconnect: false,
            refetchOnMount: false,
            retryDelay: 5000,
            retry: 3,
            staleTime: 0,
            /*placeholderData: () => {
                const data = getData[getDataId()]
                return data ?? null
            }*/
        })

    const [tableHiddenResultsQueryParams, setTableHiddenResultsQueryParams] = useState<any>(
        null
    )

    const tableHiddenResultsQuery = useQuery(
        [props.tableName, 'tableData', 'hiddenResults', tableHiddenResultsQueryParams],
        () => fetchTableData(props.tableDataEndpoint, tableHiddenResultsQueryParams, props.tableDataOnLoad),
        {
            enabled: !!tableHiddenResultsQueryParams && !!queryParams.searchPhrase,
            staleTime: 0,
            onSettled: (data) => {
                // console.log('ADDITIONAL RESULTS', data.TotalResults)
                setHiddenResults(
                    +data?.TotalResults && data.TotalResults !== tableDataQuery.data.TotalResults ? {
                        diff: data.TotalResults - tableDataQuery.data.TotalResults,
                        data: data.Results,
                        params: { ...queryParams }
                    } : null
                )
                // handleUpdateAuthUserConfig()
            }/*,
            onSettled: (data) => {
                console.log('table hidden results', data)
                setHiddenResults(
                    +data?.TotalResults && data.TotalResults !== tableDataQuery.data.TotalResults ? {
                        diff: data.TotalResults - tableDataQuery.data.TotalResults,
                        data: data.Results,
                        params: {...queryParams}
                    } : null
                )
                // handleUpdateAuthUserConfig()
            }*/
        })

    const tableTotalItemsQuery = useQuery(
        [props.tableName, 'tableData', 'totalItems', checkTotalItemsQueryParams],
        () => fetchTableData(props.tableDataEndpoint, checkTotalItemsQueryParams, props.tableDataOnLoad),
        {
            enabled: !!checkTotalItemsQueryParams && !!props.noVisibleItemsMessage,
            staleTime: 0,
            onSettled: (data) => {
                setTotalItemsExist(data?.TotalResults > 0)
            }
        })

    useEffect(() => {
        // console.log('refetching')
        if (tableDataQuery.isSuccess && !tableDataQuery.isFetching) {
            console.log('refetching')
            tableDataQuery.refetch()
        }
    }, [props.forceDataRefreshFlipFlop]);

    const cancelActiveDataQuery = () => {
        queryClient.cancelQueries({ queryKey: [props.tableName, 'tableData'] })
    }

    const [authUserConfigMetaData, setAuthUserConfigMetaData] = useState()
    // executes auth user config mutation when authConfig is set
    const [authConfig, setAuthConfig] = useDebouncedState<any>({}, 750)
    useEffect(() => {
        if (props.authUserConfig && Object.keys(authConfig).length > 0 && !authUserConfigQuery.isFetching) {
            if (authConfig.MetaData !== authUserConfigMetaData) {
                setAuthUserConfigMetaData(authConfig.MetaData)
                userConfigMutation.mutate(authConfig)
            }
        }
    }, [authConfig])

    const handleUpdateAuthUserConfig = useCallback(
        () => {
            const authUserMetadata = buildLegacyAncillaryAndActiveFilterMetaData(queryParams)
            const authUserData = {
                ...authUserConfigQuery.data,
                MetaData: JSON.stringify(authUserMetadata)
            }
            setAuthConfig(authUserData)
        }, [queryParams]
    )

    const handleFilterChange = (val, put?) => {
        cancelActiveDataQuery()
        setTableState((prev) => ({
            ...(!put && prev ? prev : { ...(props.tableFilterMetaData && constructFilterInitialValue(props.tableFilterMetaData)) }),
            ...val,
            searchPhrase: prev.searchPhrase,
            SortDirection: prev.SortDirection,
            SortExpression: prev.SortExpression,
            pageIndex: 0,
            pageSize: prev.pageSize
        }))
    }

    const handleSearchChange = useCallback(
        (searchPhrase: string) => {
            setSearchPhrase(searchPhrase)
            cancelActiveDataQuery()
        }, []
    )

    const handlePaginationChange = useCallback(
        (pageProps: PageProps) => {
            cancelActiveDataQuery()
            setTableState(p => ({ ...p, ...pageProps }))
            setQueryParams(p => ({ ...p, ...pageProps }))
            cancelDebouncedTableState()
        }, []
    )

    const handleColumnMappingChange = useCallback(
        (newColumnMapping: ColumnMappingData[]) => {
            setColumnMapping(newColumnMapping)
            setColumnMappingModified(true)
        }, []
    )

    const handleTableSort = useCallback(
        (newSortValue: SortProps) => setTableState(p => ({ ...p, ...newSortValue })), []
    )


    // protect tablesState sort expression when item column mapping becomes unSortable
    useEffect(() => {
        if (tableState.SortExpression) {
            if (columnMapping.find(x => x.ColumnName === tableState.SortExpression)?.Sortable === false) {
                setTableState(p => ({ ...p, SortExpression: '', SortDirection: '' }))
            }
        }
    }, [tableState.SortExpression, columnMapping]);

    const handleRevealAllResults = useCallback(() => {
        // clear all filters and set include switches to true if needed
        const params = {
            searchPhrase: queryParams.searchPhrase,
            pageIndex: 0,
            pageSize: queryParams.pageSize,
        }
        const switches = props.tableFilterMetaData?.options.filter(x => x.type === 'switch') as ScFilterOptionSwitchProps[] || []
        switches.forEach((x) => {
            const switchName = x.filterName
            params[switchName] = !x.inclusion || x.inclusion === 'inclusive'
            // below only sets switch values for differences detected in results
            /*if(!queryParams[switchName]) {
                if(!x.dataValueKey || hiddenResults?.data?.filter(y => y[x.dataValueKey as string]).length !== 0) {
                    params[switchName] = true
                }
            } else {
                params[switchName] = queryParams[switchName]
            }*/
        })
        handleFilterChange(params, true)
        setFilterForcedState(params as any)
        props.tableFilterMetaData && setFilterForcedState({ ...constructFilterInitialValue(props.tableFilterMetaData, params as any) })
        setHiddenResults(null)
        setTableHiddenResultsQueryParams(null)
    }, [queryParams, hiddenResults])

    const noResultsClearMiniSection = useMemo(
        () => hiddenResults && <>
            <Anchor
                my={0}
                py={0}
                // size={13}
                onClick={handleRevealAllResults}
                component={'span'}
                color={'scBlue'}
            >
                Show {hiddenResults.diff} filtered result{hiddenResults.diff === 1 ? '' : 's'}
            </Anchor>
        </>, [hiddenResults, handleRevealAllResults]
    )

    const multiSelectDateNoResultsStatement = useMemo(() => {
        if (tableDataQuery.data?.Results && tableDataQuery.data.Results.length === 0) {

            // date: get all from and to dates to display them in groups - there may be multiple date-ranges in the filter config
            const froms: string[] = []
            const tos: string[] = []
            queryParams && props.tableFilterMetaData?.options?.forEach(x => {
                if (x.type === 'dateRange') {
                    queryParams?.[x.filterName[0]] && froms.push(queryParams?.[x.filterName[0]].split('T')[0])
                    queryParams?.[x.filterName[1]] && tos.push(queryParams?.[x.filterName[1]].split('T')[0])
                }
            })
            const dateExpression = froms.length !== 0 ? (' ranging from ' + froms.join(', ')) + ((tos.length !== 0 && ' to ' + tos.join(', ')) || '') : ''
            // multiselect
            const multiselectItems = (
                queryParams && props.tableFilterMetaData?.options?.filter(x => {
                    return (typeof x.type === 'undefined' || x.type === 'multiselect') && queryParams?.[x.filterName]?.length !== 0
                })
                    .map(
                        (x) => x.label
                    )
            ) || []
            let multiselectNoResults = ''
            multiselectItems.forEach((x, i) => {
                multiselectNoResults += i === 0 ? x :
                    i === multiselectItems.length - 1 ? ((multiselectItems.length === 2 ? '' : ',') + ' and ' + x + (froms.length !== 0 ? ', ' : '')) : (', ' + x)
            })

            const tabFilter = props.tableFilterMetaData?.options && props.tableFilterMetaData.options.find(x => x.type === 'tabs') as ScFilterOptionTabsProps
            let tabFilterLabel = ''
            if (tabFilter && queryParams[tabFilter.filterName].length !== 0) {
                tabFilterLabel = Object.entries(tabFilter.tabs).reduce((a, [k, v]) => (
                    v.value === queryParams[tabFilter.filterName][0] ? v.altLabel || v.label : a
                ), '')
            }

            return (tabFilterLabel ? `No ${props.tableAltMultipleNoun ?? props.tableNoun + 's'} ${tabFilterLabel} ` : 'No results') +
                (queryParams?.searchPhrase && (' for ' + '"' + queryParams?.searchPhrase + '"')) +
                (multiselectNoResults && ((queryParams?.searchPhrase ? ' and ' : ' for ') + ' selected ' + multiselectNoResults)) +
                (dateExpression)
        }
    }, [queryParams, tableDataQuery.data?.Results])


    const noResultsSection = useMemo(
        () => {
            // get only search and multiselect and daterange filters to know if none created zero state should be shown
            const activeFilters: string[] = []
            queryParams.searchPhrase && activeFilters.push(queryParams.searchPhrase)
            activeFilters.push(...(props.tableFilterMetaData?.options.reduce((a: string[], b) => (
                ((b.type === 'multiselect' || !b.type) && queryParams[b.filterName] && queryParams[b.filterName].length !== 0) ? [...a, b.filterName] :
                    (b.type === 'dateRange' && queryParams[b.filterName[0]]) ? [...a, b.filterName[0]] :
                        [...a]
            ), []) || []))

            const tabFilter = props.tableFilterMetaData?.options && props.tableFilterMetaData.options.find(x => x.type === 'tabs') as ScFilterOptionTabsProps
            let tabFilterLabel = ''
            if (tabFilter && queryParams[tabFilter.filterName] && queryParams[tabFilter.filterName].length !== 0) {
                tabFilterLabel = Object.entries(tabFilter.tabs).reduce((a, [k, v]) => (
                    v.value === queryParams[tabFilter.filterName][0] ? v.altLabel || v.label : a
                ), '')
            }

            if (activeFilters.length === 0) {
                // If a custom message is provided and there are items in the system (just not visible), use it
                if (props.noVisibleItemsMessage && totalItemsExist === true) {
                    return <>
                        <Text size={'xl'} c={'gray.9'}>{props.noVisibleItemsMessage}</Text>
                        <Text size={'lg'} c={'gray.7'}>
                            {props.noVisibleItemsSecondaryMessage ?? `Your ${props.tableAltMultipleNoun ?? props.tableNoun + 's'} will appear here as table rows.`}
                        </Text>
                        {props.noVisibleItemsAction && <Box mt={'md'}>{props.noVisibleItemsAction}</Box>}
                    </>
                }
                // If we're still checking if items exist, don't show anything yet to prevent flashing
                if (props.noVisibleItemsMessage && totalItemsExist === null && tableTotalItemsQuery.isFetching) {
                    return null
                }
                // Otherwise show the default "No items created yet" message
                return <>
                    <Text size={'xl'} c={'gray.9'}>No {props.tableAltMultipleNoun ?? props.tableNoun + 's'} {tabFilterLabel === '' && 'Created Yet' || tabFilterLabel}</Text>
                    <Text size={'lg'} c={'gray.7'}> {props.noItemsSecondaryMessage ?? `Your ${props.tableAltMultipleNoun ?? props.tableNoun + 's'} will appear here as table rows.`}
                    </Text>
                    {props.noItemsAction && <Box mt={'md'}>{props.noItemsAction}</Box>}
                </>
            } else {
                // console.log('more results', moreResultsData)
                return hiddenResults && <>
                    <Text mt={'md'} size={'xl'} c={'gray.9'}>{multiSelectDateNoResultsStatement}</Text>
                    <div>
                        {hiddenResults.diff} result{hiddenResults.diff === 1 ? '' : 's'} hidden by filter. &nbsp;
                        <Anchor
                            onClick={handleRevealAllResults}
                            component={'span'}
                            color={'scBlue'}
                        >
                            Show All Results
                        </Anchor>
                    </div>
                </> || <Text mt={'md'} c={'gray.9'} size={'xl'}>{multiSelectDateNoResultsStatement}</Text>
            }

        }, [queryParams, hiddenResults, multiSelectDateNoResultsStatement, totalItemsExist, tableTotalItemsQuery.isFetching, props.noVisibleItemsMessage, props.noVisibleItemsSecondaryMessage, props.noVisibleItemsAction, props.noItemsSecondaryMessage, props.noItemsAction, props.tableAltMultipleNoun, props.tableNoun]
    )


    const onClearFilters = useCallback(() => {
        if (props.tableFilterMetaData) {
            const newFilterVals = props.tableFilterMetaData.options.reduce((prev, option) => {
                if (option.type === 'dateRange' || option.type === 'priceRange') {
                    return {
                        ...prev,
                        [option.filterName[0]]: null,
                        [option.filterName[1]]: null
                    }
                } else if (option.type === "hidden") {
                    return {
                        ...prev,
                        [option.filterName]: option.defaultValue
                    }
                } else {
                    return {
                        ...prev,
                        [option.filterName]: !option.type || option.type === 'multiselect' ? [] : option.type === 'tabs' ? tableState[option.filterName] || [] : option.type === 'switch' ? false : '',
                    };
                }
            }, {})

            handleFilterChange(
                newFilterVals,
                true
            )
            setFilterForcedState({ ...constructFilterInitialValue(props.tableFilterMetaData, newFilterVals as any) })
        }

    }, [tableState])

    // Handle show all items trigger (e.g., from "View all Jobs" button)
    useEffect(() => {
        if (props.showAllItemsTrigger && props.showAllItemsTrigger > 0) {
            // Set all switch filters to inclusive (show everything)
            const params = {
                searchPhrase: queryParams.searchPhrase,
                pageIndex: 0,
                pageSize: queryParams.pageSize,
            }
            const switches = props.tableFilterMetaData?.options.filter(x => x.type === 'switch') as ScFilterOptionSwitchProps[] || []
            switches.forEach((x) => {
                const switchName = x.filterName
                params[switchName] = !x.inclusion || x.inclusion === 'inclusive'
            })
            handleFilterChange(params, true)
            setFilterForcedState(params as any)
            props.tableFilterMetaData && setFilterForcedState({ ...constructFilterInitialValue(props.tableFilterMetaData, params as any) })
        }
    }, [props.showAllItemsTrigger])

    const windowSize = useWindowSize()
    const debouncedShowFilter = useDebouncedValue(showFilter, 0)
    const filterSectionRef = useRef<HTMLDivElement>(null)
    const filterHeight = useMemo(() => filterSectionRef.current?.offsetHeight || 100, [tableState, windowSize.width, debouncedShowFilter])
    const filterWidth = useMemo(() => filterSectionRef.current?.offsetWidth || 100, [tableState, windowSize.width, debouncedShowFilter])

    const filterIconMode = useMemo(() => !!filterSectionRef.current && filterWidth < 750, [filterWidth])
    useEffect(() => {
        if (filterIconMode && showFilter && getActiveFilterLength() === 0) {
            setShowFilter(false)
        } else {
            setShowFilter(true)
        }
    }, [filterIconMode]);

    const tabFilter = useMemo(() => props.tableFilterMetaData?.options.find(x => x.type === 'tabs') as ScFilterOptionTabsProps || null, [])

    useEffect(() => {
        if (!tableDataQuery.isFetching && !tableDataQuery.isError && !tableDataQuery.data) {
            console.warn('query has ended without data being set!', tableDataQuery, '...commencing data refetch to attempt to handle...')
            tableDataQuery.refetch()
        }
    }, [tableDataQuery.isFetching]);

    const [viewMode, setViewMode] = useState(props.cardMapping ? 'card' : 'list')

    const filterSection = !props.removeFilter && (
        <>
            <Box mb={5}
                ref={filterSectionRef}
            >

                {
                    tabFilter &&
                    <ScTabFilter
                        tableName={props.tableName}
                        {...tabFilter}
                        onChange={(val) => handleFilterChange({
                            [tabFilter.filterName]: val
                        })}
                        initialValues={tableState}
                        forceRefetchDepVal={props.forceDataRefreshFlipFlop}
                    />
                }

                {
                    <Flex wrap={'wrap'} w={'100%'} align={'center'} gap={8}>

                        <TextInput
                            w={`calc(100% - 600px)`}
                            miw={{ base: '100%', xs: filterIconMode ? '150px' : '250px', sm: filterIconMode ? '200px' : '250px', md: 250 }}
                            maw={400}
                            // maw={'calc(100% - 50%)'}
                            mt={0}
                            onChange={(event) =>
                                handleSearchChange(event.currentTarget.value)
                            }
                            ref={searchInputRef}
                            // value={searchPhrase}
                            defaultValue={searchPhrase}
                            leftSection={<IconSearch size={iconSize} />}
                            placeholder={'Search'}
                            variant={'filled'}
                            rightSection={searchInputRef.current?.value && <CloseButton onClick={() => {
                                handleSearchChange('')
                                if (searchInputRef.current) {
                                    searchInputRef.current.value = ''
                                }
                            }} />}
                        />

                        {
                            props.tableFilterMetaData?.options &&
                            <Button
                                leftSection={!filterIconMode && <IconFilter fill={showFilter ? 'grey' : 'transparent'} size={iconSize} />}
                                rightSection={
                                    <>
                                        {filterLength !== 0 && <Tooltip events={{ hover: true, focus: true, touch: true }} label={'Clear Filter'} color={'scBlue'}>
                                            <ActionIcon
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    onClearFilters()
                                                }}
                                                variant={'transparent'}
                                                color={'gray'}
                                            >
                                                <IconX size={14} />
                                            </ActionIcon>
                                        </Tooltip>}
                                    </>
                                }
                                variant={'subtle'}
                                color={'gray'}
                                bg={showFilter && 'gray.1' || ''}
                                miw={'auto'}
                                px={filterIconMode ? 0 : ''}
                                onClick={handleToggleFilter}
                            >
                                {
                                    !filterIconMode ? 'Filter' : <Flex w={25} pl={8} justify={'center'}><IconFilter fill={showFilter ? 'grey' : 'transparent'} size={iconSize} /></Flex>
                                }
                                {!!filterLength && ' (' + filterLength + ')'}
                            </Button>
                        }
                        { columnMapping.length > 0 &&
                            <Button
                                leftSection={!filterIconMode && <IconLayoutColumns size={iconSize} />}
                                variant={'subtle'}
                                color={'gray'}
                                bg={showColumns && 'gray.1' || ''}
                                miw={'auto'}
                                px={filterIconMode ? 0 : ''}
                                onClick={() => setShowColumns((x) => !x)}
                            >
                                {
                                    !filterIconMode ? 'Columns' :
                                        <Flex w={30} justify={'center'}><IconLayoutColumns size={iconSize} /></Flex>
                                }

                            </Button>
                        }
                        {
                            (props.tableFilterMetaData?.showIncludeDisabledOptionsToggle || props.selectMode === 'bulk') &&
                            <Menu width={200} shadow="md" position={'right-end'}
                                trigger={'click'} closeOnItemClick={false}
                            >
                                <Menu.Target>
                                    <ActionIcon size={'md'} ml={-7} variant={'transparent'} color={'gray'}>
                                        <IconDotsVertical size={'1.2rem'} />
                                    </ActionIcon>
                                </Menu.Target>

                                <Menu.Dropdown>
                                    {
                                        props.selectMode === 'bulk' &&
                                        <>
                                            <Menu.Label>Bulk Operations</Menu.Label>
                                            <Menu.Item>
                                                <Checkbox color={'scBlue'} defaultChecked={useBulkOps} onChange={handleUseBulkOpsChange} label={'Enable Table Item Selection'} />
                                            </Menu.Item>
                                            <Menu.Divider hidden={!props.tableFilterMetaData?.showIncludeDisabledOptionsToggle} />
                                        </>
                                    }
                                    {
                                        props.tableFilterMetaData?.showIncludeDisabledOptionsToggle &&
                                        <>
                                            <Menu.Label>Filter Options</Menu.Label>
                                            <Menu.Item>
                                                <Checkbox defaultChecked={showDisabledFilters} onChange={() => setShowDisabledFilters(x => !x)} color={'scBlue'} label={'Show Disabled Filter Menu Items'} />
                                            </Menu.Item>
                                        </>
                                    }
                                </Menu.Dropdown>
                            </Menu>
                        }

                        {noResultsClearMiniSection}

                        {/* {
                            props.cardMapping &&
                            <SegmentedControl
                                mr={'1rem'}
                                value={viewMode}
                                onChange={setViewMode}
                                data={[
                                    { label: <Flex align={'center'} gap={3}><IconLayoutList size={14} /> List</Flex>, value: 'list' },
                                    { label: <Flex align={'center'} gap={3}><IconLayoutGrid size={14} /> Cards</Flex>, value: 'card' },
                                    { label: <Flex align={'center'} gap={3}><IconMap2 size={14} /> Map</Flex>, value: 'map' },
                                ]}
                            />
                        } */}
                        {
                            (props.children) &&
                            <Group ml={'auto'}>
                                {/*additional children buttons managed within jobs is placed here*/}
                                {props.children}
                            </Group>
                        }
                    </Flex>
                }

                {
                    props.tableFilterMetaData && showFilter &&
                    <Box>
                        <ScDataFilter
                            initialValues={filterForcedState}
                            onChange={handleFilterChange}
                            optionConfig={props.tableFilterMetaData}
                            tableName={props.tableName}
                            showDisabledFilterOptions={showDisabledFilters}
                            additionalHintSection={noResultsClearMiniSection}
                            module={props.module}
                        />
                    </Box>
                }
            </Box>
        </>
    )

    return (
        <>

            <Drawer
                title={colTitle}
                opened={showColumns}
                onClose={() => setShowColumns(false)}
                size={'md'}
                position={'right'}
            >
                <ScActiveColumns columnMapping={columnMapping} onChange={handleColumnMappingChange} />
            </Drawer>

            <Box>

                {filterSection}

                <Box pos={'relative'}>
                    {
                        viewMode === 'card' ?
                            <ScTableDataCards
                                selectMode={useBulkOps ? 'bulk' : 'none'}
                                tableData={tableDataQuery?.data?.Results}
                                columnMapping={columnMapping}
                                height={`calc(100vh - ${240 + constants.chatWidgetSafeArea}px - ${props.removeFilter ? '-10px' : (filterHeight + 'px')}${(messageBarContext?.isActive ? ` - ${constants.messageBarMargin}px` : "")})`}
                                mih={172 - (messageBarContext.isActive ? constants.messageBarMargin : 0)}
                                tableName={props.tableName}
                                onUpdateColMapping={(newColumnMappings) => handleColumnMappingChange(newColumnMappings)}
                                onSort={handleTableSort}
                                tableState={tableState}
                                actions={props.actions}
                                actionStates={props.actionStates}
                                onAction={props.onAction}
                                onSelected={props.onSelected}
                                filterConfig={props.tableFilterMetaData}
                                filterLength={filterLength}
                                tableIconPath={props.tableIconPath}
                                noResultsSection={noResultsSection}
                                tableNoun={props.tableNoun}
                                openColumnSettings={props.openColumnSettings}
                                cardMapping={props.cardMapping}
                            /> :
                            <ScTableData
                                selectMode={useBulkOps ? 'bulk' : 'none'}
                                recentlyAdded={props.recentlyAdded}
                                tableData={tableDataQuery?.data?.Results}
                                columnMapping={columnMapping}
                                height={`calc(100vh - ${240 + constants.chatWidgetSafeArea}px - ${props.removeFilter ? '-10px' : (filterHeight + 'px')}${(messageBarContext?.isActive ? ` - ${constants.messageBarMargin}px` : "")})`}
                                mih={172 - (messageBarContext.isActive ? constants.messageBarMargin : 0)}
                                tableName={props.tableName}
                                onUpdateColMapping={(newColumnMappings) => handleColumnMappingChange(newColumnMappings)}
                                onSort={handleTableSort}
                                tableState={tableState}
                                actions={props.actions}
                                actionStates={props.actionStates}
                                onAction={props.onAction}
                                onSelected={props.onSelected}
                                filterConfig={props.tableFilterMetaData}
                                filterLength={filterLength}
                                tableIconPath={props.tableIconPath}
                                noResultsSection={noResultsSection}
                                tableNoun={props.tableNoun}
                                openColumnSettings={props.openColumnSettings}
                                showControlsOnHover={props.showControlsOnHover}
                                thumbnailPropertyName={props.thumbnailPropertyName}
                                imagePropertyName={props.imagePropertyName}
                                activeItemId={props.activeItemId}
                            />
                    }

                    <LoadingOverlay
                        zIndex={1}
                        visible={tableDataQuery.isFetching || colMappingQuery.isFetching}
                        loaderProps={{
                            color: 'scBlue'
                        }}
                    />
                    {
                        tableDataQuery.isError && <Flex pos={'absolute'} gap={7} style={{ transform: 'translate(50%, 30%)' }} top={'30%'} right={'50%'} align={'center'}>
                            <IconExclamationCircle size={28} color={'var(--mantine-color-yellow-7)'} />
                            <Text c={'yellow.7'}>
                                {(tableDataQuery.error as Error)?.message || 'An error occurred while loading'}
                            </Text>
                        </Flex>
                    }
                </Box>

                {
                    !props.removePagination &&
                    <Flex align={'center'} gap={'xs'} mt={3}>

                        <Group miw={15} justify={'center'}>
                            {
                                !tableDataQuery.isInitialLoading &&
                                <ActionIcon ml={3} color={'gray.7'} variant={'transparent'} size={'sm'} onClick={() => tableDataQuery.refetch()}>
                                    <IconRefresh style={tableDataQuery.isFetching ? { transition: '2s ease-in-out' } : {}} className={tableDataQuery.isFetching ? styles.rotate : ''} />
                                </ActionIcon>
                            }
                            {/*{
                                !tableDataQuery.isInitialLoading && tableDataQuery.isLoading &&
                                <Loader size={16} color={'scBlue'}/>
                            }*/}
                        </Group>
                        <div style={{ flexGrow: 1, marginRight: props.bottomRightSpace ? 65 : 0 }}>
                            <ScPagination
                                totalElements={tableDataQuery.data?.TotalResults}
                                totalOnPage={tableDataQuery.data?.ReturnedResults}
                                currentPage={tableState.pageIndex}
                                pageSize={tableState.pageSize}
                                onChange={handlePaginationChange}
                            />
                        </div>

                    </Flex>
                }

            </Box>
        </>
    )
}

export default ScTable
