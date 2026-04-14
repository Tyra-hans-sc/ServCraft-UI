import React, { useState, useEffect, useContext } from 'react';
import Button from '../../button';
import SCInput from '../../sc-controls/form-controls/sc-input';
import { colors, layout } from '../../../theme';
import Fetch from '../../../utils/Fetch';
import * as Enums from '../../../utils/enums';
import Helper from '../../../utils/helper';
import ToastContext from '../../../utils/toast-context';
import ReactSwitch from '../../react-switch';
import AddTaskTemplate from '../task-template/add-task-template';
import WorkflowSelector from '../../selectors/workflow-selector';
import AddFormDefinition from '../form-definition/add-form-definition';
import SCSwitch from '../../sc-controls/form-controls/sc-switch';
import SCCheckbox from '../../sc-controls/form-controls/sc-checkbox';
import constants from '../../../utils/constants';

function ManageJobType({ isNew, jobType, onJobTypeSave, isWorkflow, accessStatus }) {

  const toast = useContext(ToastContext);
  const [inputErrors, setInputErrors] = useState({});

  const [inputs, setInputs] = useState({
    Name: isNew ? '' : jobType.Name,
    IsActive: isNew ? true : jobType.IsActive,
    OnlyLinkedForms: isNew ? false : jobType.OnlyLinkedForms
  });

  const [selectedWorkflow, setSelectedWorkflow] = useState();

  const getWorkflow = async () => {
    let workflowResult = {};
    if (isNew) {
      workflowResult = await Fetch.get({
        url: `/Workflow/GetDefaultWorkflow`,
      });
    } else {
      workflowResult = await Fetch.get({
        url: `/Workflow/${jobType.WorkflowID}`,
      });
    }
    setSelectedWorkflow(workflowResult);

   /* if(workflowResult && workflowResult.ID) {
      setSelectedWorkflow(workflowResult);
    } else {
      setSelectedWorkflow({
        ...
      })
    }*/
  };

  useEffect(() => {
    if (isWorkflow) {
      getWorkflow();
    }
  }, []);

  const [jobTypeTaskTemplates, setJobTypeTaskTemplates] = useState(isNew ? [] : jobType.TaskTemplates);
  const [formDefinitions, setFormDefinitions] = useState(isNew ? [] : jobType.FormDefinitions.filter(x => x.IsActive === true));

  const [addTaskTemplate, setAddTaskTemplate] = useState(false);

  const [addFormDefinition, setAddFormDefinition] = useState(false);

  const onTaskTemplateAdd = (template) => {
    if (template) {
      setJobTypeTaskTemplates([...jobTypeTaskTemplates, template]);
    }
    setAddTaskTemplate(false);
  };

  const onFormDefinitionAdd = (formDefinition) => {
    if (formDefinition) {
      setFormDefinitions([...formDefinitions, formDefinition]);
    }
    setAddFormDefinition(false);
  };

  const removeTaskTemplate = (item) => {
    let temp = [...jobTypeTaskTemplates];
    let indexToRemove = temp.findIndex(x => x.ID == item.ID);
    if (indexToRemove > -1) {
      temp.splice(indexToRemove, 1);
      setJobTypeTaskTemplates(temp);
    }
  };

  const removeFormDefinition = (item) => {
    let temp = [...formDefinitions];
    let indexToRemove = temp.findIndex(x => x.ID == item.ID);
    if (indexToRemove > -1) {
      temp.splice(indexToRemove, 1);
      setFormDefinitions(temp);
    }
  }

  const getIgnoreTaskTemplateIDs = () => {
    let ids = [];

    if (jobTypeTaskTemplates && jobTypeTaskTemplates.length > 0) {
      ids = jobTypeTaskTemplates.map(x => x.ID);
    }

    return ids;
  };

  const getIgnoreFormDefinitionIDs = () => {
    let ids = [];

    if (formDefinitions && formDefinitions.length > 0) {
      ids = formDefinitions.map(x => x.ID);
    }

    return ids;
  };

  const handleInputChange = (e) => {
    console.log(e);
    setInputs({
      ...inputs,
      [e.name]: e.value
    });
  };

  const [saving, setSaving] = useState(false);

  const maxNameLength = 250;

  const validate = () => {
    let validationItems = [
      { key: 'Name', value: inputs.Name, required: true, maxStringLength: maxNameLength, type: Enums.ControlType.Text }
    ];
    if (isWorkflow) {
      validationItems = [...validationItems,
      { key: 'Workflow', value: selectedWorkflow, required: true, type: Enums.ControlType.Select }
      ];
    }
    return Helper.validateInputs(validationItems);
  };

  const save = async () => {
    setSaving(true);

    let { isValid, errors } = validate();
    setInputErrors(errors);

    if (isValid) {
      let response;

      let jobTypeParams = {
        ...jobType,
        Name: inputs.Name,
        IsActive: inputs.IsActive,
        OnlyLinkedForms: inputs.OnlyLinkedForms,
        DisplayOrder: 1,
        Default: false,
      };

      if (isWorkflow) {
        jobTypeParams = {
          ...jobTypeParams,
          WorkflowID: selectedWorkflow ? selectedWorkflow.ID : null,
        };
      }

      let taskTemplateIDs = jobTypeTaskTemplates ? jobTypeTaskTemplates.map(x => x.ID) : [];
      let formDefinitionIDs = formDefinitions ? formDefinitions.map(x => x.ID) : [];

      if (isNew) {
        response = await Fetch.post({
          url: `/JobType`,
          params: {
            JobType: jobTypeParams,
            TaskTemplatesIDs: taskTemplateIDs,
            FormDefinitionIDs: formDefinitionIDs
          },
          toastCtx: toast
        });
      } else {
        response = await Fetch.put({
          url: `/JobType`,
          params: {
            JobType: jobTypeParams,
            TaskTemplatesIDs: taskTemplateIDs,
            FormDefinitionIDs: formDefinitionIDs
          },
          toastCtx: toast
        });
      }

      if (response.ID) {
        Helper.mixpanelTrack(isNew ? constants.mixPanelEvents.createJobType : constants.mixPanelEvents.editJobType, {
          "jobTypeID": response.ID
        });
        onJobTypeSave(response);
      } else {
        toast.setToast({
          message: response.serverMessage,
          show: true,
          type: Enums.ToastType.error
        });
        setSaving(false);
      }
    } else {
      toast.setToast({
        message: `Error saving job type`,
        show: true,
        type: Enums.ToastType.error,
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
            <h1>Creating a Job Type</h1> :
            <h1>Editing a Job Type</h1>
          }
        </div>

        <div className="section">
          <div className="row">
            <div className="column">
              <SCInput
                label="Name"
                onChange={handleInputChange}
                required={true}
                name="Name"
                value={inputs.Name}
                error={inputErrors.Name}
              />
            </div>
          </div>

          {isWorkflow ?
            <div className="row">
              <div className="column">
                <WorkflowSelector selectedWorkflow={selectedWorkflow} setSelectedWorkflow={setSelectedWorkflow}
                  accessStatus={accessStatus} error={inputErrors.Workflow}
                />
              </div>
            </div> : ''
          }

          <div className="row">
            {jobTypeTaskTemplates && jobTypeTaskTemplates.length > 0 ?
              <div className="column heading" style={{ paddingTop: "12px" }}>
                Task Templates
              </div>
              : ''}
          </div>

          <div className="row">
            <div className="column">
              {jobTypeTaskTemplates && jobTypeTaskTemplates.length > 0 ?
                <div className="table-container">
                  <table className="table">
                    <thead>
                      <tr>
                        <th className="header-item-desc">
                          TASK TEMPLATE DESCRIPTION
                        </th>
                        <th className="header-item-delete">
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {jobTypeTaskTemplates.map((item, index) => {
                        return <tr key={index}>
                          <td className="body-item-desc">
                            {item.Name}
                          </td>
                          <td className="body-item-delete" title="Remove task template">
                            {accessStatus !== Enums.AccessStatus.LockedWithAccess && accessStatus !== Enums.AccessStatus.LockedWithOutAccess ? <>
                              <img src="/icons/trash-bluegrey.svg" alt="delete" onClick={() => removeTaskTemplate(item)} />
                            </> : ''}
                          </td>
                        </tr>
                      })}
                    </tbody>
                  </table>
                </div>
                : ''
              }
            </div>

          </div>

          <div className="row">
            <Button disabled={accessStatus === Enums.AccessStatus.LockedWithAccess || accessStatus === Enums.AccessStatus.LockedWithOutAccess}
              text="Add Task Template" icon="plus-circle-blue" extraClasses={`hollow fit-content`} onClick={() => setAddTaskTemplate(true)} />
          </div>

          <div className="row">
            <div className="column">
              {formDefinitions && formDefinitions.length > 0 ?
                <div className="table-container">
                  <table className="table">
                    <thead>
                      <tr>
                        <th className="header-item-desc">
                          FORM NAME
                        </th>
                        <th className="header-item-delete">
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {formDefinitions.map((item, index) => {
                        return <tr key={index}>
                          <td className="body-item-desc">
                            {item.Name}
                          </td>
                          <td className="body-item-delete" title="Remove form">
                            {accessStatus !== Enums.AccessStatus.LockedWithAccess && accessStatus !== Enums.AccessStatus.LockedWithOutAccess ? <>
                              <img src="/icons/trash-bluegrey.svg" alt="delete" onClick={() => removeFormDefinition(item)} />
                            </> : ''}
                          </td>
                        </tr>
                      })}
                    </tbody>
                  </table>
                </div>
                : ''
              }
            </div>

          </div>

          <div className="row">
            <Button disabled={accessStatus === Enums.AccessStatus.LockedWithAccess || accessStatus === Enums.AccessStatus.LockedWithOutAccess}
              text="Add Form" icon="plus-circle-blue" extraClasses={`hollow fit-content`} onClick={() => setAddFormDefinition(true)} />

          </div>
          <div className="row">
            <SCCheckbox
              extraClasses={"margin-top"}
              name={"OnlyLinkedForms"}
              label={"Only Allow Linked Forms"}
              value={inputs.OnlyLinkedForms}
              onChangeFull={handleInputChange}
            />
          </div>

          {!isNew ?
            <div className="switch">
              <SCSwitch label="Active" name="IsActive" checked={inputs.IsActive}
                onToggle={(checked) => handleInputChange({ name: "IsActive", value: checked })} />
              {/*<ReactSwitch label="Active" name="IsActive" checked={inputs.IsActive}
                handleChange={(checked) => handleInputChange({ name: "IsActive", value: checked })} />*/}
            </div> : ''
          }
        </div>

        <div className="row align-end">
          <Button text="Cancel" extraClasses="auto hollow" onClick={() => onJobTypeSave(null)} />
          <Button disabled={accessStatus === Enums.AccessStatus.LockedWithAccess || accessStatus === Enums.AccessStatus.LockedWithOutAccess || saving}
            text={`${isNew ? `Create` : `Save`}`} extraClasses="auto left-margin" onClick={save} />
        </div>
      </div>

      {addTaskTemplate ?
        <AddTaskTemplate onTaskTemplateAdd={onTaskTemplateAdd} ignoreIDs={getIgnoreTaskTemplateIDs()} /> : ''
      }

      {addFormDefinition ?
        <AddFormDefinition onFormDefinitionAdd={onFormDefinitionAdd} ignoreIDs={getIgnoreFormDefinitionIDs()} /> : ''
      }

      <style jsx>{`
        .modal-container {
          min-height: 30rem;
        }
        .row {
          display: flex;
          justify-content: space-between;
        }
        .column {
          display: flex;
          flex-basis: 0;
          flex-direction: column;
          flex-grow: 1;
          width: 100%;
        }
        .column :global(.textarea-container) {
          height: 100%;
        }
        .column + .column {
          margin-left: 1.25rem;
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

        .table-container {
          overflow-x: auto;
          width: 100%;
          display: flex;
          flex-direction: column;
        }
        .table {
          border-collapse: collapse;
          margin-top: 1.5rem;
          width: 100%;
        }
        .table thead tr {
          background-color: ${colors.backgroundGrey};
          height: 3rem;
          border-radius: ${layout.cardRadius};
          width: 100%;
        }
        .table th {
          color: ${colors.darkPrimary};
          font-size: 0.75rem;
          font-weight: normal;
          padding: 4px 1rem 4px 0;
          position: relative;
          text-align: left;
          text-transform: uppercase;
          transform-style: preserve-3d;
          user-select: none;
          white-space: nowrap;
        }
        .table th.number-column {
          padding-right: 0;
          text-align: right;
        }
        .table th:last-child {
          padding-right: 1rem;
          text-align: right;
        }
        .table th:first-child {
          padding-left: 0.5rem;
          text-align: left;
        }
        .table .spacer {
          height: 0.75rem !important;
        }
        .table tr {
          height: 2.5rem;
          cursor: pointer;
        }
        .table td {
          font-size: 12px;
          padding-right: 1rem;
        }
        .table td.number-column {
          padding-right: 0;
          text-align: right;
        }
        .table tr:nth-child(even) td {
          background-color: ${colors.white};
        }
        .table td:last-child {
          border-radius: 0 ${layout.buttonRadius} ${layout.buttonRadius} 0;
          text-align: right;
        }
        .table td:last-child :global(div){
          margin-left: auto;
        }
        .table td:first-child {
          border-radius: ${layout.buttonRadius} 0 0 ${layout.buttonRadius};
          padding-left: 1rem;
          text-align: left;
        }
        .table td:first-child :global(div){
          margin-left: 0;
        }

        .header-item-desc {
          min-width: 300px;
        }
        .header-item-delete {
          width: 5%;
          min-width: 30px;
        }
      `}</style>
    </div>
  );
}

export default ManageJobType;
