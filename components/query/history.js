import React from 'react';
import { colors, layout } from '../../theme';
import QueryHistoryQuery from './history-query';

function QueryHistory(props) {

  return (
    <div className="container">
      {(props.queries.length > 0 && !!props.customer) ?
        <div className="queries">
          <h2>{`Query history for ${props.customer}`}</h2>
          <div className="titles">
            <p>Query Code</p>
            <p>Status</p>
            <p>Description</p>
          </div>
          {props.queries.map(function(query, index) {
            return <QueryHistoryQuery query={query} key={index} />
          })}
          {props.canLoadMoreQueries ? 
            <div className="more" onClick={props.loadMoreQueries}>
              Load More
            </div>
            : ""
          }
        </div>
        :
        ( (props.customer != "" && props.querySearching == false) ?
          <div className="empty">
            <img src="/job-folder.svg" alt="Query Folder" />
            <h3>{props.customer}</h3>
            <p>This customer has no previous queries</p>
          </div>
          :
          <div className="empty">
            <img src="/job-folder.svg" alt="Query Folder" />
            <h3>History</h3>
            <p>Once you select a customer <br/> we will show a list of their previous queries.</p>
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
          //margin-left: 1.5rem;
          padding: 1.5rem;
          width: 640px;
            max-width: 95%;
        }
        .queries h2{
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
        .query {
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
        .status {
          flex-shrink: 0;
          margin-right: 1.5rem;
          width: 5.5rem;
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
  );
}

export default QueryHistory
