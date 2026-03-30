import React, { useState, useEffect, useContext, useRef } from 'react';
import Router from 'next/router';
import {layout} from '../../theme';
import Fetch from '../../utils/Fetch';
import Helper from '../../utils/helper';
import * as Enums from '../../utils/enums';
import ToastContext from '../../utils/toast-context';
import SCInput from '../../components/sc-controls/form-controls/sc-input';
import ConfirmAction from '../../components/modals/confirm-action';
import TaskItemTemplates from './items';
import constants from '../../utils/constants';
import SCDropdownList from '../sc-controls/form-controls/sc-dropdownlist';
import SCSwitch from "../sc-controls/form-controls/sc-switch";
import {Button, Flex} from "@mantine/core";

const ManageTaskTemplate = ({ taskTemplate, setTaskTemplate, isNew, accessStatus }) => {

  const toast = useContext(ToastContext);

  const [formIsDirty, setFormIsDirty] = useState(false);
  const [confirmOptions, setConfirmOptions] = useState(Helper.initialiseConfirmOptions());


  const [name, setName] = useState(isNew ? '' : taskTemplate.Name);
  const nameRef = useRef(name);
  nameRef.current = name;

  const saveTimeout = useRef(null);

  const doSetFormIsDirty = (fid, immediate = true) => {
    if (fid && !isNew) {
      if (saveTimeout.current)
        clearTimeout(saveTimeout.current);

      if (immediate) {
        submitTaskTemplate();
      } else {
        saveTimeout.current = setTimeout(() => {
          submitTaskTemplate();
        }, 1500);
      }
    }

    setFormIsDirty(fid);
  };

  const handleNameChange = (e) => {
    setName(e.value);
    nameRef.current = e.value;
    doSetFormIsDirty(true, false);
  };


  const [isActive, setIsActive] = useState(isNew ? true : taskTemplate.IsActive);
  const isActiveRef = useRef(isActive);
  isActiveRef.current = isActive;

  const [selectedModule, setSelectedModule] = useState(isNew ? null : 
    {'description': Enums.getEnumStringValue(Enums.Module, taskTemplate.Module, true), 'value': taskTemplate.Module}
  );
  const selectedModuleRef = useRef(selectedModule ? selectedModule.value : null);
  selectedModuleRef.current = selectedModule ? selectedModule.value : null;

  const updateSelectedModule = (e) => {
    setSelectedModule(e);
    selectedModuleRef.current = e.value;
    doSetFormIsDirty(true);
  }

  const modulesRef = useRef([]);

  useEffect(() => {
    modulesRef.current = Enums.getEnumItemsVD(Enums.Module, true).filter(x => x.value == Enums.Module.JobCard || x.value == Enums.Module.Query);
  }, []);

  const [taskItemTemplates, setTaskItemTemplates] = useState(isNew ? [] : [...taskTemplate.TaskItemTemplates]);
  const taskItemTemplatesRef = useRef(taskItemTemplates);
  taskItemTemplatesRef.current = taskItemTemplates;

  const updateTaskItemTemplates = (items) => {
    setTaskItemTemplates(items);
    taskItemTemplatesRef.current = items;
    doSetFormIsDirty(true);
  };

  const [inputErrors, setInputErrors] = useState({});

  const validate = () => {

    let validationItems = [];
    validationItems = [
      { key: 'Name', value: nameRef.current, required: true, type: Enums.ControlType.Text },
      { key: 'Module', value: selectedModuleRef.current, required: true, type: Enums.ControlType.Select },
    ];

    return Helper.validateInputs(validationItems);
  };

  const [submitting, setSubmitting] = useState(false);

  const submitTaskTemplate = async () => {
    let submitFinished = false;
    setSubmitting(true);

    let { isValid, errors } = validate();
    if (isValid) {

      if (taskItemTemplatesRef.current.length > 0) {
        if (taskItemTemplatesRef.current.some(x => x.Description.trim() === '')) {
          errors.TaskItems = 'Task template item error';
        }
      }

      if (taskItemTemplatesRef.current.length <= 0) {
        toast.setToast({
          message: 'Please add task template items',
          show: true,
          type: Enums.ToastType.error,
        });

        setSubmitting(false);
      } else {
        let result = {};

        let taskTemplateToSave = {
          ...taskTemplate,
          Name: nameRef.current,
          Module: selectedModuleRef.current,
        };

        if (isNew) {
          taskTemplateToSave = {
            ...taskTemplateToSave,
            IsActive: true,
          };
          result = await Fetch.post({
            url: `/TaskTemplate`,
            params: {
              TaskTemplate: taskTemplateToSave,
              TaskItemTemplates: taskItemTemplatesRef.current,
            },
            toastCtx: toast,
          });
        } else {
          taskTemplateToSave = {
            ...taskTemplateToSave,
            IsActive: isActiveRef.current,
          };

          result = await Fetch.put({
            url: `/TaskTemplate`,
            params: {
              TaskTemplate: taskTemplateToSave,
              TaskItemTemplates: taskItemTemplatesRef.current,
            },
            toastCtx: toast,
          });
        }

        if (result.ID) {
          if (isNew) {
            Helper.mixpanelTrack(constants.mixPanelEvents.createTaskTemplate, {
              "taskTemplateID": result.ID
            });
          } else {
            Helper.mixpanelTrack(constants.mixPanelEvents.editTaskTemplate, {
              "taskTemplateID": result.ID
            });
          }

          toast.setToast({
            message: 'Task template saved successfully',
            show: true,
            type: 'success'
          });

          submitFinished = true;
          doSetFormIsDirty(false);
          await Helper.waitABit();
          if (isNew) {
            Helper.nextRouter(Router.push, '/settings/task/[id]', `/settings/task/${result.ID}`);
          } else {
            setTaskTemplate(result);
          }
        } else {
          setSubmitting(false);
        }
      }
    } else {
      toast.setToast({
        message: 'There are errors on the page',
        show: true,
        type: Enums.ToastType.error,
      });
      setSubmitting(false);
    }

    if (!isNew) {
      setSubmitting(false);
    }

    setInputErrors(errors);
    return submitFinished;
  };

  const cancel = () => {
    Helper.nextRouter(Router.push, '/settings/task/list');
  };

  Helper.preventRouteChange(formIsDirty, setFormIsDirty, setConfirmOptions, submitTaskTemplate);

  return (
    <>
      {isNew ?
        <div className="row">
          <h3>Task Template Details</h3>
        </div> :
        <div className="row">
          <div className="column">
            <h3>Task Template Details</h3>
          </div>
        </div>
      }
      <div className="row">
        <div className="column">
          <SCInput
              label="Name"
              onChange={handleNameChange}
              required={true}
              value={name}
              error={inputErrors.Name}
              cypress="data-cy-name"
          />
        </div>
      </div>
      <div className="row">
        <div className="column">
          <SCDropdownList
              name="Module"
              dataItemKey="value"
              textField="description"
              onChange={updateSelectedModule}
              label="Module"
              options={modulesRef.current}
              required={true}
              value={selectedModule}
              error={inputErrors.Module}
              cypress="data-cy-module"
          />
        </div>
      </div>

      <div className="row">
        <TaskItemTemplates key={1} taskItemTemplates={taskItemTemplates} updateTaskItemTemplates={updateTaskItemTemplates} inputErrors={inputErrors} accessStatus={accessStatus} />
      </div>

      {!isNew ?
        <div className="switch">
          <SCSwitch label="Active" checked={isActive}
            onToggle={() => {
              isActiveRef.current = !isActive;
              setIsActive(isActiveRef.current);
              doSetFormIsDirty(true);
            }} />
          {/*<ReactSwitch label="Active" checked={isActive}
            handleChange={() => {
              isActiveRef.current = !isActive;
              setIsActive(isActiveRef.current);
              doSetFormIsDirty(true);
            }} />*/}
        </div> : ''
      }

      {
        isNew &&
          <Flex mt={'xl'} gap={5}>
            <Button
                variant={'outline'}
                onClick={cancel}
            >
              Cancel
            </Button>
            <Button
                onClick={submitTaskTemplate}
                disabled={submitting}
            >
              Create
            </Button>
          </Flex>
      }

      {/*{ isNew ?
          <>
              <div className="create-actions">
                  <LegacyButton text={`Create`} extraClasses="auto" onClick={submitTaskTemplate} disabled={submitting} />
                  <LegacyButton text="Cancel" extraClasses="hollow auto" onClick={cancel} />
              </div>
          </> : ''
      }*/}

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
        .create-actions {
          display: flex;
          flex-direction: row-reverse;
        }
        .create-actions :global(.button){
            margin-left: 0.5rem;
            margin-top: 1rem;
            padding: 0 1rem;
            white-space: nowrap;
        }
        .actions {
            display: flex;
            flex-direction: row-reverse;                    
        }
        .actions :global(.button) {
            margin-left: 0.5rem;
            margin-top: 0;
            padding: 0 1rem;
            white-space: nowrap;
        }
      `}</style>
    </>
  );
};

export default ManageTaskTemplate;
