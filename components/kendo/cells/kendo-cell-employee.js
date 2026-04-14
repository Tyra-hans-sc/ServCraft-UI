import React from 'react';
import { colors, layout } from '../../../theme';
import * as Enums from '../../../utils/enums';

export default function KendoCellEmployee(props) {

    const field = props.field || "";
    const value = props.dataItem[field];
    const employeesField = props.dataItem[props.employeesField || ""];
    const isOwner = props.showOwner && props.dataItem['Owner'];
  
    const module = props.module || undefined;

    const renderDestructuredEmployee = (employeesField) => {
      return (
        <>
            {employeesField.map((employee, key) => {
                let name = employee.FullName;
                let initials = "";
                let fullName = name.trim(); // james smith
                let temp = fullName.split(" "); // [james, smith]
                if (temp.length > 1) {
                    initials = temp[0][0] + temp[1][0];
                } else {
                    initials = temp[0][0];
                }

                let displayColorStyle = employee.DisplayColor && employee.DisplayColor.startsWith("#") ? employee.DisplayColor : "";
                let displayColorClass = employee.DisplayColor && !displayColorStyle ? employee.DisplayColor + "Local" : "";

                return (
                  <>
                    <span className={`initials ${displayColorClass ? displayColorClass : displayColorStyle ? 'custom' : ''}`} title={fullName} key={key}>
                        {initials}
                    </span>
                    <style jsx>{`
                      .custom:after {
                        background-color: ${displayColorStyle} !important;
                        color: #FFFFFF !important;
                      }
                    `}</style>
                  </>
                );
            })}
        </>
      )
    }

    const renderUnassignedEmployee = () => {
      return (
        <>
            <div className="initials user" title="Unassigned">
                <img src="/icons/user-white.svg" alt="user" style={{ zIndex: 1 }} />
            </div>
        </>
      )
    }

    const getInitials = () => {

        if (employeesField && employeesField.length > 0) {
          return renderDestructuredEmployee(employeesField);
        } else if (value) {            
              if (typeof value === 'object') {
                let employeesField;

                if (Array.isArray(value)) {
                  employeesField = value;
                } else {
                  employeesField = new Array();
                  employeesField.push(value);
                }
                
                if (employeesField && employeesField.length > 0) {
                  return renderDestructuredEmployee(employeesField);
                } else {
                  return renderUnassignedEmployee();
                }
              } else {

                let displayColor = props.dataItem["EmployeeDisplayColor"] || props.dataItem["DisplayColor"];

                let displayColorStyle = displayColor && displayColor.startsWith("#") ? displayColor : "";
                let displayColorClass = displayColor && !displayColorStyle ? displayColor + "Local" : "";

                let names = value.split(",");
                return (
                    <>
                        {names.map((name, key) => {
                            let initials = "";
                            let fullName = name.trim(); // james smith
                            let temp = fullName.split(" "); // [james, smith]
                            if (temp.length > 1) {
                                initials = temp[0][0] + temp[1][0];
                            } else {
                                initials = temp[0][0];
                            }
                            return (
                                <>
                                  <div className={`initials ${displayColorClass ? displayColorClass : displayColorStyle ? 'custom' : ''}`} 
                                    title={fullName} key={key}>
                                      {initials}
                                  </div>
                                  {module == Enums.Module.Employee ? fullName : ''} { isOwner ? " (Owner)" : ""}

                                  <style jsx>{`
                                    .custom:after {
                                      background-color: ${displayColorStyle} !important;
                                      color: #FFFFFF !important;
                                    }
                                  `}</style>
                                </>
                            );
                        })}  
                    </>  
                )
              }              
        }
        return renderUnassignedEmployee();
    }

    return (
        <td>
            <div className="container">
                {getInitials()}
            </div>
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
          font-size: 0.7rem;
          height: 1.5rem;
          justify-content: center;
          margin-right: 0.15rem;
          position: relative;
          width: 1.5rem;
          z-index: 0;
        }
        .container :global(.initials:after) {
          background-color: ${colors.bluePrimary};
          border: 2px solid ${colors.white};
          border-radius: 1.25rem;
          box-sizing: border-box;
          content: '';
          height: 1.5rem;
          position: absolute;
          right: 0;
          top: 0;
          width: 1.5rem;
          z-index: -1;
        }
        .container :global(.initials-multiple:before) {
          background-color: ${colors.bluePrimary};
          border: 2px solid ${colors.white};
          border-radius: 1.25rem;
          box-sizing: border-box;
          color: ${colors.white};
          content: '';
          height: 1.5rem;
          left: -0.4rem;
          position: absolute;
          top: 0;
          width: 1.5rem;
          z-index: -1;
        }
        .container :global(.user:after) {
          background-color: ${colors.blueGreyLight};
        }

          .container :global(.initials.RedLocal:after) {
            background-color: #FC2E50 !important;
            color: #FFFFFF !important;
          }
          .container :global(.initials.OrangeLocal:after) {
            background-color: #F26101 !important;
            color: #FFFFFF !important;
          }
          .container :global(.initials.YellowLocal:after) {
            background-color: #FFC940 !important;
            color: #FFFFFF !important;
          }
          .container :global(.initials.GreenLocal:after) {
            background-color: #51CB68 !important;
            color: #FFFFFF !important;
          }
          .container :global(.initials.BlueLocal:after) {
            background-color: #5A85E1 !important;
            color: #FFFFFF !important;
          }
          .container :global(.initials.PurpleLocal:after) {
            background-color: #735AE1 !important;
            color: #FFFFFF !important;
          }
          .container :global(.initials.BlackLocal:after) {
            background-color: #4F4F4F !important;
            color: #FFFFFF !important;
          }
          .container :global(.initials.GreyLocal:after) {
            background-color: #828282 !important;
            color: #FFFFFF !important;
          }
          .container :global(.initials.LightGreyLocal:after) {
            background-color: #BDBDBD !important;
            color: #FFFFFF !important;
          }
          .container :global(.initials.CyanLocal:after) {
            background-color: #13CACD !important;
            color: #FFFFFF !important;
          }          

      `}</style>
        </td>
    )
};
