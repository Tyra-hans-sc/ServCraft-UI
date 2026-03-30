import React, { useState, useEffect, useRef, useContext } from 'react';
import TextInput from '../../text-input';

export default function CustomFormEditor(props) {

    const [inputErrors, setInputErrors] = useState({});

    console.log('CustomFormEditor: ', props);
    const [subject, setSubject] = useState(props.title);

    const handleSubjectChange = (e) => {
        setSubject(e.target.value);
        //updateAppointment('Subject', e.target.value);
    };

    return (
        <div className="custom-modal-overlay">
            <div className="row">
                <div className="column">
                    <TextInput
                        label="Title your appointment"
                        required={true}
                        type="text"
                        changeHandler={handleSubjectChange}
                        value={subject}
                        error={inputErrors.Subject}
                    />
                </div>
            </div>            
        </div>
    )
};
