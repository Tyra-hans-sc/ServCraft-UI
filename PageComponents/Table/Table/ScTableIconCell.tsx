import {FC} from "react";
import {Avatar, Flex, Group, useMantineTheme} from "@mantine/core";
import {IconCheck, IconX} from "@tabler/icons-react";
import {ColumnMappingData} from "@/PageComponents/Table/table-model";
import helper from "@/utils/helper";


const ScTableIconCell: FC<{col: ColumnMappingData; data: any, emptyState?: string | null}> = ({data, col, emptyState = undefined}) => {

    const theme = useMantineTheme()

    const useIsEmpty = () => {
        return !helper.isNullOrWhitespace(emptyState);
    };

    const isTicked = () => {
        return !isEmpty() && (col.InverseLogic ? !data[col.ColumnName] : data[col.ColumnName]);
    };

    const isCrossed = () => {
        return !isEmpty() && (col.InverseLogic ? data[col.ColumnName] : !data[col.ColumnName]);
    };

    const isEmpty = () => {
        return useIsEmpty() && helper.isNullOrWhitespace(data[col.ColumnName]);
    }

    return <>
        {
            isTicked() ? (
                <Avatar color="gray.1" size={'sm'} radius={'md'}>
                    <IconCheck size={15} color={theme.colors.scBlue[5]} style={{marginRight: 2, marginBottom: 2}} />
                </Avatar>
            ) : isCrossed() ? (
                <Avatar color="gray.1" size={'sm'} radius={'md'}>
                    <IconX size={15} style={{marginRight: 2, marginBottom: 2}} color={theme.colors.red[4]}/>
                </Avatar>
            ) : isEmpty() ? (<>
            {emptyState}
            </>) : <></>
        }
    </>
}

export default ScTableIconCell
