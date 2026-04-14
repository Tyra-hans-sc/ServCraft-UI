import React, { useState } from 'react';
import { colors, layout, tickSvg } from '../../../theme';
import SCCheckbox from '../../sc-controls/form-controls/sc-checkbox';
import SCModal from "@/PageComponents/Modal/SCModal";
import {Button} from "@mantine/core";

function SelectAttachments({ itemName, attachments, selectedAttachments, setSelectedAttachments, setSelectingAttachments }) {

  const [usedAttachments, setUsedAttachments] = useState([...selectedAttachments]);

  function selectAttachment(attachment) {
    let attachmentsToUpdate = [...usedAttachments];
    let match = attachmentsToUpdate.find(x => x.ID === attachment.ID);
    if (match) {
      let idx = attachmentsToUpdate.indexOf(match);
      attachmentsToUpdate.splice(idx, 1);
    } else {
      attachmentsToUpdate.push(attachment);
    }
    setUsedAttachments(attachmentsToUpdate);
  }

  function useAttachments() {
    setSelectedAttachments(usedAttachments);
    close();
  }

  function close() {
    setSelectingAttachments(false);
  }

  return (
      <SCModal
          open
          decor={'none'}
          onClose={() => {
            close()
          }}
          size={'lg'}
      >
        <div>
          <div className="title">
            {`Select attachments for communication from ${itemName}`}
          </div>
          <div className="option-container">
            {attachments.map(function (attachment, index) {
              const attachmentSelected = usedAttachments.find(selectedAttachment => selectedAttachment.ID == attachment.ID);
              return (
                  <>

                    <div className={`option ${attachmentSelected ? "selected" : ""}`}
                         onClick={() => selectAttachment(attachment)}>
                      <SCCheckbox
                          label={attachment.Description}
                          onChange={() => selectAttachment(attachment)}
                          key={index}
                          value={attachmentSelected}
                      />
                      {/* <div className="box"></div>
                  {attachment.Description} */}

                      {attachment.ThumbnailSize > 0 ?
                          attachment.UrlThumb ? <img className="thumb" src={attachment.UrlThumb} height="48"/> : ''
                          : <img src="/attachments/file.svg" className="thumb"/>
                      }
                    </div>
                  </>
              )
            })}
          </div>
          <div className="row space-between">
            <Button variant={'subtle'} color={'gray.7'} onClick={() => close()}>
              Cancel
            </Button>
            <Button onClick={() => useAttachments()}>
              Confirm Attachments
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
      </SCModal>
)
  ;
}

export default SelectAttachments;