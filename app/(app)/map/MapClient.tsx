"use client";

import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const iconUrl = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png";
const iconRetinaUrl = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png";
const shadowUrl = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png";

const DefaultIcon = new L.Icon({
  iconUrl,
  iconRetinaUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

type MapPoint = {
  _id: string;
  title: string;
  shortDescription?: string;
  description?: string;
  category?: string;
  latitude: number;
  longitude: number;
};

export default function MapClient({ points }: { points: MapPoint[] }) {
  return (
    <MapContainer
      center={[45.9432, 24.9668]}
      zoom={6}
      style={{ height: "100%", width: "100%" }}
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {points.map((p) => (
        <Marker key={p._id} position={[p.latitude, p.longitude]} icon={DefaultIcon}>
          <Popup>
            <strong>{p.title}</strong>
            <div style={{ fontSize: "12px", marginTop: 4 }}>
              {p.shortDescription || p.description || p.category || ""}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
