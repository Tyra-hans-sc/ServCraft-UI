import { ListItemProps } from '@progress/kendo-react-dropdowns';
import React, { JSXElementConstructor, ReactElement, ReactNode } from 'react';
import { ItemPropsMantine, ScComboboxAddOption } from './sc-combobox-interfaces';
import {ComboboxProps, MantineSize, MantineSpacing, StyleProp} from '@mantine/core';

export interface ScDropDownListInputProps {
    name?: string;
    value?: any;
    dataItemKey?: string;
    textField?: string;
    options?: any[];
    label?: string;
    size?: MantineSize;
    hint?: string;
    error?: string;
    onChange?: (newValue) => void;
    itemRender?: ((li: ReactElement<HTMLLIElement, string | JSXElementConstructor<any>>, itemProps: ListItemProps) => ReactNode); // Just for kendo
    valueRender?: (rendering: ReactElement<HTMLSpanElement, string | JSXElementConstructor<any>>) => ReactNode; // Just for kendo
    required?: boolean;
    disabled?: boolean;
    extraClasses?: string;
    itemRenderMantine?: (item: ItemPropsMantine) => ReactNode;
    canClear?: boolean;
    iconMantine?: ReactNode;
    placeholder?: string | undefined;
    addOption?: ScComboboxAddOption | undefined;
    groupField?: string | undefined;
    hideSelected?: boolean;
    onBlur?: (e) => void;
    autoFocus?: boolean;
    style?: StyleProp<any>;
    triggerRefresh?: any;
    resetValue?: any;
    suppressInternalValueChange?: boolean;
    mt?:  StyleProp<MantineSpacing>;
    readOnly?: boolean;
    dataItemKeyAsValue?: boolean;
    canSearch?: boolean;
    mantineComboboxProps?: ComboboxProps;
}
