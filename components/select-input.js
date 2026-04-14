import React, { useState, useRef, useEffect } from 'react';
import { colors, fontSizes, layout, fontFamily, tickSvg } from '../theme';
import TextInput from './text-input';
import { useOutsideClick, useWindowEventListener, useVisibilitySensor } from "rooks";
import Helper from '../utils/helper';

function SelectInput(props) {

  const [inputFocus, setInputFocus] = useState(false);
  const disabled = props.disabled !== undefined && props.disabled !== null ? props.disabled === true : false;

  const dropdownDirection = props.dropdownDirection ? props.dropdownDirection : 'down';

  useEffect(() => {
    if (props.inputFocus) {
      setInputFocus(true);
    }
  }, [props.inputFocus]);

  //IF INPUT IS FOCUSED AND NO RESULTS, DO INITIAL SEARCH
  useEffect(() => {
    if (inputFocus && props.searchFunc && props.options && props.options.length == 0 && !disabled) {
      props.searchFunc();
    }
  }, [inputFocus]);

  useEffect(() => {
    if (props.autoSearch && props.searchFunc && !disabled) {
      props.searchFunc();
    }
  }, []);
  
  const ref = useRef();

  const [itemIsSelected, setItemIsSelected] = useState(true);
  const [clear, setClear] = useState(false);

  useOutsideClick(ref, () => {
    if (inputFocus) {
      setInputFocus(false);
    }
    if (!props.multiSelect) {      
      if (!itemIsSelected) {
        selectOption("", null);
        setClear(true);
      }
    }
  });

  useEffect(() => {
    if (clear) {
      if (Helper.isFunction(props.searchFunc)) {
        props.searchFunc();
        setClear(false);
      }
    }
  }, [clear]);

  const inputChange = (e) => {
    if (props.changeHandler) {
      props.changeHandler({ target: { value: e.target.value, name: props.name } });
      setItemIsSelected(false);
    }
  };

  const timerRef = useRef(null);

  const handleKeyDown = (e) => {
    if (props.useKeyUp === true) return;
    if (Helper.isFunction(props.searchFunc)) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      if (e.key === 'Enter') {
        props.searchFunc();
      } else {
        timerRef.current = setTimeout(() => { props.searchFunc() }, 300);
      }
    }
  };

  const handleKeyUp = (e) => {
    //if (props.useKeyUp !== true) return;
    let val = e && e.target ? e.target.value : "";
    if (Helper.isFunction(props.searchFunc)) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      if (e.key === 'Enter') {
        props.searchFunc(val);
      } else {
        timerRef.current = setTimeout(() => { props.searchFunc(val) }, 300);
      }
    }
  };

  const handleClick = (e) => {
    if (Helper.isFunction(props.clickHandler)) {
      props.clickHandler();
    }

    if (props.noInput) {
      setInputFocus(!inputFocus);
    }
  };

  const textInputSetInputFocus = () => {
    if (!props.noInput) {
      setInputFocus(!inputFocus);
    }
  };

  function getInitials(name) {
    const names = name.split(' ');
    if (names.length > 1) {
      return names[0][0] + names[1][0];
    }
    return name[0];
  }

  const getCustomerContact = (option) => {
    let contact = option.PrimaryContact;
    let mobile = option.MobileNumber;

    if (mobile) {
      return contact + ': ' + mobile;
    } else {
      return contact;
    }
  };

  function selectOption(selected, selectedValue) {
    if (props.changeHandler) {
      props.changeHandler({ target: { value: selected, name: props.name } });
    }
    props.setSelected(selectedValue);
    if (!props.multiSelect) {
      setInputFocus(false);
      setItemIsSelected(true);
    }    
  }

  const clearButtonClicked = () => {
    selectOption("", null);
  }

  return (
    <div className={`container ${props.noInput ? "no-caret" : ""} ${props.extraClasses}`} ref={ref}>
      <TextInput
        name={props.name}
        extraClasses={props.extraClasses}
        error={props.error}
        clickHandler={handleClick}
        changeHandler={props.noInput === true ? null : inputChange}
        handleKeyDown={props.noInput === true ? null : handleKeyDown}
        handleKeyUp={props.noInput === true ? null : handleKeyUp}
        blurHandler={props.blurHandler}
        label={props.label}
        placeholder={props.placeholder}
        required={props.required === true}
        setInputFocus={textInputSetInputFocus}
        autoFocus={props.autoFocus}
        type="text"
        value={props.value}
        readOnly={props.noInput === true || disabled}
        tabIndex={props.tabIndex}
        autoComplete={props.autoComplete}
        cypress={props.cypress}
        showClearButton={props.showClearButton}
        clearButtonClicked={() => !disabled && clearButtonClicked()}
      />
      <div className={`results ${inputFocus && !disabled ? '' : 'hidden'} ${props.totalOptions ? 'margin-top' : ''} ${dropdownDirection == 'up' ? 'options-up' : 'options-down'}`}>
        <div className={`loader ${props.searching ? 'show-loader' : ''}`}></div>
        {props.options && props.options.map(function (option, index) {
          if (props.type == "customer") {
            return (
              <div className="result" key={index} onClick={() => selectOption(option.CustomerName, option)}>
                <div className="initial">{getInitials(option.CustomerName)}</div>
                <div>
                  <h3>{option.CustomerName} - {option.CustomerCode}</h3>
                  <p>{option.IsCompany ? "Company" : "Individual"}</p>
                  <p>{getCustomerContact(option)}</p>
                </div>
              </div>
            )
          } else if (props.type == 'location') {
            return (
              <div className="result" key={index} onClick={() => selectOption(option.LocationDisplay, option)}>
                <div>
                  <h3>{option.IsPrimary ? `${option.Description} (Primary)` : `${option.Description}`}</h3>
                  <p>{option.AddressLine1}</p>
                </div>
              </div>
            )
          } else if (props.type == "contact") {
            const fullName = `${option.FirstName} ${option.LastName}`;
            return (
              <div className="result" key={index} onClick={() => selectOption(fullName, option)}>
                <div className="initial">{option.FirstName[0] + (option.LastName ? option.LastName[0] : "")}</div>
                <div>
                  <h3>{fullName}</h3>
                  <p>{option.EmailAddress}</p>
                  <p>{option.MobileNumber}</p>
                </div>
              </div>
            )
          } else if (props.type == "service") {
            return (
              <div className="result" key={index} onClick={() => selectOption(option.Description, option.ID)}>
                <div>
                  <h3>{option.Description}</h3>
                  <p>{option.Code}</p>
                </div>
              </div>
            )
          } else if (props.type == "job-type" && !props.multiSelect) {
            return (
              <div className="result result-job-type" key={index} onClick={() => selectOption(option.Name, option.ID)}>
                <div>
                  <p>{option.Name}</p>
                </div>
              </div>
            )
          } else if (props.type == "job-type" && props.multiSelect) {

            const optionSelected = (props.selectedOptions ? props.selectedOptions.filter(function (e) { return e.ID === option.ID; }).length > 0 : false);
            return (
              <div className="result space-between" key={index} onClick={() => selectOption(option.Name, option)}>
                <div className="row">
                  <div>
                    <p>{option.Name}</p>
                  </div>
                </div>
                <div className={optionSelected ? "box box-checked" : "box"}></div>
              </div>
            )
          } else if (props.type == "store" && props.multiSelect !== true) {
            return (
              <div className="result" key={index} onClick={() => selectOption(option.Name, option)}>
                <div>
                  <h3>{option.Name}</h3>
                  <p>{option.AddressLine1}</p>
                </div>
              </div>
            )
          } else if (props.type == "store" && props.multiSelect === true) {
            const optionSelected = (props.selectedOptions ? props.selectedOptions.filter(function (e) { return e.ID === option.ID; }).length > 0 : false);
            return (
              <div className="result space-between" key={index} onClick={() => selectOption(option.Name, option)}>
                <div className="row">
                  <div>
                    <p>{option.Name}</p>
                    <p>{option.AddressLine1}</p>
                  </div>
                </div>
                <div className={optionSelected ? "box box-checked" : "box"}></div>
              </div>
            )
          } else if (props.type == "customer-group" || props.type == "customer-type" || props.type == "industry-type"
            || props.type == "media-type" || props.type == "customer-status" || props.type == 'inventory-category'
            || props.type == "inventory-subcategory" || props.type == "query-type" || props.type == "query-status"
            || props.type == "status" || props.type == "countries" || props.type == "option-description"
            || props.type == "id-description") {
            return (
              <div className="result" key={index} onClick={() => selectOption(option.Description, option)}>
                <div>
                  <p>{option.Description}</p>
                </div>
              </div>
            )
          } else if (props.type == "id-heading") {
            return (
              <div className="result" key={index} onClick={() => selectOption(option.Heading, option)}>
                <div>
                  <p>{option.Heading}</p>
                </div>
              </div>
            )
          } else if (props.type == "supplier") {
            return (
              <div className="result" key={index} onClick={() => selectOption(option.Name, option)}>
                <div>
                  <p>{option.Name}</p>
                </div>
              </div>
            )
          } else if (props.type == "reason") {
            return (
              <div className="result" key={index} onClick={() => selectOption(option.Name, option)}>
                <div>
                  <p>{option.Name}</p>
                </div>
              </div>
            )
          } else if (props.type == "status-color") {
            return (
              <div className="result" key={index} onClick={() => selectOption(option.Description, option)}>
                {option.DisplayColor ?
                  <>
                    <div style={{ background: option.DisplayColor, opacity: 0.3, position: 'relative', padding: 0, minWidth: 16, minHeight: 16, borderRadius: '50%', marginRight: 8 }}>
                      <div style={{ background: option.DisplayColor, position: 'absolute', padding: 0, width: 8, height: 8, left: 4, top: 4, borderRadius: '50%' }}></div>
                    </div>
                  </>
                  :
                  <>
                    <div style={{ background: `${colors.white}`, opacity: 0.3, position: 'relative', padding: 0, minWidth: 16, minHeight: 16, borderRadius: '50%', marginRight: 8 }}>
                      <div style={{ background: `${colors.white}`, position: 'absolute', padding: 0, width: 8, height: 8, left: 4, top: 4, borderRadius: '50%' }}></div>
                    </div>
                  </>
                }
                {option.Description}
              </div>
            )
          }
          else if (props.type == "Key-Value") {
            return (
              <div className="result" key={index} onClick={() => selectOption(option.Value, option)}>
                <div>
                  <p>{option.Value}</p>
                </div>
              </div>
            )
          } else if (props.type == "employee" && props.multiSelect) {
            const fullName = option.FirstName + " " + option.LastName;
            let displayColorStyle = option.DisplayColor && option.DisplayColor.startsWith("#") ? option.DisplayColor : "";
            let displayColorClass = option.DisplayColor && !displayColorStyle ? option.DisplayColor + "Local" : "";
            const optionSelected = (props.selectedOptions ? props.selectedOptions.filter(function (e) { return e.ID === option.ID; }).length > 0 : false);

            return (
              <div className="result space-between" key={index} onClick={() => selectOption(fullName, option)}>
                <div className="row">
                  <div className={`initial ${displayColorClass ? displayColorClass : ''}`} style={{backgroundColor: `${displayColorStyle}`}}>
                    {option.FirstName[0] + option.LastName[0]}
                  </div>
                  <div>
                    <h3>{fullName}</h3>
                    <p>{option.EmailAddress}</p>
                  </div>
                </div>
                <div className={optionSelected ? "box box-checked" : "box"}></div>
              </div>
            )
          } else if (props.type == "employee-simple" && props.multiSelect) {
            const fullName = option.FirstName + " " + option.LastName;
            let displayColorStyle = option.DisplayColor && option.DisplayColor.startsWith("#") ? option.DisplayColor : "";
            let displayColorClass = option.DisplayColor && !displayColorStyle ? option.DisplayColor + "Local" : "";
            const optionSelected = (props.selectedOptions ? props.selectedOptions.filter(function (e) { return e === option.ID; }).length > 0 : false);

            return (
              <div className="result space-between" key={index} onClick={() => selectOption(fullName, option)}>
                <div className="row">
                  <div className={`initial ${displayColorClass ? displayColorClass : ''}`} style={{backgroundColor: `${displayColorStyle}`}}>
                    {option.FirstName[0] + option.LastName[0]}
                  </div>
                  <div>
                    <h3>{fullName}</h3>
                    <p>{option.EmailAddress}</p>
                  </div>
                </div>
                <div className={optionSelected ? "box box-checked" : "box"}></div>
              </div>
            )
          } else if (props.type == "employee" && !props.multiSelect) {
            const fullName = option.FirstName + " " + option.LastName;
            let displayColorStyle = option.DisplayColor && option.DisplayColor.startsWith("#") ? option.DisplayColor : "";
            let displayColorClass = option.DisplayColor && !displayColorStyle ? option.DisplayColor + "Local" : "";

            return (
              <div className="result space-between" key={index} onClick={() => selectOption(fullName, option)}>
                <div className="row">
                  <div className={`initial ${displayColorClass ? displayColorClass : ''}`} style={{backgroundColor: `${displayColorStyle}`}}>
                    {option.FirstName[0] + option.LastName[0]}
                  </div>
                  <div>
                    <h3>{fullName}</h3>
                    <p>{option.EmailAddress}</p>
                  </div>
                </div>
              </div>
            )
          } else if (props.type == "fault-reason") {
            return (
              <div className="result" key={index} onClick={() => selectOption(option.Description, option)}>
                <div>
                  <h3>{option.Description}</h3>
                  <p>{option.Code}</p>
                </div>
              </div>
            )
          } else if (props.type == "inventory") {
            return (
              <div className="result result-inventory" key={index} onClick={() => selectOption(option.Description, option)}>
                <div>
                  <h3>{option.Description}</h3>
                  <p>{option.InventoryCategoryDescription}</p>
                  <p>{option.InventorySubcategoryDescription}</p>
                  <p>{option.Code}</p>
                  <p>{option.Quantity}</p>
                </div>
              </div>
            )
          } else if (props.type == "status" && props.multiSelect) {
            const optionSelected = (props.selectedOptions ? props.selectedOptions.filter(function (e) { return e.ID === option.ID; }).length > 0 : false);
            return (
              <div className="result space-between" key={index} onClick={() => selectOption(option.Description, option)}>
                <div className="row">
                  <div>
                    <p>{option.Description}</p>
                  </div>
                </div>
                <div className={optionSelected ? "box box-checked" : "box"}></div>
              </div>
            )
          } else if (props.type == "enum" && props.multiSelect !== true) {
            return (
              <div className="result space-between" key={index} onClick={() => selectOption(option, option)}>
                <p>{option}</p>
              </div>
            )
          } else if (props.type == "enum" && props.multiSelect === true) {
            const optionSelected = (props.selectedOptions ? props.selectedOptions.filter(function (e) { return e === option; }).length > 0 : false);
            return (
              <div className="result space-between" key={index} onClick={() => selectOption(option, option)}>
                <div className="row">
                  <div>
                    <p>{option}</p>
                  </div>
                </div>
                <div className={optionSelected ? "box box-checked" : "box"}></div>
              </div>
            )
          } else if (props.type == "enum-proper") {
            return (
              <div className="result space-between" key={index} onClick={() => selectOption(option.description, option)}>
                <p>{Helper.splitWords(option.description)}</p>
              </div>
            )
          } else if (props.type == "statusChange") {
            return (
              <div className="result space-between" key={index} onClick={() => selectOption(option.Description, option)}>
                <p>{option.Description}</p>
              </div>
            )
          } else if (props.type == "product") {
            return (
              <div className="result space-between" key={index} onClick={() => selectOption(option.InventoryDescription, option)}>
                <div>
                  <h3>{option.ProductNumber}</h3>
                  <p>{option.InventoryDescription}</p>
                </div>
              </div>
            )
          } else if (props.type == "statusChange-multi") {
            const optionSelected = (props.selectedOptions ? props.selectedOptions.filter(function (e) { return e === option.ID; }).length > 0 : false);
            return (
              <div className="result space-between" key={index} onClick={() => selectOption(option.Description, option)}>
                <p>{option.Description}</p>
                <div className={optionSelected ? "box box-checked" : "box"}></div>
              </div>
            )
          } else if (props.type == "statusChange-multi-object") {
            const optionSelected = (props.selectedOptions ? props.selectedOptions.filter(function (e) { return e.ID === option.ID; }).length > 0 : false);
            return (
              <div className="result space-between" key={index} onClick={() => selectOption(option.Description, option)}>
                <p>{option.Description}</p>
                <div className={optionSelected ? "box box-checked" : "box"}></div>
              </div>
            )
          } else if (props.type == "template" || props.type == "task-template" || props.type == "form-definition") {
            return (
              <div className="result space-between" key={index} onClick={() => selectOption(option.Name, option)}>
                <p>{option.Name}</p>
              </div>
            )
          } else if (props.type == "trigger-rule") {
            return (
              <div className="result space-between" key={index} onClick={() => selectOption(option.Name, option)}>
                <p>{option.Name}{option.Description ? <span className="trigger-rule-description"> - {option.Description}</span> : ""}</p>
              </div>
            )
          } else if (props.type == "workflow") {
            return (
              <div className="result" key={index} onClick={() => selectOption(option.Name, option)}>
                <div>
                  <p>{option.Name}</p>
                </div>
              </div>
            )
          } else {
            <div className="result" key={index} onClick={() => selectOption(option, option)}>
              <h3>{option}</h3>
            </div>
          }
        })}

        {(props.addOption || props.showMoreOption || props.actionLinkOption) && !props.searching ?
          <div className="action-row">
            {props.addOption ?
              <div className="result-add" key={999} onClick={props.addOption.action}>
                <img src="/icons/plus-circle-blue.svg" />
                <span className="result-add-text">{props.addOption.text}</span>
              </div>
              : ''
            }
            {props.actionLinkOption ?
              <div className="result-action-link" onClick={props.actionLinkOption.action}>
                {props.actionLinkOption.text}
              </div> : ''
            }
            {props.showMoreOption && props.options.length !== props.totalOptions && !props.searching ?
              <div className="result-show-more" key={1000} onClick={props.showMoreOption.action}>
                Show more
              </div> : ''
            }
          </div> : ''
        }
      </div>
      {/* {props.actionLinkOption ? 
        <div className={`action-link-option ${inputFocus && !disabled ? '' : 'hidden'}`} onClick={props.actionLinkOption.action}>
          <span className="action-link-text">{props.actionLinkOption.text}</span>
        </div>
         : ''
      } */}
      {props.totalOptions
        ? <div className={`enter ${inputFocus && !disabled ? '' : 'hidden'}`}>
          <span className="enter-text">Showing {props.options.length} of {props.totalOptions} results</span>
        </div>
        : ''
      }
      {props.showClearButton === true ? <>

      </> : <>
        {props.chevronColor == 'light'
          ? <img src="/icons/chevron-down-white.svg" alt="dropdown" className={`arrow ${dropdownDirection == 'up' ? 'flip-icon' : ''}`} />
          : <img src="/icons/chevron-down-dark.svg" alt="dropdown" className={`arrow ${dropdownDirection == 'up' ? 'flip-icon' : ''}`} />
        }
      </>}
      <style jsx>{`
        .container {
          margin-top: -1px;
          padding-top: 1px;
          position: relative;
        }
        .results {
          background-color: ${colors.white};
          box-shadow: 0px 10px 10px rgba(0, 0, 0, 0.04), 0px 20px 25px rgba(0, 0, 0, 0.1);
          position: absolute;
          left: 0;
          max-height: 240px;
          min-height: 50px;
          overflow-y: scroll;
          width: 100%;
          z-index: 2;
        }

        .enter {
          color: ${colors.blueGrey};
          font-size: 12px;
          position: absolute;
          z-index: 3;
          width: 100%;
          background: ${colors.white};
        }
        .enter-text {
          float: right;
          padding-right: 2.5rem;
        }

        .button-height .results {
          top: 3.5rem;
        }

        .padding-top {
          padding-top: 1.5rem;
        }
        .margin-top {
          margin-top: 1.1rem;
        }

        .no-margin-top .margin-top {
          margin-top: 0.1rem;
        }

        .action-row {
          display: flex;
          align-items: center;
          height: 56px;
        }
        .result-add {
          display: flex;
          flex-grow: 1;
          text-align: center;
          justify-content: flex-start;
          color: ${colors.bluePrimary};
          font-size: 0.875rem;
          font-weight: bold;          
          cursor: pointer;
          margin-left: 0.5rem;
        }
        .result-add-text {

        }
        .result-add img {
          margin-right: 0.5rem;
          margin-bottom: -0.5rem;
          position: relative;
          top: -0.25rem;
          left: 0.25rem;
        }
        .result-action-link {
          display: flex;
          flex-grow: 1;
          text-align: center;
          justify-content: center;
          color: ${colors.bluePrimary};
          font-size: 0.875rem;
          font-weight: bold;
          cursor: pointer;
        }
        .result-show-more {
          display: flex;
          flex-grow: 1;
          text-align: center;
          justify-content: flex-end;
          color: ${colors.bluePrimary};
          font-size: 0.875rem;
          font-weight: bold;
          cursor: pointer;
          margin-right: 0.5rem;
        }

        .result {
          align-items: center;
          cursor: pointer;
          display: flex;
          padding: 0.5rem 1rem;
        }        
        .result :global(.initial){
          align-items: center;
          background-color: ${colors.bluePrimary};
          border-radius: 1.25rem;
          color: ${colors.white};
          display: flex;
          font-weight: bold;
          height: 2.5rem;
          justify-content: center;
          margin-right: 1rem;
          width: 2.5rem;
        }
        .result :global(h3){
          color: ${colors.darkPrimary};
          font-size: 1rem;
          margin: 0;
        }
        .result :global(p){
          color: ${colors.blueGrey};
          font-size: 14px;
          margin: 0;
        }
        .hidden {
          display: none;
        }
        .show-loader {
          border-color: rgba(113, 143, 162, 0.2);
          border-left-color: ${colors.blueGrey};
          display: block;
          left: calc(50% - 10px);
          margin: 0;
          position: absolute;
          top: calc(50% - 15px);
        }
        .no-caret :global(input) {
          caret-color: transparent;
          cursor: pointer;
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
        .box-checked {
          background-color: ${colors.bluePrimary};
          background-image: ${tickSvg};
          background-position: center;
          background-repeat: no-repeat;
          background-size: 70%;
          border: none;
          opacity: 1;
        }
        .space-between {
          justify-content: space-between;
        }
        .row {
          align-items: center;
          display: flex;
        }
        .arrow {
          pointer-events: none;
          position: absolute;
          right: 1rem;
          top: ${props.required ? "2.3rem" : "1.9rem"};
          z-index: 1;
        }

        .arrow-1-5rem .arrow {
          top: 1.5rem;
        }

        .arrow-1-2rem .arrow {
          top: 1.2rem;
        }

        .button-height .arrow {
          top: ${props.required ? "1rem" : "0.6rem"};
        }

        .button-height {
          height: 2.5rem;
          min-height: 2.5rem;
        }

        .trigger-rule-description {
          font-style: italic;
          font-size: 0.9rem;
          opacity: 0.8;
        }

        .no-margins {
          margin: 0;
          padding: 0;
        }

        .options-down {
          top: 4.5rem;
        }
        .options-up {
          bottom: 4rem;
        }
        .flip-icon {
          transform: rotate(180deg);
        }

        .RedLocal {
          background-color: #FC2E50 !important;
        }
        .OrangeLocal {
          background-color: #F26101 !important;
        }
        .YellowLocal {
          background-color: #FFC940 !important;
        }
        .GreenLocal {
          background-color: #51CB68 !important;
        }
        .BlueLocal {
          background-color: #5A85E1 !important;
        }
        .PurpleLocal {
          background-color: #735AE1 !important;
        }
        .BlackLocal {
          background-color: #4F4F4F !important;
        }
        .GreyLocal {
          background-color: #828282 !important;
        }
        .LightGreyLocal {
          background-color: #BDBDBD !important;
        }
        .CyanLocal {
          background-color: #13CACD !important;
        }

        `}</style>
    </div>
  )
}

SelectInput.defaultProps = {
  multiSelect: false,
};

export default SelectInput;
