import { getCollection } from 'astro:content';

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

interface KnowledgeGraphData {
  nodes: KnowledgeNode[];
  edges: KnowledgeEdge[];
}

export async function buildKnowledgeGraph(): Promise<KnowledgeGraphData> {
  const [travelogs, histories, businesses, routes] = await Promise.all([
    getCollection('travelogs'),
    getCollection('histories'),
    getCollection('businesses'),
    getCollection('routes')
  ]);

  const nodes: KnowledgeNode[] = [];
  const edges: KnowledgeEdge[] = [];
  const placeMap = new Map<string, KnowledgeNode>();

  // 处理旅行日志节点
  travelogs.forEach(travelog => {
    nodes.push({
      id: travelog.slug,
      label: travelog.data.title,
      type: 'travelog'
    });

    // 创建地点节点
    travelog.data.points?.forEach(point => {
      const key = `${point.lat.toFixed(4)}-${point.lng.toFixed(4)}`;
      if (!placeMap.has(key)) {
        const placeNode: KnowledgeNode = {
          id: key,
          label: point.name,
          type: 'place',
          lat: point.lat,
          lng: point.lng
        };
        placeMap.set(key, placeNode);
        nodes.push(placeNode);
      }

      // 连接旅行日志和地点
      edges.push({
        source: travelog.slug,
        target: key,
        label: '途经'
      });
    });
  });

  // 处理历史节点
  histories.forEach(history => {
    nodes.push({
      id: history.slug,
      label: history.data.title,
      type: 'history'
    });

    // 连接相关地点
    history.data.events?.forEach(event => {
      const key = `${event.lat.toFixed(4)}-${event.lng.toFixed(4)}`;
      if (!placeMap.has(key)) {
        const placeNode: KnowledgeNode = {
          id: key,
          label: `地点 ${key}`,
          type: 'place',
          lat: event.lat,
          lng: event.lng
        };
        placeMap.set(key, placeNode);
        nodes.push(placeNode);
      }

      edges.push({
        source: history.slug,
        target: key,
        label: `${event.year}年`
      });
    });
  });

  // 处理商家节点
  businesses.forEach(business => {
    nodes.push({
      id: business.slug,
      label: business.data.title,
      type: 'business',
      lat: business.data.lat,
      lng: business.data.lng
    });

    // 连接到对应地点
    const key = `${business.data.lat.toFixed(4)}-${business.data.lng.toFixed(4)}`;
    if (!placeMap.has(key)) {
      const placeNode: KnowledgeNode = {
        id: key,
        label: business.data.title,
        type: 'place',
        lat: business.data.lat,
        lng: business.data.lng
      };
      placeMap.set(key, placeNode);
      nodes.push(placeNode);
    }

    edges.push({
      source: business.slug,
      target: key,
      label: '位于'
    });
  });

  // 处理路线节点
  routes.forEach(route => {
    nodes.push({
      id: route.slug,
      label: route.data.title,
      type: 'route'
    });

    // 连接路线和地点
    route.data.points?.forEach((point, index) => {
      const key = `${point.lat.toFixed(4)}-${point.lng.toFixed(4)}`;
      if (!placeMap.has(key)) {
        const placeNode: KnowledgeNode = {
          id: key,
          label: point.name,
          type: 'place',
          lat: point.lat,
          lng: point.lng
        };
        placeMap.set(key, placeNode);
        nodes.push(placeNode);
      }

      edges.push({
        source: route.slug,
        target: key,
        label: index === 0 ? '起点' : index === route.data.points.length - 1 ? '终点' : `站点${index + 1}`
      });
    });
  });

  // 建立地点之间的连接（基于距离）
  const placeNodes = Array.from(placeMap.values());
  for (let i = 0; i < placeNodes.length; i++) {
    for (let j = i + 1; j < placeNodes.length; j++) {
      const p1 = placeNodes[i];
      const p2 = placeNodes[j];
      if (p1.lat && p1.lng && p2.lat && p2.lng) {
        const distance = Math.sqrt(
          Math.pow((p1.lat - p2.lat) * 111, 2) +
          Math.pow((p1.lng - p2.lng) * 111 * Math.cos(p1.lat * Math.PI / 180), 2)
        );
        // 如果距离小于 50km，建立连接
        if (distance < 50) {
          edges.push({
            source: p1.id,
            target: p2.id,
            label: `相距${Math.round(distance)}km`
          });
        }
      }
    }
  }

  return { nodes, edges };
}
