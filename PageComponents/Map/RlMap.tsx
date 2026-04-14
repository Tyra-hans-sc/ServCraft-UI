import {MapContainer, Marker, Popup, TileLayer, useMapEvents, LayerGroup, Circle, FeatureGroup, LayersControl, Rectangle, useMap, useMapEvent} from "react-leaflet";
import L from 'leaflet';
import {IconHorse} from "@tabler/icons-react";
import {renderToString} from "react-dom/server";
import {useEffect, useState, useRef, useCallback, useMemo} from "react";
import { useInterval } from "@mantine/hooks";
import {useMantineTheme} from "@mantine/core";
import {showNotification} from "@mantine/notifications";
import {useEventHandlers} from "@react-leaflet/core";

function MapClickHandler() {
    const map = useMapEvents({
        click(e) {
            // Animate pan to clicked location
            map.flyTo(e.latlng, map.getZoom(), {
                animate: true,
                duration: 1.5,
                easeLinearity: 0.25
            });
        }
    });
    return null;
}

// Classes used by Leaflet to position controls
const POSITION_CLASSES = {
    bottomleft: 'leaflet-bottom leaflet-left',
    bottomright: 'leaflet-bottom leaflet-right',
    topleft: 'leaflet-top leaflet-left',
    topright: 'leaflet-top leaflet-right',
}

const BOUNDS_STYLE = { weight: 1 }

function MinimapBounds({ parentMap }) {
    const minimap = useMap()

    // Clicking a point on the minimap sets the parent's map center
    const onClick = useCallback(
        (e) => {
            parentMap.setView(e.latlng, parentMap.getZoom())
        },
        [parentMap],
    )
    useMapEvent('click', onClick)

    // Keep track of bounds in state to trigger renders
    const [bounds, setBounds] = useState(parentMap.getBounds())
    const onChange = useCallback(() => {
        setBounds(parentMap.getBounds())
        // Calculate zoom dynamically to ensure it's always current
        const currentZoom = Math.max(0, parentMap.getZoom() - 8)
        // Update the minimap's view to match the parent map's center and zoom
        minimap.setView(parentMap.getCenter(), currentZoom)
    }, [minimap, parentMap])

    // Listen to events on the parent map
    const handlers = useMemo(() => ({ move: onChange, zoom: onChange }), [onChange])
    useEventHandlers({ instance: parentMap } as any, handlers)

    return <Rectangle bounds={bounds} pathOptions={BOUNDS_STYLE} />
}

function MinimapControl({ position, zoom = 0 }) {
    const parentMap = useMap()
    const [mapZoom, setMapZoom] = useState(() => Math.max(0, parentMap.getZoom() - 8))

    // Update minimap zoom when parent map zoom changes
    useEffect(() => {
        const updateZoom = () => {
            setMapZoom(Math.max(0, parentMap.getZoom() - 8))
        }

        parentMap.on('zoomend', updateZoom)
        
        return () => {
            parentMap.off('zoomend', updateZoom)
        }
    }, [parentMap])

    // Prevent click events from propagating to the parent map
    const handleContainerClick = useCallback((e) => {
        e.stopPropagation()
    }, [])

    // Memoize the minimap so it's not affected by position changes
    const minimap = useMemo(
        () => (
            <MapContainer
                style={{height: 80, width: 80}}
                center={parentMap.getCenter()}
                zoom={mapZoom}
                dragging={false}
                doubleClickZoom={false}
                scrollWheelZoom={false}
                attributionControl={false}
                zoomControl={false}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
                <MinimapBounds parentMap={parentMap}/>
            </MapContainer>
        ),
        [parentMap, mapZoom],
    )

    const positionClass =
        (position && POSITION_CLASSES[position]) || POSITION_CLASSES.topright
    return (
        <div className={positionClass}>
            <div className="leaflet-control leaflet-bar" onClick={handleContainerClick}>
                {minimap}
            </div>
        </div>
    )
}

function CurrentLocationMarker() {
    const [position, setPosition] = useState(null);
    const [accuracy, setAccuracy] = useState(30); // Default fallback accuracy
    const [hasInitiallyFlown, setHasInitiallyFlown] = useState(false);

    const theme = useMantineTheme()

    const map = useMapEvents({
        locationfound(e) {
            setPosition(e.latlng as any);
            setAccuracy(e.accuracy); // Store the accuracy from the location event
            // Only fly to location on initial load
            if (!hasInitiallyFlown) {
                map.flyTo(e.latlng, map.getZoom());
                setHasInitiallyFlown(true);
            }
        },
        locationerror(e) {
            showNotification({
                id: 'locationError',
                message: `Location access denied or failed: ${e.message}`,
            })
            console.error('Location access denied or failed:', e.message);
        }
    });

    const getCurrentLocation = () => {
        map.locate();
    };

    useEffect(() => {
        getCurrentLocation();
    }, []);

    useInterval(() => {
        getCurrentLocation();
    }, 30000); // 30 seconds = 30000 milliseconds

    return position === null ? null : (
        <>
            {/* Location Marker Layer */}
            <LayersControl.Overlay checked name="Current Location">
                <FeatureGroup>
                    <Marker position={position} draggable riseOnHover>
                        <Popup>
                            You are here
                            <br />
                            Accuracy: ±{Math.round(accuracy)}m
                        </Popup>
                    </Marker>
                </FeatureGroup>
            </LayersControl.Overlay>

            {/* Accuracy Circle Layer */}
            <LayersControl.Overlay checked name="Location Accuracy">
                <FeatureGroup>
                    <Circle 
                        center={position} 
                        radius={accuracy} 
                        color={theme.colors.scBlue[6]}
                        fillOpacity={0.1}
                    >
                        <Popup>
                            Location accuracy radius
                            <br />
                            ±{Math.round(accuracy)}m
                        </Popup>
                    </Circle>
                </FeatureGroup>
            </LayersControl.Overlay>
        </>
    );
}


const RlMap = () => {
    // South Africa bounds - covers the entire country including Prince Edward Islands
    const southAfricaBounds: [[number, number], [number, number]] = [
        [-47.1, 16.2],  // Southwest corner (includes Prince Edward Islands)
        [-22.0, 38.2]   // Northeast corner (includes eastern border)
    ];

    // Alternative tighter bounds for mainland South Africa only
    const mainlandSouthAfricaBounds: [[number, number], [number, number]] = [
        [-35.0, 16.2],  // Southwest corner 
        [-22.0, 33.0]   // Northeast corner
    ];

    const iconHtml = renderToString(<IconHorse size={32} fill={'sandybrown'} color="saddlebrown" />);

    const customIcon = L.divIcon({
        html: `<div style="display: flex; align-items: center; justify-content: center;">${iconHtml}</div>`,
        className: 'custom-icon',
        iconSize: [32, 32],
        iconAnchor: [16, 32]
    });

    return <>
        <MapContainer
            center={[-26.1469, 28.036]} // SC HQ coordinates
            zoom={15} // Good zoom level for SC HQ
            style={{ height: 'calc(100dvh - 49px)', width: '100%' }}
            scrollWheelZoom={true}
            maxBounds={mainlandSouthAfricaBounds} // Using mainland bounds (change to southAfricaBounds if you want to include islands)
            maxBoundsViscosity={1.0} // Prevents dragging outside bounds
            minZoom={5} // Minimum zoom to keep South Africa visible
            maxZoom={18} // Maximum zoom for street-level detail
        >
            <LayersControl position="topright">
                {/* Main OpenStreetMap */}
                <LayersControl.BaseLayer checked name="OpenStreetMap">
                    <TileLayer
                        attribution='&copy; ServCraft | 2025 &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                </LayersControl.BaseLayer>

                {/* Satellite View */}
                <LayersControl.BaseLayer name="Satellite">
                    <TileLayer
                        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                        attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
                    />
                </LayersControl.BaseLayer>

                {/* Dark Theme */}
                <LayersControl.BaseLayer name="Dark">
                    <TileLayer
                        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    />
                </LayersControl.BaseLayer>

                {/* Light Theme */}
                <LayersControl.BaseLayer name="Light">
                    <TileLayer
                        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    />
                </LayersControl.BaseLayer>

                {/* Topographic */}
                <LayersControl.BaseLayer name="Topographic">
                    <TileLayer
                        url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
                        attribution='Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
                    />
                </LayersControl.BaseLayer>

                {/* Optional: Show South Africa boundary */}
                <LayersControl.Overlay name="South Africa Boundary">
                    <FeatureGroup>
                        <Rectangle 
                            bounds={mainlandSouthAfricaBounds}
                            color="#ff7800"
                            weight={3}
                            fillOpacity={0.1}
                            dashArray="10, 10"
                        >
                            <Popup>
                                <strong>South Africa Boundary</strong><br/>
                                Map is restricted to this area
                            </Popup>
                        </Rectangle>
                    </FeatureGroup>
                </LayersControl.Overlay>

                {/* Current Location Components */}
                <CurrentLocationMarker />

                <LayersControl.Overlay checked name="Servcraft Markers">
                    <FeatureGroup>

                        <Marker position={[-26.1469, 28.036]}>
                            <Popup>
                                <strong>ServCraft HQ</strong><br/>
                            </Popup>
                        </Marker>

                        <Marker position={[-33.9249, 18.4241]}>
                            <Popup>
                                <strong>Charles&apos;s</strong><br/>
                            </Popup>
                        </Marker>

                        <Marker position={[-25.7479, 28.2293]} icon={customIcon} draggable>
                        </Marker>
                    </FeatureGroup>
                </LayersControl.Overlay>
            </LayersControl>

            <MinimapControl position="bottomleft" zoom={3} />

            <MapClickHandler />
        </MapContainer>
    </>
}

export default RlMap