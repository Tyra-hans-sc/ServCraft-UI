import SCModal from "@/PageComponents/Modal/SCModal";
import React, { FC, useState } from "react";
import { Button, Flex, Group, Loader, Space, Text } from "@mantine/core";
import CustomerContactLocationSelector from "@/components/selectors/customer/customer-contact-location-selector";
import { useForm } from "@mantine/form";
// import * as Enums from '@/utils/enums'
import { Module } from '@/utils/enums'
import { useMutation } from "@tanstack/react-query";
import Helper from "@/utils/helper";
import * as Enums from "@/utils/enums";
import { showNotification } from "@mantine/notifications";
import Fetch from "@/utils/Fetch";
import useInitialTimeout from "@/hooks/useInitialTimeout";

const updateQueryCustomer = (params) => {
    return Fetch.post({
        url: '/Query/QueryCustomerChange',
        params
    } as any)
}

const CustomerChangeModal: FC<{ open: boolean; onClose: () => void; currentItem: any; accessStatus: any; onCustomerChanged: () => void }> = (props) => {

    const [selectedCustomer, setSelectedCustomer] = useState(null)
    const [selectedContact, setSelectedContact] = useState(null)
    const [selectedLocation, setSelectedLocation] = useState(null)
    const [componentLoaded, setComponentLoaded] = useState(false);

    useInitialTimeout(50, () => {
        setComponentLoaded(true);
    });

    const form = useForm({
        initialValues: {
            CustomerID: null,
            ContactID: null,
            LocationID: null,
            QueryID: props.currentItem.ID,
        },
        validate: {
            CustomerID: (x) => Helper.validateInputStringOut({
                value: x,
                controlType: Enums.ControlType.Select,
                required: true,
                customErrorMessage: 'Select a customer'
            } as any),
            ContactID: (x) => Helper.validateInputStringOut({
                value: x,
                controlType: Enums.ControlType.Select,
                required: true,
                customErrorMessage: 'Select a preferred contact'
            } as any),
        }
    })

    const changeQueryCustomerMutation = useMutation(
        ['query', 'customer'],
        updateQueryCustomer,
        {
            // onSuccess: console.log,
            onSettled: () => {
                props.onClose()
                props.onCustomerChanged()
            },
            // onError: console.log,
            // onMutate: console.log,
        }
    )

    const handleUpdate = () => {
        if (form.validate().hasErrors) {
            showNotification(
                {
                    id: 'formInvalid',
                    message: 'Please complete in required fields',
                    color: 'yellow.7'
                }
            )
        } else {
            changeQueryCustomerMutation.mutate(form.values)
        }
    }

    return <>
        <SCModal
            open={props.open}
            onClose={props.onClose}
            size={'lg'}
            modalProps={{
                mih: 700
            }}
        // headerSectionBackButtonText={'back to Query'}
        >

            <Text c={'scBlue'} size={'xl'} fw={700}>
                Select Customer for Query {props.currentItem.QueryCode}
            </Text>

            {componentLoaded && <CustomerContactLocationSelector
                selectedCustomer={selectedCustomer}
                setSelectedCustomer={(x) => {
                    form.setFieldValue('CustomerID', x?.ID || null);
                    setSelectedCustomer(x);
                    form.setFieldValue('LocationID', null);
                    setSelectedLocation(null);
                }}
                canChangeCustomer={true}
                selectedContact={selectedContact}
                setSelectedContact={(x) => {
                    setSelectedContact(x);
                    form.setFieldValue('ContactID', x?.ID || null);
                }}
                selectedLocation={selectedLocation}
                setSelectedLocation={(x) => {
                    setSelectedLocation(x);
                    form.setFieldValue('LocationID', x?.ID || null);
                }}
                canEdit={true}
                excludedCustomerID={props.currentItem.CustomerID ?? null}
                inputErrors={{
                    Customer: form.getInputProps('CustomerID').error || '',
                    Location: form.getInputProps('LocationID').error || '',
                    Contact: form.getInputProps('ContactID').error || ''
                }}
                module={Module.Query as any}
                accessStatus={props.accessStatus}
                backButtonText={'Back to Customer Update'}
                extraClasses={undefined} sendEmail={undefined} setSendEmail={undefined} sendSMS={undefined}
                setSendSMS={undefined} cypressCustomer={undefined} cypressContact={undefined}
                cypressLocation={undefined}
            />
            }

            <Flex justify={'space-between'} mt={50}>
                <Button type={'button'} variant={'subtle'} color={'gray.9'} onClick={() => {
                    props.onClose()
                }}>
                    Cancel
                </Button>
                <Button color={'scBlue'} onClick={handleUpdate}
                    disabled={changeQueryCustomerMutation.isLoading}
                    rightSection={changeQueryCustomerMutation.isLoading && <Loader color={'scBlue'} size={15} />}
                >
                    Change Customer
                </Button>
            </Flex>



        </SCModal>

    </>

}

export default CustomerChangeModal