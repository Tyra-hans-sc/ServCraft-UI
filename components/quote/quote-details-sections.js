import React, {useState, useRef, useEffect} from 'react';
import Helper from '../../utils/helper';
import ManageQuoteItem from '../modals/quote/manage-quote-item';
import * as Enums from '../../utils/enums';
import Fetch from '../../utils/Fetch';
import AssetService from '../../services/asset/asset-service';
import QuoteSectionTable from "../../PageComponents/SectionTable/Section Component Tables/QuoteSectionTable";
import {Box, Space} from "@mantine/core";
import {useLocalstorageState} from "rooks";
import ManageQuoteItemSections from "../modals/quote/manage-quote-item-sections";

function QuoteDetails(props) {

  const quote = props.quote;
  // const quoteItems = useMemo(() => props.quoteItems, [props.quoteItems])

  const companyTaxPercentage = props.companyTaxPercentage;
  const integration = props.integration;

  const [quoteItemToEdit, setQuoteItemToEdit] = useState(null);
  const [isNewQuoteItem, setIsNewQuoteItem] = useState(true);

  const [showQuoteItemModal, setShowQuoteItemModal] = useState(false);
  const [quoteItemTab, setQuoteItemTab] = useState('Inventory Item');

  const [hasAssets, setHasAssets] = useState(false);

  const checkForAssets = async () => {
    let result = await AssetService.checkForAssets(props.module, props.itemID, props.customerID);
    setHasAssets(result);
    return result;
  };

  const [quoteItemButtons, setQuoteItemButtons] = useState([]);

  const buildUpQuoteItemButtons = async () => {
    let buttons = [];
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

    setQuoteItemButtons(buttons);
  };

  const [jobInventory, setJobInventory] = useState([]);

  const getJobInventory = async () => {
    if (props.module == Enums.Module.JobCard && props.itemID) {
      const job = await Fetch.get({
        url: '/Job/' + props.itemID,
        caller: "components/quote/quote-details.js:getJobInventory()"
      });
      setJobInventory(job.JobInventory.filter(x => x.StockItemStatus == Enums.StockItemStatus.ItemUsed));
    } else {
      setJobInventory([]);
    }
  };

  const initialClickQuoteItemButtonClickRef = useRef(true)
  useEffect(() => {
    if(props.isNew) {
      if (props.module === Enums.Module.JobCard && initialClickQuoteItemButtonClickRef.current && Array.isArray(jobInventory) && jobInventory.length > 0) {
        quoteItemButtonClick("AddItemUsed");
        initialClickQuoteItemButtonClickRef.current = false;
      }
    }
    /*
    very unstable and inefficient way of extracting query parameters below - rather user router paramap
    a simple solution is seen above, as there is no need for query parameter extraction as the module is already provided from component props
    if (typeof window === "undefined" || !props.isNew) return;
    if (window.location.search.toLowerCase().indexOf(`module=${Enums.Module.JobCard}`) < 0) return; // when copying a quote to an invoice, if the quote is linked to a job, it relinks invoice to job so it gets confused without this

    if (props.module === Enums.Module.JobCard && initialClickQuoteItemButtonClickRef.current && Array.isArray(jobInventory) && jobInventory.length > 0) {
      quoteItemButtonClick("AddItemUsed");
      initialClickQuoteItemButtonClickRef.current = false;
    }
    */
  }, [props.isNew, jobInventory])

  const oldItemID = useRef(props.itemID);
  useEffect(() => {
    let changed = oldItemID.current !== props.itemID;
    oldItemID.current = props.itemID;
    if (changed || jobInventory.length === 0) {
      getJobInventory();
    }
  }, [props.itemID]);

  const oldJobInventory = useRef(jobInventory);
  useEffect(() => {
    let changed = Helper.jsonCompare(oldJobInventory.current, jobInventory);
    oldJobInventory.current = jobInventory;
    // if (changed) {
    buildUpQuoteItemButtons();
    // }
  }, [jobInventory]);

  const [addToTableGroupItem, setAddToTableGroupItem] = useState(null)

  const quoteItemButtonClick = (link, group = null) => {

    setAddToTableGroupItem(group)

    switch (link) {
      case 'AddItem':
        setQuoteItemTab('Material / Service');
        break;
      case 'AddBundle':
        setQuoteItemTab('Bundle');
        break;
      case 'AddDescription':
        setQuoteItemTab('Description');
        break;
      case 'AddAsset':
        setQuoteItemTab('Asset Description');
        break;
      case 'AddItemUsed':
        setQuoteItemTab('Job Material / Service');
        break;
      default:
        break;
    }
    // console.log('toggle modal', addToTableGroupItem, quoteItemTab, quoteItemToEdit, isNewQuoteItem)
    toggleManageQuoteItemModal(null, -1);
  };


  const saveQuoteItem = (item, addAndContinue = false) => {
    if (item) {
      const newItems = [
        ...props.quoteItems,
        ...(isNewQuoteItem ? [item] : []),
      ].map((x, i) => ({
        ...x,
        ...(!isNewQuoteItem && x.ID === quoteItemToEdit.ID ? item : {}),
        InventorySectionID: x.InventorySectionID,
        InventorySectionName: x.InventorySectionName,
        LineNumber: i + 1
      }))
      props.updateQuoteItems(newItems)
    }

    // Only close the modal if we're not using "Add and Continue"
    if (!addAndContinue) {
      setQuoteItemToEdit(null);
      setShowQuoteItemModal(false);
    }
  };

  const saveQuoteItems = (items) => {

    /*let cln = currentLineNumber;
    for (let index in items) {
      items[index].LineNumber = cln;
      cln++;
      props.quoteItems.push(items[index]);

      sortQuoteItems(quoteItems);
      props.updateQuoteItems(quoteItems);
    }
    setCurrentLineNumber(cln);

    setQuoteItemEditIndex(-1);
    setQuoteItemToEdit(null);
    setShowQuoteItemModal(false);*/
  };

  const toggleManageQuoteItemModal = (item, index) => {
    if (props.accessStatus === Enums.AccessStatus.LockedWithAccess
      || props.accessStatus === Enums.AccessStatus.LockedWithOutAccess
      || quote.QuoteStatus !== Enums.QuoteStatus.Draft) {
      return;
    }

    // If item is null, we're opening the modal to add a new item
    // If item is provided, we're editing an existing item
    // In both cases, we want to show the modal
    if (item === null || !!item) {
      setShowQuoteItemModal(true);
      setQuoteItemToEdit(item);
      setIsNewQuoteItem(item === null);
    } else {
      // This case is for explicitly closing the modal
      setShowQuoteItemModal(false);
      setQuoteItemToEdit(null);
    }
  };

  const handleQuoteItemsUpdate = (data, sections) => {
    props.updateQuoteItems(data, sections)
  }

  const [defaultSectionPdfSettings, setDefaultSectionPdfSettings] = useState({HideLineItems: false, DisplaySubtotal: false})

  return (
      <Box>
        <Space h={10} />

        <QuoteSectionTable
            descriptionColumnWidth={props.descriptionColumnWidth}
            quoteItems={props.quoteItems}
            itemId={quote.ID}
            module={props.module}
            quote={quote}
            onDataUpdate={handleQuoteItemsUpdate}
            addOptions={quoteItemButtons}
            onAddAction={quoteItemButtonClick}
            onAddToSectionAction={quoteItemButtonClick}
            integration={props.integration}
            companyTaxPercentage={companyTaxPercentage}
            onItemClicked={toggleManageQuoteItemModal}
            onPredictedDefaultSectionPdfSettingsChanged={setDefaultSectionPdfSettings}
            onColumnMappingLoaded={props.onColumnMappingLoaded}
            userColumnConfig={props.userColumnConfig}
            customChildren={props.customChildren}
        />

        {showQuoteItemModal ?
            <ManageQuoteItemSections isNew={isNewQuoteItem} tab={quoteItemTab} quoteItem={quoteItemToEdit}
                             saveQuoteItem={saveQuoteItem}
                             // saveQuoteItems={saveQuoteItems}
                             updateQuoteItems={(items, addAndContinue = false) => {
                               props.updateQuoteItems(items)
                               // Only close the modal if we're not using "Add and Continue"
                               if (!addAndContinue) {
                                 setQuoteItemToEdit(null);
                                 setShowQuoteItemModal(false);
                               }
                             }}
                             itemID={props.itemID} module={props.module}
                             jobInventory={jobInventory} hasAssets={hasAssets}
                             customerID={props.customerID} integration={integration}
                             companyTaxPercentage={companyTaxPercentage} accessStatus={props.accessStatus}
                             cypressInventorySelector={"data-cy-inventory-selector"}
                             cypressQuantity={"data-cy-quantity"}
                             cypress={"data-cy-price-excl-vat"}
                             quoteItems={props.quoteItems}
                             quote={quote}
                             addToTableGroupItem={addToTableGroupItem}
                             defaultSectionPdfSettings={defaultSectionPdfSettings}
                             userColumnConfig={props.userColumnConfig}
            /> : ''
        }

      </Box>
  );
}

export default QuoteDetails;
