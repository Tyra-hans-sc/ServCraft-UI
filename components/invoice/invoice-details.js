import React, { useState, useRef, useEffect } from 'react';
import { colors, fontSizes, layout, fontFamily, tickSvg } from '../../theme';
import InlineTextInput from '../inline-text-input';
import Helper from '../../utils/helper';
import ButtonDropdown from '../button-dropdown';
import InlineSelectInput from '../inline-select-input';
import ManageInvoiceItem from '../modals/invoice/manage-invoice-item';
import Reorder, { reorder } from 'react-reorder';
import * as Enums from '../../utils/enums';
import Fetch from '../../utils/Fetch';
import AssetService from '../../services/asset/asset-service';
import InlineTextAreaInput from '../inline-textarea-input';
import SCInlineTextArea from '../sc-controls/form-controls/sc-inline-textarea';
import SCInlineInput from '../sc-controls/form-controls/sc-inline-input';
import SCInlineDropDownList from '../sc-controls/form-controls/sc-inline-dropdownlist';

function InvoiceDetails({ itemID, module, customerID, invoice, items, updateItems, companyTaxPercentage, integration, error, accessStatus }) {

  const [showManageItemModal, setShowManageItemModal] = useState(false);
  const [itemToEdit, setItemToEdit] = useState(null);
  const [itemEditIndex, setItemEditIndex] = useState(-1);
  const [isNewItem, setIsNewItem] = useState(true);

  const [itemTab, setItemTab] = useState('Inventory Item');

  const [currentLineNumber, setCurrentLineNumber] = useState(0);

  const [invoiceItemsDisplayedDescriptions, setInvoiceItemDisplayedDescriptions] = useState({});

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
    setInvoiceItemDisplayedDescriptions(displayedDescriptions)
  }

  useEffect(() => {
    getCurrentLineNumber();
    return () => {
    };
  }, []);

  const [hasAssets, setHasAssets] = useState(false);

  const checkForAssets = async () => {
    let result = await AssetService.checkForAssets(module, itemID, customerID);
    setHasAssets(result);
    return result;
  };

  const [invoiceItemButtons, setInvoiceItemButtons] = useState([]);

  const buildUpInvoiceItemButtons = async () => {
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
    setInvoiceItemButtons(buttons);
  };

  const [jobInventory, setJobInventory] = useState([]);

  const getJobInventory = async () => {
    if (module == Enums.Module.JobCard && itemID) {
      const job = await Fetch.get({
        url: '/Job/' + itemID,
        caller: "components/invoice/invoice-details.js:getJobInventory()"
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
    if (changed || jobInventory.length === 0) {
      getJobInventory();
    }
  }, [itemID]);

  const invoiceItemButtonClick = (link) => {
    switch (link) {
      case 'AddItem':
        setItemTab('Materials');
        break;
      case 'AddDescription':
        setItemTab('Description');
        break;
      case 'AddAsset':
        setItemTab('Assets');
        break;
      case 'AddItemUsed':
        setItemTab('Job Materials');
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

    setShowManageItemModal(!showManageItemModal);
    setItemToEdit(item);
    setItemEditIndex(index);
    setIsNewItem(item === null);
  };

  useEffect(() => {
    buildUpInvoiceItemButtons();
  }, [jobInventory]);

  const saveItem = (item) => {
    if (item) {
      if (isNewItem) {
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
            x => ({...x, [itemEditIndex]: item.Description})
        )
      }

      sortItems(items);
      updateItems(items);
    }

    setItemEditIndex(-1);
    setItemToEdit(null);
    setShowManageItemModal(false);
  }

  const saveInvoiceItems = (savedItems) => {

    let cln = currentLineNumber;
    for (let index in savedItems) {
      savedItems[index].LineNumber = cln;
      cln++;
      items.push(savedItems[index]);
      sortItems(items);
      updateItems(items);
    }
    setCurrentLineNumber(cln);

    setItemEditIndex(-1);
    setItemToEdit(null);
    setShowManageItemModal(false);
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
  }

  const handleDescriptionChange = (item, e) => {

    item.Description = e.target.value;
    item.InventoryDescription = e.target.value;
    updateItem(item);
  }

  const handleDescriptionChangeSC = (item, e) => {
    const index = items.indexOf(item)
    if (index > -1) {
      setInvoiceItemDisplayedDescriptions(prevState => ({
        ...prevState,
        [index]: e.value
      }));
    }
    item.Description = e.value;
    item.InventoryDescription = e.value;
    updateItem(item);
  }

  const handleQuantityChange = (item, e) => {
    let value = parseFloat(e.target.value);
    if (Number.isNaN(value)) {
      item.Quantity = 0;
    } else {
      item.Quantity = value;
    }
    updateLineTotal(item);
    updateItem(item);
  }

  const handleQuantityChangeSC = (item, e) => {
    let value = parseFloat(e.value);
    if (Number.isNaN(value)) {
      item.Quantity = 0;
    } else {
      item.Quantity = value;
    }
    updateLineTotal(item);
    updateItem(item);
  }

  const handleUnitPriceExclusiveChange = (item, e) => {
    let value = parseFloat(e.target.value);
    if (Number.isNaN(value)) {
      item.UnitPriceExclusive = 0;
    } else {
      item.UnitPriceExclusive = value;
    }
    updateLineTotal(item);
    updateItem(item);
  }

  const handleUnitPriceExclusiveChangeSC = (item, e) => {
    let value = parseFloat(e.value);
    if (Number.isNaN(value)) {
      item.UnitPriceExclusive = 0;
    } else {
      item.UnitPriceExclusive = value;
    }
    updateLineTotal(item);
    updateItem(item);
  }

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
  }

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
  }

  const updateItem = (item) => {
    let updatedList = items;
    let index = updatedList.indexOf(item);
    updatedList[index] = item;
    updateItems(updatedList);
  }

  const removeItem = (item) => {
    let temp = items;
    let indexToRemove = temp.indexOf(item);
    temp.splice(indexToRemove, 1);
    refreshItemDescriptions(temp);
    updateItems(temp);
  }

  const refreshItemDescriptions = (newItems) => {
    setDisplayedDescriptions(
        newItems.reduce((a, b, i) => (
            {
              ...a,
              [i]: b.InventoryDescription
            }
        ), {})
    )
  }

  const [descriptionEditEnabled, setDescriptionEditEnabled] = useState(false);
  const [descriptionEditIndex, setDescriptionEditIndex] = useState(null);
  const [descriptionFocus, setDescriptionFocus] = useState(false);
  const toggleDescriptionEdit = (index) => {
    if (accessStatus === Enums.AccessStatus.LockedWithAccess || accessStatus === Enums.AccessStatus.LockedWithOutAccess) {
      return;
    }

    resetEdits();
    setDescriptionEditIndex(index);
    setDescriptionEditEnabled(true);
    setDescriptionFocus(true);
  }

  const [quantityEditEnabled, setQuantityEditEnabled] = useState(false);
  const [quanityEditIndex, setQuantityEditIndex] = useState(null);
  const [quantityFocus, setQuantityFocus] = useState(false);
  const toggleQuantityEdit = (index) => {
    if (accessStatus === Enums.AccessStatus.LockedWithAccess || accessStatus === Enums.AccessStatus.LockedWithOutAccess) {
      return;
    }

    resetEdits();
    setQuantityEditIndex(index);
    setQuantityEditEnabled(true);
    setQuantityFocus(true);
  }

  const [priceEditEnabled, setPriceEditEnabled] = useState(false);
  const [priceEditIndex, setPriceEditIndex] = useState(null);
  const [priceFocus, setPriceFocus] = useState(false);
  const togglePriceEdit = (index) => {
    if (accessStatus === Enums.AccessStatus.LockedWithAccess || accessStatus === Enums.AccessStatus.LockedWithOutAccess) {
      return;
    }

    resetEdits();
    setPriceEditIndex(index);
    setPriceEditEnabled(true);
    setPriceFocus(true);
  }

  const [discountEditEnabled, setDiscountEditEnabled] = useState(false);
  const [discountEditIndex, setDiscountEditIndex] = useState(null);
  const [discountFocus, setDiscountFocus] = useState(false);
  const toggleDiscountEdit = (index) => {
    if (accessStatus === Enums.AccessStatus.LockedWithAccess || accessStatus === Enums.AccessStatus.LockedWithOutAccess) {
      return;
    }

    resetEdits();
    setDiscountEditIndex(index);
    setDiscountEditEnabled(true);
    setDiscountFocus(true);
  }

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

    resetEdits();
    setTaxRateEditIndex(index);
    setTaxRateEditEnabled(true);
    setTaxRateFocus(true);
  }

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
  }

  const taxRateOnBlurHandler = () => {
    // if (toggleTaxRateRef.current) {
    //   return;
    // }
    resetEdits();
  };

  const resetEdits = (item = null) => {

    if (item && (item.Quantity === 0 || isNaN(item.Quantity))) {
      item.Quantity = 1;
      updateLineTotal(item);
      updateItem(item);
    }

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
    if (items.length > 0) {
      let lineNumbers = items.map((item, i) => {
        return parseInt(item.LineNumber);
      });
      setCurrentLineNumber(Math.max(...lineNumbers) + 1);
    } else {
      setCurrentLineNumber(0);
    }
  };

  const sortItems = (items) => {
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

    if (invoice.InvoiceStatus != Enums.InvoiceStatus.Draft) {
      return;
    }

    let tempItems = [...items];
    let item = tempItems.splice(previousIndex, 1);
    tempItems.splice(nextIndex, 0, item[0]);

    tempItems.map((q, i) => {
      q.LineNumber = i;
    });

    reorder(tempItems, previousIndex, nextIndex)

    updateItems(tempItems);
  }

  return (
    <div className="container">
      <div className="table-container">
        <table className="table">
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
                </th> : ''
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
          {items.length > 0 ?
            <Reorder reorderId="quote-item-list" onReorder={onReorder} lock='horizontal' component='tbody'
              placeholderClassName='reorder-placeholder' draggedClassName='reorder-dragged' disabled={disableReorder}>
              {
                items
                  .sort((a, b) => a.LineNumber - b.LineNumber)
                  .map(function (item, index) {
                    return (
                      <tr key={index}>
                        <td className="body-item-move" title="Click and drag to reorder"
                          onMouseEnter={() => setReorderToDisabled(false)} onMouseLeave={() => setReorderToDisabled(true)}>
                          <img src="/icons/menu-light.svg" alt="move" />
                        </td>
                        <td className="body-item-code" title='Edit' onClick={() => toggleManageInvoiceItemModal(item, index)}>
                          {item.InventoryCode}
                        </td>
                        <td className="body-item-desc" onClick={() => toggleDescriptionEdit(index)}>
                          {descriptionEditEnabled && index == descriptionEditIndex && invoice.InvoiceStatus == Enums.InvoiceStatus.Draft ?
                            <>
                              {!item.InventoryID ?
                                <>
                                  <SCInlineTextArea
                                    name={`description${index}`}
                                    onChange={(e) => handleDescriptionChangeSC(item, e)}
                                    value={item.Description}
                                    // value={invoiceItemsDisplayedDescriptions[item.ID] || ''}
                                    onBlur={resetEdits}
                                    autoFocus={descriptionFocus}
                                  />
                                  {/* <InlineTextAreaInput
                                    name={`description${index}`}
                                    changeHandler={(e) => handleDescriptionChange(item, e)}
                                    value={item.Description}
                                    blurHandler={resetEdits}
                                    inputFocus={descriptionFocus}
                                  /> */}
                                </> :
                                <>
                                  <SCInlineInput
                                    name={`description${index}`}
                                    onChange={(e) => handleDescriptionChangeSC(item, e)}
                                    // value={item.Description}
                                    value={invoiceItemsDisplayedDescriptions[index] || ''}
                                    onBlur={resetEdits}
                                    autoFocus={descriptionFocus}
                                  />
                                  {/* <InlineTextInput
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
                          item.InvoiceItemType == Enums.InvoiceItemType.Inventory ?
                            <td className={`body-item-status ${item.Integrated ? 'status-synced' : 'status-error'}`}>
                              {item.Integrated ? 'Synced' : item.IntegrationMessage ? 'Error' : 'Not Synced'}
                            </td> :
                            <td className="body-item-status">

                            </td>
                          : ''
                        }

                        <td className="body-item-qty number-column" onClick={() => item.InvoiceItemType == Enums.InvoiceItemType.Inventory
                          ? toggleQuantityEdit(index) : {}}>
                          {item.InvoiceItemType == Enums.InvoiceItemType.Inventory ?
                            <>
                              {quantityEditEnabled && quanityEditIndex == index && invoice.InvoiceStatus == Enums.InvoiceStatus.Draft ?
                                <>
                                  <SCInlineInput
                                    name={`quantity${index}`}
                                    onChange={(e) => handleQuantityChangeSC(item, e)}
                                    value={item.Quantity}
                                    type='number'
                                    textAlign='right'
                                    width='118px'
                                    onBlur={() => resetEdits(item)}
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
                                    blurHandler={() => resetEdits(item)}
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

                        <td className="body-item-price number-column" onClick={() => item.InvoiceItemType == Enums.InvoiceItemType.Inventory ? togglePriceEdit(index) : {}}>
                          {item.InvoiceItemType == Enums.InvoiceItemType.Inventory ?
                            <>
                              {priceEditEnabled && priceEditIndex == index && invoice.InvoiceStatus == Enums.InvoiceStatus.Draft ?
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

                        <td className="body-item-discount number-column" onClick={() => item.InvoiceItemType == Enums.InvoiceItemType.Inventory ? toggleDiscountEdit(index) : {}}>
                          {item.InvoiceItemType == Enums.InvoiceItemType.Inventory ?
                            <>
                              {discountEditEnabled && discountEditIndex == index && invoice.InvoiceStatus == Enums.InvoiceStatus.Draft ?
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

                        <td className="body-item-taxrate number-column" onClick={() => item.InvoiceItemType == Enums.InvoiceItemType.Inventory ? toggleTaxRateEdit(index) : {}}>
                          {item.InvoiceItemType == Enums.InvoiceItemType.Inventory ?
                            <>
                              {taxRateEditEnabled && taxRateEditIndex == index && invoice.InvoiceStatus == Enums.InvoiceStatus.Draft ?
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
                          {item.InvoiceItemType == Enums.InvoiceItemType.Description ? item.LineTotalExclusive : Helper.getCurrencyValue(item.LineTotalExclusive)}
                        </td>
                        <td className="body-item-delete" title="Delete quote item">
                          {accessStatus !== Enums.AccessStatus.LockedWithAccess && accessStatus !== Enums.AccessStatus.LockedWithOutAccess && invoice.InvoiceStatus == Enums.InvoiceStatus.Draft ? <>
                            <img src="/icons/trash-bluegrey.svg" alt="delete" onClick={() => removeItem(item)} />
                          </> : ""}
                        </td>
                      </tr>
                    );
                  })
              }
            </Reorder>
            : ""
          }
        </table>
      </div>

      {/* {accessStatus !== Enums.AccessStatus.LockedWithAccess && accessStatus !== Enums.AccessStatus.LockedWithOutAccess && invoice.InvoiceStatus == Enums.InvoiceStatus.Draft ? <>
        <div className="row">
          <Button text="Add Item" icon="plus-circle-blue" extraClasses="hollow" onClick={() => toggleManageItemModal(null, -1)} />
        </div>
      </> : ""} */}

      {accessStatus !== Enums.AccessStatus.LockedWithAccess && accessStatus !== Enums.AccessStatus.LockedWithOutAccess && invoice.InvoiceStatus == Enums.InvoiceStatus.Draft ?
        <div className="add-item">
          <ButtonDropdown
            action={invoiceItemButtonClick}
            text="Add Line"
            options={invoiceItemButtons}
          />
        </div>
        : ''}

      {showManageItemModal ?
        <ManageInvoiceItem isNew={isNewItem} tab={itemTab} invoice={invoice} invoiceItem={itemToEdit} saveInvoiceItem={saveItem} saveInvoiceItems={saveInvoiceItems}
          itemID={itemID} module={module} integration={integration} jobInventory={jobInventory} hasAssets={hasAssets} customerID={customerID}
          companyTaxPercentage={companyTaxPercentage} accessStatus={accessStatus} cypressInventorySelector={"data-cy-inventory-selector"} cypressQuantity={"data-cy-quantity"}
          cypress={"data-cy-price-excl-vat"} />
        : ''
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
        .total-container {
          margin-top: 1rem;
        }
        .status-error {
          color: ${colors.warningRed};
        }
        .status-synced {
          color: ${colors.green};
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
      `}</style>
    </div>
  );
}

export default InvoiceDetails;
