import React, { useState, useEffect, useContext } from 'react';
import Fetch from '../../../utils/Fetch';
import Time from '../../../utils/time';
import Helper from '../../../utils/helper';
import SCNumericInput from '../../sc-controls/form-controls/sc-numeric-input';
import SCCheckbox from '../../sc-controls/form-controls/sc-checkbox';
import SCTextArea from '../../sc-controls/form-controls/sc-textarea';
import SCDatePicker from '../../sc-controls/form-controls/sc-datepicker';
import SCTimePicker from '../../sc-controls/form-controls/sc-timepicker';
import * as Enums from '../../../utils/enums';
import EmployeeSelector from '../../selectors/employee/employee-selector';
import EmployeeService from '../../../services/employee/employee-service';
import ToastContext from '../../../utils/toast-context';
import SCSwitch from "../../sc-controls/form-controls/sc-switch";
import SCModal from '@/PageComponents/Modal/SCModal';
import { Button, Flex, Title } from "@mantine/core";

interface EditJobCardTimeProps {
    jobCard: any;
    jobCardTime: any;
    updateTimers: () => void;
    isNew: boolean;
    accessStatus: any;
    cypressDuration?: string;
    cypressEmployee?: string;
    cypressDescription?: string;
    cypressSave?: string;
}

const EditJobCardTime: React.FC<EditJobCardTimeProps> = ({ jobCard, jobCardTime, updateTimers, isNew, accessStatus, cypressDuration, cypressEmployee, cypressDescription, cypressSave }) => {

    const toast = useContext<any>(ToastContext);

    useEffect(() => {
        getSelectedEmployee();
    }, []);

    const [inputs, setInputs] = useState<any>({
        StartTime: jobCardTime.StartTime,
        EndTime: jobCardTime.EndTime ? jobCardTime.EndTime : jobCardTime.StartTime,
        Duration: jobCardTime.Duration,
        EmployeeID: jobCardTime.EmployeeID,
        EmployeeFullName: jobCardTime.EmployeeFullName,
        IsTime: jobCardTime.IsTime,
        Billable: jobCardTime.Billable,
        Overtime: jobCardTime.Overtime,
        SLAtime: jobCardTime.SLAtime,
        Description: jobCardTime.Description,
        IsActive: jobCardTime.IsActive,
    });

    useEffect(() => {
        if(inputs.IsTime === false) {
            if (jobCardTime.EndTime !== null) {
                let miliDiff = Time.getTimeDifference(jobCardTime.StartTime, jobCardTime.EndTime);
                let minutes = miliDiff / (60 * 1000);
                const minutesRounded = Math.ceil(minutes);
                jobCardTime.Duration = minutesRounded
                handleDurationChange({value: minutesRounded})
            }
        }
    }, [inputs.IsTime]);
    useEffect(() => {
        if(inputs.IsTime === false) {
            if(inputs.StartTime && +inputs.Duration) {
                const formattedDate = Time.toISOString(Time.addSeconds(inputs.Duration * 60, inputs.StartTime));
                handleInputChange({
                    value: formattedDate,
                    name: 'EndTime'
                });
            }
        }
    }, [inputs.Duration, inputs.StartTime, inputs.IsTime]);

    const [inputErrors, setInputErrors] = useState<Record<string, any>>({});
    const [selectedEmployee, setSelectedEmployee] = useState<any>(null);

    const getSelectedEmployee = async (): Promise<void> => {
        if (!isNew && jobCardTime && jobCardTime.EmployeeID) {
            setSelectedEmployee(await EmployeeService.getEmployee(jobCardTime.EmployeeID));
        }
    };

    const handleInputChange = (e: any) => {
        setInputs({
            ...inputs,
            [e.name]: e.value
        });
    }

    function cancel(): void {
        updateTimers();
    }

    const validate = (): boolean => {

        let validationInputs: any = [{ key: "EmployeeID", value: selectedEmployee, type: Enums.ControlType.Select, required: true },
        { key: "StartDate", value: inputs.StartTime, type: Enums.ControlType.Date, required: true, lt: null, gt: null }];

        if (inputs.IsTime) {
            validationInputs = [...validationInputs,
            { key: "EndDate", value: inputs.EndTime, type: Enums.ControlType.Date, required: true, lt: null, gte: inputs.StartTime, df: 'yyyy-MM-dd', dateOnly: true },
            { key: "EndTime", value: inputs.EndTime, type: Enums.ControlType.Date, required: true, lt: null, gt: inputs.StartTime, tf: 'hh:mm:ss' }
            ];
        } else {
            validationInputs = [...validationInputs,
            { key: "Duration", value: inputs.Duration, type: Enums.ControlType.Number, required: true, lt: null, gt: 0 }
            ];
        }

        const { isValid, errors } = Helper.validateInputs(validationInputs);

        setInputErrors(errors);
        return isValid;
    };

    async function saveChanges(): Promise<void> {
        if (validate()) {
            // transpose input values onto jobCardTime object for modification submission
            jobCardTime = Helper.copyFrom(inputs, jobCardTime);
            jobCardTime.EmployeeID = selectedEmployee ? selectedEmployee.ID : null;
            let method = isNew ? Fetch.post : Fetch.put;
            const result = await method({
                url: "/JobTime",
                params: jobCardTime
            });
            if (result.ID) {
                toast.setToast({
                    message: 'Timer saved successfully',
                    show: true,
                    type: Enums.ToastType.success
                });
            }
            // trigger a refresh on parent control
            updateTimers();
        }
    }

    function dateChanged(e: any, fieldName: string): void {
        setInputs({
            ...inputs,
            [fieldName]: Time.toISOString(Time.updateDate(inputs[fieldName], e.value))
        });
    }

    function timeChanged(e: any, fieldName: string): void {
        if(typeof e.value === 'string' && !!e.value.split('T')[1]) {
            let newVal = Time.toISOString(Time.updateTime(inputs[fieldName], e.value));
            let start = fieldName === "StartTime" ? newVal : inputs.StartTime;
            let end = fieldName === "EndTime" ? newVal : inputs.EndTime;

            let miliDiff = Time.getTimeDifference(start, end);
            let minutes = miliDiff / (60 * 1000);
            let minutesRounded = Math.ceil(minutes);

            setInputs({
                ...inputs,
                [fieldName]: newVal,
                Duration: minutesRounded
            });
        } else {
            if(typeof e.value === 'string' && !e.value.split('T')[1] && e.value.split('T')[0]?.length === 10) {
                timeChanged({value: e.value + '00:00:00'}, fieldName)
            }
        }
    }

    function handleDurationChange(e: any): void {
        let val = parseInt(e.value);
        if (isNaN(val)) return;
        if (val < 0) return;
        let newEnd = Time.parseDate(inputs.StartTime);
        newEnd.setMinutes(newEnd.getMinutes() + val);
        setInputs({
            ...inputs,
            Duration: val,
            EndTime: Time.toISOString(newEnd)
        });
    }

    return (
        <SCModal
            open={true}
            onClose={cancel}
        >
            <Title order={3} c={'scBlue.9'}>{isNew ? "Creating" : "Editing"} timer for {jobCardTime.JobCardNumber}</Title>
            <Flex gap="xl" w="100%" mt="md" wrap="wrap">
                <Flex direction="column" flex={1} miw={280}>

                    <EmployeeSelector required selectedEmployee={selectedEmployee} setSelectedEmployee={setSelectedEmployee}
                        storeID={jobCard?.StoreID} error={inputErrors.EmployeeID} accessStatus={accessStatus} />

                    <SCCheckbox onChange={() => handleInputChange({ name: "Billable", value: !inputs.Billable })}
                        value={inputs.Billable}
                        label="Billable"
                    />

                    <SCCheckbox onChange={() => handleInputChange({ name: "Overtime", value: !inputs.Overtime })}
                        value={inputs.Overtime}
                        label="Overtime"
                    />

                    <SCCheckbox onChange={() => handleInputChange({ name: "SLAtime", value: !inputs.SLAtime })}
                        value={inputs.SLAtime}
                        label="SLAtime"
                    />

                    <SCTextArea label="Description"
                        onChange={(e) => handleInputChange({ name: "Description", value: e.value })}
                        value={inputs.Description}
                        maxLength={4000}
                    />

                </Flex>
                <Flex direction="column" flex={1} miw={280}>
                    <SCCheckbox onChange={() => {
                        handleInputChange({name: "IsTime", value: !inputs.IsTime});
                    }}
                        value={inputs.IsTime}
                        label="Use Start and End Time"
                    />

                    <SCDatePicker
                        changeHandler={(e) => dateChanged(e, "StartTime")}
                        label='Start Date'
                        required={true}
                        error={inputErrors.StartDate}
                        value={inputs.StartTime}
                    />

                    {inputs.IsTime ? <>
                        {/* do inputs for start time and end date and time */}

                        <SCTimePicker
                            changeHandler={(e) => timeChanged(e, "StartTime")}
                            label="Start Time"
                            required={true}
                            error={inputErrors.StartTime}
                            value={inputs.StartTime}
                            format="HH:mm:ss"
                        />

                        <SCDatePicker
                            changeHandler={(e) => dateChanged(e, "EndTime")}
                            label='End Date'
                            required={true}
                            minDate={inputs.StartTime}
                            error={inputErrors.EndDate}
                            value={inputs.EndTime}
                        />

                        <SCTimePicker
                            changeHandler={(e) => timeChanged(e, "EndTime")}
                            label="End Time"
                            required={true}
                            error={inputErrors.EndTime}
                            value={inputs.EndTime}
                            format="HH:mm:ss"
                            startDateAndTime={inputs.StartTime}
                            endDate={inputs.EndTime}
                        />
                    </> : <>
                        {/* do duration input only */}

                        <SCNumericInput
                            label="Duration (minutes)"
                            required={true}
                            name="Duration"
                            value={inputs.Duration}
                            min={0}
                            onChange={handleDurationChange}
                            error={inputErrors.Duration}
                            cypress={cypressDuration}
                            format={Enums.NumericFormat.Integer}
                            max={undefined}
                        />

                    </>}
                </Flex>
            </Flex>

            {!isNew ? (
                <Flex justify="end" w="100%" mt="md">
                    <SCSwitch checked={inputs.IsActive} label="Active"
                        onToggle={(checked) => handleInputChange({ name: 'IsActive', value: checked })} />
                </Flex>
            ) : null}

            <Flex justify={'end'} gap={'sm'} w={'100%'} mt={40}>
                <Button onClick={cancel} variant={'outline'}>
                    Cancel
                </Button>
                <Button onClick={saveChanges}
                        disabled={accessStatus === Enums.AccessStatus.LockedWithAccess || accessStatus === Enums.AccessStatus.LockedWithOutAccess}
                >
                    {isNew ? "Create" : "Save"}
                </Button>
            </Flex>
        </SCModal>
    )
}
export default EditJobCardTime;
