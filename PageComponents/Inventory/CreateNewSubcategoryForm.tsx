import React, {FC, useState} from "react";
import {Button, Group, Loader, Title} from "@mantine/core";
import ScTextControl from "@/components/sc-controls/form-controls/v2/sc-text-control";
import {useForm} from "@mantine/form";
import {useMutation} from "@tanstack/react-query";
import Fetch from "@/utils/Fetch";
import {showNotification, updateNotification} from "@mantine/notifications";
import Helper from "@/utils/helper";
import constants from "@/utils/constants";
import InventoryCategorySelector from "@/components/selectors/inventory/inventory-category-selector";
import CreateNewCategoryModal from "./CreateNewCategoryModal";
import InventoryService from "@/services/inventory/inventory-service";
import * as Enums from "@/utils/enums";

export interface SubcategoryFormProps {
    isNew?: boolean
    onClose: () => void
    inventorySubcategoryCreated: (data: any) => void
    defaultInventoryCategory?: any
}

const CreateNewSubcategoryForm: FC<SubcategoryFormProps> = (props) => {

    const [selectedInventoryCategory, setSelectedInventoryCategory] = useState(props.defaultInventoryCategory || null);

    const [showCreateCategoryModal, setShowCreateCategoryModal] = useState(false);

    const form = useForm({
        initialValues: {
            InventoryCategoryDescription: props.defaultInventoryCategory?.Description,
            InventoryCategoryID: selectedInventoryCategory?.ID || '',
            Code: '',
            Description: ''
        },
        validate: {
            InventoryCategoryDescription: (x) => Helper.validateInputStringOut({
                value: x,
                controlType: Enums.ControlType.Text,
                required: true,
                customErrorText: 'Specify category'
            } as any),
            Description: (x) => Helper.validateInputStringOut({
                value: x,
                controlType: Enums.ControlType.Text,
                required: true,
                customErrorText: 'Specify subcategory name'
            } as any)
        }
    });

    const saveSubcategory = async (params) => {
        const res = (props.isNew && await Fetch.post({
                url: `/InventorySubcategory`,
                params,
            } as any)) || await Fetch.put({
                url: `/InventorySubcategory`,
                params
            } as any);

        if (res.ID) {
            return res;
        } else {
            throw new Error(res.serverMessage || res.message || 'Something went wrong');
        }
    }

    const {isLoading, mutate} = useMutation(['category', 'create'], saveSubcategory, {
        onSuccess: (data) => {
            updateNotification({
                id: 'createInventory',
                message: `Successfully created ${data?.Description} subcategory`,
                color: 'scBlue',
                loading: false
            });
            Helper.mixpanelTrack(props.isNew ? constants.mixPanelEvents.createInventorySubcategory : constants.mixPanelEvents.editInventorySubcategory, {
                'inventorySubcategoryID': data.ID
            } as any);
            props.inventorySubcategoryCreated(data);
        },
        onError: (err: any) => {
            // console.error(err)
            updateNotification({
                id: 'createInventory',
                message: err?.message || 'Inventory subcategory could not be created',
                color: 'red',
                loading: false
            });
        },
        onMutate: () => {
            showNotification({
                id: 'createInventory',
                message: 'Creating inventory subcategory',
                color: 'scBlue',
                loading: true
            });
        }
    });

    const handleSubmit = (values) => {
        mutate(values)
    }

    /*const validateForm = () => {
        const validationErrors = InventoryService.validateInventorySubcategory(form.values, selectedInventoryCategory).errors;
        for(const key in validationErrors) {
            if(form.values.hasOwnProperty(key) && validationErrors.hasOwnProperty(key)) {
                form.setFieldError(key, validationErrors[key])
            }
        }
    }*/

    return <>

        <Title
            my={'var(--mantine-spacing-lg)'}
            size={'lg'}
            fw={600}
        >
            {props.isNew && 'Create Inventory Subcategory' || 'Edit Inventory Subcategory'}
        </Title>

        <form onSubmit={form.onSubmit(handleSubmit)}>
            {/*<InventoryCategorySelector selectedCategory={selectedInventoryCategory} setSelectedCategory={setSelectedInventoryCategory}
                                       error={inputErrors.InventoryCategory} withAstersik={true} disabled={inventoryLockdown} cypress="data-cy-category"
            />*/}
            <InventoryCategorySelector
                error={form.getInputProps('InventoryCategoryDescription').error}
                required
                // selectedCategory={selectedInventoryCategory}
                selectedCategory={selectedInventoryCategory}
                setSelectedCategory={(e) => {
                    setSelectedInventoryCategory(e);
                    // handleInputChange({name: "InventoryCategoryDescription", value: e ? e.Description : null});
                    form.setFieldValue('InventoryCategoryDescription', e?.Description || e)
                    form.setFieldValue('InventoryCategoryID', e?.ID || e)
                }}
                pageSize={10}
                cypress={null}
                disabled={!!props.defaultInventoryCategory}
                onCreateNewCategory={() => {setShowCreateCategoryModal(true)}}
                accessStatus={null}
            />
            <ScTextControl
                label={'Code'}
                {...form.getInputProps('Code')}
            />
            <ScTextControl
                label={'Name'}
                withAsterisk
                {...form.getInputProps('Description')}
            />

            <Group mt={'5rem'} justify={'right'} gap={'xs'}>
                <Button type={'button'} variant={'subtle'} color={'gray.9'} onClick={() => {
                    props.onClose()
                }}>
                    Cancel
                </Button>
                <Button color={'scBlue'} type={'submit'}
                        rightSection={isLoading && <Loader variant={'oval'} size={18} color={'white'}/>}
                >
                    {props.isNew && 'Create' || 'Save'}
                </Button>
            </Group>
        </form>

        <CreateNewCategoryModal show={showCreateCategoryModal}
                                onClose={() => setShowCreateCategoryModal(false)}
                                inventoryCategoryCreated={
                                    (e) => {
                                        setSelectedInventoryCategory(e);
                                        form.setFieldValue('InventoryCategoryDescription', e?.Description || e);
                                        form.setFieldValue('InventoryCategoryID', e?.ID || e);
                                        setShowCreateCategoryModal(false);
                                    }
                                }
        />
    </>
}

export default CreateNewSubcategoryForm;
