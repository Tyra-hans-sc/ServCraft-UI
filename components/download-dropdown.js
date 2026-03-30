import React, { useState, useRef } from 'react';
import { colors, fontSizes, layout, fontFamily, tickSvg } from '../theme';
// import useOutsideClick from "../hooks/useOutsideClick";
import { useOutsideClick } from "rooks";
import DownloadService from '../utils/download-service';
import HelpDialog from './help-dialog';
import SCSpinner from './sc-controls/misc/sc-spinner';
import MenuButton, {MenuButtonProps} from "../PageComponents/Button/MenuButton";
import {IconFileExport} from "@tabler/icons-react";

function DownloadDropDown(props) {

  const ref = useRef();
  const dropdownDirection = props.dropdownDirection ? props.dropdownDirection : 'down';
  const [isDownloading, setIsDownloading] = useState(false);

  useOutsideClick(ref, () => {
    if (dropdownState) {
      setDropdownState(false);
    }
  });

  const [dropdownState, setDropdownState] = useState(false);

  const toggleDropdown = (e) => {

    if (isDownloading) return;

    if (props.options.length === 0 && props.handleClick) {
      props.handleClick();
      return;
    }

    if (dropdownState) {
      setDropdownState(false);
    } else {
      setDropdownState(true);
    }
  };

  async function downloadFile(method, url, params) {
    setIsDownloading(true);
    await DownloadService.downloadFile(method, url, params, false, false, "", "", null, false, () => {
      setIsDownloading(false);
    });
  }

  const dlOptions = props.options.map((item, key) => {
    return (
      <div key={key} className="download-container" onClick={() => downloadFile(item.method, item.url, item.params)}>
        <div className="download-label">{item.label}</div>
        {item.help ? <div className="download-help">
          <HelpDialog position="bottom" message={item.help} extraClasses="custom-margin-top" />
        </div> : ''
        }
        <style jsx>{`
          .download-container {
            display: flex;
            width: 100%;
            cursor: pointer;
          }
          .download-label {
            color: ${colors.blueGrey};
            font-weight: bold;
            font-size: 12px;
            line-height: 16px;
            text-transform: uppercase;
            white-space: nowrap;
            padding: 0.5rem;
          }
          .download-help {

          }
        `}</style>
      </div>
    );
  });

  return (
      props.menu ? <>
        <MenuButton
            text={''}
            icon={<IconFileExport size={'16'} />}
            iconMode={true}
            isBusy={isDownloading}
            title={'Export'}
        >
          {dlOptions}
        </MenuButton>
      </> :
    <div className={"select" + (dropdownState ? " select-open" : "") + (props.extraClasses ? ` ${props.extraClasses}` : "")}
      onClick={toggleDropdown} ref={dropdownState ? ref : null} >
      {dropdownState ? (
        <>
          <img src="/icons/excel-white.svg" alt="columns" className="icon" />
          <img src="/icons/arrow-drop-down.svg" alt="arrow" className="icon icon-transform" />
          <div className={`options ${dropdownDirection == 'up' ? 'options-up' : 'options-down'}`}>
            {dlOptions}
          </div>
        </>
      ) : (
        <div title={isDownloading ? "Please be patient while downloading" : props.title}>
          <img src="/icons/excel.svg" alt="columns" className="icon" />
          {isDownloading ? <SCSpinner colour='dark' /> :
            <img src="/icons/arrow-drop-down-grey.svg" alt="arrow" className="icon" />
          }
        </div>
      )}

      <style jsx>{`
        .select {
          align-items: center;
          border: 1px solid ${colors.blueGreyLight};
          border-radius: ${layout.cardRadius};
          box-sizing: border-box;
          display: flex;
          font-weight: bold;
          height: 2.5rem;
          justify-content: space-between;
          margin-top: 0.5rem;
          padding: 0.5rem 0.5rem 0.5rem 0;
          position: relative;
          min-width: 5rem;
        }

        .select-open {
          background-color: ${colors.blueGrey};
        }
        .icon {
          margin-left: 0.5rem;
          user-select: none;
        }
        .icon-transform {
          transform: rotate(180deg);
        }

        .select.compact {
          height: 28px;
          cursor: pointer;
        }

        .select.compact .icon {
          height: 20px;
          margin-top: 4px;
        }

        .options {
          background-color: ${colors.background};
          border-radius: ${layout.bigRadius};
          box-shadow: 0px 0px 32px rgba(0, 0, 0, 0.16), 0px 4px 8px rgba(0, 0, 0, 0.16), inset 0px 0px 8px rgba(86, 204, 242, 0.08);
          box-sizing: border-box;
          padding: 1rem 1rem 1rem 1rem;
          position: absolute;
          right: 0;
          top: 3rem;
          z-index: 5;
        }
        .title {
          color: ${colors.blueGrey};
          font-weight: bold;
          font-size: 12px;
          line-height: 16px;
          text-transform: uppercase;
          white-space: nowrap;
        }
        .options :global(.option) {
          align-items: center;
          display: flex;
          font-weight: normal;
          height: 2rem;
          margin-top: 0.5rem;
        }
        .options :global(.option):before {
          border: 1px solid ${colors.blueGrey};
          border-radius: ${layout.inputRadius};
          box-sizing: border-box;
          content: '';
          cursor: pointer;
          height: 1rem;
          margin-right: 1rem;
          margin-top: 2px;
          width: 1rem;
        }
        .options :global(.option-selected):before {
          background-color: ${colors.blueGrey};
          background-image: ${tickSvg};
          background-position: center;
          background-repeat: no-repeat;
          background-size: 70%;
          border: none;
          opacity: 1;
        }
        .options :global(.option-required):before {
          opacity: 0.5;
        }        
      `}</style>
    </div>
  )
}

DownloadDropDown.defaultProps = {
  text: 'Button',
};

export default DownloadDropDown;
