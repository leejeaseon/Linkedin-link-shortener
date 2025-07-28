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
    } catch (error)
