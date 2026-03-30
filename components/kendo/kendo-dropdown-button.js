import React, { useState } from 'react';
import { colors, fontSizes, layout, fontFamily } from '../../theme';
import { DropDownButton } from '@progress/kendo-react-buttons';

function KendoDropdownButton({text, items, itemClicked}) {

  const onItemClick = (e) => {
    itemClicked(e.itemIndex);
  };

  return (
    <div className="dropdown-button-container">
      <DropDownButton text={text} items={items} primary={true} onItemClick={onItemClick} icon="arrow-chevron-down" />

      <style jsx>{`
        .dropdown-button-container {

        }
      `}</style>
    </div>
  );
}

export default KendoDropdownButton;
