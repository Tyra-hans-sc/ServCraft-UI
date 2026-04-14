import React, { useState, useEffect } from 'react';
import NoSSR from "../../../utils/no-ssr";
import { MaskedTextBox } from "@progress/kendo-react-inputs";
import SCHint from './sc-hint';

function SCMaskedInput ({name, value, label, hint, required = false, error, onChange, extraClasses}) {

    const [val, setVal] = useState();

    useEffect(() => {
        setVal(value === null || value === '' ? undefined : value);
    }, [value]);

    const handleOnFocus = (e) => {
        e.target.element.select();
    };

    const handleInputChange = (e) => {
        e.value = e.value.replace(/\D/g, '');
        onChange({target: e.target.element, name: e.target.name, value: e.value});
    };

    return (
        <div className={`masked-input-container ${extraClasses}`}>
            <NoSSR>
                <MaskedTextBox 
                    name={name}
                    value={val}
                    label={required ? label + " *" : label}
                    required={required}
                    validationMessage={error}
                    valid={error ? false : true}
                    onChange={handleInputChange}
                    onFocus={handleOnFocus}
                    spinners={false}
                    width="100%"
                    defaultValue="(000) 000-0000"
                    mask="(000) 000-0000"
                />
            </NoSSR>
            
            {hint && !error ? 
                <SCHint value={hint} /> : ''
            }
            {error ? 
                <SCHint value={error} extraClasses="error" /> : ''
            }
            <style jsx>{`
                .masked-input-container {                    
                    margin-top: 0.5rem;
                }
            `}</style>
        </div>
    )
}

export default SCMaskedInput;
