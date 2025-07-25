import * as cheerio from 'cheerio';

export default async function handler(request, response) {
  // 1. 쿼리에서 미리보기를 가져올 url을 추출합니다.
  const url = request.query.url;
  if (!url) {
    return response.status(400).json({ message: 'URL is required' });
  }

  try {
    // 2. fetch를 사용해 해당 url의 HTML 내용을 가져옵니다.
    const pageResponse = await fetch(url, {
      headers: {
        // 봇으로 인식되지 않도록 브라우저인 척 위장합니다.
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36',
      },
    });
    const html = await pageResponse.text();

    // 3. cheerio로 HTML을 분석하기 쉽게 만듭니다.
    const $ = cheerio.load(html);

    // 4. OG (Open Graph) 메타 태그에서 미리보기 정보를 추출합니다.
    const title = $('meta[property="og:title"]').attr('content') || '';
    const description = $('meta[property="og:description"]').attr('content') || '';
    const imageUrl = $('meta[property="og:image"]').attr('content') || '';

    // 5. 추출한 정보를 JSON 형태로 응답합니다.
    return response.status(200).json({ title, description, imageUrl });

  } catch (error) {
    console.error(error);
    return response.status(500).json({ message: 'Failed to fetch preview data.' });
  }
}
