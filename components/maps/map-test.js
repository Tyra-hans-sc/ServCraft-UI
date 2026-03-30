import React, { useState, useEffect, useContext, useRef, useMemo, useCallback } from 'react';
import { GoogleMap, Marker, LoadScript, InfoWindow } from '@react-google-maps/api';
import MapContext from '../../utils/map-context';

function MapComponent({markers}) {

    const mapContainerStyle = {
        width: 'auto',
        height: '78vh',
    };

    const [localMarkers, setLocalMarkers] = useState([]);

    useEffect(() => {
        setLocalMarkers(markers);
    }, [markers]);

    const onLoad = useCallback(function callback(map) {
        
        console.log('map loaded');
    }, []);

    const mapContext = useContext(MapContext);

    useEffect(() => {
        console.log(1, mapContext);
    }, [mapContext]);

    return(
        <LoadScript googleMapsApiKey={"AIzaSyAPdNkK2sIUkJs7pUTt2lDQFe4j7PwJoY4"}>
            <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={{lat: -26, lng: 28}}
                zoom={10}
                onLoad={onLoad}
                options={{streetViewControl: false, mapTypeControl: false}}
            >                
                 {localMarkers && localMarkers.map((marker, index) => {
                    return (
                        <Marker key={index} position={marker} title={marker.title}
                            icon={{url: marker.iconUrl, scaledSize: {width: 40, height: 40}}}
                            >
                        </Marker>);
                })};
                
            </GoogleMap>
        </LoadScript>        
    )
}

export default MapComponent;
