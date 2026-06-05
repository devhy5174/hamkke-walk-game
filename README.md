# 함께Walk 미니게임

> **함께걸어요** 앱 내장 미니게임  
> React + TypeScript + Vite + HTML5 Canvas 기반 모바일 캐주얼 러닝게임

---

## 개요

산책길을 달리며 발자국을 수집하고 장애물을 피하는 힐링 미니게임입니다.  
게임보다 산책과 동기부여를 우선하는 **함께걸어요** 앱의 감성에 맞게 디자인됐습니다.

---

## 핵심 게임 루프

```
드래그로 캐릭터 좌우 이동
→ 발자국 수집 (+10점 / 파워워커 중 +20점)
→ 물병 10개 수집 → 파워워커 발동 (5초 무적 + 속도 1.7배 + 점수 2배)
→ 돌·웅덩이 충돌 → 게임오버
→ 화면 고정 후 탭 → 결과 확인
```

---

## 주요 기능

### 게임 시스템
- **캐릭터 선택** — 여자 3종 / 남자 3종, 원형 아바타, 마지막 선택 기억
- **드래그 조작** — 터치 드래그로 캐릭터 이동 (`passive: false` 적용)
- **거리 기반 점수** — 10m마다 +1점 자동 적립
- **파워워커 모드** — 물병 10개 수집 시 발동, 물방울 오브 시각 효과 + 민트 비네트

### 산책 여행 시스템 (6개 테마)
| 거리 | 테마 | 장애물 변화 |
|------|------|------------|
| 0m~ | 🌳 공원 산책길 | 돌 + 물웅덩이 |
| 150m~ | 🌲 숲길 | 돌 + 다람쥐 (피해서 도망!) |
| 350m~ | 🍁 단풍길 | 돌 + 단풍낙엽 |
| 600m~ | 🌸 벚꽃길 | 돌 + 벚꽃낙엽 |
| 1000m~ | ❄️ 눈길 | 돌 + 눈사람 |
| 2000m~ | ⛰️ 산길 | 돌 + 등산객 (먼저 가세요~!) |

### 살아있는 장애물
- **다람쥐** — 플레이어 190px 이내 접근 시 "!" 표시 후 통통 튀면서 도망, 플레이어 말풍선 "앗! 다람쥐다! 🐿️"
- **등산객** — 발견 시 "먼저 가세요~!" 말풍선, 플레이어 "안녕하세요! 🙋"
- 충돌 판정 없음 — 피해주는 캐릭터는 맞지 않음

### 마일스톤 & 토스트
- 거리 도달 시 마일스톤 토스트 (50 / 150 / 350 / 600 / 1200m)
- 테마 구간 진입 시 토스트 알림

### 기록 & 랭킹
- **내 기록** — localStorage 상위 10개 저장 (점수·거리·날짜)
- **전체 랭킹** — Firebase Realtime Database 연동, 상위 50위 표시
- 닉네임 중복 방지, 욕설 필터링, 마지막 닉네임 자동 기억

### 사운드
- BGM — 게임 시작 시 자동 재생, 게임오버 시 중지 (loop)
- 물병 수집 효과음 — 앞 1.5초만 재생

---

## 기술 스택

| 항목 | 내용 |
|------|------|
| 프레임워크 | React 19 + TypeScript |
| 빌드 | Vite |
| 렌더링 | HTML5 Canvas (`requestAnimationFrame`) |
| 백엔드 | Firebase Realtime Database |
| 상태관리 | `useState` (UI) / `useRef` + 클래스 내부 (게임 데이터) |

---

## 폴더 구조

```
src/
├── App.tsx                    # 레이아웃 조립
├── firebase.ts                # Firebase 초기화
│
├── game/
│   ├── GameEngine.ts          # 게임 루프 (update / render / rAF)
│   ├── types.ts               # 타입 정의
│   ├── constants.ts           # 게임 상수 (속도·크기·마일스톤)
│   ├── collision.ts           # 충돌 판정
│   ├── spawn.ts               # 아이템·장애물 스폰
│   ├── themes.ts              # 테마 정의 및 거리 구간
│   ├── themeRenderer.ts       # 테마별 배경·장식 렌더링
│   └── characters.ts          # 캐릭터 정의 및 localStorage
│
├── hooks/
│   └── useGame.ts             # 게임 상태 브릿지 훅
│
├── components/
│   ├── GameCanvas.tsx         # 캔버스 + 터치 입력
│   ├── GameHUD.tsx            # 점수·거리·게이지·테마 표시
│   ├── GameOverModal.tsx      # 게임 종료 결과 팝업
│   ├── CharacterSelect.tsx    # 캐릭터 선택 UI
│   ├── MilestoneToast.tsx     # 마일스톤 토스트
│   ├── ThemeToast.tsx         # 테마 진입 토스트
│   ├── SpeechBubble.tsx       # 캐릭터 말풍선
│   ├── PowerOverlay.tsx       # 파워워커 화면 효과
│   ├── RecordsModal.tsx       # 내 기록 팝업
│   └── RankingModal.tsx       # 전체 랭킹 팝업
│
├── utils/
│   ├── audio.ts               # BGM·효과음 관리
│   ├── records.ts             # localStorage 기록 저장
│   ├── ranking.ts             # Firebase 랭킹 저장·조회
│   └── profanity.ts           # 욕설 필터
│
└── assets/
    ├── images/
    │   ├── item-footprint.png
    │   ├── item-water-bottle.png
    │   ├── obstacles/         # 테마별 장애물 이미지 (256×256px)
    │   └── characters/        # 캐릭터 이미지 (webp)
    └── sounds/
        ├── bgm-main.mp3
        └── sfx-water.mp3
```

---

## 환경 변수 설정

프로젝트 루트에 `.env.local` 파일 생성:

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_DATABASE_URL=...
VITE_FIREBASE_PROJECT_ID=...
```

Firebase Realtime Database 규칙:

```json
{
  "rules": {
    "rankings": {
      ".read": true,
      ".write": true,
      ".indexOn": ["score", "nickname"]
    }
  }
}
```

---

## 실행

```bash
npm install
npm run dev
```

---

## 설계 원칙

- 게임 로직과 UI 상태 분리 — `GameEngine` 클래스 내부는 순수 게임 로직
- 상태관리 라이브러리 없음 — `useState` (UI) + `useRef` (게임 실시간 데이터)
- 모바일 우선 — 세로 화면, 터치 드래그, `passive: false` 이벤트
- 힐링 감성 우선 — 공격적이거나 경쟁적인 요소 최소화
