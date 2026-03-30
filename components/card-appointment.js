import React, { useState, useEffect } from 'react';
import Router from 'next/router';
import Fetch from '../utils/Fetch';
import * as Enums from '../utils/enums';
import Time from '../utils/time';
import Helper from '../utils/helper';
import { colors, fontSizes, layout, fontFamily, shadows } from '../theme';

function CardAppointment({ appointment, moduleItemClick, faded, suppressModuleNav }) {

  const startDateTime = Time.parseDate(appointment.StartDateTime);
  const endDateTime = Time.parseDate(appointment.EndDateTime);

  function employeeName() {
    if (appointment.Employees && appointment.Employees.length > 0) {
      let employeeName = appointment.Employees[0].FullName;
      if (appointment.Employees.length > 1){
        employeeName = employeeName + " + " + (appointment.Employees.length - 1);
      }
      const employeeNames = appointment.Employees[0].FullName.split(' ');
      const employeeInitials = employeeNames[0][0] + employeeNames[1][0]
      return (
        <>
          <div>{employeeInitials}</div>
          <p>{employeeName}</p>
        </>
      )
    }
    else {
      return (
        <>
          <div>NA</div>
          <p>Unassigned</p>
        </>
      )
    }
  }

  const getCustomer = async () => {
    const customer = await Fetch.get({
      url: `/Customer/${appointment.ItemID}`,
    });
    if (customer) {
      setModuleItem(customer);
      setModuleIdentifier(customer.CustomerCode);
      setModule(Enums.Module.Customer);
    }
  };

  const getJobCard = async () => {
    const job = await Fetch.get({
      url: `/Job/${appointment.ItemID}`,
      caller: "components/card-appointment.js:getJobCard()"
    });
    if (job) {
      setModuleItem(job);
      setModuleIdentifier(job.JobCardNumber);
      setModule(Enums.Module.JobCard);
    }
  };

  const getQuery = async () => {
    const query = await Fetch.get({
      url: `/Query/${appointment.ItemID}`,
      caller: "components/card-appointment.js:getQuery()"
    });
    if (query) {
      setModuleItem(query);
      setModuleIdentifier(query.QueryCode);
      setModule(Enums.Module.Query);
    }
  };

  const getProject = async () => {
    const project = await Fetch.get({
      url: `/Project/${appointment.ItemID}`
    });
    if (project) {
      setModuleItem(project);
      setModuleIdentifier(project.ProjectNumber);
      setModule(Enums.Module.Project);
    }
  };

  const [moduleIdentifier, setModuleIdentifier] = useState('');
  const [moduleItem, setModuleItem] = useState();
  const [module, setModule] = useState();

  useEffect(() => {
    if (appointment.Module == Enums.Module.Customer) {
      getCustomer();
    } else if (appointment.Module == Enums.Module.JobCard) {
      getJobCard();
    } else if (appointment.Module == Enums.Module.Query) {
      getQuery();
    } else if (appointment.Module == Enums.Module.Project) {
      getProject();
    }
  }, [appointment]);

  return (
    <div className={"card " + (faded ? "card-faded" : "")}>
      <div className="time">
        {startDateTime.toDateString()}
      </div>
      <div className="time">
        {Time.getTimeFormatted(startDateTime, 'hh:mm') + " - " + Time.getTimeFormatted(endDateTime, 'hh:mm')}
      </div>
      <div className="appointment-title clamp-text">
        {appointment.Subject}
      </div>
      <div className="customer">
        {appointment.CustomerContactFullName}
      </div>
      { appointment.Location
        ? <div className="address clamp-text">
            {appointment.Location.LocationDisplay}
          </div>
        : ""
      }
      <div className="employee">
        {employeeName()}
      </div>
      {suppressModuleNav ?
        '' : 
        <div className="module" title={`Open ${Enums.getEnumStringValue(Enums.Module, module)}`} onClick={() => moduleItemClick(moduleItem, module)}>
          {moduleIdentifier}
        </div>
      }
      <style jsx>{`
        .card {
          background-color: ${colors.white};
          border-radius: ${layout.cardRadius};
          box-shadow: ${shadows.card};
          box-sizing: border-box;
          color: ${colors.darkSecondary};
          display: flex;
          flex-direction: column;
          flex-shrink: 0;
          min-width: 18rem;
          max-width: 22rem;
          height: 12rem;
          justify-content: space-between;
          margin: 0 0 0.5rem 0.5rem;
          opacity: 1;
          padding: 1rem;
          position: relative;
          transition: opacity 0.3s ease-in-out;    
          cursor: pointer;      
        }
        .time {
          font-size: 12px;
      }
      .appointment-title {
          color: ${colors.darkPrimary};
          font-size: 18px;
          font-weight: bold;
          line-height: 24px;
        }
        .clamp-text {
          overflow: hidden;
          text-overflow: ellipsis;
          -webkit-line-clamp: 1;
          display: -webkit-box;
          -webkit-box-orient: vertical;
        }
        .customer {
          line-height: 24px;
        }
        .address {
          color: ${colors.blueGrey};
          line-height: 24px;
        }
        .employee {
          align-items: center;
          display: flex;
        }
        .employee :global(div){
          align-items: center;
          background-color: ${colors.bluePrimary};
          border-radius: 12px;
          color: ${colors.white};
          display: flex;
          font-size: 12px;
          font-weight: bold;
          height: 24px;
          justify-content: center;
          margin-right: 4px;
          width: 24px;
        }
        .employee :global(p){
          color: ${colors.bluePrimary};
          font-size: 12px;
          margin: 0;
        }
        .module {
          font-size: 12px;
          font-weight: bold;
          position: absolute;
          right: 1rem;
          top: 1rem;
          color: ${colors.bluePrimary};
          cursor: pointer;
        }
      `}</style>
    </div>
  )
}

export default CardAppointment;
