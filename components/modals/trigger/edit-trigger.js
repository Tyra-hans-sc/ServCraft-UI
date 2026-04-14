import { colors, layout, shadows } from '../../../theme';
import ManageTrigger from '../../trigger/manage-trigger';
import SCModal from "../../../PageComponents/Modal/SCModal";
import {useMediaQuery} from "@mantine/hooks";

const EditTrigger = ({ triggerToEdit, module, setEditTriggerVisible, onSave, defaultTriggerName, defaultSetting1, defaultSetting2, defaultRuleName, readonlyConditions }) => {

    const tooSmall = useMediaQuery('(max-width: 75rem)');

    return (

        <SCModal
            open
            onClose={() => setEditTriggerVisible(false)}
            size={'73rem'}
            withCloseButton={true}
            p={0}
            modalProps={{
                fullScreen: tooSmall,
                closeOnClickOutside: false,
                // centered: false,
                styles: {
                    inner: {
                        padding: '0px'
                    },
                    content: {
                        maxHeight: '90vh',  // Use slightly less than 100vh to avoid scrollbars
                        overflow: 'auto'
                    },
                    body: {
                        // minHeight: '70vh' // Force some minimum height
                    }

                }

            }}
        >
            <div className="modal-container">
                <ManageTrigger
                    triggerToEdit={triggerToEdit}
                    module={module}
                    setEditTriggerVisible={setEditTriggerVisible}
                    onSave={onSave}
                    defaultTriggerName={defaultTriggerName}
                    defaultSetting1={defaultSetting1}
                    defaultSetting2={defaultSetting2}
                    modal={true}
                    defaultRuleName={defaultRuleName}
                    readonlyConditions={readonlyConditions}
                />
            </div>

            <style jsx>{`
            .fit-content {
                width: fit-content;
            }

            .modal-container {
                width: 100%;
                //max-height: 90vh !important;
                min-height: 36rem;
            }

            .row {
              display: flex;
              justify-content: space-between;
            }
            .column {
              display: flex;
              flex-direction: column;
              width: 100%;
              margin-left: 0.5rem;
            }
            .title {
              color: ${colors.bluePrimary};
              font-size: 1.125rem;
              font-weight: bold;
              margin-bottom: 1rem;
            }

            .title.column {
              width: fit-content;
            }

            .cancel {
              width: 6rem;
            }
            .update {
              width: 14rem;
            }

            .card {
                background-color: ${colors.white};
                border-radius: ${layout.cardRadius};
                box-shadow: ${shadows.cardDark};
                box-sizing: border-box;
                color: ${colors.darkSecondary};
                cursor: pointer;
                display: flex;
                flex-direction: column;
                flex-shrink: 0;
                justify-content: space-between;
                opacity: 1;
                padding: 1rem;
                position: relative;
                transition: opacity 0.3s ease-in-out;
                margin-bottom: 1rem;
              }
          `}</style>
        </SCModal>
    );
};

export default EditTrigger;