import { kv } from '@vercel/kv';
import * as cheerio from 'cheerio';

export default async function handler(request, response) {
  console.log('--- API 요청 시작 ---');
  const { code } = request.query;
  console.log(`요청받은 단축 코드: ${code}`);

  const userAgent = request.headers['user-agent'];
  console.log(`접속 User-Agent: ${userAgent}`);

  try {
    const longUrl = await kv.get(code);
    if (!longUrl) {
      console.log('DB에서 URL을 찾지 못했습니다.');
      return response.status(404).send('Not Found');
    }
    console.log(`DB에서 찾은 원본 URL: ${longUrl}`);

    const isScraper = /kakaotalk|facebook|twitter|slack|Discordbot/i.test(userAgent);
    console.log(`스크래퍼 여부: ${isScraper}`);

    if (isScraper) {
      console.log('스크래퍼로 판단, HTML 미리보기를 생성합니다.');
      
      const pageResponse = await fetch(longUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36',
        },
      });
      console.log(`원본 URL fetch 상태 코드: ${pageResponse.status}`);

      if (!pageResponse.ok) {
        console.error('원본 URL을 가져오는 데 실패했습니다.');
        throw new Error('Failed to fetch the original URL');
      }

      const html = await pageResponse.text();
      const $ = cheerio.load(html);

      const title = $('meta[property="og:title"]').attr('content') || 'Linkedn Tips';
      const description = $('meta[property="og:description"]').attr('content') || '링크를 확인해보세요.';
      const imageUrl = $('meta[property="og:image"]').attr('content') || 'https://linkedin-link-shortener.vercel.app/og-image.png';
      
      console.log(`추출된 제목: ${title}`);
      console.log(`추출된 이미지 URL: ${imageUrl}`);

      const htmlResponse = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>${title}</title>
            <meta property="og:title" content="${title}">
            <meta property="og:description" content="${description}">
            <meta property="og:image" content="${imageUrl}">
          </head>
          <body>
            <h1>${title}</h1>
            <p>미리보기 생성용 페이지입니다.</p>
          </body>
        </html>
      `;
      
      console.log('미리보기용 HTML 생성 완료. 응답을 보냅니다.');
      response.setHeader('Content-Type', 'text/html');
      return response.status(200).send(htmlResponse);

    } else {
      console.log('일반 사용자이므로 리디렉션합니다.');
      return response.redirect(301, longUrl);
    }

  } catch (error) {
    console.error('--- !!! CATCH 블록에서 오류 발생 !!! ---');
    console.error(error);
    return response.status(500).send('Internal Server Error');
  }
}
