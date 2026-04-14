import {FC} from "react";
import {IconAlertCircle} from "@tabler/icons-react";
import {Box, Tooltip} from "@mantine/core";


const AlertIcon: FC<{message: string}> = (props) => {

    return <>
        <Tooltip label={props.message} color={'yellow.8'} events={{ hover: true, focus: true, touch: true }}>
            <Box c={'yellow.7'} >
                <IconAlertCircle stroke={2.4} />
            </Box>
        </Tooltip>
    </>
}

export default AlertIcon
