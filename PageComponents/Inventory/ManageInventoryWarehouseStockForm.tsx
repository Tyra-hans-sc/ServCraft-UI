import { FC, useEffect, useMemo, useState } from "react";
import { useForm } from "@mantine/form";
import {Box, Button, Flex, Loader, Text} from "@mantine/core";
import ScNumberControl from "@/components/sc-controls/form-controls/v2/sc-number-control";
import Form from "react-bootstrap/Form";
import { useMutation } from "@tanstack/react-query";
import Fetch from "@/utils/Fetch";
import { showNotification, updateNotification } from "@mantine/notifications";
import permissionService from "@/services/permission/permission-service";
import * as Enums from '@/utils/enums';
import StockTransactionHistory from "@/PageComponents/Inventory/StockTransactionHistory";
import {useElementSize} from "@mantine/hooks";

interface WarehouseStockItem {
    CreatedBy: string;
    CreatedDate: string;
    ID: string;
    Inventory: any;
    InventoryCategory: string;
    InventoryCode: string;
    InventoryDescription: string;
    InventoryID: string;
    InventorySubcategory: string;
    IsActive: boolean;
    ModifiedBy: string;
    ModifiedDate: string;
    QuantityAvailable: number;
    QuantityFaulty: number;
    QuantityInProgress: number;
    QuantityOnHand: number;
    RowVersion: string;
    StockItemType: number;
    StockItemTypeString: string;
    Warehouse: any;
    WarehouseID: string;
    WarehouseName: string;
}

export interface WarehouseStockFormComponentProps {
    warehouseStockItem: WarehouseStockItem,
    onClose: () => void
    onSaved: () => void
}

const ManageInventoryWarehouseStockForm: FC<WarehouseStockFormComponentProps> = ({ warehouseStockItem, ...props }) => {

    const [editStockLevelsPermission] = useState(permissionService.hasPermission(Enums.PermissionName.WarehouseStockEditLevels));

    const inventoryDetails = useMemo(() => {
        return [
            {
                label: 'Warehouse',
                value: warehouseStockItem.Warehouse.Code ? warehouseStockItem.Warehouse.Code + ' ' + warehouseStockItem.Warehouse.Name : warehouseStockItem.Warehouse.Name
            },
            {
                label: 'Inventory',
                value: warehouseStockItem.InventoryCode + ' ' + warehouseStockItem.InventoryDescription
            },
        ]
    }, [warehouseStockItem])

    const form = useForm({
        initialValues: warehouseStockItem,
        validate: {
            QuantityOnHand: (x: number | '') => x === '' || isNaN(+x) ? 'Please specify quantity on hand' : null
        }
    })

    useEffect(() => {
        form.setValues(warehouseStockItem)
    }, [warehouseStockItem]);

    const stockUpdateMutation = useMutation(['stockUpdate', warehouseStockItem],
        () => Fetch.put({
            url: '/WarehouseStock',
            params: form.values,
            caller: 'inventory/stock'
        }),
        {
            onSuccess: data => {
                updateNotification({
                    id: 'stockUpdateNotification',
                    loading: false,
                    color: 'scBlue',
                    message: 'Stock quantity updated',
                    autoClose: 5000
                })
                props.onSaved()
            },
            onError: (error, variables) => {
                updateNotification({
                    id: 'stockUpdateNotification',
                    loading: false,
                    color: 'yellow.7',
                    message: 'Stock quantity could not be updated',
                    autoClose: 5000
                })
            },
            onMutate: variables => {
                showNotification({
                    id: 'stockUpdateNotification',
                    loading: true,
                    message: 'Updating stock quantity',
                    autoClose: false
                })
            }
        }
    )

    const handleSubmit = () => {
        stockUpdateMutation.mutate()
    }

    const {height, ref} = useElementSize()

    return <>
        <Box ref={ref}>
            <Flex align={'center'} justify={'center'}  direction={'column'} my={'xl'}>
                {
                    inventoryDetails.map((x, i) =>
                        <Flex
                            key={'detailItem' + i}
                            w={'100%'}
                            justify={'start'}
                            gap='sm'
                        >
                            <Text fw={"lighter"} size={'xl'}>{x.label}:</Text>
                            <Text fw={'normal'} size={'xl'}>{x.value}</Text>
                        </Flex>
                    )
                }
            </Flex>
            <Flex
                align={'center'}
                justify={'center'}
                // my={60}
                mb={-5}
                pt={13}
                pb={30}
                style={{
                    borderTop: '1px solid var(--mantine-color-gray-3)',
                    borderBottom: '1px solid var(--mantine-color-gray-3)',
                }}
            >
                <Form onSubmit={form.onSubmit(handleSubmit)}
                >
                    <ScNumberControl

                        label={'Quantity on hand'}
                        withAsterisk
                        size={'lg'}
                        {...form.getInputProps('QuantityOnHand')}
                        disabled={!editStockLevelsPermission}
                    />
                    {editStockLevelsPermission &&
                        <Button type={'submit'} size={'lg'} mt={'xl'}
                                rightSection={stockUpdateMutation.isLoading && <Loader color={'#fff'} size={18} />}
                                w={'100%'}
                        >
                            Update
                        </Button>
                    }
                </Form>
            </Flex>
        </Box>

        <Box>
            <StockTransactionHistory inventoryId={warehouseStockItem.InventoryID} warehouseId={warehouseStockItem.WarehouseID} maxHeight={`calc(100vh - ${height}px - 165px)`} />
        </Box>


    </>
}

export default ManageInventoryWarehouseStockForm
