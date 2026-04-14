import React, {FC, useCallback, useEffect, useMemo, useState} from "react";
import {Button, Group, Loader, Text, Title} from "@mantine/core";
import ScTextControl from "@/components/sc-controls/form-controls/v2/sc-text-control";
import {useForm} from "@mantine/form";
import * as Enums from '../../utils/enums';
import {useMutation, useQuery} from "@tanstack/react-query";
import {showNotification, updateNotification} from "@mantine/notifications";
import Fetch from "@/utils/Fetch";
import CustomerContactLocationSelector from "@/components/selectors/customer/customer-contact-location-selector";
import CustomerService from "@/services/customer/customer-service";
import Helper from "@/utils/helper";
import {FieldSetting, getFieldSettings} from "@/PageComponents/Settings/Field Settings/FieldSettings";
import {getSystemNameForFormName} from "@/PageComponents/Settings/Field Settings/fieldSettingHelper";

const TransferAssetForm: FC<{
    onClose: () => void
    transferAsset?: any
    onAssetTransferred: (data: {
        Product: any,
        Customer: any,
        Contact: any,
        Location: any,
        reason: any,
    } | null) => void
    accessStatus?: any
    job?: any
    module?: any
}> = (props) => {

    const [selectedCustomer, setSelectedCustomer] = useState(props.job?.Customer);
    const [sourceCustomer, setSourceCustomer] = useState(props.transferAsset?.Customer);
    const [selectedContact, setSelectedContact] = useState(props.job?.Contact);
    const [selectedLocation, setSelectedLocation] = useState(props.job?.Location);

    const assetFieldSettings = useQuery(['assetFieldSettings'], () => getFieldSettings(Enums.Module.Asset))
    const settingsBySystemName: {[fieldSystemName: string]: FieldSetting} = useMemo(() => {
        if(assetFieldSettings.data) {
            return assetFieldSettings.data.reduce((previousValue, currentValue) => ({
                ...previousValue,
                [currentValue.FieldSystemName]: {...currentValue}
            }), {})
        } else {
            return {}
        }
    }, [assetFieldSettings.data])
    const isRequired = useCallback((name: string) => {
        const systemName = getSystemNameForFormName(name)
        return settingsBySystemName.hasOwnProperty(systemName) ? isShown(name) && settingsBySystemName[systemName].IsRequired : false
    }, [settingsBySystemName])

    const isShown = useCallback((name: string) => {
        const systemName = getSystemNameForFormName(name)
        return settingsBySystemName.hasOwnProperty(systemName) ? settingsBySystemName[systemName].IsActive : false // && (!!props.transferAsset || !settingsBySystemName[systemName].HideOnCreate) : false
    }, [settingsBySystemName, props.transferAsset])

    useQuery(['customer', props.job?.CustomerID], () => CustomerService.getCustomer(props.job?.CustomerID), {
        enabled: !props.job?.Customer && !!props.job?.CustomerID,
        initialData: props.job?.Customer,
        onSuccess: (customer) => {
            setSelectedCustomer(customer)
            form.setFieldValue('CustomerID', customer?.ID);
        }
    });

    useQuery(['customer', props.transferAsset?.CustomerID], () => CustomerService.getCustomer(props.transferAsset?.CustomerID), {
        enabled: !props.transferAsset?.Customer && !!props.transferAsset?.CustomerID,
        initialData: props.transferAsset?.Customer,
        onSuccess: (customer) => {
            setSourceCustomer(customer)
        }
    });

    const form = useForm({
        initialValues: {
            Reason: '',
            ProductID: props.transferAsset?.ID,
            CustomerID: selectedCustomer?.ID,
            CustomerContactID: selectedContact?.ID,
            LocationID: selectedLocation?.ID
        },
        validate: {
            ProductID: (x) => Helper.validateInputStringOut({
                value: x,
                controlType: Enums.ControlType.Select,
                required: true,
            } as any),
            CustomerID: (x) => Helper.validateInputStringOut({
                value: x,
                controlType: Enums.ControlType.Select,
                required: true,
                customErrorMessage: 'Select a customer'
            } as any),
            LocationID: (x) => Helper.validateInputStringOut({
                value: x,
                controlType: Enums.ControlType.Select,
                required: isRequired('LocationID'),
                customErrorMessage: 'Select a location'
            } as any),
            CustomerContactID: (x) => Helper.validateInputStringOut({
                value: x,
                controlType: Enums.ControlType.Select,
                required: true,
                customErrorMessage: 'Select a preferred contact'
            } as any),
            Reason: (x) => Helper.validateInputStringOut({
                value: x,
                controlType: Enums.ControlType.Text,
                required: true,
                customErrorMessage: 'Provide a reason for transferring asset'
            } as any),
            // LocationID: (val) => (!val && 'Please select the preferred location') || null
        }
    });

    const saveAsset = async (params) => {
        const res = await Fetch.put({
            url: '/Product/Transfer',
            params,
        } as any);
        if (res.ID) {
            return res
        } else {
            throw new Error(res.serverMessage || res.message || 'something went wrong')
        }
    }

    const {isLoading, mutate} = useMutation<any>(['asset', 'createOrEdit'], saveAsset, {
        onSuccess: (data) => {
            updateNotification({
                id: 'transferAsset',
                message: `Asset Ownership Successfully Transferred`,
                color: 'scBlue',
                loading: false
            });
            props.onAssetTransferred({
                Product: data,
                Customer: selectedCustomer,
                Contact: selectedContact,
                Location: selectedLocation,
                reason: form.values.Reason,
            });
        },
        onError: (err: any) => {
            /*console.error(err)
            console.log(err, err?.message)*/
            const message = `Asset Ownership Could Not Be Transferred`;
            updateNotification({
                id: 'transferAsset',
                title: err.message && message,
                message: err.message || message,
                color: 'red',
                loading: false
            });
            props.onAssetTransferred(null);
        },
        onMutate: () => {
            showNotification({
                id: 'transferAsset',
                message: `Transferring Asset`,
                color: 'scBlue',
                loading: true
            });
        }
    });

    const handleSubmit = (values) => {
        if(form.isValid()) {
            mutate(values)
        }
    }

    return <>
        <Title
            my={'var(--mantine-spacing-lg)'}
            size={'md'}
            fw={600}
        >
            Transferring Ownership for {props.transferAsset?.ProductNumber}
        </Title>
        <Text
            // maw={'22rem'}
            my={'var(--mantine-spacing-lg)'}
            c={'gray.9'}
            size={'md'}
        >
            {
                props.module === Enums.Module.JobCard ?
                    `To use this asset in this job you'll need to transfer it from ${sourceCustomer?.CustomerName || ''} to ${selectedCustomer?.CustomerName || ''}` :
                    `To use this asset you'll need to transfer it from ${sourceCustomer?.CustomerName || ''}`
            }
        </Text>

        <form onSubmit={form.onSubmit(handleSubmit)}>
            <CustomerContactLocationSelector
                selectedCustomer={selectedCustomer}
                setSelectedCustomer={(x) => {
                    setSelectedCustomer(x);
                    form.setFieldValue('CustomerID', x?.ID || null);
                }} canChangeCustomer={false}
                selectedContact={selectedContact}
                setSelectedContact={(x) => {
                    setSelectedContact(x);
                    form.setFieldValue('CustomerContactID', x?.ID || null);
                }}
                selectedLocation={selectedLocation}
                setSelectedLocation={(x) => {
                    setSelectedLocation(x);
                    form.setFieldValue('LocationID', x?.ID || null);
                }}
                excludedCustomerID={sourceCustomer ? sourceCustomer.ID : null}
                inputErrors={{
                    Customer: form.getInputProps('CustomerID').error || '',
                    Location: form.getInputProps('LocationID').error || '',
                    Contact: form.getInputProps('CustomerContactID').error || ''
                }}
                module={props.module}
                accessStatus={props.accessStatus}
                backButtonText={'Back to Transfer of Ownership'}
                // hideLocation={!isShown('LocationID')}
                locationRequired={isRequired('LocationID')}
                extraClasses={undefined} sendEmail={undefined} setSendEmail={undefined} sendSMS={undefined}
                setSendSMS={undefined} cypressCustomer={undefined} cypressContact={undefined}
                cypressLocation={undefined}
            />

            <ScTextControl
                label="Reason"
                withAsterisk
                {...form.getInputProps('Reason')}
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
                    {!props.transferAsset && 'Create' || 'Save'}
                </Button>
            </Group>
        </form>
    </>
}

export default TransferAssetForm;
