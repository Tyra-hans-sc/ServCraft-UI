import {FC, useEffect, useMemo, useState} from "react";
import {WhatsNewDetail} from "@/PageComponents/Dashboard/WhatsNew/WhatsNewData";
import {
    ActionIcon,
    Alert, AspectRatio,
    Box,
    Button,
    CloseButton,
    ColorSwatch,
    Flex,
    List, ScrollArea,
    Text,
    Title,
    Tooltip
} from "@mantine/core";
import Link from "next/link";
import {IconExternalLink, IconInfoCircle} from "@tabler/icons";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import styles from './WhatsNew.module.css'
// import {useAtom} from "jotai/index";
// import {showWhatsNewAtom, triggerWhatsNewViewedAtom} from "@/utils/atoms";
import {useMutation} from "@tanstack/react-query";
import {logFeedback} from "@/PageComponents/Dashboard/WhatsNew/WhatsNew";
import {useInterval} from "@mantine/hooks";
import moment from "moment";


export const setWhatsNewPopupDoNotDisturbUntilDate = (date: Date) => {
    localStorage.setItem('whatsNewDoNotDisturbUntil', date.toISOString())
}

export const getWhatsNewPopupDoNotDisturbUntilDate = () => {
    const date = localStorage.getItem('whatsNewDoNotDisturbUntil')
    if (date) {
        return new Date(date)
    }
    return null
}

const WhatsNewPopupMiniContentRendering: FC<{data: WhatsNewDetail[] | undefined, onClose: () => void}> = ({data: detail, ...props}) => {

    // Add a state to track if the user has viewed the last section
    const [hasViewedLastSection, setHasViewedLastSection] = useState(false);

    /*const [, setTriggerWhatsNewViewed] = useAtom(triggerWhatsNewViewedAtom)
    const [, setShowWhatsNew] = useAtom(showWhatsNewAtom)*/

    const [currentSection, setCurrentSection] = useState<number>(0)

    const paginatedSections = useMemo(() => {
        if (!detail) return [];

        return detail.flatMap(whatsNew =>
            whatsNew.sections.filter(section => section.minorDetail.length > 0)
        ).slice(0, 5); // hard limit to 5
    }, [detail]);

    const currentImageSrc = useMemo(() => {
        return paginatedSections[currentSection]?.minorDetail.find(
            x => x.items.find(
                y => y.src
            )
        )?.items.find(x => x.src)?.src || ''
    }, [paginatedSections, currentSection]);

    // When the user reaches the last section, mark it as viewed
    useEffect(() => {
        if (currentSection === paginatedSections.length - 1) {
            setHasViewedLastSection(true);
        }
    }, [currentSection, paginatedSections.length]);

    const {mutate} = useMutation(['whatsNewViewed'], logFeedback);
    
    const [nextIntervalTimeout, setNextIntervalTimeout] = useState(0)
    const [nextClickCount, setNextClickCount] = useState(1)
    const {start: nextIntervalStart, active: nextIntervalActive} = useInterval(() => {setNextIntervalTimeout(p => p + 1)}, 1000, {autoInvoke: false})
    const [firstInteractionTimeout, setFirstInteractionTimeout] = useState(0)
    useInterval(() => {setFirstInteractionTimeout(p => p + 1)}, 1000, {autoInvoke: true})

    const postTrackingInfo = (closeEvent: 'Feature list viewed' | 'Remind me later' | 'Close') => {
        const calculatedDate = closeEvent === 'Remind me later'
            ? new Date(Date.now() + 1000 * 60 * 60 * 24 * 2)
            : (!hasViewedLastSection && closeEvent === 'Close')
                ? new Date(Date.now() + 1000 * 60 * 60 * 24 * 5)
                : undefined;

        if (calculatedDate) {
            setWhatsNewPopupDoNotDisturbUntilDate(calculatedDate);
        }

        mutate({
            type: 'Whats New Popup Viewed',
            path: paginatedSections[0].version,
            message: JSON.stringify({
                nextClickVelocity: (Math.round(( nextIntervalTimeout / nextClickCount) * 10) / 10) + 's / click',
                timeToFirstInteraction: firstInteractionTimeout + 's',
                closeEvent: closeEvent,
                dismissed: hasViewedLastSection ? 'Until next update' : 'Until ' + moment(calculatedDate).format('Do [of] MMMM, h:mm a'),
            })
        })
    }

    // Check if the last section was viewed
    /*const handleClose = () => {
        if (hasViewedLastSection) {
            setTriggerWhatsNewViewed(p => p + 1);
        }
        props.onClose();
    };*/


    return <Box pos="relative">
        <CloseButton 
            style={{zIndex: 2000}} 
            variant={'transparent'} 
            c={'gray.5'} 
            pos={'absolute'} 
            top={'10px'} 
            right={'10px'} 
            onClick={() => {
                // handleClose()
                postTrackingInfo('Close')
            }} 
            size={'sm'}
        />
        <Box mih={350}>
            <AnimatePresence
                mode={'wait'}
                presenceAffectsLayout
            >
                {
                    paginatedSections.map((section, idx) => ( currentSection === idx &&
                        <motion.div
                            key={'whatsNew' + currentSection}
                            style={{
                                marginBottom: 3,
                            }}
                            initial={{
                                opacity: 0,
                            }}
                            animate={{
                                opacity: 1,
                            }}
                            exit={{
                                opacity: 0,
                                transition: {duration: 0.1, ease: 'easeInOut'}
                            }}
                            transition={{duration: 0.2, ease: 'easeInOut'}}
                        >


                            {
                                currentImageSrc ?
                                    <Image
                                        style={{
                                            objectFit: 'contain',
                                            objectPosition: 'top',
                                        }}
                                        src={currentImageSrc}
                                        alt={''}
                                        width={350}
                                        height={180}
                                    />
                                    :
                                    <Box
                                        style={{
                                            background: 'linear-gradient(167.27deg, var(--mantine-color-scBlue-6) 0%, var(--mantine-color-scBlue-9) 100%)'
                                        }}
                                        w={350}
                                        h={180}
                                        pos={'relative'}
                                    >
                                        <div style={{position: 'absolute', left: -135, top: -90}} className={styles.waveInfiniteAnimation}>
                                            {
                                                Array(10).fill('').map((x, i) => (
                                                    <svg
                                                        key={'vector' + i}
                                                        style={{
                                                            position: 'absolute',
                                                            left: i * 15,
                                                        }}
                                                        width="56" height="622" viewBox="0 0 56 622" fill="none"
                                                        xmlns="http://www.w3.org/2000/svg">
                                                        <path
                                                            d="M14.592 -6.15845C32.4488 18.44 26.4965 45.9327 22.8938 74.0682C21.1708 87.8948 20.3877 102.043 23.0505 116.512C31.0391 159.439 52.8119 168.764 55.1615 222.141C55.788 235.485 47.9561 253.171 39.1843 273.107C18.3514 320.214 5.35034 373.269 5.50698 409.283C5.50698 411.855 5.50694 414.267 5.66358 416.518C7.85652 454.46 25.4001 481.47 26.6532 515.554C26.9665 523.272 26.1833 531.31 24.3036 539.831C17.7248 568.932 8.95297 597.389 0.651123 626.65"
                                                            stroke="white"/>
                                                    </svg>
                                                ))
                                            }
                                        </div>
                                        <Title
                                            c={'white'}
                                            fw={'bolder'}
                                            pos={'absolute'}
                                            top={'24%'}
                                            left={'10%'}
                                        >
                                            New features and improvements
                                        </Title>
                                    </Box>
                            }
                            <Title c={'scBlue.9'} order={4} px={'sm'} mt={'sm'}>
                                {/*ServCraft */}{section?.version} - What&apos;s New
                            </Title>
                            <ScrollArea.Autosize
                                mah={{base: '80vh', lg: 500}}
                                px={'md'}
                                mb={'sm'}
                                // py={'xs'}
                                // pos={'relative'}
                                // maw={'95%'}
                            >
                                {section.minorDetail.map((x, i) => (
                                    x.type === 'heading' ? (
                                            x.items.map(
                                                (item, j) => (
                                                    <Text size={'lg'} c={'scBlue.9'}
                                                          key={'whatsNew' + /*i +*/ '-' + i + '-' + j}
                                                          style={{...item.style}}
                                                          mb={3}
                                                          // lh={1.6}
                                                    >
                                                        {item.text}
                                                    </Text>
                                                )
                                            )
                                        ) :
                                        x.type === 'list' ? (
                                                <List>
                                                    {
                                                        x.items.map(
                                                            (item, j) => (
                                                                <List.Item
                                                                    key={'whatsNew' + /*i +*/ '-' + i + '-' + j}
                                                                    icon={<ColorSwatch
                                                                        color={'var(--mantine-color-scBlue-3)'}
                                                                        size={6}/>}
                                                                >
                                                                    <Flex align={'center'}>
                                                                        <Text size={'sm'} c={'gray.8'}
                                                                              key={'whatsNew' + /*i +*/ '-' + i + '-' + j}
                                                                              style={{...item.style}}
                                                                        >
                                                                            {item.text}
                                                                        </Text>
                                                                        {
                                                                            item.href &&
                                                                            <Link href={item.href}>
                                                                                <Tooltip color={'gray.7'}
                                                                                         label={<Text size={'sm'}>Take
                                                                                             me
                                                                                             there</Text>}
                                                                                         events={{
                                                                                             hover: true,
                                                                                             focus: true,
                                                                                             touch: true
                                                                                         }}
                                                                                >
                                                                                    <ActionIcon variant={'subtle'}
                                                                                                size={'xs'}
                                                                                                ml={5}>
                                                                                        <IconExternalLink size={14}/>
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
                                            ) /*:
                                                x.type === 'image' ? (
                                                        x.items.map(
                                                            (item, j) => (
                                                                item.src &&
                                                                <Flex
                                                                    h={150}
                                                                    key={'whatsNew' + /!*i +*!/ '-' + i + '-' + j}
                                                                    pos={'relative'}
                                                                    mt={'sm'}
                                                                    // justify={'center'}
                                                                >
                                                                    <Image
                                                                        quality={20}
                                                                        alt={''}
                                                                        src={item.src}
                                                                        fill
                                                                        style={{objectFit: 'contain', objectPosition: 'left'}}
                                                                    />
                                                                </Flex>
                                                            )
                                                        )
                                                    )*/ :
                                            x.type === 'paragraph' ? (
                                                    x.items.map(
                                                        (item, j) => (
                                                            <Text size={'md'} c={'gray.7'}
                                                                  key={'whatsNew' + /*i +*/ '-' + i + '-' + j}
                                                                  style={{...item.style}}
                                                            >
                                                                {item.text}
                                                            </Text>
                                                        )
                                                    )
                                                ) :
                                                x.type === 'info' ? <>
                                                        <Alert variant={'light'} color={'teal'}
                                                               icon={<IconInfoCircle/>}>
                                                            {
                                                                x.items.map(
                                                                    (item, j) => (
                                                                        <Flex
                                                                            align={'center'}
                                                                            key={'whatsNew' + /*i +*/ '-' + i + '-' + j}
                                                                        >
                                                                            <Text size={'sm'} c={'gray.7'}
                                                                                  key={'whatsNew' + /*i +*/ '-' + i + '-' + j}
                                                                                  style={{...item.style}}
                                                                            >
                                                                                {item.text}
                                                                            </Text>
                                                                            {
                                                                                item.href &&
                                                                                <Link href={item.href}>
                                                                                    <Tooltip color={'gray.7'}
                                                                                             label={<Text size={'sm'}>Take
                                                                                                 me
                                                                                                 there</Text>}
                                                                                             events={{
                                                                                                 hover: true,
                                                                                                 focus: true,
                                                                                                 touch: true
                                                                                             }}
                                                                                    >
                                                                                        <ActionIcon variant={'subtle'}
                                                                                                    size={'xs'} ml={5}>
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

                                ))}
                            </ScrollArea.Autosize>
                        </motion.div>
                    ))
                }
            </AnimatePresence>
        </Box>


        <Flex align={'center'} justify={'end'} p={'md'} gap={'sm'} w={'100%'}>
            {
                currentSection === 0 ?
                    <Button
                        size={'compact-sm'} 
                        variant={'outline'} 
                        color={'gray.7'}
                        // onClick={handleClose}
                        onClick={() => {
                            props.onClose()
                            postTrackingInfo('Remind me later')
                        }}
                    >
                        Tell me later
                    </Button> :
                    <Button
                        size={'compact-sm'} variant={'outline'} color={'gray.7'}
                        onClick={() => setCurrentSection(p => p - 1)}
                    >
                        Back
                    </Button>
            }
            {
                currentSection !== paginatedSections.length - 1 ?
                    <Button
                        size={'compact-sm'}
                        onClick={() => {
                            setNextClickCount(p => p + 1)
                            !nextIntervalActive && nextIntervalStart()
                            setCurrentSection(p => p + 1)
                        }}
                    >
                        Next
                    </Button> : <></>
                    /*<Button
                        size={'compact-sm'}
                        onClick={() => {
                            setNextClickCount(p => p + 1)
                            setShowWhatsNew(true);
                            if (hasViewedLastSection) {
                                setTriggerWhatsNewViewed(p => p + 1);
                            }
                            props.onClose();
                            postTrackingInfo('Feature list viewed')
                        }}
                    >
                        Full feature list
                    </Button>*/
            }

        </Flex>


    </Box>;
}

export default WhatsNewPopupMiniContentRendering
