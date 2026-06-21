import { useState, useEffect, useRef, useCallback } from 'react';
import L from 'leaflet';
import { mapInstance } from './MapCore';

interface NarrativeEvent {
  year: number;
  desc: string;
  lat: number;
  lng: number;
  image?: string;
}

interface History {
  slug: string;
  data: {
    title: string;
    author: string;
    era: number[];
    events: NarrativeEvent[];
  };
}

interface TimeSliderProps {
  events: NarrativeEvent[];
  currentIndex: number;
  onChange: (index: number) => void;
}

function TimeSlider({ events, currentIndex, onChange }: TimeSliderProps) {
  const minYear = Math.min(...events.map(e => e.year));
  const maxYear = Math.max(...events.map(e => e.year));
  const progress = (currentIndex / Math.max(events.length - 1, 1)) * 100;

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-lg">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-600">{minYear}</span>
        <span className="text-lg font-bold text-tibet-blue">
          {events[currentIndex]?.year}
        </span>
        <span className="text-sm text-gray-600">{maxYear}</span>
      </div>

      <input
        type="range"
        min={0}
        max={events.length - 1}
        value={currentIndex}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-tibet"
        style={{
          background: `linear-gradient(to right, #1a4b6e 0%, #1a4b6e ${progress}%, #e5e7eb ${progress}%, #e5e7eb 100%)`
        }}
      />

      <div className="mt-2 text-sm text-gray-600 text-center">
        {events[currentIndex]?.desc?.substring(0, 50)}...
      </div>

      <style>{`
        .slider-tibet::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          background: #1a4b6e;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(0,0,0,0.2);
        }
        .slider-tibet::-moz-range-thumb {
          width: 20px;
          height: 20px;
          background: #1a4b6e;
          border-radius: 50%;
          cursor: pointer;
          border: none;
        }
      `}</style>
    </div>
  );
}

interface NarrativeLayerCapsuleProps {
  histories: History[];
}

export default function NarrativeLayerCapsule({ histories }: NarrativeLayerCapsuleProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [currentHistory, setCurrentHistory] = useState<History | null>(null);
  const [currentEventIndex, setCurrentEventIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const markersRef = useRef<L.CircleMarker[]>([]);
  const playIntervalRef = useRef<number | null>(null);

  const CATEGORIES = ['经典地点', '分类地点集', '服务与商品集'];

  const clearMarkers = useCallback(() => {
    markersRef.current.forEach(marker => {
      if (mapInstance?.hasLayer(marker)) {
        mapInstance.removeLayer(marker);
      }
    });
    markersRef.current = [];
    setCurrentHistory(null);
    setCurrentEventIndex(0);
    setIsPlaying(false);
    if (playIntervalRef.current) {
      clearInterval(playIntervalRef.current);
      playIntervalRef.current = null;
    }
  }, []);

  const loadHistoryForCategory = useCallback((category: string) => {
    if (!mapInstance || histories.length === 0) return;

    clearMarkers();

    // 使用第一个历史记录作为示例
    const history = histories[0];
    setCurrentHistory(history);

    // 创建新标记
    history.data.events.forEach((event, index) => {
      const color = index === 0 ? '#c41e3a' : '#1a4b6e';
      const marker = L.circleMarker([event.lat, event.lng], {
        radius: index === 0 ? 10 : 6,
        fillColor: color,
        color: '#f5f0e8',
        weight: 2,
        fillOpacity: 0.8
      });

      marker.bindPopup(`
        <div style="font-family: 'Noto Sans SC', sans-serif; min-width: 200px;">
          <h4 style="margin: 0 0 8px 0; color: #1a4b6e;">${event.year}年</h4>
          <p style="margin: 0; color: #333; font-size: 14px;">${event.desc}</p>
        </div>
      `);

      marker.addTo(mapInstance);
      markersRef.current.push(marker);
    });

    // 飞到第一个事件位置
    if (history.data.events[0]) {
      mapInstance.setView([history.data.events[0].lat, history.data.events[0].lng], 10);
    }
  }, [histories, clearMarkers]);

  const toggleCategory = useCallback((category: string) => {
    if (activeCategory === category) {
      setActiveCategory(null);
      clearMarkers();
    } else {
      setActiveCategory(category);
      loadHistoryForCategory(category);
    }
  }, [activeCategory, loadHistoryForCategory, clearMarkers]);

  const startPlayback = useCallback(() => {
    if (!currentHistory || !mapInstance) return;

    setIsPlaying(true);
    playIntervalRef.current = window.setInterval(() => {
      setCurrentEventIndex(prev => {
        const next = (prev + 1) % currentHistory.data.events.length;

        // 高亮当前事件
        markersRef.current.forEach((marker, index) => {
          if (index === next) {
            marker.setStyle({ radius: 10, fillColor: '#c41e3a' });
          } else {
            marker.setStyle({ radius: 6, fillColor: '#1a4b6e' });
          }
        });

        // 飞转到当前位置
        const event = currentHistory.data.events[next];
        mapInstance.setView([event.lat, event.lng], mapInstance.getZoom(), {
          animate: true,
          duration: 0.5
        });

        // 打开弹出
        markersRef.current[next]?.openPopup();

        return next;
      });
    }, 3000);
  }, [currentHistory]);

  const stopPlayback = useCallback(() => {
    setIsPlaying(false);
    if (playIntervalRef.current) {
      clearInterval(playIntervalRef.current);
      playIntervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
      }
    };
  }, []);

  return (
    <div className="absolute top-32 right-4 z-[1000]">
      {/* 胶囊按钮 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg
          transition-all duration-300 hover:bg-white
          ${isOpen ? 'bg-tibet-red text-white' : 'text-gray-700'}
        `}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
        <span className="font-medium">叙事层</span>
      </button>

      {/* 展开面板 */}
      {isOpen && (
        <div className="mt-2 bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl p-4 w-80">
          <h3 className="font-serif font-bold text-gray-900 mb-3">选择叙事内容</h3>

          <div className="space-y-2">
            {CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => toggleCategory(category)}
                className={`
                  w-full text-left p-3 rounded-lg transition-colors
                  ${activeCategory === category
                    ? 'bg-tibet-blue text-white'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'}
                `}
              >
                {category}
              </button>
            ))}
          </div>

          {/* 时间轴 */}
          {currentHistory && currentHistory.data.events.length > 0 && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-gray-700">
                  {currentHistory.data.title}
                </h4>
                <button
                  onClick={isPlaying ? stopPlayback : startPlayback}
                  className="flex items-center gap-1 text-sm text-tibet-blue"
                >
                  {isPlaying ? (
                    <>
                      <span className="w-2 h-2 bg-tibet-blue rounded-full"></span>
                      暂停
                    </>
                  ) : (
                    <>
                      <span className="w-0 h-0 border-t-[6px] border-l-[10px] border-b-[6px] border-transparent border-l-tibet-blue"></span>
                      巡游
                    </>
                  )}
                </button>
              </div>

              <TimeSlider
                events={currentHistory.data.events}
                currentIndex={currentEventIndex}
                onChange={setCurrentEventIndex}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
