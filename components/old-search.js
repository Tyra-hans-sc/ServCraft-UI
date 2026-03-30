import React, { useState, useRef, useEffect } from 'react';
import { colors, fontSizes, layout, fontFamily } from '../theme';
import useOutsideClick from "../hooks/useOutsideClick";
import ActiveFilters from './active-filters';
import * as Enums from '../utils/enums';
import Time from '../utils/time';
import UCS from '../services/option/user-config-service';
import AncillaryFilter from './filters/ancillary-filter';

function Search(props) {

  const constructFilterOptions = () => {

    let newFilters = {};
    let newState = {};
    let newFilterIds = {};

    if (props.filters) {
      const keys = Object.keys(props.filters);
      for (const key of keys) {
        let options = [];
        newFilterIds[key] = {};
        if (props.filters[key]) {
          props.filters[key].forEach(function (option) {

            switch (key) {
              case 'Stores':
              case 'JobTypes':
              case 'Suppliers':
                options.push(option.Name);
                newFilterIds[key][option.Name] = option.ID;
                break;
              case 'Employees':
                options.push(option.FullName);
                newFilterIds[key][option.FullName] = option.ID;
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
                options.push(option);
                newFilterIds[key][option] = option;
                break;
              case 'DateRange':
                options.push(option);
                newFilterIds[key][option] = option;
                break;
              default:
                options.push(option.Description);
                newFilterIds[key][option.Description] = option.ID;
                break;
            }
          });
        }

        newFilters[key] = options;
        if (key === 'DateRange') {
          newFilters[key]['type'] = "date-range";
        } else {
          newFilters[key]['type'] = "check";
        }

        newState[key] = [];
      }
    }

    if (props.initialStatusFilterIds && props.initialStatusFilterIds.length > 0) {
      for (var x in newFilterIds.JobStatus) {
        if (newFilterIds.JobStatus[x] == props.initialStatusFilterIds[0]) {
          newState.JobStatus.push(x);
        }
      }
    } else if (props.filtersConfig) {
      let [activeFilterIds, ancillaryFilters] = UCS.getFilterValues(props.filtersConfig);
      newState = mapIdsToState(activeFilterIds, newFilterIds, newFilters);
    }

    return [newState, newFilters, newFilterIds];
  };

  const [newFilterState, newFilterOptions, newFilterIds] = constructFilterOptions();
  const [showFilter, setShowFilter] = useState(false);
  const [filterOptions, setFilterOptions] = useState(newFilterOptions);
  const [filterState, setFilterState] = useState(newFilterState);
  const [filterIds, setFilterIds] = useState(newFilterIds);
  const ref = useRef();

  useOutsideClick(ref, () => {
    if (showFilter) {
      setShowFilter(false);
    }
  });

  const handleSearchChange = (e) => {
    props.setSearchVal(e.target.value);
  };

  function mapIdsToState(ids, newFilterIds, newFilterOptions) {
    let submitState = {};
    if (props.filters) {

      //prepopulate in case first time load
      const propKeys = Object.keys(props.filters);
      propKeys.forEach(function (propKey) {
        submitState[propKey] = [];
      });

      const keys = Object.keys(ids);

      for (const key of keys) {
        submitState[key] = [];

        //if (newFilterOptions[key].type === 'check') {
        ids[key].forEach(function (selectedID) {
          let newFilterIdsKey = newFilterIds[key];
          if (newFilterIdsKey) {
            const idKeys = Object.keys(newFilterIds[key]);
            let selected = null;

            idKeys.forEach(function (idKey) {
              if (newFilterIds[key][idKey] === selectedID) {
                selected = idKey;
              }
            });
            if (selected) {
              submitState[key].push(selected);
            }
          }
        });
        //} 
        // else if (newFilterOptions[key].type === 'date-range') {          
        //   submitState[key].push(ids[key][0], ids[key][1]);          
        // }
      }
    }

    return submitState;
  }

  function mapStateToIds(state) {
    let submitFilterIds = {};
    if (props.filters) {
      const keys = Object.keys(state);
      for (const key of keys) {
        submitFilterIds[key] = [];
        //if (filterOptions[key].type === 'check') {
        state[key].forEach(function (selected) {
          submitFilterIds[key].push(filterIds[key][selected]);
        });
        //} 
        // else if (filterOptions[key].type === 'date-range') {
        //   submitFilterIds[key].push(state[key][0], state[key][1]);
        // }
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
        clearFilterState[key] = [];
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
      let clearFilterState = {};

      const keys = Object.keys(ancillaryFilterState);
      for (const key of keys) {
        clearFilterState[key] = [];
      }
  
      setAncillaryFilterState(clearFilterState);
      props.setAncillaryFilters({ reset: true });
    }
  };

  const [canSubmitAfterItemChecked, setCanSubmitAfterItemChecked] = useState(false);

  const handleFilterChange = (key, selected) => {
    let changeFilterState = { ...filterState };
    if (changeFilterState[key].includes(selected)) {
      changeFilterState[key] = changeFilterState[key].filter((value) => { return value !== selected })
    } else {
      changeFilterState[key].push(selected);
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
  const timerRef = useRef(null);
  const firstUpdate = useRef(true);

  useEffect(() => {
    if (firstUpdate.current) {
      firstUpdate.current = false;
      return;
    }

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => { submit() }, 300);
  }, [props.searchVal]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      submit();
    }
  };

  const clearSearch = () => {
    props.setSearchVal('');
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

      if (props.filtersConfig) {
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

  const [newAncillaryFilterState, newAncillaryFilterOptions] = constructAncillaryFilterOptions();
  const [ancillaryFilterOptions, setAncillaryFilterOptions] = useState(newAncillaryFilterOptions);
  const [ancillaryFilterState, setAncillaryFilterState] = useState(newAncillaryFilterState);

  const setAncillaryFilters = (key, option, checked) => {
    if (props.setAncillaryFilters) {
      let changeFilterState = { ...ancillaryFilterState };
      if (changeFilterState[key].includes(option)) {
        changeFilterState[key] = changeFilterState[key].filter((value) => { return value !== option })
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

  return (
    <div>
      {props.placeholder ?
        <div className="search">
          <img className="search-img" src="/icons/search.svg" alt="search button" onClick={submit} />
          <input onChange={handleSearchChange} value={props.searchVal} placeholder={props.placeholder} onKeyDown={handleKeyDown} />
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
