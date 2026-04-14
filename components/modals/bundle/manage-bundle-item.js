import React, { useState, useEffect, useContext } from 'react';
import Button from '../../button';
import TextInput from '../../text-input';
import * as Enums from '../../../utils/enums';
import Fetch from '../../../utils/Fetch';
import Helper from '../../../utils/helper';
import ToastContext from '../../../utils/toast-context';
import InventorySelector from '../../selectors/inventory/inventory-selector';

function ManageBundleItem({isNew, bundleItem, onBundleItemSave, bundle, accessStatus}) {

  const toast = useContext(ToastContext);  

  const [inputs, setInputs] = useState(isNew ? {
    BundleID: bundle ? bundle.ID ? bundle.ID : null : null,
    Quantity: 1,
    IsActive: true,
  } : {    
    ID: bundleItem.ID,
    BundleID: bundle ? bundle.ID ? bundle.ID : null : null,
    Quantity: bundleItem.Quantity,
    IsActive: bundleItem.IsActive,
  });

  const handleInputChange = (e) => {
    setInputs({
      ...inputs,
      [e.target.name]: e.target.value
    });
  };

  const [selectedInventory, setSelectedInventory] = useState();

  const getInventory = async (id) => {
    const inventory = await Fetch.get({
      url: `/Inventory?id=${id}`
    });
    setSelectedInventory(inventory);
  };

  useEffect(() => {
    if (!isNew) {
      getInventory(bundleItem.InventoryID);
    }
  }, []);

  const [inputErrors, setInputErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const validate = () => {
    const { isValid, errors } = Helper.validateInputs([
      { key: "Quantity", value: inputs.Quantity, type: Enums.ControlType.Number, gt: 0, required: true },
      { key: "Quantity", value: inputs.Quantity, type: Enums.ControlType.Number, mdp: 4 },
      { key: "Inventory", value: selectedInventory, type: Enums.ControlType.Select, required: true },
    ]);

    setInputErrors(errors);
    return isValid;
  };

  const saveItem = () => {

    setSaving(true);

    let isValid = validate();
    if (isValid) {

      let item = {...inputs,
        Inventory: selectedInventory,
        InventoryID: selectedInventory ? selectedInventory.ID : null,
        InventoryCode: selectedInventory ? selectedInventory.Code : '',
        InventoryDescription: selectedInventory ? selectedInventory.Description : '',
      };

      onBundleItemSave(item);
      setSaving(false);
    } else {
      setSaving(false);
      toast.setToast({
        message: 'There are errors on the page',
        show: true,
        type: Enums.ToastType.error
      });
    }
  };

  const getInventoryIDListToIgnore = () => {
    return bundle.BundleItems ? bundle.BundleItems.map(x => x.InventoryID) : [];
  };

  return (
    <div className="overlay" onClick={(e) => e.stopPropagation()}>
      <div className="modal-container">
        <div className="title">
          {isNew ? 
            <h1>Adding a Bundle Item</h1> : 
            <h1>Editing a Bundle Item</h1>
          }
        </div>
        <div className="row">
          <div className="column">
            <InventorySelector selectedInventory={selectedInventory} setSelectedInventory={setSelectedInventory} 
              accessStatus={accessStatus} error={inputErrors.Inventory} ignoreIDs={getInventoryIDListToIgnore()}
            />
          </div>
        </div>
        <div className="row">
          <div className="column">
            <TextInput
              label="Quantity"
              required={true}
              type="number"
              changeHandler={(e) => handleInputChange({ target: { name: "Quantity", value: e.target.value } })}
              value={inputs.Quantity}
              error={inputErrors.Quantity}
            />
          </div>
        </div>

        <div className="row">
          <div className="cancel">
            <Button text="Cancel" extraClasses="hollow" onClick={() => onBundleItemSave(null)} />
          </div>
          <div className="update">
            <Button text={`${isNew ? `Add to Bundle` : 'Save'}`} onClick={saveItem} disabled={saving} />
          </div>
        </div>
      </div>

      <style jsx>{`
        .modal-container {
          min-height: 50%;
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
        .inventory-item-container {
          display: flex;
          flex-direction: row;
          width: 100%;
        }
        .description-container {

        }
        .total-row {
          font-weight: bold;
          margin-top: 1rem;
        }
        .end {
          align-items: flex-end;
        }
        .cancel {
         
        }
        .update {
          
        }
        .left-padding {
          padding-left: 0.5em;
        }
        .right-padding {
          padding-right: 0.5em;
        }
    `}</style>
    </div>    
  )
}

export default ManageBundleItem;
