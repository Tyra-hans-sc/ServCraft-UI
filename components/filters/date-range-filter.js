import { useState, useRef, useEffect } from 'react'
import { colors, layout } from '../../theme'
import useOutsideClick from "../../hooks/useOutsideClick"
import useWindowSize from "../../hooks/useWindowSize"
import KendoDatePicker from '../kendo/kendo-date-picker';
import Time from '../../utils/time';
import Helper from '../../utils/helper';
import FilterDateRange from './date-range';

function DateRangeFilter({options, selectedOptions, filterName, setDateRangeFilters}) {  

  const [showFilter, setShowFilter] = useState(false);

  function filterText() {
    if (selectedOptions.length > 2) {
      return selectedOptions[0] + " + " + (selectedOptions.length - 1)
    } else if (selectedOptions.length == 0) {
      return Helper.splitWords(filterName);
    }

    if (selectedOptions.every(x => x == null)) {
      return Helper.splitWords(filterName);
    } else {
      return selectedOptions.join(" - ");
    }
  }

  function filterType() {    
    return <FilterDateRange dates={options} setDateRangeFilters={(filterName, item, index) => {setDateRangeFilters(filterName, item, index)}} 
      filterName={filterName} />;
  }

  const windowSize = useWindowSize();
  const containerMaxHeight = `${Math.floor(windowSize.height * 0.2)}px`;

  const ref = useRef();
  useOutsideClick(ref, () => {
    if (showFilter) {
      setShowFilter(false);
    }
  });

  const [optionsSelected, setOptionsSelected] = useState(false);

  return (
    <div className={"filter " + (optionsSelected ? " selected-filter" : "")} onClick={() => setShowFilter(!showFilter)} ref={showFilter ? ref : null}>
      {filterText()}
      <div className={"container" + (true ? " container-visible" : "")} onClick={(e) => e.stopPropagation()}>
        {filterType()}
        {/* <div className="actions">
          <div className="button button-clear" onClick={clearFilter} data-filter={props.filterName}>
            Clear
          </div>
        </div> */}
      </div>
      <style jsx>{`
        .filter {
          align-items: center;
          background-color: ${colors.blueGrey};
          border-radius: 1rem;
          box-sizing: border-box;
          color: ${colors.white}; 
          cursor: pointer;
          display: flex;
          font-size: 14px;
          height: 2rem;
          justify-content: center;
          margin-left: 0.5rem;
          padding: 0 1.5rem;
          position: relative;
        }
        .filter.selected-filter {
          background-color: ${colors.bluePrimary};
        }
        .container {
          background-color: ${colors.white};
          border-radius: 8px;
          box-shadow: 0px 10px 10px rgba(0, 0, 0, 0.04), 0px 20px 25px rgba(0, 0, 0, 0.1);
          box-sizing: border-box;
          display: none;
          flex-direction: column;
          flex-shrink: 0;
          left: 0;
          padding: 1rem;
          position: absolute;
          top: 2.5rem;
          z-index: 5;
          max-height: ${containerMaxHeight};
        }
        .container-visible {
          display: flex;
        }
        .actions {
          border-top: 1px solid ${colors.blueGreyLight};
          display: flex;
          justify-content: space-between;
          margin-top: 1rem;
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

export default DateRangeFilter;
