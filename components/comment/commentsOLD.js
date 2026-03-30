import React, { useState } from 'react'
import { colors, fontSizes, layout, fontFamily, shadows } from '../../theme'
import TextArea from '../text-area'
import time from '../../utils/time'

/**
 * @deprecated The method should not be used
 */
function ItemComments(props) {

  return (
    <div className="container">
      <div className="heading">
        Comments
      </div>
      <div className="new-comment">
        <TextArea placeholder="Write a comment" changeHandler={props.handleCommentChange} value={props.newComment} />
        <img src="/icons/send.svg" alt="submit" onClick={props.submitComment} />
      </div>
      {props.submitting ? <div className="loader"></div> : ""}
      {props.comments.map(function(item, index) {
        return (
          <div className="comment" key={index}>
            <div className="comment-info">
              <div className="name">
                {item.CreatedBy}
              </div>
              <div title={`${time.toISOString(item.ModifiedDate, false, true)}`} className="time">
                {time.timeFrom(item.ModifiedDate)}
              </div>
            </div>
            <div className="text">
              {item.CommentText}
            </div>
          </div>
        )
      })}

      {props.canLoadMoreComments ?
        <div className="more" onClick={props.loadMoreComments}>
          Load More
        </div>
        : ''
      }

      <style jsx>{`
        .container {
          display: flex;
          flex-direction: column;
          margin-top: -0.5rem;
          margin-bottom: 1rem;
        }
        .heading {
          color: ${colors.blueGrey};
          font-weight: bold;
          margin: 1.5rem 0 0.5rem;
        }
        .new-comment {
          position: relative;
        }
        .new-comment :global(.textarea-container) {
          height: 5rem;
          padding-right: 3.5rem;
        }
        .new-comment img{
          cursor: pointer;
          position: absolute;
          right: 2rem;
          top: 1.5rem;
        }
        .loader {
          border-color: rgba(113, 143, 162, 0.2);
          border-left-color: ${colors.blueGrey};
          display: block;
          margin-bottom: 1rem;
          margin-top: 1rem;
        }
        .comment {
          background-color: ${colors.white};
          border-radius: ${layout.cardRadius};
          box-sizing: border-box;
          color: ${colors.blueGrey};
          display: flex;
          flex-direction: column;
          justify-content: center;
          margin-top: 0.5rem;
          padding: 1.25rem 1rem;
          position: relative;
          width: 100%;
        }
        .comment-info {
          align-items: center;
          display: flex;
          margin-bottom: 4px;
        }
        .job {
          color: ${colors.bluePrimary};
          font-weight: bold;
        }
        .name {
          color: ${colors.darkPrimary};
          font-weight: bold;
        }
        .time {
          color: ${colors.blueGrey};
          font-size: 12px;
          margin-left: 1rem;
        }
        .text {
          white-space: pre-wrap;
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

export default ItemComments;
