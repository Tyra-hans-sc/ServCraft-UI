import React, {FC} from "react";
import {Button, Group, Loader, Title} from "@mantine/core";
import ScTextControl from "@/components/sc-controls/form-controls/v2/sc-text-control";
import {isEmail, isNotEmpty, useForm} from "@mantine/form";
import {useMutation} from "@tanstack/react-query";
import Fetch from "@/utils/Fetch";
import {showNotification, updateNotification} from "@mantine/notifications";
import * as Enums from "@/utils/enums";
import ScMobileNumberControl from "@/components/sc-controls/form-controls/v2/sc-mobile-number-control";
import Helper from "@/utils/helper";


export interface SupplierResponse {
    Name: string
    Code: string
    EmailAddress: string
    ContactNumber: string
    VATNumber: string | null
    CompanyNumber: string | null
    Contacts: any[]
    Locations: any[]
    ID: string
    IsActive: boolean
    CreatedBy: string
    CreatedDate: string
    ModifiedBy: string
    ModifiedDate: string
    RowVersion: string
}

const CreateNewSupplierForm: FC<{
    isNew?: boolean
    onClose: () => void
    supplierCreated: (data: SupplierResponse) => void
    supplier?: any,

}> = (props) => {

    const form = useForm({
        initialValues: {
            Name: props?.isNew ? '' : props?.supplier.Name,
            Code: props?.isNew ? '' : props?.supplier.Code,
            EmailAddress: props?.isNew ? '' : props?.supplier.EmailAddress,
            ContactNumber: props?.isNew ? '' : props?.supplier.ContactNumber,
            IsActive: props?.isNew ? true : props?.supplier.IsActive,
            VATNumber: props?.isNew ? '' : props?.supplier.VATNumber,
            CompanyNumber: props?.isNew ? '' : props?.supplier.CompanyNumber,
            RowVersion: props?.isNew ? '' : props?.supplier.RowVersion,
        },
        validate: {
            Name: (x) => Helper.validateInputStringOut({
                value: x,
                controlType: Enums.ControlType.Text,
                required: true,
                customErrorText: 'Specify supplier name'
            } as any),
            EmailAddress: (x) => !!x && Helper.validateEmailStringOut(x)
        }
    });

    const saveSupplier = async (values) => {
       const res = (props.isNew && await Fetch.post({
            url: `/Supplier`,
            params: values,
        } as any)) || await Fetch.put({
            url: `/Supplier`,
            params: {
                ...props.supplier,
                ...values
            },
        } as any);

        if (res.ID) {
            form.setValues(res);
            return res;
        } else {
            throw new Error(res.serverMessage || res.message || 'Something went wrong');
        }
    }

    const {isLoading, mutate} = useMutation<SupplierResponse>(['category', 'create'], saveSupplier, {
        onSuccess: (data) => {
            updateNotification({
                id: 'createSupplier',
                message: `Successfully created supplier: ${data?.Name}`,
                color: 'scBlue',
                loading: false
            });
            /*data.ID && Helper.mixpanelTrack(props.isNew ? constants.mixPanelEvents.createInventoryCategory : constants.mixPanelEvents.editInventoryCategory, {
                'inventoryCategoryID': data.ID
            } as any);*/
            props.supplierCreated(data);
        },
        onError: (err: any) => {
            // console.error(err)
            updateNotification({
                id: 'createSupplier',
                message: err?.message || 'Supplier could not be created',
                color: 'red',
                loading: false
            });
            // props.supplierCreated(data);
        },
        onMutate: () => {
            showNotification({
                id: 'createSupplier',
                message: 'Creating supplier',
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

    return <>

        <Title
            my={'var(--mantine-spacing-lg)'}
            size={'lg'}
            fw={600}
        >
            {props.isNew && 'Create Supplier' || 'Edit Supplier'}
        </Title>

        <form onSubmit={form.onSubmit(handleSubmit)}>
            <ScTextControl
                label={'Name'}
                withAsterisk
                {...form.getInputProps('Name')}
            />

            <ScTextControl
                label={'Code'}
                {...form.getInputProps('Code')}
            />

            <ScTextControl
                label={'Email Address'}
                // type={'email'}
                {...form.getInputProps('EmailAddress')}
            />

            <ScMobileNumberControl
                label={'Contact Number'}
                {...form.getInputProps('ContactNumber')}
            />

            <ScTextControl
                label={'VAT Number'}
                {...form.getInputProps('VATNumber')}
            />

            <ScTextControl
                label={'Company Reg Number'}
                {...form.getInputProps('CompanyNumber')}
            />

            {/*<Group mt={'sm'}>
                {
                    props.isNew &&
                    <SCSwitch label="Active" checked={form.values.IsActive}
                              onToggle={(checked) => form.setFieldValue('IsActive', checked)}
                    />
                }
            </Group>*/}

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
    </>
}

export default CreateNewSupplierForm;
