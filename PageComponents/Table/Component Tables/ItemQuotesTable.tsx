import { FC, useCallback, useMemo, useState } from "react";
import ScTable from "@/PageComponents/Table/ScTable";
import {ScTableProps} from "@/PageComponents/Table/table-model";
import * as Enums from '@/utils/enums';
import { useRouter } from "next/router";
import {
    IconEdit, IconPlus,
} from "@tabler/icons";
import UserConfigService from "@/services/option/user-config-service";
import Link from "next/link";
import {Button, Menu, Tooltip} from "@mantine/core";
import Helper from "@/utils/helper";
import {getEnumStringValue} from "@/utils/enums";
import {showNotification, updateNotification} from "@mantine/notifications";
import DownloadService from "@/utils/download-service";
import {useMediaQuery} from "@mantine/hooks";
import {IconFilterStar, IconLayoutSidebarRightExpand, IconListDetails, IconTableExport} from "@tabler/icons-react";
import PS from '@/services/permission/permission-service';
import QuoteDrawer from "@/PageComponents/Quote/QuoteDrawer";
import {useQuery} from "@tanstack/react-query";
import Fetch from "@/utils/Fetch";

const ItemQuotesTable: FC<{itemId: string; customerId: string; module: number, onUpdated?: () => void}> = (props) => {

    const {data: companyDetails} = useQuery(['companyDetails'], () => Fetch.get({
        url: '/Company'
    }))

    const quoteTableProps = useMemo<ScTableProps>(() => (
        {
            bypassGlobalState: true,
            authUserConfig: async () => await UserConfigService.getPageFilters(Enums.ConfigurationSection.Quote, undefined),
            columnMappingModelName: 'QuoteList',
            columMappingOverrideValues: {
                EmployeeFullName: {
                    MetaData: JSON.stringify({
                        displayColorKeyName: 'EmployeeDisplayColor'
                    })
                },
                QuoteNumber: {
                    CellType: 'link',
                    MetaData: JSON.stringify({
                        href: '/quote/',
                        slug: 'ID',
                        triggerAction: 'openDrawer'
                    })
                },
                QuoteStatus: {
                    MetaData: JSON.stringify({
                        mappingValues: Enums.QuoteStatus,
                        colourMappingValues: Enums.QuoteStatusColor
                    })
                },
                QuoteToInvoiceSyncStatus: {
                    MetaData: JSON.stringify({
                        mappingValues: Enums.SyncStatus,
                        // colourMappingValues: Enums.Status
                    })
                },
                Module: {
                    MetaData: JSON.stringify({
                        mappingValues: Enums.Module,
                        // colourMappingValues: Enums.Status
                    })
                },
                IsClosed: {
                    // because the label is "Open"
                    InverseLogic: true
                }
            },
            tableDataEndpoint: '/Quote/GetQuotes',
            tableName: 'itemQuotes' + props.module,
            tableNoun: 'Quote',
            removeFilter: false,
            tableFilterMetaData: {
                options: [
                    {
                        type: 'switch',
                        label: 'Include Cancelled',
                        filterName: 'IncludeCancelled',
                        inclusion: 'inclusive',
                        dataValueKey: 'IsClosed'
                    },
                    {
                        type: 'switch',
                        label: 'Hide Expired',
                        filterName: 'HideExpired',
                        inclusion: 'exclusive',
                        dataValueKey: 'IsClosed'
                    },
                    {
                        type: 'hidden',
                        label: 'Include Closed',
                        filterName: 'IncludeClosed',
                        defaultValue: true
                    },
                    {
                        type: 'hidden',
                        filterName: 'PopulatedList',
                        label: "Populate Quotes",
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
                        label: '',
                        type: 'hidden',
                        filterName: 'QuoteStatusIDList',
                        statusCountsEndpoint: '/Quote/GetStatusCounts',
                        defaultValue: []
                        /*tabs: {
                            all: {
                                label: 'All',
                                enumVal: Enums.QuoteStatus.None,
                                value: [],
                                access: true
                            },
                            drafts: {
                                label: 'Drafts',
                                altLabel: 'Drafted',
                                enumVal: Enums.QuoteStatus.Draft,
                                value: ['Draft'],
                                access: true
                            },
                            approved: {
                                label: 'Awaiting Acceptance',
                                enumVal: Enums.QuoteStatus.Approved,
                                value: ['Approved'],
                                access: true
                            },
                            accepted: {
                                label: 'Accepted',
                                enumVal: Enums.QuoteStatus.Accepted,
                                value: ['Accepted'],
                                access: true
                            },
                            declined: {
                                label: 'Declined',
                                enumVal: Enums.QuoteStatus.Declined,
                                value: ['Declined'],
                                access: true
                            },
                            invoiced: {
                                label: 'Invoiced',
                                enumVal: Enums.QuoteStatus.Invoiced,
                                value: ['Invoiced'],
                                access: true
                            }
                        }*/
                    }
                ],
                // showIncludeDisabledOptionsToggle: true
            },
            /*actions: [
                {
                    type: 'default',
                    name: 'open',
                    icon: <IconEdit />,
                    label: 'Open Quote',
                    default: true
                },
                {
                    type: 'default',
                    name: 'openDrawer',
                    icon: <IconLayoutSidebarRightExpand />,
                    label: 'Open Quote',
                    default: true
                }
            ],*/
            bottomRightSpace: true,
            selectMode: 'none'
        }
    ), [])

    const router = useRouter()

    const [createNew, setCreateNew] = useState(false)
    const [createNewCopyQuote, setCreateNewCopyQuote] = useState<any>(null)
    const [selectedQuote, setSelectedQuote] = useState(null)

    const onAction = useCallback((name: string, item: any) => {
        if (name === 'openDrawer') {
            setSelectedQuote(item)
        } else if (name === 'open') {
            router.replace('/quote/' + item.ID)
        }
    }, [])

    const [recentlyAdded, setRecentlyAdded] = useState<any[]>([])

    const [exportBusyState, setExportBusyState] = useState(false)

    const [exportPermission] = useState(PS.hasPermission(Enums.PermissionName.Exports));

    const [queryParams, setQueryParams] = useState({})


    const handleQueryParmsChanged = (newParams) => {
        setQueryParams(newParams)
    }

    const handleNormalExport = async () => {
        handleExport(false)
    }
    const handleDetailedExport = async () => {
        handleExport(true)
    }

    const [refreshToggle, setRefreshToggle] = useState(false)

    // const queryClient = useQueryClient()
    /*const invalidateQueries = () => {
        setRefreshToggle(p => !p)
        // extra safety top approach would be unneeded if below approach would work consistently..
        queryClient.invalidateQueries({ queryKey: [quoteTableProps.tableName, 'tableData'] })
    }*/

    const handleExport = async (detailed: boolean) => {
        try {
            showNotification({
                id: 'downloading-export',
                loading: true,
                message: 'Preparing File',
                autoClose: false,
                color: 'scBlue'
            })
            setExportBusyState(true)
            await DownloadService.downloadFile('POST', detailed ? '/Quote/GetExportedQuoteDetail' : '/Quote/GetExportedQuotes', { ...queryParams, exportAll: false }, false, false, "", "", null, false, (() => {
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
            <QuoteDrawer
                customerID={(!!createNewCopyQuote) ? undefined : props.customerId}
                module={(!!createNewCopyQuote) ? undefined : props.module}
                moduleID={(!!createNewCopyQuote) ? undefined : props.itemId}
                quote={selectedQuote}
                isNew={createNew}
                show={createNew || !!selectedQuote}
                onClose={
                    () => {
                        setSelectedQuote(null)
                        setCreateNew(false)
                        setCreateNewCopyQuote(null)
                    }
                }
                onSaved={(q) => {
                    setRefreshToggle(p => !p)
                    if(recentlyAdded.some(x => x.ID === q.ID)) {
                        setRecentlyAdded(recentlyAdded.map(x => x.ID === q.ID ? {...q} : x))
                    }
                    setCreateNewCopyQuote(null)
                    props.onUpdated && props.onUpdated()
                }}
                onCreated={(q, close) => {
                    /*if(q.QuoteStatus === Enums.QuoteStatus.Draft) {
                        setSelectedQuote(q)
                    }*/
                    if(!close) {
                        setSelectedQuote(q)
                    }
                    setCreateNew(false)
                    setRecentlyAdded(p => ([q, ...p]))
                    props.onUpdated && props.onUpdated()
                    setCreateNewCopyQuote(null)
                }}
                // module={Enums.Module.Quote} // external module
                accessStatus={null}
                company={companyDetails}
                copyFromQuote={createNewCopyQuote}
                onCopyToQuote={(q) => {
                    setCreateNew(true)
                    setSelectedQuote(null)
                    setCreateNewCopyQuote(q)
                }}
                onCreateNew={
                    () => {
                        setCreateNew(true)
                        setSelectedQuote(null)
                        setCreateNewCopyQuote(null)
                    }
                }
                setIsNew={setCreateNew}
            />

            <ScTable
                {...quoteTableProps}
                onAction={onAction}
                onTableQueryStateChanged={handleQueryParmsChanged}
                forceDataRefreshFlipFlop={refreshToggle}
                recentlyAdded={recentlyAdded}
            >
                {exportPermission && props.module === Enums.Module.Customer && (
                    <Menu
                        shadow="md"
                        position={'bottom-end'}
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
                            <Tooltip events={{ hover: true, focus: true, touch: true }} label={`Export ${quoteTableProps.tableNoun}s shown with the current filter`} color={'scBlue'}>
                                <Menu.Item
                                    onClick={handleNormalExport}
                                    leftSection={<IconFilterStar size={14} />}
                                    disabled={exportBusyState}
                                >
                                    Export
                                </Menu.Item>
                            </Tooltip>
                            <Tooltip events={{ hover: true, focus: true, touch: true }} label={`Export ${quoteTableProps.tableNoun}s shown with the current filter`} color={'scBlue'}>
                                <Menu.Item
                                    onClick={handleDetailedExport}
                                    leftSection={<IconListDetails size={15} />}
                                    disabled={exportBusyState}
                                >
                                    Detailed Export
                                </Menu.Item>
                            </Tooltip>
                        </Menu.Dropdown>

                    </Menu>
                )}

                <Button color={'scBlue'} rightSection={<IconPlus size={14} />}
                        onClick={() => setCreateNew(true)}
                >
                    Add {quoteTableProps.tableNoun}
                </Button>
            </ScTable>
        </>
    )
}


export default ItemQuotesTable
