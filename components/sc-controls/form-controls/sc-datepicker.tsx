import React, { useState, useEffect, useRef, ReactNode } from 'react';
import NoSSR from "../../../utils/no-ssr";
import Time from '../../../utils/time';
import { DateInputProps } from "@mantine/dates";
import { ScDatePickerProps } from "@/components/sc-controls/form-controls/sc-control-interfaces";
import 'dayjs/locale/en';
import ScDateControl from "@/components/sc-controls/form-controls/v2/ScDateControl";


const useLegacy = false;

function SCDatePicker(inputProps: ScDatePickerProps) {

    const { name, value, label, error, hint, required, disabled, changeHandler, extraClasses, cypress, minDate, maxDate, canClear = false, onChange, icon, className, withAsterisk, readOnly, ...otherDateInputProps } = inputProps;

    const datePickerProps: DateInputProps = {
        name,
        label,
        error,
        description: hint,
        required,
        disabled,
        minDate: minDate ? Time.parseDate(minDate) : minDate,
        maxDate: maxDate ? Time.parseDate(maxDate) : maxDate,
        rightSection: icon,
        className,
        withAsterisk,
        readOnly,
        ...otherDateInputProps
        // classNames: extraClasses
    };

    // const isMobile = useMediaQuery('(max-width: 755px)');

    const ref = useRef<HTMLInputElement>(null);
    const [val, setVal] = useState<Date | null>(value && new Date(value) || null);

    useEffect(() => {
        if (value) {
            if (Time.isValidDate(Time.parseDate(value))) {
                setVal(value ? Time.parseDate(value) : null);
            } else {
                setVal(null);
            }
        } else {
            setVal(null);
        }
    }, [value]);

    const handleMantineDatePickerChange = (e: Date | null) => {
        setVal(e);
        changeHandler && changeHandler({ target: ref.current, name: name, value: e ? Time.toISOString(e) : null });
        onChange && onChange(e ? Time.toISOString(e) : null);
    }

    const onDatePickerChange = (e) => {
        if (e && e.value !== null) {
            let date = Time.parseDate(e.value);
            let valueTemp: any = value;
            if (!valueTemp) {
                valueTemp = Time.toISOString(Time.today(), true, true);
            }
            let dateValue = Time.updateDate(valueTemp, date);
            let stringValue = Time.toISOString(dateValue, true, true, true);
            setVal(dateValue);

            if (e.target.validity.valid && changeHandler) {
                changeHandler({ target: e.target.element, name: e.target.name, value: stringValue });
            }
        }
        else {
            changeHandler && changeHandler({ target: e.target.element, name: e.target.name, value: null });
        }
    };

    const rightSectionMantine = (): ReactNode => {
        return val && !disabled && canClear && <div style={{ display: "flex", pointerEvents: "none", position: "absolute" }}>
            <div style={{ paddingTop: "6px" }} >
                <>
                    <span style={{ pointerEvents: "all", cursor: "pointer" }}
                        onClick={() => handleMantineDatePickerChange(null)}>
                        <img src="/specno-icons/clear.svg" />
                    </span>
                </>
            </div>

            <style jsx>{`
                :global(.mantine-DatePicker-rightSection) {
                    width: 0px;
                    right: 16px;
                    background: red;
                }
            `}</style>
        </div>;
    }

    return (
        <NoSSR>
            <ScDateControl
                // innerRef={ref}
                {...datePickerProps}
                value={val}
                onChange={handleMantineDatePickerChange}
                rightSection={rightSectionMantine()}
            />
        </NoSSR>
    );
}

export default SCDatePicker;
