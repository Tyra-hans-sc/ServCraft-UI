import React, { useMemo, useContext, useEffect, useState, useRef } from 'react';
import { colors, fontSizes, layout, fontFamily } from '../../theme';
import KendoTable from '../kendo/kendo-table';
import Search from '../search';
import KendoPager from '../../components/kendo/kendo-pager';
import Button from '../button';
import Router from 'next/router';
import DownloadDropdown from '../../components/download-dropdown';

import CellStatus from '../cells/status';
import CellDate from '../cells/date';
import CellBold from '../cells/bold';
import CellWide from '../cells/wide';
import CellBool from '../cells/bool';
import CellEmployee from '../../components/cells/employee';
import CellDescription from '../../components/cells/description';

import KendoCellBool from '../../components/kendo/cells/kendo-cell-bool';
import KendoCellStatus from '../../components/kendo/cells/kendo-cell-status';
import KendoCellDate from '../../components/kendo/cells/kendo-cell-date';
import KendoCellEmployee from '../../components/kendo/cells/kendo-cell-employee';

import Fetch from '../../utils/Fetch';
import * as Enums from '../../utils/enums';
import ToastContext from '../../utils/toast-context';
import Helper from '../../utils/helper';

import JobService from '../../services/job/job-service';
import PS from '../../services/permission/permission-service';

function Jobs({ module, moduleID, customerID, accessStatus }) {

  const [columnState, setColumnState] = useState([]);

  useEffect(() => {
    let columns = [{
      Header: 'Number',
      accessor: 'JobCardNumber',
      ColumnName: 'JobCardNumber',
      CellType: 'string',
    },
    {
      Header: 'Open',
      accessor: 'IsClosed',
      ColumnName: 'IsClosed',
      CellType: 'icon',
    }];

    switch (module) {
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
        Header: 'Description',
        accessor: 'Description',
        ColumnName: 'Description'
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
      });

    setColumnState(columns);
  }, [module]);

  const columns = React.useMemo(
    () => columnState.map(function (column) {
      let columnObject = {
        Header: column.Header,
        accessor: column.ColumnName,
        ColumnName: column.ColumnName,
        UserWidth: column.UserWidth
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
            columnObject['KendoCell'] = (props) => <KendoCellBool {...props} invertValue={column.ColumnName == 'IsClosed'} />;
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

  const rowClick = (row) => {
    Helper.nextRouter(Router.push, `/job/[id]`, `/job/${row.original.ID}`);
  };

  const toast = useContext(ToastContext);

  const [jobResults, setJobResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [sortField, setSortField] = useState('');
  const [sortDirection, setSortDirection] = useState('');
  const [searchVal, setSearchVal] = useState('');
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  let ancillaryFilterList = useRef({
    IncludeClosed: [{
      type: Enums.ControlType.Switch,
      label: 'Include closed jobs',
    }],
    ShowArchived: [{
      type: Enums.ControlType.Switch,
      label: 'Include archived jobs',
    }],
  });

  const [ancillaryFilters, setAncillaryFilters] = useState({ IncludeClosed: true, ShowArchived: true });

  const handleAncillaryFilterChange = (result) => {

    if (result.reset === true) {
      setAncillaryFilters({ ...ancillaryFilters, IncludeClosed: false, ShowArchived: false });
    }
    else if (result.key == "IncludeClosed") {
      setAncillaryFilters({ ...ancillaryFilters, IncludeClosed: result.checked });
    }
    else if (result.key == "ShowArchived") {
      setAncillaryFilters({ ...ancillaryFilters, ShowArchived: result.checked });
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
      searchJobs();
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
    searchJobs();
  }, [currentPage]);

  function setSort(field) {
    setSortDirection(Helper.getSortDirection(field, sortField, sortDirection));
    setSortField(field);
  }

  const getJobsForCustomer = async () => {
    return await JobService.getJobsForCustomer(moduleID, searchVal, pageSize, (currentPage - 1), sortField, sortDirection, ancillaryFilters["IncludeClosed"], toast, ancillaryFilters["ShowArchived"]);
  };

  const getJobsForProject = async () => {
    return await JobService.getJobsForProject(moduleID, searchVal, pageSize, (currentPage - 1), sortField, sortDirection, ancillaryFilters["IncludeClosed"], toast, ancillaryFilters["ShowArchived"]);
  };

  const getJobsForAsset = async () => {
    return await JobService.getJobsForAsset(moduleID, searchVal, pageSize, (currentPage - 1), sortField, sortDirection, ancillaryFilters["IncludeClosed"], toast, ancillaryFilters["ShowArchived"]);
  };

  const searchJobs = async () => {

    setSearching(true);

    let searchRes;

    switch (module) {
      case Enums.Module.Customer:
        searchRes = await getJobsForCustomer();
        break;
      case Enums.Module.Project:
        searchRes = await getJobsForProject();
        break;
      case Enums.Module.Asset:
        searchRes = await getJobsForAsset();
        break;
    }

    setJobResults(searchRes.Results);
    setTotalResults(searchRes.TotalResults);

    setSearching(false);
  }

  const createJob = () => {
    Helper.nextRouter(Router.push, `/job/create?module=${module}&moduleID=${moduleID}&customerID=${customerID}`);
  };

  const [exportPermission] = useState(PS.hasPermission(Enums.PermissionName.Exports));
  const [params, setParams] = useState({});

  useEffect(() => {
    setParams({
      searchPhrase: searchVal,
      IncludeClosed: ancillaryFilters ? ancillaryFilters["IncludeClosed"] : null,
      ShowArchived: ancillaryFilters ? ancillaryFilters["ShowArchived"] : null,
      SortExpression: sortField,
      SortDirection: sortDirection,
    });
  }, [searchVal, ancillaryFilters, sortField, sortDirection]);

  return (
    <div className={`tab-list-container ${jobResults.length == 0 ? 'full-height' : ''}`}>
      <div className="row">
        <div className="search-container">
          <Search
            placeholder="Search Job number"
            resultsNum={jobResults.length}
            searchVal={searchVal}
            setSearchVal={setSearchVal}
            searchFunc={searchJobs}
            ancillaryFilters={ancillaryFilterList.current}
            setAncillaryFilters={handleAncillaryFilterChange}
            initialAncillaryFilters={ancillaryFilterList}
            setActiveFilterIds={(_) => {}}
          />
        </div>

        {module == Enums.Module.Customer ?
          <div className="action-buttons">
            {accessStatus !== Enums.AccessStatus.LockedWithAccess && accessStatus !== Enums.AccessStatus.LockedWithOutAccess && exportPermission ? <>
              <div className="download">
                <DownloadDropdown title={'Export'} options={[
                  { url: '/Job/GetExportedJobs', method: 'POST', params: { ...params, CustomerIDList: [moduleID], ExportAll: false }, label: 'Export' }
                ]} />
              </div>
            </> : ''}
          </div> : ''
        }

        <div className="create">
          <Button disabled={accessStatus === Enums.AccessStatus.LockedWithAccess || accessStatus === Enums.AccessStatus.LockedWithOutAccess}
            text="Create" icon="plus-circle" extraClasses="fit-content no-margin" onClick={createJob} />
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

      <div className="margin-top">
        {jobResults.length != 0 ? <KendoTable
          searching={searching}
          actions={[
            { text: "Edit", icon: "edit", function: (row) => Helper.nextRouter(Router.push, '/job/[id]', `/job/${row.ID}`) },
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
        .margin-top {
          margin-top: 0.5rem;
        }
      `}</style>
    </div>
  )
}

export default Jobs;
