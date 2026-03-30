import React, { useState, useRef, useEffect } from 'react';
import { colors, fontSizes, layout, fontFamily, tickSvg } from '../theme';
import useOutsideClick from "../hooks/useOutsideClick";
import Reorder, { reorder } from 'react-reorder';
import Button from './button';

function ColumnSelect(props) {
  const ref = useRef();
  const overflowRef = useRef();

  useOutsideClick(ref, () => {
    if (dropdownState) {
      setDropdownState(false);
    }
  });

  const [dropdownState, setDropdownState] = useState(false);

  const toggleDropdown = (e) => {
    if (dropdownState) {
      setDropdownState(false);
    } else {
      setDropdownState(true);
    }
  };

  const [disableReorder, setReorderToDisabled] = useState(true);

  async function onReorder(event, previousIndex, nextIndex, fromId, toId) {

    let tempOptions = [...props.options];

    let option = tempOptions.splice(previousIndex, 1);
    tempOptions.splice(nextIndex, 0, option[0]);

    reorder(tempOptions, previousIndex, nextIndex)
    props.setReorder(tempOptions);
  }

  const [overflowHeight, setOverflowHeight] = useState("300px");

  // useEffect(() => {
  //   setTimeout(() => {
  //     setOverflowHeight(getOverflowHeight());
  //   }, 5000);
  // }, []);

  const getOverflowHeight = () => {
      return `calc(100vh - 400px)`;
  }

  return (
    <div className={"select" + (dropdownState ? " select-open" : "")} onClick={toggleDropdown} ref={dropdownState ? ref : null}>
      {dropdownState ? (
        <>
          <img src="/icons/columns.svg" alt="columns" className="icon" />
          <img src="/icons/arrow-drop-down.svg" alt="arrow" className="icon icon-transform" />
          <div className="options" onClick={(e) => e.stopPropagation()} >
            <div className="title">
              Select columns to display
            </div>
            <div className="overflow" id="column-overflow-container" ref={overflowRef}>
              <Reorder reorderId="status-list" onReorder={onReorder} lock='horizontal' component='div' disabled={disableReorder}
                placeholderClassName='reorder-placeholder' draggedClassName='reorder-dragged'>
                {
                  props.options.map((item, key) =>
                    <div className="reorder-block" key={key} >
                      <div className="move" title="Click and drag to reorder"
                        onMouseEnter={() => setReorderToDisabled(false)} onMouseLeave={() => setReorderToDisabled(true)}>
                        <img src="/icons/menu-light.svg" alt="move" />
                      </div>
                      <div className={"option" + (props.selected.includes(item) ? " option-selected" : "") + (props.requiredColumns.includes(item) ? " option-required" : "")}
                        onClick={props.requiredColumns.includes(item) ? null : () => props.setColumn(item)}>
                        {item}
                      </div>
                    </div>)
                }
              </Reorder>
              {props.resetColumnWidths ? <div className="button button-clear" onClick={props.resetColumnWidths}>
                Reset Widths
              </div> : ""}
            </div>
          </div>
        </>
      ) : (
        <>
          <img src="/icons/columns-grey.svg" alt="columns" className="icon" />
          <img src="/icons/arrow-drop-down-grey.svg" alt="arrow" className="icon" />
        </>
      )}

      <style jsx>{`
        .select {
          align-items: center;
          border: 1px solid ${colors.blueGreyLight};
          border-radius: ${layout.cardRadius};
          box-sizing: border-box;
          cursor: pointer;
          display: flex;
          font-weight: bold;
          height: 2.5rem;
          justify-content: space-between;
          margin-top: 0.5rem;
          padding: 0.5rem 0.5rem 0.5rem 0;
          position: relative;
        }
        .select-open {
          background-color: ${colors.blueGrey};
        }
        .icon {
          margin-left: 0.5rem;
          user-select: none;
        }
        .icon-transform {
          transform: rotate(180deg);
        }
        .options {
          background-color: ${colors.background};
          border-radius: ${layout.bigRadius};
          box-shadow: 0px 0px 32px rgba(0, 0, 0, 0.16), 0px 4px 8px rgba(0, 0, 0, 0.16), inset 0px 0px 8px rgba(86, 204, 242, 0.08);
          box-sizing: border-box;
          padding: 1rem 1rem 1rem 1rem;
          position: absolute;
          right: 0;
          top: 3rem;
          z-index: 5;
        }

        .overflow {
          overflow-y: auto;
          min-height: 200px;
          max-height: ${getOverflowHeight()};
          width: 100%;
          white-space: nowrap;
          padding-right: 0.5rem;
          font-size: 0.8rem;
        }

        .title {
          color: ${colors.blueGrey};
          font-weight: bold;
          font-size: 12px;
          line-height: 16px;
          text-transform: uppercase;
          white-space: nowrap;
        }
        .options :global(.option) {
          align-items: center;
          display: flex;
          font-weight: normal;
          min-height: 2rem;
          margin-top: 0.2rem;
        }
        .options :global(.option):before {
          border: 1px solid ${colors.blueGrey};
          border-radius: ${layout.inputRadius};
          box-sizing: border-box;
          content: '';
          cursor: pointer;
          height: 1rem;
          margin-right: 1rem;
          margin-top: 2px;
          min-width: 1rem;
        }
        .options :global(.option-selected):before {
          background-color: ${colors.blueGrey};
          background-image: ${tickSvg};
          background-position: center;
          background-repeat: no-repeat;
          background-size: 70%;
          border: none;
          opacity: 1;
        }
        .options :global(.option-required):before {
          opacity: 0.5;
        }
        .reorder-block {
          display: flex;
          width: 100%;
        }
        .move {
          display: flex;
          align-items: center;
          cursor: move;
          margin-top: 0.5rem;
          margin-right: 0.5rem;
        }

        .button {
          align-items: center;
          background-color: ${colors.bluePrimary};
          border-radius: 3px;
          color: ${colors.white};
          cursor: pointer;
          display: flex;
          height: 40px;
          flex-shrink: 0;
          margin-left: 2rem;
          padding: 0px 12px;
          font-weight: normal;
        }
        .button-clear {
          background: none;
          color: ${colors.bluePrimary};
          cursor: pointer;
          margin-left: 0;
        }
      `}</style>
    </div>
  )
}

export default ColumnSelect
