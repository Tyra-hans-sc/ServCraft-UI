import React, { useState} from 'react';
import { colors, layout, tickSvg } from '../../../theme';
import * as Enums from '../../../utils/enums';
import SCCheckbox from '../../sc-controls/form-controls/sc-checkbox';
import SCModal from "@/PageComponents/Modal/SCModal";
import {Button} from "@mantine/core";

function SelectForms({ itemName, forms, selectedForms, setSelectedForms, setSelectingForms }) {

  const [usedForms, setUsedForms] = useState([...selectedForms]);

  function selectForm(form) {
    let formsToUpdate = [...usedForms];
    let match = formsToUpdate.find(x => x.ID === form.ID);
    if (match) {
      let idx = formsToUpdate.indexOf(match);
      formsToUpdate.splice(idx, 1);
    } else {
      formsToUpdate.push(form);
    }
    setUsedForms(formsToUpdate);
  }

  function useForms() {
    setSelectedForms(usedForms);
    close();
  }

  function close() {
    setSelectingForms(false);
  }

  return (
      <SCModal
          open
          decor={'none'}
          onClose={close}
          size={'lg'}
      >
        <div>
          <div className="title">
            {`Select forms for communication from ${itemName}`}
          </div>
          <div className="option-container">
            {forms.map(function (form, index) {
              const formSelected = usedForms.find(selectedForm => selectedForm.ID == form.ID);
              return (
                  <>
                    <div className={`option ${formSelected ? "selected" : ""}`} onClick={() => selectForm(form)}>
                      <div style={{display: "flex"}}>
                        <SCCheckbox
                            label={form.FormDefinition.Name}
                            onChange={() => selectForm(form)}
                            value={formSelected}
                        />
                        <span
                            className="form-status">{Enums.getEnumStringValue(Enums.FormStatus, form.FormStatus)}</span>
                        {/* <div className="box"></div>
                    <span>
                      {form.FormDefinition.Name} <span className="form-status">{Enums.getEnumStringValue(Enums.FormStatus, form.FormStatus)}</span>
                    </span> */}
                      </div>
                      <span>
                    {Enums.getEnumStringValue(Enums.FormRule, form.FormDefinition.FormRule)}
                  </span>
                    </div>
                  </>
              )
            })}
          </div>
          <div className="row space-between">
            <Button variant={'subtle'} color={'gray.7'} onClick={() => close()}>
              Cancel
            </Button>
            <Button onClick={() => useForms()}>
              Confirm Forms
            </Button>
          </div>
        </div>
        <style jsx>{`
          .thumb {
            position: absolute;
            right: 0;
          }

          .overlay {
            align-items: center;
            background-color: rgba(19, 106, 205, 0.9);
            bottom: 0;
            display: flex;
            justify-content: center;
            left: 0;
            position: fixed;
            right: 0;
            top: 0;
            z-index: 9999;
          }

          .container {
            background-color: ${colors.white};
            border-radius: ${layout.cardRadius};
            padding: 2rem 3rem;
            width: 34rem;
          }

          .row {
            display: flex;
          }

          .space-between {
            justify-content: space-between;
          }

          .align-end {
            align-items: flex-end;
          }

          .title {
            color: ${colors.bluePrimary};
            font-size: 1.125rem;
            font-weight: bold;
            margin-bottom: 1rem;
          }

          .label {
            font-size: 0.875rem;
            margin-bottom: 0.5rem;
          }

          .status {
            align-items: center;
            background-color: rgba(28, 37, 44, 0.2);
            border-radius: ${layout.buttonRadius};
            box-sizing: border-box;
            color: ${colors.darkPrimary};
            display: flex;
            font-size: 0.75rem;
            font-weight: bold;
            height: 2rem;
            justify-content: center;
            padding: 0 1rem;
            text-align: center;
          }

          .cancel {
            width: 6rem;
          }

          .update {
            width: 14rem;
          }

          .option-container {
            min-height: 26rem;
            max-height: 26rem;
            overflow-y: auto;
          }

          .option {
            align-items: center;
            cursor: pointer;
            display: flex;
            height: 48px;
            position: relative;
            justify-content: space-between;
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
            display: inline-block;
          }

          .selected .box {
            background-color: ${colors.bluePrimary};
            background-image: ${tickSvg};
            background-position: center;
            background-repeat: no-repeat;
            background-size: 70%;
            border: none;
            opacity: 1;
          }

          .form-status {
            margin-left: 1rem;
            font-size: 0.75rem;
            font-style: italic;
            opacity: 0.6;
            margin-top: 0.25rem;
          }

        `}</style>
      </SCModal>

)
  ;
}

export default SelectForms;