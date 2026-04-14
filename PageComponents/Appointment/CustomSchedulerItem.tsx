import React, { FC, useCallback, useMemo } from 'react';
import {
    SchedulerItemProps,
    SchedulerItem,
    SchedulerItemContent,
    useSchedulerEditItemResizeItemContext,
    useSchedulerEditItemDragItemContext
} from '@progress/kendo-react-scheduler';
import { Flex, Text, Box, Loader, Anchor } from '@mantine/core';
import { SchedulerConfig } from '@/interfaces/scheduler-config';
import { Appointment } from '@/interfaces/api/models';
import { useAtomValue } from 'jotai';
import { jobDragStateAtom } from '@/utils/atoms';
import EmployeeGroup from "@/PageComponents/Employee/EmployeeGroup";
import { scColourMapping } from '@/PageComponents/Table/table-helper';
import { getSchedulerItemColors } from '@/utils/color-helpers';
import styles from './SchedulerItems.module.css';
import Link from "next/link";
import * as Enums from "@/utils/enums";
import ScStatusData from "@/PageComponents/Table/Table/ScStatusData";
import SchedulerItemPopover from './SchedulerItemPopover';

interface CustomSchedulerItemProps extends SchedulerItemProps {
  config: SchedulerConfig;
  onItemClick?: (dataItem: any) => void;
  mutatingAppointmentIds?: Set<string>; // Set of IDs of appointments currently being mutated
}

const CustomSchedulerItem: FC<CustomSchedulerItemProps> = (props) => {
  const { dataItem, config, onItemClick, mutatingAppointmentIds } = props;
  const appointment = dataItem.dataItem as Appointment;
  
  // Get the current drag state
  const dragState = useAtomValue(jobDragStateAtom);
  
  // Kendo edit contexts for drag/resize
  const [resizeItem, ] = useSchedulerEditItemResizeItemContext();
  const [dragItem, ] = useSchedulerEditItemDragItemContext();
  
  // Check if this appointment is currently being mutated
  const isLoading = mutatingAppointmentIds?.has(dataItem.id) ?? false;
  
  // Create a mapping object for color lookup
  const mappings = useMemo(() => (scColourMapping), []);
  
  // Handle click on the item
  const handleClick = useCallback((event) => {
    // Call the onItemClick prop if provided
    if (onItemClick) {
      onItemClick(dataItem);
    }
    
    // Call the original onClick handler if provided
    if (props.onClick) {
      props.onClick(event);
    }
  }, [onItemClick, dataItem, props.onClick]);
  
  // Determine colors based on config using the helper function
  const getColors = useCallback(() => {
    return getSchedulerItemColors(appointment, config, mappings);
  }, [appointment, config, mappings]);

  // Helper: build location label from Location DTO with view-specific formatting
  const formatLocation = useCallback((mode: 'month' | 'timeline' | 'full') => {
    const loc = appointment?.Location;
    const typeText = appointment?.LocationDescription || loc?.Description || '';

    const joinAll = (l: typeof loc) => {
      const parts = [l?.AddressLine1, l?.AddressLine2, l?.AddressLine3, l?.AddressLine4, l?.AddressLine5]
        .filter(Boolean) as string[];
      return parts.join(', ');
    };

    let address = '';
    if (loc) {
      if (mode === 'month') {
        address = (loc.AddressLine1 || '').trim();
      } else {
        address = joinAll(loc).trim();
      }
    }

    if (!address) {
      const fallback = (appointment?.LocationDisplay || appointment?.LocationDescription || '').trim();
      if (mode === 'month') {
        address = (fallback.split(',')[0] || '').trim();
      } else {
        address = fallback;
      }
    }

    if (!address) return '';
    return typeText ? `${address} (${typeText})` : address;
  }, [appointment]);

  // Helper: build comma-separated employee names for inline display
  const employeeNames = useMemo(() => {
    const list = appointment?.Employees ?? [];
    const names = list
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
      .filter(Boolean) as string[];
    return names.join(', ');
  }, [appointment?.Employees]);


  // Render the appointment content based on config
  const renderContent = () => {
    return (
      <Box p="xs" style={{ position: 'relative' }} >
        {/* Loading overlay */}
        {isLoading && (
          <Box
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10,
              borderRadius: '4px',
              pointerEvents: 'none'
            }}
          >
            <Loader size="sm" color="white" />
          </Box>
        )}

        {/* Drag overlay - subdue appointments when dragging */}
        {dragState.isDragging && !isLoading && (
          <Box
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(255, 255, 255, 0.2)', /* Increased opacity for better visual feedback */
              zIndex: 5,
              borderRadius: '4px',
              transition: 'background-color 0.2s ease',
              pointerEvents: 'none' /* Allow pointer events to pass through to the slot underneath */
            }}
          />
        )}



          {/* Job Number with link */}
          {config.displayOptions.showJobNumber && appointment.ItemNumber && appointment.ItemID && (
              <Flex align="center" gap={4} mb={'xs'} wrap={'wrap'}>
                  <Link onClick={e => e.stopPropagation()} href={`/${appointment.Module === Enums.Module.JobCard ? 'job' : appointment.Module === Enums.Module.Query ? 'query' : 'project'}/${appointment.ItemID}`} draggable={false} style={{ cursor: 'pointer', textDecoration: 'none' }} target="_blank" rel="noopener noreferrer">
                      <Anchor underline={'never'} fw={'bolder'} size={'sm'} lineClamp={1} draggable={false} style={{ userSelect: 'none' }}>
                          {appointment.ItemNumber}
                      </Anchor>
                  </Link>
              </Flex>
          )}



          {/* Title/Description */}
          {config.displayOptions.showDescription && (
              <Flex align="center" gap={8} mb={'xs'} wrap={'wrap'}>
                  <Text fw={700} size="md" lineClamp={3} style={{ flex: 1 }}>
                      {dataItem.title}
                  </Text>
              </Flex>
          )}


          {/* Status with ScStatusData component */}
          {config.displayOptions.showStatus && appointment.JobCardStatusID && (
              <Flex align="center" justify={'start'} mb={'xs'}>
                  <Box style={{
                      transform: 'scale(1.2)',
                  }}>
                      <ScStatusData
                          value={appointment.JobCardStatusName || 'unknown'}
                          color={appointment.JobCardStatusColour || ''}
                          showTooltipDelay={1000}
                          onActionLinkClick={console.log}
                      />
                  </Box>
              </Flex>
          )}

          {/* Employee avatars and names - conditionally rendered */}
          {config.displayOptions.showEmployees && appointment.Employees && appointment.Employees.length > 0 && (
              <Flex justify={'start'} align={'center'} gap={8} mb={"sm"} ml={-6} wrap={'wrap'}>
                  <EmployeeGroup
                      employees={appointment.Employees || []}
                      maxItems={4}
                      spacing={-5}
                      size={1.2}
                  />
                  {employeeNames && (
                    <Text size="sm" mt={4}>{employeeNames}</Text>
                  )}
              </Flex>
          )}

        {/* Customer Name */}
        {config.displayOptions.showCustomerName && appointment.CustomerName && (
          <Flex align="center" gap={4} mb={'xs'}>
            <Text size="sm">{appointment.CustomerName}</Text>
          </Flex>
        )}

        {/* Location */}
        {config.displayOptions.showLocation && (appointment.Location || appointment.LocationDisplay || appointment.LocationDescription) && (
          <Flex align="center" gap={4} mb={'xs'}>
            <Text size="sm">{formatLocation('full')}</Text>
          </Flex>
        )}
      </Box>
    );
  };

  // Get colors for border and background
  const colors = getColors();
  
  return (
    <SchedulerItem
      {...props}
      onClick={handleClick}
      className={styles.schedulerItem}
      style={{
        ...props.style,
        backgroundColor: 'white', // Set the base background to white
        color: 'black', // Change text color to black for better readability on light background
        borderRadius: '4px',
        overflow: 'hidden',
        border: `2px solid ${colors.border}`, // Add border with the original color
        pointerEvents: (!!dragItem || !!resizeItem || dragState.isDragging) ? 'none' : 'auto' /* Make the entire item transparent to pointer events during drag */
      }}
    >
      <SchedulerItemContent
        className={styles.schedulerItemInner}
        style={{
          backgroundColor: colors.background,
          padding: 0
        }}
      >
        <SchedulerItemPopover dataItem={dataItem} config={config} position="right">
            {renderContent()}
        </SchedulerItemPopover>
      </SchedulerItemContent>
    </SchedulerItem>
  );
};

export default CustomSchedulerItem;