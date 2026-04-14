import { FC, useContext, useEffect, useMemo, useState } from "react";
import ScTable from "@/PageComponents/Table/ScTable";
import { ColumnMappingMetaData, ScTableProps } from "@/PageComponents/Table/table-model";
import { Flex, } from "@mantine/core";
import {
    IconEdit,
} from "@tabler/icons";
import * as Enums from '@/utils/enums';
import ManageInventoryWarehouseStockDrawer from "@/PageComponents/Inventory/ManageInventoryWarehouseStockDrawer";
import InventoryItemDrawer from "@/PageComponents/Inventory/InventoryItemDrawer";
import { IconAdjustments, IconEditCircle, IconLayoutSidebarRightExpand, IconTransfer, IconTruckDelivery } from "@tabler/icons-react";
import { useRouter } from "next/router";
import helper from "@/utils/helper";
import StockTransactionDetailsDrawer from "@/PageComponents/Inventory/StockTransactionDetailsDrawer";
import ManageStockTransactionDrawer from "@/PageComponents/StockTransaction/ManageStockTransactionDrawer";
import stockTransactionService from "@/services/stock-transaction/stock-transaction-service";
import useRefState from "@/hooks/useRefState";
import SCSplitButton from "@/components/sc-controls/form-controls/sc-split-button";
import permissionService from "@/services/permission/permission-service";
import featureService from "@/services/feature/feature-service";
import constants from "@/utils/constants";
import SubscriptionContext from "@/utils/subscription-context";
import { useQuery } from "@tanstack/react-query";

const filterTypesAllowed: number[] = [
    Enums.StockTransactionType.Adjustment,
    Enums.StockTransactionType.Initial,
    Enums.StockTransactionType.Return,
    Enums.StockTransactionType.Used,
    Enums.StockTransactionType.GRV,
    Enums.StockTransactionType.Transfer,
];

type createButtonType = "Adjustment" | "GRV" | "Transfer";

const StockTransactionTable: FC = () => {

    const router = useRouter();
    const subscriptionContext = useContext(SubscriptionContext);

    // const [selectedStockTransactionDetail, setSelectedStockTransactionDetail] = useState<any>(null);
    const [selectedStockTransaction, setSelectedStockTransaction, getSelectedStockTransactionValue] = useRefState<any>(null);
    const [createStockTransactionType, setCreateStockTransactionType] = useState<number | null>(null);


    const [jobPermission] = useState(permissionService.hasPermission(Enums.PermissionName.Job));
    const [invoicePermission] = useState(permissionService.hasPermission(Enums.PermissionName.Invoice));
    const [purchasePermission] = useState(permissionService.hasPermission(Enums.PermissionName.PurchaseOrder));
    const [grvPermission] = useState(permissionService.hasPermission(Enums.PermissionName.StockTransactionGRV));
    const [adjustmentPermission] = useState(permissionService.hasPermission(Enums.PermissionName.StockTransactionAdjustment));
    const [transferPermission] = useState(permissionService.hasPermission(Enums.PermissionName.StockTransactionTransfer));
    const [isMultiStore] = useState((subscriptionContext as any).subscriptionInfo.MultiStore);

    const { data: hasPOGRV } = useQuery(['hasPOGRV'], () => featureService.hasFeature(constants.features.PO_GRV));
    const { data: hasVanStock } = useQuery(['hasVanStock'], () => featureService.hasFeature(constants.features.VAN_STOCK));

    const canShowCreateButton = (type: createButtonType) => {
        switch (type) {
            case "Adjustment":
                return adjustmentPermission;
            case "GRV":
                return grvPermission;
            case "Transfer":
                return transferPermission;
            default:
                return false;
        }
    }

    const isButtonDefault = (type: createButtonType) => {
        switch (type) {
            case "Adjustment":
                return adjustmentPermission;
            case "GRV":
                return !adjustmentPermission && grvPermission;
            case "Transfer":
                return !adjustmentPermission && !grvPermission && transferPermission;
            default:
                return false;
        }
    }

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
            setCreateStockTransactionType(null);
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

    const [refreshData, setRefreshData] = useState(false)

    const stockTransactionTableProps = useMemo<ScTableProps>(() => (
        {
            columnMappingModelName: "StockTransactionList",
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
            module: Enums.Module.StockTransactionAdjustment, // this is intentional as it depends on inventory category/subcategory for the filters (server side already handles column mappings manually)
            tableDataEndpoint: '/StockTransaction/GetStockTransactions',
            tableName: 'stockTransaction',
            tableNoun: 'Stock Transaction',
            tableAltMultipleNoun: 'Stock Transactions',
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
                        filterName: 'EmployeeIDs',
                        dataOptionValueKey: 'ID',
                        dataOptionLabelKey: ['FullName'],
                        queryPath: '/Employee/GetEmployees',
                        label: 'Employee'
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

    // const router = useRouter()
    // const onAction = useCallback((name: string, item: any) => {
    //     if (name === 'open') {
    //         router.replace('/warehouseStock/' + item.ID)
    //     }
    // }, [])

    const createStockTransaction = (stType) => {
        setCreateStockTransactionType(stType);
    };

    return (
        <>

            {/* <StockTransactionDetailsDrawer
                stockTransaction={selectedStockTransactionDetail}
                onClose={() => setSelectedStockTransactionDetail(null)}
                onSaved={() => {
                    setSelectedStockTransactionDetail(null)
                    setRefreshData(p => !p)
                }}
            /> */}

            <ManageStockTransactionDrawer
                stockTransaction={selectedStockTransaction}
                show={!!selectedStockTransaction || !!createStockTransactionType}
                purchaseOrderID={selectedStockTransaction?.PurchaseOrderID}
                stockTransactionType={selectedStockTransaction?.StockTransactionType || createStockTransactionType}
                onClose={((navigateToStockTransactionID) => {
                    setCreateStockTransactionType(null);
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
                    setCreateStockTransactionType(null);
                    setRefreshData(p => !p)
                }}
                isNew={!!createStockTransactionType}
                heading={createStockTransactionType ? `Create ${Enums.getEnumStringValue(Enums.StockTransactionType, createStockTransactionType, true)}` :
                    selectedStockTransaction?.StockTransactionType ? `${selectedStockTransaction?.StockTransactionStatus === Enums.StockTransactionStatus.Draft ? "Edit" : "View"} ${Enums.getEnumStringValue(Enums.StockTransactionType, selectedStockTransaction?.StockTransactionType, true)}` : undefined
                }
            />

            <ScTable
                {...stockTransactionTableProps}
                forceDataRefreshFlipFlop={refreshData}
            // onAction={onAction}
            >
                <Flex align={'center'} gap={'sm'}>

                    {/* <Tooltip label={`Your package allows for a maximum of ${maxCount ?? 0} warehouseStock`} color={'goldenrod'}>
                        <IconCrown size={18} color={'goldenrod'} style={{cursor: 'help'}} />
                    </Tooltip>

               */}

                    <SCSplitButton
                        disabled={!canShowCreateButton("Adjustment") && !canShowCreateButton("GRV") && !canShowCreateButton("Transfer")}
                        items={[
                            {
                                key: "Adjustment",
                                label: "Create Adjustment",
                                disabled: !canShowCreateButton("Adjustment"),
                                defaultItem: isButtonDefault("Adjustment"),
                                leftSection: <IconAdjustments size={19} />,
                                action: () => createStockTransaction(Enums.StockTransactionType.Adjustment),
                                title: !canShowCreateButton("Adjustment") ? "You do not have permission to create an adjustment" : undefined
                            },
                            {
                                key: "GRV",
                                label: "Create GRV",
                                disabled: !canShowCreateButton("GRV"),
                                defaultItem: isButtonDefault("GRV"),
                                leftSection: <IconTruckDelivery color={isButtonDefault("GRV") ? "white" : "var(--mantine-color-green-8)"} size={19} />,
                                action: () => createStockTransaction(Enums.StockTransactionType.GRV),
                                title: !canShowCreateButton("GRV") ? "You do not have permission to create a GRV" : undefined,
                                hidden: !hasPOGRV
                            },
                            {
                                key: "Transfer",
                                label: "Create Transfer",
                                disabled: !canShowCreateButton("Transfer"),
                                defaultItem: isButtonDefault("Transfer"),
                                leftSection: <IconTransfer color={isButtonDefault("Transfer") ? "white" : "var(--mantine-color-green-8)"} size={19} />,
                                action: () => createStockTransaction(Enums.StockTransactionType.Transfer),
                                title: !canShowCreateButton("Transfer") ? "You do not have permission to create a Transfer" : undefined,
                                hidden: !isMultiStore && !hasVanStock
                            }

                        ]}
                    />


                </Flex>
            </ScTable>
        </>
    )
}


export default StockTransactionTable
