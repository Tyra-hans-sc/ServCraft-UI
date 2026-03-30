import * as React from "react";
import { colors } from '../../theme';
import { Hint } from "@progress/kendo-react-labels";

function KendoHint({value, direction = "start", extraClasses}) {

    return (
        <div className={`kendo-hint-container ${extraClasses}`}>
            <Hint direction={direction}>
                {value}
            </Hint>
            <style jsx>{`
                .kendo-hint-container {                    
                    color: ${colors.labelGrey};
                }
                .error {
                    color: ${colors.warningRed};
                }
            `}</style>
        </div>
    );
}

export default KendoHint;
