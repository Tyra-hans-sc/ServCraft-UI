import { FC, useCallback, useMemo, useState } from "react";
import ScTable from "@/PageComponents/Table/ScTable";
import { ColumnMappingMetaData, ScTableProps, TableActionStates } from "@/PageComponents/Table/table-model";
import * as Enums from '@/utils/enums';
import { Button, Group, Loader, Menu, Text, Tooltip } from "@mantine/core";
import { useRouter } from "next/router";
import { showNotification, updateNotification } from "@mantine/notifications";
import {
    IconArchive, IconArchiveOff, IconCheckbox,
    IconEdit,
    IconFilterOff, IconSquareCheck,
    IconTableExport
} from "@tabler/icons";
import { IconFilterStar, IconNewsOff, IconPlus } from "@tabler/icons-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Fetch from "@/utils/Fetch";
import { getActionId } from "@/PageComponents/Table/table-helper";
import DownloadService from "@/utils/download-service";
import UserConfigService from "@/services/option/user-config-service";
import Link from "next/link";
import Helper from "@/utils/helper";
import StoreService from "@/services/store/store-service";
import Storage from "@/utils/storage";
import PS from '../../../services/permission/permission-service';
import { useMediaQuery } from "@mantine/hooks";
import {getEnumStringValue} from "@/utils/enums";

const QueriesTable: FC<{itemId: string; customerId: string; module: number}> = (props) => {

    const queryTableProps = useMemo<ScTableProps>(() => (
        {
            authUserConfig: async () => await UserConfigService.getPageFilters(Enums.ConfigurationSection.Query, undefined),
            columnMappingModelName: 'QueryList',
            columMappingOverrideValues: {
                QueryCode: {
                    CellType: 'link',
                    MetaData: JSON.stringify({
                        href: '/query/',
                        slug: 'ID'
                    })
                },
                EmployeeFullName: {
                    MetaData: JSON.stringify({
                        displayColorKeyName: 'EmployeeDisplayColor'
                    })
                },
                IsClosed: {
                    // because the label is "Open"
                    InverseLogic: true
                },
                QueryJobs: {
                    CellType: 'statusList',
                    MetaData: JSON.stringify({
                        colourMappingValues: undefined,
                        mappingValues: undefined,
                        valueKey: 'Status',
                        display: 'JobCardNumber',
                        link: {
                            href: '/job/',
                            slug: 'ID',
                        },
                        docNumName: "Job Number",
                        displayColorKeyName: "StatusColour"
                    } as ColumnMappingMetaData)
                },
                CustomTextField1: {
                    ColumnName: 'CustomField1',
                },
                CustomTextField2: {
                    ColumnName: 'CustomField2',
                },
                CustomTextField3: {
                    ColumnName: 'CustomField3',
                },
                CustomTextField4: {
                    ColumnName: 'CustomField4',
                },
                CustomCheckbox1: {
                    ColumnName: 'CustomFilter1',
                    CellType: 'icon'
                },
                CustomCheckbox2: {
                    ColumnName: 'CustomFilter2',
                    CellType: 'icon'
                },
            },
            tableDataEndpoint: '/Query/GetQueries',
            tableName: 'queries' + props.module,
            tableNoun: 'Query',
            tableAltMultipleNoun: 'Queries',
            tableFilterMetaData: {
                options: [
                    /*{
                        filterName: 'EmployeeIDList',
                        dataOptionValueKey: 'ID',
                        dataOptionLabelKey: ['FullName', 'EmailAddress', 'UserName'],
                        queryPath: '/Employee/GetEmployees',
                        label: 'Employee',
                        dataOptionColorKey: 'DisplayColor',
                        unassignedOption: 'showUnassignedEmployees'
                    },*/
                    /*{
                        filterName: 'QueryTypeIDList',
                        dataOptionValueKey: 'ID',
                        dataOptionLabelKey: ['Description'],
                        dataOptionColorKey: 'DisplayColor',
                        queryPath: '/QueryType',
                        label: 'Type',
                        queryParams: {
                            includeDisabled: 'true'
                        },
                        unassignedOption: 'showUnassignedQueryTypes',
                        unassignedOptionMeta: {
                            label: 'Draft',
                            icon: <IconNewsOff size={14} />
                        }
                    },*/
                    /*{
                        filterName: 'PriorityList',
                        hardcodedOptions: Object.entries(Enums.QueryPriority).map(
                            ([l, v]) => ({
                                label: l,
                                value: l, // ? could be either label or enum value - using label for now
                                color: Enums.QueryPriorityColor[l]
                            })
                        )/!*.sort((a, b) => a.value < b.label ? -1 : 1)*!/,
                        label: 'Priority',
                        dataOptionColorKey: 'color'
                    },*/
                    /*{
                        filterName: 'QueryStatusIDList',
                        dataOptionValueKey: 'ID',
                        dataOptionLabelKey: ['Description'],
                        dataOptionColorKey: 'DisplayColor',
                        dataOptionGroupingKey: 'QueryTypeDescription',
                        dataOptionSiblingFilterName: 'QueryTypeIDList',
                        dataOptionSiblingKey: 'QueryTypeID',
                        queryPath: '/QueryStatus',
                        label: 'Status',
                        queryParams: {
                            includeDisabled: 'true',
                            QueryTypeID: 'null'
                        },
                        type: 'multiselect'
                    },*/
                    /*{
                        filterName: 'StoreIDList',
                        dataOptionValueKey: 'ID',
                        orderByKey: 'IsDefault',
                        queryFunction: (props) => StoreService.getStores(props.search ?? '', props.showAll ?? true, Storage.getCookie(Enums.Cookie.employeeID)),
                        label: 'Store',
                        hiddenWhileLoading: true
                    },*/
                    {
                        type: 'hidden',
                        filterName: 'PopulatedList',
                        label: "Populate Invoices",
                        defaultValue: false
                    },
                    ...(props.module === Enums.Module.Customer ? [
                        {
                            label: '',
                            type: 'hidden',
                            filterName: 'CustomerIDList',
                            defaultValue: props.customerId ? [props.customerId] : []
                        },
                    ] : [
                        {
                            type: 'hidden',
                            filterName: 'ItemId',
                            label: "Item",
                            defaultValue: props.itemId
                        },
                        {
                            type: 'hidden',
                            filterName: 'ModuleIDList',
                            label: "Module",
                            defaultValue: [getEnumStringValue(Enums.Module, props.module)]
                        },
                    ] as any),
                    {
                        type: 'switch',
                        label: 'Closed Queries',
                        filterName: 'IncludeClosed',
                        // default = inclusive for switch
                        inclusion: 'inclusive',
                        dataValueKey: 'IsClosed'
                    },
                    {
                        type: 'switch',
                        label: 'Archived Queries',
                        // defaultValue: true,
                        inclusion: 'exclusive',
                        filterName: 'ShowArchived',
                        dataValueKey: 'IsArchived'
                    },
                    /*{
                        type: 'dateRange',
                        label: 'Start/End Date',
                        filterName: ['StartDate', 'EndDate'],
                    },*/
                    /*{
                        type: 'hidden',
                        filterName: 'PopulatedList',
                        label: "PopulateJobs",
                        defaultValue: false
                    },*/
                ],
                showIncludeDisabledOptionsToggle: false
            },
            actions: [
                {
                    type: 'default',
                    name: 'open',
                    icon: <IconEdit />,
                    label: 'Open Query',
                    default: true
                },
                /*{
                    type: 'default',
                    name: 'preview',
                    icon: <IconEyeEdit />,
                    label: 'Preview Query'
                },*/
                /*{
                    type: 'warning',
                    name: 'archive',
                    icon: <IconArchive />,
                    label: 'Archive Query',
                    activeLabel: 'Archiving Query',
                    conditionalShow: {
                        key: 'IsArchived',
                        equals: false
                    }
                },
                {
                    type: 'default',
                    name: 'archive',
                    icon: <IconArchiveOff />,
                    label: 'Restore Archive',
                    activeLabel: 'Restoring Query',
                    conditionalShow: {
                        key: 'IsArchived',
                        equals: true
                    }
                },
                {
                    type: 'warning',
                    name: 'close',
                    icon: <IconSquareCheck />,
                    label: 'Close Query',
                    activeLabel: 'Complete Query',
                    conditionalShow: {
                        key: 'IsClosed',
                        equals: false
                    }
                },
                {
                    type: 'default',
                    name: 'close',
                    icon: <IconCheckbox />,
                    label: 'Reopen Query',
                    activeLabel: 'Opening Query',
                    conditionalShow: {
                        key: 'IsClosed',
                        equals: true
                    }
                }*/
            ],
            bottomRightSpace: true,
            /*queryParamNames: {
                employeeID: {
                    type: 'option',
                    filterName: 'EmployeeIDList'
                },
                statusID: {
                    type: 'option',
                    filterName: 'QueryStatusIDList'
                },
                typeID: {
                    type: 'option',
                    filterName: 'QueryTypeIDList'
                },
                store: {
                    type: 'option',
                    filterName: 'StoreIDList'
                },
                queryUnassigned: {
                    type: 'unassignedOption',
                    filterName: 'showUnassignedQueryTypes'
                },
                employeeUnassigned: {
                    type: 'unassignedOption',
                    filterName: 'showUnassignedEmployees'
                },
                archived: {
                    type: 'boolean',
                    filterName: 'ShowArchived'
                },
                closed: {
                    type: 'boolean',
                    filterName: 'IncludeClosed'
                }
            },*/
            selectMode: 'none',
            bypassGlobalState: true,
        }
    ), [])

    const router = useRouter()
    const queryClient = useQueryClient()

    const [actionStates, setActionStates] =
        useState<TableActionStates>({})

    const [exportBusyState, setExportBusyState] = useState(false)

    const [exportPermission] = useState(PS.hasPermission(Enums.PermissionName.Exports));

    const [queryParams, setQueryParams] = useState({})

    /*const closeQueryMutation = useMutation(
        [queryTableProps.tableName, 'closequeryitem'],
        ({ item }) => Fetch.get({
            url: `/Query/${!item.IsClosed ? 'Close' : 'Open'}?id=${item.ID}`
        } as any),
        {
            onSuccess: (data, { item, name }) => {
                updateNotification({
                    id: 'a' + name + item.QueryCode,
                    loading: false,
                    message: <Group justify={'apart'}>
                        <Text>{'Successfully ' + (item.IsClosed ? 'Reopened' : 'Closed') + ` ${queryTableProps.tableNoun} ` + item.QueryCode}</Text>
                        <Button size={'xs'} color={'scBlue'} onClick={() => undoClose(data)}>Undo</Button>
                    </Group>,
                    autoClose: true,
                    color: 'scBlue'
                })
                setActionStates(p => ({ ...p, [getActionId(name, item.ID)]: 'success' }))
            },
            onError: (error, { item, name }: any) => {
                updateNotification({
                    id: 'a' + name + item.QueryCode,
                    loading: false,
                    autoClose: true,
                    color: 'yellow.7',
                    message: 'Unable to ' + (item.IsClosed ? 'Reopen' : 'Close') + ` ${queryTableProps.tableNoun}` + item.QueryCode
                })
                setActionStates(p => ({ ...p, [getActionId(name, item.ID)]: 'error' }))
            },
            onMutate: ({ item, name }: any) => {
                showNotification({
                    id: 'a' + name + item.QueryCode,
                    loading: true,
                    autoClose: false,
                    color: 'scBlue',
                    message: (item.IsClosed ? 'Reopening' : 'Closing') + ` ${queryTableProps.tableNoun} ` + item.QueryCode
                })
                setActionStates(p => ({ ...p, [getActionId(name, item.ID)]: 'loading' }))
            },
            onSettled: () => {
                invalidateQueries()
            }
        }
    )*/

    /*const undoArchive = useCallback((item: any) => {
        onAction('archive', item)
        updateNotification({
            id: 'archive-' + item.QueryCode,
            loading: true,
            autoClose: false,
            color: 'scBlue',
            message: item.IsArchived ? 'Restoring' : 'Archiving' + ` ${queryTableProps.tableNoun} ` + item.QueryCode
        })
    }, [])*/

    /*const undoClose = useCallback((item: any) => {
        onAction('close', item)
        updateNotification({
            id: 'a' + 'close' + item.QueryCode,
            loading: true,
            autoClose: false,
            color: 'scBlue',
            message: item.IsClosed ? 'Reopening' : 'Closing' + ` ${queryTableProps.tableNoun} ` + item.QueryCode
        })
    }, [])*/

    /*const archiveQueryMutation = useMutation(
        [queryTableProps.tableName, 'archivequeryitem'],
        ({ item }) => Fetch.get({
            url: '/Query/Archive?id=' + item.ID
        } as any),
        {
            onSuccess: (data, { item, name }) => {
                updateNotification({
                    id: 'archive-' + item.QueryCode,
                    loading: false,
                    message: <Group justify={'apart'}>
                        <Text>{'Successfully ' + (item.IsArchived ? 'Restored' : 'Archived') + ` ${queryTableProps.tableNoun} ` + item.QueryCode}</Text>
                        <Button size={'xs'} color={'scBlue'} onClick={() => undoArchive(data)}>Undo</Button>
                    </Group>,
                    autoClose: 8000,
                    color: 'scBlue'
                })
                setActionStates(p => ({ ...p, [getActionId(name, item.ID)]: 'success' }))
            },
            onError: (error, { item, name }: any) => {
                updateNotification({
                    id: 'archive-' + item.QueryCode,
                    loading: false,
                    message: 'Unable to ' + (item.IsArchived ? 'Restore' : 'Archive') + ` ${queryTableProps.tableNoun}`,
                    autoClose: true,
                    color: 'yellow.7'
                })
                setActionStates(p => ({ ...p, [getActionId(name, item.ID)]: 'error' }))
            },
            onMutate: ({ item, name }: any) => {
                showNotification({
                    id: 'archive-' + item.QueryCode,
                    loading: true,
                    message: item.IsArchived ? 'Restoring' : 'Archiving' + ` ${queryTableProps.tableNoun} ` + item.QueryCode,
                    autoClose: false,
                    color: 'scBlue'
                })
                setActionStates(p => ({ ...p, [getActionId(name, item.ID)]: 'loading' }))
            },
            onSettled: () => {
                invalidateQueries()
            }
        }
    )*/


    // const [shownPreviewItem, setShownPreviewItem] = useState<any | null>()

    const onAction = useCallback((name: string, item: any) => {
        if (name === 'open') {
            router.replace('/query/' + item.ID)
        } /*else if (name === 'close') {
            closeQueryMutation.mutate({ item, name })
            // queryClient.invalidateQueries({queryKey: [queryTableProps.tableName, 'tableData']})
        } else if (name === 'archive') {
            archiveQueryMutation.mutate({ item, name })
            // queryClient.invalidateQueries({queryKey: [queryTableProps.tableName, 'tableData']})
        }*/ /*else if (name === 'preview') {
            setShownPreviewItem(item)
        }*/
    }, [])


    const handleQueryParmsChanged = (newParams) => {
        setQueryParams(newParams)
    }

    const handleFilteredExport = async () => {
        handleExport(false)
    }
    const handleFullExport = async () => {
        handleExport(true)
    }

    const [refreshToggle, setRefreshToggle] = useState(false)

    /*const invalidateQueries = () => {
        setRefreshToggle(p => !p)
        // extra safety top approach would be unneeded if below approach would work consistently..
        queryClient.invalidateQueries({ queryKey: [queryTableProps.tableName, 'tableData'] })
    }*/

    const handleExport = async (exportAll: boolean) => {
        try {
            showNotification({
                id: 'downloading-export',
                loading: true,
                message: 'Preparing File',
                autoClose: false,
                color: 'scBlue'
            })
            setExportBusyState(true)
            await DownloadService.downloadFile('POST', '/Query/GetExportedQueries', { ...queryParams, exportAll }, false, false, "", "", null, false, (() => {
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

    const buttonIconMode = useMediaQuery('(max-width: 400px)');

    return (
        <>
            {/*<ScDataPreview
                config={previewDataProps}
                data={shownPreviewItem}
                onClose={() => setShownPreviewItem(null)}
                onOpen={() => onAction('open', shownPreviewItem)}
            />*/}

            <ScTable
                {...queryTableProps}
                actionStates={actionStates}
                onAction={onAction}
                onTableQueryStateChanged={handleQueryParmsChanged}
                forceDataRefreshFlipFlop={refreshToggle}
            >
                {exportPermission && props.module === Enums.Module.Customer && (
                    <Menu
                        shadow="md"
                        position={'bottom-end'}
                    // width={200}
                    >
                        <Menu.Target>
                            <Button
                                variant={'subtle'}
                                color={'gray.8'}
                                rightSection={!buttonIconMode && <IconTableExport size={15} />}
                                miw={buttonIconMode ? 'auto' : ''}
                                px={buttonIconMode ? 7 : ''}
                            >
                                {
                                    buttonIconMode ? <IconTableExport size={15} /> :
                                        'Export'
                                }
                            </Button>
                        </Menu.Target>
                        <Menu.Dropdown>
                            <Menu.Label>Export to Excel</Menu.Label>
                            <Tooltip events={{ hover: true, focus: true, touch: true }} label={'Only export items that appear in your current filter'} color={'scBlue'}>
                                <Menu.Item
                                    onClick={handleFilteredExport}
                                    leftSection={<IconFilterStar size={14} />}
                                    disabled={exportBusyState}
                                >
                                    Filtered Export
                                </Menu.Item>
                            </Tooltip>
                            <Menu.Item
                                onClick={handleFullExport}
                                leftSection={<IconFilterOff size={15} />}
                                disabled={exportBusyState}
                            >
                                Full Export
                            </Menu.Item>
                        </Menu.Dropdown>
                    </Menu>
                )}

                <Link href={`/query/create?module=${props.module}&moduleID=${props.itemId}&customerID=${props.customerId}`} onClick={() => Helper.nextLinkClicked('/query/create')}>
                    <Button color={'scBlue'} rightSection={<IconPlus size={14} />}>
                        Add {queryTableProps.tableNoun}
                    </Button>
                </Link>

            </ScTable>
        </>
    )
}


export default QueriesTable