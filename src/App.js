import React, { useEffect, useState } from "react";
import { Linkedin } from "lucide-react";

const App = () => {
  const [inputUrl, setInputUrl] = useState("");
  const [cleanLink, setCleanLink] = useState("");

  useEffect(() => {
    if (window.Kakao && !window.Kakao.isInitialized()) {
      window.Kakao.init(process.env.REACT_APP_KAKAO_KEY);
    }
  }, []);

  const cleanLinkedInUrl = (url) => {
    try {
      const match = url.match(/(ugcPost|activity)-([0-9]+)/);
      if (match) {
        return `https://www.linkedin.com/feed/update/urn:li:${match[1]}:${match[2]}`;
      }
    } catch (e) {}
    return "";
  };

  const handleClean = () => {
    const cleaned = cleanLinkedInUrl(inputUrl);
    setCleanLink(cleaned);
  };

  const handleCopy = () => {
    if (cleanLink) navigator.clipboard.writeText(cleanLink);
  };

  const shareKakao = () => {
    if (window.Kakao && cleanLink) {
      window.Kakao.Link.sendDefault({
        objectType: "feed",
        content: {
          title: "깔끔한 링크로 공유해보세요!",
          description: "복잡한 링크 대신 단순한 링크로 공유할 수 있어요.",
          imageUrl: "https://linkedn.tips/og-image.png",
          link: {
            mobileWebUrl: cleanLink,
            webUrl: cleanLink
          }
        },
        buttons: [
          {
            title: "링크 열기",
            link: {
              mobileWebUrl: cleanLink,
              webUrl: cleanLink
            }
          }
        ]
      });
    }
  };

  const shareLinkedIn = () => {
    const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(cleanLink)}`;
    window.open(shareUrl, "_blank");
  };

  return (
    <div style={{ backgroundColor: "#f3f4f6", minHeight: "100vh", padding: "2rem", fontFamily: "sans-serif" }}>
      <div style={{ maxWidth: "600px", margin: "0 auto", background: "#fff", borderRadius: "1rem", padding: "2rem", boxShadow: "0 4px 10px rgba(0,0,0,0.05)" }}>
        <h1 style={{ color: "#0A66C2", fontSize: "1.5rem", marginBottom: "1rem" }}>
          <Linkedin size={28} style={{ display: "inline", marginRight: "0.5rem" }} />
          LinkedIn Link Cleaner
        </h1>
        <input
          type="text"
          placeholder="지저분한 LinkedIn 공유 링크를 붙여넣기..."
          value={inputUrl}
          onChange={(e) => setInputUrl(e.target.value)}
          style={{ width: "100%", padding: "0.75rem", marginBottom: "1rem", borderRadius: "0.5rem", border: "1px solid #ccc" }}
        />
        <button onClick={handleClean} style={{ backgroundColor: "#0A66C2", color: "#fff", padding: "0.75rem 1rem", borderRadius: "0.5rem", marginRight: "0.5rem", border: "none" }}>
          깔끔한 링크 만들기
        </button>
        {cleanLink && (
          <>
            <div style={{ marginTop: "1rem", wordBreak: "break-all" }}>{cleanLink}</div>
            <div style={{ marginTop: "1rem" }}>
              <button onClick={handleCopy} style={{ marginRight: "0.5rem" }}>복사</button>
              <button onClick={shareKakao} style={{ backgroundColor: "#FEE500", marginRight: "0.5rem" }}>카카오톡</button>
              <button onClick={shareLinkedIn} style={{ backgroundColor: "#0A66C2", color: "#fff", marginRight: "0.5rem" }}>LinkedIn</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default App;
