import { Select } from "@mui/material";
import { useRef, useState } from "react";
import { colors } from "../../../theme";
import SCHint from "./sc-hint";
import { useMantineTheme } from "@mantine/core";

export default function SCNativeSelect({ name, label, onChange, options, labelField, valueField, valueModifier, allowNull = false, error = undefined, required = false, value }) {


    const theme = useMantineTheme();

    function handleChange(e) {
        let val = valueModifier ? valueModifier(e.target.value) : e.target.value;

        onChange && onChange({ name: e.target.name, value: val, target: e.target });
    };

    const getOptions = () => {

        const preppedOptions = [...options];

        const firstItemIsObject = preppedOptions.length > 0 && typeof preppedOptions[0] === "object";

        if (allowNull) {
            if (firstItemIsObject) {
                preppedOptions.unshift({
                    [valueField]: null,
                    [labelField]: ""
                });
            } else {
                preppedOptions.unshift(null);
            }
        }

        return preppedOptions.map((item, key) => <option value={firstItemIsObject ? item[valueField] : item} key={key}
            selected={firstItemIsObject ? item[valueField] === value : item === value}>
            {firstItemIsObject ? item[labelField] : item}
        </option>);
    }

    return (<>

        <div className="combobox-container">
            <label className="custom-label" htmlFor={name}>{label}</label>
            <Select
                name={name}
                inputProps={{ id: name }}
                onChange={handleChange}
                native={true}
                style={{ width: "100%", height: "37px" }}
                children={getOptions()}
                error={!!error}
            >
            </Select>
            {error ?
                <SCHint value={error} extraClasses="error" /> : ''
            }
        </div>

        <style jsx>{`

        .combobox-container {                    
            margin-top: 0.5rem;
        }

        .custom-label {
            color: ${theme.colors.gray[9]};
            display: block;
            font-size: ${theme.fontSizes.sm}px;
            font-weight: 500;
            margin-top: ${theme.spacing.sm}px;
            font-family: ${theme.fontFamily};
        }

        ${required ? `

        .custom-label:after {
            content: " *";
            color: ${theme.colors.red[5]};
        }
        
        ` : ""}
        
       
        `}</style>
    </>);
}
