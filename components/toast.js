import React, { useEffect, useRef } from 'react';
import {showNotification} from "@mantine/notifications";
import {Button, Group} from "@mantine/core";

function Toast({ toast, setToast }) {

  const prevToast = useRef({ ...toast });
  const timerRef = useRef(null);

  // const [mobileView] = useMobileView();

  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    const mantineToast = {
      id: toast.id || toast.message.trim(),
      message: <Group gap={'xs'} justify={'apart'}>
        {toast.message}
        {
            !!toast.action &&
            <Button size={'xs'} onClick={toast.actionFunc} color={'scBlue'}>
              {toast.action}
            </Button>
        }
      </Group> ,
      withCloseButton: !toast.action,
      autoClose: toast.message.length > 50 ? 10000 : 5000,
      color: toast.type === 'error' ? 'red' : 'scBlue'
    };

    if (prevToast.current.show && toast.show) {
      let newToast = { ...toast, show: false };
      let oldToast = { ...prevToast.current, show: false };
      prevToast.current = newToast;
      setToast(oldToast);
      setTimeout(() => {
        newToast = { ...prevToast.current, show: true };
        setToast(newToast);

        /*updateNotification(
            {...mantineToast, autoClose: toast.message.length > 50 ? 10000 : 5000}
        )*/
      }, 700);
      return;
    }

    if (toast.show) {
      const newToast = { ...toast, show: false };
      prevToast.current = toast;
      const toastDuration = newToast.message && newToast.message.length > 50 ? 10000 : 5000;
      timerRef.current = setTimeout(() => { setToast(newToast) }, toastDuration);

      // new toast functionality

      showNotification(
          mantineToast
      )
    }
  }, [toast]);

  /*function toastAction() {
    toast.actionFunc();
    setToast({ ...toast, show: false });
  }*/

  /*const toastIcon = () => {
    switch (toast.type) {
      case 'error':
        return '/icons/cross-red.svg';
      case 'success':
        return '/icons/cross-green.svg';
      default:
        return '/icons/cross-blue.svg';
    }
  }*/

  /*return (
    <div className={`toast-container ${toast.show ? "show" : ""} ${toast.type ? toast.type : ""}`}>
      <div className="text">
        {toast.message}
      </div>
      <div className="toast-actions">
        {toast.action
          ? <div className="text-action" onClick={toastAction}>
            {toast.action}
          </div>
          : ""
        }
        <img src={toastIcon()} alt="clear" onClick={() => setToast({ ...toast, show: false })} />
      </div>
      <style jsx>{`
        .toast-container {
          align-items: center;
          background-color: ${colors.background};
          border: 1px solid ${colors.blueGreyLight};
          border-radius: ${layout.cardRadius};
          box-shadow: 0px 10px 10px rgba(0, 0, 0, 0.04), 0px 20px 25px rgba(0, 0, 0, 0.1);
          box-sizing: border-box;
          display: flex;
          height: 4rem;
          justify-content: space-between;
          left: 50vw;
          transform: translateX(-50%);
          padding: 1rem;
          position: fixed;
          top: -5rem;
          transition: top ease-in-out 0.7s;
          ${mobileView ? "width: 90%;" : "width: 24rem;"}
          z-index: 1000000;
        }
        .show {
          top: 2.5rem;
        }
        .text {
          color: ${colors.darkPrimary};
          font-size: 0.875rem;
          margin-right: 2rem;
        }
        .toast-actions {
          display: flex;
        }
        .toast-actions > * {
          cursor: pointer;
        }
        .text-action {
          color: ${colors.bluePrimary};
          margin-right: 1rem;
        }
        .success {
          background-color: ${colors.backgroundSuccess};
          border: 1px solid ${colors.green};
        }
        .success :global(.text) {
          color: ${colors.green}
        }
        .error {
          background-color: ${colors.backgroundWarning};
          border: 1px solid ${colors.warningRedLight};
        }
        .error :global(.text) {
          color: ${colors.warningRed}
        }
      `}</style>
    </div>
  )*/

  return <> </>

}

export default Toast
