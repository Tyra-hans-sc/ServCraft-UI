import React, { useState, useEffect, useRef, useMemo, useContext } from 'react';
import CellStatus from '../cells/status-old';
import CellBold from '../cells/bold';
import CellTech from '../cells/tech';
import Fetch from '../../utils/Fetch';
import Time from '../../utils/time';
import Table from '../table';

function JobWidget() {


  const [columnState, setColumnState] = useState([{
    Label: 'Number',
    ColumnName: 'JobCardNumber',
    CellType: 'bold',
  }, {
    Label: 'Customer',
    ColumnName: 'CustomerName',
    CellType: 'bold',
  }, {
    Label: 'Assigned To',
    ColumnName: 'EmployeeName',
    CellType: 'employee'
  }, {
    Label: 'Status',
    ColumnName: 'JobCardStatusDescription',
    CellType: 'status',
  },
  ]);

  const columns = useMemo(
    () => columnState.map(function (column) {

      let columnObject = {
        Header: column.Label,
        accessor: column.ColumnName,
      }

      if (column.CellType != "none") {
        switch (column.CellType) {
          case 'employee':
            columnObject['accessor'] = (row) => row.Employees;
            columnObject['Cell'] = ({ cell: { value } }) => <CellTech value={value} />;
            break;
          case 'status':
            columnObject['accessor'] = (row) => row.JobStatus;
            columnObject['Cell'] = ({ cell: { value } }) => <CellStatus value={value} />;
            break;
          case 'bold':
            columnObject['Cell'] = ({ cell: { value } }) => <CellBold value={value} />;
            break;
          default:
            columnObject['Cell'] = ({ cell: { value } }) => <CellBold value={value} />;
        }
      }

      return columnObject;
    }),
    [columnState]
  );

  const [jobs, setJobs] = useState([]);

  const searchJobs = async () => {

    let today = Time.today();

    let params = {
      pageSize: 999,
      pageIndex: 0,
      startDate: today,
      IncludeClosed: false,
    };

    let searchRes = await Fetch.post({
      url: '/Job/GetJobs',
      params: {
        ...params,
      },
    });

    setJobs(searchRes.Results);
  };

  useEffect(() => {
    searchJobs();
  }, []);

  return (
    <div>
      <Table
        columns={columns}
        data={jobs}
        type="Job"
      />
    </div>
  );
}

export default JobWidget;
