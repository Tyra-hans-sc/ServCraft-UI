import React, { useState, useEffect, useContext } from 'react';
import Button from '../../button';
import SCInput from '../../sc-controls/form-controls/sc-input';
import ReactSwitch from '../../react-switch';
import { colors, layout } from '../../../theme';
import Fetch from '../../../utils/Fetch';
import Helper from '../../../utils/helper';
import * as Enums from '../../../utils/enums';
import ToastContext from '../../../utils/toast-context';
import SCSwitch from "../../sc-controls/form-controls/sc-switch";

function ManageSupplier({supplier, onSupplierSave, isNew, accessStatus}) {

  const toast = useContext(ToastContext);
  const [inputErrors, setInputErrors] = useState({});

  const [inputs, setInputs] = useState({
    Name: isNew ? '' : supplier.Name,
    Code: isNew ? '' : supplier.Code,    
    EmailAddress: isNew ? '' : supplier.EmailAddress,
    ContactNumber: isNew ? '' : supplier.ContactNumber,
    IsActive: isNew ? true : supplier.IsActive,
  });

  const handleInputChange = (e) => {
    setInputs({
      ...inputs,
      [e.name]: e.value
    });
  };

  const validate = () => {

    let validationItems = [];
    validationItems = [
      { key: 'Name', value: inputs.Name, required: true, type: Enums.ControlType.Text },
      { key: 'EmailAddress', value: inputs.EmailAddress, type: Enums.ControlType.Email },
      { key: 'ContactNumber', value: inputs.ContactNumber, type: Enums.ControlType.ContactNumber },
    ];

    const { isValid, errors } = Helper.validateInputs(validationItems);
    setInputErrors(errors);
    return isValid;
  }

  const [saving, setSaving] = useState(false);

  const save = async () => {

    setSaving(true);
    let isValid = validate();

    if (isValid) {
      let response = {};
  
      if (isNew) {
        response = await Fetch.post({
          url: `/Supplier`,
          params: inputs,
          toastCtx: toast
        });
      } else {
        response = await Fetch.put({
          url: `/Supplier`,
          params: { ...supplier, 
            Name: inputs.Name,
            Code: inputs.Code,
            EmailAddress: inputs.EmailAddress,
            ContactNumber: inputs.ContactNumber,
          },
          toastCtx: toast
        });
      }

      if (response.ID) {
        onSupplierSave(response);
      } else {
        toast.setToast({
          message: `Supplier failed to save`,
          show: true,
          type: Enums.ToastType.error
        });
        setSaving(false);
      }
    } else {
      toast.setToast({
        message: 'There are errors on the page',
        show: true,
        type: Enums.ToastType.error
      });
      setSaving(false);
    }
  };

  return (
    <div className="overlay" onClick={(e) => e.stopPropagation()}>
      <div className="modal-container">
        <div className="title">
          {isNew ? 
            <h1>Creating a Supplier</h1> : 
            <h1>Editing a Supplier</h1>
          }
        </div>
        <div className="row">
          <div className="column">
            <SCInput
              label="Name"
              name="Name"
              onChange={handleInputChange}
              value={inputs.Name}
              required={true}
              error={inputErrors.Name}
              cypress="data-cy-name"
            />
          </div>
        </div>
        <div className="row">
          <div className="column">
            <SCInput
              label="Code"
              name="Code"
              onChange={handleInputChange}
              value={inputs.Code}
              cypress="data-cy-code"
            />
          </div>
        </div>
        <div className="row">
          <div className="column">
            <SCInput 
              onChange={handleInputChange}
              label={"Email Address"} 
              name="EmailAddress"
              value={inputs.EmailAddress}
              error={inputErrors.EmailAddress}
              cypress="data-cy-email"
            />
          </div>
        </div>
        <div className="row">
          <div className="column">
            <SCInput 
              onChange={handleInputChange}
              label={"Contact Number"} 
              name="ContactNumber"
              value={inputs.ContactNumber}
              error={inputErrors.ContactNumber}
              cypress="data-cy-number"
            />
          </div>
        </div>
        {isNew ? 
          '' :
          <div className="switch">
            <SCSwitch label="Active" checked={inputs.IsActive} onToggle={() => handleInputChange({ name: "IsActive", value: !inputs.IsActive })} />
            {/*<ReactSwitch label="Active" checked={inputs.IsActive} handleChange={() => handleInputChange({ name: "IsActive", value: !inputs.IsActive })} />*/}
          </div>
        }
        <div className="row align-end">
            <Button text="Cancel" extraClasses="auto hollow" onClick={() => onSupplierSave(null)} />          
            <Button text={`${isNew ? `Create` : `Save`}`} extraClasses="auto left-margin" onClick={save} disabled={saving} />          
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
        .column {
          display: flex;
          flex-direction: column;
          width: ${layout.inputWidth};
          margin-left: 0.5rem;
        }
        .title {
          color: ${colors.bluePrimary};
          font-size: 1.125rem;
          font-weight: bold;
          margin-bottom: 1rem;
        }
        .switch {
          flex-direction: row-reverse;
          display: flex;
          margin-top: 1rem;
        }
      `}</style>
    </div>
  );
}

export default ManageSupplier;
