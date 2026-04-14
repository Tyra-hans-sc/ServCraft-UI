import React, { useState, useEffect, useContext, useRef } from 'react';
import NoSSR from "../../utils/no-ssr";
import { colors, fontSizes, layout, fontFamily } from '../../theme';
import { DatePicker } from '@progress/kendo-react-dateinputs';
import Time from '../../utils/time';

function KendoDatePicker({ name, value, label, error, required, disabled, changeHandler, cypress, min }) {

  const ref = useRef();

  const [val, setVal] = useState();

  useEffect(() => {
    if (value) {  
      if (Time.isValidDate(Time.parseDate(value))) {
        setVal(value ? Time.parseDate(value) : null);
      }
    } else {
      setVal(null);
    }
  }, [value]);

  const onDatePickerChange = (e) => {    

      if (e.value != null) {
          let date = Time.parseDate(e.value);

          let valueTemp = value;
          if (!valueTemp) {
              valueTemp = Time.toISOString(Time.today(), true, true);
          }
          let dateValue = Time.updateDate(valueTemp, date);
          let stringValue = Time.toISOString(dateValue, true, true, true);
          setVal(dateValue);
          if (e.target.validity.valid) {
              changeHandler(stringValue);
          }
      }
  };

  return (
    <div className="container">
      <div className="row">
        <label>{label}</label>
        {error && error != ''
          ? <div className="label error">{error}</div>
          : required
            ? <div className="label">Required</div>
            : ''
        }
      </div>
{/* 
      <DatePicker
        name={name}
        data-cy={cypress ? cypress : ''}
        value={val}
        onChange={onDatePickerChange}
        format={"yyyy-MM-dd"}
        disabled={disabled ? disabled : false}
      /> */}

      {/* <DayPickerInput
        inputProps={{disabled: props.disabled}}
        format="yyyy-MM-DD"
        formatDate={formatDate}
        parseDate={parseDate}
        placeholder={`YYYY-MM-DD`}
        onDayChange={props.changeHandler}
        value={props.date ? Time.parseDate(props.date) : undefined}
        overlayComponent={CustomOverlay}
      /> */}

      <NoSSR>
        <DatePicker
          ref={ref}
          name={name}
          data-cy={cypress ? cypress : ''}
          value={val}
          onChange={onDatePickerChange}
          format={"yyyy-MM-dd"}
          disabled={disabled ? disabled : false}         
          className='scale-picker'
          popupSettings={{className: "scale-picker"}}
          min={min ? min : undefined}
        />
      </NoSSR>

      <style jsx>{`
        .dateinput-overlay {
          z-index: 2;
          background-color: ${colors.white};
        }

        .scale-picker {
          transform: scale(0.7);
          transform-origin: 0 2rem;
        }

        .container {
          background-color: ${colors.formGrey};
          border-radius: ${layout.inputRadius};
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          height: fit-content;
          padding: 0.5rem 0.5rem 0.5rem 0.5rem;
          width: 100%;
          margin-top: 0.5rem;
          min-height: 3.6rem;
        }

        .container :global(input) {
          background: none;
          border: none;
          box-shadow: none;
          color: ${colors.darkPrimary}; 
          font-family: ${fontFamily};
          font-size: ${fontSizes.body};
          height: 100%;
          outline: none;
          width: 100%;
        }

        label, .label {
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

        .error {
          color: ${colors.warningRed};
          text-align: right;
        }

        .row {
          display: flex;
          justify-content: space-between;
        }

        .no-top-padding {
          padding-top: 0;
        }
        
      `}</style>
    </div>
  );
}

export default KendoDatePicker;
