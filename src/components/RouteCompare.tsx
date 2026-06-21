import { useState } from 'react';
import L from 'leaflet';
import { mapInstance } from './MapCore';

interface Point {
  name: string;
  lat: number;
  lng: number;
  date?: Date;
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

interface RouteCompareProps {
  travelogs: Travelog[];
  onClose?: () => void;
}

const COLORS = [
  '#c41e3a', // 红
  '#1a4b6e', // 蓝
  '#d4a84b', // 金
  '#6b46c1', // 紫
  '#059669', // 绿
  '#ea580c'  // 橙
];

export default function RouteCompare({ travelogs, onClose }: RouteCompareProps) {
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>([]);
  const [polylines, setPolylines] = useState<L.Polyline[]>([]);

  const toggleTravelog = (slug: string) => {
    if (selectedSlugs.includes(slug)) {
      // 移除
      setSelectedSlugs(selectedSlugs.filter(s => s !== slug));
      // 移除路线
      polylines.forEach((pl, idx) => {
        const selected = travelogs.find(t => t.slug === selectedSlugs[idx]);
        if (selected?.slug === slug && mapInstance?.hasLayer(pl)) {
          mapInstance.removeLayer(pl);
        }
      });
    } else if (selectedSlugs.length < 3) {
      // 添加
      setSelectedSlugs([...selectedSlugs, slug]);
      drawRoute(slug, selectedSlugs.length);
    }
  };

  const drawRoute = (slug: string, colorIndex: number) => {
    const travelog = travelogs.find(t => t.slug === slug);
    if (!travelog?.data.points || !mapInstance) return;

    const color = COLORS[colorIndex % COLORS.length];
    const latlngs = travelog.data.points.map(p => [p.lat, p.lng] as [number, number]);

    const polyline = L.polyline(latlngs, {
      color,
      weight: 4,
      opacity: 0.8,
      dashArray: '10, 5'
    });

    polyline.bindPopup(`
      <div style="font-family: 'Noto Sans SC', sans-serif;">
        <h3 style="margin: 0 0 8px 0; color: ${color};">${travelog.data.title}</h3>
        <p style="margin: 0; color: #666; font-size: 13px;">${travelog.data.author}</p>
      </div>
    `);

    polyline.addTo(mapInstance);
    setPolylines(prev => [...prev, polyline]);
  };

  const clearAllRoutes = () => {
    polylines.forEach(pl => {
      if (mapInstance?.hasLayer(pl)) {
        mapInstance.removeLayer(pl);
      }
    });
    setPolylines([]);
    setSelectedSlugs([]);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[2000] flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-2xl w-[90vw] max-w-lg max-h-[80vh] overflow-hidden">
        {/* 头部 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h2 className="font-serif text-xl font-bold text-tibet-blue">路线对比</h2>
            <p className="text-sm text-gray-500 mt-1">选择最多3条路线进行叠加对比</p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            ✕
          </button>
        </div>

        {/* 路线列表 */}
        <div className="p-4 overflow-y-auto max-h-[50vh]">
          <div className="space-y-2">
            {travelogs.map((travelog, index) => {
              const isSelected = selectedSlugs.includes(travelog.slug);
              const colorIndex = selectedSlugs.indexOf(travelog.slug);
              const color = isSelected ? COLORS[colorIndex % COLORS.length] : undefined;

              return (
                <button
                  key={travelog.slug}
                  onClick={() => toggleTravelog(travelog.slug)}
                  disabled={!isSelected && selectedSlugs.length >= 3}
                  className={`
                    w-full p-4 rounded-xl border-2 transition-all text-left
                    ${isSelected
                      ? 'border-solid'
                      : selectedSlugs.length >= 3
                        ? 'border-gray-100 opacity-50 cursor-not-allowed'
                        : 'border-gray-100 hover:border-gray-200'
                    }
                  `}
                  style={isSelected ? { borderColor: color, backgroundColor: `${color}10` } : undefined}
                >
                  <div className="flex items-start gap-3">
                    {isSelected && (
                      <div
                        className="w-4 h-4 rounded-full flex-shrink-0 mt-1"
                        style={{ backgroundColor: color }}
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{travelog.data.title}</h3>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {travelog.data.author} · {travelog.data.points?.length || 0} 个地点
                      </p>
                      <div className="flex gap-1.5 mt-2 flex-wrap">
                        {travelog.data.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    {isSelected && (
                      <span className="text-xs text-gray-400">点击移除</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 底部操作 */}
        {selectedSlugs.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {selectedSlugs.map((slug, idx) => (
                  <div
                    key={slug}
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                  />
                ))}
                <span className="text-sm text-gray-600">
                  已选择 {selectedSlugs.length} 条路线
                </span>
              </div>
              <button
                onClick={clearAllRoutes}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
              >
                清除全部
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
