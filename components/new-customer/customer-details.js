import React, { useState, useEffect } from 'react';
import { colors, fontSizes, layout, fontFamily } from '../../theme';
import KendoInput from '../kendo/kendo-input';
import KendoNumericInput from '../kendo/kendo-numeric-input';
import KendoSimpleCombobox from '../kendo/kendo-simple-combobox';
import Fetch from '../../utils/Fetch';
import OptionService from '../../services/option/option-service';
import ItemComments from '../shared-views/item-comments';
import * as Enums from '../../utils/enums';
import AuditLog from '../shared-views/new-audit-log';
import AssignEmployee from '../shared-views/assign-employee';
import ReactSwitch from '../react-switch';
import KendoDatePicker from '../kendo/new-kendo-date-picker';
import Checkbox from '../checkbox';
import KendoCheckbox from '../kendo/kendo-checkbox';
import SCSwitch from "../sc-controls/form-controls/sc-switch";

/**
 * @deprecated The method should not be used
 */
function CustomerDetails({ customer, updateCustomer, saveToggle, setSelectedCustomerType, selectedCustomerType, setSelectedCustomerStatus, selectedCustomerStatus,
  setSelectedIndustryType, selectedIndustyType, setSelectedMediaType, selectedMediaType,
  comments, newComment, setNewComment, submitComment, canLoadMoreComments, loadMoreComments,
  customFields, editCustomerPermission, inputErrors, accessStatus }) {

  const primaryContact = customer.Contacts.filter(contact => contact.IsPrimary)[0];

  const customerLocations = customer.Locations || [];
  const primaryLocation = customerLocations.filter(location => location.IsPrimary)[0] || customerLocations[0];

  const [submitting, setSubmitting] = useState(false);

  const handleCommentChange = (e) => {
    setNewComment(e.target.value);
  };

  const handleFieldChange = (e) => {
    updateCustomer(e.target.name, e.value);
  };

  const handleOldFieldChange = (e) => {
    updateCustomer(e.target.name, e.target.value);
  };

  const handleDateFieldChange = (date, fieldName) => {
    updateCustomer(fieldName, date);
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

  // CUSTOMER TYPE

  const [customerTypeRequired, setCustomerTypeRequired] = useState(false);
  const [customerTypes, setCustomerTypes] = useState([]);

  const getCustomerTypes = async () => {
    const customerTypes = await Fetch.get({
      url: `/CustomerType`
    });
    setCustomerTypes(customerTypes.Results ? customerTypes.Results : []);
  };

  const handleCustomerTypeChange = (value) => {
    setSelectedCustomerType(value);
  };

  // INDUSTRY TYPE

  const [industryTypeRequired, setIndustryTypeRequired] = useState(false);
  const [industryTypes, setIndustryTypes] = useState([]);

  const getIndustryTypes = async () => {
    const industryTypes = await Fetch.get({
      url: `/IndustryType`
    });
    setIndustryTypes(industryTypes.Results ? industryTypes.Results : []);
  };

  const handleIndustryTypeChange = (value) => {
    setSelectedIndustryType(value);
  };

  // MEDIA TYPE

  const [mediaTypeRequired, setMediaTypeRequired] = useState(false);
  const [mediaTypes, setMediaTypes] = useState([]);

  const getMediaTypes = async () => {
    const mediaTypes = await Fetch.get({
      url: `/MediaType`
    });
    setMediaTypes(mediaTypes.Results ? mediaTypes.Results : []);
  };

  const handleMediaTypeChange = (value) => {
    setSelectedMediaType(value);
  };

  // CUSTOMER STATUS

  const [customerStatusRequired, setCustomerStatusRequired] = useState(false);
  const [customerStatuses, setCustomerStatuses] = useState([]);

  const getCustomerStatuses = async () => {
    const statutes = await Fetch.get({
      url: `/CustomerStatus`
    });
    setCustomerStatuses(statutes.Results ? statutes.Results : []);
  };

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
  }, []);

  async function saveComment() {
    if (accessStatus === Enums.AccessStatus.LockedWithAccess || accessStatus === Enums.AccessStatus.LockedWithOutAccess) {
      return;
    }

    setSubmitting(true);
    submitComment();
    setSubmitting(false);
  }

  // EMPLOYEE 

  const [selectedEmployee, setSelectedEmployee] = useState(customer.Employee);

  const assignEmployee = (employee) => {
    setSelectedEmployee(employee);
    updateCustomer("Employee", employee);
  };

  return (
    <div className="container">
      <div className="row">
        {primaryContact ?
          <div className="column contact">
            <p><strong>Primary Contact</strong></p>
            <p>{primaryContact.FirstName + " " + primaryContact.LastName}</p>
            <p>{primaryContact.MobileNumber}</p>
            <p>{primaryContact.EmailAddress}</p>
          </div> : ''
        }
        {primaryLocation ?
          <div className="column contact">
            <p><strong>Primary Location</strong></p>
            <p>{primaryLocation.Description}</p>
            <p>{primaryLocation.LocationDisplay}</p>
          </div> : ''
        }
      </div>

      <div className="heading">
        Customer Details
      </div>
      <div className="row">
        <div className="column">
          <KendoInput
            onChange={handleFieldChange}
            label="Customer Name"
            name="CustomerName"
            required={true}
            value={customer.CustomerName}
            error={inputErrors.CustomerName}
            readOnly={!editCustomerPermission}
          />
        </div>
        <div className="column">
          <KendoInput
            label="Customer Code"
            name="CustomerCode"
            required={true}
            value={customer.CustomerCode}
            readOnly={true}
          />
        </div>
      </div>
      <div className="row">
        <div className="column">
          <KendoSimpleCombobox
            onChange={handleCustomerTypeChange}
            options={customerTypes}
            dataItemKey="ID"
            textField="Description"
            name="CustomerType"
            label="Customer Type"
            error={inputErrors.CustomerType}
            disabled={!editCustomerPermission}
            required={customerTypeRequired}
            value={selectedCustomerType}
          />
        </div>
        <div className="column">
          <KendoSimpleCombobox
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
          />
        </div>
      </div>
      <div className="row">
        <div className="column">
          <KendoSimpleCombobox
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
          />
        </div>
        <div className="column">
          <KendoSimpleCombobox
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
          />
        </div>
      </div>
      <div className="row">
        <div className="column">
          <KendoInput
            onChange={handleFieldChange}
            label={field1Label}
            name="CustomField1"
            value={customer.CustomField1}
            readOnly={!editCustomerPermission}
          />
        </div>
        <div className="column">
          <KendoInput
            onChange={handleFieldChange}
            label={field2Label}
            name="CustomField2"
            value={customer.CustomField2}
            readOnly={!editCustomerPermission}
          />
        </div>
      </div>
      <div className="row">
        <div className="column">
          <KendoInput
            onChange={handleFieldChange}
            label={field3Label}
            name="CustomField3"
            value={customer.CustomField3}
            readOnly={!editCustomerPermission}
          />
        </div>
        <div className="column">
          <KendoInput
            onChange={handleFieldChange}
            label={field4Label}
            name="CustomField4"
            value={customer.CustomField4}
            readOnly={!editCustomerPermission}
          />
        </div>
      </div>
      <div className="row">
        <div className="column">
          <KendoDatePicker
            label={date1Label}
            changeHandler={(date) => handleDateFieldChange(date, 'CustomDate1')}
            value={customer.CustomDate1}
            disabled={!editCustomerPermission}
          />
        </div>
        <div className="column">
          <KendoDatePicker
            label={date2Label}
            changeHandler={(date) => handleDateFieldChange(date, 'CustomDate2')}
            value={customer.CustomDate2}
            disabled={!editCustomerPermission}
          />
        </div>
      </div>
      <div className="row">
        <div className="column">
          <KendoCheckbox
            name="CustomFilter1"
            onChange={handleCustomFilter1Change}
            value={customer.CustomFilter1}
            label={filter1Label}
            disabled={!editCustomerPermission}
          />
        </div>
        <div className="column">
          <KendoCheckbox
            name="CustomFilter2"
            onChange={handleCustomFilter2Change}
            value={customer.CustomFilter2}
            label={filter2Label}
            disabled={!editCustomerPermission}
          />
        </div>
      </div>
      <div className="row">
        <div className="column">
          <KendoNumericInput
            onChange={handleFieldChange}
            label={number1Label}
            name="CustomNumber1"
            value={customer.CustomNumber1}
            readOnly={!editCustomerPermission}
          />
        </div>
        <div className="column">
          <KendoNumericInput
            onChange={handleFieldChange}
            label={number2Label}
            name="CustomNumber2"
            value={customer.CustomNumber2}
            readOnly={!editCustomerPermission}
          />
        </div>
      </div>
      <div className="row">
        <div className="column">
          <KendoInput
            onChange={handleFieldChange}
            label="VAT Number"
            name="VATNumber"
            value={customer.VATNumber}
            readOnly={!editCustomerPermission}
          />
        </div>
        <div className="column">
          <KendoNumericInput
            onChange={handleFieldChange}
            label="Default Discount"
            name="DefaultDiscount"
            required={true}
            value={customer.DefaultDiscount}
            error={inputErrors.DefaultDiscount}
            readOnly={!editCustomerPermission}
          />
        </div>
      </div>
      <div className="row">
        <div className="column">
          <AssignEmployee selectedEmployee={selectedEmployee} setSelected={assignEmployee} placeholder="Assign Account Manager" disabled={!editCustomerPermission} />
        </div>
        <div className="switch">
          <SCSwitch label='Active' checked={customer.IsActive} onToggle={() => handleOldFieldChange({ target: { name: "IsActive", value: !customer.IsActive } })}
            disabled={!editCustomerPermission}
          />
          {/*<ReactSwitch label='Active' checked={customer.IsActive} handleChange={() => handleOldFieldChange({ target: { name: "IsActive", value: !customer.IsActive } })}
            disabled={!editCustomerPermission}
          />*/}
        </div>
      </div>
      <div className="comments-and-history">
        <ItemComments
          comments={comments}
          handleCommentChange={handleCommentChange}
          newComment={newComment}
          submitComment={saveComment}
          submitting={submitting}
          canLoadMoreComments={canLoadMoreComments}
          loadMoreComments={loadMoreComments}
        />

        <AuditLog recordID={customer.ID} retriggerSearch={saveToggle} />
      </div>
      <style jsx>{`
        .container {
          margin-top: 2.5rem;
          position: relative;
        }
        .row {
          display: flex;
        }
        .column {
          display: flex;
          flex-direction: column;
          width: ${layout.inputWidth}
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
          margin-top: 1rem;
          width: ${layout.inputWidth};
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
        .contact strong {
          color: ${colors.darkPrimary};
          margin-bottom: 0.5rem;
        }
        .edit {
          cursor: pointer;
          position: absolute;
          right: 0;
          top: 0;
        }
        .heading {
          color: ${colors.blueGrey};
          font-weight: bold;
          margin: 1.5rem 0 0.5rem;
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
      `}</style>
    </div>
  )
}

export default CustomerDetails;
