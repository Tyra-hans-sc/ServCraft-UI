import React, { useState, useEffect, useContext, useRef, useMemo } from 'react';
import dynamic from 'next/dynamic';
import MapMarker from './map-marker';
import {Loader} from '@googlemaps/js-api-loader';

function MapComponent({centerPosition, markers}) {

    const googlemap = useRef(null);

    let map = null;

    const [mapInitialized, setMapInitialized] = useState(false);

    useEffect(() => {
        loadMap();
        //let map; 
        // loader.load().then(() => {
        //     const google = window.google;
        //     map = new google.maps.Map(googlemap.current, {
        //         center: centerPosition,
        //         zoom: 10,
        //     });

        //     const marker = new google.maps.Marker({
        //         position: centerPosition,
        //         map: map,
        //       });
        // });
    });

    const loadMap = () => {
        const loader = new Loader({
            apiKey: 'AIzaSyAPdNkK2sIUkJs7pUTt2lDQFe4j7PwJoY4',
            version: 'weekly',
        });
        loader.load().then(() => {
            const google = window.google;
            map = new google.maps.Map(googlemap.current, {
                center: centerPosition,
                zoom: 10,
            });
            setMapInitialized(true);
        });
    };

    useEffect(() => {
        if (mapInitialized) {
            setTimeout(() => {
                loadMarker();
            }, 100);            
        }
    }, [mapInitialized]);

    const loadMarker = () => {
        const marker = new google.maps.Marker({
            position: centerPosition,
            map: map,
        });
    };

    return (
      <div id="map" className="map-container" ref={googlemap}>

        <style jsx>{`
          
        `}</style>
      </div>
    );
  
}

export default MapComponent;
