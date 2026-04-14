import React, { useEffect, useState, useContext, useRef } from 'react';
import Fetch from '../utils/Fetch';
import Time from '../utils/time';

const isTimerRunning = function (timers) {
    return getRunningTimers(timers).length > 0;
};

const getRunningTimers = function (timers) {
    let running = timers.filter((timer) => {
        return timer.EndTime === null || timer.EndTime === undefined;
    });

    return running;
};

const stopTimer = async (timers, employeeID) => {
    
    let applicableTimers = timers.filter(x => x.EndTime === null && x.EmployeeID === employeeID);
    if (applicableTimers.length === 0) {
        return;
    }

    let timer = applicableTimers[0];
    let now = Time.now();
    timer.EndTime = Time.toISOString(now);

    const result = await Fetch.put({
        url: "/JobTime",
        params: timer
    });

    //await updateTimers();
    //timerContext.updateRunningTimers();
};

export default {
    isTimerRunning,
    getRunningTimers,
    stopTimer,
};
