import React, {FC, Ref, RefAttributes, useRef} from "react";
import {NumberInput, NumberInputProps} from "@mantine/core";

const ScNumberControl: FC<{innerRef?: any, selectOnFocus?} & NumberInputProps & RefAttributes<HTMLInputElement>> = (inputProps) => {

    const {innerRef, selectOnFocus = true} = inputProps;

    const ref = useRef<HTMLInputElement | null>(null);

    return (<>
        <NumberInput
            {...inputProps}
            mt={inputProps.mt ?? 'sm'}
            value={isNaN(parseFloat(inputProps.value?.toString() ?? "")) ? '' : parseFloat(inputProps.value?.toString() ?? "")}
            ref={!!innerRef ? innerRef : ref}
            onFocus={() => {
                if (selectOnFocus) {
                    !!innerRef && innerRef.current?.select() || ref.current?.select();
                }
            }}
        />
    </>)
}

export default ScNumberControl

