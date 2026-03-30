import React, { useState, useContext } from 'react';
import { colors, fontSizes, layout, fontFamily } from '../../../theme';
import TextInput from '../../text-input';
import SelectInput from '../../select-input';
import Button from '../../button';
import ToastContext from '../../../utils/toast-context';
import Fetch from '../../../utils/Fetch';
import * as Enums from '../../../utils/enums';
import ReactSwitch from '../../react-switch';
import PS from '../../../services/permission/permission-service';
import SCSwitch from "../../sc-controls/form-controls/sc-switch";

function EditLocation({ location, setEditLocation, updateLocation, countries, accessStatus }) {

  const toast = useContext(ToastContext);
  const [editCustomerPermission] = useState(PS.hasPermission(Enums.PermissionName.EditCustomer));

  let type = { ID: 0, Description: 'Delivery' };

  if (location.LocationType == 1) {
    type = { ID: 1, Description: 'Postal' };
  }

  const [locationType, setLocationType] = useState(type);
  const [selectedCountry, setSelectedCountry] = useState({ ID: location.CountryID });

  const [inputs, setInputs] = useState({
    countryDesc: location.CountryDescription,
    locationName: location.Description,
    addressOne: location.AddressLine1,
    addressTwo: location.AddressLine2,
    addressThree: location.AddressLine3,
    addressFour: location.AddressLine4,
    addressFive: location.AddressLine5,
    locationType: locationType.Description,
    isActive: location.IsActive,
    isPrimary: location.IsPrimary,
  });

  const isPrimaryAlreadySet = location.IsPrimary;

  const [inputErrors, setInputErrors] = useState({});

  const handleInputChange = (e) => {
    setInputs({
      ...inputs,
      [e.target.name]: e.target.value
    });
  }

  function validateInputs(inputNames) {
    let allValid = true;
    let newInputErrors = { ...inputErrors }
    let inputKeys = inputNames;
    if (!inputKeys) {
      inputKeys = Object.keys(inputs);
    }

    for (const input of inputKeys) {
      if (inputs[input] == "") {
        newInputErrors[input] = "Cannot be empty";
        allValid = false;
      } else {
        newInputErrors[input] = "";
      }
    }

    setInputErrors(newInputErrors);
    return allValid;
  }

  const update = async () => {
    const locationValid = validateInputs(['addressOne', 'locationName', 'country', 'locationType']);

    if (locationValid) {
      const updatedLocation = {
        ...location,
        AddressLine1: inputs.addressOne,
        AddressLine2: inputs.addressTwo,
        AddressLine3: inputs.addressThree,
        AddressLine4: inputs.addressFour,
        AddressLine5: inputs.addressFive,
        CountryDescription: inputs.countryDesc,
        CountryID: selectedCountry.ID,
        Description: inputs.locationName,
        LocationType: locationType.ID,
        IsPrimary: inputs.isPrimary,
        IsActive: inputs.isActive,
      }

      let [savedLocation, message] = await saveLocation(updatedLocation);
      if (savedLocation) {
        updateLocation(savedLocation);
        toast.setToast({
          message: 'Location saved successfully',
          show: true,
          type: 'success'
        });
        setEditLocation(null);
      } else {
        toast.setToast({
          message: message,
          show: true,
          type: Enums.ToastType.error,
        });
      }
    } else {
      toast.setToast({
        message: 'There are errors on the page',
        show: true,
        type: Enums.ToastType.error,
      });
    }
  }

  async function saveLocation(locationToSave) {
    const locationPut = await Fetch.put({
      url: '/Location',
      params: locationToSave,
      toastCtx: toast
    });

    if (locationPut.ID) {
      return [locationPut, locationPut.serverMessage];
    } else {
      return [null, locationPut.serverMessage];
    }
  }

  return (
    <div className="overlay" onClick={(e) => e.stopPropagation()}>
      <div className="modal-container">
        <div className="title">
          {"Editing location " + location.Description}
        </div>

        <div className="row">
          <div className="column">
            <TextInput
              changeHandler={handleInputChange}
              error={inputErrors.locationName}
              label={"Location Name/Descripition"}
              name="locationName"
              placeholder={"e.g. Head Office"}
              value={inputs.locationName}
              tabIndex={1}
              readOnly={!editCustomerPermission}
            />
          </div>
          <div className="column">
            <TextInput
              changeHandler={handleInputChange}
              error={inputErrors.addressOne}
              required={true}
              label={"Address Line 1"}
              name="addressOne"
              placeholder={"Address Line 1"}
              value={inputs.addressOne}
              tabIndex={4}
              readOnly={!editCustomerPermission}
            />
          </div>
        </div>

        <div className="row">
          <div className="column">
            <SelectInput
              changeHandler={handleInputChange}
              label="Location Type"
              noInput={true}
              options={[{ ID: 0, Description: 'Delivery' }, { ID: 1, Description: 'Postal' }]}
              placeholder="Select location type"
              name="locationType"
              setSelected={setLocationType}
              type="option-description"
              value={inputs.locationType}
              tabIndex={2}
              disabled={!editCustomerPermission}
            />
          </div>
          <div className="column">
            <TextInput
              changeHandler={handleInputChange}
              error={inputErrors.addressTwo}
              label={"Address Line 2"}
              name="addressTwo"
              placeholder={"Address Line 2"}
              value={inputs.addressTwo}
              tabIndex={5}
              readOnly={!editCustomerPermission}
            />
          </div>
        </div>

        <div className="row">
          <div className="column">
            <SelectInput
              changeHandler={handleInputChange}
              label="Country"
              noInput={true}
              options={countries}
              placeholder="Select location country"
              name="countryDesc"
              setSelected={setSelectedCountry}
              type="countries"
              value={inputs.countryDesc}
              tabIndex={3}
              disabled={!editCustomerPermission}
            />
          </div>
          <div className="column">
            <TextInput
              changeHandler={handleInputChange}
              error={inputErrors.addressThree}
              label={"Address Line 3"}
              name="addressThree"
              placeholder={"Address Line 3"}
              value={inputs.addressThree}
              tabIndex={6}
              readOnly={!editCustomerPermission}
            />
          </div>
        </div>

        <div className="row">
          <div className="column">

          </div>
          <div className="column">
            <TextInput
              changeHandler={handleInputChange}
              error={inputErrors.addressFour}
              label={"Address Line 4"}
              name="addressFour"
              placeholder={"Address Line 4"}
              value={inputs.addressFour}
              tabIndex={7}
              readOnly={!editCustomerPermission}
            />
          </div>
        </div>

        <div className="row">
          <div className="column">

          </div>
          <div className="column">
            <TextInput
              changeHandler={handleInputChange}
              error={inputErrors.addressFive}
              label={"Address Line 5"}
              name="addressFive"
              placeholder={"Address Line 5"}
              value={inputs.addressFive}
              tabIndex={8}
              readOnly={!editCustomerPermission}
            />
          </div>
        </div>

        <div className="row switch">
          <div className="column">
            <SCSwitch
              title={isPrimaryAlreadySet ? `Since this location is already set as primary, you can only set it as primary on another location.` : ''}
              label="Primary"
              checked={inputs.isPrimary}
              onToggle={() => handleInputChange({ target: { name: "isPrimary", value: !inputs.isPrimary } })}
              disabled={isPrimaryAlreadySet || !editCustomerPermission}
            />
            {/*<ReactSwitch
              title={isPrimaryAlreadySet ? `Since this location is already set as primary, you can only set it as primary on another location.` : ''}
              label="Primary"
              checked={inputs.isPrimary}
              handleChange={() => handleInputChange({ target: { name: "isPrimary", value: !inputs.isPrimary } })}
              disabled={isPrimaryAlreadySet || !editCustomerPermission}
            />*/}
          </div>
          <div className="column">
            <SCSwitch label="Active" checked={inputs.isActive}
              onToggle={() => handleInputChange({ target: { name: "isActive", value: !inputs.isActive } })}
              disabled={!editCustomerPermission || inputs.isPrimary}
            />
            {/*<ReactSwitch label="Active" checked={inputs.isActive}
              handleChange={() => handleInputChange({ target: { name: "isActive", value: !inputs.isActive } })}
              disabled={!editCustomerPermission}
            />*/}
          </div>
        </div>

        <div className="row">
          <div className="cancel">
            <Button text="Cancel" extraClasses="hollow" onClick={() => setEditLocation(null)} />
          </div>
          {editCustomerPermission ?
            <div className="update">
              <Button disabled={accessStatus === Enums.AccessStatus.LockedWithAccess || accessStatus === Enums.AccessStatus.LockedWithOutAccess}
                text="Update" onClick={update} />
            </div>
            : ""}
        </div>
      </div>
      <style jsx>{`
        .row {
          display: flex;
          justify-content: space-between;
        }
        .column {
          display: flex;
          flex-direction: column;
          width: 100%;
        }
        .column + .column {
          margin-left: 1.25rem;
        }
        .align-end {
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
        .status {
          align-items: center;
          background-color: rgba(28,37,44,0.2);
          border-radius: ${layout.buttonRadius};
          box-sizing: border-box;
          color: ${colors.darkPrimary};
          display: flex;
          font-size: 0.75rem;
          font-weight: bold;
          height: 2rem;
          justify-content: center;
          padding: 0 1rem;
          text-align: center;
        }
        .arrow {
          padding: 0.25rem 1rem;
        }
        .cancel {
          width: 6rem;
        }
        .update {
          width: 14rem;
        }
        .switch {
          margin-top: 1rem;
        }
        .more {
          color: ${colors.bluePrimary};
          cursor: pointer;
          display: flex;
          justify-content: flex-end;
          margin-top: 1rem;
        }
      `}</style>
    </div>
  )
}

export default EditLocation
