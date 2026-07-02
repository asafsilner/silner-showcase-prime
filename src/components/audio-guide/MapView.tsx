import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { AudioGuidePOI } from "@/data/telAvivAudioGuide";

interface MapViewProps {
  pois: AudioGuidePOI[];
  userPosition: [number, number] | null;
  visitedIds: Set<string>;
  activePoiId: string | null;
  onSelectPoi: (id: string) => void;
}

const JAFFA_CENTER: [number, number] = [32.0545, 34.7515];

function poiIcon(isVisited: boolean, isActive: boolean) {
  const bg = isActive ? "#fbbf24" : isVisited ? "#22c55e" : "#eab308";
  const scale = isActive ? "scale(1.25)" : "scale(1)";
  return L.divIcon({
    className: "audio-guide-poi-marker",
    html: `<div style="
      width:16px;height:16px;border-radius:9999px;background:${bg};
      border:2px solid rgba(20,20,20,0.85);
      box-shadow:0 0 0 3px rgba(0,0,0,0.25);
      transform:${scale};
    "></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
}

const userIcon = L.divIcon({
  className: "audio-guide-user-marker",
  html: `<div style="position:relative;width:18px;height:18px;">
      <div style="position:absolute;inset:0;border-radius:9999px;background:#3b82f6;opacity:0.35;animation:audioGuidePulse 1.8s ease-out infinite;"></div>
      <div style="position:absolute;inset:4px;border-radius:9999px;background:#3b82f6;border:2px solid white;"></div>
    </div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

export default function MapView({ pois, userPosition, visitedIds, activePoiId, onSelectPoi }: MapViewProps) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const userMarkerRef = useRef<L.Marker | null>(null);
  const hasCenteredOnUser = useRef(false);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      zoomControl: false,
      attributionControl: true,
    }).setView(JAFFA_CENTER, 15);

    L.control.zoom({ position: "bottomleft" }).addTo(map);

    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;
    const markers = markersRef.current;

    return () => {
      map.remove();
      mapRef.current = null;
      markers.clear();
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    pois.forEach((poi) => {
      const isVisited = visitedIds.has(poi.id);
      const isActive = activePoiId === poi.id;
      const existing = markersRef.current.get(poi.id);
      const icon = poiIcon(isVisited, isActive);

      if (existing) {
        existing.setIcon(icon);
      } else {
        const marker = L.marker(poi.coords, { icon }).addTo(map);
        marker.on("click", () => onSelectPoi(poi.id));
        markersRef.current.set(poi.id, marker);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pois, visitedIds, activePoiId]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !userPosition) return;

    if (!userMarkerRef.current) {
      userMarkerRef.current = L.marker(userPosition, { icon: userIcon, zIndexOffset: 1000 }).addTo(map);
    } else {
      userMarkerRef.current.setLatLng(userPosition);
    }

    if (!hasCenteredOnUser.current) {
      map.setView(userPosition, 17);
      hasCenteredOnUser.current = true;
    }
  }, [userPosition]);

  useEffect(() => {
    const map = mapRef.current;
    const poi = pois.find((p) => p.id === activePoiId);
    if (map && poi) {
      map.panTo(poi.coords);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePoiId]);

  return <div ref={containerRef} className="absolute inset-0" />;
}
