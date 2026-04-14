import React, { useEffect, useMemo, useState} from 'react';
import {
    Box,
    Card,
    Flex,
    Text,
    Title,
    Button,
    Container, ActionIcon, Tooltip, Loader, Table, Skeleton
} from '@mantine/core';
import type { ECharts, EChartsOption } from 'echarts';
import {
    StocktakeDto,
    StockTakeFinancialsDto
} from "@/PageComponents/Stock Take/StockTake.model";
import * as Enums from '@/utils/enums';
import Link from "next/link";
import { IconEdit } from "@tabler/icons-react";
import PS from "@/services/permission/permission-service";
import StocktakeTimeline from "@/PageComponents/Stock Take/StocktakeTimeline";
import stockService from "@/services/stock/stock-service";
import {useInViewport, useElementSize} from "@mantine/hooks";
import time from '@/utils/time';
import {IconQuestionCircle} from "@tabler/icons";


interface StocktakeDetailProps {
    stocktake: StocktakeDto;
    onView: () => void;
    onRefresh?: (refreshFunction: () => void) => void;
    financials?: StockTakeFinancialsDto;
    isLoadingFinancials?: boolean;
    currencySymbol?: string;
}

export const StocktakeDetail: React.FC<StocktakeDetailProps> = ({ stocktake, onView, onRefresh, financials, isLoadingFinancials, currencySymbol }) => {

    const [stockAdmin] = useState(PS.hasPermission(Enums.PermissionName.StockTakeManager));

    const stocktakeValid = useMemo(() => {
        let validityEndDate = stockService.calculateValidityEndDate(stocktake);
        let stillValid = time.now().valueOf() < validityEndDate.valueOf();
        let validityStatuses = [Enums.StocktakeStatus.Counting, Enums.StocktakeStatus.CountingComplete, Enums.StocktakeStatus.Pending, Enums.StocktakeStatus.Draft];
        return !validityStatuses.includes(stocktake.Status) || stillValid;
    }, [stocktake]);

    // We no longer need the stock state or useQuery as we're using financials data for progress

    const currency = useMemo(() => currencySymbol ?? '', [currencySymbol]);
    const currencyPrefix = useMemo(() => (currency ? currency + ' ' : ''), [currency]);

    // Get counted items from financials
    const countedItems = useMemo(() => 
        financials ? financials.ItemsCounted : 0,
        [financials]
    );

    // Get total items from financials
    const totalItems = useMemo(() => 
        financials ? financials.TotalItems : 0,
        [financials]
    );

    // Calculate progress percentage based on counted vs total items
    const getProgressPercentage = () => {
        if (totalItems === 0) return 0;
        return Math.round((countedItems / totalItems) * 100);
    };

    const progressPercentage = getProgressPercentage();

    // Loading state for progress chart is now just the financials loading state
    const isProgressLoading = isLoadingFinancials;

    // Add a new state to track first viewport entry
    const [hasEnteredViewportOnce, setHasEnteredViewportOnce] = useState(false);

    // ECharts setup with persistent instance and element size tracking
    const { ref: chartContainerRef, inViewport } = useInViewport();
    const { ref: chartRef, width: chartWidth, height: chartHeight } = useElementSize();
    const chartInstance = React.useRef<ECharts | null>(null);
    const [isChartInitialized, setIsChartInitialized] = useState(false);

    // Track first viewport entry and resize/reinitialize
    React.useEffect(() => {
        if (inViewport && !hasEnteredViewportOnce && chartInstance.current && isChartInitialized) {
            setHasEnteredViewportOnce(true);

            // Resize the chart to ensure correct dimensions
            chartInstance.current.resize();

            // Force re-render the options to ensure proper layout
            if (!isProgressLoading) {
                const option = {
                    animationDuration: 1000,
                    animationDurationUpdate: 1000,
                    animationEasing: 'cubicOut',
                    animationEasingUpdate: 'cubicOut',
                    series: [
                        {
                            type: 'gauge',
                            startAngle: 90,
                            endAngle: -270,
                            pointer: {
                                show: false
                            },
                            progress: {
                                show: true,
                                overlap: false,
                                roundCap: true,
                                clip: false,
                                itemStyle: {
                                    color: Enums.StocktakeStatusText[stocktake.Status].color,
                                }
                            },
                            axisLine: {
                                lineStyle: {
                                    width: 15,
                                    color: [
                                        [1, '#e9ecef']
                                    ]
                                }
                            },
                            splitLine: {
                                show: false
                            },
                            axisTick: {
                                show: false
                            },
                            axisLabel: {
                                show: false
                            },
                            data: [
                                {
                                    value: progressPercentage,
                                    name: '',
                                    title: {
                                        offsetCenter: ['0%', '0%']
                                    },
                                    detail: {
                                        valueAnimation: true,
                                        offsetCenter: ['0%', '0%'],
                                    }
                                }
                            ],
                            title: {
                                fontSize: 14
                            },
                            detail: {
                                width: 50,
                                height: 14,
                                fontSize: 36,
                                color: Enums.StocktakeStatusText[stocktake.Status].color,
                                borderColor: 'inherit',
                                formatter: '{value}%'
                            }
                        }
                    ]
                };
                chartInstance.current.setOption(option as any, true);
            }
        }
    }, [inViewport, hasEnteredViewportOnce, isChartInitialized, isProgressLoading, progressPercentage, stocktake.Status]);

    // Initialize chart only once - using dynamic import to avoid SSR issues
    React.useEffect(() => {
        let mounted = true;
        
        const initChart = async () => {
            if (chartRef.current && !chartInstance.current) {
                const echarts = await import('echarts');
                if (mounted && chartRef.current) {
                    chartInstance.current = echarts.init(chartRef.current);
                    setIsChartInitialized(true);
                }
            }
        };
        
        initChart();

        // Cleanup function - only dispose on unmount
        return () => {
            mounted = false;
            if (chartInstance.current) {
                chartInstance.current.dispose();
                chartInstance.current = null;
                setIsChartInitialized(false);
            }
        };
    }, [chartRef]); // Dependency on chartRef from useElementSize

    // Update chart options when data changes
    React.useEffect(() => {
        if (chartInstance.current && isChartInitialized && !isProgressLoading) {
            const option = {
                animationDuration: 1000,
                animationDurationUpdate: 1000,
                animationEasing: 'cubicOut',
                animationEasingUpdate: 'cubicOut',
                series: [
                    {
                        type: 'gauge',
                        startAngle: 90,
                        endAngle: -270,
                        pointer: {
                            show: false
                        },
                        progress: {
                            show: true,
                            overlap: false,
                            roundCap: true,
                            clip: false,
                            itemStyle: {
                                color: Enums.StocktakeStatusText[stocktake.Status].color,
                            }
                        },
                        axisLine: {
                            lineStyle: {
                                width: 15,
                                color: [
                                    [1, '#e9ecef']
                                ]
                            }
                        },
                        splitLine: {
                            show: false
                        },
                        axisTick: {
                            show: false
                        },
                        axisLabel: {
                            show: false
                        },
                        data: [
                            {
                                value: progressPercentage,
                                name: '',
                                title: {
                                    offsetCenter: ['0%', '0%']
                                },
                                detail: {
                                    valueAnimation: true,
                                    offsetCenter: ['0%', '0%'],
                                }
                            }
                        ],
                        title: {
                            fontSize: 14
                        },
                        detail: {
                            width: 50,
                            height: 14,
                            fontSize: 36,
                            color: Enums.StocktakeStatusText[stocktake.Status].color,
                            borderColor: 'inherit',
                            formatter: '{value}%'
                        }
                    }
                ]
            };
            // Only update if it's not the first viewport entry (to avoid double rendering)
            if (hasEnteredViewportOnce) {
                chartInstance.current.setOption(option as any, true);
            }
        }
    }, [progressPercentage, stocktake.Status, isChartInitialized, isProgressLoading, hasEnteredViewportOnce]);

    // Handle chart element resize using useElementSize
    React.useEffect(() => {
        if (chartInstance.current && isChartInitialized) {
            chartInstance.current.resize();
        }
    }, [chartWidth, chartHeight, isChartInitialized]);

    // Status badge color mapping - removed as per request to use default theme colors

    return (
        <Container size="xl" p="md">

            <Flex gap="md" direction={{ base: 'column', sm: 'row' }}>
                {/* Left Card - Stock Take Information */}
                <Card shadow="sm" padding="lg" radius="md" withBorder flex={2}
                      // style={{alignSelf: 'start'}}
                      pos={'relative'}
                >

                    {
                        stockAdmin &&
                        <Tooltip label={'Edit Details'} color={'scBlue'} openDelay={500}>
                            <Link
                                href={`/stock-take/${stocktake.ID}/edit`}
                                style={{ position: 'absolute', top: '10px', right: '10px' }}
                            >
                                <ActionIcon variant={'light'}>
                                    <IconEdit />
                                </ActionIcon>
                            </Link>
                        </Tooltip>
                    }

                    {/*{
                        stockAdmin &&
                        <Tooltip label={'Copy Stock Take'} color={'scBlue'} openDelay={500}>
                            <Link
                                href={`/stock-take/${stocktake.ID}/copy`}
                                style={{position: 'absolute', top: '10px', right: '45px'}}
                            >
                                <ActionIcon variant={'light'}>
                                    <IconCopy/>
                                </ActionIcon>
                            </Link>
                        </Tooltip>
                    }*/}


                    <Box mb="md">
                        <Title order={4} ta="center">{stocktake.Name}</Title>
                        {stocktake.Description && <Text ta="center" size="sm" mt={3}>{stocktake.Description}</Text>}
                    </Box>

                    <Flex direction="row" justify="space-between" gap="md" style={{ width: "100%" }}>
                        {/* Left Column */}
                        <Flex direction="column" gap="xs" style={{ width: "48%" }}>
                            <Flex direction="column" align="center">
                                <Text fw={500} c="dimmed" size="sm">Created By</Text>
                                <Text>{stocktake.CreatedBy}</Text>
                            </Flex>

                            <Flex direction="column" align="center">
                                <Text fw={500} c="dimmed" size="sm">Created Date</Text>
                                <Text>{time.formatDateMoment(stocktake.CreatedDate)}</Text>
                            </Flex>

                            {
                                stocktake.ScheduledDate &&
                                <Flex direction="column" align="center">
                                    <Text fw={500} c="dimmed" size="sm">Scheduled Start Date</Text>
                                    <Text>{stocktake.ScheduledDate ? time.formatDateMoment(stocktake.ScheduledDate) : 'No Scheduled Date'}</Text>
                                </Flex>
                            }

                            <Flex direction="column" align="center">
                                <Text fw={500} c="dimmed" size="sm">Started Date</Text>
                                <Text>{stocktake.StartedDate ? time.formatDateMoment(stocktake.StartedDate) : 'Not started yet'}</Text>
                            </Flex>

                            <Flex direction="column" align="center">
                                <Text fw={500} c="dimmed" size="sm">Valid Until</Text>
                                <Flex align={'center'} gap={7}>
                                    <Text c={stocktakeValid ? "initial" : "red"}>
                                        {time.formatDateMoment(stockService.calculateValidityEndDate(stocktake))}
                                    </Text>
                                    {
                                        !stocktakeValid &&
                                        <Tooltip label={'Increase validity period to continue'} color={'scBlue'} openDelay={500} >
                                            <span>
                                                <IconQuestionCircle size={16} style={{cursor: 'help'}} />
                                            </span>
                                        </Tooltip>
                                    }
                                </Flex>
                            </Flex>

                        </Flex>

                        {/* Right Column */}
                        <Flex direction="column" gap="xs" style={{ width: "48%" }}>

                            {/*<Flex direction="column" align="center">
                                <Text fw={500} c="dimmed" size="sm">Status</Text>
                                <ScStatusData extraStyles={{transform: 'scale(1.2)'}} value={Enums.StocktakeStatusText[stocktake.Status].label} color={Enums.StocktakeStatusText[stocktake.Status].color} />
                            </Flex>*/}

                            <Flex direction="column" align="center">
                                <Text fw={500} c="dimmed" size="sm">Type</Text>
                                <Text>{Enums.getEnumStringValue(Enums.StocktakeType, stocktake.StocktakeType, true)}</Text>

                            </Flex>

                            {!!stocktake.StocktakeTemplateID && <Flex direction="column" align="center">
                                <Text fw={500} c="dimmed" size="sm">Item Template</Text>
                                <Text>{stocktake.StocktakeTemplateName}</Text>
                            </Flex>
                            }

                            <Flex direction="column" align="center">
                                <Text fw={500} c="dimmed" size="sm">Warehouse</Text>
                                <Text>{stocktake.WarehouseName}</Text>
                            </Flex>

                            <Flex direction="column" align="center">
                                <Text fw={500} c="dimmed" size="sm">Manager</Text>
                                <Text>{stocktake.AssignedManagerEmployeeFullName}</Text>
                            </Flex>

                            <Flex direction="column" align="center">
                                <Text fw={500} c="dimmed" size="sm">Capturer</Text>
                                <Text>{stocktake.AssignedEmployeeFullName}</Text>
                            </Flex>



                            {
                                stocktake.CompletedDate &&
                                <Flex direction="column" align="center">
                                    <Text fw={500} c="dimmed" size="sm">Completed Date</Text>
                                    <Text>{stocktake.StartedDate ? time.formatDateMoment(stocktake.CompletedDate) : 'Not completed'}</Text>
                                </Flex>
                            }
                        </Flex>

                    </Flex>

                    {
                        stocktake.Notes &&
                        <Box mt="md" w="100%">
                            <Text fw={500} c="dimmed" size="sm" ta="center">Notes</Text>
                            <Text mt="xs" size={'sm'} ta="left">{stocktake.Notes?.split('\n').map((line, index) => (
                                <React.Fragment key={index}>
                                    {line}
                                    <br />
                                </React.Fragment>
                            ))}</Text>
                        </Box>
                    }

                </Card>

                {/* Financial Information Card - Only shown for stocktake admin */}
                {stockAdmin && financials && (
                    <Card shadow="sm" padding="lg" radius="md" withBorder flex={1}
                          // style={{alignSelf: 'start'}}
                          w={{base: '100%'}}
                    >
                        <Title order={4} ta="center">Financial Information</Title>

                        <Table mt="md" withTableBorder withColumnBorders highlightOnHover>
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th></Table.Th>
                                    <Table.Th ta="center">Value</Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                                <Table.Tr>
                                    <Table.Td fw={500}>Expected</Table.Td>
                                    <Table.Td ta="center">
                                        {isLoadingFinancials ? (
                                            <Skeleton height={17} width="75px" mx="auto" radius="sm" />
                                        ) : (
                                            `${currencyPrefix}${financials.ExpectedCost?.toFixed(2)}`
                                        )}
                                    </Table.Td>
                                </Table.Tr>
                                <Table.Tr>
                                    <Table.Td fw={500}>Counted</Table.Td>
                                    <Table.Td ta="center">
                                        {isLoadingFinancials ? (
                                            <Skeleton height={17} width="75px" mx="auto" radius="sm" />
                                        ) : (
                                            <Text size={'sm'}>
                                                {`${currencyPrefix}${financials.CountedCost?.toFixed(2)}`}
                                            </Text>
                                        )}
                                    </Table.Td>
                                </Table.Tr>
                                <Table.Tr>
                                    <Table.Td fw={500}>Adjusted</Table.Td>
                                    <Table.Td ta="center">
                                        {isLoadingFinancials ? (
                                            <Skeleton height={17} width="75px" mx="auto" radius="sm" />
                                        ) : (
                                            `${currencyPrefix}${financials.AdjustedCost?.toFixed(2)}`
                                        )}
                                    </Table.Td>
                                </Table.Tr>
                            </Table.Tbody>
                        </Table>
                    </Card>
                )}

                {/* Right Card - Progress */}
                <Card shadow="sm" padding="lg" radius="md" withBorder flex={1} style={{ alignSelf: 'start' }}
                    w={{ base: '100%' }}>
                    <Title order={4} ta="center">Progress</Title>

                    {/*<Flex justify={'center'} my={5} mb={10}>
                        <ScStatusData extraStyles={{transform: 'scale(2)', translate: '0% 20%'}} shrink value={Enums.StocktakeStatusText[stocktake.Status].label} color={Enums.StocktakeStatusText[stocktake.Status].color} />
                    </Flex>*/}

                    <Box h={220} pos={'relative'} ref={chartContainerRef}>
                        {isProgressLoading ? (
                            <Flex justify="center" align="center" direction={'column'} gap={5} h="100%" w={'100%'} pos={'absolute'}>
                                <Loader color={Enums.StocktakeStatusText[stocktake.Status].color} size={65} />
                                {/*{!!loadingPercent && <Text size={'md'} mt={'md'} fw={500} c={'scBlue.7'}>{loadingPercent}%</Text>}*/}
                            </Flex>
                        ) : null}

                        {/* Chart container - hidden during loading but not removed */}
                        <Box
                            ref={chartRef}
                            h={220}
                            w={'100%'}
                            pos={'absolute'}
                            style={{
                                transition: 'opacity 0.2s ease-out',
                                opacity: isProgressLoading ? 0 : 1,
                                position: 'absolute'
                            }}
                        />
                    </Box>

                    <Flex direction="column" align="center">
                        <Text ta="center" size="sm">Items Counted</Text>
                        <Text ta="center" fw={700} size="xl">
                            {countedItems} / {totalItems}
                        </Text>

                        <Button variant={'light'} fullWidth mt="lg" onClick={onView}
                            color={Enums.StocktakeStatusText[stocktake.Status].color}>
                            {
                                // stocktake.Status === Enums.StocktakeStatus.Completed ? 'View Items' :
                                stocktake.Status === Enums.StocktakeStatus.Counting ? 'Continue Counting' :
                                    'View Items'
                            }
                        </Button>
                    </Flex>
                </Card>
            </Flex>

            <Flex gap="md" direction={{ base: 'column', sm: 'row' }} mt={'sm'}>

                <Card shadow="sm" padding="lg" radius="md" withBorder style={{ alignSelf: 'start' }} w={{ base: '100%' }}>
                    <StocktakeTimeline currentStatus={stocktake.Status} />
                </Card>
            </Flex>
        </Container>
    );
};

export default StocktakeDetail;
