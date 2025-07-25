import React, { useState, useEffect } from 'react';
import { Linkedin } from 'lucide-react';
import { Helmet } from 'react-helmet';

function App() {
  const [originalLink, setOriginalLink] = useState('');
  // 1. 'cleanLink'를 'shortUrl'로 이름을 변경하여 역할을 명확히 합니다.
  const [shortUrl, setShortUrl] = useState('');

  useEffect(() => {
    if (window.Kakao && !window.Kakao.isInitialized()) {
      window.Kakao.init(process.env.REACT_APP_KAKAO_KEY);
      console.log('Kakao Initialized:', window.Kakao.isInitialized());
    }
  }, []);
  
  // 2. 버튼 클릭 시 작동하는 함수를 API 호출 로직으로 완전히 교체합니다.
  const handleShorten = async () => {
    if (!originalLink) {
      alert('URL을 입력해주세요.');
      return;
    }

    try {
      const response = await fetch('/api/shorten', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ longUrl: originalLink }),
      });

      const data = await response.json();

      if (!response.ok) {
        // 서버에서 보낸 오류 메시지를 사용합니다.
        throw new Error(data.message || '알 수 없는 오류가 발생했습니다.');
      }

      // 상태에 새로 받은 단축 URL을 저장합니다.
      setShortUrl(data.shortUrl);

    } catch (error) {
      alert(`오류가 발생했습니다: ${error.message}`);
      setShortUrl(''); // 오류 발생 시 이전 결과값 초기화
    }
  };

  const handleCopy = () => {
    // 3. 복사할 대상도 'shortUrl'로 변경합니다.
    navigator.clipboard.writeText(shortUrl);
    alert('링크가 복사되었습니다!');
  };
  
  // 카카오 공유 기능 등은 그대로 유지합니다. (필요에 따라 수정 가능)
  // App.js
  const shareKakao = () => {
    if (!window.Kakao) return alert('카카오 SDK 로딩 실패');
    window.Kakao.Link.sendScrap({
      requestUrl: cleanLink,
  });
};

  const shareUrls = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shortUrl)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shortUrl)}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shortUrl)}`,
    threads: `https://www.threads.net/intent/post?url=${encodeURIComponent(shortUrl)}`
  };
  
  // --- 아래 JSX 부분(화면 구성)도 일부 수정됩니다. ---
  
  const shareBtnBase = {
    padding: '6px 12px', fontSize: 12,
    borderRadius: 6, textDecoration: 'none',
    color: '#fff', border: 'none', cursor: 'pointer'
  };
  const shareBtnStyles = {
    facebook: { background: '#4267B2' },
    linkedin: { background: '#0A66C2' },
    twitter: { background: '##1DA1F2' },
    threads: { background: '##10141A' }
  };

  return (
    <div style={{ background: '#f3f2ef', minHeight: '100vh', display: 'flex',
                  justifyContent: 'center', alignItems: 'center', padding: 24 }}>
      <Helmet>
        <title>URL Shortener</title>
        <meta name="description" content="긴 주소를 짧고 공유하기 쉽게 만들어보세요." />
        <meta property="og:title" content="URL Shortener" />
        <meta property="og:description" content="긴 주소를 짧고 공유하기 쉽게 만들어보세요." />
        <meta property="og:image" content="https://linkedin-link-shortener.vercel.app/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
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
        {/* 4. 버튼의 onClick 이벤트에 새로 만든 handleShorten 함수를 연결합니다. */}
        <button onClick={handleShorten}
          style={{ width: '100%', padding: 12, background: '#0a66c2',
                   color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600 }}>
          단축 링크 만들기
        </button>
        {/* 5. shortUrl이 있을 때만 결과 창을 보여줍니다. */}
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
            {/* 소셜 공유 버튼들은 shortUrl을 사용하도록 이미 수정되어 있습니다. */}
            <div style={{ marginTop: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button onClick={shareKakao}
                style={{ ...shareBtnBase, background: '#fee500', color: '#191919' }}>
                카카오톡 공유
              </button>
              <a href={shareUrls.facebook} target="_blank" rel="noreferrer"
                style={{ ...shareBtnBase, ...shareBtnStyles.facebook }}>
                Facebook
              </a>
              {/* Other social media links */}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
