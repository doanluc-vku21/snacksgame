// src/missionsData.js

// Định nghĩa các loại nhiệm vụ
export const MISSION_TYPES = {
  DAILY: 'DAILY',
  WEEKLY: 'WEEKLY',
};

// Danh sách tất cả các nhiệm vụ trong game
// id: Phải là duy nhất, dùng để theo dõi tiến độ
// type: Hằng ngày (DAILY) hay Hằng tuần (WEEKLY)
// title: Tên nhiệm vụ
// target: Số lượng cần đạt
// reward: Số coin thưởng
export const MISSIONS_DATA = [
  // --- NHIỆM VỤ HẰNG NGÀY ---
  {
    id: 'daily_eat_food_1',
    type: MISSION_TYPES.DAILY,
    title: 'Bữa sáng: Ăn 50 mồi',
    target: 50,
    reward: 20,
  },
  {
    id: 'daily_play_games_1',
    type: MISSION_TYPES.DAILY,
    title: 'Khởi động: Chơi 3 ván (bất kỳ chế độ)',
    target: 3,
    reward: 30,
  },
  {
    id: 'daily_get_powerups_1',
    type: MISSION_TYPES.DAILY,
    title: 'Tăng sức mạnh: Thu thập 5 vật phẩm',
    target: 5,
    reward: 50,
  },
  
  // --- NHIỆM VỤ HẰNG TUẦN ---
  {
    id: 'weekly_eat_food_1',
    type: MISSION_TYPES.WEEKLY,
    title: 'Chuyên gia ẩm thực: Ăn 500 mồi',
    target: 500,
    reward: 150,
  },
  {
    id: 'weekly_clear_obstacles_1',
    type: MISSION_TYPES.WEEKLY,
    title: 'Vượt chướng ngại vật: Hoàn thành 20 màn Obstacles',
    target: 20,
    reward: 250,
  },
  {
    id: 'weekly_win_ai_1',
    type: MISSION_TYPES.WEEKLY,
    title: 'Đấu sĩ: Chiến thắng 5 ván Versus AI (bất kỳ màn)',
    target: 5,
    reward: 300,
  },
];