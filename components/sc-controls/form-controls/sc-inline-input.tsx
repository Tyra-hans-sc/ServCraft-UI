import React, { useState, useEffect, useRef } from 'react';
import NoSSR from "../../../utils/no-ssr";
import { Input } from "@progress/kendo-react-inputs";
import SCHint from './sc-hint';
import { layout } from '../../../theme';
import Helper from '../../../utils/helper';
import SCInput from './sc-input';


const useLegacy = false;

function SCInlineInput({ name, value, hint, onChange, onKeyPress, tabIndex, autoFocus = false, required = false, readOnly = false, type = "text", error, extraClasses, onBlur, min, width, textAlign = "left" }) {

    const ref = useRef<any>(null);

    const handleOnFocus = (e) => {

    };

    const handleOnKeyPress = (e) => {
        if (onKeyPress) {
            onKeyPress(e);
        }
    };

    let inputName = Helper.newGuid() + "-autocomplete-off";

    const handleInputChange = (e) => {
        onChange({ target: e.target?.element, name: name, value: e.value });
    };

    useEffect(() => {
        if (ref.current) {
            ref.current.element.addEventListener('wheel', function (e) {
                ref.current.element.blur();
            });
            ref.current.element.addEventListener('mousewheel', function (e) {
                ref.current.element.blur();
            });

            if (type == 'number') {
                ref.current.element.addEventListener('keydown', function (e) {
                    // prevent (-/+) from being inputted
                    if (e.keyCode == 107 || e.keyCode == 109 || e.keyCode == 187 || e.keyCode == 189) {
                        e.preventDefault();
                    }
                });
            }
        }

        return () => {
            if (ref.current) {
                ref.current.element.removeEventListener('wheel', function () { });
                ref.current.element.removeEventListener('mousewheel', function () { });
                ref.current.element.removeEventListener('keydown', function () { });
            }
        }
    }, [ref.current]);

    return (
        <div className={`input-container ${extraClasses}`}>
            {useLegacy ? <NoSSR>
                <Input
                    ref={ref}
                    name={inputName}
                    value={value === null ? undefined : value}
                    type={type}
                    required={required}
                    validationMessage={error}
                    valid={error ? false : true}
                    onChange={handleInputChange}
                    onFocus={handleOnFocus}
                    autoFocus={autoFocus}
                    onKeyPress={handleOnKeyPress}
                    readOnly={readOnly}
                    tabIndex={tabIndex}
                    autoComplete={inputName}
                />
            </NoSSR> :
                <SCInput
                    name={inputName}
                    value={value === null ? undefined : value}
                    type={type}
                    required={required}
                    error={error}
                    onChange={handleInputChange}
                    autoFocus={autoFocus}
                    onKeyPress={handleOnKeyPress}
                    readOnly={readOnly}
                    tabIndex={tabIndex}
                    onBlur={onBlur}
                    min={min}
                // autoComplete={inputName}
                />
            }

            {hint && !error ?
                <SCHint value={hint} /> : ''
            }
            {error ?
                <SCHint value={error} extraClasses="error" /> : ''
            }
            <style jsx>{`
                .input-container {     
                    ${width ? `width: ${width};` : ""}
                }

                .input-container :global(.mantine-NumberInput-input) {
                    text-align: ${textAlign};
                }
            `}</style>
        </div>
    )
}

export default SCInlineInput;
