import React, { useState, useRef } from 'react';
import { colors, fontSizes, layout, fontFamily } from '../theme';
import TextInput from './text-input';
import useOutsideClick from "../hooks/useOutsideClick";
import time from '../utils/time';
import Router from 'next/router';
import Helper from '../utils/helper';

function RowPreview({item, type, setShowPreview}) {

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
  
  return (
    <div className="preview" onMouseEnter={() => setShowPreview(true)} onMouseLeave={() => setShowPreview(false)} onClick={(e) => e.stopPropagation()}>
      { type == "Job"
        ? <>
            <div className="row">
              <h1>{item.JobCardNumber}</h1>
              <div className="row">
                <div className="tech">
                  <p>Assigned Technician</p>
                  {employeeName(item)}
                </div>
                <div className={`initials ${item.Employees && item.Employees.length > 1 ? " initials-multiple" : ""}`}>
                  {employeeInitials(item)}
                </div>
              </div>
            </div>
            { item.LocationDescription 
              ? <>
                  <p>Location</p>
                  {item.LocationDescription}
                </>
              : ""
            }
            <p>Description of the job</p>
            {item.Description}
            <p>Service</p>
            {item.InventoryDescription}
            <p>Closed Date</p>
            {time.formatDate(item.ClosedDate)}
            {item.LastComment ? 
              <>
                <p>Last Comment</p>
                <div className="preview-comment">
                  {item.LastComment.CommentText}
                </div> 
              </>
              : ''
            }
            <div className="preview-edit" onClick={() => Helper.nextRouter(Router.push,'/job/[id]', '/job/'+item.ID)}>
              <img src="/icons/edit.svg" alt="edit" onClick={null}/>
              Edit
            </div>
          </>
        : type == "Customer" ? <>
            <div className="row">
              <h1>{item.CustomerName}</h1>
            </div>
            <div className="row info">
              {item.CustomerCode} | {item.IsCompany ? "Company" : "Individual"} 
            </div>
            { item.Contacts && item.Contacts.length > 0
              ? <>
                  <p>Contact Details</p>
                  {item.Contacts[0].MobileNumber}
                  <br/>
                  {item.Contacts[0].EmailAddress}
                </>
              : ""
            }
            { item.Locations && item.Locations.length > 0
              ? <>
                  <p>Location</p>
                  {item.Locations[0].LocationDisplay}
                </>
              : ""
            }
            <p>Created</p>
            {time.formatDate(item.CreatedDate)}
          </> :
        <></>
      }
      <style jsx>{`
        .preview {
          background-color: white;
          box-shadow: 0px 10px 16px rgba(0, 0, 0, 0.1), 0px 4px 6px rgba(0, 0, 0, 0.06);
          color: ${colors.darkPrimary};
          font-weight: normal;
          position: absolute;
          padding: 1.5rem;
          pointer-events: auto;
          right: 100%;
          top: 100%;
          width: 368px;
        }
        .preview p {
          color: ${colors.blueGreyLight};
          font-size: 0.875rem;
          margin: 1rem 0 0.25rem 0
        }
        .preview h1 {
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
        .info {
          color: ${colors.blueGrey};
          font-size: 0.75rem;
          margin-top: 0.25rem;
        }
        .preview-edit {
          align-items: flex-end;
          bottom: 1.5rem;
          color: ${colors.bluePrimary};
          cursor: pointer;
          display: flex;
          font-size: 0.875rem;
          font-weight: bold;
          position: absolute;
          right: 2rem;
        }
        .preview-edit img {
          margin-right: 0.5rem;
        }
        .preview-comment {
          white-space: wrap;
          text-overflow: ellipsis;
          width: calc(100% - 4rem);
        }
      `}</style>
    </div>
  )
}

export default RowPreview
