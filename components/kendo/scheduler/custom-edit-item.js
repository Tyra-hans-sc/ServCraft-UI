import * as React from "react";
import { SchedulerEditItem } from "@progress/kendo-react-scheduler";

export default function CustomEditItem (props) {

    const generateTitle = (dataItem) => {
        return `${dataItem.title} - ${dataItem.customerName}`;
    };

    return <SchedulerEditItem {...props} title={generateTitle(props.dataItem)} />;
};
