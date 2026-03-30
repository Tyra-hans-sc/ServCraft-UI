import SCComboBox from '@/components/sc-controls/form-controls/sc-combobox';
import { FormSignatureSettings } from '@/interfaces/internal/models';
import signatureService from '@/services/signature/signature-service';
import { FC, useEffect, useRef, useState } from 'react';
import * as Enums from '@/utils/enums';
import { SignatureTemplate } from '@/interfaces/api/models';
import SCInput from '@/components/sc-controls/form-controls/sc-input';
import SignatureTemplateManageModal from '@/PageComponents/Signature/SignatureTemplateManageModal';
import SCTextArea from '@/components/sc-controls/form-controls/sc-textarea';

const FormDefinitionFieldSignatureOptions: FC<{
    settings: FormSignatureSettings
    updateSettings: (settings: FormSignatureSettings) => void
    disabled: boolean
    inputErrors: any
    onUpdate?: (signatureTemplate: SignatureTemplate | null) => void
}> = ({ settings, updateSettings, disabled, inputErrors, onUpdate }) => {

    const [signatureTemplate, setSignatureTemplate] = useState<SignatureTemplate | null>(null);
    const [signatureTemplateOptions, setSignatureTemplateOptions] = useState<SignatureTemplate[]>([]);
    const [manageSignatureTemplate, setManageSignatureTemplate] = useState(false);
    const manageSignatureTemplateRef = useRef<SignatureTemplate | null>(null);
    const [triggerRefresh, setTriggerRefresh] = useState<any>();

    useEffect(() => {
        onUpdate && onUpdate(signatureTemplate);
    }, [signatureTemplate]);

    const getSignatureTemplates = async (skipIndex, take, filter) => {
        let response = (await signatureService.getSignatureTemplates()).filter(x => x.Module === Enums.Module.FormHeader);
        if (!!settings?.SignatureTemplateID) {
            setSignatureTemplate(response.find(x => x.ID === settings.SignatureTemplateID) ?? null);
        }
        return { data: response, total: response.length };
    }

    const refreshSignatureTemplateOptions = async () => {

        let matchIndex = signatureTemplateOptions.findIndex(x => x.ID === settings?.SignatureTemplateID);

        let setNow = matchIndex > -1;
        
        if (setNow) {
            setSignatureTemplate(signatureTemplateOptions[matchIndex]);
        }

        let response = (await signatureService.getSignatureTemplates()).filter(x => !x.Module || x.Module === Enums.Module.FormHeader);

        if (!!settings?.SignatureTemplateID) {
            let match = response.find(x => x.ID === settings.SignatureTemplateID) ?? null;
            if (!!match) {
                if ((setNow && match.Name !== signatureTemplateOptions[matchIndex].Name) || !setNow) {
                    setSignatureTemplate(match);
                }
            }
        }

        setSignatureTemplateOptions(response);
    }

    const updateSignatureTemplate = (template: SignatureTemplate) => {
        // setSignatureTemplate(template);
        updateSettings({
            ...settings,
            SignatureTemplateID: template?.ID
        });
    }

    useEffect(() => {
        refreshSignatureTemplateOptions();
    }, [settings]);

    return (<>

        <div style={{ display: "flex" }}>
            <div style={{ width: "100%" }}>
                <SCComboBox
                    label='Signature Template'
                    // getOptions={getSignatureTemplates}
                    options={signatureTemplateOptions}
                    dataItemKey='ID'
                    textField='Name'
                    value={signatureTemplate}
                    onChange={updateSignatureTemplate}
                    canClear={false}
                    canSearch={false}
                    disabled={disabled}
                    error={inputErrors && inputErrors["DataOptionSignatureTemplateID"]}
                    triggerRefresh={triggerRefresh}
                    addOption={{
                        text: "Add Signature Template but it isn't used",
                        action: () => {
                            manageSignatureTemplateRef.current = null;
                            setManageSignatureTemplate(true);
                        }
                    }}
                />
            </div>
            <img style={{ marginTop: "2rem", marginLeft: "0.5rem", cursor: "pointer" }} src="/specno-icons/edit.svg" onClick={() => {
                manageSignatureTemplateRef.current = signatureTemplate;
                setManageSignatureTemplate(true);
            }} />

        </div>
        <div title={"You can modify this on the signature template. Click the edit button above."}>
            <SCTextArea
                label={`Signature's terms of acceptance`}
                onChange={() => { }}
                required={false}
                value={signatureTemplate?.Terms ?? ""}
                disabled={true}
            />
        </div>
        <SignatureTemplateManageModal
            id={manageSignatureTemplateRef.current?.ID}
            onClose={() => {
                manageSignatureTemplateRef.current = null;
                setManageSignatureTemplate(false);
            }}
            onSave={(newSignatureTemplate) => {
                updateSignatureTemplate(newSignatureTemplate);
                setTriggerRefresh(Math.random());
                manageSignatureTemplateRef.current = null;
                setManageSignatureTemplate(false);
            }}
            show={manageSignatureTemplate}
        />

        <style jsx>{`
            
        `}</style>
    </>);
};

export default FormDefinitionFieldSignatureOptions;