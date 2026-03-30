import React, {FC} from "react";
import {InputBase} from "@mantine/core";

import InputMask from 'react-input-mask';

const ScTextControl: FC<any> = (inputProps) => {

    const {innerRef} = inputProps;

    return (<>
        <InputBase
            mt={'var(--mantine-spacing-sm)'}
            {...inputProps}
            ref={innerRef}
            component={InputMask}
            maskChar={''}
            alwaysShowMask={true}
            mask="99999999999999"
        />
    </>)
}

export default ScTextControl

