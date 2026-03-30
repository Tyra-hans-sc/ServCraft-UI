import { useState } from "react";
import { colors } from '../theme';

export default function Accordion({ children, width = null, defaultOpen = true }) {

    const [isOpen, setIsOpen] = useState(defaultOpen);


    return (<>
    
    <div className="accordion-hotspot" onClick={() => setIsOpen(!isOpen)}>
            <div className="accordion-line">
            </div>
            <span className="hint">{isOpen ? "Hide" : "Show"}</span>

        </div>

        <div className={`accordion-container ${isOpen ? "" : "closed"}`}>
            {children}
        </div>


        <style jsx>{`

        .accordion-hotspot {
            cursor: pointer;
            padding: 4px 0;
            ${width ? `width: ${width};` : ""}
        }

        .accordion-line {
            height: 2px;
            background: ${colors.blueGreyLight};
            width: calc(100% - 32px);
            display: inline-block;
        }
        
        .accordion-container {
            overflow: hidden;
            transition-duration: 0.1s;
            height: fit-content;
        }

        .accordion-container.closed {
            height: 0px;
            transition-duration: 0.1s;
        }

        .hint {
            font-size: 0.7rem;
            color: ${colors.blueGreyLight};
            float: right;
            margin-top: 8px;
        }
        
        `}</style>
    </>);
}