import React, { useState, useRef } from 'react'
import { colors, fontSizes, layout, fontFamily } from '../theme'
import TextInput from './text-input'
import useOutsideClick from "../hooks/useOutsideClick";
import time from '../utils/time';
import PreviewJobCard from './modals/jobcard/preview-job-card';

function JobHistoryJob({ job, selectedJob, setSelected, isServiceMode }) {
  const [showMore, setShowMore] = useState(false)

  const ref = useRef();
  useOutsideClick(ref, () => {
    if (showMore) {
      setShowMore(false);
    }
  });

  function employeeDetails() {
    if (job.Employees && job.Employees.length > 0) {
      let name = job.Employees[0].FirstName + " " + job.Employees[0].LastName;
      if (job.Employees.length > 1) {
        name = name + " + " + (job.Employees.length - 1);
      }
      const initials = job.Employees[0].FirstName[0] + job.Employees[0].LastName[0];
      return [name, initials];
    }
    return ['Unassigned', 'N/A'];
  }

  const [employeeName, employeeInititials] = employeeDetails();

  return (
    <div className={`job ${job.IsClosed ? "" : "job-open"}`}>
      <div className={`radio ${selectedJob != job.JobCardNumber ? '' : 'radio-selected'}`} onClick={job.IsClosed ? () => setSelected(job.JobCardNumber) : null}>
      </div>
      <div className="number">
        {job.JobCardNumber}
        <p>{job.IsClosed ? "Closed" : "Open"}</p>
      </div>
      <div className={`service ${job.IsClosed ? "" : "service-open"}`}>
        {job.InventoryDescription}
        <p>{job.IsClosed ?
          time.formatDate(job.ClosedDate)
          : ''
        }
        </p>
      </div>
      <div className="description">
        {job.Description}
      </div>
      <div className="view" onClick={() => setShowMore(!showMore)} ref={showMore ? ref : null}>
        View
      </div>

      {showMore ?
        <PreviewJobCard id={job.ID} setShowJobCardPreview={setShowMore} /> : ''          
      }

      <style jsx>{`
        .job {
          align-items: center;
          background-color: ${colors.background};
          border-radius: ${layout.cardRadius};
          display: flex;
          height: 5.5rem;
          margin-top: 1rem;
          padding: 0 1.5rem;
        }
        .job-open {
          background-color: rgba(245, 248, 251, 0.3);
        }
        .job-open .number, .job-open .service, .job-open .description{
          opacity: 0.5;
        }
        .radio {
          border: 1px solid ${colors.blueGreyLight};
          border-radius: 0.75rem;
          box-sizing: border-box;
          cursor: ${job.IsClosed ? "pointer" : "autp"};
          flex-shrink: 0;
          height: 1.5rem;
          margin-right: 2.5rem;
          opacity: ${job.IsClosed ? "1" : "0.3"};
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
        .number {
          flex-shrink: 0;
          margin-right: 1.5rem;
          width: 6rem;
        }
        .number p {
          font-size: 0.875rem;
          margin: 4px 0 0 0;
        }
        .service {
          flex-shrink: 0;
          margin-right: 1.5rem;
          width: 8rem;

          overflow: hidden;
          text-overflow: ellipsis;
          -webkit-line-clamp: 2;
          display: -webkit-box;
          -webkit-box-orient: vertical;
        }
        .service p {
          font-size: 0.875rem;
          font-weight: bold;
          margin: 4px 0 0 0;
        }
        .description {
          flex-shrink: 0;
          margin-right: 1.5rem;
          width: 9rem;

          overflow: hidden;
          text-overflow: ellipsis;
          -webkit-line-clamp: 2;
          display: -webkit-box;
          -webkit-box-orient: vertical;
        }
        .view {
          color: ${colors.bluePrimary};
          cursor: pointer;
          font-weight: bold;
          position: relative;
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
  )
}

export default JobHistoryJob;