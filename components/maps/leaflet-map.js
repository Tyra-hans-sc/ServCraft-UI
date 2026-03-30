// import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import dynamic from 'next/dynamic';

const LeafletMap = (centerPosition) => {

    const MapContainer = dynamic(
        () => import('react-leaflet').then(r => r.MapContainer), {ssr: false}
    );

    const TileLayer = dynamic(
        () => import('react-leaflet').then(r => r.TileLayer), {ssr: false}
    );

    const Marker = dynamic(
        () => import('react-leaflet').then(r => r.Marker), {ssr: false}
    );

  return (
    <MapContainer center={centerPosition} zoom={13} scrollWheelZoom={false}>
      <TileLayer
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[-34.397, 150.644]}>
      </Marker>
    </MapContainer>
  )
}

export default LeafletMap
