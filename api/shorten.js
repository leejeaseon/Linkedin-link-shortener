import { kv } from '@vercel/kv';
import { nanoid } from 'nanoid';

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ message: 'POST 요청만 허용됩니다.' });
  }

  try {
    const { longUrl } = request.body;
    if (!longUrl) {
      return response.status(400).json({ message: 'URL을 입력해주세요.' });
    }

    const shortCode = nanoid(7);

    // ▼▼▼ 데이터에 생성 날짜(createdAt)를 추가합니다. ▼▼▼
    const linkData = {
      url: longUrl,
      clicks: 0,
      createdAt: Date.now(), // 현재 시간을 숫자로 저장
    };
    await kv.set(shortCode, JSON.stringify(linkData));

    const shortUrl = `https://${request.headers.host}/${shortCode}`;

    return response.status(200).json({ shortUrl: shortUrl });

  } catch (error) {
    console.error(error);
    return response.status(500).json({ message: '서버에서 오류가 발생했습니다.' });
  }
}
