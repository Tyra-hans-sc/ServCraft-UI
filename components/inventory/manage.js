import React, { useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/router';
import Fetch from '../../utils/Fetch';
import Helper from '../../utils/helper';
import * as Enums from '../../utils/enums';
import Attachments from '../shared-views/attachments';
import ItemComments from '../shared-views/item-comments';
import ToastContext from '../../utils/toast-context';
import Breadcrumbs from '../breadcrumbs';
import Tabs from '../tabs';
import AuditLog from '../shared-views/audit-log';
import IntegrationService from '../../services/integration-service';
import InventoryItemForm from "../../PageComponents/Inventory/InventoryItemForm";
import { Box, Button, Card, Flex, Tooltip, Text } from "@mantine/core";
import { useElementSize } from "@mantine/hooks";
import ToolbarButtons from "../../PageComponents/Button/ToolbarButtons";
import { IconArrowBackUp, IconDeviceFloppy, IconSend } from "@tabler/icons-react";
import AlertIcon from "../../PageComponents/Icons/AlertIcon";

function ManageInventory({ isNew, manageInventory, inventoryCategory, inventorySubcategory, accessStatus }) {

    /*const [showCreateCategoryModal, setShowCreateCategoryModal] = useState(false);
    const [showCreateSubcategoryModal, setShowCreateSubcategoryModal] = useState(false);
    const [showCreateSupplierModal, setShowCreateSupplierModal] = useState(false);*/

    const [inventory, setInventory] = useState(isNew ? {
        Code: '',
        Description: '',
        WarrantyPeriod: 0,
        WebForm: false,
        Quantity: 0,
        CostPrice: 0,
        ListPrice: 0,
        CommissionPercentage: 0,
        BinLocation: '',
        IsActive: true,
    } : manageInventory);

    /*const [formIsDirty, setFormIsDirty] = useState(false);
    const [confirmOptions, setConfirmOptions] = useState(Helper.initialiseConfirmOptions());*/

    // Helper.preventRouteChange(formIsDirty, setFormIsDirty, setConfirmOptions, saveInventory, );

    // const [inputErrors, setInputErrors] = useState({});

    const toast = useContext(ToastContext);

    /*const updateInventory = (field, value) => {
        let temp = { ...inventory };
        temp[field] = value;
        setInventory(temp);
        setFormIsDirty(true);
    };*/

    /*const handleInputChange = (e) => {
        let name = e.name;
        let value = e.value;

        switch (name) {
            case "WarrantyPeriod":
                value = Helper.convertToUnsignedValue(value);
                break;
            case "CostPrice":
            case "ListPrice":
            case "CommissionPercentage":
                value = Helper.convertToDecimalValue(value, 2, false);
                break;
            case "Quantity":                
                value = Helper.convertToDecimalValue(value, 2, true);                
                break;
        }

        updateInventory([name], value);
    };*/

    useEffect(() => {
        if (!isNew) {
            getCounts();
            //getSubcategory();
            // getSupplier();
            // getStockItemType();
            // fetchComments();
            getIntegration();
        }
    }, []);

    // CATEGORIES

    // const [selectedCategory, setSelectedCategory] = useState(inventoryCategory ? inventoryCategory : undefined);

    // SUBCATEGORIES

    // const [selectedSubcategory, setSelectedSubcategory] = useState(inventorySubcategory ? inventorySubcategory : undefined);

    /*const getSubcategory = async () => {
        if (inventory.InventorySubcategoryID) {
            const result = await Fetch.get({
                url: `/InventorySubcategory?id=${inventory.InventorySubcategoryID}`
            });
            setSelectedSubcategory(result);
        }
    };*/

    // STOCK ITEM TYPE

    // let stockItemTypes = Enums.getEnumItems(Enums.StockItemType);
    // const [selectedStockItemType, setSelectedStockItemType] = useState();

    /*const handleStockItemTypeChange = (value) => {
        setSelectedStockItemType(value);
        setFormIsDirty(true);
    };*/

    /*const getStockItemType = () => {
        setSelectedStockItemType(Enums.getEnumStringValue(Enums.StockItemType, inventory.StockItemType));
    };*/

    // SUPPLIER

    // const [selectedSupplier, setSelectedSupplier] = useState();

    /*const getSupplier = async () => {
        if (inventory.SupplierID) {            
            const supplierResult = await Fetch.get({
                url: `/Supplier/${inventory.SupplierID}`
            });
            setSelectedSupplier(supplierResult);
        }
    };*/

    /* const inventoryDetails = () => {
         return (
             <>
                 <CreateNewCategoryModal show={showCreateCategoryModal}
                                         onClose={() => setShowCreateCategoryModal(false)}
                                         inventoryCategoryCreated={
                                             (e) => {
                                                 setSelectedCategory(e);
                                                 setShowCreateCategoryModal(false);
                                             }
                                         }
                 />
 
                 <CreateNewSubcategoryModal
                     show={showCreateSubcategoryModal}
                     onClose={() => setShowCreateSubcategoryModal(false)}
                     inventorySubcategoryCreated={
                         (e) => {
                             setSelectedSubcategory(e);
                             setShowCreateSubcategoryModal(false);
                         }
                     }
                     defaultInventoryCategory={selectedCategory}
                 />
 
                 <CreateNewSupplierModal
                     show={showCreateSupplierModal}
                     onClose={() => setShowCreateSupplierModal(false)}
                     supplierCreated={
                         (e) => {
                             setSelectedSupplier(e);
                             setShowCreateSupplierModal(false);
                         }
                     }
                     isNew
                     supplier={selectedSupplier}
                 />
 
                 {isNew ?                    
                     <div className="heading">Inventory</div>
                     : ''
                 }
                 <div className="row">
                     <div className="column">
                         <SCInput 
                             name="Code"
                             label={isNew ? 'Code (Leave blank to auto generate)' : 'Code'}
                             required={!isNew}
                             value={inventory.Code}
                             onChange={handleInputChange}
                             error={inputErrors.Code}
                         />
                     </div>
                     <div className="column">
                         <SCInput 
                             name="Description"
                             label="Description"
                             required={true}
                             value={inventory.Description}
                             onChange={handleInputChange}
                             error={inputErrors.Description}
                             cypress="data-cy-description"
                         />
                     </div>
                 </div>
                 <div className="row">
                     <div className="column">
                         <InventoryCategorySelector selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} 
                             required={true} error={inputErrors.InventoryCategory} accessStatus={accessStatus} cypress="data-cy-category"
                                                    onCreateNewCategory={() => setShowCreateCategoryModal(true)}
                         />
                     </div>
                     <div className="column">
                         <InventorySubcategorySelector selectedSubcategory={selectedSubcategory} setSelectedSubcategory={setSelectedSubcategory} selectedCategory={selectedCategory} 
                             required={true} error={inputErrors.InventorySubcategory} accessStatus={accessStatus} cypress="data-cy-subcategory"
                                                       onCreateNewInventorySubcategory={() => setShowCreateSubcategoryModal(true)}
                         />
                     </div>
                 </div>
                 <div className="row">
                     <div className="column">
                         <SCDropdownList 
                             name="StockItemType"
                             options={stockItemTypes}
                             value={selectedStockItemType}
                             label="Stock Item Type"
                             required={true}
                             error={inputErrors.StockItemType}
                             onChange={handleStockItemTypeChange}
                             cypress="data-cy-item-type"
                         />
                     </div>
                     <div className="column">
                         <SCNumericInput 
                             name="WarrantyPeriod"
                             label="Warranty period"
                             required={true}
                             onChange={handleInputChange}
                             value={inventory.WarrantyPeriod}
                             error={inputErrors.WarrantyPeriod}
                             cypress="data-cy-warranty"
                             min={0}
                             signed={false}
                             format={Enums.NumericFormat.Integer}
                         />
                     </div>
                 </div>
                 <div className="row">
                     <div className="column">
                         <SCNumericInput 
                             name="Quantity"
                             label="Quantity"
                             required={true}
                             onChange={handleInputChange}
                             value={inventory.Quantity}
                             error={inputErrors.Quantity}
                             cypress="data-cy-quantity"
                             min={0}
                             format={Enums.NumericFormat.Decimal}
                         />
                     </div>
                     <div className="column">
                         <SupplierSelector selectedSupplier={selectedSupplier} setSelectedSupplier={setSelectedSupplier} error={inputErrors.Supplier} accessStatus={accessStatus}
                                           onCreateNewSupplier={() => setShowCreateSupplierModal(true)}
                         />
                     </div>
                 </div>
                 <div className="row">
                     <div className="column">
                         <SCNumericInput 
                             name="CostPrice"
                             label="Cost Price"
                             required={true}
                             onChange={handleInputChange}
                             value={inventory.CostPrice}
                             error={inputErrors.CostPrice}
                             format={Enums.NumericFormat.Currency}
                             cypress="data-cy-cost-price"
                             min={0}
                             signed={false}
                         />
                     </div>
                     <div className="column">
                         <SCNumericInput 
                             name="ListPrice"
                             label="List Price"
                             required={true}
                             onChange={handleInputChange}
                             value={inventory.ListPrice}
                             error={inputErrors.ListPrice}
                             format={Enums.NumericFormat.Currency}
                             cypress="data-cy-list-price"
                             min={0}
                             signed={false}
                         />
                     </div>
                 </div>
                 <div className="row">
                     <div className="column">
                         <SCNumericInput 
                             name="CommissionPercentage"
                             label="Commission Percentage"
                             required={true}
                             onChange={handleInputChange}
                             value={inventory.CommissionPercentage}
                             error={inputErrors.CommissionPercentage}
                             format={Enums.NumericFormat.Percentage}
                             signed={false}
                             min={0}
                         />
                     </div>
                     <div className="column">
                         <SCInput 
                             name="BinLocation"
                             label="Bin Location"
                             value={inventory.BinLocation}
                             onChange={handleInputChange}
                             error={inputErrors.BinLocation}
                         />
                     </div>
                 </div>
                 <div className="row margin-top">
                     <div className="column">
                         <SCSwitch 
                             name="WebForm" 
                             onLabel="Web Form Searchable" 
                             offLabel="Web Form Searchable" 
                             checked={inventory.WebForm}
                             onChange={() => handleInputChange({ name: 'WebForm', value: !inventory.WebForm })}
                         />
                     </div>
                     {!isNew ?
                         <div className="column switch">
                             <SCSwitch 
                                 name="IsActive" 
                                 onLabel="Active" 
                                 offLabel="Active" 
                                 checked={inventory.IsActive}
                                 onChange={() => handleInputChange({ name: "IsActive", value: !inventory.IsActive })}
                             />
                         </div> : ''
                     }
                 </div>
 
                 {/!*{isNew ?
                     <div className="row">
                         <div className="column">
                             
                         </div>
                         <div className="column">
                             <div className="actions">
                                 <Button text="Create" extraClasses="auto" onClick={saveInventory} disabled={saving} />
                                 <Button text="Cancel" extraClasses="hollow auto" onClick={cancel} />
                             </div>
                             <Space h={50} />
                         </div>
                     </div> : ''
                 }*!/}
 
                 {isNew ? '' : 
                     <div className="comments-and-history">
                         <ItemComments
                             itemID={manageInventory.ID}
                             module={Enums.Module.Inventory}
                             storeID={manageInventory.StoreID}
 
                             // comments={comments}
                             // handleCommentChange={handleCommentChange}
                             // newComment={newComment}
                             // submitComment={saveComment}
                             // submitting={saving}
                             // canLoadMoreComments={canLoadMoreComments}
                             // loadMoreComments={loadMoreComments}
                         />
 
                         <AuditLog recordID={inventory.ID} retriggerSearch={auditToggle} />
                     </div>
                 }
                 
                 <style jsx>{`
                     .row {
                         display: flex;
                     }
                     .column {
                         display: flex;
                         flex-direction: column;
                         width: ${layout.inputWidth};
                     }
                     .column + .column {
                         margin-left: 1.25rem;
                     }
                     .margin-top {
                         margin-top: 1rem;
                     }
                     .actions {
                         display: flex;
                         flex-direction: row-reverse;
                     }
                     .actions :global(.button){
                         margin-left: 0.5rem;
                         margin-top: 1rem;
                         padding: 0 1rem;
                         white-space: nowrap;
                     }
                     .comments-and-history {
                         padding-right: 3rem;
                     }
                     .switch {
                         flex-direction: row-reverse;
                     }
                 `}</style>
             </>
         );
     };*/

    // COMMENTS  

    // const [comments, setComments] = useState([]);
    // const [commentsPage, setCommentsPage] = useState(0);
    // const [canLoadMoreComments, setCanLoadMoreComments] = useState(false);

    // const loadMoreComments = () => {
    //     setCommentsPage(commentsPage + 1);
    //     fetchComments(comments, commentsPage + 1)
    // };

    // const handleCommentChange = (e) => {
    //     setNewComment(e.target.value);
    // };

    // const [newComment, setNewComment] = useState('');

    // const submitComment = async () => {
    //     if (newComment.length != 0) {
    //         await Fetch.post({
    //         url: '/Comment',
    //         params: {
    //             ItemID: inventory.ID,
    //             CommentText: newComment,
    //             Module: Enums.Module.Inventory,
    //         }
    //         });
    //         setCommentsPage(0);
    //         fetchComments();
    //         setNewComment('');
    //     }
    // };

    // const [submittingComment, setSubmittingComment] = useState(false);

    // const saveComment = async () => {
    //     if (accessStatus === Enums.AccessStatus.LockedWithAccess || accessStatus === Enums.AccessStatus.LockedWithOutAccess) {
    //         return;
    //     }
    //     setSubmittingComment(true);
    //     submitComment();
    //     setSubmittingComment(false);
    // };

    // const fetchComments = async (currentComments, page) => {
    //     const request = await Fetch.post({
    //     url: '/Comment/GetComments',
    //     params: {
    //             ItemId: inventory.ID,
    //             PageIndex: page ? page : 0,
    //             PageSize: 5
    //         }
    //     });

    //     let newComments = [];
    //     if (currentComments) {
    //         if (page != commentsPage) {
    //             newComments.push(...currentComments);
    //         }
    //     }

    //     newComments.push(...request.Results);
    //     setComments(newComments);

    //     if (request.ReturnedResults < 5) {
    //         setCanLoadMoreComments(false);
    //     } else if (newComments.length == request.TotalResults) {
    //         setCanLoadMoreComments(false);
    //     } else {
    //         setCanLoadMoreComments(true);
    //     }
    // };

    // INTEGRATION

    const [integration, setIntegration] = useState();
    const [integrationTooltip, setIntegrationTooltip] = useState('');

    const getIntegration = async () => {
        let integration = await IntegrationService.getIntegration();
        if (integration) {
            setIntegrationTooltip(integration.Status == Enums.IntegrationStatus.Live ? ''
                : `Inventory on ${Enums.getEnumStringValue(Enums.IntegrationPartner, integration?.Partner)} has status of ${Enums.getEnumStringValue(Enums.IntegrationStatus, integration.Status)}`);
        }
        setIntegration(integration);
    };

    const syncInventory = async () => {
        const result = await Fetch.post({
            url: `/Inventory/InventorySync?inventoryID=${inventory.ID}`,
            toastCtx: toast
        });
        if (result.ID) {
            toast.setToast({
                message: 'Inventory successfully queued for sync',
                show: true,
                type: 'success'
            });
            setInventory(result);
        } else {
            toast.setToast({
                message: 'Inventory failed to sync',
                show: true,
                type: Enums.ToastType.error
            });
        }
    };

    const [attachmentCount, setAttachmentCount] = useState(0);
    const [countsToggle, setCountsToggle] = useState(false);

    const getCounts = async () => {
        let countRequest = await Fetch.get({
            url: `/Inventory/GetCounts?id=${inventory.ID}`,
        });
        let result = countRequest.Results;
        setAttachmentCount(result.find(x => x.Key == 'Attachments').Value);

        setCountsToggle(!countsToggle);
    };

    useEffect(() => {
        buildUpPageTabs();
    }, [countsToggle]);

    const onAttachmentRefresh = () => {
        getCounts();
    };

    const [pageTabs, setPageTabs] = useState([]);
    const [selectedTab, setSelectedTab] = useState('Inventory');

    /*const fetchInventoryDetails = async () => {
        try {
          if (inventory) {
            const inv = await Fetch.get({
              url: '/Inventory',
              params: {id : inventory.ID},
              caller: "pages/inventory/[id].js:fetchInventoryDetails()"
            });
            setInventory(inv);
            setFormIsDirty(false);
          }
        } catch (error) {
          console.log('fetchInventoryDetails', error);
        }
      };*/

    const trySetSelectedTab = (tab) => {
        // form state is no longer handled here and changing tabs will not trigger confirm - to solve the issue use routing for tabs
        /*if (selectedTab === "Inventory" && formIsDirty && !isNew) {
            setConfirmOptions({
              ...Helper.initialiseConfirmOptions(),
              display: true,
              heading: "Save Changes?",
              text: "Save changes before changing the tab?",
              confirmButtonText: "Save Changes",
              discardButtonText: "Discard Changes",
              showDiscard: true,
              showCancel: true,
              onDiscard: async () => {
                await fetchInventoryDetails();
                setSelectedTab(tab);
              },
              onConfirm: async () => {
                let result = await saveInventory();
                if (result === true) {
                  setSelectedTab(tab);
                }
              }
            });
          } else {
            setSelectedTab(tab);
          }*/

        setSelectedTab(tab);

    };

    const buildUpPageTabs = () => {
        let tabs = [
            { text: 'Inventory' },
            { text: 'Attachments', count: attachmentCount },
        ];
        setPageTabs(tabs);
    };

    const onImageUploaded = async () => {
        if (!isNew) {
            await getCounts();
        }
    }

    /*const validate = () => {

        let validationItems = [];
        validationItems = [
            { key: 'Description', value: inventory.Description, required: true, type: Enums.ControlType.Text },
            { key: 'InventoryCategory', value: selectedCategory, required: true, type: Enums.ControlType.Select },
            { key: 'InventorySubcategory', value: selectedSubcategory, required: true, type: Enums.ControlType.Select },
            { key: 'StockItemType', value: selectedStockItemType, required: true, type: Enums.ControlType.Select },
            { key: 'CostPrice', value: inventory.CostPrice, required: true, type: Enums.ControlType.Number },
            { key: 'ListPrice', value: inventory.ListPrice, required: true, type: Enums.ControlType.Number },
            { key: 'CommissionPercentage', value: inventory.CommissionPercentage, required: true, btw: [0, 100], type: Enums.ControlType.Number },
            { key: 'Quantity', value: inventory.Quantity, required: true, type: Enums.ControlType.Number },
            { key: 'WarrantyPeriod', value: inventory.WarrantyPeriod, required: true, gte: 0, type: Enums.ControlType.Number },
        ];

        const { isValid, errors } = Helper.validateInputs(validationItems);
        setInputErrors(errors);
        return isValid;
    };*/

    const [saving, setSaving] = useState(false);
    const [auditToggle, setAuditToggle] = useState(true);

    const [saveTrigger, setSaveTrigger] = useState(0)

    async function saveInventory() {
        setSaving(true)
        setSaveTrigger(p => p + 1)


        /*setSaving(true);

        let isValid = validate();
        if (isValid) {

            let result = {};

            let inventoryToSave = {
                ...inventory,
                InventoryCategoryID: selectedCategory.ID,
                InventorySubcategoryID: selectedSubcategory.ID,
                SupplierID: selectedSupplier ? selectedSupplier.ID : null,
                StockItemType: Enums.StockItemType[selectedStockItemType],
            };

            if (isNew) {

                result = await Fetch.post({
                    url: `/Inventory`,
                    params: inventoryToSave,
                    toastCtx: toast
                });
            } else {

                result = await Fetch.put({
                    url: `/Inventory`,
                    params: inventoryToSave,
                    toastCtx: toast
                });
            }

            if (result.ID) {
                if (isNew) {
                    Helper.mixpanelTrack(constants.mixPanelEvents.createInventory, {
                        "inventoryID": result.ID
                    });
                } else {
                    Helper.mixpanelTrack(constants.mixPanelEvents.editInventory, {
                        "inventoryID": result.ID
                    });
                }

                setFormIsDirty(false);
                toast.setToast({
                    message: 'Inventory saved successfully',
                    show: true,
                    type: 'success'
                });

                await Helper.waitABit();

                if (isNew) {
                    Helper.nextRouter(Router.push, '/inventory/[id]', `/inventory/${result.ID}`);
                } else {
                    setInventory(result);
                    setAuditToggle(!auditToggle);
                }
            } else {
                setSaving(false);
            }
        } else {
            toast.setToast({
                message: 'There are errors on the page',
                show: true,
                type: 'error',
            });
            setSaving(false);
        }

        if (!isNew) {
            setSaving(false);
        }

        return isValid;*/
    }

    const router = useRouter();

    const cancel = () => {
        Helper.nextRouter(router.push, '/inventory/list?tab=inventory');
    };

    const { height: toolbarHeight, ref: toolbarRef } = useElementSize()

    return (
        <>
            <Box bg={'white'} ref={toolbarRef} pb={isNew ? 'sm' : 0}>
                <Flex justify={'apart'} w={'100%'} mt={'15px'} gap={'sm'} px={10} >
                    <Flex align={'center'} >
                        {isNew ?
                            <Breadcrumbs currPage={{ text: 'Create Inventory', link: '/inventory/create', type: 'create' }} /> :
                            <Breadcrumbs currPage={{ text: inventory.Code, link: `/inventory/${inventory.ID}` }} />
                        }
                    </Flex>

                    <ToolbarButtons
                        buttonGroups={[
                            ...(
                                !!integration && [
                                    [
                                        {
                                            show: inventory.InventorySyncStatus === Enums.SyncStatus.Pending,
                                            type: 'button',
                                            disabled: true,
                                            variant: 'default',
                                            text: `Sync pending to ${Enums.getEnumStringValue(Enums.IntegrationPartner, integration?.Partner)}`,
                                        },
                                        {
                                            show: inventory.InventorySyncStatus === Enums.SyncStatus.Synced,
                                            type: 'button',
                                            disabled: true,
                                            variant: 'default',
                                            text: `Synced`,
                                        },
                                        {
                                            show: inventory.InventorySyncStatus === Enums.SyncStatus.Deleted,
                                            type: 'button',
                                            disabled: true,
                                            variant: 'default',
                                            text: `Deleted`,
                                        },
                                        {
                                            show: inventory.IsActive && inventory.InventorySyncStatus === Enums.SyncStatus.Failed,
                                            type: 'custom',
                                            children: <Box>
                                                <Tooltip color={'yellow.7'} maw={300} multiline label={integrationTooltip} disabled={!integrationTooltip}
                                                    events={{ hover: true, focus: true, touch: true }}
                                                >
                                                    <Button
                                                        leftSection={<IconSend />}
                                                        rightSection={<Box style={{ cursor: 'help' }}>
                                                            <AlertIcon message={`${inventory.InventorySyncMessage}`} width={175} />
                                                        </Box>}
                                                        variant={'default'}
                                                        disabled={accessStatus === Enums.AccessStatus.LockedWithAccess || accessStatus === Enums.AccessStatus.LockedWithOutAccess}
                                                        onClick={() => integration.Status === Enums.IntegrationStatus.Live ? syncInventory() : {}}
                                                    >
                                                        Retry sync to {Enums.getEnumStringValue(Enums.IntegrationPartner, integration?.Partner)}
                                                    </Button>
                                                </Tooltip>
                                            </Box>
                                        }
                                    ]
                                ] || []
                            ),
                            ...(
                                !isNew && [
                                    [

                                        {
                                            breakpoint: 480,
                                            type: 'button',
                                            text: 'Cancel',
                                            hideIcon: true,
                                            variant: 'outline',
                                            icon: <IconArrowBackUp />,
                                            onClick: cancel,
                                        },
                                    ],
                                    [
                                        {
                                            breakpoint: 480,
                                            type: 'button',
                                            icon: <IconDeviceFloppy />,
                                            isBusy: saving,
                                            text: saving ? "Saving" : "Save",
                                            onClick: saving ? null : () => saveInventory(),
                                            disabled: accessStatus === Enums.AccessStatus.LockedWithAccess || accessStatus === Enums.AccessStatus.LockedWithOutAccess
                                        }
                                    ]
                                ] || []
                            )
                        ]
                        }
                    ></ToolbarButtons>

                </Flex>

                {
                    !isNew &&
                    <Tabs
                        selectedTab={selectedTab}
                        setSelectedTab={trySetSelectedTab}
                        tabs={pageTabs}
                        useNewTabs
                        tabsProps={
                            { mt: { base: 'sm', xxl: 0 }, mx: { base: 1, sm: 'xs', md: 'sm', lg: 'md' } }
                        }
                    />
                }

            </Box>
            {/*<div className="row">
                <div className="title">
                    {isNew ?
                        <Breadcrumbs currPage={{ text: 'Create Inventory', link: '/inventory/create', type: 'create' }} /> :
                        <Breadcrumbs currPage={{ text: inventory.Code, link: `/inventory/${inventory.ID}` }} />
                    }
                </div>
                {!isNew ? 
                    <div className="actions">
                        {integration ? 
                            inventory.InventorySyncStatus == Enums.SyncStatus.Pending ?
                                <Button disabled={true} text={`Sync pending to ${Enums.getEnumStringValue(Enums.IntegrationPartner, integration.Partner)}`} /> : 
                            inventory.InventorySyncStatus == Enums.SyncStatus.Synced ?
                                <Button disabled={true} text={`Synced`} /> : 
                            inventory.IsActive && inventory.InventorySyncStatus == Enums.SyncStatus.Failed ?
                                <>
                                    <Button disabled={accessStatus === Enums.AccessStatus.LockedWithAccess || accessStatus === Enums.AccessStatus.LockedWithOutAccess}
                                        text={`Retry sync to ${Enums.getEnumStringValue(Enums.IntegrationPartner, integration.Partner)}`} icon="send" extraClasses="white-action"
                                        tooltip={integrationTooltip}
                                        onClick={() => integration.Status == Enums.IntegrationStatus.Live ? syncInventory() : {}} />
                                    <HelpDialog position="bottom" message={`${inventory.InventorySyncMessage}`} width={175} />
                                </> : '' : ''
                        }
                        <Button text="Cancel" extraClasses="hollow" onClick={cancel} />
                        <Button disabled={accessStatus === Enums.AccessStatus.LockedWithAccess || accessStatus === Enums.AccessStatus.LockedWithOutAccess}
                            text={saving ? "Saving" : "Save"} onClick={saving ? null : () => saveInventory()} />
                    </div>
                    : ''
                }
            </div>*/}

            {isNew ?
                <>
                    <Box
                        // bg={'gray.1'}
                        py={{ base: 5, xs: 8, sm: 'md' }}
                        px={{ base: 5, xs: 8 }}
                        mih={`calc(100vh - ${(toolbarHeight ? (toolbarHeight + 68) : 166)}px)`}
                    >
                        <Card
                            p={'md'}
                            px={{ base: 1, xs: 5, sm: 'sm' }}
                            radius={'md'}
                        // maw={1000}
                        // mx={'auto'}
                        >
                            <Box maw={1000}>
                                <InventoryItemForm
                                    isNew={isNew}
                                    onInventorySaved={
                                        (inventory) =>
                                            Helper.nextRouter(router.push, '/inventory/[id]', `/inventory/${inventory.ID}`)
                                    }
                                    onClose={cancel}
                                    accessStatus={accessStatus}
                                    onNewStatus={(s) => {
                                        setSaving(s === 'loading')
                                    }}
                                    triggerSaveCounter={saveTrigger}
                                    onImageUploaded={onImageUploaded}
                                />
                            </Box>
                        </Card>
                    </Box>
                    {/*{(() => {
                    return inventoryDetails();
                })()}*/}
                </>
                :
                <Box
                    bg={'gray.1'}
                    py={{ base: 5, xs: 8, sm: 'md' }}
                    px={{ base: 5, xs: 8 }}
                    mih={`calc(100vh - ${(toolbarHeight ? (toolbarHeight + 68) : 166)}px)`}
                >
                    <Card
                        p={'md'}
                        px={{ base: 1, xs: 5, sm: 'sm' }}
                        radius={'md'}
                    >
                        {(() => {
                            switch (selectedTab) {
                                case "Inventory":
                                    return <>
                                        {/*<Flex gap={'lg'} direction={{base: 'column', xl: 'row'}}>*/}
                                        <Flex gap={'lg'} direction={{ base: 'column' }}>
                                            <Box maw={1000} mt={'sm'} style={{ flexGrow: 1 }}>
                                                <InventoryItemForm
                                                    isNew={isNew}
                                                    inventory={inventory}
                                                    onInventorySaved={(inventory) => {
                                                        setInventory(inventory);
                                                        setAuditToggle(p => !p);
                                                    }}
                                                    onClose={cancel}
                                                    accessStatus={accessStatus}
                                                    hideSaveAndCancel
                                                    onNewStatus={(s) => {
                                                        setSaving(s === 'loading')
                                                    }}
                                                    triggerSaveCounter={saveTrigger}
                                                    onImageUploaded={onImageUploaded}
                                                />
                                            </Box>


                                            <Box className="comments-and-history" style={{ flexGrow: 0 }} miw={600}>
                                                <ItemComments
                                                    itemID={manageInventory.ID}
                                                    module={Enums.Module.Inventory}
                                                    storeID={manageInventory.StoreID}
                                                // comments={comments}
                                                // handleCommentChange={handleCommentChange}
                                                // newComment={newComment}
                                                // submitComment={saveComment}
                                                // submitting={saving}
                                                // canLoadMoreComments={canLoadMoreComments}
                                                // loadMoreComments={loadMoreComments}
                                                />

                                                <AuditLog recordID={inventory.ID} retriggerSearch={auditToggle} />
                                            </Box>
                                        </Flex>


                                        <hr />

                                    </>
                                // return inventoryDetails();
                                case 'Attachments':
                                    return <Attachments displayName={inventory.Code} itemId={inventory.ID}
                                        module={Enums.Module.Inventory} onRefresh={onAttachmentRefresh}
                                        accessStatus={accessStatus} />;
                                default:
                                    return '';
                            }
                        })()}
                    </Card>
                </Box>
            }

            {/*<ConfirmAction options={confirmOptions} setOptions={setConfirmOptions}/>*/}

            <style jsx>{`
                .row {
                    display: flex;
                    justify-content: space-between;
                }

                .column {
                    display: flex;
                    flex-direction: column;
                    width: 100%;
                }

                .actions {
                    display: flex;
                }
                .actions :global(.button){
                    margin-left: 0.5rem;
                    margin-top: 0;
                    padding: 0 1rem;
                    white-space: nowrap;
                }
            `}
            </style>
        </>
    );
}

export default ManageInventory;
