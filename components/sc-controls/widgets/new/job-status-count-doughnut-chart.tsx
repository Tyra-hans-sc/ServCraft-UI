import {FC, useEffect, useMemo, useRef, useState} from "react";
import {Box} from "@mantine/core";
import type { ECharts, EChartsOption } from 'echarts';

const coloursForClasses = {
    Red: '#FC2E50',
    Orange: '#F26101',
    Yellow: '#FFC940',
    Green: '#51CB68',
    Blue: '#5A85E1',
    Purple: '#735AE1',
    Black: '#4F4F4F',
    Grey: '#828282',
    LightGrey: '#BDBDBD',
}

const JobStatusCountDoughnutChart: FC<{
    data: {JobStatus: {color: string; value: string;}; Key: string; Value: number;}[],
    label: string,
    show?: boolean
}> = ({data, ...props}) => {

    const pieChartHalfDoughnut = useRef<ECharts | null>(null);
    const [isChartReady, setIsChartReady] = useState(false);

    useEffect(() => {
        let mounted = true;

        const initChart = async () => {
            const echarts = await import('echarts');
            const echart = document.getElementById('echart');
            if (echart && mounted) {
                pieChartHalfDoughnut.current = echarts.init(echart);
                setIsChartReady(true);
            }
        };

        initChart();

        return () => {
            mounted = false;
            pieChartHalfDoughnut.current?.dispose();
        };
    }, []);


    const chartOption: EChartsOption = useMemo(() => {
        const tooManyLabels = data.length > 8
        return {
            tooltip: {
                trigger: 'item',
                confine:
                    true,
                textStyle:
                    {
                        fontWeight: 600
                    }
            },
            legend: {
                show: !tooManyLabels,
                formatter: (text: string) => (text.length > 20 ? text.substring(0, 20) + '...' : text),
                // borderCap: 'butt',
                top: '-1%',
                right:
                    '5%',
                orient:
                    'vertical'
            },
            series: [
                {

                    name: `${props.label}`,
                    type: 'pie',
                    radius: ['0%', '80%'],
                    center: [tooManyLabels ? '50%' : '25%', '43%'],
                    avoidLabelOverlap: true,
                    padAngle: 5,
                    // Change the angles for semi circle
                    /*startAngle: 90,
                    endAngle: -270,
                    clockwise: true,*/
                    data: data.map(x => ({
                        value: x.Value,
                        name: x.JobStatus.value,
                        ...(x.JobStatus.color ? {
                            itemStyle: {
                                color: coloursForClasses[x.JobStatus.color as keyof typeof coloursForClasses] || x.JobStatus.color, // assign color
                            }
                        } : {}),
                        label: {
                            show: false,
                            position: 'center'
                        },
                        emphasis: {
                            label: {
                                show: true,
                                fontSize: 14,
                                fontWeight: 'bold'
                            }
                        },
                        labelLine: {
                            show: true
                        },
                    }))
                }
            ]
        }
    }, [data, props.label]);

    useEffect(() => {
        if(pieChartHalfDoughnut.current && isChartReady) {
            pieChartHalfDoughnut.current.setOption(chartOption)
        }
    }, [chartOption, isChartReady]);


    return <>
        {
            <Box pos={'relative'} w={'100%'} mih={200} >
                <Box id={'echart'} maw={'100%'} mih={200} w={380} pos={'absolute'} />
            </Box>
        }
    </>
}

export default JobStatusCountDoughnutChart