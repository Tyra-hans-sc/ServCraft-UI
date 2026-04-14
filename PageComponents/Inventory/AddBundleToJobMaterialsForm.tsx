import React, { FC, useEffect, useState } from "react";
import * as Enums from "@/utils/enums";
import { useForm } from "@mantine/form";
import { Box, Button, Checkbox, Flex, Group, Loader, Text } from "@mantine/core";
import { useMutation, useQuery } from "@tanstack/react-query";
import Fetch from "@/utils/Fetch";
import { showNotification } from "@mantine/notifications";
import jobInventoryService from "@/services/job/job-inventory-service";
import { getDefaultSectionObject, getSectionsFromTableData } from "@/PageComponents/SectionTable/SectionTable";
import BundleSelector from "@/PageComponents/Bundle/BundleSelector";
import ScTextControl from "@/components/sc-controls/form-controls/v2/sc-text-control";
import WarehouseSelector from "@/components/selectors/warehouse/warehouse-selector";
import featureService from "@/services/feature/feature-service";
import constants from "@/utils/constants";
import helper from "@/utils/helper";
import { Warehouse } from "@/interfaces/api/models";

const postItemsUsed = async (jobInventory, sections, jobId) => {

    const response = await jobInventoryService.saveJobInventory(jobInventory, jobId,
        Enums.StockItemStatus.ItemUsed,
        undefined,
        // sections
    );

    if (!!response) {
        return response;
    }
    else {
        throw new Error('');
    }
}

const AddBundleToJobMaterialsForm: FC<{
    onSaveNewListExternally?: (newItems: any[]) => void
    // jobInventoryItem: any
    // updateJobInventoryExternally: (itemToSave: any) => void
    onJobInventoryItemsSaved: (newJobInventories: any[], newJobRowVersion: any) => void
    jobQueryData: any
    accessStatus: number
    // jobSingleItem: any
    // linkedProductIDs: any
    type: 'Job' | 'Recurring'
    // jobItemSelection: any
    // jobItemOrder: any
    filteredStockItemStatus: any
    jobInventoryList: any[]
    onClose: () => void
    fromCreateJob: boolean
    fromStatusChange: boolean
    fromSchedule?: boolean
    // tableSectionItem?: any
    storeID: string
    warehouse?: Warehouse
}> = (props, context) => {


    const [sections, setSections] = useState<any[]>([])
    const [hasStockControl, setHasStockControl] = useState<boolean | undefined>();
    const [suppressSave, setSuppressSave] = useState(false);

    const inventorySectionQuery = useQuery(['inventorySection', props.jobQueryData?.ID, Enums.Module.JobCard],
        () => {
            return getSectionsFromTableData(props.jobInventoryList, 'InventorySectionName', 'InventorySectionID', Enums.Module.JobCard, props.jobQueryData.ID)
            /*Fetch.post({
                url: '/InventorySection/GetInventorySections',
                params: {
                    Module: Enums.Module.JobCard,
                    ItemID: props.jobQueryData.ID
                }
            } as any)*/
        }, {
        enabled: !!props.jobQueryData?.ID && props.filteredStockItemStatus === Enums.StockItemStatus.ItemUsed
    }
    )

    useEffect(() => {
        if (inventorySectionQuery.data) {
            setSections(inventorySectionQuery.data)
        }
    }, [inventorySectionQuery.data])

    const saveInventoryUsedMutation = useMutation(['inventoryItemsUsed'], ({ jobInventory, sections, jobId }: any) => postItemsUsed(jobInventory, sections, jobId), {
        onSuccess: data => {
            props.onJobInventoryItemsSaved(data.sortedResults, data.rowVersion)
            showNotification({
                id: 'AddInventoryItemWorkedOn',
                message: `Inventory materials updated `,
                color: 'scBlue',
            });
            props.onClose()
        },
        onError: (error: any) => {
            showNotification({
                id: 'AddInventoryItemNotification',
                message: error?.message || `Inventory items could not be added `,
                color: 'red',
            });
        }
    });

    const form = useForm({
        initialValues: {
            bundle: '',
            section: true,
            sectionName: '',
            warehouse: null
        },
        validate: {
            bundle: x => !!x ? null : 'Please select a bundle to add'
        }
    })

    const [inventoryItems, setInventoryItems] = useState<any[]>([])

    const inventoryItemsQuery = useQuery(['bundleInventoryItems', form.values.bundle],
        () => Fetch.get({
            url: '/Bundle',
            params: {
                id: form.values.bundle
            }
        } as any),
        {
            enabled: !!form.values.bundle
        })

    useEffect(() => {
        if (inventoryItemsQuery.data) {
            const data = inventoryItemsQuery.data
            if (data?.Name) {
                form.setFieldValue('sectionName', data.Name)
                setInventoryItems(data.BundleInventory)
            }
        }
    }, [inventoryItemsQuery.data])

    useEffect(() => {
        if (!form.values.bundle) {
            setInventoryItems([])
        }
    }, [form.values.bundle])

    useEffect(() => {
        featureService.getFeature(constants.features.STOCK_CONTROL).then(feature => {
            setHasStockControl(!!feature);
        })
    }, []);

    const handleSubmit = (values) => {
        if (form.validate()) {

            const section =
                values.section ?
                    {
                        ...getDefaultSectionObject(crypto.randomUUID(), Enums.Module.JobCard, props.jobQueryData.ID, values.sectionName || inventoryItemsQuery.data?.Name)
                    } : null;

            //const warehouse = values.warehouse;

            // STOCK CONTROL ISQUANTITYTRACKED CHANGE
            const newInventoryList = [
                ...props.jobInventoryList,
                ...inventoryItems.map((x, i) => {

                    const priceExclusive = !x.UsePriceList ? +x.CustomPrice : parseFloat((x.Inventory.ListPrice - (x.Inventory.ListPrice * (x.PriceListDiscount / 100))).toFixed(2));

                    return {
                        // ...x,
                        InventorySectionID: section?.ID || null,
                        InventorySectionName: section?.Name || null,
                        FromBundleID: values.bundle,
                        UsePriceList: x.UsePriceList,
                        BundleDiscountedPercentage: x.PriceListDiscount,
                        HideLineItems: false,
                        DisplaySubtotal: false,
                        LineNumber: props.jobInventoryList.length + i + 1, // starts at 1
                        ID: crypto?.randomUUID(),
                        IsActive: true,
                        UnitAmount: 0,
                        InventoryID: x.Inventory.ID,
                        InventoryCode: x.Inventory.Code,
                        InventoryDescription: x.Inventory.Description,
                        Inventory: x.Inventory,
                        WarehouseID: helper.isInventoryWarehoused(x.Inventory) ? props.warehouse?.ID ?? null : null,
                        Warehouse: helper.isInventoryWarehoused(x.Inventory) ? props.warehouse ?? null : null,
                        // ID: crypto?.randomUUID(),
                        ...(props.type === 'Job' ?
                            {
                                JobCardID: props.jobQueryData.ID,
                                JobCardDescription: props.jobQueryData.Description,
                                QuantityAllocated: 0,
                                QuantityOutstanding: 0,
                                QuantityReturned: 0,
                                QuantityReturnPending: 0,
                                QuantityRequested: parseFloat(x.Quantity),
                                StockItemStatus: props.filteredStockItemStatus,
                                Billable: false,
                                LineDiscountPercentage: 0,
                                UnitPriceExclusive: priceExclusive
                            } :
                            {  // recurring job
                                JobScheduleID: props.jobQueryData.ID,
                                Quantity: parseFloat(x.Quantity),
                                StockItemStatus: x.Inventory.StockItemType === Enums.StockItemType.Service ? Enums.StockItemStatus.ItemUsed : Enums.StockItemStatus.WorkedOn,
                                Billable: false,
                            }
                        )
                    }
                })
            ]

            /*if (props.fromCreateJob || props.fromSchedule || props.fromStatusChange || props.type === 'Recurring') {
                // only relevant for assets and will not be required in the context of items used
            } else*/
            if (!props.fromCreateJob) {
                // save Inventory Used List
                saveInventoryUsedMutation.mutate({
                    jobInventory: newInventoryList, sections: [
                        ...sections,
                        ...(values.section ? [section] : [])
                    ], jobId: props.jobQueryData.ID
                });
            } else if (props.onSaveNewListExternally) {
                props.onSaveNewListExternally(newInventoryList)
                props.onClose()
            }

        }
    }

    return <>
        <input style={{ opacity: 0, position: "absolute", pointerEvents: "none" }} />
        <form onSubmit={form.onSubmit(handleSubmit)}>
            <BundleSelector
                label={'Select bundle'}
                withAsterisk
                {...form.getInputProps('bundle')}
            />
            <Checkbox
                label={'Add as section'}
                mt={'lg'}
                size={'sm'}
                defaultChecked={form.values.section}
                // defaultValue={addToSection}
                // checked={addToSection}
                // onChange={e => setAddToSection(e.currentTarget.checked)}
                {...form.getInputProps('section')}
            />

            {
                form.values.section &&
                <ScTextControl
                    label={'Section Name'}
                    {...form.getInputProps('sectionName')}
                />
            }

            {/* {hasStockControl && !!form.values.bundle &&
                <WarehouseSelector
                    required={false}
                    selectedWarehouse={form.values.warehouse}
                    setSelectedWarehouse={(x) => form.setFieldValue('warehouse', x)}
                    storeID={props.storeID}
                    filterByEmployee={true}
                    hideFromView={true}
                    onSuppressSave={setSuppressSave}
                    ignoreIDs={[]}
                />} */}

            {
                inventoryItems.length !== 0 &&
                <Box mt={'md'}>
                    <Text fw={600} c={'scBlue.9'} size={'md'} mb={'xs'}>
                        Included items:
                    </Text>
                    {
                        inventoryItems.map(x => (
                            <Flex key={x.ID} align={'center'} gap={5} px={'sm'}>
                                <Text size={'sm'}>
                                    {x.Inventory.Description}
                                </Text>
                                <Text size={'xs'} fw={500}>
                                    ({x.Quantity})
                                </Text>
                            </Flex>
                        ))
                    }
                </Box>
            }

            <Group mt={'5rem'} justify={'right'} gap={'xs'}>
                <Button
                    type={'button'}
                    variant={'subtle'}
                    color={'gray.9'}
                    onClick={() => props.onClose()}
                >
                    Cancel
                </Button>
                <Button
                    color={'scBlue'}
                    type={'submit'}
                    disabled={inventoryItemsQuery.isFetching || inventoryItems.length === 0 || saveInventoryUsedMutation.isLoading || suppressSave}
                    rightSection={(saveInventoryUsedMutation.isLoading) && <Loader variant={'oval'} size={16} color={'white'} />}
                >
                    Add Bundle
                </Button>
            </Group>
        </form>
    </>
}

export default AddBundleToJobMaterialsForm
