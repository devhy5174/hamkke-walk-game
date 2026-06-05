프로젝트 개요

프로젝트명: 함께Walk

모바일 세로 화면 기반의 캐주얼 러닝 게임.
플레이어는 캐릭터를 좌우로 이동시키며 발자국을 수집하고 장애물을 피한다.
MVP 완료 후 지속 기능 추가 중.

⸻

기술 스택

- React 19
- TypeScript
- Vite
- HTML5 Canvas
- Firebase Realtime Database
- @apps-in-toss/web-framework (앱인토스 패키징)

⸻

개발 원칙

- 상태관리 라이브러리 사용 금지
- 실시간 게임 데이터는 useRef 사용
- UI 상태는 useState 사용
- 코드 단순성 우선
- 불필요한 추상화 금지

⸻

구현된 기능

플레이어
- 자동 전진 (속도 점진 증가)
- 터치 드래그 + 키보드 ← → 이동

아이템
- 발자국 수집 (+10점 / 파워워커·달빛길 중 +20점)
- 물병 수집 → 파워워커 게이지 (10개 모으면 발동)
- 시계 수집 → 6초간 슬로우

파워워커 모드
- 5초 무적 + 속도 1.7배 + 점수 2배
- 비네트·화면 경고 효과

테마 시스템 (7개)
- 0m    🌳 공원: 바위, 물웅덩이
- 150m  🌲 숲길: 그루터기, 다람쥐 dodger, 웅덩이
- 350m  🍁 단풍: 바위, 단풍낙엽
- 600m  🌸 벚꽃: 바위, 벚꽃낙엽
- 1000m ❄️ 눈길: 바위, 눈사람
- 1500m 🎋 대나무: 죽순🎍, 돌맹이, 등산객 dodger
- 2000m 🌙 달빛 (보너스): 장애물 없음, 황금 발자국 +20점

살아있는 장애물 (dodger)
- 다람쥐: 190px 접근 시 반대 방향으로 도망
- 등산객: "먼저 가세요~!" 말풍선 후 비켜줌
- 충돌 시 게임오버

랭킹
- Firebase Realtime Database 상위 50위
- 점수순 / 거리순 탭 분리
- 점수·거리 각각 독립 갱신 (더 높은 값만 업데이트)
- 닉네임 기기 ID 보호, 욕설 필터

도감
- 테마 최초 진입 시 자동 해금
- 실제 배경 애니메이션 + 장애물 미리보기
- 달빛길은 보너스 구간으로 금색 특별 표시

⸻

폴더 구조

src/

├── App.tsx

├── components/
│   ├── GameCanvas.tsx          # 캔버스 + 터치/키보드 입력
│   ├── GameHUD.tsx
│   ├── GameOverModal.tsx
│   ├── CharacterSelect.tsx
│   ├── ThemeCollectionModal.tsx
│   ├── MilestoneToast.tsx
│   ├── ThemeToast.tsx
│   ├── SpeechBubble.tsx
│   ├── PowerOverlay.tsx
│   ├── RecordsModal.tsx
│   └── RankingModal.tsx        # 점수순/거리순 탭

├── game/
│   ├── GameEngine.ts
│   ├── constants.ts
│   ├── types.ts
│   ├── collision.ts
│   ├── spawn.ts
│   ├── themes.ts               # 7개 테마 정의
│   ├── themeRenderer.ts        # 배경·장식 렌더링
│   └── characters.ts

├── hooks/
│   └── useGame.ts

├── utils/
│   ├── audio.ts
│   ├── records.ts
│   ├── ranking.ts              # Firebase upsert (점수·거리 독립 갱신)
│   ├── themeCollection.ts
│   ├── deviceId.ts
│   └── profanity.ts

├── assets/

└── main.tsx

⸻

코딩 규칙

App.tsx: 레이아웃 조립만 담당

GameCanvas.tsx: Canvas 생성 + 터치/키보드 입력 처리

GameEngine.ts: 게임 루프 (update / render / requestAnimationFrame)

themes.ts: 테마 정의 및 거리 구간

themeRenderer.ts: 테마별 배경·장식 렌더링 (renderBackground / renderDecorations)

ranking.ts: Firebase CRUD — 점수·거리 독립 갱신, 닉네임 중복 보호

⸻

빌드 및 배포

npm run dev          # 개발 서버
npm run build        # 웹 빌드
npm run build:ait    # 앱인토스 .ait 패키징
npm run deploy       # 앱인토스 배포

앱인토스 appName: hamkke-walk-game
설정 파일: granite.config.ts

⸻

Firebase 규칙

```json
{
  "rules": {
    "rankings": {
      ".read": true,
      ".write": true,
      ".indexOn": ["score", "nickname", "distanceMeters"]
    }
  }
}
```
