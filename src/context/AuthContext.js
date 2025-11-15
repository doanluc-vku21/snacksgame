import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
// Sửa lỗi: Đã import updateDoc
import { auth, db, doc, getDoc, setDoc, onAuthStateChanged, updateDoc } from "../firebase"; 
import { MISSIONS_DATA, MISSION_TYPES } from "../missionsData";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

// (Các hàm helper và dữ liệu mặc định không đổi)
const getTodayISO = () => {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  const localDate = new Date(now.getTime() - (offset * 60 * 1000));
  return localDate.toISOString().split('T')[0];
};
const getStartOfWeekISO = () => {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  const localDate = new Date(now.getTime() - (offset * 60 * 1000));
  const day = localDate.getDay();
  const diff = localDate.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(localDate.setDate(diff));
  return monday.toISOString().split('T')[0];
};
const defaultSettings = {
  music: true,
  sfxPack: 'pack1',
  controls: 'ARROWS',
  musicTrack: 'classic',
  selectedSkin: 'default',
  selectedFood: 'default',
  ownedItems: { skins: [], foods: [] }
};
const defaultMissionData = {
  missionProgress: {},
  completedMissions: {},
  lastLoginDate: "2000-01-01",
  lastWeeklyReset: "2000-01-01",
};

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // useEffect (Logic reset nhiệm vụ) - Không đổi
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(userDocRef);
        const today = getTodayISO();
        const startOfWeek = getStartOfWeekISO();

        if (docSnap.exists()) {
          const firestoreData = docSnap.data();
          const settings = {
            ...defaultSettings,
            ...(firestoreData.settings || {}),
            ownedItems: {
              ...defaultSettings.ownedItems,
              ...(firestoreData.settings?.ownedItems || {}),
            }
          };

          let missionData = {
            ...defaultMissionData,
            missionProgress: firestoreData.missionProgress || {},
            completedMissions: firestoreData.completedMissions || {},
            lastLoginDate: firestoreData.lastLoginDate || "2000-01-01",
            lastWeeklyReset: firestoreData.lastWeeklyReset || "2000-01-01",
          };

          let needsUpdate = false; 

          if (missionData.lastLoginDate !== today) {
            needsUpdate = true;
            missionData.lastLoginDate = today;
            MISSIONS_DATA.forEach(mission => {
              if (mission.type === MISSION_TYPES.DAILY) {
                delete missionData.missionProgress[mission.id];
                delete missionData.completedMissions[mission.id];
              }
            });
          }

          if (missionData.lastWeeklyReset !== startOfWeek) {
            needsUpdate = true;
            missionData.lastWeeklyReset = startOfWeek;
            MISSIONS_DATA.forEach(mission => {
              if (mission.type === MISSION_TYPES.WEEKLY) {
                delete missionData.missionProgress[mission.id];
                delete missionData.completedMissions[mission.id];
              }
            });
          }
          
          if (needsUpdate) {
            await setDoc(userDocRef, {
              missionProgress: missionData.missionProgress,
              completedMissions: missionData.completedMissions,
              lastLoginDate: missionData.lastLoginDate,
              lastWeeklyReset: missionData.lastWeeklyReset,
            }, { merge: true });
          }
          
          setCurrentUser({
            ...user, 
            username: firestoreData.username, 
            settings,
            coins: firestoreData.coins || 0,
            ...missionData,
          });

        } else {
          // User mới
          setCurrentUser({ 
            ...user, 
            settings: defaultSettings,
            username: user.displayName,
            coins: 0,
            ...defaultMissionData,
            lastLoginDate: today, 
            lastWeeklyReset: startOfWeek,
          });
          await setDoc(userDocRef, {
            lastLoginDate: today,
            lastWeeklyReset: startOfWeek,
          }, { merge: true });
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);
  
  
  // =================================================================
  // *** SỬA LỖI STALE STATE: Bọc các hàm bằng useCallback ***
  // =================================================================

const addCoins = useCallback(async (amount) => {
    // Bỏ kiểm tra currentUser ở đây
    if (amount === 0) return;

    // let newCoins = 0; // Không cần biến tạm này nữa

    setCurrentUser(prevUser => {
      // Lấy uid và tính toán bên trong callback an toàn
      const uid = prevUser?.uid;
      if (!uid) return prevUser; // Nếu không có uid, trả về state cũ

      const newCoins = (prevUser.coins || 0) + amount;
      
      // Cập nhật Firestore ngay bên trong này
      const userDocRef = doc(db, "users", uid);
      setDoc(userDocRef, { coins: newCoins }, { merge: true })
        .catch(error => console.error("Lỗi khi cộng tiền:", error));

      // Trả về state React mới
      return { ...prevUser, coins: newCoins };
    });

  }, []); // <-- QUAN TRỌNG: Mảng rỗng []

  const buyItem = useCallback(async (itemType, itemId, price) => {
    const uid = currentUser?.uid;
    if (!uid) return Promise.reject("Bạn cần đăng nhập để mua.");
    const currentCoins = currentUser.coins || 0; 
    if (currentCoins < price) {
      return Promise.reject("Bạn không đủ tiền!");
    }
    const userDocRef = doc(db, "users", uid);
    const newCoins = currentCoins - price;
    let newOwnedItems;
    setCurrentUser(prevUser => {
      newOwnedItems = { ...prevUser.settings.ownedItems };
      if (!newOwnedItems[itemType]) newOwnedItems[itemType] = [];
      newOwnedItems[itemType].push(itemId);
      return {
        ...prevUser,
        coins: newCoins,
        settings: { ...prevUser.settings, ownedItems: newOwnedItems }
      };
    });
    try {
      await setDoc(userDocRef, {
        coins: newCoins,
        settings: { ownedItems: newOwnedItems }
      }, { merge: true });
      return Promise.resolve("Mua thành công!");
    } catch (error) {
      console.error("Lỗi khi mua vật phẩm:", error);
      return Promise.reject("Đã xảy ra lỗi, vui lòng thử lại.");
    }
  }, [currentUser]);

  const updateUserSkin = useCallback(async (skinId) => {
    const uid = currentUser?.uid;
    if (!uid) return;
    const userDocRef = doc(db, "users", uid);
    try {
      await setDoc(userDocRef, { settings: { selectedSkin: skinId } }, { merge: true });
      setCurrentUser(prevUser => ({
        ...prevUser,
        settings: { ...prevUser.settings, selectedSkin: skinId }
      }));
    } catch (error) { console.error("Lỗi khi cập nhật skin:", error); }
  }, [currentUser]);

  const updateUserFood = useCallback(async (foodId) => {
    const uid = currentUser?.uid;
    if (!uid) return;
    const userDocRef = doc(db, "users", uid);
    try {
      await setDoc(userDocRef, { settings: { selectedFood: foodId } }, { merge: true });
      setCurrentUser(prevUser => ({
        ...prevUser,
        settings: { ...prevUser.settings, selectedFood: foodId }
      }));
    } catch (error) { console.error("Lỗi khi cập nhật food skin:", error); }
  }, [currentUser]);

  const updateUserSettings = useCallback(async (newSettings) => {
    const uid = currentUser?.uid;
    if (!uid) return;
    const userDocRef = doc(db, "users", uid);
    try {
      await setDoc(userDocRef, { settings: newSettings }, { merge: true });
      setCurrentUser(prevUser => ({
        ...prevUser,
        settings: newSettings 
      }));
    } catch (error) { console.error("Lỗi khi cập nhật cài đặt:", error); }
  }, [currentUser]);


// =================================================================
  // *** SỬA LỖI HOÀN CHỈNH: Hàm updateMissionProgress ***
  // =================================================================
  const updateMissionProgress = useCallback(async (missionIds, amountToAdd = 1) => {
    
    // BỎ DÒNG IF KIỂM TRA currentUser?.uid Ở ĐÂY
    if (!missionIds || missionIds.length === 0) return;
    
    // Cập nhật state cục bộ (React) và Firestore một cách an toàn
    setCurrentUser(prevUser => {
      
      // *** DI CHUYỂN DÒNG KIỂM TRA VÀO ĐÂY ***
      // Dùng prevUser để lấy uid an toàn
      const uid = prevUser?.uid;
      if (!uid) return prevUser; // Không làm gì nếu không có user

      // Tạo bản sao của tiến độ hiện tại
      const newProgressMap = { ...prevUser.missionProgress };
      const firestoreUpdatePayload = {}; 
      let hasChanged = false; 

      missionIds.forEach(missionId => {
        const mission = MISSIONS_DATA.find(m => m.id === missionId);
        if (!mission) return; 
        if (prevUser.completedMissions[missionId]) return; 

        const currentProgress = newProgressMap[missionId] || 0; 
        if (currentProgress >= mission.target) return; 

        const newProgressValue = Math.min(currentProgress + amountToAdd, mission.target);
        newProgressMap[missionId] = newProgressValue;
        firestoreUpdatePayload[`missionProgress.${missionId}`] = newProgressValue;
        hasChanged = true;
      });

      if (hasChanged) {
        // const uid = prevUser.uid; // Đã lấy ở trên
        const userDocRef = doc(db, "users", uid);
        
        updateDoc(userDocRef, firestoreUpdatePayload).catch(error => {
          console.error("Lỗi khi cập nhật tiến độ nhiệm vụ:", error);
          setDoc(userDocRef, { missionProgress: newProgressMap }, { merge: true }).catch(e2 => {
            console.error("Lỗi nghiêm trọng khi cập nhật tiến độ (fallback):", e2);
          });
        });
      }

      if (hasChanged) {
        return {
          ...prevUser,
          missionProgress: newProgressMap
        };
      }

      return prevUser;
    });

  }, []); // <-- Mảng rỗng [] là chính xác

  // --- HÀM MỚI: Nhận thưởng nhiệm vụ ---
  const claimMissionReward = useCallback(async (missionId) => {
    const uid = currentUser?.uid;
    if (!uid) return Promise.reject("Chưa đăng nhập.");

    const mission = MISSIONS_DATA.find(m => m.id === missionId);
    if (!mission) return Promise.reject("Không tìm thấy nhiệm vụ.");
    
    // Đọc state mới nhất TRƯỚC KHI hành động
    const progress = currentUser.missionProgress[missionId] || 0;
    const isClaimed = currentUser.completedMissions[missionId] || false;

    if (progress >= mission.target && !isClaimed) {
      // Chờ addCoins hoàn thành (nó đã tự xử lý state và firestore)
      await addCoins(mission.reward); 

      // Cập nhật trạng thái "đã nhận" (completedMissions)
      const newCompletedState = {
        ...currentUser.completedMissions,
        [missionId]: true
      };
      setCurrentUser(prevUser => ({
        ...prevUser,
        completedMissions: newCompletedState
      }));

      // SỬA LỖI 2: Dùng updateDoc cho "dot notation"
      // Hoặc fallback về setDoc nếu `completedMissions` chưa tồn tại
      const userDocRef = doc(db, "users", uid);
      const fieldPath = `completedMissions.${missionId}`;
      try {
        await updateDoc(userDocRef, { [fieldPath]: true });
      } catch (error) {
        console.warn("Lỗi updateDoc, thử setDoc merge:", error);
        // Dùng cách này nếu `completedMissions` có thể chưa tồn tại
        await setDoc(userDocRef, { completedMissions: { [missionId]: true } }, { merge: true });
      }
      
      return Promise.resolve(`Nhận thưởng ${mission.reward} coin thành công!`);

    } else if (isClaimed) {
      return Promise.reject("Bạn đã nhận thưởng nhiệm vụ này rồi.");
    } else {
      return Promise.reject("Bạn chưa hoàn thành nhiệm vụ này.");
    }
  }, [currentUser, addCoins]); 

  
  const value = useMemo(() => ({
    currentUser,
    updateUserSkin,
    updateUserFood,
    updateUserSettings,
    addCoins,
    buyItem,
    updateMissionProgress,
    claimMissionReward,
  }), [
    currentUser, 
    updateUserSkin, 
    updateUserFood, 
    updateUserSettings, 
    addCoins, 
    buyItem, 
    updateMissionProgress, 
    claimMissionReward
  ]); 

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}