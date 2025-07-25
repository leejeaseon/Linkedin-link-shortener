import React, { useState } from "react";

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
    <div style={{ maxWidth: 600, margin: "50px auto", padding: 20 }}>
      <h1>LinkedIn 게시글 링크 클리너</h1>
      <input
        type="text"
        placeholder="여기에 LinkedIn 공유 링크를 붙여넣으세요"
        value={originalLink}
        onChange={(e) => setOriginalLink(e.target.value)}
        style={{ width: "100%", padding: 10, marginBottom: 10 }}
      />
      <button onClick={handleConvert} style={{ padding: 10, marginBottom: 20 }}>
        깔끔한 링크 만들기
      </button>
      {cleanLink && (
        <div>
          <p>아래 링크를 복사해서 사용하세요:</p>
          <a href={cleanLink} target="_blank" rel="noreferrer">
            {cleanLink}
          </a>
        </div>
      )}
    </div>
  );
}

export default App;