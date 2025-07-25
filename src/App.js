import { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Linkedin } from "lucide-react";

export default function LinkedInLinkCleaner() {
  const [originalLink, setOriginalLink] = useState("");
  const [cleanLink, setCleanLink] = useState("");

  const extractCleanLink = (link) => {
    try {
      const ugcMatch = link.match(/ugcPost-(\d+)/);
      if (ugcMatch) {
        return `https://www.linkedin.com/feed/update/urn:li:ugcPost:${ugcMatch[1]}`;
      }
      const activityMatch = link.match(/activity-(\d+)/);
      if (activityMatch) {
        return `https://www.linkedin.com/feed/update/urn:li:activity:${activityMatch[1]}`;
      }
      return "";
    } catch (e) {
      return "";
    }
  };

  const handleConvert = () => {
    const cleaned = extractCleanLink(originalLink);
    setCleanLink(cleaned);
  };

  return (
    <div className="min-h-screen bg-[#f3f2ef] flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl p-8">
        <div className="flex items-center gap-2 mb-6">
          <Linkedin className="text-[#0a66c2]" size={28} />
          <h1 className="text-xl font-semibold text-[#0a66c2]">LinkedIn 링크 클리너</h1>
        </div>
        <p className="text-gray-700 text-sm mb-4">
          지저분한 공유 링크를 깔끔하게 바꿔보세요. 링크드인 게시글 링크를 붙여넣으면 정리된 형태로 변환됩니다.
        </p>
        <Input
          placeholder="여기에 LinkedIn 공유 링크를 붙여넣으세요"
          value={originalLink}
          onChange={(e) => setOriginalLink(e.target.value)}
          className="mb-4"
        />
        <Button onClick={handleConvert} className="w-full bg-[#0a66c2] hover:bg-[#004182] text-white">
          깔끔한 링크 만들기
        </Button>
        {cleanLink && (
          <Card className="mt-6 border border-blue-100">
            <CardContent className="p-4">
              <p className="text-sm text-gray-600 mb-2">변환된 링크:</p>
              <a
                href={cleanLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline break-all"
              >
                {cleanLink}
              </a>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
