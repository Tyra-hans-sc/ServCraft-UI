import { FC } from 'react';
import * as Enums from '@/utils/enums';
import { Warehouse } from '@/interfaces/api/models';
import { IconBuildingWarehouse, IconTruck } from '@tabler/icons-react';

const WarehouseTypeIcon: FC<{ 
    warehouse: Warehouse
 }> = ({ warehouse }) => {



    return (<>

        <span>
            {warehouse?.WarehouseType === Enums.WarehouseType.Warehouse ? <IconBuildingWarehouse size={16} /> :
                warehouse?.WarehouseType === Enums.WarehouseType.Mobile ? <IconTruck size={16} /> :
                    ""}</span>

    </>);
};

export default WarehouseTypeIcon;