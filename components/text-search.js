import React, {useRef} from 'react'
import { colors, fontSizes, layout, fontFamily } from '../theme'
import Helper from '../utils/helper'

function TextSearch(props) {

  const ref = useRef();

  return (
    <div className="input-container">
      <input
        ref={ref}
        name={props.name}
        onClick={props.clickHandler}
        onChange={props.changeHandler} 
        onFocus={props.focusHandler}
        onBlur={props.blurHandler}
        onKeyDown={props.handleKeyDown}
        placeholder={props.placeholder} 
        readOnly={props.readOnly}
        tabIndex={props.tabIndex}
        type={props.type} 
        value={props.value}
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
          width: 100%;
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
        }

        input::-ms-clear {
          display: none;
        }       

        ::-webkit-input-placeholder { 
          color: ${colors.blueGrey};
        }

        input:-webkit-autofill {
          -webkit-box-shadow: 0 0 0 30px ${colors.formGrey} inset !important;
        }
      `}</style>
    </div>
  );
}

TextSearch.defaultProps = {
  type: 'text',
  required: false
};

export default TextSearch
