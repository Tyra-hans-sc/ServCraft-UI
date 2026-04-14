import React, { useState, useEffect, useContext, useRef } from 'react';
import Button from '../../components/button';
import Search from '../../components/search';
import Table from '../../components/table';
import { colors, fontSizes, layout, fontFamily, shadows } from '../../theme';

import CellStatus from '../../components/cells/status-old';
import CellStatusNew from '../../components/cells/status';
import CellDate from '../../components/cells/date';
import CellBold from '../../components/cells/bold';
import CellTech from '../../components/cells/tech';

import KendoCellStatus from '../../components/kendo/cells/kendo-cell-status';
import KendoCellDate from '../../components/kendo/cells/kendo-cell-date';
import KendoCellEmployee from '../../components/kendo/cells/kendo-cell-employee';
import KendoTable from '../kendo/kendo-table';
import KendoPager from '../kendo/kendo-pager';

import Fetch from '../../utils/Fetch';
import ToastContext from '../../utils/toast-context';
import * as Enums from '../../utils/enums';
import Helper from '../../utils/helper';
import ManageLookup from '../../components/modals/lookup/manage-lookup';
import LookupService from '../../services/lookup/lookup-service';

function LookupList({idx, type, accessStatus}) {
  
  const toast = useContext(ToastContext);
  const title = LookupService.getTitle(type);

  const [columnState, setColumnState] = useState([]);
  const [results, setResults] = useState([]);

  function getColumns() {
    let columns = [];
    switch (type) {
      case 'customerType':
      case 'customerStatus':
      case 'industryType':
      case 'mediaType':
      case 'queryType':
      case 'queryReason':
      case 'designation':
        columns = [{
            Label: 'Description',
            ColumnName: 'Description',
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
        break;
      case 'queryStatus':
        columns = [{
          Label: 'Description',
          ColumnName: 'QueryStatusDisplay',
          CellType: 'status_new',
        }, {
          Label: 'Query Type',
          ColumnName: 'QueryTypeDescription',
          CellType: 'status',
        }, {
          Label: 'Updated By',
          ColumnName: 'ModifiedBy',
          CellType: 'none',
        }, {
          Label: 'Updated Date',
          ColumnName: 'ModifiedDate',
          CellType: 'date',
        }];
        break;
      case 'faultCause':
      case 'faultReason':
        columns = [{
          Label: 'Code',
          ColumnName: 'Code',
          CellType: 'none',
        }, {
          Label: 'Description',
          ColumnName: 'Description',
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
        break;
      case 'faultCode':
        columns = [{
          Label: 'Code',
          ColumnName: 'Code',
          CellType: 'none',
        }, {
          Label: 'Description',
          ColumnName: 'Description',
          CellType: 'none',
        }, {
          Label: 'Inventory Category',
          ColumnName: 'InventoryCategoryDescription',
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
      break;
    }
    setColumnState(columns);
  }
  
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
  const [showDisabled, setShowDisabled] = useState(false);

  const handleAncillaryFilterChange = (result) => {
    if (result.reset) {
      setAncillaryFilters({ ShowDisabled: false });
      setShowDisabled(false);
    } else if (result.key == "ShowDisabled") {
      setAncillaryFilters({ ShowDisabled: !showDisabled });
      setShowDisabled(!showDisabled);
    }
  };

  const resetSearch = () => {
    setSearchVal('');
    setAncillaryFilters({ ShowDisabled: false });
    setShowDisabled(false);
  };

  const columns = React.useMemo(
    () => columnState && columnState.map(function (column) {
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
          case 'employee':
            columnObject['Cell'] = ({ cell: {value} }) => <CellTech value={value} />;
            columnObject['KendoCell'] = (props) => <KendoCellEmployee {...props} employeesField="Employees" />;
            break;
          case 'date':
            columnObject['Cell'] = ({ cell: {value} }) => <CellDate value={value} />;
            columnObject['KendoCell'] = (props) => <KendoCellDate {...props} />;
            break;
          case 'status':
            columnObject['Cell'] = ({ cell: {value} }) => <CellStatus value={value} />;
            columnObject['KendoCell'] = (props) => <KendoCellStatus {...props} />;
            break;
          case 'status_new':
            columnObject['Cell'] = ({ cell: {value} }) => <CellStatusNew value={value} />;
            columnObject['KendoCell'] = (props) => <KendoCellStatus {...props} />;
            break;
          default:
            columnObject['Cell'] = ({ cell: {value} }) => <CellBold value={value} />;
        }
      }

      return columnObject;
    }),
    [columnState]
  );

  useEffect(() => {
    getColumns();
    resetSearch();
    searchData();
  }, [type]);

  useEffect(() => {
    if (currentPage == 1) {
      searchData();
    } else {
      setCurrentPage(1);
    }
  }, [sortField, sortDirection, pageSize, ancillaryFilters]);

  useEffect(() => {
    searchData();
  }, [currentPage]);

  function setSort(field) {
    setSortDirection(Helper.getSortDirection(field, sortField, sortDirection));
    setSortField(field);
  }

  async function searchData() {
    setSearching(true);

    let url = LookupService.getListUrl(type);
    const data = await Fetch.post({
      url: url,
      params: {
        pageSize: pageSize,
        pageIndex: (currentPage - 1),
        searchPhrase: searchVal,
        SortExpression: sortField,
        SortDirection: sortDirection,        
        ShowClosed: showDisabled,
      }
    });
    setResults(data.Results);
    setTotalResults(data.TotalResults);

    setSearching(false);
  }

  const [showManageLookup, setShowManageLookup] = useState(false);
  const [newLookup, setNewLookup] = useState(true);
  const [lookupItemID, setLookupItemID] = useState();
  
  const onLookupItemSave = (item) => {
    if (item) {
      searchData();
    }

    setShowManageLookup(false);
  };

  function rowClick(row) {
    setLookupItemID(row.original.ID);
    setNewLookup(false);
    setShowManageLookup(true);
  }

  function editActionClick(row) {
    setLookupItemID(row.ID);
    setNewLookup(false);
    setShowManageLookup(true);
  }

  const create = () => {
    setLookupItemID(null);
    setNewLookup(true);
    setShowManageLookup(true);
  };

  return (
    <div className="settings-list-container">
      <div className="row end">
        <div className="search-container">
          <Search
            placeholder="Search"
            resultsNum={results ? results.length : 0} 
            searchVal={searchVal}
            setSearchVal={setSearchVal} 
            searchFunc={searchData}
            ancillaryFilters={ancillaryFilterList.current}
            setAncillaryFilters={handleAncillaryFilterChange}
          />
        </div>
        <div onClick={create}>
          <Button disabled={accessStatus === Enums.AccessStatus.LockedWithAccess || accessStatus === Enums.AccessStatus.LockedWithOutAccess}
          text='Create' icon="plus-circle" extraClasses="fit-content no-margin" />
        </div>
      </div>

      <div className={"no-items" + (results && results.length == 0 ? " no-items-visible" : "")}>
        <div className={"loading-overlay" + (searching ? " loading-overlay-visible" : "")}>
          <div className="loader"></div>
        </div>
        <img src="/job-folder.svg" alt="Folder" />
        <h3>No {title} found</h3>
        <p>If you can't find a {title}, try another search or create a new one.</p>
        <div onClick={create}><img src="/icons/plus-circle-blue.svg" alt="plus"/> Add new {title}</div>
        <img className="wave" src="/wave.svg" alt="wave" />
      </div>

      <div className="margin-top">
        {results.length != 0 ? <KendoTable
            searching={searching}
            actions={[
              {text: "Edit", icon: "edit", function: (row) => editActionClick(row)},
            ]}
            columns={columns}
            data={results}
            rowClick={rowClick}
            setSort={setSort}
            sortField={sortField}
            sortDirection={sortDirection}
            type="Lookup"
            heightOffset={425}
        /> : ""}
      </div>            

      <KendoPager pageSizeChanged={pageSizeChanged} pageChanged={pageChanged} totalResults={totalResults} searchValue={searchVal} parentPageNumber={currentPage} />

      { showManageLookup ?
        <ManageLookup isNew={newLookup} type={type} onLookupItemSave={onLookupItemSave} lookupItemID={lookupItemID} accessStatus={accessStatus}/> : ''
      }
      
      <style jsx>{`
        .type {
          align-items: center;
          background-color: rgba(28,37,44,0.2);
          border-radius: ${layout.buttonRadius};
          box-sizing: border-box;
          color: ${colors.darkPrimary};
          cursor: pointer;
          display: flex;
          font-size: 0.875rem;
          font-weight: bold;
          height: 3rem;
          justify-content: center;
          padding: 0 1rem;
          text-align: center;
        }
        .type-container {
          background-color: ${colors.white};
          border-radius: ${layout.buttonRadius};
          height: 3rem;
          margin: 1rem 0 0 1rem;
          width: calc(25% - 1rem);
        }
        .types {
          display: flex;
          flex-wrap: wrap;
          margin: 0 0 0 -1rem;
        }
        .list-box {
          border: 1px solid rgba(255, 255, 255, 0.7);
          border-radius: ${layout.cardRadius};
          margin-top: 1.5rem;
          padding: 1rem;
          position: relative;
        }
        .list-box h1 {
          color: ${colors.darkPrimary};
          font-size: 1.5rem;
          font-weight: normal;
          margin: 0 0 0.5rem;
        }
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

export default LookupList;
