import type { CSSProperties } from "react";
import { MdEmojiNature, MdWarning } from "react-icons/md";
import { IoShieldCheckmark, IoFootstepsOutline } from "react-icons/io5";

import obsParRock from "../assets/images/obstacles/obs-park-rock.png";
import obsParPuddle from "../assets/images/obstacles/obs-park-puddle.png";
import obsForRock from "../assets/images/obstacles/obs-forest-rock.png";
import obsForPuddle from "../assets/images/obstacles/obs-forest-puddle.png";
import obsAutRock from "../assets/images/obstacles/obs-autumn-rock.png";
import obsCheRock from "../assets/images/obstacles/obs-cherry-rock.png";
import obsSnoRock from "../assets/images/obstacles/obs-snow-rock.png";
import obsMtnRock from "../assets/images/obstacles/obs-mountain-rock.png";

interface Props {
  onClose: () => void;
}

export function TipsModal({ onClose }: Props) {
  return (
    <div style={backdrop} onClick={onClose}>
      <div style={card} onClick={(e) => e.stopPropagation()}>
        <div style={headerStyle}>
          <div style={{ fontSize: "2rem", marginBottom: 4 }}>📖</div>
          <h2 style={titleStyle}>게임 방법</h2>
          <p style={subtitleStyle}>산책길 모험 가이드</p>
        </div>

        <div style={scrollArea}>
          {/* 기본 조작 */}
          <Section title="기본 조작">
            <Row
              emoji="👆"
              label="드래그로 좌우 이동"
              desc="화면을 드래그해서 캐릭터를 움직여요."
            />
            <Row
              emoji="🏃"
              label="자동 전진"
              desc="캐릭터는 자동으로 달려요. 오래 달릴수록 점점 빨라져요."
            />
            <Row
              emoji="💀"
              label="장애물 충돌 = 게임 오버"
              desc="장애물에 부딪히면 끝이에요."
            />
          </Section>

          {/* 아이템 */}
          <Section
            title="아이템"
            icon={<IoFootstepsOutline size={15} color="#3DAE79" />}
          >
            <Row
              emoji="🏃"
              label="거리 — 10m마다 +1점"
              desc="달리기만 해도 점수가 쌓여요. 오래 달릴수록 유리해요."
            />
            <Row
              emoji="🟡"
              label="발자국 — +10점"
              desc="모을수록 점수가 올라요."
            />
            <Row
              emoji="💧"
              label="물병 — 파워워커 게이지 +1"
              desc="10개 모으면 파워워커 모드 발동!"
            />
            <Row
              emoji="⏱️"
              label="시계 — 6초 슬로우"
              desc="6초간 속도가 절반으로 줄어요. 잠깐 숨 돌리기 좋아요."
            />
          </Section>

          {/* 파워워커 */}
          <Section
            title="파워워커 모드"
            icon={<IoShieldCheckmark size={15} color="#FF6B35" />}
          >
            <div style={powerBox}>
              <div
                style={{
                  fontWeight: 800,
                  color: "#E85D04",
                  marginBottom: 8,
                  fontSize: "0.88rem",
                }}
              >
                ⚡ 물병 10개 모으면 자동 발동!
              </div>
              <div style={powerRow}>
                🛡️ <span>5초간 장애물 무적</span>
              </div>
              <div style={powerRow}>
                💨 <span>이동 속도 1.7배</span>
              </div>
              <div style={powerRow}>
                ✨ <span>점수 2배 획득</span>
              </div>
              <div
                style={{
                  marginTop: 8,
                  fontSize: "0.78rem",
                  color: "#8ABD9E",
                  lineHeight: 1.5,
                }}
              >
                종료 3초 전에 경고가 표시돼요. 미리 안전한 자리로!
              </div>
            </div>
          </Section>

          {/* 특별한 이웃들 */}
          <Section
            title="특별한 이웃들"
            icon={<MdEmojiNature size={15} color="#52C87A" />}
          >
            <SpecialRow
              src={obsForPuddle}
              label="다람쥐"
              tag="숲길"
              desc="가까이 다가가면 반대 방향으로 도망가요! 도망치다 부딪히면 게임 오버예요."
            />
            <SpecialRow
              src={obsMtnRock}
              label="등산객"
              tag="대나무"
              desc="'먼저 가세요~!' 하고 옆으로 비켜줘요. 비켜주기 전에 부딪히면 게임 오버예요."
            />
          </Section>

          {/* 장애물 */}
          <Section
            title="장애물 종류"
            icon={<MdWarning size={15} color="#E85D04" />}
          >
            <div style={obstacleGrid}>
              <ObsItem src={obsParRock} label="바위" sub="공원 외" />
              <ObsItem src={obsParPuddle} label="물웅덩이" sub="공원" />
              <ObsItem src={obsForRock} label="그루터기" sub="숲길" />
              <ObsItem src={obsForPuddle} label="다람쥐" sub="숲길" />
              <ObsItem src={obsAutRock} label="단풍낙엽" sub="단풍" />
              <ObsItem src={obsCheRock} label="벚꽃낙엽" sub="벚꽃" />
              <ObsItem src={obsSnoRock} label="눈사람" sub="눈길" />
              <ObsItem src={obsMtnRock} label="등산객" sub="대나무" />
            </div>
          </Section>

          {/* 테마 구간 — 달빛길 제외 */}
          <Section title="테마 구간">
            {[
              { emoji: "🌳", label: "공원", distance: "0m~" },
              { emoji: "🌲", label: "숲길", distance: "150m~" },
              { emoji: "🍁", label: "단풍", distance: "350m~" },
              { emoji: "🌸", label: "벚꽃", distance: "600m~" },
              { emoji: "❄️", label: "눈길", distance: "1000m~" },
              { emoji: "🎋", label: "대나무", distance: "1500m~" },
            ].map(({ emoji, label, distance }) => (
              <div key={label} style={themeRow}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: "1.1rem" }}>{emoji}</span>
                  <span style={themeLabel}>{label}</span>
                </div>
                <span style={themeDistance}>{distance}</span>
              </div>
            ))}
          </Section>
        </div>

        <button style={closeBtnStyle} onClick={onClose}>
          닫기
        </button>
      </div>
    </div>
  );
}

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={sectionHeader}>
        {icon}
        <span style={sectionTitle}>{title}</span>
      </div>
      {children}
    </div>
  );
}

function Row({
  emoji,
  label,
  desc,
}: {
  emoji: string;
  label: string;
  desc: string;
}) {
  return (
    <div style={rowStyle}>
      <span style={{ fontSize: "1.2rem", flexShrink: 0 }}>{emoji}</span>
      <div>
        <div style={rowLabel}>{label}</div>
        <div style={rowDesc}>{desc}</div>
      </div>
    </div>
  );
}

function SpecialRow({
  src,
  label,
  tag,
  desc,
}: {
  src: string;
  label: string;
  tag: string;
  desc: string;
}) {
  return (
    <div style={specialCard}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
        <img src={src} alt={label} style={{ width: 40, height: 40, objectFit: "contain" }} />
        <span style={{ fontWeight: 800, fontSize: "0.9rem", color: "#2D7D52" }}>
          {label}
        </span>
        <span style={tagStyle}>{tag}</span>
      </div>
      <div style={{ fontSize: "0.8rem", color: "#7AAD8E", lineHeight: 1.6 }}>
        {desc}
      </div>
    </div>
  );
}

function ObsItem({
  src,
  label,
  sub,
}: {
  src: string;
  label: string;
  sub: string;
}) {
  return (
    <div style={obstacleItem}>
      <img
        src={src}
        alt={label}
        style={{ width: 44, height: 44, objectFit: "contain" }}
      />
      <div style={obstacleLabel}>{label}</div>
      <div style={obsSubLabel}>{sub}</div>
    </div>
  );
}

function ObsItemEmoji({
  emoji,
  label,
  sub,
}: {
  emoji: string;
  label: string;
  sub: string;
}) {
  return (
    <div style={obstacleItem}>
      <span
        style={{
          fontSize: "2rem",
          display: "block",
          height: 44,
          lineHeight: "44px",
        }}
      >
        {emoji}
      </span>
      <div style={obstacleLabel}>{label}</div>
      <div style={obsSubLabel}>{sub}</div>
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

const card: CSSProperties = {
  background: "#fff",
  borderRadius: 28,
  padding: "28px 22px 22px",
  boxShadow: "0 8px 40px rgba(61,174,121,0.18)",
  maxWidth: 340,
  width: "92%",
  maxHeight: "84vh",
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
};

const headerStyle: CSSProperties = { textAlign: "center", marginBottom: 16 };
const titleStyle: CSSProperties = {
  margin: "0 0 2px",
  fontSize: "1.4rem",
  fontWeight: 800,
  color: "#2D7D52",
};
const subtitleStyle: CSSProperties = {
  margin: 0,
  fontSize: "0.85rem",
  color: "#8ABD9E",
};

const scrollArea: CSSProperties = {
  overflowY: "auto",
  flex: 1,
  marginBottom: 14,
};

const sectionHeader: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  marginBottom: 10,
  paddingBottom: 6,
  borderBottom: "1.5px solid #E8F5EE",
};
const sectionTitle: CSSProperties = {
  fontWeight: 800,
  fontSize: "0.88rem",
  color: "#2D7D52",
};

const rowStyle: CSSProperties = {
  display: "flex",
  gap: 10,
  alignItems: "flex-start",
  marginBottom: 8,
};
const rowLabel: CSSProperties = {
  fontWeight: 700,
  fontSize: "0.85rem",
  color: "#333",
};
const rowDesc: CSSProperties = {
  fontSize: "0.78rem",
  color: "#8ABD9E",
  lineHeight: 1.5,
  marginTop: 1,
};

const powerBox: CSSProperties = {
  background: "#FFF4EE",
  border: "1.5px solid #FFD0B0",
  borderRadius: 14,
  padding: "14px 16px",
};
const powerRow: CSSProperties = {
  display: "flex",
  gap: 6,
  alignItems: "center",
  fontSize: "0.83rem",
  color: "#555",
  marginBottom: 4,
};

const specialCard: CSSProperties = {
  background: "#F0FAF5",
  border: "1.5px solid #D0EEE0",
  borderRadius: 14,
  padding: "12px 14px",
  marginBottom: 8,
};
const tagStyle: CSSProperties = {
  fontSize: "0.7rem",
  fontWeight: 700,
  color: "#3DAE79",
  background: "#E0F5EB",
  border: "1px solid #B0DEAD",
  borderRadius: 50,
  padding: "2px 8px",
};

const obstacleGrid: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: 8,
};
const obstacleItem: CSSProperties = {
  background: "#FFF4EE",
  border: "1px solid #FFD0B0",
  borderRadius: 12,
  padding: "10px 6px",
  textAlign: "center",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
};
const obstacleLabel: CSSProperties = {
  fontSize: "0.72rem",
  fontWeight: 700,
  color: "#C05A2A",
  marginTop: 4,
};
const obsSubLabel: CSSProperties = {
  fontSize: "0.65rem",
  color: "#C09A80",
  marginTop: 1,
};

const themeRow: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  paddingBottom: 7,
  marginBottom: 7,
  borderBottom: "1px solid #F0FAF5",
};
const themeLabel: CSSProperties = {
  fontSize: "0.85rem",
  fontWeight: 600,
  color: "#333",
};
const themeDistance: CSSProperties = { fontSize: "0.78rem", color: "#A0B4AC" };

const closeBtnStyle: CSSProperties = {
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
