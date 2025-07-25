import React, { useState } from "react";
import { Linkedin } from "lucide-react";

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

  return (
    <div style={{ background: '#f3f2ef', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 24 }}>
      <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.1)', padding: 32, maxWidth: 500, width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
          <Linkedin color="#0a66c2" size={28} />
          <h1 style={{ fontSize: 20, fontWeight: 600, color: '#0a66c2' }}>LinkedIn 링크 클리너</h1>
        </div>
        <p style={{ fontSize: 14, color: '#555', marginBottom: 16 }}>
          지저분한 공유 링크를 깔끔하게 바꿔보세요. 링크드인 게시글 링크를 붙여넣으면 정리된 형태로 변환됩니다.
        </p>
        <input
          type="text"
          placeholder="여기에 LinkedIn 공유 링크를 붙여넣으세요"
          value={originalLink}
          onChange={(e) => setOriginalLink(e.target.value)}
          style={{ width: '100%', padding: 12, marginBottom: 12, border: '1px solid #ccc', borderRadius: 8 }}
        />
        <button
          onClick={handleConvert}
          style={{ width: '100%', padding: 12, background: '#0a66c2', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600 }}
        >
          깔끔한 링크 만들기
        </button>
        {cleanLink && (
          <div style={{ marginTop: 24, padding: 16, border: '1px solid #cce0ff', borderRadius: 8 }}>
            <p style={{ fontSize: 14, color: '#555', marginBottom: 8 }}>변환된 링크:</p>
            <a href={cleanLink} target="_blank" rel="noreferrer" style={{ color: '#0a66c2', wordBreak: 'break-all' }}>
              {cleanLink}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;