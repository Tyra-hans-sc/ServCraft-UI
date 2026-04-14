import { Label, Error } from "@progress/kendo-react-labels";

function SCLabel({label, editorID, isValid, extraClasses}) {

    return (
        <div className={`label-container ${extraClasses}`}>
            <Label editorId={editorID} editorValid={isValid}>
                {label}
            </Label>
            <style jsx>{`
                .label-container {
                    
                }
                .inline {
                    display: inline;
                    padding-left: 0.5rem;
                }
            `}</style>
        </div>
    );
}

export default SCLabel;
