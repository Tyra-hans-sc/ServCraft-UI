import { FC, useContext, useMemo, useState } from 'react';
import * as Enums from '@/utils/enums';
import SCWidgetTitle from '@/components/sc-controls/widgets/new/sc-widget-title';
import CustomerStatusSelector from '@/components/selectors/customer/customer-status-selector';
import CustomerTypeSelector from '@/components/selectors/customer/customer-type-selector';
import { Flex, Text } from '@mantine/core';
import IndustryTypeSelector from '@/components/selectors/customer/industry-type-selector';
import SCCheckbox from '@/components/sc-controls/form-controls/sc-checkbox';
import helper from '@/utils/helper';
import SCMultiSelect from '@/components/sc-controls/form-controls/sc-multiselect';
import ToastContext from '@/utils/toast-context';
import SCNumericInput from '@/components/sc-controls/form-controls/sc-numeric-input';
import SCComboBox from '@/components/sc-controls/form-controls/sc-combobox';
import JobStatusMultiSelector from '@/components/selectors/jobstatus/jobstatus-multiselector';
import SCDatePicker from '@/components/sc-controls/form-controls/sc-datepicker';
import time from '@/utils/time';

interface MessageQueueBulkFilter {
    Type: number //Enums.MessageGroupingType
    Values: string[]
    ParentType: number | null //Enums.MessageGroupingType
}

type ContactType = "Other" | "Primary" | "Accounting" | "Job";

type ParentType = 100 | 101;

const MessageQueueBulkFilterComponent: FC<{
    filters: string
    setFilters: (value: string) => void
    disabled: boolean
}> = (props) => {

    const toast = useContext(ToastContext);

    const [limitTopOptions] = useState([
        { label: "10", value: 10 },
        { label: "100", value: 100 },
        { label: "1000", value: 1000 },
        { label: "5000", value: 5000 },
        { label: "Unlimited", value: null }
    ]);

    const [marketingBlacklistLookbackOptions] = useState([
        { label: "Dont exclude", value: null },
        { label: "1 Day", value: 1 },
        { label: "7 Days", value: 7 },
        { label: "30 Days", value: 30 }
    ]);

    const deserializeFilters = () => {
        let filters: MessageQueueBulkFilter[] = [];
        if (props.filters) {
            filters = JSON.parse(props.filters);
        }
        return filters;
    }

    const getSelectedFilters = (messageGroupingType: number) => {
        let filters = deserializeFilters();
        let filter = filters.find(x => x.Type === messageGroupingType);
        if (!!filter) {
            return filter.Values;
        }

        return [];
    }

    const setSelectedFilters = (selectedIDs: string[], messageGroupingType: number) => {
        let filters = deserializeFilters();
        let filter = filters.find(x => x.Type === messageGroupingType);
        if (!!filter) {
            filter.Values = selectedIDs;
        }
        else {
            filters.push({
                Values: selectedIDs,
                Type: messageGroupingType,
                ParentType: null
            });
        }
        props.setFilters(JSON.stringify(filters));
    }


    const getMarketingBlacklistLookbackValue = () => {
        let values = getSelectedFilters(Enums.MessageGroupingType.MarketingBlacklistLookback);
        if (Array.isArray(values) && values.length === 1) {
            return +values[0];
        }
        return null;
    }

    const getMarketingBlacklistLookbackOptionValue = () => {
        let value = getMarketingBlacklistLookbackValue();

        return marketingBlacklistLookbackOptions.find(x => x.value === value);
    }

    const setMarketingBlacklistLookbackValue = (value: number | null | undefined) => {
        setSelectedFilters(value && value > 0 ? [value.toFixed(0)] : [], Enums.MessageGroupingType.MarketingBlacklistLookback);
    }

    const getLimitTopValue = () => {
        let values = getSelectedFilters(Enums.MessageGroupingType.LimitTop);
        if (Array.isArray(values) && values.length === 1) {
            return +values[0];
        }
        return null;
    }

    const getLimitTopOptionValue = () => {
        let value = getLimitTopValue();

        return limitTopOptions.find(x => x.value === value);
    }

    const setLimitTopValue = (value: number | string) => {
        let val: number | null = null;
        if (typeof value === "number") {
            val = value as number;
        }
        setSelectedFilters(val && val > 0 ? [val.toFixed(0)] : [], Enums.MessageGroupingType.LimitTop);
    }

    const getBooleanFilterValue = (messageGroupingType: number) => {
        let parentFilters = getSelectedFilters(messageGroupingType);
        if (parentFilters && parentFilters.length > 0) {
            return helper.parseBool(parentFilters[0]);
        }
        return false;
    };

    const setBooleanFilter = (messageGroupingType: number, value: boolean) => {
        setSelectedFilters([value ? "true" : "false"], messageGroupingType);
    }

    const getIndexedFilterValue = (messageGroupingType: number, index: number) => {
        let parentFilters = getSelectedFilters(messageGroupingType);
        if (parentFilters && parentFilters.length >= index + 1) {
            return parentFilters[index];
        }
        return null;
    }

    const setIndexedFilterValue = (messageGroupingType: number, index: number, value: string | null) => {
        let parentFilters = getSelectedFilters(messageGroupingType);
        (parentFilters as any[])[index] = value;
        setSelectedFilters(parentFilters, messageGroupingType);
    }

    const isContactTypeSelected = (contactType: ContactType) => {
        return getSelectedFilters(Enums.MessageGroupingType.PrimaryContactType).findIndex(x => x === contactType) > -1;
    }

    const disableJobContact = useMemo(() => {
        let filterVals = getSelectedFilters(Enums.MessageGroupingType.JobStatus);
        return !filterVals || filterVals.length === 0;
    }, [props.filters]);

    const disableFilters = useMemo(() => {
        return {
            [Enums.MessageGroupingType.CustomerFilters]: !getBooleanFilterValue(Enums.MessageGroupingType.CustomerFilters),
            [Enums.MessageGroupingType.JobFilters]: !getBooleanFilterValue(Enums.MessageGroupingType.JobFilters)
        }
    }, [props.filters]);

    const setContactType = (contactType: ContactType, value: boolean) => {
        let selectedTypes = getSelectedFilters(Enums.MessageGroupingType.PrimaryContactType);
        selectedTypes = selectedTypes.filter(x => x !== contactType);
        if (value) {
            selectedTypes.push(contactType);
        }
        else if (selectedTypes.length === 0) {
            selectedTypes.push(contactType === "Primary" ? "Other" : "Primary");
        }
        setSelectedFilters(selectedTypes, Enums.MessageGroupingType.PrimaryContactType);
    }

    return (<>

        <div style={{ width: "100%" }}>
            <SCWidgetTitle title='Filters' />

            <Text size={'sm'} c={'dimmed'} mb={0} mt={"sm"}>Use the settings below to to filter which customers and contacts that you would like to message</Text>

            <div style={{ width: "100%", marginTop: "0.5rem", background: "#00000009", padding: "0.5rem", borderRadius: "4px", fontSize: "0.8rem", fontWeight: "bold" }}>
                <SCCheckbox
                    extraClasses='no-margin'
                    value={getBooleanFilterValue(Enums.MessageGroupingType.CustomerFilters) as any}
                    label='Customer Filters'
                    onChange={(val) => setBooleanFilter(Enums.MessageGroupingType.CustomerFilters, val)}
                    disabled={props.disabled}
                />
            </div>

            {!disableFilters[Enums.MessageGroupingType.CustomerFilters] &&
                <div>
                    <Flex>
                        <div style={{ width: "100%" }}>
                            <CustomerStatusSelector
                                inOutAsID={true}
                                selectedStatuses={getSelectedFilters(Enums.MessageGroupingType.CustomerStatus)}
                                setSelectedStatuses={(ids) => setSelectedFilters(ids, Enums.MessageGroupingType.CustomerStatus)}
                                disabled={props.disabled || disableFilters[Enums.MessageGroupingType.CustomerFilters]}
                            />
                        </div>

                        <div style={{ width: "100%" }}>
                            <CustomerTypeSelector
                                inOutAsID={true}
                                selectedTypes={getSelectedFilters(Enums.MessageGroupingType.CustomerType)}
                                setSelectedTypes={(ids) => setSelectedFilters(ids, Enums.MessageGroupingType.CustomerType)}
                                disabled={props.disabled || disableFilters[Enums.MessageGroupingType.CustomerFilters]}
                            />
                        </div>
                    </Flex>

                    <Flex>
                        <div style={{ width: "100%" }}>
                            <IndustryTypeSelector
                                inOutAsID={true}
                                selectedTypes={getSelectedFilters(Enums.MessageGroupingType.IndustryType)}
                                setSelectedTypes={(ids) => setSelectedFilters(ids, Enums.MessageGroupingType.IndustryType)}
                                disabled={props.disabled || disableFilters[Enums.MessageGroupingType.CustomerFilters]}
                            />
                        </div>
                        <div style={{ width: "100%", paddingTop: "1.75rem" }}>
                            <SCCheckbox
                                value={getBooleanFilterValue(Enums.MessageGroupingType.IncludeArchivedCustomer) as any}
                                label='Include archived customers'
                                onChange={(val) => setBooleanFilter(Enums.MessageGroupingType.IncludeArchivedCustomer, val)}
                                disabled={props.disabled || disableFilters[Enums.MessageGroupingType.CustomerFilters]}
                            />
                        </div>

                    </Flex>

                    <div style={{ width: "100%", textAlign: "center", marginTop: "1rem", padding: "0.5rem", borderRadius: "4px", fontSize: "0.8rem", fontWeight: "bold" }}>
                        AND
                    </div>
                </div>
            }


            <div style={{ width: "100%", marginTop: "0.5rem", background: "#00000009", padding: "0.5rem", borderRadius: "4px", fontSize: "0.8rem", fontWeight: "bold" }}>
                <SCCheckbox
                    extraClasses='no-margin'
                    value={getBooleanFilterValue(Enums.MessageGroupingType.JobFilters) as any}
                    label='Job Filters'
                    onChange={(val) => setBooleanFilter(Enums.MessageGroupingType.JobFilters, val)}
                    disabled={props.disabled}
                />
            </div>

            {!disableFilters[Enums.MessageGroupingType.JobFilters] &&
                <div>
                    <Flex>
                        <div style={{ width: "100%" }}>
                            <JobStatusMultiSelector
                                accessStatus={Enums.AccessStatus.Live}
                                cypress={undefined}
                                error={undefined}
                                required={false}
                                disabled={props.disabled || disableFilters[Enums.MessageGroupingType.JobFilters]}
                                selectedJobStatuses={getSelectedFilters(Enums.MessageGroupingType.JobStatus)}
                                setSelectedJobStatuses={(ids) => setSelectedFilters(ids, Enums.MessageGroupingType.JobStatus)}
                                inOutAsID={true}
                            />
                        </div>
                        <div style={{ width: "100%" }}>
                            <Flex w={"100%"} justify={"space-between"} maw={"16rem"}>
                                <div style={{ width: "100%", paddingTop: "1.75rem" }}>
                                    <SCCheckbox
                                        value={getBooleanFilterValue(Enums.MessageGroupingType.OpenJobs) && !disableJobContact as any}
                                        label='Open Jobs'
                                        onChange={(val) => setBooleanFilter(Enums.MessageGroupingType.OpenJobs, val)}
                                        disabled={props.disabled || disableFilters[Enums.MessageGroupingType.JobFilters] || disableJobContact}
                                    />
                                </div>

                                <div style={{ width: "100%", paddingTop: "1.75rem" }}>
                                    <SCCheckbox
                                        value={getBooleanFilterValue(Enums.MessageGroupingType.ClosedJobs) && !disableJobContact as any}
                                        label='Closed Jobs'
                                        onChange={(val) => setBooleanFilter(Enums.MessageGroupingType.ClosedJobs, val)}
                                        disabled={props.disabled || disableFilters[Enums.MessageGroupingType.JobFilters] || disableJobContact}
                                    />
                                </div>
                            </Flex>
                        </div>
                    </Flex>
                    <Flex w={"100%"} justify={"space-between"}>
                        <div style={{ width: "50%" }}>
                            <SCDatePicker
                                label='Activity From'
                                required={false}
                                canClear={true}
                                onChange={(e) => {
                                    setIndexedFilterValue(Enums.MessageGroupingType.JobActivity, 0, e as string | null);
                                }}
                                value={!!getIndexedFilterValue(Enums.MessageGroupingType.JobActivity, 0) ? time.parseDate(getIndexedFilterValue(Enums.MessageGroupingType.JobActivity, 0)) : null}
                                name="JobActivityFrom"
                                disabled={props.disabled || disableFilters[Enums.MessageGroupingType.JobFilters] || disableJobContact}
                            />
                        </div>
                        <div style={{ width: "50%" }}>
                            <SCDatePicker
                                label='Activity To'
                                required={false}
                                canClear={true}
                                onChange={(e) => {
                                    setIndexedFilterValue(Enums.MessageGroupingType.JobActivity, 1, e as string | null);
                                }}
                                value={!!getIndexedFilterValue(Enums.MessageGroupingType.JobActivity, 1) ? time.parseDate(getIndexedFilterValue(Enums.MessageGroupingType.JobActivity, 1)) : null}
                                name="JobActivityTo"
                                disabled={props.disabled || disableFilters[Enums.MessageGroupingType.JobFilters] || disableJobContact}
                            />
                        </div>
                    </Flex>

                    <div style={{ width: "100%", textAlign: "center", marginTop: "1rem", padding: "0.5rem", borderRadius: "4px", fontSize: "0.8rem", fontWeight: "bold" }}>
                        AND
                    </div>
                </div>
            }

            <Flex>
                <div style={{ width: "100%" }}>
                    <SCComboBox
                        options={marketingBlacklistLookbackOptions}
                        value={getMarketingBlacklistLookbackOptionValue()}
                        canClear={false}
                        disabled={props.disabled}
                        dataItemKey='value'
                        textField='label'
                        onChange={(e) => setMarketingBlacklistLookbackValue(e.value)}
                        label='Exclude Contacts who received a bulk sms in the last'
                        hasNullKey={true}
                    />
                </div>

                <div style={{ width: "100%" }}>
                    <SCComboBox
                        options={limitTopOptions}
                        value={getLimitTopOptionValue()}
                        canClear={false}
                        disabled={props.disabled}
                        dataItemKey='value'
                        textField='label'
                        onChange={(e) => setLimitTopValue(e.value)}
                        label='Limit Number of Contacts'
                        hasNullKey={true}
                    />
                </div>
            </Flex>

            <Text size={'sm'} mb={0} mt={"sm"}>Contacts to send to</Text>
            <Flex>
                <div style={{ width: "100%" }}>
                    <Flex justify={"space-between"} maw={"25rem"}>
                        <SCCheckbox
                            value={isContactTypeSelected("Primary") as any}
                            label='Primary'
                            onChange={(val) => setContactType("Primary", val)}
                            disabled={props.disabled}
                        />

                        <SCCheckbox
                            value={isContactTypeSelected("Accounting") as any}
                            label='Accounting'
                            onChange={(val) => setContactType("Accounting", val)}
                            disabled={props.disabled}
                        />

                        <SCCheckbox
                            value={isContactTypeSelected("Other") as any}
                            label='Others'
                            onChange={(val) => setContactType("Other", val)}
                            disabled={props.disabled}
                        />

                        <SCCheckbox
                            value={(isContactTypeSelected("Job") && !disableJobContact) as any}
                            label='Linked to Job'
                            onChange={(val) => setContactType("Job", val)}
                            disabled={props.disabled || disableJobContact || disableFilters[Enums.MessageGroupingType.JobFilters]}
                        />
                    </Flex>
                </div>

            </Flex>
        </div>
        <style jsx>{`
            
        `}</style>
    </>);
};

export default MessageQueueBulkFilterComponent;
