import { WidgetConfig } from "@/PageComponents/Dashboard/DashboardModels";
import {FC, useEffect, useMemo, useRef, useState} from "react";
import SCWidgetCard from "./sc-widget-card";
import SCWidgetTitle from "./sc-widget-title";
import Fetch from "@/utils/Fetch";
import {
    Box,
    Button,
    Flex,
    Group,
    LoadingOverlay,
    Select,
    Skeleton,
    Table
} from "@mantine/core";
import {
    IconCaretDown,
    IconPlus,
} from "@tabler/icons";
import {useQuery} from "@tanstack/react-query";
import SimpleTable, {SimpleColumnMapping} from "@/PageComponents/SimpleTable/SimpleTable";
import JobStatusService from "@/services/job/job-status-service";
import Link from "next/link";
import Helper from "@/utils/helper";
import { useRouter } from "next/router";
import constants from "@/utils/constants";
import {useLocalStorage} from "@mantine/hooks";

const CHART_ID = "echart-jobs-ageing";
const localStorageKey = "SCWJA";

interface JobAgeingWidgetRequest {
    Period: number,
}

interface JobAgeingWidgetResponse {
    Statuses: JobAgeingWidgetResponseLine[]
}

interface JobAgeingWidgetResponseLine {
    JobStatus: string
    JobStatusID	: string
    Colour: string
    Workflow: string
    WorkflowID	: string
    One: number
    Two: number
    Three: number
    Four: number
    Longer: number
}

const useGraph = false

const getLocalData: () => JobAgeingWidgetRequest = () => {
    if (typeof window !== undefined) {
        let localData = localStorage.getItem(localStorageKey);
        if (localData) {
            return JSON.parse(localData) as JobAgeingWidgetRequest;
        }
    }
    return {
        Period: 7
    };
};

const setLocalData = (data: JobAgeingWidgetRequest) => {
    if (typeof window !== undefined && data.Period) {
        localStorage.setItem(localStorageKey, JSON.stringify(data))
    }
};

const getChartData = async (params: JobAgeingWidgetRequest & {storeID: string | null}) => {
    // let localData = getLocalData();
    return (await Fetch.get({
        url: '/Dashboard/JobAgeingWidget',
        params,
        apiUrlOverride: null,
        caller: window.location.pathname,
        ctx: null,
        customerID: null,
        signal: null,
        tenantID: null,
        toastCtx: null,
    } as any)) as JobAgeingWidgetResponse;
}

const getWorkflows = async () => {

    const data = await Fetch.post({
        url: `/Workflow/GetWorkflows`,
        params: {
            pageSize: 100,
            pageIndex: 0,
            searchPhrase: '',
        }
    } as any);

    if(data.Results) {
        return data.Results
    } else {
        throw new Error(data.serverMessage || data.message || 'something went wrong')
    }
}

const getColumnMappingForPeriod = (period: number): SimpleColumnMapping[] => {
    return period === 7 ? [
            {
                key: 'JobStatus',
                label: 'Status',
                type: 'status'
            },
            {
                key: 'One',
                label: '1 Week',
            },
            {
                key: 'Two',
                label: '2 Weeks',
            },
            {
                key: 'Three',
                label: '3 Weeks',
            },
            {
                key: 'Four',
                label: '4 Weeks',
            },
            {
                key: 'Longer',
                label: '> 4 Weeks',
            }
        ] :
        [
            {
                key: 'JobStatus',
                label: 'Status',
                type: 'status'
            },
            {
                key: 'One',
                label: '30 Days',
            },
            {
                key: 'Two',
                label: '60 Days',
            },
            {
                key: 'Three',
                label: '90 Days',
            },
            {
                key: 'Four',
                label: '120 Days',
            },
            {
                key: 'Longer',
                label: '> 120 Days',
            }
        ]
}

const SCWidgetJobsAgeing: FC<{
    widget: WidgetConfig
    onDismiss: (() => void) | undefined
    key: any
    useGraph: boolean
    storeID: string | null
}> = ({ widget, onDismiss, storeID, key/*, useGraph = true*/ }) => {

    const [period, setPeriod] = useState(getLocalData()?.Period);

    const [columnMapping, setColumnMapping] = useState(
        getColumnMappingForPeriod(period)
    )

    useEffect(() => {
        setLocalData({Period: period})
        setColumnMapping(getColumnMappingForPeriod(period))
    }, [period]);

    const chartQuery = useQuery(['chart', 'jobs-aging', period, storeID], () => getChartData({Period: period, storeID}))
    /*const jobStatusQuery = useQuery(['jobstatus'],
        () => JobStatusService.getJobStatuses(true))*/
    // const workflowQuery = useQuery(['workflow'], getWorkflows)
    const [workflow, setSelectedWorkFlow] = useLocalStorage<string>({
        key: 'ja-workflow',
        defaultValue: 'all'
    })
    const workflowOptions = useMemo(() => {
        if (chartQuery.data) {
            const opts = chartQuery.data.Statuses.reduce((p: {label: string; value: string}[], c, i) => ((!c.WorkflowID || p.find(x => x.value === c.WorkflowID)) ? [...p] : [...p, {label: c.Workflow, value: c.WorkflowID}]), [])
            if(opts.length === 1) {
                setSelectedWorkFlow(opts[0].value)
            } else if(workflow !== 'all' && !opts.some(x => x.value === workflow)) {
                setSelectedWorkFlow('all')
            }
            return opts
        } else {
            setSelectedWorkFlow('all')
            return []
        }
    }, [chartQuery.data])


    const mappedData = useMemo(() => {
        if(chartQuery.data/* && jobStatusQuery.data?.Results?.length*/) {
            // const jobStatusData: any[] = jobStatusQuery.data?.Results;
            const chartData = chartQuery.data?.Statuses;
            /*return jobStatusData.filter(x => workflow === 'all' || x.WorkflowID === workflow).sort((a, b) => a.Order - b.Order).map((status) => {
                const chartItem = chartData?.find(x => x.JobStatus === status.Description)
                if(chartItem) {
                    return {...chartItem, JobStatus: {color: status.DisplayColor, value: status.Description}}
                }
            }).filter(x => !!x) as any[]*/
            return chartData.filter(x => workflow === 'all' || x.WorkflowID === workflow)/*.sort((a, b) => a.Order - b.Order)*/.map((status) =>
                ({...status, JobStatus: {color: status.Colour, value: status.JobStatus}})
            ).filter(x => !!x) as any[]
        }
    }, [chartQuery.data, workflow])

    const totals = useMemo(() => {
        return columnMapping.filter(x => x.type !== 'status' /*only numbers*/).map(x => (
            (mappedData || []).reduce((a, b) => (
                a + b[x.key]
            ), 0)
        ))
    }, [mappedData])

    const topSectionRef = useRef<HTMLDivElement>(null);

    const sendMixPanelEvent = () => {
        // event.preventDefault()
        Helper.mixpanelTrack(constants.mixPanelEvents.widgetCreateItemClicked, {
            module: 'Jobs',
            label: 'Add Job'
        } as any)
    }


    // console.log('chart data', chartData)


    /*const setLocalData = (localData: JobAgeingWidgetRequest) => {
        if (typeof window !== undefined) {
            localStorage.setItem(localStorageKey, JSON.stringify(localData));
        }

        setPeriod(localData.Period);
        getChartData();
    };*/

    /*const updatePeriod = (period: number) => {
        let localData = getLocalData();
        localData.Period = period;
        setLocalData(localData);
    };*/

    /*useEffect(() => {

        // this will trigger an initialised local data and get the chart info
/!*        let localData = getLocalData();
        setLocalData(localData);*!/

        window.addEventListener("resize", onResize);

        return () => {
            window.removeEventListener("resize", onResize);
        };
    }, []);*/



    /*useEffect(() => {
        if (useGraph && chartData && (chartData.Statuses?.length ?? 0) > 0) {
            plotChart();
        }
    }, [chartData]);*/

    /*const headings = useMemo(() => {
        return period === 0 ? [] :
            period === 7 ? ['One Week', 'Two Weeks', 'Three Weeks', 'Four Weeks', 'Longer'] :
                ['30 days', '90 days', '120 days', '150 days', 'Longer'];
    }, [period]);

    const plotChart = () => {
        let myChart = getChart();
        let app: any = {};
        type EChartsOption = echarts.EChartsOption;
        let option: EChartsOption;

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

        app.config = {
            rotate: 90,
            align: 'left',
            verticalAlign: 'middle',
            position: 'insideBottom',
            distance: 15,
            onChange: function () {
                const labelOption: BarLabelOption = {
                    rotate: app.config.rotate as BarLabelOption['rotate'],
                    align: app.config.align as BarLabelOption['align'],
                    verticalAlign: app.config
                        .verticalAlign as BarLabelOption['verticalAlign'],
                    position: app.config.position as BarLabelOption['position'],
                    distance: app.config.distance as BarLabelOption['distance']
                };
                myChart.setOption<echarts.EChartsOption>({
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

        type BarLabelOption = NonNullable<echarts.BarSeriesOption['label']>;

        const labelOption: BarLabelOption = {
            show: true,
            position: app.config.position as BarLabelOption['position'],
            distance: app.config.distance as BarLabelOption['distance'],
            align: app.config.align as BarLabelOption['align'],
            verticalAlign: app.config.verticalAlign as BarLabelOption['verticalAlign'],
            rotate: app.config.rotate as BarLabelOption['rotate'],
            formatter: '{c}  {name|{a}}',
            fontSize: 16,
            rich: {
                name: {}
            }
        };


        option = {
            grid: {
                top: '30',
                right: '16',
                bottom: '20',
                left: '130',
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'shadow'
                }
            },
            legend: {
                data: chartData?.Statuses.map((value) => {
                    return value.JobStatus
                })
            },
            toolbox: {
                show: false,
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
                    data: headings
                }
            ],
            yAxis: [
                {
                    type: 'value'
                }
            ],
            series: chartData?.Statuses.map((value) => {
                return {
                    name: value.JobStatus,
                    type: 'bar',
                    //label: labelOption,
                    emphasis: {
                        focus: 'series'
                    },
                    data: [value.One, value.Two, value.Three, value.Four, value.Longer]
                }
            })
        };

        option && myChart.setOption(option);
    };

    const getChart = () => {
        let chartDom = window.document.getElementById(CHART_ID);
        let myChart = echarts.init(chartDom) as echarts.ECharts;
        return myChart;
    }

    const onResize = () => {
        if (!useGraph) return;
        let myChart = getChart();
        myChart.resize();
    };

    const chartSums = useMemo(() => {
        let total: JobAgeingWidgetResponseLine = {
            JobStatus: "TOTAL",
            One: 0,
            Two: 0,
            Three: 0,
            Four: 0,
            Longer: 0
        };

        chartData?.Statuses.forEach((current) => {
            total.One += current.One;
            total.Two += current.Two;
            total.Three += current.Three;
            total.Four += current.Four;
            total.Longer += current.Longer;
        })

        return total;
    }, [chartData]);*/

    const loadingSection = (
        <Table h={`calc(${widget.heightPX}px - 125px)`}>
            <thead>
            <tr>
                {
                    [50, 55, 60, 52, 42, 50, 52].map(
                        (x, i) =>
                            <th key={'loadingTh' + i}>
                                <Skeleton height={18} width={x} />
                            </th>
                    )
                }
            </tr>
            </thead>
            <tbody>
            {
                (/*jobStatusQuery.data?.Results?.length ? jobStatusQuery.data.Results.map(() => 'x') : */[1, 2, 3, 4, 5, 6, 7]).map(
                    (x, i) =>
                        <tr key={'loadingTr' + i} >
                            {
                                [50, 55, 60, 52, 42, 50, 52].map(
                                    (x, i) =>
                                        <td key={'loadingTh' + i}>
                                            <Skeleton height={15} width={x} />
                                        </td>
                                )
                            }
                        </tr>
                )
            }
            </tbody>
        </Table>
    )

    const router = useRouter()
    const handleNavigateToItem = (item: any, statusName: string) => {
        if(statusName === 'JobStatus') {
            if(item.JobStatusID) {
                Helper.nextRouter(router.push, '/job/list?statusID=' + item.JobStatusID)
            }
        }
    }

    return (<>
        <SCWidgetCard onDismiss={onDismiss} cardProps={{p: 0, pos: 'relative'}} height={widget.heightPX}>
            <Box p={24} pb={5} ref={topSectionRef}>
                <Flex
                >
                    <SCWidgetTitle title="Job Ageing" />
                    <Flex
                        ml={'auto'}
                        gap={'xs'}
                        align={'center'}
                    >
                        {
                            workflowOptions.length > 1 &&
                            <Select
                                mt={0}
                                mb={'sm'}
                                styles={(t) => ({
                                    input: {
                                        fontWeight: 400,
                                        color: t.colors.gray[7],
                                        border: 0,
                                        textAlign: 'right',
                                        // paddingRight: '1em'
                                    }
                                })}
                                value={workflow}
                                onChange={(val) => setSelectedWorkFlow(val || 'all')}
                                rightSection={<IconCaretDown fill={'#5d5f60'} style={{marginLeft: -15, marginTop: -2}} size={14}
                                                             width={14}/>}
                                data={
                                    [
                                        {label: 'All Workflows', value: 'all'},
                                        ...(/*workflowQuery.data?.map(x => ({
                                            label: x.Name, value: x.ID
                                        })*/workflowOptions || [])
                                    ]
                                }
                                allowDeselect={false}
                                comboboxProps={{ withinPortal: true, position: 'bottom-end', offset: 0 }}
                            />
                        }
                        <Select
                            mt={0}
                            mb={'sm'}
                            styles={(t) => ({
                                input: {
                                    fontWeight: 400,
                                    color: t.colors.gray[7],
                                    border: 0
                                }
                            })}
                            value={String(period)}
                            onChange={(val) => setPeriod(Number(val))}
                            rightSection={<IconCaretDown fill={'#5d5f60'} style={{marginLeft: -15, marginTop: -2}} size={14}
                                                         width={14}/>}
                            data={[
                                {label: 'Weeks', value: '7'},
                                {label: 'Months', value: '30'},
                            ]}
                            allowDeselect={false}
                            comboboxProps={{ withinPortal: true, position: 'bottom-end', offset: 0 }}
                        />
                    </Flex>

                </Flex>


                <Box pos={'relative'} mt={-5}>
                    {
                        mappedData &&
                        <SimpleTable
                            data={mappedData || []}
                            mapping={columnMapping}
                            height={`calc(${widget.heightPX}px - 125px)`}
                            // height={`calc(${widget.heightPX}px - 129px)`}
                            footerRow={['Total', ...totals]}
                            onItemClicked={handleNavigateToItem}
                        /> || (chartQuery.isLoading/* || jobStatusQuery.isLoading*/) && loadingSection
                    }
                    <LoadingOverlay visible={chartQuery.isFetching} loaderProps={{color: 'scBlue'}}/>
                </Box>
            </Box>

            <Box
                // h={topSectionRef.current?.offsetHeight ? (widget.heightPX - topSectionRef.current?.offsetHeight) : 0}
            >
                <Flex pos={'absolute'} bottom={0} w={'100%'} align={'center'} justify={'flex-end'} gap={'xs'}
                      p={'var(--mantine-spacing-xs)'}
                      style={t => ({
                          borderTop: `1px solid ${t.colors.gray[3]}`
                      })}
                >
                    <Link
                        href={'/job/list'}
                        onClick={() => Helper.nextLinkClicked('/job/list')}
                    >
                        <Button
                            size={'xs'}
                            variant={'subtle'}
                            color={'gray.6'}
                        >
                            View All Jobs
                        </Button>
                    </Link>

                    <Link
                        href={'/job/create'}
                        onClick={() => {
                            sendMixPanelEvent()
                            Helper.nextLinkClicked('/job/create')
                        }}
                    >
                        <Button
                            /*styles={t => ({
                                root: {
                                    '&:hover': {
                                        backgroundColor: t.fn.lighten(t.colors.scBlue[5], .8)
                                    }
                                }
                            })}*/
                            rightSection={<IconPlus size={15}/>}
                            size={'xs'}
                            variant={'subtle'}
                            color={'scBlue'}
                            mr={22}
                        >
                            Add Job
                        </Button>
                    </Link>

                </Flex>
            </Box>

            {/*{useGraph && <div id={CHART_ID} style={{ height: widget.heightPX - 100, width: "100%", marginTop: 8, marginBottom: 8 }}>
            </div>}*/}
        </SCWidgetCard>

    </>);
};

export default SCWidgetJobsAgeing;