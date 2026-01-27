"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import { useRouter } from "next/navigation";
import "leaflet/dist/leaflet.css";
import styles from "./map.module.css";

const MapContainer = dynamic(
  () => import("react-leaflet").then(m => m.MapContainer),
  { ssr: false }
);

const TileLayer = dynamic(
  () => import("react-leaflet").then(m => m.TileLayer),
  { ssr: false }
);

const Marker = dynamic(
  () => import("react-leaflet").then(m => m.Marker),
  { ssr: false }
);


const iconUrl = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png";
const iconRetinaUrl = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png";
const shadowUrl = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png";

const getDefaultIcon = () => {
  if (typeof window === "undefined") return undefined;
  const L = window.L;
  if (!L?.Icon) return undefined;
  return new L.Icon({
    iconUrl,
    iconRetinaUrl,
    shadowUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });
};

type MapPoint = {
  _id: string;
  title: string;
  shortDescription?: string;
  description?: string;
  category?: string;
  latitude: number;
  longitude: number;
  host?: {
    profileImage?: string;
    avatar?: string;
    profilePhoto?: string;
    name?: string;
  };
};

export default function MapClient({ points }: { points: MapPoint[] }) {
  const router = useRouter();
  const defaultIcon = getDefaultIcon();
  const safePoints = useMemo(() => {
    return (points || []).filter((p) => {
      const lat = Number(p.latitude);
      const lng = Number(p.longitude);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return false;
      if (lat < -90 || lat > 90) return false;
      if (lng < -180 || lng > 180) return false;
      return true;
    });
  }, [points]);
  const markerIcon = useMemo(() => {
    if (typeof window === "undefined") return null;
    const L = window.L;
    if (!L?.divIcon) return null;
    return (imageUrl?: string) =>
      L.divIcon({
        className: styles.avatarMarker,
        html: `<div class="${styles.avatarRing}">${
          imageUrl
            ? `<img class="${styles.avatarImage}" src="${imageUrl}" alt="Host avatar" />`
            : `<span class="${styles.avatarFallback}">👤</span>`
        }</div>`,
        iconSize: [44, 44],
        iconAnchor: [22, 22],
      });
  }, []);
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
      {safePoints.map((p) => (
        <Marker
          key={p._id}
          position={[p.latitude, p.longitude]}
          icon={markerIcon ? markerIcon(p.host?.profileImage || p.host?.avatar || p.host?.profilePhoto) : defaultIcon}
          eventHandlers={{
            click: () => router.push(`/experiences/${p._id}`),
          }}
        />
      ))}
    </MapContainer>
  );
}
