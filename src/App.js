import React, { useState } from "react";
import { Linkedin } from "lucide-react";
import { Helmet } from "react-helmet";

function App() {
  const [originalLink, setOriginalLink] = useState("");
  const [cleanLink, setCleanLink] = useState("");

  const extractCleanLink = (link) => {
    const ugcMatch = link.match(/ugcPost-(\d+)/);
    if (ugcMatch) {
      return `https://www.linkedin.com/feed/update/urn:li:ugcPost:${ugcMatch[1]}`;
    }
    const activityMatch = link.match(/activity-(\d+)/);
    if (activityMatch) {
      return `https://www.linkedin.com/feed/update/urn:li:activity:${activityMatch[1]}`;
    }
    return "";
  };

  const handleConvert = () => {
    const cleaned = extractCleanLink(originalLink);
    setCleanLink(cleaned);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(cleanLink);
    alert("링크가 복사되었습니다!");
  };

  const shareUrls = {
    kakao: `https://story.kakao.com/share?url=${encodeURIComponent(cleanLink)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(cleanLink)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(cleanLink)}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(cleanLink)}`,
    threads: `https://www.threads.net/intent/post?url=${encodeURIComponent(cleanLink)}`
  };

  return (
    <div style={{ background: '#f3f2ef', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 24 }}>
      <Helmet>
        <title>LinkedIn 링크 클리너</title>
        <meta name="description" content="복잡한 LinkedIn 공유 링크를 간단하고 깔끔하게 정리해보세요. UGC 및 activity 형식 링크를 자동으로 정리해줍니다." />
        <meta property="og:title" content="LinkedIn 링크 클리너" />
        <meta property="og:description" content="복잡한 LinkedIn 공유 링크를 간단하게 정리하고 공유할 수 있습니다." />
        <meta property="og:image" content="https://linkedin-link-shortener.vercel.app/og-image.png" />
        <meta property="og:url" content="https://linkedin-link-shortener.vercel.app" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="LinkedIn 링크 클리너" />
        <meta name="twitter:description" content="지저분한 링크를 깔끔하게 정리하는 LinkedIn 전용 링크 단축기" />
      </Helmet>
      <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.1)', padding: 32, maxWidth: 500, width: '100%', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
          <Linkedin color="#0a66c2" size={28} />
          <h1 style={{ fontSize: 20, fontWeight: 600, color: '#0a66c2', margin: 0 }}>LinkedIn 링크 클리너</h1>
        </div>
        <p style={{ fontSize: 14, color: '#555', marginBottom: 16 }}>
          지저분한 공유 링크를 깔끔하게 바꿔보세요. 링크드인 게시글 링크를 붙여넣으면 정리된 형태로 변환됩니다.
        </p>
        <div style={{ width: '100%' }}>
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
        </div>
        {cleanLink && (
          <div style={{ marginTop: 24, padding: 16, border: '1px solid #cce0ff', borderRadius: 8 }}>
            <p style={{ fontSize: 14, color: '#555', marginBottom: 8 }}>변환된 링크:</p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
              <a href={cleanLink} target="_blank" rel="noreferrer" style={{ color: '#0a66c2', wordBreak: 'break-all', flex: 1 }}>
                {cleanLink}
              </a>
              <button onClick={handleCopy} style={{ padding: '6px 12px', background: '#eee', borderRadius: 6, border: 'none' }}>
                복사
              </button>
            </div>
            <div style={{ marginTop: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <a href={shareUrls.kakao} target="_blank" rel="noreferrer" style={shareBtnStyle}>Kakao</a>
              <a href={shareUrls.facebook} target="_blank" rel="noreferrer" style={shareBtnStyle}>Facebook</a>
              <a href={shareUrls.linkedin} target="_blank" rel="noreferrer" style={shareBtnStyle}>LinkedIn</a>
              <a href={shareUrls.twitter} target="_blank" rel="noreferrer" style={shareBtnStyle}>Twitter</a>
              <a href={shareUrls.threads} target="_blank" rel="noreferrer" style={shareBtnStyle}>Threads</a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const shareBtnStyle = {
  padding: '6px 10px',
  fontSize: 12,
  background: '#f3f3f3',
  borderRadius: 6,
  textDecoration: 'none',
  color: '#333',
  border: '1px solid #ddd'
};

export default App;