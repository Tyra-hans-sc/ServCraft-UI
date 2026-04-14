import React, { useState, useRef, useEffect, useContext } from 'react';
import { colors, fontSizes, layout, fontFamily } from '../theme';
import useOutsideClick from "../hooks/useOutsideClick";
import ToastContext from '../utils/toast-context';
import Fetch from '../utils/Fetch';
import time from '../utils/time';
import Router from 'next/router';
import Helper from '../utils/helper';
import CellBool from './cells/bool';
import CellStatus from './cells/status';
import CellStatusOld from './cells/status-old';

function GlobalSearch(props) {

  const searchRef = useRef();

  const toast = useContext(ToastContext);
  const [searchVal, setSearchVal] = useState('');
  const [searchActive, setSearchActive] = useState(false);
  const [searchCleared, setSearchCleared] = useState(false);
  const [searching, setSearching] = useState(false);
  const [searchFocus, setSearchFocus] = useState(false);
  const [searchResults, setSearchResults] = useState();

  const clickRef = useRef();

  useOutsideClick(clickRef, () => {
    if (searchFocus) {
      setSearchFocus(false);
      if (searchVal == '') {
        setSearchActive(false);
        setSearchCleared(false);
      }
    }
    else {
      if (searchVal == '' && searchCleared) {
        setSearchActive(false);
        setSearchCleared(false);
      }
    }
  });

  async function submit() {
    if (searchVal.length > 2) {
      setSearching(true)
      const search = await Fetch.get({
        url: '/dashboard/globalsearch',
        params: {
          search: searchVal
        },
        toastCtx: toast
      });
      if (search) {
        setSearchResults(search);
      }
      setSearching(false);
    } else {
      setSearchResults(undefined);
    }
  }

  const timerRef = useRef(null);

  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => { submit() }, 300);
  }, [searchVal]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      submit();
    }
  };

  function clearSearch() {
    setSearchVal('');
    setSearchResults(undefined);
    setSearchFocus(true);
    setSearchCleared(true);
  }

  function openSearch() {
    setSearchActive(true);
    setSearchFocus(true);
    setSearchCleared(false);
    if (searchRef && searchRef.current) {
      searchRef.current.focus();
    }
  }

  const closeSearch = () => {
    setSearchVal('');
    setSearchResults(undefined);
    setSearchFocus(true);
    setSearchCleared(true);
    setSearchActive(false);
  };

  function navigate(module, id) {
    if (typeof window != 'undefined') {
      // force the window to navigate
      window.location = module + id;
    } else {
      // previous best option
      Helper.nextRouter(Router.replace, module + '[id]', module + id);
    }



    //Router.reload();
    //Router.push('/' + module + '[id]', module + id, { shallow: true });
    //Router.push(`${module}[id]`, module + id, { shallow: true });
  }

  function getInitials(name) {
    const names = name.split(' ');
    if (names.length > 1) {
      return names[0][0] + names[1][0];
    }
    return name[0];
  }

  function formatCurrency(value) {
    let currValue = value.toFixed(2);
    let spacePos = currValue.indexOf('.');
    while (spacePos > 3) {
      spacePos = spacePos - 3;
      currValue = [currValue.slice(0, spacePos), ' ', currValue.slice(spacePos)].join('');
    }
    currValue = 'R' + currValue;
    return currValue;
  }

  return (
    <div className={`search-container ${searchActive ? "search-container-show" : ""}`} ref={searchActive ? clickRef : null}>
      <img className="search-open" src="/icons/search-white.svg" alt="search button" onClick={openSearch} />
      <div className="search">
        <img className="search-img" src="/icons/search-blue.svg" alt="search button" onClick={closeSearch} />
        <input
          ref={searchRef}
          onChange={(e) => setSearchVal(e.target.value)}
          value={searchVal}
          placeholder={"Search using job numbers, serial or contact information "}
          onKeyDown={handleKeyDown}
          onFocus={() => setSearchFocus(true)}
        />
        <div className='action'>
          {searching
            ? <div className="loader"></div>
            : searchVal
              ? <img src="/icons/cross-blue.svg" alt="clear" className="clear" onClick={clearSearch} />
              : ""
          }
        </div>
      </div>
      {searchFocus && searchResults
        ? <div className="results">
          {searchResults.JobList && searchResults.JobList.length > 0
            ? <div className="result-set">
              <h1>Jobs</h1>
              <table className="row-table transform-x">
                {searchResults.JobList.slice(0, 3).map((job, key) =>
                  <tr className="job" key={key} onClick={() => navigate('/job/', job.ID)}>
                    <td className="job-item">
                      <img src="/icons/jobs-blue.svg" alt="clear" />
                      {job.JobCardNumber}
                    </td>
                    <td className="job-item">
                      {job.EmployeeNameList.length > 0
                        ? job.EmployeeNameList.map((name) => {
                          return (
                            <div className="inline-block">
                              <div className="customer-initials no-margin">
                                {getInitials(name)}
                              </div>
                            </div>
                          )
                        })
                        : "Not Assigned"
                      }
                    </td>
                    <td className="job-item">
                      {job.CustomerName}
                    </td>
                    <td className="job-item">
                      <CellStatus value={job.JobCardStatusDisplay} />
                    </td>
                    <td className="job-item">
                      {time.formatDate(job.StartDate)}
                      <p>Start Date</p>
                    </td>
                    <td className="job-item">
                      {job.JobTypeName ? job.JobTypeName : "N/A"}
                      <p>Job Type</p>
                    </td>
                    <td className="width-96">
                      <CellBool value={!job.IsClosed} />
                      <p>{job.IsClosed ? 'Closed' : 'Open'}</p>
                    </td>
                  </tr>
                )}
              </table>
            </div>
            : ''
          }

          {searchResults.CustomerList && searchResults.CustomerList.length > 0
            ? <div className="result-set">
              <h1>Customers</h1>
              <table className="row-table">

                {searchResults.CustomerList.slice(0, 3).map((customer, key) =>
                  <tr className="customer" key={key} onClick={() => navigate('/customer/', customer.ID)}>

                    <td className="width-48">
                      <div className="customer-initials">
                        {getInitials(customer.CustomerName)}
                      </div>

                    </td>
                    <td className="job-item width-100">
                      <div className="customer-details">
                        <span className="bolded">{customer.CustomerName}</span>
                        <p>{customer.PrimaryContact}</p>
                        <p>{customer.MobileNumber}</p>
                      </div>
                    </td>
                    <td className="width-96">
                      <CellBool value={!customer.IsClosed} />
                      <p>{customer.IsClosed ? 'Closed' : 'Open'}</p>
                    </td>
                  </tr>
                )}
              </table>
            </div>
            : ''
          }
          {searchResults.QueryList && searchResults.QueryList.length > 0
            ? <div className="result-set">
              <h1>Queries</h1>
              <table className="row-table transform-x">
                {searchResults.QueryList.slice(0, 3).map((query, key) =>
                  <tr className="job" key={key} onClick={() => navigate('/query/', query.ID)}>
                    <td className="job-item">
                      <img src="/icons/queries-blue.svg" alt="clear" />
                      {query.QueryCode}
                    </td>
                    <td className="job-item">
                      {!Helper.isNullOrUndefined(query.EmployeeFullName)
                        ? <div className="customer-initials no-margin">
                          {getInitials(query.EmployeeFullName)}
                        </div>
                        : "Not Assigned"
                      }
                    </td>
                    <td className="job-item">
                      {query.CustomerName}
                    </td>
                    <td className="job-item">
                      <CellStatus value={query.QueryStatusDescription} />
                      <p>{query.QueryTypeDescription}</p>
                    </td>
                    <td className="width-96">
                      <CellBool value={!query.IsClosed} />
                      <p>{query.IsClosed ? 'Closed' : 'Open'}</p>
                    </td>
                  </tr>
                )}
              </table>
            </div>
            : ''
          }
          {searchResults.QuoteList && searchResults.QuoteList.length > 0
            ? <div className="result-set">
              <h1>Quotes</h1>
              <table className="row-table transform-x">
                {searchResults.QuoteList.slice(0, 3).map((quote, key) =>
                  <tr className="job" key={key} onClick={() => navigate('/quote/', quote.ID)}>
                    <td className="job-item">
                      <img src="/icons/quotes-blue.svg" alt="clear" />
                      {quote.QuoteNumber}
                    </td>
                    <td className="job-item">
                      {!Helper.isNullOrUndefined(quote.EmployeeFullName)
                        ? <div className="customer-initials no-margin">
                          {getInitials(quote.EmployeeFullName)}
                        </div>
                        : "Not Assigned"
                      }
                    </td>
                    <td className="job-item">
                      <p>{quote.CustomerName}</p>
                    </td>
                    <td className="job-item">
                      <CellStatusOld value={quote.QuoteStatus} valueEnum={'QuoteStatus'} />
                    </td>
                    <td className="job-item">
                      {quote.Reference}
                      <p>{formatCurrency(quote.TotalInclusive)}</p>
                    </td>
                    <td className="width-96">
                      <CellBool value={!quote.IsClosed} />
                      <p>{quote.IsClosed ? 'Closed' : 'Open'}</p>
                    </td>
                  </tr>
                )}
              </table>
            </div>
            : ''
          }

          {searchResults.InvoiceList && searchResults.InvoiceList.length > 0
            ? <div className="result-set">
              <h1>Invoices</h1>
              <table className="row-table transform-x">
                {searchResults.InvoiceList.slice(0, 3).map((invoice, key) =>
                  <tr className="job" key={key} onClick={() => navigate('/invoice/', invoice.ID)}>
                    <td className="job-item">
                      <img src="/icons/quotes-blue.svg" alt="clear" />
                      {invoice.InvoiceNumber}
                    </td>
                    <td className="job-item">
                      {!Helper.isNullOrUndefined(invoice.EmployeeFullName)
                        ? <div className="customer-initials no-margin">
                          {getInitials(invoice.EmployeeFullName)}
                        </div>
                        : "Not Assigned"
                      }
                    </td>
                    <td className="job-item">
                      {invoice.CustomerName}
                    </td>
                    <td className="job-item">
                      <CellStatusOld value={invoice.InvoiceStatus} valueEnum={'InvoiceStatus'} />
                    </td>
                    <td className="job-item">
                      {invoice.Reference}
                      <p>{formatCurrency(invoice.TotalInclusive)}</p>
                    </td>
                    <td className="width-96">
                      <CellBool value={!invoice.IsClosed} />
                      <p>{invoice.IsClosed ? 'Closed' : 'Open'}</p>
                    </td>
                  </tr>
                )}
              </table>
            </div>
            : ''
          }

          {searchResults.PurchaseOrderList && searchResults.PurchaseOrderList.length > 0
            ? <div className="result-set">
              <h1>Purchase Orders</h1>
              <table className="row-table transform-x">
                {searchResults.PurchaseOrderList.slice(0, 3).map((purchaseOrder, key) =>
                  <tr className="job" key={key} onClick={() => navigate('/purchase/', purchaseOrder.ID)}>
                    <td className="job-item">
                      <img src="/icons/quotes-blue.svg" alt="clear" />
                      {purchaseOrder.PurchaseOrderNumber}
                    </td>
                    <td className="job-item">
                      {!Helper.isNullOrUndefined(purchaseOrder.EmployeeFullName)
                        ? <div className="customer-initials no-margin">
                          {getInitials(purchaseOrder.EmployeeFullName)}
                        </div>
                        : "Not Assigned"
                      }
                    </td>
                    <td className="job-item">
                      {purchaseOrder.SupplierDescription}
                    </td>
                    <td className="job-item">
                      <CellStatusOld value={purchaseOrder.PurchaseOrderStatus} valueEnum={'PurchaseOrderStatus'} />
                    </td>
                    <td className="job-item">
                      {purchaseOrder.Reference}
                      <p>{formatCurrency(purchaseOrder.TotalInclusive)}</p>
                    </td>
                    <td className="width-96">
                      <CellBool value={!purchaseOrder.IsClosed} />
                      <p>{purchaseOrder.IsClosed ? 'Closed' : 'Open'}</p>
                    </td>
                  </tr>
                )}
              </table>
            </div>
            : ''
          }

          {searchResults.ProductList && searchResults.ProductList.length > 0
            ? <div className="result-set">
              <h1>Assets</h1>
              <table className="row-table transform-x">
                {searchResults.ProductList.slice(0, 3).map((product, key) =>
                  <tr className="job" key={key} onClick={() => navigate('/asset/', product.ID)}>
                    <td className="job-item">
                      <img src="/icons/jobs-blue.svg" alt="clear" />
                      {product.ProductNumber}
                    </td>
                    <td className="job-item">
                      {!Helper.isNullOrUndefined(product.EmployeeFullName)
                        ? <div className="customer-initials no-margin">
                          {getInitials(product.EmployeeFullName)}
                        </div>
                        : "Not Assigned"
                      }
                    </td>
                    <td className="job-item">
                      {product.CustomerName}
                    </td>
                    <td className="job-item">
                      {product.InventoryDescription}
                    </td>
                    <td className="job-item">{formatCurrency(product.PurchaseAmount)}
                      <p>Purchase Amount</p>
                    </td>
                    <td className="width-96">
                      <CellBool value={!product.IsScrapped} />
                      <p>{product.IsScrapped ? 'Scrapped' : 'Not scrapped'}</p>
                    </td>
                  </tr>
                )}
              </table>
            </div>
            : ''
          }
        </div>
        : ''
      }

      <style jsx>{`
        .search-container {
          margin-right: 1.5rem;
          position: relative;
          width: 100%;
        }
        .search-open {
          cursor: pointer;
          opacity: 1;
          position: absolute;
          right: 0rem;
          top: 0.75rem;
          transition: all ease-in-out 0.7s;
          // z-index: 6;
        }
        .search {
          background-color: ${colors.white};
          border-radius: ${layout.cardRadius};
          box-sizing: border-box;
          display: flex;
          height: 3rem;
          opacity: 0;
          padding: 0.5rem;
          pointer-events: none;
          position: relative;
          transition: opacity ease-in-out 0.7s;
          width: 100%;
        }
        .search-container-show .search {
          opacity: 1;
          pointer-events: auto;
        }
        .search-container-show .search-open {
          opacity: 0;
          pointer-events: none;
          right: 20rem;
        }
        .search > * {
          z-index: 5;
        }
        input {
          background: none;
          border: none;
          box-shadow: none;
          color: ${colors.darkPrimary}; 
          font-size: ${fontSizes.body};
          height: 100%;
          outline: none;
          font-family: ${fontFamily};
          width: 100%;
        }
        label {
          color: ${colors.labelGrey}; 
          font-size: ${fontSizes.label};
          text-align: left;
        }
        ::-webkit-input-placeholder { 
          color: ${colors.blueGrey};
        }
        input:-webkit-autofill {
          -webkit-box-shadow: 0 0 0 30px ${colors.formGrey} inset !important;
        }
        .search-img {
          cursor: pointer;
          margin-right: 8px;
        }
        .title {
          border-bottom: 1px solid ${colors.blueGreyLight};
          padding-bottom: 1rem;
          user-select: none;
        }
        .row {
          display: flex;
        }
        .align-center {
          align-items: center;
        }
        .button {
          align-items: center;
          background-color: ${colors.bluePrimary};
          border-radius: 3px;
          color: ${colors.white};
          cursor: pointer;
          display: flex;
          height: 40px;
          flex-shrink: 0;
          margin-left: 2rem;
          padding: 0px 12px;
        }
        .button-clear {
          background: none;
          color: ${colors.bluePrimary};
          cursor: pointer;
          margin-left: 0;
        }
        .loader {
          border-color: rgba(113, 143, 162, 0.2);
          border-left-color: ${colors.blueGrey};
          display: block;
          margin-right: 0.5rem;
        }
        .results {
          background-color: ${colors.white};
          border-radius: ${layout.cardRadius};
          border-top: solid 3rem rgba(0, 0, 0, 0);
          box-shadow: 0px 10px 16px rgba(0, 0, 0, 0.1), 0px 4px 6px rgba(0, 0, 0, 0.06);
          left: 0;
          max-height: 500px;
          overflow-y: scroll;
          position: absolute;
          top: 0;
          width: 100%;
          z-index: 3 !important;
        }
        .action {
          align-items: center;
          display: flex;
          height: 2rem;
          justify-content: center;
          width: 2.5rem;
        }
        .clear {
          cursor: pointer;
        }
        .result-set {

        }
        .result-set + .result-set {
          border-top: 1px solid ${colors.formGrey}
        }
        .result-set h1 {
          font-size: 1rem;
          font-weight: normal;
          margin: 0;
          padding: 1rem 1.2rem ;
          text-align: left;
        }
        .job {
          align-items: center;
          cursor: pointer;
          display: flex;
          height: 3.5rem;
          justify-content: space-between;
          padding: 0 1.5rem 0 0;
          margin-left: -0.5rem;
        }
        .job-item {
          text-align: left;
          //margin-left: 2rem;
          width: 150px;
        }
        .job-item p {
          color: ${colors.blueGrey};
          font-size: 0.875rem;
          margin: 0.25rem 0 0;
        }
        .job-item img {
          margin-right: 0.5rem;
        }

        .customer {
          align-items: center;
          cursor: pointer;
          display: flex;
          height: 4.5rem;
          justify-content: space-between;
          padding: 0 1.5rem;
          text-align: left;
        }
        .customer-initials {
          align-items: center;
          background-color: ${colors.bluePrimary};
          border-radius: 1.25rem;
          color: ${colors.white};
          display: flex;
          font-weight: bold;
          height: 2.5rem;
          justify-content: center;
          margin-right: 1rem;
          width: 2.5rem;
        }

        .customer-initials.no-margin {
          margin-right: 0.2rem;
        }

        .customer-details p {
          color: ${colors.blueGrey};
          font-size: 0.875rem;
          font-weight: normal;
          margin: 0.25rem 0 0;
        }
        .bolded {
          font-weight: bold;
        }

        .row-table {
          width: 100%;
        }

        .transform-x {
          padding-left: 2rem;
        }

        .width-48 {
          width: 48px;
        }

        .width-96 {
          width: 96px;
        }

        .width-100 {
          width: 100%;
        }

        .inline-block {
          display: inline-block;
        }        

      `}</style>
    </div>
  )
}

GlobalSearch.defaultProps = {
  type: 'text',
};

export default GlobalSearch;
