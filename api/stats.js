import { kv } from '@vercel/kv';

export default async function handler(request, response) {
  if (request.method !== 'GET') {
    return response.status(405).json({ message: 'GET 요청만 허용됩니다.' });
  }

  try {
    const { code } = request.query;
    if (!code) {
      return response.status(400).json({ message: '단축 코드가 필요합니다.' });
    }

    const dataString = await kv.get(code);
    if (!dataString) {
      return response.status(404).json({ message: '데이터를 찾을 수 없습니다.' });
    }

    const linkData = JSON.parse(dataString);
    
    return response.status(200).json({ clicks: linkData.clicks || 0 });

  } catch (error) {
    console.error(error);
    return response.status(500).json({ message: '서버에서 오류가 발생했습니다.' });
  }
}
