import React, { useRef, useEffect } from 'react'
import { colors, fontSizes, layout, fontFamily } from '../theme'
import Helper from '../utils/helper'

function InlineTextAreaInput(props) {

  const ref = useRef(null);
  const textAlign = props.textAlign ? props.textAlign : 'left';
  const width = props.width ? props.width : '100%';

  useEffect(() => {
    if (props.inputFocus) {
      ref.current.focus();
    }
  }, [props.inputFocus]);

  const focusHandler = () => {
  }

  useEffect(() => {


    return () => {
      
    }
  }, [ref.current]);

  return (
    <div className="input-container">
      <textarea
        ref={ref}
        name={props.name}
        onClick={props.clickHandler}
        onChange={props.changeHandler}
        onFocus={focusHandler}
        onKeyDown={props.handleKeyDown}
        onKeyUp={props.handleKeyUp}
        onBlur={props.blurHandler}
        placeholder={props.placeholder}
        readOnly={props.readOnly}
        tabIndex={props.tabIndex}
        value={props.value}
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

        textarea {
          background: none;
          border: none;
          box-shadow: none;
          color: ${colors.darkPrimary}; 
          font-size: 12px;
          height: 64px;
          outline: none;
          padding-left: 0;
          font-family: ${fontFamily};
          text-align: ${textAlign};
        }

      
      label, .label {
        color: ${colors.labelGrey}; 
        font-size: ${fontSizes.label};
        text-align: left;
      }

      ::-webkit-input-placeholder { 
        color: ${colors.blueGrey};
      }

      textarea:-webkit-autofill {
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

InlineTextAreaInput.defaultProps = {
  required: false
};

export default InlineTextAreaInput;
