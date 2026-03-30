import React from 'react';
import { colors, fontSizes, layout, fontFamily } from '../../theme';
import * as Enums from '../../utils/enums';

function CellStatus({value, valueEnum}) {

  function hexToRGBA(h) {
    let r = 0, g = 0, b = 0;

    if (h && h.length == 4) {
      r = "0x" + h[1] + h[1];
      g = "0x" + h[2] + h[2];
      b = "0x" + h[3] + h[3];

    } else if (h && h.length == 7) {
      r = "0x" + h[1] + h[2];
      g = "0x" + h[3] + h[4];
      b = "0x" + h[5] + h[6];
    }
    return "rgba("+ +r + "," + +g + "," + +b + ", 0.2)";
  }

  let colorStyle = {};
  let colorClass = "";

  if (value && value.DisplayColor) {
    colorClass = value.DisplayColor;
    if (value.DisplayColor.includes('#')) {
      colorStyle = {backgroundColor: hexToRGBA(value.DisplayColor) , color: value.DisplayColor};
    }
  }

  if (valueEnum) {
    switch (valueEnum) {
      case "QuoteStatus":
        colorClass = Enums.getEnumStringValue(Enums.QuoteStatusColor, value);
        break;
      case "InvoiceStatus":
        colorClass = Enums.getEnumStringValue(Enums.InvoiceStatusColor, value);
        break;
      case "MessageStatus":
        colorClass = Enums.getEnumStringValue(Enums.MessageStatusColor, value);
        break;
    }
  }

  function displayValue() {
    if (valueEnum) {
      switch(valueEnum) {
        case "MessageStatus":
          return Enums.getEnumStringValue(Enums.MessageStatus, value);
        case "MessageType":
          return Enums.getEnumStringValue(Enums.MessageType, value);
        case "ImportType":
          return Enums.getEnumStringValue(Enums.ImportType, value);
        case "ImportStatus":
          return Enums.getEnumStringValue(Enums.ImportStatus, value);
        case "Module":
          return Enums.getEnumStringValue(Enums.Module, value);
        case "UserType":
          return Enums.getEnumStringValue(Enums.UserType, value);
        case "TemplateType":
          return Enums.getEnumStringValue(Enums.TemplateType, value);
        case "QuoteStatus":
          return Enums.getEnumStringValue(Enums.QuoteStatus, value);
        case "InvoiceStatus":
          return Enums.getEnumStringValue(Enums.InvoiceStatus, value);
        case "PurchaseOrderStatus":
          return Enums.getEnumStringValue(Enums.PurchaseOrderStatus, value);
        case "StockItemType":
          return Enums.getEnumStringValue(Enums.StockItemType, value);
        case "AttachmentType":
          return Enums.getEnumStringValue(Enums.AttachmentType, value);
        case "SyncStatus":
        case "QuoteToInvoiceSyncStatus":
        case "InvoiceSyncStatus":
        case "PurchaseOrderSyncStatus":
        case "InventorySyncStatus":
        case "CustomerSyncStatus":
          return Enums.getEnumStringValue(Enums.SyncStatus, value);
        case "IntegrationModule":
          return Enums.getEnumStringValue(Enums.IntegrationModule, value);
        case "LocationType":
          return Enums.getEnumStringValue(Enums.LocationType, value);
        case "FlowType":
          return Enums.getEnumStringValue(Enums.FlowType, value);
      }
    }
    if (value) {
      if (value.Description) {
        return value.Description;
      }
      return value;
    }
    return 'N/A';
  }

  return (
    <div className="container">
      <div className={"status " + colorClass} style={colorStyle}>
        {displayValue()}
      </div>

      <style jsx>{`
        .container {
          display: contents;
        }
        .status {
          align-items: center;
          background-color: rgba(28,37,44,0.2);
          border-radius: ${layout.buttonRadius};
          box-sizing: border-box;
          color: ${colors.darkPrimary};
          display: flex;
          height: 2rem;
          font-size: 12px;
          font-weight: bold;
          justify-content: center;
          padding: 0 1rem;
          text-align: center;
          min-width: 10rem;
          width: max-content;
        }

        .Red {
          background-color: rgba(252, 46, 80, 0.2); /*#FC2E50;*/
          color: #FC2E50 !important;
        }
        .Orange {
          background-color: rgba(242, 97, 1, 0.2);
          color: #F26101 !important;
        }
        .Yellow {
          background-color: rgba(255, 201, 64, 0.2);
          color: #FFC940 !important;
        }
        .Green {
          background-color: rgba(81, 203, 104, 0.2);
          color: #51CB68 !important;
        }
        .Blue {
          background-color: rgba(90, 133, 225, 0.2);
          color: #5A85E1 !important;
        }
        .Purple {
          background-color: rgba(128, 100, 250, 0.2);
          color: #735AE1 !important;
        }
        .Black {
          background-color: rgba(79, 79, 79, 0.2);
          color: #4F4F4F !important;
        }
        .Grey {
          background-color: rgba(130, 130, 130, 0.2);
          color: #828282 !important;
        }
        .LightGrey {
          background-color: rgba(189, 189, 189, 0.2);
          color: #BDBDBD !important;
        }
        .Cyan {
          background-color: rgba(19, 202, 205, 0.2);
          color: #13CACD !important;
        }
      `}</style>
    </div>
  )
}

export default CellStatus;
