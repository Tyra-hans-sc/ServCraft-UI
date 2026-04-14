import { TimePicker } from '@progress/kendo-react-dateinputs';
import React, { useState, useEffect } from 'react';
import { colors, fontSizes, layout, fontFamily } from '../../theme';
import Time from '../../utils/time';

function KendoTimePicker({ value, label, error, required, disabled, changeHandler, format = "HH:mm", extraClasses }) {

  const [val, setVal] = useState();

  useEffect(() => {
    if (value) {
      setVal(value ? Time.parseDate(value) : null);
    } else {
      setVal(null);
    }
  }, [value]);

  const onTimePickerChange = (e) => {
    let date = Time.parseDate(e.value);
    if (format.indexOf("ss") === -1) {
      date.setSeconds(0);
    }
    setVal(date);
    changeHandler(date);
  }

  const steps = {
    hour: 1,
    minute: 1,
    second: 1
  };

  return (
    <div className={`container ${extraClasses}`}>
      <div className="row">
        <label>{label}</label>
        {error && error != ''
          ? <div className="label error">{error}</div>
          : required
            ? <div className="label">Required</div>
            : ''
        }
      </div>

      <TimePicker
        onChange={onTimePickerChange}
        format={format}
        value={val}
        steps={steps}
        formatPlaceholder={{ hour: 'HH', minute: 'MM', second: 'SS' }}
        nowButton={true}
        disabled={disabled ? disabled : false}
      />

      <style jsx>{`
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

export default KendoTimePicker;
