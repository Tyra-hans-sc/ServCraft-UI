import React, { useMemo, useState, useContext, useEffect, useRef } from 'react';
import { colors, fontSizes, layout, fontFamily } from '../../theme';
import Search from '../../components/search';
import Router from 'next/router';
import CellStatus from '../../components/cells/status';
import CellDate from '../../components/cells/date';
import CellBold from '../../components/cells/bold';
import CellBool from '../../components/cells/bool';
import CellWide from '../../components/cells/wide';
import CellEmployee from '../../components/cells/employee';
import CellDescription from '../../components/cells/description';
import * as Enums from '../../utils/enums';
import Fetch from '../../utils/Fetch';
import ToastContext from '../../utils/toast-context';
import Helper from '../../utils/helper';

import KendoTable from '../kendo/kendo-table';
import KendoPager from '../../components/kendo/kendo-pager';

import KendoCellStatus from '../../components/kendo/cells/kendo-cell-status';
import KendoCellDate from '../../components/kendo/cells/kendo-cell-date';
import KendoCellEmployee from '../../components/kendo/cells/kendo-cell-employee';

function JobScheduleHistory({ jobScheduleID, accessStatus }) {

    const [columnState, setColumnState] = useState([
        {
            Header: 'Number',
            accessor: 'JobCardNumber',
            ColumnName: 'JobCardNumber',
            CellType: 'string',
        },
        {
            Header: 'Location',
            accessor: 'LocationDescription',
            ColumnName: 'LocationDisplay',
            CellType: 'string',
        },
        {
            Header: 'Assigned To',
            accessor: 'Employee',
            CellType: 'employee',
            ColumnName: 'EmployeeFullName',
        },
        {
            Header: 'Service',
            accessor: 'InventoryDescription',
            ColumnName: 'InventoryDescription',
            CellType: 'none',
        },
        {
            Header: 'Start',
            accessor: 'StartDate',
            ColumnName: 'StartDate',
            CellType: 'date',
        },
        {
            Header: 'Status',
            accessor: 'JobCardStatusDisplay',
            ColumnName: 'JobCardStatusDisplay',
            CellType: 'status',
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
        }]);

        const columns = React.useMemo(
            () => columnState.map(function (column) {
              let columnObject = {
                Header: column.Header,
                accessor: column.ColumnName,
                // for table resize columns
                ColumnName: column.ColumnName,
                UserWidth: column.UserWidth
                // for table resize columns
              };
        
              if (column.CellType != "none") {
                switch (column.CellType) {
                  case 'employee':
                    columnObject['Cell'] = ({ cell: { value } }) => <CellEmployee value={value} />;
                    columnObject['KendoCell'] = (props) => <KendoCellEmployee {...props} employeesField="Employees" />;
                    break;
                  case 'date':
                    columnObject['Cell'] = ({ cell: { value } }) => <CellDate value={value} />;
                    columnObject['KendoCell'] = (props) => <KendoCellDate {...props} />;
                    break;
                  case 'status':
                    columnObject['Cell'] = ({ cell: { value } }) => <CellStatus value={value} />;
                    columnObject['KendoCell'] = (props) => <KendoCellStatus {...props} />
                    break;
                  case 'bold':
                    columnObject['Cell'] = ({ cell: { value } }) => <CellBold value={value} />;
                    break;
                  case 'icon':
                    columnObject['Cell'] = ({ cell: { value } }) => <CellBool value={column.ColumnName == 'IsClosed' ? !value : value} />;
                    break;
                  case 'Description':
                    columnObject['Cell'] = ({ cell: { value } }) => <CellDescription value={value} />;
                    break;
                  default:
                    columnObject['Cell'] = ({ cell: { value } }) => <CellBold value={value} />;
                }
              }
        
              if (column.ColumnName == 'LocationDisplay') {
                columnObject['Cell'] = ({ cell: { value } }) => <CellWide value={value} />;
              }
        
              if (column.ColumnName == 'InventoryDescription') {
                columnObject['Cell'] = ({ cell: { value } }) => <CellWide value={value} />;
              }
        
              if (column.ColumnName == 'CustomerContactFullName') {
                columnObject['Cell'] = ({ cell: { value } }) => <CellWide value={value} />;
              }
        
              return columnObject;
            }),
            [columnState]
          );

    const toast = useContext(ToastContext);

    const [jobResults, setJobResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [sortField, setSortField] = useState('');
    const [sortDirection, setSortDirection] = useState('');
    const [searchVal, setSearchVal] = useState('');
    const [totalResults, setTotalResults] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);

    const [pageSize, setPageSize] = useState(10);

    const pageSizeChanged = (size) => {
        if (size != pageSize) {
            setPageSize(size);
        }
    };

    const pageChanged = (page) => {
        setCurrentPage(page);
    };

  const [ancillaryFiltersDef] = useState({
    IncludeClosed: [{
      type: Enums.ControlType.Switch,
      label: 'Include closed jobs',
    }],
    ShowArchived: [{
      type: Enums.ControlType.Switch,
      label: 'Include archived jobs',
    }],
  });

  useEffect(() => {
    if (currentPage == 1) {
      searchJobs();
    } else {
      setCurrentPage(1);
    }
  }, [sortField, sortDirection, pageSize]);

  const firstUpdatePage = useRef(true);
  useEffect(() => {
    if (firstUpdatePage.current) {
      firstUpdatePage.current = false;
      return;
    }
    searchJobs();
  }, [currentPage]);

  function setSort(field) {
    setSortDirection(Helper.getSortDirection(field, sortField, sortDirection));
    setSortField(field);
  }

  async function searchJobs() {

    setSearching(true);

    const searchRes = await Fetch.post({
      url: '/Job/GetJobs',
      params: {
        jobScheduleID: jobScheduleID,
        pageSize: pageSize,
        pageIndex: (currentPage - 1),
        searchPhrase: searchVal,
        SortExpression: sortField,
        SortDirection: sortDirection,
        IncludeClosed: ancillaryFilters.IncludeClosed,
        ShowArchived: ancillaryFilters.ShowArchived
      },
      toastCtx: toast
    });

    setJobResults(searchRes.Results);
    setTotalResults(searchRes.TotalResults);
    setSearching(false);
  }

  const rowClick = (row) => {
    Helper.nextRouter(Router.push, `/job/[id]`, `/job/${row.original.ID}`);
  }

  const [ancillaryFilters, setAncillaryFilters] = useState({ IncludeClosed: false, ShowArchived: false });

  const doSearchAncillary = useRef(false);

  useEffect(() => {
    
    if (doSearchAncillary.current) {
      doSearchAncillary.current = false;
      searchJobs();
    }

  }, [ancillaryFilters]);

  const handleAncillaryFilterChange = (result) => {
    doSearchAncillary.current = true;
    if (result.key == "IncludeClosed") {
      setAncillaryFilters({ ShowArchived: ancillaryFilters.ShowArchived, IncludeClosed: result.checked });
    } else if (result.key == "ShowArchived") {
      setAncillaryFilters({ IncludeClosed: ancillaryFilters.IncludeClosed, ShowArchived: result.checked });
    }
  };

  return (
    <div className="container">
      <div className="row">
        <div className="search-container">
          <Search
            placeholder="Search Job number"
            resultsNum={jobResults.length}
            searchVal={searchVal}
            setSearchVal={setSearchVal}
            searchFunc={searchJobs}
            ancillaryFilters={ancillaryFiltersDef}
            setAncillaryFilters={handleAncillaryFilterChange}
          />
        </div>
      </div>

      <div className={"no-items" + (jobResults.length == 0 ? " no-items-visible" : "")}>
        <div className={"loading-overlay" + (searching ? " loading-overlay-visible" : "")}>
          <div className="loader"></div>
        </div>
        <img src="/job-folder.svg" alt="Job Folder" />
        <h3>No jobs found</h3>
        <img className="wave" src="/wave.svg" alt="wave" />
      </div>

      {jobResults.length != 0 ? <KendoTable
        searching={searching}
        actions={[
          {text: "Edit", icon: "edit", function: (row) => Helper.nextRouter(Router.push,'/job/[id]', `/job/${row.ID}`)},
        ]}
        columns={columns}
        data={jobResults}
        rowClick={rowClick}
        setSort={setSort}
        sortField={sortField}
        sortDirection={sortDirection}
        type="Job"
        heightOffset={295}
        highlightColumnName="JobCardNumber"
      /> : ""}

      <KendoPager pageSizeChanged={pageSizeChanged} pageChanged={pageChanged} totalResults={totalResults} searchValue={searchVal}  parentPageNumber={currentPage}/>

      <style jsx>{`
        .container {
          display: flex;
          flex-direction: column;
          height: 100%;
          position: relative;
        }
        .row {
          display: flex;
          justify-content: space-between;
        }
        .heading {
          color: ${colors.blueGrey};
          font-weight: bold;
        }
        .create {
          max-width: 10rem;
          width: 100%;
        }
        .empty {
          align-items: center;
          display: flex;
          flex-direction: column;
          flex-grow: 1;
          justify-content: center;
        }
        .empty img {
          margin-top: -3rem;
        }
        a {
          text-decoration: none;
        }
        .search-container :global(.search) {
          width: 528px;
        }
      `}</style>
    </div>
  )
}

export default JobScheduleHistory;
