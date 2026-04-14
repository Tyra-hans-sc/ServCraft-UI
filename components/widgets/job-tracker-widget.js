import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as Enums from '../../utils/enums';
import Fetch from '../../utils/Fetch';
import { colors, fontSizes, layout, fontFamily, shadows } from '../../theme';

function JobTrackerWidget({storeID, durationDays, setDurationDays}) {

    const [durationDaysLocal, setDurationDaysLocal] = useState(durationDays ?? Enums.DashboardDateRange.Last7Days);

    const [jobOpenCount, setJobOpenCount] = useState(0);
    const [jobClosedCount, setJobClosedCount] = useState(0);
    const [jobAverageDaysInStatus, setJobAverageDaysInStatus] = useState(0);
    const [jobAverageDaysOverall, setJobAverageDaysOverall] = useState(0);

    const [percentageCompleted, setPercentageCompleted] = useState(0);
    const [strokeOffset, setStrokeOffset] = useState(0);

    const pendingRequest = useRef();
    const requestStarted = useRef(false);

    const getJobStats = async () => {

        requestStarted.current = true;

        let request = await Fetch.get({
            url: `/Dashboard/GetJobStatusCounts?storeid=${storeID}&dateRange=${durationDaysLocal}`
        });

        requestStarted.current = false;

        let result = request.Results;

        if (result.length > 0) {
            let openCount = result.find(x => x.Key == 'JobOpenCount').Value;
            let closedCount = result.find(x => x.Key == 'JobClosedCount').Value;
            let avgDaysInStatus = result.find(x => x.Key == 'JobAverageDaysInStatus').Value;
            let avgDaysOverall = result.find(x => x.Key == 'JobAverageDaysOverall').Value;

            setJobOpenCount(openCount);
            setJobClosedCount(closedCount);
            setJobAverageDaysInStatus(avgDaysInStatus);
            setJobAverageDaysOverall(avgDaysOverall);

            if (closedCount != 0) {
                setPercentageCompleted(Math.round(closedCount / (openCount + closedCount) * 100));
            }
        }
    };

    useEffect(() => {
        getJobStats();
        setCurrentDurationText(getDurationText(durationDaysLocal));        
    }, [storeID, durationDaysLocal]);

    useEffect(() => {
        setDurationDays(durationDaysLocal);
    }, [durationDaysLocal]);

    useEffect(() => {
        setStrokeOffset(142 - (percentageCompleted * 142 / 100));
    }, [percentageCompleted]);

    const [showPopup, setShowPopup] = useState(false);    

    const getDurationText = (duration) => {
        switch (duration) {
            case Enums.DashboardDateRange.Last7Days:
                return "Last 7 Days";
            case Enums.DashboardDateRange.Last14Days:
                return "Last 14 Days";
            case Enums.DashboardDateRange.Last21Days:
                return "Last 21 Days";
            case Enums.DashboardDateRange.Last28Days:
                return "Last 28 Days";
            case Enums.DashboardDateRange.Last90Days:
                return "Last 90 Days";
            case Enums.DashboardDateRange.Last365Days:
                return "Last 365 Days";
            case Enums.DashboardDateRange.ThisMonth:
                return "This Month";
            case Enums.DashboardDateRange.ThisYear:
                return "This Year";
            case Enums.DashboardDateRange.AllTime:
                return "All Time";
        }    
    };

    const [currentDurationText, setCurrentDurationText] = useState(getDurationText(durationDaysLocal));

    return (
        <div className="card">
          <div className="progress">
            <svg viewBox="0 0 100 60">
              <g fillOpacity="0" strokeWidth="10">
                <path d="M5 50a45 45 0 1 1 90 0" stroke="#E6F3F6" strokeLinecap="round" />
                <path className="graph" d="M5 50a45 45 0 1 1 90 0" stroke={colors.bluePrimary} strokeDasharray="142" strokeDashoffset="142" strokeLinecap="round" />
              </g>
            </svg>
            <div className="percent">
              <h1>{percentageCompleted}%</h1>
              <p>Closed Jobs</p>
            </div>
          </div>
          <div className="stats">
            <div className="stat">
              <h2>Jobs</h2>
              <h1>{jobOpenCount + jobClosedCount}</h1>
            </div>
            <div className="stat">
              <p className="stat-1">Open: {jobOpenCount}</p>
              <p className="stat-1">Closed: {jobClosedCount}</p>
    
            </div>
            <div className="stat">
              <p className="stat-2">Avg In Status: {jobAverageDaysInStatus}</p>
              <p className="stat-2">Avg Overall: {jobAverageDaysOverall}</p>
            </div>
          </div>
          <div className="day-selector" onClick={() => setShowPopup(!showPopup)}>
            {currentDurationText}
            <img src="/icons/chevron-down-blue.svg" alt="arrow" className="icon" />
            {showPopup ?
              <div>
                <p onClick={() => setDurationDaysLocal(Enums.DashboardDateRange.Last7Days)}>
                  {getDurationText(Enums.DashboardDateRange.Last7Days)}
                </p>
                <p onClick={() => setDurationDaysLocal(Enums.DashboardDateRange.Last14Days)}>
                  {getDurationText(Enums.DashboardDateRange.Last14Days)}
                </p>
                <p onClick={() => setDurationDaysLocal(Enums.DashboardDateRange.Last21Days)}>
                  {getDurationText(Enums.DashboardDateRange.Last21Days)}
                </p>
                <p onClick={() => setDurationDaysLocal(Enums.DashboardDateRange.Last28Days)}>
                  {getDurationText(Enums.DashboardDateRange.Last28Days)}
                </p>
                <p onClick={() => setDurationDaysLocal(Enums.DashboardDateRange.Last90Days)}>
                  {getDurationText(Enums.DashboardDateRange.Last90Days)}
                </p>
                <p onClick={() => setDurationDaysLocal(Enums.DashboardDateRange.Last365Days)}>
                  {getDurationText(Enums.DashboardDateRange.Last365Days)}
                </p>
                <p onClick={() => setDurationDaysLocal(Enums.DashboardDateRange.ThisMonth)}>
                  {getDurationText(Enums.DashboardDateRange.ThisMonth)}
                </p>
                <p onClick={() => setDurationDaysLocal(Enums.DashboardDateRange.ThisYear)}>
                  {getDurationText(Enums.DashboardDateRange.ThisYear)}
                </p>
                <p onClick={() => setDurationDaysLocal(Enums.DashboardDateRange.AllTime)}>
                  {getDurationText(Enums.DashboardDateRange.AllTime)}
                </p>
              </div>
              : ''
            }
          </div>
          <style jsx>{`
            .card {
              background-color: ${colors.white};
              border-radius: ${layout.cardRadius};
              box-shadow: ${shadows.card};
              box-sizing: border-box;
              display: flex;
              height: 12.25rem;
              padding: 3rem 2rem 1rem;
              position: relative;
              width: 100%;
            }
            .progress {
              width: 220px;
            }
            .graph {
              stroke-dashoffset: ${strokeOffset};
            }
            .percent h1{
              font-size: 32px;
              font-weight: normal;
              margin: -87px 0 0;
              text-align: center;
            }
            .percent p{
              margin: 0;
              text-align: center;
            }
            .stats {
              display: flex;
              flex-direction: column;
              justify-content: flex-end;
              padding-bottom: 16px;
            }
            .stat {
              align-items: center;
              display: flex;
              margin-left: 24px;
            }
            .stat h2 {
              color: ${colors.blueGrey};
              font-size: 16px;
              font-weight: bold;
              margin: 0;
              width: 80px;
            }
            .stat h1 {
              font-size: 32px;
              margin: 0;
            }
            .stat-1 {
              width: 80px;
            }
            .stat-2 {
              width: 125px;
            }
            .day-selector {
              align-items: center;
              color: ${colors.bluePrimary};
              cursor: pointer;
              display: flex;
              font-size: 0.875rem;
              position: absolute;
              right: 1rem;
              top: 1rem;
            }
            .day-selector div {
              align-items: center;
              background-color: ${colors.white};
              border-radius: ${layout.cardRadius};
              box-shadow: 0px 0px 32px rgba(0, 0, 0, 0.16), 0px 4px 8px rgba(0, 0, 0, 0.16), inset 0px 0px 8px rgba(86, 204, 242, 0.08);
              display: flex;
              flex-direction: column;
              justify-content: center;
              left: 0rem;
              margin-left: 0px;
              padding: 0.25rem 0;
              position: absolute;
              top: 1.5rem;
              z-index: 100000;
            }
            .day-selector p {
              margin: 0;
              padding: 0.375rem 0.75rem;
              width: 6rem;
            }
          `}</style>
        </div>
    )
}

export default JobTrackerWidget;
