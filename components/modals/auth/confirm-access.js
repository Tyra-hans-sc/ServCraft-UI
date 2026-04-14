import React, { useState, useEffect, useContext } from 'react';
import { colors, fontSizes, layout, fontFamily, tickSvg } from '../../../theme';
import Button from '../../button';
import Checkbox from '../../checkbox';
import * as Enums from '../../../utils/enums';
import SubscriptionContext from '@/utils/subscription-context';

function ConfirmAccess({ options, setOptions, module, moduleIsDeactivated = false }) {

  let { onConfirm, onCancel } = options;
  const subscriptionContext = useContext(SubscriptionContext);

  const closeModal = () => {
    setAgree(false);
    setOptions({ ...options, display: false });
    if (onCancel) {
      onCancel();
    }
  };

  const doConfirm = () => {
    closeModal();
    if (onConfirm) {
      onConfirm();
    }
  };

  const [agree, setAgree] = useState(false);
  const [isTrial] = useState(subscriptionContext && subscriptionContext.subscriptionInfo && subscriptionContext.subscriptionInfo.AccessStatus === Enums.AccessStatus.Trial);

  return (
    options.display ?
      <div className="overlay" onClick={(e) => e.stopPropagation()}>
        <div className="container">
          <div className="title">
            {module === "Store" ? "Activate new Store?" : <>
              {module == Enums.Module.Employee ? 'Employee login access' : 'Give supplier contact login access?'}
            </>}
          </div>
          <div className="text">
            {module === "Store" ? <>
              Adding a store could amend your subscription.
              If you have an available license, it will be allocated otherwise an additional license will be added to your subscription.
              If an additional license is required you will be automatically billed pro-rata for the rest of the month.
            </> : !isTrial ? <>
              Giving <b>login access</b> to {module == Enums.Module.Employee ? 'an employee' : 'a supplier contact'} will allow them to login to both the web and mobile apps.
              {module === Enums.Module.Employee && <><br />
                <br />
                <b>Comms Only</b> will allow you to easily send communication to your employee, and they will have no login access.
              </>}
            </> : <>
              Giving <b>login access</b> to {module == Enums.Module.Employee ? 'an employee' : 'a supplier contact'} could amend your subscription.
              If you have an available license, it will be allocated otherwise an additional license will be added to your subscription.
              If an additional license is required you will be automatically billed pro-rata for the rest of the month.
              {module === Enums.Module.Employee && <><br />
                <br />
                <b>Comms Only</b> will allow you to easily send communication to your employee, and they will have no login access.
              </>}
              {moduleIsDeactivated && <>
                <br />
                <br />
                The {module === Enums.Module.Employee ? 'employee' : 'supplier contact'} will be reactivated.
              </>}

              <br />
              <br />
            </>}
          </div>
          {module !== Enums.Module.Employee &&
            <>
              <div className="agree">
                <Checkbox checked={agree} label={'Agree'} changeHandler={() => setAgree(!agree)} />
              </div>
              <div className="row space-between">
                <div className="cancel">
                  <Button text='Cancel' extraClasses="hollow" onClick={closeModal} />
                </div>
                <div className="update">
                  <Button text={module === "Store" ? "Activate Store" : 'Give Access'} extraClasses="" onClick={doConfirm} disabled={!agree} />
                </div>
              </div>
            </>
          }
          {module === Enums.Module.Employee && <div className="row space-between">
            <div></div>
            <div className="update">
              <Button text={"Understood"} extraClasses="" onClick={doConfirm} />
            </div>
          </div>}

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
          z-index: 110;
        }
        .container {
          background-color: ${colors.white};
          border-radius: ${layout.cardRadius};
          padding: 1rem;
          width: 32rem;
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
        .agree {
          display: flex;
          flex-direction: row-reverse;
          color: ${colors.bluePrimary};
          font-size: 1.125rem;
          font-weight: bold;
        }
        .text {
          line-height: 1.25rem;
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
      </div> : ''
  );
}

export default ConfirmAccess;
