import React, { useState, useEffect, useContext } from 'react';
// import Button from '../button';
import { Button } from "@mantine/core";
import InlineTextInput from '../inline-text-input';
import { colors, fontSizes, layout, fontFamily } from '../../theme';
import ManageJobInventory from '../modals/jobcard/manage-job-inventory';
import * as Enums from '../../utils/enums';
import Fetch from '../../utils/Fetch';
import Helper from '../../utils/helper';
import Reorder, { reorder } from 'react-reorder';
import ToastContext from '../../utils/toast-context';
import AddInventoryItemModal from "../../PageComponents/Inventory/AddInventoryItemModal";
import constants from '../../utils/constants';

function JobScheduleItems({ jobSchedule, updateJobSchedule, accessStatus, jobItemSelection = Enums.JobItemSelection.Both, jobItemOrder = Enums.JobItemOrder.Inventory,
  jobSingleItem = false }) {

  const toast = useContext(ToastContext);

  const [createJobScheduleItem, setCreateJobScheduleItem] = useState(false);
  const [editJobScheduleItem, setEditJobScheduleItem] = useState(false);
  const [jobScheduleItemToEdit, setJobScheduleItemToEdit] = useState(null);
  const [hasAssets, setHasAssets] = useState(false);

  const checkHasAssets = (jobScheduleItems) => {
    if (jobScheduleItems.filter(x => x.IsActive && x.ProductID).length > 0) {
      setHasAssets(true);
    } else {
      setHasAssets(false);
    }
  };

  useEffect(() => {
    checkHasAssets(jobSchedule.JobScheduleItems);
  }, []);

  const getCurrentLineNumber = () => {
    if (jobSchedule.JobScheduleItems.filter(x => x.IsActive).length > 0) {
      let lineNumbers = jobSchedule.JobScheduleItems.filter(x => x.IsActive).map((item, i) => {
        return parseInt(item.LineNumber);
      });
      return Math.max(...lineNumbers) + 1;
    } else {
      return 1;
    }
  };

  const onJobScheduleItemSave = (jobScheduleItem, addAndContinue = false) => {

    if (jobScheduleItem) {
      let oldItems = [];
      if (createJobScheduleItem) {
        jobScheduleItem.ID = Helper.newGuid();
        jobScheduleItem.LineNumber = getCurrentLineNumber();
        oldItems = !jobSchedule.JobScheduleItems ? [] : [...jobSchedule.JobScheduleItems];
      } else {
        oldItems = !jobSchedule.JobScheduleItems ? [] : [...jobSchedule.JobScheduleItems.filter(x => x.ID !== jobScheduleItem.ID)];
      }

      if (jobScheduleItem.ProductID && oldItems.some(x => x.ProductID === jobScheduleItem.ProductID && x.IsActive)) {
        toast.setToast({
          message: 'This asset has already been added to the job schedule',
          show: true,
          type: Enums.ToastType.error
        });
      } else {

        let disabledMatchIndex = jobSchedule.JobScheduleItems.findIndex(x => x.ProductID === jobScheduleItem.ProductID && !x.IsActive);
        if (disabledMatchIndex > 0) {
          oldItems[disabledMatchIndex].IsActive = true;
        }
        else {
          let index = jobSchedule.JobScheduleItems.findIndex(x => x.ID === jobScheduleItem.ID);
          oldItems.splice(index, 0, jobScheduleItem);
        }
        let isFormDirty = jobScheduleItemToEdit && jobScheduleItem.ProductID && jobScheduleItemToEdit.ProductID === jobScheduleItem.ProductID ? false : true;
        updateJobSchedule("JobScheduleItems", oldItems, isFormDirty);
        checkHasAssets(oldItems);

        if(!addAndContinue) {
          setCreateJobScheduleItem(false);
          setEditJobScheduleItem(false);
        }
      }
    } else { // cancelling
      setCreateJobScheduleItem(false);
      setEditJobScheduleItem(false);
    }
  };

  const removeJobScheduleItem = (item) => {
    let oldItems = !jobSchedule.JobScheduleItems ? [] : [...jobSchedule.JobScheduleItems];
    let index = oldItems.findIndex(x => x.ID == item.ID);
    if (index > -1) {
      oldItems[index].IsActive = false;
    }
    updateJobSchedule("JobScheduleItems", oldItems);
    checkHasAssets(oldItems);
  };

  const toggleManageJobScheduleItemModal = (item, index) => {
    if (accessStatus === Enums.AccessStatus.LockedWithAccess || accessStatus === Enums.AccessStatus.LockedWithOutAccess) {
      return;
    }

    setEditJobScheduleItem(true);
    setJobScheduleItemToEdit(item);
  };

  const [disableReorder, setReorderToDisabled] = useState(true);

  const onReorder = (event, previousIndex, nextIndex, fromId, toId) => {

    let tempItems = [...jobSchedule.JobScheduleItems.filter(x => x.IsActive)];
    let item = tempItems.splice(previousIndex, 1);
    tempItems.splice(nextIndex, 0, item[0]);

    tempItems.filter(x => x.IsActive === true).map((jobItem, i) => {
      jobItem.LineNumber = i + 1;
    });

    reorder(tempItems, previousIndex, nextIndex);

    updateJobSchedule("JobScheduleItems", tempItems);
  };

  const updateJobScheduleItem = (item) => {
    let updatedList = [...jobSchedule.JobScheduleItems];
    let index = updatedList.findIndex(x => x.ID == item.ID);
    if (index > -1) {
      updatedList[index] = item;
      updateJobSchedule("JobScheduleItems", updatedList);
    }
  };

  const [quanityEditIndex, setQuantityEditIndex] = useState(null);
  const [quantityEditEnabled, setQuantityEditEnabled] = useState(false);
  const [quantityFocus, setQuantityFocus] = useState(false);

  const toggleQuantityEdit = (index) => {
    if (accessStatus === Enums.AccessStatus.LockedWithAccess || accessStatus === Enums.AccessStatus.LockedWithOutAccess) {
      return;
    }

    resetEdits();
    setQuantityEditIndex(index);
    setQuantityEditEnabled(true);
    setQuantityFocus(true);
  };

  const handleQuantityChange = (item, e) => {
    let value = parseFloat(e.target.value);
    if (value < 0 || Helper.isNullOrUndefined(value)) {
      value = 0;
    } else {
      let temp = Helper.countDecimals(value);
      if (temp >= 3) {
        value = value.toFixed(2);
      }
    }
    item.Quantity = value;
    updateJobScheduleItem(item);
  };

  const resetEdits = () => {
    setQuantityEditIndex(null);
    setQuantityEditEnabled(false);
    setQuantityFocus(false);
  };

  const getLinkedProductIDs = () => {
    return jobSchedule.JobScheduleItems.filter(x => x.IsActive && x.ProductID).map(x => x.ProductID);
  };

  function renderCard(item, index) {

    return (<>

      <div className="asset-card" >
        <div className="asset-content" title={item.InventoryDescription} onClick={() => toggleManageJobScheduleItemModal(item, index)}>
          <div className="asset-heading">{item.ProductID ? "Asset" : "Inventory"}</div>
          <div>{item.ProductID ? item.ProductNumber : item.InventoryCode}</div>
          <div>{item.InventoryDescription}</div>
          <div>{item.ProductID ? "" : `Qty: ${item.QuantityRequested}`}</div>
        </div>
        {accessStatus !== Enums.AccessStatus.LockedWithAccess && accessStatus !== Enums.AccessStatus.LockedWithOutAccess ? <div className="delete-button">
          <img src="/icons/trash-bluegrey.svg" alt="delete" height={16} onClick={() => removeJobScheduleItem(item)} title="Delete" />
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
          top: 0.1rem;
          right: 0.1rem;
        }

      `}</style>

    </>);
  }

  function renderCardView() {
    return <>
      <div style={{ display: "flex", flexWrap: "wrap", position: "relative" }}>
        {jobSchedule.JobScheduleItems.filter(x => x.IsActive === true).map((item, index) => {
          return renderCard(item, index);
        })}
      </div>
    </>;
  }

  return (
    <div className="container job-schedule-items-container">
      <div className="row">
        {jobSchedule.JobScheduleItems && jobSchedule.JobScheduleItems.filter(x => x.IsActive === true).length > 0 ? <div className="column heading" style={{ padding: "0", margin: "0" }}>
          Customer Assets
        </div> : ''}
      </div>
      <div className="row">
        {jobSchedule.JobScheduleItems && jobSchedule.JobScheduleItems.length > 0 ? <>

          {renderCardView()}

          {/* <div className="table-container">
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
                  <th className="header-item-type">
                    TYPE
                  </th>
                  {hasAssets ?
                    <React.Fragment>
                      <th className="header-item-assetnumber">
                        ASSET/SERIAL NO
                      </th>
                      <th className="header-item-warranty">
                        WARRANTY
                      </th>
                    </React.Fragment> : ''
                  }
                  <th className="header-item-qty number-column">
                    QUANTITY
                  </th>
                  <th className="header-item-delete">
                  </th>
                </tr>
              </thead>
              <Reorder reorderId="item-list" onReorder={onReorder} lock='horizontal' component='tbody'
                placeholderClassName='reorder-placeholder' draggedClassName='reorder-dragged' disabled={disableReorder}>
                {jobSchedule.JobScheduleItems.filter(x => x.IsActive === true).map((item, index) => {
                  return <tr key={index}>
                    <td className="body-item-move" title="Click and drag to reorder"
                      onMouseEnter={() => setReorderToDisabled(false)} onMouseLeave={() => setReorderToDisabled(true)}>
                      <img src="/icons/menu-light.svg" alt="move" />
                    </td>
                    <td className="body-item-code" title='Edit' onClick={() => toggleManageJobScheduleItemModal(item, index)}>
                      {item.ProductID ? item.ProductNumber : item.InventoryCode}
                    </td>
                    <td className="body-item-desc">
                      {item.InventoryDescription}
                    </td>
                    <td className="body-item-type">
                      {item.ProductID ? 'Asset' : 'Inventory'}
                    </td>
                    {hasAssets ?
                      <React.Fragment>
                        <td className="body-item-assetnumber">
                          {item.ProductID ? item.ProductNumber : ''}
                        </td>
                        <td className="body-item-warranty">
                          {item.ProductID ? item.WarrantyPeriod : ''}
                        </td>
                      </React.Fragment> : ''
                    }
                    <td className="body-item-qty number-column" onClick={() => item.ProductID ? {} : toggleQuantityEdit(index)}>
                      {quantityEditEnabled && quanityEditIndex == index ?
                        <InlineTextInput
                          name={`quantityRequested${index}`}
                          changeHandler={(e) => handleQuantityChange(item, e)}
                          value={item.Quantity}
                          type='number'
                          textAlign='right'
                          width='100px'
                          blurHandler={resetEdits}
                          inputFocus={quantityFocus}
                        />
                        :
                        <>{item.Quantity}</>
                      }
                    </td>
                    <td className="body-item-delete" title="Delete job item">
                      {accessStatus !== Enums.AccessStatus.LockedWithAccess && accessStatus !== Enums.AccessStatus.LockedWithOutAccess ? <>
                        <img src="/icons/trash-bluegrey.svg" alt="delete" onClick={() => removeJobScheduleItem(item)} />
                      </> : ''}
                    </td>
                  </tr>
                })}
              </Reorder>
            </table>
          </div> */}
        </> : ''}
      </div>

      {
          !!jobItemSelection && jobItemSelection !== Enums.JobItemSelection.Disabled &&
          <div className="row">
            {/* <Button disabled={accessStatus === Enums.AccessStatus.LockedWithAccess || accessStatus === Enums.AccessStatus.LockedWithOutAccess}
          text="Add Job Item" icon="plus-circle-blue" extraClasses="hollow fit-content" onClick={() => setCreateJobScheduleItem(true)} /> */}

            <Button
                color={'scBlue'}
                type={'input'}
                disabled={accessStatus === Enums.AccessStatus.LockedWithAccess || accessStatus === Enums.AccessStatus.LockedWithOutAccess}
                style={{
                  marginTop: "0.5rem"
                }}
                leftSection={<span><img src="/specno-icons/add.svg" height={16} style={{filter: "brightness(10000%)"}}/></span>}
                onClick={() => setCreateJobScheduleItem(true)}
            >
              Customer Asset
            </Button>
          </div>
      }

      {
          (createJobScheduleItem || editJobScheduleItem) &&
          <AddInventoryItemModal
              show={createJobScheduleItem || editJobScheduleItem}
              isNew={createJobScheduleItem}
              jobInventoryItem={jobScheduleItemToEdit}
              updateJobInventoryExternally={onJobScheduleItemSave}
              onInventoryItemAddedSuccessfully={() => {
              }}
              job={jobSchedule}
              jobQueryData={jobSchedule}
              accessStatus={accessStatus}
              jobSingleItem={jobSingleItem}
              linkedProductIDs={getLinkedProductIDs()}
              type={'Recurring'}
              jobItemSelection={jobItemSelection}
              jobItemOrder={jobItemOrder}
              filterStockItemStatus={null}
              filteredStockItemStatus={Enums.StockItemStatus.WorkedOn}
              jobInventoryList={jobSchedule.JobScheduleItems}
              onClose={() => {
                setCreateJobScheduleItem(false);
                setEditJobScheduleItem(false);
                setJobScheduleItemToEdit(null);
              }}
              selectMode={jobItemSelection === Enums.JobItemSelection.Inventory ? 'inventory' : jobItemSelection === Enums.JobItemSelection.Asset ? 'asset' : 'both'}
              fromSchedule={true}
        />
        /*<ManageJobInventory isNew={createJobScheduleItem} jobInventoryItem={jobScheduleItemToEdit} onJobInventoryItemSave={onJobScheduleItemSave}
        job={jobSchedule} accessStatus={accessStatus} jobSingleItem={jobSingleItem} linkedProductIDs={getLinkedProductIDs()} type="Recurring"
        jobItemSelection={jobItemSelection} jobItemOrder={jobItemOrder} />*/
      }

      <style jsx>{`
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
        .column :global(.textarea-container) {
          height: 100%;
        }
        .column + .column {
          margin-left: 1.25rem;
        }
        .container {
          width: 100%;
          display: flex;
          flex-direction: column;
        }

        .job-schedule-items-container {
          margin-top: 1rem;
          max-width: calc(${constants.maxFormWidth} - 0.5rem);
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
      `}</style>
    </div>
  );
}

export default JobScheduleItems;
