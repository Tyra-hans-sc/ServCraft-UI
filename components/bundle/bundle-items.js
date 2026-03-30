import React, { useState, useRef, useEffect } from 'react';
import { colors, fontSizes, layout, fontFamily, tickSvg } from '../../theme';
import ManageBundleItem from '../modals/bundle/manage-bundle-item';
import Helper from '../../utils/helper';
import * as Enums from '../../utils/enums';
import Button from '../button';

function BundleItems({bundle, updateBundle, accessStatus}) {

  const [createBundleItem, setCreateBundleItem] = useState(false);
  const [editBundleItem, setEditBundleItem] = useState(false);
  const [bundleItemToManage, setBundleItemToManage] = useState();

  const toggleManageBundleItem = (item, index) => {
    if (accessStatus === Enums.AccessStatus.LockedWithAccess || accessStatus === Enums.AccessStatus.LockedWithOutAccess) {
      return;
    }

    setCreateBundleItem(false);
    setEditBundleItem(true);
    setBundleItemToManage(item);
  };

  const addBundleItem = () => {
    setBundleItemToManage(undefined);
    setEditBundleItem(false);
    setCreateBundleItem(true);    
  };

  const onBundleItemSave = (bundleItem) => {
    if (bundleItem) {
      let updatedItems = [];
      if (createBundleItem) {
        bundleItem.ID = Helper.newGuid();
        updatedItems = !bundle.BundleItems ? [] : [...bundle.BundleItems];
      } else {
        updatedItems = !bundle.BundleItems ? [] : [...bundle.BundleItems.filter(x => x.ID != bundleItem.ID)];
      }

      let index = bundle.BundleItems.findIndex(x => x.ID == bundleItem.ID);
      updatedItems.splice(index, 0, bundleItem);
      
      updateBundle("BundleItems", updatedItems);

      setCreateBundleItem(false);
      setEditBundleItem(false);
      
    } else { // cancelling
      setCreateBundleItem(false);
      setEditBundleItem(false);
    }
  };

  const removeBundleItem = (item) => {
    let updatedItems = !bundle.BundleItems ? [] : [...bundle.BundleItems];
    let index = updatedItems.findIndex(x => x.ID == item.ID);
    if (index > -1) {
      updatedItems.splice(index, 1);
    }
    updateBundle("BundleItems", updatedItems);
  };

  return (
    <div className="item-container">

      <div className="row">
        {bundle.BundleItems && bundle.BundleItems.length > 0 ? <div className="column heading" style={{ paddingTop: "12px" }}>
          Bundle Items
        </div> : ''}
      </div>

      <div className="row">
        {bundle.BundleItems && bundle.BundleItems.length > 0 ? 
          <React.Fragment>
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th className="header-item-code">CODE</th>
                    <th className="header-item-desc">DESCRIPTION</th>
                    <th className="header-item-qty number-column">QUANTITY</th>
                    <th className="header-item-delete"></th>
                  </tr>
                </thead>
                <tbody>
                  {bundle.BundleItems.map((item, index) => {
                    return <tr key={index}>
                      <td className="body-item-code" title='Edit' onClick={() => toggleManageBundleItem(item, index)}>
                        {item.InventoryCode}
                      </td>
                      <td className="body-item-desc">
                        {item.InventoryDescription}
                      </td>
                      <td className="body-item-qty number-column">
                        {item.Quantity}
                      </td>
                      <td className="body-item-delete" title="Delete bundle item">
                        {accessStatus !== Enums.AccessStatus.LockedWithAccess && accessStatus !== Enums.AccessStatus.LockedWithOutAccess ? <>
                          <img src="/icons/trash-bluegrey.svg" alt="delete" onClick={() => removeBundleItem(item)} />
                        </> : ''}
                      </td>
                    </tr>
                  })}
                </tbody>
              </table>
            </div>            
          </React.Fragment> 
        : ''}
      </div>

      <div className="button-row">
        <Button disabled={accessStatus === Enums.AccessStatus.LockedWithAccess || accessStatus === Enums.AccessStatus.LockedWithOutAccess }
          text="Add Item" icon="plus-circle-blue" extraClasses="hollow fit-content right-margin" onClick={() => addBundleItem()} />
      </div>

      {createBundleItem || editBundleItem ?
        <ManageBundleItem isNew={createBundleItem} bundleItem={bundleItemToManage} onBundleItemSave={onBundleItemSave}
          bundle={bundle} accessStatus={accessStatus}
        />
      : ''}

      <style jsx>{`
        .row {
          display: flex;
          justify-content: space-between;
        }
        .button-row {
          display: flex;
          justify-content: flex-start;
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
        
        .header-item-description {
          min-width: 300px;
        }
        .header-item-delete {
          width: 5%;
          min-width: 30px;
        }              

        .body-item-code {
          color: ${colors.bluePrimary};
          cursor: pointer;
        }
      `}</style>
    </div>
  )
}

export default BundleItems;
