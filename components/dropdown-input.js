import React, { useState, useRef, useEffect } from 'react';
import { colors, fontSizes, layout, fontFamily, tickSvg } from '../theme';
import TextInput from './text-input';
import {useOutsideClick} from "rooks";
import Helper from '../utils/helper';

function DropdownInput(props) {

  const [inputFocus, setInputFocus] = useState(props.inputFocus ? props.inputFocus : false);
  const disabled = props.disabled !== undefined && props.disabled !== null ? props.disabled === true : false;

  //IF INPUT IS FOCUSED AND NO RESULTS, DO INITIAL SEARCH
  useEffect(() => {
    if (inputFocus && props.searchFunc && props.options && props.options.length == 0 && !disabled) {
      props.searchFunc();
    }
  }, [inputFocus]);

  const ref = useRef();
  useOutsideClick(ref, () => {
    if (inputFocus) {
      setInputFocus(false);
    }
  });

  const timerRef = useRef(null);

  const handleKeyDown = (e) => {
    if (props.useKeyUp === true) return;
    if (Helper.isFunction(props.searchFunc)) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      if (e.key === 'Enter') {
        props.searchFunc();
      } else {
        timerRef.current = setTimeout(() => { props.searchFunc() }, 300);
      }
    }
  };

  const handleKeyUp = (e) => {
    //if (props.useKeyUp !== true) return;
    let val = e && e.target ? e.target.value : "";
    if (Helper.isFunction(props.searchFunc)) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      if (e.key === 'Enter') {
        props.searchFunc(val);
      } else {
        timerRef.current = setTimeout(() => { props.searchFunc(val) }, 300);
      }
    }
  };

  const handleClick = (e) => {
    if (Helper.isFunction(props.clickHandler)) {
      props.clickHandler();
    }
  }

  function selectOption(selected, selectedValue) {
    if (props.changeHandler) {
      props.changeHandler({ target: { value: selected, name: props.name } });
    }

    if (!selectedValue.disabled) {
      props.setSelected(selectedValue);
    }
    
    if (!props.multiSelect) {
      setInputFocus(false);
    }
  }

  return (
    <div className={`container ${props.noInput ? " no-caret" : ""} ${props.extraClasses}`} ref={inputFocus ? ref : null} title={props.title ? props.title : ''} onClick={() => setInputFocus(true)}>
      <TextInput
        extraClasses={props.extraClasses}
        error={props.error}
        clickHandler={handleClick}
        changeHandler={props.noInput === true ? null : props.changeHandler}
        handleKeyDown={props.noInput === true ? null : handleKeyDown}
        handleKeyUp={props.noInput === true ? null : handleKeyUp}
        blurHandler={props.blurHandler}
        label={props.label}
        placeholder={props.placeholder}
        required={props.required === true}
        autoFocus={props.autoFocus}
        type="text"
        value={props.value}
        readOnly={props.noInput === true || disabled}
        tabIndex={props.tabIndex}
        inputClamp={true}
      />
      <div className={`results ${inputFocus && !disabled ? '' : 'hidden'} ${props.totalOptions ? 'padding-top' : ''}`}>
        <div className={`loader ${props.searching ? 'show-loader' : ''}`}></div>
        {props.options && props.options.map(function (option, index) {
           if (props.type == "status-color") {
            return (
              <div className={`${option.disabled ? 'result-disable' : ''} result`} key={index} onClick={() => selectOption(option.Description, option)}>
                {option.DisplayColor ? 
                  <>
                  <div style={{background: option.DisplayColor, opacity: 0.3, position: 'relative', padding: 0, minWidth: 16, minHeight: 16, borderRadius: '50%', marginRight: 8 }}>
                    <div style={{background: option.DisplayColor, position: 'absolute', padding: 0, width: 8, height: 8, left: 4, top: 4, borderRadius: '50%' }}></div>
                  </div>
                  </>
                  :
                  <>
                  </>
                }                
                {option.Description}
              </div>
            )
          }
        })}
        {props.addOption && !props.searching
          ? <div className="result result-add" key={999} onClick={props.addOption.action}>
            <img src="/icons/plus-circle-blue.svg" />
            {props.addOption.text}
          </div>
          : ""
        }
      </div>
      {props.totalOptions
        ? props.value != ""
          ? <div className={`enter ${inputFocus ? '' : 'hidden'}`}>
            Showing {props.options.length} of {props.totalOptions} results
            </div>
          : <div className={`enter ${inputFocus ? '' : 'hidden'}`}>
            Suggestions
            </div>
        : ""
      }
      {props.chevronColor == 'light'
        ? <img src="/icons/chevron-down-white.svg" alt="dropdown" className="arrow" />
        : <img src="/icons/chevron-down-dark.svg" alt="dropdown" className="arrow" />
      }
      
      <style jsx>{`
        .container {
          
        }
        .container :global(.input-container){
          min-height: 2.5rem;
          padding-top: 0.6rem;
        }

        .results {
          background-color: ${colors.white};
          box-shadow: 0px 10px 10px rgba(0, 0, 0, 0.04), 0px 20px 25px rgba(0, 0, 0, 0.1);
          position: absolute;
          left: 0;
          max-height: 240px;
          min-height: 34px;
          width: 100%;
          z-index: 2;
          overflow-x: auto;
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
        .result-disable {
          opacity: 0.5;
        }
        .result-add {
          color: ${colors.bluePrimary};
          font-size: 0.875rem;
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
          top: 5.2rem;
          z-index: 3;
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
          caret-color: transparent;
          cursor: pointer;
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
        
        .arrow {
          cursor: pointer;
          position: absolute;
          right: 1rem;
          top: ${props.required ? "2rem" : "1rem"};
          z-index: 1;
        }

        .button-height .arrow {
          top: ${props.required ? "1rem" : "0.6rem"};
        }

        .button-height {
          height: 2.5rem;
          min-height: 2.5rem;
        }

        `}</style>
    </div>
  )
}

export default DropdownInput;
