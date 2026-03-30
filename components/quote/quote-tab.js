import React, { useState, useEffect, useRef, useMemo } from 'react';
import Search from '../search';
import Table from '../table';
import KendoPager from '../../components/kendo/kendo-pager';
import * as Enums from '../../utils/enums';
import Fetch from '../../utils/Fetch';
import Storage from '../../utils/storage';
import Helper from '../../utils/helper';
import Router from 'next/router';
// filtersConfig code
import UCS from '../../services/option/user-config-service';
// filtersConfig code
import KendoTable from '../kendo/kendo-table';

function QuoteTab({ quoteTabType, quoteStatus, columns, searchFilters, ancillarySearchFilters, setSearchParams, filtersConfig, setFiltersConfig,
  activeFilterIdsConfig, ancillaryFiltersConfig, onColumnResize, selectedQuotes, setSelectedQuotes }) {

  const [firstLoadComplete, setFirstLoadComplete] = useState(false);
  const [quoteResults, setQuoteResults] = useState([]);
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
      setAncillaryFilters({ IncludeCancelled: false, ExpiredQuotes: false });
    } else {
      if (result.key == "IncludeCancelled") {
        setAncillaryFilters({ ExpiredQuotes: ancillaryFilters.ExpiredQuotes, IncludeCancelled: result.checked });
      } else if (result.key == "ExpiredQuotes") {
        setAncillaryFilters({ ExpiredQuotes: result.checked, IncludeCancelled: ancillaryFilters.IncludeCancelled });
      }
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
  const oldquoteTabType = useRef(quoteTabType);
  const oldsearchVal = useRef(searchVal);
  useEffect(() => {

    let updated = Helper.jsonCompare(oldsortField.current, sortField)
      || Helper.jsonCompare(oldsortDirection.current, sortDirection)
      || Helper.jsonCompare(oldactiveFilterIds.current, activeFilterIds)
      || Helper.jsonCompare(oldancillaryFilters.current, ancillaryFilters)
      || Helper.jsonCompare(oldpageSize.current, pageSize)
      || Helper.jsonCompare(oldquoteTabType.current, quoteTabType)
      || Helper.jsonCompare(oldsearchVal.current, searchVal);

    oldsortField.current = sortField;
    oldsortDirection.current = sortDirection;
    oldactiveFilterIds.current = activeFilterIds;
    oldancillaryFilters.current = ancillaryFilters;
    oldpageSize.current = pageSize;
    oldquoteTabType.current = quoteTabType;
    oldsearchVal.current = searchVal;

    if (updated) {
      if (currentPage == 1) {
        searchQuotes();
      } else {
        setCurrentPage(1);
      }
    }
  }, [searchVal, sortField, sortDirection, activeFilterIds, ancillaryFilters, pageSize, quoteTabType]);

  useEffect(() => {
    searchQuotes();
  }, [currentPage]);

  const checkboxColumnHeader = 'Number';
  const checkboxColumn = 'QuoteNumber';

  useEffect(() => {
    setSearchParams({
      searchPhrase: searchVal,
      sortExpression: sortField === checkboxColumnHeader ? checkboxColumn : sortField,
      sortDirection: sortDirection,
      ModuleIDList: activeFilterIds["Modules"],
      QuoteStatusIDList: quoteStatus,
      EmployeeIDList: activeFilterIds["Employees"],
      StoreIDList: activeFilterIds["Stores"],
      IncludeCancelled: ancillaryFilters["IncludeCancelled"],
      HideExpired: ancillaryFilters["ExpiredQuotes"],
      StartDate: activeFilterIds?.DateRange && activeFilterIds.DateRange[0],
      EndDate: activeFilterIds?.DateRange && activeFilterIds.DateRange[1]
    });
  }, [searchVal, sortField, sortDirection, activeFilterIds, ancillaryFilters, quoteTabType]);


  const searchQuotes = async () => {

    setSearching(true);

    const quotes = await Fetch.post({
      url: `/Quote/GetQuotes`,
      params: {
        pageSize: pageSize,
        pageIndex: (currentPage - 1),
        searchPhrase: searchVal,
        sortExpression: sortField === checkboxColumnHeader ? checkboxColumn : sortField,
        sortDirection: sortDirection,
        ModuleIDList: activeFilterIds["Modules"],
        QuoteStatusIDList: quoteStatus,
        EmployeeIDList: activeFilterIds["Employees"],
        StoreIDList: activeFilterIds["Stores"],
        IncludeCancelled: ancillaryFilters["IncludeCancelled"],
        HideExpired: ancillaryFilters["ExpiredQuotes"],
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

    setQuoteResults(quotes.Results);
    setTotalResults(quotes.TotalResults);
    setFirstLoadComplete(true);
    setSearching(false);
  };

  const rowClick = (row) => {
    Helper.nextRouter(Router.push, '/quote/[id]', `/quote/${row.original.ID}`);
  };

  return (
    <div className="container">
      <div className="row">
        <div className="search-container">
          <Search
            placeholder="Search Quote Number, Customer"
            resultsNum={quoteResults.length}
            filters={searchFilters}
            searchVal={searchVal}
            setSearchVal={setSearchVal}
            ancillaryFilters={ancillarySearchFilters}
            setAncillaryFilters={handleAncillaryFilterChange}
            setActiveFilterIds={setActiveFilterIds}
            filtersConfig={filtersConfig} />
        </div>
      </div>

      <div className={"no-items" + (quoteResults.length == 0 && !searching && firstLoadComplete ? " no-items-visible" : "")}>
        <div className={"loading-overlay" + (searching ? " loading-overlay-visible" : "")}>
          <div className="loader"></div>
        </div>
        <img src="/quotes-box.svg" alt="Quote Folder" />
        <h3>No quotes found</h3>
        <p>If you can't find a quote, try another search or create a new one.</p>
        <a href="/quote/create"><img src="/icons/plus-circle-blue.svg" alt="plus" /> Add new quote</a>
        <img className="wave" src="/wave.svg" alt="wave" />
      </div>

      <div className="margin-top" >
        {quoteResults.length != 0 ? <KendoTable
          searching={searching}
          actions={[
            { text: "View", icon: "eye", function: (row) => Helper.nextRouter(Router.push, '/quote/view/[id]', `/quote/view/${row.ID}`) },
            { text: "Edit", icon: "edit", function: (row) => Helper.nextRouter(Router.push, '/quote/[id]', `/quote/${row.ID}`) },
          ]}
          columns={columns}
          data={quoteResults}
          rowClick={rowClick}
          setSort={setSort}
          sortField={sortField}
          sortDirection={sortDirection}
          type="Quote"
          onColumnResize={onColumnResize}
          canSelectItems={true}
          selectedItems={selectedQuotes}
          setSelectedItems={setSelectedQuotes}
          heightOffset={420}
          highlightColumnName="QuoteNumber"
          highlightColumnLink="/quote/"
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
        .button-container {
          flex-shrink: 0;
          width: 10rem;
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
          margin-right: 1rem;
          width: 3rem;
        }
      `}</style>
    </div>
  );
}

export default QuoteTab;
