import { ReactNode } from "react";

export interface SCCheckboxInterface {
    name?: string;
    value?: string | number | readonly string[] | undefined;
    label?: string | ReactNode;
    labelPlacement?: "after" | "before" | undefined;
    whiteBackground?: boolean;
    title?: string;
    disabled?: boolean;
    onChange?: (boolean: boolean) => void;
    onChangeFull?: (event: {
        target: any; 
        name: string | undefined; 
        value: boolean | undefined
    }) => void;
    extraClasses?: string;
    cypress?: string;
    hint?: string | undefined;
    indeterminate?: boolean;
}

