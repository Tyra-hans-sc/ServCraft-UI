import {FC, PropsWithChildren, ReactNode, useEffect, useState} from "react";
import {
    Anchor,
    Box,
    Button, CloseButton, CloseButtonProps,
    Flex,
    Group, MantineSize,
    Modal,
    ModalProps,
    ScrollArea,
    Stack,
    Text,
    Title,
    useMantineTheme
} from "@mantine/core";
import styles from './Modal.module.css';
import {useDidUpdate, useElementSize, useMediaQuery} from "@mantine/hooks";
import {IconChevronLeft} from "@tabler/icons";
import {IconStar} from "@tabler/icons-react";
import Constants from "@/utils/constants";
import {useAtom} from "jotai";
import {openModalsAtom} from "@/utils/atoms";
import {whatsNewData} from "@/PageComponents/Dashboard/WhatsNew/WhatsNewData";
import featureService from "@/services/feature/feature-service";
import PS from "@/services/permission/permission-service";

/*iterated to display svg lines on right section*/
const lineVectors = ['','','','','','','',''];

const SCModal: FC<PropsWithChildren<{
    open: boolean,
    onClose?: () => void,
    footerSection?: ReactNode,
    headerSection?: ReactNode,
    // if provided top back button with border underneath is shown.  Button triggers onClose() method
    headerSectionBackButtonText?: ReactNode,
    decor?: 'ServCraft' | /*'WhatsNew' |*/ 'Industries&JobCount' | 'none',
    size?: MantineSize | number | 'auto',
    modalProps?: {} | ModalProps,
    withCloseButton?: boolean,
    showClose?: boolean,
    p?: MantineSize | number,
    closeButtonProps?: CloseButtonProps
    // onWhatsNewIndexItemClicked?: (releaseIndex: number, sectionIndex: number) => void,
}>> =
    ({headerSection, footerSection, children, open, decor= 'none', modalProps, size, onClose, headerSectionBackButtonText, showClose, withCloseButton, ...props}) => {

        const theme = useMantineTheme();

        const isMobile = useMediaQuery('(max-width: 850px)');
        const forceFullscreen = useMediaQuery('(max-width: 400px)');

        const headerDiv = useElementSize();
        const footerDiv = useElementSize();

        const useReducedSize = useMediaQuery(`(max-width: ${theme.breakpoints.sm}px)`);

        const [, setOpenModals] = useAtom(openModalsAtom)
        const [uid] = useState(crypto.randomUUID())
        useDidUpdate(() => {
            if(open) {
                setOpenModals(p => [...p.filter(x => x !== uid), uid])
            } else {
                setOpenModals(p => p.filter(x => x !== uid))
            }
        }, [open]);

        const [loading, setLoading] = useState(true);
        const [data, setData] = useState<any[]>([])

        /*useEffect(() => {
            if(decor !== 'WhatsNew') {
                return
            }
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

                setLoading(false);
            };

            processWhatsNewData();
        }, []);*/

        return (
            <Modal
                size={size || 'xl'}
                withCloseButton={false}
                closeOnEscape
                closeOnClickOutside
                centered
                fullScreen={forceFullscreen}
                opened={open}
                onClose={() => {
                    onClose && onClose()
                }}
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
                /*styles={{
                    inner: {right: '-5%'}
                }}*/
                radius={6}
                padding={0}
                {...modalProps}
            >
                {withCloseButton && <CloseButton style={{zIndex: 1}} onClick={onClose} pos={'absolute'} right={10} top={10} {...props.closeButtonProps} />}
                <Flex direction={isMobile ? 'column-reverse' : 'row'} style={{position: 'relative'}}>
                    <div className={styles.leftSection}>
                        {
                            headerSectionBackButtonText && <Group style={(theme) => ({
                                borderBottom: `1px solid var(--mantine-color-gray-1)`,
                                padding: 'var(--mantine-spacing-md)'
                            })}>
                                <Button variant={'subtle'}
                                        color={'gray.9'}
                                        leftSection={<IconChevronLeft size={16}/>}
                                        onClick={onClose}
                                >
                                    {headerSectionBackButtonText}
                                </Button>
                            </Group>
                        }
                        <div ref={headerDiv.ref}>
                            {headerSection}
                        </div>
                        <Box p={props.p ?? 'lg'}>
                            {
                                footerSection &&
                                /*<ScrollArea mah={'100vh'}
                                             h={`calc(580px - ${headerDiv.height + 'px'} - ${(footerDiv.height + 'px')})`}
                                             offsetScrollbars
                                >
                                    {children}
                                </ScrollArea>*/
                                <div
                                    // style={{minHeight: `calc(580px - ${headerDiv.height + 'px'} - ${(footerDiv.height + 'px')})`}}
                                    style={{height: !isMobile ? `calc(580px - ${headerDiv.height + 'px'} - ${(footerDiv.height + 'px')})` : '', maxHeight: '60vh'}}
                                >
                                    {children}
                                </div> ||
                                children
                            }
                            <Group w={'100%'} ref={footerDiv.ref} justify={'right'} mt={'md'} display={!footerSection ? 'none' : undefined}>
                                {footerSection}
                            </Group>
                        </Box>
                    </div>

                    {
                        decor !== 'none' &&
                        <div className={styles.rightSection}
                             style={isMobile ? {
                                 minHeight: '200px',
                                 maxWidth: '100%',
                                 paddingInline: 0
                             } : decor === 'ServCraft' ? {
                                 height: `calc(90vh  - ${headerDiv.height + 'px'} - ${(footerDiv.height + 'px')})`,
                                 maxHeight: 622
                             } /*: decor === 'WhatsNew' ? {
                                 // height: `fit-content`,
                                 // maxHeight: 622
                             }*/ : {}
                             }
                        >
                            {
                                showClose &&
                                <CloseButton
                                    c={'white'}
                                    pos={'absolute'}
                                    variant={'transparent'}
                                    size={'lg'}
                                    top={15}
                                    right={15}
                                    style={{zIndex: 5000}}
                                    onClick={onClose}
                                />
                            }
                            {
                                !isMobile &&
                                <div style={{position: 'absolute', left: -75}}>
                                    {
                                        lineVectors.map(
                                            (x, i) => (
                                                <svg
                                                    key={'vector' + i}
                                                    style={{
                                                        position: 'absolute',
                                                        left: i * 15,
                                                        opacity: 0.5 - 0.05 * i,
                                                        rotate: '5deg'
                                                    }}
                                                    width="56" height="622" viewBox="0 0 56 622" fill="none"
                                                    xmlns="http://www.w3.org/2000/svg">
                                                    <path
                                                        d="M14.592 -6.15845C32.4488 18.44 26.4965 45.9327 22.8938 74.0682C21.1708 87.8948 20.3877 102.043 23.0505 116.512C31.0391 159.439 52.8119 168.764 55.1615 222.141C55.788 235.485 47.9561 253.171 39.1843 273.107C18.3514 320.214 5.35034 373.269 5.50698 409.283C5.50698 411.855 5.50694 414.267 5.66358 416.518C7.85652 454.46 25.4001 481.47 26.6532 515.554C26.9665 523.272 26.1833 531.31 24.3036 539.831C17.7248 568.932 8.95297 597.389 0.651123 626.65"
                                                        stroke="white"/>
                                                </svg>
                                            )
                                        )
                                    }
                                </div>
                            }

                            {
                                decor === 'ServCraft' &&
                                <Flex direction={'column'} className={styles.rightSectionContainer}>
                                    <div className={styles.scLogoContainer}
                                         style={{
                                             width: useReducedSize ? 48 : 96,
                                             height: useReducedSize ? 48 : 96
                                         }}
                                    >
                                        <img src="/logo-white.svg" width={useReducedSize && 20 || 40} height={useReducedSize && 20 || 40} alt=""/>
                                    </div>
                                    <div>
                                        <Title size={useReducedSize && 'large' || 'xx-large'} fw={'bolder'} mt={'var(--mantine-spacing-sm)'}>ServCraft</Title>
                                        <Text size={useReducedSize ? 'xs' : 'sm'}>Take control of your business.</Text>
                                    </div>
                                </Flex>
                            }

                            {
                                /*decor === 'WhatsNew' &&
                                <Flex direction={'column'} className={isMobile ? styles.rightSectionContainer : styles.rightSectionContainerItemsTop}>
                                    <div className={styles.scLogoContainer}
                                         style={{
                                             width: useReducedSize ? 48 : 96,
                                             height: useReducedSize ? 48 : 96
                                         }}
                                    >
                                        {/!*<img src="/logo-white.svg" width={useReducedSize && 20 || 40} height={useReducedSize && 20 || 40} alt=""/>*!/}
                                        <IconStar size={'3em'} />
                                    </div>
                                    <div>
                                        <Title size={useReducedSize && 'large' || 'xx-large'} fw={'bolder'} mt={'var(--mantine-spacing-sm)'}>Latest Updates</Title>
                                        <Text size={useReducedSize ? 'xs' : 'sm'}>v {Constants.appVersion()}</Text>
                                    </div>

                                    {
                                        !isMobile && !loading && data.length > 0 &&
                                        <ScrollArea.Autosize >
                                            <Flex direction={'column'} mt={'xl'} align={'center'}>
                                                {
                                                    data.flatMap((x, i) => (
                                                        x.sections.flatMap((y, j) => (
                                                            <Anchor c={'white'} size={'xs'} key={'wn' + i + '-' + j} mt={'var(--mantine-spacing-xs)'}
                                                                    onClick={() => props.onWhatsNewIndexItemClicked && props.onWhatsNewIndexItemClicked(i, j)}
                                                            >
                                                                {y.title} ({y.version})
                                                            </Anchor>
                                                        ))
                                                    )).filter((_, i) => i < 5 )
                                                }
                                            </Flex>
                                        </ScrollArea.Autosize>
                                    }

                                </Flex>*/
                            }

                            {
                                decor === 'Industries&JobCount' &&
                                <Flex direction={isMobile ? 'row' : 'column'}
                                      className={styles.rightSectionContainer}
                                      gap={{base: 'sm', xs: 60}}
                                >
                                    <Stack align={'center'} gap={0}>
                                        <div className={styles.scLogoContainer}
                                             style={{
                                                 width: useReducedSize ? 48 : 96,
                                                 height: useReducedSize ? 48 : 96
                                             }}
                                        >
                                            <img src="/specno-icons/home.svg" width={useReducedSize && 20 || 40} height={useReducedSize && 20 || 40} alt=""/>
                                        </div>
                                        <div>
                                            <Title size={useReducedSize && 'large' || 'xx-large'} fw={'bolder'} mt={'var(--mantine-spacing-sm)'}>20+</Title>
                                            <Text size={useReducedSize ? 'xs' : 'sm'} mt={'var(--mantine-spacing-xs)'}>Different industries</Text>
                                        </div>
                                    </Stack>

                                    <Stack align={'center'} gap={0}>
                                        <div className={styles.scLogoContainer}
                                             style={{
                                                 width: useReducedSize ? 48 : 96,
                                                 height: useReducedSize ? 48 : 96
                                             }}
                                        >
                                            <img src="/specno-icons/square_check.svg"  width={useReducedSize && 20 || 40} height={useReducedSize && 20 || 40} alt=""/>
                                        </div>
                                        <div>
                                            <Title size={useReducedSize && 'large' || 'xx-large'} fw={'bolder'} mt={'var(--mantine-spacing-sm)'}>1 000 000+</Title>
                                            <Text size={useReducedSize ? 'xs' : 'sm'} mt={'var(--mantine-spacing-xs)'}>Jobs completed</Text>
                                        </div>
                                    </Stack>
                                </Flex>
                            }

                        </div>
                    }

                </Flex>
            </Modal>
        );
    };

export default SCModal;
