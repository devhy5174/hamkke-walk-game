프로젝트 개요

프로젝트명: 산책길 모험

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
- 테마별 오브 궤도 이펙트 (일반: 민트 물방울 6개 / 달빛길: 황금+보라 별 8개)
- 달빛길에선 경고 문구·비네트 없음 (여유로운 분위기 유지)

속도 시스템

- speedMult = SPEED_BASE(1.5) + aliveTime * SPEED_RAMP (0.025)
- 최대 4.2배 캡 (SPEED_CAP)
- 달빛길은 2배 고정 (MOONLIGHT_SPEED) — 여유롭게 즐기기
- 시계 아이템 달빛길에선 스폰 안 함

테마 시스템 (7개)

- 0m    🌳 공원: 바위, 물웅덩이
- 150m  🌲 숲길: 그루터기, 다람쥐 dodger, 웅덩이 / 반딧불 이펙트
- 350m  🍁 단풍: 바위, 단풍낙엽 / 단풍나무 가지 사이드
- 600m  🌸 벚꽃: 바위, 벚꽃낙엽 / 벚꽃 가지 오버행 + 꽃잎 낙화
- 1000m ❄️ 눈길: 바위(눈 쌓임), 눈사람 / 눈 파티클 + 발자국 트레일
- 1500m 🎋 대나무: 돌맹이, 등산객 dodger / 사선 대나무 묶음 + 물방울
- 2000m 🌙 달빛 (보너스): 장애물·시계 없음, 황금 발자국 +20점, 90초 타이머 / 나무 실루엣 + 별가루

달빛길 진입 인트로 컷신 (CompletionIntro)

- 2000m 도달 시 자동 시작, 게임 플레이와 완전히 분리된 컷신 클래스
- 페이즈 순서: showfp → speech1wait → eatfp → walkoff → fadeout → darkfp → eatdarkfp → flashwhite → done
- showfp: 캐릭터 앞에 황금 발자국 5개 하나씩 등장 → "어? 황금 발자국?!" 말풍선
- eatfp: 캐릭터가 자동으로 위로 이동하며 발자국 수집
- walkoff: 마지막 발자국 수집 후 캐릭터가 화면 위로 완전히 퇴장
- fadeout: 화면이 검게 페이드 (1초)
- darkfp: 검은 화면에서 캐릭터가 아래에서 올라오는 등장 (eatfp와 동일 속도) → 발자국 5개 → 달빛문 등장
  - 달빛문 내부: 방사형 빛줄기 10개 + ✦ 반짝이 파티클 14개 + 외곽 발광
- eatdarkfp: "발자국을 따라가보자!" 말풍선 → 유저가 상하좌우 이동으로 발자국 수집 후 문 진입
  - 발자국 미수집 상태로 문 접근 시 힌트 말풍선 (4초 쿨다운)
- flashwhite: 화이트 플래시 후 즉시 달빛길 테마 전환 + 완주 토스트 표시
- 완주 토스트: "축하해요! 🎊 / 비밀 산책길을 발견했어요. 🌙" (3.5초 자동 소멸)
- 인트로 중 말풍선 탭으로 즉시 진행, 없으면 자동 진행

달빛길 완주 시스템

- 90초 후 finishSequence 시작 → FINISHED 배너 + 황금 발자국 배경 이미지
- 2.5초 후 photoMode 진입: 캐릭터 중앙 정렬, 아이템 숨김, 완주 말풍선 고정
- 달빛길 BGM(bgm_finished.mp3) 유지 → 완주 결과 확인 탭 시 종료
- 완주 오버레이: 랭킹 등록 → 달빛길로 돌아가기 / 랭킹 후 메인으로 가기
- showCompletionOverlay 별도 state로 분리 (gameEnded와 독립)
- photoMode 중 파워모드 이펙트(불꽃·오브·비네트) 숨김

살아있는 장애물 (dodger)

- 다람쥐 (숲길): 190px 접근 시 반대 방향으로 도망, dodgerType="squirrel"
- 등산객 (대나무): "먼저 가세요~!" 말풍선 후 비켜줌, dodgerType="hiker"
- dodgerType 기반으로 이미지 고정 — 테마 전환 시 이미지 바뀌는 버그 방지
- 충돌 시 게임오버

BGM

- 메인: bgm-main.mp3 (게임 시작~게임오버)
- 달빛길: bgm_finished.mp3 (2000m 진입 시 자동 전환, 완주 결과 확인 시 종료)
- audio.ts의 switchToMoonlightBGM() 호출 → useGame handleThemeChange에서 연결

랭킹

- Firebase Realtime Database 상위 50위
- 점수순 / 거리순 탭 분리
- 점수·거리 각각 독립 갱신 (더 높은 값만 update)
- 닉네임 기기 ID 보호, 욕설 필터

도감

- 테마 최초 진입 시 자동 해금
- 실제 배경 애니메이션 + 장애물 미리보기 (달빛길은 황금 발자국 애니메이션)
- 달빛길은 보너스 구간으로 금색 점선 테두리 + ✨ 아이콘 + 달 float 애니메이션
- 산책하기 버튼: 전체 해금 시 활성화, 테마별 색상 적용

산책 모드 (전체 해금 후 활성화)

- 도감에서 테마 선택 후 진입 — 속도 고정, 아이템 없음, 충돌 무시
- 상하좌우 드래그 이동, 하단 ＋/－ 속도 조절 버튼 (6단계: 1.0x~5.0x)
- 테마별 색상 간판 + 분위기 말풍선 (6~11초 랜덤)
- 달빛길 포토타임: 자유 이동 유지, 황금 발자국 트레일, 말풍선 편집 가능
- practiceSpeedMult 필드로 외부 속도 조절 — speedMult getter에서 isPracticeMode 우선 적용

주요 컴포넌트 (신규)

- TipsModal: 게임 방법 안내 팝업 (메인 화면 버튼)
- PracticeThemeBanner: 산책 모드 상단 테마별 색상 간판 (THEME_STYLES export)

HUD 테마별 디자인

- GameHUD.tsx 내 THEME_HUD 테이블로 테마마다 배경·색상·게이지 개별 지정
- 공원·벚꽃·단풍·눈길: 라이트 배경 + 진한 텍스트
- 숲길·대나무·달빛길: 다크 배경 + 밝은 텍스트
- transition으로 테마 전환 시 부드럽게 변경

성능 최적화

- emitUpdate 100ms 스로틀링 — React 리렌더 60fps → ~10fps (아이템 수집·모드 전환만 force=true 즉각 반영)
- filter() → in-place splice — 매 프레임 6개 배열 생성 제거로 GC 압박 해소
- 물병 SFX Web Audio API 전환 — iOS HTMLAudioElement.play() 메인 스레드 블로킹 제거
  - 첫 터치 시 AudioContext 언락 + sfx 미리 디코딩 (GameCanvas.tsx)
  - playWater()에서 AudioBufferSourceNode 재생

로딩 스플래시

- index.html에 순수 CSS 스플래시 (JS 실행 전부터 즉시 표시, 검정 깜빡임 제거)
- app_logo.png + item-footprint.png 걷기 애니메이션 (좌-우-좌 0.55초 간격)
- 발자국 색상: CSS filter로 게임 그린(#3DAE79) 변환
- 최소 1.2초 노출 후 0.35초 페이드 아웃

기타 개선

- 시계 종료 후 1.2초 속도 페이드인 (slowEaseTimer)
- 다람쥐·등산객 이동 방향으로 이미지 좌우 반전
- 등산객 말풍선 2단 순차 표시
- snowTrailIdx 단조 증가 카운터 (필터링 후 좌우 패턴 유지)
- darkeat 땀방울 파티클 숨김 (컷신 중 completionIntro.isActive 조건)
- eatfp 중 밝은 배경에서 황금 발자국 흰 후광 추가 (fadeAlpha < 0.5)
- 포토타임 파워모드 이펙트(불꽃·오브·비네트) 숨김

⸻

폴더 구조

src/

├── App.tsx

├── components/
│ ├── GameCanvas.tsx # 캔버스 + 터치/키보드 입력 (상하좌우 지원)
│ ├── GameHUD.tsx
│ ├── GameOverModal.tsx
│ ├── CharacterSelect.tsx
│ ├── ThemeCollectionModal.tsx
│ ├── TipsModal.tsx # 게임 방법 안내 팝업
│ ├── PracticeThemeBanner.tsx # 산책 모드 테마별 간판 (THEME_STYLES export)
│ ├── MilestoneToast.tsx
│ ├── ThemeToast.tsx
│ ├── SpeechBubble.tsx # editable prop으로 포토타임 말풍선 편집 가능
│ ├── PowerOverlay.tsx
│ ├── RecordsModal.tsx
│ └── RankingModal.tsx # 점수순/거리순 탭

├── game/
│ ├── GameEngine.ts
│ ├── CompletionIntro.ts # 달빛길 진입 컷신 (페이즈 기반 클래스)
│ ├── constants.ts
│ ├── types.ts
│ ├── collision.ts
│ ├── spawn.ts
│ ├── themes.ts # 7개 테마 정의
│ ├── themeRenderer.ts # 배경·장식 렌더링
│ └── characters.ts

├── hooks/
│ └── useGame.ts

├── utils/
│ ├── audio.ts
│ ├── records.ts
│ ├── ranking.ts # Firebase upsert (점수·거리 독립 갱신)
│ ├── themeCollection.ts
│ ├── deviceId.ts
│ └── profanity.ts

├── assets/

└── main.tsx

⸻

코딩 규칙

App.tsx: 레이아웃 조립만 담당

GameCanvas.tsx: Canvas 생성 + 터치/키보드 입력 처리

GameEngine.ts: 게임 루프 (update / render / requestAnimationFrame)

themes.ts: 테마 정의 및 거리 구간

themeRenderer.ts: 테마별 배경·장식 렌더링 (renderBackground / renderDecorations)

CompletionIntro.ts: 달빛길 진입 컷신 — 페이즈 기반 상태 머신, GameEngine에서 update/render 호출

ranking.ts: Firebase CRUD — 점수·거리 독립 갱신, 닉네임 중복 보호

⸻

빌드 및 배포

npm run dev # 개발 서버
npm run build # 웹 빌드
npm run build:ait # 앱인토스 .ait 패키징
npm run deploy # 앱인토스 배포

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
