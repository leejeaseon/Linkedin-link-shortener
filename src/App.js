import React, { useState, useEffect } from 'react';
import { Linkedin } from 'lucide-react';
import { Helmet } from 'react-helmet';

function App() {
  const [originalLink, setOriginalLink] = useState('');
  const [cleanLink, setCleanLink] = useState('');

  // Kakao SDK init
  useEffect(() => {
    if (window.Kakao && !window.Kakao.isInitialized()) {
      window.Kakao.init(process.env.REACT_APP_KAKAO_KEY);
      console.log('Kakao Initialized:', window.Kakao.isInitialized());
    }
  }, []);

  const extractCleanLink = (link) => {
    const ugcMatch = link.match(/ugcPost-(\d+)/);
    if (ugcMatch) return `https://www.linkedin.com/feed/update/urn:li:ugcPost:${ugcMatch[1]}`;
    const activityMatch = link.match(/activity-(\d+)/);
    if (activityMatch) return `https://www.linkedin.com/feed/update/urn:li:activity:${activityMatch[1]}`;
    return '';
  };

  const handleConvert = () => {
    setCleanLink(extractCleanLink(originalLink));
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(cleanLink);
    alert('링크가 복사되었습니다!');
  };

  const shareKakao = () => {
    if (!window.Kakao) return alert('카카오 SDK 로딩 실패');
    window.Kakao.Link.sendDefault({
      objectType: 'feed',
      content: {
        title: 'LinkedIn 링크 클리너',
        description: '복잡한 공유 링크를 깔끔하게 변환해보세요!',
        imageUrl: 'https://linkedin-link-shortener.vercel.app/og-image.png',
        link: { mobileWebUrl: cleanLink, webUrl: cleanLink }
      },
      buttons: [
        { title: '링크 확인하기', link: { mobileWebUrl: cleanLink, webUrl: cleanLink } }
      ]
    });
  };

  const shareUrls = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(cleanLink)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(cleanLink)}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(cleanLink)}`,
    threads: `https://www.threads.net/intent/post?url=${encodeURIComponent(cleanLink)}`
  };

  const shareBtnBase = {
    padding: '6px 12px',
    fontSize: 12,
    borderRadius: 6,
    textDecoration: 'none',
    color: '#fff',
    border: 'none',
    cursor: 'pointer'
  };

  const shareBtnStyles = {
    facebook: { background: '#4267B2' },
    linkedin: { background: '#0A66C2' },
    twitter: { background: '#1DA1F2' },
    threads: { background: '#10141A' }
  };

  return (
    <div style={{ background: '#f3f2ef', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 24 }}>
      <Helmet>
        <meta name="description" content="복잡한 LinkedIn 공유 링크를 간단하고 깔끔하게 정리해 보세요." />
        <meta property="og:title" content="LinkedIn 링크 클리너" />
        <meta property="og:description" content="복잡한 공유 링크를 간단하게 정리합니다." />
        <meta property="og:image" content="https://linkedin-link-shortener.vercel.app/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>
      <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.1)', padding: 32, maxWidth: 500, width: '100%', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
          <Linkedin color="#0a66c2" size={28} />
          <h1 style={{ fontSize: 20, fontWeight: 600, color: '#0a66c2', margin: 0 }}>LinkedIn 링크 클리너</h1>
        </div>
        <p style={{ fontSize: 14, color: '#555', marginBottom: 16 }}>지저분한 공유 링크를 깔끔하게 바꿔보세요.</p>
        <input
          type="text"
          placeholder="여기에 LinkedIn 공유 링크를 붙여넣으세요"
          value={originalLink}
          onChange={(e) => setOriginalLink(e.target.value)}
          style={{ width: '100%', padding: 12, marginBottom: 12, border: '1px solid #ccc', borderRadius: 8, boxSizing: 'border-box' }}
        />
        <button
          onClick={handleConvert}
          style={{ width: '100%', padding: 12, background: '#0a66c2', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600 }}
        >
          깔끔한 링크 만들기
        </button>
        {cleanLink && (
          <div style={{ marginTop: 24 }}>
            <div style={{ padding: 16, border: '1px solid #cce0ff', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <a href={cleanLink} target="_blank" rel="noreferrer" style={{ color: '#0a66c2', wordBreak: 'break-all', flex: 1 }}>{cleanLink}</a>
              <button onClick={handleCopy} style={{ padding: '6px 12px', background: '#eee', borderRadius: 6, border: 'none' }}>복사</button>
            </div>
            <div style={{ marginTop: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button onClick={shareKakao} style={{ ...shareBtnBase, background: '#fee500', color: '#191919' }}>카카오톡 공유</button>
              <a href={shareUrls.facebook} target="_blank" rel="noreferrer" style={{ ...shareBtnBase, ...shareBtnStyles.facebook }}>Facebook</a>
              <a href={shareUrls.linkedin} target="_blank" rel="noreferrer" style={{ ...shareBtnBase, ...shareBtnStyles.linkedin }}>LinkedIn</a>
              <a href={shareUrls.twitter} target="_blank" rel="noreferrer" style={{ ...shareBtnBase, ...shareBtnStyles.twitter }}>Twitter</a>
              <a href={shareUrls.threads} target="_blank" rel="noreferrer" style={{ ...shareBtnBase, ...shareBtnStyles.threads }}>Threads</a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
