import React, { useState, useEffect, useContext, useRef } from 'react';
import { colors, fontSizes, layout, fontFamily, tickSvg } from '../../../theme';
import Button from '../../button';
import Checkbox from '../../checkbox';
import * as Enums from '../../../utils/enums';
import Time from '../../../utils/time';
import AssignTechnicians from '../../shared-views/assign-technicians';
import KendoDateRangePicker from '../../kendo/kendo-date-range-picker';
import ReactSwitch from '../../react-switch';
import SCSwitch from "../../sc-controls/form-controls/sc-switch";

export default function ExportSchedules({ onConfirm, setShowExport }) {


  let initialStart = Time.addDays(-6, Time.today());
  let initialEnd = Time.addSeconds(-1, Time.addDays(1, Time.today()));

  const [startDateTime, setStartDateTime] = useState(initialStart);
  const [endDateTime, setEndDateTime] = useState(initialEnd);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [includeUnassigned, setIncludeUnassigned] = useState(false);

  const selectEmployee = (employee) => {
    let dummy = [...selectedEmployees];
    let idx = dummy.findIndex(x => x.ID === employee.ID);
    if (idx > -1) {
      dummy.splice(idx, 1);
    } else {
      dummy.push(employee);
    }
    setSelectedEmployees(dummy);
  }

  const closeModal = () => {
    setShowExport(false);
  };

  const doConfirm = () => {
    closeModal();
    if (onConfirm) {
      onConfirm({
        StartDateTime: startDateTime,
        EndDateTime: endDateTime,
        EmployeeIDList: selectedEmployees.map(x => x.ID),
        IncludeUnassigned: includeUnassigned
      });
    }
  };

  const dateRangeChanged = (dateRange) => {
    let start = dateRange.start;
    let end = dateRange.end;
    if (start) start = Time.today(dateRange.start);
    if (end) end = Time.toISOString(Time.addSeconds(-1, Time.addDays(1, Time.today(dateRange.end))), true, true, true);
    setStartDateTime(start);
    setEndDateTime(end);
  };

  return (
    <div className="overlay" onClick={(e) => e.stopPropagation()}>
      <div className="container">
        <div className="title">
          Export Appointments
        </div>
        <div className="row">
          <KendoDateRangePicker dateRange={{ start: startDateTime, end: endDateTime }} onChange={dateRangeChanged} />
        </div>
        <div className="row">
          <AssignTechnicians emptyHeading="All Employees" selectedEmployees={selectedEmployees} storeID={null} selectEmployee={selectEmployee} />
        </div>
        {selectedEmployees && selectedEmployees.length > 0 ? <div className="row">
          {/*<ReactSwitch checked={includeUnassigned} label="Include Unassigned" handleChange={() => setIncludeUnassigned(!includeUnassigned)} />*/}
          <SCSwitch checked={includeUnassigned} label="Include Unassigned" onToggle={() => setIncludeUnassigned(!includeUnassigned)} />
        </div> : ""}
        <div className="row space-between">
          <div className="cancel">
            <Button text='Cancel' extraClasses="hollow" onClick={closeModal} />
          </div>
          <div className="update">
            <Button text="Export" extraClasses="" onClick={doConfirm} />
          </div>
        </div>
      </div>
      <style jsx>{`
        .overlay {
          align-items: center;
          background-color: rgba(19, 106, 205, 0.9);
          bottom: 0;
          display: flex;
          justify-content: center;
          left: 0;
          position: fixed;
          right: 0;
          top: 0;
          z-index: 110;
        }
        .container {
          background-color: ${colors.white};
          border-radius: ${layout.cardRadius};
          padding: 0 0.5rem 0.5rem 0.5rem;
          width: 32rem;
        }
        .row {
          display: flex;
        }
        .space-between {
          justify-content: space-between;
        }
        .align-end {
          align-items: flex-end;
        }
        .title {
          color: ${colors.bluePrimary};
          font-size: 1.125rem;
          font-weight: bold;
          margin-bottom: 1rem;
        }
        .text {
          line-height: 1.25rem;
        }
        .label {
          font-size: 0.875rem;
          margin-bottom: 0.5rem;
        }
        
        .cancel {
          width: 6rem;
        }
        .update {
          width: 14rem;
        }
        .option-container {
          max-height: 26rem;
          overflow-y: scroll;
        }
        .option {
          align-items: center;
          cursor: pointer;
          display: flex;
          height: 2rem;
        }
        .box {
          border: 1px solid ${colors.labelGrey};
          border-radius: ${layout.inputRadius};
          box-sizing: border-box;
          cursor: pointer;
          height: 1rem;
          margin-right: 1rem;
          opacity: 0.4;
          width: 1rem;
        }
        .selected .box {
          background-color: ${colors.bluePrimary};
          background-image: ${tickSvg};
          background-position: center;
          background-repeat: no-repeat;
          background-size: 70%;
          border: none;
          opacity: 1;
        }
      `}</style>
    </div >
  );
};
