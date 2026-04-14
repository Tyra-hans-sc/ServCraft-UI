import React from 'react';
import styles from './StocktakeTimeline.module.css';
import {IconCircle, IconCircleCheckFilled, IconCircleX, IconInfoCircle} from "@tabler/icons-react";
import * as enums from "@/utils/enums";
import {Alert, Tooltip} from "@mantine/core";
import {StocktakeStatusText} from "@/utils/enums";

export const StocktakeStatus = enums.StocktakeStatus;

const getStatusName = (status) => {
    switch (status) {
        /*case StocktakeStatus.Draft:
            return 'Draft';*/
        case StocktakeStatus.Pending:
            return 'Pending';
        case StocktakeStatus.Counting:
            return 'Counting';
        case StocktakeStatus.CountingComplete:
            return 'Counting Complete';
        case StocktakeStatus.StocktakeComplete:
            return 'Stock Take Complete';
        case StocktakeStatus.Cancelled:
            return 'Cancelled';
        default:
            return 'Unknown';
    }
};

const getStatusDescription = (status) => {
    switch (status) {
        /*case StocktakeStatus.Draft:
            return 'The stock take is currently in draft mode. Please add and review items before finalizing the stock take draft.';*/
        case StocktakeStatus.Pending:
            return 'The stock take is ready to be counted. The assigned member can start counting when they are ready.';
        case StocktakeStatus.Counting:
            return `Counting is in progress. Click 'Complete Counting' to verify stock levels.`;
        case StocktakeStatus.CountingComplete:
            return 'All items have been counted. Review the counts and make stock level adjustments to finalize the warehouse inventory.';
        case StocktakeStatus.StocktakeComplete:
            return 'The stock take has been completed. Inventory has been updated based on the counts.';
        case StocktakeStatus.Cancelled:
            return 'This stock take has been cancelled and will not be processed.';
        default:
            return 'Status description not available.';
    }
};

const getStatusTooltip = (status) => {
    switch (status) {
        /*case StocktakeStatus.Draft:
            return 'Initial stage where the stock take details are being prepared';*/
        case StocktakeStatus.Pending:
            return 'Stock take is finalized and awaiting the counting process to begin';
        case StocktakeStatus.Counting:
            return 'The physical counting of inventory items is in progress';
        case StocktakeStatus.CountingComplete:
            return 'All physical counting is finished and awaiting final verification';
        case StocktakeStatus.StocktakeComplete:
            return 'Stock take is finished and inventory levels have been updated';
        case StocktakeStatus.Cancelled:
            return 'Stock take was terminated before completion';
        default:
            return 'Status description not available';
    }
};

const Timeline = ({ currentStatus, minimal = false }) => {
    // Define the sequence of statuses to display (excluding Cancelled)
    const timelineStatuses = [
        // StocktakeStatus.Draft,
        StocktakeStatus.Pending,
        StocktakeStatus.Counting,
        StocktakeStatus.CountingComplete,
        StocktakeStatus.StocktakeComplete,
    ];

    // Special case for Cancelled status
    const isCancelled = currentStatus === StocktakeStatus.Cancelled;

    const statusColor = StocktakeStatusText[currentStatus]?.color || 'var(--mantine-color-scBlue-5)'; // Fallback to blue

    return (
        <div className={`${styles.timelineContainer} ${minimal ? styles.minimal : ''}`}>
            <div className={styles.timeline}>
                {timelineStatuses.map((status, index) => {
                    const isActive = !isCancelled && status <= currentStatus;
                    const isCurrent = status === currentStatus;

                    // Create dynamic style objects
                    const stepStyle = {
                        borderColor: isActive ? statusColor : '#e0e0e0',
                        color: isActive ? statusColor : 'inherit',
                        backgroundColor: isCurrent ? statusColor : 'white',
                    };

                    const lineStyle = {
                        backgroundColor: isActive ? statusColor : '#e0e0e0',
                    };


                    return (
                        <Tooltip
                            key={status}
                            // disabled={!minimal}
                            label={
                                isCurrent ? getStatusDescription(status) :
                                    getStatusTooltip(status)
                            }
                            openDelay={500}
                            multiline
                            color={enums.StocktakeStatusText[status]?.color}
                            // color={statusColor}
                        >
                            <div className={styles.timelineItem}
                                 style={{
                                     // cursor: minimal ? 'help' : 'default',
                                     cursor: 'help',
                            }}
                            >
                                <div className={styles.timelineStepContainer}>
                                    {/* Line before the first node should not be visible */}
                                    {index > 0 && (
                                        <div
                                            className={styles.timelineLineLeft}
                                            style={lineStyle}
                                        />
                                    )}

                                    <div
                                        className={`${styles.timelineStep} ${isCurrent ? styles.currentStep : ''}`}
                                        style={stepStyle}
                                    >
                                        {
                                            isCancelled ? (
                                                    <IconCircleX className={styles.icon} style={{ color: 'var(--mantine-color-yellow-7)' }}/>
                                                ) :
                                                isActive && !isCurrent ? (
                                                    <IconCircleCheckFilled className={styles.icon}
                                                                           style={{ color: isCurrent ? 'white' : statusColor }}
                                                    />
                                                ) : (
                                                    <IconCircle className={styles.icon}
                                                                style={{ color: isCurrent ? 'white' : statusColor }}
                                                    />
                                                )}
                                    </div>

                                    {/* Line after the last node should not be visible */}
                                    {index < timelineStatuses.length - 1 && (
                                        <div
                                            className={styles.timelineLineRight}
                                            style={timelineStatuses[index + 1] <= currentStatus && lineStyle || {}}
                                        />
                                    )}
                                </div>

                                <div className={styles.timelineLabel}>
                                    {getStatusName(status)}
                                </div>
                            </div>
                        </Tooltip>
                    );
                })}
            </div>

            {
                !minimal &&
                <div className={styles.descriptionContainer}>
                    <Alert variant={currentStatus === enums.StocktakeStatus.Cancelled ? "light" : "outline"} color={enums.StocktakeStatusText[currentStatus]?.color} title={getStatusName(currentStatus)} icon={<IconInfoCircle />}>
                        {getStatusDescription(currentStatus)}
                    </Alert>
                </div>
            }
        </div>
    );
};

export default Timeline;