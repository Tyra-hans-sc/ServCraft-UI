import { TimePicker as LegacyTimePicker } from '@progress/kendo-react-dateinputs';
import React, { useState, useEffect, useRef } from 'react';
import NoSSR from "../../../utils/no-ssr";
import Time from '../../../utils/time';
import SCHint from './sc-hint';
import { TimeInputProps } from "@mantine/dates";
import { ScTimePickerProps } from "./sc-control-interfaces";
import SCTimeControl, {ScTimeControlCustomProps} from "@/components/sc-controls/form-controls/v2/SCTimeControl";

const useLegacy = false;

function SCTimePicker(timePickerProps: ScTimePickerProps) {

    const {
        name,
        value,
        label,
        error,
        hint,
        required,
        disabled,
        changeHandler,
        // min,
        format = "HH:mm",
        startDateAndTime,
        endDate,
        extraClasses,
        cypress,
        mt
    } = timePickerProps;

    const scTimeControlProps: ScTimeControlCustomProps & TimeInputProps = {
        value: value || '',
        name,
        label,
        error,
        description: hint,
        required,
        disabled,
        startDateAndTime,
        endDate,
        mt
        // classNames: extraClasses
    }

    const ref = useRef<HTMLInputElement>(null);

    const [val, setVal] = useState<any>();

    useEffect(() => {
        if (value) {
            setVal(value ? Time.parseDate(value) : '');
        } else {
            setVal('');
        }
    }, [value]);


    const onTimePickerChange = (date) => {
        setVal(date);
        changeHandler({ target: ref.current, name, value: date });
    }

    const onTimePickerChangeLegacy = (e) => {
        let date = Time.parseDate(e.value);
        if (format.indexOf("ss") === -1) {
            date.setSeconds(0);
        }
        setVal(date);
        changeHandler({ target: e.target.element, name: e.target.name, value: date });
    };

    const steps = {
        hour: 1,
        minute: 15,
        second: 1
    };

    return (

        !useLegacy &&
        <NoSSR>
            <SCTimeControl
                onChange={onTimePickerChange}
                format={'24'}
                withSeconds={format?.toLowerCase().includes(":ss")}
                {...scTimeControlProps}
            />
        </NoSSR> ||

        <div className={`timepicker-container ${extraClasses}`}>
            <NoSSR>
                <LegacyTimePicker
                    name={name}
                    label={label}
                    onChange={onTimePickerChangeLegacy}
                    format={format}
                    value={val}
                    steps={steps}
                    // min={min ? min : undefined}
                    formatPlaceholder={{ hour: 'HH', minute: 'MM', second: 'SS' }}
                    nowButton={true}
                    disabled={disabled ? disabled : false}
                    className={cypress}
                />
            </NoSSR>

            {hint && !error ?
                <SCHint value={hint} /> : ''
            }
            {error ?
                <SCHint value={error} extraClasses="error" /> : ''
            }

            <style jsx>{`
              .timepicker-container {
                margin-top: 5px;
              }
            `}</style>
        </div>
    );
}

export default SCTimePicker;
