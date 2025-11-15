// Đây là một mảng chứa 10 màn chơi
// Mỗi màn có 1 mục tiêu (goal) và 1 mảng chướng ngại vật (obstacles)

// Hàm trợ giúp để tạo mảng (cho nhanh)
const range = (start, end) => 
  Array.from({ length: end - start + 1 }, (_, i) => start + i);

export const OBSTACLE_LEVELS = [
  // Màn 1: Dễ - 4 khối ở giữa
  {
    level: 1,
    goal: 5,
    obstacles: [
      { x: 9, y: 9 }, { x: 10, y: 9 }, { x: 9, y: 10 }, { x: 10, y: 10 }
    ],
  },
  // Màn 2: Hành lang
  {
    level: 2,
    goal: 5,
    obstacles: [
      ...range(0, 19).map(i => ({ x: i, y: 8 })),
      ...range(0, 19).map(i => ({ x: i, y: 11 })),
    ].filter(o => o.x !== 0 && o.x !== 19), // Lối ra 2 bên
  },
  // Màn 3: 4 Góc
  {
    level: 3,
    goal: 7,
    obstacles: [
      ...range(2, 5).map(i => ({ x: i, y: 3 })),
      ...range(2, 5).map(i => ({ x: 3, y: i })),
      ...range(14, 17).map(i => ({ x: i, y: 3 })),
      ...range(2, 5).map(i => ({ x: 16, y: i })),
      ...range(14, 17).map(i => ({ x: i, y: 16 })),
      ...range(14, 17).map(i => ({ x: 16, y: i })),
      ...range(2, 5).map(i => ({ x: i, y: 16 })),
      ...range(14, 17).map(i => ({ x: 3, y: i })),
    ],
  },
  // Màn 4: Chữ Thập
  {
    level: 4,
    goal: 7,
    obstacles: [
      ...range(5, 14).map(i => ({ x: i, y: 9 })), // Ngang
      ...range(5, 14).map(i => ({ x: 9, y: i })), // Dọc
    ],
  },
  // Màn 5: Viền bên trong
  {
    level: 5,
    goal: 10,
    obstacles: [
      ...range(3, 16).map(i => ({ x: 3, y: i })), // Trái
      ...range(3, 16).map(i => ({ x: 16, y: i })), // Phải
      ...range(3, 16).map(i => ({ x: i, y: 3 })), // Trên
      ...range(3, 16).map(i => ({ x: i, y: 16 })), // Dưới
    ].filter(o => o.x !== 10 && o.y !== 10), // Chừa 2_lối
  },
  // Màn 6: Song song
  {
    level: 6,
    goal: 10,
    obstacles: [
      ...range(4, 15).map(i => ({ x: i, y: 6 })),
      ...range(4, 15).map(i => ({ x: i, y: 9 })),
      ...range(4, 15).map(i => ({ x: i, y: 12 })),
    ],
  },
  // Màn 7: Chữ S
  {
    level: 7,
    goal: 10,
    obstacles: [
      ...range(4, 9).map(i => ({ x: 5, y: i })),
      ...range(5, 14).map(i => ({ x: i, y: 9 })),
      ...range(9, 15).map(i => ({ x: 14, y: i })),
    ],
  },
  // Màn 8: Bàn cờ (thưa)
  {
    level: 8,
    goal: 10,
    obstacles: range(0, 19).flatMap(x => 
      range(0, 19).map(y => ({ x, y }))
    ).filter(o => (o.x % 4 === 2) && (o.y % 4 === 2)),
  },
  // Màn 9: Mê cung 1
  {
    level: 9,
    goal: 10,
    obstacles: [
      ...range(0, 15).map(i => ({ x: i, y: 4 })),
      ...range(4, 19).map(i => ({ x: 15, y: i })),
      ...range(4, 19).map(i => ({ x: i, y: 15 })),
      ...range(0, 11).map(i => ({ x: 4, y: i })),
      ...range(4, 12).map(i => ({ x: i, y: 11 })),
    ],
  },
  // Màn 10: Chung kết
  {
    level: 10,
    goal: 15,
    obstacles: [
      ...range(0, 8).map(i => ({ x: 3, y: i })),
      ...range(0, 8).map(i => ({ x: 16, y: i })),
      ...range(11, 19).map(i => ({ x: 3, y: i })),
      ...range(11, 19).map(i => ({ x: 16, y: i })),
      ...range(5, 14).map(i => ({ x: i, y: 9 })),
    ],
  },
  // Màn 11: Khung tranh vỡ
  {
    level: 11,
    goal: 10,
    obstacles: [
      ...range(2, 17).map(i => ({ x: 2, y: i })), // Trái
      ...range(2, 17).map(i => ({ x: 17, y: i })), // Phải
      ...range(2, 17).map(i => ({ x: i, y: 2 })), // Trên
      ...range(2, 17).map(i => ({ x: i, y: 17 })), // Dưới
    ].filter(o => o.x % 4 !== 0 || o.y % 4 !== 0), // Lọc ra vài lỗ hổng
  },
  // Màn 12: Dấu cộng
  {
    level: 12,
    goal: 10,
    obstacles: [
      {x:4,y:4}, {x:5,y:4}, {x:6,y:4}, {x:5,y:3}, {x:5,y:5},
      {x:14,y:4}, {x:15,y:4}, {x:16,y:4}, {x:15,y:3}, {x:15,y:5},
      {x:4,y:15}, {x:5,y:15}, {x:6,y:15}, {x:5,y:14}, {x:5,y:16},
      {x:14,y:15}, {x:15,y:15}, {x:16,y:15}, {x:15,y:14}, {x:15,y:16},
    ],
  },
  // Màn 13: Zic-zac
  {
    level: 13,
    goal: 10,
    obstacles: [
      ...range(0, 10).map(i => ({ x: 4, y: i })),
      ...range(4, 10).map(i => ({ x: i, y: 10 })),
      ...range(10, 19).map(i => ({ x: 10, y: i })),
      ...range(10, 15).map(i => ({ x: i, y: 10 })),
      ...range(5, 15).map(i => ({ x: 15, y: i })),
    ],
  },
  // Màn 14: Bàn cờ (dày)
  {
    level: 14,
    goal: 12,
    obstacles: range(0, 19).flatMap(x => 
      range(0, 19).map(y => ({ x, y }))
    ).filter(o => (o.x % 2 === 0) && (o.y % 2 === 0)), // Chẵn-chẵn
  },
  // Màn 15: Đường hầm
  {
    level: 15,
    goal: 12,
    obstacles: [
      ...range(0, 19).map(i => ({ x: 0, y: i })),
      ...range(0, 19).map(i => ({ x: 19, y: i })),
      ...range(0, 19).map(i => ({ x: i, y: 0 })),
      ...range(0, 19).map(i => ({ x: i, y: 19 })),
      ...range(3, 16).map(i => ({ x: 3, y: i })),
      ...range(3, 16).map(i => ({ x: 16, y: i })),
      ...range(3, 16).map(i => ({ x: i, y: 3 })),
      ...range(3, 16).map(i => ({ x: i, y: 16 })),
    ],
  },
  // Màn 16: Tường di động (tưởng tượng)
  {
    level: 16,
    goal: 12,
    obstacles: [
      ...range(0, 14).map(i => ({ x: i, y: 5 })),
      ...range(5, 19).map(i => ({ x: i, y: 10 })),
      ...range(0, 14).map(i => ({ x: i, y: 15 })),
    ],
  },
  // Màn 17: Chữ X
  {
    level: 17,
    goal: 12,
    obstacles: [
      ...range(4, 15).map(i => ({ x: i, y: i })), // Đường chéo 1
      ...range(4, 15).map(i => ({ x: i, y: 19 - i })), // Đường chéo 2
    ],
  },
  // Màn 18: Lỗ kim
  {
    level: 18,
    goal: 12,
    obstacles: range(0, 19).flatMap(x => 
      range(0, 19).map(y => ({ x, y }))
    ).filter(o => o.x !== 10 && o.y !== 10), // Trừ 1 hàng dọc 1 hàng ngang
  },
  // Màn 19: Bốn phòng
  {
    level: 19,
    goal: 15,
    obstacles: [
      ...range(0, 19).map(i => ({ x: 9, y: i })), // Tường dọc
      ...range(0, 19).map(i => ({ x: i, y: 9 })), // Tường ngang
    ].filter(o => o.x !== 5 && o.y !== 5 && o.x !== 15 && o.y !== 15), // 4 lối
  },
  // Màn 20: Mưa rơi
  {
    level: 20,
    goal: 15,
    obstacles: [
      {x:2,y:2},{x:2,y:3},{x:2,y:4},
      {x:5,y:7},{x:5,y:8},{x:5,y:9},
      {x:8,y:12},{x:8,y:13},{x:8,y:14},
      {x:11,y:3},{x:11,y:4},{x:11,y:5},
      {x:14,y:8},{x:14,y:9},{x:14,y:10},
      {x:17,y:13},{x:17,y:14},{x:17,y:15},
    ],
  },
  // Màn 21: Đường ray
  {
    level: 21,
    goal: 15,
    obstacles: [
      ...range(0, 19).map(i => ({ x: 2, y: i })),
      ...range(0, 19).map(i => ({ x: 4, y: i })),
      ...range(0, 19).map(i => ({ x: 15, y: i })),
      ...range(0, 19).map(i => ({ x: 17, y: i })),
    ],
  },
  // Màn 22: Mê cung 2
  {
    level: 22,
    goal: 15,
    obstacles: [
      ...range(0, 14).map(i => ({ x: i, y: 3 })),
      ...range(5, 19).map(i => ({ x: 14, y: i })),
      ...range(5, 19).map(i => ({ x: 5, y: i })),
      ...range(5, 14).map(i => ({ x: i, y: 16 })),
    ],
  },
  // Màn 23: Dấu chấm
  {
    level: 23,
    goal: 15,
    obstacles: [
      {x:3,y:3}, {x:3,y:8}, {x:3,y:13}, {x:3,y:18},
      {x:8,y:3}, {x:8,y:8}, {x:8,y:13}, {x:8,y:18},
      {x:13,y:3}, {x:13,y:8}, {x:13,y:13}, {x:13,y:18},
      {x:18,y:3}, {x:18,y:8}, {x:18,y:13}, {x:18,y:18},
    ],
  },
  // Màn 24: Đường hẹp
  {
    level: 24,
    goal: 15,
    obstacles: [
      ...range(0, 19).map(i => ({ x: i, y: 9 })),
      ...range(0, 19).map(i => ({ x: i, y: 10 })),
    ].filter(o => o.x > 3), // Chừa 1 lối vào
  },
  // Màn 25: Hàng rào
  {
    level: 25,
    goal: 15,
    obstacles: range(0, 19).flatMap(x => 
      range(0, 19).map(y => ({ x, y }))
    ).filter(o => (o.x % 4 === 0) || (o.y % 4 === 0)),
  },
  // Màn 26: Mê cung 3
  {
    level: 26,
    goal: 15,
    obstacles: [
      ...range(1, 18).map(i => ({ x: i, y: 1 })),
      ...range(1, 18).map(i => ({ x: 1, y: i })),
      ...range(1, 18).map(i => ({ x: i, y: 18 })),
      ...range(1, 18).map(i => ({ x: 18, y: i })),
      ...range(3, 16).map(i => ({ x: i, y: 3 })),
      ...range(3, 16).map(i => ({ x: 3, y: i })),
      ...range(3, 16).map(i => ({ x: i, y: 16 })),
      ...range(3, 16).map(i => ({ x: 16, y: i })),
    ],
  },
  // Màn 27: Pháo đài
  {
    level: 27,
    goal: 18,
    obstacles: [
      ...range(6, 13).map(i => ({ x: i, y: 6 })),
      ...range(6, 13).map(i => ({ x: i, y: 13 })),
      ...range(6, 13).map(i => ({ x: 6, y: i })),
      ...range(6, 13).map(i => ({ x: 13, y: i })),
    ].filter(o => o.x !== 10 && o.y !== 10), // 4 lối vào
  },
  // Màn 28: Kẻ sọc
  {
    level: 28,
    goal: 18,
    obstacles: range(0, 19).flatMap(x => 
      range(0, 19).map(y => ({ x, y }))
    ).filter(o => o.x % 2 === 0), // Toàn bộ cột chẵn
  },
  // Màn 29: Xoắn ốc
  {
    level: 29,
    goal: 18,
    obstacles: [
      ...range(0, 17).map(i => ({ x: i, y: 0 })),
      ...range(0, 17).map(i => ({ x: 17, y: i })),
      ...range(2, 19).map(i => ({ x: i, y: 19 })),
      ...range(2, 19).map(i => ({ x: 0, y: i })),
      ...range(2, 15).map(i => ({ x: i, y: 2 })),
      ...range(2, 15).map(i => ({ x: 15, y: i })),
      ...range(4, 17).map(i => ({ x: i, y: 17 })),
      ...range(4, 17).map(i => ({ x: 2, y: i })),
      ...range(4, 13).map(i => ({ x: i, y: 4 })),
      ...range(4, 13).map(i => ({ x: 13, y: i })),
      ...range(6, 15).map(i => ({ x: i, y: 15 })),
    ],
  },
  // Màn 30: Trống rỗng (chỉ có viền)
  {
    level: 30,
    goal: 20,
    obstacles: [
      ...range(0, 19).map(i => ({ x: 0, y: i })),
      ...range(0, 19).map(i => ({ x: 19, y: i })),
      ...range(0, 19).map(i => ({ x: i, y: 0 })),
      ...range(0, 19).map(i => ({ x: i, y: 19 })),
    ],
  },
  // Màn 31: Mê cung 4
  {
    level: 31,
    goal: 15,
    obstacles: [
      ...range(1, 10).map(i => ({ x: 3, y: i })),
      ...range(1, 10).map(i => ({ x: 6, y: i })),
      ...range(1, 10).map(i => ({ x: 9, y: i })),
      ...range(1, 10).map(i => ({ x: 12, y: i })),
      ...range(1, 10).map(i => ({ x: 15, y: i })),
      ...range(10, 19).map(i => ({ x: 1, y: i })),
      ...range(10, 19).map(i => ({ x: 4, y: i })),
      ...range(10, 19).map(i => ({ x: 7, y: i })),
      ...range(10, 19).map(i => ({ x: 10, y: i })),
      ...range(10, 19).map(i => ({ x: 13, y: i })),
      ...range(10, 19).map(i => ({ x: 16, y: i })),
    ],
  },
  // Màn 32: Bàn cờ (siêu dày)
  {
    level: 32,
    goal: 15,
    obstacles: range(0, 19).flatMap(x => 
      range(0, 19).map(y => ({ x, y }))
    ).filter(o => (o.x % 2 === 0) ^ (o.y % 2 === 0)), // XOR
  },
  // Màn 33: Tường kép
  {
    level: 33,
    goal: 15,
    obstacles: [
      ...range(0, 19).map(i => ({ x: 5, y: i })),
      ...range(0, 19).map(i => ({ x: 6, y: i })),
      ...range(0, 19).map(i => ({ x: 13, y: i })),
      ...range(0, 19).map(i => ({ x: 14, y: i })),
    ].filter(o => o.y !== 9), // Lối ra ở giữa
  },
  // Màn 34: Ống
  {
    level: 34,
    goal: 15,
    obstacles: range(0, 19).flatMap(x => 
      range(0, 19).map(y => ({ x, y }))
    ).filter(o => (o.y < 8 || o.y > 11)), // Chỉ có 1 hành lang ngang
  },
  // Màn 35: Chữ H
  {
    level: 35,
    goal: 18,
    obstacles: [
      ...range(2, 17).map(i => ({ x: 4, y: i })),
      ...range(2, 17).map(i => ({ x: 15, y: i })),
      ...range(5, 14).map(i => ({ x: i, y: 9 })),
    ],
  },
  // Màn 36: Mê cung 5
  {
    level: 36,
    goal: 18,
    obstacles: [
      ...range(0, 19).map(i => ({ x: i, y: 2 })),
      ...range(0, 19).map(i => ({ x: i, y: 17 })),
      ...range(0, 19).map(i => ({ x: 2, y: i })),
      ...range(0, 19).map(i => ({ x: 17, y: i })),
      ...range(4, 15).map(i => ({ x: i, y: 4 })),
      ...range(4, 15).map(i => ({ x: i, y: 15 })),
      ...range(4, 15).map(i => ({ x: 4, y: i })),
      ...range(4, 15).map(i => ({ x: 15, y: i })),
    ],
  },
  // Màn 37: Lưới
  {
    level: 37,
    goal: 20,
    obstacles: range(0, 19).flatMap(x => 
      range(0, 19).map(y => ({ x, y }))
    ).filter(o => (o.x % 3 === 0) || (o.y % 3 === 0)),
  },
  // Màn 38: Đường hầm (ngược)
  {
    level: 38,
    goal: 20,
    obstacles: range(0, 19).flatMap(x => 
      range(0, 19).map(y => ({ x, y }))
    ).filter(o => (o.x > 8 && o.x < 11)), // Bỏ 2 hàng dọc
  },
  // Màn 39: Xoắn ốc (ngược)
  {
    level: 39,
    goal: 20,
    obstacles: [
      ...range(1, 18).map(i => ({ x: i, y: 1 })),
      ...range(1, 18).map(i => ({ x: 18, y: i })),
      ...range(3, 16).map(i => ({ x: i, y: 3 })),
      ...range(3, 16).map(i => ({ x: 3, y: i })),
      ...range(3, 16).map(i => ({ x: 16, y: i })),
      ...range(5, 14).map(i => ({ x: i, y: 5 })),
      ...range(5, 14).map(i => ({ x: 5, y: i })),
      ...range(5, 14).map(i => ({ x: 14, y: i })),
      ...range(7, 12).map(i => ({ x: i, y: 7 })),
      ...range(7, 12).map(i => ({ x: 7, y: i })),
      ...range(7, 12).map(i => ({ x: 12, y: i })),
      {x:9, y:9}, {x:10, y:9}, {x:9, y:10}, {x:10, y:10},
    ],
  },
  // Màn 40: Mê cung cuối
  {
    level: 40,
    goal: 25,
    obstacles: range(0, 19).flatMap(x => 
      range(0, 19).map(y => ({ x, y }))
    ).filter(o => (o.x % 2 !== 0) && (o.y % 2 !== 0)), // Lẻ-lẻ
  },
];