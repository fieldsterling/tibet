import { useState, useRef, useEffect } from 'react';

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

interface DiscoveryDrawerProps {
  travelogs: Travelog[];
}

export default function DiscoveryDrawer({ travelogs }: DiscoveryDrawerProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedTravelog, setSelectedTravelog] = useState<Travelog | null>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  // 收集所有地点用于发现
  const allPoints = travelogs.flatMap(t => 
    (t.data.points || []).map(p => ({ ...p, travelog: t }))
  ).slice(0, 20);

  const handleTravelogClick = (travelog: Travelog) => {
    setSelectedTravelog(travelog);
    setIsExpanded(true);
  };

  return (
    <div 
      ref={drawerRef}
      className={`
        fixed bottom-0 left-0 right-0 z-[1000] bg-white/95 backdrop-blur-md rounded-t-3xl shadow-2xl
        transition-all duration-500 ease-out
        ${isExpanded ? 'max-h-[70vh]' : 'max-h-[100px]'}
      `}
    >
      {/* 拖动手柄 */}
      <div 
        className="flex justify-center pt-3 pb-2 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
      </div>

      {/* 最小化状态 - 显示卡片预览 */}
      {!isExpanded && (
        <div 
          className="px-4 pb-4 cursor-pointer"
          onClick={() => setIsExpanded(true)}
        >
          <p className="text-sm text-gray-600 mb-2">发现精彩内容</p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {travelogs.slice(0, 4).map((travelog) => (
              <div 
                key={travelog.slug}
                className="flex-shrink-0 w-32 p-2 bg-gray-50 rounded-lg"
                onClick={(e) => {
                  e.stopPropagation();
                  handleTravelogClick(travelog);
                }}
              >
                <h4 className="text-xs font-medium text-gray-900 truncate">
                  {travelog.data.title}
                </h4>
                <p className="text-xs text-gray-500 truncate">
                  {travelog.data.author}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 展开状态 - 完整卡片流 */}
      {isExpanded && (
        <div className="px-4 pb-6 overflow-y-auto max-h-[calc(70vh-60px)]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-serif text-lg font-bold text-tibet-blue">发现</h3>
            <button 
              onClick={() => setIsExpanded(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          {/* 旅行日志列表 */}
          <div className="space-y-3">
            {travelogs.map((travelog) => (
              <div 
                key={travelog.slug}
                className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                onClick={() => handleTravelogClick(travelog)}
              >
                <div className="flex items-start gap-3">
                  {travelog.data.cover && (
                    <img 
                      src={travelog.data.cover} 
                      alt={travelog.data.title}
                      className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-serif font-semibold text-gray-900 truncate">
                      {travelog.data.title}
                    </h4>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {travelog.data.author} · {new Date(travelog.data.date).toLocaleDateString('zh-CN')}
                    </p>
                    <div className="flex gap-1.5 mt-2 flex-wrap">
                      {travelog.data.tags.slice(0, 3).map((tag) => (
                        <span 
                          key={tag}
                          className="px-2 py-0.5 bg-tibet-blue/10 text-tibet-blue text-xs rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* 关联地点预览 */}
                {travelog.data.points && travelog.data.points.length > 0 && (
                  <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                    {travelog.data.points.slice(0, 5).map((point, idx) => (
                      <div 
                        key={idx}
                        className="flex-shrink-0 px-2 py-1 bg-white rounded text-xs text-gray-600 border border-gray-200"
                      >
                        {point.name}
                      </div>
                    ))}
                    {travelog.data.points.length > 5 && (
                      <span className="flex-shrink-0 px-2 py-1 text-xs text-gray-400">
                        +{travelog.data.points.length - 5} 更多
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
