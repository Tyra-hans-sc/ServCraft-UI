import {FC, Ref} from "react";
import {DateInput, DateInputProps, DatePickerInput, DatePickerInputProps} from '@mantine/dates';
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

/*const useStyles = createStyles((theme) => ({
    outside: {
        color: `${theme.colors.blue[1]} !important`,
    },
    weekend: {
        color: `${theme.colors.scBlue[6]} !important`,
    },
    selected: {
        color: `${theme.white} !important`,
        backgroundColor: `${theme.colors.scBlue[6]} !important`
    },
}));*/

const ScDateControl: FC<{innerRef?: Ref<HTMLInputElement>} & DateInputProps> = (inputProps) => {

    dayjs.extend(utc)

    const {innerRef} = inputProps;

    // const { classes, cx } = useStyles();

    return (
        <DateInput
            mt={'var(--mantine-spacing-sm)'}
            clearButtonProps={{ 'aria-label': 'Clear date' }}
            // ref={innerRef}
            {...inputProps}
            // valueFormat="YYYY / MM / DD"
            valueFormat="D MMMM, YYYY"
            style={{'td': {borderColor: 'transparent !important'}}}
            locale="en"
            popoverProps={{withinPortal: true}}
            /*getDayProps={(date) => {
                console.log(date.getDay())
                return {

                }
            }}*/
        />
        /*<DatePicker
            allowFreeInput
            mt={'var(--mantine-spacing-sm)'}
            inputFormat="DD/MM/YYYY"
            clearable={false}
            withinPortal={true}
            ref={innerRef}
            {...inputProps}
            /!*dateParser={
                (x) => {
                    console.log('dateparser', x)
                    return dayjs(x).utc(false).toDate()
                }
            }*!/
            dayClassName={(date, modifiers) =>

            }
            // dropdownType={isMobile ? 'modal' : 'popover'}
            style={{'td': {borderColor: 'transparent !important'}}}
            locale="en"
        />*/
    );
};

export default ScDateControl;
