import React, { useState, useRef, useEffect } from 'react';
import { colors, fontSizes, layout, fontFamily } from '../../theme';
import Fetch from '../../utils/Fetch';
import { useOutsideClick } from "rooks";
import SelectInput from '../../components/select-input';
import ManageSupplier from '../modals/supplier/manage-supplier';
import PS from '../../services/permission/permission-service';
import * as Enums from '../../utils/enums';

function PurchaseOrderAddSupplier({defaultView, setDefaultView, selectSupplier, error}) {

  const [supplierSearch, setSupplierSearch] = useState('');
  const [selectedSupplierID, setSelectedSupplierID] = useState();
  const [searching, setSearching] = useState(false);
  const [suppliers, setSuppliers] = useState([]);
  const [totalResults, setTotalResults] = useState(0);
  const [inventoryPermission] = useState(PS.hasPermission(Enums.PermissionName.Inventory));
  const [pageSize, setPageSize] = useState(10);

  const handleSupplierChange = (e) => {
    setSupplierSearch(e.target.value);
  };

  const setSelectedSupplier = (e) => {
    if (e) {
      setSelectedSupplierID(e.ID);
    } else {
      setSelectedSupplierID(null);
    }
  };

  const searchSuppliers = async () => {
    setSearching(true);

    const supplierResponse = await Fetch.post({
      url: `/Supplier/GetSuppliers`,
      params: {
        pageSize: pageSize, 
        pageIndex: 0,
        searchPhrase: supplierSearch,
        sortExpression: "", 
        sortDirection: "",
      },
    });

    setSuppliers(supplierResponse.Results);
    setTotalResults(supplierResponse.TotalResults);
    setSearching(false);
  };

  const showMore = () => {
    setPageSize(size => size * 2);
  };

  const oldPageSize = useRef(pageSize);
  useEffect(() => {
    let canSearch = oldPageSize.current !== pageSize;
    oldPageSize.current = pageSize;
    if (canSearch) {
      searchSuppliers();
    }
  }, [pageSize]);

  const addSupplierClick = () => {
    setDefaultView(false);
  };

  useEffect(() => {
    if (selectedSupplierID) {
      selectSupplier(selectedSupplierID);
    }
  }, [selectedSupplierID]);

  const addSupplierRef = useRef();

  useOutsideClick(addSupplierRef, () => {
    if (!defaultView && !showCreateSupplier) {
      setDefaultView(true);
      selectSupplier(null);
    }
  });

  const [showCreateSupplier, setShowCreateSupplier] = useState(false);

  const createSupplier = (supplier) => {
    if (supplier) {
      selectSupplier(supplier.ID);
    }
    setShowCreateSupplier(false);
  };

  return (
    <div>
      <div className={`add-supplier-box ${defaultView ? 'flex-show' : ''} ${error ? ' error' : ''}`} onClick={addSupplierClick}>
        <div className="add-supplier-image">
          <img src="/icons/user-plus-blue.svg" alt="supplier-add" />
        </div>
        <div className="add-supplier-label">
          Add a supplier to your purchase order
        </div>
      </div>

      { selectedSupplierID ?
        '' :
        <div className={`add-supplier-search ${defaultView ? '' : 'show'}`} ref={addSupplierRef}>
          <SelectInput
            addOption={(inventoryPermission ? {text: "Add new supplier", action: () => setShowCreateSupplier(!showCreateSupplier)} : null) }
            showMoreOption={{ action: () => showMore() }}
            changeHandler={handleSupplierChange} 
            label="Supplier name"
            options={suppliers}
            placeholder="Search for a supplier"
            required={true}
            searchFunc={searchSuppliers}
            searching={searching}
            setSelected={setSelectedSupplier}
            totalOptions={totalResults}
            type="supplier"
            value={supplierSearch}             
          />
        </div>
      }

      { showCreateSupplier ? 
        <ManageSupplier isNew={true} onSupplierSave={createSupplier} />
        : ''
      }

      <style jsx>{`
        .add-supplier-box {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          background-color: ${colors.backgroundGrey};
          width: 320px;
          height: 232px;
          cursor: pointer;
          display: none;
        }
        .add-supplier-box img {
          width: 72px;
          height: auto;
        }
        .add-supplier-label {

        }
        .add-supplier-search {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          background-color: ${colors.backgroundGrey};
          width: 320px;
          height: 232px;
          display: none;
          margin-top: 1rem;
        }
        .supplier-selected {

        }
        .flex-show {
          display: flex;
        }
        .show {
          display: block;
        }
        .error {
          border: 1px solid ${colors.warningRed};
        }
      `}</style>
    </div>
  );
}

export default PurchaseOrderAddSupplier;
