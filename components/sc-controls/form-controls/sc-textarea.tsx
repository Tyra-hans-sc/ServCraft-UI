import React from 'react';
import { colors } from '@/theme';
import NoSSR from "../../../utils/no-ssr";
import { TextArea } from "@progress/kendo-react-inputs";
import SCHint from './sc-hint';
import ScTextAreaControl from "@/components/sc-controls/form-controls/v2/ScTextAreaControl";
import { TextareaProps } from "@mantine/core";
import { SCTextAreaProps } from './sc-control-interfaces';

const useLegacy = false;

function SCTextArea(inputProps: SCTextAreaProps & TextareaProps) {

    const { name, value, label, rows = 4, maxRows = 10, autoSize = true, hint, required = false, readOnly = false,
        error, onChange, tabIndex, extraClasses, backgroundColor, cypress, placeholder, customProps, onBlur, onFocus,
        autoFocus = false, maxLength = 4000, disabled = false, mt = 'sm', maw, width, ...taProps } = inputProps;

    const textAreaSafeProps: TextareaProps = {
        name,
        value,
        label,
        rows,
        description: hint,
        withAsterisk: required,
        readOnly,
        error,
        tabIndex,
        placeholder,
        onFocus,
        onBlur,
        autoFocus,
        maxLength,
        disabled,
        mt, maw, w: width
    }

    const handleInputChangeMantine = (e) => {
        onChange && onChange({ ...e, target: e.nativeElement, name: name, value: e.currentTarget.value });
    };

    const handleInputKendo = (e) => {
        onChange && onChange({ target: e.target.element, name: name, value: e.value });
    };

    return (
        !useLegacy &&
        <NoSSR>
            <ScTextAreaControl
                {...textAreaSafeProps}
                onChange={handleInputChangeMantine}
                style={{ backgroundColor }}
                minRows={rows}
                maxRows={maxRows}
                autosize={autoSize}
                {...customProps}
                {...taProps}
            />
        </NoSSR>
        ||
        /*Legacy: */
        <div className={`textarea-container ${extraClasses}`}>
            <label className="custom-label" htmlFor={name + "-autocomplete-off"}>{required ? label + " *" : label}</label>
            <NoSSR>
                <TextArea
                    name={name + "-autocomplete-off"}
                    value={value == null ? undefined : value}
                    onChange={handleInputKendo}
                    rows={rows}
                    tabIndex={tabIndex}
                    validationMessage={error}
                    valid={!error}
                    className={cypress}
                    style={{ backgroundColor: backgroundColor ? backgroundColor : 'white' }}
                />
            </NoSSR>
            {hint && !error ?
                <SCHint value={hint} extraClasses={''} /> : ''
            }
            {error ?
                <SCHint value={error} extraClasses="error" /> : ''
            }
            <style jsx>{`
                .textarea-container {
                    margin-top: 0.5rem;
                }
                .custom-label {
                    color: ${colors.labelGrey};
                    opacity: 0.75;
                    display: block;
                    font-size: 0.75rem;
                }
            `}</style>
        </div>
    );
}

export default SCTextArea;
