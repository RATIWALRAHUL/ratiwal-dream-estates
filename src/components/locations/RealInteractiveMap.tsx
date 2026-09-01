"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  MapPin,
  Plane,
  Building2,
  Train,
  Milestone,
  Briefcase,
  ExternalLink,
  Layers,
  Crosshair,
  ShieldCheck,
  ArrowRight,
  Maximize2,
  Minimize2,
  Navigation2,
  Eye,
  CheckCircle2,
} from "lucide-react";
import { Landmark, LandmarkCategory, primeLandmarks } from "@/data/landmarks";
import { Location } from "@/types/location";
import "leaflet/dist/leaflet.css";

interface RealInteractiveMapProps {
  locations: Location[];
  initialLocationSlug?: string;
  onSelectLocation?: (slug: string) => void;
}

type TileLayerType = "voyager" | "positron" | "satellite" | "osm";

const TILE_LAYERS: Record<TileLayerType, { name: string; url: string; attribution: string; maxZoom: number }> = {
  voyager: {
    name: "Urban Carto",
    url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
    attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19,
  },
  positron: {
    name: "Clean Light",
    url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19,
  },
  satellite: {
    name: "Satellite Hybrid",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
    maxZoom: 18,
  },
  osm: {
    name: "OpenStreetMap",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
  },
};

const REGION_BOUNDS: Record<string, { center: [number, number]; zoom: number; label: string }> = {
  all: { center: [23.5, 74.5], zoom: 6, label: "All Regions" },
  jaipur: { center: [26.85, 75.75], zoom: 12, label: "Jaipur Corridor" },
  "navi-mumbai": { center: [19.00, 73.08], zoom: 12, label: "Navi Mumbai (MMR)" },
  ajmer: { center: [26.47, 74.65], zoom: 12, label: "Ajmer-Pushkar" },
  bhiwadi: { center: [28.21, 76.86], zoom: 12, label: "Bhiwadi (NCR)" },
};

export function RealInteractiveMap({
  locations,
  initialLocationSlug,
  onSelectLocation,
}: RealInteractiveMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersLayerGroupRef = useRef<any>(null);
  const tileLayerRef = useRef<any>(null);

  const [activeCategory, setActiveCategory] = useState<LandmarkCategory | "all">("all");
  const [activeRegion, setActiveRegion] = useState<string>(initialLocationSlug || "all");
  const [activeTile, setActiveTile] = useState<TileLayerType>("voyager");
  const [selectedLandmark, setSelectedLandmark] = useState<Landmark | null>(primeLandmarks[0]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);

  // Filter landmarks based on active category and region
  const filteredLandmarks = primeLandmarks.filter((item) => {
    const categoryMatch = activeCategory === "all" || item.category === activeCategory;
    if (activeRegion === "all") return categoryMatch;
    if (activeRegion === "jaipur") return categoryMatch && item.city === "Jaipur";
    if (activeRegion === "navi-mumbai") return categoryMatch && item.city === "Navi Mumbai";
    if (activeRegion === "ajmer") return categoryMatch && item.city === "Ajmer";
    if (activeRegion === "bhiwadi") return categoryMatch && item.city === "Bhiwadi";
    return categoryMatch;
  });

  // Initialize Leaflet Map
  useEffect(() => {
    let isMounted = true;

    async function initLeaflet() {
      if (!mapContainerRef.current || mapInstanceRef.current) return;

      const L = (await import("leaflet")).default;

      if (!isMounted || !mapContainerRef.current) return;

      const initial = REGION_BOUNDS[activeRegion] || REGION_BOUNDS.all;

      const map = L.map(mapContainerRef.current, {
        center: initial.center,
        zoom: initial.zoom,
        zoomControl: false,
        attributionControl: true,
        scrollWheelZoom: false,
      });

      // Add Tile Layer
      const currentTile = TILE_LAYERS[activeTile];
      const tileLayer = L.tileLayer(currentTile.url, {
        attribution: currentTile.attribution,
        maxZoom: currentTile.maxZoom,
        subdomains: "abcd",
      }).addTo(map);

      tileLayerRef.current = tileLayer;

      // Add Zoom Control at bottom-right
      L.control.zoom({ position: "bottomright" }).addTo(map);

      // Create LayerGroup for markers
      const markersGroup = L.layerGroup().addTo(map);
      markersLayerGroupRef.current = markersGroup;
      mapInstanceRef.current = map;

      setIsMapReady(true);
    }

    initLeaflet();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Tile Layer
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;
    import("leaflet").then((L) => {
      mapInstanceRef.current.removeLayer(tileLayerRef.current);
      const currentTile = TILE_LAYERS[activeTile];
      const newLayer = L.tileLayer(currentTile.url, {
        attribution: currentTile.attribution,
        maxZoom: currentTile.maxZoom,
        subdomains: "abcd",
      }).addTo(mapInstanceRef.current);
      tileLayerRef.current = newLayer;
    });
  }, [activeTile]);

  // Render & Update Markers when filters change
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerGroupRef.current || !isMapReady) return;

    import("leaflet").then((L) => {
      const markersGroup = markersLayerGroupRef.current;
      markersGroup.clearLayers();

      filteredLandmarks.forEach((landmark) => {
        const isProperty = landmark.category === "property";
        const isSelected = selectedLandmark?.id === landmark.id;

        // Custom HTML Pin Markup
        let pinHtml = "";

        if (isProperty) {
          pinHtml = `
            <div class="group relative flex items-center justify-center cursor-pointer transition-transform duration-300 ${isSelected ? "scale-115 z-50" : "hover:scale-110 z-30"}">
              <div class="relative flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#071a28] border-2 ${isSelected ? "border-[#24D17F] shadow-[0_0_20px_rgba(36,209,127,0.6)]" : "border-[#52BDE9] shadow-[0_6px_18px_rgba(7,26,40,0.4)]"} text-white">
                <span class="w-2 h-2 rounded-full bg-[#24D17F] animate-pulse"></span>
                <span class="text-[11px] font-bold tracking-tight whitespace-nowrap">${landmark.name.split("—")[0].trim()}</span>
              </div>
              <div class="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] border-t-[#071a28]"></div>
            </div>
          `;
        } else {
          // Landmark Icons
          let iconSvg = "";
          let bgClass = "bg-[#0784C8]";
          let ringColor = "rgba(7,132,200,0.3)";

          if (landmark.category === "airport") {
            bgClass = "bg-[#087fc3]";
            ringColor = "rgba(8,127,195,0.4)";
            iconSvg = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/></svg>`;
          } else if (landmark.category === "hospital") {
            bgClass = "bg-[#e11d48]";
            ringColor = "rgba(225,29,72,0.4)";
            iconSvg = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 6v12"/><path d="M6 12h12"/><rect width="18" height="18" x="3" y="3" rx="2"/></svg>`;
          } else if (landmark.category === "station") {
            bgClass = "bg-[#059669]";
            ringColor = "rgba(5,150,105,0.4)";
            iconSvg = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="16" x="4" y="4" rx="2"/><path d="M4 10h16"/><path d="M12 4v6"/><path d="m8 19-2 3"/><path d="m16 19 2 3"/><path d="M9 15h.01"/><path d="M15 15h.01"/></svg>`;
          } else if (landmark.category === "expressway") {
            bgClass = "bg-[#d97706]";
            ringColor = "rgba(217,119,6,0.4)";
            iconSvg = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m4 6 5 12"/><path d="m20 6-5 12"/><path d="M12 6v2"/><path d="M12 12v2"/><path d="M12 18v2"/></svg>`;
          } else {
            bgClass = "bg-[#7c3aed]";
            ringColor = "rgba(124,58,237,0.4)";
            iconSvg = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>`;
          }

          pinHtml = `
            <div class="relative flex items-center justify-center cursor-pointer transition-transform duration-300 ${isSelected ? "scale-125 z-40" : "hover:scale-110 z-20"}">
              <div class="w-8 h-8 rounded-full ${bgClass} text-white flex items-center justify-center border-2 border-white shadow-[0_4px_12px_${ringColor}]">
                ${iconSvg}
              </div>
            </div>
          `;
        }

        const customIcon = L.divIcon({
          className: "custom-leaflet-marker",
          html: pinHtml,
          iconSize: isProperty ? [160, 36] : [32, 32],
          iconAnchor: isProperty ? [80, 18] : [16, 16],
          popupAnchor: [0, -18],
        });

        const marker = L.marker([landmark.coordinates.latitude, landmark.coordinates.longitude], {
          icon: customIcon,
          title: landmark.name,
        });

        // Popup Content
        const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${landmark.coordinates.latitude},${landmark.coordinates.longitude}`;
        const popupContent = `
          <div style="font-family: var(--font-sans, sans-serif); min-width: 220px; padding: 4px;">
            <div style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: #0784C8; letter-spacing: 0.05em; margin-bottom: 2px;">
              ${landmark.categoryLabel} • ${landmark.city}
            </div>
            <div style="font-size: 14px; font-weight: 700; color: #071a28; line-height: 1.25; margin-bottom: 6px;">
              ${landmark.name}
            </div>
            <div style="font-size: 11.5px; color: #4a6171; line-height: 1.4; margin-bottom: 8px;">
              ${landmark.description}
            </div>
            ${landmark.highlight ? `
              <div style="font-size: 10.5px; font-weight: 600; color: #10854d; background: rgba(36,209,127,0.12); padding: 4px 8px; border-radius: 6px; margin-bottom: 8px;">
                ${landmark.highlight}
              </div>
            ` : ""}
            <div style="display: flex; gap: 8px; align-items: center; justify-content: space-between; border-top: 1px solid #eef2f6; padding-top: 8px; margin-top: 6px;">
              <a href="${googleMapsUrl}" target="_blank" rel="noopener noreferrer" style="font-size: 11px; font-weight: 700; color: #0784C8; text-decoration: none; display: inline-flex; align-items: center; gap: 4px;">
                Google Maps ↗
              </a>
              ${landmark.propertySlug ? `
                <a href="/properties/${landmark.propertySlug}" style="font-size: 11px; font-weight: 700; color: #ffffff; background: #071a28; padding: 4px 10px; border-radius: 999px; text-decoration: none;">
                  View Plot Details →
                </a>
              ` : ""}
            </div>
          </div>
        `;

        marker.bindPopup(popupContent, {
          closeButton: true,
          className: "custom-leaflet-popup",
        });

        marker.on("click", () => {
          setSelectedLandmark(landmark);
          if (landmark.propertySlug && onSelectLocation) {
            onSelectLocation(landmark.city.toLowerCase());
          }
        });

        markersGroup.addLayer(marker);
      });
    });
  }, [filteredLandmarks, selectedLandmark, isMapReady, onSelectLocation]);

  // Handle Region Change & Fly To
  const handleRegionSelect = (regionKey: string) => {
    setActiveRegion(regionKey);
    if (!mapInstanceRef.current) return;
    const target = REGION_BOUNDS[regionKey] || REGION_BOUNDS.all;
    mapInstanceRef.current.flyTo(target.center, target.zoom, {
      duration: 1.4,
      easeLinearity: 0.25,
    });
  };

  // Focus on Selected Landmark
  const handleFocusLandmark = (item: Landmark) => {
    setSelectedLandmark(item);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([item.coordinates.latitude, item.coordinates.longitude], 14, {
        duration: 1.2,
      });
    }
  };

  const categories: { id: LandmarkCategory | "all"; label: string; icon: React.ReactNode; count: number }[] = [
    { id: "all", label: "All Prime Points", icon: <Layers size={14} />, count: primeLandmarks.length },
    { id: "property", label: "Verified Plots", icon: <Building2 size={14} className="text-[#24D17F]" />, count: primeLandmarks.filter((l) => l.category === "property").length },
    { id: "airport", label: "Airports", icon: <Plane size={14} className="text-[#52BDE9]" />, count: primeLandmarks.filter((l) => l.category === "airport").length },
    { id: "hospital", label: "Hospitals", icon: <Crosshair size={14} className="text-[#f43f5e]" />, count: primeLandmarks.filter((l) => l.category === "hospital").length },
    { id: "station", label: "Rail & Metro", icon: <Train size={14} className="text-[#10b981]" />, count: primeLandmarks.filter((l) => l.category === "station").length },
    { id: "expressway", label: "Expressways", icon: <Milestone size={14} className="text-[#f59e0b]" />, count: primeLandmarks.filter((l) => l.category === "expressway").length },
    { id: "commercial", label: "SEZs & IT Hubs", icon: <Briefcase size={14} className="text-[#a855f7]" />, count: primeLandmarks.filter((l) => l.category === "commercial").length },
  ];

  return (
    <section className="relative w-full" aria-labelledby="market-navigator-heading">
      {/* Top Map Filter & Layer Control Bar */}
      <div className="bg-white rounded-t-2xl p-4 sm:p-5 border-b border-[rgba(7,26,40,0.08)] flex flex-col gap-4">
        {/* Row 1: Region Clusters & Map Tile Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Region Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-bold text-[#071a28] uppercase tracking-wider mr-1 hidden sm:inline">
              Corridor Focus:
            </span>
            {Object.entries(REGION_BOUNDS).map(([key, val]) => (
              <button
                key={key}
                type="button"
                onClick={() => handleRegionSelect(key)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                  activeRegion === key
                    ? "bg-[#071a28] text-white shadow-sm"
                    : "bg-[#F5F1E9] text-[#4a6171] hover:bg-[#e6ebf0] hover:text-[#071a28]"
                }`}
              >
                {val.label}
              </button>
            ))}
          </div>

          {/* Map Layer Switcher & Fullscreen */}
          <div className="flex items-center gap-2">
            <div className="inline-flex rounded-lg bg-[#F5F1E9] p-1 border border-[rgba(7,26,40,0.06)]">
              {(Object.keys(TILE_LAYERS) as TileLayerType[]).map((tileKey) => (
                <button
                  key={tileKey}
                  type="button"
                  onClick={() => setActiveTile(tileKey)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold capitalize transition-all ${
                    activeTile === tileKey
                      ? "bg-white text-[#0784C8] shadow-xs"
                      : "text-[#647581] hover:text-[#071a28]"
                  }`}
                >
                  {TILE_LAYERS[tileKey].name}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 rounded-lg bg-[#F5F1E9] hover:bg-[#e6ebf0] text-[#071a28] transition-colors"
              aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen map"}
            >
              {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>
          </div>
        </div>

        {/* Row 2: Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                activeCategory === cat.id
                  ? "bg-[#0784C8] text-white shadow-xs"
                  : "bg-white text-[#4a6171] border border-[rgba(7,26,40,0.1)] hover:border-[#0784C8] hover:text-[#0784C8]"
              }`}
            >
              {cat.icon}
              <span>{cat.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                  activeCategory === cat.id ? "bg-white/20 text-white" : "bg-[#F5F1E9] text-[#647581]"
                }`}
              >
                {cat.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Map Stage Grid */}
      <div className={`grid grid-cols-1 lg:grid-cols-12 ${isFullscreen ? "fixed inset-0 z-[9999] bg-white h-screen" : "relative min-h-[540px] sm:min-h-[600px]"}`}>
        {/* Leaflet Canvas Container */}
        <div className={`${isFullscreen ? "lg:col-span-8 h-full" : "lg:col-span-8 h-[440px] sm:h-[520px] lg:h-[620px]"} relative bg-[#eef2f5] overflow-hidden`}>
          <div ref={mapContainerRef} className="w-full h-full z-10" />

          {/* Map Overlay Quick Guide Badge */}
          <div className="absolute top-4 left-4 z-20 pointer-events-none hidden sm:flex items-center gap-2 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-[rgba(7,26,40,0.1)] shadow-sm text-xs font-semibold text-[#071a28]">
            <Navigation2 size={13} className="text-[#0784C8]" />
            <span>Interactive GIS Explorer • Click pins for details &amp; routes</span>
          </div>
        </div>

        {/* Right Info Dock: Selected Location & Landmark Details */}
        <div className={`${isFullscreen ? "lg:col-span-4 h-full" : "lg:col-span-4"} bg-white p-5 sm:p-6 lg:p-7 border-t lg:border-t-0 lg:border-l border-[rgba(7,26,40,0.08)] flex flex-col justify-between overflow-y-auto max-h-[620px]`}>
          {selectedLandmark ? (
            <div className="space-y-4">
              {/* Category & Region Pill */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[rgba(7,132,200,0.08)] text-[#0784C8]">
                  {selectedLandmark.categoryLabel}
                </span>
                <span className="text-xs text-[#667d8f] font-mono">
                  {selectedLandmark.city}, {selectedLandmark.region}
                </span>
              </div>

              {/* Title & Price */}
              <div>
                <h3 className="font-heading text-xl sm:text-2xl text-[#071a28] font-bold leading-tight mb-1">
                  {selectedLandmark.name}
                </h3>
                {selectedLandmark.priceLabel && (
                  <p className="text-sm font-bold text-[#10854d]">
                    {selectedLandmark.priceLabel}
                  </p>
                )}
              </div>

              {/* Thumbnail Image for Properties */}
              {selectedLandmark.imageUrl && (
                <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden bg-[#eef2f5] border border-[rgba(7,26,40,0.08)]">
                  <Image
                    src={selectedLandmark.imageUrl}
                    alt={selectedLandmark.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover"
                  />
                  {selectedLandmark.propertyType && (
                    <span className="absolute bottom-2 left-2 text-[10.5px] font-bold px-2 py-0.5 rounded-md bg-[#071a28]/80 text-white backdrop-blur-xs">
                      {selectedLandmark.propertyType}
                    </span>
                  )}
                </div>
              )}

              {/* Description */}
              <p className="text-xs sm:text-sm text-[#4a6171] leading-relaxed">
                {selectedLandmark.description}
              </p>

              {/* Highlight Badge */}
              {selectedLandmark.highlight && (
                <div className="p-3 rounded-xl bg-[#F5F1E9] border border-[rgba(7,26,40,0.06)] flex items-start gap-2 text-xs text-[#071a28] font-medium">
                  <ShieldCheck size={16} className="text-[#0784C8] flex-shrink-0 mt-0.5" />
                  <span>{selectedLandmark.highlight}</span>
                </div>
              )}

              {/* Coordinates */}
              <div className="flex items-center justify-between text-xs text-[#647581] font-mono py-2 border-y border-[rgba(7,26,40,0.06)]">
                <span>GPS Lat/Long:</span>
                <span>
                  {selectedLandmark.coordinates.latitude.toFixed(4)}° N, {selectedLandmark.coordinates.longitude.toFixed(4)}° E
                </span>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                {selectedLandmark.propertySlug ? (
                  <Link
                    href={`/properties/${selectedLandmark.propertySlug}`}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full bg-[#071a28] hover:bg-[#0784C8] text-white text-xs font-bold tracking-wide transition-all shadow-sm"
                  >
                    <span>View Plot Dossier</span>
                    <ArrowRight size={14} />
                  </Link>
                ) : (
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${selectedLandmark.coordinates.latitude},${selectedLandmark.coordinates.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full bg-[#071a28] hover:bg-[#0784C8] text-white text-xs font-bold tracking-wide transition-all shadow-sm"
                  >
                    <span>Open in Google Maps</span>
                    <ExternalLink size={13} />
                  </a>
                )}

                <button
                  type="button"
                  onClick={() => handleFocusLandmark(selectedLandmark)}
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-full border border-[rgba(7,26,40,0.15)] text-[#071a28] hover:bg-[#F5F1E9] text-xs font-bold transition-colors"
                >
                  <Eye size={14} />
                  <span>Center Pin</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-[#647581]">
              <MapPin size={28} className="mx-auto mb-2 text-[#0784C8] opacity-50" />
              <p className="text-sm font-semibold">Select any pin on the map to inspect details.</p>
            </div>
          )}

          {/* Quick List of Visible Pins */}
          <div className="mt-6 pt-4 border-t border-[rgba(7,26,40,0.08)]">
            <span className="text-[11px] font-bold text-[#647581] uppercase tracking-wider block mb-2">
              Corridor Landmarks ({filteredLandmarks.length})
            </span>
            <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1 text-xs">
              {filteredLandmarks.map((lm) => (
                <button
                  key={lm.id}
                  type="button"
                  onClick={() => handleFocusLandmark(lm)}
                  className={`w-full text-left p-2 rounded-lg flex items-center justify-between transition-colors ${
                    selectedLandmark?.id === lm.id
                      ? "bg-[rgba(7,132,200,0.1)] text-[#0784C8] font-bold"
                      : "hover:bg-[#F5F1E9] text-[#4a6171]"
                  }`}
                >
                  <span className="truncate pr-2">{lm.name}</span>
                  <span className="text-[10px] font-mono uppercase text-[#647581] flex-shrink-0">
                    {lm.category}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
