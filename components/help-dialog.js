import {useState, useEffect} from 'react';
import * as Enums from '../utils/enums';
import { colors, fontSizes, layout, fontFamily, shadows } from '../theme';
import KendoTooltip from './kendo/kendo-tooltip';

function HelpDialog({position, message, width, isAlert, extraClasses}) {

  const [tooltipTextWidth, setTooltipTextWidth] = useState(width);
  const [tooltipTextMargin, setTooltipTextMargin] = useState(-((width + 10) / 2));
  const cssClass = position == 'top' ? 'tooltiptext-top' : position == 'bottom' ? 'tooltiptext-bottom' : '';

  const renderDefault = () => {
    return (<img src={Enums.Icon.Help} title={message} />);
  };

  const renderAlert = () => {
    return (<img src={Enums.Icon.Alert} title={message} />);
  };

  return (
    <div className={`info-container ${extraClasses ? extraClasses : ''}`}>

      <KendoTooltip position={position}>
          {isAlert ? renderAlert() : renderDefault()}
      </KendoTooltip>

      <style jsx>{`
        .info-container {

        }
        .custom-margin {
          margin-left: 0.5rem;
          margin-top: 0.15rem;
        }
        .custom-margin-top {
          margin-top: 0.25rem;
        }
        .tooltip {
          position: relative;
          display: inline-block;
          z-index: 1;
        }
        .tooltip .tooltiptext {
          visibility: hidden;
          background-color: ${colors.darkPrimary};
          color: ${colors.white};
          text-align: center;
          border-radius: 6px;
          padding: 5px;
          position: absolute;
          opacity: 0; 
          transition: opacity 1s;
        }
        .tooltip .tooltiptext::after {
          content: "";
          position: absolute;
          border-width: 5px;
          border-style: solid;
        }
        .tooltip:hover .tooltiptext {
          visibility: visible;
          opacity: 0.75;
        }
        
        .tooltip .tooltiptext-top {
          width: ${tooltipTextWidth}px;
          left: 50%;
          bottom: 125%;
          margin-left: ${tooltipTextMargin}px;
        }
        .tooltip .tooltiptext-top::after {
          top: 100%;
          left: 50%;
          margin-left: -5px;
          border-color: ${colors.darkPrimary} transparent transparent transparent;
        }

        .tooltip .tooltiptext-bottom {
          width: ${tooltipTextWidth}px;
          left: 50%;
          top: 150%;
          margin-left: ${tooltipTextMargin}px;
        }
        .tooltip .tooltiptext-bottom::after {
          bottom: 100%;
          left: 50%;
          margin-left: -5px;
          border-color: transparent transparent ${colors.darkPrimary} transparent;
        }

      `}</style>
    </div>
  );
}

export default HelpDialog
