import React, { useState, useEffect, useContext, useRef } from 'react';
import Button from '../../button';
import SCCombobox from '../../sc-controls/form-controls/sc-combobox';
import SCInput from '../../sc-controls/form-controls/sc-input';
import InventoryCategorySelector from '../../selectors/inventory/inventory-category-selector';
import { colors, layout } from '../../../theme';
import Fetch from '../../../utils/Fetch';
import * as Enums from '../../../utils/enums';
import LookupService from '../../../services/lookup/lookup-service';
import ToastContext from '../../../utils/toast-context';
import ReactSwitch from '../../react-switch';
import { useOutsideClick } from "rooks";
import ColourPicker from '../../colour-picker';
import SCSwitch from "../../sc-controls/form-controls/sc-switch";
import CreateNewCategoryModal from "@/PageComponents/Inventory/CreateNewCategoryModal";

function ManageLookup({isNew, type, onLookupItemSave, initialQueryType = null, lookupItemID = null, accessStatus}) {

  const [loaded, setLoaded] = useState(false);

  const toast = useContext(ToastContext);
  const [inputErrors, setInputErrors] = useState({});

    const [showCreateCategoryModal, setShowCreateCategoryModal] = useState(false);

    const getLookupItem = async () => {
    const url = LookupService.getEditUrl(type, lookupItemID);
    let data = await Fetch.get({
      url: url
    });
    return data;
  };

  const getInputs = async () => {
    let tempInputs = {};
    if (isNew) {
      tempInputs = {Description: '', IsActive: true};
      if (type == 'faultCause' || type == 'faultCode' || type == 'faultReason') {
        tempInputs = {...tempInputs, Code: ''};
      }
      if (type == 'faultCode') {
        tempInputs = {...tempInputs, InventoryCategoryDescription: ''};
      }
      if (type == 'queryStatus') {
        if (initialQueryType) {
          tempInputs = {...tempInputs, QueryTypeDescription: initialQueryType.Description};
          setSelectedQueryType(initialQueryType);
          setQueryTypeLockdown(true);
        } else {
          tempInputs = {...tempInputs, QueryTypeDescription: ''};
        }
      }
    } else {
      let lookupItem = await getLookupItem();
      tempInputs = lookupItem;
      if (type == 'faultCode') {
        getInventoryCategory(lookupItem.InventoryCategoryID);
      }
      if (type == 'queryStatus') {
        getQueryType(lookupItem.QueryTypeID);
        setStatusColor(lookupItem.DisplayColor);
      }
    }
    
    setInputs(tempInputs);
    setLoaded(true);
  };

  const [inputs, setInputs] = useState({});

  const handleInputChange = (e) => {
    setInputs({
      ...inputs,
      [e.name]: e.value
    });
  };

  const [queryTypeLockdown, setQueryTypeLockdown] = useState(false);

  useEffect(() => {
    getInputs();
    if (type == 'queryStatus') {
      getQueryTypes();
    }
    if (type == 'faultCode') {
      getInventoryCategories();
    }
  }, []);

  const title = LookupService.getTitle(type);

  const getQueryTypes = async () => {
    let response = await Fetch.get({
      url: `/QueryType`
    });
    setQueryTypes(response.Results);
  };
  
  const getInventoryCategories = async () => {
    let response = await Fetch.get({
      url: `/InventoryCategory`
    });
    setInventoryCategories(response.Results);
  };

  const getInventoryCategory = async (id) => {
    let response = await Fetch.get({
      url: `/InventoryCategory`,
      params: {
        id: id,
      }
    });
    setSelectedInventoryCategory(response);
  };

  const getQueryType = async (id) => {
    let response = await Fetch.get({
      url: `/QueryType/${id}`,
      params: {
      }
    });
    setSelectedQueryType(response);
  };

  const [queryTypes, setQueryTypes] = useState([]);
  const [selectedQueryType, setSelectedQueryType] = useState();

  const [inventoryCategories, setInventoryCategories] = useState([{}]);
  const [selectedInventoryCategory, setSelectedInventoryCategory] = useState();

  // QUERY STATUS COLOR PICKER

  const [showPicker, setShowPicker] = useState(false);

  const pickerRef = useRef();
  useOutsideClick(pickerRef, () => {
    if (showPicker) {
      setShowPicker(false);
    }
  });

  const [statusColor, setStatusColor] = useState('');

  const [saving, setSaving] = useState(false);

  const save = async () => {
    
    setSaving(true);
    const {isValid, errors} = LookupService.validate(type, inputs.Description, inputs.Code ? inputs.Code : null, selectedInventoryCategory, selectedQueryType);
    setInputErrors(errors);
    if (isValid) {

      let params = inputs;
      if (type == 'faultCode') {
        params = {...params, InventoryCategoryID: selectedInventoryCategory ? selectedInventoryCategory.ID : null};
      }
      if (type == 'queryStatus') {
        params = {...params, QueryTypeID: selectedQueryType.ID, DisplayColor: statusColor};
      }

      let response = {};
      if (isNew) {
        response = await Fetch.post({
          url: `/${type}`,
          params: params,
          toastCtx: toast
        });
      } else {
        response = await Fetch.put({
          url: `/${type}`,
          params: params,
          toastCtx: toast
        });
      }

      if (response.ID) {
        toast.setToast({
          message: `${title} saved successfully`,
          show: true,
          type: 'success'
        });
        onLookupItemSave(response);
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

    if (!isNew) {
      setSaving(false);
    }
  };

  if (!loaded) {
    return <></>
  }

  return (
    <div className="overlay" onClick={(e) => e.stopPropagation()}>
      <div className="modal-container">
        <div className="title">
          {isNew ? 
            <h1>Creating a {title}</h1> : 
            <h1>Editing a {title}</h1>
          }
        </div>
          {type == 'queryStatus' ? 
            <div className="row">
              <div className="column">
                <SCCombobox 
                    name="QueryType"
                    textField="Description"
                    dataItemKey="ID"
                    options={queryTypes}
                    value={selectedQueryType}
                    label="Query Type"
                    required={true}
                    error={inputErrors.QueryType}
                    onChange={setSelectedQueryType}
                    disabled={queryTypeLockdown}
                    cypress="data-cy-querytype"
                />
              </div>
            </div> 
            : ''
          }
          {type == 'faultCode' ?
              <>
                  <div className="row">
                      <div className="column">
                          <InventoryCategorySelector
                              selectedCategory={selectedInventoryCategory}
                              setSelectedCategory={setSelectedInventoryCategory}
                              error={inputErrors.InventoryCategory}
                              accessStatus={accessStatus}
                              onCreateNewCategory={() => setShowCreateCategoryModal(true)}
                              cypress="data-cy-inventorycategory"
                          />
                      </div>
                  </div>

                  <CreateNewCategoryModal show={showCreateCategoryModal}
                                          onClose={() => setShowCreateCategoryModal(false)}
                                          inventoryCategoryCreated={
                                              (e) => {
                                                  setSelectedInventoryCategory(e);
                                                  setShowCreateCategoryModal(false);
                                              }
                                          }
                                          backButtonText={isNew ? 'Create ' + title : 'Edit ' + title}
                  />
              </>
            : ''
          }
          {type == 'faultCause' || type == 'faultCode' || type == 'faultReason' ? 
            <div className="row">
              <div className="column">
                <SCInput 
                  label="Code"
                  name="Code"
                  onChange={handleInputChange}
                  required={true}
                  value={inputs.Code}
                  error={inputErrors.Code}
                />
              </div>
            </div>
            : ''
          }
          <div className="row">
            <div className="column">
              <SCInput 
                label="Description"
                name="Description"
                onChange={handleInputChange}
                required={true}
                value={inputs.Description}
                error={inputErrors.Description}
              />
            </div>
          </div>
          {type == 'queryStatus' ? 
            <div className="row">
              <div className="column">
                <div className="small-title">Colour</div>
                <ColourPicker selectedColour={statusColor} setColour={setStatusColor} />
              </div>
            </div> : ''        
          }

        {!isNew ? 
          <div className="switch">
            <SCSwitch label="Active" checked={inputs.IsActive}
              onToggle={() => handleInputChange({ name: "IsActive", value: !inputs.IsActive })} />
            {/*<ReactSwitch label="Active" checked={inputs.IsActive}
              handleChange={() => handleInputChange({ name: "IsActive", value: !inputs.IsActive })} />*/}
          </div> : ''
        }

        <div className="row align-end">
            <Button text="Cancel" extraClasses="auto hollow" onClick={() => onLookupItemSave(null)} />          
            <Button disabled={accessStatus === Enums.AccessStatus.LockedWithAccess || accessStatus === Enums.AccessStatus.LockedWithOutAccess || saving}
              text={`${isNew ? `Create` : `Save`}`} extraClasses="auto left-margin" onClick={save} />
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
        .small-title {
          color: ${colors.darkPrimary};
          font-size: 0.875rem;
          font-weight: bold;
          margin-top: 2rem;
        }
        .color-block {
          border-radius: ${layout.cardRadius};
          background-color: #4F4F4F;
          cursor: pointer;
          height: 2rem;
          margin-right: 1rem;
          margin-top: 1rem;
          position: relative;
          width: 2rem;
          z-index: 1;
        }
        .add-color {
          align-items: center;
          background: none;
          border: 1px solid ${colors.darkPrimary};
          color: ${colors.darkPrimary};
          display: flex;
          justify-content: center;
        }
        .color-block-selected {
          background-color: ${statusColor ? statusColor.includes('#') ? statusColor : "" : ""};
        }
        .color-picker {
          position: relative;
        }
        .color-picker :global(.sketch-picker) {
          left: 0;
          position: absolute;
          top: calc(100% + 0.5rem);
          z-index: 99;
        }
        .switch {
          flex-direction: row-reverse;
          display: flex;
        }
        .cancel {
          width: 6rem;
        }
        .update {
          width: 14rem;
        }
      `}</style>
    </div>
  );
}

export default ManageLookup;
