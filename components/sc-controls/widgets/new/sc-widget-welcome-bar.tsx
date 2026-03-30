import { DashboardConfig, WidgetConfig } from '@/PageComponents/Dashboard/DashboardModels';
import {FC, useMemo, useState} from 'react';
import SCWidgetTitle from './sc-widget-title';
import storage from '@/utils/storage';
import * as Enums from '@/utils/enums';
import {Box, Button, Flex, Menu} from '@mantine/core';
import SCCheckbox from '../../form-controls/sc-checkbox';
import StoreSelector from "@/components/selectors/store/store-selector";
import StoreService from "@/services/store/store-service";
import {useQuery} from "@tanstack/react-query";
import {useMediaQuery} from "@mantine/hooks";

const SCWidgetWelcomeBar: FC<{
    widget: WidgetConfig
    onDismiss?: () => void
    dashboardConfig: DashboardConfig
    updateDashboardConfig: (updatedConfig: DashboardConfig) => void
    onStoreSelected: (newStoreToUse: any) => void
}> = ({ widget, onDismiss, dashboardConfig, updateDashboardConfig, onStoreSelected }) => {

    const isMultiStore = useQuery<boolean>(['multistore'], () => StoreService.isMultiStore())

    const username = useMemo(() => {

        return storage.getCookie(Enums.Cookie.servFullName);

    }, []);

    const mobileView = useMediaQuery('(max-width: 768px)');

    const updateWidgetVisibility = (widget: WidgetConfig, visible: boolean) => {
        var temp = {...dashboardConfig};
        if (visible) {
            temp.dismissedIDs = temp.dismissedIDs.filter(x => x !== widget.id);
        } 
        else {
            temp.dismissedIDs.push(widget.id);
        }
        updateDashboardConfig(temp);
    }

    const personaliseButton = <Menu
        withinPortal={true}
        position={mobileView ? 'bottom-end' : 'left-start'}
        shadow='sm'
        withArrow={true}
        closeOnItemClick={false}
        closeOnClickOutside={true}
    >
        <Menu.Target>
            <Button
                rightSection={<img src="/specno-icons/dashboard.svg" />}
                size={'xs'}
                color={'gray'}
                c={'gray.7'}
                variant={'subtle'}
            >
                Personalise Home
            </Button>
        </Menu.Target>

        <Menu.Dropdown >
            <div style={{ padding: "0.5rem", maxWidth: "250px", fontSize: "0.875rem" }}>
                <SCWidgetTitle title='Personalise Your Dashboard' marginBottom={8} />
                <div style={{ color: "#5D5F60", marginBottom: "1.25rem" }}>Customise what you see on your dashboard to align with your workflow.</div>
                {dashboardConfig?.widgets.filter(x => x.canDismiss).map((widget, key) => {

                    const isChecked = !dashboardConfig.dismissedIDs.includes(widget.id);

                    return <div key={'checklistitemw' + key}>
                        <SCCheckbox label={widget.label} value={isChecked as any} onChange={(visible) => {
                            updateWidgetVisibility(widget, visible);
                        }} />
                    </div>
                })}
            </div>
        </Menu.Dropdown>
    </Menu>

    return (<>
        <Flex justify={"space-between"} wrap={'wrap'} my={'sm'}>
            <div style={{alignSelf: 'center'}}>
                <SCWidgetTitle title={`Hey, ${username}`} size={32} marginBottom={"0.5rem"} />
                <div className="paragraph">Let&apos;s get an overview of your business.</div>
            </div>
            <Box mr={'sm'}>
                {personaliseButton}
                {
                    isMultiStore.data &&
                    <StoreSelector
                        size={'xs'}
                        hideLabel
                        setSelectedStore={onStoreSelected}
                        {...{} as any}
                    />
                }
            </Box>
        </Flex >



        <style jsx>{`
            .paragraph {
                color: #868686;
            }
            .right-button {
                margin-top: 2rem;
                color: #5D5F60;
            }
        `}</style>
    </>);
};

export default SCWidgetWelcomeBar;