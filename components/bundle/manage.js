import React, { useState, useEffect, useContext, useRef } from 'react';
import Router from 'next/router';
import { colors, fontSizes, layout, fontFamily, shadows } from '../../theme';
import Fetch from '../../utils/Fetch';
import Helper from '../../utils/helper';
import * as Enums from '../../utils/enums';
import PS from '../../services/permission/permission-service';
import ToastContext from '../../utils/toast-context';
import BundleItems from './bundle-items';
import Breadcrumbs from '../breadcrumbs';
import ConfirmAction from '../modals/confirm-action';
import TextArea from '../text-area';
import TextInput from '../text-input';
import Button from '../button';
import ReactSwitch from '../react-switch';
import constants from '../../utils/constants';
import SCSwitch from "../sc-controls/form-controls/sc-switch";

function ManageBundle({isNew, initialBundle, accessStatus}) {

  const [inventoryPermission] = useState(PS.hasPermission(Enums.PermissionName.Inventory));  

  const [formIsDirty, setFormIsDirty] = useState(false);
  const [confirmOptions, setConfirmOptions] = useState(Helper.initialiseConfirmOptions());

  Helper.preventRouteChange(formIsDirty, setFormIsDirty, setConfirmOptions);

  const [inputErrors, setInputErrors] = useState({});

  const toast = useContext(ToastContext);

  const [bundle, setBundle] = useState(isNew ? {
    Name: '',
    Description: '',
    BundleItems: []
  } : initialBundle);
  const [initialBundleName, setInitialBundleName] = useState(isNew ? '' : initialBundle.Name);

  const handleInputChange = (e) => {
    updateBundle([e.target.name], e.target.value);
  };

  const updateBundle = (field, value) => {
    let newState = { ...bundle };
    newState[field] = value;
    setBundle(newState);
    setFormIsDirty(true);
  };

  const updateBundleBulk = (field, value, orKeyValues, markAsDirty = true) => {
    let newState = { ...bundle };

    if (orKeyValues && orKeyValues.length > 0) {
      orKeyValues.map((item) => {
        newState[item.key] = item.value;
      });
    }
    if (field) {
      newQuoteSnewStatetate[field] = value;
    }

    setBundle(newState);
    setFormIsDirty(markAsDirty);
  };

  const [saving, setSaving] = useState(false);

  const validate = () => {
    let inputs = [
      { key: 'Name', value: bundle.Name, required: true, type: Enums.ControlType.Text },
      { key: 'Description', value: bundle.Description, required: true, type: Enums.ControlType.Text },
    ];

    const { isValid, errors } = Helper.validateInputs(inputs);
    setInputErrors(errors);

    if (!isValid) {
      toast.setToast({
        message: 'There are errors on the page',
        show: true,
        type: Enums.ToastType.error,
      });
    }

    if (isValid && bundle.BundleItems.length == 0) {
      // inputs = [...inputs, 
      //   { key: 'BundleItems', value: bundle.Name, required: true, type: Enums.ControlType.Text },
      // ];
      toast.setToast({
        message: 'Please add bundle items',
        show: true,
        type: Enums.ToastType.error,
      });
      return false;
    }

    return isValid;
  };

  const saveBundle = async () => {    
    setSaving(true);

    let isValid = validate();

    if (isValid) {
      let result = {};
      if (isNew) {
        result = await Fetch.post({
          url: `/Bundle`,
          params: {
            Bundle: bundle,
            BundleItems: bundle.BundleItems,
          },
          toastCtx: toast
        });
      } else {
        result = await Fetch.put({
          url: `/Bundle`,
          params: {
            Bundle: bundle,
            BundleItems: bundle.BundleItems,
          },
          toastCtx: toast
        });
      }

      if (result.ID) {

        if (isNew) {
          Helper.mixpanelTrack(constants.mixPanelEvents.createBundle, {
            "bundleID": result.ID
          });
        } else {
          Helper.mixpanelTrack(constants.mixPanelEvents.editBundle, {
            "bundleID": result.ID
          });
        }

        toast.setToast({
          message: 'Bundle saved successfully',
          show: true,
          type: 'success'
        });

        setFormIsDirty(false);
        await Helper.waitABit();
        if (isNew) {
          Helper.nextRouter(Router.push, '/bundle/list');
        } else {
          setBundle(result);
        }
      } else {
        setSaving(false);
      }
    } else {
      setSaving(false);
    }

    if (!isNew) {
      setSaving(false);
    }

    return isValid;
  };

  return (
    <React.Fragment>
      <div className="row">
        <div className="title">
          {isNew ?
            <Breadcrumbs currPage={{ text: 'Create Bundle', link: '/bundle/create', type: 'create' }} /> :
            <Breadcrumbs currPage={{ text: initialBundleName, link: `/bundle/${bundle.ID}`, type: 'bundle-show' }} />
          }
        </div>
        {isNew ? '' :
          <div className="actions">
            <Button disabled={accessStatus === Enums.AccessStatus.LockedWithAccess || accessStatus === Enums.AccessStatus.LockedWithOutAccess}
              text={saving ? "Saving" : "Save"} onClick={saving ? null : () => saveBundle()} />
          </div>
        }
      </div>

      <div className="row">
        <div className="column">
          <TextInput
            label="Name"
            changeHandler={(e) => handleInputChange({ target: { name: "Name", value: e.target.value } })}
            required={true}
            value={bundle.Name}
            error={inputErrors.Name}
          />
        </div>
        <div className="column">
          <TextArea
            label="Description"
            changeHandler={(e) => handleInputChange({ target: { name: "Description", value: e.target.value } })}
            required={true}
            value={bundle.Description}
            error={inputErrors.Description}
          />
        </div>
      </div>      

      <BundleItems bundle={bundle} updateBundle={updateBundle} accessStatus={accessStatus} />

      {isNew ? '' :
        <div className="switch">
          <SCSwitch label="Active" checked={bundle.IsActive} onToggle={(e) => handleInputChange({ target: { name: "IsActive", value: e } })} />
          {/*<ReactSwitch label="Active" checked={bundle.IsActive} handleChange={(e) => handleInputChange({ target: { name: "IsActive", value: e } })} />*/}
        </div>
      }

      {isNew ? 
        <div className="row">
          <div className="column">
            <div className="create-button">
              <Button text="Create Bundle" onClick={() => saveBundle()} disabled={saving} />
            </div>
          </div>
          
        </div>
         : ''
      }

      <ConfirmAction options={confirmOptions} setOptions={setConfirmOptions} />

      <style jsx>{`
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
        .actions {
          display: flex;
        }
        .actions :global(.button){
          margin-left: 0.5rem;
          margin-top: 0;
          padding: 0 1rem;
          white-space: nowrap;
        }
        .create-button {
          margin-top: 1rem;
          margin-bottom: 1rem;
        }
        .switch {
          flex-direction: row-reverse;
          display: flex;
          margin-top: 1rem;
        }
      `}
      </style>
    </React.Fragment>
  );
}

export default ManageBundle;
