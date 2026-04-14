import { FC } from "react";

const SCWatermark: FC<{ text?: string, rotation?: string }> = ({ text = "SAMPLE", rotation = "-25deg" }) => {

    return (
        <>
            <div style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0, pointerEvents: "none", fontSize: "5rem", opacity: 0.1 }}>
                <div style={{ position: "absolute", left: "50%", top: "50%", transform: `translate(-50%, -50%) rotate(${rotation})` }}> {text}
                </div>
            </div>
        </>
    );
}

export default SCWatermark;