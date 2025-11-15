// src/components/SnakeCustomizer/SnakeCustomizer.js
import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { SNAKE_SKINS } from "../../snakeSkins";
import { FOOD_SKINS } from "../../foodSkins";
import "./SnakeCustomizer.css";

const SnakeCustomizer = ({ onBackToMenu, playClickSound }) => {
  const { currentUser, updateUserSkin, updateUserFood, buyItem } = useAuth();

  const [message, setMessage] = useState("");
  const [loadingPurchase, setLoadingPurchase] = useState(null);

  const currentSkinId = currentUser?.settings?.selectedSkin || "default";
  const currentFoodId = currentUser?.settings?.selectedFood || "default";
  const currentCoins = currentUser?.coins || 0;

  const ownedSkins = currentUser?.settings?.ownedItems?.skins || [];
  const ownedFoods = currentUser?.settings?.ownedItems?.foods || [];

  const handleBuyItem = async (itemType, itemId, price) => {
    playClickSound();
    setMessage("Đang xử lý...");
    setLoadingPurchase(itemId);

    try {
      const resultMessage = await buyItem(itemType, itemId, price);
      setMessage(resultMessage);
    } catch (errorMessage) {
      setMessage(errorMessage);
    } finally {
      setLoadingPurchase(null);
    }
  };

  const handleSelectSkin = (skinId) => {
    if (skinId !== currentSkinId) {
      playClickSound();
      updateUserSkin(skinId);
    }
  };

  const handleSelectFood = (foodId) => {
    if (foodId !== currentFoodId) {
      playClickSound();
      updateUserFood(foodId);
    }
  };

  return (
    <div className="customizer-container">
      <div className="customizer-header">
        <h2>🎨 Cửa hàng & Tùy chỉnh 🎨</h2>
        <button onClick={onBackToMenu} className="back-btn">
          Quay lại Menu
        </button>
      </div>

      <div className="customizer-content">
        {currentUser && (
          <div className="coin-balance">
            <h3>Tiền của bạn: {currentCoins} 💰</h3>
          </div>
        )}

        {message && <p className="shop-message">{message}</p>}

        {/* --- PHẦN TÙY CHỈNH RẮN --- */}
        <h3 className="customizer-section-title">Màu sắc Rắn</h3>
        <div className="skin-grid">
          {SNAKE_SKINS.map((skin) => {
            const isSelected = skin.id === currentSkinId;
            const isOwned = skin.isFree || ownedSkins.includes(skin.id);
            const isLoading = loadingPurchase === skin.id;
            const canAfford = currentCoins >= skin.price;

            return (
              <div
                key={skin.id}
                className={`skin-card ${isSelected ? "selected" : ""} ${
                  !isOwned && !canAfford ? "locked" : ""
                }`}
                onClick={() => (isOwned ? handleSelectSkin(skin.id) : null)}
              >
                <div className="skin-preview-wrapper">
                  {/* *** SỬA LỖI TẠI ĐÂY ***
                    Chúng ta sẽ áp dụng skin.style cho TẤT CẢ các skin
                    thay vì chỉ 'rainbow'
                  */}
                  <div
                    className={`skin-preview-segment skin-preview-head skin-${skin.id}`}
                    style={skin.style || {}}
                  ></div>
                  <div
                    className={`skin-preview-segment skin-preview-body skin-${skin.id}`}
                    style={skin.style || {}}
                  ></div>
                  <div
                    className={`skin-preview-segment skin-preview-body skin-${skin.id}`}
                    style={skin.style || {}}
                  ></div>
                </div>

                <div className="skin-name">{skin.name}</div>

                <div className="skin-action">
                  {isOwned ? (
                    isSelected ? (
                      <span className="action-label selected-label">
                        ✅ Đang dùng
                      </span>
                    ) : (
                      <button
                        className="action-btn select-btn"
                        onClick={() => handleSelectSkin(skin.id)}
                      >
                        Chọn
                      </button>
                    )
                  ) : (
                    <button
                      className={`action-btn buy-btn ${
                        !canAfford ? "cannot-afford" : ""
                      }`}
                      disabled={isLoading || !canAfford}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBuyItem("skins", skin.id, skin.price);
                      }}
                    >
                      {isLoading ? "..." : `Mua - ${skin.price} 💰`}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* --- PHẦN TÙY CHỈNH MỒI --- */}
        <h3 className="customizer-section-title">Loại Mồi</h3>
        <div className="skin-grid">
          {FOOD_SKINS.map((food) => {
            const isSelected = food.id === currentFoodId;
            const isOwned = food.isFree || ownedFoods.includes(food.id);
            const isLoading = loadingPurchase === food.id;
            const canAfford = currentCoins >= food.price;

            return (
              <div
                key={food.id}
                className={`skin-card ${isSelected ? "selected" : ""} ${
                  !isOwned && !canAfford ? "locked" : ""
                }`}
                onClick={() => (isOwned ? handleSelectFood(food.id) : null)}
              >
                <div className="food-preview-wrapper">
                  <span className="food-emoji">{food.emoji}</span>
                </div>

                <div className="skin-name">{food.name}</div>

                <div className="skin-action">
                  {isOwned ? (
                    isSelected ? (
                      <span className="action-label selected-label">
                        ✅ Đang dùng
                      </span>
                    ) : (
                      <button
                        className="action-btn select-btn"
                        onClick={() => handleSelectFood(food.id)}
                      >
                        Chọn
                      </button>
                    )
                  ) : (
                    <button
                      className={`action-btn buy-btn ${
                        !canAfford ? "cannot-afford" : ""
                      }`}
                      disabled={isLoading || !canAfford}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBuyItem("foods", food.id, food.price);
                      }}
                    >
                      {isLoading ? "..." : `Mua - ${food.price} 💰`}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SnakeCustomizer;