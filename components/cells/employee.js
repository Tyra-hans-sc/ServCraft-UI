import React from 'react';
import { colors, layout} from '../../theme';

function CellEmployee({value}) {
  
  const getInitials = () => {

    if (value) {

      let names = value.split(","); // james smith, joe soap
      let initials = '';
      
      let fullName = names[0].trim(); // james smith
      let temp = fullName.split(" "); // [james, smith]
      if (temp.length > 1) {
        initials = temp[0][0] + temp[1][0];        
      } else {
        initials = temp[0][0];
      }

      let name = temp[0] + " " + temp[1];
      if (names.length > 1) {
        name = name + " + " + (names.length - 1);
      }
      return (
        <>
          <span className={`initials ${names.length > 1 ? " initials-multiple" : ""}`}>
            {initials}
          </span>
          {name}
        </>

      )
    }
    return (
      <>
        <div className="initials user">
          <img src="/icons/user-white.svg" alt="user" style={{zIndex: 1}} />
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
          z-index: 1;
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

export default CellEmployee;
