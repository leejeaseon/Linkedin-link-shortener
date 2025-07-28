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
    twitter: `https://twitter
