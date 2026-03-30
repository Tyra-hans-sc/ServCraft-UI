import React, { useEffect, useState, useContext } from 'react';
import { colors, fontSizes, layout, fontFamily, shadows } from '../theme';
import time from '../utils/time';
import Router from 'next/router';
import * as Enums from '../utils/enums';
import Helper from '../utils/helper';
import Time from '../utils/time';

function TimerFlagged({ timer }) {

  const [hover, setHover] = useState(false);

  function goToJobCard() {
    Helper.nextRouter(Router.push, '/job/' + timer.JobCardID + '?tab=timers');
  }

  const timerLine = `${timer.JobCardNumber} - ${timer.EmployeeFullName ? timer.EmployeeFullName : timer.CreatedBy}`;
  const initials = Helper.getInitials(timer.EmployeeFullName ? timer.EmployeeFullName : timer.CreatedBy);

  const [duration, setDuration] = useState(calcDuration(timer.StartTime, timer.EndTime));

  function getStoreNow() {
    return Time.now();
  }

  useEffect(() => {
    let interval = setInterval(() => {
      setDuration(calcDuration(timer.StartTime, timer.EndTime));
    }, 1000);

    return () => {
      clearInterval(interval);
    }
  }, []);

  function calcDuration(start, end) {

    const startDate = Time.parseDate(start);
    const endDate = end ? Time.parseDate(end) : getStoreNow();
    let diffSeconds = Math.abs(endDate - startDate) / 1000;
    const hours = Math.floor(diffSeconds / 3600);
    diffSeconds -= hours * 3600;
    const minutes = Math.floor(diffSeconds / 60) % 60;
    diffSeconds -= minutes * 60;
    const seconds = Math.ceil(diffSeconds % 60);

    return (hours < 10 ? '0' + hours : hours) + ':' + (minutes < 10 ? '0' + minutes : minutes) + ':' + (seconds < 10 ? '0' + seconds : seconds);
  }

  return (
    <div className="timer" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      <div className={"overlay " + (hover ? "overlay-visible" : "")}>
        <div className="overlay-button" onClick={goToJobCard}>
          <img src="/icons/eye.svg" alt="arrow" />
          View
        </div>
      </div>
      <div className="row">
        <div className="initials-container">
          <div className="initials">
            {initials}
          </div>
        </div>
        <div className="job">
          {timerLine}
        </div>
        <div className="time">
          {time.toISOString(timer.StartTime, false, true, true)}
        </div>
      </div>
      <div className="text">
        <span className="coral">
          {duration}
        </span>
      </div>
      <style jsx>{`

      .coral {
        background: #f080805e;
        border: 2px solid lightcoral;
        padding: 12px;
        border-radius: 3px;
        width: fit-content;
        line-height: 44px;
      }

        .initials-container {
          align-items: center;
          display: flex;
          flex-direction: column;
        }
        .initials-container :global(.initials) {
          align-items: center;
          color: ${colors.white};
          display: flex;
          flex-shrink: 0;
          font-size: 0.875rem;
          height: 2.4rem;
          justify-content: center;
          margin-right: 0.5rem;
          position: relative;
          width: 2.4rem;
          z-index: 2;
        }
        .initials-container :global(.initials:after) {
          background-color: ${colors.bluePrimary};
          border: 2px solid ${colors.white};
          border-radius: 1.25rem;
          box-sizing: border-box;
          content: '';
          height: 2.4rem;
          position: absolute;
          right: 0;
          top: 0;
          width: 2.4rem;
          z-index: -1;
        }

        .timer {
          background-color: ${colors.white};
          border-radius: ${layout.cardRadius};
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          font-size: 14px;
          justify-content: center;
          margin-top: 0.5rem;
          padding: 0.5rem 0.75rem;
          position: relative;
          width: 100%;
        }
        .timer:nth-child(2n) {
          background-color: ${colors.backgroundGrey};
        }
        .row {
          align-items: center;
          display: flex;
          margin-bottom: 4px;
        }
        .job {
          color: ${colors.darkPrimary};
          font-weight: bold;
        }
        .name {
          color: ${colors.darkPrimary};
          font-weight: bold;
        }
        .time {
          color: ${colors.blueGrey};
          font-size: 12px;
          margin-left: 1rem;
        }
        .overlay {
          align-items: center;
          background: linear-gradient(270deg, #003ED0 0%, #003ED0 0.01%, rgba(174, 176, 178, 0) 76.04%);
          border-radius: ${layout.cardRadius};
          display: flex;
          height: 5rem;
          justify-content: flex-end;
          opacity: 0;
          position: absolute;
          right: 0;
          top: 0;
          transition: opacity 0.1s ease-out;
          width: 100%;
        }
        .overlay-visible {
          opacity: 1;
        }
        .overlay-button {
          align-items: center;
          background-color: ${colors.white};
          border-radius: ${layout.cardRadius};
          color: ${colors.darkPrimary};
          cursor: pointer;
          display: flex;
          font-size: 12px;
          margin-right: 0.5rem;
          padding: 0.5rem;
        }
        .overlay-button img {
          margin-right: 0.5rem;
        }
        .text {
          white-space: nowrap;
          text-overflow: ellipsis;
          width: calc(100% - 2.4rem);
          overflow: hidden;
          margin-left: 3rem;
          height: 48px;
        }
      `}</style>
    </div>
  )
}

export default TimerFlagged;
