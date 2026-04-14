import React, { useState } from 'react'
import { colors, layout, tickSvg} from '../../theme'

function CellCheckbox({value, itemId, selectedItems, setSelectedItems, showValue = true, disabled = false}) {  

  const clickBox = (e) => {
    e.stopPropagation();

    if( itemId && selectedItems && setSelectedItems ) {
      let newSelectedItems = [...selectedItems];
      if (newSelectedItems.includes(itemId)) {
        newSelectedItems = newSelectedItems.filter((value) => { return value !== itemId })
      } else {
        newSelectedItems.push(itemId);
      }

      setSelectedItems(newSelectedItems);
    }
  };

  return (
    <div className="container">
      { itemId && selectedItems
        ? <div className={"box" + (selectedItems.includes(itemId) ? " box-checked" : "") + (disabled ? ' disabled' : '')} onClick={(e) => disabled ? null : clickBox(e)}></div>
        : <div className={"box" + (disabled ? ' disabled' : '')} onClick={(e) => disabled ? null : clickBox(e)}></div>
      }
      {showValue ? value : ''}
      <style jsx>{`
        .container {
          align-items: center;
          display: flex;
          font-weight: bold;
        }
        .box {
          border: 1px solid ${colors.labelGrey};
          border-radius: ${layout.inputRadius};
          box-sizing: border-box;
          cursor: pointer;
          height: 1rem;
          margin-right: 1rem;
          opacity: 0.4;
          width: 1rem;
        }
        .box-checked {
          background-color: ${colors.bluePrimary};
          background-image: ${tickSvg};
          background-position: center;
          background-repeat: no-repeat;
          background-size: 70%;
          border: none;
          opacity: 1;
        }
        .disabled {
          background-color: ${colors.formGrey};
          border: none;
        }
      `}</style>
    </div>
  )
}

export default CellCheckbox
