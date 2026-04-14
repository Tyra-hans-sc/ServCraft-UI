import {FC} from "react";
import styles from "./AnimatedTimerButtonMobile.module.css"
import {Box, Flex, Text} from "@mantine/core";
import {IconClock, IconHourglassLow, IconTimeDuration0, IconTimeDuration15} from "@tabler/icons-react";

const AnimatedTimerButtonMobile: FC<
    {
        // format hh:mm:ss
        duration: string
    }
> = (props) => {

    const durationSplit = props.duration.split(':')
    const hourCountdownPercentage = Math.round((+durationSplit[1] / 60) * 100)

    return <Box
        className={styles.timer}
        style={{
            background: `conic-gradient(var(--mantine-color-yellow-7) calc(${hourCountdownPercentage}*1%), var(--mantine-color-scBlue-7) 0)`,
        }}
    >
        <Flex align={'center'} justify={'center'} pos={'relative'} c={'scBlue'} bg={'white'} w={15} h={15} style={{borderRadius: '50%'}}>
            <Text size={'12px'} c={'scBlue'} fw={700}>{+durationSplit[0]}</Text>
            <IconClock stroke={'3.2'} size={8} style={{position: "absolute", right: -8, top: -6}} />
        </Flex>
        {/*{durationSplit[0]}*/}
    </Box>
}

export default AnimatedTimerButtonMobile
