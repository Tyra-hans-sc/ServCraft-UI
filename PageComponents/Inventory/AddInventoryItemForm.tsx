import React, { FC, useContext, useEffect, useMemo, useRef, useState } from "react";
import InventorySelector from '../../components/selectors/inventory/inventory-selector'
import * as Enums from "@/utils/enums";
import ScNumberControl from "@/components/sc-controls/form-controls/v2/sc-number-control";
import { useForm } from "@mantine/form";
import { Box, Button, Checkbox, Fieldset, Flex, Group, Loader, Select, Text } from "@mantine/core";
import { useMutation, useQuery } from "@tanstack/react-query";
import Fetch from "@/utils/Fetch";
import Helper from "@/utils/helper";
import InventoryItemModal from "@/PageComponents/Inventory/InventoryItemModal";
import { showNotification } from "@mantine/notifications";
import jobInventoryService from "@/services/job/job-inventory-service";
import ToastContext from "@/utils/toast-context";
import { getDefaultSectionObject, getSectionsFromTableData } from "@/PageComponents/SectionTable/SectionTable";
import SectionSelector from "@/PageComponents/Inventory/SectionSelector";
import NewText from "@/PageComponents/Premium/NewText";
import permissionService from "@/services/permission/permission-service";
import WarehouseStockSelector from "@/components/selectors/stock/warehouse-stock-selector";
import featureService from "@/services/feature/feature-service";
import constants from "@/utils/constants";
import SCTextArea from "@/components/sc-controls/form-controls/sc-textarea";
import ScDataFilter from "@/PageComponents/Table/Table Filter/ScDataFilter";
import { IconFilter } from "@tabler/icons-react";
import styles from './AddInventoryItemForm.module.css'
import { IconChevronRight } from "@tabler/icons";
import helper from "@/utils/helper";
import ItemDisplayImages from "../Attachment/ItemDisplayImages";
import { Warehouse, WarehouseStock } from "@/interfaces/api/models";
import warehouseService from "@/services/warehouse/warehouse-service";

const postItemsUsed = async (jobInventory, sections, jobId, toast) => {
    // console.log('posting used item:', sections)

    const response = await jobInventoryService.saveJobInventory(jobInventory, jobId,
        Enums.StockItemStatus.ItemUsed, toast,
        // sections
    );

    if (!!response) {
        return response;
    }
    else {
        throw new Error('');
    }
}

const AddInventoryItemForm: FC<{
    isNew: boolean
    jobInventoryItem: any
    updateJobInventoryExternally: (itemToSave: any, addAndContinue?: boolean) => void
    onJobInventoryItemsSaved: (newJobInventories: any[], newJobRowVersion: any, addAndContinue?: boolean) => void
    jobQueryData: any
    accessStatus: number
    jobSingleItem: any
    linkedProductIDs: any
    type: 'Job' | 'Recurring'
    jobItemSelection: any
    jobItemOrder: any
    filteredStockItemStatus: any
    jobInventoryList: any[]
    onClose: () => void
    fromCreateJob?: boolean
    fromStatusChange?: boolean
    fromSchedule?: boolean
    tableSectionItem?: any
    useSectionTable?: boolean
    storeID?: string
    initialWarehouse?: Warehouse
    job?: any
}> = (props, context) => {

    // Reference to track if "Add & Next" button was clicked
    const addAndContinueRef = useRef(false);

    // console.log('job query', props.jobQueryData)
    const [manageCostingPermission] = useState(permissionService.hasPermission(Enums.PermissionName.ManageCosting));
    const [hasInventoryPermission] = useState(permissionService.hasPermission(Enums.PermissionName.Inventory));

    const [hasStockControl, setHasStockControl] = useState<boolean | undefined>();

    const [itemToEdit, setItemToEdit] = useState(null)

    const [showCreateNewInventory, setShowCreateNewInventory] = useState(false)

    const toast = useContext(ToastContext);

    const [sections, setSections] = useState<any[]>(getSectionsFromTableData(props.jobInventoryList, 'InventorySectionName', 'InventorySectionID', Enums.Module.JobCard, props.jobQueryData.ID))

    const [addToSection, setAddToSection] = useState(!!props.tableSectionItem)
    const [newSectionTitle, setNewSectionTitle] = useState('')
    const [selectedSection, setSelectedSection] = useState<any | null>(props.tableSectionItem || null)
    const [suppressSave, setSuppressSave] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    /** get selected inventory: props.jobInventoryItem is the selected inventory to edit but data in object is incomplete*/
    const getInventory = async () => {
        const id = props.jobInventoryItem?.InventoryID;
        if (id) {
            return await Fetch.get({
                url: `/Inventory`,
                params: { id },
            } as any);
        } else {
            return null;
        }
    };
    const { data: selectedInventoryData } = useQuery(['selectedInventoryItem', props.jobInventoryItem?.InventoryID], getInventory, {
        enabled: !!props.jobInventoryItem?.InventoryID,
        // initialData: props.jobInventoryItem
    });

    useEffect(() => {
        if (selectedInventoryData) {
            // console.log('selectedInventoryItem', selectedInventoryData);
            form.setFieldValue('selectedInventory', selectedInventoryData);
        }
    }, [selectedInventoryData]);

    const postInventoryWorkedOnList = async (jobInventory: any[]) => {

        console.log('posting worked on item:')

        const response = await jobInventoryService.saveJobInventory(jobInventory, props.jobQueryData.ID, Enums.StockItemStatus.WorkedOn, toast);

        if (!!response) {
            return response;
        }
        else {
            throw new Error('');
        }
    };

    const saveInventoryWorkedOnMutation = useMutation(['inventoryItemsWorkedOn', props.jobInventoryItem?.ID], postInventoryWorkedOnList, {
        onSuccess: (data) => {
            props.onJobInventoryItemsSaved(data.sortedResults, data.rowVersion, addAndContinueRef.current);
            showNotification({
                id: 'AddInventoryItemWorkedOn',
                message: `Non-serialised customer asset added `,
                color: 'scBlue',
            });

            setIsSubmitting(false);


            // If Add & Next was clicked, reset the form
            if (addAndContinueRef.current && !props.jobInventoryItem) {
                // Reset form values
                form.reset();
                // Clear filter state
                resetFilterState();
                setSelectedSection(null);
                setNewSectionTitle('');
                setAddToSection(false);

                // Reset addAndContinueRef to false for next submission
                addAndContinueRef.current = false;
            }

        },
        onError: (error: any) => {
            showNotification({
                id: 'AddInventoryItemNotification',
                message: error?.message || `Non-serialised customer asset could not be added `,
                color: 'red',
            });
            setIsSubmitting(false);
        }
    });


    const saveInventoryUsedMutation = useMutation(['inventoryItemsUsed', props.jobInventoryItem?.ID], ({ jobInventory, sections, jobId, toast }: any) => postItemsUsed(jobInventory, sections, jobId, toast), {
        onSuccess: data => {
            props.onJobInventoryItemsSaved(data.sortedResults, data.rowVersion, addAndContinueRef.current)
            showNotification({
                id: 'AddInventoryItemWorkedOn',
                message: `Inventory materials ${props.jobInventoryItem ? 'updated' : 'added'} `,
                color: 'scBlue',
            });

            setIsSubmitting(false);


            // If Add & Next was clicked, reset the form
            if (addAndContinueRef.current && !props.jobInventoryItem) {
                // Reset form values
                form.reset();
                // Clear filter state
                resetFilterState();
                setSelectedSection(null);
                setNewSectionTitle('');
                setAddToSection(false);
                // Reset addAndContinueRef to false for next submission
                addAndContinueRef.current = false;
            }
        },
        onError: (error: any) => {
            showNotification({
                id: 'AddInventoryItemNotification',
                message: error?.message || `Inventory item could not be added `,
                color: 'red',
            });
            setIsSubmitting(false);
        }
    });

    const [stockItemStatus] = useState(props.type === 'Recurring' ? null : (props.filteredStockItemStatus ?? (props.isNew && Enums.StockItemStatus.None || props.jobInventoryItem.StockItemStatus)));
    const [billableSwitch] = useState(props.isNew ? false : props.jobInventoryItem?.Billable);

    const form = useForm({
        initialValues: {
            selectedInventory: props.jobInventoryItem?.Inventory || null,
            quantity: props.jobInventoryItem?.QuantityRequested ?? 1,
            selectedWarehouse: props.jobInventoryItem?.Warehouse || props.initialWarehouse || null,
            unitCostPrice: props.jobInventoryItem?.UnitCostPrice ?? 0,
            description: props.jobInventoryItem?.Description || props.jobInventoryItem?.InventoryDescription || "",
            unitPriceExclusive: props.jobInventoryItem?.UnitPriceExclusive ?? 0,
            lineDiscountPercentage: props.jobInventoryItem?.LineDiscountPercentage ?? 0,
        },
        validate: {
            selectedInventory: (x) => Helper.validateInputStringOut({
                value: x,
                controlType: Enums.ControlType.Select,
                required: true,
                customErrorText: 'Inventory must be selected'
            } as any),
            quantity: /*isNotEmpty('Quantity cannot be empty') || ((x) => +x > 0 ? null : 'Quantity must be greater than 0')*/
                (x) => Helper.validateInputStringOut({
                    value: x,
                    controlType: Enums.ControlType.Number,
                    required: true,
                    greaterThan: 0,
                    // customErrorText: 'Asset must be selected',
                } as any),
            selectedWarehouse: (x) => {
                    if(x === null) {
                        showNotification({
                            id: 'noWarehouse',
                            message: 'Please select a store before adding materials',
                            color: 'yellow'
                        })
                    }
                return Helper.validateInputStringOut({
                    value: x,
                    controlType: Enums.ControlType.Select,
                    required: hasStockControl && props.filteredStockItemStatus === Enums.StockItemStatus.ItemUsed && Helper.isInventoryWarehoused(form.values.selectedInventory),
                    customErrorText: 'Warehouse must be selected'
                } as any)
            },
            unitCostPrice:
                (x) => Helper.validateInputStringOut({
                    value: x,
                    controlType: Enums.ControlType.Number,
                    required: true,
                    greaterThan: -0.01
                    // customErrorText: 'Asset must be selected',
                } as any),
            description:
                (x) => Helper.validateInputStringOut({
                    value: x,
                    controlType: Enums.ControlType.Text,
                    required: true
                } as any),
        }
    });

    // helper to ensure a default warehouse is set when needed
    const ensureDefaultWarehouse = async () => {
        if (!form.values.selectedWarehouse) {
            let warehouse = props.job?.Vans?.length > 0 ? props.job?.Vans[0] : null;
            if (!warehouse) {
                const warehouses = await warehouseService.getWarehouses(1000, undefined, undefined, Enums.WarehouseType.Warehouse);
                if (warehouses.Results.length === 1) {
                    warehouse = warehouses?.Results[0]
                } else {
                    warehouse = warehouses?.Results?.find((x: any) => x.StoreID === props.job?.StoreID) || null;
                }
            }
            form.setFieldValue('selectedWarehouse', warehouse);
        }
    };

    // set the initial warehouse for a new item (and whenever vans list changes)
    useEffect(() => {
        ensureDefaultWarehouse();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.job?.Vans, props.fromCreateJob]);

    // Guard: whenever a warehouse is required and currently missing, restore default
    useEffect(() => {
        const requiresWarehouse = hasStockControl && props.filteredStockItemStatus === Enums.StockItemStatus.ItemUsed && Helper.isInventoryWarehoused(form.values.selectedInventory);
        if (requiresWarehouse && !form.values.selectedWarehouse) {
            ensureDefaultWarehouse();
        }
    }, [form.values.selectedInventory, hasStockControl, props.filteredStockItemStatus]);

    const getCurrentLineNumber = () => {
        if (props.jobInventoryList.filter(x => x.IsActive).length > 0) {
            let lineNumbers = props.jobInventoryList.filter(x => x.IsActive).map((item, i) => {
                return parseInt(item.LineNumber);
            });
            return Math.max(...lineNumbers) + 1;
        } else {
            return 1;
        }
    };

    const disableSave = useMemo(() => {
        return (props.jobInventoryItem?.QuantityAllocated ?? 0) !== 0 || (props.jobInventoryItem?.QuantityUsed ?? 0) !== 0;
    }, [props.jobInventoryItem]);

    const handleSubmit = (v) => {
        setIsSubmitting(true);
        const { hasErrors } = form.validate();
        if (hasErrors) {
            setIsSubmitting(false);
            return;
        } else {
            // STOCK CONTROL ISQUANTITYTRACKED CHANGE
            let item: any = {
                ID: props.jobInventoryItem ? props.jobInventoryItem?.ID : Helper.newGuid(),
                RowVersion: props.jobInventoryItem ? props.jobInventoryItem?.RowVersion : null,
                LineNumber: props.jobInventoryItem ? props.jobInventoryItem?.LineNumber : getCurrentLineNumber(),
                IsActive: true,
                UnitAmount: 0,
                InventoryID: v.selectedInventory.ID,
                InventoryCode: v.selectedInventory.Code,
                InventoryDescription: v.selectedInventory.Description,
                Inventory: v.selectedInventory,
                UnitCostPrice: v.unitCostPrice,
                UnitPriceExclusive: v.unitPriceExclusive ?? v.selectedInventory.ListPrice,
                LineDiscountPercentage: v.lineDiscountPercentage ?? 0,
                Description: v.description,
                InventorySectionID:
                    props.jobInventoryItem ? props.jobInventoryItem?.InventorySectionID :
                        addToSection && selectedSection ? selectedSection?.ID :
                            addToSection && !selectedSection ? crypto?.randomUUID() : null,
                InventorySectionName:
                    props.jobInventoryItem ? props.jobInventoryItem?.InventorySectionName :
                        addToSection && selectedSection ? selectedSection?.Name :
                            addToSection && !selectedSection ? (newSectionTitle || ('Section ' + (sections.length + 1))) :
                                null,
                WarehouseID: helper.isInventoryWarehoused(v.selectedInventory) /*v.selectedInventory.IsQuantityTracked*/ ? v.selectedWarehouse?.ID ?? null : null,
                Warehouse: helper.isInventoryWarehoused(v.selectedInventory) /*v.selectedInventory.IsQuantityTracked*/ ? v.selectedWarehouse ?? null : null
                // FromBundleID: null,
                // HideLineItems: false,
                // DisplaySubtotal: false

            }

            // TODO STOCK CONTROL protect against zeroing out values when changing warehouse stock
            if (props.type === 'Job') {
                item.JobCardID = props.jobQueryData.ID;
                item.QuantityAllocated = 0;
                item.QuantityUsed = 0;
                item.QuantityOutstanding = 0;
                item.QuantityReturned = 0;
                item.QuantityReturnPending = 0;
                item.QuantityRequested = parseFloat(v.quantity);
                item.StockItemStatus = stockItemStatus;
                item.Billable = billableSwitch;
            } else {
                item.JobScheduleID = props.jobQueryData.ID;
                item.Quantity = parseFloat(v.quantity);
                item.StockItemStatus = v.selectedInventory.StockItemType === Enums.StockItemType.Service ? Enums.StockItemStatus.ItemUsed : Enums.StockItemStatus.WorkedOn;
                item.Billable = false;
            }

            let newList = [...props.jobInventoryList];

            if (props.jobInventoryItem) { // item is being edited
                newList = props.jobInventoryList.map(x => (
                    /*props.jobInventoryItem?.ProductID && props.jobInventoryItem?.ProductID === x.ProductID ||
                        props.jobInventoryItem?.InventoryID && props.jobInventoryItem?.InventoryID === x.InventoryID*/
                    x.ID === item.ID ? item : x
                ));
            } else { // a new item is being created
                newList.push(item)
            }

            if (props.fromCreateJob || props.fromSchedule || props.fromStatusChange || props.type === 'Recurring') {
                props.updateJobInventoryExternally(item, addAndContinueRef.current);

                // If Add & Next was clicked, reset the form
                if (addAndContinueRef.current && !props.jobInventoryItem) {
                    // Reset form values
                    form.reset();
                    // Re-ensure default warehouse after reset (to satisfy validation)
                    ensureDefaultWarehouse();
                    // Clear filter state
                    resetFilterState();
                    setSelectedSection(null);
                    setNewSectionTitle('');
                    setAddToSection(false);
                    // Reset addAndContinueRef to false for next submission
                    addAndContinueRef.current = false;
                }

                // Set isSubmitting to false for external saves
                setIsSubmitting(false);
            } else if (props.filteredStockItemStatus === Enums.StockItemStatus.ItemUsed) {
                // save Inventory Used List
                saveInventoryUsedMutation.mutate({
                    jobInventory: newList, sections: [
                        ...(addToSection && !selectedSection ? [getDefaultSectionObject(item.InventorySectionID, Enums.Module.JobCard, props.jobQueryData.ID, item.InventorySectionName)] : []),
                        ...sections
                    ], jobId: props.jobQueryData.ID, toast
                });
            } else if (props.filteredStockItemStatus === Enums.StockItemStatus.WorkedOn) {
                // save inventory worked on
                saveInventoryWorkedOnMutation.mutate(newList);
            }

            /*if (props.type === 'Recurring') {
                props.updateJobInventoryExternally(item, addAndContinueRef.current);
                // If Add & Next was clicked, reset the form
                if (addAndContinueRef.current && !props.jobInventoryItem) {
                    // Reset form values
                    form.reset();
                    // Clear filter state
                    resetFilterState();
                    setSelectedSection(null);
                    setNewSectionTitle('');
                    setAddToSection(false);
                    // Reset addAndContinueRef to false for next submission
                    addAndContinueRef.current = false;
                }
                // Set isSubmitting to false for external saves
                setIsSubmitting(false);
            }*/
        }
    }

    useEffect(() => {
        featureService.getFeature(constants.features.STOCK_CONTROL).then(feature => {
            setHasStockControl(!!feature);
        })
    }, []);

    // Using forwardRef to expose the reset method of the ScDataFilter component
    const filterRef = useRef<any>(null)

    const [queryState, setQueryState] = useState({})
    const [closed, setClosed] = useState(true)
    const handleSetQueryStateWithInventoryChange = (inventory) => {
        setQueryState({
            StockItemTypeIDList: typeof inventory?.StockItemType !== 'undefined' ? [Enums.getEnumStringValue(Enums.StockItemType, inventory.StockItemType)] : [],
            SubcategoryIDList: inventory?.InventorySubcategoryID ? [inventory?.InventorySubcategoryID] : [],
            CategoryIDList: inventory?.InventoryCategoryID ? [inventory?.InventoryCategoryID] : [],
        })
    }

    // Function to reset the filter state
    const resetFilterState = () => {
        // Clear the filter state in the parent component
        handleSetQueryStateWithInventoryChange(null);
    }


    return <>
        <form onSubmit={form.onSubmit(handleSubmit)}>
            {/*avoids form autofocus*/}
            {/*<input type="text" name="test" id="test" style={{ opacity: 0, position: "absolute", pointerEvents: "none" }} />*/}

            <Fieldset
                disabled={!!form.values.selectedInventory}
                legend={
                    <Flex align={'center'} gap={5} w={'100%'}>
                        <IconFilter size={15} />
                        <span>Inventory Filter</span>
                        <IconChevronRight
                            style={{
                                transition: '150ms ease-in-out',
                                transform: closed ? 'rotate(0deg)' : 'rotate(90deg)'
                            }}
                            size={15}
                        />
                    </Flex>
                }
                variant={'filled'}
                onClick={() => setClosed(p => !p)}
                classNames={{
                    legend: styles.filterFieldsetLegend,
                    root: styles.filterFieldsetRoot + ' ' + (closed ? styles.closed : styles.opened)
                }}
            >

                <Box onClick={e => e.stopPropagation()}>
                    {
                        !closed &&
                        <ScDataFilter
                            initialValues={queryState as any}
                            onChange={setQueryState}
                            module={Enums.Module.Inventory}
                            tableNoun={'Inventory'}
                            flexProps={{ w: '100%', align: 'start', wrap: { base: 'wrap' } }}
                            singleSelectMode
                            tableName={'inventoryFilter'}
                            optionConfig={{
                                options: [
                                    {
                                        filterName: 'CategoryIDList',
                                        dataOptionValueKey: 'ID',
                                        dataOptionLabelKey: ['Description'],
                                        queryPath: '/InventoryCategory/false',
                                        label: 'Category',
                                        fieldSettingSystemName: 'InventoryCategory'
                                    },
                                    {
                                        filterName: 'SubcategoryIDList',
                                        dataOptionValueKey: 'ID',
                                        dataOptionLabelKey: ['Description'],
                                        queryPath: '/InventorySubcategory/GetOnlyActive',
                                        showIncludeDisabledToggle: true,
                                        label: 'Subcategory',
                                        // defaultValue: ["8c2aca98-c499-45f2-8cd6-6d83eee1bb75", "bf92b39a-3d34-4b1e-b63e-fb95a5b686f1"],
                                        queryParams: {
                                            onlyActive: 'false'
                                        },
                                        type: 'multiselect',
                                        dataOptionSiblingFilterName: 'CategoryIDList',
                                        dataOptionSiblingKey: 'InventoryCategoryID',
                                        dataOptionGroupingKey: 'InventoryCategoryDescription',
                                        fieldSettingSystemName: 'InventorySubcategory'
                                    },
                                    /*{
                                        filterName: 'SupplierIDList',
                                        dataOptionValueKey: 'ID',
                                        dataOptionLabelKey: ['Name'],
                                        queryPath: '/Supplier/IncludeDisabled/true',
                                        label: 'Supplier',
                                        fieldSettingSystemName: 'Supplier'
                                    },*/
                                    {
                                        filterName: 'StockItemTypeIDList',
                                        label: 'Item Type',
                                        hardcodedOptions: [
                                            {
                                                label: 'Part',
                                                value: 'Part'
                                            },
                                            {
                                                label: 'Product',
                                                value: 'Product'
                                            },
                                            {
                                                label: 'Service',
                                                value: 'Service'
                                            }
                                        ]
                                    },
                                    /*{
                                        type: 'switch',
                                        label: 'Include Disabled',
                                        filterName: 'IncludeClosed',
                                        inclusion: 'inclusive',
                                        dataValueKey: 'IsClosed'
                                    },*/
                                    /*{
                                        type: 'hidden',
                                        filterName: 'PopulatedList',
                                        label: "Populate Inventory",
                                        defaultValue: false
                                    }*/
                                ],
                                showIncludeDisabledOptionsToggle: true
                            }}
                        />
                    }
                </Box>
            </Fieldset>
            <Text ta={'start'} ml={'xs'} mt={1} c={'dimmed'} opacity={closed ? 0 : 1} style={{ transition: '200ms ease-in-out' }} size={'xs'}>{form.values.selectedInventory ? 'Inventory selected' : 'Filter is applied when selecting inventory'}</Text>


            {/*<Flex align={'center'} gap={'sm'} style={{
                display: filterRef.current?.children.length === 0 ? 'none' : 'inline-flex'
            }}
                  w={'100%'}
            >
                <IconFilter />
                <Box w={'100%'} ref={filterRef} style={{flexGrow: 1}}>

                </Box>
            </Flex>*/}

            {form.values.selectedInventory &&
                <div style={{ width: "100%" }}>
                    <ItemDisplayImages
                        itemID={form.values.selectedInventory.ID}
                        module={Enums.Module.Inventory}
                        primaryDisplayImageID={form.values.selectedInventory.PrimaryDisplayImageID}
                        readOnly={true}
                    />
                </div>
            }


            <Flex gap={{ base: 0, xs: 'sm' }} direction={{ base: 'column', xs: 'row' }}>
                <Box
                    style={{ flexGrow: 1 }}
                >
                    <InventorySelector
                        onCreateNewInventoryItem={() => setShowCreateNewInventory(true)}
                        selectedInventory={form.values.selectedInventory}
                        setSelectedInventory={(x) => {
                            handleSetQueryStateWithInventoryChange(x)
                            form.setFieldValue('selectedInventory', x);
                            form.setFieldValue('description', x?.Description ?? "");
                            form.setFieldValue('unitCostPrice', x?.CostPrice ?? 0);
                            form.setFieldValue("lineDiscountPercentage", 0);
                            form.setFieldValue("unitPriceExclusive", x?.ListPrice ?? 0);
                        }}
                        accessStatus={props.accessStatus}
                        error={form.getInputProps('selectedInventory').error}
                        setInventoryChanged={undefined}
                        cypress={undefined}
                        ignoreIDs={[]}
                        isRequired={true}
                        disabled={disableSave}
                        additionalQueryParams={closed ? {} : queryState as any}
                        {...form.getInputProps('selectedInventory')}
                    />
                </Box>

                <Box
                    style={{ flexGrow: 0 }}
                    maw={{ base: '100%', xs: 134 }}
                >
                    <ScNumberControl
                        // my={'var(--mantine-spacing-sm)'}
                        label="Quantity"
                        // onChange={(x) => console.log('changed', x)}
                        // value={1}
                        withAsterisk
                        error={null}
                        readOnly={props.jobSingleItem}
                        decimalScale={2}
                        min={props.jobInventoryItem?.QuantityUsed ?? 0}
                        // disabled={disableSave}
                        // title={disableSave ? "Cannot make changes as stock as been moved for this item" : undefined}
                        // removeTrailingZeros
                        {...form.getInputProps('quantity')}
                    />
                </Box>
            </Flex>

            <Flex
                gap={{ base: 0, xs: 'sm' }}
                direction={{ base: 'column-reverse', xs: 'row' }}
            >
                <Box
                    style={{ flexGrow: 1 }}
                >
                    {form.values.selectedInventory && <SCTextArea
                        // my={'var(--mantine-spacing-sm)'}
                        label="Description"
                        autosize
                        rows={1}
                        withAsterisk
                        error={null}
                        readOnly={props.jobSingleItem}
                        {...form.getInputProps('description')}
                    />}
                </Box>
                <Box
                    style={{ flexGrow: 0 }}
                    maw={{ base: '100%', xs: 134 }}
                >
                    {manageCostingPermission && form.values.selectedInventory && <ScNumberControl
                        // my={'var(--mantine-spacing-sm)'}
                        label="Unit Cost Price"
                        // onChange={(x) => console.log('changed', x)}
                        // value={1}
                        withAsterisk
                        error={null}
                        readOnly={props.jobSingleItem}
                        decimalScale={2}
                        thousandSeparator={' '}
                        fixedDecimalScale
                        min={0}
                        // removeTrailingZeros
                        {...form.getInputProps('unitCostPrice')}
                    />}
                </Box>
            </Flex>


            {/* // STOCK CONTROL ISQUANTITYTRACKED CHANGE */}
            {/* {hasStockControl && props.filteredStockItemStatus === Enums.StockItemStatus.ItemUsed && Helper.isInventoryWarehoused(form.values.selectedInventory) &&
                <WarehouseStockSelector
                    disabled={disableSave}
                    title={disableSave ? "Cannot make changes as stock as been moved for this item" : undefined}
                    selectedInventory={form.values.selectedInventory}
                    error={form.getInputProps('selectedWarehouse').error}
                    required={true}
                    selectedWarehouse={form.values.selectedWarehouse}
                    setSelectedWarehouse={(x) => {
                        form.setFieldValue('selectedWarehouse', x);
                    }}
                    storeID={props.storeID}
                    autoSelect={!!props.storeID}
                    hideFormView={true}
                    onSuppressSave={setSuppressSave}
                    optionFilter={(text: string, item: WarehouseStock) => {

                        if (props.initialWarehouse?.WarehouseType === Enums.WarehouseType.Mobile) {
                            return item.Warehouse?.WarehouseType === Enums.WarehouseType.Warehouse || item.Warehouse?.ID === props.initialWarehouse.ID;
                        }

                        return true;
                    }}
                />} */}




            {/*

            {
                addToSection && sections?.length !== 0 &&
                <Select
                    mt={'sm'}
                    label="Select a Section"
                    placeholder="None (Create new section)"
                    data={sections?.map((x, i) => ({
                        value: x.ID,
                        label: x.Name || ('Section ' + (i + 1) + ' (Untitled)')
                    }))}
                    value={selectedSection?.ID || null}
                    onChange={x => setSelectedSection(x ? sections.find(y => y.ID === x) : null)}
                    searchable
                    description={'Leave blank to create a new section'}
                    styles={{
                        section: {
                            fontSize: 10
                        }
                    }}
                    // searchValue={sectionSearchValue}
                    // onSearchChange={setSectionSearchValue}
                    clearable
                    // onBlur={(e) => e.stopPropagation()}
                    // rightSection={selectedSection ? <ClearButton onClear={() => setSelectedSection(null)} /> : <IconChevronDown  />}
                />
            }*/}

            {
                props.useSectionTable &&
                props.filteredStockItemStatus === Enums.StockItemStatus.ItemUsed &&
                !props.jobInventoryItem && <>
                    <Checkbox
                        label={<>{sections?.length === 0 ? 'Add to new section' : 'Add to section'} <NewText /></>}
                        mt={'lg'}
                        size={'sm'}
                        // defaultValue={addToSection}
                        checked={addToSection}
                        onChange={e => setAddToSection(e.currentTarget.checked)}
                    />

                    {
                        addToSection &&
                        <SectionSelector
                            moduleId={Enums.Module.JobCard}
                            itemId={props.jobQueryData.ID}
                            selectedTableGroup={props.tableSectionItem}
                            onSectionsLoaded={setSections}
                            onSectionSelect={setSelectedSection}
                            onNewSectionNameChange={setNewSectionTitle}
                            label="Section"
                            placeholder="None (Create new section)"
                            description={'Select an existing section or specify a new section name'}
                            mt={'sm'}
                            tableData={props.jobInventoryList}
                            dataSectionIdKey={'InventorySectionID'}
                            dataSectionNameKey={'InventorySectionName'}
                        />
                    }
                </>
            }

            <Group mt={'5rem'} justify={'right'} gap={0}>
                <Button type={'button'} variant={'subtle'} color={'gray.9'} onClick={() => props.onClose()} disabled={isSubmitting} mr={'xs'}>
                    Cancel
                </Button>
                {
                    !!form.values.selectedInventory &&
                    <Button type={'button'} disabled={!hasInventoryPermission || isSubmitting} variant={'light'} onClick={() => setItemToEdit(form.values.selectedInventory)} mr={'xs'}>
                        Edit
                    </Button>
                }
                {/* Only show Add & Next button when adding a new item */}
                {!props.jobInventoryItem && (
                    <Button
                        type="button"
                        disabled={suppressSave || isSubmitting}
                        onClick={() => {
                            addAndContinueRef.current = true;
                            form.onSubmit(handleSubmit)();
                        }}
                        loading={isSubmitting}
                        mr={5}
                        variant={'outline'}
                    >
                        Add & Next
                    </Button>
                )}
                <Button
                    type="button"
                    disabled={suppressSave || isSubmitting}
                    // title={disableSave ? "Cannot make changes as stock as been moved for this item" : undefined}
                    color={'scBlue'}
                    onClick={() => {
                        addAndContinueRef.current = false;
                        form.onSubmit(handleSubmit)();
                    }}
                    loading={isSubmitting}
                >
                    {!!props.jobInventoryItem ? 'Update' : 'Add'}
                </Button>
            </Group>



            {

            }

            {/**/}

        </form>

        {
            (showCreateNewInventory || itemToEdit) &&
            <InventoryItemModal
                isNew={!itemToEdit}
                inventory={itemToEdit}
                onInventorySave={(data) => {
                    setShowCreateNewInventory(false);
                    setItemToEdit(null);
                    form.setFieldValue('selectedInventory', data);
                    form.setFieldValue('description', data?.Description ?? "");
                    form.setFieldValue('unitCostPrice', data?.CostPrice ?? 0);
                    form.setFieldValue("lineDiscountPercentage", 0);
                    form.setFieldValue("unitPriceExclusive", data?.ListPrice ?? 0);
                    handleSetQueryStateWithInventoryChange(data);
                }}
                onClose={() => {
                    setShowCreateNewInventory(false)
                    setItemToEdit(null)
                }}
                accessStatus={props.accessStatus}
            />
        }
    </>
}

export default AddInventoryItemForm
