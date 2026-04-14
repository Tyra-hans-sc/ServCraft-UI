import React, { useState, useRef, useEffect, useMemo } from 'react';
import * as Enums from '../../utils/enums';
import Fetch from '../../utils/Fetch';
import AssetService from '../../services/asset/asset-service';
import InvoiceSectionTable from "@/PageComponents/SectionTable/Section Component Tables/InvoiceSectionTable";
import ManageInvoiceItemSections from "@/components/modals/invoice/manage-invoice-item-sections";
import { Space } from "@mantine/core";
import warehouseService from '@/services/warehouse/warehouse-service';
import { Warehouse } from '@/interfaces/api/models';

function InvoiceDetails({ itemID, module, customerID, invoice, items, updateItems, companyTaxPercentage, integration, error, accessStatus, invoiceIsNew, customChildren, onColumnMappingLoaded, userColumnConfig, ...props }) {

  // below this is legacy

  const [showManageItemModal, setShowManageItemModal] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<any>(null);
  const [isNewItem, setIsNewItem] = useState(true);

  const [itemTab, setItemTab] = useState('Inventory Item');

  const [linkedJob, setLinkedJob] = useState<any>(null);
  const [warehouse, setWarehouse] = useState<Warehouse | undefined>();



  useEffect(() => {
    if (!!items) {
      setDisplayedDescriptions()
    }
  }, [items]);

  const setDisplayedDescriptions = () => {
    const displayedDescriptions = {};
    items.sort((a, b) => a.LineNumber - b.LineNumber).forEach(
      (x, i) => displayedDescriptions[i] = x.Description
    )
  }

  const [hasAssets, setHasAssets] = useState(false);

  const checkForAssets = async () => {
    let result = await AssetService.checkForAssets(module, itemID, customerID);
    setHasAssets(result);
    return result;
  };

  const [invoiceItemButtons, setInvoiceItemButtons] = useState<any[]>([]);
  const buildUpInvoiceItemButtons = async () => {
    let buttons: any[] = [];
    buttons.push({ text: 'Add Material / Service', link: 'AddItem' });
    if (jobInventory && jobInventory.length > 0) {
      buttons.push({ text: 'Add Job Material / Service', link: 'AddItemUsed' });
    }
    buttons.push({ text: 'Add Bundle', link: 'AddBundle'/*, newOption: true*/ });
    let hasAssets = await checkForAssets();
    if (hasAssets) {
      buttons.push({ text: 'Add Asset Description', link: 'AddAsset' });
    }
    buttons.push({ text: 'Add Description', link: 'AddDescription' });
    setInvoiceItemButtons(buttons);
  };

  const [jobInventory, setJobInventory] = useState<any[]>([]);

  const getJobInventory = async () => {
    if (module == Enums.Module.JobCard && itemID) {
      const job = await Fetch.get({
        url: '/Job/' + itemID,
        caller: "components/invoice/invoice-details.js:getJobInventory()"
      } as any);
      setLinkedJob(job);
      setJobInventory(job.JobInventory.filter(x => x.StockItemStatus === Enums.StockItemStatus.ItemUsed));
    } else {
      setJobInventory([]);
    }
  };

  const getWarehouseForStore = async (storeID: string) => {
    let warehouses = await warehouseService.getWarehouses(1000, undefined, undefined, Enums.WarehouseType.Warehouse);
    return warehouses.Results.find(x => x.StoreID === storeID);
  }

  const getJobWarehouse = async () => {
    if (!linkedJob) return;

    if (linkedJob.Vans && linkedJob.Vans.length > 0) {
      setWarehouse(linkedJob.Vans[0]);
    }
    else {
      let _warehouse = await getWarehouseForStore(linkedJob.StoreID);
      setWarehouse(_warehouse);
    }
  }

  useEffect(() => {
    getJobWarehouse();
  }, [linkedJob]);

  useEffect(() => {
    if (module !== Enums.Module.JobCard) {
      getWarehouseForStore(invoice.StoreID).then(_warehouse => {
        setWarehouse(_warehouse);
      });
    }
  }, [invoice.StoreID, module]);

  const oldItemID = useRef(itemID);

  useEffect(() => {
    let changed = oldItemID.current !== itemID;
    oldItemID.current = itemID;
    if (changed || jobInventory.length === 0) {
      getJobInventory();
    }
  }, [itemID]);

  const [addToTableGroupItem, setAddToTableGroupItem] = useState(null)
  const invoiceItemButtonClick = (link, group = null) => {
    setAddToTableGroupItem(group)

    switch (link) {
      case 'AddItem':
        setItemTab('Material / Service');
        break;
      case 'AddBundle':
        setItemTab('Bundle');
        break;
      case 'AddDescription':
        setItemTab('Description');
        break;
      case 'AddAsset':
        setItemTab('Asset Description');
        break;
      case 'AddItemUsed':
        setItemTab('Job Material / Service');
        break;
      default:
        break;
    }
    toggleManageInvoiceItemModal(null, -1);
  };


  const toggleManageInvoiceItemModal = (item, index) => {
    if (accessStatus === Enums.AccessStatus.LockedWithAccess
      || accessStatus === Enums.AccessStatus.LockedWithOutAccess
      || invoice.InvoiceStatus != Enums.InvoiceStatus.Draft) {
      return;
    }

    // If item is null, we're opening the modal to add a new item
    // If item is provided, we're editing an existing item
    // In both cases, we want to show the modal
    if (item === null || !!item) {
      setShowManageItemModal(true);
      setItemToEdit(item);
      setIsNewItem(item === null);
    } else {
      // This case is for explicitly closing the modal
      setShowManageItemModal(false);
      setItemToEdit(null);
    }
  };

  useEffect(() => {
    buildUpInvoiceItemButtons();
  }, [jobInventory]);

  const jobInventoryToAdd = useMemo(() => {
    let jobInventoryTemp = [...jobInventory.map(x => ({ ...x }))];

    let itemsToCheck = [...items.map(x => ({ ...x }))].filter(x => /*!!x.WarehouseID &&*/ !!x.InventoryID && x.IsNew === true);

    // if invoice is in draft state, count the local invoice items as "invoiced" for the job materials to aid in not duplicating lines
    if (invoice.InvoiceStatus === Enums.InvoiceStatus.Draft && itemsToCheck.length > 0) {
      itemsToCheck.forEach(item => {
        let matchIdx = jobInventoryTemp.findIndex(x => x.WarehouseID === item.WarehouseID && x.InventoryID === item.InventoryID && (x.QuantityRequested - x.QuantityInvoiced > 0));
        let quantity = item.Quantity;
        while (matchIdx > -1 && quantity > 0) {
          let jobInv = jobInventoryTemp[matchIdx];
          let diff = jobInv.QuantityRequested - jobInv.QuantityInvoiced;
          if (diff > 0) {

            if (diff > quantity) {
              jobInv.QuantityInvoiced += quantity;
              quantity = 0;
            }
            else if (diff === quantity) {
              jobInv.QuantityInvoiced += quantity;
              //jobInventoryTemp.splice(matchIdx, 1);
              quantity = 0;
            }
            else if (diff < quantity) {
              jobInv.QuantityInvoiced += diff;
              quantity -= diff;
              //jobInventoryTemp.splice(matchIdx, 1);
            }
          }
          else {
            //jobInventoryTemp.splice(matchIdx, 1);
          }

          matchIdx = jobInventoryTemp.findIndex(x => x.WarehouseID === item.WarehouseID && x.InventoryID === item.InventoryID && (x.QuantityRequested - x.QuantityInvoiced > 0));
        }
      });
    }

    return jobInventoryTemp;
  }, [jobInventory, items, invoice]);

  const initialClickInvoiceItemButtonClickRef = useRef(true)
  useEffect(() => {
    /*if (typeof window === "undefined" || !invoiceIsNew) return;
    if (window.location.search.toLowerCase().indexOf(`module=${Enums.Module.JobCard}`) < 0) return; // when copying a quote to an invoice, if the quote is linked to a job, it relinks invoice to job so it gets confused without this

    if (module === Enums.Module.JobCard && initialClickInvoiceItemButtonClickRef.current && Array.isArray(jobInventoryToAdd) && jobInventoryToAdd.filter(x => x.QuantityRequested > x.QuantityInvoiced).length > 0) {
      invoiceItemButtonClick("AddItemUsed");
      initialClickInvoiceItemButtonClickRef.current = false;
    }*/

    if (invoiceIsNew && (items?.length ?? 0) === 0) {
      if (module === Enums.Module.JobCard && initialClickInvoiceItemButtonClickRef.current && Array.isArray(jobInventoryToAdd) && jobInventoryToAdd.filter(x => x.QuantityRequested > x.QuantityInvoiced).length > 0) {
        invoiceItemButtonClick("AddItemUsed");
        initialClickInvoiceItemButtonClickRef.current = false;
      }
    }


  }, [invoiceIsNew, jobInventoryToAdd])


  const saveItem = (item, addAndContinue = false) => {
    if (item) {
      const newItems = [
        ...items,
        ...(isNewItem ? [item] : []),
      ].map((x, i) => ({
        ...x,
        ...(!isNewItem && x.ID === itemToEdit?.ID ? item : {}),
        InventorySectionID: x.InventorySectionID,
        InventorySectionName: x.InventorySectionName,
        LineNumber: i + 1
      }))
      updateItems(newItems);
    }
    /*if (isNewItem) {
      item.LineNumber = currentLineNumber;
      items.push(item);
      setCurrentLineNumber(currentLineNumber + 1);
      setDisplayedDescriptions()
    } else {
      let temp = {
        ...items[itemEditIndex],
        Description: item.Description,
        InventoryCode: item.InventoryCode,
        InventoryDescription: item.Description,
        InventoryActive: item.InventoryActive,
        InventoryID: item.InventoryID,
        LineDiscountPercentage: item.LineDiscountPercentage,
        LineTotalExclusive: item.LineTotalExclusive,
        Quantity: item.Quantity,
        UnitPriceExclusive: item.UnitPriceExclusive,
        TaxPercentage: item.TaxPercentage,
      };
      items[itemEditIndex] = temp;
      setDisplayedDescriptions(
          // x => ({...x, [itemEditIndex]: item.Description})
      )
    }

    sortItems(items);
    updateItems(items);
  }*/

    // Only close the modal if we're not using "Add and Continue"
    if (!addAndContinue) {
      setItemToEdit(null);
      setShowManageItemModal(false);
    }
  }

  const [defaultSectionPdfSettings, setDefaultSectionPdfSettings] = useState({ HideLineItems: false, DisplaySubtotal: false })

  return (
    <>
      <Space h={10} />

      <InvoiceSectionTable
        descriptionColumnWidth={props.descriptionColumnWidth}
        invoice={invoice}
        invoiceItems={items}
        itemId={invoice.ID}
        module={Enums.Module.Invoice}
        onDataUpdate={updateItems}
        addOptions={invoiceItemButtons}
        onAddAction={invoiceItemButtonClick}
        onAddToSectionAction={invoiceItemButtonClick}
        integration={integration}
        companyTaxPercentage={companyTaxPercentage}
        onItemClicked={toggleManageInvoiceItemModal}
        onPredictedDefaultSectionPdfSettingsChanged={setDefaultSectionPdfSettings}
        customChildren={customChildren}
        onColumnMappingLoaded={onColumnMappingLoaded}
        userColumnConfig={userColumnConfig}
      />


      {
        showManageItemModal &&
        <ManageInvoiceItemSections isNew={isNewItem} tab={itemTab} invoice={invoice} invoiceItems={items} invoiceItem={itemToEdit} saveInvoiceItem={saveItem}
          itemID={itemID} module={module} integration={integration} jobInventory={jobInventoryToAdd} hasAssets={hasAssets} customerID={customerID}
          companyTaxPercentage={companyTaxPercentage} accessStatus={accessStatus} addToTableGroupItem={addToTableGroupItem}
          updateItems={(items, addAndContinue = false) => {
            updateItems(items);
            // Only close the modal if we're not using "Add and Continue"
            if (!addAndContinue) {
              setItemToEdit(null);
              setShowManageItemModal(false);
            }
          }}
          defaultSectionPdfSettings={defaultSectionPdfSettings}
          userColumnConfig={userColumnConfig}
          warehouse={warehouse}
          {...{} as any}
        />
      }


    </>
  );
}

export default InvoiceDetails;
