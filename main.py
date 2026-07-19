from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
import sqlite3
from typing import Optional

app = FastAPI(title="스피또 명당 API")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

DB_PATH = "../crawler/speetto.db"

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

@app.get("/api/stats")
def get_stats(game_type: str = "sp1000"):
    conn = get_db()
    row = conn.execute("SELECT * FROM round_stats WHERE game_type=? ORDER BY round_no DESC LIMIT 1", (game_type,)).fetchone()
    conn.close()
    return dict(row) if row else {"error": "데이터 없음"}

@app.get("/api/stats/history")
def get_stats_history(game_type: str = "sp1000", limit: int = 10):
    conn = get_db()
    rows = conn.execute("SELECT * FROM round_stats WHERE game_type=? ORDER BY round_no DESC LIMIT ?", (game_type, limit)).fetchall()
    conn.close()
    return [dict(r) for r in rows]

@app.get("/api/wins/by-region")
def get_wins_by_region(game_type: str = "sp1000", round_no: Optional[int] = None):
    conn = get_db()
    if round_no is None:
        row = conn.execute("SELECT MAX(round_no) as r FROM wins WHERE game_type=?", (game_type,)).fetchone()
        round_no = row["r"] if row else 0
    rows = conn.execute("""
        SELECT s.region, COUNT(*) as win_count FROM wins w
        JOIN stores s ON w.store_id=s.id
        WHERE w.game_type=? AND w.round_no=? AND w.win_rank=1
        GROUP BY s.region ORDER BY win_count DESC
    """, (game_type, round_no)).fetchall()
    all_regions = ["서울","경기","인천","강원","충북","충남","대전","세종","전북","전남","광주","경북","대구","경남","부산","울산","제주"]
    region_map = {r["region"]: r["win_count"] for r in rows}
    conn.close()
    return {"round_no": round_no, "game_type": game_type,
            "data": [{"region": r, "win_count": region_map.get(r, 0)} for r in all_regions]}

@app.get("/api/wins/region-avg")
def get_region_avg(game_type: str = "sp1000", exclude_round: Optional[int] = None):
    conn = get_db()
    where = "w.game_type=? AND w.win_rank=1"
    params = [game_type]
    if exclude_round:
        where += " AND w.round_no!=?"; params.append(exclude_round)
    rows = conn.execute(f"""
        SELECT s.region, COUNT(*) as total_wins,
               COUNT(DISTINCT w.round_no) as round_count,
               ROUND(CAST(COUNT(*) AS REAL)/COUNT(DISTINCT w.round_no),2) as avg_wins
        FROM wins w JOIN stores s ON w.store_id=s.id
        WHERE {where} GROUP BY s.region
    """, params).fetchall()
    conn.close()
    return [dict(r) for r in rows]

@app.get("/api/stores/map")
def get_stores_map(game_type: str = "sp1000", min_wins: int = 1,
                   lat: Optional[float] = None, lng: Optional[float] = None, radius_km: float = 5.0):
    conn = get_db()
    if lat and lng:
        lat_range = radius_km / 111.0; lng_range = radius_km / 91.0
        rows = conn.execute("""
            SELECT s.id, s.name, s.address, s.region, s.lat, s.lng,
                   COUNT(w.id) as win_count, MAX(w.round_no) as last_win_round
            FROM stores s JOIN wins w ON s.id=w.store_id
            WHERE w.game_type=? AND w.win_rank=1
              AND s.lat BETWEEN ? AND ? AND s.lng BETWEEN ? AND ?
            GROUP BY s.id HAVING win_count>=? ORDER BY win_count DESC
        """, (game_type, lat-lat_range, lat+lat_range, lng-lng_range, lng+lng_range, min_wins)).fetchall()
    else:
        rows = conn.execute("""
            SELECT s.id, s.name, s.address, s.region, s.lat, s.lng,
                   COUNT(w.id) as win_count, MAX(w.round_no) as last_win_round
            FROM stores s JOIN wins w ON s.id=w.store_id
            WHERE w.game_type=? AND w.win_rank=1
            GROUP BY s.id HAVING win_count>=? ORDER BY win_count DESC LIMIT 200
        """, (game_type, min_wins)).fetchall()
    conn.close()
    return [dict(r) for r in rows]

@app.get("/api/stores/top")
def get_top_stores(game_type: str = "sp1000", limit: int = 20):
    conn = get_db()
    rows = conn.execute("""
        SELECT s.name, s.address, s.region, s.lat, s.lng,
               COUNT(w.id) as win_count, MAX(w.round_no) as last_win_round
        FROM stores s JOIN wins w ON s.id=w.store_id
        WHERE w.game_type=? AND w.win_rank=1
        GROUP BY s.id ORDER BY win_count DESC LIMIT ?
    """, (game_type, limit)).fetchall()
    conn.close()
    return [dict(r) for r in rows]

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
