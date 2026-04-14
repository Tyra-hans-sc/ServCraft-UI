import { WidgetConfig } from '@/PageComponents/Dashboard/DashboardModels';
import {FC, useEffect, useMemo, useState} from 'react';
import SCWidgetCard from './sc-widget-card';
import SCWidgetTitle from './sc-widget-title';
import { FeedbackWidgetRequest, FeedbackWidgetResponse } from './sc-widget-models';
import Fetch from '@/utils/Fetch';
import { Flex } from '@mantine/core';

const SCWidgetFeedback: FC<{
    widget: WidgetConfig
    onDismiss?: () => void
    storeID?: string | null
}> = ({
    widget,
    onDismiss,
    storeID = null
}) => {

        const [data, setData] = useState<FeedbackWidgetResponse>();
        const request = useMemo<any>(() => ({
            StartDate: null,
            storeID
        }), [storeID]);

        const loadData = async () => {
            const response = await Fetch.get({
                url: '/Dashboard/FeedbackWidget',
                params: request
            } as any);

            if (response) {
                setData(response);
            }
        };

        useEffect(() => {
            loadData();

        }, [request]);

        return (<>

            <SCWidgetCard onDismiss={onDismiss} height={widget.heightPX}>

                <SCWidgetTitle title='Customer Feedback' />

                {data && data.Lines?.map((x, key) => {
                    return <Flex direction={"row"} key={key} mb={8} justify={'space-between'}>
                        <div style={{ fontSize: "0.875rem" }}>
                            {Array.apply(null, new Array(x.Rating)).map((_, key) => {
                                return <img height={16} src={`/specno-icons/star-${x.Rating > 3 ? "green" : x.Rating > 2 ? "yellow" : x.Rating > 1 ? "orange" : "red"}.svg`} />
                            })}
                        </div>
                        <div style={{ fontSize: "0.875rem", fontWeight: "bold" }}>{x.Count}</div>
                    </Flex>
                })}

            </SCWidgetCard>


            <style jsx>{`
            
        `}</style>
        </>);
    };

export default SCWidgetFeedback;