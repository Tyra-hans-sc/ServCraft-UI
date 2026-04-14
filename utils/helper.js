import CellStatus from '../components/cells/status';
import CellDate from '../components/cells/date';
import CellBold from '../components/cells/bold';
import CellTech from '../components/cells/tech';
import CellWide from '../components/cells/wide';
import CellCheckbox from '../components/cells/checkbox';
import CellCurrency from '../components/cells/currency';
import CellNumber from '../components/cells/number';
import CellBool from '../components/cells/bool';
import * as Enums from './enums';
import Time from './time';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Fingerprint2 from 'fingerprintjs2/fingerprint2';
import md5 from 'md5/md5';
import Storage from './storage';
//import uuid from 'uuid/dist/v1';
import { getApiHost } from './auth';
import mixpanel from 'mixpanel-browser';
import Constants from './constants';
import BillingService from '../services/billing-service';
import KendoCellEmployee from '../components/kendo/cells/kendo-cell-employee';
import KendoCellDate from '../components/kendo/cells/kendo-cell-date';
import KendoCellStatus from '../components/kendo/cells/kendo-cell-status';
import KendoCellCurrency from '../components/kendo/cells/kendo-cell-currency';
import KendoCellNumber from '../components/kendo/cells/kendo-cell-number';
import KendoCellBool from '../components/kendo/cells/kendo-cell-bool';
// import { Userpilot } from 'userpilot';

function isFunction(object) {
  return object instanceof Function;
}

const isNullOrUndefined = (item) => {
  return item === '' || item === undefined || item === null;
};

const isNullOrWhitespace = (item) => {
  return item === undefined || item === null || item.toString().trim() === '';
};

const isEmptyObject = (obj) => {
  for (var prop in obj) {
    if (obj.hasOwnProperty(prop)) {
      return false;
    }
  }

  return JSON.stringify(obj) === JSON.stringify({});
};

const isImage = (fileName) => {
  let name = "";
  name = fileName.toString().toLowerCase().trim();
  let lastPeriodIdx = name.lastIndexOf(".");
  let ext = name.substr(lastPeriodIdx + 1);
  if (["jpg", "jpeg", "png", "bmp", "tif", "gif"].indexOf(ext) > -1) {
    return true;
  }
  return false;
};

const newGuid = () => {
  // using node-uuid package to generate uuids in a safe manner
  return typeof crypto !== 'undefined' && crypto.randomUUID() || '';
};

const hexToRgba = (h, alpha) => {
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
  if (alpha) {
    return `rgba(${+r}, ${+g}, ${+b}, ${alpha})`;
  } else {
    return `rgba(${+r}, ${+g}, ${+b}, 1)`;
  }
};

function getInitials(name) {
  if (name) {
    const names = name.split(' ');
    if (names.length > 1) {
      return names[0][0] + names[1][0];
    }
    return name[0];
  } else {
    return 'Unassigned';
  }
}

const getCurrencyValue = (value, currencySymbol = null) => {
  let currValue = 0;
  if (value) {
    currValue = value.toFixed(2);
    let spacePos = currValue.indexOf('.');
    while (spacePos > 3) {
      spacePos = spacePos - 3;
      currValue = [currValue.slice(0, spacePos), ' ', currValue.slice(spacePos)].join('');
    }
  }
  if (currValue == "0") currValue = "0.00";
  return (currencySymbol ? currencySymbol + ' ' : '') + currValue;
};

const roundToTwo = (num) => {
  num = num ? adjustFloatingPointError(num) : num
  return +(Math.round(num + "e+2") + "e-2");
};

const adjustFloatingPointError = (num, decimals = 2, deviation = 0.000001) => {
  // checking if floating point not letting it sit on the midpoint, push it onto the midpoint
  if ((num + deviation).toFixed(decimals) !== num.toFixed(decimals)) {
    num += deviation;
  }
  return num;
}

const countDecimals = (value) => {
  let text = value.toString();
  let index = text.indexOf(".");

  if (index == 0) {
    return -1;
  } else if (index > 0) {
    return text.length - index - 1;
  }
  else {
    return 0;
  }
};

const convertToDecimalValue = (value, precision, signed = false) => {

  let result = 0;

  if (isNullOrUndefined(value)) {
    result = parseFloat(result);
  } else {
    result = parseFloat(value);
  }

  if (!signed && result < 0) {
    result = 0;
  }

  if (countDecimals(result) >= precision + 1) {
    result = result.toFixed(precision);
  }

  return result;
};

const convertToUnsignedValue = (value) => {
  let result = value;
  if (result < 0 || isNullOrUndefined(result)) {
    result = 0;
  }
  return result;
};

const parseString = (st) => {
  try {
    return st.length && JSON.parse(st)
  } catch (e) {
    return st
  }
}

const parseBool = (value) => {
  let result = false;
  if (value) {
    result = value.toString().toLowerCase().trim() === "true";
  }
  return result;
}


const stringToBool = (value) => {
  let result = false;
  if (value) {
    if (value == true || value == "true") {
      result = true;
    }
  }
  return result;
};

const getSortDirection = (field, sortField, sortDirection) => {

  if (field != sortField) {
    sortDirection = 'ascending';
  } else {
    if (sortDirection == 'ascending') {
      sortDirection = 'descending';
    } else {
      sortDirection = 'ascending';
    }
  }
  return sortDirection;
};

const getColumnObject = (column) => {
  let columnObject = {
    Header: column.Label,
    accessor: column.ColumnName,
    ColumnName: column.ColumnName,
    UserWidth: column.UserWidth
  }

  if (column.CellType != "none") {
    switch (column.CellType) {
      case 'select':
      case 'check':
        columnObject['Cell'] = ({ cell: { value } }) => <CellCheckbox value={value} />;
        break;
      case 'employee':
        columnObject['Cell'] = ({ cell: { value } }) => <CellTech value={value} />;
        columnObject['KendoCell'] = (props) => <KendoCellEmployee {...props} employeesField="Employees" />;
        break;
      case 'date':
        columnObject['Cell'] = ({ cell: { value } }) => <CellDate value={value} />;
        columnObject['KendoCell'] = (props) => <KendoCellDate {...props} />;
        break;
      case 'status':
        columnObject['Cell'] = ({ cell: { value } }) => <CellStatus value={value} valueEnum={columnObject.accessor} />;
        columnObject['KendoCell'] = (props) => <KendoCellStatus {...props} valueEnum={columnObject.accessor} />
        break;
      case 'currency':
        columnObject['extraClasses'] = 'header-right-align';
        columnObject['Cell'] = ({ cell: { value } }) => <CellCurrency value={value} />;
        columnObject['KendoCell'] = (props) => <KendoCellCurrency {...props} />;
        break;
      case 'int':
      case 'int?':
        columnObject['extraClasses'] = 'header-right-align';
        columnObject['Cell'] = ({ cell: { value } }) => <CellNumber value={value} isDecimal={false} />;
        columnObject['KendoCell'] = (props) => <KendoCellNumber {...props} isDecimal={false} />;
        break;
      case 'decimal':
      case 'decimal?':
        columnObject['extraClasses'] = 'header-right-align';
        columnObject['Cell'] = ({ cell: { value } }) => <CellNumber value={value} isDecimal={true} />;
        columnObject['KendoCell'] = (props) => <KendoCellNumber {...props} isDecimal={true} />;
        break;
      case 'icon':
        columnObject['Cell'] = ({ cell: { value } }) => <CellBool value={value} />;
        columnObject['KendoCell'] = (props) => <KendoCellBool {...props} invertValue={column.ColumnName == 'IsClosed'} />;
        break;
      default:
        columnObject['Cell'] = ({ cell: { value } }) => <CellBold value={value} />;
    }
  }

  if (column.ColumnName == 'LocationDescription') {
    columnObject['accessor'] = (row) => {
      if (row.Location) {
        return row.Location.LocationDisplay;
      } else {
        return row.LocationDescription;
      }
    }
    columnObject['Cell'] = ({ cell: { value } }) => <CellWide value={value} />;
  }

  if (column.ColumnName == 'LocationDisplay') {
    columnObject['Cell'] = ({ cell: { value } }) => <CellWide value={value} />;
  }

  return columnObject;
};

const validateEmailStringOut = (val) => (
  (val.indexOf('@') < val.lastIndexOf('.') && val.length > 4) && validateEmail(val) ? null : 'Please use a valid email'
)

const validateInputStringOut = ({
  lessThan,
  greaterThan,
  greaterThanOrEquals,
  lessThanOrEquals,
  between,
  equalsDigitCount,
  maxStringLength,
  dateFormat,
  timeFormat,
  maxDecimalPlaces,
  customErrorText,
  controlType,
  dateOnly,
  value,
  required
}) => {

  const { isValid, errors } = validateInputs([{
    lt: lessThan,
    gt: greaterThan,
    gte: greaterThanOrEquals,
    lte: lessThanOrEquals,
    btw: between,
    eq: equalsDigitCount,
    maxStringLength: maxStringLength,
    df: dateFormat,
    tf: timeFormat,
    mdp: maxDecimalPlaces,
    error: customErrorText,
    type: controlType,
    key: "_",
    dateOnly: dateOnly,
    value: value,
    required: required
  }]);

  return isValid ? null : errors["_"];
};

const validateInputsArrayOut = (validationItems) => {
  const { isValid, errors } = validateInputs(validationItems);
  return [isValid, errors];
};

// lt -> less than
// gt -> greater than
// gte -> greater than equal to
// lte -> less than equal to
// btw -> between
// eq -> equal
// maxStringLength -> maximum string length allowed
// df -> date format
// tf -> time format
// mdp -> maximum decimal places
const validateInputs = (validationItems) => {

  let allValid = true;
  let inputErrors = {};

  // let temp = [];
  // Object.keys(validationItems).map((key) => {
  //   allErrors[key] = errors[key];
  // });

  let validationItemsNotInGroups = validationItems.filter(x => isNullOrWhitespace(x.group));

  for (let i = 0; i < validationItemsNotInGroups.length; i++) {
    let fieldValid = true;
    let item = validationItemsNotInGroups[i];
    let customError = item.error;

    if (item.required) {
      let isNaNError = item.type === Enums.ControlType.Number && Number.isNaN(parseFloat(item.value));
      if (isNullOrWhitespace(item.value) || isNaNError) {
        inputErrors[item.key] = isNaNError ? (item.value === null || item.value === '' ? 'Cannot be empty' : `Not a number`) : customError ? customError : `Cannot be empty`;
        fieldValid = false;
        allValid = false;
      } else if (item.type === Enums.ControlType.Custom) {
        if (isEmptyObject(item.value) || isNullOrWhitespace(item.value)) {
          inputErrors[item.key] = customError ? customError : `Cannot be empty`;
          fieldValid = false;
          allValid = false;
        }
      } else if (item.type === Enums.ControlType.MultiSelect) {
        if (item.value.length == 0) {
          inputErrors[item.key] = customError ? customError : `Cannot be empty`;
          fieldValid = false;
          allValid = false;
        }
      } else if (item.type === Enums.ControlType.Select) {
        if (isEmptyObject(item.value) || isNullOrWhitespace(item.value)) {
          inputErrors[item.key] = customError ? customError : `Cannot be empty`;
          fieldValid = false;
          allValid = false;
        }
      }
    }

    if (fieldValid) {
      if (!isNullOrWhitespace(item.gt)) {
        let lt = item.value <= item.gt;
        if (item.type === Enums.ControlType.Date) {
          if (item.dateOnly === true) {
            lt = !Time.greaterThan(Time.getDate(item.value), Time.getDate(item.gt));
          } else {
            lt = !Time.greaterThan(item.value, item.gt);
          }
        }
        if (lt) {
          if (item.type === Enums.ControlType.Date) {
            if (!isNullOrWhitespace(item.df)) {
              inputErrors[item.key] = customError ? customError : `Must be greater than ${Time.getDateFormatted(item.gt, item.df)}`;
            } else if (!isNullOrWhitespace(item.tf)) {
              inputErrors[item.key] = customError ? customError : `Must be greater than ${Time.getTimeFormatted(item.gt, item.tf)}`;
            } else {
              inputErrors[item.key] = customError ? customError : `Must be greater than ${item.gt}`;
            }
          } else {
            inputErrors[item.key] = customError ? customError : `Must be greater than ${item.gt}`;
          }

          fieldValid = false;
          allValid = false;
        }
      }
    }

    if (fieldValid) {
      if (!isNullOrWhitespace(item.lt)) {
        let gt = item.value >= item.lt;
        if (item.type === Enums.ControlType.Date) {
          gt = !Time.lessThan(item.value, item.gt);
        }
        if (gt) {
          inputErrors[item.key] = customError ? customError : `Must be less than ${item.lt}`;
          fieldValid = false;
          allValid = false;
        }
      }
    }

    if (fieldValid) {
      if (!isNullOrWhitespace(item.gte)) {
        if (item.type === Enums.ControlType.Number && !isNullOrWhitespace(item.value)) {
          if (item.value < item.gte) {
            inputErrors[item.key] = customError ? customError : `Must be greater than or equal to ${item.gte}`;
            fieldValid = false;
            allValid = false;
          }
        } else if (item.type === Enums.ControlType.Date) {
          let value1 = item.value;
          let value2 = item.gte;
          if (!isNullOrWhitespace(item.dateOnly)) {
            value1 = Time.getDate(value1);
            value2 = Time.getDate(value2);
          }
          if (value1 < value2) {
            if (!isNullOrWhitespace(item.df)) {
              inputErrors[item.key] = customError ? customError : `Must be greater than or equal to ${Time.getDateFormatted(item.gte, item.df)}`;
              fieldValid = false;
              allValid = false;
            }
          }
        }
      }
    }

    if (fieldValid) {
      if (!isNullOrWhitespace(item.lte)) {
        if (item.type === Enums.ControlType.Number && !isNullOrWhitespace(item.value)) {
          if (item.value > item.lte) {
            inputErrors[item.key] = customError ? customError : `Must be less than or equal to ${item.lte}`;
            fieldValid = false;
            allValid = false;
          }
        }
      }
    }

    if (fieldValid) {
      if (!isNullOrWhitespace(item.btw)) {
        if (item.type === Enums.ControlType.Number && !isNullOrWhitespace(item.value)) {
          if (item.value < item.btw[0] || item.value > item.btw[1]) {
            inputErrors[item.key] = customError ? customError : `Must be between ${item.btw[0]} than ${item.btw[1]}`;
            fieldValid = false;
            allValid = false;
          }
        }
      }
    }

    if (fieldValid) {
      if (!isNullOrWhitespace(item.mdp)) {
        if (item.type === Enums.ControlType.Number && !isNullOrWhitespace(item.value)) {
          let decimals = countDecimals(item.value);
          if (decimals > item.mdp) {
            inputErrors[item.key] = customError ? customError : `Exceeded ${item.mdp} decimal points`;
            fieldValid = false;
            allValid = false;
          }
        }
      }
    }

    if (fieldValid) {
      // only used for password
      if (!isNullOrWhitespace(item.equalsPassword)) {
        if (item.value !== item.equalsPassword) {
          inputErrors[item.key] = customError ? customError : `Must match password`;
          fieldValid = false;
          allValid = false;
        }
      }
    }

    if (fieldValid) {
      // only used for password
      if (!isNullOrWhitespace(item.passwordLength)) {
        let len = parseInt(item.passwordLength);
        let pass = item.value.replace(/ /g, '');
        if (pass.length < len) {
          inputErrors[item.key] = customError ? customError : `Password length must be at least ${len}`;
          fieldValid = false;
          allValid = false;
        }
      }
    }

    if (fieldValid) {
      if (!isNullOrWhitespace(item.value) && item.type === Enums.ControlType.Email) {

        // validates single email (default)
        const reSingle = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        // validates multiple emails seperated by ',' or ';'  (set when item.multiEmail === true)
        const reMulti = /^((([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))[;,]?\s?)+$/g
        const re = item.multiEmail ? reMulti : reSingle;

        if (re.test(item.value) !== true) {
          inputErrors[item.key] = customError ? customError : `Email address must be valid`;
          fieldValid = false;
          allValid = false;
        } else if (item.rejectServCraft) {
          const userName = Storage.getCookie(Enums.Cookie.servUserName);
          const subInfo = Storage.getCookie(Enums.Cookie.subscriptionInfo);
          const isTestCustomer = subInfo?.CustomerStatus.toLowerCase() === "test";
          if (userName.toLowerCase() !== "admin" && !isTestCustomer) {
            if (item.value.indexOf("@servcraft") > -1
              || item.value.indexOf("@servecraft") > -1
              || item.value.indexOf("@servkraft") > -1
              || item.value.indexOf("@servekraft") > -1
              || item.value.indexOf("@srvcraft") > -1
              || item.value.indexOf("@srvcrft") > -1
              || item.value.indexOf("@surfcraft") > -1) {
              inputErrors[item.key] = `Email address domain is not permitted`;
              fieldValid = false;
              allValid = false;
            }
          }
        }
      }
    }

    if (fieldValid) {
      if (!isNullOrWhitespace(item.eq)) {
        if (!isNullOrWhitespace(item.value) && item.type === Enums.ControlType.Number) {

          let expression = `^[0-9]{${item.eq}}$`;
          let regEx = new RegExp(expression);

          if (regEx.test(item.value) != true) {
            inputErrors[item.key] = customError ? customError : `Number must be ${item.eq} digits`;
            fieldValid = false;
            allValid = false;
          }
        }
      }
    }

    if (fieldValid) {
      if (!isNullOrWhitespace(item.value) && item.type === Enums.ControlType.ContactNumber) {
        let minLength = 9;
        let maxLength = 14;
        if (item.value.length > maxLength || item.value.length < minLength) {
          inputErrors[item.key] = customError ? customError : `Number must be ${minLength} to ${maxLength} digits long`;
          fieldValid = false;
          allValid = false;
        }
      }
    }

    if (fieldValid) {
      if (!isNullOrWhitespace(item.maxStringLength)) {
        let len = parseInt(item.maxStringLength);
        let text = item.value.replace(/ /g, '');
        if (text.length > len) {
          inputErrors[item.key] = customError ? customError : `Cannot be greater than ${len} characters`;
          fieldValid = false;
          allValid = false;
        }
      }
    }
  }

  let validationItemsInGroups = validationItems.filter(x => !isNullOrWhitespace(x.group));
  let groups = groupBy(validationItemsInGroups, 'group');

  Object.keys(groups).forEach((key, index) => {
    let fieldValid = true;
    let group = groups[key];
    if (group) {

      let counter = 0;
      for (let i = 0; i < group.length; i++) {
        let item = group[i];
        if (isNullOrUndefined(item.value) || (!isNullOrUndefined(item.value) && item.value.length == 0)) {
          counter++;
        }
      }

      if (counter === group.length) {
        for (let i = 0; i < group.length; i++) {
          let item = group[i];
          let customError = item.error;
          inputErrors[item.key] = customError ? customError : `Email or Number required`;
          fieldValid = false;
          allValid = false;
        }
      }
    }
  });

  return {
    isValid: allValid,
    errors: inputErrors,
  };
}

const validateEmail = (email) => {
  if (isNullOrWhitespace(email)) {
    return false;
  }

  const re = /\S+@\S+\.\S+/;
  return re.test(email);
};

// const groupBy = function (xs, key) {
//   return xs.reduce(function (rv, x) {
//     (rv[x[key]] = rv[x[key]] || []).push(x);
//     return rv;
//   }, {});
// };

const copyFrom = (from, to) => {
  // copying base object as we don't want to overwrite the reference if not intended in its use case
  let toCopy = {};
  let toKeys = Object.keys(to);

  toKeys.map(function (val) {
    toCopy[val] = to[val];
  });

  let keys = Object.keys(from);
  keys.map(function (val) {
    toCopy[val] = from[val];
  });

  return toCopy;
};

function sortAscending(a, b) {
  return a >= b ? 1 : -1;
}

function sortDescending(a, b) {
  return b >= a ? 1 : -1;
}

function sortObjectArray(objectArray, sortProperty, descending = true) {
  return objectArray.sort((a, b) => {

    let aValue;
    let bValue;
    if (isNaN(a[sortProperty])) {
      aValue = a[sortProperty].toLowerCase();
      bValue = b[sortProperty].toLowerCase();
    } else {
      aValue = a[sortProperty];
      bValue = b[sortProperty];
    }

    if (descending) {
      if (aValue > bValue) {
        return 1;
      } else if (aValue < bValue) {
        return -1;
      }
    } else {
      if (bValue > aValue) {
        return 1;
      } else if (bValue < aValue) {
        return -1;
      }
    }

    return 0;
  });
}

function sortObjectArrayOnDate(objectArray, sortProperty, ascending = true) {
  return objectArray.sort((a, b) => {

    let aValue;
    let bValue;

    aValue = a[sortProperty];
    bValue = b[sortProperty];

    if (ascending) {

      if (bValue > aValue) {
        return 1;
      } else if (bValue < aValue) {
        return -1;
      }
    } else {
      if (aValue > bValue) {
        return 1;
      } else if (aValue < bValue) {
        return -1;
      }
    }

    return 0;
  });
}

function objectToQueryString(obj, encodeUri = false) {
  return Object.keys(obj).map(key => key + '=' + (encodeUri === true ? encodeURIComponent(obj[key]) : obj[key])).join('&');
}

function queryStringToObject(path) {
  let qsObj = {};

  // let intellisense pick up that qs is a string
  let qs = "";
  qs = path;
  qs = qs.substr(qs.indexOf("?") + 1);
  let qsSplit = qs.split("&");

  qsSplit.forEach(function (item) {
    let qsItemSplit = item.split("=");
    qsObj[qsItemSplit[0]] = qsItemSplit.length > 1 ? qsItemSplit[1] : null;
  });

  return qsObj;
}

const mapObject = (origObj) => {
  let newObj = {};
  Object.keys(origObj).map((parentKey) => {
    let val = origObj[parentKey];
    let isObject = val instanceof Object;
    let isArray = val instanceof Array;

    if (!isObject) {
      // flat field
      newObj[parentKey] = val;
    } else if (!isArray) {
      // field is object but not array
      newObj[parentKey] = { ...val };
    } else {
      // field is array of objects
      newObj[parentKey] = [...val];
    }

  });
  return newObj;
};

const getMaximumValueFromObjectArray = (objectArray, property) => {
  if (objectArray && objectArray.length > 0) {
    const reducer = (maximum, currentValue) => Math.max(maximum, currentValue);
    return objectArray.map(function (currentValue) {
      return currentValue[property];
    }).reduce(reducer, -Infinity);
  } else {
    return 0;
  }
};

const waitABit = async (timeout = 100) => {
  return new Promise(resolve => {
    setTimeout(function () {
      resolve();
    }, timeout);
  });
};

function preventRouteChangeGeneric(preventCheckFunc, allowNavFunc, heading, text, setConfirmOptions) {

  const router = useRouter();

  useEffect(() => {
    const routeChangeStart = (url) => {

      if (router.asPath !== url && preventCheckFunc()) {
        router.events.emit('routeChangeError');

        const navFunc = async () => {
          allowNavFunc();
          await waitABit();
          nextRouter(router.replace, url);
        };


        setConfirmOptions && setConfirmOptions({
          ...initialiseConfirmOptions(),
          display: true,
          heading: heading,
          text: text,
          confirmButtonText: "Navigate Away",
          cancelButtonText: "Cancel",
          onConfirm: async () => {
            await navFunc();
          }
        });

        // Following is a hack-ish solution to abort a Next.js route change
        // as there's currently no official API to do so
        // See https://github.com/zeit/next.js/issues/2476#issuecomment-573460710
        // eslint-disable-next-line no-throw-literal
        throw `Route change to "${url}" was aborted (this error can be safely ignored). See https://github.com/zeit/next.js/issues/2476.`;
      }
    };

    router.events.on('routeChangeStart', routeChangeStart);

    const beforeUnloadStart = function (event) {
      //if (!formIsDirty) return;
      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener("beforeunload", beforeUnloadStart);

    return () => {
      router.events.off('routeChangeStart', routeChangeStart);
      window.removeEventListener("beforeunload", beforeUnloadStart);
    };
  }, [router.asPath, router.events, preventCheckFunc]);
}

function preventRouteChange(formIsDirty, setFormIsDirty, setConfirmOptions, saveFunction, saveNavParam) {

  let subInfo = Storage.getCookie(Enums.Cookie.subscriptionInfo);
  if (subInfo && (subInfo.AccessStatus === Enums.AccessStatus.LockedWithAccess || subInfo.AccessStatus === Enums.AccessStatus.LockedWithOutAccess)) {
    return;
  }

  const router = useRouter();

  useEffect(() => {
    const routeChangeStart = (url) => {

      if (router.asPath !== url && formIsDirty && Storage.hasCookieValue(Enums.Cookie.token)) {
        router.events.emit('routeChangeError');

        const discardFunc = async () => {
          setFormIsDirty(false);
          await waitABit();
          nextRouter(router.replace, url);
        };

        let hasSave = !isNullOrUndefined(saveFunction);
        //hasSave = false; // uncomment to stop the bug with saving

        setConfirmOptions && setConfirmOptions({
          ...initialiseConfirmOptions(),
          display: true,
          heading: "Save Changes?",
          text: "Would you like to save your changes before leaving the screen?",
          confirmButtonText: hasSave ? "Save Changes" : "Discard Changes",
          discardButtonText: "Discard Changes",
          showCancel: true,
          showDiscard: hasSave,
          onDiscard: async () => {
            await discardFunc();
          },
          onConfirm: async () => {
            let saveSuccess = true;
            if (hasSave) {
              if (saveNavParam) {
                saveFunction(url)
              } else {
                saveSuccess = await saveFunction();
              }
            }
            if (saveSuccess && !saveNavParam) {
              await discardFunc();
            }
          }
        });

        // Following is a hack-ish solution to abort a Next.js route change
        // as there's currently no official API to do so
        // See https://github.com/zeit/next.js/issues/2476#issuecomment-573460710
        // eslint-disable-next-line no-throw-literal
        throw `Route change to "${url}" was aborted (this error can be safely ignored). See https://github.com/zeit/next.js/issues/2476.`;
      }
    };

    router.events.on('routeChangeStart', routeChangeStart);

    const beforeUnloadStart = function (event) {
      if (!formIsDirty) return;
      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener("beforeunload", beforeUnloadStart);

    return () => {
      router.events.off('routeChangeStart', routeChangeStart);
      window.removeEventListener("beforeunload", beforeUnloadStart);
    };
  }, [router.asPath, router.events, formIsDirty, saveFunction]);
}

const initialiseConfirmOptions = () => {
  return {
    display: false,
    heading: "",
    text: "",
    onConfirm: () => { },
    onCancel: () => { },
    onDiscard: () => { },
    confirmButtonText: "OK",
    cancelButtonText: "Cancel",
    discardButtonText: "Discard",
    showCancel: true,
    showDiscard: false,
    isPrompt: false,
    promptDefault: ""
  };
}

const splitWords = (key) => {
  key = key ? key.toString() : "";
  let letters = [...key];
  let split = [""];
  letters.map(l => {
    if (l !== l.toLowerCase()) {
      split.push("")
    }
    split[split.length - 1] += l;
  });
  let sentence = "";
  for (let i = 0; i < split.length; i++) {
    let word = split[i];
    if (i === 0 || (word.length === 1 && split[i - 1].length === 1)) {
      sentence += word;
    } else {
      sentence += ` ${word}`;
    }
  }
  return sentence.trim();
};

const getFingerPrint = async () => {
  return new Promise(resolve => {
    Fingerprint2.get(function (components) {
      let concat = "";
      components.map(comp => {
        let val = comp.value !== undefined && comp.value !== null ? comp.value.toString() : "";
        switch (comp.key) {
          case "userAgent":
            concat += val;
            break;
          case "language":
            concat += val;
            break;
          case "colorDepth":
            concat += val;
            break;
          case "deviceMemory":
            concat += val;
            break;
          case "pixelRatio":
            concat += val;
            break;
          case "screenResolution":
            concat += val;
            break;
          case "availableScreenResolution":
            concat += val;
            break;
          case "timezoneOffset":
            concat += val;
            break;
          case "timezone":
            concat += val;
            break;
          case "sessionStorage":
            concat += val;
            break;
          case "localStorage":
            concat += val;
            break;
          case "indexedDb":
            concat += val;
            break;
          case "addBehavior":
            concat += val;
            break;
          case "openDatabase":
            concat += val;
            break;
          case "cpuClass":
            concat += val;
            break;
          case "platform":
            concat += val;
            break;
          case "doNotTrack":
            concat += val;
            break;
          case "webglVendorAndRenderer":
            concat += val;
            break;
          case "hasLiedLanguages":
            concat += val;
            break;
          case "hasLiedResolution":
            concat += val;
            break;
          case "hasLiedOs":
            concat += val;
            break;
          case "hasLiedBrowser":
            concat += val;
            break;
          case "touchSupport":
            concat += val;
            break;
          case "fonts":
            concat += val;
            break;
          case "audio":
            concat += val;
            break;
        }
      });

      let hash = md5(concat);
      resolve(hash);
    });
  });
};

const hasAdblock = async () => {
  return new Promise(resolve => {
    let script = document.createElement('script');
    script.onload = function () {
      document.head.removeChild(script);
      resolve(false);
    };
    script.onerror = function () {
      document.head.removeChild(script);
      resolve(true);
    };
    script.src = getApiHost().toLowerCase().replace('/api', '/Scripts/dfp.js'); //"https://devapi.servcraft.co.za/scripts/dfp.js";
    document.head.appendChild(script);
  });
};

// #region Mixpanel

const getMixpanelToken = () => {
  let liveHosts = ["app.servcraft.co.za", "app01.servcraft.co.za", "app02.servcraft.co.za"]
  let isLive = liveHosts.includes(window.location.hostname);
  let isLocalhost = window.location.hostname === "localhost";
  return isLive ? Constants.mixpanelSettings.mixPanelToken : !isLocalhost ? Constants.mixpanelSettings.mixPanelTokenDev : null;
};

const mixpanelInit = () => {
  let token = getMixpanelToken();
  if (!token) return;
  mixpanel.init(token, { cross_site_cookie: true, secure_cookie: true });
}

const mixpanelTrack = (eventName, properties = null) => {

  if (!getMixpanelToken()) return;

  if (Constants.mixpanelSettings.ignoreAll) return;
  if (!Constants.mixpanelSettings.permitAll) {
    if (Constants.mixpanelSettings.ignoreEvents.includes(eventName) || !Constants.mixpanelSettings.permitEvents.includes(eventName)) {
      return;
    }
  }

  mixpanelInit();
  properties = properties ? properties : {};
  properties.distinct_id = Storage.getCookie(Enums.Cookie.userID);
  let subscriptionInfo = Storage.getCookie(Enums.Cookie.subscriptionInfo);
  let accessStatus = subscriptionInfo && !isNaN(parseInt(subscriptionInfo.AccessStatus)) ? Enums.AccessStatus[subscriptionInfo.AccessStatus] : null;
  let customerStatus = subscriptionInfo ? subscriptionInfo.CustomerStatus : null;
  properties.accessStatus = accessStatus;
  properties.customerStatus = customerStatus;
  mixpanel.track(eventName, properties);
};

const mixpanelIdentify = (userID) => {

  if (!getMixpanelToken()) return;

  mixpanel.identify(userID);
}

const mixpanelPeopleSet = (props) => {

  if (!getMixpanelToken()) return;

  mixpanel.people?.set(props);
  if (!mixpanel.people) {
    console.error('mixpanel people not set')
  }
}

// #endregion Mixpanel

/**
 * this filters the parameter by converting guid to [id] placeholder
 * @param {*} param parameter to filter
 */
const filterMixpanelParameter = (param) => {
  if (!param) {
    return null;
  }

  let paramToReturn = param;

  // remove query string
  let idx = paramToReturn.indexOf("?");
  if (idx > -1) {
    paramToReturn = paramToReturn.substr(0, idx);
  }

  // /job/AF7349D0-E93C-11EB-A2D4-2962AD3B5833
  let paramItems = paramToReturn.split("/");

  // ['job', 'AF7349D0-E93C-11EB-A2D4-2962AD3B5833']

  for (let i = 0; i < paramItems.length; i++) {
    // crude parsing of guid
    if (paramItems[i].length === 36 && paramItems[i][8] === "-") {
      paramItems[i] = "[id]";
    }
  }

  // /job/[id]
  paramToReturn = paramItems.join("/");

  // window.location.hostname === "app.servcraft.co.za"

  return paramToReturn;
};

const semverGreaterThan = (versionA, versionB) => {
  const versionsA = versionA.split(/\./g);

  const versionsB = versionB.split(/\./g);
  while (versionsA.length || versionsB.length) {
    const a = Number(versionsA.shift());

    const b = Number(versionsB.shift());
    // eslint-disable-next-line no-continue
    if (a === b) continue;
    // eslint-disable-next-line no-restricted-globals
    return a > b || isNaN(b);
  }
  return false;
};

const reloadBrowser = async () => {
  let lastRefresh = window.localStorage.lastRefresh;
  if (!lastRefresh || new Date().valueOf() > parseInt(lastRefresh) + Constants.reloadVersionDebouncePeriodMS) {
    if (caches) {
      // Service worker cache should be cleared with caches.delete()
      let names = await caches.keys();
      for (let name of names) await caches.delete(name);
    }
    // delete browser cache and hard reload
    console.log("Reloading browser");
    window.location.lastRefresh = new Date().valueOf().toString();
    window.location.reload();
  } else {
    console.log("Waiting for cooldown to reload browser");
  }
};

const checkVersionChange = async () => {
  return new Promise(async resolve => {
    let response = await fetch('/meta.json');
    let meta = await response.json();
    const version = meta.version;
    const isOutOfVersion = version !== Constants.appVersion(); //semverGreaterThan(version, Constants.appVersion());
    if (isOutOfVersion) {
      resolve(true);
    } else {
      resolve(false);
    }
  });
};


const nextRouter = (method, param1, parameter2, shallowRouting = false) => {

  /*Redirect route to pre-release route if whitelisted*/
  /*const pRRoutes = []
  const tenantId = Storage.getCookie(Enums.Cookie.tenantID);*/
  let parameter1 = param1
  /*pRRoutes.forEach(
      r => {
        if(param1.includes(r) && !param1.includes('pre-release') && Constants.whiteListedNewFeatureTenants.includes(tenantId)) {
         console.log('replacing')
          parameter1 = param1.replace(r, 'pre-release/' + r)
        }
      }
  )*/

  refreshSubscription();
  if (method) {
    if (parameter1 && parameter2) {
      method(parameter1, parameter2, { shallow: shallowRouting });
    } else {
      method(parameter1);
    }
    let userName = Storage.getCookie(Enums.Cookie.servUserName);
    userName = userName ? userName : "";

    if (userName.toLowerCase() !== "admin") {
      mixpanelTrack(`navigate`, {
        parameter1: parameter1 ? parameter1 : "",
        parameter2: parameter2 ? parameter2 : "",
        filteredParameter1: filterMixpanelParameter(parameter1),
        filteredCurrentURL: filterMixpanelParameter(window.location.href)
      });
    }
  }
  checkVersionChange().then(refresh => {
    if (refresh) {
      setTimeout(() => {
        reloadBrowser();
      }, 3000);
    }
  });
};

const getLinkRedirect = (path) => {
  /*Redirect route to pre-release route if whitelisted*/
  return path
  /*const pRRoutes = []
  const tenantId = Storage.getCookie(Enums.Cookie.tenantID);
  const replaceRoute = Constants.whiteListedNewFeatureTenants.includes(tenantId) &&
      pRRoutes.find(x => path.includes(x) && !path.includes('pre-release'))
  if(replaceRoute) {
    return path.replace(replaceRoute, 'pre-release/' + replaceRoute)
  } else {
    return path
  }*/
}

const nextLinkClicked = (href) => {
  refreshSubscription();
  let userName = Storage.getCookie(Enums.Cookie.servUserName);
  userName = userName ? userName : "";
  if (userName.toLowerCase() !== "admin") {
    mixpanelTrack(Constants.mixPanelEvents.navigate, {
      parameter1: href,
      filteredParameter1: filterMixpanelParameter(href),
      filteredCurrentURL: filterMixpanelParameter(window.location.href)
    });
  }
  checkVersionChange().then(refresh => {
    if (refresh) {
      setTimeout(() => {
        reloadBrowser();
      }, 3000);
    }
  });
};

const getHasNewFeatureAccess = (feature = null) => {
  const tenantId = Storage.getCookie(Enums.Cookie.tenantID)
  if (feature === 'jobLabelPrinting') {
    return [
      ...Constants.devTenants,
      '2e97763b-843c-49a8-9e04-2e6cce267777',
      'b2a54a94-1e12-4261-96e9-a462794711a2',
      '07963aac-138a-4508-bac3-11e1a0886e77',
      '922b1ffd-15ea-49c2-b905-0715e75174b7', // vending solutions
      '869826c7-a82a-43f3-815c-2233fbc03c5f', // jx3
      '22a93b9a-5ceb-4678-93dc-de7529a944cf', // Thermologix
    ].includes(tenantId)
  } else {
    return Constants.whiteListedNewFeatureTenants.includes(tenantId)
  }
}


const refreshSubscription = async () => {
  await BillingService.getSubcriptionInfo(null, false);
};

const emptyGuid = () => {
  return "00000000-0000-0000-0000-000000000000";
};

const deserializeCustomCSV = (val) => {

  if (typeof val !== "string" && typeof val !== "object") {
    return val;
  }

  if (isNullOrWhitespace(val)) {
    return [];
  } else {
    return val.substr(1, val.length - 2).split("][");
  }
};

const serializeCustomCSV = (vals) => {
  if (vals.length > 0) {
    return `[${vals.join("][")}]`;
  } else {
    return "";
  }
}

const jsonCompare = (a, b) => {
  return JSON.stringify(a) != JSON.stringify(b);
}


const getClarityID = () => {
  return window && window.location.hostname === "app.servcraft.co.za" ? Constants.clarityID : Constants.clarityIDDev;
};

const openUrlInNewTab = (url) => {
  window.open(url, "target=_blank");
};

const groupBy = (array, key, trimKey = false) => {
  return array.reduce((group, item) => {
    let keyItem = item[key];
    if (trimKey === true) {
      keyItem = (keyItem ?? "").trim();
    }
    group[keyItem] = group[keyItem] ?? [];
    group[keyItem].push(item);
    return group;
  }, {});
};

const truncateText = (text, length, appendEllipses = true) => {
  let textToTruncate = text ? text : "";
  if (textToTruncate.length > length) {
    textToTruncate = appendEllipses && length > 3 ? textToTruncate.substring(0, length - 3) + "..." : textToTruncate.substring(0, length);
  }
  return textToTruncate;
};




const isSafari = () => {
  if (typeof window !== "undefined" && window.navigator && window.navigator.userAgent) {
    const agent = window.navigator.userAgent.toLowerCase();
    if (agent.includes("safari/") && !agent.includes("chrome/") && !agent.includes("chromium/")) {
      return true;
    }
  }
  return false;
};

const formResetDirty = (form) => {
  let resetObj = {};
  Object.keys(form.values).forEach(key => {
    resetObj[key] = false;
  });
  form.setDirty(resetObj);
}

const formSetFieldValue = (form, key, value) => {
  form.setFieldValue(key, value);
  form.setDirty({ [key]: true });
};

function copyToClipboard(itemToCopy) {
  navigator.clipboard.writeText(itemToCopy);
};

const isInventoryWarehoused = (inventory) => {
  // sensitive logic - don't modify
  // debugger
  return !!inventory && (inventory.StockItemType !== Enums.StockItemType.Service || inventory.IsQuantityTracked);
}

const clone = (item) => {
  return item === null ? null : item === undefined ? undefined : JSON.parse(JSON.stringify(item));
}

const formatDuration = (diffSeconds) => {
  let hours = Math.floor(diffSeconds / 3600);
  diffSeconds -= hours * 3600;
  let minutes = Math.floor(diffSeconds / 60) % 60;
  diffSeconds -= minutes * 60;
  let seconds = Math.ceil(diffSeconds % 60);

  if (seconds == 60) {
    minutes += 1;
    seconds = 0;
  }

  let days = Math.floor(hours / 24);
  hours = hours % 24;

  return (days < 10 ? "0" + days : days) + "d " + (hours < 10 ? '0' + hours : hours) + ':' + (minutes < 10 ? '0' + minutes : minutes) + ':' + (seconds < 10 ? '0' + seconds : seconds);
}

const parseJwtPayload = (token) => {
  var base64Url = token.split('.')[1];
  var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));

  return JSON.parse(jsonPayload);
}

// Password strength helpers
// Split keyword detection so it can be reused by UI components
// Returns an array of matched sensitive/personal keywords (lowercased)
const extractPersonalTokens = (userwords) => {
  const arr = Array.isArray(userwords) ? userwords : [];
  const out = new Set();
  for (const item of arr) {
    if (!item) continue;
    const raw = item.toString().toLowerCase();
    // Add concatenated alphanum version (e.g., 'john.smith' -> 'johnsmith')
    const concat = raw.replace(/[^a-z0-9]+/gi, '');
    if (concat && concat.length >= 4) out.add(concat);
    // Add split tokens length >= 4
    for (const t of raw.split(/[^a-z0-9]+/gi)) {
      if (t && t.length >= 4) out.add(t);
    }
  }
  return Array.from(out);
};

const getPasswordSensitiveKeywordHits = (password, options = {}) => {
  try {
    const pwd = (password || '').toString().toLowerCase();
    if (!pwd) return [];
    const opts = options || {};

    // Company/brand sensitive words (contiguous only)
    const sensitive = ['servcraft'];

    // Personal/user tokens (>= 4 chars)
    const personal = extractPersonalTokens(opts.userwords);

    const tokens = new Set([...sensitive, ...personal]);
    const hits = [];
    for (const token of tokens) {
      if (token && token.length >= 4 && pwd.includes(token)) hits.push(token);
    }
    return hits;
  } catch {
    return [];
  }
};

// Common keyboard patterns (full patterns only)
const passwordHasKeyboardPattern = (password) => {
    const commonPatterns = [
        'qwerty', 'asdfgh', 'zxcvbn', 'qazwsx',
        '1qaz', '2wsx', '3edc', '4rfv',
        'qwertz', 'azerty'
    ];
    const s = (password || '').toString().toLowerCase();
    return commonPatterns.some(pattern => s.includes(pattern));
};

// Detect 3+ sequential ascending or descending runs in letters or digits
const passwordHasSequentialRun = (password) => {
  const s = (password || '').toString();
  if (!s) return false;
  const isLower = (c) => c >= 'a' && c <= 'z';
  const isUpper = (c) => c >= 'A' && c <= 'Z';
  const isDigit = (c) => c >= '0' && c <= '9';
  const code = (c) => c.charCodeAt(0);
  for (let i = 0; i < s.length - 2; i++) {
    const a = s[i], b = s[i + 1], c = s[i + 2];
    const allLower = isLower(a) && isLower(b) && isLower(c);
    const allUpper = isUpper(a) && isUpper(b) && isUpper(c);
    const allDigit = isDigit(a) && isDigit(b) && isDigit(c);
    if (allLower || allUpper) {
      const asc = code(b) - code(a) === 1 && code(c) - code(b) === 1;
      const desc = code(a) - code(b) === 1 && code(b) - code(c) === 1;
      if (asc || desc) return true;
    } else if (allDigit) {
          const asc = code(b) - code(a) === 1 && code(c) - code(b) === 1;
      const desc = code(a) - code(b) === 1 && code(b) - code(c) === 1;
      if (asc || desc) return true;
    }
  }
  return false;
};

// 4+ identical consecutive characters are not allowed
const passwordHasTooManyConsecutiveIdentical = (password) => {
  return /(.)\1{3,}/.test((password || '').toString());
};


// Very common exact weak passwords (case-insensitive, exact match)
const isExactWeakPassword = (password) => {
  const s = (password || '').toString().toLowerCase();
    const weak = new Set([
        'password1234', 'password12345', 'password123456', 'welcome12345', 'administrator1', 'letmein1234',
        'qwerty12345', 'test123456', 'welcome12345', 'password123!',
        'monkey12345', 'dragon12345', 'baseball123', 'football123',
        'login12345', 'princess123', 'admin123456', 'adminadmin1',
        'rugby123456', 'rugby202324', 'rugby202425', 'rugbyworld1',
        'sharks12345', 'sharks20232', 'sharks20245', 'sharksrugby1',
        'lions12345', 'lions202324', 'lions202425', 'lionsrugby1',
        'bulls12345', 'bulls202324', 'bulls202425', 'bullsrugby1',
        'springboks1', 'springbok24', 'springboks24', 'springboks2024', 'springboks25', 'bokrugby123',
        'stormers123', 'cheetahs123', 'servcraft123', 'Password123'
    ]);
    return weak.has(s);
};

// Returns a human-friendly error string if weak, or null if strong enough.
const getPasswordStrengthError = (password, options = {}) => {
  try {
    const pwd = (password || '').toString();
    const opts = options || {};

    if(!opts.skipBaseChecks) {
        if (!pwd) return 'Cannot be empty';

        // Basic composition rules
        if (pwd.length < 10) return 'Use at least 10 characters';
        if (/\s/.test(pwd)) return 'No spaces allowed';

        const hasUpper = /[A-Z]/.test(pwd);
        const hasLower = /[a-z]/.test(pwd);
        const hasNumber = /\d/.test(pwd);

        if (!(hasUpper && hasLower && hasNumber)) {
            return 'Use uppercase, lowercase and a number';
        }
    }

      if (pwd.length > 100) return 'Please use a password of 100 characters or less';

    // Disallow exact very common passwords
    if (isExactWeakPassword(pwd)) return 'Password is too common';

    if (pwd.toLowerCase().includes('password')) return 'Password is too common';

      // Disallow keyboard patterns
    if (passwordHasKeyboardPattern(pwd)) return 'Avoid keyboard patterns like qwerty/asdfgh';

    // Disallow 3+ sequential ascending/descending
    if (passwordHasSequentialRun(pwd)) return 'Avoid sequential characters (e.g., 123, abc, cba)';

    // Disallow 4+ identical consecutive characters
    if (passwordHasTooManyConsecutiveIdentical(pwd)) return 'Avoid more than 3 identical characters in a row';

    // Disallow sensitive/personal keywords (>= 4 chars)
    const hits = getPasswordSensitiveKeywordHits(pwd, { userwords: opts.userwords });
    if (hits.length > 0) return 'Avoid personal or sensitive keywords';

    return null;
  } catch (e) {
    // Be permissive on unexpected cases
    return 'Invalid password';
  }
};

// Structured result wrapper
const validatePasswordStrength = (password, options) => {
  const error = getPasswordStrengthError(password, options);
  return { ok: !error, error };
};


export default {
  isFunction,
  isEmptyObject,
  isNullOrUndefined,
  isImage,
  getCurrencyValue,
  roundToTwo,
  convertToDecimalValue,
  convertToUnsignedValue,
  countDecimals,
  getInitials,
  getSortDirection,
  getColumnObject,
  validateInputs,
  validateEmail,
  copyFrom,
  sortAscending,
  sortDescending,
  sortObjectArray,
  sortObjectArrayOnDate,
  hexToRgba,
  objectToQueryString,
  queryStringToObject,
  isNullOrWhitespace,
  mapObject,
  getMaximumValueFromObjectArray,
  preventRouteChange,
  initialiseConfirmOptions,
  waitABit,
  splitWords,
  getFingerPrint,
  hasAdblock,
  newGuid,
  mixpanelTrack,
  nextRouter,
  nextLinkClicked,
  getLinkRedirect,
  emptyGuid,
  deserializeCustomCSV,
  serializeCustomCSV,
  stringToBool,
  validateInputsArrayOut,
  mixpanelInit,
  mixpanelIdentify,
  mixpanelPeopleSet,
  jsonCompare,
  groupBy,
  getClarityID,
  openUrlInNewTab,
  preventRouteChangeGeneric,
  truncateText,
  isSafari,
  parseBool,
  parseString,
  validateInputStringOut,
  validateEmailStringOut,
  formResetDirty,
  formSetFieldValue,
  getHasNewFeatureAccess,
  copyToClipboard,
  isInventoryWarehoused,
  clone,
  formatDuration,
  parseJwtPayload,
  getPasswordSensitiveKeywordHits,
  getPasswordStrengthError,
  validatePasswordStrength
};

