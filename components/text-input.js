import React, { useRef, useState, useEffect } from 'react';
import { colors, fontSizes, layout, fontFamily, shadows } from '../theme';
import Helper from '../utils/helper';

function TextInput(props) {

  let inputName = Helper.newGuid() + "-autocomplete-off";

  const ref = useRef(null);

  useEffect(() => {
    ref.current.readOnly = props.readOnly === true;
  }, [props.readOnly]);

  const focusHandler = (e) => {
    if (props.type == 'number') {
      if (ref.current) {
        ref.current.select();
      }
    }
    if (Helper.isFunction(props.setInputFocus)) {
      props.setInputFocus(true);
    }
  };

  useEffect(() => {
    if (props.autoSelect && ref.current) {
      ref.current.select();
    }
  }, [props.autoSelect]);

  useEffect(() => {
    if (props.autoFocus && ref.current) {
      ref.current.focus();
    }
  }, [props.autoFocus]);

  const changeHandler = (e) => {
    props.changeHandler({ target: { value: e.target.value, name: props.name } });
  };

  const [revealPassword, setRevealPassword] = useState(false);
  const [isPasswordType, setIsPasswordType] = useState(props.type === 'password');

  useEffect(() => {
    if (ref.current) {
        ref.current.addEventListener('wheel', function (e) { 
            ref.current.blur();
        });
        ref.current.addEventListener('mousewheel', function (e) { 
          ref.current.blur();
        });
    }

    return () => {
      if (ref.current) {
        ref.current.removeEventListener('wheel', function() {});
        ref.current.removeEventListener('mousewheel', function() {});
      }
    }
  }, [ref.current]);

  return (
    <div className={"input-container " + props.extraClasses}>
      {props.type == "employee" && props.value
        ? <div className="initial">{props.value.split(" ")[0][0] + props.value.split(" ")[1] ? props.value.split(" ")[1][0] : ""}</div>
        : ""
      }
      <div className="row">
        <label>{props.label}</label>
        {props.error && props.error != ""
          ? <div className="label error">{props.error}</div>
          : props.required
            ? <div className={`${isPasswordType ? 'password-required-label' : ''} label`}>Required</div>
            : ""
        }
      </div>
      <input
        spellCheck={true}
        ref={ref}
        name={inputName}
        onClick={props.clickHandler}
        onChange={changeHandler}
        onFocus={focusHandler}                
        onBlur={props.blurHandler}
        onKeyDown={props.handleKeyDown}
        onKeyUp={props.handleKeyUp}
        placeholder={props.placeholder}
        tabIndex={props.tabIndex}
        type={isPasswordType ? revealPassword ? 'text' : 'password' : props.type}
        value={props.value}
        autoComplete={props.autoComplete}
        className={props.inputClamp ? 'input-clamp' : ''}
        data-cy={props.cypress}
      />

      {isPasswordType ?
        <div className="password-eye" title={`${revealPassword ? 'Hide password' : 'Reveal password'}`} onClick={() => setRevealPassword(!revealPassword)}>
          <img src={`${revealPassword ? '/icons/eye-password.svg' : '/icons/eye-password-off.svg'}`} />
        </div> : ''
      }

      {props.showClearButton === true ?
        <div className="clear-button">
          <img src="/icons/x-circle-dark.svg" alt="dropdown" className="arrow" onClick={() => props.clearButtonClicked && props.clearButtonClicked()} />
        </div> :
        ""}

      <style jsx>{`        

        .input-container {
          background-color: ${colors.formGrey};
          border-radius: ${layout.inputRadius};
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          height: fit-content;
          margin-top: 0.5rem;
          padding: 0.5rem 0.5rem 0.5rem 0.5rem;
          position: relative;
          width: 100%;
          min-height: 3.6rem;
        }

        .no-margin-top {
          margin-top: 0;
        }

        input {
          background: none;
          border: none;
          box-shadow: none;
          color: ${colors.darkPrimary}; 
          font-size: ${fontSizes.body};
          height: 100%;
          outline: none;
          padding-left: ${props.type == "employee" ? "3rem" : "0"};
          font-family: ${fontFamily};
        }

        input::selection {
          color: white;
          background-color: ${colors.bluePrimary};
        }

        .input-clamp {
          overflow: hidden;
          text-overflow: ellipsis;
          -webkit-line-clamp: 1;
          display: -webkit-inline-box;
          -webkit-box-orient: vertical;
          width: 90%;
        }

      input::-ms-clear {
        display: none;
      }

      .password-eye {
        position: absolute;
        top: 0.5rem;
        right: 0.5rem;
        cursor: pointer;
      }

      .clear-button {
        position: absolute;
        top: 1rem;
        right: 0.5rem;
        cursor: pointer;
      }

      .password-required-label {
        position: absolute;
        right: 2rem;
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
          text-align: right;
        }

        .initial {
          align-items: center;
          background-color: ${colors.bluePrimary};
          border-radius: 1.25rem;
          color: ${colors.white};
          display: flex;
          font-weight: bold;
          height: 2.5rem;
          justify-content: center;
          left: 0.5rem;
          margin-right: 1rem;
          position: absolute;
          top: 0.5rem;
          width: 2.5rem;
        }

        .button-height {
          height: 2.5rem;
          min-height: 2.5rem;
          margin-top: 0;
        }

        .no-top-padding {
          padding-top: 0;
        }

        .search-style {
          background: white;
          padding: 0.5rem;
          height: 52px;
          min-height: auto;
          box-shadow: ${shadows.cardSmall};
          border-bottom: 1px solid ${colors.bluePrimary};
        }

        .white {
          background: white;
          padding: 0rem;
          min-height: 2rem;
        }

      `}</style>
    </div>
  );
}

TextInput.defaultProps = {
  type: 'text',
  required: false
};

export default TextInput;
