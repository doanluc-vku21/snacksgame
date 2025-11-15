import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  where,
  getDocs,
  limit,
  query,
  orderBy,
  addDoc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import {
  getAuth,
  updateProfile,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";

// Cấu hình Firebase của bạn
// Cấu hình Firebase của bạn - ĐỌC TỪ BIẾN MÔI TRƯỜNG
const firebaseConfig = {
  apiKey: process.env.REACT_APP_API_KEY,
  authDomain: process.env.REACT_APP_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_PROJECT_ID,
  storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_APP_ID,
  measurementId: process.env.REACT_APP_MEASUREMENT_ID
};

// Khởi tạo Firebase
const app = initializeApp(firebaseConfig);

// Export các dịch vụ
export const db = getFirestore(app);
export const auth = getAuth(app);

// Export các hàm riêng lẻ để tiện dùng
export {
  collection,
  doc,
  setDoc,
  where,
  getDocs,
  limit,
  query,
  orderBy,
  addDoc,
  getDoc,
  updateDoc,
  updateProfile,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
};