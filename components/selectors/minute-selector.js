import { useState, useEffect, useRef } from "react";
import { colors, fontFamily, fontSizes, layout } from "../../theme";
import SCInput from "../sc-controls/form-controls/sc-input";
import SCComboBox from "../sc-controls/form-controls/sc-combobox";
import Helper from '../../utils/helper';
import SCDropdownList from "../sc-controls/form-controls/sc-dropdownlist";


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

function MinuteSelector({name, label, hint, value, onChange, required = false, readOnly = false, error, defaultUnit = "Minute", singleColumnView = false, 
    cypressInput, cypressCombo}) {

    const [displayValue, setDisplayValue] = useState(null);
    const [displayUnit, setDisplayUnit] = useState(defaultUnit);
    const [unitOptions] = useState(["Minute", "Hour", "Day", "Week", "Month"]);

    useEffect(() => {
        let [val, unit, initialized] = calc(value);
        if (val === 0) {
            unit = defaultUnit;
        }
        setDisplayUnit(unit);
        setDisplayValue(val);

        let minutes = uncalc(val, unit);
        onChange(minutes);
        // onChange(val);
    }, []);

    const handleChange = (num) => {
        if (Helper.isNullOrWhitespace(num)) {
            setDisplayValue(0);
            onChange(0);
            return;
        }

        let val = parseFloat(num);
        if (isNaN(val)) {
            setDisplayValue(displayValue);
            return;
        }

        val = Math.round(val);
        setDisplayValue(val);

        let minutes = uncalc(val, displayUnit);
        onChange(minutes);
    };

    const unitSelected = (unit) => {
        setDisplayUnit(unit);
        let minutes = uncalc(displayValue, unit);
        onChange(minutes);
    };

    return (
        <>
            <table className="table-full">
                <tbody>
                    <tr>
                        <td className="padding-right">
                            <SCInput 
                                name={name}
                                value={displayValue}
                                label={label}
                                required={required}
                                readOnly={readOnly}
                                error={error}
                                onChange={(e) => handleChange(e.value)}
                                cypress={cypressInput}
                                hint={hint}
                            />
                        </td>
                        <td className="padding-left">
                            <SCDropdownList 
                                name="Unit"
                                label="Unit"
                                value={displayUnit}
                                options={unitOptions}
                                onChange={unitSelected}
                                disabled={readOnly}
                                error={error}
                                cypress={cypressCombo}
                            />
                        </td>
                    </tr>
                </tbody>
            </table>

            <style jsx>{`        
                table.table-full {
                    width: ${singleColumnView ? layout.inputWidth : '100%'};
                }

                table.table-full td {
                    vertical-align: top;
                }
                td.padding-right {
                    padding-right: 8px;
                }
                td.padding-left {
                    padding-left: 8px;
                }         
                td {
                    width: 50%;
                }                        
        `}</style>
        </>
    );
}

export default MinuteSelector;
