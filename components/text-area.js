import React, { useRef, useEffect, useState } from 'react';
import { colors, fontSizes, layout, fontFamily } from '../theme';

const TextArea = (props) => {

  const ref = useRef();

  useEffect(() => {
    ref.current.readOnly = props.readOnly === true;
  }, [props.readOnly]);

  return (<div className={"container textarea-container" + (props.extraClasses ? " " + props.extraClasses : "")}>
    <div className="row">
      <label>{props.label}</label>
      {props.error && props.error != ""
        ? <div className="label error">{props.error}</div>
        : props.required
          ? <div className="label">Required</div>
          : ""
      }
    </div>
    <textarea
      data-cy={props.cypress}
      ref={ref}
      spellCheck={true}
      onChange={props.changeHandler}
      onKeyDown={props.handleKeyDown}
      placeholder={props.placeholder}
      type={props.type}
      name={props.name}
      value={props.value}
      autoFocus={props.autoFocus}
      rows={props.rows ? props.rows : 2}
    />

    <style jsx>{`
      .container {
        background-color: ${colors.formGrey};
        border-radius: ${layout.inputRadius};
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        height: 10rem;
        padding: 0.5rem;
        width: 100%;
        margin-top: 0.5rem;
      }
      textarea {
        background: none;
        border: none;
        box-shadow: none;
        color: ${colors.darkPrimary}; 
        font-family: ${fontFamily};
        font-size: ${fontSizes.body};
        height: 100%;
        outline: none;
        resize: none;
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
      .fit-content {
        height: fit-content !important;
      }

      .white {
        background: white;
        padding: 0;
      }
    `}</style>
  </div>);
};

export default TextArea;
