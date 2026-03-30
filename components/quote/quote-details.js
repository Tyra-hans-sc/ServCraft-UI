import React, { useState, useRef, useEffect, useContext } from 'react';
import { colors, layout } from '../../theme';
import Helper from '../../utils/helper';
import ButtonDropdown from '../button-dropdown';
import ManageQuoteItem from '../modals/quote/manage-quote-item';
import Reorder, { reorder } from 'react-reorder';
import * as Enums from '../../utils/enums';
import Fetch from '../../utils/Fetch';
import ToastContext from '../../utils/toast-context';
import AssetService from '../../services/asset/asset-service';
import SCInlineInput from '../sc-controls/form-controls/sc-inline-input';
import SCInlineTextArea from '../sc-controls/form-controls/sc-inline-textarea';
import SCInlineDropDownList from '../sc-controls/form-controls/sc-inline-dropdownlist';

function QuoteDetails(props) {

  const quote = props.quote;
  const quoteItems = props.quoteItems;
  const companyTaxPercentage = props.companyTaxPercentage;
  const integration = props.integration;

  const [quoteItemToEdit, setQuoteItemToEdit] = useState(null);
  const [quoteItemEditIndex, setQuoteItemEditIndex] = useState(-1);
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

  const [quoteItemsDisplayedDescriptions, setQuoteItemDisplayedDescriptions] = useState({});

  useEffect(() => {
    if (!!quoteItems) {
      setDisplayedDescriptions()
    }
  }, [quoteItems]);

  const setDisplayedDescriptions = () => {
    const displayedDescriptions = {};
    quoteItems.sort((a, b) => (a.LineNumber - b.LineNumber)).forEach(
        (x, i) => displayedDescriptions[i] = x.Description
    );
    setQuoteItemDisplayedDescriptions(displayedDescriptions)
  }

  const buildUpQuoteItemButtons = async () => {
    let buttons = [];
    buttons.push({ text: 'Add Materials', link: 'AddItem' });
    if (jobInventory && jobInventory.length > 0) {
      buttons.push({ text: 'Add Job Materials', link: 'AddItemUsed' });
    }
    let hasAssets = await checkForAssets();
    if (hasAssets) {
      buttons.push({ text: 'Add Asset', link: 'AddAsset' });
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

  const quoteItemButtonClick = (link) => {
    switch (link) {
      case 'AddItem':
        setQuoteItemTab('Materials');
        break;
      case 'AddDescription':
        setQuoteItemTab('Description');
        break;
      case 'AddAsset':
        setQuoteItemTab('Assets');
        break;
      case 'AddItemUsed':
        setQuoteItemTab('Job Materials');
        break;
    }
    toggleManageQuoteItemModal(null, -1);
  };

  const [currentLineNumber, setCurrentLineNumber] = useState(0);

  useEffect(() => {
    getCurrentLineNumber();
  }, []);

  const saveQuoteItem = (item, addAndContinue = false) => {
    if (item) {
      if (isNewQuoteItem) {
        item.LineNumber = currentLineNumber;
        props.quoteItems.push(item);
        setCurrentLineNumber(currentLineNumber + 1);
        setDisplayedDescriptions();
      } else {
        let temp = {
          ...props.quoteItems[quoteItemEditIndex],
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
        props.quoteItems[quoteItemEditIndex] = temp;
        setQuoteItemDisplayedDescriptions(val => ({
          ...val,
          [quoteItemEditIndex]: item.Description
        }));
      }

      sortQuoteItems(quoteItems);
      props.updateQuoteItems(quoteItems);
    }

    // Only close the modal if we're not using "Add and Continue"
    if (!addAndContinue) {
      setQuoteItemEditIndex(-1);
      setQuoteItemToEdit(null);
      setShowQuoteItemModal(false);
    }
  };

  const saveQuoteItems = (items, addAndContinue = false) => {

    let cln = currentLineNumber;
    for (let index in items) {
      items[index].LineNumber = cln;
      cln++;
      props.quoteItems.push(items[index]);

      sortQuoteItems(quoteItems);
      props.updateQuoteItems(quoteItems);
    }
    setCurrentLineNumber(cln);

    // Only close the modal if we're not using "Add and Continue"
    if (!addAndContinue) {
      setQuoteItemEditIndex(-1);
      setQuoteItemToEdit(null);
      setShowQuoteItemModal(false);
    }
  };

  const updateLineTotal = (item) => {
    if (item.Quantity > 0) {

      let subTotal = item.Quantity * item.UnitPriceExclusive;
      let discount = subTotal * (item.LineDiscountPercentage / 100);
      let totalExclVat = subTotal - discount;
      item.LineTotalExclusive = parseFloat(totalExclVat.toFixed(2));
    } else {
      item.LineTotalExclusive = 0;
    }
  };

  const handleDescriptionChange = (item, e) => {
    item.Description = e.target.value;
    item.InventoryDescription = e.target.value;
    updateQuoteItem(item);
  };

  const handleDescriptionChangeSC = (item, e) => {
    const index = quoteItems.indexOf(item)
    if (index > -1) {
      setQuoteItemDisplayedDescriptions(prevState => ({
        ...prevState,
        [index]: e.value
      }));
    }
    item.Description = e.value;
    item.InventoryDescription = e.value;
    updateQuoteItem(item);
  };

  const handleQuantityChange = (item, e) => {
    let value = parseFloat(e.target.value);
    if (Number.isNaN(value)) {
      item.Quantity = 0;
    } else {
      item.Quantity = value;
    }
    updateLineTotal(item);
    updateQuoteItem(item);
  };

  const handleQuantityChangeSC = (item, e) => {
    let value = parseFloat(e.value);
    if (Number.isNaN(value)) {
      item.Quantity = 0;
    } else {
      item.Quantity = value;
    }
    updateLineTotal(item);
    updateQuoteItem(item);
  };

  const handleUnitPriceExclusiveChange = (item, e) => {
    let value = parseFloat(e.target.value);
    if (Number.isNaN(value)) {
      item.UnitPriceExclusive = 0;
    } else {
      item.UnitPriceExclusive = value;
    }
    updateLineTotal(item);
    updateQuoteItem(item);
  };

  const handleUnitPriceExclusiveChangeSC = (item, e) => {
    let value = parseFloat(e.value);
    if (Number.isNaN(value)) {
      item.UnitPriceExclusive = 0;
    } else {
      item.UnitPriceExclusive = value;
    }
    updateLineTotal(item);
    updateQuoteItem(item);
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
    updateQuoteItem(item);
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
    updateQuoteItem(item);
  };

  const updateQuoteItem = (item) => {
    let updatedList = quoteItems;
    let index = updatedList.indexOf(item);
    updatedList[index] = item;
    props.updateQuoteItems(updatedList);
  };

  const removeQuoteItem = (item) => {
    let temp = quoteItems;
    let indexToRemove = temp.indexOf(item);
    temp.splice(indexToRemove, 1);
    refreshItemDescriptions(temp)
    props.updateQuoteItems(temp);
  };

  const refreshItemDescriptions = (newQuoteItems) => {
    setQuoteItemDisplayedDescriptions(
        newQuoteItems.reduce((a, b, i) => (
            {
              ...a,
              [i]: b.InventoryDescription
            }
        ), {})
    )
  }

  const toggleManageQuoteItemModal = (item, index) => {
    if (props.accessStatus === Enums.AccessStatus.LockedWithAccess
      || props.accessStatus === Enums.AccessStatus.LockedWithOutAccess
      || quote.QuoteStatus != Enums.QuoteStatus.Draft) {
      return;
    }

    setShowQuoteItemModal(!showQuoteItemModal);
    setQuoteItemToEdit(item);
    setQuoteItemEditIndex(index);
    setIsNewQuoteItem(item === null);
  };

  const [descriptionEditEnabled, setDescriptionEditEnabled] = useState(false);
  const [descriptionEditIndex, setDescriptionEditIndex] = useState(null);
  const [descriptionFocus, setDescriptionFocus] = useState(false);

  const toggleDescriptionEdit = (index) => {
    if (props.accessStatus === Enums.AccessStatus.LockedWithAccess || props.accessStatus === Enums.AccessStatus.LockedWithOutAccess) {
      return;
    }

    resetEdits();
    setDescriptionEditIndex(index);
    setDescriptionEditEnabled(true);
    setDescriptionFocus(true);
  };

  const [quantityEditEnabled, setQuantityEditEnabled] = useState(false);
  const [quanityEditIndex, setQuantityEditIndex] = useState(null);
  const [quantityFocus, setQuantityFocus] = useState(false);

  const toggleQuantityEdit = (index) => {
    if (props.accessStatus === Enums.AccessStatus.LockedWithAccess || props.accessStatus === Enums.AccessStatus.LockedWithOutAccess) {
      return;
    }

    resetEdits();
    setQuantityEditIndex(index);
    setQuantityEditEnabled(true);
    setQuantityFocus(true);
  };

  const quantityBlurHandler = (item) => {
    if (item && (item.Quantity === 0 || isNaN(item.Quantity))) {
      item.Quantity = 1;
      updateLineTotal(item);
      updateQuoteItem(item);
    }
    resetEdits();
  };

  const [priceEditEnabled, setPriceEditEnabled] = useState(false);
  const [priceEditIndex, setPriceEditIndex] = useState(null);
  const [priceFocus, setPriceFocus] = useState(false);

  const togglePriceEdit = (index) => {
    if (props.accessStatus === Enums.AccessStatus.LockedWithAccess || props.accessStatus === Enums.AccessStatus.LockedWithOutAccess) {
      return;
    }

    resetEdits();
    setPriceEditIndex(index);
    setPriceEditEnabled(true);
    setPriceFocus(true);
  };

  const [discountEditEnabled, setDiscountEditEnabled] = useState(false);
  const [discountEditIndex, setDiscountEditIndex] = useState(null);
  const [discountFocus, setDiscountFocus] = useState(false);

  const toggleDiscountEdit = (index) => {
    if (props.accessStatus === Enums.AccessStatus.LockedWithAccess || props.accessStatus === Enums.AccessStatus.LockedWithOutAccess) {
      return;
    }

    resetEdits();
    setDiscountEditIndex(index);
    setDiscountEditEnabled(true);
    setDiscountFocus(true);
  };

  const taxRates = Enums.getEnumItems(Enums.QuoteTaxRate);
  const [taxRateEditEnabled, setTaxRateEditEnabled] = useState(false);
  const [taxRateEditIndex, setTaxRateEditIndex] = useState(null);
  const [taxRateFocus, setTaxRateFocus] = useState(false);


  const toggleTaxRateEdit = (index) => {
    if (props.accessStatus === Enums.AccessStatus.LockedWithAccess || props.accessStatus === Enums.AccessStatus.LockedWithOutAccess) {
      return;
    }


    resetEdits();
    setTaxRateEditIndex(index);
    setTaxRateEditEnabled(true);
    setTaxRateFocus(true);
  };

  const taxRateOnBlurHandler = () => {

    resetEdits();
  };

  const setTaxRate = (item, value) => {

    if (value == "No VAT") {
      item.TaxPercentage = 0;
    } else {
      item.TaxPercentage = companyTaxPercentage ? companyTaxPercentage : item.TaxPercentage;
    }

    updateLineTotal(item);
    updateQuoteItem(item);

    setTaxRateEditEnabled(false);
    setTaxRateEditIndex(null);
    setTaxRateFocus(false);

  };

  const resetEdits = () => {

    setDescriptionEditEnabled(false);
    setDescriptionEditIndex(null);

    setQuantityEditEnabled(false);
    setQuantityEditIndex(null);

    setPriceEditEnabled(false);
    setPriceEditIndex(null);

    setDiscountEditEnabled(false);
    setDiscountEditIndex(null);

    setTaxRateEditEnabled(false);
    setTaxRateEditIndex(null);
  };

  const getCurrentLineNumber = () => {
    if (quoteItems.length > 0) {
      let lineNumbers = quoteItems.map((item, i) => {
        return parseInt(item.LineNumber);
      });
      setCurrentLineNumber(Math.max(...lineNumbers) + 1);
    } else {
      setCurrentLineNumber(0);
    }
  };

  const sortQuoteItems = (items) => {
    return items.sort((a, b) => {
      if (a.LineNumber > b.LineNumber) {
        return 1;
      } else if (a.LineNumber < b.LineNumber) {
        return -1;
      } else {
        return 0;
      }
    });
  };

  const [disableReorder, setReorderToDisabled] = useState(true);

  function onReorder(event, previousIndex, nextIndex, fromId, toId) {

    if (quote.QuoteStatus != Enums.QuoteStatus.Draft) {
      return;
    }

    let tempQuoteItems = [...quoteItems];
    let item = tempQuoteItems.splice(previousIndex, 1);
    tempQuoteItems.splice(nextIndex, 0, item[0]);

    tempQuoteItems.map((q, i) => {
      q.LineNumber = i;
    });

    reorder(tempQuoteItems, previousIndex, nextIndex)

    props.updateQuoteItems(tempQuoteItems);
  }

  return (
    <div className="container">
      <div className="table-container">
        <table className={`${props.error ? 'error' : ''} table`}>
          <thead>
            <tr>
              <th className="header-item-move">
              </th>
              <th className="header-item-code">
                CODE
              </th>
              <th className="header-item-desc">
                DESCRIPTION
              </th>
              {integration ?
                <th className="header-item-status">
                  STATUS
                </th> : <></>
              }
              <th className="header-item-qty number-column">
                QUANTITY
              </th>
              <th className="header-item-price number-column">
                PRICE
              </th>
              <th className="header-item-discount number-column">
                DISCOUNT %
              </th>
              <th className="header-item-taxrate number-column">
                Tax Rate
              </th>
              <th className="header-item-amt number-column">
                AMOUNT
              </th>
              <th className="header-item-delete">
              </th>
            </tr>
          </thead>
          {props.quoteItems.length > 0 ?
            <Reorder reorderId="quote-item-list" onReorder={onReorder} lock='horizontal' component='tbody'
              placeholderClassName='reorder-placeholder' draggedClassName='reorder-dragged' disabled={disableReorder}>
              {
                props.quoteItems.map(function (item, index) {
                  return (
                    <tr key={index}>
                      <td className="body-item-move" title="Click and drag to reorder"
                        onMouseEnter={() => setReorderToDisabled(false)} onMouseLeave={() => setReorderToDisabled(true)}>
                        <img src="/icons/menu-light.svg" alt="move" />
                      </td>
                      <td className="body-item-code" title='Edit' onClick={() => toggleManageQuoteItemModal(item, index)}>
                        {item.ProductID ? item.ProductNumber : item.InventoryCode}
                      </td>
                      <td className="body-item-desc" onClick={() => toggleDescriptionEdit(index)}>
                        {descriptionEditEnabled && index == descriptionEditIndex && quote.QuoteStatus == Enums.QuoteStatus.Draft ? <>
                          {item.InventoryID ?
                            <>
                              <SCInlineInput
                                name={`description${index}`}
                                onChange={(e) => handleDescriptionChangeSC(item, e)}
                                // value={item.Description}
                                value={quoteItemsDisplayedDescriptions[index] || ''}
                                autoFocus={descriptionFocus}
                                onBlur={resetEdits}
                              />
                              {/* <InlineTextInput
                                name={`description${index}`}
                                changeHandler={(e) => handleDescriptionChange(item, e)}
                                value={item.Description}
                                blurHandler={resetEdits}
                                inputFocus={descriptionFocus}
                              /> */}
                            </> :
                            <>
                              <SCInlineTextArea
                                name={`description${index}`}
                                onChange={(e) => handleDescriptionChangeSC(item, e)}
                                value={item.Description}
                                // value={quoteItemsDisplayedDescriptions[item.ID] || ''}
                                autoFocus={descriptionFocus}
                                onBlur={resetEdits}
                              />
                              {/* <InlineTextAreaInput
                                name={`description${index}`}
                                changeHandler={(e) => handleDescriptionChange(item, e)}
                                value={item.Description}
                                blurHandler={resetEdits}
                                inputFocus={descriptionFocus}
                              /> */}
                            </>
                          }

                        </> :
                          <div dangerouslySetInnerHTML={{ __html: item.Description ? item.Description.replace(/\n/g, "<br/>") : "" }}>
                          </div>
                        }
                      </td>

                      {integration ?
                        item.QuoteItemType == Enums.QuoteItemType.Inventory ?
                          <td className={`body-item-status ${item.Integrated ? 'status-synced' : 'status-error'}`}>
                            {item.Integrated ? 'Synced' : item.IntegrationMessage ? 'Error' : 'Not Synced'}
                          </td> :
                          <td className="body-item-status">

                          </td>
                        : <></>
                      }

                      <td className="body-item-qty number-column" onClick={() => item.QuoteItemType == Enums.QuoteItemType.Inventory ? toggleQuantityEdit(index) : {}}>
                        {item.QuoteItemType == Enums.QuoteItemType.Inventory ?
                          <>
                            {quantityEditEnabled && quanityEditIndex == index && quote.QuoteStatus == Enums.QuoteStatus.Draft ?
                              <>
                                <SCInlineInput
                                  name={`quantity${index}`}
                                  type='number'
                                  onChange={(e) => handleQuantityChangeSC(item, e)}
                                  value={item.Quantity}
                                  textAlign="right"
                                  width="118px"
                                  onBlur={() => quantityBlurHandler(item)}
                                  autoFocus={quantityFocus}
                                  min={0}
                                />
                                {/* <InlineTextInput
                                  name={`quantity${index}`}
                                  changeHandler={(e) => handleQuantityChange(item, e)}
                                  value={item.Quantity}
                                  type='number'
                                  textAlign='right'
                                  width='118px'
                                  blurHandler={() => quantityBlurHandler(item)}
                                  inputFocus={quantityFocus}
                                  signed={false}
                                /> */}
                              </>
                              :
                              <>{item.Quantity}</>
                            }
                          </>
                          :
                          ''
                        }
                      </td>

                      <td className="body-item-price number-column" onClick={() => item.QuoteItemType == Enums.QuoteItemType.Inventory ? togglePriceEdit(index) : {}}>
                        {item.QuoteItemType == Enums.QuoteItemType.Inventory ?
                          <>
                            {priceEditEnabled && priceEditIndex == index && quote.QuoteStatus == Enums.QuoteStatus.Draft ?
                              <>
                                <SCInlineInput
                                  name={`unitPriceExclusive${index}`}
                                  onChange={(e) => handleUnitPriceExclusiveChangeSC(item, e)}
                                  value={item.UnitPriceExclusive}
                                  type='number'
                                  textAlign='right'
                                  width='118px'
                                  onBlur={resetEdits}
                                  autoFocus={priceFocus}
                                />
                                {/* <InlineTextInput
                                  name={`unitPriceExclusive${index}`}
                                  changeHandler={(e) => handleUnitPriceExclusiveChange(item, e)}
                                  value={item.UnitPriceExclusive}
                                  type='number'
                                  textAlign='right'
                                  width='118px'
                                  blurHandler={resetEdits}
                                  inputFocus={priceFocus}
                                /> */}
                              </>
                              :
                              <>{Helper.getCurrencyValue(item.UnitPriceExclusive)}</>
                            }
                          </>
                          :
                          ''
                        }
                      </td>

                      <td className="body-item-discount number-column" onClick={() => item.QuoteItemType == Enums.QuoteItemType.Inventory ? toggleDiscountEdit(index) : {}}>
                        {item.QuoteItemType == Enums.QuoteItemType.Inventory ?
                          <>
                            {discountEditEnabled && discountEditIndex == index && quote.QuoteStatus == Enums.QuoteStatus.Draft ?
                              <>
                                <SCInlineInput
                                  name={`lineDiscountPercentage${index}`}
                                  onChange={(e) => handleLineDiscountPercentageChangeSC(item, e)}
                                  value={item.LineDiscountPercentage}
                                  type='number'
                                  textAlign='right'
                                  width='118px'
                                  onBlur={resetEdits}
                                  autoFocus={discountFocus}
                                />
                                {/* <InlineTextInput
                                  name={`lineDiscountPercentage${index}`}
                                  changeHandler={(e) => handleLineDiscountPercentageChange(item, e)}
                                  value={item.LineDiscountPercentage}
                                  type='number'
                                  textAlign='right'
                                  width='118px'
                                  blurHandler={resetEdits}
                                  inputFocus={discountFocus}
                                /> */}
                              </>
                              :
                              <>{item.LineDiscountPercentage}</>
                            }
                          </>
                          : ''
                        }
                      </td>

                      <td className="body-item-taxrate number-column" onClick={() => item.QuoteItemType == Enums.QuoteItemType.Inventory ? toggleTaxRateEdit(index) : {}}>
                        {item.QuoteItemType == Enums.QuoteItemType.Inventory ?
                          <>
                            {taxRateEditEnabled && taxRateEditIndex == index && quote.QuoteStatus == Enums.QuoteStatus.Draft ?
                              <>
                                <SCInlineDropDownList
                                  onChange={(e) => setTaxRate(item, e)}
                                  onBlur={taxRateOnBlurHandler}
                                  options={taxRates}
                                  width='150px'
                                  name={`taxPercentage${index}`}
                                  value={item.TaxPercentage > 0 ? "Standard Rate" : "No VAT"}
                                  autoFocus={taxRateFocus}
                                  // setInputFocus={setTaxRateFocus}
                                />
                                {/* <InlineSelectInput
                                  setSelected={(e) => setTaxRate(item, e)}
                                  blurHandler={taxRateOnBlurHandler}
                                  options={taxRates}
                                  width='118px'
                                  name={`taxPercentage${index}`}
                                  value={item.TaxPercentage > 0 ? "Standard Rate" : "No VAT"}
                                  inputFocus={taxRateFocus}
                                  setInputFocus={setTaxRateFocus}
                                /> */}
                              </>
                              :
                              <>{item.TaxPercentage > 0 ? "Standard Rate" : "No VAT"}</>
                            }
                          </>
                          : ''
                        }
                      </td>

                      <td className="body-item-amt number-column">
                        {item.QuoteItemType == Enums.QuoteItemType.Description ? item.LineTotalExclusive : Helper.getCurrencyValue(item.LineTotalExclusive)}
                      </td>

                      <td className="body-item-delete" title="Delete quote item">
                        {props.accessStatus !== Enums.AccessStatus.LockedWithAccess && props.accessStatus !== Enums.AccessStatus.LockedWithOutAccess && quote.QuoteStatus == Enums.QuoteStatus.Draft ? <>
                          <img src="/icons/trash-bluegrey.svg" alt="delete" onClick={() => removeQuoteItem(item)} />
                        </> : ''}
                      </td>
                    </tr>
                  );
                })
              }
            </Reorder>
            : ''
          }
        </table>
      </div>

      {/* {props.accessStatus !== Enums.AccessStatus.LockedWithAccess && props.accessStatus !== Enums.AccessStatus.LockedWithOutAccess && quote.QuoteStatus == Enums.QuoteStatus.Draft ? <>
        <div className="row">
          <Button text="Add Item" icon="plus-circle-blue" extraClasses="hollow" onClick={() => toggleManageQuoteItemModal(null, -1)} />
        </div>
      </> : ""}
      {showManageQuoteItemModal ?
        <ManageQuoteItem isNew={isNewQuoteItem} quoteItem={quoteItemToEdit} saveQuoteItem={saveQuoteItem}
          companyTaxPercentage={companyTaxPercentage} integration={integration} accessStatus={props.accessStatus} />
        : ''
      } */}

      {props.accessStatus !== Enums.AccessStatus.LockedWithAccess && props.accessStatus !== Enums.AccessStatus.LockedWithOutAccess && quote.QuoteStatus == Enums.QuoteStatus.Draft ?
        <div className="add-item">
          <ButtonDropdown
            action={quoteItemButtonClick}
            text="Add Line"
            options={quoteItemButtons}
          />
        </div>
        : ''}

      {showQuoteItemModal ?
        <ManageQuoteItem isNew={isNewQuoteItem} tab={quoteItemTab} quoteItem={quoteItemToEdit} saveQuoteItem={saveQuoteItem}
          saveQuoteItems={saveQuoteItems} itemID={props.itemID} module={props.module} jobInventory={jobInventory} hasAssets={hasAssets}
          customerID={props.customerID} integration={integration} companyTaxPercentage={companyTaxPercentage} accessStatus={props.accessStatus} cypressInventorySelector={"data-cy-inventory-selector"} cypressQuantity={"data-cy-quantity"}
          cypress={"data-cy-price-excl-vat"}
        /> : ''
      }

      <style jsx>{`
        .container {
          width: 100%;
          display: flex;
          flex-direction: column;
        }
        .table-container {
          overflow-x: unset;
          width: 100%;
          display: flex;
          flex-direction: column;
        }
        .table {
          border-collapse: collapse;
          margin-top: 1rem;
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

        td.body-item-desc {
          padding: 0.5rem 0;
        }

        .reorder-placeholder {

        }
        .reorder-dragged {
          width: 100%;
          height: 4rem !important;
        }
        .reorder-dragged td {
          font-size: 12px;
          min-width: 6rem;
          padding-right: 1rem;
        }

        .header-container {
          background-color: ${colors.backgroundGrey};
          border-radius: ${layout.cardRadius};
          box-sizing: border-box;
          color: ${colors.darkPrimary};
          display: flex;
          flex-direction: row;
          justify-content: center;
          margin-top: 0.5rem;
          padding: 1.25rem 1rem;
          position: relative;
          width: 100%;
        }

        .header-item-move {
          width: 1%;
          min-width: 30px;
        }
        .header-item-code {
          width: 5%;
          min-width: 80px;
        }
        .header-item-desc {
          width: 50%;
        }
        .header-item-discount {
          width: 5%;
          min-width: 120px;
        }
        .header-item-taxrate {
          width: 5%;
          min-width: 120px;
        }
        .header-item-qty {
          width: 5%;
        }
        .header-item-price {
          width: 5%;
          min-width: 120px;
        }
        .header-item-amt {
          width: 5%;
          min-width: 120px;
        }
        .header-item-status {
          width: 5%;
          min-width: 120px;          
        }
        .header-item-delete {
          width: 1%;
          min-width: 30px;
        }
        .body-item-move {
          cursor: move;
        }
        .body-item-code {
          color: ${colors.bluePrimary};
          cursor: pointer;
        }
        .body-item-amt {
          text-align: right;
        }
        .body-item-status {

        }
        .status-error {
          color: ${colors.warningRed};
        }
        .status-synced {
          color: ${colors.green};
        }
        .total-container {
          margin-top: 1rem;
        }
        .total-row {
          line-height: 24px;
        }
        .grand-total {
          margin-top: 8px;
          margin-bottom: 8px;
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
        .column-fixed {
          display: flex;
          flex-direction: column;
          width: 500px;
        }
        .justify-end {
          justify-content: flex-end;
        }
        .end {
          align-items: flex-end;
        }
        .add-item {
          width: 10rem;
        }

        .error {
          border: 1px solid ${colors.warningRed};
        }
      `}</style>
    </div>
  );
}

export default QuoteDetails;
