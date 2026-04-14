import { WidgetConfig } from "@/PageComponents/Dashboard/DashboardModels";
import { FC } from "react";

const SCJobTrackerWidget: FC<{
    onDismiss: (() => void) | undefined
    widget: WidgetConfig
}> = ({ onDismiss, widget }) => {


    return (<>
        {widget.friendlyID}
    </>);
};

export default SCJobTrackerWidget;