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

    try {
      linkData = JSON.parse(dataString);
      longUrl = linkData.url;
    } catch (e) {
      linkData = null;
      longUrl = dataString;
    }

    const isScraper = /kakaotalk|facebook|twitter|slack|Discordbot|opengraph/i.test(userAgent);

    if (isScraper) {
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
      if (linkData) {
        linkData.clicks = (linkData.clicks || 0) + 1;
        await kv.set(code, JSON.stringify(linkData));
      }
      
      // ▼▼▼ 리디렉션 방식을 헤더 설정으로 변경했습니다. ▼▼▼
      response.setHeader('Location', longUrl);
      return response.status(302).end();
    }

  } catch (error) {
    console.error(error);
    return response.status(500).send('Internal Server Error');
  }
}
