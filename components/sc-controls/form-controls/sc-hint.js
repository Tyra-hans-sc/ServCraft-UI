import * as React from "react";
import { colors } from '../../../theme';
import { Hint } from "@progress/kendo-react-labels";

function SCHint({value, direction = "start", extraClasses = ""}) {

    return (
        <div className={`hint-container ${extraClasses}`}>
            <Hint direction={direction}>
                {value}
            </Hint>
            <style jsx>{`
                .hint-container {                    
                    color: ${colors.labelGrey};
                }
                .error {
                    color: ${colors.warningRed};
                }
            `}</style>
        </div>
    );
}

export default SCHint;
