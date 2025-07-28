import { kv } from '@vercel/kv';

export default async function handler(request, response) {
  console.log('--- API 요청 시작 ---');
  const { code } = request.query;
  const userAgent = request.headers['user-agent'];
  console.log(`요청받은 단축 코드: ${code}`);
  console.log(`접속 User-Agent: ${userAgent}`);

  try {
    const longUrl = await kv.get(code);
    if (!longUrl) {
      console.log('DB에서 URL을 찾지 못했습니다.');
      return response.status(404).send('Not Found');
    }
    console.log(`DB에서 찾은 원본 URL: ${longUrl}`);

    const isScraper = /kakaotalk|facebook|twitter|slack|Discordbot|opengraph/i.test(userAgent);
    console.log(`스크래퍼 여부: ${isScraper}`);

    if (isScraper) {
      console.log('스크래퍼로 판단, Microlink API로 미리보기 정보 요청을 시작합니다.');
      
      const apiKey = process.env.MICROLINK_API_KEY;
      console.log(`Microlink API 키 존재 여부: ${apiKey ? '있음' : '없음!!!'}`);

      const apiUrl = `https://api.microlink.io/?url=${encodeURIComponent(longUrl)}`;
      console.log(`호출할 Microlink API 주소: ${apiUrl}`);
      
      const previewResponse = await fetch(apiUrl, {
        headers: { 'x-api-key': apiKey }
      });
      
      console.log(`Microlink API 응답 상태 코드: ${previewResponse.status}`);
      const responseText = await previewResponse.text();
      console.log(`Microlink API 응답 내용(Raw Text): ${responseText}`);

      if (!previewResponse.ok) {
        throw new Error('Microlink API로부터 에러 응답을 받았습니다.');
      }
      
      const preview = JSON.parse(responseText);
      const previewData = preview.data;

      const title = previewData.title || 'Linkedn Tips';
      const description = previewData.description || '링크를 확인해보세요.';
      const imageUrl = previewData.image?.url || 'https://linkedntips.com/og-image.png';
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
            <meta http-equiv="refresh" content="0; url=${longUrl}">
          </head>
          <body><p>Redirecting...</p></body>
        </html>
      `;
      
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
