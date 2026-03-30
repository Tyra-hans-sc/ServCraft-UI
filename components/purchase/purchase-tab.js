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

function PurchaseTab({ purchaseOrderStatus, columns, searchFilters, ancillarySearchFilters, setSearchParams,
  filtersConfig, setFiltersConfig, activeFilterIdsConfig, ancillaryFiltersConfig, onColumnResize, selectedPurchaseOrders, setSelectedPurchaseOrders }) {

  const [firstLoadComplete, setFirstLoadComplete] = useState(false);
  const [purchaseOrderResults, setPurchaseOrderResults] = useState([]);
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
  const oldsearchVal = useRef(searchVal);

  useEffect(() => {

    let updated = Helper.jsonCompare(oldsortField.current, sortField)
      || Helper.jsonCompare(oldsortDirection.current, sortDirection)
      || Helper.jsonCompare(oldactiveFilterIds.current, activeFilterIds)
      || Helper.jsonCompare(oldancillaryFilters.current, ancillaryFilters)
      || Helper.jsonCompare(oldpageSize.current, pageSize)
      || Helper.jsonCompare(oldsearchVal.current, searchVal);

    oldsortField.current = sortField;
    oldsortDirection.current = sortDirection;
    oldactiveFilterIds.current = activeFilterIds;
    oldancillaryFilters.current = ancillaryFilters;
    oldpageSize.current = pageSize;
    oldsearchVal.current = searchVal;

    if (updated) {
      if (currentPage == 1) {
        searchPurchaseOrders();
      } else {
        setCurrentPage(1);
      }
    }
  }, [searchVal, sortField, sortDirection, activeFilterIds, ancillaryFilters, pageSize]);

  useEffect(() => {
    setSearchParams({
      searchPhrase: searchVal,
      sortExpression: sortField,
      sortDirection: sortDirection,
      ModuleIDList: activeFilterIds["Modules"],
      PurchaseOrderStatusIDList: ancillaryFilters["IncludeCancelled"] ? [...purchaseOrderStatus, Enums.getEnumStringValue(Enums.PurchaseOrderStatus, Enums.PurchaseOrderStatus.Cancelled)] : purchaseOrderStatus,
      EmployeeIDList: activeFilterIds["Employees"],
      StoreIDList: activeFilterIds["Stores"],
      StartDate: activeFilterIds?.DateRange && activeFilterIds.DateRange[0],
      EndDate: activeFilterIds?.DateRange && activeFilterIds.DateRange[1]
    });
  }, [searchVal, sortField, sortDirection, activeFilterIds, ancillaryFilters]);

  useEffect(() => {
    searchPurchaseOrders();
  }, [currentPage]);

  const searchPurchaseOrders = async () => {

    setSearching(true);

    const purchaseOrders = await Fetch.post({
      url: `/PurchaseOrder/GetPurchaseOrders`,
      params: {
        pageSize: pageSize,
        pageIndex: (currentPage - 1),
        searchPhrase: searchVal,
        sortExpression: sortField,
        sortDirection: sortDirection,
        ModuleIDList: activeFilterIds["Modules"],
        PurchaseOrderStatusIDList: ancillaryFilters["IncludeCancelled"] ? [...purchaseOrderStatus, Enums.getEnumStringValue(Enums.PurchaseOrderStatus, Enums.PurchaseOrderStatus.Cancelled)] : purchaseOrderStatus,
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

    setPurchaseOrderResults(purchaseOrders.Results);
    setTotalResults(purchaseOrders.TotalResults);
    setFirstLoadComplete(true);
    setSearching(false);
  };

  const rowClick = (row) => {
    Helper.nextRouter(Router.push, '/purchase/[id]', `/purchase/${row.original.ID}`);
  };

  return (
    <div className="container">
      <div className="row">
        <div className="search-container">
          <Search
            placeholder="Search Purchase Number"
            resultsNum={purchaseOrderResults.length}
            filters={searchFilters}
            searchVal={searchVal}
            setSearchVal={setSearchVal}
            ancillaryFilters={ancillarySearchFilters}
            setAncillaryFilters={handleAncillaryFilterChange}
            setActiveFilterIds={setActiveFilterIds}
            filtersConfig={filtersConfig} />
        </div>
      </div>

      <div className={"no-items" + (purchaseOrderResults.length == 0 && !searching && firstLoadComplete ? " no-items-visible" : "")}>
        <div className={"loading-overlay" + (searching ? " loading-overlay-visible" : "")}>
          <div className="loader"></div>
        </div>
        <img src="/quotes-box.svg" alt="Purchases Folder" />
        <h3>No purchase orders found</h3>
        <p>If you can't find a purchase order, try another search or create a new one.</p>
        <a href="/purchase/create"><img src="/icons/plus-circle-blue.svg" alt="plus" /> Add new purchase order</a>
        <img className="wave" src="/wave.svg" alt="wave" />
      </div>

      <div className="margin-top">
        {purchaseOrderResults.length != 0 ? <KendoTable
          searching={searching}
          actions={[
            { text: "Edit", icon: "edit", function: (row) => Helper.nextRouter(Router.push, '/purchase/[id]', `/purchase/${row.ID}`) },
          ]}
          columns={columns}
          data={purchaseOrderResults}
          rowClick={rowClick}
          setSort={setSort}
          sortField={sortField}
          sortDirection={sortDirection}
          type="PurchaseOrder"
          // for table resize columns
          onColumnResize={onColumnResize}
          // for table resize columns
          canSelectItems={true}
          selectedItems={selectedPurchaseOrders}
          setSelectedItems={setSelectedPurchaseOrders}
          heightOffset={420}
          highlightColumnName="PurchaseOrderNumber"
          highlightColumnLink="/purchase/"
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

export default PurchaseTab;
