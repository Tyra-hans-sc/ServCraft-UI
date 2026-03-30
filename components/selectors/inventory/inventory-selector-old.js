import React, { useState, useEffect, useContext } from 'react';
import SelectInput from '../../select-input';
import Fetch from '../../../utils/Fetch';
import * as Enums from '../../../utils/enums';
import ManageInventory from '../../modals/inventory/manage-inventory';
import ToastContext from '../../../utils/toast-context';
import PS from '../../../services/permission/permission-service';

function InventorySelector({ selectedInventory, setSelectedInventory, setInventoryChanged, accessStatus, error, ignoreIDs = [], cypress }) {

  const toast = useContext(ToastContext);
  const [inventoryPermission] = useState(PS.hasPermission(Enums.PermissionName.Inventory));

  const [inventories, setInventories] = useState([]);
  const [inventoryTotalResults, setInventoryTotalResults] = useState(0);
  const [inventorySearch, setInventorySearch] = useState('');

  const handleInventoryChange = (e) => {
    setInventorySearch(e.target.value);
    if (setInventoryChanged) {
      setInventoryChanged(true);
    }
  };

  useEffect(() => {
    if (selectedInventory) {
      setInventorySearch(selectedInventory.Description);
    }
  }, [selectedInventory]);

  const [pageSize, setPageSize] = useState(10);

  const showMore = () => {
    setPageSize(size => size * 2);
  };

  useEffect(() => {
    searchInventory();
  }, [pageSize]);

  const [searching, setSearching] = useState(false);

  const searchInventory = async () => {
    setSearching(true);

    const inventory = await Fetch.post({
      url: `/Inventory/GetInventories`,
      params: {
        pageSize: pageSize, pageIndex: 0, searchPhrase: inventorySearch,
        SortExpression: "", SortDirection: "", ExcludeIDList: ignoreIDs
      }
    });

    setInventories(inventory.Results);
    setInventoryTotalResults(inventory.TotalResults);
    setSearching(false);
  };

  const [showCreate, setShowCreate] = useState(false);

  const addNewInventory = () => {
    setShowCreate(true);
  };

  const onInventoryCreate = (inventory) => {
    if (inventory) {
      setInventoryChanged(true);
      setInventories([...inventories, inventory]);
      setSelectedInventory(inventory);
      setInventorySearch(inventory.Description);

      // toast.setToast({
      //   message: 'Inventory created successfully',
      //   show: true,
      //   type: 'success'
      // });
    }
    setShowCreate(false);
  };

  return (
    <React.Fragment>
      <SelectInput
        cypress={cypress ? cypress : null}
        extraClasses="inventory-selector"
        addOption={(inventoryPermission ? { text: "Add new inventory", action: () => addNewInventory() } : "")}
        showMoreOption={{ action: () => showMore() }}
        changeHandler={handleInventoryChange}
        label="Inventory"
        options={inventories}
        totalOptions={inventoryTotalResults}
        placeholder="Select inventory"
        required={true}
        searchFunc={searchInventory}
        searching={searching}
        setSelected={setSelectedInventory}
        type="inventory"
        value={inventorySearch}
        error={error}
      />

      {showCreate ?
        <ManageInventory isNew={true} onInventorySave={onInventoryCreate} accessStatus={accessStatus} /> : ''
      }
    </React.Fragment>
  )
}

export default InventorySelector;
