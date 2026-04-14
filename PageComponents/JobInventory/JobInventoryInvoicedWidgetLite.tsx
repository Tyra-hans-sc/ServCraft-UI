import jobInventoryService, { JobInventoryInvoicedWidgetResponse } from '@/services/job/job-inventory-service';
import Fetch from '@/utils/Fetch';
import helper from '@/utils/helper';
import ToastContext from '@/utils/toast-context';
import { Button, Flex } from '@mantine/core';
import { IconTimeline } from '@tabler/icons-react';
import { FC, useContext, useEffect, useMemo, useRef, useState } from 'react';

const JobInventoryInvoicedWidgetLite: FC<{ job, widgetData?: JobInventoryInvoicedWidgetResponse, onClick?: () => void }> = (props) => {

    const [isLoading, setIsLoading] = useState(true);
    const [widgetData, setWidgetData] = useState<JobInventoryInvoicedWidgetResponse>(props.widgetData || { Lines: [] });
    const toast = useContext(ToastContext);
    const [currencySymbol, setCurrencySymbol] = useState<any>("");

    const getData = async () => {
        setIsLoading(_ => true);
        let data = await jobInventoryService.getJobInventoryInvoicedWidget(props.job.ID, toast);
        setWidgetData(data);
        setIsLoading(_ => false);
    }

    useEffect(() => {
        if (!!props.widgetData) {
            setWidgetData(props.widgetData);
        }
    }, [props.widgetData]);

    const previousJobData = useRef("");

    useEffect(() => {

        if (!!props.widgetData) return;

        let currentJobData = JSON.stringify(props.job);
        if (previousJobData.current !== currentJobData && !!props.job?.ID) getData();
        previousJobData.current = currentJobData;
    }, [props.job]);

    const totalProfit = useMemo(() => {
        return widgetData.Lines.reduce((prev, curr) => {
            return prev + curr.Profit;
        }, 0);
    }, [widgetData]);

    const totalProjectedProfit = useMemo(() => {
        return widgetData.Lines.reduce((prev, curr) => {
            return prev + curr.ProjectedProfit;
        }, 0);
    }, [widgetData]);

    const totalPriceExcl = useMemo(() => {
        return widgetData.Lines.reduce((prev, curr) => {
            return prev + curr.TotalPriceExcl;
        }, 0);
    }, [widgetData]);

    const totalCostOfSale = useMemo(() => {
        return widgetData.Lines.reduce((prev, curr) => {
            return prev + curr.TotalCostOfSale;
        }, 0);
    }, [widgetData]);


    useEffect(() => {
        Fetch.get({
            url: '/Company'
        }).then(company => {
            setCurrencySymbol(company.Currency?.Symbol);
        });
    }, [])

    return (<>


        {widgetData.Lines.length > 0 && <Flex gap={"sm"}>

            <Button
                variant={'light'}
                color={totalProjectedProfit > 0 ? "green" : "orange"}
                miw={'auto'}
                px={''}
                onClick={props.onClick}
            >
                <div>
                    <div><IconTimeline style={{ position: "relative", top: 4, marginRight: 4 }} size={16} /><span style={{color: "var(--dark-primary-color)"}}>Estimated Profit</span> </div>
                    <div style={{ textAlign: "right", fontWeight: "bold", fontSize: "1.1rem", color: "var(--dark-primary-color)" }}>
                        {helper.getCurrencyValue(totalProjectedProfit, currencySymbol)}
                    </div>
                </div>
            </Button>

            <Button
                variant={'light'}
                color={totalProfit > 0 ? "green" : "orange"}
                miw={'auto'}
                px={''}
                onClick={props.onClick}
            >
                <div>
                    <div><IconTimeline style={{ position: "relative", top: 4, marginRight: 4 }} size={16} /><span style={{color: "var(--dark-primary-color)"}}>Net Profit</span> </div>
                    <div style={{ textAlign: "right", fontWeight: "bold", fontSize: "1.1rem", color: "var(--dark-primary-color)" }}>
                        {helper.getCurrencyValue(totalProfit, currencySymbol)}
                    </div>
                </div>
            </Button>


        </Flex>}


        <style jsx>{`
            .profit-capsule {
                padding: 0.5rem 1rem;
                color: white;
                border-radius: 3px;
                cursor: pointer;
            }
        `}</style>
    </>);
};

export default JobInventoryInvoicedWidgetLite;