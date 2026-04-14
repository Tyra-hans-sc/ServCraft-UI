import jobInventoryService, { JobInventoryInvoicedWidgetResponse, JobInventoryInvoicedWidgetResponseLine } from '@/services/job/job-inventory-service';
import ToastContext from '@/utils/toast-context';
import { FC, useContext, useEffect, useMemo, useRef, useState } from 'react';
import SimpleTable from '../SimpleTable/SimpleTable';
import { Flex, Text } from '@mantine/core';
import constants from '@/utils/constants';
import helper from '@/utils/helper';
import Fetch from '@/utils/Fetch';
import SCSpinner from '@/components/sc-controls/misc/sc-spinner';
import BetaText from "@/PageComponents/Premium/BetaText";
import * as Enums from '@/utils/enums';
import JobInventoryInvoicedWidgetLite from './JobInventoryInvoicedWidgetLite';

const JobInventoryInvoicedWidget: FC<{
    job: any
}> = (props) => {

    const [isLoading, setIsLoading] = useState(true);
    const toast = useContext(ToastContext);
    const [widgetData, setWidgetData] = useState<JobInventoryInvoicedWidgetResponse>({ Lines: [] });
    // const [currencySymbol, setCurrencySymbol] = useState<any>("");

    const getData = async () => {
        setIsLoading(_ => true);
        let data = await jobInventoryService.getJobInventoryInvoicedWidget(props.job.ID, toast);
        setWidgetData(data);
        setIsLoading(_ => false);
    }

    const previousJobData = useRef("");

    useEffect(() => {
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


    /*useEffect(() => {
        Fetch.get({
            url: '/Company'
        }).then(company => {
            setCurrencySymbol(company.Currency?.Symbol);
        });
    }, [])*/

    /*const sumNumbers = (numbers: number[]) => {
        return numbers.reduce((prev, num) => prev + num, 0);
    }*/

    return (<div style={{ maxWidth: constants.maxFormWidth, position: "relative" }}>

        {widgetData.Lines.length > 0 && <div style={{ position: "absolute", right: 0, top: -8 }}>
            
            <JobInventoryInvoicedWidgetLite job={props.job} widgetData={widgetData} />
        </div>
        }


        {widgetData.Lines.length >= 0 && <div style={{marginTop: 8}}><SimpleTable
            title={<Flex align={'center'} gap={'xs'} mb={10}>
                <Text size={'md'} fw={600}>
                    Job Costing <BetaText /> {isLoading && <span style={{ position: "absolute", marginLeft: 12, marginTop: -4 }}><SCSpinner colour='dark' /></span>}
                </Text>
            </Flex>}
            data={widgetData.Lines}
            mapping={[
                {
                    key: "InventoryCode",
                    label: "Code",
                    maxColumnWidth: 86,
                    required: true
                },
                {
                    key: "InventoryDescription",
                    label: "Description",
                    maxColumnWidth: 220
                },
                {
                    key: "QuantityRequested",
                    label: "Job Qty",
                    alignRight: true,
                    minColumnWidth: 55
                },
                {
                    key: "QuantityQuoted",
                    label: "Quoted *",
                    alignRight: true,
                    tooltip: "Based off approved quotes",
                    minColumnWidth: 60
                },
                {
                    key: "QuantityOnPurchaseOrder",
                    label: "PO",
                    alignRight: true,
                    minColumnWidth: 30,
                    tooltip: "Quantity on purchase order"
                },
                {
                    key: "QuantityReceived",
                    label: "Received",
                    alignRight: true,
                    minColumnWidth: 30,
                    tooltip: "Quantity received via GRV"
                },
                {
                    key: "QuantityUsed",
                    label: "Used",
                    alignRight: true,
                    minColumnWidth: 40
                },
                {
                    key: "QuantityInvoiced",
                    label: "Invoiced *",
                    alignRight: true,
                    tooltip: "Quantity invoiced - draft quantities in brackets",
                    valueFunction: (item) => {
                        return <span title={`Invoiced: ${item.QuantityInvoiced}, Draft: ${item.QuantityInvoicedDraft}`}>{item.QuantityInvoiced} <i>({item.QuantityInvoicedDraft})</i></span>
                    },
                    minColumnWidth: 65
                },
                {
                    key: "AverageRequestedCost",
                    label: "Est. Unit Cost",
                    valueFunction: (item: JobInventoryInvoicedWidgetResponseLine) => helper.getCurrencyValue(item.AverageRequestedCost),
                    currencyValue: true,
                    alignRight: true,
                    tooltip: "Estimated unit cost based off average cost price",
                    minColumnWidth: 90
                },
                {
                    key: "ProjectedProfit",
                    label: "Est. Profit *",
                    valueFunction: (item: JobInventoryInvoicedWidgetResponseLine) => {
                        return <span style={{ color: item.ProjectedProfit > 0 ? "green" : "orange" }}>{helper.getCurrencyValue(item.ProjectedProfit)}</span>
                    },
                    tooltip: "Estimated profit based on quoted and job quantity",
                    currencyValue: true,
                    alignRight: true,
                    minColumnWidth: 90
                },
                {
                    key: "TotalPriceExcl",
                    label: "Sales Total",
                    valueFunction: (item: JobInventoryInvoicedWidgetResponseLine) => helper.getCurrencyValue(item.TotalPriceExcl),
                    currencyValue: true,
                    alignRight: true,
                    tooltip: "Sale total excluding VAT",
                    minColumnWidth: 90
                },
                {
                    key: "TotalCostOfSale",
                    label: "Cost Total",
                    valueFunction: (item: JobInventoryInvoicedWidgetResponseLine) => helper.getCurrencyValue(item.TotalCostOfSale),
                    currencyValue: true,
                    alignRight: true,
                    minColumnWidth: 90
                },
                {
                    key: "Profit",
                    label: "Profit",
                    valueFunction: (item: JobInventoryInvoicedWidgetResponseLine) => {
                        return <span style={{ color: item.Profit > 0 ? "green" : "orange" }}>{helper.getCurrencyValue(item.Profit)}</span>
                    },
                    tooltip: "Actual profit based on used and invoiced items",
                    currencyValue: true,
                    alignRight: true,
                    minColumnWidth: 90
                }
            ]}
            stylingProps={
                {
                    compact: true,
                    darkerText: true,
                    rowBorders: true,
                }
            }
            height={"1000vh"}
            canEdit={false}
            // using footer row for totals
            footerRow={isLoading && widgetData.Lines.length === 0 ? [] : [
                <span key={'fitem1'} style={{ fontWeight: "bold" }}>TOTALS</span>,
                <span key={'fitem2'} style={{ fontWeight: "bold" }}></span>,
                <span key={'fitem3'} style={{ fontWeight: "bold" }}></span>,
                <span key={'fitem4'} style={{ fontWeight: "bold" }}></span>,
                <span key={'fitem5'} style={{ fontWeight: "bold" }}></span>,
                <span key={'fitem6'} style={{ fontWeight: "bold" }}></span>,
                <span key={'fitem7'} style={{ fontWeight: "bold" }}></span>,
                <span key={'fitem8'} style={{ fontWeight: "bold" }}></span>,
                <span key={'fitem9'} style={{ fontWeight: "bold" }}></span>,
                <span key={'fitem10'} style={{ fontWeight: "bold", color: totalProjectedProfit > 0 ? "green" : "orange" }}>{helper.getCurrencyValue(totalProjectedProfit)}</span>,
                <span key={'fitem11'} style={{ fontWeight: "bold" }}>{helper.getCurrencyValue(totalPriceExcl)}</span>,
                <span key={'fitem12'} style={{ fontWeight: "bold" }}>{helper.getCurrencyValue(totalCostOfSale)}</span>,
                <span key={'fitem13'} style={{ fontWeight: "bold", color: totalProfit > 0 ? "green" : "orange" }}>{helper.getCurrencyValue(totalProfit)}</span>,
            ]}
            columnDisplaySettings={{
                configurationSection: Enums.ConfigurationSection.Job,
                configurationType: Enums.ConfigurationType.CRUD,
                metaDataKey: "jobInventoryInvoicedWidgetColumnDisplaySettings"
            }}
        />
        </div>
        }

        <style jsx>{`
            
        `}</style>
    </div>);
};

export default JobInventoryInvoicedWidget;