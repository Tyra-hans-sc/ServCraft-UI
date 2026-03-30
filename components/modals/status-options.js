import React, { useState, useEffect, useMemo } from 'react';
import { colors, fontSizes, layout, fontFamily, tickSvg } from '../../theme';
import Button from '../button';
import Search from '../search';
import Helper from '../../utils/helper';
import * as Enums from '../../utils/enums';
import OptionService from '../../services/option/option-service';
import InfoTooltip from '../info-tooltip';
import { showNotification } from '@mantine/notifications';

function StatusOptions({ availableOptions, setAddingOptions, saveOptions, customFields, workflow }) {

  const [availableOptionsLocal, setAvailableOptionsLocal] = useState(availableOptions);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [searchVal, setSearchVal] = useState('');

  const jobItemDisabled = useMemo(() => {
    let disable = workflow?.JobItemSelection === Enums.JobItemSelection.Disabled;
    return disable;
  }, [availableOptions, workflow]);

  function addOption(statusOption) {

    let optionResultList = selectedOptions.filter(x => x.JobStatusOptionName != statusOption.JobStatusOptionName);
    let optionFound = selectedOptions.find(x => x.JobStatusOptionName == statusOption.JobStatusOptionName);
    let updatedOptions;

    if (optionFound) {
      // remove from list
      updatedOptions = optionResultList;
    } else {
      // add to list
      let newOption = {
        JobCardStatusID: statusOption.JobCardStatusID,
        JobStatusOptionName: statusOption.JobStatusOptionName,
        JobStatusOptionDescription: statusOption.JobStatusOptionDescription,
        OptionConfiguration: 1,
        IsActive: true,
      }
      updatedOptions = [
        ...selectedOptions,
        newOption
      ];

      if (statusOption.JobStatusOptionName === Enums.JobStatusOptionName.Van && !selectedOptions.find(x => x.JobStatusOptionName === Enums.JobStatusOptionName.EmployeeList)) {

        let employeeListOption = availableOptionsLocal.find(x => x.JobStatusOptionName === Enums.JobStatusOptionName.EmployeeList);

        newOption = {
          JobCardStatusID: employeeListOption.JobCardStatusID,
          JobStatusOptionName: employeeListOption.JobStatusOptionName,
          JobStatusOptionDescription: employeeListOption.JobStatusOptionDescription,
          OptionConfiguration: 1,
          IsActive: true,
        }
        updatedOptions = [
          ...updatedOptions,
          newOption
        ];

        showNotification({
          title: "Employee List Added With Van",
          message: "The Employee List option is recommended to be added with Van option.",
          color: "blue",
        })
      }

    }

    setSelectedOptions(updatedOptions);
  }

  useEffect(() => {
    if (searchVal == '') {
      setAvailableOptionsLocal(availableOptions);
    } else {
      setAvailableOptionsLocal(availableOptions.filter(function (item, index) {
        let itemName = OptionService.getJobOptionName(customFields, item).toLowerCase();
        let itemDescription = item.JobStatusOptionDescription.toLowerCase();
        let itemToSearch = searchVal.toLowerCase();
        return itemDescription.includes(itemToSearch) || itemName.includes(itemToSearch);
      }));
    }
  }, [searchVal]);

  return (
    <div className="overlay" onClick={(e) => e.stopPropagation()}>
      <div className="container">
        <div className="title">
          Add Fields to Status
        </div>
        <div className="search-container">
          <Search
            placeholder="Search options"
            resultsNum={availableOptionsLocal.length}
            searchVal={searchVal}
            setSearchVal={setSearchVal}
          />
        </div>
        <div className="option-container">
          {availableOptionsLocal
            .sort((a, b) => OptionService.getJobOptionName(customFields, a) > OptionService.getJobOptionName(customFields, b) ? 1 : -1)
            .map(function (statusOption, index) {
              const isJobItem = statusOption.JobStatusOptionName === Enums.JobStatusOptionName.JobItem;
              const isDisabled = isJobItem && jobItemDisabled;
              const optionSelected = selectedOptions.find(option => option.JobStatusOptionName == statusOption.JobStatusOptionName);
              return (
                <div key={index} className={`option ${optionSelected ? "selected" : ""} ${isDisabled ? "disabled" : ""}`} onClick={() => !isDisabled && addOption(statusOption)}>
                  <div className="box"></div>
                  {OptionService.getJobOptionName(customFields, statusOption)}
                  {isDisabled ? <InfoTooltip title={"Workflow customer asset selection is disabled"} /> : ""}
                  <span className="status-description">{isJobItem ? "Add Customer Assets" : statusOption.JobStatusOptionDescription}</span>
                </div>
              )
            })}
        </div>
        <div className="row space-between">
          <div className="cancel-button">
            <Button text="Cancel" extraClasses="hollow" onClick={() => setAddingOptions(false)} />
          </div>
          <div className="update">
            <Button text="Add" onClick={() => saveOptions(selectedOptions)} />
          </div>
        </div>
      </div>
      <style jsx>{`
        .overlay {
          align-items: center;
          background-color: rgba(19, 106, 205, 0.9);
          bottom: 0;
          display: flex;
          justify-content: center;
          left: 0;
          position: fixed;
          right: 0;
          top: 0;
          z-index: 9999;
        }
        .container {
          background-color: ${colors.white};
          border-radius: ${layout.cardRadius};
          padding: 2rem 3rem;
          width: 48rem;
        }
        .row {
          display: flex;
        }
        .space-between {
          justify-content: space-between;
        }
        .align-end {
          align-items: flex-end;
        }
        .title {
          color: ${colors.bluePrimary};
          font-size: 1.125rem;
          font-weight: bold;
          margin-bottom: 1rem;
        }
        .search-container {
          margin-bottom: 1rem;
        }
        .label {
          font-size: 0.875rem;
          margin-bottom: 0.5rem;
        }
        .status {
          align-items: center;
          background-color: rgba(28,37,44,0.2);
          border-radius: ${layout.buttonRadius};
          box-sizing: border-box;
          color: ${colors.darkPrimary};
          display: flex;
          font-size: 0.75rem;
          font-weight: bold;
          height: 2rem;
          justify-content: center;
          padding: 0 1rem;
          text-align: center;
        }
        .cancel-button {
          width: 6rem;
        }
        .update {
          width: 14rem;
        }
        .option-container {
          max-height: 26rem;
          overflow-y: scroll;
        }
        .option {
          align-items: center;
          cursor: pointer;
          display: flex;
          height: 2rem;
        }

        
        .box {
          border: 1px solid ${colors.labelGrey};
          border-radius: ${layout.inputRadius};
          box-sizing: border-box;
          cursor: pointer;
          height: 1rem;
          margin-right: 1rem;
          opacity: 0.4;
          width: 1rem;
        }

        .option.disabled .box {
          background: ${colors.labelGrey};
        }

        .option.disabled {
          opacity: 0.5;
        }

        .selected .box {
          background-color: ${colors.bluePrimary};
          background-image: ${tickSvg};
          background-position: center;
          background-repeat: no-repeat;
          background-size: 70%;
          border: none;
          opacity: 1;
        }

        .status-description {
          margin-left: 16px;
          font-style: italic;
          color: ${colors.labelGrey};
        }
      `}</style>
    </div>
  )
}

export default StatusOptions;
