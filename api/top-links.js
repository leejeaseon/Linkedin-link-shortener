import { kv } from '@vercel/kv';

export default async function handler(request, response) {
  if (request.method !== 'GET') {
    return response.status(405).json({ message: 'GET 요청만 허용됩니다.' });
  }

  try {
    const keys = [];
    for await (const key of kv.scanIterator()) {
      keys.push(key);
    }

    if (keys.length === 0) {
      return response.status(200).json([]);
    }

    const multiGet = await kv.mget(...keys);

    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const KST_OFFSET = 9 * 60 * 60 * 1000;
    const kstNow = new Date(utc + KST_OFFSET);

    const dayOfWeek = kstNow.getDay();
    const distanceToMonday = (dayOfWeek === 0) ? 6 : dayOfWeek - 1;
    
    const startOfWeek = new Date(kstNow);
    startOfWeek.setDate(kstNow.getDate() - distanceToMonday);
    startOfWeek.setHours(0, 0, 0, 0);
    const startOfWeekTimestamp = startOfWeek.getTime();

    const sortedLinks = multiGet
      .map((linkData, index) => ({
        shortCode: keys[index],
        ...linkData,
      }))
      .filter(item => 
        item.createdAt &&
        item.createdAt >= startOfWeekTimestamp &&
        item.clicks > 0 &&
        // ▼▼▼ 원본 URL이 'linkedin.com'을 포함하는지 확인하는 조건 추가 ▼▼▼
        item.url && item.url.includes('linkedin.com')
      )
      .sort((a, b) => b.clicks - a.clicks);

    const top10 = sortedLinks.slice(0, 10);
    
    return response.status(200).json(top10);

  } catch (error) {
    console.error(error);
    return response.status(500).json({ message: '서버에서 오류가 발생했습니다.' });
  }
}
