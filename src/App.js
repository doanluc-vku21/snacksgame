// src/App.js
import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import "./App.css";

// Firebase (không đổi)
import {
  db,
  auth,
  signOut,
  doc,
  setDoc,
  getDoc,
} from "./firebase";

// Màn chơi
import { OBSTACLE_LEVELS } from "./obstacleLevels";

// Audio
import audioManager from "./audioManager";

// Components
import Board from "./components/Board/Board";
import ScoreBoard from "./components/ScoreBoard/ScoreBoard";
import GameOverOverlay from "./components/GameOverOverlay/GameOverOverlay";
import Auth from "./components/Auth/Auth";
import Leaderboard from "./components/Leaderboard/Leaderboard";
import PauseMenu from "./components/PauseMenu/PauseMenu";
import SnakeCustomizer from "./components/SnakeCustomizer/SnakeCustomizer";
import Tutorial from "./components/Tutorial/Tutorial";
import SettingsMenu from "./components/Settings/SettingsMenu";
import Missions from "./components/Missions/Missions";
import LoadingScreen from "./components/LoadingScreen/LoadingScreen";

// Context
import { useAuth } from "./context/AuthContext";

// --- HẰNG SỐ ---
const GRID_SIZE = 20;
const BOARD_SIZE = 20;
const STARTING_SPEED = 200;
const LEVEL_SPEED_INCREASE = 15;
const MIN_SPEED = 60;
const LEVEL_START_GOAL = 5;
const SNAKE_START = [{ x: 8, y: 8 }, { x: 7, y: 8 }];
const AI_START_POSITIONS = [
  [{ x: 15, y: 15 }, { x: 14, y: 15 }], // AI 1
  [{ x: 15, y: 4 }, { x: 14, y: 4 }], // AI 2
  [{ x: 4, y: 15 }, { x: 3, y: 15 }], // AI 3
];
const AI_START_DIRECTIONS = ["LEFT", "LEFT", "RIGHT"];
const AI_STARTING_SPEED = 250;
const POWERUP_TYPES = ["SCORE_BOOST", "SLOW_MO", "INVINCIBLE"];
const POWERUP_DURATION = 5000;
const POWERUP_SPAWN_CHANCE = 0.25;
const POWERUP_LIFESPAN = 7000;
// Thêm dòng này
const MIN_SFX_COOLDOWN = 50; // Cooldown 50 mili-giây cho âm thanh

// --- HÀM HỖ TRỢ ---
const isPositionSafe = (pos, snake, obstacles, otherItems = []) => {
  // SỬA LỖI: Đảm bảo 'snake' là một mảng trước khi lặp
  if (!Array.isArray(snake)) {
    return false; // Nếu không phải mảng, coi như vị trí không an toàn
  }
  if (!pos) return false;
  for (const seg of snake) {
    if (seg.x === pos.x && seg.y === pos.y) return false;
  }
  for (const obs of obstacles) {
    if (obs.x === pos.x && obs.y === pos.y) return false;
  }
  for (const item of otherItems) {
    if (!item) continue;
    // otherItems can be points or arrays (snakes)
    if (Array.isArray(item)) {
      for (const seg of item) {
        if (seg.x === pos.x && seg.y === pos.y) return false;
      }
    } else if (item.x === pos.x && item.y === pos.y) {
      return false;
    }
  }
  return true;
};

const generateSafePosition = (snake, obstacles, otherItems = []) => {
  // SỬA LỖI: Đảm bảo 'snake' luôn là một mảng khi gọi generateSafePosition
  if (!Array.isArray(snake)) {
    snake = []; // Mặc định là mảng rỗng nếu không phải mảng
  }
  // safe fallback: try up to many attempts then return null
  for (let attempts = 0; attempts < 2000; attempts++) {
    const newPos = {
      x: Math.floor(Math.random() * BOARD_SIZE),
      y: Math.floor(Math.random() * BOARD_SIZE),
    };
    if (isPositionSafe(newPos, snake, obstacles, otherItems)) {
      return newPos;
    }
  }
  return null;
};

// --- APP ---
function App() {
  const { currentUser, addCoins, updateMissionProgress } = useAuth();
  
  const settings = useMemo(
    () =>
      currentUser?.settings || {
        music: true,
        sfxPack: "pack1",
        controls: "ARROWS",
        musicTrack: "classic",
        selectedSkin: "default",
        selectedFood: "default",
      },
    [currentUser?.settings]
  );

  // --- STATE ---
  const [isLoading, setIsLoading] = useState(true);
  const [snake, setSnake] = useState(SNAKE_START);
  // Thêm dòng này
const lastSfxTime = useRef(0);
  const snakeRef = useRef(snake); // <--- THÊM DÒNG NÀY
  useEffect(() => { snakeRef.current = snake; }, [snake]); // <--- THÊM DÒNG NÀY
  const [food, setFood] = useState(() => generateSafePosition(SNAKE_START, []));
  const [direction, setDirection] = useState("RIGHT");
  const directionRef = useRef(direction); // <-- THÊM DÒNG NÀY
useEffect(() => { directionRef.current = direction; }, [direction]);
  const directionBuffer = useRef([]);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState("MENU");
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  // Leaderboard-specific user-highscore states
  const [classicHighScore, setClassicHighScore] = useState(0);
  const [levelsHighLevel, setLevelsHighLevel] = useState(1);
  const [levelsHighLevelScore, setLevelsHighLevelScore] = useState(0);
  const [obstaclesHighLevel, setObstaclesHighLevel] = useState(1);
  const [obstaclesHighLevelScore, setObstaclesHighLevelScore] = useState(0);
  const [versusHighLevel, setVersusHighLevel] = useState(0);
  const [versusBestTime, setVersusBestTime] = useState(Infinity);

  const [gameMode, setGameMode] = useState(null);
  const [level, setLevel] = useState(1);
  const [levelScore, setLevelScore] = useState(0);
  const [foodToPassLevel, setFoodToPassLevel] = useState(LEVEL_START_GOAL);
  const [gameWon, setGameWon] = useState(false);
  const [obstacles, setObstacles] = useState([]);
  const [baseSpeed, setBaseSpeed] = useState(STARTING_SPEED);

  // power-up
  const [powerUp, setPowerUp] = useState(null);
  const powerUpClearTimerRef = useRef(null);

  // active effects
  const [activeEffects, setActiveEffects] = useState({
    invincible: false,
    slowMo: false,
  });
  const effectTimers = useRef({ invincible: null, slowMo: null });

  const [aiSnakes, setAiSnakes] = useState([]);
  const aiSnakesRef = useRef(aiSnakes); // <--- THÊM DÒNG NÀY
  useEffect(() => { aiSnakesRef.current = aiSnakes; }, [aiSnakes]);
  const [timer, setTimer] = useState(0);
  const timerIntervalRef = useRef(null);
  const boardRef = useRef(null);

  const [isAudioInitialized, setIsAudioInitialized] = useState(false);
  
  const currentGameSpeed = baseSpeed + (activeEffects.slowMo ? 75 : 0);

  // --- Loading Screen Effect ---
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2800); // Thời gian này nên dài hơn animation một chút
    return () => clearTimeout(timer);
  }, []);

  const playSfxSafe = useCallback((sfxName) => {
    const now = performance.now(); // Lấy thời gian hiện tại
    
    // Chỉ phát âm thanh nếu đã qua 50ms kể từ lần trước
    if (now - lastSfxTime.current > MIN_SFX_COOLDOWN) {
      audioManager.playSFX(sfxName);
      lastSfxTime.current = now; // Cập nhật thời gian phát cuối cùng
    }
    // Nếu không, âm thanh sẽ bị bỏ qua để tránh lỗi
  }, []); // Mảng rỗng [] rất quan trọng, để hàm này "stable"

 // --- Audio helpers ---
  const playClickSound = useCallback(async () => {
    if (!isAudioInitialized) {
      console.log("User gesture detected, starting AudioContext...");
      try {
        await audioManager.init(); 
        setIsAudioInitialized(true); 
        playSfxSafe("click"); 
      } catch (e) {
        console.warn("Audio init failed on first click:", e);
      }
    } else {
      playSfxSafe("click");
    }
  }, [isAudioInitialized, playSfxSafe]); 

// Dán 2 khối này vào thay thế cho khối useEffect (dòng 200-216)

  // useEffect 1: CHỈ xử lý thay đổi SFX (Gói âm thanh)
  useEffect(() => {
    if (!settings?.sfxPack) return;
    audioManager.setSfxPack(settings.sfxPack);
  }, [settings?.sfxPack]); // <-- Chỉ chạy khi sfxPack thay đổi

  // useEffect 2: CHỈ xử lý thay đổi BGM (Nhạc nền)
  useEffect(() => {
    if (!isAudioInitialized) {
      return; // Chờ âm thanh sẵn sàng
    }

    if (settings.music && settings.musicTrack && settings.musicTrack !== 'none') {
      audioManager.playBGM(settings.musicTrack);
    } else { 
      audioManager.stopBGM();
    }
    
  }, [
      settings.music,       // <-- Chỉ chạy khi bật/tắt nhạc
      settings.musicTrack,  // <-- Chỉ chạy khi đổi bài nhạc
      isAudioInitialized    // <-- Chỉ chạy khi âm thanh sẵn sàng
  ]);

// --- Kết thúc thay thế --- 

  // --- Read highscores from Firebase once user loaded ---
  useEffect(() => {
    if (!currentUser) return;

    const getAllHighScores = async () => {
      try {
        const classicDocRef = doc(db, "leaderboard_classic", currentUser.uid);
        const classicSnap = await getDoc(classicDocRef);
        setClassicHighScore(classicSnap.exists() ? classicSnap.data().score : 0);

        const levelsDocRef = doc(db, "leaderboard_levels", currentUser.uid);
        const levelsSnap = await getDoc(levelsDocRef);
        if (levelsSnap.exists()) {
          setLevelsHighLevel(levelsSnap.data().level || 1);
          setLevelsHighLevelScore(levelsSnap.data().score || 0);
        } else {
          setLevelsHighLevel(1);
          setLevelsHighLevelScore(0);
        }

        const obstaclesDocRef = doc(db, "leaderboard_obstacles", currentUser.uid);
        const obstaclesSnap = await getDoc(obstaclesDocRef);
        if (obstaclesSnap.exists()) {
          setObstaclesHighLevel(obstaclesSnap.data().level || 1);
          setObstaclesHighLevelScore(obstaclesSnap.data().score || 0);
        } else {
          setObstaclesHighLevel(1);
          setObstaclesHighLevelScore(0);
        }

        const versusDocRef = doc(db, "leaderboard_versus", currentUser.uid);
        const versusSnap = await getDoc(versusDocRef);
        if (versusSnap.exists()) {
          setVersusHighLevel(versusSnap.data().level || 0);
          setVersusBestTime(versusSnap.data().time || Infinity);
        } else {
          setVersusHighLevel(0);
          setVersusBestTime(Infinity);
        }
      } catch (e) {
        console.error("Error reading highscores:", e);
      }
    };

    getAllHighScores();
  }, [currentUser]);

  // --- Save highscore (fix 'Khách') ---
  const saveHighScore = useCallback(async (finalScore, finalLevel, mode, finalTime = Infinity) => {
    if (!currentUser) return;

    let docRef;
    let dataToSave;
    let shouldSave = false;
    let playSound = false;

    if (mode === "CLASSIC") {
      if (finalScore > classicHighScore) {
        setClassicHighScore(finalScore);
        docRef = doc(db, "leaderboard_classic", currentUser.uid);
        dataToSave = { score: finalScore };
        shouldSave = true;
        playSound = true;
      }
    } else if (mode === "LEVELS") {
      if (finalLevel > levelsHighLevel || (finalLevel === levelsHighLevel && finalScore > levelsHighLevelScore)) {
        setLevelsHighLevel(finalLevel);
        setLevelsHighLevelScore(finalScore);
        docRef = doc(db, "leaderboard_levels", currentUser.uid);
        dataToSave = { level: finalLevel, score: finalScore };
        shouldSave = true;
        playSound = true;
      }
    } else if (mode === "OBSTACLES") {
      if (finalLevel > obstaclesHighLevel || (finalLevel === obstaclesHighLevel && finalScore > obstaclesHighLevelScore)) {
        setObstaclesHighLevel(finalLevel);
        setObstaclesHighLevelScore(finalScore);
        docRef = doc(db, "leaderboard_obstacles", currentUser.uid);
        dataToSave = { level: finalLevel, score: finalScore };
        shouldSave = true;
        playSound = true;
      }
    } else if (mode === "VERSUS_AI") {
      if (finalLevel > versusHighLevel || (finalLevel === versusHighLevel && finalTime < versusBestTime)) {
        setVersusHighLevel(finalLevel);
        setVersusBestTime(finalTime);
        docRef = doc(db, "leaderboard_versus", currentUser.uid);
        dataToSave = { level: finalLevel, time: finalTime };
        shouldSave = true;
        playSound = true;
      }
    }

    if (shouldSave && playSound) {
      playSfxSafe("new_highscore");
      try {
        await setDoc(
          docRef,
          {
            ...dataToSave, // dataToSave is stable within this callback
            username: settings.username || currentUser.displayName || currentUser.email?.split("@")[0] || "Khách",
            userId: currentUser.uid,
            lastUpdated: new Date(),
          },
          { merge: true }
        );
        console.log(`Đã cập nhật kỷ lục ${mode}.`);
      } catch (e) {
        console.error(`Lỗi cập nhật ${mode}: `, e);
      }
    }
  }, [
    currentUser,
    classicHighScore,
    levelsHighLevel,
    levelsHighLevelScore,
    obstaclesHighLevel,
    obstaclesHighLevelScore,
    versusHighLevel,
    versusBestTime,
    playSfxSafe,
    settings,
  ]);

  // --- Logout ---
  const handleLogout = useCallback(async () => {
    playSfxSafe("click");
    try {
      await signOut(auth);
    } catch (e) {
      console.error("Logout error:", e);
    }
  }, [playSfxSafe]);

  // --- Effects / timers clearing ---
  const clearAllEffects = useCallback(() => {
    clearTimeout(powerUpClearTimerRef.current);
    setPowerUp(null);
    clearTimeout(effectTimers.current.slowMo);
    setBaseSpeed(STARTING_SPEED);
    clearTimeout(effectTimers.current.invincible);
    setActiveEffects({ invincible: false, slowMo: false });
  }, []);

  // --- Activate powerup (use refs for timers) ---
  const activatePowerUp = useCallback((type) => {
    setPowerUp(null);

    playSfxSafe("powerup");
    if (currentUser) {
      updateMissionProgress(['daily_get_powerups_1'], 1);
    }

    if (type === "SCORE_BOOST") {
      setScore((s) => s + 2);
      if (currentUser) {
        addCoins(2); 
      }
    } else if (type === "SLOW_MO") {
      clearTimeout(effectTimers.current.slowMo);
      setActiveEffects((prev) => ({ ...prev, slowMo: true }));

      const t = setTimeout(() => {
        setActiveEffects((prev) => ({ ...prev, slowMo: false }));
      }, POWERUP_DURATION);
      effectTimers.current.slowMo = t;
    } else if (type === "INVINCIBLE") {
      clearTimeout(effectTimers.current.invincible);
      setActiveEffects((prev) => ({ ...prev, invincible: true }));

      const t2 = setTimeout(() => {
        setActiveEffects((prev) => ({ ...prev, invincible: false }));
      }, POWERUP_DURATION);
      effectTimers.current.invincible = t2;
    }
  }, [currentUser, addCoins, updateMissionProgress, playSfxSafe]);

  // --- Try spawn powerup ---
  const trySpawnPowerUp = useCallback(() => {
    if (gameMode === "OBSTACLES" || gameMode === "VERSUS_AI") return;

    if (powerUp || activeEffects.invincible || activeEffects.slowMo) {
      return;
    }

    if (Math.random() < POWERUP_SPAWN_CHANCE) {
      const type = POWERUP_TYPES[Math.floor(Math.random() * POWERUP_TYPES.length)];
      const allAiFoods = aiSnakes.map((ai) => ai.food).filter(Boolean);
      const pos = generateSafePosition(snake, obstacles, [food, ...allAiFoods]);

      if (pos) {
        setPowerUp({ type, ...pos });
        clearTimeout(powerUpClearTimerRef.current);
        const timer = setTimeout(() => {
          setPowerUp(null);
        }, POWERUP_LIFESPAN);
        powerUpClearTimerRef.current = timer;
      }
      else {
        console.warn("Không tìm thấy vị trí an toàn để tạo vật phẩm. Vật phẩm sẽ không xuất hiện.");
      }
    }
  }, [gameMode, powerUp, activeEffects.invincible, activeEffects.slowMo, obstacles, aiSnakes, snake, food]);

  const movePlayer = useCallback(() => {
    // SỬA LỖI: Đọc state từ REF
    const currentDirection = directionRef.current;
    const newSnake = [...snakeRef.current];
    const head = { ...newSnake[0] };

    // SỬA LỖI 'directionBuffer' is not defined:
    // Phải dùng .current
    if (directionBuffer.current.length > 0) {
      const nextDir = directionBuffer.current.shift();
      if (
        (nextDir === "UP" && currentDirection !== "DOWN") ||
        (nextDir === "DOWN" && currentDirection !== "UP") ||
        (nextDir === "LEFT" && currentDirection !== "RIGHT") ||
        (nextDir === "RIGHT" && currentDirection !== "LEFT")
      ) {
        setDirection(nextDir); // Cập nhật state (để ref được cập nhật ở lần render sau)
        switch (nextDir) {
          case "UP": head.y -= 1; break;
          case "DOWN": head.y += 1; break;
          case "LEFT": head.x -= 1; break;
          case "RIGHT": head.x += 1; break;
          default: break;
        }
      } else {
        // Giữ hướng cũ nếu hướng đệm không hợp lệ
        switch (currentDirection) {
          case "UP": head.y -= 1; break;
          case "DOWN": head.y += 1; break;
          case "LEFT": head.x -= 1; break;
          case "RIGHT": head.x += 1; break;
          default: break;
        }
      }
    } else {
      // Di chuyển theo hướng hiện tại
      switch (currentDirection) {
        case "UP": head.y -= 1; break;
        case "DOWN": head.y += 1; break;
        case "LEFT": head.x -= 1; break;
        case "RIGHT": head.x += 1; break;
        default: break;
      }
    }

    // --- Va chạm ---
    const isWallCollision = head.x < 0 || head.y < 0 || head.x >= BOARD_SIZE || head.y >= BOARD_SIZE;

    if (isWallCollision) {
      playSfxSafe("gameover");
      if (currentUser) {
        saveHighScore(score, level, gameMode, timer);
      }
      setGameState("GAME_OVER");
      return;
    }

    // Dùng activeEffects.invincible (Từ file gốc)
    if (activeEffects.invincible) {
      newSnake.pop();
      newSnake.unshift(head);
      setSnake(newSnake);
    } else {
      const isSelfCollision = newSnake.some((segment) => segment.x === head.x && segment.y === head.y);
      const isObstacleCollision = obstacles.some((obs) => obs.x === head.x && obs.y === head.y);

      // SỬA LỖI GỐC (Concurrent Rendering): Đọc va chạm AI từ REF
      const isAiCollision = aiSnakesRef.current.some((ai) => ai.snake.some((seg) => seg.x === head.x && seg.y === head.y));

      if (isSelfCollision || isObstacleCollision || isAiCollision) {
        playSfxSafe("gameover");
        if (currentUser) {
          saveHighScore(score, level, gameMode, timer);
        }
        setGameState("GAME_OVER");
        return;
      }
      newSnake.pop();
      newSnake.unshift(head);
      setSnake(newSnake);
    }

    // Ăn mồi (Logic gốc của bạn)
    if (head.x === food.x && head.y === food.y) {
      const newScore = score + 1 + (activeEffects.score_boost ? 4 : 0);
      setScore(newScore);
      playSfxSafe("eat");
      const allSnakes = [newSnake, ...aiSnakesRef.current.map(ai => ai.snake)];
      setFood(generateSafePosition(newSnake, obstacles, [powerUp, ...allSnakes]));
      setSnake([{ ...newSnake[0] }, ...newSnake]); // <- setSnake(prev => ...) sẽ tốt hơn, nhưng newSnake đã an toàn
      if (currentUser) {
        updateMissionProgress(['daily_eat_food_1', 'weekly_eat_food_1'], 1);
        addCoins(1);
      }

      // --- LOGIC THEO CHẾ ĐỘ CHƠI ---
      // SỬA LỖI: Cập nhật levelScore và logic qua màn cho chế độ LEVELS
      if (gameMode === 'LEVELS' || gameMode === 'OBSTACLES') {
        const newLevelScore = levelScore + 1;
        let currentLevelGoal = foodToPassLevel;

        if (gameMode === 'OBSTACLES') {
          currentLevelGoal = OBSTACLE_LEVELS[level - 1].goal;
        }

        if (newLevelScore >= currentLevelGoal) {
          playSfxSafe('levelup');
          
          if (gameMode === 'OBSTACLES') {
            const nextLevelIndex = level;
            if (nextLevelIndex >= OBSTACLE_LEVELS.length) {
              setGameWon(true);
              setGameState('GAME_OVER');
              saveHighScore(newScore, nextLevelIndex + 1, gameMode, timer);
              clearAllEffects();
              return;
            }
            // *** SỬA LỖI TẠI ĐÂY: Cập nhật tiến độ nhiệm vụ ***
            if (currentUser) {
              updateMissionProgress(['weekly_clear_obstacles_1'], 1);
            }
            setGameState('LEVEL_CLEARED'); // Go to cleared state for OBSTACLES
            clearAllEffects();
          } else if (gameMode === 'LEVELS') { // LEVELS mode: just update parameters and continue
            setLevel((prev) => prev + 1);
            setLevelScore(0); // Reset for next level
            setFoodToPassLevel((prev) => prev + 2); // Increase goal for next level
            setBaseSpeed((prev) => Math.max(MIN_SPEED, prev - LEVEL_SPEED_INCREASE));
            if (currentUser) { // Reward for passing level in LEVELS mode
              addCoins(100 + level * 5);
            }
            // No setGameState('LEVEL_CLEARED') here, game continues
          }
        } else { // Not enough food to clear level yet
          if (newLevelScore >= currentLevelGoal - 2) { // Nearing goal
              playSfxSafe('countdown');
          }
          setLevelScore(newLevelScore); // Always update levelScore if not cleared
        }
      }
    }

    // Ăn vật phẩm (Logic gốc của bạn)
    if (powerUp && head.x === powerUp.x && head.y === powerUp.y) {
      // audioManager.playSFX("powerup"); // Đã chuyển vào activatePowerUp
      activatePowerUp(powerUp.type);
      setPowerUp(null);
    }

    // Sinh vật phẩm
    trySpawnPowerUp();

  }, [
    // SỬA LỖI: Xóa 'snake' và 'direction' khỏi mảng dependencies
    // snake, // <-- XÓA
    // direction, // <-- XÓA
    food,
    obstacles, powerUp, score, level, gameMode, foodToPassLevel,
    activeEffects.invincible, activeEffects.score_boost, currentUser,
    saveHighScore,
    updateMissionProgress,
    addCoins,
    activatePowerUp, 
    trySpawnPowerUp,
    aiSnakesRef, timer, levelScore, setLevelScore, setLevel, setFoodToPassLevel, setBaseSpeed, playSfxSafe,
    setGameState, setGameWon, clearAllEffects
  ]);

  // App.js (Dán đè lên dòng 539-680)

  // App.js (Dán đè lên dòng 539-680)

  const moveAIs = useCallback(() => {
    // SỬA LỖI 1: Đọc state của người chơi từ REF
    const currentSnake = snakeRef.current;

    // SỬA LỖI 2: Dùng
    setAiSnakes(prevAiSnakes => {
      if (!prevAiSnakes) return [];

      const hardObstacles = [...currentSnake, ...obstacles];

      const nextAiSnakes = prevAiSnakes.map((ai, aiIndex) => {
        if (!ai.snake || ai.snake.length === 0) return ai;

        const newAiSnake = [...ai.snake];
        const head = { ...newAiSnake[0] };

        // Dùng prevAiSnakes để kiểm tra va chạm AI
        const currentHardObstacles = [...hardObstacles, ...newAiSnake.slice(1)];
        const currentSoftObstacles = prevAiSnakes
          .filter((_, index) => index !== aiIndex)
          .flatMap((otherAi) => otherAi.snake);

        // --- Logic AI (không đổi) ---
        const getSafeMoves = () => {
          const moves = { UP: true, DOWN: true, LEFT: true, RIGHT: true };
          const nextUp = { ...head, y: head.y - 1 };
          const nextDown = { ...head, y: head.y + 1 };
          const nextLeft = { ...head, x: head.x - 1 };
          const nextRight = { ...head, x: head.x + 1 };
          if (nextUp.y < 0) moves.UP = false;
          if (nextDown.y >= BOARD_SIZE) moves.DOWN = false;
          if (nextLeft.x < 0) moves.LEFT = false;
          if (nextRight.x >= BOARD_SIZE) moves.RIGHT = false;
          for (const obs of currentHardObstacles) {
            if (moves.UP && obs.x === nextUp.x && obs.y === nextUp.y) moves.UP = false;
            if (moves.DOWN && obs.x === nextDown.x && obs.y === nextDown.y) moves.DOWN = false;
            if (moves.LEFT && obs.x === nextLeft.x && obs.y === nextLeft.y) moves.LEFT = false;
            if (moves.RIGHT && obs.x === nextRight.x && obs.y === nextRight.y) moves.RIGHT = false;
          }
          return moves;
        };
        const safeMoves = getSafeMoves();
        const deltaX = ai.food?.x - head.x || 0;
        const deltaY = ai.food?.y - head.y || 0;
        let nextDir = ai.direction;
        if (Math.abs(deltaY) > Math.abs(deltaX)) {
          if (deltaY < 0 && ai.direction !== "DOWN" && safeMoves.UP) nextDir = "UP";
          else if (deltaY > 0 && ai.direction !== "UP" && safeMoves.DOWN) nextDir = "DOWN";
        } else {
          if (deltaX < 0 && ai.direction !== "RIGHT" && safeMoves.LEFT) nextDir = "LEFT";
          else if (deltaX > 0 && ai.direction !== "LEFT" && safeMoves.RIGHT) nextDir = "RIGHT";
        }
        const getNextPos = (dir) => {
          if (dir === "UP") return { ...head, y: head.y - 1 };
          if (dir === "DOWN") return { ...head, y: head.y + 1 };
          if (dir === "LEFT") return { ...head, x: head.x - 1 };
          if (dir === "RIGHT") return { ...head, x: head.x + 1 };
          return head;
        };
        const nextPos = getNextPos(nextDir);
        const isSoftCollision = currentSoftObstacles.some((seg) => seg.x === nextPos.x && seg.y === nextPos.y);
        if (!safeMoves[nextDir] || isSoftCollision) {
          const allSafeMoves = Object.keys(safeMoves).filter((dir) => safeMoves[dir]);
          const bestSafeMove = allSafeMoves.find((dir) => {
            const pos = getNextPos(dir);
            return !currentSoftObstacles.some((seg) => seg.x === pos.x && seg.y === pos.y);
          });
          if (bestSafeMove) {
            nextDir = bestSafeMove;
          } else if (allSafeMoves.length > 0) {
            nextDir = allSafeMoves[0];
          }
        }
        switch (nextDir) {
          case "UP": head.y -= 1; break;
          case "DOWN": head.y += 1; break;
          case "LEFT": head.x -= 1; break;
          case "RIGHT": head.x += 1; break;
          default: break;
        }
        // --- Kết thúc Logic AI ---

        // Dùng currentSnake (từ ref) để kiểm tra va chạm
        const isAiWallCollision = head.x < 0 || head.y < 0 || head.x >= BOARD_SIZE || head.y >= BOARD_SIZE;
        const isAiSelfCollision = newAiSnake.some((seg) => seg.x === head.x && seg.y === head.y);
        const isPlayerCollision = currentSnake.some((seg) => seg.x === head.x && seg.y === head.y);

        if (isAiWallCollision || isAiSelfCollision || isPlayerCollision) {
          playSfxSafe("gameover");
          return { ...ai, snake: [] }; // Trả về AI đã chết
        }

        let newFood = ai.food;
        if (ai.food && head.x === ai.food.x && ai.food.y !== -1 && head.y === ai.food.y) {
          newAiSnake.unshift(head);
          playSfxSafe("eat");
          // Dùng currentSnake (từ ref) và prevAiSnakes
          const allSnakes = [currentSnake, ...prevAiSnakes.map((a) => a.snake)];
          newFood = generateSafePosition([], obstacles, [food, powerUp, ...allSnakes]);
        } else {
          newAiSnake.pop();
          newAiSnake.unshift(head);
        }

        return { ...ai, snake: newAiSnake, food: newFood || { x: -1, y: -1 }, direction: nextDir };
      });

      return nextAiSnakes;
    });
  }, [obstacles, food, powerUp, playSfxSafe]);

  // --- Game Loop ---
// App.js (Dán 3 khối này vào thay cho useEffect cũ)

  // --- Game Loop (PLAYER) ---
  useEffect(() => {
    if (gameState !== "PLAYING" || showLeaderboard) {
      return;
    }

    const playerInterval = setInterval(() => movePlayer(), currentGameSpeed);

    return () => {
      clearInterval(playerInterval);
    };
    // Phụ thuộc vào movePlayer để luôn có logic mới nhất
  }, [gameState, showLeaderboard, currentGameSpeed, movePlayer]);

  // --- Game Loop (AI) ---
  useEffect(() => {
    if (gameState !== "PLAYING" || showLeaderboard || gameMode !== "VERSUS_AI") {
      return;
    }

    const aiInterval = setInterval(() => moveAIs(), AI_STARTING_SPEED);

    return () => {
      clearInterval(aiInterval);
    };
    // Phụ thuộc vào moveAIs để luôn có logic mới nhất
  }, [gameState, showLeaderboard, gameMode, moveAIs]);
  // App.js (DÁN VÀO SAU DÒNG 703)

  // --- Kiểm tra điều kiện thắng (VERSUS_AI) ---
  useEffect(() => {
    // Chỉ chạy ở chế độ AI và đang chơi
    if (gameMode !== "VERSUS_AI" || gameState !== "PLAYING") return;
    
    // Nếu mảng aiSnakes có (nhiều hơn 0) con, và TẤT CẢ chúng đều có snake.length === 0
    if (aiSnakes.length > 0 && aiSnakes.every((ai) => ai.snake.length === 0)) {
      if (currentUser) {
        addCoins(250 * level);
        updateMissionProgress(['weekly_win_ai_1'], 1);
      }
      saveHighScore(score, level, "VERSUS_AI", timer);
      setGameState("LEVEL_CLEARED");
    }
  }, [
    // Phụ thuộc vào aiSnakes để kiểm tra
    aiSnakes, 
    gameMode, 
    gameState, 
    addCoins, 
    currentUser, 
    level, 
    saveHighScore, 
    score, 
    timer, 
    updateMissionProgress
  ]);

  // --- Game Loop (TIMER) ---
  useEffect(() => {
    if (gameState !== "PLAYING" || showLeaderboard || gameMode !== "VERSUS_AI") {
      clearInterval(timerIntervalRef.current);
      return;
    }

    timerIntervalRef.current = setInterval(() => {
      setTimer((t) => t + 1);
    }, 1000);

    return () => {
      clearInterval(timerIntervalRef.current);
    };
    // Chỉ phụ thuộc vào trạng thái game, không phụ thuộc vào logic di chuyển
  }, [gameState, showLeaderboard, gameMode]);

  // --- Keyboard controls --- // Dòng 705
  const togglePauseGame = useCallback((playSfx = true) => {
    if (playSfx) playClickSound();

    if (gameState === "PLAYING") {
      setGameState("PAUSED");
      clearInterval(timerIntervalRef.current);
    } else if (gameState === "PAUSED") {
      setGameState("PLAYING");
      if (gameMode === "VERSUS_AI") {
        timerIntervalRef.current = setInterval(() => {
          setTimer((t) => t + 1);
        }, 1000);
      }
    }
  }, [gameState, playClickSound, gameMode]);

  useEffect(() => {
    const userControls = settings.controls || "ARROWS";
    const keyMap = {
      UP: userControls === "ARROWS" ? "ArrowUp" : "w",
      DOWN: userControls === "ARROWS" ? "ArrowDown" : "s",
      LEFT: userControls === "ARROWS" ? "ArrowLeft" : "a",
      RIGHT: userControls === "ARROWS" ? "ArrowRight" : "d",
    };

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        if (gameState === "PLAYING" || gameState === "PAUSED") {
          togglePauseGame(false);
          return;
        }
      }
      if ((gameState !== "PLAYING" && gameState !== "LEVEL_READY") || showLeaderboard) {
        return;
      }

      const keyLower = e.key.toLowerCase();

      if (gameState === "LEVEL_READY") {
        if (Object.values(keyMap).map((k) => k.toLowerCase()).includes(keyLower)) {
          setGameState("PLAYING");
        }
      }

      switch (keyLower) {
        case keyMap.UP.toLowerCase():
          setDirection((prev) => (prev !== "DOWN" ? "UP" : prev));
          break;
        case keyMap.DOWN.toLowerCase():
          setDirection((prev) => (prev !== "UP" ? "DOWN" : prev));
          break;
        case keyMap.LEFT.toLowerCase():
          setDirection((prev) => (prev !== "RIGHT" ? "LEFT" : prev));
          break;
        case keyMap.RIGHT.toLowerCase():
          setDirection((prev) => (prev !== "LEFT" ? "RIGHT" : prev));
          break;
        default:
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [gameState, showLeaderboard, settings.controls, togglePauseGame]);

  const onResumeGame = useCallback(() => {
    playClickSound();
    setGameState("PLAYING");
    if (gameMode === "VERSUS_AI") {
      timerIntervalRef.current = setInterval(() => {
        setTimer((t) => t + 1);
      }, 1000);
    }
  }, [playClickSound, gameMode]);

  // --- Spawn AIs (helper) ---
  const spawnAIs = useCallback((count) => {
    const newAIs = [];
    const currentSnake = snake;
    const currentFood = food;

    const allSnakes = [currentSnake];
    const allFoods = [currentFood];

    for (let i = 0; i < count; i++) {
      const aiSnake = AI_START_POSITIONS[i % AI_START_POSITIONS.length];
      const aiDir = AI_START_DIRECTIONS[i % AI_START_DIRECTIONS.length];
      const aiFood = generateSafePosition([], obstacles, [...allSnakes, ...allFoods]);

      newAIs.push({
        snake: aiSnake,
        food: aiFood || { x: -1, y: -1 },
        direction: aiDir,
        speed: AI_STARTING_SPEED - (i * 10),
      });

      allSnakes.push(aiSnake);
      allFoods.push(aiFood);
    }
    setAiSnakes(newAIs);
  }, [snake, food, obstacles]);

  // --- Next level handler ---
  const handleNextLevel = useCallback(() => {
    playClickSound();

    const nextLevel = level + 1;
    const newSnake = SNAKE_START;
    setSnake(newSnake);
    setDirection("RIGHT");
    clearAllEffects();
    setLevel(nextLevel);
    setLevelScore(0);
    setBaseSpeed((prev) => Math.max(MIN_SPEED, prev - LEVEL_SPEED_INCREASE));
    setTimer(0);
    let newObstacles = [];

    if (gameMode === "OBSTACLES") {
      const nextLevelIndex = level;
      newObstacles = OBSTACLE_LEVELS[nextLevelIndex].obstacles;
      setFoodToPassLevel(OBSTACLE_LEVELS[nextLevelIndex].goal);
      setObstacles(newObstacles);
    } else if (gameMode === "VERSUS_AI") {
      spawnAIs(nextLevel);
    }

    const newFood = generateSafePosition(newSnake, newObstacles, aiSnakes.map((a) => a.snake));
    setFood(newFood || { x: -1, y: -1 });
    setGameState("LEVEL_READY");
  }, [playClickSound, level, gameMode, aiSnakes, spawnAIs, clearAllEffects]);

  // --- Start game handler ---
  const handleStartGame = useCallback((mode, levelOverride = 1) => {
    setTimeout(() => playClickSound(), 20); 

    if (!isAudioInitialized) {
      audioManager.init().then(() => { setIsAudioInitialized(true); }).catch(() => {});
    }

    setGameMode(mode);
    
    const newSnake = SNAKE_START;
    let newObstacles = [];

    setSnake(newSnake);
    setDirection("RIGHT");
    setScore(0);
    const startLevel = (mode === "VERSUS_AI" || mode === "OBSTACLES") ? levelOverride : 1;
    setLevel(startLevel);

    setLevelScore(0);
    setBaseSpeed(STARTING_SPEED);
    setGameWon(false);
    clearAllEffects();
    setTimer(0);
    let tempPlayerFood;
    let tempAIs = [];

    // SỬA LỖI: Cập nhật nhiệm vụ chơi game khi bắt đầu game
    if (currentUser) {
      updateMissionProgress(['daily_play_games_1'], 1);
    }
    if (mode === "LEVELS") {
      setFoodToPassLevel(LEVEL_START_GOAL);
      setObstacles([]);
      setAiSnakes([]);
    } else if (mode === "OBSTACLES") {
      const firstLevel = OBSTACLE_LEVELS[startLevel - 1];
      newObstacles = firstLevel.obstacles;
      setFoodToPassLevel(firstLevel.goal);
      setObstacles(newObstacles);
      setAiSnakes([]);
    } else if (mode === "VERSUS_AI") {
      const allSnakes = [newSnake];
      const allFoods = [];

      for (let i = 0; i < startLevel; i++) {
        const aiSnake = AI_START_POSITIONS[i % AI_START_POSITIONS.length];
        const aiDir = AI_START_DIRECTIONS[i % AI_START_DIRECTIONS.length];
        const aiFood = generateSafePosition([], newObstacles, [...allSnakes, ...allFoods]);

        tempAIs.push({
          snake: aiSnake,
          food: aiFood || { x: -1, y: -1 },
          direction: aiDir,
          speed: AI_STARTING_SPEED - (i * 10),
        });
        allSnakes.push(aiSnake);
        allFoods.push(aiFood);
      }
      setAiSnakes(tempAIs);
      tempPlayerFood = generateSafePosition(newSnake, newObstacles, [...tempAIs.map(ai => ai.snake), ...allFoods]); // SỬA LỖI: Chỉ truyền vào mảng các con rắn
      setObstacles([]);
    } else {
      setFoodToPassLevel(LEVEL_START_GOAL);
      setObstacles([]);
      setAiSnakes([]);
    }

    const finalFood = mode === "VERSUS_AI" ? tempPlayerFood : generateSafePosition(newSnake, newObstacles, tempAIs.map((a) => a.food));
    setFood(finalFood || { x: -1, y: -1 });

    if (mode === "OBSTACLES" || mode === "VERSUS_AI") {
      setGameState("LEVEL_READY");
    } else {
      setGameState("PLAYING");
    }
    setShowLeaderboard(false);
  }, [playClickSound, isAudioInitialized, clearAllEffects, currentUser, updateMissionProgress]);

  const goToMenu = useCallback(() => {
    setGameState("MENU");
    setShowLeaderboard(false);
    setGameMode(null);
    clearAllEffects();
    setAiSnakes([]);
    setObstacles([]);

    setTimeout(() => playClickSound(), 20);
  }, [playClickSound, clearAllEffects]);

  const toggleLeaderboard = useCallback(() => {
    playClickSound();
    setShowLeaderboard((prev) => !prev);
    if (gameState !== "MENU" && !showLeaderboard) {
      setGameState("MENU");
    }
  }, [playClickSound, gameState, showLeaderboard]);

  const onBackToMenu = useCallback(() => {
    playClickSound();
    setGameState("MENU");
  }, [playClickSound]);

  // --- Render ---
  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!currentUser) {
    return <Auth />;
  }

  const shouldRenderGame =
    gameState === "PLAYING" ||
    gameState === "LEVEL_READY" ||
    gameState === "GAME_OVER" ||
    gameState === "LEVEL_CLEARED" ||
    gameState === "PAUSED";

  const currentSkin = settings.selectedSkin || "default";
  const currentFoodSkin = settings.selectedFood || "default";
  const allAiFoods = aiSnakes.map((ai) => ai.food).filter(Boolean);

  return (
    <div className="game-container" ref={boardRef}>
      <div className="user-info">
        <span>
          Xin chào, <strong>{currentUser.username || currentUser.displayName || (currentUser.email ? currentUser.email.split("@")[0] : "Khách")}</strong>
        </span>
        <button onClick={handleLogout} className="logout-btn">Đăng xuất 🚪</button>
      </div>

      <h1>🐍 Rắn săn mồi</h1>

      <button onClick={toggleLeaderboard} className="leaderboard-toggle-btn">
        {showLeaderboard ? "Ẩn Bảng Xếp Hạng" : "🏆 Xem Bảng Xếp Hạng"}
      </button>

      {showLeaderboard ? (
        <Leaderboard playClickSound={playClickSound} />
      ) : gameState === "MISSIONS" ? (
        <Missions onBackToMenu={onBackToMenu} playClickSound={playClickSound} />
      ) : gameState === "CUSTOMIZING" ? (
        <SnakeCustomizer onBackToMenu={onBackToMenu} playClickSound={playClickSound} />
      ) : gameState === "TUTORIAL" ? (
        <Tutorial onBackToMenu={onBackToMenu} />
      ) : gameState === "SETTINGS" ? (
        <SettingsMenu onBackToMenu={onBackToMenu} />
      ) : gameState === "VERSUS_MENU" ? (
        <div className="main-menu">
          <h2>Chọn Màn Đối Kháng</h2>
          <div className="game-mode-select">
            <button className="start-btn versus-level-btn" onClick={() => handleStartGame("VERSUS_AI", 1)}>Màn 1 (1 AI)</button>
            <button className="start-btn versus-level-btn" onClick={() => handleStartGame("VERSUS_AI", 2)}>Màn 2 (2 AI)</button>
            <button className="start-btn versus-level-btn" onClick={() => handleStartGame("VERSUS_AI", 3)}>Màn 3 (3 AI)</button>
            <button className="start-btn back-to-main-menu-btn" onClick={goToMenu}>Quay lại</button>
          </div>
        </div>
      ) : gameState === "MENU" ? (
        <div className="main-menu">
          {currentUser && (
            <div className="main-coin-balance">
              Tiền của bạn: {currentUser.coins || 0} 💰
            </div>
          )}
          
          <h2>Chọn chế độ chơi</h2>
          <div className="game-mode-select">
            <div className="menu-row">
              <button className="start-btn" onClick={() => handleStartGame("CLASSIC")}>🕹️Chơi Mặc Định</button>
              <button className="start-btn levels-btn" onClick={() => handleStartGame("LEVELS")}>🗺️Chơi Qua Màn</button>
            </div>
            <div className="menu-row">
              <button className="start-btn obstacles-btn" onClick={() => handleStartGame("OBSTACLES")}>🧱 Chướng Ngại Vật </button>
              <button className="start-btn versus-btn" onClick={() => { playClickSound(); setGameState("VERSUS_MENU"); }}>⚔️ Đối kháng AI </button>
            </div>
            <div className="menu-row">
              <button className="start-btn small-btn customize-btn" onClick={() => { playClickSound(); setGameState("CUSTOMIZING"); }}>🎨 Cửa hàng</button>
              <button className="start-btn small-btn settings-btn" onClick={() => { playClickSound(); setGameState("SETTINGS"); }}>⚙️ Cài đặt</button>
            </div>
            <div className="menu-row">
              <button className="start-btn small-btn missions-btn" onClick={() => { playClickSound(); setGameState("MISSIONS"); }}>📅 Nhiệm vụ</button>
              <button className="start-btn small-btn tutorial-btn" onClick={() => { playClickSound(); setGameState("TUTORIAL"); }}>🎮 Hướng dẫn</button>
            </div>
          </div>
        </div>
      ) : (
        <div className="game-area">
          {shouldRenderGame && (
            <>
              {(gameState === "PLAYING" || gameState === "LEVEL_READY" || gameState === "PAUSED") && (
                <button className="pause-btn" onClick={() => togglePauseGame(true)} title="Tạm dừng (Esc)">
                  {gameState === "PAUSED" ? "▶️" : "⏸️"}
                </button>
              )}

              <ScoreBoard
                score={score}
                highScore={
                  gameMode === "CLASSIC" ? classicHighScore :
                    gameMode === "LEVELS" ? levelsHighLevel :
                      gameMode === "VERSUS_AI" ? versusHighLevel :
                        obstaclesHighLevel
                }
                gameMode={gameMode}
                level={level}
                levelScore={levelScore}
                foodToPassLevel={
                  gameMode === "OBSTACLES" && level <= OBSTACLE_LEVELS.length
                    ? OBSTACLE_LEVELS[level - 1].goal
                    : (gameMode === "VERSUS_AI" ? `${aiSnakes.filter(a => a.snake.length > 0).length}` : foodToPassLevel)
                }
                timer={timer}
              />

              <Board
                boardSize={BOARD_SIZE}
                gridSize={GRID_SIZE}
                snake={snake}
                food={food}
                obstacles={obstacles}
                powerUp={powerUp}
                isInvincible={activeEffects.invincible}
                currentSkin={currentSkin}
                currentFoodSkin={currentFoodSkin} // Truyền skin mồi vào Board
                aiSnakes={aiSnakes}
                aiFoods={allAiFoods}
              />
            </>
          )}

          {gameState === "LEVEL_READY" && (
            <div className="ready-overlay">
              <h3>Sẵn sàng {gameMode === "VERSUS_AI" ? `Vòng ${level}` : `Màn ${level}`}</h3>
              <p>Dùng phím {settings.controls === "ARROWS" ? "Mũi tên" : "WASD"} để bắt đầu!</p>
            </div>
          )}

          {(gameState === "GAME_OVER" || gameState === "LEVEL_CLEARED") && (
            <GameOverOverlay
              score={score}
              onRestart={() => handleStartGame(gameMode, level)}
              onGoToMenu={goToMenu}
              gameWon={gameWon}
              gameState={gameState}
              onNextLevel={handleNextLevel}
              level={level}
              playClickSound={playClickSound}
              gameMode={gameMode}
              timer={timer}
            />
          )}

          {gameState === "PAUSED" && (
            <PauseMenu
              onResume={onResumeGame}
              onRestart={() => handleStartGame(gameMode, level)}
              onGoToMenu={goToMenu}
              playClickSound={playClickSound}
            />
          )}
        </div>
      )}
    </div>
  );
}

export default App;