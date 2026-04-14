import React, { useState, useEffect, useRef } from 'react';
import { NumericTextBox } from "@progress/kendo-react-inputs";
import KendoHint from './kendo-hint';
import * as Enums from '../../utils/enums';

function KendoNumericInput({name, value, label, hint, required = false, readOnly = false, error, format = Enums.NumericFormat.Integer, onChange, extraClasses}) {

    const ref = useRef();

    const handleOnFocus = (e) => {
        e.target.element.select();
    };

    const handleInputChange = (e) => {
        onChange(e);
    };

    const [formatOptions, setFormatOptions] = useState({});
 
    useEffect(() => {
        if (format == Enums.NumericFormat.Decimal) {
            setFormatOptions("n2");
        }
        if (format == Enums.NumericFormat.Currency) {
            // setFormatOptions({
            //     style: "currency",
            //     currency: "ZA",
            //     currencyDisplay: "name",
            // });
            setFormatOptions("n2");
        }
        if (format == Enums.NumericFormat.Percentage) {
            setFormatOptions("n2");
        }
    }, [format]);

    return (
        <div className={`kendo-numeric-input-container ${extraClasses}`}>
            <NumericTextBox 
                ref={ref}
                name={name}
                value={value}
                label={required ? label + " *" : label}
                required={required}
                validationMessage={error}
                valid={error ? false : true}
                onChange={handleInputChange}
                onFocus={handleOnFocus}
                spinners={false}
                format={formatOptions}
                width="100%"
                readOnly={readOnly}
            />
            {hint && !error ? 
                <KendoHint value={hint} /> : ''
            }
            {error ? 
                <KendoHint value={error} extraClasses="error" /> : ''
            }
            <style jsx>{`
                .kendo-numeric-input-container {                    
                    margin-top: 0.5rem;
                }
            `}</style>
        </div>
    );
}

export default KendoNumericInput;
