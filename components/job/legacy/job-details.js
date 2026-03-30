import React, { useState, useEffect, useRef } from 'react';
import { colors, layout } from '../../../theme';
import TextInput from '../../text-input';
import Fetch from '../../../utils/Fetch';
import Time from '../../../utils/time';
import Helper from '../../../utils/helper';
import ItemComments from '../../shared-views/item-comments';
import JobPropertiesColumn from '../job-properties-column';
import ManageInventory from '../../modals/inventory/manage-inventory';
import CustomerContactLocationSelector from '../../selectors/customer/customer-contact-location-selector';
import ManageSignatures from '../../modals/jobcard/manage-signatures';
import * as Enums from '../../../utils/enums';
import TaskItems from '../../task/task-items';
import AuditLog from '../../shared-views/audit-log';
import Storage from '../../../utils/storage';
import MiscService from '../../../services/misc-service';
import ManageJobType from '../../modals/jobcard/manage-job-type';
import PS from '../../../services/permission/permission-service';
import CustomerService from '../../../services/customer/customer-service';
import FormDefinitionsForItem from '../../modals/form-definition/form-definitions-for-item';
import ChangeStore from '../../modals/jobcard/change-store';
import ConfirmAction from '../../modals/confirm-action';
import JobRating from '../rating/job-rating';
import LinkToProject from '../../project/link-to-project';
import FeedbackService from '../../../services/feedback-service';
import ProjectService from '../../../services/project/project-service';
import SCComboBox from '../../sc-controls/form-controls/sc-combobox';
import SCDatePicker from '../../sc-controls/form-controls/sc-datepicker';
import SCTextArea from '../../sc-controls/form-controls/sc-textarea';
import StoreSelector from '../../selectors/store/store-selector';
import SCDropdownList from '../../sc-controls/form-controls/sc-dropdownlist';
import constants from '../../../utils/constants';
import { Box, ColorSwatch, Flex, Tooltip, Text } from "@mantine/core";
import { showNotification } from '@mantine/notifications';
import ManageJobInventoryComponent from '../../../PageComponents/JobInventory/ManageJobInventoryComponent';
import ToolbarButtons from "../../../PageComponents/Button/ToolbarButtons";
import LinkItem from "../../../PageComponents/Links/LinkItem";
import JobInventoryInvoicedWidgetLite from '../../../PageComponents/JobInventory/JobInventoryInvoicedWidgetLite';
import featureService from '../../../services/feature/feature-service';

function JobDetails(props) {

  const [customerPermission] = useState(PS.hasPermission(Enums.PermissionName.Customer));
  const [masterOfficeAdminPermission] = useState(PS.hasPermission(Enums.PermissionName.MasterOfficeAdmin));
  const [editJobPermission] = useState(PS.hasPermission(Enums.PermissionName.EditJob));
  const [manageCostingPermission] = useState(PS.hasPermission(Enums.PermissionName.ManageCosting));

  const [hasStockControl, setHasStockControl] = useState();

  const [savingItems, setSavingItems] = useState(false);

  const [confirmOptions, setConfirmOptions] = useState(Helper.initialiseConfirmOptions());

  const [nextStatuses, setNextStatuses] = useState([]);
  const [nextStatusCanProceed, setNextStatusCanProceed] = useState(true);

  const [updateSignature, setUpdateSignature] = useState(0);
  const [updateForms, setUpdateForms] = useState(0);

  const getNextStatuses = () => {
    let items = props.nextJobStatuses.filter(x => x.IsActive);
    setNextStatusCanProceed(!items.every(x => x.CanProceed == false));

    items.map((item) => {
      item.disabled = !item.CanProceed;
    });
    setNextStatuses(items);
  };

  useEffect(() => {
    getNextStatuses();
  }, [props.nextJobStatuses]);

  useEffect(() => {
    getNextStatuses();
    getStore();
    // getJobServiceTypeOption();
    getFormDefinitions();
    getFeedback();

    setHasEmployee(Storage.hasCookieValue(Enums.Cookie.employeeID));

    featureService.getFeature(constants.features.STOCK_CONTROL).then(feature => {
      setHasStockControl(!!feature);
    });
  }, []);

  useEffect(() => {
    getJobStatusColors();
  }, [props.job.JobStatus]);

  const [jobStatusBackground, setJobStatusBackgound] = useState({});
  const [jobStatusColor, setJobStatusColor] = useState({});
  const [hasEmployee, setHasEmployee] = useState();

  const getJobStatusColors = () => {
    let displayColor = props.job.JobStatus?.DisplayColor;

    const { color, backgroundColor } = MiscService.getStatusColors(displayColor);

    setJobStatusBackgound(backgroundColor);
    setJobStatusColor(color);
  };

  // JOB TYPE

  const [jobTypes, setJobTypes] = useState(props.jobTypes);
  // const [jobTypeSearch, setJobTypeSearch] = useState(props.job.JobTypeName);
  // const [showJobTypeDropdown, setShowJobTypeDropdown] = useState(false);

  const setSelectedJobType = (e) => {
    props.updateJob("JobTypeID", e.ID);
  };

  // const handleJobTypeChange = (e) => {
  //   setJobTypeSearch(e.target.value);
  // };

  const [showManageJobType, setShowManageJobType] = useState(false);

  const addNewJobType = () => {
    setShowManageJobType(true);
  };

  const onJobTypeSave = (jobType) => {
    if (jobType) {
      setJobTypes([...jobTypes, jobType]);
      // setJobTypeSearch(jobType.Name);
      showNotification({
        title: 'Saved',
        message: 'Job type created successfully',
        color: 'scBlue',
        autoClose: 3000,
        withCloseButton: true,
      });
      props.updateJob("JobTypeID", jobType.ID);
    }
    setShowManageJobType(false);
  };

  

  const [showManageInventory, setShowManageInventory] = useState(null);

  const addNewInventory = (mode) => {
    setShowManageInventory(mode);
  };

  const onInventorySave = (inventory) => {
    if (inventory) {
    
      if (showManageInventory === "jobInventory") {
        addJobInventoryItem(inventory);
      
      }
    }
    setShowManageInventory(null);
  };

  const jobDesc = props.job.Description;

  const handleJobDescChange = (e) => {
    props.updateJob("Description", e.value);
  };



  const startDate = props.job.StartDate;

  const handleDateChange = (e) => {
    props.updateJob("StartDate", e.value);
  };

  const slaStartDate = props.job.SLAStartDateTime ? Time.toISOString(props.job.SLAStartDateTime, false) : '';
  const slaEndDate = props.job.SLAEndDateTime ? Time.toISOString(props.job.SLAEndDateTime, false) : '';

  const [showSLADates] = useState(props.job.SLAStartDateTime || props.job.SLAEndDateTime);

  const [submitting, setSubmitting] = useState(false);

  async function submitComment() {

    if (props.accessStatus === Enums.AccessStatus.LockedWithAccess || props.accessStatus === Enums.AccessStatus.LockedWithOutAccess) {
      return;
    }

    setSubmitting(true);
    props.submitComment();
    setSubmitting(false);
  }

  const handleJobPropertyChange = (propertyName, value, orKeyValues) => {
    props.updateJob(propertyName, value, orKeyValues);
  };

  /* CONTACT */

  const updateContact = (contact) => {
    props.setContact(contact);
    if (!!props?.contact && !!contact && props.contact.ID !== contact.ID) {
      props.updateJob(null, null, [{
        key: 'Contact',
        value: contact
      }, {
        key: 'CustomerContactID',
        value: contact.ID
      }]);
    }
  };

  /* LOCATION */

  const updateLocation = (location) => {
    props.setLocation(location);

    if (CustomerService.hasLocationChanged(props.location, location)) {
      props.updateJob(null, null, [{
        key: 'Location',
        value: location
      }, {
        key: 'LocationID',
        value: location ? location.ID : null
      }]);
    }
  };

  const [showSignaturesModal, setShowSignaturesModal] = useState(false);

  const addJobInventoryItem = (jobInventoryItem) => {
    if (jobInventoryItem) {
      let oldInventory = !props.job.JobInventory ? [] : [...props.job.JobInventory];
      oldInventory.push(jobInventoryItem);
      props.updateJob("JobInventory", oldInventory);
    }
    // setAddingJobInventory(false);
  };

  // STORES

  const [isMultiStore, setIsMultiStore] = useState(false);
  const [selectedStore, setSelectedStore] = useState(props.job.Store ? props.job.Store : null);
  const [initialStore, setInitialStore] = useState(props.job.Store ? props.job.Store : null);
  const [stores, setStores] = useState([]);
  const [storesTotalResults, setStoresTotalResults] = useState();

  const [storeChangePermission] = useState(PS.hasPermission(Enums.PermissionName.StoreChangeJob));
  const firstStoreUpdate = useRef(true);

  const getStore = async () => {
    const storesResult = await Fetch.get({
      url: `/Store/GetEmployeeStores?employeeID=${Storage.getCookie(Enums.Cookie.employeeID)}&searchPhrase=`,
    });
    setIsMultiStore(storesResult.TotalResults > 1);
    if (storesResult.TotalResults > 1) {
      // set store from job
      if (!Helper.isNullOrUndefined(props.job.StoreID) && !props.job.Store) {
        const storeResult = await Fetch.get({
          url: `/Store/${props.job.StoreID}`,
        });
        setSelectedStore(storeResult);
        setInitialStore(storeResult);
        // setStoreSearch(storeResult.Name);
      }

      setStores(storesResult.Results);
      setStoresTotalResults(storesResult.TotalResults);
    }
  };

  const [searching, setSearching] = useState(false);
  const [storeSearch, setStoreSearch] = useState(props.job.Store ? props.job.Store.Name : '');

  const searchStores = async () => {
    setSearching(true);
    const storesResult = await Fetch.get({
      url: `/Store/GetEmployeeStores?employeeID=${Storage.getCookie(Enums.Cookie.employeeID)}&searchPhrase=${storeSearch}`,
    });
    setStores(storesResult.Results);
    setStoresTotalResults(storesResult.TotalResults);
    setSearching(false);
  };

  const [showChangeStoreModal, setShowChangeStoreModal] = useState(false);

  useEffect(() => {
    if (selectedStore) {
      if (firstStoreUpdate.current) {
        firstStoreUpdate.current = false;
        return;
      }

      // open modal
      if (initialStore.ID != selectedStore.ID) {
        tryJobStoreChange();
      }
    }
  }, [selectedStore]);

  const tryJobStoreChange = () => {
    if (props.formIsDirty) {
      setConfirmOptions({
        ...Helper.initialiseConfirmOptions(),
        showCancel: false,
        confirmButtonText: "Ok",
        display: true,
        heading: "Job has changes",
        text: "Cannot change store until changes have been saved"
      });
    } else {
      setShowChangeStoreModal(true);
    }
  };

  const onStoreChange = () => {
    setShowChangeStoreModal(false);
    props.refreshJob();
  };

  const onStoreChangeCancel = () => {
    setShowChangeStoreModal(false);
    setSelectedStore(initialStore);
  };

  const saveJobSignature = async () => {
    await props.saveJob();
    setUpdateSignature(updateSignature + 1);
  };

  // Forms

  const [formDefinitions, setFormDefinitions] = useState([]);

  const getFormDefinitions = async () => {
    const request = await Fetch.post({
      url: `/FormDefinition/GetFormDefinitions`,
      params: {
      }
    });
    let items = request.Results;
    if (items && items.length > 0) {
      setFormDefinitions(items);
    }
  };

  const formButtonClick = () => {
    setShowFormsModal(true);
  };

  const [showFormsModal, setShowFormsModal] = useState(false);

  const formsClose = () => {
    setShowFormsModal(false);
    setUpdateForms(updateForms + 1);
  };

  // Job Rating

  const [feedbackList, setFeedbackList] = useState();
  const [showJobRatings, setShowJobRatings] = useState(false);

  const getFeedback = async () => {

    const feedbackResponse = await FeedbackService.getFeedbackList(props.job.ID, Enums.Module.JobCard);
    let data = feedbackResponse.data;
    let total = feedbackResponse.total;

    if (total > 0) {
      data = Helper.sortObjectArrayOnDate(data, "CompletedDate", true);
      setShowJobRatings(true);
    } else {
      let hasFeedback = await FeedbackService.hasFeedbackForTenant();
      if (!hasFeedback) {
        setShowJobRatings(true);
      }
    }

    setFeedbackList(data);
  };

  // Link to Project

  const [showProjectLink, setShowProjectLink] = useState(false);
  const [projectLinkLockdown, setProjectLinkLockdown] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);

  const getLinkedProject = async (id) => {
    let project = await ProjectService.getProject(id);
    setSelectedProject(project);
  };

  const linkJobToProject = (project) => {
    setSelectedProject(project);
    props.setJob({
      ...props.job,
      'ProjectID': project ? project.ID : null,
    });
  };

  const setupProjectLink = async () => {
    let showLink = false;
    let projectID = props.job.ProjectID;

    if (projectID) {
      showLink = true;
    } else {
      let hasProjects = await ProjectService.customerHasProjects(props.customer.ID);
      if (hasProjects) {
        showLink = true;
      }
    }

    if (showLink) {
      setShowProjectLink(true);
      if (projectID) {
        getLinkedProject(projectID);
      }
      setProjectLinkLockdown(false);
    }
  };

  useEffect(() => {
    setupProjectLink();
  }, []);

  const onSavingItems = (val) => {
    props.onSavingItems && props.onSavingItems(val);
    setSavingItems(val);
  }

  return (
    <div >

      <Flex justify={{ base: 'stretch', xs: 'space-between' }} direction={{ base: 'column-reverse', xs: 'row' }} gap={'sm'}>
        <Box style={{ flexGrow: 1 }}>
          <CustomerContactLocationSelector selectedCustomer={props.customer} setSelectedCustomer={props.setCustomer} canChangeCustomer={false}
            selectedContact={props.contact} setSelectedContact={updateContact} selectedLocation={props.location} setSelectedLocation={updateLocation}
            detailsView={false} module={Enums.Module.JobCard} inputErrors={props.inputErrors} accessStatus={props.accessStatus}
            canEdit={hasEmployee && !props.job.IsClosed} iconMode canEditCustomerInNormalView={true}
            mt={0}
          />
        </Box>

        <Flex direction={'column'} gap={'sm'} align={{ base: 'stretch', xs: 'end' }} style={{ flexGrow: 1 }}>
          <Flex justify={{ base: 'end', xs: 'end' }} wrap={'wrap'} gap={'sm'}>
            {hasStockControl && manageCostingPermission && <JobInventoryInvoicedWidgetLite job={props.job} onClick={() => props.setTab("Costing")} />}
            <ToolbarButtons
              ml={0}
              buttonGroups={[[
                {
                  show: formDefinitions.length > 0,
                  onClick: formButtonClick,
                  children: "Forms",
                  type: 'button'
                },
                {
                  show: 'hasEmployee',
                  type: 'button',
                  disabled: props.accessStatus === Enums.AccessStatus.LockedWithAccess || props.accessStatus === Enums.AccessStatus.LockedWithOutAccess || !editJobPermission,
                  children: 'Signatures',
                  variant: 'default',
                  onClick: () => setShowSignaturesModal(!showSignaturesModal),
                }
              ]]}
            />

            <Tooltip color={'scBlue'} disabled={nextStatusCanProceed} label={nextStatusCanProceed ? '' : `You do not have access to change to another status`} position={'bottom'}
              events={{ hover: true, focus: true, touch: true }}
            >
              <Box w={{ base: '100%', xs: 'auto' }}>
                <div className="status">
                  <SCDropdownList
                    mt={0}
                    required
                    options={nextStatuses}
                    onChange={props.checkSetNewStatus}
                    value={props.job.JobStatus}
                    // hint={nextStatusCanProceed ? '' : `You are not permitted to proceed to the next status`}
                    disabled={savingItems || props.accessStatus === Enums.AccessStatus.LockedWithAccess || props.accessStatus === Enums.AccessStatus.LockedWithOutAccess
                      || !nextStatusCanProceed || props.job.IsClosed}
                    dataItemKey={"ID"}
                    textField={"Description"}
                    // iconMantine={(() => {
                    //   let displayColor = props.job.JobStatus.DisplayColor;
                    //   const { color, backgroundColor } = MiscService.getStatusColors(displayColor);
                    //   return (<>
                    //     <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    //       <circle cx="12" cy="12" r="11" stroke={color} stroke-width="1" fill={backgroundColor} />
                    //     </svg>
                    //   </>);
                    // })()}
                    itemRenderMantine={(item) => {
                      let displayColor = item.dataItem.DisplayColor;
                      const { color, backgroundColor } = MiscService.getStatusColors(displayColor);
                      return <Flex align={'center'} gap={'xs'} mih={30}>
                        <ColorSwatch bg={backgroundColor} size={13} color={color}
                        // withShadow={false}
                        // styles={{root: {border: `1px solid ${backgroundColor}`}}}
                        />
                        <Text size={'sm'}>{item.dataItem.Description}</Text>
                      </Flex>
                      /*(<div style={{ height: "100%", width: "100%", display: "flex", verticalAlign: "middle" }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="12" cy="12" r="11" stroke={color} stroke-width="1" fill={backgroundColor} />
                        </svg>
                        <span style={{ marginLeft: "0.5rem" }}>
                  {item.dataItem.Description}
                </span>
                      </div>);*/
                    }}
                    hideSelected={true}
                    suppressInternalValueChange={true}
                  />
                </div>
              </Box>

            </Tooltip>

          </Flex>


          {isMultiStore && !Helper.isNullOrUndefined(selectedStore) ?
            <Box>
              <StoreSelector
                mt={0}
                accessStatus={props.accessStatus}
                disabled={!storeChangePermission}
                setSelectedStore={setSelectedStore}
                selectedStore={selectedStore}
                options={stores}
                canClear={false}
                canSearch={false}
              />
            </Box> : ''
          }

          {
            showProjectLink && <Box
              display={'block'}
              style={{ flexGrow: 1 }}
              ml={'auto'}
            // miw={'150px'}
            >
              <LinkItem setSelected={linkJobToProject} selectedItem={selectedProject} module={Enums.Module.Project} customerID={props.customer.ID} lockdown={projectLinkLockdown} size={{ actionIcon: 'sm', label: 'md' }} />
              {/*<LinkToProject legacyBehavior={true} selectedProject={selectedProject} onProjectSelect={linkJobToProject} customerID={props.customer.ID}
                               lockdown={projectLinkLockdown} dropdownDirection={'down'} />*/}
            </Box>
            /*showProjectLink ?
              <div className={`project`}>
                <LinkToProject legacyBehavior={true} selectedProject={selectedProject} onProjectSelect={linkJobToProject} customerID={props.customer.ID}
                               lockdown={projectLinkLockdown} dropdownDirection={'down'} />
              </div>
              : ''*/
          }

          {showFormsModal ?
            <FormDefinitionsForItem
              customer={props.job.Customer}
              onClose={formsClose}
              itemID={props.job.ID}
              itemModule={Enums.Module.JobCard}
              linkedFormDefinitions={props.job.JobType ? props.job.JobType.FormDefinitions : []}
              onlyLinkedForms={props.job.JobType ? props.job.JobType.OnlyLinkedForms : true}
            /> : ''
          }

          {showSignaturesModal ?
            <ManageSignatures job={props.job} setJob={props.setJob} saveJob={saveJobSignature}
              setShowModal={setShowSignaturesModal} accessStatus={props.accessStatus} /> : ''
          }

        </Flex>

      </Flex>

      <div style={{ maxWidth: constants.maxFormWidth }}>
        <div className="heading">
          Job Details
        </div>
        <Flex gap={'sm'} align={'stretch'} direction={{ base: 'column', md: 'row' }} wrap={'wrap'}>
          <Flex gap={'sm'} align={'stretch'} style={{ flexGrow: 1 }} direction={{ base: 'column', xs: 'row', md: 'column' }} wrap={'wrap'}>
            <div style={{ flexGrow: 1 }}>
              <SCComboBox
                mt={0}
                addOption={(masterOfficeAdminPermission ? { text: 'Add new job type', action: () => addNewJobType() } : "")}
                label="Job Type"
                canSearch={false}
                options={jobTypes}
                placeholder="Select job type"
                value={(() => jobTypes?.find(x => x.ID === props.job.JobTypeID))()}
                dataItemKey="ID"
                textField='Name'
                canClear={false}
                onChange={setSelectedJobType}
              />
            </div>
            <div style={{ flexGrow: 1 }}>
              <SCDatePicker
                mt={0}
                label='Start Date'
                required={true}
                value={startDate}
                disabled={!hasEmployee || props.job.IsClosed || !editJobPermission}
                changeHandler={handleDateChange}
              />
            </div>
          </Flex>
          <div style={{ flexGrow: 1 }}>
            <SCTextArea
              mt={0}
              label="Description of the job"
              maw={{ base: '100vw' }}
              // width={'100%'}
              value={jobDesc}
              readOnly={!hasEmployee || props.job.IsClosed || !editJobPermission}
              required={true}
              error={props.inputErrors.JobDescription}
              onChange={handleJobDescChange}
            />
          </div>
        </Flex>

        {/* dont show sla dates ever */}
        {false && showSLADates ?
          <div className="row">
            <div className="column">
              <TextInput
                label="SLA Start Date"
                value={slaStartDate}
                readOnly={!hasEmployee || props.job.IsClosed || !editJobPermission}
              />
            </div>
            <div className="column">
              <TextInput
                label="SLA End Date"
                value={slaEndDate}
                readOnly={!hasEmployee || props.job.IsClosed || !editJobPermission}
              />
            </div>
          </div>
          : ''
        }

      </div>

      <ManageJobInventoryComponent
        accessStatus={props.accessStatus}
        allowNonEmployee={false}
        inputErrors={props.inputErrors}
        customerZone={false}
        fromCreateJob={false}
        fromStatusChange={false}
        job={props.job}
        jobInventoryUsed={props.jobInventoryUsed}
        jobInventoryWorkedOn={props.jobInventoryWorkedOn}
        stockItemStatus={Enums.StockItemStatus.WorkedOn}
        key={10}
        onUpdate={(rowVersion, jobInventory, stockItemStatus) => props.updateJobInventory(rowVersion, jobInventory, stockItemStatus)}
        onSavingItems={props.onSavingItems}
        formIsDirty={props.formIsDirty}
      />

      <ManageJobInventoryComponent
        accessStatus={props.accessStatus}
        allowNonEmployee={false}
        inputErrors={{ JobInventory: props.inputErrors?.Materials }}
        customerZone={false}
        fromCreateJob={false}
        fromStatusChange={false}
        job={props.job}
        jobInventoryUsed={props.jobInventoryUsed}
        jobInventoryWorkedOn={props.jobInventoryWorkedOn}
        stockItemStatus={Enums.StockItemStatus.ItemUsed}
        key={11}
        onUpdate={(rowVersion, jobInventory, stockItemStatus) => props.updateJobInventory(rowVersion, jobInventory, stockItemStatus)}
        onCreateInvoice={props.onCreateInvoice}
        onSavingItems={onSavingItems}
        formIsDirty={props.formIsDirty}
      />

      <div style={{ maxWidth: constants.maxFormWidth }}>
        {props.jobProperties.length > 0 ?
          props.showProperties
            ? <div className="more" onClick={() => props.setShowProperties(false)}>
              Show less
            </div>
            : <div className="more" onClick={() => props.setShowProperties(true)}>
              Show more
            </div> : ''
        }
        <div style={{ display: (props.showProperties ? "initial" : "none") }}>


          <JobPropertiesColumn job={props.job} jobProperties={props.jobProperties} updateJobProperty={handleJobPropertyChange} inputErrors={props.inputErrors}
            showAll={true} key={0} customFields={props.customFields} groupSize={2} selectedStore={props.job.Store}
            allowNonEmployee={false} accessStatus={props.accessStatus}
            disabled={!editJobPermission} cypressCustomField={props.cypressCustomField} hasVans={props.hasVans}
          />
        </div>
      </div>

      <TaskItems module={Enums.Module.JobCard} data={props.job} accessStatus={props.accessStatus} updateSignatures={updateSignature} updateForms={updateForms}
        requiredFormDefinitions={props.job.JobType ? props.job.JobType.FormDefinitions : []} />

      <div className="comments-and-history">
        <ItemComments
          itemID={props.job.ID}
          module={Enums.Module.JobCard}
          storeID={props.job.StoreID}
          triggerSave={props.triggerSaveComment}

        // comments={!hasEmployee && props.comments ? props.comments.filter(x => true/*x.UserType === Enums.UserType.Supplier*/) : props.comments}
        // handleCommentChange={handleCommentChange}
        // newComment={props.newComment}
        // submitComment={submitComment}
        // submitting={submitting}
        // canLoadMoreComments={props.canLoadMoreComments}
        // loadMoreComments={props.loadMoreComments}
        />

        {showJobRatings ?
          <JobRating jobCard={props.job} feedbackList={feedbackList} /> : ''
        }

      </div>
      {hasEmployee ?
        <AuditLog recordID={props.job.ID} retriggerSearch={props.retriggerAuditLog} />
        : ""}

      {showManageJobType ?
        <ManageJobType isNew={true} onJobTypeSave={onJobTypeSave} accessStatus={props.accessStatus} /> : ''
      }

      {showManageInventory ?
        <ManageInventory isNew={true} isService={showManageInventory === "service"} onInventorySave={onInventorySave}
          addNewInventory={() => addNewInventory("service")} accessStatus={props.accessStatus} /> : ''
      }

      {showChangeStoreModal ?
        <ChangeStore isRecurringJob={!Helper.isNullOrUndefined(props.job.JobScheduleID)} jobID={props.job.ID}
          storeID={selectedStore ? selectedStore.ID : null} fromStoreName={storeSearch} toStoreName={selectedStore ? selectedStore.Name : ''}
          onStoreChange={onStoreChange} onCancel={onStoreChangeCancel}
          accessStatus={props.accessStatus} /> : ''
      }

      {/*{showProjectLink ?
        <div className={`${isMultiStore && !Helper.isNullOrUndefined(selectedStore) ? 'project-under-store' : 'project'}`}>
          <LinkToProject legacyBehavior={true} selectedProject={selectedProject} onProjectSelect={linkJobToProject} customerID={props.customer.ID}
            lockdown={projectLinkLockdown} dropdownDirection={'down'} />
        </div>
        : ''
      }*/}

      <ConfirmAction options={confirmOptions} setOptions={setConfirmOptions} />

      <style jsx>{`
        .more {
          color: ${colors.bluePrimary};
          cursor: pointer;
          display: flex;
          justify-content: flex-start;
          margin-top: 1rem;
          width: max-content;
        }
        .container {
          margin-top: 0.5rem;
          position: relative;
        }
        .customer-contact-container {
          /* min-height: 9rem; */
        }
        .row {
          display: flex;
        }
        .column {
          display: flex;
          flex-basis: 0;
          flex-direction: column;
          flex-grow: 1;
        }
        .column :global(.textarea-container) {
          height: 100%;
        }
        .column + .column {
          margin-left: 1.25rem;
        }
        .edit-img {
          margin-top: -1rem;
          margin-left: 1rem;
          cursor: pointer;
        }
        .location-display {
          width: 50%;
        }
        .location {
          margin-top: 0;
        }
        .contact {
          color: ${colors.blueGrey};
        }
        .contact h1 {
          color: ${colors.darkPrimary};
          font-size: 2rem;
          margin: 0 0 0.75rem;
        }
        .contact p {
          margin: 3px 0 0;
          opacity: 0.8;
        }
        .contact div {
          margin: 3px 0 0;
          opacity: 0.8;
        }
        .new-comment {
          position: relative;
        }
        .new-comment :global(.textarea-container){
          height: 5rem;
        }
        .new-comment img{
          cursor: pointer;
          position: absolute;
          right: 1rem;
          top: 1rem;
        }
        .loader {
          border-color: rgba(113, 143, 162, 0.2);
          border-left-color: ${colors.blueGrey};
          display: block;
          margin-bottom: 1rem;
          margin-top: 1rem;
        }

        .comment {
          background-color: ${colors.white};
          border-radius: ${layout.cardRadius};
          box-sizing: border-box;
          color: ${colors.blueGrey};
          display: flex;
          flex-direction: column;
          justify-content: center;
          margin-top: 0.5rem;
          padding: 1.25rem 1rem;
          position: relative;
          width: 100%;
        }
        .comment-info {
          align-items: center;
          display: flex;
          margin-bottom: 4px;
        }
        .job {
          color: ${colors.bluePrimary};
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
        .text {
          white-space: pre-wrap;
        }
        .edit {
          margin-top: 0.2rem;
          margin-left: 1rem;
        }
        .repeat {
          position: absolute;
          right: 30rem;
          top: -0.5rem;
          width: 7rem;
          margin-right: 1rem;
          display: flex;
        }
        .help-dialog {
          display: flex;
          align-items: flex-end;
          padding-left: 0.1rem;
        }
        .forms {
          position: absolute;
          right: 31rem;
          top: 0.5rem;
          width: 7rem;
        }

        .forms :global(.button) {
          margin-top: 0.5rem;
        }

        .signature {
          position: absolute;
          right: 21rem;
          top: -0.5rem;
          width: 9rem;
        }
        .status {
          /*position: absolute;
          right: 0;
          top: 0.5rem;
          width: 20rem;*/
        }
        /* .status :global(.input-container) {
          background-color: ${jobStatusBackground};
        } */
        .status :global(input){
          color: ${jobStatusColor};
          background-color: ${jobStatusBackground};
        }
        .status :global(label){
          color: ${colors.white};
          opacity: 0.8;
        }

        .store {
          position: absolute;
          right: 0;
          top: 4rem;
          width: 20rem;
        }

        .project {
          //position: absolute;
          //right: 0;
          //top: 4rem;
          //width: 20rem;
          flex-grow: 1;
        }

        .project-under-store {
          position: absolute;
          right: 0;
          top: 9em;
          width: 20rem;
        }

        .table-container {
          overflow-x: auto;
          width: 100%;
          display: flex;
          flex-direction: column;
        }
        .table {
          border-collapse: collapse;
          margin-top: 1.5rem;
          width: 100%;
        }
        .table thead tr {
          background-color: ${colors.backgroundGrey};
          height: 3rem;
          border-radius: ${layout.cardRadius};
          width: 100%;
        }
        .table th {
          color: ${colors.darkPrimary};
          font-size: 0.75rem;
          font-weight: normal;
          padding: 4px 1rem 4px 0; 
          position: relative;
          text-align: left;
          text-transform: uppercase;
          transform-style: preserve-3d;
          user-select: none;
          white-space: nowrap;
        }
        .table th.number-column {
          padding-right: 0;
          text-align: right;
        }
        .table th:last-child {
          padding-right: 1rem;
          text-align: right;
        }
        .table th:first-child {
          padding-left: 0.5rem;
          text-align: left;
        }
        .table .spacer {
          height: 0.75rem !important;
        }
        .table tr {
          height: 4rem;
          cursor: pointer;
        }
        .table td {
          font-size: 12px;
          padding-right: 1rem;
        }
        .table td.number-column {
          padding-right: 0;
          text-align: right;
        }
        .table tr:nth-child(even) td {
          background-color: ${colors.white};
        }
        .table td:last-child {
          border-radius: 0 ${layout.buttonRadius} ${layout.buttonRadius} 0;
          text-align: right;
        }
        .table td:last-child :global(div){
          margin-left: auto;
        }
        .table td:first-child {
          border-radius: ${layout.buttonRadius} 0 0 ${layout.buttonRadius};
          padding-left: 1rem;
          text-align: left;
        }
        .table td:first-child :global(div){
          margin-left: 0;
        }

        .header-container {
          background-color: ${colors.backgroundGrey};
          border-radius: ${layout.cardRadius};
          box-sizing: border-box;
          color: ${colors.darkPrimary};
          display: flex;
          flex-direction: row;
          justify-content: center;
          margin-top: 0.5rem;
          padding: 1.25rem 1rem;
          position: relative;
          width: 100%;
        }

        .header-item-move {
          width: 1%;
          min-width: 30px;
        }
        .header-item-code {
          width: 5%;
          min-width: 80px;
        }
        .header-item-desc {
          width: 55;
        }
        .header-item-discount {
          width: 5%;
          min-width: 120px;
        }
        .header-item-taxrate {
          width: 5%;
          min-width: 120px;
        }
        .header-item-qty {
          width: 5%;
        }
        .header-item-price {
          width: 5%;
          min-width: 120px;
        }
        .header-item-amt {
          width: 5%;
          min-width: 120px;
        }
        .header-item-delete {
          width: 1%;
          min-width: 30px;
        }

        .comments-and-history {
          padding-right: 3rem;
        }

      `}</style>
    </div>
  )
}

export default JobDetails;
