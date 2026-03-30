import React, { useState, useEffect, useContext, useRef, useMemo } from 'react';
import { colors, fontSizes, layout, fontFamily } from '../../theme';
import KendoTable from '../kendo/kendo-table';
import Search from '../search';
import KendoPager from '../../components/kendo/kendo-pager';
import Button from '../button';
import DownloadDropdown from '../../components/download-dropdown';
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
import Storage from '../../utils/storage';

import PS from '../../services/permission/permission-service';

function Quotes({ module, moduleID, customerID, accessStatus }) {

  const createQuoteDisabled = accessStatus === Enums.AccessStatus.LockedWithAccess
    || accessStatus === Enums.AccessStatus.LockedWithOutAccess
    || Helper.isNullOrUndefined(customerID);

    const [columnState, setColumnState] = useState([
        {
          Header: 'Quote Number',
          accessor: 'QuoteNumber',
          CellType: 'string',
          ColumnName: 'QuoteNumber',
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
          Header: 'Quote Date',
          accessor: 'QuoteDate',
          CellType: 'date',
          ColumnName: 'QuoteDate',
          Cell: ({ cell: { value } }) => <CellDate value={value} />
        },
        {
          Header: 'Expiry Date',
          accessor: 'ExpiryDate',
          CellType: 'date',
          ColumnName: 'ExpiryDate',
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
          Header: 'Quoted Amount',
          accessor: 'TotalInclusive',
          extraClasses: 'header-right-align',
          CellType: 'currency',
          ColumnName: 'TotalInclusive',
          Cell: ({ cell: { value } }) => <CellCurrency value={value} />
        },
        {
          Header: 'Status',
          accessor: 'QuoteStatus',
          CellType: 'status',
          ColumnName: 'QuoteStatus',
          Cell: ({ cell: { value } }) => <CellStatus value={value} valueEnum="QuoteStatus" />
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

      // for table resize columns
      async function resetColumnWidths() {
        const newState = columnState.map(function (column) {
          column.UserWidth = null;
          return column;
        });
        setColumnState(newState);
        columnMappingPut(newState);
      }

      async function onColumnResize(columnName, width, columnNamesAndWidths) {
        const newState = columnState.map(function (column) {
          if (column.ColumnName === columnName) {
            column.UserWidth = width;
          } else if (columnNamesAndWidths) {
            let match = columnNamesAndWidths.find(x => x.columnName === column.ColumnName);
            if (match) {
              column.UserWidth = match.width;
            }
          }
          return column;
        });
        setColumnState(newState);
        columnMappingPut(newState);
      }
      // for table resize columns

  function rowClick(row) {
    Helper.nextRouter(Router.push, `/quote/${row.original.ID}`);
  }

  const toast = useContext(ToastContext);

  const [quoteResults, setQuoteResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [sortField, setSortField] = useState('');
  const [sortDirection, setSortDirection] = useState('');
  const [searchVal, setSearchVal] = useState('');
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  let ancillaryFilterList = useRef({
    IncludeCancelled: [{
      type: Enums.ControlType.Switch,
      label: 'Include cancelled quotes',
    }],
    ExpiredQuotes: [{
      type: Enums.ControlType.Switch,
      label: 'Hide expired quotes',
    }]
  });

  const [ancillaryFilters, setAncillaryFilters] = useState({ IncludeCancelled: false, ExpiredQuotes: false });

  const handleAncillaryFilterChange = (result) => {
    if (result.reset) {
      setAncillaryFilters({ IncludeCancelled: false, ExpiredQuotes: false });
    } else if (result.key == "IncludeCancelled") {
      setAncillaryFilters({ ...ancillaryFilters, IncludeCancelled: result.checked });
    } else if (result.key == "ExpiredQuotes") {
      setAncillaryFilters({ ...ancillaryFilters, ExpiredQuotes: result.checked });
    }
  };

  const [pageSize, setPageSize] = useState(Storage.getCookie(Enums.Cookie.pageSize) ? parseInt(Storage.getCookie(Enums.Cookie.pageSize)) : 10);

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


  const oldsearchVal = useRef(searchVal);
  const oldsortField = useRef(sortField);
  const oldsortDirection = useRef(sortDirection);
  const oldpageSize = useRef(pageSize);
  const oldancillaryFilters = useRef(ancillaryFilters);

  useEffect(() => {

    let changed = oldsearchVal.current !== searchVal
      || oldsortDirection.current !== sortDirection
      || oldsortField.current !== sortField
      || oldpageSize.current !== pageSize
      || Helper.jsonCompare(oldancillaryFilters.current, ancillaryFilters);

    oldsearchVal.current = searchVal;
    oldsortField.current = sortField;
    oldsortDirection.current = sortDirection;
    oldpageSize.current = pageSize;
    oldancillaryFilters.current = ancillaryFilters;

    if (pageSizeUpdate.current) {
      pageSizeUpdate.current = false;
      return;
    }

    if (!changed) return;

    if (currentPage == 1) {
      searchQuotes();
    } else {
      setCurrentPage(1);
    }
  }, [searchVal, sortField, sortDirection, pageSize, ancillaryFilters]);

  const firstUpdatePage = useRef(true);
  const oldcurrentPage = useRef(currentPage);
  useEffect(() => {

    if (firstUpdatePage.current) {
      firstUpdatePage.current = false;
      return;
    }

    let changed = oldcurrentPage.current !== currentPage;
    oldcurrentPage.current = currentPage;

    if (changed) {
      searchQuotes();
    }
  }, [currentPage]);

  useEffect(() => {
    searchQuotes();
  }, []);

  function setSort(field) {
    setSortDirection(Helper.getSortDirection(field, sortField, sortDirection));
    setSortField(field);
  }

  async function searchQuotes() {
    setSearching(true);

    let params = {
      pageSize: pageSize,
      pageIndex: (currentPage - 1),
      searchPhrase: searchVal,
      SortExpression: sortField,
      SortDirection: sortDirection,
      IncludeCancelled: ancillaryFilters["IncludeCancelled"],
      HideExpired: ancillaryFilters["ExpiredQuotes"],
      PopulatedList: false,
    };

    if (module == Enums.Module.Customer) {
      params = { ...params, CustomerIDList: [customerID], IncludeClosed: true };
    } else if (module == Enums.Module.Project) {
      params = { ...params, ItemID: moduleID, ModuleIDList: [Enums.getEnumStringValue(Enums.Module, module)] };
    } else {
      params = { ...params, ItemID: moduleID, IncludeClosed: true };
    }

    let searchRes = await Fetch.post({
        url: '/Quote/GetQuotes',
        params: params,
        toastCtx: toast
    });

    setQuoteResults(searchRes.Results);
    setTotalResults(searchRes.TotalResults);
    setSearching(false);
  }

  const createQuoteClick = () => {
    Helper.nextRouter(Router.push, `/quote/create?module=${module}&moduleID=${moduleID}&customerID=${customerID}`);
  };

  const [exportPermission] = useState(PS.hasPermission(Enums.PermissionName.Exports));
  const [params, setParams] = useState({});

  useEffect(() => {              
    setParams({
        searchPhrase: searchVal,
        IncludeCancelled: ancillaryFilters ? ancillaryFilters["IncludeCancelled"] : null,
        HideExpired: ancillaryFilters ? ancillaryFilters["ExpiredQuotes"] : null,
        SortExpression: sortField,
        SortDirection: sortDirection,
    });
  }, [searchVal, ancillaryFilters, sortField, sortDirection]);

  return (
    <div className={`tab-list-container ${quoteResults.length == 0 ? 'full-height' : ''}`}>
      <div className="row">
        <div className="search-container">
          <Search
            placeholder="Search Quote number"
            resultsNum={quoteResults.length}
            searchVal={searchVal}
            setSearchVal={setSearchVal}
            searchFunc={searchQuotes}
            ancillaryFilters={ancillaryFilterList.current}
            setAncillaryFilters={handleAncillaryFilterChange}
            setActiveFilterIds={(e) => {/*required do not remove*/}}
          />
        </div>

        {module == Enums.Module.Customer ? 
          <div className="action-buttons">
            {accessStatus !== Enums.AccessStatus.LockedWithAccess && accessStatus !== Enums.AccessStatus.LockedWithOutAccess && exportPermission ? <>
                <div className="download">
                  <DownloadDropdown title={'Export'} options={[
                    { url: '/Quote/GetExportedQuotes', method: 'POST', params: { ...params, CustomerIDList: [customerID], IncludeClosed: true, ExportAll: false }, label: 'Export' }]
                  } />
                </div>
              </> : ''}
          </div> : ''
        }

        <div className="create">
          <Button disabled={createQuoteDisabled} text="Create" icon="plus-circle" extraClasses="fit-content no-margin" onClick={createQuoteClick} />
        </div>
      </div>

      <div className={"no-items" + (quoteResults.length == 0 ? " no-items-visible" : "")}>
        <div className={"loading-overlay" + (searching ? " loading-overlay-visible" : "")}>
          <div className="loader"></div>
        </div>
        <img src="/job-folder.svg" alt="Quote Folder" />
        <h3>No quotes found</h3>
        <img className="wave" src="/wave.svg" alt="wave" />
      </div>

      <div className="margin-top"> 
          {quoteResults.length != 0 ?
            <KendoTable
                searching={searching}
                actions={[
                    { text: "Edit", icon: "edit", function: (row) => Helper.nextRouter(Router.push, `/quote/${row.ID}`) },
                ]}
                columns={columns}
                data={quoteResults}
                rowClick={rowClick}
                setSort={setSort}
                sortField={sortField}
                sortDirection={sortDirection}
                type="Quote"
                heightOffset={405}
                highlightColumnName="QuoteNumber"
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

export default Quotes;
