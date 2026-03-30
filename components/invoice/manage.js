import React, { useState, useEffect, useContext, useRef, useMemo } from 'react';
import Router from 'next/router';
import { colors, layout } from '../../theme';
import Fetch from '../../utils/Fetch';
import Helper from '../../utils/helper';
import * as Enums from '../../utils/enums';
import LegacyButton from '../../components/button';
import Breadcrumbs from '../../components/breadcrumbs';
import InvoiceDetails from './invoice-details';
import CustomerContactLocationSelector from '../selectors/customer/customer-contact-location-selector';
import ToastContext from '../../utils/toast-context';
import Time from '../../utils/time';
import DownloadService from '../../utils/download-service';
import ConfirmAction from '../modals/confirm-action';
import Tabs from '../tabs';
import Communications from '../shared-views/communications';
import Attachments from '../shared-views/attachments';
import AuditLog from '../shared-views/audit-log';
import PS from '../../services/permission/permission-service';
import CustomerService from '../../services/customer/customer-service';
import Storage from '../../utils/storage';
import HelpDialog from '../help-dialog';
import ItemComments from '../shared-views/item-comments';
import constants from '../../utils/constants';
import commentService from '../../services/comment/comment-service';
import StoreSelector from '../selectors/store/store-selector';
import SCInput from '../sc-controls/form-controls/sc-input';
import SCDatePicker from '../sc-controls/form-controls/sc-datepicker';
import EmployeeSelector from '../selectors/employee/employee-selector';
import SCTextArea from '../sc-controls/form-controls/sc-textarea';
import SCNumericInput from '../sc-controls/form-controls/sc-numeric-input';
import PaymentsList from "../../PageComponents/Payments/PaymentsList";
import {ActionIcon, Anchor, Box, Button, Card, Flex, Loader, rem, Space, Text, Tooltip} from "@mantine/core";
import { getPaymentAccess } from "../../PageComponents/Payments/payments";

import invoiceService from "../../services/invoice/invoice-service";
import useInitialTimeout from '../../hooks/useInitialTimeout';
import Link from "next/link";
import { IconExternalLink } from "@tabler/icons";
import InvoiceDetailsSections from "./invoice-details-sections";
import SwitchWithIcons from "../../PageComponents/Switch/SwitchWithIcons";
import {
  IconDeviceFloppy,
  IconDotsVertical, IconEye,
  IconPrinter,
  IconSend,
  IconThumbDown,
  IconThumbUp
} from "@tabler/icons-react";
import { getSectionsFromTableData } from "../../PageComponents/SectionTable/SectionTable";
import featureService from "../../services/feature/feature-service";
import useRefState from '../../hooks/useRefState';
import LinkItem from "../../PageComponents/Links/LinkItem";
import ToolbarButtons from "../../PageComponents/Button/ToolbarButtons";
import { useElementSize } from "@mantine/hooks";
import AlertIcon from "../../PageComponents/Icons/AlertIcon";
import MergeItemsModal from '../../PageComponents/Inventory/MergeItemsModal';
import SubscriptionContext from '../../utils/subscription-context';
import warehouseService from '../../services/warehouse/warehouse-service';
import userConfigService from '../../services/option/user-config-service';
import EditUserConfigMetaDataModal from '../../PageComponents/EditUserConfigMetaDataModal';

function ManageInvoice(props) {

  const [customerPermission] = useState(PS.hasPermission(Enums.PermissionName.Customer));
  const [jobPermission] = useState(PS.hasPermission(Enums.PermissionName.Job));
  const [queryPermission] = useState(PS.hasPermission(Enums.PermissionName.Query));
  const [masterOfficeAdminPermission] = useState(PS.hasPermission(Enums.PermissionName.MasterOfficeAdmin));
  const [invoiceRevertPermission] = useState(PS.hasPermission(Enums.PermissionName.InvoiceRevert));
  const [invoicePermission] = useState(PS.hasPermission(Enums.PermissionName.Invoice));
  const [hasAdvancedPermissions] = useState(PS.hasAdvancedPermissions());
  const subscriptionContext = useContext(SubscriptionContext);

  const [hasStockControl, setHasStockControl] = useState();
  const [crudConfig, setCrudConfig] = useState();
  const [showPreferencesModal, setShowPreferencesModal] = useState(false);

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

  const isNew = props.isNew;
  const copyFromInvoice = props.copyFromInvoice;
  const externalModule = props.module;
  const externalModuleID = props.moduleID;
  const externalCustomerID = props.customerID;
  const rootModule = props.rootModule;

  const isQuoteModule = useRef(+props.module === Enums.Module.Quote);

  const [selectedStore, setSelectedStore] = useState();

  const [invoice, setInvoice] = useState(isNew ?
    copyFromInvoice ? {
      ...copyFromInvoice,
      Reference: '',
      InvoiceStatus: Enums.InvoiceStatus.Draft,
      ItemID: copyFromInvoice.CustomerID,
      Module: Enums.Module.Customer,
      InvoiceDate: Time.parseDate(Time.now())
    } : {
      Reference: '',
      DiscountPercentage: 0,
      InvoiceStatus: Enums.InvoiceStatus.Draft,
      InvoiceDate: Time.parseDate(Time.now()),
      QuoteID: isQuoteModule.current ? props.moduleID : null
    } : props.invoice);

  const [paymentsList, setPaymentsList] = useState([]);
  const [lessPayments, setLessPayments] = useState(0);
  const [amountDue, setAmountDue] = useState(0);
  useEffect(
    () => {
      let total = 0;
      let amountDue = +invoice.TotalInclusive;
      paymentsList.forEach((x) => {
        total = total + +x.Amount;
        amountDue = amountDue - +x.Amount;
      })
      setLessPayments(Helper.roundToTwo(total))
      setAmountDue(Helper.roundToTwo(amountDue))
    }, [paymentsList, invoice.TotalInclusive]
  );

  const rowVersion = useRef(invoice.RowVersion)
  useEffect(() => {
    if (invoice.RowVersion) {
      rowVersion.current = invoice.RowVersion
    }
  }, [invoice.RowVersion])

  const updatePaymentList = (newPaymentsList) => {
    setPaymentsList(newPaymentsList)
  }

  const refreshInvoice = async () => {
    const inv = await invoiceService.getInvoice(invoice.ID)
    setInvoice((x) => ({ ...x, RowVersion: inv.RowVersion, TotalPayments: inv.TotalPayments }))
    rowVersion.current = inv.RowVersion
  }

  const [module, setModule] = useState();
  const [itemID, setItemID] = useState();

  // const [comments, setComments] = useState(props.comments ? props.comments : []);

  const [totalComments, setTotalComments] = useState(0);

  // TABS

  const [pageTabs, setPageTabs] = useState([]);
  const [selectedTab, setSelectedTab] = useState(props.initTab);

  const [attachmentCount, setAttachmentCount] = useState(0);
  const [communicationCount, setCommunicationCount] = useState(0);
  const [countsToggle, setCountsToggle] = useState(false);

  const getCounts = async () => {
    let countRequest = await Fetch.get({
      url: `/Invoice/GetCounts?id=${invoice.ID}`,
    });
    let result = countRequest.Results;
    setAttachmentCount(result.find(x => x.Key == 'Attachments').Value);
    setCommunicationCount(result.find(x => x.Key == 'Communication').Value);

    setCountsToggle(!countsToggle);
  };

  useEffect(() => {
    buildUpPageTabs();
  }, [countsToggle, totalComments]);

  const onAttachmentRefresh = () => {
    getCounts();
  };

  const buildUpPageTabs = () => {
    let tabs = [
      { text: 'Invoice' },
      { text: 'Comments', count: totalComments },
      { text: 'Attachments', count: attachmentCount },
      { text: 'Communication', count: communicationCount },
    ];
    setPageTabs(tabs);
  };

  const [formIsDirty, setFormIsDirty] = useState(false);
  const [confirmOptions, setConfirmOptions] = useState(Helper.initialiseConfirmOptions());

  const [inputErrors, setInputErrors] = useState({});

  const toast = useContext(ToastContext);

  const updateInvoice = (field, value) => {
    let temp = { ...invoice };
    temp[field] = value;
    setInvoice(temp);
    setFormIsDirty(true);
  };

  const handleInputChange = (e) => {
    updateInvoice([e.target.name], e.target.value);
  };

  const updateInvoiceDate = (value) => {

    let invoiceDate = value;
    let dueDate = invoice.DueDate;

    if (selectedStore) {
      dueDate = selectedStore.InvoiceDuePeriod ? Time.addDays(selectedStore.InvoiceDuePeriod, Time.parseDate(invoiceDate)) : Time.parseDate(invoiceDate);
    } else if (stores && stores.length > 0) {
      let defaultStore = stores.find(x => x.IsDefault);
      if (defaultStore) {
        dueDate = defaultStore.InvoiceDuePeriod ? Time.addDays(defaultStore.InvoiceDuePeriod, Time.parseDate(invoiceDate)) : Time.parseDate(invoiceDate);
      }
    }

    updateInvoiceBulk(null, null, [{
      key: "InvoiceDate",
      value: invoiceDate
    }, {
      key: "DueDate",
      value: dueDate,
    }]);
  };

  const updateInvoiceBulk = (field, value, orKeyValues, markAsDirty = true) => {
    let newInvoiceState = { ...invoice };

    if (orKeyValues && orKeyValues.length > 0) {
      orKeyValues.map((item) => {
        newInvoiceState[item.key] = item.value;
      });
    }
    if (field) {
      newInvoiceState[field] = value;
    }

    setInvoice(newInvoiceState);
    setFormIsDirty(markAsDirty);
  };

  const logoRef = useRef();
  const [logo, setLogo] = useState();

  const company = props.company;
  const currencySymbol = company.Currency ? company.Currency.Symbol : '';

  useEffect(() => {
    if (company.LogoExists) {
      setLogo(company.LogoUrl);
    } else {
      setShowHeaderContents(true);
    }
  }, [company]);

  const [store, setStore] = useState({});

  const crudConfigMetaData = useMemo(() => {
    if (!crudConfig) return {};

    return {
      values: {
        compareJobInventoryOnApprove: userConfigService.getMetaDataValue(crudConfig, "compareJobInventoryOnApprove") ?? true,
      },
      labels: {
        compareJobInventoryOnApprove: "Prompt for job and invoice differences during approval"
      },
      titles: {
        compareJobInventoryOnApprove: "Always prompt to add, merge, or disregard any inventory differences between job details and invoice line items."
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

  // STORES

  // const [searching, setSearching] = useState(false);
  const [isMultiStore, setIsMultiStore] = useState(false);
  // const [stores, setStores] = useState([]);
  // const [storesTotalResults, setStoresTotalResults] = useState();
  const [storeSearch, setStoreSearch] = useState('');

  const getStore = async () => {
    const storesResult = await Fetch.get({
      url: `/Store/GetEmployeeStores?employeeID=${Storage.getCookie(Enums.Cookie.employeeID)}&searchPhrase=${storeSearch}`,
    });
    setIsMultiStore(storesResult.TotalResults > 1);

    if (storesResult.TotalResults > 1) {
      // set store from invoice
      if (!isNew && !Helper.isNullOrUndefined(invoice.StoreID)) {
        const storeResult = await Fetch.get({
          url: `/Store/${invoice.StoreID}`,
        });
        setSelectedStore(storeResult);
      }
    } else {
      setSelectedStore(storesResult.Results ? storesResult.Results[0] : null);
    }
  };

  /* const searchStores = async () => {
     setSearching(true);
     const storePostResult = await Fetch.post({
       url: `/Store/GetStores`,
       params: {
         pageSize: 10,
         pageIndex: 0,
         searchPhrase: storeSearch,
         sortExpression: '',
         sortDirection: '',
         IncludeClosed: false,
       }
     });
     setStores(storePostResult.Results);
     setStoresTotalResults(storePostResult.TotalResults);
     setSearching(false);
   };*/

  /* const handleStoreChange = (e) => {
     setStoreSearch(e.target.value);
     setFormIsDirty(true);
   };
 
   // debounce logic for component load, run the expected method if it was called earler before debounce
   const doInitialTimeoutCallback2000ms = useRef(false);
   const initialTimeout2000ms = useInitialTimeout(500, () => {
     if (doInitialTimeoutCallback2000ms.current) {
       storeSelectedStoreChangedHandler();
     }
   });*/

  const storeSelectedStoreChangedHandler = (store = undefined) => {

    const currentStore = store ?? selectedStore;
    // debouncing this event as it happens too often on component load - keep track that it should be run later
    /*if (!initialTimeout2000ms) {
      doInitialTimeoutCallback2000ms.current = true;
      return;
    }*/

    if (isNew) {
      let invoiceDate = Time.parseDate(Time.now());
      let dueDate = invoice ? invoice.DueDate : null;
      let invoiceComment = invoice ? invoice.Comment : null;

      if (currentStore) {
        dueDate = currentStore.InvoiceDuePeriod ? Time.addDays(currentStore.InvoiceDuePeriod, Time.now()) : Time.parseDate(Time.now());
        invoiceComment = invoiceComment ? invoiceComment : currentStore.InvoiceComment;
      } /*else if (stores && stores.length > 0) {
        let defaultStore = stores.find(x => x.IsDefault);
        if (defaultStore) {
          dueDate = defaultStore.InvoiceDuePeriod ? Time.addDays(defaultStore.InvoiceDuePeriod, Time.now()) : Time.parseDate(Time.now());
          invoiceComment = invoiceComment ? invoiceComment : defaultStore.InvoiceComment;
        }
      }*/

      // console.log("DEBUGGING - storeSelectedStoreChangedHandler");
      updateInvoiceBulk(null, null, [{
        key: "InvoiceDate",
        value: invoiceDate
      }, {
        key: "DueDate",
        value: dueDate,
      }, {
        key: "Comment",
        value: invoiceComment
      }, {
        key: "StoreID",
        value: currentStore?.ID ?? null
      }], false);

      if (currentStore && !Helper.isNullOrUndefined(currentStore)) {
        setStoreSearch(currentStore.Name);
        if (selectedEmployee && !Helper.isEmptyObject(selectedEmployee)) {
          setSelectedEmployee(null);
          toast.setToast({
            message: 'Employee has been cleared',
            show: true,
            type: Enums.ToastType.success
          });
        }
      }
    }
  }

  useEffect(() => {
    storeSelectedStoreChangedHandler();
  }, [selectedStore]);

  const getOptionButtons = async (status = invoice.InvoiceStatus) => {
    let opts = [
      { text: 'Copy Invoice', link: `CopyInvoice` },
      { text: 'Cancel Invoice', link: `CancelInvoice` },
      { text: 'New Invoice', link: `NewInvoice` },
    ];

    if (status == Enums.InvoiceStatus.Unpaid) {
      opts.push({ text: 'Mark as Paid', link: 'MarkAsPaid' });
    }

    if (status == Enums.InvoiceStatus.Unpaid) {
      if ((!hasAdvancedPermissions && invoicePermission) || (hasAdvancedPermissions && invoiceRevertPermission)) {
        if (!integration || invoice.InvoiceSyncStatus == Enums.SyncStatus.Never
          || invoice.InvoiceSyncStatus == Enums.SyncStatus.Failed
          || invoice.InvoiceSyncStatus == Enums.SyncStatus.NotSyncable) {
          opts.push({ text: 'Revert to Draft', link: `RevertToDraft` });
        }
      }
    }

    if (selectedJob && jobPermission) {
      opts.push({ text: 'Open Job', link: `OpenJob` });
    }

    if (selectedQuery && queryPermission) {
      opts.push({ text: 'Open Query', link: `OpenQuery` });
    }

    if (Helper.isNullOrUndefined(selectedJob) && Helper.isNullOrUndefined(selectedQuery)) {
      if (jobPermission)
        opts.push({ text: 'Create Job', link: `CreateJob` });
      if (queryPermission)
        opts.push({ text: 'Create Query', link: `CreateQuery` });
    }

    if (customerPermission)
      opts.push({ text: 'Open Customer', link: `OpenCustomer` });

    opts.push({
      text: 'Preferences', link: `EditPreferences`
    })

    setOptionButtons(opts);
  };

  const getInventory = async (id) => {
    const inventory = await Fetch.get({
      url: `/Inventory?id=${id}`
    });
    return inventory;
  };

  const setInvoiceItemsFromJob = async (jobInventory) => {
    const jobInventoryToProcess = (jobInventory ?? []).filter(x => x.QuantityInvoiced < x.QuantityRequested).map(x => ({ ...x, QuantityRequested: x.QuantityRequested - x.QuantityInvoiced }));

    if (jobInventoryToProcess.length == 0) return;

    const newSectionIdMapping = jobInventoryToProcess.reduce((p, c) => (
      c.InventorySectionID && !p.hasOwnProperty(c.InventorySectionID) ? {
        ...p,
        [c.InventorySectionID]: crypto?.randomUUID()
      } : p
    ), {})

    const itemsToAdd = (await Promise.all(jobInventoryToProcess.sort((a, b) => a.LineNumber - b.LineNumber).map(async x => {
      const inventory = await getInventory(x.InventoryID);

      let lineTotalExclusive = 0;

      if (inventory.ListPrice > 0) {
        let subTotal = x.QuantityRequested * inventory.ListPrice;
        lineTotalExclusive = parseFloat(subTotal.toFixed(2));
      }

      // need to replace section IDs to ensure it is different to job's SectionId's
      const sectionIdOverride = x.InventorySectionID ? {
        InventorySectionID: newSectionIdMapping[x.InventorySectionID],
      } : { InventorySectionID: null }

      const section = {
        InventorySectionName: x.InventorySectionName,
        FromBundleID: x.FromBundleID,
        HideLineItems: x.HideLineItems,
        DisplaySubtotal: x.DisplaySubtotal,
        ...sectionIdOverride,
        ...{ HideLineItems: false, DisplaySubtotal: false },
      };

      return {
        ...(x.ProductID ? {
          Description: x.InventoryDescription + ' - ' + x.ProductNumber,
          InventoryDescription: x.InventoryDescription + ' - ' + x.ProductNumber,
          IsActive: true,
          InvoiceItemType: Enums.InvoiceItemType.Description
        } : {
          Description: x.InventoryDescription,
          Quantity: x.QuantityRequested,
          InventoryID: x.InventoryID,
          InventoryDescription: x.InventoryDescription,
          InventoryCode: x.InventoryCode,
          ProductID: x.ProductID,
          ProductNumber: x.ProductNumber,
          TaxPercentage: company.TaxPercentage,
          Integrated: inventory.Integrated,
          IntegrationMessage: inventory.IntegrationMessage,
          LineDiscountPercentage: 0,
          UnitPriceExclusive: inventory.ListPrice,
          LineTotalExclusive: lineTotalExclusive,
          IsActive: true,
          InvoiceItemType: Enums.InvoiceItemType.Inventory,
          WarehouseID: x.WarehouseID,
          Warehouse: x.Warehouse,
          IsNew: true
        }),
        ...section
      }
    }))).map((item, idx) => ({ ...item, LineNumber: idx + 1 }));

    setInvoiceItems(itemsToAdd);
  };

  useEffect(() => {

    getStore();

    if (isNew) {
      if (externalModule) {

        switch (parseInt(externalModule)) {
          case Enums.Module.Customer:
            setModule(Enums.Module.Customer);
            break;
          case Enums.Module.JobCard:
            setJobLinkLockdown(true);
            setShowQueryLink(false);
            setShowProjectLink(false);
            getLinkedJobCard(externalModuleID).then(job => {
              job?.Store && storeSelectedStoreChangedHandler(job.Store)
              setSelectedStore(job ? job.Store : selectedStore);
              //setInvoiceItemsFromJob(job?.JobInventory ?? []);
            });
            setModule(Enums.Module.JobCard);
            break;
          case Enums.Module.Query:
            setQueryLinkLockdown(true);
            setShowJobLink(false);
            setShowProjectLink(false);
            getLinkedQuery(externalModuleID);
            setModule(Enums.Module.Query);
            break;
          case Enums.Module.Quote:
            getLinkedQuote(externalModuleID);
            break;
          case Enums.Module.Project:
            setShowQueryLink(false);
            setShowJobLink(false);
            setShowProjectLink(true);
            setProjectLinkLockdown(true);
            getLinkedProject(externalModuleID);
            setModule(Enums.Module.Project);
            break;
        }

        setCustomerLinkLockdown(true);
        selectCustomer(externalCustomerID);
        setItemID(externalModuleID);
      }

      if (copyFromInvoice) {
        selectCustomer(copyFromInvoice.CustomerID);
      }
    } else {
      if (externalModule) {

        switch (parseInt(externalModule)) {
          case Enums.Module.Customer:
            if (invoice.Module == Enums.Module.JobCard) {
              getLinkedJobCard(invoice.ItemID);
              setModule(Enums.Module.JobCard);
            } else if (invoice.Module == Enums.Module.Query) {
              getLinkedQuery(invoice.ItemID);
              setModule(Enums.Module.Query);
            }
            setItemID(invoice.ItemID);
            break;
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
          case Enums.Module.Quote:
            break;
          case Enums.Module.Project:
            if (invoice.Module == Enums.Module.Project) {
              setShowProjectLink(true);
              setProjectLinkLockdown(true);
              setShowJobLink(false);
              getLinkedProject(invoice.ItemID);
              setModule(Enums.Module.Project);
              setItemID(invoice.ItemID);
            } else if (invoice.Module == Enums.Module.JobCard) {
              setShowJobLink(true);
              setJobLinkLockdown(true);
              getLinkedJobCard(invoice.ItemID);
              setModule(Enums.Module.JobCard);
              setItemID(invoice.ItemID);
            }
            setShowQueryLink(false);
            break;
        }

        setCustomerLinkLockdown(true);
      } else {

        switch (parseInt(invoice.Module)) {
          case Enums.Module.JobCard:
            getLinkedJobCard(invoice.ItemID);
            setShowJobLink(true);
            setShowQueryLink(false);
            setShowProjectLink(false);
            setModule(Enums.Module.JobCard);
            setItemID(invoice.ItemID);
            break;
          case Enums.Module.Query:
            getLinkedQuery(invoice.ItemID);
            setShowJobLink(false);
            setShowQueryLink(true);
            setShowProjectLink(false);
            setModule(Enums.Module.Query);
            setItemID(invoice.ItemID);
            break;
          case Enums.Module.Project:
            getLinkedProject(invoice.ItemID);
            setShowJobLink(false);
            setShowQueryLink(false);
            setShowProjectLink(true);
            setModule(Enums.Module.Project);
            setItemID(invoice.ItemID);
            break;
          default:
            setShowJobLink(true);
            setShowQueryLink(true);
            setShowProjectLink(true);
            break;
        }
      }

      // getPeripheralJoins();
      fetchMessages();
      getOptionButtons();
      getCounts();
      getEmployeeLogin();
    }

    getIntegration();
    fetchComments();

    featureService.getFeature(constants.features.INVENTORY_SECTION_BUNDLE).then(feature => {
      setUseNewTable(!!feature);
    });

    featureService.getFeature(constants.features.STOCK_CONTROL).then(feature => {
      setHasStockControl(!!feature);
    });

    userConfigService.getCrudSettings(Enums.ConfigurationSection.Invoice).then(config => {
      setCrudConfig(config);
    })
  }, []);

  // INVOICE FROM QUOTE

  const getDefaultWarehouse = async (storeID) => {

    const isMultiStore = subscriptionContext.subscriptionInfo?.MultiStore ?? false;
    const warehouseResults = await warehouseService.getWarehouses();
    const ignoreIDs = [];
    const employeeID = Storage.getCookie(Enums.Cookie.employeeID);

    let processedWarehouses = (warehouseResults.Results ?? []).filter(x => !(ignoreIDs ?? []).includes(x.ID)).map(x => {
      return {
        ...x,
        GroupDisplay: Enums.getEnumStringValue(Enums.WarehouseType, x.WarehouseType, true)
      };
    }).sort((a, b) => {
      if (a.WarehouseType !== b.WarehouseType) return (a.WarehouseType) - (b.WarehouseType);
      return (a.Name) - (b.Name);
    });

    processedWarehouses = processedWarehouses.filter(x => {
      if (x.WarehouseType === Enums.WarehouseType.Warehouse && (!!storeID || !isMultiStore)) {
        return !isMultiStore || x.StoreID === storeID;
      }
      else if (x.WarehouseType === Enums.WarehouseType.Mobile) {
        return x.EmployeeID === employeeID;
      }
      return false;
    });

    let bestMatches = !!employeeID ? processedWarehouses.filter(x => x.WarehouseType === Enums.WarehouseType.Mobile && x.EmployeeID === employeeID) : [];
    if (bestMatches.length === 0 && (!!storeID || !isMultiStore)) {
      bestMatches = processedWarehouses.filter(x => x.WarehouseType === Enums.WarehouseType.Warehouse && (x.StoreID === storeID || !isMultiStore));
    }
    if (bestMatches.length > 0) {
      return bestMatches.sort((a, b) => (b.IsDefault ? 1 : 0) - (a.IsDefault ? 1 : 0))[0];
    }
    return null;
  };

  const [quote, setQuote] = useState();
  const defaultWarehouse = useRef();

  const getLinkedQuote = async (id) => {
    let quoteResult = await Fetch.get({
      url: `/Quote/${id}`
    });

    defaultWarehouse.current = await getDefaultWarehouse(quoteResult.StoreID)

    setQuote(quoteResult);
  };

  useEffect(() => {
    if (quote) {

      /*if (quote.Reference && !invoice.Reference) {
        console.log('setting invoice Ref', quote.Reference)

      }*/
      if (quote.Store) {
        setSelectedStore(quote.Store);
      }

      if (quote.QuoteItems && quote.QuoteItems.length > 0) {
        let items = [];

        const newSectionIdMapping = quote.QuoteItems.reduce((p, c) => (
          c.InventorySectionID && !p.hasOwnProperty(c.InventorySectionID) ? {
            ...p,
            [c.InventorySectionID]: crypto?.randomUUID()
          } : p
        ), {})


        for (let item of quote.QuoteItems) {
          // STOCK CONTROL ISQUANTITYTRACKED CHANGE
          let isTracked = Helper.isInventoryWarehoused(item.Inventory); //item.Inventory?.IsQuantityTracked === true;
          items.push({
            InvoiceItemType: item.QuoteItemType,
            Description: item.Description,
            Inventory: item.Inventory,
            InventoryID: item.InventoryID,
            InventoryCode: item.InventoryCode,
            InventoryDescription: item.InventoryDescription,
            InventoryActive: item.InventoryActive,
            Quantity: item.Quantity,
            UnitPriceExclusive: item.UnitPriceExclusive,
            TaxPercentage: item.TaxPercentage,
            LineDiscountPercentage: item.LineDiscountPercentage,
            LineTotalExclusive: item.LineTotalExclusive,
            LineNumber: item.LineNumber,
            Integrated: item.Integrated,
            SyncStatus: item.SyncStatus,
            IsActive: true,
            InventorySectionID: newSectionIdMapping[item.InventorySectionID],
            InventorySectionName: item.InventorySectionName,
            FromBundleID: item.FromBundleID,
            HideLineItems: item.HideLineItems,
            DisplaySubtotal: item.DisplaySubtotal,
            WarehouseID: isTracked ? (defaultWarehouse.current?.ID ?? null) : null,
            Warehouse: isTracked ? defaultWarehouse.current : null,
          });
        }
        setInvoiceItems(Helper.sortObjectArray(items, 'LineNumber'));
      }

      updateInvoiceBulk(null, null, [{
        key: 'Reference',
        value: quote.Reference,
      },
      {
        key: "DiscountPercentage",
        value: quote.DiscountPercentage,
      },
      {
        key: "InvoiceDate",
        value: Time.parseDate(Time.now()),
      },
      ...(
        selectedStore ? [{
          key: "DueDate",
          value: Time.parseDate(Time.addDays(selectedStore?.InvoiceDuePeriod ?? 31, Time.now())),
        }] : []
      ),
      {
        key: "Comment",
        value: quote.Store ? quote.Store.InvoiceComment : '',
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
    }
  }, [quote]);

  const [clearLinks, setClearLinks] = useState(isNew);

  // JOB CARD LINK

  const [showJobLink, setShowJobLink] = useState(isNew);
  const [jobLinkLockdown, setJobLinkLockdown] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);

  const getLinkedJobCard = async (id) => {
    let job = await Fetch.get({
      url: `/Job/${id}`,
      caller: "components/invoice/manage.js:getLinkedJobCard()"
    });
    setSelectedJob(job);
    return job;
  };

  const linkInvoiceToJob = (job) => {
    setFormIsDirty(_ => true);
    setSelectedJob(job);
    if (job) {
      setModule(Enums.Module.JobCard);
      setItemID(job.ID);
      setSelectedQuery(null);
      if (!externalModule) {
        setShowProjectLink(false);
        setShowQueryLink(false);
      }
    } else {
      if (!Helper.isEmptyObject(selectedCustomer)) {
        setModule(Enums.Module.Customer);
        setItemID(selectedCustomer.ID);
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
  const [customerLinkLockdown, setCustomerLinkLockdown] = useState(false);

  const [selectedQuery, setSelectedQuery] = useState(null);

  const getLinkedQuery = async (id) => {
    let query = await Fetch.get({
      url: `/Query/${id}`,
      caller: "components/invoice/manage.js:getLinkedQuery()"
    });
    setSelectedQuery(query);
  };

  const linkInvoiceToQuery = (query) => {
    setFormIsDirty(_ => true);
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
      if (!Helper.isEmptyObject(selectedCustomer)) {
        setModule(Enums.Module.Customer);
        setItemID(selectedCustomer.ID);
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

  const [showProjectLink, setShowProjectLink] = useState(isNew);
  const [projectLinkLockdown, setProjectLinkLockdown] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  const getLinkedProject = async (id) => {
    let project = await Fetch.get({
      url: `/Project/${id}`
    });
    setSelectedProject(project);
  };

  const linkInvoiceToProject = (project) => {
    setFormIsDirty(_ => true);
    setSelectedProject(project);
    if (project) {
      setModule(Enums.Module.Project);
      setItemID(project.ID);
      if (!externalModule) {
        setShowJobLink(false);
        setShowQueryLink(false);
      }
    } else {
      if (!Helper.isEmptyObject(selectedCustomer)) {
        setModule(Enums.Module.Customer);
        setItemID(selectedCustomer.ID);
      }
      if (!externalModule) {
        setShowJobLink(true);
        setShowQueryLink(true);
        setJobLinkLockdown(false);
        setQueryLinkLockdown(false);
      }
    }
  };

  // INVOICE ITEMS

  const [invoiceItems, setInvoiceItems, getInvoiceItemsValue] = useRefState(isNew ? (copyFromInvoice ? copyFromInvoice.InvoiceItems : []) : props.invoice.InvoiceItems);

  const getTotals = (overrideTaxPercentage = false, items = null) => {
    let subTotalExclusive = 0;
    let totalTax = 0;
    let totalExclusive = 0;

    if ((items || invoiceItems).length > 0) {
      (items || invoiceItems).forEach((item) => {
        if (item.InvoiceItemType == Enums.InvoiceItemType.Inventory) {
          subTotalExclusive += Helper.roundToTwo(parseFloat(item.LineTotalExclusive));
          if (item.TaxPercentage > 0) {
            if (overrideTaxPercentage) {
              totalTax += Helper.roundToTwo(parseFloat(item.LineTotalExclusive * company.TaxPercentage * (1 - invoice.DiscountPercentage / 100)));
            } else {
              totalTax += Helper.roundToTwo(parseFloat(item.LineTotalExclusive * item.TaxPercentage / 100 * (1 - invoice.DiscountPercentage / 100)));
            }
          }
        }
      });

      totalExclusive = Helper.roundToTwo(parseFloat((subTotalExclusive * (1 - invoice.DiscountPercentage / 100))));
    }

    return { 'subTotalExclusive': subTotalExclusive, 'totalTax': totalTax, 'totalExclusive': totalExclusive };
  };

  const [afterFirstLoad, setAfterFirstLoad] = useState(false);

  const updateInvoiceItemTotals = (items) => {

    let { subTotalExclusive, totalTax, totalExclusive } = getTotals(false, items);

    updateInvoiceBulk(null, null, [{
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
    }], afterFirstLoad);

    setAfterFirstLoad(true);
  }

  const updateInvoiceItems = (items) => {
    setInvoiceItems([...items]);
    updateInvoiceItemTotals(items);
    setFormIsDirty(true);
  };

  useEffect(() => {
    updateInvoiceItemTotals();
  }, [invoice.DiscountPercentage, invoiceItems.length]);

  // CUSTOMER / CONTACT / LOCATION

  const [selectedCustomer, setSelectedCustomer] = useState(isNew ? undefined : invoice.Customer);
  const prevSelectedCustomer = useRef(isNew ? undefined : invoice.Customer);

  const [contact, setContact] = useState(isNew ? undefined : invoice.Contact ? invoice.Contact : undefined);

  const updateContact = (updatedContact, markDirty = true) => {
    setContact(updatedContact);
    if (contact && updatedContact) {
      if (contact.ID != updatedContact.ID) {
        updateInvoiceBulk(null, null, [{
          key: 'Contact',
          value: updatedContact
        }, {
          key: "CustomerContactID",
          value: updatedContact.ID
        }], markDirty);
      }
    }
  };

  const [location, setLocation] = useState(isNew ? undefined : invoice.Location ? invoice.Location : undefined);
  const [afterFirstLocationLoad, setAfterFirstLocationLoad] = useState(false);

  const updateLocation = (updatedLocation, markDirty) => {
    setLocation(updatedLocation);
    if (!afterFirstLocationLoad) {
      setAfterFirstLocationLoad(true);
      return;
    }
    if (CustomerService.hasLocationChanged(location, updatedLocation)) {
      updateInvoiceBulk(null, null, [{
        key: 'Location',
        value: updatedLocation
      }, {
        key: "LocationID",
        value: updatedLocation ? updatedLocation.ID : null
      }], markDirty);
    }
  };

  // const getPeripheralJoins = async () => {
  //   if (invoice.Customer) {      
  //     setSelectedCustomer(invoice.Customer);
  //   }
  // };

  async function selectCustomer(customerID, markDirty = true) {
    if (customerID) {
      const customer = await Fetch.get({
        url: `/Customer/${customerID}`,
      });
      setSelectedCustomer(customer);

      const linkedItem = selectedJob || selectedQuery || selectedProject || quote;

      if (customer.Contacts) {
        let contact = linkedItem?.CustomerContactID ? customer.Contacts.find(x => x.ID === linkedItem?.CustomerContactID) : customer.Contacts.find(x => x.IsPrimary);
        updateContact(contact, markDirty);
      }
      if (customer.Locations) {
        let location = linkedItem?.LocationID ? customer.Locations.find(x => x.ID === linkedItem?.LocationID) : customer.Locations.find(x => x.IsPrimary);
        updateLocation(location, markDirty);
      }
    }
    if (markDirty) {
      setFormIsDirty(true);
    }
  }

  useEffect(() => {
    if (externalCustomerID) {
      selectCustomer(externalCustomerID, false)
      const linkedItem = selectedJob || selectedQuery || selectedProject || quote;
      if (!!linkedItem?.Store) {
        setSelectedStore(linkedItem.Store)
        const dueDate = Time.addDays(linkedItem.Store.InvoiceDuePeriod ?? 31, invoice.InvoiceDate || Time.now());
        updateInvoice('DueDate', dueDate)
        // storeSelectedStoreChangedHandler(linkedItem.Store)
      }
      !!linkedItem?.Reference && updateInvoice('Reference', linkedItem.Reference)

    }
  }, [selectedJob, selectedQuery, selectedProject, quote])

  const firstCustomerUpdate = useRef(true);

  useEffect(() => {
    let isDirty = prevSelectedCustomer.current?.ID !== selectedCustomer?.ID;

    if (selectedCustomer) {

      if (isNew && !externalModuleID) {
        setModule(Enums.Module.Customer);
        setItemID(selectedCustomer.ID);
      }

      if (clearLinks && !externalModule) {
        setSelectedJob(null);
        setSelectedQuery(null);
        setSelectedProject(null);
        setShowJobLink(true);
        setShowQueryLink(true);
        setShowProjectLink(true);
      }
      setClearLinks(true);
    }

    if (firstCustomerUpdate.current) firstCustomerUpdate.current = false;
    else if (isDirty) {
      setFormIsDirty(true);
    }
    prevSelectedCustomer.current = selectedCustomer;
  }, [selectedCustomer]);

  // MESSAGES

  const [totalMessages, setTotalMessages] = useState(0);
  const [messages, setMessages] = useState([]);

  const fetchMessages = async () => {
    if (messages.length == 0) {
      const messagesRes = await Fetch.post({
        url: '/Message/GetMessages',
        params: {
          ItemId: invoice.ID,
          pageIndex: 0,
          pageSize: 5
        }
      });
      setMessages(messagesRes.Results);
      setTotalMessages(messagesRes.TotalResults);
    }
  };

  // Comments  

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
  //         ItemID: invoice.ID,
  //         CommentText: newComment,
  //         Module: Enums.Module.Invoice,
  //         StoreID: invoice.StoreID
  //       }
  //     });
  //     setCommentsPage(0);
  //     fetchComments();
  //     setNewComment('');
  //   }
  // };

  // const [submittingComment, setSubmittingComment] = useState(false);

  // async function saveComment() {
  //   if (props.accessStatus === Enums.AccessStatus.LockedWithAccess || props.accessStatus === Enums.AccessStatus.LockedWithOutAccess) {
  //     return;
  //   }
  //   setSubmittingComment(true);
  //   submitComment();
  //   setSubmittingComment(false);
  // }

  async function fetchComments() {

    if (props.isNew) return;

    const request = await commentService.getComments(props.invoice.ID, 0, 10);

    setTotalComments(request.TotalResults);

    // let newComments = [];
    // if (currentComments) {
    //   if (page != commentsPage) {
    //     newComments.push(...currentComments);
    //   }
    // }

    // newComments.push(...request.Results);
    // setComments(newComments);

    // if (request.ReturnedResults < 5) {
    //   setCanLoadMoreComments(false);
    // } else if (newComments.length == request.TotalResults) {
    //   setCanLoadMoreComments(false);
    // } else {
    //   setCanLoadMoreComments(true);
    // }
  }

  // EMPLOYEE

  const [selectedEmployee, setSelectedEmployee] = useState(isNew ? copyFromInvoice ? copyFromInvoice.Employee : null : invoice.Employee);

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

  // INVOICE STATUS

  const approveInvoiceClick = () => {
    confirmChangeStatus('Are you sure you want to approve this invoice?', Enums.InvoiceStatus.Unpaid);
  };

  const statusChangeConfirmed = (status) => {
    saveInvoice(status, false, 'none', status === Enums.InvoiceStatus.Unpaid);
    getOptionButtons(status);
  };

  const confirmChangeStatus = (text, status) => {
    setConfirmOptions({
      display: true,
      heading: "Confirm",
      text: `${text}`,
      confirmButtonText: "Confirm",
      showCancel: true,
      onConfirm: async () => {
        statusChangeConfirmed(status);
      }
    })
  };

  const revertToDraft = async () => {
    confirmRevert();
  };

  const confirmRevert = async () => {
    setConfirmOptions({
      display: true,
      heading: "Confirm",
      text: `Are you sure you want to revert this invoice?`,
      confirmButtonText: "Confirm",
      showCancel: true,
      onConfirm: async () => {
        const result = await Fetch.post({
          url: `/Invoice/InvoiceToDraft?invoiceid=${invoice.ID}`,
          toastCtx: toast
        });
        if (result.ID) {
          setInvoice(result);
          getOptionButtons(result.InvoiceStatus);
          toast.setToast({
            message: 'Invoice reverted successfully',
            show: true,
            type: 'success'
          });
        }
      }
    });
  };

  const [optionButtons, setOptionButtons] = useState([]);

  const optionsClick = async (link) => {

    let routeChange = true;
    if (formIsDirty) {
      routeChange = await saveInvoice(invoice.InvoiceStatus, routeChange, 'none');
    }

    if (routeChange) {
      switch (link) {
        case 'CopyInvoice':
          Helper.nextRouter(Router.push, `/invoice/create?id=${invoice.ID}`);
          break;
        case 'CancelInvoice':
          confirmChangeStatus('Are you sure you want to cancel this invoice?', Enums.InvoiceStatus.Cancelled);
          break;
        case 'MarkAsPaid':
          confirmChangeStatus('Are you sure you want to mark this invoice as paid?', Enums.InvoiceStatus.Paid);
          break;
        case 'RevertToDraft':
          revertToDraft();
          break;
        case 'CreateJob':
          Helper.nextRouter(Router.push, `/job/create?module=${Enums.Module.Invoice}&moduleID=${invoice.ID}&customerID=${selectedCustomer.ID}`);
          break;
        case 'CreateQuery':
          Helper.nextRouter(Router.push, `/query/create?module=${Enums.Module.Invoice}&moduleID=${invoice.ID}&customerID=${selectedCustomer.ID}`);
          break;
        case 'NewInvoice':
          Helper.nextRouter(Router.push, '/invoice/create');
          break;
        case 'OpenJob':
          Helper.nextRouter(Router.push, `/job/[id]`, `/job/${selectedJob.ID}`);
          break;
        case 'OpenQuery':
          Helper.nextRouter(Router.push, `/query/[id]`, `/query/${selectedQuery.ID}`);
          break;
        case 'OpenCustomer':
          Helper.nextRouter(Router.push, `/customer/[id]`, `/customer/${selectedCustomer.ID}`);
          break;
        case 'EditPreferences':
          setShowPreferencesModal(true);
          break;
      }
    }
  }

  useEffect(() => {
    getOptionButtons();
  }, [selectedJob, selectedQuery]);

  // ACCORDION

  const headerAccordionBodyRef = useRef(null);
  const [headerHeight, setHeaderHeight] = useState('0px');
  const [headerChevron, setHeaderChevron] = useState('');
  const [showHeaderContents, setShowHeaderContents] = useState(false);

  async function toggleHeaderAccordion() {
    await Helper.waitABit();
    setShowHeaderContents(!showHeaderContents);
  }

  useEffect(() => {
    setHeaderHeight(showHeaderContents ? `${headerAccordionBodyRef.current ? headerAccordionBodyRef.current.scrollHeight + 5 : 0}px` : `0px`);
    setHeaderChevron(showHeaderContents ? `accordion-header-img-flipped` : ``);
  }, [showHeaderContents, store]);

  const detailsAccordionBodyRef = useRef(null);
  const [detailsHeight, setDetailsHeight] = useState('0px');
  const [detailsChevron, setDetailsChevron] = useState('');
  const [showDetailContents, setShowDetailContents] = useState(isNew);
  const [detailsOpened, setDetailsOpened] = useState(isNew);

  async function toggleDetailsAccordion() {
    await Helper.waitABit();
    setShowDetailContents(!showDetailContents);
    setDetailsOpened(!detailsOpened);
  }

  useEffect(() => {
    setDetailsHeight(showDetailContents ? `${detailsAccordionBodyRef.current ? detailsAccordionBodyRef.current.scrollHeight + 65 : 0}px` : `0px`);
    setDetailsChevron(showDetailContents ? `accordion-header-img-flipped` : ``);
  }, [showDetailContents, invoiceItems.length, selectedCustomer, showJobLink, showQueryLink, showProjectLink]);

  // SAVE

  const [saving, setSaving] = useState(false);

  const validate = () => {
    let inputs = [
      { key: 'InvoiceDate', value: invoice.InvoiceDate, required: true, type: Enums.ControlType.Date },
      { key: 'DueDate', value: invoice.DueDate, required: true, type: Enums.ControlType.Date },
      { key: 'DueDate', value: invoice.DueDate, type: Enums.ControlType.Date, gte: Time.getDate(invoice.InvoiceDate), df: 'yyyy-MM-dd' },
      { key: 'DiscountPercentage', value: invoice.DiscountPercentage, btw: [0, 100], type: Enums.ControlType.Number },
      { key: 'Customer', value: selectedCustomer, required: true, type: Enums.ControlType.Custom },
      { key: 'Contact', value: contact, required: true, type: Enums.ControlType.Custom },
    ];

    if (isMultiStore && isNew) {
      inputs = [...inputs,
      { key: 'Store', value: selectedStore, required: true, type: Enums.ControlType.Select }
      ];
    }

    const { isValid, errors } = Helper.validateInputs(inputs);
    setInputErrors(errors);

    return isValid;
  }

  const compareJobInventory = async (invoiceToSave, invoiceItemsToSave) => {
    return new Promise(async (resolve, reject) => {
      let output = {
        continue: false,
        merge: false,
        add: false,
        ignore: false
      };

      if (!invoiceToSave.ItemID || invoiceToSave.Module !== Enums.Module.JobCard) {
        output.continue = true;
        resolve(output);
        return;
      }

      let result = await invoiceService.compareJobInventory(invoiceToSave, invoiceItemsToSave, toast);

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

      // let okIsAdd = result.CanAdd;
      // let discardIsMerge = result.CanMerge && okIsAdd;
      // let okIsMerge = result.CanMerge && !discardIsMerge;

      // setConfirmOptions({
      //   ...Helper.initialiseConfirmOptions(),
      //   display: true,
      //   confirmButtonText: okIsAdd ? "Add" : okIsMerge ? "Merge" : "?",
      //   discardButtonText: discardIsMerge ? "Merge" : "?",
      //   showDiscard: discardIsMerge,
      //   heading: "Invoice Items linked to Job",
      //   text: "There are more invoice items linked to the job than there are materials. Please decide how you want to correct job material quantities.",
      //   onCancel: () => {
      //     output.continue = false;
      //     resolve(output);
      //   },
      //   onConfirm: () => {
      //     if (okIsAdd) output.add = true;
      //     else if (okIsMerge) output.merge = true;
      //     resolve(output);
      //   },
      //   onDiscard: () => {
      //     if (discardIsMerge) output.merge = true;
      //     resolve(output);
      //   }
      // });
    });
  }


  const saveInvoice = async (status, routeChange = false, exportMode = 'none', performMergeChecks = false) => {

    setSaving(true);

    let isValid = validate();
    if (!isValid) {
      toast.setToast({
        message: 'There are errors on the page',
        show: true,
        type: Enums.ToastType.error,
      });
      setSaving(false);
      return false;
    }

    let invoiceItemsToSave = getInvoiceItemsValue();

    if (invoiceItemsToSave.length <= 0) {
      toast.setToast({
        message: 'Please add invoice items',
        show: true,
        type: Enums.ToastType.error,
      });
      setSaving(false);
      return false;
    }
    else if (useNewTable && invoiceItemsToSave.length > 0) {
      let itemsInError = invoiceItemsToSave.filter(x => !!x.InventorySectionID && !x.InventorySectionName);
      if (itemsInError.length > 0) {
        toast.setToast({
          message: 'All sections require a title',
          show: true,
          type: Enums.ToastType.error
        })
        setSaving(false);
        return false;
      }
    }

    if (invoice.TotalInclusive < 0) {
      toast.setToast({
        message: 'Invoice total can\'t be negative',
        show: true,
        type: Enums.ToastType.error,
      });
      setSaving(false);
      return false;
    }

    let result = {};

    const sections = getSectionsFromTableData(invoiceItemsToSave, 'InventorySectionName', 'InventorySectionID', Enums.Module.Invoice, isNew ? null : invoice.ID)

    let invoiceToSave = {
      ...invoice,
      CustomerID: selectedCustomer.ID,
      CustomerContactID: contact ? contact.ID : null,
      LocationID: location ? location.ID : null,
      EmployeeID: selectedEmployee ? selectedEmployee.ID : null,
      Customer: selectedCustomer,
      Contact: contact ? contact : null,
      Location: location ? location : null,
      Employee: selectedEmployee,
      // InvoiceStatus: status ? status : Enums.InvoiceStatus.Draft, // <- will always set to draft if no status
      InvoiceStatus: status ? status : invoice.InvoiceStatus ?? Enums.InvoiceStatus.Draft,
      Module: !Helper.isNullOrUndefined(module) ? module : invoice.Module,
      ItemID: itemID ? itemID : invoice.ItemID,
      RowVersion: rowVersion.current
    };

    if (isMultiStore && isNew) {
      invoiceToSave = {
        ...invoiceToSave,
        StoreID: selectedStore ? selectedStore.ID : null,
        Store: selectedStore ? selectedStore : null,
      };
    }

    if (isNew) {

      if (copyFromInvoice) {
        invoiceItemsToSave.map((item, index) => {
          item.ID = null;
          item.InvoiceID = null;
        });
        invoiceToSave = {
          ...invoiceToSave,
          ID: null,
          InvoiceNumber: null,
          IsClosed: false,
          IntegrationLineID: null,
          IntegrationLineExternalDocNumber: null
        };
      }

      invoiceItemsToSave.map((item, index) => {
        if (!item.TaxPercentage) {
          item.TaxPercentage = 0;
        }
      });

      let compareResult = {};
      if (hasStockControl && performMergeChecks && crudConfigMetaData.values.compareJobInventoryOnApprove) {
        compareResult = await compareJobInventory(invoiceToSave, invoiceItemsToSave);
        if (!compareResult.continue) {
          setSaving(false);
          return false;
        }
      }

      result = await Fetch.post({
        url: `/Invoice`,
        params: {
          Invoice: invoiceToSave,
          InvoiceItems: invoiceItemsToSave,
          InventorySections: sections,
          JobInventoryCompare: hasStockControl ? (compareResult.add ? "add" : compareResult.merge ? "merge" : null) : null
        },
        toastCtx: toast
      });
    } else {

      let { subTotalExclusive, totalTax, totalExclusive } = getTotals(true);
      const temp = {
        ...invoiceToSave,
        SubTotalExclusive: Helper.roundToTwo(subTotalExclusive),
        TotalExclusive: Helper.roundToTwo(totalExclusive),
        TotalTax: Helper.roundToTwo(totalTax),
        // TotalInclusive: Helper.roundToTwo(totalExclusive + totalTax),
        TotalInclusive: Helper.roundToTwo(totalExclusive) + Helper.roundToTwo(totalTax),
      };

      invoiceItemsToSave.map((item, index) => {
        if (item.TaxPercentage) {
          if (item.TaxPercentage > 0) {
            item.TaxPercentage = company.TaxPercentage;
          }
        } else {
          item.TaxPercentage = 0;
        }
      });

      let compareResult = {};
      if (hasStockControl && performMergeChecks && crudConfigMetaData.values.compareJobInventoryOnApprove) {
        compareResult = await compareJobInventory(invoiceToSave, invoiceItemsToSave);
        if (!compareResult.continue) {
          setSaving(false);
          return false;
        }
      }

      result = await Fetch.put({
        url: '/Invoice',
        params: {
          Invoice: temp,
          InvoiceItems: invoiceItemsToSave,
          InventorySections: sections,
          JobInventoryCompare: hasStockControl ? (compareResult.add ? "add" : compareResult.merge ? "merge" : null) : null
        },
        toastCtx: toast
      });
    }

    if (result.ID) {

      if (isNew) {
        Helper.mixpanelTrack(constants.mixPanelEvents.createInvoice, {
          "invoiceID": result.ID
        });
      } else {
        Helper.mixpanelTrack(constants.mixPanelEvents.editInvoice, {
          "invoiceID": result.ID
        });
      }

      if (!routeChange) {
        toast.setToast({
          message: 'Invoice saved successfully',
          show: true,
          type: Enums.ToastType.success
        });
      }

      setFormIsDirty(false);
      await Helper.waitABit();
      if (exportMode !== 'none') {
        exportDocument(exportMode);
      }
      if (isNew) {
        Helper.nextRouter(Router.push, '/invoice/[id]', `/invoice/${result.ID}`);
      } else {
        setInvoice(result);
        setInvoiceItems(result.InvoiceItems);
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

  Helper.preventRouteChange(formIsDirty, setFormIsDirty, setConfirmOptions, saveInvoice);

  const [isPrinting, setIsPrinting] = useState(false);
  const exportDocument = async (mode) => {
    /*let proceed = true;
    // if (formIsDirty) {
    //   proceed = await saveInvoice(invoice.InvoiceStatus);
    // }

    if (proceed) {
      DownloadService.downloadFile("GET", `/Invoice/GetInvoiceDocument?invoiceID=${invoice.ID}`, null, true, false);
    }*/
    setIsPrinting(true)
    // DownloadService.downloadFile("GET", `/Quote/GetQuoteDocument?quoteID=${quote.ID}`, null, true, false);
    DownloadService.downloadFile("GET", `/Invoice/GetInvoiceDocument?invoiceID=${invoice.ID}`, null, mode === 'view', false, "", "", null, false, (() => {
      setIsPrinting(false);
    }));
  };

  const processInvoice = async () => {
    confirmProcess();
  };

  const confirmProcess = async () => {
    setConfirmOptions({
      display: true,
      heading: "Confirm",
      text: `Are you sure you want to mark invoice items as processed?`,
      confirmButtonText: "Confirm",
      showCancel: true,
      onConfirm: async () => {
        let result = await invoiceService.markInvoiceStockAsUsed(invoice.ID, toast);
        if (result?.ID) {
          setInvoice(result);
          getOptionButtons(result.InvoiceStatus);
          toast.setToast({
            message: 'Invoice marked as processed successfully',
            show: true,
            type: 'success'
          });
        }
      }
    });
  };

  const sendInvoice = () => {
    Helper.nextRouter(Router.push, `/new-communication/[id]?moduleCode=${Enums.Module.Invoice}&method=email&attachInvoice=true`, `/new-communication/${invoice.ID}?moduleCode=${Enums.Module.Invoice}&method=email&attachInvoice=true`);
  };

  // Invoice to Integration Partner

  const [integration, setIntegration] = useState(null);
  const [integrationTooltip, setIntegrationTooltip] = useState('');

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
          : `Invoice on ${Enums.getEnumStringValue(Enums.IntegrationPartner, temp.Partner)} has status of ${Enums.getEnumStringValue(Enums.IntegrationStatus, temp.Status)}`);
      }
    }
  };

  useEffect(() => {
    getOptionButtons();
  }, [integration]);

  const sendToPartner = async () => {

    let inactiveInventory = invoiceItems.some(x => x.InvoiceItemType == Enums.InvoiceItemType.Inventory && !x.InventoryActive);

    if (inactiveInventory) {
      toast.setToast({
        message: 'Invoice items contains inventory that is not active',
        show: true,
        type: Enums.ToastType.error
      });
    } else {
      const result = await Fetch.post({
        url: `/Invoice/InvoiceSync?invoiceID=${invoice.ID}`,
        toastCtx: toast
      });
      if (result.ID) {
        toast.setToast({
          message: 'Invoice successfully queued for sync',
          show: true,
          type: 'success'
        });
        setInvoice(result);
      } else {
        toast.setToast({
          message: 'Invoice failed to sync',
          show: true,
          type: Enums.ToastType.error
        });
      }
    }
  };

  const getInvoiceStatusButtonText = () => {
    if (invoice.InvoiceStatus == Enums.InvoiceStatus.Paid && invoice.HasPayFastIntegration && invoice.PayFastExternalID) {
      return Enums.getEnumStringValue(Enums.InvoiceStatus, invoice.InvoiceStatus) + " (PayFast Ref: " + invoice.PayFastExternalID + ")";
    }

    return Enums.getEnumStringValue(Enums.InvoiceStatus, invoice.InvoiceStatus);
  };

  const trackOnlinePaymentButtonMixpanel = (action) => {
    Helper.mixpanelTrack(constants.mixPanelEvents.onlinePaymentButtonClick, {
      provider: "payfast",
      linkRoute: "/settings/payment/payfast",
      itemModule: Enums.Module.Invoice,
      itemID: invoice.ID,
      action: action
    });
  };

  const onlinePaymentConfirm = async () => {

    trackOnlinePaymentButtonMixpanel("openConfirm");

    setConfirmOptions({
      display: true,
      heading: "PayFast Integration",
      text: `Start accepting online payments for your invoices through PayFast.`,
      confirmButtonText: "Setup PayFast",
      showCancel: true,
      onConfirm: async () => {
        trackOnlinePaymentButtonMixpanel("confirmClick");
        Helper.nextRouter(Router.push, '/settings/payment/payfast');
      },
      onCancel: () => {
        trackOnlinePaymentButtonMixpanel("cancelClick");
      }
    });
  };

  const [showPopover, setShowPopover] = useState(false);
  /*const anchor = useRef(null);
  const paymentRef = useRef(null);*/

  const openPopover = () => {
    if (!showPopover) {
      setShowPopover(true);
    }
  };

  const setupPayFast = () => {
    Helper.nextRouter(Router.push, '/settings/payment/payfast');
  };

  // useOutsideClick(paymentRef, () => {
  //   if (showPopover) {
  //       setShowPopover(false);
  //   }
  // });

  const [useNewTable, setUseNewTable] = useState(null)

  const invoiceDetails = () => {
    return (
      <>
        <div>

          <Flex justify={'space-between'} wrap={'wrap'} gap={'sm'}>
            <div style={{ flexGrow: 1 }}>

              {/* {isMultiStore ?
                  isNew ?
                    <div className="store-selection">
                      <SelectInput
                        changeHandler={handleStoreChange}
                        error={inputErrors.Store}
                        label="Store name"
                        options={stores}
                        placeholder="Search for a store"
                        required={true}
                        searchFunc={searchStores}
                        searching={searching}
                        setSelected={setSelectedStore}
                        totalOptions={storesTotalResults}
                        type="store"
                        value={storeSearch}
                        autoSearch={true}
                      />
                    </div> : <div className="store-selection customer-header">{selectedStore ? selectedStore.Name : ''}</div> : ''
                } */}

              {isMultiStore ?

                <StoreSelector
                  disabled={!isNew}
                  error={inputErrors.Store}
                  required={true}
                  selectedStore={selectedStore}
                  setSelectedStore={(e) => {
                    setSelectedStore(e);
                    setFormIsDirty(true);
                  }}
                />

                : <></>}

              <CustomerContactLocationSelector
                isNew={isNew}
                selectedCustomer={selectedCustomer}
                setSelectedCustomer={setSelectedCustomer}
                canChangeCustomer={isNew && !customerLinkLockdown}
                selectedContact={contact}
                setSelectedContact={updateContact}
                selectedLocation={location}
                setSelectedLocation={updateLocation}
                detailsView={false}
                canEditCustomerInNormalView={true}
                module={Enums.Module.Invoice}
                inputErrors={inputErrors}
                accessStatus={props.accessStatus}
                cypressCustomer={"data-cy-customer"}
                cypressContact={"data-cy-contact"}
                cypressLocation={"data-cy-location"}
                iconMode
                mt={!isMultiStore ? 32 : 'sm'}
              />

            </div>
            <Box w={{ base: '100%', md: 'auto' }} style={{ flexGrow: 0, maxWidth: 500 }}>
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
                    value={invoice.Reference}
                    error={inputErrors.Reference}
                  />
                </div>
                {/* <TextInput
                    cypress={"data-cy-reference-number"}
                    extraClasses="invoice-reference-number"
                    label="Reference number"
                    changeHandler={(e) => handleInputChange({ target: { name: "Reference", value: e.target.value } })}
                    value={invoice.Reference}
                    error={inputErrors.Reference}
                  /> */}
              </div>
              <div className="row">
                <div className="column right-padding">
                  <SCDatePicker
                    label="Invoice date"
                    required={true}
                    onChange={(day) => updateInvoiceDate(day)}
                    value={invoice.InvoiceDate}
                    error={inputErrors.InvoiceDate}
                  />
                  {/* <KendoDatePicker
                      label="Invoice date"
                      required={true}
                      changeHandler={(day) => updateInvoiceDate(day)}
                      value={invoice.InvoiceDate}
                      error={inputErrors.InvoiceDate}
                    /> */}
                </div>
                <div className="column left-padding">
                  <SCDatePicker
                    name={"DueDate"}
                    label="Due date"
                    required={true}
                    onChange={(day) => handleInputChange({ target: { name: "DueDate", value: day } })}
                    value={invoice.DueDate}
                    error={inputErrors.DueDate}
                  />
                  {/* <KendoDatePicker
                      name={"DueDate"}
                      cypress={"data-cy-due-date"}
                      label="Due date"
                      required={true}
                      changeHandler={(day) => handleInputChange({ target: { name: "DueDate", value: day } })}
                      value={invoice.DueDate}
                      error={inputErrors.DueDate}
                    /> */}
                </div>
              </div>
              {
                (
                  !!selectedCustomer
                ) &&
                <Flex gap={'md'} mt={'lg'} justify={'space-around'}>
                  {
                    showJobLink && (selectedJob || (!selectedQuery && !selectedProject)) &&
                    <LinkItem lockdown={jobLinkLockdown} customerID={selectedCustomer.ID} setSelected={linkInvoiceToJob}
                      selectedItem={selectedJob} module={Enums.Module.JobCard}
                      size={{ label: 'md', actionIcon: 'sm' }}
                    />
                  }
                  {
                    showQueryLink && (selectedQuery || (!selectedJob && !selectedProject)) &&
                    <LinkItem
                      lockdown={queryLinkLockdown} customerID={selectedCustomer.ID} setSelected={linkInvoiceToQuery}
                      selectedItem={selectedQuery} module={Enums.Module.Query}
                      size={{ label: 'md', actionIcon: 'sm' }}
                    />
                  }
                  {
                    showProjectLink && (selectedProject || (!selectedQuery && !selectedJob)) &&
                    <LinkItem selectedItem={selectedProject} setSelected={linkInvoiceToProject} customerID={selectedCustomer.ID}
                      lockdown={projectLinkLockdown} module={Enums.Module.Project}
                      size={{ label: 'md', actionIcon: 'sm' }}
                    />
                  }


                </Flex>
              }
              {/*<div className="row">
                {selectedCustomer && showJobLink ?
                  <LinkToJob legacyBehavior={true} lockdown={jobLinkLockdown} customerID={selectedCustomer.ID} setSelected={linkInvoiceToJob} selectedJob={selectedJob} />
                  : ''
                }
              </div>
              <div className="row">
                {selectedCustomer && showQueryLink ?
                  <LinkToQuery legacyBehavior={true} lockdown={queryLinkLockdown} customerID={selectedCustomer.ID} setSelected={linkInvoiceToQuery} selectedQuery={selectedQuery} />
                  : ''
                }
              </div>
              <div className="row">
                {selectedCustomer && showProjectLink ?
                  <LinkToProject legacyBehavior={true} selectedProject={selectedProject} onProjectSelect={linkInvoiceToProject} customerID={selectedCustomer.ID}
                    lockdown={projectLinkLockdown} dropdownDirection={'down'} />
                  : ''
                }
              </div>*/}
              <div className="row">
                <div className="column">
                  <EmployeeSelector
                    selectedEmployee={selectedEmployee}
                    setSelectedEmployee={assignEmployee}
                    storeID={(invoice.StoreID ? invoice.StoreID : selectedStore ? selectedStore.ID : null)}
                  />
                </div>
                {/* <AssignEmployee selectedEmployee={selectedEmployee} setSelected={assignEmployee} storeID={(invoice.StoreID ? invoice.StoreID : selectedStore ? selectedStore.ID : null)} /> */}
              </div>
            </Box>
          </Flex>
        </div>

        <InvoiceDetailsSections
            invoice={invoice}
            items={invoiceItems}
            error={inputErrors.InvoiceItems}
            itemID={itemID}
            module={module}
            customerID={selectedCustomer ? selectedCustomer.ID : externalCustomerID || null}
            updateItems={updateInvoiceItems}
            companyTaxPercentage={company.TaxPercentage}
            integration={integration}
            accessStatus={props.accessStatus}
            invoiceIsNew={isNew}
        />
        {
         /* useNewTable === true ?
            <InvoiceDetailsSections
              invoice={invoice}
              items={invoiceItems}
              error={inputErrors.InvoiceItems}
              itemID={itemID}
              module={module}
              customerID={selectedCustomer ? selectedCustomer.ID : null}
              updateItems={updateInvoiceItems}
              companyTaxPercentage={company.TaxPercentage}
              integration={integration}
              accessStatus={props.accessStatus}
              invoiceIsNew={isNew}
            />
            : useNewTable === false ?
              <div className="row">
                <InvoiceDetails
                  invoice={invoice}
                  items={invoiceItems}
                  error={inputErrors.InvoiceItems}
                  itemID={itemID}
                  module={module}
                  customerID={selectedCustomer ? selectedCustomer.ID : null}
                  cypressSelector={"data-cy-inventory-selector"}
                  cypressQuantity={"data-cy-quantity"}
                  updateItems={updateInvoiceItems}
                  companyTaxPercentage={company.TaxPercentage}
                  integration={integration}
                  accessStatus={props.accessStatus}
                />

              </div>
              : <></>*/
        }




        <Flex gap={'lg'} justify={'space-between'} wrap={'wrap'}>
          <Box style={{ flexGrow: 1 }} maw={800} miw={{ base: 'auto', xs: 400 }}>
            <SCTextArea
              label="Notes"
              onChange={(e) => handleInputChange({ target: { name: "Comment", value: e.value } })}
              value={invoice.Comment}
              w={'100%'}
              maw={'100%'}
            />
          </Box>
          <Box ml={'auto'} miw={340} mr={useNewTable ? (invoice.InvoiceStatus === Enums.InvoiceStatus.Draft ? "80px" : "30px") : "0"} >
            <div>
              {isNew ? <div className="add-top-margin"></div> :
                invoice.DiscountPercentage > 0 ? <div className="row add-bottom-margin">
                  <div className="column end">
                    <SCNumericInput
                      label="Total Discount %"
                      format={Enums.NumericFormat.Percentage}
                      onChange={(e) => handleInputChange({ target: { name: "DiscountPercentage", value: e.value } })}
                      required={false}
                      value={invoice.DiscountPercentage}
                      error={inputErrors.DiscountPercentage}
                    />
                    {/* <TextInput
                    label="Total Discount %"
                    type="number"
                    changeHandler={(e) => handleInputChange({ target: { name: "DiscountPercentage", value: e.target.value } })}
                    required={false}
                    value={invoice.DiscountPercentage}
                    error={inputErrors.DiscountPercentage}
                  /> */}
                  </div>
                </div> : <div className="add-top-margin"></div>
              }

              <div className="row total-row">
                <div className="column">
                  Subtotal Excl VAT
                </div>
                <div className="column end">
                  {Helper.getCurrencyValue(invoice.SubTotalExclusive, currencySymbol)}
                </div>
              </div>

              {invoice.DiscountPercentage > 0 ?
                <div className="row total-row">
                  <div className="column">
                    Discount
                  </div>
                  <div className="column end">
                    {Helper.getCurrencyValue(-(invoice.SubTotalExclusive - invoice.TotalExclusive), currencySymbol)}
                  </div>
                </div> : ''
              }

              <div className="row total-row">
                <div className="column">
                  Total Excl VAT
                </div>
                <div className="column end">
                  {Helper.getCurrencyValue(invoice.TotalExclusive, currencySymbol)}
                </div>
              </div>
              <div className="row total-row">
                <div className="column">
                  VAT
                </div>
                <div className="column end">
                  {Helper.getCurrencyValue(invoice.TotalTax, currencySymbol)}
                </div>
              </div>
              <div className="row total-row grand-total">
                <div className="column">
                  Total Incl VAT
                </div>
                <div className="column end">
                  {Helper.getCurrencyValue(invoice.TotalInclusive, currencySymbol)}
                </div>
              </div>

            </div>
          </Box>
        </Flex>

        <Flex gap={'lg'} justify={'space-between'} wrap={'wrap-reverse'}>
          {
            !isNew && getPaymentAccess() &&
            <Box style={{ flexGrow: 1 }} maw={750}>
              <PaymentsList
                setPayments={updatePaymentList}
                accessStatus={props.accessStatus}
                module={Enums.Module.Invoice}
                customerID={selectedCustomer ? selectedCustomer.ID : null}
                invoice={invoice}
                amountDue={amountDue}
                currencySymbol={currencySymbol}
                refreshParent={async () => {
                  return (await refreshInvoice())
                }}
                markInvoiceAsPaid={() => {
                  statusChangeConfirmed(Enums.InvoiceStatus.Paid)
                }}
              />
            </Box>
          }

          {
            paymentsList?.length > 0 &&
            (
              <Box miw={340} mt={'var(--mantine-spacing-lg)'}
                ml={'auto'}
                mr={useNewTable ? (invoice.InvoiceStatus === Enums.InvoiceStatus.Draft ? "80px" : "30px") : "0"}
              >
                <div className="row total-row">
                  <div className="column">
                    Payments Received
                  </div>
                  <div className="column end">
                    {Helper.getCurrencyValue(lessPayments, currencySymbol)}
                  </div>
                </div>
                <div className="row total-row">
                  <div className="column">
                    Amount Due
                  </div>
                  <div className="column end">
                    {Helper.getCurrencyValue(amountDue, currencySymbol)}
                  </div>
                </div>
              </Box>
            )
          }
        </Flex>
        <div className="row">
          {/* <TextArea
            label="Comments"
            changeHandler={(e) => handleInputChange({ target: { name: "Comment", value: e.target.value } })}
            value={invoice.Comment}
          /> */}
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
          <div className="row">
            <div className="column">
            </div>
            <div className="column-fixed">
              <div className="row">
                <div className="column"></div>
                <div className="column end">
                  <div className="row">
                    <div className="create-button">
                      <LegacyButton text="Create Invoice" onClick={() => saveInvoice(Enums.InvoiceStatus.Draft)} disabled={saving} />
                    </div>
                  </div>
                  <Space h={50} />
                </div>
              </div>
            </div>
          </div> : ''
        }

        {!isNew ?
          <AuditLog recordID={invoice.ID} retriggerSearch={invoice} /> : ''
        }

        <style jsx>{`
        .invoice-section {
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
        .customer-container {
          line-height: 24px;
          color: ${colors.darkPrimary};
        }
        .customer-header {
          font-weight: bold;
          margin-top: 0.5rem;      
        }
        .customer-header img {
          margin-left: 1rem;
          margin-bottom: -0.3rem;
          cursor: pointer;
        }
        .customer-buttons {
          display: flex;
          flex-direction: row;
          line-height: 48px;
        }
        .customer-button {
          color: ${colors.bluePrimary};
          cursor: pointer;
          margin-right: 26px;
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
          width: 10rem;
          margin-top: 1rem;
          margin-bottom: 1rem;
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
        .status {
          width: 20rem;
          margin-top: -1rem;
        }
        .status :global(.input-container){
          background-color: ${colors.bluePrimary};
        }
        .status :global(input) {
          color: ${colors.white};
        }
        .status :global(label){
          color: ${colors.white};
          opacity: 0.8;
        }
      `}
        </style>
      </>
    );
  }

  const { height: toolbarHeight, ref: toolbarRef } = useElementSize()

  return (
    <div>

      <Box bg={'white'} ref={toolbarRef}>
        <Flex justify={'apart'} w={'100%'} mt={'15px'} gap={'sm'} px={10}>
          <Flex align={'center'}>
            {isNew ?
              <Breadcrumbs currPage={{ text: 'Create Invoice', link: '/invoice/create', type: 'create' }} /> :
              <Breadcrumbs
                currPage={{ text: invoice.InvoiceNumber, link: `/invoice/${invoice.ID}`, type: 'invoice-show' }} />
            }
          </Flex>
          {
            !isNew &&
            <ToolbarButtons
              buttonGroups={[
                [
                  {
                    show: !invoice.HasPayFastIntegration && invoice.InvoiceStatus !== Enums.InvoiceStatus.Paid && masterOfficeAdminPermission,
                    type: 'button',
                    breakpoint: 780,
                    icon: <img src="/icons/online-payment.svg" alt="" />,
                    text: 'Online Payment',
                    variant: 'outline',
                    onClick: onlinePaymentConfirm
                  }
                ],
                [
                  {
                    type: 'button',
                    // disabled: true,
                    variant: 'light',
                    classNames: {
                      root: Enums.getEnumStringValue(Enums.InvoiceStatusColor, invoice.InvoiceStatus)
                    },
                    fw: 600,
                    // color: Enums.getEnumStringValue(Enums.InvoiceStatusColor, invoice.InvoiceStatus).toLowerCase(),
                    text: <Text fw={700} size={'md'}>{getInvoiceStatusButtonText()}</Text>,
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
                  {
                    type: 'button',
                    show: invoice.InvoiceStatus === Enums.InvoiceStatus.Draft,
                    disabled: props.accessStatus === Enums.AccessStatus.LockedWithAccess || props.accessStatus === Enums.AccessStatus.LockedWithOutAccess,
                    text: "Approve Invoice",
                    variant: 'default',
                    onClick: approveInvoiceClick,
                  }
                ],
                [
                  /*{
                    breakpoint: 1100,
                    type: 'button',
                    disabled: props.accessStatus === Enums.AccessStatus.LockedWithAccess || props.accessStatus === Enums.AccessStatus.LockedWithOutAccess,
                    text: "Print",
                    icon: <IconPrinter />,
                    variant: 'default',
                    onClick: saving ? null : () => setTimeout(() => {
                      saveInvoice(invoice.InvoiceStatus, false, true);
                    }, 50),
                  },*/
                  {
                    breakpoint: 1100,
                    type: 'custom',
                    children: [
                      <Button
                          key={'printButton'}
                          variant={'default'}
                          // disabled={isPrinting || saving}
                          onClick={() => !saving && !isPrinting && saveInvoice(invoice.InvoiceStatus, false, 'download')}
                          // color={'violet'}
                          leftSection={isPrinting ? <Loader size={16}/> : <IconPrinter size={18}/>}
                          rightSection={
                            <ActionIcon
                                // disabled={isPrinting || saving}
                                variant={'subtle'}
                                size={'compact-sm'}
                                color={'dark.5'}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  !saving && !isPrinting && saveInvoice(invoice.InvoiceStatus, false, 'view')
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
                    tooltip: 'test',
                    icon: <IconSend />,
                    type: 'button',
                    disabled: props.accessStatus === Enums.AccessStatus.LockedWithAccess || props.accessStatus === Enums.AccessStatus.LockedWithOutAccess,
                    text: "Send Invoice",
                    variant: 'default',
                    onClick: sendInvoice,
                  }
                ],
                ...(
                  integration && invoice.InvoiceStatus !== Enums.InvoiceStatus.Draft && [
                    [
                      {
                        show: invoice.InvoiceSyncStatus === Enums.SyncStatus.Pending,
                        type: 'button',
                        disabled: true,
                        variant: 'default',
                        text: invoice.InvoiceStatus === Enums.InvoiceStatus.Cancelled ? `Cancelled` : `Pending Invoice to ${Enums.getEnumStringValue(Enums.IntegrationPartner, integration?.Partner)}`,
                      },
                      {
                        show: invoice.InvoiceSyncStatus === Enums.SyncStatus.Synced,
                        type: 'button',
                        disabled: true,
                        variant: 'default',
                        text: `Synced: ${invoice.InvoiceExternalDocNumber}`,
                      },
                      {
                        show: invoice.InvoiceSyncStatus === Enums.SyncStatus.Deleted,
                        type: 'button',
                        disabled: true,
                        variant: 'default',
                        text: `Deleted`,
                      },
                      {
                        show: invoice.InvoiceSyncStatus === Enums.SyncStatus.Failed,
                        type: 'custom',
                        children: <Box>
                          <Tooltip color={'yellow.7'} maw={300} multiline label={integrationTooltip}
                            disabled={!integrationTooltip}
                            events={{ hover: true, focus: true, touch: true }}
                          >
                            <Button
                              disabled={props.accessStatus === Enums.AccessStatus.LockedWithAccess || props.accessStatus === Enums.AccessStatus.LockedWithOutAccess}
                              leftSection={<IconSend />}
                              rightSection={<Box style={{ cursor: 'help' }}>
                                {/*<HelpDialog position="bottom" message={`${invoice.InvoiceSyncMessage}`} width={175} />*/}
                                <AlertIcon message={invoice.InvoiceSyncMessage} width={175} />
                              </Box>}
                              variant={'default'}
                              onClick={() => integration.Status === Enums.IntegrationStatus.Live ? sendToPartner() : {}}>
                              Retry Invoice
                              to {Enums.getEnumStringValue(Enums.IntegrationPartner, integration?.Partner)}
                            </Button>
                          </Tooltip>
                        </Box>
                      },
                      {
                        show: invoice.InvoiceSyncStatus === Enums.SyncStatus.Never,
                        type: 'custom',
                        children: <Box>
                          <Tooltip color={'yellow.7'} maw={300} multiline label={integrationTooltip}
                            disabled={!integrationTooltip}
                            events={{ hover: true, focus: true, touch: true }}
                          >
                            <Button
                              disabled={props.accessStatus === Enums.AccessStatus.LockedWithAccess || props.accessStatus === Enums.AccessStatus.LockedWithOutAccess}
                              onClick={() => integration.Status === Enums.IntegrationStatus.Live ? sendToPartner() : {}}
                              leftSection={<IconSend />}
                              variant={'default'}
                            >
                              Send Invoice
                              to {Enums.getEnumStringValue(Enums.IntegrationPartner, integration?.Partner)}
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
                    onClick: saving ? null : () => setTimeout(() => {
                      saveInvoice(invoice.InvoiceStatus, false, 'none');
                    }, 50),
                  }
                ]
              ]}
              style={{ flexGrow: 1 }} ml={'auto'} gap={5} wrap={'wrap'}
            />
          }
        </Flex>
        {
          !isNew &&
          <Tabs
            selectedTab={selectedTab}
            setSelectedTab={setSelectedTab}
            tabs={pageTabs}
            useNewTabs
            tabsProps={
              { mt: { base: 'sm', xl: 0 }, mx: { base: 1, sm: 'xs', md: 'sm', lg: 'md' } }
            }
          />
        }
      </Box>


      {/*{<div className="row">
        {isNew ?
          '' :
          <NoSSR>
            {<div className="actions">

              {
                !invoice.HasPayFastIntegration && invoice.InvoiceStatus != Enums.InvoiceStatus.Paid && masterOfficeAdminPermission ?
                <div className="online-payment-container" onClick={onlinePaymentConfirm} ref={paymentRef}>
                  <div className='online-payment-icon'>
                    <img src="/icons/online-payment.svg" alt="online payment" />
                  </div>
                  <div className="online-payment-text" ref={anchor}>
                    Online Payment
                  </div>
                </div> : ''
              } ✅


                <Button extraClasses={`${Enums.getEnumStringValue(Enums.InvoiceStatusColor, invoice.InvoiceStatus)}`} disabled={true} text={`${getInvoiceStatusButtonText()}`} /> ✅
              ✅


              <ButtonDropdown disabled={props.accessStatus === Enums.AccessStatus.LockedWithAccess || props.accessStatus === Enums.AccessStatus.LockedWithOutAccess}
                action={optionsClick}
                text="Options"
                options={optionButtons}
                ✅
              />

              {invoice.InvoiceStatus == Enums.InvoiceStatus.Draft ?
                <Button disabled={props.accessStatus === Enums.AccessStatus.LockedWithAccess || props.accessStatus === Enums.AccessStatus.LockedWithOutAccess}
                  text={"Approve Invoice"} extraClasses="white-action" onClick={approveInvoiceClick} /> : ''
             ✅
              }


              <Button disabled={props.accessStatus === Enums.AccessStatus.LockedWithAccess || props.accessStatus === Enums.AccessStatus.LockedWithOutAccess}
                text={"Print"} icon="pdf-blue-gray" extraClasses="white-action" onClick={saving ? null : () => setTimeout(() => { saveInvoice(invoice.InvoiceStatus, false, true); }, 50)} />
                ✅


              <Button disabled={props.accessStatus === Enums.AccessStatus.LockedWithAccess || props.accessStatus === Enums.AccessStatus.LockedWithOutAccess}
                text={"Send Invoice"} icon="send" extraClasses="white-action" onClick={sendInvoice} />
                ✅


              {/* {[Enums.InvoiceStatus.Unpaid, Enums.InvoiceStatus.Paid, Enums.InvoiceStatus.Overdue].includes(invoice.InvoiceStatus) && <Button disabled={props.accessStatus === Enums.AccessStatus.LockedWithAccess || props.accessStatus === Enums.AccessStatus.LockedWithOutAccess}
                text={"Process Invoice"}  extraClasses="orange" onClick={processInvoice} />
              } */}

      {/* {integration && invoice.InvoiceStatus != Enums.InvoiceStatus.Draft ?

                invoice.InvoiceSyncStatus == Enums.SyncStatus.Pending ?
                  invoice.InvoiceStatus == Enums.InvoiceStatus.Cancelled ?
                    <LegacyButton disabled={true} text={`Cancelled`} /> : // ✅
                    <LegacyButton disabled={true} text={`Pending Invoice to ${Enums.getEnumStringValue(Enums.IntegrationPartner, integration.Partner)}`} /> : // ✅

                  invoice.InvoiceSyncStatus == Enums.SyncStatus.Synced ?
                    <LegacyButton disabled={true} text={`Synced: ${invoice.InvoiceExternalDocNumber}`} /> : // ✅

                    invoice.InvoiceSyncStatus == Enums.SyncStatus.Failed ?
                      <>
                        <LegacyButton disabled={props.accessStatus === Enums.AccessStatus.LockedWithAccess || props.accessStatus === Enums.AccessStatus.LockedWithOutAccess}
                          text={`Retry Invoice to ${Enums.getEnumStringValue(Enums.IntegrationPartner, integration.Partner)}`} icon="send" extraClasses="white-action"
                          tooltip={integrationTooltip}
                          onClick={() => integration.Status == Enums.IntegrationStatus.Live ? sendToPartner() : {}} />
                        <HelpDialog position="bottom" message={`${invoice.InvoiceSyncMessage}`} width={175} />
                      </> : // ✅
                      invoice.InvoiceSyncStatus == Enums.SyncStatus.Never ?
                        <LegacyButton disabled={props.accessStatus === Enums.AccessStatus.LockedWithAccess || props.accessStatus === Enums.AccessStatus.LockedWithOutAccess}
                          text={`Send Invoice to ${Enums.getEnumStringValue(Enums.IntegrationPartner, integration.Partner)}`} icon="send" extraClasses="white-action"
                          tooltip={integrationTooltip}
                          onClick={() => integration.Status == Enums.IntegrationStatus.Live ? sendToPartner() : {}} />
                        : '' : '' // ✅
              }

              <LegacyButton disabled={props.accessStatus === Enums.AccessStatus.LockedWithAccess || props.accessStatus === Enums.AccessStatus.LockedWithOutAccess}
                text={saving ? "Saving" : "Save"} onClick={saving ? null : () => setTimeout(() => { saveInvoice(invoice.InvoiceStatus); }, 50)} />
            </div>}

          </NoSSR>
        }
      </div>*/}

      {isNew ?
        <>
          {(() => {
            return invoiceDetails();
          })()}
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
                case "Invoice":
                  return invoiceDetails();
                case 'Comments':
                  return <ItemComments
                    itemID={invoice.ID}
                    storeID={invoice.StoreID}
                    module={Enums.Module.Invoice}
                    setTotalComments={setTotalComments}

                  // comments={comments}
                  // handleCommentChange={handleCommentChange}
                  // newComment={newComment}
                  // submitComment={saveComment}
                  // submitting={submittingComment}
                  // canLoadMoreComments={canLoadMoreComments}
                  // loadMoreComments={loadMoreComments}
                  />;
                case "Communication":
                  return <Communications topMargin={false} itemId={invoice.ID} module={Enums.Module.Invoice}
                    customerID={selectedCustomer ? selectedCustomer.ID : null}
                    accessStatus={props.accessStatus} />;
                case 'Attachments':
                  return <Attachments topMargin={false}
                    displayName={selectedCustomer ? selectedCustomer.CustomerName : ''}
                    itemId={invoice.ID} module={Enums.Module.Invoice}
                    onRefresh={onAttachmentRefresh}
                    accessStatus={props.accessStatus} />;
                default:
                  return "";
              }
            })()}
          </Card>

        </Box>
      }

      <ConfirmAction options={confirmOptions} setOptions={setConfirmOptions} />

      {mergeItemsModalOptions.show &&
        <MergeItemsModal show={mergeItemsModalOptions.show} options={mergeItemsModalOptions} module={Enums.Module.Invoice} />}

      {showPreferencesModal &&
        <EditUserConfigMetaDataModal metaData={crudConfigMetaData} onChange={updateCrudConfigMetaData} />}

      {/* <SCPopover anchor={anchor} show={showPopover} setShow={setShowPopover}
        title="PayFast Integration"
        position={"right"} body={"Start accepting online payments for your invoices through PayFast."} 
        confirmText={"Setup PayFast"} onClick={setupPayFast} /> */}

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

          .actions :global(.button) {
            margin-left: 0.5rem;
            margin-top: 0;
            padding: 0 1rem;
            white-space: nowrap;
          }

          .online-payment-container {
            margin-right: -1rem;
            padding: 0 6rem;
            position: relative;
            cursor: pointer;
          }

          .online-payment-icon {
            align-items: center;
            border-radius: 1.25rem;
            color: ${colors.white};
            background-color: ${Helper.hexToRgba(colors.bluePrimary, 0.2)};
            display: flex;
            font-weight: bold;
            height: 28px;
            justify-content: center;
            left: 1.75rem;
            top: 0.4rem;
            position: absolute;
            width: 28px;
          }

          .online-payment-text {
            align-items: center;
            display: flex;
            justify-content: center;
            position: absolute;
            top: 0.75rem;
            left: 4rem;
            color: ${colors.bluePrimary};
            font-weight: bold;
            font-size: 13px;
          }
        `}
      </style>
    </div>
  );
}

export default ManageInvoice;
