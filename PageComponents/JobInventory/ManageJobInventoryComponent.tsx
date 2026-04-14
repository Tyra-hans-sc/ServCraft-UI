import { FC, useContext, useEffect, useMemo, useState } from 'react';
import jobInventoryService from '@/services/job/job-inventory-service';
import permissionService from '@/services/permission/permission-service';
import workflowService from '@/services/workflow/workflow-service';
import ToastContext from '@/utils/toast-context';
import * as Enums from '@/utils/enums';
import { colors, layout } from '@/theme';
import constants from '@/utils/constants';
import ConfirmAction from '@/components/modals/confirm-action';
import helper from '@/utils/helper';
import { Anchor, Flex, Text, Button, Loader, Box } from '@mantine/core';
import styles from "@/components/job/job.module.css";
import storage from '@/utils/storage';
import { IconPlus, IconPrinter } from '@tabler/icons-react';
import AddInventoryItemModal from '../Inventory/AddInventoryItemModal';
import { reorder } from 'react-reorder';
import { useMutation, useQuery } from '@tanstack/react-query';
import DownloadService from "@/utils/download-service";
import { showNotification } from "@mantine/notifications";
import AddBundleModal from "@/PageComponents/Inventory/AddBundleModal";
import MaterialsSectionTable from '../SectionTable/Section Component Tables/MaterialsSectionTable';
import MaterialsSimpleTable from "@/PageComponents/SectionTable/Section Component Tables/MaterialsOldSimpleTable";
import featureService from '@/services/feature/feature-service';
import { useRouter } from 'next/router';
import warehouseService from '@/services/warehouse/warehouse-service';
import { Warehouse } from '@/interfaces/api/models';


export const useJobInventoryState: (job: any, setJob: (newJob: any) => void, getJobValue: () => any) => [any[], any[], (rowVersion: any, jobInventory: any[], stockItemStatus: number | undefined) => void] = (job, setJob, getJobValue) => {
    const getJobInventoryForStockItemStatus = (stockItemStatus) => {

        let jobTemp = { ...getJobValue() };

        if (!jobTemp || !jobTemp.JobInventory) return [];
        return [...jobTemp.JobInventory].filter(x => x.StockItemStatus === stockItemStatus).map(x => ({ ...x })).sort((a, b) => +a.LineNumber - +b.LineNumber);
    }

    const [jobInventoryUsed, setJobInventoryUsed] = useState(getJobInventoryForStockItemStatus(Enums.StockItemStatus.ItemUsed));
    const [jobInventoryWorkedOn, setJobInventoryWorkedOn] = useState(getJobInventoryForStockItemStatus(Enums.StockItemStatus.WorkedOn));

    useEffect(() => {
        let used = getJobInventoryForStockItemStatus(Enums.StockItemStatus.ItemUsed);
        if (JSON.stringify(used) !== JSON.stringify(jobInventoryUsed)) {
            setJobInventoryUsed(used);
        }

        let workedOn = getJobInventoryForStockItemStatus(Enums.StockItemStatus.WorkedOn);
        if (JSON.stringify(workedOn) !== JSON.stringify(jobInventoryWorkedOn)) {
            setJobInventoryWorkedOn(workedOn);
        }

    }, [job.JobInventory]);

    const updateJobInventory = (rowVersion: any, jobInventory: any[], stockItemStatus: number | undefined) => {

        let jobTemp = { ...getJobValue() };

        let jobInventoryTemp = !!stockItemStatus ? [...jobTemp.JobInventory].filter(x => x.StockItemStatus !== stockItemStatus) : [];

        jobInventory.forEach(ji => {
            jobInventoryTemp.push(ji);
        });

        jobTemp.JobInventory = jobInventoryTemp;
        jobTemp.RowVersion = !!rowVersion ? rowVersion : jobTemp.RowVersion;

        setJob(jobTemp);
    };

    return [jobInventoryUsed, jobInventoryWorkedOn, updateJobInventory];
}


const ManageJobInventoryComponent: FC<{
    jobInventoryUsed: any[]
    jobInventoryWorkedOn: any[]
    stockItemStatus: number
    job: any
    fromCreateJob: boolean
    fromStatusChange: boolean
    onUpdate: (rowVersion: any, jobInventory: any[], stockItemStatus: number | undefined) => void
    accessStatus: number
    customerZone: boolean
    inputErrors: any
    allowNonEmployee: boolean
    onCreateInvoice?: () => void
    onSavingItems?: (isSaving: boolean) => void
    formIsDirty?: boolean
}> = (props) => {

    const router = useRouter();
    // const [useNewTable, setUseNewTable] = useLocalstorageState('useNewSectionTable', false)
    // const [useNewTable, setUseNewTable] = useState<boolean | null>(null);

    /*useEffect(() => {
        featureService.getFeature(constants.features.INVENTORY_SECTION_BUNDLE).then(feature => {
            setUseNewTable(!!feature);
        });
    }, []);*/

    const toastCtx = useContext(ToastContext);
    const [jobInventory, setJobInventory] = useState<any[]>(props.stockItemStatus === Enums.StockItemStatus.ItemUsed ? props.jobInventoryUsed : props.stockItemStatus === Enums.StockItemStatus.WorkedOn ? props.jobInventoryWorkedOn : []);
    const [manageItemsUsedPermission] = useState((props.fromCreateJob || props.fromStatusChange || permissionService.hasPermission(Enums.PermissionName.EditJob))
        && (props.stockItemStatus !== Enums.StockItemStatus.ItemUsed || permissionService.hasPermission(Enums.PermissionName.ManageItemsUsed)));
    const [manageCostingPermission] = useState(permissionService.hasPermission(Enums.PermissionName.ManageCosting));
    const [hasEmployee, setHasEmployee] = useState(!props.customerZone && (props.allowNonEmployee || storage.hasCookieValue(Enums.Cookie.employeeID)) && !props.job.IsClosed);

    const [jobItemSelection, setJobItemSelection] = useState<number>(Enums.JobItemSelection.Disabled);
    const [jobItemOrder, setJobItemOrder] = useState<number>(Enums.JobItemOrder.Inventory);
    const [jobSingleItem, setJobSingleItem] = useState<boolean>(false);

    const [jobInventoryItemToEdit, setJobInventoryItemToEdit] = useState<any>();
    const [createJobInventoryItem, setCreateJobInventoryItem] = useState(false);
    const [createItemTableSectionItem, setCreateItemTableSectionItem] = useState(null);

    const [confirmOptions, setConfirmOptions] = useState(helper.initialiseConfirmOptions());
    const [hasAssets, setHasAssets] = useState(false);

    const [tableActionStates, setTableActionStates] = useState({})

    const [showAddBundleModal, setShowAddBundleModal] = useState(false)

    const [defaultWarehouse, setDefaultWarehouse] = useState<Warehouse | undefined>();

    // const refreshJobInventoryAndUpdateJob = async (rowVersion?: string | null, otherJobInventoryItems?: any[]) => {
    //     let jobInventoryResults = await jobInventoryService.getJobInventory(props.job.ID, props.stockItemStatus, toastCtx);

    //     let stockItemStatus: number | undefined = props.stockItemStatus;
    //     if (Array.isArray(otherJobInventoryItems) && otherJobInventoryItems.length > 0) {
    //         otherJobInventoryItems.forEach(ji => {
    //             jobInventoryResults.push(ji);
    //         })
    //         stockItemStatus = undefined;
    //     }

    //     props.onUpdate(rowVersion, jobInventoryResults, stockItemStatus);
    // }

    const refreshWorkflowInfo = async () => {
        const workflow = await workflowService.getWorkflow(props.job.WorkflowID, toastCtx);

        setJobItemSelection(workflow.JobItemSelection);
        setJobItemOrder(workflow.JobItemOrder);
        setJobSingleItem(workflow.SingleItem);
    }

    // useEffect(() => {
    //     if (props.fromCreateJob) return;
    //     refreshJobInventory();
    // }, [props.job.ID]);

    useEffect(() => {
        refreshWorkflowInfo();
    }, [props.job.WorkflowID]);

    useEffect(() => {
        if (props.stockItemStatus === Enums.StockItemStatus.ItemUsed) setJobInventory(props.jobInventoryUsed);
    }, [props.jobInventoryUsed]);

    useEffect(() => {
        if (props.stockItemStatus === Enums.StockItemStatus.WorkedOn) setJobInventory(props.jobInventoryWorkedOn);
    }, [props.jobInventoryWorkedOn]);

    useEffect(() => {
        setHasEmployee(!props.customerZone && (props.allowNonEmployee || storage.hasCookieValue(Enums.Cookie.employeeID)) && !props.job.IsClosed);
    }, [props.job.IsClosed]);

    useEffect(() => {
        checkHasAssets(jobInventory);
    }, [jobInventory]);

    const hasJobInventory = useMemo(() => {
        return jobInventory.length > 0;
    }, [jobInventory]);

    useEffect(() => {
        if (props.job.Vans && props.job.Vans.length > 0) {
            setDefaultWarehouse(props.job.Vans[0]);
        }
        else {
            warehouseService.getWarehouses(1000, undefined, undefined, Enums.WarehouseType.Warehouse).then(warehouses => {
                let match = warehouses.Results.find(x => x.StoreID === props.job.StoreID);
                setDefaultWarehouse(match);
            });
        }
    }, [props.job.StoreID, props.job.Vans]);

    const getLinkedProductIDs = () => {
        return jobInventory.filter(x => x.IsActive && x.ProductID).map(x => x.ProductID);
    };

    const checkHasAssets = (jobInv) => {
        if (jobInv.filter(x => x && x.IsActive && x.ProductID).length > 0) {
            setHasAssets(true);
        } else {
            setHasAssets(false);
        }
    };

    /*const createInvoice = () => {
        if (props.formIsDirty === true) {
            saveJobAlert("Please save the job before adding a new invoice.");
            return;
        }
        else {
            if (props.onCreateInvoice) {
                props.onCreateInvoice()
            } else {
                helper.nextRouter(router.push, `/invoice/create?module=${Enums.Module.JobCard}&moduleID=${props.job.ID}&customerID=${props.job.CustomerID}`);
            }
        }
    };

    const createPurchaseOrder = async () => {
        if (props.formIsDirty === true) {
            saveJobAlert("Please save the job before adding a new purchase order.");
            return;
        }
        else {
            helper.nextRouter(router.push, `/purchase/create?module=${Enums.Module.JobCard}&moduleID=${props.job.ID}&customerID=${props.job.CustomerID}`);
        }
    };*/

    const allocateMaterials = async () => {
        const results = await jobInventoryService.allocateMaterials(props.job.ID, props.stockItemStatus, toastCtx);

        if (!!results) {
            props.onUpdate(results.rowVersion, results.sortedResults, props.stockItemStatus);
        }
    };

    const unallocateMaterials = async () => {
        const results = await jobInventoryService.unallocateMaterials(props.job.ID, props.stockItemStatus, toastCtx);

        if (!!results) {
            props.onUpdate(results.rowVersion, results.sortedResults, props.stockItemStatus);
        }
    };

    const transferToItemsUsed = async (item) => {

        if (item.StockItemStatus === Enums.StockItemStatus.ItemUsed) return;

        setConfirmOptions({
            ...helper.initialiseConfirmOptions(),
            display: true,
            confirmButtonText: "Transfer",
            heading: "Confirm transfer to materials?",
            text: "The inventory item will moved to materials from customer assets.",
            onConfirm: async () => {
                // get used items from API
                let itemsUsed = [...props.jobInventoryUsed];
                // add this item to the used list
                item.StockItemStatus = Enums.StockItemStatus.ItemUsed;
                itemsUsed.push(item);
                // save the used item list
                const itemsUsedResult = props.fromCreateJob || props.fromStatusChange ? { rowVersion: undefined, sortedResults: itemsUsed } : await jobInventoryService.saveJobInventory(itemsUsed, props.job.ID, Enums.StockItemStatus.ItemUsed, toastCtx);

                if (!!itemsUsedResult) {

                    if (props.fromCreateJob || props.fromStatusChange) {
                        let itemsWorkedOn = [...props.jobInventoryWorkedOn];
                        let idx = itemsWorkedOn.findIndex(x => x.ID === item.ID);
                        if (idx > -1) {
                            itemsWorkedOn.splice(idx, 1);
                        }

                        // propagate the used item result and the worked on items with new job row version
                        props.onUpdate(itemsUsedResult.rowVersion, (itemsUsedResult.sortedResults).concat(itemsWorkedOn), undefined);
                    }
                    else {
                        // propagate the used item result with new job row version
                        let itemsWorkedOn = await jobInventoryService.getJobInventory(props.job.ID, props.stockItemStatus, toastCtx);

                        itemsUsedResult.sortedResults.forEach(ji => {
                            itemsWorkedOn.push(ji);
                        })

                        props.onUpdate(itemsUsedResult.rowVersion, itemsWorkedOn, undefined);
                    }

                    if (!!itemsUsedResult.rowVersion) {
                        (toastCtx as any).setToast({
                            message: 'Inventory item transferred successfully',
                            show: true,
                            type: 'success'
                        });
                    }
                }
            }
        });

    }

    const onReorder = async (event, previousIndex, nextIndex) => {

        let jobInventoryTemp = [...jobInventory];
        let item = jobInventoryTemp.splice(previousIndex, 1);
        jobInventoryTemp.splice(nextIndex, 0, item[0]);

        jobInventoryTemp.map((jobInv, i) => {
            jobInv.LineNumber = i + 1;
        });

        reorder(jobInventoryTemp, previousIndex, nextIndex);

        const results = props.fromCreateJob || props.fromStatusChange ? { rowVersion: undefined, sortedResults: jobInventoryTemp } : await jobInventoryService.saveJobInventory(jobInventoryTemp, props.job.ID, props.stockItemStatus, toastCtx);
        if (results !== null) {

            props.onUpdate(results.rowVersion, results.sortedResults, props.stockItemStatus);

        }
    };

    const handleDataUpdated = async (newItems, newSections) => {

        /*const inventorySections = newSections.map(x => ({
            ID: x.id,
            IsActive: true,
            Name: x.name || '',
            FromBundleID: null,
            HideLineItems: false,
            DisplaySubtotal: false,
            Module: Enums.Module.JobCard,
            ItemID: props.job.ID,
        }))*/

        // console.log('new sections', newSections, 'inventorySections', newSections, props.job)

        const results = props.fromCreateJob || props.fromStatusChange ? { rowVersion: undefined, sortedResults: newItems } : await jobInventoryService.saveJobInventory(newItems, props.job.ID, props.stockItemStatus, toastCtx/*, newSections*/);

        if (results !== null) {
            props.onUpdate(results.rowVersion, results.sortedResults, props.stockItemStatus);
        }
    }

    const removeJobInventoryItem = async (item, newSections?: any[]) => {
        setTableActionStates(p => ({ ...p, ['delete' + item.ID]: 'loading' }))

        let jobInventoryTemp = [...jobInventory];
        let index = jobInventoryTemp.findIndex(x => x.ID === item.ID);
        if (index > -1) {

            if (props.fromCreateJob) {
                jobInventoryTemp.splice(index, 1);
            }
            else {
                jobInventoryTemp[index].IsActive = false;
            }

            const results =
                props.fromCreateJob || props.fromStatusChange ? { rowVersion: undefined, sortedResults: jobInventoryTemp } :
                    await jobInventoryService.saveJobInventory(jobInventoryTemp, props.job.ID, props.stockItemStatus, toastCtx/*, newSections*/);
            if (results !== null) {

                // if (!!results.rowVersion && props.stockItemStatus === Enums.StockItemStatus.ItemUsed) {
                //     let tempWorkedOn = await jobInventoryService.getJobInventory(props.job.ID, Enums.StockItemStatus.WorkedOn, toastCtx);
                //     tempWorkedOn.forEach(jiwo => {
                //        results.sortedResults.push(jiwo);
                //     });
                //     props.onUpdate(results.rowVersion, results.sortedResults, undefined);
                // }
                // else {
                props.onUpdate(results.rowVersion, results.sortedResults, props.stockItemStatus);
                // }

                let messagePrefix = item.StockItemStatus === Enums.StockItemStatus.ItemUsed ? "Material/service" : item.StockItemStatus === Enums.StockItemStatus.WorkedOn ? "Customer asset" : "Unknown";

                if (!props.fromCreateJob && !props.fromStatusChange) {
                    (toastCtx as any).setToast({
                        message: `${messagePrefix} removed successfully`,
                        show: true,
                        type: 'success'
                    });
                    setTableActionStates(p => ({ ...p, ['delete' + item.ID]: 'none' }))
                }
            } else {
                setTableActionStates(p => ({ ...p, ['delete' + item.ID]: 'error' }))
                setTimeout(() => {
                    setTableActionStates(p => ({ ...p, ['delete' + item.ID]: 'none' }))
                }, 500)

            }
        }
    };

    const removeAllItemsUsedForCreateJob = () => {

        if (!props.fromCreateJob || props.stockItemStatus !== Enums.StockItemStatus.ItemUsed) return;

        // default to itemused stockitemstatus and it's create job
        props.onUpdate(undefined, [], Enums.StockItemStatus.ItemUsed);
    };

    const toggleManageJobInventoryItemModal = (item, index) => {
        if (props.accessStatus === Enums.AccessStatus.LockedWithAccess || props.accessStatus === Enums.AccessStatus.LockedWithOutAccess
            || !hasEmployee || props.job.IsClosed || !manageItemsUsedPermission) {
            return;
        }

        setJobInventoryItemToEdit(item);
    };

    // const handleQuantityRequestedChange = (item, value) => {
    //     // let value = parseFloat(e.target.value);
    //     if (value < 0 || helper.isNullOrUndefined(value)) {
    //         value = 0;
    //     } else {
    //         let temp = helper.countDecimals(value);
    //         if (temp >= 3) {
    //             value = value.toFixed(2);
    //         }
    //     }

    //     item.QuantityRequested = value;
    //     updateJobInventoryItem(item);
    // };

    // //???????
    // const updateJobInventoryItem = (item) => {
    //     let updatedList = [...job.JobInventory];
    //     let index = updatedList.findIndex(x => x.ID == item.ID);
    //     if (index > -1) {
    //         updatedList[index] = item;
    //         if (props.stockItemStatus === Enums.StockItemStatus.ItemUsed) {
    //             updateJob("JobInventory", updatedList, null, false);
    //         } else {
    //             updateJob("JobInventory", updatedList, null, true);
    //         }
    //     }
    // };

    /**
     * Individual item added/updated but manipulating a purely local collection, usually when creating a job
     * returns void
    */
    const updateJobInventoryExternally = (itemToUpdate, addAndContinue = false) => {
        // amend job inventories locally
        let jobInventoryTemp = [...jobInventory];
        let matchIdx = jobInventoryTemp.findIndex(x => x.ID === itemToUpdate.ID);

        if (matchIdx < 0) {
            jobInventoryTemp.push(itemToUpdate);
        }
        else {
            jobInventoryTemp[matchIdx] = itemToUpdate;
        }

        onJobInventoryItemsSaved(jobInventoryTemp, undefined, addAndContinue);
    }

    const saveJobAlert = (message) => {
        setConfirmOptions({
            ...helper.initialiseConfirmOptions(),
            display: true,
            heading: "Job has been modified",
            text: message,
            confirmButtonText: "OK",
            showCancel: false
        });
    }

    /**
     * Items already saved with API, returning row version and new full list of items, usually when auto saving or editing a job
     * returns void
    */
    const onJobInventoryItemsSaved = (newJobInventories, newJobRowVersion, addAndContinue = false) => {
        // bubble the update to the parent component
        props.onUpdate(newJobRowVersion, newJobInventories, props.stockItemStatus);

        // Only close the modal if we're not using "Add and Continue"
        if (!addAndContinue) {
            setJobInventoryItemToEdit(null)
            setCreateJobInventoryItem(false)
            setCreateItemTableSectionItem(null)
        }
    }

    const [loadingItems, setLoadingItems] = useState({})
    const jobLabelMutation = useMutation(['test'], (params: any) =>
        DownloadService.downloadFile('POST', '/Job/PrintJobBarcodeDocument', params, false, true,
            '', '', null, false, (() => {
                setLoadingItems(p => ({
                    ...p, [params.ItemIDs[0]]: 'none'
                }))
            }) as any),
        {
            onError: (error: Error, { ItemIDs }, context) => {
                showNotification(({
                    id: 'itemLabelDownload',
                    message: error.message,
                    autoClose: 3000,
                    color: 'yellow'
                }))
            }
        })

    const onPrintLabel = (item) => {
        if (item.StockItemStatus === Enums.StockItemStatus.WorkedOn && item.ProductID) {
            setLoadingItems(p => ({
                ...p, [item.ID]: 'loading'
            }))
            jobLabelMutation.mutate({
                BarcodeDocumentType: Enums.PrintLabelType.JobAsset,
                ItemIDs: [item.ID],
                Copies: 1,
            })
        }
    }

    const { data: lablePrintingAccess, isLoading: loadingLabelPrintingAccess } = useQuery(['jobLabelPrinting'], () => featureService.getFeature(constants.features.ASSET_LABEL_PRINTING))
    function renderCard(item, index) {

        const canTransferToUsed = item.StockItemStatus === Enums.StockItemStatus.WorkedOn && !item.ProductID;

        return (<>

            <Box className={styles.assetcard} >
                <div className={styles.assetcontent} title={item.InventoryDescription} onClick={() => toggleManageJobInventoryItemModal(item, index)}>
                    <div className={styles.assetheading} >{item.ProductID ? "Asset" : "Inventory"}</div>
                    <div>{item.ProductID ? item.ProductNumber : item.InventoryCode}</div>
                    <div>{item.InventoryDescription}</div>
                    <div>{item.ProductID ? "" : `Qty: ${item.QuantityRequested}`}</div>
                </div>
                {props.accessStatus !== Enums.AccessStatus.LockedWithAccess && props.accessStatus !== Enums.AccessStatus.LockedWithOutAccess && hasEmployee && !props.job.IsClosed && manageItemsUsedPermission ? <div className={styles.deletebutton} >
                    {
                        // helper.getHasNewFeatureAccess('jobLabelPrinting' as any) && !!item.ProductID &&
                        !loadingLabelPrintingAccess && lablePrintingAccess && !!item.ProductID &&
                        <>{
                            loadingItems[item.ID] === 'loading' ? <Loader size={14} color={'gray'} /> :
                                <IconPrinter color={'var(--mantine-color-gray-5)'} onClick={() => onPrintLabel(item)} size={16} />
                        }</>
                    }
                    {canTransferToUsed ? <img src="/icons/arrow-down.svg" alt="transfer to materials" height={16} onClick={() => transferToItemsUsed(item)} title="Transfer to materials" /> : <></>}
                    <img src="/icons/trash-bluegrey.svg" alt="delete" height={16} onClick={() => removeJobInventoryItem(item)} title="Delete" />

                </div> : ''}
            </Box>

        </>);
    }

    function renderCardView() {
        return <>
            <Flex wrap={'wrap'} gap={{ base: 'xs', xxs: 'sm' }}>
                {jobInventory.filter(x => x.IsActive === true).map((item, index) => {
                    return renderCard(item, index);
                })}
                {
                    (!jobSingleItem || !hasJobInventory) && hasEmployee && !props.job.IsClosed &&
                    ((!!jobItemSelection && jobItemSelection !== Enums.JobItemSelection.Disabled) || props.stockItemStatus !== Enums.StockItemStatus.WorkedOn) &&
                    <Box
                        className={styles.assetcard}
                        onClick={() => setCreateJobInventoryItem(true)}
                    >
                        <Flex h={'100%'} align={'center'} justify={'center'} c={'scBlue'} gap={5}>
                            <IconPlus size={16} />
                            <Anchor size={'sm'} className={styles.assetCardAddText}> Add Customer Asset
                            </Anchor>
                        </Flex>
                    </Box>
                }
            </Flex>
        </>;
    }

    return (<>


        <div className={hasJobInventory && false ? "inventory-container" : "inventory-container-no-border"}>
            {/*<div className="row">
                {hasJobInventory &&
                    <Flex align={'center'} gap={'xs'} mb={10}>
                        <Text size={'md'} fw={600}>
                            {props.stockItemStatus === Enums.StockItemStatus.WorkedOn ? 'Customer Assets' : 'Materials / Services'}
                        </Text>
                    </Flex>
                }
            </div>*/}
            <div>
                {props.stockItemStatus === Enums.StockItemStatus.ItemUsed ? <>
                    <div className="table-container" >
                        <MaterialsSectionTable
                            filteredJobInventory={jobInventory}
                            inlineQuantityEditEnabled={true}
                            handleQuantityChange={(item, value) => {
                                alert("figure out implementation here before you go");
                                //handleQuantityRequestedChange(item, value)
                            }}
                            hasAssets={hasAssets}
                            // onReorder={onReorder}
                            onDataUpdate={handleDataUpdated}
                            onItemClicked={(item, index) => toggleManageJobInventoryItemModal(item, index)}
                            onRemoveItem={(item, newSections) => removeJobInventoryItem(item, newSections)}
                            onAddItemToSection={(section) => {
                                setCreateJobInventoryItem(true)
                                setCreateItemTableSectionItem(section)
                            }}
                            permissionToUpdateItems={props.accessStatus !== Enums.AccessStatus.LockedWithAccess && props.accessStatus !== Enums.AccessStatus.LockedWithOutAccess && hasEmployee && !props.job.IsClosed && manageItemsUsedPermission}
                            onAddItem={() => {
                                if (props.formIsDirty === true) {
                                    saveJobAlert("Please save the job before adding a new item.");
                                }
                                else {
                                    setCreateJobInventoryItem(true);
                                }

                            }}
                            onAddBundle={() => {
                                if (props.formIsDirty === true) {
                                    saveJobAlert("Please save the job before adding a new bundle.");
                                }
                                else {
                                    setShowAddBundleModal(true);
                                }
                            }}
                            // onCreateInvoice={createInvoice}
                            // onCreatePurchaseOrder={createPurchaseOrder}
                            tableActionStates={tableActionStates}
                            itemId={props.job.ID}
                            onAllocateMaterials={() => allocateMaterials()}
                            onUnallocateMaterials={() => unallocateMaterials()}
                            isCreateJob={props.fromCreateJob}
                            jobIsOpen={props.job?.IsClosed !== true}
                            onSavingItems={props.onSavingItems}
                        />
                    </div>
                </> :
                    props.stockItemStatus === Enums.StockItemStatus.WorkedOn ? <>
                        {renderCardView()}
                    </>
                        : ""
                }
            </div>

            {(!jobSingleItem || !hasJobInventory) && hasEmployee && !props.job.IsClosed &&
                ((!!jobItemSelection && jobItemSelection !== Enums.JobItemSelection.Disabled) || props.stockItemStatus !== Enums.StockItemStatus.WorkedOn)
                ? <>
                    <div className="row">

                        {props.fromCreateJob && props.stockItemStatus === Enums.StockItemStatus.ItemUsed && hasJobInventory &&
                            <Button
                                color={'yellow'}
                                disabled={props.accessStatus === Enums.AccessStatus.LockedWithAccess || props.accessStatus === Enums.AccessStatus.LockedWithOutAccess || !manageItemsUsedPermission}
                                style={{
                                    border: props.inputErrors.JobInventory ? `1px solid ${colors.errorOrange}` : '',
                                    marginTop: "0.5rem"
                                }}
                                leftSection={<span><img src="/specno-icons/clear.svg" height={16} style={{ filter: "brightness(10000%)" }} /></span>}
                                onClick={() => removeAllItemsUsedForCreateJob()}
                            >
                                Remove All
                            </Button>}

                    </div>
                    {props.inputErrors.JobInventory ? <div className="row">
                        <Text color={"yellow.6"} size={"xs"}>Cannot be an empty list</Text>
                    </div> : ""}
                </> : ''}

            {createJobInventoryItem || !!jobInventoryItemToEdit ?
                <>
                    <AddInventoryItemModal
                        useSectionTable
                        isNew={createJobInventoryItem}
                        jobInventoryItem={jobInventoryItemToEdit}
                        show={createJobInventoryItem || !!jobInventoryItemToEdit}
                        updateJobInventoryExternally={(updatedItem, addAndContinue) => updateJobInventoryExternally(updatedItem, addAndContinue)}
                        onClose={() => {
                            setJobInventoryItemToEdit(null)
                            setCreateJobInventoryItem(false)
                            setCreateItemTableSectionItem(null)
                        }}
                        job={props.job}
                        jobQueryData={props.job}
                        accessStatus={props.accessStatus}
                        jobSingleItem={props.stockItemStatus === Enums.StockItemStatus.WorkedOn && jobSingleItem}
                        linkedProductIDs={getLinkedProductIDs()}
                        type="Job"
                        jobItemSelection={jobItemSelection}
                        jobItemOrder={jobItemOrder}
                        filteredStockItemStatus={props.stockItemStatus}
                        jobInventoryList={jobInventory}
                        onJobInventoryItemsSaved={(newJobInventories, newJobRowVersion, addAndContinue) => {
                            onJobInventoryItemsSaved(newJobInventories, newJobRowVersion, addAndContinue)
                        }}
                        selectMode={jobItemSelection === Enums.JobItemSelection.Inventory ? 'inventory' : jobItemSelection === Enums.JobItemSelection.Asset ? 'asset' : 'both'}
                        fromCreateJob={props.fromCreateJob}
                        fromStatusChange={props.fromStatusChange}
                        tableSectionItem={createItemTableSectionItem}
                    />
                </>

                : ''}

            <AddBundleModal
                onSaveNewListExternally={(newItems) => onJobInventoryItemsSaved(newItems, undefined, true)}
                show={showAddBundleModal}
                onClose={() => setShowAddBundleModal(false)}
                jobQueryData={props.job}
                accessStatus={props.accessStatus}
                type="Job"
                filteredStockItemStatus={props.stockItemStatus}
                jobInventoryList={jobInventory}
                onJobInventoryItemsSaved={(newJobInventories, newJobRowVersion) => {
                    onJobInventoryItemsSaved(newJobInventories, newJobRowVersion, true)
                }}
                fromCreateJob={props.fromCreateJob}
                fromStatusChange={props.fromStatusChange}
                storeID={props.job.StoreID}
                warehouse={defaultWarehouse}
            />

            <ConfirmAction
                options={confirmOptions}
                setOptions={setConfirmOptions} />


        </div>

        <style jsx>{`

        .inventory-container {
          padding: 0.25rem; 
          border: 1px solid ${colors.mantineBorderGrey};
          border-radius: ${layout.bodyRadius};
          margin-top: 1rem;
          max-width: calc(${constants.maxFormWidth} - 0.5rem - 2px);
        }

        .inventory-container-no-border {
          margin-top: 1rem;
          max-width: calc(${constants.maxFormWidth} - 0.5rem);
        }

        .row {
          display: flex;
          justify-content: space-between;
        }
        .column {
          display: flex;
          flex-basis: 0;
          flex-direction: column;
          flex-grow: 1;
        }
        .column + .column {
          margin-left: 1.25rem;
        }
        .container {
          width: 100%;
          display: flex;
          flex-direction: column;
        }
        .table-container {
          overflow-x: auto;
          width: 100%;
          display: flex;
          flex-direction: column;
        }
        .table {
          border-collapse: collapse;
          margin-top: 0.5rem;
          width: 100%;
        }
        .table thead tr {
          background-color: ${colors.backgroundGrey};
          height: 2rem;
          border-radius: ${layout.cardRadius};
          width: 100%;
        }
        .table th {
          color: ${colors.darkPrimary};
          font-size: 0.75rem;
          font-weight: normal;
          padding: 4px 1rem 4px 0; 
          position: relative;
          text-align: left;
          text-transform: uppercase;
          transform-style: preserve-3d;
          user-select: none;
          white-space: nowrap;
        }
        .table th.number-column {
          padding-right: 0;
          text-align: right;
        }
        .table th:last-child {
          padding-right: 1rem;
          text-align: right;
        }
        .table th:first-child {
          padding-left: 0.5rem;
          text-align: left;
        }
        .table .spacer {
          height: 0.75rem !important;
        }
        .table tr {
          height: 2rem;
        }
        .table td {
          font-size: 12px;
          padding-right: 1rem;
        }
        .table td.number-column {
          padding-right: 0;
          text-align: right;
        }
        .table tr:nth-child(even) td {
          background-color: ${colors.backgroundGrey}55;
        }
        .table td:last-child {
          border-radius: 0 ${layout.buttonRadius} ${layout.buttonRadius} 0;
          text-align: right;
        }
        .table td:last-child :global(div){
          margin-left: auto;
        }
        .table td:first-child {
          border-radius: ${layout.buttonRadius} 0 0 ${layout.buttonRadius};
          padding-left: 1rem;
          text-align: left;
        }
        .table td:first-child :global(div){
          margin-left: 0;
        }
        .header-item-move {
          width: 5%;
          min-width: 30px;
        }
        .header-item-code {
          width: 5%;
          min-width: 80px;
        }
        .header-item-serial {
          width: 10%;
          min-width: 200px;
        }
        .header-item-desc {
          min-width: 300px;
        }
        .header-item-type {
          min-width: 80px;
        }
        .header-item-qty {
          width: 100px;
          min-width: 100px;
        }
        .header-item-delete {
          width: 5%;
          min-width: 30px;
        }

        .body-item-move {
          cursor: move;
        }
        .body-item-code {
          color: ${colors.bluePrimary};
          cursor: pointer;
        }
        .body-item-serial {

        }
        .body-item-qty {
          text-align: right;
          min-width: 100px;
        }
        .error-text {
          color: ${colors.mantineErrorOrange()};
          font-size: 12px;
          line-height: 1.2;
        }
      `}</style>
    </>);
};

export default ManageJobInventoryComponent;
