import React, {useState, useEffect, useContext} from 'react';
import { colors, fontSizes, layout, fontFamily } from '../../theme';
import CarouselAppointments from '../carousel-appointments';
import ManageAppointment from '../modals/appointment/manage-appointment';
import Button from '../button';
import NoSSR from '../../utils/no-ssr';
import * as Enums from '../../utils/enums';
import Helper from '../../utils/helper';
import Time from '../../utils/time';
import AppointmentService from '../../services/appointment/appointment-service';

function Appointments({module, moduleID, customerID, accessStatus}) {

  const createAppointmentDisabled = accessStatus === Enums.AccessStatus.LockedWithAccess 
    || accessStatus === Enums.AccessStatus.LockedWithOutAccess
    || Helper.isNullOrUndefined(customerID);

  const [appointments, setAppointments] = useState([]);

  const getAppointments = async () => {
    setAppointments(await AppointmentService.getCustomerAppointments(customerID));
  };

  useEffect(() => {
    getAppointments();
  }, []);

  const [upcomingApps, setUpcomingApps] = useState([]);
  const [pastApps, setPastApps] = useState([]);

  useEffect(() => {
    if (appointments.length > 0) {
      setUpcomingApps(
        appointments.filter((appointment) => {
          const start = Time.parseDate(appointment.StartDateTime);
          return start > Date.now();
        })
      );
      setPastApps(
        appointments.filter((appointment) => {
            const start = Time.parseDate(appointment.StartDateTime);
            return start < Date.now();
          })
      );
    }
  }, [appointments.length]);

  const [showManageAppointmentModal, setShowManageAppointmentModal] = useState(false);
  const [isNewAppointment, setIsNewAppointment] = useState(true);
  const [appointmentToEdit, setAppointmentToEdit] = useState(null);
  const [defaultStartDate, setDefaultStartDate] = useState();
  const [defaultStartDateTime, setDefaultStartDateTime] = useState();
  const [defaultEndDateTime, setDefaultEndDateTime] = useState();

  const toggleManageAppointmentModal = (appointment, defaultDate) => {    
    setAppointmentToEdit(appointment);
    setIsNewAppointment(appointment === null);
    if (appointment) {

    } else {
      setDefaultStartDate(defaultDate);
      setDefaultStartDateTime(defaultDate);

      let date2 = Time.parseDate(defaultDate);
      date2.setHours(date2.getHours() + 1);
      setDefaultEndDateTime(date2);
    }

    setShowManageAppointmentModal(!showManageAppointmentModal);
  };

  const manageAppointment = (isNew, appointment) => {
    if (isNew) {
      let temp = Time.now();
      toggleManageAppointmentModal(null, temp);
    } else {
      toggleManageAppointmentModal(appointment, null);
    }
  };

  function onSavedAppointment(savedAppointment) {
    setShowManageAppointmentModal(false);
    setAppointmentToEdit(null);

    if (savedAppointment) {
      if (isNewAppointment) {
        setAppointments([...appointments, savedAppointment]);
      } else {
        let temp = appointments.filter(x => x.ID != savedAppointment.ID);
        if (savedAppointment.IsActive) {
          setAppointments([...temp, savedAppointment]);
        } else {
          setAppointments([...temp]);
        }
      }
    }
  }

  return (
    <div className="container">
      {appointments.length > 0
        ? <>
            <div className="row space-between">
              <div className="heading">
                Upcoming appointments
              </div>
              <Button disabled={createAppointmentDisabled}
                text="Create Appointment" icon="plus-circle" extraClasses="fit-content no-margin" onClick={() => manageAppointment(true, null)} />
            </div>
            <NoSSR>
              <CarouselAppointments appointments={upcomingApps} manageAppointment={manageAppointment} />
            </NoSSR>
            <div className="heading">
              Past appointments
            </div>
            <div className="past">
              <NoSSR>
                <CarouselAppointments appointments={pastApps} manageAppointment={manageAppointment} />
              </NoSSR>
            </div>
          </>
        : <>
            <div className="row space-between">
              <div className="heading">
              </div>
              <Button disabled={createAppointmentDisabled} text="Create Appointment" icon="plus-circle" extraClasses="fit-content no-margin" 
                onClick={() => manageAppointment(true, null)} />
            </div>
            <div className="empty">
              <img src="/appointments.svg" alt="Appointments" />
              <h3>No appointments</h3>
            </div>
          </>
      }

      { showManageAppointmentModal ?  
        <ManageAppointment isNew={isNewAppointment} appointment={appointmentToEdit} onSavedAppointment={onSavedAppointment}
          defaultStartDate={defaultStartDate} defaultStartDateTime={defaultStartDateTime} defaultEndDateTime={defaultEndDateTime} 
          module={module} moduleID={moduleID} customerID={customerID}
         />
        : ''
      }

      <style jsx>{`
        .container {
          display: flex;
          flex-direction: column;
          height: 100%;
          margin-top: 2.5rem;
          position: relative;
        }
        .row {
          display: flex;
        }
        .space-between {
          align-items: center;
          justify-content: space-between;
        }
        .heading {
          color: ${colors.blueGrey};
          font-weight: bold;
          margin: 1.5rem 0 1.5rem;
        }
        .past :global(div) {
          color: ${colors.blueGrey};
        }
        .past :global(.card) {
          opacity: 0.6;
        }
        .past :global(.technician) :global(div) {
          background-color: ${colors.blueGrey};
          color: ${colors.white};
        }
        .past :global(.technician) :global(p) {
          color: ${colors.blueGrey};
        }
        .empty {
          align-items: center;
          display: flex;
          flex-direction: column;
          flex-grow: 1;
          justify-content: center;
        }
        .empty img {
          margin-top: -3rem;
        }
      `}</style>
    </div>
  )
}

export default Appointments;
