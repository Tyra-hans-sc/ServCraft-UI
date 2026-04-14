import React, { useState, useEffect } from 'react';
import { colors, fontSizes, layout, fontFamily, shadows } from '../../../theme';
import time from '../../../utils/time';
import Router from 'next/router';
import Helper from '../../../utils/helper';
import Fetch from '../../../utils/Fetch';

function PreviewJobCard({ id, setShowJobCardPreview, showJobEdit = false }) {

  const [jobCard, setJobCard] = useState(null);

  const getPopulatedJob = async () => {
    const request = await Fetch.get({
      url: `/Job/${id}`,
      caller: 'components/modals/jobcard/preview-job-card.js:getPopulatedJob()'
    });
    setJobCard(request);
  };

  const [isServiceMode, setIsServiceMode] = useState(false);

  const checkServiceMode = async () => {
    let temp = false;

    let optionValue = await Fetch.get({
      url: `/Option/GetByOptionName?name=Job Service`,
    });

    if (optionValue) {
      temp = (optionValue.toLowerCase() === 'true');
    }
    setIsServiceMode(temp);
  };

  useEffect(() => {
    checkServiceMode();
    getPopulatedJob();
  }, [id]);

  function employeeName(job) {
    if (job.Employees && job.Employees.length > 0) {
      let name = job.Employees[0].FirstName + " " + job.Employees[0].LastName;
      if (job.Employees.length > 1) {
        name = name + " + " + (job.Employees.length - 1);
      }
      return name;
    }
    return 'Unassigned';
  }

  function employeeInitials(job) {
    if (job.Employees && job.Employees.length > 0) {
      const initials = job.Employees[0].FirstName[0] + job.Employees[0].LastName[0];
      return initials;
    }
    return 'N/A';
  }

  const editJobClick = () => {
    Helper.nextRouter(Router.push, `/job/[id]`, `/job/${jobCard.ID}`);
  };

  return (
    <div className="preview-overlay">
      <div className="preview-modal-container relative-position">
        {jobCard ?
          <>
            <div className="preview-close">
              <img src="/icons/x-circle-dark.svg" alt='close' title='Close' onClick={() => setShowJobCardPreview(false)} />
            </div>
            <div className="row">
              <h1>{jobCard.JobCardNumber}</h1>
            </div>

            <div className="overflow">

              <p>Customer</p>
              {jobCard.CustomerName}
              <p>Contact</p>
              {jobCard.CustomerContactFullName}

              {jobCard.LocationDescription
                ? <>
                  <p>Location</p>
                  {jobCard.LocationDescription}
                </>
                : ""
              }
              <p>Description of the job</p>
              <div className="description">{jobCard.Description}</div>

              <p>Items</p>
              <div className="items">
                {jobCard.InventoryDescription}
              </div>

              {isServiceMode ?
                <>
                  <p>Service</p>
                  {jobCard.InventoryDescription}
                </> :
                <>
                  <p>Job Type</p>
                  {jobCard.JobTypeName}
                </>
              }

              <p>Start Date</p>
              {time.formatDate(jobCard.StartDate)}
              {jobCard.LastComment ?
                <>
                  <p>Last Comment</p>
                  <div className="preview-comment">
                    {jobCard.LastComment.CommentText}
                  </div>
                </>
                : ''
              }

              <p>Assigned Employees</p>
              <div className="tech">
                {employeeName(jobCard)}
              </div>
              <div className={`initials ${jobCard.Employees && jobCard.Employees.length > 1 ? " initials-multiple" : ""}`}>
                {employeeInitials(jobCard)}
              </div>


              {showJobEdit ?
                <div className="row relative-position">
                  <div className="preview-edit" onClick={() => editJobClick()}>
                    <img src="/icons/edit.svg" alt="edit" onClick={null} />
                    Edit
                  </div>
                </div> : ''
              }
            </div>


          </>
          : ''
        }
      </div>

      <style jsx>{`
        .preview-overlay {
          align-items: left;
          display: flex;
          justify-content: left;
          position: fixed;
          right: calc(50% - 13rem);
          top: 0rem;
          z-index: 110;
        }
        .preview-modal-container {
          background-color: var(--white-color);
          border-radius: 0 0 var(--layout-card-radius) var(--layout-card-radius);
          padding: 1rem;
          width: 24rem;
          max-height: 80%;
          overflow-x: auto;
          // box-shadow: 0 0 10px rgba(0,0,0,0.04), 0 0 25px rgba(0,0,0,0.1);
          box-shadow: ${shadows.cardDark};
        }
        .preview-modal-container p {
          color: ${colors.blueGreyLight};
          font-size: 0.875rem;
          margin: 1rem 0 0.25rem 0
        }
        .preview-modal-container h1 {
          font-size: 1.25rem;
          font-weight: bold;
          margin: 0;
        }
        .row {
          display: flex;
          justify-content: space-between;
        }
        .column {
          display: flex;
          flex-direction: column;
          width: 100%;
          margin-left: 0.5rem;
        }
        .tech {
          text-align: left;
          display: inline-block;
        }
        .tech p {
          margin-top: 0;
        }
        .initials {
          align-items: center;
          color: ${colors.white};
          display: inline-flex;
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
        .info {
          color: ${colors.blueGrey};
          font-size: 0.75rem;
          margin-top: 0.25rem;
        }
        .preview-comment {
          white-space: wrap;
          text-overflow: ellipsis;
          width: calc(100% - 5rem);
        }
        .relative-position {
          position: relative;
        }
        .description {
          text-overflow: ellipsis;
          overflow: hidden;
          -webkit-line-clamp: 5;
          display: -webkit-box;
          -webkit-box-orient: vertical;
        }
        .items {
          overflow: hidden;
          text-overflow: ellipsis;
          -webkit-line-clamp: 5;
          display: -webkit-box;
          -webkit-box-orient: vertical;
        }
        .preview-edit {
          align-items: flex-end;
          bottom: 1rem;
          color: ${colors.bluePrimary};
          cursor: pointer;
          display: flex;
          font-size: 0.875rem;
          font-weight: bold;
          position: absolute;
          right: 1rem;
        }
        .preview-edit img {
          margin-right: 0.5rem;
        }
        .preview-close {
          align-items: flex-end;
          top: 0.5rem;
          cursor: pointer;
          display: flex;
          font-size: 0.875rem;
          font-weight: bold;
          position: absolute;
          right: 0.5rem;
        }
        .cancel {
          width: 6rem;
        }

        .overflow {
          overflow: auto;
          max-height: calc(100vh - 72px);
        }
      `}</style>
    </div>
  );
}

export default PreviewJobCard;
