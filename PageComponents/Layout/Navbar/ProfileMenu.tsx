import { Box, Flex, Menu, rem, Text, UnstyledButton } from "@mantine/core";
import Helper from "@/utils/helper";
import { IconChevronDown, IconExternalLink } from "@tabler/icons";
import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import Constants from "@/utils/constants";
import Router from "next/router";
import Fetch from "@/utils/Fetch";
import * as Enums from "@/utils/enums";
import { logout } from "@/utils/auth";
import ToastContext from "@/utils/toast-context";
import SubscriptionContext from "@/utils/subscription-context";
import SCMessageBarContext from "@/utils/contexts/sc-message-bar-context";
import { colors, layout } from "@/theme";
import HubspotContext from "@/utils/contexts/hubspot-context";
import { useMutation, useQuery } from "@tanstack/react-query";
import UserConfigService from "@/services/option/user-config-service";
import {
    IconAbacus,
    IconDatabaseX,
    IconLogout,
    IconMessage,
    IconMessageOff,
    IconPasswordUser,
} from "@tabler/icons-react";
// import WhatsNewModal from "@/PageComponents/Dashboard/WhatsNew/WhatsNewModal";
// import styles from './ScNavbar.module.css'
// import { whatsNewData } from "@/PageComponents/Dashboard/WhatsNew/WhatsNewData";
// import featureService from "@/services/feature/feature-service";
// import PS from '@/services/permission/permission-service';
import TimerContext from "@/utils/timer-context";
// import {useAtom} from "jotai";
// import {showWhatsNewAtom} from "@/utils/atoms";

const hsChatVar = 'showHsChat'

const ProfileMenu = ({ fullName, email, companyName, isOwner/*, showWhatsNewAlert, setShowWhatsNewAlert*/ }) => {

    /* whats new and popover are now deprecated with feedbear functionality

    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any[]>([])

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
            setLoading(false);
        };

        processWhatsNewData();
    }, []);*/

    const hsContext = useContext<{ loaded: boolean } | null>(HubspotContext as any);
    const [hsShown, setHsShown] = useState(true)

    const hsConversationsRef = useRef(typeof window !== 'undefined' && (window as any)?.HubSpotConversations?.widget)
    const hsIframeWrapperRef = useRef<false | HTMLElement | null>(null);

    useEffect(() => {
        setTimeout(() => {
            hsConversationsRef.current = typeof window !== 'undefined' && (window as any)?.HubSpotConversations?.widget
        }, 800);

        let interval = setInterval(() => {
            doHubspotOverlayLogic();
        }, 1000);

        return () => clearInterval(interval);
    }, [hsContext?.loaded])

    const doHubspotOverlayLogic = () => {
        let prevRefUndefined = !hsIframeWrapperRef.current;
        hsIframeWrapperRef.current = typeof window !== 'undefined' && window.document.getElementById("hubspot-messages-iframe-container");
        let currentRefActive = !!hsIframeWrapperRef.current;

        if (prevRefUndefined && currentRefActive) {
            // initiate hubspot overlay
            let refElem = hsIframeWrapperRef.current as HTMLElement;

            refElem.onmouseenter = () => {
                let hideElem = window.document.createElement("div");
                hideElem.id = "hide-hs-overlay";
                hideElem.className = "hide-hs-overlay";
                hideElem.innerHTML = "<span>-</span>";
                hideElem.style.position = "absolute";
                hideElem.style.bottom = "60px";
                hideElem.style.right = "8px";
                hideElem.style.cursor = "pointer";
                hideElem.style.width = "24px";
                hideElem.style.height = "24px";
                hideElem.style.borderRadius = "24px";
                hideElem.style.background = "#003ED0";
                hideElem.style.color = "#FFFFFF";
                hideElem.style.padding = "1px 10px";
                hideElem.style.fontWeight = "bold";
                hideElem.style.boxShadow = "0 0 8px 1px rgba(0,0,0,0.2)";
                hideElem.style.transition = "0.2s scale";
                hideElem.title = "Hide help chat. Chat can be reopened via profile menu.";
                hideElem.onclick = (e) => toggleHsChatWidget();
                hideElem.onmouseenter = () => hideElem.style.scale = "1.3";
                hideElem.onmouseleave = () => hideElem.style.scale = "1";
                refElem.appendChild(hideElem);
            };

            refElem.onmouseleave = () => {
                let hideElem = window.document.getElementById("hide-hs-overlay");
                hideElem?.remove();
            }
        }
    };

    useEffect(() => {
        if (!hsShown) {
            setTimeout(() => {
                hsConversationsRef.current?.remove()
            }, 300)
        }
    }, [hsConversationsRef.current])

    const userConfigQuery = useQuery(['userAuth'], () => UserConfigService.getPageFilters(Enums.ConfigurationSection.None, null))

    // Update HubSpot chat visibility when user config data changes
    useEffect(() => {
        if (userConfigQuery.data) {
            const shownValue: boolean | null = UserConfigService.getMetaDataValue(userConfigQuery.data, hsChatVar)
            if (shownValue !== null && !shownValue) {
                setHsShown(false)
                hsConversationsRef.current?.remove()
            } else if (shownValue) {
                hsConversationsRef.current?.load()
                setHsShown(true)
            }
        }
    }, [userConfigQuery.data])

    const userConfigMutation = useMutation(['userAuth'], (shown: boolean) => UserConfigService.saveConfig({
        ...userConfigQuery?.data,
        MetaData: JSON.stringify({
            ...(!!userConfigQuery.data?.MetaData && JSON.parse(userConfigQuery.data?.MetaData) || {}),
            [hsChatVar]: shown
        })
    }, null))

    const toast = useContext<any>(ToastContext);
    const subscriptionContext = useContext<any>(SubscriptionContext);
    const messageBarContext = useContext<any>(SCMessageBarContext);
    const timerContext = useContext<any>(TimerContext);

    const [opened, setOpened] = useState(false)

    // Hidden: hiding Manage my Subscription and Update Password
    // const goToManageSubscription = () => {
    //     Helper.nextRouter(Router.push, '/settings/subscription/manage');
    //     setOpened(false)
    // };

    // const goToChangePassword = () => {
    //     Helper.nextRouter(Router.push, '/settings/change-password');
    //     setOpened(false)
    // };

    const [chatMouseOver, onChatMouseOver] = useState(false);
    const toggleHsChatWidget = () => {
        if (hsShown) {
            hsConversationsRef.current?.remove()
            setHsShown(false)
            userConfigQuery?.data?.MetaData && userConfigMutation.mutate(false)
        } else {
            hsConversationsRef.current?.load()
            hsConversationsRef.current?.open()
            setHsShown(true)
            userConfigQuery?.data?.MetaData && userConfigMutation.mutate(true)
        }
        setOpened(false)
    }

    const logoutClick = () => {
        messageBarContext.setIsActive(false);
        subscriptionContext.setSubscriptionInfo(null);
        setOpened(false)
        logout();
        timerContext.clearRunningTimers()
    };

    const resetCache = async () => {
        let result = await Fetch.post({
            url: '/Admin/ResetCache'
        } as any);

        toast.setToast({
            message: `Reset cache ${result.Result ? "successful" : "unsuccessful"}${(result.Message ? `: ${result.Message}` : "")}`,
            type: result.Result ? Enums.ToastType.success : Enums.ToastType.error,
            show: true
        });
        setOpened(false)
    }


    const [resetCacheMouseOver, setResetCacheMouseOver] = useState(false);
    const onResetCacheMouseEvent = (mouseover = true) => {
        setResetCacheMouseOver(mouseover);
    };


    const [logoutMouseOver, setLogoutMouseOver] = useState(false);
    const onLogoutMouseEvent = (mouseover = true) => {
        setLogoutMouseOver(mouseover);
    };

    const [passwordMouseOver, setPasswordMouseOver] = useState(false);
    const onPasswordMouseEvent = (mouseover = true) => {
        setPasswordMouseOver(mouseover);
    };


    const [subscriptionMouseOver, setSubscriptionMouseOver] = useState(false);
    const onSubscriptionMouseEvent = (mouseover = true) => {
        setSubscriptionMouseOver(mouseover);
    };

    // const [showWhatsNew, setShowWhatsNew] = useAtom(showWhatsNewAtom)

    return <>
        {/*<WhatsNewModal show={showWhatsNew} setShow={setShowWhatsNew} initiator={'menu'} />*/}
        <Menu
            opened={opened}
            onChange={setOpened}
            withArrow
            withinPortal
            position={'bottom-end'}
            arrowPosition={'side'}
            shadow={'sm'}
            transitionProps={{
                transition: 'pop-top-right',
                duration: 100
            }}
        >
            <Menu.Target>
                <UnstyledButton
                // onClick={() => setShowProfilePopup(!showProfilePopup)} ref={profileRef}
                >
                    <Flex align={'center'} gap={5}>
                        <Box
                            p={5}
                            style={(t) => ({
                                backgroundColor: 'var(--mantine-color-scBlue-7)',
                                color: 'white',
                                borderRadius: '50%',
                                fontSize: '.8rem',
                                fontWeight: 600
                            })}
                        >
                            {Helper.getInitials(fullName)}
                        </Box>
                        <Box className="names">
                            {companyName !== 'null'
                                && <>
                                    <Text lineClamp={1}> {companyName} </Text>
                                </>
                            }
                        </Box>
                        {
                            /*showWhatsNewAlert ? <span
                                className={styles.whatsNewIconBlink}
                                style={{ color: 'goldenrod' }}
                            >
                                <IconStarFilled
                                    size={18}
                                    color={'goldenrod'}
                                />
                            </span> : ''*/
                        }
                        <IconChevronDown
                            size={16}
                            style={{
                                transform: opened ? 'rotate(-90deg)' : 'rotate(0)',
                                transition: 'transform ease-out 100ms'
                            }}
                        />
                    </Flex>

                </UnstyledButton>
            </Menu.Target>
            <Menu.Dropdown>

                <div className='user-container'>
                    <div className="row">
                        <div className="name bolded-text">
                            {fullName}
                        </div>
                    </div>
                    <div className='row'>
                        <div className="name">
                            {email}
                        </div>
                    </div>
                    <div className='separator'></div>
                </div>
                <div className='link-container'>
                    {/* Hidden: hiding Manage my Subscription and Update Password */}
                    {/* {isOwner ?
                        <div className='link' onClick={goToManageSubscription}>
                            <IconAbacus stroke={1.2} size={21} />
                            Manage my Subscription
                        </div>
                        : ''}
                    <div className='link' onClick={goToChangePassword}>
                        <IconPasswordUser stroke={1.2} size={21} />
                        Update Password
                    </div> */}
                    <div className='link' onClick={toggleHsChatWidget}>
                        {/*<img src={`/sc-icons/chat-${chatMouseOver ? 'light' : 'dark'}.svg`} alt="chat"/>*/}
                        {
                            hsShown ? <IconMessageOff stroke={1.2} size={21} /> : <IconMessage stroke={1.2} size={21} />
                        }
                        {hsShown ? 'Hide' : 'Show'} Help Chat
                    </div>

                    <div className="link" onClick={logoutClick}>
                        {/*<img src={`/sc-icons/logout-${logoutMouseOver ? 'light' : 'dark'}.svg`} alt="logout" />*/}
                        <IconLogout stroke={1.2} size={21} />
                        Logout
                    </div>

                    {email === "Admin" ?
                        <div className="link" onClick={resetCache}>
                            {/*<img src={`/sc-icons/download-${resetCacheMouseOver ? 'light' : 'dark'}.svg`} alt="reset" />*/}
                            <IconDatabaseX stroke={1.2} size={21} />
                            Reset Cache
                        </div>
                        : ''}

                    {
                        /*!loading && data.length > 0 &&
                            <div className={'link ' + (showWhatsNewAlert ? styles.alertMenuOption : '')}
                                 onClick={() => {
                                     setShowWhatsNew(true)
                                     setOpened(false)
                                     setShowWhatsNewAlert(false)
                                 }}
                            >
                                {
                                    showWhatsNewAlert ?
                                        <IconStarFilled stroke={1.2} size={21}/> :
                                        <IconStar stroke={1.2} size={21}/>
                                }
                                What&apos;s New
                                {showWhatsNewAlert ? ` (${data.find(x => x.sections?.length > 0)?.sections[0]?.version})` : ''}
                            </div>*/
                    }

                </div>
                <div className="terms">
                    <a className="a-terms" href="https://www.servcraft.co.za/terms-of-use/" target="_blank"
                       rel={'noreferrer'}>Terms</a>
                    <div></div>
                    <a className="a-terms" href="https://www.servcraft.co.za/privacy-policy/" target="_blank"
                       rel={'noreferrer'}>Privacy</a>
                    <div></div>
                    <span className="no-wrap">v {Constants.appVersion()}</span>
                </div>
                <style jsx>{`
                    .row {
                        display: flex;
                    }

                    .popup {
                        background-color: ${colors.white};
                        border-radius: ${layout.bigRadius};
                        box-shadow: 0px 10px 16px rgba(0, 0, 0, 0.1), 0px 4px 6px rgba(0, 0, 0, 0.06);
                        cursor: default;
                        display: none;
                        padding-top: 0.5rem;
                        padding-bottom: 0.5rem;
                        position: absolute;
                        right: 1rem;
                        top: ${messageBarContext.isActive ? `${Constants.messageBarMargin + 60}px;` : "60px"};
                        z-index: 3;
                        width: fit-content;
                      }
                      .popup.show {
                        display: block;
                      }
                      .popup:after,
                        .popup:before {
                            bottom: 100%;
                            border: solid transparent;
                            content: " ";
                            height: 0;
                            width: 0;
                            position: absolute;
                            pointer-events: none;
                        }

                        .popup:after {
                            border-color: rgba(255, 255, 255, 0);
                            border-bottom-color: #ffffff;
                            border-width: 8px;
                            left: 95%;
                            margin-left: -19px;
                        }

                        .popup:before {
                            border-color: rgba(255, 255, 255, 0);
                            border-bottom-color: white;
                            border-width: 8px;
                            left: 95%;
                            margin-left: -20px;
                        }
                      .initials-popup {
                        align-items: center;
                        background-color: ${colors.bluePrimary};
                        border-radius: 1.25rem;
                        color: ${colors.black};
                        display: flex;
                        flex-shrink: 0;
                        font-weight: bold;
                        height: 2.5rem;
                        justify-content: center;
                        margin-right: 0.5rem;
                        width: 2.5rem;
                      }
                      .user-container {
                        padding: 0 1rem;
                      }
                      .name {
                        color: ${colors.subHeading};
                        display: flex;
                        flex-direction: column;
                        font-size: 12px;
                        text-align: left;
                        margin-bottom: 0.25rem;
                      }
                      .separator {
                          width: 13px;
                          height: 0px;
                          border: 1px solid ${colors.bluePrimary};
                      }
                      .link-container {
                          margin-top: 0.5rem;                          
                      }
                      .link {
                        align-items: center;
                        color: ${colors.darkPrimary};
                        cursor: pointer;
                        display: flex;
                        font-size: 12px;
                        text-align: left;
                        white-space: nowrap;
                        height: 30px;
                        padding: 0.25rem 1rem;
                          gap: 8px;
                      }
                      .link img {
                        margin: 0 0.5rem 0 0;
                      }
                      .link:hover {
                        background-color: var(--mantine-color-scBlue-7);
                        color: ${colors.white};
                      }
                      .terms {                          
                        align-items: center;
                        color: ${colors.blueGreyLight};
                        display: flex;
                        justify-content: center;
                        font-size: 12px;
                        padding-top: 1rem;
                      }
                      .terms div {
                        height: 6px;
                        margin-left: 3px;
                        margin-right: 3px;
                        width: 0;
                        border-left: 1px solid ${colors.blueGreyLight};
                      }
                      .a-terms {
                        color: ${colors.blueGreyLight};
                        font-size: 12px;
                        text-decoration: underline;
                      }

                      :global(div.hide-hs-overlay) {
                        position: absolute;
                        bottom: 8px;
                        right: 50px;
                      }
                `}</style>

            </Menu.Dropdown>

            {/*<Menu.Dropdown>

                <Menu.Label>
                    <div className="row">
                        <div className="bolded-text">
                            {fullName}
                        </div>
                    </div>
                    <div className='row'>
                        <div className="name">
                            {email}
                        </div>
                    </div>
                </Menu.Label>
                <Menu.Divider />
                <Menu.Item onClick={logoutClick}>
                    <div>
                        Logout
                    </div>
                </Menu.Item >
                {
                    email === 'Admin' &&
                    <Menu.Item onClick={resetCache}>
                        <div>
                            Reset Cache
                        </div>
                    </Menu.Item>
                }


                <Menu.Divider />

                <Menu.Label>
                    <div className="terms">
                        <a className="a-terms" href="https://www.servcraft.co.za/terms-of-use/" target="_blank" rel={'noreferrer'}>Terms</a>
                        <div></div>
                        <a className="a-terms" href="https://www.servcraft.co.za/privacy-policy/" target="_blank" rel={'noreferrer'}>Privacy</a>
                        <div></div>
                        <span className="no-wrap">v {Constants.appVersion()}</span>
                    </div>
                </Menu.Label>

                <Menu.Item component="a" href="https://mantine.dev">
                    Mantine website
                </Menu.Item>

                <Menu.Item
                    icon={<IconExternalLink size={rem(14)}/>}
                    component="a"
                    href="https://mantine.dev"
                    target="_blank"
                >
                    External link
                </Menu.Item>
            </Menu.Dropdown>*/}
        </Menu>

    </>
}

export default ProfileMenu
