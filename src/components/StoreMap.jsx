import { useEffect, useRef, useState } from "react";

 const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8000";
const KAKAO_KEY = "42f5de9e8cadb02a1a500b7ecb9d0884";

export default function StoreMap({ gameType = "sp1000" }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const [stores, setStores] = useState([]);
  const [selected, setSelected] = useState(null);
  const [myLocation, setMyLocation] = useState(null);
  const [radiusKm, setRadiusKm] = useState(5);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_KEY}&autoload=false`;
    script.onload = () => {
      window.kakao.maps.load(() => {
        const map = new window.kakao.maps.Map(mapRef.current, {
          center: new window.kakao.maps.LatLng(36.5, 127.8),
          level: 13,
        });
        mapInstanceRef.current = map;
        fetchStores();
      });
    };
    document.head.appendChild(script);
    return () => document.head.removeChild(script);
  }, []);

  useEffect(() => {
    if (mapInstanceRef.current) fetchStores();
  }, [gameType]);

  const fetchStores = async (lat, lng, radius) => {
    setLoading(true);
    try {
      let url = `${API_BASE}/api/stores/map?game_type=${gameType}&min_wins=1`;
      if (lat && lng) url += `&lat=${lat}&lng=${lng}&radius_km=${radius || radiusKm}`;
      const res = await fetch(url);
      const data = await res.json();
      setStores(data);
      drawMarkers(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const drawMarkers = (storeList) => {
    const map = mapInstanceRef.current;
    if (!map) return;
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];
    const maxWins = Math.max(...storeList.map((s) => s.win_count), 1);

    storeList.forEach((store) => {
      if (!store.lat || !store.lng) return;
      const ratio = store.win_count / maxWins;
      const size = Math.max(20, Math.min(44, 20 + ratio * 24));
      const color = ratio > 0.6 ? "#D85A30" : ratio > 0.3 ? "#EF9F27" : "#378ADD";

      const content = document.createElement("div");
      content.style.cssText = `width:${size}px;height:${size}px;background:${color};border-radius:50%;border:2px solid #fff;display:flex;align-items:center;justify-content:center;color:#fff;font-size:${size > 30 ? 11 : 9}px;font-weight:600;cursor:pointer;box-shadow:0 2px 6px rgba(0,0,0,0.3);transform:translate(-50%,-50%);`;
      content.textContent = store.win_count;
      content.addEventListener("click", () => {
        setSelected(store);
        map.panTo(new window.kakao.maps.LatLng(store.lat, store.lng));
      });

      const overlay = new window.kakao.maps.CustomOverlay({
        position: new window.kakao.maps.LatLng(store.lat, store.lng),
        content,
        zIndex: Math.floor(ratio * 10),
      });
      overlay.setMap(map);
      markersRef.current.push(overlay);
    });
  };

  const searchNearMe = () => {
    if (!navigator.geolocation) return alert("위치 정보를 지원하지 않는 브라우저입니다.");
    navigator.geolocation.getCurrentPosition((pos) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      setMyLocation({ lat, lng });
      const map = mapInstanceRef.current;
      if (map) map.setCenter(new window.kakao.maps.LatLng(lat, lng));
      fetchStores(lat, lng, radiusKm);
    });
  };

  return (
    <div style={{ fontFamily: "sans-serif" }}>
      <div style={{ display: "flex", gap: 8, alignItems: "center", padding: "10px 0", flexWrap: "wrap", marginBottom: 8 }}>
        <button onClick={searchNearMe} style={{ padding: "7px 14px", background: "#185FA5", color: "#fff", border: "none", borderRadius: 999, fontSize: 13, cursor: "pointer" }}>
          내 위치 기준 검색
        </button>
        {myLocation && (
          <select value={radiusKm} onChange={(e) => { const r = Number(e.target.value); setRadiusKm(r); fetchStores(myLocation.lat, myLocation.lng, r); }}
            style={{ padding: "6px 10px", fontSize: 13, borderRadius: 8 }}>
            <option value={3}>반경 3km</option>
            <option value={5}>반경 5km</option>
            <option value={10}>반경 10km</option>
            <option value={20}>반경 20km</option>
          </select>
        )}
        <button onClick={() => fetchStores()} style={{ padding: "7px 14px", background: "#5F5E5A", color: "#fff", border: "none", borderRadius: 999, fontSize: 13, cursor: "pointer" }}>
          전국 보기
        </button>
        {loading && <span style={{ fontSize: 13, color: "#888" }}>불러오는 중...</span>}
        <span style={{ fontSize: 12, color: "#888", marginLeft: "auto" }}>총 {stores.length}개 명당</span>
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 8, fontSize: 12, color: "#666" }}>
        {[["#378ADD", "1~2회"], ["#EF9F27", "3~5회"], ["#D85A30", "6회 이상"]].map(([c, label]) => (
          <span key={label} style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ width: 12, height: 12, borderRadius: "50%", background: c, display: "inline-block" }} />{label}
          </span>
        ))}
      </div>

      <div ref={mapRef} style={{ width: "100%", height: 480, borderRadius: 12, overflow: "hidden", border: "0.5px solid #ddd" }} />

      {selected && (
        <div style={{ marginTop: 12, padding: "14px 16px", background: "#fff", border: "0.5px solid #ddd", borderRadius: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div>
              <p style={{ fontWeight: 500, fontSize: 15, marginBottom: 4 }}>{selected.name}</p>
              <p style={{ fontSize: 13, color: "#666", marginBottom: 8 }}>{selected.address}</p>
              <div style={{ display: "flex", gap: 8 }}>
                <span style={{ padding: "3px 10px", borderRadius: 999, fontSize: 12, fontWeight: 500, background: "#FAEEDA", color: "#854F0B" }}>1등 {selected.win_count}회 배출</span>
                <span style={{ padding: "3px 10px", borderRadius: 999, fontSize: 12, fontWeight: 500, background: "#E6F1FB", color: "#185FA5" }}>최근 {selected.last_win_round}회차</span>
              </div>
            </div>
            <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", color: "#888" }}>✕</button>
          </div>
          <a href={`https://map.kakao.com/link/search/${encodeURIComponent(selected.name + " " + selected.address)}`}
            target="_blank" rel="noreferrer"
            style={{ display: "inline-block", marginTop: 10, fontSize: 13, color: "#185FA5" }}>
            카카오맵에서 길찾기 →
          </a>
        </div>
      )}
    </div>
  );
}
