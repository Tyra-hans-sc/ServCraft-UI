import React, { FC, useCallback } from 'react';
import {SchedulerSlotProps, SchedulerSlot, SchedulerViewSlot} from '@progress/kendo-react-scheduler';
import { SchedulerConfig } from '@/interfaces/scheduler-config';
import styles from './CustomSchedulerSlot.module.css';
import CustomSchedulerSlotWrapper from './CustomSchedulerSlotWrapper';

interface CustomSchedulerSlotProps extends SchedulerSlotProps {
  config: SchedulerConfig;
  onSlotClick?: (start: Date, end: Date, isMonthView?: boolean, isAllDay?: boolean) => void;
  onJobDrop?: (job: any, start: Date, end: Date, isMonthView?: boolean, isAllDay?: boolean) => void;
  uid?: string; // Unique identifier for the slot
}

const CustomSchedulerSlot: FC<CustomSchedulerSlotProps> = (props) => {
  const { config, onSlotClick, onJobDrop } = props;
  
  // Handle click on the slot
  const handleClick = useCallback((event) => {
    // Call the onSlotClick prop if provided
    if (onSlotClick) {
      onSlotClick(
        new Date(props.start),
        new Date(props.end),
        false, // Not a month view
        props.isAllDay
      );
    }
    
    // Call the original onClick handler if provided
    if (props.onClick) {
      props.onClick(event);
    }
  }, [onSlotClick, props.start, props.end, props.isAllDay, props.onClick]);
  
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
  
  // Determine the background color class based on business hours and weekend
  const getBackgroundColorClass = () => {
    if (isBusinessHour()) {
      return isWeekend() ? styles.businessHourWeekend : styles.businessHourWeekday;
    }
    return styles.nonBusinessHour;
  };

  // Generate a unique ID for this slot
  const slotId = `${new Date(props.start).getTime()}-${props.uid || Math.random().toString(36).substring(2, 9)}`;

  return (
    <CustomSchedulerSlotWrapper
      id={slotId}
      start={new Date(props.start)}
      end={new Date(props.end)}
      isAllDay={props.isAllDay}
      onJobDrop={onJobDrop}
      appointmentDurationMinutes={config.defaultAppointmentLength}
      enableSpanHighlight={false}
    >
      <SchedulerViewSlot
        {...props}
        onClick={handleClick}
        className={`${getBackgroundColorClass()} ${styles.schedulerSlot}`}
        style={{
          ...props.style,
          // Keep any other inline styles that don't involve pseudo-selectors
        }}
      >
        {/* If this is a month view slot with a date, render the date */}
        {props.children}
      </SchedulerViewSlot>
    </CustomSchedulerSlotWrapper>
  );
};

export default CustomSchedulerSlot;