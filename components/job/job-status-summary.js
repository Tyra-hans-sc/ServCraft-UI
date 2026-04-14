import React, { useState, useEffect, useContext, useMemo } from 'react';
import KendoTable from '../kendo/kendo-table';

import CellStatus from '../cells/status-old';
import CellDate from '../cells/date';
import CellBold from '../cells/bold';
import CellTech from '../cells/tech';
import CellCurrency from '../cells/currency';
import CellBool from '../cells/bool';

import KendoCellBool from '../../components/kendo/cells/kendo-cell-bool';
import KendoCellStatus from '../../components/kendo/cells/kendo-cell-status';
import KendoCellNumber from '../../components/kendo/cells/kendo-cell-number';
import KendoCellCurrency from '../../components/kendo/cells/kendo-cell-currency';
import KendoCellDate from '../../components/kendo/cells/kendo-cell-date';
import KendoCellEmployee from '../../components/kendo/cells/kendo-cell-employee';

import Helper from '../../utils/helper';
import Fetch from '../../utils/Fetch';
import ToastContext from '../../utils/toast-context';

function JobStatusSummary({summaryData}) {

  const toast = useContext(ToastContext);
  const [jobStatusSummaryResults, setJobStatusSummaryResults] = useState(summaryData);
  const [searching, setSearching] = useState(false);
  const [sortField, setSortField] = useState('');
  const [sortDirection, setSortDirection] = useState('');

  const [columnState, setColumnState] = useState([{
    Header: 'Description',
    accessor: 'JobCardStatusDescription',
    ColumnName: 'JobCardStatusDescription',
    CellType: 'status',
  },
  {
    Header: 'In Status',
    accessor: 'DaysInStatus',
    ColumnName: 'DaysInStatus',
    CellType: 'int',
  }, {
    Header: 'Created',
    accessor: 'CreatedDate',
    ColumnName: 'CreatedDate',
    CellType: 'date',
  }, {
    Header: 'Created By',
    accessor: 'CreatedBy',
    ColumnName: 'CreatedBy',
    CellType: 'none',
  }, {
    Header: 'Modified',
    accessor: 'ModifiedDate',
    ColumnName: 'ModifiedDate',
    CellType: 'date',
  }, {
    Header: 'Modified By',
    accessor: 'ModifiedBy',
    ColumnName: 'ModifiedBy',
    CellType: 'none',
  }]);

  const columns = useMemo(
    () => columnState.map(function (column) {
      let columnObject = {
        Header: column.Header,
        accessor: column.accessor,
        // for table resize columns
        ColumnName: column.ColumnName,
        UserWidth: column.UserWidth
        // for table resize columns
      };

      if (column.CellType != "none") {
        switch (column.CellType) {
          case 'employee':
            columnObject['Cell'] = ({ cell: { value } }) => <CellTech value={value} />;
            columnObject['KendoCell'] = (props) => <KendoCellEmployee {...props} employeesField="Employees" />;
            break;
          case 'date':
            columnObject['Cell'] = ({ cell: { value } }) => <CellDate value={value} />;
            columnObject['KendoCell'] = (props) => <KendoCellDate {...props} />;
            break;
          case 'currency':
            columnObject['extraClasses'] = 'header-right-align';
            columnObject['Cell'] = ({ cell: { value } }) => <CellCurrency value={value} />;
            columnObject['KendoCell'] = (props) => <KendoCellCurrency {...props} />;
            break;
          case 'status':
            columnObject['Cell'] = ({ cell: { value } }) => <CellStatus value={value} valueEnum={columnObject.accessor} />;
            columnObject['KendoCell'] = (props) => <KendoCellStatus {...props} valueEnum={columnObject.accessor} />;
            break;
          case 'icon':
            columnObject['Cell'] = ({ cell: { value } }) => <CellBool value={column.accessor == 'IsClosed' ? !value : value} />;
            columnObject['KendoCell'] = (props) => <KendoCellBool {...props} invertValue={column.ColumnName == 'IsClosed'} />;
            break;
          default:
            columnObject['Cell'] = ({ cell: { value } }) => <CellBold value={value} />;
        }
      }

      if (column.accessor == 'LocationDescription') {
        columnObject['accessor'] = (row) => {
          if (row.Location) {
            return row.Location.LocationDisplay;
          } else {
            return row.LocationDescription;
          }
        }
        columnObject['Cell'] = ({ cell: { value } }) => <CellWide value={value} />;
      }

      return columnObject;
    }),
    [columnState]
  );

  const setSort = (field) => {
    setSortDirection(Helper.getSortDirection(field, sortField, sortDirection));
    setSortField(field);
  };

  function rowClick(row) {
  }

  return (
    <div className="container">
      <div className="heading">
        Job Status Summary
      </div>

      <div className="margin-top"> 
          {jobStatusSummaryResults.length != 0 ?
            <KendoTable
                searching={searching}
                columns={columns}
                data={jobStatusSummaryResults}
                rowClick={rowClick}
                setSort={setSort}
                sortField={sortField}
                sortDirection={sortDirection}
                type="JobStatusSummary"
                heightOffset={300}
            /> : ''}
      </div>
      
      <style jsx>{`
        .container {
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          overflow-x: visible;
        }
        .column {
          width: 100%;
        }
        .column-margin {
          margin-left: 24px;
        }
        .row {
          display: flex;
          justify-content: space-between;
        }  
        .margin-top {
          margin-top: 0.5rem;
        }
      `}</style>
    </div>
  );
}

export default JobStatusSummary;
