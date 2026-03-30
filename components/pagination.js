import React, { useState, useContext } from 'react';
import { colors, fontSizes, layout, fontFamily, shadows } from '../theme';
import Storage from '../utils/storage';
import * as Enums from '../utils/enums';
import Fetch from '../utils/Fetch';
import ToastContext from '../utils/toast-context'; 

function Pagination(props) {

  const toast = useContext(ToastContext);
  const currentPage = parseInt(props.currentPage);
  const lastPage = Math.ceil(props.totalResults / props.pageSize); 
  const [showPopup, setShowPopup] = useState(false);

  const setPageSize = async (pageSize) => {
    Storage.setCookie(Enums.Cookie.pageSize, pageSize);
    props.setPageSize(pageSize);

    if (window.location.href.toLowerCase().indexOf("customerzone") > -1) {
      return;
    }

    const employeePut = await Fetch.put({
      url: `/Employee/pagesize?pageSize=${pageSize}`,
      toastCtx: toast
    });
  }

  function pages() {

    let pages = [props.currentPage];
    
    if (props.currentPage != 1) {
      if (props.currentPage == 2) {
        pages.unshift(1);
      } else {
        pages.unshift(props.currentPage - 1);
        pages.unshift("...");
        pages.unshift(1);
      }
    }
    
    if (props.currentPage != lastPage) {
      if (props.currentPage == lastPage - 1) {
        pages.push(lastPage);
      } else {
        pages.push(props.currentPage + 1);
        pages.push("...");
        pages.push(lastPage);
      }
    }

    return pages;
  }

  function updatePage(newPage){
    if (newPage != "..." && newPage > 0 && newPage < (lastPage+1)) {
      props.setCurrentPage(newPage);
    }
  }

  return (
    <div className={`pagination ${props.totalResults == 0 ? "hidden" : ""}`}>
      <div className="row">
        <img className="skip" src="/icons/double-chevron-back.svg" alt="first" onClick={() => updatePage(1)} />
        <div className="button" onClick={() => updatePage(currentPage - 1)}>
          Back
        </div>
        {pages().map(function(item, index){
          return (
            <div key={index} className={"page" + (item == currentPage ? " page-current" : "")} onClick={() => updatePage(item)}>{item}</div>
          )
        })}
        <div className="button" onClick={() => updatePage(currentPage + 1)}>
          Next
        </div>
        <img className="skip" src="/icons/double-chevron-next.svg" alt="last" onClick={() => updatePage(lastPage)} />
      </div>
      <div className="row results">
        Displaying 
        <div className="page-size" onClick={() => setShowPopup(!showPopup)}> 
          {props.pageSize}
          <img src="/icons/arrow-drop-down-grey.svg" alt="arrow" className="icon"/>
          {showPopup ? 
            <div>
              <p onClick={() => setPageSize(100)}>100</p>
              <p onClick={() => setPageSize(50)}>50</p>
              <p onClick={() => setPageSize(20)}>20</p>
              <p onClick={() => setPageSize(10)}>10</p>
            </div>
            : ''
          }
        </div>
        of {props.totalResults} results.
      </div>
        
      <style jsx>{`
        .pagination {
          align-items: center;
          display: flex;
          flex-direction: column;
          justify-content: center;
          margin-top: 1rem;
        }
        .row {
          align-items: center;
          display: flex;
          justify-content: center;
        }
        .results {
          color: ${colors.blueGrey};
          font-size: 12px;
          margin-top: 1rem;
        }
        .page-size {
          align-items: center;
          cursor: pointer;
          display: flex;
          justify-content: center;
          margin-left: 6px;
          position: relative;
        }
        .page-size img {
          margin-left: -4px;
        }
        .page-size div {
          align-items: center;
          background-color: ${colors.white};
          border-radius: ${layout.cardRadius};
          bottom: 1.5rem;
          box-shadow: 0px 0px 32px rgba(0, 0, 0, 0.16), 0px 4px 8px rgba(0, 0, 0, 0.16), inset 0px 0px 8px rgba(86, 204, 242, 0.08);
          display: flex;
          flex-direction: column;
          justify-content: center;
          left: -1rem;
          margin-left: 6px;
          padding: 0.25rem 0;
          position: absolute;
        }
        .page-size p {
          margin: 0;
          padding: 0.375rem 0.75rem;
        }
        .page {
          align-items: center;
          border-radius: ${layout.buttonRadius};
          color: ${props.invert ? colors.white : colors.bluePrimary};
          cursor: pointer;
          display: flex;
          font-weight: bold;
          height: 2rem;
          justify-content: center;
          width: 2rem;
        }
        .page-current {
          background-color: ${colors.bluePrimary};
          color: ${colors.white};
        }
        .button {
          align-items: center;
          color: ${props.invert ? colors.white : colors.bluePrimary};
          cursor: pointer;
          display: flex;
          justify-content: center;
          margin: 0 1rem;
        }
        .skip {
          cursor: pointer;
          margin: 4px 0 0;
        }
        .hidden {
          display: none;
        }
      `}</style>
    </div>
  )
}

export default Pagination
