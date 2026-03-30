import React, { useState, useEffect, useContext } from 'react';
import Button from '../../button';
import SCInput from '../../sc-controls/form-controls/sc-input';
import { colors, layout } from '../../../theme';
import Fetch from '../../../utils/Fetch';
import * as Enums from '../../../utils/enums';
import Helper from '../../../utils/helper';
import InventoryService from '../../../services/inventory/inventory-service';
import ToastContext from '../../../utils/toast-context';
import constants from '../../../utils/constants';

function ManageInventoryCategory({isNew, inventoryCategory, onInventoryCategorySave}) {

  const toast = useContext(ToastContext);
  const [inputErrors, setInputErrors] = useState({});

  const [inputs, setInputs] = useState({
    Code: isNew ? '' : inventoryCategory.Code,
    Description: isNew ? '' : inventoryCategory.Description,
  });

  const handleInputChange = (e) => {
    setInputs({
      ...inputs,
      [e.name]: e.value
    });
  };

  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    const {isValid, errors} = InventoryService.validateInventoryCategory(inputs);
    setInputErrors(errors);

    if (isValid) {
      let response = {};
      let params = inputs;
  
      if (isNew) {
        response = await Fetch.post({
          url: `/InventoryCategory`,
          params: params,
        });
      } else {
        response = await Fetch.put({
          url: `/InventoryCategory`,
          params: params
        });
      }

      if (response.ID) {
        Helper.mixpanelTrack(isNew ? constants.mixPanelEvents.createInventoryCategory : constants.mixPanelEvents.editInventoryCategory, {
          "inventoryCategoryID": response.ID
        });
        onInventoryCategorySave(response);
      } else {
        toast.setToast({
          message: `Inventory category failed to save`,
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

    if (!isNew) {
      setSaving(false);
    }
  };

  return (
    <div className="overlay" onClick={(e) => e.stopPropagation()}>
      <div className="modal-container">
        <div className="title">
          {isNew ? 
            <h1>Creating an Inventory Category</h1> : 
            <h1>Editing an Inventory Category</h1>
          }
        </div>
        <div className="row">
            <div className="column">
                <SCInput 
                    name="Code"
                    label="Code"
                    onChange={handleInputChange}
                    value={inputs.Code}
                    error={inputErrors.Code}
                    cypress="data-cy-code"
                />
            </div>
        </div>
        <div className="row">
            <div className="column">
                <SCInput 
                    label="Name"
                    onChange={handleInputChange}
                    name="Description"
                    required={true}
                    value={inputs.Description}
                    error={inputErrors.Description}
                    cypress="data-cy-description"
                />
            </div>
        </div>
        <div className="row">
          <div className="cancel">
            <Button text="Cancel" extraClasses="auto hollow" onClick={() => onInventoryCategorySave(null)} />
          </div>
          <div className="save">
            <Button text={`${isNew ? `Create` : `Save`}`} extraClasses="auto" onClick={save} disabled={saving} />
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
      `}</style>
    </div>
  );
}

export default ManageInventoryCategory;
