````
project/
└── my-react/
  ├── package.json
  ├── package-lock.json
  ├── public/
  │   ├── favicon.ico
  │   └── index.html
  └── src/
    ├── App.js
    ├── index.js
    ├── components/
    │   ├── Footer.js
    │   └── Header.js
    ├── doc/
    │   └── README.md
    └── styles/
       └── App.css

  ## youtube-transcript-mcp 설치 방법

  터미널에서 아래 명령어를 실행하세요:

  ```bash
  npx youtube-transcript-mcp
````

설치 없이 바로 사용할 수 있습니다. 라이브러리로 사용하려면 다음과 같이 import 하세요:

```js
import { getTranscript } from 'youtube-transcript-mcp'

getTranscript('유튜브_영상_ID').then((transcript) => {
  console.log(transcript)
})
```

## MCP 서버 세팅 방법

1. **MCP 서버 클론 및 설치**

   터미널에서 아래 명령어를 실행하세요:

   ```bash
   git clone https://github.com/your-org/mcp-server.git
   cd mcp-server
   npm install
   ```

2. **환경 변수 설정**

   필요하다면 `.env` 파일을 생성하여 환경 변수를 설정하세요. 예시:

   ```
   PORT=3000
   ```

3. **서버 실행**

   아래 명령어로 MCP 서버를 실행합니다:

   ```bash
   npm start
   ```

4. **정상 동작 확인**

   브라우저 또는 REST Client에서 `http://localhost:3000`에 접속해 서버가 정상적으로 동작하는지 확인하세요.

---

## [YouTube 영상 요약]

https://www.youtube.com/watch?v=kfU23zS_qVk

> **영상 제목 및 주요 내용 요약**

- 영상에서는 React 프로젝트의 폴더 구조와 각 디렉터리/파일의 역할을 설명합니다.
- `public/` 폴더에는 정적 파일(예: `index.html`, `favicon.ico`)이 위치합니다.
- `src/` 폴더는 실제 소스 코드가 들어가는 곳으로, `App.js`, `index.js`, 그리고 컴포넌트, 스타일, 문서 등이 포함됩니다.
- 컴포넌트는 `components/` 폴더에, 스타일 파일은 `styles/` 폴더에, 문서는 `doc/` 폴더에 정리합니다.
- 각 파일과 폴더의 역할을 명확히 구분하여 유지보수와 협업에 용이하도록 구조화하는 것이 중요하다고 강조합니다.
- 마지막으로, 프로젝트를 시작할 때 이러한 구조를 참고하면 효율적으로 개발할 수 있다고 안내합니다.

> **실전 팁**

- 폴더 구조를 일관성 있게 유지하세요.
- 파일명과 폴더명은 역할이 명확하게 드러나도록 작성하세요.
- 문서화(`doc/README.md`)를 통해 프로젝트 구조와 사용법을 팀원과 공유하세요.
- 필요에 따라 폴더를 추가하거나 구조를 확장할 수 있습니다.

---

## 참고 자료

npx -y @smithery/cli install @kimtaeyoon83/mcp-server-youtube-transcript --client vscode

prmt 1.

1. youtube-transcript.get_transcript url="https://www.youtube.com/watch?v=RwFbAo5KDzk" lang="ko"
2. 자막을 요약하고 주요 내용을 정리해줘.
3. 그 내용을 filesystem.write_file path="youtube-summary.md"로 저장해줘.

prmt 2.
현재 폴더에서 모든 파일과 폴더 및 하위 폴더에 모든 정보들을 정리해서
files.md 파일명으로 세부 정보들을 작성해줘!

1. my-react 폴더에서 파일과 하위 폴더에 모든 정보들을 markdown형식 table 문법으로 정리
2. 그 내용을 filesystem.write_file path="youtube-summary.md"로 저장해줘.
