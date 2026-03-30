import { ListItemProps } from "@progress/kendo-react-dropdowns";
import { JSXElementConstructor, ReactElement, ReactNode } from "react";
import {MantineSize} from "@mantine/core";

export interface ItemPropsMantine extends React.ComponentPropsWithoutRef<'div'> {
    value: string;
    label: string;
    dataItem: any;
}

export interface SCMultiselectInputProps {
     name?: string;
     availableOptions?: any[];
     selectedOptions?: any[];
     textField?: string;
     dataItemKey?: string;
     onChange?: (vals: any[]) => void;
     placeholder?: string;
     label?: string;
     hint?: string;
     error?: string;
     required?: boolean;
     disabled?: boolean;
     extraClasses?: string;
     itemRender?: ((li: ReactElement<HTMLLIElement, string | JSXElementConstructor<any>>, itemProps: ListItemProps) => ReactNode); // Just for kendo
     valueRender?: (rendering: ReactElement<HTMLSpanElement, string | JSXElementConstructor<any>>) => ReactNode; // Just for kendo
     itemRenderMantine?: (item: ItemPropsMantine) => ReactNode;
     valueRenderMantine?: (item: ItemPropsMantine) => ReactNode;
     groupField?: string | undefined;
     mt?: MantineSize;
     readonlyValues?: any[];
}

