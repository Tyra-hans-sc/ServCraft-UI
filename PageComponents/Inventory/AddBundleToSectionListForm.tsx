import React, { FC, useEffect, useMemo, useState } from "react";
import * as Enums from "@/utils/enums";
import { useForm } from "@mantine/form";
import { Box, Checkbox, Flex, Text } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import Fetch from "@/utils/Fetch";
import { getDefaultSectionObject } from "@/PageComponents/SectionTable/SectionTable";
import BundleSelector from "@/PageComponents/Bundle/BundleSelector";
import ScTextControl from "@/components/sc-controls/form-controls/v2/sc-text-control";
import WarehouseSelector from "@/components/selectors/warehouse/warehouse-selector";
import featureService from "@/services/feature/feature-service";
import constants from "@/utils/constants";
import helper from "@/utils/helper";
import { Warehouse } from "@/interfaces/api/models";

const AddBundleToSectionListForm: FC<{
    isNew: boolean
    itemID: string
    module: number
    accessStatus: number
    items: any[]
    // increment start at 0, if this changes, validation and onSave event will be triggered
    triggerSave: number
    onSaveItems: (newItems: any[]) => void
    companyTaxPercentage: number
    defaultSectionPdfSettings?: { HideLineItems: boolean; DisplaySubtotal: boolean; }
    // isNew: boolean
    // jobInventoryItem: any
    // updateJobInventoryExternally: (itemToSave: any) => void
    // onJobInventoryItemsSaved: (newJobInventories: any[], newJobRowVersion: any) => void
    // jobQueryData: any
    // accessStatus: number
    // jobSingleItem: any
    // linkedProductIDs: any
    // type: 'Job' | 'Recurring'
    // jobItemSelection: any
    // jobItemOrder: any
    // filteredStockItemStatus: any
    // jobInventoryList: any[]
    // onClose: () => void
    // fromCreateJob: boolean
    // fromStatusChange: boolean
    // fromSchedule?: boolean
    // tableSectionItem?: any
    storeID: string | undefined
    onSuppressSave: (suppressSave: boolean) => void
    warehouse?: Warehouse
}> = (props, context) => {

    const [hasStockControl, setHasStockControl] = useState<boolean | undefined>();

    useEffect(() => {
        featureService.getFeature(constants.features.STOCK_CONTROL).then(feature => {
            let stockControlModules = [Enums.Module.JobCard, Enums.Module.Invoice];
            setHasStockControl(!!feature && stockControlModules.includes(props.module));
        });
    }, []);

    /*const [sections, setSections] = useState<any[]>([])

    const sectionQuery = useQuery(['inventorySection', props.itemID, props.module],
        () => {
            return getSectionsFromTableData(props.items, 'InventorySectionName', 'InventorySectionID', props.module, props.itemID)
            /!*Fetch.post({
                url: '/InventorySection/GetInventorySections',
                params: {
                    Module: props.module,
                    ItemID: props.itemID
                }
            } as any)*!/
        }, {
            onSuccess: (sections) => {
                setSections(sections)
            }
        }
    )*/

    /*const saveInventoryUsedMutation = useMutation(['inventoryItemsUsed'], ({jobInventory, sections, jobId}: any) => postItemsUsed(jobInventory, sections, jobId), {
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
    });*/

    const getSelectedWarehouse = () => {
        if (props.module === Enums.Module.JobCard) {
            return props.warehouse;
        }
        return form.values.warehouse;
    };

    const form = useForm({
        initialValues: {
            bundle: null,
            section: props.module === Enums.Module.Quote || props.module === Enums.Module.Invoice,
            sectionName: '',
            warehouse: null as any
        },
        validate: {
            bundle: (x: any) => { return !!x ? null : 'Please select a bundle to add'; },
            warehouse: (x: any) => { return !hasStockControl || !!getSelectedWarehouse() ? null : 'Warehouse missing'; },
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
                setInventoryItems(data.BundleInventory.sort((a, b) => a.LineNumber - b.LineNumber).map(x => x))
            }
        }
    }, [inventoryItemsQuery.data])

    useEffect(() => {
        if (!form.values.bundle) {
            setInventoryItems([])
        }
    }, [form.values.bundle])

    const handleSubmit = async (values) => {
        let validateResult = form.validate();
        if (!validateResult.hasErrors) {

            /*const bestPredictedDefaultPdfSettingValues = {
                HideLineItems:
                    globalHideLineItemsIndeterminate ? sectionData.filter(x => x.HideLineItems) < sectionData.filter(x => !x.HideLineItems) :
                        globalHideLineItemsChecked,
                DisplaySubtotal:
                    globalDisplaySubtotalIndeterminate ? sectionData.filter(x => x.DisplaySubtotal) < sectionData.filter(x => !x.DisplaySubtotal) :
                        globalDisplaySubtotalChecked,
            }*/

            const section =
                values.section ?
                    {
                        ...getDefaultSectionObject(crypto.randomUUID(), props.module, props.itemID, values.sectionName || inventoryItemsQuery.data?.Name, props.defaultSectionPdfSettings)
                    } : null

            const newItemsList = [
                ...props.items,
                ...inventoryItems.sort((a, b) => a.LineNumber - b.LineNumber).map((x, i) => {
                    // const inventory = await getInventory(x.ID)
                    const inventory = x.Inventory
                    let lineTotalExclusive = 0;

                    let priceExclusive = !x.UsePriceList ? +x.CustomPrice : Math.round((x.Inventory.ListPrice - (x.Inventory.ListPrice * (x.PriceListDiscount / 100))) * 100) / 100;

                    if (props.module === Enums.Module.PurchaseOrder) {
                        priceExclusive = inventory.CostPrice;
                    }

                    if (x.Quantity > 0) {
                        let subTotal = x.Quantity * priceExclusive;
                        lineTotalExclusive = Math.round(subTotal * 100) / 100;
                    }
                    // STOCK CONTROL ISQUANTITYTRACKED CHANGE
                    return (
                        {
                            // ...x,
                            Description: /*x.ProductID ? x.Inventory.Description + ' - ' + x.ProductNumber :*/ x.Inventory.Description,
                            InventoryID: x.Inventory.ID,
                            InventoryDescription: /*x.ProductID ? x.Inventory.Description + ' - ' + x.ProductNumber :*/ x.Inventory.Description,
                            InventoryCode: x.Inventory.Code,
                            Inventory: x.Inventory,
                            // ProductID: x.ProductID,
                            // ProductNumber: x.ProductNumber,
                            TaxPercentage: props.companyTaxPercentage,
                            Integrated: inventory.Integrated,
                            IntegrationMessage: inventory.IntegrationMessage,
                            LineDiscountPercentage: 0,
                            UnitPriceExclusive: priceExclusive,
                            LineTotalExclusive: lineTotalExclusive,
                            IsActive: true,
                            [props.module === Enums.Module.Quote ? 'QuoteItemType' : props.module === Enums.Module.Invoice ? 'InvoiceItemType' : props.module === Enums.Module.PurchaseOrder ? 'ItemType' : 'Unknown']: props.module === Enums.Module.Quote ? Enums.QuoteItemType.Inventory : props.module === Enums.Module.Invoice ? Enums.InvoiceItemType.Inventory : props.module === Enums.Module.PurchaseOrder ? Enums.ItemType.Inventory : Enums.ItemType.Inventory,
                            Quantity: x.Quantity,
                            InventorySectionID: section?.ID || null,
                            InventorySectionName: section?.Name || null,
                            FromBundleID: values.bundle,
                            UsePriceList: x.UsePriceList,
                            BundleDiscountedPercentage: x.PriceListDiscount,
                            HideLineItems: false,
                            DisplaySubtotal: false,
                            ...props.defaultSectionPdfSettings,
                            LineNumber: props.items.length + i + 1, // starts at 1
                            ID: crypto?.randomUUID(),
                            InventoryActive: true,
                            WarehouseID: helper.isInventoryWarehoused(x.Inventory) /*x.Inventory.IsQuantityTracked*/ ? getSelectedWarehouse()?.ID ?? null : null,
                            Warehouse: helper.isInventoryWarehoused(x.Inventory) /*x.Inventory.IsQuantityTracked*/ ? getSelectedWarehouse() : null,
                            UnitCostPrice: inventory.CostPrice
                            // UnitAmount: 0,
                            // Inventory: x.Inventory,
                            // ID: crypto?.randomUUID(),
                            /*...(props.type === 'Job' ?
                                {
                                    JobCardID: props.itemID,
                                    JobCardDescription: props.jobQueryData.Description,
                                    QuantityAllocated: 0,
                                    QuantityOutstanding: 0,
                                    QuantityReturned: 0,
                                    QuantityReturnPending: 0,
                                    QuantityRequested: parseFloat(x.Quantity),
                                    StockItemStatus: props.filteredStockItemStatus,
                                    Billable: false,
                                } :
                                {  // recurring job
                                    JobScheduleID: props.itemID,
                                    Quantity: parseFloat(x.Quantity),
                                    StockItemStatus: x.Inventory.StockItemType === Enums.StockItemType.Service ? Enums.StockItemStatus.ItemUsed : Enums.StockItemStatus.WorkedOn,
                                    Billable: false,
                                }
                            )*/
                        }
                    )
                })
            ]
            props.onSaveItems(newItemsList)
            // Reset form after successful save
            resetForm();
        } else {

        }
    }

    useEffect(
        () => {
            if (props.triggerSave > 0) {
                handleSubmit(form.values)
            }
        },
        [props.triggerSave]
    )

    // Reset form after successful save
    const resetForm = () => {


        form.setValues({
            bundle: null,
            section: props.module === Enums.Module.Quote || props.module === Enums.Module.Invoice,
            sectionName: '',
            warehouse: null as any
        });

        form.resetTouched();
        form.resetDirty();

        setInventoryItems([]);
    }

    return <>
        <input style={{ opacity: 0, position: "absolute", pointerEvents: "none" }} />
        <form onSubmit={form.onSubmit(handleSubmit)}>
            <BundleSelector
                label={'Select bundle'}
                withAsterisk
                {...form.getInputProps('bundle')}
            />
            {(props.module === Enums.Module.Quote || props.module === Enums.Module.Invoice) && <>
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
                <>
                    {
                        form.values.section &&
                        <ScTextControl
                            label={'Section Name'}
                            {...form.getInputProps('sectionName')}
                        />
                    }
                </>
            </>
            }


            {hasStockControl && form.values["bundle"] && props.module !== Enums.Module.JobCard &&
                <WarehouseSelector
                    required={true}
                    selectedWarehouse={form.values["warehouse"]}
                    setSelectedWarehouse={(x) => form.setFieldValue('warehouse', x)}
                    storeID={props.storeID}
                    filterByEmployee={true}
                    {...form.getInputProps('warehouse')}
                    hideFromView={true}
                    onSuppressSave={props.onSuppressSave}
                    ignoreIDs={[]}
                />
            }

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

            {/*<Group mt={'5rem'} justify={'right'} gap={'xs'}>
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
                    disabled={inventoryItemsQuery.isFetching || !sectionQuery.isFetched || saveInventoryUsedMutation.isLoading}
                        rightSection={(saveInventoryUsedMutation.isLoading) && <Loader variant={'oval'} size={16} color={'white'} />}
                >
                    Add Bundle
                </Button>
            </Group>*/}
        </form>
    </>
}

export default AddBundleToSectionListForm
