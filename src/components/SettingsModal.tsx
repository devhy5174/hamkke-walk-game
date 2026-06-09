import { useState } from "react";
import type { CSSProperties } from "react";
import { HiSpeakerWave, HiSpeakerXMark } from "react-icons/hi2";
import { IoChevronBack } from "react-icons/io5";

interface Props {
  onClose: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

type View = "main" | "privacy" | "terms";

export function SettingsModal({ onClose, isMuted, onToggleMute }: Props) {
  const [view, setView] = useState<View>("main");

  return (
    <div style={backdrop} onClick={view === "main" ? onClose : undefined}>
      <div style={view === "main" ? cardMain : cardDoc} onClick={(e) => e.stopPropagation()}>
        {view === "main" && <MainView isMuted={isMuted} onToggleMute={onToggleMute} onClose={onClose} onNav={setView} />}
        {view === "privacy" && <DocView title="개인정보처리방침" onBack={() => setView("main")}><PrivacyContent /></DocView>}
        {view === "terms" && <DocView title="이용약관" onBack={() => setView("main")}><TermsContent /></DocView>}
      </div>
    </div>
  );
}

function MainView({
  isMuted,
  onToggleMute,
  onClose,
  onNav,
}: {
  isMuted: boolean;
  onToggleMute: () => void;
  onClose: () => void;
  onNav: (v: View) => void;
}) {
  return (
    <>
      <div style={{ textAlign: "center", marginBottom: 22 }}>
        <div style={{ fontSize: "2rem", marginBottom: 4 }}>⚙️</div>
        <h2 style={titleStyle}>설정</h2>
      </div>

      {/* 소리 */}
      <div style={{ marginBottom: 16 }}>
        <div style={sectionLabel}>소리</div>
        <button style={soundRow} onClick={onToggleMute}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {isMuted ? (
              <HiSpeakerXMark size={22} color="#aaa" />
            ) : (
              <HiSpeakerWave size={22} color="#3DAE79" />
            )}
            <span style={{ fontSize: "0.95rem", fontWeight: 600, color: isMuted ? "#aaa" : "#333" }}>
              {isMuted ? "소리 꺼짐" : "소리 켜짐"}
            </span>
          </div>
          <div style={toggle(isMuted)}>
            <div style={toggleThumb(isMuted)} />
          </div>
        </button>
      </div>

      {/* 법적 */}
      <div style={{ marginBottom: 22 }}>
        <div style={sectionLabel}>정보</div>
        <button style={{ ...menuRow, borderRadius: "16px 16px 0 0" }} onClick={() => onNav("privacy")}>
          <span style={menuText}>개인정보처리방침</span>
          <span style={chevron}>›</span>
        </button>
        <button style={{ ...menuRow, borderTop: "none", borderRadius: "0 0 16px 16px" }} onClick={() => onNav("terms")}>
          <span style={menuText}>이용약관</span>
          <span style={chevron}>›</span>
        </button>
      </div>

      <button style={closeBtn} onClick={onClose}>
        닫기
      </button>
    </>
  );
}

function DocView({
  title,
  onBack,
  children,
}: {
  title: string;
  onBack: () => void;
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={docHeader}>
        <button style={backBtn} onClick={onBack}>
          <IoChevronBack size={20} color="#3DAE79" />
        </button>
        <h2 style={docTitle}>{title}</h2>
        <div style={{ width: 36 }} />
      </div>
      <div style={docScroll}>{children}</div>
    </div>
  );
}

function PrivacyContent() {
  return (
    <div style={docBody}>
      <p style={docMeta}>시행일: 2026년 6월 9일</p>

      <p style={docP}>
        산책길 모험(이하 "서비스")은 이용자의 개인정보를 소중히 여기며,
        「개인정보 보호법」 등 관련 법령을 준수합니다.
      </p>

      <h3 style={docH3}>1. 수집하는 개인정보 항목</h3>
      <p style={docP}>
        본 서비스는 랭킹 등록을 선택한 이용자에 한하여 아래 정보를 수집합니다.
      </p>
      <ul style={docUl}>
        <li>이용자가 직접 입력한 닉네임</li>
        <li>게임 점수 및 게임 거리(기록)</li>
        <li>기기 식별자(중복 등록 방지를 위해 기기 내 임의 생성되는 ID)</li>
      </ul>
      <p style={docP}>
        랭킹 등록을 하지 않는 경우 어떠한 개인정보도 수집하지 않습니다.
      </p>

      <h3 style={docH3}>2. 개인정보 수집 목적</h3>
      <ul style={docUl}>
        <li>랭킹 서비스 제공 및 운영</li>
        <li>중복 또는 부정 등록 방지</li>
      </ul>

      <h3 style={docH3}>3. 개인정보 보유 및 이용 기간</h3>
      <p style={docP}>
        수집된 정보는 서비스 종료 시 또는 이용자의 삭제 요청 시까지 보유합니다.
      </p>

      <h3 style={docH3}>4. 개인정보의 제3자 제공</h3>
      <p style={docP}>
        이용자의 동의 없이 개인정보를 제3자에게 제공하지 않습니다.
      </p>

      <h3 style={docH3}>5. 개인정보 처리 위탁</h3>
      <p style={docP}>
        서비스는 Google LLC의 Firebase Realtime Database를 통해 데이터를
        저장·관리합니다.
      </p>
      <ul style={docUl}>
        <li>수탁 업체: Google LLC (Firebase)</li>
        <li>위탁 업무: 게임 기록 데이터 저장 및 관리</li>
      </ul>

      <h3 style={docH3}>6. 이용자의 권리</h3>
      <p style={docP}>
        이용자는 언제든지 자신의 닉네임 및 기록 삭제를 요청할 수 있습니다.
        아래 이메일로 문의해 주세요.
      </p>
      <p style={{ ...docP, fontWeight: 600 }}>devhy5174@gmail.com</p>

      <h3 style={docH3}>7. 개인정보 보호책임자</h3>
      <ul style={docUl}>
        <li>담당자: devhy</li>
        <li>이메일: devhy5174@gmail.com</li>
      </ul>

      <h3 style={docH3}>8. 광고 및 분석 도구</h3>
      <p style={docP}>
        현재 본 서비스는 광고 및 별도의 사용자 행동 분석 도구를 사용하지
        않습니다.
      </p>
    </div>
  );
}

function TermsContent() {
  return (
    <div style={docBody}>
      <p style={docMeta}>시행일: 2026년 6월 9일</p>

      <h3 style={docH3}>1. 목적</h3>
      <p style={docP}>
        본 약관은 산책길 모험(이하 "서비스")의 이용 조건 및 절차에 관한 사항을
        규정합니다.
      </p>

      <h3 style={docH3}>2. 서비스 내용</h3>
      <ul style={docUl}>
        <li>본 서비스는 모바일 캐주얼 게임입니다.</li>
        <li>회원가입·로그인·결제 없이 무료로 이용할 수 있습니다.</li>
        <li>
          이용자는 닉네임을 직접 입력하여 전체 랭킹에 기록을 등록할 수
          있습니다.
        </li>
      </ul>

      <h3 style={docH3}>3. 이용자 의무</h3>
      <ul style={docUl}>
        <li>타인에게 불쾌감을 주거나 욕설이 포함된 닉네임을 사용할 수 없습니다.</li>
        <li>서비스를 비정상적인 방법으로 이용하거나 악의적으로 조작해서는 안 됩니다.</li>
        <li>타인의 기록을 방해하거나 서비스 운영을 저해하는 행위를 할 수 없습니다.</li>
      </ul>

      <h3 style={docH3}>4. 서비스 제공 및 변경</h3>
      <ul style={docUl}>
        <li>운영자는 서비스 내용을 변경하거나 종료할 수 있습니다.</li>
        <li>
          시스템 점검, 장애 등의 사유로 서비스가 일시 중단될 수 있습니다.
        </li>
        <li>
          서비스의 중요한 변경이 있을 경우 앱 내 공지를 통해 안내합니다.
        </li>
      </ul>

      <h3 style={docH3}>5. 지적재산권</h3>
      <p style={docP}>
        서비스 내 그래픽, 음원, 게임 로직 등 모든 콘텐츠의 지적재산권은
        운영자에게 귀속됩니다. 이용자는 운영자의 사전 동의 없이 이를 복제,
        배포, 수정할 수 없습니다.
      </p>

      <h3 style={docH3}>6. 면책 조항</h3>
      <ul style={docUl}>
        <li>
          운영자는 천재지변, 서비스 장애 등 불가항력적 사유로 인한 손해에 대해
          책임을 지지 않습니다.
        </li>
        <li>
          이용자가 입력한 닉네임의 내용에 대한 책임은 이용자 본인에게
          있습니다.
        </li>
        <li>
          본 서비스는 현재 광고를 포함하지 않으나, 추후 광고가 추가될 수
          있으며 이 경우 사전에 공지합니다.
        </li>
      </ul>

      <h3 style={docH3}>7. 준거법 및 분쟁 해결</h3>
      <p style={docP}>
        본 약관은 대한민국 법률에 따라 해석되며, 서비스 이용과 관련한 분쟁은
        대한민국 법원을 관할 법원으로 합니다.
      </p>

      <h3 style={docH3}>8. 문의</h3>
      <p style={{ ...docP, fontWeight: 600 }}>devhy5174@gmail.com</p>
    </div>
  );
}

// ── 스타일 ──────────────────────────────────────────────────────────────────

const backdrop: CSSProperties = {
  position: "absolute",
  inset: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "rgba(200,235,218,0.55)",
  backdropFilter: "blur(6px)",
  zIndex: 50,
};

const cardMain: CSSProperties = {
  background: "#fff",
  borderRadius: 28,
  padding: "28px 22px 22px",
  boxShadow: "0 8px 40px rgba(61,174,121,0.18)",
  maxWidth: 300,
  width: "88%",
};

const cardDoc: CSSProperties = {
  background: "#fff",
  borderRadius: 28,
  boxShadow: "0 8px 40px rgba(61,174,121,0.18)",
  maxWidth: 340,
  width: "92%",
  height: "82dvh",
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
};

const titleStyle: CSSProperties = {
  margin: 0,
  fontSize: "1.4rem",
  fontWeight: 800,
  color: "#2D7D52",
};

const sectionLabel: CSSProperties = {
  fontSize: "0.72rem",
  fontWeight: 700,
  color: "#A0C0B0",
  letterSpacing: 1,
  textTransform: "uppercase" as const,
  marginBottom: 8,
};

const soundRow: CSSProperties = {
  width: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  background: "#F5FBF8",
  border: "1.5px solid #D0EEE0",
  borderRadius: 16,
  padding: "14px 16px",
  cursor: "pointer",
};

const toggle = (muted: boolean): CSSProperties => ({
  width: 44,
  height: 24,
  borderRadius: 50,
  background: muted ? "#DDD" : "#3DAE79",
  position: "relative",
  transition: "background 0.2s",
  flexShrink: 0,
});

const toggleThumb = (muted: boolean): CSSProperties => ({
  position: "absolute",
  top: 3,
  left: muted ? 3 : 23,
  width: 18,
  height: 18,
  borderRadius: "50%",
  background: "#fff",
  boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
  transition: "left 0.2s",
});

const menuRow: CSSProperties = {
  width: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  background: "#F5FBF8",
  border: "1.5px solid #D0EEE0",
  borderRadius: 0,
  padding: "14px 16px",
  cursor: "pointer",
  borderTop: "1.5px solid #D0EEE0",
};

const menuText: CSSProperties = {
  fontSize: "0.93rem",
  fontWeight: 600,
  color: "#333",
};

const chevron: CSSProperties = {
  fontSize: "1.2rem",
  color: "#A0C0B0",
  lineHeight: 1,
};

const closeBtn: CSSProperties = {
  background: "#3DAE79",
  color: "#fff",
  border: "none",
  borderRadius: 50,
  padding: "13px 0",
  fontSize: "1rem",
  fontWeight: 700,
  cursor: "pointer",
  width: "100%",
  boxShadow: "0 4px 16px rgba(61,174,121,0.3)",
};

const docHeader: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "18px 16px 14px",
  borderBottom: "1.5px solid #E8F5EE",
  flexShrink: 0,
};

const backBtn: CSSProperties = {
  width: 36,
  height: 36,
  border: "none",
  background: "#F0FAF5",
  borderRadius: "50%",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 0,
};

const docTitle: CSSProperties = {
  margin: 0,
  fontSize: "1.05rem",
  fontWeight: 800,
  color: "#2D7D52",
};

const docScroll: CSSProperties = {
  overflowY: "auto",
  flex: 1,
  padding: "18px 20px 24px",
};

const docBody: CSSProperties = {
  fontSize: "0.85rem",
  color: "#444",
  lineHeight: 1.75,
};

const docMeta: CSSProperties = {
  fontSize: "0.78rem",
  color: "#A0B4AC",
  marginBottom: 16,
};

const docH3: CSSProperties = {
  fontSize: "0.88rem",
  fontWeight: 800,
  color: "#2D7D52",
  margin: "18px 0 6px",
};

const docP: CSSProperties = {
  margin: "0 0 10px",
};

const docUl: CSSProperties = {
  margin: "0 0 10px",
  paddingLeft: 18,
};
