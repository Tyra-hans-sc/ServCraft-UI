import React, { useState, useEffect } from 'react';
import NoSSR from "../../utils/no-ssr";
import { DatePicker } from '@progress/kendo-react-dateinputs';
import Time from '../../utils/time';
import KendoHint from './kendo-hint';

function KendoDatePicker({name, value, label, error, hint, required, disabled, changeHandler, extraClasses}) {

  const [val, setVal] = useState();

  useEffect(() => {
    if (value) {
      setVal(value ? Time.parseDate(value) : null);
    } else {
      setVal(null);
    }
  }, [value]);

  const onDatePickerChange = (e) => {
    let date = Time.getDateWithTimezoneOffset(e.value);
    setVal(date);
    changeHandler(date);
  };

  return (
    <div className={`kendo-datepicker-container ${extraClasses}`}>

      <NoSSR>
        <DatePicker 
          name={name}
          label={label}
          value={val} 
          onChange={onDatePickerChange} 
          format={"yyyy-MM-dd"}
          disabled={disabled ? disabled : false}
        />
      </NoSSR>

      {hint && !error ? 
        <KendoHint value={hint} /> : ''
      }
      {error ? 
        <KendoHint value={error} extraClasses="error" /> : ''
      }
      
      <style jsx>{`        
        .kendo-datepicker-container {
          margin-top: 0.5rem;
        }        
      `}</style>
    </div>
  );
} 

export default KendoDatePicker;
