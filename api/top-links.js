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

    // ▼▼▼ 이번 주 월요일 0시 타임스탬프를 계산하는 로직 추가 ▼▼▼
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0(일요일) ~ 6(토요일)
    const distanceToMonday = (dayOfWeek === 0) ? 6 : dayOfWeek - 1; // 월요일까지의 날짜 차이
    
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - distanceToMonday);
    startOfWeek.setHours(0, 0, 0, 0); // 월요일 0시 0분 0초
    const startOfWeekTimestamp = startOfWeek.getTime();
    // ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲

    const sortedLinks = multiGet
      .map((linkData, index) => ({
        shortCode: keys[index],
        ...linkData,
      }))
      // ▼▼▼ 이번 주에 생성된 링크만 필터링하는 조건 추가 ▼▼▼
      .filter(item => typeof item.clicks === 'number' && item.createdAt >= startOfWeekTimestamp)
      .sort((a, b) => b.clicks - a.clicks);

    const top10 = sortedLinks.slice(0, 10);
    
    return response.status(200).json(top10);

  } catch (error) {
    console.error(error);
    return response.status(500).json({ message: '서버에서 오류가 발생했습니다.' });
  }
}
