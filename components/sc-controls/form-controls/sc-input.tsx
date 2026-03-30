import React, { useState, useEffect, useRef } from 'react';
import NoSSR from "../../../utils/no-ssr";
import { Input } from "@progress/kendo-react-inputs";
import SCHint from './sc-hint';
import { layout } from '@/theme';
import Helper from '../../../utils/helper';
import ScTextControl from "@/components/sc-controls/form-controls/v2/sc-text-control";
import {SCInputProps} from "@/components/sc-controls/form-controls/sc-control-interfaces";
import ScPasswordControl from "@/components/sc-controls/form-controls/v2/sc-password-control";
import ScNumberControl from "@/components/sc-controls/form-controls/v2/sc-number-control";
import ScMobileNumberControl from "@/components/sc-controls/form-controls/v2/sc-mobile-number-control";
import {InputProps, NumberInputProps, PasswordInputProps, TextInputProps} from "@mantine/core";

const useKendo = false;

function SCInput(inputProps: SCInputProps) {

    const {
        name, value, label, hint, autoSelect = false, autoFocus = false, required = false,
        readOnly = false, disabled = false, type = 'text', error, onChange, onPaste, tabIndex, extraClasses, 
        cypress, onKeyPress, onFocus, placeholder, onBlur, min, mt = 'sm'
    } = inputProps;

    const mantineSafeInputProps: InputProps | NumberInputProps = {
        name,
        value,
        label,
        withAsterisk: required,
        readOnly,
        disabled,
        type,
        error,
        tabIndex,
        onPaste,
        autoFocus,
        onFocus,
        placeholder,
        onBlur, 
        min,
        mt
    }
    // const context = useContext(pageContext);

    /*if (context.usingNewComponents) {
        return <ScTextControl />;
    }*/

    const ref = useRef<HTMLInputElement>(null);

    const handleOnFocus = (e) => {

    };

    const handleOnPaste = async (e) => {
        await Helper.waitABit();
        if (onPaste) {
            onPaste(e.target.value);
        }
    };

    useEffect(() => {
        if (autoSelect && ref.current) {
            ref.current.select();
        }
    }, [autoSelect]);

    let inputName = Helper.newGuid() + "-autocomplete-off";

    const handleInputChangeTextMantine = (e) => {
        onChange && onChange({...e, target: e.nativeEvent.target, name: name, value: e.currentTarget.value});
    };

    const handleInputChangeNumberMantine = (val) => {
        onChange && onChange({target: ref.current, name: name, value: val});
    };

    const handleInputKendo = (e) => {
        onChange && onChange({target: e.target.element, name: name, value: e.value});
    };

    const [revealPassword, setRevealPassword] = useState(false);
    const [isPasswordType, setIsPasswordType] = useState(type === 'password');

    /*useEffect(() => {
        if (ref.current) {
            ref.current.element.addEventListener('wheel', function (e) {
                ref.current.element.blur();
            });
            ref.current.element.addEventListener('mousewheel', function (e) {
                ref.current.element.blur();
            });

            if (type === 'number') {
                ref.current.element.addEventListener('keydown', function (e) {
                    // prevent (-/+) from being inputted
                    if (e.keyCode === 107 || e.keyCode === 109 || e.keyCode === 187 || e.keyCode === 189) {
                        e.preventDefault();
                    }
                });
            }
        }

        return () => {
            if (ref.current) {
                ref.current.element.removeEventListener('wheel', function () {
                });
                ref.current.element.removeEventListener('mousewheel', function () {
                });
                ref.current.element.removeEventListener('keydown', function () {
                });
            }
        }
    }, [ref.current]);*/


   /*
    todo - check behaviour
    useEffect(() => {
        if (!!ref.current) {
            console.log(ref.current)
            ref.current.addEventListener('wheel', function (e) {
                ref.current?.blur();
            });
            ref.current.addEventListener('mousewheel', function (e) {
                ref.current?.blur();
            });

            if (type === 'number') {
                ref.current.addEventListener('keydown', function (e) {
                    // prevent (-/+) from being inputted
                    if (e.keyCode === 107 || e.keyCode === 109 || e.keyCode === 187 || e.keyCode === 189) {
                        e.preventDefault();
                    }
                });
            }
        }

        return () => {
            if (ref.current) {
                ref.current.removeEventListener('wheel', function () {
                });
                ref.current.removeEventListener('mousewheel', function () {
                });
                ref.current.removeEventListener('keydown', function () {
                });
            }
        }
    }, [ref.current]);*/

    return (
        type === 'password' &&
        <ScPasswordControl
            {...mantineSafeInputProps as PasswordInputProps}
            type={undefined}
            onChange={handleInputChangeTextMantine}
            // innerRef={ref}
            name={inputName}
            value={value}
            onKeyPress={(e) => onKeyPress && onKeyPress(e)}
            onBlur={onBlur}
        /> ||
        type === 'number' &&
        <ScNumberControl
            hideControls
            // stepHoldDelay={250}
            // stepHoldInterval={(t) => Math.max(1000 / t ** 2, 20)}
            {...mantineSafeInputProps}
            onChange={handleInputChangeNumberMantine}
            // innerRef={ref}
            name={inputName}
            value={value}
            decimalScale={4}
            // removeTrailingZeros
            onKeyPress={(e) => onKeyPress && onKeyPress(e)}
            onBlur={onBlur}
            min={min}
        /> ||
        type === 'tel' &&
        <ScMobileNumberControl
            {...mantineSafeInputProps}
            onChange={handleInputChangeTextMantine}
            // innerRef={ref}
            name={inputName}
            value={value}
            onKeyPress={(e) => onKeyPress && onKeyPress(e)}
            onBlur={onBlur}
        /> ||
        <ScTextControl {...mantineSafeInputProps as TextInputProps}
                       onChange={handleInputChangeTextMantine}
            // innerRef={ref}
                       name={inputName}
                       value={value}
                       onKeyPress={(e) => onKeyPress && onKeyPress(e)}
                       description={hint}
                       onBlur={onBlur}
        />
    );
}

export default SCInput;
