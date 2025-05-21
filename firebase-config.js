// Cấu hình Firebase
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAKYvfeUHqWi4j0fg5irw_a0D5tquYfSHI",
  authDomain: "game-bcd42.firebaseapp.com",
  projectId: "game-bcd42",
  storageBucket: "game-bcd42.firebasestorage.app",
  messagingSenderId: "621474051056",
  appId: "1:621474051056:web:49cd8ef2c29725ee002335",
  measurementId: "G-YK01ZB2GG9"
};

// Khởi tạo Firebase
let db;
try {
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  } else {
    firebase.app(); // Sử dụng app đã được khởi tạo nếu có
  }
  
  db = firebase.database();
  console.log("Kết nối Firebase thành công");
  
  // Kiểm tra kết nối
  const connectedRef = firebase.database().ref(".info/connected");
  connectedRef.on("value", (snap) => {
    if (snap.val() === true) {
      console.log("Đã kết nối đến Firebase Realtime Database");
    } else {
      console.log("Đã mất kết nối đến Firebase Realtime Database");
    }
  });
} catch (error) {
  console.error("Lỗi khi khởi tạo Firebase:", error);
  alert("Không thể kết nối đến hệ thống. Vui lòng tải lại trang và thử lại.");
}
