import { useState, useContext } from 'react';
import TextInput from '../text-input';
import Checkbox from '../checkbox';
import ConfirmAccess from '../modals/auth/confirm-access';
import ConfirmAction from '../modals/confirm-action';
import Helper from '../../utils/helper';
import * as Enums from '../../utils/enums';
import SubscriptionContext from '../../utils/subscription-context';

function LoginAccess({isNew, userID, userIsActive, canLogin, email, password, confirmPassword, handleInputChange, inputErrors}) {

  const subscriptionContext = useContext(SubscriptionContext);
  const [confirmOptions, setConfirmOptions] = useState(Helper.initialiseConfirmOptions());

  const [confirmAccessOptions, setConfirmAccessOptions] = useState({
    display: false,
    onConfirm: () => { },
  });

  const handleCanLoginChange = (e) => {

    let isTrial = subscriptionContext && subscriptionContext.subscriptionInfo && subscriptionContext.subscriptionInfo.AccessStatus === Enums.AccessStatus.Trial;

    if (canLogin) {
      if (isNew) {
        handleInputChange(e);
      } else {        
        if (userIsActive && !isTrial) {
          setConfirmOptions({
            ...Helper.initialiseConfirmOptions(),
            confirmButtonText: "Remove access",
            onConfirm: () => {
              handleInputChange(e);
            },
            display: true,
            heading: "Remove login access?",
            text: "Confirm removing login access for the supplier contact?"
          });
        } else {
          handleInputChange(e);
        }
      }
    } else {
      if (isNew && !isTrial) {
        setConfirmAccessOptions({
          display: true,
          onConfirm: () => {
            handleInputChange(e);
          },
        });
      } else {
        if (!userIsActive && !isTrial) {
          setConfirmAccessOptions({
            display: true,
            onConfirm: () => {
              handleInputChange(e);
            },
          });
        } else {
          handleInputChange(e);
        }
      }
    }
  };

  return (
    <div className="login-container">
      <h3>Login Access</h3>
      <Checkbox
        changeHandler={() => handleCanLoginChange({ target: { name: 'canLogin', value: !canLogin } })}
        checked={canLogin}
        extraClasses="form"
        label="Give login access?"
      />
      {canLogin
        ? <>
          <TextInput
            label={"Username"}
            type={"text"}
            value={email}
            readOnly={true}
          />
          <TextInput
            changeHandler={handleInputChange}
            error={inputErrors.password}
            label={"Password"}
            name="password"
            required={true}
            type={"password"}
            value={password}
          />
          <TextInput
            changeHandler={handleInputChange}
            error={inputErrors.confirmPassword}
            label={"Confirm password"}
            name="confirmPassword"
            required={true}
            type={"password"}
            value={confirmPassword}
          />
        </>
        : ''
      }

      <ConfirmAccess options={confirmAccessOptions} setOptions={setConfirmAccessOptions} module={Enums.Module.Supplier} />
      <ConfirmAction options={confirmOptions} setOptions={setConfirmOptions} />

      <style jsx>{`
        .login-container {
          margin-bottom: 1.5rem;
          margin-top: 1.5rem;
        }  
      `}</style>
    </div>
  );
}

export default LoginAccess;
