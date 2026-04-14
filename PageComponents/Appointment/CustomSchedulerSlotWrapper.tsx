import React, {FC, useState, useCallback, cloneElement, isValidElement, useEffect} from 'react';
import { Box } from '@mantine/core';
import styles from './CustomSchedulerSlotWrapper.module.css';
import { JobCard } from '@/interfaces/api/models';
import { useAtomValue } from 'jotai';
import { jobDragStateAtom } from '@/utils/atoms';

interface CustomSchedulerSlotWrapperProps {
  id: string;
  start: Date;
  end: Date;
  isMonthView?: boolean;
  isAllDay?: boolean;
  children: React.ReactNode;
  employee?: any; // Employee associated with this slot (for timeline view)
  onJobDrop?: (job: JobCard, start: Date, end: Date, isMonthView: boolean, isAllDay: boolean, employee?: any) => void;
  // Appointment duration (in minutes) from config; used to highlight next N slots while dragging
  appointmentDurationMinutes?: number;
  // Enable multi-slot span highlighting (used for timeline view only)
  enableSpanHighlight?: boolean;
}

const CustomSchedulerSlotWrapper: FC<CustomSchedulerSlotWrapperProps> = ({
  id,
  start,
  end,
  isMonthView = false,
  isAllDay = false,
  children,
  employee,
  onJobDrop,
  appointmentDurationMinutes,
  enableSpanHighlight = true,
}) => {
  const [isOver, setIsOver] = useState(false);
  
  // Get the current drag state
  const dragState = useAtomValue(jobDragStateAtom);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    // Prevent default to allow drop
    e.preventDefault();
    
    // Use the global drag state to determine if we should show visual feedback
    if (dragState.isDragging && dragState.job) {
      setIsOver(true);
    }
  }, [dragState]);

  const handleDragLeave = useCallback(() => {
    // Reset visual feedback
    setIsOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    // Prevent default browser behavior
    e.preventDefault();
    
    // Reset visual feedback
    setIsOver(false);
    
    // Get the job from the global drag state instead of dataTransfer
    // This simplifies the implementation and improves cross-browser stability
    if (dragState.isDragging && dragState.job) {
      // Call the onJobDrop callback if provided
      if (onJobDrop) {
        onJobDrop(dragState.job, start, end, isMonthView, isAllDay, employee);
      }
    }
  }, [onJobDrop, start, end, isMonthView, isAllDay, dragState, employee]);

  // Clone the child element to pass the isOver and isDragging states
  const enhancedChildren = React.Children.map(children, child => {
    if (isValidElement(child)) {
      // Pass isOver and isDragging as data attributes to avoid prop conflicts
      // Use type assertion to tell TypeScript these attributes are valid
      return cloneElement(child, {
        style: {
          ...child.props.style,
          // Apply background color directly to avoid layout shift from borders
          // ...(isOver && { backgroundColor: 'var(--mantine-color-blue-3)' }),
        },
        // className: child.props.className,
        ...({
          'data-is-over': isOver,
          'data-is-dragging': dragState.isDragging,
        } as React.HTMLAttributes<HTMLElement>)
      });
    }
    return child;
  });

  // Compute how many slots to highlight based on appointment duration and slot size
  const slotMinutes = Math.max(1, Math.round((end.getTime() - start.getTime()) / 60000));
  const shouldSpan = !!appointmentDurationMinutes && !isMonthView && !isAllDay && enableSpanHighlight;
  const desiredSlots = shouldSpan ? Math.ceil((appointmentDurationMinutes as number) / slotMinutes) : 1;
  const neededAdditional = Math.max(0, desiredSlots - 1);
  const MAX_SPAN = 12;
  // If the needed span exceeds the available utility classes, do not highlight at all
  const additionalSiblings = neededAdditional > MAX_SPAN ? 0 : Math.min(MAX_SPAN, neededAdditional);
  const spanClass = (isOver && dragState.isDragging && shouldSpan && additionalSiblings > 0 ? styles[`span-${additionalSiblings}`] : '') || '';

  return (
    <Box
      className={`${styles.droppableSlot} ${isOver ? styles.isOver : ''} ${dragState.isDragging ? styles.isDragging : ''} ${spanClass} ${enableSpanHighlight ? styles.timelineHighlight : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {enhancedChildren}
    </Box>
  );
};

export default CustomSchedulerSlotWrapper;