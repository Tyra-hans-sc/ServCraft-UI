import React, { useState, useEffect, useContext, useRef, useMemo } from 'react';
import Router from 'next/router';
import { colors, layout, } from '../../theme';
import Fetch from '../../utils/Fetch';
import Helper from '../../utils/helper';
import * as Enums from '../../utils/enums';
import Breadcrumbs from '../../components/breadcrumbs';
import PurchaseDetails from '../purchase/puchase-details';
import ToastContext from '../../utils/toast-context';
import Time from '../../utils/time';
import DownloadService from '../../utils/download-service';
import ConfirmAction from '../modals/confirm-action';
import Tabs from '../tabs';
import Attachments from '../shared-views/attachments';
import ItemComments from '../shared-views/item-comments';
import AuditLog from '../shared-views/audit-log';
import Storage from '../../utils/storage';
import PS from '../../services/permission/permission-service';
import OptionService from '../../services/option/option-service';
import Constants from '../../utils/constants';
import Communications from '../shared-views/communications';
import ChangeContact from '../modals/contact/change-contact';
import ManageContact from '../modals/contact/manage-contact';
import CommentService from '../../services/comment/comment-service';
import StoreSelector from '../selectors/store/store-selector';
import SCTextArea from '../sc-controls/form-controls/sc-textarea';
import SCInput from '../sc-controls/form-controls/sc-input';
import SCDatePicker from '../sc-controls/form-controls/sc-datepicker';
import EmployeeSelector from '../selectors/employee/employee-selector';
import SCNumericInput from '../sc-controls/form-controls/sc-numeric-input';
import SupplierSelector from '../selectors/supplier/supplier-selector';
import useOutsideClick from '../../hooks/useOutsideClick';
import CreateNewSupplierModal from "../../PageComponents/Inventory/CreateNewSupplierModal";
import { IconExternalLink } from "@tabler/icons";
import { ActionIcon, Anchor, Box, Button, Card, Flex, Loader, Space, Text, Tooltip } from "@mantine/core";
import Link from "next/link";
import LinkItem from "../../PageComponents/Links/LinkItem";
import ToolbarButtons from "../../PageComponents/Button/ToolbarButtons";
import {
  IconCalendar,
  IconDeviceFloppy,
  IconDotsVertical, IconEye,
  IconFileCheck,
  IconPlayerTrackNext,
  IconPrinter,
  IconSend,
  IconTruck,
  IconTruckDelivery
} from "@tabler/icons-react";
import { useDidUpdate, useElementSize } from "@mantine/hooks";
import AlertIcon from "../../PageComponents/Icons/AlertIcon";
import featureService from '../../services/feature/feature-service';
import constants from '../../utils/constants';
import purchaseOrderService from '../../services/purchase/purchase-order-service';
import ManageStockTransactionDrawer from '../../PageComponents/StockTransaction/ManageStockTransactionDrawer';
import stockTransactionService from '../../services/stock-transaction/stock-transaction-service';
import ItemStockTransactionsTable from '../../PageComponents/Table/Component Tables/ItemStockTransactionsTable';
import SCSplitButton from '../sc-controls/form-controls/sc-split-button';
import userConfigService from '../../services/option/user-config-service';
import MergeItemsModal from '../../PageComponents/Inventory/MergeItemsModal';
import UpdateInventoryPricesModal, { detectInventoryPriceChanges } from "../../PageComponents/Inventory/UpdateInventoryPricesModal";
import EditUserConfigMetaDataModal from '../../PageComponents/EditUserConfigMetaDataModal';
import QuickGRVModal from '../../PageComponents/Purchases/QuickGRVModal';


function ManagePurchaseOrder(props) {

  const [inventoryPermission] = useState(PS.hasPermission(Enums.PermissionName.Inventory));
  const [costingPermission] = useState(PS.hasPermission(Enums.PermissionName.InventoryCostPrice));
  const [jobPermission] = useState(PS.hasPermission(Enums.PermissionName.Job));
  const [queryPermission] = useState(PS.hasPermission(Enums.PermissionName.Query));
  const [stockTransactionViewPermission] = useState(PS.hasPermission(Enums.PermissionName.StockTransactionsView));
  const [purchaseOrderReceivePermission] = useState(PS.hasPermission(Enums.PermissionName.PurchaseOrderReceiveStock));
  const [purchaseOrderApprovePermission] = useState(PS.hasPermission(Enums.PermissionName.PurchaseOrderApprove));
  const [purchaseOrderRevertPermission] = useState(PS.hasPermission(Enums.PermissionName.PurchaseOrderRevert));
  const [canOrderNow, setCanOrderNow] = useState(false);
  const [isOrderedNow, setIsOrderedNow] = useState(false);
  const [hasStockControl, setHasStockControl] = useState();
  const [hasVanStock, setHasVanStock] = useState();
  const [hasPOGRV, setHasPOGRV] = useState();
  const [showStockTransactionDrawer, setShowStockTransactionDrawer] = useState({ show: false, stockTransaction: null });
  const [refreshStockTransactionToggle, setRefreshStockTransactionToggle] = useState(false);
  const [showQuickGRV, setShowQuickGRV] = useState(false);

  const [integration, setIntegration] = useState(null);
  const [integrationTooltip, setIntegrationTooltip] = useState('');

  const supplierSelectRef = useRef();
  const ignoreSupplierOutsideClick = useRef(false);

  const isNew = props.isNew;
  const copyFromPurchaseOrder = props.copyFromPurchaseOrder;
  const externalModule = props.module;
  const externalModuleID = props.moduleID;
  const externalSupplierID = props.supplierID;
  const rootModule = props.rootModule;

  const [quoteItemsCopied, setQuoteItemsCopied] = useState(false);

  const [purchaseOrder, setPurchaseOrder] = useState(isNew ? copyFromPurchaseOrder ?
    {
      ...copyFromPurchaseOrder,
      Reference: '',
      PurchaseOrderStatus: Enums.PurchaseOrderStatus.Draft,
      ItemID: copyFromPurchaseOrder.SupplierID,
      Module: Enums.Module.Supplier,
      Date: Time.today(),
    } : {
      Reference: '',
      DiscountPercentage: 0,
      PurchaseOrderStatus: Enums.PurchaseOrderStatus.Draft,
      Date: Time.today(),
      Module: Enums.Module.Supplier,
      DeliveryDate: Time.today((() => { let date = new Date(); date.setDate(date.getDate() + 1); return date; })())
    } : props.purchaseOrder);

  const [module, setModule] = useState();
  const [itemID, setItemID] = useState();

  // const [comments, setComments] = useState(props.comments ? props.comments : []);
  const [totalComments, setTotalComments] = useState(0);
  const [totalGRVs, setTotalGRVs] = useState(0);

  useOutsideClick(supplierSelectRef, () => {
    if (selectedSupplier && showAddSupplier && !ignoreSupplierOutsideClick.current) {
      setShowAddSupplier(false);
    }
    ignoreSupplierOutsideClick.current = false;
  });

  const [mergeItemsModalOptions, setMergeItemsModalOptions] = useState({
    canAdd: false,
    canMerge: false,
    canIgnore: false,
    onCancel: () => { },
    onAdd: () => { },
    onMerge: () => { },
    onIgnore: (remember) => { },
    show: false
  });

  const [crudConfig, setCrudConfig] = useState();
  const [showPreferencesModal, setShowPreferencesModal] = useState(false);

  const crudConfigMetaData = useMemo(() => {
    if (!crudConfig) return {};

    return {
      values: {
        compareJobInventoryOnApprove: userConfigService.getMetaDataValue(crudConfig, "compareJobInventoryOnApprove") ?? true,
      },
      labels: {
        compareJobInventoryOnApprove: "Prompt for job and purchase order differences during approval"
      },
      titles: {
        compareJobInventoryOnApprove: "Always prompt to add, merge, or disregard any inventory differences between job details and purchase order line items."
      },
      types: {
        compareJobInventoryOnApprove: "switch"
      }
    };
  }, [crudConfig]);

  const updateCrudConfigMetaData = async (metaData) => {
    if (metaData) {
      let crudConfigToSave = JSON.parse(JSON.stringify(crudConfig));
      Object.keys(metaData).forEach(key => {
        userConfigService.setMetaDataValue(crudConfigToSave, key, metaData[key]);
      });
      await userConfigService.saveConfig(crudConfigToSave);
      setCrudConfig(crudConfigToSave);
    }
    setShowPreferencesModal(false);
  }

  // TABS

  const [pageTabs, setPageTabs] = useState([]);
  const [selectedTab, setSelectedTab] = useState(props.initTab);

  const [attachmentCount, setAttachmentCount] = useState(0);
  const [countsToggle, setCountsToggle] = useState(false);
  const [communicationCount, setCommunicationCount] = useState(0);

  const getCounts = async () => {
    let countRequest = await Fetch.get({
      url: `/PurchaseOrder/GetCounts?id=${purchaseOrder.ID}`,
    });
    let result = countRequest.Results;
    setAttachmentCount(result.find(x => x.Key == 'Attachments').Value);
    setCommunicationCount(result.find(x => x.Key == 'Communication').Value);
    setTotalGRVs(result.find(x => x.Key == "StockTransactions").Value);

    setCountsToggle(!countsToggle);
  };

  const trySetSelectedTab = (selTab) => {

    const doSetSelectedTab = (tab) => {
      setSelectedTab(selTab);
      if (selTab === "Communication") {
        getCounts();
      }
    }

    if (selectedTab === "Purchase" && formIsDirty) {

      setConfirmOptions({
        ...Helper.initialiseConfirmOptions(),
        display: true,
        heading: "Save Changes?",
        text: "Save changes before changing the tab?",
        confirmButtonText: "Save Changes",
        discardButtonText: "Discard Changes",
        showDiscard: true,
        showCancel: true,
        onDiscard: async () => {
          await refreshPurchaseOrder();
          doSetSelectedTab(selTab);
        },
        onConfirm: async () => {
          let result = await savePurchaseOrder();
          if (result === true) {
            doSetSelectedTab(selTab);
          }
        }
      });

      return;
    }
    else {
      doSetSelectedTab(selTab);
    }


  };

  useEffect(() => {
    buildUpPageTabs();
  }, [countsToggle, totalComments, hasStockControl, totalGRVs, hasPOGRV]);

  const onAttachmentRefresh = () => {
    getCounts();
  };

  const prepareOrderNow = async () => {
    var optionValue = await OptionService.getOptionValue(Constants.optionKeys.PurchaseOrderOrderNow);
    optionValue = optionValue !== null && optionValue.toLowerCase().trim() === "true";
    setCanOrderNow(optionValue);
  };

  const orderNow = async () => {

    if (formIsDirty) {
      let result = await savePurchaseOrder(purchaseOrder.PurchaseOrderStatus);
      if (!result) return;
    }

    setConfirmOptions({
      ...Helper.initialiseConfirmOptions(),
      display: true,
      onConfirm: async () => {
        let orderNow = await Fetch.post({
          url: `/PurchaseOrder/OrderNow`,
          params: purchaseOrder.ID,
          toastCtx: toast
        });
        if (orderNow.ID) {
          setIsOrderedNow(true);
          toast.setToast({
            message: 'Purchase order ordered successfully',
            show: true,
            type: Enums.ToastType.success
          });
        }
      },
      text: "Do you confirm you want to place the order?",
      heading: "Order Now",
      cancelButtonText: "Cancel",
      confirmButtonText: "Confirm Order"
    });
  };

  const buildUpPageTabs = () => {
    let tabs = [
      { text: 'Purchase' },
      { text: 'Comments', count: totalComments },
      ...(hasStockControl && hasPOGRV && (purchaseOrderReceivePermission || stockTransactionViewPermission) && totalGRVs > 0 ? [{ text: "GRVs", count: totalGRVs, newItem: true }] : []),
      { text: 'Attachments', count: attachmentCount },
      { text: 'Communication', count: communicationCount },
    ];
    setPageTabs(tabs);
  };

  const [formIsDirty, setFormIsDirty] = useState(false);
  const [confirmOptions, setConfirmOptions] = useState(Helper.initialiseConfirmOptions());

  const [inputErrors, setInputErrors] = useState({});

  const toast = useContext(ToastContext);

  const updatePurchaseOrder = (field, value) => {
    let temp = { ...purchaseOrder };
    temp[field] = value;
    setPurchaseOrder(temp);
    setFormIsDirty(true);
  };

  const updatePurchaseOrderBulk = (field, value, orKeyValues, markAsDirty = true) => {
    let newPurchaseOrderState = { ...purchaseOrder };

    if (orKeyValues && orKeyValues.length > 0) {
      orKeyValues.map((item) => {
        newPurchaseOrderState[item.key] = item.value;
      });
    }
    if (field) {
      newPurchaseOrderState[field] = value;
    }

    setPurchaseOrder(newPurchaseOrderState);
    setFormIsDirty(markAsDirty);
  };

  const handleInputChange = (e) => {
    updatePurchaseOrder([e.target.name], e.target.value);
  };

  // DELIVERY ADDRESS

  const ADDRESS_LINE_LIMIT = 5;
  const enterPressed = useRef(false);

  const handleDeliveryAddressKeyDown = (e) => {
    if (e.keyCode == 13) {
      enterPressed.current = true;
    } else {
      enterPressed.current = false;
    }
  };

  const handleDeliveryAddressChange = (e) => {

    let name = e.target.name;
    let value = e.target.value;

    if (value !== undefined && value !== null && value !== "") {
      let addressLines = value.split("\n");
      let includeWhiteSpace = addressLines.filter(x => Helper.isNullOrWhitespace(x));
      let excludeWhiteSpace = addressLines.filter(x => !Helper.isNullOrWhitespace(x));

      if (excludeWhiteSpace.length + includeWhiteSpace.length > ADDRESS_LINE_LIMIT && enterPressed.current) {
        updatePurchaseOrder([name], purchaseOrder.DeliveryAddress);
        return;
      }

      if (excludeWhiteSpace.length > ADDRESS_LINE_LIMIT) {
        return;
      }
    }

    updatePurchaseOrder([name], value);
  };

  const [haltSupplierChange, setHaltSupplierChange] = useState(false);

  const externalPurchaseOrderCreateSetup = () => {
    switch (parseInt(externalModule)) {
      case Enums.Module.Quote:
        getLinkedQuote(externalModuleID).then(quote => {
          setSelectedStore(quote ? quote.Store : selectedStore);
          if (!!quote && !!quote.Location) {
            updatePurchaseOrder('DeliveryAddress', quote.Location.LocationDisplay);
          }
        });
        break;
      case Enums.Module.JobCard:
        setJobLinkLockdown(true);
        setShowQueryLink(false);
        setShowProjectLink(false);
        getLinkedJobCard(externalModuleID).then(job => {
          setSelectedStore(job ? job.Store : selectedStore);
          if (!!job && !!job.Location) {
            updatePurchaseOrder('DeliveryAddress', job.Location.LocationDisplay);
          }
        });
        setModule(Enums.Module.JobCard);
        break;
      case Enums.Module.Query:
        setQueryLinkLockdown(true);
        setShowJobLink(false);
        setShowProjectLink(false);
        getLinkedQuery(externalModuleID).then(query => {
          setSelectedStore(query ? query.Store : selectedStore);
          if (!!query && !!query.Location) {
            updatePurchaseOrder('DeliveryAddress', query.Location.LocationDisplay);
          }
        });
        setModule(Enums.Module.Query);
        break;
      case Enums.Module.Supplier:
        setHaltSupplierChange(true);
        selectSupplier(externalModuleID);
        setModule(Enums.Module.Supplier);
        break;
      case Enums.Module.Project:
        setShowQueryLink(false);
        setShowJobLink(false);
        setShowProjectLink(true);
        setProjectLinkLockdown(true);
        getLinkedProject(externalModuleID).then(project => {
          setSelectedStore(project ? project.Store : selectedStore);
          if (!!project && !!project.Location) {
            updatePurchaseOrder('DeliveryAddress', project.Location.LocationDisplay);
          }
        });
        setModule(Enums.Module.Project);
        break;
    }
    setItemID(externalModuleID);
  };

  const externalPurchaseOrderEditSetup = () => {
    switch (parseInt(externalModule)) {
      case Enums.Module.JobCard:
        setShowJobLink(true);
        setShowQueryLink(false);
        setShowProjectLink(false);
        setJobLinkLockdown(true);
        getLinkedJobCard(externalModuleID);
        setModule(Enums.Module.JobCard);
        setItemID(externalModuleID);
        break;
      case Enums.Module.Query:
        setShowQueryLink(true);
        setShowJobLink(false);
        setShowProjectLink(false);
        setQueryLinkLockdown(true);
        getLinkedQuery(externalModuleID);
        setModule(Enums.Module.Query);
        setItemID(externalModuleID);
        break;
      case Enums.Module.Supplier:
        if (purchaseOrder.Module == Enums.Module.JobCard) {
          setShowQueryLink(false);
          setShowJobLink(true);
          setShowProjectLink(false);
          getLinkedJobCard(purchaseOrder.ItemID);
          setModule(Enums.Module.JobCard);
          setItemID(purchaseOrder.ItemID);
        } else if (purchaseOrder.Module == Enums.Module.Query) {
          setShowQueryLink(true);
          setShowJobLink(false);
          setShowProjectLink(false);
          getLinkedQuery(purchaseOrder.ItemID);
          setModule(Enums.Module.Query);
          setItemID(purchaseOrder.ItemID);
        }
        break;
      case Enums.Module.Project:
        if (purchaseOrder.Module == Enums.Module.Project) {
          setShowProjectLink(true);
          setProjectLinkLockdown(true);
          setShowJobLink(false);
          getLinkedProject(purchaseOrder.ItemID);
          setModule(Enums.Module.Project);
          setItemID(purchaseOrder.ItemID);
        } else if (purchaseOrder.Module == Enums.Module.JobCard) {
          setShowJobLink(true);
          setJobLinkLockdown(true);
          getLinkedJobCard(purchaseOrder.ItemID);
          setModule(Enums.Module.JobCard);
          setItemID(purchaseOrder.ItemID);
        }
        setShowQueryLink(false);
        break;
    }
  };

  const purchaseOrderEditSetup = () => {

    switch (parseInt(purchaseOrder.Module)) {
      case Enums.Module.JobCard:
        setShowJobLink(true);
        setShowQueryLink(false);
        setShowProjectLink(false);
        getLinkedJobCard(purchaseOrder.ItemID);
        setModule(Enums.Module.JobCard);
        setItemID(purchaseOrder.ItemID);
        break;
      case Enums.Module.Query:
        setShowJobLink(false);
        setShowQueryLink(true);
        setShowProjectLink(false);
        getLinkedQuery(purchaseOrder.ItemID);
        setModule(Enums.Module.Query);
        setItemID(purchaseOrder.ItemID);
        break;
      case Enums.Module.Project:
        setShowJobLink(false);
        setShowQueryLink(false);
        setShowProjectLink(true);
        getLinkedProject(purchaseOrder.ItemID);
        setModule(Enums.Module.Project);
        setItemID(purchaseOrder.ItemID);
        break;
      default:
        setShowJobLink(true);
        setShowQueryLink(true);
        setShowProjectLink(true);
        break;
    }
  };

  useEffect(() => {
    getStore();

    if (isNew) {

      if (externalModule) {
        externalPurchaseOrderCreateSetup();
      }

      if (copyFromPurchaseOrder) {
        setHaltSupplierChange(true);
        selectSupplier(copyFromPurchaseOrder.SupplierID);
      }
    } else {

      if (externalModule) {
        externalPurchaseOrderEditSetup();
      } else {
        purchaseOrderEditSetup();
      }

      fetchMessages();
      getOptionButtons();
      getCounts();
      getEmployeeLogin();
    }

    getIntegration();
    prepareOrderNow();
    fetchComments();
    featureService.getFeature(constants.features.STOCK_CONTROL).then(feature => {
      setHasStockControl(!!feature);
    });
    featureService.getFeature(constants.features.PO_GRV).then(feature => {
      setHasPOGRV(!!feature);
    });
    featureService.getFeature(constants.features.VAN_STOCK).then(feature => {
      setHasVanStock(!!feature);
    });

    userConfigService.getCrudSettings(Enums.ConfigurationSection.PurchaseOrder).then(config => {
      setCrudConfig(config);
    });
  }, []);

  // PURCHASE ORDER FROM QUOTE

  const [quote, setQuote] = useState();

  const getLinkedQuote = async (id) => {
    let quoteResult = await Fetch.get({
      url: `/Quote/${id}`
    });
    setQuote(quoteResult);
    preventNextEmployeeClearOnStoreChangeRef.current = true
    return quoteResult;
  };

  const getInventory = async (id) => {
    let inventoryResult = await Fetch.get({
      url: `/Inventory?id=${id}`
    });
    return inventoryResult;
  };

  const getQuoteItems = async () => {
    if (quote.QuoteItems && quote.QuoteItems.length > 0) {
      let items = [];
      for (let item of quote.QuoteItems.filter(x => x.QuoteItemType == Enums.QuoteItemType.Inventory)) {
        let unitPriceExclusive = 0;
        let lineTotalExclusive = 0;
        let applicableInventory = true;
        if (item.QuoteItemType == Enums.QuoteItemType.Inventory) {
          if (!!item.UnitCostPrice) {
            unitPriceExclusive = item.UnitCostPrice;
          }
          else {
            let inventory = await getInventory(item.InventoryID);
            // applicableInventory = inventory.StockItemType === Enums.StockItemType.Part || inventory.StockItemType === Enums.StockItemType.Product;
            unitPriceExclusive = inventory.CostPrice;
          }
          lineTotalExclusive = unitPriceExclusive * item.Quantity;
        }

        if (applicableInventory) {
          items.push({
            'ItemType': item.QuoteItemType,
            'Description': item.Description,
            'Inventory': item.Inventory,
            'InventoryID': item.InventoryID,
            'InventoryCode': item.InventoryCode,
            'InventoryDescription': item.InventoryDescription,
            'InventoryActive': item.InventoryActive,
            'Quantity': item.Quantity,
            'UnitPriceExclusive': unitPriceExclusive,
            'TaxPercentage': item.TaxPercentage,
            'LineDiscountPercentage': 0,
            'LineTotalExclusive': lineTotalExclusive,
            'LineNumber': item.LineNumber,
            'Integrated': item.Integrated,
            'SyncStatus': item.SyncStatus,
            'IntegrationMessage': item.IntergrationMessage,
            'IsActive': true,
          });
        }
      }
      setPurchaseOrderItems(Helper.sortObjectArray(items, 'LineNumber'));
    }
  };

  useEffect(() => {
    if (quote) {

      getQuoteItems();

      updatePurchaseOrderBulk(null, null, [{
        key: 'Reference',
        value: quote.Reference,
      }, {
        key: "DiscountPercentage",
        value: quote.DiscountPercentage,
      }], false);

      if (quote.Module == Enums.Module.JobCard) {
        getLinkedJobCard(quote.ItemID);
        setModule(Enums.Module.JobCard);
      } else if (quote.Module == Enums.Module.Query) {
        getLinkedQuery(quote.ItemID);
        setModule(Enums.Module.Query);
      } else if (quote.Module == Enums.Module.Project) {
        getLinkedProject(quote.ItemID);
        setModule(Enums.Module.Project);
        if (rootModule && rootModule == Enums.Module.Project) {
          setProjectLinkLockdown(true);
          setShowJobLink(false);
          setShowQueryLink(false);
        }
      }
      setItemID(quote.ItemID);

      if (quote.Employee) {
        setSelectedEmployee(quote.Employee);
      }


      if (quote.Store) {
        preventNextEmployeeClearOnStoreChangeRef.current = true
        setSelectedStore(quote.Store);
      }
    }
  }, [quote]);

  // OPTION BUTTONS

  const [optionButtons, setOptionButtons] = useState([]);

  const getOptionButtons = (status = purchaseOrder.PurchaseOrderStatus) => {
    let buttons = ([
      { text: 'Copy Purchase Order', link: `CopyPurchaseOrder` },
      { text: 'New Purchase Order', link: `NewPurchaseOrder` },
    ]);

    if (selectedJob && jobPermission) {
      buttons.push({ text: 'Open Job', link: `OpenJob` });
    }

    if (selectedQuery && queryPermission) {
      buttons.push({ text: 'Open Query', link: `OpenQuery` });
    }

    if (Helper.isNullOrUndefined(selectedJob) && Helper.isNullOrUndefined(selectedQuery)) {
      if (jobPermission)
        buttons.push({ text: 'Create Job', link: `CreateJob` });
      if (queryPermission)
        buttons.push({ text: 'Create Query', link: `CreateQuery` });
    }

    if (inventoryPermission) {
      buttons.push({ text: 'Open Supplier', link: `OpenSupplier` });
    }



    if (status == Enums.PurchaseOrderStatus.Approved || status == Enums.PurchaseOrderStatus.Billed) {
      if (purchaseOrderRevertPermission) {
        if (!integration || purchaseOrder.PurchaseOrderSyncStatus == Enums.SyncStatus.Never
          || purchaseOrder.PurchaseOrderSyncStatus == Enums.SyncStatus.Failed
          || purchaseOrder.PurchaseOrderSyncStatus == Enums.SyncStatus.NotSyncable) {
          let isDisabled = totalGRVs > 0;
          buttons.push({ text: 'Revert to Draft', link: `RevertToDraft`, disabled: isDisabled, tooltip: isDisabled && "Cannot revert as items have been received in a GRV" });
        }
      }
    }

    //if (status == Enums.PurchaseOrderStatus.Approved) {
    buttons.push({ text: 'Update to Billed', link: 'UpdateToBilled' },
      { text: 'Cancel Purchase Order', link: 'UpdateToCancelled' });
    //}

    if (hasPOGRV) {
      buttons.push({
        text: 'Preferences', link: `EditPreferences`
      });
    }

    setOptionButtons(buttons);
  };

  const createGRV = async () => {
    let st = await stockTransactionService.getDraftStockTransactionForPurchaseOrder(purchaseOrder.ID);
    if (st) {
      setShowStockTransactionDrawer({ show: true, stockTransaction: st });
    }
    else {
      setShowStockTransactionDrawer({ show: true, stockTransaction: null });
    }
  }

  const optionsClick = async (link) => {

    let routeChange = true;
    if (formIsDirty) {
      routeChange = await savePurchaseOrder(purchaseOrder.PurchaseOrderStatus, routeChange);
    }

    if (routeChange) {
      switch (link) {
        case 'CopyPurchaseOrder':
          Helper.nextRouter(Router.push, `/purchase/create?id=${purchaseOrder.ID}`);
          break;
        case 'NewPurchaseOrder':
          Helper.nextRouter(Router.push, '/purchase/create');
          break;
        case 'CreateJob':
          Helper.nextRouter(Router.push, `/job/create?module=${Enums.Module.PurchaseOrder}&moduleID=${purchaseOrder.ID}`);
          break;
        case 'CreateQuery':
          Helper.nextRouter(Router.push, `/query/create`);
          break;
        case 'OpenJob':
          Helper.nextRouter(Router.push, `/job/[id]`, `/job/${selectedJob.ID}`);
          break;
        case 'OpenQuery':
          Helper.nextRouter(Router.push, `/query/[id]`, `/query/${selectedQuery.ID}`);
          break;
        case 'OpenSupplier':
          Helper.nextRouter(Router.push, `/supplier/[id]`, `/supplier/${selectedSupplier.ID}`);
          break;
        case 'CreateGRV':
          await createGRV();
          break;
        case 'QuickGRV':
          confirmQuickGRV();
          break;
        case 'UpdateToBilled':
          confirmChangeStatus('Are you sure you want to mark this purchase order as billed?', Enums.PurchaseOrderStatus.Billed);
          break;
        case 'UpdateToCancelled':
          confirmChangeStatus('Are you sure you want to cancel this purchase order?', Enums.PurchaseOrderStatus.Cancelled);
          break;
        case 'RevertToDraft':
          revertToDraft();
          break;
        case 'EditPreferences':
          setShowPreferencesModal(true);
          break;
      }
    }
  };

  const revertToDraft = async () => {
    confirmRevert();
  };

  const confirmRevert = async () => {
    setConfirmOptions({
      display: true,
      heading: "Confirm",
      text: `Are you sure you want to revert this purchase order?`,
      confirmButtonText: "Confirm",
      showCancel: true,
      onConfirm: async () => {
        const result = await Fetch.post({
          url: `/PurchaseOrder/PurchaseOrderToDraft?purchaseorderid=${purchaseOrder.ID}`,
          toastCtx: toast
        });
        if (result.ID) {
          setPurchaseOrder(result);
          getOptionButtons(result.PurchaseOrderStatus);
          toast.setToast({
            message: 'Purchase order reverted successfully',
            show: true,
            type: 'success'
          });
        }
      }
    });
  };

  // JOB CARD LINK

  const [showJobLink, setShowJobLink] = useState(isNew);
  const [jobLinkLockdown, setJobLinkLockdown] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);

  const getLinkedJobCard = async (id) => {
    let job = await Fetch.get({
      url: `/Job/${id}`,
      caller: "components/purchase/manage.js:getLinkedJobCard()"
    });
    setSelectedJob(job);
    return job;
  };

  const linkPurchaseOrderToJob = (job) => {
    setFormIsDirty(true);
    setSelectedJob(job);
    if (job) {
      setModule(Enums.Module.JobCard);
      setItemID(job.ID);
      setSelectedQuery(null);
      if (!!job.Location && Helper.isNullOrWhitespace(purchaseOrder.DeliveryAddress)) {
        updatePurchaseOrder('DeliveryAddress', job.Location.LocationDisplay);
      }
      if (!externalModule) {
        setShowProjectLink(false);
        setShowQueryLink(false);
      }
    } else {
      if (selectedSupplier) {
        setModule(Enums.Module.Supplier);
        setItemID(selectedSupplier.ID);
      }
      if (!externalModule) {
        setShowProjectLink(true);
        setShowQueryLink(true);
        setProjectLinkLockdown(false);
        setQueryLinkLockdown(false);
      }
    }
  };

  // QUERY LINK

  const [showQueryLink, setShowQueryLink] = useState(isNew);
  const [queryLinkLockdown, setQueryLinkLockdown] = useState(false);
  const [selectedQuery, setSelectedQuery] = useState(null);

  const getLinkedQuery = async (id) => {
    let query = await Fetch.get({
      url: `/Query/${id}`,
      caller: "components/purchase/manage.js:getLinkedQuery()"
    });
    setSelectedQuery(query);
    return query;
  };

  const linkPurchaseOrderToQuery = (query) => {
    setSelectedQuery(query);
    if (query) {
      setModule(Enums.Module.Query);
      setItemID(query.ID);
      setSelectedJob(null);
      if (!externalModule) {
        setShowProjectLink(false);
        setShowJobLink(false);
      }
    } else {
      if (selectedSupplier) {
        setModule(Enums.Module.Supplier);
        setItemID(selectedSupplier.ID);
      }
      if (!externalModule) {
        setShowProjectLink(true);
        setShowJobLink(true);
        setProjectLinkLockdown(false);
        setJobLinkLockdown(false);
      }
    }
  };

  // PROJECT LINK

  const [selectedProject, setSelectedProject] = useState(null);
  const [showProjectLink, setShowProjectLink] = useState(isNew);
  const [projectLinkLockdown, setProjectLinkLockdown] = useState(false);

  const getLinkedProject = async (id) => {
    let project = await Fetch.get({
      url: `/Project/${id}`
    });
    setSelectedProject(project);
    return project;
  };

  const linkPurchaseOrderToProject = (project) => {
    setSelectedProject(project);
    if (project) {
      setModule(Enums.Module.Project);
      setItemID(project.ID);
      if (!externalModule) {
        setShowJobLink(false);
        setShowQueryLink(false);
      }
    } else {
      if (selectedSupplier) {
        setModule(Enums.Module.Supplier);
        setItemID(selectedSupplier.ID);
      }
      if (!externalModule) {
        setShowJobLink(true);
        setShowQueryLink(true);
        setJobLinkLockdown(false);
        setQueryLinkLockdown(false);
      }
    }
  };



  // COMPANY

  const company = props.company;
  const currencySymbol = company.Currency ? company.Currency.Symbol : '';

  const logoRef = useRef();
  const [logo, setLogo] = useState();

  useEffect(() => {
    if (company.LogoExists) {
      setLogo(company.LogoUrl);
    } else {
      setShowHeaderContents(true);
    }
  }, [company]);

  // STORES

  const [searching, setSearching] = useState(false);
  const [isMultiStore, setIsMultiStore] = useState(false);
  const [stores, setStores] = useState([]);
  const [storesTotalResults, setStoresTotalResults] = useState();
  const [storeSearch, setStoreSearch] = useState('');
  const [selectedStore, setSelectedStore] = useState();

  const getStore = async () => {
    const storesResult = await Fetch.get({
      url: `/Store/GetEmployeeStores?employeeID=${Storage.getCookie(Enums.Cookie.employeeID)}&searchPhrase=${storeSearch}`,
    });
    setIsMultiStore(storesResult.TotalResults > 1);

    if (storesResult.TotalResults > 1) {
      // set store from purchase order
      if (!isNew && !Helper.isNullOrUndefined(purchaseOrder.StoreID)) {
        const storeResult = await Fetch.get({
          url: `/Store/${purchaseOrder.StoreID}`,
        });
        preventNextEmployeeClearOnStoreChangeRef.current = !!copyFromPurchaseOrder
        setSelectedStore(storeResult);
      }
    } else {
      preventNextEmployeeClearOnStoreChangeRef.current = !!copyFromPurchaseOrder
      setSelectedStore(storesResult.Results ? storesResult.Results[0] : null);
    }
  };

  const searchStores = async () => {
    setSearching(true);
    const storesResult = await Fetch.get({
      url: `/Store/GetEmployeeStores?employeeID=${Storage.getCookie(Enums.Cookie.employeeID)}&searchPhrase=${storeSearch}`,
    });
    setStores(storesResult.Results);
    setStoresTotalResults(storesResult.TotalResults);
    setSearching(false);
  };

  const handleStoreChange = (e) => {
    setStoreSearch(e.target.value);
    setFormIsDirty(true);
  };

  // COMMUNICATIONS

  const [messages, setMessages] = useState([]);

  const fetchMessages = async () => {
    if (messages.length == 0) {
      const messagesRes = await Fetch.post({
        url: '/Message/GetMessages',
        params: {
          ItemId: purchaseOrder.ID,
          pageIndex: 0,
          pageSize: 5
        }
      });
      setMessages(messagesRes.Results);
    }
  };

  // COMMENTS  

  // const [commentsPage, setCommentsPage] = useState(0);
  // const [canLoadMoreComments, setCanLoadMoreComments] = useState(props.totalComments > 5);

  // const loadMoreComments = () => {
  //   setCommentsPage(commentsPage + 1);
  //   fetchComments(comments, commentsPage + 1)
  // };

  // const handleCommentChange = (e) => {
  //   setNewComment(e.target.value);
  // };

  // const [newComment, setNewComment] = useState('');

  // const submitComment = async () => {
  //   if (newComment.length != 0) {
  //     await Fetch.post({
  //       url: '/Comment',
  //       params: {
  //         ItemID: purchaseOrder.ID,
  //         CommentText: newComment,
  //         Module: Enums.Module.PurchaseOrder,
  //         StoreID: purchaseOrder.StoreID
  //       }
  //     });
  //     setCommentsPage(0);
  //     fetchComments();
  //     setNewComment('');
  //   }
  // };

  // const [submittingComment, setSubmittingComment] = useState(false);

  // const saveComment = () => {
  //   if (props.accessStatus === Enums.AccessStatus.LockedWithAccess || props.accessStatus === Enums.AccessStatus.LockedWithOutAccess) {
  //     return;
  //   }
  //   setSubmittingComment(true);
  //   submitComment();
  //   setSubmittingComment(false);
  // };

  const fetchComments = async () => {
    // const request = await Fetch.post({
    //   url: '/Comment/GetComments',
    //   params: {
    //     ItemId: purchaseOrder.ID,
    //     PageIndex: page ? page : 0,
    //     PageSize: 5
    //   }
    // });

    if (props.isNew) return;

    const request = await CommentService.getComments(purchaseOrder.ID, 0, 10);

    setTotalComments(request.TotalResults);

    //   let newComments = [];
    //   if (currentComments) {
    //     if (page != commentsPage) {
    //       newComments.push(...currentComments);
    //     }
    //   }

    //   newComments.push(...request.Results);
    //   setComments(newComments);

    //   if (request.ReturnedResults < 5) {
    //     setCanLoadMoreComments(false);
    //   } else if (newComments.length == request.TotalResults) {
    //     setCanLoadMoreComments(false);
    //   } else {
    //     setCanLoadMoreComments(true);
    //   }
  };

  // CONTACT

  const [contacts, setContacts] = useState([]);
  const [contactSearch, setContactSearch] = useState('');
  const [selectedContact, setSelectedContact] = useState(isNew ? undefined : purchaseOrder.SupplierContact ? purchaseOrder.SupplierContact : undefined);

  const searchContacts = async () => {
    const request = await Fetch.post({
      url: `/SupplierContact/GetContacts`,
      params: {
        pageSize: 100,
        pageIndex: 0,
        searchPhrase: contactSearch,
        sortExpression: "",
        sortDirection: "",
        isActive: true,
        supplierID: selectedSupplier ? selectedSupplier.ID : null,
      },
      toastCtx: toast
    });

    let results = request.Results;

    if (oldSupplierRef.current != selectedSupplier) {
      if (results.length > 0) {
        setSelectedContact(results.filter(x => x.IsPrimary)[0] || results[0]);
      } else {
        setSelectedContact(undefined);
      }
      oldSupplierRef.current = selectedSupplier;
    }

    setContacts(results);
  };

  const [changedContact, setChangedContact] = useState(undefined);

  const changeSupplierContact = async (contact = null) => {
    await searchContacts();

    let resultContact = selectedContact ? selectedContact : contact;
    if (resultContact) {
      setChangedContact(resultContact);
    }
  };

  const changeContact = (contact) => {
    if (contact && contact.IsActive) {
      setSelectedContact(contact);
    }
    setChangedContact(undefined);
  };

  const [showManageContact, setShowManageContact] = useState(false);

  const addNewSupplierContact = () => {
    if (contacts && contacts.length > 0) {
      changeSupplierContact(contacts[0]);
    } else {
      setShowManageContact(true);
    }
  };

  const onContactCreate = (contact) => {
    setContacts([...contacts, contact]);
    setSelectedContact(contact);

    setShowManageContact(false);
  };

  // LOCATION

  const [selectedLocation, setSelectedLocation] = useState(isNew ? {} : purchaseOrder.Location ? purchaseOrder.Location : {});

  // SUPPLIER

  const [selectedSupplier, setSelectedSupplier] = useState(isNew ? null : purchaseOrder.Supplier);
  const oldSupplierRef = useRef(isNew ? null : purchaseOrder.Supplier);
  const [showAddSupplier, setShowAddSupplier] = useState(isNew);
  const [defaultView, setDefaultView] = useState(isNew);
  const [supplierToEdit, setSupplierToEdit] = useState(null);

  const selectSupplier = async (supplierID) => {
    if (supplierID) {
      const supplierResponse = await Fetch.get({
        url: `/Supplier/${supplierID}`,
      });
      setSelectedSupplier(supplierResponse);
      setPurchaseOrder(po => ({ ...po, SupplierID: supplierID }));
      setShowAddSupplier(false);
      setDefaultView(true);
    } else {
      if (selectedSupplier) {
        setShowAddSupplier(false);
        setPurchaseOrder(po => ({ ...po, SupplierID: selectedSupplier?.ID }));
      } else {
        setShowAddSupplier(true);
      }
    }
    setFormIsDirty(true);
  };

  const editSupplier = () => {
    if (selectedSupplier) {
      setSupplierToEdit(selectedSupplier);
    }
  };

  /*const onSupplierSave = (supplier) => {
    if (supplier) {
      setSelectedSupplier(supplier);
      toast.setToast({
        message: 'Supplier saved successfully',
        show: true,
        type: Enums.ToastType.success,
      });
    }

    setSupplierToEdit(null);
  };*/

  const changeSupplier = () => {
    ignoreSupplierOutsideClick.current = true;
    setShowAddSupplier(true);
    setDefaultView(false);
    setFormIsDirty(true);
    setHaltSupplierChange(false);
  };

  useEffect(() => {
    searchContacts();
  }, [selectedSupplier]);

  // STATUS

  const approvePurchaseOrderClick = () => {
    const changes = detectInventoryPriceChanges(purchaseOrderItems, 'PurchaseOrder', costingPermission);
    if (changes.items.length > 0 && inventoryPermission && costingPermission) {
      setInventoryPriceChanges(changes);
      setPendingSaveParams({ status: Enums.PurchaseOrderStatus.Approved, routeChange: false, overrideDeliveryDate: null, performMergeChecks: true });
      setConfirmOptions({
        display: true,
        heading: "Confirm",
        text: 'Are you sure you want to approve this purchase order?',
        confirmButtonText: "Approve and update pricing",
        showCancel: true,
        showDiscard: true,
        discardButtonText: "Approve order",
        onConfirm: async () => {
          setShowUpdateInventoryModal(true);
        },
        onDiscard: async () => {
          statusChangeConfirmed(Enums.PurchaseOrderStatus.Approved);
        }
      });
    } else {
      confirmChangeStatus('Are you sure you want to approve this purchase order?', Enums.PurchaseOrderStatus.Approved);
    }
  };

  const statusChangeConfirmed = (status) => {
    savePurchaseOrder(status, false, null, status === Enums.PurchaseOrderStatus.Approved);
    getOptionButtons(status);
  };

  const confirmQuickGRV = () => {

    // if (Math.random() < 0.5) {
      setShowQuickGRV(true);
    // }
    // else {
    //   setConfirmOptions({
    //     display: true,
    //     heading: "Confirm Quick Receive (GRV)",
    //     text: `ServCraft will automatically create and complete a GRV for all outstanding materials in this purchase order`,
    //     confirmButtonText: "Confirm",
    //     showCancel: true,
    //     onConfirm: async () => {
    //       onConfirmQuickGRV({ warehouseID: null });
    //     }
    //   });
    // }
  }

  const onConfirmQuickGRV = (warehouseID = null) => {
    quickGRV(warehouseID);
  }

  const quickGRV = async (warehouseID) => {
    if (formIsDirty) {
      let saveResult = await savePurchaseOrder();
      if (!saveResult) return;
    }

    setSaving(true);
    setReceiving(true);

    let result = await purchaseOrderService.quickGRVFromPurchaseOrder(purchaseOrder.ID, toast, warehouseID);

    setSaving(false);
    setReceiving(false);

    if (result.ID) {
      toast.setToast({
        message: 'Purchase order is now fully received',
        show: true,
        type: Enums.ToastType.success
      });

      await Helper.waitABit();
      setPurchaseOrder(result);
      setPurchaseOrderItems(result.PurchaseOrderItems);
      getCounts();

      setRefreshStockTransactionToggle(p => !p);
    }
  };

  const confirmChangeStatus = async (text, status) => {
    setConfirmOptions({
      display: true,
      heading: "Confirm",
      text: `${text}`,
      confirmButtonText: "Confirm",
      showCancel: true,
      onConfirm: async () => {
        statusChangeConfirmed(status);
      }
    });
  };

  // ITEMS

  const [purchaseOrderItems, setPurchaseOrderItems] = useState(isNew ? copyFromPurchaseOrder ? copyFromPurchaseOrder.PurchaseOrderItems : [] : purchaseOrder.PurchaseOrderItems);
  const [originalItems, setOriginalItems] = useState([]);
  const [showUpdateInventoryModal, setShowUpdateInventoryModal] = useState(false);
  const [inventoryPriceChanges, setInventoryPriceChanges] = useState(null);
  const [pendingSaveParams, setPendingSaveParams] = useState(null);

  useEffect(() => {
    if (purchaseOrderItems) {
      setOriginalItems(prev => {
        const newOriginals = [...prev];
        let changed = false;
        purchaseOrderItems.forEach(item => {
          if (!newOriginals.find(oi => oi.ID === item.ID)) {
            newOriginals.push(JSON.parse(JSON.stringify(item)));
            changed = true;
          }
        });
        return changed ? newOriginals : prev;
      });
    }
  }, [purchaseOrderItems]);


  const getTotals = (overrideTaxPercentage = false, items) => {
    let subTotalExclusive = 0;
    let totalTax = 0;
    let totalExclusive = 0;

    if ((items || purchaseOrderItems).length > 0) {
      (items || purchaseOrderItems).forEach((item) => {
        if (item.ItemType == Enums.ItemType.Inventory) {
          subTotalExclusive += Helper.roundToTwo(parseFloat(item.LineTotalExclusive));
          if (item.TaxPercentage > 0) {
            if (overrideTaxPercentage) {
              totalTax += Helper.roundToTwo(parseFloat(item.LineTotalExclusive * company.TaxPercentage * (1 - purchaseOrder.DiscountPercentage / 100)));
            } else {
              totalTax += Helper.roundToTwo(parseFloat(item.LineTotalExclusive * item.TaxPercentage / 100 * (1 - purchaseOrder.DiscountPercentage / 100)));
            }
          }
        }
      });

      totalExclusive = Helper.roundToTwo(parseFloat((subTotalExclusive * (1 - purchaseOrder.DiscountPercentage / 100))));
    }

    return { 'subTotalExclusive': subTotalExclusive, 'totalTax': totalTax, 'totalExclusive': totalExclusive };
  };

  const fullyReceived = () => {
    return purchaseOrderItems.filter(x => Helper.isInventoryWarehoused(x.Inventory)).every(x => x.Quantity <= x.QuantityReceived);
  };

  const suppressUpdateItemTotalsDirty = useRef(false);
  const [afterFirstLoad, setAfterFirstLoad] = useState(false);

  const updateItemTotals = (items = null) => {

    let suppressDirty = suppressUpdateItemTotalsDirty.current;
    suppressUpdateItemTotalsDirty.current = false;

    let { subTotalExclusive, totalTax, totalExclusive } = getTotals(false, items);

    updatePurchaseOrderBulk(null, null, [{
      key: 'SubTotalExclusive',
      value: Helper.roundToTwo(subTotalExclusive)
    }, {
      key: "TotalExclusive",
      value: Helper.roundToTwo(totalExclusive)
    }, {
      key: "TotalTax",
      value: Helper.roundToTwo(totalTax)
    }, {
      key: "TotalInclusive",
      // value: Helper.roundToTwo(totalExclusive + totalTax)
      value: Helper.roundToTwo(totalExclusive) + Helper.roundToTwo(totalTax)
    }], afterFirstLoad && !suppressDirty);
    setAfterFirstLoad(true);
  };

  const updatePurchaseOrderItems = (items) => {
    setPurchaseOrderItems([...items]);
    updateItemTotals(items);
    setFormIsDirty(true);
  };

  useEffect(() => {
    suppressUpdateItemTotalsDirty.current = true;
    updateItemTotals();
  }, [purchaseOrder?.DiscountPercentage, purchaseOrderItems]);

  useEffect(() => {
    if (quoteItemsCopied) {
      updateItemTotals();
      setQuoteItemsCopied(false);
    }
  }, [quoteItemsCopied]);

  // EMPLOYEE

  const [selectedEmployee, setSelectedEmployee] = useState(isNew ? copyFromPurchaseOrder ? copyFromPurchaseOrder.Employee : null : purchaseOrder.Employee);
  const assignEmployee = (employee) => {
    setSelectedEmployee(employee);
    setFormIsDirty(true);
  };

  const [employeeLogin, setEmployeeLogin] = useState();

  const getEmployeeLogin = async () => {
    const userResult = await Fetch.get({
      url: `/Employee?id=${Storage.getCookie(Enums.Cookie.employeeID)}`,
    });
    setEmployeeLogin(userResult);
  };

  // HEADER ACCORDION

  const headerAccordionBodyRef = useRef(null);
  const [headerHeight, setHeaderHeight] = useState('0px');
  const [headerChevron, setHeaderChevron] = useState('');
  const [showHeaderContents, setShowHeaderContents] = useState(false);

  const toggleHeaderAccordion = async () => {
    await Helper.waitABit();
    setShowHeaderContents(!showHeaderContents);
  };

  useEffect(() => {
    setHeaderHeight(showHeaderContents ? `${headerAccordionBodyRef.current ? headerAccordionBodyRef.current.scrollHeight + 5 : 0}px` : `0px`);
    setHeaderChevron(showHeaderContents ? `accordion-header-img-flipped` : ``);
  }, [showHeaderContents, selectedStore]);


  const preventNextEmployeeClearOnStoreChangeRef = useRef(false);

  useDidUpdate(() => {
    if (isNew && selectedStore && !Helper.isNullOrUndefined(selectedStore)) {
      setStoreSearch(selectedStore.Name);
    }

    if (selectedEmployee && !Helper.isEmptyObject(selectedEmployee) && isNew && !preventNextEmployeeClearOnStoreChangeRef.current) {
      setSelectedEmployee(null);
      toast.setToast({
        message: 'Employee has been cleared',
        show: true,
        type: Enums.ToastType.success
      });
    }

    preventNextEmployeeClearOnStoreChangeRef.current = false;
  }, [selectedStore]);

  // DETAILS ACCORDION

  const detailsAccordionBodyRef = useRef(null);
  const [detailsHeight, setDetailsHeight] = useState('0px');
  const [detailsChevron, setDetailsChevron] = useState('');
  const [showDetailContents, setShowDetailContents] = useState(isNew);
  const [detailsOpened, setDetailsOpened] = useState(isNew);

  const toggleDetailsAccordion = async () => {
    await Helper.waitABit();
    setShowDetailContents(!showDetailContents);
    setDetailsOpened(!detailsOpened);
  };

  useEffect(() => {
    setDetailsHeight(showDetailContents ? `${detailsAccordionBodyRef.current ? detailsAccordionBodyRef.current.scrollHeight + 65 : 0}px` : `0px`);
    setDetailsChevron(showDetailContents ? `accordion-header-img-flipped` : ``);
  }, [showDetailContents, purchaseOrderItems.length, selectedSupplier, selectedStore, showAddSupplier, showJobLink, showQueryLink, showProjectLink]);

  const [saving, setSaving] = useState(false);
  const [receiving, setReceiving] = useState(false);

  const validate = (ignoreDeliveryDate) => {
    let inputs = [
      { key: 'DiscountPercentage', value: purchaseOrder.DiscountPercentage, btw: [0, 100], type: Enums.ControlType.Number },
      { key: 'SupplierID', value: selectedSupplier, required: true, type: Enums.ControlType.Custom },
      { key: 'Date', value: purchaseOrder.Date, required: true, type: Enums.ControlType.Date },
      { key: 'DeliveryDate', value: purchaseOrder.DeliveryDate, required: !ignoreDeliveryDate, type: Enums.ControlType.Date },
      { key: 'DeliveryDate', value: purchaseOrder.DeliveryDate, type: Enums.ControlType.Date, gte: purchaseOrder.Date, df: 'yyyy-MM-dd' },
    ];

    if (isMultiStore && isNew) {
      inputs = [...inputs,
      { key: 'Store', value: selectedStore, required: true, type: Enums.ControlType.Select }
      ];
    }

    let { isValid, errors } = Helper.validateInputs(inputs);

    if (!Helper.isNullOrWhitespace(purchaseOrder.DeliveryAddress)) {
      let addressLines = purchaseOrder.DeliveryAddress.split("\n").filter(x => !Helper.isNullOrWhitespace(x));
      if (addressLines.length > ADDRESS_LINE_LIMIT) {
        errors["DeliveryAddress"] = `You can only have up to ${ADDRESS_LINE_LIMIT} address lines`;
        isValid = false;
      } else {
        errors["DeliveryAddress"] = null;
      }
    }

    setInputErrors(errors);

    return isValid;
  };

  useEffect(() => {
    getOptionButtons();
  }, [selectedJob, selectedQuery, integration, hasStockControl, purchaseOrder, purchaseOrderItems, totalGRVs]);

  const checkForLinkedJobMaterials = async () => {
    return new Promise((resolve, reject) => {

      let canContinue = true;

      if (!!selectedJob) {
        setConfirmOptions({
          ...Helper.initialiseConfirmOptions(),
          display: true,

        });
      }
      else {
        resolve(canContinue);
      }
    });
  }

  const compareJobInventory = async (purchaseToSave, purchaseItemsToSave) => {
    return new Promise(async (resolve, reject) => {
      let output = {
        continue: false,
        merge: false,
        add: false,
        ignore: false
      };

      if (!purchaseToSave.ItemID || purchaseToSave.Module !== Enums.Module.JobCard) {
        output.continue = true;
        resolve(output);
        return;
      }

      let result = await purchaseOrderService.compareJobInventory(purchaseToSave, purchaseItemsToSave, toast);

      //{Message: '', Success: true, CanAdd: false, CanMerge: false}



      if (!result.Success) {
        toast.setToast({
          message: result.Message,
          show: true,
          type: Enums.ToastType.error,
        });
        resolve(output);
        return;
      }

      output.continue = true;

      if (!result.CanAdd && !result.CanMerge && !result.CanIgnore) {
        resolve(output);
        return;
      }

      // TODO replace

      setMergeItemsModalOptions({
        canAdd: result.CanAdd,
        canIgnore: result.CanIgnore,
        canMerge: result.CanMerge,
        onAdd: () => {
          output.add = true;
          setMergeItemsModalOptions({
            ...mergeItemsModalOptions,
            show: false
          });
          resolve(output);
        },
        onMerge: () => {
          output.merge = true;
          setMergeItemsModalOptions({
            ...mergeItemsModalOptions,
            show: false
          });
          resolve(output);
        },
        onIgnore: (remember) => {
          output.ignore = true;
          setMergeItemsModalOptions({
            ...mergeItemsModalOptions,
            show: false
          });

          if (remember) {
            let crudConfigToSave = JSON.parse(JSON.stringify(crudConfig));
            userConfigService.setMetaDataValue(crudConfigToSave, "compareJobInventoryOnApprove", false);
            userConfigService.saveConfig(crudConfigToSave);
            setCrudConfig(crudConfigToSave);
          }

          resolve(output);
        },
        onCancel: () => {
          output.continue = false;
          setMergeItemsModalOptions({
            ...mergeItemsModalOptions,
            show: false
          });
          resolve(output);
        },
        show: true
      });


    });
  }

  const savePurchaseOrder = async (status, routeChange = false, overrideDeliveryDate = null, performMergeChecks = false, skipInventoryCheck = false) => {
    setSaving(true);

    let isValid = validate(!!overrideDeliveryDate);
    if (!isValid) {
      toast.setToast({
        message: 'There are errors on the page',
        show: true,
        type: Enums.ToastType.error,
      });
      setSaving(false);
      return false;
    }

    if (purchaseOrderItems.length <= 0) {
      toast.setToast({
        message: 'Please add items',
        show: true,
        type: Enums.ToastType.error,
      });
      setSaving(false);
      return false;
    }


    if (purchaseOrder.TotalInclusive < 0) {
      toast.setToast({
        message: 'Purchase order total can\'t be negative',
        show: true,
        type: Enums.ToastType.error,
      });
      setSaving(false);
      return false;
    }

    let result = {};

    // on save we may override delivery date to make it easier to create the purchase order
    let deliveryDate = overrideDeliveryDate ?? purchaseOrder.DeliveryDate;

    let purchaseOrderToSave = {
      ...purchaseOrder,
      SupplierID: selectedSupplier.ID,
      SupplierContactID: selectedContact ? selectedContact.ID : null,
      LocationID: selectedLocation ? selectedLocation.ID : null,
      EmployeeID: selectedEmployee ? selectedEmployee.ID : null,
      Supplier: selectedSupplier,
      Location: selectedLocation ? selectedLocation : null,
      Employee: selectedEmployee,
      PurchaseOrderStatus: status ? status : purchaseOrder.PurchaseOrderStatus ?? Enums.PurchaseOrderStatus.Draft,
      Module: !Helper.isNullOrUndefined(module) ? module : purchaseOrder.Module,
      ItemID: itemID ? itemID : purchaseOrder.ItemID,
      DeliveryDate: deliveryDate
    };

    if (isMultiStore && isNew) {
      purchaseOrderToSave = {
        ...purchaseOrderToSave,
        StoreID: selectedStore ? selectedStore.ID : null,
        Store: selectedStore ? selectedStore : null,
      };
    }

    if (isNew) {

      if (copyFromPurchaseOrder) {
        purchaseOrderItems.map((item, index) => {
          item.ID = null;
          item.PurchaseOrderID = null;
        });
        purchaseOrderToSave = {
          ...purchaseOrderToSave,
          ID: null,
          PurchaseOrderSentFlag: false,
          PurchaseOrderNumber: null,
          Invoiced: false,
          Locked: false,
          DeliveryStatus: Enums.DeliveryStatus.Unsent,
          IsClosed: false,
          IsArchived: false,
          IsActive: true,
          IntegrationLineID: null,
          IntegrationLineExternalDocNumber: null
        };
      }

      purchaseOrderItems.map((item, index) => {
        if (!item.TaxPercentage) {
          item.TaxPercentage = 0;
        }
      });

      let compareResult = {};
      if (hasStockControl && hasPOGRV && performMergeChecks && crudConfigMetaData.values.compareJobInventoryOnApprove) {
        compareResult = await compareJobInventory(purchaseOrderToSave, purchaseOrderItems);
        if (!compareResult.continue) {
          setSaving(false);
          return false;
        }
      }

      result = await Fetch.post({
        url: `/PurchaseOrder`,
        params: {
          PurchaseOrder: purchaseOrderToSave,
          PurchaseOrderItems: purchaseOrderItems,
          JobInventoryCompare: hasStockControl && hasPOGRV ? (compareResult.add ? "add" : compareResult.merge ? "merge" : null) : null
        },
        toastCtx: toast
      });
    } else {
      let { subTotalExclusive, totalTax, totalExclusive } = getTotals(true);
      const temp = {
        ...purchaseOrderToSave,
        SubTotalExclusive: Helper.roundToTwo(subTotalExclusive),
        TotalExclusive: Helper.roundToTwo(totalExclusive),
        TotalTax: Helper.roundToTwo(totalTax),
        // TotalInclusive: Helper.roundToTwo(totalExclusive + totalTax),
        TotalInclusive: Helper.roundToTwo(totalExclusive) + Helper.roundToTwo(totalTax),
      };

      purchaseOrderItems.map((item, index) => {
        if (item.TaxPercentage) {
          if (item.TaxPercentage > 0) {
            item.TaxPercentage = company.TaxPercentage;
          }
        } else {
          item.TaxPercentage = 0;
        }
      });

      let compareResult = {};
      if (hasStockControl && hasPOGRV && performMergeChecks && crudConfigMetaData.values.compareJobInventoryOnApprove) {
        compareResult = await compareJobInventory(temp, purchaseOrderItems);
        if (!compareResult.continue) {
          setSaving(false);
          return false;
        }
      }

      result = await Fetch.put({
        url: '/PurchaseOrder',
        params: {
          PurchaseOrder: temp,
          PurchaseOrderItems: purchaseOrderItems,
          JobInventoryCompare: hasStockControl && hasPOGRV ? (compareResult.add ? "add" : compareResult.merge ? "merge" : null) : null
        },
        toastCtx: toast
      });
    }

    if (result.ID) {

      if (isNew) {
        Helper.mixpanelTrack(Constants.mixPanelEvents.createPurchaseOrder, {
          "purchaseOrderID": result.ID
        });
      } else {
        Helper.mixpanelTrack(Constants.mixPanelEvents.editPurchaseOrder, {
          "purchaseOrderID": result.ID
        });
      }

      if (!routeChange) {
        toast.setToast({
          message: 'Purchase order saved successfully',
          show: true,
          type: Enums.ToastType.success
        });
      }

      setFormIsDirty(false);
      await Helper.waitABit();
      if (isNew) {
        Helper.nextRouter(Router.push, '/purchase/[id]', `/purchase/${result.ID}`);
      } else {
        setPurchaseOrder(result);
        suppressUpdateItemTotalsDirty.current = true;
        setPurchaseOrderItems(result.PurchaseOrderItems);
        if (result.PurchaseOrderItems) {
          setOriginalItems(JSON.parse(JSON.stringify(result.PurchaseOrderItems)));
        }
      }
    } else {
      setSaving(false);
      isValid = false;
    }


    if (!isNew) {
      setSaving(false);
    }

    return isValid;
  };

  const refreshPurchaseOrder = async () => {
    let result = await purchaseOrderService.getPurchaseOrder(purchaseOrder.ID);
    setPurchaseOrder(result);
    setPurchaseOrderItems(result.PurchaseOrderItems);
    setFormIsDirty(false);
  };

  Helper.preventRouteChange(formIsDirty, setFormIsDirty, setConfirmOptions, savePurchaseOrder);

  const [isPrinting, setIsPrinting] = useState(false);
  const exportDocument = async (mode) => {
    let proceed = true;
    if (formIsDirty) {
      proceed = await savePurchaseOrder(purchaseOrder.PurchaseOrderStatus);
    }

    if (proceed) {
      // DownloadService.downloadFile("GET", `/PurchaseOrder/GetPurchaseOrderDocument?purchaseOrderID=${purchaseOrder.ID}`, null, true, false);
      setIsPrinting(true)
      DownloadService.downloadFile("GET", `/PurchaseOrder/GetPurchaseOrderDocument?purchaseOrderID=${purchaseOrder.ID}`, null, mode === 'view', false, "", "", null, false, (() => {
        setIsPrinting(false);
      }))
    }
  };

  const sendPurchaseOrder = () => {
    Helper.nextRouter(Router.push, `/new-communication/[id]?moduleCode=${Enums.Module.PurchaseOrder}&method=email&attachPurchaseOrder=true`, `/new-communication/${purchaseOrder.ID}?moduleCode=${Enums.Module.PurchaseOrder}&method=email&attachPurchaseOrder=true`);
  };

  // Invoice to Integration Partner

  const getIntegration = async () => {
    const integrations = await Fetch.get({
      url: '/Integration'
    });

    if (integrations.TotalResults > 0) {
      let integrationList = integrations.Results;
      let temp = integrationList.find(x => x.Status == Enums.IntegrationStatus.Live && x.Type == Enums.IntegrationType.Accounting);
      if (temp) {
        setIntegration(temp);
        setIntegrationTooltip(temp.Status == Enums.IntegrationStatus.Live ? ''
          : `Purchase Order on ${Enums.getEnumStringValue(Enums.IntegrationPartner, temp.Partner)} has status of ${Enums.getEnumStringValue(Enums.IntegrationStatus, temp.Status)}`);
      }
    }
  };

  const sendToPartner = async () => {

    let inactiveInventory = purchaseOrderItems.some(x => x.ItemType == Enums.ItemType.Inventory && !x.InventoryActive);

    if (inactiveInventory) {
      toast.setToast({
        message: 'Purchase order items contains inventory that is not active',
        show: true,
        type: Enums.ToastType.error
      });
    } else {
      const result = await Fetch.post({
        url: `/PurchaseOrder/PurchaseOrderSync?purchaseOrderID=${purchaseOrder.ID}`,
        toastCtx: toast
      });
      if (result.ID) {
        toast.setToast({
          message: 'Purchase order successfully queued for sync',
          show: true,
          type: Enums.ToastType.success
        });
        setPurchaseOrder(result);
      } else {
        toast.setToast({
          message: 'Purchase order failed to sync',
          show: true,
          type: Enums.ToastType.error
        });
      }
    }
  };

  const getDeliveryDateString = (dayShift) => {
    let date = new Date();
    date.setDate(date.getDate() + dayShift);
    return Time.today(date);
  }

  const purchaseOrderDetails = () => {
    return (
      <>
        <Flex justify={'space-between'} wrap={'wrap'} gap={'sm'}>


          <div style={{ flexGrow: 1 }}>

            {isMultiStore ?

              <StoreSelector
                disabled={!isNew || (!!externalModule && !!externalModuleID)}
                error={inputErrors.Store}
                required={true}
                selectedStore={selectedStore}
                setSelectedStore={(e) => {
                  setSelectedStore(e);
                  setFormIsDirty(true);
                }}
              />

              : <></>}

            {showAddSupplier ?
              <div ref={supplierSelectRef} style={{ maxWidth: "500px" }}>
                <SupplierSelector
                  accessStatus={props.accessStatus}
                  error={inputErrors.SupplierID}
                  required={true}
                  selectedSupplier={selectedSupplier}
                  setSelectedSupplier={(e) => {
                    setSelectedSupplier(e);
                    setPurchaseOrder(po => ({ ...po, SupplierID: e?.ID }));
                    setFormIsDirty(true);
                    setShowAddSupplier(e ? false : true);
                  }}
                />
                {/* <PurchaseOrderAddSupplier defaultView={defaultView} setDefaultView={setDefaultView} selectSupplier={selectSupplier} /> */}
              </div>
              :
              <div className="supplier-container">
                <div className="supplier-header">
                  <h3>{selectedSupplier.Name}</h3>
                  {props.accessStatus !== Enums.AccessStatus.LockedWithAccess && props.accessStatus !== Enums.AccessStatus.LockedWithOutAccess && inventoryPermission ? <>
                    <img src="/icons/edit.svg" alt="edit" title="Edit supplier" onClick={editSupplier} />
                  </> : ''}
                </div>
                {isNew && !haltSupplierChange ?
                  <div className="supplier-button" onClick={changeSupplier}>
                    Change supplier
                  </div> : ''
                }
              </div>
            }

            {!showAddSupplier && selectedContact ?
              <>
                <div className="supplier-contact-container">
                  <div>
                    {selectedContact.FirstName + ' ' + selectedContact.LastName}
                  </div>
                  {selectedContact.MobileNumber && selectedContact.EmailAddress ?
                    <>
                      <div>
                        {selectedContact.MobileNumber}
                      </div>
                      <div>
                        {selectedContact.EmailAddress}
                        {props.accessStatus !== Enums.AccessStatus.LockedWithAccess && props.accessStatus !== Enums.AccessStatus.LockedWithOutAccess ? <>
                          <img src="/icons/edit.svg" alt="edit" title="Edit contact"
                            onClick={changeSupplierContact} />
                        </> : ''}
                      </div>
                    </>
                    : ''
                  }
                  {selectedContact.MobileNumber && Helper.isNullOrWhitespace(selectedContact.EmailAddress) ?
                    <div>
                      {selectedContact.MobileNumber}
                      {props.accessStatus !== Enums.AccessStatus.LockedWithAccess && props.accessStatus !== Enums.AccessStatus.LockedWithOutAccess ? <>
                        <img src="/icons/edit.svg" alt="edit" title="Edit contact"
                          onClick={changeSupplierContact} />
                      </> : ''}
                    </div> : ''
                  }
                  {selectedContact.EmailAddress && Helper.isNullOrWhitespace(selectedContact.MobileNumber) ?
                    <div>
                      {selectedContact.EmailAddress}
                      {props.accessStatus !== Enums.AccessStatus.LockedWithAccess && props.accessStatus !== Enums.AccessStatus.LockedWithOutAccess ? <>
                        <img src="/icons/edit.svg" alt="edit" title="Edit contact"
                          onClick={changeSupplierContact} />
                      </> : ''}
                    </div> : ''
                  }
                </div>
              </>
              : <>
              </>
            }

            {!showAddSupplier && !selectedContact ?
              <>
                <div className="supplier-contact-container">
                  No Contact
                  {props.accessStatus !== Enums.AccessStatus.LockedWithAccess && props.accessStatus !== Enums.AccessStatus.LockedWithOutAccess
                    ? <>
                      <img src="/icons/edit.svg" alt="edit" title="Add contact" onClick={addNewSupplierContact} />
                    </> : ''}
                </div>
              </>
              : <></>
            }

            <div >
              <SCTextArea
                label="Delivery address"
                onChange={(e) => handleDeliveryAddressChange({
                  target: {
                    name: "DeliveryAddress",
                    value: e.value,
                    e
                  }
                })}
                value={purchaseOrder.DeliveryAddress}
                error={inputErrors.DeliveryAddress}
                w={'100%'}
              />
            </div>
          </div>
          <Box w={{ base: '100%', md: 'auto' }} style={{ flexGrow: 0, maxWidth: 500 }} mr={purchaseOrder.PurchaseOrderStatus === Enums.PurchaseOrderStatus.Draft ? "60px" : "30px"} >
            {
              !company?.LogoExists &&
              <div className={'row'} style={{ padding: 10 }}>
                <Link
                  style={{ float: 'right', textDecoration: 'none' }}
                  href={'/settings/company/manage'}
                >
                  <Anchor style={{ alignItems: 'center', display: 'flex', gap: 3 }}>
                    <IconExternalLink size={18} /> Edit logo and business details in settings
                  </Anchor>
                </Link>
              </div>
            }
            <div className="row">
              <div className="column">
                <SCInput
                  label="Reference number"
                  onChange={(e) => handleInputChange({ target: { name: "Reference", value: e.value } })}
                  value={purchaseOrder.Reference}
                  error={inputErrors.Reference}
                />
              </div>
            </div>
            <div className="row">
              <div className="column right-padding">
                <SCDatePicker
                  label="Purchase date"
                  required={true}
                  onChange={(day) => handleInputChange({ target: { name: "Date", value: Time.toISOString(day) } })}
                  value={purchaseOrder.Date}
                  error={inputErrors.Date}
                />
              </div>
              <div className="column left-padding">
                <SCDatePicker
                  label="Delivery date"
                  required={true}
                  onChange={(day) => handleInputChange({
                    target: {
                      name: "DeliveryDate",
                      value: Time.toISOString(day)
                    }
                  })}
                  value={purchaseOrder.DeliveryDate}
                  error={inputErrors.DeliveryDate}
                  minDate={Time.parseDate(purchaseOrder.Date)}

                />
              </div>
            </div>
            {
              <Flex gap={'md'} mt={'lg'} justify={'space-around'}>
                {
                  showJobLink && (selectedJob || (!selectedQuery && !selectedProject)) &&
                  <LinkItem lockdown={jobLinkLockdown} customerID={/*selectedCustomer.ID*/ null}
                    setSelected={linkPurchaseOrderToJob}
                    selectedItem={selectedJob} module={Enums.Module.JobCard}
                    size={{ label: 'md', actionIcon: 'sm' }}
                    storeID={selectedStore?.ID ?? purchaseOrder.StoreID}
                    customerOptional={true}
                  />
                }
                {
                  showQueryLink && (selectedQuery || (!selectedJob && !selectedProject)) &&
                  <LinkItem
                    lockdown={queryLinkLockdown} customerID={/*selectedCustomer.ID*/ null} setSelected={linkPurchaseOrderToQuery}
                    selectedItem={selectedQuery} module={Enums.Module.Query}
                    size={{ label: 'md', actionIcon: 'sm' }}
                    storeID={selectedStore?.ID ?? purchaseOrder.StoreID}
                    customerOptional={true}
                  />
                }
                {
                  showProjectLink && (selectedProject || (!selectedQuery && !selectedJob)) &&
                  <LinkItem selectedItem={selectedProject} setSelected={linkPurchaseOrderToProject}
                    customerID={/*selectedCustomer.ID*/ null}
                    lockdown={projectLinkLockdown} module={Enums.Module.Project}
                    size={{ label: 'md', actionIcon: 'sm' }}
                    storeID={selectedStore?.ID ?? purchaseOrder.StoreID}
                    customerOptional={true}
                  />
                }


              </Flex>
            }
            <div className="row">
              <div className="column">
                <EmployeeSelector
                  selectedEmployee={selectedEmployee}
                  setSelectedEmployee={assignEmployee}
                  storeID={(purchaseOrder.StoreID ? purchaseOrder.StoreID : selectedStore ? selectedStore.ID : null)}
                />
              </div>
            </div>
          </Box>

        </Flex>

        <Box mt={'sm'}>
          <PurchaseDetails itemID={itemID} module={module} purchaseOrder={purchaseOrder}
            purchaseOrderItems={purchaseOrderItems} updatePurchaseOrderItems={updatePurchaseOrderItems}
            companyTaxPercentage={company.TaxPercentage} integration={integration}
            accessStatus={props.accessStatus} />
        </Box>

        <Flex gap={'lg'} justify={'space-between'} wrap={'wrap'}>

          <Box className="column" style={{ flexGrow: 1 }} maw={800} miw={{ base: 'auto', xs: 400 }}>
            <SCTextArea
              label="Notes"
              onChange={(e) => handleInputChange({ target: { name: "Comment", value: e.value } })}
              value={purchaseOrder.Comment}
              w={'100%'}
              maw={'100%'}
            />
          </Box>
          <Box ml={'auto'} miw={340} mr={purchaseOrder.PurchaseOrderStatus === Enums.PurchaseOrderStatus.Draft ? "60px" : "30px"} >
            {isNew ? <div className="add-top-margin"></div> :
              purchaseOrder.DiscountPercentage > 0 ? <div className="row add-bottom-margin">
                <div className="column end">
                  <SCNumericInput
                    label="Total Discount %"
                    format={Enums.NumericFormat.Percentage}
                    onChange={(e) => handleInputChange({ target: { name: "DiscountPercentage", value: e.value } })}
                    required={false}
                    value={purchaseOrder.DiscountPercentage}
                    error={inputErrors.DiscountPercentage}
                  />
                </div>
              </div> : <div className="add-top-margin"></div>
            }
            <div className="row total-row">
              <div className="column">
                Subtotal Excl VAT
              </div>
              <div className="column end">
                {Helper.getCurrencyValue(purchaseOrder.SubTotalExclusive, currencySymbol)}
              </div>
            </div>

            {purchaseOrder.DiscountPercentage > 0 ?
              <div className="row total-row">
                <div className="column">
                  Discount
                </div>
                <div className="column end">
                  {Helper.getCurrencyValue(-(purchaseOrder.SubTotalExclusive - purchaseOrder.TotalExclusive), currencySymbol)}
                </div>
              </div> : ''
            }

            <div className="row total-row">
              <div className="column">
                Total Excl VAT
              </div>
              <div className="column end">
                {Helper.getCurrencyValue(purchaseOrder.TotalExclusive, currencySymbol)}
              </div>
            </div>
            <div className="row total-row">
              <div className="column">
                VAT
              </div>
              <div className="column end">
                {Helper.getCurrencyValue(purchaseOrder.TotalTax, currencySymbol)}
              </div>
            </div>
            <div className="row total-row grand-total">
              <div className="column">
                Total Incl VAT
              </div>
              <div className="column end">
                {Helper.getCurrencyValue(purchaseOrder.TotalInclusive, currencySymbol)}
              </div>
            </div>
          </Box>
        </Flex>

        <div className="row">
        </div>
        {selectedStore ?
          <div className={`row add-top-margin ${isNew ? '' : 'add-bottom-margin'}`}>
            <div className="column-fixed">
              <div className="row bank-detail">
                Bank: {selectedStore.BankName}
              </div>
              <div className="row bank-detail">
                Account Number: {selectedStore.BankAccountNumber}
              </div>
              <div className="row bank-detail">
                Branch Code: {selectedStore.BankBranchCode}
              </div>
            </div>
            <div className="column">
            </div>
          </div> : ''
        }

        {isNew ?
          <>
            <Flex justify={'end'} mt="lg" mr="60px">

              <SCSplitButton
                disabled={saving}
                items={[{
                  key: "Create",
                  label: "Create Purchase Order",
                  defaultItem: true,
                  leftSection: <IconDeviceFloppy size={19} />,
                  action: () => savePurchaseOrder(Enums.PurchaseOrderStatus.Draft)
                },
                {
                  key: "CreateAndApprove",
                  label: "Create and Approve",
                  defaultItem: false,
                  disabled: !purchaseOrderApprovePermission,
                  leftSection: <IconFileCheck size={19} color="var(--mantine-color-green-8)" />,
                  action: () => savePurchaseOrder(Enums.PurchaseOrderStatus.Approved, false, null, true),
                  title: !purchaseOrderApprovePermission ? "You must have purchase order approval permission" : undefined
                }, {
                  key: "ApproveToday",
                  label: "Approve and Deliver Today",
                  defaultItem: false,
                  disabled: !purchaseOrderApprovePermission,
                  leftSection: <IconTruckDelivery size={19} color="var(--mantine-color-green-8)" />,
                  action: () => savePurchaseOrder(Enums.PurchaseOrderStatus.Approved, false, getDeliveryDateString(0), true), //do not factor in time shift as this is user inputted date
                  title: !purchaseOrderApprovePermission ? "You must have purchase order approval permission" : undefined
                }, {
                  key: "ApproveTomorrow",
                  label: "Approve and Deliver Tomorrow",
                  defaultItem: false,
                  disabled: !purchaseOrderApprovePermission,
                  leftSection: <IconCalendar size={19} color="var(--mantine-color-green-8)" />,
                  action: () => savePurchaseOrder(Enums.PurchaseOrderStatus.Approved, false, getDeliveryDateString(1), true), //do not factor in time shift as this is user inputted date
                  title: !purchaseOrderApprovePermission ? "You must have purchase order approval permission" : undefined
                }, {
                  key: "ApproveWeek",
                  label: "Approve and Deliver in a Week",
                  defaultItem: false,
                  disabled: !purchaseOrderApprovePermission,
                  leftSection: <IconCalendar size={19} color="var(--mantine-color-green-8)" />,
                  action: () => savePurchaseOrder(Enums.PurchaseOrderStatus.Approved, false, getDeliveryDateString(7), true), //do not factor in time shift as this is user inputted date
                  title: !purchaseOrderApprovePermission ? "You must have purchase order approval permission" : undefined
                }
                ]}
              />

            </Flex>
            <Space h={50} />
          </>
          : ''
        }

        {!isNew ?
          <AuditLog recordID={purchaseOrder.ID} retriggerSearch={saving} /> : ''
        }

        {supplierToEdit &&
          <CreateNewSupplierModal
            show={!!supplierToEdit}
            onClose={() => setSupplierToEdit(null)}
            supplierCreated={
              (e) => {
                setSelectedSupplier(e);
                setSupplierToEdit(null);
              }
            }
            isNew={false}
            supplier={supplierToEdit}
          />
          // <ManageSupplier isNew={false} supplier={supplierToEdit} onSupplierSave={onSupplierSave} /> : ''
        }

        {changedContact ?
          <ChangeContact
            contacts={contacts}
            setContacts={setContacts}
            changeContact={changeContact}
            changedContact={changedContact}
            module={Enums.Module.Supplier}
            moduleData={selectedSupplier}
            accessStatus={props.accessStatus}
          /> : ''
        }

        {showManageContact ?
          <ManageContact isNew={true} contact={null} module={Enums.Module.Supplier} moduleData={selectedSupplier}
            onSave={onContactCreate} onCancel={() => setShowManageContact(false)}
            accessStatus={props.accessStatus}
          />
          : ''
        }

        <style jsx>{`
            .quote-section {
              /* border-bottom: 1px solid #E8EDF2;
              margin-bottom: 1.5rem;
              padding-bottom: 1rem;
              margin-top: 1.5rem; */
              padding-top: 0.5rem;
            }

            .edit-settings {
              align-items: center;
              color: ${colors.bluePrimary};
              cursor: pointer;
              display: flex;
              font-size: 0.875rem;
              margin-top: 1rem;
            }

            .edit-settings img {
              width: 1.3rem;
              height: auto;
              transform: rotate(180deg);
            }

            .row {
              display: flex;
              justify-content: space-between;
            }

            .end {
              align-items: flex-end;
            }

            .justify-end {
              justify-content: flex-end;
            }

            .center {
              align-items: center;
            }

            .column {
              display: flex;
              flex-direction: column;
              width: 100%;
            }

            .column-margin {
              margin-left: 24px;
            }

            .column-fixed {
              display: flex;
              flex-direction: column;
              width: 500px;
            }

            .left-padding {
              padding-left: 0.5em;
            }

            .right-padding {
              padding-right: 0.5em;
            }

            .store-container {
              display: flex;
              flex-direction: column;
              width: 100%;
              line-height: 24px;
              color: ${colors.darkPrimary};
            }

            .store-header {
              font-weight: bold;
            }

            .store-details {

            }

            .store-selection {
              display: flex;
              flex-direction: column;
              width: 320px;
              margin-bottom: 1rem;
            }

            .logo-container {
              /* margin-top: 1.5rem; */
              width: 10rem;
            }

            .logo {
              align-items: center;
              border: 1px solid ${colors.borderGrey};
              border-radius: ${layout.cardRadius};
              display: flex;
              height: 10rem;
              justify-content: center;
              object-fit: contain;
              overflow: hidden;
              position: relative;
              width: 100%;
            }

            .logo img {
              height: auto;
              max-width: 100%;
            }

            .details-section {
              /* margin-bottom: 1.5rem;
              padding-bottom: 1rem;
              margin-top: 1.5rem; */
            }

            .supplier-container {
              /* width: 35%; */
              /* line-height: 32px; */
              color: ${colors.darkPrimary};
            }

            .supplier-header {
              display: flex;
              font-weight: bold;
              margin-top: 1rem;
            }

            .supplier-header h3 {
              /* font-size: 2rem; */
              margin: 0 0 0 0;
              opacity: 0.8;
            }

            .supplier-header img {
              margin-left: 1rem;
              margin-top: 0rem;
              cursor: pointer;
            }

            .supplier-buttons {
              display: flex;
              flex-direction: row;
              line-height: 48px;
            }

            .supplier-button {
              color: ${colors.bluePrimary};
              cursor: pointer;
              margin-bottom: 0.5rem;
              width: fit-content;
            }

            .supplier-contact-container {
              line-height: 24px;
              color: ${colors.blueGrey};
              opacity: 0.8;
            }

            .supplier-contact-container img {
              /* margin-top: -1rem;
              margin-left: 1rem;
              cursor: pointer; */

              /*margin-top: -1rem;*/
              margin-left: 1rem;
              cursor: pointer;
              /* position: absolute; */
              margin-top: -8px;
              margin-bottom: -6px;
            }

            .no-location {
              color: ${colors.blueGrey};
            }

            .no-location img {
              margin-left: 1rem;
              margin-bottom: -0.3rem;
              cursor: pointer;
            }

            .total-row {
              line-height: 24px;
            }

            .grand-total {
              margin-top: 8px;
              margin-bottom: 8px;
              font-weight: bold;
            }

            .add-top-margin {
              margin-top: 1rem;
            }

            .add-bottom-margin {
              margin-bottom: 1rem;
            }

            .bank-detail {
              line-height: 24px;
            }

            .preview-button {
              width: 6rem;
              margin-right: 1rem;
            }

            .create-button {
              width: 15rem;
              margin-top: 1rem;
              margin-bottom: 1rem;
            }

            .actions {
              display: flex;
            }

            .actions :global(.button) {
              margin-left: 0.5rem;
              margin-top: 0;
              padding: 0 1rem;
              white-space: nowrap;
            }

            .status {
              width: 20rem;
              margin-top: -1rem;
            }

            .status :global(.input-container) {
              background-color: ${colors.bluePrimary};
            }

            .status :global(input) {
              color: ${colors.white};
            }

            .status :global(label) {
              color: ${colors.white};
              opacity: 0.8;
            }
          `}
        </style>
      </>
    );
  };

  const { height: toolbarHeight, ref: toolbarRef } = useElementSize()

  return (
    <div>


      <Box bg={'white'} ref={toolbarRef} pb={isNew ? 'sm' : 0}>
        <Flex justify={'apart'} w={'100%'} mt={'15px'} gap={'sm'} px={10}>
          <Flex align={'center'} >
            {isNew ?
              <Breadcrumbs currPage={{ text: 'Create Purchase Order', link: '/purchase/create', type: 'create' }} /> :
              <Breadcrumbs currPage={{ text: purchaseOrder.PurchaseOrderNumber, link: `/purchase/${purchaseOrder.ID}`, type: 'purchase-show' }} />
            }
          </Flex>
          {
            !isNew &&
            <ToolbarButtons
              buttonGroups={[
                [
                  {
                    type: 'button',
                    // disabled: true,
                    variant: 'light',
                    classNames: {
                      root: Enums.getEnumStringValue(Enums.PurchaseOrderStatusColor, purchaseOrder.PurchaseOrderStatus)
                    },
                    fw: 600,
                    // color: Enums.getEnumStringValue(Enums.InvoiceStatusColor, invoice.InvoiceStatus).toLowerCase(),
                    text: <Text fw={700} size={'md'}>{Enums.getEnumStringValue(Enums.PurchaseOrderStatus, purchaseOrder.PurchaseOrderStatus)}</Text>,
                    style: { cursor: 'default' }
                  }
                ],
                [
                  {
                    breakpoint: 1100,
                    type: 'menu',
                    icon: <IconDotsVertical />,
                    disabled: props.accessStatus === Enums.AccessStatus.LockedWithAccess || props.accessStatus === Enums.AccessStatus.LockedWithOutAccess,
                    action: optionsClick,
                    text: 'Options',
                    legacyOptions: optionButtons,
                  }
                ],
                [
                  ...(purchaseOrderReceivePermission ? [{
                    type: 'button',
                    show: (purchaseOrder.PurchaseOrderStatus === Enums.PurchaseOrderStatus.Approved || purchaseOrder.PurchaseOrderStatus === Enums.PurchaseOrderStatus.Billed) && hasStockControl && hasPOGRV,
                    disabled: props.accessStatus === Enums.AccessStatus.LockedWithAccess || props.accessStatus === Enums.AccessStatus.LockedWithOutAccess,
                    // variant: 'default',
                    text: "Receive Materials",
                    onClick: createGRV,
                    icon: <IconTruck />,
                  },
                  {
                    type: 'button',
                    show: (purchaseOrder.PurchaseOrderStatus === Enums.PurchaseOrderStatus.Approved || purchaseOrder.PurchaseOrderStatus === Enums.PurchaseOrderStatus.Billed) && hasStockControl && hasPOGRV,
                    disabled: receiving || fullyReceived() || props.accessStatus === Enums.AccessStatus.LockedWithAccess || props.accessStatus === Enums.AccessStatus.LockedWithOutAccess,
                    // variant: 'default',
                    text: receiving ? "Receiving" : "Quick Receive",
                    onClick: confirmQuickGRV,
                    icon: receiving ? <Loader size={16} /> : <IconPlayerTrackNext />,
                    tooltip: fullyReceived() ? "Purchase order is already fully received" : ""
                  }] : [])
                ],
                [
                  {
                    type: 'button',
                    show: purchaseOrder.PurchaseOrderStatus === Enums.PurchaseOrderStatus.Draft,
                    disabled: !purchaseOrderApprovePermission || props.accessStatus === Enums.AccessStatus.LockedWithAccess || props.accessStatus === Enums.AccessStatus.LockedWithOutAccess,
                    variant: 'default',
                    text: "Approve Purchase Order",
                    onClick: approvePurchaseOrderClick,
                    tooltip: !purchaseOrderApprovePermission ? "You must have purchase order approval permission" : undefined
                  }
                ],
                [
                  {
                    breakpoint: 1100,
                    type: 'custom',
                    children: [
                      <Button
                        key={'printButton'}
                        variant={'default'}
                        // disabled={isPrinting || saving}
                        onClick={() => !saving && !isPrinting && exportDocument('download')}
                        // color={'violet'}
                        leftSection={isPrinting ? <Loader size={16} /> : <IconPrinter size={18} />}
                        rightSection={
                          <ActionIcon
                            // disabled={isPrinting || saving}
                            variant={'subtle'}
                            size={'compact-sm'}
                            color={'dark.5'}
                            onClick={(e) => {
                              e.stopPropagation()
                              !saving && !isPrinting && exportDocument('view')
                            }}
                          >
                            <IconEye size={18} />
                          </ActionIcon>
                        }
                      >
                        {isPrinting ? "Printing..." : "Print"}
                      </Button>
                    ]
                  },
                  {
                    breakpoint: 1100,
                    icon: <IconSend />,
                    type: 'button',
                    disabled: !purchaseOrderApprovePermission || props.accessStatus === Enums.AccessStatus.LockedWithAccess || props.accessStatus === Enums.AccessStatus.LockedWithOutAccess,
                    text: "Send PO",
                    variant: 'default',
                    onClick: sendPurchaseOrder,
                    tooltip: !purchaseOrderApprovePermission ? "You must have purchase order approval permission" : undefined
                  },
                  {
                    show: canOrderNow && purchaseOrder.PurchaseOrderStatus === Enums.PurchaseOrderStatus.Approved,
                    breakpoint: 1100,
                    icon: <IconTruckDelivery />,
                    type: 'button',
                    disabled: props.accessStatus === Enums.AccessStatus.LockedWithAccess || props.accessStatus === Enums.AccessStatus.LockedWithOutAccess,
                    variant: 'default',
                    text: `Order Now`,
                    tooltip: 'Send order to supplier',
                    onClick: orderNow,
                  }
                ],
                ...(
                  integration && purchaseOrder.PurchaseOrderStatus !== Enums.PurchaseOrderStatus.Draft && [
                    [
                      {
                        show: purchaseOrder.PurchaseOrderSyncStatus === Enums.SyncStatus.Pending,
                        type: 'button',
                        disabled: true,
                        variant: 'default',
                        text: purchaseOrder.PurchaseOrderStatus === Enums.PurchaseOrderStatus.Cancelled ? `Cancelled` : `Pending Invoice to ${Enums.getEnumStringValue(Enums.IntegrationPartner, integration?.Partner)}`,
                      },
                      {
                        show: purchaseOrder.PurchaseOrderSyncStatus === Enums.SyncStatus.Synced,
                        type: 'button',
                        disabled: true,
                        variant: 'default',
                        text: `Synced: ${purchaseOrder.PurchaseOrderExternalDocNumber}`,
                      },
                      {
                        show: purchaseOrder.PurchaseOrderSyncStatus === Enums.SyncStatus.Deleted,
                        type: 'button',
                        disabled: true,
                        variant: 'default',
                        text: `Deleted`,
                      },
                      {
                        show: purchaseOrder.PurchaseOrderSyncStatus === Enums.SyncStatus.Failed,
                        type: 'custom',
                        children: <Box>
                          <Tooltip color={'yellow.7'} maw={300} multiline label={integrationTooltip} disabled={!integrationTooltip}
                            events={{ hover: true, focus: true, touch: true }}
                          >
                            <Button
                              disabled={props.accessStatus === Enums.AccessStatus.LockedWithAccess || props.accessStatus === Enums.AccessStatus.LockedWithOutAccess}
                              leftSection={<IconSend />}
                              rightSection={<Box style={{ cursor: 'help' }}>
                                {/*<HelpDialog position="bottom" message={`${purchaseOrder.PurchaseOrderSyncMessage}`} width={175}*/}
                                <AlertIcon message={purchaseOrder.PurchaseOrderSyncMessage} width={175} />
                              </Box>}
                              variant={'default'}
                              onClick={() => integration.Status === Enums.IntegrationStatus.Live ? sendToPartner() : {}}
                            >
                              Retry Purchase Order to {Enums.getEnumStringValue(Enums.IntegrationPartner, integration?.Partner)}
                            </Button>
                          </Tooltip>
                        </Box>
                      },
                      {
                        show: purchaseOrder.PurchaseOrderSyncStatus === Enums.SyncStatus.Never,
                        type: 'custom',
                        children: <Box>
                          <Tooltip color={'yellow.7'} maw={300} multiline label={integrationTooltip} disabled={!integrationTooltip}
                            events={{ hover: true, focus: true, touch: true }}
                          >
                            <Button
                              disabled={props.accessStatus === Enums.AccessStatus.LockedWithAccess || props.accessStatus === Enums.AccessStatus.LockedWithOutAccess}
                              onClick={() => integration.Status === Enums.IntegrationStatus.Live ? sendToPartner() : {}}
                              leftSection={<IconSend />}
                              variant={'default'}
                            >
                              Send PO to {Enums.getEnumStringValue(Enums.IntegrationPartner, integration?.Partner)}
                            </Button>
                          </Tooltip>
                        </Box>
                      }
                    ]
                  ] || []
                ),
                [
                  {
                    breakpoint: 780,
                    type: 'button',
                    icon: <IconDeviceFloppy />,
                    isBusy: saving,
                    disabled: props.accessStatus === Enums.AccessStatus.LockedWithAccess || props.accessStatus === Enums.AccessStatus.LockedWithOutAccess,
                    text: saving ? "Saving" : "Save",
                    onClick: saving ? null : () => setTimeout(() => { savePurchaseOrder(purchaseOrder.PurchaseOrderStatus); }, 50),
                  }
                ]
              ]}
            />
          }
        </Flex>
        {
          !isNew &&
          <Tabs
            selectedTab={selectedTab}
            setSelectedTab={trySetSelectedTab}
            tabs={pageTabs}
            useNewTabs
            tabsProps={
              { mt: { base: 'sm', xxl: 0 }, mx: { base: 1, sm: 'xs', md: 'sm', lg: 'md' } }
            }
          />
        }
      </Box>

      {isNew ?
        <>
          <Box
            // bg={'gray.1'}
            py={{ base: 5, xs: 8, sm: 'md' }}
            px={{ base: 5, xs: 8 }}
            mih={`calc(100vh - ${(toolbarHeight ? (toolbarHeight + 68) : 166)}px)`}
          >
            <Card
              p={'md'}
              px={{ base: 1, xs: 5, sm: 'sm' }}
              radius={'md'}
            >
              {(() => {
                return purchaseOrderDetails();
              })()}
            </Card>
          </Box>
        </>
        :
        <Box
          bg={'gray.1'}
          py={{ base: 5, xs: 8, sm: 'md' }}
          px={{ base: 5, xs: 8 }}
          mih={`calc(100vh - ${(toolbarHeight ? (toolbarHeight + 68) : 166)}px)`}
        >
          <Card
            p={'md'}
            px={{ base: 1, xs: 5, sm: 'sm' }}
            radius={'md'}
          >
            {(() => {
              switch (selectedTab) {
                case "Purchase":
                  return purchaseOrderDetails();
                case 'Comments':
                  return <ItemComments
                    itemID={purchaseOrder.ID}
                    module={Enums.Module.PurchaseOrder}
                    storeID={purchaseOrder.StoreID}
                    setTotalComments={setTotalComments}
                  />;
                case 'GRVs':
                  return <ItemStockTransactionsTable itemId={purchaseOrder.ID} itemModule={Enums.Module.PurchaseOrder} stockTransactionType={Enums.StockTransactionType.GRV}
                    accessStatus={props.accessStatus} appendLinkedItemIDs={false} refreshListToggle={refreshStockTransactionToggle} refreshParent={refreshPurchaseOrder} />;
                case 'Attachments':
                  return <Attachments topMargin={false} displayName={selectedSupplier ? selectedSupplier.Name : ''} itemId={purchaseOrder.ID} module={Enums.Module.PurchaseOrder} onRefresh={onAttachmentRefresh}
                    accessStatus={props.accessStatus} />;
                case 'Communication':
                  return <Communications topMargin={false} itemId={purchaseOrder.ID} module={Enums.Module.PurchaseOrder}
                    supplierID={selectedSupplier ? selectedSupplier.ID : null} accessStatus={props.accessStatus} />;
                default:
                  return '';
              }
            })()}
          </Card>
        </Box>
      }

      {mergeItemsModalOptions.show &&
        <MergeItemsModal show={mergeItemsModalOptions.show} options={mergeItemsModalOptions} module={Enums.Module.PurchaseOrder} />}

      {showPreferencesModal &&
        <EditUserConfigMetaDataModal metaData={crudConfigMetaData} onChange={updateCrudConfigMetaData} />}

      {showQuickGRV &&
        <QuickGRVModal 
        storeID={purchaseOrder.StoreID} 
        onConfirm={onConfirmQuickGRV} 
        onClose={() => setShowQuickGRV(false)} 
        hasVanStock={hasVanStock}
        />
      }

      <ManageStockTransactionDrawer
        heading={`GRV for ${purchaseOrder.PurchaseOrderNumber}`}
        isNew={!showStockTransactionDrawer.stockTransaction}
        stockTransaction={showStockTransactionDrawer.stockTransaction}
        show={showStockTransactionDrawer.show}
        stockTransactionType={Enums.StockTransactionType.GRV}
        purchaseOrderID={purchaseOrder.ID}
        onClose={() => setShowStockTransactionDrawer({ show: false, stockTransaction: null })}
        onSaved={async (st) => {
          getCounts();
          setShowStockTransactionDrawer({ show: true, stockTransaction: st });
          let po = await purchaseOrderService.getPurchaseOrder(purchaseOrder.ID);
          setPurchaseOrder(po);
          setPurchaseOrderItems(po.PurchaseOrderItems);
          if (st.StockTransactionStatus === Enums.StockTransactionStatus.Complete) {
            setShowStockTransactionDrawer({ show: false, stockTransaction: null });
          }
          setRefreshStockTransactionToggle(p => !p);
        }}

      />

      <ConfirmAction options={confirmOptions} setOptions={setConfirmOptions} />

      <style jsx>{`
        .row {
          display: flex;
          justify-content: space-between;
        }
        .column {
          display: flex;
          flex-direction: column;
          width: 100%;
        }
        .actions {
          display: flex;
        }
        .actions :global(.button){
          margin-left: 0.5rem;
          margin-top: 0;
          padding: 0 1rem;
          white-space: nowrap;
        }
      `}
      </style>
      {showUpdateInventoryModal &&
        <UpdateInventoryPricesModal
          opened={showUpdateInventoryModal}
          onClose={() => setShowUpdateInventoryModal(false)}
          onContinue={(updatedInventories) => {
            setShowUpdateInventoryModal(false);

            if (updatedInventories) {
              const updatedPOItems = purchaseOrderItems.map(item => {
                if (item.InventoryID && updatedInventories[item.InventoryID]) {
                  return {
                    ...item,
                    Inventory: {
                      ...item.Inventory,
                      CostPrice: updatedInventories[item.InventoryID].CostPrice,
                      ListPrice: updatedInventories[item.InventoryID].ListPrice,
                    }
                  };
                }
                return item;
              });
              setPurchaseOrderItems(updatedPOItems);
            }

            savePurchaseOrder(pendingSaveParams.status, pendingSaveParams.routeChange, pendingSaveParams.overrideDeliveryDate, pendingSaveParams.performMergeChecks, true);
          }}
          detectionResult={inventoryPriceChanges}
          module="PurchaseOrder"
          hasCostPricePermission={costingPermission}
        />
      }
    </div>
  );
}

export default ManagePurchaseOrder;
