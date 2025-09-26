import { kv } from '@vercel/kv';

export default async function handler(request, response) {
  // URL 경로에서 shortCode를 가져오도록 수정 (Vercel 권장 방식)
  const code = request.query.code;
  const userAgent = request.headers['user-agent'];

  try {
    // 1. KV에서 데이터를 문자열로 가져옵니다.
    const linkDataString = await kv.get(code);
    
    if (!linkDataString) {
      // 데이터가 없으면 메인 페이지로 리디렉션하거나 404를 보냅니다.
      // 여기서는 메인 페이지로 보내는 것이 사용자 경험에 더 좋을 수 있습니다.
      return response.redirect(307, '/');
    }

    // 2. 가져온 문자열을 자바스크립트 객체로 파싱합니다. (★★핵심 수정 사항★★)
    const linkData = JSON.parse(linkDataString);
    const longUrl = linkData.url;

    // User Agent를 확인하여 스크레이퍼(봇)인지 판별
    const isScraper = /kakaotalk|facebook|twitter|slack|Discordbot|opengraph/i.test(userAgent);

    if (isScraper) {
      // 스크레이퍼일 경우, OG 메타 태그가 포함된 HTML을 동적으로 생성하여 반환
      const apiKey = process.env.LINKPREVIEW_API_KEY;
      const apiUrl = `https://api.linkpreview.net/?key=${apiKey}&q=${encodeURIComponent(longUrl)}`;
      
      const previewResponse = await fetch(apiUrl);
      if (!previewResponse.ok) throw new Error('Failed to fetch preview');
      
      const preview = await previewResponse.json();

      const title = preview.title || 'Linkedn Tips';
      const description = preview.description || '링크를 확인해보세요.';
      const imageUrl = preview.image || 'https://linkedntips.com/og-image.png';

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
      // 일반 사용자일 경우, 클릭 수를 1 증가시키고 리디렉션
      linkData.clicks = (linkData.clicks || 0) + 1;
      // 3. 업데이트된 객체를 다시 문자열로 만들어 저장합니다.
      await kv.set(code, JSON.stringify(linkData));
      
      // Location 헤더에 정상적인 longUrl을 담아 302 리디렉션
      response.setHeader('Location', longUrl);
      return response.status(302).end();
    }

  } catch (error) {
    console.error(error);
    // 에러 발생 시 안전하게 메인 페이지로 리디렉션
    return response.redirect(307, '/');
  }
}
