import React, { FC, useCallback } from 'react';
import {SchedulerSlotProps, SchedulerSlot, SchedulerResource, SchedulerViewSlot} from '@progress/kendo-react-scheduler';
import { Text } from '@mantine/core';
import { SchedulerConfig } from '@/interfaces/scheduler-config';
import styles from './CustomSchedulerSlotTimeline.module.css';
import CustomSchedulerSlotWrapper from './CustomSchedulerSlotWrapper';
import {Employee} from "@/interfaces/api/models";

interface CustomSchedulerSlotTimelineProps extends SchedulerSlotProps {
  config: SchedulerConfig;
  isHeaderSlot?: boolean; // Indicates if this is a header slot in the timeline view
  onSlotClick?: (start: Date, end: Date, isMonthView?: boolean, isAllDay?: boolean, employee?: any) => void;
  onJobDrop?: (job: any, start: Date, end: Date, isMonthView?: boolean, isAllDay?: boolean, employee?: any) => void;
  uid?: string; // Unique identifier for the slot
  group: {index: number; resources: (Employee & SchedulerResource)[]}
}

const CustomSchedulerSlotTimeline: FC<CustomSchedulerSlotTimelineProps> = (props) => {
  const { config, onSlotClick, onJobDrop } = props;
  
  // Extract the employee from the group.resources array if available
  const slotEmployee = props.group && props.group.resources && props.group.resources.length > 0 
    ? props.group.resources[0] 
    : undefined;

  // Handle click on the slot
  const handleClick = useCallback((event) => {
    // Don't trigger click for header slots
    if (props.isHeaderSlot) {
      return;
    }

    console.log('handleClick', event, props);
    
    // Call the onSlotClick prop if provided
    if (onSlotClick) {
      onSlotClick(
        new Date(props.start),
        new Date(props.end),
        false, // Not a month view
        props.isAllDay,
        slotEmployee // Pass the employee from the slot
      );
    }
    
    // Call the original onClick handler if provided
    if (props.onClick) {
      props.onClick(event);
    }
  }, [onSlotClick, props.start, props.end, props.isAllDay, props.onClick, props.isHeaderSlot, slotEmployee]);
  
  // Determine if this is a business hour based on config
  const isBusinessHour = () => {
    if (config.showFullDay) return true;
    
    const date = new Date(props.start);
    const hours = date.getHours();
    
    // Default business hours are 8 AM to 5 PM
    return hours >= 8 && hours < 17;
  };
  
  // Determine if this is a weekend
  const isWeekend = () => {
    const day = new Date(props.start).getDay();
    return day === 0 || day === 6; // 0 is Sunday, 6 is Saturday
  };
  
  // Determine if this is the current time slot
  const isCurrentTimeSlot = () => {
    const now = new Date();
    const slotStart = new Date(props.start);
    const slotEnd = new Date(props.end);
    
    return now >= slotStart && now < slotEnd;
  };
  
  // Format the time for display
  const formatTime = () => {
    const date = new Date(props.start);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Determine the background color class based on business hours and weekend
  const getBackgroundColorClass = () => {
    if (isBusinessHour()) {
      return isWeekend() ? styles.businessHourWeekend : styles.businessHourWeekday;
    }
    return styles.nonBusinessHour;
  };

  // Combine all classes
  const getSlotClasses = () => {
    const classes = [styles.schedulerSlot, getBackgroundColorClass()];
    
    if (isCurrentTimeSlot()) {
      classes.push(styles.currentTimeSlot);
    }
    
    return classes.join(' ');
  };

  // Generate a unique ID for this slot
  const slotId = `timeline-${new Date(props.start).getTime()}-${props.uid || Math.random().toString(36).substring(2, 9)}`;

  // Don't make header slots droppable
  if (props.isHeaderSlot) {
    return (
      <SchedulerSlot
        {...props}
        onClick={handleClick}
        className={getSlotClasses()}
        style={{
          ...props.style,
        }}
      >
        <Text size="xs" className={styles.headerSlot}>
          {formatTime()}
        </Text>
        {props.children}
      </SchedulerSlot>
    );
  }

  return (
    <CustomSchedulerSlotWrapper
      id={slotId}
      start={new Date(props.start)}
      end={new Date(props.end)}
      isAllDay={props.isAllDay}
      employee={slotEmployee}
      onJobDrop={onJobDrop}
      appointmentDurationMinutes={config.defaultAppointmentLength}
      enableSpanHighlight={true}
    >
      <SchedulerViewSlot
          {...props}
          onClick={handleClick}
          className={getSlotClasses()}
          style={{
              ...props.style
              // Keep any other inline styles that don't involve pseudo-selectors
          }}
      />
    </CustomSchedulerSlotWrapper>
  );
};

export default CustomSchedulerSlotTimeline;