import React, { useState, useRef } from 'react';
import { colors, fontSizes, layout, fontFamily } from '../../theme';
import useOutsideClick from "../../hooks/useOutsideClick";
import Helper from '../../utils/helper';
import Time from '../../utils/time';

function ProjectHistoryProject({project, selectedProject, setSelectedProject}) {

  const [showMore, setShowMore] = useState(false)
  
  const ref = useRef();
  useOutsideClick(ref, () => {
    if (showMore) {
      setShowMore(false);
    }
  });

  const employeeDetails = () => {
    if (project.Employee) {
      let name = project.Employee.FirstName + " " + project.Employee.LastName;
      const initials = project.Employee.FirstName[0] + project.Employee.LastName[0];
      return [name, initials];
    }
    return ['Unassigned', 'N/A'];
  }

  const [employeeName, employeeInitials] = employeeDetails();

  return (
    <div className={`project`}>
      <div className="description">
        {project.Description}
      </div>
      <div className="start-date">
        {Time.formatDate(project.StartDate)}
      </div>      
      <div className="view" onClick={() => setShowMore(!showMore)} ref={showMore ? ref : null}>
      View
        { showMore ?
          <div className="more">
            <div className="row">
              <div className="row">
                <div className="tech">
                  <p>Assigned Technician</p>
                  {employeeName}
                </div>
                <div className={`initials`}>
                  {employeeInitials}
                </div>
              </div>
            </div>
            <p>Location</p>
            {project.LocationDescription}
            <p>Description of the project</p>
            {project.Description}
            <p>Start Date</p>
            {Time.formatDate(project.StartDate)}
            <p>Due Date</p>
            {Time.formatDate(project.DueDate)}
          </div>
          : ''
        }
      </div>

      <style jsx>{`
        .project {
          align-items: center;
          background-color: ${colors.background};
          border-radius: ${layout.cardRadius};
          display: flex;
          height: 5.5rem;
          margin-top: 1rem;
          padding: 0 1.5rem;
        }
        .description {
          flex-grow: 1;
          max-height: 2.1rem;
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
          z-index: 5;
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
      `}</style>
    </div>
  );
}

export default ProjectHistoryProject;
