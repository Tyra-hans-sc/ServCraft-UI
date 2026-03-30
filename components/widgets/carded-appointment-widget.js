import React, { useState, useEffect, useRef, useMemo } from 'react';
import Router from 'next/router';
import { colors, shadows, layout } from "../../theme";
import * as Enums from '../../utils/enums';
import Time from '../../utils/time';
import Helper from '../../utils/helper';
import AppointmentService from '../../services/appointment/appointment-service';
import PS from '../../services/permission/permission-service';
import ManageAppointment from '../modals/appointment/manage-appointment';

function CardedAppointmentWidget({storeID}) {

    const [customerPermission] = useState(PS.hasPermission(Enums.PermissionName.Customer));
    const [jobPermission] = useState(PS.hasPermission(Enums.PermissionName.Job));
    const [queryPermission] = useState(PS.hasPermission(Enums.PermissionName.Query));

    const [appointments, setAppointments] = useState([]);

    const searchAppointments = async () => {
        let results = await AppointmentService.getTodaysAppointments(storeID);
        setAppointments(results.data);
    };

    useEffect(() => {
        searchAppointments();
    }, [storeID]);

    const getParsedDate = (date) => {
        return Time.parseDate(date);
    };

    const getEmployeeDetails = (appointment) => {
        let {employeeName, employeeInitials} = AppointmentService.getAppointmentEmployeeDetails(appointment);
        if (!Helper.isNullOrWhitespace(employeeName)) {
            return (
                <>
                  <div>{employeeInitials}</div>
                  <p>{employeeName}</p>
                </>
              )
        } else {
            return (
                <>
                  <div>NA</div>
                  <p>Unassigned</p>
                </>
              )
        }
    };

    const moduleItemClick = (appointment) => {
        if (appointment.Module == Enums.Module.Customer && customerPermission) {
          Helper.nextRouter(Router.push, '/customer/[id]', '/customer/' + appointment.ItemID);
        } else if (appointment.Module == Enums.Module.JobCard && jobPermission) {
          Helper.nextRouter(Router.push, '/job/[id]', '/job/' + appointment.ItemID);
        } else if (appointment.Module == Enums.Module.Query && queryPermission) {
          Helper.nextRouter(Router.push, '/query/[id]', '/query/' + appointment.ItemID);
        } else if (appointment.Module == Enums.Module.Project && jobPermission) {
          Helper.nextRouter(Router.push, '/project/[id]', '/project/' + appointment.ItemID);
        }
    };

    const [showManageAppointment, setShowManageAppointment] = useState(false);
    const [appointmentToEdit, setAppointmentToEdit] = useState();

    const editAppointment = (appointment) => {
        // setAppointmentToEdit(appointment);
        // setShowManageAppointment(true);
    };

    const onAppointmentSave = (appointment) => {
        if (appointment) {
            searchAppointments();
        }
        setShowManageAppointment(false);
    };

    const Card = (appointment, index) => {        
        return <div key={index} className="card" onClick={() => editAppointment(appointment)}>
            <div className="time">
                {getParsedDate(appointment.StartDateTime).toDateString()}
            </div>
            <div className="time">
                {Time.getTimeFormatted(getParsedDate(appointment.StartDateTime), 'hh:mm') + " - " + Time.getTimeFormatted(getParsedDate(appointment.EndDateTime), 'hh:mm')}
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
                : ''
            }
            <div className="employee">
                {getEmployeeDetails(appointment)}
            </div>

            <div className="module" title={`Open ${Enums.getEnumStringValue(Enums.Module, appointment.Module, true)}`} 
                onClick={() => moduleItemClick(appointment)}>
                {appointment.ItemNumber}
            </div>

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
                    width: 44%;
                    max-width: 340px;
                    justify-content: space-between;
                    margin: 0 0 0.5rem 0;
                    opacity: 1;
                    padding: 1rem;
                    position: relative;
                    transition: opacity 0.3s ease-in-out;
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
                    -webkit-line-clamp: 3;
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
    };

    return (
        <div className="card-container">

            {appointments && appointments.map((appointment, index) => {
                return (
                    Card(appointment, index)
                )
            })}

        {showManageAppointment ?
            <ManageAppointment isNew={false} appointment={appointmentToEdit} onSavedAppointment={onAppointmentSave} />
            : ''
        }

            <style jsx>{`
                .card-container {
                    display: flex;
                    flex-direction: row;
                    flex-wrap: wrap;
                }
            `}</style>
        </div>
    );
}

export default CardedAppointmentWidget;
