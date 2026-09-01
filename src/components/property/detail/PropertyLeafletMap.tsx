"use client";

import React, { useEffect, useRef, useState } from "react";
import { Property } from "@/types/property";
import { primeLandmarks } from "@/data/landmarks";
import { Navigation, ExternalLink, MapPin, Building2, Layers } from "lucide-react";
import "leaflet/dist/leaflet.css";

interface PropertyLeafletMapProps {
  property: Property;
}

export function PropertyLeafletMap({ property }: PropertyLeafletMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [activeLayer, setActiveLayer] = useState<"voyager" | "satellite">("voyager");

  const coords = property.coordinates || { latitude: 26.8428, longitude: 75.6415 };
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${coords.latitude},${coords.longitude}`;

  // Find nearby landmarks in the same city/state
  const nearbyLandmarks = primeLandmarks.filter(
    (l) => (l.city === property.city || l.region === property.state) && l.id !== `prop-${property.slug}`
  );

  useEffect(() => {
    let isMounted = true;

    async function initMap() {
      if (!mapContainerRef.current || mapInstanceRef.current) return;
      const L = (await import("leaflet")).default;
      if (!isMounted || !mapContainerRef.current) return;

      const map = L.map(mapContainerRef.current, {
        center: [coords.latitude, coords.longitude],
        zoom: 13,
        zoomControl: false,
        scrollWheelZoom: false,
      });

      const tileUrl =
        activeLayer === "satellite"
          ? "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";

      L.tileLayer(tileUrl, {
        attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap',
        maxZoom: 19,
        subdomains: "abcd",
      }).addTo(map);

      L.control.zoom({ position: "bottomright" }).addTo(map);

      // Property Pin
      const propPinHtml = `
        <div class="relative flex items-center justify-center cursor-pointer scale-110">
          <div class="relative flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#071a28] border-2 border-[#24D17F] shadow-[0_0_22px_rgba(36,209,127,0.7)] text-white">
            <span class="w-2 h-2 rounded-full bg-[#24D17F] animate-pulse"></span>
            <span class="text-[11px] font-bold tracking-tight whitespace-nowrap">${property.name.split("—")[0].trim()}</span>
          </div>
          <div class="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] border-t-[#071a28]"></div>
        </div>
      `;

      const propIcon = L.divIcon({
        className: "custom-leaflet-marker",
        html: propPinHtml,
        iconSize: [160, 36],
        iconAnchor: [80, 18],
        popupAnchor: [0, -18],
      });

      const propMarker = L.marker([coords.latitude, coords.longitude], {
        icon: propIcon,
        title: property.name,
      }).addTo(map);

      propMarker.bindPopup(`
        <div style="font-family: var(--font-sans, sans-serif); min-width: 220px; padding: 4px;">
          <div style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: #24D17F; letter-spacing: 0.05em; margin-bottom: 2px;">
            Verified Property • ${property.city}
          </div>
          <div style="font-size: 13.5px; font-weight: 700; color: #071a28; margin-bottom: 4px;">
            ${property.name}
          </div>
          <div style="font-size: 11px; color: #4a6171; margin-bottom: 6px;">
            ${property.location}
          </div>
          <a href="${googleMapsUrl}" target="_blank" rel="noopener noreferrer" style="font-size: 11px; font-weight: 700; color: #0784C8; text-decoration: none;">
            Open in Google Maps ↗
          </a>
        </div>
      `).openPopup();

      // Surrounding Landmarks (Airports, Hospitals, Stations, Expressways)
      nearbyLandmarks.forEach((lm) => {
        let bgClass = "bg-[#0784C8]";
        let iconSvg = "";

        if (lm.category === "airport") {
          bgClass = "bg-[#087fc3]";
          iconSvg = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/></svg>`;
        } else if (lm.category === "hospital") {
          bgClass = "bg-[#e11d48]";
          iconSvg = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 6v12"/><path d="M6 12h12"/><rect width="18" height="18" x="3" y="3" rx="2"/></svg>`;
        } else if (lm.category === "station") {
          bgClass = "bg-[#059669]";
          iconSvg = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="16" height="16" x="4" y="4" rx="2"/><path d="M4 10h16"/><path d="M12 4v6"/><path d="m8 19-2 3"/><path d="m16 19 2 3"/><path d="M9 15h.01"/><path d="M15 15h.01"/></svg>`;
        } else {
          bgClass = "bg-[#d97706]";
          iconSvg = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m4 6 5 12"/><path d="m20 6-5 12"/><path d="M12 6v2"/><path d="M12 12v2"/><path d="M12 18v2"/></svg>`;
        }

        const landmarkPinHtml = `
          <div class="relative flex items-center justify-center cursor-pointer hover:scale-115 transition-transform duration-200">
            <div class="w-7 h-7 rounded-full ${bgClass} text-white flex items-center justify-center border-2 border-white shadow-md">
              ${iconSvg}
            </div>
          </div>
        `;

        const lmIcon = L.divIcon({
          className: "custom-leaflet-marker",
          html: landmarkPinHtml,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
          popupAnchor: [0, -14],
        });

        const lmMarker = L.marker([lm.coordinates.latitude, lm.coordinates.longitude], {
          icon: lmIcon,
          title: lm.name,
        }).addTo(map);

        lmMarker.bindPopup(`
          <div style="font-family: var(--font-sans, sans-serif); min-width: 200px; padding: 4px;">
            <div style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: #0784C8; margin-bottom: 2px;">
              ${lm.categoryLabel}
            </div>
            <div style="font-size: 13px; font-weight: 700; color: #071a28; margin-bottom: 4px;">
              ${lm.name}
            </div>
            <div style="font-size: 11px; color: #4a6171;">
              ${lm.description}
            </div>
          </div>
        `);
      });

      mapInstanceRef.current = map;
    }

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [activeLayer, coords.latitude, coords.longitude, googleMapsUrl, nearbyLandmarks, property.city, property.location, property.name]);

  return (
    <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden border border-[rgba(7,26,40,0.1)] bg-[#eef2f5] mb-6 shadow-sm">
      <div ref={mapContainerRef} className="w-full h-full z-10" />

      {/* Layer Toggle */}
      <div className="absolute top-3 right-3 z-20 flex items-center bg-white/90 backdrop-blur-md p-1 rounded-lg border border-[rgba(7,26,40,0.12)] shadow-xs">
        <button
          type="button"
          onClick={() => setActiveLayer("voyager")}
          className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
            activeLayer === "voyager" ? "bg-[#071a28] text-white shadow-xs" : "text-[#4a6171] hover:text-[#071a28]"
          }`}
        >
          Street Map
        </button>
        <button
          type="button"
          onClick={() => setActiveLayer("satellite")}
          className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
            activeLayer === "satellite" ? "bg-[#071a28] text-white shadow-xs" : "text-[#4a6171] hover:text-[#071a28]"
          }`}
        >
          Satellite
        </button>
      </div>

      {/* Nearby Count Overlay */}
      <div className="absolute bottom-3 left-3 z-20 pointer-events-none hidden sm:flex items-center gap-2 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-[rgba(7,26,40,0.1)] shadow-xs text-xs font-semibold text-[#071a28]">
        <Building2 size={13} className="text-[#24D17F]" />
        <span>{property.name.split("—")[0]} &amp; {nearbyLandmarks.length} Regional Hubs Mapped</span>
      </div>
    </div>
  );
}
