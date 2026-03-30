import React, { useState } from 'react';
import { Chip } from '@progress/kendo-react-buttons';

function KendoChip({text, value, disabled}) {

  return (
    <Chip
      text={text}
      value={value}
      disabled={disabled ? disabled : false}
    />
  );
}

export default KendoChip;
