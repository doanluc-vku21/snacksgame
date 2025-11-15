import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { MISSIONS_DATA, MISSION_TYPES } from '../../missionsData';
import './Missions.css'; // File CSS chúng ta sẽ tạo tiếp theo

// Tái sử dụng CSS từ Customizer cho phần header
import '../SnakeCustomizer/SnakeCustomizer.css';

const Missions = ({ onBackToMenu, playClickSound }) => {
  const { currentUser, claimMissionReward } = useAuth();
  const [message, setMessage] = useState('');
  const [loadingMissionId, setLoadingMissionId] = useState(null);

  // Lấy dữ liệu nhiệm vụ của người chơi
  const progress = currentUser?.missionProgress || {};
  const claimed = currentUser?.completedMissions || {};

  // Lọc nhiệm vụ
  const dailyMissions = MISSIONS_DATA.filter(m => m.type === MISSION_TYPES.DAILY);
  const weeklyMissions = MISSIONS_DATA.filter(m => m.type === MISSION_TYPES.WEEKLY);

  // Hàm xử lý khi nhấn "Nhận thưởng"
  const handleClaim = async (mission) => {
    playClickSound();
    setLoadingMissionId(mission.id);
    setMessage('Đang nhận thưởng...');

    try {
      const result = await claimMissionReward(mission.id);
      setMessage(result); // "Nhận thưởng ... coin thành công!"
    } catch (error) {
      setMessage(error.toString()); // "Bạn đã nhận thưởng..."
    } finally {
      setLoadingMissionId(null);
    }
  };

  // Hàm để render một danh sách nhiệm vụ
  const renderMissionList = (missions) => {
    return missions.map(mission => {
      const currentProgress = progress[mission.id] || 0;
      const isCompleted = currentProgress >= mission.target;
      const isClaimed = claimed[mission.id] || false;
      const isLoading = loadingMissionId === mission.id;

      // Tính toán % tiến độ
      const progressPercent = Math.min((currentProgress / mission.target) * 100, 100);

      return (
        <div key={mission.id} className={`mission-card ${isClaimed ? 'claimed' : ''}`}>
          
          <div className="mission-info">
            <span className="mission-title">{mission.title}</span>
            <span className="mission-reward">+{mission.reward} 💰</span>
          </div>
          
          <div className="mission-progress">
            <div className="mission-progress-bar">
              <div 
                className="mission-progress-fill" 
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
            <span className="mission-progress-text">
              {currentProgress} / {mission.target}
            </span>
          </div>

          <button
            className={`mission-claim-btn ${isClaimed ? 'btn-claimed' : (isCompleted ? 'btn-claimable' : 'btn-disabled')}`}
            onClick={() => handleClaim(mission)}
            disabled={!isCompleted || isClaimed || isLoading}
          >
            {isLoading ? '...' : (isClaimed ? 'Đã nhận' : (isCompleted ? 'Nhận thưởng' : 'Chưa hoàn thành'))}
          </button>

        </div>
      );
    });
  };

  return (
    // Chúng ta tái sử dụng .customizer-container cho đồng bộ
    <div className="customizer-container missions-container">
      <div className="customizer-header">
        <h2>📅 Nhiệm vụ 📅</h2>
        <button onClick={onBackToMenu} className="back-btn">
          Quay lại Menu
        </button>
      </div>

      {message && <p className="shop-message">{message}</p>}

      <div className="customizer-content">
        <div className="missions-section">
          <h3 className="customizer-section-title">Hằng Ngày</h3>
          <div className="missions-grid">
            {renderMissionList(dailyMissions)}
          </div>
        </div>

        <div className="missions-section">
          <h3 className="customizer-section-title">Hằng Tuần</h3>
          <div className="missions-grid">
            {renderMissionList(weeklyMissions)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Missions;