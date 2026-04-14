import React, { useState, useEffect, useContext } from 'react';
import {Button, Loader} from "@mantine/core";
import InlineTextInput from '../inline-text-input';
import { colors, layout } from '../../theme';
import * as Enums from '../../utils/enums';
import Helper from '../../utils/helper';
import { reorder } from 'react-reorder';
import ToastContext from '../../utils/toast-context';
import Fetch from '../../utils/Fetch';
import Storage from '../../utils/storage';
import PS from '../../services/permission/permission-service';
import AddInventoryItemModal from "../../PageComponents/Inventory/AddInventoryItemModal";
import {useMutation} from "@tanstack/react-query";
import ConfirmAction from '../modals/confirm-action';
import { Text } from '@mantine/core';
import constants from '../../utils/constants';
import { useMemo } from 'react';
import InfoTooltip from '../info-tooltip';
import {IconPrinter} from "@tabler/icons-react";
import DownloadService from "../../utils/download-service";
import {showNotification} from "@mantine/notifications";

function JobInventory({ clientID, job, updateJob, accessStatus, allowNonEmployee, inputErrors, customerZone = false,
  jobItemSelection = Enums.JobItemSelection.Both, jobItemOrder = Enums.JobItemOrder.Inventory, jobSingleItem = false,
  filterStockItemStatus = false, filteredStockItemStatus = Enums.StockItemStatus.None, fromStatusChange = false, fromCreateJob = false, cypressItem }) {

  const toast = useContext(ToastContext);

  const [manageItemsUsedPermission] = useState((fromCreateJob || fromStatusChange || PS.hasPermission(Enums.PermissionName.EditJob)) &&
    (filteredStockItemStatus !== Enums.StockItemStatus.ItemUsed || PS.hasPermission(Enums.PermissionName.ManageItemsUsed)));

  const [createJobInventoryItem, setCreateJobInventoryItem] = useState(false);
  const [editJobInventoryItem, setEditJobInventoryItem] = useState(false);
  const [jobInventoryItemToEdit, setJobInventoryItemToEdit] = useState(null);
  const [jobInventoryItemEditIndex, setJobInventoryItemEditIndex] = useState(-1);
  const [hasAssets, setHasAssets] = useState(false);
  const [hasInventory, setHasInventory] = useState(false);
  const [hasEmployee, setHasEmployee] = useState(!customerZone && (allowNonEmployee || Storage.hasCookieValue(Enums.Cookie.employeeID)) && !job.IsClosed);
  const [confirmOptions, setConfirmOptions] = useState(Helper.initialiseConfirmOptions());
  const [cardView, setCardView] = useState(filteredStockItemStatus === Enums.StockItemStatus.WorkedOn); // for configuration later on

  const [filteredJobInventory, setFilteredJobInventory] = useState([]);

  const [tableActionStates, setTableActionStates] = useState({})

  function sortInventory(inv) {
    return inv.sort((a, b) => a.LineNumber - b.LineNumber);
  }

  useEffect(() => {
    setHasEmployee(!customerZone && (allowNonEmployee || Storage.hasCookieValue(Enums.Cookie.employeeID)) && !job.IsClosed);
  }, [job.IsClosed]);

  useEffect(() => {
    let items = job.JobInventory ? filterStockItemStatus ?
      job.JobInventory.filter(x => x.StockItemStatus === filteredStockItemStatus) : job.JobInventory : [];

    setFilteredJobInventory(sortInventory(items));
    checkHasAssets(items);
    checkHasInventory(items);
  }, [job.JobInventory]);

  const checkHasAssets = (jobInventory) => {
    if (jobInventory.filter(x => x && x.IsActive && x.ProductID).length > 0) {
      setHasAssets(true);
    } else {
      setHasAssets(false);
    }
  };

  const checkHasInventory = (jobInventory) => {
    if (jobInventory.filter(x => x.IsActive && !x.ProductID).length > 0) {
      setHasInventory(true);
    } else {
      setHasInventory(false);
    }
  };

  const getCurrentLineNumber = () => {
    if (filteredJobInventory.filter(x => x.IsActive).length > 0) {
      let lineNumbers = filteredJobInventory.filter(x => x.IsActive).map((item, i) => {
        return parseInt(item.LineNumber);
      });
      return Math.max(...lineNumbers) + 1;
    } else {
      return 1;
    }
  };

  /*const jobReq = () => Fetch.get({
    url: '/Job/' + job.ID,
    caller: "components/job/job-inventory.js:saveInventoryWorkedOnList()"
  });
  const jobQuery = useQuery(
    ['job', job.ID],
    jobReq,
    {
      // enabled: !!job.ID,
      enabled: false,
      initialData: job
    }
  );*/

  // console.log(jobQuery);

  const saveInventoryUsedList = async (jobInventory) => {

    const request = await Fetch.post({
      url: '/Job/JobSaveInventoryUsedList',
      params: {
        jobInventory: jobInventory.length > 0 ? jobInventory : [],
        jobCardID: job.ID,
      },
      toastCtx: toast
    });

    if (request.Results) {
      setFilteredJobInventory(sortInventory(request.Results));

      let rowVersion = null;
      if (request.Metadata) {
        rowVersion = request.Metadata.RowVersion;
      } else {
        // api save method makes this redundant, kept for backwards compatibility
        const jobRequest = await Fetch.get({
          url: '/Job/' + job.ID,
          caller: "components/job/job-inventory.js:saveInventoryUsedList()"
        });
        rowVersion = jobRequest.RowVersion;
      }

      return [rowVersion, request.Results];
    }
    return null;
  };

  const saveInventoryWorkedOnList = async (jobInventory) => {

    const request = await Fetch.post({
      url: '/Job/JobSaveInventoryWorkedOnList',
      params: {
        jobInventory: jobInventory.length > 0 ? jobInventory : [],
        jobCardID: job.ID,
      },
      toastCtx: toast
    });

    if (request.Results) {
      setFilteredJobInventory(sortInventory(request.Results));

      let rowVersion = null;
      if (request.Metadata) {
        rowVersion = request.Metadata.RowVersion;
      } else {
        // api save method makes this redundant, kept for backwards compatibility
        const jobRequest = await Fetch.get({
          url: '/Job/' + job.ID,
          caller: "components/job/job-inventory.js:saveInventoryWorkedOnList()"
        });
        rowVersion = jobRequest.RowVersion;
      }

      return [rowVersion, request.Results];
    }
    return null;
  };

  const saveJobInventoryAndUpdateJob = (savedData) => {

    /* plan of action



    */




    /*let oldInventory = [];

    // set line number and prev inventory
    if (createJobInventoryItem) {
      jobInventoryItem.ID = Helper.newGuid();
      jobInventoryItem.LineNumber = getCurrentLineNumber();
      oldInventory = !job.JobInventory ? [] : [...job.JobInventory];
    } else {
      oldInventory = !job.JobInventory ? [] : [...job.JobInventory.filter(x => x.ID !== jobInventoryItem.ID)];
    }

    // insert new item into old inventory
    let index = job.JobInventory.findIndex(x => x.ID === jobInventoryItem.ID);
    oldInventory.splice(index, 0, jobInventoryItem);
    oldInventory = Helper.sortObjectArray(oldInventory, 'LineNumber');*/
    /** attempt to use previous script logic to update inventory */



    // res.Results && setFilteredJobInventory(res.Results);

    // console.log('updating job', savedData)

    const { RowVersion } = savedData.Metadata;
    const results = savedData.Results;


    if (results && RowVersion) {

      // const inventory = [...filteredJobInventory].filter(x => x.StockItemStatus !== filteredStockItemStatus);
      const inventory = [...job.JobInventory].filter(x => x.StockItemStatus !== filteredStockItemStatus);
      inventory.push(...savedData.Results);

      if (createJobInventoryItem) {
        updateJob(null, null, [{
          key: 'JobInventory', value: inventory
        }, {
          key: 'RowVersion', value: RowVersion
        }], false, 'increment');
      } else {
        updateJob(null, null, [{
          key: "JobInventory", value: inventory
        }, {
          key: "RowVersion", value: RowVersion
        }], false);
      }

      checkHasAssets([savedData.Results]);
      setFilteredJobInventory(sortInventory(savedData.Results));
      setCreateJobInventoryItem(false);
      setEditJobInventoryItem(false);
      setJobInventoryItemToEdit(null);
    }

  }

  const onJobInventoryItemSave = async (jobInventoryItem) => {
    if (jobInventoryItem) {

      let oldInventory = [];

      // set line number and prev inventory
      if (createJobInventoryItem) {
        jobInventoryItem.ID = Helper.newGuid();
        jobInventoryItem.LineNumber = getCurrentLineNumber();
        oldInventory = !job.JobInventory ? [] : [...job.JobInventory];
      } else {
        oldInventory = !job.JobInventory ? [] : [...job.JobInventory.filter(x => x.ID !== jobInventoryItem.ID)];
      }

      // insert new item into old inventory
      let index = job.JobInventory.findIndex(x => x.ID === jobInventoryItem.ID);
      oldInventory.splice(index, 0, jobInventoryItem);
      oldInventory = Helper.sortObjectArray(oldInventory, 'LineNumber');

      // Items are being filtered, and they are filtered by Materials
      if (filterStockItemStatus && filteredStockItemStatus === Enums.StockItemStatus.ItemUsed) {
        // set jobInventory
        let jobInventory = [];
        if (createJobInventoryItem) {
          jobInventory = [...filteredJobInventory, jobInventoryItem];
        } else {
          let jobInventoryOthers = [...filteredJobInventory].filter(x => x.ID !== jobInventoryItem.ID);
          jobInventory = [...jobInventoryOthers, jobInventoryItem];
        }

        // send inventory to server and generate row version
        const [newRowVersion, usedInventory] = fromCreateJob ? [undefined, jobInventory] : await saveInventoryUsedList(jobInventory);

        if ((createJobInventoryItem && newRowVersion) || fromCreateJob) {
          oldInventory = oldInventory.filter(x => x.StockItemStatus !== Enums.StockItemStatus.ItemUsed);
          oldInventory.push(...usedInventory);
          updateJob(null, null, [{
            key: "JobInventory", value: oldInventory
          }, {
            key: "RowVersion", value: newRowVersion
          }], false, "increment");
        } else if (newRowVersion || fromCreateJob) {
          oldInventory = oldInventory.filter(x => x.StockItemStatus !== Enums.StockItemStatus.ItemUsed);
          oldInventory.push(...usedInventory);
          updateJob(null, null, [{
            key: "JobInventory", value: oldInventory
          }, {
            key: "RowVersion", value: newRowVersion
          }], false);
        }
      } else if (filterStockItemStatus && filteredStockItemStatus === Enums.StockItemStatus.WorkedOn) {

        let jobInventory = [];
        if (createJobInventoryItem) {
          jobInventory = [...filteredJobInventory, jobInventoryItem];
        } else {
          let jobInventoryOthers = [...filteredJobInventory].filter(x => x.ID !== jobInventoryItem.ID);
          jobInventory = [...jobInventoryOthers, jobInventoryItem];
        }

        const [newRowVersion, workedOnInventory] = fromCreateJob ? [undefined, jobInventory] : await saveInventoryWorkedOnList(jobInventory);

        if ((createJobInventoryItem && newRowVersion) || fromCreateJob) {
          oldInventory = oldInventory.filter(x => x.StockItemStatus !== Enums.StockItemStatus.WorkedOn);
          oldInventory.push(...workedOnInventory);
          updateJob(null, null, [{
            key: "JobInventory", value: oldInventory
          }, {
            key: "RowVersion", value: newRowVersion
          }], false, "increment");
          // updateJob("JobInventory", oldInventory, null, false, "increment");
        } else if (newRowVersion || fromCreateJob) {
          oldInventory = oldInventory.filter(x => x.StockItemStatus !== Enums.StockItemStatus.WorkedOn);
          oldInventory.push(...workedOnInventory);
          updateJob(null, null, [{
            key: "JobInventory", value: oldInventory
          }, {
            key: "RowVersion", value: newRowVersion
          }], false);
          // updateJob("JobInventory", oldInventory, null, false);
        }
      } else {
        let isFormDirty = jobInventoryItemToEdit && jobInventoryItem.ProductID && jobInventoryItemToEdit.ProductID == jobInventoryItem.ProductID ? false : true;
        updateJob("JobInventory", oldInventory, null, isFormDirty);
      }

      checkHasAssets([...filteredJobInventory, jobInventoryItem]);

      setCreateJobInventoryItem(false);
      setEditJobInventoryItem(false);

    } else { // cancelling
      setCreateJobInventoryItem(false);
      setEditJobInventoryItem(false);
    }
  };

  const transferToItemsUsed = async (item) => {

    setConfirmOptions({
      ...Helper.initialiseConfirmOptions(),
      display: true,
      confirmButtonText: "Transfer",
      heading: "Confirm transfer to materials?",
      text: "The inventory item will moved to materials from customer assets.",
      onConfirm: async () => {

        let oldInventory = !job.JobInventory ? [] : [...job.JobInventory];
        let index = oldInventory.findIndex(x => x.ID == item.ID);
        if (index > -1) {
          oldInventory[index].StockItemStatus = Enums.StockItemStatus.ItemUsed;

          let activeInventory = [...oldInventory].filter(x => x.StockItemStatus === Enums.StockItemStatus.ItemUsed && x.ID != oldInventory[index].ID);
          let jobInventory = [...activeInventory, oldInventory[index]];

          const [newRowVersion, itemsUsedInventory] = fromCreateJob ? [undefined, jobInventory] : await saveInventoryUsedList(jobInventory);
          if (newRowVersion || fromCreateJob) {
            oldInventory = oldInventory.filter(x => x.StockItemStatus !== Enums.StockItemStatus.ItemUsed);
            oldInventory.push(...itemsUsedInventory);
            updateJob(null, null, [{
              key: "JobInventory", value: oldInventory
            }, {
              key: "RowVersion", value: newRowVersion
            }], false, "decrement");
            // updateJob("JobInventory", oldInventory, null, false, "decrement");
            toast.setToast({
              message: 'Inventory item transferred successfully',
              show: true,
              type: 'success'
            });
          }


          checkHasAssets([...filteredJobInventory, oldInventory[index]]);
        }


      }
    });

  }

  const removeAllItemsUsedForCreateJob = () => {
    let oldInventory = !job.JobInventory ? [] : [...job.JobInventory];

    oldInventory = oldInventory.filter(x => x.StockItemStatus !== Enums.StockItemStatus.ItemUsed);

    updateJob(null, null, [{
      key: "JobInventory", value: oldInventory
    }], false);

  };

  const removeJobInventoryItem = async (item) => {

    setTableActionStates(p => ({...p, ['delete' + item.ID]: 'loading'}))


    let oldInventory = !job.JobInventory ? [] : [...job.JobInventory];
    let index = oldInventory.findIndex(x => x.ID === item.ID);
    if (index > -1) {
      oldInventory[index].IsActive = false;
      if (filterStockItemStatus && filteredStockItemStatus === Enums.StockItemStatus.ItemUsed) {

        let activeInventory = [...filteredJobInventory].filter(x => x.ID !== oldInventory[index].ID);
        let jobInventory = [...activeInventory];

        if (!fromCreateJob) {
          jobInventory.push(oldInventory[index]);
        }

        const [newRowVersion, workedOnInventory] = fromCreateJob ? [undefined, jobInventory] : await saveInventoryUsedList(jobInventory);
        if (newRowVersion || fromCreateJob) {
          oldInventory = oldInventory.filter(x => x.StockItemStatus !== Enums.StockItemStatus.ItemUsed);
          oldInventory.push(...workedOnInventory);
          updateJob(null, null, [{
            key: "JobInventory", value: oldInventory
          }, {
            key: "RowVersion", value: newRowVersion
          }], false, "decrement");
          if (!fromCreateJob) {
            toast.setToast({
              message: 'Material/service removed successfully',
              show: true,
              type: 'success'
            });
            setTableActionStates(p => ({...p, ['delete' + item.ID]: 'none'}))
          }
        }
      } else if (filterStockItemStatus && filteredStockItemStatus === Enums.StockItemStatus.WorkedOn) {

        let activeInventory = [...filteredJobInventory].filter(x => x.ID !== oldInventory[index].ID);
        let jobInventory = [...activeInventory];

        if (!fromCreateJob) {
          jobInventory.push(oldInventory[index]);
        }

        const [newRowVersion, workedOnInventory] = fromCreateJob ? [undefined, jobInventory] : await saveInventoryWorkedOnList(jobInventory);
        if (newRowVersion || fromCreateJob) {
          oldInventory = oldInventory.filter(x => x.StockItemStatus !== Enums.StockItemStatus.WorkedOn);
          oldInventory.push(...workedOnInventory);
          updateJob(null, null, [{
            key: "JobInventory", value: oldInventory
          }, {
            key: "RowVersion", value: newRowVersion
          }], false, "decrement");
          // updateJob("JobInventory", oldInventory, null, false, "decrement");
          toast.setToast({
            message: 'Customer asset removed successfully',
            show: true,
            type: 'success'
          });
          setTableActionStates(p => ({...p, ['delete' + item.ID]: 'none'}))
        }
      } else {
        updateJob("JobInventory", oldInventory, null, true);
      }

      checkHasAssets([...filteredJobInventory, oldInventory[index]]);
    }

    /*const onConfirm = async () => {

      let oldInventory = !job.JobInventory ? [] : [...job.JobInventory];
      let index = oldInventory.findIndex(x => x.ID === item.ID);
      if (index > -1) {
        oldInventory[index].IsActive = false;
        if (filterStockItemStatus && filteredStockItemStatus === Enums.StockItemStatus.ItemUsed) {

          let activeInventory = [...filteredJobInventory].filter(x => x.ID !== oldInventory[index].ID);
          let jobInventory = [...activeInventory];

          if (!fromCreateJob) {
            jobInventory.push(oldInventory[index]);
          }

          const [newRowVersion, workedOnInventory] = fromCreateJob ? [undefined, jobInventory] : await saveInventoryUsedList(jobInventory);
          if (newRowVersion || fromCreateJob) {
            oldInventory = oldInventory.filter(x => x.StockItemStatus !== Enums.StockItemStatus.ItemUsed);
            oldInventory.push(...workedOnInventory);
            updateJob(null, null, [{
              key: "JobInventory", value: oldInventory
            }, {
              key: "RowVersion", value: newRowVersion
            }], false, "decrement");
            if (!fromCreateJob) {
              toast.setToast({
                message: 'Material/service removed successfully',
                show: true,
                type: 'success'
              });
            }
          }
        } else if (filterStockItemStatus && filteredStockItemStatus === Enums.StockItemStatus.WorkedOn) {

          let activeInventory = [...filteredJobInventory].filter(x => x.ID !== oldInventory[index].ID);
          let jobInventory = [...activeInventory];

          if (!fromCreateJob) {
            jobInventory.push(oldInventory[index]);
          }

          const [newRowVersion, workedOnInventory] = fromCreateJob ? [undefined, jobInventory] : await saveInventoryWorkedOnList(jobInventory);
          if (newRowVersion || fromCreateJob) {
            oldInventory = oldInventory.filter(x => x.StockItemStatus !== Enums.StockItemStatus.WorkedOn);
            oldInventory.push(...workedOnInventory);
            updateJob(null, null, [{
              key: "JobInventory", value: oldInventory
            }, {
              key: "RowVersion", value: newRowVersion
            }], false, "decrement");
            // updateJob("JobInventory", oldInventory, null, false, "decrement");
            toast.setToast({
              message: 'Customer asset removed successfully',
              show: true,
              type: 'success'
            });
          }
        } else {
          updateJob("JobInventory", oldInventory, null, true);
        }

        checkHasAssets([...filteredJobInventory, oldInventory[index]]);
      }
    };
    if (fromCreateJob) {
      onConfirm();
    } else {
      setConfirmOptions({
        ...Helper.initialiseConfirmOptions(),
        display: true,
        confirmButtonText: "Remove",
        heading: "Confirm remove inventory item?",
        text: "The inventory item will be permanently removed.",
        onConfirm: onConfirm
      });
    }*/
  };

  const toggleManageJobInventoryItemModal = (item, index) => {
    if (accessStatus === Enums.AccessStatus.LockedWithAccess || accessStatus === Enums.AccessStatus.LockedWithOutAccess
      || !hasEmployee || job.IsClosed || !manageItemsUsedPermission) {
      return;
    }

    setEditJobInventoryItem(true);
    setJobInventoryItemToEdit(item);
    setJobInventoryItemEditIndex(index);
  };

  const [disableReorder, setReorderToDisabled] = useState(true);

  const onReorder = async (event, previousIndex, nextIndex) => {

    let tempItems = [...filteredJobInventory.filter(x => x.IsActive === true).sort((a, b) => a.LineNumber - b.LineNumber)];
    let item = tempItems.splice(previousIndex, 1);
    tempItems.splice(nextIndex, 0, item[0]);

    tempItems.map((jobInv, i) => {
      jobInv.LineNumber = i + 1;
    });

    let otherJobInventory = [...job.JobInventory.filter(x => x.IsActive === true && x.StockItemStatus != filteredStockItemStatus)];

    reorder(tempItems, previousIndex, nextIndex);

    if (filterStockItemStatus && filteredStockItemStatus == Enums.StockItemStatus.ItemUsed) {
      const [newRowVersion, workedOnInventory] = fromCreateJob ? [null, tempItems] : await saveInventoryUsedList(tempItems);
      if (newRowVersion || fromCreateJob) {
        updateJob(null, null, [{
          key: "JobInventory", value: otherJobInventory.concat(workedOnInventory)
        }, {
          key: "RowVersion", value: newRowVersion
        }], false);
      }
    } else if (filterStockItemStatus && filteredStockItemStatus == Enums.StockItemStatus.WorkedOn) {
      const [newRowVersion, workedOnInventory] = fromCreateJob ? [null, tempItems] : await saveInventoryWorkedOnList(tempItems);
      if (newRowVersion || fromCreateJob) {
        updateJob(null, null, [{
          key: "JobInventory", value: otherJobInventory.concat(workedOnInventory)
        }, {
          key: "RowVersion", value: newRowVersion
        }], false, "decrement");
        // updateJob("JobInventory", otherJobInventory.concat(tempItems), null, false);
      }
    } else {
      updateJob("JobInventory", otherJobInventory.concat(tempItems), null, true);
    }
  };

  const updateJobInventoryItem = (item) => {
    let updatedList = [...job.JobInventory];
    let index = updatedList.findIndex(x => x.ID == item.ID);
    if (index > -1) {
      updatedList[index] = item;
      if (filterStockItemStatus && filteredStockItemStatus == Enums.StockItemStatus.ItemUsed) {
        updateJob("JobInventory", updatedList, null, false);
      } else {
        updateJob("JobInventory", updatedList, null, true);
      }
    }
  };

  const [quanityRequestedEditIndex, setQuantityRequestedEditIndex] = useState(null);
  const [quantityRequestedEditEnabled, setQuantityRequestedEditEnabled] = useState(false);
  const [quantityRequestedFocus, setQuantityRequestedFocus] = useState(false);

  const toggleQuantityRequestedEdit = (index) => {
    if (accessStatus === Enums.AccessStatus.LockedWithAccess || accessStatus === Enums.AccessStatus.LockedWithOutAccess) {
      return;
    }

    resetEdits();
    setQuantityRequestedEditIndex(index);
    setQuantityRequestedEditEnabled(true);
    setQuantityRequestedFocus(true);
  };

  const handleQuantityRequestedChange = (item, value) => {
    // let value = parseFloat(e.target.value);
    if (value < 0 || Helper.isNullOrUndefined(value)) {
      value = 0;
    } else {
      let temp = Helper.countDecimals(value);
      if (temp >= 3) {
        value = value.toFixed(2);
      }
    }

    item.QuantityRequested = value;
    updateJobInventoryItem(item);
  };

  const [serialNumberEditIndex, setSerialNumberEditIndex] = useState(null);
  const [serialNumberEditEnabled, setSerialNumberEditEnabled] = useState(false);
  const [serialNumberFocus, setSerialNumberFocus] = useState(false);

  const toggleSerialNumberRequestedEdit = (index) => {
    if (accessStatus === Enums.AccessStatus.LockedWithAccess || accessStatus === Enums.AccessStatus.LockedWithOutAccess) {
      return;
    }

    resetEdits();
    setSerialNumberEditIndex(index);
    setSerialNumberEditEnabled(true);
    setSerialNumberFocus(true);
  };

  const handleSerialNumberChange = (item, e) => {
    item.SerialNumber = e.target.value;
    updateJobInventoryItem(item);
  };

  const resetEdits = (item = null) => {
    if (item && (item.QuantityRequested === 0 || isNaN(item.QuantityRequested))) {
      item.QuantityRequested = 1;
      updateJobInventoryItem(item);
    }

    setQuantityRequestedEditIndex(null);
    setQuantityRequestedEditEnabled(false);
    setQuantityRequestedFocus(false);

    setSerialNumberEditIndex(null);
    setSerialNumberEditEnabled(false);
    setSerialNumberFocus(false);
  };

  const getLinkedProductIDs = () => {
    return job.JobInventory.filter(x => x.IsActive && x.ProductID).map(x => x.ProductID);
  };

  const hasFilteredJobInventory = useMemo(() => {
    return filteredJobInventory.filter(x => x.IsActive) && filteredJobInventory.filter(x => x.IsActive).length > 0;
  }, [filteredJobInventory]);

  const [loadingItems, setLoadingItems] = useState({})
  const jobLabelMutation = useMutation(['test'], (params) =>
          DownloadService.downloadFile('POST', '/Job/PrintJobBarcodeDocument', params, false, true, '', '', null, false, () => {
            setLoadingItems(p => ({
              ...p, [params.ItemIDs[0]]: 'none'
            }))
          }),
      {
        onError: (error, {ItemIDs}, context) => {
          showNotification(({
            id: 'itemLabelDownload',
            message: error.message,
            autoClose: 3000,
            color: 'yellow'
          }))
        }
      })

  const onPrintLabel = (item) => {
    if(item.StockItemStatus === Enums.StockItemStatus.WorkedOn && item.ProductID) {
      setLoadingItems(p => ({
        ...p, [item.ID]: 'loading'
      }))
      jobLabelMutation.mutate({
        BarcodeDocumentType: Enums.PrintLabelType.JobAsset,
        ItemIDs: [item.ID],
        Copies: 1,
      })
    }
  }

  const {data: lablePrintingAccess, isLoading: loadingLabelPrintingAccess} = useQuery(['jobLabelPrinting'], () => featureService.getFeature(constants.features.ASSET_LABEL_PRINTING))

  function renderCard(item, index) {

    const canTransferToUsed = item.StockItemStatus === Enums.StockItemStatus.WorkedOn && !item.ProductID;

    return (<>

      <div className={styles.assetcard} >
        <div className={styles.assetcontent} title={item.InventoryDescription} onClick={() => toggleManageJobInventoryItemModal(item, index)}>
          <div className={styles.assetheading} >{item.ProductID ? "Asset" : "Inventory"}</div>
          <div>{item.ProductID ? item.ProductNumber : item.InventoryCode}</div>
          <div>{item.InventoryDescription}</div>
          <div>{item.ProductID ? "" : `Qty: ${item.QuantityRequested}`}</div>
        </div>
        {accessStatus !== Enums.AccessStatus.LockedWithAccess && accessStatus !== Enums.AccessStatus.LockedWithOutAccess && hasEmployee && !job.IsClosed && manageItemsUsedPermission ? <div className="delete-button">
          {
            // Helper.getHasNewFeatureAccess('jobLabelPrinting') && !!item.ProductID &&
              !loadingLabelPrintingAccess && lablePrintingAccess && !!item.ProductID &&
              <>{
              loadingItems[item.ID] === 'loading' ? <Loader size={14} color={'gray'} /> :
                  <IconPrinter color={'var(--mantine-color-gray-5)'} onClick={() => onPrintLabel(item)} size={16}/>
              }</>
          }
          {canTransferToUsed ? <img src="/icons/arrow-down.svg" alt="transfer to materials" height={16} onClick={() => transferToItemsUsed(item)} title="Transfer to materials" /> : <></>}
          <img src="/icons/trash-bluegrey.svg" alt="delete" height={16} onClick={() => removeJobInventoryItem(item)} title="Delete" />
        </div> : ''}
      </div>

      <style jsx>{`

        .asset-card {
          margin-top: 0.5rem;
          margin-right: 1rem;
          border: 2px solid ${colors.borderGrey};
          border-radius: ${layout.cardRadius};
          padding: 0.5rem;
          width: 13rem;
          height: 6rem;
          background: ${colors.white};
          display: inline-block;
          position: relative;
          font-size: 0.8rem;
        }

        .asset-heading {
          font-weight: bold;
          margin-bottom: 0.25rem;
          position: absolute;
          left: 0.5rem;
          top: 0.25rem;
          width: 100%;
        }

        .asset-card:hover {
          background: #F0F0F066;
          cursor: pointer;
        }

        .asset-content {
          width: 100%;
          height: calc(100% - 0.5rem);
          overflow: auto;
          margin-top: 1rem;
        }

        .asset-content::-webkit-scrollbar {
          height: 0.5rem;
          background: ${colors.borderGrey}05;
        }

        .asset-content::-webkit-scrollbar-thumb {
          height: 0.5rem;
          background: ${colors.borderGrey}88;
          border-radius: 3px;
        }

        .delete-button {
          position: absolute;
          display: flex;
          gap: 5;
          top: 0.1rem;
          right: 0.1rem;
        }

      `}</style>

    </>);
  }

  function renderCardView() {
    return <>
      <div style={{ display: "flex", flexWrap: "wrap", position: "relative" }}>
        {filteredJobInventory.filter(x => x.IsActive === true).map((item, index) => {
          return renderCard(item, index);
        })}
        {
            (!jobSingleItem || !hasFilteredJobInventory) && hasEmployee && !job.IsClosed &&
            ((!!jobItemSelection && jobItemSelection !== Enums.JobItemSelection.Disabled) || filteredStockItemStatus !== Enums.StockItemStatus.WorkedOn) &&
            <div
                className={styles.assetcard}
                onClick={() => setCreateJobInventoryItem(true)}
            >
              <Flex h={'100%'} align={'center'} justify={'center'} c={'scBlue'} gap={5}>
                <IconPlus size={16}/>
                <Anchor size={'sm'} className={styles.assetCardAddText}> Add Customer Asset
                </Anchor>
              </Flex>
            </div>
        }
      </div>
    </>;
  }

  return (
      <div className={hasFilteredJobInventory && false ? "inventory-container" : "inventory-container-no-border"}>
        <div className="row">
          { hasFilteredJobInventory &&
            <Flex align={'center'} gap={'xs'} mb={10}>
              <Text size={'md'} fw={600}>
                {filteredStockItemStatus === Enums.StockItemStatus.WorkedOn ? 'Customer Assets' : 'Materials / Services'}
            </Text>
            {/*<Tooltip
                color={'scBlue.9'}
                openDelay={1000}
                label={
                  filteredStockItemStatus === Enums.StockItemStatus.WorkedOn ?
                      "These are items that belong to your customer that you are working on." :
                      "These are items you are going to be using in the job. These items include products, services, parts, consumables, etc."
                }
            >
              <ActionIcon variant={'transparent'} onClick={() => setCreateJobInventoryItem(true)}>
                <IconCirclePlus />
              </ActionIcon>
            </Tooltip>*/}
          </Flex>
        }
      </div>
      <div className="row">
        {/*hasFilteredJobInventory &&*/ !cardView ? <>
          <div className="table-container" > {/*style={{maxHeight: 200, maxWidth: 350}}*/}
            <MaterialsSimpleTable
                filteredJobInventory={filteredJobInventory}
                inlineQuantityEditEnabled={true}
                // hasInventory={hasInventory}
                handleQuantityChange={(item, value) => {
                  handleQuantityRequestedChange(item, value)
                }}
                handleSaveNewQuantity={
                  item => saveJobInventoryAndUpdateJob(item)
                }
                hasAssets={hasAssets}
                onReorder={onReorder}
                onItemClicked={(item, index) => toggleManageJobInventoryItemModal(item, index)}
                onRemoveItem={(item) => removeJobInventoryItem(item)}
                permissionToUpdateItems={accessStatus !== Enums.AccessStatus.LockedWithAccess && accessStatus !== Enums.AccessStatus.LockedWithOutAccess && hasEmployee && !job.IsClosed && manageItemsUsedPermission}
                // clientID={clientID}
                onAddItem={() => setCreateJobInventoryItem(true)}
                tableActionStates={tableActionStates}
            />
          </div>
        </> :
          /*hasFilteredJobInventory && */cardView ? <>
            {/*Renders Items In Block Fashion - used for assets*/}
            {renderCardView()}
          </>
            : ""
        }
      </div>

      {(!jobSingleItem || !hasFilteredJobInventory) && hasEmployee && !job.IsClosed &&
        ((!!jobItemSelection && jobItemSelection !== Enums.JobItemSelection.Disabled) || filteredStockItemStatus !== Enums.StockItemStatus.WorkedOn)
        ? <>
          <div className="row">
            {/*<div style={{ display: "flex" }}>
              <Button
                color={'scBlue'}
                type={'input'}
                disabled={accessStatus === Enums.AccessStatus.LockedWithAccess || accessStatus === Enums.AccessStatus.LockedWithOutAccess || !manageItemsUsedPermission}
                style={{
                  border: inputErrors.JobInventory ? `1px solid ${colors.errorOrange}` : '',
                  marginTop: "0.5rem"
                }}
                leftSection={<span><img src="/specno-icons/add.svg" height={16} style={{ filter: "brightness(10000%)" }} /></span>}
                onClick={() => setCreateJobInventoryItem(true)}
              >
                {filteredStockItemStatus === Enums.StockItemStatus.WorkedOn ? 'Customer Asset' : 'Materials / Services'}
              </Button>

              <div style={{ marginTop: "0.5rem" }}>
                <InfoTooltip title={filteredStockItemStatus === Enums.StockItemStatus.WorkedOn ?
                  "These are items that belong to your customer that you are working on."
                  :
                  "These are items you are going to be using in the job. These items include products, services, parts, consumables, etc."} />
              </div>
            </div>*/}

            {fromCreateJob && filteredStockItemStatus === Enums.StockItemStatus.ItemUsed && filteredJobInventory.length > 0 &&
              <Button
                color={'yellow'}
                type={'input'}
                disabled={accessStatus === Enums.AccessStatus.LockedWithAccess || accessStatus === Enums.AccessStatus.LockedWithOutAccess || !manageItemsUsedPermission}
                style={{
                  border: inputErrors.JobInventory ? `1px solid ${colors.errorOrange}` : '',
                  marginTop: "0.5rem"
                }}
                leftSection={<span><img src="/specno-icons/clear.svg" height={16} style={{ filter: "brightness(10000%)" }} /></span>}
                onClick={() => removeAllItemsUsedForCreateJob()}
              >
                Remove All
              </Button>}

          </div>
          {inputErrors.JobInventory ? <div className="row">
            <Text color={"yellow.6"} size={"xs"}>Cannot be an empty list</Text>
          </div> : ""}
        </> : ''}

      {createJobInventoryItem || editJobInventoryItem ?
        <>
          <AddInventoryItemModal
            isNew={createJobInventoryItem}
            jobInventoryItem={jobInventoryItemToEdit}
            show={createJobInventoryItem || editJobInventoryItem}
            onJobInventoryItemSave={onJobInventoryItemSave}
            onClose={() => {
              setJobInventoryItemToEdit(null)
              setEditJobInventoryItem(false)
              setCreateJobInventoryItem(false)
            }}
            job={job}
            jobQueryData={job}
            accessStatus={accessStatus}
            jobSingleItem={jobSingleItem}
            linkedProductIDs={getLinkedProductIDs()}
            type="Job"
            jobItemSelection={jobItemSelection}
            jobItemOrder={jobItemOrder}
            filterStockItemStatus={filterStockItemStatus}
            filteredStockItemStatus={filteredStockItemStatus}
            jobInventoryList={filteredJobInventory}
            onInventoryItemAddedSuccessfully={(x) => {
              // x.Results && setFilteredJobInventory(x.Results);
              saveJobInventoryAndUpdateJob(x)
              // setCreateJobInventoryItem(false);
            }}
            selectMode={jobItemSelection === Enums.JobItemSelection.Inventory ? 'inventory' : jobItemSelection === Enums.JobItemSelection.Asset ? 'asset' : 'both'}
            fromCreateJob={fromCreateJob}
          />
          {/*<ManageJobInventory isNew={createJobInventoryItem} jobInventoryItem={jobInventoryItemToEdit} onJobInventoryItemSave={onJobInventoryItemSave}
                                  job={job} accessStatus={accessStatus} jobSingleItem={jobSingleItem} linkedProductIDs={getLinkedProductIDs()} type="Job"
                                  jobItemSelection={jobItemSelection} jobItemOrder={jobItemOrder} filterStockItemStatus={filterStockItemStatus} filteredStockItemStatus={filteredStockItemStatus} cypressItem={"data-cy-inventory-selector"} cypressQty={"data-cy-quantity"}
            />*/}
        </>

        : ''}

      <ConfirmAction
        options={confirmOptions}
        setOptions={setConfirmOptions} />

      <style jsx>{`

        .inventory-container {
          padding: 0.25rem; 
          border: 1px solid ${colors.mantineBorderGrey};
          border-radius: ${layout.bodyRadius};
          margin-top: 1rem;
          max-width: calc(${constants.maxFormWidth} - 0.5rem - 2px);
        }

        .inventory-container-no-border {
          margin-top: 1rem;
          max-width: calc(${constants.maxFormWidth} - 0.5rem);
        }

        .row {
          display: flex;
          justify-content: space-between;
        }
        .column {
          display: flex;
          flex-basis: 0;
          flex-direction: column;
          flex-grow: 1;
        }
        .column + .column {
          margin-left: 1.25rem;
        }
        .container {
          width: 100%;
          display: flex;
          flex-direction: column;
        }
        .table-container {
          overflow-x: auto;
          width: 100%;
          display: flex;
          flex-direction: column;
        }
        .table {
          border-collapse: collapse;
          margin-top: 0.5rem;
          width: 100%;
        }
        .table thead tr {
          background-color: ${colors.backgroundGrey};
          height: 2rem;
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
          height: 2rem;
          /* cursor: pointer; */
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
          background-color: ${colors.backgroundGrey}55;
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
        .header-item-move {
          width: 5%;
          min-width: 30px;
        }
        .header-item-code {
          width: 5%;
          min-width: 80px;
        }
        .header-item-serial {
          width: 10%;
          min-width: 200px;
        }
        .header-item-desc {
          min-width: 300px;
        }
        .header-item-type {
          min-width: 80px;
        }
        .header-item-qty {
          width: 100px;
          min-width: 100px;
        }
        .header-item-delete {
          width: 5%;
          min-width: 30px;
        }

        .body-item-move {
          cursor: move;
        }
        .body-item-code {
          color: ${colors.bluePrimary};
          cursor: pointer;
        }
        .body-item-serial {

        }
        .body-item-qty {
          text-align: right;
          min-width: 100px;
        }
        .error-text {
          color: ${colors.mantineErrorOrange()};
          font-size: 12px;
          line-height: 1.2;
        }
      `}</style>
    </div>
  );
}

export default JobInventory;
