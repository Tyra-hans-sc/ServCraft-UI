import React, {useState, useEffect} from 'react';
import { colors, layout } from '../theme';
import Switch from "react-switch";
import Helper from "../utils/helper";

function ReactSwitch({title, label, offLabel, checked, handleChange, flexRight, disabled = false}) {

  const onChange = (checked) => {
    if (!disabled) {
      handleChange(checked);
    }
  };

  const getLabel = () => {
    let result = label;
    if (offLabel) {
      if (Helper.isNullOrUndefined(checked)) result = offLabel;
      else if (!checked) {
        result = offLabel;
      }
    }
    return result;
  };
  
  return (
    <div title={title} className={`container ${flexRight ? '' : ''}`} onClick={() => onChange(!checked)}>
      <div className="switch">
        <Switch checked={Helper.isNullOrUndefined(checked) ? false : checked} onColor={`${colors.blueGrey}`} onChange={() => {}}
          onHandleColor={`${colors.bluePrimary}`} 
          boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
          activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
          uncheckedIcon={false} checkedIcon={false} 
          handleDiameter={20} height={10} width={30}
          disabled={disabled}
        />
      </div>
      <div className="label">
        {getLabel()}
      </div>
      <style jsx>{`
        .container {
          width: max-content;
          display: flex;
          flex-direction: row;
          align-items: center;
          padding: 0.5rem;
          color: ${colors.labelGrey};
        }
        .switch {
          display: flex;
          padding-left: 8px;
        }
        .label {
          display: flex;
          padding-left: 8px;
        }
        .reverse {
          display: flex;
          flex-direction: row-reverse;
      }
      `}</style>
    </div>
  );
}

export default ReactSwitch;
