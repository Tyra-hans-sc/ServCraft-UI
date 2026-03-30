import React, { useState, useEffect, useContext, useRef } from 'react';
import Button from '../../components/button';
import NoSSR from '../../utils/no-ssr';
import Search from '../../components/search';
import CellStatus from '../../components/cells/status-old';
import CellDate from '../../components/cells/date';
import CellBold from '../../components/cells/bold';
import CellTech from '../../components/cells/tech';
import CellWide from '../../components/cells/wide';
import CellCheckbox from '../../components/cells/checkbox';
import CellCurrency from '../../components/cells/currency';
import CellNumber from '../../components/cells/number';
import CellBool from '../../components/cells/bool';
import ColumnSelect from '../../components/column-select';
import KendoPager from '../../components/kendo/kendo-pager';
import Router from 'next/router';
import Fetch from '../../utils/Fetch';
import * as Enums from '../../utils/enums';
import ToastContext from '../../utils/toast-context';
import CreateImport from '../../components/modals/import/create';
import Storage from '../../utils/storage';
import Helper from '../../utils/helper';
import WarrantyIndicator from '../../components/product/warranty-indicator';
import EmployeeService from '../../services/employee/employee-service';
import StoreService from '../../services/store/store-service';
import InventoryService from '../../services/inventory/inventory-service';
import AssetService from '../../services/asset/asset-service';
import UCS from '../../services/option/user-config-service';
import PS from '../../services/permission/permission-service';
import KendoCellWarrantyIndicator from '../../components/kendo/cells/kendo-cell-warranty-indicator';
import KendoTable from '../../components/kendo/kendo-table';
import KendoCellEmployee from '../../components/kendo/cells/kendo-cell-employee';
import KendoCellDate from '../../components/kendo/cells/kendo-cell-date';
import KendoCellCurrency from '../../components/kendo/cells/kendo-cell-currency';
import KendoCellNumber from '../../components/kendo/cells/kendo-cell-number';
import KendoCellStatus from '../../components/kendo/cells/kendo-cell-status';
import KendoCellBool from '../../components/kendo/cells/kendo-cell-bool';
import DownloadDropdown from '../../components/download-dropdown';
import { useMemo } from 'react';

function AssetList(props) {

  const toast = useContext(ToastContext);

  const [isInitialTab, setIsInitialTab] = useState(props.isInitialTab);

  const [columnState, setColumnState] = useState([]);
  const [availableColumns, setAvailableColumns] = useState([]);
  const [requiredColumns, setRequiredColumns] = useState([]);
  const [selectedColumns, setSelectedColumns] = useState([]);

  const [isMasterOfficeAdmin] = useState(PS.hasPermission(Enums.PermissionName.MasterOfficeAdmin));

  const [filtersConfig, setFiltersConfig] = useState([]);
  const [filters, setFilters] = useState([]);

  const [selectedProducts, setSelectedProducts] = useState([]);

  const [accessStatus, setAccessStatus] = useState(props.accessStatus);

  const getColumns = async () => {
    if (isInitialTab) {
      setColumnState(props.columns);
      setAvailableColumns(props.columns.map(column => column.Label));
      setRequiredColumns(props.columns.filter(column => column.IsRequired).map(column => column.Label));
      setSelectedColumns(props.columns.filter(column => column.Show).map(column => column.Label));
    } else {
      const mappings = await EmployeeService.getColumnMappings(Enums.ColumnMapping.Asset);
      let columns = mappings.Results;

      let isMultiStore = await StoreService.isMultiStore();
      if (!isMultiStore) {
        columns = columns.filter(x => x.ColumnName != 'StoreName');
      }

      setColumnState(columns);
      setAvailableColumns(columns.map(column => column.Label));
      setRequiredColumns(columns.filter(column => column.IsRequired).map(column => column.Label));
      setSelectedColumns(columns.filter(column => column.Show).map(column => column.Label));
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
      const filtersConfig = await UCS.getPageFilters(Enums.ConfigurationSection.Product);
      setFiltersConfig(filtersConfig);

      let [activeFilterIdsDefault, ancillaryFiltersDefault, sortExpressionDefault, sortDirectionDefault] = UCS.getFilterValues(filtersConfig,
        ["Categories", "Subcategories", "CustomerGroups", "Stores"], [],
        ["IncludeScrapped"], false);

      setActiveFilterIds(activeFilterIdsDefault);
      setAncillaryFilters(ancillaryFiltersDefault);
      setSortField(sortExpressionDefault);
      setSortDirection(sortDirectionDefault);

      const categories = await InventoryService.getAllInventoryCategories();
      const subCategories = await InventoryService.getAllInventorySubCategories();

      let filters = {
        Categories: categories.Results,
        Subcategories: subCategories.Results,
      };

      const stores = await StoreService.getListOfStores();
      if (stores.TotalResults > 1) {
        filters = {
          ...filters,
          Stores: stores.Results
        };
      }

      setFilters(filters);
      setTriggerClientFiltering(true);
    }
  };

  useEffect(() => {
    if (triggerClientFiltering) {
      searchProducts();
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
      }

      if (column.CellType != "none") {
        switch (column.CellType) {
          case 'select':
          case 'check':
            columnObject['accessor'] = (row) => { return { ProductNumber: row.ProductNumber, ID: row.ID } };
            columnObject['Cell'] = ({ cell: { value } }) => <CellCheckbox value={value.ProductNumber} itemId={value.ID} key={value}
              selectedItems={selectedProducts} setSelectedItems={setSelectedProducts} />;
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
            columnObject['Cell'] = ({ cell: { value } }) => <CellStatus value={value} />;
            columnObject['KendoCell'] = (props) => <KendoCellStatus {...props} />
            break;
          case 'icon':
            columnObject['Cell'] = ({ cell: { value } }) => <CellBool value={value} />;
            columnObject['KendoCell'] = (props) => <KendoCellBool {...props} />;
            break;
          default:
            columnObject['Cell'] = ({ cell: { value } }) => <CellBold value={value} />;
        }
      }

      if (column.ColumnName == 'LocationDisplay') {
        columnObject['accessor'] = (row) => {
          if (row.Location) {
            return row.Location.LocationDisplay;
          } else {
            return row.LocationDescription;
          }
        }
        columnObject['Cell'] = ({ cell: { value } }) => <CellWide value={value} />;
      }

      if (column.ColumnName === "Warranty") {
        columnObject['accessor'] = (row) => {
          return row;
        }
        columnObject['Cell'] = ({ cell: { value } }) => <WarrantyIndicator purchaseDate={value.PurchaseDate} warrantyPeriod={value.WarrantyPeriod} />;
        columnObject['KendoCell'] = (props) => <KendoCellWarrantyIndicator {...props} />
      }

      return columnObject;
    }),
    [columnState, selectedProducts]
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
    await EmployeeService.saveColumnMappings(newState, Enums.ColumnMapping.Asset, toast);
  }

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

  const [productResults, setProductResults] = useState(props.products ? props.products : []);
  const [searching, setSearching] = useState(false);
  const [sortField, setSortField] = useState(props.sortExpressionDefault);
  const [sortDirection, setSortDirection] = useState(props.sortDirectionDefault);
  const [searchVal, setSearchVal] = useState('');
  const [activeFilterIds, setActiveFilterIds] = useState();
  const [ancillaryFilters, setAncillaryFilters] = useState();
  const [totalResults, setTotalResults] = useState(props.totalResults ? props.totalResults : 0);
  const [currentPage, setCurrentPage] = useState(1);

  const handleAncillaryFilterChange = (result) => {
    if (result.reset) {
      setAncillaryFilters({ IncludeScrapped: false });
    } else {
      if (result.key == 'IncludeScrapped') {
        setAncillaryFilters({ IncludeScrapped: result.checked });
      }
    }
  };

  const getAncillaryFilterOptions = () => {
    const includeScrappedProductFilter = [{
      type: Enums.ControlType.Switch,
      label: 'Include scrapped assets',
    }];
    return {
      IncludeScrapped: includeScrappedProductFilter,
    }
  };

  const [pageSize, setPageSize] = useState(Storage.getCookie(Enums.Cookie.pageSize) ? parseInt(Storage.getCookie(Enums.Cookie.pageSize)) : 10);

  const pageSizeChanged = (size) => {
    if (size != pageSize) {
      setPageSize(size);
    }
  };

  const pageChanged = (page) => {
    setCurrentPage(page);
  };

  useEffect(() => {
    setExportOptionsList();
    getColumns();
    getFiltersConfig();
  }, []);

  const oldcurrentPage = useRef(currentPage);
  useEffect(() => {
    let changed = oldcurrentPage.current !== currentPage;
    oldcurrentPage.current = currentPage;

    if (changed) {
      searchProducts();
    }
  }, [currentPage]);

  const oldsearchVal = useRef(searchVal);
  const oldsortField = useRef(sortField);
  const oldsortDirection = useRef(sortDirection);
  const oldpageSize = useRef(pageSize);
  const oldancillaryFilters = useRef(ancillaryFilters);
  const oldactiveFilterIds = useRef(activeFilterIds);

  const firstUpdate = useRef(true);

  useEffect(() => {

    if (firstUpdate.current) {
      setTimeout(() => {
        firstUpdate.current = false;
      }, 500);

      return;
    }

    let changed = oldsearchVal.current !== searchVal
      || oldsortDirection.current !== sortDirection
      || oldsortField.current !== sortField
      || oldpageSize.current !== pageSize
      || Helper.jsonCompare(oldancillaryFilters.current, ancillaryFilters)
      || Helper.jsonCompare(oldactiveFilterIds.current, activeFilterIds);

    oldsearchVal.current = searchVal;
    oldsortField.current = sortField;
    oldsortDirection.current = sortDirection;
    oldpageSize.current = pageSize;
    oldancillaryFilters.current = ancillaryFilters;
    oldactiveFilterIds.current = activeFilterIds;

    if (!changed) return;

    if (currentPage == 1) {
      searchProducts();
    } else {
      setCurrentPage(1);
    }
  }, [sortField, sortDirection, activeFilterIds, ancillaryFilters, pageSize]);

  function setSort(field) {
    setSortDirection(Helper.getSortDirection(field, sortField, sortDirection));
    setSortField(field);
  }

  async function searchProducts() {

    setSearching(true);

    const products = await AssetService.getAssetList(searchVal, pageSize, currentPage, sortField, sortDirection,
      activeFilterIds, ancillaryFilters);

    let filtersConfigTemp = { ...filtersConfig };
    UCS.updateFilters(filtersConfigTemp, activeFilterIds, ancillaryFilters, sortField, sortDirection);
    UCS.saveConfigDebounced(filtersConfigTemp);
    setFiltersConfig(filtersConfigTemp);

    setProductResults(products.Results);
    setTotalResults(products.TotalResults);
    setSearching(false);
  }

  function rowClick(row) {
    Helper.nextRouter(Router.push, '/asset/[id]', `/asset/${row.original.ID}`);
  }

  function selectAll() {
    if (productResults.length == selectedProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(productResults.map(result => result.ID));
    }
  }

  const [scrapping, setScrapping] = useState(false);
  async function scrapProduct(product) {
    setScrapping(true);

    const scrap = await Fetch.get({
      url: `/Product/ProductScrapToggle?id=${product.ID}&isScrapped=${true}`,
      toastCtx: toast
    });

    if (scrap.ID) {
      toast.setToast({
        action: 'Undo',
        actionFunc: async function () {
          await Fetch.get({
            url: `/Product/ProductScrapToggle?id=${product.ID}&isScrapped=${false}`,
          });
          searchProducts();
        },
        message: 'Asset scrapped successfully',
        show: true,
        type: 'success'
      });
      searchProducts();
    }
    setScrapping(false);
  }

  const [scrappingSelected, setScrappingSelected] = useState(false);
  const scrapSelected = async () => {
    setScrappingSelected(true);

    const productsScrapped = await Fetch.post({
      url: '/Product/ProductListScrapToggle',
      params: selectedProducts,
      toastCtx: toast
    });

    if (productsScrapped) {
      toast.setToast({
        action: 'Undo',
        actionFunc: async function () {
          await Fetch.post({
            url: '/Product/ProductListScrapToggle',
            params: selectedProducts
          });
          searchProducts();
        },
        message: 'Asset scrapped successfully',
        show: true,
        type: 'success'
      });
      searchProducts();
    }

    setSelectedProducts([]);
    setScrappingSelected(false);
  }

  const [showImportModal, setShowImportModal] = useState(false);

  const [exportOptions, setExportOptions] = useState([]);
  const [exportPermission] = useState(PS.hasPermission(Enums.PermissionName.Exports));

  const setExportOptionsList = () => {
    let exportOpts = [];
    exportOpts.push({ url: '/Product/GetExportedProducts', method: 'POST', params: { ...params, ExportAll: false }, label: 'Filtered export' });
    exportOpts.push({ url: '/Product/GetExportedProducts', method: 'POST', params: { ...params, ExportAll: true }, label: 'Full export' });

    setExportOptions(exportOpts);
  };

  const [params, setParams] = useState({});

  useEffect(() => {
    setParams({
      searchPhrase: searchVal,
      CategoryIDList: activeFilterIds ? activeFilterIds["Categories"] : null,
      SubcategoryIDList: activeFilterIds ? activeFilterIds["Subcategories"] : null,
      CustomerGroupIDList: activeFilterIds ? activeFilterIds["CustomerGroups"] : null,
      StoreIDList: activeFilterIds ? activeFilterIds["Stores"] : null,
      IncludeScrapped: ancillaryFilters ? ancillaryFilters["IncludeScrapped"] : null,
    });
  }, [searchVal, activeFilterIds, ancillaryFilters]);

  useEffect(() => {
    setExportOptionsList();
  }, [params]);

  const getTableActions = () => {
    let acts = [
      { text: "Edit", icon: "edit", function: (row) => Helper.nextRouter(Router.push, '/asset/[id]', `/asset/${row.ID}`) }
    ];

    if (accessStatus !== Enums.AccessStatus.LockedWithAccess && accessStatus !== Enums.AccessStatus.LockedWithOutAccess) {
      acts.push({ text: (scrapping ? "Scrapping" : "Scrap Asset"), icon: "check-square-blue", function: scrapProduct });
    }

    return acts;
  };

  const ancillaryFilterOptions = useMemo(() => {
    return getAncillaryFilterOptions();
  }, [props.ancillaryFilters]);

  return (
    <div className="container">
      <div className="row end padded">
        <NoSSR>
          <div className="search-container">
            {triggerClientFiltering || isInitialTab ?
              <Search
                filters={filters}
                placeholder="Search asset code or description"
                resultsNum={productResults.length}
                searchVal={searchVal}
                setActiveFilterIds={setActiveFilterIds}
                ancillaryFilters={ancillaryFilterOptions}
                setAncillaryFilters={handleAncillaryFilterChange}
                setSearchVal={setSearchVal}
                filtersConfig={filtersConfig}
              /> : ''}
          </div>
          <div className="row end">
            {selectedProducts.length > 0
              ? <div className="select-actions">
                <Button text={scrapping ? "Scrapping" : "Scrap Selected"} icon="check-square-blue" extraClasses="white-action"
                  onClick={scrapping ? null : scrapSelected} />
              </div>
              : ''
            }
            {accessStatus !== Enums.AccessStatus.LockedWithAccess && accessStatus !== Enums.AccessStatus.LockedWithOutAccess && isMasterOfficeAdmin ? <>
              <div title="Import" className="import-container" onClick={() => setShowImportModal(true)}>
                <img src={Enums.Icon.Upload} alt="icon" className="import-icon" />
                {showImportModal ?
                  <CreateImport setShowModal={setShowImportModal} importType={Enums.ImportType.Asset} /> : ''
                }
              </div>
            </> : ""}

            {accessStatus !== Enums.AccessStatus.LockedWithAccess && accessStatus !== Enums.AccessStatus.LockedWithOutAccess && exportPermission ? <>
              <div className="download">
                <DownloadDropdown title={'Export'} options={exportOptions} />
              </div>
            </> : ''}

            <ColumnSelect options={availableColumns} selected={selectedColumns} requiredColumns={requiredColumns} setColumn={setColumn} setReorder={setReorder}
              resetColumnWidths={resetColumnWidths} />
          </div>
        </NoSSR>

      </div>

      <div className={"no-items" + (productResults.length == 0 ? " no-items-visible" : "")}>
        <div className={"loading-overlay" + (searching ? " loading-overlay-visible" : "")}>
          <div className="loader"></div>
        </div>
        <img src="/job-folder.svg" alt="Asset Folder" />
        <h3>No assets found</h3>
        <p>If you can't find a asset, try another search or create a new one.</p>
        <a href="/asset/create"><img src="/icons/plus-circle-blue.svg" alt="plus" /> Add new asset</a>
        <img className="wave" src="/wave.svg" alt="wave" />
      </div>

      {productResults.length != 0 ? <KendoTable
        searching={searching}
        actions={getTableActions()}
        columns={columns}
        data={productResults}
        rowClick={rowClick}
        setSort={setSort}
        sortField={sortField}
        sortDirection={sortDirection}
        type="Asset"
        onColumnResize={onColumnResize}
        canSelectItems={true}
        selectedItems={selectedProducts}
        setSelectedItems={setSelectedProducts}
        heightOffset={360}
        highlightColumnName="ProductNumber"
        highlightColumnLink="/asset/"
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
          width: 10rem;
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
        .padded {
          padding-bottom: 1rem;
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
          margin: 0 0 0 1rem; 
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

export default AssetList;
