import React, {useState, useEffect, useContext, useRef, useMemo} from 'react';
import { colors, fontSizes, layout, fontFamily } from '../../theme';
import KendoTable from '../kendo/kendo-table';
import Search from '../search';
import KendoPager from '../../components/kendo/kendo-pager';
import Button from '../button';
import DownloadDropdown from '../../components/download-dropdown';
import Router from 'next/router';
import CellStatus from '../cells/status';
import CellDate from '../cells/date';
import CellBold from '../cells/bold';
import CellTech from '../cells/tech';
import CellCurrency from '../cells/currency';
import CellBool from '../cells/bool';

import KendoCellBool from '../../components/kendo/cells/kendo-cell-bool';
import KendoCellStatus from '../../components/kendo/cells/kendo-cell-status';
import KendoCellNumber from '../../components/kendo/cells/kendo-cell-number';
import KendoCellCurrency from '../../components/kendo/cells/kendo-cell-currency';
import KendoCellDate from '../../components/kendo/cells/kendo-cell-date';
import KendoCellEmployee from '../../components/kendo/cells/kendo-cell-employee';

import * as Enums from '../../utils/enums';
import Fetch from '../../utils/Fetch';
import Storage from '../../utils/storage';
import ToastContext from '../../utils/toast-context';
import Helper from '../../utils/helper';

import PS from '../../services/permission/permission-service';

function Purchases({moduleID, module, supplierID, accessStatus}) {

  const createPurchaseOrderDisabled = accessStatus === Enums.AccessStatus.LockedWithAccess 
    || accessStatus === Enums.AccessStatus.LockedWithOutAccess;

  const [columnState, setColumnState] = useState([{
    Header: 'Purchase Order Number',
    accessor: 'PurchaseOrderNumber',
    CellType: 'string',
    ColumnName: 'PurchaseOrderNumber',
    Cell: ({ cell: { value } }) => <CellBold value={value} />
  },
  {
    Header: 'Open',
    accessor: 'IsClosed',
    CellType: 'icon',
    ColumnName: 'IsClosed',
    Cell: ({ cell: { value } }) => <CellBool value={!value} />
  },
  {
    Header: 'Reference Number',
    accessor: 'Reference',
    CellType: 'string',
    ColumnName: 'Reference',
  },
  {
    Header: 'Item Ref',
    accessor: 'ItemReference',
    CellType: 'string',
    ColumnName: 'ItemReference',
  },
  {
    Header: 'Purchase Date',
    accessor: 'Date',
    CellType: 'date',
    ColumnName: 'Date',
    Cell: ({ cell: { value } }) => <CellDate value={value} />
  },
  {
    Header: 'Delivery Date',
    accessor: 'DeliveryDate',
    CellType: 'date',
    ColumnName: 'DeliveryDate',
    Cell: ({ cell: { value } }) => <CellDate value={value} />
  },
  {
    Header: 'Assigned To',
    accessor: 'Employee',
    CellType: 'employee',
    ColumnName: 'EmployeeFullName',
    Cell: ({ cell: { value } }) => <CellTech value={value} />
  },
  {
    Header: 'Purchase Order Amount',
    accessor: 'TotalInclusive',
    extraClasses: 'header-right-align',
    CellType: 'currency',
    ColumnName: 'TotalInclusive',
    Cell: ({ cell: { value } }) => <CellCurrency value={value} />
  },
  {
    Header: 'Status',
    accessor: 'PurchaseOrderStatus',
    CellType: 'status',
    ColumnName: 'PurchaseOrderStatus',
    Cell: ({ cell: { value } }) => <CellStatus value={value} valueEnum="PurchaseOrderStatus" />
  },]);

  const columns = useMemo(
    () => columnState.map(function (column) {
      let columnObject = {
        Header: column.Header,
        accessor: column.accessor,
        // for table resize columns
        ColumnName: column.ColumnName,
        UserWidth: column.UserWidth
        // for table resize columns
      };

      if (column.CellType != "none") {
        switch (column.CellType) {
          case 'employee':
            columnObject['Cell'] = ({ cell: { value } }) => <CellTech value={value} />;
            columnObject['KendoCell'] = (props) => <KendoCellEmployee {...props} employeesField="Employees" />;
            break;
          case 'date':
            columnObject['Cell'] = ({ cell: { value } }) => <CellDate value={value} />;
            columnObject['KendoCell'] = (props) => <KendoCellDate {...props} />;
            break;
          case 'currency':
            columnObject['extraClasses'] = 'header-right-align';
            columnObject['Cell'] = ({ cell: { value } }) => <CellCurrency value={value} />;
            columnObject['KendoCell'] = (props) => <KendoCellCurrency {...props} />;
            break;
          case 'status':
            columnObject['Cell'] = ({ cell: { value } }) => <CellStatus value={value} valueEnum={columnObject.accessor} />;
            columnObject['KendoCell'] = (props) => <KendoCellStatus {...props} valueEnum={columnObject.accessor} />;
            break;
          case 'icon':
            columnObject['Cell'] = ({ cell: { value } }) => <CellBool value={column.accessor == 'IsClosed' ? !value : value} />;
            columnObject['KendoCell'] = (props) => <KendoCellBool {...props} invertValue={column.ColumnName == 'IsClosed'} />;
            break;
          default:
            columnObject['Cell'] = ({ cell: { value } }) => <CellBold value={value} />;
        }
      }

      if (column.ColumnName == 'LocationDisplay') {
        columnObject['Cell'] = ({ cell: { value } }) => <CellWide value={value} />;
      }

      if (column.ColumnName == 'CustomerContactFullName') {
        columnObject['Cell'] = ({ cell: { value } }) => <CellWide value={value} />;
      }

      return columnObject;
    }),
    [columnState]
  );

  function rowClick(row) {
    Helper.nextRouter(Router.push, `/purchase/${row.original.ID}`);
  }

  const toast = useContext(ToastContext);

  const [purchaseOrderResults, setPurchaseOrderResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [sortField, setSortField] = useState('');
  const [sortDirection, setSortDirection] = useState('');
  const [searchVal, setSearchVal] = useState('');
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  let ancillaryFilterList = useRef({
    IncludeCancelled: [{
      type: Enums.ControlType.Switch,
      label: 'Include cancelled purchase orders',
    }]
  });

  const [ancillaryFilters, setAncillaryFilters] = useState({IncludeCancelled: false});

  const handleAncillaryFilterChange = (result) => {
    if (result.reset) {
      setAncillaryFilters({ IncludeCancelled: false });
    }
    else {
      setAncillaryFilters({ IncludeCancelled: result.checked });
    }
  };

  const [pageSize, setPageSize] = useState(10);

  const pageSizeChanged = (size) => {
    setPageSize(size);
  };

  const pageChanged = (page) => {
    setCurrentPage(page);
  };
  
  useEffect(() => {
    if (currentPage == 1) {
      searchPurchaseOrders();
    } else {
      setCurrentPage(1);
    }
  }, [sortField, sortDirection, pageSize, ancillaryFilters]);

  const firstUpdatePage = useRef(true);

  useEffect(() => {
    if (firstUpdatePage.current) {
      firstUpdatePage.current = false;
      return;
    }
    searchPurchaseOrders();
  }, [currentPage]);

  function setSort(field) {
    setSortDirection(Helper.getSortDirection(field, sortField, sortDirection));
    setSortField(field);
  }

  let purchaseOrderStatus = [Enums.getEnumStringValue(Enums.PurchaseOrderStatus, Enums.PurchaseOrderStatus.Draft), Enums.getEnumStringValue(Enums.PurchaseOrderStatus, Enums.PurchaseOrderStatus.Approved),
    Enums.getEnumStringValue(Enums.PurchaseOrderStatus, Enums.PurchaseOrderStatus.Billed)];

  const searchPurchaseOrders = async () => {

    setSearching(true);

    let params = {
      pageSize: pageSize,
      pageIndex: (currentPage - 1),
      searchPhrase: searchVal,
      SortExpression: sortField,
      SortDirection: sortDirection,
      PurchaseOrderStatusIDList: ancillaryFilters["IncludeCancelled"] ? [...purchaseOrderStatus, Enums.getEnumStringValue(Enums.PurchaseOrderStatus, Enums.PurchaseOrderStatus.Cancelled)] : purchaseOrderStatus,
    };

    if (module == Enums.Module.Supplier) {
      params = {...params, SupplierIDList: [supplierID]};
    } else if (module == Enums.Module.Project) {
      params = {...params, ItemID: moduleID, ModuleIDList: [Enums.getEnumStringValue(Enums.Module, module)]};
    } else {
      params = {...params, ItemID: moduleID};
    }

    let searchRes = await Fetch.post({
        url: '/PurchaseOrder/GetPurchaseOrders',
        params: params,
        toastCtx: toast
    });
    
    setPurchaseOrderResults(searchRes.Results);
    setTotalResults(searchRes.TotalResults);
    setSearching(false);
  }

  const createPuchaseOrderClick = () => {
    Helper.nextRouter(Router.push, `/purchase/create?module=${module}&moduleID=${moduleID}&supplierID=${supplierID}`);
  };

  const [exportPermission] = useState(PS.hasPermission(Enums.PermissionName.Exports));
  const [params, setParams] = useState({});

  useEffect(() => {              
    setParams({
        searchPhrase: searchVal,
        SortExpression: sortField,
        SortDirection: sortDirection,
    });
  }, [searchVal, ancillaryFilters, sortField, sortDirection]);

  return (
    <div className={`tab-list-container ${purchaseOrderResults.length == 0 ? 'full-height': '' }`}>
        <div className="row">

          {module != Enums.Module.Project ?
            <div className="search-container">
              <Search
                placeholder="Search Purchase order number"
                resultsNum={purchaseOrderResults.length}
                searchVal={searchVal}
                setSearchVal={setSearchVal}
                searchFunc={searchPurchaseOrders}
                ancillaryFilters={ancillaryFilterList.current}
                setAncillaryFilters={handleAncillaryFilterChange}
              />
            </div> : ''}

          {module == Enums.Module.Supplier ? 
            <div className="action-buttons">
              {accessStatus !== Enums.AccessStatus.LockedWithAccess && accessStatus !== Enums.AccessStatus.LockedWithOutAccess && exportPermission ? <>
                  <div className="download">
                    <DownloadDropdown title={'Export'} options={[
                      { url: '/PurchaseOrder/GetExportedPurchaseOrders', method: 'POST', params: { ...params, SupplierIDList: [supplierID],
                        PurchaseOrderStatusIDList: ancillaryFilters["IncludeCancelled"] ? [...purchaseOrderStatus, Enums.getEnumStringValue(Enums.PurchaseOrderStatus, Enums.PurchaseOrderStatus.Cancelled)] : purchaseOrderStatus,
                        ExportAll: false }, label: 'Export' }]
                    } />
                  </div>
                </> : ''}
            </div> : ''
          }

        <div className="create">
          <Button disabled={createPurchaseOrderDisabled} text="Create" icon="plus-circle" extraClasses="fit-content no-margin" onClick={createPuchaseOrderClick} />
        </div>
      </div>
      
      <div className={"no-items" + (purchaseOrderResults.length == 0 ? " no-items-visible" : "")}>
        <div className={"loading-overlay" + (searching ? " loading-overlay-visible" : "")}>
          <div className="loader"></div>
        </div>
        <img src="/job-folder.svg" alt="Purchase Order Folder" />
        <h3>No purchase orders found</h3>
        <img className="wave" src="/wave.svg" alt="wave" />
      </div>

    <div className="margin-top">
        {purchaseOrderResults.length != 0 ? <KendoTable
          searching={searching}
          actions={[
            {text: "Edit", icon: "edit", function: (row) => Helper.nextRouter(Router.push, `/purchase/${row.ID}`)},
          ]}
          columns={columns}
          data={purchaseOrderResults}
          rowClick={rowClick}
          setSort={setSort}
          sortField={sortField}
          sortDirection={sortDirection}
          type="PurchaseOrder"
          heightOffset={405}
          highlightColumnName="PurchaseOrderNumber"
        /> : ""}
      </div>

      <KendoPager pageSizeChanged={pageSizeChanged} pageChanged={pageChanged} totalResults={totalResults} searchValue={searchVal} parentPageNumber={currentPage} />

      <style jsx>{`
        .row {
          display: flex;
          position: relative;
        }
        .action-buttons {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          width: 100%;
          justify-content: flex-end;
        }
        .heading {
          color: ${colors.blueGrey};
          font-weight: bold;
          margin: 1.5rem 0 0.5rem;
        }
        .create {
          position: absolute;
          top: 0;
          right: 0;
        }
        a {
          text-decoration: none;
        }
        .search-container :global(.search) {
          width: 528px;
        }
        .margin-top {
          margin-top: 0.5rem;
        }
      `}</style>
    </div>
  )
}

export default Purchases;
