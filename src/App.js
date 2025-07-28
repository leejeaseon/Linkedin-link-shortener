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
    setShortUrl(''); // 이전 결과 초기화
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
            .btn-share
