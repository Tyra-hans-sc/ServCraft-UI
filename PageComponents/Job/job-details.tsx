import React, {useState, useEffect, useRef} from 'react';
import Fetch from '../../utils/Fetch';
import Helper from '../../utils/helper';
import ItemComments from '../../components/shared-views/item-comments';
import JobPropertiesColumn from '../../components/job/job-properties-column';
import ManageInventory from '../../components/modals/inventory/manage-inventory';
import CustomerContactLocationSelector from '../../components/selectors/customer/customer-contact-location-selector';
import ManageSignatures from '../../components/modals/jobcard/manage-signatures';
import * as Enums from '../../utils/enums';
import AuditLog from '../../components/shared-views/audit-log';
import Storage from '../../utils/storage';
import MiscService from '../../services/misc-service';
import ManageJobType from '../../components/modals/jobcard/manage-job-type';
import PS from '../../services/permission/permission-service';
import CustomerService from '../../services/customer/customer-service';
import FormDefinitionsForItem from '../../components/modals/form-definition/form-definitions-for-item';
import ChangeStore from '../../components/modals/jobcard/change-store';
import ConfirmAction from '../../components/modals/confirm-action';
import JobRating from '../../components/job/rating/job-rating';
import FeedbackService from '../../services/feedback-service';
import SCComboBox from '../../components/sc-controls/form-controls/sc-combobox';
import SCDatePicker from '../../components/sc-controls/form-controls/sc-datepicker';
import StoreSelector from '../../components/selectors/store/store-selector';
import {
    Box,
    Flex,
    // Text,
    // Card,
    // ScrollArea,
    // Button,
    Textarea,
    AccordionChevron, Anchor, SimpleGrid
} from "@mantine/core";
import { showNotification } from '@mantine/notifications';
import ManageJobInventoryComponent from '../JobInventory/ManageJobInventoryComponent';
import LinkedItemsList from "../Links/LinkedItemsList";
import JobInventoryInvoicedWidgetLite from '../JobInventory/JobInventoryInvoicedWidgetLite';
import featureService from '../../services/feature/feature-service';
import AccordionSection from "@/PageComponents/AccordionSection";
import { useQuery } from '@tanstack/react-query';
import companyService from '../../services/company-service';
import CardedAppointmentWidget from "@/components/sc-controls/widgets/new/carded-appointment-widget";
import constants from "@/utils/constants";
import styles from './job-details.module.css';
import TaskItems from "@/components/task/task-items";

// Request declared outside component per guidelines
const fetchCurrencySymbol = async () => {
  try {
    return await companyService.getCurrencySymbol();
  } catch {
    return 'R';
  }
};

// Minimal TS conversion: props typed as any to avoid broad refactors
function JobDetails(props: any) {

  const [masterOfficeAdminPermission] = useState(PS.hasPermission(Enums.PermissionName.MasterOfficeAdmin));

  // Fetch company currency symbol once at job level and pass down
  const { data: currencySymbol } = useQuery(['company', 'currencySymbol'], fetchCurrencySymbol, { refetchOnWindowFocus: false, staleTime: 12 * 60 * 60 * 1000 });
  const [editJobPermission] = useState(PS.hasPermission(Enums.PermissionName.EditJob));
  const [manageCostingPermission] = useState(PS.hasPermission(Enums.PermissionName.ManageCosting));

  const {data: hasStockControl} = useQuery(['hasStockControl'], () => featureService.hasFeature(constants.features.STOCK_CONTROL))

  const [savingItems, setSavingItems] = useState(false);

  const [confirmOptions, setConfirmOptions] = useState(Helper.initialiseConfirmOptions());

  const [nextStatuses, setNextStatuses] = useState<any[]>([]);
  const [nextStatusCanProceed, setNextStatusCanProceed] = useState(true);

  const [updateSignature, setUpdateSignature] = useState(0);
  const [updateForms, setUpdateForms] = useState(0);

  const getNextStatuses = () => {
    let items = props.nextJobStatuses.filter((x: any) => x.IsActive);
    setNextStatusCanProceed(!items.every((x: any) => x.CanProceed == false));

    items.map((item: any) => {
      item.disabled = !item.CanProceed;
      return item;
    });
    setNextStatuses(items);
  };

  useEffect(() => {
    getNextStatuses();
  }, [props.nextJobStatuses]);

  useEffect(() => {
    getNextStatuses();
    getStore();
    getFeedback();

    setHasEmployee(Storage.hasCookieValue(Enums.Cookie.employeeID));

  }, []);

  useEffect(() => {
    getJobStatusColors();
  }, [props.job.JobStatus]);

  const [jobStatusBackground, setJobStatusBackgound] = useState<string | undefined>(undefined);
  const [jobStatusColor, setJobStatusColor] = useState<string | undefined>(undefined);
  const [hasEmployee, setHasEmployee] = useState<boolean | undefined>(undefined);

  const getJobStatusColors = () => {
    let displayColor = props.job.JobStatus?.DisplayColor;

    const { color, backgroundColor } = MiscService.getStatusColors(displayColor);

    setJobStatusBackgound(backgroundColor);
    setJobStatusColor(color);
  };

  // JOB TYPE

  const [jobTypes, setJobTypes] = useState<any[]>(props.jobTypes);

  const setSelectedJobType = (e: any) => {
    props.updateJob("JobTypeID", e.ID);
  };

  const [showManageJobType, setShowManageJobType] = useState(false);

  const addNewJobType = () => {
    setShowManageJobType(true);
  };

  const onJobTypeSave = (jobType: any) => {
    if (jobType) {
      setJobTypes([...(jobTypes || []), jobType]);
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

  const [showManageInventory, setShowManageInventory] = useState<string | null>(null);

  const addNewInventory = (mode: string) => {
    setShowManageInventory(mode);
  };

  const onInventorySave = (inventory: any) => {
    if (inventory) {
      if (showManageInventory === "jobInventory") {
        addJobInventoryItem(inventory);
      }
    }
    setShowManageInventory(null);
  };

  const jobDesc = props.job.Description;

  const handleJobDescChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if(e.currentTarget) {
          props.updateJob("Description", e.currentTarget.value);
      }
  };

  const startDate = props.job.StartDate;

  const handleDateChange = (e: any) => {
    props.updateJob("StartDate", e.value);
  };

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

  const handleJobPropertyChange = (propertyName: string, value: any, orKeyValues?: any) => {
    props.updateJob(propertyName, value, orKeyValues);
  };

  /* CONTACT */

  const updateContact = (contact: any) => {
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

  const updateLocation = (location: any) => {
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

  const addJobInventoryItem = (jobInventoryItem: any) => {
    if (jobInventoryItem) {
      let oldInventory = !props.job.JobInventory ? [] : [...props.job.JobInventory];
      oldInventory.push(jobInventoryItem);
      props.updateJob("JobInventory", oldInventory);
    }
  };

  // STORES

  const [isMultiStore, setIsMultiStore] = useState(false);
  const [selectedStore, setSelectedStore] = useState<any>(props.job.Store ? props.job.Store : null);
  const [initialStore, setInitialStore] = useState<any>(props.job.Store ? props.job.Store : null);
  const [stores, setStores] = useState<any[]>([]);
  const [storesTotalResults, setStoresTotalResults] = useState<number | undefined>();

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

  const formButtonClick = () => {
    setShowFormsModal(true);
  };

  const [showFormsModal, setShowFormsModal] = useState(false);

  const formsClose = () => {
    setShowFormsModal(false);
    setUpdateForms(updateForms + 1);
  };

  // Job Rating

  const [feedbackList, setFeedbackList] = useState<any[]>();
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


  const onSavingItems = (val: boolean) => {
    props.onSavingItems && props.onSavingItems(val);
    setSavingItems(val);
  }


  // Manage partial (collapsed) vs full (expanded) state of Linked Items list
  const [linkedItemsCollapsed, setLinkedItemsCollapsed] = useState(true);
  const [detailsCollapsed, setDetailsCollapsed] = useState(false);

  /*const {height: jobDetailsContainerHeight, ref: jobDetailsContainerRef} = useElementSize();
  const [debouncedJobHeight] = useDebouncedValue(jobDetailsContainerHeight, 10000);*/

    return (
        <>
                    <Box maw={1100} mb={7} display={'block'} className={styles.inputMaxWidthOverride}>
                        <Flex gap={40} direction={{base: 'column-reverse', md: 'row'}} w={'100%'}>
                            <AccordionSection
                                label={'Customer Details'}
                                stayOpen
                            >
                                <CustomerContactLocationSelector selectedCustomer={props.customer}
                                                                 setSelectedCustomer={props.setCustomer}
                                                                 canChangeCustomer={false}
                                                                 selectedContact={props.contact}
                                                                 setSelectedContact={updateContact}
                                                                 selectedLocation={props.location}
                                                                 setSelectedLocation={updateLocation}
                                                                 detailsView={false} module={Enums.Module.JobCard as any}
                                                                 inputErrors={props.inputErrors}
                                                                 accessStatus={props.accessStatus}
                                                                 canEdit={hasEmployee && !props.job.IsClosed}
                                                                 iconMode
                                                                 canEditCustomerInNormalView={true}
                                                                 mt={0 as any} {...{} as any}
                                />
                            </AccordionSection>
                            {
                                hasStockControl && manageCostingPermission &&
                                <AccordionSection
                                    label={'Costing'}
                                    stayOpen
                                >
                                    <Flex align={'center'} justify={'space-between'} pt={'xs'} pr={'xs'} wrap={'wrap-reverse'} gap={'sm'}>
                                        <JobInventoryInvoicedWidgetLite
                                            job={props.job}
                                            onClick={() => props.setTab("Costing")}
                                        />

                                        <Anchor onClick={() => props.setTab("Costing")} c={'scBlue'} underline={'always'} fw={600} >
                                            Go to Costing
                                        </Anchor>
                                    </Flex>
                                </AccordionSection>

                            }
                        </Flex>

                        <Flex gap={40} direction={{base: 'column-reverse', md: 'row'}} w={'100%'} mt={30}>
                            <AccordionSection label={'Job Details'} initiallyOpen onClick={() => setDetailsCollapsed(p => !p)}>
                                <Flex gap={'sm'} align={'stretch'} direction={'column'} wrap={'wrap'}
                                      // ref={jobDetailsContainerRef}
                                >
                                    <Flex gap={'sm'} align={'stretch'} style={{flexGrow: 1}}
                                          direction={{base: 'column', xs: 'row', md: 'column'}} wrap={'wrap'}>
                                        <div style={{flexGrow: 1}}>
                                            <SCComboBox
                                                mt={0}
                                                addOption={(masterOfficeAdminPermission ? {
                                                    text: 'Add new job type',
                                                    action: () => addNewJobType()
                                                } : undefined)}
                                                label="Job Type"
                                                canSearch={false}
                                                options={jobTypes}
                                                placeholder="Select job type"
                                                value={(() => jobTypes?.find((x: any) => x.ID === props.job.JobTypeID))()}
                                                dataItemKey="ID"
                                                textField='Name'
                                                canClear={false}
                                                onChange={setSelectedJobType}
                                            />
                                        </div>
                                        <div style={{flexGrow: 1}}>
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
                                    <div style={{flexGrow: 1}}>
                                        <Textarea
                                            mt={0}
                                            label="Description of the job"
                                            maw={'100%'}
                                            autosize
                                            minRows={3}
                                            maxRows={15}
                                            value={jobDesc}
                                            readOnly={!hasEmployee || props.job.IsClosed || !editJobPermission}
                                            required={true}
                                            error={props.inputErrors.JobDescription}
                                            onChange={handleJobDescChange}
                                        />
                                    </div>
                                </Flex>
                            </AccordionSection>

                            <AccordionSection
                                              label={'Linked Items'}
                                              stayOpen
                                              chevron={<AccordionChevron style={{ transform: !linkedItemsCollapsed ? 'rotate(0deg)' : 'rotate(-180deg)', transition: 'transform 150ms ease' }} />}
                                              onClick={() => setLinkedItemsCollapsed((prev) => !prev)}
                            >
                                {/* Linked items list (project, quotes, invoices) */}
                                <LinkedItemsList
                                    jobId={props.job.ID}
                                    project={props.job.Project}
                                    projectId={props.job.ProjectID}
                                    customerId={props.customer?.ID}
                                    onChangeProject={(project) => props.updateJob(null, null, [
                                        { key: 'ProjectID', value: project ? project.ID : null },
                                        { key: 'Project', value: project ?? null },
                                    ])}
                                    onOpenQuote={props.onOpenQuote}
                                    onOpenInvoice={props.onOpenInvoice}
                                    refreshDeps={props.linkedItemsRefreshDeps}
                                    currencySymbol={currencySymbol}
                                    collapsed={linkedItemsCollapsed}
                                    onCollapsedChange={setLinkedItemsCollapsed}
                                    maxHeight={linkedItemsCollapsed ? /*debouncedJobHeight*/ detailsCollapsed ? 50 : 250 : '100%'}
                                />
                            </AccordionSection>
                        </Flex>

                        {
                            props.jobProperties.length > 0 &&
                            <Box mt={30}>
                                <AccordionSection
                                    label={'Additional details'}
                                >
                                    <SimpleGrid cols={{base: 1, sm: 2}}
                                                spacing={{base: 0, sm: 7, lg: 40}}
                                                verticalSpacing={{base: 0}}
                                    >

                                        {isMultiStore && !Helper.isNullOrUndefined(selectedStore) ?
                                            <Box>
                                                <StoreSelector
                                                    // mt={0 as any}
                                                    accessStatus={props.accessStatus}
                                                    disabled={!storeChangePermission}
                                                    setSelectedStore={setSelectedStore}
                                                    selectedStore={selectedStore}
                                                    options={stores as any}
                                                    canClear={false}
                                                    canSearch={false}
                                                    {...{} as any}
                                                />
                                            </Box> : ''
                                        }

                                        <JobPropertiesColumn job={props.job} jobProperties={props.jobProperties}
                                                             updateJobProperty={handleJobPropertyChange} inputErrors={props.inputErrors}
                                                             showAll={true} key={0} customFields={props.customFields} groupSize={2}
                                                             selectedStore={props.job.Store}
                                                             allowNonEmployee={false} accessStatus={props.accessStatus}
                                                             disabled={!editJobPermission} cypressCustomField={props.cypressCustomField}
                                                             hasVans={props.hasVans} inline
                                                             {...{} as any}
                                        />

                                    </SimpleGrid>

                                </AccordionSection>
                            </Box>
                        }


                        <Box mt={30}>
                            <AccordionSection
                                label={'Materials and Services'}
                            >
                                <ManageJobInventoryComponent
                                    accessStatus={props.accessStatus}
                                    allowNonEmployee={false}
                                    inputErrors={{JobInventory: props.inputErrors?.Materials}}
                                    customerZone={false}
                                    fromCreateJob={false}
                                    fromStatusChange={false}
                                    job={props.job}
                                    jobInventoryUsed={props.jobInventoryUsed}
                                    jobInventoryWorkedOn={props.jobInventoryWorkedOn}
                                    stockItemStatus={Enums.StockItemStatus.ItemUsed}
                                    key={'materialsSectionInAccordion'}
                                    onUpdate={(rowVersion: any, jobInventory: any, stockItemStatus: any) => props.updateJobInventory(rowVersion, jobInventory, stockItemStatus)}
                                    onCreateInvoice={props.onCreateInvoice}
                                    onSavingItems={onSavingItems}
                                    formIsDirty={props.formIsDirty}
                                />
                            </AccordionSection>
                        </Box>

                        <Box mt={30}>
                            <AccordionSection
                                label={'Customer Assets'}
                            >
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
                                    onUpdate={(rowVersion: any, jobInventory: any, stockItemStatus: any) => props.updateJobInventory(rowVersion, jobInventory, stockItemStatus)}
                                    onSavingItems={props.onSavingItems}
                                    formIsDirty={props.formIsDirty}
                                />
                            </AccordionSection>
                        </Box>

                        <Box mt={30}>
                            <AccordionSection
                                label={'Tasks'}
                            >

                                <TaskItems module={Enums.Module.JobCard} data={props.job} accessStatus={props.accessStatus} updateSignatures={updateSignature} updateForms={updateForms}
                                           requiredFormDefinitions={props.job.JobType ? props.job.JobType.FormDefinitions : []} />
                            </AccordionSection>
                        </Box>

                        <Box mt={30}>
                            <AccordionSection
                                label={'Appointments'}
                            >
                                <CardedAppointmentWidget
                                    storeID={props.job.StoreID}
                                    jobId={props.job.ID}
                                    customerID={props.customer.ID}
                                    selectedEmployees={props.appointmentEmployees}
                                    selectedStore={props.job.Store}
                                />

                                {/*<Appointments topMargin={false}
                                              module={Enums.Module.JobCard}
                                              moduleID={props.job.ID}
                                              customerID={props.customer.ID}
                                              accessStatus={props.accessStatus}
                                              onRefresh={props.onAppointmentRefresh}
                                              selectedStore={props.job.Store}
                                              selectedEmployees={props.appointmentEmployees}
                                              refreshAfterUpdates
                                />*/}
                            </AccordionSection>
                        </Box>

                        <Box mt={30}>
                            <AccordionSection
                                label={'Comments'}
                            >
                                <ItemComments
                                    itemID={props.job.ID}
                                    module={Enums.Module.JobCard}
                                    storeID={props.job.StoreID}
                                    triggerSave={props.triggerSaveComment}
                                    {...{} as any}
                                />
                            </AccordionSection>
                        </Box>

                        {
                            showJobRatings &&
                            <Box mt={30}>
                                <AccordionSection
                                    label={'Job rating'}
                                >
                                    <JobRating jobCard={props.job} feedbackList={feedbackList}/>
                                </AccordionSection>
                            </Box>
                        }

                        {
                            hasEmployee &&
                            <Box mt={30}>
                                <AccordionSection
                                    label={'History'}
                                >
                                    <AuditLog recordID={props.job.ID} retriggerSearch={props.retriggerAuditLog}/>
                                </AccordionSection>
                            </Box>
                        }


                        {showFormsModal ?
                            <FormDefinitionsForItem
                                customer={props.job.Customer}
                                onClose={formsClose}
                                itemID={props.job.ID}
                                itemModule={Enums.Module.JobCard}
                                linkedFormDefinitions={props.job.JobType ? props.job.JobType.FormDefinitions : []}
                                onlyLinkedForms={props.job.JobType ? props.job.JobType.OnlyLinkedForms : true}
                                {...{} as any}
                            /> : ''
                        }

                        {showSignaturesModal ?
                            <ManageSignatures job={props.job} setJob={props.setJob} saveJob={saveJobSignature}
                                              setShowModal={setShowSignaturesModal}
                                              accessStatus={props.accessStatus}/> : ''
                        }

                    </Box>
            {showManageJobType ?
                <ManageJobType isNew={true} onJobTypeSave={onJobTypeSave}
                               accessStatus={props.accessStatus} {...{} as any} /> : ''
            }

            {showManageInventory ?
                <ManageInventory isNew={true} isService={showManageInventory === "service"}
                                 onInventorySave={onInventorySave}
                                 addNewInventory={() => addNewInventory("service")}
                                 accessStatus={props.accessStatus} {...{} as any} /> : ''
            }

            {showChangeStoreModal ?
                <ChangeStore isRecurringJob={!Helper.isNullOrUndefined(props.job.JobScheduleID)} jobID={props.job.ID}
                             storeID={selectedStore ? selectedStore.ID : null} fromStoreName={storeSearch}
                             toStoreName={selectedStore ? selectedStore.Name : ''}
                             onStoreChange={onStoreChange} onCancel={onStoreChangeCancel}
                             accessStatus={props.accessStatus}/> : ''
            }

            <ConfirmAction options={confirmOptions} setOptions={setConfirmOptions}/>
        </>
    );
}

export default JobDetails;
