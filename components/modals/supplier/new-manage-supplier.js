import React, { useState, useEffect, useContext } from 'react';
import Button from '../../button';
import TextInput from '../../text-input';
import KendoInput from '../../kendo/kendo-input';
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
      [e.target.name]: e.value
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
        });
      } else {
        response = await Fetch.put({
          url: `/Supplier`,
          params: { ...supplier, 
            Name: inputs.Name,
            Code: inputs.Code,
            EmailAddress: inputs.EmailAddress,
            ContactNumber: inputs.ContactNumber,
          }
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
            <KendoInput
              label="Name"
              name="Name"
              onChange={handleInputChange}
              value={inputs.Name}
              required={true}
              error={inputErrors.Name}
            />
          </div>
        </div>
        <div className="row">
          <div className="column">
            <KendoInput
              label="Code"
              name="Code"
              onChange={handleInputChange}
              value={inputs.Code}
            />
          </div>
        </div>
        <div className="row">
          <div className="column">
            <KendoInput 
              onChange={handleInputChange}
              label={"Email Address"} 
              name="EmailAddress"
              value={inputs.EmailAddress}
              error={inputErrors.EmailAddress}
            />
          </div>
        </div>
        <div className="row">
          <div className="column">
            <KendoInput 
              onChange={handleInputChange}
              label={"Contact Number"} 
              name="ContactNumber"
              value={inputs.ContactNumber}
              error={inputErrors.ContactNumber}
            />
          </div>
        </div>
        {isNew ? 
          '' :
          <div className="switch">
            <SCSwitch label="Active" checked={inputs.IsActive} onToggle={() => handleInputChange({target: {name: "IsActive", value: !inputs.IsActive}})} />
            {/*<ReactSwitch label="Active" checked={inputs.IsActive} handleChange={() => handleInputChange({target: {name: "IsActive", value: !inputs.IsActive}})} />*/}
          </div>
        }
        <div className="row">
          <div className="cancel">
            <Button text="Cancel" extraClasses="hollow" onClick={() => onSupplierSave(null)} />
          </div>
          <div className="save">
            <Button text={`${isNew ? `Create` : `Save`}`} onClick={save} disabled={saving} />
          </div>
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
        .cancel {
          width: 6rem;
        }
        .save {
          width: 14rem;
        }
      `}</style>
    </div>
  );
}

export default ManageSupplier;
