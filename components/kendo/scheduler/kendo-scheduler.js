import React, { useState, useEffect, useContext, useCallback, useRef } from 'react';
import {
  Scheduler,
  SchedulerHeader,
  DayView,
  WeekView,
  WorkWeekView,
  MonthView,
  DateHeaderCell,
} from "@progress/kendo-react-scheduler";
import { Day, ZonedDate } from "@progress/kendo-date-math";
import '@progress/kendo-date-math/tz/Africa/Johannesburg';
import NoSSR from '../../../utils/no-ssr';
import Time from '../../../utils/time';
import * as Enums from '../../../utils/enums';
import CustomForm from './custom-form';
import CustomEditItem from './custom-edit-item';
import CustomSchedulerSlot from './custom-scheduler-slot';
import CustomSchedulerItem from './custom-scheduler-item';
import CustomKendoSchedulerContext from '../../../utils/custom-kendo-scheduler-context';
import Fetch from '../../../utils/Fetch';
import ToastContext from '../../../utils/toast-context';
import CustomSchedulerItemMonth from './custom-scheduler-item-month';
import CustomSchedulerSlotMonth from './custom-scheduler-slot-month';
import Helper from '../../../utils/helper';
import ConfirmAction from '../../modals/confirm-action';

export default function KendoScheduler({ data, onDateRangeChange, selectedItemID, defaultView = Enums.SchedulerView.workweek,
  showHeader = true, group = null, readOnly = false, dontResize = false, accessStatus, slotDivisions = 2 }) {

  const toast = useContext(ToastContext);

  const [defaultDate, setDefaultDate] = useState(Time.now());
  const [refreshData, setRefreshData] = useState(0);
  const [dateRange, setDateRange] = useState([]);

  const workDayStart = useRef("08:00");
  const workDayEnd = useRef("17:00");
  const [confirmOptions, setConfirmOptions] = useState(Helper.initialiseConfirmOptions());

  const getInitialDates = () => {

    let today = Time.now();
    let startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    startDate.setHours(2, 0, 0, 0);
    dateUpdates(startDate);

    // let endDate = Time.parseDate(startDate);
    // endDate.setDate(endDate.getDate() + 1);
    // endDate.setMinutes(endDate.getMinutes() - 1);

    // setDateRange([Time.parseDate(startDate), Time.parseDate(endDate)]);
  };

  const dayUpdate = (date) => {
    let temp = new Date(date?._localDate ?? date);
    let startDate = new Date(temp.getFullYear(), temp.getMonth(), temp.getDate());

    let endDate = Time.parseDate(startDate);
    endDate.setDate(endDate.getDate() + 1);
    endDate.setMinutes(endDate.getMinutes() - 1);

    setDateRange([Time.parseDate(startDate), Time.parseDate(endDate)]);
  };

  const weekUpdate = (date) => {

    let temp = new Date(date?._localDate ?? date);

    let startDate = new Date(temp.getFullYear(), temp.getMonth(), temp.getDate());
    startDate.setDate(temp.getDate() - temp.getDay());

    let endDate = Time.parseDate(startDate);
    endDate.setDate(endDate.getDate() + 7);
    endDate.setMinutes(endDate.getMinutes() - 1);

    setDateRange([Time.toISOString(startDate), Time.toISOString(endDate)]);
  };

  const monthUpdate = (date) => {
    let temp = new Date(date?._localDate ?? date);

    // start date begins first of the month
    let startDateTemp = new Date(temp.getFullYear(), temp.getMonth(), 1);

    let startDate = Time.parseDate(startDateTemp);
    // week starts on a sunday
    while (startDate.getDay() !== 0) {
      startDate.setDate(startDate.getDate() - 1);
    }

    // end date begins last second of the month
    let endDate = Time.parseDate(startDateTemp);
    endDate.setMonth(endDate.getMonth() + 1);
    endDate.setSeconds(endDate.getSeconds() - 1);
    // week ends on saturday
    while (endDate.getDay() !== 6) {
      endDate.setDate(endDate.getDate() + 1);
    }

    setDateRange([Time.toISOString(startDate), Time.toISOString(endDate)]);
  };

  const workWeekUpdate = (date) => {
    let temp = new Date(date?._localDate ?? date);
    let startDate = new Date(temp.getFullYear(), temp.getMonth(), temp.getDate());
    startDate.setDate(temp.getDate() - temp.getDay() + 1);

    let endDate = Time.parseDate(startDate);
    endDate.setDate(endDate.getDate() + 5);
    endDate.setMinutes(endDate.getMinutes() - 1);

    setDateRange([Time.toISOString(startDate), Time.toISOString(endDate)]);
  };

  useEffect(() => {
    if (dateRange && dateRange.length == 2) {
      onDateRangeChange(dateRange[0], dateRange[1], schedulerView);
    }
  }, [dateRange, refreshData]);

  useEffect(() => {
    getInitialDates();
  }, []);

  const [schedulerView, setSchedulerView] = useState(defaultView);

  const dateUpdates = (date) => {

    if (schedulerView == Enums.SchedulerView.day) {
      dayUpdate(date);
    } else if (schedulerView == Enums.SchedulerView.week) {
      weekUpdate(date);
    } else if (schedulerView == Enums.SchedulerView.workweek) {
      workWeekUpdate(date);
    } else if (schedulerView == Enums.SchedulerView.month) {
      monthUpdate(date);
    }
  };

  const [schedulerDate, setSchedulerDate] = useState();

  const schedulerDataChange = useCallback((event) => {
  });

  const checkForClash = async (id, start, end, employeeIDs, event) => {
    return new Promise(async (resolve) => {

      if (!employeeIDs || employeeIDs.length === 0) {
        resolve(false);
        return;
      }

      let clashes = await Fetch.post({
        url: '/Appointment/GetScheduleClashes',
        params: {
          AppointmentID: id,
          EmployeeIDs: employeeIDs,
          StartDate: start,
          EndDate: end
        }
      });

      let clashAppointments = clashes.Results;
      let clashAppointmentEmployees = [];

      if (clashAppointments && clashAppointments.length > 0) {
        clashAppointments.forEach(app => {
          if (app.Employees) {
            app.Employees.forEach(emp => {
              if (clashAppointmentEmployees.findIndex(x => x.ID === emp.ID) < 0 && employeeIDs.findIndex(x => x === emp.ID) > -1) {
                clashAppointmentEmployees.push(emp);
              }
            });
          }
        });

        if (clashAppointmentEmployees.length > 0) {
          setConfirmOptions({
            ...Helper.initialiseConfirmOptions(),
            display: true,
            onCancel: () => {
              setRefreshData(refreshData + 1);
            },
            onConfirm: () => {
              onDataAction(event, true)
            },
            confirmButtonText: "Save Appointment",
            heading: "Schedule Clash Found",
            text: `The following employees have schedule clashes: ${clashAppointmentEmployees.map(x => x.FullName).join(", ")}.
            Confirm save appointment?`
          });
          resolve(true);
        } else {
          resolve(false);
        }
      } else {
        resolve(false);
      }
    });
  }

  const onDataAction = useCallback(async (event, forceValidation = false) => {
    const appItem = event.dataItem;
    const isTimeChange = event.type === 1;

    if (isTimeChange) {
      const id = appItem.id;
      const start = Time.toISOString(Time.parseDate(appItem.start));
      const end = Time.toISOString(Time.parseDate(appItem.end));
      const employeeIDs = appItem.employees ? appItem.employees.map(x => x.ID) : [];

      if (!forceValidation && (await checkForClash(id, start, end, employeeIDs, event))) {
        setRefreshData(refreshData + 1);
        return;
      }

      let appointment = await Fetch.get({
        url: "/Appointment",
        params: {
          id: id
        }
      });


      if (Time.parseDate(appointment.StartDateTime).valueOf() !== Time.parseDate(start).valueOf()
        || Time.parseDate(appointment.EndDateTime).valueOf() !== Time.parseDate(end).valueOf()) {
        appointment.StartDateTime = start;
        appointment.EndDateTime = end;

        // for immediate update of view
        let localDataTemp = [...localData];
        var idx = localDataTemp.findIndex(x => x.id === id);
        localDataTemp[idx].start = Time.parseDate(appItem.start);
        localDataTemp[idx].end = Time.parseDate(appItem.end);
        setLocalData(localDataTemp);
        //

        const saveResult = await Fetch.put({
          url: "/Appointment",
          params: {
            Appointment: appointment,
            EmployeeIDs: appointment.Employees && appointment.Employees.length > 0 ? appointment.Employees.map(x => x.ID) : null
          }
        });

        if (saveResult.ID) {
          toast.setToast({
            message: 'Appointment saved successfully',
            show: true,
            type: 'success'
          });
        } else {
          toast.setToast({
            message: 'Appointment not saved successfully',
            show: true,
            type: Enums.ToastType.error
          });
        }

        // reload view whether successful or not
        setRefreshData(refreshData + 1);
      }
    }
  });

  const schedulerDateChange = useCallback((event) => {
    let date = event.value;
    //dateUpdates(date, schedulerView);
    setSchedulerDate(date);

  },
    [setDefaultDate]
  );

  useEffect(() => {
    if (schedulerDate) {
      dateUpdates(schedulerDate);
    }
  }, [schedulerDate]);

  const hideIsAllDay = () => {
    document.getElementsByClassName("k-scheduler-times-all-day").forEach(x => x.parentElement.parentElement.style.display = "none");
  };

  const schedulerViewChange = useCallback((event) => {
    let view = event.value;
    setSchedulerView(view == 'day' ? Enums.SchedulerView.day : view == 'week'
      ? Enums.SchedulerView.week : view == 'work-week' ? Enums.SchedulerView.workweek : view == 'month' ? Enums.SchedulerView.month : "");
  },
    [setSchedulerView]
  );

  useEffect(() => {
    if (dateRange && dateRange.length > 0) {
      let date = dateRange[0];
      dateUpdates(date);
    }
  }, [schedulerView]);

  const [localData, setLocalData] = useState([]);

  const getLocationDisplay = (location) => {
    if (!location) return null;
    let locations = [];
    location.AddressLine1 && locations.push(location.AddressLine1);
    location.AddressLine2 && locations.push(location.AddressLine2);
    location.AddressLine3 && locations.push(location.AddressLine3);
    location.AddressLine4 && locations.push(location.AddressLine4);
    location.AddressLine5 && locations.push(location.AddressLine5);
    return locations.join(", ");
  }

  useEffect(() => {
    let initialMap = data.map((dataItem) => ({
      ID: dataItem.ID,
      OwnerID: 1,
      Title: dataItem.Subject,
      Description: dataItem.Description,
      StartTimezone: null,
      Start: dataItem.StartDateTime,
      End: dataItem.EndDateTime,
      EndTimezone: null,
      RecurrenceRule: null,
      RecurrenceID: null,
      RecurrenceException: null,
      isAllDay: false, // investigate making this a viable thing
      CustomerID: dataItem.CustomerID,
      CustomerName: dataItem.CustomerName,
      ContactName: dataItem.CustomerContactFullName,
      Employees: dataItem.Employees,
      ItemID: dataItem.ItemID,
      ItemNumber: dataItem.ItemNumber,
      LocationDisplay: dataItem.Location ? getLocationDisplay(dataItem.Location) : null
    }));

    let finalMap = initialMap.map((dataItem) => ({
      id: dataItem.ID,
      start: Time.parseDate(dataItem.Start),
      startTimezone: dataItem.startTimezone,
      end: Time.parseDate(dataItem.End),
      endTimezone: dataItem.endTimezone,
      isAllDay: dataItem.isAllDay,
      title: dataItem.Title,
      description: dataItem.Description,
      recurrenceRule: dataItem.RecurrenceRule,
      recurrenceId: dataItem.RecurrenceID,
      recurrenceExceptions: dataItem.RecurrenceException,
      ownerID: dataItem.OwnerID,
      customerID: dataItem.CustomerID,
      customerName: dataItem.CustomerName,
      employees: dataItem.Employees,
      itemID: dataItem.ItemID,
      highlighted: selectedItemID && dataItem.ItemID === selectedItemID,
      itemNumber: dataItem.ItemNumber,
      contactName: dataItem.ContactName,
      location: dataItem.LocationDisplay,
      accessStatus: accessStatus
    }));
    setLocalData(finalMap);
  }, [data, accessStatus]);

  useEffect(() => {

    let localDataTemp = [...localData];

    localDataTemp.forEach(ldt => {
      ldt.highlighted = false;
    });

    setLocalData(localDataTemp);

    if (selectedItemID) {
      Fetch.post({
        url: '/Appointment/GetAppointments',
        params: {
          ItemID: selectedItemID
        }
      }).then(appointmentsForItem => {

        let latestValueOf = 0,
          currentValueOf = Time.parseDate(Time.today()).valueOf(),
          useStart = null;

        appointmentsForItem.Results.forEach(app => {
          let use = false;
          let end = Time.parseDate(app.EndDateTime).valueOf();
          if (end < currentValueOf && end > latestValueOf) {
            use = true;
          } else if (end >= currentValueOf && (end < latestValueOf || latestValueOf === 0)) {
            use = true;
          }

          if (use) {
            latestValueOf = end;
            useStart = Time.parseDate(app.StartDateTime);
          }
        });

        if (useStart) {
          dateUpdates(useStart);
        }
      });
    }
  }, [selectedItemID]);

  const [localGroup, setLocalGroup] = useState(null);

  useEffect(() => {
    if (group) {
      let finalMap = {
        name: group.Name,
        data: group.Data,
        field: group.Field,
        valueField: group.ValueField,
        textField: group.TextField,
      };
      setLocalGroup(finalMap);
    }
  }, [group]);

  const getDateForScheduler = () => {

    let startUnparsed = dateRange.length === 2 ? dateRange[0] : new Date();
    let endUnparsed = dateRange.length === 2 ? dateRange[1] : Time.addDays(1, new Date());
    let start = Time.parseDate(startUnparsed);
    let end = Time.parseDate(endUnparsed);
    let midValueOf = (end.valueOf() + start.valueOf()) / 2;
    let midDate = new Date(midValueOf);
    return midDate;
  };

  const getDateRange = () => {

    let startUnparsed = dateRange.length === 2 ? dateRange[0] : new Date();
    let endUnparsed = dateRange.length === 2 ? dateRange[1] : Time.addDays(1, new Date());
    let start = Time.parseDate(startUnparsed);
    let end = Time.parseDate(endUnparsed);
    let zonedStart = ZonedDate.fromLocalDate(start, "Africa/Johannesburg");
    let zonedEnd = ZonedDate.fromLocalDate(end, "Africa/Johannesburg");
    return { start, zonedStart, end, zonedEnd };
  };

  const getHeight = () => {
    try {
      if (dontResize) return "100%";
      return window.innerHeight - 123;
    } catch (error) {
      return 0;
    }
  };

  return (
    <NoSSR>
      <CustomKendoSchedulerContext.Provider value={{
        refreshData: refreshData, setRefreshData: setRefreshData, selectedItemID: selectedItemID,
        workDayStart: workDayStart.current, workDayEnd: workDayEnd.current, readOnly: readOnly
      }}>
        <Scheduler
          // timezone="Africa/Johannesburg"
          data={localData} defaultDate={defaultDate}
          onDateChange={schedulerDateChange}
          onViewChange={schedulerViewChange}
          onDataChange={schedulerDataChange}
          form={CustomForm} editItem={CustomEditItem}
          header={(props) =>
            showHeader ? <SchedulerHeader {...props} /> : <React.Fragment />
          }
          editable={{
            edit: false,
            add: false,
            remove: false,
            drag: readOnly ? false : true,
            resize: readOnly ? false : true,
            select: false
          }}
          date={getDateForScheduler()}
          height={getHeight()}
          group={localGroup ? {
            resources: [localGroup.name]
          } : {}}
          resources={localGroup ? [localGroup] : null}
          defaultView={defaultView}
        >
          <DayView
            title="Day"
            numberOfDays={1}
            slotDuration={60}
            slot={CustomSchedulerSlot}
            item={CustomSchedulerItem}
            currentTimeMarker={true}
            onDataAction={onDataAction}
            defaultShowWorkHours={true}
            slotDivisions={slotDivisions}
            step={1}
            workDayStart={workDayStart.current}
            workDayEnd={workDayEnd.current}
            dateRange={getDateRange}
          />
          <WorkWeekView
            title="Work Week"
            slotDuration={60}
            workWeekStart={Day.Monday}
            workWeekEnd={Day.Friday}
            slot={CustomSchedulerSlot}
            item={CustomSchedulerItem}
            slotDivisions={slotDivisions}
            currentTimeMarker={true}
            onDataAction={onDataAction}
            defaultShowWorkHours={true}
            workDayStart={workDayStart.current}
            workDayEnd={workDayEnd.current}
            dateRange={getDateRange}
          />
          <WeekView
            title="Full Week"
            slotDuration={60}
            workWeekStart={Day.Monday}
            workWeekEnd={Day.Sunday}
            slot={CustomSchedulerSlot}
            item={CustomSchedulerItem}
            slotDivisions={slotDivisions}
            currentTimeMarker={true}
            onDataAction={onDataAction}
            defaultShowWorkHours={false}
            workDayStart={workDayStart.current}
            workDayEnd={workDayEnd.current}
            dateRange={getDateRange}
          />
          <MonthView title="Month"
            onDataAction={onDataAction}
            slot={CustomSchedulerSlotMonth}
            item={CustomSchedulerItemMonth}
            dateRange={getDateRange}
            dateHeaderCell={CustomDateHeaderCellMonth}
          />
        </Scheduler>

        <ConfirmAction options={confirmOptions} setOptions={setConfirmOptions} />

      </CustomKendoSchedulerContext.Provider>
      <style jsx>{`
    :global(.k-scheduler .k-scheduler-head .k-scheduler-group:nth-child(2)) {
      display: none;
    }

    :global(.k-button) {
      text-transform: capitalize;
      font-size: 0.8rem;
    }
`}</style>
    </NoSSR>
  )
}

const CustomDateHeaderCellMonth = props => (
  <DateHeaderCell {...props} format={"E"} />
);
