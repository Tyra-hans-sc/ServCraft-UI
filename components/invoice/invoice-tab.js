import React, { useState, useEffect, useRef, useMemo } from 'react';
import Search from '../search';
import Table from '../table';
import KendoPager from '../../components/kendo/kendo-pager';
import Pagination from '../pagination';
import * as Enums from '../../utils/enums';
import Fetch from '../../utils/Fetch';
import Storage from '../../utils/storage';
import Helper from '../../utils/helper';
import Router from 'next/router';
// filtersConfig code
import UCS from '../../services/option/user-config-service';
import KendoTable from '../kendo/kendo-table';
// filtersConfig code

function InvoiceTab({ invoiceTabType, invoiceStatus, columns, searchFilters, ancillarySearchFilters, setSearchParams,
  accessStatus, filtersConfig, setFiltersConfig, activeFilterIdsConfig, ancillaryFiltersConfig, onColumnResize, selectedInvoices, setSelectedInvoices }) {

  const [firstLoadComplete, setFirstLoadComplete] = useState(false);
  const [invoiceResults, setInvoiceResults] = useState([]);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState(UCS.getFilterValues(filtersConfig, activeFilterIdsConfig[0], activeFilterIdsConfig[1], ancillaryFiltersConfig[0], ancillaryFiltersConfig[1])[2]);
  const [sortDirection, setSortDirection] = useState(UCS.getFilterValues(filtersConfig, activeFilterIdsConfig[0], activeFilterIdsConfig[1], ancillaryFiltersConfig[0], ancillaryFiltersConfig[1])[3]);
  const [searching, setSearching] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const [activeFilterIds, setActiveFilterIds] = useState(UCS.getFilterValues(filtersConfig, activeFilterIdsConfig[0], activeFilterIdsConfig[1], ancillaryFiltersConfig[0], ancillaryFiltersConfig[1])[0]);
  const [ancillaryFilters, setAncillaryFilters] = useState(UCS.getFilterValues(filtersConfig, activeFilterIdsConfig[0], activeFilterIdsConfig[1], ancillaryFiltersConfig[0], ancillaryFiltersConfig[1])[1]);

  const handleAncillaryFilterChange = (result) => {
    if (result.reset) {
      setAncillaryFilters({ IncludeCancelled: false });
    } else {
      setAncillaryFilters({ IncludeCancelled: result.checked });
    }
  };

  const [pageSize, setPageSize] = useState(Storage.getCookie(Enums.Cookie.pageSize) ? parseInt(Storage.getCookie(Enums.Cookie.pageSize)) : 10);

  const pageSizeChanged = (size) => {
    if (size !== pageSize) {
      setPageSize(size);
    }
  };

  const pageChanged = (page) => {
    setCurrentPage(page);
  };

  const setSort = (field) => {
    setSortDirection(Helper.getSortDirection(field, sortField, sortDirection));
    setSortField(field);
  };

  const oldsortField = useRef(sortField);
  const oldsortDirection = useRef(sortDirection);
  const oldactiveFilterIds = useRef(activeFilterIds);
  const oldancillaryFilters = useRef(ancillaryFilters);
  const oldpageSize = useRef(pageSize);
  const oldinvoiceTabType = useRef(invoiceTabType);
  const oldsearchVal = useRef(searchVal);

  useEffect(() => {

    let updated = Helper.jsonCompare(oldsortField.current, sortField)
      || Helper.jsonCompare(oldsortDirection.current, sortDirection)
      || Helper.jsonCompare(oldactiveFilterIds.current, activeFilterIds)
      || Helper.jsonCompare(oldancillaryFilters.current, ancillaryFilters)
      || Helper.jsonCompare(oldpageSize.current, pageSize)
      || Helper.jsonCompare(oldinvoiceTabType.current, invoiceTabType)
      || Helper.jsonCompare(oldsearchVal.current, searchVal);

    oldsortField.current = sortField;
    oldsortDirection.current = sortDirection;
    oldactiveFilterIds.current = activeFilterIds;
    oldancillaryFilters.current = ancillaryFilters;
    oldpageSize.current = pageSize;
    oldinvoiceTabType.current = invoiceTabType;
    oldsearchVal.current = searchVal;

    if (updated) {
      if (currentPage == 1) {
        searchInvoices();
      } else {
        setCurrentPage(1);
      }
    }
  }, [searchVal, sortField, sortDirection, activeFilterIds, ancillaryFilters, pageSize, invoiceTabType]);

  useEffect(() => {
    setSearchParams({
      searchPhrase: searchVal,
      sortExpression: sortField === checkboxColumnHeader ? checkboxColumn : sortField,
      sortDirection: sortDirection,
      ModuleIDList: activeFilterIds["Modules"],
      InvoiceStatusIDList: ancillaryFilters["IncludeCancelled"] ? [...invoiceStatus, Enums.getEnumStringValue(Enums.InvoiceStatus, Enums.InvoiceStatus.Cancelled)] : invoiceStatus,
      EmployeeIDList: activeFilterIds["Employees"],
      StoreIDList: activeFilterIds["Stores"],
      StartDate: activeFilterIds?.DateRange && activeFilterIds.DateRange[0],
      EndDate: activeFilterIds?.DateRange && activeFilterIds.DateRange[1]
    });
  }, [searchVal, sortField, sortDirection, activeFilterIds, ancillaryFilters, invoiceTabType]);

  useEffect(() => {
    searchInvoices();
  }, [currentPage]);

  const checkboxColumnHeader = 'Number';
  const checkboxColumn = 'InvoiceNumber';

  const searchInvoices = async () => {

    setSearching(true);

    const invoices = await Fetch.post({
      url: `/Invoice/GetInvoices`,
      params: {
        pageSize: pageSize,
        pageIndex: (currentPage - 1),
        searchPhrase: searchVal,
        sortExpression: sortField === checkboxColumnHeader ? checkboxColumn : sortField,
        sortDirection: sortDirection,
        ModuleIDList: activeFilterIds["Modules"],
        InvoiceStatusIDList: ancillaryFilters["IncludeCancelled"] ? [...invoiceStatus, Enums.getEnumStringValue(Enums.InvoiceStatus, Enums.InvoiceStatus.Cancelled)] : invoiceStatus,
        EmployeeIDList: activeFilterIds["Employees"],
        StoreIDList: activeFilterIds["Stores"],
        StartDate: activeFilterIds?.DateRange && activeFilterIds.DateRange[0],
        EndDate: activeFilterIds?.DateRange && activeFilterIds.DateRange[1]
      }
    });

    // filtersConfig code
    let filtersConfigTemp = { ...filtersConfig };
    UCS.updateFilters(filtersConfigTemp, activeFilterIds, ancillaryFilters, sortField, sortDirection);
    UCS.saveConfigDebounced(filtersConfigTemp);
    setFiltersConfig(filtersConfigTemp);
    // filtersConfig code

    setInvoiceResults(invoices.Results);
    setTotalResults(invoices.TotalResults);
    setFirstLoadComplete(true);
    setSearching(false);
  };

  const rowClick = (row) => {
    if (accessStatus !== Enums.AccessStatus.LockedWithAccess && accessStatus !== Enums.AccessStatus.LockedWithOutAccess) {
      Helper.nextRouter(Router.push, '/invoice/[id]', `/invoice/${row.original.ID}`);
    }
  };

  const editInvoice = (row) => {
    Helper.nextRouter(Router.push, '/invoice/[id]', `/invoice/${row.ID}`);
  };

  const getTableActions = () => {
    let acts = [{ text: "View", icon: "eye", function: (row) => Helper.nextRouter(Router.push, '/invoice/view/[id]', `/invoice/view/${row.ID}`) }];

    if (accessStatus !== Enums.AccessStatus.LockedWithAccess && accessStatus !== Enums.AccessStatus.LockedWithOutAccess) {
      acts.push({ text: "Edit", icon: "edit", function: editInvoice });
    }

    return acts;
  };

  return (
    <div className="container">
      <div className="row">
        <div className="search-container">
          <Search
            placeholder="Search Invoice Number, Customer"
            resultsNum={invoiceResults.length}
            filters={searchFilters}
            searchVal={searchVal}
            setSearchVal={setSearchVal}
            ancillaryFilters={ancillarySearchFilters}
            setAncillaryFilters={handleAncillaryFilterChange}
            setActiveFilterIds={setActiveFilterIds}
            filtersConfig={filtersConfig} />
        </div>
      </div>

      <div className={"no-items" + (invoiceResults.length == 0 && !searching && firstLoadComplete ? " no-items-visible" : "")}>
        <div className={"loading-overlay" + (searching ? " loading-overlay-visible" : "")}>
          <div className="loader"></div>
        </div>
        <img src="/quotes-box.svg" alt="Invoice Folder" />
        <h3>No invoices found</h3>
        <p>If you can't find a invoice, try another search or create a new one.</p>
        {accessStatus !== Enums.AccessStatus.LockedWithAccess && accessStatus !== Enums.AccessStatus.LockedWithOutAccess ?
          <a href="/invoice/create"><img src="/icons/plus-circle-blue.svg" alt="plus" /> Add new invoice</a> : ''}
        <img className="wave" src="/wave.svg" alt="wave" />
      </div>

      {/* <div className={"table-container" + (invoiceResults.length != 0 ? " table-container-visible" : "")}>
        <div className={"loading-overlay" + (searching ? " loading-overlay-visible" : "")}>
          <div className="loader"></div>
        </div>
        <Table actions={getTableActions()}
          columns={columns} data={invoiceResults} setSort={setSort} sortField={sortField} sortDirection={sortDirection} rowClick={rowClick}
          // for table resize columns
          onColumnResize={onColumnResize}
        // for table resize columns
        />
      </div> */}
      <div className="margin-top" >
        {invoiceResults.length != 0 ? <KendoTable
          searching={searching}
          actions={getTableActions()}
          columns={columns}
          data={invoiceResults}
          rowClick={rowClick}
          setSort={setSort}
          sortField={sortField}
          sortDirection={sortDirection}
          type="Invoice"
          // for table resize columns
          onColumnResize={onColumnResize}
          // for table resize columns
          canSelectItems={true}
          selectedItems={selectedInvoices}
          setSelectedItems={setSelectedInvoices}
          heightOffset={420}
          highlightColumnName="InvoiceNumber"
          highlightColumnLink="/invoice/"
        /> : ""}
      </div>

      <KendoPager pageSizeChanged={pageSizeChanged} pageChanged={pageChanged} totalResults={totalResults} searchValue={searchVal} parentPageNumber={currentPage} />

      <style jsx>{`
        .container {
          display: flex;
          flex-direction: column;
          height: 100%;
          margin-top: 1rem;
          position: relative;
        }
        .column {
          width: 100%;
        }
        .column-margin {
          margin-left: 24px;
        }
        .margin-top {
          margin-top: 0.5rem;
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
        .search-container :global(.search) {
          width: 528px;
        }
        a {
          text-decoration: none;
        }
        .download {
          margin-right: 1rem;
          width: 3rem;
        }
      `}</style>
    </div>
  );
}

export default InvoiceTab;
