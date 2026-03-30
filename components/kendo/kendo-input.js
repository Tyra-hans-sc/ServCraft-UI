import * as React from "react";
import NoSSR from "../../utils/no-ssr";
import { colors, layout } from '../../theme';
import { Input } from "@progress/kendo-react-inputs";
import KendoHint from './kendo-hint';

function KendoInput({name, value, label, hint, required = false, readOnly = false, type, error, onChange, extraClasses}) {

    const handleInputChange = (e) => {
        onChange(e);
    };

    return (
        <div className={`kendo-input-container ${extraClasses}`}>
            <NoSSR>
                <Input 
                    name={name}
                    value={value === null ? undefined : value}
                    label={required ? label + " *" : label}
                    type={type ? type : "string"}
                    required={required}
                    validationMessage={error}
                    valid={error ? false : true}
                    onChange={handleInputChange}
                    style={{
                        width: "100%",
                    }}
                    readOnly={readOnly}
                />
            </NoSSR>            
            {hint && !error ? 
                <KendoHint value={hint} /> : ''
            }
            {error ? 
                <KendoHint value={error} extraClasses="error" /> : ''
            }
            <style jsx>{`
                .kendo-input-container {                    
                    margin-top: 0.5rem;
                }
            `}</style>
        </div>
    )
}

export default KendoInput;
