import { FC, useEffect, useState } from "react";
import styles from './JobStatusChange.module.css';
import { Box, ColorSwatch, Flex, Tooltip, Text } from "@mantine/core";
import SCDropdownList from "@/components/sc-controls/form-controls/sc-dropdownlist";
import { JobCard } from "@/interfaces/api/models";
import MiscService from '../../services/misc-service';

const JobStatusChange : FC<{
        nextJobStatuses : any[]
        job : JobCard
        checkSetNewStatus : () => void
        saving : boolean
    }> = (props) => {

        
        const [nextStatuses, setNextStatuses] = useState<any[]>([]);
        const [nextStatusCanProceed, setNextStatusCanProceed] = useState(true);
        
        const [jobStatusBackground, setJobStatusBackgound] = useState<string | undefined>(undefined);
        const [jobStatusColor, setJobStatusColor] = useState<string | undefined>(undefined);
        
        const getJobStatusColors = () => {
            let displayColor = props.job.JobStatus?.DisplayColor;
            
            const { color, backgroundColor } = MiscService.getStatusColors(displayColor);
            
            setJobStatusBackgound(backgroundColor);
            setJobStatusColor(color);
        };
        
        useEffect(() => {
        getJobStatusColors();
        }, [props.job.JobStatus]);
        
        const getNextStatuses = () => {
        let items = props.nextJobStatuses.filter((x: any) => x.IsActive);
        setNextStatusCanProceed(!items.every((x: any) => x.CanProceed == false));

        items.map((item: any) => {
        item.disabled = !item.CanProceed;
        return item;
        });
        setNextStatuses(items);
    };

    useEffect(() => {
        getNextStatuses();
    }, [props.nextJobStatuses]);


    return <>
        <Tooltip color={'scBlue'} disabled={nextStatusCanProceed}
                                             label={nextStatusCanProceed ? '' : `You do not have access to change to another status`}
                                             position={'bottom'}
                                             events={{hover: true, focus: true, touch: true}}
        >
            <Box w={{base: '100%', xs: 'auto'}} className={styles.status} style={{
                // Provide dynamic colors to CSS module via CSS variables
                ['--status-input-color' as any]: jobStatusColor,
                ['--status-input-bg' as any]: jobStatusBackground,
            }}>
                <SCDropdownList
                    mt={0}
                    required
                    options={nextStatuses}
                    onChange={props.checkSetNewStatus}
                    value={props.job.JobStatus}
                    disabled={props.saving || !nextStatusCanProceed || props.job.IsClosed}
                    dataItemKey={"ID"}
                    textField={"Description"}
                    itemRenderMantine={(item: any) => {
                        let displayColor = item.dataItem.DisplayColor;
                        const {color, backgroundColor} = MiscService.getStatusColors(displayColor);
                        return <Flex align={'center'} gap={'xs'} mih={30}>
                            <ColorSwatch bg={backgroundColor} size={13} color={color}/>
                            <Text size={'sm'}>{item.dataItem.Description}</Text>
                        </Flex>
                    }}
                    hideSelected={true}
                    suppressInternalValueChange={true}
                />
            </Box>
        </Tooltip>
    </>
}

export default JobStatusChange