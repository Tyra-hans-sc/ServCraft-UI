import React, { useState } from 'react';
import { colors, fontSizes, layout, fontFamily, shadows } from '../theme';
import CommentFlagged from '../components/comment-flagged';

function CommentsFlagged({ comments, loadMore, loading }) {

  return (
    <div className="container">
      {comments.map(function (comment, index) {
        return (
          <CommentFlagged comment={comment} key={index} />
        )
      })}
      { loading
        ? <div className="loader"></div>
        : ""
      }
      <div className="load-more" onClick={loading ? null : loadMore}>
        Load more
      </div>
      <style jsx>{`
        .container {
          display: flex;
          flex-direction: column;
          margin-top: -0.5rem;
        }
        .load-more {
          align-items: center;
          border: 1px solid ${colors.blueGreyLight};
          border-radius: ${layout.cardRadius};
          box-sizing: border-box;
          color: ${colors.bluePrimary};
          cursor: pointer;
          display: flex;
          height: 4rem;
          justify-content: center;
          margin-top: 0.5rem;
          width: 100%;
        }
        .loader {
          border-color: rgba(113, 143, 162, 0.2);
          border-left-color: ${colors.blueGrey};
          display: block;
          margin-bottom: 1rem;
          margin-top: 1rem;
        }
      `}</style>
    </div>
  )
}

export default CommentsFlagged;
