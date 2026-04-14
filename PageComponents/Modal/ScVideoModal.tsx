import {FC} from "react";
import {AspectRatio, Box, Modal, useMantineTheme} from "@mantine/core";
import YouTube, {YouTubeEvent} from "react-youtube";

const ScVideoModal: FC<{videoId?: string, onClose: () => void}> = (props) => {
    const onReady = (event: YouTubeEvent) => {
        event.target.playVideo()
    };

    const theme = useMantineTheme()

    return (
        <>

            <Modal
                opened={!!props.videoId}
                onClose={props.onClose}
                withCloseButton={false}
                // title="Introduce yourself!"
                size={'auto'}
                padding={5}
                centered={true}
                overlayProps={{
                    color: theme.colors.scBlue[5],
                    blur: 10,
                    opacity: .55
                }}
                transitionProps={{
                    transition: "pop",
                    exitDuration: 50,
                    duration: 100,
                    timingFunction: "ease"
                }}
            >
                <AspectRatio ratio={16/9}>
                    <YouTube videoId={props.videoId} opts={{height: '100%'}} onReady={onReady}/>

                </AspectRatio>
            </Modal>


        </>
    )
}

export default ScVideoModal
