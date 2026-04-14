'use client';

import React, { useState, useRef, useEffect, useContext, useCallback, useMemo } from 'react';
import { colors } from '@/theme';
import useOutsideClick from "../../../hooks/useOutsideClick";
import GlobalSearch from '@/components/global-search/global-search';
import * as Enums from '../../../utils/enums';
import PS from '../../../services/permission/permission-service';
import Storage from '../../../utils/storage';
import Constants from '../../../utils/constants';
import Router, { useRouter } from 'next/router';
import Helper from '../../../utils/helper';
import SubscriptionContext from '../../../utils/subscription-context';
import SCMessageBarContext from '../../../utils/contexts/sc-message-bar-context';
import HubspotContext from '../../../utils/contexts/hubspot-context';
import Fetch from '../../../utils/Fetch';
import TimerContext from '../../../utils/timer-context';
import Time from '../../../utils/time';
import InitialSetup from '@/components/modals/initial-setup';
import ToastContext from '../../../utils/toast-context';
import MessageBarHelper from '../../../utils/message-bar-helper';
import {ActionIcon, Box, Burger, Flex, Text, Tooltip} from "@mantine/core";
import Message from '@/components/message';

import styles from './ScNavbar.module.css'
import { IconSettings } from "@tabler/icons";
import ProfileMenu from './ProfileMenu';
import HelpMenu from "@/PageComponents/Layout/Navbar/HelpMenu";
import ConfirmAction from '@/components/modals/confirm-action';
import helper from '../../../utils/helper';
import Link from "next/link";
import {useElementSize, useMediaQuery} from "@mantine/hooks";
import AnimatedTimerButtonMobile from "@/PageComponents/Layout/Navbar/AnimatedTimerButtonMobile";
import {useAtom} from "jotai/index";
import {
    passwordChangePromptAtom,
    justCompletedSetupAtom,
    forceInitialSetupAtom
} from "@/utils/atoms";
import ChangeEmployeePassword from '@/components/modals/employee/change-employee-password';


const routeMapping = {
    '': 'Dashboard',
    'project': 'Projects',
    'job-schedule': 'Recurring Jobs',
    'recurringjobs': 'Recurring Jobs',
    'job': 'Jobs',
    'appointment': 'Appointments',
    'query': 'Queries',
    'purchase': 'Purchases',
    'quote': 'Quotes',
    'invoice': 'Invoices',
    'tab=assets': 'Assets',
    'customer': 'Customers',
    'tab=categories': 'Categories',
    'tab=subcategories': 'Subcategories',
    'tab=supplier': 'Suppliers',
    'inventory': 'Inventory',
    'inventory-category': 'Category',
    'inventory-subcategory': 'Subcategory',
    'stock-take': 'Stock Take',
    'asset': 'Asset',
    'supplier': 'Supplier',
    'report': 'Reports',
    'message': 'Messages',
    'settings': 'Settings',
    'bundle': "Bundles",
    'new-communication': 'Communication',
    'stocktransaction': "Stock Transactions",
    'van': "Vans"
}

const iconMapping = {
    'dashboard': '/sc-icons/dashboard-blue.svg',
    'job': '/sc-icons/jobs-blue.svg',
    'project': '/sc-icons/jobs-blue.svg',
    'appointment': '/sc-icons/appointments-blue.svg',
    'query': '/sc-icons/queries-blue.svg',
    'purchase': '/sc-icons/purchases-blue.svg',
    'quote': '/sc-icons/quotes-blue.svg',
    'invoice': '/sc-icons/invoices-blue.svg',
    'tab=assets': '/sc-icons/assets-blue.svg',
    'customer': '/sc-icons/customers-blue.svg',
    'inventory': '/sc-icons/inventory-blue.svg',
    'asset': '/sc-icons/assets-blue.svg',
    'supplier': '/sc-icons/inventory-blue.svg',
    'report': '/sc-icons/reports-blue.svg',
    'message': '/sc-icons/message-blue.svg',
    'settings': '/sc-icons/settings-blue.svg',
    'new-communication': '/sc-icons/message-blue.svg'
}

export const borderLessPages = [
    '/job',
    '/project',
    '/asset',
    '/query',
    '/quote',
    '/invoice',
    '/bundle',
    '/supplier',
    '/purchase',
    '/customer',
    '/inventor',
    '/stock-take',
    '/message',
    '/appointment',
    // '/new-communication'
]

const getHeadingTitleFormUrl = (url: string) => {

    const entry = Object.entries(routeMapping).find(([s, t]) => s !== '' && url.includes(s))
    return url === '/' ? 'Dashboard' : entry ? entry[1] : ''
    /*if(url.includes('?tab=')) {
        return routeMapping[Object.keys(routeMapping).find(k => k !== '' && url.includes(k)) || '']
    } else {
        return url.split('/')[1] === 'pre-release' ? routeMapping[url.split('/')[2]] : routeMapping[url.split('/')[1]]
    }*/
}

const getImageFromUrl = (url: string) => {
    const entry = Object.entries(iconMapping).find(([s, t]) => s !== '' && url.includes(s))
    return url === '/' ? iconMapping.dashboard : entry ? entry[1] : ''
}

const ScNavbar = (props: { customerZone: boolean; onToggleHelp: () => void; helpOpened: boolean, setMobileMenuCollapsed: (collapsed: boolean) => void; mobileMenuCollapsed: boolean}) => {

    const toast = useContext<any>(ToastContext);
    const timerContext = useContext<any>(TimerContext);
    const subscriptionContext = useContext<any>(SubscriptionContext);
    const messageBarContext = useContext<any>(SCMessageBarContext);
    const hubspotContext = useContext<any>(HubspotContext);

    const customerZone = props.customerZone;
    const [userEmail, setUserEmail] = useState("");
    const [userFullName, setUserFullName] = useState("");
    const [userCompanyName, setUserCompanyName] = useState("");
    const [userAdmin, setUserAdmin] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [subscriptionInfo, setSubscriptionInfo] = useState(subscriptionContext.subscriptionInfo);
    const [isOwner, setIsOwner] = useState(false);
    const [hasSubscriptionPermission, setHasSubscriptionPermission] = useState(false);
    const [changePassword, setChangePassword] = useState(false);
    const [message, setMessage] = useState(null);
    const [runningTimerDuration, setRunningTimerDuration] = useState("");
    const [hasEmployee] = useState(Storage.hasCookieValue(Enums.Cookie.employeeID));
    const [confirmOptions, setConfirmOptions] = useState(helper.initialiseConfirmOptions());

    const [performSetup, setPerformSetup] = useState(false);

    // Password change modal (triggered globally via atom)
    const [passwordChangePrompt, setPasswordChangePrompt] = useAtom(passwordChangePromptAtom)

    const [justCompletedSetup, setJustCompletedSetup] = useAtom(justCompletedSetupAtom)

    const [forceInitialSetup, setForceInitialSetup] = useAtom(forceInitialSetupAtom);

    /*  removing whats new related logic (removed since feedbear)

    const [alertWhatsNew, setAlertWhatsNew] = useAtom(whatsNewBlinkingAttentionModeAtom)
    const [, setUnseenWhatsNewContent] = useAtom(whatsNewContentNotViewedYetAtom)

    const [loading, setLoading] = useState(true);
    const [wnData, setData] = useState<any[]>([])

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
    }, []);

    const {data: generalAuthUserConfig, isSuccess: userConfigLoaded} = useQuery(
        ['globalConfig'],
        () => UserConfigService.getPageFilters(Enums.ConfigurationSection.General, undefined),
        {
            enabled: !!subscriptionInfo && !loading && wnData.length > 0,
            onSuccess: async (data) => {
                if(data) {
                    const latestViewed = UserConfigService.getMetaDataValue(data, generalConfigWhatsNewViewedMetaDataKeyName)

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

                    const firstItem = resolvedData?.find(x => x.sections?.length > 0)?.sections[0]
                    const alertWhatsNew = !latestViewed || (firstItem?.version && latestViewed !== firstItem.version)
                    setAlertWhatsNew(!!alertWhatsNew)

                    /!* set content not viewed yet which is used for popup content rendering *!/

                    const signUpCompletedMoreThanHalfADayAgo = moment().diff(subscriptionInfo?.SignUpCompleteDate, 'hours') > 4

                    // avoid showing whats new popup until the date specified by clicking close or tell me later
                    const doNotDisturb = moment().isBefore(getWhatsNewPopupDoNotDisturbUntilDate())

                    /!* whats new popup *!/
                    if(
                        subscriptionInfo && subscriptionInfo.SetupComplete &&
                        (signUpCompletedMoreThanHalfADayAgo || subscriptionInfo.SignUpCompleteDate === null) &&
                        !doNotDisturb &&
                        (!userAdmin || showPopupForAdmin)
                    ) {
                        if(alertWhatsNew) {
                            const newUpdatesNotSeen = resolvedData.map(x =>
                                ({...x, sections: x.sections.filter(y => y && (!latestViewed || y.version > latestViewed))})
                            ).filter(x => x.sections.length > 0)
                            setUnseenWhatsNewContent(newUpdatesNotSeen)
                        }
                    }
                }
            }
        }
    )

    const generalAuthUserConfigMutation = useMutation(
        ['globalConfig'],
        (config) => UserConfigService.saveConfig(config, undefined),
    )

    const handleUpdateLatesWhatsNewViewed = () => {
        const firstItem = wnData?.find(x => x.sections?.length > 0)?.sections[0]
        if(generalAuthUserConfig && firstItem?.version && (UserConfigService.getMetaDataValue(generalAuthUserConfig, generalConfigWhatsNewViewedMetaDataKeyName) === null || UserConfigService.getMetaDataValue(generalAuthUserConfig, generalConfigWhatsNewViewedMetaDataKeyName) !== firstItem.version)) { // only post if latest version not posted already
            const currentMetaData = JSON.parse(generalAuthUserConfig.MetaData)
            generalAuthUserConfigMutation.mutate({
                ...generalAuthUserConfig,
                MetaData: JSON.stringify({
                    ...currentMetaData,
                    [generalConfigWhatsNewViewedMetaDataKeyName]: firstItem.version
                })
            })
        }
    }

    const [triggerWhatsNewViewed] = useAtom(triggerWhatsNewViewedAtom)
    useDidUpdate(
        () => {
            console.log('whats new view updated')
            setAlertWhatsNew(false)
            handleUpdateLatesWhatsNewViewed()
        }, [triggerWhatsNewViewed]
    )*/

    // subscibe to route changes to display section title and set border active

    const router = useRouter()
    const [title, setTitle] = useState(typeof window !== 'undefined' && getHeadingTitleFormUrl(window.location.href.replace(window.location.origin, '')))
    const image = useMemo(() => {
        if(router?.asPath) {
            return getImageFromUrl(router.asPath) || ''
        } else {
            return ''
        }
    }, [router.asPath])
    const [border, setBorder] = useState(false)

    useEffect(() => {
        // console.log(router.asPath)
        const path = router.asPath
        setBorder(!borderLessPages.some(x => path && path.startsWith(x)))
        setTitle(getHeadingTitleFormUrl(path))
    }, [router.asPath]);

    useEffect(() => {
        // subscribe to routeChangeComplete event
        const routeChangeComplete = (url) => {
            setTitle(getHeadingTitleFormUrl(url))
            setBorder(!borderLessPages.some(x => url && url.startsWith(x)))
        };
        router.events.on('routeChangeComplete', routeChangeComplete);
        // unsubscribe on component destroy in useEffect return function
        return () => {
            router.events.off('routeChangeComplete', routeChangeComplete)
        }
    }, [])

    // Load user data from cookies and update when subscriptionInfo or route changes (indicating user change or fresh login)
    useEffect(() => {
        const _userEmail = Storage.getCookie(Enums.Cookie.servUserName);
        const _userFullName = Storage.getCookie(Enums.Cookie.servFullName);
        const _userCompanyName = Storage.getCookie(Enums.Cookie.servCompanyName);
        const _userAdmin = PS.hasPermission(Enums.PermissionName.MasterOfficeAdmin);
        const _token = Storage.getCookie(Enums.Cookie.token);
        const _isAuthenticated = _token !== undefined && _token !== null;
        const _isOwner = PS.hasPermission(Enums.PermissionName.Owner);
        const _subscription = PS.hasPermission(Enums.PermissionName.Subscriptions);
        const _changePassword = PS.hasPermission(Enums.PermissionName.ChangeMyPassword);
        // Use subscription info from context (already kept up-to-date by _app.jsx) or fall back to cookie
        let _subscriptionInfo = subscriptionContext.subscriptionInfo || Storage.getCookie(Enums.Cookie.subscriptionInfo);

        setUserEmail(_userEmail);
        setUserFullName(_userFullName);
        setUserCompanyName(_userCompanyName);
        setUserAdmin(_userAdmin);
        setIsAuthenticated(_isAuthenticated);
        setIsOwner(_isOwner);
        setChangePassword(_changePassword);
        setHasSubscriptionPermission(_subscription);

        // Update local state from context/cookie - no need to fetch, _app.jsx handles that
        if (_subscriptionInfo) {
            setSubscriptionInfo(_subscriptionInfo);
            /* use 'just completed setup' as additional safety, since the setupComplete prop value could be delayed*/
            setPerformSetup(!!forceInitialSetup || (_subscriptionInfo && !justCompletedSetup && _subscriptionInfo.SetupComplete === false));
        }

    }, [subscriptionContext.subscriptionInfo, router.asPath, forceInitialSetup, justCompletedSetup]);

    const [timerElapsed, setTimerElapsed] = useState(0);

    useEffect(() => {
        if (timerContext.runningTimers && timerContext.runningTimers.length > 0) {
            let timer = timerContext.runningTimers[0];
            setRunningTimerDuration(calcDuration(timer.StartTime, timer.EndTime));
        } else {
            setRunningTimerDuration('00:00:00');
        }

        setTimeout(() => {
            setTimerElapsed(timerElapsed + 1);
        }, 1000);
    }, [timerElapsed]);


    function getStoreNow() {
        return Time.now();
    }

    function calcDuration(start, end) {
        const startDate: any = Time.parseDate(start);
        const endDate: any = end ? Time.parseDate(end) : getStoreNow();
        
        let diffSeconds = Math.abs(endDate - startDate) / 1000;
        return Helper.formatDuration(diffSeconds);
    }

    useEffect(() => {
        if (!subscriptionInfo) {
            return;
        }
        MessageBarHelper.updateMessageBar(subscriptionInfo, messageBarContext);
        /*messageBarContext.setIsActive(true);
        messageBarContext.setMessageBarType(Enums.MessageBarType.Error);
        messageBarContext.setMessage('some message that is an error from api ');*/
    }, [isOwner, hasSubscriptionPermission, subscriptionInfo]);

    const [showMessagePost, setShowMessagePost] = useState(false);
    /*const onMessagePost = (state) => {
        setShowMessagePost(false);
    }*/

    const goToJobCardRunningTimer = () => {
        Helper.nextRouter(Router.push, '/job/' + timerContext.runningTimers[0].JobCardID + '?tab=timers');
        // console.log('navigate to tabs')
    };

    const submitSetup = async (details) => {

        let success = false;

        const result = await Fetch.post({
            url: "/Company/FinalizeSetup",
            params: details,
            toastCtx: toast
        } as any);

        if (result && result.status === 500) {
            // do nothing, something went wrong
            // toast will automatically popup
        }
        else {
            setJustCompletedSetup(true);
            setPerformSetup(false);
            setForceInitialSetup(false);

            let subInfo = await subscriptionContext.getSubscriptionInfo(true);
            setSubscriptionInfo(subInfo);
            success = true;
        }

        return success;
    };

    const settingsRoute = useMemo(() => {
        if (subscriptionInfo) {
            if (subscriptionInfo.AccessStatus === Enums.AccessStatus.LockedWithOutAccess
                && (hasSubscriptionPermission)) {
                return '/settings/subscription/manage';
            } else {
                if (userAdmin) {
                    return '/settings/job/manage';
                } else if (changePassword) {
                    return '/settings/change-password';
                }
            }
        }
        return null;
    }, [subscriptionInfo, hasSubscriptionPermission, userAdmin, changePassword])

    /*const getSettingsRoute = () => {
        if (subscriptionInfo) {
            if (subscriptionInfo.AccessStatus === Enums.AccessStatus.LockedWithOutAccess
                && (hasSubscriptionPermission)) {
                return '/settings/subscription/manage';
            } else {
                if (userAdmin) {
                    return '/settings/job/manage';
                } else if (changePassword) {
                    return '/settings/change-password';
                }
            }
        }

        return null;
    };*/

    /*const goToJobSettings = () => {
        const route = getSettingsRoute();
        if (route) {
            Helper.nextLinkClicked(route);
        }
    };*/


    const helpRef = useRef<HTMLButtonElement>(null);

    const [showHelpPopup, setShowHelpPopup] = useState(false);

    useOutsideClick(helpRef, () => {
        if (showHelpPopup) {
            setShowHelpPopup(false);
        }
    });

    const activateHubspot = () => {
        let elem = document.getElementById("hubspot-messages-iframe-container");
        if (!elem) {

            setConfirmOptions({
                ...helper.initialiseConfirmOptions(),
                display: true,
                showCancel: false,
                showDiscard: false,
                confirmButtonText: "Close",
                heading: "Chat Not There?",
                text: `Sorry, the chat isn't cooperating. Try these:<br/>
                <ul>
                <li>
                Turn off any adblockers for the page
                </li>
                <li>
                Refresh the page or restart your browser
                </li>
                </ul>
    If that doesn't work, shoot us an email at <a href="mailto:support@servcraft.co.za">support@servcraft.co.za</a>, and we will gladly assist`
            });

//             TODO IMPROVE THIS AESTHETIC
//             alert(`Sorry, the chat isn't cooperating. Try these:
//             * Turn off any adblockers for the page
//             * Refresh the page or restart your browser
// If that doesn't work, shoot us an email at support@servcraft.co.za, and we will gladly assist`);
        }
        hubspotContext.setIsActive(true);
    };

    const profileRef = useRef<HTMLDivElement>(null);
    const [showProfilePopup, setShowProfilePopup] = useState(false);

    useOutsideClick(profileRef, () => {
        if (showProfilePopup) {
            setShowProfilePopup(false);
        }
    });

    const mobileView = useMediaQuery('(max-width: 800px)');
    const [mobileSideBarExpanded, setMobileSideBarExpanded] = useState(!props.mobileMenuCollapsed)
    useEffect(() => {
        if(!props.mobileMenuCollapsed !== mobileSideBarExpanded) {
            setMobileSideBarExpanded(!props.mobileMenuCollapsed)
        }
    }, [props.mobileMenuCollapsed]);
    const {ref, width} = useElementSize()
    const hideRunningTimerText = width < 900
    const hideTitle = width < 400;
    const timerIconMode = width < 588;

    return (
        <>
            <nav
                ref={ref}
                className={styles.nav}
                style={
                    {
                        backgroundColor: colors.background,
                        ...(messageBarContext.isActive && {
                            marginTop: Constants.messageBarMargin
                        }),
                        borderBottom: '1px solid ' + (border ? 'lightgrey' : 'transparent'),
                        ...(border && { boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)' })
                    }
                }
            >

                {
                    mobileView &&
                    <Burger size={'sm'} color={'scBlue'} opened={mobileSideBarExpanded} onClick={() => {
                        // setting local state for quicker update when toggling quickly
                        setMobileSideBarExpanded(p => {
                            props.setMobileMenuCollapsed(p)
                            return !p
                        })
                    }} />
                }

                <Box mr={'auto'} style={{cursor: mobileView ? 'pointer' : 'default'}} onClick={() => mobileView && props.setMobileMenuCollapsed(!props.mobileMenuCollapsed)}>
                    <Flex>
                        {
                            hideTitle &&
                            <img src={image} alt={''} height={25} width={25}/> //safe to use img when using svg
                        }
                        {
                            !hideTitle &&
                            <Text size={'xxl'} fw={600}>
                                {title}
                            </Text>
                        }
                    </Flex>
                </Box>

                {
                    customerZone || !isAuthenticated ? <></> :
                        <>
                            {
                                hasEmployee && !(passwordChangePrompt?.open) ? <GlobalSearch navbarwidth={width}/> : ""
                            }

                            {
                                timerContext.runningTimers && timerContext.runningTimers.length > 0 ? (
                                    timerIconMode ? <>
                                        <Tooltip label={timerContext.runningTimers[0]?.JobCardNumber + ' ' + runningTimerDuration} color={'scBlue'}
                                                 events={{ hover: true, focus: true, touch: true }}
                                        >


                                            <ActionIcon
                                                variant={'transparent'}
                                                pos={'relative'}
                                                size={'compact-md'}
                                                onClick={goToJobCardRunningTimer}
                                                style={{
                                                    overflow: 'visible'
                                                }}
                                            >
                                                <AnimatedTimerButtonMobile duration={runningTimerDuration}/>
                                            </ActionIcon>
                                        </Tooltip>
                                        </> :
                                        <>
                                            <span className={styles.coral} onClick={goToJobCardRunningTimer} style={{ minWidth: hideRunningTimerText ? 'auto' : 167, textAlign: 'left' }}>
                                                {!hideRunningTimerText && 'Running timer'} {runningTimerDuration}
                                            </span>
                                        </>
                                    ) : ""
                            }

                            <HelpMenu
                                toggleHelp={props.onToggleHelp}
                                activateHubspot={activateHubspot}
                                initialSetupShown={performSetup}
                                setShowMessagePost={() => {
                                    /*setShowMessagePost*/
                                }}
                                helpOpened={props.helpOpened}
                            />

                            {
                                settingsRoute &&
                                <Link href={settingsRoute}>
                                    <Tooltip label={'Settings'} color={'scBlue.7'}
                                             events={{ hover: true, focus: true, touch: true }}
                                    >
                                        <ActionIcon
                                            mt={2}
                                            onClick={() => {
                                                Helper.nextLinkClicked(settingsRoute);
                                            }}
                                            variant={'transparent'}
                                            color={'gray.9'}
                                        >
                                            <IconSettings />
                                        </ActionIcon>
                                    </Tooltip>
                                </Link>
                            }

                            <Box className={styles.verticalPipe} style={(t) => ({
                                borderLeft: `1px solid var(--mantine-color-gray-2)`
                            })} />

                            <Box pr={'md'}>
                                <ProfileMenu email={userEmail} companyName={userCompanyName} fullName={userFullName} isOwner={hasSubscriptionPermission}
                                             /*
                                             showWhatsNewAlert={alertWhatsNew}
                                             setShowWhatsNewAlert={(x) => {
                                                 setAlertWhatsNew(x)
                                                 handleUpdateLatesWhatsNewViewed()
                                             }}*/
                                />
                            </Box>

                        </>
                }

                {message && !customerZone ?
                    <Message message={message} setMessage={setMessage} /> : ''
                }

            </nav>

            {
                performSetup && subscriptionInfo ?
                    <InitialSetup onConfirm={submitSetup} setVisible={(val) => {
                        setPerformSetup(val);
                        if(!val) setForceInitialSetup(false);
                    }} subscriptionInfo={subscriptionInfo} />
                    : ""
            }

            {
                isAuthenticated && !performSetup && !justCompletedSetup && passwordChangePrompt?.open && (
                    <ChangeEmployeePassword
                        employeeID={Storage.getCookie(Enums.Cookie.employeeID)}
                        isOpen={true}
                        setIsOpen={(val) => setPasswordChangePrompt(p => ({ ...p, open: val }))}
                        userwords={(() => {
                            const local = (userEmail || '').split('@')[0];
                            return [userEmail, local].filter(Boolean) as any;
                        })()}
                        title={passwordChangePrompt.title}
                        message={passwordChangePrompt.message}
                        // enforced
                    />
                )
            }

            {/*{showMessagePost && !customerZone ?
                <MessagePost
                    onMessagePost={onMessagePost}
                    module={Enums.Module.Customer}
                    customerZone={false}
                    userName={userFullName}
                    commentType={Enums.CommentType.Help}
                    itemID={undefined}
                /> : ''
            }*/}
            {
                /*mobileView &&
                <Drawer
                    opened={showMobileMenu}
                    onClose={() => {setShowMobileMenu(false)}}
                    pos={'relative'}
                    offset={80}
                    mt={60}
                    overlayProps={{opacity: 0}}
                >
                    test
                </Drawer>*/
            }

            <ConfirmAction
            options={confirmOptions}
            setOptions={setConfirmOptions}
            />

        </>
    )
}

export default ScNavbar;
