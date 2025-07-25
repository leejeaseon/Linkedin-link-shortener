import React, { useState, useEffect } from 'react';
// 1. 여기서 { Linkedin } import를 제거했습니다.
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
    <div style={{ background: '#f3f2ef', minHeight: '100vh', display: 'flex',
                  justifyContent: 'center', alignItems: 'center', padding: 24 }}>
      <Helmet>
        <title>URL Shortener</title>
        <meta name="description" content="긴 주소를 짧고 공유하기 쉽게 만들어보세요." />
        <style>
          {`
            .btn-shorten:hover { background-color: #ff4757 !important; }
            .btn-copy:hover { background-color: #2f3542 !important; color: white !important; }
            .btn-kakao:hover { background-color: #fbe500 !important; filter: brightness(0.9); }
            .btn-linkedin:hover { background-color: #004182 !important; }
            .btn-twitter:hover { background-color: #0c8de4 !important; }
            .btn-threads:hover { background-color: #444444 !important; }
          `}
        </style>
      </Helmet>
      <div style={{ background: '#fff', borderRadius: 16,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)', padding: 32,
                    maxWidth: 500, width: '100%', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
          {/* 2. 여기서 <Linkedin ... /> 컴포넌트 라인을 삭제했습니다. */}
          <h1 style={{ fontSize: 20, fontWeight
