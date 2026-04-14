import { colors, shadows } from '../theme';

const BusyIndicator = ({ text = null }) => {
    return (
        <>
            {text ?
                <div className="overlay">
                    <div className="bubble">
                        {text}
                        <div className="loader">tete</div>
                    </div>
                </div>
                : ""}

            <style jsx>{`

                .overlay {
                    z-index: 100000; 
                    background: #ffffffaa;
                    position: fixed;
                    inset: 0;
                }

                .bubble {
                    position: relative;
                    width: fit-content;
                    background: ${colors.bluePrimary};
                    color: ${colors.white};
                    padding: 12px 16px;
                    border-radius: 24px;
                    box-shadow: ${shadows.cardSmallDark};
                }

                .bubble :global(.loader) {
                    border-color: rgba(28, 37, 44, 0.2);
                    border-left-color: ${colors.white};
                    border-width: 0.25rem;
                    display: flex;
                    height: 1.5rem;
                    width: 1.5rem;
                    margin-top: 8px;
                  }
                `}</style>
        </>
    );
};

export default BusyIndicator;