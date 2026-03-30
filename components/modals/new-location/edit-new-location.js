import React, { useState } from 'react';
import { colors, fontSizes, layout, fontFamily } from '../../../theme';
import TextInput from '../../text-input';
import SelectInput from '../../select-input';
import Button from '../../button';

function EditNewLocation({locations, index, setIndex, setLocations, countries}) {

  const location = locations[index];

  let type = {ID: 0, Description: 'Delivery'};
  if (location.LocationType == 1) {
    type = {ID: 1, Description: 'Postal'};
  }

  const [locationType, setLocationType] = useState(type);
  const [selectedCountry, setSelectedCountry] = useState({});

  const [inputs, setInputs] = useState({
    country: location.CountryDescription,
    locationName: location.Description,
    addressOne: location.AddressLine1,
    addressTwo: location.AddressLine2,
    addressThree: location.AddressLine3,
    addressFour: location.AddressLine4,
    addressFive: location.AddressLine5,
    locationType: locationType.Description,
  });

  const [inputErrors, setInputErrors] = useState({});

  const handleInputChange = (e) => {
    setInputs({
      ...inputs,
      [e.target.name]: e.target.value
    });
  };

  function validateInputs(inputNames) {
    let allValid = true;
    let newInputErrors = {...inputErrors}
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

  function update() {
    const locationValid = validateInputs(['addressOne','locationName','country','locationType']);

    if (locationValid) {
      const newLocation = {
        ...location,
        AddressLine1: inputs.addressOne, 
        AddressLine2: inputs.addressTwo, 
        AddressLine3: inputs.addressThree, 
        AddressLine4: inputs.addressFour,
        AddressLine5: inputs.addressFive,
        CountryDescription: inputs.country,
        CountryID: selectedCountry.ID,
        Description: inputs.locationName, 
        LocationType: locationType.ID,
      }

      let newLocations = [...locations];
      newLocations[index] = newLocation;
      setLocations(newLocations)
      setIndex(undefined);
    }
  }

  return (
    <div className="overlay" onClick={(e) => e.stopPropagation()}>
      <div className="container">
        <div className="title">
          {"Editing location " + location.Description}
        </div>
        <div className="input-row">
          <div className="column">
            <TextInput 
              changeHandler={handleInputChange}
              error={inputErrors.locationName}
              label={"Location Name/Descripition"} 
              name="locationName"
              placeholder={"e.g. Head Office"}
              value={inputs.locationName}
            />
            <TextInput 
              changeHandler={handleInputChange}
              error={inputErrors.addressOne}
              label={"Address Line 1"} 
              name="addressOne"
              placeholder={"Address Line 1"}
              value={inputs.addressOne}
            />
            <TextInput 
              changeHandler={handleInputChange}
              error={inputErrors.addressTwo}
              label={"Address Line 2"} 
              name="addressTwo"
              placeholder={"Address Line 2"}
              value={inputs.addressTwo}
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
            />
            <TextInput 
              changeHandler={handleInputChange}
              error={inputErrors.addressFour}
              label={"Address Line 4"} 
              name="addressFour"
              placeholder={"Address Line 4"}
              value={inputs.addressFour}
            />
            <TextInput 
              changeHandler={handleInputChange}
              error={inputErrors.addressFive}
              label={"Address Line 5"} 
              name="addressFive"
              placeholder={"Address Line 5"}
              value={inputs.addressFive}
            />
            <SelectInput
              changeHandler={handleInputChange} 
              label="Location Type"
              noInput={true}
              options={[{ID: 0, Description: 'Delivery'}, {ID: 1, Description: 'Postal'}]}
              placeholder="Select location type"
              name="locationType"
              setSelected={setLocationType}
              type="option-description"
              value={inputs.locationType} 
            />
            <SelectInput
              changeHandler={handleInputChange} 
              label="Country"
              noInput={true}
              options={countries}
              placeholder="Select location country"
              name="country"
              setSelected={setSelectedCountry}
              type="countries"
              value={inputs.country} 
            />
          </div>
        </div>
        <div className="row space-between">
          <div className="cancel">
            <Button text="Cancel" extraClasses="hollow" onClick={() => setIndex(undefined)}/>
          </div>
          <div className="update">
            <Button text="Update" onClick={update}/>
          </div>
        </div>
      </div>
      <style jsx>{`
        .overlay {
          align-items: center;
          background-color: rgba(19, 106, 205, 0.9);
          bottom: 0;
          display: flex;
          justify-content: center;
          left: 0;
          position: fixed;
          right: 0;
          top: 0;
          z-index: 9999;
        }
        .container {
          background-color: ${colors.white};
          border-radius: ${layout.cardRadius};
          padding: 2rem 3rem;
          width: 38rem;
        }
        .row {
          display: flex;
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
        .column {
          display: flex;
          flex-direction: column;
          flex-grow: 1;
          margin-left: 1.5rem;
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

export default EditNewLocation
