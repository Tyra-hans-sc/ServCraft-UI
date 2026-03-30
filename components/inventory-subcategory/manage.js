import React, { useState, useEffect, useContext, useRef } from 'react';
import Router from 'next/router';
import { colors, fontSizes, layout, fontFamily, shadows } from '../../theme';
import Fetch from '../../utils/Fetch';
import Helper from '../../utils/helper';
import * as Enums from '../../utils/enums';
import ToastContext from '../../utils/toast-context';
import ConfirmAction from '../modals/confirm-action';
import SCInput from '../sc-controls/form-controls/sc-input';
import InventoryCategorySelector from '../selectors/inventory/inventory-category-selector';
import Breadcrumbs from '../breadcrumbs';
import SCSwitch from '../sc-controls/form-controls/sc-switch';
import InventoryService from '../../services/inventory/inventory-service';
import constants from '../../utils/constants';
import {Box, Button, Card, Flex, Space} from "@mantine/core";
import ToolbarButtons from "../../PageComponents/Button/ToolbarButtons";
import {IconArrowBackUp, IconDeviceFloppy} from "@tabler/icons-react";
import {useElementSize} from "@mantine/hooks";

function ManageInventorySubcategory({isNew, manageInventorySubcategory, accessStatus}) {

    const [inventorySubcategory, setInventorySubcategory] = useState(isNew ? {
        Code: '',
        Description: '',
        IsActive: true,
    } : manageInventorySubcategory);

    const [formIsDirty, setFormIsDirty] = useState(false);
    const [confirmOptions, setConfirmOptions] = useState(Helper.initialiseConfirmOptions());
    
    const [inputErrors, setInputErrors] = useState({});

    const toast = useContext(ToastContext);

    useEffect(() => {
        if (!isNew) {
            getCategory();
        }
    }, []);

    const updateInventorySubcategory = (field, value) => {
        let temp = { ...inventorySubcategory };
        temp[field] = value;
        setInventorySubcategory(temp);
        setFormIsDirty(true);
    };

    const handleInputChange = (e) => {
        updateInventorySubcategory([e.name], e.value);
    };

    const [selectedCategory, setSelectedCategory] = useState();

    const getCategory = async () => {
        setSelectedCategory(await InventoryService.getInventoryCategory(inventorySubcategory.InventoryCategoryID));
    };

    const validate = () => {

        let validationItems = [];
        validationItems = [
          { key: 'Description', value: inventorySubcategory.Description, required: true, type: Enums.ControlType.Text },
          { key: 'InventoryCategory', value: selectedCategory, required: true, type: Enums.ControlType.Select },
        ];
    
        const { isValid, errors } = Helper.validateInputs(validationItems);
        setInputErrors(errors);
        return isValid;
    };

    const [saving, setSaving] = useState(false);
    
    async function saveInventorySubcategory() {
        setSaving(true);

        let isValid = validate();
        if (isValid) {

            let result = {};

            let inventorySubcategoryToSave = {
                ...inventorySubcategory,
                InventoryCategoryID: selectedCategory.ID,
            };

            if (isNew) {
                result = await Fetch.post({
                    url: `/InventorySubcategory`,
                    params: inventorySubcategoryToSave,
                    toastCtx: toast
                });
            } else {
                result = await Fetch.put({
                    url: `/InventorySubcategory`,
                    params: inventorySubcategoryToSave,
                    toastCtx: toast
                });
            }
            
            if (result.ID) {

                if (isNew) {
                    Helper.mixpanelTrack(constants.mixPanelEvents.createInventorySubcategory, {
                        "inventorySubcategoryID": result.ID
                    });
                } else {
                    Helper.mixpanelTrack(constants.mixPanelEvents.editInventorySubcategory, {
                        "inventorySubcategoryID": result.ID
                    });
                }

                setFormIsDirty(false);
                toast.setToast({
                    message: 'Inventory subcategory saved successfully',
                    show: true,
                    type: 'success'
                });

                await Helper.waitABit();

                if (isNew) {
                    Helper.nextRouter(Router.push, '/inventory-subcategory/[id]', `/inventory-subcategory/${result.ID}`);
                } else {
                    setInventorySubcategory(result);
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

        return isValid;
    }

    Helper.preventRouteChange(formIsDirty, setFormIsDirty, setConfirmOptions, saveInventorySubcategory);

    const cancel = () => {
        Helper.nextRouter(Router.push, '/inventory/list?tab=subcategories');
    };

    const {height: toolbarHeight, ref: toolbarRef} = useElementSize()


    return (
        <>
            <Box bg={'white'} ref={toolbarRef} pb={'sm'}>
                <Flex justify={'apart'} w={'100%'} mt={'15px'} gap={'sm'} px={10}>
                    <Flex align={'center'} >
                        {isNew ?
                            <Breadcrumbs currPage={{ text: 'Create Inventory Subcategory', link: '/inventory-subcategory/create', type: 'create' }} /> :
                            <Breadcrumbs currPage={{ text: 'Inventory Subcategory', link: `/inventory-subcategory/${inventorySubcategory.ID}` }} />
                        }
                    </Flex>

                    {
                        !isNew &&
                        <ToolbarButtons
                            buttonGroups={[
                                [
                                    {
                                        breakpoint: 480,
                                        type: 'button',
                                        text: 'Cancel',
                                        hideIcon: true,
                                        variant: 'outline',
                                        icon: <IconArrowBackUp />,
                                        onClick: cancel,
                                    }
                                ],
                                [
                                    {
                                        breakpoint: 480,
                                        type: 'button',
                                        icon: <IconDeviceFloppy />,
                                        isBusy: saving,
                                        disabled: accessStatus === Enums.AccessStatus.LockedWithAccess || accessStatus === Enums.AccessStatus.LockedWithOutAccess,
                                        text: saving ? "Saving" : "Save",
                                        onClick: saving ? null : () => saveInventorySubcategory(),
                                    }
                                ]
                            ]}
                        />
                    }
               </Flex>
            </Box>
            {/*<div className="row">
                <div className="title">
                    {isNew ?
                        <Breadcrumbs currPage={{ text: 'Create Inventory Subcategory', link: '/inventory-subcategory/create', type: 'create' }} /> :
                        <Breadcrumbs currPage={{ text: 'Inventory Subcategory', link: `/inventory-subcategory/${inventorySubcategory.ID}` }} />
                    }
                </div>
                {!isNew ? 
                    <div className="edit-actions">
                        <Button text="Cancel" extraClasses="hollow" onClick={cancel} />
                        <Button disabled={accessStatus === Enums.AccessStatus.LockedWithAccess || accessStatus === Enums.AccessStatus.LockedWithOutAccess}
                            text={saving ? "Saving" : "Save"} onClick={saving ? null : () => saveInventorySubcategory()} />
                    </div> 
                    : ''
                }
            </div>*/}
            <Box
                // bg={'gray.1'}
                py={{base: 5, xs: 8, sm: 'md'}}
                px={{base: 5, xs: 8}}
                mih={`calc(100vh - ${(toolbarHeight ? (toolbarHeight + 68) : 166)}px)`}
            >
                <Card
                    p={'md'}
                    px={{base: 1, xs: 5, sm: 'sm'}}
                    radius={'md'}
                    // maw={1000}
                    // mx={'auto'}
                >
                    <Box maw={480}>
                        <div className="heading">
                            Inventory Subcategory
                        </div>
                        <div className="row">
                            <div className="column">
                                <SCInput
                                    name="Code"
                                    label="Code"
                                    onChange={handleInputChange}
                                    value={inventorySubcategory.Code}
                                    cypress="data-cy-code"
                                />
                            </div>
                        </div>
                        <div className="row">
                            <div className="column">
                                <SCInput
                                    name="Description"
                                    label="Name"
                                    onChange={handleInputChange}
                                    required={true}
                                    value={inventorySubcategory.Description}
                                    error={inputErrors.Description}
                                    cypress="data-cy-description"
                                />
                            </div>
                        </div>
                        <div className="row">
                            <div className="column">
                                <InventoryCategorySelector selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory}
                                                           required={true} error={inputErrors.InventoryCategory} accessStatus={accessStatus} cypress="data-cy-category" />
                            </div>
                        </div>
                        <div className="switch">
                            <SCSwitch
                                name="IsActive"
                                onLabel="Active"
                                offLabel="Active"
                                checked={inventorySubcategory.IsActive}
                                onChange={() => handleInputChange({ name: "IsActive", value: !inventorySubcategory.IsActive })}
                            />
                        </div>

                        {isNew ?
                            <Flex my={'lg'} gap={'sm'} justify={'end'} direction={'row-reverse'} wrap={'wrap-reverse'}>
                                <Button onClick={saveInventorySubcategory} disabled={saving} >
                                    Create
                                </Button>
                                <Button variant={'outline'} onClick={cancel} >
                                    Cancel
                                </Button>
                            </Flex> : <Space h={15} />
                        }
                    </Box>
                </Card>



            </Box>

            <ConfirmAction options={confirmOptions} setOptions={setConfirmOptions} />

            <style jsx>{`
                .row {
                    display: flex;
                    justify-content: space-between;
                }
                .column {
                    display: flex;
                    flex-direction: column;
                    width: ${layout.inputWidth};
                }
                .column :global(.textarea-container) {
                    height: 100%;
                }
                .column + .column {
                    margin-left: 1.25rem;
                }
                .edit-actions {
                    display: flex;
                }
                .edit-actions :global(.button) {
                    margin-left: 0.5rem;
                    margin-top: 0;
                    padding: 0 1rem;
                    white-space: nowrap;
                }
                .actions {
                    display: flex;
                    flex-direction: row-reverse;
                    width: ${layout.inputWidth};
                }
                .actions :global(.button){
                    margin-left: 0.5rem;
                    margin-top: 1rem;
                    padding: 0 1rem;
                    white-space: nowrap;
                }
                .switch {
                    flex-direction: row-reverse;
                    display: flex;
                    margin-top: 1rem;
                    width: ${layout.inputWidth};
                }
            `}</style>
        </>
    );
}

export default ManageInventorySubcategory;
