import React, { FC, useCallback, useEffect, useMemo, useState } from "react";
import ScTable from "@/PageComponents/Table/ScTable";
import { ScFilterOption, ScTableProps } from "@/PageComponents/Table/table-model";
import * as Enums from '@/utils/enums';
import { Button, Menu, Text, Tooltip } from "@mantine/core";
import { useRouter } from "next/router";
import { showNotification, updateNotification } from "@mantine/notifications";
import {
    IconEdit,
    IconListDetails,
    IconTableExport
} from "@tabler/icons";
import { IconFilterStar, IconPlus } from "@tabler/icons-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import DownloadService from "@/utils/download-service";
import UserConfigService from "@/services/option/user-config-service";
import Link from "next/link";
import Helper from "@/utils/helper";
import StoreService from "@/services/store/store-service";
import Storage from "@/utils/storage";
import IntegrationService from '../../../services/integration-service';
import PS from '../../../services/permission/permission-service';
import { useMediaQuery } from "@mantine/hooks";
import featureService from "@/services/feature/feature-service";
import constants from "@/utils/constants";

const PurchasesTable: FC = () => {
    
    const {data: integration} = useQuery(['integration', 'customer'], () => IntegrationService.getIntegration())
    
    const [hasPOGRV, setHasPOGRV] = useState(false);
    const [hasStockControl, setHasStockControl] = useState(false);

    const purchaseTableProps = useMemo<ScTableProps>(() => (
        {
            authUserConfig: async () => await UserConfigService.getPageFilters(Enums.ConfigurationSection.PurchaseOrder, undefined),
            columnMappingModelName: 'PurchaseOrderList',
            columMappingOverrideValues: {
                EmployeeFullName: {
                    MetaData: JSON.stringify({
                        displayColorKeyName: 'EmployeeDisplayColor'
                    })
                },
                PurchaseOrderNumber: {
                    CellType: 'link',
                    MetaData: JSON.stringify({
                        href: '/purchase/',
                        slug: 'ID'
                    })
                },
                IsClosed: {
                    // because the label is "Open"
                    InverseLogic: true
                },
                PurchaseOrderStatus: {
                    MetaData: JSON.stringify({
                        mappingValues: Enums.PurchaseOrderStatus,
                        colourMappingValues: Enums.PurchaseOrderStatusColor
                    })
                },
                Module: {
                    MetaData: JSON.stringify({
                        mappingValues: Enums.Module,
                        // colourMappingValues: Enums.Status
                    })
                },
                PurchaseOrderSyncStatus: {
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
                PurchaseOrderSyncMessage: {
                    IsHidden: !integration
                },
            },
            tableDataEndpoint: '/PurchaseOrder/GetPurchaseOrders',
            tableName: 'purchases',
            tableNoun: 'Purchase Order',
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
                    ...(hasStockControl && hasPOGRV ? [{
                        type: 'switch',
                        label: 'Hide Fully Received',
                        filterName: 'HideFullyReceived',
                        inclusion: 'inclusive',
                        dataValueKey: 'HideFullyReceived'
                    } as ScFilterOption] : []),
                    {
                        type: 'dateRange',
                        label: 'Start/End Date',
                        filterName: ['StartDate', 'EndDate'],
                    },
                    {
                        type: 'hidden',
                        filterName: 'PopulatedList',
                        label: "Populate Purchase Orders",
                        defaultValue: false
                    },
                    {
                        label: '',
                        type: 'tabs',
                        filterName: 'PurchaseOrderStatusIDList',
                        statusCountsEndpoint: '/PurchaseOrder/GetStatusCounts',
                        tabs: {
                            all: {
                                label: 'All',
                                enumVal: Enums.PurchaseOrderStatus.None,
                                value: ['Draft', 'Approved', 'Billed'],
                                access: true
                            },
                            drafts: {
                                label: 'Drafts',
                                altLabel: 'Drafted',
                                enumVal: Enums.PurchaseOrderStatus.Draft,
                                value: ['Draft'],
                                access: true
                            },
                            approved: {
                                label: 'Approved',
                                enumVal: Enums.PurchaseOrderStatus.Approved,
                                value: ['Approved'],
                                access: true
                            },
                            billed: {
                                label: 'Billed',
                                enumVal: Enums.PurchaseOrderStatus.Billed,
                                value: ['Billed'],
                                access: true
                            }
                        }
                    }
                ],
                showIncludeDisabledOptionsToggle: true
            },
            actions: [
                {
                    type: 'default',
                    name: 'open',
                    icon: <IconEdit />,
                    label: 'Open Purchase Order',
                    default: true
                }
            ],
            bottomRightSpace: true,
            selectMode: 'single'
        }
    ), [hasStockControl, hasPOGRV, integration])

    const router = useRouter()

    const onAction = useCallback((name: string, item: any) => {
        if (name === 'open') {
            router.replace('/purchase/' + item.ID)
        }
    }, [])

    useEffect(() => {
        featureService.getFeature(constants.features.PO_GRV).then(feature => {
            setHasPOGRV(!!feature);
        });
        featureService.getFeature(constants.features.STOCK_CONTROL).then(feature => {
            setHasStockControl(!!feature);
        });
    }, []);


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
        queryClient.invalidateQueries({ queryKey: [purchaseTableProps.tableName, 'tableData'] })
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
                type === 'detailed' ? '/PurchaseOrder/GetExportedPurchaseOrderDetail' :
                    type === 'normal' ? '/PurchaseOrder/GetExportedPurchaseOrders' : ''
                , ({ ...queryParams, exportAll: false }), false, false, "", "", null, false, (() => {
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
            <ScTable
                {...purchaseTableProps}
                onAction={onAction}
                onTableQueryStateChanged={handleQueryParmsChanged}
                forceDataRefreshFlipFlop={refreshToggle}
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
                            <Tooltip events={{ hover: true, focus: true, touch: true }} label={`Export ${purchaseTableProps.tableNoun}s shown with the current filter`} color={'scBlue'}>
                                <Menu.Item
                                    onClick={() => handleExport('normal')}
                                    leftSection={<IconFilterStar size={14} />}
                                    disabled={exportBusyState}
                                >
                                    Export
                                </Menu.Item>
                            </Tooltip>
                            <Tooltip events={{ hover: true, focus: true, touch: true }} label={`Export ${purchaseTableProps.tableNoun}s shown with the current filter`} color={'scBlue'}>
                                <Menu.Item
                                    onClick={() => handleExport('detailed')}
                                    leftSection={<IconListDetails size={15} />}
                                    disabled={exportBusyState}
                                >
                                    Detailed Export
                                </Menu.Item>
                            </Tooltip>
                        </Menu.Dropdown>

                    </Menu>
                )}

                <Link href={'/purchase/create'} onClick={() => Helper.nextLinkClicked('/purchase/create')}>
                    <Button color={'scBlue'} rightSection={<IconPlus size={14} />}>
                        Add {purchaseTableProps.tableNoun}
                    </Button>
                </Link>

            </ScTable>
        </>
    )
}


export default PurchasesTable
