import React, { useState, useEffect, useContext } from 'react';
import { colors, fontSizes, layout, fontFamily, tickSvg } from '../../../theme';
import Button from '../../button';
import Helper from '../../../utils/helper';
import Fetch from '../../../utils/Fetch';
import * as Enums from '../../../utils/enums';
import ToastContext from '../../../utils/toast-context';
import Checkbox from '../../checkbox';
import KendoRadioButton from '../../kendo/kendo-radio-button';

function ChangeStore({jobID, storeID, fromStoreName, toStoreName, isRecurringJob, onStoreChange, onCancel, accessStatus}) {

    const toast = useContext(ToastContext);

    const [recurringJob, setRecurringJob] = useState(false);
    const [modify, setModify] = useState(true);

    const [option1, setOption1] = useState(false);
    const [option2, setOption2] = useState(false);

    const changeHandler1 = (e) => {
        setOption1(!option1);
        setOption2(false);
    };

    const changeHandler2 = (e) => {
        setOption1(false);
        setOption2(!option2);
    };

    const [saving, setSaving] = useState(false);

    const submitStoreChange = async () => {
        setSaving(true);

        const result = await Fetch.post({
            url: `/Job/JobStoreChange`,
            params: {
                jobCardID: jobID,
                storeID: storeID,
                updateRecurringJob: recurringJob,
                transfer: option2,
            },
            toastCtx: toast
        });
        if (result.ID) {
            onStoreChange();
        }
        
        setSaving(false);
    };

    return (
        <div className="overlay" onClick={(e) => e.stopPropagation()}>
            <div className="modal-container">
                <div className="title">
                    Changing store from {fromStoreName} to {toStoreName}
                </div>
                {isRecurringJob ?
                    <>
                    <div className="row">                                                
                        <div className="text" style={{marginLeft: '2rem'}}>
                            This job was created from a recurring job. Would you like to update the recurring job?
                        </div>
                        <div className="column">
                            <Checkbox checked={recurringJob} 
                                changeHandler={() => setRecurringJob(!recurringJob)}
                            />
                        </div>
                    </div>
                    <br/>
                    </>
                    : ''
                }
                <div className="row">
                    <div className="column">
                        <KendoRadioButton 
                            name="modify1"
                            value={option1} 
                            changeHandler={changeHandler1}
                        />
                    </div>
                    <div className="text">                        
                        Change the store. This will update the store for all items related to the job. This will affect any quotes, invoices, purchase orders, appointments and comments that are linked to this job.                        
                    </div>
                </div>
                <br/>
                <div className="row">
                    <div className="column">
                        <KendoRadioButton 
                            name="modify2"
                            value={option2} 
                            changeHandler={changeHandler2} 
                        />
                    </div>
                    <div className="text">                                                
                        Transfer the store. This will keep the history of all currently linked items to the existing store. If you add new items to this job, they will be created with the new store.
                    </div>                    
                </div>
                <br/>
                <div className="row single-margin">
                    <div className="column">

                    </div>
                    <div className="text bold">
                        Please note that this change cannot be undone. Ensure that you select the right option before proceeding.
                    </div>
                </div>
                <div className="row">
                    <div className="cancel">
                        <Button text="Cancel" extraClasses="hollow" onClick={() => onCancel()} />
                    </div>
                    <div className="update">
                        <Button disabled={(!option1 && !option2) || saving || accessStatus === Enums.AccessStatus.LockedWithAccess || accessStatus === Enums.AccessStatus.LockedWithOutAccess}
                            text='Proceed' onClick={submitStoreChange} />
                    </div>
                </div>
            </div>
            <style jsx>{`
                .row {
                    display: flex;
                    justify-content: space-between;
                }
                .column {
                    display: flex;
                    align-items: center;
                    margin-right: 1rem;
                }
                .single-margin {
                    margin-left: 1rem
                }
                .bold {
                    font-weight: bold;
                }
                .title {
                    color: ${colors.bluePrimary};
                    font-size: 1.125rem;
                    font-weight: bold;
                    margin-bottom: 1rem;
                }
                .text {
                    line-height: 1.25rem;
                }
                .switch {
                    flex-direction: row-reverse;
                    display: flex;
                }
                .cancel {
                 width: 6rem;
                }
                .update {
                    width: 14rem;
                }
            `}</style>
        </div>
    );
}

export default ChangeStore;
