import React, {useEffect, useMemo, useState} from "react";
import SCWidgetCard from "./sc-widget-card";
import {Button, Flex, LoadingOverlay, ScrollArea, useMantineTheme} from "@mantine/core";
import SCWidgetTitle from "@/components/sc-controls/widgets/new/sc-widget-title";
import NewText from "@/PageComponents/Premium/NewText";
import {IconStar, IconStarFilled} from "@tabler/icons-react";
import WhatsNewMiniContentRendering from "@/PageComponents/Dashboard/WhatsNew/WhatsNewMiniContentRendering";
import {whatsNewData} from "@/PageComponents/Dashboard/WhatsNew/WhatsNewData";
import PS from '@/services/permission/permission-service';
import featureService from "@/services/feature/feature-service";
// import {showWhatsNewAtom, triggerWhatsNewViewedAtom, whatsNewBlinkingAttentionModeAtom} from "@/utils/atoms";
import {useAtom} from "jotai";
import navbarStyles from '@/PageComponents/Layout/Navbar/ScNavbar.module.css';
import styles from "@/PageComponents/Layout/Navbar/ScNavbar.module.css";

export default function SCWidgetWhatsNew2({ widget, accessStatus, testing, onDismiss }) {

    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>()


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
            setData(resolvedData.find(x => x.sections.length !== 0 && x.sections[0]?.minorDetail.length !== 0));
            setLoading(false);
        };

        processWhatsNewData();
    }, []);


    /*const [hasBundles, setHasBundles] = useState(false);

    useEffect(() => {
        featureService.getFeature(constants.features.INVENTORY_SECTION_BUNDLE).then(feature => {
            setHasBundles(!!feature);
        });
    }, []);*/

    const theme = useMantineTheme()

    /*const [, setShowWhatsNewModal] = useAtom(showWhatsNewAtom)

    const [, setTriggerWhatsNewViewed] = useAtom(triggerWhatsNewViewedAtom)
    const [showWhatsNewAlert] = useAtom(whatsNewBlinkingAttentionModeAtom)

    const viewPerviousReleaseButton = useMemo(() => (
        <Button
            size={'compact-sm'} mt={5} mr={5}
            variant={showWhatsNewAlert ? 'transparent' : 'transparent'}
            gradient={{from: 'scBlue.8', to: 'scBlue.5', deg: 270}}
            color={showWhatsNewAlert ? 'goldenrod' : 'white'}
            c={showWhatsNewAlert ? 'goldenrod' : 'white'}
            onClick={(e) => {
                e.stopPropagation()
                setShowWhatsNewModal(p => !p)
                setTriggerWhatsNewViewed(p => p + 1)
            }}
        >
            View more updates &nbsp;
            {
                showWhatsNewAlert ? <span
                    className={styles.whatsNewIconBlink}
                    style={{ color: 'goldenrod' }}
                >
                    <IconStarFilled
                        size={22}
                        color={'goldenrod'}
                    />
                </span> : <IconStar size={18}/>
            }

        </Button>
    ), [showWhatsNewAlert])*/


    return (<>
        {/*<WhatsNewModal show={showWhatsNewModal} setShow={setShowWhatsNewModal} initiator={'widget'}/>*/}
        {/*<SCWidgetCard height={widget.heightPX} background={theme.colors.scBlue[6]} onDismiss={onDismiss}
                      cardProps={{
                          pb: 0,
                          borderBottom: 'none',
                          onClick: () => {
                              setShowWhatsNewModal(p => !p)
                              setTriggerWhatsNewViewed(p => p + 1)
                          },
                          classNames: {
                              // root: showWhatsNewAlert ? navbarStyles.cardAlert : navbarStyles.normalCard
                              root: navbarStyles.normalCard + (showWhatsNewAlert ? ' ' + navbarStyles.cardAlert : '')
                          }
                      }}

        >

            <SCWidgetTitle title={<>Latest Update <NewText/></>} color={theme.colors.gray[0]}/>

            <LoadingOverlay visible={loading}/>

            <ScrollArea h={`calc(${widget.heightPX}px - 100px)`}>
                <WhatsNewMiniContentRendering data={data}/>
            </ScrollArea>


            <Flex w={'100%'} justify={'right'} mt={0} p={0}>

                {viewPerviousReleaseButton}

                {
                    // data?.sections[0]?.link && <Link
                    //     href={data?.sections[0]?.link}
                    // >
                    //     <Button
                    //         size={'compact-sm'} mt={5} variant={'white'} color={'scBlue'}
                    //         rightSection={<IconExternalLink size={17}/>}
                    //         onClick={() => {
                    //             Helper.mixpanelTrack(constants.mixPanelEvents.widgetWhatsNewClicked, null);
                    //             Helper.nextLinkClicked('/inventory/list?tab=bundles');
                    //         }}
                    //         // disabled={accessStatus === Enums.AccessStatus.LockedWithAccess || accessStatus === Enums.AccessStatus.LockedWithOutAccess}
                    //     >
                    //         Check it out
                    //     </Button>
                    // </Link>
                }
            </Flex>
        </SCWidgetCard>*/}
    </>);
}
