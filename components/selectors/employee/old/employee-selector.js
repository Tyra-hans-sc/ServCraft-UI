import React, { useState, useEffect, useContext } from 'react';
import { colors, fontSizes, layout, fontFamily, tickSvg } from '../../../theme';
import EmployeeService from '../../../services/employee/employee-service';
import SCDropdownList from '../../sc-controls/form-controls/sc-dropdownlist';
import * as Enums from '../../../utils/enums';

function EmployeeSelector({ selectedEmployee, setSelectedEmployee, storeID, error, accessStatus, required, canClear = true, 
  label = "Employee", cascadeDependency = null, placeholder = "Select employee", filter = undefined, disabled = false, readOnly = false }) {

  const [employees, setEmployees] = useState([]);

  const getEmployees = async () => {
    const employeeList = await EmployeeService.getEmployees(storeID);

    if (filter && employeeList && employeeList.Results) {
      employeeList.Results = employeeList.Results.filter(x => filter(x));
    }

    setEmployees(employeeList.Results);
  };

  useEffect(() => {
    getEmployees();
  }, [cascadeDependency]);



  const handleEmployeeChange = (employee) => {
    setSelectedEmployee(employee);
  };

  const extractInitialsFromFullName = (fullname) => {
    let names = fullname?.trim().replace(/  /g, " ").split(" ") ?? [];
    if (names.length > 0) {
      let FirstName = names[0];
      let LastName = names.length > 1 ? names[1] : " ";
      return FirstName[0] + LastName[0];
    }
    return "";
  };

  const extractInitials = (employee) => {
    let firstNameInitial = employee.FirstName ? employee.FirstName[0] : '';
    let lastNameInitial = employee.LastName ? employee.LastName[0] : '';

    return firstNameInitial + lastNameInitial;
  };

  const valueRender = (element, value) => {
    if (!value) {
      return element;
    }

    const children = [
      <span
        key={1}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: `${colors.bluePrimary}`,
          color: `${colors.white}`,
          borderRadius: "50%",
          width: "24px",
          height: "24px",
          textAlign: "center",
          overflow: "hidden",
          fontSize: "0.75rem",
        }}
      >
        {extractInitials(value)}
      </span>,
      <span key={2}>&nbsp; {element.props.children}</span>,
    ];
    return React.cloneElement(element, { ...element.props }, children);
  };

  return (
    <>
      <SCDropdownList
        disabled={accessStatus === Enums.AccessStatus.LockedWithAccess || accessStatus === Enums.AccessStatus.LockedWithOutAccess || disabled}
        readOnly={readOnly}
        name="Employee"
        value={selectedEmployee}
        dataItemKey={"ID"}
        textField={"FullName"}
        options={employees}
        label={label}
        error={error}
        onChange={handleEmployeeChange}
        required={required}
        canClear={canClear}
        placeholder={placeholder}
        iconMantine={(() => {

          if (!selectedEmployee) return undefined;

          let displayColorStyle = selectedEmployee.DisplayColor && selectedEmployee.DisplayColor.startsWith("#") ? selectedEmployee.DisplayColor : "";
          let displayColorClass = selectedEmployee.DisplayColor && !displayColorStyle ? selectedEmployee.DisplayColor + "Local" : "";

          return (
            <div className="employee-container-icon">

              <div className="initial-container-icon">
                <div className={`initial-icon ${displayColorClass ? displayColorClass : ''}`} style={{ backgroundColor: `${displayColorStyle}` }}>
                  {extractInitials(selectedEmployee)}
                </div>
              </div>

              <style jsx>{`
                                      .employee-container-icon {
                                          display: flex;
                                          align-items: center;
                                          position: relative;
                                          padding-right: "0.5rem";
                                      }
                                      .initial-container-icon {
                                      }
                                      .initial-icon {
                                          align-items: center;
                                          background-color: ${colors.bluePrimary};
                                          border-radius: 1rem;
                                          color: ${colors.white};
                                          display: flex;
                                          font-weight: bold;
                                          height: 1.5rem;
                                          justify-content: center;
                                          width: 1.5rem;
                                          font-size: 0.7rem;
                                      }
                                     
                                      .RedLocal {
                                          background-color: #FC2E50 !important;
                                        }
                                        .OrangeLocal {
                                          background-color: #F26101 !important;
                                        }
                                        .YellowLocal {
                                          background-color: #FFC940 !important;
                                        }
                                        .GreenLocal {
                                          background-color: #51CB68 !important;
                                        }
                                        .BlueLocal {
                                          background-color: #5A85E1 !important;
                                        }
                                        .PurpleLocal {
                                          background-color: #735AE1 !important;
                                        }
                                        .BlackLocal {
                                          background-color: #4F4F4F !important;
                                        }
                                        .GreyLocal {
                                          background-color: #828282 !important;
                                        }
                                        .LightGreyLocal {
                                          background-color: #BDBDBD !important;
                                        }
                                        .CyanLocal {
                                          background-color: #13CACD !important;
                                        }
                                  `}</style>
            </div>
          );
        })()}
        itemRenderMantine={(itemProps) => {

          let displayColorStyle = itemProps.dataItem.DisplayColor && itemProps.dataItem.DisplayColor.startsWith("#") ? itemProps.dataItem.DisplayColor : "";
          let displayColorClass = itemProps.dataItem.DisplayColor && !displayColorStyle ? itemProps.dataItem.DisplayColor + "Local" : "";

          return (
            <div className="employee-container">

              <div className="initial-container">
                <div className={`initial ${displayColorClass ? displayColorClass : ''}`} style={{ backgroundColor: `${displayColorStyle}` }}>
                  {extractInitials(itemProps.dataItem)}
                </div>
              </div>

              <div className="details-container">
                <span className="item1">{itemProps.dataItem.FullName}</span>
                <span className="item2">{itemProps.dataItem.EmailAddress}</span>
              </div>

              <style jsx>{`
                                    .employee-container {
                                        display: flex;
                                        align-items: center;
                                        position: relative;
                                    }
                                    .initial-container {
                                        
                                    }
                                    .initial {
                                        align-items: center;
                                        background-color: ${colors.bluePrimary};
                                        border-radius: 1rem;
                                        color: ${colors.white};
                                        display: flex;
                                        font-weight: bold;
                                        height: 2rem;
                                        justify-content: center;
                                        width: 2rem;
                                    }
                                    .details-container {
                                        display: flex;
                                        margin-left: 8px;
                                        flex-direction: column;
                                    }
                                    .details-container > span {
                                        /* margin-top: -3px; 
                                        margin-bottom: -3px; */
                                    }
                                    .item1 {
                                        font-weight: bold;
                                    }
                                    .item2 {
                                        
                                    }
                                    .RedLocal {
                                        background-color: #FC2E50 !important;
                                      }
                                      .OrangeLocal {
                                        background-color: #F26101 !important;
                                      }
                                      .YellowLocal {
                                        background-color: #FFC940 !important;
                                      }
                                      .GreenLocal {
                                        background-color: #51CB68 !important;
                                      }
                                      .BlueLocal {
                                        background-color: #5A85E1 !important;
                                      }
                                      .PurpleLocal {
                                        background-color: #735AE1 !important;
                                      }
                                      .BlackLocal {
                                        background-color: #4F4F4F !important;
                                      }
                                      .GreyLocal {
                                        background-color: #828282 !important;
                                      }
                                      .LightGreyLocal {
                                        background-color: #BDBDBD !important;
                                      }
                                      .CyanLocal {
                                        background-color: #13CACD !important;
                                      }
                                `}</style>
            </div>
          );


        }}
      // itemRender={(li, itemProps) => {
      //     const itemChildren = (
      //         <div className="employee-container">

      //             <div className="initial-container">
      //                 <div className="initial">{extractInitials(itemProps.dataItem)}</div>
      //             </div>

      //             <div className="details-container">
      //                 <span className="item1">{itemProps.dataItem.FullName}</span>
      //                 <span className="item2">{itemProps.dataItem.EmailAddress}</span>
      //             </div>

      //             <style jsx>{`
      //             .employee-container {
      //                 display: flex;
      //                 align-items: center;
      //                 position: relative;
      //             }
      //             .initial-container {

      //             }
      //             .initial {
      //                 align-items: center;
      //                 background-color: ${colors.bluePrimary};
      //                 border-radius: 1rem;
      //                 color: ${colors.white};
      //                 display: flex;
      //                 font-weight: bold;
      //                 height: 2rem;
      //                 justify-content: center;
      //                 width: 2rem;
      //             }
      //             .details-container {
      //                 display: flex;
      //                 margin-left: 8px;
      //                 flex-direction: column;
      //             }
      //             .details-container > span {
      //                 margin-top: -3px; 
      //                 margin-bottom: -3px;             
      //             }
      //             .item1 {
      //                 font-weight: bold;
      //             }
      //             .item2 {

      //             }
      //         `}</style>
      //         </div>
      //     );
      //     return React.cloneElement(li, li.props, itemChildren);
      // }}
      // valueRender={valueRender}
      />
    </>
  )
}

export default EmployeeSelector;
