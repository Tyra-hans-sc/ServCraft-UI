import { useState, useEffect, useContext } from 'react';
import Fetch from '../../../utils/Fetch';
import Helper from '../../../utils/helper';
import * as Enums from '../../../utils/enums';
import { colors, layout } from '../../../theme';
import ToastContext from '../../../utils/toast-context';
import Button from '../../button';
import SCCheckbox from '../../sc-controls/form-controls/sc-checkbox';
import CustomerContactLocationSelector from '../../selectors/customer/customer-contact-location-selector';

const JobCustomerChange = ({ job, setShowChangeCustomer, callback }) => {

    const toast = useContext(ToastContext);

    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [selectedContact, setSelectedContact] = useState(null);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [transferAssets, setTransferAssets] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [failureReason, setFailureReason] = useState("");

    const [componentState, setComponentState] = useState(null);

    const [errors, setErrors] = useState({
        Customer: null,
        Contact: null,
        Location: null
    });

    useEffect(() => {

        Fetch.get({
            url: `/Job/JobCustomerChangeCheck?jobCardID=${job.ID}`
        }).then(result => {
            setComponentState(result.Result);
            setFailureReason(result.Message);
        });

    }, []);

    useEffect(() => {
        // clear sub selections and research
        setSelectedContact(null);
        setSelectedLocation(null);
    }, [selectedCustomer]);

   

    const cancel = () => {
        setShowChangeCustomer(false);
    };

    const saveChanges = async () => {

        // validate
        let validationErrors = {};
        let isValid = true;
        if (!selectedCustomer) {
            validationErrors.Customer = "Customer is required";
            isValid = false;
        }
        if (!selectedContact) {
            validationErrors.Contact = "Contact is required";
            isValid = false;
        }

        if (isValid) {
            if (selectedCustomer.ID === job.Customer.ID && selectedContact.ID === job.Contact.ID) {
                isValid = false;
                toast.setToast({ message: "Cannot change to the same customer and contact", type: Enums.ToastType.error, show: true });
                return;
            }
        }

        setErrors(validationErrors);

        if (!isValid) {
            toast.setToast({ message: "Validation failed for one or more items", type: Enums.ToastType.error, show: true });
            return;
        }

        setSubmitting(true);
        const result = await Fetch.post({
            url: `/Job/JobCustomerChange`,
            params: {
                JobCardID: job.ID,
                CustomerID: selectedCustomer.ID,
                ContactID: selectedContact.ID,
                LocationID: selectedLocation ? selectedLocation.ID : null,
                TransferAssets: transferAssets,
                ResetSignatures: signatureWillBeCleared()
            },
            toastCtx: toast
        });
        setSubmitting(false);

        if (result.ID) {
            setShowChangeCustomer(false);
            callback(result);
        }

    };

    const signatureWillBeCleared = () => {
        return selectedCustomer && selectedCustomer.ID !== job.Customer.ID;
    };

    const hasAssets = () => {
        return job.JobInventory.filter(inv => {
            return inv.IsActive && inv.ProductID
        }).length > 0;
    };

    return (<>
        <div className="overlay" onClick={(e) => e.stopPropagation()}>
            <div className="container">
                <div className="title">
                    Change Customer for {job.JobCardNumber}
                </div>

                {componentState === true ? <>


                    <CustomerContactLocationSelector
                        compactView={true}
                        inputErrors={errors}
                        selectedCustomer={selectedCustomer}
                        selectedContact={selectedContact}
                        selectedLocation={selectedLocation}
                        setSelectedContact={setSelectedContact}
                        setSelectedCustomer={setSelectedCustomer}
                        setSelectedLocation={setSelectedLocation}
                    />

                    {hasAssets() ? <div className="row">
                        <SCCheckbox
                            onChange={() => setTransferAssets(!transferAssets)}
                            value={transferAssets}
                            label="Transfer Assets"
                        />
                    </div> : ""}


                    <div className="row">
                        {signatureWillBeCleared() ? <>
                            <p className="warning-text">Please note, customer&apos;s signature will be cleared</p>
                        </> : ""}
                    </div>

                </> : ""}

                {componentState === false ? <>
                    <p>Cannot change customer for this job:</p>

                    <div>{failureReason}</div>
                </> : ""}


                <div className="row space-between">
                    <div className="cancel">
                        <Button text="Cancel" extraClasses="hollow" onClick={cancel} />
                    </div>
                    {componentState === true ? <div className="update">
                        <Button text={submitting ? "Changing Customer..." : "Change Customer"} onClick={saveChanges} disabled={submitting} />
                    </div> : ""}
                </div>
            </div>
        </div>


        <style jsx>{`
            .container {
              background-color: ${colors.white};
              border-radius: ${layout.cardRadius};
              padding: 2rem 3rem;
              width: 38rem;
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
            .justify-end {
                justify-content: flex-end;
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
            .arrow {
              padding: 0.25rem 1rem;
            }
            .cancel {
              width: 6rem;
            }
            .update {
              width: 14rem;
            }
            .input-row {
              display: flex;
              margin-left: -1.5rem;
            }
            .column {
              display: flex;
              flex-direction: column;
              flex-grow: 1;
              margin-left: 1.5rem;
            }
            .more {
              color: ${colors.bluePrimary};
              cursor: pointer;
              display: flex;
              justify-content: flex-end;
              margin-top: 1rem;
            }

            .warning-text {
                font-weight: bold;
            }
          `}</style>
    </>);
};

export default JobCustomerChange;