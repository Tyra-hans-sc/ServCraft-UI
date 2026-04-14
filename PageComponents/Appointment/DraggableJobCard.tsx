import React, { FC, useState, useRef, useEffect } from 'react';
import { Box, Paper } from '@mantine/core';
import { JobCard } from '@/interfaces/api/models';
import styles from './DraggableJobCard.module.css';
import { useSetAtom } from 'jotai';
import { jobDragStateAtom } from '@/utils/atoms';

interface DraggableJobCardProps {
  job: JobCard;
  children: React.ReactNode;
}

const DraggableJobCard: FC<DraggableJobCardProps> = ({ job, children }) => {
  const [dragging, setDragging] = useState(false);
  const previewRef = useRef<HTMLDivElement | null>(null);
  const originalRef = useRef<HTMLDivElement | null>(null);
  
  // Get setter function for global drag state
  const setJobDragState = useSetAtom(jobDragStateAtom);

  // Create a custom preview element
  useEffect(() => {
    // Create the preview element if it doesn't exist
    if (!previewRef.current) {
      const preview = document.createElement('div');
      preview.className = styles.dragPreview;
      preview.style.position = 'absolute';
      preview.style.top = '-1000px'; // Position off-screen initially
      preview.style.pointerEvents = 'none';
      document.body.appendChild(preview);
      previewRef.current = preview;
    }

    // Clean up on unmount
    return () => {
      if (previewRef.current) {
        document.body.removeChild(previewRef.current);
        previewRef.current = null;
      }
    };
  }, []);
  
  // Ensure drag state is reset if component unmounts during drag
  useEffect(() => {
    // Clean up on unmount
    return () => {
      // Reset global drag state if component is unmounted
      setJobDragState({
        isDragging: false,
        job: null
      });
    };
  }, [setJobDragState]);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    // We no longer need to set data in dataTransfer since we're using global state
    // Just set effectAllowed for visual feedback
    e.dataTransfer.effectAllowed = 'copy';

    // Create a custom drag image
    if (previewRef.current && originalRef.current) {
      // Clone the content for the preview
      const content = originalRef.current.cloneNode(true) as HTMLElement;
      
      // Clear the preview container and add the cloned content
      previewRef.current.innerHTML = '';
      previewRef.current.appendChild(content);
      
      // Apply custom styling to make it look different
      previewRef.current.style.width = `${originalRef.current.offsetWidth}px`;
      previewRef.current.style.backgroundColor = 'var(--mantine-color-blue-1)';
      previewRef.current.style.border = '2px solid var(--mantine-color-blue-5)';
      previewRef.current.style.borderRadius = '8px';
      previewRef.current.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
      previewRef.current.style.padding = '8px';
      previewRef.current.style.transform = 'scale(0.95)';
      
      // Set the custom drag image
      e.dataTransfer.setDragImage(
        previewRef.current,
        20, // x offset
        20  // y offset
      );
    }
    
    // Update local state to show we're dragging
    setDragging(true);
    
    // Update global drag state
    setJobDragState({
      isDragging: true,
      job: job
    });
  };

  const handleDragEnd = () => {
    // Reset local dragging state
    setDragging(false);
    
    // Reset global drag state
    setJobDragState({
      isDragging: false,
      job: null
    });
  };

  return (
    <Box
      ref={originalRef}
      className={`${styles.draggableItem} ${dragging ? styles.isDragging : ''}`}
      draggable={true}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {children}
    </Box>
  );
};

export default DraggableJobCard;