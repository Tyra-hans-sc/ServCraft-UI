import { FC } from 'react';
import EditPermissionsNew from '../permissions/edit-permissions-new';
import { Button, Flex } from '@mantine/core';

const EmployeePermissionsTab: FC<{ employee: any }> = ({ employee }) => {



    return (<>

   
        <EditPermissionsNew employee={employee} onUpdate={(selectedPermissionIDs) => { }} />

        <style jsx>{`
            
        `}</style>
    </>);
};

export default EmployeePermissionsTab;