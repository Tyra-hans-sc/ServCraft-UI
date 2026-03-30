import React, { useState, useEffect, useContext } from 'react';
import Button from '../../button';
import { colors } from '../../../theme';
import Fetch from '../../../utils/Fetch';
import * as Enums from '../../../utils/enums';
import Helper from '../../../utils/helper';
import InventoryService from '../../../services/inventory/inventory-service';
import ToastContext from '../../../utils/toast-context';
import ManageSupplier from '../supplier/manage-supplier';
import ManageInventoryCategory from '../inventory-category/manage-inventory-category';
import ManageInventorySubCategory from '../inventory-subcategory/manage-inventory-subcategory';
import SCInput from '../../sc-controls/form-controls/sc-input';
import InventoryCategorySelector from '../../selectors/inventory/inventory-category-selector';
import InventorySubcategorySelector from '../../selectors/inventory/inventory-subcategory-selector';
import SCComboBox from '../../sc-controls/form-controls/sc-combobox';
import SCDropDownList from '../../sc-controls/form-controls/sc-dropdownlist';
import SupplierSelector from '../../selectors/supplier/supplier-selector';
import SCNumericInput from '../../sc-controls/form-controls/sc-numeric-input';
import ReactSwitch from '../../react-switch';
import constants from '../../../utils/constants';
import SCSwitch from "../../sc-controls/form-controls/sc-switch";

function ManageInventory({ isNew, inventory, onInventorySave, accessStatus, isService = false }) {

  const toast = useContext(ToastContext);
  const [inputErrors, setInputErrors] = useState({});

  const [inputs, setInputs] = useState({
    Code: isNew ? '' : inventory.Code,
    Description: isNew ? '' : inventory.Description,
    InventoryCategoryDescription: isNew ? '' : inventory.InventoryCategoryDescription,
    InventorySubcategoryDescription: isNew ? '' : inventory.InventorySubcategoryDescription,
    StockItemTypeDescription: isNew ? isService ? Enums.getEnumStringValue(Enums.StockItemType, Enums.StockItemType.Service) : '' : inventory.StockItemTypeDescription,
    WarrantyPeriod: isNew ? 0 : inventory.WarrantyPeriod,
    Quantity: isNew ? 0 : inventory.Quantity,
    SupplierName: isNew ? '' : inventory.SupplierName,
    AdditionalInformation: isNew ? false : inventory.AdditionalInformation,
    IsSerializable: isNew ? false : inventory.IsSerializable,
    CostPrice: isNew ? 0 : inventory.CostPrice,
    ListPrice: isNew ? 0 : inventory.ListPrice,
    CommissionPercentage: isNew ? 0 : inventory.CommissionPercentage,
    BinLocation: isNew ? '' : inventory.BinLocation,
    WebForm: isNew ? false : inventory.WebForm
  });

  const handleInputChange = (e) => {

    let name = e.name;
    let value = e.value;

    switch (name) {
      case "WarrantyPeriod":
          value = Helper.convertToUnsignedValue(value);
          break;
      case "CostPrice":
      case "ListPrice":
      case "CommissionPercentage":
          value = Helper.convertToDecimalValue(value, 2, false);
          break;
      case "Quantity":                
          value = Helper.convertToDecimalValue(value, 2, true);                
          break;
    }

    setInputs({
      ...inputs,
      [name]: value
    });
  };

  const getInventoryCategories = async () => {
    let response = await Fetch.get({
      url: `/InventoryCategory`
    });
    setInventoryCategories(response.Results);
  };

  const getInventorySubcategories = async () => {
    const response = await Fetch.get({
      url: `/InventorySubcategory/GetByCategoryID?inventoryCategoryID=${selectedInventoryCategory.ID}`
    });
    setInventorySubcategories(response.Results);
    setInputs({ ...inputs, InventorySubcategoryDescription: '' });
  };

  const [searching, setSearching] = useState(false);

  const [inventoryCategories, setInventoryCategories] = useState();
  const [selectedInventoryCategory, setSelectedInventoryCategory] = useState();

  const [showCreateInventoryCategory, setShowCreateInventoryCategory] = useState(false);
  const addNewInventoryCategory = () => {
    setShowCreateInventoryCategory(true);
  };

  const onInventoryCategorySave = (inventoryCategory) => {
    if (inventoryCategory) {
      setInventoryCategories([...inventoryCategories, inventoryCategory]);
      setSelectedInventoryCategory(inventoryCategory);
      setInputs({ ...inputs, InventoryCategoryDescription: inventoryCategory.Description });
    }

    setShowCreateInventoryCategory(false);
  };

  const [inventorySubcategories, setInventorySubcategories] = useState();
  const [selectedInventorySubcategory, setSelectedInventorySubcategory] = useState();

  const [showCreateInventorySubcategory, setShowCreateInventorySubcategory] = useState(false);
  const addNewInventorySubcategory = () => {
    if (selectedInventoryCategory) {
      setShowCreateInventorySubcategory(true);
    } else {
      toast.setToast({
        message: `Please select an inventory category first`,
        show: true,
        type: 'error'
      });
    }
  };

  const onInventorySubcategorySave = (inventorySubcategory) => {
    if (inventorySubcategory) {
      setInventorySubcategories([...inventorySubcategories, inventorySubcategory]);
      setSelectedInventorySubcategory(inventorySubcategory);
      setInputs({ ...inputs, InventorySubcategoryDescription: inventorySubcategory.Description });
    }

    setShowCreateInventorySubcategory(false);
  };

  const searchInventoryCategories = () => {
    setSearching(true);

    let temp = inventoryCategories.filter(item => item.Description.toLowerCase().startsWith(inputs.InventoryCategoryDescription.toLowerCase()));
    setInventoryCategories(temp);

    setSearching(false);
  };

  useEffect(() => {
    if (selectedInventoryCategory) {
      getInventorySubcategories();
    }
  }, [selectedInventoryCategory]);

  const [stockItemTypeLockdown, setStockItemTypeLockdown] = useState(isService);
  const [stockItemTypes, setStockItemTypes] = useState(Enums.getEnumItems(Enums.StockItemType));
  const [selectedStockItemType, setSelectedStockItemType] = useState();

  const getSuppliers = async () => {
    const response = await Fetch.get({
      url: `/Supplier`
    });
    setSuppliers(response.Results);
  };

  const [suppliers, setSuppliers] = useState();
  const [selectedSupplier, setSelectedSupplier] = useState();

  const [showCreateSupplier, setShowCreateSupplier] = useState(false);
  const addNewSupplier = () => {
    setShowCreateSupplier(true);
  };

  const onSupplierSave = (supplier) => {
    if (supplier) {
      setSuppliers([...suppliers, supplier]);
      setSelectedSupplier(supplier);
      setInputs({ ...inputs, SupplierName: supplier.Name });
    }

    setShowCreateSupplier(false);
  };

  useEffect(() => {
    getInventoryCategories();
    getSuppliers();
  }, []);

  const [saving, setSaving] = useState(false);

  const save = async () => {

    setSaving(true);

    const { isValid, errors } = InventoryService.validate(inputs, selectedInventoryCategory, selectedInventorySubcategory);
    setInputErrors(errors);

    if (isValid) {
      let response = {};
      let params = {
        ...inputs,
        InventoryCategoryID: selectedInventoryCategory ? selectedInventoryCategory.ID : null,
        InventorySubcategoryID: selectedInventorySubcategory ? selectedInventorySubcategory.ID : null,
        SupplierID: selectedSupplier ? selectedSupplier.ID : null,
        StockItemType: Enums.StockItemType[inputs.StockItemTypeDescription],
      };

      if (isNew) {
        response = await Fetch.post({
          url: `/Inventory`,
          params: params,
        });
      } else {
        response = await Fetch.put({
          url: `/Inventory`,
          params: params
        });
      }

      if (response.ID) {
        Helper.mixpanelTrack(isNew ? constants.mixPanelEvents.createInventory : constants.mixPanelEvents.editInventory, {
          "inventoryID": response.ID
        });
        onInventorySave(response);
      } else {
        toast.setToast({
          message: `Inventory failed to save`,
          show: true,
          type: Enums.ToastType.error
        });
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
  };

  return (
    <div className="overlay" onClick={(e) => e.stopPropagation()}>
      <div className="modal-container">
        <div className="title">
          {isNew ?
            <h1>Creating an Inventory</h1> : 
            <h1>Editing an Inventory</h1>
          }
        </div>

        <div className="row">
          <div className="column">
            <SCInput
              label="Account code"
              hint="Leave blank to auto generate"
              onChange={handleInputChange}
              name="Code"
              value={inputs.Code}
              error={inputErrors.Code}
            />
          </div>
          <div className="column">
            <SCInput
              label="Description for the inventory"
              onChange={handleInputChange}
              required={true}
              name="Description"
              value={inputs.Description}
              error={inputErrors.Description}
            />
          </div>
        </div>
        <div className="row">
          <div className="column">
            <InventoryCategorySelector
              accessStatus={accessStatus}
              error={inputErrors.InventoryCategoryDescription}
              required={true}
              selectedCategory={selectedInventoryCategory}
              setSelectedCategory={(e) => {
                setSelectedInventoryCategory(e);
                handleInputChange({ name: "InventoryCategoryDescription", value: e ? e.Description : null });
              }}
              pageSize={10}
            />

          </div>
          <div className="column">
            <InventorySubcategorySelector
              accessStatus={accessStatus}
              error={inputErrors.InventorySubcategoryDescription}
              required={true}
              selectedCategory={selectedInventoryCategory}
              selectedSubcategory={selectedInventorySubcategory}
              setSelectedSubcategory={(e) => {
                setSelectedInventorySubcategory(e);
                handleInputChange({ name: "InventorySubcategoryDescription", value: e ? e.Description : null });
              }}
              pageSize={10}
            />

          </div>
        </div>
        <div className="row">
          <div className="column">
            <SCDropDownList
              options={stockItemTypes}
              error={inputErrors.StockItemTypeDescription}
              disabled={stockItemTypeLockdown}
              label="Stock Item Type"
              onChange={(e) => {
                setSelectedStockItemType(e);
                handleInputChange({ name: "StockItemTypeDescription", value: e });
              }}
              value={inputs.StockItemTypeDescription}
              name="StockItemTypeDescription"
            />
          </div>
          <div className="column">
            <SupplierSelector
              accessStatus={accessStatus}
              required={false}
              selectedSupplier={selectedSupplier}
              setSelectedSupplier={(e) => {
                setSelectedSupplier(e);
                handleInputChange({ name: "SupplierName", value: e?.Name });
              }}
            />
          </div>
        </div>
        <div className="row">
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
          <div className="column">
            <SCNumericInput
              label="Quantity"
              name="Quantity"
              required={true}
              onChange={handleInputChange}
              value={inputs.Quantity}
              error={inputErrors.Quantity}
              min={0}
              format={Enums.NumericFormat.Decimal}
            />
          </div>
        </div>
        <div className="row">
          <div className="column">
            <SCNumericInput
              label="Cost Price"
              name="CostPrice"
              required={true}
              onChange={handleInputChange}
              value={inputs.CostPrice}
              error={inputErrors.CostPrice}
              format={Enums.NumericFormat.Currency}
              min={0}
            />
          </div>
          <div className="column">
            <SCNumericInput
              label="List Price"
              name="ListPrice"
              required={true}
              onChange={handleInputChange}
              value={inputs.ListPrice}
              error={inputErrors.ListPrice}
              format={Enums.NumericFormat.Currency}
              min={0}
            />
          </div>
        </div>
        <div className="row">
          <div className="column">
            <SCNumericInput
              label="Commission Percentage"
              name="CommissionPercentage"
              required={true}
              onChange={handleInputChange}
              value={inputs.CommissionPercentage}
              error={inputErrors.CommissionPercentage}
              format={Enums.NumericFormat.Percentage}
              min={0}
            />
          </div>
          <div className="column">
            <SCInput
              label="Bin Location"
              onChange={handleInputChange}
              name="BinLocation"
              value={inputs.BinLocation}
              error={inputErrors.BinLocation}
            />
          </div>
        </div>
        <div className="row bottom-padding">
          <div className="margin-top">
            <SCSwitch label="Web Form Searchable" checked={inputs.WebForm}
              onToggle={() => handleInputChange({ name: 'WebForm', value: !inputs.WebForm })} />
            {/*<ReactSwitch label="Web Form Searchable" checked={inputs.WebForm}
                         handleChange={() => handleInputChange({ name: 'WebForm', value: !inputs.WebForm })} />*/}
          </div>
        </div>
        <div className="actions">
          <Button text="Cancel" extraClasses="auto hollow" onClick={() => onInventorySave(null)} />
          <Button extraClasses="auto" text={`${isNew ? `Create` : `Save`}`} onClick={save} disabled={saving} />          
        </div>
      </div>

      {showCreateInventoryCategory ?
        <ManageInventoryCategory isNew={true} onInventoryCategorySave={onInventoryCategorySave} />
        : ''
      }

      {showCreateInventorySubcategory ?
        <ManageInventorySubCategory isNew={true} onInventorySubcategorySave={onInventorySubcategorySave}
          inventoryLockdown={true} defaultInventoryCategory={selectedInventoryCategory} />
        : ''
      }

      {showCreateSupplier ?
        <ManageSupplier isNew={true} onSupplierSave={onSupplierSave} accessStatus={accessStatus} />
        : ''
      }

      <style jsx>{`
        .row {
          display: flex;
          justify-content: space-between;
        }

        .bottom-padding {
          padding-bottom: 40px;
        }

        .actions {
          display: flex;
          flex-direction: row;
          position: absolute;
          right: 1rem;
          bottom: 1rem;
        }

        .actions :global(.button){
          margin-left: 0.5rem;
          margin-top: 1rem;
          padding: 0 1rem;
          white-space: nowrap;
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
          color: ${colors.bluePrimary};
          font-size: 1.125rem;
          font-weight: bold;
        }
        
        .margin-top {
          margin-top: 1rem;
        }

      `}</style>
    </div>
  );
}

export default ManageInventory;
