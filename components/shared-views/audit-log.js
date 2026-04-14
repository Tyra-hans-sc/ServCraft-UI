import React, { useState, useEffect, useContext, useMemo, useRef } from 'react';
import { colors, fontSizes, layout, fontFamily } from '../../theme';
import Table from '../table';
import Pagination from '../pagination';
import CellDate from '../cells/date';
import CellBold from '../cells/bold';
import Fetch from '../../utils/Fetch';
import * as Enums from '../../utils/enums';
import Storage from '../../utils/storage';
import useInitialTimeout from '../../hooks/useInitialTimeout';
import constants from '../../utils/constants';

function AuditLog({ recordID, retriggerSearch }) {

  const [columnState, setColumnState] = useState([{
    Label: 'Property',
    ColumnName: 'PropertyName',
    CellType: 'bold',
  }, {
    Label: 'Original Value',
    ColumnName: 'OriginalValue',
    CellType: 'none',
  }, {
    Label: 'New Value',
    ColumnName: 'NewValue',
    CellType: 'none',
  }, {
    Label: 'Date',
    ColumnName: 'EventDateUTC',
    CellType: 'date',
  }, {
    Label: 'User',
    ColumnName: 'UserName',
    CellType: 'none',
  }]);

  const columns = useMemo(
    () => columnState.map(function (column) {
      let columnObject = {
        Header: column.Label,
        accessor: column.ColumnName,
      }

      if (column.CellType != "none") {
        switch (column.CellType) {
          case 'date':
            columnObject['Cell'] = ({ cell: { value } }) => <CellDate value={value} utc={columnObject["accessor"] == 'EventDateUTC'} />;
            break;
          case 'bold':
            columnObject['Cell'] = ({ cell: { value } }) => <CellBold value={value} />;
            break;
        }
      }

      return columnObject;
    }),
    [columnState]
  );

  const [searching, setSearching] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const [totalResults, setTotalResults] = useState(0);
  const [auditLogResults, setAuditLogResults] = useState([{}]);
  const [currentPage, setCurrentPage] = useState(1);

  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
  }, []);

  const getAuditLogs = async () => {
    const auditLogPostResult = await Fetch.post({
      url: `/AuditLog/GetAuditLogDetail`,
      params: {
        pageSize: pageSize,
        pageIndex: (currentPage - 1),
        searchPhrase: searchVal,
        recordID: recordID,
      },
    });
    setAuditLogResults(auditLogPostResult.Results);
    setTotalResults(auditLogPostResult.TotalResults);
  };

  const oldRetrigger = useRef(retriggerSearch);
  const oldPageSize = useRef(pageSize);
  const oldCurrentPage = useRef(currentPage);

  useEffect(() => {
   
    let changeHappened = JSON.stringify(oldRetrigger.current) !== JSON.stringify(retriggerSearch) || oldPageSize.current !== pageSize;

    oldRetrigger.current = retriggerSearch;
    oldPageSize.current = pageSize;

    if (changeHappened) {
      if (currentPage == 1) {
        getAuditLogs();
      } else {
        setCurrentPage(1);
      }
    }
  }, [pageSize, retriggerSearch]);

  useEffect(() => {
    let changeHappened = oldCurrentPage.current !== currentPage;
    oldCurrentPage.current = currentPage;

    if (changeHappened) {
      getAuditLogs();
    }
  }, [currentPage]);

  const auditLogAccordionBodyRef = useRef(null);
  const [auditLogHeight, setAuditLogHeight] = useState('50px');
  const [auditLogChevron, setAuditLogChevron] = useState('');
  const [showAuditLogContents, setShowAuditLogContents] = useState(false);
  const [auditLogOpened, setAuditLogOpened] = useState(false);

  function toggleAuditLogAccordion() {
    setShowAuditLogContents(current => !current);
    if (auditLogOpened) {
      setAuditLogOpened(current => !current);
    } else {
      setTimeout(() => {
        setAuditLogOpened(current => !current);
      }, 600);
      getAuditLogs();
    }
  }

  useEffect(() => {
    setAuditLogHeight(showAuditLogContents ? `${auditLogAccordionBodyRef.current.scrollHeight + 50}px` : `50px`);
    setAuditLogChevron(showAuditLogContents ? `accordion-header-img-flipped` : ``);
  }, [showAuditLogContents]);

  return (
    <div className={`${auditLogResults.length > 0 ? 'accordion-container' : 'hidden'}`}>
      <div className="accordion-header" onClick={toggleAuditLogAccordion}>
        <div className="accordion-header-header">
          <label>History</label>
          {/* <div className="count">{auditLogResults.length}</div> */}
        </div>
        <div className="accordion-header-body">
          {`${auditLogOpened ? 'Click to collapse' : 'Click to expand'}`}
        </div>
        <img src="/icons/chevron-down-dark.svg" alt="dropdown" className={`${auditLogChevron}`} />
      </div>
      <div className={`accordion-body ${auditLogOpened ? 'accordion-overflow' : 'accordion-body-hidden'}`} ref={auditLogAccordionBodyRef}>
        <div className="row">
          <div className="column">

            <div className={"no-items" + (auditLogResults.length == 0 ? " no-items-visible" : "")}>
              <div className={"loading-overlay" + (searching ? " loading-overlay-visible" : "")}>
                <div className="loader"></div>
              </div>
              <img src="/job-folder.svg" alt="Job Folder" />
              <h3>No history found</h3>
              <img className="wave" src="/wave.svg" alt="wave" />
            </div>

            <div className={"table-container" + (auditLogResults.length != 0 ? " table-container-visible" : "")}>
              <div className={"loading-overlay" + (searching ? " loading-overlay-visible" : "")}>
                <div className="loader"></div>
              </div>
              <Table
                columns={columns}
                data={auditLogResults}
              />
            </div>

            <Pagination pageSize={pageSize} setPageSize={setPageSize} currentPage={currentPage} totalResults={totalResults} setCurrentPage={setCurrentPage} />
          </div>
        </div>
      </div>

      <style jsx>{`
        .accordion-container {
          margin-bottom: 50px;
          max-width: ${constants.maxFormWidth};
        }
        .no-items {
          margin-top: 5rem;
        }
        .row {
          display: flex;
          justify-content: space-between;
        } 
        .column {
          display: flex;
          flex-direction: column;
          width: 100%;
        }
        .count {
          align-items: center;
          background-color: ${colors.bluePrimary};
          border-radius: 0.75rem;
          color: ${colors.white};
          display: flex;
          font-size: 0.75rem;
          font-weight: bold;
          height: 1.5rem;
          justify-content: center;
          width: 1.5rem;
          position: absolute;
          left: 4.5rem;
        }
      `}</style>
    </div>
  );
}

export default AuditLog;
