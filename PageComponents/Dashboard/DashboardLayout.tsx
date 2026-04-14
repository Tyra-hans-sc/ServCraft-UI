import { colors, shadows } from "@/theme";
import { FC, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Responsive, WidthProvider } from "react-grid-layout";
import PS from '@/services/permission/permission-service';
import * as Enums from '@/utils/enums';
import storage from "@/utils/storage";
import UCS from '@/services/option/user-config-service';
import helper from "@/utils/helper";
import constants from "@/utils/constants";
import { DashboardPageConfig, DashboardConfig, WidgetConfig, Layout, WidgetIDConstants, YOUTUBE_VIDEO_ID, WidgetHeights } from "./DashboardModels";
import SCWidgetCarousel from '@/components/sc-controls/widgets/new/sc-widget-carousel';
import SCWidgetYoutube from '@/components/sc-controls/widgets/new/sc-widget-youtube';
import SCWidgetYoureIn from '@/components/sc-controls/widgets/new/sc-widget-youre-in';
import SCJobTrackerWidget from '@/components/sc-controls/widgets/new/sc-widget-job-tracker';
import SCWidgetAdvertJobs from "@/components/sc-controls/widgets/new/sc-widget-advert-jobs";
import {Box, Drawer, ScrollArea} from "@mantine/core";

import useRefState from "@/hooks/useRefState";
import PageContext from "@/utils/page-context";
import SCMessageBarContext from '@/utils/contexts/sc-message-bar-context';
import { Grid } from "@mantine/core";
import SCWidgetAdvertInvoices from "@/components/sc-controls/widgets/new/sc-widget-advert-invoices";
import SCWidgetQuickActions from "@/components/sc-controls/widgets/new/sc-widget-quick-actions";
import ScWidgetDailyStats from "@/components/sc-controls/widgets/new/sc-widget-daily-stats";
import SCWidgetAdvertJobsAgeing from "@/components/sc-controls/widgets/new/sc-widget-advert-jobs-ageing";
import SCWidgetJobsAgeing from "@/components/sc-controls/widgets/new/sc-widget-jobs-ageing";
import SCWidgetCreateJob from "@/components/sc-controls/widgets/new/sc-widget-create-job";
import SCWidgetQueryStatus from "@/components/sc-controls/widgets/new/sc-widget-query-status";
import SCWidgetQuoteStatus from "@/components/sc-controls/widgets/new/sc-widget-quote-status";
import SCWidgetInvoiceStatus from "@/components/sc-controls/widgets/new/sc-widget-invoice-status";
import SCWidgetFeedback from "@/components/sc-controls/widgets/new/sc-widget-feedback";
import SCWidgetWelcomeBar from "@/components/sc-controls/widgets/new/sc-widget-welcome-bar";
import ScWidgetCommentsLatest from "@/components/sc-controls/widgets/new/sc-widget-comments-latest";
import CardedAppointmentWidget from "@/components/sc-controls/widgets/new/carded-appointment-widget";
import ScWidgetJobStatusPeriodCounts from "@/components/sc-controls/widgets/new/sc-widget-job-status-period-counts";
import SCWidgetFeedbear from "@/components/sc-controls/widgets/new/sc-widget-feedbear";
import moment from 'moment';

const ResponsiveGridLayout = WidthProvider(Responsive);

const DashboardLayout: FC<{ testing: boolean }> = ({ testing = false }) => {


    const pageContext = useContext(PageContext);
    const messageBarContext = useContext(SCMessageBarContext);
    const isTrial = useRef(false);
    const trialDateAfter30Nov25 = useRef(false);
    const [filtersConfig, setFiltersConfig, getFiltersConfigValue] = useRefState<any>(null);
    const [dashboardPageConfig, setDashboardPageConfig, getDashboardPageConfigValue] = useRefState<DashboardPageConfig>(new DashboardPageConfig());
    const [accessStatus, setAccessStatus] = useState(Enums.AccessStatus.None);
    const [activeTab, setActiveTab] = useState<string | null>("Home");
    const [dashHeight, setDashHeight] = useState("0px");
    const dashRef = useRef<HTMLElement>();
    const [widgetDrawerOpen, setWidgetDrawerOpen] = useState(false);
    const [drawerOpened, setDrawerOpened] = useState(false);

    const updateActiveTab = (value: string | null) => {
        if (value === "Add") {
            addNewDashboard();
            return;
        }
        setActiveTab(value);
    };

    const addNewDashboard = () => {
        let dashPageConfig = { ...getDashboardPageConfigValue() };

        let config: DashboardConfig = new DashboardConfig();

        let newName = prompt("Dashboard Name", config.name);
        config.name = newName ?? config.name;

        dashPageConfig.dashboards.push(config);

        setDashboardPageConfig(dashPageConfig);
        saveFiltersConfig();
        updateActiveTab(config.id);
    };

    const dismissWidget = async (widget: WidgetConfig) => {
        let dashboardPageConfigValue = { ...getDashboardPageConfigValue() };
        let dashboard = dashboardPageConfigValue.dashboards.find(x => x.id === widget.dashboardID);
        if (!widget.canDismiss || !dashboard || dashboard.dismissedIDs.includes(widget.id)) return;
        dashboard.dismissedIDs.push(widget.id);
        setDashboardPageConfig(dashboardPageConfigValue);
        saveFiltersConfig();

        helper.mixpanelTrack(constants.mixPanelEvents.dashboardWidgetDismissed, {
            id: widget.friendlyID
        } as any);
    };

    const saveFiltersConfig = (dashPageConfig: DashboardPageConfig | null = null) => {
        let filtersConfigValue = { ...getFiltersConfigValue() };
        let dashboardPageConfigValue = dashPageConfig ?? { ...getDashboardPageConfigValue() };
        UCS.setSCDashboardPageConfig(filtersConfigValue, dashboardPageConfigValue);
        UCS.saveConfigDebounced(filtersConfigValue, null, 750);
    };

    const refreshGridLayout = (timeout: number = 1) => {
        if (typeof window !== "undefined") {

            setTimeout(() => {
                window.dispatchEvent(new Event("resize"));
            }, timeout);
        }
    }

    const windowResize = () => {
        if (!dashRef.current) return;

        let rect = dashRef.current.getBoundingClientRect();
        // console.log(rect);
        let top = rect.top;
        let below = window.innerHeight - top - 16;
        setDashHeight(`${below}px`);

    };

    useEffect(() => {
        initialise();

        window.addEventListener("resize", windowResize)
        return () => {
            window.removeEventListener("resize", windowResize);
        };
    }, []);

    useEffect(() => {
        refreshGridLayout(500);
    }, [(pageContext as any).sideBarStateChanged]);

    const initialise = async () => {

        const subscriptionInfo = storage.getCookie(Enums.Cookie.subscriptionInfo);
        let access = subscriptionInfo?.AccessStatus;
        setAccessStatus(access);
        isTrial.current = testing || access === Enums.AccessStatus.Trial;

        // Determine if FirstTrialDate is after 30 November 2025
        const firstTrialDate = subscriptionInfo?.FirstTrialDate;
        const threshold = moment('2025-11-30').endOf('day');
        const firstTrialMoment = moment(firstTrialDate);
        trialDateAfter30Nov25.current = firstTrialMoment.isValid() && firstTrialMoment.isAfter(threshold);

        await getFiltersConfig();
        setupWidgets();
    };

    const getFiltersConfig = async () => {
        const config = await UCS.getPageFilters(Enums.ConfigurationSection.Dashboard);
        setFiltersConfig(config);
    }

    const layoutChanged = (layouts: Layout[]) => {
        let dashPageConfig = { ...getDashboardPageConfigValue() };
        let dashboard = dashPageConfig.dashboards.find(x => x.id === activeTab);
        if (!dashboard) return;
        for (let layout of layouts) {
            let widget = dashboard.widgets.find(x => x.id === layout.i);
            if (widget && !widget.gridStatic) {
                widget.gridHeight = layout.h;
                widget.gridWidth = layout.w;
                widget.gridX = layout.x;
                widget.gridY = layout.y;
            }
        }
        setDashboardPageConfig(dashPageConfig);
        saveFiltersConfig();
    }

    const clearDismissed = () => {
        let dashboardPageConfigValue = { ...getDashboardPageConfigValue() };
        for (let dash of dashboardPageConfigValue.dashboards) {
            dash.dismissedIDs = [];
        }

        setDashboardPageConfig(dashboardPageConfigValue);
        saveFiltersConfig();
    }

    const resetWidgets = () => {
        let dashPageConfig: DashboardPageConfig = new DashboardPageConfig();
        dashPageConfig.dashboards.push(new DashboardConfig());

        setupLanding(dashPageConfig.dashboards[0]);

        saveFiltersConfig(dashPageConfig);

        setTimeout(() => {
            window.location.reload();
        }, 2000);
    };

    const deleteDashboard = () => {

        if (!confirm("Delete dashboard?")) return;

        let dashPageConfig = { ...getDashboardPageConfigValue() };

        dashPageConfig.dashboards = dashPageConfig.dashboards.filter(x => x.id !== activeTab);

        setDashboardPageConfig(dashPageConfig);
        saveFiltersConfig();
        updateActiveTab("Home");
    };


    const setupLanding = (dashboardConfig: DashboardConfig) => {
        dashboardConfig.isHome = true;
        dashboardConfig.canEdit = false;
        dashboardConfig.name = "Home";
        dashboardConfig.id = "Home";

        let widgetOrder = 0;
        let widgets: WidgetConfig[] = [];

        let gridHeight = 2;
        let gridRow = 0;
        let gridWidth = 0;

        /*gridWidth = 12;

        widgets.push({
            canDismiss: true,
            dashboardID: dashboardConfig.id,
            id: WidgetIDConstants.whatsNew as string,
            friendlyID: WidgetIDConstants.whatsNew as string,
            order: widgetOrder++,
            type: Enums.Widgets.WhatsNew,
            region: "system",
            gridHeight: gridHeight,
            gridWidth: gridWidth,
            gridStatic: true,
            gridX: gridWidth * 0,
            gridY: gridHeight * gridRow,
            heightPX: WidgetHeights.threeQuarterHeight,
            label: "What's New",
        });

        gridRow++;*/

        gridWidth = 12;

        widgets.push({
            canDismiss: false,
            dashboardID: dashboardConfig.id,
            id: WidgetIDConstants.welcomeBar as string,
            friendlyID: WidgetIDConstants.welcomeBar as string,
            order: widgetOrder++,
            type: Enums.Widgets.WelcomeBar,
            region: "system",
            gridHeight: gridHeight,
            gridWidth: gridWidth,
            gridStatic: true,
            gridX: gridWidth * 0,
            gridY: gridHeight * gridRow,
            heightPX: WidgetHeights.halfHeight,
            label: "Welcome",
            gridRow


        });

        gridRow++;

        // Show trial section for trial users OR anyone whose FirstTrialDate is after 30 Nov 2025
        if (isTrial.current || trialDateAfter30Nov25.current) {
            gridWidth = 6;
            widgets.push({
                canDismiss: true,
                dashboardID: dashboardConfig.id,
                id: WidgetIDConstants.youreIn as string,
                friendlyID: WidgetIDConstants.youreIn as string,
                order: widgetOrder++,
                type: Enums.Widgets.YoureIn,
                region: "system",
                gridHeight: gridHeight,
                gridWidth: gridWidth,
                gridStatic: true,
                gridX: gridWidth * 0,
                gridY: gridHeight * gridRow,
                heightPX: WidgetHeights.fullHeight,
                label: "Welcome To ServCraft",
                gridRow
            });

            gridWidth = 6;
            widgets.push({
                canDismiss: true,
                dashboardID: dashboardConfig.id,
                id: WidgetIDConstants.jobWizard as string,
                friendlyID: WidgetIDConstants.jobWizard as string,
                order: widgetOrder++,
                type: Enums.Widgets.JobWizard,
                region: "system",
                gridHeight: gridHeight,
                gridWidth: gridWidth,
                gridStatic: true,
                gridX: (12 - gridWidth) * 1,
                gridY: gridHeight * gridRow,
                heightPX: WidgetHeights.fullHeight,
                label: "Create a Job Card",
                gridRow
            });

            gridRow++;
        }

        gridWidth = 3;

        let colCount = 0;

        // widgets.push({
        //     canDismiss: true,
        //     dashboardID: dashboardConfig.id,
        //     id: WidgetIDConstants.whatsNew as string,
        //     friendlyID: WidgetIDConstants.whatsNew as string,
        //     order: widgetOrder++,
        //     type: Enums.Widgets.WhatsNew,
        //     region: "system",
        //     gridHeight: gridHeight,
        //     gridWidth: gridWidth,
        //     gridStatic: true,
        //     gridX: gridWidth * colCount++,
        //     gridY: gridHeight * gridRow,
        //     heightPX: WidgetHeights.fullHeight,
        //     requiredPermission: Enums.PermissionName.Job,
        //     label: "What's New",
        //     gridRow
        // });

        widgets.push({
            canDismiss: true,
            dashboardID: dashboardConfig.id,
            id: WidgetIDConstants.queryStatus as string,
            friendlyID: WidgetIDConstants.queryStatus as string,
            order: widgetOrder++,
            type: Enums.Widgets.QueryStatus,
            region: "system",
            gridHeight: gridHeight,
            gridWidth: gridWidth,
            gridStatic: true,
            gridX: gridWidth * colCount++,
            gridY: gridHeight * gridRow,
            heightPX: WidgetHeights.fullHeight,
            requiredPermission: Enums.PermissionName.Query,
            label: "Queries",
            gridRow
        });

        widgets.push({
            canDismiss: true,
            dashboardID: dashboardConfig.id,
            id: WidgetIDConstants.quoteStatus as string,
            friendlyID: WidgetIDConstants.quoteStatus as string,
            order: widgetOrder++,
            type: Enums.Widgets.QuoteStatus,
            region: "system",
            gridHeight: gridHeight,
            gridWidth: gridWidth,
            gridStatic: true,
            gridX: gridWidth * colCount++,
            gridY: gridHeight * gridRow,
            heightPX: WidgetHeights.fullHeight,
            requiredPermission: Enums.PermissionName.Quote,
            label: "Quotes",
            gridRow
        });

        widgets.push({
            canDismiss: true,
            dashboardID: dashboardConfig.id,
            id: WidgetIDConstants.invoiceStatus as string,
            friendlyID: WidgetIDConstants.invoiceStatus as string,
            order: widgetOrder++,
            type: Enums.Widgets.InvoiceStatus,
            region: "system",
            gridHeight: gridHeight,
            gridWidth: gridWidth,
            gridStatic: true,
            gridX: gridWidth * colCount++,
            gridY: gridHeight * gridRow,
            heightPX: WidgetHeights.fullHeight,
            requiredPermission: Enums.PermissionName.Invoice,
            label: "Invoices",
            gridRow
        });

        widgets.push({
            canDismiss: true,
            dashboardID: dashboardConfig.id,
            id: WidgetIDConstants.jobStatusPeriodCounts as string,
            friendlyID: WidgetIDConstants.jobStatusPeriodCounts as string,
            order: widgetOrder++,
            type: Enums.Widgets.JobsSummary,
            region: "system",
            gridHeight: 0,
            gridWidth: gridWidth,
            gridStatic: true,
            gridX: gridWidth * 0,
            gridY: gridHeight * gridRow,
            heightPX: WidgetHeights.fullHeight,
            label: "Jobs in Status",
            gridRow
        });

        widgets.push({
            canDismiss: true,
            dashboardID: dashboardConfig.id,
            id: WidgetIDConstants.feedback as string,
            friendlyID: WidgetIDConstants.feedback as string,
            order: widgetOrder++,
            type: Enums.Widgets.Feedback,
            region: "system",
            gridHeight: gridHeight,
            gridWidth: gridWidth,
            gridStatic: true,
            gridX: gridWidth * colCount++,
            gridY: gridHeight * gridRow,
            heightPX: WidgetHeights.fullHeight,
            label: "Feedback",
            gridRow
        });

        colCount = 0;

        widgets.push({
            canDismiss: true,
            dashboardID: dashboardConfig.id,
            id: WidgetIDConstants.feedbear as string,
            friendlyID: WidgetIDConstants.feedbear as string,
            order: widgetOrder++,
            type: Enums.Widgets.Feedbear,
            region: "system",
            gridHeight: gridHeight,
            gridWidth: (gridWidth * 2),
            gridStatic: true,
            gridX: (gridWidth * 2) * colCount++,
            gridY: gridHeight * gridRow,
            heightPX: WidgetHeights.fullHeight,
            label: "Share Feedback",
            gridRow
        });

        gridRow++;

        // widgets.push({
        //     canDismiss: false,
        //     dashboardID: dashboardConfig.id,
        //     id: WidgetIDConstants.dailyStatJob as string,
        //     friendlyID: WidgetIDConstants.dailyStatJob as string,
        //     order: widgetOrder++,
        //     type: Enums.Widgets.DailyStats,
        //     region: "system",
        //     gridHeight: gridHeight,
        //     gridWidth: gridWidth,
        //     gridStatic: true,
        //     gridX: gridWidth * 0,
        //     gridY: gridHeight * gridRow,
        //     heightPX: WidgetHeights.halfHeight
        // });

        // widgets.push({
        //     canDismiss: false,
        //     dashboardID: dashboardConfig.id,
        //     id: WidgetIDConstants.dailyStatAppointment as string,
        //     friendlyID: WidgetIDConstants.dailyStatAppointment as string,
        //     order: widgetOrder++,
        //     type: Enums.Widgets.DailyStats,
        //     region: "system",
        //     gridHeight: gridHeight,
        //     gridWidth: gridWidth,
        //     gridStatic: true,
        //     gridX: gridWidth * 1,
        //     gridY: gridHeight * gridRow,
        //     heightPX: WidgetHeights.halfHeight
        // });

        // widgets.push({
        //     canDismiss: false,
        //     dashboardID: dashboardConfig.id,
        //     id: WidgetIDConstants.dailyStatQuote as string,
        //     friendlyID: WidgetIDConstants.dailyStatQuote as string,
        //     order: widgetOrder++,
        //     type: Enums.Widgets.DailyStats,
        //     region: "system",
        //     gridHeight: gridHeight,
        //     gridWidth: gridWidth,
        //     gridStatic: true,
        //     gridX: gridWidth * 2,
        //     gridY: gridHeight * gridRow,
        //     heightPX: WidgetHeights.halfHeight
        // });

        // widgets.push({
        //     canDismiss: false,
        //     dashboardID: dashboardConfig.id,
        //     id: WidgetIDConstants.dailyStatPayment as string,
        //     friendlyID: WidgetIDConstants.dailyStatPayment as string,
        //     order: widgetOrder++,
        //     type: Enums.Widgets.DailyStats,
        //     region: "system",
        //     gridHeight: gridHeight,
        //     gridWidth: gridWidth,
        //     gridStatic: true,
        //     gridX: gridWidth * 3,
        //     gridY: gridHeight * gridRow,
        //     heightPX: WidgetHeights.halfHeight
        // });

        // gridRow++;

        // gridWidth = 6;
        // widgets.push({
        //     canDismiss: false,
        //     dashboardID: dashboardConfig.id,
        //     id: WidgetIDConstants.whatsNew as string,
        //     friendlyID: WidgetIDConstants.whatsNew as string,
        //     order: widgetOrder++,
        //     type: Enums.Widgets.WhatsNew,
        //     region: "system",
        //     gridHeight: gridHeight,
        //     gridWidth: gridWidth,
        //     gridStatic: true,
        //     gridX: gridWidth * 0,
        //     gridY: gridHeight * gridRow
        // });

        // gridWidth = 6;
        // widgets.push({
        //     canDismiss: false,
        //     dashboardID: dashboardConfig.id,
        //     id: WidgetIDConstants.quickActions as string,
        //     friendlyID: WidgetIDConstants.quickActions as string,
        //     order: widgetOrder++,
        //     type: Enums.Widgets.QuickActions,
        //     region: "system",
        //     gridHeight: gridHeight,
        //     gridWidth: gridWidth,
        //     gridStatic: true,
        //     gridX: gridWidth * 0,
        //     gridY: gridHeight * gridRow,
        //     heightPX: WidgetHeights.fullHeight
        // });

        // gridWidth = 6;
        // widgets.push({
        //     canDismiss: false,
        //     dashboardID: dashboardConfig.id,
        //     id: WidgetIDConstants.advertJobs as string,
        //     friendlyID: WidgetIDConstants.advertJobs as string,
        //     order: widgetOrder++,
        //     type: Enums.Widgets.AdvertJobs,
        //     region: "system",
        //     gridHeight: gridHeight,
        //     gridWidth: gridWidth,
        //     gridStatic: true,
        //     gridX: (12 - gridWidth) * 1,
        //     gridY: gridHeight * gridRow,
        //     heightPX: WidgetHeights.fullHeight
        // });

        // gridRow++;



        // gridWidth = 6;
        // widgets.push({
        //     canDismiss: false,
        //     dashboardID: dashboardConfig.id,
        //     id: WidgetIDConstants.advertInvoices as string,
        //     friendlyID: WidgetIDConstants.advertInvoices as string,
        //     order: widgetOrder++,
        //     type: Enums.Widgets.AdvertInvoices,
        //     region: "system",
        //     gridHeight: gridHeight,
        //     gridWidth: gridWidth,
        //     gridStatic: true,
        //     gridX: (12 - gridWidth) * 1,
        //     gridY: gridHeight * gridRow,
        //     heightPX: WidgetHeights.fullHeight
        // });


        // gridWidth = 6;
        // widgets.push({
        //     canDismiss: false,
        //     dashboardID: dashboardConfig.id,
        //     id: WidgetIDConstants.advertJobsAgeing as string,
        //     friendlyID: WidgetIDConstants.advertJobsAgeing as string,
        //     order: widgetOrder++,
        //     type: Enums.Widgets.AdvertJobsAgeing,
        //     region: "system",
        //     gridHeight: gridHeight,
        //     gridWidth: gridWidth,
        //     gridStatic: true,
        //     gridX: gridWidth * 0,
        //     gridY: gridHeight * gridRow,
        //     heightPX: WidgetHeights.fullHeight
        // });

        gridRow++;
        gridWidth = 8;
        widgets.push({
            canDismiss: true,
            dashboardID: dashboardConfig.id,
            id: WidgetIDConstants.jobsAgeing as string,
            friendlyID: WidgetIDConstants.jobsAgeing as string,
            order: widgetOrder++,
            type: Enums.Widgets.JobsAgeing,
            region: "system",
            gridHeight: gridHeight,
            gridWidth: gridWidth,
            gridStatic: true,
            gridX: gridWidth * 0,
            gridY: gridHeight * gridRow,
            heightPX: WidgetHeights.fullAndHalfHeight,
            requiredPermission: Enums.PermissionName.Job,
            label: "Job Ageing",
            gridRow
        });

        widgets = widgets.filter(x => !x.requiredPermission || PS.hasPermission(x.requiredPermission));

        gridWidth = 4;
        widgets.push({
            canDismiss: true,
            dashboardID: dashboardConfig.id,
            id: WidgetIDConstants.commentsLatest as string,
            friendlyID: WidgetIDConstants.commentsLatest as string,
            order: widgetOrder++,
            type: Enums.Widgets.CommentsLatest,
            region: "system",
            gridHeight: gridHeight,
            gridWidth: gridWidth,
            gridStatic: true,
            gridX: gridWidth * 0,
            gridY: gridHeight * gridRow,
            heightPX: WidgetHeights.fullAndHalfHeight,
            label: "Comments",
            gridRow
        });

        if(PS.hasPermission(Enums.PermissionName.Appointment)) {
            gridRow++;
            gridWidth = 12;

            widgets.push({
                canDismiss: true,
                dashboardID: dashboardConfig.id,
                id: WidgetIDConstants.dailyStatAppointment as string,
                friendlyID: WidgetIDConstants.dailyStatAppointment as string,
                order: widgetOrder++,
                type: Enums.Widgets.AppointmentsTile,
                region: "system",
                gridHeight: 0,
                gridWidth: gridWidth,
                gridStatic: true,
                gridX: gridWidth * 0,
                gridY: gridHeight * gridRow,
                heightPX: WidgetHeights.fullHeight,
                label: "Today's Appointments",
                gridRow
            });

        }

        dashboardConfig.widgets = widgets;
    }

    const setupWidgets = async () => {

        let dashPageConfig: DashboardPageConfig | null = UCS.getSCDashboardPageConfig(getFiltersConfigValue());
        if (!dashPageConfig || dashPageConfig.dashboards.length === 0) {
            dashPageConfig = new DashboardPageConfig();
            dashPageConfig.dashboards.push(new DashboardConfig());
        }

        // setup landing dashboard
        setupLanding(dashPageConfig.dashboards[0]);

        for (let i = 1; i < dashPageConfig.dashboards.length; i++) {
            let dashboardConfig = dashPageConfig.dashboards[i];

            let widgets: WidgetConfig[] = [];

            let allowedWidgets = dashboardConfig.widgets.filter(x => !x.requiredPermission || PS.hasPermission(x.requiredPermission));
            if (allowedWidgets.length > 0) {
                widgets.push(...allowedWidgets);
            }

            dashboardConfig.widgets = widgets;
        }

        setDashboardPageConfig(dashPageConfig);
        saveFiltersConfig();
        refreshGridLayout();
        windowResize();
    }

    const [store, setStore] = useState<any>(null)

    // console.log('store', store)

    const renderWidget = (widget: WidgetConfig, key) => {

        switch (widget?.type) {
            case Enums.Widgets.AppointmentsTile:
                return (<CardedAppointmentWidget storeID={store?.ID} key={key} onDismiss={widget.canDismiss ? (() => dismissWidget(widget)) as any : undefined} />)
            case Enums.Widgets.YouTube:
                return (<SCWidgetYoutube externalVideoID={YOUTUBE_VIDEO_ID as any} onDismiss={widget.canDismiss ? (() => dismissWidget(widget)) as any : undefined} key={key} widget={widget} />);
            case Enums.Widgets.Carousel:
                return (<SCWidgetCarousel onDismiss={widget.canDismiss ? (() => dismissWidget(widget)) as any : undefined} key={key} widget={widget} />);
            // case Enums.Widgets.Checklist:
            case Enums.Widgets.JobWizard:
                // Replaced the legacy "Get Started" checklist with the new Create Job widget
                return (<SCWidgetCreateJob key={key} widget={widget} onDismiss={widget.canDismiss ? (() => dismissWidget(widget)) : undefined} />);
            //case Enums.Widgets.WhatsNew:
            // return (<SCWidgetWhatsNew key={key} widget={widget} accessStatus={accessStatus} />);
            // return (<SCWidgetWhatsNewCMS key={key} widget={widget} onDismiss={widget.canDismiss ? (() => dismissWidget(widget)) : undefined}  testing={testing} accessStatus={accessStatus} />);
            //return (<SCWidgetWhatsNew2 key={key} widget={widget} onDismiss={widget.canDismiss ? (() => dismissWidget(widget)) : undefined}  testing={testing} accessStatus={accessStatus} />);
            case Enums.Widgets.JobsSummary:
                return (<ScWidgetJobStatusPeriodCounts storeID={store?.ID} useGraph={false} key={key} widget={widget} onDismiss={widget.canDismiss ? (() => dismissWidget(widget)) : undefined} />);
            case Enums.Widgets.YoureIn:
                return (<SCWidgetYoureIn key={key} widget={widget} accessStatus={accessStatus} onDismiss={widget.canDismiss ? () => dismissWidget(widget) : undefined} />);
            case Enums.Widgets.JobsTracker:
                return (<SCJobTrackerWidget key={key} widget={widget} onDismiss={widget.canDismiss ? () => dismissWidget(widget) : undefined} />);
            case Enums.Widgets.AdvertJobsAgeing:
                return (<SCWidgetAdvertJobsAgeing key={key} widget={widget} onDismiss={widget.canDismiss ? () => dismissWidget(widget) : undefined} />);
            case Enums.Widgets.AdvertJobs:
                return (<SCWidgetAdvertJobs key={key} widget={widget} onDismiss={widget.canDismiss ? () => dismissWidget(widget) : undefined} />);
            case Enums.Widgets.AdvertInvoices:
                return (<SCWidgetAdvertInvoices key={key} widget={widget} onDismiss={widget.canDismiss ? () => dismissWidget(widget) : undefined} />);
            case Enums.Widgets.QuickActions:
                return (<SCWidgetQuickActions key={key} widget={widget} onDismiss={widget.canDismiss ? () => dismissWidget(widget) : undefined} />);
            case Enums.Widgets.DailyStats:
                return (<ScWidgetDailyStats key={key} widget={widget} onDismiss={widget.canDismiss ? () => dismissWidget(widget) : undefined} />);
            case Enums.Widgets.JobsAgeing:
                return (<SCWidgetJobsAgeing storeID={store?.ID} key={key} widget={widget} onDismiss={widget.canDismiss ? () => dismissWidget(widget) : undefined} useGraph={true} />);
            case Enums.Widgets.CommentsLatest:
                return (<ScWidgetCommentsLatest storeId={store?.ID} key={key} widget={widget} onDismiss={widget.canDismiss ? () => dismissWidget(widget) : undefined} />);
            case Enums.Widgets.QueryStatus:
                return (<SCWidgetQueryStatus storeID={store?.ID} key={key} widget={widget} onDismiss={widget.canDismiss ? () => dismissWidget(widget) : undefined} />);
            case Enums.Widgets.QuoteStatus:
                return (<SCWidgetQuoteStatus storeID={store?.ID} key={key} widget={widget} onDismiss={widget.canDismiss ? () => dismissWidget(widget) : undefined} />);
            case Enums.Widgets.InvoiceStatus:
                return (<SCWidgetInvoiceStatus storeID={store?.ID} key={key} widget={widget} onDismiss={widget.canDismiss ? () => dismissWidget(widget) : undefined} />);
            case Enums.Widgets.Feedback:
                return (<SCWidgetFeedback storeID={store?.ID} key={key} widget={widget} onDismiss={widget.canDismiss ? () => dismissWidget(widget) : undefined} />);
            case Enums.Widgets.WelcomeBar:
                return (<SCWidgetWelcomeBar
                    key={key}
                    widget={widget}
                    onDismiss={widget.canDismiss ? () => dismissWidget(widget) : undefined}
                    dashboardConfig={dashboardPageConfig?.dashboards[0]}
                    updateDashboardConfig={(config) => {
                        var temp = { ...dashboardPageConfig };
                        temp.dashboards[0] = config;
                        setDashboardPageConfig(temp);
                        saveFiltersConfig();
                    }}
                    onStoreSelected={setStore}
                />);
            case Enums.Widgets.Feedbear:
                return (<SCWidgetFeedbear key={key} widget={widget} onDismiss={widget.canDismiss ? () => dismissWidget(widget) : undefined} />);

            default:
                return (<></>);
        }
    }

    function onResize(arg: any) {
        console.log(arg);
    }

    const systemWidgetsToRender = useMemo(() => {
        let dashboardPageConfigValue = { ...getDashboardPageConfigValue() };
        let dashboardConfig = dashboardPageConfigValue.dashboards.find(x => x.id === activeTab);
        if (!dashboardConfig) return [];
        let widgets = dashboardConfig.widgets.filter(x => x.region === "system" && !dashboardConfig?.dismissedIDs.includes(x.id));
        // .sort((a, b) => a.order - b.order);
        return widgets;
    }, [dashboardPageConfig, activeTab]);

    const userWidgetsToRender = useMemo(() => {
        let dashboardPageConfigValue = { ...getDashboardPageConfigValue() };
        let dashboardConfig = dashboardPageConfigValue.dashboards.find(x => x.id === activeTab);
        if (!dashboardConfig) return [];
        let widgets = dashboardConfig.widgets.filter(x => x.region === "user" && !dashboardConfig?.dismissedIDs.includes(x.id));
        // .sort((a, b) => a.order - b.order);
        return widgets;
    }, [dashboardPageConfig, activeTab]);

    const dashboardTabs = useMemo(() => {
        let dashboardPageConfigValue = { ...getDashboardPageConfigValue() };

        let tabs = {};
        dashboardPageConfigValue.dashboards.forEach(dash => {
            tabs[dash.id] = {
                label: dash.name,
                access: true
            };
        });

        tabs["Add"] = {
            label: "+",
            access: true
        };

        return tabs;

    }, [dashboardPageConfig]);

    const onDrop = (layout, layoutItem: Layout, _event) => {
        let widget = parseInt(_event.dataTransfer.getData("widget"));
        addWidget(widget, layoutItem);
    };

    const addWidget = (widget: number, layoutItem: Layout) => {
        let dashPageConfig = { ...getDashboardPageConfigValue() };

        let dashboard = dashPageConfig.dashboards.find(x => x.id === activeTab);

        if (!dashboard) return;

        dashboard.widgets.push({
            canDismiss: true,
            dashboardID: dashboard.id,
            friendlyID: "test",
            id: helper.newGuid(),
            order: 0,
            region: "user",
            type: widget,
            gridHeight: 2,
            gridStatic: false,
            gridWidth: 4,
            gridX: layoutItem.x,
            gridY: layoutItem.y,
            heightPX: WidgetHeights.fullHeight,
            label: "test",
            gridRow: 1
        });

        setDashboardPageConfig(dashPageConfig);
        saveFiltersConfig();
        setWidgetDrawerOpen(false);
    };


    return (<>
        {/*<div className="dashboard-container">*/}
        <div className="dashboard-container" style={{marginInline: 0}}>

            {/* <Tabs color={'scBlue'} value={activeTab} onChange={updateActiveTab}

                styles={(theme) => ({
                    tab: {
                        zIndex: 5,
                        marginBottom: -1,
                        paddingBottom: 12,
                        paddingInline: 15,
                        color: theme.colors.gray[5],
                        ':hover': {
                            color: theme.colors.gray[7],
                            backgroundColor: 'transparent',
                            borderBottomColor: 'transparent'
                        },
                        '&[dataActive]': {
                            borderBottomWidth: 2,
                            color: theme.colors.scBlue[5]
                        },
                    },

                    tabLabel: {
                        weight: 600,
                        marginBottom: 5,
                    },
                    tabsList: {
                        display: 'flex',
                        borderBottom: 0
                    },
                })}
            >
                <Tabs.List mb={0} pb={0}>
                    {
                        Object.entries(dashboardTabs).map(
                            ([tabName, tabData]) => <Tabs.Tab value={tabName} key={tabName + 'tab'}>{(tabData as any).label}</Tabs.Tab>
                        )
                    }
                </Tabs.List>
            </Tabs> */}

            {/*<div ref={dashRef as any} className="dashboard-grid-container">*/}
            <ScrollArea.Autosize ref={dashRef as any} h={`calc(100vh - 42px${((messageBarContext as any)?.isActive ? ` - ${constants.messageBarMargin}px` : "")})`} offsetScrollbars>
                <Box ml={{base: 10, md: 25}} mr={{base: 0, md: 14}} mt={25} pb={constants.chatWidgetSafeArea}>
                    {
                        systemWidgetsToRender && systemWidgetsToRender.length > 0 && <>
                            <Grid columns={12} gutter={'sm'} mb={'xs'}>
                                {systemWidgetsToRender.filter(x => x.gridRow === 0).map((widget: WidgetConfig, idx: number) => {
                                    return (
                                        <Grid.Col key={idx * 100}
                                                  mih={100}
                                                  order={widget.order}
                                                  span={{
                                                      base: 12,
                                                      xs: widget.gridWidth === 3 ? 6 : widget.gridWidth === 6 ? 6 : 12,
                                                      sm: widget.gridWidth === 3 ? 6 : widget.gridWidth === 6 ? 6 : 12,
                                                      md: widget.gridWidth === 3 ? 4 : widget.gridWidth === 4 ? 6 : widget.gridWidth < 12 ? 6 : 12,
                                                      lg: widget.gridWidth === 3 ? 4 : widget.gridWidth === 4 ? 6 : widget.gridWidth < 12 ? 6 : widget.gridWidth,
                                                      xl: widget.gridWidth
                                                  }}
                                        >
                                            {renderWidget(widget, idx)}
                                        </Grid.Col>
                                    );
                                })}
                            </Grid>
                            {/*<ScrollArea.Autosize mah={'calc(100vh - 167px)'}
                                         offsetScrollbars
                                         scrollbarSize={10}
                                         scrollHideDelay={500}
                                         type={'hover'}
                    >*/}
                            <Grid columns={12} gutter={'sm'} mb={'xs'}>
                                {systemWidgetsToRender.filter(x => x.gridRow === 1).map((widget: WidgetConfig, idx: number) => {
                                    return (
                                        <Grid.Col key={idx * 100}
                                                  mih={100}
                                                  order={widget.order}
                                                  span={{
                                                      base: 12,
                                                      xs: widget.gridWidth === 3 ? 6 : widget.gridWidth === 6 ? 6 : 12,
                                                      sm: widget.gridWidth === 3 ? 6 : widget.gridWidth === 6 ? 6 : 12,
                                                      md: widget.gridWidth === 3 ? 4 : widget.gridWidth === 4 ? 6 : widget.gridWidth < 12 ? 6 : 12,
                                                      lg: widget.gridWidth === 3 ? 4 : widget.gridWidth === 4 ? 6 : widget.gridWidth < 12 ? 6 : widget.gridWidth,
                                                      xl: widget.gridWidth
                                                  }}
                                        >
                                            {renderWidget(widget, idx)}
                                        </Grid.Col>
                                    );
                                })}
                            </Grid>
                            <Grid columns={12} gutter={'sm'} mb={'xs'}>
                                {systemWidgetsToRender.filter(x => x.gridRow !== 0 && x.gridRow !== 1).map((widget: WidgetConfig, idx: number) => {
                                    return (
                                        <Grid.Col key={idx * 100}
                                                  mih={100}
                                                  order={widget.order}
                                                  span={{
                                                      base: 12,
                                                      xs: widget.gridWidth === 3 ? 6 : widget.gridWidth === 6 ? 6 : 12,
                                                      sm: widget.gridWidth === 3 ? 6 : widget.gridWidth === 6 ? 6 : 12,
                                                      md: widget.gridWidth === 3 ? 4 : widget.gridWidth === 4 ? 6 : widget.gridWidth < 12 ? 6 : 12,
                                                      lg: widget.gridWidth === 3 ? 4 : widget.gridWidth === 4 ? 6 : widget.gridWidth < 12 ? 6 : widget.gridWidth,
                                                      xl: widget.gridWidth
                                                  }}
                                        >
                                            {renderWidget(widget, idx)}
                                        </Grid.Col>
                                    );
                                })}
                            </Grid>
                            {/*</ScrollArea.Autosize>*/}

                        </>
                    }

                </Box>

                {/*{systemWidgetsToRender && systemWidgetsToRender.length > 0 ? <>
                    <Grid columns={12} gutter={'sm'} w={"calc(100%)"}>
                        {systemWidgetsToRender.map((widget: WidgetConfig, idx: number) => {
                            return (
                                <Grid.Col key={idx * 100}
                                    mih={100}
                                    order={widget.order}
                                    span={{
                                        xs: 12,
                                        sm: widget.gridWidth === 3 ? 6 : widget.gridWidth === 6 ? 6 : 12,
                                        md: widget.gridWidth === 3 ? 4 : widget.gridWidth === 4 ? 6 : widget.gridWidth === 6 ? 6 : 12,
                                        lg: widget.gridWidth === 3 ? 4 : widget.gridWidth === 4 ? 6 : widget.gridWidth < 12 ? 6 : widget.gridWidth,
                                        xl: widget.gridWidth
                                    }}
                                >
                                    {renderWidget(widget, idx)}
                                </Grid.Col>
                            );
                        })}
                    </Grid>
                </> : null}*/}

                <div className="layout">
                    <ResponsiveGridLayout
                        className="layout"
                        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
                        // cols={{ lg: 12, md: 12, sm: 12, xs: 12, xxs: 12 }}
                        onLayoutChange={layoutChanged}
                        onResize={onResize}
                        onDrop={onDrop}
                        isDroppable={true}
                    >

                        {userWidgetsToRender.map((widget: WidgetConfig, idx: number) => {
                            return (<div className="widget" key={widget.id} data-grid={WidgetConfig.getGridSettings(widget)} style={{ cursor: widget.gridStatic ? "initial" : "grab" }}>
                                <div className="widget-content">
                                    {renderWidget(widget, idx)}
                                </div>
                            </div>)
                        })}

                    </ResponsiveGridLayout>
                </div>

                {widgetDrawerOpen && <div className="widget-drawer">

                    <div
                        className="droppable-element"
                        draggable={true}
                        unselectable="on"
                        onDragStart={e => {
                            e.dataTransfer.setData("text/plain", "");
                            e.dataTransfer.setData("widget", Enums.Widgets.JobsSummary.toString());
                        }}
                    >
                        JobsSummary Element (Drag me!)
                    </div>

                    <input type="button" onClick={() => setWidgetDrawerOpen(false)} value={"Close"} />

                </div>}


                {testing && <>
                    <input type="button" onClick={clearDismissed} value={"Show Dismissed"} />
                    <input type="button" onClick={resetWidgets} value={"Reset Widgets"} />
                    {activeTab !== "Home" && <input type="button" onClick={deleteDashboard} value={"Delete Dashboard"} />}
                    {activeTab !== "Home" && <input type="button" onClick={() => setWidgetDrawerOpen(true)} value={"Find Widget"} />}
                    <input type="button" onClick={() => setDrawerOpened(true)} value={"Open Drawer"} />
                </>}


                {/* <div className={"drawer" + (drawerOpened ? " opened" : "")} onClick={() => !drawerOpened && setDrawerOpened(true)} >
                    <div className="drawer-content">

                        <div style={{ width: 400, height: 200 }}>
                            testing
                        </div>

                        <CloseButton style={{
                            position: 'absolute',
                            right: 4,
                            top: 4
                        }}
                            onClick={() => setDrawerOpened(false)}
                        />
                    </div>
                </div> */}


                <Drawer title={"Manage Widgets"}
                        opened={drawerOpened}
                        onClose={() => setDrawerOpened(false)}
                        size={'md'}
                        position={'right'}>

                    {dashboardPageConfig.dashboards.find(x => x.id === activeTab)?.widgets.map((widget, id) => {
                        return <div key={'dbPage' + id}>{widget.friendlyID}</div>
                    })}

                </Drawer>

            </ScrollArea.Autosize>
        </div>



        <style jsx>{`

            .dashboard-container {
                padding: 0 ;
                width: 100%;
                position: relative;
                // height: 100%;
                // width: calc(100% - 1rem);
                // height: calc(100% - 1rem);
            }

            .dashboard-tab-button {
                padding: 0.5rem 1rem;
                background: red;
                display: inline-block;
                cursor: pointer;
            }

            .dashboard-tab-button:hover {
                background: white;
            }

            .dashboard-grid-container {
                margin-top: 0.5rem;
                height: ${dashHeight};
                overflow: auto;
            }

            .widget {
                padding-right: 0.4rem;
            }

            .widget-content {
                padding: 0;
                overflow: hidden;
                border-radius: 4px;
                border-radius: 4px;
                box-shadow: ${shadows.widgetCard};
            }

            .layout {
                background: ${widgetDrawerOpen ? "#00000033;" : "#00000000;"}
            }

            .droppable-element {
                border: 1px solid black;
                background: red;
                padding: 0.5rem;
                width: fit-content;
            }

            .drawer {
                position: absolute;
                top: 16px;
                right: 16px;
                background: ${colors.bluePrimary};
                border-top-left-radius: 4px;
                border-bottom-left-radius: 4px;
                width: 12px;
                height: 160px;
                transition: 0.25s;
                cursor: pointer;
            }

            .drawer:hover {
                background: ${colors.bluePrimaryLight};
            }

            .drawer > .drawer-content {
                opacity: 0;
                position: relative;
                width: 100%;
                height: 100%;
            }

            .drawer.opened {
                background: ${colors.background};
                transition: 0.25s;
                width: fit-content;
                max-width: 50vw;
                height: fit-content;
                max-height: 50vh;
                overflow: auto;
                box-shadow: ${shadows.widgetCard};
                border: 0.0625rem solid #dee2e6;
                padding: 0.5rem;
                z-index: 10;
            }

            .drawer.opened > .drawer-content {
                opacity: 1;
                transition: 0.1s;
                transition-delay: 0.25s;
            }

        `}</style>
    </>);
}

export default DashboardLayout;