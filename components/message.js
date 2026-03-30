import { useEffect, useState, useRef } from 'react';
import { colors, fontSizes, layout, fontFamily, shadows } from '../theme'
import Button from './button'
import useWindowSize from "../hooks/useWindowSize"

function Message({ message, setMessage }) {

  const ref = useRef();
  const [leftPosition, setLeftPosition] = useState();
  const [backgroundColor, setBackgroundColor] = useState('');
  const [textColor, setTextColor] = useState('');
  const [closeIcon, setCloseIcon] = useState('');
  const [buttonExtra, setButtonExtra] = useState('');

  const setColors = () => {
    if (message.type === 'critical') {
      setBackgroundColor(colors.warningRed);
      setTextColor(colors.white);
      setCloseIcon('/icons/cross-white.svg');
      setButtonExtra('white-action');
    } else {
      setBackgroundColor(colors.white);
      setTextColor(colors.darkPrimary);
      setCloseIcon('/icons/cross-blue.svg');
      setButtonExtra('white-action');
    }
  }

  const windowSize = useWindowSize();

  useEffect(() => {
    const containerWidth = ref.current.offsetWidth;
    let leftPos = `${Math.floor(windowSize.width / 2) - (0.5 * containerWidth)}px`;

    setLeftPosition(leftPos);
  }, [windowSize]);

  useEffect(() => {
    setColors();
  }, [message.show]);

  const messageAction = () => {
    message.actionFunc();
    
    closeMessage(true);
  }

  const closeMessage = (actionPerformed) => {
    if (message.onClose) {
      message.onClose(actionPerformed)
    }

    setMessage({ ...message, show: false });
  };

  return (
    <div className={`container ${message.show ? "show" : ""} ${message.type ? message.type : ""}`} ref={message.show ? ref : null}>
      <div className="message padding">
        {message.message}
      </div>
      {message.actionLabel && message.actionFunc ?
        <div className="action-button padding">
          <Button text={`${message.actionLabel}`} extraClasses={buttonExtra} onClick={messageAction} />
        </div>
        : ""}
      <div className="close-button padding">
        <img src={closeIcon} alt="clear" onClick={() => closeMessage(false)} title='close' />
      </div>

      <style jsx>{`
        .container {
          position: fixed;
          top: 4px;
          height: 64px;
          left: ${leftPosition};
          flex-direction: row;
          background-color: ${backgroundColor};
          color: ${textColor};
          border-radius: ${layout.cardRadius};
          box-shadow: ${shadows.card};
          box-sizing: border-box;
          width: fit-content;
          display: none;
          padding: 1rem;
          align-items: center;       
          z-index: 99;   
        }
        .show {
          display: flex;
        }
        .message {
          color: ${textColor};
        }
        .action-button {
          color: ${textColor};
          margin-top: -1.5rem;
        }
        .close-button {
          color: ${textColor};
          cursor: pointer;
        }
        .padding {
          padding: 0 0.5rem;
        }
      `}</style>
    </div>
  );
}

export default Message
