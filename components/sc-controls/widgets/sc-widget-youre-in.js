import { colors } from "../../../theme";
import SCWidgetCard from "../layout/sc-widget-card";
import Helper from "../../../utils/helper";
import constants from "../../../utils/constants";
import {Flex, Group, Stack, Text} from "@mantine/core";
import Image from "next/image";
import { useContext } from "react";
import PageContext from "../../../utils/page-context";

// import {useMediaQuery} from "@mantine/hooks";

export default function SCWidgetYoureIn({ onDismiss, widget, accessStatus }) {

    const pageContext = useContext(PageContext);

    // const url = "https://www.youtube.com/watch?v=lA8f6mg75TI";
    const url = "https://youtu.be/lA8f6mg75TI";

    function onWatchClick() {
        // Helper.mixpanelTrack(constants.mixPanelEvents.widgetYoureInWatchOverviewClicked);
        Helper.mixpanelTrack(constants.mixPanelEvents.widgetYoureInCreateFirstJob);
        window.open(url, "_blank");
    }

    return (<>
        <SCWidgetCard>

                <Flex gap={'sm'} align={{sm: 'stretch', base: 'center'}} justify={'apart'} direction={{base: 'column', sm: pageContext.mobileView ? 'col' : 'row'}} p={'var(--mantine-spacing-lg)'} style={{backgroundColor: colors.bluePrimary}}>

                    <Stack >
                        <Text color={'white'}>
                            <h2>Great, You&apos;re In!</h2>
                            <span>Experience how ServCraft jobs put you in control, power productivity and free up time.  Watch the 1 minute video above to see how! </span>
                        </Text>
                        <Group>
                            <button className="watch-button" onClick={onWatchClick}>
                                Watch how to create your first job
                                <img alt={''} src="/sc-icons/play-white.svg" />
                            </button>

                            <button className="dismiss" onClick={onDismiss}>
                                Dismiss
                            </button>
                        </Group>
                    </Stack>


                    <div style={{position: "relative", width: '100%', minHeight: pageContext.mobileView ? 250 : 100, maxHeight: '100%'}}>
                        <Image src={'/servcraft-take-control.png'} fill alt={''}
                               style={{
                                   objectFit: pageContext.mobileView ? 'cover' : 'contain',
                                   objectPosition: pageContext.mobileView ? 'top left' : 'right'
                        }} />
                    </div>

                </Flex>

        </SCWidgetCard>

        <style jsx>{`
          .widget-container {
            background: ${colors.bluePrimary};
            height: 100%;
            display: flex;
            justify-content: space-between;
            padding: 1rem;
          }

          .image-container {
            width: 50%;
          }

          .image-container img {
            width: 100%;
          }

          .content-container {
            color: #CCD8F6;
            /*display: flex;
            justify-content: center;
            align-content: center;
            flex-direction: column;*/
            padding-right: 1rem;
          }

          .content-container h2 {
            margin: 0;
            font-size: 2rem;
            color: white;
          }

          button {
            cursor: pointer;
            border: none;
            color: white;
            padding: 0.75rem 1rem;
          }

          button.watch-button {
            background: #ffffff1a;
          }

          button.dismiss {
            background: transparent;
            margin-left: 1rem;
          }

          button img {
            position: relative;
            margin-left: 0.5rem;
            margin-bottom: -5px;
            height: 17px;
          }

        `}</style>
    </>);
};
