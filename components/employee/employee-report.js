import React, { useState, useEffect, useContext } from 'react';
import { colors, fontSizes, layout, fontFamily } from '../../theme';
import Fetch from '../../utils/Fetch';
import Helper from '../../utils/helper';
import * as Enums from '../../utils/enums';
import DualList from '../dual-list';
import Button from '../button';
import ToastContext from '../../utils/toast-context';
import ReactSwitch from '../react-switch';
import SCSwitch from "../sc-controls/form-controls/sc-switch";

function EmployeeReport({ employee, accessStatus, customerStatus, updateEmployeeProperty, employeeSaving }) {

  const toast = useContext(ToastContext);

  const [availableReports, setAvailableReports] = useState([]);
  const [assignedReports, setAssignedReports] = useState([]);

  const getReports = async () => {
    const allReportResult = await Fetch.get({
      url: `/Report`
    });
    const employeeReportResult = await Fetch.get({
      url: `/Report/GetEmployeeReports?employeeID=${employee.ID}`
    });

    let allReports = Helper.sortObjectArray(allReportResult.Results, 'ReportName');
    let employeeReports = Helper.sortObjectArray(employeeReportResult.Results, 'ReportName');

    let available = [];
    let assigned = [];

    for (let report of allReports) {

      available.push({ label: report.ReportName, value: report.ID });

      let isAssigned = employeeReports.some(x => x.ID == report.ID);

      if (isAssigned) {
        assigned.push(report.ID);
      }
    }

    setAvailableReports(available);
    setAssignedReports(assigned);
  };

  useEffect(() => {
    getReports();
  }, []);

  const onChange = (values) => {
    setAssignedReports(values);
  };

  const [reportAssigned, setReportAssigned] = useState(0);

  useEffect(() => {
    if (reportAssigned > 1) {
      save();
    }

    setReportAssigned(reportAssigned + 1);
  }, [assignedReports]);

  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);

    const employeeReportUpdateResult = await Fetch.put({
      url: `/Report/EmployeeReportUpdate`,
      params: {
        employeeID: employee.ID,
        reportIDList: assignedReports
      }
    });

    if (employeeReportUpdateResult.HttpStatusCode == 200) {
      // toast.setToast({
      //   message: 'Reports assigned successfully',
      //   show: true,
      //   type: 'success'
      // });
    } else {
      toast.setToast({
        message: 'Reports failed to be assigned',
        show: true,
        type: Enums.ToastType.error
      });
    }

    setSaving(false);
  };

  const isAllReportChanged = async (checked) => {
    updateEmployeeProperty("IsAllReport", checked);
  };

  return (
    <div className="container">
      <div className="row">
        <div className="column">
          <h3>Reports for {employee.FirstName} {employee.LastName}</h3>
        </div>
        {/* <div className="column column-end">
          <Button disabled={(accessStatus === Enums.AccessStatus.LockedWithAccess || accessStatus === Enums.AccessStatus.LockedWithOutAccess) && customerStatus !== "Trial"}
            text={saving ? "Saving" : "Save"} extraClasses="auto save" onClick={save} />
        </div> */}
      </div>

      <div className="row row-margins">
        <SCSwitch label={employeeSaving ? "Access all reports updating..." : "Access all reports"} disabled={employeeSaving} checked={employee.IsAllReport} onToggle={isAllReportChanged} />
        {/*
        <ReactSwitch label="Is All Report" checked={employee.IsAllReport} handleChange={isAllReportChanged} />
*/}
      </div>

      {employee.IsAllReport ? "" :
        <div className="row">
          <DualList options={availableReports} selectedOptionIDs={assignedReports} onChange={onChange} canFilter={true}
            assignedTitle="Assigned Reports" unassignedTitle="Unassigned Reports" textField="label" valueField="value"
          />
        </div>
      }

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
      `}</style>
    </div>
  );
}

export default EmployeeReport;
