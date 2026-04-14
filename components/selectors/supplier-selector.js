import React, { useState, useEffect, useContext } from 'react';
import SelectInput from '../select-input';
import Fetch from '../../utils/Fetch';
import * as Enums from '../../utils/enums';
import ManageSupplier from '../modals/supplier/manage-supplier';
import PS from '../../services/permission/permission-service';
import SCComboBox from '../sc-controls/form-controls/sc-combobox';
import CreateNewSupplierModal from "../../PageComponents/Inventory/CreateNewSupplierModal";

function SupplierSelector({ selectedSupplier, setSelectedSupplier, accessStatus, error, isRequired, disabled, ignoreAddOption = false }) {

  const [suppliers, setSuppliers] = useState([]);
  const [totalSuppliers, setTotalSuppliers] = useState(0);
  const [supplierSearch, setSupplierSearch] = useState('');
  const [inventoryPermission] = useState(PS.hasPermission(Enums.PermissionName.Inventory));

  const handleSupplierChange = (e) => {
    setSupplierSearch(e.target.value);
  };

  const [pageSize, setPageSize] = useState(10);

  const showMore = () => {
    setPageSize(size => size * 2);
  };

  useEffect(() => {
    searchSuppliers();
  }, [pageSize]);

  useEffect(() => {
      setSupplierSearch(selectedSupplier?.Name ?? "");
  }, [selectedSupplier]);

  const [searching, setSearching] = useState(false);

  const searchSuppliersSC = async (skipIndex, take, filter) => {
    if (disabled) return;

    let params = {
      pageSize: take, 
      pageIndex: skipIndex,
      searchPhrase: filter,
      SortExpression: "", 
      SortDirection: "",
      PopulatedList: false,
    };

    const suppliers = await Fetch.post({
      url: `/Supplier/GetSuppliers`,
      params: params
    });

    return { data: suppliers.Results, total: suppliers.TotalResults };
  }

  const searchSuppliers = async () => {
    if (disabled) return;

    setSearching(true);

    let params = {
      pageSize: pageSize, pageIndex: 0,
      searchPhrase: supplierSearch,
      SortExpression: "", SortDirection: "",
      PopulatedList: false,
    };

    const suppliers = await Fetch.post({
      url: `/Supplier/GetSuppliers`,
      params: params
    });

    setSuppliers(suppliers.Results);
    setTotalSuppliers(suppliers.TotalResults);

    setSearching(false);
  };

  const [showCreate, setShowCreate] = useState(false);

  const addNewSupplier = () => {
    setShowCreate(true);
  };

  const onSupplierSave = (supplier) => {
    if (supplier) {
      setSuppliers([...suppliers, supplier]);
      setSelectedSupplier(supplier);
      setSupplierSearch(supplier.Name);
    }

    setShowCreate(false);
  };

  return (
    <>
      <SCComboBox
        addOption={(!ignoreAddOption && accessStatus !== Enums.AccessStatus.LockedWithAccess && accessStatus !== Enums.AccessStatus.LockedWithOutAccess && inventoryPermission ?
          { text: "Add new supplier", action: () => addNewSupplier() } : null)}
        label="Supplier"
        name="SupplierName"
        placeholder="Select supplier"
        onChange={setSelectedSupplier}
        required={isRequired}
        error={error}
        disabled={disabled}
        value={selectedSupplier}
        dataItemKey="ID"
        textField="Name"
        getOptions={searchSuppliersSC}
      />
      {/* <SelectInput
        addOption={(accessStatus !== Enums.AccessStatus.LockedWithAccess && accessStatus !== Enums.AccessStatus.LockedWithOutAccess && inventoryPermission ?
          { text: "Add new supplier", action: () => addNewSupplier() } : null)}
        showMoreOption={{ action: () => showMore() }}
        changeHandler={handleSupplierChange}
        label="Supplier"
        name="SupplierName"
        searchFunc={searchSuppliers}
        searching={searching}
        options={suppliers}
        totalOptions={totalSuppliers}
        placeholder="Select supplier"
        setSelected={setSelectedSupplier}
        type="supplier"
        value={supplierSearch}
        required={isRequired}
        error={error}
        disabled={disabled}
      /> */}

      {showCreate &&
          <CreateNewSupplierModal
              show={showCreate}
              onClose={() => setShowCreate(false)}
              supplierCreated={onSupplierSave}
              isNew
              supplier={selectedSupplier}
          />
        // <ManageSupplier isNew={true} onSupplierSave={onSupplierSave} accessStatus={accessStatus} />
      }
    </>
  )
}

export default SupplierSelector;
