import React, { useState, useEffect, useContext, useRef } from 'react';
import Button from '../../components/button';
import NoSSR from '../../utils/no-ssr';
import Search from '../../components/search';
import { colors, fontSizes, layout, fontFamily, shadows } from '../../theme';
import CellStatus from '../../components/cells/status';
import CellDate from '../../components/cells/date';
import CellBold from '../../components/cells/bold';
import CellCheckbox from '../../components/cells/checkbox';
import CellBool from '../../components/cells/bool';
import ColumnSelect from '../../components/column-select';
import KendoPager from '../../components/kendo/kendo-pager';
import DownloadDropdown from '../../components/download-dropdown';
import CreateImport from '../../components/modals/import/create';
import Router from 'next/router';
import ToastContext from '../../utils/toast-context';
import * as Enums from '../../utils/enums';
import Helper from '../../utils/helper';
import PS from '../../services/permission/permission-service';
import IntegrationService from '../../services/integration-service';
import EmployeeService from '../../services/employee/employee-service';
import CustomerService from '../../services/customer/customer-service';
import UCS from '../../services/option/user-config-service';
import KendoCellBool from '../../components/kendo/cells/kendo-cell-bool';
import KendoCellStatus from '../../components/kendo/cells/kendo-cell-status';
import KendoCellDate from '../../components/kendo/cells/kendo-cell-date';
import KendoTable from '../../components/kendo/kendo-table';
import { useMemo } from 'react';

function CustomerList(props) {

  const toast = useContext(ToastContext);
  const [hasIntegration, setHasIntegration] = useState(props.hasIntegration);

  const [isInitialTab, setIsInitialTab] = useState(props.isInitialTab);

  const [columnState, setColumnState] = useState([]);
  const [availableColumns, setAvailableColumns] = useState([]);
  const [requiredColumns, setRequiredColumns] = useState([]);
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [selectedCustomers, setSelectedCustomers] = useState([]);

  const [filtersConfig, setFiltersConfig] = useState([]);
  const [filters, setFilters] = useState([]);

  const [accessStatus, setAccessStatus] = useState(props.accessStatus);

  const [isMasterOfficeAdminPermission] = useState(PS.hasPermission(Enums.PermissionName.MasterOfficeAdmin));
  const [exportPermission] = useState(PS.hasPermission(Enums.PermissionName.Exports));

  const [pageSize, setPageSize] = useState(10);

  const pageSizeChanged = (size) => {
    setPageSize(size);
  };

  const pageChanged = (page) => {
    setCurrentPage(page);
  };

  const getColumns = async () => {
    if (isInitialTab) {
      let columns = props.columns;
      if (!hasIntegration) {
        columns = columns.filter(x => x.ColumnName != 'CustomerSyncStatus');
      }
      setColumnState(columns);
      setAvailableColumns(columns.map(column => column.Label));
      setRequiredColumns(columns.filter(column => column.IsRequired).map(column => column.Label));
      setSelectedColumns(columns.filter(column => column.Show).map(column => column.Label));
    } else {
      let integration = await IntegrationService.getIntegration();
      setHasIntegration(integration !== null);
      const columnMappings = await EmployeeService.getColumnMappings('CustomerList');

      let columns = columnMappings.Results;
      if (!integration) {
        columns = columns.filter(x => x.ColumnName != 'CustomerSyncStatus');
      }
      setColumnState(columns);
      setAvailableColumns(columns.map(column => column.Label));
      setRequiredColumns(columns.filter(column => column.IsRequired).map(column => column.Label));
      setSelectedColumns(columns.filter(column => column.Show).map(column => column.Label));
    }
  };

  const [triggerClientFiltering, setTriggerClientFiltering] = useState(false);

  const getFilters = async () => {
    if (isInitialTab) {
      setFiltersConfig(props.filtersConfig);
      setActiveFilterIds(props.activeFilterIdsDefault);
      setAncillaryFilters(props.ancillaryFiltersDefault);
      setSortField(props.sortExpressionDefault);
      setSortDirection(props.sortDirectionDefault);
      setFilters(props.filters);
    } else {
      const filtersConfig = await UCS.getPageFilters(Enums.ConfigurationSection.Customer);
      setFiltersConfig(filtersConfig);

      let [activeFilterIdsDefault, ancillaryFiltersDefault, sortExpressionDefault, sortDirectionDefault] = UCS.getFilterValues(filtersConfig,
        ["CustomerGroups", "CustomerStatuses", "CustomerTypes"], [],
        ["IncludeClosed", "ShowArchived"], false);

      setActiveFilterIds(activeFilterIdsDefault);
      setAncillaryFilters(ancillaryFiltersDefault);
      setSortField(sortExpressionDefault);
      setSortDirection(sortDirectionDefault);

      const customerGroups = await CustomerService.getCustomerGroups();
      const customerStatutes = await CustomerService.getCustomerStatuses();
      const customerTypes = await CustomerService.getCustomerTypes();

      setFilters({
        CustomerGroups: customerGroups.Results,
        CustomerStatuses: customerStatutes.Results,
        CustomerTypes: customerTypes.Results
      });
      setTriggerClientFiltering(true);
    }
  };

  useEffect(() => {
    if (triggerClientFiltering) {
      searchCustomers();
    }
  }, [triggerClientFiltering]);

  useEffect(() => {
    getColumns();
    getFilters();
  }, []);

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
            columnObject['accessor'] = (row) => { return { CustomerCode: row.CustomerCode, ID: row.ID } };
            columnObject['Cell'] = ({ cell: { value } }) => <CellCheckbox value={value.CustomerCode} itemId={value.ID} key={value} selectedItems={selectedCustomers} setSelectedItems={setSelectedCustomers} />;
            break;
          case 'date':
            columnObject['Cell'] = ({ cell: { value } }) => <CellDate value={value} />;
            columnObject['KendoCell'] = (props) => <KendoCellDate {...props} />;
            break;
          case 'status':
            columnObject['Cell'] = ({ cell: { value } }) => <CellStatus value={value} valueEnum={"CustomerSyncStatus"} />;
            columnObject['KendoCell'] = (props) => <KendoCellStatus {...props} valueEnum={"CustomerSyncStatus"} />
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
    [columnState, selectedCustomers]
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
    await EmployeeService.saveColumnMappings(newState, Enums.ColumnMapping.Customer, toast);
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
    const newState = columnState.filter(x => hasIntegration || x.ColumnName != 'CustomerSyncStatus').map(function (column) {
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

  const [customerResults, setCustomerResults] = useState(props.customers ? props.customers : []);
  const [searching, setSearching] = useState(false);
  const [sortField, setSortField] = useState('');
  const [sortDirection, setSortDirection] = useState('');
  const [searchVal, setSearchVal] = useState('');
  const [activeFilterIds, setActiveFilterIds] = useState();
  const [ancillaryFilters, setAncillaryFilters] = useState();
  const [totalResults, setTotalResults] = useState(props.totalResults ? props.totalResults : 0);
  const [currentPage, setCurrentPage] = useState(1);
  const oldCurrentPage = useRef(1);

  const handleAncillaryFilterChange = (result) => {
    if (result.reset) {
      setAncillaryFilters({ ShowArchived: false, IncludeClosed: false });
    } else {
      if (result.key == "IncludeClosed") {
        setAncillaryFilters({ ShowArchived: ancillaryFilters.ShowArchived, IncludeClosed: result.checked });
      } else if (result.key == "ShowArchived") {
        setAncillaryFilters({ IncludeClosed: ancillaryFilters.IncludeClosed, ShowArchived: result.checked });
      }
    }
  };

  const getAncillaryFilterOptions = () => {
    const includeClosedCustomerFilter = [{
      type: Enums.ControlType.Switch,
      label: 'Include inactive customers',
    }];

    const showArchivedCustomerFilter = [{
      type: Enums.ControlType.Switch,
      label: 'Archived customers',
    }];

    return {
      IncludeClosed: includeClosedCustomerFilter,
      ShowArchived: showArchivedCustomerFilter,
    };
  };

  const firstUpdate = useRef(true);
  useEffect(() => {
    if (firstUpdate.current) {
      setTimeout(() => {
        firstUpdate.current = false;
      }, 500);

      return;
    }
    if (currentPage == 1) {
      searchCustomers();
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
      searchCustomers();
    }
  }, [currentPage]);

  function setSort(field) {
    setSortDirection(Helper.getSortDirection(field, sortField, sortDirection));
    setSortField(field);
  }

  async function searchCustomers() {

    setSearching(true);

    const searchRes = await CustomerService.getCustomerList(searchVal, pageSize, currentPage, sortField, sortDirection, activeFilterIds, ancillaryFilters, false, toast);

    let filtersConfigTemp = { ...filtersConfig };
    UCS.updateFilters(filtersConfigTemp, activeFilterIds, ancillaryFilters, sortField, sortDirection);
    UCS.saveConfigDebounced(filtersConfigTemp);
    setFiltersConfig(filtersConfigTemp);

    setCustomerResults(searchRes.Results);
    setTotalResults(searchRes.TotalResults);
    setSearching(false);
  }

  function rowClick(row) {
    Helper.nextRouter(Router.push, '/customer/[id]', '/customer/' + row.original.ID)
  }

  //SELECT ALL CUSTOMERS (ON PAGE)
  function selectAll() {
    if (customerResults.length == selectedCustomers.length) {
      setSelectedCustomers([]);
    } else {
      setSelectedCustomers(customerResults.map(result => result.ID));
    }
  }

  //ARCHIVE INDIVIDUAL CUSTOMER
  const [archiving, setArchiving] = useState(false);
  async function archiveCustomer(customer) {
    setArchiving(true);


    const customerArchive = await CustomerService.archiveCustomer(customer.ID, toast);

    if (customerArchive.ID) {
      toast.setToast({
        action: 'Undo',
        actionFunc: async function () {
          await CustomerService.archiveCustomer(customer.ID);
          searchCustomers();
        },
        message: `Customer ${customer.IsArchived ? "un-archived" : "archived"} successfully`,
        show: true,
        type: 'success'
      });
      searchCustomers();
    }
    setArchiving(false);
  }

  //ARCHIVE SELECTED CUSTOMERS
  const [archivingSelected, setArchivingSelected] = useState(false);
  async function archiveSelected() {
    setArchivingSelected(true);

    const customersArchive = await CustomerService.archiveSelectedCustomers(selectedCustomers, toast);

    if (customersArchive) {
      toast.setToast({
        action: 'Undo',
        actionFunc: async function () {
          await CustomerService.archiveSelectedCustomers(selectedCustomers);
          searchCustomers();
        },
        message: 'Customers archived successfully',
        show: true,
        type: 'success'
      })
      searchCustomers();
    }

    setArchivingSelected(false);
  }

  const [params, setParams] = useState({});

  useEffect(() => {
    setParams({
      searchPhrase: searchVal,
      SortExpression: sortField === CustomerService.checkboxColumnHeader ? CustomerService.checkboxColumn : sortField,
      SortDirection: sortDirection,
      CustomerGroupIDList: activeFilterIds ? activeFilterIds["CustomerGroups"] : null,
      CustomerStatusIDList: activeFilterIds ? activeFilterIds["CustomerStatuses"] : null,
      CustomerTypeIDList: activeFilterIds ? activeFilterIds["CustomerTypes"] : null,
      IncludeClosed: ancillaryFilters ? ancillaryFilters["IncludeClosed"] : null,
      ShowArchived: ancillaryFilters ? ancillaryFilters["ShowArchived"] : null,
    });
  }, [searchVal, activeFilterIds, ancillaryFilters, sortField, sortDirection]);

  const [showImportModal, setShowImportModal] = useState(false);

  const getTableActions = () => {
    let acts = [
      { text: "Edit", icon: "edit", function: (row) => Helper.nextRouter(Router.push, '/customer/[id]', `/customer/${row.ID}`) },
    ];

    if (accessStatus !== Enums.AccessStatus.LockedWithAccess && accessStatus !== Enums.AccessStatus.LockedWithOutAccess) {
      acts.push({ text: (archiving ? "Archiving" : "Archive"), icon: "archive-blue", function: archiveCustomer });
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
                placeholder="Search customer, company or contact details"
                resultsNum={customerResults.length}
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

            {selectedCustomers.length > 0
              ? <div className="select-actions">
                <Button text={archivingSelected ? "Archiving" : "Archive Selected"} icon="archive-blue" extraClasses="white-action" onClick={archivingSelected ? null : archiveSelected} />
              </div>
              : ""
            }

            {accessStatus !== Enums.AccessStatus.LockedWithAccess && accessStatus !== Enums.AccessStatus.LockedWithOutAccess ? <>
              {isMasterOfficeAdminPermission ? <>
                <div title="Import" className="import-container" onClick={() => setShowImportModal(true)}>
                  <img src={Enums.Icon.Upload} alt="icon" className="import-icon" />
                  {showImportModal ?
                    <CreateImport setShowModal={setShowImportModal} importType={Enums.ImportType.Customer} /> : ''
                  }
                </div>
              </> : ""}
              {exportPermission ? <>
                <div className="download">
                  <DownloadDropdown title={'Export'} options={[
                    { url: '/Customer/GetExportedCustomers', method: 'POST', params: { ...params, ExportAll: false }, label: 'Filtered export' },
                    { url: '/Customer/GetExportedCustomers', method: 'POST', params: { ...params, ExportAll: true }, label: 'Full export' },
                  ]} />
                </div>
              </> : ""}
            </> : ''}
            <ColumnSelect options={availableColumns} selected={selectedColumns} requiredColumns={requiredColumns} setColumn={setColumn} setReorder={setReorder}
              resetColumnWidths={resetColumnWidths} />
          </div>
        </NoSSR>
      </div>

      <div className={"no-items" + (customerResults.length == 0 ? " no-items-visible" : "")}>
        <div className={"loading-overlay" + (searching ? " loading-overlay-visible" : "")}>
          <div className="loader"></div>
        </div>
        <img src="/customer-list.svg" alt="Customer List" />
        <h3>No customers found</h3>
        <p>If you can't find a customer, try another search or create a new one.</p>
        <a href="/customer/create"><img src="/icons/plus-circle-blue.svg" alt="plus" /> Add new customer</a>
        <img className="wave" src="/wave.svg" alt="wave" />
      </div>

      {customerResults.length != 0 ? <KendoTable
        searching={searching}
        actions={getTableActions()}
        columns={columns}
        data={customerResults}
        rowClick={rowClick}
        setSort={setSort}
        sortField={sortField}
        sortDirection={sortDirection}
        type="Job"
        onColumnResize={onColumnResize}
        canSelectItems={true}
        selectedItems={selectedCustomers}
        setSelectedItems={setSelectedCustomers}
        heightOffset={360}
        highlightColumnName="CustomerCode"
        highlightColumnLink="/customer/"
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
        .switch-container {
          margin-right: 1rem;
          width: 20rem;
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

export default CustomerList;
