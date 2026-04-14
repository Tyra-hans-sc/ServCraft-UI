import DashboardLayout from "@/PageComponents/Dashboard/DashboardLayout";
import { colors, shadows } from "@/theme";
import { withAuthSync } from "@/utils/auth";
import { FC } from "react";
import { Responsive, WidthProvider, Layout } from "react-grid-layout";
import {Box, ScrollArea} from "@mantine/core";


const DashboardPageComponent: FC<{testing: boolean}> = ({ testing = false}) => {

    return (
        <>
            <Box
                // py={'md'} px={{base: 'xs', md: 'sm'}}
                bg={'#F5F5F5'}
                // mah={'calc(100vh - 120px)'}
            >
                <DashboardLayout testing={testing}/>
            </Box>
        </>);
};

export default DashboardPageComponent;