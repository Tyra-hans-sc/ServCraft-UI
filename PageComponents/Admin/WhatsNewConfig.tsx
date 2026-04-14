// import {useAtom} from "jotai";
// import {whatsNewBlinkingAttentionModeAtom, whatsNewContentNotViewedYetAtom} from "@/utils/atoms";
// import {Box, Button, Card, Fieldset, Flex, Text} from "@mantine/core";
import {whatsNewData} from "@/PageComponents/Dashboard/WhatsNew/WhatsNewData";
import {useIdle} from "@mantine/hooks";

const WhatsNewConfig = () => {

    const idle = useIdle(8000)

/*
    const [blinkingMode, setBlinkingMode] = useAtom(whatsNewBlinkingAttentionModeAtom);
    const [miniContentNotViewed, setMiniContentNotViewed] = useAtom(whatsNewContentNotViewedYetAtom);


    const onTriggerAlert = () => {
        setBlinkingMode(p => !p)
    }

    const onTriggerPopup = () => {
        setMiniContentNotViewed(whatsNewData)
    }
*/
    return <>

        {/*<Card>
            <Fieldset
                legend="Whats New"
            >
                <Flex gap={'sm'}>
                    <Button
                        mr={'sm'}
                        onClick={onTriggerAlert}
                    >
                        Toggle Beacons
                    </Button>
                    <Box maw={250}>
                        <Button
                            onClick={onTriggerPopup}
                        >
                            Trigger Popup
                        </Button>

                        {
                            miniContentNotViewed.length !== 0 ? <>
                                <Text mt={5} fw={'bolder'} size={'sm'}>
                                    Popup will trigger once idle for 8s.
                                </Text>
                                <Text size={'sm'}>
                                    IDLE: <span style={{color: idle ? 'var(--mantine-color-green-7)' : 'var(--mantine-color-red-7)'}}>{idle + ''}</span>{}
                                </Text>
                            </> : <Text mt={5} fw={'bolder'} size={'sm'}>
                                Popup will not trigger
                            </Text>
                        }
                    </Box>
                </Flex>
            </Fieldset>
        </Card>*/}

    </>
}

export default WhatsNewConfig
