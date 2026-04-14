import React, { useState, useEffect, useContext, useRef, useMemo } from 'react';
import Router from 'next/router';
import { colors, fontSizes, layout, fontFamily, tickSvg } from '../../theme';
import Fetch from '../../utils/Fetch';
import Helper from '../../utils/helper';
import * as Enums from '../../utils/enums';
import ToastContext from '../../utils/toast-context';
import Button from '../button';
import KendoPager from '../../components/kendo/kendo-pager';
import Search from '../../components/search';
import CellDate from '../../components/cells/date';
import CellBold from '../../components/cells/bold';
import ManageJobType from '../../components/modals/jobcard/manage-job-type';

import KendoTable from '../../components/kendo/kendo-table';
import KendoCellDate from '../../components/kendo/cells/kendo-cell-date';

function JobTypes({isWorkflow, accessStatus}) {

  const toast = useContext(ToastContext);
  const [jobTypes, setJobTypes] = useState([]);

  const [columnState, setColumnState] = useState([]);

  const setColumns = () => {
    let columns = [{
      Label: 'Name',
      ColumnName: 'Name',
      CellType: 'none',
    }, {
      Label: 'Updated By',
      ColumnName: 'ModifiedBy',
      CellType: 'none',
    }, {
      Label: 'Updated Date',
      ColumnName: 'ModifiedDate',
      CellType: 'date',
    }];
    if (isWorkflow) {
      columns.splice(1, 0, {
        Label: 'Workflow',
        ColumnName: 'WorkflowName',
        CellType: 'none',
      });
    }
    setColumnState(columns);
  };

  useEffect(() => {
    setColumns();    
  }, []);

  const columns = React.useMemo(
    () => columnState.map(function (column) {
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
          case 'date':
            columnObject['Cell'] = ({ cell: { value } }) => <CellDate value={value} />;
            columnObject['KendoCell'] = (props) => <KendoCellDate {...props} />;
            break;          
          default:
            columnObject['Cell'] = ({ cell: { value } }) => <CellBold value={value} />;
        }
      }

      return columnObject;
    }),
    [columnState]
  );

  const [searching, setSearching] = useState(false);
  const [sortField, setSortField] = useState('');
  const [sortDirection, setSortDirection] = useState('');
  const [searchVal, setSearchVal] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const pageSizeChanged = (size) => {
    setPageSize(size);
  };

  const pageChanged = (page) => {
    setCurrentPage(page);
  };

  let ancillaryFilterList = useRef({
    ShowDisabled: [{
      type: Enums.ControlType.Switch,
      label: 'Show disabled items',
    }],
  });

  const [ancillaryFilters, setAncillaryFilters] = useState({ShowDisabled: false});

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

  useEffect(() => {
    if (currentPage == 1) {
      searchJobTypes();
    } else {
      setCurrentPage(1);
    }
  }, [sortField, sortDirection, pageSize, ancillaryFilters]);

  useEffect(() => {
    searchJobTypes();
  }, [currentPage]);

  const setSort = (field) => {
    setSortDirection(Helper.getSortDirection(field, sortField, sortDirection));
    setSortField(field);
  };

  const searchJobTypes = async () => {
    setSearching(true);

    const data = await Fetch.post({
      url: `/JobType/GetJobTypes`,
      params: {
        pageSize: pageSize,
        pageIndex: (currentPage - 1),
        searchPhrase: searchVal,
        SortExpression: sortField,
        SortDirection: sortDirection,        
        ShowClosed: ancillaryFilters['ShowDisabled'],
      }
    });
    setJobTypes(data.Results);
    setTotalResults(data.TotalResults);

    setSearching(false);
  };

  const [showManageJobType, setShowManageJobType] = useState(false);
  const [isNewJobType, setIsNewJobType] = useState(true);
  const [jobTypeToManage, setJobTypeToManage] = useState();

  const onJobTypeSave = (item) => {
    if (item) {
      toast.setToast({
        message: `Job type saved successfully`,
        show: true,
        type: 'success'
      });
      searchJobTypes();
    }

    setShowManageJobType(false);
  };

  const rowClick = (row) => {
    setIsNewJobType(false);
    getJobType(row.original.ID);
  };

  const editActionClick = (row) => {
    setIsNewJobType(false);
    getJobType(row.ID);
  };

  const create = () => {
    setIsNewJobType(true);
    setJobTypeToManage(undefined);
    setShowManageJobType(true);
  };

  const [jobTypeReadyToEdit, setJobTypeReadyToEdit] = useState(false);

  const getJobType = async (id) => {
    const jobType = await Fetch.get({
      url: `/JobType/${id}`
    });
    setJobTypeToManage(jobType);
    setJobTypeReadyToEdit(true);
  };

  useEffect(() => {
    if (jobTypeReadyToEdit) {
      setShowManageJobType(true);
      setJobTypeReadyToEdit(false);
    }
  }, [jobTypeReadyToEdit]);

  return (
    <div className="settings-list-container">
      <div className="row end">
        <div className="search-container">
          <Search
            placeholder="Search"
            resultsNum={jobTypes ? jobTypes.length : 0} 
            searchVal={searchVal}
            setSearchVal={setSearchVal} 
            searchFunc={searchJobTypes}
            ancillaryFilters={ancillaryFilterList.current}
            setAncillaryFilters={handleAncillaryFilterChange}
          />
        </div>
        <div onClick={create}>
          <Button disabled={accessStatus === Enums.AccessStatus.LockedWithAccess || accessStatus === Enums.AccessStatus.LockedWithOutAccess}
            text='Create' icon="plus-circle" extraClasses="fit-content no-margin" />
        </div>
      </div>

      <div className={"no-items" + (jobTypes && jobTypes.length == 0 ? " no-items-visible" : "")}>
        <div className={"loading-overlay" + (searching ? " loading-overlay-visible" : "")}>
          <div className="loader"></div>
        </div>
        <img src="/job-folder.svg" alt="Folder" />
        <h3>No job types found</h3>
        <p>If you can't find a job type, try another search or create a new one.</p>
        <div onClick={create}><img src="/icons/plus-circle-blue.svg" alt="plus"/> Add new job type</div>
        <img className="wave" src="/wave.svg" alt="wave" />
      </div>

      <div className="margin-top">
        {jobTypes.length != 0 ? <KendoTable
            searching={searching}
            actions={[
              {text: "Edit", icon: "edit", function: (row) => editActionClick(row)},
            ]}
            columns={columns}
            data={jobTypes}
            rowClick={rowClick}
            setSort={setSort}
            sortField={sortField}
            sortDirection={sortDirection}
            type="JobType"
            heightOffset={425}
            highlightColumnName="Name"
        /> : ""}
      </div>
    
      <KendoPager pageSizeChanged={pageSizeChanged} pageChanged={pageChanged} totalResults={totalResults} searchValue={searchVal} parentPageNumber={currentPage} />

      { showManageJobType ? 
        <ManageJobType isNew={isNewJobType} jobType={jobTypeToManage} onJobTypeSave={onJobTypeSave} 
          isWorkflow={isWorkflow} accessStatus={accessStatus} /> : ''
      }

      <style jsx>{`      
        .column {
          width: 100%;
        }
        .column-margin {
          margin-left: 24px;
        }
        .button-container {
          flex-shrink: 0;
          width: 15rem;
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
        .row.top-gap {
          margin-top: 2.5rem;
        }
        .search-container :global(.search) {
          width: 528px;
        }
        a {
          text-decoration: none;
        }
        .margin-top {
          margin-top: 0.5rem;
        }
      `}</style>
    </div>
  );
}

export default JobTypes;
