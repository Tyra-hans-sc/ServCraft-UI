import React, { useState, useEffect, useContext, useRef } from 'react';
import { colors, fontSizes, layout, fontFamily } from '../../../theme';

import SCInput from '../../sc-controls/form-controls/sc-input';
import SCTextArea from '../../sc-controls/form-controls/sc-textarea';
import Button from '../../button';

import Helper from '../../../utils/helper';
import * as Enums from '../../../utils/enums';
import ToastContext from '../../../utils/toast-context';

import ReferralService from '../../../services/referral/referral-service';

function CreateReferral({onCancel, onSave}) {

    const toast = useContext(ToastContext);
    const [saving, setSaving] = useState(false);

    const [inputErrors, setInputErrors] = useState({});

    const [inputs, setInputs] = useState({
        Name: '',
        Number: '',
        Comment: '',
        EmailAddress: '',
    });

    const handleInputChange = (e) => {
        setInputs({
            ...inputs,
            [e.name]: e.value
        });
    };

    const validate = () => {
        let validationItems = [
            {key: 'Name', value: inputs.Name, required: true, type: Enums.ControlType.Text},
            {key: 'Number', value: inputs.Number, required: true, type: Enums.ControlType.ContactNumber},
            {key: 'Number', value: inputs.Number, type: Enums.ControlType.ContactNumber},
            {key: 'EmailAddress', value: inputs.EmailAddress, type: Enums.ControlType.Email},
        ];

        const {isValid, errors} = Helper.validateInputs(validationItems);
        setInputErrors(errors);

        return isValid;
    };

    const save = async () => {
        setSaving(true);

        let isValid = validate();
        if (isValid) {
            let response = await ReferralService.createReferral(inputs, toast);
            
            if (response && response.status === 500) {
                // do nothing, something went wrong
                // toast will automatically popup
            } else {
                toast.setToast({
                    message: 'Referral created successfully',
                    show: true,
                    type: Enums.ToastType.success
                })
                onSave();
            }
        } else {
            toast.setToast({
                message: 'There are errors on the page',
                show: true,
                type: Enums.ToastType.error,
              });
            setSaving(false);
        }
    };

    return (
        <div className="overlay" onClick={(e) => e.stopPropagation()}>
            <div className='modal-container'>
                <div className="title">
                    <h1>Refer a friend to ServCraft and WIN R500 in cash</h1>
                </div>

                <div className="row">
                    <span>Tell us who would benefit from ServCraft by filling in the form below.</span>
                </div>
                <div className="row margin-top">
                    <span>We'll give them a call and explore how we can help their business. When they subscribe we'll give you R500 after they've been with us for 3 months.</span>
                </div>

                <div className="row margin-top">
                    <span>Who are you referring?</span>
                </div>

                <div className="row">
                    <div className="column">
                        <SCInput
                            label="Referral Name"
                            onChange={handleInputChange}
                            required={true}
                            name="Name"
                            value={inputs.Name}
                            error={inputErrors.Name}
                        />
                    </div>
                    <div className="column">
                        <SCInput
                            label="Referral Number"
                            onChange={handleInputChange}
                            required={true}
                            type="tel"
                            name="Number"
                            value={inputs.Number}
                            error={inputErrors.Number}
                        />
                    </div>
                </div>

                <div className="row">
                    <div className="column">
                        <SCInput
                            label="Referral Email"
                            onChange={handleInputChange}
                            name="EmailAddress"
                            value={inputs.EmailAddress}
                            error={inputErrors.EmailAddress}
                        />
                    </div>
                    <div className="column"></div>
                </div>

                <div className="row">
                    <div className="column">
                        <SCTextArea
                            name="Comment"
                            label="How could ServCraft help their business?"
                            onChange={handleInputChange}
                            value={inputs.Comment}
                            error={inputErrors.Comment}
                        />
                    </div>
                </div>

                <div className="row align-end">
                    <Button text="Cancel" extraClasses="auto hollow" onClick={onCancel} />
                    <Button extraClasses="auto left-margin" text={`Submit`} onClick={save} disabled={saving} />          
                </div>

            </div>

            <style jsx>{`
                .row {
                    display: flex;
                }
                .align-end {
                    justify-content: flex-end;
                    align-items: flex-end;
                  }
                .column {
                    display: flex;
                    flex-direction: column;
                    width: 100%;
                }
                .column + .column {
                    margin-left: 1.25rem;
                }
                .title {
                    color: ${colors.bluePrimary};
                    font-size: 1.125rem;
                    font-weight: bold;
                }
                .margin-top {
                    margin-top: 1rem;
                }
            `}</style>
        </div>
    )
}

export default CreateReferral;
