import { useState, useEffect } from 'react';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  requirement: number;
  progress?: number;
  unlocked: boolean;
}

interface AchievementBadge {
  id: string;
  name: string;
  icon: string;
  description: string;
  unlockedAt?: string;
}

const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'explorer',
    title: '探索者',
    description: '访问10个不同地点',
    icon: '🗺️',
    requirement: 10
  },
  {
    id: 'historian',
    title: '历史学家',
    description: '阅读5篇历史叙事',
    icon: '📜',
    requirement: 5
  },
  {
    id: 'pilgrim',
    title: '朝圣者',
    description: '查看冈仁波齐相关内容',
    icon: '🙏',
    requirement: 1
  },
  {
    id: 'photographer',
    title: '摄影师',
    description: '浏览20张图片',
    icon: '📷',
    requirement: 20
  },
  {
    id: 'contributor',
    title: '贡献者',
    description: '提交1篇旅行笔记',
    icon: '✍️',
    requirement: 1
  },
  {
    id: 'master',
    title: '大师',
    description: '完成所有成就',
    icon: '🏆',
    requirement: 6
  }
];

interface AchievementBadgeProps {
  onClose?: () => void;
}

export default function AchievementBadge({ onClose }: AchievementBadgeProps) {
  const [achievements, setAchievements] = useState<Achievement[]>(ACHIEVEMENTS);
  const [badges, setBadges] = useState<AchievementBadge[]>([]);

  useEffect(() => {
    // 从 localStorage 加载进度
    const savedProgress = localStorage.getItem('tibet-achievements');
    if (savedProgress) {
      const progress = JSON.parse(savedProgress);
      setAchievements(prev => prev.map(a => ({
        ...a,
        progress: progress[a.id] || 0,
        unlocked: progress[a.id] >= a.requirement
      })));
    }

    const savedBadges = localStorage.getItem('tibet-badges');
    if (savedBadges) {
      setBadges(JSON.parse(savedBadges));
    }
  }, []);

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;

  return (
    <div className="fixed inset-0 bg-black/50 z-[2000] flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-2xl w-[90vw] max-w-lg max-h-[80vh] overflow-hidden">
        {/* 头部 */}
        <div className="bg-gradient-to-r from-tibet-gold to-yellow-400 text-white px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif text-2xl font-bold">成就与打卡</h2>
              <p className="text-white/80 mt-1">完成探索任务，解锁成就徽章</p>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/20 rounded-full transition-colors"
            >
              ✕
            </button>
          </div>
          
          {/* 进度条 */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span>总进度</span>
              <span>{unlockedCount} / {totalCount}</span>
            </div>
            <div className="h-3 bg-white/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-500"
                style={{ width: `${(unlockedCount / totalCount) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* 成就列表 */}
        <div className="p-4 overflow-y-auto max-h-[60vh]">
          <div className="space-y-3">
            {achievements.map((achievement) => {
              const progress = achievement.progress || 0;
              const percent = Math.min((progress / achievement.requirement) * 100, 100);

              return (
                <div
                  key={achievement.id}
                  className={`
                    p-4 rounded-xl border-2 transition-all
                    ${achievement.unlocked
                      ? 'bg-gradient-to-r from-tibet-gold/10 to-yellow-100 border-tibet-gold'
                      : 'bg-gray-50 border-gray-200'
                    }
                  `}
                >
                  <div className="flex items-start gap-4">
                    <div className={`
                      w-14 h-14 rounded-xl flex items-center justify-center text-2xl
                      ${achievement.unlocked
                        ? 'bg-tibet-gold text-white'
                        : 'bg-gray-200 text-gray-400'
                      }
                    `}>
                      {achievement.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className={`
                          font-semibold
                          ${achievement.unlocked ? 'text-gray-900' : 'text-gray-600'}
                        `}>
                          {achievement.title}
                        </h3>
                        {achievement.unlocked && (
                          <span className="text-xs bg-tibet-gold text-white px-2 py-0.5 rounded-full">
                            已解锁
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mt-0.5">{achievement.description}</p>

                      {/* 进度条 */}
                      {!achievement.unlocked && (
                        <div className="mt-2">
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-tibet-blue rounded-full transition-all duration-300"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                          <p className="text-xs text-gray-400 mt-1">
                            {progress} / {achievement.requirement}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 已获得徽章 */}
        {badges.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <h3 className="font-medium text-gray-900 mb-3">已获得徽章</h3>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {badges.map((badge) => (
                <div
                  key={badge.id}
                  className="flex-shrink-0 w-20 text-center"
                >
                  <div className="w-14 h-14 mx-auto rounded-full bg-gradient-to-br from-tibet-gold to-yellow-400 flex items-center justify-center text-2xl shadow-lg">
                    {badge.icon}
                  </div>
                  <p className="text-xs text-gray-600 mt-1 truncate">{badge.name}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
