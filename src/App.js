import React, { useState, useEffect } from 'react';
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

  // ▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼
  // 이 함수의 기능을 클립보드 복사로만 단순화했습니다.
  const handleShareService = () => {
    const serviceUrl = 'https://linkedin-link-shortener.vercel.app';
    navigator.clipboard.writeText(serviceUrl);
    alert('서비스 링크가 복사되었습니다!');
  };
  // ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲
  
  const shareKakao = async () => {
    if (!shortUrl || !originalLink) {
      alert('먼저 URL을 단축해주세요.');
      return;
    }
    if (!window.Kakao) return alert('카카오 SDK 로딩 실패');
    try {
      const response = await fetch(`/api/get-preview?url=${encodeURIComponent(originalLink)}`);
      const preview = await response.json();
      if (!response.ok) {
        throw new Error(preview.message || '미리보기 정보를 가져올 수 없습니다.');
      }
      window.Kakao.Link.sendDefault({
        objectType: 'feed',
        content: {
          title: preview.title || '공유된 링크',
          description: preview.description || '내용을 확인해보세요.',
          imageUrl: preview.imageUrl || 'https://linkedin-link-shortener.vercel.app/og-image.png',
          link: { mobileWebUrl: shortUrl, webUrl: shortUrl },
        },
        buttons: [
          {
            title: '게시물 보러가기',
            link: { mobileWebUrl: shortUrl, webUrl: shortUrl },
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
    <div style={{ background: 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)', 
                  minHeight: '100vh', display: 'flex',
                  justifyContent: 'center', alignItems: 'center', padding: 24 }}>
      <Helmet>
        <title>Linkedn Tips</title>
        <meta name="description" content="긴 링크드인 주소를 짧고 공유하기 쉽게 만들어보세요." />
        <style>
          {`
            html, body {
              margin: 0;
              padding: 0;
              width: 100%;
              height: 100%;
            }
            .btn-shorten:hover { background-color: #ff4757 !important; }
            .btn-copy:hover { background-color: #2f3542 !important; color: white !important; }
            .btn-kakao:hover { background-color: #fbe500 !important; filter: brightness(0.9); }
            .btn-linkedin:hover { background-color: #004182 !important; }
            .btn-twitter:hover { background-color: #0c8de4 !important; }
            .btn-threads:hover { background-color: #444444 !important; }
            .btn-share-service:hover { background-color: #d0ebff !important; }
          `}
        </style>
      </Helmet>
      <div style={{ background: '#fff', borderRadius: 16,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)', padding: 32,
                    maxWidth: 500, width: '100%', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
          <h1 style={{ fontSize: 20, fontWeight: 600, color: '#0a66c2', margin: 0 }}>
            Linkedn Tips
          </h1>
        </div>
        <p style={{ fontSize: 14, color: '#555', marginBottom: 16 }}>
          긴 링크드인 URL을 짧은 주소로 만들어 공유해 보세요.
        </p>
        <input type="text" placeholder="여기에 링크드인 URL을 붙여넣으세요"
          value={originalLink} onChange={e => setOriginalLink(e.target.value)}
          style={{ width: '100%', padding: 12, marginBottom: 12,
                   border: '1px solid #ccc', borderRadius: 8, boxSizing: 'border-box' }} />
        
        <button
          className="btn-shorten"
          onClick={handleShorten}
          style={{ width: '100%', padding: 12, background: '#0a66c2',
                   color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600,
                   cursor: 'pointer' }}>
          링크 이쁘게 줄이기
        </button>

        <button
          className="btn-share-service"
          onClick={handleShareService}
          style={{ width: '100%', padding: 10, background: '#e7f5ff', // 배경색 변경
                   color: '#1971c2', // 글자색 변경
                   border: '1px solid #a5d8ff', // 테두리색 변경
                   borderRadius: 8, fontWeight: 600,
                   cursor: 'pointer', marginTop: '8px' }}>
          이 서비스 공유하기
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
              <button
                className="btn-copy"
                onClick={handleCopy}
                style={{ padding: '6px 12px', background: '#eee', borderRadius: 6, border: 'none',
                         cursor: 'pointer' }}>
                복사
              </button>
            </div>
            <div style={{ marginTop: 16, display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
              <button
                className="btn-kakao"
                onClick={shareKakao}
                style={{ ...shareBtnBase, background: '#fee500', color: '#191919' }}>
                카카오톡 공유
              </button>
              <a
                className="btn-linkedin"
                href={shareUrls.linkedin} target="_blank" rel="noreferrer"
                style={{ ...shareBtnBase, ...shareBtnStyles.linkedin }}>
                LinkedIn
              </a>
              <a
                className="btn-twitter"
                href={shareUrls.twitter} target="_blank" rel="noreferrer"
                style={{ ...shareBtnBase, ...shareBtnStyles.twitter }}>
                Twitter
              </a>
              <a
                className="btn-threads"
                href={shareUrls.threads} target="_blank" rel="noreferrer"
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
