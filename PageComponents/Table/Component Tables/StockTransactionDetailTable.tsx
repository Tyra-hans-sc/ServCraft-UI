import { FC, useEffect, useMemo, useState } from "react";
import ScTable from "@/PageComponents/Table/ScTable";
import { ColumnMappingMetaData, ScTableProps } from "@/PageComponents/Table/table-model";
import { Button, Flex, Group, Menu, Tooltip, } from "@mantine/core";
import {
    IconEdit,
} from "@tabler/icons";
import * as Enums from '@/utils/enums';
import ManageInventoryWarehouseStockDrawer from "@/PageComponents/Inventory/ManageInventoryWarehouseStockDrawer";
import InventoryItemDrawer from "@/PageComponents/Inventory/InventoryItemDrawer";
import { IconAdjustments, IconEditCircle, IconFilterOff, IconFilterStar, IconLayoutSidebarRightExpand, IconTableExport, IconTruckDelivery } from "@tabler/icons-react";
import { useRouter } from "next/router";
import helper from "@/utils/helper";
import StockTransactionDetailsDrawer from "@/PageComponents/Inventory/StockTransactionDetailsDrawer";
import ManageStockTransactionDrawer from "@/PageComponents/StockTransaction/ManageStockTransactionDrawer";
import stockTransactionService from "@/services/stock-transaction/stock-transaction-service";
import useRefState from "@/hooks/useRefState";
import SCSplitButton from "@/components/sc-controls/form-controls/sc-split-button";
import permissionService from "@/services/permission/permission-service";
import { showNotification, updateNotification } from "@mantine/notifications";
import DownloadService from "@/utils/download-service";
import PS from '../../../services/permission/permission-service';
import { useMediaQuery } from "@mantine/hooks";

const filterTypesAllowed: number[] = [
    Enums.StockTransactionType.Adjustment,
    Enums.StockTransactionType.Initial,
    Enums.StockTransactionType.Return,
    Enums.StockTransactionType.Used,
    Enums.StockTransactionType.GRV,
    Enums.StockTransactionType.Transfer
];

const StockTransactionDetailTable: FC = () => {

    const router = useRouter();

    // const [selectedStockTransactionDetail, setSelectedStockTransactionDetail] = useState<any>(null);
    const [selectedStockTransaction, setSelectedStockTransaction, getSelectedStockTransactionValue] = useRefState<any>(null);

    const [grvPermission] = useState(permissionService.hasPermission(Enums.PermissionName.StockTransactionGRV));
    const [adjustmentPermission] = useState(permissionService.hasPermission(Enums.PermissionName.StockTransactionAdjustment));
    const [transferPermission] = useState(permissionService.hasPermission(Enums.PermissionName.StockTransactionTransfer));
    const [jobPermission] = useState(permissionService.hasPermission(Enums.PermissionName.Job));
    const [invoicePermission] = useState(permissionService.hasPermission(Enums.PermissionName.Invoice));
    const [purchasePermission] = useState(permissionService.hasPermission(Enums.PermissionName.PurchaseOrder));

    
    const onAction = async (action, item) => {
        let canOpen = true;
        let canGRV = true;
        let canAdj = true;
        let canTrans = true;
        if (item.StockTransactionStatus === Enums.StockTransactionStatus.Draft) {
            canGRV = grvPermission;
            canAdj = adjustmentPermission;
            canTrans = transferPermission;

            switch (item.StockTransactionType) {
                case Enums.StockTransactionType.GRV:
                    canOpen = canGRV;
                    break;
                case Enums.StockTransactionType.Adjustment:
                    canOpen = canAdj;
                    break;
                case Enums.StockTransactionType.Transfer:
                    canOpen = canTrans;
                    break;
            }
        }

        if (action === 'open' && canOpen) {
            setSelectedStockTransaction(_ => null);
            let stockTransaction = await stockTransactionService.getStockTransaction(item.StockTransactionID, null);
            setSelectedStockTransaction(_ => stockTransaction);
        }else if (action === 'openJobCard' && jobPermission) {
            if (item.JobCardID) helper.nextRouter(router.push, "/job/[id]", `/job/${item.JobCardID}`)
        } else if (action === 'openInvoice' && invoicePermission) {
            if (item.InvoiceID) helper.nextRouter(router.push, "/invoice/[id]", `/invoice/${item.InvoiceID}`)
        } else if (action === 'openPurchaseOrder' && purchasePermission) {
            if (item.PurchaseOrderID) helper.nextRouter(router.push, "/purchase/[id]", `/purchase/${item.PurchaseOrderID}`)
        } else if (action === 'openStockTransaction' && canOpen) {
            helper.nextRouter(router.push, "/stocktransaction/[id]", `/stocktransaction/${item.StockTransactionID}`)
        }

    }

    const [refreshData, setRefreshData] = useState(false)

    const stockTransactionDetailTableProps = useMemo<ScTableProps>(() => (
        {
            columnMappingModelName: "StockTransactionDetailList",
            columMappingOverrideValues: {
                StockTransactionNumber: {
                    CellType: 'link',
                    MetaData: JSON.stringify({
                        triggerAction: 'open'
                    } as ColumnMappingMetaData),
                },
                JobCardNumber: {
                    CellType: 'link',
                    MetaData: JSON.stringify({
                        triggerAction: 'openJobCard'
                    } as ColumnMappingMetaData),
                    DisplayValueFunction: (item) => item?.JobCardNumber ? <span>{item.JobCardNumber}</span> : <></>
                },
                InvoiceNumber: {
                    CellType: 'link',
                    MetaData: JSON.stringify({
                        triggerAction: 'openInvoice'
                    } as ColumnMappingMetaData),
                    DisplayValueFunction: (item) => item?.InvoiceNumber ? <span>{item.InvoiceNumber}</span> : <></>
                },
                PurchaseOrderNumber: {
                    CellType: 'link',
                    MetaData: JSON.stringify({
                        triggerAction: 'openPurchaseOrder'
                    } as ColumnMappingMetaData),
                    DisplayValueFunction: (item) => item?.PurchaseOrderNumber ? <span>{item.PurchaseOrderNumber}</span> : <></>
                }
            },
            module: Enums.Module.StockTransactionAdjustment, // this is intentional as it depends on inventory category/subcategory for the filters (server side already handles column mappings manually)
            tableDataEndpoint: '/StockTransaction/GetStockTransactionDetails',
            tableName: 'stockTransactionDetail',
            tableNoun: 'Stock Transaction Detail',
            tableAltMultipleNoun: 'Stock Transaction Details',
            tableFilterMetaData: {
                options: [
                    {
                        filterName: 'StockTransactionTypes',
                        label: 'Type',
                        hardcodedOptions: Enums.getEnumItemsVD(Enums.StockTransactionType, true, true)
                            .filter(x => filterTypesAllowed.includes(x.value))
                            .map(x => ({
                                label: x.description,
                                value: x.value
                            }))
                    },
                    {
                        filterName: 'StockTransactionStatuses',
                        label: 'Status',
                        hardcodedOptions: Enums.getEnumItemsVD(Enums.StockTransactionStatus, true, true).map(x => ({
                            label: x.description,
                            value: x.value
                        }))
                    },
                    {
                        filterName: 'WarehouseIDs',
                        dataOptionValueKey: 'ID',
                        dataOptionLabelKey: ['Code'],
                        queryPath: '/Warehouse/GetUserWarehouses',
                        label: 'Warehouse'
                    },
                    {
                        type: 'dateRange',
                        label: 'Date',
                        filterName: ['StartDate', 'EndDate'],
                    },
                ]
            },
            actions: [
                {
                    type: 'default',
                    name: 'openStockTransaction',
                    icon: <IconEditCircle />,
                    label: 'Open Stock Transaction',
                    default: true
                }
            ],
            bottomRightSpace: true,
            selectMode: 'single',
            onAction: onAction,
        }
    ), [])

    const [exportBusyState, setExportBusyState] = useState(false)

    const [isMasterOfficeAdmin] = useState(PS.hasPermission(Enums.PermissionName.MasterOfficeAdmin));

    const [exportPermission] = useState(PS.hasPermission(Enums.PermissionName.Exports));

    const [queryParams, setQueryParams] = useState({})

    const handleQueryParmsChanged = (newParams) => {
        setQueryParams(newParams)
    }

    const handleFilteredExport = async () => {
        handleExport(false)
    }
    const handleFullExport = async () => {
        handleExport(true)
    }

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
            await DownloadService.downloadFile('POST', '/StockTransaction/GetExportedStockTransactionDetail', { ...queryParams, exportAll }, false, false, "", "", null, false, (() => {
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

    const buttonIconMode = useMediaQuery('(max-width: 500px)');


    return (
        <>

            <ManageStockTransactionDrawer
                stockTransaction={selectedStockTransaction}
                show={!!selectedStockTransaction}
                purchaseOrderID={selectedStockTransaction?.PurchaseOrderID}
                stockTransactionType={selectedStockTransaction?.StockTransactionType}
                onClose={((navigateToStockTransactionID) => {
                    if (navigateToStockTransactionID) {
                        stockTransactionService.getStockTransaction(navigateToStockTransactionID, null).then(st => {
                            setSelectedStockTransaction(st);
                        });
                    }
                    else {
                        setSelectedStockTransaction(null);
                    }
                }) as any}
                onSaved={() => {
                    setSelectedStockTransaction(null);
                    setRefreshData(p => !p)
                }}
                isNew={false}
                heading={selectedStockTransaction?.StockTransactionType ? `${selectedStockTransaction?.StockTransactionStatus === Enums.StockTransactionStatus.Draft ? "Edit" : "View"} ${Enums.getEnumStringValue(Enums.StockTransactionType, selectedStockTransaction?.StockTransactionType, true)}` : undefined
                }
            />

            <ScTable
                {...stockTransactionDetailTableProps}
                forceDataRefreshFlipFlop={refreshData}
                onTableQueryStateChanged={handleQueryParmsChanged}
            >
                <Group gap={5}>
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
                </Group>
             
            </ScTable>
        </>
    )
}


export default StockTransactionDetailTable
