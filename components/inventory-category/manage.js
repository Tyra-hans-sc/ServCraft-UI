import React, { useState, useEffect, useContext, useRef } from 'react';
import Router from 'next/router';
import { colors, fontSizes, layout, fontFamily, shadows } from '../../theme';
import Fetch from '../../utils/Fetch';
import Helper from '../../utils/helper';
import * as Enums from '../../utils/enums';
import ToastContext from '../../utils/toast-context';
import ConfirmAction from '../modals/confirm-action';
import SCInput from '../sc-controls/form-controls/sc-input';
import Breadcrumbs from '../breadcrumbs';
import SCSwitch from '../sc-controls/form-controls/sc-switch';
import constants from '../../utils/constants';
import {Box, Button, Card, Flex, Space} from "@mantine/core";
import ToolbarButtons from "../../PageComponents/Button/ToolbarButtons";
import {IconArrowBackUp, IconDeviceFloppy} from "@tabler/icons-react";
import {useElementSize} from "@mantine/hooks";

function ManageInventoryCategory({isNew, manageInventoryCategory, accessStatus}) {
    
    const [inventoryCategory, setInventoryCategory] = useState(isNew ? {
        Code: '',
        Description: '',
        IsActive: true,
    } : manageInventoryCategory);

    const [formIsDirty, setFormIsDirty] = useState(false);
    const [confirmOptions, setConfirmOptions] = useState(Helper.initialiseConfirmOptions());    

    const [inputErrors, setInputErrors] = useState({});

    const toast = useContext(ToastContext);

    const updateInventoryCategory = (field, value) => {
        let temp = { ...inventoryCategory };
        temp[field] = value;
        setInventoryCategory(temp);
        setFormIsDirty(true);
    };

    const handleInputChange = (e) => {
        updateInventoryCategory([e.name], e.value);
    };

    const validate = () => {
        let validationItems = [];
        validationItems = [
            { key: 'Description', value: inventoryCategory.Description, required: true, type: Enums.ControlType.Text },
        ];
    
        const { isValid, errors } = Helper.validateInputs(validationItems);
        setInputErrors(errors);
        return isValid;
    };

    const [saving, setSaving] = useState(false);

    const saveInventoryCategory = async () => {
        setSaving(true);
    
        let isValid = validate();
        if (isValid) {

            let result = {};

            if (isNew) {

                result = await Fetch.post({
                    url: `/InventoryCategory`,
                    params: inventoryCategory,
                    toastCtx: toast
                });
            } else {

                result = await Fetch.put({
                    url: `/InventoryCategory`,
                    params: inventoryCategory,
                    toastCtx: toast
                });
            }

            if (result.ID) {
                if (isNew) {
                    Helper.mixpanelTrack(constants.mixPanelEvents.createInventoryCategory, {
                        "inventoryCategoryID": result.ID
                    });
                } else {
                    Helper.mixpanelTrack(constants.mixPanelEvents.editInventoryCategory, {
                        "inventoryCategoryID": result.ID
                    });
                }

                setFormIsDirty(false);
                toast.setToast({
                    message: 'Inventory category saved successfully',
                    show: true,
                    type: 'success'
                });

                await Helper.waitABit();

                if (isNew) {
                    Helper.nextRouter(Router.push, '/inventory-category/[id]', `/inventory-category/${result.ID}`);
                } else {
                    setInventoryCategory(result);
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
    };

    Helper.preventRouteChange(formIsDirty, setFormIsDirty, setConfirmOptions, saveInventoryCategory);

    const cancel = () => {
        Helper.nextRouter(Router.push, '/inventory/list?tab=categories');
    };

    const {height: toolbarHeight, ref: toolbarRef} = useElementSize()

    return (
        <>

            <Box bg={'white'} ref={toolbarRef} pb={'sm'}>
                <Flex justify={'apart'} w={'100%'} mt={'15px'} gap={'sm'} px={10}>
                    <Flex align={'center'} >
                        {isNew ?
                            <Breadcrumbs currPage={{ text: 'Create Inventory Category', link: '/inventory-category/create', type: 'create' }} /> :
                            <Breadcrumbs currPage={{ text: 'Inventory Category', link: `/inventory-category/${inventoryCategory.ID}`}} />
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
                                        onClick: saving ? null : () => saveInventoryCategory(),
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
                        <Breadcrumbs currPage={{ text: 'Create Inventory Category', link: '/inventory-category/create', type: 'create' }} /> :
                        <Breadcrumbs currPage={{ text: 'Inventory Category', link: `/inventory-category/${inventoryCategory.ID}`}} />
                    }                    
                </div>
                {!isNew ? 
                    <div className="edit-actions">
                        <Button text="Cancel" extraClasses="hollow" onClick={cancel} />
                        <Button disabled={accessStatus === Enums.AccessStatus.LockedWithAccess || accessStatus === Enums.AccessStatus.LockedWithOutAccess}
                            text={saving ? "Saving" : "Save"} onClick={saving ? null : () => saveInventoryCategory()} />
                    </div> : ''
                }
            </div>*/}
            <Box
                // bg={'gray.1'}
                py={{base: 5, xs: 8, sm: 'md'}}
                px={{base: 5, xs: 8}}
                mih={`calc(100vh - ${(toolbarHeight ? (toolbarHeight + 68) : 166)}px)`}
            >
                <Card
                    // maw={1000}
                    // mx={'auto'}
                    p={'md'}
                    px={{base: 1, xs: 5, sm: 'sm'}}
                    radius={'md'}
                >
                    <Box maw={480}>
                        <div className="heading">
                            Inventory Category
                        </div>
                        <div className="row">
                            <div className="column">
                                <SCInput
                                    name="Code"
                                    label="Code"
                                    onChange={handleInputChange}
                                    value={inventoryCategory.Code}
                                    error={inputErrors.Code}
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
                                    value={inventoryCategory.Description}
                                    error={inputErrors.Description}
                                    cypress="data-cy-description"
                                />
                            </div>
                        </div>
                        {!isNew ?
                            <div className="switch">
                                <SCSwitch
                                    name="IsActive"
                                    onLabel="Active"
                                    offLabel="Active"
                                    checked={inventoryCategory.IsActive}
                                    onChange={() => handleInputChange({ name: "IsActive", value: !inventoryCategory.IsActive })}
                                />
                            </div> : ''
                        }
                        {/*{isNew ?
                        <div className="actions">
                            <LegacyButton text="Create" extraClasses="auto" onClick={saveInventoryCategory} disabled={saving} />
                            <LegacyButton text="Cancel" extraClasses="hollow auto" onClick={cancel} />
                        </div> : ''
                    }*/}
                        {isNew ?
                            <Flex my={'lg'} gap={'sm'} justify={'end'} direction={'row-reverse'} wrap={'wrap-reverse'}>
                                <Button onClick={saveInventoryCategory} disabled={saving} >
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
                .edit-actions :global(.button){
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

export default ManageInventoryCategory;
