import React from 'react';
import { colors, layout} from '../../theme';

function CellTech({value}) {

  function getInitials() {

    if (value && value[0] && Array.isArray(value) && value.length > 0) {
      let name = value[0].FirstName + " " + value[0].LastName;
      const initials = value[0].FirstName[0] + value[0].LastName[0];
      if (value.length > 1) {
        name = name + " + " + (value.length - 1);
      }
      return (
        <>
          <div className={`initials ${value && value.length > 1 ? " initials-multiple" : ""}`}>
            {initials}
          </div>
          {name}
        </>
      )
    } else if (value && value[0] && value.length > 0) {
      const names = value.split(' ');
      return (
        <>
          <div className="initials">
            {names[0][0] + names[1][0]}
          </div>
          {value}
        </>
      )
    }
    return (
      <>
        <div className="initials user">
          <img src="/icons/user-white.svg" alt="user" />
        </div>
        Unassigned
      </>
    )
  }

  return (
    <div className="container">
      {getInitials()}
      <style jsx>{`
        .container {
          align-items: center;
          display: flex;
        }
        .container :global(.initials) {
          align-items: center;
          color: ${colors.white};
          display: flex;
          flex-shrink: 0;
          font-size: 0.875rem;
          height: 2.4rem;
          justify-content: center;
          margin-right: 0.5rem;
          position: relative;
          width: 2.4rem;
          z-index: 2;
        }
        .container :global(.initials:after) {
          background-color: ${colors.bluePrimary};
          border: 2px solid ${colors.white};
          border-radius: 1.25rem;
          box-sizing: border-box;
          content: '';
          height: 2.4rem;
          position: absolute;
          right: 0;
          top: 0;
          width: 2.4rem;
          z-index: -1;
        }
        .container :global(.initials-multiple:before) {
          background-color: ${colors.bluePrimary};
          border: 2px solid ${colors.white};
          border-radius: 1.25rem;
          box-sizing: border-box;
          color: ${colors.white};
          content: '';
          height: 2.4rem;
          left: -0.4rem;
          position: absolute;
          top: 0;
          width: 2.4rem;
          z-index: -1;
        }
        .container :global(.user:after) {
          background-color: ${colors.blueGreyLight};
        }
      `}</style>
    </div>
  )
}

export default CellTech
