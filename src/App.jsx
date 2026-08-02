import { useState } from "react";
import StoreMap from "./components/StoreMap";
import RegionDashboard from "./components/RegionDashboard";
import TodayFortune from "./components/TodayFortune";
import ExclusiveSpots from "./components/ExclusiveSpots";

const GAME_TYPES = [
  { key: "sp500", label: "스피또 500" },
  { key: "sp1000", label: "스피또 1000" },
  { key: "sp2000", label: "스피또 2000" },
];

const TABS = [
  { key: "home", label: "홈" },
  { key: "exclusive", label: "🕵️ 탐정속보" },
  { key: "map", label: "복권명당" },
  { key: "region", label: "탐정정보" },
];

export default function App() {
  const [tab, setTab] = useState("home");
  const [gameType, setGameType] = useState("sp1000");

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "0 16px 40px", fontFamily: "sans-serif" }}>
      <div style={{ padding: "20px 0 12px", borderBottom: "0.5px solid #e0e0e0", marginBottom: 16 }}>
        <h1 style={{ fontSize: 20, fontWeight: 500, marginBottom: 4 }}>🕵️ 복탐정</h1>
        <p style={{ fontSize: 13, color: "#888" }}>즉석에서 터지는 복, 탐정이 먼저 찾아냅니다</p>
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            padding: "7px 18px", borderRadius: 999, fontSize: 13, cursor: "pointer",
            border: "0.5px solid", borderColor: tab === t.key ? "transparent" : "#ccc",
            background: tab === t.key ? "#185FA5" : "transparent",
            color: tab === t.key ? "#fff" : "#555",
          }}>{t.label}</button>
        ))}
      </div>

      {tab === "home" && <TodayFortune />}
      {tab === "exclusive" && <ExclusiveSpots />}

      {(tab === "map" || tab === "region") && (
        <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
          {GAME_TYPES.map((g) => (
            <button key={g.key} onClick={() => setGameType(g.key)} style={{
              padding: "6px 14px", borderRadius: 999, fontSize: 13, cursor: "pointer",
              border: "0.5px solid", borderColor: gameType === g.key ? "transparent" : "#ccc",
              background: gameType === g.key ? "#1a1a1a" : "transparent",
              color: gameType === g.key ? "#fff" : "#555",
            }}>{g.label}</button>
          ))}
        </div>
      )}

      {tab === "map" && <StoreMap gameType={gameType} />}
      {tab === "region" && <RegionDashboard gameType={gameType} />}

      <p style={{ fontSize: 11, color: "#bbb", marginTop: 24, textAlign: "center", lineHeight: 1.7 }}>
        본 서비스는 동행복권 공개 데이터를 기반으로 하며 당첨을 보장하지 않습니다.<br />
        복권은 건전하게 즐기세요.
      </p>
    </div>
  );
}