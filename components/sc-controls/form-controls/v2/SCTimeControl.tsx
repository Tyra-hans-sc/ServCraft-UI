import React, {FC, useEffect, useRef, useState} from "react";
import {TimeInput, TimeInputProps} from "@mantine/dates";
import {
    Combobox,
    Flex,
    Group,
    lighten,
    ScrollArea,
    Text,
    useCombobox
} from "@mantine/core";
import Time from "@/utils/time";
import { shadows } from "@/theme";

export interface ScTimeControlCustomProps {
    // proved ALL relative dates to provide context for duration
    startDateAndTime?: string,
    endDate?: string,
    onChange?: (date) => void,
    //yyyy-mm-ddTHH:MM:SS
    value: string,
    format? : '12' | '24',
    name?: string,
    label?: string,
    error?: string | null,
    description?: string,
    required?: boolean,
    disabled?: boolean,
    withSeconds?: boolean,
}

interface TimeOption {
    label: string
    value: Date
    durationLabel: string | false
    disabled: boolean
}

const formatDefault: '12' | '24' = '24';
// changes duration format
const durationFormat: 'decimal' | '' = 'decimal';

/*const getInputFormat = () => {

    if (typeof Intl !== 'undefined' && typeof Intl.DateTimeFormat === 'function') {
        // Create a date object with specific hour and minute values
        const date = new Date(2000, 0, 1, 13, 30); // January 1st, 2000, 13:30 (1:30 PM)

        // Format the date to display only the time (hours and minutes)
        const userTimeFormat = Intl.DateTimeFormat(undefined, {
            hour: 'numeric',
            minute: 'numeric'
        }).format(date);

        return userTimeFormat.endsWith('PM') ? '12' : '24'

        // Display the time format
        // console.log('User Time Format:', userTimeFormat); // It will display the time in the user's preferred format
    } else {
        return formatDefault
        // Fallback for browsers that do not support the Internationalization API
        // console.log('Time format detection not supported in this browser.');
    }
}*/

/*
* This component outputs onChange event (date: Date) => void
* Value is of type Date and time is added to start/end date if provided
* */
const SCTimeControl: FC<ScTimeControlCustomProps & TimeInputProps> = ({
                                                                          startDateAndTime,
                                                                          endDate,
                                                                          onChange,
                                                                          //yyy,
                                                                          value,
                                                                          name,
                                                                          label,
                                                                          error,
                                                                          description,
                                                                          required,
                                                                          disabled,
                                                                          withSeconds,
                                                                          ...moreTimeInputProps
                                                                      }) => {

    const props = {
        startDateAndTime,
        endDate,
        onChange,
        //yyy,
        value,
        name,
        label,
        error,
        description,
        required,
        disabled,
        withSeconds,
    }
    // console.log('time control props', props)
    const [timeStringValue, setTimeStringValue] = useState(withSeconds ? Time.getTime(props.value) : Time.getTime(props.value).substring(0, 5))

    useEffect(() => {
        setTimeStringValue(props.withSeconds ? Time.getTime(props.value) : Time.getTime(props.value).substring(0, 5));
    }, [props.value])

    // const [popoverOpened, setPopoverOpened] = useState(false);

    const [timeOptions, setTimeOptions] = useState<TimeOption[]>([]);

    const uid = crypto.randomUUID();

    // const clickOutsideTargetRef = useClickOutside(() => setPopoverOpened(false));

    const timepickerInputRef = useRef<HTMLInputElement>(null)

    const [selectedOption, setSelectedOption] = useState<Date | null>(null);

    // users browser's locale setting
    // const [format] = useState(getInputFormat())
    const [format] = useState(formatDefault)

    /*Set selected option when value changes*/
    useEffect(() => {
        const v = props.value;
        if (v) {
            const option = timeOptions.filter(
                x => Time.getTime(x.value).substring(0, 5) === Time.getTime(v).substring(0, 5)
            )
            if (option.length !== 0) {
                setSelectedOption(option[0].value)
            } else {
                setSelectedOption(null)
            }
        }
    }, [props.value, timeOptions]);

    const [numberOfEnabledOptions, setNumberOfEnabledOptions] = useState(0);
    const setNumberOfActiveItems = (options: TimeOption[]) => setNumberOfEnabledOptions(options.filter(x => !x.disabled).length);

    /*Generate options from 12am to 11:45pm on mount*/
    useEffect(() => {
        const options: any[] = [];
        for (let i = 0; i < 24 * 4; i++) {

            // calculate starting date with no TZ info (date iso string)
            let date = Time.today()
            // if there is minimum datetime, start with that
            if(props.startDateAndTime && props.endDate) {
                date = props.startDateAndTime
                if(props.startDateAndTime.substring(0, 10) === props.endDate.substring(0, 10)) {
                    date = props.startDateAndTime
                } else {
                    const dateTime = date.split(/[\sT]/); // catering for date being split with ' ' or 'T'
                    const newTime = dateTime[1].split(':');
                    const minutesToAdd = +props.startDateAndTime.substring(14, 16) % 15;
                    newTime[0] = '00';
                    newTime[1] = minutesToAdd < 10 ? '0' + minutesToAdd : '' + minutesToAdd;
                    const dateWithAddedMinutes = dateTime[0] + 'T' + newTime.join(':');
                    date = dateWithAddedMinutes;
                    // date = Time.addSeconds(((+props.startDateAndTime.substring(15, 16) % 15) * 60) )
                }
            }

            // calculate label and Date
            const dateWTime = Time.addSeconds(60 * 15 * i, date)
            const time = Time.getTime(dateWTime).substring(0, 5)
            const split = time.split(':')

            let label: false | string = '';

            if (format === '24') {
                label = time
            } else {
                const am = +(time.substring(0, 2)) < 12
                const timeAm = am && [split[0] === '00' ? '12' : split[0], split[1]].join(':') + ' am'
                const hourPm = +split[0] - 12
                const timePm = !am && [+split[0] > 12 ? (hourPm < 10 && ('0' + hourPm) || hourPm) : split[0], split[1]].join(':') + ' pm'
                label = timeAm || timePm;
            }

            // calculate duration
            let durationLabel: false | string = false;
            let disabled = false;
            if (props.startDateAndTime && props.endDate) {
                const start = props.startDateAndTime;
                const end = Time.getDateFormatted(Time.parseDate(props.endDate), 'yyyy-MM-dd') + 'T' + time;
                const diff = Time.getTimeDifference(start, end)

                if (diff > 0) {
                    if (durationFormat === 'decimal') {
                        const decimalHours = Math.round(diff / 36000) / 100;
                        const minutes = diff < 3600000 && Math.round(diff / 60000)
                        durationLabel = minutes ? minutes + ' mins' : decimalHours + ' hrs';
                    } else {
                        const hours = diff >= 3600000 ? Math.floor(diff / 3600000) : 0;
                        const minutesTotal = Math.round(diff / 60000)
                        const minutes = hours > 0 ? (minutesTotal) - (hours * 60) : minutesTotal;
                        durationLabel = hours === 0 ? minutes + ' minutes' : hours + ` hour${hours > 1 ? 's' : ''} ` + minutes + ' minutes';
                    }
                } else {
                    disabled = true;
                }
            }

            options.push({
                label,
                value: dateWTime,
                durationLabel,
                disabled
            })
        }
        setTimeOptions(options);
        setNumberOfActiveItems(options);
    }, [props.startDateAndTime, props.endDate]);

    const handleFocus = () => {
        // setPopoverOpened(true)
        setTimeout(() => {
            if (selectedOption) {
                const i = timeOptions.findIndex(x => {
                    return (x.value === selectedOption)
                });
                const element = document.querySelector('#text' + i);
                if (element) {
                    // TODO notify Edwin on this issue - causes screen to scroll not just the drop down
                    // element.scrollIntoView({
                    //     behavior: 'auto',
                    //     block: 'start'
                    // })
                }
            }
        }, 125)
    }

    /*const handleBlur = () => setTimeout(() => {
        // when seconds/minutes is focused the active element changes - unable to fix this right now
        if (document.activeElement?.id !== timepickerInputRef.current?.id/!* && document.activeElement?.id !== ''*!/) {
            setPopoverOpened(false)
        }

    }, 500)*/

    const handleTimeInputChange = (t: string) => {
        const dateTimeISO = props.value
        const time = t.length === 5 ? t + ':00' : t
        const isoDateSplit = dateTimeISO.split(/[\sT]/)
        props.onChange && props.onChange(isoDateSplit[0] + 'T' + time)
        setTimeStringValue(t)
    };

    const setTimeFromDate = (date: Date) => {
        handleTimeInputChange(props.withSeconds ? Time.getTime(date) : Time.getTime(date).substring(0, 5))
    };

    const combobox = useCombobox({
        onDropdownOpen: handleFocus
    })

    useEffect(() => {
        if(combobox.dropdownOpened) {
            if(selectedOption) {
                const label = timeOptions.find(x => x.value === selectedOption)?.label
                document.getElementById('scrollContainer')
                    ?.querySelectorAll('.optionItem').forEach(el => {
                        const labelElement = el.firstChild?.firstChild as HTMLParagraphElement
                        if (labelElement && labelElement.innerHTML === label) {
                            labelElement.scrollIntoView({
                                block: 'center',
                                behavior: 'smooth'
                            })
                        }
                    })
            }
        }
    }, [combobox.dropdownOpened]);

    return <>
        {/*ref used for outside click to close popover*/}
        {/*<div ref={clickOutsideTargetRef}>*/}
{/*
            <Popover opened={popoverOpened} position="bottom" width="target" transition={'scale-y'}>
*/}

            <Combobox store={combobox}
                      onOptionSubmit={
                          (isoStringDate) => {
                              props.onChange && props.onChange(new Date(isoStringDate));
                              setTimeFromDate(new Date(isoStringDate))
                              combobox.closeDropdown();
                          }
                      }
                      shadow={'sm'}
                      withinPortal
                      width={'fit-content'}
            >
                <Combobox.DropdownTarget>

                    <TimeInput
                        label={label ?? ''}
                        onClick={() => combobox.openDropdown()}
                        onFocusCapture={() => combobox.openDropdown()}
                        onBlur={() => combobox.closeDropdown()}
                        mt={'var(--mantine-spacing-sm)'}
                        // format={'24'}
                        // type={'text'}
                        value={timeStringValue}
                        ref={timepickerInputRef}
                        onChange={(e) => handleTimeInputChange(e.currentTarget.value)}
                        error={error}
                        {...moreTimeInputProps}
                    />
                </Combobox.DropdownTarget>

                <Combobox.Dropdown style={{boxShadow: shadows.combobox}}>
                    <Combobox.Options>
                        <ScrollArea h={numberOfEnabledOptions === 0 ? 45 : numberOfEnabledOptions < 4 ? 46 * numberOfEnabledOptions : 4*46}
                                    id={'scrollContainer'}
                        >
                            {
                                numberOfEnabledOptions !== 0 &&
                                timeOptions.map(
                                    (time, i) => (
                                        !time.disabled &&
                                            <Combobox.Option
                                                key={uid + i}
                                                value={time.value.toISOString()}
                                                p={0}
                                                className={'optionItem'}
                                            >
                                                <Flex
                                                    w={'100%'}
                                                    justify={'start'}
                                                    gap={'xs'}
                                                    /*onClick={($event) => {
                                                        props.onChange && props.onChange(time.value);
                                                        setTimeFromDate(time.value)
                                                        setPopoverOpened(false);
                                                    }}*/
                                                    miw={"100px"}
                                                    p={'sm'}
                                                    style={(theme) => ({
                                                        cursor: 'pointer',
                                                        backgroundColor: selectedOption === time.value ? theme.colors.gray[2] : 'inherit',
                                                        '&:hover': {
                                                            backgroundColor: lighten(theme.colors.gray[2], .5)
                                                        }
                                                    })}
                                                >
                                                    <Text size={'sm'} id={'text' + i}>
                                                        {time.label}
                                                    </Text>

                                                    {
                                                        time.durationLabel &&
                                                        <Text size={'xs'} id={'duration' + i}>
                                                            ( {time.durationLabel} )
                                                        </Text>
                                                    }
                                                </Flex>
                                            </Combobox.Option>
                                    )
                                ) ||
                                <Group py={'var(--mantine-spacing-xs)'} justify={'center'}>
                                    <Text size={'sm'} c={'dimmed'}>
                                        {'No options available'}
                                    </Text>
                                </Group>
                            }
                        </ScrollArea>
                    </Combobox.Options>
                </Combobox.Dropdown>
            </Combobox>

            {/*<Popover opened={popoverOpened} position="bottom" width="target">
                <Popover.Target>
                    <div
                        // onFocusCapture={handleFocus}
                        // onBlurCapture={handleBlur}
                    >
                        <TimeInput
                            onFocusCapture={handleFocus}
                            onBlur={handleBlur}
                            mt={'var(--mantine-spacing-sm)'}
                            // format={'24'}
                            {...mantineInputProps}
                            // type={'text'}
                            value={timeStringValue}
                            ref={timepickerInputRef}
                            onChange={(e) => handleTimeInputChange(e.currentTarget.value)}
                        />
                    </div>
                </Popover.Target>
                <Popover.Dropdown p={0}>
                    <ScrollArea h={numberOfEnabledOptions === 0 ? 45 : numberOfEnabledOptions < 4 ? 46 * numberOfEnabledOptions : 4*46} >
                        {
                            numberOfEnabledOptions !== 0 &&
                            timeOptions.map(
                                (time, i) => (
                                    !time.disabled &&
                                    <Group
                                        key={uid + i}
                                        justify={'left'}
                                        gap={'xs'}
                                        onClick={($event) => {
                                            console.log('selected time: ', time.value)
                                            props.onChange && props.onChange(time.value);
                                            setTimeFromDate(time.value)
                                            setPopoverOpened(false);
                                        }}
                                        p={'var(--mantine-spacing-sm)'}
                                        style={(theme) => ({
                                            cursor: 'pointer',
                                            backgroundColor: selectedOption === time.value ? theme.colors.gray[2] : 'inherit',
                                            '&:hover': {
                                                backgroundColor: lighten(theme.colors.gray[2], .5)
                                            }
                                        })}
                                    >
                                        <Text size={'sm'} id={'text' + i}>
                                            {time.label}
                                        </Text>

                                        {
                                            time.durationLabel &&
                                            <Text size={'xs'} id={'duration' + i}>
                                                ( {time.durationLabel} )
                                            </Text>
                                        }
                                    </Group>
                                )
                            ) ||
                            <Group py={'var(--mantine-spacing-xs)'} justify={'center'}>
                                <Text size={'sm'} color={'dimmed'}>
                                    {'No options available'}
                                </Text>
                            </Group>
                        }
                    </ScrollArea>
                </Popover.Dropdown>
            </Popover>*/}
        {/*</div>*/}
    </>
}

export default SCTimeControl;
