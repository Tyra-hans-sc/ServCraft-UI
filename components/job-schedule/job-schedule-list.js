import React, { useState, useEffect, useContext, useRef, useMemo } from 'react';
import Search from '../../components/search';
import KendoPager from '../../components/kendo/kendo-pager';
import Router from 'next/router';
import Helper from '../../utils/helper';
import * as Enums from '../../utils/enums';
import DownloadDropdown from '../../components/download-dropdown';
import PS from '../../services/permission/permission-service';
import KendoTable from '../../components/kendo/kendo-table';
import NoSSR from '../../utils/no-ssr';
import RecurringJobService from '../../services/job/recurring-job-service';

function JobScheduleList(props) {

  const [isInitialTab, setIsInitialTab] = useState(props.isInitialTab);

  const [addRecurringJobPermission] = useState(PS.hasPermission(Enums.PermissionName.RecurringJob));
  const [exportPermission] = useState(PS.hasPermission(Enums.PermissionName.Exports));

  const [data, setData] = useState(props.jobSchedules ? props.jobSchedules : []);

  const [searching, setSearching] = useState(false);
  const [sortField, setSortField] = useState('');
  const [sortDirection, setSortDirection] = useState('');
  const [searchVal, setSearchVal] = useState('');
  const [totalResults, setTotalResults] = useState(props.totalResults ? props.totalResults : 0);
  const [currentPage, setCurrentPage] = useState(1);
  const [ancillaryFilters, setAncillaryFilters] = useState({ IncludeDisabled: false });

  const handleAncillaryFilterChange = (result) => {
    if (result.reset) {
      setAncillaryFilters({ IncludeDisabled: false });
    } else {
      if (result.key == "IncludeDisabled") {
        setAncillaryFilters({ IncludeDisabled: result.checked });
      }
    }
  };

  const [triggerClientFiltering, setTriggerClientFiltering] = useState(false);

  const getColumns = async () => {
    if (isInitialTab) {
      setColumnState(props.columns);
    } else {
      setColumnState(await RecurringJobService.getRecurringJobListColumns());
      setTriggerClientFiltering(true);
    }
  };

  useEffect(() => {
    if (triggerClientFiltering) {
      searchJobSchedules();
    }
  }, [triggerClientFiltering]);

  useEffect(() => {
    getColumns();
  }, []);

  const [columnState, setColumnState] = useState([]);

  const [accessStatus, setAccessStatus] = useState(props.accessStatus);

  const [pageSize, setPageSize] = useState(10);

  const pageSizeChanged = (size) => {
    setPageSize(size);
  };

  const pageChanged = (page) => {
    setCurrentPage(page);
  };

  const columns = React.useMemo(
    () => columnState.map(function (column) {
      return Helper.getColumnObject(column);
    }),
    [columnState]
  );

  const firstUpdate = useRef(true);

  useEffect(() => {
    if (firstUpdate.current) {
      setTimeout(() => {
        firstUpdate.current = false;
      }, 500);
      return;
    }

    if (currentPage == 1) {
      searchJobSchedules();
    } else {
      setCurrentPage(1);
    }
  }, [searchVal, sortField, sortDirection, pageSize, ancillaryFilters]);

  const firstUpdatePage = useRef(true);

  useEffect(() => {
    if (firstUpdatePage.current) {
      firstUpdatePage.current = false;
      return;
    }
    searchJobSchedules();
  }, [currentPage]);

  function rowClick(row) {
    Helper.nextRouter(Router.push, '/job-schedule/[id]', '/job-schedule/' + row.original.ID);
  }

  function setSort(field) {
    setSortDirection(Helper.getSortDirection(field, sortField, sortDirection));
    setSortField(field);
  }

  async function searchJobSchedules() {

    setSearching(true);

    const searchRes = await RecurringJobService.getRecurringJobList(searchVal, pageSize, currentPage, ancillaryFilters, sortField, sortDirection);

    setData(searchRes.Results);
    setTotalResults(searchRes.TotalResults);
    setSearching(false);
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
  }

  const ancillaryFilterOptions = useMemo(() => {
    return RecurringJobService.getAncillaryFilterOptions();
  }, []);

  return (
    <div className="container">
      <div className="row end padded">
        <div className="search-container">
          <Search
            placeholder="Search customer, contact or location"
            resultsNum={data && data.length}
            searchVal={searchVal}
            ancillaryFilters={ancillaryFilterOptions}
            setAncillaryFilters={handleAncillaryFilterChange}
            setSearchVal={setSearchVal}
          />
        </div>
        <div className="row flexEnd">
          {accessStatus !== Enums.AccessStatus.LockedWithAccess && accessStatus !== Enums.AccessStatus.LockedWithOutAccess && exportPermission ? <>
            <div className="download">
              <DownloadDropdown title={'Export'} options={[
                { url: '/JobSchedule/GetExportedJobs', method: 'POST', params: { ExportAll: true }, label: 'Export' },
              ]} />
            </div>
          </> : ''}
        </div>
      </div>

      <div className={"no-items" + (data && data.length == 0 ? " no-items-visible" : "")}>
        <div className={"loading-overlay" + (searching ? " loading-overlay-visible" : "")}>
          <div className="loader"></div>
        </div>
        <img src="/job-folder.svg" alt="Job Folder" />
        <h3>No recurring jobs found</h3>
        <p>If you can't find a job, try another search or create a new one.</p>
        <a href="/job-schedule/create"><img src="/icons/plus-circle-blue.svg" alt="plus" /> Add new recurring job</a>
        <img className="wave" src="/wave.svg" alt="wave" />
      </div>

      {data && data.length != 0 ? <KendoTable
        searching={searching}
        actions={[
          { text: "Edit", icon: "edit", function: (row) => Helper.nextRouter(Router.push, `/job-schedule/${row.ID}`) },
        ]}
        columns={columns}
        data={data}
        rowClick={rowClick}
        setSort={setSort}
        sortField={sortField}
        sortDirection={sortDirection}
        heightOffset={345}
        highlightColumnName="CustomerName"
        onColumnResize={onColumnResize}
      /> : ""}

      <KendoPager pageSizeChanged={pageSizeChanged} pageChanged={pageChanged} totalResults={totalResults} searchValue={searchVal} parentPageNumber={currentPage} />

      <style jsx>{`
        .row {
          display: flex;
          justify-content: space-between;
        }
        .search-container :global(.search) {
          width: 528px;
        }
        a {
          text-decoration: none;
        }
        .padded {
          padding-bottom: 1rem;
        }
        .flexEnd {
          align-items: flex-end;
        }
        .download {
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}

export default JobScheduleList;
