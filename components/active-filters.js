import React, { useState, useEffect, useRef } from 'react';
import { colors, fontSizes, layout, fontFamily } from '../theme';
import Filter from './filters/filter';
import AncillaryFilter from './filters/ancillary-filter';
import DateRangeFilter from './filters/date-range-filter';
import KendoTooltip from './kendo/kendo-tooltip';
import * as Enums from '../utils/enums';
import { useOutsideClick } from "rooks";
import Helper from '../utils/helper';

function ActiveFilters(props) {

  const canClear = () => {
    if (props.filterState) {
      const keys = Object.keys(props.filterState);
      for (const key of keys) {
        if (props.filterOptions[key].type === "date-range" && props.filterState[key].some(x => x !== null)) {
          return true;
        } else if (props.filterOptions[key].type !== "date-range") {
          if (props.filterState[key].length != 0) {
            return true;
          }
        }
      }
    }

    if (props.ancillaryFilterState) {      
      const keys = Object.keys(props.ancillaryFilterState).filter(x=> x !== "StickyFilters" && x !== "StickySorting");
      for (const key of keys) {
        if (!Helper.isNullOrUndefined(props.ancillaryFilterState[key])) {
          if (props.ancillaryFilterState[key].length != 0) {
            return true;
          }
        }
      }
    }

    return false;
  }

  // FILTERS

  const generateFilters = () => {
    if (props.filterState) {
      const keys = Object.keys(props.filterState);
      let filters = [];
      for (const key of keys) {
        filters.push(key);
      }

      return filters.map(function (filter, key) {
        if (props.filterOptions[filter] && props.filterOptions[filter]['options'].length > 0) {
          return <Filter
            checkFunc={props.checkFunc}
            clearFilters={props.clearFilters}
            key={key.toString()}
            filterName={filter}
            filterObject={props.filterOptions[filter]}
            selectedOptions={props.filterState[filter]}
            submitFunc={props.submitFunc}
          />
        } else {
          return <></>;
        }
      }
      );
    }
  }

  // ANCILLARY FILTERS

  const generateAncillaryFilters = () => {
    const keys = Object.keys(props.ancillaryFilterState ? props.ancillaryFilterState : {});
    let filters = [];
    for (const key of keys) {
      filters.push(key);
    }

    return filters.map((filter, key) => {
      return (<div key={key}>
        {filter === "StickyFilters" && props.ancillaryFilterOptions[filter] !== undefined ? <>
        <hr/>
        </> : ""}
        <AncillaryFilter
          key={key}
          options={props.ancillaryFilterOptions[filter]}
          selectedOptions={props.ancillaryFilterState[filter]}
          showFilter={showAncillaryFilter}
          setShowFilter={setShowAncillaryFilter}
          setAncillaryFilters={props.setAncillaryFilters}
          filterName={filter}
        />
      </div>);
    }
    );
  }

  const [enableAncillaryFilter, setEnableAncillaryFilter] = useState(props.ancillaryFilterOptions ? true : false);
  const [showAncillaryFilter, setShowAncillaryFilter] = useState(false);

  const toggleAncillaryFilter = () => {
    if (enableAncillaryFilter) {
      setShowAncillaryFilter(!showAncillaryFilter);
    }
  };

  const [ancillaryFilterActive, setAncillaryFilterActive] = useState(false);

  const checkForAncillaryFiltersActive = () => {
    if (enableAncillaryFilter) {
      let filterSet = false;
      const keys = Object.keys(props.ancillaryFilterState ? props.ancillaryFilterState : {}).filter(x=> x !== "StickyFilters" && x !== "StickySorting");
      for (const key of keys) {
        let filter = props.ancillaryFilterState[key];
        if (filter && filter.length > 0) {
          filterSet = true;
          break;
        }
      }
      setAncillaryFilterActive(filterSet);
    }
  };

  useEffect(() => {
    checkForAncillaryFiltersActive();
  }, [props.ancillaryFilterState]);

  const ancillaryFilterContainerRef = useRef();
  useOutsideClick(ancillaryFilterContainerRef, () => {
    if (showAncillaryFilter) {
      setShowAncillaryFilter(false);
    }
  });

  // DATERANGE FILTERS

  //const [showDateRangeFilter, setShowDateRangeFilter] = useState(props.dateRangeFilterOptions ? true : false);
  //const [showDateRangeFilter, setShowDateRangeFilter] = useState(true);

  const generateDateRangeFilters = () => {
    // not used
    if (props.dateRangeFilterState) {
      const keys = Object.keys(props.dateRangeFilterState);
      let filters = []
      for (const key of keys) {
        filters.push(key);
      }

      return filters.map((filter, key) =>
        <DateRangeFilter
          key={key.toString()}
          options={props.dateRangeFilterOptions[filter]}
          selectedOptions={props.dateRangeFilterState[filter]}
          setDateRangeFilters={props.setDateRangeFilters}
          filterName={filter}
        />
      );
    }
  }  

  return (
    <div className="container">
      <div className="ancillary-filter-container" ref={ancillaryFilterContainerRef}>
        <KendoTooltip>
          <img title="Additional filter" src={ancillaryFilterActive ? `/icons/filters-blue.svg` : `/icons/filters.svg`} alt="clear" className="filter-icon" onClick={() => toggleAncillaryFilter()} />
        </KendoTooltip>

        {showAncillaryFilter ?
          <div className="ancillary-filter">
            {(() => {
              return generateAncillaryFilters()
            })()}
          </div>
          : ''
        }
      </div>
      
      {generateFilters()}

      {/*<div className="date-range-filter">
        {(() => {
          return generateDateRangeFilters()
        })()}
      </div>*/}

      {canClear()
        ? <div className="clear" onClick={props.clearFilters}>
          Clear filters
          <img src="/icons/cross-blue.svg" alt="clear" />
        </div>
        : ""
      }
      <style jsx>{`
        .container {
          align-items: center;
          display: flex;
          width: 100%;
          margin-top: 0.75rem;
          position: relative;
        }
        .text {
          color: ${colors.blueGrey};
          font-size: 14px;
          font-weight: bold;
        }
        .clear {
          align-items: center;
          color: ${colors.bluePrimary};
          cursor: pointer;
          display: flex;
          font-size: 14px;
          margin-left: 1rem;
        }
        .clear img {
          margin-left: 0.5rem;
        }
        .filter-icon {
          cursor: pointer;
        }
        .ancillary-filter {
          background-color: ${colors.white};
          border-radius: 8px;
          box-shadow: 0px 10px 10px rgba(0, 0, 0, 0.04), 0px 20px 25px rgba(0, 0, 0, 0.1);
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          flex-shrink: 0;
          left: 0;
          padding: 0.5rem;
          position: absolute;
          top: 2.5rem;
          z-index: 5;
        }

        .ancillary-filter :global(hr) {
          width: 120px;
        }

      `}</style>
    </div>
  )
}

export default ActiveFilters;
