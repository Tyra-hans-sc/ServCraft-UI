import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ComboBox } from "@progress/kendo-react-dropdowns";
import KendoHint from './kendo-hint';

function KendoAdvancedComboBox({name, value, textField, dataItemKey, getOptions, label, hint, 
    required = false, error, onChange, extraClasses, pageSize = 20}) {

    const emptyItem = {
        [textField]: "loading...",
    };
    
    const loadingData = [];
    
    while (loadingData.length < pageSize) {
        loadingData.push({ ...emptyItem });
    }

    const dataCaching = useRef([]);
    const pendingRequest = useRef();
    const requestStarted = useRef(false);
    const [options, setOptions] = useState([]);
    const [totalOptions, setTotalOptions] = useState(0);
    const [filter, setFilter] = useState('');
    const skipRef = useRef(0);
    
    const resetCache = () => {
        dataCaching.current.length = 0;
    };

    const requestData = useCallback((skip, filter) => {
        if (requestStarted.current) {
            clearTimeout(pendingRequest.current);
            pendingRequest.current = setTimeout(() => {
                requestData(skip, filter);
            }, 50);
            return;
        }

        requestStarted.current = true;

        getOptions(skip, filter).then((response) => {
            let data = response.data;
            let total = response.total;

            if (data.length > 0) {
                const items = [];
    
                data.forEach((element, index) => {
                    items.push(element);
                    dataCaching.current[index + skip] = element;
                });
        
                if (skip === skipRef.current) {
                    setOptions(items);
                    setTotalOptions(total);
                }
           }

           requestStarted.current = false;
        });
    }, []);

    useEffect(() => {
        requestData(0, filter);
        return () => {
            resetCache();
        };
    }, [filter, requestData]);

    const onFilterChange = useCallback((event) => {
        const filter = event.filter.value;
        resetCache();
        requestData(0, filter);
        setOptions(loadingData);
        skipRef.current = 0;
        setFilter(filter);
    }, []);

    const shouldRequestData = useCallback((skip) => {

        // if (skip * pageSize > totalOptions) {
        //     return false;
        // }

        for (let i = 0; i < pageSize; i++) {
            if (!dataCaching.current[i + skip]) {
                return true;
            }
        }

        return false;
    }, []);

    const getCachedData = useCallback((skip) => {
        const data = [];
    
        for (let i = 0; i < pageSize; i++) {            
            data.push(dataCaching.current[i + skip] || { ...emptyItem });           
        }
    
        return data;
    }, []);

    const pageChange = useCallback(
        (event) => {
            const newSkip = event.page.skip;
        
            if (shouldRequestData(newSkip)) {
                requestData(newSkip, filter);
            }
        
            const data = getCachedData(newSkip);
            setOptions(data);
            skipRef.current = newSkip;
        },
        [getCachedData, requestData, shouldRequestData, filter]
    );

    const handleChange = useCallback((event) => {
        const value = event.target.value;
    
        if (value && value[textField] === emptyItem[textField]) {
            return;
        }
    
        onChange(value);
    }, []);

    return (
        <div className={`kendo-combobox-container ${extraClasses}`}>
            <ComboBox
                name={name}
                data={options}
                dataItemKey={dataItemKey}
                textField={textField}
                value={value}
                label={required ? label + " *" : label}
                virtual={{
                    total: totalOptions,
                    pageSize: pageSize,
                    skip: skipRef.current,
                }}
                onPageChange={pageChange}
                filterable={true}
                onFilterChange={onFilterChange}
                onChange={handleChange}
                validationMessage={error}
                valid={error ? false : true}
                popupSettings={{
                    height: "210px",
                }}
                style={{
                    width: "100%",
                }}
            />
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

export default KendoAdvancedComboBox;
