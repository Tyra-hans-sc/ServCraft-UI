import React, { useState, useEffect, useContext } from 'react';
import { colors, fontSizes, layout, fontFamily } from '../../../theme';
import Button from '../../button';
import SCComboBox from '../../sc-controls/form-controls/sc-combobox';
import Fetch from '../../../utils/Fetch';
import * as Enums from '../../../utils/enums';
import Helper from '../../../utils/helper';
import ToastContext from '../../../utils/toast-context';

function AddFormDefinition({onFormDefinitionAdd, ignoreIDs = []}) {

  const [formDefinitions, setFormDefinitions] = useState([]);
  const [selectedFormDefinition, setSelectedFormDefinition] = useState();

  const handleFormDefinitionChange = (value) => {
    setSelectedFormDefinition(value);
  };

  const searchFormDefinitions = async (skipIndex, take, filter) => {

    const searchResults = await Fetch.post({
      url: `/FormDefinition/GetFormDefinitions`,
      params: {
        SearchPhrase: filter,
        PageIndex: skipIndex,
        PageSize: take,
        ExcludeIDList: ignoreIDs
      }
    });
    setFormDefinitions(searchResults.Results);
    return {data: searchResults.Results, total: searchResults.TotalResults};
  };

  const toast = useContext(ToastContext);
  const [inputErrors, setInputErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const validate = () => {
    const { isValid, errors } = Helper.validateInputs([
      { key: "FormDefinition", value: selectedFormDefinition, type: Enums.ControlType.Select, required: true },
    ]);

    setInputErrors(errors);
    return isValid;
  };

  const addFormDefinition = () => {  
    let isValid = validate();
    if (isValid) {
        onFormDefinitionAdd(selectedFormDefinition);
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
          <h1>Add Form to Job Type</h1>
        </div>
        
        <div className="row">
          <div className="column">
            <SCComboBox 
              dataItemKey="ID"
              textField="Name"
              getOptions={searchFormDefinitions}
              pageSize={10}
              label="Form"
              onChange={handleFormDefinitionChange}
              value={selectedFormDefinition}
              required={true}
              error={inputErrors.FormDefinition}
            />
          </div>
        </div>
        {formDefinitions && formDefinitions.length > 0 ? 
          <div className="table-container">
            <h3>Forms</h3>
            <table className="table">
              <thead>
                <tr>
                  <th className="header-item-desc">
                    NAME
                  </th>
                </tr>
              </thead>
              <tbody>
                {formDefinitions.map((item, index) => {
                  return (
                    <tr key={index}>
                      <td className="body-item-desc">
                        {item.Name}
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
            <Button text="Cancel" extraClasses="auto hollow" onClick={() => onFormDefinitionAdd(null)} />          
            <Button text={`Save`} extraClasses="auto left-margin" onClick={addFormDefinition} disabled={saving} />
        </div>
      </div>

      <style jsx>{`
        .modal-container {
          min-height: 30rem;
        }
        .title {
          color: ${colors.bluePrimary};
          font-size: 1.125rem;
          font-weight: bold;
          margin-bottom: 1rem;
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

export default AddFormDefinition;
