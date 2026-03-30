import React, { useState, useEffect, useContext } from 'react';
import { colors, fontSizes, layout, fontFamily } from '../../theme';
import Fetch from '../../utils/Fetch';
import Helper from '../../utils/helper';
import * as Enums from '../../utils/enums';
import Button from '../button';
import ToastContext from '../../utils/toast-context';
import WorkflowSelector from '../selectors/workflow-selector';
import ConfirmAction from '../modals/confirm-action';
import ReactSwitch from '../react-switch';
import DualList from '../dual-list';
import SCSwitch from "../sc-controls/form-controls/sc-switch";

function EmployeeJobStatus({ employee, accessStatus, customerStatus, isEnterprise, updateEmployeeProperty, employeeSaving }) {

  const toast = useContext(ToastContext);

  const [formIsDirty, setFormIsDirty] = useState(false);
  const [confirmOptions, setConfirmOptions] = useState(Helper.initialiseConfirmOptions());

  const [availableJobStatuses, setAvailableJobStatuses] = useState([]);
  const [assignedJobStatuses, setAssignedJobStatuses] = useState([]);
  const [jobStatusesForEnterprise, setJobStatusesForEnterprise] = useState([]);

  const getJobStatuses = async () => {

    if (isEnterprise && !selectedWorkflow) {
      return;
    }

    let allStatusURL = ``;
    let employeeStatusURL = ``;

    if (isEnterprise) {
      allStatusURL = `/JobStatus?workflowID=${selectedWorkflow.ID}&onlyActive=false`;
      employeeStatusURL = `/JobStatus/GetByEmployee?employeeID=${employee.ID}`;
    } else {
      allStatusURL = `/JobStatus?onlyActive=false`;
      employeeStatusURL = `/JobStatus/GetByEmployee?employeeID=${employee.ID}`;
    }

    const allStatusResult = await Fetch.get({
      url: allStatusURL
    });
    const employeeStatusResult = await Fetch.get({
      url: employeeStatusURL
    });

    const allStatuses = Helper.sortObjectArray(allStatusResult.Results, 'Description');
    const employeeStatuses = employeeStatusResult.Results;

    let available = [];
    let assigned = [];

    for (let status of allStatuses) {

      available.push({ label: status.Description, value: status.ID, isActive: status.IsActive });

      let isAssigned = employeeStatuses.some(x => x.ID == status.ID);

      if (isAssigned) {
        assigned.push(status.ID);
      }
    }

    setAvailableJobStatuses(available);
    setAssignedJobStatuses(assigned);

    if (isEnterprise) {
      let enterpriseStatuses = [];
      for (let status of employeeStatuses) {
        enterpriseStatuses.push({ ID: status.ID, WorkflowID: status.WorkflowID });
      }
      setJobStatusesForEnterprise(enterpriseStatuses);
    }
  };

  useEffect(() => {
    getJobStatuses();
  }, []);

  const onChange = (values) => {
    if (isEnterprise) {
      if (values && values.length > 0) {
        let items = jobStatusesForEnterprise.filter(x => x.WorkflowID != selectedWorkflow.ID);
        for (let value of values) {
          items.push({ ID: value, WorkflowID: selectedWorkflow.ID });
        }
        setJobStatusesForEnterprise(items);
      } else {
        setJobStatusesForEnterprise(jobStatusesForEnterprise.filter(x => x.WorkflowID != selectedWorkflow.ID));
      }
    }
    setAssignedJobStatuses(values);
  };

  const [statusAssigned, setStatusAssigned] = useState(0);

  useEffect(() => {
    if (statusAssigned > 1) {
      save();
    }

    setStatusAssigned(statusAssigned + 1);
  }, [assignedJobStatuses]);


  const [selectedWorkflow, setSelectedWorkflow] = useState();

  const getDefaultWorkflow = async () => {
    let workflowResult = await Fetch.get({
      url: `/Workflow/GetDefaultWorkflow`,
    });
    setSelectedWorkflow(workflowResult);
  };

  useEffect(() => {
    if (isEnterprise) {
      getDefaultWorkflow();
    }
  }, [isEnterprise]);

  useEffect(() => {
    if (selectedWorkflow) {
      setStatusAssigned(1);
      getJobStatuses();
      setFormIsDirty(true);
    }
  }, [selectedWorkflow]);

  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);

    const employeeJobStatusUpdateResult = await Fetch.put({
      url: `/JobStatus/EmployeeJobStatusUpdate`,
      params: {
        employeeID: employee.ID,
        jobStatusIDList: isEnterprise ? jobStatusesForEnterprise.map(x => x.ID) : assignedJobStatuses
      }
    });

    if (employeeJobStatusUpdateResult.HttpStatusCode == 200) {
      // toast.setToast({
      //   message: 'Job statuses assigned successfully',
      //   show: true,
      //   type: 'success'
      // });
      setFormIsDirty(false);
    } else {
      toast.setToast({
        message: 'Job statuses failed to be assigned',
        show: true,
        type: Enums.ToastType.error
      });
    }

    setSaving(false);
  };

  const isAllJobCardStatusChanged = async (checked) => {
    updateEmployeeProperty("IsAllJobCardStatus", checked);
  };


  const jobStatusTemplateFunction = (props) => {
    let { dataItem, selected, ...others } = props;
    return (
      <li {...others}>
        <div>
          <span
            style={{
              opacity: (props.dataItem.isActive ? 1 : 0.4)
            }}
          >
            {props.dataItem.label} {props.dataItem.isActive ? "" : "(Disabled)"}
          </span>
        </div>
      </li>
    );
  };

  return (
    <div className="container">
      <div className="row">
        <div className="column">
          <h3>Job Statuses for {employee.FirstName} {employee.LastName}</h3>
        </div>
        {/* <div className="column column-end">
          <Button disabled={(accessStatus === Enums.AccessStatus.LockedWithAccess || accessStatus === Enums.AccessStatus.LockedWithOutAccess) && customerStatus !== "Trial"}
            text={saving ? "Saving" : "Save"} extraClasses="auto save" onClick={save} />
        </div> */}
      </div>

      <div className="initial-blurb">
        Job statuses that the employee is allowed to select when changing status
      </div>

      <div className="row row-margins">
        <SCSwitch label={employeeSaving ? "Access all job statuses updating..." : "Access all job statuses"} disabled={employeeSaving} checked={employee.IsAllJobCardStatus} onToggle={isAllJobCardStatusChanged} />
        {/*<ReactSwitch label="Is All Job Status" checked={employee.IsAllJobCardStatus} handleChange={isAllJobCardStatusChanged} />*/}
      </div>

      {employee.IsAllJobCardStatus ? "" : <>
        {isEnterprise ?
          <div className="row bottom-margin">
            <WorkflowSelector selectedWorkflow={selectedWorkflow} setSelectedWorkflow={setSelectedWorkflow}
              accessStatus={accessStatus} required={true} searchable={true}
            />
          </div> : ''
        }
        <div className="row">
          <DualList options={availableJobStatuses} selectedOptionIDs={assignedJobStatuses} onChange={onChange} canFilter={true}
            showHeaderLabels={true}
            assignedTitle="Assigned Job Statuses"
            templateFunction={jobStatusTemplateFunction}
            textField="label"
            valueField="value"
            unassignedTitle="Unassigned Job Statuses"
          />
        </div>
      </>}

      <ConfirmAction options={confirmOptions} setOptions={setConfirmOptions} />

      <style>{`
        .row {
          display: flex;
        }

        .row-margins {
          margin: 0 0 1rem 0;
        }

        .space-between {
          justify-content: space-between;
        }
        .column {
          display: flex;
          flex-direction: column;
          width: 100%;
        }
        .column-end {
          align-items: flex-end;
        }
        .column-margin {
          margin-left: 24px;
        }  
        .bottom-margin {
          margin-bottom: 1rem;
        }
        .initial-blurb {
          font-size: 0.8rem;
        }
      `}</style>
    </div>
  );
}

export default EmployeeJobStatus;
