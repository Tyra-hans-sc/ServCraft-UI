import React, { useState, useRef } from 'react'
import Link from 'next/link'
import { colors, fontSizes, layout, fontFamily, tickSvg } from '../theme'
import useOutsideClick from "../hooks/useOutsideClick";

function ReplacementTagSelector(props) {
  const ref = useRef();

  const [selectorFocus, setSelectorFocus] = useState(false);
  useOutsideClick(ref, () => {
    if (selectorFocus) {
      setSelectorFocus(false);
    }
  });

  function selectOption(selected) {
    if (props.changeHandler) {
      props.changeHandler({target: {value: selected}});
    }
  }

  function toggleSelector() {
    if (selectorFocus) {
      setSelectorFocus(false);
    } else {
      setSelectorFocus(true);
    }
  }

  return (
    <div className="container" ref={ selectorFocus ? ref : null}>
      <img className="image-button" src="/icons/plus-circle-blue.svg" alt="Insert replacement tag" title="Insert replacement tag" onClick={() => toggleSelector()} />
      <div className={`results ${selectorFocus ? '' : 'hidden' }`}>
        {props.options && props.options.map(function(option, index) {
          if (option.groupHeader) {
            return (
              <div className="result" key={index}>
                <u><b>{option.text}</b></u>
              </div>
            )
          } else {
            return (
              <div className="result" key={index} onClick={() => selectOption(option.value)}>
                <div>
                  <p>{option.text}</p>
                </div>
              </div>
            )
          }
        })}
      </div>

      <style jsx>{`
        .container {
          margin-top: -1px;
          padding-top: 1px;
          position: relative;
        }
        .image-button {
          cursor: pointer;
        }
        .results {
          background-color: ${colors.white};
          box-shadow: 0px 10px 10px rgba(0, 0, 0, 0.04), 0px 20px 25px rgba(0, 0, 0, 0.1);
          position: absolute;
          right: 0;
          max-height: 240px;
          min-height: 34px;
          overflow-y: scroll;
          width: 300px;
          z-index: 1;
        }
        .result {
          align-items: center;
          cursor: pointer;
          display: flex;
          padding: 0.5rem 1rem;
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
          font-size: 1rem;
          margin: 0;
        }
        .result :global(p){
          color: ${colors.blueGrey};
          font-size: 14px;
          margin: 0;
        }
        .enter {
          color: ${colors.blueGrey};
          font-size: 14px;
          position: absolute;
          right: 1rem;
          top: 4rem;
          z-index: 2;
        }
        .hidden {
          display: none;
        }
        .show-loader {
          border-color: rgba(113, 143, 162, 0.2);
          border-left-color: ${colors.blueGrey};
          display: block;
          left: calc(50% - 10px);
          margin: 0;
          position: absolute;
          top: calc(50% - 15px);
        }
        .no-caret :global(input) {
          cursor: pointer;
          caret-color: transparent;
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
        .space-between {
          justify-content: space-between;
        }
        .row {
          align-items: center;
          display: flex;
        }
        `}</style>
    </div>
  );
}

export default ReplacementTagSelector
