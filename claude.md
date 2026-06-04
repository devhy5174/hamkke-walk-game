프로젝트 개요

프로젝트명: 함께Walk

모바일 세로 화면 기반의 캐주얼 러닝 게임.

플레이어는 캐릭터를 좌우로 이동시키며 발자국을 수집하고 장애물을 피한다.

초기 목표는 MVP 구현이며 디자인보다 게임성 검증을 우선한다.

⸻

기술 스택

- React
- TypeScript
- Vite
- HTML5 Canvas

⸻

개발 원칙

- MVP 우선
- 디자인보다 게임 루프 구현 우선
- 상태관리 라이브러리 사용 금지
- 실시간 게임 데이터는 useRef 사용
- UI 상태는 useState 사용
- 코드 단순성 우선

⸻

MVP 기능

플레이어

- 자동 전진
- 좌우 이동

아이템

- 발자국 수집
- 점수 증가

장애물

- 자동차
- 충돌 시 게임오버

UI

- 현재 점수
- 최고 점수
- 게임오버 화면
- 다시하기 버튼

⸻

폴더 구조

src/

├── App.tsx

├── components/
│ ├── GameCanvas.tsx
│ ├── GameHUD.tsx
│ └── GameOverModal.tsx

├── game/
│ ├── GameEngine.ts
│ ├── constants.ts
│ ├── types.ts
│ ├── collision.ts
│ └── spawn.ts

├── hooks/
│ └── useGame.ts

├── assets/

├── index.css

└── main.tsx

⸻

코딩 규칙

App.tsx

레이아웃 조립만 담당

GameCanvas.tsx

Canvas 생성 및 입력 처리

GameEngine.ts

게임 루프 처리

- update()
- render()
- requestAnimationFrame()

types.ts

게임 타입 정의

constants.ts

게임 상수 정의

⸻

현재 단계

Step 1

- 플레이어 표시
- 좌우 이동
- 발자국 생성
- 장애물 생성
- 충돌 판정
- 점수 증가
- 게임오버

이미지 에셋 사용 금지

플레이어: 파란 사각형

발자국: 노란 원

장애물: 빨간 사각형

으로 구현한다.
