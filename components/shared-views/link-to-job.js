import React, { useState, useEffect, useContext, useRef } from 'react';
import { colors, fontSizes, layout, fontFamily, tickSvg } from '../../theme';
import Fetch from '../../utils/Fetch';
import Helper from '../../utils/helper';
import { useOutsideClick } from "rooks";
import TextSearch from '../text-search';
import Router from 'next/router';
import Link from 'next/link';
import useDebounce from '../../hooks/useDebounce';
import constants from '../../utils/constants';

function LinkToJob(props) {

  const lockdown = props.lockdown;
  const [jobs, setJobs] = useState([{}]);
  const [hasJobs, setHasJobs] = useState(true);
  const selectedJob = Helper.isEmptyObject(props.selectedJob) ? null : props.selectedJob;
  const [inputFocus, setInputFocus] = useState(false);
  const [searching, setSearching] = useState(false);
  const [search, setSearch] = useState('');
  const debounce = useDebounce();

  const dropdownDirection = props.dropdownDirection ? props.dropdownDirection : 'down';

  let deselectingJob = false;
  let searchHasFocus = false;

  async function getJobsForCustomer(customerChange) {

    debounce.deferProceed(constants.debounceSearchPeriod, async function () {
      setSearching(true);
      const jobs = await Fetch.post({
        url: `/Job/GetJobs`,
        params: {
          searchPhrase: search,
          customerIDList: props.customerID ? [props.customerID] : null,
          includeClosed: false,
          pageSize: 10,
        }
      });
      setJobs(jobs.Results);
      if (customerChange) {
        setHasJobs(jobs.TotalResults > 0);
      }
      setSearching(false);
    });
  }

  useEffect(() => {
    getJobsForCustomer(false);
  }, []);

  const oldSearch = useRef(search);
  useEffect(() => {
    let changed = oldSearch.current !== search;
    oldSearch.current = search;

    if (changed) {
      getJobsForCustomer(false);
    }
  }, [search]);

  const oldCustomerID = useRef(props.customerID);
  useEffect(() => {
    let changed = oldCustomerID.current !== props.customerID;
    oldCustomerID.current = props.customerID;

    if (props.customerID && changed) {
      setJobs([{}]);
      getJobsForCustomer(true);
    }
  }, [props.customerID]);

  const ref = useRef();
  useOutsideClick(ref, () => {
    if (inputFocus) {
      setInputFocus(false);
    }
  });

  function selectJob(job) {
    props.setSelected(job);
    searchHasFocus = false;
  }

  const dontToggle = useRef(false);
  function toggleJobSelection() {
    if (!lockdown && !dontToggle.current) {
      if (!deselectingJob && !searchHasFocus) {
        setInputFocus(!inputFocus);
      }
    }

    dontToggle.current = false;
  }

  function deselectJob() {
    if (!lockdown) {
      deselectingJob = true;
      props.setSelected(null);
    }
  }



  function navigateToJob() {
    dontToggle.current = true;
    if (props.newParent === false) {
      Helper.nextRouter(Router.push, '/job/[id]', `/job/${props.selectedJob.ID}`);
    }
  }

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  }

  const handleSearchFocus = () => {
    searchHasFocus = true;
  }

  const handleSearchBlur = () => {
    searchHasFocus = false;
  }

  return (
    <div className="container" ref={inputFocus ? ref : null} onClick={toggleJobSelection}>
      <div className={`link-container ${selectedJob ? 'hidden' : ''}`}>
        <div className="link-column-1">
          <img src="/icons/jobs-blue-gray.svg" alt="jobs" />
        </div>
        <div className="link-column-2">
          Link Job
        </div>
        <div className="link-column-3">
          <img src="/icons/chevron-down-dark.svg" alt="dropdown" className={`arrow ${dropdownDirection == 'up' ? 'flip-icon' : ''}`} />
        </div>
      </div>
      <div className={`link-container ${selectedJob ? '' : 'hidden'}`}>
        <div className="link-column-1">
          <img src="/icons/jobs-blue-gray.svg" alt="jobs" />
        </div>
        <div className="link-column-2">
          {selectedJob && lockdown ? <Link legacyBehavior href={`/job/[id]`} as={`/job/${selectedJob.ID}`}><a>{selectedJob.JobCardNumber}</a></Link> :
            selectedJob ? selectedJob.JobCardNumber : ""}
        </div>
        <div className="link-column-3">
          {lockdown ? '' : <>
            {props.newParent === false ? <img src="/icons/jobs-dark.svg" alt="job" className="job-view" onClick={navigateToJob} title="Go to job" /> : ""}
            <img src="/icons/x-circle-dark.svg" alt="dropdown" className="deselect-job" onClick={deselectJob} />
          </>}
        </div>
      </div>
      <div className={`results ${inputFocus ? '' : 'hidden'} ${dropdownDirection == 'up' ? 'options-up' : 'options-down'}`}>

        {hasJobs ?
          <div className='search'>
            <TextSearch
              placeholder={'Search for a Job'}
              changeHandler={handleSearchChange}
              focusHandler={handleSearchFocus}
              blurHandler={handleSearchBlur}
              value={search}
            />
          </div> : ''
        }

        <div className={`loader ${searching ? 'show-loader' : ''}`}></div>
        {jobs && jobs.map(function (job, index) {
          if (Helper.isEmptyObject(job)) {
            return (
              <div className="result" key={index} onClick={() => selectJob(job)}>
              </div>
            );
          } else {
            return (
              <div className="result" key={index} onClick={() => selectJob(job)}>
                <div className={`initial ${searching ? 'hidden' : ''}`}>{Helper.getInitials(job.CustomerName)}</div>
                <div className="row">
                  <h3>{job.JobCardNumber}</h3>
                  <p>{job.CustomerName}</p>
                </div>
              </div>
            );
          }
        })}
      </div>

      <style jsx>{`
        .container {
          width: 100%;
          margin-top: 0.5rem;
          cursor: pointer;
          position: relative;
        }
        .link-container {
          display: flex;
          flex-direction: row;
          justify-content: space-between;
          align-items: center;
          position: relative;
        }
        .link-column-1 {
          width: 20%;
        }
        .link-column-1 img {
          padding-right: 1rem;
          padding-left: 1rem;
        }
        .link-column-2 {
          align-items: center;
          display: flex;
          justify-content: center;
          position: absolute;
          left: 4rem;
        }

        .link-column-2 a, .link-column-2 a:visited, .link-column-2 a:active {
          text-decoration: none !important;
          font-weight: bold !important;
          color: ${colors.bluePrimary} !important;
        }

        .link-column-3 {
          position: absolute;
          right: 0;
          z-index: 1;
        }
        .search {
          padding: 0.5rem 1rem;
        }

        .results {
          background-color: ${colors.white};
          box-shadow: 0px 10px 10px rgba(0, 0, 0, 0.04), 0px 20px 25px rgba(0, 0, 0, 0.1);
          position: absolute;
          left: 0;
          max-height: 240px;
          min-height: 34px;
          overflow-y: scroll;
          width: 100%;
          z-index: 2;
        }
        .result {
          align-items: center;
          cursor: pointer;
          display: flex;
          padding: 0.5rem 1rem;
        }
        .result :global(.initial){
          align-items: center;
          background-color: ${colors.bluePrimary};
          border-radius: 1.25rem;
          color: ${colors.white};
          display: flex;
          font-weight: bold;
          height: 2.5rem;
          justify-content: center;
          margin-right: 1rem;
          width: 2.5rem;
        }
        .result :global(h3){
          color: ${colors.darkPrimary};
          font-size: 1rem;
          margin: 0;
        }
        .result :global(p){
          color: ${colors.blueGrey};
          font-size: 14px;
          margin: 0;
        }
        .hidden {
          display: none !important;
        }
        .deselect-job {
          cursor: pointer;
        }

        .show-loader {
          border-color: rgba(113, 143, 162, 0.2);
          border-left-color: ${colors.blueGrey};
          display: block;
          left: calc(50% - 10px);
          margin: 0;
          position: absolute;
          top: calc(50% - 15px);
        }

        .options-down {
          top: 2rem;
        }
        .options-up {
          bottom: 3rem;
        }
        .flip-icon {
          transform: rotate(180deg);
        }
      `}</style>
    </div>
  );
}

export default LinkToJob;
