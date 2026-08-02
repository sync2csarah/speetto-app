import { useEffect, useState } from "react";

const FORTUNES = [
  "오늘은 왠지 좋은 일이 생길 것 같은 날이에요 🍀",
  "지나가다 들른 가게에서 행운이 기다리고 있을지도 몰라요",
  "오늘 만나는 사람과의 인연을 소중히 하세요",
  "작은 용기가 큰 행운을 불러올 수 있어요",
  "오늘은 평소 안 가던 길로 가보는 것도 좋아요",
  "기다리던 소식이 곧 도착할 것 같은 예감이에요",
  "오늘의 행운 컬러는 골드! 지갑에 살짝 담아보세요",
  "느긋한 마음이 오늘의 운을 끌어올려줘요",
  "누군가에게 베푼 친절이 곧 나에게 돌아와요",
  "오늘은 평소보다 감이 좋은 날이에요, 촉을 믿어보세요",
];

function getTodayFortune() {
  const today = new Date();
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  return FORTUNES[seed % FORTUNES.length];
}

const API_BASE = "http://localhost:8000";

export default function TodayFortune() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/api/pblcn/alerts`)
      .then((res) => res.json())
      .then((data) => setAlerts(data))
      .catch(() => setAlerts([]))
      .finally(() => setLoading(false));
  }, []);

  const fortune = getTodayFortune();

  return (
    <div style={{
      background: "linear-gradient(135deg, #FFF7E8, #FFE8D6)",
      borderRadius: 16,
      padding: "18px 20px",
      marginBottom: 20,
      border: "0.5px solid #F3D9B8",
    }}>
      <div style={{ fontSize: 13, color: "#B8863B", fontWeight: 600, marginBottom: 6 }}>
        ✨ 오늘의 운세
      </div>
      <div style={{ fontSize: 15, color: "#3a2f1f", lineHeight: 1.5 }}>
        {fortune}
      </div>

      {!loading && alerts.length > 0 && (
        <div style={{ marginTop: 14, paddingTop: 14, borderTop: "0.5px dashed #E5C48F" }}>
          <div style={{ fontSize: 13, color: "#C0392B", fontWeight: 600, marginBottom: 8 }}>
            🔥 지금 놓치면 아까운 회차
          </div>
          {alerts.map((a) => (
            <div key={`${a.gds_type_cd}-${a.epsd}`} style={{
              fontSize: 13, color: "#5a3d1f", marginBottom: 6,
              background: "#fff", borderRadius: 10, padding: "8px 12px",
            }}>
              <strong>{a.gds_type_nm} {a.epsd}회차</strong> — 입고율 {a.spmt_rt}%, 1등 아직 {a.rnk1_remain}장 남았어요!
            </div>
          ))}
        </div>
      )}
    </div>
  );
}