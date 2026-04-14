import helper from "@/utils/helper";
import * as Enums from "@/utils/enums";

export class DashboardPageConfig {
    dashboards: DashboardConfig[] = [];
}

export class DashboardConfig {
    id: string = helper.newGuid();
    name: string = "New Dashboard";
    widgets: WidgetConfig[] = [];
    dismissedIDs: string[] = [/*WidgetIDConstants.whatsNew, WidgetIDConstants.dailyStatAppointment*/];
    canEdit: boolean = true;
    isHome: boolean = false;
}

export class WidgetConfig {
    id: string = "";
    friendlyID: string = "";
    label: string = "";
    dashboardID: string = "";
    type: number = Enums.Widgets.NotSpecified;
    canDismiss: boolean = true;
    region: "user" | "system" = "user";
    order: number = 0;
    gridX: number = 0;
    gridY: number = 0;
    gridWidth: number = 2;
    gridHeight: number = 2;
    gridStatic: boolean = false;
    gridMinWidth?: number;
    gridMaxWidth?: number;
    gridMinHeight?: number;
    gridMaxHeight?: number;
    requiredPermission?: string;
    widgetSettings?: any = {};
    heightPX: number = 0;
    gridRow: number = 0;

    static getGridSettings: (config: WidgetConfig) => Layout = (config: WidgetConfig) => {
        return {
            i: config.id,
            x: config.gridX,
            y: config.gridY,
            w: config.gridWidth,
            h: config.gridHeight,
            static: config.gridStatic,
            minW: config.gridMinWidth,
            maxW: config.gridMaxWidth,
            minH: config.gridMinHeight,
            maxH: config.gridMaxHeight
        };
    }
}

export interface Layout {
    i: string
    maxH?: number
    maxW?: number
    minH?: number
    minW?: number
    static: boolean
    h: number
    w: number
    x: number
    y: number
}

export const YOUTUBE_VIDEO_ID: string = "bMeTdgffft8";

export enum WidgetIDConstants {
    youreIn = "youreIn",
    youtube = "bMeTdgffft8",
    checklist = "checklist",
    whatsNew = "whatsNew",
    dailyStatJob = "dailyStatJob",
    dailyStatAppointment = "dailyStatAppointment",
    dailyStatQuote = "dailyStatQuote",
    dailyStatPayment = "dailyStatPayment",
    advertJobsAgeing = "advertJobsAgeing",
    jobsAgeing = "jobsAgeing",
    jobStatusStats = "jobStatusStats",
    queryStatus = "queryStatus",
    quoteStatus = "quoteStatus",
    invoiceStatus = "invoiceStatus",
    feedback = "feedback",
    commentsLatest = "commentsLatest",
    welcomeBar = "welcomeBar",
    jobStatusPeriodCounts = "jobStatusPeriodCounts",
    feedbear = "feedbear",
    jobWizard = "jobWizard",
}

export interface DailyStat {
    name: string
    label: string
    data: string
    canAdd: boolean
    icon?: string
}

export enum WidgetHeights {
    fullHeight = 300,
    threeQuarterHeight = 225,
    halfHeight = 150,
    doubleHeight = 600,
    fullAndHalfHeight = 450
}