import React, {useState, useEffect} from 'react';
import YouTube from 'react-youtube';

// https://developers.google.com/youtube/player_parameters

function YouTubeWidget({newDashboard = true, externalVideoID = null}) {

    // 5hpi4WtxJpw
    // sc - Ge7q2s1pG-o
    const [videoID, setVideoID] = useState(externalVideoID ? externalVideoID : "jzC5SdV1NbE");
    const [options, setOptions] = useState();

    useEffect(() => {
        let opts = {
            playerVars: {
                autoplay: 0,
                rel: 0,
            }
        };
        if (newDashboard) {
            opts.height = '390';
            opts.width = '640';
        } else {
            opts.width = '100%';
        }
        setOptions(opts);
    }, []);

    const onReady = (event) => {
        event.target.pauseVideo();
    };

    return (
        <>
            <YouTube videoId={videoID} opts={options} onReady={onReady} />
        </>
    )
}

export default YouTubeWidget;
