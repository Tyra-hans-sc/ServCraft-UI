import React, { useState, useEffect } from 'react';
import { colors, fontSizes, layout, fontFamily } from '../theme';
import JobHistoryJob from './job-history-job';
import Fetch from '../utils/Fetch';
import Search from './search';

function JobHistory(props) {

  const [isServiceMode, setIsServiceMode] = useState(false);

  const checkServiceMode = async () => {
    let temp = false;

    let optionValue = await Fetch.get({
      url: `/Option/GetByOptionName?name=Job Service`,
    });
    
    if (optionValue) {
      temp = (optionValue.toLowerCase() === 'true');
    }
    setIsServiceMode(temp);
  };

  useEffect(() => {
    checkServiceMode();
  }, []);

  const searchLocalJobs = () => {

  };

  useEffect(() => {
    if (props.customer) {
      props.setSearch('');
    }
  }, [props.customer]);

  return (
    <div className="container">
      {props.jobs.length > 0 || props.search != "" ?
        <div className="jobs">
          <h2>{`Job history for ${props.customer}`}</h2>

          <div className="row">
            <div className="search-container">
              <Search
                placeholder="Search Job History"
                resultsNum={props.jobs ? props.jobs.length : 0}
                searchVal={props.search}
                setSearchVal={props.setSearch}
                searchFunc={searchLocalJobs}
              />
            </div>
          </div>

          <div className="titles">
            <p>Link Job</p>
            <p>Job Number</p>
            <p>Items</p>
            <p>Description</p>
          </div>
          {props.jobs && props.jobs.map(function(job, index){
            return <JobHistoryJob job={job} selectedJob={props.selectedJob} setSelected={props.setSelectedJob} key={index} isServiceMode={isServiceMode} />
          })}
          {props.canLoadMoreJobs ?
            <div className="more" onClick={props.loadMoreJobs}>
              Load More
            </div>
            : ''
          }  
        </div>
        : ( (props.customer != "" && props.jobSearching == false) ?
          <div className="empty">
            <img src="/job-folder.svg" alt="Job Folder" />
            <h3>{props.customer}</h3>
            <p>This customer has no previous jobs</p>
          </div>
          :
          <div className="empty">
            <img src="/job-folder.svg" alt="Job Folder" />
            <h3>History</h3>
            <p>Once you select a customer <br/> we will show a list of their previous jobs.</p>
          </div>
        )
      }

      <style jsx>{`
        .container {
          background-color: ${colors.white};
          border-radius: ${layout.cardRadius};
          display: flex;
          flex-wrap: wrap;
          flex-direction: column;
          flex-shrink: 0;
          height: fit-content;
          margin-left: 1.5rem;
          padding: 1.5rem;
          //width: 580px;
        }
        .search-container {
          margin-left: 0.5rem;
          margin-bottom: 1rem;
          //width: 100%;          
        }
        .row {
          display: flex;
        }
        .jobs h2{
          color: ${colors.blueGrey};
          font-size: 24px;
          font-weight: normal;
          margin: 0 0 0.75rem;
        }
        .empty {
          align-items: center;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 1rem 0;
        }
        .empty img {
          height: 110px;
          margin-bottom: 1rem;
        }
        .empty h3 {
          color: ${colors.darkSecondary};
          font-size: 16px;
          margin: 0 0 0.75rem;
        }
        .empty p {
          color: ${colors.blueGrey};
          margin: 0;
          text-align: center;
        }
        .titles {
          display: flex;
          padding-left: 0.5rem;
        }
        .titles p {
          color: ${colors.darkPrimary};
          font-weight: bold;
          margin: 0 1.5rem 0 0;
        }
        .titles p:last-child {
          padding-left: 5rem;
        }
        .job {
          align-items: center;
          background-color: ${colors.background};
          border-radius: ${layout.cardRadius};
          display: flex;
          height: 5.5rem;
          margin-top: 1rem;
          padding: 0 1.5rem;
        }
        .radio {
          border: 1px solid ${colors.blueGreyLight};
          border-radius: 0.75rem;
          box-sizing: border-box;
          cursor: pointer;
          flex-shrink: 0;
          height: 1.5rem;
          margin-right: 2.5rem;
          position: relative;
          width: 1.5rem;
        }
        .radio-selected {
          border: 1px solid ${colors.bluePrimary};
        }
        .radio-selected:after {
          background-color: ${colors.bluePrimary};
          border-radius: 0.5rem;
          content: '';
          height: 1rem;
          left: 3px;
          position: absolute;
          top: 3px;
          width: 1rem;
        }
        .service {
          flex-shrink: 0;
          margin-right: 1.5rem;
          width: 5.5rem;
        }
        .service p {
          font-size: 14px;
          font-weight: bold;
          margin: 4px 0 0 0;
        }
        .description {
          flex-grow: 1;
          max-height: 2.5rem;
          overflow: hidden;
          padding-right: 1.5rem;
        }
        .view {
          color: ${colors.bluePrimary};
          cursor: pointer;
          font-weight: bold;
        }
        .more {
          align-items: center;
          border: 1px solid ${colors.bluePrimary};
          border-radius: ${layout.cardRadius};
          color: ${colors.bluePrimary};
          cursor: pointer;
          display: flex;
          font-weight: bold;
          height: 2.5rem;
          justify-content: center;
          margin-top: 1rem;
        }
      `}</style>
    </div>
  )
}

export default JobHistory;