import React, { useState, useEffect, useRef, useMemo } from 'react';
import Search from '../../search';
import Table from '../../table';
import Pagination from '../../pagination';
import * as Enums from '../../../utils/enums';
import Fetch from '../../../utils/Fetch';
import Storage from '../../../utils/storage';
import Helper from '../../../utils/helper';
import Router from 'next/router';

function QuoteTab({ quoteTabType, quoteStatus, columns, searchFilters, ancillarySearchFilters, setSearchParams, tenantID, customerID, apiUrlOverride }) {

  const [quoteResults, setQuoteResults] = useState([]);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState('');
  const [sortDirection, setSortDirection] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const [activeFilterIds, setActiveFilterIds] = useState({ Modules: [], Employees: [], Stores: [] });
  const [ancillaryFilters, setAncillaryFilters] = useState({ IncludeClosed: false });

  const handleAncillaryFilterChange = (result) => {
    setAncillaryFilters({ IncludeClosed: result.checked });
  };

  const [pageSize, setPageSize] = useState(10);
  const getPageSize = () => {
    let size = Storage.getCookie(Enums.Cookie.pageSize);
    if (size > 0) {
      setPageSize(size);
    }
  };

  useEffect(() => {
    getPageSize();
  }, []);

  const setSort = (field) => {
    setSortDirection(Helper.getSortDirection(field, sortField, sortDirection));
    setSortField(field);
  };

  useEffect(() => {
    if (currentPage == 1) {
      searchQuotes();
    } else {
      setCurrentPage(1);
    }
  }, [sortField, sortDirection, activeFilterIds, ancillaryFilters, pageSize, quoteTabType]);

  useEffect(() => {
    setSearchParams({
      searchPhrase: searchVal,
      sortExpression: sortField,
      sortDirection: sortDirection,
      ModuleIDList: activeFilterIds["Modules"],
      QuoteStatusIDList: quoteStatus,
      EmployeeIDList: activeFilterIds["Employees"],
      StoreIDList: activeFilterIds["Stores"],
      IncludeClosed: ancillaryFilters["IncludeClosed"],
    });
  }, [searchVal, sortField, sortDirection, activeFilterIds, ancillaryFilters, quoteTabType]);

  useEffect(() => {
    searchQuotes();
  }, [currentPage]);

  const searchQuotes = async () => {

    setSearching(true);

    const quotes = await Fetch.post({
      url: `/CustomerZone/GetQuotes`,
      params: {
        pageSize: pageSize,
        pageIndex: (currentPage - 1),
        searchPhrase: searchVal,
        sortExpression: sortField,
        sortDirection: sortDirection,
        ModuleIDList: activeFilterIds["Modules"],
        QuoteStatusIDList: quoteStatus,
        StoreIDList: activeFilterIds["Stores"],
        EmployeeIDList: activeFilterIds["Employees"],
        IncludeClosed: ancillaryFilters["IncludeClosed"],
        PopulatedList: false,
      },
      tenantID: tenantID,
      customerID: customerID,
      apiUrlOverride: apiUrlOverride,
    });

    setQuoteResults(quotes.Results);
    setTotalResults(quotes.TotalResults);
    setSearching(false);
  };

  const rowClick = (row) => {
    Helper.nextRouter(Router.push, `/customerzone/viewquote?t=${tenantID}&c=${customerID}&i=${row.original.ID}`);
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
            setActiveFilterIds={setActiveFilterIds} />
        </div>
      </div>

      <div className={"no-items" + (quoteResults.length == 0 ? " no-items-visible" : "")}>
        <div className={"loading-overlay" + (searching ? " loading-overlay-visible" : "")}>
          <div className="loader"></div>
        </div>
        <img src="/quotes-box.svg" alt="Quote Folder" />
        <h3>No quotes found</h3>
        <img className="wave" src="/wave.svg" alt="wave" />
      </div>

      <div className={"table-container" + (quoteResults.length != 0 ? " table-container-visible" : "")}>
        <div className={"loading-overlay" + (searching ? " loading-overlay-visible" : "")}>
          <div className="loader"></div>
        </div>
        <Table columns={columns} data={quoteResults} setSort={setSort} sortField={sortField} sortDirection={sortDirection} rowClick={rowClick} />
      </div>
      <Pagination pageSize={pageSize} setPageSize={setPageSize} currentPage={currentPage} totalResults={totalResults} setCurrentPage={setCurrentPage} />

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
