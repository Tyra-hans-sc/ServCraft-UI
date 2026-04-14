import React, {useMemo, useState, useEffect, useContext, useRef} from 'react';
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
import CellWide from '../cells/wide';
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

import QueryService from '../../services/query/query-service';
import PS from '../../services/permission/permission-service';

function Queries({module, moduleID, accessStatus}) {

  const [columnState, setColumnState] = useState([]);

  useEffect(() => {
    let columns = [
      {
        Header: 'Number',
        accessor: 'QueryCode',
        ColumnName: 'QueryCode',
        CellType: 'string',
      },
      {
        Header: 'Open',
        accessor: 'IsClosed',
        ColumnName: 'IsClosed',
        CellType: 'icon',
      }
    ];

    switch(module) {
      case Enums.Module.Customer:        
        break;
      default:
        columns.push({
            Header: 'Customer',
            accessor: 'CustomerName',
            ColumnName: 'CustomerContactFullName',
            CellType: 'bold',
        });
    }

    columns.push({
        Header: 'Location',
        accessor: 'LocationDescription',
        ColumnName: 'LocationDisplay',
    },
    {
        Header: 'Employee',
        accessor: 'Employee',
        CellType: 'employee',
        ColumnName: 'EmployeeFullName',
    },
    {
        Header: 'Type',
        accessor: 'QueryType',
        ColumnName: 'QueryTypeDescription',
        CellType: 'none',
    },
    {
        Header: 'Status',
        accessor: 'QueryStatus',
        ColumnName: 'QueryStatusDescription',
        CellType: 'status',
    },
    {
        Header: 'Follow Up',
        accessor: 'FollowupDate',
        ColumnName: 'FollowupDate',
        CellType: 'date',
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

  const rowClick = (row) => {
    Helper.nextRouter(Router.push,`/query/[id]`, `/query/${row.original.ID}`);
  };

  const toast = useContext(ToastContext);

  const [queryResults, setQueryResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [sortField, setSortField] = useState('');
  const [sortDirection, setSortDirection] = useState('');
  const [searchVal, setSearchVal] = useState('');
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  let ancillaryFilterList = useRef({
    IncludeClosed: [{
      type: Enums.ControlType.Switch,
      label: 'Include closed queries',
    }]
  });

  const [ancillaryFilters, setAncillaryFilters] = useState({IncludeClosed: true});

  const handleAncillaryFilterChange = (result) => {
    if (result.key == "IncludeClosed") {
      setAncillaryFilters({ IncludeClosed: result.checked });
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
      searchQueries();
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
    searchQueries();
  }, [currentPage]);

  function setSort(field) {
    setSortDirection(Helper.getSortDirection(field, sortField, sortDirection));
    setSortField(field);
  }

  async function searchQueries() {

    setSearching(true);

    const searchRes = await QueryService.getQueriesForCustomer(moduleID, pageSize, currentPage - 1, searchVal, sortField, sortDirection, ancillaryFilters["IncludeClosed"], toast);
    setQueryResults(searchRes.Results);
    setTotalResults(searchRes.TotalResults);

    setSearching(false);
  }

  const [exportPermission] = useState(PS.hasPermission(Enums.PermissionName.Exports));
  const [params, setParams] = useState({});

  useEffect(() => {              
    setParams({
        searchPhrase: searchVal,
        IncludeClosed: ancillaryFilters ? ancillaryFilters["IncludeClosed"] : null,
        SortExpression: sortField,
        SortDirection: sortDirection,
    });
}, [searchVal, ancillaryFilters, sortField, sortDirection]);

  return (
    <div className={`tab-list-container ${queryResults.length == 0 ? 'full-height': '' }`}>
      <div className="row">
        <div className="search-container">
          <Search
            placeholder="Search Query code"
            resultsNum={queryResults.length}
            searchVal={searchVal}
            setSearchVal={setSearchVal}
            searchFunc={searchQueries}
            ancillaryFilters={ancillaryFilterList.current}
            setAncillaryFilters={handleAncillaryFilterChange}
            initialAncillaryFilters={ancillaryFilterList}
          />
        </div>

        {module == Enums.Module.Customer ? 
          <div className="action-buttons">
            {accessStatus !== Enums.AccessStatus.LockedWithAccess && accessStatus !== Enums.AccessStatus.LockedWithOutAccess && exportPermission ? <>
                <div className="download">
                  <DownloadDropdown title={'Export'} options={[
                    { url: '/Query/GetExportedQueries', method: 'POST', params: { ...params, CustomerIDList: [moduleID], ExportAll: false }, label: 'Export' }]
                  } />
                </div>
              </> : ''}
          </div> : ''
        }

        <div className="create">
          <a href={`/query/create?module=${module}&moduleID=${moduleID}`}>
            <Button disabled={accessStatus === Enums.AccessStatus.LockedWithAccess || accessStatus === Enums.AccessStatus.LockedWithOutAccess}
              text="Create" icon="plus-circle" extraClasses="fit-content no-margin" />
          </a>
        </div>
      </div>
      <div className={"no-items" + (queryResults.length == 0 ? " no-items-visible" : "")}>
        <div className={"loading-overlay" + (searching ? " loading-overlay-visible" : "")}>
          <div className="loader"></div>
        </div>
        <img src="/job-folder.svg" alt="Queries Folder" />
        <h3>No queries found</h3>
        <img className="wave" src="/wave.svg" alt="wave" />
      </div>
      
        <div className="margin-top"> 
            {queryResults.length != 0 ?
                <KendoTable
                    searching={searching}
                    actions={[
                        {text: "Edit", icon: "edit", function: (row) => Helper.nextRouter(Router.push,'/query/[id]', '/query/'+row.ID)},
                      ]}
                    columns={columns}
                    data={queryResults}
                    rowClick={rowClick}
                    setSort={setSort}
                    sortField={sortField}
                    sortDirection={sortDirection}
                    type="Query"
                    heightOffset={300}
                    highlightColumnName="QueryCode"
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

export default Queries;
