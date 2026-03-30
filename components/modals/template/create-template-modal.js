import {colors, layout} from '../../../theme';
import CreateTemplateComponent from "../../template/create-template";
import Button from '../../button';

const CreateTemplateModal = ({ onSave, setTemplateModalVisibility, allowedModules}) => {

    const onComponentSave = async (template) => {
        onSave(template);
        setTemplateModalVisibility(false);
    };

    return (
        <div className="overlay" onClick={(e) => e.stopPropagation()}>
            <div className="container">
                <CreateTemplateComponent onSave={onComponentSave} allowedModules={allowedModules} onCancel={() => setTemplateModalVisibility(false)} />
                {/* <div className="row">
                    <Button text="Cancel" extraClasses="hollow" onClick={() => setTemplateModalVisibility(false)} />
                </div> */}
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
              width: 38rem;
            }
            .table-container {
              height: 400px;
              overflow-y: auto;
            }
            .search-container :global(.search) {
              width: 100%;
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
            .arrow {
              padding: 0.25rem 1rem;
            }
            .close {
              width: 6rem;
            }
            .column {
              display: flex;
              flex-direction: column;
              flex-grow: 1;
              margin-left: 1.5rem;
            }
            .table-container-visible {
              display: block;
            }
            .loading-overlay {
              align-items: center;
              background-color: rgba(245, 248, 251, 0.6);
              bottom: 0;
              border-radius: 8px;
              display: none;
              justify-content: center;
              left: -1rem;
              position: absolute;
              right: -1rem;
              top: 0.5rem;
            }
            .loading-overlay-visible {
              display: flex;
            }
            .loading-overlay :global(.loader) {
              border-color: rgba(28, 37, 44, 0.2);
              border-left-color: ${colors.darkPrimary};
              border-width: 0.25rem;
              display: flex;
              height: 1.5rem;
              width: 1.5rem;
            }
          `}</style>
        </div>
    );
};

export default CreateTemplateModal;