import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { X } from 'lucide-react';

function App() {
  const [originalLink, setOriginalLink] = useState('');
  const [shortUrl, setShortUrl] = useState('');

  useEffect(() => {
    if (window.Kakao && !window.Kakao.isInitialized()) {
      window.Kakao.init(process.env.REACT_APP_KAKAO_KEY);
    }
  }, []);
  
  const handleClearInput = () => {
    setOriginalLink('');
  };

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

  const handleShareService = () => {
    const serviceUrl = 'https://linkedntips.com';
    navigator.clipboard.writeText(serviceUrl);
    alert('서비스 링크가 복사되었습니다!');
  };
  
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
          imageUrl: preview.imageUrl || 'https://linkedntips.com/og-image.png',
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
        {/* 기본 정보 */}
        <title>Linkedn Tips | 깔끔한 링크드인 URL 단축 서비스</title>
        <meta name="description" content="복잡하고 긴 링크드인(LinkedIn) 게시물 주소를 공유하기 쉬운 짧은 URL로 변환하세요. 소셜 미디어 공유 시 깔끔한 미리보기를 제공합니다." />
        <meta name="keywords" content="링크드인, URL 단축, 링크 줄이기, 소셜 미디어 공유, URL shortener, LinkedIn" />
        <meta name="theme-color" content="#8ec5fc" />  
        <link rel="canonical" href="https://linkedntips.com" />

        {/* 검색엔진 소유권 확인 (직접 발급받아 content에 입력해야 합니다) */}
        <meta name="naver-site-verification" content="d9b8f1f0581f7751c9c98596397d0c3ce0293a98" />
  
        {/* 소셜 미디어 공유 (Open Graph & Twitter) */}
        <meta property="og:type" content="https://linkedntips.com" />
        <meta property="og:title" content="Linkedn Tips | URL 단축 서비스" />
        <meta property="og:description" content="복잡한 링크드인 게시물 주소를 깔끔한 단축 URL로 만들어 공유해 보세요." />
        <meta property="og:url" content="https://linkedntips.com" />
        <meta property="og:image" content="https://linkedntips.com/logo.png" />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Linkedn Tips | URL 단축 서비스" />
        <meta name="twitter:description" content="복잡한 링크드인 게시물 주소를 깔끔한 단축 URL로 만들어 공유해 보세요." />
        <meta name="twitter:image" content="https://linkedntips.com/logo.png" />

        {/* 반응형 웹을 위한 뷰포트 설정 */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <script type="application/ld+json">
          {`
            {
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "Linkedn Tips",
              "description": "복잡하고 긴 링크드인(LinkedIn) 게시물 주소를 공유하기 쉬운 짧은 URL로 변환하는 서비스입니다.",
              "url": "https://linkedntips.com",
              "applicationCategory": "Utilities",
              "operatingSystem": "Any",
              "offers": {
                "@type": "Offer",
                "price": "0"
              }
            }
          `}
        </script>
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
            .btn-share-service:hover { 
              background-color: #1971c2 !important;
              color: #ffffff !important;
            }
            .input-wrapper {
              position: relative;
              width: 100%;
              /* ▼▼▼ 이 div에 marginBottom을 추가합니다. ▼▼▼ */
              margin-bottom: 12px;
            }
            .clear-icon {
              position: absolute;
              right: 12px;
              top: 50%;
              transform: translateY(-50%);
              cursor: pointer;
              color: #999;
            }
            .clear-icon:hover {
              color: #333;
            }
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
        
        <div className="input-wrapper">
          {/* ▼▼▼ input에서는 marginBottom을 제거합니다. ▼▼▼ */}
          <input type="text" placeholder="여기에 링크드인 URL을 붙여넣으세요"
            value={originalLink} onChange={e => setOriginalLink(e.target.value)}
            style={{ width: '100%', padding: '12px 40px 12px 12px',
                     border: '1px solid #ccc', borderRadius: 8, boxSizing: 'border-box' }} />
          {originalLink && (
            <X className="clear-icon" size={20} onClick={handleClearInput} />
          )}
        </div>
        
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
          style={{ width: '100%', padding: 10, background: '#e7f5ff', 
                   color: '#1971c2', border: '1px solid #a5d8ff', 
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
