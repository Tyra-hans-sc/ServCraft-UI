import React, { useState, useEffect, useContext, useRef, useMemo } from 'react';
// import { Map, Marker, Popup, TileLayer, Polygon } from 'react-leaflet-universal';
import dynamic from 'next/dynamic';
import MapMarker from './map-marker';
// import {TileLayer, Marker, Popup} from 'react-leaflet';
import {Loader} from '@googlemaps/js-api-loader';

// import LeafletMap from './leaflet-map';

function MapComponent({centerPosition, markers}) {

  const [googleMaps, setGoogleMaps] = useState(true);

  // const DynamicComponent = dynamic(() =>
  //   import('react-leaflet').then((l) => l.MapContainer), {ssr: false}
  // );

  // const DynamicComponent = dynamic(() => {
  //   import('@googlemaps/react-wrapper'), {ssr: false};
  // });

  const LeafletMapContainer = dynamic(
    () => import('react-leaflet').then(r => r.MapContainer), {ssr: false}
  );

  const LeafletTileLayer = dynamic(
      () => import('react-leaflet').then(r => r.TileLayer), {ssr: false}
  );

  const LeafletMarker = dynamic(
      () => import('react-leaflet').then(r => r.Marker), {ssr: false}
  );

  const [zoomLevel, setZoomLevel] = useState(12);

  const render = (status) => {
    return <h1>{status}</h1>;
  };

  const googlemap = useRef(null);

  useEffect(() => {
    if (googleMaps) {
      const loader = new Loader({
        apiKey: 'AIzaSyAPdNkK2sIUkJs7pUTt2lDQFe4j7PwJoY4',
        version: 'weekly',
      });
      let map; 
      loader.load().then(() => {
        const google = window.google;
        map = new google.maps.Map(googlemap.current, {
          center: {lat: -34.397, lng: 150.644},
          zoom: 8,
        });
      });
    }
  });

  if (googleMaps) {
    return (
      <div id="map" className="map-container" ref={googlemap}>

        <style jsx>{`
          
        `}</style>
      </div>
    );
  }

  // return (
  //   <div className="map-container">  

        
  //   <LeafletMapContainer center={[-34.397, 150.644]} zoom={13} scrollWheelZoom={false}>
  //     <LeafletTileLayer
  //       attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
  //       url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
  //     />
  //     <LeafletMarker position={[-34.397, 150.644]}>
  //     </LeafletMarker>
  //   </LeafletMapContainer>
      
      
  //   </div>
  // );
}

export default MapComponent;
