import { useState, useEffect } from 'react';

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

interface SearchOverlayProps {
  travelogs: Travelog[];
}

export default function SearchOverlay({ travelogs }: SearchOverlayProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Array<{ travelog: Travelog; point: Point }>>([]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const searchResults: Array<{ travelog: Travelog; point: Point }> = [];
    const lowerQuery = query.toLowerCase();

    travelogs.forEach((travelog) => {
      // 搜索标题和作者
      if (
        travelog.data.title.toLowerCase().includes(lowerQuery) ||
        travelog.data.author.toLowerCase().includes(lowerQuery) ||
        travelog.data.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
      ) {
        if (travelog.data.points && travelog.data.points.length > 0) {
          travelog.data.points.forEach((point) => {
            searchResults.push({ travelog, point });
          });
        }
      }

      // 搜索描述内容
      travelog.data.points?.forEach((point) => {
        if (
          point.name.toLowerCase().includes(lowerQuery) ||
          point.desc.toLowerCase().includes(lowerQuery)
        ) {
          if (!searchResults.some(r => r.point.name === point.name)) {
            searchResults.push({ travelog, point });
          }
        }
      });
    });

    setResults(searchResults.slice(0, 10));
  }, [query, travelogs]);

  return (
    <div className="absolute top-20 left-4 z-[1000] w-72">
      {/* 搜索框 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2.5 shadow-lg
          transition-all duration-300 hover:bg-white hover:shadow-xl
          ${isOpen ? 'w-full' : ''}
        `}
      >
        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <span className="text-gray-700 font-medium">搜索地点、内容...</span>
      </button>

      {/* 展开搜索面板 */}
      {isOpen && (
        <div className="mt-2 bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl overflow-hidden">
          <div className="p-3 border-b border-gray-100">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="输入关键词搜索..."
              className="w-full px-3 py-2 bg-gray-50 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-tibet-blue/30"
              autoFocus
            />
          </div>
          
          {/* 搜索结果 */}
          {query && (
            <div className="max-h-80 overflow-y-auto">
              {results.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  未找到相关结果
                </div>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {results.map((result, index) => (
                    <li key={index} className="p-3 hover:bg-gray-50 cursor-pointer transition-colors">
                      <h4 className="font-medium text-gray-900">{result.point.name}</h4>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {result.travelog.data.title} · {result.point.desc.substring(0, 50)}...
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
