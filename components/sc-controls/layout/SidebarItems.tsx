import { colors, fontSizes } from "../../../theme";
import { useContext, useState, useEffect, useRef } from "react";
import PageContext from "../../../utils/page-context";
import Router from 'next/router';
import Helper from "../../../utils/helper";
import SubscriptionContext from "../../../utils/subscription-context";
import * as Enums from '../../../utils/enums';
import Constants from "../../../utils/constants";
import Link from 'next/link';
import PS from "../../../services/permission/permission-service";
import Storage from "../../../utils/storage";
import NoSSR from "../../../utils/no-ssr";
import SCMessageBarContext from '../../../utils/contexts/sc-message-bar-context';
import {IconMessage2} from "@tabler/icons";
import {Flex, Text} from "@mantine/core";
import featureService from "@/services/feature/feature-service";
import {allowBulkMessageForEveryone, bulkMessageWhiteList} from "@/pages/message/list";
import storage from "../../../utils/storage";
import {useQuery} from "@tanstack/react-query";
import constants from "@/utils/constants";
import BetaText from "@/PageComponents/Premium/BetaText";

const tenantID = storage.getCookie(Enums.Cookie.tenantID);

export default function SidebarItems({ customerZone, servSidebarState, setMenuCollapsed }) {

    const subscriptionContext = useContext<any>(SubscriptionContext);
    const messageBarContext = useContext<any>(SCMessageBarContext);
    const pageContext = useContext<any>(PageContext);

    const [currPath, setCurrPath] = useState<any>("");
    const [queryString, setQueryString] = useState<any>("");
    const [onceOffEvent, setOnceOffEvent] = useState<any>(undefined);



    const sidebarExpandedWidth = "180px";
    const sidebarCollapsedWidth = "60px";
    const footerHeight = "62px";
    const sidebarLinkRef = useRef<HTMLDivElement>(null);


    const [sectionTableFeatureEnabled, setSectionTableFeatureEnabled] = useState(false)
    useEffect(() => {
        featureService.getFeature(Constants.features.INVENTORY_SECTION_BUNDLE).then(feature => {
            setSectionTableFeatureEnabled(!!feature);
        })
    }, [])

    const {data: stockTakeFeatureEnabled} = useQuery(['hasStockTake'], () => featureService.getFeature(constants.features.STOCK_TAKE))

    // const { data: kendoSchedulerFeature } = useQuery(['feature', 'SCHEDULER_KENDO'], () => featureService.getFeature(constants.features.SCHEDULER_KENDO));
    // const appointmentRoute = !kendoSchedulerFeature ? '/appointment/scheduler' : '/appointment'
    const appointmentRoute = '/appointment';


    const getSidebarLinkTopPosition = () => {
        if (sidebarLinkRef && sidebarLinkRef.current) {
            return `${sidebarLinkRef.current.getBoundingClientRect().y}px`;
        }
        return "0px";
    };

    const sidebarStates = {
        expanded: 'expanded',
        collapsed: 'collapsed'
    };

    // const [sidebarState, setSidebarState] = useState(servSidebarState || sidebarStates.expanded);

    const [permissions, setPermissions] = useState<any>({});

    const isAuthenticated = Storage.hasCookieValue(Enums.Cookie.token);
    const hasEmployee = Storage.hasCookieValue(Enums.Cookie.employeeID);
    const hideLinks = !isAuthenticated && !customerZone;

    useEffect(() => {
        // Normalize a URL to just its pathname (strip query/hash)
        const normalizePath = (path: string) => {
            if (!path) return "";
            const q = path.indexOf("?");
            const h = path.indexOf("#");
            let end = path.length;
            if (q > -1) end = Math.min(end, q);
            if (h > -1) end = Math.min(end, h);
            return path.substring(0, end);
        };

        const updateFromAsPath = (asPath: string) => {
            const newPath = normalizePath(asPath);
            setCurrPath(newPath);

            // Preserve minimal query string for customer zone navigation if needed
            const idxQryStr = asPath.indexOf("?");
            if (idxQryStr > -1) {
                let qs = asPath.substr(idxQryStr);
                const qsObj = Helper.queryStringToObject(qs);
                if (qsObj.t && qsObj.c) {
                    qs = `?${Helper.objectToQueryString({
                        t: qsObj.t,
                        c: qsObj.c
                    })}`;
                }
                setQueryString(qs);
            } else {
                setQueryString("");
            }
        };

        if (!servSidebarState) {
            Storage.setCookie(Enums.Cookie.servSidebarState, "expanded", 21);
        }

        // Initial set from current router state
        if (Router && Router.router && Router.router.asPath) {
            updateFromAsPath(Router.router.asPath);
        }

        // Subscribe to route changes to keep currPath in sync on client-side navigation
        const handleRouteChange = (url: string) => {
            updateFromAsPath(url);
        };
        Router.events.on('routeChangeComplete', handleRouteChange);

        setOnceOffEvent(true);

        return () => {
            Router.events.off('routeChangeComplete', handleRouteChange);
        };

    }, []);



    useEffect(() => {
        setupOnceOffEvent();
    }, [onceOffEvent, subscriptionContext.subscriptionInfo]);

    const setupOnceOffEvent = async () => {


        let subscriptionInfo = subscriptionContext.subscriptionInfo;
        // Removed fetching default appointment page; manage links directly via feature flag

        let updatePerms: any = {
            ...permissions,
            Job: PS.hasPermission(Enums.PermissionName.Job),
            Query: PS.hasPermission(Enums.PermissionName.Query),
            Quote: PS.hasPermission(Enums.PermissionName.Quote),
            Invoice: PS.hasPermission(Enums.PermissionName.Invoice),
            PurchaseOrder: PS.hasPermission(Enums.PermissionName.PurchaseOrder),
            Appointment: PS.hasPermission(Enums.PermissionName.Appointment),
            Product: PS.hasPermission(Enums.PermissionName.Product),
            Customer: PS.hasPermission(Enums.PermissionName.Customer),
            Inventory: PS.hasPermission(Enums.PermissionName.Inventory),
            Message: PS.hasPermission(Enums.PermissionName.Message),
            Reports: PS.hasPermission(Enums.PermissionName.Reports),
            MasterOfficeAdmin: PS.hasPermission(Enums.PermissionName.MasterOfficeAdmin),
            Subscriptions: PS.hasPermission(Enums.PermissionName.Subscriptions),
            UserManagement: PS.hasPermission(Enums.PermissionName.UserManagement),
            ChangeMyPassword: PS.hasPermission(Enums.PermissionName.ChangeMyPassword),
            Project: PS.hasPermission(Enums.PermissionName.Project),
            RecurringJob: PS.hasPermission(Enums.PermissionName.RecurringJob),
            EditCompany: PS.hasPermission(Enums.PermissionName.EditCompany, true),
            StockTake: PS.hasPermission(Enums.PermissionName.StockTake) || PS.hasPermission(Enums.PermissionName.StockTakeManager)
        };

        if (subscriptionInfo && subscriptionInfo.AccessStatus === Enums.AccessStatus.LockedWithOutAccess) {
            updatePerms = {
                ChangeMyPassword: updatePerms.ChangeMyPassword,
                Subscriptions: updatePerms.Subscriptions,
                UserManagement: updatePerms.UserManagement
            };
        }

        setPermissions(updatePerms);
    };

    const onItemClicked = (link) => {
        setMenuCollapsed && setMenuCollapsed(true)
        Helper.nextLinkClicked(link)
        Helper.mixpanelTrack(Constants.mixPanelEvents.sidebarNavigate, {
            page: link,
            module: link === '/' ? 'dashboard' : link.split('/')[1]
        } as any)
    }


    const footer = () => {
        const fullYear = new Date().getFullYear();
        return (
            <>
                <div className="sidebar-footer-container">
                    <div className="text">
                        {`© ${fullYear}`}
                    </div>
                </div>
                {/*<style jsx>{`
                  .sidebar-footer-container {
                    display: flex;
                    flex-direction: column;
                    text-align: center;
                    position: fixed;
                    bottom: 0;
                    width: ${sidebarState === sidebarStates.expanded ? sidebarExpandedWidth : sidebarCollapsedWidth};
                    transition: all 0.4s ease-out;
                    z-index: 1;
                    padding: 1rem 0;
                    background-color: ${colors.bluePrimary};
                    box-sizing: border-box;
                    overflow: hidden;
                    height: ${footerHeight};
                  }

                  hr {
                    width: ${sidebarState === sidebarStates.expanded ? '129' : '35'}px;
                  }

                  .text {
                    font-size: 11px;
                    color: ${colors.sidebarColor};
                  }

                  .heart {
                    color: red;
                  }
                `}</style>*/}
            </>
        )
    };
    const desktopContainer = () => {

        const isLinkCurrent = ({equals, startsWith}: any) => {

            const path = currPath || "";

            if (path.indexOf("/settings/") > -1) {
                return false;
            }

            let result = false;
            if (Array.isArray(equals)) {
                result = equals.some((x) => x === path);
            } else if (Array.isArray(startsWith)) {
                // Uses "contains" semantics as originally implemented
                result = startsWith.some((x) => path.indexOf(x) > -1);
            }

            return result;
        };

        return (
            <NoSSR>
                <div className={"sidebar expanded"}>
                    {hideLinks ? <></> : <>

                        {/*<div className="logo">
                            <Link legacyBehavior={true} href={"/"}>
                                <a className="logo-big"
                                   onClick={
                                       () => {
                                           Helper.nextLinkClicked(customerZone ? "/customerzone" + queryString : "/")
                                       }
                                   }
                                ><img src="/logo-type-white.svg" alt="ServCraft"/></a>
                            </Link>
                            <Link legacyBehavior={true} href={"/"}>
                                <a className="logo-small"
                                   onClick={
                                       () => {
                                           Helper.nextLinkClicked(customerZone ? "/customerzone" + queryString : "/")
                                       }
                                   }
                                ><img src="/logo-white.svg" alt="ServCraft"/></a>
                            </Link>
                        </div>*/}

                        <div ref={sidebarLinkRef} className="sidebar-link-container">

                            <Link legacyBehavior={true} href="/">
                                <a className={`link ${isLinkCurrent({equals: ['/']}) ? "current" : ""}`}
                                   onClick={
                                       () => {
                                           onItemClicked("/")
                                       }
                                   }
                                >
                                    <img
                                        src={`/sc-icons/dashboard-${isLinkCurrent({equals: ['/']}) ? "light" : "blue"}.svg`}
                                        alt="Dashboard"
                                    />
                                    <p>Dashboard</p>
                                </a>
                            </Link>

                            {(permissions.Job || permissions.RecurringJob || permissions.Project) && hasEmployee ? <>
                                <Link
                                    style={{textDecoration: 'none'}}
                                    href="/job/list"
                                >
                                    <span className={`link ${
                                        isLinkCurrent({startsWith: ["/job/", "/job-schedule/", "/project/"]})
                                            ? "current" : ""
                                    }`}

                                          onClick={
                                              () => {
                                                  onItemClicked("/job/list")
                                              }
                                          }
                                    >
                                        <img
                                            src={`/sc-icons/jobs-${isLinkCurrent({startsWith: ["/job/", "/job-schedule/", "/project/"]}) ? "light" : "blue"}.svg`}
                                            alt="Jobs"
                                        />
                                        <p>Jobs</p>
                                    </span>
                                </Link>
                            </> : ""}

                            {permissions.Appointment && hasEmployee ? <>
                                <Link legacyBehavior={true} href={appointmentRoute}>
                                    <a className={`link ${isLinkCurrent({equals: [appointmentRoute]}) ? "current" : ""}`}
                                       onClick={
                                           () => {
                                               onItemClicked(appointmentRoute)
                                           }
                                       }
                                    >
                                        <img
                                            src={`/sc-icons/appointments-${isLinkCurrent({equals: [appointmentRoute]}) ? "light" : "blue"}.svg`}
                                            alt="Appointments"
                                        />
                                        <p>Appointments</p>
                                    </a>
                                </Link>
                            </> : ""}

                            {permissions.Query && hasEmployee ? <>
                                <Link
                                    style={{textDecoration: 'none'}}
                                    href={"/query/list"}
                                >
                                    <span
                                        className={`link ${isLinkCurrent({startsWith: ["/query/"]}) ? "current" : ""}`}

                                        onClick={
                                            () => {
                                                onItemClicked("/query/list")
                                            }
                                        }
                                    >
                                        <img
                                            src={`/sc-icons/queries-${isLinkCurrent({startsWith: ["/query/"]}) ? "light" : "blue"}.svg`}
                                            alt="Queries"
                                        />
                                        <p>Queries</p>
                                    </span>
                                </Link>
                            </> : ""}

                            {permissions.Quote && hasEmployee ? <>
                                <Link
                                    style={{textDecoration: 'none'}}
                                    href={"/quote/list"}
                                >
                                    <span
                                        className={`link ${isLinkCurrent({startsWith: ["/quote/"]}) ? "current" : ""}`}

                                        onClick={
                                            () => {
                                                onItemClicked("/quote/list")
                                            }
                                        }
                                    >
                                        <img
                                            src={`/sc-icons/quotes-${isLinkCurrent({startsWith: ["/quote/"]}) ? "light" : "blue"}.svg`}
                                            alt="Quotes"
                                        />
                                        <p>Quotes</p>
                                    </span>
                                </Link>
                            </> : ""}

                            {permissions.Invoice && hasEmployee ? <>
                                <Link
                                    style={{textDecoration: 'none'}}
                                    href={"/invoice/list"}
                                >
                                    <span
                                        className={`link ${isLinkCurrent({startsWith: ["/invoice/"]}) ? "current" : ""}`}

                                        onClick={
                                            () => {
                                                onItemClicked("/invoice/list")
                                            }
                                        }
                                    >
                                        <img
                                            src={`/sc-icons/invoices-${isLinkCurrent({startsWith: ["/invoice/"]}) ? "light" : "blue"}.svg`}
                                            alt="Invoices"
                                        />
                                        <p>Invoices</p>
                                    </span>
                                </Link>
                            </> : ""}

                            {permissions.PurchaseOrder && hasEmployee ? <>
                                <Link
                                    style={{textDecoration: 'none'}}
                                    href={"/purchase/list"}
                                >
                                    <span
                                        className={`link ${isLinkCurrent({startsWith: ["/purchase/"]}) ? "current" : ""}`}

                                        onClick={
                                            () => {
                                                onItemClicked("/purchase/list")
                                            }
                                        }
                                    >
                                        <img
                                            src={`/sc-icons/purchases-${isLinkCurrent({startsWith: ["/purchase/"]}) ? "light" : "blue"}.svg`}
                                            alt="Purchases"
                                        />
                                        <p>Purchases</p>
                                    </span>
                                </Link>
                            </> : ""}

                            {(permissions.Customer || permissions.Product) && hasEmployee ? <>
                                <Link
                                    style={{textDecoration: 'none'}}
                                    href={"/customer/list"}
                                >
                                    <span className={`link ${
                                        isLinkCurrent({startsWith: ["/customer/", "/asset/"]})
                                            ? "current" : ""}`}

                                          onClick={
                                              () => {
                                                  onItemClicked("/customer/list")
                                              }
                                          }
                                    >
                                        <img
                                            src={`/sc-icons/customers-${isLinkCurrent({startsWith: ["/customer/", "/asset/"]}) ? "light" : "blue"}.svg`}
                                            alt="Customers"
                                        />
                                        <p>Customers</p>
                                    </span>
                                </Link>
                            </> : ''}

                            {permissions.Inventory && hasEmployee ? <>
                                <Link
                                    style={{textDecoration: 'none'}}
                                    href={"/inventory/list"}
                                >
                                    <span className={`link ${
                                        isLinkCurrent({startsWith: ["/inventory/", "/inventory-category/", "/inventory-subcategory/", "/supplier/", "/bundle/"]})
                                            ? "current" : ""}`}

                                          onClick={
                                              () => {
                                                  onItemClicked("/inventory/list")
                                              }
                                          }
                                    >
                                        <img
                                            src={`/sc-icons/inventory-${isLinkCurrent({startsWith: ["/inventory/", "/inventory-category/", "/inventory-subcategory/", "/supplier/"]}) ? "light" : "blue"}.svg`}
                                            alt="Inventory"
                                        />
                                        <p style={{position: 'relative'}}>
                                            Inventory
                                        </p>
                                        {
                                            sectionTableFeatureEnabled && <Flex style={{position: 'relative', left: 3, bottom: 4}} align={'center'} gap={1}>{/*<IconCrown color={'goldenrod'} size={14} /> */}<Text c={'goldenrod'} size={'7px'} fw={800}>NEW</Text></Flex>
                                        }
                                    </span>
                                </Link>
                            </> : ""}

                            {stockTakeFeatureEnabled && permissions.StockTake && hasEmployee ? <>
                                <Link
                                    style={{textDecoration: 'none'}}
                                    href={"/stock-take/list"}
                                >
                                    <span className={`link ${
                                        isLinkCurrent({startsWith: ["stock-take"]})
                                            ? "current" : ""}`}
                                          onClick={
                                              () => {
                                                  onItemClicked("/stock-take/list")
                                              }
                                          }
                                    >
                                        <img
                                            src={`/sc-icons/inventory-${isLinkCurrent({startsWith: ["stock-take"]}) ? "light" : "blue"}.svg`}
                                            alt="Inventory"
                                        />
                                        <p style={{position: 'relative'}}>
                                            Stock Take
                                        </p>
                                        <BetaText c={'violet.1'} left={2}/>
                                    </span>
                                </Link>
                            </> : ""}

                            {permissions.Reports && hasEmployee ? <>
                                <Link
                                    style={{textDecoration: 'none'}}
                                    href={'/report/list'}
                                >
                                    <span
                                        className={`link ${isLinkCurrent({equals: ["/report/list"]}) ? "current" : ""}`}

                                        onClick={
                                            () => {
                                                onItemClicked("/report/list")
                                            }
                                        }
                                        // onClick={() => Helper.nextRouter(Router.push, "/report/list")}
                                    >
                                        <img
                                            src={`/sc-icons/reports-${isLinkCurrent({equals: ["/report/list"]}) ? "light" : "blue"}.svg`}
                                            alt="Reports"
                                        />
                                        <p>Reports</p>
                                    </span>
                                </Link>
                            </> : ""}

                            {permissions.Message ? <>
                                <Link
                                    style={{textDecoration: 'none'}}
                                    href={'/message/list'}
                                >
                                    <span
                                        className={`link ${isLinkCurrent({startsWith: ["/message/"]}) ? "current" : ""}`}

                                        onClick={
                                            () => {
                                                onItemClicked("/report/list")
                                            }
                                        }
                                        // onClick={() => Helper.nextRouter(Router.push, "/report/list")}
                                    >
                                        <span style={{
                                            color: isLinkCurrent({equals: ["/message/list"]}) ? colors.white : colors.sidebarColor,
                                            fontSize: fontSizes.link,
                                            fontWeight: 'bold',
                                            // margin-left: '1rem';
                                            opacity: 1,
                                            // transition: '0.4s ease-out',
                                        }}>
                                            <IconMessage2 />
                                        </span>
                                        {/*<img
                                            src={`/sc-icons/landscape-${isLinkCurrent({equals: ["/message/list"]}) ? "light" : "dark"}.svg`}
                                            alt=""
                                            title={sidebarState === sidebarStates.collapsed ? 'Messages' : ''}/>*/}
                                        <p>Messages</p>
                                    </span>
                                </Link>
                            </> : ""}

                        </div>
                    </>}

                    {/*{expando()}*/}

                    {/* {!isChrome ? <>
                <br /><br /><br />
                <span className="browser-change-message">
                Best viewed on Chrome
                </span>
            </> : ""} */}

                    {footer()}

                </div>

                <style jsx>{`
                  .sidebar {
                    background-color: ${colors.bluePrimary};
                    box-sizing: border-box;
                    flex-shrink: 0;
                    ${messageBarContext.isActive ? `height: calc(100vh - ${Constants.messageBarMargin}px);` : "height: 100vh;"}

                    padding: 5.5rem 0 4rem;
                    position: relative;
                    //transition: width 0.4s ease-out;
                    //width: ${sidebarExpandedWidth};

                    ${messageBarContext.isActive ? `margin-top:${Constants.messageBarMargin}px;` : ""} /*BROWER COMPAT*/ -ms-overflow-style: none;
                    //scrollbar-width: none;
                  }

                  .logo {
                    background-color: ${colors.bluePrimary};
                    box-sizing: border-box;
                    height: 45px;
                    left: 0;
                    padding: 0.8rem 1.3rem;
                    position: fixed;
                    top: 0;
                    transition: width 0.4s ease-out;
                    /*width: 200px;*/
                    z-index: 1;
                    ${messageBarContext.isActive ? `margin-top:${Constants.messageBarMargin}px;` : ""}
                  }

                  .logo-big {
                    opacity: 1;
                    position: absolute;
                    transition: opacity 0.2s ease-in-out;
                    transition-delay: 0.2s;
                  }

                  .logo-big img {
                    width: 107px;
                  }

                  .logo-small {
                    opacity: 0;
                    padding-top: 4px;
                    position: absolute;
                    transition: opacity 0.8s ease-in-out;
                    transition-delay: 0.2s;
                    z-index: -1;
                  }

                  .logo-small img {
                    width: 19px;
                  }

                  .link {
                    align-items: center;
                    cursor: pointer;
                    display: flex;
                    height: 3rem;
                    margin-left: 0.5rem;
                    padding-left: 0.5rem;
                    margin-right: .7rem;
                    width: auto;
                    text-decoration: none;
                    transition: padding 0.4s ease-out;
                    //width: calc(100% - 1.5rem);
                    border-radius: 6px;
                  }

                  .link:hover {
                    background-color: ${colors.sidebarHoverBackground};
                  }

                  .current {
                    background-color: ${colors.sidebarHoverBackground};
                  }

                  .link p {
                    color: ${colors.sidebarColor};
                    font-size: ${fontSizes.link};
                    font-weight: bold;
                    margin-left: 1rem;
                    opacity: 1;
                    transition: all 0.4s ease-out;
                    white-space: nowrap;
                  }


                  .link:hover p,span, .current p,span {
                    color: ${colors.white};
                  }


                  ul {
                    padding: 0;
                    margin: 0;
                  }

                  ul li {
                    display: block;
                    height: 0;
                    overflow: hidden;
                    transition: height 0.4s ease-out, padding 0.4s ease-out;
                  }

                  ul li:first-child {
                    display: flex;
                    height: 3rem;
                  }

                  ul li a.link p {
                    font-weight: normal;
                  }

                  ul li:first-child a.link p {
                    font-weight: bold;
                  }

                  .open li {
                    height: 3rem;
                  }

                  .spacer {
                    height: 1.5rem;
                    width: 1.5rem;
                  }

                  .chevron {
                    margin-left: auto;
                    margin-right: 0.5rem;
                    opacity: 1;
                    transition: all 0.4s ease-out;
                    user-select: none;
                    z-index: 0;
                  }

                  .open .chevron {
                    transform: rotate(180deg);
                  }

                  .arrow {
                    top: 1.4rem;
                    cursor: pointer;
                    position: absolute;
                    right: -1.5rem;
                    transition: all 0.4s ease-out;
                  }

                  .collapsed {
                    //width: ${sidebarCollapsedWidth};
                  }

                  .collapsed .link {
                    /* margin: 0; */
                  }

                  .collapsed .link p, .collapsed .link .chevron {
                    opacity: 0;
                    width: 0px;
                    margin: 0px;
                    display: none;
                  }

                  .collapsed .logo {
                    //width: ${sidebarCollapsedWidth};
                  }

                  .collapsed .logo-big {
                    opacity: 0;
                    z-index: -1;
                    transition-delay: 0s;
                  }

                  .collapsed .logo-small {
                    opacity: 1;
                    z-index: 1;
                    transition: opacity 0.1s ease-in-out;
                    transition-delay: 0s;
                  }

                  .spacer {
                    margin: 0.25rem 0;
                  }

                  .browser-change-message {
                    color: #FFFFFF;
                    /* color: #f5f8fb; */
                    font-size: 0.6rem;
                    padding: 0.5rem 1rem;
                    position: fixed;
                    bottom: 0rem;
                    background: var(--blue-primary-color);
                    width: 168px;
                    transition: width 0.4s ease-out;
                    opacity: 0.9;
                  }

                  .collapsed .browser-change-message {
                    width: 40px;
                  }

                  .sidebar-link-container {
                    margin-top: -32px;
                    margin-bottom: 100px;
                    overflow: auto; // overlay;
                    //height: calc(100vh - ${footerHeight} - ${getSidebarLinkTopPosition()});
                    height: calc(100vh - ${footerHeight});
                    /*BROWER COMPAT*/
                    -ms-overflow-style: none;
                    //scrollbar-width: none; 
                  }

                  .sidebar-link-container::-webkit-scrollbar {
                    width: 6px;
                    background: ${colors.bluePrimary}00;
                  }

                  .sidebar-link-container::-webkit-scrollbar-thumb {
                    width: 6px;
                    background: #FFFFFF55;
                    border-radius: 3px;
                  }

                `}</style>
            </NoSSR>
        )
    };

    return (
        desktopContainer()
    );
};
