import React from 'react'
import Link from 'next/link'
import { colors, fontSizes, layout, fontFamily } from '../theme'

function Switch({ options, selectedOption, setSelected, extraClasses, disabled = false }) {
  return (
    <div className={"switch " + extraClasses}>
      {options.map((option, key) => {
        let firstPipeIdx = option.toString().indexOf("|");
        let lastPipeIdx = option.toString().lastIndexOf("|");
        let disable = firstPipeIdx === 0 && lastPipeIdx > firstPipeIdx;
        let optionText = disable ? option.substring(firstPipeIdx + 1, lastPipeIdx) : option;
        let title = '';

        if (disable && optionText == 'Asset') {
          title = 'A customer and contact must be selected to choose an asset';
        }

        return (
          <div className={`option ${optionText == selectedOption ? "option-selected" : ""} ${disable || disabled ? "option-disabled" : ""}`} key={key} title={title}
            onClick={() => {
              if (!disable && !disabled) setSelected(option);
            }}>
            {optionText}
          </div>
        );
      }
      )}
      <style jsx>{`
        .switch {
          background-color: ${colors.white};
          border: 1px solid ${colors.bluePrimary};
          border-radius: ${layout.buttonRadius};
          box-sizing: border-box;
          display: flex;
          height: 2.5rem;
          width: max-content;
        }
        .option {
          align-items: center;
          box-sizing: border-box;
          color: ${colors.bluePrimary};
          cursor: pointer;
          display: flex;
          flex-grow: 1;
          height: 100%;
          justify-content: center;
          padding: 0 1rem;
        }
        .option-selected {
          background-color: ${colors.bluePrimary};
          color: ${colors.white};
        }

        .option-disabled {
          background-color: ${colors.blueGreyLight};
          color: ${colors.white};
        }
        .option:first-child {
          border-radius:  ${layout.buttonRadius} 0px 0px  ${layout.buttonRadius};
        }
        .option:last-child {
          border-radius: 0px ${layout.buttonRadius} ${layout.buttonRadius} 0px;
        }
        .white.switch{
          background-color: ${colors.blueDark};
          border: 1px solid ${colors.white};
        }
        .white .option{
          color: ${colors.white};
        }
        .white .option-selected{
          background-color: ${colors.white};
          color: ${colors.blueDark};
        }
      `}</style>
    </div>
  )
}

export default Switch
