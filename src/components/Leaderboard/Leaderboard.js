import React, { useState, useEffect } from "react";
import { db, collection, query, orderBy, limit, getDocs } from "../../firebase";
import "./Leaderboard.css"; 

const Leaderboard = ({ playClickSound }) => {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // CẬP NHẬT: Thêm 'VERSUS_AI'
  const [leaderboardMode, setLeaderboardMode] = useState('CLASSIC');

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      
      let collectionName;
      let q; 

      if (leaderboardMode === 'CLASSIC') {
        collectionName = 'leaderboard_classic';
        const ref = collection(db, collectionName);
        q = query(ref, orderBy("score", "desc"), limit(10));
      } 
      else if (leaderboardMode === 'LEVELS') {
        collectionName = 'leaderboard_levels';
        const ref = collection(db, collectionName);
        q = query(
          ref, 
          orderBy("level", "desc"), 
          orderBy("score", "desc"), 
          limit(10)
        );
      } 
      else if (leaderboardMode === 'OBSTACLES') {
        collectionName = 'leaderboard_obstacles';
        const ref = collection(db, collectionName);
        q = query(
          ref, 
          orderBy("level", "desc"), 
          orderBy("score", "desc"), 
          limit(10)
        );
      }
      else { // --- LOGIC MỚI: VERSUS_AI ---
        collectionName = 'leaderboard_versus';
        const ref = collection(db, collectionName);
        // Sắp xếp theo Màn (cao) TRƯỚC, sau đó đến Thời gian (thấp)
        q = query(
          ref, 
          orderBy("level", "desc"), // Màn 3 > Màn 2 > Màn 1
          orderBy("time", "asc"),   // 30s > 40s
          limit(10)
        );
      }

      try {
        const querySnapshot = await getDocs(q);
        const scoresList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setScores(scoresList);
      } catch (error) {
        console.error(`Lỗi khi lấy BXH ${collectionName}: `, error);
        console.log("Hãy đảm bảo bạn đã tạo Chỉ mục (Index) Composite mới cho 'leaderboard_versus' (level DESC, time ASC)");
      }
      
      setLoading(false);
    };

    fetchLeaderboard();
  }, [leaderboardMode]); 

  // Hàm xử lý click tab
  const handleChangeMode = (mode) => {
    playClickSound(); // <-- Dùng ở đây
    setLeaderboardMode(mode);
  };

  return (
    <div className="leaderboard-container">
      {/* --- CẬP NHẬT: 4 TABS --- */}
      <div className="leaderboard-tabs tabs-4">
        <button 
          className={leaderboardMode === 'CLASSIC' ? 'active' : ''}
          onClick={() => handleChangeMode('CLASSIC')}
        >
          🏆 Mặc Định
        </button>
        <button 
          className={leaderboardMode === 'LEVELS' ? 'active' : ''}
          onClick={() => handleChangeMode('LEVELS')}
        >
          🚀 Qua Màn
        </button>
        <button 
          className={leaderboardMode === 'OBSTACLES' ? 'active obstacle-tab' : 'obstacle-tab'}
          onClick={() => handleChangeMode('OBSTACLES')}
        >
          🚧 Chướng Ngại Vật
        </button>
        {/* --- NÚT MỚI --- */}
        <button 
          className={leaderboardMode === 'VERSUS_AI' ? 'active versus-tab' : 'versus-tab'}
          onClick={() => handleChangeMode('VERSUS_AI')}
        >
          ⚔️ Đối Kháng
        </button>
      </div>

      {/* --- CẬP NHẬT: HIỂN THỊ --- */}
      {loading ? (
        <div className="loading-text">Đang tải Bảng Xếp Hạng...</div>
      ) : (
        <ol>
          {scores.length === 0 ? (
            <p className="loading-text">Chưa có ai chiến thắng.</p>
          ) : (
            scores.map((entry, index) => (
              <li key={entry.id}>
                <span className="rank">{index + 1}.</span>
                <span className="email">
                  {entry.username || 'Người chơi bí ẩn'}
                </span>
                
                {/* Hiển thị điểm/màn */}
                {leaderboardMode === 'CLASSIC' ? (
                  <span className="score">{entry.score} điểm</span>
                ) : (leaderboardMode === 'VERSUS_AI') ? (
                  // Hiển thị Màn VÀ Thời gian
                  <span className="score">
                    Màn {entry.level} ({entry.time} giây)
                  </span>
                ) : (
                  // (Qua Màn / Chướng ngại vật)
                  <span className="score">
                    Màn {entry.level} ({entry.score} điểm)
                  </span>
                )}
              </li>
            ))
          )}
        </ol>
      )}
    </div>
  );
};

export default Leaderboard;