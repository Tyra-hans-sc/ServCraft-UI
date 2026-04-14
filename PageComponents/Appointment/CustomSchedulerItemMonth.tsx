import React, { FC, useCallback, useMemo } from 'react';
import {
    SchedulerItemProps,
    SchedulerItem,
    SchedulerItemContent,
    SchedulerViewItem,
    useSchedulerEditItemResizeItemContext,
    useSchedulerEditItemDragItemContext
} from '@progress/kendo-react-scheduler';
import {Text, Box, Loader, Flex, Anchor} from '@mantine/core';
import { SchedulerConfig } from '@/interfaces/scheduler-config';
import { Appointment } from '@/interfaces/api/models';
import { useAtomValue } from 'jotai';
import { jobDragStateAtom } from '@/utils/atoms';
import EmployeeGroup from "@/PageComponents/Employee/EmployeeGroup";
import { scColourMapping } from '@/PageComponents/Table/table-helper';
import { getSchedulerItemColors } from '@/utils/color-helpers';
import styles from './SchedulerItems.module.css';
import Link from "next/link";
import * as Enums from "@/utils/enums"
import ScStatusData from "@/PageComponents/Table/Table/ScStatusData";
import SchedulerItemPopover from './SchedulerItemPopover';

interface CustomSchedulerItemMonthProps extends SchedulerItemProps {
  config: SchedulerConfig;
  onItemClick?: (dataItem: any) => void;
  mutatingAppointmentIds?: Set<string>; // Set of IDs of appointments currently being mutated
}

const CustomSchedulerItemMonth: FC<CustomSchedulerItemMonthProps> = (props) => {
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

  // Helper: build location label from Location DTO with month-specific formatting
  const formatLocation = useCallback(() => {
    const loc = appointment?.Location;
    const typeText = appointment?.LocationDescription || loc?.Description || '';

    let address = '';
    if (loc?.AddressLine1) address = loc.AddressLine1.trim();

    if (!address) {
      const fallback = (appointment?.LocationDisplay || appointment?.LocationDescription || '').trim();
      address = (fallback.split(',')[0] || '').trim();
    }

    if (!address) return '';
    return typeText ? `${address} (${typeText})` : address;
  }, [appointment]);


  // Render compact content for month view
  const renderCompactContent = () => {
    // For month view, we need to be very concise and ensure consistent rendering
    return (
        <Flex align="center" gap={0} px={2} w={'100%'} maw={'100%'} h={30}>
            {/* Loading overlay - absolute positioning doesn't affect layout */}
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
            
            <Flex direction="column" gap={config.displayOptions.showStatus && appointment.JobCardStatusID ? 0 : 4} w={'100%'}>
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
              pointerEvents: (!!dragItem || !!resizeItem || dragState.isDragging) ? 'none' : 'auto', /* Disable pointer events during dragging */
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
              <SchedulerItemPopover dataItem={dataItem} config={config} position="right" borderColor={colors.border}>
                      {renderCompactContent()}
              </SchedulerItemPopover>
          </SchedulerItemContent>
      </SchedulerItem>
  );
};

export default CustomSchedulerItemMonth;