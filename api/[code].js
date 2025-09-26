import { kv } from '@vercel/kv';

export default async function handler(request, response) {
  try {
    // ★★핵심 수정 사항: URL 경로에서 직접 shortCode를 추출합니다★★
    const code = new URL(request.url, `https://${request.headers.host}`).pathname.substring(1);

    // code가 비어있다면 (예: 메인 페이지 접속), 여기서 처리를 중단합니다.
    // 이 부분은 middleware.js가 아니라면 다른 라우팅 로직이 처리해야 합니다.
    if (!code) {
        return response.redirect(307, '/fallback-or-main-page');
    }

    const userAgent = request.headers['user-agent'];

    // @vercel/kv는 자동으로 JSON을 파싱하므로 .get()을 그대로 사용합니다.
    const linkData = await kv.get(code);
    
    if (!linkData) {
      // DB에 코드가 없으면 메인 페이지로 리디렉션
      return response.redirect(307, '/');
    }

    const longUrl = linkData.url;

    const isScraper = /kakaotalk|facebook|twitter|slack|Discordbot|opengraph/i.test(userAgent);

    if (isScraper) {
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
        <meta charset="utf-8">
        <title>${title}</title>
        <meta property="og:title" content="${title}"><meta property="og:description" content="${description}">
        <meta property="og:image" content="${imageUrl}"><meta http-equiv="refresh" content="0; url=${longUrl}">
        </head><body><p>Redirecting to <a href="${longUrl}">${longUrl}</a>...</p></body></html>
      `;
      
      response.setHeader('Content-Type', 'text/html');
      return response.status(200).send(htmlResponse);

    } else {
      // 일반 사용자는 클릭 수를 업데이트하고 리디렉션
      linkData.clicks = (linkData.clicks || 0) + 1;
      await kv.set(code, linkData); // 객체를 그대로 저장
      
      response.setHeader('Location', longUrl);
      return response.status(302).end();
    }

  } catch (error) {
    console.error(error);
    return response.redirect(307, '/'); // 에러 발생 시 메인 페이지로
  }
}
