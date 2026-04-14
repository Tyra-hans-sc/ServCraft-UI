import React, {FC, useCallback, useEffect, useMemo, useState} from "react";
import ScTable from "@/PageComponents/Table/ScTable";
import { ScTableProps } from "@/PageComponents/Table/table-model";
import * as Enums from '@/utils/enums';
import { Button, Menu, Text, Tooltip } from "@mantine/core";
import { useRouter } from "next/router";
import { showNotification, updateNotification } from "@mantine/notifications";
import {
    IconListDetails,
    IconTableExport
} from "@tabler/icons";
import { IconFilterStar, IconPlus } from "@tabler/icons-react";
import {useQuery, useQueryClient} from "@tanstack/react-query";
import DownloadService from "@/utils/download-service";
import UserConfigService from "@/services/option/user-config-service";
import Link from "next/link";
import Helper from "@/utils/helper";
import StoreService from "@/services/store/store-service";
import Storage from "@/utils/storage";
import IntegrationService from '../../../services/integration-service';
import Image from "next/image";
import PS from '../../../services/permission/permission-service';
import { useMediaQuery } from "@mantine/hooks";
import InvoiceDrawer from "@/PageComponents/Invoice/InvoiceDrawer";
import Fetch from "@/utils/Fetch";

const InvoicesTable: FC = () => {

    const {data: companyDetails} = useQuery(['companyDetails'], () => Fetch.get({
        url: '/Company'
    }))

    const {data: integration} = useQuery(['integration', 'customer'], () => IntegrationService.getIntegration())

    const [recentlyAdded, setRecentlyAdded] = useState<any[]>([])

    const invoiceTableProps = useMemo<ScTableProps>(() => (
        {
            authUserConfig: async () => await UserConfigService.getPageFilters(Enums.ConfigurationSection.Invoice, undefined),
            columnMappingModelName: 'InvoiceList',
            columMappingOverrideValues: {
                EmployeeFullName: {
                    MetaData: JSON.stringify({
                        displayColorKeyName: 'EmployeeDisplayColor'
                    })
                },
                InvoiceNumber: {
                    CellType: 'link',
                    MetaData: JSON.stringify({
                        href: '/invoice/',
                        slug: 'ID',
                        triggerAction: 'openDrawer'
                    })
                },
                IsClosed: {
                    // because the label is "Open"
                    InverseLogic: true
                },
                InvoiceStatus: {
                    MetaData: JSON.stringify({
                        mappingValues: Enums.InvoiceStatus,
                        colourMappingValues: Enums.InvoiceStatusColor
                    })
                },
                InvoiceSyncStatus: {
                    IsHidden: !integration,
                    MetaData: JSON.stringify({
                        mappingValues: Enums.SyncStatus,
                        colourMappingValues:{
                            [Enums.SyncStatusColor.Never]: Enums.SyncStatus.Never,
                            [Enums.SyncStatusColor.Pending]: Enums.SyncStatus.Pending,
                            [Enums.SyncStatusColor.Synced]: Enums.SyncStatus.Synced,
                            [Enums.SyncStatusColor.Failed]: Enums.SyncStatus.Failed,
                            [Enums.SyncStatusColor.NotSyncable]: Enums.SyncStatus.NotSyncable,
                            [Enums.SyncStatusColor.Delete]: Enums.SyncStatus.Delete,
                            [Enums.SyncStatusColor.Deleted]: Enums.SyncStatus.Deleted,
                        }
                    })
                },
                InvoiceSyncMessage: {
                    IsHidden: !integration,
                },
                Module: {
                    MetaData: JSON.stringify({
                        mappingValues: Enums.Module,
                    })
                },
            },
            tableDataEndpoint: '/Invoice/GetInvoices',
            tableName: 'invoices',
            tableNoun: 'Invoice',
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
                        orderByKey: 'IsDefault',
                        queryFunction: (props) => StoreService.getStores(props.search ?? '', props.showAll ?? true, Storage.getCookie(Enums.Cookie.employeeID)),
                        label: 'Store',
                        hiddenWhileLoading: true
                    },
                    {
                        filterName: 'SyncStatusList',
                        hardcodedOptions: Object.entries(Enums.SyncStatus).map(
                            ([l, v]) => ({
                                label: l,
                                value: l,
                                color: Enums.SyncStatusColor[l]
                            })
                        ),
                        label: 'Accounting',
                        dataOptionColorKey: 'color',
                        hidden: !integration
                    },
                    {
                        type: 'switch',
                        label: 'Include Cancelled',
                        filterName: 'IncludeCancelled',
                        inclusion: 'inclusive',
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
                        label: "Populate Invoices",
                        defaultValue: false
                    },
                    {
                        label: '',
                        type: 'tabs',
                        filterName: 'InvoiceStatusIDList',
                        statusCountsEndpoint: '/Invoice/GetStatusCounts',
                        tabs: {
                            all: {
                                label: 'All',
                                enumVal: Enums.InvoiceStatus.None,
                                value: ['Draft', 'Unpaid', 'Paid'],
                                access: true
                            },
                            drafts: {
                                label: 'Drafts',
                                altLabel: 'Drafted',
                                enumVal: Enums.InvoiceStatus.Draft,
                                value: ['Draft'],
                                access: true
                            },
                            approved: {
                                label: 'Approved',
                                enumVal: Enums.InvoiceStatus.Unpaid,
                                value: ['Unpaid'],
                                access: true
                            },
                            accepted: {
                                label: 'Paid',
                                enumVal: Enums.InvoiceStatus.Paid,
                                value: ['Paid'],
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
    const [createNewCopyInvoice, setCreateNewCopyInvoice] = useState<any>(null)
    const [selectedInvoice, setSelectedInvoice] = useState<any>(null)

    const onAction = useCallback((name: string, item: any) => {
        if (name === 'openDrawer') {
            setSelectedInvoice(item)
        } else if (name === 'open') {
            router.replace('/invoice/' + item.ID)
        }
    }, [])


    const [exportBusyState, setExportBusyState] = useState(false)

    const [exportPermission] = useState(PS.hasPermission(Enums.PermissionName.Exports));

    const [queryParams, setQueryParams] = useState({})


    const handleQueryParmsChanged = (newParams) => {
        setQueryParams(newParams)
    }

    const [refreshToggle, setRefreshToggle] = useState(false)

    const queryClient = useQueryClient()
    const invalidateQueries = () => {
        setRefreshToggle(p => !p)
        // extra safety top approach would be unneeded if below approach would work consistently..
        queryClient.invalidateQueries({ queryKey: [invoiceTableProps.tableName, 'tableData'] })
    }

    const handleExport = async (type: 'normal' | 'detailed' | 'xero') => {
        try {
            showNotification({
                id: 'downloading-export',
                loading: true,
                message: 'Preparing File',
                autoClose: false,
                color: 'scBlue'
            })
            setExportBusyState(true)
            await DownloadService.downloadFile('POST',
                type === 'detailed' ? '/Invoice/GetExportedInvoiceDetail' :
                    type === 'normal' ? '/Invoice/GetExportedInvoices' :
                        type === 'xero' ? '/Invoice/GetExportedXeroInvoices' : ''
                , { ...queryParams, exportAll: false }, false, false, "", "", null, false, (() => {
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
            <InvoiceDrawer
                invoice={selectedInvoice}
                isNew={createNew}
                show={createNew || !!selectedInvoice}
                onClose={
                    () => {
                        setSelectedInvoice(null)
                        setCreateNew(false)
                        setCreateNewCopyInvoice(null)
                    }
                }
                onSaved={(q) => {
                    setRefreshToggle(p => !p)
                    if(recentlyAdded.some(x => x.ID === q.ID)) {
                        setRecentlyAdded(recentlyAdded.map(x => x.ID === q.ID ? {...q} : x))
                    }
                    setCreateNewCopyInvoice(null)
                }}
                onCreated={(q, close) => {
                    if(!close) {
                        setSelectedInvoice(q)
                    }
                    setCreateNew(false)
                    setRecentlyAdded(p => ([q, ...p]))
                    setCreateNewCopyInvoice(null)
                }}
                accessStatus={null}
                company={companyDetails}
                copyFromInvoice={createNewCopyInvoice}
                onCopyToInvoice={(q) => {
                    setCreateNew(true)
                    setSelectedInvoice(null)
                    setCreateNewCopyInvoice(q)
                }}
                onCreateNew={
                    () => {
                        setCreateNew(true)
                        setSelectedInvoice(null)
                        setCreateNewCopyInvoice(null)
                    }
                }
                setIsNew={setCreateNew}
            />


            <ScTable
                {...invoiceTableProps}
                onAction={onAction}
                onTableQueryStateChanged={handleQueryParmsChanged}
                forceDataRefreshFlipFlop={refreshToggle}
                recentlyAdded={recentlyAdded}
                activeItemId={selectedInvoice?.ID}
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
                            <Tooltip events={{ hover: true, focus: true, touch: true }} label={`Export ${invoiceTableProps.tableNoun}s shown with the current filter`} color={'scBlue'}>
                                <Menu.Item
                                    onClick={() => handleExport('normal')}
                                    leftSection={<IconFilterStar size={14} />}
                                    disabled={exportBusyState}
                                >
                                    Export
                                </Menu.Item>
                            </Tooltip>
                            <Tooltip events={{ hover: true, focus: true, touch: true }} label={`Export ${invoiceTableProps.tableNoun}s shown with the current filter`} color={'scBlue'}>
                                <Menu.Item
                                    onClick={() => handleExport('detailed')}
                                    leftSection={<IconListDetails size={15} />}
                                    disabled={exportBusyState}
                                >
                                    Detailed Export
                                </Menu.Item>
                            </Tooltip>
                            {/*<Tooltip label={`Export ${invoiceTableProps.tableNoun}s shown with the current filter`} color={'scBlue'}>
                        </Tooltip>*/}
                            <Menu.Item
                                onClick={() => handleExport('xero')}
                                leftSection={
                                    <Image src="/xero-logo.svg" width={15} height={15} alt="xero connect"></Image>
                                }
                                disabled={exportBusyState}
                            >
                                Xero Export
                            </Menu.Item>
                        </Menu.Dropdown>

                    </Menu>
                )}

                <Button color={'scBlue'} rightSection={<IconPlus size={14} />}
                        onClick={() => setCreateNew(true)}
                >
                    Add {invoiceTableProps.tableNoun}
                </Button>
                {/*<Link href={'/invoice/create'} onClick={() => Helper.nextLinkClicked('/invoice/create')}>

                </Link>*/}

            </ScTable>
        </>
    )
}


export default InvoicesTable
