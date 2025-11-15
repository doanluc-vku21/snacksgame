// src/snakeSkins.js

// Định nghĩa các skin
// Chúng ta sẽ dùng 'id' làm tên class CSS (ví dụ: 'skin-default')
export const SNAKE_SKINS = [
  {
    id: 'default',
    name: 'Xanh Lá Cây',
    isFree: true, // <-- MIỄN PHÍ
    price: 0,
    style: { background: 'linear-gradient(135deg, #4caf50, #8bc34a)' }
  },
  {
    id: 'blue',
    name: 'Xanh Đại Dương',
    isFree: true, // <-- MIỄN PHÍ
    price: 0,
    style: { background: 'linear-gradient(135deg, #03a9f4, #00bcd4)' }
  },
  {
    id: 'red',
    name: 'Đỏ Nham Thạch',
    isFree: false, // <-- TRẢ PHÍ
    price: 100, // <-- GIÁ TIỀN
    style: { background: 'linear-gradient(135deg, #f44336, #e91e63)' }
  },
  {
    id: 'purple',
    name: 'Tím Thiên Hà',
    isFree: false, // <-- TRẢ PHÍ
    price: 150,
    style: { background: 'linear-gradient(135deg, #673ab7, #9c27b0)' }
  },
  {
    id: 'ice',
    name: 'Băng Giá',
    isFree: false, // <-- TRẢ PHÍ
    price: 250, // (Tôi đã sửa giá từ 2 thành 250)
    style: { background: 'linear-gradient(135deg, #e0f7fa, #b2ebf2)' }
  },
  {
    id: 'rainbow',
    name: 'Cầu Vồng VIP',
    isFree: false, // <-- TRẢ PHÍ
    price: 500, // <-- GIÁ CAO NHẤT
    // Style này chỉ để hiển thị, hiệu ứng thật sẽ nằm trong CSS
    style: { background: 'linear-gradient(135deg, red, orange, yellow, green, blue, indigo, violet)' } 
  },
  
  // --- CÁC SKIN SIÊU ĐỈNH MỚI ---

  {
    id: 'gold',
    name: 'Vàng Kim 9999',
    isFree: false,
    price: 750,
    // Hiệu ứng gradient vàng kim loại
    style: { background: 'linear-gradient(135deg, #FFD700, #FFA500, #FFD700)' }
  },
  {
    id: 'ghost',
    name: 'Bóng Ma (Mờ ảo)',
    isFree: false,
    price: 350,
    // Hiệu ứng mờ (cần CSS để đẹp hơn)
    style: { background: 'rgba(230, 240, 255, 0.7)' }
  },
  {
    id: 'lava',
    name: 'Dung Nham (Động)',
    isFree: false,
    price: 1000, // Skin đắt nhất
    // Style này chỉ để xem trước. Hiệu ứng thật nằm trong CSS.
    style: { background: 'linear-gradient(135deg, #FF4500, #FFD700, #FF0000)' }
  },
  {
    id: 'glitch',
    name: 'Lỗi Tĩnh (Glitch)',
    isFree: false,
    price: 800,
    // Style này chỉ để xem trước. Hiệu ứng thật nằm trong CSS.
    style: { background: 'white' }
  },
];