import { useState, useEffect } from "react";
import SCWidgetCard from "./sc-widget-card";
import Helper from "../../../../utils/helper";
import constants from "../../../../utils/constants";
import {Button, Flex, ScrollArea, Skeleton, Stack, useMantineTheme} from "@mantine/core";
import {useQuery} from "@tanstack/react-query";
import RenderSanityBlockText from "@/PageComponents/Helpers/RenderSanityBlockText";
import Link from "next/link";
import ScVideoModal from "@/PageComponents/Modal/ScVideoModal";
import Fetch from "@/utils/Fetch";
import {IconPlayerPlayFilled} from "@tabler/icons-react";
import {IconExternalLink} from "@tabler/icons";
import SCWidgetTitle from "@/components/sc-controls/widgets/new/sc-widget-title";

interface WhatsNewContent {
    releaseDate: string;
    button: string;
    buttonLabel: string;
    buttonLink: string;
    content: BlockContent[]
    heading: string;
    title: string;
    videoId: {current: string};
}

interface BlockContent {
    style: 'normal' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'strong' | 'em' | 'blockquote'
    _key: string
    markDefs: any[]
    children: [
        BlockTextContentLineItem
    ]
    _type: 'block' | 'image'
    listItem?: 'bullet'
    level?: number
    asset?: {
        _ref: string
        _type: 'reference',
    }
    imageUrl?: string
}

interface BlockTextContentLineItem {
    text: string
    _key: string
    _type: string
    marks: any[]
}

/*const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: "production",
    apiVersion: "2023-10-17",
    useCdn: true
})*/

const fetchWhatsNewSanityData = async (invalidate: boolean) => {
    /*return await client.fetch(`*[_type == "whatsNew"] {
          title,
          heading,
          content,
          button,
          buttonLabel,
          buttonLink,
          videoId
        }`)*/

    const res = await Fetch.get({
        url: '/CMS/GetWhatsNew',
        params: {invalidate}
    } as any)

    if(res) {
        return JSON.parse(res)
    } else {
        return null
    }
}

const loadingSkeleton = <Stack gap={'sm'}>
    <Skeleton width={150} mb={'var(--mantine-spacing-xl)'} height={14} radius={'xs'} />
    <Skeleton width={400} height={10} radius={'xs'} />
    <Skeleton width={500} height={10} radius={'xs'} />
    <Skeleton width={420} height={10} radius={'xs'} />
    <Skeleton width={350} height={10} radius={'xs'} />
</Stack>

export default function SCWidgetWhatsNewCMS({ widget, accessStatus, testing, onDismiss }) {

    const [whatsNewData, setWhatsNewData] = useState<WhatsNewContent | null>()
    const cmsQuery = useQuery<WhatsNewContent | null>(['whatsNew'], () => fetchWhatsNewSanityData(testing))

    useEffect(() => {
        if (cmsQuery.data !== undefined) {
            setWhatsNewData(cmsQuery.data)
        }
    }, [cmsQuery.data])

    const [playYoutubeVideoId, setPlayYoutubeVideoId] = useState('')

    const theme = useMantineTheme()

    return (<>
        <ScVideoModal onClose={() => {
            setPlayYoutubeVideoId('')
        }} videoId={playYoutubeVideoId}/>
        <SCWidgetCard height={widget.heightPX} background={theme.colors.scBlue[5]} onDismiss={onDismiss}>
            {
                cmsQuery.isLoading && loadingSkeleton
            }

            <SCWidgetTitle title={whatsNewData?.heading || ''} color={theme.colors.gray[0]}/>

            {/*<Title order={5} fw={'bolder'} mb={'var(--mantine-spacing-md)'} color={'gray.0'}>
                    {whatsNewData?.heading}
                </Title>*/}

            <ScrollArea h={`calc(${widget.heightPX}px - 140px)`}>
                {
                    cmsQuery.isSuccess &&
                    <RenderSanityBlockText blockContent={whatsNewData?.content || []} textColor={theme.colors.gray[0]}/>
                }
            </ScrollArea>


            <Flex w={'100%'} justify={'right'} mt={'var(--mantine-spacing-md)'}>
                {
                    whatsNewData?.button && whatsNewData.button === 'link' &&
                    <Link
                        href={'/' + Helper.getLinkRedirect(whatsNewData?.buttonLink)}
                    >
                        <Button
                            size={'sm'} variant={'white'} color={'scBlue'}
                            rightSection={<IconExternalLink size={17}/>}
                            onClick={() => {
                                Helper.mixpanelTrack(constants.mixPanelEvents.widgetWhatsNewClicked, null);
                                Helper.nextLinkClicked(whatsNewData?.buttonLink);
                            }}
                            // disabled={accessStatus === Enums.AccessStatus.LockedWithAccess || accessStatus === Enums.AccessStatus.LockedWithOutAccess}
                        >
                            {whatsNewData?.buttonLabel}
                        </Button>
                    </Link>
                }
                {
                    whatsNewData?.button && whatsNewData.button === 'video' &&
                    <Button
                        size={'sm'} variant={'white'} color={'scBlue'}
                        rightSection={<IconPlayerPlayFilled size={17}/>}
                        onClick={() => {
                            Helper.mixpanelTrack(constants.mixPanelEvents.widgetWhatsNewClicked, null);
                            setPlayYoutubeVideoId(whatsNewData?.videoId?.current)
                        }}
                    >
                        {whatsNewData?.buttonLabel}
                    </Button>
                }
            </Flex>
        </SCWidgetCard>

        <style jsx>{`
          .summary-widget-container {
            min-width: 250px;
          }

          .flex {
            display: flex;
          }

          .flex h2 {
            margin-top: 0;
            margin-bottom: 1rem;
            margin-left: 1rem;
          }

          .summary-widget-container {
            padding: 1rem;
            position: relative;
          }

          .pointer {
            cursor: pointer;
          }

          .button-container {
            font-size: 0.8rem;
            margin: -12px 0px 12px 0px;
          }

          .new-icon {
            border: 3px solid black;
            border-radius: 4px;
            padding: 2px;
            height: fit-content;
            font-size: 0.8rem;
            font-weight: bold;
            color: black;
          }

        `}</style>
    </>);
}
