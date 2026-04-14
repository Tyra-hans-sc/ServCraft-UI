import React, { useState, useContext } from 'react';
import { colors, fontSizes, layout, fontFamily } from '../../../theme';
import TextInput from '../../text-input';
import SelectInput from '../../select-input';
import Button from '../../button';
import Fetch from '../../../utils/Fetch';
import ToastContext from '../../../utils/toast-context';
import Helper from '../../../utils/helper';
import * as Enums from '../../../utils/enums';
import ReactSwitch from '../../react-switch';
import SCSwitch from "../../sc-controls/form-controls/sc-switch";

function CreateLocation({createLocation, setCreateLocation, module, moduleData, countries}) {

  const toast = useContext(ToastContext);
  const [locationType, setLocationType] = useState({});
  const [selectedCountry, setSelectedCountry] = useState({});

  const [inputs, setInputs] = useState({
    countryDesc: "",
    locationName: "",
    addressOne: "",
    addressTwo: "",
    addressThree: "",
    addressFour: "",
    addressFive: "",
    locationType: "",
    isPrimary: false,
  });

  const [inputErrors, setInputErrors] = useState({});

  const handleInputChange = (e) => {
    setInputs({
      ...inputs,
      [e.target.name]: e.target.value
    });
  };

  const validate = () => {
    let validationItems = [
      {key: 'addressOne', value: inputs.addressOne, required: true, type: Enums.ControlType.Text},
      {key: 'locationName', value: inputs.locationName, required: true, type: Enums.ControlType.Text},
      {key: 'countryDesc', value: inputs.countryDesc, required: true, type: Enums.ControlType.Text},
      {key: 'locationType', value: inputs.locationType, required: true, type: Enums.ControlType.Text},
    ];
    const {isValid, errors} = Helper.validateInputs(validationItems);
    setInputErrors(errors);
    return isValid;
  };

  const [saving, setSaving] = useState(false);

  const submit = async () => {

    setSaving(true);
    const locationValid = validate();

    if (locationValid) {

      let newLocation = { 
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
        IsActive: true,
      };

      if (module == Enums.Module.Customer) {
        newLocation = {...newLocation, 
          CustomerID: moduleData.ID,
        };
      } else {
        newLocation = {...newLocation,
          SupplierID: moduleData.ID,
        };
      }

      let savedLocation = await saveLocation(newLocation);
      if (savedLocation) {
        createLocation(savedLocation);
        toast.setToast({
          message: 'Location saved successfully',
          show: true,
          type: 'success'
        });
        setCreateLocation(false);
      } else {
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
  };

  const saveLocation = async (locationToSave) => {
    const post = await Fetch.post({
      url: '/Location',
      params: locationToSave,
      toastCtx: toast
    });

    if (post.ID) {
      return post;
    } else {
      return null;
    }
  };

  return (
    <div className="overlay" onClick={(e) => e.stopPropagation()}>
      <div className="container">
        <div className="title">
          {"Add new location"}
        </div>
        <div className="row">
          <div className="column">
            <TextInput 
              changeHandler={handleInputChange}
              error={inputErrors.locationName}
              label={"Location Name/Descripition"} 
              name="locationName"
              placeholder={"e.g. Head Office"}
              required={true}
              value={inputs.locationName}
              tabIndex={1}
            />
          </div>
          <div className="column">
            <TextInput 
              changeHandler={handleInputChange}
              error={inputErrors.addressOne}
              label={"Address Line 1"} 
              name="addressOne"
              placeholder={"Address Line 1"}
              required={true}
              value={inputs.addressOne}
              tabIndex={4}
            />
          </div>
        </div>
        <div className="row">
          <div className="column">
            <SelectInput
              changeHandler={handleInputChange} 
              error={inputErrors.locationType}
              label="Location Type"
              noInput={true}
              options={[{ID: 0, Description: 'Delivery'}, {ID: 1, Description: 'Postal'}]}
              placeholder="Select location type"
              name="locationType"
              required={true}
              setSelected={setLocationType}
              type="option-description"
              value={inputs.locationType}
              tabIndex={2}
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
            />
          </div>
        </div>
        <div className="row">
          <div className="column">
            <SelectInput
              changeHandler={handleInputChange} 
              error={inputErrors.countryDesc}
              label="Country"
              noInput={true}
              options={countries}
              placeholder="Select country"
              name="countryDesc"
              required={true}
              setSelected={setSelectedCountry}
              type="countries"
              value={inputs.countryDesc}
              tabIndex={3}
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
            />
          </div>
        </div>

        <div className="row switch">
          <div className="column">
            <SCSwitch label="Primary" checked={inputs.isPrimary} onToggle={() => handleInputChange({ target: { name: "isPrimary", value: !inputs.isPrimary } })} />
            {/*<ReactSwitch label="Primary" checked={inputs.isPrimary} handleChange={() => handleInputChange({ target: { name: "isPrimary", value: !inputs.isPrimary } })} />*/}
          </div>
        </div>

        <div className="row">
          <div className="cancel">
            <Button text="Cancel" extraClasses="hollow" onClick={() => setCreateLocation(false)}/>
          </div>
          <div className="update">
            <Button text="Add location" onClick={submit} disabled={saving} />
          </div>
        </div>
      </div>
      <style jsx>{`
        .container {
          background-color: ${colors.white};
          border-radius: ${layout.cardRadius};
          padding: 2rem 3rem;
          width: 38rem;
        }
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
        
        .space-between {
          justify-content: space-between;
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
        .input-row {
          display: flex;
          margin-left: -1.5rem;
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

export default CreateLocation;
