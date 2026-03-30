import React, { useState, useEffect, useRef } from 'react';
import NoSSR from "../../../utils/no-ssr";
import * as Enums from '../../../utils/enums';
import {NumberInputProps } from "@mantine/core";
import ScNumberControl from "@/components/sc-controls/form-controls/v2/sc-number-control";

const useLegacy = false;

function SCNumericInput({ name, value, label, hint = "", required = false, readOnly = false, disabled = false, error = undefined,
    format = Enums.NumericFormat.Decimal, onChange, extraClasses = "", cypress = "", min, max, signed = true, selectOnFocus = true, alignRight = false,
                            ...others }) {

    const mantineNumberSafeProps: NumberInputProps = {
        name,
        value: value ?? '',
        label,
        description: hint,
        required,
        readOnly,
        disabled,
        error,
        min,
        max
    }

    const [formatNumberProps, setFormatNumberProps] = useState<NumberInputProps>(
        format === Enums.NumericFormat.Integer ? {
           decimalScale: 0,
           // removeTrailingZeros: true
       } : format === Enums.NumericFormat.Percentage ? {
           decimalScale: 2,
           // removeTrailingZeros: true
       } : format === Enums.NumericFormat.Currency ? {
            decimalScale: 2,
            fixedDecimalScale: true,
            // removeTrailingZeros: false
        } : format === Enums.NumericFormat.Decimal ? {
            decimalScale: 2,
            // removeTrailingZeros: true
        } : {}
    );

    const ref = useRef<HTMLInputElement>(null);
    // ref value is automatically set - not needed to set again when value is provided
    /*useEffect(() => {
        if (helper.isSafari()) return;
        setTimeout(() => {
            if (ref.current && +value) {
                ref.current.value = value;
            }
        });
    }, [value]);*/

    function onKeyDownMantine(e: any) {
        // improving integer behaviour
        // console.log(e);

        if (e.key === "e" || e.key === "E") {
            e.preventDefault();
        }

        if (format === Enums.NumericFormat.Integer) {
            if (e.key === ".") {
                e.preventDefault();
            }
            // else if ((e.key === "Backspace" || e.key === "Delete") && e.target.value === "") {
            //     e.preventDefault();
            // }
        }
    }

    /* unused
    useEffect(() => {
        if (ref.current) {

            ref.current.element?.addEventListener('wheel', function (e) {
                ref.current.element.blur();
            });

            ref.current.element?.addEventListener('mousewheel', function (e) {
                ref.current.element.blur();
            });

            if (!signed) {
                ref.current.element?.addEventListener('keydown', function (e) {
                    // prevent (-/+) from being inputted
                    if (e.keyCode == 107 || e.keyCode == 109 || e.keyCode == 187 || e.keyCode == 189) {
                        e.preventDefault();
                    }
                });
            }
        }

        return () => {
            if (ref.current) {
                ref.current.element?.removeEventListener('wheel', function () { });
                ref.current.element?.removeEventListener('mousewheel', function () { });
                ref.current.element?.removeEventListener('keydown', function () { });
            }
        }
    }, [ref.current]);*/

    /** prevent certain keys when signed = false */
    /* unused
    useEffect(() => {
        if (ref.current) {
            if (!signed) {
                ref.current?.addEventListener('keydown', function (e) {
                    // prevent (-/+) from being inputted
                    if (e.keyCode == 107 || e.keyCode == 109 || e.keyCode == 187 || e.keyCode == 189) {
                        e.preventDefault();
                    }
                });
            }
        }
    }, [ref.current, signed]);*/

    const handleInputChange = (val) => {
        // ensuring formatting for integers while typing
        if (format === Enums.NumericFormat.Integer) {
            let prevVal = val;
            val = parseInt(val?.toString() ?? "0");
            if (val !== prevVal) {
                setTimeout(() => {
                    if(ref.current) {
                        ref.current.value = val;
                    }
                });
            }
        }

        onChange && onChange({ target: ref.current, name: name, value: val });
    };

    return (

        // !useLegacy &&
        <NoSSR>
            <ScNumberControl
                hideControls
                onKeyDown={onKeyDownMantine}
                {...mantineNumberSafeProps}
                {...formatNumberProps}
                {...others}
                innerRef={ref}
                decimalSeparator="."
                onChange={handleInputChange}
                // stepHoldDelay={250}
                // stepHoldInterval={(t) => Math.max(1000 / t ** 2, 20)}
                // type="number" // this is required to stop letters being captured
                selectOnFocus={selectOnFocus}
                styles={{
                    input: {textAlign: alignRight ? 'end' : 'start'}
                }}
                // sx={{
                //     "input" : {
                //         textAlign: textAlign
                //     }
                // }}
            />
        </NoSSR>
    );
}

export default SCNumericInput;

