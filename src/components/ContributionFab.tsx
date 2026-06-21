import { useState, useEffect } from 'react';

interface ContributionFabProps {
  onTrigger?: (type: 'travelog' | 'business' | 'history' | 'route') => void;
}

export default function ContributionFab({ onTrigger }: ContributionFabProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const menuItems = [
    {
      type: 'travelog' as const,
      label: '旅行笔记',
      icon: '✈️',
      description: '分享你的西藏之旅',
      color: 'bg-blue-500'
    },
    {
      type: 'business' as const,
      label: '商家标注',
      icon: '🏪',
      description: '添加实用服务信息',
      color: 'bg-purple-500'
    },
    {
      type: 'history' as const,
      label: '历史叙事',
      icon: '📜',
      description: '补充历史知识',
      color: 'bg-yellow-500'
    },
    {
      type: 'route' as const,
      label: '地理路线',
      icon: '🗺️',
      description: '分享你的探索路线',
      color: 'bg-green-500'
    }
  ];

  const handleTrigger = (type: 'travelog' | 'business' | 'history' | 'route') => {
    setIsOpen(false);
    // 跳转到 Decap CMS 对应模板
    window.location.href = `/admin/#/${type}s/new`;
  };

  return (
    <>
      {/* 浮动按钮 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          fixed z-[1000] rounded-full shadow-lg flex items-center justify-center
          transition-all duration-300 hover:scale-110
          ${isOpen
            ? 'bg-gray-800 text-white w-14 h-14 rotate-45'
            : 'bg-tibet-red text-white w-14 h-14 hover:shadow-xl'
          }
        `}
        style={{ bottom: isMobile ? '140px' : '120px', right: '16px' }}
      >
        <span className="text-2xl">+</span>
      </button>

      {/* 菜单面板 */}
      {isOpen && (
        <>
          {/* 背景遮罩 */}
          <div
            className="fixed inset-0 bg-black/30 z-[999]"
            onClick={() => setIsOpen(false)}
          />

          {/* 菜单 */}
          <div
            className="fixed z-[1001] w-72 bg-white rounded-2xl shadow-2xl overflow-hidden"
            style={{ bottom: isMobile ? '200px' : '180px', right: '16px' }}
          >
            <div className="p-4 bg-gradient-to-r from-tibet-blue to-tibet-red text-white">
              <h3 className="font-serif font-bold">参与贡献</h3>
              <p className="text-sm text-white/80 mt-1">选择要添加的内容类型</p>
            </div>

            <div className="p-2">
              {menuItems.map((item) => (
                <button
                  key={item.type}
                  onClick={() => handleTrigger(item.type)}
                  className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors text-left"
                >
                  <div className={`w-12 h-12 ${item.color} rounded-xl flex items-center justify-center text-xl text-white`}>
                    {item.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{item.label}</h4>
                    <p className="text-sm text-gray-500">{item.description}</p>
                  </div>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ))}
            </div>

            <div className="p-3 border-t border-gray-100 bg-gray-50">
              <a
                href="/admin"
                className="flex items-center justify-center gap-2 py-2 text-tibet-blue hover:underline text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                打开完整管理后台
              </a>
            </div>
          </div>
        </>
      )}
    </>
  );
}
