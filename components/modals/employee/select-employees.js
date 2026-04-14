import React from 'react';
import { colors, layout, tickSvg } from '../../../theme';
import Helper from '../../../utils/helper';
import SCCheckbox from '../../sc-controls/form-controls/sc-checkbox';
import SCModal from "@/PageComponents/Modal/SCModal";
import {Box, Button} from '@mantine/core';

function SelectEmployees({ employees, selectedEmployees, setSelectedEmployees, setChangingEmployees }) {

  const selectEmployee = (employee) => {
    let newEmployees = [];
    if (selectedEmployees.find(x => x.ID == employee.ID)) {
      newEmployees = selectedEmployees.filter(x => x.ID != employee.ID);
    } else {
      newEmployees = [
        ...selectedEmployees,
        employee
      ];
    }
    setSelectedEmployees(Helper.sortObjectArray(newEmployees, 'FullName'));
  };

  return (

      <SCModal
          open
          decor={'none'}
          onClose={() => setChangingEmployees(false)}
          size={'sm'}
      >
        <div className="title">
          {"Select employees for communication"}
        </div>
        <div>

          <div className="option-container">
            {employees.map(function (employee, index) {
              const employeeSelected = selectedEmployees.find(x => x.ID === employee.ID);
              return (
                  <>
                    <SCCheckbox
                        key={index}
                        value={employeeSelected}
                        label={employee.FullName}
                        onChange={() => selectEmployee(employee)}
                    />
                    {/* <div key={index} className={`option ${employeeSelected ? "selected" : ""}`} onClick={() => selectEmployee(employee)}>
                  <div className="box"></div>
                  {employee.FullName}
                </div> */}
                  </>
              )
            })}
          </div>
          <Box>
            <Button
                mt={'sm'}
                onClick={() => setChangingEmployees(false)}
                w={'100%'}
            >
              Done
            </Button>
          </Box>
          {/*<div className="row space-between">
            <LegacyButton text="Done" onClick={() => setChangingEmployees(false)}/>
          </div>*/}
        </div>

        <style jsx>{`
          .row {
            display: flex;
          }

          .space-between {
            justify-content: space-between;
          }

          .align-end {
            align-items: flex-end;
          }

          .title {
            color: ${colors.bluePrimary};
            font-size: 1.125rem;
            font-weight: bold;
            margin-bottom: 1rem;
          }

          .label {
            font-size: 0.875rem;
            margin-bottom: 0.5rem;
          }

          .status {
            align-items: center;
            background-color: rgba(28, 37, 44, 0.2);
            border-radius: ${layout.buttonRadius};
            box-sizing: border-box;
            color: ${colors.darkPrimary};
            display: flex;
            font-size: 0.75rem;
            font-weight: bold;
            height: 2rem;
            justify-content: center;
            padding: 0 1rem;
            text-align: center;
          }

          .cancel {
            width: 6rem;
          }

          .update {
            width: 14rem;
          }

          .option-container {
            max-height: 26rem;
            overflow-y: scroll;
          }

          .option {
            align-items: center;
            cursor: pointer;
            display: flex;
            height: 2rem;
          }

          .box {
            border: 1px solid ${colors.labelGrey};
            border-radius: ${layout.inputRadius};
            box-sizing: border-box;
            cursor: pointer;
            height: 1rem;
            margin-right: 1rem;
            opacity: 0.4;
            width: 1rem;
          }

          .selected .box {
            background-color: ${colors.bluePrimary};
            background-image: ${tickSvg};
            background-position: center;
            background-repeat: no-repeat;
            background-size: 70%;
            border: none;
            opacity: 1;
          }
        `}</style>

      </SCModal>
  )
}
    export default SelectEmployees;
