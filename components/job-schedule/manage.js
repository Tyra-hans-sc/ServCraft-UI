import React, { useState, useEffect, useContext, useMemo } from 'react';
import Router from 'next/router';
import { colors } from '../../theme';
import Fetch from '../../utils/Fetch';
import Helper from '../../utils/helper';
import Time from '../../utils/time';
import * as Enums from '../../utils/enums';
import Breadcrumbs from '../../components/breadcrumbs';
import ToastContext from '../../utils/toast-context';
import Tabs from '../tabs';
import JobScheduleHistory from './history';
import ConfirmAction from '../modals/confirm-action';
import JobScheduleItems from '../../components/job-schedule/job-schedule-items';
import ManageJobType from '../modals/jobcard/manage-job-type';
import PS from '../../services/permission/permission-service';
import CustomerContactLocationSelector from '../../components/selectors/customer/customer-contact-location-selector';
import constants from '../../utils/constants';
import SCSwitch from "../sc-controls/form-controls/sc-switch";
import SCDropdownList from '../sc-controls/form-controls/sc-dropdownlist';
import SCNumericInput from '../sc-controls/form-controls/sc-numeric-input';
import SCDatePicker from '../sc-controls/form-controls/sc-datepicker';
import SCTextArea from '../sc-controls/form-controls/sc-textarea';
import EmployeeMultiSelector from '../selectors/employee/employee-multiselector';
import StoreSelector from '../selectors/store/store-selector';
import Storage from '../../utils/storage';
import {Box, Card, Flex} from "@mantine/core";
import ToolbarButtons from "../../PageComponents/Button/ToolbarButtons";


function ManageJobSchedule(props) {

  const toast = useContext(ToastContext);

  const [masterOfficeAdminPermission] = useState(PS.hasPermission(Enums.PermissionName.MasterOfficeAdmin));

  const isNew = props.isNew;
  const [formIsDirty, setFormIsDirty] = useState(false);
  const [confirmOptions, setConfirmOptions] = useState(Helper.initialiseConfirmOptions());


  const [isMultiStore, setIsMultiStore] = useState(false);
  const [selectedStore, setSelectedStore] = useState(isNew ? null : props.jobSchedule.Store);
  const [stores, setStores] = useState([]);

  Helper.preventRouteChange(formIsDirty, setFormIsDirty, setConfirmOptions, saveJobSchedule);

  const getJobScheduleOnLoad = () => {

    let repeatAmount = 1;
    let selectedFrequency = Enums.getEnumStringValue(Enums.Frequency, Enums.Frequency.Daily);

    if (props.jobSchedule.Frequency) {
      let temp = props.jobSchedule.Frequency.toLowerCase();
      if (temp.startsWith('d')) {
        repeatAmount = parseInt(temp.substring(3));
        selectedFrequency = Enums.getEnumStringValue(Enums.Frequency, Enums.Frequency.Daily);
      } else if (temp.startsWith('w')) {
        repeatAmount = parseInt(temp.substring(4));
        selectedFrequency = Enums.getEnumStringValue(Enums.Frequency, Enums.Frequency.Weekly);
      } else if (temp.startsWith('m')) {
        repeatAmount = parseInt(temp.substring(5));
        selectedFrequency = Enums.getEnumStringValue(Enums.Frequency, Enums.Frequency.Monthly);
      }
    }

    return {
      ...props.jobSchedule, RepeatAmount: repeatAmount,
      SelectedFrequency: selectedFrequency,
      FrequencyText: selectedFrequency
    };
  };

  const getStore = async () => {
    const storesResult = await Fetch.get({
      url: `/Store/GetEmployeeStores?employeeID=${Storage.getCookie(Enums.Cookie.employeeID)}&searchPhrase=`,
    });
    setIsMultiStore(storesResult.TotalResults > 1);
    if (storesResult.TotalResults > 1) {
      // set store from job
      if (props.jobSchedule?.StoreID && !props.jobSchedule?.Store) {
        const storeResult = await Fetch.get({
          url: `/Store/${props.job.StoreID}`,
        });
        setSelectedStore(storeResult);
      }
    } else if(storesResult.Results?.length === 1) {
      setSelectedStore(storesResult.Results[0] || null)
    }
    setStores(storesResult.Results);
  };

  const [jobSchedule, setJobSchedule] = useState(isNew ? {
    'CreateBeforeDays': 0,
    'JobScheduleItems': [],
  } : getJobScheduleOnLoad());

  useEffect(() => {
    // searchServices();
    getStatuses();
    //getJobServiceTypeOption();
    getJobTypes();
    getStore();

    if (isNew) {

      if (props.module) {
        if (props.module == Enums.Module.JobCard) {
          setCanChangeCustomer(false);
          getJobCard(props.moduleID);
        }
      }

      setFrequencyText(Enums.getEnumStringValue(Enums.Frequency, Enums.Frequency.Daily));
      setSelectedFrequency(Enums.getEnumStringValue(Enums.Frequency, Enums.Frequency.Daily));
    } else {

      if (jobSchedule.Frequency) {
        let temp = jobSchedule.Frequency.toLowerCase();
        if (temp.startsWith('d')) {
          setFrequencyText(Enums.getEnumStringValue(Enums.Frequency, Enums.Frequency.Daily));
        } else if (temp.startsWith('w')) {
          setFrequencyText(Enums.getEnumStringValue(Enums.Frequency, Enums.Frequency.Weekly));
        } else if (temp.startsWith('m')) {
          setFrequencyText(Enums.getEnumStringValue(Enums.Frequency, Enums.Frequency.Monthly));
        }
      }
    }
  }, []);

  const [jobCopy, setJobCopy] = useState();
  const [canResetContact, setCanResetContact] = useState(true);
  const [canResetLocation, setCanResetLocation] = useState(true);

  const getJobCard = async (id) => {
    let job = await Fetch.get({
      url: `/Job/${id}`,
      caller: "components/job-schedule/manage.js:getJobCard()"
    });
    setJobCopy(job);
  };

  useEffect(() => {
    if (jobCopy) {
      selectCustomer(jobCopy.CustomerID);
      setCanResetContact(false);
      setCanResetLocation(false);
    }
  }, [jobCopy]);

  useEffect(() => {
    if (!canResetContact) {
      if (jobCopy) {
        setSelectedContact(jobCopy.Contact);
      }
    }
  }, [canResetContact]);

  useEffect(() => {
    if (!canResetLocation) {
      if (jobCopy) {
        setSelectedLocation(jobCopy.Location ? jobCopy.Location : null);
      }
    }
  }, [canResetLocation]);

  // CUSTOMERS

  const [canChangeCustomer, setCanChangeCustomer] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState(isNew ? undefined : jobSchedule.Customer ? jobSchedule.Customer : undefined);
  const [tracingCustomer, setTracingCustomer] = useState(isNew ? undefined : jobSchedule.Customer ? jobSchedule.Customer : undefined);
  // const [searching, setSearching] = useState(false);

  useEffect(() => {

    if (isNew || (selectedCustomer && !isNew && tracingCustomer.ID != selectedCustomer.ID)) {
      let nonAssetItems = jobSchedule.JobScheduleItems.filter(x => Helper.isNullOrUndefined(x.ProductID));

      setJobSchedule({
        ...jobSchedule,
        CustomerID: selectedCustomer ? selectedCustomer.ID : null,
        JobScheduleItems: nonAssetItems ? nonAssetItems : jobSchedule.JobScheduleItems,
      });
      setTracingCustomer(selectedCustomer);
    }
  }, [selectedCustomer]);

  const selectCustomer = async (customerID) => {
    if (customerID) {
      const customer = await Fetch.get({
        url: `/Customer/${customerID}`,
      });
      setSelectedCustomer(customer);
    }
    setFormIsDirty(true);
  };

  // CONTACTS

  const [selectedContact, setSelectedContact] = useState(isNew ? undefined : jobSchedule.Contact ? jobSchedule.Contact : undefined);

  useEffect(() => {
    setJobSchedule({
      ...jobSchedule,
      Contact: selectedContact,
      CustomerContactID: selectedContact ? selectedContact.ID : null,
    });
  }, [selectedContact]);

  // LOCATION

  const [selectedLocation, setSelectedLocation] = useState(isNew ? undefined : jobSchedule.Location ? jobSchedule.Location : undefined);

  useEffect(() => {
    setJobSchedule({
      ...jobSchedule,
      Location: selectedLocation,
      LocationID: selectedLocation ? selectedLocation.ID : null,
    });
  }, [selectedLocation]);

 

  // WORKFLOW

  const [showJobInventory, setShowJobInventory] = useState(false);

  const [jobItemSelection, setJobItemSelection] = useState();
  const [jobItemOrder, setJobItemOrder] = useState();
  const [jobSingleItem, setJobSingleItem] = useState();

  const getWorkflow = async (jobTypeID) => {
    let url = jobTypeID ? `/Workflow/GetWorkflowForJobType?jobTypeID=${jobTypeID}` : '/Workflow/GetDefaultWorkflow';
    const workflow = await Fetch.get({
      url: url
    });
    setJobItemSelection(workflow.JobItemSelection);
    setJobItemOrder(workflow.JobItemOrder);
    setJobSingleItem(workflow.SingleItem);
  };

  // JOB TYPE

  const getJobTypes = async () => {
    const request = await Fetch.get({
      url: `/JobType`
    });
    setJobTypes(request.Results);
  };

  // const [showJobTypeDropdown, setShowJobTypeDropdown] = useState(false);
  const [jobTypes, setJobTypes] = useState([]);
  // const [jobTypeSearch, setJobTypeSearch] = useState(isNew ? '' : jobSchedule.JobTypeName);
  // const [selectedJobTypeID, setSelectedJobTypeID] = useState(isNew ? null : jobSchedule.JobTypeID);
  const [selectedJobType, setSelectedJobType] = useState(isNew ? null : jobSchedule.JobType);

  useEffect(() => {
    if (selectedJobType) {
      setShowJobInventory(true);
      getWorkflow(selectedJobType.ID);
    } else {
      getWorkflow();
    }
  }, [selectedJobType]);

  // useEffect(() => {
  //   if (!Helper.isNullOrWhitespace(jobTypeSearch)) {
  //     setShowJobInventory(true);
  //   }
  // }, [jobTypeSearch]);

  // const handleJobTypeChange = (e) => {
  //   setJobTypeSearch(e.target.value);
  //   setFormIsDirty(true);
  // };

  const [showManageJobType, setShowManageJobType] = useState(false);

  const addNewJobType = () => {
    setShowManageJobType(true);
  };

  const onJobTypeSave = (jobType) => {
    if (jobType) {
      setJobTypes([...jobTypes, jobType]);
      setSelectedJobType(jobType);
      // setJobTypeSearch(jobType.Name);
      setFormIsDirty(true);
      toast.setToast({
        message: 'Job type created successfully',
        show: true,
        type: 'success'
      });
    }
    setShowManageJobType(false);
  };

  // JOB DESC

  const [jobDesc, setJobDesc] = useState(isNew ? '' : jobSchedule.JobDescription);

  // const handleJobDescChange = (e) => {
  //   setJobDesc(e.target.value);
  //   updateJobSchedule('JobDescription', e.target.value);
  //   setFormIsDirty(true);
  // };

  const handleJobDescChangeSC = (e) => {
    setJobDesc(e.value);
    updateJobSchedule('JobDescription', e.value);
    setFormIsDirty(true);
  };

  const [isActive, setIsActive] = useState(isNew ? true : jobSchedule.IsActive);
  const handleIsActiveChange = () => {
    setIsActive(!isActive);
    updateJobSchedule('IsActive', !isActive);
    setFormIsDirty(true);
  };

  // EMPLOYEES

  const [selectedEmployees, setSelectedEmployees] = useState(isNew ? [] : props.jobSchedule.Employees ? props.jobSchedule.Employees : []);

  // const selectEmployee = (employee) => {
  //   let employeeFound = selectedEmployees.find(x => x.ID == employee.ID);
  //   if (employeeFound) {
  //     let temp = selectedEmployees.filter(x => x.ID != employeeFound.ID);
  //     setSelectedEmployees([...temp]);
  //   } else {
  //     setSelectedEmployees([...selectedEmployees, employee]);
  //   }
  // };

  const selectEmployeesSC = (employees) => {
    setFormIsDirty(true);
    setSelectedEmployees(employees);
  };

  // STATUS

  const [statuses, setStatuses] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState(isNew ? null : jobSchedule.JobStatus ? jobSchedule.JobStatus : null);

  const getStatuses = async () => {
    const response = await Fetch.get({
      url: `/JobStatus`
    });
    setStatuses(response.Results);
  };

  // const handleStatusChange = (e) => {
  //   updateJobSchedule('JobCardStatusDescription', e.target.value);
  //   setFormIsDirty(true);
  // };

  // JOB SCHEDULE  

  const [repeatAmount, setRepeatAmount] = useState(isNew ? 1 : jobSchedule.RepeatAmount);

  const handleRepeatAmountChangeSC = (e) => {
    setRepeatAmount(parseInt(e.target.value));
    updateJobSchedule('RepeatAmount', parseInt(e.target.value));
    setFormIsDirty(true);
  };


  const handleRepeatAmountChange = (e) => {
    setRepeatAmount(parseInt(e.target.value));
    updateJobSchedule('RepeatAmount', parseInt(e.target.value));
    setFormIsDirty(true);
  };

  // const [nextRunDate, setNextRunDate] = useState(isNew ? Time.addDays(1, new Date()) : jobSchedule.NextRunDate);
  const [nextRunDate, setNextRunDate] = useState(isNew ? null : jobSchedule.NextRunDate);

  const handleNextRunDateChange = (day) => {
    setNextRunDate(Time.toISOString(day));
    setScheduleStartDate(Time.toISOString(day));
    setFormIsDirty(true);
  };

  const handleNextRunDateChangeSC = (e) => {
    setNextRunDate(Time.toISOString(e.value));
    setScheduleStartDate(Time.toISOString(e.value));
    setFormIsDirty(true);
  };

  const [scheduleStartDate, setScheduleStartDate] = useState(isNew ? null : jobSchedule.ScheduleStartDate);

  const [scheduleEndDate, setScheduleEndDate] = useState(isNew ? null : jobSchedule.ScheduleEndDate);

  const handleScheduleEndDateChange = (day) => {
    setScheduleEndDate(Time.toISOString(day));
    setFormIsDirty(true);
  };

  const handleScheduleEndDateChangeSC = (e) => {
    if (e && e.value) {
      setScheduleEndDate(Time.toISOString(e.value));
    }
    else {
      setScheduleEndDate(null);
    }
    setFormIsDirty(true);
  };

  const handleCreateBeforeDaysChangeSC = (e) => {
    let value = parseInt(e.value);
    if (value < 0 || Helper.isNullOrUndefined(value)) {
      value = 0;
    }
    updateJobSchedule('CreateBeforeDays', value);
    setFormIsDirty(true);
  };

  const handleCreateBeforeDaysChange = (e) => {
    let value = parseInt(e.target.value);
    if (value < 0 || Helper.isNullOrUndefined(value)) {
      value = 0;
    }
    updateJobSchedule('CreateBeforeDays', value);
    setFormIsDirty(true);
  };

  const findNextValidDate = (amountToAdd, frequency) => {

    let currentDate = Time.now();

    if (frequency === Enums.getEnumStringValue(Enums.Frequency, Enums.Frequency.Daily)) {
      currentDate.setDate(currentDate.getDate() + amountToAdd);
    } else if (frequency === Enums.getEnumStringValue(Enums.Frequency, Enums.Frequency.Weekly)) {
      currentDate.setDate(currentDate.getDate() + (amountToAdd * 7));
    } else {
      currentDate.setMonth(currentDate.getMonth() + amountToAdd);
    }

    return Time.toISOString(Time.getDate(currentDate));
  };

  const updateNextRunDate = () => {
    if (selectedFrequency && repeatAmount) {
      let nextRunDate = findNextValidDate(repeatAmount, selectedFrequency);
      setNextRunDate(Time.parseDate(nextRunDate));
      setScheduleStartDate(nextRunDate);
    }
  };

  const updateFrequency = () => {
    if (selectedFrequency && repeatAmount) {
      let temp;
      if (selectedFrequency == Enums.getEnumStringValue(Enums.Frequency, Enums.Frequency.Daily)) {
        temp = 'DAY';
      } else if (selectedFrequency == Enums.getEnumStringValue(Enums.Frequency, Enums.Frequency.Weekly)) {
        temp = 'WEEK';
      } else {
        temp = 'MONTH';
      }
      setFrequency(`${temp}${repeatAmount}`);
    }
  };

  const [frequency, setFrequency] = useState(isNew ? 'DAY1' : jobSchedule.Frequency);
  const frequencies = Enums.getEnumItems(Enums.Frequency, false);
  const [frequencyText, setFrequencyText] = useState(isNew ? Enums.getEnumStringValue(Enums.Frequency, Enums.Frequency.Daily) :
    jobSchedule.FrequencyText);

  const handleFrequencyChange = (e) => {
    setFrequencyText(e.target.value);
    updateJobSchedule('FrequencyText', e.target.value);
  };

  const [selectedFrequency, setSelectedFrequency] = useState(isNew ?
    Enums.getEnumStringValue(Enums.Frequency, Enums.Frequency.Daily) : jobSchedule.SelectedFrequency);

  const [frequencyLabel, setFrequencyLabel] = useState('days');

  const [canUpdateNextRunDate, setCanUpdateNextRunDate] = useState(isNew);

  useEffect(() => {
    if (canUpdateNextRunDate) {
      updateNextRunDate();
      updateFrequency();
    }
    setCanUpdateNextRunDate(true);
  }, [selectedFrequency, repeatAmount]);

  useEffect(() => {
    if (selectedFrequency) {
      if (selectedFrequency == Enums.getEnumStringValue(Enums.Frequency, Enums.Frequency.Daily)) {
        setFrequencyLabel('days');
      } else if (selectedFrequency == Enums.getEnumStringValue(Enums.Frequency, Enums.Frequency.Weekly)) {
        setFrequencyLabel('weeks');
      } else if (selectedFrequency == Enums.getEnumStringValue(Enums.Frequency, Enums.Frequency.Monthly)) {
        setFrequencyLabel('months');
      }
    }
  }, [selectedFrequency]);

  const [inputErrors, setInputErrors] = useState({});

  const updateJobSchedule = (field, value, setIsDirty = true) => {
    let temp = { ...jobSchedule };
    temp[field] = value;
    setJobSchedule(temp);
    setFormIsDirty(setIsDirty);
  };

  const validate = () => {

    let inputs = [
      { key: 'RepeatAmount', value: repeatAmount, required: true, gt: 0, type: Enums.ControlType.Number },
      { key: 'NextRunDate', value: nextRunDate, required: true, type: Enums.ControlType.Date },
      { key: 'NextRunDate', value: nextRunDate, gte: Time.getDate(Time.today()), type: Enums.ControlType.Date, df: 'yyyy-MM-dd' },
      { key: 'CreateBeforeDays', value: jobSchedule.CreateBeforeDays, gte: 0, type: Enums.ControlType.Number },
      { key: 'CreateBeforeDays', value: jobSchedule.CreateBeforeDays, lte: 60, type: Enums.ControlType.Number },
      { key: 'Customer', value: selectedCustomer, required: true, type: Enums.ControlType.Custom },
      { key: 'Contact', value: selectedContact, required: true, type: Enums.ControlType.Select },
      { key: 'Status', value: selectedStatus, required: true, type: Enums.ControlType.Custom },
      { key: 'JobDescription', value: jobDesc, required: true, type: Enums.ControlType.Text },
    ];

    if (scheduleEndDate) {
      inputs = [...inputs,
      { key: 'ScheduleEndDate', value: scheduleEndDate, gt: nextRunDate, type: Enums.ControlType.Date, df: 'yyyy-MM-dd' },];
    }

    // if (showInventoryDropdown) {
    //   inputs = [...inputs,
    //   { key: 'Service', value: selectedService, required: true, type: Enums.ControlType.Custom },
    //   ];
    // }

    // if (selectedJobTypeID) {
    inputs = [...inputs,
    { key: 'JobType', value: selectedJobType, required: true, type: Enums.ControlType.Custom },
    ];
    // }

    const { isValid, errors } = Helper.validateInputs(inputs);
    setInputErrors(errors);

    return isValid;
  };

  const [saving, setSaving] = useState(false);

  async function saveJobSchedule() {
    setSaving(true);

    let isValid = validate();
    if (isValid) {
      let result = {};
      let contactID = selectedContact ? selectedContact.ID : null;
      let locationID = selectedLocation ? selectedLocation.ID : null;

      let jobScheduleToSave = {
        ...jobSchedule,
        CustomerID: selectedCustomer.ID,
        CustomerContactID: contactID,
        LocationID: locationID,
        JobCardStatusID: selectedStatus.ID,
        // InventoryID: selectedService,
        JobTypeID: selectedJobType.ID,
        NextRunDate: nextRunDate,
        ScheduleStartDate: scheduleStartDate,
        ScheduleEndDate: scheduleEndDate,
        Cron: null,
        Frequency: frequency,
        IsActive: isActive,
        Employees: selectedEmployees,
        StoreID: selectedStore?.ID ?? null
      };

      if (isNew) {
        result = await Fetch.post({
          url: `/JobSchedule`,
          params: jobScheduleToSave,
          toastCtx: toast
        });
      } else {
        result = await Fetch.put({
          url: '/JobSchedule',
          params: jobScheduleToSave,
          toastCtx: toast
        });
      }

      if (result.ID) {

        if (isNew) {
          Helper.mixpanelTrack(constants.mixPanelEvents.createJobSchedule, {
            "jobScheduleID": result.ID
          });
        }

        toast.setToast({
          message: 'Recurring job saved successfully',
          show: true,
          type: 'success'
        });

        setFormIsDirty(false);

        if (isNew) {
          await Helper.waitABit();
          Helper.nextRouter(Router.push, `/job-schedule/${result.ID}`);
        } else {
          setJobSchedule(result);
        }
      } else {
        setSaving(false);
      }
    } else {
      toast.setToast({
        message: 'There are errors on the page',
        show: true,
        type: Enums.ToastType.error
      });
      setSaving(false);
    }

    if (!isNew) {
      setSaving(false);
    }

    return isValid;
  }

  const [selectedTab, setSelectedTab] = useState("Recurring Job");

  const jobTypeLinkedStatuses = useMemo(() => {
    return statuses.filter(x => !selectedJobType || x.WorkflowID === selectedJobType.WorkflowID);
  }, [selectedJobType, statuses]);

  const jobScheduleDetails = () => {
    return (
      <>

        <Flex gap={'sm'} mt={'sm'} maw={1000} direction={{base: 'column', xs: 'row'}}>
          <Box miw={'30%'}>
            <SCDropdownList
                mt={0}
                options={frequencies}
                canClear={false}
                value={frequencyText}
                onChange={setSelectedFrequency}
                required={true}
                label="Frequency"
            />
          </Box>
          <Box miw={'30%'}>
            <SCNumericInput
                mt={0}
                label={`Every x ${frequencyLabel}`}
                format={Enums.NumericFormat.Integer}
                required={true}
                value={repeatAmount}
                error={inputErrors.RepeatAmount}
                onChange={handleRepeatAmountChangeSC}
            />
          </Box>

          <Box miw={'30%'}>
            <SCNumericInput
                mt={0}
                label={`Create job x days before`}
                name="CreateBeforeDays"
                format={Enums.NumericFormat.Integer}
                required={true}
                value={jobSchedule.CreateBeforeDays}
                error={inputErrors.CreateBeforeDays}
                onChange={handleCreateBeforeDaysChangeSC}
            />
          </Box>
        </Flex>

        <Flex gap={'sm'} mt={'sm'} wrap={'wrap'} maw={1000} direction={{base: 'column', xs: 'row'}}>
          <Box miw={'30%'}>
            <SCDatePicker
                mt={0}
                name="NextRunDate"
                label="Next run date"
                required={true}
                changeHandler={handleNextRunDateChangeSC}
                value={nextRunDate}
                error={inputErrors.NextRunDate}
                minDate={Time.parseDate(Time.today())}
            />
          </Box>
          <Box miw={'30%'}>
            <SCDatePicker
                mt={0}
                name="ScheduleEndDate"
                label="End date"
                required={false}
                changeHandler={handleScheduleEndDateChangeSC}
                value={scheduleEndDate}
                error={inputErrors.ScheduleEndDate}
                minDate={nextRunDate}
                canClear={true}
            />
          </Box>
        </Flex>

        {/*<div className="column">

          <div className="schedule-row">
            <div className="schedule-column">
              <div className="schedule-input">
                <SCDropdownList
                  options={frequencies}
                  canClear={false}
                  value={frequencyText}
                  onChange={setSelectedFrequency}
                  required={true}
                  label="Frequency"
                />
              </div>
            </div>
            <div className="schedule-column">
              <div className="schedule-input">
                <SCNumericInput
                  label={`Every x ${frequencyLabel}`}
                  format={Enums.NumericFormat.Integer}
                  required={true}
                  value={repeatAmount}
                  error={inputErrors.RepeatAmount}
                  onChange={handleRepeatAmountChangeSC}
                />
              </div>
            </div>
            <div className="schedule-column">
              <div className="schedule-input">
                <SCNumericInput
                  label={`Create job x days before`}
                  name="CreateBeforeDays"
                  format={Enums.NumericFormat.Integer}
                  required={true}
                  value={jobSchedule.CreateBeforeDays}
                  error={inputErrors.CreateBeforeDays}
                  onChange={handleCreateBeforeDaysChangeSC}
                />
              </div>
            </div>
          </div>

          <div className="schedule-row">
            <div className="schedule-column">
              <div className="schedule-input">
                <SCDatePicker
                  name="NextRunDate"
                  label="Next run date"
                  required={true}
                  changeHandler={handleNextRunDateChangeSC}
                  value={nextRunDate}
                  error={inputErrors.NextRunDate}
                  minDate={Time.parseDate(Time.today())}
                />
              </div>
            </div>
            <div className="schedule-column">
              <div className="schedule-input">
                <SCDatePicker
                  name="ScheduleEndDate"
                  label="End date"
                  required={false}
                  changeHandler={handleScheduleEndDateChangeSC}
                  value={scheduleEndDate}
                  error={inputErrors.ScheduleEndDate}
                  minDate={nextRunDate}
                  canClear={true}
                />
              </div>
            </div>
            <div className="schedule-column"></div>
          </div>
        </div>*/}

        <div className="column">
          <div className="">
            <h1>Job Detail</h1>

            {isMultiStore ?
              <div className="store">
                <StoreSelector
                  accessStatus={props.accessStatus}
                  setSelectedStore={setSelectedStore}
                  selectedStore={selectedStore}
                  options={stores}
                  canClear={false}
                  canSearch={false}
                />

              </div> : ''
            }

            <CustomerContactLocationSelector isNew={isNew} canResetContact={canResetContact} canResetLocation={canResetLocation}
              selectedCustomer={selectedCustomer} setSelectedCustomer={setSelectedCustomer} canChangeCustomer={canChangeCustomer}
              selectedContact={selectedContact} setSelectedContact={setSelectedContact}
              selectedLocation={selectedLocation} setSelectedLocation={setSelectedLocation}
              inputErrors={inputErrors} accessStatus={props.accessStatus}
            />

            <div className="section">
              <SCDropdownList
                addOption={(masterOfficeAdminPermission ? { text: 'Add new job type', action: () => addNewJobType() } : "")}
                onChange={(e) => {
                  setSelectedJobType(e);
                  setFormIsDirty(true);
                  setSelectedStatus(null);
                }}
                error={inputErrors.JobType}
                label="Job Type"
                required={true}
                options={jobTypes}
                placeholder="Select job type"
                value={selectedJobType}
                dataItemKey="ID"
                textField="Name"
              />

              <SCDropdownList
                onChange={(e) => {
                  setSelectedStatus(e);
                  setFormIsDirty(true);
                }}
                label="Status"
                placeholder="Select required status"
                required={true}
                name="JobCardStatusDescription"
                options={jobTypeLinkedStatuses}
                value={selectedStatus}
                error={inputErrors.Status}
                dataItemKey="ID"
                textField="Description"
                disabled={!selectedJobType}
              // groupField='WorkflowName'
              />

              {showManageJobType ?
                <ManageJobType isNew={true} onJobTypeSave={onJobTypeSave} accessStatus={props.accessStatus} /> : ''
              }

              <SCTextArea
                onChange={handleJobDescChangeSC}
                error={inputErrors.jobDesc}
                label="Description of the job"
                required={true}
                value={jobDesc}
              />

              <EmployeeMultiSelector
                error={inputErrors.Employees}
                selectedEmployees={selectedEmployees}
                setSelectedEmployees={selectEmployeesSC}
              />

              {showJobInventory ? //|| !showJobTypeDropdown
                <JobScheduleItems jobSchedule={jobSchedule} updateJobSchedule={updateJobSchedule} accessStatus={props.accessStatus}
                  jobItemSelection={jobItemSelection} jobItemOrder={jobItemOrder} jobSingleItem={jobSingleItem}
                /> : ''
              }

              {!isNew ?
                <div className="switch">
                  <SCSwitch label="Active" checked={isActive} onToggle={() => handleIsActiveChange()} />
                </div> : ''
              }

              {isNew ?
                  <ToolbarButtons ml={0} mt={'sm'} align={'start'} buttonGroups={[[
                    {
                      type: 'button',
                      onClick: saveJobSchedule,
                      disabled: saving,
                      isBusy: saving,
                      children: ['Create Recurring Job']
                    }
                  ]]} />
                // <Button text="Create Recurring Job" extraClasses="fit-content" onClick={saveJobSchedule} disabled={saving} />
                : ''
              }

            </div>
          </div>
        </div>

        <ConfirmAction options={confirmOptions} setOptions={setConfirmOptions} />

        <style jsx>{`
        .section {
        }
        .schedule-row {
          display: flex;
          flex-direction: row;
          max-width: ${constants.maxFormWidth};
        }
        .schedule-column {
          display: flex;
          flex-basis: 0;
          flex-direction: column;
          flex-grow: 1;
        }

        .schedule-column + .schedule-column {
          margin-left: 1.25rem;
        }
        .schedule-input {
          /* display: flex; */
          width: 100%
        }
        .schedule-input + .schedule-input {
          margin-left: 0.5rem;
        }
        .schedule-label {
          display: flex;
          margin-top: 2rem;
          align-items: center;
          padding: 0 0.5rem;
          white-space: nowrap;
        }
        .right-padding {
          padding-right: 0.5em;
        }
        .column {
          display: flex;
          flex-direction: column;
          width: 100%;
        }
        .row {
          display: flex;
          justify-content: space-between;
        }
        .cancel-link {
          color: ${colors.bluePrimary};
          cursor: pointer;
          font-size: 0.875rem;
        }
        .actions {
          display: flex;
        }
        .actions :global(.button){
          margin-left: 0.5rem;
          margin-top: 0;
          padding: 0 1rem;
          white-space: nowrap;
        }
        .switch {
          flex-direction: row-reverse;
          display: flex;
          margin-top: 1rem;
          max-width: 500px;
        }
      `}</style>
      </>
    );
  }

  return (
    <div>
      <Flex
          justify={'space-between'}
          px={isNew ? 0 : 'sm'}
          mt={isNew ? 0 : 'sm'}
      >
        <div>
          {isNew ?
            <Breadcrumbs currPage={{ text: 'Create Recurring Job', link: '/job-schedule/create', type: 'create' }} /> :
            <Breadcrumbs currPage={{ text: `${jobSchedule.JobScheduleNumber}`, link: `/job-schedule/${jobSchedule.ID}`, type: 'edit' }} />
          }
        </div>
        {isNew ?
          '' :
          <div className="actions">
            <ToolbarButtons buttonGroups={[[
              {
                type: 'button',
                children: [saving ? "Saving" : "Save"],
                onClick: saving ? null : saveJobSchedule,
                isBusy: saving,
                disabled: props.accessStatus === Enums.AccessStatus.LockedWithAccess || props.accessStatus === Enums.AccessStatus.LockedWithOutAccess
              }
            ]]} />
            {/*<Button disabled={props.accessStatus === Enums.AccessStatus.LockedWithAccess || props.accessStatus === Enums.AccessStatus.LockedWithOutAccess}
              text={saving ? "Saving" : "Save"} onClick={saving ? null : saveJobSchedule} />*/}
          </div>
        }
      </Flex>

      {isNew ?
        <>
          {(() => {
            return jobScheduleDetails();
          })()}
        </>
        :
        <>
          <Box mx={'sm'}>
            <Tabs
                selectedTab={selectedTab}
                setSelectedTab={setSelectedTab}
                tabs={[
                  { text: 'Recurring Job', suppressCount: true },
                  { text: 'History', suppressCount: true }
                ]}
                useNewTabs
            />
          </Box>

          <Box bg={'gray.1'}
               py={{base: 5, xs: 8, sm: 'md'}}
               px={{base: 5, xs: 8}}
               mih={`calc(100vh - ${135}px)`}
          >
            <Card
                p={'md'}
                px={{base: 1, xs: 5, sm: 'sm'}}
                radius={'md'}
                // mah={`100%`}
            >
              {(() => {
                switch (selectedTab) {
                  case "Recurring Job":
                    return jobScheduleDetails();
                  case "History":
                    return <JobScheduleHistory jobScheduleID={jobSchedule.ID} />
                  default:
                    return "";
                }
              })()}
            </Card>
          </Box>

        </>
      }

      <style jsx>{`
        .column {
          display: flex;
          flex-direction: column;
          width: 100%;
        }
        .row {
          display: flex;
          justify-content: space-between;
        }
        .actions {
          display: flex;
        }
        .actions :global(.button){
          margin-left: 0.5rem;
          margin-top: 0;
          padding: 0 1rem;
          white-space: nowrap;
        }
      `}</style>
    </div>
  );
}

export default ManageJobSchedule;
