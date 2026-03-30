import React from 'react';
import { colors, layout, tickSvg} from '../../theme';

function FilterCheck(props) {
  
  let options = []
  if (props.options){
    options = props.options.map((item, key) =>
      <div className="option" key={key} onClick={() => props.checkFunc(props.filterName, item)}>
        <div className={"box" + (props.selected.includes(item) ? " box-checked" : "")}></div>
        {item}
      </div>
    );
  }

  return (
    <div className="container">
      {options}
      <style jsx>{`
        .container {
          width: max-content;
          overflow-x: auto;
        }
        .container :global(.option) {
          align-items: center;
          color: ${colors.darkPrimary};
          cursor: pointer;
          display: flex;
          font-size: 14px;
          height: 2.5rem;
          width: max-content;
        }
        .container :global(.box) {
          background-color: ${colors.formGrey};
          border-radius: ${layout.inputRadius};
          height: 18px;
          margin-right: 0.75rem;
          width: 18px;
        }
        .container :global(.box-checked) {
          background-color: ${colors.bluePrimary};
          background-image: ${tickSvg};
          background-position: center;
          background-repeat: no-repeat;
          background-size: 70%;
        }
      `}</style>
    </div>
  )
}

export default FilterCheck;
