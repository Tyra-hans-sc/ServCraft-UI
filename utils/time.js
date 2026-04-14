import Fetch from './Fetch';
import * as Enums from './enums';
import moment from 'moment';

const monthNames = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];
const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function formatDate(closeDate) {

  if (closeDate) {
    const date = parseDate(closeDate);
    var monthNames = [
      "Jan", "Feb", "Mar",
      "Apr", "May", "Jun", "Jul",
      "Aug", "Sep", "Oct",
      "Nov", "Dec"
    ];

    var day = date.getDate();
    var monthIndex = date.getMonth();
    var year = date.getFullYear();

    return day + ' ' + monthNames[monthIndex] + ' ' + year;
  } else {
    return '';
  }
}

const addDays = (days, date) => {
  const result = parseDate(date);
  result.setDate(result.getDate() + days);
  return result;
};

const addSeconds = (seconds, date) => {
  const result = parseDate(date);
  result.setSeconds(result.getSeconds() + seconds);
  return result;
};

const getDaysInMonth = (month, year) => {
  return new Date(year, month, 0).getDate();
};

const isLeapYear = (year) => {
  return year % 400 === 0 || (year % 100 !== 0 && year % 4 === 0);
};

const getDaysInYear = (year) => {
  return isLeapYear ? 366 : 365;
};

function timeFrom(closeDate, context) {
  const closedDate = parseDate(closeDate);
  const now = privateNow(context);
  const diffTime = Math.abs(now - closedDate);
  const diffMins = Math.ceil(diffTime / (1000 * 60));
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const daysInMonth = getDaysInMonth(closedDate.getMonth() + 1, closedDate.getFullYear());
  const daysInYear = getDaysInYear(closedDate.getFullYear());

  if (diffMins < 60) {
    return diffMins + " minute" + (diffMins == 1 ? "" : "s") + " ago"
  } else if (diffMins < 3600) {
    const diffHours = Math.floor(diffMins / 60)
    return diffHours + " hour" + (diffHours == 1 ? "" : "s") + " ago"
  } else if (diffDays < 7) {
    return diffDays + " day" + (diffDays == 1 ? "" : "s") + " ago"
  } else if (diffDays / 7 < 4) {
    const diffWeeks = Math.floor(diffDays / 7)
    return diffWeeks + " week" + (diffWeeks == 1 ? "" : "s") + " ago"
  } else if (diffDays / daysInMonth < 12) {
    const diffMonths = Math.floor(diffDays / daysInMonth)
    return diffMonths + " month" + (diffMonths == 1 ? "" : "s") + " ago"
  } else {
    const diffYears = Math.floor(diffDays / daysInYear)
    return diffYears + " year" + (diffYears == 1 ? "" : "s") + " ago"
  }
}

function dayOfWeek(date) {
  let dt = parseDate(date);
  return dayNames[dt.getDay()];
}

function today(refDate = null) {
  let dateRef = refDate ? parseDate(refDate) : privateNow();
  const date = dateRef;
  let day = date.getDate().toString();
  day = day.length < 2 ? "0" + day : day;
  let month = (date.getMonth() + 1).toString();
  month = month.length < 2 ? "0" + month : month;
  let year = date.getFullYear().toString();
  return `${year}-${month}-${day}T00:00:00`;
}

function updateDate(oldDateTime, newDateTime) {
  let oldDate = parseDate(oldDateTime);
  let newDate = parseDate(newDateTime);
  oldDate.setDate(newDate.getDate());
  oldDate.setMonth(newDate.getMonth());
  oldDate.setFullYear(newDate.getFullYear());
  return oldDate;
}

function updateTime(oldDateTime, newDateTime) {
  let oldDate = parseDate(oldDateTime);
  let newDate = parseDate(newDateTime);
  oldDate.setHours(newDate.getHours());
  oldDate.setMinutes(newDate.getMinutes());
  oldDate.setSeconds(newDate.getSeconds());
  return oldDate;
}

function toISOString(dateTime, showT = true, showTime = true, showSeconds = true, separator = "-", showDate = true) {
  let date = parseDate(dateTime);
  let day = date.getDate().toString();
  day = day.length < 2 ? "0" + day : day;
  let month = (date.getMonth() + 1).toString();
  month = month.length < 2 ? "0" + month : month;
  let year = date.getFullYear().toString();
  let hour = date.getHours().toString();
  hour = hour.length < 2 ? "0" + hour : hour;
  let minutes = date.getMinutes().toString();
  minutes = minutes.length < 2 ? "0" + minutes : minutes;
  let seconds = date.getSeconds().toString();
  seconds = seconds.length < 2 ? "0" + seconds : seconds;
  return `${showDate ? `${year}${separator}${month}${separator}${day}` : ""}${(showTime ? `${showT ? "T" : " "}${hour}:${minutes}${showSeconds ? `:${seconds}` : ""}` : "")}`;
}

function getTimeDifference(startDateTime, endDateTime) {
  let start = parseDate(startDateTime);
  let end = parseDate(endDateTime);
  return (end.valueOf() - start.valueOf());
}

function getDaysDifference(startDateTime, endDateTime) {
  const date1 = parseDate(startDateTime);
  const date2 = parseDate(endDateTime);
  const diffTime = date2 - date1;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}

function getTime(dateTime) {
  let date = parseDate(dateTime);

  let hour = date.getHours().toString();
  hour = hour.length < 2 ? "0" + hour : hour;
  let minutes = date.getMinutes().toString();
  minutes = minutes.length < 2 ? "0" + minutes : minutes;
  let seconds = date.getSeconds().toString();
  seconds = seconds.length < 2 ? "0" + seconds : seconds;
  return `${hour}:${minutes}:${seconds}`;
}

function getTimeFormatted(dateTime, format) {
  let date = parseDate(dateTime);
  let hour, minutes, seconds;

  hour = date.getHours().toString();
  hour = hour.length < 2 ? "0" + hour : hour;
  minutes = date.getMinutes().toString();
  minutes = minutes.length < 2 ? "0" + minutes : minutes;

  if (format === 'hh:mm') {
    return `${hour}:${minutes}`;
  } else if (format === 'hh:mm:ss') {
    seconds = date.getSeconds().toString();
    seconds = seconds.length < 2 ? "0" + seconds : seconds;
    return `${hour}:${minutes}:${seconds}`;
  }
}

function getDateFormatted(dateTime, format) {
  let date = parseDate(dateTime);
  let day = date.getDate().toString();
  day = day.length < 2 ? "0" + day : day;
  let month = (date.getMonth() + 1).toString();
  month = month.length < 2 ? "0" + month : month;
  let year = date.getFullYear().toString();

  if (format == 'yyyy-MM-dd') {
    return `${year}-${month}-${day}`;
  }
}

function getDate(dateTime, separator = '-') {
  let date = parseDate(dateTime);

  let day = date.getDate().toString();
  day = day.length < 2 ? "0" + day : day;
  let month = (date.getMonth() + 1).toString();
  month = month.length < 2 ? "0" + month : month;
  let year = date.getFullYear().toString();

  return `${year}${separator}${month}${separator}${day}`;
}

function getDateWithTimezoneOffset(dateTime) {
  let date = parseDate(dateTime);
  let offset = date.getTimezoneOffset();

  date.setHours(date.getHours() + (offset / 60));

  return date;
}

function greaterThan(checkDate, refDate) {
  let check = parseDate(checkDate);
  let ref = parseDate(refDate);
  return check.valueOf() - ref.valueOf() > 0;
}

function lessThan(checkDate, refDate) {
  let check = parseDate(checkDate);
  let ref = parseDate(refDate);
  return check.valueOf() - ref.valueOf() < 0;
}

function equalTo(checkDate, refDate) {
  let check = parseDate(checkDate);
  let ref = parseDate(refDate);
  return check.valueOf() - ref.valueOf() === 0;
}

function parseDate(dateTime) {
  let dt = dateTime;
  if (dt && typeof dt === "string" && dt.length > 0) {
    if (dt.trim().length === 10) {
      dt = `${dt}T00:00:00`;
    }
    dt = dt.replace(" ", "T");
  }
  return new Date(dt);
}

// debounce this call so it's only run once
let timeShiftDebounce = false;
const getTimeshiftMilliseconds = async (force = false) => {
  if (timeShiftDebounce) return;

  timeShiftDebounce = true;
  setTimeout(() => {
    timeShiftDebounce = false;
  }, 1_000);

  let timeshiftMilliseconds = getTimeshiftMillisecondsLS();
  if (timeshiftMilliseconds !== null && !force) {
    return timeshiftMilliseconds;
  }

  let storeNow = await Fetch.get({ url: "/Company/Now" });
  storeNow = parseDate(storeNow);
  const localNow = new Date();
  timeshiftMilliseconds = storeNow - localNow;

  setTimeshiftMillisecondsLS(timeshiftMilliseconds);

  return timeshiftMilliseconds;
};

const getTimeshiftMillisecondsLS = () => {
  if (typeof window !== "undefined") {
    let timeShiftMillisecondsLS = window.localStorage.getItem(Enums.LocalStorage.TimeShiftMilliseconds);

    if (!timeShiftMillisecondsLS) {
      return null;
    }

    let timeShiftMillisecondsLSParsed = JSON.parse(timeShiftMillisecondsLS);

    if (!timeShiftMillisecondsLSParsed) {
      return null;
    }

    let now = new Date().valueOf();
    let stamp = timeShiftMillisecondsLSParsed.stamp;

    if (now - stamp > 12 * 60 * 60 * 1000) {
      return null;
    }

    var timeShiftMilliseconds = parseInt(timeShiftMillisecondsLSParsed.ms);
    if (!isNaN(timeShiftMilliseconds)) {
      return timeShiftMilliseconds;
    }
  } else {
    console.error("getTimeshiftMillisecondsLS: window not defined");
  }
  return null;
}

const setTimeshiftMillisecondsLS = (timeshiftMilliseconds) => {
  if (typeof window !== "undefined") {
    // remove api call delay using hysteresis
    timeshiftMilliseconds = Math.round(timeshiftMilliseconds / 10_000) * 10_000;

    let timeShiftData = {
      ms: timeshiftMilliseconds,
      stamp: new Date().valueOf()
    };

    window.localStorage.setItem(Enums.LocalStorage.TimeShiftMilliseconds, JSON.stringify(timeShiftData));
  } else {
    console.error("setTimeshiftMillisecondsLS: window not defined");
  }
}

const privateNow = () => {
  return now();
}

const now = () => {
  let localNow = new Date();

  const timeShiftMilliseconds = getTimeshiftMillisecondsLS();

  if (timeShiftMilliseconds !== null) {
    localNow.setMilliseconds(localNow.getMilliseconds() + timeShiftMilliseconds);
  }

  return localNow;
}

const nowCZ = async (tenantID, customerID, api, ctx = null) => {
  const now = await Fetch.get({ ctx: ctx, url: "/CustomerZone/Now", tenantID: tenantID, customerID: customerID, apiUrlOverride: api });
  return parseDate(now);
}

function isValidDate(d) {
  return d instanceof Date && !isNaN(d);
}

function timeShift(dateTime) {
  let result = dateTime;
  let minuteInterval = 15;

  let minutes = dateTime.getMinutes();

  if (minutes > 0 && minutes % minuteInterval != 0) {
    // we have a candidate for a change
    if (minutes > 45) {
      result.setHours(result.getHours() + 1);
      result.setMinutes(0);
    } else {
      if (minutes > 0 && minutes < 15) {
        result.setMinutes(15);
      }
      else if (minutes > 15 && minutes < 30) {
        result.setMinutes(30);
      }
      else if (minutes > 30 && minutes < 45) {
        result.setMinutes(45);
      }
    }
  }

  return result;
}

//: Date | string | null
const formatDateMoment = (date) => {
    if (!date) return '';

    const momentDate = moment(date);
    const now = moment();

    const momentDateStart = moment(date).startOf('day');
    const nowStart = moment().startOf('day');

    const diffDays = nowStart.diff(momentDateStart, 'days');

    // Today
    if (diffDays === 0) {
        return `Today at ${momentDate.format('h:mm A')}`;
    }

    // Yesterday
    if (diffDays === 1) {
        return `Yesterday at ${momentDate.format('h:mm A')}`;
    }

    // tomorrow
    if (diffDays === -1) {
        return `Tomorrow at ${momentDate.format('h:mm A')}`;
    }

    // Older than current year
    return momentDate.format('D MMM, YYYY [at] h:mm A'); // e.g. "Jun 15, 2022 at 2:30 PM"
};

export default {
  timeFrom,
  formatDate,
  addDays,
  addSeconds,
  today,
  updateDate,
  updateTime,
  toISOString,
  getTimeDifference,
  getDaysDifference,
  getTime,
  getTimeFormatted,
  getDateFormatted,
  getDate,
  getDateWithTimezoneOffset,
  greaterThan,
  lessThan,
  equalTo,
  monthNames,
  dayNames,
  parseDate,
  dayOfWeek,
  isValidDate,
  now,
  nowCZ,
  getTimeshiftMilliseconds,
  timeShift,
  formatDateMoment
};
