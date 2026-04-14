import {InputProps, MantineSize, MantineSpacingValues} from "@mantine/core";
import {DateInputProps, DatePickerProps, TimeInputProps} from "@mantine/dates";
import {ReactNode} from "react";

interface StandardInputProps {
    name?: string;
    value?: any;
    label?: string;
    hint?: string;
    autoSelect?: boolean;
    autoFocus?: boolean;
    required?: boolean;
    readOnly?: boolean;
    disabled?: boolean;
    type?: any; // "tel" | "text" | "email" | "password" | undefined;
    // error?: string;
    onChange?: (x) => void;
    onPaste?: (x) => void;
    tabIndex?: number;
    extraClasses?: string;
    cypress?: any;
    onKeyPress?: (x) => void;
    onFocus?: (x) => void;
    placeholder?: string | undefined;
    onBlur?: (x) => void;
    min?: number | undefined;
}

export interface SCInputProps extends StandardInputProps, InputProps { }

export interface ScDatePickerProps extends DateInputProps {
    name?: string;
    value?: Date | null;
    label?: string;
    error?: string;
    hint?: string;
    required?: boolean;
    disabled?: boolean;
    changeHandler?: (event: {
        target: HTMLInputElement | null;
        name: string | undefined;
        value: Date | string | null;
    }) => void;
    extraClasses?: string;
    cypress?: any;
    minDate?: Date | undefined;
    maxDate?: Date | undefined;
    canClear?: boolean;
    onChange?: (day: Date | string | null) => void;
    withAsterisk?: boolean;
    icon?: ReactNode;
    readOnly?: boolean;
}

export interface ScTimePickerProps {
    name?: string;
    value: string | null;
    label?: string;
    error?: string;
    hint?: string;
    required?: boolean;
    disabled?: boolean;
    changeHandler: (event: {
        target: HTMLInputElement | null;
        name: string | undefined;
        value: Date | string | null;
    }) => void;
    extraClasses?: string;
    cypress?: any;
    // min?: Date;
    format?: any;
    // onChange?: (date: Date | string | null) => void;
    startDateAndTime?: string;
    endDate?: string;
    mt?: MantineSpacingValues
}


export interface SCTextAreaProps {
    name?: string;
    value?: string;
    label?: string;
    rows?: number;
    maxRows?: number;
    autoSize?: boolean;
    hint?: string;
    required?: boolean;
    readOnly?: boolean;
    error?: string;
    onChange?: (val: any) => void;
    tabIndex?: number;
    extraClasses?: string;
    backgroundColor?: string;
    cypress?: string;
    placeholder?: string;
    customProps?: any;
    onFocus?: (e) => void;
    onBlur?: (e) => void;
    autoFocus?: boolean;
    maxLength?: number;
    disabled?: boolean;
    width?: string;
    mt?: MantineSize | number;
    maw?: MantineSize | number;
}
