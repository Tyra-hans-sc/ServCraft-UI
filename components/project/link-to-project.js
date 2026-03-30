import React, { useState, useEffect, useContext, useRef } from 'react';
import { colors, fontSizes, layout, fontFamily, tickSvg } from '../../theme';
import Fetch from '../../utils/Fetch';
import Helper from '../../utils/helper';
import { useOutsideClick } from "rooks";
import TextSearch from '../text-search';
import Link from 'next/link';
import useDebounce from '../../hooks/useDebounce';
import constants from '../../utils/constants';

function LinkToProject({selectedProject, onProjectSelect, customerID, lockdown, dropdownDirection}) {

  const [projects, setProjects] = useState([{}]);
  const [hasProjects, setHasProjects] = useState(true);
  const [inputFocus, setInputFocus] = useState(false);
  const [searching, setSearching] = useState(false);
  const [search, setSearch] = useState('');
  const debounce = useDebounce();

  let deselectingProject = false;
  let searchHasFocus = false;

  const getProjectsForCustomer = async (customerChange) => {
    debounce.deferProceed(constants.debounceSearchPeriod, async function(){
      setSearching(true);
      const projectRequest = await Fetch.get({
        url: `/Project`,
        params: {
          searchPhrase: search,
          customerID: customerID ? customerID : null,
          pageSize: 10,
        }
      });
      setProjects(projectRequest.Results);
      if (customerChange) {
        setHasProjects(projectRequest.TotalResults > 0);
      }
      setSearching(false);
    });
  };


  useEffect(() => {
    getProjectsForCustomer(false);
  }, []);

  const oldSearch = useRef(search);
  useEffect(() => {
    let changed = oldSearch.current !== search;
    oldSearch.current = search;

    if (changed) {
      getProjectsForCustomer(false);
    }
  }, [search]);

  const oldCustomerID = useRef(customerID);
  useEffect(() => {
    let changed = oldCustomerID.current !== customerID;
    oldCustomerID.current = customerID;

    if (customerID && changed) {
      setProjects([{}]);
      getProjectsForCustomer(true);
    }
  }, [customerID]);

  const ref = useRef();
  useOutsideClick(ref, () => {
    if (inputFocus) {
      setInputFocus(false);
    }
  });

  const selectProject = (project) => {
    onProjectSelect(project);
    searchHasFocus = false;
  };

  const toggleProjectSelection = () => {
    if (!lockdown) {
      if (!deselectingProject && !searchHasFocus) {
        setInputFocus(!inputFocus);
      }
    }
  };

  const deselectProject = () => {
    if (!lockdown) {
      deselectingProject = true;
      onProjectSelect(null);
    }
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const handleSearchFocus = () => {
    searchHasFocus = true;
  };

  const handleSearchBlur = () => {
    searchHasFocus = false;
  };

  return (
    <div className="container" ref={ inputFocus ? ref : null} onClick={toggleProjectSelection}>
      <div className={`link-container ${selectedProject ? 'hidden' : ''}`}>
        <div className="link-column-1">
          <img src="/icons/file-query.svg" alt="query" />
        </div>
        <div className="link-column-2">
          Link Project
        </div>
        <div className="link-column-3">
          <img src="/icons/chevron-down-dark.svg" alt="dropdown" className={`arrow ${dropdownDirection == 'up' ? 'flip-icon' : ''}`} />
        </div>
      </div>
      <div className={`link-container ${selectedProject ? '' : 'hidden'}`}>
        <div className="link-column-1">
          <img src="/icons/file-query.svg" alt="query" />
        </div>
        <div className="link-column-2">
          {selectedProject && lockdown ? <Link legacyBehavior href={`/project/[id]`} as={`/project/${selectedProject.ID}`}><a>{selectedProject.ProjectNumber}</a></Link> : 
          selectedProject ? selectedProject.ProjectNumber : ""}
        </div>
        <div className="link-column-3">
          {lockdown ? '' : 
            <img src="/icons/x-circle-dark.svg" alt="dropdown" className="deselect-button" onClick={deselectProject} />
          }
        </div>
      </div>
      <div className={`results ${inputFocus ? '' : 'hidden'} ${dropdownDirection == 'up' ? 'options-up' : 'options-down'}`}>        
        
        {hasProjects ? 
          <div className='search'>
            <TextSearch 
              placeholder={'Search for a Project'}
              changeHandler={handleSearchChange}
              focusHandler={handleSearchFocus}
              blurHandler={handleSearchBlur}
              value={search}
            />
          </div> : ''
        }

        <div className={`loader ${searching ? 'show-loader' : '' }`}></div>
        { projects && projects.map(function (project, index) {
          if (Helper.isEmptyObject(project)) {
            return (
              <div key={index}></div>
            );
          } else {
            return (
              <div className="result" key={index} onClick={() => selectProject(project)}>
                <div className={`initial ${searching ? 'hidden' : ''}`}>{Helper.getInitials(project.CustomerName)}</div>
                <div className="row">
                  <h3>{project.ProjectNumber}</h3>
                  <p>{project.CustomerName}</p>
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
          display: none;
        }
        .deselect-button {
          cursor: pointer;
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

export default LinkToProject;
