import React, { useState, useEffect, useContext } from 'react';
import { colors, fontSizes, layout, fontFamily } from '../../../theme';
import Button from '../../button';
import Switch from '../../switch';

import SCInput from '../../sc-controls/form-controls/sc-input';
import SCNumericInput from '../../sc-controls/form-controls/sc-numeric-input';
import SCCheckbox from '../../sc-controls/form-controls/sc-checkbox';
import SCDatePicker from '../../sc-controls/form-controls/sc-datepicker';

import ReactSwitch from '../../react-switch';
import Fetch from '../../../utils/Fetch';
import * as Enums from '../../../utils/enums';
import Helper from '../../../utils/helper';
import ToastContext from '../../../utils/toast-context';
import InventorySelector from '../../selectors/inventory/inventory-selector';
import AssetSelector from '../../selectors/asset/asset-selector';
import PS from '../../../services/permission/permission-service';
import WarrantyIndicator from '../../product/warranty-indicator';
import SCSwitch from "../../sc-controls/form-controls/sc-switch";

function ManageJobInventory({ isNew, jobInventoryItem, onJobInventoryItemSave, job, accessStatus, jobSingleItem, linkedProductIDs, 
  type = 'Job', jobItemSelection = Enums.JobItemSelection.Both, jobItemOrder = Enums.JobItemOrder.Inventory, 
  filterStockItemStatus = false, filteredStockItemStatus = Enums.StockItemStatus.None, cypressItem, cypressQty }) {

  const toast = useContext(ToastContext);

  // const [inventoryPermission] = useState(PS.hasPermission(Enums.PermissionName.Inventory));
  const [productPermission] = useState(PS.hasPermission(Enums.PermissionName.Product));

  // const [searching, setSearching] = useState(false);
  const [inputErrors, setInputErrors] = useState({});

  const [switchItem, setSwitchItem] = useState('');
  const [switchOptions, setSwitchOptions] = useState(['Inventory', 'Asset']);

  const [customerContactSet, setCustomerContactSet] = useState(!Helper.isNullOrUndefined(job.CustomerID) && !Helper.isNullOrUndefined(job.CustomerContactID));

  const getInventory = async (inventoryID) => {
    let inventoryResult = await Fetch.get({
      url: `/Inventory`,
      params: { id: inventoryID },
    });
    setSelectedInventory(inventoryResult);
  };

  const getProduct = async (productID) => {
    let productResult = await Fetch.get({
      url: '/Product',
      params: { id: productID },
    })
    setSelectedProduct(productResult);
  };

  useEffect(() => {
    if (!isNew) {
      if (jobInventoryItem) {
        if (jobInventoryItem.InventoryID) {
          getInventory(jobInventoryItem.InventoryID);
        }
        if (jobInventoryItem.ProductID) {
          getProduct(jobInventoryItem.ProductID);
          setShowAllAssetsButton(true);
        }
      }
    }

    let options = [];
    let selectedOption = '';

    if (jobItemSelection === Enums.JobItemSelection.Both) {
      if (jobItemOrder === Enums.JobItemOrder.Inventory) {
        options.push('Inventory', 'Asset');
        selectedOption = isNew ? 'Inventory' : jobInventoryItem.ProductID ? 'Asset' : 'Inventory';
      } else {
        options.push('Asset', 'Inventory');
        selectedOption = isNew ? 'Asset' : jobInventoryItem.ProductID ? 'Asset' : 'Inventory';
      }
    } else if (jobItemSelection === Enums.JobItemSelection.Inventory) {
      options.push('Inventory');
      selectedOption = 'Inventory';
    } else {
      options.push('Asset');
      selectedOption = 'Asset';
    }

    if (options.includes('Asset')) {
      if (!customerContactSet) {
        let i = options.indexOf('Asset');
        options[i] = '|Asset|';
        if (options.includes('Inventory')) {
          selectedOption = 'Inventory';
        } else {
          selectedOption = '';
        }
      }
    }

    setSwitchItem(isNew ? selectedOption : jobInventoryItem.ProductID ? 'Asset' : 'Inventory');
    setSwitchOptions(options);
  }, []);

  const [saving, setSaving] = useState(false);

  const saveItem = () => {

    setSaving(true);
    let validationItems = '';

    if (switchItem === 'Inventory') {
      validationItems = [
        { key: 'Inventory', value: selectedInventory, required: true, type: Enums.ControlType.Select },
        { key: 'Quantity', value: quantity, required: true, gt: jobSingleItem ? 0.99 : 0, type: Enums.ControlType.Number, lt: jobSingleItem ? 1.01 : null },
      ];
    } else {
      validationItems = [
        { key: 'Product', value: selectedProduct, required: true, type: Enums.ControlType.Select },
      ];
    }

    const { isValid, errors } = Helper.validateInputs(validationItems);
    setInputErrors(errors);
    if (isValid) {

      let item = {
        ID: jobInventoryItem ? jobInventoryItem.ID : null,
        RowVersion: jobInventoryItem ? jobInventoryItem.RowVersion : null,
        LineNumber: jobInventoryItem ? jobInventoryItem.LineNumber : 1,
        IsActive: true,
        UnitAmount: 0,
      };

      if (type === 'Job') {
        item = {...item,
          JobCardID: job.ID,
          QuantityAllocated: 0,
          QuantityOutstanding: 0,
          QuantityReturned: 0,
          QuantityReturnPending: 0,
        };
      } else {
        item = {...item,
          JobScheduleID: job.ID,
        };
      }

      if (switchItem === 'Inventory') {
        item = {...item,
          InventoryID: selectedInventory.ID,
          InventoryCode: selectedInventory.Code,
          InventoryDescription: selectedInventory.Description,
        };
        if (type === 'Job') {
          item = {...item,
            QuantityRequested: parseFloat(quantity),
            StockItemStatus: stockItemStatus,
            Billable: billableSwitch,
          };
        } else {
          item = {...item,
            Quantity: parseFloat(quantity),
            StockItemStatus: selectedInventory.StockItemType === Enums.StockItemType.Service ? Enums.StockItemStatus.ItemUsed : Enums.StockItemStatus.WorkedOn,
            Billable: false,
          };
        }
      } else {

        if (isNew && linkedProductIDs.includes(selectedProduct.ID)) {
          toast.setToast({
            message: 'This asset has already been added to the job',
            show: true,
            type: Enums.ToastType.error
          });
          setSaving(false);
          return;
        }

        item = {...item,
          InventoryID: selectedProduct.InventoryID,
          ProductNumber: selectedProduct.ProductNumber,
          InventoryDescription: selectedProduct.InventoryDescription,
          ProductID: selectedProduct.ID,
          WarrantyPeriod: warrantyPeriod,
          SerialNumber: serialNumber,
          StockItemStatus: filterStockItemStatus ? stockItemStatus : Enums.StockItemStatus.WorkedOn,
          Billable: false,
        };
        if (type === 'Job') {
          item = {...item,
            QuantityRequested: 1,
          };
        } else {
          item = {...item,
            Quantity: 1,
          };
        }
      }

      // console.log('saving item ', item)

      onJobInventoryItemSave(item);
      //setSaving(false);
    } else {
      setSaving(false);
      toast.setToast({
        message: 'There are errors on the page',
        show: true,
        type: Enums.ToastType.error
      });
    }
  };

  const [selectedInventory, setSelectedInventory] = useState();  

  useEffect(() => {
    if (selectedInventory) {
      if (selectedInventory.StockItemType === Enums.StockItemType.Service) {
        setWorkedOnSwitchActive(false);
        setWorkedOnSwitch(false);
      } else {
        setWorkedOnSwitchActive(true);
      }
    }
  }, [selectedInventory]);

  const [stockItemStatus, setStockItemStatus] = useState(filterStockItemStatus ? filteredStockItemStatus : isNew ? Enums.StockItemStatus.None : jobInventoryItem.StockItemStatus);
  const [showStockItemStatus, setShowStockItemStatus] = useState(type === 'Job');
  const [workedOnSwitch, setWorkedOnSwitch] = useState(isNew ? true : jobInventoryItem.StockItemStatus === Enums.StockItemStatus.WorkedOn);
  const [workedOnSwitchActive, setWorkedOnSwitchActive] = useState(true);
  const [billableSwitch, setBillableSwitch] = useState(isNew ? false : jobInventoryItem.Billable);
  const [billableSwitchActive, setBillableSwitchActive] = useState(false);

  const handleWorkedOnChanged = () => {
    setWorkedOnSwitch(!workedOnSwitch);
  };

  const handleBillableChanged = () => {
    setBillableSwitch(!billableSwitch);
  };

  // PRODUCT

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [triggerEditProduct, setTriggerEditProduct] = useState(false);
  const [transferable, setTransferable] = useState(false);
  const [showAllAssetsButton, setShowAllAssetsButton] = useState(false);

  const [triggerNewProduct, setTriggerNewProduct] = useState(false);

  const onProductCreate = (product) => {
    setTriggerNewProduct(true);
  };

  const onAssetSave = (result) => {
    //saveItem();
    setSelectedProduct(result);
    setTriggerNewProduct(true);    
  };

  useEffect(() => {
    if (triggerNewProduct) {
      saveItem();
      setTriggerNewProduct(false);
    }    
  }, [triggerNewProduct]);  

  useEffect(() => {
    if (switchItem === "Asset") {
      setShowAllAssetsButton(true);
    } else {
      setShowAllAssetsButton(false);
    }
  }, [switchItem]);

  useEffect(() => {

    if (selectedProduct && selectedProduct.PurchaseDate) {
      setPurchaseDate(selectedProduct.PurchaseDate);
    } else {
      setPurchaseDate(null);
    }

    setPurchaseAmount(selectedProduct ? selectedProduct.PurchaseAmount ? selectedProduct.PurchaseAmount : 0 : 0);
    setInvoiceNumber(selectedProduct ? selectedProduct.InvoiceNumber ? selectedProduct.InvoiceNumber : '' : '');
    setSerialNumber(selectedProduct ? selectedProduct.SerialNumber ? selectedProduct.SerialNumber : '' : '');
    setProductNumber(selectedProduct ? selectedProduct.ProductNumber ? selectedProduct.ProductNumber : '' : '');
    setWarrantyPeriod(selectedProduct ? selectedProduct.WarrantyPeriod ? selectedProduct.WarrantyPeriod : 0 : 0);

  }, [selectedProduct]);

  const [quantity, setQuantity] = useState(isNew ? 1 : type === 'Job' ? jobInventoryItem.QuantityRequested : jobInventoryItem.Quantity);
  
  const handleQuantityChange = (e) => {
    let value = parseFloat(e.value);
    if (value < 0 || Helper.isNullOrUndefined(value)) {
      value = 0;
    } else {
      let temp = Helper.countDecimals(value);
      if (temp >= 3) {
        value = value.toFixed(2);
      }
    }
    setQuantity(value);
  };

  const [purchaseDate, setPurchaseDate] = useState();

  const handlePurchaseDateChange = (value) => {
    setPurchaseDate(value);
  };

  const [purchaseAmount, setPurchaseAmount] = useState(0);

  const handlePurchaseAmountChange = (e) => {
    let value = e.value;
    if (value < 0 || Helper.isNullOrUndefined(value)) {
      value = 0;
    }
    setPurchaseAmount(parseFloat(value));
  };

  const [invoiceNumber, setInvoiceNumber] = useState('');

  const handleInvoiceNumberChange = (e) => {
    setInvoiceNumber(e.value);
  };

  const [serialNumber, setSerialNumber] = useState(isNew ? '' : jobInventoryItem.SerialNumber);

  const handleSerialNumberChange = (e) => {
    setSerialNumber(e.value);
  };

  const [productNumber, setProductNumber] = useState('');

  const [warrantyPeriod, setWarrantyPeriod] = useState(0);

  const getIgnoreIDs = () => {
    let ids = [...linkedProductIDs];

    if (jobInventoryItem && jobInventoryItem.ProductID) {
      ids.splice(ids.indexOf(jobInventoryItem.ProductID), 1);
    }

    return ids;
  };

  return (
    <div className="overlay" onClick={(e) => e.stopPropagation()}>
      <div className="modal-container">
        <div className="modal-title">
          {isNew ?
            <h1>{filterStockItemStatus ? filteredStockItemStatus === Enums.StockItemStatus.WorkedOn ? 'Add an Item Worked on' : 'Add Materials' : 'Adding a Job Item'}</h1> :
            <div className="row">
              <h1>{filterStockItemStatus ? filteredStockItemStatus === Enums.StockItemStatus.WorkedOn ? 'Edit an Item Worked on' : 'Edit Materials' : 'Editing a Job Item'}</h1>
              {showAllAssetsButton ? <div className="show-all-assets-edit">
                <SCCheckbox onChange={() => setTransferable(!transferable)}
                  value={transferable}
                  extraClasses="no-margin"
                  label="Show assets for all customers"
                /></div> : ''
              }
              {selectedProduct ? <div className="indicator">
                <WarrantyIndicator purchaseDate={selectedProduct.PurchaseDate} warrantyPeriod={selectedProduct.WarrantyPeriod} />
              </div> : ""}
            </div>
          }
        </div>
        {isNew ?
          <div className={`${showAllAssetsButton ? '' : ''} row`}>
            <Switch options={switchOptions} selectedOption={switchItem} setSelected={setSwitchItem} />
            {showAllAssetsButton ?
              <div className="show-all-assets">
                <SCCheckbox onChange={() => setTransferable(!transferable)}
                  value={transferable}
                  extraClasses="no-margin"
                  label="Show assets for all customers"
                />
              </div> : ''
            }
            {switchItem === 'Asset' && selectedProduct ? <div className="indicator">
              <WarrantyIndicator purchaseDate={selectedProduct.PurchaseDate} warrantyPeriod={selectedProduct.WarrantyPeriod} />
            </div> : ""}
          </div> : ''
        }

        {switchItem === 'Inventory' ?
          <>
            <div className="row">
              <div className="column">
                <InventorySelector
                    selectedInventory={selectedInventory}
                    setSelectedInventory={setSelectedInventory}
                    accessStatus={accessStatus}
                    error={inputErrors.Inventory}
                />
              </div>
            </div>
            <div className="row">
              <div className="column">
                <SCNumericInput
                  label="Quantity"
                  required={true}
                  format={Enums.NumericFormat.Decimal}
                  onChange={handleQuantityChange}
                  value={quantity}
                  error={inputErrors.Quantity}
                  readOnly={jobSingleItem}
                />
              </div>
            </div>
            {showStockItemStatus && false ? 
              <div className="row switch">
                <div className="column">
                  <SCSwitch
                    checked={workedOnSwitch}
                    onToggle={() => handleWorkedOnChanged()}
                    label="Worked On"
                    disabled={!workedOnSwitchActive}
                  />
                  {/*<ReactSwitch
                    checked={workedOnSwitch}
                    handleChange={() => handleWorkedOnChanged()}
                    label="Worked On"
                    disabled={!workedOnSwitchActive}
                  />*/}
                </div>
                <div className="column">
                  <SCSwitch
                    checked={billableSwitch}
                    onToggle={() => handleBillableChanged()}
                    label="Billable"
                    disabled={!billableSwitchActive}
                  />
                  {/*<ReactSwitch
                    checked={billableSwitch}
                    handleChange={() => handleBillableChanged()}
                    label="Billable"
                    disabled={!billableSwitchActive}
                  />*/}
                </div>
              </div> 
              : ''
            }
          </> : ''
        }

        {switchItem === 'Asset' ?
          <>
            <div className="row">
              <div className="column">
                {/* <ProductSelector ignoreIDs={getIgnoreIDs()} selectedProduct={selectedProduct} setSelectedProduct={setSelectedProduct} 
                  triggerEdit={triggerEditProduct} setTriggerEdit={setTriggerEditProduct} onProductCreate={onProductCreate}
                  customerID={job.CustomerID} customerContactID={job.CustomerContactID} locationID={job.LocationID}
                  isRequired={true} inputErrors={inputErrors} accessStatus={accessStatus} transferable={transferable} setTransferable={setTransferable} /> */}

                  <AssetSelector  
                    selectedAsset={selectedProduct} 
                    setSelectedAsset={setSelectedProduct}
                    triggerEdit={triggerEditProduct} 
                    setTriggerEdit={setTriggerEditProduct}
                    customerID={job.CustomerID} 
                    contactID={job.CustomerContactID} 
                    locationID={job.LocationID}
                    onSave={onAssetSave}
                    isRequired={true}
                    transferable={transferable} 
                    setTransferable={setTransferable}
                    error={inputErrors.Product}
                    accessStatus={accessStatus}
                    ignoreIDs={getIgnoreIDs()}
                    module={Enums.Module.JobCard}
                  />
              </div>
            </div>
            <div className="row">
              <div className="column">
                <SCInput
                  label="Asset/Serial Number"
                  value={productNumber}
                  disabled={true}
                />
              </div>
            </div>
            <div className="row">
              <div className="column">
                <SCDatePicker
                  label='Purchase Date'
                  value={purchaseDate}
                  error={inputErrors.PurchaseDate}
                  disabled={true}
                />
              </div>
              <div className="column">
                <SCNumericInput
                  label="Warranty Period"
                  value={warrantyPeriod}
                  disabled={true}
                  min={0}
                  format={Enums.NumericFormat.Integer}
                />
              </div>
            </div>
            <div className="row">

              <div className="column">
                <SCNumericInput
                  label="Purchase Amount"
                  value={purchaseAmount}
                  error={inputErrors.PurchaseAmount}
                  disabled={true}
                  min={0}
                  format={Enums.NumericFormat.Currency}
                />
              </div>
              <div className="column">
                <SCInput
                  label="Invoice Number"
                  value={invoiceNumber}
                  error={inputErrors.InvoiceNumber}
                  disabled={true}
                />
              </div>
            </div>
            <div className="row">
              <div className="column">
                <SCInput
                  label="Other Number"
                  value={serialNumber}
                  error={inputErrors.SerialNumber}
                  disabled={true}
                />
              </div>
              <div className="column">
               
              </div>
            </div>
          </> : ''
        }

        <div className="row align-end">         
          <Button text="Cancel" extraClasses="hollow auto" onClick={() => onJobInventoryItemSave(null)} />
          
          {selectedProduct && productPermission && switchItem === 'Asset' ?
              <Button text="Edit Asset" extraClasses="hollow auto left-margin" onClick={() => setTriggerEditProduct(true)} />
           : ''
          }
            <Button text={`${isNew ? 'Add' : 'Save'}`} extraClasses="auto left-margin" onClick={saveItem} disabled={saving} cypressAdd={"data-cy-btn-add"} />          
        </div>
      </div>
      <style jsx>{`

      .align-end {
        justify-content: flex-end;
        align-items: flex-end;
      }
      .title {
        position: relative;
        color: ${colors.bluePrimary};
        font-size: 1.125rem;
        font-weight: bold;
      }

      .indicator {
        position: absolute;
        right: 0;
      }

      .show-all-assets {
        position: absolute;
        left: 190px;
        bottom: 10px;
      }

      .show-all-assets-edit {
        position: absolute;
        left: 268px;
        bottom: 36px;
      }

      .modal-container {
      }
      .row {
        display: flex;       
        position: relative;
      }
      .column {
        display: flex;
        flex-direction: column;
        width: 100%;
      }
      .column + .column {
        margin-left: 1.25rem;
      }
      .title {
        display: block;
      }
      .inventory-item-container {
        display: flex;
        flex-direction: row;
        width: 100%;
      }
      .description-container {

      }
      .total-row {
        font-weight: bold;
        margin-top: 1rem;
      }
      .end {
        align-items: flex-end;
      }

      .bottom-padding {
        padding-bottom: 40px;
      }

      .left-padding {
        padding-left: 0.5em;
      }
      .right-padding {
        padding-right: 0.5em;
      }

      .switch {
        margin-top: 1rem;
      }
    `}</style>
    </div>
  );
}

export default ManageJobInventory;
