import React from 'react';
import { colors, fontSizes, layout, fontFamily, tickSvg } from '../theme';

const Checkbox = (props) => (
  <div title={props.title}>
    <label onClick={(props.disabled === true ? null : (e) => {
      if (props.preventDefault === true) {
        e.preventDefault();
      }
      props.changeHandler(e);
    })}
      className={props.extraClasses + (props.disabled === true ? (props.offwhite || true) === true ? " offwhite-disabled" : " disabled" : "") + " " + (props.checked ? "checked" : "")}>
      {props.label} {props.error ? <span className="error">{props.error}</span> : ""}
    </label>
    <input type="checkbox" onChange={(props.disabled === true ? null : props.changeHandler)} checked={props.checked} />

    <style jsx>{`
      input {
        display: none;
      }
      label {
        align-items: center;
        color: ${colors.bluePrimary};
        cursor: pointer;
        display: flex;
        height: 1.5rem;
        padding-left: 2rem;
        position: relative;
        font-size: 14px;
        user-select: none;
      }
      label:before {
        content: '';
        background-color: ${(props.offwhite || true) ? colors.white : colors.formGrey};
        border-radius: ${layout.inputRadius};
        height: 1.5rem;
        left: 0;
        position: absolute;
        top: 0;
        width: 1.5rem;
        border: ${(props.offwhite || true) ? `1px solid ${colors.labelGrey}` : 'none'};
      }     
      label.disabled:before {
        background-color: transparent;
        border: 1px solid ${colors.formGrey};
      }
      label.offwhite-disabled:before {
        background-color: ${colors.formGrey};
        border: 1px solid ${colors.labelGrey};
      }

      label.smaller:before {
        height: 1rem;
        width: 1rem;
      }

      .checked:before{
        background-color: ${colors.bluePrimary};
        background-image: ${tickSvg};
        background-position: center;
        background-repeat: no-repeat;
        background-size: auto;
      }
      .checked.disabled:before {
        background-color: ${colors.formGrey};
      }
      .form {
        color: ${colors.darkPrimary};
        font-size: 1rem;
        margin-top: 1rem;
        margin-bottom: 0.5rem;
      }
      .white {
        color: ${colors.white};
      }
      .fit-content {
        width: fit-content;
      }
      .error {
        margin-left: 1rem;
        color: ${colors.warningRed};
      }
      .left-margin {
        margin-left: 1rem;
      }

      .top-margin {
        margin-top: 8px;
      }
    `}</style>
  </div>
)

Checkbox.defaultProps = {
  type: 'text',
};

export default Checkbox;
