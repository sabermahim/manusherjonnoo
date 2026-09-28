import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { HelpRequest } from '../types/index.ts';

interface InteractiveMapProps {
  requests?: HelpRequest[];
  selectedRequestId?: number | null;
  onSelectRequest?: (id: number) => void;
  height?: string;
  isSelectMode?: boolean;
  selectedCoordinates?: { lat: number; lng: number } | null;
  onCoordinateSelect?: (coords: { lat: number; lng: number }) => void;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  requests = [],
  selectedRequestId,
  onSelectRequest,
  height = '500px',
  isSelectMode = false,
  selectedCoordinates,
  onCoordinateSelect,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const selectionMarkerRef = useRef<L.Marker | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Center in Dhaka
    const initialLat = selectedCoordinates?.lat || 23.8103;
    const initialLng = selectedCoordinates?.lng || 90.4125;

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: 12,
      scrollWheelZoom: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | মানুষের জন্য',
    }).addTo(map);

    const markersGroup = L.layerGroup().addTo(map);
    markersLayerRef.current = markersGroup;
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Handle map click for selection mode
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const handleClick = (e: L.LeafletMouseEvent) => {
      if (isSelectMode && onCoordinateSelect) {
        onCoordinateSelect({ lat: e.latlng.lat, lng: e.latlng.lng });
      }
    };

    map.on('click', handleClick);
    return () => {
      map.off('click', handleClick);
    };
  }, [isSelectMode, onCoordinateSelect]);

  // Update selection marker
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (selectionMarkerRef.current) {
      map.removeLayer(selectionMarkerRef.current);
      selectionMarkerRef.current = null;
    }

    if (isSelectMode && selectedCoordinates) {
      const pinHtml = `
        <div class="relative flex items-center justify-center">
          <div class="w-8 h-8 rounded-full bg-emerald-600 border-4 border-white shadow-xl flex items-center justify-center text-white text-xs font-bold animate-bounce">
            📍
          </div>
          <span class="absolute -bottom-6 px-2 py-0.5 bg-slate-800 text-white text-[11px] rounded-md whitespace-nowrap shadow font-medium">
            নির্বাচিত স্থান
          </span>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-selection-pin',
        html: pinHtml,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([selectedCoordinates.lat, selectedCoordinates.lng], {
        icon: customIcon,
      }).addTo(map);
      selectionMarkerRef.current = marker;

      map.panTo([selectedCoordinates.lat, selectedCoordinates.lng]);
    }
  }, [isSelectMode, selectedCoordinates]);

  // Render Help Request Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersLayerRef.current;
    if (!map || !markersGroup || isSelectMode) return;

    markersGroup.clearLayers();

    const getCategoryTheme = (cat: string, urgency: string) => {
      if (urgency === 'জরুরি') {
        return {
          bg: 'bg-rose-600',
          border: 'border-rose-200',
          text: 'text-rose-600',
          pulse: true,
          emoji: '🚨',
        };
      }
      switch (cat) {
        case 'শিক্ষা সহায়তা':
          return { bg: 'bg-indigo-600', border: 'border-indigo-200', text: 'text-indigo-600', pulse: false, emoji: '📚' };
        case 'খাবার':
          return { bg: 'bg-amber-600', border: 'border-amber-200', text: 'text-amber-600', pulse: false, emoji: '🍲' };
        case 'পোশাক':
          return { bg: 'bg-purple-600', border: 'border-purple-200', text: 'text-purple-600', pulse: false, emoji: '👕' };
        case 'চিকিৎসা সহায়তা':
          return { bg: 'bg-emerald-600', border: 'border-emerald-200', text: 'text-emerald-600', pulse: false, emoji: '🩺' };
        case 'বাসস্থান সহায়তা':
          return { bg: 'bg-cyan-600', border: 'border-cyan-200', text: 'text-cyan-600', pulse: false, emoji: '🏠' };
        default:
          return { bg: 'bg-emerald-600', border: 'border-emerald-200', text: 'text-emerald-600', pulse: false, emoji: '🤝' };
      }
    };

    requests.forEach((req) => {
      if (!req.approxLat || !req.approxLng) return;

      const theme = getCategoryTheme(req.category, req.urgency);
      const isSelected = selectedRequestId === req.id;

      // Privacy area circle (approximate location indicator, 300m radius)
      L.circle([req.approxLat, req.approxLng], {
        radius: 350,
        color: req.urgency === 'জরুরি' ? '#e11d48' : '#10b981',
        fillColor: req.urgency === 'জরুরি' ? '#fda4af' : '#a7f3d0',
        fillOpacity: 0.18,
        weight: 1.5,
        dashArray: '4, 4',
      }).addTo(markersGroup);

      const markerHtml = `
        <div class="group relative flex items-center justify-center cursor-pointer transition-transform transform hover:scale-110 ${isSelected ? 'scale-125' : ''}">
          ${
            theme.pulse
              ? '<span class="absolute w-8 h-8 rounded-full bg-rose-400 opacity-75 animate-ping"></span>'
              : ''
          }
          <div class="relative w-9 h-9 rounded-2xl ${theme.bg} text-white flex items-center justify-center shadow-lg border-2 border-white text-base">
            ${theme.emoji}
          </div>
          <div class="absolute -bottom-5 px-1.5 py-0.5 bg-slate-900/90 text-white text-[10px] rounded font-medium whitespace-nowrap shadow-sm opacity-90 group-hover:opacity-100">
            ${req.urgency === 'জরুরি' ? 'জরুরি!' : req.category}
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-help-pin',
        html: markerHtml,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });

      const marker = L.marker([req.approxLat, req.approxLng], { icon: customIcon });

      // Interactive popup
      const popupHtml = `
        <div class="w-64 p-3 font-bengali text-slate-800">
          <div class="flex items-center justify-between gap-2 mb-2">
            <span class="inline-block px-2 py-0.5 text-xs font-semibold rounded-full ${
              req.urgency === 'জরুরি'
                ? 'bg-rose-100 text-rose-700'
                : 'bg-emerald-100 text-emerald-800'
            }">
              ${req.category} (${req.urgency})
            </span>
            <span class="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
              ${req.status}
            </span>
          </div>

          <h4 class="font-bold text-sm text-slate-900 leading-snug line-clamp-2 mb-1.5">
            ${req.title}
          </h4>

          <div class="flex items-center gap-1.5 text-xs text-slate-500 mb-2">
            <span>📍</span>
            <span class="truncate">${req.locationName} (আনুমানিক এলাকা)</span>
          </div>

          <div class="p-2 bg-slate-50 rounded-lg text-xs text-slate-700 border border-slate-100 mb-3">
            <span class="font-semibold text-slate-900 block mb-0.5">প্রয়োজনীয় সহায়তা:</span>
            <p class="line-clamp-2">${req.requiredAssistance}</p>
          </div>

          <button
            id="popup-btn-${req.id}"
            class="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1 shadow-sm cursor-pointer"
          >
            বিস্তারিত দেখুন & সাহায্য করুন →
          </button>
        </div>
      `;

      marker.bindPopup(popupHtml, { maxWidth: 300 });

      marker.on('popupopen', () => {
        const btn = document.getElementById(`popup-btn-${req.id}`);
        if (btn) {
          btn.onclick = () => {
            if (onSelectRequest) onSelectRequest(req.id);
          };
        }
      });

      marker.addTo(markersGroup);
    });

    if (selectedRequestId) {
      const target = requests.find((r) => r.id === selectedRequestId);
      if (target && target.approxLat && target.approxLng) {
        map.flyTo([target.approxLat, target.approxLng], 14, { duration: 1.2 });
      }
    }
  }, [requests, selectedRequestId, onSelectRequest, isSelectMode]);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-slate-200/80 shadow-inner bg-slate-100">
      <div ref={mapContainerRef} style={{ height, width: '100%' }} className="z-10" />

      {/* Map Helper overlay for privacy */}
      <div className="absolute bottom-3 left-3 z-20 bg-white/95 backdrop-blur-sm border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-600 shadow-sm flex items-center gap-2 max-w-sm">
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
        <span>
          <strong>গোপনীয়তা সুরক্ষা:</strong> মানচিত্রে শুধুমাত্র আনুমানিক এলাকা নির্দেশ করা হয়।
        </span>
      </div>

      {isSelectMode && (
        <div className="absolute top-3 left-1/2 transform -translate-x-1/2 z-20 bg-slate-900/90 text-white px-4 py-2 rounded-full text-xs font-medium shadow-lg backdrop-blur-sm flex items-center gap-2">
          <span>📍</span>
          <span>মানচিত্রে যে কোনো জায়গায় ক্লিক করে আনুমানিক এলাকা নির্বাচন করুন</span>
        </div>
      )}
    </div>
  );
};
