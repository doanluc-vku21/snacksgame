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
const firebaseConfig = {
  apiKey: "AIzaSyD6SiMnzg0A7l38P1ybCknweE1DFB3UnTw",
  authDomain: "snake-game-react-297c6.firebaseapp.com",
  projectId: "snake-game-react-297c6",
  storageBucket: "snake-game-react-297c6.firebasestorage.app",
  messagingSenderId: "1063536207909",
  appId: "1:1063536207909:web:0d23180f5f56e613f737cc",
  measurementId: "G-MV2679LE3V"
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