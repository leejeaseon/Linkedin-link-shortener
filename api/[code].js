import { kv } from '@vercel/kv';
import * as cheerio from 'cheerio';

export default async function handler(request, response) {
  const { code } = request.query;
  const userAgent = request.headers['user-agent'];

  try {
    const dataString = await kv.get(code); // DB에서 데이터를 문자열로 가져옵니다.
    if (!dataString) {
      return response.status(404).send('Not Found');
    }

    const linkData = JSON.parse(dataString); // 문자열을 JSON 객체로 변환합니다.
    const longUrl = linkData.url;

    const isScraper = /kakaotalk|facebook|twitter|slack|Discordbot|opengraph/i.test(userAgent);

    if (isScraper) {
      // 스크래퍼는 클릭 수를 증가시키지 않고 미리보기만 생성합니다.
      const apiKey = process.env.LINKPREVIEW_API_KEY;
      const apiUrl = `https://api.linkpreview.net/?key=${apiKey}&q=${encodeURIComponent(longUrl)}`;
      const previewResponse = await fetch(apiUrl);
      if (!previewResponse.ok) throw new Error('Failed to fetch preview');
      const preview = await previewResponse.json();
      
      const title = preview.title || 'Linkedn Tips';
      const description = preview.description || '링크를 확인해보세요.';
      const imageUrl = preview.image || 'https://linkedntips.com/og-image.png';

      const htmlResponse = `
        <!DOCTYPE html><html><head>
        <meta charset="utf-8"><title>${title}</title>
        <meta property="og:title" content="${title}"><meta property="og:description" content="${description}">
        <meta property="og:image" content="${imageUrl}"><meta http-equiv="refresh" content="0; url=${longUrl}">
        </head><body><p>Redirecting...</p></body></html>
      `;
      
      response.setHeader('Content-Type', 'text/html');
      return response.status(200).send(htmlResponse);

    } else {
      // ▼▼▼ 일반 사용자 접속 시 클릭 수를 1 증가시키고 다시 저장합니다. ▼▼▼
      linkData.clicks += 1;
      await kv.set(code, JSON.stringify(linkData));
      
      // 클릭 수 업데이트 후 리디렉션합니다.
      return response.redirect(301, longUrl);
    }

  } catch (error) {
    console.error(error);
    return response.status(500).send('Internal Server Error');
  }
}
