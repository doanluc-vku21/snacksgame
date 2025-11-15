import React from "react";
// Chúng ta sẽ dùng chung CSS với GameOverOverlay
import "../GameOverOverlay/GameOverOverlay.css";

const PauseMenu = ({ onResume, onRestart, onGoToMenu }) => {
  return (
    <div className="overlay">
      <h2>Game đang tạm dừng</h2>
      
      <div className="overlay-buttons">
        <button onClick={onResume} className="resume-btn">
          Tiếp tục
        </button>
        <button onClick={onRestart}>
          Chơi lại
        </button>
        <button onClick={onGoToMenu} className="menu-btn">
          Về Menu
        </button>
      </div>
    </div>
  );
};

export default PauseMenu;