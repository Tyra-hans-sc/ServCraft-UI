import { FC, useCallback, useMemo, useState } from "react";
import ScTable from "@/PageComponents/Table/ScTable";
import { ScTableProps } from "@/PageComponents/Table/table-model";
import * as Enums from '@/utils/enums';
import { Button, Menu, Tooltip } from "@mantine/core";
import { useRouter } from "next/router";
import { showNotification, updateNotification } from "@mantine/notifications";
import {
    IconListDetails,
    IconTableExport
} from "@tabler/icons";
import {IconFilterStar, IconLayoutSidebarRight, IconPlus} from "@tabler/icons-react";
import {useQuery, useQueryClient} from "@tanstack/react-query";
import IntegrationService from '../../../services/integration-service';
import DownloadService from "@/utils/download-service";
import UserConfigService from "@/services/option/user-config-service";
import StoreService from "@/services/store/store-service";
import Storage from "@/utils/storage";
import PS from '../../../services/permission/permission-service';
import { useMediaQuery } from "@mantine/hooks";
import QuoteDrawer from "@/PageComponents/Quote/QuoteDrawer";
import Fetch from "@/utils/Fetch";

const QuotesTable: FC = () => {

    const {data: companyDetails} = useQuery(['companyDetails'], () => Fetch.get({
        url: '/Company'
    }))

    const {data: integration} = useQuery(['integration', 'customer'], () => IntegrationService.getIntegration())

    const quoteTableProps = useMemo<ScTableProps>(() => (
        {
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
            tableName: 'quotes',
            tableNoun: 'Quote',
            tableFilterMetaData: {
                options: [
                    {
                        filterName: 'ModuleIDList',
                        label: 'Module',
                        hardcodedOptions: [
                            {
                                label: 'Customer',
                                value: 'Customer'
                            },
                            {
                                label: 'Job Card',
                                value: 'JobCard'
                            },
                            {
                                label: 'Query',
                                value: 'Query'
                            }
                        ]
                    },
                    {
                        filterName: 'EmployeeIDList',
                        dataOptionValueKey: 'ID',
                        dataOptionLabelKey: ['FullName', 'EmailAddress', 'UserName'],
                        queryPath: '/Employee/GetEmployees',
                        label: 'Employee',
                        dataOptionColorKey: 'DisplayColor',
                    },
                    {
                        filterName: 'StoreIDList',
                        dataOptionValueKey: 'ID',
                        // queryPath: '/Store/GetEmployeeStores',
                        /*queryParams: {
                            employeeId: Storage.getCookie(Enums.Cookie.employeeID)
                        },*/
                        orderByKey: 'IsDefault',
                        queryFunction: (props) => StoreService.getStores(props.search ?? '', props.showAll ?? true, Storage.getCookie(Enums.Cookie.employeeID)),
                        label: 'Store',
                        hiddenWhileLoading: true
                    },
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
                        type: 'dateRange',
                        label: 'Start/End Date',
                        filterName: ['StartDate', 'EndDate'],
                    },
                    {
                        type: 'hidden',
                        filterName: 'PopulatedList',
                        label: "Populate Quotes",
                        defaultValue: false
                    },
                    {
                        label: '',
                        type: 'tabs',
                        filterName: 'QuoteStatusIDList',
                        statusCountsEndpoint: '/Quote/GetStatusCounts',
                        tabs: {
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
                        }
                    }
                ],
                showIncludeDisabledOptionsToggle: true
            },
            selectMode: 'single'
        }
    ), [integration])

    const router = useRouter()

    const [createNew, setCreateNew] = useState(false)
    const [createNewCopyQuote, setCreateNewCopyQuote] = useState<any>(null)
    const [selectedQuote, setSelectedQuote] = useState<any>(null)

    const onAction = useCallback((name: string, item: any) => {
        if (name === 'openDrawer') {
            setSelectedQuote(item)
        } else if (name === 'open') {
            router.replace('/quote/' + item.ID)
        }
    }, [])


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

    const queryClient = useQueryClient()
    const invalidateQueries = () => {
        setRefreshToggle(p => !p)
        // extra safety top approach would be unneeded if below approach would work consistently..
        queryClient.invalidateQueries({ queryKey: [quoteTableProps.tableName, 'tableData'] })
    }

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

    /** recently added items */
    const [recentlyAdded, setRecentlyAdded] = useState<any[]>([])

    return (
        <>
            <QuoteDrawer
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
                activeItemId={selectedQuote?.ID}
            >
                {exportPermission && (
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
                            <Tooltip
                                events={{ hover: true, focus: true, touch: true }}
                                label={`Export ${quoteTableProps.tableNoun}s shown with the current filter`}
                                color={'scBlue'}
                            >
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
                {/*<Link href={'/quote/create'} onClick={() => Helper.nextLinkClicked('/quote/create')}></Link>*/}

            </ScTable>
        </>
    )
}


export default QuotesTable
