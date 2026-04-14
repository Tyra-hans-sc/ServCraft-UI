import React, { useState } from 'react';
import { ChipList } from '@progress/kendo-react-buttons';

function KendoChipList({options, textField, valueField, handleChange, disabled}) {

  const onDataChange = (e) => {
    handleChange(e.target.value);
  };

  return (
    <div>
      <ChipList
        selection="multiple"
        data={options}
        onDataChange={onDataChange}
        textField={textField}
        valueField={valueField}
        disabled={disabled ? disabled : false}
      />
    </div>
  );
}

export default KendoChipList;
