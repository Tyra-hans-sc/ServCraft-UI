import React, { useState } from 'react';
import { colors, fontSizes, layout, fontFamily, shadows } from '../theme';
import TimerFlagged from '../components/timer-flagged';

function TimersFlagged({timers}) {

  return (
    <div className="container">
      {timers.map(function(timer, index) {
        return (
          <TimerFlagged timer={timer} key={index} />
        )
      })}
 
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

export default TimersFlagged;
