import React from 'react';
import { colors, fontSizes, layout, fontFamily } from '../../../theme';
import * as Enums from '../../../utils/enums';
import Helper from '../../../utils/helper';

export default function KendoCellStatus(props) {

    const field = props.field || "";
    let value = props.dataItem[field];
    if (value === ", ") {
        value = null;
    }
    const valueEnum = props.valueEnum;

    function hexToRGB(hex, alpha) {
        let r = parseInt(hex.slice(1, 3), 16),
            g = parseInt(hex.slice(3, 5), 16),
            b = parseInt(hex.slice(5, 7), 16);

        if (alpha) {
            return "rgba(" + r + ", " + g + ", " + b + ", " + alpha + ")";
        } else {
            return "rgb(" + r + ", " + g + ", " + b + ")";
        }
    }

    let colorStyle = {};
    let colorClass = "";

    let valueArray = [];
    let valueDescription;
    let valueDisplayColor;

    if (value) {

        if (typeof value === 'object') {
            valueDescription = value.Description.trim();
            valueDisplayColor = value.DisplayColor.trim();
        } else {
            if (!valueEnum) {
                if (typeof value === "string" && value.includes(",")) {
                    valueArray = value.split(",");
                    if (valueArray.length > 1) {
                        valueDescription = valueArray[0].trim();
                        valueDisplayColor = valueArray[1].trim();
                    }
                }
            }
        }
    }

    if (value && valueDisplayColor) {
        colorClass = valueDisplayColor;
        if (valueDisplayColor.includes('#')) {
            let rgbaValue = hexToRGB(valueDisplayColor, 0.2);
            colorStyle = { backgroundColor: rgbaValue, color: valueDisplayColor };
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
            case "PurchaseOrderStatus":
                colorClass = Enums.getEnumStringValue(Enums.PurchaseOrderStatusColor, value);
                break;
            case "MessageStatus":
                colorClass = Enums.getEnumStringValue(Enums.MessageStatusColor, value);
                break;
            case "FormDefinitionStatus":
                colorClass = Enums.getEnumStringValue(Enums.FormDefinitionStatusColor, value);
                break;
        }
    }

    function displayValue() {
        if (valueEnum) {
            switch (valueEnum) {
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
                case "FormRule":
                    return Enums.getEnumStringValue(Enums.FormRule, value);
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
                case "FormDefinitionStatus":
                    return Enums.getEnumStringValue(Enums.FormDefinitionStatus, value);
                case "WarehouseType":
                    return Enums.getEnumStringValue(Enums.WarehouseType, value);
                case "StockTransactionStatus":
                    return Enums.getEnumStringValue(Enums.StockTransactionStatus, value);
            }
        }
        if (value) {
            if (valueDescription) {
                return valueDescription.trim();
            }
            return value;
        }
        return 'N/A';
    }

    return (
        <td>
            <div className="container">
                <div className={"status " + colorClass} style={colorStyle}>
                    {displayValue()}
                </div>
            </div>
            <style jsx>{`
        .container {
          //display: contents;
        }
        .status {
          align-items: center;
          background-color: rgba(28,37,44,0.2);
          border-radius: ${layout.buttonRadius};
          box-sizing: border-box;
          color: ${colors.darkPrimary};
          display: flex;
          font-size: 11px;
          font-weight: bold;
          justify-content: center;
          padding: 0 0.5rem;
          text-align: center;
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
        </td>
    )
};


