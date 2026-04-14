import Helper from '../utils/helper';
import { colors } from '../theme';

const getStatusColors = (displayColor) => {

  let color;
  let backgroundColor;

  displayColor = displayColor ? displayColor : '';
  if (displayColor.includes('#')) {
    backgroundColor = Helper.hexToRgba(displayColor, 0.2);
    color = displayColor;
  } else {
    switch (displayColor) {
      case 'Red':
        backgroundColor = Helper.hexToRgba(colors.redStatus, 0.2);
        color = colors.redStatus;
        break;
      case 'Orange':
        backgroundColor = Helper.hexToRgba(colors.orangeStatus, 0.2);
        color = colors.orangeStatus;
        break;
      case 'Yellow':
        backgroundColor = Helper.hexToRgba(colors.yellowStatus, 0.2);
        color = colors.yellowStatus;
        break;
      case 'Green':
        backgroundColor = Helper.hexToRgba(colors.greenStatus, 0.2);
        color = colors.greenStatus;
        break;
      case 'Blue':
        backgroundColor = Helper.hexToRgba(colors.blueStatus, 0.2);
        color = colors.blueStatus;
        break;
      case 'Purple':
        backgroundColor = Helper.hexToRgba(colors.purpleStatus, 0.2);
        color = colors.purpleStatus;
        break;
      case 'Black':
        backgroundColor = Helper.hexToRgba(colors.blackStatus, 0.2);
        color = colors.blackStatus;
        break;
      case 'Grey':
        backgroundColor = Helper.hexToRgba(colors.greyStatus, 0.2);
        color = colors.greyStatus;
        break;
      case 'LightGrey':
        backgroundColor = Helper.hexToRgba(colors.lightGreyStatus, 0.2);
        color = colors.lightGreyStatus;
        break;
      case 'Cyan':
        backgroundColor = Helper.hexToRgba(colors.cyanStatus, 0.2);
        color = colors.cyanStatus;
        break;
      default:
        backgroundColor = colors.white;
        color = colors.darkPrimary;
    }
  }

  return {color: color, backgroundColor: backgroundColor};
};

export default {
  getStatusColors,
};
