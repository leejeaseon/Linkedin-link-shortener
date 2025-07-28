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

    // ▼▼▼ 한국 시간(KST) 기준으로 이번 주 월요일을 계산하도록 수정 ▼▼▼
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000); // UTC 시간으로 변환
    const KST_OFFSET = 9 * 60 * 60 * 1000; // 한국은 UTC+9
    const kstNow = new Date(utc + KST_OFFSET);

    const dayOfWeek = kstNow.getDay(); // 0(일요일) ~ 6(토요일) in KST
    const distanceToMonday = (dayOfWeek === 0) ? 6 : dayOfWeek - 1;
    
    const startOfWeek = new Date(kstNow);
    startOfWeek.setDate(kstNow.getDate() - distanceToMonday);
    startOfWeek.setHours(0, 0, 0, 0);
    const startOfWeekTimestamp = startOfWeek.getTime();
    // ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲

    const sortedLinks = multiGet
      .map((linkData, index) => ({
        shortCode: keys[index],
        ...linkData,
      }))
      // ▼▼▼ 필터링 조건 2개 수정 및 추가 ▼▼▼
      .filter(item => 
        item.createdAt && // 1. createdAt 필드가 있는지 확인
        item.createdAt >= startOfWeekTimestamp && // 2. 이번 주에 생성되었는지 확인
        item.clicks > 0 // 3. 클릭 수가 0보다 큰지 확인
      )
      .sort((a, b) => b.clicks - a.clicks);

    const top10 = sortedLinks.slice(0, 10);
    
    return response.status(200).json(top10);

  } catch (error) {
    console.error(error);
    return response.status(500).json({ message: '서버에서 오류가 발생했습니다.' });
  }
}
