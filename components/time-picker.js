import TimePicker from 'rc-time-picker';
import React, { useState } from 'react';
import moment from 'moment';
import { colors, fontSizes, layout, fontFamily } from '../theme';

function ReactTimePicker({value, label, error, required, changeHandler}) {

  const [val, setVal] = useState(value ? moment(value) : null);
  const format = 'HH:mm';

  const onTimePickerChange = (item) => {
    setVal(moment(item).seconds(0));
    changeHandler(moment(item).seconds(0));
  }

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
      <TimePicker
        showSecond={false}
        className="time-picker"
        popupClassName="time-picker-popup"
        format={format}
        placeholder={'HH:MM'}
        onChange={onTimePickerChange}
        value={val}
        inputReadOnly
        allowEmpty={false}
      />

      <style jsx>{`
        .container {
          background-color: ${colors.formGrey};
          border-radius: ${layout.inputRadius};
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          height: fit-content;
          padding: 0.5rem;
          width: 100%;
          margin-top: 1rem;
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
    `}</style>
    </div>
  )
}

export default ReactTimePicker;
