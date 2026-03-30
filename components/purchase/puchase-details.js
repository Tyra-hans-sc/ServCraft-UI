import React, { useState, useRef, useEffect } from 'react';
import Helper from '../../utils/helper';
import ManagePurchaseOrderItem from '../modals/purchase/manage-purchase-item';
import * as Enums from '../../utils/enums';
import Fetch from '../../utils/Fetch';
import PurchasesSectionTable from "../../PageComponents/Purchases/PurchasesSectionTable";
import PurchasePreferencesDrawer from "../../PageComponents/Purchases/PurchasePreferencesDrawer";
import {ActionIcon, Tooltip} from "@mantine/core";
import {IconDotsVertical} from "@tabler/icons-react";

function PurchaseOrderDetails({ itemID, module, purchaseOrder, purchaseOrderItems, updatePurchaseOrderItems, companyTaxPercentage, integration, accessStatus }) {

  // MANAGE ITEMS

  const [showManageItemModal, setShowManageItemModal] = useState(false);
  const [itemToEdit, setItemToEdit] = useState(null);
  const [itemEditIndex, setItemEditIndex] = useState(-1);
  const [isNewItem, setIsNewItem] = useState(true);

  const [itemTab, setItemTab] = useState('Inventory Item');

  const updateItem = (item) => {
    let updatedList = purchaseOrderItems;
    let index = updatedList.indexOf(item);
    updatedList[index] = item;
    updatePurchaseOrderItems(updatedList);
  };

  const removeItem = (item) => {
    let temp = purchaseOrderItems;
    let indexToRemove = temp.indexOf(item);
    temp.splice(indexToRemove, 1);
    updatePurchaseOrderItems(temp);
  };

  const toggleManageItemModal = (item, index) => {
    if (accessStatus === Enums.AccessStatus.LockedWithAccess
      || accessStatus === Enums.AccessStatus.LockedWithOutAccess
      || purchaseOrder.PurchaseOrderStatus != Enums.PurchaseOrderStatus.Draft) {
      return;
    }

    setShowManageItemModal(!showManageItemModal);
    setItemToEdit(item);
    setItemEditIndex(index);
    setIsNewItem(item === null);
  };

  const updateLineTotal = (item) => {
    if (item.Quantity > 0 && item.UnitPriceExclusive > 0) {

      let subTotal = item.Quantity * item.UnitPriceExclusive;
      let discount = subTotal * (item.LineDiscountPercentage / 100);
      let totalExclVat = subTotal - discount;
      item.LineTotalExclusive = parseFloat(totalExclVat.toFixed(2));
    } else {
      item.LineTotalExclusive = 0;
    }
  };

  // DESCRIPTION

  const [descriptionEditEnabled, setDescriptionEditEnabled] = useState(false);
  const [descriptionEditIndex, setDescriptionEditIndex] = useState(null);
  const [descriptionFocus, setDescriptionFocus] = useState(false);

  const toggleDescriptionEdit = (index) => {
    if (accessStatus === Enums.AccessStatus.LockedWithAccess || accessStatus === Enums.AccessStatus.LockedWithOutAccess) {
      return;
    }

    resetEdits("Description");
    setDescriptionEditIndex(index);
    setDescriptionEditEnabled(true);
    setDescriptionFocus(true);
  };

  const handleDescriptionChange = (item, e) => {
    item.Description = e.target.value;
    item.InventoryDescription = e.target.value;
    updateItem(item);
  };

  const handleDescriptionChangeSC = (item, e) => {
    item.Description = e.value;
    item.InventoryDescription = e.value;
    updateItem(item);
  };

  // QUANTITY

  const [quantityEditEnabled, setQuantityEditEnabled] = useState(false);
  const [quanityEditIndex, setQuantityEditIndex] = useState(null);
  const [quantityFocus, setQuantityFocus] = useState(false);

  const toggleQuantityEdit = (index) => {
    if (accessStatus === Enums.AccessStatus.LockedWithAccess || accessStatus === Enums.AccessStatus.LockedWithOutAccess) {
      return;
    }

    resetEdits("Quantity");
    setQuantityEditIndex(index);
    setQuantityEditEnabled(true);
    setQuantityFocus(true);
  };

  const handleQuantityChange = (item, e) => {
    let value = parseFloat(e.target.value);
    if (Number.isNaN(value)) {
      item.Quantity = 0;
    } else {
      item.Quantity = value;
    }
    updateLineTotal(item);
    updateItem(item);
  };

  const handleInputChange = (key, item, newVal) => {
    if (key === 'Description') {
      item.Description = newVal
      updateItem(item);
    } else {
      item[key] = parseFloat(newVal)
      updateLineTotal(item)
      updateItem(item)
    }
    /*let value = parseFloat(e.target.value);
    if (Number.isNaN(value)) {
      item.Quantity = 0;
    } else {
      item.Quantity = value;
    }
    updateLineTotal(item);
    updateItem(item);*/
  };

  const handleQuantityChangeSC = (item, e) => {
    let value = parseFloat(e.value);
    if (Number.isNaN(value)) {
      item.Quantity = 0;
    } else {
      item.Quantity = value;
    }
    updateLineTotal(item);
    updateItem(item);
  };

  const quantityBlurHandler = (item) => {
    if (item && (item.Quantity === 0 || isNaN(item.Quantity))) {
      item.Quantity = 1;
      updateLineTotal(item);
      updateItem(item);
    }
    resetEdits();
  };

  // PRICE

  const [priceEditEnabled, setPriceEditEnabled] = useState(false);
  const [priceEditIndex, setPriceEditIndex] = useState(null);
  const [priceFocus, setPriceFocus] = useState(false);

  const togglePriceEdit = (index) => {
    if (accessStatus === Enums.AccessStatus.LockedWithAccess || accessStatus === Enums.AccessStatus.LockedWithOutAccess) {
      return;
    }

    resetEdits("Price");
    setPriceEditIndex(index);
    setPriceEditEnabled(true);
    setPriceFocus(true);
  };

  const handleUnitPriceExclusiveChange = (item, e) => {
    let value = parseFloat(e.target.value);
    if (Number.isNaN(value)) {
      item.UnitPriceExclusive = 0;
    } else {
      item.UnitPriceExclusive = value;
    }
    updateLineTotal(item);
    updateItem(item);
  };

  const handleUnitPriceExclusiveChangeSC = (item, e) => {
    let value = parseFloat(e.value);
    if (Number.isNaN(value)) {
      item.UnitPriceExclusive = 0;
    } else {
      item.UnitPriceExclusive = value;
    }
    updateLineTotal(item);
    updateItem(item);
  };

  // DISCOUNT

  const [discountEditEnabled, setDiscountEditEnabled] = useState(false);
  const [discountEditIndex, setDiscountEditIndex] = useState(null);
  const [discountFocus, setDiscountFocus] = useState(false);

  const toggleDiscountEdit = (index) => {
    if (accessStatus === Enums.AccessStatus.LockedWithAccess || accessStatus === Enums.AccessStatus.LockedWithOutAccess) {
      return;
    }

    resetEdits("Discount");
    setDiscountEditIndex(index);
    setDiscountEditEnabled(true);
    setDiscountFocus(true);
  };

  const handleLineDiscountPercentageChange = (item, e) => {
    let value = parseFloat(e.target.value);
    if (Number.isNaN(value)) {
      item.LineDiscountPercentage = 0;
    } else if (value > 100) {
      item.LineDiscountPercentage = 100;
    }
    else {
      item.LineDiscountPercentage = value;
    }
    updateLineTotal(item);
    updateItem(item);
  };

  const handleLineDiscountPercentageChangeSC = (item, e) => {
    let value = parseFloat(e.value);
    if (Number.isNaN(value)) {
      item.LineDiscountPercentage = 0;
    } else if (value > 100) {
      item.LineDiscountPercentage = 100;
    }
    else {
      item.LineDiscountPercentage = value;
    }
    updateLineTotal(item);
    updateItem(item);
  };

  // TAX RATE

  const taxRates = Enums.getEnumItems(Enums.QuoteTaxRate);
  const [taxRateEditEnabled, setTaxRateEditEnabled] = useState(false);
  const [taxRateEditIndex, setTaxRateEditIndex] = useState(null);
  const [taxRateFocus, setTaxRateFocus] = useState(false);

  // const toggleTaxRateRef = useRef(true);

  const toggleTaxRateEdit = (index) => {
    if (accessStatus === Enums.AccessStatus.LockedWithAccess || accessStatus === Enums.AccessStatus.LockedWithOutAccess) {
      return;
    }

    // if (!toggleTaxRateRef.current) {
    //   toggleTaxRateRef.current = true;
    //   return;
    // }

    resetEdits("TaxRate");
    setTaxRateEditIndex(index);
    setTaxRateEditEnabled(true);
    setTaxRateFocus(true);
  };

  const taxRateOnBlurHandler = () => {
    // if (toggleTaxRateRef.current) {
    //   return;
    // }
    resetEdits();
  };

  const setTaxRate = (item, value) => {
    if (value == "No VAT") {
      item.TaxPercentage = 0;
    } else {
      item.TaxPercentage = companyTaxPercentage ? companyTaxPercentage : item.TaxPercentage;
    }

    updateLineTotal(item);
    updateItem(item);

    setTaxRateEditEnabled(false);
    setTaxRateEditIndex(null);
    setTaxRateFocus(false);

    // toggleTaxRateRef.current = false;
  };

  const resetEdits = (setting = null) => {

    if (!setting || setting !== "Description") {
      setDescriptionEditEnabled(false);
      setDescriptionEditIndex(null);
    }

    if (!setting || setting !== "Quantity") {
      setQuantityEditEnabled(false);
      setQuantityEditIndex(null);
    }

    if (!setting || setting !== "Price") {
      setPriceEditEnabled(false);
      setPriceEditIndex(null);
    }

    if (!setting || setting !== "Discount") {
      setDiscountEditEnabled(false);
      setDiscountEditIndex(null);
    }

    if (!setting || setting !== "TaxRate") {
      setTaxRateEditEnabled(false);
      setTaxRateEditIndex(null);
    }
  };

  // RE-ORDER

  // const [disableReorder, setReorderToDisabled] = useState(true);

  // const onReorder = (event, previousIndex, nextIndex, fromId, toId) => {

  //   if (purchaseOrder.PurchaseOrderStatus != Enums.PurchaseOrderStatus.Draft) {
  //     return;
  //   }

  //   let tempItems = [...purchaseOrderItems];
  //   let item = tempItems.splice(previousIndex, 1);
  //   tempItems.splice(nextIndex, 0, item[0]);

  //   tempItems.map((x, i) => {
  //     x.LineNumber = i;
  //   });

  //   reorder(tempItems, previousIndex, nextIndex)

  //   updatePurchaseOrderItems(tempItems);
  // };

  // LINE NUMBER

  const [currentLineNumber, setCurrentLineNumber] = useState(0);

  useEffect(() => {
    getCurrentLineNumber();
  }, []);

  const getCurrentLineNumber = () => {
    if (purchaseOrderItems.length > 0) {
      let lineNumbers = purchaseOrderItems.map((item, i) => {
        return parseInt(item.LineNumber);
      });
      setCurrentLineNumber(Math.max(...lineNumbers) + 1);
    } else {
      setCurrentLineNumber(0);
    }
  };

  const [jobInventory, setJobInventory] = useState([]);

  const getJobInventory = async () => {
    if (module == Enums.Module.JobCard && itemID) {
      const job = await Fetch.get({
        url: '/Job/' + itemID,
        caller: "components/purchase/purchase-details.js:getJobInventory()"
      });
      setJobInventory(job.JobInventory.filter(x => x.StockItemStatus == Enums.StockItemStatus.ItemUsed));
    } else {
      setJobInventory([]);
    }
  };

  const oldItemID = useRef(itemID);

  useEffect(() => {
    let changed = oldItemID.current !== itemID;
    oldItemID.current = itemID;
    if (changed) {
      getJobInventory();
    }
  }, [itemID]);

  const [purchaseOrderItemButtons, setPurchaseOrderItemButtons] = useState([]);

  const buildUpPurchaseOrderItemButtons = async () => {
    let buttons = [];
    buttons.push({ text: 'Add Materials', link: 'AddItem' });
    if (jobInventory && jobInventory.length > 0) {
      buttons.push({ text: 'Add Job Materials', link: 'AddItemUsed' });
    }
    buttons.push({ text: 'Add Bundle', link: 'AddBundle' });
    buttons.push({ text: 'Add Description', link: 'AddDescription' });
    setPurchaseOrderItemButtons(buttons);
  };

  const purchaseOrderItemButtonClick = (link) => {
    switch (link) {
      case 'AddItem':
        setItemTab('Materials');
        break;
      case 'AddDescription':
        setItemTab('Description');
        break;
      case 'AddItemUsed':
        setItemTab('Job Materials');
        break;
      case 'AddBundle':
        setItemTab('Bundle');
        break;
    }
    toggleManageItemModal(null, -1);
  };

  useEffect(() => {
    buildUpPurchaseOrderItemButtons();
  }, [jobInventory]);

  const initialClickPurchaseOrderItemButtonClickRef = useRef(true)
  useEffect(() => {
    if (typeof window === "undefined" || !isNewItem) return;
    if (window.location.search.toLowerCase().indexOf(`module=${Enums.Module.JobCard}`) < 0) return; // when copying a quote to an invoice, if the quote is linked to a job, it relinks invoice to job so it gets confused without this

    if (module === Enums.Module.JobCard && initialClickPurchaseOrderItemButtonClickRef.current && Array.isArray(jobInventory) && jobInventory.filter(x => x.QuantityRequested > x.QuantityOnPurchaseOrder).length > 0) {
      purchaseOrderItemButtonClick("AddItemUsed");
      initialClickPurchaseOrderItemButtonClickRef.current = false;
    }
  }, [isNewItem, jobInventory])

  // SAVE 

  const saveItem = (item, addAndContinue = false) => {
    let isArray = Array.isArray(item);
    if (isArray && item.length > 0) {

      if (isNewItem) {

        // the way bundles returns results, the item array is actually the full list of items not just new ones
        let currLineNum = 1;
        item.forEach(it => {
          it.LineNumber = currLineNum;
          currLineNum++;
        });

        setCurrentLineNumber(currLineNum);
      }

      updatePurchaseOrderItems(Helper.sortObjectArray(item, 'LineNumber'));

    } else if (!isArray && item) {
      if (isNewItem) {
        item.LineNumber = currentLineNumber;
        purchaseOrderItems.push(item);
        setCurrentLineNumber(currentLineNumber + 1);
      } else {
        let temp = {
          ...purchaseOrderItems[itemEditIndex],
          Description: item.Description,
          InventoryID: item.InventoryID,
          InventoryCode: item.InventoryCode,
          InventoryDescription: item.Description,
          InventoryActive: item.InventoryActive,
          LineDiscountPercentage: item.LineDiscountPercentage,
          LineTotalExclusive: item.LineTotalExclusive,
          Quantity: item.Quantity,
          UnitPriceExclusive: item.UnitPriceExclusive,
          TaxPercentage: item.TaxPercentage,
        };
        purchaseOrderItems[itemEditIndex] = temp;
      }

      updatePurchaseOrderItems(Helper.sortObjectArray(purchaseOrderItems, 'LineNumber'));
    }

    // Only close the modal if we're not using "Add and Continue"
    if (!addAndContinue) {
      setItemEditIndex(-1);
      setItemToEdit(null);
      setShowManageItemModal(false);
    }
  };

  const saveItems = (savedItems, addAndContinue = false) => {

    let cln = currentLineNumber;
    for (let index in savedItems) {
      savedItems[index].LineNumber = cln;
      cln++;
      purchaseOrderItems.push(savedItems[index]);

      updatePurchaseOrderItems(Helper.sortObjectArray(purchaseOrderItems, 'LineNumber'));
    }
    setCurrentLineNumber(cln);

    // Only close the modal if we're not using "Add and Continue"
    if (!addAndContinue) {
      setItemEditIndex(-1);
      setItemToEdit(null);
      setShowManageItemModal(false);
    }
  };

  const [showPreferences, setShowPreferences] = useState(false)
  const [tableColumnMapping, setTableColumnMapping] = useState()
  const [userColumnConfig, setUserColumnConfig] = useState()

  return (
    <>
      <PurchasesSectionTable
        purchaseOrder={purchaseOrder}
        itemId={itemID}
        onDataUpdate={(items) => updatePurchaseOrderItems(items)}
        purchaseOrderItems={purchaseOrderItems}
        integration={integration}
        onItemClicked={toggleManageItemModal}
        // handleInputChange={handleInputChange}
        tableActionStates={{}}
        // permissionToUpdateItems
        // permissionToUpdateTaxRate
        companyTaxPercentage={companyTaxPercentage}
        addOptions={purchaseOrderItemButtons}
        onAddAction={purchaseOrderItemButtonClick}
        onColumnMappingLoaded={setTableColumnMapping}
        userColumnConfig={userColumnConfig}
        customChildren={
          <Tooltip
            events={{ hover: true, focus: true, touch: true }}
            label={'My preferences'}
            openDelay={400}
            color={'scBlue'}
        >
          <ActionIcon
              variant={'subtle'}
              size={'sm'}
              onClick={() => setShowPreferences(true)}
          >
            <IconDotsVertical />
          </ActionIcon>
        </Tooltip>
        }
      />

      {showManageItemModal ?
        <ManagePurchaseOrderItem isNew={isNewItem} tab={itemTab} jobInventory={jobInventory} purchaseOrderItem={itemToEdit} savePurchaseOrderItem={saveItem} savePurchaseOrderItems={saveItems}
          companyTaxPercentage={companyTaxPercentage} accessStatus={accessStatus} purchaseOrder={purchaseOrder} purchaseOrderItems={purchaseOrderItems}
                                 userColumnConfig={userColumnConfig}
        />
        : ''
      }

      {tableColumnMapping && 
        <PurchasePreferencesDrawer
          mapping={tableColumnMapping}
          open={showPreferences}
          onClose={() => setShowPreferences(false)}
          onUserColumnConfigLoaded={setUserColumnConfig}
        />
      }
    </>
  );
}

export default PurchaseOrderDetails;
