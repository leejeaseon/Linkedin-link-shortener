import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { X, RefreshCw } from 'lucide-react';

function App() {
  const [originalLink, setOriginalLink] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [clickCount, setClickCount] = useState(null);
  const [topLinks, setTopLinks] = useState([]);

  useEffect(() => {
    const fetchTopLinks = async () => {
      try {
        const response = await fetch('/api/top-links');
        const data = await response.json();
        if (response.ok) {
          setTopLinks(data);
        }
      } catch (error) {
        console.error("Top 10 링크를 가져오는 데 실패했습니다.", error);
      }
    };

    fetchTopLinks();

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
    setShortUrl('');
    setClickCount(null);
    try {
      const response = await fetch('/api/shorten', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ longUrl: originalLink }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || '알 수 없는 오류');
      
      setShortUrl(data.shortUrl);
      setClickCount(0);
    } catch (error) {
      alert(`오류가 발생했습니다: ${error.message}`);
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

  const fetchClickCount = async () => {
    if (!shortUrl) return;
    try {
      const shortCode = shortUrl.split('/').pop();
      const response = await fetch(`/api/stats?code=${shortCode}`);
      const data = await response.json();
      if (response.ok) {
        setClickCount(data.clicks);
      } else {
        throw new Error(data.message || '클릭 수를 가져오지 못했습니다.');
      }
    } catch (error) {
      console.error("클릭 수를 가져오는 데 실패했습니다.", error);
      alert(error.message);
    }
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
                  justifyContent: 'center', alignItems: 'center', padding: '24px', boxSizing: 'border-box' }}>
      <Helmet>
        <title>Linkedn Tips | 깔끔한 링크드인 URL 단축 서비스</title>
        <meta name="description" content="복잡하고 긴 링크드인(LinkedIn) 게시물 주소를 공유하기 쉬운 짧은 URL로 변환하세요. 소셜 미디어 공유 시 깔끔한 미리보기를 제공합니다." />
        <meta name="keywords" content="링크드인, URL 단축, 링크 줄이기, 소셜 미디어 공유, URL shortener, LinkedIn" />
        <meta name="theme-color" content="#8ec5fc" />
        <link rel="canonical" href="https://linkedntips.com" />
        <meta name="naver-site-verification" content="d9b8f1f0581f7751c9c98596397d0c3ce0293a98" />
        <meta name="google-site-verification" content="여기에 구글 서치 콘솔 인증 코드를 입력하세요" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Linkedn Tips | URL 단축 서비스" />
        <meta property="og:description" content="복잡한 링크드인 게시물 주소를 깔끔한 단축 URL로 만들어 공유해 보세요." />
        <meta property="og:url" content="https://linkedntips.com" />
        <meta property="og:image" content="https://linkedntips.com/logo.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Linkedn Tips | URL 단축 서비스" />
        <meta name="twitter:description" content="복잡한 링크드인 게시물 주소를 깔끔한 단축 URL로 만들어 공유해 보세요." />
        <meta name="twitter:image" content="https://linkedntips.com/logo.png" />
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
            html, body { margin: 0; padding: 0; width: 100%; height: 100%; }
            .btn-shorten:hover { background-color: #ff4757 !important; }
            .btn-copy:hover { background-color: #2f3542 !important; color: white !important; }
            .btn-kakao:hover { background-color: #fbe500 !important; filter: brightness(0.9); }
            .btn-linkedin:hover { background-color: #004182 !important; }
            .btn-twitter:hover { background-color: #0c8de4 !important; }
            .btn-threads:hover { background-color: #444444 !important; }
            .btn-share-service:hover { background-color: #1971c2 !important; color: #ffffff !important; }
            .input-wrapper { position: relative; width: 100%; margin-bottom: 12px; }
            .clear-icon { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); cursor: pointer; color: #999; }
            .clear-icon:hover { color: #333; }
            .refresh-icon:hover { color: #333 !important; }
            .leaderboard-list { max-height: 350px; overflow-y: auto; padding-right: 8px; }

            /* ▼▼▼ 1. 반응형 레이아웃을 위한 미디어 쿼리 추가 ▼▼▼ */
            @media (max-width: 768px) {
              .main-container {
                flex-direction: column;
                align-items: center;
              }
              .leaderboard-column {
                max-width: 500px !important;
              }
            }
          `}
        </style>
      </Helmet>
      
      {/* ▼▼▼ 2. 레이아웃 div에 className 추가 ▼▼▼ */}
      <div className="main-container" style={{ display: 'flex', gap: '24px', width: '100%', maxWidth: '1000px', alignItems: 'flex-start' }}>
        
        <div className="shortener-column" style={{ background: '#fff', borderRadius: 16,
                      boxShadow: '0 4px 20px rgba(0,0,0,0.1)', padding: 32,
                      width: '100%', boxSizing: 'border-box', flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
            <h1 style={{ fontSize: 20, fontWeight: 600, color: '#0a66c2', margin: 0 }}>
              Linkedn Tips
            </h1>
          </div>
          <p style={{ fontSize: 14, color: '#555', marginBottom: 16 }}>
            긴 링크드인 URL을 짧은 주소로 만들어 공유해 보세요.
          </p>
          <div className="input-wrapper">
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
                           cursor: 'pointer', marginLeft: '16px' }}>
                  복사
                </button>
              </div>
              
              <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', fontSize: '14px', color: '#555' }}>
                <span>
                  {clickCount !== null ? `클릭 수: ${clickCount}` : ''}
                </span>
                <RefreshCw className="refresh-icon" size={16} onClick={fetchClickCount} style={{ marginLeft: '8px', cursor: 'pointer', color: '#888' }} />
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
          
          <footer style={{ textAlign: 'center', marginTop: '40px', padding: '20px 0 0 0', color: '#777', fontSize: '12px', borderTop: '1px solid #eee' }}>
            Made by <a href="https://www.linkedin.com/in/homecorner-mkt/" target="_blank" rel="noopener noreferrer" style={{ color: '#0a66c2', textDecoration: 'none', fontWeight: 'bold' }}>집구석마케터</a>
          </footer>
        </div>

        <div className="leaderboard-column" style={{ background: 'rgba(255, 255, 255, 0.9)', borderRadius: 16,
                      boxShadow: '0 4px 20px rgba(0,0,0,0.1)', padding: '24px 32px',
                      width: '100%', maxWidth: '400px', boxSizing: 'border-box', flexShrink: 0 }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#0a66c2', margin: '0 0 20px 0', paddingBottom: '12px', borderBottom: '1px solid #eee' }}>
            오늘의 링띤 Top 10
          </h2>
          <ul className="leaderboard-list" style={{ listStyle: 'none', margin: 0, padding: 0, fontSize: '12px' }}>
            {topLinks.length > 0 ? (
              topLinks.map((link) => (
                <li key={link.shortCode} style={{ marginBottom: '16px', borderBottom: '1px solid #f0f0f0', paddingBottom: '16px', wordBreak: 'break-all' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 'bold', marginBottom: '6px' }}>
                    <a href={`https://linkedntips.com/${link.shortCode}`} target="_blank" rel="noopener noreferrer" style={{ color: '#0a66c2', textDecoration: 'none' }}>
                      {`linkedntips.com/${link.shortCode}`}
                    </a>
                    <span style={{ background: '#e7f5ff', color: '#1971c2', padding: '2px 6px', borderRadius: '4px', fontSize: '12px', flexShrink: 0, marginLeft: '8px' }}>
                      {`${link.clicks} clicks`}
                    </span>
                  </div>
                  <div style={{ color: '#777', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {link.url}
                  </div>
                </li>
              ))
            ) : (
              <li style={{ color: '#999' }}>아직 집계된 링크가 없습니다.</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default App;
