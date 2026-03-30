import React, { useState, useEffect } from 'react';
import TimePicker from 'react-time-picker/dist/entry.nostyle';
import Time from '../utils/time';
import { colors, fontSizes, layout, fontFamily } from '../theme';

const TimeInput = (props) => {

    const [val, setVal] = useState(props.value ? Time.getTime(props.value) : null);
    const [date, setDate] = useState(props.value ? Time.getDate(props.value) : null);

    const changeHandler = (e) => {
        if (props.changeHandler) {
            if (!e) {
                e = "00:00";
            }
            let changedVal = date + "T" + e + ":00";
            props.changeHandler(changedVal);
        }
    };

    useEffect(() => {
        setVal(props.value ? Time.getTime(props.value) : null);
        setDate(props.value ? Time.getDate(props.value) : null);
    }, [props, props.value]);

    return (
        <div className="container">
            <div className="row">
                <label>{props.label}</label>
                {props.error && props.error != ""
                    ? <div className="label error">{props.error}</div>
                    : props.required
                        ? <div className="label">Required</div>
                        : ""
                }
            </div>
            <TimePicker
                clearIcon={null}
                clockIcon={null}
                format="HH:mm"
                onChange={changeHandler}
                value={val}
                disableClock={true}
            />

            <style jsx>{`
      .container {
        background-color: ${colors.formGrey};
        border-radius: ${layout.inputRadius};
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        height: 3.5rem;
        padding: 0.5rem;
        width: 100%;
        margin-top: 1rem;
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
      }

      .row {
        display: flex;
        justify-content: space-between;
      }

      .clock-custom < div {
        z-index: 8;
      }
      
    `}</style>
        </div>
    );
};

export default TimeInput;