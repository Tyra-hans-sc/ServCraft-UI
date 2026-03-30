import React, { useState, useEffect  } from 'react';
import Router from 'next/router';
import { colors, fontSizes, layout, fontFamily, shadows } from '../theme';
import CardAppointment from '../components/card-appointment';
import useWindowSize from "../hooks/useWindowSize";
import * as Enums from '../utils/enums';
import Storage from '../utils/storage';
import Helper from '../utils/helper';
import PS from '../services/permission/permission-service';
import Time from '../utils/time';

function CarouselAppointments(props) {
  const isClient = typeof window === 'object';
  const windowSize = useWindowSize();

  const [customerPermission] = useState(PS.hasPermission(Enums.PermissionName.Customer));
  const [jobPermission] = useState(PS.hasPermission(Enums.PermissionName.Job));
  const [queryPermission] = useState(PS.hasPermission(Enums.PermissionName.Query));

  const [allowedCards, setAllowedCards] = useState(4);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [appointmentsCount, setAppointmentsCount] = useState(props.appointments.length);

  const carouselRight = () => {
    if (carouselIndex < (appointmentsCount - allowedCards)) {
      setCarouselIndex(carouselIndex+1)
    }
  };

  const carouselLeft = () => {
    if (carouselIndex > 0) {
      setCarouselIndex(carouselIndex - 1);
    }
  };

  let carouselShift = carouselIndex * -338;

  if (isClient) {
    let newCarouselSize = windowSize.width - 96 - 72;
    if (Storage.getCookie(Enums.Cookie.servSidebarState) == "expanded") {
      newCarouselSize = windowSize.width - 96 - 200; 
    }

    const newAllowed = Math.floor(newCarouselSize / 320);
    if (newAllowed != allowedCards) {
      setAllowedCards(newAllowed);
    }

    const maxShift = newCarouselSize - ((appointmentsCount * 322) + ((appointmentsCount - 1) * 16))
    if (carouselShift < maxShift && appointmentsCount > allowedCards) {
      carouselShift = maxShift;
    }
  }

  carouselShift = carouselShift + 'px';

  let clickSuppression = false;

  const manageAppointment = (isNew, appointment) => {
    if (!clickSuppression) {
      props.manageAppointment(isNew, appointment);
    }
  };

  const moduleItemClick = (moduleItem, module) => {
    clickSuppression = true;
    if (module == Enums.Module.Customer && customerPermission) {
      Helper.nextRouter(Router.push, '/customer/[id]', '/customer/' + moduleItem.ID);
    } else if (module == Enums.Module.JobCard && jobPermission) {
      Helper.nextRouter(Router.push, '/job/[id]', '/job/' + moduleItem.ID);
    } else if (module == Enums.Module.Query && queryPermission) {
      Helper.nextRouter(Router.push, '/query/[id]', '/query/' + moduleItem.ID);
    } else if (module == Enums.Module.Project && jobPermission) {
      Helper.nextRouter(Router.push, '/project/[id]', '/project/' + moduleItem.ID);
    }
  };

  const sortAppointments = (a, b) => {
    let aStart = Time.parseDate(a.StartDateTime).valueOf();
    let bStart = Time.parseDate(b.StartDateTime).valueOf();
    let aEnd = Time.parseDate(a.EndDateTime).valueOf();
    let bEnd = Time.parseDate(b.EndDateTime).valueOf();

    return aStart < bStart ? -1 :
    aStart === bStart && aEnd <= bEnd ? -1 :
    aStart === bStart && aEnd > bEnd ? 1 :
    aStart > bStart ? 1 : 0;
  }

  return (
    <div className="carousel">
      <div className="container">
        {props.appointments.length > 0 ?
          props.appointments.sort(sortAppointments).map(function(appointment, index) {
            return (
              <div key={index} onClick={() => manageAppointment(false, appointment)}>
                <CardAppointment appointment={appointment} moduleItemClick={props.suppressModuleNav ? {} : moduleItemClick} suppressModuleNav={props.suppressModuleNav} />
              </div>
            )
          })
          : <div className="empty-card">No appointments</div>
        }
      </div>
      <style jsx>{`
        .carousel {
          display: flex;
          position: relative;
        }
        .container {
          display: flex;
          flex-direction: row;
          flex-wrap: wrap;
        }
        .button {
          cursor: pointer;
          height: 24px;
          position: absolute;
          top: calc(50% - 12px);
          width: 24px;
        }
        .button-left {
          left: -2.25rem;
          z-index: 1;
        }
        .button-right {
          right: -2.25rem;
          z-index: 1;
        }
        .empty-card {
          align-items: center;
          background-color: ${colors.white};
          border-radius: ${layout.cardRadius};
          box-shadow: ${shadows.card};
          box-sizing: border-box;
          color: ${colors.darkSecondary};
          display: flex;
          flex-direction: column;
          flex-shrink: 0;
          font-weight: bold;
          width: auto;
          min-width: 18rem;
          height: 10rem;
          padding: 1rem;
          margin: 0 0 0.5rem 0.5rem;
          justify-content: center;
        }
      `}</style>
    </div>
  )
}

export default CarouselAppointments
