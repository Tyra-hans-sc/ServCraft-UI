import React, { FC, useContext, useEffect, useRef, useState } from "react";
import AssetSelector from '../../components/selectors/asset/asset-selector'
import * as Enums from "@/utils/enums";
import { useForm } from "@mantine/form";
import { Button, Flex, Group, Loader, Space } from "@mantine/core";
import { useMutation, useQuery } from "@tanstack/react-query";
import Fetch from "@/utils/Fetch";
import SCCheckbox from "@/components/sc-controls/form-controls/sc-checkbox";
import Helper from "@/utils/helper";
import { showNotification } from "@mantine/notifications";
import AssetModal from "@/PageComponents/Inventory/AssetModal";
import TransferAssetModal from "@/PageComponents/Inventory/TransferAssetModal";
import WarrantyIndicator from "@/components/product/warranty-indicator";
import jobInventoryService from "@/services/job/job-inventory-service";
import ToastContext from "@/utils/toast-context";
import userConfigService from "@/services/option/user-config-service";
import permissionService from "@/services/permission/permission-service";

const jobCardModule = Enums.Module.JobCard;

const AddAssetItemForm: FC<{
    isNew: boolean
    jobInventoryItem: any
    updateJobInventoryExternally: (itemToSave: any, addAndContinue?: boolean) => void
    onJobInventoryItemsSaved: (newJobInventories: any[], newJobRowVersion: any, addAndContinue?: boolean) => void
    job: any
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
    previousHeader?: string
    fromSchedule?: boolean
}> = (props, context) => {

    // Reference to track if "Add & Next" button was clicked
    const addAndContinueRef = useRef(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [showCreateNewAsset, setShowCreateNewAsset] = useState(false);
    const [assetToEdit, setAssetToEdit] = useState<any>(null);
    const [transferAsset, setTransferAsset] = useState<any>(null);

    const [hasProductPermission] = useState(permissionService.hasPermission(Enums.PermissionName.Product));

    const toast = useContext(ToastContext);
    const [filterConfig, setFilterConfig] = useState<any>();

    const setupFilterConfig = async () => {
        let _filterConfig = await userConfigService.getPageFilters(Enums.ConfigurationSection.JobInventory);
        setFilterConfig(_filterConfig);

        let filterAssetLocationID = userConfigService.getMetaDataValue(_filterConfig, "filterAssetLocationID");
        setFilterOnLocation(filterAssetLocationID === true);
    }


    const updateFilterOnLocation = async (newVal: boolean) => {
        setFilterOnLocation(newVal);
        let _filterConfig = { ...filterConfig };
        userConfigService.setMetaDataValue(_filterConfig, "filterAssetLocationID", newVal);
        setFilterConfig(_filterConfig);
        await userConfigService.saveConfigDebounced(_filterConfig);
    };

    useEffect(() => {
        setupFilterConfig();
    }, []);

    /** get selected inventory: props.jobInventoryItem is the selected inventory to edit but data in object is incomplete*/
    const getProduct = async () => {
        const id = props.jobInventoryItem?.ProductID;
        if (id) {

            if (id === props.jobInventoryItem.Product?.ID) {
                return props.jobInventoryItem.Product;
            }

            return await Fetch.get({
                url: `/Product`,
                params: { id },
            } as any);
        } else {
            return null;
        }
    };
    const { data: selectedAssetData } = useQuery(['selectedAssetItem', props.jobInventoryItem?.ProductID], getProduct, {
        enabled: !!props.jobInventoryItem?.ProductID,
    });

    useEffect(() => {
        if (selectedAssetData) {
            onAssetChanged(selectedAssetData)
        }
    }, [selectedAssetData]);

    const postInventoryUsedList = async (jobInventory) => {
        const response = await jobInventoryService.saveJobInventory(jobInventory, props.jobQueryData.ID, Enums.StockItemStatus.ItemUsed, toast);

        if (!!response) {
            return response;
        }
        else {
            throw new Error('');
        }
    };

    const saveInventoryUsedMutation = useMutation(['inventoryItemsUsed', props.jobInventoryItem?.id], postInventoryUsedList, {
        onSuccess: (data) => {
            props.onJobInventoryItemsSaved(data.sortedResults, data.rowVersion, addAndContinueRef.current);
            showNotification({
                id: 'AddInventoryItemWorkedOn',
                message: `Inventory materials added`,
                color: 'scBlue',
            });

            setIsSubmitting(false);

            // If Add & Next was clicked, reset the form
            if (addAndContinueRef.current && !props.jobInventoryItem) {
                // Reset form values
                form.reset();
                // Clear selected asset
                setSelectedProduct(null);

                // Reset addAndContinueRef to false for next submission
                addAndContinueRef.current = false;
            }
        },
        onError: (error: any) => {
            showNotification({
                id: 'AddInventoryItemNotification',
                message: error?.message || `Inventory item could not be added`,
                color: 'red',
            });
            setIsSubmitting(false);
        }
    })

    const postInventoryWorkedOnList = async (jobInventory) => {
        const response = await jobInventoryService.saveJobInventory(jobInventory, props.jobQueryData.ID, Enums.StockItemStatus.WorkedOn, toast);

        if (!!response) {
            return response;
        }
        else {
            throw new Error('');
        }
    }

    const saveInventoryWorkedOnMutation = useMutation(['inventoryItemsWorkedOn', props.jobInventoryItem?.id], postInventoryWorkedOnList, {
        onSuccess: (data) => {
            props.onJobInventoryItemsSaved(data.sortedResults, data.rowVersion, addAndContinueRef.current);
            showNotification({
                id: 'AddInventoryItemWorkedOn',
                message: `Serialised customer asset added`,
                color: 'scBlue',
            });

            setIsSubmitting(false);

            // If Add & Next was clicked, reset the form
            if (addAndContinueRef.current && !props.jobInventoryItem) {
                // Reset form values
                form.reset();
                // Clear selected asset
                setSelectedProduct(null);

                // Reset addAndContinueRef to false for next submission
                addAndContinueRef.current = false;
            }
        },
        onError: (error: any) => {
            showNotification({
                id: 'AddInventoryItemNotification',
                message: error?.message || `Serialised customer asset could not be added`,
                color: 'red',
            });
            setIsSubmitting(false);
        }
    })

    const getIgnoreIDs = () => {
        let ids = [...props.linkedProductIDs];

        if (props.jobInventoryItem && props.jobInventoryItem.ProductID) {
            ids.splice(ids.indexOf(props.jobInventoryItem.ProductID), 1);
        }

        return ids;
    };

    // console.log(props.jobInventoryItem)

    const [selectedProduct, setSelectedProduct] = useState<any>(props.jobInventoryItem?.Product || null);
    const [triggerEditProduct, setTriggerEditProduct] = useState(false);
    // const [triggerNewProduct, setTriggerNewProduct] = useState(false);
    const [transferable, setTransferable] = useState(false);

    const [filterOnLocation, setFilterOnLocation] = useState<boolean | undefined>(undefined);


    // const [stockItemStatus] = useState(props.filterStockItemStatus ?? (props.isNew && Enums.StockItemStatus.None || props.jobInventoryItem.StockItemStatus));
    // const [billableSwitch] = useState(props.isNew ? false : props.jobInventoryItem.Billable);

    const form = useForm({
        initialValues: {
            product: props.jobInventoryItem?.Product ?? null,
            ProductNumber: '',
            SerialNumber: '',
            PurchaseDate: '',
            WarrantyPeriod: 0,
            PurchaseAmount: 0,
            InvoiceNumber: ''
        },
        validate: {
            // product: (x) => x === null ? 'Asset cannot be empty' : null,
            product: (x) => Helper.validateInputStringOut({
                value: x,
                controlType: Enums.ControlType.Select,
                required: true,
                customErrorText: 'Asset must be selected'
            } as any),
        }
    });

    const validateForm = () => {
        const validationErrors: any = {};

        if (!form.values.product) {
            validationErrors.product = "Asset must be selected";
        }

        for (const key in validationErrors) {
            if (form.values.hasOwnProperty(key) && validationErrors.hasOwnProperty(key)) {
                form.setFieldError(key, validationErrors[key])
            }
        }
    }

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

    const handleSubmit = (v) => {
        setIsSubmitting(true);
        const isValid = form.validate();
        if (!isValid) {
            setIsSubmitting(false);
            return;
        }

        let item: any = {
            ID: props.jobInventoryItem ? props.jobInventoryItem.ID : Helper.newGuid(),
            RowVersion: props.jobInventoryItem ? props.jobInventoryItem.RowVersion : null,
            LineNumber: props.jobInventoryItem ? props.jobInventoryItem.LineNumber : getCurrentLineNumber(),
            IsActive: true,
            UnitAmount: 0,
            InventoryID: selectedProduct?.InventoryID,
            ProductNumber: selectedProduct?.ProductNumber,
            InventoryDescription: selectedProduct?.InventoryDescription,
            ProductID: selectedProduct?.ID,
            WarrantyPeriod: v.WarrantyPeriod,
            SerialNumber: v.SerialNumber,
            StockItemStatus: props.filteredStockItemStatus ?? (props.isNew ? Enums.StockItemStatus.None : props.jobInventoryItem.StockItemStatus),
            Billable: false,
            Description: selectedProduct?.InventoryDescription
        };

        if (props.type === 'Job') {
            item.JobCardID = props.jobQueryData.ID;
            item.QuantityAllocated = 0;
            item.QuantityOutstanding = 0;
            item.QuantityReturned = 0;
            item.QuantityReturnPending = 0;
        } else if (props.type === 'Recurring') { //
            item.JobScheduleID = props.jobQueryData.ID;
        }

        if (props.isNew && props.linkedProductIDs.includes(selectedProduct?.ID)) {
            showNotification({
                id: 'AssetErrorNotification',
                message: 'This asset has already been added to the job',
                color: 'red'
            });
            setIsSubmitting(false);
            return;
        }

        if (props.type === 'Job') {
            item.QuantityRequested = 1;
        } else {
            item.Quantity = 1;
        }

        // console.log('the following item will be added', item, 'new list is', )

        const newInventoryList = [...props.jobInventoryList, item];

        if (props.fromCreateJob || props.fromSchedule || props.fromStatusChange) {
            props.updateJobInventoryExternally(item, addAndContinueRef.current);

            // If Add & Next was clicked, reset the form
            if (addAndContinueRef.current && !props.jobInventoryItem) {
                // Reset form values
                form.reset();
                // Clear selected asset
                setSelectedProduct(null);

                // Reset addAndContinueRef to false for next submission
                addAndContinueRef.current = false;
            }

            // Set isSubmitting to false for external saves
            setIsSubmitting(false);
        } else if (props.filteredStockItemStatus === Enums.StockItemStatus.ItemUsed) {
            // save Inventory Used List
            saveInventoryUsedMutation.mutate(newInventoryList);
        } else if (props.filteredStockItemStatus === Enums.StockItemStatus.WorkedOn) {
            // save inventory worked on
            saveInventoryWorkedOnMutation.mutate(newInventoryList);
        } else if(props.type === 'Recurring') {
            props.updateJobInventoryExternally(item, addAndContinueRef.current);

            // If Add & Next was clicked, reset the form
            if (addAndContinueRef.current && !props.jobInventoryItem) {
                // Reset form values
                form.reset();
                // Clear selected asset
                setSelectedProduct(null);

                // Reset addAndContinueRef to false for next submission
                addAndContinueRef.current = false;
            }

            // Set isSubmitting to false for external saves
            setIsSubmitting(false);
        }
    }

    const onAssetSave = (result) => {
        //saveItem();
        onAssetChanged(result);
        setShowCreateNewAsset(false);
        setTransferAsset(null);
        // setTriggerNewProduct(true);
    };

    const onAssetChanged = (result) => {
        setSelectedProduct(result);
        const value = {
            ProductNumber: '',
            SerialNumber: '',
            PurchaseDate: '',
            WarrantyPeriod: 0,
            PurchaseAmount: 0,
            InvoiceNumber: '',
            product: result
        }
        if (result) {
            for (const key in result) {
                if (form.values.hasOwnProperty(key)) {
                    value[key] = result[key]
                }
            }
        }
        form.setValues(value)
    };

    const onEditAsset = () => {
        setAssetToEdit(selectedProduct);
        setShowCreateNewAsset(true);
    }

    return <>



        <form onSubmit={form.onSubmit(handleSubmit)}>

            <Flex justify={"flex-start"}>
                <SCCheckbox onChange={() => setTransferable(!transferable)}
                    value={transferable ? 'yes' : ''}
                    extraClasses="no-margin"
                    label="Show assets for all customers"
                    disabled={!props.job.CustomerID || !props.job.CustomerContactID}
                />

                <div style={{ marginLeft: "2rem" }}>
                    <SCCheckbox onChange={() => updateFilterOnLocation(!filterOnLocation)}
                        value={!!props.job.LocationID && filterOnLocation ? 'yes' : ''}
                        extraClasses="no-margin"
                        label="Filter by job location"
                        disabled={!props.job.LocationID}
                    />
                </div>
            </Flex>

            {typeof filterOnLocation !== "undefined" && <Flex style={{ position: 'relative' }}>
                <div style={{ flexGrow: 1 }}>
                    <AssetSelector
                        icon={
                            selectedProduct && <WarrantyIndicator purchaseDate={selectedProduct.PurchaseDate}
                                warrantyPeriod={selectedProduct.WarrantyPeriod} />
                        }
                        onTransferAsset={(asset) => setTransferAsset(asset)}
                        w={'100%'}
                        onAddNewAsset={() => setShowCreateNewAsset(true)}
                        selectedAsset={selectedProduct}
                        setSelectedAsset={onAssetChanged}
                        triggerEdit={triggerEditProduct}
                        setTriggerEdit={setTriggerEditProduct}
                        customerID={props.job.CustomerID}
                        contactID={props.job.CustomerContactID || props.job.ContactID}
                        locationID={props.jobQueryData.LocationID}
                        onSave={onAssetSave}
                        isRequired={true}
                        transferable={transferable}
                        setTransferable={setTransferable}
                        // error={null}
                        accessStatus={props.accessStatus}
                        ignoreIDs={getIgnoreIDs() as any}
                        module={jobCardModule}
                        error={form.getInputProps('product').error}
                        {...form.getInputProps('product')}
                        useLocationFilter={!!props.job.LocationID && filterOnLocation}
                    />
                </div>
                {
                    /*selectedProduct &&
                    <div style={{
                        /!*position: 'absolute',
                        top: 45,
                        right: 0*!/
                        marginTop: 34
                    }}>
                        <WarrantyIndicator purchaseDate={selectedProduct.PurchaseDate} warrantyPeriod={selectedProduct.WarrantyPeriod} />

                    </div>*/
                }
            </Flex> || <div style={{height: 67.2}}></div>}


            {/*

            <Group gap={'xs'} grow>
                <SCInput
                    label="Asset/Serial Number"
                    // value={productNumber}
                    disabled={true}
                    {...form.getInputProps('ProductNumber')}

                />

                <SCInput
                    label="Other Number"
                    // value={serialNumber}
                    // error={inputErrors.SerialNumber}
                    disabled={true}
                    {...form.getInputProps('SerialNumber')}

                />
            </Group>

            <Group gap={'xs'} grow>
                <SCDatePicker
                    label='Purchase Date'
                    // value={purchaseDate}
                    // error={inputErrors.PurchaseDate}
                    disabled={true}
                    {...form.getInputProps('PurchaseDate')}

                />

                <ScNumberControl
                    label="Warranty Period"
                    // value={warrantyPeriod}
                    disabled={true}
                    {...form.getInputProps('WarrantyPeriod')}

                    min={0}
                    // format={Enums.NumericFormat.Integer}
                />
            </Group>

            <Group gap={'xs'} grow>

                <ScNumberControl
                    label='Purchase Amount'
                    // value={purchaseDate}
                    // error={inputErrors.PurchaseDate}
                    disabled={true}
                    {...form.getInputProps('PurchaseAmount')}

                />

                <SCInput
                    label="Invoice Number"
                    // value={invoiceNumber}
                    // error={inputErrors.InvoiceNumber}
                    disabled={true}
                    {...form.getInputProps('InvoiceNumber')}

                />
            </Group>
*/}

            <Group mt={'7.6rem'} justify={'right'} gap={0}>
                <Button type={'button'} variant={'subtle'} color={'gray.9'} onClick={() => props.onClose()} disabled={isSubmitting} mr={'xs'}>
                    Cancel
                </Button>
                <Button color={'scBlue'}
                    type={'button'}
                    variant={'light'}
                    hidden={!selectedProduct}
                    onClick={onEditAsset}
                    disabled={!hasProductPermission || isSubmitting}
                    mr={'xs'}
                >
                    Edit
                </Button>
                {/* Only show Add & Next button when adding a new item */}
                {!props.jobInventoryItem && (
                    <Button
                        type={'button'}
                        onClick={() => {
                            addAndContinueRef.current = true;
                            form.onSubmit(handleSubmit)();
                        }}
                        disabled={!props.job.CustomerID || !props.job.CustomerContactID || isSubmitting}
                        loading={isSubmitting}
                        variant={'outline'}
                        mr={5}
                    >
                        Add & Next
                    </Button>
                )}
                <Button 
                    color={'scBlue'} 
                    type={'button'} 
                    onClick={() => {
                        addAndContinueRef.current = false;
                        form.onSubmit(handleSubmit)();
                    }}
                    disabled={!props.job.CustomerID || !props.job.CustomerContactID || isSubmitting}
                    loading={isSubmitting}
                >
                    {!!props.jobInventoryItem ? 'Update' : 'Add'}
                </Button>
            </Group>
        </form>

        <AssetModal
            assetCreated={(asset) => onAssetSave(asset)}
            show={showCreateNewAsset}
            onClose={() => {
                setShowCreateNewAsset(false)
                setAssetToEdit(null)
            }}
            accessStatus={props.accessStatus}
            job={props.jobQueryData}
            editAsset={assetToEdit}
            previousHeader={props.previousHeader}
        />

        {
            !!transferAsset &&
            <TransferAssetModal
                onAssetTransferred={(asset) => {
                    onAssetSave(asset?.Product || null);
                }}
                show={!!transferAsset}
                onClose={() => setTransferAsset(null)}
                accessStatus={props.accessStatus}
                job={props.job}
                transferAsset={transferAsset}
                module={jobCardModule}
                previousHeader={props.previousHeader}
            />
        }
    </>
}

export default AddAssetItemForm
