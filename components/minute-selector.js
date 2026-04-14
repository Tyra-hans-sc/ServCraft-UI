import { useState, useEffect, useRef } from "react";
import { colors, fontFamily, fontSizes, layout } from "../theme";
import SelectInput from "./select-input";
import Helper from '../utils/helper';

const MinuteSelector = ({ label, clickHandler, blurHandler, name, error, required, placeholder,
    value, changeHandler, extraClasses, tabIndex, readOnly, autoFocus, defaultUnit = "Minute" }) => {

    const ref = useRef();

    const focusHandler = (e) => {
        ref.current.select();
    };

    const [displayValue, setDisplayValue] = useState(null);
    const [displayUnit, setDisplayUnit] = useState(defaultUnit);
    const [unitOptions] = useState(["Minute", "Hour", "Day", "Week", "Month"])

    const calc = (inputVal) => {
        let val = parseFloat(inputVal);
        if (isNaN(val)) {
            return [0, "Minute", true];
        }

        let minute = 1;
        let hour = 60 * minute;
        let day = 24 * hour;
        let week = 7 * day;
        let month = 43833; // round number (average 30.44 days a month)

        let unit = "Minute";

        if (val > 0) {
            let monthVal = val / month;
            if (monthVal === Math.round(monthVal)) {
                unit = "Month";
                val = monthVal;
            } else {
                let weekVal = val / week;
                if (weekVal === Math.round(weekVal)) {
                    unit = "Week";
                    val = weekVal;
                } else {
                    let dayVal = val / day;
                    if (dayVal === Math.round(dayVal)) {
                        unit = "Day";
                        val = dayVal;
                    } else {
                        let hourVal = val / hour;
                        if (hourVal === Math.round(hourVal)) {
                            unit = "Hour";
                            val = hourVal;
                        } else {
                            val = Math.round(val);
                        }
                    }
                }
            }
        }
        return [val, unit, false];
    };

    const uncalc = (inputVal, inputUnit) => {

        let minute = 1;
        let hour = 60 * minute;
        let day = 24 * hour;
        let week = 7 * day;
        let month = 43833; // round number (average 30.44 days a month)

        switch (inputUnit) {
            case "Minute":
                return inputVal;
            case "Hour":
                return hour * inputVal;
            case "Day":
                return day * inputVal;
            case "Week":
                return week * inputVal;
            case "Month":
                return month * inputVal;
        }
    };

    useEffect(() => {
        let [val, unit, initialized] = calc(value);
        if (val === 0) {
            unit = defaultUnit;
        }
        setDisplayUnit(unit);
        setDisplayValue(val);
        let minutes = uncalc(val, unit);
        changeHandler(minutes);
    }, []);

    const onChange = (e) => {
        if (Helper.isNullOrWhitespace(e.target.value)) {
            setDisplayValue(0);
            changeHandler(0);
            return;
        }

        let val = parseFloat(e.target.value);
        if (isNaN(val)) {
            setDisplayValue(displayValue);
            return;
        }

        val = Math.round(val);
        setDisplayValue(val);

        let minutes = uncalc(val, displayUnit);
        changeHandler(minutes);
    };

    const unitSelected = (unit) => {
        setDisplayUnit(unit);
        let minutes = uncalc(displayValue, unit);
        changeHandler(minutes);
    }

    return (<>

        <table className="table-full">
            <tbody>
                <tr>
                    <td className="padding-right">
                        <div className={"input-container " + extraClasses}>
                            <div className="row">
                                <label>{label}</label>
                                {error && error != ""
                                    ? <div className="label error">{error}</div>
                                    : required
                                        ? <div className={`label`}>Required</div>
                                        : ""
                                }
                            </div>
                            <input
                                ref={ref}
                                name={name}
                                onClick={clickHandler}
                                onChange={onChange}
                                onFocus={focusHandler}
                                onBlur={blurHandler}
                                onKeyDown={onChange}
                                onKeyUp={onChange}
                                placeholder={placeholder}
                                tabIndex={tabIndex}
                                type="number"
                                value={displayValue}
                                readOnly={readOnly === true}
                                autoFocus={autoFocus === true}
                            />
                        </div>
                    </td>
                    <td className="padding-left">
                        <SelectInput
                            label="Unit"
                            value={displayUnit}
                            options={unitOptions}
                            type="enum"
                            setSelected={unitSelected}
                            disabled={readOnly}
                        />
                    </td>
                </tr>
            </tbody>
        </table>

        <style jsx>{`        

        table.table-full {
            width: 100%;
        }

        td.padding-right {
            padding-right: 8px;
        }

        td.padding-left {
            padding-left: 8px;
        }

        .input-container {
          background-color: ${colors.formGrey};
          border-radius: ${layout.inputRadius};
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          height: fit-content;
          margin-top: 0.5rem;
          padding: 0.5rem;
          position: relative;
          width: 100%;
          min-height: 3.6rem;
        }

        input {
          background: none;
          border: none;
          box-shadow: none;
          color: ${colors.darkPrimary}; 
          font-size: ${fontSizes.body};
          height: 100%;
          outline: none;
          padding-left: 0;
          font-family: ${fontFamily};
        }

      input::-ms-clear {
        display: none;
      }

      .password-eye {
        position: absolute;
        top: 0.5rem;
        right: 0.5rem;
        cursor: pointer;
      }

      .password-required-label {
        position: absolute;
        right: 2rem;
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

        .row {
          display: flex;
          justify-content: space-between;
        }

        .error {
          color: ${colors.warningRed};
          text-align: right;
        }

        .initial {
          align-items: center;
          background-color: ${colors.bluePrimary};
          border-radius: 1.25rem;
          color: ${colors.white};
          display: flex;
          font-weight: bold;
          height: 2.5rem;
          justify-content: center;
          left: 0.5rem;
          margin-right: 1rem;
          position: absolute;
          top: 0.5rem;
          width: 2.5rem;
        }

        .button-height {
          height: 2.5rem;
          min-height: 2.5rem;
          margin-top: 0;
        }
      `}</style>
    </>)
};

export default MinuteSelector;