import React, { useState, useEffect, useRef } from 'react';
import Search from '../../components/search';
import CellStatus from '../../components/cells/status-old';
import CellDate from '../../components/cells/date';
import CellBold from '../../components/cells/bold';
import CellTech from '../../components/cells/tech';
import CellCheckbox from '../../components/cells/checkbox';
import CellCurrency from '../../components/cells/currency';
import CellNumber from '../../components/cells/number';
import ColumnSelect from '../../components/column-select';
import KendoPager from '../../components/kendo/kendo-pager';
import Router from 'next/router';
import * as Enums from '../../utils/enums';
import Helper from '../../utils/helper';
import UCS from '../../services/option/user-config-service';
import KendoCellStatus from '../../components/kendo/cells/kendo-cell-status';
import KendoCellNumber from '../../components/kendo/cells/kendo-cell-number';
import KendoCellCurrency from '../../components/kendo/cells/kendo-cell-currency';
import KendoCellDate from '../../components/kendo/cells/kendo-cell-date';
import KendoCellEmployee from '../../components/kendo/cells/kendo-cell-employee';
import KendoTable from '../../components/kendo/kendo-table';
import SupplierService from '../../services/supplier/supplier-service';
import EmployeeService from '../../services/employee/employee-service';
import { useMemo } from 'react';

function SupplierList(props) {

  const [isInitialTab, setIsInitialTab] = useState(props.isInitialTab);

  const [columnState, setColumnState] = useState([]);
  const [availableColumns, setAvailableColumns] = useState([]);
  const [requiredColumns, setRequiredColumns] = useState([]);
  const [selectedColumns, setSelectedColumns] = useState([]);

  const [supplierResults, setSupplierResults] = useState(props.suppliers ? props.suppliers : []);

  const [sortField, setSortField] = useState();
  const [sortDirection, setSortDirection] = useState();
  const [searching, setSearching] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const [ancillaryFilters, setAncillaryFilters] = useState();
  const [totalResults, setTotalResults] = useState(props.totalResults ? props.totalResults : 0);
  const [currentPage, setCurrentPage] = useState(1);

  const [filtersConfig, setFiltersConfig] = useState([]);

  const getColumns = async () => {
    let columns = {};

    if (isInitialTab) {
      columns = props.columns;
    } else {
      const mappings = await EmployeeService.getColumnMappings(Enums.ColumnMapping.Supplier);
      columns = mappings.Results;
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
      setAncillaryFilters(props.ancillaryFiltersDefault);
      setSortField(props.sortExpressionDefault);
      setSortDirection(props.sortDirectionDefault);
    } else {
      const filtersConfig = await UCS.getPageFilters(Enums.ConfigurationSection.Supplier);
      setFiltersConfig(filtersConfig);

      let [activeFilterIdsDefault, ancillaryFiltersDefault, sortExpressionDefault, sortDirectionDefault] = UCS.getFilterValues(filtersConfig,
        [], [], ["IncludeDisabled"], false);

      setAncillaryFilters(ancillaryFiltersDefault);
      setSortField(sortExpressionDefault);
      setSortDirection(sortDirectionDefault);

      setTriggerClientFiltering(true);
    }
  };

  useEffect(() => {
    if (triggerClientFiltering) {
      searchSuppliers();
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
    return SupplierService.getSupplierAncillaryFilters();
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
      searchSuppliers();
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
    searchSuppliers();
  }, [currentPage]);

  function setSort(field) {
    setSortDirection(Helper.getSortDirection(field, sortField, sortDirection));
    setSortField(field);
  }

  const searchSuppliers = async () => {
    setSearching(true);

    const suppliers = await SupplierService.getSupplierList(searchVal, pageSize, currentPage, ancillaryFilters, sortField, sortDirection);

    let filtersConfigTemp = { ...filtersConfig };
    UCS.updateFilters(filtersConfigTemp, null, ancillaryFilters, sortField, sortDirection);
    UCS.saveConfigDebounced(filtersConfigTemp);
    setFiltersConfig(filtersConfigTemp);

    setSupplierResults(suppliers.Results);
    setTotalResults(suppliers.TotalResults);

    setSearching(false);
  }

  const [selectedSupplier, setSelectedSupplier] = useState([]);

  const columns = React.useMemo(
    () => columnState.filter(column => column.Show == true).map(function (column) {
      let columnObject = {
        Header: column.Label,
        accessor: column.ColumnName,
        ColumnName: column.ColumnName,
        UserWidth: column.UserWidth
      };

      if (column.CellType != "none") {
        switch (column.CellType) {
          case 'select':
          case 'check':
            columnObject['accessor'] = (row) => { return { Code: row.Code, ID: row.ID } };
            columnObject['Cell'] = ({ cell: { value } }) => <CellCheckbox value={value.Code} itemId={value.ID} key={value}
              selectedItems={selectedSupplier} setSelectedItems={setSelectedSupplier} />;
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

      return columnObject;
    }),
    [columnState, selectedSupplier]
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
    await EmployeeService.saveColumnMappings(newState, Enums.ColumnMapping.Supplier);
  }

  function rowClick(row) {
    Helper.nextRouter(Router.push, '/supplier/[id]', `/supplier/${row.original.ID}`);
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
              placeholder="Search supplier name"
              resultsNum={supplierResults.length}
              searchVal={searchVal}
              setSearchVal={setSearchVal}
              searchFunc={searchSuppliers}
              ancillaryFilters={ancillaryFilterOptions}
              setAncillaryFilters={handleAncillaryFilterChange}
              filtersConfig={filtersConfig}
            /> : ''
          }
        </div>
        <div className="row end">
          <ColumnSelect options={availableColumns} selected={selectedColumns} requiredColumns={requiredColumns} setColumn={setColumn} setReorder={setReorder}
            resetColumnWidths={resetColumnWidths} />
        </div>
      </div>

      <div className={"no-items" + (supplierResults.length == 0 ? " no-items-visible" : "")}>
        <div className={"loading-overlay" + (searching ? " loading-overlay-visible" : "")}>
          <div className="loader"></div>
        </div>
        <img src="/job-folder.svg" alt="Folder" />
        <h3>No Supplier found</h3>
        <p>If you can't find a Supplier, try another search or create a new one.</p>
        <a href="/supplier/create"><img src="/icons/plus-circle-blue.svg" alt="plus" /> Add new Supplier</a>
        <img className="wave" src="/wave.svg" alt="wave" />
      </div>

      {supplierResults.length != 0 ? <KendoTable
        searching={searching}
        actions={[
          { text: "Edit", icon: "edit", function: (row) => Helper.nextRouter(Router.push, '/supplier/[id]', `/supplier/${row.ID}`) },
        ]}
        columns={columns}
        data={supplierResults}
        rowClick={rowClick}
        setSort={setSort}
        sortField={sortField}
        sortDirection={sortDirection}
        type="Supplier"
        onColumnResize={onColumnResize}
        canSelectItems={true}
        selectedItems={selectedSupplier}
        setSelectedItems={setSelectedSupplier}
        heightOffset={360}
        highlightColumnName="Code"
        highlightColumnLink="/supplier/"
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

export default SupplierList;
