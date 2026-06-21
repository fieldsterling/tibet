import { useState, useRef, useCallback } from 'react';
import L from 'leaflet';
import { mapInstance } from './MapCore';

interface RoutePoint {
  name: string;
  lat: number;
  lng: number;
  desc: string;
  image?: string;
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

interface RouteLayerCapsuleProps {
  routes: Route[];
}

const ROUTE_TYPE_COLORS: Record<string, string> = {
  '修行': '#6b46c1',
  '探险': '#dd6b20',
  '朝圣': '#c41e3a',
  '个人': '#1a4b6e'
};

const ROUTE_TYPES = ['大师线', '经典线', '个人推荐线', '个人线'];

export default function RouteLayerCapsule({ routes }: RouteLayerCapsuleProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTypes, setActiveTypes] = useState<string[]>([]);
  const routeLayersRef = useRef<{ type: string; layer: L.Polyline }[]>([]);

  const clearAllRoutes = useCallback(() => {
    routeLayersRef.current.forEach(({ layer }) => {
      if (mapInstance?.hasLayer(layer)) {
        mapInstance.removeLayer(layer);
      }
    });
    routeLayersRef.current = [];
    setActiveTypes([]);
  }, []);

  const toggleType = useCallback((type: string) => {
    if (activeTypes.includes(type)) {
      // 移除该类型的路线
      routeLayersRef.current = routeLayersRef.current.filter(({ type: t, layer }) => {
        if (t === type && mapInstance?.hasLayer(layer)) {
          mapInstance.removeLayer(layer);
          return false;
        }
        return true;
      });
      setActiveTypes(prev => prev.filter(t => t !== type));
    } else {
      // 添加该类型的路线
      setActiveTypes(prev => [...prev, type]);
      drawRoutesForType(type);
    }
  }, [activeTypes]);

  const drawRoutesForType = useCallback((type: string) => {
    if (!mapInstance) return;

    const typeMapping: Record<string, string[]> = {
      '大师线': ['修行'],
      '经典线': ['探险'],
      '个人推荐线': ['朝圣'],
      '个人线': []
    };

    const matchedCategories = typeMapping[type] || [];

    routes
      .filter(r => matchedCategories.includes(r.data.type))
      .forEach(route => {
        if (!route.data.points || route.data.points.length < 2) return;

        const color = ROUTE_TYPE_COLORS[route.data.type] || '#1a4b6e';
        const latlngs = route.data.points.map(p => [p.lat, p.lng] as [number, number]);

        const polyline = L.polyline(latlngs, {
          color,
          weight: 3,
          opacity: 0.8,
          dashArray: type === '个人线' ? '10, 5' : undefined
        });

        polyline.bindPopup(`
          <div style="font-family: 'Noto Sans SC', sans-serif;">
            <h3 style="margin: 0 0 8px 0; color: ${color};">${route.data.title}</h3>
            <p style="margin: 0; color: #666; font-size: 13px;">${route.data.author} · ${route.data.type}</p>
          </div>
        `);

        polyline.addTo(mapInstance);
        routeLayersRef.current.push({ type, layer: polyline });
      });
  }, [routes]);

  return (
    <div className="absolute top-20 right-4 z-[1000]">
      {/* 胶囊按钮 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg
          transition-all duration-300 hover:bg-white
          ${isOpen ? 'bg-tibet-blue text-white' : 'text-gray-700'}
        `}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
        <span className="font-medium">路线层</span>
        {activeTypes.length > 0 && (
          <span className="bg-tibet-gold text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {activeTypes.length}
          </span>
        )}
      </button>

      {/* 展开面板 */}
      {isOpen && (
        <div className="mt-2 bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl p-4 w-72">
          <div className="space-y-2">
            {ROUTE_TYPES.map((type) => (
              <label
                key={type}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={activeTypes.includes(type)}
                  onChange={() => toggleType(type)}
                  className="w-4 h-4 text-tibet-blue rounded focus:ring-tibet-blue"
                />
                <span className="text-gray-700">{type}</span>
                <span className={`
                  text-xs px-2 py-0.5 rounded-full ml-auto
                  ${type === '大师线' ? 'bg-purple-100 text-purple-700' : ''}
                  ${type === '经典线' ? 'bg-orange-100 text-orange-700' : ''}
                  ${type === '个人推荐线' ? 'bg-red-100 text-red-700' : ''}
                  ${type === '个人线' ? 'bg-blue-100 text-blue-700' : ''}
                `}>
                  {type === '大师线' ? '修行' : type === '经典线' ? '探险' : type === '个人推荐线' ? '朝圣' : '个人'}
                </span>
              </label>
            ))}
          </div>

          {activeTypes.length > 0 && (
            <button
              onClick={clearAllRoutes}
              className="mt-3 w-full py-2 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg"
            >
              清除所有路线
            </button>
          )}
        </div>
      )}
    </div>
  );
}
