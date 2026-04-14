import React, {BaseSyntheticEvent, FC, SyntheticEvent, useCallback} from 'react';
import {SchedulerSlotProps, SchedulerSlot, SchedulerViewSlot} from '@progress/kendo-react-scheduler';
import { Text } from '@mantine/core';
import { SchedulerConfig } from '@/interfaces/scheduler-config';
import styles from './CustomSchedulerSlotMonth.module.css';
import CustomSchedulerSlotWrapper from './CustomSchedulerSlotWrapper';

interface CustomSchedulerSlotMonthProps extends SchedulerSlotProps {
  config: SchedulerConfig;
  schedulerDate?: Date | string; // The current date being viewed in the scheduler
  onSlotClick?: (start: Date, end: Date, isMonthView?: boolean, isAllDay?: boolean) => void;
  onJobDrop?: (job: any, start: Date, end: Date, isMonthView?: boolean, isAllDay?: boolean) => void;
  uid?: string; // Unique identifier for the slot
}

const CustomSchedulerSlotMonth: FC<CustomSchedulerSlotMonthProps> = (props) => {
  const { config, onSlotClick, onJobDrop } = props;
  
  // Handle click on the slot
  const handleClick = useCallback((event: any /*{syntheticEvent?: SyntheticEvent<BaseSyntheticEvent>; target?: {element?: HTMLElement; props: any}}*/) => {
    const target = (event && (event.syntheticEvent?.target as HTMLElement)) || null;

    // console.log(event, target, target.closest, target.closest('.k-more-events'))

    // If click originated from Kendo's "more events" element, let Kendo handle it
    if (target && target.closest && target.closest('.k-more-events')) {
      if (props.onClick) {
        props.onClick(event as any);
      }
      return;
    }

    // Otherwise, handle slot create click
    if (onSlotClick) {
      onSlotClick(
        new Date(props.start),
        new Date(props.end),
        true, // Is a month view
        false // Force isAllDay to false for month view to ensure default appointment length is used
      );
    }
    
    // Call the original onClick handler if provided
    if (props.onClick) {
      props.onClick(event);
    }
  }, [onSlotClick, props.start, props.end, props.onClick]);
  
  // Determine if this is a weekend
  const isWeekend = () => {
    const day = new Date(props.start).getDay();
    return day === 0 || day === 6; // 0 is Sunday, 6 is Saturday
  };
  
  // Determine if this is the current date
  const isToday = () => {
    const today = new Date();
    const slotDate = new Date(props.start);
    
    return (
      today.getFullYear() === slotDate.getFullYear() &&
      today.getMonth() === slotDate.getMonth() &&
      today.getDate() === slotDate.getDate()
    );
  };
  
  // Determine if this is part of the current month
  const isCurrentMonth = () => {
    // The scheduler's date represents the month being viewed
    const schedulerMonth = props.schedulerDate ? new Date(props.schedulerDate).getMonth() : new Date().getMonth();
    const slotMonth = new Date(props.start).getMonth();
    
    return schedulerMonth === slotMonth;
  };
  
  // Get the date number to display
  const getDateNumber = () => {
    return new Date(props.start).getDate();
  };
  
  // Determine the background color class based on weekend
  const getBackgroundColorClass = () => {
    return isWeekend() ? styles.weekend : styles.weekday;
  };

  // Determine the month opacity class
  const getMonthOpacityClass = () => {
    return isCurrentMonth() ? styles.currentMonth : styles.otherMonth;
  };

  // Determine the date number classes
  const getDateNumberClasses = () => {
    const baseClass = styles.dateNumber;
    const todayClass = isToday() ? styles.today : styles.notToday;
    const colorClass = !isToday() && (isCurrentMonth() ? styles.notTodayCurrentMonth : styles.notTodayOtherMonth);
    
    return `${baseClass} ${todayClass} ${colorClass || ''}`;
  };

  // Generate a unique ID for this slot
  const slotId = `month-${new Date(props.start).getTime()}-${props.uid || Math.random().toString(36).substring(2, 9)}`;

  // Force isAllDay to false for month view to ensure default appointment length is used
  return (
    <CustomSchedulerSlotWrapper
      id={slotId}
      start={new Date(props.start)}
      end={new Date(props.end)}
      isMonthView={true}
      isAllDay={false}
      onJobDrop={onJobDrop}
    >
      <SchedulerViewSlot
          {...props}
          onClick={handleClick}
          className={`${styles.schedulerSlot} ${isToday() ? styles.today : ''}`}
          style={{
              ...props.style,
              minHeight: 115
          }}
      />
          {/*{props.children}*/}
      {/*</SchedulerViewSlot>*/}
    </CustomSchedulerSlotWrapper>
  );
};

export default CustomSchedulerSlotMonth;