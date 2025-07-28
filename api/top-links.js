import { kv } from '@vercel/kv';

export default async function handler(request, response) {
  if (request.method !== 'GET') {
    return response.status(405).json({ message: 'GET 요청만 허용됩니다.' });
  }

  try {
    // 1. 데이터베이스의 모든 키(단축 코드)를 스캔하여 가져옵니다.
    const keys = [];
    for await (const key of kv.scanIterator()) {
      keys.push(key);
    }

    if (keys.length === 0) {
      return response.status(200).json([]);
    }

    // 2. 모든 키에 해당하는 데이터(URL, 클릭 수)를 한 번에 가져옵니다.
    const multiGet = await kv.mget(...keys);

    // 3. 클릭 수(clicks)를 기준으로 내림차순 정렬합니다.
    const sortedLinks = multiGet
      .map((linkData, index) => ({
        shortCode: keys[index],
        ...linkData, // url, clicks 포함
      }))
      .filter(item => typeof item.clicks === 'number') // 클릭 수 데이터가 있는 것만 필터링
      .sort((a, b) => b.clicks - a.clicks);

    // 4. 상위 10개만 잘라서 반환합니다.
    const top10 = sortedLinks.slice(0, 10);
    
    return response.status(200).json(top10);

  } catch (error) {
    console.error(error);
    return response.status(500).json({ message: '서버에서 오류가 발생했습니다.' });
  }
}
