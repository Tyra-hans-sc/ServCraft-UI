import React, { useState, useEffect, useContext, useRef } from 'react';
import { colors, layout } from '../../theme';

import SCDropdownList from '../sc-controls/form-controls/sc-dropdownlist';
import SCDatePicker from '../sc-controls/form-controls/sc-datepicker';
import SCTextArea from '../sc-controls/form-controls/sc-textarea';
import SCInput from '../sc-controls/form-controls/sc-input';
import SCNumericInput from '../sc-controls/form-controls/sc-numeric-input';
import SCCheckbox from '../sc-controls/form-controls/sc-checkbox';
import StoreSelector from '../selectors/store/store-selector';

import ButtonDropdown from '../button-dropdown';
import Button from '../button';
import Fetch from '../../utils/Fetch';
import * as Enums from '../../utils/enums';
import Helper from '../../utils/helper';
import Time from '../../utils/time';
import ToastContext from '../../utils/toast-context';
import ItemComments from '../shared-views/item-comments';
import ManageForm from '../modals/form/manage-form';
import CustomerContactLocationSelector from '../selectors/customer/customer-contact-location-selector';
import CreateCustomer from '../modals/customer/create-customer';
import AuditLog from '../shared-views/audit-log';
import Storage from '../../utils/storage';
import PS from '../../services/permission/permission-service';
import TaskItems from '../task/task-items';
import CustomerService from '../../services/customer/customer-service';
import OptionService from '../../services/option/option-service';
import InventorySelector from '../selectors/inventory/inventory-selector';
import EmployeeSelector from '../selectors/employee/employee-selector';
import constants from '../../utils/constants';
import QueryTypeSelector from '../selectors/query/query-type-selector';
import QueryStatusSelector from '../selectors/query/query-status-selector';
import QueryForm from "../../PageComponents/Query/QueryForm";
import {Box, Flex} from "@mantine/core";

function QueryDetails({ query, updateQuery, updateQueryInBulk,
    setSubmitState,
    onSubmitState,
    onSaved,
  queryPriorities,
  triggerSaveComment,
  customFields, customer, setCustomer, emptyCustomer, webformGenerated, setWebformGenerated, showInventory, contact, setContact, location, setLocation, inputErrors, accessStatus }) {

  const toast = useContext(ToastContext);

  const [masterOfficeAdminPermission] = useState(PS.hasPermission(Enums.PermissionName.MasterOfficeAdmin));

  useEffect(() => {
    getStore();
    // if (query.QueryStatus) {
    //   getStatusColors(query.QueryStatus);
    // }
    getFormDefinitions();
    getCustomFields();
  }, []);

  useEffect(() => {
    setStoreChangeDisabled(query.IsDraft == false);
  }, [query.IsDraft]);

  const handleFieldChange = (e) => {
    updateQuery(e.name, e.value);
  };

  const handleCustomDate1Change = (e) => {
    updateQuery('CustomDate1', Time.toISOString(Time.updateDate(query.CustomDate1, e.value)));
  };

  const handleCustomDate2Change = (e) => {
    updateQuery('CustomDate2', Time.toISOString(Time.updateDate(query.CustomDate2, e.value)));
  };

  // CUSTOM FIELDS

  const [field1Label, setField1Label] = useState('');
  const [field2Label, setField2Label] = useState('');
  const [field3Label, setField3Label] = useState('');
  const [field4Label, setField4Label] = useState('');
  const [date1Label, setDate1Label] = useState('');
  const [date2Label, setDate2Label] = useState('');
  const [filter1Label, setFilter1Label] = useState('');
  const [filter2Label, setFilter2Label] = useState('');
  const [number1Label, setNumber1Label] = useState('');
  const [number2Label, setNumber2Label] = useState('');

  const getCustomFields = () => {

    let { fieldLabel1, fieldLabel2, fieldLabel3, fieldLabel4, dateFieldLabel1, dateFieldLabel2,
      filterFieldLabel1, filterFieldLabel2, numberFieldLabel1, numberFieldLabel2 } =
      OptionService.getQueryCustomFields(customFields);

    setField1Label(fieldLabel1);
    setField2Label(fieldLabel2);
    setField3Label(fieldLabel3);
    setField4Label(fieldLabel4);
    setDate1Label(dateFieldLabel1);
    setDate2Label(dateFieldLabel2);
    setFilter1Label(filterFieldLabel1);
    setFilter2Label(filterFieldLabel2);
    setNumber1Label(numberFieldLabel1);
    setNumber2Label(numberFieldLabel2);
  };

  // QUERY TYPE

  const [selectedQueryType, setSelectedQueryType] = useState(query.QueryType);

  // const [firstRun, setFirstRun] = useState(true);

  const handleQueryTypeChange = (queryType) => {
    setSelectedQueryType(queryType);
    updateQuery('QueryTypeID', queryType ? queryType.ID : null);
  };

  // useEffect(() => {
  //   // if (!firstRun && selectedQueryType) {
  //   //   getQueryStatus();
  //   // } else {
  //   //   getQueryStatus(false);
  //   // }
  //   setFirstRun(false);
  // }, [selectedQueryType]);

  // const addNewQueryType = () => {
  //   setLookupType('queryType');
  //   setShowCreateLookup(true);
  // };

  // QUERY STATUS

  // const [queryStatuses, setQueryStatuses] = useState([]);
  const [selectedQueryStatus, setSelectedQueryStatus] = useState(query.QueryStatus);

  const handleQueryStatusChange = (queryStatus) => {
    setSelectedQueryStatus(queryStatus);
    updateQuery('QueryStatusID', queryStatus ? queryStatus.ID : null);
    // if (queryStatus) {
    //   getStatusColors(queryStatus);
    // }
  };

  // const getQueryStatus = async (update = true) => {

  //   if (selectedQueryType) {
  //     const queryStatuses = await Fetch.get({
  //       url: `/QueryStatus?queryTypeID=${selectedQueryType.ID}`
  //     });

  //     setQueryStatuses(queryStatuses.Results ? queryStatuses.Results : []);

  //     if (queryStatuses.Results.length == 1) {
  //       let result = queryStatuses.Results[0];
  //       setSelectedQueryStatus(result);
  //       getStatusColors(result);

  //       if (update) {
  //         updateQueryInBulk([
  //           { 'field': 'QueryStatusID', 'value': result.ID },
  //           { 'field': 'QueryTypeID', 'value': selectedQueryType.ID },
  //         ]);
  //       }
  //     } else {
  //       if (update) {
  //         setSelectedQueryStatus(null);
  //         getStatusColors(null);
  //       }

  //       if (selectedQueryType && update) {
  //         updateQuery('QueryTypeID', selectedQueryType.ID);
  //       }
  //     }
  //   } else {
  //     setQueryStatuses([]);
  //     updateQuery('QueryTypeID', null);
  //   }
  // };

  // const [statusBackground, setStatusBackgound] = useState({});
  // const [statusColor, setStatusColor] = useState({});

  // const getStatusColors = (status) => {
  //   if (status) {
  //     let displayColor = status.DisplayColor;

  //     const { color, backgroundColor } = MiscService.getStatusColors(displayColor);

  //     setStatusBackgound(backgroundColor);
  //     setStatusColor(color);
  //   } else {
  //     setStatusBackgound(null);
  //     setStatusColor(null);
  //   }
  // };

  // const addNewQueryStatus = () => {
  //   setLookupType('queryStatus');
  //   setShowCreateLookup(true);
  // };

  // QUERY PRIORITY

  //const [queryPriorityText, setQueryPriorityText] = useState(Enums.getEnumStringValue(Enums.QueryPriority, query.Priority));
  const [selectedPriority, setSelectedPriority] = useState(Enums.getEnumStringValue(Enums.QueryPriority, query.Priority));

  const handleQueryPriorityChange = (queryPriority) => {
    updateQuery('Priority', queryPriority);
  };

  const queryFollowUpDate = query.FollowupDate;

  const handleQueryFollowUpDateChange = (e) => {
    updateQuery('FollowupDate', Time.toISOString(e.value));
  };

  const queryReference = query.Reference;

  const handleQueryReferenceChange = (e) => {
    updateQuery('Reference', e.value);
  };

  const queryDesc = query.Description;

  const handleQueryDescChange = (e) => {
    updateQuery('Description', e.value);
  };

  const [selectedInventory, setSelectedInventory] = useState(query.Inventory);

  const handleInventoryChange = (inventory) => {
    setSelectedInventory(inventory);
    updateQuery('InventoryID', inventory ? inventory.ID : null);
  };

  const [localEmployee, setLocalEmployee] = useState(query.Employee);

  const assignEmployee = (employee) => {
    setLocalEmployee(employee);
    updateQueryInBulk([
      { 'field': 'Employee', 'value': employee },
      { 'field': 'EmployeeID', 'value': employee ? employee.ID : null },
    ]);
  };

  // const handleCommentChange = (e) => {
  //   setNewComment(e.target.value);
  // };

  // const [submitting, setSubmitting] = useState(false);

  // async function saveComment() {
  //   if (accessStatus === Enums.AccessStatus.LockedWithAccess || accessStatus === Enums.AccessStatus.LockedWithOutAccess) {
  //     return;
  //   }
  //   setSubmitting(true);
  //   submitComment();
  //   setSubmitting(false);
  // }

  // const [showCreateLookup, setShowCreateLookup] = useState(false);
  // const [lookupType, setLookupType] = useState('');

  // const onLookupItemSave = (item) => {
  //   if (item) {
  //     if (lookupType == 'queryType') {
  //       setQueryTypes([...queryTypes, item]);
  //       setSelectedQueryType(item);
  //       toast.setToast({
  //         message: 'Query type saved successfully',
  //         show: true,
  //         type: Enums.ToastType.success
  //       });
  //     } else if (lookupType == 'queryStatus') {
  //       setQueryStatuses([...queryStatuses, item]);
  //       setSelectedQueryStatus(item);;
  //       updateQuery('QueryStatusID', item.ID);
  //       toast.setToast({
  //         message: 'Query status saved successfully',
  //         show: true,
  //         type: Enums.ToastType.success
  //       });
  //       getStatusColors(item);
  //     }
  //   }

  //   setShowCreateLookup(false);
  // };

  // STORES

  const [isMultiStore, setIsMultiStore] = useState(false);
  const [selectedStore, setSelectedStore] = useState(query.Store);
  // const [stores, setStores] = useState([]);
  // const [storesTotalResults, setStoresTotalResults] = useState();
  const [storeChangeDisabled, setStoreChangeDisabled] = useState(true);

  const getStore = async () => {
    const storesResult = await Fetch.get({
      url: `/Store/GetEmployeeStores?employeeID=${Storage.getCookie(Enums.Cookie.employeeID)}&searchPhrase=`,
    });
    setIsMultiStore(storesResult.TotalResults > 1);

    if (storesResult.TotalResults > 1) {
      if (!Helper.isNullOrUndefined(query.StoreID) && !query.Store) {
        const storeResult = await Fetch.get({
          url: `/Store/${query.StoreID}`,
        });
        setSelectedStore(storeResult);
        // setStoreSearch(storeResult.Name);
        // searchStores();
      }
    }
  };

  const storeFirstRunRef = useRef(false);

  useEffect(() => {
    if (selectedStore) {
      // setStoreSearch(selectedStore.Name);
      if (storeFirstRunRef.current && JSON.stringify(query.Store) !== JSON.stringify(selectedStore)) {
        updateQueryInBulk([
          { 'field': 'Store', 'value': selectedStore },
          { 'field': 'StoreID', 'value': selectedStore.ID },
        ]);
      }
      storeFirstRunRef.current = true;
    }
  }, [selectedStore]);

  // const [searching, setSearching] = useState(false);
  // const [storeSearch, setStoreSearch] = useState('');

  // const searchStores = async () => {
  //   setSearching(true);
  //   const storesResult = await Fetch.get({
  //     url: `/Store/GetEmployeeStores?employeeID=${Storage.getCookie(Enums.Cookie.employeeID)}&searchPhrase=${storeSearch}`,
  //   });
  //   // setStores(storesResult.Results);
  //   // setStoresTotalResults(storesResult.TotalResults);
  //   setSearching(false);
  // };

  // LOCATION

  const updateLocation = (updatedLocation) => {
    setLocation(updatedLocation);
    if (CustomerService.hasLocationChanged(location, updatedLocation)) {
      updateQueryInBulk([
        { 'field': 'Location', 'value': updatedLocation },
        { 'field': 'LocationID', 'value': updatedLocation ? updatedLocation.ID : null },
      ]);
    }
  };

  // CONTACT

  const updateContact = (updatedContact) => {
    setContact(updatedContact);
    if (!!updatedContact && (!contact || contact.ID != updatedContact.ID)) {
      updateQueryInBulk([
        { 'field': 'Contact', 'value': updatedContact },
        { 'field': 'CustomerContactID', 'value': updatedContact.ID },
      ]);
    }
  };

  // Forms

  const [formButtons, setFormButtons] = useState([]);
  const [formDefinitions, setFormDefinitions] = useState([]);
  const [selectedFormDefinition, setSelectedFormDefinition] = useState();

  const getFormDefinitions = async () => {
    const request = await Fetch.get({
      url: `/FormDefinition/GetFormDefinitionsByModule`,
      params: {
        module: Enums.Module.Query
      }
    });
    let items = request.Results;
    if (items && items.length > 0) {
      setFormDefinitions(items);
    }
  };

  useEffect(() => {
    if (formDefinitions) {
      let buttons = [];
      for (let index in formDefinitions) {
        let temp = { text: formDefinitions[index].Name, link: formDefinitions[index].ID };
        buttons.push(temp);
      }
      setFormButtons(buttons);
    }
  }, [formDefinitions]);

  const formButtonClick = (definitionID) => {
    let formDefinition = formDefinitions.find(x => x.ID == definitionID);
    setSelectedFormDefinition(formDefinition);
    setShowFormsModal(true);
  };

  const [showFormsModal, setShowFormsModal] = useState(false);

  const formsSave = () => {
    setShowFormsModal(false);
  };

  const [showCreateCustomer, setShowCreateCustomer] = useState(false);
  const [prepopulatedCustomer, setPrepopulatedCustomer] = useState();

  const onCustomerCreate = (customer) => {
    setCustomer(customer);
    setWebformGenerated(false);
  };

  const createCustomerClick = () => {
    let metaData = JSON.parse(query.MetaData);
    if (metaData) {
      setPrepopulatedCustomer({ FirstName: metaData.FirstName, LastName: metaData.LastName, MobileNumber: metaData.PhoneNumber, EmailAddress: metaData.EmailAddress })
    }

    setShowCreateCustomer(true);
  };

  return (
    <div className="container">


      {formDefinitions.length > 0 ?
        <div className="forms">
          <ButtonDropdown
            action={formButtonClick}
            text="Forms"
            options={formButtons}
          />
        </div> : ''
      }

      {showFormsModal ?
        <ManageForm module={Enums.Module.Query} itemID={query.ID} formDefinition={selectedFormDefinition} onSave={formsSave} /> : ''
      }

      <Box maw={1000} w={'100%'} mt={'sm'}>
        <QueryForm
            query={query}
            hideSaveAndCancel
            setSubmitState={setSubmitState}
            onSubmitState={onSubmitState}
            onSaved={onSaved}
        />
      </Box>

      {/*<div className="form-width-container">

        <CustomerContactLocationSelector selectedCustomer={customer} setSelectedCustomer={setCustomer} canChangeCustomer={emptyCustomer}
          selectedContact={contact} setSelectedContact={updateContact} selectedLocation={location} setSelectedLocation={updateLocation}
          detailsView={false} module={Enums.Module.Query} inputErrors={inputErrors} accessStatus={accessStatus} iconMode canEditCustomerInNormalView={true}
        />

        <div className="heading">
          Query Details
        </div>

        <div className="row">
          <div className="column">
            {isMultiStore && !Helper.isNullOrUndefined(selectedStore) ?
              <StoreSelector selectedStore={selectedStore} setSelectedStore={setSelectedStore} required={false} disabled={storeChangeDisabled} accessStatus={accessStatus} />
              : ''
            }
          </div>
          <div className="column" style={{ position: "relative" }}>
            {webformGenerated || (emptyCustomer && !!query.MetaData) ?
              <div style={{ position: "absolute", bottom: 0, right: 0 }}>
                <Button text="Create Customer" onClick={createCustomerClick} extraClasses="fit-content" />
              </div>
              : ""
            }
          </div>
        </div>

        <div className="row">
          <div className="column">

            <QueryTypeSelector
              accessStatus={accessStatus}
              error={inputErrors.QueryType}
              placeholder="Select query type"
              required={true}
              selectedQueryType={selectedQueryType}
              setSelectedQueryType={handleQueryTypeChange}
              canClear={false}
              ignoreAddOption={false}
              includeDisabled={false}
            />

            <QueryStatusSelector
              accessStatus={accessStatus}
              canClear={false}
              error={inputErrors.QueryStatus}
              ignoreAddOption={false}
              placeholder="Select query status"
              queryType={selectedQueryType}
              required={true}
              selectedQueryStatus={selectedQueryStatus}
              setSelectedQueryStatus={handleQueryStatusChange}
            />

            <EmployeeSelector selectedEmployee={localEmployee} setSelectedEmployee={assignEmployee} error={inputErrors.Employee} accessStatus={accessStatus} label="Assigned Employee" />

            <SCInput
              name="Reference"
              label="Reference"
              onChange={handleQueryReferenceChange}
              value={queryReference}
              error={inputErrors.Reference}
            />

          </div>
          <div className="column">
            <SCTextArea
              name="Description"
              label="Description"
              onChange={handleQueryDescChange}
              required={true}
              value={queryDesc}
              error={inputErrors.Description}
              rows={7}
              backgroundColor={colors.background}
            />
          </div>
        </div>
        <div className="row">
          <div className="column">
            <SCDatePicker
              name="FollowupDate"
              label="Follow up date"
              required={true}
              changeHandler={handleQueryFollowUpDateChange}
              value={queryFollowUpDate}
              error={inputErrors.FollowupDate}
            />
          </div>
          <div className="column">
            <SCDropdownList
              name="Priority"
              onChange={handleQueryPriorityChange}
              label="Priority"
              options={queryPriorities}
              setSelected={setSelectedPriority}
              value={selectedPriority}
              error={inputErrors.QueryPriority}
            />
          </div>
        </div>
        {showInventory ? <div className="row">
          <div className="column">
            <InventorySelector
              accessStatus={accessStatus}
              error={inputErrors.Inventory}
              selectedInventory={selectedInventory}
              setSelectedInventory={handleInventoryChange}
              isRequired={false}
            />
          </div>
          <div className="column">
          </div>
        </div> : ""}

        <div className="row">
          <div className="column">
            <SCInput
              label={field1Label}
              onChange={handleFieldChange}
              name="CustomField1"
              value={query.CustomField1}
            />
          </div>
          <div className="column">
            <SCInput
              label={field2Label}
              onChange={handleFieldChange}
              name="CustomField2"
              value={query.CustomField2}
            />
          </div>
        </div>
        <div className="row">
          <div className="column">
            <SCInput
              label={field3Label}
              onChange={handleFieldChange}
              name="CustomField3"
              value={query.CustomField3}
            />
          </div>
          <div className="column">
            <SCInput
              label={field4Label}
              onChange={handleFieldChange}
              name="CustomField4"
              value={query.CustomField4}
            />
          </div>
        </div>
        <div className="row">
          <div className="column">
            <SCDatePicker
              name="CustomDate1"
              label={date1Label}
              changeHandler={handleCustomDate1Change}
              value={query.CustomDate1}
            />
          </div>
          <div className="column">
            <SCDatePicker
              name="CustomDate2"
              label={date2Label}
              changeHandler={handleCustomDate2Change}
              value={query.CustomDate2}
            />
          </div>
        </div>
        <div className="row">
          <div className="column">
            <SCCheckbox
              onChange={() => handleFieldChange({ name: "CustomFilter1", value: !query.CustomFilter1 })}
              value={query.CustomFilter1}
              label={filter1Label}
            />
          </div>
          <div className="column">
            <SCCheckbox
              onChange={() => handleFieldChange({ name: "CustomFilter2", value: !query.CustomFilter2 })}
              value={query.CustomFilter2}
              label={filter2Label}
            />
          </div>
        </div>
        <div className="row">
          <div className="column">
            <SCNumericInput
              onChange={handleFieldChange}
              label={number1Label}
              name="CustomNumber1"
              value={query.CustomNumber1}
              format={Enums.NumericFormat.Decimal}
            />
          </div>
          <div className="column">
            <SCNumericInput
              onChange={handleFieldChange}
              label={number2Label}
              name="CustomNumber2"
              value={query.CustomNumber2}
              format={Enums.NumericFormat.Decimal}
            />
          </div>
        </div>

         <div className="row">
          <div className="column">
            
          </div>
          <div className="column">
          </div>
        </div>
      </div>*/}

      <TaskItems module={Enums.Module.Query} data={query} accessStatus={accessStatus} />

      <div className="comments-and-history">
        <ItemComments
          itemID={query.ID}
          module={Enums.Module.Query}
          storeID={query.StoreID}
          triggerSave={triggerSaveComment}

        />

        <AuditLog recordID={query.ID} retriggerSearch={query} />
      </div>

      {showCreateCustomer ?
        <CreateCustomer setShowCreateCustomer={setShowCreateCustomer} createCustomer={onCustomerCreate} customer={prepopulatedCustomer} /> : ''
      }

      <style jsx>{`
        .container {
          margin-top: 0.5rem;
          position: relative;
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
        .store {
          position: absolute;
          right: 0;
          top: 0;
          width: 20rem;
        }
        .forms {
          position: absolute;
          right: 0;
          top: 5rem;
          width: 7rem;
          z-index: 1;
        }
        .customer-button {
          color: ${colors.bluePrimary};
          cursor: pointer;
          margin-bottom: 8px !important;
          margin-top: -8px !important;
        }
        .location {
          margin-top: 0;
        }
        .location-display {
          width: 50%;
        }
        .contact {
          color: ${colors.blueGrey};
        }
        .contact h1 {
          color: ${colors.darkPrimary};
          font-size: 2rem;
          margin: 0 0 0.75rem;
        }
        .contact div {
          margin: 3px 0 0;
          opacity: 0.8;
        }
        .heading {
          color: ${colors.blueGrey};
          font-weight: bold;
          margin: 1.5rem 0 0.5rem;
          position: relative;
        }
        .create-button {
          position: absolute;
          right: 1rem;
          bottom: 0;
        }
        .new-comment {
          position: relative;
        }
        .new-comment img {
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
          height: 5rem;
          justify-content: center;
          margin-top: 0.5rem;
          padding: 0.5rem 1rem;
          position: relative;
          width: 100%;
        }
        .comment-info {
          align-items: center;
          display: flex;
          margin-bottom: 4px;
        }
        .query {
          color: ${colors.bluePrimary};
          font-weight: bold;
        }
        .name {
          color: ${colors.darkPrimary};
          font-weight: bold;
        }

        .comments-and-history {
          padding-right: 3rem;
        }
        .form-width-container {
          max-width: ${constants.maxFormWidth};
        }
      `}</style>
    </div>
  );
}

export default QueryDetails;
