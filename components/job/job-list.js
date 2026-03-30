import React, { useState, useEffect, useContext, useRef, useMemo } from 'react';
import Button from '../../components/button';
import Search from '../../components/search';
import { colors } from '../../theme';
import CellStatus from '../../components/cells/status';
import CellDate from '../../components/cells/date';
import CellBold from '../../components/cells/bold';
import CellEmployee from '../../components/cells/employee';
import CellCheckbox from '../../components/cells/checkbox';
import CellBool from '../../components/cells/bool';
import CellWide from '../../components/cells/wide';
import CellDescription from '../../components/cells/description';
import ColumnSelect from '../../components/column-select';
import KendoPager from '../../components/kendo/kendo-pager';
import DownloadDropdown from '../../components/download-dropdown';
import Router from 'next/router';
import Fetch from '../../utils/Fetch';
import ToastContext from '../../utils/toast-context';
import * as Enums from '../../utils/enums';
import Storage from '../../utils/storage';
import Helper from '../../utils/helper';
import UCS from '../../services/option/user-config-service';
import PS from '../../services/permission/permission-service';
import KendoTable from '../../components/kendo/kendo-table';
import KendoCellStatus from '../../components/kendo/cells/kendo-cell-status';
import KendoCellEmployee from '../../components/kendo/cells/kendo-cell-employee';
import KendoCellDate from '../../components/kendo/cells/kendo-cell-date';
import KendoCellBool from '../kendo/cells/kendo-cell-bool';
import NoSSR from '../../utils/no-ssr';
import EmployeeService from '../../services/employee/employee-service';
import StoreService from '../../services/store/store-service';
import OptionService from '../../services/option/option-service';
import InventoryService from '../../services/inventory/inventory-service';
import JobTypeService from '../../services/job/job-type-service';
import JobService from '../../services/job/job-service';
import JobStatusService from '../../services/job/job-status-service';

function JobList(props) {

  const [hasEmployee] = useState(Storage.hasCookieValue(Enums.Cookie.employeeID));
  const [hasSupplier] = useState(Storage.hasCookieValue(Enums.Cookie.supplierID));

  const toast = useContext(ToastContext);

  const [isInitialTab, setIsInitialTab] = useState(props.isInitialTab);

  const getColumns = async () => {
    if (isInitialTab) {
      setColumnState(props.columns);
      setAvailableColumns(props.columns.map(column => column.Label));
      setRequiredColumns(props.columns.filter(column => column.IsRequired).map(column => column.Label));
      setSelectedColumns(props.columns.filter(column => column.Show).map(column => column.Label));
    } else {
      const columns = await EmployeeService.getColumnMappings(Enums.ColumnMapping.Job);
      let columnResults = columns.Results;

      let isMultiStore = await StoreService.isMultiStore();
      if (!isMultiStore) {
        columnResults = columnResults.filter(x => x.ColumnName !== 'StoreName');
      }

      setColumnState(columnResults);
      setAvailableColumns(columnResults.map(column => column.Label));
      setRequiredColumns(columnResults.filter(column => column.IsRequired).map(column => column.Label));
      setSelectedColumns(columnResults.filter(column => column.Show).map(column => column.Label));
    }
  };

  const [triggerClientFiltering, setTriggerClientFiltering] = useState(false);

  const getFiltersConfig = async () => {
    if (isInitialTab) {
      setFiltersConfig(props.filtersConfig);
      setActiveFilterIds(props.activeFilterIdsDefault);
      setAncillaryFilters(props.ancillaryFiltersDefault);
      setSortField(props.sortExpressionDefault);
      setSortDirection(props.sortDirectionDefault);
      setFilters(props.filters);

      if (props.initialStatusFilterIds && props.initialStatusFilterIds.length > 0) {

        let filtersConfigTemp = { ...props.filtersConfig };
        UCS.updateFilters(filtersConfigTemp, props.activeFilterIdsDefault, props.ancillaryFiltersDefault);
        UCS.saveConfigDebounced(filtersConfigTemp);
        setFiltersConfig(filtersConfigTemp);
      }
    } else {
      const filtersConfig = await UCS.getPageFilters(Enums.ConfigurationSection.Job);
      setFiltersConfig(filtersConfig);

      let [activeFilterIdsDefault, ancillaryFiltersDefault, sortExpressionDefault, sortDirectionDefault] = UCS.getFilterValues(filtersConfig,
        ["JobStatus", "Services", "JobTypes", "Employees", "Stores", 'DateRange'], [],
        ["IncludeClosed", "ShowArchived"], false, false);

      setActiveFilterIds(activeFilterIdsDefault);
      setAncillaryFilters(ancillaryFiltersDefault);
      setSortField(sortExpressionDefault);
      setSortDirection(sortDirectionDefault);

      const filterEmployees = hasEmployee ? await EmployeeService.getEmployees(null, null, true) : null;

      let filters = {};
    
      const filterJobTypesRequest = await JobTypeService.getJobTypes();
      const filterJobTypesRequestDisabled = await JobTypeService.getFilteredJobTypes(1000, true);

      let jobTypes = filterJobTypesRequest.Results;
      jobTypes.push(...filterJobTypesRequestDisabled.Results);
      jobTypes = jobTypes.sort((a, b) => {
        return a.Name.trim() > b.Name.trim() ? 1 : -1;
      });

      filters = {
        ...filters,
        JobTypes: jobTypes,
      };

      const filterStatusRequest = await JobStatusService.getJobStatuses(false);

      filters = {
        ...filters,
        JobStatus: filterStatusRequest.Results
      };

      if (hasEmployee) {
        filters = {
          ...filters,
          Employees: filterEmployees.Results
        };
      }

      const stores = await StoreService.getStores(null, true);
      if (stores.TotalResults > 1) {
        filters = {
          ...filters,
          Stores: stores.Results
        };
      }

      filters = {
        ...filters,
        DateRange: activeFilterIdsDefault['DateRange']
      };

      setFilters(filters);
      setTriggerClientFiltering(true);
    }
  };

  useEffect(() => {
    if (triggerClientFiltering) {
      searchJobs();
    }
  }, [triggerClientFiltering]);

  const getAncillaryFilterOptions = () => {
    const includeClosedJobsFilter = [{
      type: Enums.ControlType.Switch,
      label: 'Include closed jobs',
    }];

    const showArchivedJobsFilter = [{
      type: Enums.ControlType.Switch,
      label: 'Include archived jobs',
    }];

    return {
      IncludeClosed: includeClosedJobsFilter,
      ShowArchived: showArchivedJobsFilter,
    };
  };

  const [columnState, setColumnState] = useState([]);

  const [availableColumns, setAvailableColumns] = useState();
  const [requiredColumns, setRequiredColumns] = useState();
  const [selectedColumns, setSelectedColumns] = useState();
  const [selectedJobs, setSelectedJobs] = useState([]);

  const [exportOptions, setExportOptions] = useState([]);
  const [exportPermission] = useState(PS.hasPermission(Enums.PermissionName.Exports));
  const [archiveJobPermission] = useState(PS.hasPermission(Enums.PermissionName.ArchiveJob));
  const [closeJobPermission] = useState(PS.hasPermission(Enums.PermissionName.CloseJob));

  const [filtersConfig, setFiltersConfig] = useState({});

  const [accessStatus, setAccessStatus] = useState(props.accessStatus);

  const [pageSize, setPageSize] = useState(10);

  const pageSizeChanged = (size) => {
    setPageSize(size);
  };

  const pageChanged = (page) => {
    setCurrentPage(page);
  };

  const setExportOptionsList = () => {
    let exportOpts = [];
    exportOpts.push({ url: '/Job/GetExportedJobs', method: 'POST', params: { ...params, ExportAll: false }, label: 'Filtered export' });
    if (hasEmployee) {
      exportOpts.push({ url: '/Job/GetExportedJobs', method: 'POST', params: { ...params, ExportAll: true }, label: 'Full export' });
    }
    setExportOptions(exportOpts);
  };

  useEffect(() => {
    setExportOptionsList();
    getColumns();
    getFiltersConfig();
  }, []);

  const checkboxColumnHeader = 'Number';
  const checkboxColumn = 'JobCardNumber';

  const columns = React.useMemo(
    () => columnState.filter(column => column.Show == true).map(function (column) {
      let columnObject = {
        Header: column.Label,
        accessor: column.ColumnName,
        // for table resize columns
        ColumnName: column.ColumnName,
        UserWidth: column.UserWidth
        // for table resize columns
      };

      if (column.CellType != "none") {
        switch (column.CellType) {
          case 'select':
          case 'check':
            columnObject['accessor'] = (row) => { return { JobCardNumber: row.JobCardNumber, ID: row.ID, Name: column.ColumnName } };
            columnObject['Cell'] = ({ cell: { value } }) => <CellCheckbox value={value.JobCardNumber} itemId={value.ID} key={value} selectedItems={selectedJobs} setSelectedItems={setSelectedJobs} />;
            break;
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
            columnObject['KendoCell'] = (props) => <KendoCellStatus {...props} />;
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
    [columnState, selectedJobs]
  );

  async function setColumn(selected) {
    let newColumns = [...selectedColumns];
    if (newColumns.includes(selected)) {
      newColumns = newColumns.filter((value) => { return value !== selected })
    } else {
      newColumns.push(selected);
    }
    setSelectedColumns(newColumns);

    const newState = columnState.map(function (column) {
      if (column.Label == selected) {
        column.Show = !column.Show;
      }
      return column;
    });
    setColumnState(newState);
    columnMappingPut(newState);
  }

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

  async function setReorder(updatedOptions) {

    const newState = updatedOptions.map((item, index) => {
      let column = columnState.find(x => x.Label == item);
      column.Order = index;
      return column;
    });

    setAvailableColumns(updatedOptions);
    setColumnState(newState);

    columnMappingPut(newState);
  }

  async function columnMappingPut(newState) {
    await EmployeeService.saveColumnMappings(newState, 'JobList', toast);
  }

  const [jobResults, setJobResults] = useState(props.jobs ? props.jobs : []);
  const [searching, setSearching] = useState(false);
  const [sortField, setSortField] = useState();
  const [sortDirection, setSortDirection] = useState();
  const [searchVal, setSearchVal] = useState('');
  const [activeFilterIds, setActiveFilterIds] = useState();
  const [filters, setFilters] = useState([]);
  const [ancillaryFilters, setAncillaryFilters] = useState();

  const [totalResults, setTotalResults] = useState(props.totalResults ? props.totalResults : 0);
  const [currentPage, setCurrentPage] = useState(1);
  const oldCurrentPage = useRef(1);

  const handleAncillaryFilterChange = (result) => {
    if (result.reset) {
      let oldFilters = { ...ancillaryFilters };
      Object.keys(oldFilters).filter(key => !result.ignore.includes(key)).forEach(key => oldFilters[key] = false);
      setAncillaryFilters(oldFilters);
    } else {
      setAncillaryFilters({
        ...ancillaryFilters,
        [result.key]: result.checked
      });
    }
  };

  const firstUpdate = useRef(true);
  const firstPageSizeUpdate = useRef(props.initialStatusFilterIds && props.initialStatusFilterIds.length > 0 ? true : false);

  useEffect(() => {
    if (firstUpdate.current) {

      // blocking multiple events on initialization with a debounce, not 100% sure why mouse@servcraft.co.za triggers this more than once
      setTimeout(() => {
        firstUpdate.current = false;
      }, 500);

      return;
    }

    if (firstPageSizeUpdate.current) {
      firstPageSizeUpdate.current = false;
      return;
    }

    if (currentPage == 1) {
      searchJobs();
    } else {
      setCurrentPage(1);
    }
  }, [sortField, sortDirection, activeFilterIds, ancillaryFilters, pageSize]);

  const firstUpdatePage = useRef(true);

  useEffect(() => {
    let ocp = oldCurrentPage.current;
    oldCurrentPage.current = currentPage;

    if (ocp === oldCurrentPage.current || firstUpdatePage.current) {
      firstUpdatePage.current = false;
    } else {
      searchJobs();
    }
  }, [currentPage]);

  function setSort(field) {
    setSortDirection(Helper.getSortDirection(field, sortField, sortDirection));
    setSortField(field);
  }

  async function searchJobs() {

    setSearching(true);

    const searchRes = await JobService.getJobList(searchVal, pageSize, currentPage, activeFilterIds, ancillaryFilters,
      sortField, sortDirection, 'pages/job/list.js:searchJobs()', toast);

    let filtersConfigTemp = { ...filtersConfig };
    UCS.updateFilters(filtersConfigTemp, activeFilterIds, ancillaryFilters, sortField, sortDirection, true);
    UCS.saveConfigDebounced(filtersConfigTemp);
    setFiltersConfig(filtersConfigTemp);

    setJobResults(searchRes.Results);
    setTotalResults(searchRes.TotalResults);
    setSelectedJobs([]);
    setSearching(false);
  }

  function rowClick(row) {
    Helper.nextRouter(Router.push, '/job/[id]', '/job/' + row.original.ID);
  }

  //ARCHIVE INDIVIDUAL JOB
  const [archiving, setArchiving] = useState(false);
  async function archiveJob(job) {
    setArchiving(true);

    const jobArchive = await Fetch.get({
      url: '/Job/Archive?id=' + job.ID,
      toastCtx: toast
    });

    if (jobArchive.ID) {
      toast.setToast({
        action: 'Undo',
        actionFunc: async function () {
          const jobArchiveInner = await Fetch.get({
            url: '/Job/Archive?id=' + job.ID,
          });
          searchJobs();
        },
        message: 'Job archived successfully',
        show: true,
        type: 'success'
      });
      searchJobs();
    }
    setArchiving(false);
  }

  //CLOSE INDIVIDUAL JOB
  const [closing, setClosing] = useState(false);
  async function closeJob(job) {
    setClosing(true);

    const jobClose = await Fetch.get({
      url: '/Job/Close?id=' + job.ID,
      toastCtx: toast
    });

    if (jobClose.ID) {
      toast.setToast({
        action: 'Undo',
        actionFunc: async function () {
          const jobCloseInner = await Fetch.get({
            url: '/Job/Open?id=' + job.ID,
          });
          searchJobs();
        },
        message: 'Job closed successfully',
        show: true,
        type: 'success'
      })
      searchJobs();
    }
    setClosing(false);
  }

  //SELECT ALL JOBS (ON PAGE)
  function selectAll() {
    if (jobResults.length == selectedJobs.length) {
      setSelectedJobs([]);
    } else {
      setSelectedJobs(jobResults.map(result => result.ID));
    }
  }

  //ARCHIVE SELECTED JOBS
  const [archivingSelected, setArchivingSelected] = useState(false);
  async function archiveSelected() {
    setArchivingSelected(true);

    const jobsArchive = await Fetch.post({
      url: '/Job/ArchiveToggle',
      params: selectedJobs,
      toastCtx: toast
    });

    if (jobsArchive) {
      toast.setToast({
        action: 'Undo',
        actionFunc: async function () {
          const jobsArchiveInner = await Fetch.post({
            url: '/Job/ArchiveToggle',
            params: selectedJobs
          });
          searchJobs();
        },
        message: 'Jobs archived successfully',
        show: true,
        type: 'success'
      })
      searchJobs();
    }

    setArchivingSelected(false);
  }

  //CLOSE SELECTED JOBS
  const [closingSelected, setClosingSelected] = useState(false);
  async function closeSelected() {
    setClosingSelected(true);

    const jobsClose = await Fetch.post({
      url: '/Job/OpenToggle',
      params: selectedJobs,
      toastCtx: toast
    });

    if (jobsClose) {
      toast.setToast({
        action: 'Undo',
        actionFunc: async function () {
          const jobsOpen = await Fetch.post({
            url: '/Job/OpenToggle',
            params: selectedJobs
          });
          searchJobs();
        },
        message: 'Jobs closed successfully',
        show: true,
        type: 'success'
      })
      searchJobs();
    }

    setClosingSelected(false);
  }

  const [params, setParams] = useState({});

  useEffect(() => {
    setParams({
      searchPhrase: searchVal,
      JobStatusIDList: activeFilterIds ? activeFilterIds["JobStatus"] : null,
      InventoryIDList: activeFilterIds ? activeFilterIds["Services"] : null,
      JobTypeIDList: activeFilterIds ? activeFilterIds["JobTypes"] : null,
      EmployeeIDList: activeFilterIds ? activeFilterIds["Employees"] : null,
      StoreIDList: activeFilterIds ? activeFilterIds["Stores"] : null,
      IncludeClosed: ancillaryFilters ? ancillaryFilters["IncludeClosed"] : null,
      ShowArchived: ancillaryFilters ? ancillaryFilters["ShowArchived"] : null,
      SortExpression: sortField === checkboxColumnHeader ? checkboxColumn : sortField,
      SortDirection: sortDirection,
      StartDate: activeFilterIds?.DateRange && activeFilterIds.DateRange[0],
      EndDate: activeFilterIds?.DateRange && activeFilterIds.DateRange[1]
    });
  }, [searchVal, activeFilterIds, ancillaryFilters, sortField, sortDirection]);

  useEffect(() => {
    setExportOptionsList();
  }, [params]);

  const getTableActions = () => {
    let acts = [
      { text: "Preview", icon: "eye", function: undefined }
    ];

    if (accessStatus !== Enums.AccessStatus.LockedWithAccess && accessStatus !== Enums.AccessStatus.LockedWithOutAccess && hasEmployee) {
      if (archiveJobPermission)
        acts.push({ text: (archiving ? "Archiving" : "Archive"), icon: "archive-blue", function: archiveJob });
      if (closeJobPermission)
        acts.push({ text: (closing ? "Closing" : "Close Job"), icon: "check-square-blue", function: closeJob });
    }

    return acts;
  };

  const ancillaryFilterOptions = useMemo(() => {
    return getAncillaryFilterOptions();
  }, []);

  return (
    <div className="container">
      <div className="row end padded">
        <NoSSR>
          <div className="search-container">
            {triggerClientFiltering || isInitialTab ?
              <Search
                filters={filters}
                ancillaryFilters={ancillaryFilterOptions}
                setAncillaryFilters={handleAncillaryFilterChange}
                initialStatusFilterIds={props.initialStatusFilterIds}
                placeholder="Search Job number or Customer"
                resultsNum={jobResults.length}
                searchVal={searchVal}
                setActiveFilterIds={setActiveFilterIds}
                setSearchVal={setSearchVal}
                filtersConfig={filtersConfig}
              /> : ''
            }
          </div>
          <div className="row end">

            {accessStatus !== Enums.AccessStatus.LockedWithAccess && accessStatus !== Enums.AccessStatus.LockedWithOutAccess &&
              selectedJobs.length > 0
              ? <div className="select-actions">
                {archiveJobPermission ? <Button text={archivingSelected ? "Archiving" : "Archive Selected"} icon="archive-blue" extraClasses="white-action" onClick={archivingSelected ? null : archiveSelected} /> : ""}
                {closeJobPermission ? <Button text={closing ? "Closing" : "Close Selected"} icon="check-square-blue" extraClasses="white-action" onClick={closing ? null : closeSelected} /> : ""}
              </div>
              : ""
            }

            {accessStatus !== Enums.AccessStatus.LockedWithAccess && accessStatus !== Enums.AccessStatus.LockedWithOutAccess && exportPermission ? <>
              <div className="download">
                <DownloadDropdown title={'Export'} options={exportOptions} />
              </div>
            </> : ''}
            <ColumnSelect options={availableColumns} selected={selectedColumns} requiredColumns={requiredColumns}
              setColumn={setColumn} setReorder={setReorder} resetColumnWidths={resetColumnWidths} />
          </div>
        </NoSSR>
      </div>

      <div className={"no-items" + (jobResults.length == 0 ? " no-items-visible" : "")}>
        <div className={"loading-overlay" + (searching ? " loading-overlay-visible" : "")}>
          <div className="loader"></div>
        </div>
        <img src="/job-folder.svg" alt="Job Folder" />
        <h3>No jobs found</h3>
        {hasEmployee ? <p>If you can't find a job, try another search or create a new one.</p> :
          hasSupplier ? <p>If you can't find a job, try another search.</p> : ""}
        {hasEmployee ? <a href="/job/create"><img src="/icons/plus-circle-blue.svg" alt="plus" /> Add new job</a> : ""}

        <img className="wave" src="/wave.svg" alt="wave" />
      </div>

      <div className={"table-container" + (jobResults.length != 0 ? " table-container-visible" : "")}>
        <div className={"loading-overlay" + (searching ? " loading-overlay-visible" : "")}>
          <div className="loader"></div>
        </div>
      </div>

      {jobResults.length != 0 ? <KendoTable
        searching={searching}
        actions={getTableActions()}
        columns={columns}
        data={jobResults}
        rowClick={rowClick}
        setSort={setSort}
        sortField={sortField}
        sortDirection={sortDirection}
        type="Job"
        onColumnResize={onColumnResize}
        canSelectItems={true}
        selectedItems={selectedJobs}
        setSelectedItems={setSelectedJobs}
        heightOffset={360}
        highlightColumnName="JobCardNumber"
        highlightColumnLink="/job/"
      /> : ""}

      <KendoPager pageSizeChanged={pageSizeChanged} pageChanged={pageChanged} totalResults={totalResults} searchValue={searchVal} parentPageNumber={currentPage} />

      <style jsx>{`
          .column {
            width: 100%;
          }
          .column-margin {
            margin-left: 24px;
          }
          .button-container {
            flex-shrink: 0;
            width: 9rem;
          }
          .button-container :global(.button){
            margin-top: 0.5rem;
          }
          .row {
            display: flex;
            justify-content: space-between;
          }
          .end {
            align-items: flex-end;
          }
          .padded {
            padding-bottom: 1rem;
          }
          .row.top-gap {
            margin-top: 2.5rem;
          }
          .heading {
            color: ${colors.blueGrey};
            font-size: 14px;
            margin-bottom: 0.5rem;
          }
          .heading-blue {
            color: ${colors.bluePrimary};
          }
          .search-container :global(.search) {
            width: 528px;
          }
          a {
            text-decoration: none;
          }
          .select-actions {
            display: flex;
            margin-right: 0.5rem;
          }
          .select-actions :global(.white-action) {
            font-size: 0.875rem;
            margin: 0 0 0 0.5rem; 
            width: auto;
          }
          .select-actions :global(.icon) {
            left: 1rem !important;
          }
          .download {
            margin-right: 0.5rem;
            cursor: pointer;
          }
        `}</style>
    </div>
  );
}

export default JobList;
