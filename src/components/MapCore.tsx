import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface Point {
  name: string;
  lat: number;
  lng: number;
  date?: Date;
  desc: string;
  image?: string;
}

interface RoutePoint {
  name: string;
  lat: number;
  lng: number;
  desc: string;
  image?: string;
}

interface Travelog {
  slug: string;
  data: {
    title: string;
    author: string;
    date: Date;
    tags: string[];
    cover?: string;
    points?: Point[];
  };
}

interface Route {
  slug: string;
  data: {
    title: string;
    author: string;
    type: '修行' | '探险' | '朝圣';
    points: RoutePoint[];
  };
}

interface MapCoreProps {
  travelogs: Travelog[];
  routes?: Route[];
}

export const TIBET_CENTER: [number, number] = [29.65, 91.10];
export const TIBET_ZOOM = 7;

export let mapInstance: L.Map | null = null;

const createMarkerIcon = (type: 'default' | 'active') => {
  const color = type === 'active' ? '#c41e3a' : '#1a4b6e';
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width: 32px;
        height: 32px;
        background: ${color};
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid #f5f0e8;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          width: 8px;
          height: 8px;
          background: #f5f0e8;
          border-radius: 50%;
          transform: rotate(45deg);
        "></div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  });
};

export default function MapCore({ travelogs, routes = [] }: MapCoreProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const [selectedPoint, setSelectedPoint] = useState<{ point: Point; travelog: Travelog } | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // 初始化地图
    const map = L.map(mapRef.current, {
      center: TIBET_CENTER,
      zoom: TIBET_ZOOM,
      zoomControl: false,
      attributionControl: false
    });

    // 使用 OSM 瓦片（开发阶段），天地图仅部署时接入
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
    }).addTo(map);

    // 缩放控制
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    mapInstanceRef.current = map;
    mapInstance = map;

    // 绘制旅行日志点
    travelogs.forEach((travelog) => {
      if (!travelog.data.points) return;

      travelog.data.points.forEach((point) => {
        const marker = L.marker([point.lat, point.lng], {
          icon: createMarkerIcon('default')
        });

        marker.bindPopup(`
          <div style="min-width: 200px; font-family: 'Noto Sans SC', sans-serif;">
            <h3 style="margin: 0 0 8px 0; color: #1a4b6e; font-size: 16px; font-weight: 600;">
              ${point.name}
            </h3>
            <p style="margin: 0 0 8px 0; color: #666; font-size: 13px;">
              来自《${travelog.data.title}》
            </p>
            <p style="margin: 0; color: #333; font-size: 14px; line-height: 1.5;">
              ${point.desc.substring(0, 100)}${point.desc.length > 100 ? '...' : ''}
            </p>
          </div>
        `, {
          maxWidth: 300,
          className: 'custom-popup'
        });

        marker.on('click', () => {
          setSelectedPoint({ point, travelog });
        });

        marker.addTo(map);
        markersRef.current.push(marker);
      });
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      mapInstance = null;
    };
  }, [travelogs, routes]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className="w-full h-full z-0" />
      
      {/* 选中点详情浮层 */}
      {selectedPoint && (
        <div 
          className="absolute bottom-24 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl z-[1000] p-4 cursor-pointer"
          onClick={() => setSelectedPoint(null)}
        >
          <button 
            className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700"
            onClick={() => setSelectedPoint(null)}
          >
            ✕
          </button>
          <h3 className="font-serif text-lg font-bold text-tibet-blue mb-2">
            {selectedPoint.point.name}
          </h3>
          <p className="text-sm text-gray-600 mb-2">
            {selectedPoint.travelog.data.title} · {selectedPoint.travelog.data.author}
          </p>
          <p className="text-gray-800 text-sm leading-relaxed">
            {selectedPoint.point.desc}
          </p>
          {selectedPoint.point.image && (
            <img 
              src={selectedPoint.point.image} 
              alt={selectedPoint.point.name}
              className="mt-3 w-full h-32 object-cover rounded-lg"
            />
          )}
        </div>
      )}

      <style>{`
        .custom-popup .leaflet-popup-content-wrapper {
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        }
        .custom-popup .leaflet-popup-tip {
          background: white;
        }
        .custom-marker {
          background: transparent;
          border: none;
        }
      `}</style>
    </div>
  );
}
