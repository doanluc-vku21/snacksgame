import React from "react";
import "./ScoreBoard.css";

// --- CẬP NHẬT PROPS: Thêm 'timer' ---
const ScoreBoard = ({
  score, 
  highScore,
  gameMode, 
  level, 
  levelScore, 
  foodToPassLevel,
  timer // <-- PROP MỚI
}) => {
  
  // Hiển thị Timer cho chế độ Versus
  if (gameMode === "VERSUS_AI") {
    // Chuyển giây (ví dụ 65) thành 01:05
    const formatTime = (sec) => {
      const minutes = Math.floor(sec / 60);
      const seconds = sec % 60;
      return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    };
    
    return (
      <div className="scores level-mode versus-mode">
        <span>Vòng: {level}</span>
        <span>Kỷ lục: {highScore > 0 ? `Vòng ${highScore}` : 'Chưa có'}</span>
        <span>Đối thủ: {foodToPassLevel}</span>
        <span>Thời gian: {formatTime(timer)}</span>
      </div>
    );
  }

  // Giao diện cho chế độ QUA MÀN và CHƯỚNG NGẠI VẬT
  if (gameMode === "LEVELS" || gameMode === "OBSTACLES") {
    const isObstacle = gameMode === "OBSTACLES";
    return (
      <div className={`scores level-mode ${isObstacle ? "obstacle-mode" : ""}`}>
        <span>Kỷ lục: Màn {highScore}</span>
        <span>Màn: {level}</span>
        <span>
          Mục tiêu: {levelScore} / {foodToPassLevel}
        </span>
        <span>Tổng điểm: {score}</span>
      </div>
    );
  }

  // Giao diện cho chế độ MẶC ĐỊNH (CLASSIC)
  return (
    <div className="scores">
      <span>Điểm: {score}</span>
      <span>Điểm cao: {highScore}</span>
    </div>
  );
};

export default ScoreBoard;