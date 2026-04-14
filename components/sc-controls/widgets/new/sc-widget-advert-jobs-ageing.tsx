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

const CHART_ID = "echart-advert-jobs-ageing";

const SCWidgetAdvertJobsAgeing: FC<{
    widget: WidgetConfig
    onDismiss: (() => void) | undefined
    key: any
}> = ({ widget, onDismiss, key }) => {

    const chartRef = useRef<ECharts | null>(null);

    useEffect(() => {
        let mounted = true;

        const initChart = async () => {
            const echarts = await import('echarts');
            const chartDom = document.getElementById(CHART_ID);
            if (!chartDom || !mounted) return;
            
            chartRef.current = echarts.init(chartDom);
            let app: any = {};

            const posList = [
                'left',
                'right',
                'top',
                'bottom',
                'inside',
                'insideTop',
                'insideLeft',
                'insideRight',
                'insideBottom',
                'insideTopLeft',
                'insideTopRight',
                'insideBottomLeft',
                'insideBottomRight'
            ] as const;

            app.configParameters = {
                rotate: {
                    min: -90,
                    max: 90
                },
                align: {
                    options: {
                        left: 'left',
                        center: 'center',
                        right: 'right'
                    }
                },
                verticalAlign: {
                    options: {
                        top: 'top',
                        middle: 'middle',
                        bottom: 'bottom'
                    }
                },
                position: {
                    options: posList.reduce(function (map, pos) {
                        map[pos] = pos;
                        return map;
                    }, {} as Record<string, string>)
                },
                distance: {
                    min: 0,
                    max: 100
                }
            };

            type BarLabelOption = NonNullable<echarts.BarSeriesOption['label']>;

            app.config = {
                rotate: 90,
                align: 'left',
                verticalAlign: 'middle',
                position: 'insideBottom',
                distance: 15,
                onChange: function () {
                    if (!chartRef.current) return;
                    const labelOption: BarLabelOption = {
                        rotate: app.config.rotate as BarLabelOption['rotate'],
                        align: app.config.align as BarLabelOption['align'],
                        verticalAlign: app.config
                            .verticalAlign as BarLabelOption['verticalAlign'],
                        position: app.config.position as BarLabelOption['position'],
                        distance: app.config.distance as BarLabelOption['distance']
                    };
                    chartRef.current.setOption<echarts.EChartsOption>({
                        series: [
                            {
                                label: labelOption
                            },
                            {
                                label: labelOption
                            },
                            {
                                label: labelOption
                            },
                            {
                                label: labelOption
                            }
                        ]
                    });
                }
            };

            const option: EChartsOption = {
                grid: {
                    top: '30',
                    right: '65',
                    bottom: '20',
                    left: '40',
                },
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        type: 'shadow'
                    }
                },
                legend: {
                    data: ['Close Job', 'Incident Reported', 'Quality Check Job Closed', 'Work Completed', 'Work In Progress']
                },
                toolbox: {
                    show: true,
                    orient: 'vertical',
                    left: 'right',
                    top: 'center',
                    feature: {
                        mark: { show: true },
                        dataView: { show: true, readOnly: false },
                        magicType: { show: true, type: ['line', 'bar', 'stack'] },
                        restore: { show: true },
                        saveAsImage: { show: true }
                    }
                },
                xAxis: [
                    {
                        type: 'category',
                        axisTick: { show: false },
                        data: ['One Week', 'Two Weeks', 'Three Weeks', 'Four Weeks', 'Longer']
                    }
                ],
                yAxis: [
                    {
                        type: 'value'
                    }
                ],
                series: [
                    {
                        name: 'Incident Reported',
                        type: 'bar',
                        emphasis: {
                            focus: 'series'
                        },
                        data: [39, 30, 9, 1, 0]
                    },
                    {
                        name: 'Work In Progress',
                        type: 'bar',
                        emphasis: {
                            focus: 'series'
                        },
                        data: [24, 18, 9, 3, 0]
                    },
                    {
                        name: 'Work Completed',
                        type: 'bar',
                        emphasis: {
                            focus: 'series'
                        },
                        data: [24, 10, 2, 0, 0]
                    },
                    {
                        name: 'Quality Check Job Closed',
                        type: 'bar',
                        emphasis: {
                            focus: 'series'
                        },
                        data: [17, 3, 2, 0, 5]
                    },
                    {
                        name: 'Close Job',
                        type: 'bar',
                        barGap: 0,
                        emphasis: {
                            focus: 'series'
                        },
                        data: [10, 30, 44, 49, 80]
                    }
                ]
            };

            chartRef.current.setOption(option);
        };

        initChart();

        const onResize = () => {
            chartRef.current?.resize();
        };

        window.addEventListener("resize", onResize);

        return () => {
            mounted = false;
            window.removeEventListener("resize", onResize);
            chartRef.current?.dispose();
        };
    }, []);

    return (<>
        <SCWidgetCard onDismiss={undefined} height={widget.heightPX as any}>
            <SCWidgetTitle title="Try out our new widgets!" />
            <div id={CHART_ID} style={{ height: widget.heightPX - 100, width: "100%", marginTop: 8, marginBottom: 8 }}>
            </div>


            <div style={{ position: "absolute", top: 12, right: 12 }}>
                <Button color={'scBlue'} rightSection={<IconPlus size={14} />} style={{ float: "right" }}>
                    Build my own dashboard
                </Button>
            </div>
            <SCWatermark />
        </SCWidgetCard>
    </>);
};

export default SCWidgetAdvertJobsAgeing;