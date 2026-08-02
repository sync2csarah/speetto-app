import { useEffect, useState } from "react";

const API_BASE = "http://localhost:8000";
const ALL_REGIONS = ["서울","경기","인천","강원","충북","충남","대전","세종","전북","전남","광주","경북","대구","경남","부산","울산","제주"];

export default function RegionDashboard({ gameType = "sp1000" }) {
  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);
  const [selectedRound, setSelectedRound] = useState(null);
  const [regionData, setRegionData] = useState([]);
  const [avgData, setAvgData] = useState({});

  useEffect(() => { fetchHistory(); fetchStats(); }, [gameType]);
  useEffect(() => { if (selectedRound) { fetchRegionData(selectedRound); fetchAvgData(selectedRound); } }, [selectedRound, gameType]);

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/stats?game_type=${gameType}`);
      const data = await res.json();
      setStats(data); setSelectedRound(data.round_no);
    } catch (e) { console.error(e); }
  };

  const fetchHistory = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/stats/history?game_type=${gameType}&limit=8`);
      setHistory(await res.json());
    } catch (e) { console.error(e); }
  };

  const fetchRegionData = async (roundNo) => {
    try {
      const res = await fetch(`${API_BASE}/api/wins/by-region?game_type=${gameType}&round_no=${roundNo}`);
      const data = await res.json();
      setRegionData(data.data || []);
    } catch (e) { console.error(e); }
  };

  const fetchAvgData = async (roundNo) => {
    try {
      const res = await fetch(`${API_BASE}/api/wins/region-avg?game_type=${gameType}&exclude_round=${roundNo}`);
      const data = await res.json();
      const map = {};
      data.forEach((r) => { map[r.region] = r.avg_wins; });
      setAvgData(map);
    } catch (e) { console.error(e); }
  };

  const remain = stats ? stats.remain_1st : 0;
  const wonPct = stats && stats.total_1st ? Math.round(((stats.total_1st - stats.remain_1st) / stats.total_1st) * 100) : 0;

  return (
    <div style={{ fontFamily: "sans-serif", padding: "1rem 0" }}>
      {stats && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))", gap: 10, marginBottom: 20 }}>
          {[
            { label: "전국 출고율", value: `${stats.release_rate || "-"}%` },
            { label: "1등 총 발행", value: `${stats.total_1st || "-"}장` },
            { label: "1등 지급완료", value: `${(stats.total_1st - stats.remain_1st) || "-"}장 (${wonPct}%)` },
            { label: "1등 잔여", value: `${stats.remain_1st || "-"}장`, color: "#D85A30" },
          ].map((m) => (
            <div key={m.label} style={{ background: "#f5f5f3", borderRadius: 8, padding: "12px 14px" }}>
              <div style={{ fontSize: 11, color: "#888", marginBottom: 4 }}>{m.label}</div>
              <div style={{ fontSize: 20, fontWeight: 500, color: m.color || "#1a1a1a" }}>{m.value}</div>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <span style={{ fontSize: 13, color: "#888" }}>회차 선택</span>
        <select value={selectedRound || ""} onChange={(e) => setSelectedRound(Number(e.target.value))}
          style={{ padding: "6px 10px", fontSize: 13, borderRadius: 8 }}>
          {history.map((h) => (<option key={h.round_no} value={h.round_no}>제{h.round_no}회</option>))}
        </select>
        {remain > 0 && <span style={{ fontSize: 12, background: "#EAF3DE", color: "#3B6D11", padding: "3px 10px", borderRadius: 999 }}>구매 추천</span>}
      </div>

      <div style={{ background: "#fff", border: "0.5px solid #e0e0e0", borderRadius: 12, padding: "1rem", marginBottom: 16 }}>
        <p style={{ fontSize: 14, fontWeight: 500, marginBottom: 12 }}>시도별 당첨 현황 vs 평균</p>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: "0.5px solid #e0e0e0" }}>
              {["지역", "이번 회차", "이전 평균", "차이", ""].map((h) => (
                <th key={h} style={{ textAlign: h === "지역" ? "left" : "center", padding: "5px 6px", fontSize: 12, color: "#888", fontWeight: 400 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {regionData.sort((a, b) => b.win_count - a.win_count).map((row) => {
              const avg = avgData[row.region] || 0;
              const diff = row.win_count - avg;
              const isZero = row.win_count === 0 && remain > 0;
              const belowAvg = diff < 0 && remain > 0;
              return (
                <tr key={row.region} style={{ borderBottom: "0.5px solid #f0f0f0", background: isZero || belowAvg ? "#fafaf8" : "transparent" }}>
                  <td style={{ padding: "7px 6px", color: "#444" }}>{row.region}</td>
                  <td style={{ padding: "7px 6px", textAlign: "center", fontWeight: 500 }}>{row.win_count}</td>
                  <td style={{ padding: "7px 6px", textAlign: "center", color: "#888" }}>{avg.toFixed(1)}</td>
                  <td style={{ padding: "7px 6px", textAlign: "center", fontWeight: 500, color: diff > 0 ? "#3B6D11" : diff < 0 ? "#A32D2D" : "#888" }}>
                    {diff > 0 ? `+${diff.toFixed(1)}` : diff < 0 ? diff.toFixed(1) : "±0"}
                  </td>
                  <td style={{ padding: "7px 6px", textAlign: "right" }}>
                    {isZero && <span style={{ padding: "2px 8px", borderRadius: 999, fontSize: 11, fontWeight: 500, background: "#FAEEDA", color: "#854F0B" }}>미배출</span>}
                    {!isZero && belowAvg && <span style={{ padding: "2px 8px", borderRadius: 999, fontSize: 11, fontWeight: 500, background: "#EAF3DE", color: "#3B6D11" }}>유리</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <p style={{ fontSize: 11, color: "#aaa", marginTop: 10 }}>평균: 선택 회차 제외 전체 회차 기준</p>
      </div>

      <div style={{ background: "#fff", border: "0.5px solid #e0e0e0", borderRadius: 12, padding: "1rem" }}>
        <p style={{ fontSize: 14, fontWeight: 500, marginBottom: 12 }}>회차별 출고율 & 1등 잔여</p>
        {history.map((h) => (
          <div key={h.round_no} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, fontSize: 13 }}>
            <span style={{ width: 56, color: "#888", flexShrink: 0 }}>제{h.round_no}회</span>
            <div style={{ flex: 1, height: 8, background: "#f0f0f0", borderRadius: 999, overflow: "hidden" }}>
              <div style={{ width: `${h.release_rate || 0}%`, height: "100%", background: "#378ADD", borderRadius: 999 }} />
            </div>
            <span style={{ width: 38, color: "#444", flexShrink: 0 }}>{h.release_rate}%</span>
            <span style={{ flexShrink: 0, padding: "2px 8px", borderRadius: 999, fontSize: 11, fontWeight: 500,
              background: h.remain_1st > 0 ? "#EAF3DE" : "#f0f0f0", color: h.remain_1st > 0 ? "#3B6D11" : "#aaa" }}>
              잔여 {h.remain_1st}장
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
