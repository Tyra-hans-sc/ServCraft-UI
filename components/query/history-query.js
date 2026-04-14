import React, { useState, useRef, useEffect } from 'react';
import { colors, layout } from '../../theme';
import useOutsideClick from "../../hooks/useOutsideClick";
import Fetch from '../../utils/Fetch';

function QueryHistoryQuery({query}) {
  const [showMore, setShowMore] = useState(false);

  const ref = useRef();
  useOutsideClick(ref, () => {
    if (showMore) {
      setShowMore(false);
    }
  });

  const [employeeName, setEmployeeName] = useState('');
  const [employeeInitials, setEmployeeInitials] = useState('');

  useEffect(() => {
    async function getEmployeeDetails() {
      if (query.EmployeeID) {
        const employee = await Fetch.get({
          url: `/Employee?id=${query.EmployeeID}`
        });
        let name = employee.FirstName + " " + employee.LastName;
        const initials = employee.FirstName[0] + employee.LastName[0];
        setEmployeeInitials(initials);
        setEmployeeName(name);
      } else {
        setEmployeeInitials('N/A');
        setEmployeeName('Unassigned');
      }
    }
    getEmployeeDetails();
  }, []);

  return (
    <div className="query">
      <div className="code">
        {query.QueryCode}
      </div>
      <div className="status">
        {query.QueryStatusDescription}
      </div>
      <div className="description">
        {query.Description}
      </div>
      <div className="view" onClick={() => setShowMore(!showMore)} ref={showMore ? ref : null}>
        View 
        { showMore ?
          <div className="more">
            <div className="row">
              <h1>{query.QueryCode}</h1>
              <div className="row">
                <div className="tech">
                  <p>Assigned Employee</p>
                  {employeeName}
                </div>
                <div className="initials">
                  {employeeInitials}
                </div>
              </div>
            </div>
            <p>Location</p>
            {query.Location ? query.Location.Description : 'No Location'}
            <p>Status</p>
            {query.QueryStatusDescription}
            <p>Description of the query</p>
            {query.Description}            
          </div>
          : ""
        }
      </div>

      <style jsx>{`
        .query {
          align-items: center;
          background-color: ${colors.background};
          border-radius: ${layout.cardRadius};
          display: flex;
          height: 5.5rem;
          margin-top: 1rem;
          padding: 0 1.5rem;
        }
        .radio {
          border: 1px solid ${colors.blueGreyLight};
          border-radius: 0.75rem;
          box-sizing: border-box;
          cursor: pointer;
          flex-shrink: 0;
          height: 1.5rem;
          margin-right: 2.5rem;
          position: relative;
          width: 1.5rem;
        }
        .radio-selected {
          border: 1px solid ${colors.bluePrimary};
        }
        .radio-selected:after {
          background-color: ${colors.bluePrimary};
          border-radius: 0.5rem;
          content: '';
          height: 1rem;
          left: 3px;
          position: absolute;
          top: 3px;
          width: 1rem;
        }
        .code {
          flex-shrink: 0;
          margin-right: 1.5rem;
          width: 6rem;
        }
        .code p {
          font-size: 0.875rem;
          margin: 4px 0 0 0;
        }
        .status {
          flex-shrink: 0;
          margin-right: 1.5rem;
          width: 8rem;
        }
        .description {
          flex-grow: 1;
          max-height: 2.5rem;
          overflow: hidden;
          padding-right: 1.5rem;
        }
        .view {
          color: ${colors.bluePrimary};
          cursor: pointer;
          font-weight: bold;
          position: relative;
        }
        .more {
          background-color: white;
          box-shadow: 0px 10px 16px rgba(0, 0, 0, 0.1), 0px 4px 6px rgba(0, 0, 0, 0.06);
          color: ${colors.darkPrimary};
          font-weight: normal;
          position: absolute;
          padding: 1.5rem;
          right: 100%;
          top: 100%;
          width: 368px;
        }
        .more p {
          color: ${colors.blueGreyLight};
          font-size: 0.875rem;
          margin: 1rem 0 0.25rem 0
        }
        .more h1 {
          font-size: 1.25rem;
          font-weight: bold;
          margin: 0;
        }
        .row {
          display: flex;
          justify-content: space-between;
        }
        .tech {
          text-align: right;
        }
        .tech p {
          margin-top: 0;
        }
        .initials {
          align-items: center;
          color: ${colors.white};
          display: flex;
          font-size: 0.875rem;
          height: 2.5rem;
          justify-content: center;
          margin-left: 0.5rem;
          position: relative;
          width: 2.5rem;
          z-index: 2;
        }
        .initials:after {
          background-color: ${colors.bluePrimary};
          border: 2px solid ${colors.white};
          border-radius: 1.25rem;
          box-sizing: border-box;
          content: '';
          height: 2.5rem;
          position: absolute;
          right: 0;
          top: 0;
          width: 2.5rem;
          z-index: -1;
        }
        .initials-multiple:before {
          background-color: ${colors.bluePrimary};
          border: 2px solid ${colors.white};
          border-radius: 1.25rem;
          box-sizing: border-box;
          color: ${colors.white};
          content: '';
          height: 2.5rem;
          position: absolute;
          right: -0.4rem;
          top: 0;
          width: 2.5rem;
          z-index: -1;
        }
      `}</style>
    </div>
  );
}

export default QueryHistoryQuery
