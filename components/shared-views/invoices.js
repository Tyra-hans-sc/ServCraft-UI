import React, { useState, useEffect, useContext, useRef, useMemo } from 'react';
import { colors, fontSizes, layout, fontFamily } from '../../theme';
import KendoTable from '../kendo/kendo-table';
import Search from '../search';
import KendoPager from '../../components/kendo/kendo-pager';
import DownloadDropdown from '../../components/download-dropdown';
import Button from '../button';
import Router from 'next/router';
import CellStatus from '../cells/status-old';
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
import ToastContext from '../../utils/toast-context';
import Helper from '../../utils/helper';

import PS from '../../services/permission/permission-service';

function Invoices({ moduleID, module, customerID, accessStatus }) {

  const createInvoiceDisabled = accessStatus === Enums.AccessStatus.LockedWithAccess
    || accessStatus === Enums.AccessStatus.LockedWithOutAccess
    || Helper.isNullOrUndefined(customerID);

  const [columnState, setColumnState] = useState([
    {
      Header: 'Invoice Number',
      accessor: 'InvoiceNumber',
      CellType: 'string',
      ColumnName: 'InvoiceNumber',
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
      Header: 'Invoice Date',
      accessor: 'InvoiceDate',
      CellType: 'date',
      ColumnName: 'InvoiceDate',
      Cell: ({ cell: { value } }) => <CellDate value={value} />
    },
    {
      Header: 'Due Date',
      accessor: 'DueDate',
      CellType: 'date',
      ColumnName: 'DueDate',
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
      Header: 'Invoiced Amount',
      accessor: 'TotalInclusive',
      extraClasses: 'header-right-align',
      CellType: 'currency',
      ColumnName: 'TotalInclusive',
      Cell: ({ cell: { value } }) => <CellCurrency value={value} />
    },
    {
      Header: 'Status',
      accessor: 'InvoiceStatus',
      CellType: 'status',
      ColumnName: 'InvoiceStatus',
      Cell: ({ cell: { value } }) => <CellStatus value={value} valueEnum="InvoiceStatus" />
    },
  ]);

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

      if (column.accessor == 'LocationDescription') {
        columnObject['accessor'] = (row) => {
          if (row.Location) {
            return row.Location.LocationDisplay;
          } else {
            return row.LocationDescription;
          }
        }
        columnObject['Cell'] = ({ cell: { value } }) => <CellWide value={value} />;
      }

      return columnObject;
    }),
    [columnState]
  );

  function rowClick(row) {
    Helper.nextRouter(Router.push, `/invoice/${row.original.ID}`);
  }

  const toast = useContext(ToastContext);

  const [invoiceResults, setInvoiceResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [sortField, setSortField] = useState('');
  const [sortDirection, setSortDirection] = useState('');
  const [searchVal, setSearchVal] = useState('');
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  let ancillaryFilterList = useRef({
    IncludeCancelled: [{
      type: Enums.ControlType.Switch,
      label: 'Include cancelled invoices',
    }],
  });

  const [ancillaryFilters, setAncillaryFilters] = useState({ IncludeCancelled: false });

  const handleAncillaryFilterChange = (result) => {
    if (result.reset) {
      setAncillaryFilters({ IncludeCancelled: false });
    }
    else {
      setAncillaryFilters({ IncludeCancelled: result.checked });
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
      searchInvoices();
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
    searchInvoices();
  }, [currentPage]);

  function setSort(field) {
    setSortDirection(Helper.getSortDirection(field, sortField, sortDirection));
    setSortField(field);
  }

  let invoiceStatus = [Enums.getEnumStringValue(Enums.InvoiceStatus, Enums.InvoiceStatus.Draft), Enums.getEnumStringValue(Enums.InvoiceStatus, Enums.InvoiceStatus.Unpaid),
  Enums.getEnumStringValue(Enums.InvoiceStatus, Enums.InvoiceStatus.Paid)];

  async function searchInvoices() {

    setSearching(true);

    let params = {
      pageSize: pageSize,
      pageIndex: (currentPage - 1),
      searchPhrase: searchVal,
      SortExpression: sortField,
      SortDirection: sortDirection,
      InvoiceStatusIDList: ancillaryFilters["IncludeCancelled"] ? [...invoiceStatus, Enums.getEnumStringValue(Enums.InvoiceStatus, Enums.InvoiceStatus.Cancelled)] : invoiceStatus,
    };

    if (module == Enums.Module.Customer) {
      params = { ...params, CustomerIDList: [customerID] };
    } else if (module == Enums.Module.Project) {
      params = { ...params, ItemID: moduleID, ModuleIDList: [Enums.getEnumStringValue(Enums.Module, module)] };
    } else {
      params = { ...params, ItemID: moduleID };
    }

    let searchRes = await Fetch.post({
      url: '/Invoice/GetInvoices',
      params: params,
      toastCtx: toast
    });

    setInvoiceResults(searchRes.Results);
    setTotalResults(searchRes.TotalResults);
    setSearching(false);
  }

  const createInvoiceClick = () => {
    Helper.nextRouter(Router.push, `/invoice/create?module=${module}&moduleID=${moduleID}&customerID=${customerID}`);
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
    <div className={`tab-list-container ${invoiceResults.length == 0 ? 'full-height' : ''}`}>
      <div className="row">
        <div className="search-container">
          <Search
            placeholder="Search Invoice number"
            resultsNum={invoiceResults.length}
            searchVal={searchVal}
            setSearchVal={setSearchVal}
            searchFunc={searchInvoices}
            ancillaryFilters={ancillaryFilterList.current}
            setAncillaryFilters={handleAncillaryFilterChange}
          />
        </div>

        {module == Enums.Module.Customer ?
          <div className="action-buttons">
            {accessStatus !== Enums.AccessStatus.LockedWithAccess && accessStatus !== Enums.AccessStatus.LockedWithOutAccess && exportPermission ? <>
              <div className="download">
                <DownloadDropdown title={'Export'} options={[
                  {
                    url: '/Invoice/GetExportedInvoices', method: 'POST', params: {
                      ...params, CustomerIDList: [customerID],
                      InvoiceStatusIDList: ancillaryFilters["IncludeCancelled"] ? [...invoiceStatus, Enums.getEnumStringValue(Enums.InvoiceStatus, Enums.InvoiceStatus.Cancelled)] : invoiceStatus,
                      ExportAll: false
                    }, label: 'Export'
                  }]
                } />
              </div>
            </> : ''}
          </div> : ''
        }

        <div className="create">
          <Button disabled={createInvoiceDisabled} text="Create" icon="plus-circle" extraClasses="fit-content no-margin" onClick={createInvoiceClick} />
        </div>
      </div>
      <div className={"no-items" + (invoiceResults.length == 0 ? " no-items-visible" : "")}>
        <div className={"loading-overlay" + (searching ? " loading-overlay-visible" : "")}>
          <div className="loader"></div>
        </div>
        <img src="/job-folder.svg" alt="Invoice Folder" />
        <h3>No invoices found</h3>
        <img className="wave" src="/wave.svg" alt="wave" />
      </div>

      <div className="margin-top">
        {invoiceResults.length != 0 ?
          <KendoTable
            searching={searching}
            actions={[
              { text: "Edit", icon: "edit", function: (row) => Helper.nextRouter(Router.push, `/invoice/${row.ID}`) },
            ]}
            columns={columns}
            data={invoiceResults}
            rowClick={rowClick}
            setSort={setSort}
            sortField={sortField}
            sortDirection={sortDirection}
            type="Invoice"
            heightOffset={405}
            highlightColumnName="InvoiceNumber"
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

export default Invoices;
