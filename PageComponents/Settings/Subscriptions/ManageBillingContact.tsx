import SCModal from '@/PageComponents/Modal/SCModal';
import SCCheckbox from '@/components/sc-controls/form-controls/sc-checkbox';
import SCComboBox from '@/components/sc-controls/form-controls/sc-combobox';
import SCInput from '@/components/sc-controls/form-controls/sc-input';
import { ManagerTenantBillingContactDetails, ManagerTenantBillingDetails } from '@/interfaces/api/models';
import helper from '@/utils/helper';
import { Button, Flex, Title } from '@mantine/core';
import { FC, useContext, useEffect, useMemo, useState } from 'react';
import * as Enums from '@/utils/enums';
import SCSwitch from '@/components/sc-controls/form-controls/sc-switch';
import ConfirmAction from '@/components/modals/confirm-action';
import billingService from '@/services/billing-service';
import ToastContext from '@/utils/toast-context';

const ManageBillingContact: FC<{
    item: ManagerTenantBillingContactDetails
    onSave: (updatedBillingDetails: ManagerTenantBillingDetails) => void
    onCancel: () => void,
    billingDetails: ManagerTenantBillingDetails
}> = ({ item, onSave, onCancel, billingDetails }) => {

    const [contact, setContact] = useState<ManagerTenantBillingContactDetails>(item);
    const [inputErrors, setInputErrors] = useState<any>({});
    const [confirmOptions, setConfirmOptions] = useState({ ...helper.initialiseConfirmOptions() });
    const toast = useContext(ToastContext);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        setContact({ ...item });
    }, [item]);

    const handleInputChange = (e) => {
        setContact(c => ({
            ...c,
            [e.name]: e.value
        }));
    };

    const handleDesignationChange = (e) => {
        handleInputChange({ name: "DesignationID", value: e.ID });
    };

    const isNew = () => {
        return billingDetails.Contacts.findIndex(x => x.ID === contact.ID) < 0;
    };

    const disablePrimaryAccount = () => {
        return contact.IsPrimaryAccount && billingDetails.Contacts.find(x => x.IsActive && x.IsPrimaryAccount)?.ID === contact.ID;
    };

    const disableSendBill = () => {
        return billingDetails.Contacts.filter(x => x.SendBill && x.IsActive && x.ID !== contact.ID).length > 4 && !contact.SendBill;
    };

    const validateAndSave = async (overrideIsActive: boolean | undefined = undefined) => {

        let validationItems: any[] = [{
            required: true,
            key: "Name",
            value: contact.Name,
            type: Enums.ControlType.Text
        }, {
            required: true,
            key: "EmailAddress",
            value: contact.EmailAddress,
            type: Enums.ControlType.Email
        }, {
            required: true,
            key: "MobileNumber",
            value: contact.MobileNumber,
            type: Enums.ControlType.ContactNumber
        }, {
            required: false,
            key: "OfficeNumber",
            value: contact.OfficeNumber,
            type: Enums.ControlType.ContactNumber
        }, {
            required: true,
            key: "DesignationID",
            value: contact.DesignationID,
            type: Enums.ControlType.Select
        }];

        let { isValid, errors } = helper.validateInputs(validationItems);

        if (!!contact.Name) {
            if (billingDetails.Contacts.filter(x => x.Name.toLowerCase() === contact.Name.toLowerCase() && x.ID !== contact.ID).length > 0) {
                isValid = false;
                errors["Name"] = "A contact with the same name already exists";
            }
            else if (contact.Name.split(" ").length < 2) {
                isValid = false;
                errors["Name"] = "First name and last name are required";
            }
        }

        setInputErrors(errors);

        if (isValid) {

            setSubmitting(true);

            let bd = { ...billingDetails };
            let match = bd.Contacts.find(x => x.ID === contact.ID);
            if (!match) {
                match = contact;
                bd.Contacts.push(match);
            }
            else {
                Object.keys(contact).forEach(x => (match as ManagerTenantBillingContactDetails)[x] = contact[x]);
            }

            if (contact.IsPrimaryAccount) {
                let primaryMatch = bd.Contacts.find(x => x.IsPrimaryAccount && x.IsActive && x.ID !== contact.ID);
                if (primaryMatch) {
                    primaryMatch.IsPrimaryAccount = false;
                }
            }

            if (overrideIsActive !== undefined) {
                match.IsActive = overrideIsActive;
                match.SendBill = match.SendBill && overrideIsActive;
            }

            let updatedBillingDetails = await billingService.updateTenantBillingDetails(bd, toast);

            if (updatedBillingDetails) {
                (toast as any).setToast({
                    message: "Saved contact details succesfully",
                    show: true,
                    type: Enums.ToastType.success
                });
                onSave && onSave(updatedBillingDetails);
            }

            setSubmitting(false);
        }
    }

    const toggleActive = () => {
        let deactivate = contact.IsActive;

        if (deactivate) {
            setConfirmOptions({
                ...helper.initialiseConfirmOptions(),
                display: true,
                confirmButtonText: "Deactivate",
                onConfirm: () => {
                    validateAndSave(false);
                },
                heading: "Confirm Deactivate Contact?",
                text: ""
            });
        }
        else {
            validateAndSave(true);
        }
    };

    return (<>

        <SCModal
            open={true}
            size='md'
        >

            <Title order={5} mb={'md'} >
                {isNew() ? "Create Contact" : "Edit Contact"} 
            </Title>

            <Flex direction="column">

                <SCInput
                    label='Name'
                    required={true}
                    name={'Name'}
                    error={inputErrors['Name']}
                    value={contact.Name}
                    onChange={handleInputChange}
                />

                <SCInput
                    label='Email Address'
                    required={true}
                    name={'EmailAddress'}
                    error={inputErrors['EmailAddress']}
                    value={contact.EmailAddress}
                    onChange={handleInputChange}
                />

                <SCInput
                    label='Mobile Number'
                    required={true}
                    name={'MobileNumber'}
                    error={inputErrors['MobileNumber']}
                    value={contact.MobileNumber}
                    onChange={handleInputChange}
                />

                <SCInput
                    label='Office Number'
                    required={false}
                    name={'OfficeNumber'}
                    error={inputErrors['OfficeNumber']}
                    value={contact.OfficeNumber}
                    onChange={handleInputChange}
                />

                <SCComboBox
                    label='Designation'
                    options={billingDetails.Designations}
                    dataItemKey='ID'
                    textField='Name'
                    value={billingDetails.Designations.find(x => x.ID === contact.DesignationID)}
                    canClear={false}
                    required={true}
                    error={inputErrors['DesignationID']}
                    onChange={handleDesignationChange}
                />

                <SCCheckbox
                    label='Primary account'
                    name='IsPrimaryAccount'
                    value={contact.IsPrimaryAccount as any}
                    disabled={disablePrimaryAccount()}
                    onChangeFull={handleInputChange}
                />

                <SCCheckbox
                    label='Receive invoices and statements'
                    name='SendBill'
                    value={contact.SendBill as any}
                    disabled={disableSendBill()}
                    onChangeFull={handleInputChange}
                    title={disableSendBill() ? "Up to five contacts can receive invoices and statements" : undefined}
                />

                <SCCheckbox
                    label='Receive general updates about the system'
                    name='SendTechnical'
                    value={contact.SendTechnical as any}
                    onChangeFull={handleInputChange}
                />


                <Flex justify={"space-between"} mt={"1rem"}>

                    <div>
                        {!disablePrimaryAccount() && !isNew() && <>
                            <Button
                                variant='subtle'
                                onClick={toggleActive}
                                color={contact.IsActive ? "red" : "green"}
                                disabled={submitting}
                            >
                                {contact.IsActive ? "Deactivate" : "Activate"}
                            </Button>
                        </>}
                    </div>
                    <Flex>

                        <Button variant='subtle' onClick={onCancel} disabled={submitting} style={{ marginRight: "0.5rem" }}>
                            Cancel
                        </Button>
                        <Button onClick={() => validateAndSave()} disabled={submitting}>
                            Save
                        </Button>
                    </Flex>
                </Flex>
            </Flex>


        </SCModal>

        <ConfirmAction
            options={confirmOptions}
            setOptions={setConfirmOptions}
        />

        <style jsx>{`
            
        `}</style>
    </>);
};

export default ManageBillingContact;