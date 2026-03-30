import React, { useState, useEffect, useContext, useRef, useMemo } from 'react';
import Router from 'next/router';
import { colors, fontSizes, layout, fontFamily, tickSvg } from '../../theme';
import Fetch from '../../utils/Fetch';
import Helper from '../../utils/helper';
import * as Enums from '../../utils/enums';
import ToastContext from '../../utils/toast-context';
import Button from '../button';
import Search from '../search';

import CellDate from '../cells/date';
import CellBold from '../cells/bold';
import CellBool from '../cells/bool';
import CellStatus from '../cells/status';

import KendoPager from '../../components/kendo/kendo-pager';
import KendoTable from '../../components/kendo/kendo-table';
import KendoCellStatus from '../../components/kendo/cells/kendo-cell-status';
import KendoCellDate from '../../components/kendo/cells/kendo-cell-date';
import KendoCellBool from '../../components/kendo/cells/kendo-cell-bool';

import ManageWorkflow from '../modals/jobcard/manage-workflow';
import Storage from '../../utils/storage';

function Workflows({ accessStatus }) {

  const toast = useContext(ToastContext);

  const [workflows, setWorkflows] = useState([]);

  const [isWorkflow, setIsWorkflow] = useState(false);

  const [columnState, setColumnState] = useState([{
    Label: 'Name',
    ColumnName: 'Name',
    CellType: 'none',
  }, {
    Label: 'Default',
    ColumnName: 'IsDefault',
    CellType: 'icon',
  },
  {
    Label: 'Flow Type',
    ColumnName: 'FlowType',
    CellType: 'status',
  },
  {
    Label: 'Updated By',
    ColumnName: 'ModifiedBy',
    CellType: 'none',
  }, {
    Label: 'Updated Date',
    ColumnName: 'ModifiedDate',
    CellType: 'date',
  }]);

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
          case 'status':
            columnObject['Cell'] = ({ cell: { value } }) => <CellStatus value={value} valueEnum="FlowType" />;
            columnObject['KendoCell'] = (props) => <KendoCellStatus {...props} valueEnum="FlowType" />
            break;
          case 'bold':
            columnObject['Cell'] = ({ cell: { value } }) => <CellBold value={value} />;
            break;
          case 'icon':
            columnObject['Cell'] = ({ cell: { value } }) => <CellBool value={value} />;
            columnObject['KendoCell'] = (props) => <KendoCellBool {...props} />;
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
      label: 'Show disabled workflows',
    }],
  });

  const [ancillaryFilters, setAncillaryFilters] = useState({ ShowDisabled: false });

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

    let subscriptionInfo = Storage.getCookie(Enums.Cookie.subscriptionInfo);
    if (subscriptionInfo) {
      setIsWorkflow(subscriptionInfo.MultiWorkflow);
    }

  }, []);

  useEffect(() => {
    if (currentPage == 1) {
      searchWorkflows();
    } else {
      setCurrentPage(1);
    }
  }, [sortField, sortDirection, pageSize, ancillaryFilters]);

  useEffect(() => {
    searchWorkflows();
  }, [currentPage]);

  const setSort = (field) => {
    setSortDirection(Helper.getSortDirection(field, sortField, sortDirection));
    setSortField(field);
  };

  const searchWorkflows = async () => {
    setSearching(true);

    const data = await Fetch.post({
      url: `/Workflow/GetWorkflows`,
      params: {
        pageSize: pageSize,
        pageIndex: (currentPage - 1),
        searchPhrase: searchVal,
        SortExpression: sortField,
        SortDirection: sortDirection,
        ShowClosed: ancillaryFilters['ShowDisabled'],
      }
    });
    setWorkflows(data.Results);
    setTotalResults(data.TotalResults);

    setSearching(false);
  };

  const [showManageWorkflow, setShowManageWorkflow] = useState(false);
  const [isNewWorkflow, setIsNewWorkflow] = useState(true);
  const [workflowToManage, setWorkflowToManage] = useState();

  const onWorkflowSave = (item) => {
    if (item) {
      searchWorkflows();
    }

    setShowManageWorkflow(false);
  };

  const rowClick = (row) => {
    setIsNewWorkflow(false);
    getWorkflow(row.original.ID);
  };

  const editActionClick = (row) => {
    setIsNewWorkflow(false);
    getWorkflow(row.ID);
  };

  const create = () => {
    setIsNewWorkflow(true);
    setWorkflowToManage(undefined);
    setShowManageWorkflow(true);
  };

  const [workflowReadyToEdit, setWorkflowReadyToEdit] = useState(false);

  const getWorkflow = async (id) => {
    const workflow = await Fetch.get({
      url: `/Workflow/${id}`
    });
    setWorkflowToManage(workflow);
    setWorkflowReadyToEdit(true);
  };

  useEffect(() => {
    if (workflowReadyToEdit) {
      setShowManageWorkflow(true);
      setWorkflowReadyToEdit(false);
    }
  }, [workflowReadyToEdit]);

  return (
    <div className="settings-list-container">
      <div className="row end">
        <div className="search-container">
          <Search
            placeholder="Search"
            resultsNum={workflows ? workflows.length : 0}
            searchVal={searchVal}
            setSearchVal={setSearchVal}
            searchFunc={searchWorkflows}
            ancillaryFilters={ancillaryFilterList.current}
            setAncillaryFilters={handleAncillaryFilterChange}
          />
        </div>

        {isWorkflow ? <div onClick={() => isWorkflow && create()} >
          <Button disabled={!isWorkflow || accessStatus === Enums.AccessStatus.LockedWithAccess || accessStatus === Enums.AccessStatus.LockedWithOutAccess}
            text='Create' icon="plus-circle" extraClasses="fit-content no-margin" tooltip={!isWorkflow ? "Please request multiple workflow access with support if needed" : ""} />
        </div> : <></>}

      </div>

      <div className={"no-items" + (workflows && workflows.length == 0 ? " no-items-visible" : "")}>
        <div className={"loading-overlay" + (searching ? " loading-overlay-visible" : "")}>
          <div className="loader"></div>
        </div>
        <img src="/job-folder.svg" alt="Folder" />
        <h3>No workflows found</h3>
        <p>If you can&apos;t find a workflow, try another search or create a new one.</p>
        {isWorkflow ? <div onClick={create}><img src="/icons/plus-circle-blue.svg" alt="plus" /> Add new workflow</div> : null}
        <img className="wave" src="/wave.svg" alt="wave" />
      </div>

      <div className="margin-top">
        {workflows.length != 0 ? <KendoTable
          searching={searching}
          actions={[
            { text: "Edit", icon: "edit", function: (row) => editActionClick(row) },
          ]}
          columns={columns}
          data={workflows}
          rowClick={rowClick}
          setSort={setSort}
          sortField={sortField}
          sortDirection={sortDirection}
          type="Workflow"
          heightOffset={425}
          highlightColumnName="Name"
        /> : ""}
      </div>

      <KendoPager pageSizeChanged={pageSizeChanged} pageChanged={pageChanged} totalResults={totalResults} searchValue={searchVal} parentPageNumber={currentPage} />

      {showManageWorkflow ?
        <ManageWorkflow isNew={isNewWorkflow} workflow={workflowToManage} onWorkflowSave={onWorkflowSave} accessStatus={accessStatus} isWorkflow={isWorkflow} /> : ''
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

export default Workflows;
