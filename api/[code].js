import { kv } from '@vercel/kv';

export default async function handler(request, response) {
  // 1. URL 주소에서 단축 코드(code)를 가져옵니다.
  // 예: /api/aB7cD1e -> 'aB7cD1e'
  const { code } = request.query;

  try {
    // 2. 데이터베이스에서 단축 코드로 원본 URL을 찾습니다.
    const longUrl = await kv.get(code);

    // 3. 원본 URL이 존재하면, 그 주소로 리디렉션시킵니다.
    if (longUrl) {
      // 301 리디렉션은 '영구 이동'을 의미합니다.
      return response.redirect(301, longUrl);
    } else {
      // 4. 코드가 존재하지 않으면, 404 Not Found 오류를 반환합니다.
      return response.status(404).json({ message: 'URL을 찾을 수 없습니다.' });
    }
  } catch (error) {
    console.error(error);
    return response.status(500).json({ message: '서버에서 오류가 발생했습니다.' });
  }
}
