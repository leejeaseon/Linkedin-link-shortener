import { kv } from '@vercel/kv';

export default async function handler(request, response) {
  const { code } = request.query;
  const userAgent = request.headers['user-agent'];

  try {
    const longUrl = await kv.get(code);
    if (!longUrl) {
      return response.status(404).send('Not Found');
    }

    const isScraper = /kakaotalk|facebook|twitter|slack|Discordbot|opengraph/i.test(userAgent);

    if (isScraper) {
      // ▼▼▼ JsonLink API를 호출하는 코드로 변경 ▼▼▼
      const apiKey = process.env.JSONLINK_API_KEY;
      const apiUrl = `https://jsonlink.io/api/extractor?url=${longUrl}&api_key=${apiKey}`;
      
      const previewResponse = await fetch(apiUrl);
      if (!previewResponse.ok) {
        throw new Error('Failed to fetch preview data from JsonLink');
      }
      
      const preview = await previewResponse.json();

      const title = preview.title || 'Linkedn Tips';
      const description = preview.description || '링크를 확인해보세요.';
      const imageUrl = preview.image || 'https://linkedntips.com/og-image.png';
      // ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲

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
