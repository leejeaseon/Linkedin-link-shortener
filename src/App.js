import React, { useState, useEffect } from 'react';
import { Linkedin } from 'lucide-react';
import { Helmet } from 'react-helmet';

function App() {
  const [originalLink, setOriginalLink] = useState('');
  const [shortUrl, setShortUrl] = useState('');

  useEffect(() => {
    if (window.Kakao && !window.Kakao.isInitialized()) {
      window.Kakao.init(process.env.REACT_APP_KAKAO_KEY);
    }
  }, []);
  
  const handleShorten = async () => {
    if (!originalLink) {
      alert('URL을 입력해주세요.');
      return;
    }
    try {
      const response = await fetch('/api/shorten', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ longUrl: originalLink }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || '알 수 없는 오류');
      setShortUrl(data.shortUrl);
    } catch (error) {
      alert(`오류가 발생했습니다: ${error.message}`);
      setShortUrl('');
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(shortUrl);
    alert('링크가 복사되었습니다!');
  };
  
  // shareKakao 함수를 아래와 같이 수정합니다.
  const shareKakao = async () => {
    if (!shortUrl || !originalLink) {
      alert('먼저 URL을 단축해주세요.');
      return;
    }
    if (!window.Kakao) return alert('카카오 SDK 로딩 실패');

    try {
      // 1. 우리 서버의 get-preview API에 원본 링크의 미리보기 정보를 요청합니다.
      const response = await fetch(`/api/get-preview?url=${encodeURIComponent(originalLink)}`);
      const preview = await response.json();

      if (!response.ok) {
        throw new Error(preview.message || '미리보기 정보를 가져올 수 없습니다.');
      }

      // 2. 받아온 미리보기 정보 + 단축 URL 조합으로 카카오톡 메시지를 보냅니다.
      window.Kakao.Link.sendDefault({
        objectType: 'feed',
        content: {
          title: preview.title || '공유된 링크',
          description: preview.description || '내용을 확인해보세요.',
          imageUrl: preview.imageUrl || 'https://linkedin-link-shortener.vercel.app/og-image.png',
          link: {
            mobileWebUrl: shortUrl, // 링크는 단축 URL
            webUrl: shortUrl,       // 링크는 단축 URL
          },
        },
        buttons: [
          {
            title: '게시물 보러가기',
            link: {
              mobileWebUrl: shortUrl, // 버튼 링크도 단축 URL
              webUrl: shortUrl,       // 버튼 링크도 단축 URL
            },
          },
        ],
      });
    } catch (error) {
      alert(`카카오톡 공유 중 오류가 발생했습니다: ${error.message}`);
    }
  };

  const shareUrls = {
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shortUrl)}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shortUrl)}`,
    threads: `https://www.threads.net/intent/post?url=${encodeURIComponent(shortUrl)}`
  };
  
  const shareBtnBase = {
    padding: '6px 12px', fontSize: 12, borderRadius: 6,
    textDecoration: 'none', color: '#fff', border: 'none', cursor: 'pointer'
  };
  const shareBtnStyles = {
    linkedin: { background: '#0A66C2' },
    twitter: { background: '#1DA1F2' },
    threads: { background: '#10141A' }
  };

  return (
    <div style={{ background: '#f3f2ef', minHeight: '100vh', display: 'flex',
                  justifyContent: 'center', alignItems: 'center', padding: 24 }}>
      <Helmet>
        <title>URL Shortener</title>
        <meta name="description" content="긴 주소를 짧고 공유하기 쉽게 만들어보세요." />
      </Helmet>
      <div style={{ background: '#fff', borderRadius: 16,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)', padding: 32,
                    maxWidth: 500, width: '100%', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
          <Linkedin color="#0a66c2" size={28} />
          <h1 style={{ fontSize: 20, fontWeight: 600, color: '#0a66c2', margin: 0 }}>
            URL Shortener
          </h1>
        </div>
        <p style={{ fontSize: 14, color: '#555', marginBottom: 16 }}>
          긴 URL을 짧은 주소로 만들어 공유해 보세요.
        </p>
        <input type="text" placeholder="여기에 긴 URL을 붙여넣으세요"
          value={originalLink} onChange={e => setOriginalLink(e.target.value)}
          style={{ width: '100%', padding: 12, marginBottom: 12,
                   border: '1px solid #ccc', borderRadius: 8, boxSizing: 'border-box' }} />
        <button onClick={handleShorten}
          style={{ width: '100%', padding: 12, background: '#0a66c2',
                   color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600 }}>
          단축 링크 만들기
        </button>
        {shortUrl && (
          <div style={{ marginTop: 24 }}>
            <div style={{ padding: 16, border: '1px solid #cce0ff',
                          borderRadius: 8, display: 'flex', alignItems: 'center',
                          justifyContent: 'space-between' }}>
              <a href={shortUrl} target="_blank" rel="noreferrer"
                style={{ color: '#0a66c2', wordBreak: 'break-all', flex: 1 }}>
                {shortUrl}
              </a>
              <button onClick={handleCopy}
                style={{ padding: '6px 12px', background: '#eee', borderRadius: 6, border: 'none' }}>
                복사
              </button>
            </div>
            <div style={{ marginTop: 16, display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
              <button onClick={shareKakao}
                style={{ ...shareBtnBase, background: '#fee500', color: '#191919' }}>
                카카오톡 공유
              </button>
              <a href={shareUrls.linkedin} target="_blank" rel="noreferrer"
                style={{ ...shareBtnBase, ...shareBtnStyles.linkedin }}>
                LinkedIn
              </a>
              <a href={shareUrls.twitter} target="_blank" rel="noreferrer"
                style={{ ...shareBtnBase, ...shareBtnStyles.twitter }}>
                Twitter
              </a>
              <a href={shareUrls.threads} target="_blank" rel="noreferrer"
                style={{ ...shareBtnBase, ...shareBtnStyles.threads }}>
                Threads
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
