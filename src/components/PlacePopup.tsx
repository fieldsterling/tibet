import { useState } from 'react';
import L from 'leaflet';

interface PlaceData {
  name: string;
  lat: number;
  lng: number;
  relatedTravelogs: Array<{
    slug: string;
    title: string;
    author: string;
  }>;
  relatedHistories: Array<{
    slug: string;
    title: string;
    year?: number;
  }>;
  relatedBusinesses?: Array<{
    slug: string;
    title: string;
    type: string;
  }>;
}

interface PlacePopupProps {
  place: PlaceData;
  onClose: () => void;
  map?: L.Map | null;
}

export default function PlacePopup({ place, onClose, map }: PlacePopupProps) {
  const [activeTab, setActiveTab] = useState<'travelogs' | 'histories' | 'businesses'>('travelogs');

  const handleNavigate = (slug: string, type: string) => {
    if (type === 'travelogs') {
      window.location.href = `/travelog/${slug}`;
    } else if (type === 'histories') {
      window.location.href = `/history/${slug}`;
    } else if (type === 'businesses') {
      window.location.href = `/business/${slug}`;
    }
  };

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl overflow-hidden w-80">
      {/* 头部 */}
      <div className="bg-gradient-to-r from-tibet-blue to-tibet-red p-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-serif text-xl font-bold text-white">{place.name}</h3>
            <p className="text-white/80 text-sm mt-1">
              {place.lat.toFixed(4)}, {place.lng.toFixed(4)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white"
          >
            ✕
          </button>
        </div>
      </div>

      {/* 标签页 */}
      <div className="flex border-b border-gray-200">
        {(['travelogs', 'histories', 'businesses'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`
              flex-1 py-2.5 text-sm font-medium transition-colors
              ${activeTab === tab
                ? 'text-tibet-blue border-b-2 border-tibet-blue'
                : 'text-gray-500 hover:text-gray-700'}
            `}
          >
            {tab === 'travelogs' ? '旅行' : tab === 'histories' ? '历史' : '服务'}
          </button>
        ))}
      </div>

      {/* 内容 */}
      <div className="max-h-60 overflow-y-auto">
        {activeTab === 'travelogs' && (
          <div className="p-3 space-y-2">
            {place.relatedTravelogs.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-4">暂无旅行笔记</p>
            ) : (
              place.relatedTravelogs.map((item) => (
                <div
                  key={item.slug}
                  onClick={() => handleNavigate(item.slug, 'travelogs')}
                  className="p-2 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                >
                  <h4 className="font-medium text-gray-900 text-sm">{item.title}</h4>
                  <p className="text-xs text-gray-500">{item.author}</p>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'histories' && (
          <div className="p-3 space-y-2">
            {place.relatedHistories.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-4">暂无历史记录</p>
            ) : (
              place.relatedHistories.map((item) => (
                <div
                  key={item.slug}
                  onClick={() => handleNavigate(item.slug, 'histories')}
                  className="p-2 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                >
                  <h4 className="font-medium text-gray-900 text-sm">{item.title}</h4>
                  {item.year && (
                    <p className="text-xs text-gray-500">{item.year}年</p>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'businesses' && (
          <div className="p-3 space-y-2">
            {!place.relatedBusinesses || place.relatedBusinesses.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-4">暂无服务信息</p>
            ) : (
              place.relatedBusinesses.map((item) => (
                <div
                  key={item.slug}
                  onClick={() => handleNavigate(item.slug, 'businesses')}
                  className="p-2 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                >
                  <h4 className="font-medium text-gray-900 text-sm">{item.title}</h4>
                  <span className="text-xs text-tibet-blue">{item.type}</span>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* 底部操作 */}
      <div className="p-3 border-t border-gray-200 bg-gray-50">
        <a
          href={`/place/${place.lat.toFixed(4)}-${place.lng.toFixed(4)}`}
          className="block w-full text-center py-2 bg-tibet-blue text-white rounded-lg hover:bg-tibet-blue/90 transition-colors text-sm"
        >
          查看完整地点页
        </a>
      </div>
    </div>
  );
}
