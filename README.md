# LinkedIn Link Cleaner ✨

🧹 지저분한 LinkedIn 공유 링크를 깔끔하게 정리해주는 웹 도구입니다.  
`ugcPost-` 또는 `activity-` 형식의 게시글 링크를 자동으로 인식하여, 공유하기 좋은 링크로 변환해줍니다.

## 🚀 사용해보기

👉 [배포 링크](https://linkedin-link-shortener.vercel.app)

1. LinkedIn 게시글 공유 링크를 입력하세요.
2. '깔끔한 링크 만들기' 버튼을 누르세요.
3. 하단에 생성된 링크를 복사해서 자유롭게 공유하세요.

## ✨ 예시

**입력:**  
`https://www.linkedin.com/posts/username_activity-7352256537026875392-abc?utm_source=share...`

**출력:**  
`https://www.linkedin.com/feed/update/urn:li:activity:7352256537026875392`

---

## 🛠 기술 스택

- React 18
- Lucide React Icons
- Vercel 배포

## 📂 프로젝트 구조

```
linkedin-link-cleaner/
├── public/
│   └── index.html
├── src/
│   ├── App.js
│   └── index.js
├── package.json
└── README.md
```

## 📄 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다.
