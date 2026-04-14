import React, { FC } from 'react';
import { Tooltip, Avatar, Box } from '@mantine/core';
import EmployeeAvatar from '@/PageComponents/Table/EmployeeAvatar';
import { Employee } from '@/interfaces/api/models';

interface EmployeeGroupProps {
    employees: Employee[];
    maxItems?: number;
    spacing?: number;
    size?: number;
}

const EmployeeGroup: FC<EmployeeGroupProps> = ({ 
    employees = [], 
    maxItems = 5, 
    spacing,
    size = 1
}) => {
    if (!employees || employees.length === 0) {
        return (
            <EmployeeAvatar 
                name="" 
                useUnassignedMode={true}
                size={size}
            />
        );
    }

    return (
        <Tooltip.Group openDelay={300} closeDelay={100}>
            <Avatar.Group mt={3} style={{ display: 'flex', alignItems: 'center' }}>
                {employees.map((employee, i) => (
                    i < maxItems && (
                        <Box 
                            key={`avatar${employee.ID || i}`} 
                            ml={spacing || -7} 
                            style={{ zIndex: maxItems - i }}
                        >
                            <EmployeeAvatar
                                name={employee.FullName || ''}
                                color={employee.DisplayColor}
                                size={size}
                            />
                        </Box>
                    )
                ))}
                {employees.length > maxItems && (
                    <Tooltip
                        color={'scBlue'}
                        key={'avatarrest'}
                        withArrow
                        label={
                            <>
                                {employees.map((employee, i) => (
                                    i >= maxItems && (
                                        <div key={`employeeOther${i}`}>
                                            {employee.FullName}
                                        </div>
                                    )
                                ))}
                            </>
                        }
                    >
                        <Avatar 
                            radius="xl" 
                            size={'sm'} 
                            ml={spacing || -7} 
                            color={'scBlue'} 
                            style={{
                                transform: `scale(${size ? size : 1})`,
                                zIndex: 0,
                                verticalAlign: 'middle'
                            }}
                        >
                            +{employees.length - maxItems}
                        </Avatar>
                    </Tooltip>
                )}
            </Avatar.Group>
        </Tooltip.Group>
    );
};

export default EmployeeGroup;