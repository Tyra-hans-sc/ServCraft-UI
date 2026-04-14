import React, { useState, useEffect, useRef, useCallback } from 'react';
import { colors, fontSizes, layout, fontFamily, shadows } from '../../theme';
import { DropDownList } from "@progress/kendo-react-dropdowns";
import useOutsideClick from "../../hooks/useOutsideClick";
import KendoHint from './kendo-hint';

function KendoDropDownList({name, value, textField, dataItemKey, options, label, hint,
    required = false, error, onChange, extraClasses}) {

    const ref = useRef();
    const [opened, setOpened] = useState(false);

    useOutsideClick(ref, () => {
        if (opened) {
            setOpened(false);
        }
    });

    const handleChange = (event) => {
        const value = event.target.value;        
        onChange(value);
    };

    return (
        <div className={`kendo-dropdownlist-container ${extraClasses}`} ref={opened ? ref : null}>
            <DropDownList
                name={name}
                label={required ? label + " *" : label}
                data={options}
                textField={textField}
                dataItemKey={dataItemKey}
                value={value}
                onChange={handleChange}
                validationMessage={error}
                valid={error ? false : true}
            />
            {hint && !error ? 
                <KendoHint value={hint} /> : ''
            }
            {error ? 
                <KendoHint value={error} extraClasses="error" /> : ''
            }
            <style jsx>{`
                .kendo-dropdownlist-container {                    
                    margin-top: 0.5rem;
                }
            `}</style>
        </div>
    );
}

export default KendoDropDownList;
