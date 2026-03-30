import React, { useState, useContext, useEffect } from 'react';
import { colors, layout } from '../../theme';
import Fetch from '../../utils/Fetch';
import Helper from '../../utils/helper';
import Time from '../../utils/time';
import ToastContext from '../../utils/toast-context';
import ItemComments from '../shared-views/item-comments';
import CustomerContactLocationSelector from '../selectors/customer/customer-contact-location-selector';
import OptionService from '../../services/option/option-service';
import * as Enums from '../../utils/enums';
import Storage from '../../utils/storage';
import AuditLog from '../shared-views/audit-log';
import CustomerService from '../../services/customer/customer-service';
import SCComboBox from '../sc-controls/form-controls/sc-combobox';
import InventorySelector from '../selectors/inventory/inventory-selector';
import SCInput from '../sc-controls/form-controls/sc-input';
import SCDatePicker from '../sc-controls/form-controls/sc-datepicker';
import SCNumericInput from '../sc-controls/form-controls/sc-numeric-input';
import SCCheckbox from '../sc-controls/form-controls/sc-checkbox';
import StoreSelector from '../selectors/store/store-selector';
import AssetForm from "../../PageComponents/Inventory/AssetForm";
import {Box} from "@mantine/core";

function ProductDetails({ product, updateProduct, updateProductInBulk, 
  triggerSaveComment, formState, setFormState,
  customer, setCustomer, contact, setContact, location, setLocation, customFields, inputErrors, accessStatus, assetUpdated, markFormAsDirty
}) {

  const toast = useContext(ToastContext);

  useEffect(() => {
    getCustomFields();
    // getStore();
  }, []);

  /* Custom Fields */

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

  const [field1Required, setField1Required] = useState(false);
  const [field2Required, setField2Required] = useState(false);
  const [serialNumberRequired, setSerialNumberRequired] = useState(false);
  const [invoiceNumberRequired, setInvoiceNumberRequired] = useState(false);
  const [locationRequired, setLocationRequired] = useState(false);

  const getCustomFields = () => {
    let { fieldLabel1, fieldLabel2, fieldLabel3, fieldLabel4, dateFieldLabel1, dateFieldLabel2,
      filterFieldLabel1, filterFieldLabel2, numberFieldLabel1, numberFieldLabel2,
      field1Required, field2Required,
      serialNumberRequired, invoiceNumberRequired, locationRequired } =
      OptionService.getProductCustomFields(customFields);

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
    setField1Required(field1Required);
    setField2Required(field2Required);
    setSerialNumberRequired(serialNumberRequired);
    setInvoiceNumberRequired(invoiceNumberRequired);
    setLocationRequired(locationRequired);
  };

  // const [submitting, setSubmitting] = useState(false);
  const [searching, setSearching] = useState(false);

  const [inventories, setInventories] = useState([]);
  const [inventoryTotalResults, setInventoryTotalResults] = useState(0);
  const [inventorySearch, setInventorySearch] = useState(product.InventoryDescription);

  const handleInventoryChange = (e) => {
    setInventorySearch(e.target.value);
  };

  const setSelectedInventory = (inventory) => {
    if (inventory) {
      updateProductInBulk([
        { 'field': 'InventoryID', 'value': inventory.ID },
        { 'field': 'PurchaseAmount', 'value': inventory.ListPrice },
        { 'field': 'WarrantyPeriod', 'value': inventory.WarrantyPeriod },
        { 'field': 'Inventory', 'value': inventory }
      ]);
    } else {
      updateProductInBulk([
        { 'field': 'InventoryID', 'value': null },
        { 'field': 'PurchaseAmount', 'value': null },
        { 'field': 'WarrantyPeriod', 'value': null },
        { 'field': 'Inventory', 'value': null }
      ]);
    }
  };

  const handleFieldChange = (e) => {
    updateProduct(e.name, e.value);
  };

  const handleDateFieldChange = (e, fieldName) => {
    updateProduct(fieldName, e.Value);
  };

  const purchaseDate = product.PurchaseDate;

  const handlePurchaseDateChange = (e) => {
    updateProduct('PurchaseDate', e.value);
  };

  const purchaseAmount = product.PurchaseAmount;

  const handlePurchaseAmountChange = (e) => {
    updateProduct('PurchaseAmount', e.value);
  };

  const invoiceNumber = product.InvoiceNumber;

  const handleInvoiceNumberChange = (e) => {
    updateProduct('InvoiceNumber', e.value);
  };

  const serialNumber = product.SerialNumber;

  const handleSerialNumberChange = (e) => {
    updateProduct('SerialNumber', e.value);
  };

  const customField1 = product.CustomField1;

  const handleCustomField1Change = (e) => {
    updateProduct('CustomField1', e.value);
  };

  const customField2 = product.CustomField2;

  const handleCustomField2Change = (e) => {
    updateProduct('CustomField2', e.value);
  };

  const warrantyPeriod = product.WarrantyPeriod;

  const handleWarrantyPeriodChange = (e) => {
    updateProduct('WarrantyPeriod', e.value);
  };

  const lastServicedDate = product.LastServicedDate;

  const handleLastServicedDateChange = (e) => {
    updateProduct('LastServicedDate', e.value);
  };

  const productNumber = product.ProductNumber;

  const handleProductNumberChange = (e) => {
    updateProduct('ProductNumber', e.value);
  };

  // const handleCommentChange = (e) => {
  //   setNewComment(e.target.value);
  // };

  // async function saveComment() {
  //   if (accessStatus === Enums.AccessStatus.LockedWithAccess || accessStatus === Enums.AccessStatus.LockedWithOutAccess) {
  //     return;
  //   }
  //   setSubmitting(true);
  //   submitComment();
  //   setSubmitting(false);
  // }

  const [inventoryPageSize, setInventoryPageSize] = useState(10);

  const showMoreInventory = () => {
    setInventoryPageSize(size => size * 2);
  };

  useEffect(() => {
    searchInventories();
  }, [inventoryPageSize]);

  async function searchInventories() {
    setSearching(true);

    const inventory = await Fetch.post({
      url: `/Inventory/GetInventories`,
      params: {
        pageSize: inventoryPageSize, pageIndex: 0, searchPhrase: inventorySearch, SortExpression: "", SortDirection: ""
      }
    });

    setInventories(inventory.Results);
    setInventoryTotalResults(inventory.TotalResults);
    setSearching(false);
  }

  // STORES

  /*const [isMultiStore, setIsMultiStore] = useState(false);
  const [selectedStore, setSelectedStore] = useState();

  const updateSelectedStore = (store) => {
    setSelectedStore(store);
    updateProduct('StoreID', store ? store.ID : null);
  }*/

  /*const getStore = async () => {
    // const storesResult = await Fetch.get({
    //   url: `/Store/GetEmployeeStores?employeeID=${Storage.getCookie(Enums.Cookie.employeeID)}&searchPhrase=`,
    // });

    let subscriptionInfo = Storage.getCookie(Enums.Cookie.subscriptionInfo);
    let multistore = subscriptionInfo ? subscriptionInfo.MultiStore : false;

    setIsMultiStore(multistore);

    if (multistore) {
      // set store from query
      if (!Helper.isNullOrUndefined(product.StoreID)) {
        const storeResult = await Fetch.get({
          url: `/Store/${product.StoreID}`,
        });
        setSelectedStore(storeResult);
      }
    }
  };*/

  // LOCATION

  const updateLocation = (updatedLocation) => {
    setLocation(updatedLocation);

    if (CustomerService.hasLocationChanged(location, updatedLocation)) {
      updateProductInBulk([
        { 'field': 'Location', 'value': updatedLocation },
        { 'field': 'LocationID', 'value': updatedLocation ? updatedLocation.ID : null },
      ]);
    }
  };

  // CONTACT

  const updateContact = (updatedContact) => {
    setContact(updatedContact);
    if (contact.ID != updatedContact.ID) {
      updateProductInBulk([
        { 'field': 'Contact', 'value': updatedContact },
        { 'field': 'CustomerContactID', 'value': updatedContact.ID },
      ]);
    }
  };

  return (
    <div className="container">

      {/*<CustomerContactLocationSelector selectedCustomer={customer} setSelectedCustomer={setCustomer} canChangeCustomer={false}
        selectedContact={contact} setSelectedContact={updateContact} selectedLocation={location} setSelectedLocation={updateLocation}
        detailsView={true} module={Enums.Module.Asset} inputErrors={inputErrors} accessStatus={accessStatus} compactView={true}
      />*/}

      {/*{isMultiStore ?
        <div className="column">
           <SCComboBox
            label="Store"
            dataItemKey="ID"
            textField="Name"
            options={[]}
            value={selectedStore}
            disabled={true}
          />
          <StoreSelector
            selectedStore={selectedStore}
            setSelectedStore={updateSelectedStore}
            cypress="data-cy-store"
            getAllStores={true}
          />
        </div> : ''
      }*/}

      {/*<div className="heading">
        Asset Details
      </div>*/}

      <Box maw={1000} mt={'sm'}>
        <AssetForm editAsset={product}
                   assetCreated={assetUpdated}
                   onClose={() => {}}
                   formState={formState}
                   setFormState={setFormState}
                   assetPageMode
                   onFormTouched={markFormAsDirty}
                   hideSaveAndCancel
        />
      </Box>
      {/*<hr/>
      to remove...
      <div className="row">
        <div className="column">
          <InventorySelector
            error={inputErrors.InventoryID}
            accessStatus={accessStatus}
            selectedInventory={product.Inventory}
            setSelectedInventory={setSelectedInventory}
          />
        </div>

        <div className="column">
          <SCInput
            label="Asset/Serial Number"
            hint="Leave blank to auto generate"
            onChange={handleProductNumberChange}
            value={productNumber}
          />

        </div>
      </div>
      <div className="row">
        <div className="column">
          <SCDatePicker
            label="Purchase date"
            required={true}
            changeHandler={handlePurchaseDateChange}
            value={purchaseDate}
            error={inputErrors.PurchaseDate}
          />
        </div>
        <div className="column">
          <SCNumericInput
            label="Warranty period"
            required={true}
            onChange={handleWarrantyPeriodChange}
            value={warrantyPeriod}
            min={0}
            format={Enums.NumericFormat.Integer}
          />

        </div>
      </div>
      <div className="row">
        <div className="column">
          <SCNumericInput
            label="Purchase amount"
            required={true}
            onChange={handlePurchaseAmountChange}
            value={purchaseAmount}
            error={inputErrors.PurchaseAmount}
            min={0}
            format={Enums.NumericFormat.Currency}
          />

        </div>
        <div className="column">
          <SCInput
            label="Invoice number"
            required={invoiceNumberRequired}
            onChange={handleInvoiceNumberChange}
            value={invoiceNumber}
            error={inputErrors.InvoiceNumber}
          />

        </div>
      </div>
      <div className="row">
        <div className="column">
          <SCInput
            label="Other number"
            required={serialNumberRequired}
            onChange={handleSerialNumberChange}
            value={serialNumber}
            error={inputErrors.SerialNumber}
          />
        </div>
        <div className="column">
          <SCDatePicker
            label="Last serviced date"
            changeHandler={handleLastServicedDateChange}
            value={lastServicedDate}
          />
        </div>
      </div>
      <div className="row">
        <div className="column">
          <SCInput
            label={field1Label}
            required={field1Required}
            onChange={handleCustomField1Change}
            value={customField1}
            error={inputErrors.CustomField1}
          />
        </div>
        <div className="column">
          <SCInput
            label={field2Label}
            required={field2Required}
            onChange={handleCustomField2Change}
            value={customField2}
            error={inputErrors.CustomField2}
          />
        </div>
      </div>
      <div className="row">
        <div className="column">
          <SCInput
            label={field3Label}
            name="CustomField3"
            onChange={handleFieldChange}
            value={product.CustomField3}
          />
        </div>
        <div className="column">
          <SCInput
            label={field4Label}
            name="CustomField4"
            onChange={handleFieldChange}
            value={product.CustomField4}
          />
        </div>
      </div>
      <div className="row">
        <div className="column">
          <SCDatePicker
            label={date1Label}
            changeHandler={(e) => handleDateFieldChange(e, 'CustomDate1')}
            value={product.CustomDate1}
          />
        </div>
        <div className="column">
          <SCDatePicker
            label={date2Label}
            changeHandler={(e) => handleDateFieldChange(e, 'CustomDate2')}
            value={product.CustomDate2}
          />
        </div>
      </div>
      <div className="row">
        <div className="column">
          <SCCheckbox
            onChange={() => handleFieldChange({ name: "CustomFilter1", value: !product.CustomFilter1 })}
            value={product.CustomFilter1}
            extraClasses="form"
            label={filter1Label}
          />
        </div>
        <div className="column">
          <SCCheckbox
            onChange={() => handleFieldChange({ name: "CustomFilter2", value: !product.CustomFilter2 })}
            value={product.CustomFilter2}
            extraClasses="form"
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
            value={product.CustomNumber1}
            format={Enums.NumericFormat.Decimal}
          />
        </div>
        <div className="column">
          <SCNumericInput
            onChange={handleFieldChange}
            label={number2Label}
            name="CustomNumber2"
            value={product.CustomNumber2}
            format={Enums.NumericFormat.Decimal}
          />
        </div>
      </div>
      <hr/>*/}
      <div className="comments-and-history">
        <ItemComments
          itemID={product.ID}
          module={Enums.Module.Asset}
          storeID={product.StoreID}
          triggerSave={triggerSaveComment}
          // comments={comments}
          // handleCommentChange={handleCommentChange}
          // newComment={newComment}
          // submitComment={saveComment}
          // submitting={submitting}
          // canLoadMoreComments={canLoadMoreComments}
          // loadMoreComments={loadMoreComments}
        />

        <AuditLog recordID={product.ID} retriggerSearch={product} />
      </div>
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
          // flex-basis: 0;
          flex-direction: column;
          // flex-grow: 1;
          width: ${layout.inputWidth};
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
        .store {
          position: absolute;
          right: 0;
          top: 0;
          width: 20rem;
        }
        .comments-and-history {
          padding-right: 3rem;
        }
      `}</style>
    </div>
  );
}

export default ProductDetails;
