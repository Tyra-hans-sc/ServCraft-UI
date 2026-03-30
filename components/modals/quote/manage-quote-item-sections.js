import React, { useState, useEffect, useContext, useRef, useMemo } from 'react';
import { colors, layout } from '../../../theme';

import SCInput from '../../sc-controls/form-controls/sc-input';
import SCTextArea from '../../sc-controls/form-controls/sc-textarea';

import SCNumericInput from '../../sc-controls/form-controls/sc-numeric-input';
import SCCheckbox from '../../sc-controls/form-controls/sc-checkbox';

import ScDynamicSelect from "@/components/sc-controls/form-controls/ScDynamicSelect";
import Search from '../../search';
import Pagination from '../../pagination';
import Fetch from '../../../utils/Fetch';
import * as Enums from '../../../utils/enums';
import Helper from '../../../utils/helper';
import Storage from '../../../utils/storage';
import ToastContext from '../../../utils/toast-context';
import JobService from '../../../services/job/job-service';
import SCDropdownList from '../../sc-controls/form-controls/sc-dropdownlist';
import AddBundleToQuoteForm from "../../../PageComponents/Inventory/AddBundleToSectionListForm";
import { Box, Button, Checkbox, Flex, Title, Tabs, Fieldset, Text } from "@mantine/core";
import SectionSelector from "../../../PageComponents/Inventory/SectionSelector";
import SCModal from "../../../PageComponents/Modal/SCModal";
import JobMaterialsSelectTable
  from "../../../PageComponents/SectionTable/Section Component Tables/JobMaterialsSelectTable";
import tabStyles from "../../../styles/Tabs.module.css";
import NewText from "../../../PageComponents/Premium/NewText";
import { useMediaQuery } from "@mantine/hooks";
import { IconFilter } from "@tabler/icons-react";
import { IconChevronRight } from "@tabler/icons";
import styles from "../../../PageComponents/Inventory/AddInventoryItemForm.module.css";
import ScDataFilter from "../../../PageComponents/Table/Table Filter/ScDataFilter";
import permissionService from '../../../services/permission/permission-service';
import ScNumberControl from "@/components/sc-controls/form-controls/v2/sc-number-control";
import ItemDisplayImages from '@/PageComponents/Attachment/ItemDisplayImages';
import StockItemTypeIcon from "@/PageComponents/Inventory/StockItemTypeIcon";
import InventoryItemModal from "@/PageComponents/Inventory/InventoryItemModal";
import InventorySelector from "@/components/selectors/inventory/inventory-selector";

const tabInventory = "Material / Service";
const tabBundles = "Bundle";
const tabAsset = "Asset Description";
const tabMaterials = "Job Material / Service";
const tabDescription = "Description";

function ManageQuoteItem({ isNew, tab, itemID, module, jobInventory, hasAssets, customerID, quoteItem, saveQuoteItem, updateQuoteItems, integration, companyTaxPercentage, accessStatus, quoteItems, quote, cypressInventorySelector, cypressQuantity, addToTableGroupItem, defaultSectionPdfSettings, userColumnConfig }) {

  const markupShown = useMemo(() => userColumnConfig.find(x => x.ColumnName === 'UnitPriceMarkup')?.Show, [userColumnConfig])
  const useInclusivePricing = useMemo(() => userColumnConfig.find(x => x.ColumnName === 'UnitPriceInclusive')?.Show, [userColumnConfig])

  const mobileView = useMediaQuery('(max-width: 800px)');

  const [addToSection, setAddToSection] = useState(!!addToTableGroupItem)
  const [sections, setSections] = useState()
  const [newSectionTitle, setNewSectionTitle] = useState()
  const [selectedSection, setSelectedSection] = useState()

  const toast = useContext(ToastContext);

  const [selectedTab, setSelectedTab] = useState(isNew ? tab : quoteItem.QuoteItemType === Enums.QuoteItemType.Inventory ? tabInventory : tabDescription);
  const [pageTabs, setPageTabs] = useState([]);

  const [triggerBundleSaveCounter, setTriggerBundleSaveCounter] = useState(0)

  const [manageCostingPermission] = useState(permissionService.hasPermission(Enums.PermissionName.ManageCosting));

  const buildUpPageTabs = () => {
    let tabs = [];

    tabs.push({ text: tabInventory, suppressCount: true });

    if (isNew) {
      if (jobInventory && jobInventory.length > 0) {
        tabs.push({ text: tabMaterials, suppressCount: true });
      }
      tabs.push({ text: tabBundles, suppressCount: true, isNewFeature: true });
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
      setUnitCostPrice(selectedInventory.CostPrice);
      if (selectedInventory.CostPrice && selectedInventory.ListPrice) {
        setMarginValue(Math.round((selectedInventory.ListPrice / selectedInventory.CostPrice - 1) * 10000) / 100);
      } else {
        setMarginValue('');
      }
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
      setMarginValue('');
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

  const getInventories = async (searchPhrase) => {
    const inventory = await Fetch.post({
      url: `/Inventory/GetInventories`,
      params: {
        pageSize: 10, 
        pageIndex: 0, 
        searchPhrase: searchPhrase,
        SortExpression: "", 
        SortDirection: "", 
        PopulateThumbnails: true,
        ...queryState
      }
    });

    return inventory.Results || [];
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

  const [unitCostPrice, setUnitCostPrice] = useState(isNew ? 0 : quoteItem.UnitCostPrice);

  const [marginValue, setMarginValue] = useState(isNew ? '' : (quoteItem.UnitCostPrice && quoteItem.UnitPriceExclusive ? Math.round((quoteItem.UnitPriceExclusive / quoteItem.UnitCostPrice - 1) * 10000) / 100 : ''));

  const handleMarginChange = (number) => {
    typeof number === 'number' && unitCostPrice && setUnitPriceExclusive(Math.round((unitCostPrice + (unitCostPrice * (+number / 100))) * 100) / 100)
    setMarginValue(number)
  }

  const handleUnitPriceExclusiveChange = (e) => {
    const sellPriceWithoutVat = +e.value
    if (unitCostPrice && typeof sellPriceWithoutVat === 'number') {
      setMarginValue(
        sellPriceWithoutVat === 0 ? -100 :
          Math.round((sellPriceWithoutVat / unitCostPrice - 1) * 10000) / 100)
    }
    setUnitPriceExclusive(sellPriceWithoutVat);
  };

  const handleCostPriceChange = (e) => {
    const costPrice = parseFloat(e.value);
    if (costPrice !== 0 && unitPriceExclusive && marginValue !== '') {
      setUnitPriceExclusive(Math.round(((1 + (Number(marginValue) / 100)) * costPrice) * 100) / 100)
    }
    setUnitCostPrice(costPrice);
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
    // No need to update exclusive price here, as we're just changing the tax rate
    // The inclusive price will be automatically recalculated when rendering
  };

  const [lineTotalExclusive, setLineTotalExclusive] = useState(isNew ? 0 : quoteItem.LineTotalExclusive);

  const updateTotals = () => {
    if (selectedInventory && (quantity > 0)) {

      let subTotal = quantity * Math.round(unitPriceExclusive * 100) / 100;
      let discount = subTotal * (lineDiscountPercentage / 100);
      let totalExclVat = Helper.roundToTwo(subTotal - discount);
      setLineTotalExclusive(Math.round(totalExclVat * 100) / 100);
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

  const [selectedJobInventoryToAdd, setSelectedJobInventoryToAdd] = useState([])
  const [resetSelectionsCounter, setResetSelectionsCounter] = useState(0)

  const [inputErrors, setInputErrors] = useState({});

  const [saving, setSaving] = useState(false);
  const addAndContinueRef = useRef(false);

  const [showCreateInventory, setShowCreateInventory] = useState(false);

  const onInventoryCreate = (inventory) => {
    if (inventory) {
      setSelectedInventory(inventory);
      setInventoryChanged(true);
    }
    setShowCreateInventory(false);
  };

  const saveItem = async (e) => {

    setSaving(true);

    const sectionMeta = {
      InventorySectionName: addToSection ? (selectedSection?.Name || newSectionTitle) : null,
      InventorySectionID: addToSection ? (selectedSection?.ID || crypto.randomUUID()) : null,
      HideLineItems: false,
      DisplaySubtotals: false,
      ...defaultSectionPdfSettings // will override HideLineItems and DisplaySubtotals if provided
    }

    if (selectedTab == tabInventory || selectedTab == tabDescription) {
      let inputs = '';
      if (selectedTab == tabInventory) {
        inputs = [
          { key: 'Quantity', value: quantity, required: true, gt: 0, type: Enums.ControlType.Number },
          { key: 'UnitPriceExclusive', value: unitPriceExclusive, required: true, type: Enums.ControlType.Number },
          { key: 'UnitCostPrice', value: unitCostPrice, required: true, type: Enums.ControlType.Number },
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
            UnitCostPrice: unitCostPrice,
            LineTotalExclusive: lineTotalExclusive,
            InventoryID: selectedInventory.ID,
            InventoryDescription: description,
            InventoryCode: selectedInventory.Code,
            InventoryActive: selectedInventory.IsActive,
            QuoteItemType: Enums.QuoteItemType.Inventory,
            TaxPercentage: taxPercentage,
            Integrated: selectedInventory.Integrated,
            IntegrationMessage: selectedInventory.IntegrationMessage,
            Inventory: selectedInventory,
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

        saveQuoteItem(quoteItemUpdated, addAndContinueRef.current);

        // If Add and Continue, reset form for next item
        if (addAndContinueRef.current) {
          // Reset form fields
          setDescription('');
          setQuantity(1);
          setLineDiscountPercentage(0);
          setUnitPriceExclusive(0);
          setUnitCostPrice(0);
          setLineTotalExclusive(0);
          setSelectedInventory(null);
          setInventoryChanged(p => !p);
          handleSetQueryStateWithInventoryChange(null);
          setInputErrors({});
          setSaving(false);
          setMarginValue('');
          // Reset section controls
          // Clear section selection only when there's no selected section
          if (!selectedSection?.ID) {
            setSelectedSection(null);
            setAddToSection(false);
          }
          setNewSectionTitle('');
        }
      }
    } else if (selectedTab === tabAsset) {

      let productsToAdd = products.filter(x => selectedProductIds.some(y => y == x.ID)).sort((a, b) => a.LineNumber - b.LineNumber);
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
        // saveInvoiceItems(items);
        updateQuoteItems([...quoteItems, ...items].map((x, i) => ({ ...x, LineNumber: i + 1 })), addAndContinueRef.current)

        // If Add and Continue, reset form for next item
        if (addAndContinueRef.current) {
          setSelectedProductIds([]);
          setSelectAllAssets(false);
          setSaving(false);
          setMarginValue('');
          // Reset section controls
          // Clear section selection only when there's no selected section
          if (!selectedSection?.ID) {
            setSelectedSection(null);
            setAddToSection(false);
          }
          setNewSectionTitle('');
        }
      }
    } else if (selectedTab === tabMaterials) {

      if (selectedJobInventoryToAdd.length === 0) {
        toast.setToast({
          message: 'At least one job material must be selected',
          show: true,
          type: 'error'
        });
        setSaving(false);
        return;
      }

      const newSectionIdMapping = selectedJobInventoryToAdd.reduce((p, c) => (
        c.InventorySectionID && !p.hasOwnProperty(c.InventorySectionID) ? {
          ...p,
          [c.InventorySectionID]: crypto?.randomUUID()
        } : p
      ), {})

      const itemsToAdd = await Promise.all(selectedJobInventoryToAdd.sort((a, b) => a.LineNumber - b.LineNumber).map(async x => {
        const inventory = await getInventory(x.InventoryID);

        let lineTotalExclusive = 0;

        let unitPriceExclusive = x.UnitPriceExclusive ?? inventory.ListPrice;
        let lineDiscountPercentage = x.LineDiscountPercentage ?? 0;

        if (unitPriceExclusive > 0) {
          let subTotal = x.QuantityRequested * unitPriceExclusive * (1 - lineDiscountPercentage / 100);
          lineTotalExclusive = Math.round(subTotal * 100) / 100;
        }

        // need to replace section IDs to ensure it is different to job's SectionId's
        const sectionIdOverride = x.InventorySectionID ? {
          InventorySectionID: newSectionIdMapping[x.InventorySectionID],
        } : { InventorySectionID: null }

        const section = addToSection ? sectionMeta : {
          InventorySectionName: x.InventorySectionName,
          FromBundleID: x.FromBundleID,
          HideLineItems: x.HideLineItems,
          DisplaySubtotal: x.DisplaySubtotal,
          ...sectionIdOverride,
          ...defaultSectionPdfSettings
        }

        return {
          ...(x.ProductID ? {
            Description: x.InventoryDescription + ' - ' + x.ProductNumber,
            InventoryDescription: x.InventoryDescription + ' - ' + x.ProductNumber,
            IsActive: true,
            QuoteItemType: Enums.QuoteItemType.Description,
          } : {
            Description: x.Description || x.InventoryDescription,
            Quantity: x.QuantityRequested,
            InventoryID: x.InventoryID,
            InventoryDescription: x.InventoryDescription,
            InventoryCode: x.InventoryCode,
            ProductID: x.ProductID,
            ProductNumber: x.ProductNumber,
            TaxPercentage: companyTaxPercentage,
            Integrated: inventory.Integrated,
            IntegrationMessage: inventory.IntegrationMessage,
            LineDiscountPercentage: lineDiscountPercentage,
            UnitPriceExclusive: unitPriceExclusive,
            LineTotalExclusive: lineTotalExclusive,
            IsActive: true,
            QuoteItemType: Enums.QuoteItemType.Inventory,
            Inventory: inventory,
            UnitCostPrice: x.UnitCostPrice ?? inventory.CostPrice
          }),
          ...section
        }
      }));

      const newItems = [
        ...quoteItems,
        ...itemsToAdd.sort((a, b) => a.LineNumber - b.LineNumber)
      ].map((x, i) => ({ ...x, LineNumber: i + 1 }))

      // console.log('new items', newItems)
      updateQuoteItems(newItems, addAndContinueRef.current)

      // If Add and Continue, reset form for next item
      if (addAndContinueRef.current) {
        setSelectedJobInventoryToAdd([]);
        // Increment the resetSelectionsCounter to reset the JobMaterialsSelectTable
        setResetSelectionsCounter(prev => prev + 1);
        setSaving(false);
        setMarginValue('');
        // Reset section controls
        // Clear section selection only when there's no selected section
        if (!selectedSection?.ID) {
          setSelectedSection(null);
          setAddToSection(false);
        }
        setNewSectionTitle('');
      }

    } else if (selectedTab === tabBundles) {
      setTriggerBundleSaveCounter((p) => (p + 1))

      // Don't set saving to false here, it will be set in the onSaveItems callback
    }

    // If editing (not new) or if not using Add and Continue, we're done
    if (!isNew && !addAndContinueRef.current) {
      setSaving(false);
    }
  };

  const buttonToolbar = <Flex w={'100%'} justify={'end'} gap={5} mt={'lg'}>
    {selectedTab === tabDescription && module === Enums.Module.JobCard ?
      <div className="custom-actions">
        <Button onClick={useJobDescriptionClick} variant={'outline'}>
          Use Job Description
        </Button>
      </div>
      : ''
    }
    <Button variant={'subtle'} mr={'sm'} color={'gray.9'} onClick={() => {
      // Always close the modal when cancel is clicked, regardless of addAndContinueRef.current
      addAndContinueRef.current = false;
      saveQuoteItem(null, false);
    }}>
      Cancel
    </Button>
    {isNew && (
        <Button
            onClick={() => {
              addAndContinueRef.current = true;
              saveItem();
            }}
            disabled={saving}
            variant={isNew ? 'outline' : 'filled'}
        >
          Add & Next
        </Button>
    )}
    <Button
        onClick={() => {
          addAndContinueRef.current = false;
          saveItem();
        }}
        disabled={saving}
        mr={-2}
    >
      {isNew ? 'Add' : 'Save'}
    </Button>
  </Flex>

  const tabs = <>
    <Tabs color={'scBlue'} value={selectedTab} onChange={setSelectedTab}
      classNames={{
        tab: tabStyles.scTab,
        list: tabStyles.scTabList,
        tabLabel: tabStyles.scTabLabel
      }}
    >
      <Tabs.List mb={0} pb={0}>
        {
          pageTabs.map(
            ({ text, isNewFeature }) => text && <Tabs.Tab value={text}
              key={text + 'tab'}>{text} {isNewFeature && <NewText h={10} />}</Tabs.Tab>
          )
        }
      </Tabs.List>
    </Tabs>
  </>

  const [queryState, setQueryState] = useState({})
  const [closed, setClosed] = useState(true)
  const handleSetQueryStateWithInventoryChange = (inventory) => {
    setQueryState({
      StockItemTypeIDList: typeof inventory?.StockItemType !== 'undefined' ? [Enums.getEnumStringValue(Enums.StockItemType, inventory.StockItemType)] : [],
      SubcategoryIDList: inventory?.InventorySubcategoryID ? [inventory?.InventorySubcategoryID] : [],
      CategoryIDList: inventory?.InventoryCategoryID ? [inventory?.InventoryCategoryID] : [],
    })
  }

  // Calculate the inclusive price from exclusive price and tax percentage
  const calculateInclusivePrice = (exclusivePrice, taxPercent) => {
    const taxRate = parseFloat(taxPercent) || 0;
    return exclusivePrice * (1 + (taxRate / 100));
  };

// Handle changes to the inclusive price
  const handleUnitPriceInclusiveChange = (e) => {
    const inclusivePrice = parseFloat(e.value);
    const taxRate = parseFloat(taxPercentage) || 0;

    // Calculate the exclusive price by removing the tax component
    const exclusivePrice = inclusivePrice / (1 + (taxRate / 100));

    // Update only the exclusive price in state, properly rounded to 2 decimal places
    setUnitPriceExclusive(Math.round(exclusivePrice * 10000) / 10000);

    // If you have markup calculation logic, it will be triggered by the change to unitPriceExclusive
    if (unitCostPrice) {
      setMarginValue(
          exclusivePrice === 0 ? -100 :
              Math.round((exclusivePrice / unitCostPrice - 1) * 10000) / 100
      );
    }
  };

  return (

    <SCModal
      open
      size={pageTabs.some(x => x.text === tabMaterials) ? 'xl' : 650}
      modalProps={{
        styles: {
          body: { minWidth: mobileView ? 'auto' : 500 }
        },
        centered: false
      }}
    // decor={'none'}
    >

      <Title
        mb={{ base: 'md', xl: 'lg' }}
        size={24}
        c={'scBlue.9'}
      >
        {isNew ? 'Adding an Item' : 'Editing an Item'}
      </Title>

      {integrationMessage ?
        <div className={`integration-message ${integrationStatus}`}>
          {integrationMessage}
        </div> : ''
      }

      {isNew && tabs}

      {(() => {
        switch (selectedTab) {
          case tabBundles:
            return <Box mt={'sm'}>
              <AddBundleToQuoteForm
                isNew={isNew}
                itemID={quote.ID || null}
                module={Enums.Module.Quote}
                accessStatus={accessStatus}
                items={quoteItems}
                companyTaxPercentage={companyTaxPercentage}
                triggerSave={triggerBundleSaveCounter}
                onSaveItems={(newItems) => {
                  updateQuoteItems(newItems, addAndContinueRef.current)
                  // Set saving to false after the save operation is complete
                  setSaving(false);
                }}
                defaultSectionPdfSettings={defaultSectionPdfSettings}
              />
            </Box>
          case tabInventory:
            return <div key={0}>
              <Fieldset
                  mt={'sm'}
                  disabled={!!selectedInventory}
                  legend={
                    <Flex align={'center'} gap={5} w={'100%'}>
                      <IconFilter size={15}/>
                      <span>Inventory Filter</span>
                      <IconChevronRight
                          style={{
                            transition: '150ms ease-in-out',
                            transform: closed ? 'rotate(0deg)' : 'rotate(90deg)'
                          }}
                          size={15}
                      />
                    </Flex>
                  }
                  variant={'filled'}
                  onClick={() => setClosed(p => !p)}
                  classNames={{
                    legend: styles.filterFieldsetLegend,
                    root: styles.filterFieldsetRoot + ' ' + (closed ? styles.closed : styles.opened)
                  }}
              >
                <Box onClick={e => e.stopPropagation()}>
                  {
                      !closed &&
                      <ScDataFilter
                          initialValues={queryState}
                          onChange={setQueryState}
                          module={Enums.Module.Inventory}
                          tableNoun={'Inventory'}
                          flexProps={{w: '100%', align: 'start', wrap: {base: 'wrap'}}}
                          singleSelectMode
                          tableName={'inventoryFilter'}
                          optionConfig={{
                            options: [
                              {
                                filterName: 'CategoryIDList',
                                dataOptionValueKey: 'ID',
                                dataOptionLabelKey: ['Description'],
                                queryPath: '/InventoryCategory/false',
                                label: 'Category',
                                fieldSettingSystemName: 'InventoryCategory'
                              },
                              {
                                filterName: 'SubcategoryIDList',
                                dataOptionValueKey: 'ID',
                                dataOptionLabelKey: ['Description'],
                                queryPath: '/InventorySubcategory/GetOnlyActive',
                                showIncludeDisabledToggle: true,
                                label: 'Subcategory',
                                queryParams: {
                                  onlyActive: 'false'
                                },
                                type: 'multiselect',
                                dataOptionSiblingFilterName: 'CategoryIDList',
                                dataOptionSiblingKey: 'InventoryCategoryID',
                                dataOptionGroupingKey: 'InventoryCategoryDescription',
                                fieldSettingSystemName: 'InventorySubcategory'
                              },
                              {
                                filterName: 'StockItemTypeIDList',
                                label: 'Item Type',
                                hardcodedOptions: [
                                  {
                                    label: 'Part',
                                    value: 'Part'
                                  },
                                  {
                                    label: 'Product',
                                    value: 'Product'
                                  },
                                  {
                                    label: 'Service',
                                    value: 'Service'
                                  }
                                ]
                              },
                            ],
                            showIncludeDisabledOptionsToggle: true
                          }}
                      />
                  }
                </Box>
              </Fieldset>
              <Text ta={'start'} ml={'xs'} mt={0} c={'dimmed'} display={closed ? 'none' : 'inline-flex'}
                    opacity={closed ? 0 : 1} style={{transition: '200ms ease-in-out'}}
                    size={'xs'}>{selectedInventory ? 'Inventory selected' : 'Filter is applied when selecting inventory'}</Text>

              {selectedInventory &&
                  <div style={{width: "100%", marginTop: "0.5rem"}}>
                    <ItemDisplayImages
                        itemID={selectedInventory.ID}
                        module={Enums.Module.Inventory}
                        primaryDisplayImageID={selectedInventory.PrimaryDisplayImageID}
                        readOnly={true}
                    />
                  </div>
              }

              <Flex gap={{base: 0, xs: 'sm'}} direction={{base: 'column', xs: 'row'}}>
                <Box
                    style={{flexGrow: 1}}
                >
                  <InventorySelector
                      selectedInventory={selectedInventory}
                      setSelectedInventory={(inv) => {
                        setSelectedInventory(inv)
                        handleSetQueryStateWithInventoryChange(inv)
                      }}
                      setInventoryChanged={setInventoryChanged}
                      accessStatus={accessStatus} error={inputErrors.Inventory}
                      additionalQueryParams={closed ? {} : queryState}
                  />
                </Box>
                <Box
                    style={{flexGrow: 0}}
                    maw={{base: '100%', xs: 134}}
                >
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
                </Box>
              </Flex>
              <Flex gap={{base: 0, xs: 'sm'}} direction={{base: 'column', xs: 'row'}}>
                <Box
                    style={{flexGrow: 1}}
                >
                  <SCTextArea
                      autosize
                      maw={'100%'}
                      maxRows={4}
                      rows={1}
                      label="Description"
                      required={true}
                      type="text"
                      onChange={handleDescriptionChange}
                      value={description}
                      error={inputErrors.Description}
                  />
                </Box>
              </Flex>

              <Flex gap={{base: 0, xs: 'sm'}} direction={{base: 'column', xs: 'row'}}>
                {manageCostingPermission &&
                    <>
                      <Box
                          style={{flexGrow: 1}}
                      >
                        <SCNumericInput
                            cypress="data-cy-cost-price"
                            extraClasses="cost-price"
                            label="Unit Cost Price"
                            required={true}
                            onChange={handleCostPriceChange}
                            value={unitCostPrice}
                            error={inputErrors.UnitCostPrice}
                            signed={false}
                            // min={0}
                            format={Enums.NumericFormat.Currency}
                        />
                      </Box>
                    </>
                }

                {manageCostingPermission && markupShown &&
                    <Box
                        style={{flexGrow: 1}}
                        maw={80}
                    >
                      <ScNumberControl
                          label="Markup %"
                          // withAsterisk
                          placeholder={!+unitCostPrice || (unitCostPrice === unitPriceExclusive) ? 0 :
                              unitPriceExclusive && unitCostPrice ? Math.round((unitPriceExclusive / unitCostPrice - 1) * 10000) / 100 : undefined
                          }
                          value={marginValue}
                          onChange={handleMarginChange}
                          name={'CostPrice'}
                          // min={-100}
                          hideControls
                          withKeyboardEvents={false}
                      />
                    </Box>
                }
                <Box
                    style={{flexGrow: 1}}
                >
                  {
                    useInclusivePricing ?
                        <SCNumericInput
                            cypress="data-cy-price-incl-vat"
                            extraClasses="price-incl-vat"
                            label="Price Incl VAT"
                            required={true}
                            onChange={handleUnitPriceInclusiveChange}
                            value={calculateInclusivePrice(unitPriceExclusive, taxPercentage)}
                            error={inputErrors.UnitPriceExclusive}
                            signed={true}
                            // min={0} negative value is allowed
                            format={Enums.NumericFormat.Currency}
                        />
                        :
                        <SCNumericInput
                            cypress="data-cy-price-excl-vat"
                            extraClasses="price-excl-vat"
                            label="Price Excl VAT"
                            required={true}
                            onChange={handleUnitPriceExclusiveChange}
                            value={unitPriceExclusive}
                            error={inputErrors.UnitPriceExclusive}
                            signed={true}
                            // min={0} negative value is allowed
                            format={Enums.NumericFormat.Currency}
                        />
                  }
                </Box>
                <Box
                    style={{flexGrow: 1}}
                    maw={80}
                >
                  <SCNumericInput
                      label="Discount %"
                      required={true}
                      onChange={handleLineDiscountPercentageChange}
                      value={lineDiscountPercentage}
                      error={inputErrors.LineDiscountPercentage}
                      min={0}
                      format={Enums.NumericFormat.Percentage}
                  />
                </Box>
                <Box
                    style={{flexGrow: 1}}
                >
                  <SCDropdownList
                      onChange={handleTaxRateChange}
                      label="Tax Rate"
                      options={taxRates}
                      value={taxRate}
                      required={true}
                      error={inputErrors.TaxRate}
                  />
                </Box>
              </Flex>

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
                autosize
                maw={'100%'}
                maxRows={15}
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
                            <SCCheckbox extraClasses={"no-margin"} value={productChecked(product)}
                              onChange={() => handleProductChecked(product)} />
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
            return <Box
              pt={'sm'}
            >
              <JobMaterialsSelectTable
                filteredJobInventory={jobInventory}
                itemId={quote.ID}
                onSelectedItemsChanged={setSelectedJobInventoryToAdd}
                module={Enums.Module.Quote}
                resetSelections={resetSelectionsCounter}
              />
            </Box>
        }
      })()}
      {/* <ScrollArea.Autosize
              // mah={300}
              // mih={'100%'}
              offsetScrollbars={'y'}
              pl={10}
          >


          </ScrollArea.Autosize>*/}

      {
        // selectedTab !== tabMaterials &&
        selectedTab !== tabBundles &&
        isNew && <>
          <Checkbox
            label={<>{sections?.length === 0 ? 'Add to new section' : 'Add to section'} <NewText h={14} /></>}
            mt={'lg'}
            size={'sm'}
            // defaultValue={addToSection}
            checked={addToSection}
            onChange={e => setAddToSection(e.currentTarget.checked)}
          />

          {
            addToSection &&
            <SectionSelector
              moduleId={Enums.Module.Quote}
              itemId={quote.ID}
              selectedTableGroup={addToTableGroupItem}
              onSectionsLoaded={setSections}
              onSectionSelect={setSelectedSection}
              onNewSectionNameChange={setNewSectionTitle}
              label="Section"
              placeholder="None (Create new section)"
              description={'Select an existing section or specify a new section name'}
              mt={'sm'}
              tableData={quoteItems}
              dataSectionIdKey={'InventorySectionID'}
              dataSectionNameKey={'InventorySectionName'}
            />
          }
        </>
      }

      {buttonToolbar}

      {showCreateInventory && (
        <InventoryItemModal 
          isNew={true} 
          onInventorySave={onInventoryCreate} 
          accessStatus={accessStatus} 
          onClose={() => setShowCreateInventory(false)} 
        />
      )}

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

          .custom-actions :global(.button) {
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

          .actions :global(.button) {
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

          .table td:last-child :global(div) {
            margin-left: auto;
          }

          .table td:first-child {
            border-radius: ${layout.buttonRadius} 0 0 ${layout.buttonRadius};
            padding-left: 1rem;
            text-align: left;
          }

          .table td:first-child :global(div) {
            margin-left: 0;
          }
        `}</style>

    </SCModal>
  )
}

export default ManageQuoteItem;
