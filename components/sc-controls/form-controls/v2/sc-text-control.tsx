import React, { FC, Ref, RefAttributes } from "react";
import { TextInput, TextInputProps } from "@mantine/core";

const ScTextControl: FC<{ innerRef?: Ref<HTMLInputElement>, barcodeScannerSafe?: boolean, onlyNumbers?: boolean } & TextInputProps & RefAttributes<HTMLInputElement>> = (inputProps) => {

    const { innerRef, onlyNumbers, onChange, ...restInputProps } = inputProps;

    const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (onlyNumbers) {
            e.currentTarget.value = e.currentTarget.value.replace(/\D/g, '');
        }
        if (onChange) {
            onChange(e);
        }
    };

    return (<>
        <TextInput
            mt={'var(--mantine-spacing-sm)'}
            onKeyPress={e => {
                if (inputProps.barcodeScannerSafe) {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                    }
                }
            }}
            onChange={handleOnChange}
            {...restInputProps}
        // ref={innerRef}
        />
    </>)
}

export default ScTextControl

