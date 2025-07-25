import { kv } from '@vercel/kv';
import { nanoid } from 'nanoid';

export default async function handler(request, response) {
  // POST 요청만 허용합니다.
  if (request.method !== 'POST') {
    return response.status(405).json({ message: 'POST 요청만 허용됩니다.' });
  }

  try {
    // 1. 요청에서 원본 URL(longUrl)을 가져옵니다.
    const { longUrl } = request.body;
    if (!longUrl) {
      return response.status(400).json({ message: 'URL을 입력해주세요.' });
    }

    // 2. nanoid를 사용해 7자리 고유 코드를 생성합니다.
    const shortCode = nanoid(7);

    // 3. 데이터베이스에 '단축 코드'와 '원본 URL'을 저장합니다.
    await kv.set(shortCode, longUrl);

    // 4. 완성된 단축 URL을 생성합니다.
    // request.headers.host는 '내도메인.com'과 같은 주소입니다.
    const shortUrl = `https://${request.headers.host}/${shortCode}`;

    // 5. 성공 응답과 함께 단축 URL을 반환합니다.
    return response.status(200).json({ shortUrl: shortUrl });

  } catch (error) {
    console.error(error);
    return response.status(500).json({ message: '서버에서 오류가 발생했습니다.' });
  }
}
