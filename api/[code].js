import { kv } from '@vercel/kv';

export default async function handler(request, response) {
  const { code } = request.query;
  const userAgent = request.headers['user-agent'];

  try {
    const dataString = await kv.get(code);
    if (!dataString) {
      return response.status(404).send('Not Found');
    }

    let linkData;
    let longUrl;

    // ▼▼▼ 데이터가 예전 방식인지, 새로운 방식인지 확인하는 로직 추가 ▼▼▼
    try {
      // 새로운 방식(JSON)으로 먼저 분석 시도
      linkData = JSON.parse(dataString);
      longUrl = linkData.url;
    } catch (e) {
      // 분석에 실패하면 예전 방식(단순 문자열)으로 간주
      linkData = null; // 클릭 수를 업데이트할 수 없도록 null 처리
      longUrl = dataString;
    }
    // ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲

    const isScraper = /kakaotalk|facebook|twitter|slack|Discordbot|opengraph/i.test(userAgent);

    if (isScraper) {
      // 스크래퍼는 클릭 수를 증가시키지 않습니다.
      const apiKey = process.env.LINKPREVIEW_API_KEY;
      const apiUrl = `https://api.linkpreview.net/?key=${apiKey}&q=${encodeURIComponent(longUrl)}`;
      
      const previewResponse = await fetch(apiUrl);
      if (!previewResponse.ok) {
        const errorText = await previewResponse.text();
        console.error("LinkPreview Error Response:", errorText);
        throw new Error(`Failed to fetch preview data from LinkPreview with status: ${previewResponse.status}`);
      }
      
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
      // 일반 사용자 접속 시, 새로운 방식의 데이터일 경우에만 클릭 수를 증가시킵니다.
      if (linkData) {
        linkData.clicks = (linkData.clicks || 0) + 1;
        await kv.set(code, JSON.stringify(linkData));
      }
      
      // 클릭 수 업데이트 후 리디렉션합니다.
      return response.redirect(longUrl);
    }

  } catch (error) {
    console.error(error);
    return response.status(500).send('Internal Server Error');
  }
}
