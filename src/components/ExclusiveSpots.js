import { useEffect, useState } from "react";

 const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8000";

function getBadge(index) {
  if (index >= 2.0) return { emoji: "🔥🔥", label: "초특급 명당", color: "#C0392B", bg: "#FDECEA" };
  if (index >= 1.5) return { emoji: "🔥", label: "강력 추천", color: "#D35400", bg: "#FDF2E9" };
  return { emoji: "✨", label: "주목", color: "#8E6B00", bg: "#FFF7E0" };
}

export default function ExclusiveSpots() {
  const [spots, setSpots] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/api/pblcn/exclusive`)
      .then((res) => res.json())
      .then((data) => setSpots(data))
      .catch(() => setSpots([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div style={{
        background: "linear-gradient(135deg, #1a1a2e, #16213e)",
        borderRadius: 16, padding: "20px 22px", marginBottom: 20, color: "#fff",
      }}>
        <div style={{ fontSize: 13, color: "#FFD166", fontWeight: 700, marginBottom: 6, letterSpacing: 0.5 }}>
          🕵️ 탐정속보
        </div>
        <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>
          복탐정이 찾아낸 오늘의 회차
        </div>
        <div style={{ fontSize: 13, color: "#c8c8d0", lineHeight: 1.6 }}>
          회차별 데이터를 낱낱이 뒤져서, 아직 1등이 상대적으로 많이 남아있는 회차를 찾아냈어요.
        </div>
      </div>

      {loading && <div style={{ textAlign: "center", color: "#999", padding: 20 }}>불러오는 중...</div>}

      {!loading && spots.length === 0 && (
        <div style={{ textAlign: "center", color: "#999", padding: 20 }}>
          지금은 조건에 맞는 회차가 없어요.
        </div>
      )}

      {!loading && spots.map((s, idx) => {
        const badge = getBadge(s.concentration_index);
        return (
          <div key={`${s.gds_type_cd}-${s.epsd}`} style={{
            background: "#fff", border: "0.5px solid #eee", borderRadius: 14,
            padding: "14px 16px", marginBottom: 10, display: "flex", alignItems: "center", gap: 12,
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: "50%",
              background: idx === 0 ? "#FFD166" : "#f0f0f0",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 13, fontWeight: 700, color: idx === 0 ? "#7a5a00" : "#888", flexShrink: 0,
            }}>
              {idx + 1}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>
                {s.gds_type_nm} {s.epsd}회차
              </div>
              <div style={{ fontSize: 12, color: "#888" }}>
                입고율 {s.spmt_rt}% · 1등 {s.rnk1_remain}/{s.rnk1_total}장 남음
              </div>
            </div>
            <div style={{
              fontSize: 12, fontWeight: 700, color: badge.color,
              background: badge.bg, padding: "5px 10px", borderRadius: 999,
              whiteSpace: "nowrap",
            }}>
              {badge.emoji} {badge.label}
            </div>
          </div>
        );
      })}

      <p style={{ fontSize: 11, color: "#bbb", marginTop: 16, textAlign: "center", lineHeight: 1.7 }}>
        위 정보는 발행 데이터를 기반으로 한 통계적 추정치이며, 당첨을 보장하지 않습니다.
      </p>
    </div>
  );
}
