# LinkedIn 링크 클리너

복잡한 LinkedIn 공유 링크를 간단하고 깔끔하게 정리해주는 웹 도구입니다.

## 기능
- UGC 및 activity 형식 링크 자동 추출 및 정리
- 복사 버튼으로 빠른 링크 복사
- 소셜 공유 버튼 (카카오톡, Facebook, LinkedIn, Twitter, Threads)
- SEO 및 오픈그래프 메타태그 포함
- Kakao Developers JavaScript SDK 통합

## 설치 및 실행

```bash
npm install
npm start
```

## 환경 변수 설정

로컬 개발용 `.env` 파일을 만드시고, 다음을 추가하세요:

```
REACT_APP_KAKAO_KEY=YOUR_KAKAO_JS_KEY_HERE
```

## 배포

- Vercel, Netlify 등으로 바로 배포 가능합니다.
- Vercel 환경 변수에도 `REACT_APP_KAKAO_KEY`를 설정하세요.
