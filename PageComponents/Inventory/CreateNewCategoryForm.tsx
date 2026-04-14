import React, {FC} from "react";
import {Button, Group, Loader, Title} from "@mantine/core";
import ScTextControl from "@/components/sc-controls/form-controls/v2/sc-text-control";
import {useForm} from "@mantine/form";
import {useMutation} from "@tanstack/react-query";
import Fetch from "@/utils/Fetch";
import {showNotification, updateNotification} from "@mantine/notifications";
import Helper from "@/utils/helper";
import constants from "@/utils/constants";
import InventoryService from "@/services/inventory/inventory-service";
import * as Enums from "@/utils/enums";


const CreateNewCategoryForm: FC<{
    isNew?: boolean
    onCancel: () => void
    inventoryCategoryCreated: (data: any) => void
}> = (props) => {

    const form = useForm({
        initialValues: {
            code: '',
            description: ''
        },
        validate: {
            description: (x) => Helper.validateInputStringOut({
                value: x,
                controlType: Enums.ControlType.Text,
                required: true,
                customErrorText: 'Specify a category name'
            } as any)
        }
    });

    const saveCategory = async (params) => {
        const res = props.isNew && await Fetch.post({
            url: `/InventoryCategory`,
            params,
        } as any) || await Fetch.put({
            url: `/InventoryCategory`,
            params
        } as any);

        if(res.ID) {
            return res
        } else {
            throw new Error(res.serverMessage || res.message || 'something went wrong')
        }
    }

    const {isLoading, mutate} = useMutation(['category', 'create'], saveCategory, {
        onSuccess: (data) => {
            updateNotification({
                id: 'createInventoryCategory',
                message: `Successfully ${props.isNew ? 'created' : 'updated'} category`,
                color: 'scBlue'
            });
            data.ID && Helper.mixpanelTrack(props.isNew ? constants.mixPanelEvents.createInventoryCategory : constants.mixPanelEvents.editInventoryCategory, {
                'inventoryCategoryID': data.ID
            } as any);
            props.inventoryCategoryCreated(data);
        },
        onError: (err: any) => {
            const message = `Inventory category could not be ${props.isNew ? 'created' : 'updated'}`;
            updateNotification({
                id: 'createInventoryCategory',
                title: err?.message && message,
                message: err?.message || message,
                color: 'red'
            });
        },
        onMutate: () => {
            showNotification({
                id: 'createInventoryCategory',
                message: ` ${props.isNew ? 'Creating' : 'Updating '} Inventory Category`,
                color: 'scBlue',
                loading: true
            });
        }
    });

    const handleSubmit = (values) => {
        if(form.validate()) {
            mutate(values)
        }
    }

    /*const validateForm = () => {
        const validationErrors = InventoryService.validateInventoryCategory(form.values).errors;
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
            {props.isNew && 'Create Inventory Category' || 'Edit Inventory Category'}
        </Title>

        <form onSubmit={form.onSubmit(handleSubmit)}>
            <ScTextControl
                label={'Code'}
                {...form.getInputProps('code')}
            />
            <ScTextControl
                label={'Name'}
                withAsterisk
                {...form.getInputProps('description')}
            />

            <Group mt={'5rem'} justify={'right'} gap={'xs'}>
                <Button type={'button'} variant={'subtle'} color={'gray.9'} onClick={() => {
                    props.onCancel()
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
    </>
}

export default CreateNewCategoryForm;
