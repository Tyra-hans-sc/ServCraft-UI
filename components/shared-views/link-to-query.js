import React, { useState, useEffect, useContext, useRef } from 'react';
import { colors, fontSizes, layout, fontFamily, tickSvg } from '../../theme';
import Fetch from '../../utils/Fetch';
import Helper from '../../utils/helper';
import { useOutsideClick } from "rooks";
import TextSearch from '../text-search';
import Link from 'next/link';
import useDebounce from '../../hooks/useDebounce';
import constants from '../../utils/constants';

function LinkToQuery(props) {

  const lockdown = props.lockdown;
  const [queries, setQueries] = useState([{}]);
  const [hasQueries, setHasQueries] = useState(true);
  const selectedQuery = Helper.isEmptyObject(props.selectedQuery) ? null : props.selectedQuery;
  const [inputFocus, setInputFocus] = useState(false);
  const [searching, setSearching] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownDirection = props.dropdownDirection ? props.dropdownDirection : 'down';
  const debounce = useDebounce();

  let deselectingQuery = false;
  let searchHasFocus = false;

  async function getQueriesForCustomer (customerChange) {
    debounce.deferProceed(constants.debounceSearchPeriod, async function(){
      setSearching(true);
      const queries = await Fetch.get({
        url: `/Query`,
        params: {
          searchPhrase: search,
          customerID: props.customerID ? props.customerID : null,
          includeClosed: false,
          pageSize: 10,
        }
      });
      setQueries(queries.Results);
      if (customerChange) {
        setHasQueries(queries.TotalResults > 0);
      }
      setSearching(false);
    });
  }

  useEffect(() => {
    getQueriesForCustomer(false);
  }, []);

  const oldSearch = useRef(search);
  useEffect(() => {
    let changed = oldSearch.current !== search;
    oldSearch.current = search;

    if (changed) {
      getQueriesForCustomer(false);
    }
  }, [search]);

  const oldCustomerID = useRef(props.customerID);
  useEffect(() => {
    let changed = oldCustomerID.current !== props.customerID;
    oldCustomerID.current = props.customerID;

    if (props.customerID && changed) {
      setQueries([{}]);
      getQueriesForCustomer(true);
    }
  }, [props.customerID]);


  const ref = useRef();
  useOutsideClick(ref, () => {
    if (inputFocus) {
      setInputFocus(false);
    }
  });

  function selectQuery(query) {
    props.setSelected(query);
    searchHasFocus = false;
  }

  function toggleQuerySelection() {
    if (!lockdown) {
      if (!deselectingQuery && !searchHasFocus) {
        setInputFocus(!inputFocus);
      }
    }
  }

  function deselectQuery() {
    if (!lockdown) {
      deselectingQuery = true;
      props.setSelected(null);
    }
  }

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const handleSearchFocus = () => {
    searchHasFocus = true;
  };

  const handleSearchBlur = () => {
    searchHasFocus = false;
  };

  return (
    <div className="container" ref={ inputFocus ? ref : null} onClick={toggleQuerySelection}>
      <div className={`link-container ${selectedQuery ? 'hidden' : ''}`}>
        <div className="link-column-1">
          <img src="/icons/file-query.svg" alt="query" />
        </div>
        <div className="link-column-2">
          Link Query
        </div>
        <div className="link-column-3">
          <img src="/icons/chevron-down-dark.svg" alt="dropdown" className={`arrow ${dropdownDirection == 'up' ? 'flip-icon' : ''}`} />
        </div>
      </div>
      <div className={`link-container ${selectedQuery ? '' : 'hidden'}`}>
        <div className="link-column-1">
          <img src="/icons/file-query.svg" alt="query" />
        </div>
        <div className="link-column-2">
          {selectedQuery && lockdown ? <Link legacyBehavior href={`/query/[id]`} as={`/query/${selectedQuery.ID}`}><a>{selectedQuery.QueryCode}</a></Link> : 
          selectedQuery ? selectedQuery.QueryCode : ""}
        </div>
        <div className="link-column-3">
          {lockdown ? '' : 
            <img src="/icons/x-circle-dark.svg" alt="dropdown" className="deselect-button" onClick={deselectQuery} />
          }
        </div>
      </div>
      <div className={`results ${inputFocus ? '' : 'hidden'} ${dropdownDirection == 'up' ? 'options-up' : 'options-down'}`}>        
        
        {hasQueries ? 
          <div className='search'>
            <TextSearch 
              placeholder={'Search for a Query'}
              changeHandler={handleSearchChange}
              focusHandler={handleSearchFocus}
              blurHandler={handleSearchBlur}
              value={search}
            />
          </div> : ''
        }

        <div className={`loader ${searching ? 'show-loader' : '' }`}></div>
        { queries && queries.map(function (query, index) {
          if (Helper.isEmptyObject(query)) {
            return (
              <div key={index}></div>
            );
          } else {
            return (
              <div className="result" key={index} onClick={() => selectQuery(query)}>
                <div className={`initial ${searching ? 'hidden' : ''}`}>{Helper.getInitials(query.CustomerName)}</div>
                <div className="row">
                  <h3>{query.QueryCode}</h3>
                  <p>{query.CustomerName}</p>
                </div>
              </div>
            );
          }
          })}
      </div>

      <style jsx>{`
        .container {
          width: 100%;
          margin-top: 0.5rem;
          cursor: pointer;
          position: relative;
        }
        .link-container {
          display: flex;
          flex-direction: row;
          justify-content: space-between;
          align-items: center;
          position: relative;
        }
        .link-column-1 {
          width: 20%;
        }
        .link-column-1 img {
          padding-right: 1rem;
          padding-left: 1rem;
        }
        .link-column-2 {
          align-items: center;
          display: flex;
          justify-content: center;
          position: absolute;
          left: 4rem;
        }

        .link-column-2 a, .link-column-2 a:visited, .link-column-2 a:active {
          text-decoration: none !important;
          font-weight: bold !important;
          color: ${colors.bluePrimary} !important;
        }

        .link-column-3 {
          position: absolute;
          right: 0;
          z-index: 1;
        }
        .search {
          padding: 0.5rem 1rem;
        }
        
        .results {
          background-color: ${colors.white};
          box-shadow: 0px 10px 10px rgba(0, 0, 0, 0.04), 0px 20px 25px rgba(0, 0, 0, 0.1);
          position: absolute;
          left: 0;
          max-height: 240px;
          min-height: 34px;
          overflow-y: scroll;
          width: 100%;
          z-index: 2;
        }
        .result {
          align-items: center;
          cursor: pointer;
          display: flex;
          padding: 0.5rem 1rem;
        }
        .result :global(.initial){
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
        .result :global(h3){
          color: ${colors.darkPrimary};
          font-size: 1rem;
          margin: 0;
        }
        .result :global(p){
          color: ${colors.blueGrey};
          font-size: 14px;
          margin: 0;
        }
        .hidden {
          display: none;
        }
        .deselect-button {
          cursor: pointer;
        }

        .options-down {
          top: 2rem;
        }
        .options-up {
          bottom: 3rem;
        }
        .flip-icon {
          transform: rotate(180deg);
        }
      `}</style>
    </div>
  );
}

export default LinkToQuery
