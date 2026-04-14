import React, { useState, useEffect, useContext } from 'react';
import { colors } from '../../../theme';

import SCTextArea from '../../sc-controls/form-controls/sc-textarea';
import SCComboBox from '../../sc-controls/form-controls/sc-combobox';
import SCDatePicker from '../../sc-controls/form-controls/sc-datepicker';

import * as Enums from '../../../utils/enums';
import Helper from '../../../utils/helper';
import Time from '../../../utils/time';
import EmployeeMultiSelector from '../../selectors/employee/employee-multiselector';
import EmployeeService from '../../../services/employee/employee-service';
import TaskItemTemplateListOptions from '../task-template/task-item-template-list-options';
import SCSwitch from "../../sc-controls/form-controls/sc-switch";
import SCModal from "../../../PageComponents/Modal/SCModal";
import {Button, Flex, Title} from '@mantine/core';
import { showNotification } from '@mantine/notifications';

function ManageTaskItem({ isNew, module, taskItem, onTaskItemSave, data, accessStatus }) {

  const [inputs, setInputs] = useState(isNew ? {
    Description: '',
    DueDate: null,
    Complete: false,
    CompletedDate: null,
    IsActive: true,
    DisplayOrder: 1,
    ItemDataType: null,
    ItemDataOption: null,
    ItemDataResult: null
  } : {
    Description: taskItem.Description,
    DueDate: taskItem.DueDate,
    Complete: taskItem.Complete ? taskItem.Complete : false,
    CompletedDate: taskItem.CompletedDate,
    IsActive: taskItem.IsActive,
    DisplayOrder: taskItem.DisplayOrder,
    ItemDataType: taskItem.ItemDataType,
    ItemDataOption: taskItem.ItemDataOption,
    ItemDataResult: taskItem.ItemDataResult
  });

  const [dataTypeChecked, setDataTypeChecked] = useState(isNew ? false : !Helper.isNullOrWhitespace(taskItem.ItemDataType));

  const [isComplete, setIsComplete] = useState(isNew ? false : taskItem.Complete);

  const handleInputChange = (e) => {
    setInputs({
      ...inputs,
      [e.name]: e.value
    });
  };

  const dateChanged = (e, fieldName) => {
    setInputs({
      ...inputs,
      [fieldName]: Time.toISOString(Time.updateDate(inputs[fieldName], e.value))
    });
  };

  const [selectedEmployees, setSelectedEmployees] = useState([]);

  const selectEmployee = (employee) => {

    let employeeFound = selectedEmployees.find(x => x.ID == employee.ID);
    if (employeeFound) {
      let temp = selectedEmployees.filter(x => x.ID != employeeFound.ID);
      setSelectedEmployees([...temp]);
    } else {
      setSelectedEmployees([...selectedEmployees, employee]);
    }
  };

  async function getEmployees() {
    let employeeIDs = taskItem.TaskItemEmployees ? taskItem.TaskItemEmployees.map(x => { return x.EmployeeID }) : null;
    if (employeeIDs) {
      const employees = await EmployeeService.getEmployees(data.StoreID);
      setSelectedEmployees(employees.Results.filter(x => employeeIDs.some(y => y == x.ID)));
    }
  }

  useEffect(() => {
    if (!isNew) {
      getEmployees();
    }
  }, []);

  const [inputErrors, setInputErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const validate = () => {
    let validateInputs = [
      { key: "Description", value: inputs.Description, type: Enums.ControlType.Text, required: true }
    ];

    if (dataTypeChecked) {
      validateInputs.push({ key: 'ItemDataType', value: selectedDataType, required: true, type: Enums.ControlType.Select });
    }

    if (showDataOption()) {
      validateInputs.push({ key: 'ItemDataOption', value: inputs.ItemDataOption, required: true, type: Enums.ControlType.Text });
    }

    const { isValid, errors } = Helper.validateInputs(validateInputs);

    setInputErrors(errors);
    return isValid;
  };

  const saveItem = async () => {

    setSaving(true);

    let isValid = validate();
    if (isValid) {

      let taskItemEmployees = selectedEmployees.length > 0 ?
        selectedEmployees.map((employee, i) => { return { EmployeeID: employee.ID, EmployeeFullName: employee.FullName, TaskItemID: taskItem ? taskItem.ID : null } }) : null;

      let item = {
        ...inputs,
        ID: taskItem ? taskItem.ID : null,
        Module: module,
        ItemID: data.ID,
        TaskItemEmployees: taskItemEmployees,
        //ItemDataType: selectedDataType ? selectedDataType.ID : null,
      };

      await onTaskItemSave(item);
      setSaving(false);
    } else {
      setSaving(false);
      showNotification({
        message: 'There are errors on the page',
        color: 'yellow.7'
      });
    }
  };

  const setDataOption = (option) => {
    setInputs({
      ...inputs,
      ItemDataOption: option
    });
  };

  const showDataOption = () => {
    return inputs.ItemDataType === "Select" || inputs.ItemDataType === "MultiSelect";
  }

  const getDataTypeOptions = () => {
    const keys = Object.keys(Enums.TaskTemplateDataTypes);
    return keys.map(key => {
      return {
        ID: key,
        Description: Enums.TaskTemplateDataTypes[key]
      };
    });
  }

  const [selectedDataType, setSelectedDataType] = useState(isNew ? null : taskItem.ItemDataType);

  const getSelectedDataType = () => {
    return inputs.ItemDataType ? {ID: inputs.ItemDataType, Description: Enums.TaskTemplateDataTypes[inputs.ItemDataType]} : null;
  };

  const dataTypeChanged = (option) => {
    setInputs({
      ...inputs,
      ItemDataType: option ? option.ID : null
    });
    setInputErrors({
      ...inputErrors,
      ItemDataType: null
    });

    setSelectedDataType(option ? option.ID : null);
  };

  const handleDataTypeCheckedChange = (checked) => {
    setDataTypeChecked(checked);
    if (!checked) {
      dataTypeChanged(null);
    }
  }
  return (
    <>
      <SCModal open={true}>

        <div className="title" style={{marginTop: 'var(--mantine-spacing-sm)'}}>
          {isNew ?
              <h1>Adding a Task</h1> :
              <h1>Editing a Task</h1>
          }
        </div>
        <div className="row">
          <div className="column">
            <SCTextArea
                label="Description"
                required={true}
                onChange={(e) => handleInputChange({name: "Description", value: e.value})}
                value={inputs.Description}
                error={inputErrors.Description}
                readOnly={isComplete}
            />
          </div>
        </div>

        {isComplete ? "" : <SCSwitch checked={dataTypeChecked}
                                     onToggle={(checked) => handleDataTypeCheckedChange(checked)}
                                     label='Add input to task'/>
          /*<ReactSwitch checked={dataTypeChecked}
          handleChange={(checked) => handleDataTypeCheckedChange(checked)} label='Add input to task' />*/}

        {dataTypeChecked ? <>
          <div className="row">
            <div className="column">
              <SCComboBox
                  label={"Type"}
                  name={"ItemDataType"}
                  error={inputErrors.ItemDataType}
                  options={getDataTypeOptions()}
                  textField="Description"
                  dataItemKey="ID"
                  onChange={(option => dataTypeChanged(option))}
                  value={getSelectedDataType()}
                  disabled={isComplete}
              />
            </div>
            <div className="column">
              {showDataOption() ? <>
                <h4>List Options</h4>
                <TaskItemTemplateListOptions dataOption={inputs.ItemDataOption} setDataOption={setDataOption}
                                             error={inputErrors.ItemDataOption} disabled={isComplete}/>
              </> : ""}
            </div>
          </div>

        </> : ""}

        <div className="row">
          <div className="column">
            <SCDatePicker
                changeHandler={(date) => dateChanged(date, "DueDate")}
                label='Due Date'
                error={inputErrors.DueDate}
                value={inputs.DueDate}
                disabled={isComplete}
                name="DueDate"
            />
          </div>
        </div>
        <div className="row">
          {/* <AssignTechnicians selectedEmployees={selectedEmployees} selectEmployee={selectEmployee} dropdownDirection="up" storeID={data.StoreID} disabled={isComplete} /> */}
          <div className="column">
            <EmployeeMultiSelector selectedEmployees={selectedEmployees} setSelectedEmployees={setSelectedEmployees}
                                   storeID={data.StoreID} disabled={isComplete}/>
          </div>
        </div>

        <Flex mt={'md'} justify={'end'} gap={'sm'}>
          {/*<LegacyButton text="Cancel" extraClasses="hollow auto" onClick={() => onTaskItemSave(null)}/>*/}
          <Button variant={'subtle'} color={'gray.7'} onClick={() => onTaskItemSave(null)} disabled={saving}>Cancel</Button>
          <Button
              extraClasses="auto left-margin"
              onClick={saveItem}
              disabled={saving}
              loading={saving}
          >
            {isNew ? `Add to ${module == Enums.Module.JobCard ? 'Job' : 'Query'}` : 'Save'}
          </Button>
        </Flex>

      </SCModal>


      <style jsx>{`
        .modal-container {

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

        .align-end {
          justify-content: flex-end;
          align-items: flex-end;
        }

        .title {
          color: ${colors.bluePrimary};
          font-size: 1.125rem;
          font-weight: bold;
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
    </>
  );
}

export default ManageTaskItem;
