import React, {useState} from 'react';
import {Checkbox, CheckboxProps} from "@mantine/core";
import NoSSR from "../../../utils/no-ssr";
import { Checkbox as LegacyCheckbox} from "@progress/kendo-react-inputs";
import { SCCheckboxInterface } from './sc-control-interfaces/sc-checkbox-interfaces';
import helper from '@/utils/helper';

const useLegacy = false;

function SCCheckbox({ name, value, label, labelPlacement = "after", whiteBackground = false, title, disabled = false, onChange, onChangeFull, extraClasses, cypress, hint, indeterminate }: SCCheckboxInterface) {

    const checkBoxProps: CheckboxProps = {
        name,
        value,
        label,
        labelPosition: labelPlacement === 'before' ? 'left' : 'right',
        title,
        disabled,
        description: hint,
        indeterminate
    }

    const handleChange = (event) => {
        onChange && onChange(event.currentTarget.checked);
        onChangeFull && onChangeFull({ target: event.current, name: name, value: event.currentTarget.checked });
    };

    const handleChangeLegacy = (event) => {
        onChange && onChange(event.value);
        onChangeFull && onChangeFull({ target: event.target, name: name, value: event.value });
    };

    return (

        !useLegacy && (
            <NoSSR>
                <Checkbox
                    color={'scBlue'}
                    mt={extraClasses?.includes('no-margin') ? 0 : 'var(--mantine-spacing-sm)'}
                    onChange={handleChange}
                    checked={!!value}
                    {...checkBoxProps}
                />
            </NoSSR>
        ) ||
        <div title={title} className={`checkbox-container ${extraClasses}`}>
            <NoSSR>
                <LegacyCheckbox
                    name={name}
                    checked={helper.parseBool(value ? value : false)}
                    onChange={handleChangeLegacy}
                    label={label as any}
                    labelPlacement={labelPlacement}
                    disabled={disabled === true}
                    className={cypress}
                    style={!value && whiteBackground ? { backgroundColor: "white" } : {}}
                />
            </NoSSR>
            <style jsx>{`
                .checkbox-container {                    
                    margin-top: 0.5rem;
                }
                .no-margin {
                    margin-top: unset;
                }
                .margin-bottom {
                    margin-bottom: 0.5rem;
                }

                .margin-top {
                    margin-top: 0.5rem;
                }

            `}</style>
        </div>
    );
}

export default SCCheckbox;
