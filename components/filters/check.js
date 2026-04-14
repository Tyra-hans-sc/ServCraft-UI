import React from 'react';
import NoSSR from '../../utils/no-ssr';
import { colors, layout, tickSvg } from '../../theme';

function FilterCheck(props) {

  let options = []
  if (props.filterObject && props.filterObject.options) {

    let groupNames = props.filterObject.options.filter(x => x.groupName && (x.isActive || props.showDisabled)).map(x => x.groupName);
    if (groupNames.length > 0) {
      groupNames = groupNames.filter((value, index, self) => index === self.indexOf(value));
      options = groupNames.sort().map((groupName, key) =>
        <NoSSR /*required to stop the control from rendering like crap when hitting F5*/>
          <div key={key}>
            <b style={{ color: "black" }}>{groupName}</b>
            {
              props.filterObject.options.filter(x => x.groupName === groupName && (x.isActive || props.showDisabled)).map((item, innerKey) =>
                <div className="option" onClick={() => props.checkFunc(props.filterName, item)}>
                  <div className={"box" + (props.selected.includes(item) ? " box-checked" : "")}></div>
                  <span className={item.isActive === false ? "strike" : ""}>{item.name} {item.isActive ? "" : "(Disabled)"}</span>
                </div>
              )
            }
          </div>
        </NoSSR>);
    } else {
      options = props.filterObject.options.filter(x => (x.isActive || props.showDisabled)).map((item, key) =>
        <div className="option" key={key} onClick={() => props.checkFunc(props.filterName, item)}>
          <div className={"box" + (props.selected.includes(item) ? " box-checked" : "")}></div>
          <span className={item.isActive === false ? "strike" : ""}>{item.name} {item.isActive ? "" : "(Disabled)"}</span>
        </div>
      );
    }
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

        .container :global(.option.small) {
          font-size: 10px;
          height: 1.5rem;
        }

        .container :global(.option.small) span {
          opacity: 0.5;
        }

        .container :global(.box) {
          background-color: ${colors.formGrey};
          border-radius: ${layout.inputRadius};
          height: 18px;
          margin-right: 0.75rem;
          width: 18px;
        }

        .container :global(.box.small) {
          height: 12px;
          width: 12px;
        }

        .container :global(.box-checked) {
          background-color: ${colors.bluePrimary};
          background-image: ${tickSvg};
          background-position: center;
          background-repeat: no-repeat;
          background-size: 70%;
        }
        :global(span.strike) {
            // text-decoration: line-through !important;
            // color: ${colors.warningRed};
            opacity: 0.4 !important;
        }
      `}</style>
    </div>
  )
}

export default FilterCheck;
