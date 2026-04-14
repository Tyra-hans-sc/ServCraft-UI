import React, { FC } from 'react';
import { Menu, Button, Text } from '@mantine/core';
import {
    IconCalendar,
    IconCalendarDue,
    IconCalendarEvent, IconCalendarFilled, IconCalendarPin, IconCalendarStats,
    IconChevronDown,
} from '@tabler/icons-react';
import { SchedulerViewType } from '@/interfaces/scheduler-config';

interface ViewMenuProps {
    currentView: SchedulerViewType;
    onViewChange: (view: SchedulerViewType) => void;
}

const ViewMenu: FC<ViewMenuProps> = ({ currentView, onViewChange }) => {
    // Function to get the display name of the current view
    const getViewDisplayName = (view: SchedulerViewType): string => {
        switch (view) {
            case 'day':
                return 'Day View';
            case 'week':
                return 'Week View';
            case 'work-week':
                return 'Work Week View';
            case 'month':
                return 'Month View';
            case 'timeline':
                return 'Timeline View';
            default:
                return 'Calendar';
        }
    };

    return (
        <Menu shadow="md" width={200}>
            <Menu.Target>
                <Button
                    data-name={'view-menu'}
                    size="compact-md"
                    variant="light"
                    rightSection={<IconChevronDown size={16} />}
                    leftSection={<IconCalendarEvent size={16} />}
                >
                    <Text size={'sm'} fw={600}>
                        {getViewDisplayName(currentView)}
                    </Text>
                </Button>
            </Menu.Target>

            <Menu.Dropdown>
                <Menu.Label>Calendar Views</Menu.Label>
                <Menu.Item
                    onClick={() => onViewChange('day')}
                    fw={currentView === 'day' ? 'bold' : 'normal'}
                    c={currentView === 'day' ? 'scBlue' : undefined}
                    // leftSection={<IconCalendarDue size={16} />}
                >
                    Day
                </Menu.Item>
                <Menu.Item
                    onClick={() => onViewChange('work-week')}
                    fw={currentView === 'work-week' ? 'bold' : 'normal'}
                    c={currentView === 'work-week' ? 'scBlue' : undefined}
                    // leftSection={<IconCalendarEvent size={16} />}
                >
                    Work Week
                </Menu.Item>
                <Menu.Item
                    onClick={() => onViewChange('week')}
                    fw={currentView === 'week' ? 'bold' : 'normal'}
                    c={currentView === 'week' ? 'scBlue' : undefined}
                    // leftSection={<IconCalendarFilled size={16} />}
                >
                    Full Week
                </Menu.Item>
                <Menu.Item
                    onClick={() => onViewChange('month')}
                    fw={currentView === 'month' ? 'bold' : 'normal'}
                    c={currentView === 'month' ? 'scBlue' : undefined}
                    // leftSection={<IconCalendarTime size={16} />}
                >
                    Month
                </Menu.Item>
                <Menu.Item
                    onClick={() => onViewChange('timeline')}
                    fw={currentView === 'timeline' ? 'bold' : 'normal'}
                    c={currentView === 'timeline' ? 'scBlue' : undefined}
                    // leftSection={<IconTimeline size={16} />}
                >
                    Timeline
                </Menu.Item>
            </Menu.Dropdown>
        </Menu>
    );
};

export default ViewMenu;