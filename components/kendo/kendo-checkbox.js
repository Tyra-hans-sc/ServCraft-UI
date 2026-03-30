import React, { useState, useEffect } from 'react';
import NoSSR from "../../utils/no-ssr";
import { colors, layout } from '../../theme';
import { Checkbox } from "@progress/kendo-react-inputs";

function KendoCheckbox({name, value, label, disabled = false, onChange, extraClasses}) {

    const [checked, setChecked] = useState(false);

    useEffect(() => {
        if (value === true || value === false) {
            setChecked(value);
        } else {
            setChecked(false);
        }
    }, [value]);
  
    const handleChange = (event) => {
      setChecked(event.value);
      onChange(event.value);
    };

    return (
        <div className={`kendo-checkbox-container ${extraClasses}`}>
            <NoSSR>
                <Checkbox
                    name={name}
                    checked={checked}
                    onChange={handleChange}
                    label={label}
                    disabled={disabled}
                />
            </NoSSR>
            <style jsx>{`
                .kendo-checkbox-container {                    
                    margin-top: 1rem;
                }
            `}</style>
        </div>
    );
}

export default KendoCheckbox;
