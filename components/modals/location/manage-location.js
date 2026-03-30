import React, { useState, useContext, useEffect } from 'react';
import { colors, fontSizes, layout, fontFamily } from '../../../theme';
import SCComboBox from '../../sc-controls/form-controls/sc-combobox';
import SCInput from '../../sc-controls/form-controls/sc-input';
import ToastContext from '../../../utils/toast-context';
import Fetch from '../../../utils/Fetch';
import * as Enums from '../../../utils/enums';
import Helper from '../../../utils/helper';
import SCSwitch from '../../sc-controls/form-controls/sc-switch';
import PS from '../../../services/permission/permission-service';
import CustomerService from '../../../services/customer/customer-service';
import constants from '../../../utils/constants';
import {Group, Title, Button, Loader} from "@mantine/core";
import {IconChevronLeft} from "@tabler/icons";
import SCModal from "@/PageComponents/Modal/SCModal";
import SCDropdownList from '@/components/sc-controls/form-controls/sc-dropdownlist';

function ManageLocation({isNew, location, module, moduleData, countries, onSave, onCancel, accessStatus, backButtonText}) {

    const [editCustomerPermission] = useState(PS.hasPermission(Enums.PermissionName.EditCustomer) || module == Enums.Module.Supplier);
    const toast = useContext(ToastContext);                

    const [inputs, setInputs] = useState({});

    const handleInputChange = (e) => {
        setInputs({
            ...inputs,
            [e.name]: e.value
        });
    };

    useEffect(() => {
        let inputState = {};

        if (isNew) {
            inputState = {            
                Description: '',
                AddressLine1: '',
                AddressLine2: '',
                AddressLine3: '',
                AddressLine4: '',
                AddressLine5: '',
                IsActive: true,
                IsPrimary: false
            };
        } else {
            inputState = {
                ID: location.ID,
                Description: location.Description,
                AddressLine1: location.AddressLine1,
                AddressLine2: location.AddressLine2,
                AddressLine3: location.AddressLine3,
                AddressLine4: location.AddressLine4,
                AddressLine5: location.AddressLine5,
                IsActive: location.IsActive,
                IsPrimary: location.IsPrimary,
                RowVersion: location.RowVersion,
            };
        }
        setInputs(inputState);

        getCountrySelection();
    }, []);

    const [selectedLocationType, setSelectedLocationType] = useState(isNew ? undefined : Enums.getEnumStringValue(Enums.LocationType, location.LocationType));
    const locationTypes = Enums.getEnumItems(Enums.LocationType);

    const handleLocationTypeChange = (value) => {
        setSelectedLocationType(value);
    };

    const [selectedCountry, setSelectedCountry] = useState();

    const handleCountryChange = (value) => {
        setSelectedCountry(value);
    };

    const getCountrySelection = async () => {
        if (isNew) {
            if (countries.length > 0) {
                let sa = countries.find(x => x.Description == "South Africa");
                setSelectedCountry(sa);
            }
        } else {
            let country = await CustomerService.getCountry(location.CountryID);
            setSelectedCountry(country);
        }
    };

    const [isPrimaryAlreadySet] = useState(isNew ? false : location.IsPrimary);

    const [inputErrors, setInputErrors] = useState({});

    const validate = () => {
        let validationItems = [
            {key: 'AddressLine1', value: inputs.AddressLine1, required: true, type: Enums.ControlType.Text},
            {key: 'Description', value: inputs.Description, required: true, type: Enums.ControlType.Text},
            {key: 'Country', value: selectedCountry, required: true, type: Enums.ControlType.Text},
            {key: 'LocationType', value: selectedLocationType, required: true, type: Enums.ControlType.Text},
        ];
        const {isValid, errors} = Helper.validateInputs(validationItems);
        setInputErrors(errors);
        return isValid;
    };

    const [saving, setSaving] = useState(false);

    const saveLocation = async () => {
        setSaving(true);

        let isValid = validate();

        if (isValid) {
            var locationTypeToSave = Enums.LocationType[selectedLocationType];

            let params = {...inputs, 
                CountryID: selectedCountry.ID,
                LocationType: locationTypeToSave,
            };
            if (module == Enums.Module.Customer) {
                params = {...params, 
                    CustomerID: moduleData.ID,
                };
            } else {
                params = {...params,
                    SupplierID: moduleData.ID,
                };
            }
            let response = {};
            if (isNew) {
                response = await Fetch.post({
                    url: '/Location',
                    params: params,
                    toastCtx: toast
                });
            } else {
                response = await Fetch.put({
                    url: '/Location',
                    params: params,
                    toastCtx: toast
                });
            }

            if (response.ID) {
                Helper.mixpanelTrack(isNew ? constants.mixPanelEvents.createLocation : constants.mixPanelEvents.editLocation, {
                    "locationID": response.ID
                });
                toast.setToast({
                    message: 'Location saved successfully',
                    show: true,
                    type: Enums.ToastType.success
                });
                onSave(response);
            } else {
                toast.setToast({
                    message: `Location failed to save`,
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

            <div>
                <div>
                    {
                        backButtonText &&
                        <Group style={(theme) => ({
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
                        size={'md'}
                        fw={600}
                    >
                        {isNew ? `Add new location` : `Editing location ${inputs.Description}`}
                    </Title>
                </div>
                {/*<div className="title">
                    <h1>{isNew ? `Add new location` : `Editing location ${inputs.Description}`}</h1>
                </div>*/}
                <div className="row">
                    <div className="column">
                        <SCInput
                            required={true}
                            onChange={handleInputChange}
                            error={inputErrors.Description}
                            label={"Location Name/Descripition"}
                            name="Description"
                            hint={"e.g. Head Office"}
                            value={inputs.Description}
                            readOnly={!isNew && !editCustomerPermission}
                            tabIndex={1}
                            cypress="data-cy-location-description"
                        />
                    </div>
                    <div className="column">
                        <SCInput
                            onChange={handleInputChange}
                            error={inputErrors.AddressLine1}
                            required={true}
                            label={"Address Line 1"}
                            name="AddressLine1"
                            value={inputs.AddressLine1}
                            readOnly={!isNew && !editCustomerPermission}
                            tabIndex={4}
                            cypress="data-cy-addressline1"
                        />
                    </div>
                </div>
                <div className="row">
                    <div className="column">
                        <SCDropdownList
                            onChange={handleLocationTypeChange}
                            name="LocationType"
                            value={selectedLocationType}
                            options={locationTypes}
                            label="Type"
                            required={true}
                            error={inputErrors.LocationType}
                            tabIndex={2}
                            cypress="data-cy-locationtype"
                        />
                    </div>
                    <div className="column">
                        <SCInput
                            onChange={handleInputChange}
                            error={inputErrors.AddressLine2}
                            label={"Address Line 2"}
                            name="AddressLine2"
                            value={inputs.AddressLine2}
                            readOnly={!isNew && !editCustomerPermission}
                            tabIndex={5}
                            cypress="data-cy-addressline2"
                        />
                    </div>
                </div>
                <div className="row">
                    <div className="column">
                        <SCDropdownList
                            onChange={handleCountryChange}
                            name="Country"
                            textField="Description"
                            dataItemKey="ID"
                            value={selectedCountry}
                            options={countries}
                            label="Country"
                            required={true}
                            error={inputErrors.Country}
                            tabIndex={3}
                            cypress="data-cy-country"
                        />
                    </div>
                    <div className="column">
                        <SCInput
                            onChange={handleInputChange}
                            error={inputErrors.AddressLine3}
                            label={"Address Line 3"}
                            name="AddressLine3"
                            value={inputs.AddressLine3}
                            readOnly={!isNew && !editCustomerPermission}
                            tabIndex={6}
                            cypress="data-cy-addressline3"
                        />
                    </div>
                </div>
                <div className="row">
                    <div className="column"></div>
                    <div className="column">
                        <SCInput
                            onChange={handleInputChange}
                            error={inputErrors.AddressLine4}
                            label={"Address Line 4"}
                            name="AddressLine4"
                            value={inputs.AddressLine4}
                            readOnly={!isNew && !editCustomerPermission}
                            tabIndex={7}
                            cypress="data-cy-addressline4"
                        />
                    </div>
                </div>
                <div className="row">
                    <div className="column"></div>
                    <div className="column">
                        <SCInput
                            onChange={handleInputChange}
                            error={inputErrors.AddressLine5}
                            label={"Address Line 5"}
                            name="AddressLine5"
                            value={inputs.AddressLine5}
                            readOnly={!isNew && !editCustomerPermission}
                            tabIndex={8}
                            cypress="data-cy-addressline5"
                        />
                    </div>
                </div>
                <div className="row switch">
                    <div className="column">
                        <SCSwitch
                            name="IsPrimary"
                            onLabel="Primary"
                            offLabel="Primary"
                            title={isPrimaryAlreadySet ? `Since this location is already set as primary, you can only set it as primary on another location.` : ''}
                            checked={inputs.IsPrimary}
                            onChange={() => handleInputChange({ name: "IsPrimary", value: !inputs.IsPrimary })}
                            disabled={!isNew && (isPrimaryAlreadySet || !editCustomerPermission)}
                        />
                    </div>
                    <div className="column">
                        {isNew ? '' :
                            <SCSwitch
                                name="IsActive"
                                onLabel="Active"
                                offLabel="Active"
                                checked={inputs.IsActive}
                                onChange={() => handleInputChange({ name: "IsActive", value: !inputs.IsActive })}
                                disabled={(!isNew && !editCustomerPermission) || inputs.IsPrimary}
                            />
                        }
                    </div>
                </div>

                <Group mt={'5rem'} justify={'right'} gap={'xs'}>
                    <Button type={'button'} variant={'subtle'} color={'gray.9'} onClick={onCancel}>
                        Cancel
                    </Button>
                    {
                        editCustomerPermission &&
                        <Button color={'scBlue'}
                                disabled={saving || accessStatus === Enums.AccessStatus.LockedWithAccess || accessStatus === Enums.AccessStatus.LockedWithOutAccess}
                                rightSection={saving && <Loader variant={'oval'} size={18} color={'white'}/>}
                                onClick={saveLocation}
                        >
                            {isNew ? 'Create' : 'Save'}
                        </Button>
                    }
                </Group>

                {/*<div className="row align-end">
                    <Button text="Cancel" extraClasses="auto hollow" onClick={onCancel} />
                    {editCustomerPermission ?
                        <Button disabled={saving || accessStatus === Enums.AccessStatus.LockedWithAccess || accessStatus === Enums.AccessStatus.LockedWithOutAccess}
                                text={isNew ? 'Create' : 'Save'} extraClasses="auto left-margin" onClick={saveLocation} />
                        : ''
                    }
                </div>*/}
            </div>

            <style jsx>{`
                .row {
                    display: flex;
                }
                .column {
                    display: flex;
                    flex-direction: column;
                    //width: ${layout.inputWidth};
                    flex-grow: 1;
                    max-width: 270px;
                }
                .column + .column {
                    margin-left: 1.25rem;
                }
                .align-end {
                    justify-content: flex-end;
                    align-items: flex-end;
                }
                .title {
                    color: ${colors.bluePrimary};
                    font-size: 1.125rem;
                    font-weight: bold;
                    margin-bottom: 1rem;
                }
                .label {
                    font-size: 0.875rem;
                    margin-bottom: 0.5rem;
                }
                .switch {
                    margin-top: 1rem;
                }
            `}</style>

        </SCModal>


/*
        <div className="overlay" onClick={(e) => e.stopPropagation()}>
            <div className="modal-container">
                <div className="title">
                    <h1>{isNew ? `Add new location` : `Editing location ${inputs.Description}`}</h1>
                </div>
                <div className="row">
                    <div className="column">
                        <SCInput
                            onChange={handleInputChange}
                            error={inputErrors.Description}
                            label={"Location Name/Descripition"}
                            name="Description"
                            hint={"e.g. Head Office"}
                            value={inputs.Description}
                            readOnly={!isNew && !editCustomerPermission}
                            tabIndex={1}
                            cypress="data-cy-location-description"
                        />
                    </div>
                    <div className="column">
                        <SCInput
                            onChange={handleInputChange}
                            error={inputErrors.AddressLine1}
                            required={true}
                            label={"Address Line 1"}
                            name="AddressLine1"
                            value={inputs.AddressLine1}
                            readOnly={!isNew && !editCustomerPermission}
                            tabIndex={4}
                            cypress="data-cy-addressline1"
                        />
                    </div>
                </div>
                <div className="row">
                    <div className="column">
                        <SCComboBox
                            onChange={handleLocationTypeChange}
                            name="LocationType"
                            value={selectedLocationType}
                            options={locationTypes}
                            label="Type"
                            required={true}
                            error={inputErrors.LocationType}
                            tabIndex={2}
                            cypress="data-cy-locationtype"
                        />
                    </div>
                    <div className="column">
                        <SCInput
                            onChange={handleInputChange}
                            error={inputErrors.AddressLine2}
                            label={"Address Line 2"}
                            name="AddressLine2"
                            value={inputs.AddressLine2}
                            readOnly={!isNew && !editCustomerPermission}
                            tabIndex={5}
                            cypress="data-cy-addressline2"
                        />
                    </div>
                </div>
                <div className="row">
                    <div className="column">
                        <SCComboBox
                            onChange={handleCountryChange}
                            name="Country"
                            textField="Description"
                            dataItemKey="ID"
                            value={selectedCountry}
                            options={countries}
                            label="Country"
                            required={true}
                            error={inputErrors.Country}
                            tabIndex={3}
                            cypress="data-cy-country"
                        />
                    </div>
                    <div className="column">
                        <SCInput
                            onChange={handleInputChange}
                            error={inputErrors.AddressLine3}
                            label={"Address Line 3"}
                            name="AddressLine3"
                            value={inputs.AddressLine3}
                            readOnly={!isNew && !editCustomerPermission}
                            tabIndex={6}
                            cypress="data-cy-addressline3"
                        />
                    </div>
                </div>
                <div className="row">
                    <div className="column"></div>
                    <div className="column">
                        <SCInput
                            onChange={handleInputChange}
                            error={inputErrors.AddressLine4}
                            label={"Address Line 4"}
                            name="AddressLine4"
                            value={inputs.AddressLine4}
                            readOnly={!isNew && !editCustomerPermission}
                            tabIndex={7}
                            cypress="data-cy-addressline4"
                        />
                    </div>
                </div>
                <div className="row">
                    <div className="column"></div>
                    <div className="column">
                        <SCInput
                            onChange={handleInputChange}
                            error={inputErrors.AddressLine5}
                            label={"Address Line 5"}
                            name="AddressLine5"
                            value={inputs.AddressLine5}
                            readOnly={!isNew && !editCustomerPermission}
                            tabIndex={8}
                            cypress="data-cy-addressline5"
                        />
                    </div>
                </div>
                <div className="row switch">
                    <div className="column">
                        <SCSwitch 
                            name="IsActive" 
                            onLabel="Primary" 
                            offLabel="Primary"
                            title={isPrimaryAlreadySet ? `Since this location is already set as primary, you can only set it as primary on another location.` : ''}
                            checked={inputs.IsPrimary}
                            onChange={() => handleInputChange({ name: "IsPrimary", value: !inputs.IsPrimary })}
                            disabled={!isNew && (isPrimaryAlreadySet || !editCustomerPermission)}
                        />
                    </div>
                    <div className="column">
                        {isNew ? '' :
                            <SCSwitch 
                                name="IsActive" 
                                onLabel="Active" 
                                offLabel="Active" 
                                checked={inputs.IsActive}
                                onChange={() => handleInputChange({ name: "IsActive", value: !inputs.IsActive })}
                                disabled={!isNew && !editCustomerPermission}
                            />
                        }
                    </div>
                </div>
                <div className="row align-end">
                    <Button text="Cancel" extraClasses="auto hollow" onClick={onCancel} />
                    {editCustomerPermission ?                        
                        <Button disabled={saving || accessStatus === Enums.AccessStatus.LockedWithAccess || accessStatus === Enums.AccessStatus.LockedWithOutAccess}
                            text={isNew ? 'Create' : 'Save'} extraClasses="auto left-margin" onClick={saveLocation} />
                        : ''
                    }
                </div>
            </div>

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
                .align-end {
                    justify-content: flex-end;
                    align-items: flex-end;
                }
                .title {
                    color: ${colors.bluePrimary};
                    font-size: 1.125rem;
                    font-weight: bold;
                    margin-bottom: 1rem;
                }
                .label {
                    font-size: 0.875rem;
                    margin-bottom: 0.5rem;
                }
                .switch {
                    margin-top: 1rem;
                }
            `}</style>
        </div>
*/
    );
}

export default ManageLocation;
