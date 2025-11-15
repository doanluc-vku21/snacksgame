import React from "react";
// Dùng chung CSS với SnakeCustomizer cho phần header
import "../SnakeCustomizer/SnakeCustomizer.css";
// Dùng CSS riêng
import "./Tutorial.css";

const Tutorial = ({ onBackToMenu }) => {
  return (
    <div className="customizer-container tutorial-container">
      <div className="customizer-header">
        <h2>🎮 Hướng dẫn chơi 🎮</h2>
        <button onClick={onBackToMenu} className="back-btn">
          Quay lại Menu
        </button>
      </div>

      <div className="tutorial-content">
        <h3>1. Mục tiêu</h3>
        <p>
          Điều khiển con rắn ăn mồi (màu đỏ) để tăng điểm. Trò chơi kết thúc khi
          rắn đâm vào tường, vào chướng ngại vật, hoặc vào chính bản thân nó.
        </p>

        <h3>2. Điều khiển</h3>
        <ul>
          <li>
            <strong>Phím mũi tên (↑ ↓ ← →):</strong> Dùng để thay đổi hướng di
            chuyển của rắn.
          </li>
          <li>
            <strong>Phím Escape (Esc):</strong> Dùng để Tạm dừng (Pause) hoặc
            Tiếp tục (Resume) trò chơi.
          </li>
        </ul>

        <h3>3. Các Chế độ chơi</h3>
        <ul className="tutorial-list">
          <li>
            <span className="powerup-icon">🏆</span>
            <strong>Chơi Mặc Định (Classic):</strong> Chơi để đạt điểm cao nhất.
            Tốc độ sẽ tăng dần khi bạn ăn mồi (chế độ này sẽ được cập nhật sau,
            hiện tại là tốc độ cố định).
          </li>
          <li>
            <span className="powerup-icon">📈</span>
            <strong>Chơi Qua Màn (Levels):</strong> Không có chướng ngại vật. Ăn
            đủ số mồi mục tiêu để tự động qua màn. Mỗi màn tốc độ sẽ tăng lên.
          </li>
          <li>
            <span className="powerup-icon">🧱</span>
            <strong>Chướng Ngại Vật (Obstacles):</strong> Chơi qua 40 màn chơi
            được thiết kế sẵn. Ăn đủ mồi, sau đó nhấn "Màn tiếp" để sang màn
            mới. Cẩn thận với các chướng ngại vật (màu nâu)!
          </li>
          <li>
            <span className="powerup-icon">🤖</span>
            <strong>Đối Kháng AI (Versus AI):</strong> Bạn sẽ đối đầu với một
            hoặc nhiều rắn AI.Bạn có thê chọn màn bất kỳ tùy thuộc vào kỹ năng
            của bạn. Mục tiêu là sống sót và khiến tất cả rắn AI bị loại khỏi
            cuộc chơi. Thể loại này khá khó do rắn AI rất thông minh nên nếu bạn
            vượt qua thì xin chúc mừng! Bạn thuộc top 10% người thông minh nhất
            hệ mặt trời!
          </li>
        </ul>

        <h3>4. Vật phẩm (Power-ups)</h3>
        <p>
          (Chỉ xuất hiện ở chế độ Mặc Định và Qua Màn). Vật phẩm sẽ ngẫu nhiên
          xuất hiện khi bạn ăn mồi và tồn tại trong 7 giây.
        </p>
        <ul className="tutorial-list">
          <li>
            <span className="powerup-icon">💰</span>
            <strong>Tăng điểm:</strong> Ăn vật phẩm này sẽ được cộng ngay 2 điểm
            (thay vì 1).
          </li>
          <li>
            <span className="powerup-icon">🐢</span>
            <strong>Làm chậm (Slow-mo):</strong> Con rắn sẽ di chuyển chậm lại
            trong 5 giây.
          </li>
          <li>
            <span className="powerup-icon">🛡️</span>
            <strong>Bất tử:</strong> Con rắn sẽ phát sáng và có thể đi xuyên qua
            thân mình và chướng ngại vật (chỉ ở chế độ Qua Màn) trong 5 giây.
            (Vẫn thua nếu đâm vào tường!).
          </li>
        </ul>

        <h3>5. Bảng Xếp Hạng 🏆</h3>
        <p>Mỗi chế độ chơi có một Bảng Xếp Hạng riêng.</p>
        <ul className="tutorial-list">
          <li>
            <span className="powerup-icon">🥇</span>
            <strong>BXH Mặc Định:</strong> Xếp hạng theo <strong>Điểm</strong>{" "}
            cao nhất.
          </li>
          <li>
            <span className="powerup-icon">🥈</span>
            <strong>BXH Qua Màn:</strong> Xếp hạng theo <strong>Màn</strong> cao
            nhất (nếu bằng Màn, sẽ xếp theo Điểm).
          </li>
          <li>
            <span className="powerup-icon">🥉</span>
            <strong>BXH Đối Kháng AI:</strong> Xếp hạng theo{" "}
            <strong>Màn</strong> cao nhất (số lượng AI đã đánh bại). Nếu bằng
            Màn, sẽ xếp theo <strong>Thời gian</strong> hoàn thành nhanh nhất.
          </li>
          <li>
            <span className="powerup-icon">🏅</span>
            <strong>BXH Chướng Ngại Vật:</strong> Xếp hạng theo{" "}
            <strong>Màn</strong> cao nhất (nếu bằng Màn, sẽ xếp theo Điểm).
          </li>
        </ul>

        <h3>6. Tùy chỉnh Rắn 🎨</h3>
        <p>
          Vào mục "Tùy chỉnh Rắn" ở Menu để thay đổi màu sắc và hiệu ứng cho con
          rắn của bạn!
        </p>

        {/* ======================================= */}
        {/* === PHẦN MỚI THÊM VỀ NHIỆM VỤ === */}
        {/* ======================================= */}
        <h3>7. Nhiệm vụ (Missions) 🎯</h3>
        <p>
          Hoàn thành các nhiệm vụ để kiếm <strong>Coin (💰)</strong>! Dùng Coin
          để mua skins và mồi mới trong mục "Tùy chỉnh Rắn".
        </p>
        
        <h4>Các loại nhiệm vụ:</h4>
        <ul className="mission-tutorial-list">
          <li className="mission-daily">
            <span className="mission-icon">📅</span>
            <div>
              <strong>Nhiệm vụ Hàng Ngày</strong>
              <span>Reset vào 00:00 mỗi ngày. Hoàn thành để nhận thưởng nhanh.</span>
            </div>
          </li>
          <li className="mission-weekly">
            <span className="mission-icon">🗓️</span>
            <div>
              <strong>Nhiệm vụ Hàng Tuần</strong>
              <span>Reset vào sáng Thứ Hai. Nhiệm vụ khó hơn nhưng thưởng CỰC LỚN!</span>
            </div>
          </li>
        </ul>

        <h4>Làm sao để nhận thưởng?</h4>
        <p>
          Sau khi hoàn thành (thanh tiến độ đầy), bạn phải vào mục 
          <strong>"Nhiệm vụ"</strong> ở Menu chính và nhấn nút <strong>"Nhận"</strong> (Claim)
          màu xanh để lãnh Coin.
        </p>
        {/* === KẾT THÚC PHẦN MỚI === */}

      </div>
    </div>
  );
};

export default Tutorial;