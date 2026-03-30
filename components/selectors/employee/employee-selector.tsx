import React, { useState, useEffect, useRef } from 'react';
import EmployeeService from '../../../services/employee/employee-service';
import SCDropdownList from '../../sc-controls/form-controls/sc-dropdownlist';
import * as Enums from '../../../utils/enums';
import EmployeeAvatar from "@/PageComponents/Table/EmployeeAvatar";
import { Flex, Text } from '@mantine/core';
import { Employee } from '@/PageComponents/Message/Communication/NewCommunicationForm';

function EmployeeSelector({ selectedEmployee, setSelectedEmployee, storeID, error, accessStatus, required, canClear = true, 
  label = "Employee", cascadeDependency = null, placeholder = undefined, filter = undefined, disabled = false, readOnly = false, mt = undefined }) {

  const [employees, setEmployees] = useState([]);

  const getEmployees = async () => {
    const employeeList = await EmployeeService.getEmployees(storeID);

    if (filter && employeeList && employeeList.Results) {
      employeeList.Results = employeeList.Results.filter(x => (filter as any)(x));
    }

    setEmployees(employeeList.Results);
  };

  useEffect(() => {
    getEmployees();
  }, [cascadeDependency]);

  useEffect(() => {
    if (filter) {
      getEmployees();
    }
  }, [filter]);

  const handleEmployeeChange = (employee) => {
    setSelectedEmployee(employee);
  };

  return (
    <>
      <SCDropdownList
          mt={mt}
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
        iconMantine={selectedEmployee && <EmployeeAvatar name={selectedEmployee?.FullName} color={selectedEmployee?.DisplayColor} />}
        itemRenderMantine={(itemProps) =>
            <Flex gap={'xs'} align={'center'}>
              <EmployeeAvatar name={itemProps?.dataItem.FullName} color={itemProps?.dataItem.DisplayColor} />
                <Flex direction={'column'}>
                    <Text size={'sm'} fw={600}>{itemProps?.dataItem?.FullName}</Text>
                    <Text size={'sm'}>{itemProps.dataItem?.EmailAddress}</Text>
                </Flex>
            </Flex>
        }
        canSearch
      />
    </>
  )
}

export default EmployeeSelector;
