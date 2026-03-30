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

const CHART_ID = "echart-advert-jobs";

const SCWidgetAdvertJobs: FC<{
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
            const option: EChartsOption = {
                title: {
                    text: '',
                    subtext: '',
                    left: 'center'
                },
                tooltip: {
                    trigger: 'item'
                },
                legend: {
                    orient: 'vertical',
                    left: 'left',
                    top: "center"
                },
                series: [
                    {
                        name: 'Job Statuses',
                        type: 'pie',
                        radius: '90%',
                        center: ['75%', '50%'],
                        data: [
                            { value: 248, name: 'Job Booked' },
                            { value: 435, name: 'On Way to Site' },
                            { value: 765, name: 'Work in Progress' },
                            { value: 154, name: 'Work Completed' },
                            { value: 390, name: 'Invoiced and Closed' }
                        ],
                        emphasis: {
                            itemStyle: {
                                shadowBlur: 10,
                                shadowOffsetX: 0,
                                shadowColor: 'rgba(0, 0, 0, 0.5)'
                            },
                        },
                        label: {
                            show: true,
                            formatter: (parms: any) => {
                                return parms.value as any;
                            } 
                        }
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

export default SCWidgetAdvertJobs;

