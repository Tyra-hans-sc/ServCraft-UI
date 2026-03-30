import { colors } from "../../../../theme";
import SCWidgetCard from "./sc-widget-card";
import Helper from "../../../../utils/helper";
import constants from "../../../../utils/constants";
import {Button, CheckIcon, CloseButton, ColorSwatch, Flex, Group, Stack, Text, Title} from "@mantine/core";
import {useContext, useState} from "react";
import PageContext from "../../../../utils/page-context";
import {IconPlayerPlayFilled} from "@tabler/icons-react";
import ScVideoModal from "@/PageComponents/Modal/ScVideoModal";

// import {useMediaQuery} from "@mantine/hooks";

export default function SCWidgetYoureIn({ onDismiss, widget, accessStatus }) {

  const pageContext = useContext(PageContext);

  // const url = "https://www.youtube.com/watch?v=lA8f6mg75TI";
  const url = "https://youtu.be/lA8f6mg75TI";

  function onWatchClick() {
    // Helper.mixpanelTrack(constants.mixPanelEvents.widgetYoureInWatchOverviewClicked);
    Helper.mixpanelTrack(constants.mixPanelEvents.widgetYoureInWatchOverviewClicked);
    // window.open(url, "_blank");
    setYoutubeVideoId('yOwTFrTnS58')
  }



  const [youtubeVideoId, setYoutubeVideoId] = useState<string>()


  return (<>
    {/*<SCWidgetCard animatedOnHover={true} height={widget.heightPX} onDismiss={undefined}>*/}

    <ScVideoModal
        videoId={youtubeVideoId}
        onClose={() => setYoutubeVideoId('')}
    />

    <SCWidgetCard background={colors.bluePrimary} onDismiss={onDismiss} height={widget.heightPX}>

      <Flex align={{ sm: 'stretch', base: 'center' }} justify={'apart'} direction={{ base: 'column', sm: (pageContext as any).mobileView ? 'column' : 'row' }}  style={{ height: "100%" }}>

        <Stack >
          <Title order={3} c={'white'} my={0}>Welcome To ServCraft</Title>
          <Text c={'white'} my={0}>
            <span style={{fontSize: 14, opacity: .8}}>Let&apos;s get you up and running.  Watch our 2 minute overview video to learn how ServCraft helps you take control of your business.</span>
          </Text>

          <Stack gap={7}>
            {
              ['Win more business', 'Get paid faster', 'Have happier customers'].map(
                  (s, i) => (
                      <Flex align="center" gap="xs" key={'checkItem' + i}>
                        <ColorSwatch
                            variant={'white'}
                            color={'white'}
                            size={16}
                            style={t => ({ color: t.colors.scBlue[5] })}
                        >
                          {
                            <CheckIcon width={8} />
                          }
                        </ColorSwatch>
                        <Text color={'#fff'} size={'sm'} fw={500}>{s}</Text>
                      </Flex>
                  )
              )
            }
          </Stack>

          <Group mt={'var(--mantine-spacing-md)'}>
            <Button variant={'white'} color={'scBlue'}
                    onClick={onWatchClick}
                    /*styles={t => ({
                      label: {
                        color: t.colors.scBlue[5]
                      },
                      rightSection: {
                        color: t.colors.scBlue[5]
                      }
                    })}*/
                    rightSection={<IconPlayerPlayFilled size={17} />}>
              Watch Overview
            </Button>

            {/*<button className="watch-button" onClick={onWatchClick}>
              Watch Overview
              <img alt={''} src="/sc-icons/play-white.svg" />
            </button>*/}

            {/* <button className="dismiss" onClick={onDismiss}>
              Dismiss
            </button> */}
          </Group>
        </Stack>


        {/*<div style={{ position: "relative", width: '100%', minHeight: (pageContext as any).mobileView ? 250 : 100, maxHeight: '100%' }}>
          <Image src={'/servcraft-take-control.png'} fill alt={''}
            style={{
              objectFit: (pageContext as any).mobileView ? 'cover' : 'contain',
              objectPosition: (pageContext as any).mobileView ? 'top left' : 'right'
            }} />
        </div>*/}

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
