import React from 'react';
import { colors, fontSizes, layout, fontFamily } from '../../theme';
import ProjectHistoryProject from './project-history-project';

function ProjectHistory({projects, selectedProject, setSelectedProject, canLoadMoreProjects, loadMoreProjects, projectSearching, customer}) {

  return (
    <div className="container">
      {projects.length > 0 ?
        <div className="projects">
          <h2>{`Project history for ${customer}`}</h2>
          <div className="titles">
            <p>Description</p>
            <p>Start Date</p>
          </div>
          {projects.map(function(project, index){
            return <ProjectHistoryProject project={project} selectedProject={selectedProject} setSelectedProject={setSelectedProject} key={index} />
          })}
          {canLoadMoreProjects ?
            <div className="more" onClick={loadMoreProjects}>
              Load More
            </div>
            : ''
          }  
        </div> : 
        ( (customer != '' && projectSearching == false) ?
          <div className="empty">
            <img src="/job-folder.svg" alt="Project Folder" />
            <h3>{customer}</h3>
            <p>This customer has no previous projects</p>
          </div>
          :
          <div className="empty">
            <img src="/job-folder.svg" alt="Project Folder" />
            <h3>History</h3>
            <p>Once you select a customer <br/> we will show a list of their previous projects.</p>
          </div>
        )
      }

      <style jsx>{`
        .container {
          background-color: ${colors.white};
          border-radius: ${layout.cardRadius};
          display: flex;
          flex-direction: column;
          flex-shrink: 0;
          height: fit-content;
          margin-left: 1.5rem;
          padding: 1.5rem;
          width: 580px;
        }
        .projects h2 {
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

export default ProjectHistory;
