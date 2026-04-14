import React, { useState, useEffect, useContext } from 'react';
import { colors, fontSizes, layout, fontFamily, tickSvg } from '../../../theme';
import EmployeeService from '../../../services/employee/employee-service';
import SCMultiSelect from '../../sc-controls/form-controls/sc-multiselect';
import EmployeeAvatar from "@/PageComponents/Table/EmployeeAvatar";

function EmployeeMultiSelector({ selectedEmployees, setSelectedEmployees, onEmployeesGet, storeID, error, disabled = false, readonlyValues = [] }) {

  const [employees, setEmployees] = useState([]);

  const getEmployees = async () => {
    const employees = await EmployeeService.getEmployees(storeID);

    setEmployees(employees.Results);

    onEmployeesGet && onEmployeesGet(employees.Results);
  };

  useEffect(() => {
    getEmployees();
  }, [storeID]);

  const changeHandler = (result) => {
    setSelectedEmployees(result);
  };

  /*const extractInitials = (employee) => {
    let firstNameInitial = employee.FirstName ? employee.FirstName[0] : '';
    let lastNameInitial = employee.LastName ? employee.LastName[0] : '';

    return firstNameInitial + lastNameInitial;
  };*/

  return (
    <>
      <SCMultiSelect
        availableOptions={employees}
        selectedOptions={selectedEmployees}
        dataItemKey={"ID"}
        textField={"FullName"}
        onChange={changeHandler}
        label="Assigned employees"
        error={error}
        disabled={disabled}
        readonlyValues={readonlyValues}
        itemRenderMantine={(itemProps) => {

          /*let displayColorStyle = itemProps.dataItem.DisplayColor && itemProps.dataItem.DisplayColor.startsWith("#") ? itemProps.dataItem.DisplayColor : "";
          let displayColorClass = itemProps.dataItem.DisplayColor && !displayColorStyle ? itemProps.dataItem.DisplayColor + "Local" : "";*/

          return (
            <div className="employee-container">

              <div className="initial-container">
                  <EmployeeAvatar name={itemProps.dataItem?.FullName} color={itemProps.dataItem?.DisplayColor} />
                {/*<div className={`initial ${displayColorClass ? displayColorClass : ''}`} style={{ backgroundColor: `${displayColorStyle}` }}>
                  {extractInitials(itemProps.dataItem)}
                </div>*/}
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
        valueRenderMantine={(itemProps) => {

          let displayColorStyle = itemProps.dataItem.DisplayColor && itemProps.dataItem.DisplayColor.startsWith("#") ? itemProps.dataItem.DisplayColor : "";
          let displayColorClass = itemProps.dataItem.DisplayColor && !displayColorStyle ? itemProps.dataItem.DisplayColor + "Local" : "";

          const isDisabled = itemProps.dataItem?.IsActive === false;

          return (
            <div className={`employee-container-value ${isDisabled ? 'dimmed' : ''}`}>

              <div className="initial-container-value">
                  <EmployeeAvatar name={itemProps.dataItem?.FullName} color={itemProps.dataItem?.DisplayColor} size={.9} />
              </div>

              <div className="details-container-value">
                <span className="item1-value">{itemProps.dataItem.FullName} {isDisabled ? '(disabled)' : ''}</span>
              </div>

              <style jsx>{`
                          .employee-container-value {
                              display: flex;
                              align-items: center;
                              position: relative;
                          }
                          .dimmed {
                              opacity: 0.5;
                          }
                          .initial-container-value {
                              
                          }
                          .initial-value {
                              align-items: center;
                              background-color: ${colors.bluePrimary};
                              border-radius: 1rem;
                              color: ${colors.white};
                              display: flex;
                              font-weight: bold;
                              height: 1.3rem;
                              justify-content: center;
                              width: 1.3rem;
                              font-size: 0.6rem;
                          }
                          .details-container-value {
                              display: flex;
                              margin-left: 8px;
                              flex-direction: column;
                          }
                          .details-container-value > span {
                              /* margin-top: -3px; 
                              margin-bottom: -3px; */
                          }
                          .item1-value {
                              /* font-weight: bold; */
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

        //   let displayColorStyle = itemProps.dataItem.DisplayColor && itemProps.dataItem.DisplayColor.startsWith("#") ? itemProps.dataItem.DisplayColor : "";
        //   let displayColorClass = itemProps.dataItem.DisplayColor && !displayColorStyle ? itemProps.dataItem.DisplayColor + "Local" : "";

        //   const itemChildren = (
        //     <div className="employee-container">

        //       <div className="initial-container">
        //         <div className={`initial ${displayColorClass ? displayColorClass : ''}`} style={{ backgroundColor: `${displayColorStyle}` }}>
        //           {extractInitials(itemProps.dataItem)}
        //         </div>
        //       </div>

        //       <div className="details-container">
        //         <span className="item1">{itemProps.dataItem.FullName}</span>
        //         <span className="item2">{itemProps.dataItem.EmailAddress}</span>
        //       </div>

        //       <style jsx>{`
        //                     .employee-container {
        //                         display: flex;
        //                         align-items: center;
        //                         position: relative;
        //                     }
        //                     .initial-container {
                                
        //                     }
        //                     .initial {
        //                         align-items: center;
        //                         background-color: ${colors.bluePrimary};
        //                         border-radius: 1rem;
        //                         color: ${colors.white};
        //                         display: flex;
        //                         font-weight: bold;
        //                         height: 2rem;
        //                         justify-content: center;
        //                         width: 2rem;
        //                     }
        //                     .details-container {
        //                         display: flex;
        //                         margin-left: 8px;
        //                         flex-direction: column;
        //                     }
        //                     .details-container > span {
        //                         margin-top: -3px; 
        //                         margin-bottom: -3px;             
        //                     }
        //                     .item1 {
        //                         font-weight: bold;
        //                     }
        //                     .item2 {

        //                     }
        //                     .RedLocal {
        //                         background-color: #FC2E50 !important;
        //                       }
        //                       .OrangeLocal {
        //                         background-color: #F26101 !important;
        //                       }
        //                       .YellowLocal {
        //                         background-color: #FFC940 !important;
        //                       }
        //                       .GreenLocal {
        //                         background-color: #51CB68 !important;
        //                       }
        //                       .BlueLocal {
        //                         background-color: #5A85E1 !important;
        //                       }
        //                       .PurpleLocal {
        //                         background-color: #735AE1 !important;
        //                       }
        //                       .BlackLocal {
        //                         background-color: #4F4F4F !important;
        //                       }
        //                       .GreyLocal {
        //                         background-color: #828282 !important;
        //                       }
        //                       .LightGreyLocal {
        //                         background-color: #BDBDBD !important;
        //                       }
        //                       .CyanLocal {
        //                         background-color: #13CACD !important;
        //                       }
        //                 `}</style>
        //     </div>
        //   );
        //   return React.cloneElement(li, li.props, itemChildren);
        // }}
      />
    </>
  )
}

export default EmployeeMultiSelector;
