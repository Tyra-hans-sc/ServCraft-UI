import React, { useState, useEffect, useContext } from 'react';
import Button from '../../button';

import SCInput from '../../sc-controls/form-controls/sc-input';
import SCNumericInput from '../../sc-controls/form-controls/sc-numeric-input';
import SCCheckbox from '../../sc-controls/form-controls/sc-checkbox';
import SCDatePicker from '../../sc-controls/form-controls/sc-datepicker';

import { colors } from '../../../theme';
import Fetch from '../../../utils/Fetch';
import Time from '../../../utils/time';
import * as Enums from '../../../utils/enums';
import Helper from '../../../utils/helper';
import OptionService from '../../../services/option/option-service';
import InventoryService from '../../../services/inventory/inventory-service';
import ToastContext from '../../../utils/toast-context';
import WarrantyIndicator from '../../product/warranty-indicator';

import InventorySelector from '../../selectors/inventory/inventory-selector';

function ManageAsset({ isNew, product, onProductSave, accessStatus }) {

  const toast = useContext(ToastContext);
  const [inputErrors, setInputErrors] = useState({});

  useEffect(() => {
    getCustomFields();

    if (!isNew) {
      if (product.Inventory) {
        setSelectedInventory(product.Inventory);
      } else {
        getSelectedInventory();
      }
    }
  }, []);

  const [inputs, setInputs] = useState({
    CustomerID: product ? product.CustomerID : null,
    CustomerContactID: product ? product.CustomerContactID : null,
    LocationID: product ? product.LocationID : null,
    InventoryID: isNew ? null : product.InventoryID,
    InventoryDescription: isNew ? '' : product.InventoryDescription,
    PurchaseDate: isNew ? Time.now() : product.PurchaseDate,
    PurchaseAmount: isNew ? 0 : product.PurchaseAmount,
    InvoiceNumber: isNew ? '' : product.InvoiceNumber,
    SerialNumber: isNew ? '' : product.SerialNumber,
    CustomField1: isNew ? '' : product.CustomField1,
    CustomField2: isNew ? '' : product.CustomField2,
    CustomField3: isNew ? '' : product.CustomField3,
    CustomField4: isNew ? '' : product.CustomField4,
    CustomFilter1: isNew ? false : product.CustomFilter1,
    CustomFilter2: isNew ? false : product.CustomFilter2,
    CustomDate1: isNew ? null : product.CustomDate1,
    CustomDate2: isNew ? null : product.CustomDate2,
    CustomNumber1: isNew ? null : product.CustomNumber1,
    CustomNumber2: isNew ? null : product.CustomNumber2,
    WarrantyPeriod: isNew ? 0 : product.WarrantyPeriod,
    LastServicedDate: isNew ? Time.now() : product.LastServicedDate,
    ProductNumber: isNew ? '' : product.ProductNumber,
  });

  const handleInputChange = (e) => {
    setInputs({
      ...inputs,
      [e.name]: e.value
    });
  };

  const dateChanged = (e, fieldName) => {
    setInputs({
      ...inputs,
      [fieldName]: Time.toISOString(Time.updateDate(inputs[fieldName], e.value))
    });
  };

  // INVENTORY

  const [selectedInventory, setSelectedInventory] = useState();

  const getSelectedInventory = async () => {
    setSelectedInventory(await InventoryService.getInventory(product.InventoryID));
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
  const [field1Required, setField1Required] = useState(false);
  const [field2Required, setField2Required] = useState(false);
  const [serialNumberRequired, setSerialNumberRequired] = useState(false);
  const [invoiceNumberRequired, setInvoiceNumberRequired] = useState(false);

  const getCustomFields = async () => {

    const customFields = await OptionService.getCustomFields(Enums.Module.Asset);

    let { fieldLabel1, fieldLabel2, fieldLabel3, fieldLabel4, dateFieldLabel1, dateFieldLabel2,
      filterFieldLabel1, filterFieldLabel2, numberFieldLabel1, numberFieldLabel2,
      field1Required, field2Required, serialNumberRequired, invoiceNumberRequired, locationRequired } =
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

    setSerialNumberRequired(serialNumberRequired);
    setInvoiceNumberRequired(invoiceNumberRequired);
    setField1Required(field1Required);
    setField2Required(field2Required);    
  };

  const validate = () => {

    let validationItems = [
      { key: 'PurchaseDate', value: inputs.PurchaseDate, required: true, type: Enums.ControlType.Date },
      { key: 'PurchaseAmount', value: inputs.PurchaseAmount, required: true, type: Enums.ControlType.Number },
      { key: 'WarrantyPeriod', value: inputs.WarrantyPeriod, required: true, type: Enums.ControlType.Number },
      { key: 'Inventory', value: selectedInventory, required: true, type: Enums.ControlType.Select },
    ];

    if (field1Required) {
      validationItems = [...validationItems,
      { key: 'CustomField1', value: inputs.CustomField1, required: true, type: Enums.ControlType.Text }];
    }

    if (field2Required) {
      validationItems = [...validationItems,
      { key: 'CustomField2', value: inputs.CustomField2, required: true, type: Enums.ControlType.Text }];
    }

    if (serialNumberRequired) {
      validationItems = [...validationItems,
      { key: 'SerialNumber', value: inputs.SerialNumber, required: true, type: Enums.ControlType.Text }];
    }

    if (invoiceNumberRequired) {
      validationItems = [...validationItems,
      { key: 'InvoiceNumber', value: inputs.InvoiceNumber, required: true, type: Enums.ControlType.Text }];
    }

    const { isValid, errors } = Helper.validateInputs(validationItems);
    setInputErrors(errors);
    return isValid;
  };

  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);

    let isValid = validate();
    if (isValid) {
      if (isNew) {
        const productPost = await Fetch.post({
          url: `/Product`,
          params: {
            ...inputs,
            InventoryID: selectedInventory ? selectedInventory.ID : null,
          },
          toastCtx: toast
        });
        if (productPost.ID) {
          toast.setToast({
            message: `Asset created successfully`,
            show: true,
            type: Enums.ToastType.success
          });
          onProductSave(productPost);
        } else {
          setSaving(false);
        }
      } else {
        let productToUpdate = { ...product, ...inputs };
        const productPut = await Fetch.put({
          url: `/Product`,
          params: {
            ...productToUpdate,
            InventoryID: selectedInventory ? selectedInventory.ID : null,
          },
          toastCtx: toast
        });
        if (productPut.ID) {
          toast.setToast({
            message: `Asset saved successfully`,
            show: true,
            type: Enums.ToastType.success
          });
          onProductSave(productPut);
        } else {
          setSaving(false);
        }
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
  };

  return (
    <div className="overlay" onClick={(e) => e.stopPropagation()}>
      <div className="modal-container">
        <div className="title">
          {isNew ?
            <h1>Creating an Asset</h1> :
            <h1>Editing an Asset</h1>
          }
        </div>
        <div className="row">
          <div className="column">
            <InventorySelector selectedInventory={selectedInventory} setSelectedInventory={setSelectedInventory} 
              accessStatus={accessStatus} error={inputErrors.Inventory}
            />
          </div>
        </div>
        <div className="row">
          <div className="column">
            <SCInput
              label={`Asset/Serial Number ${isNew ? '(Leave blank to auto generate)' : ''}`}
              onChange={handleInputChange}
              name="ProductNumber"
              value={inputs.ProductNumber}
              error={inputErrors.ProductNumber}
            />
          </div>
          <div className="column">
            <div className="indicator">
              <WarrantyIndicator purchaseDate={inputs.PurchaseDate} warrantyPeriod={inputs.WarrantyPeriod} />
            </div>
          </div>
        </div>
        <div className="row">
          <div className="column">
            <SCDatePicker
              label="Purchase date"
              required={true}
              name="PurchaseDate"
              changeHandler={(e) => dateChanged(e, "PurchaseDate")}
              value={inputs.PurchaseDate}
              error={inputErrors.PurchaseDate}
            />
          </div>
          <div className="column">
            <SCNumericInput
              label="Warranty period"
              name="WarrantyPeriod"
              required={true}
              onChange={handleInputChange}
              value={inputs.WarrantyPeriod}
              error={inputErrors.WarrantyPeriod}
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
              onChange={handleInputChange}
              name="PurchaseAmount"
              value={inputs.PurchaseAmount}
              error={inputErrors.PurchaseAmount}
              min={0}
              format={Enums.NumericFormat.Currency}
            />
          </div>
          <div className="column">
            <SCInput
              label="Invoice number"
              name="InvoiceNumber"
              required={invoiceNumberRequired}
              onChange={handleInputChange}
              value={inputs.InvoiceNumber}
              error={inputErrors.InvoiceNumber}
            />
          </div>
        </div>
        <div className="row">
          <div className="column">
            <SCInput
              label="Other number"
              name="SerialNumber"
              required={serialNumberRequired}
              onChange={handleInputChange}
              value={inputs.SerialNumber}
              error={inputErrors.SerialNumber}
            />
          </div>
          <div className="column">
            <SCDatePicker
              label="Last serviced date"
              name="LastServicedDate"
              changeHandler={(e) => dateChanged(e, "LastServicedDate")}
              value={inputs.LastServicedDate}
            />
          </div>
        </div>
        <div className="row">
          <div className="column">
            <SCInput
              label={field1Label}
              name="CustomField1"
              required={field1Required}
              onChange={handleInputChange}
              value={inputs.CustomField1}
              error={inputErrors.CustomField1}
            />
          </div>
          <div className="column">
            <SCInput
              label={field2Label}
              name="CustomField2"
              required={field2Required}
              onChange={handleInputChange}
              value={inputs.CustomField2}
              error={inputErrors.CustomField2}
            />
          </div>
        </div>
        <div className="row">
          <div className="column">
            <SCInput
              label={field3Label}
              name="CustomField3"
              onChange={handleInputChange}
              value={inputs.CustomField3}
            />
          </div>
          <div className="column">
            <SCInput
              label={field4Label}
              name="CustomField4"
              onChange={handleInputChange}
              value={inputs.CustomField4}
            />
          </div>
        </div>
        <div className="row">
          <div className="column">
            <SCDatePicker
              label={date1Label}
              name="CustomDate1"
              changeHandler={(e) => dateChanged(e, "CustomDate1")}
              value={inputs.CustomDate1}
            />
          </div>
          <div className="column">
            <SCDatePicker
              label={date2Label}
              name="CustomDate2"
              changeHandler={(e) => dateChanged(e, "CustomDate2")}
              value={inputs.CustomDate2}
            />
          </div>
        </div>
        <div className="row">
          <div className="column">
            <SCCheckbox
              onChange={() => handleInputChange({name: "CustomFilter1", value: !inputs.CustomFilter1})}
              value={inputs.CustomFilter1}
              label={filter1Label}
            />
          </div>
          <div className="column">
            <SCCheckbox
              onChange={() => handleInputChange({name: "CustomFilter2", value: !inputs.CustomFilter2})}
              value={inputs.CustomFilter2}
              label={filter2Label}
            />
          </div>
        </div>
        <div className="row">
          <div className="column">
            <SCNumericInput 
              onChange={handleInputChange}
              label={number1Label}
              name="CustomNumber1"
              value={inputs.CustomNumber1}
              format={Enums.NumericFormat.Decimal}
            />
          </div>
          <div className="column">
            <SCNumericInput 
              onChange={handleInputChange}
              label={number2Label}
              name="CustomNumber2"
              value={inputs.CustomNumber2}
              format={Enums.NumericFormat.Decimal}
            />
          </div>
        </div>

        <div className="row align-end">
            <Button text="Cancel" extraClasses="hollow auto" onClick={() => onProductSave(null)} />          
            <Button text={`${isNew ? `Create` : `Save`}`} extraClasses="auto left-margin" onClick={save} disabled={saving} />          
        </div>
      </div>

      <style jsx>{`
        .row {
          display: flex;
          justify-content: space-between;
        }
        .column {
          display: flex;
          flex-direction: column;
          width: 100%;
          margin-left: 0.5rem;
          position: relative;
        }
        .align-end {
          justify-content: flex-end;
          align-items: flex-end;
        }
        .title {
          color: ${colors.bluePrimary};
          font-size: 1.125rem;
          font-weight: bold;
          margin-bottom: 1rem;
        }
        .cancel {
          width: 6rem;
        }
        .update {
          width: 14rem;
        }

        .indicator {
          position: absolute;
          top: 16px;
          right: 0px;
        }

      `}</style>
    </div>
  );
}

export default ManageAsset;
