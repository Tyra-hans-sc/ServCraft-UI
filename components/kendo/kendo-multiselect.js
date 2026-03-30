import React, { useEffect, useState } from 'react';
import { MultiSelect } from '@progress/kendo-react-dropdowns';
import { filterBy } from '@progress/kendo-data-query';
import { colors, fontSizes, layout, fontFamily } from '../../theme';

function KendoMultiSelect({availableOptions, selectedOptions, textField, dataItemKey, handleChange, placeholder, label, error, required = false, disabled = false}) {

  const [disabledLocal, setDisabledLocal] = useState(false);

  useEffect(() => {
    setDisabledLocal(disabled);
  }, [disabled]);

  const [filteredOptions, setFilteredOptions] = useState([]);
  let pageSize = 10;

  const initialMultiSelectState = {
    data: [],
    total: 0,
    skip: 0,
  };

  const [multiSelectState, setMultiSelectState] = useState(initialMultiSelectState);

  useEffect(() => {
    if (availableOptions) {
      setFilteredOptions(availableOptions);
      setMultiSelectState({...multiSelectState,
        data: availableOptions.slice(0, 10),
        total: availableOptions.length});
    }
  }, [availableOptions]);

  const onChange = (e) => {
    handleChange(e.target.value);
  };

  const onFilterChange = (event) => {
    let filter = event.filter;
    let filteredData = filterBy(availableOptions.slice(), filter);
    setFilteredOptions(filteredData);

    const data = filteredData.slice(0, pageSize);
    setMultiSelectState({data: data, skip: 0, total: filteredData.length});
  };

  const pageChange = (event) => {
    const skip = event.page.skip;
    const take = event.page.take;
    
    const data = filteredOptions.slice(skip, skip + take);
    setMultiSelectState({ ...multiSelectState, data: data, skip: skip });
  };

  const getPopupHeight = () => {
    let height = 200;

    if (availableOptions) {
      let numberOptions = availableOptions.length;
      if (numberOptions <= 5) {
        height = numberOptions * 40;
      }
    }

    return `${height}px`;
  };

  return (
    <div className="multiselect-container">

      <div className="multiselect-label-container">
        {label ?
          <div className="multiselect-label">
            {label}
          </div>
          : ''
        }
        {error ? 
          <div className="multiselect-error">
            {error}
          </div>
          : ''
        }
        {required && (!error || error == '') ? 
          <div className="multiselect-required">
            Required
          </div> 
          : ''
        }
      </div>
      
      <MultiSelect
        data={multiSelectState.data}
        onChange={onChange}
        value={selectedOptions}
        textField={textField}
        dataItemKey={dataItemKey}
        filterable={true}
        onFilterChange={onFilterChange}
        virtual={{
          total: multiSelectState.total,
          pageSize: pageSize,
          skip: multiSelectState.skip,
        }}
        onPageChange={pageChange}
        placeholder={placeholder ? placeholder : ''}
        disabled={disabledLocal}
        popupSettings={{
          height: getPopupHeight(),
        }}
      />

      <style jsx>{`
        .multiselect-container {
          background-color: ${colors.formGrey};
          border-radius: ${layout.inputRadius};
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          height: fit-content;
          padding: 0.5rem;
          width: 100%;
          margin-top: 0.5rem;
          min-height: 3.6rem;
        }
        .multiselect-label-container {
          display: flex;
          justify-content: space-between;
        }
        .multiselect-label {
          color: ${colors.labelGrey}; 
          font-size: ${fontSizes.label};
        }
        .multiselect-error {
          font-size: ${fontSizes.label};
          color: ${colors.warningRed};
          text-align: right;
        }
        .multiselect-required {
          color: ${colors.labelGrey}; 
          font-size: ${fontSizes.label};
          text-align: right;
        }
      `}</style>
    </div>
  );
}

export default KendoMultiSelect;
