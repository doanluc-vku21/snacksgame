import React from "react";
import { useAuth } from "../../context/AuthContext";
// Import danh sách nhạc VÀ SFX
import { BGM_TRACKS, SFX_PACKS } from "../../audioManager"; 
import "../SnakeCustomizer/SnakeCustomizer.css";
import "./SettingsMenu.css";

const SettingsMenu = ({ onBackToMenu }) => {
  const { currentUser, updateUserSettings } = useAuth();
  
  const settings = currentUser.settings;

  // Hàm xử lý khi thay đổi 1 cài đặt chung
  const handleSettingChange = (key, value) => {
    const newSettings = {
      ...settings,
      [key]: value
    };
    updateUserSettings(newSettings);
  };
  
  // Hàm xử lý riêng cho thay đổi Nhạc nền
  const handleMusicTrackChange = (e) => {
    const newTrackId = e.target.value;
    
    if (newTrackId === 'none') {
      // Nếu chọn "Tắt", cập nhật cả 'music' và 'musicTrack'
      updateUserSettings({
        ...settings,
        music: false,
        musicTrack: 'none'
      });
    } else {
      // Nếu chọn 1 bản nhạc, BẬT nhạc và chọn track đó
      updateUserSettings({
        ...settings,
        music: true,
        musicTrack: newTrackId
      });
    }
  };

  // Tính giá trị hiện tại của dropdown
  const currentMusicValue = settings.music ? settings.musicTrack : 'none';
  
  return (
    <div className="customizer-container settings-container">
      <div className="customizer-header">
        <h2>⚙️ Cài đặt ⚙️</h2>
        <button onClick={onBackToMenu} className="back-btn">
          Quay lại Menu
        </button>
      </div>
      
      <div className="settings-content">
        
        {/* --- Cài đặt Âm thanh --- */}
        <div className="setting-group">
          <h3>Âm thanh</h3>
          
          <div className="setting-item">
            <label>Nhạc nền (BGM)</label>
            <select 
              className="setting-select"
              value={currentMusicValue}
              onChange={handleMusicTrackChange}
            >
              {BGM_TRACKS.map(track => (
                <option key={track.id} value={track.id}>
                  {track.name}
                </option>
              ))}
            </select>
          </div>
          
          {/* CẬP NHẬT: Dropdown chọn SFX */}
          <div className="setting-item">
            <label>Hiệu ứng (SFX)</label>
            <select 
              className="setting-select"
              value={settings.sfxPack || 'pack1'}
              onChange={(e) => handleSettingChange('sfxPack', e.target.value)}
            >
              {SFX_PACKS.map(pack => (
                <option key={pack.id} value={pack.id}>
                  {pack.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* --- Cài đặt Điều khiển --- */}
        <div className="setting-group">
          <h3>Điều khiển</h3>
          <div className="setting-item">
            <label>Phím di chuyển</label>
            <div className="control-toggle">
              <button 
                className={`control-btn ${settings.controls === 'ARROWS' ? 'active' : ''}`}
                onClick={() => handleSettingChange('controls', 'ARROWS')}
              >
                ↑ ↓ ← →
              </button>
              <button 
                className={`control-btn ${settings.controls === 'WASD' ? 'active' : ''}`}
                onClick={() => handleSettingChange('controls', 'WASD')}
              >
                W A S D
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SettingsMenu;