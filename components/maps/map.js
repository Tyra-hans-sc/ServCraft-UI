import React, { useState, useEffect, useContext, useRef, useMemo, useCallback } from 'react';
import { GoogleMap, Marker, useJsApiLoader, InfoWindow } from '@react-google-maps/api';
import MapContext from '../../utils/map-context';

function MapComponent({centerPosition, markers, focusIndex = null}) {

    // map
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: "AIzaSyAPdNkK2sIUkJs7pUTt2lDQFe4j7PwJoY4"
    });

    //const mapContext = useContext(MapContext);

    const mapContainerStyle = {
        width: 'auto',
        height: '78vh',
    };
    
    const [map, setMap] = useState(null);
    
    const onLoad = useCallback(function callback(map) {
        setMap(map);
        //console.log(map);
    }, []);
    
    const onUnmount = useCallback(function callback(map) {
        setMap(null)
    }, []);   
    
    // marker

    const [infoWindowIndex, setInfoWindowIndex] = useState();    

    useEffect(() => {
        setInfoWindowIndex(focusIndex);
    }, [focusIndex]);

    const onMarkerLoad = marker => {
    };

    const onMarkerClick = (marker, index) => {
        let result = null;
        if (index != infoWindowIndex) {
            result = index;
        }
        setInfoWindowIndex(result);
    };

    // info window    

    const onInfoWindowLoad = infoWindow => {
        
    };

    const onInfoWindowClose = (infoWindow, index) => {
        setInfoWindowIndex(null);
    };

    useEffect(() => {
        
    }, []);

    return isLoaded ? (
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={centerPosition ? centerPosition : {lat: -26, lng: 28}}
          zoom={10}
          onLoad={onLoad}
          onUnmount={onUnmount}
          options={{streetViewControl: false, mapTypeControl: false}}
        >
            {markers && markers.map((marker, index) => {
                return (
                    <Marker key={index} position={marker} title={marker.title}
                        icon={{url: marker.iconUrl, scaledSize: {width: 40, height: 40}}}
                        onLoad={onMarkerLoad} onClick={(e) => onMarkerClick(e, index)}>
                        {infoWindowIndex == index && 
                            <InfoWindow
                                key={index}
                                onLoad={onInfoWindowLoad}
                                onCloseClick={onInfoWindowClose}
                                >
                                <div>
                                    {marker.description}
                                </div>
                            </InfoWindow>}
                    </Marker>);
            })};
          <></>
        </GoogleMap>
    ) : <></>
  
}

export default MapComponent;
