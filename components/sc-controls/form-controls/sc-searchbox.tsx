import { TextInput } from "@mantine/core";
import { FC } from "react";
import ScSearchboxInputProps from "./sc-control-interfaces/sc-searchbox-interfaces";
import SCInput from "./sc-input";

function SCSearchbox(inputProps: ScSearchboxInputProps) {

    const {
        value,
        placeholder,
        label,
        leftIcon = "/specno-icons/search.svg",
        canClear = true,
        clearIcon = "/specno-icons/clear.svg",
        onChange
    } = inputProps;

    return (
        <TextInput
            value={value ?? ""}
            placeholder={placeholder}
            leftSection={leftIcon ? <img src={leftIcon} alt="" /> : <></>}
            rightSection={canClear && value ? <img src={clearIcon} alt="Clear" role="button" style={{ cursor: "pointer" }} onClick={() => onChange && onChange(null)} /> : <></>}
            onChange={(event) => onChange && onChange(event.currentTarget.value)}
        />
    );
};


export default SCSearchbox;