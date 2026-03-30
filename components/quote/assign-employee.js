import React, { useState, useRef, useEffect } from 'react'
import { colors, fontSizes, layout, fontFamily, tickSvg } from '../../theme'
import TextInput from '../text-input'
import useOutsideClick from "../../hooks/useOutsideClick";
import Helper from '../../utils/helper'
import Fetch from '../../utils/Fetch'

// NOT BEING USED????
function AssignEmployee(props) {

  const [employees, setEmployees] = useState([{}]);
  const selectedEmployee = Helper.isEmptyObject(props.selectedEmployee) ? null : props.selectedEmployee;
  const [searching, setSearching] = useState(false);

  let deselectingEmployee = false;

  async function getEmployees() {
    setSearching(true);
    const employees = await Fetch.get({
      url: '/Employee/GetEmployees',
      params: {
      },
    });
    setEmployees(employees.Results);
    setSearching(false);
  }

  useEffect(() => {
    getEmployees();
  }, []);

  const [inputFocus, setInputFocus] = useState(false);
  const ref = useRef();
  useOutsideClick(ref, () => {
    if (inputFocus) {
      setInputFocus(false);
    }
  });
  
  function toggleSelection() {
    if (!deselectingEmployee) {
      setInputFocus(!inputFocus);
    }
  }

  function deselectEmployee() {
    deselectingEmployee = true;
    props.setSelected(null);
    setInputFocus(false);
  }

  function selectEmployee(employee) {
    props.setSelected(employee);
    setInputFocus(false);
  }

  return (
    <div className={`container ${props.error ? 'error' : ''}`} ref={inputFocus ? ref : null} onClick={toggleSelection}>
      <div className={`assign-container ${selectedEmployee ? 'hidden': ''}`}>        
        <div className="circle unassigned">
          <img src="/icons/user-white.svg" alt="user" />
        </div>
        <div className="middle-column">
          Assign Employee
        </div>
        <div className="right-column">
          <img src="/icons/chevron-down-dark.svg" alt="dropdown" className="arrow" />
        </div>
      </div>
      <div className={`assign-container ${selectedEmployee ? '': 'hidden'}`}>
        <div className="circle assigned">
          { selectedEmployee ? Helper.getInitials(selectedEmployee.FullName) : Helper.getInitials('')}
        </div>
        <div className="middle-column">
          { selectedEmployee ? selectedEmployee.FullName : '' }
        </div>
        <div className="right-column">
          <img src="/icons/x-circle-dark.svg" alt="dropdown" className="arrow" onClick={deselectEmployee} />
        </div>
      </div>
      <div className={`results ${inputFocus ? '' : 'hidden' }`}>
        <div className={`loader ${searching ? 'show-loader' : '' }`}></div>
        { employees && employees.map(function (employee, index) {
            return (
              <div className="result" key={index} onClick={() => selectEmployee(employee)}>
                <div className={`initial ${searching ? 'hidden' : ''}`}>{Helper.getInitials(employee.FullName)}</div>
                <div className="row">
                  <h3>{employee.FullName}</h3>
                  <p>{employee.EmailAddress}</p>
                </div>
              </div>
            );
          })}
      </div>

      <style jsx>{`
        .container {
          position: relative;
          cursor: pointer;
          width: 100%;
          margin-top: 0.5rem;
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
          left: 0.5rem;
          margin-right: 1rem;
          position: absolute;
          top: 0.5rem;
          width: 2.5rem;
        }
        .assigned {
          background-color: ${colors.bluePrimary};
        }
        .unassigned {
          background-color: ${colors.blueGreyLight};
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
          right: 0;
          top: 1rem;
          z-index: 1;
        }
        .hidden {
          display: none !important;
        }
        .error {
          border: 1px solid ${colors.warningRed};
        }

        .results {
          background-color: ${colors.white};
          box-shadow: 0px 10px 10px rgba(0, 0, 0, 0.04), 0px 20px 25px rgba(0, 0, 0, 0.1);
          position: absolute;
          left: 0;
          max-height: 240px;
          min-height: 34px;
          overflow-y: scroll;
          top: 3.5rem;
          width: 100%;
          z-index: 3;
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
      `}</style>
    </div>
  );
}

export default AssignEmployee