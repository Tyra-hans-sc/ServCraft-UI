import React, {useEffect, useRef, useState } from 'react';
import { Slider } from "@mui/material";
import {ActionIcon, Box, Text} from "@mantine/core";
import { IconMinus, IconPlus } from "@tabler/icons-react";
import {Attachment} from "@/interfaces/api/models";
import Image from "next/image";

import styles from '../Attachment/PreviewAttachmentComponent.module.css'

interface ImageWithZoom {
  attachment: Attachment;
}

const ImageWithZoom: React.FC<ImageWithZoom> = ({ attachment }) => {
  const [zoom, setZoom] = useState<number>(100);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const scrollPercentageRef = useRef<{ x: number; y: number }>({ x: 0.5, y: 0.5 });
  const blockScrollEventRef = useRef<boolean>(false);

  const calculateScrollPercentage = () => {
    if (!scrollContainerRef.current) return { x: 0.5, y: 0.5 };

    const { offsetHeight, offsetWidth, scrollTop, scrollLeft, scrollHeight, scrollWidth } = scrollContainerRef.current;

    const viewportCenter = {
      x: scrollLeft + offsetWidth / 2,
      y: scrollTop + offsetHeight / 2,
    };

    return {
      x: viewportCenter.x / scrollWidth,
      y: viewportCenter.y / scrollHeight,
    };
  };

  const handleZoom = (zoomPercent: number) => {
    if (!scrollContainerRef.current) return;

    blockScrollEventRef.current = true;
    setZoom(zoomPercent);

    const content = scrollContainerRef.current.children[0] as HTMLElement | null;
    if (!content) return;

    content.style.width = `${zoomPercent}%`;
    content.style.height = `${zoomPercent}%`;

    const scrollDiff = {
      x: scrollContainerRef.current.scrollWidth * (scrollPercentageRef.current.x - calculateScrollPercentage().x),
      y: scrollContainerRef.current.scrollHeight * (scrollPercentageRef.current.y - calculateScrollPercentage().y),
    };

    scrollContainerRef.current.scrollTo({
      left: scrollContainerRef.current.scrollLeft + scrollDiff.x,
      top: scrollContainerRef.current.scrollTop + scrollDiff.y,
      behavior: 'auto',
    });

    blockScrollEventRef.current = false;
  };

  const handleScrollEvent = () => {
    if (blockScrollEventRef.current || !scrollContainerRef.current) return;
    scrollPercentageRef.current = calculateScrollPercentage();
  };

  // dragging functionality
  const [isDragging, setIsDragging] = useState(false);
  const [startDragPosition, setStartDragPosition] = useState({ x: 0, y: 0 });
  const [startScrollPosition, setStartScrollPosition] = useState({ x: 0, y: 0 });

  // Add these new handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return;

    setIsDragging(true);
    setStartDragPosition({
      x: e.clientX,
      y: e.clientY
    });
    setStartScrollPosition({
      x: scrollContainerRef.current.scrollLeft,
      y: scrollContainerRef.current.scrollTop
    });

    // Prevent image dragging
    e.preventDefault();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current) return;

    const deltaX = e.clientX - startDragPosition.x;
    const deltaY = e.clientY - startDragPosition.y;

    scrollContainerRef.current.scrollTo({
      left: startScrollPosition.x - deltaX,
      top: startScrollPosition.y - deltaY,
      behavior: 'auto'
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Add these to useEffect to handle mouse up outside the container
  React.useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, []);

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey) {
      e.preventDefault(); // Prevent default zoom behavior

      const zoomDelta = e.deltaY < 0 ? 10 : -10; // Zoom in for scroll up, out for scroll down
      const newZoom = Math.min(Math.max(zoom + zoomDelta, 100), 1000); // Limit zoom between 50% and 500%

      handleZoom(newZoom);
    }
  };

  useEffect(() => {
    const preventDefaultZoom = (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault();
      }
    };

    // Add the event listener with the 'capture' phase
    window.addEventListener('wheel', preventDefaultZoom, { passive: false });

    // Cleanup
    return () => {
      window.removeEventListener('wheel', preventDefaultZoom);
    };
  }, []);




  return (

      <>
        <Box pos={'relative'}>
          <Text
              style={{
                color: 'white',
                backgroundColor: 'var(--mantine-color-scBlue-9)',
                opacity: 0.7,
                borderRadius: 5,
                zIndex: 1000,
                // fontSize: 12,
              }}
              p={8}
              pos={'absolute'} fw={600} size={'xs'}
              top={20} right={22}
          >
            <kbd>ctrl</kbd> + <kbd>scroll</kbd> to zoom
          </Text>

          <div className={styles.zoomControlBar}>
            <ActionIcon
                variant={'transparent'}
                onClick={() => handleZoom(zoom + 50)}
            >
              <IconPlus/>
            </ActionIcon>
            <Slider orientation={'vertical'}
                    onChange={(x, val) => handleZoom(val as number)}
                    min={100} max={1000}
                    track={false}
                    value={zoom}
                    valueLabelFormat={(x) => Math.floor(x / 100) + 'x'}
                    getAriaValueText={(x) => `${x} %`}
                    valueLabelDisplay={'auto'}
                    aria-label={'Zoom'}
            />
            <ActionIcon
                variant={'transparent'}
                onClick={() => handleZoom((zoom - 50) < 100 ? 100 : (zoom - 50))}
            >
              <IconMinus/>
            </ActionIcon>
          </div>
          {attachment.ContentType?.startsWith('image') &&
              <div
                  className={styles.zoomContainer}
                  ref={scrollContainerRef}
                  onScroll={handleScrollEvent}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onWheel={(e) => {
                    handleWheel(e)
                    e.preventDefault();
                  }}
                  style={{ cursor: isDragging ? 'grabbing' : 'grab' }}

              >

                <div onDoubleClick={() => handleZoom(zoom + 50)} style={{
                  height: `100%`,
                  width: `100%`,
                  position: 'absolute',
                  display: 'block'
                }}>
                  <Image
                      src={attachment.Url || attachment.UrlThumb || ''}
                      alt={''}
                      placeholder={'blur'}
                      blurDataURL={attachment.UrlThumb}
                      quality={100}
                      objectFit={'contain'}
                      objectPosition={'center'}
                      layout={'fill'}
                  />
                </div>
              </div>
          }
        </Box>
      </>
  );
};

export default ImageWithZoom;