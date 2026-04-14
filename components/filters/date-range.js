import React from 'react';
import { colors, layout, tickSvg} from '../../theme';
import KendoDatePicker from '../kendo/kendo-date-picker';
import Time from '../../utils/time';
import Helper from '../../utils/helper';

function FilterDateRange({dates, setDateRangeFilters, filterName}) {

  const dateChange = (item, key) => {
    let date = !Helper.isNullOrWhitespace(item) ? Time.getDateFormatted(item, 'yyyy-MM-dd') : '';
    setDateRangeFilters(filterName, date, key)
  };

  let options = [];
  if (dates) {
    options = dates.map((item, key) => {
      let label = key === 0 ? 'From' : 'To';
      let date = !Helper.isNullOrWhitespace(item) ? Time.getDateFormatted(item, 'yyyy-MM-dd') : '';

      return <div className="option" key={key}>
        <KendoDatePicker
          label={label}
          required={false}
          value={date}
          changeHandler={(e) => dateChange(e, key)}
        />
      </div>
    });
  }

  return (
    <div className="container">
      {options}
      <style jsx>{`
        .container {
          width: max-content;
          overflow-x: auto;
        }
        .container :global(.option) {
          align-items: center;
          color: ${colors.darkPrimary};
          cursor: pointer;
          display: flex;
          font-size: 14px;
          height: 5.2rem;
          width: max-content;
        }
      `}</style>
    </div>
  );
}

export default FilterDateRange;
