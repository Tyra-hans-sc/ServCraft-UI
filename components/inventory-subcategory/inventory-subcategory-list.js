import React, { useState, useEffect, useRef } from 'react';
import Button from '../../components/button';
import Breadcrumbs from '../../components/breadcrumbs';
import Search from '../../components/search';
import CellStatus from '../../components/cells/status-old';
import CellDate from '../../components/cells/date';
import KendoPager from '../../components/kendo/kendo-pager';
import Fetch from '../../utils/Fetch';
import Router from 'next/router';
import Storage from '../../utils/storage';
import * as Enums from '../../utils/enums';
import Helper from '../../utils/helper';
import UCS from '../../services/option/user-config-service';
import KendoCellStatus from '../../components/kendo/cells/kendo-cell-status';
import KendoCellDate from '../../components/kendo/cells/kendo-cell-date';
import KendoTable from '../../components/kendo/kendo-table';
import InventorySubcategoryService from '../../services/inventory/inventory-subcategory-service';
import InventoryCategoryService from '../../services/inventory/inventory-category-service';
import { useMemo } from 'react';

function InventorySubcategoryList(props) {

  const [isInitialTab, setIsInitialTab] = useState(props.isInitialTab);

  const [columnState, setColumnState] = useState([]);
  const [inventorySubcategoryResults, setInventorySubcategoryResults] = useState(props.inventorySubcategories ? props.inventorySubcategories : []);

  const [sortField, setSortField] = useState();
  const [sortDirection, setSortDirection] = useState();
  const [searching, setSearching] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const [activeFilterIds, setActiveFilterIds] = useState();
  const [ancillaryFilters, setAncillaryFilters] = useState();
  const [totalResults, setTotalResults] = useState(props.totalResults ? props.totalResults : 0);
  const [currentPage, setCurrentPage] = useState(1);

  const [filtersConfig, setFiltersConfig] = useState([]);
  const [filters, setFilters] = useState([]);

  const getColumns = () => {
    if (isInitialTab) {
      setColumnState(props.columns);
    } else {
      setColumnState(InventorySubcategoryService.getInventorySubcategoryListColumns());
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
    } else {
      const filtersConfig = await UCS.getPageFilters(Enums.ConfigurationSection.InventorySubcategory);
      setFiltersConfig(filtersConfig);

      let [activeFilterIdsDefault, ancillaryFiltersDefault, sortExpressionDefault, sortDirectionDefault] = UCS.getFilterValues(filtersConfig,
        ["Categories"], [],
        ["IncludeDisabled"], false);

      setActiveFilterIds(activeFilterIdsDefault);
      setAncillaryFilters(ancillaryFiltersDefault);
      setSortField(sortExpressionDefault);
      setSortDirection(sortDirectionDefault);

      const inventoryCategories = await InventoryCategoryService.getAllInventoryCategories();
      setFilters({
        Categories: inventoryCategories.Results,
      });

      setTriggerClientFiltering(true);
    }
  };

  useEffect(() => {
    if (triggerClientFiltering) {
      searchInventorySubcategories();
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
    const includeDisabledFilter = [{
      type: Enums.ControlType.Switch,
      label: 'Include disabled subcategories',
    }];
    return {
      IncludeDisabled: includeDisabledFilter,
    }
  };

  const [accessStatus, setAccessStatus] = useState(props.accessStatus);

  const [pageSize, setPageSize] = useState(10);

  const pageSizeChanged = (size) => {
    setPageSize(size);
  };

  const pageChanged = (page) => {
    setCurrentPage(page);
  };

  useEffect(() => {
    getColumns();
    getFiltersConfig();
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
      searchInventorySubcategories();
    } else {
      setCurrentPage(1);
    }
  }, [sortField, sortDirection, activeFilterIds, ancillaryFilters, pageSize]);

  const firstUpdatePage = useRef(true);

  useEffect(() => {
    if (firstUpdatePage.current) {
      firstUpdatePage.current = false;
      return;
    }
    searchInventorySubcategories();
  }, [currentPage]);

  async function searchInventorySubcategories() {
    setSearching(true);

    const inventorySubcategories = await InventorySubcategoryService.getInventorySubcategoryList(searchVal, pageSize, currentPage,
      activeFilterIds, ancillaryFilters, sortField, sortDirection);

    let filtersConfigTemp = { ...filtersConfig };
    UCS.updateFilters(filtersConfigTemp, activeFilterIds, ancillaryFilters, sortField, sortDirection);
    UCS.saveConfigDebounced(filtersConfigTemp);
    setFiltersConfig(filtersConfigTemp);

    setInventorySubcategoryResults(inventorySubcategories.Results);
    setTotalResults(inventorySubcategories.TotalResults);

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
          case 'status':
            columnObject['Cell'] = ({ cell: { value } }) => <CellStatus value={value} />;
            columnObject['KendoCell'] = (props) => <KendoCellStatus {...props} />
            break;
        }
      }

      return columnObject;
    }),
    [columnState]
  );

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

  function setSort(field) {
    setSortDirection(Helper.getSortDirection(field, sortField, sortDirection));
    setSortField(field);
  }

  function rowClick(row) {
    Helper.nextRouter(Router.push, '/inventory-subcategory/[id]', `/inventory-subcategory/${row.original.ID}`);
  }

  const ancillaryFilterOptions = useMemo(() => {
    return getAncillaryFilterOptions();
  }, []);

  return (
    <div className="container">
      <div className="row end">
        <div className="search-container">
          {isInitialTab || triggerClientFiltering ?
            <Search
              filters={filters}
              placeholder="Search inventory subcategory"
              resultsNum={inventorySubcategoryResults.length}
              searchVal={searchVal}
              setActiveFilterIds={setActiveFilterIds}
              ancillaryFilters={ancillaryFilterOptions}
              setAncillaryFilters={handleAncillaryFilterChange}
              setSearchVal={setSearchVal}
              filtersConfig={filtersConfig}
            /> : ''
          }
        </div>
      </div>

      <div className={"no-items" + (inventorySubcategoryResults.length == 0 ? " no-items-visible" : "")}>
        <div className={"loading-overlay" + (searching ? " loading-overlay-visible" : "")}>
          <div className="loader"></div>
        </div>
        <img src="/job-folder.svg" alt="Folder" />
        <h3>No Inventory Subcategory found</h3>
        <p>If you can't find a Inventory Subcategory, try another search or create a new one.</p>
        <a href="/inventory-subcategory/create"><img src="/icons/plus-circle-blue.svg" alt="plus" /> Add new Inventory Subcategory</a>
        <img className="wave" src="/wave.svg" alt="wave" />
      </div>

      <div className="margin-top">
        {inventorySubcategoryResults.length != 0 ? <KendoTable
          searching={searching}
          actions={[
            { text: "Edit", icon: "edit", function: (row) => Helper.nextRouter(Router.push, '/inventory-subcategory/[id]', `/inventory-subcategory/${row.ID}`) },
          ]}
          columns={columns}
          data={inventorySubcategoryResults}
          rowClick={rowClick}
          setSort={setSort}
          sortField={sortField}
          sortDirection={sortDirection}
          type="InventorySubcategory"
          onColumnResize={onColumnResize}
          canSelectItems={false}
          heightOffset={360}
          highlightColumnName="Description"
          highlightColumnLink="/inventory-subcategory/"
        /> : ""}
      </div>

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
          width: 13rem;
        }
        .button-container :global(.button){
          margin-top: 0.5rem;
        }        
        .margin-top {
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

export default InventorySubcategoryList;
