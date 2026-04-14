import { FC } from "react";

const SCSpinner: FC<{ colour: "light" | "dark" }> = ({ colour = "light" }) => {


    return (<>

        <img src="/specno-icons/autorenew.svg" className="spinner" alt="busy" />

        <style jsx>{`
    
            @keyframes rotation {
                from {
                    transform: rotate(0deg);
                }
                to {
                    transform: rotate(359deg);
                }
            }

            .spinner {
                ${colour === "light" ? "filter: brightness(10000);" : ""}
                animation: rotation 2s infinite linear;
            }

    `}</style>
    </>);
};

export default SCSpinner;