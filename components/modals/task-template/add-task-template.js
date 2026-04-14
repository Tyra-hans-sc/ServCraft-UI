import React, { useState, useEffect, useContext } from 'react';
import { colors, fontSizes, layout, fontFamily } from '../../../theme';
import Button from '../../button';
import SCComboBox from '../../sc-controls/form-controls/sc-combobox';
import Fetch from '../../../utils/Fetch';
import * as Enums from '../../../utils/enums';
import Helper from '../../../utils/helper';
import ToastContext from '../../../utils/toast-context';

function AddTaskTemplate({onTaskTemplateAdd, ignoreIDs = []}) {

  const [selectedTaskTemplate, setSelectedTaskTemplate] = useState();

  const handleTaskTemplateChange = (value) => {
    setSelectedTaskTemplate(value);
  };

  const [searchPageSize] = useState(20);

  const searchTaskTemplates = async (skipIndex, take, filter) => {
    
    const searchResults = await Fetch.post({
      url: `/TaskTemplate/GetTaskTemplates`,
      params: {
        ModuleList: [Enums.getEnumStringValue(Enums.Module, Enums.Module.JobCard)],
        SearchPhrase: filter,
        PageIndex: skipIndex,
        PageSize: take,
        ExcludeIDList: ignoreIDs
      }
    });
    
    return {data: searchResults.Results, total: searchResults.TotalResults};
  };

  const [taskItemTemplates, setTaskItemTemplates] = useState([]);

  const getTaskItemTemplates = async (taskTemplateID) => {
    const response = await Fetch.get({
      url: `/TaskTemplate/${taskTemplateID}`
    });
    
    setTaskItemTemplates(response.TaskItemTemplates);
  };

  useEffect(() => {
    if (selectedTaskTemplate) {
      getTaskItemTemplates(selectedTaskTemplate.ID);
    } else {
      setTaskItemTemplates([]);
    }
  }, [selectedTaskTemplate]);

  const toast = useContext(ToastContext);
  const [inputErrors, setInputErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const validate = () => {
    const { isValid, errors } = Helper.validateInputs([
      { key: "Template", value: selectedTaskTemplate, type: Enums.ControlType.Select, required: true },
    ]);

    setInputErrors(errors);
    return isValid;
  };

  const addTaskTemplate = () => {  
    let isValid = validate();
    if (isValid) {
      onTaskTemplateAdd(selectedTaskTemplate);
    } else {
      toast.setToast({
        message: 'There are errors on the page',
        show: true,
        type: Enums.ToastType.error
      });
    }
  };  

  return (
    <div className="overlay"onClick={(e) => e.stopPropagation()}>
      <div className="modal-container">
        <div className="title">
          <h1>Add task template to Job Type</h1>
        </div>
        
        <div className="row">
          <div className="column">
            <SCComboBox 
              dataItemKey="ID"
              textField="Name"
              getOptions={searchTaskTemplates}
              pageSize={searchPageSize}
              label="Task template"
              onChange={handleTaskTemplateChange}
              value={selectedTaskTemplate}
              required={true}
              error={inputErrors.Template}
            />
          </div>
        </div>
        {taskItemTemplates && taskItemTemplates.length > 0 ? 
          <div className="table-container">
            <h3>Task Items</h3>
            <table className="table">
              <thead>
                <tr>
                  <th className="header-item-desc">
                    DESCRIPTION
                  </th>
                  <th className="header-item-type">
                    TYPE
                  </th>
                </tr>
              </thead>
              <tbody>
                {taskItemTemplates.map((item, index) => {
                  return (
                    <tr key={index}>
                      <td className="body-item-desc">
                        {item.Description}
                      </td>
                      <td>
                        {Enums.TaskTemplateDataTypes[item.DataType]}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          : ''
        }

        <div className="row align-end">
            <Button text="Cancel" extraClasses="hollow auto" onClick={() => onTaskTemplateAdd(null)} />          
            <Button text={`Save`} extraClasses="auto left-margin" onClick={addTaskTemplate} disabled={saving} />
        </div>
      </div>

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

        .table-container {
          overflow-x: auto;
          width: 100%;
          display: flex;
          flex-direction: column;
        }
        .table {
          border-collapse: collapse;
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
          height: 4rem;
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
        .header-item-move {
          width: 5%;
          min-width: 30px;
        }
        .header-item-duedate {
          width: 5%;
          min-width: 80px;
        }
        .header-item-desc {
          min-width: 300px;
        }
        .header-item-type {
          min-width: 80px;
        }
        .header-item-employee {
          width: 200px;
          min-width: 200px;
        }
        .header-item-delete {
          width: 5%;
          min-width: 30px;
        }

        .body-item-move {
          cursor: move;
        }
        .body-item-desc {
        }
        .body-item-duedate {

        }
        .body-item-employee {
          min-width: 200px;
        }
    `}</style>
    </div>
  );
}

export default AddTaskTemplate;
