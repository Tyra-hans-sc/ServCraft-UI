import React, {FC, Ref, RefAttributes} from "react";
import {PasswordInput, PasswordInputProps} from "@mantine/core";

const ScPasswordControl: FC<{innerRef?: Ref<any>} & PasswordInputProps & RefAttributes<HTMLInputElement>> = (inputProps) => {

    const {innerRef, value, ...restProps} = inputProps;

    // Don't pass the value prop to prevent it from being rendered as HTML attribute
    // Instead rely on React's internal state management
    
    return (<>
        <PasswordInput
            mt={'var(--mantine-spacing-sm)'}
            {...restProps}
            // Explicitly omit value to prevent HTML value attribute
            // ref={innerRef}
        />
    </>)
}

export default ScPasswordControl