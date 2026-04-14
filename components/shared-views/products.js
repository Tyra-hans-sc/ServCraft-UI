import React, {useMemo, useState, useEffect, useContext, useRef} from 'react';
import { colors, fontSizes, layout, fontFamily } from '../../theme';
import Search from '../search';
import KendoPager from '../../components/kendo/kendo-pager';
import Button from '../button';
import Router from 'next/router';
import DownloadDropdown from '../../components/download-dropdown';

import CellStatus from '../cells/status-old';
import CellDate from '../cells/date';
import CellBold from '../cells/bold';
import CellTech from '../cells/tech';
import CellWide from '../cells/wide';
import CellBool from '../cells/bool';
import CellCurrency from '../cells/currency';
import CellNumber from '../cells/number';
import WarrantyIndicator from '../product/warranty-indicator';

import KendoCellWarrantyIndicator from '../../components/kendo/cells/kendo-cell-warranty-indicator';
import KendoTable from '../../components/kendo/kendo-table';
import KendoCellEmployee from '../../components/kendo/cells/kendo-cell-employee';
import KendoCellDate from '../../components/kendo/cells/kendo-cell-date';
import KendoCellCurrency from '../../components/kendo/cells/kendo-cell-currency';
import KendoCellNumber from '../../components/kendo/cells/kendo-cell-number';
import KendoCellStatus from '../../components/kendo/cells/kendo-cell-status';
import KendoCellBool from '../../components/kendo/cells/kendo-cell-bool';

import * as Enums from '../../utils/enums';
import ToastContext from '../../utils/toast-context';
import Helper from '../../utils/helper';

import AssetService from '../../services/asset/asset-service';
import PS from '../../services/permission/permission-service';

function Products({module, moduleID, accessStatus}) {

  const [columnState, setColumnState] = useState([]);

  useEffect(() => {

    let columns = [{
      Header: 'Number',
      accessor: 'ProductNumber',
      ColumnName: 'ProductNumber',
      CellType: 'string',
    }, {
      Header: 'Scrapped',
      accessor: 'IsScrapped',
      ColumnName: 'IsScrapped',
      CellType: 'icon',
    }];

    switch(module) {
      case Enums.Module.Customer:        
        break;
      default:
        columns.push({
            Header: 'Customer',
            accessor: 'CustomerName',
            ColumnName: 'CustomerContactFullName',
            CellType: 'none',
        });
    }

    columns.push({
        Header: 'Location',
        accessor: 'LocationDisplay',
        ColumnName: 'LocationDisplay',
    },
    {
        Header: 'Employee',
        accessor: 'Employee',
        CellType: 'employee',
        ColumnName: 'EmployeeFullName',
    },
    {
        Header: 'Inventory',
        accessor: 'InventoryDescription',
        ColumnName: 'InventoryDescription',
        CellType: 'none',
    },
    {
        Header: 'Supplier',
        accessor: 'Supplier',
        ColumnName: 'SupplierDescription',
        CellType: 'none',
    },
    {
        Header: 'Updated By',
        accessor: 'ModifiedBy',
        ColumnName: 'ModifiedBy',
        CellType: 'none',
    },
    {
        Header: 'Updated Date',
        accessor: 'ModifiedDate',
        ColumnName: 'ModifiedDate',
        CellType: 'date',
    });

    setColumnState(columns);
  }, [module]);

  const columns = React.useMemo(
    () => columnState.map(function (column) {
      let columnObject = {
        Header: column.Header,
        accessor: column.ColumnName,
        ColumnName: column.ColumnName,
        UserWidth: column.UserWidth,
      }

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
          case 'int':
          case 'int?':
            columnObject['extraClasses'] = 'header-right-align';
            columnObject['Cell'] = ({ cell: { value } }) => <CellNumber value={value} isDecimal={false} />;
            columnObject['KendoCell'] = (props) => <KendoCellNumber {...props} isDecimal={false} />;
            break;
          case 'decimal':
          case 'decimal?':
            columnObject['extraClasses'] = 'header-right-align';
            columnObject['Cell'] = ({ cell: { value } }) => <CellNumber value={value} isDecimal={true} />;
            columnObject['KendoCell'] = (props) => <KendoCellNumber {...props} isDecimal={true} />;
            break;
          case 'status':
            columnObject['Cell'] = ({ cell: { value } }) => <CellStatus value={value} />;
            columnObject['KendoCell'] = (props) => <KendoCellStatus {...props} />
            break;
          case 'icon':
            columnObject['Cell'] = ({ cell: { value } }) => <CellBool value={value} />;
            columnObject['KendoCell'] = (props) => <KendoCellBool {...props} />;
            break;
          default:
            columnObject['Cell'] = ({ cell: { value } }) => <CellBold value={value} />;
        }
      }

      if (column.ColumnName == 'LocationDisplay') {
        columnObject['Cell'] = ({ cell: { value } }) => <CellWide value={value} />;
      }

      if (column.ColumnName === "WarrantyPeriod") {
        columnObject['accessor'] = (row) => {
          return row;
        }
        columnObject['Cell'] = ({ cell: { value } }) => <WarrantyIndicator purchaseDate={value.PurchaseDate} warrantyPeriod={value.WarrantyPeriod} />;
        columnObject['KendoCell'] = (props) => <KendoCellWarrantyIndicator {...props} />
      }

      return columnObject;
    }),
    [columnState]
  );

  const rowClick = (row) => {
    Helper.nextRouter(Router.push,`/asset/[id]`, `/asset/${row.original.ID}`);
  };

  const toast = useContext(ToastContext);

  const [productResults, setProductResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [sortField, setSortField] = useState('');
  const [sortDirection, setSortDirection] = useState('');
  const [searchVal, setSearchVal] = useState('');
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  let ancillaryFilterList = useRef({
    IncludeScrapped: [{
      type: Enums.ControlType.Switch,
      label: 'Include scrapped assets',
    }]
  });

  const [ancillaryFilters, setAncillaryFilters] = useState({IncludeScrapped: false});

  const handleAncillaryFilterChange = (result) => {
    if (result.key == "IncludeScrapped") {
      setAncillaryFilters({ IncludeScrapped: result.checked });
    }
  };

  const [pageSize, setPageSize] = useState(10);
  const pageSizeUpdate = useRef(true);

  const pageSizeChanged = (size) => {
    if (size != pageSize) {
      setPageSize(size);
    } else {
      pageSizeUpdate.current = false;
    }
  };

  const pageChanged = (page) => {
    setCurrentPage(page);
  };

  useEffect(() => {
    if (pageSizeUpdate.current) {
        pageSizeUpdate.current = false;
        return;
    }
    if (currentPage == 1) {
      searchProducts();
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
    searchProducts();
  }, [currentPage]);

  function setSort(field) {
    setSortDirection(Helper.getSortDirection(field, sortField, sortDirection));
    setSortField(field);
  }

  async function searchProducts() {

    setSearching(true);

    const searchRes = await AssetService.getAssetsForCustomer(moduleID, searchVal, pageSize, currentPage - 1, sortField, sortDirection, ancillaryFilters["IncludeScrapped"], toast);
    setProductResults(searchRes.Results);
    setTotalResults(searchRes.TotalResults);

    setSearching(false);
  }

  const createAsset = () => {
    Helper.nextRouter(Router.push, `/asset/create?module=${module}&moduleID=${moduleID}`);
  };

  const [exportPermission] = useState(PS.hasPermission(Enums.PermissionName.Exports));
  const [params, setParams] = useState({});

  useEffect(() => {              
    setParams({
        searchPhrase: searchVal,
        IncludeScrapped: ancillaryFilters ? ancillaryFilters["IncludeScrapped"] : null,
        SortExpression: sortField,
        SortDirection: sortDirection,
    });
}, [searchVal, ancillaryFilters, sortField, sortDirection]);

  return (
    <div className={`tab-list-container ${productResults.length == 0 ? 'full-height': '' }`}>
      <div className="row">
        <div className="search-container">
          <Search
            placeholder="Search Asset number"
            resultsNum={productResults.length}
            searchVal={searchVal}
            setSearchVal={setSearchVal}
            searchFunc={searchProducts}
            ancillaryFilters={ancillaryFilterList.current}
            setAncillaryFilters={handleAncillaryFilterChange}
          />
        </div>
        <div className="action-buttons">
          {accessStatus !== Enums.AccessStatus.LockedWithAccess && accessStatus !== Enums.AccessStatus.LockedWithOutAccess && exportPermission ? <>
              <div className="download">
                <DownloadDropdown title={'Export'} options={[
                  { url: '/Product/GetExportedProducts', method: 'POST', params: { ...params, CustomerIDList: [moduleID], ExportAll: false }, label: 'Export' }
                ]} />
              </div>
            </> : ''}
        </div>
        <div className="create">
          <Button disabled={accessStatus === Enums.AccessStatus.LockedWithAccess || accessStatus === Enums.AccessStatus.LockedWithOutAccess}
            text="Create" icon="plus-circle" extraClasses="fit-content no-margin" onClick={createAsset} />
        </div>
      </div>
      <div className={"no-items" + (productResults.length == 0 ? " no-items-visible" : "")}>
        <div className={"loading-overlay" + (searching ? " loading-overlay-visible" : "")}>
          <div className="loader"></div>
        </div>
        <img src="/job-folder.svg" alt="Assets Folder" />
        <h3>No assets found</h3>
        <img className="wave" src="/wave.svg" alt="wave" />
      </div>

      <div className="margin-top"> 
          {productResults.length != 0 ?
              <KendoTable
                  searching={searching}
                  actions={[
                      {text: "Edit", icon: "edit", function: (row) => Helper.nextRouter(Router.push,'/asset/[id]', '/asset/'+row.ID)},
                    ]}
                  columns={columns}
                  data={productResults}
                  rowClick={rowClick}
                  setSort={setSort}
                  sortField={sortField}
                  sortDirection={sortDirection}
                  type="Asset"
                  heightOffset={300}
              /> : ''}
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
        .create {
          position: absolute;
          top: 0;
          right: 0;
        }
        .heading {
          color: ${colors.blueGrey};
          font-weight: bold;
          margin: 1.5rem 0 0.5rem;
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

export default Products;
