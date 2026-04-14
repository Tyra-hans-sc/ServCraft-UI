import React, { useState, useContext } from 'react';
import { colors, fontSizes, layout, fontFamily } from '../../../theme';
import TextInput from '../../text-input';
import Checkbox from '../../checkbox';
import Button from '../../button';
import Helper from '../../../utils/helper';
import * as Enums from '../../../utils/enums';
import Fetch from '../../../utils/Fetch';
import ToastContext from '../../../utils/toast-context';
import LoginAccess from '../../auth/login-access';
import constants from '../../../utils/constants';

function CreateContact({createContact, setCreateContact, module, moduleData}) {

  const toast = useContext(ToastContext);

  const getInputs = () => {
    let temp = {FirstName: '',
      LastName: '',
      EmailAddress: '',
      MobileNumber: '',
      WorkNumber: '',
      HomeNumber: '',
      FaxNumber: '',
      IDNumber: '',
      SendEmail: '',
      SendSMS: false,
      Unsubscribe: false,
      IsPrimary: false};
    if (module == Enums.Module.Customer) {
      temp = {...temp, IsPrimaryAccount: false};
    } else if (module == Enums.Module.Supplier) {
      temp = {...temp, canLogin: false,
        password: "",
        confirmPassword: ""};
    }
    return temp;
  };

  const [inputs, setInputs] = useState(getInputs());

  const [inputErrors, setInputErrors] = useState({});

  const handleInputChange = (e) => {
    setInputs({
      ...inputs,
      [e.target.name]: e.target.value
    });
  };

  const [saving, setSaving] = useState(false);

  async function create() {

    setSaving(true);

    let validationItems = [
      {key: 'FirstName', value: inputs.FirstName, required: true, type: Enums.ControlType.Text},
      {key: 'LastName', value: inputs.LastName, required: true, type: Enums.ControlType.Text},
      {key: 'MobileNumber', value: inputs.MobileNumber, type: Enums.ControlType.ContactNumber},
    ];

    if (module == Enums.Module.Customer) {
      validationItems = [...validationItems, 
        {key: 'EmailAddress', value: inputs.EmailAddress, type: Enums.ControlType.Email},
        {key: 'EmailAddress', value: inputs.EmailAddress, type: Enums.ControlType.Email, group: 'email_number'},
        {key: 'MobileNumber', value: inputs.MobileNumber, type: Enums.ControlType.Number, group: 'email_number'}
      ];
    } else if (module == Enums.Module.Supplier) {
      if (inputs.canLogin === true) {
        validationItems = [...validationItems,
          {key: 'EmailAddress', value: inputs.EmailAddress, required: true, type: Enums.ControlType.Email},
          {key: 'password', value: inputs.password, required: true, type: Enums.ControlType.Text, passwordLength: 8},
          {key: 'confirmPassword', value: inputs.confirmPassword, required: true, type: Enums.ControlType.Text, equalsPassword: inputs.password}
        ];
      } else {
        validationItems = [...validationItems, 
          {key: 'EmailAddress', value: inputs.EmailAddress, type: Enums.ControlType.Email},
          {key: 'EmailAddress', value: inputs.EmailAddress, type: Enums.ControlType.Email, group: 'email_number'},
          {key: 'MobileNumber', value: inputs.MobileNumber, type: Enums.ControlType.Number, group: 'email_number'}
        ];
      }
    }

    const {isValid, errors} = Helper.validateInputs(validationItems);
    setInputErrors(errors);

    if (isValid) {
      let newContact = {
        EmailAddress: inputs.EmailAddress,
        FirstName: inputs.FirstName,
        LastName: inputs.LastName,
        MobileNumber: inputs.MobileNumber,
        WorkNumber: inputs.WorkNumber ? inputs.WorkNumber : '',
        HomeNumber: inputs.HomeNumber ? inputs.HomeNumber : '',
        FaxNumber: inputs.FaxNumber ? inputs.FaxNumber : '',
        IDNumber: inputs.IDNumber ? inputs.IDNumber : '',
        SendEmail: inputs.SendEmail,
        SendSMS: inputs.SendSMS,
        Unsubscribe: inputs.Unsubscribe,
        IsPrimary: inputs.IsPrimary,
        IsActive: true,
      };

      if (module == Enums.Module.Customer) {
        newContact = {...newContact, 
          IsPrimaryAccount: inputs.IsPrimaryAccount,
          CustomerID: moduleData.ID,
        };
      } else if (module == Enums.Module.Supplier) {
        newContact = {...newContact,
          SupplierID: moduleData.ID,
        };
      }

      let savedContact = await saveContact(newContact);
      if (savedContact) {
        createContact(savedContact);
        toast.setToast({
          message: 'Contact saved successfully',
          show: true,
          type: 'success'
        });
        setCreateContact(false);
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
  }

  const saveContact = async (contactToSave) => {
    let contactPost;

    if (module == Enums.Module.Customer) {
      contactPost = await Fetch.post({
        url: '/Contact',
        params: contactToSave,
        toastCtx: toast
      });
    } else if (module == Enums.Module.Supplier) {

      let params = {
        SupplierContact: contactToSave
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

      contactPost = await Fetch.post({
        url: '/SupplierContact',
        params: params,
        toastCtx: toast
      });
    }

    if (contactPost.ID) {
      Helper.mixpanelTrack(constants.mixPanelEvents.createContact, {
        "contactID": contactPost.ID
      });
      return contactPost;
    } else {
      return null;
    }
  };

  return (
    <div className="overlay" onClick={(e) => e.stopPropagation()}>
      <div className="modal-container">
        <div className="title">
          {"Creating a contact"}
        </div>
        <div className="input-row">
          <div className="column">
            <TextInput 
              changeHandler={handleInputChange}
              error={inputErrors.FirstName}
              label={"Contact first name"} 
              name="FirstName"
              placeholder={"Name"}
              required={true}
              value={inputs.FirstName}
            />
            <TextInput 
              changeHandler={handleInputChange}
              error={inputErrors.EmailAddress}
              label={"Email"} 
              name="EmailAddress"
              placeholder={"name@example.com"}
              required={true}
              value={inputs.EmailAddress}
            />
            <TextInput 
              changeHandler={handleInputChange}
              error={inputErrors.WorkNumber}
              label={"Work Number"} 
              name="WorkNumber"
              value={inputs.WorkNumber}
            />
            <TextInput 
              changeHandler={handleInputChange}
              error={inputErrors.HomeNumber}
              label={"Home Number"} 
              name="HomeNumber"
              value={inputs.HomeNumber}
            />
          </div>
          <div className="column">
            <TextInput 
              changeHandler={handleInputChange}
              error={inputErrors.LastName}
              label={"Contact last name"} 
              name="LastName"
              placeholder={"Surname"}
              required={true}
              value={inputs.LastName}
            />
            <TextInput 
              changeHandler={handleInputChange}
              error={inputErrors.MobileNumber}
              label={"Mobile number"} 
              name="MobileNumber"
              placeholder={"(000) 000-0000"}
              required={true}
              value={inputs.MobileNumber}
            />
            <TextInput 
              changeHandler={handleInputChange}
              error={inputErrors.FaxNumber}
              label={"Fax Number"} 
              name="FaxNumber"
              value={inputs.FaxNumber}
            />
            <TextInput 
              changeHandler={handleInputChange}
              error={inputErrors.IDNumber}
              label={"ID Number"} 
              name="IDNumber"
              value={inputs.IDNumber}
            />
          </div>
        </div>
        {module == Enums.Module.Supplier ?
          <LoginAccess isNew={true} canLogin={inputs.canLogin} email={inputs.EmailAddress} password={inputs.password} confirmPassword={inputs.confirmPassword}
            handleInputChange={handleInputChange} inputErrors={inputErrors} />          
          : ''
        }
        <div className="input-row">
          <div className="column">
            <Checkbox 
              changeHandler={() => handleInputChange({target: {name: "SendEmail", value: !inputs.SendEmail}})}
              checked={inputs.SendEmail}
              extraClasses="form"
              label="Receive Email Notifications"
            />
            <Checkbox 
              changeHandler={() => handleInputChange({target: {name: "SendSMS", value: !inputs.SendSMS}})}
              checked={inputs.SendSMS}
              extraClasses="form"
              label="Receive SMS Notifications"
            />
            <Checkbox 
              changeHandler={() => handleInputChange({target: {name: "Unsubscribe", value: !inputs.Unsubscribe}})}
              checked={!inputs.Unsubscribe}
              extraClasses="form"
              label="Subscribed to SMS Marketing"
            />            
          </div>
          <div className="column">
            <Checkbox 
              changeHandler={() => handleInputChange({target: {name: "IsPrimary", value: !inputs.IsPrimary}})}
              checked={inputs.IsPrimary}
              extraClasses="form"
              label="Primary Contact"
            />
            {module == Enums.Module.Customer ? 
              <Checkbox 
                changeHandler={() => handleInputChange({target: {name: "IsPrimaryAccount", value: !inputs.IsPrimaryAccount}})}
                checked={inputs.IsPrimaryAccount}
                extraClasses="form"
                label="Primary Accounting Contact"
              /> : ''
            }
          </div>
        </div>
        <div className="row space-between">
          <div className="cancel">
            <Button text="Cancel" extraClasses="hollow" onClick={() => setCreateContact(false)} />
          </div>
          <div className="create">
            <Button text="Create" onClick={create} disabled={saving} />
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

export default CreateContact;
