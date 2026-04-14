import React, { useState, useContext, useEffect } from 'react';
import { colors, fontSizes, layout, fontFamily } from '../../../theme';
import SCCheckbox from '../../sc-controls/form-controls/sc-checkbox';
import SCInput from '../../sc-controls/form-controls/sc-input';
import SCDropdownList from '../../sc-controls/form-controls/sc-dropdownlist';
import SCComboBox from '../../sc-controls/form-controls/sc-combobox';
import Helper from '../../../utils/helper';
import * as Enums from '../../../utils/enums';
import Fetch from '../../../utils/Fetch';
import ToastContext from '../../../utils/toast-context';
import SCSwitch from '../../sc-controls/form-controls/sc-switch';
import LoginAccess from '../../auth/login-access';
import PS from '../../../services/permission/permission-service';
import CustomerService from '../../../services/customer/customer-service';
import constants from '../../../utils/constants';
import SCModal from "@/PageComponents/Modal/SCModal";
import {IconChevronLeft} from "@tabler/icons";
import {Group, Button, Title, Loader, Tooltip} from "@mantine/core";

function ManageContact({isNew, contact, module, moduleData, onSave, onCancel, canDeactivate = true, accessStatus, backButtonText}) {

    const [editCustomerPermission] = useState(PS.hasPermission(Enums.PermissionName.EditCustomer) || module == Enums.Module.Supplier);
    const toast = useContext(ToastContext);

    const [inputs, setInputs] = useState({});    

    useEffect(() => {
        let inputState = {};
        if (isNew) {
            inputState = {
                FirstName: '',
                LastName: '',
                EmailAddress: '',
                MobileNumber: '',
                WorkNumber: '',
                HomeNumber: '',
                FaxNumber: '',
                IDNumber: '',
                SendEmail: true,
                SendSMS: true,
                Unsubscribe: false,
                IsPrimary: false
            };
            if (module == Enums.Module.Customer) {
                inputState = {...inputState, IsPrimaryAccount: false};
            } else if (module == Enums.Module.Supplier) {
                inputState = {...inputState, canLogin: false,
                    password: '',
                    confirmPassword: ''};
            }
        } else {
            inputState = {
                ID: contact.ID,                
                FirstName: contact.FirstName,
                LastName: contact.LastName,
                EmailAddress: contact.EmailAddress,
                MobileNumber: contact.MobileNumber,
                WorkNumber: contact.WorkNumber,
                HomeNumber: contact.HomeNumber,
                FaxNumber: contact.FaxNumber,
                IDNumber: contact.IDNumber,
                SendEmail: contact.SendEmail,
                SendSMS: contact.SendSMS,
                Unsubscribe: contact.Unsubscribe,
                IsPrimary: contact.IsPrimary,
                IsActive: contact.IsActive,
                RowVersion: contact.RowVersion,
            };
            if (module == Enums.Module.Customer) {
                inputState = { ...inputState, IsPrimaryAccount: contact.IsPrimaryAccount };
            } else if (module == Enums.Module.Supplier) {
                inputState = {
                    ...inputState,
                    canLogin: contact.AuthUserIsActive,
                    UserIsActive: contact.AuthUserIsActive,
                    UserName: contact.UserName,
                    UserID: contact.UserID,
                    password: '',
                    confirmPassword: '',
                };
            }
        }

        setInputs(inputState);

        getDesignations();
    }, []);

    const isPrimary = () => (
        inputs.IsPrimary || inputs.IsPrimaryAccount
    )

    const handleInputChange = (e) => {
        let setter = {
            ...inputs,
            [e.name]: e.value
        };

        // set IsActive to true if either IsPrimary or IsPrimaryAccount gets selected
        if ((e.name === 'IsPrimary' || e.name === 'IsPrimaryAccount') && e.value) {
            setter.IsActive = true;
        }

        if (!isNew) {
            if (module == Enums.Module.Supplier && e.name === "EmailAddress" && !inputs.UserID && inputs.canLogin) {
                setter.UserName = e.value;
            }
        }

        setInputs(setter);
    };

    const handleEmailOnPaste = (value) => {
        if (value) {
            if (value.includes("<") && value.includes(">")) {

                let emailToTest = value.substring(value.indexOf("<") + 1, value.indexOf(">"));                
                let containsValidEmail = Helper.validateEmail(emailToTest);

                if (!containsValidEmail) {
                    return;
                }

                let firstname;
                let lastname;
                let email;

                let items = value.trim().split(" ");
                if (items) {                    
                    items = items.filter(x => x != "");                  
                    if (items.length == 3) {
                        // fname, lname, email
                        if (Helper.isNullOrWhitespace(inputs.FirstName)) {
                            firstname = items[0];
                        }
                        if (Helper.isNullOrWhitespace(inputs.LastName)) {
                            lastname = items[1];
                        }
                        if (Helper.isNullOrWhitespace(inputs.EmailAddress)) {
                            let temp = items[2];
                            email = temp.substring(1, temp.length - 1);
                        }
                    } else if (items.length == 2) {
                        // fname, email
                        if (Helper.isNullOrWhitespace(inputs.FirstName)) {
                            firstname = items[0];
                        }
                        if (Helper.isNullOrWhitespace(inputs.EmailAddress)) {
                            let temp = items[1];
                            email = temp.substring(1, temp.length - 1);
                        }
                    } else {
                        // email
                        if (Helper.isNullOrWhitespace(inputs.EmailAddress)) {
                            let temp = items[0];
                            email = temp.substring(1, temp.length - 1);
                        }
                    }
                }

                setInputs({...inputs, 
                    FirstName: firstname ? firstname : inputs.FirstName,
                    LastName: lastname ? lastname : inputs.LastName,
                    EmailAddress: email ? email : inputs.EmailAddress,
                });
            }
        }
    };

    // Designation

    const [designations, setDesignations] = useState([]);
    const [selectedDesignation, setSelectedDesignation] = useState();

    const getDesignations = async () => {
        let response = await CustomerService.getDesignations();
        let results = response.Results;
        setDesignations(results);

        if (!isNew) {
            if (contact.DesignationID) {
                setSelectedDesignation(results.find(x => x.ID == contact.DesignationID));
            }
        }
    };

    const designationChange = async (value) => {
        setSelectedDesignation(value);
    };

    const [isPrimaryAlreadySet] = useState(isNew ? false : contact.IsPrimary);
    const [isPrimaryAccountAlreadySet] = useState(isNew ? false : module == Enums.Module.Customer ? contact.IsPrimaryAccount : false);

    const [inputErrors, setInputErrors] = useState({});

    const validate = () => {
        let validationItems = [
            {key: 'FirstName', value: inputs.FirstName, required: true, type: Enums.ControlType.Text},
            {key: 'LastName', value: inputs.LastName, required: true, type: Enums.ControlType.Text},
            {key: 'MobileNumber', value: inputs.MobileNumber, type: Enums.ControlType.ContactNumber},
            {key: 'WorkNumber', value: inputs.WorkNumber, type: Enums.ControlType.ContactNumber},
            {key: 'HomeNumber', value: inputs.HomeNumber, type: Enums.ControlType.ContactNumber},
        ];
      
        if (module === Enums.Module.Customer) {
            validationItems = [...validationItems, 
                {key: 'EmailAddress', value: inputs.EmailAddress, type: Enums.ControlType.Email, multiEmail: true},
                {key: 'EmailAddress', value: inputs.EmailAddress, type: Enums.ControlType.Email, group: 'email_number', multiEmail: true},
                {key: 'MobileNumber', value: inputs.MobileNumber, type: Enums.ControlType.ContactNumber, group: 'email_number'}
            ];
        } else if (module === Enums.Module.Supplier) {
                if (inputs.canLogin === true && (isNew || !isNew && (inputs.password || inputs.confirmPassword || !inputs.UserID))) {
                    validationItems = [...validationItems,
                        {key: 'EmailAddress', value: inputs.EmailAddress, required: true, type: Enums.ControlType.Email, multiEmail: true},
                        {key: 'password', value: inputs.password, required: true, type: Enums.ControlType.Text, passwordLength: 8},
                        {key: 'confirmPassword', value: inputs.confirmPassword, required: true, type: Enums.ControlType.Text, equalsPassword: inputs.password}
                    ];
            } else {
                validationItems = [...validationItems, 
                    {key: 'EmailAddress', value: inputs.EmailAddress, type: Enums.ControlType.Email, multiEmail: true},
                    {key: 'EmailAddress', value: inputs.EmailAddress, type: Enums.ControlType.Email, group: 'email_number', multiEmail: true},
                    {key: 'MobileNumber', value: inputs.MobileNumber, type: Enums.ControlType.ContactNumber, group: 'email_number'}
                ];
            }
        }
      
        const {isValid, errors} = Helper.validateInputs(validationItems);
        setInputErrors(errors);

        return isValid;
    };

    const [saving, setSaving] = useState(false);

    const saveContact = async () => {

        setSaving(true);

        let isValid = validate();
        if (isValid) {            
            let params = {...inputs, DesignationID: selectedDesignation ? selectedDesignation.ID : null};
           
            if (module == Enums.Module.Customer) {
                params = {...params,
                    CustomerID: moduleData.ID,
                };
            } else if (module == Enums.Module.Supplier) {
                params = {...params,
                    SupplierID: moduleData.ID,
                };
            }

            let response = {};
            if (isNew) {
                if (module == Enums.Module.Customer) {
                    response = await Fetch.post({
                        url: '/Contact',
                        params: params,
                        toastCtx: toast
                    });
                } else if (module == Enums.Module.Supplier) {
                    params = {
                        SupplierContact: params
                    };
                    if (inputs.canLogin && inputs.password == inputs.confirmPassword) {
                        params = {
                            ...params, User: {
                                UserName: inputs.EmailAddress,
                                IsActive: true,
                                Password: inputs.password,
                            }
                        };
                    }
                
                    response = await Fetch.post({
                        url: '/SupplierContact',
                        params: params,
                        toastCtx: toast
                    });
                }
            } else {
                if (module == Enums.Module.Customer) {
                    response = await Fetch.put({
                        url: '/Contact',
                        params: params,
                        toastCtx: toast
                    });
                } else if (module == Enums.Module.Supplier) { 
                    let userToSave = null;
                    if (inputs.canLogin || inputs.UserName) {
                        userToSave = {
                            UserName: inputs.UserName,
                            ID: inputs.UserID,
                            Password: inputs.password,
                            IsActive: params.IsActive && inputs.UserIsActive
                        };
                    }

                    response = await Fetch.put({
                        url: '/SupplierContact',
                            params: {
                            SupplierContact: params,
                            User: userToSave
                        },
                        toastCtx: toast
                    });
                }
            }

            if (response.ID) {
                Helper.mixpanelTrack(isNew ? constants.mixPanelEvents.createContact  : constants.mixPanelEvents.editContact, {
                    "contactID": response.ID
                });
                toast.setToast({
                    message: 'Contact saved successfully',
                    show: true,
                    type: 'success'
                });
                onSave(response);
            } else {
                toast.setToast({
                    message: `Contact failed to save`,
                    show: true,
                    type: Enums.ToastType.error
                });
                setSaving(false);
            }
        } else {
            toast.setToast({
                message: 'There are errors on the page',
                show: true,
                type: Enums.ToastType.error,
              });
            setSaving(false);
        }

        if (!isNew) {
            setSaving(false);
        }
    };

    return (
        <SCModal open={true} decor={'none'} onClose={() => {}} size={'lg'}>
            <div >
                {
                    backButtonText &&
                    <Group style={() => ({
                        borderBottom: `1px solid var(--mantine-color-gray-1)`,
                        paddingBottom: 'var(--mantine-spacing-md)'
                    })}>
                        <Button variant={'subtle'}
                                color={'gray.9'}
                                leftSection={<IconChevronLeft size={16}/>}
                                onClick={onCancel}
                        >
                            {backButtonText}
                        </Button>
                    </Group>
                }

                <Title
                    my={'var(--mantine-spacing-lg)'}
                    size={'lg'}
                    fw={600}
                >
                    {isNew ?
                        "Creating a contact" : `Editing contact ${inputs.FirstName} ${inputs.LastName}`
                    }
                </Title>

                <div className="row">
                    <div className="column">
                        <SCInput
                            onChange={handleInputChange}
                            error={inputErrors.FirstName}
                            label={"First name"}
                            name="FirstName"
                            required={true}
                            value={inputs.FirstName}
                            readOnly={!isNew && !editCustomerPermission}
                            cypress="data-cy-firstname"
                        />
                    </div>
                    <div className="column">
                        <SCInput
                            onChange={handleInputChange}
                            error={inputErrors.LastName}
                            label={"Last name"}
                            name="LastName"
                            required={true}
                            value={inputs.LastName}
                            readOnly={!isNew && !editCustomerPermission}
                            cypress="data-cy-lastname"
                        />
                    </div>
                </div>
                <div className="row">
                    <div className="column">
                        <SCInput
                            onChange={handleInputChange}
                            onPaste={handleEmailOnPaste}
                            error={inputErrors.EmailAddress}
                            label={"Email"}
                            name="EmailAddress"
                            hint={"name@example.com"}
                            required={true}
                            value={inputs.EmailAddress}
                            readOnly={!isNew && !editCustomerPermission}
                            cypress="data-cy-email"
                        />
                    </div>
                    <div className="column">
                        <SCInput
                            onChange={handleInputChange}
                            error={inputErrors.MobileNumber}
                            label={"Mobile number"}
                            name="MobileNumber"
                            required={true}
                            value={inputs.MobileNumber}
                            readOnly={!isNew && !editCustomerPermission}
                            type={'tel'}
                            cypress="data-cy-mobilenumber"
                        />
                    </div>
                </div>
                <div className="row">
                    <div className="column">
                        <SCInput
                            onChange={handleInputChange}
                            error={inputErrors.WorkNumber}
                            label={"Work Number"}
                            name="WorkNumber"
                            value={inputs.WorkNumber}
                            readOnly={!isNew && !editCustomerPermission}
                            cypress="data-cy-worknumber"
                            type={'tel'}
                        />
                    </div>
                    <div className="column">
                        <SCInput
                            onChange={handleInputChange}
                            error={inputErrors.FaxNumber}
                            label={"Fax Number"}
                            name="FaxNumber"
                            value={inputs.FaxNumber}
                            readOnly={!isNew && !editCustomerPermission}
                            cypress="data-cy-faxnumber"
                            type={'tel'}
                        />
                    </div>
                </div>
                <div className="row">
                    <div className="column">
                        <SCInput
                            onChange={handleInputChange}
                            error={inputErrors.HomeNumber}
                            label={"Home Number"}
                            name="HomeNumber"
                            value={inputs.HomeNumber}
                            readOnly={!isNew && !editCustomerPermission}
                            cypress="data-cy-homenumber"
                            type={'tel'}
                        />
                    </div>
                    <div className="column">
                        <SCInput
                            onChange={handleInputChange}
                            error={inputErrors.IDNumber}
                            label={"ID Number"}
                            name="IDNumber"
                            type={'tel'}
                            value={inputs.IDNumber}
                            readOnly={!isNew && !editCustomerPermission}
                            cypress="data-cy-idnumber"
                        />
                    </div>
                </div>

                <div className="row">
                    <div className="column">
                        <SCComboBox
                            label="Designation"
                            name="Designation"
                            textField="Description"
                            dataItemKey="ID"
                            options={designations}
                            placeholder=""
                            onChange={designationChange}
                            value={selectedDesignation}
                        />
                    </div>
                    <div className="column"></div>
                </div>

                {/* {module == Enums.Module.Supplier ?
                    <LoginAccess isNew={false} userID={inputs.UserID} userIsActive={inputs.UserIsActive} canLogin={inputs.canLogin} email={inputs.UserName}
                        password={inputs.password} confirmPassword={inputs.confirmPassword} handleInputChange={handleInputChange} inputErrors={inputErrors} />
                    : ''
                } */}
                <div className="row">
                    <div className="column">
                        <SCCheckbox
                            onChange={() => handleInputChange({ name: "SendEmail", value: !inputs.SendEmail })}
                            value={inputs.SendEmail}
                            label="Receive Email Notifications"
                            disabled={!isNew && !editCustomerPermission}
                            cypress="data-cy-emailnotification"
                        />
                    </div>
                    <div className="column">
                        <SCCheckbox
                            onChange={() => handleInputChange({ name: "IsPrimary", value: !inputs.IsPrimary })}
                            value={inputs.IsPrimary}
                            label="Primary Contact"
                            disabled={!isNew && (isPrimaryAlreadySet || !editCustomerPermission)}
                            title={!isNew && isPrimaryAlreadySet ? `Since this contact is already set as primary, you can only set it as primary on another contact.` : ''}
                            cypress="data-cy-primarycontact"
                        />
                    </div>
                </div>
                <div className="row">
                    <div className="column">
                        <SCCheckbox
                            onChange={() => handleInputChange({ name: "SendSMS", value: !inputs.SendSMS })}
                            value={inputs.SendSMS}
                            label="Receive SMS Notifications"
                            disabled={!isNew && !editCustomerPermission}
                            cypress="data-cy-receivesms"
                        />
                    </div>
                    <div className="column">
                        {module == Enums.Module.Customer ?
                            <SCCheckbox
                                onChange={() => handleInputChange({ name: "IsPrimaryAccount", value: !inputs.IsPrimaryAccount })}
                                value={inputs.IsPrimaryAccount}
                                label="Primary Accounting Contact"
                                disabled={!isNew && (isPrimaryAccountAlreadySet || !editCustomerPermission)}
                                title={!isNew && isPrimaryAccountAlreadySet ? `Since this contact is already set as primary accounting, you can only set it as primary accounting on another contact.` : ''}
                                cypress="data-cy-primaryaccountingcontact"
                            /> : ''
                        }
                    </div>
                </div>
                <div className="row">
                    <div className="column">
                        <SCCheckbox
                            onChange={() => handleInputChange({ name: "Unsubscribe", value: !inputs.Unsubscribe })}
                            value={!inputs.Unsubscribe}
                            label="Subscribed to SMS Marketing"
                            disabled={!isNew && !editCustomerPermission}
                            cypress="data-cy-unsubscribe"
                        />
                    </div>
                    <div className="column"></div>
                </div>
                {!isNew ?
                    <Tooltip color={'scBlue'} label={isPrimary() && 'Primary contacts can not be deactivated'} position={'bottom-end'} disabled={!isPrimary()}
                             events={{ hover: true, focus: true, touch: true }}
                    >
                        <div className="switch">
                            <SCSwitch
                                name="IsActive"
                                onLabel="Active"
                                offLabel="Active"
                                checked={inputs.IsActive}
                                onChange={() => handleInputChange({ name: "IsActive", value: !inputs.IsActive })}
                                disabled={!canDeactivate || !editCustomerPermission || isPrimary()}
                            />
                        </div>
                    </Tooltip>
                     : ''
                }

                <Group mt={'5rem'} justify={'right'} gap={'xs'}>
                    <Button type={'button'} variant={'subtle'} color={'gray.9'} onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button color={'scBlue'}
                            disabled={saving || accessStatus === Enums.AccessStatus.LockedWithAccess || accessStatus === Enums.AccessStatus.LockedWithOutAccess}
                            rightSection={saving && <Loader variant={'oval'} size={18} color={'white'}/>}
                            onClick={saveContact}
                    >
                        {isNew ? 'Create' : 'Save'}
                    </Button>
                </Group>

                {/* <div className="row align-end">
                    <Button text="Cancel" extraClasses="auto hollow" onClick={onCancel} />
                    {editCustomerPermission ?
                        <Button disabled={saving || accessStatus === Enums.AccessStatus.LockedWithAccess || accessStatus === Enums.AccessStatus.LockedWithOutAccess}
                                text={isNew ? 'Create' : 'Save'} extraClasses="auto left-margin" onClick={saveContact} />
                        : ''
                    }
                </div>*/}
                <style jsx>{`        
                .row {
                    display: flex;
                }
                .align-end {
                    justify-content: flex-end;
                    align-items: flex-end;
                  }
                .title {
                    color: ${colors.bluePrimary};
                    font-size: 1.125rem;
                    font-weight: bold;
                }
                .column {
                    display: flex;
                    flex-direction: column;
                    margin-left: 0.5rem;
                    //width: ${layout.inputWidth};
                    flex-grow: 1;
                    max-width: 270px;
                }                
                .switch {
                    flex-direction: row-reverse;
                    display: flex;
                }
            `}</style>

            </div>

        </SCModal>

        /*<div className="overlay" onClick={(e) => e.stopPropagation()}>
            <div className="modal-container">
                <div className="title">
                    <h1>
                    {isNew ?
                        "Creating a contact" : `Editing contact ${inputs.FirstName} ${inputs.LastName}`
                    }
                    </h1>
                </div>
                <div className="row">
                    <div className="column">
                        <SCInput
                            onChange={handleInputChange}
                            error={inputErrors.FirstName}
                            label={"First name"}
                            name="FirstName"
                            required={true}
                            value={inputs.FirstName}
                            readOnly={!isNew && !editCustomerPermission}
                            cypress="data-cy-firstname"
                        />
                    </div>
                    <div className="column">
                        <SCInput
                            onChange={handleInputChange}
                            error={inputErrors.LastName}
                            label={"Last name"}
                            name="LastName"
                            required={true}
                            value={inputs.LastName}
                            readOnly={!isNew && !editCustomerPermission}
                            cypress="data-cy-lastname"
                        />
                    </div>
                </div>
                <div className="row">
                    <div className="column">
                        <SCInput
                            onChange={handleInputChange}
                            onPaste={handleEmailOnPaste}
                            error={inputErrors.EmailAddress}
                            label={"Email"}
                            name="EmailAddress"
                            hint={"name@example.com"}
                            required={true}
                            value={inputs.EmailAddress}
                            readOnly={!isNew && !editCustomerPermission}
                            cypress="data-cy-email"
                        />
                    </div>
                    <div className="column">
                        <SCInput
                            onChange={handleInputChange}
                            error={inputErrors.MobileNumber}
                            label={"Mobile number"}
                            name="MobileNumber"
                            type="tel"
                            required={true}
                            value={inputs.MobileNumber}
                            readOnly={!isNew && !editCustomerPermission}
                            cypress="data-cy-mobilenumber"
                        />
                    </div>
                </div>
                <div className="row">
                    <div className="column">
                        <SCInput
                            onChange={handleInputChange}
                            error={inputErrors.WorkNumber}
                            label={"Work Number"}
                            name="WorkNumber"
                            value={inputs.WorkNumber}
                            readOnly={!isNew && !editCustomerPermission}
                            cypress="data-cy-worknumber"
                        />
                    </div>
                    <div className="column">
                        <SCInput
                            onChange={handleInputChange}
                            error={inputErrors.FaxNumber}
                            label={"Fax Number"}
                            name="FaxNumber"
                            value={inputs.FaxNumber}
                            readOnly={!isNew && !editCustomerPermission}
                            cypress="data-cy-faxnumber"
                        />
                    </div>
                </div>
                <div className="row">
                    <div className="column">
                        <SCInput
                            onChange={handleInputChange}
                            error={inputErrors.HomeNumber}
                            label={"Home Number"}
                            name="HomeNumber"
                            value={inputs.HomeNumber}
                            readOnly={!isNew && !editCustomerPermission}
                            cypress="data-cy-homenumber"
                        />
                    </div>
                    <div className="column">
                        <SCInput
                            onChange={handleInputChange}
                            error={inputErrors.IDNumber}
                            label={"ID Number"}
                            name="IDNumber"
                            value={inputs.IDNumber}
                            readOnly={!isNew && !editCustomerPermission}
                            cypress="data-cy-idnumber"
                        />
                    </div>
                </div>

                <div className="row">
                    <div className="column">
                        <SCComboBox
                            label="Designation"
                            name="Designation"
                            textField="Description"
                            dataItemKey="ID"
                            options={designations}
                            placeholder=""
                            onChange={designationChange}
                            value={selectedDesignation}
                        />
                    </div>
                    <div className="column"></div>
                </div>

                {/!* {module == Enums.Module.Supplier ?
                    <LoginAccess isNew={false} userID={inputs.UserID} userIsActive={inputs.UserIsActive} canLogin={inputs.canLogin} email={inputs.UserName}
                        password={inputs.password} confirmPassword={inputs.confirmPassword} handleInputChange={handleInputChange} inputErrors={inputErrors} />
                    : ''
                } *!/}
                <div className="row">
                    <div className="column">
                        <SCCheckbox
                            onChange={() => handleInputChange({ name: "SendEmail", value: !inputs.SendEmail })}
                            value={inputs.SendEmail}
                            label="Receive Email Notifications"
                            disabled={!isNew && !editCustomerPermission}
                            cypress="data-cy-emailnotification"
                        />
                    </div>
                    <div className="column">
                        <SCCheckbox
                            onChange={() => handleInputChange({ name: "IsPrimary", value: !inputs.IsPrimary })}
                            value={inputs.IsPrimary}
                            label="Primary Contact"
                            disabled={!isNew && (isPrimaryAlreadySet || !editCustomerPermission)}
                            title={!isNew && isPrimaryAlreadySet ? `Since this contact is already set as primary, you can only set it as primary on another contact.` : ''}
                            cypress="data-cy-primarycontact"
                        />
                    </div>
                </div>
                <div className="row">
                    <div className="column">
                        <SCCheckbox
                            onChange={() => handleInputChange({ name: "SendSMS", value: !inputs.SendSMS })}
                            value={inputs.SendSMS}
                            label="Receive SMS Notifications"
                            disabled={!isNew && !editCustomerPermission}
                            cypress="data-cy-receivesms"
                        />
                    </div>
                    <div className="column">
                        {module == Enums.Module.Customer ?
                            <SCCheckbox
                                onChange={() => handleInputChange({ name: "IsPrimaryAccount", value: !inputs.IsPrimaryAccount })}
                                value={inputs.IsPrimaryAccount}
                                label="Primary Accounting Contact"
                                disabled={!isNew && (isPrimaryAccountAlreadySet || !editCustomerPermission)}
                                title={!isNew && isPrimaryAccountAlreadySet ? `Since this contact is already set as primary accounting, you can only set it as primary accounting on another contact.` : ''}
                                cypress="data-cy-primaryaccountingcontact"
                            /> : ''
                        }
                    </div>
                </div>
                <div className="row">
                    <div className="column">
                        <SCCheckbox
                            onChange={() => handleInputChange({ name: "Unsubscribe", value: !inputs.Unsubscribe })}
                            value={!inputs.Unsubscribe}
                            label="Subscribed to SMS Marketing"
                            disabled={!isNew && !editCustomerPermission}
                            cypress="data-cy-unsubscribe"
                        />
                    </div>
                    <div className="column"></div>
                </div>
                {!isNew ?
                    <div className="switch">
                        <SCSwitch
                            name="IsActive"
                            onLabel="Active"
                            offLabel="Active"
                            checked={inputs.IsActive}
                            onChange={() => handleInputChange({ name: "IsActive", value: !inputs.IsActive })}
                            disabled={!canDeactivate || !editCustomerPermission}
                        />
                    </div> : ''
                }
                <div className="row align-end">
                    <Button text="Cancel" extraClasses="auto hollow" onClick={onCancel} />
                    {editCustomerPermission ?
                        <Button disabled={saving || accessStatus === Enums.AccessStatus.LockedWithAccess || accessStatus === Enums.AccessStatus.LockedWithOutAccess}
                            text={isNew ? 'Create' : 'Save'} extraClasses="auto left-margin" onClick={saveContact} />
                        : ''
                    }
                </div>
            </div>

            <style jsx>{`        
                .row {
                    display: flex;
                }
                .align-end {
                    justify-content: flex-end;
                    align-items: flex-end;
                  }
                .title {
                    color: ${colors.bluePrimary};
                    font-size: 1.125rem;
                    font-weight: bold;
                }
                .column {
                    display: flex;
                    flex-direction: column;
                    margin-left: 0.5rem;
                    width: ${layout.inputWidth};
                }                
                .switch {
                    flex-direction: row-reverse;
                    display: flex;
                }
            `}</style>
        </div>*/
    );
}

export default ManageContact;
