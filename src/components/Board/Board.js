import React from "react";
import "./Board.css";
import { FOOD_SKINS } from "../../foodSkins"; // Import dữ liệu skin mồi

const Board = ({
  boardSize,
  gridSize,
  snake,
  food,
  obstacles = [],
  powerUp = null,
  isInvincible = false,
  currentSkin = 'default',
  currentFoodSkin = 'default', // Thêm prop này
  // --- CẬP NHẬT PROPS ---
  aiSnakes = [], // Giờ là một mảng rắn
  aiFoods = []  // Giờ là một mảng mồi
}) => {
  // Tìm skin mồi hiện tại dựa trên ID
  const foodSkin = FOOD_SKINS.find(f => f.id === currentFoodSkin) || FOOD_SKINS[0];

  // ==================================================================
  // *** SỬA LỖI NẰM Ở ĐÂY ***
  // Chúng ta sẽ sửa hàm renderSnake
  // ==================================================================
  const renderSnake = (snakeToRender, skinId, isPlayer) => {
    return snakeToRender.map((segment, index) => {
      const isHead = index === 0;
      const segmentStyle = {
        position: 'absolute',
        left: segment.x * gridSize,
        top: segment.y * gridSize,
        width: gridSize,
        height: gridSize,
      };

      // --- LOGIC GÁN CLASS MỚI ---
      let segmentClass = `cell snake-segment`;

      if (isPlayer) {
        // Đây là Rắn của người chơi
        segmentClass += ` skin-${skinId}`; // Thêm skin (ví dụ: 'skin-lava')
        
        // Thêm class .snake-head-player hoặc .snake-body-player
        segmentClass += isHead ? ' snake-head-player' : ' snake-body-player';
        
        // Thêm class bất tử (nếu có)
        if (isInvincible) segmentClass += ' invincible';
        
      } else {
        // Đây là Rắn AI
        // CSS của bạn chỉ dùng .snake-head-ai và .snake-body-ai
        segmentClass += isHead ? ' snake-head-ai' : ' snake-body-ai';
      }
      // --- KẾT THÚC SỬA LỖI ---

      return <div key={index} className={segmentClass} style={segmentStyle}></div>;
    });
  };

  return (
    <div
      className="board"
      style={{
        width: boardSize * gridSize,
        height: boardSize * gridSize,
        gridTemplateColumns: `repeat(${boardSize}, 1fr)`,
      }}
    >
      {/* Render rắn của người chơi */}
      {renderSnake(snake, currentSkin, true)}

      {/* Render các con rắn AI */}
      {/* CSS của bạn dùng 1 màu AI duy nhất, nên chúng ta không cần truyền skinId "ai-1" 
          Chúng ta chỉ cần gọi renderSnake và để isPlayer=false 
      */}
      {aiSnakes.map((ai, index) => ai.snake.length > 0 && renderSnake(ai.snake, "ai", false))}

      {/* Render mồi của người chơi */}
      {food && food.y !== -1 && (
        <div
          className="food"
          style={{
            left: food.x * gridSize,
            top: food.y * gridSize,
            width: gridSize,
            height: gridSize,
          }}
        >
          {foodSkin.emoji}
        </div>
      )}

      {/* Render mồi của AI */}
      {aiFoods.map((aiFood, index) =>
        aiFood && aiFood.y !== -1 && (
          <div
            key={`ai-food-${index}`}
            className="food ai-food"
            style={{
              left: aiFood.x * gridSize,
              top: aiFood.y * gridSize,
              width: gridSize,
              height: gridSize,
            }}
          >
            {foodSkin.emoji}
          </div>
        )
      )}

      {/* Render chướng ngại vật */}
      {obstacles.map((obs, index) => (
        <div
          key={index}
          className="cell obstacle"
          style={{
            position: 'absolute',
            left: obs.x * gridSize,
            top: obs.y * gridSize,
            width: gridSize,
            height: gridSize,
          }}
        ></div>
      ))}

      {/* Render vật phẩm */}
      {powerUp && powerUp.type && (
        <div
          className={`power-up power-up-${powerUp.type.toLowerCase()}`}
          style={{
            left: powerUp.x * gridSize,
            top: powerUp.y * gridSize,
            width: gridSize,
            height: gridSize,
          }}
        >
          {/* SỬA LỖI: Thêm emoji vào bên trong div của power-up */}
          {(() => {
            switch (powerUp.type) {
              case 'SCORE_BOOST': return '💰';
              case 'SLOW_MO': return '🐢';
              case 'INVINCIBLE': return '🛡️';
              default: return '';
            }
          })()}
        </div>
      )}
    </div>
  );
};

export default Board;