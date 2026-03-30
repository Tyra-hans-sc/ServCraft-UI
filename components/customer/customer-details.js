import React, { useState, useEffect } from 'react';
import { colors, fontSizes, layout, fontFamily } from '../../theme';
import Fetch from '../../utils/Fetch';
import OptionService from '../../services/option/option-service';
import ItemComments from '../shared-views/item-comments';
import * as Enums from '../../utils/enums';
import AuditLog from '../shared-views/audit-log';
import AssignEmployee from '../shared-views/assign-employee';
import SCInput from '../sc-controls/form-controls/sc-input';
import SCNumericInput from '../sc-controls/form-controls/sc-numeric-input';
import SCComboBox from '../sc-controls/form-controls/sc-combobox';
import SCCheckbox from '../sc-controls/form-controls/sc-checkbox';
import SCDatePicker from '../sc-controls/form-controls/sc-datepicker';
import SCSwitch from '../sc-controls/form-controls/sc-switch';
import Button from '../button';
import FormDefinitionsForItem from '../modals/form-definition/form-definitions-for-item';
import EmployeeSelector from '../selectors/employee/employee-selector';
import constants from '../../utils/constants';
import SCDropdownList from '../sc-controls/form-controls/sc-dropdownlist';

function CustomerDetails({ customer, updateCustomer, saveToggle, setSelectedCustomerType, selectedCustomerType, setSelectedCustomerStatus, selectedCustomerStatus,
  setSelectedIndustryType, selectedIndustyType, setSelectedMediaType, selectedMediaType,
  triggerSaveComment,
  //comments, newComment, setNewComment, submitComment, canLoadMoreComments, loadMoreComments,
  customFields, editCustomerPermission, inputErrors, accessStatus }) {

  const customerLocations = customer.Locations || [];
  const primaryLocation = customerLocations.filter(location => location.IsPrimary)[0] || customerLocations[0];
  const primaryContact = customer.Contacts.filter(contact => contact.IsPrimary)[0];

  const [customerType, setCustomerType] = useState(customer.IsCompany ? 'Company' : 'Individual');

  const [formDefinitions, setFormDefinitions] = useState([]);
  const [showFormsModal, setShowFormsModal] = useState(false);


  const formButtonClick = () => {
    setShowFormsModal(true);
  };

  const formsClose = () => {
    setShowFormsModal(false);
  };

  const getFormDefinitions = async () => {
    const request = await Fetch.post({
      url: `/FormDefinition/GetFormDefinitions`,
      params: {
      }
    });
    let items = request.Results;
    if (items && items.length > 0) {
      setFormDefinitions(items.filter(x => x.FormRule === Enums.FormRule.Customer));
    }
  };

  const handleCustomerTypeChange = () => {
    let wasIndividual = customerType == "Individual";
    setCustomerType(wasIndividual ? "Company" : "Individual");
    updateCustomer('IsCompany', wasIndividual);
  };

  // const [submitting, setSubmitting] = useState(false);

  // const handleCommentChange = (e) => {
  //   setNewComment(e.target.value);
  // };

  const handleFieldChange = (e) => {

    if (e && e.name === "VATNumber") {
      if (e.value && e.value.length > 15) {
        e.value = e.value.substring(0, 15);
      }
    }

    updateCustomer(e.name, e.value);
  };

  const handleDateFieldChange = (e) => {
    updateCustomer(e.name, e.value);
  };

  const [customFilter1, setCustomFilter1] = useState(customer.CustomFilter1);
  const handleCustomFilter1Change = (e) => {
    setCustomFilter1(!customFilter1);
    updateCustomer('CustomFilter1', !customFilter1);
  };

  const [customFilter2, setCustomFilter2] = useState(customer.CustomFilter2);
  const handleCustomFilter2Change = (e) => {
    setCustomFilter2(!customFilter2);
    updateCustomer('CustomFilter2', !customFilter2);
  };

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

  const [customerStatusRequired, setCustomerStatusRequired] = useState(false);
  const [customerTypeRequired, setCustomerTypeRequired] = useState(false);
  const [industryTypeRequired, setIndustryTypeRequired] = useState(false);
  const [mediaTypeRequired, setMediaTypeRequired] = useState(false);

  const [customerTypes, setCustomerTypes] = useState([]);
  const [industryTypes, setIndustryTypes] = useState([]);
  const [mediaTypes, setMediaTypes] = useState([]);
  const [customerStatuses, setCustomerStatuses] = useState([]);

  const getCustomerTypes = async () => {
    const customerTypes = await Fetch.get({
      url: `/CustomerType`
    });
    setCustomerTypes(customerTypes.Results ? customerTypes.Results : []);
  }

  const handleSelectedCustomerTypeChange = (value) => {
    setSelectedCustomerType(value);
  };

  const getIndustryTypes = async () => {
    const industryTypes = await Fetch.get({
      url: `/IndustryType`
    });
    setIndustryTypes(industryTypes.Results ? industryTypes.Results : []);
  }

  const handleIndustryTypeChange = (value) => {
    setSelectedIndustryType(value);
  };

  const getMediaTypes = async () => {
    const mediaTypes = await Fetch.get({
      url: `/MediaType`
    });
    setMediaTypes(mediaTypes.Results ? mediaTypes.Results : []);
  }

  const handleMediaTypeChange = (value) => {
    setSelectedMediaType(value);
  };

  const getCustomerStatuses = async () => {
    const statutes = await Fetch.get({
      url: `/CustomerStatus`
    });
    setCustomerStatuses(statutes.Results ? statutes.Results : []);
  }

  const handleCustomerStatusChange = (value) => {
    setSelectedCustomerStatus(value);
  };

  const getCustomFields = () => {

    let { fieldLabel1, fieldLabel2, fieldLabel3, fieldLabel4, dateFieldLabel1, dateFieldLabel2,
      filterFieldLabel1, filterFieldLabel2, numberFieldLabel1, numberFieldLabel2,
      customerStatusRequired, customerTypeRequired, industryTypeRequired, mediaTypeRequired } =
      OptionService.getCustomerCustomFields(customFields);

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
    setCustomerStatusRequired(customerStatusRequired);
    setCustomerTypeRequired(customerTypeRequired);
    setIndustryTypeRequired(industryTypeRequired);
    setMediaTypeRequired(mediaTypeRequired);
  }

  useEffect(() => {
    getCustomFields();
    getCustomerTypes();
    getIndustryTypes();
    getMediaTypes();
    getCustomerStatuses();
    getFormDefinitions();
  }, []);

  // async function doSubmitComment() {
  //   if (accessStatus === Enums.AccessStatus.LockedWithAccess || accessStatus === Enums.AccessStatus.LockedWithOutAccess) {
  //     return;
  //   }

  //   setSubmitting(true);
  //   submitComment();
  //   setSubmitting(false);
  // }

  // EMPLOYEE 

  const [selectedEmployee, setSelectedEmployee] = useState(customer.Employee);

  const assignEmployee = (employee) => {
    setSelectedEmployee(employee);
    updateCustomer("Employee", employee);
  };

  return (
    <div className="inner-container">
      {primaryContact ?
        <div className="contact">
          <p><strong>Primary Contact</strong></p>
          <p>{primaryContact.FirstName + " " + primaryContact.LastName}</p>
          <p>{primaryContact.MobileNumber}</p>
          <p>{primaryContact.EmailAddress}</p>
        </div> : ''
      }
      {primaryLocation
        ? <div className="contact">
          <p><strong>Primary Location</strong></p>
          <p>{primaryLocation.Description}</p>
          <p>{primaryLocation.LocationDisplay}</p>
        </div>
        : ""}

      {formDefinitions.length > 0 ?
        <>
          <div className="forms">
            <Button
              extraClasses="fit-content"
              onClick={formButtonClick}
              text="Forms"
            />
          </div>

          {showFormsModal ?
            <FormDefinitionsForItem
              customer={customer}
              onClose={formsClose}
              itemID={customer.ID}
              itemModule={Enums.Module.Customer}
              linkedFormDefinitions={[]}
              onlyLinkedForms={false}
            /> : ''
          }
        </> : ''
      }

      <div className="form-width-container">
        <div className="heading-row">
          <div className="heading">
            Customer Details
          </div>
          <div className="customer-type">
            <SCCheckbox
              onChange={handleCustomerTypeChange}
              label="My customer is a company"
              value={customerType ? customerType == "Company" : false}
            />
          </div>
        </div>

        <div className="row">
          <div className="column">
            <SCInput
              onChange={handleFieldChange}
              label={customerType == "Company" ? 'Company Name' : 'Customer Name'}
              name="CustomerName"
              required={true}
              value={customer.CustomerName}
              error={inputErrors.CustomerName}
              readOnly={!editCustomerPermission}
              cypress="data-cy-customer"
            />
          </div>
          <div className="column">
            <SCInput
              onChange={handleFieldChange}
              label="Customer Code"
              name="CustomerCode"
              required={true}
              readOnly={!editCustomerPermission}
              value={customer.CustomerCode}
              cypress="data-cy-code"
            />
          </div>
        </div>
        <div className="row">
          <div className="column">
            <SCDropdownList
              onChange={handleSelectedCustomerTypeChange}
              options={customerTypes}
              dataItemKey="ID"
              textField="Description"
              name="CustomerType"
              label="Customer Type"
              error={inputErrors.CustomerType}
              disabled={!editCustomerPermission}
              required={customerTypeRequired}
              value={selectedCustomerType}
              cypress="data-cy-customertype"
            />
          </div>
          <div className="column">
            <SCDropdownList
              onChange={handleIndustryTypeChange}
              options={industryTypes}
              dataItemKey="ID"
              textField="Description"
              name="IndustryType"
              label="Industry Type"
              error={inputErrors.IndustryType}
              disabled={!editCustomerPermission}
              required={industryTypeRequired}
              value={selectedIndustyType}
              cypress="data-cy-industrytype"
            />
          </div>
        </div>
        <div className="row">
          <div className="column">
            <SCDropdownList
              onChange={handleMediaTypeChange}
              options={mediaTypes}
              dataItemKey="ID"
              textField="Description"
              name="MediaType"
              label="Media Type"
              error={inputErrors.MediaType}
              disabled={!editCustomerPermission}
              required={mediaTypeRequired}
              value={selectedMediaType}
              cypress="data-cy-mediatype"
            />
          </div>
          <div className="column">
            <SCDropdownList
              onChange={handleCustomerStatusChange}
              options={customerStatuses}
              dataItemKey="ID"
              textField="Description"
              name="CustomerStatus"
              label="Customer Status"
              error={inputErrors.CustomerStatus}
              disabled={!editCustomerPermission}
              required={customerStatusRequired}
              value={selectedCustomerStatus}
              cypress="data-cy-customerstatus"
            />
          </div>
        </div>
        <div className="row">
          <div className="column">
            <SCInput
              onChange={handleFieldChange}
              label={field1Label}
              name="CustomField1"
              value={customer.CustomField1}
              readOnly={!editCustomerPermission}
              cypress="data-cy-customfield1"
            />
          </div>
          <div className="column">
            <SCInput
              onChange={handleFieldChange}
              label={field2Label}
              name="CustomField2"
              value={customer.CustomField2}
              readOnly={!editCustomerPermission}
              cypress="data-cy-customfield2"
            />
          </div>
        </div>
        <div className="row">
          <div className="column">
            <SCInput
              onChange={handleFieldChange}
              label={field3Label}
              name="CustomField3"
              value={customer.CustomField3}
              readOnly={!editCustomerPermission}
              cypress="data-cy-customfield3"
            />
          </div>
          <div className="column">
            <SCInput
              onChange={handleFieldChange}
              label={field4Label}
              name="CustomField4"
              value={customer.CustomField4}
              readOnly={!editCustomerPermission}
              cypress="data-cy-customfield4"
            />
          </div>
        </div>
        <div className="row">
          <div className="column">
            <SCDatePicker
              name="CustomDate1"
              label={date1Label}
              changeHandler={handleDateFieldChange}
              value={customer.CustomDate1}
              disabled={!editCustomerPermission}
              cypress="data-cy-customdate1"
            />
          </div>
          <div className="column">
            <SCDatePicker
              name="CustomDate2"
              label={date2Label}
              changeHandler={handleDateFieldChange}
              value={customer.CustomDate2}
              disabled={!editCustomerPermission}
              cypress="data-cy-customdate2"
            />
          </div>
        </div>
        <div className="row">
          <div className="column">
            <SCCheckbox
              name="CustomFilter1"
              onChange={handleCustomFilter1Change}
              value={customer.CustomFilter1}
              label={filter1Label}
              disabled={!editCustomerPermission}
              cypress="data-cy-customfilter1"
            />
          </div>
          <div className="column">
            <SCCheckbox
              name="CustomFilter2"
              onChange={handleCustomFilter2Change}
              value={customer.CustomFilter2}
              label={filter2Label}
              disabled={!editCustomerPermission}
              cypress="data-cy-customfilter2"
            />
          </div>
        </div>
        <div className="row">
          <div className="column">
            <SCNumericInput
              onChange={handleFieldChange}
              label={number1Label}
              name="CustomNumber1"
              value={customer.CustomNumber1}
              readOnly={!editCustomerPermission}
              cypress="data-cy-customnumber1"
              format={Enums.NumericFormat.Decimal}
            />
          </div>
          <div className="column">
            <SCNumericInput
              onChange={handleFieldChange}
              label={number2Label}
              name="CustomNumber2"
              value={customer.CustomNumber2}
              readOnly={!editCustomerPermission}
              cypress="data-cy-customnumber2"
              format={Enums.NumericFormat.Decimal}
            />
          </div>
        </div>
        <div className="row">
          <div className="column">
            <SCInput
              onChange={handleFieldChange}
              label="VAT Number"
              name="VATNumber"
              value={customer.VATNumber}
              readOnly={!editCustomerPermission}
              cypress="data-cy-vatnumber"
            />
          </div>
          <div className="column">
            <SCInput
              onChange={handleFieldChange}
              label="Company Reg Number"
              name="CompanyNumber"
              value={customer.CompanyNumber}
              readOnly={!editCustomerPermission}
              cypress="data-cy-companynumber"
            />
          </div>
        </div>
        <div className="row">
          <div className="column">
            <EmployeeSelector selectedEmployee={selectedEmployee} setSelectedEmployee={assignEmployee} accessStatus={accessStatus} label="Account Manager" />
          </div>
          <div className="column">
            <SCNumericInput
              onChange={handleFieldChange}
              label="Default Discount"
              name="DefaultDiscount"
              required={true}
              value={customer.DefaultDiscount}
              error={inputErrors.DefaultDiscount}
              readOnly={!editCustomerPermission}
              cypress="data-cy-defaultdiscount"
              format={Enums.NumericFormat.Percentage}
            />
          </div>
        </div>
        <div className="row">
          <div className="column"></div>
          <div className="switch">
            <SCSwitch
              name="IsActive"
              onLabel="Active"
              offLabel="Active"
              checked={customer.IsActive}
              onChange={() => handleFieldChange({ name: "IsActive", value: !customer.IsActive })}
              disabled={!editCustomerPermission}
            />
          </div>
        </div>

      </div>

      <div className="comments-and-history">
        <ItemComments
          itemID={customer.ID}
          module={Enums.Module.Customer}
          storeID={customer.StoreID}
          triggerSave={triggerSaveComment}

        // comments={comments}
        // handleCommentChange={handleCommentChange}
        // newComment={newComment}
        // submitComment={doSubmitComment}
        // submitting={submitting}
        // canLoadMoreComments={canLoadMoreComments}
        // loadMoreComments={loadMoreComments}
        />

        <AuditLog recordID={customer.ID} retriggerSearch={saveToggle} />
      </div>

      <style jsx>{`
        .inner-container {
          margin-top: 2.5rem;
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
        .switch {
          flex-direction: row-reverse;
          display: flex;
          flex-basis: 0;
          flex-grow: 1;
        }
        .contact {
          color: ${colors.blueGrey};
          padding-right: 5rem;
          position: relative;
          width: fit-content;
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
        .contact strong {
          color: ${colors.darkPrimary};
          margin-bottom: 0.5rem;
        }
        .contact + .contact {
          margin-top: 1rem;
        }
        .edit {
          cursor: pointer;
          position: absolute;
          right: 0;
          top: 0;
        }
        .heading-row {
          display: flex;
        }
        .heading {
          color: ${colors.blueGrey};
          font-weight: bold;
          margin: 1.5rem 0 0.5rem;
        }
        .customer-type {
          margin-left: 1rem;
          margin-top: 0.9rem;
        }
        .status {
          position: absolute;
          right: 0;
          top: 0;
          width: 20rem;
        }
        .status :global(.input-container){
          background-color: ${colors.bluePrimary};
        }
        .status :global(input){
          color: ${colors.white};
        }
        .status :global(label){
          color: ${colors.white};
          opacity: 0.8;
        }
        .comments-and-history {
          padding-right: 3rem;
        }

        .forms {
          position: absolute;
          right: 0;
          top: 0;
        }

        .form-width-container {
          max-width: ${constants.maxFormWidth};
        }
      `}</style>
    </div>
  )
}

export default CustomerDetails;
