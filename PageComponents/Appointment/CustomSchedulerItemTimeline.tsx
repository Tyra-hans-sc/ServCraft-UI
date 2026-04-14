import React, {FC, useCallback, useEffect, useMemo} from 'react';
import {
    SchedulerItemProps,
    SchedulerItem,
    SchedulerItemContent,
    useSchedulerEditItemResizeItemContext, useSchedulerEditItemDragItemContext, SchedulerViewItem
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

interface CustomSchedulerItemTimelineProps extends SchedulerItemProps {
  config: SchedulerConfig;
  onItemClick?: (dataItem: any) => void;
  mutatingAppointmentIds?: Set<string>; // Set of IDs of appointments currently being mutated
}

const CustomSchedulerItemTimeline: FC<CustomSchedulerItemTimelineProps> = (props) => {
  const { dataItem, config, onItemClick, mutatingAppointmentIds } = props;
  const appointment = dataItem.dataItem as Appointment;

  const [resizeItem, ] = useSchedulerEditItemResizeItemContext();
  const [dragItem, ] = useSchedulerEditItemDragItemContext();

  // Get the current drag state
  const dragState = useAtomValue(jobDragStateAtom);
  
  // Determine mutation state using the original appointment ID from underlying data
  const originalId = (dataItem?.dataItem as Appointment)?.ID;
  const isLoading = !!(originalId && mutatingAppointmentIds?.has(originalId));
  
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
    // For timeline view, check if primaryEmployeeID is available on dataItem
    // This is used to determine which employee's color to use for the appointment
    // In timeline view, appointments are duplicated for each employee and each duplicate
    // has a primaryEmployeeID property that corresponds to the employee's ID
    if (dataItem.primaryEmployeeID && appointment.Employees && appointment.Employees.length > 0) {
      // Find the employee with the matching ID in the appointment's Employees array
      const employee = appointment.Employees.find(emp => emp.ID === dataItem.primaryEmployeeID);
      
      // If we found the employee, create a modified appointment object with this employee as the first one
      // This ensures getSchedulerItemColors will use this employee's color instead of the first employee's color
      if (employee) {
        // Create a new appointment object with the matching employee as the first one in the Employees array
        // This is a non-destructive approach that doesn't modify the original appointment object
        const modifiedAppointment = {
          ...appointment,
          Employees: [employee, ...appointment.Employees.filter(emp => emp.ID !== employee.ID)]
        };
        // Use the modified appointment object with getSchedulerItemColors
        // This will cause the function to use the color of the employee that matches the primaryEmployeeID
        return getSchedulerItemColors(modifiedAppointment, config, mappings);
      }
    }
    
    // Fallback to the default behavior (using the first employee's color)
    // This will be used if primaryEmployeeID is not available or the employee is not found
    return getSchedulerItemColors(appointment, config, mappings);
  }, [appointment, dataItem, config, mappings]);

  // Helper: build location label for timeline (all address lines inline)
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


  // Render content for timeline view
  const renderTimelineContent = () => {
    return (
      <Flex align="center" gap={0} px={2} w={'100%'} maw={'100%'} h={30} style={{ position: 'relative' }}>
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
            <Loader size="xs" color="white" />
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
              backgroundColor: 'rgba(255, 255, 255, 0.2)', 
              zIndex: 5,
              borderRadius: '4px',
              transition: 'background-color 0.2s ease',
              pointerEvents: 'none' /* Allow pointer events to pass through to the slot underneath */
            }}
          />
        )}
        
        {/* Employee avatars - conditionally rendered */}
        {config.displayOptions.showEmployees && (
          <Box miw={25} w={25} pos={'relative'}>
            <Box pos={'absolute'} top={'50%'} left={'55%'} style={{transform: 'translate(-50%, -50%)'}}>
              <EmployeeGroup
                employees={appointment.Employees || []}
                maxItems={1}
                spacing={-16}
                size={.6}
              />
            </Box>
          </Box>
        )}
        
        <Flex direction="column" gap={config.displayOptions.showJobNumber && appointment.ItemNumber && appointment.ItemID ? 0 : 4} w={'100%'}>
          {/* Row 1: Job Number, Description, and Status */}
          {/* Only render this Flex row if at least one of its children would be visible */}
          {(
            (config.displayOptions.showJobNumber && appointment.ItemNumber && appointment.ItemID) ||
            config.displayOptions.showDescription ||
            (config.displayOptions.showStatus && appointment.JobCardStatusID)
          ) && (
            <Flex align={'center'} gap={5} w={'100%'}>
              {config.displayOptions.showJobNumber && appointment.ItemNumber && appointment.ItemID && (
                <Link onClick={e => e.stopPropagation()} href={`/${appointment.Module === Enums.Module.JobCard ? 'job' : appointment.Module === Enums.Module.Query ? 'query' : 'project'}/${appointment.ItemID}`} draggable={false} style={{ cursor: 'pointer', textDecoration: 'none' }} target="_blank" rel="noopener noreferrer">
                  <Anchor underline={'never'} fw={'bolder'} size={'xs'}
                          lineClamp={1}
                          maw={150}
                          draggable={false}
                          style={{ userSelect: 'none' }}
                  >
                    {appointment.ItemNumber}
                  </Anchor>
                </Link>
              )}
              {config.displayOptions.showDescription && (
                <Text fw={600} size="xs" lh={1} lineClamp={1}>
                  {dataItem.title}
                </Text>
              )}

              {config.displayOptions.showStatus && appointment.JobCardStatusID && (
                <ScStatusData 
                  extraStyles={{marginLeft: 'auto', marginRight: 2}}
                  value={appointment.JobCardStatusName || 'unknown'} 
                  color={appointment.JobCardStatusColour || ''} 
                  shrink
                  showTooltipDelay={1000} 
                  onActionLinkClick={console.log} 
                />
              )}
            </Flex>
          )}

          {/* Row 2: Customer and Location */}
          {/* Only render this Flex row if at least one of its children would be visible */}
          {(
            (config.displayOptions.showCustomerName && appointment.CustomerName) ||
            (config.displayOptions.showLocation && appointment.LocationDescription)
          ) && (
            <Flex align={'center'} gap={5} w={'100%'} wrap="nowrap" justify={'space-between'}>
              {config.displayOptions.showCustomerName && appointment.CustomerName && (
                <Text size="xs" lh={1} lineClamp={1} maw={config.displayOptions.showLocation ? '50%' : '100%'}>
                  {appointment.CustomerName}
                </Text>
              )}
              
              {config.displayOptions.showLocation && (appointment.Location || appointment.LocationDisplay || appointment.LocationDescription) && (
                <Text size="xs" lh={1} lineClamp={1} maw={config.displayOptions.showCustomerName ? '50%' : '100%'}>
                  {formatLocation()}
                </Text>
              )}
              
              {/* Time - only show if there's space (no customer or location) */}
              {/*{(!config.displayOptions.showCustomerName && !config.displayOptions.showLocation) && (
                <Text size="xs" lh={1} c="gray.6">
                  {new Date(dataItem.start).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} -
                  {new Date(dataItem.end).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </Text>
              )}*/}
            </Flex>
          )}
        </Flex>
      </Flex>
    );
  };

  // Get colors for border and background
  const colors = getColors();
  
  return (
      <SchedulerItem
          {...props}
          onClick={handleClick}
          // className={styles.schedulerItem}
          style={{
              ...props.style,
              backgroundColor: 'white', // Set the base background to white
              color: 'black', // Change text color to black for better readability on light background
              borderRadius: '4px',
              minHeight: '36px',
              maxWidth: '100%',
              pointerEvents: !!dragItem || !!resizeItem || dragState.isDragging ? 'none' : 'auto', /* Disable pointer events during dragging */
              border: `2px solid ${colors.border}`, // Add border with the original color
          }}
      >
          <SchedulerItemContent
              className={styles.schedulerItemInner}
              style={{
                  backgroundColor: colors.background,
                  padding: 0,
                  maxWidth: '100%',
                  minHeight: '36px'
              }}
          >
              <SchedulerItemPopover dataItem={dataItem} config={config} position="top" borderColor={colors.border}>
                  {renderTimelineContent()}
              </SchedulerItemPopover>
          </SchedulerItemContent>
      </SchedulerItem>
  );
};

export default CustomSchedulerItemTimeline;