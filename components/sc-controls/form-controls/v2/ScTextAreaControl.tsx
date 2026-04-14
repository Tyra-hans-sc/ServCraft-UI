import {FC, Ref} from "react";
import {Textarea, TextareaProps} from "@mantine/core";


const ScTextAreaControl: FC<{innerRef?: Ref<any>} & TextareaProps> = (inputProps) => {

    const {innerRef} = inputProps;

    return (
        <Textarea
            mt={'sm'}
            {...inputProps}
            ref={innerRef}
        />
    );
};

export default ScTextAreaControl;
