import React, { useState, useRef, useEffect } from 'react';
import { colors, layout } from '../../theme';
import useWindowSize from "../../hooks/useWindowSize";
import ReactSwitch from '../react-switch';
import * as Enums from '../../utils/enums';
import SCSwitch from "../sc-controls/form-controls/sc-switch";

function AncillaryFilter(props) {  

  const options = props.options;
  const selectedOptions = props.selectedOptions;

  const filterResult = () => {
    switch (options[0].type) {
      case Enums.ControlType.Switch:
        return <SCSwitch checked={selectedOptions ? selectedOptions.includes(options[0]) : false}
          onToggle={(checked) => handleSwitchChange(props.filterName, options[0], checked)} label={`${options[0].label}`} />
        /*<ReactSwitch checked={selectedOptions ? selectedOptions.includes(options[0]) : false}
          handleChange={(checked) => handleSwitchChange(props.filterName, options[0], checked)} label={`${options[0].label}`} />*/
      default:
        return null;
    }
  }

  const windowSize = useWindowSize();
  const containerMaxHeight = `${Math.floor(windowSize.height * 0.2)}px`;

  const handleSwitchChange = (key, option, checked) => {
    props.setAncillaryFilters(key, option, checked);
  }

  return (
    <div className="filter-container"
      style={{position: 'relative', display: 'flex', cursor: 'pointer', fontSize: '14px', color: `${colors.darkPrimary}`}}>
      <div>
        { options ? 
          <div className={"filter" + (props.showFilter ? " filter-visible" : "")} onClick={(e) => e.stopPropagation()}>
            {(() => {
              return filterResult();
            })()}
          </div>
         : '' }

        <style jsx>{`
          .filter {            
            display: none;
            max-height: ${containerMaxHeight};
          }
          .filter-visible {
            display: flex;
          }
        `}</style>
      </div>
    </div>
  );
}

export default AncillaryFilter
