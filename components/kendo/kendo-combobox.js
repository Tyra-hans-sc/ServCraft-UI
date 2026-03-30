import React, { useState, useEffect, useRef, useCallback } from 'react';
import NoSSR from "../../utils/no-ssr";
import { colors, fontSizes, layout, fontFamily, shadows } from '../../theme';
import { ComboBox } from "@progress/kendo-react-dropdowns";
import useOutsideClick from "../../hooks/useOutsideClick";
import Helper from '../../utils/helper';
import KendoHint from './kendo-hint';

function KendoCombobox({name, value, textField, dataItemKey, getOptions, label, hint,
    required = false, disabled = false, triggerRefresh, cascadeDependency, addOption, error, onChange, extraClasses, pageSize = 20}) {
    
    const [val, setVal] = useState(value);

    useEffect(() => {
        setVal(value);
    }, [value]);

    const triggerRefreshOriginal = useRef(triggerRefresh);
    const cascadeDependencyOriginal = useRef(cascadeDependency);

    const dataCaching = useRef([]);

    const delay = 500;
    const [loading, setLoading] = useState(false);
    const timeout = useRef();

    const [options, setOptions] = useState([]);
    const [totalOptions, setTotalOptions] = useState(0);
    const [filter, setFilter] = useState('');

    const ref = useRef();
    const [opened, setOpened] = useState(false);

    useOutsideClick(ref, () => {
        if (opened) {
            setOpened(false);
        }
    });

    const [showing, setShowing] = useState(pageSize);

    const showMore = async () => {        
        let temp = showing * 2;
        setShowing(temp);
        await requestData(1, temp / 2, filter);
        setOpened(true);
    };
    
    const resetCache = () => {
        dataCaching.current.length = 0;
        setShowing(pageSize);
    };

    const requestData = async (skipIndex, take, filter) => {
        setLoading(true);

        getOptions(skipIndex, take, filter).then((response) => {
            let data = response.data;
            let total = response.total;

            data.forEach((element, index) => {
                if (!dataCaching.current.some(x => x.ID == element.ID)) {
                    dataCaching.current.push(element);
                }
            });

            setOptions(dataCaching.current);
            setTotalOptions(total);                   

            setLoading(false);  
        });
    };

    useEffect(() => {
        requestData(0, pageSize, filter);
        return () => {
            resetCache();
        };
    }, []);

    useEffect(() => {

        if (triggerRefreshOriginal.current === triggerRefresh) return;
        triggerRefreshOriginal.current = triggerRefresh;

        requestData(0, pageSize, filter);
        
        return () => {
            resetCache();
        };
    }, [triggerRefresh]);

    useEffect(() => {

        if (cascadeDependencyOriginal.current === cascadeDependency) return;

        setVal(null);
        requestData(0, pageSize, filter);
        
        return () => {
            resetCache();
        };
    }, [cascadeDependency]);

    const onFilterChange = (event) => {
        clearTimeout(timeout.current);
        timeout.current = setTimeout(() => {
            const filter = event.filter.value;
            resetCache();
            requestData(0, pageSize, filter);
            setFilter(filter);
        }, delay);
        setLoading(true);
    };
    
    const handleChange = (event) => {
        const value = event.target.value;        
        onChange(value);
    };

    const addNew = () => {
        setOpened(false);
        addOption.action();
    };

    const footer = () => {
        return (
            <div style={{display: "flex", justifyContent: "space-between"}}>
                <div style={{ display: "flex", flexDirection: "column", margin: "0.5rem 0 0.5rem 1rem", color: `${colors.bluePrimary}`,
                            fontSize: "0.875rem",
                            fontWeight: "bold",
                            cursor: "pointer" }}>
                    {addOption ? 
                        <span onClick={() => addNew()}>{addOption.text}</span> : ''
                    }
                </div>
                {dataCaching.current.length < totalOptions ?
                    <div style={{
                            display: "flex",
                            flexDirection: "column",
                            margin: "0.5rem 1rem 0 0.5rem",
                            color: `${colors.bluePrimary}`,
                            fontSize: "0.875rem",
                            fontWeight: "bold",
                            cursor: "pointer",
                        }}
                    >
                        <span onClick={() => showMore()}>Show more</span>
                    </div>: ''
                }
            </div>
        );
    };

    return (
        <div className={`kendo-combobox-container ${extraClasses}`} ref={opened ? ref : null}>
            <NoSSR>
                <ComboBox
                    disabled={disabled}
                    name={name}
                    data={options}
                    dataItemKey={dataItemKey}
                    textField={textField}
                    value={val}
                    label={required ? label + " *" : label}                
                    filterable={true}
                    onFilterChange={onFilterChange}
                    onChange={handleChange}
                    opened={opened}
                    onOpen={() => setOpened(true)}
                    loading={loading}
                    validationMessage={error}
                    valid={error ? false : true}
                    popupSettings={{
                        height: "210px",
                    }}
                    style={{
                        width: "100%",
                    }}
                    footer={footer()}
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

export default KendoCombobox;
