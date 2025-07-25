import { kv } from '@vercel/kv';
import * as cheerio from 'cheerio';

export default async function handler(request, response) {
  const { code } = request.query;
  const userAgent = request.headers['user-agent'];

  try {
    const longUrl = await kv.get(code);

    if (!longUrl) {
      return response.status(404).send('Not Found');
    }

    const isScraper = /kakaotalk|facebook|twitter|slack|Discordbot/i.test(userAgent);

    if (isScraper) {
      const pageResponse = await fetch(longUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36',
        },
      });
      
      if (!pageResponse.ok) {
        throw new Error('Failed to fetch the original URL');
      }

      const html = await pageResponse.text();
      const $ = cheerio.load(html);

      const title = $('meta[property="og:title"]').attr('content') || 'Linkedn Tips';
      const description = $('meta[property="og:description"]').attr('content') || '링크를 확인해보세요.';
      // ▼▼▼ 기본 이미지 주소 변경 ▼▼▼
      const imageUrl = $('meta[property="og:image"]').attr('content') || 'https://linkedntips.com/og-image.png';

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
      return response.redirect(301, longUrl);
    }

  } catch (error) {
    console.error(error);
    return response.status(500).send('Internal Server Error');
  }
}
