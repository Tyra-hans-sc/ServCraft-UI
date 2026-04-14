import { useEffect, useState } from "react";
import YouTube from "react-youtube";
import SCWidgetCard from "../layout/sc-widget-card";

export default function SCWidgetYoutube({ externalVideoID = null, onDismiss = null, widget }) {

    // 5hpi4WtxJpw
    // sc - Ge7q2s1pG-o
    const [videoID, setVideoID] = useState(externalVideoID ? externalVideoID : "jzC5SdV1NbE");
    const [options, setOptions] = useState(
        {playerVars: {
            autoplay: 0,
            rel: 0,
        },
        width: '100%', 
        height: '100%'}
    );

    const onReady = (event) => {
        event.target.pauseVideo();
    };

    return (<>

        <SCWidgetCard onDismiss={onDismiss}>
            <div className="sc-youtube-container">
                <YouTube videoId={videoID} opts={options} onReady={onReady} />
            </div>
        </SCWidgetCard>

        <style jsx>{`
        
        .sc-youtube-container, .sc-youtube-container > :global(div) {
            height: 100%;
        }


        
        `}</style>

    </>);
}