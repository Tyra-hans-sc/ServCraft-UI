import React, { useState, useEffect, useContext } from 'react';
import SCComboBox from '../sc-controls/form-controls/sc-combobox';
import SCDropdownList from '../sc-controls/form-controls/sc-dropdownlist';
import Fetch from '../../utils/Fetch';

function WorkflowSelector({selectedWorkflow, setSelectedWorkflow, searchable = true, required = true, pageSize = 20,  error, accessStatus}) {

  const handleChange = (value) => {
    setSelectedWorkflow(value);
  };

  const getData = async (skipIndex, take, filter) => {

    let params = {
        pageSize: take, pageIndex: skipIndex, 
        searchPhrase: filter, 
        SortExpression: "", SortDirection: "",
    };

    const request = await Fetch.post({
        url: `/Workflow/GetWorkflows`,
        params: params
    });
    setData(request.Results);
  };

  const [data, setData] = useState([]);

  useEffect(() => {
    getData();
  }, []);

  return (
      <SCDropdownList 
        name="Workflow"
        value={selectedWorkflow}
        dataItemKey="ID"
        textField="Name"
        onChange={handleChange}
        options={data}
        label="Workflow"
        required={required}
        extraClasses="input-width"
      />
  );
}

export default WorkflowSelector;
