import { WidgetConfig } from "@/PageComponents/Dashboard/DashboardModels";
import { FC, useEffect, useState, useRef } from "react";
import type { ECharts, EChartsOption } from 'echarts';
import SCWidgetCard from "./sc-widget-card";
import { Button, Title } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import Link from "next/link";
import helper from "@/utils/helper";
import SCWidgetTitle from "./sc-widget-title";
import SCWatermark from "../../misc/sc-watermark";
import Fetch from "@/utils/Fetch";
import SCRadioButtonGroup from "../../form-controls/sc-radio-button-group";
import SCRadioButton from "../../form-controls/sc-radio-button";
import { colors } from "@/theme";

const CHART_ID = "echart-job-status-stats";
const localStorageKey = "SCWJSS";

interface JobStatusStatsWidgetRequest {
    Period: number
}

interface JobStatusStatsWidgetResponse {
    Statuses: JobStatusStatsWidgetResponseLine[]
    TotalCount: number
}

interface JobStatusStatsWidgetResponseLine {
    JobStatus: string
    Count: number
}

const SCWidgetJobStatusStats: FC<{
    widget: WidgetConfig
    onDismiss: (() => void) | undefined
    key: any
}> = ({ widget, onDismiss, key }) => {

    const [chartData, setChartData] = useState<JobStatusStatsWidgetResponse>();
    const [period, setPeriod] = useState(0);

    const getLocalData: () => JobStatusStatsWidgetRequest = () => {
        if (typeof window !== undefined) {
            let localData = window.localStorage.getItem(localStorageKey);
            if (localData) {
                return JSON.parse(localData) as JobStatusStatsWidgetRequest;
            }
        }

        return {
            Period: 1
        };
    };

    const setLocalData = (localData: JobStatusStatsWidgetRequest) => {
        if (typeof window !== undefined) {
            window.localStorage.setItem(localStorageKey, JSON.stringify(localData));
        }

        setPeriod(localData.Period);

        getChartData();
    };

    const updatePeriod = (period: number) => {
        let localData = getLocalData();
        localData.Period = period;
        setLocalData(localData);
    };

    useEffect(() => {
        // this will trigger an initialised local data and get the chart info
        let localData = getLocalData();
        setLocalData(localData);
    }, []);

    const getChartData = async () => {

        let localData = getLocalData();

        let data: JobStatusStatsWidgetResponse = (await Fetch.get({
            url: '/Dashboard/JobStatusStatsWidget',
            params: {
                Period: localData?.Period
            } as JobStatusStatsWidgetRequest,
            apiUrlOverride: null,
            caller: window.location.pathname,
            ctx: null,
            customerID: null,
            signal: null,
            tenantID: null,
            toastCtx: null,
        } as any)) as JobStatusStatsWidgetResponse;

        setChartData(data);
    }



    return (<>
        <SCWidgetCard  height={widget.heightPX as any}>
            <SCWidgetTitle title="Job Status Stats" />

            <div id={CHART_ID} style={{ height: widget.heightPX - 100, width: "calc(100% - 130px)", marginTop: 8, marginBottom: 8, paddingLeft: 130 }}>
                {chartData &&
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Status</th>
                                <th>Count</th>
                                {/* <th>Percent</th> */}
                            </tr>
                        </thead>
                        <tbody>
                            {chartData.Statuses?.map((value, idx) => {
                                return <tr key={idx}>
                                    <td>{value.JobStatus}</td>
                                    <td>{value.Count}</td>
                                    {/* <td>{((value.Count / chartData.TotalCount) * 100).toFixed(1)}%</td> */}
                                </tr>
                            })}
                            <tr key={-1} className="totals">
                                <td>TOTAL</td>
                                <td>{chartData.TotalCount}</td>
                                {/* <td>100%</td> */}
                            </tr>
                        </tbody>
                    </table>}
            </div>
            <div style={{ position: "absolute", left: 16, top: "30%" }}>
                <SCRadioButtonGroup
                    label={null}
                    name={CHART_ID + "_Period"}
                    required={false}
                    hint={null}
                    onChange={e => updatePeriod(parseInt(e.value))}
                    value={period}
                    orientation={"horizontal"}
                >
                    <SCRadioButton
                        disabled={false}
                        key={1}
                        label={"Last Month"}
                        value={1}
                    />
                    <SCRadioButton
                        disabled={false}
                        key={3}
                        label={"3 Months"}
                        value={3}
                    />

                    <SCRadioButton
                        disabled={false}
                        key={6}
                        label={"6 Months"}
                        value={6}
                    />

                    <SCRadioButton
                        disabled={false}
                        key={12}
                        label={"Last Year"}
                        value={12}
                    />
                </SCRadioButtonGroup>
            </div>

        </SCWidgetCard>

        <style jsx>{`

        .data-table {
            border-spacing: 0;
        }

        .data-table thead tr th {
            width: 100%;
            text-align: left;
            background: ${colors.bluePrimary};
            padding: 4px 8px;
            border-radius: 4px;
            color: ${colors.white};
            border: 1px solid ${colors.white};
            white-space: nowrap;
        }

        .data-table tbody tr td {
            width: 100%;
            text-align: left;
            padding: 4px 8px;
            border: 1px solid ${colors.borderGrey};
        }

        .data-table tbody tr:nth-child(even) td {
            background: ${colors.backgroundGrey};
        }

        .data-table tbody tr.totals td {
            background: ${colors.borderGrey};
            font-weight: bold;
        }

        .data-table tbody tr:hover td {
            background: ${colors.borderGrey};
        }


            `}</style>
    </>);
};

export default SCWidgetJobStatusStats;