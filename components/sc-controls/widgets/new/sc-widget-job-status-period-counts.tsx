import { WidgetConfig } from "@/PageComponents/Dashboard/DashboardModels";
import {FC, useEffect, useMemo, useRef, useState} from "react";
import SCWidgetCard from "./sc-widget-card";
import SCWidgetTitle from "./sc-widget-title";
import Fetch from "@/utils/Fetch";
import {
    ActionIcon,
    Box,
    Button, Checkbox,
    Flex,
    LoadingOverlay,
    Select,
    Skeleton,
    Table, Tooltip
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
import JobStatusCountDoughnutChart from "@/components/sc-controls/widgets/new/job-status-count-doughnut-chart";
import {IconChartPie, IconTable} from "@tabler/icons-react";
import {useLocalStorage} from "@mantine/hooks";

const localStorageKey = "SCWJIS";

interface JobCountWidgetRequest {
    dateRange: number,
    includeClosed: boolean,
    storeID: string | null
}

interface JobCountWidgetResponse {
    Results: JobCountWidgetResponseLine[]
}

interface JobCountWidgetResponseLine {
    // the status
    Key: string
    // the count
    Value: number
}

const periodOptionData = [
    {label: 'Past 30 Days', value: '0'},
    {label: 'Past 90 Days', value: '1'},
    {label: 'Past 120 Days', value: '2'},
    {label: 'Past Year', value: '3'},
    {label: 'All time', value: '4'},
]


const getLocalData = () => {
    if (typeof window !== undefined) {
        let localData = localStorage.getItem(localStorageKey);
        if (localData) {
            return JSON.parse(localData) as JobCountWidgetRequest;
        }
    }
    return {
        dateRange: 0,
        includeClosed: false
    };
};

const setLocalData = (data) => {
    if (typeof window !== undefined) {
        localStorage.setItem(localStorageKey, JSON.stringify(data))
    }
};

const getJobStatusCountData = async (params: JobCountWidgetRequest) => {
    // let localData = getLocalData();
    return (await Fetch.get({
        url: '/Dashboard/GetJobStatusHistoryCounts',
        params,
        caller: window.location.pathname,
    })) as JobCountWidgetResponse;
}

const SCWidgetJobsStatusPeriodCounts: FC<{
    widget: WidgetConfig
    onDismiss: (() => void) | undefined
    key: any
    useGraph: boolean
    storeID: string | undefined
}> = ({ widget, onDismiss, storeID = null, key/*, useGraph = true*/ }) => {

    const [dateRange, setDateRange] = useState(getLocalData()?.dateRange);
    const [includeClosed, setIncludeClosed] = useState(getLocalData()?.includeClosed);

    useEffect(() => {
        setLocalData({dateRange: dateRange, includeClosed: includeClosed})
        // setColumnMapping(getColumnMappingForPeriod(period))
    }, [dateRange, includeClosed]);

    const countQuery = useQuery(['chart', 'jobs-aging', dateRange, includeClosed, storeID],
        () => getJobStatusCountData({dateRange, includeClosed, storeID})
    )

    const jobStatusQuery = useQuery(['jobstatus'],
        () => JobStatusService.getJobStatuses(true))

    const mappedData: {JobStatus: {color: string; value: string;}; Key: string; Value: number;}[] = useMemo(() => {
        if(countQuery.data?.Results && jobStatusQuery.data?.Results?.length) {
            const jobStatusData: any[] = jobStatusQuery.data?.Results;
            const chartData = countQuery.data?.Results;
            return jobStatusData.sort((a, b) => a.Order - b.Order).map((status) => {
                const chartItem = chartData?.find(x => x.Key === status.Description)
                if(chartItem) {
                    return {...chartItem, JobStatus: {color: status.DisplayColor, value: status.Description}}
                }
            }).filter(x => !!x) as any[]
        }
        return []
    }, [countQuery.data, jobStatusQuery.data])


    const totals = useMemo(() => {
        return [
            {
                key: 'Value',
                label: 'Count',
            }
        ].map(x => (
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
                (/*jobStatusQuery.data?.Results?.length ? jobStatusQuery.data.Results.map(() => 'x') : */[1, 2]).map(
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
            const statusInfo = jobStatusQuery.data.Results.find(x => x.Description === item[statusName].value)
            if(statusInfo) {
                Helper.nextRouter(router.push, '/job/list?statusID=' + statusInfo.ID)
            }
        }
    }

    const [usePieChart, setUsePieChart] = useLocalStorage({
        key: 'useDoughnutChart',
        deserialize: v => v === 'true'
    })

    return (<>
        <SCWidgetCard onDismiss={onDismiss} cardProps={{p: 0, pos: 'relative'}} height={widget.heightPX} >
            <Box p={24} px={0} pb={5} ref={topSectionRef}>
                <Flex justify={'space-between'} align={'center'} wrap={'wrap'} pl={25}>
                    <SCWidgetTitle title={widget.label} marginBottom={0} />
                    <Flex align={'center'} justify={'start'} w={'100%'} >
                        <Tooltip label={usePieChart ? 'Show table' : 'Show chart'} color={'scBlue'}>
                            <ActionIcon
                                mr={5}
                                size={'xs'}
                                // variant={usePieChart ? 'light' : 'subtle'}
                                variant={'subtle'}
                                onClick={() => setUsePieChart(p => !p)}
                                style={{
                                    transition: 'background-color 200ms ease-in-out'
                                }}
                            >
                                {
                                    usePieChart ?
                                    <IconTable /> :
                                    <IconChartPie />
                                }
                            </ActionIcon>
                        </Tooltip>
                        <Checkbox
                            label={'Include Closed'}
                            styles={{
                                label: {paddingLeft: 5}
                            }}
                            size={'xs'}
                            onChange={e => setIncludeClosed(e.currentTarget.checked)}
                            checked={includeClosed && dateRange != 4}
                            maw={'50%'}
                            disabled={dateRange == 4}
                        />
                        <Select
                            ml={'auto'}
                            miw={'auto'}
                            w={'auto'}
                            maw={130}
                            styles={(t) => ({
                                root: {
                                    border: 0,
                                    color: t.colors.gray[7],
                                },
                                input: {
                                    fontWeight: 400,
                                    color: t.colors.gray[7],
                                    border: 0,
                                    textAlign: 'right'
                                }
                            })}
                            value={String(dateRange)}
                            onChange={(val) => setDateRange(Number(val))}
                            rightSection={<IconCaretDown fill={'#5d5f60'} style={{marginLeft: -15, marginTop: -2}} size={14} width={14} />}
                            data={periodOptionData}
                            allowDeselect={false}
                            comboboxProps={{ withinPortal: true, position: 'bottom-end', offset: {crossAxis: -5}, shadow: 'xs' }}
                        />
                    </Flex>
                </Flex>


                {
                    usePieChart &&
                    <JobStatusCountDoughnutChart
                        // show={!!usePieChart}
                        data={mappedData}
                        label={periodOptionData.find(x => +x.value === dateRange)?.label || ''}
                    />
                }

                <Box pos={'relative'} mt={-5} px={10}>
                    {
                        mappedData && !usePieChart &&
                        <SimpleTable
                            data={mappedData || []}
                            mapping={[
                                {
                                    key: 'JobStatus',
                                    label: 'Status',
                                    type: 'status'
                                },
                                {
                                    key: 'Value',
                                    label: 'Count',
                                    alignRight: true
                                }
                            ]}
                            height={`calc(${widget.heightPX}px - 125px)`}
                            footerRow={['Total', ...totals]}
                            onItemClicked={handleNavigateToItem}
                        />
                    }
                    <LoadingOverlay visible={countQuery.isFetching} loaderProps={{color: 'scBlue'}} />
                </Box>
            </Box>

            <Box h={topSectionRef.current?.offsetHeight ? (widget.heightPX - topSectionRef.current?.offsetHeight) : 0}>
                <Flex pos={'absolute'} bottom={0} w={'100%'} align={'center'} justify={'flex-end'} gap={'xs'} p={'var(--mantine-spacing-xs)'}
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
                            rightSection={<IconPlus size={15} />}
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

export default SCWidgetJobsStatusPeriodCounts;