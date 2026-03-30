import React, { useState, useEffect, useRef, useContext } from 'react';
import SCInput from '../../sc-controls/form-controls/sc-input';
import SCCheckbox from '../../sc-controls/form-controls/sc-checkbox';
import SCDatePicker from '../../sc-controls/form-controls/sc-datepicker';
import SCTimePicker from '../../sc-controls/form-controls/sc-timepicker';
import SCDropdownList from '../../sc-controls/form-controls/sc-dropdownlist';
import StoreSelector from '../../selectors/store/store-selector';
import {Button, Loader, ScrollArea} from '@mantine/core';
import Fetch from '../../../utils/Fetch';
import * as Enums from '../../../utils/enums';
import Helper from '../../../utils/helper';
import Time from '../../../utils/time';
import ToastContext from '../../../utils/toast-context';
import EmployeeMultiSelector from '../../selectors/employee/employee-multiselector';
import ConfirmAction from '../../../components/modals/confirm-action';
import Storage from '../../../utils/storage';
import CustomerContactLocationSelector from '../../selectors/customer/customer-contact-location-selector';
import constants from '../../../utils/constants';
import {Box, Flex, Text} from "@mantine/core";
import SCModal from "../../../PageComponents/Modal/SCModal";
import LinkItem from "../../../PageComponents/Links/LinkItem";
import {showNotification} from "@mantine/notifications";

// Helper: get a normalized Store object from a linked item
const getStoreFromItem = (item) => {
    if (!item) return null;
    if (item.Store && (item.Store.ID || item.Store.Name)) return item.Store;
    return null;
};

function ManageAppointment(props) {

  const toast = useContext(ToastContext);

  const isNew = props.isNew;
  const externalModule = props.module;
  const externalModuleID = props.moduleID;
  const externalCustomerID = props.customerID;
  const externalEmployees = props.employees;
  const externalStore = props.store;

  const [clearLinks, setClearLinks] = useState(isNew);

  const defaultStartDate = props.defaultStartDate;
  const defaultStartDateTime = props.defaultStartDateTime;
  const defaultEndDateTime = props.defaultEndDateTime;

  const [appointment, setAppointment] = useState(isNew ? {
    StartDate: Time.toISOString(defaultStartDate),
    StartDateTime: Time.toISOString(defaultStartDateTime),
    EndDate: Time.toISOString(defaultEndDateTime),
    EndDateTime: Time.toISOString(defaultEndDateTime),
    AppointmentType: Enums.AppointmentType.OnSite,
  } : props.appointment);

  const updateAppointment = (field, value) => {
    let temp = { ...appointment };
    temp[field] = value;
    setAppointment(temp);
  };

  const updateAppointmentInBulk = (items) => {
    let temp = { ...appointment };
    for (var i = 0; i < items.length; i++) {
      temp[items[i].field] = items[i].value;
    }
    setAppointment(temp);
  };

  const [module, setModule] = useState();
  const [itemID, setItemID] = useState();

  const updateModuleLink = (module, moduleID) => {
    setModule(module);
    setItemID(moduleID);
  };

  const [showJobLink, setShowJobLink] = useState(isNew);
  const [showQueryLink, setShowQueryLink] = useState(isNew);
  const [showProjectLink, setShowProjectLink] = useState(isNew);
  const [jobLinkLockdown, setJobLinkLockdown] = useState(false);
  const [queryLinkLockdown, setQueryLinkLockdown] = useState(false);
  const [canChangeCustomer, setCanChangeCustomer] = useState(true);
  const [projectLinkLockdown, setProjectLinkLockdown] = useState(false);

  const [appointmentTypes, setAppointmentTypes] = useState([]);
  const [appointmentReminders, setAppointmentReminders] = useState([]);

  // Page load effect
  useEffect(() => {
    if (isNew) {
      if (externalModule) {

        switch (parseInt(externalModule)) {
          case Enums.Module.Customer:
            updateModuleLink(Enums.Module.Customer, externalModuleID);
            break;
          case Enums.Module.JobCard:
            setJobLinkLockdown(true);
            setShowQueryLink(false);
            setShowProjectLink(false);
            getLinkedJobCard(externalModuleID).then((job) => {
              linkAppointmentToJob(job);
            });
            updateModuleLink(Enums.Module.JobCard, externalModuleID);
            break;
          case Enums.Module.Query:
            setQueryLinkLockdown(true);
            setShowJobLink(false);
            setShowProjectLink(false);
            getLinkedQuery(externalModuleID);
            updateModuleLink(Enums.Module.Query, externalModuleID);
            break;
          case Enums.Module.Project:
            setShowQueryLink(false);
            setShowJobLink(false);
            setShowProjectLink(true);
            setProjectLinkLockdown(true);
            getLinkedProject(externalModuleID);
            updateModuleLink(Enums.Module.Project, externalModuleID);
            break;
        }

        setCanChangeCustomer(false);
      } else {
        updateSubject("Appointment");
        setSubjectAutoSelect(true);
      }

      selectCustomer(externalCustomerID);

    } else {
      if (externalModule) {

        switch (parseInt(externalModule)) {
          case Enums.Module.Customer:
            break;
          case Enums.Module.JobCard:
            setShowJobLink(true);
            setShowQueryLink(false);
            setShowProjectLink(false);
            setJobLinkLockdown(true);
            getLinkedJobCard(externalModuleID);
            break;
          case Enums.Module.Query:
            setShowQueryLink(true);
            setShowJobLink(false);
            setShowProjectLink(false);
            setQueryLinkLockdown(true);
            getLinkedQuery(externalModuleID);
            break;
          case Enums.Module.Project:
            if (appointment.Module == Enums.Module.Project) {
              setShowProjectLink(true);
              setProjectLinkLockdown(true);
              setShowJobLink(false);
              getLinkedProject(appointment.ItemID);
            } else if (appointment.Module == Enums.Module.JobCard) {
              setShowJobLink(true);
              setJobLinkLockdown(true);
              getLinkedJobCard(appointment.ItemID);
            }
            setShowQueryLink(false);
            break;
        }

        setCanChangeCustomer(false);
      } else {

        switch (parseInt(appointment.Module)) {
          case Enums.Module.JobCard:
            getLinkedJobCard(appointment.ItemID);
            setShowJobLink(true);
            setShowQueryLink(false);
            setShowProjectLink(false);
            setJobLinkLockdown(true);
            break;
          case Enums.Module.Query:
            getLinkedQuery(appointment.ItemID);
            setShowJobLink(false);
            setShowQueryLink(true);
            setShowProjectLink(false);
            setQueryLinkLockdown(true);
            break;
          case Enums.Module.Project:
            getLinkedProject(appointment.ItemID);
            setShowJobLink(false);
            setShowQueryLink(false);
            setShowProjectLink(true);
            setProjectLinkLockdown(true);
            break;
          default:
            setShowJobLink(true);
            setShowQueryLink(true);
            setShowProjectLink(true);
            break;
        }
      }
    }

    setAppointmentTypes(Enums.getEnumItems(Enums.AppointmentType));
    setAppointmentReminders(Enums.getEnumItems(Enums.AppointmentReminder, false));
    getStore();

    if (isNew) {
      Helper.mixpanelTrack(constants.mixPanelEvents.manageAppointment, {
        "isNew": true
      });
    }

    // if (isNew) {
    //     setMinEndDateTime(Time.parseDate(defaultStartDateTime));
    // } else {
    //     let startDateFormatted = Time.getDateFormatted(props.appointment.StartDateTime, 'yyyy-MM-dd');
    //     let endDateFormatted = Time.getDateFormatted(props.appointment.EndDateTime, 'yyyy-MM-dd');

    //     if (Time.equalTo(startDateFormatted, endDateFormatted)) {
    //         setMinEndDateTime(Time.parseDate(props.appointment.StartDateTime));
    //     } else {
    //         setMinEndDateTime(undefined);
    //     }
    // }
  }, []);

  const [inputErrors, setInputErrors] = useState({});

  const [subject, setSubject] = useState(isNew ? '' : props.appointment.Subject);
  const [subjectAutoSelect, setSubjectAutoSelect] = useState(false);

  const handleSubjectChange = (e) => {
    updateSubject(e.value);
  };

  const updateSubject = (value) => {
    setSubject(value);
    updateAppointment('Subject', value);
  };

  const [startDate, setStartDate] = useState(isNew ? Time.toISOString(defaultStartDate) : props.appointment.StartDateTime);
  const [endDate, setEndDate] = useState(isNew ? Time.toISOString(defaultEndDateTime) : props.appointment.EndDateTime);

  const handleStartDateChange = (date) => {
    if(date.value.length === 19) {
      let currentStartDateTime = Time.parseDate(startDateTime);
      let changedStartDate = Time.parseDate(date.value);
      changedStartDate.setHours(currentStartDateTime.getHours());
      changedStartDate.setMinutes(currentStartDateTime.getMinutes());

      let dateStringStartChanged = Time.toISOString(changedStartDate);
      setStartDateTime(dateStringStartChanged);
      setStartDate(dateStringStartChanged);

      let currentDateFormatted = Time.getDateFormatted(startDateTime, 'yyyy-MM-dd');
      let startDateFormatted = Time.getDateFormatted(date.value, 'yyyy-MM-dd');
      let endDateFormatted = Time.getDateFormatted(endDate, 'yyyy-MM-dd');

      // if (Time.equalTo(startDateFormatted, endDateFormatted)) {
      //     setMinEndDateTime(changedStartDate);
      // } else {
      //     setMinEndDateTime(undefined);
      // }

      let currentEndDateTime = Time.parseDate(endDateTime);
      let dateStringEndChanged = Time.toISOString(currentEndDateTime);

      if (Time.greaterThan(currentDateFormatted, startDateFormatted)) {
        // decrease
        let update = Time.addDays(Time.getDaysDifference(currentDateFormatted, startDateFormatted), currentEndDateTime);
        dateStringEndChanged = Time.toISOString(update);
        setEndDateTime(dateStringEndChanged);
        setEndDate(dateStringEndChanged);
      } else if (Time.greaterThan(startDateFormatted, currentDateFormatted)) {
        // increase
        let update = Time.addDays(Time.getDaysDifference(currentDateFormatted, startDateFormatted), currentEndDateTime);
        dateStringEndChanged = Time.toISOString(update);
        setEndDateTime(dateStringEndChanged);
        setEndDate(dateStringEndChanged);
      }

      updateAppointmentInBulk([{ 'field': 'StartDate', 'value': dateStringStartChanged },
        { 'field': 'StartDateTime', 'value': dateStringStartChanged },
        { 'field': 'EndDate', 'value': dateStringEndChanged },
        { 'field': 'EndDateTime', 'value': dateStringEndChanged }]);
    }

  };

  const handleEndDateChange = (date) => {

    let currentEndDateTime = Time.parseDate(endDateTime);
    let changedEndDate = Time.parseDate(date.value);
    changedEndDate.setHours(currentEndDateTime.getHours());
    changedEndDate.setMinutes(currentEndDateTime.getMinutes());

    let startDateFormatted = Time.getDateFormatted(startDate, 'yyyy-MM-dd');
    let endDateFormatted = Time.getDateFormatted(date.value, 'yyyy-MM-dd');

    // if (Time.equalTo(startDateFormatted, endDateFormatted)) {
    //     setMinEndDateTime(Time.parseDate(startDateTime));
    // } else {
    //     setMinEndDateTime(undefined);
    // }

    let dateStringEndChanged = Time.toISOString(changedEndDate);
    setEndDateTime(dateStringEndChanged);
    setEndDate(dateStringEndChanged);

    let currentStartDateTime = Time.parseDate(startDateTime);
    let dateStringStartChanged = Time.toISOString(currentStartDateTime);

    updateAppointmentInBulk([{ 'field': 'StartDate', 'value': dateStringStartChanged },
    { 'field': 'StartDateTime', 'value': dateStringStartChanged },
    { 'field': 'EndDate', 'value': dateStringEndChanged },
    { 'field': 'EndDateTime', 'value': dateStringEndChanged }]);
  };

  const [startDateTime, setStartDateTime] = useState(isNew ? Time.toISOString(defaultStartDateTime) : props.appointment.StartDateTime);  

  const handleStartDateTimeChange = (dateOrStringTime) => {

    const datetime = {...dateOrStringTime, value: new Date(dateOrStringTime.value)} // replicate and cast time portion to date and ensure date is valid before continuing
    if (!isNaN(datetime.value)) {

      let incomingDate = Time.parseDate(datetime.value);

      let newStartDate = Time.parseDate(startDate);
      newStartDate.setHours(incomingDate.getHours());
      newStartDate.setMinutes(incomingDate.getMinutes());

      let dateString = Time.toISOString(newStartDate);

      let currentEndDateTime = Time.parseDate(endDateTime);
      let endDateString = Time.toISOString(currentEndDateTime);

      let startDateFormatted = Time.getDateFormatted(startDate, 'yyyy-MM-dd');
      let endDateFormatted = Time.getDateFormatted(endDate, 'yyyy-MM-dd');

      let applyEndTimeChange = Time.equalTo(startDateFormatted, endDateFormatted) || Time.lessThan(startDateFormatted, endDateFormatted);

      if (applyEndTimeChange) {
        let prevStartDate = Time.parseDate(startDateTime);

        if (prevStartDate.valueOf() > newStartDate.valueOf()) {
          let hourDiff = prevStartDate.getHours() - newStartDate.getHours();
          let minDiff = prevStartDate.getMinutes() - newStartDate.getMinutes();

          if (hourDiff != 0) {
            currentEndDateTime.setHours(currentEndDateTime.getHours() - hourDiff);
          }
          if (minDiff != 0) {
            currentEndDateTime.setMinutes(currentEndDateTime.getMinutes() - minDiff);
          }
        } else {
          let hourDiff = newStartDate.getHours() - prevStartDate.getHours();
          let minDiff = newStartDate.getMinutes() - prevStartDate.getMinutes();

          if (hourDiff != 0) {
            currentEndDateTime.setHours(currentEndDateTime.getHours() + hourDiff);
          }
          if (minDiff != 0) {
            currentEndDateTime.setMinutes(currentEndDateTime.getMinutes() + minDiff);
          }
        }

        // if (Time.equalTo(startDateFormatted, Time.getDateFormatted(currentEndDateTime, 'yyyy-MM-dd'))) {
        //   //setMinEndDateTime(newStartDate);
        //   setMinEndDateTime(Time.parseDate(incomingDate));
        //   console.log('update')
        // }

        // if (Time.equalTo(startDateFormatted, endDateFormatted)) {
        //   setMinEndDateTime(newStartDate);
        // }

        endDateString = Time.toISOString(currentEndDateTime);
        setEndDateTime(endDateString);
        setEndDate(endDateString);
      } else {
        //setMinEndDateTime(undefined);
      }

      setStartDateTime(dateString);
      setStartDate(dateString);

      updateAppointmentInBulk([{ 'field': 'StartDate', 'value': dateString }, { 'field': 'StartDateTime', 'value': dateString },
        { 'field': 'EndDate', 'value': endDateString }, { 'field': 'EndDateTime', 'value': endDateString }]);
    }
  };

  const [endDateTime, setEndDateTime] = useState(isNew ? Time.toISOString(defaultEndDateTime) : props.appointment.EndDateTime);
  const [minEndDateTime, setMinEndDateTime] = useState();

  const handleEndDateTimeChange = (dateOrStringTime) => {
    const datetime = {...dateOrStringTime, value: new Date(dateOrStringTime.value)} // replicate and cast time portion to date and ensure date is valid before continuing

    if (!isNaN(datetime.value)) {
      let incomingDate = Time.parseDate(datetime.value);
      let temp = Time.parseDate(endDate);
      temp.setHours(incomingDate.getHours());
      temp.setMinutes(incomingDate.getMinutes());

      let dateString = Time.toISOString(temp);
      setEndDateTime(dateString);
      setEndDate(dateString);

      updateAppointmentInBulk([{ 'field': 'EndDate', 'value': dateString }, { 'field': 'EndDateTime', 'value': dateString }]);
    }
  }

  const [appointmentTypeText, setAppointmentTypeText] = useState(isNew ? Enums.getEnumStringValue(Enums.AppointmentType, Enums.AppointmentType.OnSite)
    : Enums.getEnumStringValue(Enums.AppointmentType, props.appointment.AppointmentType));

  const handleAppointmentTypeChange = (value) => {
    updateAppointment('AppointmentType', Enums.AppointmentType[value]);
  };

  const [employeeReminderText, setEmployeeReminderText] = useState(isNew ? Enums.getEnumStringValue(Enums.AppointmentReminder, Enums.AppointmentReminder['No reminder']) 
    : Enums.getEnumStringValue(Enums.AppointmentReminder, props.appointment.EmployeeReminder));
  
  const setSelectedEmployeeReminder = (value) => {
    updateAppointment('EmployeeReminder', Enums.AppointmentReminder[value]);
    setEmployeeReminderText(value);
  };

  const [customerReminderText, setCustomerReminderText] = useState(isNew ? Enums.getEnumStringValue(Enums.AppointmentReminder, Enums.AppointmentReminder['No reminder']) 
    : Enums.getEnumStringValue(Enums.AppointmentReminder, props.appointment.CustomerReminder));
  
  const setSelectedCustomerReminder = (value) => {
    updateAppointment('CustomerReminder', Enums.AppointmentReminder[value]);
    setCustomerReminderText(value);
  };

  const [selectedCustomer, setSelectedCustomer] = useState(isNew ? undefined : props.appointment.Customer);
  const [selectedContact, setSelectedContact] = useState(isNew ? undefined : props.appointment.Contact ? props.appointment.Contact : undefined);

  useEffect(() => {
    if (!Helper.isEmptyObject(selectedCustomer)) {

      if (clearLinks && !externalModule) {
        setSelectedJob(null);
        setSelectedQuery(null);
        setSelectedProject(null);
        setShowJobLink(true);
        setShowQueryLink(true);
        setShowProjectLink(true);
      }
      setClearLinks(true);
    }
  }, [selectedCustomer]);

  const selectCustomer = async (customerID) => {
    if (customerID) {
      let customer = await Fetch.get({
        url: `/Customer/${customerID}`,
      });
      setSelectedCustomer(customer);
    }
  };

  const [selectedLocation, setSelectedLocation] = useState(isNew ? undefined : props.appointment.Location ? props.appointment.Location : undefined);

  // JOB CARD LINK

  const [selectedJob, setSelectedJob] = useState({});

  async function getLinkedJobCard(id) {
    let job = await Fetch.get({
      url: `/Job/${id}`,
      caller: 'components/modals/appointment/manage-appointment.js:getLinkedJobCard()'
    });
    setSelectedJob(job);

    if(!!job.Contact) {
      setSelectedContact(job.Contact)
    }
    if(!!job.Location) {
      setSelectedLocation(job.Location)
    }


    if (isNew) {
        // If opened via external module without external employees, auto-assign employees from the linked Job
        if (externalModule && externalModuleID && (!externalEmployees || externalEmployees.length === 0) && job?.Employees?.length > 0) {
            setSelectedEmployees(job.Employees);
        }

      const current = (subject || '').trim();
      const isDefault = current === '' || current === 'Appointment' || current.startsWith('Appointment for');
      if (isDefault) {
        updateSubject(`Appointment for ${job.JobCardNumber}`);
      }
      setSubjectAutoSelect(true);
    }

    return job;
  }

  const promptAssignEmployees = (employees, originType) => {
    let employeesToAssign = [];
    employees.forEach(employee => {
      if (storeEmployees.findIndex(x => x.ID === employee.ID) > -1) {
        employeesToAssign.push(employee);
      }
    });

    if (employeesToAssign.length > 0) {
      setConfirmOptions({
        display: true,
        heading: "Assign Employees",
        text: `Assign employees from selected ${originType}?`,
        confirmButtonText: "Yes",
        showCancel: true,
        cancelButtonText: "No",
        onConfirm: () => {
          setSelectedEmployees(employeesToAssign);
        }
      });
    }
  };

  const linkAppointmentToJob = (job) => {
    setSelectedJob(job);
    if (job) {
      updateModuleLink(Enums.Module.JobCard, job.ID);
      setSelectedQuery(null);
      if (!externalModule) {
        setShowProjectLink(false);
        setShowQueryLink(false);
      }
      if (job.Employees && job.Employees.length > 0) {
        promptAssignEmployees(job.Employees, "job");
      }

      if (isNew) {
        if (subject && (subject.trim() === 'Appointment' || subject.trim().startsWith(`Appointment for`))) {
          updateSubject(`Appointment for ${job.JobCardNumber}`);
        }
      }
    } else {
      if (!Helper.isEmptyObject(selectedCustomer)) {
        updateModuleLink(Enums.Module.Customer, selectedCustomer.ID);
      }
      if (!externalModule) {
        setShowProjectLink(true);
        setShowQueryLink(true);
        setProjectLinkLockdown(false);
        setQueryLinkLockdown(false);
      }

      if (isNew) {
          //updateSubject(`Appointment`);
      }
    }
  };

  // QUERY LINK

  const [selectedQuery, setSelectedQuery] = useState(null);

  async function getLinkedQuery(id) {
    let query = await Fetch.get({
      url: `/Query/${id}`,
    });
    setSelectedQuery(query);

    if(!!query.Contact) {
      setSelectedContact(query.Contact)
    }
    if(!!query.Location) {
      setSelectedLocation(query.Location)
    }

    // If opened via external module without external employees, auto-assign employees from the linked Query
    if (externalModule && externalModuleID && (!externalEmployees || externalEmployees.length === 0) && query?.Employees?.length > 0) {
      setSelectedEmployees(query.Employees);
    }

    if (isNew) {
      const current = (subject || '').trim();
      const isDefault = current === '' || current === 'Appointment' || current.startsWith('Appointment for');
      if (isDefault) {
        updateSubject(`Appointment for ${query.QueryCode}`);
      }
      setSubjectAutoSelect(true);
    }
  }

  const linkAppointmentToQuery = (query) => {
    setSelectedQuery(query);
    if (query) {
      updateModuleLink(Enums.Module.Query, query.ID);
      setSelectedJob(null);

      if (!externalModule) {
        setShowProjectLink(false);
        setShowJobLink(false);
      }

      if (isNew) {
        if (subject && (subject.trim() === 'Appointment' || subject.trim().startsWith(`Appointment for`))) {
          updateSubject(`Appointment for ${query.QueryCode}`);
        }
      }
    } else {
      if (!Helper.isEmptyObject(selectedCustomer)) {
        updateModuleLink(Enums.Module.Customer, selectedCustomer.ID);
      }
      if (!externalModule) {
        setShowProjectLink(true);
        setShowJobLink(true);
        setProjectLinkLockdown(false);
        setJobLinkLockdown(false);
      }
      if (isNew) {
        //updateSubject(`Appointment`);
      }
    }
  };

  // PROJECT LINK

  const [selectedProject, setSelectedProject] = useState(null);

  const getLinkedProject = async (id) => {
    let project = await Fetch.get({
      url: `/Project/${id}`
    });
    setSelectedProject(project);

    if(!!project.Contact) {
      setSelectedContact(project.Contact)
    }
    if(!!project.Location) {
      setSelectedLocation(project.Location)
    }

    // If opened via external module without external employees, auto-assign employees from the linked Project
    if (externalModule && externalModuleID && (!externalEmployees || externalEmployees.length === 0) && project?.Employees?.length > 0) {
      setSelectedEmployees(project.Employees);
    }

    if (isNew) {
      const current = (subject || '').trim();
      const isDefault = current === '' || current === 'Appointment' || current.startsWith('Appointment for');
      if (isDefault) {
        updateSubject(`Appointment for ${project.ProjectNumber}`);
      }
      setSubjectAutoSelect(true);
    }
  };

  const linkAppointmentToProject = (project) => {
    setSelectedProject(project);

    if (project) {
      updateModuleLink(Enums.Module.Project, project.ID);

      if (!externalModule) {
        setShowJobLink(false);
        setShowQueryLink(false);
      }

      if (isNew) {
        if (subject && (subject.trim() === 'Appointment' || subject.trim().startsWith(`Appointment for`))) {
          updateSubject(`Appointment for ${project.ProjectNumber}`);
        }
      }
    } else {
      if (!Helper.isEmptyObject(selectedCustomer)) {
        updateModuleLink(Enums.Module.Customer, selectedCustomer.ID);
      }
      if (!externalModule) {
        setShowJobLink(true);
        setShowQueryLink(true);
        setJobLinkLockdown(false);
        setQueryLinkLockdown(false);
      }

      if (isNew) {
        //updateSubject(`Appointment`);
      }
    }
  };

  // EMPLOYEE

  const [selectedEmployees, setSelectedEmployees] = useState(isNew ? (externalEmployees ? externalEmployees : []) : props.appointment.Employees ? props.appointment.Employees : []);

  const [sendEmployeeReminderOnSave, setSendEmployeeReminderOnSave] = useState(false);
  const handleSendEmployeeReminderOnSaveChange = (e) => {
    setSendEmployeeReminderOnSave(!sendEmployeeReminderOnSave);
    updateAppointment('SendEmployeeReminderOnSave', !sendEmployeeReminderOnSave);
  };

  const [sendCustomerReminderOnSave, setSendCustomerReminderOnSave] = useState(false);
  const handleSendCustomerReminderOnSaveChange = (e) => {
    setSendCustomerReminderOnSave(!sendCustomerReminderOnSave);
    updateAppointment('SendCustomerReminderOnSave', !sendCustomerReminderOnSave);
  };  

  const validate = () => {
    let valInputs = [
      { key: "Subject", value: subject, type: Enums.ControlType.Text, required: true },
      { key: "Customer", value: selectedCustomer, type: Enums.ControlType.Custom, required: true },
      { key: "Contact", value: selectedContact, type: Enums.ControlType.Custom, required: true },
      { key: "StartDate", value: startDate, type: Enums.ControlType.Date, required: true, lt: null, gt: null },
      { key: "StartDateTime", value: startDateTime, type: Enums.ControlType.Date, required: true, lt: null, gt: null },
      { key: "EndDate", value: endDate, type: Enums.ControlType.Date, required: true, lt: null, gt: startDateTime, tf: 'hh:mm' },
      { key: "EndDateTime", value: endDateTime, type: Enums.ControlType.Date, required: true, lt: null, gt: startDateTime, tf: 'hh:mm' },
    ];
    if (isMultiStore) {
      valInputs.push({ key: "Store", value: selectedStore, type: Enums.ControlType.Select, required: true });
    }

    const { isValid, errors } = Helper.validateInputs(valInputs);

    setInputErrors(errors);
    return isValid;
  };

  const [saving, setSaving] = useState(false);

  const checkForClash = async (id, start, end, employeeIDs) => {
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

            },
            onConfirm: () => {
              saveAppointment(true);
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

  const saveAppointment = async (forceSave = false) => {

    setSaving(true);

    let isValid = validate();
    let hasClash = false;
    if (!forceSave && isValid) {
      hasClash = await checkForClash(appointment.ID, appointment.StartDateTime, appointment.EndDateTime, selectedEmployees.map(x => x.ID));
    }

    if (!isValid) {
      toast.setToast({
        message: 'There are errors on the page',
        show: true,
        type: 'error'
      });
      setSaving(false);
    } else {

      if (hasClash) {
        setSaving(false);
        return;
      }

      let appointmentToSave = {
        ...appointment,
        CustomerID: selectedCustomer ? selectedCustomer.ID : null,
        CustomerContactID: selectedContact ? selectedContact.ID : null,
        LocationID: selectedLocation ? selectedLocation.ID : null,
        Customer: selectedCustomer,
        Contact: selectedContact ? selectedContact : null,
        Location: selectedLocation,
        Employees: selectedEmployees,
        StoreID: (selectedStore ? selectedStore.ID : appointment.StoreID),
        Module: !Helper.isNullOrUndefined(module) ? module : appointment.Module,
        ItemID: itemID ? itemID : appointment.ItemID,
      };

      let employeeIDs = selectedEmployees.length > 0 ? selectedEmployees.map((employee, i) => { return employee.ID }) : [];
      let result = {};

      if (isNew) {
        result = await Fetch.post({
          url: `/Appointment`,
          params: {
            Appointment: appointmentToSave,
            EmployeeIDs: employeeIDs,
          },
          toastCtx: toast
        });
      } else {
        result = await Fetch.put({
          url: `/Appointment`,
          params: {
            Appointment: appointmentToSave,
            EmployeeIDs: employeeIDs,
          },
          toastCtx: toast
        });
      }

      if (result.ID) {
        props.onSavedAppointment(result);
        toast.setToast({
          message: 'Appointment saved successfully',
          show: true,
          type: 'success'
        });
      } else {
        setSaving(false);
      }
    }

    if (!isNew) {
      setSaving(false);
    }
  }

  const cancelAppointment = async () => {
    setConfirmOptions({
      display: true,
      heading: "Confirm",
      text: "Are you sure you want to cancel this appointment?",
      confirmButtonText: "Confirm",
      showCancel: true,
      onConfirm: async () => {
        cancelAppointmentConfirmed();
      }
    });
  }

  const cancelAppointmentConfirmed = async () => {

    let isValid = validate();
    if (!isValid) {
      toast.setToast({
        message: 'There are errors on the page',
        show: true,
        type: 'error'
      });
    } else {
      let appointmentToSave = {
        ...appointment,
        CustomerID: selectedCustomer ? selectedCustomer.ID : null,
        CustomerContactID: selectedContact ? selectedContact.ID : null,
        LocationID: selectedLocation ? selectedLocation.ID : null,
        Customer: selectedCustomer,
        Contact: selectedContact ? selectedContact : null,
        Location: selectedLocation,
        Employees: selectedEmployees,
        IsActive: false,
      };

      let employeeIDs = selectedEmployees.length > 0 ? selectedEmployees.map((employee, i) => { return employee.ID }) : null;
      let result = await Fetch.put({
        url: `/Appointment`,
        params: {
          Appointment: appointmentToSave,
          EmployeeIDs: employeeIDs,
        },
        toastCtx: toast
      });

      if (result.ID) {
        props.onSavedAppointment(result);
        toast.setToast({
          message: 'Appointment cancelled successfully',
          show: true,
          type: 'success'
        });
      } else {
      }
    }
  }

  const initialiseConfirmOptions = () => {
    return {
      display: false,
      heading: "",
      text: "",
      onConfirm: () => { },
      onCancel: () => { },
      onDiscard: () => { },
      confirmButtonText: "OK",
      cancelButtonText: "Cancel",
      showCancel: true,
      showDiscard: false
    };
  }

  const [confirmOptions, setConfirmOptions] = useState(initialiseConfirmOptions);


  const [isMultiStore, setIsMultiStore] = useState(false);
  const [stores, setStores] = useState([]);
  const [storesTotalResults, setStoresTotalResults] = useState();
  const [storeSearch, setStoreSearch] = useState(externalStore ? externalStore.Name : '');
  const [selectedStore, setSelectedStore] = useState(props.appointment ? props.appointment.Store : (externalStore ? externalStore : null));

  // If a locked-down linked item with a store exists, lock the store selector
  const storeLockedDown = !!(
    (jobLinkLockdown && getStoreFromItem(selectedJob)) ||
    (queryLinkLockdown && getStoreFromItem(selectedQuery)) ||
    (projectLinkLockdown && getStoreFromItem(selectedProject))
  );

  // When a linked item is selected/loaded, populate the store from the item
  useEffect(() => {
    // Prefer job, then query, then project (only one should be active at a time)
    const fromJob = getStoreFromItem(selectedJob);
    const fromQuery = getStoreFromItem(selectedQuery);
    const fromProject = getStoreFromItem(selectedProject);
    const derived = fromJob || fromQuery || fromProject;
    if (derived && (!selectedStore || selectedStore.ID !== derived.ID)) {
      setSelectedStore(derived);
    }
  }, [selectedJob, selectedQuery, selectedProject]);

  // If store changes and link is not in lockdown and mismatches item store, clear that link
  useEffect(() => {
    const selectedStoreId = selectedStore?.ID;
    if (!selectedStoreId) return;

    const checkMismatchAndUnlink = (item, lockdown, clearFn, label) => {
      if (!item || lockdown) return;
      const itemStore = getStoreFromItem(item);
      const itemStoreId = itemStore?.ID;
      if (!itemStoreId) return;
      if (itemStoreId !== selectedStoreId) {
        clearFn(null);
        try {
            showNotification({
                message: `${label} link was cleared because the selected store does not match the item's store`,
                autoClose: 3000,
            })
        } catch (e) { /* noop */ }
      }
    };

    checkMismatchAndUnlink(selectedJob, jobLinkLockdown, linkAppointmentToJob, 'Job');
    checkMismatchAndUnlink(selectedQuery, queryLinkLockdown, linkAppointmentToQuery, 'Query');
    checkMismatchAndUnlink(selectedProject, projectLinkLockdown, linkAppointmentToProject, 'Project');
  }, [selectedStore]);

  const handleStoreChange = (e) => {
    setStoreSearch(e.target.value);
  };

  const getStore = async () => {
    const storesResult = await Fetch.get({
      url: `/Store/GetEmployeeStores?employeeID=${Storage.getCookie(Enums.Cookie.employeeID)}&searchPhrase=`,
    });
    setIsMultiStore(storesResult.TotalResults > 1);
  };

  const searchStores = async () => {
    setSearching(true);
    const storesResult = await Fetch.get({
      url: `/Store/GetEmployeeStores?employeeID=${Storage.getCookie(Enums.Cookie.employeeID)}&searchPhrase=${storeSearch}`,
    });
    setStores(storesResult.Results);
    setStoresTotalResults(storesResult.TotalResults);
    setSearching(false);
  };

  const [searching, setSearching] = useState(false);

  const firstTime = useRef(true);

  const [storeEmployees, setStoreEmployees] = useState([]);

  const onEmployeesGet = (employees) => {
    // check if auto selected employees, make sure they belong to the store
    if (storeEmployees.length === 0 && externalEmployees && externalEmployees.length > 0) {
      let employeesToAssign = [];
      externalEmployees.forEach(employee => {
        if (employees.findIndex(x => x.ID === employee.ID) > -1) {
          employeesToAssign.push(employee);
        }
      });
      setSelectedEmployees(employeesToAssign);
    } else {
      let newItems = [];

      if (selectedEmployees.length > 0) {
        if (employees.length > 0) {
          newItems = employees.filter(x => {
            return selectedEmployees.find(y => {
              return x.ID === y.ID;
              });
          });
        } else {
          newItems = selectedEmployees;
        }
      }

        if (newItems.length > 0) {
          setSelectedEmployees(newItems);
        } else {
          if (isNew && !firstTime.current && selectedEmployees.length > 0) {
            toast.setToast({
              message: 'Employees have been cleared',
              show: true,
              type: Enums.ToastType.success
            });
          }
          
          setSelectedEmployees([]);
          firstTime.current = false;
        }
    }
    setStoreEmployees(employees);
  };

  return (
      <>
        <SCModal
            size={'33em'}
            /*modalProps={{
              // size: '32em',
              // mih: '100vh',
              /!*mah: '99vh',
              styles: {
                // content: {height: '100vh'},
                root: {maxHeight: '100vh !important'},
                // body: {height: '100vh'},
                inner: {height: '100vh', padding: 0},
                /!*body: {
                  // height: '100vh'
                }*!/
            }*!/
        }}*/
            open={true}
        >
          <Text size={'xl'} c={'scBlue.9'} mb={{xl: 'sm'}} fw={600}>
            {isNew ? 'Creating your Appointment' : 'Editing your Appointment'}
          </Text>

          <ScrollArea.Autosize mah={'calc(100dvh - 210px)'} pl={'xs'} pos={'relative'} offsetScrollbars>
            <Box ml={4} px={1}>

              <Flex align={{base: 'start', sm: 'center'}} justify={'start'} direction={{base: 'column', sm: 'row'}} gap={'sm'}>
                <Box w={{base: '100%', sm: '66.66%'}} style={{flexGrow: 1}}>
                  <SCInput
                      label="Title"
                      required={true}
                      type="text"
                      onChange={handleSubjectChange}
                      value={subject}
                      error={inputErrors.Subject}
                      autoFocus={true}
                      autoSelect={subjectAutoSelect}
                      mt={0}
                  />
                </Box>

                <Box maw={{sm: 133, base: '100%'}} w={{base: '100%', sm: '33.33%'}}>
                  <SCDropdownList
                      value={appointmentTypeText}
                      options={appointmentTypes}
                      onChange={handleAppointmentTypeChange}
                      label={"Appointment type"}
                      mt={0}
                  />
                </Box>
              </Flex>

              <Box>
                {
                    isMultiStore && (
                        isNew ? (
                                <StoreSelector selectedStore={selectedStore} setSelectedStore={setSelectedStore}
                                               required={true} disabled={storeLockedDown} error={inputErrors.Store} accessStatus={props.accessStatus} />
                            ) :
                            selectedStore && (
                                <StoreSelector selectedStore={selectedStore} setSelectedStore={setSelectedStore}
                                               required={true} disabled={true} error={inputErrors.Store} accessStatus={props.accessStatus} />
                            ))
                }
              </Box>

              <Flex align={{base: 'start', sm: 'center'}} justify={'start'} my={'sm'} mb={'lg'} gap={5} wrap={'wrap'}>
                <Flex gap={5} style={{flexGrow: 1}}>
                  <Box style={{flexGrow: 1}} maw={{base: '8em'}}>
                    <SCDatePicker
                        changeHandler={handleStartDateChange}
                        label='Start Date'
                        required={false}
                        error={inputErrors.StartDate}
                        value={startDate}
                        mt={0}
                    />
                  </Box>
                  <Box style={{flexGrow: 1}} maw={'6em'}>
                    <SCTimePicker
                        changeHandler={handleStartDateTimeChange}
                        label="Start Time"
                        required={false}
                        error={inputErrors.StartDateTime}
                        value={startDateTime}
                        mt={0}

                    />
                  </Box>
                </Flex>
                <em style={{alignSelf: 'end', marginBottom: 10}}>to</em>
                <Flex gap={5} style={{flexGrow: 1}}>
                  <Box style={{flexGrow: 1}} maw={'6em'}>
                    <SCTimePicker
                        changeHandler={handleEndDateTimeChange}
                        label="End Time"
                        required={false}
                        error={inputErrors.EndDateTime}
                        value={endDateTime}
                        min={minEndDateTime}
                        startDateAndTime={startDateTime}
                        endDate={endDate}
                        mt={0}
                    />
                  </Box>
                  <Box style={{flexGrow: 1}} maw={{base: '8em'}}>
                    <SCDatePicker
                        changeHandler={handleEndDateChange}
                        label='End Date'
                        required={false}
                        error={inputErrors.EndDate}
                        value={endDate}
                        mt={0}
                    />
                  </Box>
                </Flex>
              </Flex>

              <CustomerContactLocationSelector isNew={isNew}
                                               selectedCustomer={selectedCustomer} setSelectedCustomer={setSelectedCustomer} canChangeCustomer={canChangeCustomer}
                                               selectedContact={selectedContact} setSelectedContact={setSelectedContact}
                                               selectedLocation={selectedLocation} setSelectedLocation={setSelectedLocation}
                                               inputErrors={inputErrors} accessStatus={props.accessStatus} compactView={true}
                                               mode={'edit'} iconMode
              />

              {selectedCustomer &&
                  <Flex
                      align={'center'}
                      justify={/*(selectedQuery || selectedJob || selectedProject) ? 'start' : */'space-evenly'}
                      gap={'sm'}
                      mt={'sm'}
                  >
                    {
                        selectedCustomer && showJobLink &&
                        <LinkItem
                            module={Enums.Module.JobCard}
                            lockdown={jobLinkLockdown} customerID={selectedCustomer.ID}
                            setSelected={linkAppointmentToJob} selectedItem={selectedJob}
                            dropdownDirection="up" newParent={isNew}
                        />
                      /*<Box style={{flexGrow: 1}}>
                        {/!*<LinkToJob lockdown={jobLinkLockdown} customerID={selectedCustomer.ID}
                                   setSelected={linkAppointmentToJob} selectedJob={selectedJob}
                                   dropdownDirection="up" newParent={isNew}
                        />*!/}
                      </Box>*/
                    }
                    {
                        selectedCustomer && showQueryLink &&
                        <LinkItem
                            module={Enums.Module.Query}
                            lockdown={queryLinkLockdown} customerID={selectedCustomer.ID}
                            setSelected={linkAppointmentToQuery} selectedItem={selectedQuery}
                            dropdownDirection="up"
                        />
                      /*
                        <Box style={{flexGrow: 1}}>
                          <LinkToQuery lockdown={queryLinkLockdown} customerID={selectedCustomer.ID}
                                       setSelected={linkAppointmentToQuery} selectedQuery={selectedQuery}
                                       dropdownDirection="up" />
                        </Box>*/
                    }

                    {
                        selectedCustomer && showProjectLink &&
                        <LinkItem
                            module={Enums.Module.Project}
                            lockdown={projectLinkLockdown} customerID={selectedCustomer.ID}
                            setSelected={linkAppointmentToProject} selectedItem={selectedProject}
                            dropdownDirection="up"
                        />
                        /*<Box style={{flexGrow: 1}}>
                          <LinkToProject lockdown={projectLinkLockdown} customerID={selectedCustomer.ID}
                                         onProjectSelect={linkAppointmentToProject} selectedProject={selectedProject}
                                         dropdownDirection="up" />
                        </Box>*/
                    }
                  </Flex>}

              <Box>
                <EmployeeMultiSelector selectedEmployees={selectedEmployees} setSelectedEmployees={setSelectedEmployees} onEmployeesGet={onEmployeesGet}
                                       storeID={selectedStore ? selectedStore.ID : null} error={inputErrors.Employees} />
              </Box>

              <Flex align={{base: 'start', sm: 'center'}} justify={'start'} direction={{base: 'column', sm: 'row'}} gap={'sm'}>
                <Box w={{base: '100%'}} style={{flexGrow: 1}}>
                  <SCDropdownList
                      value={employeeReminderText}
                      onChange={setSelectedEmployeeReminder}
                      label="Employee Reminder"
                      options={appointmentReminders}
                  />
                  <SCCheckbox
                      onChange={handleSendEmployeeReminderOnSaveChange}
                      value={appointment.SendEmployeeReminderOnSave}
                      error={inputErrors.SendEmployeeReminderOnSave}
                      label="Notify employee now"
                  />
                </Box>
                <Box w={{base: '100%'}} style={{flexGrow: 1}}>
                  <SCDropdownList
                      value={customerReminderText}
                      onChange={setSelectedCustomerReminder}
                      label="Customer Reminder"
                      options={appointmentReminders}
                  />
                  <SCCheckbox
                      onChange={handleSendCustomerReminderOnSaveChange}
                      value={appointment.SendCustomerReminderOnSave}
                      error={inputErrors.SendCustomerReminderOnSave}
                      label="Notify customer now"
                  />
                </Box>
              </Flex>

            </Box>
          </ScrollArea.Autosize>


          <Flex gap={'xs'} wrap={'wrap'} pt={'sm'}>
            {
                !isNew &&
                <Button variant={'outline'} color={'yellow.7'} onClick={cancelAppointment} >
                  Cancel Appointment
                </Button>
            }

            <Button ml={'auto'} variant={'subtle'} color={'gray.9'} onClick={() => props.onSavedAppointment(null)}>
              Cancel
            </Button>

            <Button 
              onClick={() => saveAppointment(false)} 
              leftSection={saving ? <Loader size={16} color={'scBlue'} /> : undefined}
              disabled={saving}
            >
              {isNew ? 'Create' : 'Save'}
            </Button>

          </Flex>


        </SCModal>

        <ConfirmAction options={confirmOptions} setOptions={setConfirmOptions} />

      </>


    /*<div className="overlay" onClick={(e) => e.stopPropagation()}>
      <div className="modal-container">
        <div className="modal-title">
          {isNew ?
            <h1>Creating your Appointment</h1> :
            <h1>Editing your Appointment</h1>
          }
        </div>

        <Flex align={{base: 'start', sm: 'center'}} justify={'start'} direction={{base: 'column', sm: 'row'}} gap={'sm'}>
          <Box w={{base: '100%', sm: '66.66%'}} style={{flexGrow: 1}}>
            <SCInput
                label="Title"
                required={true}
                type="text"
                onChange={handleSubjectChange}
                value={subject}
                error={inputErrors.Subject}
                autoFocus={true}
                autoSelect={subjectAutoSelect}
            />
          </Box>

          <Box maw={{sm: 149.033, base: '100%'}} w={{base: '100%', sm: '33.33%'}}>
            <SCDropdownList
                value={appointmentTypeText}
                options={appointmentTypes}
                onChange={handleAppointmentTypeChange}
                label={"Appointment type"}
            />
          </Box>
        </Flex>

        <div className="row">
          <div className="column">
            {/!* <SelectInput
              changeHandler={handleAppointmentTypeChange}
              label="Appointment type"
              noInput={true}
              options={appointmentTypes}
              setSelected={setSelectedAppointmentType}
              type="enum"
              value={appointmentTypeText}
            /> *!/}
          </div>
          {isMultiStore ? (
            isNew ?
              <div className="column margin-left">
                <StoreSelector selectedStore={selectedStore} setSelectedStore={setSelectedStore} 
                  required={true} error={inputErrors.Store} accessStatus={props.accessStatus} />
              </div>
              : selectedStore ?
                <div className="column margin-left">
                  <StoreSelector selectedStore={selectedStore} setSelectedStore={setSelectedStore} 
                    required={true} disabled={true} error={inputErrors.Store} accessStatus={props.accessStatus} />
                </div>
                : "") : ''
          }
        </div>



        <Box>
          {
              isMultiStore && (
                  isNew ? (
                          <StoreSelector selectedStore={selectedStore} setSelectedStore={setSelectedStore}
                                         required={true} error={inputErrors.Store} accessStatus={props.accessStatus} />
                      ) :
                      selectedStore && (
                          <StoreSelector selectedStore={selectedStore} setSelectedStore={setSelectedStore}
                                         required={true} disabled={true} error={inputErrors.Store} accessStatus={props.accessStatus} />
                      ))
          }
        </Box>

        <Flex align={{base: 'start', sm: 'center'}} justify={'start'} gap={'sm'}>
          <Box style={{flexGrow: 1}}>
            <SCDatePicker
                changeHandler={handleStartDateChange}
                label='Start Date'
                required={false}
                error={inputErrors.StartDate}
                value={startDate}
            />
          </Box>
          <Box style={{flexGrow: 1}}>
            <SCTimePicker
                changeHandler={handleStartDateTimeChange}
                label="Start Time"
                required={false}
                error={inputErrors.StartDateTime}
                value={startDateTime}
            />
          </Box>
          <em style={{alignSelf: 'end', marginBottom: 10}}>to</em>
          <Box style={{flexGrow: 1}}>
            <SCTimePicker
                changeHandler={handleEndDateTimeChange}
                label="End Time"
                required={false}
                error={inputErrors.EndDateTime}
                value={endDateTime}
                min={minEndDateTime}
                startDateAndTime={startDateTime}
                endDate={endDate}
            />

          </Box>
          <Box style={{flexGrow: 1}}>
            <SCDatePicker
                changeHandler={handleEndDateChange}
                label='End Date'
                required={false}
                error={inputErrors.EndDate}
                value={endDate}
            />
          </Box>
        </Flex>

        <Box>
          <CustomerContactLocationSelector isNew={isNew}
                                           selectedCustomer={selectedCustomer} setSelectedCustomer={setSelectedCustomer} canChangeCustomer={canChangeCustomer}
                                           selectedContact={selectedContact} setSelectedContact={setSelectedContact}
                                           selectedLocation={selectedLocation} setSelectedLocation={setSelectedLocation}
                                           inputErrors={inputErrors} accessStatus={props.accessStatus} compactView={true}
                                           mode={'edit'}
          />
        </Box>

        <Flex align={{base: 'start', sm: 'center'}} justify={'start'} gap={'sm'}>

          {
            selectedCustomer && showJobLink &&
              <Box style={{flexGrow: 1}}>
                <LinkToJob lockdown={jobLinkLockdown} customerID={selectedCustomer.ID}
                           setSelected={linkAppointmentToJob} selectedJob={selectedJob}
                           dropdownDirection="up" newParent={isNew}
                />
              </Box>
          }
          {
            selectedCustomer && showQueryLink &&
              <Box style={{flexGrow: 1}}>
                <LinkToQuery lockdown={queryLinkLockdown} customerID={selectedCustomer.ID}
                             setSelected={linkAppointmentToQuery} selectedQuery={selectedQuery}
                             dropdownDirection="up" />
              </Box>
          }

          {
            selectedCustomer && showProjectLink &&
              <Box style={{flexGrow: 1}}>
                <LinkToProject lockdown={projectLinkLockdown} customerID={selectedCustomer.ID}
                               onProjectSelect={linkAppointmentToProject} selectedProject={selectedProject}
                               dropdownDirection="up" />
              </Box>
          }
        </Flex>

        <Box>
          <EmployeeMultiSelector selectedEmployees={selectedEmployees} setSelectedEmployees={setSelectedEmployees} onEmployeesGet={onEmployeesGet}
                                 storeID={selectedStore ? selectedStore.ID : null} error={inputErrors.Employees} />
        </Box>

        <Flex align={{base: 'start', sm: 'center'}} justify={'start'} direction={{base: 'column', sm: 'row'}} gap={'sm'}>
          <Box w={{base: '100%'}} style={{flexGrow: 1}}>
            <SCDropdownList
                value={employeeReminderText}
                onChange={setSelectedEmployeeReminder}
                label="Employee Reminder"
                options={appointmentReminders}
            />
            <SCCheckbox
                onChange={handleSendEmployeeReminderOnSaveChange}
                value={appointment.SendEmployeeReminderOnSave}
                error={inputErrors.SendEmployeeReminderOnSave}
                label="Notify employee now"
            />
          </Box>
          <Box w={{base: '100%'}} style={{flexGrow: 1}}>
            <SCDropdownList
                value={customerReminderText}
                onChange={setSelectedCustomerReminder}
                label="Customer Reminder"
                options={appointmentReminders}
            />
            <SCCheckbox
                onChange={handleSendCustomerReminderOnSaveChange}
                value={appointment.SendCustomerReminderOnSave}
                error={inputErrors.SendCustomerReminderOnSave}
                label="Notify customer now"
            />
          </Box>
        </Flex>

        <Flex justify={'end'} gap={'xs'} wrap={'wrap'}>
          <Button variant={'outline'} onClick={() => props.onSavedAppointment(null)}>
            Close
          </Button>

          {
            !isNew &&
              <Button variant={'outline'} color={'yellow.7'} onClick={cancelAppointment}>
                Cancel Appointment
              </Button>
          }

          <Button onClick={() => saveAppointment(false)}>
            {isNew ? 'Create' : 'Save'}
          </Button>


          <OldButton text="Cancel" extraClasses="hollow auto" onClick={() => props.onSavedAppointment(null)} />

          {!isNew ?
              <OldButton disabled={props.accessStatus === Enums.AccessStatus.LockedWithAccess || props.accessStatus === Enums.AccessStatus.LockedWithOutAccess}
                      text={`Cancel appointment`} extraClasses="hollow-warning auto left-margin" onClick={cancelAppointment} />
              : ''
          }
          <OldButton disabled={props.accessStatus === Enums.AccessStatus.LockedWithAccess || props.accessStatus === Enums.AccessStatus.LockedWithOutAccess || saving}
                  text={`${isNew ? 'Create' : 'Save'}`} extraClasses="auto left-margin" onClick={() => saveAppointment(false)} />
        </Flex>

      </div>

      <ConfirmAction options={confirmOptions} setOptions={setConfirmOptions} />

      <style jsx>{`
        .modal-container {
          width: 33rem;
        }
        .row {
          display: flex;
        }
        .align-end {
          justify-content: flex-end;
          align-items: flex-end;
        }
        .column {
          display: flex;
          flex-direction: column;
          width: 100%;
        }
        .margin1 {
          margin-top: 0.5rem;
        }

        .margin-bottom {
          margin-bottom: 0.5rem;
        }

        .left-padding {
          padding-left: 0.5em;
        }
        .right-padding {
          padding-right: 0.5em;
        }
        h3 {
          color: ${colors.darkPrimary};
          font-size: 16px;
          margin-top: 1rem;
        }
        .cancel {
          width: 6rem;
        }
        .cancel-appointment {
          width: 12rem;
        }
        .save {
          width: 6rem;
        }

        :global(.k-widget.k-toolbar.k-scheduler-toolbar) {
          z-index: 0;
        }

        .margin-left {
          margin-left: 8px;
        }

        .margin-left-small {
          margin-left: 2px;
        }

        .to-separator {
          margin: 45px 4px 0 4px;
        }
      
      `}</style>
    </div>*/
  );
}

export default ManageAppointment;
