import React, { useEffect, useState } from 'react';
import { Tooltip } from "@progress/kendo-react-tooltip";

export default function KendoTooltip({children, position = "top", content = null, parentTitle = false}) {

    return (
        <Tooltip position={position} anchorElement="target" content={content} parentTitle={parentTitle}>
            {children}
        </Tooltip>
    )
}
