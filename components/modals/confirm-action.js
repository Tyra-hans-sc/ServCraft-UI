import React, { useState, useEffect } from 'react';
import useCustomerZone from '../../hooks/useCustomerZone';
import useMobileView from '../../hooks/useMobileView';
import { colors, layout, tickSvg } from '../../theme';
import helper from '../../utils/helper';
import SCInput from '../sc-controls/form-controls/sc-input';
import SCModal from "@/PageComponents/Modal/SCModal";
import {Button, Flex, Text} from "@mantine/core";

function ConfirmAction({ options, setOptions }) {

  let { heading, text, onConfirm, onCancel, confirmButtonText, cancelButtonText, onDiscard, discardButtonText, isPrompt, promptDefault } = options;
  confirmButtonText = confirmButtonText ? confirmButtonText : "OK";
  cancelButtonText = cancelButtonText ? cancelButtonText : "Cancel";

  const [promptText, setPromptText] = useState(options.promptDefault);
  const [errors, setErrors] = useState({ promptText: null });

  const [mobileView] = useMobileView();
  const [customerZone, tenantZone] = useCustomerZone();

  useEffect(() => {
    setPromptText(options.promptDefault);
  }, [options]);

  const closeModal = () => {
    setOptions({ ...options, display: false });
  };

  const doConfirm = () => {

    if (isPrompt && helper.isNullOrWhitespace(promptText)) {
      setErrors({ ...errors, promptText: "Required" });
      return;
    }

    closeModal();
    if (onConfirm) {
      onConfirm(promptText);
    }
  }

  const doCancel = () => {
    closeModal();
    if (onCancel) {
      onCancel();
    }
  };

  const doDiscard = () => {
    closeModal();
    if (onDiscard) {
      onDiscard();
    }
  };

  const updatePrompt = (e) => {
    setErrors({ ...errors, promptText: null });
    setPromptText(e.value);
  };

  return (
    options.display ?
      <SCModal open={options.display} size={600}>
        <div >
          {
            options.customContent ?
                options.customContent : <>

                  {heading ? <Text size={'xxl'} fw={600} c={'scBlue.9'} mb={25}>
                    {heading}
                  </Text> : ""}
                  <div className="text" dangerouslySetInnerHTML={{
                    __html: text
                  }}>
                  </div>
                  {isPrompt ? <>
                    <SCInput
                        required={true}
                        value={promptText}
                        error={errors.promptText}
                        onChange={updatePrompt}
                    />
                    {/* <TextInput required={true} value={promptText} changeHandler={updatePrompt} error={errors.promptText} /> */}
                  </> : ""}

                </>
          }

          <Flex w={'100%'} mt={35} justify={'end'} gap={'sm'} wrap={'wrap'}>
            {
                options.showCancel &&
                <Button variant={'outline'} color={'gray.7'} onClick={doCancel}>
                  {cancelButtonText}
                </Button>
            }
            {
                options.showDiscard &&
                <Button variant={'outline'} onClick={doDiscard}>
                  {discardButtonText}
                </Button>
            }

            <Button onClick={doConfirm}>
              {confirmButtonText}
            </Button>
          </Flex>


          {/*<div className="row space-between">
            {
              options.showCancel ? <div className="cancel">
                <OldButton text={cancelButtonText} extraClasses="hollow auto" onClick={doCancel} />
              </div>
              : ""
            }
            {options.showDiscard ? <div className="discard">
              <OldButton text={discardButtonText} extraClasses="hollow auto" onClick={doDiscard} />

            </div>
              : ""}
            <div className="update">
              <OldButton text={confirmButtonText} extraClasses="fit-content float-right" onClick={doConfirm} />
            </div>
          </div>*/}
        </div>
        <style jsx>{`
      /*.overlay {
        align-items: center;
        ${customerZone || tenantZone ? "background-color: rgba(0, 0, 0, 0.5);" : "background-color: rgba(19, 106, 205, 0.9);"}
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
        padding: 0.5rem;
        ${mobileView ? "width: 90%;" : "width: 32rem;"}
      }*/
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
      .text {
        line-height: 1.25rem;
        white-space: initial;
      }
      .label {
        font-size: 0.875rem;
        margin-bottom: 0.5rem;
      }
      .status {
        align-items: center;
        background-color: rgba(28,37,44,0.2);
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
        margin-right: 6rem;
      }
      .update {
        width: 100%;
      }
      .option-container {
        max-height: 26rem;
        overflow-y: scroll;
      }
      .option {
        align-items: center;
        cursor: pointer;
        display: flex;
        height: 2rem;
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
      .selected .box {
        background-color: ${colors.bluePrimary};
        background-image: ${tickSvg};
        background-position: center;
        background-repeat: no-repeat;
        background-size: 70%;
        border: none;
        opacity: 1;
      }
      `}</style>
      </SCModal> : <></>
  )
}

export default ConfirmAction;
