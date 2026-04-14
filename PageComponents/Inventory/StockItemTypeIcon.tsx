import {FC} from "react";
import {Box, Tooltip} from "@mantine/core";
import {IconAssembly, IconBox, IconTool} from "@tabler/icons-react";
import * as Enums from '@/utils/enums';


const StockItemTypeIcon: FC<{stockItemType: number | undefined, size?: any}> = ({stockItemType, ...props}) => {
    return <>
        {
            typeof stockItemType !== "undefined" &&
            <Tooltip
                color={'scBlue'}
                openDelay={500}
                label={Enums.getEnumStringValue(Enums.StockItemType, stockItemType)}
            >
                <Box style={{cursor: 'help'}} c={'scBlue'}>
                    {
                        stockItemType === Enums.StockItemType.Part ? <IconAssembly size={props?.size ?? 12} color={'var(--mantine-color-indigo-5)'} /> :
                            stockItemType === Enums.StockItemType.Product ? <IconBox size={props?.size ?? 12} color={'var(--mantine-color-cyan-5)'} /> :
                                <IconTool size={props?.size ?? 12} color={'var(--mantine-color-grape-5)'} />
                    }
                </Box>
            </Tooltip>
        }
    </>
}

export default StockItemTypeIcon