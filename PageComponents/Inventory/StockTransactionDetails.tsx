import { FC, useEffect, useMemo, useState } from "react";
import { useForm } from "@mantine/form";
import { Button, Flex, Loader, Text, Title } from "@mantine/core";
import ScNumberControl from "@/components/sc-controls/form-controls/v2/sc-number-control";
import Form from "react-bootstrap/Form";
import { useMutation } from "@tanstack/react-query";
import Fetch from "@/utils/Fetch";
import { showNotification, updateNotification } from "@mantine/notifications";
import permissionService from "@/services/permission/permission-service";
import * as Enums from '@/utils/enums';
import { StockTransaction, StockTransactionLine } from "@/interfaces/api/models";
import time from "@/utils/time";
import stockTransactionService from "@/services/stock-transaction/stock-transaction-service";
import SimpleTable from "../SimpleTable/SimpleTable";
import { StockTransactionFormComponentProps } from "../StockTransaction/ManageStockTransactionForm";



const StockTransactionDetails: FC<StockTransactionFormComponentProps> = ({ stockTransaction, ...props }) => {

    const [localStockTransaction, setLocalStockTransaction] = useState<StockTransaction | null>(stockTransaction);

    const stockTransactionDetails = useMemo(() => {

        return [
            {
                label: 'Status',
                value: Enums.getEnumStringValue(Enums.StockTransactionStatus, localStockTransaction?.StockTransactionStatus)
            },
            {
                label: 'Date',
                value: time.toISOString(time.parseDate(localStockTransaction?.Date), false, true, false)
            },
            {
                label: 'Type',
                value: Enums.getEnumStringValue(Enums.StockTransactionType, localStockTransaction?.StockTransactionType, true)
            },
            {
                label: 'Employee',
                value: localStockTransaction?.Employee?.FullName
            },
            {
                label: 'Customer',
                value: localStockTransaction?.Customer?.CustomerName
            },
            {
                label: 'Source',
                value: localStockTransaction?.SourceWarehouse?.Name
            },
            {
                label: 'Destination',
                value: localStockTransaction?.DestinationWarehouse?.Name
            },
            {
                label: 'Job',
                value: localStockTransaction?.JobCard?.JobCardNumber
            },
            {
                label: 'Invoice',
                value: localStockTransaction?.Invoice?.InvoiceNumber
            },
            {
                label: 'Purchase Order',
                value: localStockTransaction?.PurchaseOrder?.PurchaseOrderNumber
            }
        ]
    }, [localStockTransaction])

    useEffect(() => {

        if (!stockTransaction) {
            setLocalStockTransaction(null);
        }
        else {
            stockTransactionService.getStockTransaction(stockTransaction.ID as string, undefined).then(st => {
                setLocalStockTransaction(st);
            });
        }

    }, [stockTransaction]);


    return <>
        <Flex h={'calc(100vh - 100px)'} direction={'column'} id="TESTING">
            {
                stockTransactionDetails.map((x, i) =>
                    <Flex
                        key={'detailItem' + i}
                        w={'100%'}
                        gap='sm'
                    >
                        <Text fw={"lighter"} size={'lg'}>{x.label}:</Text>
                        <Text fw={'normal'} size={'lg'}>{x.value}</Text>
                    </Flex>
                )
            }

            {/* {localStockTransaction && Array.isArray(localStockTransaction.StockTransactionLines) && JSON.stringify(localStockTransaction.StockTransactionLines)} */}


            {localStockTransaction && Array.isArray(localStockTransaction.StockTransactionLines) && <div style={{paddingBottom: "5rem"}}>

                <Title
                    my={'var(--mantine-spacing-lg)'}
                    size={'lg'}
                    fw={600}
                >
                    Lines
                </Title>

                <SimpleTable
                minHeight={"max-content"}
                    data={localStockTransaction.StockTransactionLines.sort((a, b) => (a.LineNumber as number) - (b.LineNumber as number))}
                    mapping={[
                        {
                            key: "InventoryCode",
                            label: "Code",
                            valueFunction: (item: StockTransactionLine) => item.Inventory?.Code
                        },
                        {
                            key: "InventoryDescription",
                            label: "Description",
                            valueFunction: (item: StockTransactionLine) => <div style={{maxWidth: 320}}>{item.Inventory?.Description}</div>,
                            maxColumnWidth: 320
                        },
                        {
                            key: "Quantity",
                            label: "Quantity",
                        },
                        ...(stockTransaction?.StockTransactionType === Enums.StockTransactionType.GRV ? [{
                            key: "UnitCostPrice",
                            label: "Unit Cost"
                        }] : [])
                    ]}
                    stylingProps={
                        {
                            compact: true,
                            darkerText: true,
                            rowBorders: false
                        }
                    }
                />
                </div>}

            {/*<Box>
                <StockTransactionHistory inventoryId={warehouseStockItem.InventoryID} warehouseId={warehouseStockItem.WarehouseID} maxHeight={'calc(100vh - 360px)'} />
            </Box>*/}

        </Flex>


    </>
}

export default StockTransactionDetails
