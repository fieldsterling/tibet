import { useState } from 'react';

interface UserMenuProps {
  onOpenKnowledgeGraph?: () => void;
}

export default function UserMenu({ onOpenKnowledgeGraph }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = () => {
    // Netlify Identity 登录
    if (typeof window !== 'undefined' && (window as any).netlifyIdentity) {
      (window as any).netlifyIdentity.open();
    }
  };

  const handleLogout = () => {
    if (typeof window !== 'undefined' && (window as any).netlifyIdentity) {
      (window as any).netlifyIdentity.logout();
    }
    setIsLoggedIn(false);
    setIsOpen(false);
  };

  return (
    <div className="absolute bottom-24 right-4 z-[1000]">
      {/* 头像按钮 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:shadow-xl transition-shadow"
      >
        {isLoggedIn ? (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-tibet-blue to-tibet-red flex items-center justify-center text-white font-bold">
            我
          </div>
        ) : (
          <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        )}
      </button>

      {/* 菜单面板 */}
      {isOpen && (
        <div className="absolute bottom-14 right-0 w-56 bg-white rounded-xl shadow-2xl overflow-hidden">
          {isLoggedIn ? (
            <div className="p-4 border-b border-gray-100">
              <p className="font-medium text-gray-900">我的账户</p>
              <p className="text-sm text-gray-500 mt-0.5">user@example.com</p>
            </div>
          ) : null}

          <div className="py-2">
            {isLoggedIn ? (
              <>
                <button className="w-full px-4 py-2.5 text-left text-gray-700 hover:bg-gray-50 flex items-center gap-3">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  我的提交
                </button>
                <button className="w-full px-4 py-2.5 text-left text-gray-700 hover:bg-gray-50 flex items-center gap-3">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  我的路线
                </button>
                <button className="w-full px-4 py-2.5 text-left text-gray-700 hover:bg-gray-50 flex items-center gap-3">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  打卡记录
                </button>
                <button
                  onClick={onOpenKnowledgeGraph}
                  className="w-full px-4 py-2.5 text-left text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                >
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  知识图谱
                </button>
                <div className="border-t border-gray-100 mt-2 pt-2">
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2.5 text-left text-red-600 hover:bg-red-50 flex items-center gap-3"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    退出登录
                  </button>
                </div>
              </>
            ) : (
              <div className="p-4">
                <p className="text-sm text-gray-500 mb-3">登录以参与贡献</p>
                <button
                  onClick={handleLogin}
                  className="w-full py-2.5 bg-tibet-blue text-white rounded-lg hover:bg-tibet-blue/90 transition-colors"
                >
                  登录 / 注册
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
