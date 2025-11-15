import * as Tone from 'tone';

// --- BGM MP3 ---
export const BGM_TRACKS = [
  { id: 'none', name: 'Tắt nhạc' },
  { id: 'track1', name: 'Nhạc 1', url: '/audio/bensound-doctoryes.mp3' },
  { id: 'track2', name: 'Nhạc 2', url: '/audio/bensound-fiddlesticks.mp3' },
  { id: 'track3', name: 'Nhạc 3', url: '/audio/bensound-goodmood.mp3' },
];

// --- SFX PACKS ---
export const SFX_PACKS = [
    { id: 'none', name: 'Tắt hiệu ứng' },
    { id: 'pack1', name: 'Gói 1 (Cổ điển)' },
    { id: 'pack2', name: 'Gói 2 (Hiện đại)' },
];

// --- SỬA LỖI: Di chuyển Synths vào trong 'init' ---

// 1. Khai báo các biến synth ở cấp cao nhất (nhưng chưa tạo)
let sfxSynth1 = null;
let sfxGameOver1 = null;
let sfxSynth2 = null;
let sfxEat2 = null;
let sfxGameOver2 = null;
let sfxAlertSynth = null;

let sfxImplementations = {}; // Sẽ được định nghĩa sau khi init
let currentSfxPack = 'pack1';
let bgmPlayer = null;
let isAudioInitialized = false; // Cờ nội bộ

const audioManager = {
  init: async () => {
    // Chỉ chạy một lần
    if (isAudioInitialized) return;
    
    // 1. Mở khóa AudioContext (quan trọng nhất)
    if (Tone.context.state !== "running") {
      await Tone.start();
    }
    console.log("AudioContext đã chạy, đang tạo synths...");

    // 2. BÂY GIỜ MỚI TẠO TẤT CẢ SYNTHS
    // (Vì AudioContext đã được mở khóa, chúng sẽ hoạt động)
    sfxSynth1 = new Tone.Synth().toDestination();
    sfxSynth1.volume.value = -10;
    
    sfxGameOver1 = new Tone.MembraneSynth({
      pitchDecay: 0.05,
      octaves: 10,
      oscillator: { type: 'sine' },
      envelope: { attack: 0.001, decay: 0.4, sustain: 0.01, release: 1.4 },
    }).toDestination();
    sfxGameOver1.volume.value = -5;

    sfxSynth2 = new Tone.MetalSynth({ 
      frequency: 200,
      envelope: { attack: 0.001, decay: 0.1, release: 0.01 },
      harmonicity: 5.1,
      modulationIndex: 32,
    }).toDestination();
    sfxSynth2.volume.value = -15;

    sfxEat2 = new Tone.NoiseSynth({ 
      noise: { type: 'brown' },
      envelope: { attack: 0.005, decay: 0.05, sustain: 0 },
    }).toDestination();
    sfxEat2.volume.value = -10;

    sfxGameOver2 = new Tone.FMSynth({ 
      harmonicity: 3.01,
      modulationIndex: 14,
      envelope: { attack: 0.01, decay: 0.5, release: 1 },
      modulationEnvelope: { attack: 0.01, decay: 0.3, release: 1 }
    }).toDestination();
    sfxGameOver2.volume.value = -5;

    sfxAlertSynth = new Tone.Synth({
      oscillator: { type: 'square' },
      envelope: { attack: 0.01, decay: 0.05, sustain: 0, release: 0.1 }
    }).toDestination();
    sfxAlertSynth.volume.value = -10;

    // 3. ĐỊNH NGHĨA CÁC GÓI ÂM THANH (DỰA TRÊN SYNTHS VỪA TẠO)
    // (Bao gồm bản vá lỗi click của bạn từ trước)
    sfxImplementations = {
      pack1: {
        eat: () => sfxSynth1.triggerAttackRelease("C5", "16n"),
        powerup: () => { sfxSynth1.triggerAttackRelease("G5", "16n", "+0.05"); sfxSynth1.triggerAttackRelease("E5", "16n", "+0.1"); },
        levelup: () => { sfxSynth1.triggerAttackRelease("C4", "16n", "+0.05"); sfxSynth1.triggerAttackRelease("G4", "16n", "+0.15"); },
        gameover: () => sfxGameOver1.triggerAttackRelease("C2", "8n"),
        click: () => sfxSynth1.triggerAttackRelease("C6", "32n"),
        new_highscore: () => {
          sfxSynth1.triggerAttackRelease("C5", "16n");
          sfxSynth1.triggerAttackRelease("E5", "16n", "+0.1");
          sfxSynth1.triggerAttackRelease("G5", "16n", "+0.2");
          sfxSynth1.triggerAttackRelease("C6", "16n", "+0.3");
        },
      },
      pack2: {
        eat: () => sfxEat2.triggerAttackRelease("8n"),
        powerup: () => { sfxSynth2.triggerAttackRelease("C5", "32n"); sfxSynth2.triggerAttackRelease("G5", "32n", "+0.1"); },
        levelup: () => { sfxSynth2.triggerAttackRelease("C4", "16n", "+0.05"); sfxSynth2.triggerAttackRelease("G4", "16n", "+0.15"); },
        gameover: () => sfxGameOver2.triggerAttackRelease("C2", "4n"),
        click: () => sfxSynth2.triggerAttackRelease("C6", "32n"),
        new_highscore: () => {
          sfxSynth2.triggerAttackRelease("C5", "16n");
          sfxSynth2.triggerAttackRelease("E5", "16n", "+0.1");
          sfxSynth2.triggerAttackRelease("G5", "16n", "+0.2");
          sfxSynth2.triggerAttackRelease("C6", "16n", "+0.3");
        },
      }
    };
    
    // 4. Đặt cờ là đã sẵn sàng
    isAudioInitialized = true;
    console.log("Audio đã sẵn sàng!");
  },
  
  // BGM MP3
  playBGM: (trackId, loop = true, volume = -12) => {
    // Thêm Guard Clause: Không chạy nếu chưa init
    if (!isAudioInitialized) {
      console.warn("Chưa thể phát BGM, audio chưa được khởi tạo.");
      return;
    }

    const track = BGM_TRACKS.find(t => t.id === trackId && t.id !== 'none');
    
    // Logic dừng nhạc cũ
    if (bgmPlayer) {
      bgmPlayer.stop();
      bgmPlayer.dispose();
      bgmPlayer = null;
    }

    // Nếu track là 'none', chỉ dừng nhạc và thoát
    if (!track) {
      console.log("Đã dừng BGM.");
      return;
    }
  
    bgmPlayer = new Tone.Player(track.url, () => {
      console.log("BGM loaded:", track.name);
      bgmPlayer.loop = loop;
      bgmPlayer.volume.value = volume;
      bgmPlayer.start();
    }).toDestination();
    bgmPlayer.onerror = (e) => console.error("Error loading BGM:", e);
  },

  stopBGM: () => {
    if (bgmPlayer) {
      bgmPlayer.stop();
      bgmPlayer.dispose();
      bgmPlayer = null;
    }
  },

  setSfxPack: (packId = 'pack1') => {
    if (!packId) packId = 'none';
    currentSfxPack = packId;
    console.log("Đã đổi SFX pack thành:", packId); // Thêm log
  },

  playSFX: (type) => {
    // Thêm Guard Clause: Không chạy nếu chưa init
    if (!isAudioInitialized) {
       console.warn(`Chưa thể phát SFX (${type}), audio chưa được khởi tạo.`);
       return;
    }

    if (type === 'countdown') {
      // sfxAlertSynth có thể chưa được tạo nếu init() chưa chạy xong
      sfxAlertSynth?.triggerAttackRelease("A5", "16n");
      return;
    }

    // Kiểm tra xem sfxImplementations đã được tạo chưa
    const implementation = sfxImplementations[currentSfxPack];
    if (!implementation || currentSfxPack === 'none') return;
    
    implementation[type]?.();
  },

};

export default audioManager;