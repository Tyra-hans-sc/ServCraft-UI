import React, { useState, useEffect, useRef } from 'react';
import NoSSR from "../../utils/no-ssr";
import { ComboBox } from "@progress/kendo-react-dropdowns";
import useOutsideClick from "../../hooks/useOutsideClick";
import KendoHint from './kendo-hint';

function KendoSimpleCombobox({name, value, textField, dataItemKey, options = [], label, hint,
    required = false, error, onChange, extraClasses}) {
    
    const [localOptions, setLocalOptions] = useState([]);

    useEffect(() => {
        setLocalOptions(options);
    }, [options]);

    const delay = 500;
    const timeout = useRef();

    const ref = useRef();
    const [opened, setOpened] = useState(false);

    useOutsideClick(ref, () => {
        if (opened) {
            setOpened(false);
        }
    });

    const requestData = async (filter) => {
        let filteredData = [];
        if (textField) {
            filteredData = options.filter(x => {
                return x[textField].toLowerCase().includes(filter.toLowerCase());
            });
        } else {
            filteredData = options.filter(x => {
                return x.toLowerCase().includes(filter.toLowerCase());
            });
        }
        
        setLocalOptions(filteredData);
    };

    const onFilterChange = (event) => {
        clearTimeout(timeout.current);
        timeout.current = setTimeout(() => {
            const filter = event.filter.value;
            requestData(filter);
        }, delay);
    };
    
    const handleChange = (event) => {
        const value = event.target.value;        
        onChange(value);
    };

    return (
        <div className={`kendo-combobox-container ${extraClasses}`} ref={opened ? ref : null}>
            <NoSSR>
                <ComboBox
                    name={name}
                    data={localOptions}
                    dataItemKey={dataItemKey}
                    textField={textField}
                    value={value}
                    label={required ? label + " *" : label}                
                    filterable={true}
                    onFilterChange={onFilterChange}
                    onChange={handleChange}
                    opened={opened}
                    onOpen={() => setOpened(true)}
                    validationMessage={error}
                    valid={error ? false : true}
                    popupSettings={{
                        height: "210px",
                    }}
                    style={{
                        width: "100%",
                    }}
                />
            </NoSSR>
            
            {hint && !error ? 
                <KendoHint value={hint} /> : ''
            }
            {error ? 
                <KendoHint value={error} extraClasses="error" /> : ''
            }
            <style jsx>{`
                .kendo-combobox-container {                    
                    margin-top: 0.5rem;
                }
            `}</style>
        </div>
      );
}

export default KendoSimpleCombobox;
