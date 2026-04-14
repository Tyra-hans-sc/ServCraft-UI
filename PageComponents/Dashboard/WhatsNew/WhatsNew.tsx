import {FC, UIEventHandler, useEffect, useState} from "react";
import moment from "moment";
import {whatsNewData} from "@/PageComponents/Dashboard/WhatsNew/WhatsNewData";
import {
    ActionIcon,
    Alert, Anchor,
    AspectRatio,
    Box,
    Button,
    Flex,
    List,
    LoadingOverlay,
    ScrollArea,
    Text,
    Title,
    Tooltip
} from "@mantine/core";
import PS from '@/services/permission/permission-service';
import {IconExternalLink, IconInfoCircle} from "@tabler/icons";
import Link from "next/link";
import Image from "next/image"
import {useDidUpdate, useIdle, useInterval, useMediaQuery} from "@mantine/hooks";
import {useMutation} from "@tanstack/react-query";
import Storage from "@/utils/storage";
import * as Enums from "@/utils/enums";
import featureService from "@/services/feature/feature-service";
import constants from "@/utils/constants";
import { AnimatePresence, motion } from "framer-motion";
import {IconChevronDown} from "@tabler/icons-react";

export const logFeedback = (payload) => {

    const userId = Storage.getCookie(Enums.Cookie.userID);
    const tenantId = Storage.getCookie(Enums.Cookie.tenantID);
    return fetch(`https://managerapi.servcraft.co.za/api/website/whatsnewfeedback`, {
        method: 'POST',
        body: JSON.stringify({...payload, tenantId, userId}),
        headers: {
            'Content-Type': 'application/json',
            userId, tenantId
        }
    })
}

const variants = {
    visible: { opacity: 1, height: "auto" },
    hidden: { opacity: 0, height: 0 },
};

const WhatsNew: FC<{ onClose: () => void; triggerCloseCounter: number, initiator: 'menu' | 'widget', indexItemClicked: [number, number]/*show: boolean; setShow: (show: boolean) => void*/}> = ({...props}) => {

    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any[]>([])

    const [sectionStates, setSectionStates] = useState<boolean[][]>([])


    useEffect(() => {
        // Async function to prepare the data and filter based on permissions
        const processWhatsNewData = async () => {
            const filteredDataPromises = whatsNewData.map(async (x) => {
                // Map through all sections in each data entry and filter asynchronously
                const filteredSections = await Promise.all(
                    x.sections.map(async (y) => {
                        const feature = y.permission?.startsWith("feature:");
                        if (feature) {
                            const hasFeature = await featureService.getFeature(
                                y.permission?.replace("feature:", "") as any
                            );
                            return hasFeature ? y : null; // Return the section if the feature exists
                        } else {
                            return !y.permission || PS.hasPermission(y.permission) ? y : null;
                        }
                    })
                );

                // Filter out null values from the resulting sections
                return {
                    ...x,
                    sections: filteredSections.filter(Boolean),
                };
            });

            // Wait until all promises are resolved and set the filtered data
            const resolvedData = await Promise.all(filteredDataPromises);
            setData(resolvedData);

            setSectionStates(resolvedData.map(x => x.sections.map(y => true)))

            setLoading(false);
        };

        processWhatsNewData();
    }, []);

    const isMobile = useMediaQuery('(max-width: 850px)');

    // pick up time viewed:
    const [timeViewed, setTimeViewed] = useState(0)
    const {start, stop} = useInterval(() => setTimeViewed(p => p + 1), 1000, {autoInvoke: true})
    useEffect(() => {
        start();
        // return stop();
    }, []);
    // pick up longest idle time for more than 1.5 seconds
    const idle = useIdle(1500);
    const [longestIdleTime, setLongestIdleTime] = useState(0);
    const [, setCurrentIdleTime] = useState(0);
    const {start: startIdleTimer, stop: stopIdleTimer} = useInterval(() => {
        setCurrentIdleTime(cp => {
            setLongestIdleTime(lp => cp < lp ? lp : cp)
            return cp + 1
        })
    }, 1000)
    useEffect(() => {
        if (!idle) {
            stopIdleTimer()
            setCurrentIdleTime(0)
        } else {
            startIdleTimer()
        }
    }, [idle]);

    // pick up farthest scroll point
    const [furthestScroll, setFurthestScroll] = useState(0)
    const handleScroll = (scroll) => {
        const percentageScrolled = Math.round(((scroll.target.scrollTop) / (scroll.target.scrollHeight - scroll.target.offsetHeight)) * 100)
        setFurthestScroll(p => percentageScrolled > p ? percentageScrolled : p)
        // console.log('scrolling: ' + percentageScrolled + '%')
    };

    const {mutate} = useMutation(['whatsNewViewed'], logFeedback);

    const closeAndPostTrackingInfo = () => {
        const firstItem = data?.find(x => x.sections?.length > 0)?.sections[0]
        if (data.length > 0 && firstItem?.version) {
            mutate({
                type: 'Whats New Viewed',
                path: firstItem.version,
                message: JSON.stringify({
                    totalTimeViewed: timeViewed + 's',
                    longestIdle: longestIdleTime + 's',
                    farthestScroll: furthestScroll + '%',
                    openedWith: props.initiator
                })
            })
        }
        props.onClose()
    }

    useDidUpdate(() => {
        if(props.triggerCloseCounter) { // eg. !== 0
            closeAndPostTrackingInfo()
        }
    }, [props.triggerCloseCounter]);

    useDidUpdate(() => {
        if (props.indexItemClicked[0] !== -1 && props.indexItemClicked[1] !== -1) {
            setSectionStates(p => {
                p[props.indexItemClicked[0]][props.indexItemClicked[1]] = true
                return [...p]
            })
            setTimeout(() => {
                const sectionElement = document.getElementById('section-' + props.indexItemClicked[0] + '-' + props.indexItemClicked[1]);
                if (sectionElement) {
                    sectionElement.scrollIntoView({behavior: 'smooth', block: 'center'});
                }
            }, 100)
        }
    }, [props.indexItemClicked])

    return <Box
        pos={'relative'}
    >
        <Title c={'dimmed'} mb={5} size={15}>
            See what we have been working on
        </Title>

        <ScrollArea.Autosize
            mah={isMobile ? '100%' : `calc(80vh - 50px)`}
            mih={'50vh'}
            type="always"
            offsetScrollbars
            // styles={{root: {overflowX: 'hidden'}}}
            scrollbarSize={8}
            mb={-25}
            onScrollCapture={handleScroll}
        >
            <LoadingOverlay visible={loading} />
            {
                data.map(
                    (x, i) => x.sections.length !== 0 &&
                        <Box

                            key={'whatsNewSection' + i}
                            mb={i === (data.length - 1) ? 0 : 'sm'}
                            style={{
                                border: '1px solid var(--mantine-color-gray-4)',
                                backgroundColor: 'white',
                                borderRadius: '.5em'
                            }}
                            p={'md'}
                            px={20}
                        >
                        {
                            moment(x.month).year() === moment().year() ? (
                                    moment(x.month).month() === moment().month() ? (
                                        <Title c={'scBlue.8'} size={20} fw={600}>
                                            New in {moment(x.month).format('MMMM')}
                                        </Title>
                                    ) : (
                                        <Title c={'scBlue.8'} size={20}>
                                            {moment(x.month).format('MMMM')}
                                        </Title>
                                    )
                                ) :  (
                                <Title c={'scBlue.8'} size={20}>
                                    {moment(x.month).format('MMMM, YY')}
                                </Title>
                            )
                        }


                        {
                            x.sections.map((y, j) => (
                                <Flex direction={'column'} gap={5} key={'whatsnew' + i + '-' + j} mt={j !== 0 ? 5 : 5}>
                                    {
                                        y.version && y.title &&
                                        <Flex gap={5}
                                              c={'scBlue.7'}
                                              align={'center'}
                                              onClick={() => setSectionStates(p => {
                                                  p[i][j] = !p[i][j]
                                                  return [...p]
                                              })}
                                              role={'button'}
                                              style={{cursor: 'pointer'}}
                                        >
                                            <IconChevronDown stroke={2.4} size={16}
                                                             style={{
                                                                 transition: '200ms ease-in-out',
                                                                 rotate: !sectionStates[i][j] ? '-90deg' : '0deg'
                                                             }}
                                            />
                                            <Anchor c={'scBlue.7'} fw={600} size={'lg'}
                                            >
                                                {y.version} - {y.title}
                                            </Anchor>
                                        </Flex>
                                    }
                                    <AnimatePresence initial={false}>
                                        {
                                            y.majorDetail.map(
                                                (z, k) => sectionStates[i][j] && (
                                                    <motion.div
                                                        key={'whatsNew' + i + '-' + j + '-' + k}
                                                        initial="hidden"
                                                        animate="visible"
                                                        exit="hidden"
                                                        variants={variants}
                                                        style={{overflow: "hidden"}}
                                                    >
                                                        <Box
                                                            id={'section-' + i + '-' + j}
                                                            px={5}
                                                            // maw={'99%'}
                                                        >
                                                            {
                                                                z.type === 'heading' ? (
                                                                        z.items.map(
                                                                            (item, l) => (
                                                                                <Text size={'md'} fw={600} c={'gray.7'}
                                                                                      key={'whatsNew' + i + '-' + j + '-' + k + '-' + l}
                                                                                      style={{...item.style}}
                                                                                >
                                                                                    {item.text}
                                                                                </Text>
                                                                            )
                                                                        )
                                                                    ) :
                                                                    z.type === 'list' ? (
                                                                            <List>
                                                                                {
                                                                                    z.items.map(
                                                                                        (item, l) => (
                                                                                            <List.Item
                                                                                                key={'whatsNew' + i + '-' + j + '-' + k + '-' + l}
                                                                                            >
                                                                                                <Flex align={'center'}>
                                                                                                    <Text size={'sm'}
                                                                                                          c={'gray.7'}
                                                                                                          key={'whatsNew' + i + '-' + j + '-' + k + '-' + l}
                                                                                                          style={{...item.style}}
                                                                                                    >
                                                                                                        {item.text}
                                                                                                    </Text>
                                                                                                    {
                                                                                                        item.href &&
                                                                                                        <Link
                                                                                                            href={item.href}>
                                                                                                            <Tooltip
                                                                                                                color={'scBlue.3'}
                                                                                                                label={<Text
                                                                                                                    size={'sm'}>Take
                                                                                                                    me
                                                                                                                    there</Text>}
                                                                                                                events={{
                                                                                                                    hover: true,
                                                                                                                    focus: true,
                                                                                                                    touch: true
                                                                                                                }}
                                                                                                            >
                                                                                                                <ActionIcon
                                                                                                                    variant={'subtle'}
                                                                                                                    size={'xs'}
                                                                                                                    ml={5}>
                                                                                                                    <IconExternalLink
                                                                                                                        size={14}/>
                                                                                                                </ActionIcon>
                                                                                                            </Tooltip>
                                                                                                        </Link>
                                                                                                    }
                                                                                                </Flex>
                                                                                            </List.Item>
                                                                                        )
                                                                                    )
                                                                                }
                                                                            </List>
                                                                        ) :
                                                                        z.type === 'image' ? (
                                                                                z.items.map(
                                                                                    (item, l) => (
                                                                                        item.src &&
                                                                                        <Image
                                                                                            key={'whatsNewImage' + i + '-' + j + '-' + k + '-' + l}
                                                                                            quality={70}
                                                                                            alt={''}
                                                                                            src={item.src}
                                                                                            // fill
                                                                                            height={350}
                                                                                            width={800}
                                                                                            style={{
                                                                                                objectFit: 'contain',
                                                                                                objectPosition: 'top',
                                                                                                marginBottom: 'var(--mantine-spacing-md)',
                                                                                                marginTop: 'var(--mantine-spacing-xs)',
                                                                                                // maxWidth: '100%',
                                                                                                maxHeight: '350px',
                                                                                                width: '100%',       // Ensure the image takes the full width of the container
                                                                                                height: 'auto',      // Dynamically adjust height based on aspect ratio
                                                                                            }}
                                                                                        />
                                                                                        /*<AspectRatio
                                                                                            w={250}
                                                                                            h={'100%'}
                                                                                            mih={'100%'}
                                                                                            key={'whatsNew' + i +'-' + j + '-' + k + '-' + l}
                                                                                            ratio={1}
                                                                                            style={{alignSelf: 'center'}}
                                                                                            mx={'auto'}
                                                                                            pos={'relative'}
                                                                                        >
                                                                                            <Image
                                                                                                quality={70}
                                                                                                alt={''}
                                                                                                src={item.src}
                                                                                                style={{objectFit: 'contain', objectPosition: 'top'}}
                                                                                            />
                                                                                        </AspectRatio>*/
                                                                                    )
                                                                                )
                                                                            ) :
                                                                            z.type === 'paragraph' ? (
                                                                                    z.items.map(
                                                                                        (item, l) => (
                                                                                            <Text size={'md'} c={'gray.7'}
                                                                                                  key={'whatsNew' + i + '-' + j + '-' + k + '-' + l}
                                                                                                  style={{...item.style}}
                                                                                            >
                                                                                                {item.text}
                                                                                            </Text>
                                                                                        )
                                                                                    )
                                                                                ) :
                                                                                z.type === 'info' ? <>
                                                                                        <Alert variant={'light'}
                                                                                               color={'teal'}
                                                                                               icon={<IconInfoCircle/>}>
                                                                                            {
                                                                                                z.items.map(
                                                                                                    (item, l) => (
                                                                                                        <Flex
                                                                                                            align={'center'}
                                                                                                            key={'whatsNew' + i + '-' + j + '-' + k + '-' + l}
                                                                                                        >
                                                                                                            <Text
                                                                                                                size={'sm'}
                                                                                                                c={'gray.7'}
                                                                                                                key={'whatsNew' + i + '-' + j + '-' + k + '-' + l}
                                                                                                                style={{...item.style}}
                                                                                                            >
                                                                                                                {item.text}
                                                                                                            </Text>
                                                                                                            {
                                                                                                                item.href &&
                                                                                                                <Link
                                                                                                                    href={item.href}>
                                                                                                                    <Tooltip
                                                                                                                        color={'scBlue.3'}
                                                                                                                        label={
                                                                                                                            <Text
                                                                                                                                size={'sm'}>Take
                                                                                                                                me
                                                                                                                                there</Text>}
                                                                                                                        events={{
                                                                                                                            hover: true,
                                                                                                                            focus: true,
                                                                                                                            touch: true
                                                                                                                        }}
                                                                                                                    >
                                                                                                                        <ActionIcon
                                                                                                                            variant={'subtle'}
                                                                                                                            size={'xs'}
                                                                                                                            ml={5}>
                                                                                                                            <IconExternalLink
                                                                                                                                size={14}/>
                                                                                                                        </ActionIcon>
                                                                                                                    </Tooltip>
                                                                                                                </Link>
                                                                                                            }
                                                                                                        </Flex>
                                                                                                    )
                                                                                                )
                                                                                            }
                                                                                        </Alert>
                                                                                    </> :
                                                                                    <></>
                                                            }
                                                        </Box>


                                                    </motion.div>
                                                )
                                            )
                                        }

                                        {
                                            sectionStates[i][j] &&
                                            <motion.div
                                                initial="hidden"
                                                animate="visible"
                                                exit="hidden"
                                                variants={variants}
                                                style={{overflow: "hidden"}}
                                            >
                                                {
                                                    y.link &&
                                                    <Link href={y.link}>
                                                        <Button
                                                            style={{float: 'right'}}
                                                            variant={'subtle'}
                                                            onClick={closeAndPostTrackingInfo}
                                                        >
                                                            View Feature
                                                        </Button>
                                                    </Link>
                                                }
                                            </motion.div>
                                        }
                                    </AnimatePresence>
                                </Flex>
                            ))
                        }
                    </Box>
                )
            }
        </ScrollArea.Autosize>
    </Box>
}

export default WhatsNew
