import React, { useState, useEffect, useRef } from "react";
import {
  auth,
  db,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  collection,
  query,
  where,
  getDocs,
  setDoc,
  doc,
  limit,
} from "../../firebase";
import "./Auth.css";

// --- Component Con Rắn Nền (Đã cập nhật logic ranh giới) ---
const BackgroundSnake = () => {
  const [segments, setSegments] = useState([{ x: 50, y: 50 }]); // Vị trí bắt đầu
  const directionRef = useRef({ dx: 10, dy: 0 });
  const lastTimeRef = useRef(0);
  const snakeLength = 20; // Giảm độ dài để hợp với form nhỏ
  const moveInterval = 100;

  const containerRef = useRef(null); // Ref cho .background-snake-container
  const [bounds, setBounds] = useState({ width: 0, height: 0 }); // Ranh giới của form

  // Effect này theo dõi kích thước của form cha
  useEffect(() => {
    const parent = containerRef.current?.parentElement;
    if (!parent) return;

    // Theo dõi sự thay đổi kích thước của form
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        setBounds({ width, height });
      }
    });

    resizeObserver.observe(parent);

    // Lấy kích thước ban đầu
    const { clientWidth, clientHeight } = parent;
    setBounds({ width: clientWidth, height: clientHeight });

    // Dọn dẹp
    return () => resizeObserver.disconnect();
  }, []);

  // Effect này chạy animation con rắn
  useEffect(() => {
    // Chưa có ranh giới thì chưa chạy
    if (bounds.width === 0 || bounds.height === 0) return;

    const update = (time) => {
      if (time - lastTimeRef.current > moveInterval) {
        lastTimeRef.current = time;

        setSegments((prevSegments) => {
          const oldHead = prevSegments[0];
          let { dx, dy } = directionRef.current;

          // 1. Logic đổi hướng ngẫu nhiên
          if (Math.random() < 0.1) {
            const directions = [
              { dx: 10, dy: 0 },
              { dx: -10, dy: 0 },
              { dx: 0, dy: 10 },
              { dx: 0, dy: -10 },
            ];
            const possibleDirections = directions.filter(
              (dir) => dir.dx !== -dx || dir.dy !== -dy
            );
            directionRef.current =
              possibleDirections[
                Math.floor(Math.random() * possibleDirections.length)
              ];
          }

          let newHead = {
            x: oldHead.x + directionRef.current.dx,
            y: oldHead.y + directionRef.current.dy,
          };

          // 2. Logic va chạm tường (SỬ DỤNG 'bounds' CỦA FORM)
          // Trừ 10 (kích thước rắn) để nó quay đầu trước khi ra khỏi
          if (newHead.x >= bounds.width - 10) {
            directionRef.current = { dx: 0, dy: 10 }; // Rẽ xuống
          } else if (newHead.x <= 0) {
            directionRef.current = { dx: 0, dy: -10 }; // Rẽ lên
          } else if (newHead.y >= bounds.height - 10) {
            directionRef.current = { dx: -10, dy: 0 }; // Rẽ trái
          } else if (newHead.y <= 0) {
            directionRef.current = { dx: 10, dy: 0 }; // Rẽ phải
          }

          newHead = {
            x: oldHead.x + directionRef.current.dx,
            y: oldHead.y + directionRef.current.dy,
          };

          const newSegments = [newHead, ...prevSegments];
          if (newSegments.length > snakeLength) {
            newSegments.pop();
          }
          return newSegments;
        });
      }
      requestAnimationFrame(update);
    };

    const animationFrameId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animationFrameId);
  }, [bounds, moveInterval, snakeLength]); // Chạy lại animation nếu ranh giới thay đổi

  return (
    <div className="background-snake-container" ref={containerRef}>
      {segments.map((seg, index) => (
        <div
          key={index}
          className={`snake-segment ${index === 0 ? "snake-head" : ""}`}
          style={{
            left: `${seg.x}px`,
            top: `${seg.y}px`,
            opacity: 1 - index / snakeLength,
          }}
        />
      ))}
    </div>
  );
};

// --- Component Auth Chính ---
const Auth = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // ... (Giữ nguyên logic checkUsernameExists và handleAuth) ...
  const checkUsernameExists = async (username) => {
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("username", "==", username), limit(1));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isRegistering) {
        if (password !== confirmPassword) {
          throw new Error("Mật khẩu không khớp!");
        }
        const usernameExists = await checkUsernameExists(username);
        if (usernameExists) {
          throw new Error("Tên đăng nhập này đã được sử dụng!");
        }
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        const user = userCredential.user;
        await updateProfile(user, { displayName: username });
        await setDoc(doc(db, "users", user.uid), {
          username: username,
          email: email,
        });
      } else {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("username", "==", username), limit(1));
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) {
          throw new Error("Tên đăng nhập không tồn tại!");
        }
        const userData = querySnapshot.docs[0].data();
        const userEmail = userData.email;
        await signInWithEmailAndPassword(auth, userEmail, password);
      }
    } catch (err) {
      console.error("LỖI AUTH:", err);
      if (err.code === "auth/wrong-password") {
        setError("Sai mật khẩu!");
      } else if (err.code === "auth/email-already-in-use") {
        setError("Email này đã được sử dụng!");
      } else if (
        err.code === "permission-denied" ||
        err.code === "failed-precondition"
      ) {
        setError(
          "Lỗi: Cần tạo Chỉ mục (Index) trên Firebase. Hãy kiểm tra F12 Console."
        );
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    // auth-page-wrapper vẫn có thể tồn tại để căn giữa form
    <div className="auth-page-wrapper">
      <div className="auth-container">
        {/* CON RẮN ĐƯỢC CHUYỂN VÀO ĐÂY */}
        <BackgroundSnake />

        {/* Nội dung form (sẽ nằm đè lên trên) */}
        <h2>
          {isRegistering ? "Đăng ký" : "Đăng nhập"} 🐍
        </h2>
        <form onSubmit={handleAuth}>
          {!isRegistering && (
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Tên đăng nhập"
              required
            />
          )}

          {isRegistering && (
            <>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Tên đăng nhập (username)"
                required
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
              />
            </>
          )}

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mật khẩu"
            required
          />
          {isRegistering && (
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Xác nhận mật khẩu"
              required
            />
          )}

          <button type="submit" disabled={loading}>
            {loading ? "Đang xử lý..." : isRegistering ? "Đăng ký" : "Đăng nhập"}
          </button>
          {error && <p className="error">{error}</p>}
        </form>
        <button
          className="toggle-btn"
          onClick={() => {
            setIsRegistering(!isRegistering);
            setError("");
          }}
        >
          {isRegistering
            ? "Đã có tài khoản? Đăng nhập"
            : "Chưa có tài khoản? Đăng ký"}
        </button>
      </div>
    </div>
  );
};

export default Auth;