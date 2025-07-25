import { kv } from '@vercel/kv';
import * as cheerio from 'cheerio';

export default async function handler(request, response) {
  // 1. URL 주소에서 단축 코드(code)를 가져옵니다.
  const { code } = request.query;

  // 2. 접속한 대상의 User-Agent 정보를 확인합니다.
  const userAgent = request.headers['user-agent'];

  try {
    // 3. 데이터베이스에서 단축 코드로 원본 URL을 찾습니다.
    const longUrl = await kv.get(code);

    if (!longUrl) {
      return response.status(404).send('Not Found');
    }

    // 4. User-Agent에 'kakao' 또는 다른 소셜 미디어 스크래퍼 키워드가 포함되어 있는지 확인합니다.
    const isScraper = /kakaotalk|facebook|twitter|slack/i.test(userAgent);

    if (isScraper) {
      // 5. 스크래퍼일 경우: 리디렉션 대신 OG 태그가 포함된 HTML을 직접 생성하여 보여줍니다.
      const pageResponse = await fetch(longUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36',
        },
      });
      const html = await pageResponse.text();
      const $ = cheerio.load(html);

      const title = $('meta[property="og:title"]').attr('content') || 'Linkedn Tips';
      const description = $('meta[property="og:description"]').attr('content') || '링크를 확인해보세요.';
      const imageUrl = $('meta[property="og:image"]').attr('content') || 'https://linkedin-link-shortener.vercel.app/og-image.png';

      // 카카오톡 미리보기에 필요한 OG 태그를 담은 HTML을 직접 만듭니다.
      const htmlResponse = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>${title}</title>
            <meta property="og:title" content="${title}">
            <meta property="og:description" content="${description}">
            <meta property="og:image" content="${imageUrl}">
            <meta http-equiv="refresh" content="0; url=${longUrl}">
          </head>
          <body>
            <p>Redirecting to <a href="${longUrl}">${longUrl}</a>...</p>
          </body>
        </html>
      `;
      
      response.setHeader('Content-Type', 'text/html');
      return response.status(200).send(htmlResponse);

    } else {
      // 6. 일반 사용자일 경우: 원래대로 리디렉션시킵니다.
      return response.redirect(301, longUrl);
    }

  } catch (error) {
    console.error(error);
    return response.status(500).send('Internal Server Error');
  }
}
