import { useEffect, useState } from 'react';

interface MobileOptimizerProps {
  children: React.ReactNode;
}

export default function MobileOptimizer({ children }: MobileOptimizerProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number; time: number } | null>(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    // 长按检测（用于触发贡献菜单）
    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      setTouchStart({
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now()
      });
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStart) return;

      const touch = e.changedTouches[0];
      const duration = Date.now() - touchStart.time;
      const distance = Math.sqrt(
        Math.pow(touch.clientX - touchStart.x, 2) +
        Math.pow(touch.clientY - touchStart.y, 2)
      );

      // 长按超过 500ms 且移动距离小于 10px
      if (duration > 500 && distance < 10) {
        // 触发长按事件
        const event = new CustomEvent('longpress', {
          detail: { x: touchStart.x, y: touchStart.y }
        });
        document.dispatchEvent(event);
      }

      setTouchStart(null);
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('resize', checkMobile);
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [touchStart]);

  return (
    <div className={isMobile ? 'touch-manipulation' : ''}>
      {children}

      <style>{`
        /* 移动端触摸优化 */
        .touch-manipulation {
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
        }

        /* 确保触摸热区足够大 */
        @media (max-width: 768px) {
          button, a, [role="button"] {
            min-height: 44px;
            min-width: 44px;
          }
        }

        /* 禁用双击缩放（必要时） */
        .no-double-tap-zoom {
          touch-action: manipulation;
        }

        /* 移动端滚动优化 */
        .mobile-scroll {
          -webkit-overflow-scrolling: touch;
          overflow-scrolling: touch;
        }

        /* 防止 iOS 橡皮筋效果（必要时） */
        .no-bounce {
          overscroll-behavior: none;
        }
      `}</style>
    </div>
  );
}
