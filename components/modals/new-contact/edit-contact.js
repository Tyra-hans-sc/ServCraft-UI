import React, { useState, useContext, useEffect } from 'react';
import { colors, fontSizes, layout, fontFamily } from '../../../theme';
import TextInput from '../../text-input';
import Checkbox from '../../checkbox';
import Button from '../../button';
import Helper from '../../../utils/helper';
import * as Enums from '../../../utils/enums';
import Fetch from '../../../utils/Fetch';
import ToastContext from '../../../utils/toast-context';
import ReactSwitch from '../../react-switch';
import LoginAccess from '../../auth/login-access';
import PS from '../../../services/permission/permission-service';
import constants from '../../../utils/constants';
import SCSwitch from "../../sc-controls/form-controls/sc-switch";

function EditContact({ module, contact, setEditContact, updateContact, accessStatus, canDeactivate = true }) {

  const toast = useContext(ToastContext);

  const [editCustomerPermission] = useState(PS.hasPermission(Enums.PermissionName.EditCustomer) || module == Enums.Module.Supplier);

  const getInputs = () => {
    let temp = {
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
      IsActive: contact.IsActive
    };
    if (module == Enums.Module.Customer) {
      temp = { ...temp, IsPrimaryAccount: contact.IsPrimaryAccount };
    } else if (module == Enums.Module.Supplier) {
      temp = {
        ...temp,
        canLogin: contact.AuthUserIsActive,
        UserIsActive: contact.AuthUserIsActive,
        UserName: contact.UserName,
        UserID: contact.UserID,
        password: "",
        confirmPassword: "",
      };
    }
    return temp;
  };

  const [inputs, setInputs] = useState({});
  const [inputsFirstLoad, setInputsFirstLoad] = useState(false);

  useEffect(() => {
    setInputs(getInputs());
    setInputsFirstLoad(true);
  }, []);

  useEffect(() => {
    if (module == Enums.Module.Supplier && inputsFirstLoad) {
      if (!inputs.canLogin && !contact.UserID) {
        setInputs({ ...inputs, UserName: null });
      } else if (inputs.canLogin) {
        setInputs({ ...inputs, UserName: inputs.UserName ? inputs.UserName : inputs.EmailAddress, UserIsActive: true });
      } else if (!inputs.canLogin) {
        setInputs({ ...inputs, UserIsActive: false });
      }
    }
  }, [inputs.canLogin]);

  const [inputErrors, setInputErrors] = useState({});

  const handleInputChange = (e) => {
    let setter = {
      ...inputs,
      [e.target.name]: e.target.value
    };

    if (module == Enums.Module.Supplier && e.target.name === "EmailAddress" && !contact.UserID && inputs.canLogin) {
      setter.UserName = e.target.value;
    }

    setInputs(setter);
  };

  const isPrimaryAlreadySet = contact.IsPrimary;
  const isPrimaryAccountAlreadySet = module == Enums.Module.Customer ? contact.IsPrimaryAccount : false;

  async function update() {

    let validationItems = [
      { key: 'FirstName', value: inputs.FirstName, required: true, type: Enums.ControlType.Text },
      { key: 'LastName', value: inputs.LastName, required: true, type: Enums.ControlType.Text },
      { key: 'MobileNumber', value: inputs.MobileNumber, type: Enums.ControlType.ContactNumber },
    ];

    if (module == Enums.Module.Customer) {
      validationItems = [...validationItems,
      { key: 'EmailAddress', value: inputs.EmailAddress, type: Enums.ControlType.Email },
      { key: 'EmailAddress', value: inputs.EmailAddress, type: Enums.ControlType.Email, group: 'email_number' },
      { key: 'MobileNumber', value: inputs.MobileNumber, type: Enums.ControlType.Number, group: 'email_number' }
      ];
    } else if (module == Enums.Module.Supplier) {
      if (inputs.canLogin === true && (inputs.password || inputs.confirmPassword || !inputs.UserID)) {

        validationItems = [...validationItems,
        { key: 'EmailAddress', value: inputs.EmailAddress, required: true, type: Enums.ControlType.Email },
        { key: 'password', value: inputs.password, required: true, type: Enums.ControlType.Text, passwordLength: 8 },
        { key: 'confirmPassword', value: inputs.confirmPassword, required: true, type: Enums.ControlType.Text, equalsPassword: inputs.password }
        ];
      } else {
        validationItems = [...validationItems,
        { key: 'EmailAddress', value: inputs.EmailAddress, type: Enums.ControlType.Email },
        { key: 'EmailAddress', value: inputs.EmailAddress, type: Enums.ControlType.Email, group: 'email_number' },
        { key: 'MobileNumber', value: inputs.MobileNumber, type: Enums.ControlType.Number, group: 'email_number' }
        ];
      }
    }

    const { isValid, errors } = Helper.validateInputs(validationItems);
    setInputErrors(errors);

    if (isValid) {
      let updatedContact = {
        ...contact,
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
        IsActive: inputs.IsActive,
      };

      if (module == Enums.Module.Customer) {
        updatedContact = { ...updatedContact, IsPrimaryAccount: inputs.IsPrimaryAccount };
      }

      let savedContact = await saveContact(updatedContact);
      if (savedContact) {
        updateContact(savedContact);
        toast.setToast({
          message: 'Contact saved successfully',
          show: true,
          type: 'success'
        });
        setEditContact(null);
      }
    } else {
      toast.setToast({
        message: 'There are errors on the page',
        show: true,
        type: Enums.ToastType.error,
      });
    }
  }

  const saveContact = async (contactToSave) => {
    let contactPut;

    if (module == Enums.Module.Customer) {
      contactPut = await Fetch.put({
        url: '/Contact',
        params: contactToSave,
        toastCtx: toast
      });
    } else if (module == Enums.Module.Supplier) {

      let userToSave = null;
      if (inputs.canLogin || inputs.UserName) {
        userToSave = {
          UserName: inputs.UserName,
          ID: inputs.UserID,
          Password: inputs.password,
          IsActive: contactToSave.IsActive && inputs.UserIsActive
        };
      }

      contactPut = await Fetch.put({
        url: '/SupplierContact',
        params: {
          SupplierContact: contactToSave,
          User: userToSave
        },
        toastCtx: toast
      });
    }

    if (contactPut.ID) {
      Helper.mixpanelTrack(constants.mixPanelEvents.editContact, {
        "contactID": contactPut.ID
      });
      return contactPut;
    } else {
      return null;
    }
  };

  return (
    <div className="overlay" onClick={(e) => e.stopPropagation()}>
      <div className="modal-container">
        <div className="title">
          {"Editing contact " + contact.FirstName + " " + contact.LastName}
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
              readOnly={!editCustomerPermission}
            />
            <TextInput
              changeHandler={handleInputChange}
              error={inputErrors.EmailAddress}
              label={"Email"}
              name="EmailAddress"
              placeholder={"name@example.com"}
              required={true}
              value={inputs.EmailAddress}
              readOnly={!editCustomerPermission}
            />
            <TextInput
              changeHandler={handleInputChange}
              error={inputErrors.WorkNumber}
              label={"Work Number"}
              name="WorkNumber"
              value={inputs.WorkNumber}
              readOnly={!editCustomerPermission}
            />
            <TextInput
              changeHandler={handleInputChange}
              error={inputErrors.HomeNumber}
              label={"Home Number"}
              name="HomeNumber"
              value={inputs.HomeNumber}
              readOnly={!editCustomerPermission}
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
              readOnly={!editCustomerPermission}
            />
            <TextInput
              changeHandler={handleInputChange}
              error={inputErrors.MobileNumber}
              label={"Mobile number"}
              name="MobileNumber"
              placeholder={"(000) 000-0000"}
              required={true}
              value={inputs.MobileNumber}
              readOnly={!editCustomerPermission}
            />
            <TextInput
              changeHandler={handleInputChange}
              error={inputErrors.FaxNumber}
              label={"Fax Number"}
              name="FaxNumber"
              value={inputs.FaxNumber}
              readOnly={!editCustomerPermission}
            />
            <TextInput
              changeHandler={handleInputChange}
              error={inputErrors.IDNumber}
              label={"ID Number"}
              name="IDNumber"
              value={inputs.IDNumber}
              readOnly={!editCustomerPermission}
            />
          </div>
        </div>
        {module == Enums.Module.Supplier ?
          <LoginAccess isNew={false} userID={inputs.UserID} userIsActive={inputs.UserIsActive} canLogin={inputs.canLogin} email={inputs.UserName}
            password={inputs.password} confirmPassword={inputs.confirmPassword} handleInputChange={handleInputChange} inputErrors={inputErrors} />
          : ''
        }
        <div className="input-row">
          <div className="column">
            <Checkbox
              changeHandler={() => handleInputChange({ target: { name: "SendEmail", value: !inputs.SendEmail } })}
              checked={inputs.SendEmail}
              extraClasses="form"
              label="Receive Email Notifications"
              disabled={!editCustomerPermission}
            />
            <Checkbox
              changeHandler={() => handleInputChange({ target: { name: "SendSMS", value: !inputs.SendSMS } })}
              checked={inputs.SendSMS}
              extraClasses="form"
              label="Receive SMS Notifications"
              disabled={!editCustomerPermission}
            />
            <Checkbox
              changeHandler={() => handleInputChange({ target: { name: "Unsubscribe", value: !inputs.Unsubscribe } })}
              checked={!inputs.Unsubscribe}
              extraClasses="form"
              label="Subscribed to SMS Marketing"
              disabled={!editCustomerPermission}
            />
          </div>
          <div className="column">
            <Checkbox
              changeHandler={() => handleInputChange({ target: { name: "IsPrimary", value: !inputs.IsPrimary } })}
              checked={inputs.IsPrimary}
              extraClasses="form"
              label="Primary Contact"
              disabled={isPrimaryAlreadySet || !editCustomerPermission}
              title={isPrimaryAlreadySet ? `Since this contact is already set as primary, you can only set it as primary on another contact.` : ''}
            />
            {module == Enums.Module.Customer ?
              <Checkbox
                changeHandler={() => handleInputChange({ target: { name: "IsPrimaryAccount", value: !inputs.IsPrimaryAccount } })}
                checked={inputs.IsPrimaryAccount}
                extraClasses="form"
                label="Primary Accounting Contact"
                disabled={isPrimaryAccountAlreadySet || !editCustomerPermission}
                title={isPrimaryAccountAlreadySet ? `Since this contact is already set as primary accounting, you can only set it as primary accounting on another contact.` : ''}
              /> : ''
            }
          </div>
        </div>
        <div className="switch">
          <SCSwitch label="Active" checked={inputs.IsActive} disabled={!canDeactivate || !editCustomerPermission}
            onToggle={() => handleInputChange({ target: { name: "IsActive", value: !inputs.IsActive } })} />
          {/*<ReactSwitch label="Active" checked={inputs.IsActive} disabled={!canDeactivate || !editCustomerPermission}
            handleChange={() => handleInputChange({ target: { name: "IsActive", value: !inputs.IsActive } })} />*/}
        </div>
        <div className="row space-between">
          <div className="cancel">
            <Button text="Cancel" extraClasses="hollow" onClick={() => setEditContact(null)} />
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
        .relative {

        }
        .help-dialog-container {

        }
        .switch {
          flex-direction: row-reverse;
          display: flex;
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

export default EditContact;
