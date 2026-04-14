import { useEffect, useState } from 'react';
import { colors, fontSizes, layout, fontFamily, shadows } from '../../theme'

function CheckListItem(props) {

  const item = props.item;

  return (
    <div className="container">

      { item.Complete ? 
        <div className="item completed" onClick={() => props.clickHandler(item)}>
          <div className="completed-item-tickbox">
            <div className="checkmark"></div>
          </div>
          <div className="item-label">
            {item.Name}
          </div>
        </div>
        :
        <div className="item" onClick={() => props.clickHandler(item)}>
          <div className="item-icon">
          </div>
          <div className="item-label">
            {item.Name}
          </div>
        </div>
      }

      <style jsx>{`
        .container {
          
        }
        .item {
          display: flex;
          flex-direction: row;
          align-items: center;
          margin: 0.5rem;
          cursor: pointer;
        }
        .completed {
          cursor: auto;
        }
        .completed-item-tickbox {
          height: 25px;
          width: 25px;
          background-color: ${colors.green};
          border-radius: 50%;
          display: inline-block;
        }
        .checkmark {
          display: inline-block;
          transform: rotate(45deg);
          height: 10px;
          width: 4px;
          margin-left: 35%;
          margin-top: 20%;
          border-bottom: 2px solid ${colors.white};
          border-right: 2px solid ${colors.white};
        }
        .item-icon {
          height: 25px;
          width: 25px;
          background-color: ${colors.formGrey};
          border-radius: 50%;
          display: inline-block;
        }
        .item-label {
          padding-left: 0.5rem;
        }
      `}</style>
    </div>
  )
}

export default CheckListItem
