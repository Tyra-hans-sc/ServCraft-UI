import React, { useState, useEffect, useContext, useRef } from 'react';
import Router from 'next/router';
import { colors, fontSizes, layout, fontFamily, shadows } from '../../theme';
import Fetch from '../../utils/Fetch';
import Helper from '../../utils/helper';
import * as Enums from '../../utils/enums';
import ToastContext from '../../utils/toast-context';

import Button from '../../components/button';
import ConfirmAction from '../../components/modals/confirm-action';
import FormDefinitionFields from './items';
import ReactSwitch from '../react-switch';
import MinuteSelector from '../selectors/minute-selector';

import SCInput from '../sc-controls/form-controls/sc-input';
import SCComboBox from '../sc-controls/form-controls/sc-combobox';
import SCMultiSelect from '../sc-controls/form-controls/sc-multiselect';
import DownloadService from '../../utils/download-service';
import constants from '../../utils/constants';
import SCSwitch from "../sc-controls/form-controls/sc-switch";
import SCDropdownList from '../sc-controls/form-controls/sc-dropdownlist';

const ManageFormDefinition = ({ formDefinition, setFormDefinition, isNew, accessStatus }) => {

  const toast = useContext(ToastContext);

  const [formIsDirty, setFormIsDirty] = useState(false);
  const [confirmOptions, setConfirmOptions] = useState(Helper.initialiseConfirmOptions());

  const [nonExpiring] = useState(isNew ? false : formDefinition.NonExpiring);
  const formExpires = useRef(isNew ? false : formDefinition.ExpireTimespan > 0);

  const [structureLocked] = useState(isNew ? false : formDefinition.StructureLocked);

  const [name, setName] = useState(isNew ? '' : formDefinition.Name);
  const nameRef = useRef(name);
  nameRef.current = name;

  const [description, setDescription] = useState(isNew ? '' : formDefinition.Description);
  const descriptionRef = useRef(description);
  descriptionRef.current = description;

  const [expireTimespan, setExpireTimespan] = useState(isNew ? 0 : formDefinition.ExpireTimespan);
  const expireTimespanRef = useRef(expireTimespan);
  expireTimespanRef.current = expireTimespan;

  const [jobTypes, setJobTypes] = useState(isNew ? [] : formDefinition.JobTypes);
  const jobTypesRef = useRef(jobTypes);
  jobTypesRef.current = jobTypes;

  const [selectedModule, setSelectedModule] = useState(isNew ? null : formDefinition.Module);
  const selectedModuleRef = useRef(selectedModule);
  selectedModuleRef.current = selectedModule;

  const [selectedFormRule, setSelectedFormRule] = useState(isNew ? null : Enums.getEnumItemsVD(Enums.FormRule).find(x => x.value === formDefinition.FormRule));
  const selectedFormRuleRef = useRef(selectedFormRule);
  selectedFormRuleRef.current = selectedFormRule;

  const saveTimeout = useRef(null);

  const doSetFormIsDirty = (fid, immediate = true) => {
    // if (fid && !isNew) {
    //   if (saveTimeout.current)
    //     clearTimeout(saveTimeout.current);

    //   if (immediate) {
    //     submitFormDefinition();
    //   } else {
    //     saveTimeout.current = setTimeout(() => {
    //       submitFormDefinition();
    //     }, 1500);
    //   }
    // }

    setFormIsDirty(fid);
  };


  const handleNameChange = (e) => {
    setName(e.value);
    nameRef.current = e.value;
    doSetFormIsDirty(true, false);
  };

  const handleDescriptionChange = (e) => {
    setDescription(e.value);
    descriptionRef.current = e.value;
    doSetFormIsDirty(true, false);
  };

  const updateSelectedFormRule = (value) => {
    setSelectedFormRule(value);
    selectedFormRuleRef.current = value;
    doSetFormIsDirty(true);
  };

  const [isActive, setIsActive] = useState(isNew ? true : formDefinition.IsActive);
  const isActiveRef = useRef(isActive);
  isActiveRef.current = isActive;

  const handleIsActiveChange = () => {
    isActiveRef.current = !isActive;
    setIsActive(isActiveRef.current);
    doSetFormIsDirty(true);
  }

  const modulesRef = useRef([]);
  const formRulesRef = useRef([]);
  const jobTypeOptionsRef = useRef([]);

  useEffect(() => {

    let formRules = Enums.getEnumItemsVD(Enums.FormRule).filter(x => x.value !== 0);
    formRulesRef.current = formRules;

    Fetch.get({
      url: "/JobType"
    }).then(jobTypeResponse => {
      jobTypeOptionsRef.current = jobTypeResponse.Results.sort((a, b) => {
        return a.Name > b.Name ? 1 : -1;
      });
    });
  }, []);

  const [formDefinitionFields, setFormDefinitionFields] = useState(isNew ? [] : [...formDefinition.FormDefinitionFields]);
  const formDefinitionFieldsRef = useRef(formDefinitionFields);
  formDefinitionFieldsRef.current = formDefinitionFields;

  const mapDataOptionTableToFormDefinitionFields = (dataOption) => {
    const tableStructure = JSON.parse(dataOption);
    const mappings = tableStructure.ColumnDefinitions.map(col => {
      return {
        ID: col.Name,
        MasterID: col.Name,
        Description: col.Label,
        DataType: col.DataType,
        DisplayOrder: 0,
        Required: col.Required,
        SectionID: null,
        DataOption: col.DataOption
      };
    });
    return mappings;
  }

  const getDataOptions = (items) => {
    let options = [];
    if (Array.isArray(items)) {
      items.forEach(item => {
        if (Enums.FormDefinitionFieldTypes[item.DataType] === Enums.FormDefinitionFieldTypes.Table) {
          const tableStructure = mapDataOptionTableToFormDefinitionFields(item.DataOption);
          options.push(...getDataOptions(tableStructure));
        } else if (Enums.FormDefinitionFieldTypes[item.DataType] === Enums.FormDefinitionFieldTypes.MultiSelect || Enums.FormDefinitionFieldTypes[item.DataType] === Enums.FormDefinitionFieldTypes.Select) {
          options.push({
            FormDefinitionMasterID: formDefinition.MasterID,
            ItemMasterID: item.MasterID,
            DataOption: item.DataOption
          })
        }
      });
    }
    return options;
  };

  const checkForItemStructureChanges = (items, originalItems = formDefinitionFieldsRef.current) => {
    // console.log("checkForItemStructureChanges");

    if (!items || !Array.isArray(items)) return true;

    let structureChanged = false;

    if (items.length !== originalItems.length) {
      // console.log("items.length !== originalItems.length");
      structureChanged = true;
    } else {
      items.forEach(item => {
        if (!structureChanged) {
          // get the match from existing
          var match = originalItems.find(x => x.ID === item.ID);
          // console.log(item.Description, match);
          if (!match) {
            // console.log("!match");
            structureChanged = true;
          } else if (Enums.FormDefinitionFieldTypes[match.DataType] === Enums.FormDefinitionFieldTypes.Table
            && Enums.FormDefinitionFieldTypes[item.DataType] === Enums.FormDefinitionFieldTypes.Table) {
            const tableStructure = mapDataOptionTableToFormDefinitionFields(item.DataOption);
            const originalTableStructure = mapDataOptionTableToFormDefinitionFields(match.DataOption);
            structureChanged = checkForItemStructureChanges(tableStructure, originalTableStructure);
          } else {
            structureChanged ||=
              item.Description !== match.Description ||
              item.DataType !== match.DataType ||
              item.DisplayOrder !== match.DisplayOrder ||
              item.Required !== match.Required ||
              item.SectionID !== match.SectionID
              || item.Section?.DisplayOrder !== match.Section?.DisplayOrder
              ;
            // console.log(item.Description, item, match);
            if (structureChanged) {
              // console.log("structureChanged ||=");
            }
          }
        }
      });
    }

    return structureChanged;
  };


  const updateFormDefinitionFields = (items, forceStructureChanged = false) => {

    const structureChanged = structureLocked ? false : forceStructureChanged || checkForItemStructureChanges(items);

    setFormDefinitionFields(items);
    formDefinitionFieldsRef.current = items;

    if (isNew) {
      doSetFormIsDirty(true);
    } else {
      saveFormDefinitionFields(structureChanged);
    }
  };

  const [inputErrors, setInputErrors] = useState({});

  const validate = () => {

    let validationItems = [];
    validationItems = [
      { key: 'Name', value: nameRef.current, required: true, type: Enums.ControlType.Text },
      { key: 'Description', value: descriptionRef.current, required: false, type: Enums.ControlType.Text },
      // { key: 'Module', value: selectedModuleRef.current, required: true, type: Enums.ControlType.Select },
      { key: 'FormRule', value: selectedFormRuleRef.current, required: true, type: Enums.ControlType.Select },
    ];

    if (formExpires.current) {
      validationItems.push({ key: 'ExpireTimespan', value: expireTimespanRef.current, required: true, type: Enums.ControlType.Number, gt: 0 });
    }

    return Helper.validateInputs(validationItems);
  };

  const [submitting, setSubmitting] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const saveFormDefinitionFields = async (structureChanged) => {
    setSubmitting(true);

    let formDefinitionOriginal = await Fetch.get({
      url: `/FormDefinition/${formDefinition.ID}`
    });

    if (formDefinitionFieldsRef.current.length > 0) {
      if (formDefinitionFieldsRef.current.some(x => x.Description.trim() == '')) {
        errors.FormItems = 'Form Definition item error';
      }
    }

    if (formDefinitionFieldsRef.current.length <= 0) {
      toast.setToast({
        message: 'Please add form items',
        show: true,
        type: Enums.ToastType.error,
      });

      setSubmitting(false);
    }

    formDefinitionOriginal.FormDefinitionFields = formDefinitionFieldsRef.current;
    formDefinitionOriginal.Sections = formDefinition.Sections;
    const dataOptions = getDataOptions(formDefinitionFieldsRef.current);

    const result = await Fetch.put({
      url: `/FormDefinition`,
      params: {
        FormDefinition: {
          ...formDefinitionOriginal,
          FormDefinitionStatus: structureChanged ? Enums.FormDefinitionStatus.Draft : formDefinitionOriginal.FormDefinitionStatus
        },
        FormDefinitionFields: formDefinitionFieldsRef.current,
        JobTypes: formDefinitionOriginal.JobTypes,
        FormDataOptions: dataOptions
      },
      toastCtx: toast,
    });

    if (result.ID) {
      let formDefTemp = { ...formDefinition };

      Helper.mixpanelTrack(structureChanged || formDefinitionOriginal.FormDefinitionStatus === Enums.FormDefinitionStatus.Draft ? constants.mixPanelEvents.saveFormDefinitionAsDraft : constants.mixPanelEvents.confirmFormDefinition, {
        "formDefinitionID": result.ID
      });

      if (formDefTemp.ID !== result.ID) {
        // console.log(`navigate to new version ${result.ID}`);
        Helper.nextRouter(Router.push, '/settings/form/[id]', `/settings/form/${result.ID}`);
        return;
      }
      formDefTemp.ID = result.ID;
      formDefTemp.Version = result.Version;
      formDefTemp.MasterID = result.MasterID;
      formDefTemp.RowVersion = result.RowVersion;
      formDefTemp.FormDefinitionItems = formDefinitionFieldsRef.current;
      formDefTemp.Sections = result.Sections;
      formDefTemp.CreatedDate = result.CreatedDate;
      formDefTemp.CreatedBy = result.CreatedBy;
      formDefTemp.ModifiedDate = result.ModifiedDate;
      formDefTemp.ModifiedBy = result.ModifiedBy;
      formDefTemp.FormDefinitionStatus = result.FormDefinitionStatus;
      setFormDefinition(formDefTemp);

      toast.setToast({
        message: 'Form item saved successfully',
        show: true,
        type: 'success'
      });
    }

    setSubmitting(false);

  };

  const confirmFormDefinition = async () => {

    setConfirmOptions({
      ...Helper.initialiseConfirmOptions(),
      display: true,
      confirmButtonText: "Make Live",
      heading: "Do you want to make the draft form live?",
      text: "Making this form live will mark it as ready for users to fill out details pertaining to jobs and customers",
      onConfirm: () => {
        submitFormDefinition(Enums.FormDefinitionStatus.Confirmed);
      }
    })

  };

  const submitFormDefinition = async (formDefinitionStatus = Enums.FormDefinitionStatus.Draft) => {
    let submitFinished = false;
    setSubmitting(true);
    setConfirming(formDefinitionStatus === Enums.FormDefinitionStatus.Confirmed);

    let { isValid, errors } = validate();
    if (isValid) {

      if (formDefinitionFieldsRef.current.length > 0) {
        if (formDefinitionFieldsRef.current.some(x => x.Description.trim() == '')) {
          errors.FormItems = 'Form Definition item error';
        }
      }

      if (formDefinitionFieldsRef.current.length <= 0 && !isNew) {
        toast.setToast({
          message: 'Please add form items',
          show: true,
          type: Enums.ToastType.error,
        });

        setSubmitting(false);
        setConfirming(false);
      } else {
        let result = {};

        if (!formExpires.current) {
          expireTimespanRef.current = 0;
          setExpireTimespan(expireTimespanRef.current);
        }

        let formDefinitionToSave = {
          ...formDefinition,
          Name: nameRef.current,
          Description: descriptionRef.current,
          Module: selectedModuleRef.current,
          FormRule: selectedFormRuleRef.current.value,
          ExpireTimespan: expireTimespanRef.current,
          FormDefinitionStatus: formDefinitionStatus
        };

        const dataOptions = getDataOptions(formDefinitionFieldsRef.current);

        if (isNew) {
          formDefinitionToSave = {
            ...formDefinitionToSave,
            IsActive: true
          };
          result = await Fetch.post({
            url: `/FormDefinition`,
            params: {
              FormDefinition: formDefinitionToSave,
              FormDefinitionFields: formDefinitionFieldsRef.current,
              JobTypes: jobTypesRef.current,
              FormDataOptions: dataOptions
            },
            toastCtx: toast,
          });
        } else {

          if (!isActiveRef.current) {
            formDefinitionToSave.FormDefinitionStatus = Enums.FormDefinitionStatus.Confirmed;
          }

          result = await Fetch.put({
            url: `/FormDefinition`,
            params: {
              FormDefinition: { ...formDefinitionToSave, IsActive: isActiveRef.current },
              FormDefinitionFields: formDefinitionFieldsRef.current,
              JobTypes: jobTypesRef.current,
              FormDataOptions: dataOptions
            },
            toastCtx: toast,
          });
        }

        if (result.ID) {
          if (isNew) {
            Helper.mixpanelTrack(constants.mixPanelEvents.createFormDefinition, {
              "formDefinitionID": result.ID
            });
          } else {
            Helper.mixpanelTrack(constants.mixPanelEvents.editFormDefinition, {
              "formDefinitionID": result.ID
            });
          }

          if (formDefinitionStatus === Enums.FormDefinitionStatus.Draft) {
            Helper.mixpanelTrack(constants.mixPanelEvents.saveFormDefinitionAsDraft, {
              "formDefinitionID": result.ID
            });
          } else if (formDefinitionStatus === Enums.FormDefinitionStatus.Confirmed) {
            Helper.mixpanelTrack(constants.mixPanelEvents.confirmFormDefinition, {
              "formDefinitionID": result.ID
            });
          }

          toast.setToast({
            message: 'Form saved successfully',
            show: true,
            type: 'success'
          });

          submitFinished = true;
          doSetFormIsDirty(false);
          await Helper.waitABit();
          if (isNew) {
            Helper.nextRouter(Router.push, '/settings/form/[id]', `/settings/form/${result.ID}`);
          } else {
            if (formDefinition.ID !== result.ID) {
              Helper.nextRouter(Router.push, '/settings/form/[id]', `/settings/form/${result.ID}`);
              return;
            }
            setFormDefinition(result);
          }
        } else {
          setSubmitting(false);
          setConfirming(false);
        }
      }
    } else {
      toast.setToast({
        message: 'There are errors on the page',
        show: true,
        type: Enums.ToastType.error,
      });
      setSubmitting(false);
      setConfirming(false);
    }

    if (!isNew) {
      setSubmitting(false);
      setConfirming(false);
    }

    setInputErrors(errors);
    return submitFinished;
  };

  const isConfirmed = () => {
    return formDefinition && formDefinition.FormDefinitionStatus === Enums.FormDefinitionStatus.Confirmed;
  };

  const allowNavRef = useRef(false);
  const allowNavigation = () => {
    allowNavRef.current = true;
  };

  const checkConfirmNavigation = () => {
    return !isNew && !isConfirmed() && !formIsDirty && !allowNavRef.current;
  };



  const expireTimespanChanged = (e) => {
    let minutes = parseFloat(e);
    if (minutes !== expireTimespan) {
      setExpireTimespan(minutes);
      expireTimespanRef.current = minutes;
      doSetFormIsDirty(true, false);
    }
  };

  const handleJobTypeChange = (jobTypes) => {
    setJobTypes(jobTypes);
    jobTypesRef.current = jobTypes;
    doSetFormIsDirty(true);
  };

  const cancel = () => {
    Helper.nextRouter(Router.push, "/settings/form/list");
  };

  const preview = async (documentType) => {
    setSubmitting(true);

    await DownloadService.downloadFile('POST', '/FormDefinition/Preview', {
      formDefinitionID: formDefinition.ID
    }, true, undefined, "", "", null, false, () => {
      setSubmitting(false);
    });
  };

  Helper.preventRouteChange(formIsDirty, setFormIsDirty, setConfirmOptions, submitFormDefinition);
  Helper.preventRouteChangeGeneric(checkConfirmNavigation, allowNavigation,
    "Form is not confirmed",
    "Are you sure you want to navigate away? A draft form will not be visible to users in its current version.",
    setConfirmOptions);

  return (
    <>
      {isNew ?
        <div className="row">
          <h3>Create Form</h3>
        </div> :
        <div className="row">
          <div className="column">
            <h3>Edit Form Details [{formDefinition.FormDefinitionStatus === Enums.FormDefinitionStatus.Confirmed ? "Live" : "Draft"}]</h3>
          </div>
          <div className="column column-end">
            <div className="actions">
              {!isConfirmed() ? <>
                <Button disabled={submitting || accessStatus === Enums.AccessStatus.LockedWithAccess || accessStatus === Enums.AccessStatus.LockedWithOutAccess}
                  text={submitting && confirming ? "Making Live" : 'Make Live'} onClick={() => !submitting && confirmFormDefinition()}
                  extraClasses="auto" />
              </> : ""}
              <Button disabled={submitting || !formIsDirty || accessStatus === Enums.AccessStatus.LockedWithAccess || accessStatus === Enums.AccessStatus.LockedWithOutAccess}
                text={submitting && !confirming ? "Saving" : 'Save'} onClick={() => !submitting && submitFormDefinition(structureLocked ? Enums.FormDefinitionStatus.Confirmed : Enums.FormDefinitionStatus.Draft)} extraClasses="auto" />
              <Button text={`Cancel`} onClick={cancel} disabled={submitting} extraClasses="auto hollow" />
              <Button
                disabled={submitting}
                text="Preview"
                extraClasses="fit-content auto no-margin hollow"
                onClick={() => preview(Enums.DocumentType.Form)}
              />
            </div>
          </div>
        </div>
      }

      <div>
        {isConfirmed() ? <>
          The form is confirmed and ready for use.
        </> :
          <>
            The form is in draft status and will not be useable until confirmed.
          </>}
      </div>

      <div>
        Forms are used to capture information in your own, fully customisable way.
        <br />Forms can be classified by linking them to a job or customer.
        <br />The form remains in a Draft status and cannot be used until it is Confirmed.
        <br />Job types can be linked to this form as a way of pre-selecting the form for your employees to fill out.
        <br />Customer forms can be set to expire at some point in the future, requiring the user to fill it in with more up to date information.
      </div>

      {/* <div>
        Forms are used to capture information in your own, fully customisable way.
        <br />
        The form rule field allows you to classify this as a job or customer form.
        <br />
        Job types can be linked to this form as a means of pre-selecting the form for your employees to fill out.
        <br />
        Customer forms can be set to expire at some point in the future, requiring the user to fill it in with more up to date information.
      </div> */}
      <div className="row">
        <div className="column">
          <SCInput
            label="Name of the form"
            onChange={handleNameChange}
            required={true}
            value={name}
            error={inputErrors.Name}
            readOnly={structureLocked}
          />
        </div>
        <div className="column">
          <SCInput
            label="Description"
            onChange={handleDescriptionChange}
            required={false}
            value={description}
            error={inputErrors.Description}
            readOnly={structureLocked}
          />
        </div>
      </div>
      <div className="row">
        <div className="column">
          <SCDropdownList
            name="FormRule"
            error={inputErrors.FormRule}
            value={selectedFormRule}
            options={formRulesRef.current}
            onChange={updateSelectedFormRule}
            required={true}
            dataItemKey={"value"}
            textField={"description"}
            disabled={!isNew}
            label="Link Form to"
          />
        </div>
        <div className="column">
          <SCMultiSelect availableOptions={jobTypeOptionsRef.current} selectedOptions={jobTypes}
            textField={'Name'} dataItemKey={'ID'} label="Job Types"
            onChange={handleJobTypeChange} />
        </div>
      </div>
      {nonExpiring || !selectedFormRule || selectedFormRule.value !== Enums.FormRule.Customer ? "" : <div className="row">
        <div className="column">
          <div className="switch-left">
            <SCSwitch label="Form Expires" checked={formExpires.current} onToggle={() => {
              let newFormExpires = !formExpires.current;
              formExpires.current = newFormExpires;
              if (newFormExpires) {
                setExpireTimespan(1 * 60 * 24 * 7); // 1 week default
              } else {
                setExpireTimespan(0);
              }
              doSetFormIsDirty(true, false);
            }} />
            {/*<ReactSwitch label="Form Expires" checked={formExpires.current} handleChange={() => {
              let newFormExpires = !formExpires.current;
              formExpires.current = newFormExpires;
              if (newFormExpires) {
                setExpireTimespan(1 * 60 * 24 * 7); // 1 week default
              } else {
                setExpireTimespan(0);
              }
              doSetFormIsDirty(true, false);
            }} />*/}
          </div>
        </div>
        {formExpires.current ? <div className="column">
          <MinuteSelector
            label="Form Expiration"
            value={expireTimespan}
            name="ExpireTimespan"
            required={true}
            error={inputErrors.ExpireTimespan}
            onChange={expireTimespanChanged}
            defaultUnit="Month"
            readOnly={structureLocked}
          />
        </div> : ""}

      </div>}

      {!isNew ? <div className="row">
        <div className="column">
          <SCInput
            label="Version"
            onChange={() => { }}
            required={false}
            value={formDefinition.Version}
            disabled={true}
          />
        </div>
        <div className="column">

        </div>
      </div> : ""}



      {!isNew ? <>

        <div>
          <br />
          Populate your form by adding items.
        </div>

        <div className="row">
          <FormDefinitionFields key={1}
            formDefinitionFields={formDefinitionFields}
            updateFormDefinitionFields={updateFormDefinitionFields}
            inputErrors={inputErrors} accessStatus={accessStatus}
            formDefinition={formDefinition} updateFormDefinition={setFormDefinition}
            structureLocked={structureLocked}
          />
        </div>
      </> : ""}

      {isNew ?
        <div className="actions">
          <Button text={`Create Form`} onClick={() => !submitting && submitFormDefinition(Enums.FormDefinitionStatus.Draft)} disabled={submitting} extraClasses="auto" />
          <Button text={`Cancel`} onClick={cancel} disabled={submitting} extraClasses="auto hollow" />
        </div> : ''
      }

      {!isNew && !structureLocked ?
        <div className="switch">
          <SCSwitch label="Active" checked={isActive} onToggle={() => handleIsActiveChange()} />
          {/*<ReactSwitch label="Active" checked={isActive} handleChange={() => handleIsActiveChange()} />*/}
        </div> : ''
      }

      <ConfirmAction options={confirmOptions} setOptions={setConfirmOptions} />

      <style jsx>{`
        .row {
          display: flex;
        }
        .column {
          display: flex;
          flex-direction: column;
          width: ${layout.inputWidth};
        }
        .column :global(.textarea-container) {
          height: 100%;
        }
        .column + .column {
          margin-left: 1.25rem;
        }
        .column-end {
          align-items: flex-end;
        }
        .switch {
          flex-direction: row-reverse;
          display: flex;
          margin-top: 1rem;
        }
        .switch-left {
          margin-top: 1.5rem;
        }

        .actions {
          margin-top: 1rem;
          padding-bottom: 1rem;
          display: flex;
          flex-direction: row-reverse;
        }

        .actions :global(.button){
          margin-left: 0.5rem;
          margin-top: 0;
          padding: 0 1rem;
          white-space: nowrap;
      }
      `}</style>
    </>
  );
};

export default ManageFormDefinition;
