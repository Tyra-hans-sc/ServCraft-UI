import React, { useState, useEffect, useContext, useRef } from 'react';
import { colors, fontSizes, layout, fontFamily } from '../../../theme';
import Tabs from '../../tabs';

import SCInput from '../../sc-controls/form-controls/sc-input';
import SCTextArea from '../../sc-controls/form-controls/sc-textarea';
import SCComboBox from '../../sc-controls/form-controls/sc-combobox';
import SCNumericInput from '../../sc-controls/form-controls/sc-numeric-input';
import SCCheckbox from '../../sc-controls/form-controls/sc-checkbox';

import Button from '../../button';
import InventorySelector from '../../selectors/inventory/inventory-selector';
import Search from '../../search';
import Pagination from '../../pagination';
import Fetch from '../../../utils/Fetch';
import * as Enums from '../../../utils/enums';
import Helper from '../../../utils/helper';
import Storage from '../../../utils/storage';
import ToastContext from '../../../utils/toast-context';
import JobService from '../../../services/job/job-service';
import SCDropdownList from '../../sc-controls/form-controls/sc-dropdownlist';

const tabInventory = "Materials";
const tabAsset = "Assets";
const tabMaterials = "Job Materials";
const tabDescription = "Description";

function ManageQuoteItem({ isNew, tab, itemID, module, jobInventory, hasAssets, customerID, quoteItem, saveQuoteItem, saveQuoteItems, integration, companyTaxPercentage, accessStatus, cypressInventorySelector, cypressQuantity }) {

  const toast = useContext(ToastContext);

  const [selectedTab, setSelectedTab] = useState(isNew ? tab : quoteItem.QuoteItemType === Enums.QuoteItemType.Inventory ? tabInventory : tabDescription);
  const [pageTabs, setPageTabs] = useState([]);

  const buildUpPageTabs = () => {
    let tabs = [];

    tabs.push({ text: tabInventory, suppressCount: true });

    if (isNew) {
      if (jobInventory && jobInventory.length > 0) {
        tabs.push({ text: tabMaterials, suppressCount: true });
      }
      if (hasAssets) {
        tabs.push({ text: tabAsset, suppressCount: true });
      }
      tabs.push({ text: tabDescription, suppressCount: true });
    } else {
      if (quoteItem.QuoteItemType == Enums.QuoteItemType.Inventory) {
        tabs = [{ text: tabInventory, suppressCount: true }];
      } else {
        tabs = [{ text: tabDescription, suppressCount: true }];
      }
    }

    setPageTabs(tabs);
  };

  useEffect(() => {
    buildUpPageTabs();
  }, []);

  useEffect(() => {
    if (selectedTab == tabAsset) {
      getAssetPageSize();
    }
    if (selectedTab == tabInventory) {
      if (!isNew) {
        setInventory(quoteItem.InventoryID);
      }
    }
  }, [selectedTab]);

  // SHARED TAB

  const getJobCard = async () => {
    setItem(await JobService.getJob(itemID));
  }

  const [item, setItem] = useState();

  useEffect(() => {
    if (module == Enums.Module.JobCard) {
      getJobCard();
    }
  }, []);

  const [description, setDescription] = useState(isNew ? '' : quoteItem.Description);

  const handleDescriptionChange = (e) => {
    setDescription(e.value);
  };

  const useJobDescriptionClick = () => {
    setDescription(item ? item.Description : '');
  };

  // INVENTORY ITEM TAB

  const firstInventoryUpdate = useRef(true);
  const firstInventoryNotSelectedUpdate = useRef(true);
  const [selectedInventory, setSelectedInventory] = useState();
  const [inventoryChanged, setInventoryChanged] = useState(false);

  useEffect(() => {
    if (selectedInventory && inventoryChanged) {
      setUnitPriceExclusive(selectedInventory.ListPrice);
    }
    if (selectedInventory) {
      if (!isNew && firstInventoryUpdate.current) {
        firstInventoryUpdate.current = false;
        return;
      }
      setDescription(selectedInventory.Description);
    } else {
      if (!isNew && firstInventoryNotSelectedUpdate.current) {
        setTimeout(() => {
          firstInventoryNotSelectedUpdate.current = false;
        }, 100);
        return;
      }
      setDescription('');
      setUnitPriceExclusive(0);
    }
  }, [selectedInventory, inventoryChanged]);

  const setInventory = async (id) => {
    let inventory = await getInventory(id);
    firstInventoryUpdate.current = true;
    setSelectedInventory(inventory);
  };

  const getInventory = async (id) => {
    const inventory = await Fetch.get({
      url: `/Inventory?id=${id}`
    });
    return inventory;
  };

  const [integrationMessage, setIntegrationMessage] = useState(null);
  const [integrationStatus, setIntegrationStatus] = useState('pending');

  useEffect(() => {
    if (integration && selectedInventory) {
      // show current selected integrated status (Synced to {partner})
      if (selectedInventory.Integrated) {
        setIntegrationMessage(`Synced to ${Enums.getEnumStringValue(Enums.IntegrationPartner, integration.Partner)}`);
        setIntegrationStatus('synced');
      } else if (!selectedInventory.Integrated) {
        // show integrated message
        if (selectedInventory.IntegrationMessage) {
          setIntegrationMessage(selectedInventory.IntegrationMessage);
          setIntegrationStatus('error');
        } else {
          setIntegrationMessage(`Not synced to ${Enums.getEnumStringValue(Enums.IntegrationPartner, integration.Partner)}`);
          setIntegrationStatus('pending');
        }
      }
    } else {
      setIntegrationMessage(null);
    }
  }, [selectedInventory]);

  const [quantity, setQuantity] = useState(isNew ? 1 : quoteItem.Quantity);

  const handleQuantityChange = (e) => {
    setQuantity(parseFloat(e.value));
  };

  const [lineDiscountPercentage, setLineDiscountPercentage] = useState(isNew ? 0 : quoteItem.LineDiscountPercentage);

  const handleLineDiscountPercentageChange = (e) => {
    setLineDiscountPercentage(parseFloat(e.value));
  };

  const [unitPriceExclusive, setUnitPriceExclusive] = useState(isNew ? 0 : quoteItem.UnitPriceExclusive);

  const handleUnitPriceExclusiveChange = (e) => {
    setUnitPriceExclusive(parseFloat(e.value));
  };

  const taxRates = Enums.getEnumItems(Enums.QuoteTaxRate);
  const [taxRate, setTaxRate] = useState(isNew ? companyTaxPercentage > 0 ? 'Standard Rate' : 'No VAT' : quoteItem.TaxPercentage > 0 ? 'Standard Rate' : 'No VAT');
  const [taxPercentage, setTaxPercentage] = useState(isNew ? companyTaxPercentage ? companyTaxPercentage : 0 : quoteItem.TaxPercentage);

  const handleTaxRateChange = (value) => {
    setTaxRate(value);
    if (value == 'Standard Rate') {
      setTaxPercentage(companyTaxPercentage);
    } else {
      setTaxPercentage(0);
    }
  };

  const [lineTotalExclusive, setLineTotalExclusive] = useState(isNew ? 0 : quoteItem.LineTotalExclusive);

  const updateTotals = () => {
    if (selectedInventory && (quantity > 0)) {

      let subTotal = quantity * unitPriceExclusive;
      let discount = subTotal * (lineDiscountPercentage / 100);
      let totalExclVat = Helper.roundToTwo(subTotal - discount);
      setLineTotalExclusive(parseFloat(totalExclVat));
    } else {
      setLineTotalExclusive(0);
    }
  };

  useEffect(() => {
    updateTotals();
  }, [selectedInventory, quantity, lineDiscountPercentage, unitPriceExclusive]);

  // ASSET TAB

  const [productSearch, setProductSearch] = useState('');
  const [products, setProducts] = useState([]);
  const [selectedProductIds, setSelectedProductIds] = useState([]);

  const productChecked = (product) => {
    return selectedProductIds.length > 0 ? selectedProductIds.some(x => x == product.ID) : false;
  };

  const handleProductChecked = (product) => {
    if (selectedProductIds.length > 0 && selectedProductIds.some(x => x == product.ID)) {
      let index = selectedProductIds.findIndex(x => x == product.ID);
      let deletedProductId = selectedProductIds.splice(index, 1)[0];
      setSelectedProductIds(selectedProductIds.filter(x => x != deletedProductId));
      setSelectAllAssets(false);
    } else {
      let productIds = [...selectedProductIds, product.ID];
      setSelectedProductIds(productIds);
      setSelectAllAssets(productIds.length === products.length);
    }
  };

  const [selectAllAssets, setSelectAllAssets] = useState(false);

  const handleSelectAllAssets = () => {
    if (!selectAllAssets && products.length > 0) {
      setSelectedProductIds(products.map(x => x.ID));
    } else {
      setSelectedProductIds([]);
    }
    setSelectAllAssets(!selectAllAssets);
  };

  const [assetOptions, setAssetOptions] = useState([{ Key: 0, Value: 'Job Assets' }, { Key: 1, Value: 'Customer Assets' }]);
  const [selectedAssetOption, setSelectedAssetOption] = useState(module == Enums.Module.JobCard ? { Key: 0, Value: 'Job Assets' } : { Key: 1, Value: 'Customer Assets' });

  const handleAssetOptionChange = (value) => {
    setSelectedAssetOption(value);
  };

  useEffect(() => {
    searchProducts();
  }, [selectedAssetOption]);

  const [assetPageSize, setAssetPageSize] = useState(10);

  const getAssetPageSize = () => {
    let size = Storage.getCookie(Enums.Cookie.pageSize);
    if (size > 0) {
      setAssetPageSize(size);
    }
  };

  const [totalAssetResults, setTotalAssetResults] = useState(0);
  const [currentAssetPage, setCurrentAssetPage] = useState(1);

  useEffect(() => {
    searchProducts();
  }, [currentAssetPage]);

  const searchProducts = async () => {

    if (!selectedAssetOption) {
      setProducts([]);
      setTotalAssetResults(0);
      return;
    }

    let params = {
      pageSize: assetPageSize, pageIndex: 0, searchPhrase: productSearch, SortExpression: "", SortDirection: "",
    };

    if (selectedAssetOption.Value == 'Job Assets') {

      if (Helper.isNullOrUndefined(itemID)) {
        setProducts([]);
        setTotalAssetResults(0);
        return;
      }

      params = { ...params, JobCardID: itemID };
    } else {

      if (Helper.isNullOrUndefined(customerID)) {
        setProducts([]);
        setTotalAssetResults(0);
        return;
      }

      params = { ...params, CustomerIDList: [customerID] };
    }

    const request = await Fetch.post({
      url: `/Product/GetProducts`,
      params: params
    });
    setProducts(request.Results);
    setTotalAssetResults(request.TotalResults);
  };

  // Materials TAB

  useEffect(() => {
    buildUpPageTabs();
  }, [jobInventory]);

  const [selectedJobInventoryIds, setSelectedJobInventoryIds] = useState([]);

  const jobInventoryChecked = (inventory) => {
    return selectedJobInventoryIds.length > 0 ? selectedJobInventoryIds.some(x => x == inventory.ID) : false;
  };

  const handleJobInventoryChecked = (inventory) => {
    if (selectedJobInventoryIds.length > 0 && selectedJobInventoryIds.some(x => x == inventory.ID)) {
      let index = selectedJobInventoryIds.findIndex(x => x == inventory.ID);
      let deletedInventoryId = selectedJobInventoryIds.splice(index, 1)[0];
      setSelectedJobInventoryIds(selectedJobInventoryIds.filter(x => x != deletedInventoryId));
      setSelectAllJobInventory(false);
    } else {
      let jobInventoryIds = [...selectedJobInventoryIds, inventory.ID];
      setSelectedJobInventoryIds(jobInventoryIds);
      setSelectAllJobInventory(jobInventoryIds.length === jobInventory.length);
    }
  };

  const [selectAllJobInventory, setSelectAllJobInventory] = useState(false);

  const handleSelectAllJobInventory = () => {
    if (!selectAllJobInventory && jobInventory.length > 0) {
      setSelectedJobInventoryIds(jobInventory.map(x => x.ID));
    } else {
      setSelectedJobInventoryIds([]);
    }
    setSelectAllJobInventory(!selectAllJobInventory);
  };

  const [inputErrors, setInputErrors] = useState({});

  const [saving, setSaving] = useState(false);

  const saveItem = async (e) => {

    setSaving(true);

    const sectionMeta = {
        InventorySectionName: null,
        InventorySectionID: null,
        HideLineItems: false,
        DisplaySubtotals: false
    }

    if (selectedTab == tabInventory || selectedTab == tabDescription) {
      let inputs = '';
      if (selectedTab == tabInventory) {
        inputs = [
          { key: 'Quantity', value: quantity, required: true, gt: 0, type: Enums.ControlType.Number },
          { key: 'UnitPriceExclusive', value: unitPriceExclusive, required: true, type: Enums.ControlType.Number },
          { key: 'Inventory', value: selectedInventory, required: true, type: Enums.ControlType.Select },
          { key: 'Description', value: description, required: true, type: Enums.ControlType.Text },
          { key: 'LineDiscountPercentage', value: lineDiscountPercentage, btw: [0, 100], type: Enums.ControlType.Number },
          { key: 'TaxRate', value: taxRate, required: true, type: Enums.ControlType.Select },
        ];
      } else if (selectedTab == tabDescription) {
        inputs = [
          { key: 'Description', value: description, required: true, type: Enums.ControlType.Text },
        ];
      }

      const { isValid, errors } = Helper.validateInputs(inputs);
      if (!isValid) {
        toast.setToast({
          message: 'There are errors on the page',
          show: true,
          type: 'error'
        });
        setInputErrors(errors);
        setSaving(false);
      } else {
        let quoteItemUpdated = { IsActive: true };
        if (selectedTab == tabInventory) {
          quoteItemUpdated = {
            ...quoteItemUpdated,
            Description: description,
            Quantity: quantity,
            LineDiscountPercentage: lineDiscountPercentage,
            UnitPriceExclusive: unitPriceExclusive,
            LineTotalExclusive: lineTotalExclusive,
            InventoryID: selectedInventory.ID,
            InventoryDescription: description,
            InventoryCode: selectedInventory.Code,
            InventoryActive: selectedInventory.IsActive,
            QuoteItemType: Enums.QuoteItemType.Inventory,
            TaxPercentage: taxPercentage,
            Integrated: selectedInventory.Integrated,
            IntegrationMessage: selectedInventory.IntegrationMessage,
            ...sectionMeta
          };
        } else {
          quoteItemUpdated = {
            ...quoteItemUpdated,
            Description: description,
            InventoryDescription: description,
            QuoteItemType: Enums.QuoteItemType.Description,
            ...sectionMeta
          };
        }

        saveQuoteItem(quoteItemUpdated);
      }
    } else if (selectedTab == tabAsset) {
      let productsToAdd = products.filter(x => selectedProductIds.some(y => y == x.ID));
      if (productsToAdd.length < 1) {
        toast.setToast({
          message: 'Please select assets',
          show: true,
          type: 'error'
        });
        setSaving(false);
      } else {
        let items = [];
        for (let index in productsToAdd) {
          let item = productsToAdd[index];
          items.push({
            Description: item.InventoryDescription + ' - ' + item.ProductNumber,
            InventoryDescription: item.InventoryDescription + ' - ' + item.ProductNumber,
            IsActive: true,
            QuoteItemType: Enums.QuoteItemType.Description,
            ...sectionMeta
          });
        }
        saveQuoteItems(items);
      }
    } else if (selectedTab == tabMaterials) {
      let jobInventoryToAdd = jobInventory.filter(x => selectedJobInventoryIds.some(y => y == x.ID));
      if (jobInventoryToAdd.length < 1) {
        toast.setToast({
          message: 'Please select materials',
          show: true,
          type: 'error'
        });
        setSaving(false);
      } else {
        let items = [];
        for (let index in jobInventoryToAdd) {
          let item = jobInventoryToAdd[index];

          if (item.ProductID) {
            items.push({
              Description: item.InventoryDescription + ' - ' + item.ProductNumber,
              InventoryDescription: item.InventoryDescription + ' - ' + item.ProductNumber,
              IsActive: true,
              QuoteItemType: Enums.QuoteItemType.Description,
              ...sectionMeta
            });
          } else {
            let inventory = await getInventory(item.InventoryID);
            let lineTotalExclusive = 0;

            if (inventory.ListPrice > 0) {
              let subTotal = item.QuantityRequested * inventory.ListPrice;
              lineTotalExclusive = parseFloat(subTotal.toFixed(2));
            }

            items.push({
              Description: item.ProductID ? item.InventoryDescription + ' - ' + item.ProductNumber : item.InventoryDescription,
              Quantity: item.QuantityRequested,
              InventoryID: item.InventoryID,
              InventoryDescription: item.ProductID ? item.InventoryDescription + ' - ' + item.ProductNumber : item.InventoryDescription,
              InventoryCode: item.InventoryCode,
              ProductID: item.ProductID,
              ProductNumber: item.ProductNumber,
              TaxPercentage: companyTaxPercentage,
              Integrated: inventory.Integrated,
              IntegrationMessage: inventory.IntegrationMessage,
              LineDiscountPercentage: 0,
              UnitPriceExclusive: inventory.ListPrice,
              LineTotalExclusive: lineTotalExclusive,
              IsActive: true,
              QuoteItemType: Enums.QuoteItemType.Inventory,
              ...sectionMeta
            });
          }
        }
        saveQuoteItems(items);
      }
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
            <h1>Adding an Item</h1> :
            <h1>Editing an Item</h1>
          }
        </div>

        {integrationMessage ?
          <div className={`integration-message ${integrationStatus}`}>
            {integrationMessage}
          </div> : ''
        }

        <Tabs
          selectedTab={selectedTab}
          setSelectedTab={setSelectedTab}
          tabs={pageTabs} />
        {(() => {
          switch (selectedTab) {
            case tabInventory:
              return <div key={0}>
                <InventorySelector selectedInventory={selectedInventory} setSelectedInventory={setSelectedInventory} setInventoryChanged={setInventoryChanged}
                  accessStatus={accessStatus} error={inputErrors.Inventory} />

                <div className="row">
                  <div className="column">
                    <SCInput
                      label="Description"
                      required={true}
                      type="text"
                      onChange={handleDescriptionChange}
                      value={description}
                      error={inputErrors.Description}
                    />
                  </div>
                </div>
                <div className="row">
                  <div className="column">
                    <SCNumericInput
                      cypress={cypressQuantity}
                      extraClasses="quantity-amount"
                      label="Quantity"
                      required={true}
                      onChange={handleQuantityChange}
                      value={quantity}
                      error={inputErrors.Quantity}
                      min={0}
                      format={Enums.NumericFormat.Decimal}
                    />
                  </div>
                  <div className="column">
                    <SCNumericInput
                      label="Discount %"
                      required={true}
                      onChange={handleLineDiscountPercentageChange}
                      value={lineDiscountPercentage}
                      error={inputErrors.LineDiscountPercentage}
                      min={0}
                      format={Enums.NumericFormat.Percentage}
                    />
                  </div>
                </div>
                <div className="row">
                  <div className="column">
                    <SCNumericInput
                      cypress="data-cy-price-excl-vat"
                      extraClasses="price-excl-vat"
                      label="Price Excl VAT"
                      required={true}
                      onChange={handleUnitPriceExclusiveChange}
                      value={unitPriceExclusive}
                      error={inputErrors.UnitPriceExclusive}
                      signed={true}
                      min={0}
                      format={Enums.NumericFormat.Currency}
                    />
                  </div>
                  <div className="column">
                    <SCDropdownList
                      onChange={handleTaxRateChange}
                      label="Tax Rate"
                      options={taxRates}
                      value={taxRate}
                      required={true}
                      error={inputErrors.TaxRate}
                    />
                  </div>
                </div>
                <div className="row total-row">
                  <div className="column">
                    Total
                  </div>
                  <div className="column end">
                    {Helper.getCurrencyValue(lineTotalExclusive)}
                  </div>
                </div>
              </div>;
            case tabDescription:
              return <div key={1} className="description-container">
                <SCTextArea
                  label="Description"
                  onChange={handleDescriptionChange}
                  required={true}
                  value={description}
                  error={inputErrors.Description}
                />
              </div>;
            case tabAsset:
              return <div key={2} className="asset-container">

                <div className="row">
                  <div className="column">
                    <SCDropdownList
                      onChange={handleAssetOptionChange}
                      label="Show Assets"
                      dataItemKey="Key"
                      textField="Value"
                      options={assetOptions}
                      value={selectedAssetOption}
                    />
                  </div>
                </div>

                <div className="row">
                  <div className="search-container">
                    <Search
                      placeholder="Search Assets"
                      resultsNum={totalAssetResults}
                      searchVal={productSearch}
                      setSearchVal={setProductSearch}
                      searchFunc={searchProducts}
                    />
                  </div>
                </div>

                <div className="row">
                  <div className="table-container">
                    <table className="table">
                      <thead>
                        <tr>
                          <th className="header-item-select">
                            {products.length > 0 ?
                              <SCCheckbox
                                extraClasses={"no-margin"}
                                whiteBackground={true}
                                value={selectAllAssets}
                                onChange={() => handleSelectAllAssets()}
                                title="Select all"
                              /> : ''
                            }
                          </th>
                          <th className="header-item-number">
                            ASSET/SERIAL NO
                          </th>
                          <th className="header-item-desc">
                            DESCRIPTION
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.map((product, index) => {
                          return <tr key={index}>
                            <td className="body-item-select">
                              <SCCheckbox extraClasses={"no-margin"} value={productChecked(product)} onChange={() => handleProductChecked(product)} />
                            </td>
                            <td className="body-item-number">
                              {product.ProductNumber}
                            </td>
                            <td className="body-item-desc">
                              {product.InventoryDescription}
                            </td>
                          </tr>
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
                {totalAssetResults > assetPageSize ?
                  <Pagination pageSize={assetPageSize} setPageSize={setAssetPageSize} currentPage={currentAssetPage}
                    totalResults={totalAssetResults} setCurrentPage={setCurrentAssetPage} /> : ''
                }
              </div>
            case tabMaterials:
              return <div key={2} className="items-container">

                <div className="row">
                  <div className="table-container">
                    <table className="table">
                      <thead>
                        <tr>
                          <th className="header-item-select">
                            {jobInventory.length > 0 ?
                              <SCCheckbox extraClasses={"no-margin"} value={selectAllJobInventory} onChange={() => handleSelectAllJobInventory()}
                                whiteBackground={true} title="Select all" /> : ''
                            }
                          </th>
                          <th className="header-item-code">
                            CODE
                          </th>
                          <th className="header-item-desc">
                            DESCRIPTION
                          </th>
                          <th className="header-item-type">
                            TYPE
                          </th>
                          <th className="header-item-qty number-column">
                            QUANTITY
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {jobInventory.map((inventory, index) => {
                          return <tr key={index}>
                            <td className="body-item-select">
                              <SCCheckbox extraClasses={"no-margin"} value={jobInventoryChecked(inventory)} onChange={() => handleJobInventoryChecked(inventory)} />
                            </td>
                            <td className="body-item-number">
                              {inventory.ProductID ? inventory.ProductNumber : inventory.InventoryCode}
                            </td>
                            <td className="body-item-desc">
                              {inventory.InventoryDescription}
                            </td>
                            <td className="body-item-type">
                              {inventory.ProductID ? 'Asset' : 'Inventory'}
                            </td>
                            <td className="body-item-qty">
                              {inventory.QuantityRequested}
                            </td>
                          </tr>
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
          }
        })()}


        {selectedTab == tabDescription && module == Enums.Module.JobCard ?
          <div className="custom-actions">
            <Button text="Use Job Description" extraClasses="hollow auto" onClick={useJobDescriptionClick} />
          </div>
          : ''}

        <div className="actions">
          <Button text="Cancel" extraClasses="hollow auto" onClick={() => saveQuoteItem(null)} />
          <Button text={isNew ? 'Add' : 'Save'} extraClasses="auto" onClick={saveItem} disabled={saving} />
        </div>
      </div>

      <style jsx>{`
        .modal-container {
          padding-bottom: 5rem;
        }
        .title {
          color: ${colors.bluePrimary};
          font-size: 1.125rem;
          font-weight: bold;
        }
        .row {
          display: flex;
          justify-content: space-between;
        }
        .column {
          display: flex;
          flex-direction: column;
          width: 100%;
        }
        .column + .column {
          margin-left: 1.25rem;
        } 

        .custom-actions {
          display: flex;
          flex-direction: row;
          position: absolute;
          left: 0.5rem;
          bottom: 1rem;
        }
        .custom-actions :global(.button){
          margin-left: 0.5rem;
          margin-top: 1rem;
          padding: 0 1rem;
          white-space: nowrap;
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
        .inventory-item-container {
          display: flex;
          flex-direction: row;
          width: 100%;
        }
        .search-container {
          width: 100%;          
        }
        .integration-message {
          display: flex;
          flex-direction: row-reverse;
        }
        .pending {
          color: ${colors.labelGrey};
        }
        .error {
          color: ${colors.warningRed};
        }
        .synced {
          color: ${colors.green};
        }
        .total-row {
          font-weight: bold;
          margin-top: 1rem;
        }
        .end {
          align-items: flex-end;
        }
        .cancel {
          width: 6rem;
        }
        .update {
          width: 14rem;
        }
        .left-padding {
          padding-left: 0.5em;
        }
        .right-padding {
          padding-right: 0.5em;
        }
        .top-margin {
          margin-top: 1rem;
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
      `}</style>
    </div>
  )
}

export default ManageQuoteItem;
