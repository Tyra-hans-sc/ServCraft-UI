import React, { useState, useRef, useEffect } from 'react';
import { colors, fontSizes, layout, fontFamily, tickSvg } from '../../theme';
import { useOutsideClick } from "rooks";
import Helper from '../../utils/helper';
import Fetch from '../../utils/Fetch';
import EmployeeService from '../../services/employee/employee-service';

function AssignTechnicians(props) {

  const [emptyHeading, setEmptyHeading] = useState(props.emptyHeading ? props.emptyHeading : "Assign Employees")
  const [employees, setEmployees] = useState([{}]);
  const selectedEmployees = props.selectedEmployees ? props.selectedEmployees : [];
  const [searching, setSearching] = useState(false);

  const dropdownDirection = props.dropdownDirection ? props.dropdownDirection : 'down';

  let selectingEmployee = false;

  async function getEmployees() {
    if (props.disabled) {
      return;
    }
    setSearching(true);
    const employees = await EmployeeService.getEmployees(props.storeID);
    setEmployees(employees.Results);
    setSearching(false);

    props.onEmployeesGet && props.onEmployeesGet(employees.Results);
  }

  const oldStoreID = useRef(props.storeID);

  useEffect(() => {
    getEmployees();
  }, []);

  useEffect(() => {
    let skip = props.storeID === oldStoreID.current;
    oldStoreID.current = props.storeID;
    if (skip) {
      return;
    }
    getEmployees();
  }, [props.storeID]);

  const [inputFocus, setInputFocus] = useState(false);
  const ref = useRef();
  useOutsideClick(ref, () => {
    if (inputFocus) {
      setInputFocus(false);
    }
  });

  function toggleSelection() {
    if (!selectingEmployee) {
      let allow = true;
      if (props.disabled === true) {
        allow = false;
      }
      setInputFocus(allow && !inputFocus);
    }
  }

  function selectEmployee(employee) {
    props.selectEmployee(employee);
    selectingEmployee = true;
  }

  return (
    <div className={`container container-employees ${props.error ? 'error' : ''}`} ref={inputFocus ? ref : null} onClick={toggleSelection}>
      <div className={`assign-container ${selectedEmployees.length > 0 ? 'hidden' : ''}`}>
        <div className="circle unassigned">
          <img src="/icons/user-white.svg" alt="user" />
        </div>
        <div className="middle-column">
          {emptyHeading} {props.error ? <span className="errorText">{props.error}</span> : ""}
        </div>
        <div className="right-column">
          <img src="/icons/chevron-down-dark.svg" alt="dropdown" className={`arrow ${dropdownDirection == 'up' ? 'flip-icon' : ''}`} />
        </div>
      </div>
      <div className={`assign-container ${selectedEmployees.length > 0 ? '' : 'hidden'}`}>

        <span className="label">Assigned Employees</span>
        {selectedEmployees.map(function (employee, index) {

          let displayColorStyle = employee.DisplayColor && employee.DisplayColor.startsWith("#") ? employee.DisplayColor : "";
          let displayColorClass = employee.DisplayColor && !displayColorStyle ? employee.DisplayColor + "Local" : "";

          if (index < 3) {
            return (
              <div key={index} className={`circle circle-${index} ${displayColorClass ? displayColorClass : 'assigned'}`} style={{backgroundColor: `${displayColorStyle}`}}
                title={employee.FullName}>
                {employee.FullName ? Helper.getInitials(employee.FullName) : Helper.getInitials(employee.EmployeeFullName)}
              </div>
            )
          }
        })}

        {selectedEmployees.length > 3 ?
          <div className="superscript">
            +{selectedEmployees.length - 3}
          </div> : ''
        }

        <div className="middle-column">
          {/* { selectedEmployee ? selectedEmployee.FullName : '' } */}
        </div>
        <div className="right-column">
          <img src="/icons/chevron-down-dark.svg" alt="dropdown" className={`arrow ${dropdownDirection == 'up' ? 'flip-icon' : ''}`} />
        </div>
      </div>
      <div className={`results ${inputFocus ? '' : 'hidden'} ${dropdownDirection == 'up' ? 'options-up' : 'options-down'}`}>
        <div className={`loader ${searching ? 'show-loader' : ''}`}></div>
        {employees && employees.map(function (employee, index) {
          
          const optionSelected = (selectedEmployees ? selectedEmployees.filter(function (e) { return e.ID === employee.ID; }).length > 0 : false);

          let displayColorStyle = employee.DisplayColor && employee.DisplayColor.startsWith("#") ? employee.DisplayColor : "";
          let displayColorClass = employee.DisplayColor && !displayColorStyle ? employee.DisplayColor + "Local" : "";

          return (
            <div className="result result-employees" key={index} onClick={() => selectEmployee(employee)}>
              <div className={`initial ${searching ? 'hidden' : ''} ${displayColorClass ? displayColorClass : ''}`} style={{backgroundColor: `${displayColorStyle}`}}>
                {Helper.getInitials(employee.FullName)}
              </div>
              <div className="row">
                <h3>{employee.FullName}</h3>
                <p>{employee.EmailAddress}</p>
              </div>
              <div className={optionSelected ? "box box-checked" : "box"}></div>             
            </div>
          );
        })}
      </div>

      <style jsx>{`
        .label {
          color: ${colors.labelGrey};
          font-size: 14px;
          text-align: left;
        }
        .container {
          position: relative;
          cursor: pointer;
          width: 100%;
          margin-top: 0.5rem;
          background-color: ${colors.formGrey};
          border-radius: ${layout.inputRadius};
        }
        .assign-container {
          border-radius: ${layout.inputRadius};
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          height: 3.5rem;
          padding: 0.5rem;
          position: relative;
          width: 100%;
        }
        
        .circle {
          align-items: center;
          border-radius: 1.25rem;
          color: ${colors.white};
          display: flex;
          font-weight: bold;
          height: 2.5rem;
          justify-content: center;
          left: 10.5rem;
          margin-right: 1rem;
          position: absolute;
          top: 0.5rem;
          width: 2.5rem;
        }
        .circle.unassigned {
          left: 0.5rem;
        }
        .circle-1 {
          left: 13.5rem;
        }
        .circle-2 {
          left: 16.5rem;
        }
        .circle-3 {
          left: 19.5rem;
        }
        .superscript {
          left: 20rem;
          margin-right: 1rem;
          position: absolute;
          top: 1.2rem;          
          width: 2.5rem;
        }
        .assigned {
          background-color: ${colors.bluePrimary};
        }
        .unassigned {
          background-color: ${colors.blueGreyLight};
        }

        .RedLocal {
          background-color: #FC2E50 !important;
        }
        .OrangeLocal {
          background-color: #F26101 !important;
        }
        .YellowLocal {
          background-color: #FFC940 !important;
        }
        .GreenLocal {
          background-color: #51CB68 !important;
        }
        .BlueLocal {
          background-color: #5A85E1 !important;
        }
        .PurpleLocal {
          background-color: #735AE1 !important;
        }
        .BlackLocal {
          background-color: #4F4F4F !important;
        }
        .GreyLocal {
          background-color: #828282 !important;
        }
        .LightGreyLocal {
          background-color: #BDBDBD !important;
        }
        .CyanLocal {
          background-color: #13CACD !important;
        }

        .middle-column {
          align-items: center;
          display: flex;
          justify-content: center;
          position: absolute;
          top: 1.1rem;
          left: 4rem;
        }
        .right-column {

        }
        .arrow {
          position: absolute;
          right: 16px;
          top: 1rem;
          z-index: 1;
        }
        .hidden {
          display: none !important;
        }
        .error {
          border: 1px solid ${colors.warningRed};
        }
        .errorText {
          color: ${colors.warningRed};
        }

        .results {
          background-color: ${colors.white};
          box-shadow: 0px 10px 10px rgba(0, 0, 0, 0.04), 0px 20px 25px rgba(0, 0, 0, 0.1);
          position: absolute;
          left: 0;
          max-height: 240px;
          min-height: 34px;
          overflow-y: scroll;
          width: 100%;
          z-index: 8;
        }
        .result {
          align-items: center;
          cursor: pointer;
          display: flex;
          padding: 0.5rem 1rem;
        }
        .result :global(.initial){
          align-items: center;
          background-color: ${colors.bluePrimary};
          border-radius: 1.25rem;
          color: ${colors.white};
          display: flex;
          font-weight: bold;
          height: 2.5rem;
          justify-content: center;
          margin-right: 1rem;
          width: 2.5rem;
        }
        .result :global(h3){
          color: ${colors.darkPrimary};
          font-size: 1rem;
          margin: 0;
        }
        .result :global(p){
          color: ${colors.blueGrey};
          font-size: 14px;
          margin: 0;
        }
        .space-between {
          justify-content: space-between;
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
          position: absolute;
          right: 1rem;
        }
        .box-checked {
          background-color: ${colors.bluePrimary};
          background-image: ${tickSvg};
          background-position: center;
          background-repeat: no-repeat;
          background-size: 70%;
          border: none;
          opacity: 1;
        }

        .options-down {
          top: 3.5rem;
        }
        .options-up {
          bottom: 4rem;
        }
        .flip-icon {
          transform: rotate(180deg);
        }
      `}</style>
    </div>
  );
}

export default AssignTechnicians
