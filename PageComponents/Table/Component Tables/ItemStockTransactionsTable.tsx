import { FC, useCallback, useEffect, useMemo, useState } from "react";
import ScTable from "@/PageComponents/Table/ScTable";
import { ColumnMappingMetaData, ScTableProps } from "@/PageComponents/Table/table-model";
import * as Enums from '@/utils/enums';
import { useRouter } from "next/router";
import {
    IconEdit, IconPlus,
} from "@tabler/icons";
import UserConfigService from "@/services/option/user-config-service";
import Link from "next/link";
import { Button, Menu, Tooltip } from "@mantine/core";
import Helper from "@/utils/helper";
import { getEnumStringValue } from "@/utils/enums";
import { showNotification, updateNotification } from "@mantine/notifications";
import DownloadService from "@/utils/download-service";
import { useDidUpdate, useMediaQuery } from "@mantine/hooks";
import { IconFilterStar, IconListDetails, IconTableExport } from "@tabler/icons-react";
import PS from '@/services/permission/permission-service';
import StockTransactionDetailsDrawer from "@/PageComponents/Inventory/StockTransactionDetailsDrawer";
import helper from "@/utils/helper";
import ManageStockTransactionDrawer from "@/PageComponents/StockTransaction/ManageStockTransactionDrawer";
import stockTransactionService from "@/services/stock-transaction/stock-transaction-service";
import useRefState from "@/hooks/useRefState";
import permissionService from "@/services/permission/permission-service";

const ItemStockTransactionsTable: FC<{
    itemId: string
    itemModule: number
    stockTransactionType: number | null
    accessStatus: number
    appendLinkedItemIDs: boolean
    refreshListToggle: boolean
    refreshParent?: () => void
}> = (props) => {

    // const [selectedStockTransactionDetail, setSelectedStockTransactionDetail] = useState<any>(null);

    const [jobPermission] = useState(permissionService.hasPermission(Enums.PermissionName.Job));
    const [invoicePermission] = useState(permissionService.hasPermission(Enums.PermissionName.Invoice));
    const [purchasePermission] = useState(permissionService.hasPermission(Enums.PermissionName.PurchaseOrder));
    const [grvPermission] = useState(permissionService.hasPermission(Enums.PermissionName.StockTransactionGRV));
    const [adjustmentPermission] = useState(permissionService.hasPermission(Enums.PermissionName.StockTransactionAdjustment));
    const [transferPermission] = useState(permissionService.hasPermission(Enums.PermissionName.StockTransactionTransfer));
    const [purchaseReceviePermission] = useState(permissionService.hasPermission(Enums.PermissionName.PurchaseOrderReceiveStock));

    const [selectedStockTransaction, setSelectedStockTransaction, getSelectedStockTransactionValue] = useRefState<any>(null);

    const tableNoun = useMemo(
        () =>
            props.stockTransactionType ? Enums.getEnumStringValue(Enums.StockTransactionType, props.stockTransactionType, true) ||
                'Stock Transaction' : 'Stock Transaction',
        []
    )

    const stockTransactionTableProps = useMemo<ScTableProps>(() => (
        {
            bypassGlobalState: true,
            authUserConfig: async () => await UserConfigService.getPageFilters(Enums.ConfigurationSection.StockTransaction, undefined),
            columnMappingModelName: 'StockTransactionList',
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
                },
            },
            tableDataEndpoint: '/StockTransaction/GetStockTransactions',
            tableName: 'itemStockTransactions' + props.stockTransactionType,
            tableNoun: tableNoun,
            removeFilter: false,
            tableFilterMetaData: {
                options: [
                    {
                        type: 'hidden',
                        filterName: 'ItemIDs',
                        label: "ItemIDs",
                        defaultValue: [props.itemId]
                    },
                    {
                        type: 'hidden',
                        filterName: 'StockTransactionTypes',
                        label: "StockTransactionTypes",
                        defaultValue: !!props.stockTransactionType ? [props.stockTransactionType] : []
                    },
                    {
                        type: 'hidden',
                        filterName: 'AppendLinkedItemIDs',
                        label: 'AppendLinkedItemIDs',
                        defaultValue: props.appendLinkedItemIDs === true
                    }
                ],
            },
            actions: [
                {
                    type: 'default',
                    name: 'open',
                    icon: <IconEdit />,
                    label: `Open ${tableNoun}`,
                    default: true
                }
            ],
            bottomRightSpace: true,
            selectMode: 'none'
        }
    ), [])

    const router = useRouter()

    const onAction = async (action, item) => {
        let canOpen = true;
        let canGRV = true;
        let canAdj = true;
        let canTrans = true;
        if (item.StockTransactionStatus === Enums.StockTransactionStatus.Draft) {
            canGRV = grvPermission || (props.itemModule === Enums.Module.PurchaseOrder && purchaseReceviePermission);
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
            let stockTransaction = await stockTransactionService.getStockTransaction(item.ID, null);
            setSelectedStockTransaction(_ => stockTransaction);
        } else if (action === 'openJobCard' && jobPermission) {
            if (item.JobCardID) helper.nextRouter(router.push, "/job/[id]", `/job/${item.JobCardID}`)
        } else if (action === 'openInvoice' && invoicePermission) {
            if (item.InvoiceID) helper.nextRouter(router.push, "/invoice/[id]", `/invoice/${item.InvoiceID}`)
        } else if (action === 'openPurchaseOrder' && purchasePermission) {
            if (item.PurchaseOrderID) helper.nextRouter(router.push, "/purchase/[id]", `/purchase/${item.PurchaseOrderID}`)
        } else if (action === 'openStockTransaction' && canOpen) {
            helper.nextRouter(router.push, "/stocktransaction/[id]", `/stocktransaction/${item.ID}`)
        }
    }


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

    useDidUpdate(() => {
        setRefreshToggle(p => !p);
    }, [props.refreshListToggle]);

    // const queryClient = useQueryClient()
    /*const invalidateQueries = () => {
        setRefreshToggle(p => !p)
        // extra safety top approach would be unneeded if below approach would work consistently..
        queryClient.invalidateQueries({ queryKey: [stockTransactionTableProps.tableName, 'tableData'] })
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
            await DownloadService.downloadFile('POST', detailed ? '/StockTransaction/GetExportedStockTransactionDetail' : '/StockTransaction/GetExportedStockTransactions', { ...queryParams, exportAll: false }, false, false, "", "", null, false, (() => {
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
            {/* <StockTransactionDetailsDrawer
                stockTransaction={selectedStockTransactionDetail}
                onClose={() => setSelectedStockTransactionDetail(null)}
                onSaved={() => {
                    setSelectedStockTransactionDetail(null)
                    setRefreshToggle(p => !p)
                }}
            /> */}

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
                    setSelectedStockTransaction(null)
                    setRefreshToggle(p => !p)
                    props.refreshParent && props.refreshParent();
                }}
                heading={selectedStockTransaction?.StockTransactionType ? `${selectedStockTransaction?.StockTransactionStatus === Enums.StockTransactionStatus.Draft ? "Edit" : "View"} ${Enums.getEnumStringValue(Enums.StockTransactionType, selectedStockTransaction?.StockTransactionType, true)}` : undefined
                }
            />

            <ScTable
                {...stockTransactionTableProps}
                onAction={onAction}
                onTableQueryStateChanged={handleQueryParmsChanged}
                forceDataRefreshFlipFlop={refreshToggle}
            >

            </ScTable>
        </>
    )
}


export default ItemStockTransactionsTable
