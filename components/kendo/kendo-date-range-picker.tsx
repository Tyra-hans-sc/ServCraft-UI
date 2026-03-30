import Time from "../../utils/time";
import { useEffect, useState, useRef } from "react";
import {
  DatePicker,
  DatePickerInput
} from "@mantine/dates";

/**
 *
 * @param {*} param0 dateRange is an object with properties start and end, can either be dates or date-strings, onChange will return the date range
 * @returns
 */

const useLegacy = false;

export default function KendoDateRangePicker({
  dateRange,
  onChange,
  // toggleShow,
  anchor = null,
}: any) {


  const [value, setValue] = useState<[Date | null, Date | null]>([
    dateRange && dateRange.start ? Time.parseDate(dateRange.start) : null,
    dateRange && dateRange.end ? Time.parseDate(dateRange.end) : null
  ]);

  const [prevValue, setPrevValue] = useState([
    dateRange && dateRange.start ? Time.parseDate(dateRange.start) : null,
    dateRange && dateRange.end ? Time.parseDate(dateRange.end) : null
  ]);

  const onChangeEvent = (val: [Date | null, Date | null]) => {

    setValue(prev => {
      if(prev !== val) {
        setPrevValue(prev)
      }
      return val[0] && val || prev
    });

    let start = val[0];
    let end = val[1];
    if(!val[1] && prevValue[0] && !prevValue[1]) {
      start = prevValue[0]
    }

    onChange({
      start,
      end
    });
  };

  useEffect(() => {
    if(!dateRange.start && !dateRange.end) {
      if(value[0]) {
        setPrevValue(value)
      }
      setValue([null, null])
    }
  }, [dateRange])

  return (
    <div style={{ pointerEvents: "auto" }}>
      {
          <DatePickerInput
              style={{
                width: anchor ? 140 : 222,
                '[data-dates-input]': {
                  opacity: anchor ? 0 : 1
                }
              }}
              numberOfColumns={2}
              allowSingleDateInRange
              type={'range'}
              // ref={ref}
              value={value}
              onChange={onChangeEvent}
              locale="en"
          />
      }
    </div>
  )
}
