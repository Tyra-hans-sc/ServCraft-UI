import { colors, layout, fontSizes, shadows } from "../../../theme";
import { useContext, useState, useEffect, useRef, useMemo } from "react";
import PageContext from "../../../utils/page-context";
import Router, { useRouter } from 'next/router';
import Fetch from "../../../utils/Fetch";
import Helper from "../../../utils/helper";
import SubscriptionContext from "../../../utils/subscription-context";
import * as Enums from '../../../utils/enums';
import Constants from "../../../utils/constants";
import Link from 'next/link';
import PS from "../../../services/permission/permission-service";
import Storage from "../../../utils/storage";
import NoSSR from "../../../utils/no-ssr";
import SCMessageBarContext from '../../../utils/contexts/sc-message-bar-context';
import useRefState from "../../../hooks/useRefState";
import { IconMessage2 } from "@tabler/icons";
import { useMediaQuery } from "@mantine/hooks";
import featureService from "@/services/feature/feature-service";
import storage from "../../../utils/storage";
import constants from "@/utils/constants";
import warehouseService from "@/services/warehouse/warehouse-service";
import useInitialTimeout from "@/hooks/useInitialTimeout";
import FeedbearButton from '@/PageComponents/Button/FeedbearButton';


export default function SCSidebarResponsive({ customerZone, servSidebarState, onToggleExpanded }) {

    const router = useRouter();

    const subscriptionContext = useContext(SubscriptionContext);
    const messageBarContext = useContext(SCMessageBarContext);
    const pageContext = useContext(PageContext);

    const mobileView = useMediaQuery('(max-width: 800px)');
    const [currPath, setCurrPath] = useState("");
    const [queryString, setQueryString] = useState("");
    const [liveIntegrationPartner, setLiveIntegrationPartner] = useState(null);
    const [onceOffEvent, setOnceOffEvent] = useState(undefined);
    const [isChrome, setIsChrome] = useState(true);

    const [hideFinancials, setHideFinancials] = useState(true);

    const czApiEndpoint = useRef("");
    const [tenantName, setTenantName] = useState(customerZone ? pageContext.tenantName : Storage.getCookie(Enums.Cookie.servCompanyName));

    const sidebarExpandedWidth = "180px";
    const sidebarCollapsedWidth = "60px";
    const footerHeight = "62px";
    const sidebarLinkRef = useRef();
    const [sidebarHover, setSidebarHover, getSidebarHoverValue] = useRefState(false);

    const [sidebarLinks, setSidebarLinks] = useState([]);

    const [sectionTableFeatureEnabled, setSectionTableFeatureEnabled] = useState(false)
    useEffect(() => {
        featureService.getFeature(Constants.features.INVENTORY_SECTION_BUNDLE).then(feature => {
            setSectionTableFeatureEnabled(!!feature);
        })
    }, [])

    const [hasVan, setHasVan] = useState(false);
    const [stockTakeFeatureEnabled, setStockTakeFeatureEnabled] = useState(false);
    const [vanStockFeatureEnabled, setVanStockFeatureEnabled] = useState(false);


    const isUnauthRoute = useMemo(() => {
        const lowerPath = router.pathname.toLowerCase();
        let prefixPath = constants.PUBLIC_ROUTE_PREFIXES.some(prefix => lowerPath.startsWith(prefix));
        return constants.PUBLIC_ROUTES_EXACT.has(lowerPath) || prefixPath;
    }, [router.asPath]);

    useEffect(() => {
        if (!onceOffEvent && isUnauthRoute) {
            (async () => {
                await getFeatures()
                setOnceOffEvent(true);
            })();
        }
    }, [isUnauthRoute, onceOffEvent]);

    const getFeatures = async () => {
        // Only get features when authenticated
        if (!isUnauthRoute) {
            const stockTakeFeature = await featureService.getFeature(constants.features.STOCK_TAKE);
            setStockTakeFeatureEnabled(!!stockTakeFeature);
            const vanStockFeature = await featureService.getFeature(constants.features.VAN_STOCK);
            setVanStockFeatureEnabled(!!vanStockFeature);
            let hasVan = (await warehouseService.getEmployeeWarehouses(Storage.getCookie(Enums.Cookie.employeeID), Enums.WarehouseType.Mobile))?.length > 0;
            setHasVan(hasVan);
            Storage.setCookie(Enums.Cookie.hasVan, hasVan, 7);
        }
    }

    const appointmentRoute = '/appointment';

    function updateSidebarLinks(updatePerms) {
        let links = [];

        function getLink({ label, icon, url, navKey }) {
            return { label, icon, url, navKey };
        };


        setSidebarLinks(links);
    };

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

    const [sidebarState, setSidebarState] = useState(servSidebarState || sidebarStates.expanded);

    const [accessStatus, setAccessStatus] = useState(Enums.AccessStatus.None);
    const [permissions, setPermissions] = useState({});

    const isAuthenticated = Storage.hasCookieValue(Enums.Cookie.token);
    const hasEmployee = Storage.hasCookieValue(Enums.Cookie.employeeID);
    const hasSupplier = Storage.hasCookieValue(Enums.Cookie.supplierID);
    const hideLinks = !isAuthenticated && !customerZone;

    function updateSidebarState(newSidebarState) {
        setSidebarState(newSidebarState)
        onToggleExpanded(newSidebarState)
        Storage.setCookie(Enums.Cookie.servSidebarState, newSidebarState, 21);
        pageContext.setSideBarStateChanged(x => x + 1);
    }

    const updateAPIEndpoint = async () => {
        if (router) {
            let idxQryStr = router.asPath.indexOf("?");
            if (idxQryStr > -1) {
                let qs = router.asPath.substr(idxQryStr);
                let qsObj = Helper.queryStringToObject(qs);
                if (qsObj.t && !livePartnerUpdated.current) {
                    livePartnerUpdated.current = true;
                    const tenantResult = await Fetch.preLogin({ tenantID: qsObj.t });
                    if (tenantResult.HttpStatusCode === 200 && tenantResult.Results.length > 0) {
                        czApiEndpoint.current = tenantResult.Results[0].API;
                        await updateLivePartner();
                    }
                }
            }
        }
    };

    const livePartnerUpdated = useRef(false);

    const updateLivePartner = async () => {
        if (router) {
            let idxQryStr = router.asPath.indexOf("?");
            if (idxQryStr > -1) {
                let qs = router.asPath.substr(idxQryStr);
                let qsObj = Helper.queryStringToObject(qs);
                if (qsObj.t && qsObj.c) {
                    const livePartner = await Fetch.get({
                        url: '/CustomerZone/GetLiveIntegrationParner',
                        tenantID: qsObj.t,
                        customerID: qsObj.c,
                        apiUrlOverride: czApiEndpoint.current
                    });
                    setLiveIntegrationPartner(livePartner);
                }
            }
        }
    };

    // useEffect was misbehaving, this custom hook accomplishes the same thing reliably
    useInitialTimeout(10, () => {
        if (!servSidebarState) {
            Storage.setCookie(Enums.Cookie.servSidebarState, "expanded", 21);
        }
        if (sidebarState === sidebarStates.collapsed) {
            let listItems = [...document.getElementsByTagName("LI")];
            listItems.forEach(el => {
                if (el.dataset.link == currPath) {
                    el.parentNode.classList.add('current');
                    el.parentNode.classList.remove('open');
                }
            });
        }

        updateAPIEndpoint();

        // Only get features when authenticated
        !isUnauthRoute && (async () => {
            await getFeatures()
            setOnceOffEvent(true);
        })();


        setTimeout(() => {
            setIsChrome(window && window.chrome);
        }, 2000);
    })

    // Keep sidebar highlighting in sync with route changes
    useEffect(() => {
        // Normalize a URL to just its pathname (strip query/hash)
        const normalizePath = (path) => {
            if (!path) return "";
            const q = path.indexOf("?");
            const h = path.indexOf("#");
            let end = path.length;
            if (q > -1) end = Math.min(end, q);
            if (h > -1) end = Math.min(end, h);
            return path.substring(0, end);
        };

        const handleRouteChange = (url) => {

            const newPath = normalizePath(url);
            setCurrPath(newPath);

            // Preserve minimal query string for customer zone if present
            try {
                const idxQryStr = url.indexOf("?");
                if (idxQryStr > -1) {
                    let qs = url.substr(idxQryStr);
                    const qsObj = Helper.queryStringToObject(qs);
                    if (qsObj.t && qsObj.c) {
                        qs = `?${Helper.objectToQueryString({ t: qsObj.t, c: qsObj.c })}`;
                    }
                    setQueryString(qs);
                } else {
                    setQueryString("");
                }
            } catch (_) {
                // ignore parsing errors
            }
        };

        // Initialize with current path
        if (router && router.asPath) {
            handleRouteChange(router.asPath);
        }

        // Route change complete events are only fired the first time for quotes/invoices/purchase orders - but works as expected for other pages
        Router.events.on('routeChangeComplete', handleRouteChange);
        Router.events.on('hashChangeComplete', handleRouteChange);
        return () => {
            Router.events.off('routeChangeComplete', handleRouteChange);
            Router.events.off('hashChangeComplete', handleRouteChange);
        };
    }, []);

    useEffect(() => {
        setTenantName(customerZone ? pageContext.tenantName : Storage.getCookie(Enums.Cookie.servCompanyName));
    }, [pageContext.tenantName]);


    useEffect(() => {
        setupOnceOffEvent();
    }, [onceOffEvent, subscriptionContext.subscriptionInfo]);

    const setupOnceOffEvent = async () => {

        // REGAL CUSTOMER ZONE HIDINNG FINANCIALS
        if (customerZone) {
            try {
                const tenantID = Helper.queryStringToObject(window.location.search).t;
                setHideFinancials(tenantID && tenantID.toUpperCase() === "42D24109-8F35-4360-ADAC-58F28D06E8F1"); // hide for REGAL  
            } catch (error) {
                console.log(error);
            }
        }

        let subscriptionInfo = subscriptionContext.subscriptionInfo;
        if (subscriptionInfo) {
            setAccessStatus(subscriptionInfo.AccessStatus);
        }

        let updatePerms = {
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
            StockTake: PS.hasPermission(Enums.PermissionName.StockTake) || PS.hasPermission(Enums.PermissionName.StockTakeManager),
            StockTransactions: PS.hasPermission(Enums.PermissionName.StockTransactionsView),
            Message: PS.hasPermission(Enums.PermissionName.Message),
            Reports: PS.hasPermission(Enums.PermissionName.Reports),
            MasterOfficeAdmin: PS.hasPermission(Enums.PermissionName.MasterOfficeAdmin),
            Subscriptions: PS.hasPermission(Enums.PermissionName.Subscriptions),
            UserManagement: PS.hasPermission(Enums.PermissionName.UserManagement),
            ChangeMyPassword: PS.hasPermission(Enums.PermissionName.ChangeMyPassword),
            Project: PS.hasPermission(Enums.PermissionName.Project),
            RecurringJob: PS.hasPermission(Enums.PermissionName.RecurringJob),
            EditCompany: PS.hasPermission(Enums.PermissionName.EditCompany, true),
            Van: PS.hasPermission(Enums.PermissionName.VanManage)
        };

        if (!updatePerms.Van && hasVan) {
            updatePerms.Van = true;
        }

        if (subscriptionInfo && subscriptionInfo.AccessStatus === Enums.AccessStatus.LockedWithOutAccess) {
            updatePerms = {
                ChangeMyPassword: updatePerms.ChangeMyPassword,
                Subscriptions: updatePerms.Subscriptions,
                UserManagement: updatePerms.UserManagement
            };
        }

        setPermissions(updatePerms);
        updateSidebarLinks(updatePerms);
    };

    const closeSidebar = () => {
        pageContext.setMobileSidebarExpanded(false);
    };

    const toggleSidebar = (e) => {
        let listItems = [...document.getElementsByTagName("LI")];
        if (sidebarState !== sidebarStates.expanded) {
            updateSidebarState(sidebarStates.expanded);
            listItems.forEach(el => {
                if (el.dataset.link == currPath) {
                    el.parentNode.classList.add('open');
                    el.parentNode.classList.remove('current');
                }
            });
        } else {
            updateSidebarState(sidebarStates.collapsed);
            listItems.forEach(el => {
                if (el.dataset.link == currPath) {
                    el.parentNode.classList.add('current');
                }
            });
        }
    };

    const navigate = (path) => {
        if (mobileView) {
            closeSidebar();
        }
        Helper.nextLinkClicked(path);
    };

    const navigateToServCraft = () => {
        if (typeof window !== "undefined") {
            window.open("https://www.servcraft.co.za", "_blank");
        }
    };

    const onItemClicked = (link) => {
        Helper.nextLinkClicked(link)
        Helper.mixpanelTrack(Constants.mixPanelEvents.sidebarNavigate, {
            page: link,
            module: link === '/' ? 'dashboard' : link.split('/')[1]
        })
    }

    const expando = () => {
        return (
            <>
                <img src="/sc-icons/collapse.svg" alt="collapse-expand" className={"expando " + sidebarState}
                    onClick={toggleSidebar} onMouseOver={() => setSidebarHover(true)}
                    onMouseOut={() => setSidebarHover(false)} />

                <style jsx>{`
                  .expando {
                    z-index: 1;
                    position: fixed;
                    cursor: pointer;
                    bottom: 5rem;
                    transition: all 0.1s ease-out;
                    box-shadow: 0px 3px 6px rgba(0, 0, 0, 0.1);
                    opacity: 1; // ${getSidebarHoverValue() ? 1 : 0};
                  }

                  .expando:hover {
                    filter: brightness(120%);
                  }

                  .expanded {
                    left: 160px;
                  }

                  .collapsed {
                    left: 40px;
                    transform: rotate(180deg);
                  }
                `}</style>
            </>
        );
    };

    const mobileCustomerZoneContainer = () => {
        return (<NoSSR>

            <div className={"mobile-overlay" + (pageContext.mobileSidebarExpanded === true ? " expanded" : "")}
                onClick={closeSidebar}></div>
            <div
                className={"sidebar-responsive mobile" + (pageContext.mobileSidebarExpanded === true ? " expanded" : "")}>

                <div className="close-icon">
                    <img src="/icons/cross-black.svg" height="24" onClick={closeSidebar} />
                </div>

                {customerZone ? <>
                    <Link legacyBehavior={true} href={"/customerzone/joblist" + queryString}>
                        <a className={`link ${currPath.indexOf('/customerzone/joblist') > -1 || currPath.indexOf('/customerzone/viewjob') > -1 ? "current" : ""}`}
                            onClick={() => navigate("/customerzone/joblist" + queryString)}>
                            <img src="/sc-icons/jobs-dark.svg" alt="Jobs" />
                            <p>Jobs</p>
                        </a>
                    </Link>

                    {hideFinancials ? "" : <>
                        <Link legacyBehavior={true} href={"/customerzone/quotelist" + queryString}>
                            <a className={`link ${currPath.indexOf('/customerzone/quotelist') > -1 || currPath.indexOf('/customerzone/viewquote') > -1 ? "current" : ""}`}
                                onClick={() => navigate("/customerzone/quotelist" + queryString)}>
                                <img src="/sc-icons/quotes-dark.svg" alt="Quotes" />
                                <p>Quotes</p>
                            </a>
                        </Link>
                        <Link legacyBehavior={true} href={"/customerzone/invoicelist" + queryString}>
                            <a className={`link ${currPath.indexOf('/customerzone/invoicelist') > -1 || currPath.indexOf('/customerzone/viewinvoice') > -1 ? "current" : ""}`}
                                onClick={() => navigate("/customerzone/invoicelist" + queryString)}>
                                <img src="/sc-icons/invoices-dark.svg" alt="Invoices" />
                                <p>Invoices</p>
                            </a>
                        </Link>
                    </>}

                    <Link legacyBehavior={true} href={"/customerzone/appointmentlist" + queryString}>
                        <a className={`link ${currPath.indexOf('/customerzone/appointmentlist') > -1 || currPath.indexOf('/customerzone/viewappointment') > -1 ? "current" : ""}`}
                            onClick={() => navigate("/customerzone/appointmentlist" + queryString)}>
                            <img src="/sc-icons/appointments-dark.svg" alt="Appointments" />
                            <p>Appointments</p>
                        </a>
                    </Link>

                    <div className="powered" onClick={navigateToServCraft}>
                        <p>Powered by</p>
                        <img src="/logo-type-blue.svg" height="36" />
                    </div>
                </> : <></>}
            </div>

            <style jsx>{`

              .mobile-overlay {
                position: fixed;
                z-index: 99999999;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: ${colors.black}55;
                opacity: 0;
                pointer-events: none;
                transition: opacity 0.2s ease-out;
              }

              .mobile-overlay.expanded {
                opacity: 1;
                pointer-events: all;
              }

              .sidebar-responsive.mobile {
                background-color: ${colors.white};
                box-sizing: border-box;
                flex-shrink: 0;
                top: 0;
                bottom: 0;
                left: 0;
                padding: 1rem 0 4rem 0;
                position: absolute;
                transition: width 0.2s ease-out;
                width: 0;
                color: ${colors.black};
                overflow: hidden;
                overflow-wrap: break-word;
                hyphens: auto;
                z-index: 100000000;
                box-shadow: ${shadows.card};
              }

              .sidebar-responsive.mobile.expanded {
                width: 200px;
              }

              .sidebar-responsive.desktop {
                background-color: ${colors.white};
                box-sizing: border-box;
                flex-shrink: 0;
                height: 100vh;
                // overflow-y: scroll;
                padding: 1rem 0.5rem 4rem 0;
                position: relative;
                transition: width 0.2s ease-out;
                width: 200px;
                /*BROWER COMPAT*/
                // -ms-overflow-style: none;
                // scrollbar-width: none;
                color: ${colors.black};
                overflow: hidden;
                overflow-wrap: break-word;
              }

              .sidebar-responsive.desktop h2.tenant-name {
                margin: 0 0 1rem 1rem;
                font-size: 1.1rem;
              }

              .link {
                align-items: center;
                border-radius: 0 ${layout.bodyRadius} ${layout.bodyRadius} 0;
                cursor: pointer;
                display: flex;
                height: 3rem;
                padding-left: 1rem;
                text-decoration: none;
                transition: padding 0.4s ease-out;
              }

              .link:hover {
                background-color: ${colors.lightGreyStatus};
              }

              .current {
                background-color: ${colors.lightGreyStatus}AA;
              }

              .link p {
                color: ${colors.black};
                font-size: ${fontSizes.link};
                font-weight: bold;
                margin-left: 1rem;
                opacity: 1;
                transition: all 0.4s ease-out;
                white-space: nowrap;
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

              .sidebar-responsive .powered {
                cursor: pointer;
                position: absolute;
                bottom: 1rem;
                left: 1rem;
                padding: 0.35rem;
                box-shadow: ${shadows.cardSmall};
                border-radius: 3px;
              }

              .sidebar-responsive .powered p {
                font-weight: bold;
                font-size: 0.7rem;
                margin: 0;
              }

              .close-icon {
                margin: 0.5rem;
              }
            `}</style>
        </NoSSR>);
    };

    const desktopCustomerZoneContainer = () => {

        return (<NoSSR>


            <div className={"sidebar-responsive desktop"}>

                <h2 className="tenant-name">
                    {tenantName}
                </h2>


                <Link legacyBehavior={true} href={"/customerzone/joblist" + queryString}>
                    <a className={`link ${currPath.indexOf('/customerzone/joblist') > -1 || currPath.indexOf('/customerzone/viewjob') > -1 ? "current" : ""}`}
                        onClick={() => navigate("/customerzone/joblist" + queryString)}>
                        <img src="/sc-icons/jobs-dark.svg" alt="Jobs" />
                        <p>Jobs</p>
                    </a>
                </Link>

                {hideFinancials ? "" : <>
                    <Link legacyBehavior={true} href={"/customerzone/quotelist" + queryString}>
                        <a className={`link ${currPath.indexOf('/customerzone/quotelist') > -1 || currPath.indexOf('/customerzone/viewquote') > -1 ? "current" : ""}`}
                            onClick={() => navigate("/customerzone/quotelist" + queryString)}>
                            <img src="/sc-icons/quotes-dark.svg" alt="Quotes" />
                            <p>Quotes</p>
                        </a>
                    </Link>
                    <Link legacyBehavior={true} href={"/customerzone/invoicelist" + queryString}>
                        <a className={`link ${currPath.indexOf('/customerzone/invoicelist') > -1 || currPath.indexOf('/customerzone/viewinvoice') > -1 ? "current" : ""}`}
                            onClick={() => navigate("/customerzone/invoicelist" + queryString)}>
                            <img src="/sc-icons/invoices-dark.svg" alt="Invoices" />
                            <p>Invoices</p>
                        </a>
                    </Link>
                </>}

                <Link legacyBehavior={true} href={"/customerzone/appointmentlist" + queryString}>
                    <a className={`link ${currPath.indexOf('/customerzone/appointmentlist') > -1 || currPath.indexOf('/customerzone/viewappointment') > -1 ? "current" : ""}`}
                        onClick={() => navigate("/customerzone/appointmentlist" + queryString)}>
                        <img src="/sc-icons/appointments-dark.svg" alt="Appointments" />
                        <p>Appointments</p>
                    </a>
                </Link>

                <div className="powered" onClick={navigateToServCraft}>
                    <p>Powered by</p>
                    <img src="/logo-type-blue.svg" height="36" />
                </div>
            </div>

            <style jsx>{`

              .mobile-overlay {
                position: fixed;
                z-index: 99999999;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: ${colors.black}55;
                opacity: 0;
                pointer-events: none;
                transition: opacity 0.2s ease-out;
              }

              .mobile-overlay.expanded {
                opacity: 1;
                pointer-events: all;
              }

              .sidebar-responsive.mobile {
                background-color: ${colors.white};
                box-sizing: border-box;
                flex-shrink: 0;
                top: 0;
                bottom: 0;
                left: 0;
                padding: 1rem 0 4rem 0;
                position: absolute;
                transition: width 0.2s ease-out;
                width: 0;
                color: ${colors.black};
                overflow: hidden;
                overflow-wrap: break-word;
                hyphens: auto;
                z-index: 100000000;
                box-shadow: ${shadows.card};
              }

              .sidebar-responsive.mobile.expanded {
                width: 200px;
              }

              .sidebar-responsive.desktop {
                background-color: ${colors.white};
                box-sizing: border-box;
                flex-shrink: 0;
                height: 100vh;
                // overflow-y: scroll;
                padding: 1rem 0.5rem 4rem 0;
                position: relative;
                transition: width 0.2s ease-out;
                width: 200px;
                /*BROWER COMPAT*/
                // -ms-overflow-style: none;
                // scrollbar-width: none;
                color: ${colors.black};
                overflow: hidden;
                overflow-wrap: break-word;
              }

              .sidebar-responsive.desktop h2.tenant-name {
                margin: 0 0 1rem 1rem;
                font-size: 1.1rem;
              }

              .link {
                align-items: center;
                border-radius: 0 ${layout.bodyRadius} ${layout.bodyRadius} 0;
                cursor: pointer;
                display: flex;
                height: 3rem;
                padding-left: 1rem;
                margin-right: 0.5rem;
                text-decoration: none;
                transition: padding 0.4s ease-out;
              }

              .link:hover {
                background-color: ${colors.lightGreyStatus};
              }

              .current {
                background-color: ${colors.lightGreyStatus}AA;
              }

              .link p {
                color: ${colors.black};
                font-size: ${fontSizes.link};
                font-weight: bold;
                margin-left: 1rem;
                opacity: 1;
                transition: all 0.4s ease-out;
                white-space: nowrap;
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

              .sidebar-responsive .powered {
                cursor: pointer;
                position: absolute;
                bottom: 1rem;
                left: 1rem;
                padding: 0.35rem;
                box-shadow: ${shadows.cardSmall};
                border-radius: 3px;
              }

              .sidebar-responsive .powered p {
                font-weight: bold;
                font-size: 0.7rem;
                margin: 0;
              }

              .close-icon {
                margin: 0.5rem;
              }
            `}</style>


        </NoSSR>);
    }

    const desktopContainer = () => {

        const isLinkCurrent = ({ equals, startsWith }) => {
            const path = router.asPath || currPath || "";

            if (path.indexOf("/settings/") > -1) {
                return false;
            }

            let result = false;
            if (Array.isArray(equals)) {
                result = equals.some(x => x === path);
            } else if (Array.isArray(startsWith)) {
                // original semantics: contains
                result = startsWith.some(x => path.indexOf(x) > -1);
            }

            return result;
        };

        return (
            <NoSSR>
                <div className={"sidebar " + sidebarState} onMouseOver={() => setSidebarHover(true)}
                    onMouseOut={() => setSidebarHover(false)}>
                    {hideLinks ? <></> : <>

                        <div className="logo">
                            <Link legacyBehavior={true} href={"/"}>
                                <a className="logo-big"
                                    onClick={
                                        () => {
                                            Helper.nextLinkClicked(customerZone ? "/customerzone" + queryString : "/")
                                        }
                                    }
                                ><img src="/logo-type-white.svg" alt="ServCraft" /></a>
                            </Link>
                            <Link legacyBehavior={true} href={"/"}>
                                <a className="logo-small"
                                    onClick={
                                        () => {
                                            Helper.nextLinkClicked(customerZone ? "/customerzone" + queryString : "/")
                                        }
                                    }
                                ><img src="/logo-white.svg" alt="ServCraft" /></a>
                            </Link>
                        </div>

                        <div ref={sidebarLinkRef} className="sidebar-link-container">

                            <Link legacyBehavior={true} href="/">
                                <a className={`link ${isLinkCurrent({ equals: ['/'] }) ? "current" : ""}`}
                                    onClick={
                                        () => {
                                            onItemClicked("/")
                                        }
                                    }
                                >
                                    <img
                                        src={`/sc-icons/dashboard-${isLinkCurrent({ equals: ['/'] }) ? "light" : "blue"}.svg`}
                                        alt="Dashboard"
                                        title={sidebarState === sidebarStates.collapsed ? 'Dashboard' : ''} />
                                    <p>Dashboard</p>
                                </a>
                            </Link>

                            {(permissions.Job || permissions.RecurringJob || permissions.Project) && hasEmployee ? <>
                                <Link
                                    style={{ textDecoration: 'none' }}
                                    href="/job/list"
                                >
                                    <span className={`link ${isLinkCurrent({ startsWith: ["/job/", "/job-schedule/", "/project/"] })
                                        ? "current" : ""
                                        }`}

                                        onClick={
                                            () => {
                                                onItemClicked("/job/list")
                                            }
                                        }
                                    >
                                        <img
                                            src={`/sc-icons/jobs-${isLinkCurrent({ startsWith: ["/job/", "/job-schedule/", "/project/"] }) ? "light" : "blue"}.svg`}
                                            alt="Jobs" title={sidebarState === sidebarStates.collapsed ? 'Jobs' : ''} />
                                        <p>Jobs</p>
                                    </span>
                                </Link>
                            </> : ""}

                            {permissions.Appointment && hasEmployee ? <>
                                <Link legacyBehavior={true} href={appointmentRoute}>
                                    <a className={`link ${isLinkCurrent({ equals: [appointmentRoute] }) ? "current" : ""}`}
                                        onClick={
                                            () => {
                                                onItemClicked(appointmentRoute)
                                            }
                                        }
                                    >
                                        <img
                                            src={`/sc-icons/appointments-${isLinkCurrent({ equals: [appointmentRoute] }) ? "light" : "blue"}.svg`}
                                            alt="Appointments"
                                            title={sidebarState === sidebarStates.collapsed ? 'Appointments' : ''} />
                                        <p>Appointments</p>
                                    </a>
                                </Link>
                            </> : ""}

                            {permissions.Query && hasEmployee ? <>
                                <Link
                                    style={{ textDecoration: 'none' }}
                                    href={"/query/list"}
                                >
                                    <span
                                        className={`link ${isLinkCurrent({ startsWith: ["/query/"] }) ? "current" : ""}`}

                                        onClick={
                                            () => {
                                                onItemClicked("/query/list")
                                            }
                                        }
                                    >
                                        <img
                                            src={`/sc-icons/queries-${isLinkCurrent({ startsWith: ["/query/"] }) ? "light" : "blue"}.svg`}
                                            alt="Queries"
                                            title={sidebarState === sidebarStates.collapsed ? 'Queries' : ''} />
                                        <p>Queries</p>
                                    </span>
                                </Link>
                            </> : ""}

                            {permissions.Quote && hasEmployee ? <>
                                <Link
                                    style={{ textDecoration: 'none' }}
                                    href={"/quote/list"}
                                >
                                    <span
                                        className={`link ${isLinkCurrent({ startsWith: ["/quote/"] }) ? "current" : ""}`}

                                        onClick={
                                            () => {
                                                onItemClicked("/quote/list")
                                            }
                                        }
                                    >
                                        <img
                                            src={`/sc-icons/quotes-${isLinkCurrent({ startsWith: ["/quote/"] }) ? "light" : "blue"}.svg`}
                                            alt="Quotes"
                                            title={sidebarState === sidebarStates.collapsed ? 'Quotes' : ''} />
                                        <p>Quotes</p>
                                    </span>
                                </Link>
                            </> : ""}

                            {permissions.Invoice && hasEmployee ? <>
                                <Link
                                    style={{ textDecoration: 'none' }}
                                    href={"/invoice/list"}
                                >
                                    <span
                                        className={`link ${isLinkCurrent({ startsWith: ["/invoice/"] }) ? "current" : ""}`}

                                        onClick={
                                            () => {
                                                onItemClicked("/invoice/list")
                                            }
                                        }
                                    >
                                        <img
                                            src={`/sc-icons/invoices-${isLinkCurrent({ startsWith: ["/invoice/"] }) ? "light" : "blue"}.svg`}
                                            alt="Invoices"
                                            title={sidebarState === sidebarStates.collapsed ? 'Invoices' : ''} />
                                        <p>Invoices</p>
                                    </span>
                                </Link>
                            </> : ""}

                            {permissions.PurchaseOrder && hasEmployee ? <>
                                <Link
                                    style={{ textDecoration: 'none' }}
                                    href={"/purchase/list"}
                                >
                                    <span
                                        className={`link ${isLinkCurrent({ startsWith: ["/purchase/"] }) ? "current" : ""}`}

                                        onClick={
                                            () => {
                                                onItemClicked("/purchase/list")
                                            }
                                        }
                                    >
                                        <img
                                            src={`/sc-icons/purchases-${isLinkCurrent({ startsWith: ["/purchase/"] }) ? "light" : "blue"}.svg`}
                                            alt="Purchases"
                                            title={sidebarState === sidebarStates.collapsed ? 'Purchases' : ''} />
                                        <p>Purchases</p>
                                    </span>
                                </Link>
                            </> : ""}

                            {(permissions.Customer || permissions.Product) && hasEmployee ? <>
                                <Link
                                    style={{ textDecoration: 'none' }}
                                    href={"/customer/list"}
                                >
                                    <span className={`link ${isLinkCurrent({ startsWith: ["/customer/", "/asset/"] })
                                        ? "current" : ""}`}

                                        onClick={
                                            () => {
                                                onItemClicked("/customer/list")
                                            }
                                        }
                                    >
                                        <img
                                            src={`/sc-icons/customers-${isLinkCurrent({ startsWith: ["/customer/", "/asset/"] }) ? "light" : "blue"}.svg`}
                                            alt="Customers"
                                            title={sidebarState === sidebarStates.collapsed ? 'Customers' : ''} />
                                        <p>Customers</p>
                                    </span>
                                </Link>
                            </> : ''}

                            {(
                                permissions.Inventory
                                || permissions.StockTransactions
                                || (permissions.StockTake)
                                || (permissions.Van)
                            ) && hasEmployee ? <>
                                <Link
                                    style={{ textDecoration: 'none' }}
                                    href={permissions.Inventory ? "/inventory/list" : permissions.StockTransactions ? "/inventory/list?tab=stocktransaction" : "/inventory/list"}
                                >
                                    <span className={`link ${isLinkCurrent({ startsWith: ["/inventory/", "/inventory-category/", "/inventory-subcategory/", "/supplier/", "/bundle/", "stocktransaction"] })
                                        ? "current" : ""}`}

                                        onClick={
                                            () => {
                                                onItemClicked(permissions.Inventory ? "/inventory/list" : permissions.StockTransactions ? "/inventory/list?tab=stocktransaction" : "/inventory/list")
                                            }
                                        }
                                    >
                                        <img
                                            src={`/sc-icons/inventory-${isLinkCurrent({ startsWith: ["/inventory/", "/inventory-category/", "/inventory-subcategory/", "/supplier/", "/bundle/", "/stocktransaction/"] }) ? "light" : "blue"}.svg`}
                                            alt="Inventory"
                                            title={sidebarState === sidebarStates.collapsed ? 'Inventory' : ''} />
                                        <p style={{ position: 'relative' }}>
                                            Inventory
                                        </p>
                                    </span>
                                </Link>
                            </> : ""}



                            {permissions.Reports && hasEmployee ? <>
                                <Link
                                    style={{ textDecoration: 'none' }}
                                    href={'/report/list'}
                                >
                                    <span
                                        className={`link ${isLinkCurrent({ equals: ["/report/list"] }) ? "current" : ""}`}

                                        onClick={
                                            () => {
                                                onItemClicked("/report/list")
                                            }
                                        }
                                    >
                                        <img
                                            src={`/sc-icons/reports-${isLinkCurrent({ equals: ["/report/list"] }) ? "light" : "blue"}.svg`}
                                            alt="Reports"
                                            title={sidebarState === sidebarStates.collapsed ? 'Reports' : ''} />
                                        <p>Reports</p>
                                    </span>
                                </Link>
                            </> : ""}

                            {permissions.Message ? <>
                                <Link
                                    style={{ textDecoration: 'none' }}
                                    href={'/message/list'}
                                >
                                    <span
                                        className={`link ${isLinkCurrent({ startsWith: ["/message/"] }) ? "current" : ""}`}

                                        onClick={
                                            () => {
                                                onItemClicked("/report/list")
                                            }
                                        }

                                    >
                                        <span style={{
                                            color: isLinkCurrent({ equals: ["/message/list"] }) ? colors.white : colors.sidebarColor,
                                            fontSize: fontSizes.link,
                                            fontWeight: 'bold',
                                            opacity: 1,

                                        }}>
                                            <IconMessage2 />
                                        </span>
                                        <p>Messages</p>
                                    </span>
                                </Link>
                            </> : ""}

                        </div>
                    </>}

                    {expando()}

                    <div style={{
                        padding: '8px 16px 16px',
                        flexShrink: 0,
                        transition: 'width 0.2s ease-out'
                    }}>
                        <FeedbearButton collapsed={sidebarState === sidebarStates.collapsed} />
                    </div>
                    {/*footer()*/}

                </div>

                <style jsx>{`
                  .sidebar {
                    background-color: ${colors.bluePrimary};
                    box-sizing: border-box;
                    flex-shrink: 0;
                    ${messageBarContext.isActive ? `height: calc(100vh - ${Constants.messageBarMargin}px);` : "height: 100vh;"}

                    padding: 5.5rem 0 0;
                    position: relative;
                    display: flex;
                    flex-direction: column;
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
                    overflow: auto; // overlay;
                    flex: 1;
                    min-height: 0;
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
        <>
            {mobileView && customerZone ? mobileCustomerZoneContainer() : customerZone ? desktopCustomerZoneContainer() : desktopContainer()}
        </>
    );
};
