import React, { useState, useEffect, useContext, useRef } from 'react';
import { colors, layout } from '../../theme';
import TextInput from '../text-input';
import SelectInput from '../select-input';
import Fetch from '../../utils/Fetch';
import * as Enums from '../../utils/enums';
import ItemComments from '../shared-views/item-comments';
import ReactSwitch from '../react-switch';
import ManageInventoryCategory from '../modals/inventory-category/manage-inventory-category';
import ManageInventorySubcategory from '../modals/inventory-subcategory/manage-inventory-subcategory';
import SupplierSelector from '../selectors/supplier/supplier-selector';
import ToastContext from '../../utils/toast-context';
import AuditLog from '../shared-views/audit-log';
import SCSwitch from "../sc-controls/form-controls/sc-switch";

function InventoryDetails(props) {

  const toast = useContext(ToastContext);
  // const [submitting, setSubmitting] = useState(false);
  const [searching, setSearching] = useState(false);

  const [code, setCode] = useState(props.inventory.Code);

  const handleCodeChange = (e) => {
    props.updateInventory('Code', e.target.value);
    setCode(e.target.value);
  };

  const [description, setDescription] = useState(props.inventory.Description);

  const handleDescriptionChange = (e) => {
    props.updateInventory('Description', e.target.value);
    setDescription(e.target.value);
  };

  const [inventoryCategories, setInventoryCategories] = useState(props.inventoryCategories);
  const [inventoryCategorySearch, setInventoryCategorySearch] = useState(props.inventory.InventoryCategoryDescription);
  const [selectedInventoryCategory, setSelectedInventoryCategory] = useState();

  const handleInventoryCategoryChange = (e) => {
    setInventoryCategorySearch(e.target.value);
  };

  function searchInventoryCategories() {
    setSearching(true);

    let inventoryCategories = props.inventoryCategories.filter(item => item.Description.toLowerCase().startsWith(inventoryCategorySearch.toLowerCase()));
    setInventoryCategories(inventoryCategories);

    setSearching(false);
  };

  const [showCreateInventoryCategory, setShowCreateInventoryCategory] = useState(false);

  const addNewInventoryCategory = () => {
    setShowCreateInventoryCategory(true);
  };

  const onInventoryCategorySave = (inventoryCategory) => {
    if (inventoryCategory) {
      setInventoryCategories([...inventoryCategories, inventoryCategory]);
      setSelectedInventoryCategory(inventoryCategory);
      setInventoryCategorySearch(inventoryCategory.Description);
    }

    setShowCreateInventoryCategory(false);
  };

  // #region Inventory Subcategory

  const [inventorySubcategories, setInventorySubcategories] = useState(props.inventorySubcategories);
  const [inventorySubcategorySearch, setInventorySubcategorySearch] = useState(props.inventory.InventorySubcategoryDescription);

  const setSelectedInventorySubcategory = (inventorySubcategory) => {
    props.updateInventory('InventorySubcategoryID', inventorySubcategory ? inventorySubcategory.ID : null);
  };

  const handleInventorySubcategoryChange = (e) => {
    setInventorySubcategorySearch(e.target.value);
  };

  const getInventorySubcategories = async () => {
    const inventorySubcategories = await Fetch.get({
      url: `/InventorySubcategory/GetByCategoryID?inventoryCategoryID=${selectedInventoryCategory.ID}`
    });
    setInventorySubcategories(inventorySubcategories.Results);
    setInventorySubcategorySearch('');
  };

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
      setInventorySubcategorySearch(inventorySubcategory.Description);
    }

    setShowCreateInventorySubcategory(false);
  };

  const firstInventoryCategoryUpdate = useRef(true);

  useEffect(() => {
    
    if (firstInventoryCategoryUpdate.current) {
      firstInventoryCategoryUpdate.current = false;
      return;
    }

    if (selectedInventoryCategory) {
      props.updateInventory('InventoryCategoryID', selectedInventoryCategory.ID);
      getInventorySubcategories();
    } else {
      setInventoryCategorySearch('');
      setInventorySubcategories([]);
      setInventorySubcategorySearch('');

      props.updateInventoryBulk(null, null, [
        {key: 'InventoryCategoryID', value: null},
        {key: 'InventorySubcategoryID', value: null},
      ]);
    }
  }, [selectedInventoryCategory]);
  
  // #endregion

  const stockItemTypes = props.stockItemTypes;

  const [stockItemTypeSearch, setStockItemTypeSearch] = useState(Enums.getEnumStringValue(Enums.StockItemType, props.inventory.StockItemType));

  const setSelectedStockItemType = (stockItemType) => {
    props.updateInventory('StockItemType', stockItemType);
  };

  const handleStockItemTypeChange = (e) => {
    setStockItemTypeSearch(e.target.value);
  };  

  const [warrantyPeriod, setWarrantyPeriod] = useState(props.inventory.WarrantyPeriod);

  const handleWarrantyPeriodChange = (e) => {
    props.updateInventory('WarrantyPeriod', e.target.value);
    setWarrantyPeriod(e.target.value);
  };

  const [quantity, setQuantity] = useState(props.inventory.Quantity);

  const handleQuantityChange = (e) => {
    props.updateInventory('Quantity', e.target.value);
    setQuantity(e.target.value);
  };

  const [costPrice, setCostPrice] = useState(props.inventory.CostPrice);

  const handleCostPriceChange = (e) => {
    props.updateInventory('CostPrice', e.target.value);
    setCostPrice(e.target.value);
  };

  const [listPrice, setListPrice] = useState(props.inventory.ListPrice);

  const handleListPriceChange = (e) => {
    props.updateInventory('ListPrice', e.target.value);
    setListPrice(e.target.value);
  };

  const [commissionPercentage, setCommissionPercentage] = useState(props.inventory.CommissionPercentage);

  const handleCommissionPercentageChange = (e) => {
    props.updateInventory('CommissionPercentage', e.target.value);
    setCommissionPercentage(e.target.value);
  };

  const [binLocation, setBinLocation] = useState(props.inventory.BinLocation);

  const handleBinLocationChange = (e) => {
    props.updateInventory('BinLocation', e.target.value);
    setBinLocation(e.target.value);
  };

  const [webForm, setWebForm] = useState(props.inventory.WebForm);

  const handleWebFormChange = () => {
    let newVal = !webForm;
    props.updateInventory('WebForm', newVal);
    setWebForm(newVal);
  }

  const [isActive, setIsActive] = useState(props.inventory.IsActive);

  const handleIsActiveChange = () => {
    props.updateInventory('IsActive', !isActive);
    setIsActive(!isActive);
  };

  // const handleCommentChange = (e) => {
  //   props.setNewComment(e.target.value);
  // };

  // async function submitComment() {

  //   if (props.accessStatus === Enums.AccessStatus.LockedWithAccess || props.accessStatus === Enums.AccessStatus.LockedWithOutAccess) {
  //     return;
  //   }

  //   setSubmitting(true);
  //   props.submitComment();
  //   setSubmitting(false);
  // }

  return (
    <div className="container">
      <div className="heading">
        Inventory Details
      </div>
      <div className="row">
        <div className="column">
          <TextInput
            label="Account code"
            changeHandler={handleCodeChange}
            required={true}
            value={code}
            error={props.inputErrors.Code}
          />
        </div>
        <div className="column">
          <TextInput
            label="Description for the inventory"
            changeHandler={handleDescriptionChange}
            required={true}
            value={description}
            error={props.inputErrors.Description}
          />
        </div>
      </div>
      <div className="row">
        <div className="column">
          <SelectInput
            addOption={(props.accessStatus !== Enums.AccessStatus.LockedWithAccess && props.accessStatus !== Enums.AccessStatus.LockedWithOutAccess ?
              { text: "Add new inventory category", action: () => addNewInventoryCategory() } : null)}
            changeHandler={handleInventoryCategoryChange}
            label="Inventory Category"
            options={inventoryCategories}
            placeholder="Select inventory category"
            required={true}
            searchFunc={searchInventoryCategories}
            searching={searching}
            setSelected={setSelectedInventoryCategory}
            type="inventory-category"
            value={inventoryCategorySearch}
            error={props.inputErrors.InventoryCategory}
          />
        </div>
        <div className="column">
          <SelectInput
            addOption={(props.accessStatus !== Enums.AccessStatus.LockedWithAccess && props.accessStatus !== Enums.AccessStatus.LockedWithOutAccess ?
              { text: "Add new inventory subcategory", action: () => addNewInventorySubcategory() } : null)}
            changeHandler={handleInventorySubcategoryChange}
            label="Inventory Subcategory"
            options={inventorySubcategories}
            placeholder="Select inventory subcategory"
            required={true}
            noInput={true}
            setSelected={setSelectedInventorySubcategory}
            type="inventory-subcategory"
            value={inventorySubcategorySearch}
            error={props.inputErrors.InventorySubcategory}
          />
        </div>
      </div>
      <div className="row">
        <div className="column">
          <SelectInput
            changeHandler={handleStockItemTypeChange}
            label="Stock Item Type"
            options={stockItemTypes}
            placeholder="Select stock item type"
            required={true}
            noInput={true}
            setSelected={setSelectedStockItemType}
            type="enum"
            value={stockItemTypeSearch}
          />
        </div>
        <div className="column">
          <TextInput
            label="Warranty period"
            required={true}
            changeHandler={handleWarrantyPeriodChange}
            type="number"
            value={warrantyPeriod}
            error={props.inputErrors.WarrantyPeriod}
          />
        </div>
      </div>
      <div className="row">
        <div className="column">
          <TextInput
            label="Quantity"
            required={true}
            changeHandler={handleQuantityChange}
            type="number"
            value={quantity}
            error={props.inputErrors.Quantity}
          />
        </div>
        <div className="column">
          <SupplierSelector selectedSupplier={props.supplier} setSelectedSupplier={props.setSupplier} accessStatus={props.accessStatus} />
        </div>
      </div>
      <div className="row">
        <div className="column">
          <TextInput
            label="Cost Price"
            required={true}
            changeHandler={handleCostPriceChange}
            type="number"
            value={costPrice}
            error={props.inputErrors.CostPrice}
          />
        </div>
        <div className="column">
          <TextInput
            label="List Price"
            required={true}
            changeHandler={handleListPriceChange}
            type="number"
            value={listPrice}
            error={props.inputErrors.ListPrice}
          />
        </div>
      </div>
      <div className="row">
        <div className="column">
          <TextInput
            label="Commission Percentage"
            required={true}
            changeHandler={handleCommissionPercentageChange}
            type="number"
            value={commissionPercentage}
            error={props.inputErrors.CommissionPercentage}
          />
        </div>
        <div className="column">
          <TextInput
            label="Bin Location"
            changeHandler={handleBinLocationChange}
            value={binLocation}
            error={props.inputErrors.BinLocation}
          />
        </div>
      </div>
      <div className="switch">
      </div>
      <div className="row">
        <div className="column">
          <SCSwitch label="Show for Web Form" checked={webForm} onToggle={handleWebFormChange} />
          {/*<ReactSwitch label="Show for Web Form" checked={webForm} handleChange={handleWebFormChange} />*/}
        </div>
        <div className="column">
          <div className="switch">
            <SCSwitch label="Active" checked={isActive} onToggle={() => handleIsActiveChange()} />
            {/*<ReactSwitch label="Active" checked={isActive} handleChange={() => handleIsActiveChange()} />*/}
          </div>
        </div>
      </div>
      <div className="comments-and-history">
      <ItemComments
        itemID={props.inventory.ID}
        module={Enums.Module.Inventory}
        storeID={props.inventory.StoreID}


        // comments={props.comments}
        // handleCommentChange={handleCommentChange}
        // newComment={props.newComment}
        // submitComment={submitComment}
        // submitting={submitting}
        // canLoadMoreComments={props.canLoadMoreComments}
        // loadMoreComments={props.loadMoreComments}
      />
      </div>

      <AuditLog recordID={props.inventory.ID} retriggerSearch={props.inventory} />

      {showCreateInventoryCategory ?
        <ManageInventoryCategory isNew={true} onInventoryCategorySave={onInventoryCategorySave} accessStatus={props.accessStatus} />
        : ''
      }

      {showCreateInventorySubcategory ?
        <ManageInventorySubcategory isNew={true} onInventorySubcategorySave={onInventorySubcategorySave}
          inventoryLockdown={true} defaultInventoryCategory={selectedInventoryCategory} accessStatus={props.accessStatus} />
        : ''
      }

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
        .heading {
          color: ${colors.blueGrey};
          font-weight: bold;
          margin: 1.5rem 0 0.5rem;
        }
        .new-comment {
          position: relative;
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
        .switch {
          flex-direction: row-reverse;
          display: flex;
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
        .comments-and-history {
          padding-right: 3rem;
        }
      `}</style>
    </div>
  );
}

export default InventoryDetails;
