import SCIcon from "../misc/sc-icon";

export default function SCModal({ title = "", children, onDismiss, minWidth = "38rem", maxWidth = undefined }) {
    return (<div className="sc-overlay" onClick={(e) => e.stopPropagation()}>
        <div className="sc-modal-container">
            {!!title ? <div className="sc-modal-title">
                {title}
            </div> : ""}
            {onDismiss ? <div className="dismiss-button">
                <SCIcon name="x" onClick={onDismiss} />
            </div> : ""}
            <div style={{width: "100%", whiteSpace: "break-spaces"}}>
                {children}
            </div>
        </div>
        <style jsx>{`

            .dismiss-button {
                position: absolute;
                right: 0.5rem;
                top: 0.5rem;
            }

            .sc-overlay {
                align-items: center;
                //padding-top: 10vh;
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

              .sc-modal-container {
                position: relative;
                background-color: var(--white-color);
                border-radius: var(--layout-card-radius);
                padding-top: 1rem;
                padding-left: 1rem;
                padding-right: 1rem;
                padding-bottom: 1rem;
                width: max-content;
                min-width: ${minWidth};
                max-width: ${maxWidth ? maxWidth : "90%"};
                max-height: 80%;
                overflow-x: auto;
              }
              
              .sc-modal-title {
                color: var(--blue-primary-color);
                font-size: 1.125rem;
                font-weight: bold;
                margin-bottom: 1rem;
                margin-right: 1.5rem;
              }
              

        `}</style>
    </div>);
}