import React, { useEffect, useContext, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import Toast from '@/components/toast';
import ToastContext from '@/utils/toast-context';
import SCSidebarResponsive from '@/components/sc-controls/layout/sc-sidebar-responsive';
import SCMobileHeader from '@/components/sc-controls/layout/sc-mobile-header';
import ScContainerResponsive from '@/components/sc-controls/layout/sc-container-responsive';
import SCMessageBarContext from '@/utils/contexts/sc-message-bar-context';
import Storage from '@/utils/storage';
import * as Enums from '@/utils/enums';
import MobileViewAlert from '@/components/modals/access/mobile-view-alert';
import SubscriptionContext from '@/utils/subscription-context';
import ScNavbar, {borderLessPages} from "@/PageComponents/Layout/Navbar/ScNavbar";
import {AppShell, Box, Flex} from "@mantine/core";
import {useDisclosure, useMediaQuery, useWindowEvent} from "@mantine/hooks";
import LearningHub from "@/PageComponents/Learning Hub/LearningHub";
import styles from './Layout.module.css'
import SidebarItems from "@/components/sc-controls/layout/SidebarItems";
// import WhatsNewPopup from "@/PageComponents/Dashboard/WhatsNew/WhatsNewPopup";
import constants from "@/utils/constants";

const lsSidebarWidthVarName = 'hcWidth';

const getLsWidth = () => {
    try {
        if(localStorage && localStorage.getItem(lsSidebarWidthVarName)) {
            const ls = localStorage.getItem(lsSidebarWidthVarName)
            return !!ls && +ls || 500
        } else {
            return 500
        }
    } catch (e) {
        return 500
    }
}

function Layout(props) {

    const [helpOpened, { toggle: toggleHelp, open: openHelp }] = useDisclosure(false);
    const [helpWidth, setHelpWidth] = useState(getLsWidth())

    const [dragging, setDragging] = useState(false)

    const handleResize = (e) => {
        if (dragging) {
            setHelpWidth(p => {
                const newW = +p - e.movementX;
                // (newW > 600 || newW < 350) && setDragging(false)
                return (newW > 700 ? 700 : newW < 350 ? 350 : newW)
            })
        }
    }
    useWindowEvent('mousemove', handleResize)

    const stopDraggingHandler = () => {
        setDragging(false)
        if(dragging) {
            if(helpWidth < 350) {
                setHelpWidth(350)
                localStorage && localStorage.setItem(lsSidebarWidthVarName, '350')
            } else if(helpWidth > 700) {
                setHelpWidth(700)
                localStorage && localStorage.setItem(lsSidebarWidthVarName, '700')
            } else {
                localStorage && localStorage.setItem(lsSidebarWidthVarName, helpWidth + '')
            }
        }
    }
    useWindowEvent('mouseup', stopDraggingHandler)

    const subscriptionContext = useContext<any>(SubscriptionContext);
    const messageBarContext = useContext<any>(SCMessageBarContext);
    const toast = useContext<any>(ToastContext);
    const mobileView = useMediaQuery('(max-width: 800px)');
    const [mobileMenuCollapsed, setMobileMenuCollapsed] = useState(true)
    useEffect(() => {
        if(mobileView && !mobileMenuCollapsed) {
            setMobileMenuCollapsed(true)
        }
    }, [mobileView]);

    const [setupComplete, setSetupComplete] = useState(false);

    const router = useRouter();
    const containerRef = useRef<HTMLDivElement>(null);

    // Derive current path from router to avoid reliance on external props
    const normalizePath = (path: string) => {
        if (!path) return '';
        const noQuery = path.split('?')[0].split('#')[0];
        return noQuery !== '/' && noQuery.endsWith('/') ? noQuery.slice(0, -1) : noQuery;
    };

    const rawPath = router.asPath || '';
    const currentPath = normalizePath(rawPath);
    const currentPathLower = currentPath.toLowerCase();

    const excludedPaths = ['/login', '/reset-password', '/verify', '/complete-signup', '/activate', '/debit-order', '/customerzone/signature', '/tenantzone/signature', '/settings/subscription/peach'];
    const excludedPathPrefixes = [
        '/webform'
    ];

    const excludedPathSetLower = new Set(excludedPaths.map(p => normalizePath(p).toLowerCase()));
    const exclude = excludedPathPrefixes.some(p => currentPathLower.startsWith(p));

    const customerZone = currentPathLower.indexOf('/customerzone') > -1;


    const [navHasShadow, setNavHasShadow] = useState(false)

    useEffect(() => {
        // if navbar has shadow (legacy pages) then aside side-menu has different styling
        const path = router.asPath
        setNavHasShadow(!borderLessPages.some(x => path && path.startsWith(x)))

        // reset scroll to very top on every route change
        if (containerRef.current) {
            containerRef.current.scroll(0, 0);
        }

        if (router.asPath && !router.asPath.toLowerCase().includes("/customerzone/")) {
            let subscriptionInfo = Storage.getCookie(Enums.Cookie.subscriptionInfo);
            setSetupComplete(subscriptionInfo && subscriptionInfo.SetupComplete);
            setMobileViewDismissed(Storage.getCookie(Enums.Cookie.mobileViewAlertDismissed) === "true");
        }

    }, [router.asPath]);

    useEffect(() => {
        if (router.asPath && !router.asPath.toLowerCase().includes("/customerzone/")) {
            let subscriptionInfo = Storage.getCookie(Enums.Cookie.subscriptionInfo);
            setSetupComplete(subscriptionInfo && subscriptionInfo.SetupComplete);
            setMobileViewDismissed(Storage.getCookie(Enums.Cookie.mobileViewAlertDismissed) === "true");
        }
    }, [subscriptionContext?.subscriptionInfo]);

    const [mobileViewDismissed, setMobileViewDismissed] = useState(Storage.getCookie(Enums.Cookie.mobileViewAlertDismissed) === "true");

    const dismissMobileViewAlert = () => {
        Storage.setCookie(Enums.Cookie.mobileViewAlertDismissed, "true");
        setMobileViewDismissed(true);
    };


    const [sideBarState, setSideBarState] = useState<'expanded' | 'collapsed'>(props.servSidebarState ?? 'expanded')
    const sidebarExpandedWidth = "180px";
    const sidebarCollapsedWidth = "60px";

    // NB: components can only return after hooks not before
    // Hide layout (no navbar/sidebar) on specific routes and prefixes
    if (excludedPathSetLower.has(currentPathLower) || exclude) {
        return (props.children);
    }
    return <AppShell
        layout={mobileView ? "alt" : 'alt'}
        header={{
            height: messageBarContext.isActive === true ? 88 : customerZone ? (!mobileView ? 1 : 50) : 40,
            offset: true
        }}
        // footer={{ height: 60 }}
        styles={{
            navbar: {transition: 'width 100ms ease-out'},
            aside: {
                maxWidth: `calc(100vw - ${sideBarState === 'expanded' ? 210 : 90}px)`,
                minWidth: 350,
                // marginTop: '-50px'
            },
            header: {
                width: mobileView ? '100vw' : `calc(100% - ${sideBarState === 'expanded' ? sidebarExpandedWidth : sidebarCollapsedWidth})`
            }
        }}
        navbar={{
            width: customerZone ? (!mobileView ? 200 : 1) : !mobileView ? (sideBarState === 'expanded' ? sidebarExpandedWidth : sidebarCollapsedWidth) : 200,
            ...(customerZone ? {} : {breakpoint: 800}) as any,
            collapsed: {mobile: mobileMenuCollapsed, desktop: mobileView ? mobileMenuCollapsed : false},
        }}
        aside={{
            width: helpWidth,
            breakpoint: 800,
            collapsed: {mobile: !helpOpened, desktop: !helpOpened},
        }}
        // padding="md"
    >
        <AppShell.Header style={{zIndex: 103}}>
            {
                customerZone ? (mobileView ? <SCMobileHeader customerZone={customerZone}/> : <></>) :
                    <ScNavbar customerZone={customerZone} onToggleHelp={toggleHelp} helpOpened={helpOpened}
                              setMobileMenuCollapsed={setMobileMenuCollapsed}
                              mobileMenuCollapsed={mobileMenuCollapsed}/>
            }
        </AppShell.Header>
        <AppShell.Navbar
            style={{zIndex: 102, maxWidth: '180px'}}
        >
            {/*{
                Array(15)
                .fill(0)
                .map((_, index) => (
                    <Skeleton key={index} h={28} mt="sm" animate={false} />
                ))
            }*/}
            {
                !customerZone && mobileView ?
                    <SidebarItems servSidebarState={sideBarState} customerZone={false}
                                  setMenuCollapsed={setMobileMenuCollapsed}/> :
                    <SCSidebarResponsive servSidebarState={sideBarState} customerZone={customerZone}
                                         onToggleExpanded={setSideBarState}/>
            }
        </AppShell.Navbar>
        <AppShell.Main style={{userSelect: dragging ? 'none' : 'auto'}}
                       onClick={() => {
                           if (mobileView && !mobileMenuCollapsed) {
                               setMobileMenuCollapsed(true)
                           }
                       }}
        >
            <Toast toast={toast.toast} setToast={toast.setToast}/>
            {
                customerZone ?
                    <>
                        <ScContainerResponsive
                            // children={props.children}
                            //  ref={containerRef} // doesn't work
                        >
                            {props.children}
                        </ScContainerResponsive>
                    </> :
                    <>
                        {/*<SCNav customerZone={customerZone} mobileView={mobileView} />*/}
                        {/*<ScNavbar customerZone={customerZone} mobileView={mobileView}/>*/}
                        <div style={{overflow: 'clip'}} ref={containerRef}>
                            {props.children}

                        </div>

                        {/*<WhatsNewPopup />*/}


                        {
                            mobileView && setupComplete && !mobileViewDismissed && <>
                                <MobileViewAlert onDismiss={dismissMobileViewAlert}/>
                            </>
                        }
                    </>
            }

            <AppShell.Aside mt={messageBarContext.isActive ? 90 : 45} style={helpOpened && navHasShadow ? {
                boxShadow: '0 5px 2px 3px lightgrey'
            } : helpOpened && !navHasShadow ? {borderTop: '1px solid lightgrey'} : {}}
            >
                <Flex h={`calc(100vh - ${messageBarContext.isActive ? 45 : 0}px)`} w={'100%'} align={'stretch'}>
                    <Box className={styles.sideBarDrag + (dragging ? (' ' + styles.sideBarDragActive) : '')}
                         onMouseDown={() => setDragging(true)}/>
                    <Box style={{flexGrow: 1}}>
                        <LearningHub toggleHelp={toggleHelp} openHelp={openHelp} helpOpened={helpOpened} isDragging={dragging}/>
                    </Box>
                </Flex>
            </AppShell.Aside>
        </AppShell.Main>
    </AppShell>;

    /*<div className="layout">
        <SCSidebarResponsive servSidebarState={props.servSidebarState} customerZone={customerZone}/>

        <div className="column">
            {
                customerZone ?
                    <>
                        {mobileView ? <SCMobileHeader customerZone={customerZone} /> : <></>}
                        <ScContainerResponsive
                            // children={props.children}
                            //  ref={containerRef} // doesn't work
                        >
                            {props.children}
                        </ScContainerResponsive>
                    </> :
                    <>
                        {/!*<SCNav customerZone={customerZone} mobileView={mobileView} />*!/}
                        <ScNavbar customerZone={customerZone} mobileView={mobileView} />
                        <div ref={containerRef}>
                            {props.children}
                        </div>

                        {mobileView && setupComplete && !mobileViewDismissed ? <>
                            <MobileViewAlert onDismiss={dismissMobileViewAlert} />
                        </> : ""}
                    </>
            }
        </div>

        <Toast toast={toast.toast} setToast={toast.setToast}/>

    </div>*/
}

export default Layout;
