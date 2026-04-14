import React, { useState, useEffect, useContext, useRef, useMemo } from 'react';
import { colors, layout } from '../../../theme';
import SCInput from '../../sc-controls/form-controls/sc-input';
import SCTextArea from '../../sc-controls/form-controls/sc-textarea';
import SCNumericInput from '../../sc-controls/form-controls/sc-numeric-input';
import SCCheckbox from '../../sc-controls/form-controls/sc-checkbox';
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
import { Checkbox, Title, Flex, Button, Box, Tabs, Fieldset, Text } from "@mantine/core";
import SCModal from "@/PageComponents/Modal/SCModal";
import SectionSelector from "@/PageComponents/Inventory/SectionSelector";
import AddBundleToInvoiceForm from "@/PageComponents/Inventory/AddBundleToSectionListForm";
import JobMaterialsSelectTable from "@/PageComponents/SectionTable/Section Component Tables/JobMaterialsSelectTable";
import tabStyles from "@/styles/Tabs.module.css";
import NewText from "@/PageComponents/Premium/NewText";
import { useMediaQuery } from "@mantine/hooks";
import WarehouseSelector from '@/components/selectors/warehouse/warehouse-selector';
import featureService from '@/services/feature/feature-service';
import constants from '@/utils/constants';
import { IconChevronRight, IconFilter } from '@tabler/icons-react';
import ScDataFilter from '@/PageComponents/Table/Table Filter/ScDataFilter';
import styles from '@/PageComponents/Inventory/AddInventoryItemForm.module.css'
import ItemDisplayImages from '@/PageComponents/Attachment/ItemDisplayImages';

const tabInventory = "Material / Service";
const tabBundles = "Bundle";
const tabAsset = "Asset Description";
const tabMaterials = "Job Material / Service";
const tabDescription = "Description";

function ManageInvoiceItem({ isNew, invoice, invoiceItems, tab, itemID, module, jobInventory, hasAssets, customerID, invoiceItem, saveInvoiceItem, updateItems, integration, companyTaxPercentage, accessStatus, cypressInventorySelector, cypressQuantity, addToTableGroupItem, defaultSectionPdfSettings, userColumnConfig, warehouse }) {

  const useInclusivePricing = useMemo(() => userColumnConfig?.find(x => x.ColumnName === 'UnitPriceInclusive')?.Show, [userColumnConfig])

  const mobileView = useMediaQuery('(max-width: 800px)')

  const [addToSection, setAddToSection] = useState<boolean>(!!addToTableGroupItem)
  const [sections, setSections] = useState<any>()
  const [newSectionTitle, setNewSectionTitle] = useState<any>()
  const [selectedSection, setSelectedSection] = useState<any>()

  const [hasStockControl, setHasStockControl] = useState<boolean | undefined>();
  const [suppressSave, setSuppressSave] = useState(false);


  const toast = useContext<any>(ToastContext);

  const [selectedTab, setSelectedTab] = useState(isNew ? tab : invoiceItem.InvoiceItemType === Enums.InvoiceItemType.Inventory ? tabInventory : tabDescription);
  const [pageTabs, setPageTabs] = useState<any[]>([]);

  const [triggerBundleSaveCounter, setTriggerBundleSaveCounter] = useState(0)

  const buildUpPageTabs = () => {

    let tabs: any[] = [];

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
      if (invoiceItem.InvoiceItemType == Enums.InvoiceItemType.Inventory) {
        tabs = [{ text: tabInventory, suppressCount: true }];
      } else {
        tabs = [{ text: tabDescription, suppressCount: true }];
      }
    }

    setPageTabs(tabs);
  };

  useEffect(() => {
    featureService.getFeature(constants.features.STOCK_CONTROL).then(feature => {
      setHasStockControl(!!feature);
    });
    buildUpPageTabs();
  }, []);

  useEffect(() => {
    buildUpPageTabs();
  }, [jobInventory]);

  useEffect(() => {
    if (selectedTab == tabAsset) {
      getAssetPageSize();
    }
    if (selectedTab == tabInventory) {
      if (!isNew) {
        setInventory(invoiceItem.InventoryID);
      }
    }
  }, [selectedTab]);

  // SHARED TAB

  const getJobCard = async () => {
    setItem(await JobService.getJob(itemID));
  }

  const [item, setItem] = useState<any>();

  useEffect(() => {
    if (module == Enums.Module.JobCard) {
      getJobCard();
    }
  }, []);

  const [description, setDescription] = useState(isNew ? '' : invoiceItem.Description);

  const handleDescriptionChange = (e) => {
    setDescription(e.value);
  };

  const useJobDescriptionClick = () => {
    setDescription(item ? item.Description : '');
  };

  // INVENTORY ITEM TAB

  const firstInventoryUpdate = useRef(true);
  const firstInventoryNotSelectedUpdate = useRef(true);
  const [selectedInventory, setSelectedInventory] = useState<any>();
  const [inventoryChanged, setInventoryChanged] = useState<any>(false);

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
    } as any);
    return inventory;
  };

  const [integrationMessage, setIntegrationMessage] = useState<any>(null);
  const [integrationStatus, setIntegrationStatus] = useState<any>('pending');

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

  const [quantity, setQuantity] = useState(isNew ? 1 : invoiceItem.Quantity);

  const [selectedWarehouse, setSelectedWarehouse] = useState<any>(isNew ? null : invoiceItem.Warehouse);

  const handleQuantityChange = (e) => {
    setQuantity(parseFloat(e.value));
  };

  const [lineDiscountPercentage, setLineDiscountPercentage] = useState(isNew ? 0 : invoiceItem.LineDiscountPercentage);

  const handleLineDiscountPercentageChange = (e) => {
    setLineDiscountPercentage(parseFloat(e.value));
  };

  const [unitPriceExclusive, setUnitPriceExclusive] = useState(isNew ? 0 : invoiceItem.UnitPriceExclusive);

  const handleUnitPriceExclusiveChange = (e) => {
    setUnitPriceExclusive(parseFloat(e.value));
  };

  const taxRates = Enums.getEnumItems(Enums.QuoteTaxRate);
  const [taxRate, setTaxRate] = useState(isNew ? companyTaxPercentage > 0 ? 'Standard Rate' : 'No VAT' : invoiceItem.TaxPercentage > 0 ? 'Standard Rate' : 'No VAT');
  const [taxPercentage, setTaxPercentage] = useState(isNew ? companyTaxPercentage ? companyTaxPercentage : 0 : invoiceItem.TaxPercentage);

  const handleTaxRateChange = (value) => {
    setTaxRate(value);
    if (value == 'Standard Rate') {
      setTaxPercentage(companyTaxPercentage);
    } else {
      setTaxPercentage(0);
    }
  };

  const [lineTotalExclusive, setLineTotalExclusive] = useState(isNew ? 0 : invoiceItem.LineTotalExclusive);

  const updateTotals = () => {
    if (selectedInventory && (quantity > 0)) {

      let subTotal = quantity * Math.round(unitPriceExclusive * 100) / 100;
      let discount = subTotal * (lineDiscountPercentage / 100);
      let totalExclVat = Helper.roundToTwo(subTotal - discount);
      setLineTotalExclusive(parseFloat(totalExclVat + ''));
    } else {
      setLineTotalExclusive(0);
    }
  };

  // Calculate the inclusive price from exclusive price and tax percentage
  const calculateInclusivePrice = (exclusivePrice: number, taxPercent: number) => {
    const taxRate = parseFloat(taxPercent + '') || 0;
    return exclusivePrice * (1 + (taxRate / 100));
  };

  // Handle changes to the inclusive price
  const handleUnitPriceInclusiveChange = (e: any) => {
    const inclusivePrice = parseFloat(e.value);
    const taxRate = parseFloat(taxPercentage + '') || 0;

    // Calculate the exclusive price by removing the tax component
    const exclusivePrice = inclusivePrice / (1 + (taxRate / 100));

    // Update only the exclusive price in state, properly rounded to 2 decimal places
    setUnitPriceExclusive(Math.round(exclusivePrice * 10000) / 10000);
  };

  useEffect(() => {
    updateTotals();
  }, [selectedInventory, quantity, lineDiscountPercentage, unitPriceExclusive]);

  // ASSET TAB

  const [productSearch, setProductSearch] = useState('');
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProductIds, setSelectedProductIds] = useState<any[]>([]);

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

    let params: any = {
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
    } as any);
    setProducts(request.Results);
    setTotalAssetResults(request.TotalResults);
  };

  useEffect(() => {
    buildUpPageTabs();
  }, [jobInventory]);


  const [selectedJobInventoryToAdd, setSelectedJobInventoryToAdd] = useState<any[]>([])
  const [resetSelectionsCounter, setResetSelectionsCounter] = useState(0)

  const [inputErrors, setInputErrors] = useState<any>({});

  const [saving, setSaving] = useState(false);

  const addAndContinueRef = useRef(false);

  const getSelectedWarehouse = () => {
    if (module === Enums.Module.JobCard) {
      return warehouse;
    }
    return selectedWarehouse;
  };

  const saveItem = async () => {

    setSaving(true);

    const sectionMeta = {
      InventorySectionName: addToSection ? (selectedSection?.Name || newSectionTitle) : null,
      InventorySectionID: addToSection ? (selectedSection?.ID || crypto.randomUUID()) : null,
      HideLineItems: false,
      DisplaySubtotals: false,
      ...defaultSectionPdfSettings,
    }

    if (selectedTab == tabInventory || selectedTab == tabDescription) {
      let inputs: any = '';
      if (selectedTab == tabInventory) {
        inputs = [
          { key: 'Quantity', value: quantity, required: true, gt: 0, type: Enums.ControlType.Number },
          { key: 'UnitPriceExclusive', value: unitPriceExclusive, required: true, type: Enums.ControlType.Number },
          { key: 'Inventory', value: selectedInventory, required: true, type: Enums.ControlType.Select },
          { key: 'Description', value: description, required: true, type: Enums.ControlType.Text },
          { key: 'LineDiscountPercentage', value: lineDiscountPercentage, btw: [0, 100], type: Enums.ControlType.Number },
          { key: 'TaxRate', value: taxRate, required: true, type: Enums.ControlType.Select },
          // STOCK CONTROL ISQUANTITYTRACKED CHANGE
          { key: 'Warehouse', value: getSelectedWarehouse(), required: hasStockControl && !!selectedInventory && Helper.isInventoryWarehoused(selectedInventory) /*selectedInventory.IsQuantityTracked*/, type: Enums.ControlType.Select }
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
        let itemUpdated: any = { IsActive: true };
        if (selectedTab == tabInventory) {
          // STOCK CONTROL ISQUANTITYTRACKED CHANGE
          itemUpdated = {
            ...itemUpdated,
            Description: description,
            Quantity: quantity,
            LineDiscountPercentage: lineDiscountPercentage,
            UnitPriceExclusive: unitPriceExclusive,
            LineTotalExclusive: lineTotalExclusive,
            InventoryID: selectedInventory.ID,
            InventoryDescription: description,
            InventoryCode: selectedInventory.Code,
            Inventory: selectedInventory,
            InventoryActive: selectedInventory.IsActive,
            InvoiceItemType: Enums.InvoiceItemType.Inventory,
            TaxPercentage: taxPercentage,
            Integrated: selectedInventory.Integrated,
            IntegrationMessage: selectedInventory.IntegrationMessage,
            WarehouseID: Helper.isInventoryWarehoused(selectedInventory) /*selectedInventory.IsQuantityTracked*/ ? getSelectedWarehouse()?.ID : null,
            Warehouse: Helper.isInventoryWarehoused(selectedInventory) /*selectedInventory.IsQuantityTracked*/ ? getSelectedWarehouse() : null,
            IsNew: isNew === true,
            ...sectionMeta
          };
        } else {
          itemUpdated = {
            ...itemUpdated,
            Description: description,
            InventoryDescription: description,
            InvoiceItemType: Enums.InvoiceItemType.Description,
            ...sectionMeta
          };
        }

        saveInvoiceItem(itemUpdated, addAndContinueRef.current);

        // If Add and Continue, reset form fields
        if (addAndContinueRef.current) {
          // Reset form fields
          setDescription('');
          setQuantity(1);
          setLineDiscountPercentage(0);
          setUnitPriceExclusive(0);
          setLineTotalExclusive(0);
          setSelectedInventory(null);
          setInventoryChanged(p => !p);
          handleSetQueryStateWithInventoryChange(null);
          setInputErrors({});
          setSaving(false);
          // Reset section controls
          // Clear section selection only when there's no selected section
          if (!selectedSection?.ID) {
            setSelectedSection(null);
            setAddToSection(false);
          }
          setNewSectionTitle('');
        }
      }
    } else if (selectedTab == tabAsset) {
      let productsToAdd = products.filter(x => selectedProductIds.some(y => y == x.ID)).sort((a, b) => a.LineNumber - b.LineNumber);
      if (productsToAdd.length < 1) {
        toast.setToast({
          message: 'Please select assets',
          show: true,
          type: 'error'
        });
        setSaving(false);
      } else {
        let items: any[] = [];
        for (let index in productsToAdd) {
          let item = productsToAdd[index];
          items.push({
            Description: item.InventoryDescription + ' - ' + item.ProductNumber,
            InventoryDescription: item.InventoryDescription + ' - ' + item.ProductNumber,
            IsActive: true,
            InvoiceItemType: Enums.InvoiceItemType.Description,
            ...sectionMeta
          });
        }
        // saveInvoiceItems(items);
        updateItems([...invoiceItems, ...items].map((x, i) => ({ ...x, LineNumber: i + 1 })), addAndContinueRef.current)
        // modal closed instantly anyways by default to save state has no meaning - we need to set false to avoid disabling buttons with add and continue feature
        // If Add and Continue, reset form for next item
        if (addAndContinueRef.current) {
          setSelectedProductIds([]);
          setSelectAllAssets(false);
          setSaving(false);
          // Reset section controls
          // Clear section selection only when there's no selected section
          if (!selectedSection?.ID) {
            setSelectedSection(null);
            setAddToSection(false);
          }
          setNewSectionTitle('');
        }
      }
    } else if (selectedTab == tabMaterials) {
      if (selectedJobInventoryToAdd.length < 1) {
        toast.setToast({
          message: 'Please select materials',
          show: true,
          type: 'error'
        });
        setSaving(false);
      } else {
        const newSectionIdMapping = selectedJobInventoryToAdd.reduce((p, c) => (
          c.InventorySectionID && !p.hasOwnProperty(c.InventorySectionID) ? {
            ...p,
            [c.InventorySectionID]: crypto?.randomUUID()
          } : p
        ), {})

        const itemsToAdd: any[] = await Promise.all(selectedJobInventoryToAdd.sort((a, b) => a.LineNumber - b.LineNumber).map(async x => {
          const inventory = await getInventory(x.InventoryID);

          let lineTotalExclusive = 0;

          let unitPriceExclusive = x.UnitPriceExclusive ?? inventory.ListPrice;
          let lineDiscountPercentage = x.LineDiscountPercentage ?? 0;

          if (unitPriceExclusive > 0) {
            let subTotal = ((x.QuantityRequested - x.QuantityInvoiced) * unitPriceExclusive) * (1 - lineDiscountPercentage / 100);
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
            ...defaultSectionPdfSettings,
          }

          return {
            ...(x.ProductID ? {
              Description: x.InventoryDescription + ' - ' + x.ProductNumber,
              InventoryDescription: x.InventoryDescription + ' - ' + x.ProductNumber,
              IsActive: true,
              InvoiceItemType: Enums.InvoiceItemType.Description
            } : {
              Description: x.Description || x.InventoryDescription,
              Quantity: x.QuantityRequested - x.QuantityInvoiced - x.QuantityInvoicedDraft,
              InventoryID: x.InventoryID,
              InventoryDescription: x.InventoryDescription,
              InventoryCode: x.InventoryCode,
              Inventory: inventory,
              ProductID: x.ProductID,
              ProductNumber: x.ProductNumber,
              TaxPercentage: companyTaxPercentage,
              Integrated: inventory.Integrated,
              IntegrationMessage: inventory.IntegrationMessage,
              LineDiscountPercentage: lineDiscountPercentage,
              UnitPriceExclusive: unitPriceExclusive,
              LineTotalExclusive: lineTotalExclusive,
              IsActive: true,
              InvoiceItemType: Enums.InvoiceItemType.Inventory,
              WarehouseID: x.WarehouseID,
              Warehouse: x.Warehouse,
              IsNew: true
            }),
            ...section
          }
        }));

        const newItems = [
          ...invoiceItems,
          ...itemsToAdd
        ].map((x, i) => ({ ...x, LineNumber: i + 1 }))

        // console.log('new items', newItems)
        updateItems(newItems, addAndContinueRef.current)

        // If Add and Continue, reset form for next item
        if (addAndContinueRef.current) {
          setSelectedJobInventoryToAdd([]);
          // Increment the resetSelectionsCounter to reset the JobMaterialsSelectTable
          setResetSelectionsCounter(prev => prev + 1);
          setSaving(false);
          // Reset section controls
          setAddToSection(false);
          // Clear section selection only when there's no selected section
          if (!selectedSection?.ID) {
            setSelectedSection(null);
          }
          setNewSectionTitle('');
        }


        /*let items: any[] = [];
        for (let index in jobInventoryToAdd) {
          let item = jobInventoryToAdd[index];

          if (item.ProductID) {
            items.push({
              Description: item.InventoryDescription + ' - ' + item.ProductNumber,
              InventoryDescription: item.InventoryDescription + ' - ' + item.ProductNumber,
              IsActive: true,
              InvoiceItemType: Enums.InvoiceItemType.Description,
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
              InvoiceItemType: Enums.InvoiceItemType.Inventory,
              ...sectionMeta
            });
          }
        }
        saveInvoiceItems(items);*/
      }
    } else if (selectedTab === tabBundles) {
      setTriggerBundleSaveCounter((p) => (p + 1))
      // Don't set saving to false here, it will be set in the onSaveItems callback
    }

    if (!isNew) {
      setSaving(false);
    }
  };

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

  const buttonToolbar = <Flex w={'100%'} justify={'end'} gap={5} mt={'lg'}>
    {selectedTab === tabDescription && module === Enums.Module.JobCard ?
      <div className="custom-actions">
        <Button onClick={useJobDescriptionClick} variant={'outline'}>
          Use Job Description
        </Button>
      </div>
      : ''
    }
    <Button variant={'subtle'} color={'gray.9'} onClick={() => {
      // Always close the modal when cancel is clicked, regardless of addAndContinueRef.current
      addAndContinueRef.current = false;
      saveInvoiceItem(null, false);
    }}>
      Cancel
    </Button>
    {isNew && (
      <Button
        onClick={() => {
          addAndContinueRef.current = true;
          saveItem();
        }}
        disabled={saving || suppressSave}
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
      disabled={saving || suppressSave}
      mr={-2}
    >
      {isNew ? 'Add' : 'Save'}
    </Button>
  </Flex>;


  const [queryState, setQueryState] = useState({})
  const [closed, setClosed] = useState(true)
  const handleSetQueryStateWithInventoryChange = (inventory) => {
    setQueryState({
      StockItemTypeIDList: typeof inventory?.StockItemType !== 'undefined' ? [Enums.getEnumStringValue(Enums.StockItemType, inventory.StockItemType)] : [],
      SubcategoryIDList: inventory?.InventorySubcategoryID ? [inventory?.InventorySubcategoryID] : [],
      CategoryIDList: inventory?.InventoryCategoryID ? [inventory?.InventoryCategoryID] : [],
    })
  }

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
              <AddBundleToInvoiceForm
                isNew={isNew}
                itemID={invoice.ID || null}
                module={Enums.Module.Invoice}
                accessStatus={accessStatus}
                items={invoiceItems}
                companyTaxPercentage={companyTaxPercentage}
                triggerSave={triggerBundleSaveCounter}
                onSaveItems={(newItems) => {
                  updateItems(newItems, addAndContinueRef.current)
                  // Set saving to false after the save operation is complete
                  setSaving(false);
                }}
                defaultSectionPdfSettings={defaultSectionPdfSettings}
                storeID={invoice.StoreID}
                onSuppressSave={setSuppressSave}
                warehouse={warehouse}
              />
            </Box>
          case tabInventory:
            return <div key={0}>
              <Fieldset
                mt={'sm'}
                disabled={!!selectedInventory}
                legend={
                  <Flex align={'center'} gap={5} w={'100%'}>
                    <IconFilter size={15} />
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
                      initialValues={queryState as any}
                      onChange={setQueryState}
                      module={Enums.Module.Inventory}
                      tableNoun={'Inventory'}
                      flexProps={{ w: '100%', align: 'start', wrap: { base: 'wrap' } }}
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
              <Text
                ta={'start'}
                ml={'xs'}
                mt={0}
                c={'dimmed'}
                display={closed ? 'none' : 'inline-flex'}
                opacity={closed ? 0 : 1}
                style={{ transition: '200ms ease-in-out' }}
                size={'xs'}
              >
                {selectedInventory ? 'Inventory selected' : 'Filter is applied when selecting inventory'}
              </Text>

              {selectedInventory &&
                <div style={{ width: "100%", marginTop: "0.5rem" }}>
                  <ItemDisplayImages
                    itemID={selectedInventory.ID}
                    module={Enums.Module.Inventory}
                    primaryDisplayImageID={selectedInventory.PrimaryDisplayImageID}
                    readOnly={true}
                  />
                </div>
              }

              <Flex gap={{ base: 0, xs: 'sm' }} direction={{ base: 'column', xs: 'row' }}>
                <Box
                  style={{ flexGrow: 1 }}
                >
                  <InventorySelector
                    selectedInventory={selectedInventory}
                    setSelectedInventory={(inv) => {
                      setSelectedInventory(inv)
                      handleSetQueryStateWithInventoryChange(inv)
                    }}
                    setInventoryChanged={setInventoryChanged as any}
                    accessStatus={accessStatus} error={inputErrors.Inventory}
                    cypress={cypressInventorySelector}
                    additionalQueryParams={closed ? {} : queryState as any}
                    {...{} as any}
                  />
                </Box>
                <Box
                  style={{ flexGrow: 0 }}
                  maw={{ base: '100%', xs: 134 }}
                >
                  <SCNumericInput
                    cypress={cypressQuantity}
                    label="Quantity"
                    required={true}
                    onChange={handleQuantityChange}
                    value={quantity}
                    error={inputErrors.Quantity}
                    min={0}
                    format={Enums.NumericFormat.Decimal}
                    {...{} as any}

                  />
                </Box>
              </Flex>

              <Flex gap={{ base: 0, xs: 'sm' }} direction={{ base: 'column', xs: 'row' }}>
                <Box
                  style={{ flexGrow: 1 }}
                >
                  <SCTextArea
                    label="Description"
                    required={true}
                    autosize
                    rows={1}
                    maxRows={5}
                    maw={'100%' as any}
                    onChange={handleDescriptionChange}
                    value={description}
                    error={inputErrors.Description}
                  />
                </Box>
                {
                  // STOCK CONTROL ISQUANTITYTRACKED CHANGE
                  hasStockControl && !!selectedInventory && Helper.isInventoryWarehoused(selectedInventory) && module !== Enums.Module.JobCard &&
                  <WarehouseSelector
                    required={true}
                    selectedWarehouse={selectedWarehouse}
                    setSelectedWarehouse={setSelectedWarehouse}
                    storeID={invoice.StoreID}
                    filterByEmployee={true}
                    error={inputErrors.Warehouse}
                    hideFromView={true}
                    onSuppressSave={setSuppressSave}
                    ignoreIDs={[]}
                  />
                }
              </Flex>


              {/*<div className="row">
                <div className="column">
                  <InventorySelector
                      selectedInventory={selectedInventory}
                      setSelectedInventory={(inv) => {
                        setSelectedInventory(inv)
                        handleSetQueryStateWithInventoryChange(inv)
                      }}
                    setInventoryChanged={setInventoryChanged as any}
                    accessStatus={accessStatus} error={inputErrors.Inventory}
                    cypress={cypressInventorySelector}
                    {...{} as any}
                  />
                </div>
                <div className="column">
                  {hasStockControl && !!selectedInventory && selectedInventory.IsQuantityTracked && <WarehouseSelector
                    required={true}
                    selectedWarehouse={selectedWarehouse}
                    setSelectedWarehouse={setSelectedWarehouse}
                    storeID={invoice.StoreID}
                    filterByEmployee={true}
                    error={inputErrors.Warehouse}
                  />}
                </div>
              </div>*/}
              {/*<div className="row">
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
              </div>*/}

              <Flex gap={{ base: 0, xs: 'sm' }} direction={{ base: 'column', xs: 'row' }}>
                <Box
                  style={{ flexGrow: 1 }}
                >
                  {
                    useInclusivePricing ?
                      <SCNumericInput
                        cypress="data-cy-price-incl-vat"
                        label="Price Incl VAT"
                        required={true}
                        onChange={handleUnitPriceInclusiveChange}
                        value={calculateInclusivePrice(unitPriceExclusive, taxPercentage)}
                        error={inputErrors.UnitPriceExclusive}
                        min={0}
                        format={Enums.NumericFormat.Currency}
                        {...{} as any}
                      />
                      :
                      <SCNumericInput
                        cypress="data-cy-price-excl-vat"
                        label="Price Excl VAT"
                        required={true}
                        onChange={handleUnitPriceExclusiveChange}
                        value={unitPriceExclusive}
                        error={inputErrors.UnitPriceExclusive}
                        min={0}
                        format={Enums.NumericFormat.Currency}
                        {...{} as any}
                      />
                  }
                </Box>
                <Box
                  style={{ flexGrow: 1 }}
                >
                  <SCNumericInput
                    label="Discount %"
                    required={true}
                    onChange={handleLineDiscountPercentageChange}
                    value={lineDiscountPercentage}
                    error={inputErrors.LineDiscountPercentage}
                    min={0}
                    format={Enums.NumericFormat.Percentage}
                    {...{} as any}

                  />
                </Box>
                <Box
                  style={{ flexGrow: 1 }}
                >
                  <SCDropdownList
                    onChange={handleTaxRateChange}
                    label="Tax Rate"
                    options={taxRates}
                    // noInput={true as any}
                    value={taxRate}
                    error={inputErrors.TaxRate}
                  />
                </Box>
              </Flex>
              {/* <div className="row">
                <div className="column">
                  <SCNumericInput
                    cypress={cypressQuantity}
                    label="Quantity"
                    required={true}
                    onChange={handleQuantityChange}
                    value={quantity}
                    error={inputErrors.Quantity}
                    min={0}
                    format={Enums.NumericFormat.Decimal}
                    {...{} as any}

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
                    {...{} as any}

                  />
                </div>
              </div>
              <div className="row">
                <div className="column">
                  <SCNumericInput
                    cypress="data-cy-price-excl-vat"
                    label="Price Excl VAT"
                    required={true}
                    onChange={handleUnitPriceExclusiveChange}
                    value={unitPriceExclusive}
                    error={inputErrors.UnitPriceExclusive}
                    min={0}
                    format={Enums.NumericFormat.Currency}
                    {...{} as any}

                  />
                </div>
                <div className="column">
                  <SCDropdownList
                    onChange={handleTaxRateChange}
                    label="Tax Rate"
                    options={taxRates}
                    // noInput={true as any}
                    value={taxRate}
                    error={inputErrors.TaxRate}
                  />
                </div>
              </div>*/}
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
                maw={'100%' as any}
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
                            <SCCheckbox extraClasses={"no-margin"}
                              value={selectAllAssets as any}
                              onChange={() => handleSelectAllAssets()}
                              whiteBackground={true} title="Select all" /> : ''
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
                            <SCCheckbox extraClasses={"no-margin"} value={productChecked(product) as any}
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
                itemId={invoice.ID}
                module={Enums.Module.Invoice}
                onSelectedItemsChanged={(items: any[]) => setSelectedJobInventoryToAdd(items)}//.filter(x => x.QuantityRequested > x.QuantityInvoiced))}
                blockFullyInvoicedSelection={true}
                resetSelections={resetSelectionsCounter}
              />
            </Box>

          /*return <div key={2} className="items-container">
            <div className="row">
              <div className="table-container">
                <table className="table">
                  <thead>
                  <tr>
                    <th className="header-item-select">
                      {jobInventory.length > 0 ?
                          <SCCheckbox extraClasses={"no-margin"} value={selectAllJobInventory as any}
                                      onChange={() => handleSelectAllJobInventory()}
                                      whiteBackground={true} title="Select all"/> : ''
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
                        <SCCheckbox extraClasses={"no-margin"} value={jobInventoryChecked(inventory) as any}
                                    onChange={() => handleJobInventoryChecked(inventory)}/>
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
          </div>*/
        }
      })()}

      {/*<ScrollArea.Autosize
            mah={350}
            // mih={'100%'}
            offsetScrollbars={'y'}
            pl={10}
        >


        </ScrollArea.Autosize>*/}

      {
        selectedTab !== tabBundles &&
        isNew && <>
          <Checkbox
            label={<>{sections?.length === 0 ? 'Add to new section' : 'Add to section'} <NewText /></>}
            mt={'lg'}
            size={'sm'}
            // defaultValue={addToSection}
            checked={addToSection}
            onChange={e => setAddToSection(e.currentTarget.checked)}
          />

          {
            addToSection &&
            <SectionSelector
              moduleId={Enums.Module.Invoice}
              itemId={invoice.ID || null}
              selectedTableGroup={addToTableGroupItem}
              onSectionsLoaded={setSections}
              onSectionSelect={setSelectedSection}
              onNewSectionNameChange={setNewSectionTitle}
              label="Section"
              placeholder="None (Create new section)"
              description={'Select an existing section or specify a new section name'}
              mt={'sm'}
              tableData={invoiceItems}
              dataSectionIdKey={'InventorySectionID'}
              dataSectionNameKey={'InventorySectionName'}
            />
          }
        </>
      }


      {buttonToolbar}

      <style jsx>{`
          .modal-container {
            padding-bottom: 5rem;
          }

          .title {
            color: ${colors.bluePrimary};
            font-size: 1.125rem;
            font-weight: bold;
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

export default ManageInvoiceItem;
