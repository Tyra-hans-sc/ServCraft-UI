import React, {useState, useEffect, useContext, useRef, useMemo} from 'react';
import { colors, fontSizes, layout, fontFamily } from '../../../theme';
import Tabs from '../../tabs';
import SCTextArea from '../../sc-controls/form-controls/sc-textarea';
import SCComboBox from '../../sc-controls/form-controls/sc-combobox';
import SCNumericInput from '../../sc-controls/form-controls/sc-numeric-input';
import SCCheckbox from '../../sc-controls/form-controls/sc-checkbox';
import LegacyButton from '../../button';
import Checkbox from '../../checkbox';
import Fetch from '../../../utils/Fetch';
import * as Enums from '../../../utils/enums';
import Helper from '../../../utils/helper';
import ToastContext from '../../../utils/toast-context';
import InventorySelector from '../../selectors/inventory/inventory-selector';
import SCInput from '../../sc-controls/form-controls/sc-input';
import SCDropdownList from '../../sc-controls/form-controls/sc-dropdownlist';
import { Box, Button, Fieldset, Flex, Text } from "@mantine/core";
import SCModal from "../../../PageComponents/Modal/SCModal";
import { IconFilter } from "@tabler/icons-react";
import { IconChevronRight } from "@tabler/icons";
import styles from "../../../PageComponents/Inventory/AddInventoryItemForm.module.css";
import ScDataFilter from "../../../PageComponents/Table/Table Filter/ScDataFilter";
import { useMediaQuery } from "@mantine/hooks";
import JobMaterialsSelectTable
  from "../../../PageComponents/SectionTable/Section Component Tables/JobMaterialsSelectTable";
import AddBundleToInvoiceForm from "@/PageComponents/Inventory/AddBundleToSectionListForm";
import ItemDisplayImages from '@/PageComponents/Attachment/ItemDisplayImages';

const tabInventory = "Materials";
const tabMaterials = "Job Materials";
const tabDescription = "Description";
const tabBundles = "Bundle";

function ManagePurchaseOrderItem({ isNew, tab, jobInventory, purchaseOrderItem, savePurchaseOrderItem, savePurchaseOrderItems, companyTaxPercentage, integration, accessStatus, purchaseOrder, purchaseOrderItems, userColumnConfig }) {

  const addAndContinueRef = useRef(false);

  const toast = useContext(ToastContext);

  const [selectedTab, setSelectedTab] = useState(isNew ? tab : purchaseOrderItem.ItemType === Enums.ItemType.Inventory ? tabInventory : tabDescription);
  const [pageTabs, setPageTabs] = useState([]);

  const mobileView = useMediaQuery('(max-width: 800px)');

  const [triggerBundleSaveCounter, setTriggerBundleSaveCounter] = useState(0)
  const [suppressSave, setSuppressSave] = useState(false);

  const buildUpPageTabs = () => {

    let tabs = [];

    tabs.push({ text: tabInventory, suppressCount: true });

    if (isNew) {
      if (jobInventory && jobInventory.length > 0) {
        tabs.push({ text: tabMaterials, suppressCount: true });
      }
      tabs.push({ text: tabBundles, suppressCount: true });
      tabs.push({ text: tabDescription, suppressCount: true });
    } else {
      if (purchaseOrderItem.ItemType == Enums.ItemType.Inventory) {
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
    buildUpPageTabs();
  }, [jobInventory]);

  const [inputErrors, setInputErrors] = useState({});

  useEffect(() => {
    if (selectedTab == tabInventory) {
      if (!isNew) {
        setInventory(purchaseOrderItem.InventoryID);
      }
    }
  }, [selectedTab]);

  // INVENTORY

  const firstInventoryUpdate = useRef(true);
  const firstInventoryNotSelectedUpdate = useRef(true);
  const [selectedInventory, setSelectedInventory] = useState();
  const [inventoryChanged, setInventoryChanged] = useState(false);

  useEffect(() => {
    if (selectedInventory && inventoryChanged) {
      setUnitPriceExclusive(selectedInventory.CostPrice);
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

  const [quantity, setQuantity] = useState(isNew ? 1 : purchaseOrderItem.Quantity);

  const handleQuantityChange = (e) => {
    setQuantity(parseFloat(e.value));
  };

  const [lineDiscountPercentage, setLineDiscountPercentage] = useState(isNew ? 0 : purchaseOrderItem.LineDiscountPercentage);
  const handleLineDiscountPercentageChange = (e) => {
    setLineDiscountPercentage(parseFloat(e.value));
  }

  const [unitPriceExclusive, setUnitPriceExclusive] = useState(isNew ? 0 : purchaseOrderItem.UnitPriceExclusive);

  const handleUnitPriceExclusiveChange = (e) => {
    setUnitPriceExclusive(parseFloat(e.value));
  };

  const useInclusivePricing = useMemo(() => userColumnConfig.find(x => x.ColumnName === 'UnitPriceInclusive')?.Show, [userColumnConfig])

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
  };

  const taxRates = Enums.getEnumItems(Enums.TaxRate);
  const [taxRate, setTaxRate] = useState(isNew ? companyTaxPercentage > 0 ? 'Standard Rate' : 'No VAT' : purchaseOrderItem.TaxPercentage > 0 ? 'Standard Rate' : 'No VAT');
  const [taxPercentage, setTaxPercentage] = useState(isNew ? companyTaxPercentage ? companyTaxPercentage : 0 : purchaseOrderItem.TaxPercentage);

  const handleTaxRateChange = (value) => {
    setTaxRate(value);
    if (value == 'Standard Rate') {
      setTaxPercentage(companyTaxPercentage);
    } else {
      setTaxPercentage(0);
    }
  };

  const [lineTotalExclusive, setLineTotalExclusive] = useState(isNew ? 0 : purchaseOrderItem.LineTotalExclusive);

  const updateTotals = () => {
    if (selectedInventory && (quantity > 0 && unitPriceExclusive > 0)) {

      let subTotal = quantity * Math.round(unitPriceExclusive * 100) / 100;
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

  const [firstLoad, setFirstLoad] = useState(!isNew);

  useEffect(() => {
    if (selectedInventory) {
      if (!firstLoad) {
        setDescription(selectedInventory.Description);
      }
      setFirstLoad(false);
    }
  }, [selectedInventory]);

  const [description, setDescription] = useState(isNew ? '' : purchaseOrderItem.Description);

  const handleDescriptionChange = (e) => {
    setDescription(e.value);
  };

  const [jobInventoryToAdd, setJobInventoryToAdd] = useState([])
  const [resetSelectionsCounter, setResetSelectionsCounter] = useState(0)

  // SAVING

  const [saving, setSaving] = useState(false);

  const saveItem = async (e) => {

    setSaving(true);

    if (selectedTab == tabInventory || selectedTab == tabDescription) {
      let inputs = '';

      if (selectedTab == tabInventory) {
        inputs = [
          { key: 'Quantity', value: quantity, required: true, gt: 0, type: Enums.ControlType.Number },
          { key: 'UnitPriceExclusive', value: unitPriceExclusive, required: true, gte: 0, type: Enums.ControlType.Number },
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
        setInputErrors(errors);
        setSaving(false);
      } else {
        let item = {
          IsActive: true,
          // ID: 'newAddedItem' + crypto.randomUUID() // id added for sortability on puchasestable
        };
        if (selectedTab == tabInventory) {
          item = {
            ...item,
            Description: description,
            Quantity: quantity,
            LineDiscountPercentage: lineDiscountPercentage,
            UnitPriceExclusive: unitPriceExclusive,
            LineTotalExclusive: lineTotalExclusive,
            InventoryID: selectedInventory.ID,
            InventoryDescription: description,
            InventoryCode: selectedInventory.Code,
            InventoryActive: selectedInventory.IsActive,
            ItemType: Enums.ItemType.Inventory,
            TaxPercentage: taxPercentage,
            Integrated: selectedInventory.Integrated,
            SyncStatus: selectedInventory.SyncStatus,
          };
        } else {
          item = {
            ...item,
            Description: description,
            InventoryDescription: description,
            ItemType: Enums.ItemType.Description,
          };
        }

        savePurchaseOrderItem(item, addAndContinueRef.current);

        // Reset form if using "Add & Next"
        if (addAndContinueRef.current) {
          setSelectedInventory(null);
          setInventoryChanged(p => !p);
          handleSetQueryStateWithInventoryChange(null);
          setDescription('');
          setQuantity(1);
          setUnitPriceExclusive(0);
          setLineDiscountPercentage(0);
          setLineTotalExclusive(0);
          setInputErrors({});
          setSaving(false);
        }
      }
    }

    if (selectedTab == tabMaterials) {
      // let jobInventoryToAdd = jobInventory.filter(x => selectedJobInventoryIds.some(y => y == x.ID));
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
              ItemType: Enums.ItemType.Description,
              // ID: item.ID ?? ('newAddedItem' + crypto.randomUUID()) // id added for sortability on puchasestable
            });
          } else {
            let inventory = await getInventory(item.InventoryID);
            let lineTotalExclusive = 0;

            if (inventory.CostPrice > 0) {
              let subTotal = item.QuantityRequested * inventory.CostPrice;
              lineTotalExclusive = Math.round(subTotal * 100) / 100;
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
              UnitPriceExclusive: inventory.CostPrice,
              LineTotalExclusive: lineTotalExclusive,
              IsActive: true,
              ItemType: Enums.ItemType.Inventory,
              // ID: item.ID ?? ('newAddedItem' + crypto.randomUUID()) // id added for sortability on puchasestable
            });
          }
        }
        savePurchaseOrderItems(items, addAndContinueRef.current);

        // Reset form if using "Add & Next"
        if (addAndContinueRef.current) {
          setJobInventoryToAdd([]);
          // Increment the resetSelectionsCounter to reset the JobMaterialsSelectTable
          setResetSelectionsCounter(prev => prev + 1);
          setSaving(false);
        }
      }
    } else if (selectedTab === tabBundles) {
      setTriggerBundleSaveCounter((p) => (p + 1))
      // Don't set saving to false here, it will be set in the onSaveItems callback
    }

    if (!isNew) {
      setSaving(false);
    }
  };

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
      onClose={() => savePurchaseOrderItem(null)}
      size={pageTabs.some(x => x.text === tabMaterials) ? 'xl' : 650}
      modalProps={{
        styles: {
          body: { minWidth: mobileView ? 'auto' : 500 }
        },
        centered: false
      }}
    >
      <div >
        <div className="title" style={{ marginTop: 15 }}>
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
          tabs={pageTabs}
          useNewTabs
        />
        {(() => {
          switch (selectedTab) {
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
                        initialValues={queryState}
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
                <Text ta={'start'} ml={'xs'} mt={0} c={'dimmed'} display={closed ? 'none' : 'inline-flex'} opacity={closed ? 0 : 1} style={{ transition: '200ms ease-in-out' }} size={'xs'}>{selectedInventory ? 'Inventory selected' : 'Filter is applied when selecting inventory'}</Text>

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
                      setInventoryChanged={setInventoryChanged}
                      accessStatus={accessStatus} error={inputErrors.Inventory}
                      additionalQueryParams={closed ? {} : queryState}
                    />
                  </Box>
                  <Box
                    style={{ flexGrow: 0 }}
                    maw={{ base: '100%', xs: 134 }}
                  >
                    <SCNumericInput
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
                <Flex gap={{ base: 0, xs: 'sm' }} direction={{ base: 'column', xs: 'row' }}>
                  <Box
                    style={{ flexGrow: 1 }}
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

                <Flex gap={{ base: 0, xs: 'sm' }} direction={{ base: 'column', xs: 'row' }}>
                  <Box
                    style={{ flexGrow: 1 }}
                  >
                    {
                      useInclusivePricing ?
                        <SCNumericInput
                          label="Price Incl VAT"
                          required={true}
                          onChange={handleUnitPriceInclusiveChange}
                          value={calculateInclusivePrice(unitPriceExclusive, taxPercentage)}
                          error={inputErrors.UnitPriceExclusive}
                          signed={true}
                          min={0}
                          format={Enums.NumericFormat.Currency}
                        />
                        :
                        <SCNumericInput
                          label="Price Excl VAT"
                          required={true}
                          onChange={handleUnitPriceExclusiveChange}
                          value={unitPriceExclusive}
                          error={inputErrors.UnitPriceExclusive}
                          signed={true}
                          min={0}
                          format={Enums.NumericFormat.Currency}
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
                    />
                  </Box>
                  <Box
                    style={{ flexGrow: 1 }}
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
                  onChange={handleDescriptionChange}
                  required={true}
                  value={description}
                  error={inputErrors.Description}
                />
              </div>;
            case tabMaterials:
              return <Box
                pt={'sm'}
              >
                <JobMaterialsSelectTable
                  filteredJobInventory={jobInventory}
                  itemId={purchaseOrderItem?.ID}
                  onSelectedItemsChanged={setJobInventoryToAdd}
                  module={Enums.Module.PurchaseOrder}
                  resetSelections={resetSelectionsCounter}
                />
              </Box>
            case tabBundles:
              return <Box mt={'sm'}>
                <AddBundleToInvoiceForm
                  isNew={isNew}
                  itemID={purchaseOrder.ID || null}
                  module={Enums.Module.PurchaseOrder}
                  accessStatus={accessStatus}
                  items={purchaseOrderItems}
                  companyTaxPercentage={companyTaxPercentage}
                  triggerSave={triggerBundleSaveCounter}
                  onSaveItems={(newItems) => {
                    savePurchaseOrderItem(newItems, addAndContinueRef.current)
                    // Set saving to false after the save operation is complete
                    setSaving(false);
                  }}
                  // defaultSectionPdfSettings={defaultSectionPdfSettings}
                  storeID={purchaseOrder.StoreID}
                  onSuppressSave={setSuppressSave}
                />
              </Box>

          }
        })()}

        <Flex justify={'end'} gap={'sm'} mt={'sm'}>
          <Button variant={'subtle'} color={'gray.9'} onClick={() => {
            // Always close the modal when cancel is clicked, regardless of addAndContinueRef.current
            addAndContinueRef.current = false;
            savePurchaseOrderItem(null);
          }}>Cancel</Button>
          {isNew && (
              <Button
                  onClick={() => {
                    addAndContinueRef.current = true;
                    saveItem(null);
                  }}
                  loading={saving}
                  disabled={saving || suppressSave}
                  variant={'outline'}
              >
                Add & Next
              </Button>
          )}
          <Button
            onClick={() => {
              addAndContinueRef.current = false;
              saveItem(null);
            }}
            loading={saving}
            disabled={saving || suppressSave}
            mr={-2}
          >
            {isNew ? 'Add' : 'Save'}
          </Button>
        </Flex>
      </div>
      <style jsx>{`
          .modal-container {
            padding-bottom: 5rem;
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

          .inventory-item-container {
            display: flex;
            flex-direction: row;
            width: 100%;
          }

          .description-container {

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
  );
}

export default ManagePurchaseOrderItem;
