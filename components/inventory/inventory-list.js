import React, { useState, useEffect, useRef } from 'react';
import NoSSR from '../../utils/no-ssr';
import Button from '../../components/button';
import Search from '../../components/search';
import CellStatus from '../../components/cells/status-old';
import CellDate from '../../components/cells/date';
import CellBold from '../../components/cells/bold';
import CellTech from '../../components/cells/tech';
import CellWide from '../../components/cells/wide';
import CellCheckbox from '../../components/cells/checkbox';
import CellCurrency from '../../components/cells/currency';
import CellNumber from '../../components/cells/number';
import ColumnSelect from '../../components/column-select';
import KendoPager from '../../components/kendo/kendo-pager';
import Fetch from '../../utils/Fetch';
import Router from 'next/router';
import DownloadDropdown from '../../components/download-dropdown';
import CreateImport from '../../components/modals/import/create';
import * as Enums from '../../utils/enums';
import Storage from '../../utils/storage';
import Helper from '../../utils/helper';
import UCS from '../../services/option/user-config-service';
import PS from '../../services/permission/permission-service';
import IntegrationService from '../../services/integration-service';
import EmployeeService from '../../services/employee/employee-service';
import SupplierService from '../../services/supplier/supplier-service';
import InventoryService from '../../services/inventory/inventory-service';
import KendoCellStatus from '../../components/kendo/cells/kendo-cell-status';
import KendoCellNumber from '../../components/kendo/cells/kendo-cell-number';
import KendoCellCurrency from '../../components/kendo/cells/kendo-cell-currency';
import KendoCellDate from '../../components/kendo/cells/kendo-cell-date';
import KendoCellEmployee from '../../components/kendo/cells/kendo-cell-employee';
import KendoTable from '../../components/kendo/kendo-table';
import { useMemo } from 'react';

function InventoryList(props) {

  const [isInitialTab, setIsInitialTab] = useState(props.isInitialTab);

  const [hasIntegration, setHasIntegration] = useState(props.hasIntegration);

  const [columnState, setColumnState] = useState([]);
  const [availableColumns, setAvailableColumns] = useState([]);
  const [requiredColumns, setRequiredColumns] = useState([]);
  const [selectedColumns, setSelectedColumns] = useState([]);

  const [isMasterOfficeAdminPermission] = useState(PS.hasPermission(Enums.PermissionName.MasterOfficeAdmin));
  const [exportPermission] = useState(PS.hasPermission(Enums.PermissionName.Exports));

  const [filtersConfig, setFiltersConfig] = useState([]);
  const [filters, setFilters] = useState([]);

  const [selectedInventory, setSelectedInventory] = useState([]);

  const [accessStatus, setAccessStatus] = useState(props.accessStatus);

  const getColumns = async () => {
    let integrationActive = false;
    let columns = {};

    if (isInitialTab) {
      columns = props.columns;
      integrationActive = hasIntegration;
    } else {
      let integration = await IntegrationService.getIntegration();
      setHasIntegration(integration !== null);
      integrationActive = integration !== null;

      const mappings = await EmployeeService.getColumnMappings(Enums.ColumnMapping.Inventory);
      columns = mappings.Results;
    }

    if (!integrationActive) {
      columns = columns.filter(x => x.ColumnName != 'InventorySyncStatus');
    }
    setColumnState(columns);
    setAvailableColumns(columns.map(column => column.Label));
    setRequiredColumns(columns.filter(column => column.IsRequired).map(column => column.Label));
    setSelectedColumns(columns.filter(column => column.Show).map(column => column.Label));
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
      const filtersConfig = await UCS.getPageFilters(Enums.ConfigurationSection.Inventory);
      setFiltersConfig(filtersConfig);

      let [activeFilterIdsDefault, ancillaryFiltersDefault, sortExpressionDefault, sortDirectionDefault] = UCS.getFilterValues(filtersConfig,
        ["Categories", "Subcategories", "Suppliers", "StockItemTypes"], [],
        ["IncludeDisabled"], false);

      setActiveFilterIds(activeFilterIdsDefault);
      setAncillaryFilters(ancillaryFiltersDefault);
      setSortField(sortExpressionDefault);
      setSortDirection(sortDirectionDefault);

      const inventoryCategories = await InventoryService.getAllInventoryCategories();
      const inventorySubcategories = await InventoryService.getAllInventorySubCategories();
      const suppliers = await SupplierService.getAllSuppliers();
      const stockItemTypes = Enums.getEnumItems(Enums.StockItemType);

      setFilters({
        Categories: inventoryCategories.Results,
        Subcategories: inventorySubcategories.Results,
        Suppliers: suppliers.Results,
        StockItemTypes: stockItemTypes,
      });

      setTriggerClientFiltering(true);
    }
  };

  useEffect(() => {
    if (triggerClientFiltering) {
      searchInventories();
    }
  }, [triggerClientFiltering]);

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
            columnObject['accessor'] = (row) => { return { Code: row.Code, ID: row.ID } };
            columnObject['Cell'] = ({ cell: { value } }) => <CellCheckbox value={value.Code} itemId={value.ID} key={value}
              selectedItems={selectedInventory} setSelectedItems={setSelectedInventory} />;
            break;
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
          case 'int':
          case 'int?':
            columnObject['extraClasses'] = 'header-right-align';
            columnObject['Cell'] = ({ cell: { value } }) => <CellNumber value={value} isDecimal={false} />;
            columnObject['KendoCell'] = (props) => <KendoCellNumber {...props} isDecimal={false} />;
            break;
          case 'decimal':
          case 'decimal?':
            columnObject['extraClasses'] = 'header-right-align';
            columnObject['Cell'] = ({ cell: { value } }) => <CellNumber value={value} isDecimal={true} />;
            columnObject['KendoCell'] = (props) => <KendoCellNumber {...props} isDecimal={true} />;
            break;
          case 'status':
            columnObject['Cell'] = ({ cell: { value } }) => <CellStatus value={value} valueEnum={columnObject.accessor} />;
            columnObject['KendoCell'] = (props) => <KendoCellStatus {...props} valueEnum={columnObject.accessor} />
            break;
          default:
            columnObject['Cell'] = ({ cell: { value } }) => <CellBold value={value} />;
        }
      }

      if (column.ColumnName == 'LocationDescription') {
        columnObject['accessor'] = (row) => {
          if (row.Location) {
            return row.Location.LocationDisplay;
          } else {
            return row.LocationDescription;
          }
        }
        columnObject['Cell'] = ({ cell: { value } }) => <CellWide value={value} />;
      }

      return columnObject;
    }),
    [columnState, selectedInventory]
  );

  function setColumn(selected) {
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
    await EmployeeService.saveColumnMappings(newState, Enums.ColumnMapping.Inventory);
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
    const newState = columnState.filter(x => hasIntegration || x.ColumnName != 'InventorySyncStatus').map(function (column) {
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

  const [inventoryResults, setInventoryResults] = useState(props.inventories ? props.inventories : []);
  const [searching, setSearching] = useState(false);
  const [sortField, setSortField] = useState();
  const [sortDirection, setSortDirection] = useState();
  const [searchVal, setSearchVal] = useState('');
  const [activeFilterIds, setActiveFilterIds] = useState();
  const [ancillaryFilters, setAncillaryFilters] = useState();
  const [totalResults, setTotalResults] = useState(props.totalResults ? props.totalResults : 0);
  const [currentPage, setCurrentPage] = useState(1);
  const oldCurrentPage = useRef(1);

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
    const includeDisabledInventoryFilter = [{
      type: Enums.ControlType.Switch,
      label: 'Include disabled inventory',
    }];
    return {
      IncludeDisabled: includeDisabledInventoryFilter,
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
      searchInventories();
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
      searchInventories();
    }
  }, [currentPage]);

  function setSort(field) {
    setSortDirection(Helper.getSortDirection(field, sortField, sortDirection));
    setSortField(field);
  }

  async function searchInventories() {

    setSearching(true);

    const inventory = await InventoryService.getInventoryList(searchVal, pageSize, currentPage, activeFilterIds, ancillaryFilters, sortField, sortDirection);

    let filtersConfigTemp = { ...filtersConfig };
    UCS.updateFilters(filtersConfigTemp, activeFilterIds, ancillaryFilters, sortField, sortDirection);
    UCS.saveConfigDebounced(filtersConfigTemp);
    setFiltersConfig(filtersConfigTemp);

    setInventoryResults(inventory.Results);
    setTotalResults(inventory.TotalResults);
    setSearching(false);
  }

  function rowClick(row) {
    Helper.nextRouter(Router.push, '/inventory/[id]', `/inventory/${row.original.ID}`);
  }

  const [params, setParams] = useState({});

  useEffect(() => {
    setParams({
      SearchPhrase: searchVal,
      CategoryIDList: activeFilterIds ? activeFilterIds["Categories"] : null,
      SubcategoryIDList: activeFilterIds ? activeFilterIds["Subcategories"] : null,
      SupplierIDList: activeFilterIds ? activeFilterIds["Suppliers"] : null,
      StockItemTypeIDList: activeFilterIds ? activeFilterIds["StockItemTypes"] : null,
      IncludeClosed: ancillaryFilters ? ancillaryFilters["IncludeDisabled"] : null,
      SortExpression: sortField,
      SortDirection: sortDirection
    });
  }, [searchVal, sortField, sortDirection, activeFilterIds, ancillaryFilters]);

  const [showImportModal, setShowImportModal] = useState(false);

  const ancillaryFilterOptions = useMemo(() => {
    return getAncillaryFilterOptions();
  }, []);

  return (
    <div className="container">
      <div className="row end">
        <NoSSR>
          <div className="search-container">
            {triggerClientFiltering || isInitialTab ?
              <Search
                filters={filters}
                placeholder="Search inventory code or description"
                resultsNum={inventoryResults.length}
                searchVal={searchVal}
                setActiveFilterIds={setActiveFilterIds}
                ancillaryFilters={ancillaryFilterOptions}
                setAncillaryFilters={handleAncillaryFilterChange}
                setSearchVal={setSearchVal}
                filtersConfig={filtersConfig}
              /> : ''
            }

          </div>
          <div className="row end">
            {accessStatus !== Enums.AccessStatus.LockedWithAccess && accessStatus !== Enums.AccessStatus.LockedWithOutAccess && isMasterOfficeAdminPermission ?
              <div title="Import" className="import-container" onClick={() => setShowImportModal(true)}>
                <img src={Enums.Icon.Upload} alt="icon" className="import-icon" />
                {showImportModal ?
                  <CreateImport setShowModal={setShowImportModal} importType={Enums.ImportType.Inventory} /> : ''
                }
              </div> : ""}

            {exportPermission ? <>
              <div className="download">
                <DownloadDropdown title={'Export'} options={[
                  { url: '/Inventory/GetExportedInventory', method: 'POST', params: { ...params, ExportAll: false }, label: 'Filtered export' },
                  { url: '/Inventory/GetExportedInventory', method: 'POST', params: { ...params, ExportAll: true }, label: 'Full export' },
                ]} />
              </div>
            </> : ""}
            <ColumnSelect options={availableColumns} selected={selectedColumns} requiredColumns={requiredColumns} setColumn={setColumn} setReorder={setReorder}
              resetColumnWidths={resetColumnWidths} />
          </div>
        </NoSSR>
      </div>

      <div className={"no-items" + (inventoryResults.length == 0 ? " no-items-visible" : "")}>
        <div className={"loading-overlay" + (searching ? " loading-overlay-visible" : "")}>
          <div className="loader"></div>
        </div>
        <img src="/job-folder.svg" alt="Inventory Folder" />
        <h3>No inventories found</h3>
        <p>If you can't find an inventory, try another search or create a new one.</p>
        <a href="/inventory/create"><img src="/icons/plus-circle-blue.svg" alt="plus" /> Add new inventory</a>
        <img className="wave" src="/wave.svg" alt="wave" />
      </div>

      <div className="margin-top">
        {inventoryResults.length != 0 ? <KendoTable
          searching={searching}
          actions={[
            { text: "Edit", icon: "edit", function: (row) => Helper.nextRouter(Router.push, '/inventory/[id]', `/inventory/${row.ID}`) },
          ]}
          columns={columns}
          data={inventoryResults}
          rowClick={rowClick}
          setSort={setSort}
          sortField={sortField}
          sortDirection={sortDirection}
          type="Inventory"
          onColumnResize={onColumnResize}
          canSelectItems={true}
          selectedItems={selectedInventory}
          setSelectedItems={setSelectedInventory}
          heightOffset={360}
          highlightColumnName="Code"
          highlightColumnLink="/inventory/"
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
            // width: 10rem;
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
          .download {
            margin-right: 0.5rem;
            cursor: pointer;
          }
        `}</style>
    </div>
  );
}

export default InventoryList;
