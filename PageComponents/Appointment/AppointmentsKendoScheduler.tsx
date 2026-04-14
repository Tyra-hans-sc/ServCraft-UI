import React, { FC, useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Fetch from '@/utils/Fetch';
import {Box, Text, Loader, Group, Button, Badge, ActionIcon, Flex, TextInput} from '@mantine/core';
import {DatePickerInput} from '@mantine/dates';
import { useDebouncedValue, useElementSize } from '@mantine/hooks';
import {IconChevronLeft, IconChevronRight, IconCalendarEvent, IconCalendarPin, IconSearch} from '@tabler/icons-react';
import ScDataFilter from "@/PageComponents/Table/Table Filter/ScDataFilter";
import { ScTableFilterComponentProps } from "@/PageComponents/Table/table-model";
import { showNotification } from "@mantine/notifications";
import styles from './AppointmentsKendoScheduler.module.css';
import { SchedulerConfig, SchedulerViewType, defaultSchedulerConfig } from "@/interfaces/scheduler-config";
import { Appointment, ResultResponse } from "@/interfaces/api/models";
import * as Enums from '@/utils/enums';
import moment from 'moment';
import { useRouter } from 'next/router';
import {
  Scheduler,
  DayView,
  WeekView,
  WorkWeekView,
  MonthView,
  TimelineView,
  SchedulerViewChangeEvent,
  SchedulerDateChangeEvent,
  SchedulerHandle
} from '@progress/kendo-react-scheduler';
// Removed localization imports
import { guid } from '@progress/kendo-react-common';
import ConfirmAction from '@/components/modals/confirm-action';
import Helper from '@/utils/helper';
import Time from '@/utils/time';
import ManageAppointment from '@/components/modals/appointment/manage-appointment';

// Import custom scheduler components
import CustomSchedulerItem from './CustomSchedulerItem';
import CustomSchedulerItemMonth from './CustomSchedulerItemMonth';
import CustomSchedulerItemTimeline from './CustomSchedulerItemTimeline';
import CustomSchedulerSlot from './CustomSchedulerSlot';
import CustomSchedulerSlotMonth from './CustomSchedulerSlotMonth';
import CustomSchedulerSlotTimeline from './CustomSchedulerSlotTimeline';

// Full day configuration (using 23:59 instead of 24:00 to avoid parsing errors)
const fullDayHours = {
    start: "00:00",
    end: "23:59",
};


// Helper functions to calculate date ranges based on view type
const getDayViewDateRange = (date: Date) => {
    // Expand to previous day start through next day end
    const startRange = new Date(date);
    startRange.setDate(startRange.getDate() - 1);
    startRange.setHours(0, 0, 0, 0);

    const endRange = new Date(date);
    endRange.setDate(endRange.getDate() + 1);
    endRange.setHours(23, 59, 59, 999);

    // console.log('Day view date range (expanded):', { start: startRange, end: endRange });

    return { startRange, endRange };
};

const getWeekViewDateRange = (date: Date) => {
    // Base: current week Sunday -> Saturday
    const baseStart = new Date(date);
    baseStart.setDate(date.getDate() - date.getDay());
    baseStart.setHours(0, 0, 0, 0);

    // Expand: include previous week and next week
    const startRange = new Date(baseStart);
    startRange.setDate(startRange.getDate() - 7);
    startRange.setHours(0, 0, 0, 0);

    const endRange = new Date(baseStart);
    endRange.setDate(baseStart.getDate() + 6 + 7); // end of next week
    endRange.setHours(23, 59, 59, 999);

    // console.log('Week view date range (expanded):', { start: startRange, end: endRange });

    return { startRange, endRange };
};

const getMonthViewDateRange = (date: Date) => {
    // Expand to include previous month start through next month end
    const startRange = new Date(date.getFullYear(), date.getMonth() - 1, 1);
    startRange.setHours(0, 0, 0, 0);

    const endRange = new Date(date.getFullYear(), date.getMonth() + 2, 0, 23, 59, 59, 999);

    // console.log('Month view date range (expanded):', { start: startRange, end: endRange });

    return { startRange, endRange };
};

const getTimelineViewDateRange = (date: Date) => {
    // Expand to previous day start through next day end (same as Day view)
    const startRange = new Date(date);
    // startRange.setDate(startRange.getDate() - 1);
    startRange.setHours(0, 0, 0, 0);

    const endRange = new Date(date);
    // endRange.setDate(endRange.getDate() + 1);
    endRange.setHours(23, 59, 59, 999);

    // console.log('Timeline view date range (expanded):', { start: startRange, end: endRange });

    return { startRange, endRange };
};

// Main function to get date range based on view type
const getDateRangeForView = (date: Date, viewType: SchedulerViewType) => {
    console.log('Getting date range for view:', viewType);

    switch (viewType) {
        case 'day':
            return getDayViewDateRange(date);
        case 'week':
        case 'work-week':
            return getWeekViewDateRange(date);
        case 'month':
            return getMonthViewDateRange(date);
        case 'timeline':
            return getTimelineViewDateRange(date);
        default:
            return getDayViewDateRange(date);
    }
};

const fetchAppointments = async (start, end, params?: Record<string, any>) => {
    if (!start || !end) return { Results: [] };

    const overrideParams = {
        pageSize: 999,
        pageIndex: 0,
        StartDateTime: start,
        EndDateTime: end,
        populateAppointments: true,
    };

    const response = await Fetch.post({
        url: '/Appointment/GetAppointments',
        params: {...params, ...overrideParams}
    });

    if(response.Results) {
        return response;
    } else {
        throw new Error(response.message || 'Something went wrong');
    }
};


// Efficient list equality check to avoid redundant state updates
/*const areAppointmentListsEqual = (a: Appointment[] = [], b: Appointment[] = []) => {
    if (a === b) return true;
    if (!Array.isArray(a) || !Array.isArray(b)) return false;
    if (a.length !== b.length) return false;

    const signature = (x: any) => {
        const id = x?.ID ?? '';
        const start = x?.StartDateTime ?? '';
        const end = x?.EndDateTime ?? '';
        const subject = x?.Subject ?? '';
        const employees = Array.isArray(x?.Employees)
            ? x.Employees.map((e: any) => e?.ID).filter(Boolean).sort().join('|')
            : '';
        return `${id}::${start}::${end}::${subject}::${employees}`;
    };

    const aMap = new Map<string, number>();
    for (const item of a) {
        const key = signature(item);
        aMap.set(key, (aMap.get(key) ?? 0) + 1);
    }
    for (const item of b) {
        const key = signature(item);
        const count = aMap.get(key);
        if (!count) return false;
        if (count === 1) aMap.delete(key); else aMap.set(key, count - 1);
    }
    return aMap.size === 0;
};*/

// Define a constant for the unassigned resource ID
const UNASSIGNED_RESOURCE_ID = 'unassigned';

// Create an unassigned resource object
const unassignedResource = {
    ID: UNASSIGNED_RESOURCE_ID,
    FullName: 'Unassigned',
    DisplayColor: 'var(--mantine-color-scBlue-7)' // Use a neutral color for unassigned appointments
};

// Function to fetch employees from the API
// This function is used to get the list of employees for resource grouping in the timeline view
// Always fetches all employees as per requirements
const fetchEmployees = async () => {
    const params: Record<string, any> = {
        pageSize: 999, // Get all employees
        pageIndex: 0
    };
    
    const response = await Fetch.get({
        url: '/Employee/GetEmployees',
        params
    });
    
    if (response.Results) {
        return response.Results;
    } else {
        throw new Error(response.message || 'Failed to fetch employees');
    }
};

interface AppointmentsKendoSchedulerProps {
    config?: SchedulerConfig;
    height?: number; // Optional height prop to constrain the scheduler height
    leftHeaderSection?: React.ReactNode; // Custom element to display in the header left section
    rightHeaderSection?: React.ReactNode; // Custom element to display in the header right section
    employeeIDs?: string[]; // Optional list of employee IDs to filter by (deprecated - use queryParams instead)
    queryParams?: Record<string, any>; // Contains all query parameters including employee IDs from filter
    onAppointmentCreated?: (jobId: string | null, appointment?: Appointment) => void; // Notify parent when a job-created appointment is saved

    // Optional data filter props for unique scheduler filter (bundled)
    filterProps?: ScTableFilterComponentProps;

    // Scheduler config menu control (to move config into scheduler)
    onConfigChange?: (config: SchedulerConfig) => void;
    triggerNewSchedulerControlledValue?: SchedulerConfig;
}

// Function to update an appointment
const updateAppointment = async (data: { 
    appointment: Appointment, 
    employeeIDs: string[] | null 
}) => {
    const response = await Fetch.put({
        url: "/Appointment",
        params: {
            Appointment: data.appointment,
            EmployeeIDs: data.employeeIDs
        }
    });
    
    if (!response.ID) {
        throw new Error(response.message || 'Failed to update appointment');
    }
    
    return response;
};

const AppointmentsKendoScheduler: FC<AppointmentsKendoSchedulerProps> = ({ 
    config = defaultSchedulerConfig, 
    height, 
    leftHeaderSection,
    rightHeaderSection,
    employeeIDs,
    queryParams,
    onAppointmentCreated,
    // filter props (bundled)
    filterProps,
    // config menu control
    onConfigChange,
    triggerNewSchedulerControlledValue,
}) => {
    const queryClient = useQueryClient();
    const router = useRouter();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    
    // Initialize date and view
    const initialDate = new Date();
    const initialView = config.defaultView;
    
    // Initialize startRange and endRange as null to avoid running the query until the current view is known
    // This fixes the issue where the query is executed with the wrong initial date range
    const [startRange, setStartRange] = useState<string | null>(null);
    const [endRange, setEndRange] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [currentView, setCurrentView] = useState<SchedulerViewType>(config.defaultView);
    const [date, setDate] = useState(new Date());

    // Measure the combined height of the header and filter area to size the Scheduler accordingly
    const { ref: toolbarRef, height: toolbarHeight } = useElementSize();
    const MIN_SCHEDULER_HEIGHT = 420; // reasonable minimum to keep the scheduler usable

    // Compute the inner Kendo Scheduler height from the total component height minus the measured toolbar height
    const computedSchedulerHeight = useMemo(() => {
        if (typeof height !== 'number') return undefined;
        // Allow a small spacing buffer for margins/paddings between sections
        const buffer = 16;
        const available = height + 102 - toolbarHeight;
        return Math.max(MIN_SCHEDULER_HEIGHT, available);
    }, [height, toolbarHeight]);


    // Initialize date from URL query param (?date=YYYY-MM-DD) once on mount and ensure URL sync
    const hasInitFromQuery = useRef(false);
    useEffect(() => {
        if (!router || !router.isReady) return;
        if (hasInitFromQuery.current) return;
        hasInitFromQuery.current = true;

        const qp = typeof router.query?.date === 'string' ? router.query.date : undefined;

        if (qp) {
            const m = moment(qp, 'YYYY-MM-DD', true);
            if (m.isValid()) {
                const parsed = m.toDate();
                if (!moment(parsed).isSame(date, 'day')) {
                    // Reuse central handler to update date and ranges
                    handleDateChange({ value: parsed } as any);
                    return;
                }
            }
        }

    }, [router?.isReady]);
    const [confirmOptions, setConfirmOptions] = useState(Helper.initialiseConfirmOptions());
    
    // Create a ref for the scheduler component
    const schedulerRef = useRef<SchedulerHandle>(null);
    
    // State for manage appointment modal
    const [showModal, setShowModal] = useState<Appointment | null>(null); // For editing existing appointments
    const [showCreateModal, setShowCreateModal] = useState(false); // For creating new appointments
    const [slotInfo, setSlotInfo] = useState<{ start: Date, end: Date } | null>(null); // For storing slot info when creating
    const [jobForAppointment, setJobForAppointment] = useState<any>(null); // For storing job data when creating from drag and drop
    const [slotEmployee, setSlotEmployee] = useState<any>(null); // For storing employee data when clicking on a timeline slot
    const [savedScrollPosition, setSavedScrollPosition] = useState<number | null>(null); // For storing scroll position when opening modals
    
    // State to track which appointments are currently being mutated
    const [mutatingAppointmentIds, setMutatingAppointmentIds] = useState<Set<string>>(new Set());
    
    // State for employees data
    const [employees, setEmployees] = useState<any[]>([]);
    const [isEmployeesLoading, setIsEmployeesLoading] = useState(false);

    // Local filter and search state for unique scheduler filter/search
    const [internalFilterState, setInternalFilterState] = useState<Record<string, any>>(filterProps?.initialValues || {});
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [debouncedSearch] = useDebouncedValue(searchQuery, 300);

        // Validate "HH:mm" time strings
        const isValidHHmm = useCallback((value?: string) => {
            return typeof value === 'string' && /^([01]\d|2[0-3]):([0-5]\d)$/.test(value);
        }, []);

        // Safe business hours derived from config, falling back to defaults when invalid
        const safeBusinessHours = useMemo(() => {
            if (config.showFullDay) return fullDayHours;
            const start = isValidHHmm(config?.businessHours?.start) ? config.businessHours.start : defaultSchedulerConfig.businessHours.start;
            const endRaw = isValidHHmm(config?.businessHours?.end) ? config.businessHours.end : defaultSchedulerConfig.businessHours.end;

            const toMinutes = (t: string) => {
                const [h, m] = t.split(':').map((x) => parseInt(x, 10));
                return h * 60 + m;
            };

            let end = endRaw;
            if (toMinutes(endRaw) < toMinutes(start)) {
                // Clamp end to start to avoid invalid ranges while users are editing
                end = start;
            }

            return { start, end };
        }, [config.showFullDay, config?.businessHours?.start, config?.businessHours?.end, isValidHHmm]);
    
    // No event listener needed as we're using the onJobDrop prop directly

    // Mutation for updating appointments
    const updateMutation = useMutation(
        updateAppointment,
        {
            onSuccess: (data, variables) => {
                // Remove the appointment ID from the mutating set
                setMutatingAppointmentIds(prev => {
                    const newSet = new Set(prev);
                    if (variables.appointment.ID) {
                        newSet.delete(variables.appointment.ID);
                    }
                    return newSet;
                });
                
                // If the appointment is already in our list, update it directly
                if (data && data.ID) {
                    const existingIndex = appointments.findIndex(a => a.ID === data.ID);
                    if (existingIndex !== -1) {
                        // Update the appointment directly in the state
                        const updatedAppointments = [...appointments];
                        const existingAppointment = updatedAppointments[existingIndex];
                        
                        // Create a new appointment object that preserves existing values when the response has null values
                        const mergedAppointment = { ...existingAppointment };
                        
                        // Copy all non-null values from the response
                        Object.keys(data).forEach(key => {
                            if (data[key] !== null) {
                                mergedAppointment[key] = data[key];
                            }
                        });
                        
                        // Update the appointment with the merged data
                        updatedAppointments[existingIndex] = mergedAppointment;
                        setAppointments(updatedAppointments);
                    } else {
                        // If appointment is not in our list, refresh the entire list
                        refetch();
                    }
                } else {
                    // Fallback to refreshing the entire list
                    refetch();
                }

                // Show success notification
                showNotification({
                    title: "Success",
                    message: "Appointment saved successfully",
                    color: "scBlue"
                });
            },
            onError: (error, variables) => {
                // Remove the appointment ID from the mutating set
                setMutatingAppointmentIds(prev => {
                    const newSet = new Set(prev);
                    if (variables.appointment.ID) {
                        newSet.delete(variables.appointment.ID);
                    }
                    return newSet;
                });
                
                // Show error notification
                showNotification({
                    title: "Error",
                    message: error instanceof Error ? error.message : "Appointment not saved successfully",
                    color: "yellow.7"
                });
            }
        }
    );

    // Update current view and set date ranges when config changes
    useEffect(() => {
        setCurrentView(config.defaultView);
        
        // Calculate and set the date range based on the current date and view
        const { startRange: newStartRange, endRange: newEndRange } = getDateRangeForView(date, config.defaultView);
        setStartRange(newStartRange.toISOString());
        setEndRange(newEndRange.toISOString());
        
        console.log('Date ranges set after config change:', {
            view: config.defaultView,
            startRange: newStartRange.toISOString(),
            endRange: newEndRange.toISOString()
        });
    }, [config.defaultView, date]);

    // Helper functions for calculating start and end times for new appointments
    const getWorkDayInfo = useCallback(() => {
        const start = safeBusinessHours.start;
        const end = safeBusinessHours.end;
        const startArray = start.split(":");
        const endArray = end.split(":");
        const startHour = parseInt(startArray[0]);
        const startMinute = parseInt(startArray[1]);
        const endHour = parseInt(endArray[0]);
        const endMinute = parseInt(endArray[1]);

        return { startHour, startMinute, endHour, endMinute };
    }, [safeBusinessHours]);
    
    // Function to check if the selected date is the current day
    const isCurrentDay = useCallback((selectedDate: Date) => {
        const today = new Date();
        return (
            selectedDate.getDate() === today.getDate() &&
            selectedDate.getMonth() === today.getMonth() &&
            selectedDate.getFullYear() === today.getFullYear()
        );
    }, []);
    
    // Helper function to get the scheduler layout element
    const getSchedulerLayout = useCallback(() => {
        if (!schedulerRef.current || !schedulerRef.current.element) {
            console.log('Scheduler element not found');
            return null;
        }
        
        const schedulerLayout = schedulerRef.current.element.querySelector('.k-scheduler-layout');
        if (!schedulerLayout) {
            console.log('Scheduler layout not found');
            return null;
        }
        
        return schedulerLayout;
    }, [schedulerRef]);
    
    // Helper function to get the current scroll position
    const getCurrentScrollPosition = useCallback(() => {
        const schedulerLayout = getSchedulerLayout();
        if (!schedulerLayout) return null;
        
        return schedulerLayout.scrollTop;
    }, [getSchedulerLayout]);
    
    // Helper function to set the scroll position
    const setScrollPosition = useCallback((position: number | null) => {
        if (position === null) return;
        
        const schedulerLayout = getSchedulerLayout();
        if (!schedulerLayout) return;
        
        schedulerLayout.scrollTop = position;
    }, [getSchedulerLayout]);
    
    // Center a child element within a specific scrollable container without affecting outer containers
    type AxisOption = 'horizontal' | 'vertical' | 'both';
    const centerChildWithinContainer = useCallback((container: HTMLElement, child: HTMLElement, options?: { axis?: AxisOption; behavior?: ScrollBehavior }) => {
        const axis: AxisOption = options?.axis ?? 'both';
        const behavior: ScrollBehavior = options?.behavior ?? 'auto';
        if (!container || !child) return;

        const childRect = child.getBoundingClientRect();
        const contRect = container.getBoundingClientRect();

        let targetLeft = container.scrollLeft;
        let targetTop = container.scrollTop;

        if (axis === 'horizontal' || axis === 'both') {
            const deltaX = (childRect.left + childRect.width / 2) - (contRect.left + contRect.width / 2);
            targetLeft = container.scrollLeft + deltaX;
            const maxLeft = container.scrollWidth - container.clientWidth;
            if (Number.isFinite(maxLeft)) {
                targetLeft = Math.max(0, Math.min(targetLeft, maxLeft));
            }
        }

        if (axis === 'vertical' || axis === 'both') {
            const deltaY = (childRect.top + childRect.height / 2) - (contRect.top + contRect.height / 2);
            targetTop = container.scrollTop + deltaY;
            const maxTop = container.scrollHeight - container.clientHeight;
            if (Number.isFinite(maxTop)) {
                targetTop = Math.max(0, Math.min(targetTop, maxTop));
            }
        }

        // Use a single scrollTo call with both coordinates to avoid intermediate reflows
        container.scrollTo({ left: targetLeft, top: targetTop, behavior });
    }, []);
    
    // Function to scroll to the current time when the current day is selected
    // or to the top when viewing other days
    const scrollToCurrentTime = useCallback(() => {
        // Handle Day/Week/Work-week/Timeline views (existing behavior)
        if (
            (currentView === 'day' || currentView === 'work-week' ||
                currentView === 'week' || currentView === 'timeline') &&
            schedulerRef.current
        ) {
            // Longer delay to ensure the scheduler has fully rendered
            setTimeout(() => {
                try {
                    const schedulerLayout = getSchedulerLayout();
                    if (!schedulerLayout) return;

                    // If it's the current day, try to scroll to the current time indicator
                    if (isCurrentDay(date)) {
                        // Try to find the time indicator element using various selectors
                        let targetEl: Element | null = schedulerLayout.querySelector('.k-current-time');

                        // If not found, try alternative selectors
                        if (!targetEl) targetEl = schedulerLayout.querySelector('.k-scheduler-current-time');
                        if (!targetEl) targetEl = schedulerLayout.querySelector('.k-current-time-indicator');
                        if (!targetEl) targetEl = schedulerLayout.querySelector('.k-scheduler-current-time-indicator');

                        if (targetEl) {
                            const layoutEl = schedulerLayout as HTMLElement;
                            // Center target within the scheduler's own scroll container to avoid scrolling the outer wrapper
                            if (config.defaultView === 'timeline') {
                                const contentEl = layoutEl.querySelector('.k-scheduler-content') as HTMLElement | null;
                                const containerEl = contentEl ?? layoutEl;
                                centerChildWithinContainer(containerEl, targetEl as HTMLElement, { axis: 'horizontal', behavior: 'smooth' });
                            } else {
                                const contentElV = layoutEl.querySelector('.k-scheduler-content') as HTMLElement | null;
                                const containerElV = contentElV ?? layoutEl;
                                centerChildWithinContainer(containerElV, targetEl as HTMLElement, { axis: 'vertical', behavior: 'smooth' });
                            }
                            return;
                        }
                    } else {
                        // For non-current days, scroll to the top only if not showing full day
                        if (!config.showFullDay) {
                            // Dont scroll timeline with vertical orientation
                            if (config.defaultView !== 'timeline') {
                                schedulerLayout.scrollTo({
                                    top: 0,
                                    behavior: 'smooth'
                                });
                                /*schedulerLayout.scrollTo({
                                    left: 0,
                                    behavior: 'smooth'
                                });*/
                            } else {
                                // no-op for timeline
                            }
                        }
                    }
                } catch (error) {
                    console.error('Error scrolling to current time:', error);
                }
            }, 500); // Increased delay to ensure rendering is complete
        }

        // Handle Month view: scroll to the slot styled as "today"
        if (currentView === 'month' && schedulerRef.current) {
            setTimeout(() => {
                try {
                    const schedulerLayout = getSchedulerLayout();
                    if (!schedulerLayout) return;

                    // Find the month slot that has a CSS class containing "today" (CSS modules produce class names containing the key)
                    // Also try Kendo's potential today class
                    let todaySlot: Element | null = schedulerLayout.querySelector('[class*="today"]');
                    if (!todaySlot) todaySlot = schedulerLayout.querySelector('.k-today');

                    if (todaySlot) {
                        const layoutEl = schedulerLayout as HTMLElement;
                        const contentEl = layoutEl.querySelector('.k-scheduler-content') as HTMLElement | null;
                        const containerEl = contentEl ?? layoutEl;
                        // Center the today cell within the scheduler content without affecting outer wrapper
                        centerChildWithinContainer(containerEl, todaySlot as HTMLElement, { axis: 'both', behavior: 'smooth' });
                    }
                } catch (error) {
                    console.error('Error scrolling to today (month view):', error);
                }
            }, 500);
        }
    }, [currentView, date, isCurrentDay, getSchedulerLayout, config.showFullDay]);
    
    // Scroll to current time when component mounts, date changes, or view changes
    useEffect(() => {
        scrollToCurrentTime();
    }, [date, currentView]);
    
    // Restore scroll position when a modal is shown
    useEffect(() => {
        // Only run this effect when a modal is shown
        if (savedScrollPosition) {
            // Small delay to ensure the modal has rendered
            setTimeout(() => {
                setScrollPosition(savedScrollPosition);
            }, 50);
        }
    }, [showModal, showCreateModal, savedScrollPosition, setScrollPosition]);

    // Helper function to check if a date is at midnight (00:00)
    const isDateAtMidnight = (date: Date): boolean => {
        return date.getHours() === 0 && date.getMinutes() === 0;
    };

    // Helper function to check if a date is at end of day (23:59)
    const isDateAtEndOfDay = (date: Date): boolean => {
        return date.getHours() === 23 && date.getMinutes() === 59;
    };

    // Helper function to determine if an appointment is an all-day event
    const isAllDayAppointment = (startDate: Date, endDate: Date): boolean => {
        // Check if start date is at midnight (00:00) and end date is either at 23:59 or 00:00
        return isDateAtMidnight(startDate) && (isDateAtEndOfDay(endDate) || isDateAtMidnight(endDate));
    };

    // Create memoized timeline appointments that duplicate appointments for each employee
    const timelineAppointments = useMemo(() => {
        // For timeline view, we need to duplicate appointments for each employee
        const duplicatedAppointments = appointments.flatMap(appointment => {
            // Ensure StartDateTime and EndDateTime are valid dates
            const startDate = appointment.StartDateTime ? new Date(appointment.StartDateTime) : new Date();
            const endDate = appointment.EndDateTime ? new Date(appointment.EndDateTime) : new Date();
            
            // Check if this is an all-day appointment (starts at 00:00 and ends at either 23:59 or 00:00)
            // Only set isAllDay to true if showAllDayColumn is enabled in the config
            const isAllDay = config.showAllDayColumn ? isAllDayAppointment(startDate, endDate) : false;
        
            // Create the base appointment object
            const baseAppointment = {
                id: appointment.ID || guid(),
                start: startDate,
                end: endDate,
                title: appointment.Subject || '',
                description: appointment.Description || '',
                isAllDay: isAllDay, // Set based on whether it starts and ends at midnight
                dataItem: appointment // Store the original appointment data
            };
        
            // If the appointment has employees, create a copy for each employee
            if (appointment.Employees && appointment.Employees.length > 0) {
                return appointment.Employees.map((employee) => {
                    // Always provide a unique id per rendered item to keep Kendo internal DnD stable
                    const uniqueId = `${baseAppointment.id}__${employee.ID}`;
                    return {
                        ...baseAppointment,
                        id: uniqueId,
                        primaryEmployeeID: employee.ID
                    };
                });
            } else {
                // No employees – keep item in "Unassigned" lane with a stable unique id
                const uniqueId = `${baseAppointment.id}__${UNASSIGNED_RESOURCE_ID}`;
                return [{
                    ...baseAppointment,
                    id: uniqueId,
                    primaryEmployeeID: UNASSIGNED_RESOURCE_ID
                }];
            }
        });
    
        return duplicatedAppointments;
    }, [appointments]);

    // Format appointments for Kendo Scheduler
    const formattedAppointments = useMemo(() => {

        // For timeline view, use the duplicated appointments
        if (currentView === 'timeline') {
            return timelineAppointments;
        }
    
        if (!appointments || appointments.length === 0) {
            console.log('No appointments to format');
            return [];
        }
    
        const formatted = appointments.map(appointment => {
            // Ensure StartDateTime and EndDateTime are valid dates
            const startDate = appointment.StartDateTime ? new Date(appointment.StartDateTime) : new Date();
            const endDate = appointment.EndDateTime ? new Date(appointment.EndDateTime) : new Date();
        
            // Check if this is an all-day appointment (starts at 00:00 and ends at either 23:59 or 00:00)
            // Only set isAllDay to true if showAllDayColumn is enabled in the config
            const isAllDay = config.showAllDayColumn ? isAllDayAppointment(startDate, endDate) : false;
            
            // Log each appointment being formatted
            /*console.log('Formatting appointment:', {
                id: appointment.ID,
                start: startDate,
                end: endDate,
                title: appointment.Subject || '',
                description: appointment.Description || '',
                isAllDay: isAllDay
            });*/
        
            // Create the base appointment object
            const formattedAppointment = {
                id: appointment.ID || guid(),
                start: startDate,
                end: endDate,
                title: appointment.Subject || '',
                description: appointment.Description || '',
                isAllDay: isAllDay, // Set based on whether it starts and ends at midnight
                // Store the original appointment data for our custom components
                dataItem: appointment
            };
        
            return formattedAppointment;
        });
    
        return formatted;
    }, [appointments, currentView, timelineAppointments, config.showAllDayColumn]);

    /*useEffect(() => {
        console.log('Raw appointments data:', appointments);
        console.log('Formatted appointments data:', formattedAppointments);
        console.log('Number of appointments:', appointments.length);
        console.log('Number of formatted appointments:', formattedAppointments.length);
    }, [appointments, formattedAppointments]);*/

    // Major slot duration for Day/Week views is double the configured slot duration
    // This keeps slotDivisions fixed at 2 while matching the effective increment to config.slotDuration
    const dayWeekMajorSlotDuration = useMemo(() => (config?.slotDuration ?? 30) * 2, [config.slotDuration]);

    // When using 1-hour time division, make Day/Week slotDivisions=1 and use normal duration (60)
    const isOneHourDivision = (config?.slotDuration ?? 30) === 60;
    const dayWeekSlotDuration = isOneHourDivision ? (config?.slotDuration ?? 30) : dayWeekMajorSlotDuration;
    const dayWeekSlotDivisions = isOneHourDivision ? 1 : 2;

    // Handle date range changes
    const handleDateChange = (event: SchedulerDateChangeEvent) => {
        // console.log('handleDateChange called with event:', event);
        const newDate = event.value;
        // console.log('New date:', newDate);
        setDate(newDate);

        // Update URL query param with the selected date (YYYY-MM-DD), preserving other params
        try {
            const formatted = moment(newDate).format('YYYY-MM-DD');
            const currentParam = typeof router.query?.date === 'string' ? router.query.date : undefined;
            if (currentParam !== formatted) {
                router.replace(
                    { pathname: router.pathname, query: { ...router.query, date: formatted } },
                    undefined,
                    { shallow: true }
                );
            }
        } catch (e) {
            // no-op if router is not available for some reason
        }
        
        // Use the helper function to calculate date range based on the view
        const { startRange: newStartRange, endRange: newEndRange } = getDateRangeForView(newDate, currentView);
        
        const startRangeISO = newStartRange.toISOString();
        const endRangeISO = newEndRange.toISOString();
        // console.log('Setting date range:', { startRange: startRangeISO, endRange: endRangeISO });
        
        setStartRange(startRangeISO);
        setEndRange(endRangeISO);
    };

    // Handle view change
    const handleViewChange = (event: SchedulerViewChangeEvent) => {
        console.log('handleViewChange called with event:', event);
        const newView = event.value as SchedulerViewType;

        // Update the config view directly to avoid reverting to previous view before updating again
        try {
            if (config && config.defaultView !== newView) {
                (config as SchedulerConfig).defaultView = newView;
            }
        } catch (e) {
            // noop – in case config is immutable in some contexts
        }

        // Update local state
        setCurrentView(newView);

        // Recalculate date range for the new view explicitly (do not rely on previous currentView)
        const { startRange: newStartRange, endRange: newEndRange } = getDateRangeForView(date, newView);
        setStartRange(newStartRange.toISOString());
        setEndRange(newEndRange.toISOString());
    };

    // Extract employeeIDs from either queryParams or internal filter state for filtering in timeline view
    const employeeIDsFromParams = (queryParams?.EmployeeIDList || queryParams?.EmployeeIDs || (internalFilterState as any)?.EmployeeIDList || (internalFilterState as any)?.EmployeeIDs) as string[] | undefined;
    
    // Fetch all employees data
    const { data: employeesData, isLoading: employeesLoading } = useQuery(
        ['employees'],
        fetchEmployees,
        {
            refetchOnWindowFocus: false,
            onError: (err) => {
                // Even if there's an error, we still want to have the unassigned resource
                setEmployees([unassignedResource]);
                setIsEmployeesLoading(false);
            }
        }
    );

    // Update employees when query data changes
    useEffect(() => {
        if (employeesData) {
            // Add the unassigned resource to the beginning of the employees array
            const employeesWithUnassigned = [unassignedResource, ...(employeesData || [])];
            setEmployees(employeesWithUnassigned);
            setIsEmployeesLoading(false);
        }
    }, [employeesData])

    // Debounce query-driving inputs to reduce thrash
    const [debouncedStartRange] = useDebouncedValue(startRange, 200);
    const [debouncedEndRange] = useDebouncedValue(endRange, 200);
    const [debouncedQueryParams] = useDebouncedValue(queryParams, 200);
    
    // Fetch appointments when date range changes
    const { data, isLoading: queryLoading, isFetching, error, refetch } = useQuery<ResultResponse<Appointment>>(
        ['appointments', debouncedStartRange, debouncedEndRange, debouncedQueryParams, internalFilterState, debouncedSearch],
        () => {
            console.log('Fetching appointments with date range:', { startRange: debouncedStartRange, endRange: debouncedEndRange });

            // Merge internal filter/search with external query params
            const mergedParams = {
                ...(debouncedQueryParams || {}),
                ...internalFilterState,
                searchPhrase: (debouncedQueryParams as any)?.searchPhrase || debouncedSearch || undefined,
            };

            // Use merged params directly
            return fetchAppointments(debouncedStartRange, debouncedEndRange, mergedParams);
        },
        {
            enabled: !!debouncedStartRange && !!debouncedEndRange,
            refetchOnWindowFocus: false,
            keepPreviousData: true,
            onError: (err) => {
                console.error('Error fetching appointments:', err);
            },
            staleTime: 0
        }
    );

    // Update appointments when query data changes
    useEffect(() => {
        if (data?.Results) {
            const next = data.Results;
            // setAppointments(prev => areAppointmentListsEqual(prev, next) ? prev : next);
            setAppointments(next);
        }
    }, [data])

    // const showAppointmentsLoader = !data && (queryLoading || isFetching);
    const showAppointmentsLoader = (queryLoading || isFetching);

    const getStart = useCallback((slotStart: Date, isMonthView: boolean = false, isAllDay: boolean = false) => {
        if (isAllDay || isMonthView) {
            // For all-day events and month view, set to start of work day
            const info = getWorkDayInfo();
            const start = new Date(slotStart);
            start.setHours(info.startHour);
            start.setMinutes(info.startMinute);
            return start;
        } else {
            // For day and week views, use the actual slot time
            return new Date(slotStart);
        }
    }, [getWorkDayInfo]);

    const getEnd = useCallback((slotStart: Date, isMonthView: boolean = false, isAllDay: boolean = false) => {
        if (isAllDay) {
            // Only for all-day events, set to end of work day
            const info = getWorkDayInfo();
            const end = new Date(slotStart);
            end.setHours(info.endHour);
            end.setMinutes(info.endMinute);
            return end;
        } else {
            // For all views including month view, use the default appointment length
            // First get the correct start time (which may be adjusted for month view)
            const start = getStart(slotStart, isMonthView, isAllDay);
            const end = new Date(start);
            // Use a safe defaultAppointmentLength clamped to [5, 1440]
            const rawLen: any = (config as any)?.defaultAppointmentLength;
            const parsed = typeof rawLen === 'number' ? rawLen : (rawLen == null ? NaN : Number(rawLen));
            const minutesToAdd = Number.isFinite(parsed) ? Math.min(Math.max(parsed as number, 5), 1440) : defaultSchedulerConfig.defaultAppointmentLength;
            end.setMinutes(end.getMinutes() + minutesToAdd);
            return end;
        }
    }, [getWorkDayInfo, config.defaultAppointmentLength, getStart]);

    // Event handlers for item and slot clicks
    const handleItemClick = useCallback(async (dataItem: any) => {
        try {
            // Save the current scroll position before opening the modal
            const scrollPos = getCurrentScrollPosition();
            setSavedScrollPosition(scrollPos);

            // Use the original appointment ID from the underlying dataItem to avoid relying on UI id formatting
            const appointmentId = dataItem?.dataItem?.ID ?? dataItem?.id;

            // Fetch the full appointment details using the original appointment ID
            const appointment = await Fetch.get({
                url: "/Appointment",
                params: {
                    id: appointmentId
                }
            });

            // Open the modal for editing
            setShowModal(appointment);
        } catch (error) {
            console.error('Error fetching appointment details:', error);
            showNotification({
                title: "Error",
                message: "Failed to load appointment details",
                color: "yellow.7"
            });
        }
    }, [getCurrentScrollPosition]);

    const handleSlotClick = useCallback((slotStart: Date, slotEnd: Date, isMonthView: boolean = false, isAllDay: boolean = false, employee?: any) => {
        // Save the current scroll position before opening the modal
        const scrollPos = getCurrentScrollPosition();
        setSavedScrollPosition(scrollPos);
        
        // Calculate start and end times
        const start = getStart(slotStart, isMonthView, isAllDay);
        const end = getEnd(slotStart, isMonthView, isAllDay);
        
        // Store slot info
        setSlotInfo({ start, end });
        
        // When a timeline slot is clicked, we want to preset the employee
        if (currentView === 'timeline' && employee) {
            console.log('Using employee from timeline slot click:', employee);
            setSlotEmployee(employee);
        } else {
            // Reset slot employee for other views
            setSlotEmployee(null);
        }
        
        // Open the create modal
        setShowCreateModal(true);
    }, [getStart, getEnd, currentView, getCurrentScrollPosition]);
    
    // Handler for job drops onto scheduler slots
    const handleJobDrop = useCallback((job: any, slotStart: Date, slotEnd: Date, isMonthView: boolean = false, isAllDay: boolean = false, employee?: any) => {
        // Save the current scroll position before opening the modal
        const scrollPos = getCurrentScrollPosition();
        setSavedScrollPosition(scrollPos);
        
        // Calculate start and end times
        const start = getStart(slotStart, isMonthView, isAllDay);
        const end = getEnd(slotStart, isMonthView, isAllDay);
        
        // Store slot info and job data
        setSlotInfo({ start, end });
        
        // When a job is dragged onto a timeline slot, we want to set the ManageAppointment employees
        // to only the employee for that slot and not the employees from the job
        if (currentView === 'timeline') {
            // Create a copy of the job object without the Employees property
            const { Employees, ...jobWithoutEmployees } = job;
            
            // If we have an employee from the slot's group.resources, use it
            // Otherwise, set an empty employees array
            if (employee) {
                console.log('Using employee from timeline slot:', employee);
                setJobForAppointment({
                    ...jobWithoutEmployees,
                    Employees: [employee] // Use the employee from the slot
                });
            } else {
                console.log('No employee found for timeline slot');
                setJobForAppointment({
                    ...jobWithoutEmployees,
                    Employees: []
                });
            }
        } else {
            // For other views, use the job as is
            setJobForAppointment(job);
        }
        
        // Open the create modal
        setShowCreateModal(true);
    }, [getStart, getEnd, currentView, getCurrentScrollPosition]);

    // Callback for when an appointment is saved or canceled
    const onSavedAppointment = useCallback((appointment?: Appointment) => {
        // Capture job ID if this appointment was created from a dropped job
        const createdFromJobId = jobForAppointment?.ID ?? null;

        // Store the current scroll position before closing the modal
        const currentScrollPos = savedScrollPosition;
        
        // Close the modals
        setShowModal(null);
        setShowCreateModal(false);
        setSlotInfo(null);
        setJobForAppointment(null); // Reset job data
        setSlotEmployee(null); // Reset slot employee data
        
        // Use setTimeout to restore the scroll position after the modal has closed
        // This ensures the scroll position is maintained when the modal closes
        setTimeout(() => {
            setScrollPosition(currentScrollPos);
        }, 50);
        
        // If we have an appointment returned from modal
        if (appointment && appointment.ID) {
            const isInactive = appointment.IsActive === false;
            const existingIndex = appointments.findIndex(a => a.ID === appointment.ID);

            if (isInactive) {
                // If appointment was canceled (IsActive=false) remove it from local state if present, otherwise refetch
                if (existingIndex !== -1) {
                    const filtered = appointments.filter(a => a.ID !== appointment.ID);
                    setAppointments(filtered);
                } else {
                    refetch();
                }
            } else if (existingIndex !== -1) {
                // Update the appointment directly in the state
                const updatedAppointments = [...appointments];
                const existingAppointment = updatedAppointments[existingIndex];
                
                // Create a new appointment object that preserves existing values when the response has null values
                const mergedAppointment = { ...existingAppointment };
                
                // Copy all non-null values from the response
                Object.keys(appointment).forEach(key => {
                    if (appointment[key] !== null) {
                        mergedAppointment[key] = appointment[key];
                    }
                });
                
                // Update the appointment with the merged data
                updatedAppointments[existingIndex] = mergedAppointment;
                setAppointments(updatedAppointments);
            } else {
                // If appointment is not in our list, refresh the entire list
                refetch();
            }
        } else {
            // If no appointment or no ID (e.g., modal closed without save), refresh the entire list
            refetch();
        }

        // Notify parent that an appointment was created from a job so the job can be removed from the list
        if (appointment && createdFromJobId && onAppointmentCreated) {
            try {
                onAppointmentCreated(createdFromJobId, appointment);
            } catch (e) {
                // noop
            }
        }
        
        // Only show success notification if an appointment was actually saved (not canceled)
        /*if (appointment !== null) {
            showNotification({
                title: "Success",
                message: "Appointment saved successfully",
                color: "scBlue"
            });
        }*/
    }, [refetch, appointments, savedScrollPosition, setScrollPosition, jobForAppointment, onAppointmentCreated]);

    // Navigation functions for custom header
    const handleTodayClick = () => {
        const today = new Date();
        handleDateChange({ value: today });
    };

    const handlePrevClick = () => {
        const newDate = new Date(date);
        
        // Navigate based on current view
        switch (currentView) {
            case 'day':
                newDate.setDate(newDate.getDate() - 1);
                break;
            case 'week':
            case 'work-week':
                newDate.setDate(newDate.getDate() - 7);
                break;
            case 'month':
                newDate.setMonth(newDate.getMonth() - 1);
                break;
            case 'timeline':
                newDate.setDate(newDate.getDate() - 1);
                break;
            default:
                newDate.setDate(newDate.getDate() - 1);
        }
        
        handleDateChange({ value: newDate });
    };

    const handleNextClick = () => {
        const newDate = new Date(date);
        
        // Navigate based on current view
        switch (currentView) {
            case 'day':
                newDate.setDate(newDate.getDate() + 1);
                break;
            case 'week':
            case 'work-week':
                newDate.setDate(newDate.getDate() + 7);
                break;
            case 'month':
                newDate.setMonth(newDate.getMonth() + 1);
                break;
            case 'timeline':
                newDate.setDate(newDate.getDate() + 1);
                break;
            default:
                newDate.setDate(newDate.getDate() + 1);
        }
        
        handleDateChange({ value: newDate });
    };

    // Handle date picker change
    const handleDatePickerChange = (newDate: Date | null) => {
        if (newDate) {
            handleDateChange({ value: newDate });
        }
    };

    // Get view display name
    const getViewDisplayName = (view: SchedulerViewType): string => {
        switch (view) {
            case 'day':
                return 'Day View';
            case 'week':
                return 'Week View';
            case 'work-week':
                return 'Work Week View';
            case 'month':
                return 'Month View';
            case 'timeline':
                return 'Timeline View';
            default:
                return 'Calendar';
        }
    };
    
    // Check for scheduling clashes
    const checkForClash = useCallback(async (id: string, start: string, end: string, employeeIDs: string[], event: any, originalAppointment?: Appointment) => {
        return new Promise<boolean>(async (resolve) => {
            if (!employeeIDs || employeeIDs.length === 0) {
                resolve(false);
                return;
            }

            const clashes = await Fetch.post({
                url: '/Appointment/GetScheduleClashes',
                params: {
                    AppointmentID: id,
                    EmployeeIDs: employeeIDs,
                    StartDate: start,
                    EndDate: end
                }
            });

            const clashAppointments = clashes.Results;
            const clashAppointmentEmployees: any[] = [];

            if (clashAppointments && clashAppointments.length > 0) {
                clashAppointments.forEach((app: any) => {
                    if (app.Employees) {
                        app.Employees.forEach((emp: any) => {
                            if (clashAppointmentEmployees.findIndex((x: any) => x.ID === emp.ID) < 0 && 
                                employeeIDs.findIndex((x: string) => x === emp.ID) > -1) {
                                clashAppointmentEmployees.push(emp);
                            }
                        });
                    }
                });

                if (clashAppointmentEmployees.length > 0) {
                    setConfirmOptions({
                        ...Helper.initialiseConfirmOptions(),
                        display: true,
                        onCancel: () => {
                            // Remove the appointment ID from the mutating set
                            setMutatingAppointmentIds(prev => {
                                const newSet = new Set(prev);
                                newSet.delete(id);
                                return newSet;
                            });
                            
                            // Revert the UI to the original appointment data
                            if (originalAppointment) {
                                const updatedAppointments = [...appointments];
                                const index = updatedAppointments.findIndex(a => a.ID === id);
                                if (index !== -1) {
                                    updatedAppointments[index] = originalAppointment;
                                    setAppointments(updatedAppointments);
                                }
                            } else {
                                // Fallback to fetching the original appointment data if not provided
                                Fetch.get({
                                    url: "/Appointment",
                                    params: { id }
                                }).then(originalAppointment => {
                                    // Update the UI by refreshing the appointments data
                                    const updatedAppointments = [...appointments];
                                    const index = updatedAppointments.findIndex(a => a.ID === id);
                                    if (index !== -1) {
                                        updatedAppointments[index] = originalAppointment;
                                        setAppointments(updatedAppointments);
                                    }
                                });
                            }
                        },
                        onConfirm: () => {
                            onDataAction(event, true);
                        },
                        confirmButtonText: "Save Appointment",
                        heading: "Schedule Clash Found",
                        text: `The following employees have schedule clashes: ${clashAppointmentEmployees.map(x => x.FullName).join(", ")}.
                        Confirm save appointment?`
                    });
                    resolve(true);
                } else {
                    resolve(false);
                }
            } else {
                resolve(false);
            }
        });
    }, [appointments, setMutatingAppointmentIds]);

    // Handle data actions (drag and resize)
    const onDataAction = useCallback(async (event: any, forceValidation = false) => {
        const appItem = event.dataItem;
        const isTimeChange = event.type === 1;

        console.log('onDataAction called with event:', event);

        if (isTimeChange) {
            // Use the original appointment ID from the underlying data object
            const id = appItem?.dataItem?.ID ?? appItem?.id;

            const start = Time.toISOString(Time.parseDate(appItem.start));
            const end = Time.toISOString(Time.parseDate(appItem.end));
            const employeeIDs = appItem.dataItem.Employees ? appItem.dataItem.Employees.map((x: any) => x.ID) : [];

            // Store the original appointment data for potential reversion
            const originalAppointment = appointments.find(a => a.ID === id);

            // Set the mutating appointment ID immediately for better UX
            setMutatingAppointmentIds(prev => {
                const newSet = new Set(prev);
                newSet.add(id);
                return newSet;
            });

            // Optimistically update the UI immediately
            const updatedAppointments = [...appointments];
            const index = updatedAppointments.findIndex(a => a.ID === id);

            if (index !== -1) {
                // Update the appointment in the array
                updatedAppointments[index] = {
                    ...updatedAppointments[index],
                    StartDateTime: start,
                    EndDateTime: end
                };

                // Update the state with the modified array
                setAppointments(updatedAppointments);
            }

            if (!forceValidation && (await checkForClash(id, start, end, employeeIDs, event, originalAppointment))) {
                return;
            }

            const appointment = await Fetch.get({
                url: "/Appointment",
                params: {
                    id: id
                }
            });

            if (Time.parseDate(appointment.StartDateTime).valueOf() !== Time.parseDate(start).valueOf() ||
                Time.parseDate(appointment.EndDateTime).valueOf() !== Time.parseDate(end).valueOf() ||
                // Check if we're in timeline view and the primaryEmployeeId has changed
                (currentView === 'timeline' && appItem.primaryEmployeeID &&
                 (!appointment.Employees ||
                  !appointment.Employees.some((emp: any) => emp.ID === appItem.primaryEmployeeID)))) {

                appointment.StartDateTime = start;
                appointment.EndDateTime = end;

                // For timeline view, check if the primaryEmployeeId has changed
                if (currentView === 'timeline' && appItem.primaryEmployeeID) {
                    // Special case: If dragged to the unassigned row, remove all employees
                    if (appItem.primaryEmployeeID === UNASSIGNED_RESOURCE_ID) {
                        console.log('Appointment dragged to unassigned row, removing all employees');
                        appointment.Employees = [];
                    }
                    // Normal case: Check if the primaryEmployeeId is already in the appointment's Employees list
                    else {
                        const isPrimaryEmployeeInList = appointment.Employees &&
                            appointment.Employees.some((emp: any) => emp.ID === appItem.primaryEmployeeID);

                        // If not, find the employee from the employees array and add it to the appointment's Employees list
                        if (!isPrimaryEmployeeInList) {
                            console.log('Primary employee changed, updating appointment employees');

                            // Find the employee object from the employees array
                            const newEmployee = employees.find((emp: any) => emp.ID === appItem.primaryEmployeeID);

                            if (newEmployee) {
                                // If the appointment doesn't have an Employees array, create one
                                if (!appointment.Employees) {
                                    appointment.Employees = [];
                                }

                                // Add the new employee to the appointment's Employees list
                                appointment.Employees = [newEmployee];

                                console.log('Updated appointment employees:', appointment.Employees);
                            } else {
                                console.warn('Could not find employee with ID:', appItem.primaryEmployeeID);
                            }
                        }
                    }
                }

                // Prepare employee IDs for the mutation
                const employeeIDs = appointment.Employees && appointment.Employees.length > 0 ?
                    appointment.Employees.map((x: any) => x.ID) : null;

                // Use the mutation to update the appointment
                updateMutation.mutate({
                    appointment,
                    employeeIDs
                });
            } else {
                // If no changes are needed, remove the appointment from the mutating set
                setMutatingAppointmentIds(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(id);
                    return newSet;
                });
            }
        }
    }, [appointments, checkForClash, updateMutation, currentView, employees]);

    return (
        <Box className={`${styles.schedulerContainer} ${!config.showAllDayColumn ? styles.hideAllDayRow : ''}`}>
            <>
                {(showAppointmentsLoader || isLoading) && (
                    <Box className={styles.loaderContainer}>
                        <Loader size="md" />
                    </Box>
                )}

                {error && (
                    <Box className={styles.errorContainer}>
                        <Text c="yellow.7">Error loading appointments: {(error as Error).message}</Text>
                    </Box>
                )}

                <Box ref={toolbarRef}>
                {/* Custom header with Mantine components */}
                <Flex justify="space-between" mb="xs" align="center" ml={'xs'} mt={'xs'}>
                    <Group gap={5}>
                        {leftHeaderSection && (
                            <Box mr={'xs'}>
                                {leftHeaderSection}
                            </Box>
                        )}
                        <ActionIcon
                            variant="light" 
                            onClick={handlePrevClick}
                        >
                            <IconChevronLeft size={16} />
                        </ActionIcon>
                        <ActionIcon
                            variant="light" 
                            onClick={handleNextClick}
                        >
                            <IconChevronRight size={16} />
                        </ActionIcon>
                        <Button 
                            variant="light"
                            size="compact-md"
                            onClick={handleTodayClick}
                            leftSection={<IconCalendarPin size={16} />}
                        >
                            <Text size={'sm'} fw={600}>
                                Now
                            </Text>
                        </Button>
                        <DatePickerInput
                            miw={150}
                            value={date}
                            onChange={handleDatePickerChange}
                            placeholder="Select date"
                            clearable={false}
                            valueFormat="ddd, D MMMM YYYY"
                            size="xs"
                        />
                    </Group>
                    
                    {rightHeaderSection ? (
                        <Box mr={'xs'} style={{alignSelf: 'start'}}>
                            {rightHeaderSection}
                        </Box>
                    ) : (
                        <Badge size="lg" color="blue" variant="filled" radius="sm">
                            {getViewDisplayName(currentView)}
                        </Badge>
                    )}
                </Flex>

                {/* Scheduler toolbar: Search and Filters on the left, Config menu on the right */}
                <Flex justify="space-between" mb="xs" align="start" ml={'xs'} w={'100%'}>
                    <Flex align={'start'} gap={7} wrap={{ base: 'wrap', lg: 'nowrap' }} w={'100%'}>
                        {/* Hardcoded search bar */}
                        <TextInput
                            placeholder={'Search'}
                            size={'sm'}
                            leftSection={<IconSearch size={17} />}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.currentTarget.value)}
                            maw={'270'}
                            w={'100%'}
                            data-name={'scheduler-search-input'}
                        />

                        {/* Optional data filter, controlled via props */}
                        {filterProps?.optionConfig && (
                            <ScDataFilter
                                initialValues={internalFilterState as any}
                                onChange={(newState) => {
                                    setInternalFilterState(newState);
                                    if (filterProps?.onChange) filterProps.onChange(newState);
                                }}
                                tableNoun={filterProps?.tableNoun || 'Appointment'}
                                flexProps={filterProps?.flexProps || { align: 'start', wrap: { base: 'wrap', lg: 'nowrap' }, mt: 0, w: '100%' }}
                                singleSelectMode={!!filterProps?.singleSelectMode}
                                tableName={filterProps?.tableName || 'appointments'}
                                optionConfig={filterProps?.optionConfig as any}
                                rememberState
                            />
                        )}
                    </Flex>

                </Flex>
                </Box>

                {/*
                    For timeline view, we add resource grouping by employees with vertical orientation.
                    This allows appointments to be grouped by employee in the timeline view.
                    The primaryEmployeeID field is added to each appointment in the formattedAppointments useMemo.
                */}
                <Scheduler
                    ref={schedulerRef}
                    data={formattedAppointments}
                    date={date}
                    onDateChange={handleDateChange}
                    view={currentView}
                    onViewChange={handleViewChange}
                    editable={{
                        edit: false,
                        add: false,
                        remove: false,
                        drag: true,
                        resize: true,
                        select: false
                    }}
                    header={() => <React.Fragment />}
                    footer={() => <React.Fragment />}
                    style={{
                        borderBottomLeftRadius: 5,
                        borderBottomRightRadius: 5,
                        borderLeft: 0,
                    }}
                    // height={height ? height + 25 : undefined}
                    height={computedSchedulerHeight} // Constrain the inner scheduler height based on measured toolbar height
                    // Add resource grouping for timeline view
                    group={currentView === 'timeline' ? {
                        resources: ['Employees'],
                        orientation: 'vertical' // Use vertical orientation as specified in requirements
                    } : undefined}
                    // Configure resources for timeline view
                    resources={currentView === 'timeline' ? [
                        {
                            name: 'Employees',
                            // Filter employees by employeeIDsFromParams if it's not empty
                            data: employeeIDsFromParams && employeeIDsFromParams.length > 0
                                ? [unassignedResource, ...employees.filter(emp => 
                                    emp.ID !== UNASSIGNED_RESOURCE_ID && 
                                    employeeIDsFromParams.includes(emp.ID)
                                  )]
                                : employees, // Otherwise use all employees
                            field: 'primaryEmployeeID', // This field is added to appointments in the formattedAppointments useMemo
                            valueField: 'ID',
                            textField: 'FullName',
                            colorField: 'DisplayColor'
                        }
                    ] : undefined}
                >
                    <DayView
                        workDayStart={safeBusinessHours.start}
                        workDayEnd={safeBusinessHours.end}
                        slotDuration={dayWeekSlotDuration}
                        slotDivisions={dayWeekSlotDivisions}
                        showWorkHours={!config.showFullDay}
                        item={props => <CustomSchedulerItem {...props} config={config} onItemClick={handleItemClick} mutatingAppointmentIds={mutatingAppointmentIds} />}
                        viewSlot={props => <CustomSchedulerSlot {...props} config={config} onSlotClick={handleSlotClick} onJobDrop={handleJobDrop} />}
                        onDataAction={onDataAction}
                    />
                    <WorkWeekView
                        workDayStart={safeBusinessHours.start}
                        workDayEnd={safeBusinessHours.end}
                        slotDuration={dayWeekSlotDuration}
                        slotDivisions={dayWeekSlotDivisions}
                        showWorkHours={!config.showFullDay}
                        workWeekStart={1} // Monday
                        workWeekEnd={5} // Friday
                        name="work-week"
                        title="Work Week"
                        item={props => <CustomSchedulerItem {...props} config={config} onItemClick={handleItemClick} mutatingAppointmentIds={mutatingAppointmentIds} />}
                        viewSlot={props => <CustomSchedulerSlot {...props} config={config} onSlotClick={handleSlotClick} onJobDrop={handleJobDrop} />}
                        onDataAction={onDataAction}
                    />
                    <WeekView
                        workDayStart={safeBusinessHours.start}
                        workDayEnd={safeBusinessHours.end}
                        slotDuration={dayWeekSlotDuration}
                        slotDivisions={dayWeekSlotDivisions}
                        showWorkHours={!config.showFullDay}
                        name="week"
                        title="Week"
                        item={props => <CustomSchedulerItem {...props} config={config} onItemClick={handleItemClick} mutatingAppointmentIds={mutatingAppointmentIds} />}
                        viewSlot={props => <CustomSchedulerSlot {...props} config={config} onSlotClick={handleSlotClick} onJobDrop={handleJobDrop} />}
                        onDataAction={onDataAction}
                    />
                    <MonthView
                        item={props => <CustomSchedulerItemMonth {...props} config={config} onItemClick={handleItemClick} mutatingAppointmentIds={mutatingAppointmentIds} />}
                        onDataAction={onDataAction}
                        itemsPerSlot={2} // Increased from 10 to 50 to allow more items per slot
                        viewSlot={props => <CustomSchedulerSlotMonth {...props} config={config} onSlotClick={handleSlotClick} onJobDrop={handleJobDrop} schedulerDate={date} />}
                    />
                    <TimelineView
                        workDayStart={safeBusinessHours.start}
                        workDayEnd={safeBusinessHours.end}
                        dateHeaderCell={() => <></>}
                        item={props => <CustomSchedulerItemTimeline {...props} config={config} onItemClick={handleItemClick} mutatingAppointmentIds={mutatingAppointmentIds} />}
                        viewSlot={props => <CustomSchedulerSlotTimeline {...props} config={config} onSlotClick={handleSlotClick} onJobDrop={handleJobDrop} />}
                        slotDuration={dayWeekMajorSlotDuration}
                        slotDivisions={2}
                        onDataAction={onDataAction}
                        numberOfDays={1}
                        // columnWidth={Math.round((((config.slotDuration ?? 30) * 2) / 15) * 50)}
                        columnWidth={Math.round((((config.slotDuration ?? 30) * 2) / 15) * (config.slotDuration === 5 ? 60 : config.slotDuration === 15 ? 40 : config.slotDuration === 30 ? 30 : 18))}
                    />
                </Scheduler>

                {/* Add ConfirmAction component for clash confirmation */}
                <ConfirmAction options={confirmOptions} setOptions={setConfirmOptions} />
                
                {/* Manage Appointment Modal for editing existing appointments */}
                {showModal && (
                    <ManageAppointment 
                        isNew={false} 
                        appointment={showModal} 
                        onSavedAppointment={onSavedAppointment}
                        defaultStartDate={Time.parseDate(showModal.StartDateTime)} 
                        defaultStartDateTime={Time.parseDate(showModal.StartDateTime)} 
                        defaultEndDateTime={Time.parseDate(showModal.EndDateTime)}
                    />
                )}
                
                {/* Manage Appointment Modal for creating new appointments */}
                {showCreateModal && slotInfo && (
                    <ManageAppointment 
                        isNew={true} 
                        appointment={null} 
                        onSavedAppointment={onSavedAppointment}
                        defaultStartDate={slotInfo.start} 
                        defaultStartDateTime={slotInfo.start} 
                        defaultEndDateTime={slotInfo.end}
                        module={jobForAppointment ? Enums.Module.JobCard : undefined}
                        moduleID={jobForAppointment ? jobForAppointment.ID : undefined}
                        customerID={jobForAppointment ? jobForAppointment.CustomerID : undefined}
                        employees={
                            // If we have a job, use its employees
                            jobForAppointment ? jobForAppointment.Employees : 
                            // If we have a slot employee (from timeline view), use it
                            slotEmployee ? [slotEmployee] : 
                            // Otherwise, don't preset any employees
                            undefined
                        }
                        store={jobForAppointment ? jobForAppointment.Store : undefined}
                    />
                )}
            </>
        </Box>
    );
};

export default AppointmentsKendoScheduler;