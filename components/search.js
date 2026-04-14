import React, { useState, useRef, useEffect } from 'react';
import { colors, fontSizes, layout, fontFamily } from '../theme';
import { useOutsideClick } from "rooks";
import ActiveFilters from './active-filters';
import * as Enums from '../utils/enums';
import Time from '../utils/time';
import Helper from '../utils/helper';
import UCS from '../services/option/user-config-service';
import Storage from '../utils/storage';

function Search(props) {

  const abortController = useRef(null);
  const timeout = useRef(null);

  const triggerSearchFunc = () => {
    if (abortController.current && !abortController.current.signal.aborted()) {
      abortController.current.abort();
    }
    abortController.current = new AbortController();
    props.searchFunc(abortController.current.signal);

    // OR debounce the search

    clearTimeout(timeout.current);
    timeout.current = setTimeout(() => {
      props.searchFunc();
    }, 500);
  };

  const constructFilterOptions = () => {

    let theFilters = {};
    let theState = {};
    let subscriptionInfo = Storage.getCookie(Enums.Cookie.subscriptionInfo);
    let multiWorkflow = subscriptionInfo && subscriptionInfo.MultiWorkflow;

    if (props.filters) {
      const keys = Object.keys(props.filters);
      for (const key of keys) {
        let options = [];
        theFilters[key] = {};
        if (props.filters[key]) {
          props.filters[key].forEach(function (option) {

            switch (key) {
              case 'Stores':
              case 'JobTypes':
              case 'Suppliers':
                options.push({ id: option.ID, name: option.Name, isActive: option.IsActive });
                break;
              case 'Employees':
                options.push({ id: option.ID, name: option.FullName, isActive: option.IsActive });
                break;
              case 'Modules':
              case 'QuoteStatuses':
              case 'InvoiceStatuses':
              case 'TemplateTypes':
              case 'MessageStatus':
              case 'MessageTypes':
              case 'UserTypes':
              case 'AttachmentTypes':
              case 'StockItemTypes':
              case 'ImportStatuses':
              case 'ImportTypes':
                options.push({ id: option, name: option, isActive: true });
                break;
              case 'DateRange':
                options.push(option);
                break;
              case 'JobStatus':
                options.push({ id: option.ID, name: option.Description, isActive: option.IsActive, groupName: multiWorkflow ? option.WorkflowName : null });
                break;
              default:
                options.push({ id: option.ID, name: option.Description, isActive: option.IsActive });
                break;
            }
          });
        }

        theFilters[key]["options"] = options;
        if (key === 'DateRange') {
          theFilters[key]['type'] = "date-range";
        } else {
          theFilters[key]['type'] = "check";
        }

        theState[key] = [];
      }
    }

    if (props.initialStatusFilterIds && props.initialStatusFilterIds.length > 0) {

      theFilters.JobStatus?.options && theFilters.JobStatus.options.forEach(x => x.id === props.initialStatusFilterIds[0] && theState.JobStatus.push(x));
      /** replaced by ^ **
       for (let x of theFilters.JobStatus.options) {
        if (x.id === props.initialStatusFilterIds[0]) {
          theState.JobStatus.push(x);
        }
      }
      */
    } else if (props.filtersConfig) {
      let [activeFilterIds] = UCS.getFilterValues(props.filtersConfig, props.filters ? Object.keys(props.filters) : []);
      let keys = Object.keys(theFilters);
      for (let key of keys.filter(x => x !== "DateRange")) {
        if (activeFilterIds[key] && theFilters[key].options) {
          for (let x of theFilters[key].options) {
            if (activeFilterIds[key].includes(x.id)) {
              theState[key].push(x);
            }
          }
        }
      }
      for (let key of keys.filter(x => x === "DateRange")) {
        theState[key] = activeFilterIds[key];
        /*if (activeFilterIds[key] && theFilters[key].options) {
          for (let x of theFilters[key].options) {
            theState[key].push(x);
            console.log('set date', x /!*null*!/, theState[key], theState)
          }
        }*/
      }
    }

    return [theState, theFilters];
  };

  
  const [showFilter, setShowFilter] = useState(false);
  const [filterOptions, setFilterOptions] = useState({});
  const [filterState, setFilterState] = useState({});
  const ref = useRef();
  const searchValDebounce = useRef(null);
  const searchValRef = useRef(props.searchVal);

  useEffect(() => {
    const [newFilterState, newFilterOptions] = constructFilterOptions();
    setFilterOptions(newFilterOptions);
    setFilterState(newFilterState);
  }, [props.filters, props.filtersConfig]);

  useOutsideClick(ref, () => {
    if (showFilter) {
      setShowFilter(false);
    }
  });

  const handleSearchChange = (e) => {
    searchValRef.current = e.target.value;
    clearTimeout(searchValDebounce.current);
    searchValDebounce.current = setTimeout(() => {
      props.setSearchVal(searchValRef.current);
    }, 750);
  };

  function mapStateToIds(state) {
    let submitFilterIds = {};
    if (props.filters) {
      const keys = Object.keys(state);
      for (const key of keys) {
        submitFilterIds[key] = state[key].map(x => key === "DateRange" ? x : x.id);
      };
    }

    return submitFilterIds;
  }

  const clearFilters = (e) => {
    clearStandardFilters(e);
    clearAncillaryFilters(e);
  };

  const clearStandardFilters = (e) => {
    let clearFilterState = {};

    if (e.target.dataset.filter !== undefined) {
      clearFilterState = { ...filterState };
      clearFilterState[e.target.dataset.filter] = [];
    } else {
      const keys = Object.keys(filterState);
      for (const key of keys) {
        clearFilterState[key] = key === "DateRange" ? [null, null] : [];
      }
    }

    setFilterState(clearFilterState);
    if (props.setActiveFilterIds) {
      props.setActiveFilterIds(mapStateToIds(clearFilterState));
    } else if (props.searchFunc) {
      props.searchFunc();
    }

    if (showFilter) {
      setShowFilter(false);
    }
  };

  const clearAncillaryFilters = (e) => {
    if (ancillaryFilterState) {
      let clearFilterState = { ...ancillaryFilterState };

      const keys = Object.keys(clearFilterState).filter(x => x !== "StickyFilters" && x !== "StickySorting");
      for (const key of keys) {
        clearFilterState[key] = [];
      }

      setAncillaryFilterState(clearFilterState);
      props.setAncillaryFilters({ reset: true, ignore: ["StickyFilters", "StickySorting"] });
    }
  };

  const [canSubmitAfterItemChecked, setCanSubmitAfterItemChecked] = useState(false);

  const handleFilterChange = (key, selected) => {

    let changeFilterState = { ...filterState };

    if (key === "DateRange") {
      changeFilterState[key][0] = selected.start ? Time.toISOString(selected.start, true, true, true) : null;
      changeFilterState[key][1] = selected.end ? Time.toISOString(selected.end, true, true, true) : null;
    } else {
      if (changeFilterState[key].includes(selected)) {
        changeFilterState[key] = changeFilterState[key].filter((value) => { return value !== selected })
      } else {
        changeFilterState[key].push(selected);
      }
    }

    setFilterState(changeFilterState);
    setCanSubmitAfterItemChecked(true);
  };

  useEffect(() => {
    if (canSubmitAfterItemChecked) {
      submit();
      setCanSubmitAfterItemChecked(false);
    }
  }, [canSubmitAfterItemChecked]);

  function submit() {
    if (props.setActiveFilterIds) {
      props.setActiveFilterIds(mapStateToIds(filterState));
    } else if (props.searchFunc) {
      props.searchFunc();
    }

    if (showFilter) {
      setShowFilter(false);
    }
  }

  //Searchtimeout to automatically search after 300ms of not changing the searchVal (input)
  // const timerRef = useRef(null);
  const firstUpdate = useRef(true);

  useEffect(() => {
    if (firstUpdate.current) {
      firstUpdate.current = false;
      return;
    }

    submit();

    // if (timerRef.current) {
    //   clearTimeout(timerRef.current);
    // }
    // timerRef.current = setTimeout(() => {
    //   submit();
    // }, 500);
  }, [props.searchVal]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      // submit(); // do nothing as search happens anyway
    }
  };

  const clearSearch = () => {
    props.setSearchVal('');
    searchValInputRef.current.value = "";
  };

  // ANCILLARY FILTERS

  const constructAncillaryFilterOptions = () => {
    if (props.ancillaryFilters) {

      let newFilters = {};
      let newState = {};
      const keys = Object.keys(props.ancillaryFilters);
      for (const key of keys) {
        let options = [];
        if (props.ancillaryFilters[key]) {
          props.ancillaryFilters[key].forEach(function (option) {
            switch (option.type) {
              case Enums.ControlType.Switch:
                options.push(option);
                break;
            }
          });
        }
        newFilters[key] = options;
        newState[key] = [];
      }

      if (props.initialAncillaryFilters) {
        for (const key of keys) {
          if (props.ancillaryFilters[key] == props.initialAncillaryFilters[key]) {
            newState[key] = props.initialAncillaryFilters[key];
          }
        }
      } else if (props.filtersConfig) {
        let [activeFilterIds, ancillaryFilters] = UCS.getFilterValues(props.filtersConfig);
        newState = mapAncillaryValuesToState(ancillaryFilters, newFilters);
      }

      return [newState, newFilters];
    }
    return [undefined, undefined]
  };

  const mapAncillaryValuesToState = (ancillaryFilters, newFilters) => {
    let state = {};

    if (newFilters) {
      Object.keys(newFilters).forEach(function (filterKey) {
        state[filterKey] = [];
      });
    }

    if (ancillaryFilters) {
      const keys = Object.keys(ancillaryFilters);

      keys.forEach(function (key) {

        if (ancillaryFilters[key] === true) {
          state[key] = newFilters[key];
        } else {
          state[key] = [];
        }
      });
    }

    return state;
  };

  
  const [ancillaryFilterOptions, setAncillaryFilterOptions] = useState({});
  const [ancillaryFilterState, setAncillaryFilterState] = useState({});

  useEffect(() => {
    const [newAncillaryFilterState, newAncillaryFilterOptions] = constructAncillaryFilterOptions();
    setAncillaryFilterOptions(newAncillaryFilterOptions);
    setAncillaryFilterState(newAncillaryFilterState);
  }, [props.ancillaryFilters, props.filtersConfig]);

  const setAncillaryFilters = (key, option, checked) => {
    if (props.setAncillaryFilters) {
      let changeFilterState = { ...ancillaryFilterState };

      if (changeFilterState[key].some(elem => JSON.stringify(elem) === JSON.stringify(option))) {
        changeFilterState[key] = changeFilterState[key].filter((value) => { return JSON.stringify(value) !== JSON.stringify(option) })
      } else {
        changeFilterState[key].push(option);
      }
      setAncillaryFilterState(changeFilterState);
      props.setAncillaryFilters({ key, checked });
    }
  };

  // DATERANGE FILTERS

  const constructDateRangeFilterOptions = () => {
    if (props.dateRangeFilters) {

      let newFilters = {};
      let newState = {};
      const keys = Object.keys(props.dateRangeFilters);

      for (const key of keys) {
        let options = [];
        if (props.dateRangeFilters[key]) {
          props.dateRangeFilters[key].forEach(function (option) {
            options.push(option);
          });
        }
        newFilters[key] = options;
        newState[key] = [];
      }

      // if (props.filtersConfig) {
      //   let [activeFilterIds, ancillaryFilters] = UCS.getFilterValues(props.filtersConfig);
      //   newState = mapAncillaryValuesToState(ancillaryFilters, newFilters);
      // }

      return [newState, newFilters];
    }
    return [undefined, undefined]
  };

  const [newDateRangeFilterState, newDateRangeFilterOptions] = constructDateRangeFilterOptions();
  const [dateRangeFilterOptions, setDateRangeFilterOptions] = useState(newDateRangeFilterOptions);
  const [dateRangeFilterState, setDateRangeFilterState] = useState(newDateRangeFilterState);

  // createdDate, '2021-04-23', 0 / 1
  const setDateRangeFilters = (filterName, value, index) => {
    if (props.setDateRangeFilters) {
      let changeFilterState = { ...dateRangeFilterState };
      if (changeFilterState[filterName].includes(value)) {
        //changeFilterState[filterName] = changeFilterState[filterName].filter((item) => { return item !== option })
      } else {
        //changeFilterState[filterName].push(option);
      }

      setDateRangeFilterState(changeFilterState);
      props.setDateRangeFilters({ filterName, value });
    }
  };

  const handleDateFilterChange = (key, item, isFrom) => {
    let changeFilterState = { ...filterState };
    let changeFilterOptions = { ...filterOptions };
    let changeFilterIds = { ...filterIds };

    if (changeFilterState[key]) {
      if (isFrom) {
        changeFilterState[key] = [item, changeFilterState[key][1]];
      } else {
        changeFilterState[key] = [changeFilterState[key][0], item];
      }
    }

    if (changeFilterOptions[key]) {
      if (isFrom) {
        changeFilterOptions[key] = [item, changeFilterOptions[key][1]];
      } else {
        changeFilterOptions[key] = [changeFilterOptions[key][0], item];
      }
      changeFilterOptions[key]['type'] = "date-range";
    }

    if (changeFilterIds[key]) {
      if (isFrom) {
        changeFilterIds[key] = [item, changeFilterIds[key][1]];
      } else {
        changeFilterIds[key] = [changeFilterIds[key][0], item];
      }
    }

    setFilterState(changeFilterState);
    setFilterOptions(changeFilterOptions);
    setFilterIds(changeFilterIds);
    let filters = mapStateToIds(changeFilterState);
    props.setActiveFilterIds(filters);
  };

  const searchValInputRef = useRef();

  return (
    <div>
      {props.placeholder ?
        <div className="search">
          <img className="search-img" src="/icons/search.svg" alt="search button" onClick={submit} />
          <input ref={searchValInputRef} onChange={handleSearchChange} placeholder={props.placeholder} onKeyDown={handleKeyDown} />
          <div className='action'>
            {props.searchVal
              ? <img src="/icons/cross-blue.svg" alt="clear" className="clear" onClick={clearSearch} />
              : ''
            }
          </div>
        </div> : ''
      }

      {props.filters || props.ancillaryFilters || props.dateRangeFilters
        ? <div className="row">
          <ActiveFilters
            clearFilters={clearFilters}
            checkFunc={handleFilterChange}
            filterOptions={filterOptions}
            filterState={filterState}
            ancillaryFilterOptions={ancillaryFilterOptions}
            ancillaryFilterState={ancillaryFilterState}
            setAncillaryFilters={setAncillaryFilters}
            dateRangeFilterOptions={dateRangeFilterOptions}
            dateRangeFilterState={dateRangeFilterState}
            setDateRangeFilters={setDateRangeFilters}
            submitFunc={submit}
            filtersConfig={props.filtersConfig}
          />
        </div>
        : ''
      }
      <style jsx>{`
        .search {
          background-color: ${colors.white};
          border: 1px solid ${colors.blueGreyLight};
          border-radius: ${layout.cardRadius};
          box-sizing: border-box;
          display: flex;
          height: 2.5rem;
          padding: 0.5rem;
          width: 100%;
          margin-top: 0.5rem;
          position: relative;
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
        .search-filters {
          background-color: ${colors.white};
          border: 1px solid ${colors.blueGreyLight};
          border-radius: 8px;
          box-shadow: 0px 10px 10px rgba(0, 0, 0, 0.04), 0px 20px 25px rgba(0, 0, 0, 0.1);
          box-sizing: border-box;
          display: none;
          flex-direction: column;
          flex-shrink: 0;
          max-height: 500px;
          max-width: 600px;
          padding: 1rem;
          position: absolute;
          right: -40%;
          top: 3rem;
          z-index: 5;
        }
        .search-filters-visible {
          display: flex;
        }
        .filters {
          overflow-y: scroll;
          padding: 0 6rem 1rem 0;
        }
        .title {
          border-bottom: 1px solid ${colors.blueGreyLight};
          padding-bottom: 1rem;
          user-select: none;
        }
        .row {
          display: flex;
        }
        .filter-title {
          font-size: 18px;
          font-weight: bold;
          margin: 1.5rem 0 0.5rem;
        }
        .filter-margin {
          margin-left: 6rem;
        }
        .filter-row {
          display: flex;
          flex-wrap: wrap;
          margin-left: -6rem;
        }
        .action {
          align-items: center;
          display: flex;
          height: 1.5rem;
          justify-content: center;
          width: 2.5rem;
        }
        .actions {
          border-top: 1px solid ${colors.blueGreyLight};
          display: flex;
          justify-content: space-between;
          padding-top: 1rem;
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
      `}</style>
    </div>
  )
}

Search.defaultProps = {
  type: 'text',
};

export default Search;
