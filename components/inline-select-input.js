import React, { useState, useRef, useEffect } from 'react';
import { colors, fontSizes, layout, fontFamily, tickSvg } from '../theme';
// import { useOutsideClick } from "rooks";
import useOutsideClick from "../hooks/useOutsideClick";
import Helper from '../utils/helper';

function InlineSelectInput({value, name, options, changeHandler, blurHandler, inputFocus, setInputFocus, setSelected, width = '100%'}) {

  const inputRef = useRef();

  useOutsideClick(inputRef, () => {
    if (Helper.isFunction(blurHandler)) {
      blurHandler();
    }
  });

  const focusHandler = (e) => {
    setInputFocus(true);
  }

  const selectOption = (selected, selectedValue) => {
    if (changeHandler) {
      changeHandler({ target: { value: selected, name: name } });
    }
    setSelected(selectedValue);
    setInputFocus(false);
  }

  return (
    <div className={`container no-caret`} ref={inputRef}>
      <input
        //ref={inputRef}
        onFocus={focusHandler}        
        type="text"
        value={value}
        readOnly={true}
      />
      <div className={`results ${inputFocus ? '' : 'hidden'}`}>
        { options && options.map(function (option, index) {
          return (
            <div className="result space-between" key={index} onClick={() => selectOption(option, option)}>
              <p>{option}</p>
            </div>
          );
        })}
      </div>
      <img src="/icons/chevron-down-dark.svg" alt="dropdown" className="arrow" />

      <style jsx>{`
        .container {
          background-color: ${colors.formGrey};
          border-radius: ${layout.inputRadius};
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          padding: 0.5rem;
          position: relative;
          width: ${width};
        }
        input {          
          background: none;
          border: none;
          box-shadow: none;
          color: ${colors.darkPrimary}; 
          font-size: 12px;
          height: 100%;
          outline: none;
          font-family: ${fontFamily};
        }
        .results {
          background-color: ${colors.white};
          box-shadow: 0px 10px 10px rgba(0, 0, 0, 0.04), 0px 20px 25px rgba(0, 0, 0, 0.1);
          position: absolute;
          left: 0;
          max-height: 240px;
          min-height: 34px;
          overflow-y: auto;
          top: 2rem;
          width: 100%;
          z-index: 1;
        }

        .button-height .results {
          top: 3.5rem;
        }

        .padding-top {
          padding-top: 1.5rem;
        }
        .result {
          align-items: center;
          cursor: pointer;
          display: flex;
          padding: 0.5rem 1rem;
        }
        .result-add {
          color: ${colors.bluePrimary};
          font-size: 12px;
          font-weight: bold;
          justify-content: center;
          padding: 1rem;
        }
        .result-add img {
          margin-right: 0.5rem;
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
          font-size: 0.5rem;
          margin: 0;
        }
        .result :global(p){
          color: ${colors.blueGrey};
          font-size: 12px;
          margin: 0;
        }
        .enter {
          color: ${colors.blueGrey};
          font-size: 12px;
          position: absolute;
          right: 1rem;
          top: 5.2rem;
          z-index: 3;
        }
        .hidden {
          display: none;
        }
        .no-caret :global(input) {
          caret-color: transparent;
          cursor: pointer;
        }
        .space-between {
          justify-content: space-between;
        }
        .row {
          align-items: center;
          display: flex;
        }
        .arrow {
          pointer-events: none;
          position: absolute;
          right: 0.5rem;
          top: 0.5rem;
          z-index: 1;
          width: 14%;
          height: auto;
        }

        .button-height .arrow {
          top: 2rem;
        }

        .button-height {
          height: 2.5rem;
        }

      `}</style>
    </div>
  );
}

export default InlineSelectInput;
