import React, { useState, useEffect, useRef, useCallback } from 'react';
import NoSSR from "../../../utils/no-ssr";
import { colors, fontSizes, layout, fontFamily, shadows } from '../../../theme';
import { DropDownList } from "@progress/kendo-react-dropdowns";
import { useOutsideClick } from 'rooks';
import SCHint from './sc-hint';
import Helper from '../../../utils/helper';
import SCComboBox from './sc-combobox';
import { ScDropDownListInputProps } from './sc-control-interfaces/sc-dropdownlist-interfaces';

const useLegacy = false;

function SCDropdownList(inputProps: ScDropDownListInputProps) {

    const { name, value, dataItemKey, textField, options, label, hint, error, onChange, itemRender = null, valueRender = null,
        required = false, disabled = false, extraClasses, itemRenderMantine, canClear, canSearch = false,
        iconMantine, placeholder, addOption, groupField, hideSelected = false, onBlur, autoFocus = false, style, triggerRefresh, resetValue,
        suppressInternalValueChange = false, readOnly = false, mt, dataItemKeyAsValue = false, size, mantineComboboxProps } = inputProps;

    const [val, setVal] = useState(value);

    useEffect(() => {
        setVal(value);
    }, [value]);

    const containerRef = useRef(null);

    const handleChange = (event) => {
        const value = event.target.value;
        onChange && onChange(value);
        !suppressInternalValueChange && setVal(value);
    };

    const handleChangeMantine = (event) => {
        onChange && onChange(event);
        !suppressInternalValueChange && setVal(event);
    };

    const renders = itemRender && valueRender ? {
        itemRender: itemRender,
        valueRender: valueRender
    } : itemRender ? {
        itemRender: itemRender
    } : valueRender ? {
        valueRender: valueRender
    } : {};

    return (
        <div ref={containerRef} className={`${val ? 'dropdown-container' : 'dropdown-container-placeholder'} ${extraClasses}`}>
            {useLegacy ?
                <NoSSR>
                    {val ? <label className="custom-label" htmlFor={name + "-autocomplete-off"}>{required ? label + " *" : label}</label> : ''}
                    <DropDownList
                        name={name}
                        data={options}
                        dataItemKey={dataItemKey}
                        textField={textField}
                        value={val}
                        onChange={handleChange}
                        label={!val ? required ? label + " *" : label : ''}
                        validationMessage={error}
                        valid={error ? false : true}
                        disabled={disabled}
                        {...renders}
                        style={{
                            width: "100%",
                        }}
                    // popupSettings={{
                    //     width: 'fit-content'
                    // }}
                    />

                    {error ?
                        <SCHint value={error} extraClasses="error" /> : ''
                    }
                </NoSSR>
                :
                <SCComboBox
                    required={required}
                    name={name}
                    options={options}
                    dataItemKey={dataItemKey}
                    textField={textField}
                    value={val}
                    onChange={handleChangeMantine}
                    label={label}
                    error={error}
                    disabled={disabled}
                    canSearch={canSearch}
                    canClear={canClear ?? !required}
                    hint={hint}
                    itemRenderMantine={itemRenderMantine}
                    itemRender={itemRender ?? undefined}
                    valueRender={valueRender ?? undefined}
                    iconMantine={iconMantine}
                    placeholder={placeholder}
                    addOption={addOption}
                    groupField={groupField}
                    hideSelected={hideSelected}
                    onBlur={onBlur}
                    autoFocus={autoFocus}
                    style={style}
                    resetValue={resetValue}
                    suppressInternalValueChange={suppressInternalValueChange}
                    mt={mt}
                    readOnly={readOnly}
                    dataItemKeyAsValue={dataItemKeyAsValue}
                    size={size}
                    mantineComboboxProps={mantineComboboxProps}
                />
            }
            {/*{hint && !error ?
                <SCHint value={hint} /> : ''
            }*/}
            <style jsx>{`
                ${useLegacy ? `
                .dropdown-container {                    
                    margin-top: 0.5rem;
                }
                ` : ``}
                .dropdown-container-placeholder {
                    margin-top: 22px;
                }
                .custom-label {
                    color: ${colors.labelGrey};
                    opacity: 0.75;
                    display: block;
                    font-size: 0.75rem;
                }
                .input-width {
                    width: ${layout.inputWidth};
                }
            `}</style>
        </div>
    )
}

export default SCDropdownList;
