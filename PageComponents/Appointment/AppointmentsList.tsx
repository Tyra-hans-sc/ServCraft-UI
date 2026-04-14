import React, {useState, useCallback, useContext, useEffect} from "react";
import {Flex, Box, Text, Anchor, Button, Tooltip} from "@mantine/core";
import {IconUser, IconMapPin, IconEye, IconEyeOff} from "@tabler/icons-react";
import DynamicVirtualList from "./DynamicVirtualList";
import {useViewportSize} from "@mantine/hooks";
import { JobCard } from "@/interfaces/api/models";
import ScStatusData from "@/PageComponents/Table/Table/ScStatusData";
import Link from "next/link";
import EmployeeGroup from "@/PageComponents/Employee/EmployeeGroup";
import AppointmentsKendoScheduler from "@/PageComponents/Appointment/AppointmentsKendoScheduler";
import ViewMenu from "@/PageComponents/Appointment/ViewMenu";
import SchedulerConfigMenu from "@/PageComponents/Appointment/SchedulerConfigMenu";
import { SchedulerConfig, SchedulerViewType, defaultSchedulerConfig } from "@/interfaces/scheduler-config";
import { motion, AnimatePresence } from "framer-motion";
import styles from './AppointmentsList.module.css';
import DraggableJobCard from "./DraggableJobCard";
import StoreService from "@/services/store/store-service";
import Storage from "@/utils/storage";
import * as Enums from "@/utils/enums";
import scMessageBarContext from "@/utils/contexts/sc-message-bar-context";
import constants from "@/utils/constants";
import moment from 'moment'

const AppointmentsList = () => {
    const [schedulerConfig, setSchedulerConfig] = useState<SchedulerConfig>(defaultSchedulerConfig);
    const [triggerNewSchedulerConfigValue, setTriggerNewSchedulerConfigValue] = useState<SchedulerConfig>();
    const [isJobListCollapsed, setIsJobListCollapsed] = useState(false);
    const [removedJobIds, setRemovedJobIds] = useState<string[]>([]);

    // Define filter option config used by both sections (unique instances per component)
    const filterOptionConfig = {
        options: [
            {
                filterName: 'StoreIDList',
                dataOptionValueKey: 'ID',
                // queryPath: '/Store/GetEmployeeStores',
                /*queryParams: {
                    employeeId: Storage.getCookie(Enums.Cookie.employeeID)
                },*/
                orderByKey: 'IsDefault',
                queryFunction: (props) => StoreService.getStores(props.search ?? '', props.showAll ?? true, Storage.getCookie(Enums.Cookie.employeeID)),
                label: 'Store',
                hiddenWhileLoading: true
            },
            {
                filterName: 'EmployeeIDList',
                dataOptionValueKey: 'ID',
                dataOptionLabelKey: ['FullName', 'EmailAddress', 'UserName'],
                queryPath: '/Employee/GetEmployees',
                label: 'Employee',
                dataOptionColorKey: 'DisplayColor',
                showForSingleItem: true,
            },
            {
                filterName: 'JobStatusIDList',
                dataOptionValueKey: 'ID',
                dataOptionLabelKey: ['Description'],
                dataOptionColorKey: 'DisplayColor',
                dataOptionGroupingKey: 'WorkflowName',
                queryPath: '/JobStatus',
                showIncludeDisabledToggle: true,
                label: 'Job Status',
                queryParams: {
                    onlyActive: 'false'
                },
                type: 'multiselect'
            },
            {
                filterName: 'JobTypeIDList',
                dataOptionValueKey: 'ID',
                dataOptionLabelKey: ['Name'],
                dataOptionGroupingKey: 'WorkflowName',
                queryPath: '/JobType',
                label: 'Job Type'
            },
        ],
    } as any;

    // Handle scheduler configuration changes
    const handleSchedulerConfigChange = (config: SchedulerConfig) => {
        setSchedulerConfig(config);
    };
    
    // Handle view changes
    const handleViewChange = (view: SchedulerViewType) => {
        // Update the scheduler config with the new view using the same handler as the config menu
        const updatedConfig = {
            ...schedulerConfig,
            defaultView: view
        };
        // handleSchedulerConfigChange(updatedConfig);
        setTriggerNewSchedulerConfigValue(updatedConfig);
    };
    
    // Handle export functionality
    const handleExport = () => {
        console.log('Export functionality will be implemented in the future');
        // Future implementation will go here
    };

    const {height} = useViewportSize()
    const messageBarContext: any = useContext(scMessageBarContext);

    // Format a full address for a job card (prefer explicit address lines, then LocationDisplay, then LocationDescription)
    const formatJobAddress = useCallback((job: any) => {
        try {
            const loc = job?.Location;
            const parts = loc
                ? [loc.AddressLine1, loc.AddressLine2, loc.AddressLine3, loc.AddressLine4, loc.AddressLine5].filter(Boolean)
                : [];
            let address = (parts as string[]).join(', ').trim();
            if (!address) {
                address = (job?.LocationDisplay || job?.LocationDescription || '').trim();
            }
            return address;
        } catch {
            return (job?.LocationDisplay || job?.LocationDescription || '') ?? '';
        }
    }, []);

    // Job item content renderer
    const renderJobItemContent = useCallback((job: JobCard) => {
        return (
            <Box>
                <Flex align="center" gap={'sm'} h={'100%'}>
                    <Box w={45} pos={'relative'}>
                        <Box pos={'absolute'} top={'50%'} left={'40%'} style={{transform: 'translate(-50%, -60%)'}}>
                            <EmployeeGroup
                                employees={job.EmployeeList || []}
                                maxItems={2}
                                // spacing={2}
                                size={1.2}
                            />
                        </Box>
                    </Box>
                    <Box style={{ flex: 1 }}>
                        <Flex gap={7} mt={0} align={'center'}>
                            {job.JobCardNumber && (
                                <Link href={`/job/${job.ID}`} style={{ cursor: 'pointer', textDecoration: 'none' }} target="_blank" rel="noopener noreferrer">
                                    <Anchor  underline={'never'} fw={'bolder'} size={'sm'}
                                             lineClamp={1}
                                             maw={150}
                                    >
                                        {job.JobCardNumber}
                                    </Anchor>
                                </Link>
                            )}
                            {job.StartDate && (
                                <Text lineClamp={1} size="sm" c="dimmed">{moment(job.StartDate).format('DD/MM/yyyy')}</Text>
                            )}
                            {job.JobCardStatusDescription && (
                                <ScStatusData extraStyles={{marginLeft: 'auto'}} value={job.JobCardStatusDescription || 'unknown'} color={job.JobCardStatusDisplayColor} shrink
                                              showTooltipDelay={1000} onActionLinkClick={console.log} />
                            )}
                        </Flex>
                        <Flex justify="space-between" align="center">
                            <Text fw={500} size="sm" lineClamp={1}>{job.Description}</Text>
                        </Flex>
                        <Flex gap="md" justify={'end'} mt={-1}>
                            {job.CustomerName && (
                                <Flex align="center" gap={4} miw={50}>
                                    <Box miw={9}>
                                        <IconUser size={12}/>
                                    </Box>
                                    <Text lineClamp={1} size="sm">{job.CustomerName}</Text>
                                </Flex>
                            )}
                            {(() => {
                                const fullAddress = formatJobAddress(job);
                                const description = (job?.LocationDescription || job?.LocationDisplay || '').trim();
                                const displayText = description || fullAddress;
                                if (!displayText) return null;
                                const content = (
                                    <Flex align="center" gap={4} miw={50}>
                                        <Box miw={9}>
                                            <IconMapPin size={12} />
                                        </Box>
                                        <Text lineClamp={1} size="sm">{displayText}</Text>
                                    </Flex>
                                );
                                // If we have a description, show full address in tooltip (when available and different)
                                if (description) {
                                    const tooltipLabel = fullAddress && fullAddress !== description ? fullAddress : undefined;
                                    return tooltipLabel ? (
                                        <Tooltip label={tooltipLabel} openDelay={600} maw={300} withinPortal withArrow>
                                            {content}
                                        </Tooltip>
                                    ) : content;
                                }
                                // No description -> just show address without tooltip
                                return content;
                            })()}
                        </Flex>
                    </Box>
                </Flex>
            </Box>
        );
    }, []);

    // Custom renderer for job items in the list
    const renderJobItem = useCallback((job: JobCard, index: number) => {
        return (
            <DraggableJobCard job={job}>
                {renderJobItemContent(job)}
            </DraggableJobCard>
        );
    }, [renderJobItemContent]);

    // When an appointment is created from a job, remove it from the unscheduled jobs list
    const handleAppointmentCreated = useCallback((jobId?: string | null) => {
        if (!jobId) return;
        setRemovedJobIds((prev) => (prev.includes(jobId) ? prev : [...prev, jobId]));
    }, []);

    return (
        <>
            <Flex 
                gap={0} 
                h={'100%'} 
                align={'stretch'} 
                // mt={10}
                direction={{base: 'column-reverse', sm: 'row'}}
                style={{ width: '100%', maxWidth: '100%', overflow: 'hidden' }} // Ensure the Flex container respects its parent's width
            >


                {/* Job List with Virtual Scrolling */}
                <AnimatePresence initial={false}>
                    {!isJobListCollapsed && (
                        <motion.div
                            initial={{ width: 0, opacity: 0 }}
                            animate={{
                                width: '100%', // Fixed width instead of 100% to allow better width distribution
                                opacity: 1
                            }}
                            exit={{ width: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className={styles.jobListContainer}
                            style={{
                                height: '100%',
                                overflow: 'hidden',
                                width: '100%',
                                // flexShrink: 0, // Prevent the job list from shrinking
                                // maxWidth: '30%' // Limit maximum width to 30% of the container
                            }}
                        >
                            <DynamicVirtualList<JobCard>
                                queryUrl="/Job/GetJobs"
                                queryParams={{
                                    IncludeClosed: false,
                                    PopulateAppointments: true,
                                    SortExpression: "StartDate",
                                    SortDirection: "descending",
                                }}
                                filterProps={{ optionConfig: {
                                        options: [
                                            {
                                                type: 'switch',
                                                label: 'Unscheduled Jobs',
                                                filterName: 'OnlyUnscheduledJobs',
                                                defaultValue: true,
                                            },
                                        ],
                                    }, flexProps: {maw: 100}, tableName: 'appointmentJobs', tableNoun: 'Job' } as any}
                                excludeIds={removedJobIds}
                                listHeight={height - ((messageBarContext as any)?.isActive ? constants.messageBarMargin : 0) - 260}
                                renderItem={renderJobItem}
                                title="Jobs"
                                // use internal search bar in the list
                                searchEnabled={true}
                                infiniteScroll={true}
                                headerRightSection={
                                    <Button
                                        variant="subtle"
                                        size="compact-sm"
                                        color="scBlue.6"
                                        onClick={() => setIsJobListCollapsed(true)}
                                        leftSection={<IconEyeOff size={16} />}
                                    >
                                        Hide Jobs
                                    </Button>
                                }
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
                
                <Box style={{ 
                    flexGrow: 1, 
                    border: '1px solid var(--mantine-color-gray-3)', 
                    borderRadius: 4,
                    marginLeft: isJobListCollapsed ? 0 : '8px',
                    width: '100%', // Ensure the box takes full width of its allocated space
                    maxWidth: '100%', // Prevent overflow
                    overflow: 'hidden' // Prevent content from overflowing
                }}>
                    <AppointmentsKendoScheduler 
                        config={schedulerConfig} 
                        height={height - ((messageBarContext as any)?.isActive ? constants.messageBarMargin : 0) - 260} // Use the same height calculation as DynamicVirtualList
                        leftHeaderSection={
                            isJobListCollapsed && (
                                <Button
                                    variant="subtle"
                                    size="compact-sm"
                                    color="scBlue.6"
                                    onClick={() => setIsJobListCollapsed(false)}
                                    leftSection={<IconEye size={16} />}
                                >
                                    Show Jobs
                                </Button>
                            )
                        }
                        rightHeaderSection={
                            <Flex align="center" gap="xs" wrap={"wrap-reverse"} justify={'end'}>
                                <ViewMenu 
                                    currentView={schedulerConfig.defaultView}
                                    onViewChange={handleViewChange}
                                />
                                <SchedulerConfigMenu
                                    onConfigChange={handleSchedulerConfigChange}
                                    triggerNewSchedulerControlledValue={triggerNewSchedulerConfigValue}
                                />
                            </Flex>
                        }
                        queryParams={{
                            SortDirection: 'descending',
                            SortExpression: 'StartDate',
                        }}
                        filterProps={{ optionConfig: filterOptionConfig, tableName: 'appointments', tableNoun: 'Appointment' } as any}
                        onConfigChange={handleSchedulerConfigChange}
                        triggerNewSchedulerControlledValue={triggerNewSchedulerConfigValue}
                        onAppointmentCreated={(jobId) => handleAppointmentCreated(jobId)}
                    />
                </Box>
            </Flex>
        </>
    );
}

export default AppointmentsList
