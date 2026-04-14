import React, { FC, PropsWithChildren, useMemo, useState, useRef, useEffect, useCallback } from 'react';
import { Tooltip, Box, Text, Flex, Anchor } from '@mantine/core';
import { useMutationObserver } from '@mantine/hooks';
import { SchedulerConfig } from '@/interfaces/scheduler-config';
import { Appointment } from '@/interfaces/api/models';
import { scColourMapping } from '@/PageComponents/Table/table-helper';
import { getSchedulerItemColors } from '@/utils/color-helpers';
import EmployeeGroup from '@/PageComponents/Employee/EmployeeGroup';
import ScStatusData from '@/PageComponents/Table/Table/ScStatusData';
import Link from 'next/link';
import * as Enums from '@/utils/enums';
import moment from 'moment';

interface SchedulerItemPopoverProps {
  // Kendo Scheduler item (contains title, start, end, and dataItem -> Appointment)
  dataItem: any;
  config: SchedulerConfig;
  position?: 'top' | 'right' | 'left' | 'bottom';
  borderColor?: string;
}

const OPEN_DELAY_MS = 300;
const CLOSE_DELAY_MS = 300;

const SchedulerItemPopover: FC<PropsWithChildren<SchedulerItemPopoverProps>> = ({
  dataItem,
  config,
  position = 'right',
  borderColor,
  children
}) => {
  const appointment = dataItem?.dataItem as Appointment;

  // Color mapping for named colors
  const mappings = useMemo(() => (scColourMapping), []);

  // Compute border/background colors based on config and appointment
  const colors = useMemo(() => getSchedulerItemColors(appointment, config, mappings), [appointment, config, mappings]);

  // Controlled tooltip state to keep it open when hovering target or tooltip
  const [opened, setOpened] = useState(false);
  const overTargetRef = useRef(false);
  const overTooltipRef = useRef(false);
  const closeTimerRef = useRef<number | null>(null);
  const openTimerRef = useRef<number | null>(null);

  // Track Kendo Scheduler internal drag state to disable tooltip while dragging appointments
  const [isKendoDragging, setIsKendoDragging] = useState(false);

  const clearCloseTimer = () => {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const clearOpenTimer = () => {
    if (openTimerRef.current !== null) {
      window.clearTimeout(openTimerRef.current);
      openTimerRef.current = null;
    }
  };

  const scheduleOpen = () => {
    if (isKendoDragging) return;
    // If hovering again, cancel any pending close
    clearCloseTimer();
    // Avoid stacking open timers
    clearOpenTimer();
    openTimerRef.current = window.setTimeout(() => {
      setOpened(true);
    }, OPEN_DELAY_MS);
  };

  const scheduleClose = () => {
    clearCloseTimer();
    // Also cancel any pending open to avoid opening after we left
    clearOpenTimer();
    // Small delay to avoid flicker between target and tooltip
    closeTimerRef.current = window.setTimeout(() => {
      if (!overTargetRef.current && !overTooltipRef.current) {
        setOpened(false);
      }
    }, CLOSE_DELAY_MS);
  };

  useEffect(() => {
    return () => {
      clearCloseTimer();
      clearOpenTimer();
    };
  }, []);

  // Observe DOM to detect Kendo Scheduler drag hint/clue elements which appear only during appointment drag
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const schedulerContainerRef = useRef<HTMLElement | null>(null);

  const detectDragging = useCallback(() => {
    try {
      const container = (schedulerContainerRef.current ?? document);
      const clue = container.querySelector('.k-event-drag-hint, .k-drag-clue, .k-scheduler-marquee, .k-scheduler.k-dragging');
      setIsKendoDragging(!!clue);
    } catch {
      // ignore
    }
  }, []);

  // Initialize target and run an initial detection on mount (client only)
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const wrapperEl = wrapperRef.current;
      const nearestScheduler = (wrapperEl?.closest?.('.k-scheduler') as HTMLElement | null) ?? (document.querySelector('.k-scheduler') as HTMLElement | null);
      schedulerContainerRef.current = nearestScheduler ?? null;
      detectDragging();
    }
  }, [detectDragging]);

  const onMutations = useCallback((_: MutationRecord[]) => {
    detectDragging();
  }, [detectDragging]);

  // Use Mantine's useMutationObserver to watch the nearest Kendo Scheduler container for changes (avoid observing document.body)
  useMutationObserver(
    onMutations,
    { childList: true, subtree: true, attributes: false },
    () => (schedulerContainerRef.current ?? document.body) as HTMLElement
  );


  // If dragging begins, immediately close and prevent opening
  useEffect(() => {
    if (isKendoDragging) {
      clearCloseTimer();
      clearOpenTimer();
      overTargetRef.current = false;
      overTooltipRef.current = false;
      setOpened(false);
    }
  }, [isKendoDragging]);

  const handleTargetEnter = () => {
    if (isKendoDragging) return;
    overTargetRef.current = true;
    // If already open, just ensure we won't close
    if (opened) {
      clearCloseTimer();
      return;
    }
    scheduleOpen();
  };
  const handleTargetLeave = () => {
    overTargetRef.current = false;
    scheduleClose();
  };
  const handleTooltipEnter = () => {
    if (isKendoDragging) return;
    overTooltipRef.current = true;
    if (opened) {
      clearCloseTimer();
      return;
    }
    scheduleOpen();
  };
  const handleTooltipLeave = () => {
    overTooltipRef.current = false;
    scheduleClose();
  };

  // Tooltip content: mirrors scheduler item layout with larger fonts and richer content
  const stopEventPropagation = useCallback((e: React.SyntheticEvent) => {
    e.stopPropagation();
    const anyEvent: any = e as any;
    if (anyEvent?.nativeEvent?.stopImmediatePropagation) {
      anyEvent.nativeEvent.stopImmediatePropagation();
    }
  }, []);

  // Helper: format Location full address + (type)
  const formatLocation = useCallback(() => {
    const loc = appointment?.Location;
    const typeText = appointment?.LocationDescription || loc?.Description || '';
    const parts = loc ? [loc.AddressLine1, loc.AddressLine2, loc.AddressLine3, loc.AddressLine4, loc.AddressLine5].filter(Boolean) as string[] : [];
    let address = parts.join(', ').trim();
    if (!address) {
      address = (appointment?.LocationDisplay || appointment?.LocationDescription || '').trim();
    }
    if (!address) return '';
    return typeText ? `${address} (${typeText})` : address;
  }, [appointment]);

  // Helper: return address lines as array, appending type text to the last line
  const getLocationLines = useCallback((appt?: Appointment) => {
    const loc = appt?.Location;
    const typeText = appt?.LocationDescription || loc?.Description || '';
    const parts = loc ? [loc.AddressLine1, loc.AddressLine2, loc.AddressLine3, loc.AddressLine4, loc.AddressLine5].filter(Boolean) as string[] : [];
    if (parts.length > 0) {
      if (typeText) {
        const last = parts.length - 1;
        parts[last] = `${parts[last]} (${typeText})`;
      }
      return parts;
    }
    return [] as string[];
  }, []);

  type PopoverContentProps = {
    dataItem: any;
    appointment: Appointment | undefined;
    handleTooltipEnter: () => void;
    handleTooltipLeave: () => void;
    stopEventPropagation: (e: React.SyntheticEvent) => void;
  };

  const AppointmentPopoverContentInner: FC<PopoverContentProps> = ({ dataItem, appointment, handleTooltipEnter, handleTooltipLeave, stopEventPropagation }) => (
    <Box
      p="sm"
      onMouseEnter={handleTooltipEnter}
      onMouseLeave={handleTooltipLeave}
      onClick={stopEventPropagation}
      onClickCapture={stopEventPropagation}
      onMouseDown={stopEventPropagation}
      onMouseDownCapture={stopEventPropagation}
      onMouseUp={stopEventPropagation}
      onMouseUpCapture={stopEventPropagation}
      onPointerDown={stopEventPropagation}
      onPointerDownCapture={stopEventPropagation}
      onPointerUp={stopEventPropagation}
      onPointerUpCapture={stopEventPropagation}
      onDoubleClick={stopEventPropagation}
      onDoubleClickCapture={stopEventPropagation}
      onContextMenu={stopEventPropagation}
      onContextMenuCapture={stopEventPropagation}
    >
      {/* Title / Description */}
      {dataItem?.title && (
        <Text fw={800} size="lg" c={'scBlue.9'} lineClamp={5}>
          {dataItem.title}
        </Text>
      )}

        {/* Time */}
        {dataItem?.start && dataItem?.end && (
            <Text size="sm" c="gray.7" mb={6}>
              {(() => {
                const mStart = moment(dataItem.start);
                const mEnd = moment(dataItem.end);
                return mStart.isSame(mEnd, 'day')
                  ? `${mStart.format('HH:mm')} - ${mEnd.format('HH:mm')}`
                  : `${mStart.format('ddd, MMM D HH:mm')} - ${mEnd.format('ddd, MMM D HH:mm')}`;
              })()}
            </Text>
        )}

      {/* Job Number link (if available) */}
      {appointment?.ItemNumber && appointment?.ItemID && (
        <Flex align="center" gap={6} mb={8} wrap="wrap">
          <Link
            onClick={(e) => e.stopPropagation()}
            href={`/${appointment.Module === Enums.Module.JobCard ? 'job' : appointment.Module === Enums.Module.Query ? 'query' : 'project'}/${appointment.ItemID}`}
            style={{ cursor: 'pointer', textDecoration: 'none' }}
            target="_blank" rel="noopener noreferrer"
          >
            <Anchor underline={'never'} fw={'bolder'} size={'md'}>
              {appointment.ItemNumber}
            </Anchor>
          </Link>
        </Flex>
      )}

      {/* Status */}
      {appointment?.JobCardStatusID && (
        <Flex align="center" justify="start" mb={8}>
          <Box style={{ transform: 'scale(1.1)' }}>
            <ScStatusData
              value={appointment.JobCardStatusName || 'unknown'}
              color={appointment.JobCardStatusColour || ''}
              showTooltipDelay={800}
              onActionLinkClick={console.log}
            />
          </Box>
        </Flex>
      )}

      {/* Employees: avatars + names */}
      {appointment?.Employees && appointment.Employees.length > 0 && (
        <Flex align="center" gap={8} mb={8} wrap="nowrap" ml={-5}>
          <EmployeeGroup employees={appointment.Employees} maxItems={6} spacing={-6} size={1} />
          {(() => {
            const names = (appointment.Employees ?? [])
              .map((e) => {
                const full = (e?.FullName ?? '').trim();
                if (full) return full;
                const first = (e?.FirstName ?? '').trim();
                const last = (e?.LastName ?? '').trim();
                const firstLast = `${first} ${last}`.trim();
                if (firstLast) return firstLast;
                const user = (e?.UserName ?? '').trim();
                return user || '';
              })
              .filter(Boolean)
              .join(', ');
            return names ? <Text size="sm" mt={5}>{names}</Text> : null;
          })()}
        </Flex>
      )}

      {/* Customer and Location */}
      {(appointment?.CustomerName || appointment?.Location || appointment?.LocationDisplay || appointment?.LocationDescription) && (
        <Flex direction="column" gap={4} mb={8}>
          {appointment?.CustomerName && (
            <Text size="md" fw={600}>{appointment.CustomerName}</Text>
          )}
          {(appointment?.Location || appointment?.LocationDisplay || appointment?.LocationDescription) && (
            (() => {
              const lines = getLocationLines(appointment);
              if (lines.length > 0) {
                return (
                  <Box>
                    {lines.map((line, idx) => (
                      <Text key={idx} size="md">{line}</Text>
                    ))}
                  </Box>
                );
              }
              return <Text size="md">{formatLocation()}</Text>;
            })()
          )}
        </Flex>
      )}

      {/* Description */}
      {appointment?.Description && (
        <Text size="sm" c="gray.7" mb={4}>
          {appointment.Description}
        </Text>
      )}

    </Box>
  );

  const AppointmentPopoverContent = React.memo(AppointmentPopoverContentInner);
  AppointmentPopoverContent.displayName = 'AppointmentPopoverContent';

  const contentNode = useMemo(() => {
    if (!opened) return null;
    return (
      <AppointmentPopoverContent
        dataItem={dataItem}
        appointment={appointment}
        handleTooltipEnter={handleTooltipEnter}
        handleTooltipLeave={handleTooltipLeave}
        stopEventPropagation={stopEventPropagation}
      />
    );
  }, [opened, dataItem, appointment, handleTooltipEnter, handleTooltipLeave, stopEventPropagation]);


  return (
    <Tooltip
      label={contentNode}
      position={position}
      keepMounted={false}
      withArrow
      withinPortal
      multiline
      opened={isKendoDragging ? false : opened}
      maw={450}
      transitionProps={{ transition: 'pop-bottom-left' }}
      styles={{
        tooltip: {
          backgroundColor: 'var(--mantine-color-white)',
          color: 'var(--mantine-color-black)',
          border: `2px solid ${borderColor ?? (typeof (colors as any).border !== 'undefined' ? (colors as any).border : 'var(--mantine-color-gray-3)')}`,
          borderRadius: 8,
          boxShadow: '0 4px 14px rgba(0,0,0,0.12)',
          maxWidth: 420,
          pointerEvents: 'auto'
        },
        arrow: {
          backgroundColor: 'var(--mantine-color-white)'
        }
      }}
    >
      <div
        ref={wrapperRef}
        onMouseEnter={handleTargetEnter}
        onMouseLeave={handleTargetLeave}
        style={{ display: 'block', width: '100%' }}
      >
        {children}
      </div>
    </Tooltip>
  );
};

export default SchedulerItemPopover;
