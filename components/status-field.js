import React, { useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { colors, fontSizes, layout, fontFamily } from '../theme';
import * as Enums from '../utils/enums';
import Switch from './switch';
import Helper from '../utils/helper';
import OptionService from '../services/option/option-service';
import InfoTooltip from './info-tooltip';

function StatusField({ statusOption, updateStatusOption, deleteFunc, customFields, workflow }) {

  function setSelected(option) {
    if (option == "Optional") {
      updateStatusOption(statusOption.JobStatusOptionName, 1)
    } else {
      updateStatusOption(statusOption.JobStatusOptionName, 2)
    }
  }

  const isJobItem = useRef(statusOption.JobStatusOptionName === Enums.JobStatusOptionName.JobItem);

  const disabled = useMemo(() => {
    let disable = isJobItem.current && workflow?.JobItemSelection === Enums.JobItemSelection.Disabled;
    return disable;
  }, [statusOption, workflow]);

  return (
    <div className="selected-field row">
      <div className={`column${disabled ? " disabled" : ""}`}>
        <div style={{ display: "flex" }}>
          {OptionService.getJobOptionName(customFields, statusOption)}
          {disabled && statusOption.JobStatusOptionName === Enums.JobStatusOptionName.JobItem ? <div style={{marginTop: "-10px"}}><InfoTooltip title="Workflow customer asset selection is disabled" /></div> : ""}
        </div>
      </div>
      <div className="column fit-content">
        <img src="/icons/trash-bluegrey.svg" alt="plus" onClick={() => deleteFunc(statusOption.JobStatusOptionName)} />
      </div>
      <div className="actions column">
        <Switch
          disabled={disabled}
          extraClasses=""
          options={['Optional', 'Required']}
          selectedOption={statusOption.OptionConfiguration == '1' ? 'Optional' : 'Required'}
          setSelected={setSelected}
        />
      </div>
      <div className={`column${disabled ? " disabled" : ""}`}>
        {isJobItem.current ? "Add Customer Assets" : statusOption.JobStatusOptionDescription}
      </div>
      <style jsx>{`
      
              .row {
                display: flex;
              }
              .column {
                display: flex;
                flex-direction: column;
                width: 100%;
              }

              .disabled {
                opacity: 0.4;
                font-style: italic;
              }

              .fit-content {
                width: fit-content;
              }
        .selected-field {
          align-items: center;
          color: ${colors.darkPrimary};
          display: flex;
          height: 2.5rem;
          //justify-content: space-between;
          margin-top: 1rem;
          width: 100%;
        }
        .actions {
          //align-items: center;
          //display: flex;
        }
        .actions img {
          cursor: pointer;
          margin-right: 1rem;
        }
      `}</style>
    </div>
  )
}

export default StatusField
