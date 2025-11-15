import React from "react";
import "./GameOverOverlay.css";

const GameOverOverlay = ({ 
  score, 
  onRestart, 
  onGoToMenu, 
  gameWon = false, 
  gameState, 
  onNextLevel, 
  level,
  playClickSound,
  gameMode
}) => {
  
  // 1. Trạng thái QUA MÀN
  if (gameState === 'LEVEL_CLEARED') {
    // --- CẬP NHẬT: Logic thắng chế độ VERSUS ---
    if (gameMode === 'VERSUS_AI') {
      const isFinalLevel = level >= 3; // Màn 3 là màn cuối
      return (
        <div className="overlay">
          <h2>🎉 Bạn đã thắng! 🎉</h2>
          <h3>Bạn đã hạ gục {level === 1 ? 'Rắn AI!' : `${level} Rắn AI!`}</h3>
          
          {isFinalLevel ? (
            <>
              <h3>Bạn đã hoàn thành chế độ Đối kháng!</h3>
              <button onClick={() => {  onGoToMenu(); }} className="menu-btn versus-win-btn">
                Về Menu
              </button>
            </>
          ) : (
            <div className="overlay-buttons">
              <button onClick={() => { playClickSound(); onNextLevel(); }} className="next-level-btn">
                Màn tiếp (Màn {level + 1})
              </button>
              <button onClick={() => { playClickSound(); onGoToMenu(); }} className="menu-btn">
                Dừng lại
              </button>
            </div>
          )}
        </div>
      );
    }
    
    // (Logic qua màn Obstacles cũ)
    return (
      <div className="overlay">
        <h2>🎉 Chúc mừng! 🎉</h2>
        <h3>Bạn đã qua Màn {level}!</h3>
        <h3>Tổng điểm: {score}</h3>
        <div className="overlay-buttons">
          <button onClick={() => {  onNextLevel(); }} className="next-level-btn">
            Màn tiếp
          </button>
          <button onClick={() => {  onGoToMenu(); }} className="menu-btn">
            Dừng lại
          </button>
        </div>
      </div>
    );
  }

  // 2. Trạng thái THUA hoặc THẮNG TOÀN BỘ GAME
  return (
    <div className="overlay">
      {gameWon ? (
        <>
          <h2>🎉 Bạn đã thắng! 🎉</h2>
          <h3>Bạn đã hoàn thành 40 màn Obstacles!</h3>
          <h3>Tổng điểm: {score}</h3>
          <button onClick={() => { playClickSound(); onGoToMenu(); }} className="menu-btn win-btn">
            Về Menu
          </button>
        </>
      ) : (
        <>
          <h2>💀 Thua rồi!</h2>
          {/* Thông báo thua riêng cho Versus */}
          {gameMode === 'VERSUS_AI' && <h3>Bạn đã bị AI hạ gục!</h3>}
          <h3>Điểm của bạn: {score}</h3>
          <div className="overlay-buttons">
            <button onClick={() => { playClickSound(); onRestart(); }}>Chơi lại</button>
            <button onClick={() => { playClickSound(); onGoToMenu(); }} className="menu-btn">
              Về Menu
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default GameOverOverlay;