import React, { useState, useContext } from 'react'
import { colors, fontSizes, layout, fontFamily } from '../../../theme'
import TextInput from '../../text-input';
import SCInput from '../../sc-controls/form-controls/sc-input';
import SCComboBox from '../../sc-controls/form-controls/sc-combobox';
import Button from '../../button'
import Helper from '../../../utils/helper';
import * as Enums from '../../../utils/enums';
import ToastContext from '../../../utils/toast-context';

function EditNewContact({contacts, index, setIndex, setContacts, designations}) {

  const toast = useContext(ToastContext);

  const contact = contacts[index];

  const [inputs, setInputs] = useState({
    firstName: contact.FirstName,
    lastName: contact.LastName,
    email: contact.EmailAddress,
    number: contact.MobileNumber,
    Designation: contact.Designation,
  });
  const [inputErrors, setInputErrors] = useState({});

  const handleInputChange = (e) => {
    setInputs({
      ...inputs,
      [e.name]: e.value
    });
  }

  const [selectedDesignation, setSelectedDesignation] = useState(contact.Designation);

  const handleDesignationChange = (value) => {
    setSelectedDesignation(value);
  };

  function update() {
    let validationItems = [
      {key: 'firstName', value: inputs.firstName, required: true, type: Enums.ControlType.Text},
      {key: 'lastName', value: inputs.lastName, required: true, type: Enums.ControlType.Text},
      {key: 'email', value: inputs.email, type: Enums.ControlType.Email},
      {key: 'number', value: inputs.number, type: Enums.ControlType.ContactNumber},
      {key: 'email', value: inputs.email, type: Enums.ControlType.Email, group: 'email_number'},
      {key: 'number', value: inputs.number, type: Enums.ControlType.Number, group: 'email_number'},
    ];
    const {isValid, errors} = Helper.validateInputs(validationItems);
    setInputErrors(errors);

    if (isValid) {
      const newContact = {
        ...contact,
        EmailAddress: inputs.email,
        FirstName: inputs.firstName,
        LastName: inputs.lastName,
        MobileNumber: inputs.number,
        Designation: selectedDesignation,
      }
      let newContacts = [...contacts];
      newContacts[index] = newContact;
      setContacts(newContacts)
      setIndex(undefined);
    } else {
      toast.setToast({
        message: 'There are errors on the page',
        show: true,
        type: 'error'
      });
    }
  }

  return (
    <div className="overlay" onClick={(e) => e.stopPropagation()}>
      <div className="modal-container">
        <div className="title">
          {"Editing contact " + contact.FirstName + " " + contact.LastName}
        </div>        
        <div className="input-row">
          <div className="column">
            <SCInput
              onChange={handleInputChange}
              error={inputErrors.firstName}
              label={"Contact first name"} 
              name="firstName"
              placeholder={"Name"}
              required={true}
              value={inputs.firstName}
            />
            <SCInput 
              onChange={handleInputChange}
              error={inputErrors.email}
              label={"Email"} 
              name="email"
              hint={"name@example.com"}
              required={true}
              value={inputs.email}
            />
          </div>
          <div className="column">
            <SCInput 
              onChange={handleInputChange}
              error={inputErrors.lastName}
              label={"Contact last name"} 
              name="lastName"
              required={true}
              value={inputs.lastName}
            />
            <SCInput 
              onChange={handleInputChange}
              error={inputErrors.number}
              label={"Mobile number"} 
              name="number"
              required={true}
              value={inputs.number}
            />
          </div>
        </div>

        <div className="input-row">
          <div className="column">
            <SCComboBox
                label="Designation"
                name="Designation"
                textField="Description"
                dataItemKey="ID"                
                options={designations}
                placeholder=""
                onChange={handleDesignationChange}                
                value={selectedDesignation}
            />
          </div>
        </div>

        <div className="row align-end">
            <Button text="Cancel" extraClasses="hollow auto" onClick={() => setIndex(undefined)}/>
            <Button text="Update" extraClasses="auto left-margin" onClick={update}/>
        </div>
      </div>
      <style jsx>{`
        
        .row {
          display: flex;
        }
        .space-between {
          justify-content: space-between;
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

export default EditNewContact
