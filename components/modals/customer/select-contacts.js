import React from 'react';
import { colors, layout, tickSvg } from '../../../theme';
import Helper from '../../../utils/helper';
import SCCheckbox from '../../sc-controls/form-controls/sc-checkbox';
import SCModal from "@/PageComponents/Modal/SCModal";
import { Button} from "@mantine/core";

function SelectContacts({ contacts, selectedContacts, setSelectedContacts, setChangingContacts }) {

  function selectContact(contact) {
    let newContacts = [];
    if (selectedContacts.find(selContact => selContact.ID == contact.ID)) {
      newContacts = selectedContacts.filter(selContact => selContact.ID != contact.ID)
    } else {
      newContacts = [
        ...selectedContacts,
        contact
      ]
    }
    setSelectedContacts(Helper.sortObjectArray(newContacts, 'FirstName'));
  }

  return (
      <SCModal
          open
          decor={'none'}
          onClose={() => setChangingContacts(false)}
          size={'sm'}
      >
        <div>
          <div className="title">
            {"Select contacts for communication"}
          </div>
          <div className="option-container">
            {contacts.map(function (contact, index) {
              const contactSelected = selectedContacts.find(selectedContact => selectedContact.ID == contact.ID);
              return (
                  <>
                    <SCCheckbox
                        key={index}
                        onChange={() => selectContact(contact)}
                        value={contactSelected}
                        label={contact.FirstName + " " + contact.LastName}
                    />
                    {/* <div key={index} className={`option ${contactSelected ? "selected" : ""}`} onClick={() => selectContact(contact)}>
                  <div className="box"></div>
                  {contact.FirstName + " " + contact.LastName}
                </div> */}
                  </>
              )
            })}
          </div>
          <div>
            <Button
                mt={'sm'}
                onClick={() => setChangingContacts(false)}
                w={'100%'}
            >
              Done
            </Button>
          </div>
        </div>
        <style jsx>{`
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
            width: 24rem;
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
      </SCModal>
  )
}

export default SelectContacts;
