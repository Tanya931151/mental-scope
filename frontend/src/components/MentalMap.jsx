import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet";
import { Navigation, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// SVG Marker Templates

// SVG Marker Templates
const createSvgIcon = (color) => {
    const svgString = `<svg width="30" height="42" viewBox="0 0 30 42" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M15 0C6.71573 0 0 6.71573 0 15C0 26.25 15 42 15 42C15 42 30 26.25 30 15C30 6.71573 23.2843 0 15 0ZM15 21C11.6863 21 9 18.3137 9 15C9 11.6863 11.6863 9 15 9C18.3137 9 21 11.6863 21 15C21 18.3137 18.3137 21 15 21Z" fill="${color}"/>
        <path opacity="0.2" d="M15 42C15 42 30 26.25 30 15C30 12.5 29.5 10.5 28.5 8.5L15 42Z" fill="black"/>
    </svg>`;

    return new L.Icon({
        iconUrl: `data:image/svg+xml;base64,${btoa(svgString)}`,
        iconSize: [30, 42],
        iconAnchor: [15, 42],
        popupAnchor: [0, -40],
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        shadowSize: [41, 41],
        shadowAnchor: [12, 41]
    });
};

const roseIcon = createSvgIcon("#F43F5E");
const userIcon = createSvgIcon("#8B5CF6");

// Component to move map when selected clinic changes
function FlyToClinic({ selectedClinic }) {
    const map = useMap();
    useEffect(() => {
        if (selectedClinic) {
            map.flyTo([selectedClinic.lat, selectedClinic.lon], 16, {
                duration: 1.5,
                easeLinearity: 0.25
            });
        }
    }, [selectedClinic, map]);
    return null;
}

// Component to handle map clicks for manual location selection
function MapEventsHandler({ setPosition, setHasLocation, fetchNearbyClinics, setMapCenter, setShowSearchBtn, position }) {
    const map = useMapEvents({
        click(e) {
            const { lat, lng } = e.latlng;
            setPosition([lat, lng]);
            setHasLocation(true);
            fetchNearbyClinics(lat, lng);
            setShowSearchBtn(false);
        },
        moveend() {
            const center = map.getCenter();
            setMapCenter([center.lat, center.lng]);

            // Show search button if center is significantly different from current position
            const dist = Math.sqrt(Math.pow(center.lat - position[0], 2) + Math.pow(center.lng - position[1], 2));
            if (dist > 0.01) {
                setShowSearchBtn(true);
            }
        }
    });
    return null;
}

export default function MentalMap({ clinics, setClinics, selectedClinic }) {
    const [position, setPosition] = useState([28.6139, 77.209]); // Default to Delhi
    const [mapCenter, setMapCenter] = useState([28.6139, 77.209]);
    const [showSearchBtn, setShowSearchBtn] = useState(false);
    const [hasLocation, setHasLocation] = useState(false);
    const [loading, setLoading] = useState(true);
    const [fetching, setFetching] = useState(false);
    const [apiMirrorIndex, setApiMirrorIndex] = useState(0);

    const mirrors = [
        "https://overpass-api.de/api/interpreter",
        "https://overpass.kumi.systems/api/interpreter",
        "https://lz4.overpass-api.de/api/interpreter"
    ];

    // Detect current location
    const findMe = () => {
        if (!navigator.geolocation) return;
        setLoading(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const lat = pos.coords.latitude;
                const lon = pos.coords.longitude;
                setPosition([lat, lon]);
                setHasLocation(true);
                setLoading(false);
                fetchNearbyClinics(lat, lon);
            },
            (err) => {
                console.error("Location Error:", err);
                setLoading(false);
                alert("Please enable location access in your browser settings.");
            }
        );
    };

    useEffect(() => {
        findMe();
    }, []);

    // Fetch clinics using OSM Overpass API (with debouncing & failover)
    const [fetchTimeout, setFetchTimeout] = useState(null);

    const fetchNearbyClinics = (lat, lon, isRetry = false) => {
        if (fetchTimeout) clearTimeout(fetchTimeout);
        if (!isRetry) setFetching(true);

        const newTimeout = setTimeout(async () => {
            const query = `
                [out:json][timeout:25];
                (
                    node["healthcare"~"psychologist|psychiatrist"](around:5000,${lat},${lon});
                    node["amenity"~"hospital|clinic"](around:5000,${lat},${lon});
                );
                out body;
            `;

            const url = `${mirrors[apiMirrorIndex]}?data=${encodeURIComponent(query)}`;

            try {
                const res = await fetch(url);

                if (res.status === 429 || res.status >= 500) {
                    console.warn(`Mirror ${apiMirrorIndex} busy, trying next...`);
                    setApiMirrorIndex((prev) => (prev + 1) % mirrors.length);
                    setTimeout(() => fetchNearbyClinics(lat, lon, true), 1000);
                    return;
                }

                const contentType = res.headers.get("content-type");
                if (!res.ok || !contentType || !contentType.includes("application/json")) {
                    throw new Error("Invalid response");
                }

                const data = await res.json();
                setFetching(false);

                if (!data.elements) {
                    setClinics([]);
                    return;
                }

                const results = data.elements.map((place) => ({
                    id: place.id,
                    name: place.tags?.name || "Mental Health Center",
                    lat: place.lat,
                    lon: place.lon,
                    type: place.tags?.healthcare || place.tags?.amenity || "Clinic",
                    address: place.tags?.["addr:street"] ? `${place.tags?.["addr:street"]}, ${place.tags?.["addr:city"] || ""}` : "Location coordinates available"
                }));

                setClinics(results);
            } catch (error) {
                console.error("Fetch Error:", error);
                setFetching(false);
            }
        }, isRetry ? 100 : 800);

        setFetchTimeout(newTimeout);
    };

    if (loading) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded-[30px] border-4 border-white shadow-inner">
                <div className="text-center">
                    <div className="w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-sm font-bold text-gray-500 tracking-tight italic">Locating you...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-full rounded-[30px] overflow-hidden border-4 border-white shadow-2xl relative z-0">
            {/* 🔄 Fetching Progress Bar */}
            {fetching && (
                <div className="absolute top-0 left-0 right-0 h-1 z-[1001] bg-rose-100 overflow-hidden">
                    <motion.div
                        initial={{ x: "-100%" }}
                        animate={{ x: "100%" }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                        className="h-full w-1/3 bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]"
                    />
                </div>
            )}

            {/* Manual Location Button */}
            <button
                onClick={findMe}
                disabled={loading}
                className="absolute top-4 right-4 z-[1000] bg-white p-3 rounded-2xl shadow-xl border border-gray-100 text-rose-600 hover:bg-rose-50 transition-all group active:scale-95 disabled:opacity-50"
                title="Find my location"
            >
                <Navigation className={`w-6 h-6 ${loading ? 'animate-pulse' : 'group-hover:rotate-12 transition-transform'}`} />
            </button>

            {/* 🔥 Search in this area button */}
            <AnimatePresence>
                {showSearchBtn && (
                    <motion.button
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -20, opacity: 0 }}
                        onClick={() => {
                            setPosition(mapCenter);
                            fetchNearbyClinics(mapCenter[0], mapCenter[1]);
                            setShowSearchBtn(false);
                        }}
                        className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-rose-600 text-white px-6 py-3 rounded-full shadow-2xl font-bold text-sm flex items-center gap-2 hover:bg-rose-700 transition-all border-2 border-white"
                    >
                        <Search className="w-4 h-4" />
                        Search in this area
                    </motion.button>
                )}
            </AnimatePresence>

            <MapContainer
                center={position}
                zoom={14}
                scrollWheelZoom={true}
                style={{ width: "100%", height: "100%" }}
                zoomControl={false}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />

                <FlyToClinic selectedClinic={selectedClinic} />

                {/* Map Click Listener & Move Listener */}
                <MapEventsHandler
                    setPosition={setPosition}
                    setHasLocation={setHasLocation}
                    fetchNearbyClinics={fetchNearbyClinics}
                    setMapCenter={setMapCenter}
                    setShowSearchBtn={setShowSearchBtn}
                    position={position}
                />

                {/* User Marker (Draggable) */}
                {hasLocation && (
                    <Marker
                        position={position}
                        icon={userIcon}
                        draggable={true}
                        eventHandlers={{
                            dragend: (e) => {
                                const marker = e.target;
                                const pos = marker.getLatLng();
                                setPosition([pos.lat, pos.lng]);
                                fetchNearbyClinics(pos.lat, pos.lng);
                            },
                        }}
                    >
                        <Popup>
                            <div className="p-1">
                                <p className="font-bold text-gray-900 mb-0.5 text-center">Your Point 📍</p>
                                <p className="text-[10px] text-rose-500 uppercase tracking-widest font-black text-center">Drag to Change Search Area</p>
                            </div>
                        </Popup>
                    </Marker>
                )}

                {/* Clinic Markers */}
                {clinics.map((clinic) => (
                    <Marker key={clinic.id} position={[clinic.lat, clinic.lon]} icon={roseIcon}>
                        <Popup className="premium-popup">
                            <div className="p-2 min-w-[150px]">
                                <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-1">{clinic.type}</p>
                                <h3 className="font-bold text-gray-900 mb-2 leading-tight">{clinic.name}</h3>
                                <a
                                    href={`https://www.google.com/maps?q=${clinic.lat},${clinic.lon}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="block text-center bg-rose-50 text-rose-600 font-bold text-[11px] py-2 rounded-xl border border-rose-100 hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                                >
                                    Open in Google Maps →
                                </a>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
}
