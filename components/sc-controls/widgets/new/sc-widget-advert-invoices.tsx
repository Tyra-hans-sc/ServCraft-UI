import { WidgetConfig } from "@/PageComponents/Dashboard/DashboardModels";
import { FC, useEffect, useState, useRef } from "react";
import type { ECharts, EChartsOption } from 'echarts';
import SCWidgetCard from "./sc-widget-card";
import { Button, Title } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import SCWidgetTitle from "./sc-widget-title";
import SCWatermark from "../../misc/sc-watermark";

const CHART_ID = "echart-advert-invoices";

const SCWidgetAdvertInvoices: FC<{
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

            const data: number[] = [];
            for (let i = 0; i < 3; ++i) {
                data.push(Math.round(Math.random() * 200));
            }
            const option: EChartsOption = {
                grid: {
                    top: '6',
                    right: '65',
                    bottom: '17',
                    left: '65',
                },
                xAxis: {
                    max: 'dataMax'
                },
                yAxis: {
                    type: 'category',
                    data: ['Draft', 'Approved', 'Paid'],
                    inverse: true,
                    animationDuration: 300,
                    animationDurationUpdate: 300,
                    max: 2 // only the largest 3 bars will be displayed
                },
                series: [
                    {
                        realtimeSort: true,
                        name: '',
                        type: 'bar',
                        data: data,
                        label: {
                            show: true,
                            position: 'right',
                            valueAnimation: true
                        }
                    }
                ],
                legend: {
                    show: true
                },
                animationDuration: 0,
                animationDurationUpdate: 500,
                animationEasing: 'linear',
                animationEasingUpdate: 'linear'
            };

            function run() {
                if (!chartRef.current) return;
                for (var i = 0; i < data.length; ++i) {
                    if (Math.random() > 0.9) {
                        data[i] += Math.round(Math.random() * 50);
                    } else {
                        data[i] += Math.round(Math.random() * 20);
                    }
                }
                chartRef.current.setOption({
                    series: [
                        {
                            type: 'bar',
                            data,
                            itemStyle: {
                                color: function (param: any) {
                                    return param.dataIndex === 0 ? "#FAC858" : param.dataIndex === 1 ? "#5470C6" : param.dataIndex === 2 ? "#91CC75" : "black";
                                }
                            }
                        }
                    ]
                });
            }

            setTimeout(function () {
                run();
            }, 0);

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
            <SCWidgetTitle title="Try out our new widgets!"/>
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

export default SCWidgetAdvertInvoices;