import React, { useState, useRef } from 'react'
import Link from 'next/link'
import { colors, layout } from '../theme'
import useOutsideClick from "../hooks/useOutsideClick";
import Helper from '../utils/helper';
import SCSpinner from '../components/sc-controls/misc/sc-spinner';
import MenuButton from "../PageComponents/Button/MenuButton";

const useMenu = true

function ButtonDropdown(props) {

  if(useMenu) {
    return <MenuButton {...props} legacyOptions={props.options} options={undefined} legacyHeightAndMargin />
  }

  /** Unused */
  const ref = useRef();
  const dropdownDirection = props.dropdownDirection ? props.dropdownDirection : 'down';
  let suppressDropdown = false;

  useOutsideClick(ref, () => {
    if (dropdownState) {
      setDropdownState(false);
    }
  });

  const [dropdownState, setDropdownState] = useState(false);

  const toggleDropdown = (e) => {
    if (props.disabled === true) {
      return;
    }
    if (!suppressDropdown) {
      setDropdownState(!dropdownState);
    }
    suppressDropdown = false;
  };

  const handleMainAction = (e) => {
    suppressDropdown = true;
    props.mainAction();
  };

  const options = props.options.map((item, key) => {
    if (props.action) {
      if (props.type === 'color-code') {
        return <div style={{ display: 'flex' }} onClick={() => props.action(item.link)} key={key}>
          <div style={{ background: Helper.hexToRgba(item.color, 0.2), position: 'relative', padding: 0, width: 16, height: 16, borderRadius: '50%', marginRight: 8 }}>
            <div style={{ background: item.color, position: 'absolute', padding: 0, width: 8, height: 8, left: 4, top: 4, borderRadius: '50%' }}></div>
          </div>
          {item.text}
        </div>
      } else {
        return <div onClick={() => props.action(item.link)} key={key}>{item.text}</div>
      }
    } else {
      return <Link legacyBehavior={true} href={item.link} key={key}><a onClick={() => Helper.nextLinkClicked(item.link)}>{item.text}</a></Link>
    }
  });

  return (
    <div title={props.title} className={"button " + (props.disabled === true ? "disabled " : "") + (props.extraClasses ? props.extraClasses : "")} onClick={toggleDropdown} ref={dropdownState ? ref : null}>
      {props.mainAction ?
        <div className="main-action-overlay" onClick={handleMainAction}></div> : ''
      }
      <p className="text">{props.text}</p>
      <div className={`icon`}>
        {props.isBusy ?
          <SCSpinner />
          :
          <img className={`${dropdownDirection == 'up' ? 'flip-icon' : ''}`} src="/icons/arrow-drop-down.svg" alt="arrow" />}
      </div>
      {dropdownState ? (
        <div className={`options ${dropdownDirection == 'up' ? 'options-up' : 'options-down'}`}>
          {options}
        </div>
      ) : (
        ""
      )}

      <style jsx>{`
        .button {
          align-items: center;
          background-color: ${colors.bluePrimary};
          border-radius: ${layout.buttonRadius};
          box-sizing: border-box;
          color: ${colors.white};
          cursor: pointer;
          display: flex;
          font-weight: bold;
          height: 2.5rem;
          justify-content: space-between;
          margin-top: 0.5rem;
          position: relative;
        }
        .button.disabled {
          background-color: ${colors.blueGreyLight};
          cursor: default;
        }
        .button.fit-content {
          width: max-content;
        }
        .button p {
          margin-left: 1rem;
          user-select: none;
        }
        .auto {
          width: auto;
        }
        .wide-print {
          width: 120px;
        }
        .main-action-overlay {
          position: absolute;
          left: 0;
          top: 0;
          height: 100%;
          width: calc(100% - 40px);
          display: inline-block;
        }
        .icon {
          align-items: center;
          border-left: 1px solid ${colors.blueHue};
          display: flex;
          height: 100%;
          justify-content: center;
          user-select: none;
          width: 40px;
        }
        .flip-icon {
          transform: rotate(180deg);
        }

        .is-loading .text {
          display: none;
        }
        .is-loading .loader {
          display: block;
        }
        .options {
          background-color: ${colors.white};
          border-radius: ${layout.buttonRadius};
          box-shadow: 0px 20px 25px 0px rgba(0,0,0,0.1), 0px 10px 10px 0px rgba(0,0,0,0.4);
          box-sizing: border-box;
          left: 0;
          padding: 0.5rem;
          position: absolute;
          width: auto;
          z-index: 2;
        }
        .options-down {
          top: 2.5rem;
        }
        .options-up {
          bottom: 2.5rem;
        }
        .options :global(a) {
          border-radius: ${layout.buttonRadius};
          box-sizing: border-box;
          color: ${colors.darkPrimary};
          display: inline-block;
          font-size: 14px;
          font-weight: 400;
          padding: 0.5rem 0.6875rem;
          text-decoration: none;
          user-select: none;
          width: 100%;
          z-index: 1;
        }
        .options :global(a:hover) {
          background-color: #EEF3FA;
        }
        .options :global(div) {
          border-radius: ${layout.buttonRadius};
          box-sizing: border-box;
          color: ${colors.darkPrimary};
          display: block;
          font-size: 14px;
          font-weight: 400;
          padding: 0.5rem 0.6875rem;
          text-decoration: none;
          user-select: none;
          width: 100%;
          z-index: 1;
        }
        .options :global(div:hover) {
          background-color: #EEF3FA;
        }
        .text {
          margin: 8px;
        }
      `}</style>
    </div>
  )
}

ButtonDropdown.defaultProps = {
  action: undefined,
  type: undefined,
  text: 'Button',
};

export default ButtonDropdown
