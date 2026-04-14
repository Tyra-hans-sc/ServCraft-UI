import React, { FC, useCallback, useMemo, useState } from "react";
import ScTable from "@/PageComponents/Table/ScTable";
import { ScTableProps } from "@/PageComponents/Table/table-model";
import * as Enums from '@/utils/enums';
import { Button, Menu, Tooltip } from "@mantine/core";
import { useRouter } from "next/router";
import { IconEdit } from "@tabler/icons";
import {IconFilterStar, IconListDetails, IconPlus, IconTableExport } from "@tabler/icons-react";
import UserConfigService from "@/services/option/user-config-service";
import Link from "next/link";
import Helper from "@/utils/helper";
import {getEnumStringValue} from "@/utils/enums";
import {useQuery, useQueryClient} from "@tanstack/react-query";
import { showNotification, updateNotification } from "@mantine/notifications";
import { useMediaQuery } from "@mantine/hooks";
import DownloadService from "@/utils/download-service";
import PS from '@/services/permission/permission-service';
import Image from "next/image";
import InvoiceDrawer from "@/PageComponents/Invoice/InvoiceDrawer";
import Fetch from "@/utils/Fetch";

const InvoicesTable: FC<{itemId: string; customerId: string; module: number}> = (props) => {

    const {data: companyDetails} = useQuery(['companyDetails'], () => Fetch.get({
        url: '/Company'
    }))

    const invoiceTableProps = useMemo<ScTableProps>(() => (
        {
            bypassGlobalState: true,
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
                    MetaData: JSON.stringify({
                        mappingValues: Enums.SyncStatus,
                    })
                },
                Module: {
                    MetaData: JSON.stringify({
                        mappingValues: Enums.Module,
                        // colourMappingValues: Enums.Status
                    })
                },
            },
            tableDataEndpoint: '/Invoice/GetInvoices',
            tableName: 'itemInvoices' + props.module,
            tableNoun: 'Invoice',
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
                        type: 'hidden',
                        filterName: 'InvoiceStatusIDList',
                        label: "Item",
                        defaultValue: ['Draft', 'Unpaid', 'Paid']
                    },
                    {
                        type: 'hidden',
                        label: 'Include Closed',
                        filterName: 'IncludeClosed',
                        defaultValue: true
                    },
                ],
                // showIncludeDisabledOptionsToggle: true
            },
            actions: [
                {
                    type: 'default',
                    name: 'open',
                    icon: <IconEdit />,
                    label: 'Open Invoice',
                    default: true
                }
            ],
            bottomRightSpace: true,
            selectMode: 'none'
        }
    ), [])

    const router = useRouter()

    const [recentlyAdded, setRecentlyAdded] = useState<any[]>([])

    const [createNew, setCreateNew] = useState(false)
    const [createNewCopyInvoice, setCreateNewCopyInvoice] = useState<any>(null)
    const [selectedInvoice, setSelectedInvoice] = useState(null)

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
                customerID={!!createNewCopyInvoice ? undefined : props.customerId}
                module={!!createNewCopyInvoice ? undefined : props.module}
                moduleID={!!createNewCopyInvoice ? undefined : props.itemId}
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
            >
                {exportPermission  && props.module === Enums.Module.Customer && (
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
                {/*<Link
                    href={`/invoice/create?module=${props.module}&moduleID=${props.itemId}&customerID=${props.customerId}`}
                    onClick={() => Helper.nextLinkClicked('/invoice/create')}
                >
                </Link>*/}

            </ScTable>
        </>
    )
}

export default InvoicesTable
