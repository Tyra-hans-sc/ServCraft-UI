import React, { useRef, useEffect, useState } from 'react'
import { colors, fontSizes, layout, fontFamily } from '../theme'
import Helper from '../utils/helper'

function InlineTextInput(props) {

  const ref = useRef(null);
  const textAlign = props.textAlign ? props.textAlign : 'left';
  const width = props.width ? props.width : '100%';
  const [focused, setFocused] = useState(false);
  const [value, setValue] = useState(props.value);
  const [outerValue, setOuterValue] = useState(props.value);


  useEffect(() => {
    setOuterValue(props.value);
    if (!focused) {
      setValue(props.value);
    }
  }, [props.value]);

  useEffect(() => {
    if (props.inputFocus) {
      ref.current.focus();
    }
  }, [props.inputFocus]);

  const focusHandler = () => {
    if (props.type == 'number') {
      ref.current.select();
    }
    setFocused(true);
  }

  const blurHandler = (e) => {
    setFocused(false);
    setValue(outerValue);
    props.blurHandler && props.blurHandler(e);
  };

  useEffect(() => {
    if (ref.current) {
      ref.current.addEventListener('wheel', function (e) {
        ref.current.blur();
      });
      ref.current.addEventListener('mousewheel', function (e) {
        ref.current.blur();
      });
      if (props.type == 'number' && props.signed == false) {
        ref.current.addEventListener('keydown', function (e) {
          // prevent (-/+) from being inputted
          if (e.keyCode == 107 || e.keyCode == 109 || e.keyCode == 187 || e.keyCode == 189) {
            e.preventDefault();
          }
        });
      }
    }

    return () => {
      if (ref.current) {
        ref.current.removeEventListener('wheel', function () { });
        ref.current.removeEventListener('mousewheel', function () { });
        ref.current.removeEventListener('keydown', function () { });
      }
    }
  }, [ref.current]);

  function changeHandler(e) {

    let val = {
      target: {
        name: e.target.name,
        value: e.target.value
      }
    };

    setValue(val.target.value);
    props.changeHandler && props.changeHandler(val);
  }

  return (
    <div className="input-container">
      <input
        ref={ref}
        name={props.name}
        onClick={props.clickHandler}
        onChange={changeHandler}
        onFocus={focusHandler}
        onKeyDown={props.handleKeyDown}
        onKeyUp={props.handleKeyUp}
        onBlur={blurHandler}
        placeholder={props.placeholder}
        readOnly={props.readOnly}
        tabIndex={props.tabIndex}
        type={props.type}
        value={value}
        onKeyPress={props.onKeyPress}
      />

      <style jsx>{`
        .input-container {
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
          padding-left: ${props.type == "employee" ? "3rem" : "0"};
          font-family: ${fontFamily};
          text-align: ${textAlign};
        }

      input::-ms-clear {
        display: none;
      }
      
      label, .label {
        color: ${colors.labelGrey}; 
        font-size: ${fontSizes.label};
        text-align: left;
      }

      ::-webkit-input-placeholder { 
        color: ${colors.blueGrey};
      }

      input:-webkit-autofill {
        -webkit-box-shadow: 0 0 0 30px ${colors.formGrey} inset !important;
      }

      .row {
        display: flex;
        justify-content: space-between;
      }
      .error {
        color: ${colors.warningRed};
      }
    `}</style>
    </div>
  );
}

InlineTextInput.defaultProps = {
  type: 'text',
  required: false
};

export default InlineTextInput;

