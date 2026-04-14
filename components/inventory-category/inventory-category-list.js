import React, { useState, useEffect, useRef } from 'react';
import Button from '../../components/button';
import Breadcrumbs from '../../components/breadcrumbs';
import Search from '../../components/search';
import { colors, fontSizes, layout, fontFamily, shadows } from '../../theme';
import CellDate from '../../components/cells/date';
import KendoPager from '../../components/kendo/kendo-pager';
import Fetch from '../../utils/Fetch';
import Router from 'next/router';
import Storage from '../../utils/storage';
import * as Enums from '../../utils/enums';
import Helper from '../../utils/helper';
import KendoCellDate from '../../components/kendo/cells/kendo-cell-date';
import KendoTable from '../../components/kendo/kendo-table';
import InventoryCategoryService from '../../services/inventory/inventory-category-service';
import { useMemo } from 'react';

function InventoryCategoryList(props) {

  const [isInitialTab, setIsInitialTab] = useState(props.isInitialTab);

  const [columnState, setColumnState] = useState([]);
  const [inventoryCategoryResults, setInventoryCategoryResults] = useState(props.inventoryCategories ? props.inventoryCategories : []);

  const [sortField, setSortField] = useState('');
  const [sortDirection, setSortDirection] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const [ancillaryFilters, setAncillaryFilters] = useState({ IncludeDisabled: false });
  const [totalResults, setTotalResults] = useState(props.totalResults ? props.totalResults : 0);
  const [currentPage, setCurrentPage] = useState(1);

  const [accessStatus, setAccessStatus] = useState(props.accessStatus);

  const [triggerClientFiltering, setTriggerClientFiltering] = useState(false);

  const getColumns = () => {
    if (isInitialTab) {
      setColumnState(props.columns);
    } else {
      setColumnState(InventoryCategoryService.getInventoryCategoryListColumns());
      setTriggerClientFiltering(true);
    }
  };

  useEffect(() => {
    if (triggerClientFiltering) {
      searchInventoryCategories();
    }
  }, [triggerClientFiltering]);

  const handleAncillaryFilterChange = (result) => {
    if (result.reset) {
      setAncillaryFilters({ IncludeDisabled: false });
    } else {
      if (result.key == "IncludeDisabled") {
        setAncillaryFilters({ IncludeDisabled: result.checked });
      }
    }
  };

  const getAncillaryFilterOptions = () => {
    const includeDisabledInventoryCategoryFilter = [{
      type: Enums.ControlType.Switch,
      label: 'Include disabled categories',
    }];
    return {
      IncludeDisabled: includeDisabledInventoryCategoryFilter,
    }
  };

  const [pageSize, setPageSize] = useState(10);

  const pageSizeChanged = (size) => {
    setPageSize(size);
  };

  const pageChanged = (page) => {
    setCurrentPage(page);
  };

  useEffect(() => {
    getColumns();
  }, []);

  const firstUpdate = useRef(true);

  useEffect(() => {
    if (firstUpdate.current) {
      setTimeout(() => {
        firstUpdate.current = false;
      }, 500);
      return;
    }
    if (currentPage == 1) {
      searchInventoryCategories();
    } else {
      setCurrentPage(1);
    }
  }, [sortField, sortDirection, ancillaryFilters, pageSize]);

  const firstUpdatePage = useRef(true);

  useEffect(() => {
    if (firstUpdatePage.current) {
      firstUpdatePage.current = false;
      return;
    }
    searchInventoryCategories();
  }, [currentPage]);

  async function searchInventoryCategories() {
    setSearching(true);

    const inventoryCategories = await InventoryCategoryService.getInventoryCategoryList(searchVal, pageSize, currentPage, ancillaryFilters, sortField, sortDirection);

    setInventoryCategoryResults(inventoryCategories.Results);
    setTotalResults(inventoryCategories.TotalResults);

    setSearching(false);
  }

  const columns = React.useMemo(
    () => columnState.map(function (column) {
      let columnObject = {
        Header: column.Label,
        accessor: column.ColumnName,
        ColumnName: column.ColumnName,
        UserWidth: column.UserWidth
      }

      if (column.CellType != "none") {
        switch (column.CellType) {
          case 'date':
            columnObject['Cell'] = ({ cell: { value } }) => <CellDate value={value} />;
            columnObject['KendoCell'] = (props) => <KendoCellDate {...props} />;
            break;
        }
      }

      return columnObject;
    }),
    [columnState]
  );

  const setSort = (field) => {
    setSortDirection(Helper.getSortDirection(field, sortField, sortDirection));
    setSortField(field);
  };

  function rowClick(row) {
    Helper.nextRouter(Router.push, '/inventory-category/[id]', `/inventory-category/${row.original.ID}`);
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
    return getAncillaryFilterOptions();
  }, []);

  return (
    <div className="container">

      <div className="row end">
        <div className="search-container">
          <Search
            placeholder="Search inventory category name"
            resultsNum={inventoryCategoryResults.length}
            searchVal={searchVal}
            setSearchVal={setSearchVal}
            ancillaryFilters={ancillaryFilterOptions}
            setAncillaryFilters={handleAncillaryFilterChange}
            searchFunc={searchInventoryCategories}
          />
        </div>
      </div>

      <div className={"no-items" + (inventoryCategoryResults.length == 0 ? " no-items-visible" : "")}>
        <div className={"loading-overlay" + (searching ? " loading-overlay-visible" : "")}>
          <div className="loader"></div>
        </div>
        <img src="/job-folder.svg" alt="Folder" />
        <h3>No Inventory Category found</h3>
        <p>If you can't find a Inventory Category, try another search or create a new one.</p>
        <a href="/inventory-category/create"><img src="/icons/plus-circle-blue.svg" alt="plus" /> Add new Inventory Category</a>
        <img className="wave" src="/wave.svg" alt="wave" />
      </div>

      {inventoryCategoryResults.length != 0 ? <KendoTable
        searching={searching}
        actions={[
          { text: "Edit", icon: "edit", function: (row) => Helper.nextRouter(Router.push, '/inventory-category/[id]', `/inventory-category/${row.ID}`) },
        ]}
        columns={columns}
        data={inventoryCategoryResults}
        rowClick={rowClick}
        setSort={setSort}
        sortField={sortField}
        sortDirection={sortDirection}
        type="InventoryCategory"
        onColumnResize={onColumnResize}
        canSelectItems={false}
        heightOffset={360}
        highlightColumnName="Description"
        highlightColumnLink="/inventory-category/"
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
          width: 12rem;
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
      `}</style>
    </div>
  );
}

export default InventoryCategoryList;
