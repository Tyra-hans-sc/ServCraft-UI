import React, { useState } from 'react';
import { colors, fontSizes, layout, fontFamily, shadows } from '../theme';
import Router from 'next/router';
import Helper from '../utils/helper';

function CardJobAttention(props) {

  function goToStatus(id) {
    Helper.nextRouter(Router.push, `/job/list?statusID=${id}`);
  }

  const [shift, setShift] = useState(0);
  const [index, setIndex] = useState(2);
  const numberOfItems = props.statuses ? props.statuses.length : 0;
  const itemsInView = 3;

  const moveUp = () => {
    if (index > (itemsInView - 1)) {
      setShift(shift + 64);
      setIndex(index - 1);
    }
  }

  const moveDown = () => {
    if (index < (numberOfItems - 1)) {
      setShift(shift - 64);
      setIndex(index + 1);
    }
  }

  return (
    <div className="card">
      { props.statuses && props.statuses.length > itemsInView ?
        <img className="button button-up" title="Scroll up" src="/icons/arrow-up.svg" alt="up" onClick={moveUp} /> : ''
      }
      <div className="container">        
        { props.statuses && props.statuses.map((status) => {

          let colorStyle = {}
          let colorClass = ""
          if (status.DisplayColor) {
            colorClass = status.DisplayColor;
            if (status.DisplayColor.includes('#')) {
              colorStyle = {backgroundColor: Helper.hexToRgba(status.DisplayColor, 0.2), color: status.DisplayColor};
            }
          }
          
          return (
            <div className="item" onClick={() => goToStatus(status.ID)}>
              <div className={"number " + colorClass} style={colorStyle}>{status.JobCount}</div>
              <div className="info">
                <h3>{status.Description}</h3>
                <p>{status.Description}</p>
              </div>
              <img src="/icons/chevron-right.svg" alt="Go"/>
            </div>
          )
        })}
      </div>
      { props.statuses && props.statuses.length > itemsInView ?
        <img className="button button-down" title="Scroll down" src="/icons/arrow-down.svg" alt="down" onClick={moveDown} /> : '' 
      }
      <style jsx>{`
        .card {
          background-color: ${colors.white};
          border-radius: ${layout.cardRadius};
          box-shadow: ${shadows.card};
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          height: 12.25rem;
          width: 100%;
          overflow-y: hidden;
          position: relative;
        }
        .container {
          display: flex;
          flex-direction: column;
          transform: translateY(${shift}px);
          transition: all 0.3s ease-out;
        }
        .item {
          align-items: center;
          box-sizing: border-box;
          cursor: pointer;
          display: flex;
          height: 100%;
          padding: 12px 24px 12px 12px;
          width: 100%;
        }
        .number {
          align-items: center;
          background-color: #E3E9EC;
          border-radius: 20px;
          color: ${colors.blueGrey};
          display: flex;
          font-size: 16px;
          font-weight: bold;
          height: 40px;
          justify-content: center;
          margin-right: 12px;
          width: 40px;
        }
        .info {
          flex-grow: 1;
        }
        .info h3 {
          color: ${colors.darkPrimary};
          font-size: ${fontSizes.body};
          margin: 0;
        }
        .info p {
          color: ${colors.blueGrey};
          font-size: 14px;
          margin: 0;
        }
        .button {
          position: absolute;
          cursor: pointer;
          z-index: 2;
        }
        .button-up {
          top: 0.5rem;
          left: 50%;
        }
        .button-down {
          bottom: 0.5rem;
          left: 50%;
        }

        /*COLOUR CLASSES*/
        .Red {
          background-color: rgba(252, 46, 80, 0.2); /*#FC2E50;*/
          color: #FC2E50 !important;
        }
        .Orange {
          background-color: rgba(242, 97, 1, 0.2);
          color: #F26101 !important;
        }
        .Yellow {
          background-color: rgba(255, 201, 64, 0.2);
          color: #FFC940 !important;
        }
        .Green {
          background-color: rgba(81, 203, 104, 0.2);
          color: #51CB68 !important;
        }
        .Blue {
          background-color: rgba(90, 133, 225, 0.2);
          color: #5A85E1 !important;
        }
        .Purple {
          background-color: rgba(128, 100, 250, 0.2);
          color: #735AE1 !important;
        }
        .Black {
          background-color: rgba(79, 79, 79, 0.2);
          color: #4F4F4F !important;
        }
        .Grey {
          background-color: rgba(130, 130, 130, 0.2);
          color: #828282 !important;
        }
        .LightGrey {
          background-color: rgba(189, 189, 189, 0.2);
          color: #BDBDBD !important;
        }
      `}</style>
    </div>
  )
}

export default CardJobAttention;
