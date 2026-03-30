// import { Map, Marker, Popup, TileLayer, Polygon } from 'react-leaflet-universal';

function MapMarker({position, popupHtml}) {

  return (
    <Marker position={position}>
      <Popup>{popupHtml}</Popup>
    </Marker>
  );
}

export default MapMarker;
