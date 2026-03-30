import React, {useRef} from "react";
import { Popover } from "@progress/kendo-react-tooltip";
import Button from "../../button";
import { useOutsideClick } from 'rooks';

function SCPopover({show, setShow, position, anchor, title, body, confirmText, onClick}) {

    const cancelClick = () => {
        setShow(!show);
        onClick(false);
    };

    const confirmClick = () => {
        setShow(!show);
        onClick(true);
    };

    const ref = useRef();

    // useOutsideClick(anchor, () => {
    //     if (show) {
    //         setShow(false);
    //     }
    // });

    return (    
        <div ref={ref}>
            <Popover show={show} position={position} anchor={anchor ? anchor.current : null} callout={true}>

                <div className="sc-popover-icon-x" onClick={cancelClick}>
                    <img src="/icons/cross-black.svg" />
                </div>

                <div className="sc-popover-title">
                    {title}
                </div>

                <div className="sc-popover-body">
                    {body}
                </div>

                <div className="buttons">
                    <Button text={confirmText} onClick={confirmClick} extraClasses="fit-content w10" />
                </div>                
            </Popover>

            <style jsx>{`        
                .sc-popover-icon-x {
                    display: flex;
                    position: absolute;
                    right: 1rem;
                    top: 0.5rem;
                    cursor: pointer;
                }
                .sc-popover-title {
                    font-weight: bold;
                }
                .sc-popover-body {
                    margin-top: 0.5rem;   
                    max-width: 300px;                 
                }
                .buttons {
                    display: flex; 
                    justify-content: flex-end;                   
                }
            `}</style>
        </div>    
    );
}

export default SCPopover;
