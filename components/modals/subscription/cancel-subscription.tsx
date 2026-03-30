import React, { useState, useEffect, useContext, useMemo } from 'react';
import { colors } from '../../../theme';
import Storage from '../../../utils/storage';
import * as Enums from '../../../utils/enums';
import Fetch from '../../../utils/Fetch';
//import fetch from 'isomorphic-unfetch';
import Helper from '../../../utils/helper';
import config from '../../../utils/config';
import { Button } from '@mantine/core';
import SelectInput from '../../select-input';
import TextArea from '../../text-area';
import TextInput from '../../text-input';
import ToastContext from '../../../utils/toast-context';
import SubscriptionContext from '../../../utils/subscription-context';

interface CancelSubscriptionProps {
  onCancel: (cancelled: boolean) => void;
}

interface Reason {
  ID: number;
  AdditionalQuestion: string;
  [key: string]: any;
}

const CancelSubscription: React.FC<CancelSubscriptionProps> = ({ onCancel }) => {

  const userFullName = Storage.getCookie(Enums.Cookie.servFullName);

  const subscriptionContext = useContext<any>(SubscriptionContext);

  const [reasons, setReasons] = useState<Reason[]>([]);
  const [selectedReason, setSelectedReason] = useState<Reason | undefined>();
  const [reasonText, setReasonText] = useState<string>('');

  const handleReasonChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setReasonText(e.target.value);
  };

  const getReasons = async (): Promise<void> => {
    const response = await Fetch.get({
      url: '/Billing/GetReasons',
    });
    setReasons(response.Results);
  };

  useEffect(() => {
    getReasons();
  }, []);

  const [additionalAnswer, setAdditionalAnswer] = useState<string>('');
  const handleAdditionalAnswerChange = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
    setAdditionalAnswer(e.target.value);
  };

  const [passwordCheck, setPasswordCheck] = useState<string>('');
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setPasswordCheck(e.target.value);
  };

  const toast = useContext<any>(ToastContext);
  const [inputErrors, setInputErrors] = useState<any>({});

  const isOwing = useMemo(() => {
    return (subscriptionContext.subscriptionInfo?.OwingBalance ?? 0) > 0;

  }, [subscriptionContext.subscriptionInfo]);

  const validate = (): boolean => {
    let validationItems = [
      { key: 'Reason', value: selectedReason, required: true, type: Enums.ControlType.Select },
      { key: 'PasswordCheck', value: passwordCheck, required: true, type: Enums.ControlType.Text },
    ];
    const { isValid, errors } = Helper.validateInputs(validationItems);
    setInputErrors(errors);
    return isValid;
  };

  const settleAndCancel = async (): Promise<void> => {

    let isValid = validate();
    if (isValid) {

      const redirUrl = await Fetch.post({
        url: '/Billing/PayFastCheckoutUrlOnceOffCancellationSettlement',
        params: {
          reason_id: selectedReason?.ID,
          password: passwordCheck,
          additional_answer: additionalAnswer,
        },
      });

      if (redirUrl.indexOf("http") === -1) {
        toast.setToast({
          message: redirUrl,
          show: true,
          type: Enums.ToastType.error
        });
        return;
      }

      let win = window.open(redirUrl, "_blank");
      let int = setInterval(() => {
        if (win && win.closed) {
          clearInterval(int);
          toast.setToast({
            message: 'Your subscription cancellation has been submitted',
            show: true,
            type: 'success'
          });
          onCancel(true);
        }
      }, 100);

    } else {
      toast.setToast({
        message: 'There are errors on the page',
        show: true,
        type: Enums.ToastType.error
      });
    }

  }

  const cancelSubscription = async (): Promise<void> => {

    let isValid = validate();
    if (isValid) {

      const res = await Fetch.post({
        url: `/Billing/SubscriptionCancel`,
        params: {
          reason_id: selectedReason?.ID,
          password: passwordCheck,
          additional_answer: additionalAnswer,
        },
        toastCtx: toast,
        statusIfNull: true
      });

      if (res.ResponseStatus === 200) {
        toast.setToast({
          message: 'Your subscription has been cancelled',
          show: true,
          type: 'success'
        });
        onCancel(true);
      } else {

      }

    } else {
      toast.setToast({
        message: 'There are errors on the page',
        show: true,
        type: Enums.ToastType.error
      });
    }
  };

  return (
    <div className="overlay" onClick={(e) => e.stopPropagation()}>
      <div className="modal-container">
        <div className="title">
          Hi {userFullName}, are you sure you want to cancel your account?
        </div>
        <div className="text">Why are you cancelling?</div>
        <div className="row">
          <div className="column">
            <SelectInput
              changeHandler={handleReasonChange}
              label="Reason"
              options={reasons}
              placeholder="Select required reason"
              required={true}
              name="Reason"
              setSelected={setSelectedReason}
              type="reason"
              value={reasonText}
              error={inputErrors.Reason}
              autoComplete="one-time-code"
            />
          </div>
        </div>
        {selectedReason ?
          <>
            <div className="text">{selectedReason.AdditionalQuestion}</div>
            <div className="row">
              <div className="column">
                <TextArea
                  label=""
                  name="AdditionalAnswer"
                  changeHandler={handleAdditionalAnswerChange}
                  value={additionalAnswer}
                />
              </div>
            </div>
          </> : ''
        }
        <div className="text">Enter your password to confirm your subscription cancellation</div>
        <div className="row">
          <div className="column">
            <TextInput
              label=""
              name="passwordCheck"
              changeHandler={handlePasswordChange}
              type="password"
              required={true}
              value={passwordCheck}
              error={inputErrors.PasswordCheck}
              autoComplete="one-time-code"
            />
          </div>
        </div>
        <div className="text">
          Warning: your subscription details and all associated data will be permanently deleted from our system. You won't be able to access any jobs, invoices, quotes, or any other data.
        </div>
        {isOwing && <div className="text" style={{color: "red"}}>
          Your account has an outstanding balance. You will be redirected to a payment page to settle your account, which will automatically cancel your subscription on successful payment.
        </div>}

        <div>

        </div>

        <div className="row" style={{ marginTop: "1rem" }}>
          <div className="cancel">
            <Button variant='outline' onClick={() => onCancel(false)} >
              Don't cancel Subscription
            </Button>
          </div>
          <div className="save">
            {isOwing ?
              <Button onClick={settleAndCancel} >
                Settle Account & Cancel Subscription
              </Button>
              :
              <Button onClick={cancelSubscription} >
                Cancel Subscription
              </Button>
            }

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
          flex-direction: column;
          width: 100%;
        }
        .title {
          color: ${colors.bluePrimary};
          margin-bottom: 1rem;
        }
        .text {
          margin-top: 1rem;
        }
        .cancel {
          
        }
        .save {
          
        }
      `}</style>
    </div>
  )
}

export default CancelSubscription;