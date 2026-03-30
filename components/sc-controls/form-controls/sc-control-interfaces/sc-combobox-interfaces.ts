import { ListItemProps } from "@progress/kendo-react-dropdowns";
import { JSXElementConstructor, ReactElement, ReactNode } from "react";
import {ComboboxProps, MantineSize, MantineSpacing, StyleProp} from "@mantine/core";

export interface ScComboboxAddOption {
    text: string;
    action: (newValue?: string | null) => void;
};

export interface ScComboboxOnChangeAcceptance {
    key: string;
    value?: any;
    option?: "Equals" | "None";
    action?: (newValue: any) => void;
}

export interface ScComboboxInputProps {
    name?: string;
    value?: any;
    textField?: string;
    dataItemKey?: string;
    getOptions?: (skipIndex?: number, take?: number, filter?: string) => Promise<{data: any[], total: number}>;
    // use to execute fetch - used to set selected item when only the ID is known
    forceFetch?: boolean;
    options?: any[];
    label?: string;
    hint?: string;
    required?: boolean; // = false;
    disabled?: boolean; // = false;
    triggerRefresh?: any;
    cascadeDependency?: any;
    cascadeDependencyKey?: string;
    addOption?: ScComboboxAddOption | undefined;
    error?: string;
    onChange?: (newValue) => void;
    onChangeAcceptance?: ScComboboxOnChangeAcceptance;
    extraClasses?: string;
    pageSize?: number; // = 20
    cypress?: string;
    itemRender?: ((li: React.ReactElement<HTMLLIElement, string | React.JSXElementConstructor<any>>, itemProps: ListItemProps) => ReactNode); // Just for kendo
    valueRender?: (rendering: ReactElement<HTMLSpanElement, string | JSXElementConstructor<any>>) => ReactNode; // Just for kendo
    canClear?: boolean; // = true
    canSearch?: boolean; // = true
    resetValue?: any;
    filter?: string; // = undefined
    itemRenderMantine?: (item: ItemPropsMantine) => ReactNode;
    iconMantine?: ReactNode | undefined;
    filterFunction?: (text: string, item: any) => boolean;
    placeholder?: string | undefined;
    groupField?: string | undefined;
    hideSelected?: boolean;
    onBlur?: ((e: any) => void) | undefined;
    autoFocus?: boolean;
    w?: string | number;
    style?: any;
    suppressInternalValueChange?: boolean;
    // select popover menu should be removed when value changes by default, use this when it doesn't - defaults to false
    forceBlurOnChange?: boolean;
    dataItemKeyAsValue?: boolean;
    hideDataItemKeys?: any[];
    readOnly?: boolean;
    hoverLabelMode?: boolean
    mt?:  StyleProp<MantineSpacing>
    leftSection?: ReactNode
    hasNullKey?: boolean
    size?: MantineSize
    title?: string
    disableIDs?: string[]
    mantineComboboxProps?: ComboboxProps;
}

export interface ItemPropsMantine extends React.ComponentPropsWithoutRef<'div'> {
    dataItem: any;
    isCreate?: boolean;
}
