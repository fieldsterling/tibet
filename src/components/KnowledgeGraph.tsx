import { useEffect, useRef, useState } from 'react';

interface KnowledgeNode {
  id: string;
  label: string;
  type: 'place' | 'travelog' | 'history' | 'business' | 'route';
  lat?: number;
  lng?: number;
}

interface KnowledgeEdge {
  source: string;
  target: string;
  label?: string;
}

interface KnowledgeGraphProps {
  nodes: KnowledgeNode[];
  edges: KnowledgeEdge[];
  onNodeClick?: (node: KnowledgeNode) => void;
  onClose?: () => void;
}

const NODE_COLORS: Record<string, string> = {
  place: '#c41e3a',
  travelog: '#1a4b6e',
  history: '#d4a84b',
  business: '#6b46c1',
  route: '#dd6b20'
};

const NODE_ICONS: Record<string, string> = {
  place: '📍',
  travelog: '✈️',
  history: '📜',
  business: '🏪',
  route: '🗺️'
};

export default function KnowledgeGraph({ nodes, edges, onNodeClick, onClose }: KnowledgeGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<any>(null);
  const [selectedNode, setSelectedNode] = useState<KnowledgeNode | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // 动态导入 G6
    import('@antv/g6').then(({ Graph, GraphData }) => {
      if (!containerRef.current) return;

      // 构建 G6 数据
      const graphData: GraphData = {
        nodes: nodes.map(node => ({
          id: node.id,
          label: node.label,
          style: {
            fill: NODE_COLORS[node.type],
            stroke: '#fff',
            lineWidth: 2,
            fontSize: 12,
            fontFamily: 'Noto Sans SC'
          }
        })),
        edges: edges.map((edge, index) => ({
          id: `edge-${index}`,
          source: edge.source,
          target: edge.target,
          label: edge.label,
          style: {
            stroke: '#e5e7eb',
            lineWidth: 1,
            endArrow: true
          }
        }))
      };

      // 初始化 G6 图
      const graph = new Graph({
        container: containerRef.current!,
        width: containerRef.current!.offsetWidth,
        height: containerRef.current!.offsetHeight,
        modes: {
          default: ['drag-canvas', 'zoom-canvas', 'drag-node']
        },
        defaultNode: {
          type: 'circle',
          size: 40,
          labelCfg: {
            position: 'bottom',
            offset: 5,
            style: {
              fill: '#374151',
              fontSize: 11
            }
          }
        },
        defaultEdge: {
          type: 'polyline',
          style: {
            stroke: '#d1d5db',
            endArrow: {
              path: 'M 0,0 L 6,3 L 6,-3 Z',
              fill: '#d1d5db'
            }
          }
        },
        layout: {
          type: 'force',
          preventOverlap: true,
          nodeSpacing: 50,
          linkDistance: 100
        }
      });

      graph.data(graphData);
      graph.render();

      // 节点点击事件
      graph.on('node:click', (evt: any) => {
        const nodeId = evt.item?.getModel()?.id;
        const node = nodes.find(n => n.id === nodeId);
        if (node) {
          setSelectedNode(node);
          onNodeClick?.(node);
        }
      });

      graphRef.current = graph;
      setIsLoaded(true);

      // 窗口调整
      const handleResize = () => {
        if (containerRef.current && graph) {
          graph.changeSize(containerRef.current.offsetWidth, containerRef.current.offsetHeight);
        }
      };

      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        graph.destroy();
      };
    });
  }, [nodes, edges]);

  const handleNavigate = (node: KnowledgeNode) => {
    if (node.type === 'travelog') {
      window.location.href = `/travelog/${node.id}`;
    } else if (node.type === 'history') {
      window.location.href = `/history/${node.id}`;
    } else if (node.type === 'business') {
      window.location.href = `/business/${node.id}`;
    } else if (node.type === 'route') {
      window.location.href = `/route/${node.id}`;
    } else if (node.type === 'place' && node.lat && node.lng) {
      window.location.href = `/place/${node.lat.toFixed(4)}-${node.lng.toFixed(4)}`;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[2000] flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-2xl w-[90vw] h-[80vh] max-w-6xl overflow-hidden">
        {/* 头部 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h2 className="font-serif text-xl font-bold text-tibet-blue">知识图谱</h2>
            <p className="text-sm text-gray-500 mt-1">探索地点、历史、故事之间的联系</p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            ✕
          </button>
        </div>

        {/* 图谱容器 */}
        <div ref={containerRef} className="w-full h-[calc(100%-140px)]" />

        {/* 底部节点信息 */}
        {selectedNode && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{NODE_ICONS[selectedNode.type]}</span>
                <div>
                  <h3 className="font-semibold text-gray-900">{selectedNode.label}</h3>
                  <p className="text-sm text-gray-500 capitalize">{selectedNode.type}</p>
                </div>
              </div>
              <button
                onClick={() => handleNavigate(selectedNode)}
                className="px-4 py-2 bg-tibet-blue text-white rounded-lg hover:bg-tibet-blue/90 transition-colors"
              >
                查看详情
              </button>
            </div>
          </div>
        )}

        {/* 图例 */}
        <div className="absolute bottom-20 left-6 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
          <div className="text-xs text-gray-500 mb-2">图例</div>
          <div className="space-y-1.5">
            {Object.entries(NODE_ICONS).map(([type, icon]) => (
              <div key={type} className="flex items-center gap-2 text-sm">
                <span>{icon}</span>
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: NODE_COLORS[type] }}></span>
                <span className="text-gray-600 capitalize">{type === 'place' ? '地点' : type === 'travelog' ? '旅行' : type === 'history' ? '历史' : type === 'business' ? '商家' : '路线'}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
