// Netlify Function: 审核通过邮件通知
// 使用 Resend 发送邮件

interface ReviewEvent {
  type: 'published' | 'draft';
  collection: string;
  slug: string;
  title: string;
  author?: string;
}

export default async function handler(req: Request) {
  // 仅处理 POST 请求
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const event: ReviewEvent = await req.json();

    // 构建邮件内容
    const emailContent = buildEmailContent(event);

    // 发送邮件（需要配置 RESEND_API_KEY 环境变量）
    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      console.log('RESEND_API_KEY not configured, skipping email send');
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Email notification skipped (RESEND_API_KEY not configured)' 
      }));
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: '西藏时空地图志 <noreply@tibet-map.com>',
        to: ['admin@tibet-map.com'],
        subject: emailContent.subject,
        html: emailContent.html
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to send email: ${response.statusText}`);
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Email notification error:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to send notification' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

function buildEmailContent(event: ReviewEvent): { subject: string; html: string } {
  const baseUrl = process.env.URL || 'https://tibet-map.com';
  
  const collectionLabels: Record<string, string> = {
    travelogs: '旅行者笔记',
    businesses: '商家标注',
    histories: '历史叙事',
    routes: '地理路线'
  };

  const collectionLabel = collectionLabels[event.collection] || event.collection;
  const actionLabel = event.type === 'published' ? '发布' : '保存为草稿';

  const subject = `【审核通知】新的${collectionLabel}：${event.title}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #1a4b6e, #c41e3a); color: white; padding: 30px; border-radius: 12px 12px 0 0; }
    .content { background: #f5f0e8; padding: 30px; border-radius: 0 0 12px 12px; }
    .title { font-size: 24px; font-weight: bold; margin: 0 0 10px 0; }
    .meta { font-size: 14px; opacity: 0.9; }
    .info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .info-row { display: flex; padding: 8px 0; border-bottom: 1px solid #eee; }
    .info-row:last-child { border-bottom: none; }
    .info-label { font-weight: 600; width: 100px; color: #666; }
    .info-value { flex: 1; color: #333; }
    .btn { display: inline-block; background: #1a4b6e; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 20px; }
    .footer { text-align: center; color: #888; font-size: 12px; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 class="title">西藏时空地图志</h1>
      <p class="meta">审核通知</p>
    </div>
    <div class="content">
      <p>您好，</p>
      <p>有一篇新的<strong>${collectionLabel}</strong>已${actionLabel}：</p>
      
      <div class="info">
        <div class="info-row">
          <span class="info-label">标题</span>
          <span class="info-value">${event.title}</span>
        </div>
        <div class="info-row">
          <span class="info-label">类型</span>
          <span class="info-value">${collectionLabel}</span>
        </div>
        <div class="info-row">
          <span class="info-label">作者</span>
          <span class="info-value">${event.author || '未知'}</span>
        </div>
        <div class="info-row">
          <span class="info-label">状态</span>
          <span class="info-value">${actionLabel}</span>
        </div>
      </div>
      
      <p>请登录管理后台查看并进行审核。</p>
      
      <a href="${baseUrl}/admin" class="btn">打开管理后台</a>
      
      <div class="footer">
        <p>此邮件由系统自动发送，请勿回复</p>
        <p>© 2025 西藏时空地图志</p>
      </div>
    </div>
  </div>
</body>
</html>
`;

  return { subject, html };
}
