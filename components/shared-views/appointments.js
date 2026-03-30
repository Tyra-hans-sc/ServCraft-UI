import React, {useState, useEffect} from 'react';
import { colors } from '../../theme';
import CarouselAppointments from '../carousel-appointments';
import ManageAppointment from '../modals/appointment/manage-appointment';
import NoSSR from '../../utils/no-ssr';
import * as Enums from '../../utils/enums';
import Helper from '../../utils/helper';
import Time from '../../utils/time';
import AppointmentService from '../../services/appointment/appointment-service';
import {Button, Flex} from "@mantine/core";
import {IconCirclePlus} from "@tabler/icons-react";

function Appointments({topMargin = true, module, moduleID, customerID, onRefresh, accessStatus, selectedEmployees, selectedStore, refreshAfterUpdates = false}) {


  const createAppointmentDisabled = accessStatus === Enums.AccessStatus.LockedWithAccess 
    || accessStatus === Enums.AccessStatus.LockedWithOutAccess
    || Helper.isNullOrUndefined(customerID);

  const [appointments, setAppointments] = useState([]);

  const getAppointments = async () => {

    let appointmentResults = {};
    switch(module) {
      case Enums.Module.Customer:
        appointmentResults = await AppointmentService.getCustomerAppointments(customerID);
        break;
      case Enums.Module.JobCard:
      case Enums.Module.Query:
        appointmentResults = await AppointmentService.getItemAppointments(moduleID);
        break;
      case Enums.Module.Project:
        appointmentResults = await AppointmentService.getProjectAppointments(moduleID);
        break;
    }
    setAppointments(appointmentResults.data);
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
          const end = Time.parseDate(appointment.EndDateTime);
          return end >= Date.now();
        })
      );
      setPastApps(
        appointments.filter((appointment) => {
            const end = Time.parseDate(appointment.EndDateTime);
            return end < Date.now();
          })
      );
    }
  }, [appointments]);

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
      let now = Time.now();
      let temp = Time.timeShift(now);

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
        if(refreshAfterUpdates) {
          getAppointments()
        } else {
          let temp = appointments.filter(x => x.ID != savedAppointment.ID);
          if (savedAppointment.IsActive) {
            setAppointments([...temp, savedAppointment]);
          } else {
            setAppointments([...temp]);
          }
        }
      }
      if (!!onRefresh) {
        onRefresh()
      }
    }
  }

  return (
    <div>
      {appointments.length > 0
        ? <>
            <Flex justify={'space-between'} align={'start'} wrap={'wrap-reverse'} mt={topMargin ? 25 : 0}>
              <div className="heading">
                Upcoming appointments
              </div>
              <Button
                  disabled={createAppointmentDisabled}
                  // variant={'outline'}
                  leftSection={<IconCirclePlus />}
                  onClick={() => manageAppointment(true, null)}
              >
                Create Appointment
              </Button>
            </Flex>
            <NoSSR>
              <CarouselAppointments appointments={upcomingApps} manageAppointment={manageAppointment} suppressModuleNav={true} />
            </NoSSR>
            <div className="heading">
              Past appointments
            </div>
            <div className="past">
              <NoSSR>
                <CarouselAppointments appointments={pastApps} manageAppointment={manageAppointment} suppressModuleNav={true} />
              </NoSSR>
            </div>
          </>
        : <>
            <Flex justify={'end'} mt={topMargin ? 25 : 0}>
              <Button
                  disabled={createAppointmentDisabled}
                  leftSection={<IconCirclePlus />}
                  onClick={() => manageAppointment(true, null)}
              >
                  Create Appointment
              </Button>
            </Flex>
            <Flex mih={'40vh'} align={'center'} direction={'column'} justify={'center'}>
              <img src="/appointments.svg" alt="Appointments" />
              <h3>No appointments</h3>
            </Flex>
          </>
      }

      { showManageAppointmentModal ?  
        <ManageAppointment isNew={isNewAppointment} appointment={appointmentToEdit} onSavedAppointment={onSavedAppointment}
          defaultStartDate={defaultStartDate} defaultStartDateTime={defaultStartDateTime} defaultEndDateTime={defaultEndDateTime} 
          module={module} moduleID={moduleID} customerID={customerID} employees={isNewAppointment ? selectedEmployees : []} store={selectedStore}
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
